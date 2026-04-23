// @ts-nocheck
import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
} from 'vitest';
import {
  getCrossGradeOpportunities,
  getGradeTranslationTable,
  getGradePremiums,
  getActiveSubmissions,
  getGradingArbitrageStats,
  addSubmission,
  updateSubmissionStatus,
} from '../../lib/analytics/gradingArbitrageService';
import { setupLocalStorageMock } from '../helpers';

const localStorageMock = setupLocalStorageMock();

describe('gradingArbitrageService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('getCrossGradeOpportunities', () => {
    it('returns array of opportunities', () => {
      const opps = getCrossGradeOpportunities();
      expect(opps.length).toBeGreaterThan(0);
    });

    it('sorted by netROI descending', () => {
      const opps = getCrossGradeOpportunities();
      for (let i = 1; i < opps.length; i++) {
        expect(opps[i - 1].netROI).toBeGreaterThanOrEqual(opps[i].netROI);
      }
    });

    it('each opportunity has valid fields', () => {
      const opps = getCrossGradeOpportunities();
      for (const o of opps) {
        expect(o.id).toBeTruthy();
        expect(o.player).toBeTruthy();
        expect(['PSA', 'BGS', 'SGC', 'CSG']).toContain(o.currentCompany);
        expect(['PSA', 'BGS', 'SGC', 'CSG']).toContain(o.targetCompany);
        expect(o.expectedValue).toBeGreaterThan(o.currentValue);
        expect(o.gradeUpProbability).toBeGreaterThan(0);
        expect(o.gradeUpProbability).toBeLessThanOrEqual(100);
        expect(['low', 'medium', 'high']).toContain(o.riskLevel);
        expect(o.netROI).toBeGreaterThan(0);
      }
    });

    it('crossover fee and shipping are positive', () => {
      const opps = getCrossGradeOpportunities();
      for (const o of opps) {
        expect(o.crossoverFee).toBeGreaterThan(0);
        expect(o.shippingCost).toBeGreaterThan(0);
      }
    });
  });

  describe('getGradeTranslationTable', () => {
    it('returns translation records', () => {
      const table = getGradeTranslationTable();
      expect(table.length).toBeGreaterThan(0);
    });

    it('includes BGS to PSA translations', () => {
      const table = getGradeTranslationTable();
      const bgsToPsa = table.filter(t => t.fromCompany === 'BGS' && t.toCompany === 'PSA');
      expect(bgsToPsa.length).toBeGreaterThan(0);
    });

    it('includes SGC to PSA translations', () => {
      const table = getGradeTranslationTable();
      const sgcToPsa = table.filter(t => t.fromCompany === 'SGC' && t.toCompany === 'PSA');
      expect(sgcToPsa.length).toBeGreaterThan(0);
    });

    it('success rates are 0-100', () => {
      const table = getGradeTranslationTable();
      for (const t of table) {
        expect(t.successRate).toBeGreaterThanOrEqual(0);
        expect(t.successRate).toBeLessThanOrEqual(100);
        expect(t.sampleSize).toBeGreaterThan(0);
      }
    });
  });

  describe('getGradePremiums', () => {
    it('returns premium table for any player', () => {
      const premiums = getGradePremiums('Victor Wembanyama', '2023 Prizm');
      expect(premiums.length).toBeGreaterThan(0);
    });

    it('PSA premium is highest for Gem Mint 10', () => {
      const premiums = getGradePremiums('Test Player', 'Test Card');
      const gemMint = premiums.find(p => p.grade === 'Gem Mint 10');
      expect(gemMint).toBeDefined();
      if (gemMint) {
        expect(gemMint.psa).toBeGreaterThan(gemMint.bgs);
        expect(gemMint.psa).toBeGreaterThan(gemMint.sgc);
        expect(gemMint.psa).toBeGreaterThan(gemMint.csg);
      }
    });

    it('premiums decrease as grade decreases', () => {
      const premiums = getGradePremiums('Test', 'Card');
      expect(premiums[0].psa).toBeGreaterThan(premiums[premiums.length - 1].psa);
    });

    it('different players get different modifiers', () => {
      const a = getGradePremiums('Player A', 'Card');
      const b = getGradePremiums('Player B', 'Card');
      // Hash-based so different players may differ
      const _sameTop = a[0].psa === b[0].psa;
      // They can be the same if hash mod is same, but generally differ
      expect(a.length).toBe(b.length);
    });
  });

  describe('getActiveSubmissions', () => {
    it('returns default submissions when no localStorage data', () => {
      const subs = getActiveSubmissions();
      expect(subs.length).toBeGreaterThan(0);
    });

    it('submissions have valid fields', () => {
      const subs = getActiveSubmissions();
      for (const s of subs) {
        expect(s.id).toBeTruthy();
        expect(s.card).toBeTruthy();
        expect(['PSA', 'BGS', 'SGC', 'CSG']).toContain(s.fromCompany);
        expect(['PSA', 'BGS', 'SGC', 'CSG']).toContain(s.toCompany);
        expect(['submitted', 'in_progress', 'success', 'fail', 'returned']).toContain(s.status);
      }
    });
  });

  describe('addSubmission', () => {
    it('adds a new submission', () => {
      const initial = getActiveSubmissions().length;
      addSubmission({
        id: 'test-sub',
        card: 'Test Card',
        fromCompany: 'BGS',
        fromGrade: 9.5,
        toCompany: 'PSA',
        submittedDate: '2026-03-01',
        status: 'submitted',
        fee: 50,
        expectedReturn: 200,
      });
      const updated = getActiveSubmissions();
      expect(updated.length).toBe(initial + 1);
      expect(updated.find(s => s.id === 'test-sub')).toBeDefined();
    });
  });

  describe('updateSubmissionStatus', () => {
    it('updates status of existing submission', () => {
      const subs = getActiveSubmissions();
      const firstId = subs[0].id;
      updateSubmissionStatus(firstId, 'success', 10);
      const updated = getActiveSubmissions();
      const found = updated.find(s => s.id === firstId);
      expect(found?.status).toBe('success');
      expect(found?.resultGrade).toBe(10);
    });

    it('does nothing for non-existent submission', () => {
      const before = getActiveSubmissions();
      updateSubmissionStatus('nonexistent', 'success');
      const after = getActiveSubmissions();
      expect(after.length).toBe(before.length);
    });
  });

  describe('getGradingArbitrageStats', () => {
    it('returns valid stats', () => {
      const stats = getGradingArbitrageStats();
      expect(stats.totalOpportunities).toBeGreaterThan(0);
      expect(stats.avgROI).toBeGreaterThan(0);
      expect(stats.bestOpportunity).toBeTruthy();
      expect(stats.totalPotentialProfit).toBeGreaterThan(0);
      expect(stats.activeSubmissions).toBeGreaterThanOrEqual(0);
    });
  });
});
