import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT, RedisService } from './redis.service';

/**
 * Global Redis access. One shared ioredis connection (lazy, with retry) is
 * provided under REDIS_CLIENT; modules inject RedisService.
 */
@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Redis => {
        const url = config.get<string>('redisUrl');
        return new Redis(url as string, { maxRetriesPerRequest: 2, lazyConnect: false });
      },
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
