import { isValidIranMobile, normalizeIranMobile, toEnglishDigits, toPersianDigits } from './mobile';

describe('mobile helpers', () => {
  it('validates Iranian mobiles (ASCII and Persian digits)', () => {
    expect(isValidIranMobile('09121234567')).toBe(true);
    expect(isValidIranMobile('۰۹۱۲۱۲۳۴۵۶۷')).toBe(true);
    expect(isValidIranMobile('0912 123 4567')).toBe(true);
    expect(isValidIranMobile('12345')).toBe(false);
    expect(isValidIranMobile('08123456789')).toBe(false);
    expect(isValidIranMobile('')).toBe(false);
  });

  it('normalizes any digit script to 09XXXXXXXXX', () => {
    expect(normalizeIranMobile('۰۹۱۲۱۲۳۴۵۶۷')).toBe('09121234567');
    expect(normalizeIranMobile('0912-123-4567')).toBe('09121234567');
  });

  it('converts between Persian and English digits', () => {
    expect(toPersianDigits('09121234567')).toBe('۰۹۱۲۱۲۳۴۵۶۷');
    expect(toEnglishDigits('۱۲۳')).toBe('123');
  });
});
