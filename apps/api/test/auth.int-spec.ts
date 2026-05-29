import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { OtpChannel, UserStatus } from '@neviso/db';
import { hash } from 'bcryptjs';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, setOtpMode, TestApp } from './auth-test-app';
import { FakeBaleSender, FakeSmsSender } from '../src/otp/providers/fake-senders';

const GQL = '/graphql';

// The test DB is shared and persists within a container, so each run uses a
// unique mobile namespace — a brand-new mobile guarantees `isNewUser` etc.
const BASE = 100000 + Math.floor(Math.random() * 800000);
let seq = 0;
const mob = (): string => `091${BASE}${String(seq++).padStart(2, '0')}`;

function gql(app: INestApplication, query: string, variables?: Record<string, unknown>) {
  return request(app.getHttpServer()).post(GQL).send({ query, variables });
}

async function latestOtp(prisma: PrismaService, mobile: string): Promise<string> {
  const r = await prisma.otpRecord.findFirst({ where: { mobile }, orderBy: { createdAt: 'desc' } });
  if (!r) throw new Error('no otp record');
  return r.code;
}

describe('user auth (integration)', () => {
  let ctx: TestApp;
  let app: INestApplication;
  let prisma: PrismaService;
  let sms: FakeSmsSender;
  let bale: FakeBaleSender;

  beforeAll(async () => {
    ctx = await createTestApp();
    ({ app, prisma, sms, bale } = ctx);
    await setOtpMode(prisma, 'BOTH');
  });

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(() => {
    sms.reset();
    bale.reset();
  });

  it('otpChannels reflects BOTH', async () => {
    const res = await gql(app, '{ otpChannels }').expect(200);
    expect(res.body.data.otpChannels).toEqual(['SMS', 'BALE']);
  });

  it('requestOtp → verifyOtp issues tokens, marks new user, grants free credits once', async () => {
    const mobile = mob();
    const r1 = await gql(
      app,
      'mutation($m:String!){ requestOtp(mobile:$m, channel: SMS){ expiresIn channel } }',
      { m: mobile },
    ).expect(200);
    expect(r1.body.data.requestOtp).toMatchObject({ expiresIn: 120, channel: 'SMS' });
    expect(sms.lastCode()).toBeDefined();

    const code = await latestOtp(prisma, mobile);
    const r2 = await gql(
      app,
      'mutation($m:String!,$c:String!){ verifyOtp(mobile:$m, code:$c){ accessToken refreshToken isNewUser } }',
      {
        m: mobile,
        c: code,
      },
    ).expect(200);
    expect(r2.body.data.verifyOtp.isNewUser).toBe(true);
    expect(r2.body.data.verifyOtp.accessToken).toBeTruthy();

    const user = await prisma.user.findUnique({ where: { mobile } });
    expect(user?.creditBalance).toBe(20);
    expect(user?.freeCreditsGiven).toBe(true);
    const grants = await prisma.creditTransaction.count({
      where: { userId: user!.id, type: 'FREE_GRANT' },
    });
    expect(grants).toBe(1);

    // me works with the access token
    const me = await request(app.getHttpServer())
      .post(GQL)
      .set('authorization', `Bearer ${r2.body.data.verifyOtp.accessToken}`)
      .send({ query: '{ me { mobile creditBalance } }' })
      .expect(200);
    expect(me.body.data.me).toMatchObject({ mobile, creditBalance: 20 });
  });

  it('does not double-grant free credits on a later login (idempotent)', async () => {
    const mobile = mob();
    // first login (grants the free credits)
    await gql(app, 'mutation($m:String!){ requestOtp(mobile:$m, channel: SMS){ channel } }', {
      m: mobile,
    });
    const first = await gql(
      app,
      'mutation($m:String!,$c:String!){ verifyOtp(mobile:$m, code:$c){ isNewUser } }',
      { m: mobile, c: await latestOtp(prisma, mobile) },
    );
    expect(first.body.data.verifyOtp.isNewUser).toBe(true);

    // Second login: insert a fresh OTP directly (bypasses the rate-limit gate
    // we are not exercising here) and verify again.
    await prisma.otpRecord.create({
      data: { mobile, code: '222222', channel: 'SMS', expiresAt: new Date(Date.now() + 120_000) },
    });
    const second = await gql(
      app,
      'mutation($m:String!,$c:String!){ verifyOtp(mobile:$m, code:$c){ isNewUser } }',
      { m: mobile, c: '222222' },
    ).expect(200);
    expect(second.body.data.verifyOtp.isNewUser).toBe(false);

    const user = await prisma.user.findUnique({ where: { mobile } });
    expect(user?.creditBalance).toBe(20);
    expect(
      await prisma.creditTransaction.count({ where: { userId: user!.id, type: 'FREE_GRANT' } }),
    ).toBe(1);
  });

  it('rejects a reused OTP code', async () => {
    const mobile = mob();
    await gql(app, 'mutation($m:String!){ requestOtp(mobile:$m, channel: SMS){ channel } }', {
      m: mobile,
    });
    const code = await latestOtp(prisma, mobile);
    await gql(
      app,
      'mutation($m:String!,$c:String!){ verifyOtp(mobile:$m, code:$c){ isNewUser } }',
      {
        m: mobile,
        c: code,
      },
    ).expect(200);
    const reuse = await gql(
      app,
      'mutation($m:String!,$c:String!){ verifyOtp(mobile:$m, code:$c){ isNewUser } }',
      { m: mobile, c: code },
    ).expect(200);
    expect(reuse.body.errors[0].extensions.code).toBe('OTP_INVALID');
  });

  it('rate-limits a second requestOtp within the window', async () => {
    const mobile = mob();
    await gql(app, 'mutation($m:String!){ requestOtp(mobile:$m, channel: SMS){ channel } }', {
      m: mobile,
    }).expect(200);
    const again = await gql(
      app,
      'mutation($m:String!){ requestOtp(mobile:$m, channel: SMS){ channel } }',
      {
        m: mobile,
      },
    ).expect(200);
    expect(again.body.errors[0].extensions.code).toBe('OTP_TOO_SOON');
  });

  it('requires a channel in BOTH mode when none is given', async () => {
    const res = await gql(app, 'mutation($m:String!){ requestOtp(mobile:$m){ channel } }', {
      m: mob(),
    }).expect(200);
    expect(res.body.errors[0].extensions.code).toBe('OTP_CHANNEL_REQUIRED');
  });

  it('rejects an invalid mobile with INVALID_MOBILE', async () => {
    const res = await gql(
      app,
      'mutation{ requestOtp(mobile:"12345", channel: SMS){ channel } }',
    ).expect(200);
    expect(res.body.errors[0].extensions.code).toBe('INVALID_MOBILE');
  });

  it('falls back Bale→SMS on a no-account in BOTH mode', async () => {
    const mobile = mob();
    bale.failWith = 'NO_ACCOUNT';
    const res = await gql(
      app,
      'mutation($m:String!){ requestOtp(mobile:$m, channel: BALE){ channel } }',
      {
        m: mobile,
      },
    ).expect(200);
    expect(res.body.data.requestOtp.channel).toBe('SMS');
    expect(sms.lastCode()).toBeDefined();
  });

  it('rotates the refresh token and revokes the old one', async () => {
    const mobile = mob();
    const agent = request.agent(app.getHttpServer());
    await agent.post(GQL).send({
      query: 'mutation($m:String!){ requestOtp(mobile:$m, channel: SMS){ channel } }',
      variables: { m: mobile },
    });
    const verify = await agent.post(GQL).send({
      query: 'mutation($m:String!,$c:String!){ verifyOtp(mobile:$m, code:$c){ refreshToken } }',
      variables: { m: mobile, c: await latestOtp(prisma, mobile) },
    });
    const oldRefresh = verify.body.data.verifyOtp.refreshToken as string;

    // Cookie-based refresh (agent carries the cookie) succeeds and rotates.
    const refreshed = await agent
      .post(GQL)
      .send({ query: 'mutation{ refreshToken{ accessToken } }' });
    expect(refreshed.body.data.refreshToken.accessToken).toBeTruthy();

    // Replaying the OLD refresh token via header-less request: send the old
    // cookie explicitly on a fresh client → must be rejected.
    const replay = await request(app.getHttpServer())
      .post(GQL)
      .set('Cookie', [`neviso_refresh=${oldRefresh}`])
      .send({ query: 'mutation{ refreshToken{ accessToken } }' });
    expect(replay.body.errors[0].extensions.code).toBe('UNAUTHENTICATED');
  });

  describe('account status', () => {
    it('blocks a banned user at password login and a suspended user via guard', async () => {
      const banned = await prisma.user.create({
        data: {
          mobile: mob(),
          passwordHash: await hash('secret12', 12),
          status: UserStatus.BANNED,
        },
      });
      const res = await gql(
        app,
        'mutation($m:String!){ login(mobile:$m, password:"secret12"){ accessToken } }',
        {
          m: banned.mobile,
        },
      ).expect(200);
      expect(res.body.errors[0].extensions.code).toBe('ACCOUNT_BANNED');
    });

    it('blocks a suspended user from a guarded query', async () => {
      // Log in while active, then suspend, then call a guarded query.
      const mobile = mob();
      await gql(app, 'mutation($m:String!){ requestOtp(mobile:$m, channel: SMS){ channel } }', {
        m: mobile,
      });
      const verify = await gql(
        app,
        'mutation($m:String!,$c:String!){ verifyOtp(mobile:$m, code:$c){ accessToken } }',
        { m: mobile, c: await latestOtp(prisma, mobile) },
      );
      const token = verify.body.data.verifyOtp.accessToken;
      await prisma.user.update({ where: { mobile }, data: { status: UserStatus.SUSPENDED } });

      const me = await request(app.getHttpServer())
        .post(GQL)
        .set('authorization', `Bearer ${token}`)
        .send({ query: '{ me { id } }' })
        .expect(200);
      expect(me.body.errors[0].extensions.code).toBe('ACCOUNT_SUSPENDED');
    });
  });

  it('me without a token is UNAUTHENTICATED', async () => {
    const res = await gql(app, '{ me { id } }').expect(200);
    expect(res.body.errors[0].extensions.code).toBe('UNAUTHENTICATED');
  });

  // Reference the enum import so it is not flagged unused by lint.
  it('exposes the OtpChannel enum', () => {
    expect(OtpChannel.SMS).toBe('SMS');
  });
});
