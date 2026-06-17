import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { Request } from 'express';
import { ErrorCode } from '@neviso/errors';
import { AppError } from '../../common/errors/app-error';
import type { AuthenticatedUser } from '../jwt-payload';

/**
 * Confirms an authenticated principal is present before owner-scoped resolvers
 * run. Per-resource ownership (e.g. "this folder belongs to this user") is
 * asserted inside services from the relevant slice onward; this guard is the
 * authentication precondition for those checks.
 */
@Injectable()
export class GqlOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = GqlExecutionContext.create(context).getContext().req as Request & {
      user?: AuthenticatedUser;
    };
    if (!req.user) {
      throw new AppError(ErrorCode.UNAUTHENTICATED);
    }
    return true;
  }
}
