/**
 * Test env defaults. Sets just enough of ARD §14 for ConfigModule validation
 * to pass in unit/integration runs. Real values (e.g. a CI test DB) override
 * these via the actual environment.
 */
const defaults: Record<string, string> = {
  NODE_ENV: 'test',
  APP_PORT: '3000',
  DATABASE_URL: 'postgresql://neviso:neviso@localhost:5433/neviso_test?schema=public',
  REDIS_URL: 'redis://localhost:6380',
  JWT_ACCESS_SECRET: 'test-access-secret',
  JWT_REFRESH_SECRET: 'test-refresh-secret',
  JWT_ADMIN_ACCESS_SECRET: 'test-admin-access-secret',
  JWT_ADMIN_REFRESH_SECRET: 'test-admin-refresh-secret',
  JWT_ADMIN_CHALLENGE_SECRET: 'test-admin-challenge-secret',
  SMS_WEBSERVICE_BASE_URL: 'https://api.sms-webservice.com/api/V3',
  BALE_BASE_URL: 'https://safir.bale.ai/api/v2',
  ARVAN_ENDPOINT: 'https://s3.ir-thr-at1.arvanstorage.ir',
  METIS_BASE_URL: 'https://api.metisai.ir',
  // Relax the admin-login rate limit in tests: the test Redis persists between
  // local re-runs, so a 5/15-min cap would trip on repeated runs (CI Redis is
  // fresh per job, so the production default still applies there).
  ADMIN_LOGIN_RATE_MAX: '100000',
};

for (const [key, value] of Object.entries(defaults)) {
  if (process.env[key] === undefined) {
    process.env[key] = value;
  }
}
