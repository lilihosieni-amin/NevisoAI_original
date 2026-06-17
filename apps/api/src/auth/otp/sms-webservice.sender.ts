import { Injectable, Logger } from '@nestjs/common';
import { OtpChannel } from '@neviso/db';
import { toSmsDestination } from '@neviso/phone';
import { AppConfigService } from '../../config/app-config.service';
import { OtpProviderError, type OtpSender } from './otp-sender.interface';

/**
 * SMS Web Service provider (ARD §7.2.2). Sends the OTP through an approved
 * template: `POST /SendTokenSingle` with `{ ApiKey, TemplateKey, Destination,
 * P1 }`, where `P1` is our generated code substituted into `{1}` of the
 * template. `Destination` is the bare 10-digit national number.
 */
@Injectable()
export class SmsWebServiceSender implements OtpSender {
  readonly channel = OtpChannel.SMS;
  private readonly logger = new Logger('SmsWebServiceSender');

  constructor(private readonly config: AppConfigService) {}

  async send(mobile: string, code: string): Promise<{ providerMessageId?: string }> {
    const { SMS_WEBSERVICE_BASE_URL, SMS_WEBSERVICE_API_KEY, SMS_WEBSERVICE_OTP_TEMPLATE_KEY } =
      this.config.env;

    try {
      const res = await fetch(`${SMS_WEBSERVICE_BASE_URL}/SendTokenSingle`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ApiKey: SMS_WEBSERVICE_API_KEY,
          TemplateKey: SMS_WEBSERVICE_OTP_TEMPLATE_KEY,
          Destination: toSmsDestination(mobile),
          P1: code,
        }),
      });

      if (!res.ok) {
        throw new OtpProviderError(this.channel, `SMS provider HTTP ${res.status}`);
      }

      const body = (await res.json()) as { Result?: { id?: string | number } };
      const id = body?.Result?.id;
      return { providerMessageId: id != null ? String(id) : undefined };
    } catch (err) {
      if (err instanceof OtpProviderError) throw err;
      this.logger.error(`SMS send failed: ${(err as Error).message}`);
      throw new OtpProviderError(this.channel, (err as Error).message);
    }
  }
}
