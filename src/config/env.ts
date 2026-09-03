/**
 * Environment configuration validator with strict server-side protection
 */
import { z } from 'zod';

const serverEnvSchema = z.object({
  APIFY_API_KEY: z.string().optional().default(''),
  BRIGHTDATA_API_KEY: z.string().optional().default(''),
  BRIGHTDATA_ZONE: z.string().optional().default(''),
  OPENAI_API_KEY: z.string().optional().default(''),
  GEMINI_API_KEY: z.string().optional().default(''),
  MISTRAL_API_KEY: z.string().optional().default(''),
  DASHBOARD_ACCESS_PASSWORD: z.string().optional().default(''),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

/**
 * Validates and retrieves server-side environment variables.
 * Enforces that this can only be called in server environments.
 */
export function getServerEnv(): ServerEnv {
  if (typeof window !== 'undefined') {
    throw new Error('SECURITY VIOLATION: Server environment variables cannot be accessed on the client.');
  }

  const result = serverEnvSchema.safeParse({
    APIFY_API_KEY: process.env.APIFY_API_KEY,
    BRIGHTDATA_API_KEY: process.env.BRIGHTDATA_API_KEY,
    BRIGHTDATA_ZONE: process.env.BRIGHTDATA_ZONE,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
    DASHBOARD_ACCESS_PASSWORD: process.env.DASHBOARD_ACCESS_PASSWORD,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!result.success) {
    console.error('Invalid environment variables:', result.error.format());
    throw new Error('Environment configuration validation failed.');
  }

  return result.data;
}
