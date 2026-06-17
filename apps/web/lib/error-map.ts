import { persianMessageFor } from '@neviso/errors';

/**
 * Map a server error `code` (from `extensions.code`) to its Persian message.
 * Unknown/missing codes fall back to the generic Persian message — a raw error
 * never reaches the screen (ARD §16.2).
 */
export function toPersianMessage(code: unknown): string {
  return persianMessageFor(code);
}
