import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AdminRole } from '@neviso/db';
import { RedisService } from '../common/redis/redis.service';

export interface AdminAccessPayload {
  sub: string;
  aud: 'admin';
  role: AdminRole;
}
export interface AdminRefreshPayload {
  sub: string;
  aud: 'admin';
  typ: 'refresh';
  jti: string;
  exp?: number;
}

/**
 * Admin JWTs — a completely separate token space from user tokens (ARD §7.4):
 * different secrets and an `aud: "admin"` claim. User resolvers reject these;
 * admin resolvers reject anything without `aud: "admin"`. Shorter lifetimes
 * (15m access / 8h refresh) with refresh rotation + Redis denylist.
 */
@Injectable()
export class AdminTokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {}

  private denylistKey(jti: string): string {
    return `denylist:admin-refresh:${jti}`;
  }

  async signAccess(adminId: string, role: AdminRole): Promise<string> {
    return this.jwt.signAsync(
      { sub: adminId, aud: 'admin', role },
      {
        secret: this.config.get<string>('adminJwt.accessSecret'),
        expiresIn: this.config.get<string>('adminJwt.accessExpires'),
      },
    );
  }

  async signRefresh(adminId: string): Promise<{ token: string; jti: string }> {
    const jti = randomUUID();
    const token = await this.jwt.signAsync(
      { sub: adminId, aud: 'admin', typ: 'refresh', jti },
      {
        secret: this.config.get<string>('adminJwt.refreshSecret'),
        expiresIn: this.config.get<string>('adminJwt.refreshExpires'),
      },
    );
    return { token, jti };
  }

  async verifyAccess(token: string): Promise<AdminAccessPayload> {
    const payload = await this.jwt.verifyAsync<AdminAccessPayload>(token, {
      secret: this.config.get<string>('adminJwt.accessSecret'),
      audience: 'admin',
    });
    if (payload.aud !== 'admin') throw new Error('not an admin token');
    return payload;
  }

  async verifyRefresh(token: string): Promise<AdminRefreshPayload> {
    const payload = await this.jwt.verifyAsync<AdminRefreshPayload>(token, {
      secret: this.config.get<string>('adminJwt.refreshSecret'),
      audience: 'admin',
    });
    if (payload.aud !== 'admin' || payload.typ !== 'refresh')
      throw new Error('not an admin refresh');
    if (await this.redis.exists(this.denylistKey(payload.jti))) throw new Error('revoked');
    return payload;
  }

  async revokeRefresh(jti: string, ttlSeconds: number): Promise<void> {
    if (ttlSeconds > 0) await this.redis.setEx(this.denylistKey(jti), '1', ttlSeconds);
  }

  remainingSeconds(payload: { exp?: number }): number {
    if (!payload.exp) return 0;
    return Math.max(0, payload.exp - Math.floor(Date.now() / 1000));
  }
}
