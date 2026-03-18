/**
 * Environment variable validation and typed access.
 *
 * Call `validateEnv()` once at app startup.  It logs warnings for any
 * missing variables but never throws — the app can still run with mock
 * data when keys are absent.
 */

interface EnvVarDefinition {
  /** The VITE_* key exposed by Vite */
  key: string;
  /** Human-readable label shown in warning messages */
  label: string;
  /** Which feature area this variable powers */
  feature: string;
  /** If true, the app's core functionality depends on it */
  critical: boolean;
}

const ENV_VAR_DEFINITIONS: EnvVarDefinition[] = [
  {
    key: 'VITE_SUPABASE_URL',
    label: 'Supabase URL',
    feature: 'Authentication & cloud data sync',
    critical: true,
  },
  {
    key: 'VITE_SUPABASE_ANON_KEY',
    label: 'Supabase anon key',
    feature: 'Authentication & cloud data sync',
    critical: true,
  },
  {
    key: 'VITE_GEMINI_API_KEY',
    label: 'Gemini API key',
    feature: 'AI-powered analysis (card grading, comparisons, multi-agent)',
    critical: false,
  },
  {
    key: 'VITE_PRESSBOX_API_KEY',
    label: 'PressBox API key',
    feature: 'Live MLB data feed',
    critical: false,
  },
  {
    key: 'VITE_STRIPE_PUBLISHABLE_KEY',
    label: 'Stripe publishable key',
    feature: 'Billing & subscriptions',
    critical: false,
  },
  {
    key: 'VITE_STRIPE_BASIC_PRICE_ID',
    label: 'Stripe Basic price ID',
    feature: 'Billing & subscriptions',
    critical: false,
  },
  {
    key: 'VITE_STRIPE_PRO_PRICE_ID',
    label: 'Stripe Pro price ID',
    feature: 'Billing & subscriptions',
    critical: false,
  },
  {
    key: 'VITE_STRIPE_ALPHA_PRICE_ID',
    label: 'Stripe Alpha price ID',
    feature: 'Billing & subscriptions',
    critical: false,
  },
];

function getEnvValue(key: string): string {
  return (import.meta.env[key] as string) ?? '';
}

/**
 * Validate that expected environment variables are present.
 * In development only: logs warnings for any that are missing. Never throws.
 * In production: no-op to avoid console noise and avoid leaking config hints.
 */
export function validateEnv(): void {
  if (typeof import.meta !== 'undefined' && import.meta.env?.PROD) {
    return;
  }
  const missing = ENV_VAR_DEFINITIONS.filter((v) => !getEnvValue(v.key));

  if (missing.length === 0) {
    if (import.meta.env.DEV) {
      console.warn('[env] All environment variables are configured.');
    }
    return;
  }

  const critical = missing.filter((v) => v.critical);
  const optional = missing.filter((v) => !v.critical);

  if (critical.length > 0) {
    console.warn(
      `[env] Missing critical environment variables:\n` +
        critical
          .map((v) => `  - ${v.key} (${v.label}): needed for ${v.feature}`)
          .join('\n') +
        `\n  These features will fall back to demo / mock data.`
    );
  }

  if (optional.length > 0) {
    console.warn(
      `[env] Missing optional environment variables:\n` +
        optional
          .map((v) => `  - ${v.key} (${v.label}): needed for ${v.feature}`)
          .join('\n') +
        `\n  Related features will be limited or use mock data.`
    );
  }
}

/**
 * Typed environment config object.
 * Every value falls back to an empty string so consumers can do simple
 * truthy checks (`if (env.supabaseUrl) { … }`).
 */
export const env = {
  supabaseUrl: getEnvValue('VITE_SUPABASE_URL'),
  supabaseAnonKey: getEnvValue('VITE_SUPABASE_ANON_KEY'),
  geminiApiKey: getEnvValue('VITE_GEMINI_API_KEY'),
  pressboxApiKey: getEnvValue('VITE_PRESSBOX_API_KEY'),
  stripePublishableKey: getEnvValue('VITE_STRIPE_PUBLISHABLE_KEY'),
  stripeBasicPriceId: getEnvValue('VITE_STRIPE_BASIC_PRICE_ID'),
  stripeProPriceId: getEnvValue('VITE_STRIPE_PRO_PRICE_ID'),
  stripeAlphaPriceId: getEnvValue('VITE_STRIPE_ALPHA_PRICE_ID'),
} as const;
