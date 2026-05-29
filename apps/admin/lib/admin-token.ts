/**
 * Admin token storage — deliberately separate from the user app's storage.
 * Admin access tokens are short-lived and carry `aud: "admin"`; the refresh
 * token lives in an HttpOnly cookie (set by the API), never here.
 */
const ACCESS_TOKEN_KEY = 'neviso_admin_access_token';

export const adminTokenStore = {
  get(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  set(token: string): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  clear(): void {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
};
