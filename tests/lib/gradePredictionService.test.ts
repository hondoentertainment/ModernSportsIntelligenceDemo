import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
} from 'vitest';
import {
  getGradePredictions,
  getGradingCosts,
  getPopulationData,
  getGradingROI,
  getSubmissionTracker,
  getPredictionStats,
  predictGrade,
  getCompanyColor,
  getGradeColor,
  getStatusLabel,
  formatCurrency,
  getSubgradeLabel,
  getRecommendationColor,
  getStatusProgress,
} from '../../lib/gradePredictionService';
import { setupLocalStorageMock } from '../helpers';

const localStorageMock = setupLocalStorageMock();

describe('gradePredictionService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('getGradePredictions', () => {
    it('returns array of predictions', () => {
      const preds = getGradePredictions();
      expect(preds.length).toBeGreaterThan(0);
    });

    it('predictions have valid grade ranges 1-10', () => {
      const preds = getGradePredictions();
      for (const p of preds) {
        for (const cp of p.predictions) {
          expect(cp.predictedGrade).toBeGreaterThanOrEqual(1);
          expect(cp.predictedGrade).toBeLessThanOrEqual(10);
        }
      }
    });

    it('predictions have confidence 0-100', () => {
      const preds = getGradePredictions();
      for (const p of preds) {
        expect(p.overallConfidence).toBeGreaterThanOrEqual(0);
        expect(p.overallConfidence).toBeLessThanOrEqual(100);
        for (const cp of p.predictions) {
          expect(cp.confidence).toBeGreaterThanOrEqual(0);
          expect(cp.confidence).toBeLessThanOrEqual(100);
        }
      }
    });

    it('each prediction has 4 company predictions', () => {
      const preds = getGradePredictions();
      for (const p of preds) {
        expect(p.predictions).toHaveLength(4);
        const companies = p.predictions.map((c) => c.company);
        expect(companies).toContain('PSA');
        expect(companies).toContain('BGS');
        expect(companies).toContain('SGC');
        expect(companies).toContain('CGC');
      }
    });
  });

  describe('getGradingCosts', () => {
    it('returns 4 companies', () => {
      const costs = getGradingCosts();
      expect(costs).toHaveLength(4);
    });

    it('all costs are positive', () => {
      const costs = getGradingCosts();
      for (const c of costs) {
        for (const t of c.tiers) {
          expect(t.cost).toBeGreaterThan(0);
          expect(t.turnaroundDays).toBeGreaterThan(0);
        }
        expect(c.shippingCost).toBeGreaterThan(0);
      }
    });
  });

  describe('getPopulationData', () => {
    it('returns population entries', () => {
      const pop = getPopulationData();
      expect(pop.length).toBeGreaterThan(0);
    });

    it('gem rates are between 0 and 100', () => {
      const pop = getPopulationData();
      for (const p of pop) {
        for (const comp of p.populations) {
          expect(comp.gemRate).toBeGreaterThanOrEqual(0);
          expect(comp.gemRate).toBeLessThanOrEqual(100);
        }
      }
    });
  });

  describe('getGradingROI', () => {
    it('returns ROI entries for given card value', () => {
      const roi = getGradingROI(200);
      expect(roi.length).toBeGreaterThan(0);
    });

    it('grades are within 1-10', () => {
      const roi = getGradingROI(100);
      for (const r of roi) {
        expect(r.grade).toBeGreaterThanOrEqual(1);
        expect(r.grade).toBeLessThanOrEqual(10);
      }
    });

    it('grading costs are positive', () => {
      const roi = getGradingROI(500);
      for (const r of roi) {
        expect(r.gradingCost).toBeGreaterThan(0);
        expect(r.gradedValue).toBeGreaterThan(0);
      }
    });

    it('has valid recommendation values', () => {
      const roi = getGradingROI(300);
      const validRecs = ['strong_submit', 'submit', 'hold', 'skip'];
      for (const r of roi) {
        expect(validRecs).toContain(r.recommendation);
      }
    });
  });

  describe('getSubmissionTracker', () => {
    it('returns tracker entries', () => {
      const tracker = getSubmissionTracker();
      expect(tracker.length).toBeGreaterThan(0);
    });

    it('tracker entries have valid statuses', () => {
      const validStatuses = ['pending_shipment', 'in_transit', 'received', 'grading_queue', 'grading_in_progress', 'quality_review', 'graded', 'shipped_back', 'delivered'];
      const tracker = getSubmissionTracker();
      for (const s of tracker) {
        expect(validStatuses).toContain(s.status);
      }
    });
  });

  describe('getPredictionStats', () => {
    it('returns valid stats', () => {
      const stats = getPredictionStats();
      expect(stats.totalPredictions).toBeGreaterThan(0);
      expect(stats.accuracyRate).toBeGreaterThanOrEqual(0);
      expect(stats.accuracyRate).toBeLessThanOrEqual(100);
      expect(stats.exactMatchRate).toBeGreaterThanOrEqual(0);
      expect(stats.exactMatchRate).toBeLessThanOrEqual(100);
    });
  });

  describe('predictGrade', () => {
    it('creates a new prediction and persists it', () => {
      const before = getGradePredictions().length;
      const result = predictGrade('2024 Test Card', 'Test Player', 2024, 'Topps', 'Baseball');
      expect(result.player).toBe('Test Player');
      expect(result.predictions).toHaveLength(4);
      const after = getGradePredictions().length;
      expect(after).toBe(before + 1);
    });
  });

  describe('helper functions', () => {
    it('getCompanyColor returns a hex color', () => {
      expect(getCompanyColor('PSA')).toMatch(/^#[0-9a-f]{6}$/);
      expect(getCompanyColor('BGS')).toMatch(/^#[0-9a-f]{6}$/);
      expect(getCompanyColor('SGC')).toMatch(/^#[0-9a-f]{6}$/);
      expect(getCompanyColor('CGC')).toMatch(/^#[0-9a-f]{6}$/);
    });

    it('getGradeColor returns a color for various grades', () => {
      expect(getGradeColor(10)).toMatch(/^#/);
      expect(getGradeColor(7)).toMatch(/^#/);
      expect(getGradeColor(5)).toMatch(/^#/);
    });

    it('getStatusLabel returns a label string', () => {
      expect(getStatusLabel('pending_shipment')).toBe('Pending Shipment');
      expect(getStatusLabel('graded')).toBe('Graded');
      expect(getStatusLabel('delivered')).toBe('Delivered');
    });

    it('formatCurrency formats correctly', () => {
      expect(formatCurrency(1000)).toContain('1,000');
    });

    it('getSubgradeLabel returns label', () => {
      expect(getSubgradeLabel('centering')).toBe('Centering');
      expect(getSubgradeLabel('corners')).toBe('Corners');
      expect(getSubgradeLabel('edges')).toBe('Edges');
      expect(getSubgradeLabel('surface')).toBe('Surface');
    });

    it('getRecommendationColor returns hex colors', () => {
      expect(getRecommendationColor('strong_submit')).toMatch(/^#/);
      expect(getRecommendationColor('skip')).toMatch(/^#/);
    });

    it('getStatusProgress returns 0-100', () => {
      expect(getStatusProgress('pending_shipment')).toBeGreaterThan(0);
      expect(getStatusProgress('delivered')).toBe(100);
    });
  });
});
