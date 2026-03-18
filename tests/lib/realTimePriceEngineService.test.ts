import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getRecentSales,
  getPriceComposites,
  getMarketSummary,
  getVolumeBySource,
  getPriceAlerts,
  searchComps,
  formatCurrency,
  getMarketDepth,
  getPriceTrends,
  getSourceColor,
  getSaleTypeLabel,
  getDirectionColor,
  formatDate,
} from '../../lib/analytics/realTimePriceEngineService';
import { setupLocalStorageMock } from '../helpers';

const localStorageMock = setupLocalStorageMock();

describe('realTimePriceEngineService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('getRecentSales', () => {
    it('returns an array of sales', () => {
      const sales = getRecentSales();
      expect(Array.isArray(sales)).toBe(true);
      expect(sales.length).toBeGreaterThanOrEqual(30);
    });

    it('each sale has required fields with valid data', () => {
      const sales = getRecentSales();
      for (const sale of sales) {
        expect(sale.id).toBeTruthy();
        expect(sale.player).toBeTruthy();
        expect(sale.cardName).toBeTruthy();
        expect(sale.salePrice).toBeGreaterThan(0);
        expect(sale.year).toBeGreaterThanOrEqual(1900);
        expect(sale.soldDate).toMatch(/^\d{4}-\d{2}-\d{2}/);
        expect(['PSA', 'BGS', 'SGC', 'CGC']).toContain(sale.gradingCompany);
        expect(['auction', 'buy_it_now', 'best_offer', 'fixed']).toContain(sale.saleType);
        expect(['ebay', 'goldin', 'pwcc', 'heritage', 'comc', 'alt', 'whatnot']).toContain(sale.source);
      }
    });

    it('filters by time range', () => {
      const allSales = getRecentSales();
      const recentSales = getRecentSales('24h');
      expect(recentSales.length).toBeLessThanOrEqual(allSales.length);
    });

    it('includes sales from multiple marketplace sources', () => {
      const sales = getRecentSales();
      const sources = new Set(sales.map((s) => s.source));
      expect(sources.size).toBeGreaterThanOrEqual(4);
    });
  });

  describe('getPriceComposites', () => {
    it('returns an array of composites', () => {
      const composites = getPriceComposites();
      expect(Array.isArray(composites)).toBe(true);
      expect(composites.length).toBeGreaterThanOrEqual(15);
    });

    it('each composite has valid pricing data', () => {
      const composites = getPriceComposites();
      for (const comp of composites) {
        expect(comp.cardId).toBeTruthy();
        expect(comp.player).toBeTruthy();
        expect(comp.fairMarketValue).toBeGreaterThan(0);
        expect(comp.low).toBeGreaterThan(0);
        expect(comp.high).toBeGreaterThanOrEqual(comp.low);
        expect(comp.median).toBeGreaterThanOrEqual(comp.low);
        expect(comp.median).toBeLessThanOrEqual(comp.high);
        expect(comp.salesCount).toBeGreaterThan(0);
        expect(['up', 'down', 'stable']).toContain(comp.direction);
        expect(comp.confidenceScore).toBeGreaterThanOrEqual(0);
        expect(comp.confidenceScore).toBeLessThanOrEqual(100);
      }
    });

    it('each composite has source breakdown', () => {
      const composites = getPriceComposites();
      for (const comp of composites) {
        expect(comp.sources.length).toBeGreaterThan(0);
        for (const src of comp.sources) {
          expect(src.count).toBeGreaterThan(0);
          expect(src.avgPrice).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('getMarketDepth', () => {
    it('returns depth data for a known card', () => {
      const depth = getMarketDepth('comp-001');
      expect(depth.cardId).toBe('comp-001');
      expect(depth.activeListings).toBeGreaterThan(0);
      expect(depth.lowestAsk).toBeGreaterThan(0);
      expect(depth.highestBid).toBeGreaterThan(0);
      expect(depth.lowestAsk).toBeGreaterThanOrEqual(depth.highestBid);
      expect(depth.sellThroughRate).toBeGreaterThan(0);
      expect(depth.sellThroughRate).toBeLessThanOrEqual(100);
      expect(depth.listingsByPrice.length).toBeGreaterThan(0);
    });

    it('returns fallback depth for unknown card', () => {
      const depth = getMarketDepth('comp-unknown-xyz');
      expect(depth.cardId).toBe('comp-unknown-xyz');
      expect(depth.activeListings).toBeGreaterThan(0);
    });
  });

  describe('getMarketSummary', () => {
    it('returns a valid market summary', () => {
      const summary = getMarketSummary();
      expect(summary.totalCompsTracked).toBeGreaterThan(0);
      expect(summary.avgSalePrice).toBeGreaterThan(0);
      expect(summary.topMover.player).toBeTruthy();
      expect(summary.biggestDrop.player).toBeTruthy();
      expect(['bullish', 'bearish', 'neutral']).toContain(summary.marketSentiment);
      expect(summary.sentimentScore).toBeGreaterThanOrEqual(0);
      expect(summary.sentimentScore).toBeLessThanOrEqual(100);
      expect(summary.hotCards.length).toBeGreaterThan(0);
    });
  });

  describe('getVolumeBySource', () => {
    it('returns volume data for all active sources', () => {
      const volumes = getVolumeBySource();
      expect(volumes.length).toBeGreaterThan(0);
      const totalShare = volumes.reduce((sum, v) => sum + v.marketShare, 0);
      expect(totalShare).toBeGreaterThan(95);
      expect(totalShare).toBeLessThanOrEqual(101);
      for (const v of volumes) {
        expect(v.volume).toBeGreaterThan(0);
        expect(v.salesCount).toBeGreaterThan(0);
        expect(v.avgPrice).toBeGreaterThan(0);
      }
    });
  });

  describe('getPriceAlerts', () => {
    it('returns an array of alerts', () => {
      const alerts = getPriceAlerts();
      expect(alerts.length).toBeGreaterThan(0);
      for (const alert of alerts) {
        expect(alert.id).toBeTruthy();
        expect(alert.player).toBeTruthy();
        expect(alert.message).toBeTruthy();
        expect(['below_target', 'above_target', 'price_drop', 'new_comp', 'outlier']).toContain(alert.type);
        expect(['high', 'medium', 'low']).toContain(alert.priority);
        expect(alert.currentPrice).toBeGreaterThan(0);
      }
    });
  });

  describe('getPriceTrends', () => {
    it('returns trend data for a known composite', () => {
      const trends = getPriceTrends('comp-001');
      expect(trends.length).toBeGreaterThan(0);
      for (const point of trends) {
        expect(point.date).toMatch(/^\d{4}-\d{2}-\d{2}/);
        expect(point.price).toBeGreaterThan(0);
        expect(point.volume).toBeGreaterThanOrEqual(0);
      }
    });

    it('returns empty array for unknown card', () => {
      const trends = getPriceTrends('comp-unknown');
      expect(trends).toEqual([]);
    });
  });

  describe('searchComps', () => {
    it('returns all sales for empty query', () => {
      const all = getRecentSales();
      const searched = searchComps('');
      expect(searched.length).toBe(all.length);
    });

    it('filters by player name', () => {
      const results = searchComps('Trout');
      expect(results.length).toBeGreaterThan(0);
      for (const r of results) {
        const matches =
          r.player.toLowerCase().includes('trout') ||
          r.cardName.toLowerCase().includes('trout');
        expect(matches).toBe(true);
      }
    });

    it('filters by source', () => {
      const results = searchComps('goldin');
      expect(results.length).toBeGreaterThan(0);
      for (const r of results) {
        expect(r.source).toBe('goldin');
      }
    });

    it('returns empty array for non-matching query', () => {
      const results = searchComps('xyznonexistent12345');
      expect(results.length).toBe(0);
    });
  });

  describe('formatCurrency', () => {
    it('formats large amounts without decimals', () => {
      expect(formatCurrency(1500)).toBe('$1,500');
    });

    it('formats small amounts with decimals', () => {
      expect(formatCurrency(9.99)).toBe('$9.99');
    });

    it('formats zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });
  });

  describe('utility functions', () => {
    it('getSourceColor returns hex colors', () => {
      expect(getSourceColor('ebay')).toMatch(/^#[0-9a-f]{6}$/i);
      expect(getSourceColor('goldin')).toMatch(/^#[0-9a-f]{6}$/i);
      expect(getSourceColor('heritage')).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('getSaleTypeLabel returns human labels', () => {
      expect(getSaleTypeLabel('auction')).toBe('Auction');
      expect(getSaleTypeLabel('buy_it_now')).toBe('Buy It Now');
      expect(getSaleTypeLabel('best_offer')).toBe('Best Offer');
      expect(getSaleTypeLabel('fixed')).toBe('Fixed Price');
    });

    it('getDirectionColor returns appropriate colors', () => {
      expect(getDirectionColor('up')).toBe('#10b981');
      expect(getDirectionColor('down')).toBe('#ef4444');
      expect(getDirectionColor('stable')).toBe('#94a3b8');
    });
  });
});
