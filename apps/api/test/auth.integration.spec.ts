import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { RedisService } from '../src/common/redis.service';
import { FakeOtpSender } from '../src/auth/otp/fake.sender';

/**
 * Step 2 integration tests (DEVELOPMENT_PLAN §2): OTP request→verify mints
 * tokens and grants 60 credits exactly once; wrong codes are rejected; refresh
 * rotation revokes the old token; a suspended user is blocked at login.
 *
 * Uses the FakeOtpSender (no provider creds in the test env) and reads the
 * generated code from `FakeOtpSender.lastSent`. Requires docker Postgres+Redis.
 */
describe('Step 2 auth (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let redis: RedisService;

  const MOBILE = '9120000001';
  const FREE_GRANT = 60;

  const gql = (query: string, variables?: unknown, token?: string, cookie?: string) => {
    let req = request(app.getHttpServer()).post('/graphql');
    if (token) req = req.set('Authorization', `Bearer ${token}`);
    if (cookie) req = req.set('Cookie', cookie);
    return req.send({ query, variables });
  };

  const refreshCookie = (res: request.Response): string | undefined => {
    const set = res.headers['set-cookie'] as unknown as string[] | undefined;
    return set?.find((s) => s.startsWith('neviso_rt='))?.split(';')[0];
  };

  const rateKey = `otp:rate:${MOBILE}`;
  const clearCooldown = () => redis.client.del(rateKey);

  const requestThenCode = async (): Promise<string> => {
    await clearCooldown();
    await gql(
      `mutation($m:String!){ requestOtp(mobile:$m){ channel expiresIn } }`,
      { m: MOBILE },
    ).expect(200);
    return FakeOtpSender.lastSent!.code;
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    await app.init();
    prisma = app.get(PrismaService);
    redis = app.get(RedisService);

    // Force a single channel so no channel arg is needed.
    await prisma.appSetting.upsert({
      where: { key: 'otp.channels' },
      update: { value: 'SMS_ONLY' },
      create: { key: 'otp.channels', value: 'SMS_ONLY' },
    });
  });

  afterAll(async () => {
    await cleanup();
    await app?.close();
  });

  async function cleanup() {
    const user = await prisma.user.findUnique({ where: { mobile: MOBILE } });
    if (user) {
      await prisma.creditTransaction.deleteMany({ where: { userId: user.id } });
    }
    await prisma.otpRecord.deleteMany({ where: { mobile: MOBILE } });
    await prisma.user.deleteMany({ where: { mobile: MOBILE } });
    await redis.client.del(rateKey);
  }

  beforeAll(cleanup);

  it('request → verify mints tokens, creates the user, grants 60 once', async () => {
    const code = await requestThenCode();
    expect(FakeOtpSender.lastSent?.mobile).toBe(MOBILE);

    const verify = await gql(
      `mutation($m:String!,$c:String!){ verifyOtp(mobile:$m,code:$c){ accessToken isNewUser } }`,
      { m: MOBILE, c: code },
    ).expect(200);

    const { accessToken, isNewUser } = verify.body.data.verifyOtp;
    expect(isNewUser).toBe(true);
    expect(typeof accessToken).toBe('string');
    expect(refreshCookie(verify)).toBeDefined();

    const credits = await gql(`query{ myCredits }`, undefined, accessToken).expect(200);
    expect(credits.body.data.myCredits).toBe(FREE_GRANT);

    // Second login for the same user grants nothing more.
    const code2 = await requestThenCode();
    const verify2 = await gql(
      `mutation($m:String!,$c:String!){ verifyOtp(mobile:$m,code:$c){ accessToken isNewUser } }`,
      { m: MOBILE, c: code2 },
    ).expect(200);
    expect(verify2.body.data.verifyOtp.isNewUser).toBe(false);

    const credits2 = await gql(
      `query{ myCredits }`,
      undefined,
      verify2.body.data.verifyOtp.accessToken,
    ).expect(200);
    expect(credits2.body.data.myCredits).toBe(FREE_GRANT);

    const grants = await prisma.creditTransaction.count({
      where: { user: { mobile: MOBILE }, type: 'FREE_GRANT' },
    });
    expect(grants).toBe(1);
  });

  it('rejects a wrong code with OTP_INVALID', async () => {
    const code = await requestThenCode();
    const wrong = code === '000000' ? '111111' : '000000';
    const res = await gql(
      `mutation($m:String!,$c:String!){ verifyOtp(mobile:$m,code:$c){ accessToken } }`,
      { m: MOBILE, c: wrong },
    ).expect(200);
    expect(res.body.errors[0].extensions.code).toBe('OTP_INVALID');
  });

  it('rotates the refresh token and revokes the old one', async () => {
    const code = await requestThenCode();
    const login = await gql(
      `mutation($m:String!,$c:String!){ verifyOtp(mobile:$m,code:$c){ accessToken } }`,
      { m: MOBILE, c: code },
    ).expect(200);
    const oldCookie = refreshCookie(login)!;

    const rotated = await gql(
      `mutation{ refreshToken{ accessToken } }`,
      undefined,
      undefined,
      oldCookie,
    ).expect(200);
    expect(typeof rotated.body.data.refreshToken.accessToken).toBe('string');
    expect(refreshCookie(rotated)).toBeDefined();

    // Reusing the OLD (now revoked) refresh cookie must fail.
    const reused = await gql(
      `mutation{ refreshToken{ accessToken } }`,
      undefined,
      undefined,
      oldCookie,
    ).expect(200);
    expect(reused.body.errors[0].extensions.code).toBe('UNAUTHENTICATED');
  });

  it('blocks a suspended user at OTP request', async () => {
    await prisma.user.update({ where: { mobile: MOBILE }, data: { status: 'SUSPENDED' } });
    await clearCooldown();
    const res = await gql(
      `mutation($m:String!){ requestOtp(mobile:$m){ channel } }`,
      { m: MOBILE },
    ).expect(200);
    expect(res.body.errors[0].extensions.code).toBe('ACCOUNT_SUSPENDED');
    await prisma.user.update({ where: { mobile: MOBILE }, data: { status: 'ACTIVE' } });
  });
});
