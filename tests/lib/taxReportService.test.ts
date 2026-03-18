import { describe, it, expect, beforeEach } from 'vitest';
import {
  getTransactions,
  getTaxSummary,
  generateForm8949,
  generateScheduleD,
  getTaxOptimizations,
  getMonthlyBreakdown,
  getTaxSettings,
  updateTaxSettings,
  calculateEstimatedTax,
  getWashSaleTransactions,
  exportReport,
  formatCurrency,
  formatDate,
  getHoldingPeriodLabel,
} from '../../lib/utils/taxReportService';

describe('taxReportService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getTransactions', () => {
    it('returns all transactions when no year is specified', () => {
      const txs = getTransactions();
      expect(txs.length).toBeGreaterThanOrEqual(40);
    });

    it('filters transactions by tax year 2024', () => {
      const txs = getTransactions(2024);
      expect(txs.length).toBeGreaterThan(0);
      txs.forEach((tx) => {
        const year = new Date(tx.dateSold + 'T00:00:00').getFullYear();
        expect(year).toBe(2024);
      });
    });

    it('filters transactions by tax year 2025', () => {
      const txs = getTransactions(2025);
      expect(txs.length).toBeGreaterThan(0);
      txs.forEach((tx) => {
        const year = new Date(tx.dateSold + 'T00:00:00').getFullYear();
        expect(year).toBe(2025);
      });
    });

    it('returns empty for years with no data', () => {
      const txs = getTransactions(2023);
      expect(txs.length).toBe(0);
    });

    it('each transaction has required fields', () => {
      const txs = getTransactions();
      txs.forEach((tx) => {
        expect(tx.id).toBeTruthy();
        expect(tx.cardName).toBeTruthy();
        expect(tx.player).toBeTruthy();
        expect(typeof tx.proceeds).toBe('number');
        expect(typeof tx.costBasis).toBe('number');
        expect(typeof tx.gainLoss).toBe('number');
      });
    });
  });

  describe('getTaxSummary', () => {
    it('calculates correct totals for a given year', () => {
      const summary = getTaxSummary(2024);
      const txs = getTransactions(2024);
      const expectedProceeds = txs.reduce((s, t) => s + t.proceeds, 0);
      const expectedCostBasis = txs.reduce((s, t) => s + t.costBasis, 0);
      expect(summary.totalProceeds).toBe(expectedProceeds);
      expect(summary.totalCostBasis).toBe(expectedCostBasis);
      expect(summary.totalGainLoss).toBe(expectedProceeds - expectedCostBasis);
    });

    it('splits short-term and long-term correctly', () => {
      const summary = getTaxSummary(2024);
      const txs = getTransactions(2024);
      const expectedShort = txs.filter((t) => t.holdingPeriod === 'short_term').reduce((s, t) => s + t.gainLoss, 0);
      const expectedLong = txs.filter((t) => t.holdingPeriod === 'long_term').reduce((s, t) => s + t.gainLoss, 0);
      expect(summary.shortTermGainLoss).toBe(expectedShort);
      expect(summary.longTermGainLoss).toBe(expectedLong);
    });

    it('counts transactions correctly', () => {
      const summary = getTaxSummary(2025);
      const txs = getTransactions(2025);
      expect(summary.totalTransactions).toBe(txs.length);
    });

    it('estimated tax is non-negative', () => {
      const summary = getTaxSummary(2024);
      expect(summary.estimatedTax).toBeGreaterThanOrEqual(0);
    });
  });

  describe('generateForm8949', () => {
    it('generates entries for each transaction', () => {
      const entries = generateForm8949(2024);
      const txs = getTransactions(2024);
      expect(entries.length).toBe(txs.length);
    });

    it('entries have valid box values', () => {
      const entries = generateForm8949();
      entries.forEach((entry) => {
        expect(['A', 'B', 'C', 'D', 'E', 'F']).toContain(entry.box);
      });
    });

    it('wash sale entries have code W', () => {
      const entries = generateForm8949();
      const washEntries = entries.filter((e) => e.adjustmentCode === 'W');
      expect(washEntries.length).toBeGreaterThan(0);
      washEntries.forEach((e) => {
        expect(e.adjustmentAmount).toBeGreaterThan(0);
      });
    });

    it('gain/loss includes wash sale adjustment', () => {
      const entries = generateForm8949();
      const washEntry = entries.find((e) => e.adjustmentCode === 'W');
      expect(washEntry).toBeDefined();
      if (washEntry) {
        // Wash sale gain/loss = original gainLoss + disallowed amount
        expect(washEntry.gainLoss).toBe(washEntry.proceeds - washEntry.costBasis + washEntry.adjustmentAmount);
      }
    });
  });

  describe('generateScheduleD', () => {
    it('short-term and long-term sum to net', () => {
      const sd = generateScheduleD(2024);
      expect(sd.netGainLoss).toBe(sd.totalShortTerm + sd.totalLongTerm);
    });

    it('taxable gain is capped at -3000 for losses', () => {
      const sd = generateScheduleD();
      if (sd.netGainLoss < -3000) {
        expect(sd.taxableGain).toBe(-3000);
        expect(sd.capitalLossCarryover).toBeGreaterThan(0);
      }
    });

    it('short-term from 8949 matches Box A+B+C totals', () => {
      const entries = generateForm8949(2024);
      const sd = generateScheduleD(2024);
      const shortTotal = entries
        .filter((e) => ['A', 'B', 'C'].includes(e.box))
        .reduce((s, e) => s + e.gainLoss, 0);
      expect(sd.shortTermFromForm8949).toBe(shortTotal);
    });
  });

  describe('getWashSaleTransactions', () => {
    it('returns only wash sale flagged transactions', () => {
      const ws = getWashSaleTransactions();
      expect(ws.length).toBeGreaterThan(0);
      ws.forEach((tx) => {
        expect(tx.washSale).toBe(true);
        expect(tx.washSaleDisallowed).toBeGreaterThan(0);
      });
    });
  });

  describe('calculateEstimatedTax', () => {
    it('returns 0 for losses', () => {
      expect(calculateEstimatedTax(-5000, 'single', '22%')).toBe(0);
    });

    it('returns positive tax for gains', () => {
      const tax = calculateEstimatedTax(10000, 'single', '22%');
      expect(tax).toBeGreaterThan(0);
    });

    it('higher bracket produces higher tax', () => {
      const low = calculateEstimatedTax(10000, 'single', '12%');
      const high = calculateEstimatedTax(10000, 'single', '37%');
      expect(high).toBeGreaterThan(low);
    });
  });

  describe('getTaxOptimizations', () => {
    it('returns optimization strategies', () => {
      const opts = getTaxOptimizations();
      expect(opts.length).toBeGreaterThan(0);
      opts.forEach((o) => {
        expect(o.strategy).toBeTruthy();
        expect(o.potentialSavings).toBeGreaterThanOrEqual(0);
        expect(['low', 'medium', 'high']).toContain(o.risk);
      });
    });
  });

  describe('getMonthlyBreakdown', () => {
    it('returns 12 months', () => {
      const monthly = getMonthlyBreakdown(2024);
      expect(monthly.length).toBe(12);
    });

    it('month names are correct', () => {
      const monthly = getMonthlyBreakdown(2024);
      expect(monthly[0].month).toBe('Jan');
      expect(monthly[11].month).toBe('Dec');
    });
  });

  describe('settings', () => {
    it('returns default settings', () => {
      const s = getTaxSettings();
      expect(s.filingStatus).toBe('single');
      expect(s.taxBracket).toBe('22%');
    });

    it('persists updated settings', () => {
      updateTaxSettings({ filingStatus: 'married_joint', taxBracket: '32%' });
      const s = getTaxSettings();
      expect(s.filingStatus).toBe('married_joint');
      expect(s.taxBracket).toBe('32%');
    });

    it('updates state rate when state changes', () => {
      const s = updateTaxSettings({ state: 'Texas' });
      expect(s.stateRate).toBe(0);
    });
  });

  describe('exportReport', () => {
    it('exports form_8949 format', () => {
      const report = exportReport('form_8949', 2024);
      expect(report).toContain('Form 8949');
      expect(report).toContain('Box');
    });

    it('exports schedule_d format', () => {
      const report = exportReport('schedule_d', 2024);
      expect(report).toContain('Schedule D');
      expect(report).toContain('Short-term');
      expect(report).toContain('Long-term');
    });

    it('exports csv format with headers', () => {
      const report = exportReport('csv', 2024);
      expect(report).toContain('Description,Date Acquired,Date Sold');
      const lines = report.trim().split('\n');
      expect(lines.length).toBeGreaterThan(1);
    });

    it('exports turbotax format', () => {
      const report = exportReport('turbotax', 2024);
      expect(report).toContain('TXF');
    });

    it('exports hrblock format', () => {
      const report = exportReport('hrblock', 2024);
      expect(report).toContain('H&R Block');
    });
  });

  describe('formatCurrency', () => {
    it('formats positive numbers', () => {
      expect(formatCurrency(1500)).toContain('1,500');
    });

    it('formats negative numbers with minus sign', () => {
      const result = formatCurrency(-500);
      expect(result).toContain('-');
      expect(result).toContain('500');
    });

    it('formats zero', () => {
      expect(formatCurrency(0)).toContain('0');
    });
  });

  describe('formatDate', () => {
    it('formats date string', () => {
      const result = formatDate('2024-06-15');
      expect(result).toContain('06');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });
  });

  describe('getHoldingPeriodLabel', () => {
    it('returns correct labels', () => {
      expect(getHoldingPeriodLabel('short_term')).toBe('Short-Term');
      expect(getHoldingPeriodLabel('long_term')).toBe('Long-Term');
    });
  });
});
