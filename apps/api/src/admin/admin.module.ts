import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { OtpModule } from '../otp/otp.module';
import { AdminAuthResolver } from './admin-auth.resolver';
import { AdminAuthService } from './admin-auth.service';
import { AdminTokenService } from './admin-token.service';
import { AuditService } from './audit.service';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { AdminRoleGuard } from './guards/admin-role.guard';

/**
 * Isolated admin (backoffice) module (ARD §5.9, §7.4–7.6). Lives on the same
 * API server but with its own token space. Phase 1 ships the two-step login;
 * later phases add the management resolvers behind the guards exported here.
 */
@Module({
  imports: [JwtModule.register({}), OtpModule],
  providers: [
    AdminAuthService,
    AdminTokenService,
    AuditService,
    AdminAuthResolver,
    AdminAuthGuard,
    AdminRoleGuard,
  ],
  exports: [AdminTokenService, AdminAuthGuard, AdminRoleGuard, AuditService],
})
export class AdminModule {}
