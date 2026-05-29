import { UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Args, Context, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { Request, Response } from 'express';
import type { Admin } from '@neviso/db';
import { ADMIN_REFRESH_COOKIE, clearRefreshCookie, setRefreshCookie } from '../auth/cookie.util';
import { durationToMs } from '../auth/duration.util';
import { AdminAuthService, AdminIssuedTokens } from './admin-auth.service';
import { CurrentAdmin } from './current-admin.decorator';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { AdminAuthTokens, AdminLoginChallenge, AdminProfile } from './models/admin.models';

interface GqlContext {
  req: Request;
  res: Response;
}

function clientIp(req: Request): string | undefined {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string') return fwd.split(',')[0]?.trim();
  return req.ip;
}

@Resolver()
export class AdminAuthResolver {
  constructor(
    private readonly auth: AdminAuthService,
    private readonly config: ConfigService,
  ) {}

  @Query(() => AdminProfile, {
    description: "The signed-in admin's own profile (validates an admin session).",
  })
  @UseGuards(AdminAuthGuard)
  adminMe(@CurrentAdmin() admin: Admin): AdminProfile {
    return { id: admin.id, email: admin.email, displayName: admin.displayName, role: admin.role };
  }

  @Mutation(() => AdminLoginChallenge)
  adminLoginStep1(
    @Args('email') email: string,
    @Args('password') password: string,
    @Context() ctx: GqlContext,
  ): Promise<AdminLoginChallenge> {
    return this.auth.loginStep1(email, password, clientIp(ctx.req));
  }

  @Mutation(() => AdminAuthTokens)
  async adminLoginStep2(
    @Args('challengeId', { type: () => ID }) challengeId: string,
    @Args('code') code: string,
    @Context() ctx: GqlContext,
  ): Promise<AdminAuthTokens> {
    const tokens = await this.auth.loginStep2(challengeId, code, clientIp(ctx.req));
    this.setRefresh(ctx.res, tokens);
    return this.toGql(tokens);
  }

  @Mutation(() => AdminAuthTokens)
  async adminRefreshToken(@Context() ctx: GqlContext): Promise<AdminAuthTokens> {
    const current = ctx.req.cookies?.[ADMIN_REFRESH_COOKIE] as string | undefined;
    const tokens = await this.auth.refresh(current);
    this.setRefresh(ctx.res, tokens);
    return this.toGql(tokens);
  }

  @Mutation(() => Boolean)
  async adminLogout(@Context() ctx: GqlContext): Promise<boolean> {
    const current = ctx.req.cookies?.[ADMIN_REFRESH_COOKIE] as string | undefined;
    await this.auth.logout(current);
    clearRefreshCookie(ctx.res, ADMIN_REFRESH_COOKIE, Boolean(this.config.get('isProduction')));
    return true;
  }

  private toGql(tokens: AdminIssuedTokens): AdminAuthTokens {
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      admin: {
        id: tokens.admin.id,
        email: tokens.admin.email,
        displayName: tokens.admin.displayName,
        role: tokens.admin.role,
      },
    };
  }

  private setRefresh(res: Response, tokens: AdminIssuedTokens): void {
    const maxAge = durationToMs(this.config.get<string>('adminJwt.refreshExpires') ?? '8h');
    setRefreshCookie(
      res,
      ADMIN_REFRESH_COOKIE,
      tokens.refreshToken,
      maxAge,
      Boolean(this.config.get('isProduction')),
    );
  }
}
