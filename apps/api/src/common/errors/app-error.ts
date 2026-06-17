import { GraphQLError } from 'graphql';
import { ErrorCode } from '@neviso/errors';

/**
 * The one error type the app throws (ARD §16.1). It carries a stable `code`
 * plus optional safe `data` for interpolation; the central `formatError`
 * sanitizes everything else. Throw `new AppError(ErrorCode.X, data?)` from any
 * resolver/service — never leak a raw exception to the client.
 */
export class AppError extends GraphQLError {
  constructor(
    public readonly code: ErrorCode,
    public readonly data?: Record<string, unknown>,
  ) {
    super(code, { extensions: { code, data } });
    this.name = 'AppError';
  }
}
