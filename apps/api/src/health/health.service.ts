import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Health, HealthState } from './health.model';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<Health> {
    const database = await this.pingDatabase();
    return {
      status: database ? HealthState.ok : HealthState.degraded,
      service: 'api',
      database,
      timestamp: new Date().toISOString(),
    };
  }

  private async pingDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (err) {
      this.logger.warn(`Database ping failed: ${(err as Error).message}`);
      return false;
    }
  }
}
