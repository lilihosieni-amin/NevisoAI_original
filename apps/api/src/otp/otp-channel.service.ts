import { Inject, Injectable, Logger } from '@nestjs/common';
import { OtpChannel } from '@neviso/db';
import { AppError } from '../common/errors/app.error';
import { ErrorCode } from '../common/errors/error-codes';
import { PrismaService } from '../prisma/prisma.service';
import { OTP_BALE_SENDER, OTP_SMS_SENDER, OtpSendError, OtpSender } from './otp-sender.interface';

export type OtpChannelMode = 'SMS_ONLY' | 'BALE_ONLY' | 'BOTH';
const OTP_CHANNELS_SETTING = 'otp.channels';
const DEFAULT_MODE: OtpChannelMode = 'BOTH';

/**
 * Resolves which channel an OTP goes out on and dispatches it (ARD §7.2.1).
 *
 *  - Reads the admin-managed mode from `AppSetting("otp.channels")`.
 *  - `otpChannels()` exposes the enabled channels so the UI knows whether to
 *    show a picker.
 *  - In `BOTH` mode the caller's choice (or the user's remembered preference)
 *    decides; absent → `OTP_CHANNEL_REQUIRED`.
 *  - In `BOTH` mode a Bale "no account" (404) falls back to SMS automatically;
 *    in `BALE_ONLY` it surfaces `OTP_BALE_NO_ACCOUNT`.
 *  - All other provider failures map to `OTP_PROVIDER_UNAVAILABLE`.
 */
@Injectable()
export class OtpChannelService {
  private readonly logger = new Logger(OtpChannelService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(OTP_SMS_SENDER) private readonly sms: OtpSender,
    @Inject(OTP_BALE_SENDER) private readonly bale: OtpSender,
  ) {}

  async getMode(): Promise<OtpChannelMode> {
    const row = await this.prisma.appSetting.findUnique({ where: { key: OTP_CHANNELS_SETTING } });
    const value = row?.value;
    if (value === 'SMS_ONLY' || value === 'BALE_ONLY' || value === 'BOTH') return value;
    return DEFAULT_MODE;
  }

  /** Channels offered to the login UI (ARD §5.2 otpChannels). */
  async enabledChannels(): Promise<OtpChannel[]> {
    const mode = await this.getMode();
    if (mode === 'SMS_ONLY') return [OtpChannel.SMS];
    if (mode === 'BALE_ONLY') return [OtpChannel.BALE];
    return [OtpChannel.SMS, OtpChannel.BALE];
  }

  /**
   * Channel for admin step-2 OTP (ARD §7.5): admins have no picker, so BOTH
   * defaults to SMS; single-channel modes force that channel.
   */
  resolveAdminChannel(mode: OtpChannelMode): OtpChannel {
    return mode === 'BALE_ONLY' ? OtpChannel.BALE : OtpChannel.SMS;
  }

  /**
   * Decide the channel for a request given the mode, the client's choice and
   * the user's remembered preference. Forces the only channel in single-channel
   * modes; requires an explicit choice in BOTH.
   */
  resolveRequestedChannel(
    mode: OtpChannelMode,
    requested?: OtpChannel | null,
    preferred?: OtpChannel | null,
  ): OtpChannel {
    if (mode === 'SMS_ONLY') return OtpChannel.SMS;
    if (mode === 'BALE_ONLY') return OtpChannel.BALE;
    const chosen = requested ?? preferred;
    if (!chosen) throw new AppError(ErrorCode.OTP_CHANNEL_REQUIRED);
    return chosen;
  }

  /**
   * Send `code` to `mobile` over `channel`. Returns the channel actually used
   * (after any fallback) and a provider message id when available.
   */
  async dispatch(
    mode: OtpChannelMode,
    channel: OtpChannel,
    mobile: string,
    code: string,
  ): Promise<{ channel: OtpChannel; messageId?: string }> {
    try {
      const sender = channel === OtpChannel.BALE ? this.bale : this.sms;
      const res = await sender.send(mobile, code);
      return { channel, messageId: res.messageId };
    } catch (err) {
      return this.handleSendError(err, mode, channel, mobile, code);
    }
  }

  private async handleSendError(
    err: unknown,
    mode: OtpChannelMode,
    channel: OtpChannel,
    mobile: string,
    code: string,
  ): Promise<{ channel: OtpChannel; messageId?: string }> {
    if (!(err instanceof OtpSendError)) {
      this.logger.error(`OTP dispatch error: ${(err as Error).message}`);
      throw new AppError(ErrorCode.OTP_PROVIDER_UNAVAILABLE);
    }

    if (err.reason === 'NO_ACCOUNT' && channel === OtpChannel.BALE) {
      if (mode === 'BOTH') {
        this.logger.log(`Bale has no account for ${mobile}; falling back to SMS`);
        const res = await this.sms.send(mobile, code).catch(() => {
          throw new AppError(ErrorCode.OTP_PROVIDER_UNAVAILABLE);
        });
        return { channel: OtpChannel.SMS, messageId: res.messageId };
      }
      throw new AppError(ErrorCode.OTP_BALE_NO_ACCOUNT);
    }

    if (err.reason === 'BALANCE') {
      this.logger.error(`OTP provider balance empty on ${channel} — ops alert`);
    }
    throw new AppError(ErrorCode.OTP_PROVIDER_UNAVAILABLE);
  }
}
