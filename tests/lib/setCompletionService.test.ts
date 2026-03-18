import { describe, it, expect, beforeEach } from 'vitest';
import { setupLocalStorageMock } from '../helpers';
import {
  getTrackedSets,
  addSet,
  removeSet,
  getMissingCards,
  getSetProgress,
  getSourceRecommendations,
  getCompletionStats,
  getCheapestPath,
  getSetsByCompletion,
  getSetsBySport,
  getRarityBreakdown,
  formatCurrency,
  getCompletionColor,
  getRarityColor,
  getRarityLabel,
  CardSet,
} from '../../lib/core/setCompletionService';

function makeSet(overrides: Partial<CardSet> = {}): CardSet {
  return {
    id: 'test-set-1',
    name: 'Test Set',
    year: 2024,
    sport: 'Baseball',
    brand: 'Topps',
    totalCards: 100,
    ownedCards: 80,
    missingCards: [
      { cardNumber: '1', cardName: 'Base #1', player: 'Player A', estimatedCost: 5.00, rarity: 'common' },
      { cardNumber: '2', cardName: 'Refractor #2', player: 'Player B', estimatedCost: 25.00, rarity: 'rare' },
      { cardNumber: '3', cardName: 'Gold #3', player: 'Player C', estimatedCost: 80.00, rarity: 'ssp' },
      { cardNumber: '4', cardName: 'Prism #4', player: 'Player D', estimatedCost: 15.00, rarity: 'uncommon' },
    ],
    completionPercent: 80,
    totalSetValue: 500,
    ownedValue: 400,
    costToComplete: 125.00,
    lastUpdated: '2025-12-01',
    ...overrides,
  };
}

describe('setCompletionService', () => {
  beforeEach(() => {
    setupLocalStorageMock();
  });

  // ─── getTrackedSets ───────────────────────────────────────────────────

  describe('getTrackedSets', () => {
    it('returns mock sets when localStorage is empty', () => {
      const sets = getTrackedSets();
      expect(sets.length).toBeGreaterThanOrEqual(12);
    });

    it('returns stored sets when localStorage has data', () => {
      const testSet = makeSet();
      localStorage.setItem('msi_set_completion_sets', JSON.stringify([testSet]));
      const sets = getTrackedSets();
      expect(sets).toHaveLength(1);
      expect(sets[0].id).toBe('test-set-1');
    });
  });

  // ─── addSet ───────────────────────────────────────────────────────────

  describe('addSet', () => {
    it('adds a new set to the list', () => {
      localStorage.setItem('msi_set_completion_sets', JSON.stringify([]));
      const set = makeSet();
      const result = addSet(set);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('test-set-1');
    });

    it('updates an existing set with the same id', () => {
      const set = makeSet();
      localStorage.setItem('msi_set_completion_sets', JSON.stringify([set]));
      const updated = makeSet({ name: 'Updated Name' });
      const result = addSet(updated);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Updated Name');
    });

    it('persists to localStorage', () => {
      localStorage.setItem('msi_set_completion_sets', JSON.stringify([]));
      addSet(makeSet());
      const stored = JSON.parse(localStorage.getItem('msi_set_completion_sets')!);
      expect(stored).toHaveLength(1);
    });
  });

  // ─── removeSet ────────────────────────────────────────────────────────

  describe('removeSet', () => {
    it('removes a set by id', () => {
      const sets = [makeSet({ id: 'a' }), makeSet({ id: 'b' })];
      localStorage.setItem('msi_set_completion_sets', JSON.stringify(sets));
      const result = removeSet('a');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('b');
    });

    it('returns unchanged list when id does not exist', () => {
      localStorage.setItem('msi_set_completion_sets', JSON.stringify([makeSet()]));
      const result = removeSet('nonexistent');
      expect(result).toHaveLength(1);
    });
  });

  // ─── getMissingCards ──────────────────────────────────────────────────

  describe('getMissingCards', () => {
    it('returns missing cards for a valid set', () => {
      localStorage.setItem('msi_set_completion_sets', JSON.stringify([makeSet()]));
      const missing = getMissingCards('test-set-1');
      expect(missing).toHaveLength(4);
      expect(missing[0]).toHaveProperty('cardNumber');
      expect(missing[0]).toHaveProperty('rarity');
    });

    it('returns empty array for unknown set', () => {
      localStorage.setItem('msi_set_completion_sets', JSON.stringify([]));
      const missing = getMissingCards('nonexistent');
      expect(missing).toEqual([]);
    });
  });

  // ─── getSetProgress ───────────────────────────────────────────────────

  describe('getSetProgress', () => {
    it('returns milestones based on completion percent', () => {
      localStorage.setItem('msi_set_completion_sets', JSON.stringify([makeSet({ completionPercent: 80 })]));
      const progress = getSetProgress('test-set-1');
      expect(progress.setId).toBe('test-set-1');
      expect(progress.milestones.length).toBe(7);
      // 80% should have reached 10, 25, 50, 75 but not 90, 95, 100
      const reached = progress.milestones.filter(m => m.reached);
      expect(reached.length).toBe(4);
    });

    it('assigns reachedDate only to reached milestones', () => {
      localStorage.setItem('msi_set_completion_sets', JSON.stringify([makeSet({ completionPercent: 50 })]));
      const progress = getSetProgress('test-set-1');
      for (const m of progress.milestones) {
        if (m.reached) {
          expect(m.reachedDate).toBeDefined();
        } else {
          expect(m.reachedDate).toBeUndefined();
        }
      }
    });

    it('returns streak based on completion', () => {
      localStorage.setItem('msi_set_completion_sets', JSON.stringify([makeSet({ completionPercent: 93 })]));
      const progress = getSetProgress('test-set-1');
      expect(progress.currentStreak).toBe(9);
    });
  });

  // ─── getSourceRecommendations ─────────────────────────────────────────

  describe('getSourceRecommendations', () => {
    it('returns recommendations for a card name', () => {
      const recs = getSourceRecommendations('Base #1');
      expect(recs.length).toBeGreaterThanOrEqual(1);
      expect(recs[0]).toHaveProperty('platform');
      expect(recs[0]).toHaveProperty('price');
      expect(recs[0]).toHaveProperty('confidence');
    });

    it('includes multiple platforms', () => {
      const recs = getSourceRecommendations('Base #1');
      const platforms = recs.map(r => r.platform);
      expect(platforms).toContain('eBay');
      expect(platforms).toContain('COMC');
    });

    it('prices are positive numbers', () => {
      const recs = getSourceRecommendations('Base #1');
      for (const rec of recs) {
        expect(rec.price).toBeGreaterThan(0);
      }
    });
  });

  // ─── getCompletionStats ───────────────────────────────────────────────

  describe('getCompletionStats', () => {
    it('computes aggregate stats across all sets', () => {
      const stats = getCompletionStats();
      expect(stats.totalSets).toBeGreaterThanOrEqual(12);
      expect(stats.avgCompletion).toBeGreaterThan(0);
      expect(stats.totalOwned).toBeGreaterThan(0);
      expect(stats.totalMissing).toBeGreaterThan(0);
      expect(stats.totalCostToComplete).toBeGreaterThan(0);
    });

    it('returns zeroes when no sets exist', () => {
      localStorage.setItem('msi_set_completion_sets', JSON.stringify([]));
      const stats = getCompletionStats();
      expect(stats.totalSets).toBe(0);
      expect(stats.avgCompletion).toBe(0);
      expect(stats.totalOwned).toBe(0);
      expect(stats.totalMissing).toBe(0);
      expect(stats.totalCostToComplete).toBe(0);
      expect(stats.closestToComplete).toBe('N/A');
    });
  });

  // ─── getCheapestPath ──────────────────────────────────────────────────

  describe('getCheapestPath', () => {
    it('returns missing cards sorted by cost ascending', () => {
      localStorage.setItem('msi_set_completion_sets', JSON.stringify([makeSet()]));
      const path = getCheapestPath('test-set-1');
      for (let i = 1; i < path.length; i++) {
        expect(path[i].estimatedCost).toBeGreaterThanOrEqual(path[i - 1].estimatedCost);
      }
    });

    it('returns empty array for unknown set', () => {
      localStorage.setItem('msi_set_completion_sets', JSON.stringify([]));
      expect(getCheapestPath('nonexistent')).toEqual([]);
    });
  });

  // ─── getSetsByCompletion ──────────────────────────────────────────────

  describe('getSetsByCompletion', () => {
    it('returns sets sorted by completion percent descending', () => {
      const sorted = getSetsByCompletion();
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].completionPercent).toBeLessThanOrEqual(sorted[i - 1].completionPercent);
      }
    });
  });

  // ─── getSetsBySport ───────────────────────────────────────────────────

  describe('getSetsBySport', () => {
    it('filters sets by sport (case-insensitive)', () => {
      const baseball = getSetsBySport('baseball');
      expect(baseball.length).toBeGreaterThan(0);
      for (const s of baseball) {
        expect(s.sport.toLowerCase()).toBe('baseball');
      }
    });

    it('returns empty for a sport with no sets', () => {
      expect(getSetsBySport('Cricket')).toEqual([]);
    });
  });

  // ─── getRarityBreakdown ───────────────────────────────────────────────

  describe('getRarityBreakdown', () => {
    it('returns counts per rarity', () => {
      localStorage.setItem('msi_set_completion_sets', JSON.stringify([makeSet()]));
      const breakdown = getRarityBreakdown('test-set-1');
      expect(breakdown.common).toBe(1);
      expect(breakdown.uncommon).toBe(1);
      expect(breakdown.rare).toBe(1);
      expect(breakdown.ssp).toBe(1);
    });

    it('returns all zeroes for unknown set', () => {
      localStorage.setItem('msi_set_completion_sets', JSON.stringify([]));
      const breakdown = getRarityBreakdown('nonexistent');
      expect(breakdown.common).toBe(0);
      expect(breakdown.uncommon).toBe(0);
      expect(breakdown.rare).toBe(0);
      expect(breakdown.ssp).toBe(0);
    });
  });

  // ─── formatCurrency ───────────────────────────────────────────────────

  describe('formatCurrency', () => {
    it('formats basic amounts', () => {
      expect(formatCurrency(10)).toBe('$10.00');
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('formats large amounts with commas', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });

    it('handles decimal precision', () => {
      expect(formatCurrency(9.999)).toBe('$10.00');
      expect(formatCurrency(0.1)).toBe('$0.10');
    });
  });

  // ─── getCompletionColor ───────────────────────────────────────────────

  describe('getCompletionColor', () => {
    it('returns green for >= 90%', () => {
      expect(getCompletionColor(95)).toBe('text-green-400');
      expect(getCompletionColor(90)).toBe('text-green-400');
    });

    it('returns yellow for >= 70%', () => {
      expect(getCompletionColor(75)).toBe('text-yellow-400');
    });

    it('returns orange for >= 50%', () => {
      expect(getCompletionColor(55)).toBe('text-orange-400');
    });

    it('returns red for < 50%', () => {
      expect(getCompletionColor(30)).toBe('text-red-400');
    });
  });

  // ─── getRarityColor ───────────────────────────────────────────────────

  describe('getRarityColor', () => {
    it('maps each rarity to a Tailwind color', () => {
      expect(getRarityColor('common')).toBe('text-gray-400');
      expect(getRarityColor('uncommon')).toBe('text-blue-400');
      expect(getRarityColor('rare')).toBe('text-purple-400');
      expect(getRarityColor('ssp')).toBe('text-yellow-400');
    });
  });

  // ─── getRarityLabel ───────────────────────────────────────────────────

  describe('getRarityLabel', () => {
    it('returns human-readable labels', () => {
      expect(getRarityLabel('common')).toBe('Common');
      expect(getRarityLabel('uncommon')).toBe('Uncommon');
      expect(getRarityLabel('rare')).toBe('Rare');
      expect(getRarityLabel('ssp')).toBe('SSP');
    });
  });
});
