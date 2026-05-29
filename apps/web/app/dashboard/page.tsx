'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useAuth } from '@/lib/auth-context';
import { toPersianDigits } from '@/lib/mobile';

function DashboardInner() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const logout = async (): Promise<void> => {
    await signOut();
    router.replace('/login');
  };

  return (
    <main dir="rtl" style={{ minHeight: '100vh', background: 'var(--paper)', padding: 24 }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>داشبورد</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="chip chip-saffron" data-testid="credit-balance">
            اعتبار: {toPersianDigits(user?.creditBalance ?? 0)}
          </span>
          <Link href="/profile" className="btn btn-outline">
            پروفایل
          </Link>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            خروج
          </button>
        </div>
      </header>

      <section className="card" style={{ padding: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 0 }}>
          خوش آمدید{user?.displayName ? `، ${user.displayName}` : ''} 👋
        </h2>
        <p className="field-note">
          حساب شما با موفقیت ساخته شد و اعتبار هدیه به آن افزوده شد. ساخت جزوه‌ها در مراحل بعدی فعال
          می‌شود.
        </p>
      </section>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardInner />
    </RequireAuth>
  );
}
