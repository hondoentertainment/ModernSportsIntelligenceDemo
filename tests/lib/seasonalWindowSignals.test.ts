import { describe, expect, it } from 'vitest';
import {
  getHoldingsSeasonalWindows,
  getPlayerSeasonalHint,
  resolveCalendarEvent,
  windowTypeForEvent,
} from '../../lib/analytics/seasonalWindowSignals';
import type { CardInventory } from '../../types';

function card(overrides: Partial<CardInventory> = {}): CardInventory {
  return {
    id: 'c1',
    player: 'Mike Trout',
    year: 2011,
    manufacturer: 'Topps',
    cardNumber: '1',
    set: 'Update',
    sport: 'Baseball',
    league: 'MLB',
    isAutographed: false,
    condition: 'Mint',
    isGraded: false,
    purchasePrice: 100,
    purchaseDate: '2024-01-01',
    currentValue: 150,
    status: 'active',
    ...overrides,
  };
}

describe('seasonalWindowSignals', () => {
  it('maps baseball months to spring training, All-Star, playoffs, off-season', () => {
    expect(resolveCalendarEvent('Baseball', 3).event).toBe('spring_training');
    expect(resolveCalendarEvent('Baseball', 7).event).toBe('all_star');
    expect(resolveCalendarEvent('Baseball', 10).event).toBe('playoffs');
    expect(resolveCalendarEvent('Baseball', 12).event).toBe('off_season');
  });

  it('maps calendar events to buy/sell/hold', () => {
    expect(windowTypeForEvent('off_season')).toBe('buy');
    expect(windowTypeForEvent('spring_training')).toBe('buy');
    expect(windowTypeForEvent('playoffs')).toBe('sell');
    expect(windowTypeForEvent('all_star')).toBe('hold');
  });

  it('returns a disclosed per-player hint', () => {
    const hint = getPlayerSeasonalHint(card(), new Date('2026-03-15T12:00:00Z'));
    expect(hint.player).toBe('Mike Trout');
    expect(hint.event).toBe('spring_training');
    expect(hint.windowType).toBe('buy');
    expect(hint.source).toBe('seeded_heuristic');
    expect(hint.rationale).toMatch(/heuristic/i);
  });

  it('groups holdings by player and skips sold cards', () => {
    const hints = getHoldingsSeasonalWindows([
      card({ id: 'a' }),
      card({ id: 'b', cardNumber: '2' }),
      card({ id: 'sold', status: 'sold', player: 'Sold Guy' }),
    ], new Date('2026-10-02T12:00:00Z'));
    expect(hints).toHaveLength(1);
    expect(hints[0].cardCount).toBe(2);
    expect(hints[0].windowType).toBe('sell');
  });
});
