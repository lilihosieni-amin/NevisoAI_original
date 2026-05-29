/** Test env defaults for the worker (ARD §14 subset). Real env overrides these. */
const defaults: Record<string, string> = {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://neviso:neviso@localhost:5433/neviso_test?schema=public',
  REDIS_URL: 'redis://localhost:6380',
  METIS_BASE_URL: 'https://api.metisai.ir',
};

for (const [key, value] of Object.entries(defaults)) {
  if (process.env[key] === undefined) {
    process.env[key] = value;
  }
}
