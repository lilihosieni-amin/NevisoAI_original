import {
  formatJalali,
  jalaliToUTC,
  parseJalali,
  toJalali,
  toLatinDigits,
  toPersianDigits,
} from './index';

describe('@neviso/jalali', () => {
  describe('Persian numerals', () => {
    it('converts ASCII digits to Persian', () => {
      expect(toPersianDigits('1404/03/16')).toBe('۱۴۰۴/۰۳/۱۶');
      expect(toPersianDigits(2025)).toBe('۲۰۲۵');
    });

    it('converts Persian (and Arabic-Indic) digits back to ASCII', () => {
      expect(toLatinDigits('۱۴۰۴/۰۳/۱۶')).toBe('1404/03/16');
      expect(toLatinDigits('٠٩١٢')).toBe('0912');
    });
  });

  describe('Gregorian/UTC → Jalali', () => {
    it('maps a known date correctly (2025-06-06 → 1404/03/16)', () => {
      const { jy, jm, jd } = toJalali('2025-06-06T00:00:00.000Z');
      expect([jy, jm, jd]).toEqual([1404, 3, 16]);
    });

    it('formats with Persian numerals by default', () => {
      expect(formatJalali('2025-06-06T00:00:00.000Z')).toBe('۱۴۰۴/۰۳/۱۶');
      expect(formatJalali('2025-06-06T00:00:00.000Z', { withPersianDigits: false })).toBe(
        '1404/03/16',
      );
    });

    it('is timezone-independent (uses UTC components)', () => {
      // Late-UTC instant must not roll the displayed Jalali day.
      expect(formatJalali('2025-06-06T23:30:00.000Z', { withPersianDigits: false })).toBe(
        '1404/03/16',
      );
    });
  });

  describe('Jalali → UTC', () => {
    it('builds a UTC midnight Date', () => {
      const d = jalaliToUTC(1404, 3, 16);
      expect(d.toISOString()).toBe('2025-06-06T00:00:00.000Z');
    });

    it('parses Persian-digit strings', () => {
      expect(parseJalali('۱۴۰۴/۰۳/۱۶').toISOString()).toBe('2025-06-06T00:00:00.000Z');
    });

    it('accepts - and . separators', () => {
      expect(parseJalali('1404-03-16').toISOString()).toBe('2025-06-06T00:00:00.000Z');
      expect(parseJalali('1404.03.16').toISOString()).toBe('2025-06-06T00:00:00.000Z');
    });

    it('rejects malformed input', () => {
      expect(() => parseJalali('not-a-date')).toThrow();
      expect(() => parseJalali('1404/03')).toThrow();
    });
  });

  describe('round-trip', () => {
    it('Shamsi → UTC → Shamsi is stable across a year', () => {
      for (let jm = 1; jm <= 12; jm++) {
        const original = `1404/${String(jm).padStart(2, '0')}/15`;
        const utc = parseJalali(original);
        const back = formatJalali(utc, { withPersianDigits: false });
        expect(back).toBe(original);
      }
    });

    it('UTC → Shamsi → UTC is stable', () => {
      const start = Date.UTC(2025, 0, 1);
      for (let i = 0; i < 365; i += 7) {
        const utc = new Date(start + i * 86_400_000);
        const { jy, jm, jd } = toJalali(utc);
        const back = jalaliToUTC(jy, jm, jd);
        expect(back.toISOString().slice(0, 10)).toBe(utc.toISOString().slice(0, 10));
      }
    });
  });
});
