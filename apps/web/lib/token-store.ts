/**
 * User access token store (ARD §7.1): kept in memory only — never in
 * localStorage/cookies — so a page reload drops it and the long-lived refresh
 * cookie silently restores the session. The Apollo authLink reads from here.
 */
let accessToken: string | null = null;

export const tokenStore = {
  get(): string | null {
    return accessToken;
  },
  set(token: string | null): void {
    accessToken = token;
  },
  clear(): void {
    accessToken = null;
  },
};
