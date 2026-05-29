import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OtpChannel } from '@neviso/db';
import { OtpSendError, OtpSender } from '../otp-sender.interface';
import { toSmsDestination } from '../phone.util';

/**
 * SMS Web Service (پیامک) OTP delivery via the template method `SendTokenSingle`
 * (ARD §7.2.2). The template (e.g. «کد ورود نویسو: {1}») is panel-approved;
 * `P1` is the generated code. Returns the gateway message `id` for status
 * tracking. Never throws raw provider text upward — only `OtpSendError`.
 */
@Injectable()
export class SmsWebServiceProvider implements OtpSender {
  readonly channel = OtpChannel.SMS;
  private readonly logger = new Logger(SmsWebServiceProvider.name);

  constructor(private readonly config: ConfigService) {}

  async send(mobile: string, code: string): Promise<{ messageId?: string }> {
    const baseUrl = this.config.get<string>('sms.baseUrl');
    const apiKey = this.config.get<string>('sms.apiKey');
    const templateKey = this.config.get<string>('sms.templateKey');

    let res: Response;
    try {
      res = await fetch(`${baseUrl}/SendTokenSingle`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ApiKey: apiKey,
          TemplateKey: templateKey,
          Destination: toSmsDestination(mobile),
          P1: code,
        }),
      });
    } catch (err) {
      this.logger.error(`SMS network error: ${(err as Error).message}`);
      throw new OtpSendError('UNAVAILABLE', 'sms network error');
    }

    if (!res.ok) {
      this.logger.error(`SMS send failed: HTTP ${res.status}`);
      if (res.status === 429) throw new OtpSendError('RATE_LIMITED', 'sms 429');
      if (res.status === 402) throw new OtpSendError('BALANCE', 'sms balance');
      throw new OtpSendError('UNAVAILABLE', `sms http ${res.status}`);
    }

    const body = (await res.json().catch(() => ({}))) as { Result?: { id?: string | number } };
    const id = body?.Result?.id;
    return { messageId: id !== undefined ? String(id) : undefined };
  }
}
