import { Injectable } from '@nestjs/common';
import { AuditAction, Prisma } from '@neviso/db';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Append-only audit writer (ARD §7.6). Phase 1 only records `ADMIN_LOGIN`;
 * Phase 8 adds the `AuditInterceptor` that records every state-changing admin
 * op centrally. Audit rows are never updated or deleted.
 */
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(params: {
    adminId: string;
    action: AuditAction;
    targetType: string;
    targetId?: string;
    metadata?: Prisma.InputJsonValue;
    ipAddress?: string;
  }): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        adminId: params.adminId,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId ?? null,
        metadata: params.metadata,
        ipAddress: params.ipAddress ?? null,
      },
    });
  }
}
