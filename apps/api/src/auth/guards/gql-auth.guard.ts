import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { ErrorCode } from '@neviso/errors';
import { UserStatus } from '@neviso/db';
import { AppError } from '../../common/errors/app-error';
import { PrismaService } from '../../common/prisma.service';
import { AppConfigService } from '../../config/app-config.service';
import type { AuthenticatedUser, UserJwtPayload } from '../jwt-payload';

/**
 * Validates a user access token on protected resolvers (ARD §7.3):
 *  - verifies with the USER access secret (admin tokens, signed with a
 *    different secret, fail here),
 *  - rejects any token carrying `aud: "admin"`,
 *  - rejects SUSPENDED / BANNED accounts,
 *  - attaches the authenticated user to the request.
 *
 * Wired now; resolvers attach it per slice from Step 2 onward.
 */
@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = GqlExecutionContext.create(context).getContext().req as Request;
    const token = this.extractToken(req);
    if (!token) {
      throw new AppError(ErrorCode.UNAUTHENTICATED);
    }

    let payload: UserJwtPayload;
    try {
      payload = await this.jwt.verifyAsync<UserJwtPayload>(token, {
        secret: this.config.env.JWT_ACCESS_SECRET,
      });
    } catch {
      throw new AppError(ErrorCode.UNAUTHENTICATED);
    }

    if (payload.aud === 'admin') {
      throw new AppError(ErrorCode.UNAUTHENTICATED);
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      throw new AppError(ErrorCode.UNAUTHENTICATED);
    }

    if (user.status === UserStatus.BANNED) {
      throw new AppError(ErrorCode.ACCOUNT_BANNED);
    }
    if (user.status === UserStatus.SUSPENDED) {
      const stillSuspended = !user.suspendedUntil || user.suspendedUntil.getTime() > Date.now();
      if (stillSuspended) {
        throw new AppError(ErrorCode.ACCOUNT_SUSPENDED);
      }
    }

    const principal: AuthenticatedUser = {
      id: user.id,
      mobile: user.mobile,
      status: user.status,
      impersonatorAdminId: payload.act?.adminId,
    };
    (req as Request & { user?: AuthenticatedUser }).user = principal;
    return true;
  }

  private extractToken(req: Request): string | null {
    const header = req.headers?.authorization;
    if (!header) return null;
    const [scheme, value] = header.split(' ');
    return scheme === 'Bearer' && value ? value : null;
  }
}
