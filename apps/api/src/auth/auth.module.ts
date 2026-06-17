import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { GqlOwnerGuard } from './guards/gql-owner.guard';
import { GqlCreditGuard } from './guards/gql-credit.guard';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { OtpService } from './otp/otp.service';
import { SmsWebServiceSender } from './otp/sms-webservice.sender';
import { BaleSender } from './otp/bale.sender';

/**
 * Auth slice (Step 2 / ARD §5.2, §7.1–7.3). Provides the JWT module, the
 * user-side guards (used app-wide), and the OTP + token + password machinery
 * behind the auth resolver.
 */
@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [
    GqlAuthGuard,
    GqlOwnerGuard,
    GqlCreditGuard,
    AuthResolver,
    AuthService,
    TokenService,
    OtpService,
    SmsWebServiceSender,
    BaleSender,
  ],
  exports: [JwtModule, GqlAuthGuard, GqlOwnerGuard, GqlCreditGuard],
})
export class AuthModule {}
