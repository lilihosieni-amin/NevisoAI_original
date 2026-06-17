import { OtpChannel } from '@neviso/db';
import { ErrorCode } from '@neviso/errors';
import { AppError } from '../../common/errors/app-error';
import { OtpService, type OtpMode } from './otp.service';
import { NoChannelAccountError } from './otp-sender.interface';

type Mocks = {
  prisma: { appSetting: { findUnique: jest.Mock }; otpRecord: { create: jest.Mock } };
  redis: { client: { set: jest.Mock; del: jest.Mock } };
  config: { env: Record<string, string> };
  sms: { channel: OtpChannel; send: jest.Mock };
  bale: { channel: OtpChannel; send: jest.Mock };
};

function build(mode: OtpMode, env: Record<string, string> = {}): { service: OtpService; m: Mocks } {
  const m: Mocks = {
    prisma: {
      appSetting: { findUnique: jest.fn().mockResolvedValue({ value: mode }) },
      otpRecord: { create: jest.fn().mockResolvedValue({}) },
    },
    redis: { client: { set: jest.fn().mockResolvedValue('OK'), del: jest.fn().mockResolvedValue(1) } },
    config: { env },
    sms: { channel: OtpChannel.SMS, send: jest.fn().mockResolvedValue({ providerMessageId: 'sms-1' }) },
    bale: { channel: OtpChannel.BALE, send: jest.fn().mockResolvedValue({}) },
  };
  const service = new OtpService(
    m.prisma as never,
    m.redis as never,
    m.config as never,
    m.sms as never,
    m.bale as never,
  );
  return { service, m };
}

describe('OtpService.enabledChannels / resolveChannel (ARD §7.2.1)', () => {
  it('SMS_ONLY exposes + forces SMS', async () => {
    const { service } = build('SMS_ONLY');
    expect(await service.enabledChannels()).toEqual([OtpChannel.SMS]);
    expect(await service.resolveChannel(OtpChannel.BALE, null)).toBe(OtpChannel.SMS);
  });

  it('BALE_ONLY exposes + forces BALE', async () => {
    const { service } = build('BALE_ONLY');
    expect(await service.enabledChannels()).toEqual([OtpChannel.BALE]);
    expect(await service.resolveChannel(OtpChannel.SMS, null)).toBe(OtpChannel.BALE);
  });

  it('BOTH exposes both and honors the request, then the remembered choice', async () => {
    const { service } = build('BOTH');
    expect(await service.enabledChannels()).toEqual([OtpChannel.SMS, OtpChannel.BALE]);
    expect(await service.resolveChannel(OtpChannel.BALE, null)).toBe(OtpChannel.BALE);
    expect(await service.resolveChannel(undefined, OtpChannel.SMS)).toBe(OtpChannel.SMS);
  });

  it('BOTH with no choice and no memory requires a channel', async () => {
    const { service } = build('BOTH');
    await expect(service.resolveChannel(undefined, null)).rejects.toMatchObject({
      code: ErrorCode.OTP_CHANNEL_REQUIRED,
    });
  });
});

describe('OtpService.sendOtp', () => {
  it('rejects a request inside the cooldown window (OTP_TOO_SOON)', async () => {
    const { service, m } = build('SMS_ONLY');
    m.redis.client.set.mockResolvedValue(null); // SET NX returned nil → key already present
    const err = service.sendOtp('9123456789', OtpChannel.SMS);
    await expect(err).rejects.toBeInstanceOf(AppError);
    await expect(service.sendOtp('9123456789', OtpChannel.SMS)).rejects.toMatchObject({
      code: ErrorCode.OTP_TOO_SOON,
    });
    expect(m.sms.send).not.toHaveBeenCalled(); // never reached the provider
  });

  it('falls back to SMS when Bale has no account (BOTH mode)', async () => {
    const { service, m } = build('BOTH', { BALE_CLIENT_ID: 'x', BALE_CLIENT_SECRET: 'y' });
    m.bale.send.mockRejectedValueOnce(new NoChannelAccountError(OtpChannel.BALE));

    const res = await service.sendOtp('9123456789', OtpChannel.BALE);

    expect(res.channel).toBe(OtpChannel.SMS); // delivered by SMS instead
    expect(m.prisma.otpRecord.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ channel: OtpChannel.SMS }) }),
    );
  });

  it('releases the cooldown after a successful verify (so re-login is not blocked)', async () => {
    const { service, m } = build('SMS_ONLY');
    const rec = {
      id: 'r1',
      mobile: '9123456789',
      code: '123456',
      channel: OtpChannel.SMS,
      expiresAt: new Date(Date.now() + 60_000),
    };
    (m.prisma.otpRecord as Record<string, jest.Mock>).findFirst = jest.fn().mockResolvedValue(rec);
    (m.prisma.otpRecord as Record<string, jest.Mock>).update = jest.fn().mockResolvedValue(rec);

    await service.verifyOtp('9123456789', '123456');

    expect(m.redis.client.del).toHaveBeenCalledWith('otp:rate:9123456789');
  });

  it('surfaces OTP_BALE_NO_ACCOUNT in BALE_ONLY mode (no fallback)', async () => {
    const { service, m } = build('BALE_ONLY', { BALE_CLIENT_ID: 'x', BALE_CLIENT_SECRET: 'y' });
    m.bale.send.mockRejectedValueOnce(new NoChannelAccountError(OtpChannel.BALE));

    await expect(service.sendOtp('9123456789', OtpChannel.BALE)).rejects.toMatchObject({
      code: ErrorCode.OTP_BALE_NO_ACCOUNT,
    });
    expect(m.redis.client.del).toHaveBeenCalled(); // cooldown released on failure
  });
});
