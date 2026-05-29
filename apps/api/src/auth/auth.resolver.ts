import { UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { Request, Response } from 'express';
import { User as UserEntity } from '@neviso/db';
import { PrismaService } from '../prisma/prisma.service';
import { OtpChannelService } from '../otp/otp-channel.service';
import { AuthService, IssuedTokens } from './auth.service';
import { clearRefreshCookie, setRefreshCookie, USER_REFRESH_COOKIE } from './cookie.util';
import { CurrentUser } from './current-user.decorator';
import { ChangePasswordInput, UpdateProfileInput } from './dto/auth.inputs';
import { durationToMs } from './duration.util';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { AuthTokens, OtpResponse } from './models/auth.models';
import { OtpChannel } from './models/enums';
import { User } from './models/user.model';
import { toUserModel } from './user.mapper';

interface GqlContext {
  req: Request & { user?: UserEntity };
  res: Response;
}

@Resolver()
export class AuthResolver {
  constructor(
    private readonly auth: AuthService,
    private readonly channels: OtpChannelService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  // ── Public ─────────────────────────────────────────────────────────────
  @Query(() => [OtpChannel], {
    description: 'OTP channels the admin has enabled (login UI shows a picker only when >1).',
  })
  otpChannels(): Promise<OtpChannel[]> {
    return this.channels.enabledChannels();
  }

  @Mutation(() => OtpResponse)
  requestOtp(
    @Args('mobile') mobile: string,
    @Args('channel', { type: () => OtpChannel, nullable: true }) channel?: OtpChannel,
  ): Promise<OtpResponse> {
    return this.auth.requestOtp(mobile, channel);
  }

  @Mutation(() => AuthTokens)
  async verifyOtp(
    @Args('mobile') mobile: string,
    @Args('code') code: string,
    @Context() ctx: GqlContext,
  ): Promise<AuthTokens> {
    const tokens = await this.auth.verifyOtp(mobile, code);
    this.setRefresh(ctx.res, tokens);
    return tokens;
  }

  @Mutation(() => AuthTokens)
  async login(
    @Args('mobile') mobile: string,
    @Args('password') password: string,
    @Context() ctx: GqlContext,
  ): Promise<AuthTokens> {
    const tokens = await this.auth.login(mobile, password);
    this.setRefresh(ctx.res, tokens);
    return tokens;
  }

  @Mutation(() => AuthTokens)
  async refreshToken(@Context() ctx: GqlContext): Promise<AuthTokens> {
    const current = ctx.req.cookies?.[USER_REFRESH_COOKIE] as string | undefined;
    const tokens = await this.auth.refresh(current);
    this.setRefresh(ctx.res, tokens);
    return tokens;
  }

  @Mutation(() => Boolean)
  async logout(@Context() ctx: GqlContext): Promise<boolean> {
    const current = ctx.req.cookies?.[USER_REFRESH_COOKIE] as string | undefined;
    await this.auth.logout(current);
    clearRefreshCookie(ctx.res, USER_REFRESH_COOKIE, Boolean(this.config.get('isProduction')));
    return true;
  }

  // ── Authenticated ───────────────────────────────────────────────────────
  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  me(@CurrentUser() user: UserEntity): User {
    return toUserModel(user);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async updateProfile(
    @CurrentUser() user: UserEntity,
    @Args('input') input: UpdateProfileInput,
  ): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { displayName: input.displayName, avatarUrl: input.avatarUrl },
    });
    return toUserModel(updated);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async changePassword(
    @CurrentUser() user: UserEntity,
    @Args('input') input: ChangePasswordInput,
  ): Promise<boolean> {
    await this.auth.changePassword(user.id, input.currentPassword, input.newPassword);
    return true;
  }

  private setRefresh(res: Response, tokens: IssuedTokens): void {
    const maxAge = durationToMs(this.config.get<string>('jwt.refreshExpires') ?? '30d');
    setRefreshCookie(
      res,
      USER_REFRESH_COOKIE,
      tokens.refreshToken,
      maxAge,
      Boolean(this.config.get('isProduction')),
    );
  }
}
