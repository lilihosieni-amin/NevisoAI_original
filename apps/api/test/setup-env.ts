/**
 * Test environment defaults. Real CI/job env (or a local .env exported into the
 * shell) takes precedence — we only fill what's missing so tests can boot the
 * full AppModule against the local docker Postgres/Redis.
 */
import 'reflect-metadata';

const defaults: Record<string, string> = {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://neviso:neviso@localhost:5432/neviso?schema=public',
  REDIS_URL: 'redis://localhost:6379',
  JWT_ACCESS_SECRET: 'test-access-secret',
  JWT_REFRESH_SECRET: 'test-refresh-secret',
  JWT_ADMIN_ACCESS_SECRET: 'test-admin-access-secret',
  JWT_ADMIN_REFRESH_SECRET: 'test-admin-refresh-secret',
  JWT_ADMIN_CHALLENGE_SECRET: 'test-admin-challenge-secret',
};

for (const [key, value] of Object.entries(defaults)) {
  if (!process.env[key]) {
    process.env[key] = value;
  }
}
