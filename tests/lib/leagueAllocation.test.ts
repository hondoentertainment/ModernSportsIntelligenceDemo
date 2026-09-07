import { describe, expect, it } from 'vitest';
import {
  buildBriefingHtml,
  buildBriefingText,
  buildLeagueAllocation,
} from '../../lib/utils/leagueAllocation';
import type { CardInventory } from '../../types';

function card(overrides: Partial<CardInventory> = {}): CardInventory {
  return {
    id: 'c1',
    player: 'A',
    year: 2024,
    manufacturer: 'Topps',
    cardNumber: '1',
    set: 'S',
    sport: 'Baseball',
    league: 'MLB',
    isAutographed: false,
    condition: 'Mint',
    isGraded: false,
    purchasePrice: 100,
    currentValue: 75,
    purchaseDate: '2024-01-01',
    ...overrides,
  };
}

describe('leagueAllocation', () => {
  it('splits NAV by league with percents', () => {
    const slices = buildLeagueAllocation([
      card(),
      card({ id: 'c2', player: 'B', league: 'NBA', sport: 'Basketball', currentValue: 25 }),
    ]);
    expect(slices[0].league).toBe('MLB');
    expect(slices[0].pct).toBe(75);
    expect(slices[1].league).toBe('NBA');
    expect(slices[1].pct).toBe(25);
  });

  it('returns empty slices for empty inventory', () => {
    expect(buildLeagueAllocation([])).toEqual([]);
  });

  it('builds a text briefing with allocation and insight', () => {
    const text = buildBriefingText([card()], 'Seeded insight');
    expect(text).toMatch(/MORNING BRIEFING/);
    expect(text).toMatch(/MLB: 100.0%/);
    expect(text).toMatch(/Seeded insight/);
    expect(text).toMatch(/Heuristic briefing/);
  });

  it('escapes HTML in the downloadable packet', () => {
    const html = buildBriefingHtml([card()], '<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>alert');
  });
});
