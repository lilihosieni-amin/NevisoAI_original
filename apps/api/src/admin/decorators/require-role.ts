import { SetMetadata } from '@nestjs/common';
import { AdminRole } from '@neviso/db';

export const REQUIRE_ROLE_KEY = 'requireRole';

/** Minimum admin role for a resolver (SUPER_ADMIN ⊃ ADMIN ⊃ SUPPORT). */
export const RequireRole = (role: AdminRole) => SetMetadata(REQUIRE_ROLE_KEY, role);

/** Higher number = more privilege. Used to compare actual vs required. */
export const ROLE_RANK: Record<AdminRole, number> = {
  SUPPORT: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};
