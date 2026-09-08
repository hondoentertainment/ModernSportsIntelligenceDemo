import { describe, expect, it } from 'vitest';
import {
  CAPITAL_GAINS_EXIT_DISCLOSURE,
  simulateCapitalGainsYearVsNext,
  simulateCapitalGainsYearVsNextForCard,
} from '../../lib/analytics/capitalGainsExit';
import { makeCard } from '../helpers';

describe('capitalGainsExit', () => {
  it('skips sold and zero-mark lots', () => {
    const summary = simulateCapitalGainsYearVsNext([
      makeCard({ id: 'sold', status: 'sold', currentValue: 900 }),
      makeCard({ id: 'zero', currentValue: 0, purchasePrice: 0 }),
    ]);
    expect(summary.holdings).toEqual([]);
    expect(summary.disclosure).toBe(CAPITAL_GAINS_EXIT_DISCLOSURE);
  });

  it('recommends waiting when a short-term lot would flip to long-term next year', () => {
    const asOf = new Date('2026-09-08T12:00:00.000Z');
    const card = makeCard({
      id: 'st',
      player: 'Short Lot',
      purchaseDate: '2026-01-01',
      purchasePrice: 100,
      currentValue: 400,
    });
    const row = simulateCapitalGainsYearVsNextForCard(card, asOf);
    expect(row?.thisYear.taxTreatment).toBe('Short Term');
    expect(row?.nextYear.taxTreatment).toBe('Long Term');
    expect(row?.recommendation).toBe('wait_until_next');
    expect(row?.nextYear.estimatedTax).toBeLessThan(row!.thisYear.estimatedTax);
    expect(row?.reason).toMatch(/long-term/i);
  });

  it('stays long-term on both sides for aged lots and totals the book', () => {
    const asOf = new Date('2026-09-08T12:00:00.000Z');
    const aged = makeCard({
      id: 'lt',
      player: 'Aged Lot',
      purchaseDate: '2024-01-01',
      purchasePrice: 200,
      currentValue: 500,
    });
    const summary = simulateCapitalGainsYearVsNext([aged], asOf);
    expect(summary.thisYearLabel).toBe('2026');
    expect(summary.nextYearLabel).toBe('2027');
    expect(summary.holdings[0].thisYear.taxTreatment).toBe('Long Term');
    expect(summary.holdings[0].nextYear.taxTreatment).toBe('Long Term');
    expect(summary.holdings[0].recommendation).toBe('neutral');
    expect(summary.thisYearNet).toBe(summary.holdings[0].thisYear.netProfit);
  });
});
