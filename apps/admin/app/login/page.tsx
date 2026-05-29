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
    <main dir="rtl" className="auth-split">
      <aside className="auth-brand">
        <div className="auth-brand-mark">
          <span className="auth-brand-dot">ن</span>
          نویسو
        </div>

        <div>
          <span className="chip admin-badge" style={{ marginBottom: 16 }}>
            پنل مدیریت
          </span>
          <h2>ورود مدیران</h2>
          <p>
            دسترسی به مدیریت کاربران، پلن‌ها، پرداخت‌ها و گزارش‌ها. ورود دو‌مرحله‌ای: رمز عبور و سپس
            کد تأیید پیامکی.
          </p>
        </div>

        <span className="field-note" style={{ color: 'rgba(250,246,236,0.55)' }}>
          این بخش فقط برای کارکنان مجاز است.
        </span>
      </aside>

      <section className="auth-panel">
        <div className="auth-card">
          <header>
            <h1 className="auth-title">{challenge ? 'تأیید دو‌مرحله‌ای' : 'ورود به پنل'}</h1>
            <p className="auth-sub">
              {challenge
                ? 'کد تأیید ارسال‌شده به موبایل را وارد کنید'
                : 'با ایمیل و رمز عبور وارد شوید'}
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
        </div>
      </section>
    </main>
  );
}
