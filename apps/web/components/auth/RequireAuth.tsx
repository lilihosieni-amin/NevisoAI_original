'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/lib/auth-context';

/**
 * Client-side route guard. While the session bootstraps (silent refresh) it
 * shows a Persian loading state; an unauthenticated visitor is redirected to
 * `/login`. `UNAUTHENTICATED` from the API maps to the same outcome (ARD §16).
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

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
  if (!user) return null;
  return <>{children}</>;
}
