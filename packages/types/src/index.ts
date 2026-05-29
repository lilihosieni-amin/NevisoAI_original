/**
 * @neviso/types — shared types & constants across api, worker, web, admin.
 *
 * The canonical error-code catalog lives here so the server (which emits
 * `extensions.code`) and the clients (which map codes → Persian) can never
 * drift. Each development phase adds its own codes to this list (ARD §16).
 */

export const ERROR_CODES = {
  // --- Generic (always present) ---
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  FORBIDDEN: 'FORBIDDEN',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/** Shape of the safe error payload the server returns (never a stack/message). */
export interface ApiErrorPayload {
  code: string;
  data?: Record<string, unknown>;
  traceId?: string;
}

/** Health check contract shared by api/worker health endpoints. */
export interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  service: string;
  timestamp: string;
}

export const OTP_CHANNELS = ['SMS', 'BALE'] as const;
export type OtpChannel = (typeof OTP_CHANNELS)[number];

export const OTP_CHANNEL_MODES = ['SMS_ONLY', 'BALE_ONLY', 'BOTH'] as const;
export type OtpChannelMode = (typeof OTP_CHANNEL_MODES)[number];
