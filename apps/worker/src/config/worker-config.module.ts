import { Global, Module } from '@nestjs/common';
import { loadEnv, type Env } from '@neviso/config';

export const ENV_TOKEN = 'NEVISO_ENV';

/** Validates env once at worker boot (zod); refuses to start if misconfigured. */
@Global()
@Module({
  providers: [{ provide: ENV_TOKEN, useFactory: (): Env => loadEnv() }],
  exports: [ENV_TOKEN],
})
export class WorkerConfigModule {}
