import { Global, Module } from '@nestjs/common';
import { loadEnv } from '@neviso/config';
import { AppConfigService, ENV_TOKEN } from './app-config.service';

/**
 * Global config module. Validates the environment once at boot (zod) and
 * refuses to start if a required variable is missing or malformed.
 */
@Global()
@Module({
  providers: [
    {
      provide: ENV_TOKEN,
      useFactory: () => loadEnv(),
    },
    AppConfigService,
  ],
  exports: [ENV_TOKEN, AppConfigService],
})
export class AppConfigModule {}
