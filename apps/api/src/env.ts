import { z } from 'zod'

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),

  DATABASE_URL: z.string(),

  REDIS_URL: z.string().default('redis://localhost:6379'),

  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_SECONDS: z.coerce.number().default(60 * 60 * 24 * 30),
  JWT_GUEST_EXPIRES_SECONDS: z.coerce.number().default(60 * 60 * 24 * 7),

  WECHAT_APP_ID: z.string().optional(),
  WECHAT_APP_SECRET: z.string().optional(),

  COS_SECRET_ID: z.string().optional(),
  COS_SECRET_KEY: z.string().optional(),
  COS_BUCKET: z.string().optional(),
  COS_REGION: z.string().default('ap-guangzhou'),
  COS_CDN_BASE: z.string().optional(),

  CORS_ORIGIN: z.string().default('http://localhost:5173'),
})

export const env = EnvSchema.parse(process.env)
