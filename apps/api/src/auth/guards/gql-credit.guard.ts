import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { Request } from 'express';
import { ErrorCode } from '@neviso/errors';
import { AppError } from '../../common/errors/app-error';
import type { AuthenticatedUser } from '../jwt-payload';

/**
 * Pre-checks credit balance before upload/chat mutations (ARD §7.3).
 *
 * Shell for Step 1: it ensures the principal is present. The actual
 * cost-vs-balance check (with `INSUFFICIENT_CREDITS`) is implemented in the
 * upload (Step 4) and chat (Step 7) slices, which know the per-action cost.
 */
@Injectable()
export class GqlCreditGuard implements CanActivate {
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
