import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { ErrorCode } from '@neviso/errors';
import { AppError } from '../common/errors/app-error';
import { RedisService } from '../common/redis.service';
import { AppConfigService } from '../config/app-config.service';

/** Name of the HttpOnly refresh cookie (never read by client JS — ARD §7.1). */
export const REFRESH_COOKIE = 'neviso_rt';

interface RefreshPayload {
  sub: string;
  jti: string;
  iat?: number;
  exp?: number;
}

/** Parse a short duration like `15m` / `30d` / `8h` / `45s` into milliseconds. */
export function parseDurationMs(d: string): number {
  const m = /^(\d+)([smhd])$/.exec(d.trim());
  if (!m) return Number(d) || 0;
  const n = Number(m[1]);
  const unit = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[m[2]] ?? 1000;
  return n * unit;
}

/**
 * Mints + rotates user tokens (ARD §7.1): a 15-minute access JWT returned to
 * the client (kept in memory) and a 30-day refresh JWT carried in an HttpOnly
 * cookie. Each refresh rotates the token and revokes the old `jti` in Redis;
 * logout revokes the current one.
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: AppConfigService,
    private readonly redis: RedisService,
  ) {}

  /** Issue a fresh access+refresh pair for a user. */
  async issue(userId: string): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.jwt.signAsync(
      { sub: userId },
      {
        secret: this.config.env.JWT_ACCESS_SECRET,
        expiresIn: this.config.env.JWT_ACCESS_EXPIRES,
      },
    );
    const refreshToken = await this.jwt.signAsync(
      { sub: userId, jti: randomUUID() },
      {
        secret: this.config.env.JWT_REFRESH_SECRET,
        expiresIn: this.config.env.JWT_REFRESH_EXPIRES,
      },
    );
    return { accessToken, refreshToken };
  }

  /**
   * Verify the refresh token, reject if revoked, revoke the old `jti`, and
   * issue a rotated pair. Returns the new tokens + the userId for status checks.
   */
  async rotate(
    refreshToken: string | undefined,
  ): Promise<{ accessToken: string; refreshToken: string; userId: string }> {
    if (!refreshToken) throw new AppError(ErrorCode.UNAUTHENTICATED);

    let payload: RefreshPayload;
    try {
      payload = await this.jwt.verifyAsync<RefreshPayload>(refreshToken, {
        secret: this.config.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new AppError(ErrorCode.UNAUTHENTICATED);
    }

    if (await this.isRevoked(payload.jti)) {
      throw new AppError(ErrorCode.UNAUTHENTICATED);
    }
    await this.revoke(payload);

    const next = await this.issue(payload.sub);
    return { ...next, userId: payload.sub };
  }

  /** Revoke the refresh token in a cookie (logout). Best-effort. */
  async revokeFromToken(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return;
    try {
      const payload = await this.jwt.verifyAsync<RefreshPayload>(refreshToken, {
        secret: this.config.env.JWT_REFRESH_SECRET,
      });
      await this.revoke(payload);
    } catch {
      // already invalid/expired — nothing to revoke
    }
  }

  setRefreshCookie(res: Response, refreshToken: string): void {
    res.cookie(REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      secure: this.config.isProduction,
      sameSite: 'strict',
      path: '/',
      maxAge: parseDurationMs(this.config.env.JWT_REFRESH_EXPIRES),
    });
  }

  clearRefreshCookie(res: Response): void {
    res.clearCookie(REFRESH_COOKIE, {
      httpOnly: true,
      secure: this.config.isProduction,
      sameSite: 'strict',
      path: '/',
    });
  }

  private revokedKey(jti: string): string {
    return `rt:revoked:${jti}`;
  }

  private async isRevoked(jti: string): Promise<boolean> {
    return (await this.redis.client.exists(this.revokedKey(jti))) === 1;
  }

  /** Mark a refresh `jti` revoked until its natural expiry. */
  private async revoke(payload: RefreshPayload): Promise<void> {
    const ttl = payload.exp ? payload.exp - Math.floor(Date.now() / 1000) : 0;
    if (ttl > 0) {
      await this.redis.client.set(this.revokedKey(payload.jti), '1', 'EX', ttl);
    }
  }
}
