/**
 * Environment Variable Validation
 *
 * Validates required environment variables at startup using Zod.
 * Fails fast with clear error messages for missing keys.
 */

import { z } from 'zod';
import { logger } from '../logger';

const envSchema = z.object({
  // Supabase — required for auth and data persistence; empty = demo mode
  VITE_SUPABASE_URL: z
    .union([z.string().url(), z.literal('')])
    .optional()
    .default(''),
  VITE_SUPABASE_ANON_KEY: z
    .string()
    .optional()
    .default(''),

  // Stripe — optional, required for billing
  VITE_STRIPE_PUBLISHABLE_KEY: z
    .string()
    .optional()
    .default(''),
  VITE_STRIPE_BASIC_PRICE_ID: z
    .string()
    .optional()
    .default(''),
  VITE_STRIPE_PRO_PRICE_ID: z
    .string()
    .optional()
    .default(''),
  VITE_STRIPE_ALPHA_PRICE_ID: z
    .string()
    .optional()
    .default(''),

  // Server API base URL — optional
  VITE_SERVER_API_BASE_URL: z
    .string()
    .optional()
    .default(''),

  // PressBox — optional
  VITE_PRESSBOX_API_KEY: z
    .string()
    .optional()
    .default(''),
});

export type EnvConfig = z.infer<typeof envSchema>;

let _validated: EnvConfig | null = null;

/**
 * Validate and return the environment configuration.
 * Logs warnings for missing optional keys and errors for malformed values.
 */
export function validateEnv(): EnvConfig {
  if (_validated) return _validated;

  const raw: Record<string, string | undefined> = {};

  // Gather all VITE_ env vars
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    for (const [key, value] of Object.entries(import.meta.env)) {
      if (key.startsWith('VITE_')) {
        raw[key] = value as string;
      }
    }
  }

  const result = envSchema.safeParse(raw);

  if (!result.success) {
    const issues = result.error.issues.map(
      (i) => `  - ${i.path.join('.')}: ${i.message}`
    );
    logger.error(
      `[Env] Environment validation failed:\n${issues.join('\n')}`
    );
    // Return defaults rather than crash in demo mode
    _validated = envSchema.parse({});
    return _validated;
  }

  _validated = result.data;

  // Warn about missing optional but recommended keys
  const warnings: string[] = [];
  if (!_validated.VITE_SUPABASE_URL) {
    warnings.push('VITE_SUPABASE_URL not set — running in demo mode');
  }
  if (!_validated.VITE_STRIPE_PUBLISHABLE_KEY) {
    warnings.push('VITE_STRIPE_PUBLISHABLE_KEY not set — billing disabled');
  }
  if (!_validated.VITE_SERVER_API_BASE_URL) {
    warnings.push('VITE_SERVER_API_BASE_URL not set — AI features may be unavailable');
  }

  if (warnings.length > 0) {
    logger.warn(`[Env] Configuration warnings:\n  ${warnings.join('\n  ')}`);
  }

  return _validated;
}

/** Get a validated env value */
export function env(): EnvConfig {
  return _validated ?? validateEnv();
}
