import {
  normalizeMobile,
  isValidMobile,
  toBaleMsisdn,
  toSmsDestination,
  formatMobileForDisplay,
  toAsciiDigits,
  toPersianDigits,
} from './index';

describe('normalizeMobile', () => {
  it.each([
    ['9123456789', '9123456789'], // already canonical
    ['09123456789', '9123456789'], // leading zero
    ['+989123456789', '9123456789'], // +98
    ['989123456789', '9123456789'], // 98
    ['00989123456789', '9123456789'], // 0098
    ['0912 345 6789', '9123456789'], // spaces
    ['0912-345-6789', '9123456789'], // dashes
    ['۰۹۱۲۳۴۵۶۷۸۹', '9123456789'], // Persian digits
  ])('normalizes %s → %s', (input, expected) => {
    expect(normalizeMobile(input)).toBe(expected);
  });

  it.each([
    ['', null],
    ['912345678', null], // 9 digits
    ['91234567890', null], // 11 digits, no leading 0
    ['8123456789', null], // does not start with 9
    ['1234567890', null],
    ['abcdefghij', null],
  ])('rejects %s', (input, expected) => {
    expect(normalizeMobile(input)).toBe(expected);
  });

  it('does not strip a valid number that happens to start with 98', () => {
    // 9812345678 is a valid 10-digit mobile — the 98 is NOT a country code here.
    expect(normalizeMobile('9812345678')).toBe('9812345678');
  });
});

describe('isValidMobile', () => {
  it('is true for valid input and false otherwise', () => {
    expect(isValidMobile('09123456789')).toBe(true);
    expect(isValidMobile('123')).toBe(false);
  });
});

describe('provider formats', () => {
  it('formats for SMS (bare 10 digits)', () => {
    expect(toSmsDestination('09123456789')).toBe('9123456789');
  });
  it('formats for Bale (98 + 10 digits)', () => {
    expect(toBaleMsisdn('09123456789')).toBe('989123456789');
  });
  it('throws on invalid input', () => {
    expect(() => toBaleMsisdn('123')).toThrow();
    expect(() => toSmsDestination('123')).toThrow();
  });
});

describe('display + digit helpers', () => {
  it('groups + Persian-izes for display', () => {
    expect(formatMobileForDisplay('9123456789')).toBe('۹۱۲ ۳۴۵ ۶۷۸۹');
  });
  it('converts digit scripts', () => {
    expect(toAsciiDigits('۰۹۸')).toBe('098');
    expect(toPersianDigits('60')).toBe('۶۰');
  });
});
