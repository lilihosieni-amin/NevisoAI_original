'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminOtpStep } from '@/components/AdminOtpStep';
import { CredentialsStep, type Challenge } from '@/components/CredentialsStep';
import { useAdminAuth } from '@/lib/admin-auth-context';

export default function AdminLoginPage() {
  const router = useRouter();
  const { admin, loading, setSession } = useAdminAuth();
  const [challenge, setChallenge] = useState<Challenge | null>(null);

  useEffect(() => {
    if (!loading && admin) router.replace('/dashboard');
  }, [loading, admin, router]);

  const onVerified = async (accessToken: string): Promise<void> => {
    await setSession(accessToken);
    router.replace('/dashboard');
  };

  return (
    <main
      dir="rtl"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'var(--slate)',
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
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>پنل مدیریت نویسو</h1>
          <p style={{ color: 'var(--ink-3)', marginTop: 6 }}>
            {challenge ? 'کد تأیید را وارد کنید' : 'ورود مدیران'}
          </p>
        </header>

        {challenge ? (
          <AdminOtpStep
            challenge={challenge}
            onVerified={onVerified}
            onBack={() => setChallenge(null)}
          />
        ) : (
          <CredentialsStep onChallenge={setChallenge} />
        )}
      </section>
    </main>
  );
}
