import { INestApplication } from '@nestjs/common';
import { hash } from 'bcryptjs';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, setOtpMode, TestApp } from './auth-test-app';

const GQL = '/graphql';

function gql(app: INestApplication, query: string, variables?: Record<string, unknown>) {
  return request(app.getHttpServer()).post(GQL).send({ query, variables });
}

describe('admin auth (integration)', () => {
  let ctx: TestApp;
  let app: INestApplication;
  let prisma: PrismaService;
  // Unique email per run (test DB persists between local runs).
  const email = `ops${100000 + Math.floor(Math.random() * 800000)}@nevisoai.ir`;
  const password = 'AdminPass123';

  beforeAll(async () => {
    ctx = await createTestApp();
    ({ app, prisma } = ctx);
    await setOtpMode(prisma, 'BOTH');
    await prisma.admin.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: await hash(password, 12),
        mobile: '09121112233',
        displayName: 'Ops',
        role: 'SUPER_ADMIN',
      },
    });
  });

  afterAll(async () => {
    await app?.close();
  });

  it('rejects wrong credentials without leaking existence', async () => {
    const wrongPw = await gql(
      app,
      'mutation($e:String!){ adminLoginStep1(email:$e, password:"nope"){ challengeId } }',
      { e: email },
    );
    const noEmail = await gql(
      app,
      'mutation{ adminLoginStep1(email:"ghost@nevisoai.ir", password:"nope"){ challengeId } }',
    );
    expect(wrongPw.body.errors[0].extensions.code).toBe('ADMIN_CREDENTIALS_INVALID');
    expect(noEmail.body.errors[0].extensions.code).toBe('ADMIN_CREDENTIALS_INVALID');
  });

  it('completes step1 → step2, issues admin tokens, and audits ADMIN_LOGIN', async () => {
    const s1 = await gql(
      app,
      'mutation($e:String!,$p:String!){ adminLoginStep1(email:$e, password:$p){ challengeId expiresIn maskedMobile } }',
      { e: email, p: password },
    ).expect(200);
    const { challengeId, maskedMobile } = s1.body.data.adminLoginStep1;
    expect(maskedMobile).toBe('0912****233');

    const otp = await prisma.adminOtp.findUnique({ where: { challengeId } });
    const auditBefore = await prisma.auditLog.count({ where: { action: 'ADMIN_LOGIN' } });

    const wrong = await gql(
      app,
      'mutation($c:ID!){ adminLoginStep2(challengeId:$c, code:"000000"){ accessToken } }',
      { c: challengeId },
    );
    expect(wrong.body.errors[0].extensions.code).toBe('ADMIN_OTP_INVALID');

    const s2 = await gql(
      app,
      'mutation($c:ID!,$code:String!){ adminLoginStep2(challengeId:$c, code:$code){ accessToken admin{ email role } } }',
      { c: challengeId, code: otp!.code },
    ).expect(200);
    expect(s2.body.data.adminLoginStep2.admin).toMatchObject({ email, role: 'SUPER_ADMIN' });
    const adminToken = s2.body.data.adminLoginStep2.accessToken as string;

    const auditAfter = await prisma.auditLog.count({ where: { action: 'ADMIN_LOGIN' } });
    expect(auditAfter).toBe(auditBefore + 1);

    // adminMe works with the admin token
    const adminMe = await request(app.getHttpServer())
      .post(GQL)
      .set('authorization', `Bearer ${adminToken}`)
      .send({ query: '{ adminMe { email role } }' })
      .expect(200);
    expect(adminMe.body.data.adminMe.email).toBe(email);

    // an expired/used challenge cannot be replayed
    const replay = await gql(
      app,
      'mutation($c:ID!,$code:String!){ adminLoginStep2(challengeId:$c, code:$code){ accessToken } }',
      { c: challengeId, code: otp!.code },
    );
    expect(replay.body.errors[0].extensions.code).toBe('ADMIN_CHALLENGE_INVALID');

    // cross-token isolation: the admin token must be rejected by a user resolver
    const meAsAdmin = await request(app.getHttpServer())
      .post(GQL)
      .set('authorization', `Bearer ${adminToken}`)
      .send({ query: '{ me { id } }' })
      .expect(200);
    expect(meAsAdmin.body.errors[0].extensions.code).toBe('UNAUTHENTICATED');
  });

  it('rejects a user token at an admin resolver (and unauth without a token)', async () => {
    // Mint a user token via OTP login (unique mobile — DB persists between runs).
    const mobile = `0913${100000 + Math.floor(Math.random() * 800000)}0`;
    await gql(app, 'mutation($m:String!){ requestOtp(mobile:$m, channel: SMS){ channel } }', {
      m: mobile,
    });
    const rec = await prisma.otpRecord.findFirst({
      where: { mobile },
      orderBy: { createdAt: 'desc' },
    });
    const verify = await gql(
      app,
      'mutation($m:String!,$c:String!){ verifyOtp(mobile:$m, code:$c){ accessToken } }',
      { m: mobile, c: rec!.code },
    );
    const userToken = verify.body.data.verifyOtp.accessToken as string;

    const withUserToken = await request(app.getHttpServer())
      .post(GQL)
      .set('authorization', `Bearer ${userToken}`)
      .send({ query: '{ adminMe { email } }' })
      .expect(200);
    expect(withUserToken.body.errors[0].extensions.code).toBe('ADMIN_FORBIDDEN');

    const noToken = await gql(app, '{ adminMe { email } }').expect(200);
    expect(noToken.body.errors[0].extensions.code).toBe('UNAUTHENTICATED');
  });
});
