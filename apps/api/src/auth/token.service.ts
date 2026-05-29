import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../common/redis/redis.service';

export interface UserAccessPayload {
  sub: string;
  typ: 'access';
  act?: { adminId: string }; // present only for impersonation tokens (Phase 8)
}
export interface UserRefreshPayload {
  sub: string;
  typ: 'refresh';
  jti: string;
  exp?: number;
}

/**
 * Issues and verifies user JWTs (ARD §7.1). Access tokens are short-lived
 * (15m, kept in memory client-side); refresh tokens (30d) live in an HttpOnly
 * cookie and rotate on every use — the previous jti is denylisted in Redis for
 * its remaining lifetime so a stolen/old refresh token cannot be replayed.
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {}

  private denylistKey(jti: string): string {
    return `denylist:refresh:${jti}`;
  }

  async signAccess(userId: string, act?: { adminId: string }): Promise<string> {
    return this.jwt.signAsync(
      { sub: userId, typ: 'access', ...(act ? { act } : {}) },
      {
        secret: this.config.get<string>('jwt.accessSecret'),
        expiresIn: this.config.get<string>('jwt.accessExpires'),
      },
    );
  }

  async signRefresh(userId: string): Promise<{ token: string; jti: string }> {
    const jti = randomUUID();
    const token = await this.jwt.signAsync(
      { sub: userId, typ: 'refresh', jti },
      {
        secret: this.config.get<string>('jwt.refreshSecret'),
        expiresIn: this.config.get<string>('jwt.refreshExpires'),
      },
    );
    return { token, jti };
  }

  async verifyAccess(token: string): Promise<UserAccessPayload> {
    const payload = await this.jwt.verifyAsync<UserAccessPayload & { aud?: string }>(token, {
      secret: this.config.get<string>('jwt.accessSecret'),
    });
    // A token minted for the admin space must never authenticate a user.
    if ((payload as { aud?: string }).aud === 'admin' || payload.typ !== 'access') {
      throw new Error('not a user access token');
    }
    return payload;
  }

  async verifyRefresh(token: string): Promise<UserRefreshPayload> {
    const payload = await this.jwt.verifyAsync<UserRefreshPayload>(token, {
      secret: this.config.get<string>('jwt.refreshSecret'),
    });
    if (payload.typ !== 'refresh') throw new Error('not a refresh token');
    if (await this.redis.exists(this.denylistKey(payload.jti))) {
      throw new Error('refresh token revoked');
    }
    return payload;
  }

  /** Denylist a refresh jti for `ttlSeconds` (its remaining lifetime). */
  async revokeRefresh(jti: string, ttlSeconds: number): Promise<void> {
    if (ttlSeconds > 0) await this.redis.setEx(this.denylistKey(jti), '1', ttlSeconds);
  }

  /** Seconds remaining for a refresh token, from its exp claim. */
  remainingSeconds(payload: { exp?: number }): number {
    if (!payload.exp) return 0;
    return Math.max(0, payload.exp - Math.floor(Date.now() / 1000));
  }
}
