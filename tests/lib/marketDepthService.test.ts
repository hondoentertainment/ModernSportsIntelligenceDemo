// @ts-nocheck
import { describe, it, expect } from 'vitest';
import {
  generateMarketDepth,
  getVolumeMetrics,
  generatePortfolioLiquidityReport,
} from '../../lib/analytics/marketDepthService';
import { makeCard } from '../helpers';

describe('marketDepthService', () => {
  describe('generateMarketDepth', () => {
    it('returns valid market depth for a card', () => {
      const card = makeCard({ currentValue: 200 });
      const depth = generateMarketDepth(card);
      expect(depth.cardId).toBe(card.id);
      expect(depth.midPrice).toBe(200);
      expect(depth.spread).toBeGreaterThan(0);
      expect(['tight', 'normal', 'wide']).toContain(depth.spreadCategory);
    });

    it('generates bid and ask levels', () => {
      const card = makeCard({ currentValue: 100 });
      const depth = generateMarketDepth(card);
      expect(depth.bids.length).toBeGreaterThan(0);
      expect(depth.asks.length).toBeGreaterThan(0);
    });

    it('bids are sorted descending by price', () => {
      const card = makeCard({ currentValue: 500 });
      const depth = generateMarketDepth(card);
      for (let i = 1; i < depth.bids.length; i++) {
        expect(depth.bids[i - 1].price).toBeGreaterThanOrEqual(depth.bids[i].price);
      }
    });

    it('asks are sorted ascending by price', () => {
      const card = makeCard({ currentValue: 500 });
      const depth = generateMarketDepth(card);
      for (let i = 1; i < depth.asks.length; i++) {
        expect(depth.asks[i - 1].price).toBeLessThanOrEqual(depth.asks[i].price);
      }
    });

    it('buy pressure is between 0 and 100', () => {
      const card = makeCard({ currentValue: 300 });
      const depth = generateMarketDepth(card);
      expect(depth.buyPressure).toBeGreaterThanOrEqual(0);
      expect(depth.buyPressure).toBeLessThanOrEqual(100);
    });

    it('cumulative quantities increase', () => {
      const card = makeCard({ currentValue: 200 });
      const depth = generateMarketDepth(card);
      for (let i = 1; i < depth.bids.length; i++) {
        expect(depth.bids[i].cumulative).toBeGreaterThanOrEqual(depth.bids[i - 1].cumulative);
      }
    });

    it('market impact array has 4 entries', () => {
      const card = makeCard({ currentValue: 200 });
      const depth = generateMarketDepth(card);
      expect(depth.marketImpact).toHaveLength(4);
      expect(depth.marketImpact[0].units).toBe(1);
    });

    it('handles zero-value card without crashing', () => {
      const card = makeCard({ currentValue: 0, purchasePrice: 0 });
      const depth = generateMarketDepth(card);
      expect(depth.midPrice).toBe(0);
      expect(depth.bids.length).toBeGreaterThanOrEqual(0);
    });

    it('all bid prices are positive', () => {
      const card = makeCard({ currentValue: 10 });
      const depth = generateMarketDepth(card);
      for (const bid of depth.bids) {
        expect(bid.price).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('getVolumeMetrics', () => {
    it('returns valid metrics shape', () => {
      const card = makeCard({ currentValue: 200 });
      const metrics = getVolumeMetrics(card);
      expect(metrics.cardId).toBe(card.id);
      expect(metrics.dailyVolume).toBeGreaterThanOrEqual(0);
      expect(metrics.weeklyVolume).toBeGreaterThanOrEqual(0);
      expect(metrics.monthlyVolume).toBeGreaterThanOrEqual(0);
      expect(['very fast', 'fast', 'moderate', 'slow', 'very slow']).toContain(metrics.velocity);
    });

    it('avgDaysToSell is at least 1', () => {
      const card = makeCard({ currentValue: 200 });
      const metrics = getVolumeMetrics(card);
      expect(metrics.avgDaysToSell).toBeGreaterThanOrEqual(1);
    });

    it('sellThroughRate is between 15 and 95', () => {
      const card = makeCard({ currentValue: 200 });
      const metrics = getVolumeMetrics(card);
      expect(metrics.sellThroughRate).toBeGreaterThanOrEqual(15);
      expect(metrics.sellThroughRate).toBeLessThanOrEqual(95);
    });

    it('priceConsensus is between 10 and 100', () => {
      const card = makeCard({ currentValue: 200 });
      const metrics = getVolumeMetrics(card);
      expect(metrics.priceConsensus).toBeGreaterThanOrEqual(10);
      expect(metrics.priceConsensus).toBeLessThanOrEqual(100);
    });

    it('recentSales has at least one entry', () => {
      const card = makeCard({ currentValue: 200 });
      const metrics = getVolumeMetrics(card);
      expect(metrics.recentSales.length).toBeGreaterThan(0);
    });
  });

  describe('generatePortfolioLiquidityReport', () => {
    it('returns zeros for empty inventory', () => {
      const report = generatePortfolioLiquidityReport([]);
      expect(report.totalValue).toBe(0);
      expect(report.liquidValue).toBe(0);
      expect(report.avgLiquidity).toBe(0);
      expect(report.avgDaysToLiquidate).toBe(0);
    });

    it('values sum to totalValue', () => {
      const cards = [
        makeCard({ id: '1', currentValue: 100 }),
        makeCard({ id: '2', currentValue: 200 }),
      ];
      const report = generatePortfolioLiquidityReport(cards);
      expect(report.totalValue).toBe(
        report.liquidValue + report.moderateValue + report.illiquidValue
      );
    });

    it('liquidPct is between 0 and 100', () => {
      const cards = [makeCard({ currentValue: 100 })];
      const report = generatePortfolioLiquidityReport(cards);
      expect(report.liquidPct).toBeGreaterThanOrEqual(0);
      expect(report.liquidPct).toBeLessThanOrEqual(100);
    });

    it('has 5 liquidity buckets', () => {
      const cards = [makeCard({ currentValue: 100 })];
      const report = generatePortfolioLiquidityReport(cards);
      expect(report.buckets).toHaveLength(5);
    });

    it('bucket colors are present', () => {
      const cards = [makeCard({ currentValue: 100 })];
      const report = generatePortfolioLiquidityReport(cards);
      for (const bucket of report.buckets) {
        expect(bucket.color).toBeTruthy();
        expect(bucket.label).toBeTruthy();
      }
    });

    it('excludes sold cards', () => {
      const cards = [
        makeCard({ id: '1', currentValue: 100, status: 'active' }),
        makeCard({ id: '2', currentValue: 500, status: 'sold' }),
      ];
      const report = generatePortfolioLiquidityReport(cards);
      expect(report.totalValue).toBe(100);
    });
  });
});
