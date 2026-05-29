'use client';

import { useMutation } from '@apollo/client';
import { useState } from 'react';
import { extractErrorCode, mapErrorCode } from '@/lib/error-map';
import { ADMIN_LOGIN_STEP1 } from '@/lib/operations';

export interface Challenge {
  challengeId: string;
  expiresIn: number;
  maskedMobile: string;
}

/**
 * Admin login step 1 — email + password (ARD §7.5). On success the API returns
 * an opaque challenge and the masked mobile the OTP was sent to; failures are
 * always `ADMIN_CREDENTIALS_INVALID` (no email-existence leak).
 */
export function CredentialsStep({ onChallenge }: { onChallenge: (c: Challenge) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step1, { loading, error }] = useMutation(ADMIN_LOGIN_STEP1);

  const submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      const res = await step1({ variables: { email, password } });
      const data = res.data?.adminLoginStep1;
      if (data) onChallenge(data);
    } catch {
      // surfaced via `error`
    }
  };

  const serverError = error ? mapErrorCode(extractErrorCode(error)) : null;

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label htmlFor="email" style={{ display: 'block', marginBottom: 6, color: 'var(--ink-2)' }}>
          ایمیل
        </label>
        <input
          id="email"
          type="email"
          dir="ltr"
          className="field"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label
          htmlFor="password"
          style={{ display: 'block', marginBottom: 6, color: 'var(--ink-2)' }}
        >
          رمز عبور
        </label>
        <input
          id="password"
          type="password"
          dir="ltr"
          className="field"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {serverError && (
        <p className="field-error" role="alert">
          {serverError}
        </p>
      )}

      <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
        {loading ? 'در حال بررسی…' : 'ادامه'}
      </button>
    </form>
  );
}
