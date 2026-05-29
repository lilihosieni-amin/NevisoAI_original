import * as Joi from 'joi';

/**
 * Boot-time env validation (ARD §14). The process refuses to start if a
 * required variable is missing or malformed. Keep in sync with `.env.example`.
 * Secret-bearing vars are `.allow('')` here so the four apps can boot in
 * local/CI before real provider credentials are wired up in later phases.
 */
export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  APP_PORT: Joi.number().port().default(3000),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgresql', 'postgres'] })
    .required(),
  REDIS_URL: Joi.string()
    .uri({ scheme: ['redis', 'rediss'] })
    .required(),

  // User JWT
  JWT_ACCESS_SECRET: Joi.string().min(8).required(),
  JWT_REFRESH_SECRET: Joi.string().min(8).required(),
  JWT_ACCESS_EXPIRES: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES: Joi.string().default('30d'),

  // Admin JWT + challenge
  JWT_ADMIN_ACCESS_SECRET: Joi.string().min(8).required(),
  JWT_ADMIN_REFRESH_SECRET: Joi.string().min(8).required(),
  JWT_ADMIN_CHALLENGE_SECRET: Joi.string().min(8).required(),
  JWT_ADMIN_ACCESS_EXPIRES: Joi.string().default('15m'),
  JWT_ADMIN_REFRESH_EXPIRES: Joi.string().default('8h'),
  ADMIN_OTP_TTL: Joi.number().default(300),
  ADMIN_LOGIN_CHALLENGE_TTL: Joi.number().default(300),
  ADMIN_LOGIN_RATE_MAX: Joi.number().default(5),
  ADMIN_LOGIN_RATE_WINDOW: Joi.number().default(900),
  IMPERSONATION_TOKEN_TTL: Joi.number().default(1800),
  ADMIN_WEB_ORIGIN: Joi.string().uri().default('https://admin.nevisoai.ir'),
  ADMIN_IP_ALLOWLIST: Joi.string().allow('').default(''),

  // OTP: SMS Web Service
  SMS_WEBSERVICE_BASE_URL: Joi.string().uri().required(),
  SMS_WEBSERVICE_API_KEY: Joi.string().allow('').default(''),
  SMS_WEBSERVICE_OTP_TEMPLATE_KEY: Joi.string().allow('').default(''),

  // OTP: Bale
  BALE_BASE_URL: Joi.string().uri().required(),
  BALE_CLIENT_ID: Joi.string().allow('').default(''),
  BALE_CLIENT_SECRET: Joi.string().allow('').default(''),
  OTP_TTL: Joi.number().default(120),
  OTP_RATE_LIMIT_WINDOW: Joi.number().default(120),

  // Arvan
  ARVAN_ACCESS_KEY: Joi.string().allow('').default(''),
  ARVAN_SECRET_KEY: Joi.string().allow('').default(''),
  ARVAN_ENDPOINT: Joi.string().uri().required(),
  ARVAN_BUCKET_UPLOADS: Joi.string().default('neviso-uploads'),
  ARVAN_BUCKET_EXPORTS: Joi.string().default('neviso-exports'),

  // Metis
  METIS_BASE_URL: Joi.string().uri().required(),
  METIS_API_KEY: Joi.string().allow('').default(''),
  METIS_GEMINI_MODEL: Joi.string().default('gemini-2.5-pro'),
  METIS_EMBEDDING_PROVIDER: Joi.string().default('openai'),
  METIS_EMBEDDING_MODEL: Joi.string().default('text-embedding-3-small'),
  METIS_GEN_TIMEOUT: Joi.number().default(180000),
  METIS_IO_TIMEOUT: Joi.number().default(60000),

  // Zarinpal
  ZARINPAL_MERCHANT_ID: Joi.string().allow('').default(''),
  ZARINPAL_SANDBOX: Joi.boolean().truthy('true').falsy('false').default(true),

  // Credits
  FREE_CREDIT_GRANT: Joi.number().default(20),
  CREDIT_COST_PER_AUDIO_MINUTE: Joi.number().default(1),
  CREDIT_COST_PER_IMAGE: Joi.number().default(2),
  CREDIT_COST_PER_CHAT_MESSAGE: Joi.number().default(1),

  // PDF export (consumed by worker; validated here too for parity)
  PUPPETEER_EXECUTABLE_PATH: Joi.string().allow('').default('/usr/bin/chromium-browser'),
  PDF_WATERMARK_TEXT: Joi.string().allow('').default('نویسو | nevisoai.ir'),
});
