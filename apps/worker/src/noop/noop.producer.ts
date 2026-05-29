import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { NOOP_QUEUE, NoopJobData } from './noop.constants';

/** Enqueues no-op jobs (used by the integration test and manual smoke checks). */
@Injectable()
export class NoopProducer {
  constructor(@InjectQueue(NOOP_QUEUE) private readonly queue: Queue<NoopJobData>) {}

  enqueue(echo: string) {
    return this.queue.add('noop', { echo }, { removeOnComplete: true, removeOnFail: true });
  }

  get bullQueue(): Queue<NoopJobData> {
    return this.queue;
  }
}
