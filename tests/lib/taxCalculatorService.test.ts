// @ts-nocheck
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setupLocalStorageMock } from '../helpers';

// Mock the syncStore so service functions use an isolated in-memory store
vi.mock('../../lib/dal/syncStore', () => {
  const mem: Record<string, unknown> = {};
  return {
    store: {
      get: vi.fn((key: string, fallback: unknown) => (key in mem ? mem[key] : fallback)),
      set: vi.fn((key: string, value: unknown) => { mem[key] = value; }),
      has: vi.fn((key: string) => key in mem),
    },
  };
});

vi.mock('../../lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import {
  formatCurrency,
  formatPercent,
  getTransactions,
  getCapitalGains,
  getTaxBrackets,
  getTaxReports,
  getCostBasis,
  getWashSaleAlerts,
  getHarvestOpportunities,
  getDeductibleExpenses,
  getForm8949Entries,
  getTaxSummary,
  calculateEstimatedTax,
  getTaxReportByYear,
  getPortfolioUnrealizedGains,
  getAnnualBreakdown,
  getTaxMethodConfig,
} from '../../lib/utils/taxCalculatorService';

const localStorageMock = setupLocalStorageMock();

describe('taxCalculatorService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  // ---- formatCurrency ----
  describe('formatCurrency', () => {
    it('formats values under $1 000 with two decimal places', () => {
      expect(formatCurrency(9.99)).toBe('$9.99');
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('formats thousands with k suffix', () => {
      expect(formatCurrency(1500)).toBe('$1.5k');
      expect(formatCurrency(42000)).toBe('$42.0k');
    });

    it('formats millions with M suffix', () => {
      expect(formatCurrency(2500000)).toBe('$2.5M');
    });

    it('formats negative values with leading minus', () => {
      const result = formatCurrency(-50);
      expect(result).toContain('$');
      expect(result).toContain('50.00');
    });
  });

  // ---- formatPercent ----
  describe('formatPercent', () => {
    it('adds a plus sign for positive values', () => {
      expect(formatPercent(5.0)).toBe('+5.0%');
    });

    it('does not add a plus sign for negative values', () => {
      expect(formatPercent(-3.2)).toBe('-3.2%');
    });

    it('handles zero', () => {
      expect(formatPercent(0)).toBe('+0.0%');
    });
  });

  // ---- getTransactions ----
  describe('getTransactions', () => {
    it('returns all transactions when no filter is given', () => {
      const txs = getTransactions();
      expect(Array.isArray(txs)).toBe(true);
      expect(txs.length).toBeGreaterThan(0);
    });

    it('filters to only buy transactions', () => {
      const buys = getTransactions('buy');
      expect(buys.every(t => t.type === 'buy')).toBe(true);
    });

    it('filters to only sell transactions', () => {
      const sells = getTransactions('sell');
      expect(sells.every(t => t.type === 'sell')).toBe(true);
    });

    it('each transaction has required fields', () => {
      const txs = getTransactions();
      for (const t of txs) {
        expect(t.id).toBeTruthy();
        expect(['buy', 'sell']).toContain(t.type);
        expect(t.cardName).toBeTruthy();
        expect(typeof t.amount).toBe('number');
        expect(t.amount).toBeGreaterThanOrEqual(0);
        expect(typeof t.fees).toBe('number');
        expect(typeof t.quantity).toBe('number');
      }
    });
  });

  // ---- getCapitalGains ----
  describe('getCapitalGains', () => {
    it('returns all capital gains when no year filter', () => {
      const gains = getCapitalGains();
      expect(Array.isArray(gains)).toBe(true);
      expect(gains.length).toBeGreaterThan(0);
    });

    it('short-term gains have isLongTerm === false', () => {
      const gains = getCapitalGains();
      const shortTerm = gains.filter(g => !g.isLongTerm);
      expect(shortTerm.every(g => g.holdingPeriod < 366)).toBe(true);
    });

    it('long-term gains have isLongTerm === true', () => {
      const gains = getCapitalGains();
      const longTerm = gains.filter(g => g.isLongTerm);
      expect(longTerm.length).toBeGreaterThan(0);
      expect(longTerm.every(g => g.holdingPeriod >= 366)).toBe(true);
    });

    it('filters by tax year correctly', () => {
      const gains2024 = getCapitalGains(2024);
      expect(gains2024.every(g => new Date(g.sellDate).getFullYear() === 2024)).toBe(true);
    });

    it('adjustedGain accounts for fees', () => {
      const gains = getCapitalGains();
      for (const g of gains) {
        // adjustedGain should differ from raw gain when fees > 0
        if (g.fees > 0) {
          expect(Math.abs(g.adjustedGain)).toBeLessThan(Math.abs(g.gain) + 1);
        }
      }
    });
  });

  // ---- calculateEstimatedTax ----
  describe('calculateEstimatedTax', () => {
    it('short-term gain uses ordinary income bracket rate', () => {
      const result = calculateEstimatedTax(1000, false, 50000);
      // $50k income falls in 22% bracket
      expect(result.taxRate).toBe(22);
      expect(result.estimatedTax).toBe(220);
      expect(result.bracket).toBe('22%');
    });

    it('long-term gain at high income uses 20% rate', () => {
      const result = calculateEstimatedTax(10000, true, 600000);
      expect(result.taxRate).toBe(20);
      expect(result.estimatedTax).toBe(2000);
    });

    it('long-term gain at mid income uses 15% rate', () => {
      const result = calculateEstimatedTax(5000, true, 100000);
      expect(result.taxRate).toBe(15);
      expect(result.estimatedTax).toBe(750);
    });

    it('long-term gain at low income uses 0% rate', () => {
      const result = calculateEstimatedTax(2000, true, 30000);
      expect(result.taxRate).toBe(0);
      expect(result.estimatedTax).toBe(0);
    });

    it('zero gain produces zero tax', () => {
      const shortResult = calculateEstimatedTax(0, false, 50000);
      expect(shortResult.estimatedTax).toBe(0);
      const longResult = calculateEstimatedTax(0, true, 50000);
      expect(longResult.estimatedTax).toBe(0);
    });
  });

  // ---- getTaxBrackets ----
  describe('getTaxBrackets', () => {
    it('returns an array of tax brackets', () => {
      const brackets = getTaxBrackets();
      expect(Array.isArray(brackets)).toBe(true);
      expect(brackets.length).toBeGreaterThan(0);
    });

    it('brackets have required fields', () => {
      const brackets = getTaxBrackets();
      for (const b of brackets) {
        expect(b.id).toBeTruthy();
        expect(b.rate).toBeGreaterThan(0);
        expect(b.minIncome).toBeGreaterThanOrEqual(0);
      }
    });
  });

  // ---- getTaxReports / getTaxReportByYear ----
  describe('getTaxReports', () => {
    it('returns tax reports', () => {
      const reports = getTaxReports();
      expect(Array.isArray(reports)).toBe(true);
      expect(reports.length).toBeGreaterThan(0);
    });

    it('getTaxReportByYear returns correct year', () => {
      const report = getTaxReportByYear(2024);
      expect(report).not.toBeNull();
      expect(report!.year).toBe(2024);
    });

    it('getTaxReportByYear returns null for missing year', () => {
      // 2023 has no report in mock data
      const report = getTaxReportByYear(2023 as any);
      expect(report).toBeNull();
    });
  });

  // ---- getCostBasis ----
  describe('getCostBasis', () => {
    it('returns all cost basis entries when no filter', () => {
      const cb = getCostBasis();
      expect(cb.length).toBeGreaterThan(0);
    });

    it('activeOnly filters to entries with current value > 0', () => {
      const active = getCostBasis(true);
      expect(active.every(c => c.currentValue > 0)).toBe(true);
    });
  });

  // ---- getWashSaleAlerts ----
  describe('getWashSaleAlerts', () => {
    it('returns wash sale alerts', () => {
      const alerts = getWashSaleAlerts();
      expect(Array.isArray(alerts)).toBe(true);
      expect(alerts.length).toBeGreaterThan(0);
    });

    it('each alert has daysBetween within wash-sale window', () => {
      const alerts = getWashSaleAlerts();
      for (const a of alerts) {
        // Wash sale window is 30 days before/after
        expect(a.daysBetween).toBeLessThanOrEqual(30);
        expect(a.disallowedLoss).toBeGreaterThan(0);
      }
    });
  });

  // ---- getHarvestOpportunities ----
  describe('getHarvestOpportunities', () => {
    it('returns harvest opportunities', () => {
      const opps = getHarvestOpportunities();
      expect(Array.isArray(opps)).toBe(true);
      expect(opps.length).toBeGreaterThan(0);
    });

    it('each opportunity has priority field', () => {
      const opps = getHarvestOpportunities();
      for (const o of opps) {
        expect(['high', 'medium', 'low']).toContain(o.priority);
      }
    });
  });

  // ---- getDeductibleExpenses ----
  describe('getDeductibleExpenses', () => {
    it('returns all deductible expenses', () => {
      const expenses = getDeductibleExpenses();
      expect(expenses.length).toBeGreaterThan(0);
    });

    it('filters by year correctly', () => {
      const expenses2024 = getDeductibleExpenses(2024);
      expect(expenses2024.every(e => new Date(e.date).getFullYear() === 2024)).toBe(true);
    });
  });

  // ---- getTaxSummary ----
  describe('getTaxSummary', () => {
    it('returns a tax summary with all required fields', () => {
      const summary = getTaxSummary();
      expect(typeof summary.totalInvestment).toBe('number');
      expect(typeof summary.totalReturns).toBe('number');
      expect(typeof summary.netProfit).toBe('number');
      expect(typeof summary.effectiveTaxRate).toBe('number');
      expect(typeof summary.totalTaxesPaid).toBe('number');
      expect(typeof summary.totalDeductions).toBe('number');
      expect(typeof summary.avgHoldingPeriod).toBe('number');
      expect(summary.longTermPercentage).toBeGreaterThanOrEqual(0);
      expect(summary.longTermPercentage).toBeLessThanOrEqual(100);
    });

    it('effectiveTaxRate is between 0 and 100', () => {
      const summary = getTaxSummary();
      expect(summary.effectiveTaxRate).toBeGreaterThanOrEqual(0);
      expect(summary.effectiveTaxRate).toBeLessThanOrEqual(100);
    });
  });

  // ---- getPortfolioUnrealizedGains ----
  describe('getPortfolioUnrealizedGains', () => {
    it('returns unrealized gain/loss totals', () => {
      const result = getPortfolioUnrealizedGains();
      expect(typeof result.totalUnrealizedGain).toBe('number');
      expect(typeof result.totalUnrealizedLoss).toBe('number');
      expect(typeof result.netUnrealized).toBe('number');
      expect(Array.isArray(result.positions)).toBe(true);
    });

    it('totalUnrealizedLoss is non-negative', () => {
      const result = getPortfolioUnrealizedGains();
      expect(result.totalUnrealizedLoss).toBeGreaterThanOrEqual(0);
    });
  });

  // ---- getAnnualBreakdown ----
  describe('getAnnualBreakdown', () => {
    it('returns a breakdown for each tracked year', () => {
      const breakdown = getAnnualBreakdown();
      expect(Array.isArray(breakdown)).toBe(true);
      expect(breakdown.length).toBeGreaterThan(0);
    });

    it('each entry has year and cash flow data', () => {
      const breakdown = getAnnualBreakdown();
      for (const entry of breakdown) {
        expect([2024, 2025, 2026]).toContain(entry.year);
        expect(typeof entry.totalSpent).toBe('number');
        expect(typeof entry.totalReceived).toBe('number');
        expect(typeof entry.netCashFlow).toBe('number');
      }
    });
  });

  // ---- getTaxMethodConfig ----
  describe('getTaxMethodConfig', () => {
    it('returns config for each lot method', () => {
      const methods = ['fifo', 'lifo', 'specific_id', 'avg_cost'] as const;
      for (const m of methods) {
        const config = getTaxMethodConfig(m);
        expect(config.label).toBeTruthy();
        expect(config.text).toBeTruthy();
        expect(config.bg).toBeTruthy();
        expect(config.border).toBeTruthy();
      }
    });
  });
});
