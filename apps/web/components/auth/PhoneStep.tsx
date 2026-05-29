'use client';

import { useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import { extractErrorCode, mapErrorCode } from '@/lib/error-map';
import { isValidIranMobile, normalizeIranMobile } from '@/lib/mobile';
import { OTP_CHANNELS, REQUEST_OTP } from '@/lib/operations';

type Channel = 'SMS' | 'BALE';

export interface OtpSent {
  mobile: string;
  channel: Channel;
  expiresIn: number;
  requestedChannel: Channel | null;
}

function IranFlag() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true" style={{ borderRadius: 2 }}>
      <rect width="20" height="14" fill="#fff" />
      <rect width="20" height="4.67" fill="#239f40" />
      <rect y="9.33" width="20" height="4.67" fill="#da0000" />
    </svg>
  );
}

/**
 * Login step 1 (Ui_sample §02) — greeting, mobile input with a +۹۸ prefix, a
 * method toggle (OTP now / password later), and — when the admin enabled both
 * OTP channels — a پیامک/بله delivery picker. Calls `requestOtp`.
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
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <header>
        <h1 className="auth-title">سلام دانشجو 👋</h1>
        <p className="auth-sub">
          با شمارهٔ موبایلت وارد شو؛ اولین ورود، اعتبار رایگان هدیه می‌گیری.
        </p>
      </header>

      {/* Method toggle — OTP now; password can be set later from the profile */}
      <div className="seg" role="tablist" aria-label="روش ورود">
        <button type="button" className="seg-btn active" aria-selected="true">
          کد یک‌بار مصرف
        </button>
        <button
          type="button"
          className="seg-btn"
          disabled
          title="پس از ورود از پروفایل فعال می‌شود"
        >
          رمز عبور · غیرفعال
        </button>
      </div>

      <div>
        <label htmlFor="mobile" className="label">
          شمارهٔ موبایل
        </label>
        <div className="phone-field">
          <span className="phone-prefix">
            <IranFlag />
            ۹۸+
          </span>
          <input
            id="mobile"
            name="mobile"
            inputMode="numeric"
            autoComplete="tel"
            dir="ltr"
            className="phone-input"
            placeholder="۹۱۲ ۳۴۵ ۶۷۸۹"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            aria-invalid={Boolean(localError)}
          />
        </div>
      </div>

      {showPicker && (
        <div>
          <span className="label">ارسال کد از طریق</span>
          <div className="chan-row">
            <button
              type="button"
              className={`chan-btn ${channel === 'SMS' ? 'active' : ''}`}
              aria-pressed={channel === 'SMS'}
              onClick={() => setChannel('SMS')}
            >
              پیامک
            </button>
            <button
              type="button"
              className={`chan-btn ${channel === 'BALE' ? 'active' : ''}`}
              aria-pressed={channel === 'BALE'}
              onClick={() => setChannel('BALE')}
            >
              بله
            </button>
          </div>
        </div>
      )}

      {(localError || serverError) && (
        <p className="field-error" role="alert">
          {localError ?? serverError}
        </p>
      )}

      <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
        {loading ? 'در حال ارسال…' : 'ارسال کد'}
      </button>

      <p className="auth-foot">
        با ورود، <a href="#">قوانین</a> و <a href="#">حریم خصوصی</a> را پذیرفته‌ای.
      </p>
    </form>
  );
}
