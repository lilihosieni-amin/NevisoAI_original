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

  // Phase 1 — OTP / auth
  OTP_INVALID: 'کد تأیید نادرست است. دوباره تلاش کنید.',
  OTP_EXPIRED: 'کد تأیید منقضی شده است. لطفاً دوباره کد دریافت کنید.',
  OTP_TOO_SOON: 'کمی صبر کنید و سپس برای دریافت کد جدید تلاش کنید.',
  OTP_CHANNEL_REQUIRED: 'لطفاً روش دریافت کد را انتخاب کنید: پیامک یا بله.',
  OTP_BALE_NO_ACCOUNT: 'این شماره در بله حساب ندارد. لطفاً «پیامک» را انتخاب کنید.',
  OTP_PROVIDER_UNAVAILABLE: 'ارسال کد در حال حاضر ممکن نیست. لطفاً کمی بعد دوباره تلاش کنید.',
  INVALID_MOBILE: 'شمارهٔ موبایل نامعتبر است.',
  INVALID_CREDENTIALS: 'اطلاعات ورود نادرست است.',

  // Phase 1 — account status
  ACCOUNT_SUSPENDED: 'حساب شما موقتاً مسدود شده است. برای اطلاعات بیشتر با پشتیبانی تماس بگیرید.',
  ACCOUNT_BANNED: 'حساب شما مسدود شده است. برای اطلاعات بیشتر با پشتیبانی تماس بگیرید.',
};

/** Returns the Persian message for a code, or the generic fallback. */
export function mapErrorCode(code?: string | null): string {
  if (!code) return FALLBACK_MESSAGE;
  return ERROR_MESSAGES[code] ?? FALLBACK_MESSAGE;
}

/** Pulls the first error code off an Apollo error (GraphQL or network). */
export function extractErrorCode(error: unknown): string | undefined {
  const e = error as {
    graphQLErrors?: Array<{ extensions?: { code?: string } }>;
    networkError?: unknown;
  };
  const code = e?.graphQLErrors?.[0]?.extensions?.code;
  if (code) return code;
  if (e?.networkError) return 'NETWORK_ERROR';
  return undefined;
}
