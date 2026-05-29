import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compare, hash } from 'bcryptjs';
import { OtpChannel, Prisma, User, UserStatus } from '@neviso/db';
import { AppError } from '../common/errors/app.error';
import { ErrorCode } from '../common/errors/error-codes';
import { RedisService } from '../common/redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';
import { OtpChannelService } from '../otp/otp-channel.service';
import { generateOtpCode } from './otp-code.util';
import { normalizeMobile } from '../otp/phone.util';
import { TokenService } from './token.service';

const BCRYPT_COST = 12;
const MIN_PASSWORD_LENGTH = 8;

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  refreshJti: string;
  isNewUser: boolean;
}

/**
 * User authentication (ARD §5.2, §7.1–7.3). OTP request/verify, password
 * login, refresh rotation, logout and password change. Account status is
 * enforced here too: a suspended/banned user can never obtain fresh tokens.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
    private readonly tokens: TokenService,
    private readonly channels: OtpChannelService,
  ) {}

  // ── OTP request ──────────────────────────────────────────────────────────
  async requestOtp(
    mobileInput: string,
    requested?: OtpChannel | null,
  ): Promise<{ expiresIn: number; channel: OtpChannel }> {
    const mobile = normalizeMobile(mobileInput);
    const mode = await this.channels.getMode();

    const existing = await this.prisma.user.findUnique({ where: { mobile } });
    const channel = this.channels.resolveRequestedChannel(
      mode,
      requested,
      existing?.preferredOtpChannel,
    );

    // Rate limit: 1 request per window per mobile (atomic NX key, ARD §7.2).
    const windowSec = this.config.get<number>('otp.rateLimitWindow') ?? 120;
    const allowed = await this.redis.setIfAbsent(`otp:rl:${mobile}`, '1', windowSec);
    if (!allowed) throw new AppError(ErrorCode.OTP_TOO_SOON);

    const ttl = this.config.get<number>('otp.ttl') ?? 120;
    const code = generateOtpCode();
    const record = await this.prisma.otpRecord.create({
      data: {
        mobile,
        code,
        channel,
        userId: existing?.id ?? null,
        expiresAt: new Date(Date.now() + ttl * 1000),
      },
    });

    const result = await this.channels.dispatch(mode, channel, mobile, code);
    await this.prisma.otpRecord.update({
      where: { id: record.id },
      data: { channel: result.channel, smsMessageId: result.messageId ?? null },
    });

    return { expiresIn: ttl, channel: result.channel };
  }

  // ── OTP verify ───────────────────────────────────────────────────────────
  async verifyOtp(mobileInput: string, code: string): Promise<IssuedTokens> {
    const mobile = normalizeMobile(mobileInput);

    const record = await this.prisma.otpRecord.findFirst({
      where: { mobile, usedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (!record) throw new AppError(ErrorCode.OTP_INVALID);
    if (record.expiresAt.getTime() < Date.now()) throw new AppError(ErrorCode.OTP_EXPIRED);
    if (record.code !== code) throw new AppError(ErrorCode.OTP_INVALID);

    await this.prisma.otpRecord.update({ where: { id: record.id }, data: { usedAt: new Date() } });

    const existing = await this.prisma.user.findUnique({ where: { mobile } });
    const isNewUser = !existing;
    const user = existing
      ? await this.prisma.user.update({
          where: { id: existing.id },
          data: { preferredOtpChannel: record.channel },
        })
      : await this.prisma.user.create({
          data: { mobile, preferredOtpChannel: record.channel },
        });

    this.assertUsable(user);

    if (isNewUser || !user.freeCreditsGiven) await this.grantFreeCreditsOnce(user.id);

    return { ...(await this.issueTokens(user.id)), isNewUser };
  }

  // ── Password login ───────────────────────────────────────────────────────
  async login(mobileInput: string, password: string): Promise<IssuedTokens> {
    const mobile = normalizeMobile(mobileInput);
    const user = await this.prisma.user.findUnique({ where: { mobile } });
    if (!user || !user.passwordHash || !(await compare(password, user.passwordHash))) {
      throw new AppError(ErrorCode.INVALID_CREDENTIALS);
    }
    this.assertUsable(user);
    return { ...(await this.issueTokens(user.id)), isNewUser: false };
  }

  // ── Refresh rotation ───────────────────────────────────────────────────────
  async refresh(refreshToken: string | undefined): Promise<IssuedTokens> {
    if (!refreshToken) throw new AppError(ErrorCode.UNAUTHENTICATED);
    let payload: Awaited<ReturnType<TokenService['verifyRefresh']>>;
    try {
      payload = await this.tokens.verifyRefresh(refreshToken);
    } catch {
      throw new AppError(ErrorCode.UNAUTHENTICATED);
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new AppError(ErrorCode.UNAUTHENTICATED);
    this.assertUsable(user);

    // Rotate: revoke the presented jti for its remaining lifetime.
    await this.tokens.revokeRefresh(payload.jti, this.tokens.remainingSeconds(payload));
    return { ...(await this.issueTokens(user.id)), isNewUser: false };
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return;
    try {
      const payload = await this.tokens.verifyRefresh(refreshToken);
      await this.tokens.revokeRefresh(payload.jti, this.tokens.remainingSeconds(payload));
    } catch {
      // Already invalid/expired — nothing to revoke.
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string | undefined,
    newPassword: string,
  ): Promise<void> {
    if (!newPassword || newPassword.length < MIN_PASSWORD_LENGTH) {
      throw new AppError(ErrorCode.INVALID_CREDENTIALS, undefined, 'weak password');
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(ErrorCode.UNAUTHENTICATED);

    if (user.passwordHash) {
      if (!currentPassword || !(await compare(currentPassword, user.passwordHash))) {
        throw new AppError(ErrorCode.INVALID_CREDENTIALS);
      }
    }
    const passwordHash = await hash(newPassword, BCRYPT_COST);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  }

  // ── Helpers ─────────────────────────────────────────────────────────────
  /** Rejects suspended (active) / banned users at any token-issuing path. */
  private assertUsable(user: User): void {
    if (user.status === UserStatus.BANNED) throw new AppError(ErrorCode.ACCOUNT_BANNED);
    if (user.status === UserStatus.SUSPENDED) {
      const lapsed = user.suspendedUntil && user.suspendedUntil.getTime() < Date.now();
      if (!lapsed) throw new AppError(ErrorCode.ACCOUNT_SUSPENDED);
    }
  }

  /**
   * Grants the one-time signup credits. Idempotent: the FREE_GRANT ledger row
   * carries a unique idempotencyKey, so a concurrent or repeated call rolls
   * back without double-crediting.
   */
  private async grantFreeCreditsOnce(userId: string): Promise<void> {
    const amount = this.config.get<number>('credits.freeGrant') ?? 20;
    try {
      await this.prisma.$transaction([
        this.prisma.creditTransaction.create({
          data: {
            userId,
            type: 'FREE_GRANT',
            amount,
            description: 'هدیهٔ خوش‌آمدگویی',
            idempotencyKey: `free_grant:${userId}`,
          },
        }),
        this.prisma.user.update({
          where: { id: userId },
          data: { creditBalance: { increment: amount }, freeCreditsGiven: true },
        }),
      ]);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        this.logger.debug(`Free credits already granted for ${userId}`);
        return;
      }
      throw err;
    }
  }

  private async issueTokens(userId: string): Promise<Omit<IssuedTokens, 'isNewUser'>> {
    const accessToken = await this.tokens.signAccess(userId);
    const { token: refreshToken, jti } = await this.tokens.signRefresh(userId);
    return { accessToken, refreshToken, refreshJti: jti };
  }
}
