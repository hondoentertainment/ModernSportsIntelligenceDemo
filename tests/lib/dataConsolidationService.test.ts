import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getConsolidatedPrice,
  getArbitrageOpportunities,
  getTransactionFeed,
  getDataQualityReports,
  getConsolidationStats,
  getPlatformComparison,
  PLATFORM_FEES,
  PLATFORM_COLORS,
  ALL_PLATFORMS,
  CARD_SEEDS,
} from '../../lib/utils/dataConsolidationService';
import { setupLocalStorageMock } from '../helpers';

const localStorageMock = setupLocalStorageMock();

describe('dataConsolidationService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('getConsolidatedPrice', () => {
    it('returns consolidated price for known player', () => {
      const result = getConsolidatedPrice('Shohei Ohtani', '2018 Topps Update #US1 RC', 'PSA 10');
      expect(result.player).toContain('Ohtani');
      expect(result.grade).toBe('PSA 10');
      expect(result.consensusPrice).toBeGreaterThan(0);
      expect(result.priceConfidence).toBeGreaterThan(0);
      expect(result.priceConfidence).toBeLessThanOrEqual(100);
      expect(result.platformPrices.length).toBe(6);
    });

    it('returns NBBO with valid spread', () => {
      const result = getConsolidatedPrice('Luka Doncic', '2018 Panini Prizm #280 RC', 'PSA 10');
      expect(result.nbbo.bestBid.price).toBeGreaterThan(0);
      expect(result.nbbo.bestAsk.price).toBeGreaterThan(0);
      expect(result.nbbo.spread).toBeGreaterThanOrEqual(0);
      expect(result.nbbo.spreadPercent).toBeGreaterThanOrEqual(0);
    });

    it('returns platform prices for all 6 platforms', () => {
      const result = getConsolidatedPrice('Mike Trout', '2011 Topps Update #US175 RC', 'PSA 10');
      const platforms = result.platformPrices.map(p => p.platform);
      for (const p of ALL_PLATFORMS) {
        expect(platforms).toContain(p);
      }
    });

    it('each platform price has valid fields', () => {
      const result = getConsolidatedPrice('Shohei Ohtani', '2018 Topps Update #US1 RC', 'PSA 10');
      for (const pp of result.platformPrices) {
        expect(pp.lastSalePrice).toBeGreaterThan(0);
        expect(pp.avgPrice30d).toBeGreaterThan(0);
        expect(pp.volume30d).toBeGreaterThan(0);
        expect(pp.dataQuality).toBeGreaterThanOrEqual(75);
        expect(pp.dataQuality).toBeLessThanOrEqual(100);
        expect(pp.lastSaleDate).toBeTruthy();
        expect(pp.lastUpdated).toBeTruthy();
      }
    });

    it('handles unknown player with fallback pricing', () => {
      const result = getConsolidatedPrice('Unknown Player XYZ', 'Some Card', 'PSA 9');
      expect(result.player).toBe('Unknown Player XYZ');
      expect(result.consensusPrice).toBeGreaterThan(0);
      expect(result.platformPrices.length).toBe(6);
    });

    it('is deterministic for same inputs', () => {
      const a = getConsolidatedPrice('Luka Doncic', '2018 Panini Prizm #280 RC', 'PSA 10');
      localStorageMock.clear();
      const b = getConsolidatedPrice('Luka Doncic', '2018 Panini Prizm #280 RC', 'PSA 10');
      expect(a.consensusPrice).toBe(b.consensusPrice);
    });
  });

  describe('getArbitrageOpportunities', () => {
    it('returns arbitrage opportunities', () => {
      const opps = getArbitrageOpportunities();
      expect(opps.length).toBeGreaterThan(0);
      expect(opps.length).toBeLessThanOrEqual(8);
    });

    it('opportunities sorted by net profit descending', () => {
      const opps = getArbitrageOpportunities();
      for (let i = 1; i < opps.length; i++) {
        expect(opps[i - 1].netProfit).toBeGreaterThanOrEqual(opps[i].netProfit);
      }
    });

    it('each opportunity has valid fields', () => {
      const opps = getArbitrageOpportunities();
      for (const o of opps) {
        expect(o.id).toBeTruthy();
        expect(o.player).toBeTruthy();
        expect(o.buyPrice).toBeGreaterThan(0);
        expect(o.sellPrice).toBeGreaterThan(o.buyPrice);
        expect(o.netProfit).toBeGreaterThan(0);
        expect(o.spreadPercent).toBeGreaterThan(0);
        expect(o.confidence).toBeGreaterThanOrEqual(65);
        expect(o.confidence).toBeLessThanOrEqual(100);
        expect(o.expiresAt).toBeTruthy();
        expect(ALL_PLATFORMS).toContain(o.buyPlatform);
        expect(ALL_PLATFORMS).toContain(o.sellPlatform);
        expect(o.buyPlatform).not.toBe(o.sellPlatform);
      }
    });
  });

  describe('getTransactionFeed', () => {
    it('returns transactions without filters', () => {
      const txns = getTransactionFeed();
      expect(txns.length).toBeGreaterThan(0);
      expect(txns.length).toBeLessThanOrEqual(20);
    });

    it('filters by platform', () => {
      const txns = getTransactionFeed({ platform: 'eBay' });
      for (const t of txns) {
        expect(t.platform).toBe('eBay');
      }
    });

    it('filters by player name (case insensitive)', () => {
      const txns = getTransactionFeed({ player: 'ohtani' });
      for (const t of txns) {
        expect(t.player.toLowerCase()).toContain('ohtani');
      }
    });

    it('transactions have valid fields', () => {
      const txns = getTransactionFeed();
      for (const t of txns) {
        expect(t.id).toBeTruthy();
        expect(t.player).toBeTruthy();
        expect(t.price).toBeGreaterThan(0);
        expect(['sale', 'listing', 'bid']).toContain(t.type);
        expect(typeof t.verified).toBe('boolean');
        expect(t.date).toBeTruthy();
      }
    });

    it('transactions sorted by date descending', () => {
      const txns = getTransactionFeed();
      for (let i = 1; i < txns.length; i++) {
        expect(new Date(txns[i - 1].date).getTime())
          .toBeGreaterThanOrEqual(new Date(txns[i].date).getTime());
      }
    });

    it('returns empty for impossible filter', () => {
      const txns = getTransactionFeed({ player: 'ZZZZNONEXISTENT' });
      expect(txns).toEqual([]);
    });
  });

  describe('getDataQualityReports', () => {
    it('returns reports for all 6 platforms', () => {
      const reports = getDataQualityReports();
      expect(reports.length).toBe(6);
      const platforms = reports.map(r => r.platform);
      for (const p of ALL_PLATFORMS) {
        expect(platforms).toContain(p);
      }
    });

    it('each report has valid fields', () => {
      const reports = getDataQualityReports();
      for (const r of reports) {
        expect(r.totalRecords).toBeGreaterThan(0);
        expect(r.verifiedPercent).toBeGreaterThan(0);
        expect(r.verifiedPercent).toBeLessThanOrEqual(100);
        expect(r.suspiciousTransactions).toBeGreaterThanOrEqual(0);
        expect(r.avgLatency).toBeGreaterThan(0);
        expect(r.dataFreshness).toBeGreaterThanOrEqual(0);
        expect(r.overallScore).toBeGreaterThanOrEqual(50);
        expect(r.overallScore).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('getConsolidationStats', () => {
    it('returns valid stats', () => {
      const stats = getConsolidationStats();
      expect(stats.totalPlatforms).toBe(6);
      expect(stats.totalTransactionsTracked).toBeGreaterThan(0);
      expect(stats.activeArbitrageOps).toBeGreaterThan(0);
      expect(stats.avgSpread).toBeGreaterThan(0);
      expect(stats.dataPointsToday).toBeGreaterThan(0);
      expect(stats.lastSync).toBeTruthy();
    });
  });

  describe('getPlatformComparison', () => {
    it('returns prices for all platforms', () => {
      const prices = getPlatformComparison('Luka Doncic', '2018 Panini Prizm #280 RC');
      expect(prices.length).toBe(6);
    });
  });

  describe('constants', () => {
    it('PLATFORM_FEES has entries for all platforms', () => {
      for (const p of ALL_PLATFORMS) {
        const fee = PLATFORM_FEES[p];
        expect(fee).toBeDefined();
        expect(fee.sellerFee).toBeGreaterThanOrEqual(0);
        expect(fee.sellerFee).toBeLessThan(1);
        expect(fee.label).toBeTruthy();
      }
    });

    it('PLATFORM_COLORS has entries for all platforms', () => {
      for (const p of ALL_PLATFORMS) {
        expect(PLATFORM_COLORS[p]).toBeTruthy();
      }
    });

    it('CARD_SEEDS has entries', () => {
      expect(CARD_SEEDS.length).toBeGreaterThan(0);
      for (const c of CARD_SEEDS) {
        expect(c.player).toBeTruthy();
        expect(c.basePrice).toBeGreaterThan(0);
      }
    });
  });
});
