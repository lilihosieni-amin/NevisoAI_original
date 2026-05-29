import type { User as UserEntity } from '@neviso/db';
import { User } from './models/user.model';

/** Maps the Prisma user row to the public GraphQL profile (never leaks the hash). */
export function toUserModel(u: UserEntity): User {
  return {
    id: u.id,
    mobile: u.mobile,
    displayName: u.displayName ?? undefined,
    avatarUrl: u.avatarUrl ?? undefined,
    creditBalance: u.creditBalance,
    status: u.status,
    preferredOtpChannel: u.preferredOtpChannel ?? undefined,
    hasPassword: Boolean(u.passwordHash),
    createdAt: u.createdAt,
  };
}
