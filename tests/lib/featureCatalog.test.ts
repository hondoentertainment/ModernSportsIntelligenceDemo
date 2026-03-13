import { describe, it, expect } from 'vitest';
import {
  searchFeatures,
  groupByTier,
  getCategories,
  FEATURE_CATALOG,
  TIER_CONFIG,
} from '../../lib/featureCatalog';

describe('featureCatalog', () => {
  describe('FEATURE_CATALOG', () => {
    it('has 100+ features', () => {
      expect(FEATURE_CATALOG.length).toBeGreaterThanOrEqual(100);
    });

    it('each feature has required fields', () => {
      for (const f of FEATURE_CATALOG) {
        expect(f.id).toBeTruthy();
        expect(f.name).toBeTruthy();
        expect(f.description).toBeTruthy();
        expect(f.tier).toBeTruthy();
        expect(f.category).toBeTruthy();
        expect(['live', 'beta', 'coming-soon']).toContain(f.status);
        expect(f.icon).toBeTruthy();
        expect(f.phase).toBeGreaterThan(0);
        expect(f.keywords.length).toBeGreaterThan(0);
      }
    });

    it('all IDs are unique', () => {
      const ids = FEATURE_CATALOG.map(f => f.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('TIER_CONFIG', () => {
    it('has config for all tiers used in catalog', () => {
      const tiers = new Set(FEATURE_CATALOG.map(f => f.tier));
      for (const tier of tiers) {
        expect(TIER_CONFIG[tier]).toBeDefined();
        expect(TIER_CONFIG[tier].order).toBeGreaterThan(0);
        expect(TIER_CONFIG[tier].label).toBeTruthy();
        expect(TIER_CONFIG[tier].color).toBeTruthy();
      }
    });
  });

  describe('searchFeatures', () => {
    it('returns empty for empty query', () => {
      expect(searchFeatures('')).toEqual([]);
      expect(searchFeatures('   ')).toEqual([]);
    });

    it('finds features by name', () => {
      const results = searchFeatures('Dashboard');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.id === 'dashboard')).toBe(true);
    });

    it('finds features by keyword', () => {
      const results = searchFeatures('grading');
      expect(results.length).toBeGreaterThan(0);
    });

    it('finds features by category', () => {
      const results = searchFeatures('Trading');
      expect(results.length).toBeGreaterThan(0);
      for (const r of results) {
        const matchesAny =
          r.name.toLowerCase().includes('trading') ||
          r.description.toLowerCase().includes('trading') ||
          r.keywords.some(kw => kw.includes('trading')) ||
          r.category.toLowerCase().includes('trading') ||
          r.tier.toLowerCase().includes('trading');
        expect(matchesAny).toBe(true);
      }
    });

    it('finds features by tier', () => {
      const results = searchFeatures('Industry-First');
      expect(results.length).toBeGreaterThan(0);
    });

    it('search is case insensitive', () => {
      const upper = searchFeatures('AUCTION');
      const lower = searchFeatures('auction');
      expect(upper.length).toBe(lower.length);
    });

    it('returns empty for gibberish query', () => {
      const results = searchFeatures('xyzqwerty123nonsense');
      expect(results).toEqual([]);
    });
  });

  describe('groupByTier', () => {
    it('groups features by tier', () => {
      const features = FEATURE_CATALOG.slice(0, 20);
      const grouped = groupByTier(features);
      expect(grouped.length).toBeGreaterThan(0);

      for (const [tier, items] of grouped) {
        expect(tier).toBeTruthy();
        expect(items.length).toBeGreaterThan(0);
        for (const item of items) {
          expect(item.tier).toBe(tier);
        }
      }
    });

    it('groups are sorted by tier order', () => {
      const grouped = groupByTier(FEATURE_CATALOG);
      for (let i = 1; i < grouped.length; i++) {
        expect(TIER_CONFIG[grouped[i - 1][0]].order)
          .toBeLessThanOrEqual(TIER_CONFIG[grouped[i][0]].order);
      }
    });

    it('handles empty array', () => {
      const grouped = groupByTier([]);
      expect(grouped).toEqual([]);
    });
  });

  describe('getCategories', () => {
    it('returns sorted unique categories', () => {
      const cats = getCategories();
      expect(cats.length).toBeGreaterThan(0);

      // Check uniqueness
      expect(new Set(cats).size).toBe(cats.length);

      // Check sorted
      const sorted = [...cats].sort();
      expect(cats).toEqual(sorted);
    });

    it('includes expected categories', () => {
      const cats = getCategories();
      expect(cats).toContain('Analytics');
      expect(cats).toContain('Trading');
      expect(cats).toContain('AI');
      expect(cats).toContain('Portfolio');
    });
  });
});
