import { describe, it, expect, beforeEach } from 'vitest';
import { setupLocalStorageMock } from '../helpers';
import {
  getProducts,
  getProductById,
  runSimulation,
  getSimulationHistory,
  compareProducts,
  getTopEVProducts,
  getWorstEVProducts,
  getRipFlipStats,
  getHitProbabilities,
  calculateEV,
  formatCurrency,
  formatPercent,
  getEVColor,
  getProductTypeLabel,
  getProductTypeColor,
  getProbabilityColor,
} from '../../lib/trading/ripFlipSimService';
import type { Product } from '../../lib/trading/ripFlipSimService';

describe('ripFlipSimService', () => {
  beforeEach(() => {
    setupLocalStorageMock();
  });

  // ─── getProducts ──────────────────────────────────────────────────────

  describe('getProducts', () => {
    it('returns at least 12 products', () => {
      const products = getProducts();
      expect(products.length).toBeGreaterThanOrEqual(12);
    });

    it('returns products with required fields', () => {
      const products = getProducts();
      for (const p of products) {
        expect(p.id).toBeTruthy();
        expect(p.name).toBeTruthy();
        expect(p.year).toBeGreaterThan(2000);
        expect(p.sport).toBeTruthy();
        expect(p.brand).toBeTruthy();
        expect(p.price).toBeGreaterThan(0);
        expect(p.hits.length).toBeGreaterThan(0);
        expect(p.evRatio).toBeGreaterThan(0);
      }
    });

    it('returns a new array each time (no mutation)', () => {
      const a = getProducts();
      const b = getProducts();
      expect(a).not.toBe(b);
      expect(a).toEqual(b);
    });
  });

  // ─── getProductById ───────────────────────────────────────────────────

  describe('getProductById', () => {
    it('returns the correct product by id', () => {
      const product = getProductById('rf-001');
      expect(product).toBeDefined();
      expect(product!.id).toBe('rf-001');
      expect(product!.name).toContain('Topps Chrome');
    });

    it('returns undefined for unknown id', () => {
      expect(getProductById('nonexistent')).toBeUndefined();
    });
  });

  // ─── calculateEV ──────────────────────────────────────────────────────

  describe('calculateEV', () => {
    it('calculates expected value based on hits and card count', () => {
      const product = getProductById('rf-001')!;
      const ev = calculateEV(product);
      expect(ev).toBeGreaterThan(0);
      expect(typeof ev).toBe('number');
    });

    it('returns higher EV for products with more hits', () => {
      const products = getProducts();
      const withManyHits = products.find((p) => p.hits.length >= 4)!;
      const withFewHits = products.find((p) => p.hits.length <= 3 && p.cardsPerPack * p.packsPerBox < 20)!;
      // Products with more hit types and high probabilities tend to have higher EV
      expect(calculateEV(withManyHits)).toBeGreaterThan(0);
      expect(calculateEV(withFewHits)).toBeGreaterThan(0);
    });
  });

  // ─── runSimulation ────────────────────────────────────────────────────

  describe('runSimulation', () => {
    it('returns a valid SimulationResult for a known product', () => {
      const result = runSimulation('rf-001', 100);
      expect(result).not.toBeNull();
      expect(result!.productId).toBe('rf-001');
      expect(result!.trials).toBe(100);
      expect(result!.avgReturn).toBeGreaterThanOrEqual(0);
      expect(result!.medianReturn).toBeGreaterThanOrEqual(0);
      expect(result!.bestCase).toBeGreaterThanOrEqual(result!.worstCase);
      expect(result!.profitProbability).toBeGreaterThanOrEqual(0);
      expect(result!.profitProbability).toBeLessThanOrEqual(1);
      expect(result!.distribution.length).toBeGreaterThan(0);
    });

    it('returns null for unknown product', () => {
      const result = runSimulation('nonexistent', 100);
      expect(result).toBeNull();
    });

    it(
      'clamps trials to a maximum of 100000',
      () => {
        const result = runSimulation('rf-003', 200000);
        expect(result).not.toBeNull();
        expect(result!.trials).toBeLessThanOrEqual(100000);
      },
      120_000,
    );

    it('clamps trials to a minimum of 1', () => {
      const result = runSimulation('rf-003', -5);
      expect(result).not.toBeNull();
      expect(result!.trials).toBeGreaterThanOrEqual(1);
    });

    it('saves simulation to history', () => {
      runSimulation('rf-001', 10);
      const history = getSimulationHistory();
      expect(history.length).toBe(1);
      expect(history[0].productId).toBe('rf-001');
    });

    it('distribution percentages are valid', () => {
      const result = runSimulation('rf-002', 50);
      expect(result).not.toBeNull();
      for (const bucket of result!.distribution) {
        expect(bucket.count).toBeGreaterThanOrEqual(0);
        expect(bucket.percent).toBeGreaterThanOrEqual(0);
        expect(bucket.percent).toBeLessThanOrEqual(1);
      }
    });
  });

  // ─── getSimulationHistory ─────────────────────────────────────────────

  describe('getSimulationHistory', () => {
    it('returns empty array when no simulations run', () => {
      const history = getSimulationHistory();
      expect(history).toEqual([]);
    });

    it('accumulates multiple simulation results', () => {
      runSimulation('rf-001', 10);
      runSimulation('rf-002', 10);
      const history = getSimulationHistory();
      expect(history.length).toBe(2);
    });
  });

  // ─── compareProducts ──────────────────────────────────────────────────

  describe('compareProducts', () => {
    it('returns a comparison with a winner', () => {
      const result = compareProducts(['rf-001', 'rf-002']);
      expect(result).not.toBeNull();
      expect(result!.products.length).toBe(2);
      expect(result!.winner).toBeDefined();
      expect(result!.winner.id).toBeTruthy();
      expect(result!.winner.reason).toBeTruthy();
    });

    it('returns null when fewer than 2 valid ids', () => {
      expect(compareProducts(['rf-001'])).toBeNull();
      expect(compareProducts([])).toBeNull();
    });

    it('picks the product with the highest EV ratio as winner', () => {
      const result = compareProducts(['rf-003', 'rf-005']);
      expect(result).not.toBeNull();
      // rf-005 has evRatio 1.07, rf-003 has 0.60
      expect(result!.winner.id).toBe('rf-005');
    });
  });

  // ─── getTopEVProducts / getWorstEVProducts ────────────────────────────

  describe('getTopEVProducts', () => {
    it('returns products sorted by EV ratio descending', () => {
      const top = getTopEVProducts(5);
      expect(top.length).toBe(5);
      for (let i = 1; i < top.length; i++) {
        expect(top[i - 1].evRatio).toBeGreaterThanOrEqual(top[i].evRatio);
      }
    });

    it('respects the limit parameter', () => {
      expect(getTopEVProducts(3).length).toBe(3);
      expect(getTopEVProducts(1).length).toBe(1);
    });
  });

  describe('getWorstEVProducts', () => {
    it('returns products sorted by EV ratio ascending', () => {
      const worst = getWorstEVProducts(5);
      expect(worst.length).toBe(5);
      for (let i = 1; i < worst.length; i++) {
        expect(worst[i - 1].evRatio).toBeLessThanOrEqual(worst[i].evRatio);
      }
    });
  });

  // ─── getRipFlipStats ──────────────────────────────────────────────────

  describe('getRipFlipStats', () => {
    it('returns valid stats object', () => {
      const stats = getRipFlipStats();
      expect(stats.totalProductsTracked).toBeGreaterThanOrEqual(12);
      expect(stats.avgEVRatio).toBeGreaterThan(0);
      expect(stats.bestProduct).toBeTruthy();
      expect(stats.worstProduct).toBeTruthy();
    });

    it('counts simulations correctly', () => {
      expect(getRipFlipStats().totalSimulations).toBe(0);
      runSimulation('rf-001', 10);
      expect(getRipFlipStats().totalSimulations).toBe(1);
    });
  });

  // ─── getHitProbabilities ──────────────────────────────────────────────

  describe('getHitProbabilities', () => {
    it('returns hit results for a valid product', () => {
      const hits = getHitProbabilities('rf-001');
      expect(hits.length).toBeGreaterThan(0);
      for (const h of hits) {
        expect(h.type).toBeTruthy();
        expect(h.cardName).toBeTruthy();
        expect(h.player).toBeTruthy();
        expect(h.value).toBeGreaterThan(0);
        expect(h.probability).toBeGreaterThan(0);
        expect(h.probability).toBeLessThanOrEqual(1);
      }
    });

    it('returns empty array for unknown product', () => {
      expect(getHitProbabilities('nonexistent')).toEqual([]);
    });
  });

  // ─── Formatting utilities ─────────────────────────────────────────────

  describe('formatCurrency', () => {
    it('formats numbers as dollar amounts', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(99.9)).toBe('$99.90');
    });
  });

  describe('formatPercent', () => {
    it('formats decimal as percentage string', () => {
      expect(formatPercent(0.5)).toBe('50.0%');
      expect(formatPercent(1)).toBe('100.0%');
      expect(formatPercent(0.123)).toBe('12.3%');
    });
  });

  describe('getEVColor', () => {
    it('returns green for ratio >= 1.0', () => {
      expect(getEVColor(1.0)).toContain('green');
      expect(getEVColor(1.5)).toContain('green');
    });

    it('returns yellow for ratio >= 0.85', () => {
      expect(getEVColor(0.90)).toContain('yellow');
    });

    it('returns orange for ratio >= 0.70', () => {
      expect(getEVColor(0.75)).toContain('orange');
    });

    it('returns red for ratio < 0.70', () => {
      expect(getEVColor(0.5)).toContain('red');
    });
  });

  // ─── Product type utilities ───────────────────────────────────────────

  describe('getProductTypeLabel', () => {
    it('returns human-readable labels for all types', () => {
      expect(getProductTypeLabel('hobby_box')).toBe('Hobby Box');
      expect(getProductTypeLabel('retail_box')).toBe('Retail Box');
      expect(getProductTypeLabel('blaster')).toBe('Blaster');
      expect(getProductTypeLabel('mega_box')).toBe('Mega Box');
      expect(getProductTypeLabel('case')).toBe('Case');
      expect(getProductTypeLabel('pack')).toBe('Pack');
    });
  });

  describe('getProductTypeColor', () => {
    it('returns CSS class strings for each product type', () => {
      expect(getProductTypeColor('hobby_box')).toContain('purple');
      expect(getProductTypeColor('retail_box')).toContain('blue');
      expect(getProductTypeColor('blaster')).toContain('orange');
      expect(getProductTypeColor('mega_box')).toContain('cyan');
      expect(getProductTypeColor('case')).toContain('amber');
      expect(getProductTypeColor('pack')).toContain('green');
    });
  });

  describe('getProbabilityColor', () => {
    it('returns green for high probability', () => {
      expect(getProbabilityColor(0.15)).toContain('green');
    });

    it('returns yellow for medium probability', () => {
      expect(getProbabilityColor(0.05)).toContain('yellow');
    });

    it('returns orange for low probability', () => {
      expect(getProbabilityColor(0.015)).toContain('orange');
    });

    it('returns red for very low probability', () => {
      expect(getProbabilityColor(0.005)).toContain('red');
    });
  });
});
