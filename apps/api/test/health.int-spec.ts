import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Integration: boots the real Nest application (GraphQL + Apollo + Prisma)
 * against the ephemeral test Postgres and runs the `health` query end-to-end.
 * Requires `docker compose -f docker-compose.test.yml up -d`.
 */
describe('health query (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('returns ok with a reachable test database', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: '{ health { status service database timestamp } }' })
      .expect(200);

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.health).toMatchObject({
      status: 'ok',
      service: 'api',
      database: true,
    });
    expect(typeof res.body.data.health.timestamp).toBe('string');
  });
});
