/**
 * Jalali (Shamsi) date helpers for Neviso (FR-57, ARD §3.2).
 *
 * Hard rule: dates are STORED as canonical Gregorian/UTC and shown to users
 * ONLY in the Jalali calendar with Persian numerals. Conversion happens at the
 * UI/output boundary — these helpers are that boundary.
 *
 * Conversion math uses `jalaali-js` (pure, deterministic, timezone-free): we
 * always work from a date's UTC calendar components, so a round-trip is exact
 * regardless of the host machine's timezone.
 */
import { toJalaali, toGregorian } from 'jalaali-js';

export type DateInput = Date | string | number;

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/** Convert ASCII digits in a string to Persian digits. */
export function toPersianDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

/** Convert Persian (and Arabic-Indic) digits in a string back to ASCII. */
export function toLatinDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

function toDate(input: DateInput): Date {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid date input: ${String(input)}`);
  }
  return d;
}

const pad2 = (n: number): string => String(n).padStart(2, '0');

export interface JalaliParts {
  jy: number;
  jm: number;
  jd: number;
}

/** Jalali calendar parts (year/month/day) for a UTC instant. */
export function toJalali(input: DateInput): JalaliParts {
  const d = toDate(input);
  const { jy, jm, jd } = toJalaali(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
  return { jy, jm, jd };
}

/**
 * Format a UTC instant as a Jalali date string `YYYY/MM/DD`.
 * Persian numerals by default (set `withPersianDigits: false` for ASCII).
 */
export function formatJalali(
  input: DateInput,
  options: { withPersianDigits?: boolean } = {},
): string {
  const { withPersianDigits = true } = options;
  const { jy, jm, jd } = toJalali(input);
  const s = `${jy}/${pad2(jm)}/${pad2(jd)}`;
  return withPersianDigits ? toPersianDigits(s) : s;
}

/** Build a UTC `Date` (at 00:00:00Z) from Jalali year/month/day. */
export function jalaliToUTC(jy: number, jm: number, jd: number): Date {
  const { gy, gm, gd } = toGregorian(jy, jm, jd);
  return new Date(Date.UTC(gy, gm - 1, gd));
}

/**
 * Parse a Jalali date string (Persian or ASCII digits; `/`, `-`, or `.`
 * separators) into a canonical UTC `Date` at midnight. This is what the client
 * does before sending a picked date to the server.
 */
export function parseJalali(input: string): Date {
  const latin = toLatinDigits(input).trim();
  const parts = latin.split(/[/\-.]/).map((p) => Number(p));
  if (parts.length !== 3 || parts.some((n) => !Number.isInteger(n))) {
    throw new Error(`Invalid Jalali date string: ${input}`);
  }
  const [jy, jm, jd] = parts;
  return jalaliToUTC(jy, jm, jd);
}
