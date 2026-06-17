import {
  ErrorCode,
  FALLBACK_ERROR_CODE,
  isErrorCode,
  persianCatalog,
  persianMessageFor,
} from './index';

describe('@neviso/errors catalog', () => {
  it('has a non-empty Persian entry for every ErrorCode', () => {
    for (const code of Object.values(ErrorCode)) {
      const message = persianCatalog[code];
      expect(typeof message).toBe('string');
      expect(message.trim().length).toBeGreaterThan(0);
    }
  });

  it('only contains Persian text (no Latin letters) in messages', () => {
    for (const message of Object.values(persianCatalog)) {
      // nevisoai.ir etc. would be a leak; messages must be Persian-only.
      expect(message).not.toMatch(/[A-Za-z]/);
    }
  });

  it('falls back to INTERNAL_ERROR for unknown codes', () => {
    expect(persianMessageFor('SOMETHING_UNKNOWN')).toBe(persianCatalog[FALLBACK_ERROR_CODE]);
    expect(persianMessageFor(undefined)).toBe(persianCatalog[ErrorCode.INTERNAL_ERROR]);
    expect(persianMessageFor(null)).toBe(persianCatalog[ErrorCode.INTERNAL_ERROR]);
  });

  it('resolves a known code to its exact message', () => {
    expect(persianMessageFor(ErrorCode.OTP_INVALID)).toBe(persianCatalog[ErrorCode.OTP_INVALID]);
  });

  it('isErrorCode recognizes valid and rejects invalid codes', () => {
    expect(isErrorCode(ErrorCode.FORBIDDEN)).toBe(true);
    expect(isErrorCode('NOPE')).toBe(false);
    expect(isErrorCode(42)).toBe(false);
  });
});
