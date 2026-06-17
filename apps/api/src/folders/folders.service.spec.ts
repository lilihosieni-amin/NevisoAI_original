import { ErrorCode } from '@neviso/errors';
import { AppError } from '../common/errors/app-error';
import { FoldersService } from './folders.service';

type Mocks = {
  prisma: {
    folder: { findUnique: jest.Mock; findMany: jest.Mock; create: jest.Mock; update: jest.Mock; delete: jest.Mock };
    note: { count: jest.Mock };
  };
  storage: { presignPut: jest.Mock; presignGet: jest.Mock };
  config: { env: Record<string, unknown> };
  redis: { client: { get: jest.Mock; set: jest.Mock } };
};

function build(): { service: FoldersService; m: Mocks } {
  const m: Mocks = {
    prisma: {
      folder: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn().mockResolvedValue({}),
      },
      note: { count: jest.fn().mockResolvedValue(0) },
    },
    storage: {
      presignPut: jest.fn().mockResolvedValue('https://arvan/put-url'),
      presignGet: jest.fn().mockResolvedValue('https://arvan/get-url'),
    },
    config: { env: { ARVAN_BUCKET_UPLOADS: 'neviso-uploads', COVER_URL_TTL: 86400 } },
    redis: { client: { get: jest.fn().mockResolvedValue(null), set: jest.fn().mockResolvedValue('OK') } },
  };
  const service = new FoldersService(
    m.prisma as never,
    m.storage as never,
    m.config as never,
    m.redis as never,
  );
  return { service, m };
}

const OWNER = 'user-a';

describe('FoldersService ownership', () => {
  it('treats another user\'s folder as not found (no existence leak)', async () => {
    const { service, m } = build();
    m.prisma.folder.findUnique.mockResolvedValue({ id: 'f1', userId: 'user-b' });
    await expect(service.update(OWNER, 'f1', { name: 'x' })).rejects.toMatchObject({
      code: ErrorCode.FOLDER_NOT_FOUND,
    });
  });

  it('rejects a missing folder with FOLDER_NOT_FOUND', async () => {
    const { service, m } = build();
    m.prisma.folder.findUnique.mockResolvedValue(null);
    await expect(service.delete(OWNER, 'nope')).rejects.toBeInstanceOf(AppError);
  });
});

describe('FoldersService delete', () => {
  it('blocks deleting a folder that still has notes', async () => {
    const { service, m } = build();
    m.prisma.folder.findUnique.mockResolvedValue({ id: 'f1', userId: OWNER });
    m.prisma.note.count.mockResolvedValue(3);
    await expect(service.delete(OWNER, 'f1')).rejects.toMatchObject({
      code: ErrorCode.FOLDER_NOT_EMPTY,
    });
    expect(m.prisma.folder.delete).not.toHaveBeenCalled();
  });

  it('deletes an empty folder', async () => {
    const { service, m } = build();
    m.prisma.folder.findUnique.mockResolvedValue({ id: 'f1', userId: OWNER });
    m.prisma.note.count.mockResolvedValue(0);
    await expect(service.delete(OWNER, 'f1')).resolves.toBe(true);
    expect(m.prisma.folder.delete).toHaveBeenCalledWith({ where: { id: 'f1' } });
  });
});

describe('FoldersService create + cover', () => {
  it('rejects a cover key outside the caller prefix', async () => {
    const { service } = build();
    await expect(
      service.create(OWNER, { name: 'x', coverUrl: 'users/other/covers/a.jpg' }),
    ).rejects.toMatchObject({ code: ErrorCode.FORBIDDEN });
  });

  it('rejects an invalid name (INVALID_FOLDER_NAME)', async () => {
    const { service } = build();
    await expect(service.create(OWNER, { name: '   ' })).rejects.toMatchObject({
      code: ErrorCode.INVALID_FOLDER_NAME,
    });
  });

  it('creates a folder under the owner and returns noteCount 0', async () => {
    const { service, m } = build();
    const now = new Date();
    m.prisma.folder.create.mockResolvedValue({
      id: 'f9',
      name: 'ریاضی',
      color: '#E8A53D',
      coverUrl: null,
      createdAt: now,
      updatedAt: now,
    });
    const dto = await service.create(OWNER, { name: 'ریاضی', color: '#E8A53D' });
    expect(m.prisma.folder.create).toHaveBeenCalledWith({
      data: { userId: OWNER, name: 'ریاضی', color: '#E8A53D', coverUrl: null },
    });
    expect(dto).toMatchObject({ id: 'f9', noteCount: 0, color: '#E8A53D', coverUrl: null });
  });
});

describe('FoldersService cover URL caching', () => {
  const row = {
    id: 'f1',
    name: 'x',
    color: null,
    coverUrl: 'users/user-a/covers/c.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { notes: 0 },
  };

  it('signs the cover URL once, then serves it from the Redis cache', async () => {
    const { service, m } = build();
    m.prisma.folder.findMany.mockResolvedValue([row]);

    // 1st request: cache miss → presign + cache it under the object key
    m.redis.client.get.mockResolvedValueOnce(null);
    const first = await service.listByUser(OWNER);
    expect(first[0].coverUrl).toBe('https://arvan/get-url');
    expect(m.storage.presignGet).toHaveBeenCalledTimes(1);
    expect(m.redis.client.set).toHaveBeenCalledWith(
      'cover:url:users/user-a/covers/c.jpg',
      'https://arvan/get-url',
      'EX',
      expect.any(Number),
    );

    // 2nd request: cache hit → reuse the same URL, no new presign
    m.redis.client.get.mockResolvedValueOnce('https://arvan/get-url');
    const second = await service.listByUser(OWNER);
    expect(second[0].coverUrl).toBe('https://arvan/get-url');
    expect(m.storage.presignGet).toHaveBeenCalledTimes(1);
  });
});

describe('FoldersService cover presign', () => {
  it('rejects an unsupported content type', async () => {
    const { service } = build();
    await expect(service.requestCoverUploadUrl(OWNER, 'application/pdf')).rejects.toMatchObject({
      code: ErrorCode.UNSUPPORTED_FORMAT,
    });
  });

  it('rejects an oversized image', async () => {
    const { service } = build();
    await expect(
      service.requestCoverUploadUrl(OWNER, 'image/jpeg', 11 * 1024 * 1024),
    ).rejects.toMatchObject({ code: ErrorCode.FILE_TOO_LARGE });
  });

  it('returns a presigned PUT under the owner prefix', async () => {
    const { service } = build();
    const res = await service.requestCoverUploadUrl(OWNER, 'image/jpeg', 1024);
    expect(res.objectKey.startsWith(`users/${OWNER}/covers/`)).toBe(true);
    expect(res.objectKey.endsWith('.jpg')).toBe(true);
    expect(res.uploadUrl).toBe('https://arvan/put-url');
  });
});
