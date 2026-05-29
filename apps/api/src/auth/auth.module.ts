import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { OtpModule } from '../otp/otp.module';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { GqlOwnerGuard } from './guards/gql-owner.guard';
import { TokenService } from './token.service';

/**
 * User authentication module (ARD §5.2, §7.1–7.3). Imports './models/enums'
 * for the side-effecting GraphQL enum registration.
 */
import './models/enums';

@Module({
  imports: [JwtModule.register({}), OtpModule],
  providers: [AuthService, TokenService, AuthResolver, GqlAuthGuard, GqlOwnerGuard],
  exports: [TokenService, GqlAuthGuard, GqlOwnerGuard],
})
export class AuthModule {}
