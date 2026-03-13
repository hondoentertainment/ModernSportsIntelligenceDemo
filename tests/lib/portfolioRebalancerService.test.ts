import { describe, it, expect } from 'vitest';
import {
  getPortfolioAllocations,
  getRebalanceRecommendations,
  getOptimizationScore,
  getPortfolioHealthScore,
  getRiskMetrics,
} from '../../lib/portfolioRebalancerService';

describe('portfolioRebalancerService', () => {
  describe('getPortfolioAllocations', () => {
    it('returns sport allocations by default', () => {
      const allocs = getPortfolioAllocations();
      expect(allocs.length).toBeGreaterThan(0);
      expect(allocs.some(a => a.category === 'Baseball')).toBe(true);
      expect(allocs.some(a => a.category === 'Basketball')).toBe(true);
    });

    it('returns sport allocations explicitly', () => {
      const allocs = getPortfolioAllocations('sport');
      expect(allocs.some(a => a.category === 'Football')).toBe(true);
    });

    it('returns grade allocations', () => {
      const allocs = getPortfolioAllocations('grade');
      expect(allocs.length).toBeGreaterThan(0);
      expect(allocs.some(a => a.category.includes('PSA'))).toBe(true);
    });

    it('returns era allocations', () => {
      const allocs = getPortfolioAllocations('era');
      expect(allocs.length).toBeGreaterThan(0);
      expect(allocs.some(a => a.category.includes('Vintage'))).toBe(true);
      expect(allocs.some(a => a.category.includes('Modern'))).toBe(true);
    });

    it('all allocations have valid delta = currentPct - targetPct', () => {
      for (const type of ['sport', 'grade', 'era'] as const) {
        const allocs = getPortfolioAllocations(type);
        for (const a of allocs) {
          expect(a.delta).toBe(a.currentPct - a.targetPct);
        }
      }
    });

    it('current percentages sum to approximately 100', () => {
      const allocs = getPortfolioAllocations('sport');
      const total = allocs.reduce((s, a) => s + a.currentPct, 0);
      expect(total).toBe(100);
    });
  });

  describe('getRebalanceRecommendations', () => {
    it('returns an array of recommendations', () => {
      const recs = getRebalanceRecommendations();
      expect(recs.length).toBeGreaterThan(0);
    });

    it('each recommendation has required fields', () => {
      const recs = getRebalanceRecommendations();
      for (const r of recs) {
        expect(r.id).toBeTruthy();
        expect(['buy', 'sell', 'hold', 'upgrade']).toContain(r.action);
        expect(r.player).toBeTruthy();
        expect(r.reason).toBeTruthy();
        expect(['high', 'medium', 'low']).toContain(r.priority);
      }
    });

    it('includes all action types', () => {
      const recs = getRebalanceRecommendations();
      const actions = new Set(recs.map(r => r.action));
      expect(actions.has('buy')).toBe(true);
      expect(actions.has('sell')).toBe(true);
      expect(actions.has('hold')).toBe(true);
      expect(actions.has('upgrade')).toBe(true);
    });

    it('hold recommendations have zero expected impact', () => {
      const recs = getRebalanceRecommendations();
      const holds = recs.filter(r => r.action === 'hold');
      for (const h of holds) {
        expect(h.expectedImpact).toBe(0);
      }
    });
  });

  describe('getOptimizationScore', () => {
    it('returns a number between 0 and 100', () => {
      const score = getOptimizationScore();
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('is deterministic', () => {
      expect(getOptimizationScore()).toBe(getOptimizationScore());
    });
  });

  describe('getPortfolioHealthScore', () => {
    it('returns a number between 0 and 100', () => {
      const score = getPortfolioHealthScore();
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('is a weighted combo of optimization and risk', () => {
      const score = getPortfolioHealthScore();
      const optScore = getOptimizationScore();
      const risks = getRiskMetrics();
      const avgRisk = risks.reduce((s, r) => s + r.score, 0) / risks.length;
      const expected = Math.round(optScore * 0.6 + (100 - avgRisk) * 0.4);
      expect(score).toBe(expected);
    });
  });

  describe('getRiskMetrics', () => {
    it('returns an array of risk metrics', () => {
      const metrics = getRiskMetrics();
      expect(metrics.length).toBeGreaterThan(0);
    });

    it('each metric has valid fields', () => {
      const metrics = getRiskMetrics();
      for (const m of metrics) {
        expect(m.category).toBeTruthy();
        expect(m.score).toBeGreaterThanOrEqual(0);
        expect(m.score).toBeLessThanOrEqual(100);
        expect(m.label).toBeTruthy();
        expect(m.description).toBeTruthy();
      }
    });

    it('includes concentration and liquidity risks', () => {
      const metrics = getRiskMetrics();
      const categories = metrics.map(m => m.category);
      expect(categories).toContain('Concentration Risk');
      expect(categories).toContain('Liquidity Risk');
    });
  });
});
