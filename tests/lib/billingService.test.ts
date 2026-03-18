import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  SUBSCRIPTION_TIERS,
  hasFeatureAccess,
  checkUsageLimit,
  getUserSubscription,
  type SubscriptionTier,
} from '../../lib/billingService';

// Mock supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
  isDemoMode: false,
}));

// Mock logger
vi.mock('../../lib/logger', () => ({
  logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

describe('billingService', () => {
  // ── SUBSCRIPTION_TIERS ──────────────────────────────────────────────

  describe('SUBSCRIPTION_TIERS', () => {
    it('has exactly 4 tiers', () => {
      const tierKeys = Object.keys(SUBSCRIPTION_TIERS);
      expect(tierKeys).toHaveLength(4);
      expect(tierKeys).toEqual(['free', 'basic', 'pro', 'alpha']);
    });

    it('free tier has price 0', () => {
      expect(SUBSCRIPTION_TIERS.free.price).toBe(0);
    });

    it('basic tier costs $9.90 (990 cents)', () => {
      expect(SUBSCRIPTION_TIERS.basic.price).toBe(990);
    });

    it('pro tier costs $29 (2900 cents)', () => {
      expect(SUBSCRIPTION_TIERS.pro.price).toBe(2900);
    });

    it('alpha tier costs $99 (9900 cents)', () => {
      expect(SUBSCRIPTION_TIERS.alpha.price).toBe(9900);
    });

    it('each tier has an id, name, features array, and limits', () => {
      for (const [key, config] of Object.entries(SUBSCRIPTION_TIERS)) {
        expect(config.id).toBe(key);
        expect(typeof config.name).toBe('string');
        expect(Array.isArray(config.features)).toBe(true);
        expect(config.features.length).toBeGreaterThan(0);
        expect(config.limits).toHaveProperty('cards');
        expect(config.limits).toHaveProperty('aiValuations');
      }
    });

    it('free and basic tiers have finite limits', () => {
      expect(SUBSCRIPTION_TIERS.free.limits.cards).toBe(50);
      expect(SUBSCRIPTION_TIERS.free.limits.aiValuations).toBe(10);
      expect(SUBSCRIPTION_TIERS.basic.limits.cards).toBe(200);
      expect(SUBSCRIPTION_TIERS.basic.limits.aiValuations).toBe(100);
    });

    it('pro and alpha tiers have unlimited (-1) limits', () => {
      expect(SUBSCRIPTION_TIERS.pro.limits.cards).toBe(-1);
      expect(SUBSCRIPTION_TIERS.pro.limits.aiValuations).toBe(-1);
      expect(SUBSCRIPTION_TIERS.alpha.limits.cards).toBe(-1);
      expect(SUBSCRIPTION_TIERS.alpha.limits.aiValuations).toBe(-1);
    });
  });

  // ── hasFeatureAccess ────────────────────────────────────────────────

  describe('hasFeatureAccess', () => {
    it('unlimited_cards: only pro and alpha', () => {
      expect(hasFeatureAccess('free', 'unlimited_cards')).toBe(false);
      expect(hasFeatureAccess('basic', 'unlimited_cards')).toBe(false);
      expect(hasFeatureAccess('pro', 'unlimited_cards')).toBe(true);
      expect(hasFeatureAccess('alpha', 'unlimited_cards')).toBe(true);
    });

    it('unlimited_ai_valuations: only pro and alpha', () => {
      expect(hasFeatureAccess('free', 'unlimited_ai_valuations')).toBe(false);
      expect(hasFeatureAccess('basic', 'unlimited_ai_valuations')).toBe(false);
      expect(hasFeatureAccess('pro', 'unlimited_ai_valuations')).toBe(true);
      expect(hasFeatureAccess('alpha', 'unlimited_ai_valuations')).toBe(true);
    });

    it('tax_export: only pro and alpha', () => {
      expect(hasFeatureAccess('free', 'tax_export')).toBe(false);
      expect(hasFeatureAccess('basic', 'tax_export')).toBe(false);
      expect(hasFeatureAccess('pro', 'tax_export')).toBe(true);
      expect(hasFeatureAccess('alpha', 'tax_export')).toBe(true);
    });

    it('population_reports: only pro and alpha', () => {
      expect(hasFeatureAccess('free', 'population_reports')).toBe(false);
      expect(hasFeatureAccess('basic', 'population_reports')).toBe(false);
      expect(hasFeatureAccess('pro', 'population_reports')).toBe(true);
      expect(hasFeatureAccess('alpha', 'population_reports')).toBe(true);
    });

    it('api_access: only alpha', () => {
      expect(hasFeatureAccess('free', 'api_access')).toBe(false);
      expect(hasFeatureAccess('basic', 'api_access')).toBe(false);
      expect(hasFeatureAccess('pro', 'api_access')).toBe(false);
      expect(hasFeatureAccess('alpha', 'api_access')).toBe(true);
    });

    it('marketplace_fee_discount: only alpha', () => {
      expect(hasFeatureAccess('free', 'marketplace_fee_discount')).toBe(false);
      expect(hasFeatureAccess('basic', 'marketplace_fee_discount')).toBe(false);
      expect(hasFeatureAccess('pro', 'marketplace_fee_discount')).toBe(false);
      expect(hasFeatureAccess('alpha', 'marketplace_fee_discount')).toBe(true);
    });

    it('returns false for unknown features', () => {
      expect(hasFeatureAccess('alpha', 'nonexistent_feature')).toBe(false);
      expect(hasFeatureAccess('free', 'something_random')).toBe(false);
    });
  });

  // ── checkUsageLimit ─────────────────────────────────────────────────

  describe('checkUsageLimit', () => {
    it('returns true when current usage is under the limit', () => {
      expect(checkUsageLimit('free', 'cards', 0)).toBe(true);
      expect(checkUsageLimit('free', 'cards', 49)).toBe(true);
      expect(checkUsageLimit('basic', 'aiValuations', 99)).toBe(true);
    });

    it('returns false when current usage equals the limit', () => {
      expect(checkUsageLimit('free', 'cards', 50)).toBe(false);
      expect(checkUsageLimit('free', 'aiValuations', 10)).toBe(false);
      expect(checkUsageLimit('basic', 'cards', 200)).toBe(false);
      expect(checkUsageLimit('basic', 'aiValuations', 100)).toBe(false);
    });

    it('returns false when current usage exceeds the limit', () => {
      expect(checkUsageLimit('free', 'cards', 51)).toBe(false);
      expect(checkUsageLimit('basic', 'aiValuations', 150)).toBe(false);
    });

    it('returns true for unlimited tiers (-1) regardless of usage', () => {
      expect(checkUsageLimit('pro', 'cards', 0)).toBe(true);
      expect(checkUsageLimit('pro', 'cards', 999999)).toBe(true);
      expect(checkUsageLimit('pro', 'aiValuations', 999999)).toBe(true);
      expect(checkUsageLimit('alpha', 'cards', 999999)).toBe(true);
      expect(checkUsageLimit('alpha', 'aiValuations', 999999)).toBe(true);
    });
  });

  // ── getUserSubscription ─────────────────────────────────────────────

  describe('getUserSubscription', () => {
    let mockFrom: ReturnType<typeof vi.fn>;
    let mockSelect: ReturnType<typeof vi.fn>;
    let mockEq: ReturnType<typeof vi.fn>;
    let mockSingle: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
      vi.clearAllMocks();

      mockSingle = vi.fn();
      mockEq = vi.fn(() => ({ single: mockSingle }));
      mockSelect = vi.fn(() => ({ eq: mockEq }));
      mockFrom = vi.fn(() => ({ select: mockSelect }));

      const { supabase } = await import('../../lib/supabase');
      (supabase.from as ReturnType<typeof vi.fn>) = mockFrom;
    });

    it('queries the profiles table with the correct user ID', async () => {
      mockSingle.mockResolvedValue({
        data: { subscription_tier: 'pro', subscription_status: 'active' },
        error: null,
      });

      const result = await getUserSubscription('user-123');

      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(mockSelect).toHaveBeenCalledWith(
        'subscription_tier, subscription_status, ai_valuations_used, card_tracking_limit, billing_cycle_start'
      );
      expect(mockEq).toHaveBeenCalledWith('id', 'user-123');
      expect(result).toEqual({ subscription_tier: 'pro', subscription_status: 'active' });
    });

    it('returns null when supabase returns an error', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      const result = await getUserSubscription('bad-id');
      expect(result).toBeNull();
    });
  });
});
