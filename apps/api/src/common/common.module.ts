import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { RedisService } from './redis.service';
import { StorageService } from './storage.service';
import { PubSubService } from './pubsub.service';

/**
 * Global infra module — exposes the shared clients (DB, Redis, Storage,
 * PubSub) to every feature module. No business logic lives here.
 */
@Global()
@Module({
  providers: [PrismaService, RedisService, StorageService, PubSubService],
  exports: [PrismaService, RedisService, StorageService, PubSubService],
})
export class CommonModule {}
