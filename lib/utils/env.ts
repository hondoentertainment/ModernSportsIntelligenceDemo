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

  // Telemetry — at least one channel should be configured in production so
  // errors are observable rather than silent. See getProductionTelemetryIssues.
  VITE_SENTRY_DSN: z
    .string()
    .optional()
    .default(''),
  VITE_ERROR_REPORTING_URL: z
    .union([z.string().url(), z.literal('')])
    .optional()
    .default(''),
  // Set 'true' on real production deploys to make missing telemetry a hard
  // build failure (see vite.config.ts). Unset/false: missing telemetry is
  // surfaced in the ProductionConfigBanner but does not block the build.
  VITE_REQUIRE_TELEMETRY: z
    .string()
    .optional()
    .default(''),
});

export type EnvConfig = z.infer<typeof envSchema>;

let _validated: EnvConfig | null = null;

/** Populated when `import.meta.env.PROD` and Zod env parsing fails (malformed VITE_* values). */
let envSchemaFailureMessages: string[] = [];

export function getEnvSchemaFailureMessages(): string[] {
  return envSchemaFailureMessages;
}

/** Supabase URL vs anon key consistency (for production banner). */
export function getSupabaseEnvPairingIssues(cfg: Pick<EnvConfig, 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY'>): string[] {
  const issues: string[] = [];
  const url = (cfg.VITE_SUPABASE_URL ?? '').trim();
  const key = (cfg.VITE_SUPABASE_ANON_KEY ?? '').trim();
  if (url && !key) {
    issues.push('VITE_SUPABASE_ANON_KEY is missing while VITE_SUPABASE_URL is set.');
  }
  if (!url && key) {
    issues.push('VITE_SUPABASE_URL is missing while VITE_SUPABASE_ANON_KEY is set.');
  }
  return issues;
}

/** True for production Vite builds (shell UI checks; mockable in tests). */
export function isClientProductionBuild(): boolean {
  return typeof import.meta !== 'undefined' && !!import.meta.env?.PROD;
}

/**
 * Production telemetry check: at least one error channel (Sentry DSN or the
 * error-reporting beacon URL) should be configured so a production app is not
 * running blind. Returns a one-item issue list when neither is set; the
 * ProductionConfigBanner renders it and vite.config.ts can fail the build on it.
 */
export function getProductionTelemetryIssues(
  cfg: Pick<EnvConfig, 'VITE_SENTRY_DSN' | 'VITE_ERROR_REPORTING_URL'>,
): string[] {
  const sentry = (cfg.VITE_SENTRY_DSN ?? '').trim();
  const beacon = (cfg.VITE_ERROR_REPORTING_URL ?? '').trim();
  if (!sentry && !beacon) {
    return [
      'No error telemetry configured — set VITE_SENTRY_DSN or VITE_ERROR_REPORTING_URL so production errors are observable.',
    ];
  }
  return [];
}

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
    // Vitest: set VITEST_CAPTURE_ENV_SCHEMA=1 to cover the same banner copy path as production.
    const persistFailures =
      (typeof import.meta !== 'undefined' && !!import.meta.env?.PROD) ||
      (typeof process !== 'undefined' &&
        process.env.VITEST === 'true' &&
        process.env.VITEST_CAPTURE_ENV_SCHEMA === '1');
    if (persistFailures) {
      envSchemaFailureMessages = result.error.issues.map(
        (i) => `${i.path.join('.')}: ${i.message}`,
      );
    } else {
      envSchemaFailureMessages = [];
    }
    // Return defaults rather than crash in demo mode
    _validated = envSchema.parse({});
    return _validated;
  }

  envSchemaFailureMessages = [];
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

  const telemetryIssues = getProductionTelemetryIssues(_validated);
  if (telemetryIssues.length > 0) {
    if (isClientProductionBuild()) {
      logger.error(`[Env] ${telemetryIssues.join(' ')}`);
    } else {
      warnings.push(...telemetryIssues);
    }
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
