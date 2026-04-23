// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { makeCard, setupLocalStorageMock } from '../helpers';

// We need a resettable cache for the store mock
let storeCache: Record<string, unknown> = {};

// Mock the DAL syncStore so useInventory can import it
vi.mock('../../lib/dal/syncStore', () => {
  return {
    store: {
      get: vi.fn((<T>(key: string, fallback: T): T => {
        return (storeCache[key] as T) ?? fallback;
      }) as <T>(key: string, fallback: T) => T),
      set: vi.fn((key: string, value: unknown) => {
        storeCache[key] = value;
      }),
      remove: vi.fn((key: string) => {
        delete storeCache[key];
      }),
      has: vi.fn((key: string) => key in storeCache),
    },
  };
});

// Mock logger
vi.mock('../../lib/logger', () => ({
  logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

// Import after mocks are set up
import { calculateStats, useInventory } from '../../lib/utils/useInventory';

describe('inventoryService', () => {
  setupLocalStorageMock();

  beforeEach(() => {
    // Unmount any previous renderHook components so their effects don't fire late
    cleanup();
    // Reset the store cache
    storeCache = {};
  });

  // ── calculateStats ──────────────────────────────────────────────────

  describe('calculateStats', () => {
    it('returns zero values for an empty inventory', () => {
      const stats = calculateStats([]);
      expect(stats.totalValue).toBe(0);
      expect(stats.totalCost).toBe(0);
      expect(stats.grossCost).toBe(0);
      expect(stats.totalFees).toBe(0);
      expect(stats.cardCount).toBe(0);
      expect(stats.profit).toBe(0);
      expect(stats.roi).toBe(0);
    });

    it('calculates correct total value from multiple cards', () => {
      const cards = [
        makeCard({ currentValue: 100 }),
        makeCard({ id: '2', currentValue: 200 }),
        makeCard({ id: '3', currentValue: 50 }),
      ];
      const stats = calculateStats(cards);
      expect(stats.totalValue).toBe(350);
    });

    it('calculates correct card count', () => {
      const cards = [
        makeCard({ id: '1' }),
        makeCard({ id: '2' }),
        makeCard({ id: '3' }),
      ];
      const stats = calculateStats(cards);
      expect(stats.cardCount).toBe(3);
    });

    it('calculates gross cost from purchase prices', () => {
      const cards = [
        makeCard({ purchasePrice: 50 }),
        makeCard({ id: '2', purchasePrice: 150 }),
      ];
      const stats = calculateStats(cards);
      expect(stats.grossCost).toBe(200);
    });

    it('includes grading and shipping fees in totalFees', () => {
      const cards = [
        makeCard({ gradingFees: 20, shippingFees: 10 }),
        makeCard({ id: '2', gradingFees: 15, shippingFees: 5 }),
      ];
      const stats = calculateStats(cards);
      expect(stats.totalFees).toBe(50);
    });

    it('totalCost = grossCost + totalFees', () => {
      const cards = [
        makeCard({ purchasePrice: 100, gradingFees: 20, shippingFees: 10 }),
      ];
      const stats = calculateStats(cards);
      expect(stats.totalCost).toBe(130);
      expect(stats.totalCost).toBe(stats.grossCost + stats.totalFees);
    });

    it('calculates positive profit when value exceeds cost', () => {
      const cards = [
        makeCard({ purchasePrice: 50, currentValue: 200, gradingFees: 0, shippingFees: 0 }),
      ];
      const stats = calculateStats(cards);
      expect(stats.profit).toBe(150);
      expect(stats.roi).toBe(300); // (150/50) * 100
    });

    it('calculates negative profit when cost exceeds value', () => {
      const cards = [
        makeCard({ purchasePrice: 200, currentValue: 50, gradingFees: 0, shippingFees: 0 }),
      ];
      const stats = calculateStats(cards);
      expect(stats.profit).toBe(-150);
      expect(stats.roi).toBeLessThan(0);
    });

    it('ROI is 0 when totalCost is 0', () => {
      const cards = [
        makeCard({ purchasePrice: 0, currentValue: 100, gradingFees: 0, shippingFees: 0 }),
      ];
      const stats = calculateStats(cards);
      expect(stats.roi).toBe(0);
    });

    it('handles cards with undefined currentValue (treats as 0)', () => {
      const cards = [
        makeCard({ purchasePrice: 100, currentValue: undefined }),
      ];
      const stats = calculateStats(cards);
      expect(stats.totalValue).toBe(0);
    });

    it('handles cards with undefined fees (treats as 0)', () => {
      const cards = [
        makeCard({ purchasePrice: 100, gradingFees: undefined, shippingFees: undefined }),
      ];
      const stats = calculateStats(cards);
      expect(stats.totalFees).toBe(0);
      expect(stats.totalCost).toBe(100);
    });
  });

  // ── useInventory hook (add / remove / duplicate detection / count) ──

  describe('useInventory hook behavior', () => {
    it('starts with an empty inventory when storage is empty', () => {
      const { result } = renderHook(() => useInventory());
      expect(result.current.inventory).toEqual([]);
      expect(result.current.totalCards).toBe(0);
    });

    it('can add a card to inventory', () => {
      const { result } = renderHook(() => useInventory());

      const newCard = makeCard({ id: 'new-card-1', player: 'Mike Trout' });
      act(() => {
        result.current.addCard(newCard);
      });

      expect(result.current.inventory).toHaveLength(1);
      expect(result.current.inventory[0].id).toBe('new-card-1');
      expect(result.current.inventory[0].player).toBe('Mike Trout');
      expect(result.current.totalCards).toBe(1);
    });

    it('new cards are prepended (most recent first)', () => {
      const { result } = renderHook(() => useInventory());

      const card1 = makeCard({ id: 'card-1', player: 'First' });
      const card2 = makeCard({ id: 'card-2', player: 'Second' });

      act(() => {
        result.current.addCard(card1);
      });
      act(() => {
        result.current.addCard(card2);
      });

      expect(result.current.inventory[0].id).toBe('card-2');
      expect(result.current.inventory[1].id).toBe('card-1');
    });

    it('can remove a card from inventory by id', () => {
      const { result } = renderHook(() => useInventory());

      const card1 = makeCard({ id: 'card-to-keep', player: 'Keeper' });
      const card2 = makeCard({ id: 'card-to-remove', player: 'Remover' });

      act(() => {
        result.current.addCard(card1);
        result.current.addCard(card2);
      });

      expect(result.current.inventory).toHaveLength(2);

      act(() => {
        result.current.deleteCard('card-to-remove');
      });

      expect(result.current.inventory).toHaveLength(1);
      expect(result.current.inventory[0].id).toBe('card-to-keep');
      expect(result.current.totalCards).toBe(1);
    });

    it('removing a non-existent card does not change inventory', () => {
      const { result } = renderHook(() => useInventory());

      const card = makeCard({ id: 'existing' });
      act(() => {
        result.current.addCard(card);
      });

      act(() => {
        result.current.deleteCard('non-existent-id');
      });

      expect(result.current.inventory).toHaveLength(1);
    });

    it('duplicate detection: adding cards with same id creates duplicates (no built-in dedup)', () => {
      const { result } = renderHook(() => useInventory());

      const card = makeCard({ id: 'dup-card' });

      act(() => {
        result.current.addCard(card);
        result.current.addCard({ ...card });
      });

      // The hook does not deduplicate — both are added
      expect(result.current.inventory).toHaveLength(2);
      expect(result.current.inventory.filter(c => c.id === 'dup-card')).toHaveLength(2);
    });

    it('card count tracking reflects add and remove operations', () => {
      const { result } = renderHook(() => useInventory());

      expect(result.current.totalCards).toBe(0);

      act(() => {
        result.current.addCard(makeCard({ id: 'a' }));
      });
      expect(result.current.totalCards).toBe(1);

      act(() => {
        result.current.addCard(makeCard({ id: 'b' }));
      });
      expect(result.current.totalCards).toBe(2);

      act(() => {
        result.current.deleteCard('a');
      });
      expect(result.current.totalCards).toBe(1);

      act(() => {
        result.current.deleteCard('b');
      });
      expect(result.current.totalCards).toBe(0);
    });

    it('can update a card in the inventory', () => {
      const { result } = renderHook(() => useInventory());

      const card = makeCard({ id: 'update-me', currentValue: 100 });
      act(() => {
        result.current.addCard(card);
      });

      act(() => {
        result.current.updateCard('update-me', { currentValue: 250 });
      });

      expect(result.current.inventory[0].currentValue).toBe(250);
      expect(result.current.inventory[0].player).toBe('Test Player'); // unchanged fields preserved
    });
  });
});
