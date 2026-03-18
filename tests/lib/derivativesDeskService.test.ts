import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getAvailableOptions,
  priceOption,
  getInsurancePolicies,
  createInsurance,
  calculateHedge,
  getVolatilitySurface,
  runScenario,
  getDerivativesStats,
  getPlayerList,
  getPlayerPrice,
} from '../../lib/trading/derivativesDeskService';
import { setupLocalStorageMock } from '../helpers';

const localStorageMock = setupLocalStorageMock();

describe('derivativesDeskService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('getAvailableOptions', () => {
    it('returns options for all players', () => {
      const options = getAvailableOptions();
      expect(options.length).toBeGreaterThan(0);
    });

    it('filters by player name', () => {
      const options = getAvailableOptions('Shohei Ohtani');
      expect(options.length).toBeGreaterThan(0);
      for (const o of options) {
        expect(o.player).toBe('Shohei Ohtani');
      }
    });

    it('each option has valid fields', () => {
      const options = getAvailableOptions('Luka Doncic');
      for (const o of options) {
        expect(o.id).toBeTruthy();
        expect(['call', 'put']).toContain(o.type);
        expect(o.currentPrice).toBeGreaterThan(0);
        expect(o.strikePrice).toBeGreaterThan(0);
        expect(o.premium).toBeGreaterThan(0);
        expect(o.daysToExpiry).toBeGreaterThan(0);
        expect(o.status).toBe('active');
      }
    });

    it('includes both calls and puts', () => {
      const options = getAvailableOptions('Luka Doncic');
      const calls = options.filter(o => o.type === 'call');
      const puts = options.filter(o => o.type === 'put');
      expect(calls.length).toBeGreaterThan(0);
      expect(puts.length).toBeGreaterThan(0);
    });

    it('call delta is positive, put delta is negative', () => {
      const options = getAvailableOptions('Shohei Ohtani');
      for (const o of options) {
        if (o.type === 'call') {
          expect(o.delta).toBeGreaterThanOrEqual(0);
        } else {
          expect(o.delta).toBeLessThanOrEqual(0);
        }
      }
    });
  });

  describe('priceOption', () => {
    it('returns option for valid player', () => {
      const opt = priceOption('call', 'Shohei Ohtani', 1300, 90);
      expect(opt).not.toBeNull();
      expect(opt!.player).toBe('Shohei Ohtani');
      expect(opt!.type).toBe('call');
      expect(opt!.strikePrice).toBe(1300);
      expect(opt!.premium).toBeGreaterThan(0);
    });

    it('returns null for unknown player', () => {
      const opt = priceOption('call', 'Unknown Player XYZ', 100, 30);
      expect(opt).toBeNull();
    });

    it('put premium increases for lower strike', () => {
      const deep = priceOption('put', 'Luka Doncic', 2000, 90);
      const otm = priceOption('put', 'Luka Doncic', 5000, 90);
      expect(deep).not.toBeNull();
      expect(otm).not.toBeNull();
      // Deep ITM put should cost more than OTM put
      expect(otm!.premium).toBeGreaterThan(deep!.premium);
    });
  });

  describe('calculateHedge', () => {
    it('calculates protective put hedge', () => {
      const hedge = calculateHedge('protective_put', 80);
      expect(hedge.portfolioValue).toBeGreaterThan(0);
      expect(hedge.hedgeCost).toBeGreaterThan(0);
      expect(hedge.strategy).toBe('protective_put');
      expect(hedge.costAsPercent).toBeGreaterThan(0);
    });

    it('collar is cheaper than protective put', () => {
      const put = calculateHedge('protective_put', 80);
      const collar = calculateHedge('collar', 80);
      expect(collar.hedgeCost).toBeLessThan(put.hedgeCost);
    });

    it('covered call generates income (negative cost)', () => {
      const cc = calculateHedge('covered_call', 80);
      expect(cc.hedgeCost).toBeLessThan(0);
    });

    it('max loss is bounded', () => {
      const hedge = calculateHedge('protective_put', 90);
      expect(hedge.maxLoss).toBeGreaterThanOrEqual(0);
      expect(hedge.maxLoss).toBeLessThan(hedge.portfolioValue);
    });
  });

  describe('getVolatilitySurface', () => {
    it('returns surface for known player', () => {
      const surface = getVolatilitySurface('Luka Doncic');
      expect(surface.player).toBe('Luka Doncic');
      expect(surface.currentPrice).toBeGreaterThan(0);
      expect(surface.surface.length).toBeGreaterThan(0);
      expect(surface.termStructure.length).toBeGreaterThan(0);
    });

    it('falls back to first player for unknown', () => {
      const surface = getVolatilitySurface('Unknown');
      expect(surface.player).toBeTruthy();
      expect(surface.surface.length).toBeGreaterThan(0);
    });

    it('surface points have positive IV', () => {
      const surface = getVolatilitySurface('Shohei Ohtani');
      for (const p of surface.surface) {
        expect(p.iv).toBeGreaterThan(0);
        expect(p.strike).toBeGreaterThan(0);
        expect(p.expiry).toBeGreaterThan(0);
      }
    });
  });

  describe('runScenario', () => {
    it('runs injury scenario', () => {
      const result = runScenario('injury');
      expect(result.scenario).toContain('Injury');
      expect(result.portfolioImpact).toBeLessThan(0);
      expect(result.savings).toBeGreaterThan(0);
      expect(result.details.length).toBeGreaterThan(0);
    });

    it('runs breakout scenario with positive impact', () => {
      const result = runScenario('breakout');
      expect(result.portfolioImpact).toBeGreaterThan(0);
    });

    it('hedged impact is less severe than unhedged for negative scenarios', () => {
      const result = runScenario('market_crash');
      expect(Math.abs(result.hedgedImpact)).toBeLessThan(Math.abs(result.portfolioImpact));
    });
  });

  describe('getDerivativesStats', () => {
    it('returns valid stats', () => {
      const stats = getDerivativesStats();
      expect(stats.activeOptions).toBeGreaterThan(0);
      expect(typeof stats.activeInsurance).toBe('number');
      expect(typeof stats.totalPremiumsPaid).toBe('number');
      expect(typeof stats.portfolioCoverage).toBe('number');
    });
  });

  describe('getPlayerList', () => {
    it('returns list of player names', () => {
      const players = getPlayerList();
      expect(players.length).toBeGreaterThan(0);
      expect(players).toContain('Shohei Ohtani');
      expect(players).toContain('Luka Doncic');
    });
  });

  describe('getPlayerPrice', () => {
    it('returns price for known player', () => {
      const price = getPlayerPrice('Shohei Ohtani');
      expect(price).toBeGreaterThan(0);
    });

    it('returns 0 for unknown player', () => {
      const price = getPlayerPrice('Nobody');
      expect(price).toBe(0);
    });
  });

  describe('insurance', () => {
    it('starts with no policies', () => {
      const policies = getInsurancePolicies();
      expect(policies).toEqual([]);
    });

    it('creates an insurance policy', () => {
      const policy = createInsurance('card-1', '90%', '90d');
      expect(policy.id).toBeTruthy();
      expect(policy.coverage).toBe('90%');
      expect(policy.duration).toBe('90d');
      expect(policy.premium).toBeGreaterThan(0);
      expect(policy.status).toBe('active');
    });

    it('persists policies in localStorage', () => {
      createInsurance('card-1', '80%', '30d');
      createInsurance('card-2', '100%', '365d');
      const policies = getInsurancePolicies();
      expect(policies.length).toBe(2);
    });
  });
});
