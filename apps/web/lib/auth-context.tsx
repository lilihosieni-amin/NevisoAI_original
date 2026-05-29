'use client';

import { useApolloClient } from '@apollo/client';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { LOGOUT, ME, REFRESH_TOKEN } from './operations';
import { tokenStore } from './token-store';

export interface SessionUser {
  id: string;
  mobile: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  creditBalance: number;
  status: string;
  preferredOtpChannel?: string | null;
  hasPassword: boolean;
}

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  /** Store a freshly-issued access token and load the profile. */
  setSession: (accessToken: string) => Promise<void>;
  /** Re-read the current profile (e.g. after editing). */
  reload: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const client = useApolloClient();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async (): Promise<void> => {
    if (!tokenStore.get()) {
      setUser(null);
      return;
    }
    const { data } = await client.query({
      query: ME,
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    });
    setUser((data?.me as SessionUser) ?? null);
  }, [client]);

  const bootstrap = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      // No in-memory token (e.g. after reload) → try the refresh cookie.
      if (!tokenStore.get()) {
        const { data } = await client.mutate({ mutation: REFRESH_TOKEN, errorPolicy: 'all' });
        const token = data?.refreshToken?.accessToken as string | undefined;
        if (token) tokenStore.set(token);
      }
      await loadMe();
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [client, loadMe]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const setSession = useCallback(
    async (accessToken: string): Promise<void> => {
      tokenStore.set(accessToken);
      await loadMe();
    },
    [loadMe],
  );

  const signOut = useCallback(async (): Promise<void> => {
    try {
      await client.mutate({ mutation: LOGOUT });
    } catch {
      // ignore — clear locally regardless
    }
    tokenStore.clear();
    setUser(null);
    await client.clearStore();
  }, [client]);

  return (
    <AuthContext.Provider value={{ user, loading, setSession, reload: loadMe, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
