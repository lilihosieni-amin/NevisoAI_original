/**
 * Typed config factory. Reads validated env (see validation.ts) into a
 * structured object available via ConfigService.get('...').
 */
export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.APP_PORT ?? '3000', 10),
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  isProduction: process.env.NODE_ENV === 'production',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET as string,
    refreshSecret: process.env.JWT_REFRESH_SECRET as string,
    accessExpires: process.env.JWT_ACCESS_EXPIRES ?? '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES ?? '30d',
  },
  adminJwt: {
    accessSecret: process.env.JWT_ADMIN_ACCESS_SECRET as string,
    refreshSecret: process.env.JWT_ADMIN_REFRESH_SECRET as string,
    challengeSecret: process.env.JWT_ADMIN_CHALLENGE_SECRET as string,
    accessExpires: process.env.JWT_ADMIN_ACCESS_EXPIRES ?? '15m',
    refreshExpires: process.env.JWT_ADMIN_REFRESH_EXPIRES ?? '8h',
    otpTtl: parseInt(process.env.ADMIN_OTP_TTL ?? '300', 10),
    challengeTtl: parseInt(process.env.ADMIN_LOGIN_CHALLENGE_TTL ?? '300', 10),
    loginRateMax: parseInt(process.env.ADMIN_LOGIN_RATE_MAX ?? '5', 10),
    loginRateWindowSec: parseInt(process.env.ADMIN_LOGIN_RATE_WINDOW ?? '900', 10),
  },
  otp: {
    ttl: parseInt(process.env.OTP_TTL ?? '120', 10),
    rateLimitWindow: parseInt(process.env.OTP_RATE_LIMIT_WINDOW ?? '120', 10),
  },
  sms: {
    baseUrl: process.env.SMS_WEBSERVICE_BASE_URL as string,
    apiKey: process.env.SMS_WEBSERVICE_API_KEY ?? '',
    templateKey: process.env.SMS_WEBSERVICE_OTP_TEMPLATE_KEY ?? '',
  },
  bale: {
    baseUrl: process.env.BALE_BASE_URL as string,
    clientId: process.env.BALE_CLIENT_ID ?? '',
    clientSecret: process.env.BALE_CLIENT_SECRET ?? '',
  },
  credits: {
    freeGrant: parseInt(process.env.FREE_CREDIT_GRANT ?? '20', 10),
  },
});
