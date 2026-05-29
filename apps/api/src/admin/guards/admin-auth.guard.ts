import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AppError } from '../../common/errors/app.error';
import { ErrorCode } from '../../common/errors/error-codes';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminTokenService } from '../admin-token.service';

/**
 * Protects admin resolvers (ARD §7.6). Requires a valid admin access token
 * (`aud: "admin"`); a missing token is `UNAUTHENTICATED`, while a user token or
 * any otherwise-invalid token is `ADMIN_FORBIDDEN` — so the two token spaces
 * can never cross. Confirms the admin is still active and attaches it.
 */
@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private readonly tokens: AdminTokenService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context).getContext();
    const auth: string | undefined = ctx.req?.headers?.authorization;
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : undefined;
    if (!token) throw new AppError(ErrorCode.UNAUTHENTICATED);

    let payload: Awaited<ReturnType<AdminTokenService['verifyAccess']>>;
    try {
      payload = await this.tokens.verifyAccess(token);
    } catch {
      throw new AppError(ErrorCode.ADMIN_FORBIDDEN);
    }

    const admin = await this.prisma.admin.findUnique({ where: { id: payload.sub } });
    if (!admin || !admin.isActive) throw new AppError(ErrorCode.ADMIN_FORBIDDEN);

    ctx.req.admin = admin;
    return true;
  }
}
