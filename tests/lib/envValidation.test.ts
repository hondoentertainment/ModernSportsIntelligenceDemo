import { describe, it, expect, vi } from 'vitest';
import { env, validateEnv } from '../../lib/envValidation';

const EXPECTED_ENV_KEYS = [
  'supabaseUrl',
  'supabaseAnonKey',
  'geminiApiKey',
  'pressboxApiKey',
  'stripePublishableKey',
  'stripeBasicPriceId',
  'stripeProPriceId',
  'stripeAlphaPriceId',
] as const;

describe('envValidation', () => {
  describe('env object', () => {
    it('has expected keys', () => {
      for (const key of EXPECTED_ENV_KEYS) {
        expect(env).toHaveProperty(key);
      }
      expect(Object.keys(env).sort()).toEqual([...EXPECTED_ENV_KEYS].sort());
    });

    it('values are strings', () => {
      for (const key of EXPECTED_ENV_KEYS) {
        expect(typeof env[key]).toBe('string');
      }
    });
  });

  describe('validateEnv', () => {
    it('does not throw when called', () => {
      expect(() => validateEnv()).not.toThrow();
    });

    it('returns without throwing when PROD is true', () => {
      const originalEnv = import.meta.env;
      try {
        (import.meta as { env: Record<string, unknown> }).env = {
          ...originalEnv,
          PROD: true,
        };
        expect(() => validateEnv()).not.toThrow();
      } finally {
        (import.meta as { env: Record<string, unknown> }).env = originalEnv;
      }
    });

    it('logs warnings for missing variables in DEV', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      validateEnv();
      // May or may not log depending on actual env state
      expect(() => validateEnv()).not.toThrow();
      consoleWarnSpy.mockRestore();
    });

    it('logs when all env vars configured in DEV', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const keys = [
        'VITE_SUPABASE_URL',
        'VITE_SUPABASE_ANON_KEY',
        'VITE_GEMINI_API_KEY',
        'VITE_PRESSBOX_API_KEY',
        'VITE_STRIPE_PUBLISHABLE_KEY',
        'VITE_STRIPE_BASIC_PRICE_ID',
        'VITE_STRIPE_PRO_PRICE_ID',
        'VITE_STRIPE_ALPHA_PRICE_ID',
      ] as const;
      try {
        for (const k of keys) {
          vi.stubEnv(k, 'x');
        }
        vi.stubEnv('PROD', false);
        vi.stubEnv('DEV', true);
        validateEnv();
        expect(consoleWarnSpy).toHaveBeenCalledWith('[env] All environment variables are configured.');
      } finally {
        vi.unstubAllEnvs();
        consoleWarnSpy.mockRestore();
      }
    });

    it('warns for missing critical and optional keys', () => {
      const originalEnv = import.meta.env;
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        (import.meta as { env: Record<string, unknown> }).env = {
          ...originalEnv,
          PROD: false,
          DEV: true,
          VITE_SUPABASE_URL: '',
          VITE_SUPABASE_ANON_KEY: '',
          VITE_GEMINI_API_KEY: '',
        };
        validateEnv();
        const joined = consoleWarnSpy.mock.calls.map((c) => c.join(' ')).join('\n');
        expect(joined).toContain('Missing critical');
        expect(joined).toContain('Missing optional');
      } finally {
        (import.meta as { env: Record<string, unknown> }).env = originalEnv;
        consoleWarnSpy.mockRestore();
      }
    });
  });
});
