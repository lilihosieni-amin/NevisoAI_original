import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { QueueEvents } from 'bullmq';
import { URL } from 'node:url';
import { AppModule } from '../src/app.module';
import { NOOP_QUEUE } from '../src/noop/noop.constants';
import { NoopProducer } from '../src/noop/noop.producer';

/**
 * Integration: enqueue a no-op job and assert the BullMQ worker actually
 * processes it against the ephemeral test Redis.
 * Requires `docker compose -f docker-compose.test.yml up -d`.
 */
describe('noop queue (integration)', () => {
  let app: INestApplication;
  let queueEvents: QueueEvents;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();

    const redis = new URL(process.env.REDIS_URL as string);
    queueEvents = new QueueEvents(NOOP_QUEUE, {
      connection: { host: redis.hostname, port: Number(redis.port || 6379) },
    });
    await queueEvents.waitUntilReady();
  });

  afterAll(async () => {
    await queueEvents?.close();
    await app?.close();
  });

  it('processes an enqueued job and returns its result', async () => {
    const producer = app.get(NoopProducer);
    const job = await producer.enqueue('hello-phase-0');

    const returnValue = await job.waitUntilFinished(queueEvents, 15000);

    expect(returnValue).toMatchObject({ ok: true, echo: 'hello-phase-0' });
  }, 20000);
});
