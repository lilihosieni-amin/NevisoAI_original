import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { AppConfigService } from '../config/app-config.service';

/** Shared ioredis client (cache, rate-limit keys, token invalidation). */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  readonly client: Redis;

  constructor(config: AppConfigService) {
    this.client = new Redis(config.env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
    });
  }

  async onModuleInit(): Promise<void> {
    if (this.client.status === 'wait' || this.client.status === 'end') {
      await this.client.connect();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }

  /** Connectivity probe for the health endpoint. */
  async isHealthy(): Promise<boolean> {
    try {
      const res = await this.client.ping();
      return res === 'PONG';
    } catch {
      return false;
    }
  }
}
