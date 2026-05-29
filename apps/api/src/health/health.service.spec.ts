import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { HealthService } from './health.service';
import { HealthState } from './health.model';

describe('HealthService (unit)', () => {
  function build(prismaMock: Partial<PrismaService>) {
    return Test.createTestingModule({
      providers: [HealthService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();
  }

  it('reports ok when the database responds', async () => {
    const moduleRef = await build({
      $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    } as any);
    const result = await moduleRef.get(HealthService).check();

    expect(result.status).toBe(HealthState.ok);
    expect(result.database).toBe(true);
    expect(result.service).toBe('api');
    expect(() => new Date(result.timestamp).toISOString()).not.toThrow();
  });

  it('reports degraded when the database is unreachable', async () => {
    const moduleRef = await build({
      $queryRaw: jest.fn().mockRejectedValue(new Error('no db')),
    } as any);
    const result = await moduleRef.get(HealthService).check();

    expect(result.status).toBe(HealthState.degraded);
    expect(result.database).toBe(false);
  });
});
