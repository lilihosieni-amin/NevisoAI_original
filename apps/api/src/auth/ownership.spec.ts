import { AppError } from '../common/errors/app.error';
import { ErrorCode } from '../common/errors/error-codes';
import { assertOwnership } from './ownership';

describe('assertOwnership', () => {
  it('passes when the resource belongs to the user', () => {
    expect(() => assertOwnership('u1', 'u1')).not.toThrow();
  });

  it('throws FORBIDDEN when it does not', () => {
    try {
      assertOwnership('u1', 'u2');
      fail('expected throw');
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).extensions.code).toBe(ErrorCode.FORBIDDEN);
    }
  });
});
