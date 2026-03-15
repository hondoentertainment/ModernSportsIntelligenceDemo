import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setupLocalStorageMock } from '../helpers';
import {
  getTransactions,
  addTransaction,
  deleteTransaction,
  getPnLSummary,
  getTaxThreshold,
  getMonthlyBreakdown,
  getTopFlips,
  getPlatformBreakdown,
  getSportBreakdown,
  getYTDSummary,
  exportCSV,
  formatCurrency,
  formatPercent,
  getProfitColor,
  getPlatformColor,
  Transaction,
  TransactionType,
  Platform,
} from '../../lib/hobbyIncomeService';

describe('hobbyIncomeService', () => {
  let storageMock: ReturnType<typeof setupLocalStorageMock>;

  beforeEach(() => {
    storageMock = setupLocalStorageMock();
    localStorage.clear();
  });

  describe('getTransactions', () => {
    it('returns mock data when localStorage is empty', () => {
      const txns = getTransactions();
      expect(txns.length).toBeGreaterThanOrEqual(15);
    });

    it('returns stored transactions from localStorage', () => {
      const custom: Transaction[] = [
        { id: 't1', cardName: 'Test Card', player: 'Test', sport: 'Baseball', year: 2023, set: 'Topps', type: 'buy', amount: 50, date: '2025-01-01', platform: 'eBay', notes: 'test' },
      ];
      localStorage.setItem('msi_hobby_income', JSON.stringify(custom));
      const txns = getTransactions();
      expect(txns).toHaveLength(1);
      expect(txns[0].cardName).toBe('Test Card');
    });

    it('populates localStorage with mock data on first call', () => {
      getTransactions();
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('addTransaction', () => {
    it('adds a transaction and assigns an id', () => {
      getTransactions(); // init
      const newTxn = addTransaction({
        cardName: 'New Card', player: 'Player', sport: 'Baseball', year: 2024,
        set: 'Chrome', type: 'buy', amount: 100, date: '2025-06-01', platform: 'eBay', notes: 'Test add',
      });
      expect(newTxn.id).toBeTruthy();
      expect(newTxn.cardName).toBe('New Card');
      expect(newTxn.amount).toBe(100);
    });

    it('persists new transaction to storage', () => {
      getTransactions();
      addTransaction({
        cardName: 'Persist Card', player: 'Player', sport: 'Baseball', year: 2024,
        set: 'Chrome', type: 'sell', amount: 200, date: '2025-06-01', platform: 'COMC', notes: '',
      });
      const txns = getTransactions();
      expect(txns.some(t => t.cardName === 'Persist Card')).toBe(true);
    });

    it('generates unique ids for each transaction', () => {
      getTransactions();
      const t1 = addTransaction({ cardName: 'A', player: 'P', sport: 'S', year: 2024, set: 'S', type: 'buy', amount: 10, date: '2025-01-01', platform: 'eBay', notes: '' });
      const t2 = addTransaction({ cardName: 'B', player: 'P', sport: 'S', year: 2024, set: 'S', type: 'buy', amount: 20, date: '2025-01-01', platform: 'eBay', notes: '' });
      expect(t1.id).not.toBe(t2.id);
    });
  });

  describe('deleteTransaction', () => {
    it('removes an existing transaction', () => {
      const txns = getTransactions();
      const id = txns[0].id;
      const result = deleteTransaction(id);
      expect(result).toBe(true);
      const remaining = getTransactions();
      expect(remaining.find(t => t.id === id)).toBeUndefined();
    });

    it('returns false for non-existent id', () => {
      getTransactions();
      const result = deleteTransaction('nonexistent_id');
      expect(result).toBe(false);
    });
  });

  describe('getPnLSummary', () => {
    it('calculates totalRevenue from sell transactions', () => {
      const summary = getPnLSummary();
      expect(summary.totalRevenue).toBeGreaterThan(0);
    });

    it('calculates totalCosts from buy/fee/shipping/supplies', () => {
      const summary = getPnLSummary();
      expect(summary.totalCosts).toBeGreaterThan(0);
    });

    it('netProfit equals revenue minus costs', () => {
      const summary = getPnLSummary();
      expect(summary.netProfit).toBeCloseTo(summary.totalRevenue - summary.totalCosts, 2);
    });

    it('calculates margin percent correctly', () => {
      const summary = getPnLSummary();
      if (summary.totalRevenue > 0) {
        const expected = (summary.netProfit / summary.totalRevenue) * 100;
        expect(summary.marginPercent).toBeCloseTo(expected, 2);
      }
    });

    it('filters by date range', () => {
      const full = getPnLSummary();
      const partial = getPnLSummary({ start: '2025-01-01', end: '2025-02-28' });
      expect(partial.transactionCount).toBeLessThanOrEqual(full.transactionCount);
    });

    it('identifies best and worst flips', () => {
      const summary = getPnLSummary();
      expect(summary.bestFlip).toHaveProperty('cardName');
      expect(summary.bestFlip).toHaveProperty('profit');
      expect(summary.worstFlip).toHaveProperty('cardName');
      expect(summary.worstFlip).toHaveProperty('loss');
    });
  });

  describe('getTaxThreshold', () => {
    it('returns current income from sell transactions', () => {
      const tax = getTaxThreshold();
      expect(tax.currentIncome).toBeGreaterThanOrEqual(0);
    });

    it('has hobbyLimit of 600', () => {
      const tax = getTaxThreshold();
      expect(tax.hobbyLimit).toBe(600);
    });

    it('calculates percentToLimit correctly', () => {
      const tax = getTaxThreshold();
      const expected = Math.min((tax.currentIncome / 600) * 100, 100);
      expect(tax.percentToLimit).toBeCloseTo(expected, 2);
    });

    it('provides a recommendation string', () => {
      const tax = getTaxThreshold();
      expect(typeof tax.recommendation).toBe('string');
      expect(tax.recommendation.length).toBeGreaterThan(0);
    });
  });

  describe('getMonthlyBreakdown', () => {
    it('returns array of monthly entries', () => {
      const months = getMonthlyBreakdown();
      expect(Array.isArray(months)).toBe(true);
      expect(months.length).toBeGreaterThan(0);
    });

    it('each entry has required fields', () => {
      const months = getMonthlyBreakdown();
      for (const m of months) {
        expect(m).toHaveProperty('month');
        expect(m).toHaveProperty('revenue');
        expect(m).toHaveProperty('costs');
        expect(m).toHaveProperty('profit');
        expect(m).toHaveProperty('transactionCount');
      }
    });

    it('profit equals revenue minus costs', () => {
      const months = getMonthlyBreakdown();
      for (const m of months) {
        expect(m.profit).toBeCloseTo(m.revenue - m.costs, 2);
      }
    });

    it('entries are sorted chronologically', () => {
      const months = getMonthlyBreakdown();
      for (let i = 1; i < months.length; i++) {
        expect(months[i].month >= months[i - 1].month).toBe(true);
      }
    });
  });

  describe('getTopFlips', () => {
    it('returns flips sorted by profit descending', () => {
      const flips = getTopFlips(10);
      for (let i = 1; i < flips.length; i++) {
        expect(flips[i].profit).toBeLessThanOrEqual(flips[i - 1].profit);
      }
    });

    it('respects the limit parameter', () => {
      const flips = getTopFlips(2);
      expect(flips.length).toBeLessThanOrEqual(2);
    });
  });

  describe('getPlatformBreakdown', () => {
    it('returns entries per platform used', () => {
      const platforms = getPlatformBreakdown();
      expect(platforms.length).toBeGreaterThan(0);
      expect(platforms[0]).toHaveProperty('platform');
      expect(platforms[0]).toHaveProperty('revenue');
      expect(platforms[0]).toHaveProperty('costs');
      expect(platforms[0]).toHaveProperty('count');
    });
  });

  describe('getSportBreakdown', () => {
    it('returns entries per sport', () => {
      const sports = getSportBreakdown();
      expect(sports.length).toBeGreaterThan(0);
      expect(sports[0]).toHaveProperty('sport');
      expect(sports[0]).toHaveProperty('profit');
    });
  });

  describe('getYTDSummary', () => {
    it('returns YTD financial summary', () => {
      const ytd = getYTDSummary();
      expect(ytd).toHaveProperty('revenue');
      expect(ytd).toHaveProperty('costs');
      expect(ytd).toHaveProperty('profit');
      expect(ytd).toHaveProperty('transactionCount');
      expect(ytd).toHaveProperty('projectedAnnual');
    });

    it('profit equals revenue minus costs', () => {
      const ytd = getYTDSummary();
      expect(ytd.profit).toBeCloseTo(ytd.revenue - ytd.costs, 2);
    });
  });

  describe('exportCSV', () => {
    it('returns a CSV string with headers', () => {
      const csv = exportCSV();
      expect(csv).toContain('ID,Card Name,Player,Sport,Year,Set,Type,Amount,Date,Platform,Notes,Grade,Image URL');
    });

    it('includes transaction data rows', () => {
      const csv = exportCSV();
      const lines = csv.split('\n');
      expect(lines.length).toBeGreaterThan(1);
    });
  });

  describe('formatCurrency', () => {
    it('formats positive numbers', () => {
      const result = formatCurrency(1234.56);
      expect(result).toContain('1,234.56');
    });

    it('formats negative numbers with minus sign', () => {
      const result = formatCurrency(-50);
      expect(result).toContain('-');
      expect(result).toContain('50');
    });

    it('formats zero', () => {
      const result = formatCurrency(0);
      expect(result).toContain('0');
    });
  });

  describe('formatPercent', () => {
    it('formats positive percentages with plus sign', () => {
      expect(formatPercent(25.3)).toBe('+25.3%');
    });

    it('formats negative percentages with minus sign', () => {
      expect(formatPercent(-10.5)).toBe('-10.5%');
    });

    it('formats zero', () => {
      expect(formatPercent(0)).toBe('+0.0%');
    });
  });

  describe('getProfitColor', () => {
    it('returns green for positive', () => {
      expect(getProfitColor(100)).toBe('text-emerald-400');
    });

    it('returns red for negative', () => {
      expect(getProfitColor(-50)).toBe('text-red-400');
    });

    it('returns slate for zero', () => {
      expect(getProfitColor(0)).toBe('text-slate-400');
    });
  });

  describe('getPlatformColor', () => {
    it('returns specific colors for known platforms', () => {
      expect(getPlatformColor('eBay')).toBe('#3b82f6');
      expect(getPlatformColor('COMC')).toBe('#10b981');
      expect(getPlatformColor('MySlabs')).toBe('#8b5cf6');
      expect(getPlatformColor('Local')).toBe('#f59e0b');
      expect(getPlatformColor('Show')).toBe('#ef4444');
      expect(getPlatformColor('Other')).toBe('#6b7280');
    });
  });
});
