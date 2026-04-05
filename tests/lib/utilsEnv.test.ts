import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateEnv, env } from '../../lib/utils/env';
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
});
