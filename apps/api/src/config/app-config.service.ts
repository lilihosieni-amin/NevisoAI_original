import { Inject, Injectable } from '@nestjs/common';
import type { Env } from '@neviso/config';

export const ENV_TOKEN = 'NEVISO_ENV';

/** Typed access to validated environment configuration. */
@Injectable()
export class AppConfigService {
  constructor(@Inject(ENV_TOKEN) public readonly env: Env) {}

  get isProduction(): boolean {
    return this.env.NODE_ENV === 'production';
  }
}
