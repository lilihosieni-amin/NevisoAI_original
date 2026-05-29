import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../common/redis/redis.service';
import { OtpChannelService } from './otp-channel.service';
import { OTP_BALE_SENDER, OTP_SMS_SENDER } from './otp-sender.interface';
import { BaleProvider } from './providers/bale.provider';
import { FakeBaleSender, FakeSmsSender } from './providers/fake-senders';
import { SmsWebServiceProvider } from './providers/sms-webservice.provider';

/**
 * OTP delivery wiring. The real SMS / Bale providers are used when their
 * credentials are configured; outside production with no credentials we fall
 * back to in-memory fakes so the app boots and dev login works (the code is
 * logged). Tests override these tokens directly with their own fakes.
 */
@Module({
  providers: [
    OtpChannelService,
    {
      provide: OTP_SMS_SENDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const apiKey = config.get<string>('sms.apiKey');
        const isProd = config.get<boolean>('isProduction');
        return apiKey || isProd ? new SmsWebServiceProvider(config) : new FakeSmsSender();
      },
    },
    {
      provide: OTP_BALE_SENDER,
      inject: [ConfigService, RedisService],
      useFactory: (config: ConfigService, redis: RedisService) => {
        const clientId = config.get<string>('bale.clientId');
        const isProd = config.get<boolean>('isProduction');
        return clientId || isProd ? new BaleProvider(config, redis) : new FakeBaleSender();
      },
    },
  ],
  exports: [OtpChannelService, OTP_SMS_SENDER, OTP_BALE_SENDER],
})
export class OtpModule {}
