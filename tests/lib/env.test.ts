import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { getSupabaseEnvPairingIssues } from '../../lib/utils/env';

// Test the schema shape directly (env.ts reads from import.meta.env which
// is hard to mock, so we test the schema validation logic independently)

const envSchema = z.object({
  VITE_SUPABASE_URL: z.union([z.string().url(), z.literal('')]).optional().default(''),
  VITE_SUPABASE_ANON_KEY: z.string().optional().default(''),
  VITE_STRIPE_PUBLISHABLE_KEY: z.string().optional().default(''),
  VITE_SERVER_API_BASE_URL: z.string().optional().default(''),
});

describe('Environment validation schema', () => {
  it('should accept empty config with defaults', () => {
    const result = envSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should accept valid Supabase URL', () => {
    const result = envSchema.safeParse({
      VITE_SUPABASE_URL: 'https://abc.supabase.co',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid Supabase URL', () => {
    const result = envSchema.safeParse({
      VITE_SUPABASE_URL: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });

  it('should accept full config', () => {
    const result = envSchema.safeParse({
      VITE_SUPABASE_URL: 'https://abc.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'eyJhbGciOi...',
      VITE_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
      VITE_SERVER_API_BASE_URL: 'https://api.example.com',
    });
    expect(result.success).toBe(true);
  });
});

describe('getSupabaseEnvPairingIssues', () => {
  it('flags URL without anon key', () => {
    expect(
      getSupabaseEnvPairingIssues({
        VITE_SUPABASE_URL: 'https://x.supabase.co',
        VITE_SUPABASE_ANON_KEY: '',
      }),
    ).toHaveLength(1);
  });

  it('flags anon key without URL', () => {
    expect(
      getSupabaseEnvPairingIssues({
        VITE_SUPABASE_URL: '',
        VITE_SUPABASE_ANON_KEY: 'eyJ',
      }),
    ).toHaveLength(1);
  });

  it('returns empty when both set or both empty', () => {
    expect(
      getSupabaseEnvPairingIssues({
        VITE_SUPABASE_URL: 'https://x.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'k',
      }),
    ).toEqual([]);
    expect(getSupabaseEnvPairingIssues({ VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '' })).toEqual([]);
  });
});
