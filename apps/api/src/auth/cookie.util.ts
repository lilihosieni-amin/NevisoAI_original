import type { Response } from 'express';

/**
 * Refresh-token cookie helpers. The refresh token is the only credential kept
 * in a cookie — HttpOnly so JS can't read it, `SameSite=Strict` for CSRF
 * defense (ARD §12), `Secure` in production.
 */
export const USER_REFRESH_COOKIE = 'neviso_refresh';
export const ADMIN_REFRESH_COOKIE = 'neviso_admin_refresh';

export function setRefreshCookie(
  res: Response,
  name: string,
  token: string,
  maxAgeMs: number,
  isProduction: boolean,
): void {
  res.cookie(name, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: isProduction,
    path: '/',
    maxAge: maxAgeMs,
  });
}

export function clearRefreshCookie(res: Response, name: string, isProduction: boolean): void {
  res.clearCookie(name, { httpOnly: true, sameSite: 'strict', secure: isProduction, path: '/' });
}
