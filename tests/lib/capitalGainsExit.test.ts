import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CAPITAL_GAINS_EXIT_DISCLOSURE,
  simulateCapitalGainsYearVsNext,
  simulateCapitalGainsYearVsNextForCard,
} from '../../lib/analytics/capitalGainsExit';
import { FiscalService, type ExitSimulationResult } from '../../lib/utils/FiscalService';
import { makeCard } from '../helpers';

function exit(overrides: Partial<ExitSimulationResult> = {}): ExitSimulationResult {
  return {
    targetPrice: 200,
    saleFees: 26,
    totalBasis: 100,
    grossProfit: 74,
    estimatedTax: 20,
    netProfit: 54,
    roi: 54,
    taxTreatment: 'Short Term',
    daysToLongTerm: 100,
    venueEstimates: [],
    ...overrides,
  };
}

describe('capitalGainsExit', () => {
  it('skips sold and zero-mark lots', () => {
    const summary = simulateCapitalGainsYearVsNext([
      makeCard({ id: 'sold', status: 'sold', currentValue: 900 }),
      makeCard({ id: 'zero', currentValue: 0, purchasePrice: 0 }),
    ]);
    expect(summary.holdings).toEqual([]);
    expect(summary.disclosure).toBe(CAPITAL_GAINS_EXIT_DISCLOSURE);
    expect(simulateCapitalGainsYearVsNextForCard(makeCard({ id: 'sold', status: 'sold', currentValue: 900 }))).toBeNull();
  });

  it('uses purchase price when the mark is missing', () => {
    const asOf = new Date('2026-09-08T12:00:00.000Z');
    const row = simulateCapitalGainsYearVsNextForCard(
      makeCard({ id: 'basis', player: 'Basis Lot', currentValue: 0, purchasePrice: 250, purchaseDate: '2024-01-01' }),
      asOf,
    );
    expect(row?.targetPrice).toBe(250);
    expect(row?.recommendation).toBe('neutral');
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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('recommends selling this year when next-year net is worse, and waiting when next year wins without an ST/LT flip', () => {
    const card = makeCard({ id: 'spy', player: 'Spy Lot', currentValue: 400 });
    const spy = vi.spyOn(FiscalService, 'simulateExit');
    spy
      .mockReturnValueOnce(exit({ taxTreatment: 'Long Term', netProfit: 200, estimatedTax: 10 }))
      .mockReturnValueOnce(exit({ taxTreatment: 'Long Term', netProfit: 100, estimatedTax: 10 }));
    const sellNow = simulateCapitalGainsYearVsNextForCard(card);
    expect(sellNow?.recommendation).toBe('sell_this_year');
    expect(sellNow?.reason).toMatch(/keeps more/i);

    spy
      .mockReturnValueOnce(exit({ taxTreatment: 'Short Term', netProfit: 80, estimatedTax: 40 }))
      .mockReturnValueOnce(exit({ taxTreatment: 'Short Term', netProfit: 140, estimatedTax: 40 }));
    const waitSame = simulateCapitalGainsYearVsNextForCard(card);
    expect(waitSame?.recommendation).toBe('wait_until_next');
    expect(waitSame?.reason).toMatch(/next-year net is higher/i);
  });
});
