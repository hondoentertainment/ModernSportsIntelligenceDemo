import { describe, it, expect } from 'vitest';
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
  });
});
