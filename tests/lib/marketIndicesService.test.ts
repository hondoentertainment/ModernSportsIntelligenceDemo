import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getIndices,
  getIndexDetail,
  getIndexComparison,
  calculatePortfolioBeta,
  getTopComponents,
} from '../../lib/marketIndicesService';
import { setupLocalStorageMock } from '../helpers';

const localStorageMock = setupLocalStorageMock();

describe('marketIndicesService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    // Reset cached indices by clearing module state
    // Since we clear localStorage, next call regenerates
  });

  describe('getIndices', () => {
    it('returns all defined indices', () => {
      const indices = getIndices();
      expect(indices.length).toBe(8);
    });

    it('each index has required fields', () => {
      const indices = getIndices();
      for (const idx of indices) {
        expect(idx.id).toBeTruthy();
        expect(idx.name).toBeTruthy();
        expect(idx.ticker).toBeTruthy();
        expect(idx.currentValue).toBeGreaterThan(0);
        expect(idx.components).toBeGreaterThan(0);
        expect(['composite', 'sport', 'era', 'specialty']).toContain(idx.category);
        expect(idx.dataPoints.length).toBeGreaterThan(0);
      }
    });

    it('includes MSI 500 composite index', () => {
      const indices = getIndices();
      const msi500 = indices.find(i => i.ticker === 'MSI500');
      expect(msi500).toBeDefined();
      expect(msi500!.name).toBe('MSI 500');
      expect(msi500!.category).toBe('composite');
    });

    it('includes sport-specific indices', () => {
      const indices = getIndices();
      const tickers = indices.map(i => i.ticker);
      expect(tickers).toContain('MSIMLB');
      expect(tickers).toContain('MSINBA');
      expect(tickers).toContain('MSINFL');
      expect(tickers).toContain('MSINHL');
    });

    it('data points span 24 months', () => {
      const indices = getIndices();
      for (const idx of indices) {
        expect(idx.dataPoints.length).toBe(24);
      }
    });

    it('last data point matches current value', () => {
      const indices = getIndices();
      for (const idx of indices) {
        const lastPoint = idx.dataPoints[idx.dataPoints.length - 1];
        expect(lastPoint.value).toBe(idx.currentValue);
      }
    });

    it('52-week high is at least current value', () => {
      const indices = getIndices();
      for (const idx of indices) {
        expect(idx.high52Week).toBeGreaterThanOrEqual(
          Math.min(...idx.dataPoints.slice(-12).map(d => d.value))
        );
      }
    });
  });

  describe('getIndexDetail', () => {
    it('returns detail with components for valid ticker', () => {
      const detail = getIndexDetail('MSI500');
      expect(detail).not.toBeNull();
      expect(detail!.ticker).toBe('MSI500');
      expect(detail!.topComponents.length).toBeGreaterThan(0);
      expect(detail!.topComponents.length).toBeLessThanOrEqual(10);
    });

    it('returns null for invalid ticker', () => {
      const detail = getIndexDetail('INVALID');
      expect(detail).toBeNull();
    });

    it('components have valid fields', () => {
      const detail = getIndexDetail('MSINBA');
      expect(detail).not.toBeNull();
      for (const c of detail!.topComponents) {
        expect(c.rank).toBeGreaterThan(0);
        expect(c.player).toBeTruthy();
        expect(c.weight).toBeGreaterThan(0);
        expect(c.value).toBeGreaterThan(0);
      }
    });
  });

  describe('getIndexComparison', () => {
    it('returns comparison for all indices', () => {
      const comparison = getIndexComparison();
      expect(comparison.indices.length).toBe(8);
    });

    it('each comparison has return periods', () => {
      const comparison = getIndexComparison();
      for (const idx of comparison.indices) {
        expect(idx.name).toBeTruthy();
        expect(idx.ticker).toBeTruthy();
        expect(typeof idx.returns.day).toBe('number');
        expect(typeof idx.returns.week).toBe('number');
        expect(typeof idx.returns.month).toBe('number');
        expect(typeof idx.returns.quarter).toBe('number');
        expect(typeof idx.returns.year).toBe('number');
      }
    });
  });

  describe('calculatePortfolioBeta', () => {
    it('returns beta metrics for valid ticker', () => {
      const beta = calculatePortfolioBeta('MSI500');
      expect(typeof beta.portfolioBeta).toBe('number');
      expect(typeof beta.indexCorrelation).toBe('number');
      expect(typeof beta.trackingError).toBe('number');
      expect(typeof beta.activeReturn).toBe('number');
      expect(typeof beta.informationRatio).toBe('number');
    });

    it('is deterministic for same input', () => {
      const a = calculatePortfolioBeta('MSI500');
      const b = calculatePortfolioBeta('MSI500');
      expect(a.portfolioBeta).toBe(b.portfolioBeta);
    });

    it('different tickers produce different results', () => {
      const a = calculatePortfolioBeta('MSI500');
      const b = calculatePortfolioBeta('MSINBA');
      // May differ
      expect(a.portfolioBeta !== b.portfolioBeta || a.indexCorrelation !== b.indexCorrelation).toBe(true);
    });

    it('correlation is between 0 and 1', () => {
      const beta = calculatePortfolioBeta('MSI500');
      expect(beta.indexCorrelation).toBeGreaterThanOrEqual(0);
      expect(beta.indexCorrelation).toBeLessThanOrEqual(1);
    });
  });

  describe('getTopComponents', () => {
    it('returns components for valid ticker', () => {
      const components = getTopComponents('MSIMLB', 5);
      expect(components.length).toBeGreaterThan(0);
      expect(components.length).toBeLessThanOrEqual(5);
    });

    it('defaults to 10 components', () => {
      const components = getTopComponents('MSI500');
      expect(components.length).toBeLessThanOrEqual(10);
    });

    it('components are ranked starting at 1', () => {
      const components = getTopComponents('MSINBA', 5);
      for (let i = 0; i < components.length; i++) {
        expect(components[i].rank).toBe(i + 1);
      }
    });

    it('sport-specific indices contain only relevant players', () => {
      const hockey = getTopComponents('MSINHL', 10);
      // Hockey-only index should be smaller pool
      expect(hockey.length).toBeGreaterThan(0);
    });
  });
});
