import { Injectable, Logger } from '@nestjs/common';
import { OtpChannel } from '@neviso/db';
import type { OtpSender } from './otp-sender.interface';

/**
 * Dev/test sender: never calls a provider — it logs the code so a developer can
 * read it from the console and complete the flow locally (DEVELOPMENT_PLAN §2,
 * "use Fake sender locally"). Used whenever the real provider credentials are
 * absent. Tests inspect `lastCode` instead of scraping logs.
 */
@Injectable()
export class FakeOtpSender implements OtpSender {
  private readonly logger = new Logger('FakeOtpSender');

  /** The most recent (mobile, code, channel) — used by integration tests. */
  static lastSent: { mobile: string; code: string; channel: OtpChannel } | null = null;

  constructor(readonly channel: OtpChannel = OtpChannel.SMS) {}

  async send(mobile: string, code: string): Promise<{ providerMessageId?: string }> {
    FakeOtpSender.lastSent = { mobile, code, channel: this.channel };
    this.logger.log(`[DEV OTP] ${this.channel} → ${mobile}: ${code}`);
    return { providerMessageId: `fake-${this.channel}-${Date.now()}` };
  }
}
