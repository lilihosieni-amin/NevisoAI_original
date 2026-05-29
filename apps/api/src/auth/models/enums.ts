import { registerEnumType } from '@nestjs/graphql';
import { OtpChannel, UserStatus } from '@neviso/db';

// Re-export the Prisma enums into the GraphQL schema (single source of truth).
registerEnumType(OtpChannel, { name: 'OtpChannel' });
registerEnumType(UserStatus, { name: 'UserStatus' });

export { OtpChannel, UserStatus };
