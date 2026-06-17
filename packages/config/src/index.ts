/**
 * Centralized environment loading + validation for Neviso (ARD §14).
 *
 * Apps call `loadEnv()` at boot. If a required variable is missing or
 * malformed, validation throws with a clear list — the process refuses to
 * start rather than failing later at the first DB/Redis/JWT use.
 *
 * Provider API keys (SMS, Bale, Arvan, Metis, Zarinpal) are optional here so
 * that local dev and CI can boot with fakes; the feature slices that actually
 * call those providers enforce their presence at the point of use.
 */
import { z } from 'zod';

const bool = z
  .union([z.boolean(), z.string()])
  .transform((v) =>
    typeof v === 'boolean' ? v : ['1', 'true', 'yes', 'on'].includes(v.toLowerCase()),
  );

const intFromEnv = (def: number) =>
  z
    .union([z.number(), z.string()])
    .optional()
    .transform((v) => (v === undefined || v === '' ? def : Number(v)))
    .pipe(z.number().int().nonnegative());

export const envSchema = z.object({
  // App
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_PORT: intFromEnv(3000),
  GRAPHQL_ENDPOINT: z.string().url().default('http://localhost:3000/graphql'),
  WEB_ORIGIN: z.string().url().default('http://localhost:4000'),

  // Database / Redis (required — no sensible default)
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),

  // User JWT (required)
  JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('30d'),

  // Admin JWT (required — must differ from user secrets)
  JWT_ADMIN_ACCESS_SECRET: z.string().min(1, 'JWT_ADMIN_ACCESS_SECRET is required'),
  JWT_ADMIN_REFRESH_SECRET: z.string().min(1, 'JWT_ADMIN_REFRESH_SECRET is required'),
  JWT_ADMIN_CHALLENGE_SECRET: z.string().min(1, 'JWT_ADMIN_CHALLENGE_SECRET is required'),
  JWT_ADMIN_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_ADMIN_REFRESH_EXPIRES: z.string().default('8h'),
  ADMIN_OTP_TTL: intFromEnv(300),
  ADMIN_LOGIN_CHALLENGE_TTL: intFromEnv(300),
  IMPERSONATION_TOKEN_TTL: intFromEnv(1800),
  ADMIN_WEB_ORIGIN: z.string().url().default('http://localhost:5000'),
  ADMIN_IP_ALLOWLIST: z.string().optional().default(''),

  // OTP — SMS Web Service
  SMS_WEBSERVICE_BASE_URL: z.string().url().default('https://api.sms-webservice.com/api/V3'),
  SMS_WEBSERVICE_API_KEY: z.string().optional().default(''),
  SMS_WEBSERVICE_OTP_TEMPLATE_KEY: z.string().optional().default(''),

  // OTP — Bale
  BALE_BASE_URL: z.string().url().default('https://safir.bale.ai/api/v2'),
  BALE_CLIENT_ID: z.string().optional().default(''),
  BALE_CLIENT_SECRET: z.string().optional().default(''),

  // Arvan Object Storage
  ARVAN_ACCESS_KEY: z.string().optional().default(''),
  ARVAN_SECRET_KEY: z.string().optional().default(''),
  ARVAN_ENDPOINT: z.string().url().default('https://s3.ir-thr-at1.arvanstorage.ir'),
  ARVAN_BUCKET_UPLOADS: z.string().default('neviso-uploads'),
  ARVAN_BUCKET_EXPORTS: z.string().default('neviso-exports'),

  // AI — Metis gateway
  METIS_BASE_URL: z.string().url().default('https://api.metisai.ir'),
  METIS_API_KEY: z.string().optional().default(''),
  METIS_GEMINI_MODEL: z.string().default('gemini-2.5-pro'),
  METIS_EMBEDDING_PROVIDER: z.string().default('openai'),
  METIS_EMBEDDING_MODEL: z.string().default('text-embedding-3-small'),
  METIS_GEN_TIMEOUT: intFromEnv(180000),
  METIS_IO_TIMEOUT: intFromEnv(60000),

  // Worker scaling
  WORKER_CONCURRENCY: intFromEnv(10),
  METIS_MAX_CONCURRENCY: intFromEnv(50),
  USER_MAX_INFLIGHT_JOBS: intFromEnv(3),

  // Zarinpal
  ZARINPAL_MERCHANT_ID: z.string().optional().default(''),
  ZARINPAL_SANDBOX: bool.default(true),

  // Credits
  FREE_CREDIT_GRANT: intFromEnv(60),
  CREDIT_COST_PER_AUDIO_MINUTE: intFromEnv(1),
  CREDIT_COST_PER_IMAGE: intFromEnv(2),
  CREDIT_COST_PER_CHAT_MESSAGE: intFromEnv(10),

  // PDF export (later step)
  PUPPETEER_EXECUTABLE_PATH: z.string().default('/usr/bin/chromium-browser'),
  PDF_WATERMARK_TEXT: z.string().default('نویسو | nevisoai.ir'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Parse + validate environment variables. Throws an Error listing every
 * problem if validation fails.
 */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return result.data;
}
