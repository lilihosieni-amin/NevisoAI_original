import { Injectable, Logger } from '@nestjs/common';
import { OtpChannel } from '@neviso/db';
import { OtpSendError, OtpSendFailure, OtpSender } from '../otp-sender.interface';

/**
 * In-memory OTP senders used in tests and in local/dev when no real provider
 * credentials are configured (working agreement: external services are faked
 * outside production). They record what they "sent" and can be told to fail
 * with a specific reason to exercise fallback / error mapping.
 */
class BaseFakeSender implements OtpSender {
  readonly sent: Array<{ mobile: string; code: string }> = [];
  failWith: OtpSendFailure | null = null;
  protected readonly logger = new Logger('FakeOtpSender');

  constructor(public readonly channel: OtpChannel) {}

  async send(mobile: string, code: string): Promise<{ messageId?: string }> {
    if (this.failWith)
      throw new OtpSendError(this.failWith, `fake ${this.channel} ${this.failWith}`);
    this.sent.push({ mobile, code });
    // `log` (not `debug`) so the code is visible in the dev console for manual
    // testing when no real provider is configured (non-production only).
    this.logger.log(`[fake ${this.channel}] OTP ${code} -> ${mobile}`);
    return { messageId: `fake-${this.channel}-${this.sent.length}` };
  }

  lastCode(): string | undefined {
    return this.sent.at(-1)?.code;
  }

  reset(): void {
    this.sent.length = 0;
    this.failWith = null;
  }
}

@Injectable()
export class FakeSmsSender extends BaseFakeSender {
  constructor() {
    super(OtpChannel.SMS);
  }
}

@Injectable()
export class FakeBaleSender extends BaseFakeSender {
  constructor() {
    super(OtpChannel.BALE);
  }
}
