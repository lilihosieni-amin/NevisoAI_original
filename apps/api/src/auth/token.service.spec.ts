import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../common/redis/redis.service';
import { TokenService } from './token.service';

/** Minimal in-memory Redis double covering the methods TokenService uses. */
function fakeRedis(): RedisService {
  const store = new Map<string, string>();
  return {
    setEx: jest.fn(async (k: string, v: string) => void store.set(k, v)),
    exists: jest.fn(async (k: string) => store.has(k)),
  } as unknown as RedisService;
}

const CONFIG: Record<string, string> = {
  'jwt.accessSecret': 'access-secret',
  'jwt.refreshSecret': 'refresh-secret',
  'jwt.accessExpires': '15m',
  'jwt.refreshExpires': '30d',
};

function makeService(redis = fakeRedis()): {
  svc: TokenService;
  jwt: JwtService;
  redis: RedisService;
} {
  const jwt = new JwtService({});
  const config = { get: (k: string) => CONFIG[k] } as unknown as ConfigService;
  return { svc: new TokenService(jwt, config, redis), jwt, redis };
}

describe('TokenService', () => {
  it('issues a verifiable access token', async () => {
    const { svc } = makeService();
    const token = await svc.signAccess('user-1');
    const payload = await svc.verifyAccess(token);
    expect(payload.sub).toBe('user-1');
    expect(payload.typ).toBe('access');
  });

  it('rejects an admin-audience token at the user access path', async () => {
    const { svc, jwt } = makeService();
    const adminToken = await jwt.signAsync(
      { sub: 'a', aud: 'admin', typ: 'access' },
      { secret: CONFIG['jwt.accessSecret'] },
    );
    await expect(svc.verifyAccess(adminToken)).rejects.toThrow();
  });

  it('rejects a refresh token presented as an access token', async () => {
    const { svc } = makeService();
    const { token } = await svc.signRefresh('user-1');
    await expect(svc.verifyAccess(token)).rejects.toThrow();
  });

  it('verifies a fresh refresh token then rejects it once revoked (rotation)', async () => {
    const { svc } = makeService();
    const { token, jti } = await svc.signRefresh('user-1');
    const payload = await svc.verifyRefresh(token);
    expect(payload.jti).toBe(jti);

    await svc.revokeRefresh(jti, 60);
    await expect(svc.verifyRefresh(token)).rejects.toThrow('revoked');
  });

  it('remainingSeconds reflects the exp claim', () => {
    const { svc } = makeService();
    const future = Math.floor(Date.now() / 1000) + 100;
    expect(svc.remainingSeconds({ exp: future })).toBeGreaterThan(90);
    expect(svc.remainingSeconds({})).toBe(0);
  });
});
