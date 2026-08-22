import 'dotenv/config';
import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().min(1).default('24h'),
  OTP_EXPIRY_MINUTES: z.coerce.number().int().refine((value) => value === 10, 'OTP expiry must be 10 minutes'),
  CLIENT_URL: z.string().url(),
  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).optional(),
  SMTP_SECURE: z.enum(['true', 'false']).optional(),
  SMTP_USER: z.string().min(1).optional(),
  SMTP_PASS: z.string().min(1).optional(),
  EMAIL_FROM: z.string().min(1).optional(),
});

const parsed = environmentSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
  throw new Error(`Invalid environment configuration: ${issues}`);
}

export const env = Object.freeze(parsed.data);

