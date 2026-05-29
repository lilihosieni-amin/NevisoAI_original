import { ConfigService } from '@nestjs/config';
import { UserStatus } from '@neviso/db';
import { ErrorCode } from '../common/errors/error-codes';
import { AuthService } from './auth.service';

jest.mock('bcryptjs', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('hashed'),
}));

function makeAuth(user: Record<string, unknown> | null): AuthService {
  const prisma = {
    user: { findUnique: jest.fn().mockResolvedValue(user) },
  } as unknown as ConstructorParameters<typeof AuthService>[0];
  const config = { get: () => 20 } as unknown as ConfigService;
  return new AuthService(
    prisma,
    {} as never,
    config,
    {
      signAccess: jest.fn().mockResolvedValue('access-token'),
      signRefresh: jest.fn().mockResolvedValue({ token: 'refresh-token', jti: 'jti-1' }),
    } as never,
    {} as never,
  );
}

const baseUser = {
  id: 'u1',
  mobile: '09121234567',
  passwordHash: 'x',
  status: UserStatus.ACTIVE,
  suspendedUntil: null,
  freeCreditsGiven: true,
};

describe('AuthService.login — account status enforcement', () => {
  it('rejects a banned user with ACCOUNT_BANNED', async () => {
    const auth = makeAuth({ ...baseUser, status: UserStatus.BANNED });
    await expect(auth.login('09121234567', 'pw')).rejects.toMatchObject({
      extensions: { code: ErrorCode.ACCOUNT_BANNED },
    });
  });

  it('rejects an actively-suspended user with ACCOUNT_SUSPENDED', async () => {
    const auth = makeAuth({
      ...baseUser,
      status: UserStatus.SUSPENDED,
      suspendedUntil: new Date(Date.now() + 86_400_000),
    });
    await expect(auth.login('09121234567', 'pw')).rejects.toMatchObject({
      extensions: { code: ErrorCode.ACCOUNT_SUSPENDED },
    });
  });

  it('allows a user whose suspension has lapsed', async () => {
    const auth = makeAuth({
      ...baseUser,
      status: UserStatus.SUSPENDED,
      suspendedUntil: new Date(Date.now() - 86_400_000),
    });
    // Gets past the status gate and into token issuance (mocked) → resolves.
    await expect(auth.login('09121234567', 'pw')).resolves.toBeDefined();
  });

  it('rejects unknown mobile / no password with INVALID_CREDENTIALS', async () => {
    const auth = makeAuth(null);
    await expect(auth.login('09121234567', 'pw')).rejects.toMatchObject({
      extensions: { code: ErrorCode.INVALID_CREDENTIALS },
    });
  });
});
