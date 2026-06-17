import { Injectable, Logger } from '@nestjs/common';
import { OtpChannel } from '@neviso/db';
import { toBaleMsisdn } from '@neviso/phone';
import { AppConfigService } from '../../config/app-config.service';
import { RedisService } from '../../common/redis.service';
import { NoChannelAccountError, OtpProviderError, type OtpSender } from './otp-sender.interface';

const BALE_TOKEN_KEY = 'bale:oauth:token';
const TOKEN_REFRESH_BUFFER_S = 60; // refresh a minute before expiry

/**
 * Bale (بله) Safir provider (ARD §7.2.3).
 *
 * OAuth client-credentials token is cached in Redis (~12h) and refreshed on
 * expiry or a 401 — never fetched per send. `POST /send_otp` carries the phone
 * as `98XXXXXXXXXX` and our generated code. A `404 / code 17` means the number
 * has no Bale account → {@link NoChannelAccountError} (the caller decides
 * whether to fall back to SMS or surface `OTP_BALE_NO_ACCOUNT`).
 */
@Injectable()
export class BaleSender implements OtpSender {
  readonly channel = OtpChannel.BALE;
  private readonly logger = new Logger('BaleSender');

  constructor(
    private readonly config: AppConfigService,
    private readonly redis: RedisService,
  ) {}

  async send(mobile: string, code: string): Promise<{ providerMessageId?: string }> {
    const token = await this.getToken();
    try {
      await this.postOtp(mobile, code, token);
    } catch (err) {
      // A 401 means our cached token is stale — drop it, refresh once, retry.
      if (err instanceof OtpProviderError && err.message === 'UNAUTHORIZED') {
        await this.redis.client.del(BALE_TOKEN_KEY);
        const fresh = await this.getToken(true);
        await this.postOtp(mobile, code, fresh);
      } else {
        throw err;
      }
    }
    return {};
  }

  /** Cached client-credentials bearer token (Redis), fetched on miss/force. */
  private async getToken(force = false): Promise<string> {
    if (!force) {
      const cached = await this.redis.client.get(BALE_TOKEN_KEY);
      if (cached) return cached;
    }

    const { BALE_BASE_URL, BALE_CLIENT_ID, BALE_CLIENT_SECRET } = this.config.env;
    let res: Response;
    try {
      res = await fetch(`${BALE_BASE_URL}/auth/token`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: BALE_CLIENT_ID,
          client_secret: BALE_CLIENT_SECRET,
          scope: 'read',
        }),
      });
    } catch (err) {
      throw new OtpProviderError(this.channel, (err as Error).message);
    }

    if (!res.ok) {
      throw new OtpProviderError(this.channel, `Bale token HTTP ${res.status}`);
    }

    const body = (await res.json()) as { access_token?: string; expires_in?: number };
    if (!body.access_token) {
      throw new OtpProviderError(this.channel, 'Bale token missing access_token');
    }

    const ttl = Math.max(60, (body.expires_in ?? 43200) - TOKEN_REFRESH_BUFFER_S);
    await this.redis.client.set(BALE_TOKEN_KEY, body.access_token, 'EX', ttl);
    return body.access_token;
  }

  private async postOtp(mobile: string, code: string, token: string): Promise<void> {
    let res: Response;
    try {
      res = await fetch(`${this.config.env.BALE_BASE_URL}/send_otp`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone: toBaleMsisdn(mobile), otp: Number(code) }),
      });
    } catch (err) {
      throw new OtpProviderError(this.channel, (err as Error).message);
    }

    if (res.ok) return;

    // Map documented Bale error shapes (ARD §7.2.3).
    if (res.status === 401) {
      throw new OtpProviderError(this.channel, 'UNAUTHORIZED');
    }
    if (res.status === 404) {
      throw new NoChannelAccountError(this.channel); // code 17 — no Bale account
    }
    this.logger.error(`Bale send_otp HTTP ${res.status}`);
    throw new OtpProviderError(this.channel, `Bale send_otp HTTP ${res.status}`);
  }
}
