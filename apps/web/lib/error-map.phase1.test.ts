import { ERROR_MESSAGES, extractErrorCode, mapErrorCode } from './error-map';

describe('error-map (Phase 1 codes)', () => {
  it.each([
    'OTP_INVALID',
    'OTP_EXPIRED',
    'OTP_TOO_SOON',
    'OTP_CHANNEL_REQUIRED',
    'OTP_BALE_NO_ACCOUNT',
    'OTP_PROVIDER_UNAVAILABLE',
    'ACCOUNT_SUSPENDED',
    'ACCOUNT_BANNED',
  ])('maps %s to a Persian message', (code) => {
    const msg = mapErrorCode(code);
    expect(msg).toBe(ERROR_MESSAGES[code]);
    expect(/[؀-ۿ]/.test(msg)).toBe(true);
  });

  it('extractErrorCode reads the first GraphQL error code', () => {
    expect(extractErrorCode({ graphQLErrors: [{ extensions: { code: 'OTP_INVALID' } }] })).toBe(
      'OTP_INVALID',
    );
  });

  it('extractErrorCode falls back to NETWORK_ERROR on a network error', () => {
    expect(extractErrorCode({ networkError: new Error('down') })).toBe('NETWORK_ERROR');
  });
});
