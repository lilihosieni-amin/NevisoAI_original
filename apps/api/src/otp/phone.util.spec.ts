import { AppError } from '../common/errors/app.error';
import {
  isValidMobile,
  maskMobile,
  normalizeMobile,
  toBalePhone,
  toSmsDestination,
} from './phone.util';

describe('phone.util', () => {
  describe('normalizeMobile — accepted variants fold to 09XXXXXXXXX', () => {
    it.each([
      ['09121234567', '09121234567'],
      ['9121234567', '09121234567'],
      ['989121234567', '09121234567'],
      ['00989121234567', '09121234567'],
      ['+98 912 123 4567', '09121234567'],
      ['0912-123-4567', '09121234567'],
    ])('%s -> %s', (input, expected) => {
      expect(normalizeMobile(input)).toBe(expected);
    });
  });

  describe('normalizeMobile — invalid inputs throw INVALID_MOBILE', () => {
    it.each([
      '',
      '12345',
      '0812345678',
      '0912123456',
      '091212345678',
      'abcdefghijk',
      '02112345678',
    ])('rejects %s', (input) => {
      expect(() => normalizeMobile(input)).toThrow(AppError);
    });
  });

  it('isValidMobile reflects normalize success', () => {
    expect(isValidMobile('09121234567')).toBe(true);
    expect(isValidMobile('123')).toBe(false);
  });

  it('toBalePhone produces 98XXXXXXXXXX (no leading zero)', () => {
    expect(toBalePhone('09121234567')).toBe('989121234567');
  });

  it('toSmsDestination drops the leading zero as a number', () => {
    expect(toSmsDestination('09121234567')).toBe(9121234567);
  });

  it('maskMobile hides the middle digits', () => {
    expect(maskMobile('09121234567')).toBe('0912****567');
  });
});
