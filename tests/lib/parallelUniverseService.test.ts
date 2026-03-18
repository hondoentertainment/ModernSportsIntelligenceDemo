import { describe, it, expect, beforeEach } from 'vitest';
import { setupLocalStorageMock } from '../helpers';
import {
  getParallelCards,
  addParallelCard,
  updateParallelOwnership,
  getParallelSets,
  getParallelStats,
  getRarityBreakdown,
  getMostComplete,
  getMostValuable,
  getParallelsByRarity,
  getSetParallels,
  getCompletionBySet,
  formatCurrency,
  formatPercent,
  getRarityColor,
  getRarityLabel,
  getCompletionColor,
  type ParallelCard,
} from '../../lib/utils/parallelUniverseService';

function makeParallelCard(overrides: Partial<ParallelCard> = {}): ParallelCard {
  return {
    id: 'test-001',
    baseCardName: '2023 Test Chrome #1',
    player: 'Test Player',
    sport: 'Baseball',
    year: 2023,
    set: 'Test Chrome',
    parallels: [
      { name: 'Base Refractor', color: '#C0C0C0', numberedTo: null, rarity: 'common', owned: true, value: 25 },
      { name: 'Blue Refractor', color: '#3B82F6', numberedTo: 150, rarity: 'uncommon', owned: false, value: 75 },
      { name: 'Gold Refractor', color: '#EAB308', numberedTo: 50, rarity: 'super_rare', owned: false, value: 250 },
    ],
    totalParallels: 3,
    ownedCount: 1,
    completionPercent: 33.33,
    totalValue: 350,
    ...overrides,
  };
}

describe('parallelUniverseService', () => {
  beforeEach(() => {
    setupLocalStorageMock();
  });

  // ─── getParallelCards ─────────────────────────────────────────────────

  describe('getParallelCards', () => {
    it('returns mock cards when localStorage is empty', () => {
      const cards = getParallelCards();
      expect(cards.length).toBeGreaterThanOrEqual(12);
    });

    it('returns stored cards when localStorage has data', () => {
      const testCard = makeParallelCard();
      localStorage.setItem('msi_parallel_universe_cards', JSON.stringify([testCard]));
      const cards = getParallelCards();
      expect(cards).toHaveLength(1);
      expect(cards[0].id).toBe('test-001');
    });

    it('each card has required fields', () => {
      const cards = getParallelCards();
      for (const card of cards) {
        expect(card.id).toBeDefined();
        expect(card.baseCardName).toBeDefined();
        expect(card.player).toBeDefined();
        expect(card.sport).toBeDefined();
        expect(card.year).toBeGreaterThan(2000);
        expect(card.set).toBeDefined();
        expect(card.parallels.length).toBeGreaterThan(0);
        expect(card.totalParallels).toBe(card.parallels.length);
      }
    });
  });

  // ─── addParallelCard ──────────────────────────────────────────────────

  describe('addParallelCard', () => {
    it('adds a new card and persists to storage', () => {
      const testCard = makeParallelCard({ id: 'new-card' });
      const result = addParallelCard(testCard);
      // result includes mock cards + new card
      expect(result.find((c) => c.id === 'new-card')).toBeDefined();

      // Verify persistence
      const stored = JSON.parse(localStorage.getItem('msi_parallel_universe_cards')!);
      expect(stored.find((c: ParallelCard) => c.id === 'new-card')).toBeDefined();
    });

    it('preserves existing cards when adding', () => {
      const initialCount = getParallelCards().length;
      addParallelCard(makeParallelCard({ id: 'added-card' }));
      const cards = getParallelCards();
      expect(cards.length).toBe(initialCount + 1);
    });
  });

  // ─── updateParallelOwnership ──────────────────────────────────────────

  describe('updateParallelOwnership', () => {
    it('updates owned status of a parallel', () => {
      const cards = getParallelCards();
      const card = cards[0];
      const unownedParallel = card.parallels.find((p) => !p.owned);
      if (!unownedParallel) return;

      const updated = updateParallelOwnership(card.id, unownedParallel.name, true);
      const updatedCard = updated.find((c) => c.id === card.id)!;
      const updatedParallel = updatedCard.parallels.find((p) => p.name === unownedParallel.name)!;
      expect(updatedParallel.owned).toBe(true);
    });

    it('recalculates ownedCount after update', () => {
      const cards = getParallelCards();
      const card = cards[0];
      const originalOwned = card.ownedCount;
      const unownedParallel = card.parallels.find((p) => !p.owned);
      if (!unownedParallel) return;

      const updated = updateParallelOwnership(card.id, unownedParallel.name, true);
      const updatedCard = updated.find((c) => c.id === card.id)!;
      expect(updatedCard.ownedCount).toBe(originalOwned + 1);
    });

    it('recalculates completionPercent after update', () => {
      const cards = getParallelCards();
      // Find a card with low completion so marking one owned always increases it
      const card = cards.find((c) => c.completionPercent < 60 && c.parallels.some((p) => !p.owned))!;
      expect(card).toBeDefined();
      const unownedParallel = card.parallels.find((p) => !p.owned)!;

      const updated = updateParallelOwnership(card.id, unownedParallel.name, true);
      const updatedCard = updated.find((c) => c.id === card.id)!;
      expect(updatedCard.completionPercent).toBeGreaterThan(card.completionPercent);
    });

    it('handles non-existent card id gracefully', () => {
      const result = updateParallelOwnership('nonexistent', 'Base', true);
      expect(result.length).toBeGreaterThan(0); // returns all cards unchanged
    });
  });

  // ─── getParallelSets ──────────────────────────────────────────────────

  describe('getParallelSets', () => {
    it('returns mock sets when localStorage is empty', () => {
      const sets = getParallelSets();
      expect(sets.length).toBeGreaterThanOrEqual(3);
    });

    it('each set has parallelTypes array', () => {
      const sets = getParallelSets();
      for (const s of sets) {
        expect(s.parallelTypes.length).toBeGreaterThan(0);
        for (const pt of s.parallelTypes) {
          expect(pt.name).toBeDefined();
          expect(pt.color).toBeDefined();
          expect(pt.rarity).toBeDefined();
        }
      }
    });
  });

  // ─── getParallelStats ─────────────────────────────────────────────────

  describe('getParallelStats', () => {
    it('returns valid stats object', () => {
      const stats = getParallelStats();
      expect(stats.totalCardsTracked).toBeGreaterThan(0);
      expect(stats.totalParallelsOwned).toBeGreaterThan(0);
      expect(stats.uniqueParallels).toBeGreaterThan(0);
      expect(stats.completionRate).toBeGreaterThan(0);
      expect(stats.completionRate).toBeLessThanOrEqual(100);
      expect(stats.totalValue).toBeGreaterThan(0);
    });

    it('identifies rarest owned parallel', () => {
      const stats = getParallelStats();
      expect(stats.rarestOwned.name).toBeDefined();
      expect(stats.rarestOwned.numberedTo).toBeGreaterThan(0);
    });

    it('identifies most complete card', () => {
      const stats = getParallelStats();
      expect(stats.mostComplete.cardName).toBeDefined();
      expect(stats.mostComplete.percent).toBeGreaterThan(0);
    });
  });

  // ─── getRarityBreakdown ───────────────────────────────────────────────

  describe('getRarityBreakdown', () => {
    it('returns breakdown for all rarity tiers present', () => {
      const tiers = getRarityBreakdown();
      expect(tiers.length).toBeGreaterThan(0);
      for (const tier of tiers) {
        expect(tier.rarity).toBeDefined();
        expect(tier.count).toBeGreaterThan(0);
        expect(tier.totalValue).toBeGreaterThan(0);
        expect(tier.avgValue).toBeGreaterThan(0);
      }
    });

    it('ownedCount is less than or equal to count for each tier', () => {
      const tiers = getRarityBreakdown();
      for (const tier of tiers) {
        expect(tier.ownedCount).toBeLessThanOrEqual(tier.count);
      }
    });
  });

  // ─── getMostComplete ──────────────────────────────────────────────────

  describe('getMostComplete', () => {
    it('returns cards sorted by completionPercent descending', () => {
      const top = getMostComplete(5);
      for (let i = 1; i < top.length; i++) {
        expect(top[i - 1].completionPercent).toBeGreaterThanOrEqual(top[i].completionPercent);
      }
    });

    it('respects the limit parameter', () => {
      const top3 = getMostComplete(3);
      expect(top3.length).toBeLessThanOrEqual(3);
    });
  });

  // ─── getMostValuable ──────────────────────────────────────────────────

  describe('getMostValuable', () => {
    it('returns cards sorted by totalValue descending', () => {
      const top = getMostValuable(5);
      for (let i = 1; i < top.length; i++) {
        expect(top[i - 1].totalValue).toBeGreaterThanOrEqual(top[i].totalValue);
      }
    });

    it('respects the limit parameter', () => {
      const top2 = getMostValuable(2);
      expect(top2.length).toBeLessThanOrEqual(2);
    });
  });

  // ─── getParallelsByRarity ─────────────────────────────────────────────

  describe('getParallelsByRarity', () => {
    it('filters cards that contain parallels of specified rarity', () => {
      const rareCards = getParallelsByRarity('rare');
      for (const card of rareCards) {
        expect(card.parallels.some((p) => p.rarity === 'rare')).toBe(true);
      }
    });

    it('returns empty array for rarity with no matches', () => {
      localStorage.setItem('msi_parallel_universe_cards', JSON.stringify([]));
      const result = getParallelsByRarity('one_of_one');
      expect(result).toHaveLength(0);
    });
  });

  // ─── getSetParallels ──────────────────────────────────────────────────

  describe('getSetParallels', () => {
    it('returns a set by id', () => {
      const sets = getParallelSets();
      const set = getSetParallels(sets[0].id);
      expect(set).toBeDefined();
      expect(set!.id).toBe(sets[0].id);
    });

    it('returns undefined for unknown set id', () => {
      const result = getSetParallels('nonexistent');
      expect(result).toBeUndefined();
    });
  });

  // ─── getCompletionBySet ───────────────────────────────────────────────

  describe('getCompletionBySet', () => {
    it('returns completion data grouped by set', () => {
      const result = getCompletionBySet();
      expect(result.length).toBeGreaterThan(0);
      for (const entry of result) {
        expect(entry.setName).toBeDefined();
        expect(entry.completionPercent).toBeGreaterThanOrEqual(0);
        expect(entry.ownedCount).toBeLessThanOrEqual(entry.totalCards);
      }
    });
  });

  // ─── formatCurrency ───────────────────────────────────────────────────

  describe('formatCurrency', () => {
    it('formats a number as USD currency', () => {
      const result = formatCurrency(1234.5);
      expect(result).toContain('$');
      expect(result).toContain('1');
      expect(result).toContain('.50');
    });

    it('handles zero', () => {
      expect(formatCurrency(0)).toContain('$');
      expect(formatCurrency(0)).toContain('0.00');
    });
  });

  // ─── formatPercent ────────────────────────────────────────────────────

  describe('formatPercent', () => {
    it('formats as percentage string', () => {
      expect(formatPercent(50)).toBe('50.0%');
    });

    it('handles decimal values', () => {
      expect(formatPercent(33.33)).toBe('33.3%');
    });
  });

  // ─── getRarityColor ───────────────────────────────────────────────────

  describe('getRarityColor', () => {
    it('returns a color for each known rarity', () => {
      const rarities = ['common', 'uncommon', 'rare', 'super_rare', 'ssp', 'one_of_one'];
      const colors = new Set<string>();
      for (const r of rarities) {
        const color = getRarityColor(r);
        expect(color).toMatch(/^#/);
        colors.add(color);
      }
      // All known rarities should have distinct colors
      expect(colors.size).toBe(6);
    });

    it('returns default color for unknown rarity', () => {
      const color = getRarityColor('mythical');
      expect(color).toMatch(/^#/);
    });
  });

  // ─── getRarityLabel ───────────────────────────────────────────────────

  describe('getRarityLabel', () => {
    it('returns human-readable labels', () => {
      expect(getRarityLabel('common')).toBe('Common');
      expect(getRarityLabel('one_of_one')).toBe('1/1');
      expect(getRarityLabel('ssp')).toBe('SSP');
      expect(getRarityLabel('super_rare')).toBe('Super Rare');
    });

    it('returns the input for unknown rarity', () => {
      expect(getRarityLabel('legendary')).toBe('legendary');
    });
  });

  // ─── getCompletionColor ───────────────────────────────────────────────

  describe('getCompletionColor', () => {
    it('returns green for high completion', () => {
      expect(getCompletionColor(90)).toBe('#22C55E');
    });

    it('returns blue for moderate completion', () => {
      expect(getCompletionColor(65)).toBe('#3B82F6');
    });

    it('returns yellow for mid completion', () => {
      expect(getCompletionColor(45)).toBe('#EAB308');
    });

    it('returns orange for low completion', () => {
      expect(getCompletionColor(25)).toBe('#F97316');
    });

    it('returns red for very low completion', () => {
      expect(getCompletionColor(10)).toBe('#EF4444');
    });
  });
});
