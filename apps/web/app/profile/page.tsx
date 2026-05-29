'use client';

import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useAuth } from '@/lib/auth-context';
import { extractErrorCode, mapErrorCode } from '@/lib/error-map';
import { toPersianDigits } from '@/lib/mobile';
import { UPDATE_PROFILE } from '@/lib/operations';

function ProfileInner() {
  const { user, reload, signOut } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [saved, setSaved] = useState(false);

  const [updateProfile, { loading, error }] = useMutation(UPDATE_PROFILE);

  useEffect(() => {
    setDisplayName(user?.displayName ?? '');
    setAvatarUrl(user?.avatarUrl ?? '');
  }, [user]);

  const save = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSaved(false);
    try {
      await updateProfile({ variables: { input: { displayName, avatarUrl: avatarUrl || null } } });
      await reload();
      setSaved(true);
    } catch {
      // surfaced via `error`
    }
  };

  const logout = async (): Promise<void> => {
    await signOut();
    router.replace('/login');
  };

  const serverError = error ? mapErrorCode(extractErrorCode(error)) : null;

  return (
    <main
      dir="rtl"
      style={{
        minHeight: '100vh',
        background: 'var(--paper)',
        padding: 24,
        display: 'grid',
        placeItems: 'start center',
      }}
    >
      <section className="card" style={{ width: '100%', maxWidth: 480, padding: 28 }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>پروفایل</h1>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            خروج
          </button>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          <span className="field-note">شمارهٔ موبایل</span>
          <strong dir="ltr" style={{ textAlign: 'right' }}>
            {toPersianDigits(user?.mobile ?? '')}
          </strong>
          <span className="chip chip-saffron" style={{ alignSelf: 'flex-start', marginTop: 4 }}>
            اعتبار: {toPersianDigits(user?.creditBalance ?? 0)}
          </span>
        </div>

        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label
              htmlFor="displayName"
              style={{ display: 'block', marginBottom: 6, color: 'var(--ink-2)' }}
            >
              نام نمایشی
            </label>
            <input
              id="displayName"
              className="field"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="نام شما"
            />
          </div>
          <div>
            <label
              htmlFor="avatarUrl"
              style={{ display: 'block', marginBottom: 6, color: 'var(--ink-2)' }}
            >
              نشانی تصویر پروفایل (اختیاری)
            </label>
            <input
              id="avatarUrl"
              dir="ltr"
              className="field"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://…"
            />
          </div>

          {serverError && (
            <p className="field-error" role="alert">
              {serverError}
            </p>
          )}
          {saved && (
            <p className="chip chip-sage" role="status">
              تغییرات ذخیره شد.
            </p>
          )}

          <button type="submit" className="btn btn-accent" disabled={loading}>
            {loading ? 'در حال ذخیره…' : 'ذخیره'}
          </button>
        </form>
      </section>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileInner />
    </RequireAuth>
  );
}
