import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';

/**
 * Step 1 integration test (DEVELOPMENT_PLAN §1, automated tests):
 *  - the API boots,
 *  - GET /health returns ok with DB + Redis connected,
 *  - a trivial GraphQL query resolves,
 *  - Prisma can write + read a row in the test database.
 *
 * Requires the local docker Postgres + Redis (or CI service containers).
 */
describe('Step 1 foundation (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app?.close();
  });

  it('GET /health → status ok with DB + Redis connected', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(res.body).toMatchObject({ status: 'ok', db: true, redis: true });
  });

  it('resolves a trivial GraphQL query', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: '{ health }' })
      .expect(200);
    expect(res.body.data.health).toBe('ok');
  });

  it('Prisma can write and read a row', async () => {
    const key = `test.step1.${Date.now()}`;
    try {
      await prisma.appSetting.create({ data: { key, value: 'ok' } });
      const found = await prisma.appSetting.findUnique({ where: { key } });
      expect(found?.value).toBe('ok');
    } finally {
      await prisma.appSetting.deleteMany({ where: { key } });
    }
  });
});
