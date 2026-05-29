import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OtpChannel } from '@neviso/db';
import { RedisService } from '../../common/redis/redis.service';
import { OtpSendError, OtpSender } from '../otp-sender.interface';
import { toBalePhone } from '../phone.util';

const TOKEN_CACHE_KEY = 'bale:token';
// Bale tokens last ~43200s (12h); refresh a little early.
const TOKEN_TTL_SECONDS = 43200 - 600;

/**
 * Bale (بله) Safir OTP delivery (ARD §7.2.3). OAuth client-credentials bearer
 * is cached in Redis and refreshed on expiry / 401. `send_otp` takes the phone
 * in `98XXXXXXXXXX` form and the Neviso-generated numeric code. Provider error
 * bodies are mapped to `OtpSendError` reasons (404 code 17 → NO_ACCOUNT, etc.).
 */
@Injectable()
export class BaleProvider implements OtpSender {
  readonly channel = OtpChannel.BALE;
  private readonly logger = new Logger(BaleProvider.name);

  constructor(
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {}

  async send(mobile: string, code: string): Promise<{ messageId?: string }> {
    const token = await this.getToken();
    await this.sendOtp(token, mobile, code, true);
    return {};
  }

  private async sendOtp(
    token: string,
    mobile: string,
    code: string,
    allowRetryOn401: boolean,
  ): Promise<void> {
    const baseUrl = this.config.get<string>('bale.baseUrl');
    let res: Response;
    try {
      res = await fetch(`${baseUrl}/send_otp`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ phone: toBalePhone(mobile), otp: Number(code) }),
      });
    } catch (err) {
      this.logger.error(`Bale network error: ${(err as Error).message}`);
      throw new OtpSendError('UNAVAILABLE', 'bale network error');
    }

    if (res.ok) return;

    // Expired/invalid token — refresh once and retry.
    if (res.status === 401 && allowRetryOn401) {
      await this.redis.del(TOKEN_CACHE_KEY);
      const fresh = await this.getToken();
      return this.sendOtp(fresh, mobile, code, false);
    }

    this.logger.error(`Bale send_otp failed: HTTP ${res.status}`);
    if (res.status === 404) throw new OtpSendError('NO_ACCOUNT', 'bale 404 no account');
    if (res.status === 402) throw new OtpSendError('BALANCE', 'bale 402 balance');
    if (res.status === 429) throw new OtpSendError('RATE_LIMITED', 'bale 429');
    if (res.status === 400) throw new OtpSendError('INVALID_PHONE', 'bale 400 invalid phone');
    throw new OtpSendError('UNAVAILABLE', `bale http ${res.status}`);
  }

  /** Returns a cached bearer or fetches a new one via client-credentials. */
  private async getToken(): Promise<string> {
    const cached = await this.redis.get(TOKEN_CACHE_KEY);
    if (cached) return cached;

    const baseUrl = this.config.get<string>('bale.baseUrl');
    const clientId = this.config.get<string>('bale.clientId');
    const clientSecret = this.config.get<string>('bale.clientSecret');

    const form = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId ?? '',
      client_secret: clientSecret ?? '',
      scope: 'read',
    });

    let res: Response;
    try {
      res = await fetch(`${baseUrl}/auth/token`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      });
    } catch (err) {
      this.logger.error(`Bale token network error: ${(err as Error).message}`);
      throw new OtpSendError('UNAVAILABLE', 'bale token network error');
    }

    if (!res.ok) {
      this.logger.error(`Bale token failed: HTTP ${res.status}`);
      throw new OtpSendError('UNAVAILABLE', `bale token http ${res.status}`);
    }

    const body = (await res.json().catch(() => ({}))) as {
      access_token?: string;
      expires_in?: number;
    };
    if (!body.access_token) throw new OtpSendError('UNAVAILABLE', 'bale token missing');

    const ttl = Math.min(body.expires_in ?? TOKEN_TTL_SECONDS, TOKEN_TTL_SECONDS);
    await this.redis.setEx(TOKEN_CACHE_KEY, body.access_token, ttl);
    return body.access_token;
  }
}
