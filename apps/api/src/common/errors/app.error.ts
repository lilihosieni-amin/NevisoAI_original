import { GraphQLError } from 'graphql';
import type { ErrorCodeValue } from './error-codes';

/**
 * The single exception type thrown across the API. It carries a stable
 * `extensions.code` (ARD §16.1) and optional safe `data` for interpolation.
 * The human `message` is for logs only — it is never shown to users; the
 * frontend renders Persian based purely on `code`.
 */
export class AppError extends GraphQLError {
  constructor(code: ErrorCodeValue, data?: Record<string, unknown>, logMessage?: string) {
    super(logMessage ?? code, { extensions: { code, ...(data ? { data } : {}) } });
    this.name = 'AppError';
  }
}
