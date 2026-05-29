import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NOOP_QUEUE, NoopJobData, NoopJobResult } from './noop.constants';

/**
 * Phase 0 no-op consumer: proves the BullMQ ⇄ Redis round-trip works.
 * Later phases replace/extend this with the real note-generation processor.
 */
@Processor(NOOP_QUEUE)
export class NoopProcessor extends WorkerHost {
  private readonly logger = new Logger(NoopProcessor.name);

  async process(job: Job<NoopJobData>): Promise<NoopJobResult> {
    this.logger.log(`Processing noop job ${job.id}: "${job.data.echo}"`);
    return {
      ok: true,
      echo: job.data.echo,
      processedAt: new Date().toISOString(),
    };
  }
}
