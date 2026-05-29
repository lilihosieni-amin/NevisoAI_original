import { OtpChannel } from '@neviso/db';
import { AppError } from '../common/errors/app.error';
import { ErrorCode } from '../common/errors/error-codes';
import { PrismaService } from '../prisma/prisma.service';
import { OtpChannelService } from './otp-channel.service';
import { FakeBaleSender, FakeSmsSender } from './providers/fake-senders';

function makePrisma(modeValue: unknown): PrismaService {
  return {
    appSetting: {
      findUnique: jest.fn().mockResolvedValue(modeValue ? { value: modeValue } : null),
    },
  } as unknown as PrismaService;
}

describe('OtpChannelService', () => {
  let sms: FakeSmsSender;
  let bale: FakeBaleSender;

  beforeEach(() => {
    sms = new FakeSmsSender();
    bale = new FakeBaleSender();
  });

  describe('getMode / enabledChannels', () => {
    it('defaults to BOTH when the setting is missing or invalid', async () => {
      const svc = new OtpChannelService(makePrisma(null), sms, bale);
      expect(await svc.getMode()).toBe('BOTH');
      expect(await svc.enabledChannels()).toEqual([OtpChannel.SMS, OtpChannel.BALE]);
    });

    it('maps single-channel modes', async () => {
      expect(
        await new OtpChannelService(makePrisma('SMS_ONLY'), sms, bale).enabledChannels(),
      ).toEqual([OtpChannel.SMS]);
      expect(
        await new OtpChannelService(makePrisma('BALE_ONLY'), sms, bale).enabledChannels(),
      ).toEqual([OtpChannel.BALE]);
    });
  });

  describe('resolveRequestedChannel', () => {
    const svc = () => new OtpChannelService(makePrisma('BOTH'), sms, bale);

    it('forces the only channel in single-channel modes (ignoring the request)', () => {
      expect(svc().resolveRequestedChannel('SMS_ONLY', OtpChannel.BALE)).toBe(OtpChannel.SMS);
      expect(svc().resolveRequestedChannel('BALE_ONLY', OtpChannel.SMS)).toBe(OtpChannel.BALE);
    });

    it('uses the requested channel, then the remembered preference, in BOTH', () => {
      expect(svc().resolveRequestedChannel('BOTH', OtpChannel.BALE)).toBe(OtpChannel.BALE);
      expect(svc().resolveRequestedChannel('BOTH', null, OtpChannel.SMS)).toBe(OtpChannel.SMS);
    });

    it('requires a choice in BOTH when none is given', () => {
      expect(() => svc().resolveRequestedChannel('BOTH')).toThrow(
        expect.objectContaining({ extensions: { code: ErrorCode.OTP_CHANNEL_REQUIRED } }),
      );
    });
  });

  it('resolveAdminChannel defaults BOTH to SMS', () => {
    const svc = new OtpChannelService(makePrisma('BOTH'), sms, bale);
    expect(svc.resolveAdminChannel('BOTH')).toBe(OtpChannel.SMS);
    expect(svc.resolveAdminChannel('BALE_ONLY')).toBe(OtpChannel.BALE);
    expect(svc.resolveAdminChannel('SMS_ONLY')).toBe(OtpChannel.SMS);
  });

  describe('dispatch', () => {
    it('sends over the requested channel', async () => {
      const svc = new OtpChannelService(makePrisma('BOTH'), sms, bale);
      const res = await svc.dispatch('BOTH', OtpChannel.SMS, '09121234567', '123456');
      expect(res.channel).toBe(OtpChannel.SMS);
      expect(sms.sent).toHaveLength(1);
    });

    it('falls back Bale→SMS on a no-account in BOTH mode', async () => {
      bale.failWith = 'NO_ACCOUNT';
      const svc = new OtpChannelService(makePrisma('BOTH'), sms, bale);
      const res = await svc.dispatch('BOTH', OtpChannel.BALE, '09121234567', '123456');
      expect(res.channel).toBe(OtpChannel.SMS);
      expect(sms.lastCode()).toBe('123456');
    });

    it('surfaces OTP_BALE_NO_ACCOUNT in BALE_ONLY (no fallback)', async () => {
      bale.failWith = 'NO_ACCOUNT';
      const svc = new OtpChannelService(makePrisma('BALE_ONLY'), sms, bale);
      await expect(
        svc.dispatch('BALE_ONLY', OtpChannel.BALE, '09121234567', '123456'),
      ).rejects.toThrow(
        expect.objectContaining({ extensions: { code: ErrorCode.OTP_BALE_NO_ACCOUNT } }),
      );
      expect(sms.sent).toHaveLength(0);
    });

    it('maps other provider failures to OTP_PROVIDER_UNAVAILABLE', async () => {
      sms.failWith = 'BALANCE';
      const svc = new OtpChannelService(makePrisma('SMS_ONLY'), sms, bale);
      await expect(
        svc.dispatch('SMS_ONLY', OtpChannel.SMS, '09121234567', '123456'),
      ).rejects.toThrow(
        expect.objectContaining({ extensions: { code: ErrorCode.OTP_PROVIDER_UNAVAILABLE } }),
      );
    });

    it('errors if the SMS fallback itself fails', async () => {
      bale.failWith = 'NO_ACCOUNT';
      sms.failWith = 'UNAVAILABLE';
      const svc = new OtpChannelService(makePrisma('BOTH'), sms, bale);
      await expect(svc.dispatch('BOTH', OtpChannel.BALE, '09121234567', '123456')).rejects.toThrow(
        AppError,
      );
    });
  });
});
