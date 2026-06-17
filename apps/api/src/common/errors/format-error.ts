import { randomUUID } from 'node:crypto';
import type { GraphQLFormattedError } from 'graphql';
import { ErrorCode, isErrorCode } from '@neviso/errors';

/**
 * Central Apollo `formatError` (ARD §16.1).
 *
 * Guarantees that every outgoing error is `{ code, data?, traceId }`:
 *  - strips stack traces and internal messages in production,
 *  - guarantees a stable `code` (unknown/unhandled → INTERNAL_ERROR),
 *  - attaches a `traceId` correlating to the full server-side log,
 *  - logs the original error (server-side only).
 *
 * The top-level `message` is for developers/logs only and is never displayed —
 * the frontend renders the Persian message it looks up from `code`.
 */
export function formatError(
  formattedError: GraphQLFormattedError,
  originalError: unknown,
): GraphQLFormattedError {
  const traceId = randomUUID().slice(0, 8);

  const rawCode = formattedError.extensions?.code;
  const code = isErrorCode(rawCode) ? (rawCode as ErrorCode) : ErrorCode.INTERNAL_ERROR;

  // Only `data` from a known AppError is safe to forward.
  const data = code !== ErrorCode.INTERNAL_ERROR ? formattedError.extensions?.data : undefined;

  // Full error → server logs only (never to the client).
  // eslint-disable-next-line no-console
  console.error(
    JSON.stringify({
      level: 'error',
      traceId,
      code,
      message: formattedError.message,
      detail: originalError instanceof Error ? originalError.stack : String(originalError),
    }),
  );

  return {
    message: code, // developer/log facing; the client maps `code` → Persian
    extensions: {
      code,
      ...(data !== undefined ? { data } : {}),
      traceId,
    },
  };
}
