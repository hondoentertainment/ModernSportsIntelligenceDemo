import { describe, it, expect, beforeEach } from 'vitest';
import { setupLocalStorageMock } from '../helpers';
import {
  getBenchmarks,
  getPortfolioPerformance,
  getPerformanceTimeSeries,
  getAssetAllocation,
  getRiskMetrics,
  getPeerComparison,
  getDrawdownPeriods,
  getMonthlyReturns,
  getCorrelationMatrix,
  getIndexLabel,
  getIndexColor,
  getRiskColor,
  formatCurrency,
  formatPercent,
  formatDate,
  type BenchmarkIndex,
} from '../../lib/analytics/portfolioBenchmarkService';

const localStorageMock = setupLocalStorageMock();

describe('portfolioBenchmarkService', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  // ---- getBenchmarks ----
  describe('getBenchmarks', () => {
    it('returns all 10 benchmark indices', () => {
      const benchmarks = getBenchmarks();
      expect(benchmarks).toHaveLength(10);
    });

    it('includes all required indices', () => {
      const indices: BenchmarkIndex[] = [
        'sp500', 'nasdaq', 'bitcoin', 'gold', 'real_estate',
        'psa_500', 'card_market', 'vintage_index', 'modern_index', 'rookie_index',
      ];
      const benchmarks = getBenchmarks();
      const found = benchmarks.map((b) => b.index);
      for (const idx of indices) {
        expect(found).toContain(idx);
      }
    });

    it('every benchmark has complete return periods', () => {
      const benchmarks = getBenchmarks();
      const periods = ['1m', '3m', '6m', 'ytd', '1y', '3y', '5y'] as const;
      for (const b of benchmarks) {
        for (const p of periods) {
          expect(typeof b.returns[p]).toBe('number');
        }
      }
    });

    it('every benchmark has valid volatility and sharpeRatio', () => {
      for (const b of getBenchmarks()) {
        expect(b.volatility).toBeGreaterThan(0);
        expect(typeof b.sharpeRatio).toBe('number');
      }
    });
  });

  // ---- getPortfolioPerformance ----
  describe('getPortfolioPerformance', () => {
    it('returns performance with valid Sharpe ratio range', () => {
      const perf = getPortfolioPerformance();
      expect(perf.sharpeRatio).toBeGreaterThan(-5);
      expect(perf.sharpeRatio).toBeLessThan(10);
    });

    it('has alpha and beta in reasonable ranges', () => {
      const perf = getPortfolioPerformance();
      expect(perf.alpha).toBeGreaterThan(-50);
      expect(perf.alpha).toBeLessThan(50);
      expect(perf.beta).toBeGreaterThan(-3);
      expect(perf.beta).toBeLessThan(5);
    });

    it('maxDrawdown is negative', () => {
      const perf = getPortfolioPerformance();
      expect(perf.maxDrawdown).toBeLessThan(0);
    });

    it('totalReturn equals totalValue minus totalCostBasis', () => {
      const perf = getPortfolioPerformance();
      expect(perf.totalReturn).toBe(perf.totalValue - perf.totalCostBasis);
    });

    it('winRate is between 0 and 100', () => {
      const perf = getPortfolioPerformance();
      expect(perf.winRate).toBeGreaterThanOrEqual(0);
      expect(perf.winRate).toBeLessThanOrEqual(100);
    });
  });

  // ---- getPerformanceTimeSeries ----
  describe('getPerformanceTimeSeries', () => {
    it('returns 52 data points for full series', () => {
      const series = getPerformanceTimeSeries();
      expect(series).toHaveLength(52);
    });

    it('dates are in ascending order', () => {
      const series = getPerformanceTimeSeries();
      for (let i = 1; i < series.length; i++) {
        expect(series[i].date >= series[i - 1].date).toBe(true);
      }
    });

    it('returns fewer points for shorter timeframes', () => {
      const full = getPerformanceTimeSeries('all');
      const oneMonth = getPerformanceTimeSeries('1m');
      expect(oneMonth.length).toBeLessThanOrEqual(full.length);
    });

    it('each data point has all required fields', () => {
      const series = getPerformanceTimeSeries();
      for (const pt of series) {
        expect(pt.date).toBeTruthy();
        expect(typeof pt.portfolioValue).toBe('number');
        expect(typeof pt.portfolioReturn).toBe('number');
        expect(typeof pt.sp500Return).toBe('number');
        expect(typeof pt.cardMarketReturn).toBe('number');
        expect(typeof pt.bitcoinReturn).toBe('number');
      }
    });
  });

  // ---- getMonthlyReturns ----
  describe('getMonthlyReturns', () => {
    it('spans 24 months', () => {
      const monthly = getMonthlyReturns();
      expect(monthly).toHaveLength(24);
    });

    it('months are in chronological order', () => {
      const monthly = getMonthlyReturns();
      for (let i = 1; i < monthly.length; i++) {
        const prev = monthly[i - 1].year * 12 + monthly[i - 1].month;
        const curr = monthly[i].year * 12 + monthly[i].month;
        expect(curr).toBeGreaterThan(prev);
      }
    });

    it('each entry has valid month label', () => {
      const validLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      for (const m of getMonthlyReturns()) {
        expect(validLabels).toContain(m.monthLabel);
      }
    });
  });

  // ---- getRiskMetrics ----
  describe('getRiskMetrics', () => {
    it('VaR95 is less severe than VaR99', () => {
      const risk = getRiskMetrics();
      expect(risk.valueAtRisk95).toBeGreaterThan(risk.valueAtRisk99);
    });

    it('has 5 stress test scenarios', () => {
      const risk = getRiskMetrics();
      expect(risk.stressTest).toHaveLength(5);
    });

    it('diversificationScore is 0-100', () => {
      const risk = getRiskMetrics();
      expect(risk.diversificationScore).toBeGreaterThanOrEqual(0);
      expect(risk.diversificationScore).toBeLessThanOrEqual(100);
    });

    it('stress test impacts are negative', () => {
      for (const st of getRiskMetrics().stressTest) {
        expect(st.impact).toBeLessThan(0);
      }
    });
  });

  // ---- getCorrelationMatrix ----
  describe('getCorrelationMatrix', () => {
    it('is symmetric (corr(a,b) === corr(b,a))', () => {
      const matrix = getCorrelationMatrix();
      const lookup = new Map<string, number>();
      matrix.forEach((c) => lookup.set(`${c.asset1}|${c.asset2}`, c.correlation));

      for (const c of matrix) {
        const reverse = lookup.get(`${c.asset2}|${c.asset1}`);
        expect(reverse).toBe(c.correlation);
      }
    });

    it('diagonal entries are 1.0', () => {
      const matrix = getCorrelationMatrix();
      const diag = matrix.filter((c) => c.asset1 === c.asset2);
      expect(diag.length).toBeGreaterThan(0);
      for (const d of diag) {
        expect(d.correlation).toBe(1.0);
      }
    });

    it('all correlations are between -1 and 1', () => {
      for (const c of getCorrelationMatrix()) {
        expect(c.correlation).toBeGreaterThanOrEqual(-1);
        expect(c.correlation).toBeLessThanOrEqual(1);
      }
    });
  });

  // ---- getPeerComparison ----
  describe('getPeerComparison', () => {
    it('percentile is between 0 and 100', () => {
      const peers = getPeerComparison();
      expect(peers.percentile).toBeGreaterThanOrEqual(0);
      expect(peers.percentile).toBeLessThanOrEqual(100);
    });

    it('rank does not exceed totalUsers', () => {
      const peers = getPeerComparison();
      expect(peers.rankByReturn).toBeLessThanOrEqual(peers.totalUsers);
      expect(peers.rankByRiskAdjusted).toBeLessThanOrEqual(peers.totalUsers);
    });

    it('category ranks are valid', () => {
      const peers = getPeerComparison();
      for (const cr of peers.categoryRanks) {
        expect(cr.rank).toBeGreaterThan(0);
        expect(cr.rank).toBeLessThanOrEqual(cr.total);
      }
    });
  });

  // ---- getDrawdownPeriods ----
  describe('getDrawdownPeriods', () => {
    it('all drawdowns are negative', () => {
      for (const d of getDrawdownPeriods()) {
        expect(d.drawdown).toBeLessThan(0);
      }
    });

    it('trough is less than peak', () => {
      for (const d of getDrawdownPeriods()) {
        expect(d.trough).toBeLessThan(d.peak);
      }
    });
  });

  // ---- getAssetAllocation ----
  describe('getAssetAllocation', () => {
    it('percentages sum close to 100', () => {
      const total = getAssetAllocation().reduce((s, a) => s + a.percentage, 0);
      expect(total).toBeGreaterThan(99);
      expect(total).toBeLessThan(101);
    });
  });

  // ---- Utility functions ----
  describe('utility functions', () => {
    it('getIndexLabel returns readable labels', () => {
      expect(getIndexLabel('sp500')).toBe('S&P 500');
      expect(getIndexLabel('bitcoin')).toBe('Bitcoin');
    });

    it('getIndexColor returns hex colors', () => {
      expect(getIndexColor('sp500')).toMatch(/^#[0-9a-f]{6}$/);
    });

    it('getRiskColor returns hex colors', () => {
      expect(getRiskColor('aggressive')).toMatch(/^#[0-9a-f]{6}$/);
    });

    it('formatCurrency handles positive and negative', () => {
      expect(formatCurrency(1500)).toContain('$');
      expect(formatCurrency(-1500)).toContain('-$');
    });

    it('formatPercent includes sign', () => {
      expect(formatPercent(5.23)).toBe('+5.23%');
      expect(formatPercent(-3.1)).toBe('-3.10%');
    });

    it('formatDate returns readable date', () => {
      const formatted = formatDate('2024-06-15');
      expect(formatted).toContain('Jun');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });
  });
});
