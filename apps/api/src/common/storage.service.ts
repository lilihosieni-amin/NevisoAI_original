import { Injectable } from '@nestjs/common';
import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AppConfigService } from '../config/app-config.service';

interface PresignPutOptions {
  bucket: string;
  key: string;
  contentType: string;
  contentLength?: number;
  expiresIn?: number;
}

/**
 * Arvan Object Storage (S3-compatible) client (ARD §8).
 *
 * Step 1 wires the client + presign/head helpers; the upload slice (Step 4)
 * uses them. Buckets are private; clients only ever get short-lived signed URLs.
 */
@Injectable()
export class StorageService {
  private readonly s3: S3Client;

  constructor(private readonly config: AppConfigService) {
    this.s3 = new S3Client({
      region: 'ir-thr-at1',
      endpoint: this.config.env.ARVAN_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.config.env.ARVAN_ACCESS_KEY,
        secretAccessKey: this.config.env.ARVAN_SECRET_KEY,
      },
    });
  }

  /** Presigned PUT URL with Content-Type (+ optional Content-Length) conditions. */
  presignPut(options: PresignPutOptions): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: options.bucket,
      Key: options.key,
      ContentType: options.contentType,
      ContentLength: options.contentLength,
    });
    return getSignedUrl(this.s3, command, { expiresIn: options.expiresIn ?? 1800 });
  }

  /** Presigned GET URL for private reads (default 15-min expiry). */
  presignGet(bucket: string, key: string, expiresIn = 900): Promise<string> {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(this.s3, command, { expiresIn });
  }

  /** Verify an object exists (used by confirmUpload in Step 4). */
  async headObject(bucket: string, key: string): Promise<boolean> {
    try {
      await this.s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
      return true;
    } catch {
      return false;
    }
  }
}
