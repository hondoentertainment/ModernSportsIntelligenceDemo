// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getScanHistory,
  getRecentScans,
  scanCard,
  getScanById,
  getQuickValuation,
  getBatchScans,
  createBatchScan,
  addToBatch,
  addToCollection,
  getScanStats,
  getTopScannedCards,
  formatCurrency,
  getConfidenceColor,
  getConfidenceLabel,
  getGradeColor,
  ScanResult,
  QuickValuation,
  ScanHistory,
  BatchScan,
} from '../../lib/utils/scanToValueService';
import { setupLocalStorageMock } from '../helpers';

const localStorageMock = setupLocalStorageMock();

describe('scanToValueService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // getScanHistory
  // -------------------------------------------------------------------------
  describe('getScanHistory', () => {
    it('returns history with correct aggregate fields', () => {
      const history: ScanHistory = getScanHistory();
      expect(history.totalScans).toBeGreaterThanOrEqual(12);
      expect(history.cardsIdentified).toBeGreaterThan(0);
      expect(history.addedToCollection).toBeGreaterThan(0);
      expect(history.totalValueScanned).toBeGreaterThan(0);
      expect(history.avgScanConfidence).toBeGreaterThan(0);
      expect(history.scansByDay.length).toBeGreaterThan(0);
    });

    it('scansByDay entries have date and count', () => {
      const history = getScanHistory();
      for (const entry of history.scansByDay) {
        expect(entry.date).toBeTruthy();
        expect(entry.count).toBeGreaterThan(0);
      }
    });
  });

  // -------------------------------------------------------------------------
  // getRecentScans
  // -------------------------------------------------------------------------
  describe('getRecentScans', () => {
    it('returns scans sorted newest first', () => {
      const scans = getRecentScans();
      expect(scans.length).toBeGreaterThanOrEqual(12);
      for (let i = 1; i < scans.length; i++) {
        expect(new Date(scans[i - 1].scanTimestamp).getTime())
          .toBeGreaterThanOrEqual(new Date(scans[i].scanTimestamp).getTime());
      }
    });

    it('each scan has required ScanResult fields', () => {
      const scans = getRecentScans();
      const scan = scans[0];
      expect(scan.id).toBeTruthy();
      expect(scan.cardName).toBeTruthy();
      expect(scan.player).toBeTruthy();
      expect(scan.sport).toBeTruthy();
      expect(scan.year).toBeGreaterThan(2000);
      expect(scan.set).toBeTruthy();
      expect(scan.cardNumber).toBeTruthy();
      expect(typeof scan.scanConfidence).toBe('number');
      expect(scan.matchedCards.length).toBeGreaterThan(0);
      expect(typeof scan.estimatedGrade).toBe('number');
      expect(typeof scan.estimatedValue).toBe('number');
      expect(scan.scanTimestamp).toBeTruthy();
      expect(typeof scan.addedToCollection).toBe('boolean');
    });
  });

  // -------------------------------------------------------------------------
  // scanCard
  // -------------------------------------------------------------------------
  describe('scanCard', () => {
    it('returns a new ScanResult with unique id', () => {
      const result = scanCard('test-image');
      expect(result.id).toBeTruthy();
      expect(result.cardName).toBeTruthy();
      expect(result.scanTimestamp).toBeTruthy();
      expect(result.addedToCollection).toBe(false);
    });

    it('persists the new scan to storage', () => {
      const result = scanCard('test-image');
      expect(localStorageMock.setItem).toHaveBeenCalled();
      const stored = JSON.parse(
        localStorageMock.setItem.mock.calls.find(
          (c: string[]) => c[0] === 'msi_scan_to_value_scans',
        )![1],
      );
      expect(stored.find((s: ScanResult) => s.id === result.id)).toBeTruthy();
    });

    it('scanConfidence is between 0 and 100', () => {
      const result = scanCard('image-data');
      expect(result.scanConfidence).toBeGreaterThanOrEqual(0);
      expect(result.scanConfidence).toBeLessThanOrEqual(100);
    });
  });

  // -------------------------------------------------------------------------
  // getScanById
  // -------------------------------------------------------------------------
  describe('getScanById', () => {
    it('returns a scan for a known mock id', () => {
      const scan = getScanById('scan-001');
      expect(scan).toBeDefined();
      expect(scan!.id).toBe('scan-001');
      expect(scan!.player).toBe('Victor Wembanyama');
    });

    it('returns undefined for unknown id', () => {
      expect(getScanById('nonexistent-id')).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // getQuickValuation
  // -------------------------------------------------------------------------
  describe('getQuickValuation', () => {
    it('returns valuation with all required fields', () => {
      const val: QuickValuation = getQuickValuation('scan-001');
      expect(val.rawValue).toBeGreaterThan(0);
      expect(val.gradedValues.length).toBeGreaterThan(0);
      expect(val.recentSales.length).toBeGreaterThan(0);
      expect(val.priceRange.low).toBeLessThan(val.priceRange.high);
      expect(val.priceRange.mid).toBeGreaterThanOrEqual(val.priceRange.low);
      expect(val.priceRange.mid).toBeLessThanOrEqual(val.priceRange.high);
    });

    it('graded values include grade and value', () => {
      const val = getQuickValuation('scan-001');
      for (const gv of val.gradedValues) {
        expect(gv.grade).toBeTruthy();
        expect(gv.value).toBeGreaterThan(0);
      }
    });

    it('recent sales include date, price, and platform', () => {
      const val = getQuickValuation('scan-002');
      for (const sale of val.recentSales) {
        expect(sale.date).toBeTruthy();
        expect(sale.price).toBeGreaterThan(0);
        expect(sale.platform).toBeTruthy();
      }
    });
  });

  // -------------------------------------------------------------------------
  // getBatchScans / createBatchScan / addToBatch
  // -------------------------------------------------------------------------
  describe('getBatchScans', () => {
    it('returns default mock batches', () => {
      const batches = getBatchScans();
      expect(batches.length).toBeGreaterThanOrEqual(2);
      expect(batches[0].name).toBeTruthy();
      expect(batches[0].items.length).toBeGreaterThan(0);
      expect(batches[0].totalValue).toBeGreaterThan(0);
    });
  });

  describe('createBatchScan', () => {
    it('creates a new empty batch and persists it', () => {
      const batch = createBatchScan('My Test Batch');
      expect(batch.name).toBe('My Test Batch');
      expect(batch.items).toHaveLength(0);
      expect(batch.totalValue).toBe(0);
      expect(batch.id).toBeTruthy();
      expect(batch.createdAt).toBeTruthy();
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('addToBatch', () => {
    it('adds a scan to an existing batch and recalculates total', () => {
      const batch = createBatchScan('Batch for add');
      const scan = scanCard('img');
      const updated = addToBatch(batch.id, scan);
      expect(updated).toBeDefined();
      expect(updated!.items).toHaveLength(1);
      expect(updated!.totalValue).toBe(scan.estimatedValue);
    });

    it('returns undefined for unknown batch id', () => {
      const scan = scanCard('img');
      expect(addToBatch('no-such-batch', scan)).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // addToCollection
  // -------------------------------------------------------------------------
  describe('addToCollection', () => {
    it('marks a scan as added to collection', () => {
      // scan-002 starts with addedToCollection = false
      const updated = addToCollection('scan-002');
      expect(updated).toBeDefined();
      expect(updated!.addedToCollection).toBe(true);
    });

    it('returns undefined for unknown scan id', () => {
      expect(addToCollection('no-such-scan')).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // getScanStats
  // -------------------------------------------------------------------------
  describe('getScanStats', () => {
    it('returns correct aggregate stats', () => {
      const stats = getScanStats();
      expect(stats.totalScans).toBeGreaterThanOrEqual(12);
      expect(stats.avgConfidence).toBeGreaterThan(0);
      expect(stats.avgConfidence).toBeLessThanOrEqual(100);
      expect(stats.totalValue).toBeGreaterThan(0);
      expect(stats.addedCount).toBeGreaterThan(0);
      expect(stats.sportBreakdown.length).toBeGreaterThan(0);
    });

    it('sport breakdown sums to total scans', () => {
      const stats = getScanStats();
      const sum = stats.sportBreakdown.reduce((acc, s) => acc + s.count, 0);
      expect(sum).toBe(stats.totalScans);
    });
  });

  // -------------------------------------------------------------------------
  // getTopScannedCards
  // -------------------------------------------------------------------------
  describe('getTopScannedCards', () => {
    it('returns cards sorted by value descending', () => {
      const top = getTopScannedCards();
      expect(top.length).toBeGreaterThan(0);
      expect(top.length).toBeLessThanOrEqual(10);
      for (let i = 1; i < top.length; i++) {
        expect(top[i - 1].estimatedValue).toBeGreaterThanOrEqual(top[i].estimatedValue);
      }
    });
  });

  // -------------------------------------------------------------------------
  // formatCurrency
  // -------------------------------------------------------------------------
  describe('formatCurrency', () => {
    it('formats whole number as USD', () => {
      const result = formatCurrency(1234);
      expect(result).toContain('1,234');
      expect(result).toContain('$');
    });

    it('formats decimal correctly', () => {
      const result = formatCurrency(42.5);
      expect(result).toContain('42.50');
    });

    it('formats zero', () => {
      const result = formatCurrency(0);
      expect(result).toContain('0');
    });
  });

  // -------------------------------------------------------------------------
  // getConfidenceColor
  // -------------------------------------------------------------------------
  describe('getConfidenceColor', () => {
    it('returns green for >= 90', () => {
      expect(getConfidenceColor(95)).toBe('text-green-400');
      expect(getConfidenceColor(90)).toBe('text-green-400');
    });

    it('returns yellow for >= 75', () => {
      expect(getConfidenceColor(80)).toBe('text-yellow-400');
    });

    it('returns orange for >= 50', () => {
      expect(getConfidenceColor(60)).toBe('text-orange-400');
    });

    it('returns red for < 50', () => {
      expect(getConfidenceColor(30)).toBe('text-red-400');
    });
  });

  // -------------------------------------------------------------------------
  // getConfidenceLabel
  // -------------------------------------------------------------------------
  describe('getConfidenceLabel', () => {
    it('returns Excellent for >= 90', () => {
      expect(getConfidenceLabel(92)).toBe('Excellent');
    });

    it('returns Good for >= 75', () => {
      expect(getConfidenceLabel(75)).toBe('Good');
    });

    it('returns Fair for >= 50', () => {
      expect(getConfidenceLabel(55)).toBe('Fair');
    });

    it('returns Low for < 50', () => {
      expect(getConfidenceLabel(20)).toBe('Low');
    });
  });

  // -------------------------------------------------------------------------
  // getGradeColor
  // -------------------------------------------------------------------------
  describe('getGradeColor', () => {
    it('returns green-400 for grades >= 9.5', () => {
      expect(getGradeColor('PSA 10')).toBe('text-green-400');
      expect(getGradeColor('9.5')).toBe('text-green-400');
    });

    it('returns emerald-400 for grade 9', () => {
      expect(getGradeColor('PSA 9')).toBe('text-emerald-400');
    });

    it('returns yellow-400 for grade 8', () => {
      expect(getGradeColor('8')).toBe('text-yellow-400');
      expect(getGradeColor('BGS 8.5')).toBe('text-yellow-400');
    });

    it('returns orange-400 for grade 7', () => {
      expect(getGradeColor('7')).toBe('text-orange-400');
    });

    it('returns red-400 for low grades', () => {
      expect(getGradeColor('5')).toBe('text-red-400');
    });

    it('returns slate-400 for non-numeric grades', () => {
      expect(getGradeColor('Authentic')).toBe('text-slate-400');
    });
  });
});
