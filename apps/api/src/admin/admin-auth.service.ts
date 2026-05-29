import { randomUUID } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compare } from 'bcryptjs';
import { Admin } from '@neviso/db';
import { AppError } from '../common/errors/app.error';
import { ErrorCode } from '../common/errors/error-codes';
import { RedisService } from '../common/redis/redis.service';
import { generateOtpCode } from '../auth/otp-code.util';
import { OtpChannelService } from '../otp/otp-channel.service';
import { maskMobile } from '../otp/phone.util';
import { PrismaService } from '../prisma/prisma.service';
import { AdminTokenService } from './admin-token.service';
import { AuditService } from './audit.service';

const MAX_OTP_ATTEMPTS = 5;

export interface AdminIssuedTokens {
  accessToken: string;
  refreshToken: string;
  admin: Admin;
}

/**
 * Admin two-step login (ARD §5.9.1, §7.5). Step 1 verifies password (never
 * leaking whether the email exists), then creates a challenge + OTP sent to the
 * admin's mobile. Step 2 validates the OTP, audits `ADMIN_LOGIN`, and issues
 * the separate admin token pair.
 */
@Injectable()
export class AdminAuthService {
  private readonly logger = new Logger(AdminAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
    private readonly tokens: AdminTokenService,
    private readonly channels: OtpChannelService,
    private readonly audit: AuditService,
  ) {}

  // ── Step 1: password → challenge ─────────────────────────────────────────
  async loginStep1(
    email: string,
    password: string,
    ip?: string,
  ): Promise<{ challengeId: string; expiresIn: number; maskedMobile: string }> {
    await this.enforceLoginRateLimit(email, ip);

    const admin = await this.prisma.admin.findUnique({ where: { email: email.toLowerCase() } });
    // Same error for "no such email" and "wrong password" — no existence leak.
    if (!admin || !admin.isActive || !(await compare(password, admin.passwordHash))) {
      throw new AppError(ErrorCode.ADMIN_CREDENTIALS_INVALID);
    }

    const challengeId = randomUUID();
    const code = generateOtpCode();
    const ttl = this.config.get<number>('adminJwt.otpTtl') ?? 300;

    await this.prisma.adminOtp.create({
      data: { adminId: admin.id, challengeId, code, expiresAt: new Date(Date.now() + ttl * 1000) },
    });
    await this.redis.setEx(`admin:challenge:${challengeId}`, admin.id, ttl);

    const mode = await this.channels.getMode();
    const channel = this.channels.resolveAdminChannel(mode);
    await this.channels.dispatch(mode, channel, admin.mobile, code);

    return { challengeId, expiresIn: ttl, maskedMobile: maskMobile(admin.mobile) };
  }

  // ── Step 2: OTP → tokens ─────────────────────────────────────────────────
  async loginStep2(challengeId: string, code: string, ip?: string): Promise<AdminIssuedTokens> {
    const otp = await this.prisma.adminOtp.findUnique({ where: { challengeId } });
    if (!otp || otp.usedAt || otp.expiresAt.getTime() < Date.now()) {
      throw new AppError(ErrorCode.ADMIN_CHALLENGE_INVALID);
    }

    if (otp.code !== code) {
      const attempts = await this.redis.incrWithWindow(
        `admin:challenge:attempts:${challengeId}`,
        this.config.get<number>('adminJwt.otpTtl') ?? 300,
      );
      if (attempts >= MAX_OTP_ATTEMPTS) {
        await this.prisma.adminOtp.update({ where: { challengeId }, data: { usedAt: new Date() } });
        await this.redis.del(`admin:challenge:${challengeId}`);
        throw new AppError(ErrorCode.ADMIN_CHALLENGE_INVALID);
      }
      throw new AppError(ErrorCode.ADMIN_OTP_INVALID);
    }

    await this.prisma.adminOtp.update({ where: { challengeId }, data: { usedAt: new Date() } });
    await this.redis.del(`admin:challenge:${challengeId}`);

    const admin = await this.prisma.admin.update({
      where: { id: otp.adminId },
      data: { lastLoginAt: new Date() },
    });
    if (!admin.isActive) throw new AppError(ErrorCode.ADMIN_CREDENTIALS_INVALID);

    await this.audit.record({
      adminId: admin.id,
      action: 'ADMIN_LOGIN',
      targetType: 'Admin',
      targetId: admin.id,
      ipAddress: ip,
    });

    return this.issue(admin);
  }

  async refresh(refreshToken: string | undefined): Promise<AdminIssuedTokens> {
    if (!refreshToken) throw new AppError(ErrorCode.ADMIN_FORBIDDEN);
    let payload: Awaited<ReturnType<AdminTokenService['verifyRefresh']>>;
    try {
      payload = await this.tokens.verifyRefresh(refreshToken);
    } catch {
      throw new AppError(ErrorCode.ADMIN_FORBIDDEN);
    }
    const admin = await this.prisma.admin.findUnique({ where: { id: payload.sub } });
    if (!admin || !admin.isActive) throw new AppError(ErrorCode.ADMIN_FORBIDDEN);

    await this.tokens.revokeRefresh(payload.jti, this.tokens.remainingSeconds(payload));
    return this.issue(admin);
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return;
    try {
      const payload = await this.tokens.verifyRefresh(refreshToken);
      await this.tokens.revokeRefresh(payload.jti, this.tokens.remainingSeconds(payload));
    } catch {
      // already invalid
    }
  }

  private async issue(admin: Admin): Promise<AdminIssuedTokens> {
    const accessToken = await this.tokens.signAccess(admin.id, admin.role);
    const { token: refreshToken } = await this.tokens.signRefresh(admin.id);
    return { accessToken, refreshToken, admin };
  }

  private async enforceLoginRateLimit(email: string, ip?: string): Promise<void> {
    const max = this.config.get<number>('adminJwt.loginRateMax') ?? 5;
    const window = this.config.get<number>('adminJwt.loginRateWindowSec') ?? 900;
    const keys = [`admin:login:rl:email:${email.toLowerCase()}`];
    if (ip) keys.push(`admin:login:rl:ip:${ip}`);
    for (const key of keys) {
      const count = await this.redis.incrWithWindow(key, window);
      if (count > max) {
        this.logger.warn(`Admin login rate limit hit: ${key}`);
        throw new AppError(ErrorCode.ADMIN_CREDENTIALS_INVALID);
      }
    }
  }
}
