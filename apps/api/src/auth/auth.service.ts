import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { OtpChannel, UserStatus, type User } from '@neviso/db';
import { ErrorCode } from '@neviso/errors';
import { normalizeMobile } from '@neviso/phone';
import { AppError } from '../common/errors/app-error';
import { PrismaService } from '../common/prisma.service';
import { AppConfigService } from '../config/app-config.service';
import { OtpService } from './otp/otp.service';
import { TokenService } from './token.service';

const BCRYPT_COST = 12;
const MIN_PASSWORD_LENGTH = 8;

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
    private readonly otp: OtpService,
    private readonly tokens: TokenService,
  ) {}

  /** Channels the admin has enabled (public). */
  enabledChannels(): Promise<OtpChannel[]> {
    return this.otp.enabledChannels();
  }

  /** Request an OTP; resolves the channel per admin mode + user preference. */
  async requestOtp(
    rawMobile: string,
    requestedChannel?: OtpChannel,
  ): Promise<{ channel: OtpChannel; expiresIn: number }> {
    const mobile = this.normalize(rawMobile);
    const user = await this.prisma.user.findUnique({ where: { mobile } });
    this.assertNotBlocked(user); // a blocked user can't even request a code
    const channel = await this.otp.resolveChannel(requestedChannel, user?.preferredOtpChannel);
    return this.otp.sendOtp(mobile, channel, user?.id);
  }

  /** Verify an OTP: upsert the user, grant free credits once, mint tokens. */
  async verifyOtp(rawMobile: string, code: string): Promise<IssuedTokens> {
    const mobile = this.normalize(rawMobile);
    const record = await this.otp.verifyOtp(mobile, code);

    const existing = await this.prisma.user.findUnique({ where: { mobile } });
    this.assertNotBlocked(existing);

    const user =
      existing ??
      (await this.prisma.user.create({
        data: { mobile, status: UserStatus.ACTIVE, preferredOtpChannel: record.channel },
      }));

    // Remember the channel actually used (for BOTH mode next time).
    if (existing && existing.preferredOtpChannel !== record.channel) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { preferredOtpChannel: record.channel },
      });
    }

    await this.grantFreeCreditsOnce(user);

    const minted = await this.tokens.issue(user.id);
    return { ...minted, isNewUser: !existing };
  }

  /** Password login (available after a user has set a password). */
  async login(rawMobile: string, password: string): Promise<IssuedTokens> {
    const mobile = this.normalize(rawMobile);
    const user = await this.prisma.user.findUnique({ where: { mobile } });
    if (!user || !user.passwordHash) {
      throw new AppError(ErrorCode.INVALID_CREDENTIALS);
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError(ErrorCode.INVALID_CREDENTIALS);

    this.assertNotBlocked(user);

    const minted = await this.tokens.issue(user.id);
    return { ...minted, isNewUser: false };
  }

  /** Set or change the password (first set needs no current password). */
  async changePassword(
    userId: string,
    newPassword: string,
    currentPassword?: string,
  ): Promise<boolean> {
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      throw new AppError(ErrorCode.WEAK_PASSWORD);
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(ErrorCode.UNAUTHENTICATED);

    if (user.passwordHash) {
      const ok = currentPassword
        ? await bcrypt.compare(currentPassword, user.passwordHash)
        : false;
      if (!ok) throw new AppError(ErrorCode.INVALID_CREDENTIALS);
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_COST);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    return true;
  }

  /** Current credit balance (dashboard badge). */
  async creditBalance(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { creditBalance: true },
    });
    return user?.creditBalance ?? 0;
  }

  /** After a successful refresh-rotation, re-check the account isn't blocked. */
  async assertActiveById(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(ErrorCode.UNAUTHENTICATED);
    this.assertNotBlocked(user);
  }

  // ── helpers ──────────────────────────────────────────────

  private normalize(rawMobile: string): string {
    const mobile = normalizeMobile(rawMobile);
    if (!mobile) throw new AppError(ErrorCode.INVALID_MOBILE);
    return mobile;
  }

  /** One-time free credit grant on first login (FR-55; amount from env). */
  private async grantFreeCreditsOnce(user: User): Promise<void> {
    if (user.freeCreditsGiven) return;
    const amount = this.config.env.FREE_CREDIT_GRANT;
    // Idempotent: the unique idempotencyKey guards against a double grant even
    // under a race; the `freeCreditsGiven` flag is the fast path.
    await this.prisma.$transaction(async (tx) => {
      const fresh = await tx.user.findUnique({ where: { id: user.id } });
      if (!fresh || fresh.freeCreditsGiven) return;
      await tx.creditTransaction.create({
        data: {
          userId: user.id,
          type: 'FREE_GRANT',
          amount,
          description: 'هدیهٔ اعتبار اولین ورود',
          idempotencyKey: `free_grant:${user.id}`,
        },
      });
      await tx.user.update({
        where: { id: user.id },
        data: { creditBalance: { increment: amount }, freeCreditsGiven: true },
      });
    });
  }

  private assertNotBlocked(user: User | null): void {
    if (!user) return;
    if (user.status === UserStatus.BANNED) throw new AppError(ErrorCode.ACCOUNT_BANNED);
    if (user.status === UserStatus.SUSPENDED) {
      const stillSuspended =
        !user.suspendedUntil || user.suspendedUntil.getTime() > Date.now();
      if (stillSuspended) throw new AppError(ErrorCode.ACCOUNT_SUSPENDED);
    }
  }
}
