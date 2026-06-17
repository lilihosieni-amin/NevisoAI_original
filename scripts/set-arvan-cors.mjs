/**
 * Apply a CORS policy to the Arvan upload bucket so the browser can PUT folder
 * covers (and later, note uploads) directly via presigned URLs.
 *
 * Run with the project env loaded:
 *   set -a && . ./.env && set +a && node scripts/set-arvan-cors.mjs
 */
import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from '@aws-sdk/client-s3';

const {
  ARVAN_ENDPOINT = 'https://s3.ir-thr-at1.arvanstorage.ir',
  ARVAN_ACCESS_KEY,
  ARVAN_SECRET_KEY,
  ARVAN_BUCKET_UPLOADS = 'neviso-uploads',
  WEB_ORIGIN = 'http://localhost:4000',
} = process.env;

if (!ARVAN_ACCESS_KEY || !ARVAN_SECRET_KEY) {
  console.error('Missing ARVAN_ACCESS_KEY / ARVAN_SECRET_KEY in env.');
  process.exit(1);
}

const origins = [...new Set([WEB_ORIGIN, 'http://localhost:4000'])];

const s3 = new S3Client({
  region: 'ir-thr-at1',
  endpoint: ARVAN_ENDPOINT,
  forcePathStyle: true,
  credentials: { accessKeyId: ARVAN_ACCESS_KEY, secretAccessKey: ARVAN_SECRET_KEY },
});

const CORSConfiguration = {
  CORSRules: [
    {
      AllowedOrigins: origins,
      AllowedMethods: ['GET', 'PUT'],
      AllowedHeaders: ['*'],
      ExposeHeaders: ['ETag'],
      MaxAgeSeconds: 3000,
    },
  ],
};

await s3.send(new PutBucketCorsCommand({ Bucket: ARVAN_BUCKET_UPLOADS, CORSConfiguration }));
console.log(`✓ CORS applied to "${ARVAN_BUCKET_UPLOADS}" for origins: ${origins.join(', ')}`);

const check = await s3.send(new GetBucketCorsCommand({ Bucket: ARVAN_BUCKET_UPLOADS }));
console.log('Current CORS rules:', JSON.stringify(check.CORSRules, null, 2));
