// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
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
} from '../../lib/analytics/gradePredictionService';
import { setupLocalStorageMock } from '../helpers';

const localStorageMock = setupLocalStorageMock();

describe('gradePredictionService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('getGradePredictions', () => {
    it('returns at least 15 predictions', () => {
      const predictions = getGradePredictions();
      expect(predictions.length).toBeGreaterThanOrEqual(15);
    });

    it('all predictions have valid grades between 1 and 10', () => {
      const predictions = getGradePredictions();
      for (const p of predictions) {
        for (const pred of p.predictions) {
          expect(pred.predictedGrade).toBeGreaterThanOrEqual(1);
          expect(pred.predictedGrade).toBeLessThanOrEqual(10);
        }
      }
    });

    it('all predictions have confidence scores between 0 and 100', () => {
      const predictions = getGradePredictions();
      for (const p of predictions) {
        expect(p.overallConfidence).toBeGreaterThanOrEqual(0);
        expect(p.overallConfidence).toBeLessThanOrEqual(100);
        for (const pred of p.predictions) {
          expect(pred.confidence).toBeGreaterThanOrEqual(0);
          expect(pred.confidence).toBeLessThanOrEqual(100);
        }
      }
    });

    it('each prediction has 4 company predictions', () => {
      const predictions = getGradePredictions();
      for (const p of predictions) {
        expect(p.predictions).toHaveLength(4);
        const companies = p.predictions.map(pr => pr.company);
        expect(companies).toContain('PSA');
        expect(companies).toContain('BGS');
        expect(companies).toContain('SGC');
        expect(companies).toContain('CGC');
      }
    });

    it('subgrades are between 1 and 10', () => {
      const predictions = getGradePredictions();
      for (const p of predictions) {
        for (const pred of p.predictions) {
          expect(pred.subgrades.centering).toBeGreaterThanOrEqual(1);
          expect(pred.subgrades.centering).toBeLessThanOrEqual(10);
          expect(pred.subgrades.corners).toBeGreaterThanOrEqual(1);
          expect(pred.subgrades.corners).toBeLessThanOrEqual(10);
          expect(pred.subgrades.edges).toBeGreaterThanOrEqual(1);
          expect(pred.subgrades.edges).toBeLessThanOrEqual(10);
          expect(pred.subgrades.surface).toBeGreaterThanOrEqual(1);
          expect(pred.subgrades.surface).toBeLessThanOrEqual(10);
        }
      }
    });
  });

  describe('getGradingCosts', () => {
    it('returns 4 grading companies', () => {
      const costs = getGradingCosts();
      expect(costs).toHaveLength(4);
    });

    it('all costs are positive', () => {
      const costs = getGradingCosts();
      for (const c of costs) {
        for (const t of c.tiers) {
          expect(t.cost).toBeGreaterThan(0);
        }
      }
    });

    it('each company has 5 tiers', () => {
      const costs = getGradingCosts();
      for (const c of costs) {
        expect(c.tiers).toHaveLength(5);
      }
    });
  });

  describe('getPopulationData', () => {
    it('returns at least 10 entries', () => {
      const pop = getPopulationData();
      expect(pop.length).toBeGreaterThanOrEqual(10);
    });

    it('gem rates are between 0 and 100', () => {
      const pop = getPopulationData();
      for (const p of pop) {
        for (const pop2 of p.populations) {
          expect(pop2.gem_rate).toBeGreaterThanOrEqual(0);
          expect(pop2.gem_rate).toBeLessThanOrEqual(100);
        }
      }
    });
  });

  describe('getGradingROI', () => {
    it('returns ROI data for each grade level', () => {
      const roi = getGradingROI(200);
      expect(roi.length).toBeGreaterThanOrEqual(5);
    });

    it('graded values increase with grade', () => {
      const roi = getGradingROI(200);
      for (let i = 1; i < roi.length; i++) {
        expect(roi[i].gradedValue).toBeGreaterThanOrEqual(roi[i - 1].gradedValue);
      }
    });

    it('grading cost is positive', () => {
      const roi = getGradingROI(100);
      for (const r of roi) {
        expect(r.gradingCost).toBeGreaterThan(0);
      }
    });

    it('recommendation is valid', () => {
      const roi = getGradingROI(100);
      const valid = ['submit', 'skip', 'borderline'];
      for (const r of roi) {
        expect(valid).toContain(r.recommendation);
      }
    });

    it('breakEvenGrade is consistent across entries', () => {
      const roi = getGradingROI(200);
      const breakEvens = new Set(roi.map(r => r.breakEvenGrade));
      expect(breakEvens.size).toBe(1);
    });
  });

  describe('getSubmissionTracker', () => {
    it('returns at least 12 submissions', () => {
      const subs = getSubmissionTracker();
      expect(subs.length).toBeGreaterThanOrEqual(12);
    });

    it('all statuses are valid', () => {
      const validStatuses = ['submitted', 'received', 'grading', 'shipped', 'complete'];
      const subs = getSubmissionTracker();
      for (const s of subs) {
        expect(validStatuses).toContain(s.status);
      }
    });

    it('predicted grades are between 1 and 10', () => {
      const subs = getSubmissionTracker();
      for (const s of subs) {
        expect(s.predictedGrade).toBeGreaterThanOrEqual(1);
        expect(s.predictedGrade).toBeLessThanOrEqual(10);
      }
    });

    it('actual grades are null or between 1 and 10', () => {
      const subs = getSubmissionTracker();
      for (const s of subs) {
        if (s.actualGrade !== null) {
          expect(s.actualGrade).toBeGreaterThanOrEqual(1);
          expect(s.actualGrade).toBeLessThanOrEqual(10);
        }
      }
    });

    it('costs are positive', () => {
      const subs = getSubmissionTracker();
      for (const s of subs) {
        expect(s.cost).toBeGreaterThan(0);
      }
    });
  });

  describe('getPredictionStats', () => {
    it('returns valid stats', () => {
      const stats = getPredictionStats();
      expect(stats.totalPredictions).toBeGreaterThan(0);
      expect(stats.avgConfidence).toBeGreaterThan(0);
      expect(stats.avgConfidence).toBeLessThanOrEqual(100);
      expect(stats.accuracyRate).toBeGreaterThan(0);
      expect(stats.accuracyRate).toBeLessThanOrEqual(100);
    });
  });

  describe('predictGrade', () => {
    it('returns a valid prediction', () => {
      const prediction = predictGrade();
      expect(prediction.id).toBeTruthy();
      expect(prediction.player).toBeTruthy();
      expect(prediction.overallConfidence).toBeGreaterThanOrEqual(0);
      expect(prediction.overallConfidence).toBeLessThanOrEqual(100);
      expect(prediction.predictions).toHaveLength(4);
    });
  });

  describe('utility functions', () => {
    it('getCompanyColor returns hex colors', () => {
      expect(getCompanyColor('PSA')).toMatch(/^#/);
      expect(getCompanyColor('BGS')).toMatch(/^#/);
      expect(getCompanyColor('SGC')).toMatch(/^#/);
      expect(getCompanyColor('CGC')).toMatch(/^#/);
    });

    it('getGradeColor returns hex colors', () => {
      expect(getGradeColor(10)).toMatch(/^#/);
      expect(getGradeColor(7)).toMatch(/^#/);
      expect(getGradeColor(4)).toMatch(/^#/);
    });

    it('getStatusLabel returns readable labels', () => {
      expect(getStatusLabel('submitted')).toBe('Submitted');
      expect(getStatusLabel('complete')).toBe('Complete');
    });

    it('formatCurrency formats numbers', () => {
      expect(formatCurrency(1000)).toContain('1,000');
    });

    it('getSubgradeLabel returns readable labels', () => {
      expect(getSubgradeLabel('centering')).toBe('Centering');
      expect(getSubgradeLabel('corners')).toBe('Corners');
      expect(getSubgradeLabel('edges')).toBe('Edges');
      expect(getSubgradeLabel('surface')).toBe('Surface');
    });

    it('getRecommendationColor returns hex colors', () => {
      expect(getRecommendationColor('submit')).toMatch(/^#/);
      expect(getRecommendationColor('skip')).toMatch(/^#/);
      expect(getRecommendationColor('borderline')).toMatch(/^#/);
    });
  });
});
