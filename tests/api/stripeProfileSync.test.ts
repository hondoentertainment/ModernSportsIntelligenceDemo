import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { tierFromStripePriceId } from '../../api/lib/stripeProfileSync';

describe('stripeProfileSync', () => {
  const env = { ...process.env };

  afterEach(() => {
    process.env = { ...env };
  });

  describe('tierFromStripePriceId', () => {
    beforeEach(() => {
      delete process.env.STRIPE_BASIC_PRICE_ID;
      delete process.env.STRIPE_PRO_PRICE_ID;
      delete process.env.STRIPE_ALPHA_PRICE_ID;
      delete process.env.VITE_STRIPE_BASIC_PRICE_ID;
      delete process.env.VITE_STRIPE_PRO_PRICE_ID;
      delete process.env.VITE_STRIPE_ALPHA_PRICE_ID;
    });

    it('returns null when price id is missing', () => {
      expect(tierFromStripePriceId(undefined)).toBeNull();
    });

    it('maps server STRIPE_*_PRICE_ID env', () => {
      process.env.STRIPE_BASIC_PRICE_ID = 'price_basic';
      process.env.STRIPE_PRO_PRICE_ID = 'price_pro';
      process.env.STRIPE_ALPHA_PRICE_ID = 'price_alpha';
      expect(tierFromStripePriceId('price_basic')).toBe('basic');
      expect(tierFromStripePriceId('price_pro')).toBe('pro');
      expect(tierFromStripePriceId('price_alpha')).toBe('alpha');
      expect(tierFromStripePriceId('price_unknown')).toBeNull();
    });

    it('falls back to VITE_* when server vars unset', () => {
      process.env.VITE_STRIPE_PRO_PRICE_ID = 'price_vite_pro';
      expect(tierFromStripePriceId('price_vite_pro')).toBe('pro');
    });
  });
});
