'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { NotebookArt, NotebookIcon } from '@/components/auth/NotebookArt';
import { OtpStep } from '@/components/auth/OtpStep';
import { PhoneStep, type OtpSent } from '@/components/auth/PhoneStep';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, setSession } = useAuth();
  const [sent, setSent] = useState<OtpSent | null>(null);

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [loading, user, router]);

  const onVerified = async (accessToken: string): Promise<void> => {
    await setSession(accessToken);
    router.replace('/dashboard');
  };

  return (
    <main dir="rtl" className="auth-split">
      {/* Form side — first in DOM → right column in RTL */}
      <section className="auth-panel">
        <div className="auth-card">
          <span className="auth-logo">
            نویسو
            <NotebookIcon />
          </span>

          {sent ? (
            <OtpStep sent={sent} onVerified={onVerified} onChangeMobile={() => setSent(null)} />
          ) : (
            <PhoneStep onSent={setSent} />
          )}
        </div>
      </section>

      {/* Brand side — second in DOM → left column in RTL */}
      <aside className="auth-brand">
        <div className="auth-brand-mark">
          <span className="auth-brand-dot">ن</span>
          نویسو
        </div>

        <div className="nb-stage">
          <NotebookArt />
        </div>

        <blockquote className="auth-quote">
          «از وقتی نویسو دارم، دیگه شب امتحان دنبال جزوهٔ بقیه نمی‌گردم.»
          <cite>— مریم، دانشجوی پزشکی ۱۴۰۳</cite>
        </blockquote>
      </aside>
    </main>
  );
}
