import { describe, expect, it } from 'vitest';
import type { CardInventory } from '../../types';
import { buildPortfolioSeries } from '../../lib/analytics/portfolioSeries';

function card(overrides: Partial<CardInventory>): CardInventory {
  return {
    id: 'c',
    player: 'Aaron Judge',
    year: 2024,
    manufacturer: 'Topps',
    cardNumber: '1',
    set: 'Series 1',
    sport: 'Baseball',
    league: 'MLB',
    isAutographed: false,
    condition: 'Near Mint',
    isGraded: false,
    purchasePrice: 100,
    purchaseDate: '2026-08-01',
    currentValue: 160,
    status: 'active',
    ...overrides,
  };
}

describe('portfolioSeries', () => {
  it('walks cost to the local mark and skips sold cards', () => {
    const now = new Date('2026-10-14T00:00:00Z');
    const points = buildPortfolioSeries([
      card({}),
      card({ id: 'sold', status: 'sold', currentValue: 999, purchaseDate: '2020-01-01' }),
    ], now);
    expect(points).toHaveLength(6);
    expect(points[0].label).toBe('2026-05');
    expect(points[0].valueUsd).toBe(0);
    expect(points[5].label).toBe('2026-10');
    expect(points[5].valueUsd).toBe(160);
    expect(points[3].valueUsd).toBeGreaterThan(100);
    expect(points[3].valueUsd).toBeLessThan(160);
  });
});
