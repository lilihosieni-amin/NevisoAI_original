import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { NOOP_QUEUE } from './noop.constants';
import { NoopProcessor } from './noop.processor';
import { NoopProducer } from './noop.producer';

@Module({
  imports: [BullModule.registerQueue({ name: NOOP_QUEUE })],
  providers: [NoopProcessor, NoopProducer],
  exports: [NoopProducer],
})
export class NoopModule {}
