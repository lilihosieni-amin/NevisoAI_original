import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { Folder } from '@neviso/db';
import { ErrorCode } from '@neviso/errors';
import { AppError } from '../common/errors/app-error';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';
import { StorageService } from '../common/storage.service';
import { AppConfigService } from '../config/app-config.service';
import type { CreateFolderInput, UpdateFolderInput } from './dto/folders.types';
import { FolderCoverUpload, FolderObject } from './dto/folders.types';
import { createFolderSchema, updateFolderSchema } from './folders.validation';

const MAX_COVER_BYTES = 10 * 1024 * 1024; // 10 MB (ARD §8.3)
const COVER_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/heic': 'heic',
  'image/heif': 'heic',
};
const COVER_URL_CACHE_BUFFER = 300; // refresh the cached URL 5 min before it expires
const coverUrlKey = (objectKey: string) => `cover:url:${objectKey}`;

/**
 * Folder CRUD (ARD §5.3). Strictly owner-scoped: ownership is asserted here
 * (the GqlAuthGuard only proves authentication). Cover images live in a private
 * Arvan bucket under the caller's `users/{userId}/covers/` prefix; the stored
 * value is the object key and reads are served via short-lived signed URLs.
 */
@Injectable()
export class FoldersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly config: AppConfigService,
    private readonly redis: RedisService,
  ) {}

  /** The caller's folders, newest-touched first, each with a note count. */
  async listByUser(userId: string): Promise<FolderObject[]> {
    const rows = await this.prisma.folder.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { notes: true } } },
    });
    return Promise.all(rows.map((r) => this.toDto(r, r._count.notes)));
  }

  async create(userId: string, input: CreateFolderInput): Promise<FolderObject> {
    const data = this.parse(createFolderSchema, input);
    if (data.coverUrl) this.assertCoverKey(userId, data.coverUrl);
    const folder = await this.prisma.folder.create({
      data: {
        userId,
        name: data.name,
        color: data.color ?? null,
        coverUrl: data.coverUrl ?? null,
      },
    });
    return this.toDto(folder, 0);
  }

  async update(userId: string, id: string, input: UpdateFolderInput): Promise<FolderObject> {
    await this.assertOwnership(id, userId);
    const data = this.parse(updateFolderSchema, input);
    if (data.coverUrl) this.assertCoverKey(userId, data.coverUrl);

    const folder = await this.prisma.folder.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.color !== undefined ? { color: data.color } : {}),
        ...(data.coverUrl !== undefined ? { coverUrl: data.coverUrl } : {}),
      },
    });
    const noteCount = await this.prisma.note.count({ where: { folderId: id } });
    return this.toDto(folder, noteCount);
  }

  /** Delete an empty folder. Blocks if it still holds notes (FOLDER_NOT_EMPTY). */
  async delete(userId: string, id: string): Promise<boolean> {
    await this.assertOwnership(id, userId);
    const noteCount = await this.prisma.note.count({ where: { folderId: id } });
    if (noteCount > 0) throw new AppError(ErrorCode.FOLDER_NOT_EMPTY);
    await this.prisma.folder.delete({ where: { id } });
    return true;
  }

  /** Presigned PUT for a folder cover, scoped to the caller's storage prefix. */
  async requestCoverUploadUrl(
    userId: string,
    contentType: string,
    contentLength?: number,
  ): Promise<FolderCoverUpload> {
    const ext = COVER_EXT[contentType.toLowerCase()];
    if (!ext) throw new AppError(ErrorCode.UNSUPPORTED_FORMAT);
    if (contentLength != null && contentLength > MAX_COVER_BYTES) {
      throw new AppError(ErrorCode.FILE_TOO_LARGE);
    }
    const objectKey = `users/${userId}/covers/${randomUUID()}.${ext}`;
    const uploadUrl = await this.storage.presignPut({
      bucket: this.config.env.ARVAN_BUCKET_UPLOADS,
      key: objectKey,
      contentType,
      contentLength,
      expiresIn: 1800,
    });
    return { uploadUrl, objectKey };
  }

  // ── helpers ──────────────────────────────────────────────

  private async toDto(folder: Folder, noteCount: number): Promise<FolderObject> {
    const coverUrl = folder.coverUrl ? await this.signedCoverUrl(folder.coverUrl) : null;
    return {
      id: folder.id,
      name: folder.name,
      coverUrl,
      color: folder.color,
      noteCount,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
    };
  }

  /**
   * A presigned GET URL for a cover, cached in Redis so the SAME url is returned
   * across requests. A stable url lets the browser disk-cache the image instead
   * of re-downloading it on every refresh (a fresh signature would otherwise
   * change the `src` each time). The cache outlives a single request but expires
   * before the signature does.
   */
  private async signedCoverUrl(objectKey: string): Promise<string> {
    const cacheKey = coverUrlKey(objectKey);
    const cached = await this.redis.client.get(cacheKey);
    if (cached) return cached;

    const ttl = this.config.env.COVER_URL_TTL;
    const url = await this.storage.presignGet(
      this.config.env.ARVAN_BUCKET_UPLOADS,
      objectKey,
      ttl,
    );
    await this.redis.client.set(cacheKey, url, 'EX', Math.max(60, ttl - COVER_URL_CACHE_BUFFER));
    return url;
  }

  /** Found + owned, else FOLDER_NOT_FOUND (no existence leak across users). */
  private async assertOwnership(id: string, userId: string): Promise<Folder> {
    const folder = await this.prisma.folder.findUnique({ where: { id } });
    if (!folder || folder.userId !== userId) {
      throw new AppError(ErrorCode.FOLDER_NOT_FOUND);
    }
    return folder;
  }

  private assertCoverKey(userId: string, key: string): void {
    if (!key.startsWith(`users/${userId}/covers/`)) {
      throw new AppError(ErrorCode.FORBIDDEN);
    }
  }

  private parse<T>(schema: { safeParse: (v: unknown) => { success: boolean; data?: T } }, input: unknown): T {
    const result = schema.safeParse(input);
    if (!result.success || !result.data) {
      throw new AppError(ErrorCode.INVALID_FOLDER_NAME);
    }
    return result.data;
  }
}
