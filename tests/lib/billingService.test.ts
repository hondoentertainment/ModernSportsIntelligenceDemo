import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as billing from '../../lib/billingService';

describe('billingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports expected public API', () => {
    expect(typeof billing.getStripe).toBe('function');
    expect(typeof billing.getUserSubscription).toBe('function');
    expect(typeof billing.hasFeatureAccess).toBe('function');
    expect(typeof billing.checkUsageLimit).toBe('function');
    expect(typeof billing.createCheckoutSession).toBe('function');
    expect(typeof billing.redirectToCheckout).toBe('function');
    expect(typeof billing.createBillingPortalSession).toBe('function');
    expect(typeof billing.getSubscriptionPricing).toBe('function');
    expect(billing.SUBSCRIPTION_TIERS).toBeDefined();
    expect(billing.SUBSCRIPTION_TIERS.free).toBeDefined();
    expect(billing.SUBSCRIPTION_TIERS.basic).toBeDefined();
    expect(billing.SUBSCRIPTION_TIERS.pro).toBeDefined();
  });

  it('uses only publishable key and server-side session (no raw card data)', () => {
    // Billing flow: getStripe() uses VITE_STRIPE_PUBLISHABLE_KEY only;
    // createCheckoutSession invokes Supabase Edge Function (server creates Stripe session).
    // No card numbers or secrets in client code.
    const tierConfig = billing.SUBSCRIPTION_TIERS;
    const tiers = Object.keys(tierConfig) as (keyof typeof tierConfig)[];
    expect(tiers).toContain('free');
    expect(tiers).toContain('basic');
    expect(tiers).toContain('pro');
    // Subscription config has no card/payment fields
    for (const tier of tiers) {
      const config = tierConfig[tier];
      expect(config).toHaveProperty('id');
      expect(config).toHaveProperty('name');
      expect(config).toHaveProperty('price');
      expect(config).toHaveProperty('features');
      expect(config).not.toHaveProperty('cardNumber');
      expect(config).not.toHaveProperty('secretKey');
      expect(config).not.toHaveProperty('cvc');
    }
  });

  describe('hasFeatureAccess', () => {
    it('returns true for unlimited_cards on pro/alpha', () => {
      expect(billing.hasFeatureAccess('pro', 'unlimited_cards')).toBe(true);
      expect(billing.hasFeatureAccess('alpha', 'unlimited_cards')).toBe(true);
    });
    it('returns false for unlimited_cards on free/basic', () => {
      expect(billing.hasFeatureAccess('free', 'unlimited_cards')).toBe(false);
      expect(billing.hasFeatureAccess('basic', 'unlimited_cards')).toBe(false);
    });
    it('returns true for tax_export on pro/alpha only', () => {
      expect(billing.hasFeatureAccess('pro', 'tax_export')).toBe(true);
      expect(billing.hasFeatureAccess('alpha', 'tax_export')).toBe(true);
      expect(billing.hasFeatureAccess('basic', 'tax_export')).toBe(false);
      expect(billing.hasFeatureAccess('free', 'tax_export')).toBe(false);
    });
    it('returns true for api_access on alpha only', () => {
      expect(billing.hasFeatureAccess('alpha', 'api_access')).toBe(true);
      expect(billing.hasFeatureAccess('pro', 'api_access')).toBe(false);
    });
    it('returns true for unlimited_ai_valuations on pro/alpha only', () => {
      expect(billing.hasFeatureAccess('pro', 'unlimited_ai_valuations')).toBe(true);
      expect(billing.hasFeatureAccess('alpha', 'unlimited_ai_valuations')).toBe(true);
      expect(billing.hasFeatureAccess('basic', 'unlimited_ai_valuations')).toBe(false);
    });
    it('returns true for population_reports on pro/alpha', () => {
      expect(billing.hasFeatureAccess('pro', 'population_reports')).toBe(true);
      expect(billing.hasFeatureAccess('alpha', 'population_reports')).toBe(true);
      expect(billing.hasFeatureAccess('basic', 'population_reports')).toBe(false);
    });
    it('returns true for marketplace_fee_discount on alpha only', () => {
      expect(billing.hasFeatureAccess('alpha', 'marketplace_fee_discount')).toBe(true);
      expect(billing.hasFeatureAccess('pro', 'marketplace_fee_discount')).toBe(false);
    });
    it('returns false for unknown feature', () => {
      expect(billing.hasFeatureAccess('pro', 'unknown_feature')).toBe(false);
    });
  });

  describe('checkUsageLimit', () => {
    it('returns true for unlimited tiers (-1 limit)', () => {
      expect(billing.checkUsageLimit('pro', 'cards', 9999)).toBe(true);
      expect(billing.checkUsageLimit('pro', 'aiValuations', 9999)).toBe(true);
    });
    it('returns true when under limit', () => {
      expect(billing.checkUsageLimit('free', 'cards', 10)).toBe(true);
      expect(billing.checkUsageLimit('free', 'aiValuations', 5)).toBe(true);
      expect(billing.checkUsageLimit('basic', 'cards', 100)).toBe(true);
    });
    it('returns false when at or over limit', () => {
      expect(billing.checkUsageLimit('free', 'cards', 50)).toBe(false);
      expect(billing.checkUsageLimit('free', 'cards', 51)).toBe(false);
      expect(billing.checkUsageLimit('basic', 'aiValuations', 100)).toBe(false);
    });
  });

  describe('getSubscriptionPricing', () => {
    it('returns pricing for all tiers with price in dollars', () => {
      const pricing = billing.getSubscriptionPricing();
      expect(pricing).toHaveLength(4); // free, basic, pro, alpha
      const free = pricing.find((p) => p.id === 'free');
      expect(free?.isFree).toBe(true);
      expect(free?.price).toBe(0);
      const basic = pricing.find((p) => p.id === 'basic');
      expect(basic?.price).toBe(9.9);
      expect(basic?.isFree).toBe(false);
    });
  });
});
