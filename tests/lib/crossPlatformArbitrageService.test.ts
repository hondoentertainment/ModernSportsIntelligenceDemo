// @ts-nocheck
import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
} from 'vitest';
import {
  getArbitrageOpportunities,
  getActiveOpportunities,
  getPlatformPricing,
  getArbitrageStats,
  getFeeComparison,
  getSpreadHistory,
  getArbitrageAlerts,
  calculateNetProfit,
  formatCurrency,
  formatPercent,
  getPlatformColor,
  getPlatformLabel,
  getRiskColor,
  getTypeLabel,
} from '../../lib/trading/crossPlatformArbitrageService';
import { setupLocalStorageMock } from '../helpers';

const localStorageMock = setupLocalStorageMock();

describe('crossPlatformArbitrageService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('getArbitrageOpportunities', () => {
    it('returns at least 25 opportunities', () => {
      const opps = getArbitrageOpportunities();
      expect(opps.length).toBeGreaterThanOrEqual(25);
    });

    it('each opportunity has valid required fields', () => {
      const opps = getArbitrageOpportunities();
      for (const o of opps) {
        expect(o.id).toBeTruthy();
        expect(o.cardName).toBeTruthy();
        expect(o.player).toBeTruthy();
        expect(o.year).toBeGreaterThan(1900);
        expect(o.grade).toBeTruthy();
        expect(o.buyPrice).toBeGreaterThan(0);
        expect(o.sellPrice).toBeGreaterThan(0);
        expect(['active', 'expired', 'executed', 'missed']).toContain(o.status);
        expect(['low', 'medium', 'high']).toContain(o.riskLevel);
        expect(['cross_platform', 'grade_spread', 'condition_arbitrage', 'regional', 'timing']).toContain(o.type);
      }
    });

    it('confidence is between 0 and 100', () => {
      const opps = getArbitrageOpportunities();
      for (const o of opps) {
        expect(o.confidence).toBeGreaterThanOrEqual(0);
        expect(o.confidence).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('getActiveOpportunities', () => {
    it('returns only active status', () => {
      const active = getActiveOpportunities();
      expect(active.length).toBeGreaterThan(0);
      for (const o of active) {
        expect(o.status).toBe('active');
      }
    });

    it('sorted by profitMargin descending', () => {
      const active = getActiveOpportunities();
      for (let i = 1; i < active.length; i++) {
        expect(active[i - 1].profitMargin).toBeGreaterThanOrEqual(active[i].profitMargin);
      }
    });
  });

  describe('getPlatformPricing', () => {
    it('returns pricing for all 8 platforms', () => {
      const pricing = getPlatformPricing();
      expect(pricing.length).toBe(8);
    });

    it('prices are positive', () => {
      const pricing = getPlatformPricing();
      for (const p of pricing) {
        expect(p.lowestPrice).toBeGreaterThan(0);
        expect(p.avgPrice).toBeGreaterThan(0);
        expect(p.highestPrice).toBeGreaterThan(0);
        expect(p.lowestPrice).toBeLessThanOrEqual(p.avgPrice);
        expect(p.avgPrice).toBeLessThanOrEqual(p.highestPrice);
      }
    });

    it('returns varied data for different cardIds', () => {
      const a = getPlatformPricing('card-a');
      const b = getPlatformPricing('card-b');
      // Different seeds should produce at least one different price
      const aDiffs = a.map(p => p.avgPrice);
      const bDiffs = b.map(p => p.avgPrice);
      expect(aDiffs).not.toEqual(bDiffs);
    });
  });

  describe('getArbitrageStats', () => {
    it('returns valid stats', () => {
      const stats = getArbitrageStats();
      expect(stats.totalOpportunities).toBeGreaterThan(0);
      expect(stats.activeOpportunities).toBeGreaterThan(0);
      expect(stats.activeOpportunities).toBeLessThanOrEqual(stats.totalOpportunities);
      expect(stats.avgProfitMargin).toBeGreaterThan(0);
      expect(stats.bestSpread).toBeGreaterThanOrEqual(stats.avgProfitMargin);
      expect(stats.totalPotentialProfit).toBeGreaterThan(0);
      expect(stats.topPlatformPair.buy).toBeTruthy();
      expect(stats.topPlatformPair.sell).toBeTruthy();
      expect(stats.topPlatformPair.avgSpread).toBeGreaterThan(0);
    });
  });

  describe('getFeeComparison', () => {
    it('returns fee data for all 8 platforms', () => {
      const fees = getFeeComparison();
      expect(fees.length).toBe(8);
    });

    it('net on sale is positive and less than $500', () => {
      const fees = getFeeComparison();
      for (const f of fees) {
        expect(f.netOnSale).toBeGreaterThan(0);
        expect(f.netOnSale).toBeLessThanOrEqual(500);
        expect(f.totalCost).toBeGreaterThanOrEqual(0);
      }
    });

    it('total cost equals seller fee + processing + shipping', () => {
      const fees = getFeeComparison();
      for (const f of fees) {
        const expected = Math.round((f.sellerFee + f.paymentProcessing + f.shipping) * 100) / 100;
        expect(f.totalCost).toBeCloseTo(expected, 1);
      }
    });
  });

  describe('getSpreadHistory', () => {
    it('returns 30 days of history', () => {
      const history = getSpreadHistory('arb-001');
      expect(history.length).toBe(30);
    });

    it('spreads are positive', () => {
      const history = getSpreadHistory('arb-001');
      for (const h of history) {
        expect(h.spread).toBeGreaterThan(0);
        expect(h.buyPrice).toBeGreaterThan(0);
        expect(h.sellPrice).toBeGreaterThan(0);
      }
    });

    it('dates are in ascending order', () => {
      const history = getSpreadHistory('arb-003');
      for (let i = 1; i < history.length; i++) {
        expect(history[i].date >= history[i - 1].date).toBe(true);
      }
    });
  });

  describe('getArbitrageAlerts', () => {
    it('returns alerts', () => {
      const alerts = getArbitrageAlerts();
      expect(alerts.length).toBeGreaterThan(0);
    });

    it('alerts have valid fields', () => {
      const alerts = getArbitrageAlerts();
      for (const a of alerts) {
        expect(a.id).toBeTruthy();
        expect(a.opportunityId).toBeTruthy();
        expect(['new_opportunity', 'spread_widening', 'expiring_soon', 'price_change']).toContain(a.type);
        expect(['high', 'medium', 'low']).toContain(a.priority);
        expect(typeof a.isRead).toBe('boolean');
        expect(a.profit).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('calculateNetProfit', () => {
    it('returns positive profit for favorable spread', () => {
      const profit = calculateNetProfit(100, 200, 'comc', 'ebay');
      expect(profit).toBeGreaterThan(0);
    });

    it('returns negative profit when fees exceed spread', () => {
      const profit = calculateNetProfit(100, 101, 'heritage', 'goldin');
      expect(profit).toBeLessThan(0);
    });

    it('accounts for buyer premium on auction platforms', () => {
      const withPremium = calculateNetProfit(100, 200, 'goldin', 'ebay');
      const withoutPremium = calculateNetProfit(100, 200, 'ebay', 'ebay');
      // Goldin has 20% buyer premium, so buying there costs more
      expect(withPremium).toBeLessThan(withoutPremium);
    });
  });

  describe('formatCurrency', () => {
    it('formats positive amounts', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('formats negative amounts', () => {
      expect(formatCurrency(-50)).toBe('-$50.00');
    });

    it('formats zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });
  });

  describe('formatPercent', () => {
    it('formats percentages', () => {
      expect(formatPercent(12.345)).toBe('12.35%');
      expect(formatPercent(0)).toBe('0.00%');
    });
  });

  describe('utility functions', () => {
    it('getPlatformColor returns hex colors', () => {
      expect(getPlatformColor('ebay')).toMatch(/^#[0-9a-f]{6}$/);
      expect(getPlatformColor('goldin')).toMatch(/^#[0-9a-f]{6}$/);
    });

    it('getPlatformLabel returns human-readable names', () => {
      expect(getPlatformLabel('ebay')).toBe('eBay');
      expect(getPlatformLabel('heritage')).toBe('Heritage Auctions');
      expect(getPlatformLabel('comc')).toBe('COMC');
    });

    it('getRiskColor returns hex colors', () => {
      expect(getRiskColor('low')).toMatch(/^#[0-9a-f]{6}$/);
      expect(getRiskColor('medium')).toMatch(/^#[0-9a-f]{6}$/);
      expect(getRiskColor('high')).toMatch(/^#[0-9a-f]{6}$/);
    });

    it('getTypeLabel returns readable labels', () => {
      expect(getTypeLabel('cross_platform')).toBe('Cross-Platform');
      expect(getTypeLabel('grade_spread')).toBe('Grade Spread');
      expect(getTypeLabel('timing')).toBe('Timing');
    });
  });
});
