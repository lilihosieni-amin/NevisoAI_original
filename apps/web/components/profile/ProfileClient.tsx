'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, type ApolloError } from '@apollo/client';
import { CHANGE_PASSWORD, LOGOUT } from '../../lib/graphql/auth';
import { toPersianMessage } from '../../lib/error-map';
import { useAuthStore } from '../../lib/auth-store';

const MIN_LEN = 8;

function persianError(e: unknown): string {
  const code = (e as ApolloError)?.graphQLErrors?.[0]?.extensions?.code;
  return toPersianMessage(code ?? 'NETWORK_ERROR');
}

const cardStyle: React.CSSProperties = {
  background: 'var(--card)',
  border: '1px solid var(--paper-edge)',
  borderRadius: 'var(--r-md)',
  padding: '24px 26px',
};

const inputStyle: React.CSSProperties = {
  padding: '12px 14px',
  background: 'var(--card)',
  border: '1.5px solid var(--ink)',
  borderRadius: 'var(--r-sm)',
  font: 'var(--t-body-md)',
  outline: 'none',
};

/** Profile screen content (§10): password set/change + logout. */
export function ProfileClient() {
  const router = useRouter();
  const clear = useAuthStore((s) => s.clear);

  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [changePassword, { loading }] = useMutation(CHANGE_PASSWORD);
  const [logout] = useMutation(LOGOUT);

  const handleSave = async () => {
    setError(null);
    setSuccess(false);
    if (next.length < MIN_LEN) {
      setError(toPersianMessage('WEAK_PASSWORD'));
      return;
    }
    if (next !== confirm) {
      setError('رمز جدید و تکرار آن یکسان نیستند.');
      return;
    }
    try {
      await changePassword({ variables: { newPassword: next, currentPassword: current || null } });
      setSuccess(true);
      setEditing(false);
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (e) {
      setError(persianError(e));
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore — clear local state regardless
    }
    clear();
    router.replace('/login');
  };

  return (
    <div
      className="grid grid-cols-1 gap-6 px-4 py-6 sm:grid-cols-[240px_1fr] sm:px-8"
      style={{ maxWidth: 1100, margin: '0 auto' }}
    >
      {/* Sidebar */}
      <aside
        style={{
          background: 'var(--card-soft)',
          border: '1px solid var(--paper-edge)',
          borderRadius: 'var(--r-md)',
          padding: '20px 14px',
          height: 'fit-content',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '6px 10px 18px',
            borderBottom: '1px solid var(--paper-edge)',
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'var(--ink)',
              color: 'var(--paper)',
              display: 'grid',
              placeItems: 'center',
              font: 'var(--t-h4)',
            }}
          >
            ک
          </div>
          <div>
            <div style={{ font: 'var(--t-body-md)' }}>حساب من</div>
            <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)' }}>نِویسو</div>
          </div>
        </div>
        <SettNav label="امنیت و رمز عبور" active />
        <button
          type="button"
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 10px',
            borderRadius: 'var(--r-sm)',
            color: 'var(--ruby)',
            font: 'var(--t-body-md)',
            fontSize: 14,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'right',
          }}
        >
          خروج از حساب
        </button>
      </aside>

      {/* Security card */}
      <main style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={cardStyle}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ font: 'var(--t-h3)', fontSize: 18, margin: 0 }}>رمز عبور</h3>
            <p style={{ font: 'var(--t-small)', color: 'var(--ink-3)', margin: '4px 0 0' }}>
              بعد از اولین ورود، می‌توانی رمز عبور تعیین کنی تا نیازی به OTP نباشد.
            </p>
          </div>

          {!editing ? (
            <div
              style={{
                padding: '14px 16px',
                background: 'var(--paper-2)',
                borderRadius: 'var(--r-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ font: 'var(--t-body-md)', marginBottom: 2 }}>تنظیم یا تغییر رمز عبور</div>
                <div style={{ font: 'var(--t-small)', color: 'var(--ink-3)' }}>
                  می‌توانی با موبایل و رمز عبور هم وارد شوی.
                </div>
              </div>
              <button type="button" className="btn btn-primary" onClick={() => setEditing(true)}>
                تنظیم رمز
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="password"
                autoComplete="current-password"
                placeholder="رمز فعلی (اگر قبلاً تنظیم کرده‌ای)"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                style={inputStyle}
              />
              <input
                type="password"
                autoComplete="new-password"
                placeholder="رمز جدید (حداقل ۸ کاراکتر)"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                style={inputStyle}
              />
              <input
                type="password"
                autoComplete="new-password"
                placeholder="تکرار رمز جدید"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                style={inputStyle}
              />
              {error && <div style={{ font: 'var(--t-small)', color: 'var(--ruby)' }}>{error}</div>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn-primary" onClick={handleSave} disabled={loading}>
                  {loading ? 'در حال ذخیره…' : 'ذخیره رمز'}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setEditing(false);
                    setError(null);
                  }}
                >
                  انصراف
                </button>
              </div>
            </div>
          )}

          {success && (
            <div style={{ font: 'var(--t-small)', color: 'var(--sage)', marginTop: 12 }}>
              رمز عبور با موفقیت ذخیره شد.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function SettNav({ label, active }: { label: string; active?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 10px',
        borderRadius: 'var(--r-sm)',
        marginBottom: 2,
        background: active ? 'var(--paper-2)' : 'transparent',
        color: active ? 'var(--ink)' : 'var(--ink-2)',
        font: 'var(--t-body-md)',
        fontSize: 14,
      }}
    >
      {label}
    </div>
  );
}
