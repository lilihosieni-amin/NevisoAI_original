'use client';

import { useMutation } from '@apollo/client';
import { useState } from 'react';
import { extractErrorCode, mapErrorCode } from '@/lib/error-map';
import { ADMIN_LOGIN_STEP2 } from '@/lib/operations';
import type { Challenge } from './CredentialsStep';

/**
 * Admin login step 2 — OTP entry (ARD §7.5). On success it hands the admin
 * access token up. The masked mobile reminds the operator where the code went.
 */
export function AdminOtpStep({
  challenge,
  onVerified,
  onBack,
}: {
  challenge: Challenge;
  onVerified: (accessToken: string) => void;
  onBack: () => void;
}) {
  const [code, setCode] = useState('');
  const [step2, { loading, error }] = useMutation(ADMIN_LOGIN_STEP2);

  const submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      const res = await step2({ variables: { challengeId: challenge.challengeId, code } });
      const token = res.data?.adminLoginStep2?.accessToken as string | undefined;
      if (token) onVerified(token);
    } catch {
      // surfaced via `error`
    }
  };

  const serverError = error ? mapErrorCode(extractErrorCode(error)) : null;

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p className="field-note">کد تأیید به شمارهٔ {challenge.maskedMobile} ارسال شد.</p>
      <input
        aria-label="کد تأیید"
        inputMode="numeric"
        autoComplete="one-time-code"
        dir="ltr"
        maxLength={6}
        className="field"
        style={{ textAlign: 'center', letterSpacing: '0.4em', fontSize: 22 }}
        placeholder="------"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
      />

      {serverError && (
        <p className="field-error" role="alert">
          {serverError}
        </p>
      )}

      <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
        {loading ? 'در حال ورود…' : 'ورود به پنل'}
      </button>
      <button type="button" className="btn btn-ghost" onClick={onBack}>
        بازگشت
      </button>
    </form>
  );
}
