'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAdminAuth } from '@/lib/admin-auth-context';

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'مدیر ارشد',
  ADMIN: 'مدیر',
  SUPPORT: 'پشتیبانی',
};

export default function AdminDashboardPage() {
  const { admin, loading, signOut } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !admin) router.replace('/login');
  }, [loading, admin, router]);

  if (loading) {
    return (
      <main
        dir="rtl"
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: 'var(--paper)',
        }}
      >
        <span className="field-note">در حال بارگذاری…</span>
      </main>
    );
  }
  if (!admin) return null;

  const logout = async (): Promise<void> => {
    await signOut();
    router.replace('/login');
  };

  return (
    <main dir="rtl" style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          background: 'var(--slate)',
          color: 'var(--paper)',
        }}
      >
        <strong>پنل مدیریت نویسو</strong>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span data-testid="admin-identity">
            {admin.displayName} · {ROLE_LABELS[admin.role] ?? admin.role}
          </span>
          <button type="button" className="btn btn-accent" onClick={logout}>
            خروج
          </button>
        </div>
      </header>

      <section style={{ padding: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginTop: 0 }}>داشبورد</h1>
          <p className="field-note">
            بخش‌های مدیریت کاربران، پلن‌ها، پرداخت‌ها و گزارش‌ها در مراحل بعدی فعال می‌شوند.
          </p>
        </div>
      </section>
    </main>
  );
}
