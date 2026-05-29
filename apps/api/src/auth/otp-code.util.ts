import { randomInt } from 'crypto';

/** Generates a uniformly-random 6-digit OTP code as a zero-padded string. */
export function generateOtpCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}
