import { loadEnv } from './index';

const minimalValidEnv = {
  DATABASE_URL: 'postgresql://neviso:neviso@localhost:5432/neviso',
  REDIS_URL: 'redis://localhost:6379',
  JWT_ACCESS_SECRET: 'a',
  JWT_REFRESH_SECRET: 'b',
  JWT_ADMIN_ACCESS_SECRET: 'c',
  JWT_ADMIN_REFRESH_SECRET: 'd',
  JWT_ADMIN_CHALLENGE_SECRET: 'e',
};

describe('@neviso/config loadEnv', () => {
  it('parses a minimal valid env and applies defaults', () => {
    const env = loadEnv(minimalValidEnv as NodeJS.ProcessEnv);
    expect(env.NODE_ENV).toBe('development');
    expect(env.APP_PORT).toBe(3000);
    expect(env.FREE_CREDIT_GRANT).toBe(60);
    expect(env.CREDIT_COST_PER_CHAT_MESSAGE).toBe(10);
    expect(env.ZARINPAL_SANDBOX).toBe(true);
  });

  it('coerces numeric and boolean strings', () => {
    const env = loadEnv({
      ...minimalValidEnv,
      APP_PORT: '8080',
      FREE_CREDIT_GRANT: '20',
      ZARINPAL_SANDBOX: 'false',
    } as NodeJS.ProcessEnv);
    expect(env.APP_PORT).toBe(8080);
    expect(env.FREE_CREDIT_GRANT).toBe(20);
    expect(env.ZARINPAL_SANDBOX).toBe(false);
  });

  it('throws when a required variable is missing', () => {
    const { DATABASE_URL: _omit, ...rest } = minimalValidEnv;
    expect(() => loadEnv(rest as NodeJS.ProcessEnv)).toThrow(/DATABASE_URL/);
  });

  it('throws when a URL field is malformed', () => {
    expect(() =>
      loadEnv({ ...minimalValidEnv, METIS_BASE_URL: 'not-a-url' } as NodeJS.ProcessEnv),
    ).toThrow(/METIS_BASE_URL/);
  });
});
