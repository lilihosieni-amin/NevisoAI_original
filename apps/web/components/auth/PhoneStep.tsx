'use client';

import { useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import { extractErrorCode, mapErrorCode } from '@/lib/error-map';
import { isValidIranMobile, normalizeIranMobile, toPersianDigits } from '@/lib/mobile';
import { OTP_CHANNELS, REQUEST_OTP } from '@/lib/operations';

type Channel = 'SMS' | 'BALE';

export interface OtpSent {
  mobile: string;
  channel: Channel;
  expiresIn: number;
  requestedChannel: Channel | null;
}

/**
 * Login step 1 — Iranian-mobile input + channel picker (ARD §5.2). The picker
 * is shown only when the admin enabled both channels (`otpChannels` returns
 * two). Calls `requestOtp` and hands the sent channel up to the OTP step.
 */
export function PhoneStep({ onSent }: { onSent: (sent: OtpSent) => void }) {
  const [mobile, setMobile] = useState('');
  const [channel, setChannel] = useState<Channel | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const { data: channelsData } = useQuery(OTP_CHANNELS);
  const channels: Channel[] = channelsData?.otpChannels ?? [];
  const showPicker = channels.length > 1;

  const [requestOtp, { loading, error }] = useMutation(REQUEST_OTP);

  const submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLocalError(null);
    if (!isValidIranMobile(mobile)) {
      setLocalError(mapErrorCode('INVALID_MOBILE'));
      return;
    }
    if (showPicker && !channel) {
      setLocalError(mapErrorCode('OTP_CHANNEL_REQUIRED'));
      return;
    }
    const requestedChannel = showPicker ? channel : (channels[0] ?? null);
    try {
      const res = await requestOtp({
        variables: { mobile: normalizeIranMobile(mobile), channel: requestedChannel },
      });
      const data = res.data?.requestOtp;
      if (data) {
        onSent({
          mobile: normalizeIranMobile(mobile),
          channel: data.channel,
          expiresIn: data.expiresIn,
          requestedChannel: requestedChannel ?? null,
        });
      }
    } catch {
      // surfaced via `error` below
    }
  };

  const serverError = error ? mapErrorCode(extractErrorCode(error)) : null;

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label
          htmlFor="mobile"
          style={{ display: 'block', marginBottom: 6, color: 'var(--ink-2)' }}
        >
          شمارهٔ موبایل
        </label>
        <input
          id="mobile"
          name="mobile"
          inputMode="numeric"
          autoComplete="tel"
          dir="ltr"
          className="field"
          placeholder="۰۹۱۲۳۴۵۶۷۸۹"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          aria-invalid={Boolean(localError)}
        />
      </div>

      {showPicker && (
        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend style={{ marginBottom: 6, color: 'var(--ink-2)' }}>روش دریافت کد</legend>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className={`btn ${channel === 'SMS' ? 'btn-accent' : 'btn-outline'}`}
              aria-pressed={channel === 'SMS'}
              onClick={() => setChannel('SMS')}
            >
              پیامک
            </button>
            <button
              type="button"
              className={`btn ${channel === 'BALE' ? 'btn-accent' : 'btn-outline'}`}
              aria-pressed={channel === 'BALE'}
              onClick={() => setChannel('BALE')}
            >
              بله
            </button>
          </div>
        </fieldset>
      )}

      {(localError || serverError) && (
        <p className="field-error" role="alert">
          {localError ?? serverError}
        </p>
      )}

      <button type="submit" className="btn btn-accent btn-block" disabled={loading}>
        {loading ? 'در حال ارسال…' : 'دریافت کد تأیید'}
      </button>

      <p className="field-note">
        کد تأیید به این شماره ارسال می‌شود: {toPersianDigits(mobile || '')}
      </p>
    </form>
  );
}
