// @ts-nocheck
import { describe, it, expect } from 'vitest';
import {
  getConsignmentOptions,
  getTopPlatforms,
  getPlatformComparison,
  getPlatformById,
  getAllPlatforms,
} from '../../lib/trading/consignmentRouterService';

describe('consignmentRouterService', () => {
  describe('getConsignmentOptions', () => {
    it('returns options sorted by recommendation score', () => {
      const options = getConsignmentOptions('Test Card', 1000);
      expect(options.length).toBeGreaterThan(0);
      for (let i = 1; i < options.length; i++) {
        expect(options[i - 1].recommendationScore)
          .toBeGreaterThanOrEqual(options[i].recommendationScore);
      }
    });

    it('each option has valid fee breakdown', () => {
      const options = getConsignmentOptions('Test Card', 500);
      for (const o of options) {
        expect(o.fees.sellerFee).toBeGreaterThanOrEqual(0);
        expect(o.fees.total).toBeGreaterThanOrEqual(0);
        expect(o.netProceeds).toBeGreaterThan(0);
        expect(o.netProceeds).toBeLessThan(o.estimatedSalePrice);
      }
    });

    it('filters out platforms with higher minimum lot value', () => {
      const lowValue = getConsignmentOptions('Low Card', 50);
      const highValue = getConsignmentOptions('High Card', 5000);
      // High value should include Heritage (minLotValue 500)
      expect(highValue.length).toBeGreaterThanOrEqual(lowValue.length);
    });

    it('top recommendation has reasoning', () => {
      const options = getConsignmentOptions('Test Card', 2000);
      expect(options[0].reasoning).toBeTruthy();
      expect(options[0].reasoning).toContain('Best');
    });

    it('premium platforms estimate higher sale prices', () => {
      const options = getConsignmentOptions('Test Card', 1000);
      const premium = options.find(o => o.platform.tier === 'premium');
      const budget = options.find(o => o.platform.tier === 'budget');
      if (premium && budget) {
        expect(premium.estimatedSalePrice).toBeGreaterThan(budget.estimatedSalePrice);
      }
    });
  });

  describe('getTopPlatforms', () => {
    it('returns platforms sorted by sell-through rate', () => {
      const platforms = getTopPlatforms();
      expect(platforms.length).toBeGreaterThan(0);
      for (let i = 1; i < platforms.length; i++) {
        expect(platforms[i - 1].sellThroughRate)
          .toBeGreaterThanOrEqual(platforms[i].sellThroughRate);
      }
    });
  });

  describe('getPlatformComparison', () => {
    it('returns comparison for all platforms', () => {
      const comparison = getPlatformComparison();
      expect(comparison.length).toBe(getAllPlatforms().length);
    });

    it('each comparison has net proceeds at multiple price points', () => {
      const comparison = getPlatformComparison();
      for (const c of comparison) {
        expect(c.platformName).toBeTruthy();
        expect(c.netProceedsAt500).toBeGreaterThan(0);
        expect(c.netProceedsAt1000).toBeGreaterThan(0);
        expect(c.netProceedsAt5000).toBeGreaterThan(0);
        expect(c.netProceedsAt10000).toBeGreaterThan(0);
        expect(c.netProceedsAt10000).toBeGreaterThan(c.netProceedsAt1000);
      }
    });
  });

  describe('getPlatformById', () => {
    it('returns platform for valid id', () => {
      const platform = getPlatformById('ebay');
      expect(platform).toBeDefined();
      expect(platform!.name).toBe('eBay');
    });

    it('returns undefined for invalid id', () => {
      const platform = getPlatformById('nonexistent' as any);
      expect(platform).toBeUndefined();
    });

    it('returns Heritage for heritage id', () => {
      const platform = getPlatformById('heritage');
      expect(platform).toBeDefined();
      expect(platform!.tier).toBe('premium');
    });
  });

  describe('getAllPlatforms', () => {
    it('returns all platforms', () => {
      const platforms = getAllPlatforms();
      expect(platforms.length).toBe(6);
    });

    it('includes all tiers', () => {
      const platforms = getAllPlatforms();
      const tiers = new Set(platforms.map(p => p.tier));
      expect(tiers.has('premium')).toBe(true);
      expect(tiers.has('mid')).toBe(true);
      expect(tiers.has('budget')).toBe(true);
    });

    it('each platform has valid fee structure', () => {
      const platforms = getAllPlatforms();
      for (const p of platforms) {
        expect(p.sellerFeeRate).toBeGreaterThanOrEqual(0);
        expect(p.sellerFeeRate).toBeLessThan(1);
        expect(p.sellThroughRate).toBeGreaterThan(0);
        expect(p.sellThroughRate).toBeLessThanOrEqual(1);
        expect(p.avgDaysToSell).toBeGreaterThan(0);
      }
    });
  });
});
