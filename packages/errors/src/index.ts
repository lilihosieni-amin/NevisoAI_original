/**
 * Central error contract for Neviso (ARD §16).
 *
 * The server tags every GraphQL error with a stable `code`; the frontends map
 * that `code` to a Persian message. Wording can change freely — the codes are
 * the fixed back/front contract. Any unmapped code falls back to
 * `INTERNAL_ERROR`, so nothing technical ever reaches a user.
 *
 * This package is imported by BOTH the API (error filter) and the web/admin
 * apps (Apollo errorLink), so it must stay framework-free.
 */

export enum ErrorCode {
  // Credits / billing
  INSUFFICIENT_CREDITS = 'INSUFFICIENT_CREDITS',

  // OTP / auth
  OTP_EXPIRED = 'OTP_EXPIRED',
  OTP_INVALID = 'OTP_INVALID',
  OTP_TOO_SOON = 'OTP_TOO_SOON',
  OTP_CHANNEL_REQUIRED = 'OTP_CHANNEL_REQUIRED',
  OTP_BALE_NO_ACCOUNT = 'OTP_BALE_NO_ACCOUNT',
  OTP_PROVIDER_UNAVAILABLE = 'OTP_PROVIDER_UNAVAILABLE',

  // Domain resources
  NOTE_NOT_FOUND = 'NOTE_NOT_FOUND',
  FOLDER_NOT_FOUND = 'FOLDER_NOT_FOUND',

  // Processing
  PROCESSING_FAILED = 'PROCESSING_FAILED',
  NOTE_INPUT_TOO_LONG = 'NOTE_INPUT_TOO_LONG',
  AI_PROVIDER_UNAVAILABLE = 'AI_PROVIDER_UNAVAILABLE',

  // Payment
  PAYMENT_FAILED = 'PAYMENT_FAILED',

  // Files
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',

  // AuthZ
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  FORBIDDEN = 'FORBIDDEN',
  ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED',
  ACCOUNT_BANNED = 'ACCOUNT_BANNED',

  // Admin
  ADMIN_CREDENTIALS_INVALID = 'ADMIN_CREDENTIALS_INVALID',
  ADMIN_CHALLENGE_INVALID = 'ADMIN_CHALLENGE_INVALID',
  ADMIN_OTP_INVALID = 'ADMIN_OTP_INVALID',
  ADMIN_FORBIDDEN = 'ADMIN_FORBIDDEN',
  IMPERSONATION_FORBIDDEN = 'IMPERSONATION_FORBIDDEN',
  ADJUSTMENT_REASON_REQUIRED = 'ADJUSTMENT_REASON_REQUIRED',
  PLAN_IN_USE = 'PLAN_IN_USE',

  // Generic
  NETWORK_ERROR = 'NETWORK_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

/** The code used whenever an error is unknown/unmapped. */
export const FALLBACK_ERROR_CODE = ErrorCode.INTERNAL_ERROR;

/**
 * Persian catalog (ARD §16.3). Every {@link ErrorCode} has an entry.
 * `data` values are interpolated by the frontend where braces appear.
 */
export const persianCatalog: Record<ErrorCode, string> = {
  [ErrorCode.INSUFFICIENT_CREDITS]: 'اعتبار شما کافی نیست. برای ادامه، اعتبار خود را شارژ کنید.',
  [ErrorCode.OTP_EXPIRED]: 'کد تأیید منقضی شده است. لطفاً دوباره کد دریافت کنید.',
  [ErrorCode.OTP_INVALID]: 'کد تأیید نادرست است. دوباره تلاش کنید.',
  [ErrorCode.OTP_TOO_SOON]: 'کمی صبر کنید و سپس برای دریافت کد جدید تلاش کنید.',
  [ErrorCode.OTP_CHANNEL_REQUIRED]: 'لطفاً روش دریافت کد را انتخاب کنید: پیامک یا بله.',
  [ErrorCode.OTP_BALE_NO_ACCOUNT]: 'این شماره در بله حساب ندارد. لطفاً «پیامک» را انتخاب کنید.',
  [ErrorCode.OTP_PROVIDER_UNAVAILABLE]:
    'ارسال کد در حال حاضر ممکن نیست. لطفاً کمی بعد دوباره تلاش کنید.',
  [ErrorCode.NOTE_NOT_FOUND]: 'این جزوه پیدا نشد.',
  [ErrorCode.FOLDER_NOT_FOUND]: 'این پوشه پیدا نشد.',
  [ErrorCode.PROCESSING_FAILED]:
    'پردازش جزوه ناموفق بود. اعتبار شما بازگردانده شد. می‌توانید فایل را دوباره بارگذاری کنید.',
  [ErrorCode.NOTE_INPUT_TOO_LONG]:
    'طول فایل صوتی بیش از حد مجاز است. لطفاً فایل کوتاه‌تری بارگذاری کنید.',
  [ErrorCode.AI_PROVIDER_UNAVAILABLE]:
    'سرویس پردازش موقتاً در دسترس نیست. کمی بعد دوباره تلاش کنید.',
  [ErrorCode.PAYMENT_FAILED]:
    'پرداخت ناموفق بود. در صورت کسر مبلغ، طبق قوانین درگاه بازگردانده می‌شود.',
  [ErrorCode.FILE_TOO_LARGE]: 'حجم فایل بیش از حد مجاز است.',
  [ErrorCode.UNSUPPORTED_FORMAT]: 'این نوع فایل پشتیبانی نمی‌شود.',
  [ErrorCode.UNAUTHENTICATED]: 'برای ادامه وارد حساب کاربری خود شوید.',
  [ErrorCode.FORBIDDEN]: 'شما به این بخش دسترسی ندارید.',
  [ErrorCode.ACCOUNT_SUSPENDED]:
    'حساب شما موقتاً مسدود شده است. برای اطلاعات بیشتر با پشتیبانی تماس بگیرید.',
  [ErrorCode.ACCOUNT_BANNED]: 'حساب شما مسدود شده است. برای اطلاعات بیشتر با پشتیبانی تماس بگیرید.',
  [ErrorCode.ADMIN_CREDENTIALS_INVALID]: 'شماره موبایل یا رمز عبور نادرست است.',
  [ErrorCode.ADMIN_CHALLENGE_INVALID]: 'نشست ورود نامعتبر یا منقضی شده است. دوباره وارد شوید.',
  [ErrorCode.ADMIN_OTP_INVALID]: 'کد تأیید نادرست است.',
  [ErrorCode.ADMIN_FORBIDDEN]: 'اجازهٔ انجام این عملیات را ندارید.',
  [ErrorCode.IMPERSONATION_FORBIDDEN]: 'این عملیات در حالت «مشاهده به‌جای کاربر» مجاز نیست.',
  [ErrorCode.ADJUSTMENT_REASON_REQUIRED]: 'وارد کردن دلیل برای این عملیات الزامی است.',
  [ErrorCode.PLAN_IN_USE]: 'این بسته قابل حذف نیست؛ به‌جای حذف، آن را غیرفعال کنید.',
  [ErrorCode.NETWORK_ERROR]: 'ارتباط با سرور برقرار نشد. اتصال اینترنت خود را بررسی کنید.',
  [ErrorCode.INTERNAL_ERROR]: 'خطایی رخ داد. لطفاً دوباره تلاش کنید.',
};

/** Type guard: is the given string a known {@link ErrorCode}? */
export function isErrorCode(value: unknown): value is ErrorCode {
  return typeof value === 'string' && value in persianCatalog;
}

/**
 * Resolve a code to its Persian message, falling back to the generic
 * `INTERNAL_ERROR` message for anything unknown. Never throws.
 */
export function persianMessageFor(code: unknown): string {
  if (isErrorCode(code)) {
    return persianCatalog[code];
  }
  return persianCatalog[FALLBACK_ERROR_CODE];
}
