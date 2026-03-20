import { describe, it, expect, vi, beforeEach } from 'vitest';
import { detectSignals } from '../../lib/utils/signals';
import type { CardInventory, TargetWatchlist } from '../../types';
import { generatePopData } from '../../lib/analytics/scarcityService';

vi.mock('../../lib/analytics/scarcityService', () => ({
  generatePopData: vi.fn(),
}));

describe('detectSignals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(generatePopData).mockReturnValue({
      popCount: 10,
      popHigher: 5,
      scarcityIndex: 50,
    });
  });

  it('returns empty array when watchlist and inventory are empty', () => {
    const signals = detectSignals([], []);
    expect(signals).toEqual([]);
  });

  it('detects buy signal when target price is breached', () => {
    const watchlist: TargetWatchlist[] = [
      {
        id: 'target-1',
        player: 'Test Player',
        cardDescription: 'Rookie Card',
        priority: 'High',
        targetPrice: 100,
        currentMarketPrice: 80,
        sport: 'Baseball',
        league: 'MLB',
        status: 'active',
        createdAt: '2024-01-01',
      },
    ];
    const signals = detectSignals(watchlist, []);
    expect(signals).toHaveLength(1);
    expect(signals[0].type).toBe('buy');
    expect(signals[0].impact).toBe('high');
    expect(signals[0].title).toContain('Target Price Breached');
  });

  it('detects buy signal with medium impact for low priority', () => {
    const watchlist: TargetWatchlist[] = [
      {
        id: 'target-1',
        player: 'Test Player',
        cardDescription: 'Rookie Card',
        priority: 'Low',
        targetPrice: 100,
        currentMarketPrice: 90,
        sport: 'Baseball',
        league: 'MLB',
        status: 'active',
        createdAt: '2024-01-01',
      },
    ];
    const signals = detectSignals(watchlist, []);
    expect(signals[0].impact).toBe('medium');
  });

  it('does not detect buy signal for inactive targets', () => {
    const watchlist: TargetWatchlist[] = [
      {
        id: 'target-1',
        player: 'Test Player',
        cardDescription: 'Rookie Card',
        priority: 'High',
        targetPrice: 100,
        currentMarketPrice: 80,
        sport: 'Baseball',
        league: 'MLB',
        status: 'inactive',
        createdAt: '2024-01-01',
      },
    ];
    const signals = detectSignals(watchlist, []);
    expect(signals).toHaveLength(0);
  });

  it('detects sell signal when ROI exceeds 50%', () => {
    const inventory: CardInventory[] = [
      {
        id: 'card-1',
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
        currentValue: 200,
        purchaseDate: '2024-01-01',
      },
    ];
    const signals = detectSignals([], inventory);
    expect(signals).toHaveLength(1);
    expect(signals[0].type).toBe('sell');
    expect(signals[0].title).toContain('High ROI Alert');
  });

  it('detects high impact sell signal when ROI exceeds 100%', () => {
    const inventory: CardInventory[] = [
      {
        id: 'card-1',
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
        currentValue: 250,
        purchaseDate: '2024-01-01',
      },
    ];
    const signals = detectSignals([], inventory);
    expect(signals[0].impact).toBe('high');
  });

  it('detects scarcity signal for Pop 1 cards', () => {
    vi.mocked(generatePopData).mockReturnValue({
      popCount: 1,
      popHigher: 0,
      scarcityIndex: 100,
    });
    const inventory: CardInventory[] = [
      {
        id: 'card-1',
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
        purchaseDate: '2024-01-01',
      },
    ];
    const signals = detectSignals([], inventory);
    expect(signals).toHaveLength(1);
    expect(signals[0].type).toBe('scarcity');
    expect(signals[0].title).toContain('Pop 1 Alert');
    expect(signals[0].impact).toBe('high');
  });

  it('detects low population scarcity signal', () => {
    vi.mocked(generatePopData).mockReturnValue({
      popCount: 3,
      popHigher: 1,
      scarcityIndex: 90,
    });
    const inventory: CardInventory[] = [
      {
        id: 'card-1',
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
        purchaseDate: '2024-01-01',
      },
    ];
    const signals = detectSignals([], inventory);
    expect(signals).toHaveLength(1);
    expect(signals[0].type).toBe('scarcity');
    expect(signals[0].title).toContain('Low Population');
    expect(signals[0].impact).toBe('medium');
  });

  it('does not detect scarcity signal for high pop cards', () => {
    vi.mocked(generatePopData).mockReturnValue({
      popCount: 100,
      popHigher: 50,
      scarcityIndex: 30,
    });
    const inventory: CardInventory[] = [
      {
        id: 'card-1',
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
        purchaseDate: '2024-01-01',
      },
    ];
    const signals = detectSignals([], inventory);
    const scarcitySignals = signals.filter(s => s.type === 'scarcity');
    expect(scarcitySignals).toHaveLength(0);
  });

  it('uses existing scarcity data when available', () => {
    const inventory: CardInventory[] = [
      {
        id: 'card-1',
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
        purchaseDate: '2024-01-01',
        popCount: 1,
        popHigher: 0,
        scarcityIndex: 100,
      },
    ];
    const signals = detectSignals([], inventory);
    expect(generatePopData).not.toHaveBeenCalled();
    expect(signals).toHaveLength(1);
    expect(signals[0].type).toBe('scarcity');
  });

  it('detects multiple signal types simultaneously', () => {
    vi.mocked(generatePopData).mockReturnValue({
      popCount: 1,
      popHigher: 0,
      scarcityIndex: 100,
    });
    const watchlist: TargetWatchlist[] = [
      {
        id: 'target-1',
        player: 'Test Player',
        cardDescription: 'Rookie Card',
        priority: 'High',
        targetPrice: 100,
        currentMarketPrice: 80,
        sport: 'Baseball',
        league: 'MLB',
        status: 'active',
        createdAt: '2024-01-01',
      },
    ];
    const inventory: CardInventory[] = [
      {
        id: 'card-1',
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
        currentValue: 200,
        purchaseDate: '2024-01-01',
      },
    ];
    const signals = detectSignals(watchlist, inventory);
    expect(signals.length).toBeGreaterThan(1);
    expect(signals.some(s => s.type === 'buy')).toBe(true);
    expect(signals.some(s => s.type === 'sell')).toBe(true);
    expect(signals.some(s => s.type === 'scarcity')).toBe(true);
  });
});
