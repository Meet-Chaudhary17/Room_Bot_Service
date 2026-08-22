import 'dotenv/config';
import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().min(1).default('24h'),
  OTP_EXPIRY_MINUTES: z.preprocess(
    (val) => (val === undefined || val === '' || val === null ? 10 : val),
    z.coerce.number().int().default(10).refine((value) => value === 10, 'OTP expiry must be 10 minutes')
  ),
  CLIENT_URL: z.preprocess(
    (val) => (val === undefined || val === '' || val === null ? 'http://localhost:5173' : val),
    z.string().url().default('http://localhost:5173')
  ),
  SMTP_HOST: z.preprocess((val) => val === '' ? undefined : val, z.string().min(1).optional()),
  SMTP_PORT: z.preprocess((val) => val === '' ? undefined : val, z.coerce.number().int().min(1).max(65535).optional()),
  SMTP_SECURE: z.preprocess((val) => val === '' ? undefined : val, z.enum(['true', 'false']).optional()),
  SMTP_USER: z.preprocess((val) => val === '' ? undefined : val, z.string().min(1).optional()),
  SMTP_PASS: z.preprocess((val) => val === '' ? undefined : val, z.string().min(1).optional()),
  EMAIL_FROM: z.string().min(1).optional(),
});

const parsed = environmentSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
  throw new Error(`Invalid environment configuration: ${issues}`);
}

export const env = Object.freeze(parsed.data);

