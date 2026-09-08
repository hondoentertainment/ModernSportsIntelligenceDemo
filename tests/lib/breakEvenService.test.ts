import { describe, it, expect } from 'vitest';
import {
  BREAK_EVEN_STRIP_PRESETS,
  calculateBreakEven,
  clampFeeRate,
  MARKETPLACE_FEES,
  resolveMarketplaceFee,
} from '../../lib/analytics/breakEvenService';
import { makeCard } from '../helpers';

describe('breakEvenService', () => {
  describe('calculateBreakEven', () => {
    it('returns correct cost basis from purchase + fees', () => {
      const card = makeCard({
        purchasePrice: 100,
        gradingFees: 20,
        shippingFees: 10,
        currentValue: 200,
      });
      const result = calculateBreakEven(card, 'ebay');
      expect(result.costBasis).toBe(130);
    });

    it('computes break-even price above cost basis due to fees', () => {
      const card = makeCard({ purchasePrice: 100, currentValue: 200 });
      const result = calculateBreakEven(card, 'ebay');
      // eBay fee is 13.12% + $0.30, so break-even = (100 + 0.30) / (1 - 0.1312)
      expect(result.breakEvenPrice).toBeGreaterThan(100);
      expect(result.breakEvenPrice).toBeLessThan(200);
    });

    it('break-even equals cost basis for private sales (no fees)', () => {
      const card = makeCard({ purchasePrice: 100, currentValue: 200 });
      const result = calculateBreakEven(card, 'private');
      // Private has 0 fee rate and 0 fixed, so breakEven = (100 + 0) / (1 - 0) = 100
      expect(result.breakEvenPrice).toBe(100);
    });

    it('calculates positive profit when currentValue > breakEven', () => {
      const card = makeCard({ purchasePrice: 50, currentValue: 200 });
      const result = calculateBreakEven(card, 'ebay');
      expect(result.currentProfit).toBeGreaterThan(0);
      expect(result.currentROI).toBeGreaterThan(0);
    });

    it('calculates negative profit when currentValue is low', () => {
      const card = makeCard({ purchasePrice: 200, currentValue: 50 });
      const result = calculateBreakEven(card, 'ebay');
      expect(result.currentProfit).toBeLessThan(0);
      expect(result.currentROI).toBeLessThan(0);
    });

    it('handles zero currentValue gracefully', () => {
      const card = makeCard({ purchasePrice: 100, currentValue: 0 });
      const result = calculateBreakEven(card);
      expect(result.currentProfit).toBeLessThan(0);
      expect(result.netProceeds).toBeLessThan(0);
    });

    it('includes additional costs in cost basis', () => {
      const card = makeCard({ purchasePrice: 100 });
      const withExtra = calculateBreakEven(card, 'ebay', 50);
      const withoutExtra = calculateBreakEven(card, 'ebay', 0);
      expect(withExtra.costBasis).toBe(withoutExtra.costBasis + 50);
      expect(withExtra.breakEvenPrice).toBeGreaterThan(withoutExtra.breakEvenPrice);
    });

    it('generates 5 scenarios', () => {
      const card = makeCard({ purchasePrice: 100, currentValue: 200 });
      const result = calculateBreakEven(card, 'ebay');
      expect(result.scenarios).toHaveLength(5);
    });

    it('scenarios include expected labels', () => {
      const card = makeCard({ purchasePrice: 100, currentValue: 200 });
      const result = calculateBreakEven(card, 'ebay');
      const labels = result.scenarios.map(s => s.label);
      expect(labels).toContain('-20%');
      expect(labels).toContain('+20%');
      expect(labels).toContain('+50%');
      expect(labels).toContain('2x');
    });

    it('defaults to ebay if unknown marketplace is passed', () => {
      const card = makeCard({ purchasePrice: 100, currentValue: 200 });
      const result = calculateBreakEven(card, 'unknownPlatform');
      const ebayResult = calculateBreakEven(card, 'ebay');
      expect(result.breakEvenPrice).toBe(ebayResult.breakEvenPrice);
    });
  });

  describe('MARKETPLACE_FEES', () => {
    it('has expected marketplaces', () => {
      expect(MARKETPLACE_FEES).toHaveProperty('ebay');
      expect(MARKETPLACE_FEES).toHaveProperty('comc');
      expect(MARKETPLACE_FEES).toHaveProperty('myslabs');
      expect(MARKETPLACE_FEES).toHaveProperty('custom');
      expect(MARKETPLACE_FEES).toHaveProperty('private');
      expect(BREAK_EVEN_STRIP_PRESETS).toContain('custom');
    });

    it('resolves a custom fee preset and clamps junk rates', () => {
      expect(clampFeeRate(Number.NaN)).toBe(0);
      expect(clampFeeRate(1.5)).toBe(0.99);
      expect(resolveMarketplaceFee('custom', { rate: 0.2, fixed: 2 }).rate).toBe(0.2);
      const card = makeCard({ purchasePrice: 100, currentValue: 200 });
      const custom = calculateBreakEven(card, 'custom', 0, { rate: 0.2, fixed: 0 });
      const ebay = calculateBreakEven(card, 'ebay');
      expect(custom.breakEvenPrice).toBeGreaterThan(100);
      expect(custom.breakEvenPrice).not.toBe(ebay.breakEvenPrice);
    });

    it('private sale has zero fees', () => {
      expect(MARKETPLACE_FEES.private.rate).toBe(0);
      expect(MARKETPLACE_FEES.private.fixed).toBe(0);
    });

    it('all fee rates are between 0 and 1', () => {
      for (const [, fee] of Object.entries(MARKETPLACE_FEES)) {
        expect(fee.rate).toBeGreaterThanOrEqual(0);
        expect(fee.rate).toBeLessThan(1);
      }
    });
  });
});
