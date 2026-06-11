import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3001').transform(Number),
  N8N_WEBHOOK_URL: z.string().url(),
  ZD_SUBDOMAIN: z.string().min(1),
  ZD_EMAIL: z.string().email(),
  ZD_TOKEN: z.string().min(1),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌  Invalid environment variables:');
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
