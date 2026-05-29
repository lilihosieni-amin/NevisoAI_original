import { mapErrorCode, FALLBACK_MESSAGE, ERROR_MESSAGES } from './error-map';

describe('mapErrorCode', () => {
  it('maps a known code to its Persian message', () => {
    expect(mapErrorCode('UNAUTHENTICATED')).toBe(ERROR_MESSAGES.UNAUTHENTICATED);
  });

  it('returns the fallback for an unknown code', () => {
    expect(mapErrorCode('SOME_FUTURE_CODE')).toBe(FALLBACK_MESSAGE);
  });

  it('returns the fallback for missing/null code', () => {
    expect(mapErrorCode(undefined)).toBe(FALLBACK_MESSAGE);
    expect(mapErrorCode(null)).toBe(FALLBACK_MESSAGE);
  });

  it('never returns an English/raw message', () => {
    const msg = mapErrorCode('NETWORK_ERROR');
    // crude check: contains Persian characters
    expect(/[؀-ۿ]/.test(msg)).toBe(true);
  });
});
