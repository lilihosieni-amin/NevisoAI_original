import { persianMessageFor } from '@neviso/errors';

/** Map a server error `code` to its Persian message (ARD §16.2). */
export function toPersianMessage(code: unknown): string {
  return persianMessageFor(code);
}
