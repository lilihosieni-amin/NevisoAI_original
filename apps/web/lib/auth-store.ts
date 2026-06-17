import { create } from 'zustand';

/**
 * In-memory auth state (ARD §7.1): the access token lives in memory only; the
 * refresh token is an HttpOnly cookie the client never reads. Populated by the
 * auth slice (Step 2).
 */
interface AuthState {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  setAccessToken: (token) => set({ accessToken: token }),
  clear: () => set({ accessToken: null }),
}));
