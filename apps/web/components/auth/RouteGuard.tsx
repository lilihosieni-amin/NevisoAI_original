'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/auth-store';
import { refreshAccessToken } from '../../lib/apollo-client';
import { LoadingScreen } from '../LoadingScreen';

/**
 * Protects the authenticated app shell. With no in-memory access token it tries
 * a silent refresh (HttpOnly cookie); failing that, it redirects to /login.
 */
export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let active = true;
    if (token) {
      setChecked(true);
      return;
    }
    refreshAccessToken().then((t) => {
      if (!active) return;
      if (!t) router.replace('/login');
      setChecked(true);
    });
    return () => {
      active = false;
    };
  }, [token, router]);

  if (!token && !checked) {
    return <LoadingScreen />;
  }

  if (!token) return null; // redirecting to /login
  return <>{children}</>;
}
