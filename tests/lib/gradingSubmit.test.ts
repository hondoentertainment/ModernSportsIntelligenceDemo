import { describe, expect, it } from 'vitest';
import type { CardInventory } from '../../types';
import { GRADE_LANES, decideGradingSubmit, listGradeSubmits } from '../../lib/analytics/gradingSubmit';

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
    purchasePrice: 40,
    purchaseDate: '2024-01-01',
    currentValue: 100,
    status: 'active',
    ...overrides,
  };
}

describe('gradingSubmit', () => {
  it('includes PSA and BGS demo lanes with fees, turnaround, and pop', () => {
    expect(GRADE_LANES.map((lane) => lane.company).sort()).toEqual(['BGS', 'PSA', 'PSA']);
    expect(GRADE_LANES.every((lane) => lane.feeUsd > 0 && lane.days > 0 && lane.pop > 0)).toBe(true);
  });

  it('submits the higher demo net and holds when fees eat the premium', () => {
    const submit = decideGradingSubmit(100);
    expect(submit?.submit).toBe(true);
    expect(submit?.laneId).toBe('psa-economy');
    expect(submit?.quotes.find((quote) => quote.id === 'psa-economy')).toMatchObject({ netUsd: 195, days: 45, pop: 1200 });
    expect(submit?.quotes.find((quote) => quote.id === 'bgs-standard')?.netUsd).toBe(120);
    expect(decideGradingSubmit(8)?.submit).toBe(false);
    expect(decideGradingSubmit(0)).toBeNull();
  });

  it('ranks raw cards and skips slabs', () => {
    const rows = listGradeSubmits([
      card({ id: 'slab', isGraded: true, currentValue: 500 }),
      card({ id: 'low', player: 'Low', currentValue: 8 }),
      card({ id: 'high', player: 'High', currentValue: 100 }),
    ]);
    expect(rows.map((row) => row.cardId)).toEqual(['high', 'low']);
    expect(rows[0].summary).toMatch(/Submit PSA Economy/);
    expect(rows[1].summary).toMatch(/Hold raw/);
  });
});
