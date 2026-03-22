import { z } from 'zod';

const portSchema = z
  .string()
  .default('3333')
  .transform((v) => parseInt(v, 10))
  .pipe(z.number().int().min(1).max(65535));

const baseEnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'staging', 'production'])
    .default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  PORT: portSchema,
  API_GATEWAY_PORT: z
    .string()
    .default('3333')
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().int().min(1).max(65535)),
  ORCHESTRATION_API_PORT: z
    .string()
    .default('3334')
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().int().min(1).max(65535)),
  WORKER_PORT: z
    .string()
    .default('3335')
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().int().min(1).max(65535)),
  CREDENTIAL_ENCRYPTION_KEY: z.string().default(''),
  INTERNAL_API_KEY: z.string().optional(),
  RATE_LIMIT_TTL: z
    .string()
    .default('60000')
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().int().min(1000)),
  RATE_LIMIT_LIMIT: z
    .string()
    .default('100')
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().int().min(1)),
  PARTNER_SIGNATURE_TTL: z
    .string()
    .default('300000')
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().int().min(0)),
  // Feature flags
  FF_PARTNER_AUTH: z.stringbool().default(false),
  FF_CLAIMS_VALIDATION: z.stringbool().default(false),
  FF_WALLET_PRESENTATIONS: z.stringbool().default(false),
  // Redis (BullMQ backend)
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z
    .string()
    .default('6388')
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().int().min(1).max(65535)),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z
    .string()
    .default('0')
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().int().min(0)),
  // Queue config
  QUEUE_PREFIX: z.string().default('ultima-forma'),
  QUEUE_WEBHOOK_CONCURRENCY: z
    .string()
    .default('5')
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().int().min(1).max(100)),
  QUEUE_NOTIFICATION_CONCURRENCY: z
    .string()
    .default('3')
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().int().min(1).max(50)),
});

export type AppConfig = {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  apiGatewayPort: number;
  orchestrationApiPort: number;
  workerPort: number;
  credentialEncryptionKey: string;
  internalApiKey: string | undefined;
  rateLimitTtl: number;
  rateLimitLimit: number;
  partnerSignatureTtl: number;
  featureFlags: {
    partnerAuth: boolean;
    claimsValidation: boolean;
    walletPresentations: boolean;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
  };
  queue: {
    prefix: string;
    webhookConcurrency: number;
    notificationConcurrency: number;
  };
};

let cachedConfig: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (cachedConfig) return cachedConfig;

  const env = process.env;

  const parsed = baseEnvSchema.safeParse(env);
  if (!parsed.success) {
    const formatted = parsed.error.issues
      .map((i) => `  ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(
      `Invalid environment configuration:\n${formatted}`
    );
  }

  const data = parsed.data;

  if (data.NODE_ENV === 'production') {
    if (!data.CREDENTIAL_ENCRYPTION_KEY) {
      throw new Error(
        'CREDENTIAL_ENCRYPTION_KEY is required in production'
      );
    }
    if (!data.INTERNAL_API_KEY) {
      throw new Error('INTERNAL_API_KEY is required in production');
    }
    if (data.DATABASE_URL.includes('localhost')) {
      throw new Error(
        'DATABASE_URL must not point to localhost in production'
      );
    }
  }

  cachedConfig = {
    nodeEnv: data.NODE_ENV,
    port: data.PORT,
    databaseUrl: data.DATABASE_URL,
    apiGatewayPort: data.API_GATEWAY_PORT,
    orchestrationApiPort: data.ORCHESTRATION_API_PORT,
    workerPort: data.WORKER_PORT,
    credentialEncryptionKey: data.CREDENTIAL_ENCRYPTION_KEY,
    internalApiKey: data.INTERNAL_API_KEY,
    rateLimitTtl: data.RATE_LIMIT_TTL,
    rateLimitLimit: data.RATE_LIMIT_LIMIT,
    partnerSignatureTtl: data.PARTNER_SIGNATURE_TTL,
    featureFlags: {
      partnerAuth: data.FF_PARTNER_AUTH,
      claimsValidation: data.FF_CLAIMS_VALIDATION,
      walletPresentations: data.FF_WALLET_PRESENTATIONS,
    },
    redis: {
      host: data.REDIS_HOST,
      port: data.REDIS_PORT,
      password: data.REDIS_PASSWORD,
      db: data.REDIS_DB,
    },
    queue: {
      prefix: data.QUEUE_PREFIX,
      webhookConcurrency: data.QUEUE_WEBHOOK_CONCURRENCY,
      notificationConcurrency: data.QUEUE_NOTIFICATION_CONCURRENCY,
    },
  };

  return cachedConfig;
}

export function resetConfigCache(): void {
  cachedConfig = null;
}

export function maskSecret(value: string): string {
  if (value.length <= 4) return '****';
  return value.slice(0, 2) + '****' + value.slice(-2);
}
