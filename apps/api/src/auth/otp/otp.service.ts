import { randomInt } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { OtpChannel, type OtpRecord } from '@neviso/db';
import { ErrorCode } from '@neviso/errors';
import { AppError } from '../../common/errors/app-error';
import { PrismaService } from '../../common/prisma.service';
import { RedisService } from '../../common/redis.service';
import { AppConfigService } from '../../config/app-config.service';
import {
  NoChannelAccountError,
  OtpProviderError,
  type OtpSender,
} from './otp-sender.interface';
import { SmsWebServiceSender } from './sms-webservice.sender';
import { BaleSender } from './bale.sender';
import { FakeOtpSender } from './fake.sender';

/** Admin-selectable OTP delivery mode (AppSetting `otp.channels`). */
export type OtpMode = 'SMS_ONLY' | 'BALE_ONLY' | 'BOTH';

const OTP_TTL_S = 120; // code validity AND resend cooldown (ARD: 1 OTP / 2 min)
const OTP_RATE_KEY = (mobile: string) => `otp:rate:${mobile}`;

@Injectable()
export class OtpService {
  private readonly logger = new Logger('OtpService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly config: AppConfigService,
    private readonly smsSender: SmsWebServiceSender,
    private readonly baleSender: BaleSender,
  ) {}

  /** The admin-configured mode (defaults to BOTH when unset). */
  async getMode(): Promise<OtpMode> {
    const row = await this.prisma.appSetting.findUnique({ where: { key: 'otp.channels' } });
    const value = typeof row?.value === 'string' ? row.value : 'BOTH';
    return value === 'SMS_ONLY' || value === 'BALE_ONLY' ? value : 'BOTH';
  }

  /** Channels exposed publicly by `otpChannels` (ARD §7.2.1). */
  async enabledChannels(): Promise<OtpChannel[]> {
    switch (await this.getMode()) {
      case 'SMS_ONLY':
        return [OtpChannel.SMS];
      case 'BALE_ONLY':
        return [OtpChannel.BALE];
      default:
        return [OtpChannel.SMS, OtpChannel.BALE];
    }
  }

  /**
   * Resolve which channel to send through given the admin mode and the user's
   * request (ARD §7.2): a single enabled channel is forced; in BOTH mode the
   * user's choice (or remembered preference) is required.
   */
  async resolveChannel(
    requested: OtpChannel | undefined,
    remembered: OtpChannel | null | undefined,
  ): Promise<OtpChannel> {
    const mode = await this.getMode();
    if (mode === 'SMS_ONLY') return OtpChannel.SMS;
    if (mode === 'BALE_ONLY') return OtpChannel.BALE;
    const choice = requested ?? remembered ?? undefined;
    if (!choice) throw new AppError(ErrorCode.OTP_CHANNEL_REQUIRED);
    return choice;
  }

  /**
   * Generate + dispatch a code to `mobile`. Enforces the 2-minute cooldown,
   * applies the BOTH-mode Bale→SMS fallback, persists an OtpRecord, and returns
   * the channel the code was actually sent through.
   */
  async sendOtp(
    mobile: string,
    channel: OtpChannel,
    userId?: string,
  ): Promise<{ channel: OtpChannel; expiresIn: number }> {
    // Cooldown: SET NX EX — a present key means another code went out recently.
    const ok = await this.redis.client.set(OTP_RATE_KEY(mobile), '1', 'EX', OTP_TTL_S, 'NX');
    if (ok === null) throw new AppError(ErrorCode.OTP_TOO_SOON);

    try {
      const code = this.generateCode();
      const mode = await this.getMode();
      let actualChannel = channel;
      let providerMessageId: string | undefined;

      try {
        ({ providerMessageId } = await this.senderFor(channel).send(mobile, code));
      } catch (err) {
        if (err instanceof NoChannelAccountError && err.channel === OtpChannel.BALE) {
          if (mode === 'BOTH') {
            // Cross-channel fallback: deliver by SMS instead (ARD §7.2.1).
            this.logger.warn(`Bale has no account for ${mobile} — falling back to SMS`);
            actualChannel = OtpChannel.SMS;
            ({ providerMessageId } = await this.senderFor(OtpChannel.SMS).send(mobile, code));
          } else {
            throw new AppError(ErrorCode.OTP_BALE_NO_ACCOUNT);
          }
        } else if (err instanceof OtpProviderError) {
          throw new AppError(ErrorCode.OTP_PROVIDER_UNAVAILABLE);
        } else {
          throw err;
        }
      }

      await this.prisma.otpRecord.create({
        data: {
          userId: userId ?? null,
          mobile,
          code,
          channel: actualChannel,
          smsMessageId: actualChannel === OtpChannel.SMS ? (providerMessageId ?? null) : null,
          expiresAt: new Date(Date.now() + OTP_TTL_S * 1000),
        },
      });

      return { channel: actualChannel, expiresIn: OTP_TTL_S };
    } catch (err) {
      // Failed to deliver — release the cooldown so the user can retry now.
      await this.redis.client.del(OTP_RATE_KEY(mobile));
      throw err;
    }
  }

  /**
   * Validate the latest unused code for `mobile`. Marks it used and returns the
   * record (carries the channel, for remembering the user's preference).
   */
  async verifyOtp(mobile: string, code: string): Promise<OtpRecord> {
    const rec = await this.prisma.otpRecord.findFirst({
      where: { mobile, usedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (!rec) throw new AppError(ErrorCode.OTP_INVALID);
    if (rec.expiresAt.getTime() < Date.now()) throw new AppError(ErrorCode.OTP_EXPIRED);
    if (rec.code !== code) throw new AppError(ErrorCode.OTP_INVALID);

    await this.prisma.otpRecord.update({ where: { id: rec.id }, data: { usedAt: new Date() } });
    // The cooldown only throttles *sends*; once a code is verified the flow is
    // done, so release it — a user who logs out can request a fresh code right
    // away instead of hitting OTP_TOO_SOON.
    await this.redis.client.del(OTP_RATE_KEY(mobile));
    return rec;
  }

  /** Pick the live sender for a channel, or a logging fake when unconfigured. */
  private senderFor(channel: OtpChannel): OtpSender {
    if (channel === OtpChannel.BALE) {
      const configured = this.config.env.BALE_CLIENT_ID && this.config.env.BALE_CLIENT_SECRET;
      return configured ? this.baleSender : new FakeOtpSender(OtpChannel.BALE);
    }
    return this.config.env.SMS_WEBSERVICE_API_KEY
      ? this.smsSender
      : new FakeOtpSender(OtpChannel.SMS);
  }

  private generateCode(): string {
    return String(randomInt(0, 1_000_000)).padStart(6, '0');
  }
}
