import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';
import { GraphQLFormattedError } from 'graphql';
import { ErrorCode } from './error-codes';

const logger = new Logger('GraphQL');

/**
 * Apollo `formatError` (ARD §16.1). Guarantees every outgoing error is reduced
 * to `{ code, data?, traceId }` and a generic developer `message`:
 *  - the original message + stack are logged with the `traceId`, never returned
 *  - any error without a known `code` becomes `INTERNAL_ERROR`
 *  - safe `data` (for interpolation) is preserved; nothing else leaks
 *
 * The frontend never reads `message`; it maps `code` → Persian (ARD §16.2–3).
 */
export function formatError(
  formatted: GraphQLFormattedError,
  error: unknown,
): GraphQLFormattedError {
  const traceId = randomUUID().slice(0, 8);
  const ext = (formatted.extensions ?? {}) as Record<string, unknown>;

  // Apollo wraps thrown errors; validation/syntax errors carry their own codes.
  const rawCode = typeof ext.code === 'string' ? ext.code : undefined;
  const knownCode = rawCode && isCatalogCode(rawCode) ? rawCode : undefined;

  // Treat GraphQL request validation errors (bad query, bad variables) as a
  // client error code rather than INTERNAL_ERROR, but still strip the detail.
  const validationCodes = ['GRAPHQL_VALIDATION_FAILED', 'BAD_USER_INPUT', 'GRAPHQL_PARSE_FAILED'];
  const code =
    knownCode ??
    (rawCode && validationCodes.includes(rawCode) ? rawCode : ErrorCode.INTERNAL_ERROR);

  logger.error(
    `traceId=${traceId} code=${code} message=${formatted.message}`,
    error instanceof Error ? error.stack : undefined,
  );

  const data = ext.data;
  return {
    message: code === ErrorCode.INTERNAL_ERROR ? 'Internal error' : code,
    extensions: { code, traceId, ...(data ? { data } : {}) },
  };
}

const CATALOG = new Set<string>(Object.values(ErrorCode));
function isCatalogCode(code: string): boolean {
  return CATALOG.has(code);
}
