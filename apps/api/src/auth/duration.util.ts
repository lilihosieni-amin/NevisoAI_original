/**
 * Parses a JWT-style duration string (e.g. `15m`, `8h`, `30d`, `120s`) into
 * milliseconds — used to set cookie `maxAge` so it matches the token TTL.
 * Bare numbers are treated as seconds (jsonwebtoken's convention).
 */
export function durationToMs(value: string): number {
  const match = /^(\d+)\s*(ms|s|m|h|d)?$/.exec(value.trim());
  if (!match) throw new Error(`invalid duration: ${value}`);
  const n = parseInt(match[1], 10);
  switch (match[2]) {
    case 'ms':
      return n;
    case 'm':
      return n * 60_000;
    case 'h':
      return n * 3_600_000;
    case 'd':
      return n * 86_400_000;
    case 's':
    case undefined:
    default:
      return n * 1000;
  }
}
