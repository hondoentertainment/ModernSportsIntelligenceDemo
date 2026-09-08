import { describe, expect, it } from 'vitest';
import {
  CONCENTRATION_DISCLOSURE,
  CONCENTRATION_THRESHOLD_PCT,
  analyzePortfolioConcentration,
} from '../../lib/analytics/portfolioConcentration';
import type { CardInventory } from '../../types';

function card(overrides: Partial<CardInventory> = {}): CardInventory {
  return {
    id: 'id',
    player: 'Player',
    year: 2024,
    manufacturer: 'Topps',
    cardNumber: '1',
    set: 'Chrome',
    sport: 'Baseball',
    league: 'MLB',
    isAutographed: false,
    condition: 'Mint',
    isGraded: false,
    purchasePrice: 100,
    purchaseDate: '2024-01-01',
    currentValue: 100,
    status: 'active',
    ...overrides,
  };
}

describe('portfolioConcentration', () => {
  it('returns empty concentration when inventory has no NAV', () => {
    const report = analyzePortfolioConcentration([
      card({ id: 'zero', currentValue: 0, purchasePrice: 0 }),
      card({ id: 'sold', status: 'sold', currentValue: 9000 }),
    ]);
    expect(report.nav).toBe(0);
    expect(report.players).toEqual([]);
    expect(report.hints).toEqual([]);
    expect(report.disclosure).toBe(CONCENTRATION_DISCLOSURE);
  });

  it('flags player and league over-concentration and links to trade proposals', () => {
    const report = analyzePortfolioConcentration([
      card({ id: 't1', player: 'Mike Trout', currentValue: 8000, purchasePrice: 4000 }),
      card({ id: 't2', player: 'Mike Trout', currentValue: 2000, purchasePrice: 1000, cardNumber: '2' }),
      card({ id: 'o1', player: 'Other Guy', league: 'NBA', sport: 'Basketball', currentValue: 400, purchasePrice: 300 }),
    ]);
    expect(report.nav).toBe(10400);
    const trout = report.players.find((row) => row.label === 'Mike Trout');
    expect(trout?.overConcentrated).toBe(true);
    expect(trout?.sharePct).toBeGreaterThanOrEqual(CONCENTRATION_THRESHOLD_PCT);
    expect(report.leagues.some((row) => row.label === 'MLB' && row.overConcentrated)).toBe(true);
    expect(report.hints[0].href).toBe('/collection');
    expect(report.hints[0].detail).toMatch(/advisory only/i);
  });

  it('points at Auto-Pilot when concentrated but no swap pair exists', () => {
    const report = analyzePortfolioConcentration([
      card({ id: 'only', player: 'Solo Star', currentValue: 500, purchasePrice: 200 }),
    ]);
    expect(report.overConcentrated.length).toBeGreaterThan(0);
    expect(report.hints[0].href).toBe('/war-room');
    expect(report.hints[0].hrefLabel).toMatch(/auto-pilot/i);
  });

  it('does not hint when allocation is already diversified', () => {
    const report = analyzePortfolioConcentration([
      card({ id: 'a', player: 'A', currentValue: 110, league: 'MLB' }),
      card({ id: 'b', player: 'B', currentValue: 110, league: 'NBA', sport: 'Basketball' }),
      card({ id: 'c', player: 'C', currentValue: 110, league: 'NFL', sport: 'Football' }),
    ]);
    expect(report.overConcentrated).toEqual([]);
    expect(report.hints).toEqual([]);
  });
});
