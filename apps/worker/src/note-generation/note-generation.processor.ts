import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Job, Worker } from 'bullmq';
import IORedis from 'ioredis';
import type { Env } from '@neviso/config';
import { ENV_TOKEN } from '../config/worker-config.module';

export const NOTE_GENERATION_QUEUE = 'note-generation';

/**
 * BullMQ consumer for the note-generation queue (DEVELOPMENT_PLAN §1.6).
 *
 * Step 1 registers the worker with `WORKER_CONCURRENCY` and an empty processor
 * that just logs received jobs. The real AI pipeline (download → Metis →
 * generate → persist → notify → finalize/refund) is built in Step 4.
 */
@Injectable()
export class NoteGenerationProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NoteGenerationProcessor.name);
  private worker?: Worker;
  private connection?: IORedis;

  constructor(@Inject(ENV_TOKEN) private readonly env: Env) {}

  onModuleInit(): void {
    this.connection = new IORedis(this.env.REDIS_URL, { maxRetriesPerRequest: null });

    this.worker = new Worker(
      NOTE_GENERATION_QUEUE,
      async (job: Job) => {
        // Step 4 implements the pipeline; for now just acknowledge.
        this.logger.log(`received job ${job.id} (name=${job.name})`);
      },
      {
        connection: this.connection,
        concurrency: this.env.WORKER_CONCURRENCY,
      },
    );

    this.worker.on('ready', () => this.logger.log('worker ready (note-generation queue)'));
    this.worker.on('failed', (job, err) =>
      this.logger.error(`job ${job?.id} failed: ${err.message}`),
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
    await this.connection?.quit();
  }
}
