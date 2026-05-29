import * as Joi from 'joi';

/**
 * Worker boot-time env validation (ARD §14). Covers the variables the
 * background worker actually consumes (queue, DB, Metis, credits, PDF).
 */
export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgresql', 'postgres'] })
    .required(),
  REDIS_URL: Joi.string()
    .uri({ scheme: ['redis', 'rediss'] })
    .required(),

  METIS_BASE_URL: Joi.string().uri().required(),
  METIS_API_KEY: Joi.string().allow('').default(''),
  METIS_GEMINI_MODEL: Joi.string().default('gemini-2.5-pro'),
  METIS_EMBEDDING_PROVIDER: Joi.string().default('openai'),
  METIS_EMBEDDING_MODEL: Joi.string().default('text-embedding-3-small'),
  METIS_GEN_TIMEOUT: Joi.number().default(180000),
  METIS_IO_TIMEOUT: Joi.number().default(60000),

  CREDIT_COST_PER_AUDIO_MINUTE: Joi.number().default(1),
  CREDIT_COST_PER_IMAGE: Joi.number().default(2),
  CREDIT_COST_PER_CHAT_MESSAGE: Joi.number().default(1),
  FREE_CREDIT_GRANT: Joi.number().default(20),

  PUPPETEER_EXECUTABLE_PATH: Joi.string().allow('').default('/usr/bin/chromium-browser'),
  PDF_WATERMARK_TEXT: Joi.string().allow('').default('نویسو | nevisoai.ir'),
}).unknown(true);
