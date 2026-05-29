import { generateOtpCode } from './otp-code.util';

describe('generateOtpCode', () => {
  it('always returns a zero-padded 6-digit string', () => {
    for (let i = 0; i < 2000; i++) {
      const code = generateOtpCode();
      expect(code).toMatch(/^\d{6}$/);
      expect(code.length).toBe(6);
    }
  });
});
