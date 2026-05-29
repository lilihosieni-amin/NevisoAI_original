'use client';

import { useMutation } from '@apollo/client';
import { useEffect, useState } from 'react';
import { extractErrorCode, mapErrorCode } from '@/lib/error-map';
import { toEnglishDigits, toPersianDigits } from '@/lib/mobile';
import { REQUEST_OTP, VERIFY_OTP } from '@/lib/operations';
import type { OtpSent } from './PhoneStep';

/**
 * Login step 2 — 6-digit OTP entry with a 120s resend timer (ARD §5.2). On
 * success it hands the access token + isNewUser up. Shows the «پیامک» fallback
 * notice when a Bale request was delivered over SMS instead (ARD §7.2.1).
 */
export function OtpStep({
  sent,
  onVerified,
  onChangeMobile,
}: {
  sent: OtpSent;
  onVerified: (accessToken: string, isNewUser: boolean) => void;
  onChangeMobile: () => void;
}) {
  const [code, setCode] = useState('');
  const [remaining, setRemaining] = useState(sent.expiresIn);
  const [localError, setLocalError] = useState<string | null>(null);

  const [verifyOtp, { loading, error }] = useMutation(VERIFY_OTP);
  const [requestOtp, { loading: resending }] = useMutation(REQUEST_OTP);

  useEffect(() => {
    if (remaining <= 0) return;
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);

  const fellBackToSms = sent.requestedChannel === 'BALE' && sent.channel === 'SMS';

  const submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLocalError(null);
    const normalized = toEnglishDigits(code).replace(/\D/g, '');
    if (normalized.length !== 6) {
      setLocalError(mapErrorCode('OTP_INVALID'));
      return;
    }
    try {
      const res = await verifyOtp({ variables: { mobile: sent.mobile, code: normalized } });
      const data = res.data?.verifyOtp;
      if (data?.accessToken) onVerified(data.accessToken, data.isNewUser);
    } catch {
      // surfaced via `error`
    }
  };

  const resend = async (): Promise<void> => {
    setLocalError(null);
    try {
      await requestOtp({ variables: { mobile: sent.mobile, channel: sent.requestedChannel } });
      setRemaining(sent.expiresIn);
    } catch {
      // surfaced via `error`
    }
  };

  const serverError = error ? mapErrorCode(extractErrorCode(error)) : null;

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p className="field-note">کد تأیید به شمارهٔ {toPersianDigits(sent.mobile)} ارسال شد.</p>

      {fellBackToSms && (
        <p className="chip chip-saffron" role="status">
          کد از طریق «پیامک» ارسال شد.
        </p>
      )}

      <input
        aria-label="کد تأیید"
        inputMode="numeric"
        autoComplete="one-time-code"
        dir="ltr"
        maxLength={6}
        className="field otp-input"
        placeholder="••••••"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      {(localError || serverError) && (
        <p className="field-error" role="alert">
          {localError ?? serverError}
        </p>
      )}

      <button type="submit" className="btn btn-accent btn-block" disabled={loading}>
        {loading ? 'در حال بررسی…' : 'ورود'}
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {remaining > 0 ? (
          <span className="field-note">ارسال دوباره تا {toPersianDigits(remaining)} ثانیه</span>
        ) : (
          <button type="button" className="btn btn-ghost" onClick={resend} disabled={resending}>
            ارسال دوبارهٔ کد
          </button>
        )}
        <button type="button" className="btn btn-ghost" onClick={onChangeMobile}>
          تغییر شماره
        </button>
      </div>
    </form>
  );
}
