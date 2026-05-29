'use client';

import { useApolloClient } from '@apollo/client';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { adminTokenStore } from './admin-token';
import { ADMIN_LOGOUT, ADMIN_ME, ADMIN_REFRESH } from './operations';

export interface AdminProfile {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

interface AdminAuthContextValue {
  admin: AdminProfile | null;
  loading: boolean;
  setSession: (accessToken: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

// Short idle timeout — an inactive admin session is signed out (ARD §12).
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const client = useApolloClient();
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadAdminMe = useCallback(async (): Promise<void> => {
    if (!adminTokenStore.get()) {
      setAdmin(null);
      return;
    }
    const { data } = await client.query({
      query: ADMIN_ME,
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    });
    setAdmin((data?.adminMe as AdminProfile) ?? null);
  }, [client]);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      await client.mutate({ mutation: ADMIN_LOGOUT });
    } catch {
      // ignore — clear locally regardless
    }
    adminTokenStore.clear();
    setAdmin(null);
    await client.clearStore();
  }, [client]);

  const bootstrap = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      if (!adminTokenStore.get()) {
        const { data } = await client.mutate({ mutation: ADMIN_REFRESH, errorPolicy: 'all' });
        const token = data?.adminRefreshToken?.accessToken as string | undefined;
        if (token) adminTokenStore.set(token);
      }
      await loadAdminMe();
    } catch {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, [client, loadAdminMe]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  // Idle-timeout watchdog: reset on activity while signed in.
  useEffect(() => {
    if (!admin) return;
    const reset = (): void => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => void signOut(), IDLE_TIMEOUT_MS);
    };
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach((e) => window.addEventListener(e, reset));
    reset();
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [admin, signOut]);

  const setSession = useCallback(
    async (accessToken: string): Promise<void> => {
      adminTokenStore.set(accessToken);
      await loadAdminMe();
    },
    [loadAdminMe],
  );

  return (
    <AdminAuthContext.Provider value={{ admin, loading, setSession, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
