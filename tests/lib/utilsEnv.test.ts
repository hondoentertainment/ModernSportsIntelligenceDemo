import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateEnv, env, getProductionTelemetryIssues } from '../../lib/utils/env';
import { logger } from '../../lib/logger';

vi.mock('../../lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('lib/utils/env', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset module cache to test fresh validation
    vi.resetModules();
  });

  it('validateEnv returns config with expected keys', () => {
    const config = validateEnv();
    expect(config).toBeDefined();
    expect(config).toHaveProperty('VITE_SUPABASE_URL');
    expect(config).toHaveProperty('VITE_SUPABASE_ANON_KEY');
    expect(config).toHaveProperty('VITE_STRIPE_PUBLISHABLE_KEY');
    expect(config).toHaveProperty('VITE_SERVER_API_BASE_URL');
    expect(config).toHaveProperty('VITE_PRESSBOX_API_KEY');
  });

  it('env() returns same config as validateEnv', () => {
    const validated = validateEnv();
    const fromEnv = env();
    expect(fromEnv).toEqual(validated);
  });

  it('validateEnv caches result on second call', () => {
    const first = validateEnv();
    const second = validateEnv();
    expect(first).toBe(second);
  });

  it('env() uses cached config after validateEnv', () => {
    validateEnv();
    const fromEnv = env();
    expect(fromEnv).toBeDefined();
  });

  it('logs error and falls back to defaults when a VITE_ value fails schema', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'not-a-valid-url');
    const { validateEnv: validateEnvFresh, env: envFresh } = await import('../../lib/utils/env');
    const { logger: loggerFresh } = await import('../../lib/logger');
    const cfg = validateEnvFresh();
    expect(cfg).toBeDefined();
    expect(loggerFresh.error).toHaveBeenCalled();
    expect(envFresh()).toEqual(cfg);
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('getEnvSchemaFailureMessages is empty after successful validation', async () => {
    vi.resetModules();
    const { validateEnv: v, getEnvSchemaFailureMessages: getMsgs } = await import('../../lib/utils/env');
    v();
    expect(getMsgs()).toEqual([]);
  });

  it('records schema failure messages when production or Vitest capture flag is on', async () => {
    vi.resetModules();
    const prev = process.env.VITEST_CAPTURE_ENV_SCHEMA;
    process.env.VITEST_CAPTURE_ENV_SCHEMA = '1';
    vi.stubEnv('VITE_SUPABASE_URL', 'not-a-valid-url');
    const mod = await import('../../lib/utils/env');
    mod.validateEnv();
    expect(mod.getEnvSchemaFailureMessages().length).toBeGreaterThan(0);
    expect(mod.getEnvSchemaFailureMessages()[0]).toMatch(/VITE_SUPABASE_URL/);
    vi.unstubAllEnvs();
    vi.resetModules();
    if (prev === undefined) delete process.env.VITEST_CAPTURE_ENV_SCHEMA;
    else process.env.VITEST_CAPTURE_ENV_SCHEMA = prev;
  });

  describe('getProductionTelemetryIssues', () => {
    it('reports an issue when neither Sentry DSN nor beacon URL is set', () => {
      const issues = getProductionTelemetryIssues({
        VITE_SENTRY_DSN: '',
        VITE_ERROR_REPORTING_URL: '',
      });
      expect(issues).toHaveLength(1);
      expect(issues[0]).toMatch(/telemetry/i);
    });

    it('is clean when a Sentry DSN is configured', () => {
      expect(
        getProductionTelemetryIssues({
          VITE_SENTRY_DSN: 'https://key@o0.ingest.sentry.io/0',
          VITE_ERROR_REPORTING_URL: '',
        }),
      ).toEqual([]);
    });

    it('is clean when an error-reporting beacon URL is configured', () => {
      expect(
        getProductionTelemetryIssues({
          VITE_SENTRY_DSN: '',
          VITE_ERROR_REPORTING_URL: 'https://errors.example.com/ingest',
        }),
      ).toEqual([]);
    });

    it('treats whitespace-only values as unset', () => {
      expect(
        getProductionTelemetryIssues({
          VITE_SENTRY_DSN: '   ',
          VITE_ERROR_REPORTING_URL: '  ',
        }),
      ).toHaveLength(1);
    });
  });

  describe('getProductionServerAuthIssues', () => {
    it('returns empty in demo mode', async () => {
      const mod = await import('../../lib/utils/env');
      expect(
        mod.getProductionServerAuthIssues(
          { VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '' },
          { config: { serverApiAuth: false } },
        ),
      ).toEqual([]);
    });

    it('reports missing server auth when health config says so', async () => {
      const mod = await import('../../lib/utils/env');
      vi.stubEnv('PROD', 'true');
      const issues = mod.getProductionServerAuthIssues(
        {
          VITE_SUPABASE_URL: 'https://demo.supabase.co',
          VITE_SUPABASE_ANON_KEY: 'anon',
        },
        { config: { serverApiAuth: false } },
      );
      expect(issues).toHaveLength(1);
      expect(issues[0]).toMatch(/SUPABASE_URL/);
      vi.unstubAllEnvs();
    });

    it('reports auth disabled in production', async () => {
      const mod = await import('../../lib/utils/env');
      vi.stubEnv('PROD', 'true');
      const issues = mod.getProductionServerAuthIssues(
        {
          VITE_SUPABASE_URL: 'https://demo.supabase.co',
          VITE_SUPABASE_ANON_KEY: 'anon',
        },
        { config: { serverApiAuth: false, authDisabledInProd: true } },
      );
      expect(issues.some((i) => i.includes('MSI_API_AUTH_DISABLED'))).toBe(true);
      vi.unstubAllEnvs();
    });
  });

  describe('getProductionServerAuthAdminHints', () => {
    it('returns empty when there are no server auth issues', async () => {
      const mod = await import('../../lib/utils/env');
      expect(mod.getProductionServerAuthAdminHints([])).toEqual([]);
    });

    it('returns Vercel CLI steps when server auth is misconfigured', async () => {
      const mod = await import('../../lib/utils/env');
      const hints = mod.getProductionServerAuthAdminHints([
        'Server API auth is not configured on Vercel.',
      ]);
      expect(hints.some((h) => h.includes('vercel env add SUPABASE_URL'))).toBe(true);
      expect(hints.some((h) => h.includes('check:prod-env'))).toBe(true);
    });

    it('prepends remove-auth-disabled hint when MSI_API_AUTH_DISABLED is set', async () => {
      const mod = await import('../../lib/utils/env');
      const hints = mod.getProductionServerAuthAdminHints([
        'MSI_API_AUTH_DISABLED is set on production — remove it.',
      ]);
      expect(hints[0]).toMatch(/vercel env rm MSI_API_AUTH_DISABLED/);
    });
  });

  it('logs a telemetry error (not just a warning) on a production build', async () => {
    vi.resetModules();
    vi.stubEnv('PROD', 'true');
    const mod = await import('../../lib/utils/env');
    const { logger: loggerFresh } = await import('../../lib/logger');
    mod.validateEnv();
    expect(loggerFresh.error).toHaveBeenCalledWith(
      expect.stringMatching(/telemetry/i),
    );
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('emits no warnings when all recommended vars and telemetry are set', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_SUPABASE_URL', 'https://demo.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon-key');
    vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', 'pk_test_123');
    vi.stubEnv('VITE_SERVER_API_BASE_URL', 'https://api.example.com');
    vi.stubEnv('VITE_SENTRY_DSN', 'https://key@o0.ingest.sentry.io/0');
    const mod = await import('../../lib/utils/env');
    const { logger: loggerFresh } = await import('../../lib/logger');
    mod.validateEnv();
    expect(loggerFresh.warn).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
    vi.resetModules();
  });
});
