import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('../../api/lib/logger', () => ({
  apiLogger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

describe('verifyServerApiAuth', () => {
  const envKeys = [
    'MSI_API_AUTH_DISABLED',
    'MSI_SERVER_API_SECRET',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VERCEL_ENV',
  ] as const;

  beforeEach(() => {
    envKeys.forEach((k) => delete process.env[k]);
  });

  afterEach(() => {
    vi.resetModules();
    envKeys.forEach((k) => delete process.env[k]);
  });

  it('isServerApiAuthConfigured is true when auth disabled locally', async () => {
    process.env.MSI_API_AUTH_DISABLED = '1';
    const { isServerApiAuthConfigured, verifyServerApiAuth } = await import(
      '../../api/lib/verifyServerApiAuth'
    );
    expect(isServerApiAuthConfigured()).toBe(true);
    expect(await verifyServerApiAuth({ headers: {} })).toBe(true);
  });

  it('isServerApiAuthConfigured is false when auth disabled in production', async () => {
    process.env.MSI_API_AUTH_DISABLED = '1';
    process.env.VERCEL_ENV = 'production';
    const { isServerApiAuthConfigured } = await import('../../api/lib/verifyServerApiAuth');
    expect(isServerApiAuthConfigured()).toBe(false);
  });

  it('apiAuthMisconfiguredBody includes actionable hint', async () => {
    const { apiAuthMisconfiguredBody } = await import('../../api/lib/verifyServerApiAuth');
    const body = apiAuthMisconfiguredBody();
    expect(body.code).toBe('api_auth_misconfigured');
    expect(body.hint).toMatch(/SUPABASE_URL/);
    expect(body.hint).toMatch(/check:prod-env/);
  });

  it('respondApiAuthMisconfigured returns disabled-in-prod body on production', async () => {
    process.env.MSI_API_AUTH_DISABLED = '1';
    process.env.VERCEL_ENV = 'production';
    const { respondApiAuthMisconfigured } = await import('../../api/lib/verifyServerApiAuth');
    const json = vi.fn();
    respondApiAuthMisconfigured({ status: () => ({ json }) });
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'api_auth_disabled_in_production',
        hint: expect.stringMatching(/MSI_API_AUTH_DISABLED/),
      }),
    );
  });

  it('isServerApiAuthConfigured is true when MSI_SERVER_API_SECRET set', async () => {
    process.env.MSI_SERVER_API_SECRET = 'secret-only';
    const { isServerApiAuthConfigured, verifyServerApiAuth } = await import(
      '../../api/lib/verifyServerApiAuth'
    );
    expect(isServerApiAuthConfigured()).toBe(true);
    expect(
      await verifyServerApiAuth({ headers: { authorization: 'Bearer secret-only' } }),
    ).toBe(true);
    expect(await verifyServerApiAuth({ headers: {} })).toBe(false);
  });

  it('rejects wrong shared secret', async () => {
    process.env.MSI_SERVER_API_SECRET = 'expected';
    const { verifyServerApiAuth } = await import('../../api/lib/verifyServerApiAuth');
    expect(
      await verifyServerApiAuth({ headers: { authorization: 'Bearer wrong' } }),
    ).toBe(false);
  });

  it('rejects requests when auth is disabled in production-like env', async () => {
    process.env.MSI_API_AUTH_DISABLED = '1';
    process.env.VERCEL_ENV = 'production';
    const { verifyServerApiAuth } = await import('../../api/lib/verifyServerApiAuth');
    expect(await verifyServerApiAuth({ headers: {} })).toBe(false);
  });
});
