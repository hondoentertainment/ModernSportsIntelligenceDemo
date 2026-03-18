import { describe, it, expect } from 'vitest';
import { ROUTE_TIER_MAP, getRouteTier } from '../../lib/utils/routeTierConfig';

const VALID_TIERS = ['basic', 'pro', 'alpha'] as const;

describe('routeTierConfig', () => {
  // ── ROUTE_TIER_MAP structure ────────────────────────────────────────

  describe('ROUTE_TIER_MAP', () => {
    it('is a non-empty record', () => {
      expect(typeof ROUTE_TIER_MAP).toBe('object');
      expect(Object.keys(ROUTE_TIER_MAP).length).toBeGreaterThan(0);
    });

    it('every tier value is one of basic, pro, or alpha', () => {
      for (const [path, entry] of Object.entries(ROUTE_TIER_MAP)) {
        expect(VALID_TIERS).toContain(entry.tier);
      }
    });

    it('every entry has a non-empty featureName', () => {
      for (const [path, entry] of Object.entries(ROUTE_TIER_MAP)) {
        expect(typeof entry.featureName).toBe('string');
        expect(entry.featureName.length).toBeGreaterThan(0);
      }
    });
  });

  // ── getRouteTier ────────────────────────────────────────────────────

  describe('getRouteTier', () => {
    it('returns null for unknown paths', () => {
      expect(getRouteTier('/nonexistent-route')).toBeNull();
      expect(getRouteTier('/random/path')).toBeNull();
      expect(getRouteTier('')).toBeNull();
    });

    it('/api-platform maps to alpha tier', () => {
      const result = getRouteTier('/api-platform');
      expect(result).not.toBeNull();
      expect(result!.tier).toBe('alpha');
    });

    it('/tax-calculator maps to pro tier', () => {
      const result = getRouteTier('/tax-calculator');
      expect(result).not.toBeNull();
      expect(result!.tier).toBe('pro');
    });

    it('/price-prediction maps to basic tier', () => {
      const result = getRouteTier('/price-prediction');
      expect(result).not.toBeNull();
      expect(result!.tier).toBe('basic');
    });

    it('returns an object with tier and featureName', () => {
      // Test with a known route that exists
      const entries = Object.entries(ROUTE_TIER_MAP);
      if (entries.length > 0) {
        const [path] = entries[0];
        const result = getRouteTier(path);
        expect(result).toHaveProperty('tier');
        expect(result).toHaveProperty('featureName');
      }
    });
  });
});
