/**
 * Iranian mobile-number helpers (ARD §7.2).
 *
 * Canonical form across the whole system is the bare 10-digit national number
 * starting with `9` — e.g. `9123456789` (no leading zero, no country code).
 * That is what we store on `User.mobile` and accept from clients. Providers
 * each want a different shape, so the senders format at the edge:
 *   - SMS Web Service `Destination` → the bare 10 digits (`9123456789`)
 *   - Bale `phone`                  → `98` + 10 digits (`989123456789`)
 *
 * Framework-free so both the API and the web/admin apps can share it.
 */

/** Strict canonical mobile: 10 digits, starts with 9. */
export const MOBILE_REGEX = /^9\d{9}$/;

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** Convert any Persian/Arabic-Indic digits in a string to ASCII `0-9`. */
export function toAsciiDigits(input: string): string {
  return input.replace(/[۰-۹٠-٩]/g, (ch) => {
    const p = PERSIAN_DIGITS.indexOf(ch);
    if (p !== -1) return String(p);
    return String(ARABIC_DIGITS.indexOf(ch));
  });
}

/** Convert ASCII digits in a string to Persian digits (display only). */
export function toPersianDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

/**
 * Normalize arbitrary user input to the canonical `9XXXXXXXXX` form, accepting
 * Persian digits, spaces/dashes, a leading `0`, `+98`, `98`, or `0098`.
 * Returns `null` when the input is not a valid Iranian mobile number.
 */
export function normalizeMobile(raw: string): string | null {
  if (!raw) return null;
  let d = toAsciiDigits(raw).replace(/\D/g, ''); // strip +, spaces, dashes, parens

  if (d.length === 14 && d.startsWith('0098')) d = d.slice(4);
  else if (d.length === 12 && d.startsWith('98')) d = d.slice(2);
  else if (d.length === 11 && d.startsWith('0')) d = d.slice(1);

  return MOBILE_REGEX.test(d) ? d : null;
}

/** True when `raw` normalizes to a valid Iranian mobile number. */
export function isValidMobile(raw: string): boolean {
  return normalizeMobile(raw) !== null;
}

/** Provider format for SMS Web Service `Destination`: the bare 10 digits. */
export function toSmsDestination(mobile: string): string {
  const m = normalizeMobile(mobile);
  if (!m) throw new Error(`invalid mobile: ${mobile}`);
  return m;
}

/** Provider format for Bale `phone`: `98` + the 10 digits (`989123456789`). */
export function toBaleMsisdn(mobile: string): string {
  const m = normalizeMobile(mobile);
  if (!m) throw new Error(`invalid mobile: ${mobile}`);
  return `98${m}`;
}

/**
 * Display the canonical mobile grouped `9XX XXX XXXX`, in Persian digits.
 * The `+۹۸` country prefix is rendered separately by the UI.
 */
export function formatMobileForDisplay(mobile: string): string {
  const m = normalizeMobile(mobile);
  if (!m) return toPersianDigits(mobile);
  return toPersianDigits(`${m.slice(0, 3)} ${m.slice(3, 6)} ${m.slice(6)}`);
}
