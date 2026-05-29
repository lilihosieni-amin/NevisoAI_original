import { AppError } from '../common/errors/app.error';
import { ErrorCode } from '../common/errors/error-codes';

/**
 * Iranian mobile handling (ARD §7.2.2–7.2.3).
 *
 * Canonical stored form is `09XXXXXXXXX` (11 digits). We accept the common
 * input variants (+98 / 0098 / 98 / 9...) and normalize them. Bale requires
 * the international `98XXXXXXXXXX` form (no leading zero); SMS Web Service
 * takes the 10-digit national number as an integer.
 */

/** Strips non-digits and folds every accepted variant to `09XXXXXXXXX`. */
export function normalizeMobile(input: string): string {
  const digits = (input ?? '').replace(/[^\d]/g, '');

  let national: string | undefined;
  if (/^09\d{9}$/.test(digits))
    national = digits.slice(1); // 09xxxxxxxxx -> 9xxxxxxxxx
  else if (/^9\d{9}$/.test(digits))
    national = digits; // 9xxxxxxxxx
  else if (/^98\d{10}$/.test(digits))
    national = digits.slice(2); // 98 9xxxxxxxxx
  else if (/^0098\d{10}$/.test(digits)) national = digits.slice(4); // 0098 9xxxxxxxxx

  if (!national || !/^9\d{9}$/.test(national)) {
    throw new AppError(ErrorCode.INVALID_MOBILE, undefined, `invalid Iranian mobile: ${input}`);
  }
  return `0${national}`;
}

/** True when `input` is a valid Iranian mobile (any accepted variant). */
export function isValidMobile(input: string): boolean {
  try {
    normalizeMobile(input);
    return true;
  } catch {
    return false;
  }
}

/** `09121234567` -> `989121234567` (Bale international form). */
export function toBalePhone(canonical: string): string {
  return `98${canonical.slice(1)}`;
}

/** `09121234567` -> `9121234567` as a number (SMS Web Service Destination). */
export function toSmsDestination(canonical: string): number {
  return parseInt(canonical.slice(1), 10);
}

/** `09121234567` -> `0912****567` for display (ARD §5.9.1 maskedMobile). */
export function maskMobile(canonical: string): string {
  return `${canonical.slice(0, 4)}****${canonical.slice(-3)}`;
}
