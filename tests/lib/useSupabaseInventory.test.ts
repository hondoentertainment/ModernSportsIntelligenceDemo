import { describe, expect, it } from 'vitest';
import type { TargetWatchlist } from '../../types';
import { coerceTargetWatchlist } from '../../lib/utils/useSupabaseInventory';

describe('useSupabaseInventory target coercion', () => {
  it('fills id/status/createdAt for target drafts', () => {
    const draft = {
      player: 'Shohei Ohtani',
      cardDescription: '2018 Bowman Chrome Auto PSA 10',
      priority: 'High' as const,
      targetPrice: 950,
      sport: 'Baseball' as const,
      league: 'MLB' as const,
      notes: 'Preferred from eBay sold comps',
      image: 'https://example.com/card.jpg',
    };

    const target = coerceTargetWatchlist(draft);
    expect(target.id).toBeTruthy();
    expect(target.status).toBe('active');
    expect(typeof target.createdAt).toBe('string');
    expect(target.player).toBe('Shohei Ohtani');
  });

  it('preserves already-normalized targets', () => {
    const normalized: TargetWatchlist = {
      id: 'target-1',
      player: 'Mike Trout',
      cardDescription: '2011 Topps Update PSA 10',
      priority: 'Medium',
      targetPrice: 1100,
      sport: 'Baseball',
      league: 'MLB',
      status: 'active',
      createdAt: '2026-03-27T00:00:00.000Z',
      image: 'https://example.com/trout.jpg',
    };

    const result = coerceTargetWatchlist(normalized);
    expect(result).toEqual(normalized);
  });
});
