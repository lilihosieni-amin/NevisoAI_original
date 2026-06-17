import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';
import { AppConfigService } from '../config/app-config.service';

/**
 * Redis-backed GraphQL Subscriptions pubsub (ARD §9, §17.3).
 *
 * Uses a dedicated publisher/subscriber pair so subscription delivery works
 * across multiple API instances. Feature slices publish events
 * (`noteStatusChanged`, `creditUpdated`, `notificationReceived`) here.
 */
@Injectable()
export class PubSubService implements OnModuleDestroy {
  readonly pubSub: RedisPubSub;
  private readonly publisher: Redis;
  private readonly subscriber: Redis;

  constructor(config: AppConfigService) {
    const url = config.env.REDIS_URL;
    this.publisher = new Redis(url, { maxRetriesPerRequest: null });
    this.subscriber = new Redis(url, { maxRetriesPerRequest: null });
    this.pubSub = new RedisPubSub({
      publisher: this.publisher,
      subscriber: this.subscriber,
    });
  }

  publish<T>(trigger: string, payload: T): Promise<void> {
    return this.pubSub.publish(trigger, payload as Record<string, unknown>);
  }

  asyncIterator<T>(triggers: string | string[]): AsyncIterator<T> {
    return this.pubSub.asyncIterableIterator<T>(triggers);
  }

  async onModuleDestroy(): Promise<void> {
    await this.pubSub.close();
  }
}
