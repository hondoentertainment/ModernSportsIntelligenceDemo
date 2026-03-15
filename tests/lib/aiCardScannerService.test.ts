import { describe, it, expect, beforeEach } from 'vitest';
import { setupLocalStorageMock } from '../helpers';
import {
  getScanResults,
  getScanHistory,
  getScannerStats,
  getSetDatabase,
  getDetectionModels,
  simulateScan,
  getGradingROIAnalysis,
  searchSets,
  getConditionLabel,
  getConfidenceColor,
  formatCurrency,
  getTopIdentifiedCards,
} from '../../lib/aiCardScannerService';

const localStorageMock = setupLocalStorageMock();

describe('aiCardScannerService', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('getScanResults', () => {
    it('returns 20+ scan results', () => {
      const results = getScanResults();
      expect(results.length).toBeGreaterThanOrEqual(20);
    });

    it('each result has required fields', () => {
      for (const r of getScanResults()) {
        expect(r.id).toBeTruthy();
        expect(r.timestamp).toBeTruthy();
        expect(r.matchScore).toBeGreaterThanOrEqual(0);
        expect(r.matchScore).toBeLessThanOrEqual(100);
        expect(['pending', 'scanning', 'identified', 'valued', 'error']).toContain(r.status);
        expect(['high', 'medium', 'low']).toContain(r.confidence);
      }
    });

    it('valued results have valid condition scores between 0-100', () => {
      const valued = getScanResults().filter((r) => r.conditionAssessment);
      expect(valued.length).toBeGreaterThan(0);
      for (const r of valued) {
        const ca = r.conditionAssessment!;
        expect(ca.centering.score).toBeGreaterThanOrEqual(0);
        expect(ca.centering.score).toBeLessThanOrEqual(100);
        expect(ca.corners.score).toBeGreaterThanOrEqual(0);
        expect(ca.corners.score).toBeLessThanOrEqual(100);
        expect(ca.edges.score).toBeGreaterThanOrEqual(0);
        expect(ca.edges.score).toBeLessThanOrEqual(100);
        expect(ca.surface.score).toBeGreaterThanOrEqual(0);
        expect(ca.surface.score).toBeLessThanOrEqual(100);
      }
    });

    it('valued results have positive prices', () => {
      const valued = getScanResults().filter((r) => r.valuation);
      for (const r of valued) {
        expect(r.valuation!.rawValue).toBeGreaterThan(0);
        expect(r.valuation!.fairMarketValue).toBeGreaterThan(0);
        expect(r.valuation!.low).toBeGreaterThan(0);
        expect(r.valuation!.high).toBeGreaterThan(0);
        expect(r.valuation!.high).toBeGreaterThanOrEqual(r.valuation!.low);
      }
    });
  });

  describe('getScanHistory', () => {
    it('returns history entries derived from valued scans', () => {
      const history = getScanHistory();
      expect(history.length).toBeGreaterThan(0);
      for (const h of history) {
        expect(h.player).toBeTruthy();
        expect(h.set).toBeTruthy();
        expect(h.value).toBeGreaterThan(0);
        expect(h.matchScore).toBeGreaterThanOrEqual(0);
        expect(h.matchScore).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('getScannerStats', () => {
    it('returns valid stats', () => {
      const stats = getScannerStats();
      expect(stats.totalScans).toBeGreaterThan(0);
      expect(stats.totalValueScanned).toBeGreaterThan(0);
      expect(stats.avgMatchScore).toBeGreaterThan(0);
      expect(stats.avgMatchScore).toBeLessThanOrEqual(100);
      expect(stats.accuracyRate).toBeGreaterThan(0);
      expect(stats.accuracyRate).toBeLessThanOrEqual(100);
      expect(stats.avgScanTime).toBeGreaterThan(0);
      expect(stats.scansByCategory.length).toBeGreaterThan(0);
      expect(stats.topScannedPlayers.length).toBeGreaterThan(0);
    });
  });

  describe('getSetDatabase', () => {
    it('returns 50+ sets', () => {
      const sets = getSetDatabase();
      expect(sets.length).toBeGreaterThanOrEqual(50);
    });

    it('each set has required fields', () => {
      for (const s of getSetDatabase()) {
        expect(s.manufacturer).toBeTruthy();
        expect(s.year).toBeGreaterThan(1900);
        expect(s.setName).toBeTruthy();
        expect(s.sport).toBeTruthy();
        expect(s.totalCards).toBeGreaterThan(0);
        expect(s.notableCards.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getDetectionModels', () => {
    it('returns AI models with valid accuracy', () => {
      const models = getDetectionModels();
      expect(models.length).toBeGreaterThan(0);
      for (const m of models) {
        expect(m.name).toBeTruthy();
        expect(m.version).toBeTruthy();
        expect(m.accuracy).toBeGreaterThan(0);
        expect(m.accuracy).toBeLessThanOrEqual(100);
        expect(m.supported.length).toBeGreaterThan(0);
        expect(m.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    });
  });

  describe('simulateScan', () => {
    it('returns a valid scan result with unique id', () => {
      const result = simulateScan();
      expect(result.id).toBeTruthy();
      expect(result.timestamp).toBeTruthy();
      expect(new Date(result.timestamp).getTime()).not.toBeNaN();
      expect(result.status).toBe('valued');
      expect(result.identifiedCard).not.toBeNull();
      expect(result.valuation).not.toBeNull();
    });

    it('two scans produce different ids', () => {
      const a = simulateScan();
      const b = simulateScan();
      expect(a.id).not.toBe(b.id);
    });
  });

  describe('getGradingROIAnalysis', () => {
    it('returns grading tiers with ROI data', () => {
      const analysis = getGradingROIAnalysis();
      expect(analysis.length).toBeGreaterThan(0);
      for (const row of analysis) {
        expect(row.grade).toBeTruthy();
        expect(typeof row.avgROI).toBe('number');
        expect(row.breakEvenRate).toBeGreaterThanOrEqual(0);
        expect(row.breakEvenRate).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('searchSets', () => {
    it('returns all sets for empty query', () => {
      const all = searchSets('');
      expect(all.length).toBeGreaterThanOrEqual(50);
    });

    it('filters by manufacturer', () => {
      const topps = searchSets('Topps');
      expect(topps.length).toBeGreaterThan(0);
      for (const s of topps) {
        const matchesManufacturer = s.manufacturer.toLowerCase().includes('topps');
        const matchesNotable = s.notableCards.some((c) => c.toLowerCase().includes('topps'));
        const matchesSet = s.setName.toLowerCase().includes('topps');
        expect(matchesManufacturer || matchesNotable || matchesSet).toBe(true);
      }
    });

    it('filters by sport', () => {
      const hockey = searchSets('Hockey');
      expect(hockey.length).toBeGreaterThan(0);
      for (const s of hockey) {
        expect(s.sport.toLowerCase()).toContain('hockey');
      }
    });

    it('filters by player name', () => {
      const messi = searchSets('Messi');
      expect(messi.length).toBeGreaterThan(0);
    });
  });

  describe('getConditionLabel', () => {
    it('returns human-readable labels', () => {
      expect(getConditionLabel('gem_mint')).toBe('Gem Mint');
      expect(getConditionLabel('near_mint')).toBe('Near Mint');
      expect(getConditionLabel('very_good')).toBe('Very Good');
      expect(getConditionLabel('poor')).toBe('Poor');
    });
  });

  describe('getConfidenceColor', () => {
    it('returns colors for each level', () => {
      expect(getConfidenceColor('high')).toBeTruthy();
      expect(getConfidenceColor('medium')).toBeTruthy();
      expect(getConfidenceColor('low')).toBeTruthy();
    });
  });

  describe('formatCurrency', () => {
    it('formats numbers as currency', () => {
      expect(formatCurrency(1500)).toContain('$');
      expect(formatCurrency(1500)).toContain('1,500');
      expect(formatCurrency(9.99)).toBe('$9.99');
    });
  });

  describe('getTopIdentifiedCards', () => {
    it('returns up to 10 cards sorted by value descending', () => {
      const top = getTopIdentifiedCards();
      expect(top.length).toBeLessThanOrEqual(10);
      expect(top.length).toBeGreaterThan(0);
      for (let i = 1; i < top.length; i++) {
        expect(top[i].value).toBeLessThanOrEqual(top[i - 1].value);
      }
    });
  });
});
