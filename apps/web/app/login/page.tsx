'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { OtpStep } from '@/components/auth/OtpStep';
import { PhoneStep, type OtpSent } from '@/components/auth/PhoneStep';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, setSession } = useAuth();
  const [sent, setSent] = useState<OtpSent | null>(null);

  // Already signed in → go to the dashboard.
  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [loading, user, router]);

  const onVerified = async (accessToken: string): Promise<void> => {
    await setSession(accessToken);
    router.replace('/dashboard');
  };

  return (
    <main
      dir="rtl"
      className="paper-texture"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'var(--paper)',
      }}
    >
      <section
        className="card"
        style={{
          width: '100%',
          maxWidth: 420,
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <header style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: 'var(--ink)' }}>نویسو</h1>
          <p style={{ color: 'var(--ink-3)', marginTop: 6 }}>
            {sent ? 'کد تأیید را وارد کنید' : 'ورود یا ثبت‌نام با شمارهٔ موبایل'}
          </p>
        </header>

        {sent ? (
          <OtpStep sent={sent} onVerified={onVerified} onChangeMobile={() => setSent(null)} />
        ) : (
          <PhoneStep onSent={setSent} />
        )}
      </section>
    </main>
  );
}
