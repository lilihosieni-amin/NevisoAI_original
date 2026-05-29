/**
 * Maps a server error `code` (extensions.code, ARD §16) to a Persian message.
 * Each phase adds its codes here. Unknown codes fall back to a generic message
 * so a raw/English error can never reach the user.
 */
export const FALLBACK_MESSAGE = 'خطایی رخ داد. لطفاً دوباره تلاش کنید.';

export const ERROR_MESSAGES: Record<string, string> = {
  INTERNAL_ERROR: 'خطایی رخ داد. لطفاً دوباره تلاش کنید.',
  NETWORK_ERROR: 'ارتباط با سرور برقرار نشد. اتصال اینترنت خود را بررسی کنید.',
  UNAUTHENTICATED: 'برای ادامه وارد حساب کاربری خود شوید.',
  FORBIDDEN: 'شما به این بخش دسترسی ندارید.',
};

/** Returns the Persian message for a code, or the generic fallback. */
export function mapErrorCode(code?: string | null): string {
  if (!code) return FALLBACK_MESSAGE;
  return ERROR_MESSAGES[code] ?? FALLBACK_MESSAGE;
}
