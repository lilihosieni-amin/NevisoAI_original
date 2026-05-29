import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AppError } from '../../common/errors/app.error';
import { ErrorCode } from '../../common/errors/error-codes';

/**
 * Confirms an authenticated user is present before owner-scoped resolvers run
 * (ARD §7.3). The concrete record→owner comparison happens in each service via
 * `assertOwnership` once the resource is loaded (the guard can't know which
 * model an arbitrary resolver touches); this guard guarantees the identity is
 * established so that check has a subject. Used from Phase 2 onward together
 * with `GqlAuthGuard`.
 */
@Injectable()
export class GqlOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context).getContext();
    if (!ctx.req?.user) throw new AppError(ErrorCode.UNAUTHENTICATED);
    return true;
  }
}
