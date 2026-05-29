import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { URL } from 'node:url';
import { validationSchema } from './config/validation';
import { NoopModule } from './noop/noop.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema,
      validationOptions: { abortEarly: false },
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redis = new URL(config.getOrThrow<string>('REDIS_URL'));
        return {
          connection: {
            host: redis.hostname,
            port: Number(redis.port || 6379),
            password: redis.password || undefined,
            username: redis.username || undefined,
          },
        };
      },
    }),
    NoopModule,
  ],
})
export class AppModule {}
