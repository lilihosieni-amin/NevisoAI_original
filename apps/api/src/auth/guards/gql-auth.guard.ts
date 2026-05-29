import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserStatus } from '@neviso/db';
import { AppError } from '../../common/errors/app.error';
import { ErrorCode } from '../../common/errors/error-codes';
import { PrismaService } from '../../prisma/prisma.service';
import { TokenService } from '../token.service';

/**
 * Protects user resolvers (ARD §7.3). Validates the access token, rejects any
 * admin-audience token, loads the user and enforces account status: an active
 * suspension → `ACCOUNT_SUSPENDED`, a ban → `ACCOUNT_BANNED`. The loaded user
 * (and any impersonation `act` claim) is attached to the request.
 */
@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(
    private readonly tokens: TokenService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context).getContext();
    const auth: string | undefined = ctx.req?.headers?.authorization;
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : undefined;
    if (!token) throw new AppError(ErrorCode.UNAUTHENTICATED);

    let payload: Awaited<ReturnType<TokenService['verifyAccess']>>;
    try {
      payload = await this.tokens.verifyAccess(token);
    } catch {
      throw new AppError(ErrorCode.UNAUTHENTICATED);
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new AppError(ErrorCode.UNAUTHENTICATED);

    if (user.status === UserStatus.BANNED) throw new AppError(ErrorCode.ACCOUNT_BANNED);
    if (user.status === UserStatus.SUSPENDED) {
      const lapsed = user.suspendedUntil && user.suspendedUntil.getTime() < Date.now();
      if (!lapsed) throw new AppError(ErrorCode.ACCOUNT_SUSPENDED);
    }

    ctx.req.user = user;
    ctx.req.impersonator = payload.act ?? null;
    return true;
  }
}
