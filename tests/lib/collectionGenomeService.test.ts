import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  analyzeGenome,
  getBehavioralBiases,
  getCollectorComparison,
  getGenomeStats,
  getTypeLabel,
  getTraitLabel,
  getCategoryColor,
  getSeverityColor,
} from '../../lib/core/collectionGenomeService';
import { setupLocalStorageMock } from '../helpers';

const localStorageMock = setupLocalStorageMock();

describe('collectionGenomeService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('analyzeGenome', () => {
    it('returns a complete genome analysis', () => {
      const genome = analyzeGenome();
      expect(genome.collectorType).toBeTruthy();
      expect(genome.typeDescription).toBeTruthy();
      expect(genome.confidence).toBeGreaterThan(0);
      expect(genome.confidence).toBeLessThanOrEqual(100);
      expect(genome.traits.length).toBeGreaterThan(0);
      expect(genome.blindSpots.length).toBeGreaterThan(0);
      expect(genome.strengths.length).toBeGreaterThan(0);
      expect(genome.recommendations.length).toBeGreaterThan(0);
    });

    it('traits have valid categories', () => {
      const genome = analyzeGenome();
      for (const trait of genome.traits) {
        expect(trait.name).toBeTruthy();
        expect(trait.score).toBeGreaterThanOrEqual(0);
        expect(trait.score).toBeLessThanOrEqual(100);
        expect(trait.description).toBeTruthy();
        expect(['risk', 'strategy', 'preference', 'behavior']).toContain(trait.category);
      }
    });

    it('caches in localStorage', () => {
      const first = analyzeGenome();
      const second = analyzeGenome();
      expect(first.collectorType).toBe(second.collectorType);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('includes risk and behavior traits', () => {
      const genome = analyzeGenome();
      const categories = genome.traits.map(t => t.category);
      expect(categories).toContain('risk');
      expect(categories).toContain('behavior');
    });
  });

  describe('getBehavioralBiases', () => {
    it('returns array of biases', () => {
      const biases = getBehavioralBiases();
      expect(biases.length).toBeGreaterThan(0);
    });

    it('each bias has required fields', () => {
      const biases = getBehavioralBiases();
      for (const b of biases) {
        expect(b.name).toBeTruthy();
        expect(['low', 'medium', 'high']).toContain(b.severity);
        expect(b.description).toBeTruthy();
        expect(b.example).toBeTruthy();
        expect(b.recommendation).toBeTruthy();
      }
    });

    it('includes common cognitive biases', () => {
      const biases = getBehavioralBiases();
      const names = biases.map(b => b.name);
      expect(names).toContain('Recency Bias');
      expect(names).toContain('Confirmation Bias');
    });
  });

  describe('getCollectorComparison', () => {
    it('returns comparison with yourGenome, avgCollector, and percentiles', () => {
      const comparison = getCollectorComparison();
      expect(Object.keys(comparison.yourGenome).length).toBeGreaterThan(0);
      expect(Object.keys(comparison.avgCollector).length).toBeGreaterThan(0);
      expect(Object.keys(comparison.percentiles).length).toBeGreaterThan(0);
    });

    it('all percentiles are 0-100', () => {
      const comparison = getCollectorComparison();
      for (const value of Object.values(comparison.percentiles)) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      }
    });

    it('has same keys across all three maps', () => {
      const comparison = getCollectorComparison();
      const yourKeys = Object.keys(comparison.yourGenome).sort();
      const avgKeys = Object.keys(comparison.avgCollector).sort();
      const pctKeys = Object.keys(comparison.percentiles).sort();
      expect(yourKeys).toEqual(avgKeys);
      expect(yourKeys).toEqual(pctKeys);
    });
  });

  describe('getGenomeStats', () => {
    it('returns stats with type, label, and risk profile', () => {
      const stats = getGenomeStats();
      expect(stats.type).toBeTruthy();
      expect(stats.typeLabel).toBeTruthy();
      expect(['conservative', 'moderate', 'aggressive']).toContain(stats.riskProfile);
    });

    it('top traits are sorted by score descending', () => {
      const stats = getGenomeStats();
      expect(stats.topTraits.length).toBe(3);
      for (let i = 1; i < stats.topTraits.length; i++) {
        expect(stats.topTraits[i - 1].score).toBeGreaterThanOrEqual(stats.topTraits[i].score);
      }
    });
  });

  describe('getTypeLabel', () => {
    it('returns label for valid types', () => {
      expect(getTypeLabel('trophy_hunter')).toBe('Trophy Hunter');
      expect(getTypeLabel('value_investor')).toBe('Value Investor');
      expect(getTypeLabel('prospect_speculator')).toBe('Prospect Speculator');
    });
  });

  describe('getTraitLabel', () => {
    it('returns label for known traits', () => {
      expect(getTraitLabel('riskTolerance')).toBe('Risk Tolerance');
      expect(getTraitLabel('modernAffinity')).toBe('Modern Affinity');
    });

    it('returns raw name for unknown traits', () => {
      expect(getTraitLabel('unknownTrait')).toBe('unknownTrait');
    });
  });

  describe('getCategoryColor', () => {
    it('returns color objects for all categories', () => {
      for (const cat of ['risk', 'strategy', 'preference', 'behavior'] as const) {
        const color = getCategoryColor(cat);
        expect(color.text).toBeTruthy();
        expect(color.bg).toBeTruthy();
        expect(color.border).toBeTruthy();
      }
    });
  });

  describe('getSeverityColor', () => {
    it('returns color objects for all severities', () => {
      for (const sev of ['low', 'medium', 'high'] as const) {
        const color = getSeverityColor(sev);
        expect(color.text).toBeTruthy();
        expect(color.bg).toBeTruthy();
        expect(color.border).toBeTruthy();
      }
    });
  });
});
