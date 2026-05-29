/**
 * Stable error codes (ARD §16). These are the back/front contract: the
 * frontend maps each code to a Persian message (wording may change, codes may
 * not). Each phase adds the codes it introduces. Phase 1 adds the auth/OTP,
 * admin-login and account-status codes.
 */
export const ErrorCode = {
  // OTP / user auth (Phase 1)
  OTP_INVALID: 'OTP_INVALID',
  OTP_EXPIRED: 'OTP_EXPIRED',
  OTP_TOO_SOON: 'OTP_TOO_SOON',
  OTP_CHANNEL_REQUIRED: 'OTP_CHANNEL_REQUIRED',
  OTP_BALE_NO_ACCOUNT: 'OTP_BALE_NO_ACCOUNT',
  OTP_PROVIDER_UNAVAILABLE: 'OTP_PROVIDER_UNAVAILABLE',
  INVALID_MOBILE: 'INVALID_MOBILE',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',

  // Account status (Phase 1)
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  ACCOUNT_BANNED: 'ACCOUNT_BANNED',

  // Admin auth (Phase 1)
  ADMIN_CREDENTIALS_INVALID: 'ADMIN_CREDENTIALS_INVALID',
  ADMIN_CHALLENGE_INVALID: 'ADMIN_CHALLENGE_INVALID',
  ADMIN_OTP_INVALID: 'ADMIN_OTP_INVALID',
  ADMIN_FORBIDDEN: 'ADMIN_FORBIDDEN',

  // Generic (Phase 1 baseline)
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCodeValue = (typeof ErrorCode)[keyof typeof ErrorCode];
