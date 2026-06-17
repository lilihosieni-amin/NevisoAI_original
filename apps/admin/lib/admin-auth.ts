import { create } from 'zustand';

/**
 * In-memory admin auth state (ARD §7.4). The admin access token lives in memory;
 * the refresh token is an HttpOnly cookie scoped to the admin subdomain.
 * Populated by the admin auth slice (Step 12). Kept entirely separate from the
 * user token space.
 */
interface AdminAuthState {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  clear: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  accessToken: null,
  setAccessToken: (token) => set({ accessToken: token }),
  clear: () => set({ accessToken: null }),
}));
