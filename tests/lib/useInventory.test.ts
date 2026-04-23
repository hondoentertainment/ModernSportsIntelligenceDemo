import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { calculateStats, useInventory } from '../../lib/utils/useInventory';
import type { CardInventory, TargetWatchlist } from '../../types';
import { store } from '../../lib/dal/syncStore';

vi.mock('../../lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

// Minimal valid card fixture
function makeCard(overrides: Partial<CardInventory> = {}): CardInventory {
  return {
    id: `card-${Math.random().toString(36).slice(2)}`,
    player: 'Test Player',
    year: 2024,
    manufacturer: 'Topps',
    cardNumber: '1',
    set: 'Series 1',
    sport: 'Baseball',
    league: 'MLB',
    isAutographed: false,
    condition: 'Mint',
    isGraded: false,
    purchasePrice: 100,
    currentValue: 150,
    purchaseDate: '2024-01-01',
    ...overrides,
  };
}

function makeTarget(overrides: Partial<TargetWatchlist> = {}): TargetWatchlist {
  return {
    id: `target-${Math.random().toString(36).slice(2)}`,
    player: 'Watch Player',
    cardDescription: 'Test Card',
    targetPrice: 200,
    priority: 'Medium',
    sport: 'Baseball',
    league: 'MLB',
    status: 'active',
    createdAt: '2024-01-01',
    ...overrides,
  };
}

const storage: Record<string, string> = {};
const lsMock = {
  get length() { return Object.keys(storage).length; },
  key: (i: number) => Object.keys(storage)[i] ?? null,
  getItem: (k: string) => storage[k] ?? null,
  setItem: (k: string, v: string) => { storage[k] = v; },
  removeItem: (k: string) => { delete storage[k]; },
  clear: () => { for (const k of Object.keys(storage)) delete storage[k]; },
};

describe('useInventory hook', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', lsMock);
    lsMock.clear();
    store.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts with empty inventory', () => {
    const { result } = renderHook(() => useInventory());
    expect(result.current.inventory).toHaveLength(0);
  });

  it('addCard prepends card to inventory', () => {
    const { result } = renderHook(() => useInventory());
    const card = makeCard();

    act(() => { result.current.addCard(card); });

    expect(result.current.inventory).toHaveLength(1);
    expect(result.current.inventory[0].id).toBe(card.id);
  });

  it('addCard persists to store', () => {
    const { result } = renderHook(() => useInventory());
    const card = makeCard();

    act(() => { result.current.addCard(card); });

    const stored = store.get<CardInventory[]>('cardx_inventory', []);
    expect(stored.some(c => c.id === card.id)).toBe(true);
  });

  it('updateCard applies partial updates to existing card', () => {
    const { result } = renderHook(() => useInventory());
    const card = makeCard({ currentValue: 100 });

    act(() => { result.current.addCard(card); });
    act(() => { result.current.updateCard(card.id, { currentValue: 250, notes: 'Updated' }); });

    const updated = result.current.inventory.find(c => c.id === card.id);
    expect(updated?.currentValue).toBe(250);
    expect(updated?.notes).toBe('Updated');
    expect(updated?.player).toBe('Test Player'); // unchanged fields preserved
  });

  it('updateCard is a no-op for unknown id', () => {
    const { result } = renderHook(() => useInventory());
    const card = makeCard();
    act(() => { result.current.addCard(card); });
    act(() => { result.current.updateCard('nonexistent', { currentValue: 999 }); });

    expect(result.current.inventory).toHaveLength(1);
    expect(result.current.inventory[0].currentValue).toBe(150);
  });

  it('deleteCard removes the card by id', () => {
    const { result } = renderHook(() => useInventory());
    const card1 = makeCard();
    const card2 = makeCard();

    act(() => { result.current.addCard(card1); result.current.addCard(card2); });
    act(() => { result.current.deleteCard(card1.id); });

    expect(result.current.inventory.some(c => c.id === card1.id)).toBe(false);
    expect(result.current.inventory.some(c => c.id === card2.id)).toBe(true);
  });

  it('deleteCard persists removal to store', () => {
    const { result } = renderHook(() => useInventory());
    const card = makeCard();
    act(() => { result.current.addCard(card); });
    act(() => { result.current.deleteCard(card.id); });

    const stored = store.get<CardInventory[]>('cardx_inventory', []);
    expect(stored.some(c => c.id === card.id)).toBe(false);
  });

  it('addTarget prepends target to watchlist', () => {
    const { result } = renderHook(() => useInventory());
    const target = makeTarget();

    act(() => { result.current.addTarget(target); });

    expect(result.current.targets).toHaveLength(1);
    expect(result.current.targets[0].id).toBe(target.id);
  });

  it('updateTarget applies partial updates to existing target', () => {
    const { result } = renderHook(() => useInventory());
    const target = makeTarget({ targetPrice: 180 });

    act(() => { result.current.addTarget(target); });
    act(() => { result.current.updateTarget(target.id, { targetPrice: 195, status: 'acquired' }); });

    const updated = result.current.targets.find(t => t.id === target.id);
    expect(updated?.targetPrice).toBe(195);
    expect(updated?.status).toBe('acquired');
    expect(updated?.player).toBe('Watch Player'); // unchanged
  });

  it('refreshFromStorage reloads inventory from store', () => {
    const cards = [makeCard(), makeCard()];
    store.set('cardx_inventory', cards);

    const { result } = renderHook(() => useInventory());
    act(() => { result.current.refreshFromStorage(); });

    expect(result.current.inventory).toHaveLength(2);
  });

  it('totalCards reflects current inventory length', () => {
    const { result } = renderHook(() => useInventory());
    expect(result.current.totalCards).toBe(0);

    act(() => { result.current.addCard(makeCard()); result.current.addCard(makeCard()); });
    expect(result.current.totalCards).toBe(2);
  });
});

describe('useInventory', () => {
  describe('calculateStats', () => {
    it('calculates stats for empty inventory', () => {
      const stats = calculateStats([]);
      expect(stats.totalValue).toBe(0);
      expect(stats.totalCost).toBe(0);
      expect(stats.cardCount).toBe(0);
      expect(stats.roi).toBe(0);
    });

    it('calculates total value and cost', () => {
      const inventory: CardInventory[] = [
        {
          id: 'card-1',
          player: 'Player 1',
          year: 2024,
          manufacturer: 'Topps',
          cardNumber: '1',
          set: 'Series 1',
          sport: 'Baseball',
          league: 'MLB',
          isAutographed: false,
          condition: 'Mint',
          isGraded: false,
          purchasePrice: 100,
          currentValue: 150,
          purchaseDate: '2024-01-01',
        },
        {
          id: 'card-2',
          player: 'Player 2',
          year: 2024,
          manufacturer: 'Topps',
          cardNumber: '2',
          set: 'Series 1',
          sport: 'Baseball',
          league: 'MLB',
          isAutographed: false,
          condition: 'Mint',
          isGraded: false,
          purchasePrice: 200,
          currentValue: 250,
          purchaseDate: '2024-01-01',
        },
      ];
      const stats = calculateStats(inventory);
      expect(stats.totalValue).toBe(400);
      expect(stats.grossCost).toBe(300);
      expect(stats.cardCount).toBe(2);
    });

    it('includes fees in total cost', () => {
      const inventory: CardInventory[] = [
        {
          id: 'card-1',
          player: 'Player 1',
          year: 2024,
          manufacturer: 'Topps',
          cardNumber: '1',
          set: 'Series 1',
          sport: 'Baseball',
          league: 'MLB',
          isAutographed: false,
          condition: 'Mint',
          isGraded: false,
          purchasePrice: 100,
          gradingFees: 25,
          shippingFees: 10,
          purchaseDate: '2024-01-01',
        },
      ];
      const stats = calculateStats(inventory);
      expect(stats.totalCost).toBe(135);
      expect(stats.totalFees).toBe(35);
    });

    it('calculates profit and ROI', () => {
      const inventory: CardInventory[] = [
        {
          id: 'card-1',
          player: 'Player 1',
          year: 2024,
          manufacturer: 'Topps',
          cardNumber: '1',
          set: 'Series 1',
          sport: 'Baseball',
          league: 'MLB',
          isAutographed: false,
          condition: 'Mint',
          isGraded: false,
          purchasePrice: 100,
          currentValue: 150,
          purchaseDate: '2024-01-01',
        },
      ];
      const stats = calculateStats(inventory);
      expect(stats.profit).toBe(50);
      expect(stats.roi).toBe(50);
    });

    it('handles zero cost basis', () => {
      const inventory: CardInventory[] = [
        {
          id: 'card-1',
          player: 'Player 1',
          year: 2024,
          manufacturer: 'Topps',
          cardNumber: '1',
          set: 'Series 1',
          sport: 'Baseball',
          league: 'MLB',
          isAutographed: false,
          condition: 'Mint',
          isGraded: false,
          purchasePrice: 0,
          currentValue: 100,
          purchaseDate: '2024-01-01',
        },
      ];
      const stats = calculateStats(inventory);
      expect(stats.roi).toBe(0);
    });
  });
});
