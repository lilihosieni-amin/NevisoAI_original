import { AppError } from '../common/errors/app.error';
import { ErrorCode } from '../common/errors/error-codes';

/**
 * Central ownership check for every user-scoped operation (ARD §6.4.2 /
 * global conventions). Services call this after loading a resource to confirm
 * it belongs to the current user; a mismatch is a `FORBIDDEN`. Phase 2+
 * resolvers rely on it; isolating it here keeps the rule in one place and unit
 * testable.
 */
export function assertOwnership(resourceUserId: string, currentUserId: string): void {
  if (resourceUserId !== currentUserId) throw new AppError(ErrorCode.FORBIDDEN);
}
