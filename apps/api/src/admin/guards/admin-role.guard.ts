import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Admin, AdminRole } from '@neviso/db';
import { AppError } from '../../common/errors/app.error';
import { ErrorCode } from '../../common/errors/error-codes';
import { REQUIRE_ROLE_KEY, ROLE_RANK } from '../decorators/require-role';

/**
 * Enforces `@RequireRole` (ARD §7.6). Runs after `AdminAuthGuard`, so the admin
 * is on the request. A role below the required rank → `ADMIN_FORBIDDEN`.
 */
@Injectable()
export class AdminRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<AdminRole | undefined>(REQUIRE_ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required) return true;

    const ctx = GqlExecutionContext.create(context).getContext();
    const admin = ctx.req?.admin as Admin | undefined;
    if (!admin) throw new AppError(ErrorCode.ADMIN_FORBIDDEN);
    if (ROLE_RANK[admin.role] < ROLE_RANK[required]) throw new AppError(ErrorCode.ADMIN_FORBIDDEN);
    return true;
  }
}
