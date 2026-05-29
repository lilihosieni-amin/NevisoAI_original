/** Iranian-mobile validation + Persian-digit helpers for the auth UI. */

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

/** Converts ASCII digits in a string to Persian digits (for display). */
export function toPersianDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

/** Folds Persian/Arabic digits back to ASCII (for input parsing). */
export function toEnglishDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

/** True when `value` (any digit script) is a valid 09XXXXXXXXX mobile. */
export function isValidIranMobile(value: string): boolean {
  const digits = toEnglishDigits(value).replace(/[^\d]/g, '');
  return /^09\d{9}$/.test(digits);
}

/** Normalizes user input to the canonical 09XXXXXXXXX form sent to the API. */
export function normalizeIranMobile(value: string): string {
  return toEnglishDigits(value).replace(/[^\d]/g, '');
}
