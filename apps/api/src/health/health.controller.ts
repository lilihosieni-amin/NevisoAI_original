import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';

/**
 * `GET /health` — liveness + dependency check (DEVELOPMENT_PLAN §1.5).
 * Returns `{ status: "ok" }` only when both Postgres and Redis are reachable.
 */
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  async check() {
    const [db, redis] = await Promise.all([this.prisma.isHealthy(), this.redis.isHealthy()]);
    const status = db && redis ? 'ok' : 'degraded';
    return { status, db, redis };
  }
}
