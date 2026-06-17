import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { GqlOwnerGuard } from './guards/gql-owner.guard';
import { GqlCreditGuard } from './guards/gql-credit.guard';

/**
 * Auth foundation (ARD §7). Provides the JWT module and the user-side guards.
 * Feature resolvers come per slice; the guards are ready to attach now.
 */
@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [GqlAuthGuard, GqlOwnerGuard, GqlCreditGuard],
  exports: [JwtModule, GqlAuthGuard, GqlOwnerGuard, GqlCreditGuard],
})
export class AuthModule {}
