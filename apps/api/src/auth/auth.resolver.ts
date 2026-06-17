import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { TokenService, REFRESH_COOKIE } from './token.service';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { CurrentUser } from './current-user.decorator';
import type { AuthenticatedUser } from './jwt-payload';
import { AuthTokens, OtpChannel, OtpResponse } from './dto/auth.types';

type GqlContext = { req: Request & { cookies?: Record<string, string> }; res: Response };

@Resolver()
export class AuthResolver {
  constructor(
    private readonly auth: AuthService,
    private readonly tokens: TokenService,
  ) {}

  @Query(() => [OtpChannel], { description: 'OTP channels the admin has enabled (public).' })
  otpChannels(): Promise<OtpChannel[]> {
    return this.auth.enabledChannels();
  }

  @Mutation(() => OtpResponse, { description: 'Send an OTP to a mobile number.' })
  requestOtp(
    @Args('mobile') mobile: string,
    @Args('channel', { type: () => OtpChannel, nullable: true }) channel?: OtpChannel,
  ): Promise<OtpResponse> {
    return this.auth.requestOtp(mobile, channel);
  }

  @Mutation(() => AuthTokens, { description: 'Verify an OTP and sign in (creates the account on first use).' })
  async verifyOtp(
    @Args('mobile') mobile: string,
    @Args('code') code: string,
    @Context() ctx: GqlContext,
  ): Promise<AuthTokens> {
    const { accessToken, refreshToken, isNewUser } = await this.auth.verifyOtp(mobile, code);
    this.tokens.setRefreshCookie(ctx.res, refreshToken);
    return { accessToken, isNewUser };
  }

  @Mutation(() => AuthTokens, { description: 'Sign in with mobile + password.' })
  async login(
    @Args('mobile') mobile: string,
    @Args('password') password: string,
    @Context() ctx: GqlContext,
  ): Promise<AuthTokens> {
    const { accessToken, refreshToken, isNewUser } = await this.auth.login(mobile, password);
    this.tokens.setRefreshCookie(ctx.res, refreshToken);
    return { accessToken, isNewUser };
  }

  @Mutation(() => AuthTokens, { description: 'Rotate the refresh cookie and mint a new access token.' })
  async refreshToken(@Context() ctx: GqlContext): Promise<AuthTokens> {
    const current = ctx.req.cookies?.[REFRESH_COOKIE];
    const { accessToken, refreshToken, userId } = await this.tokens.rotate(current);
    await this.auth.assertActiveById(userId); // a ban mid-session ends here
    this.tokens.setRefreshCookie(ctx.res, refreshToken);
    return { accessToken, isNewUser: false };
  }

  @Mutation(() => Boolean, { description: 'Revoke the refresh token and clear the cookie.' })
  async logout(@Context() ctx: GqlContext): Promise<boolean> {
    await this.tokens.revokeFromToken(ctx.req.cookies?.[REFRESH_COOKIE]);
    this.tokens.clearRefreshCookie(ctx.res);
    return true;
  }

  @Mutation(() => Boolean, { description: 'Set or change the account password.' })
  @UseGuards(GqlAuthGuard)
  changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Args('newPassword') newPassword: string,
    @Args('currentPassword', { nullable: true }) currentPassword?: string,
  ): Promise<boolean> {
    return this.auth.changePassword(user.id, newPassword, currentPassword);
  }

  @Query(() => Int, { description: "The signed-in user's current credit balance." })
  @UseGuards(GqlAuthGuard)
  myCredits(@CurrentUser() user: AuthenticatedUser): Promise<number> {
    return this.auth.creditBalance(user.id);
  }
}
