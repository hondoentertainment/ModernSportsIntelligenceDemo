import { describe, expect, it } from 'vitest';
import {
  PSA10_MULTIPLIER,
  PSA9_MULTIPLIER,
  PSA_ECONOMY_FEE,
  estimateGradingRoiLite,
  extractGradeCompMedian,
  listGradingRoiLite,
} from '../../lib/analytics/gradingRoiLite';
import type { CardInventory, MarketComp } from '../../types';

const rawCard: CardInventory = {
  id: 'raw-1',
  player: 'Luka Doncic',
  year: 2018,
  manufacturer: 'Prizm',
  cardNumber: '280',
  set: 'Prizm',
  sport: 'Basketball',
  league: 'NBA',
  isAutographed: false,
  condition: 'Mint',
  isGraded: false,
  purchasePrice: 400,
  purchaseDate: '2024-01-01',
  currentValue: 500,
  status: 'active',
};

describe('gradingRoiLite', () => {
  it('returns null for sold, graded, or valueless cards', () => {
    expect(estimateGradingRoiLite({ ...rawCard, status: 'sold' })).toBeNull();
    expect(estimateGradingRoiLite({ ...rawCard, isGraded: true, gradingCompany: 'PSA', grade: '9' })).toBeNull();
    expect(estimateGradingRoiLite({ ...rawCard, currentValue: 0, purchasePrice: 0 })).toBeNull();
  });

  it('uses disclosed multipliers when no PSA comps exist', () => {
    const row = estimateGradingRoiLite(rawCard);
    expect(row?.source).toBe('simulated');
    expect(row?.psa9Estimate).toBe(500 * PSA9_MULTIPLIER);
    expect(row?.psa10Estimate).toBe(500 * PSA10_MULTIPLIER);
    expect(row?.gradingFee).toBe(PSA_ECONOMY_FEE);
    expect(row?.advisoryOnly).toBe(true);
    expect(row?.rationale).toMatch(/Not live PSA/);
  });

  it('prefers sold-comp medians when titles mention PSA 9/10', () => {
    const sales: MarketComp[] = [
      { title: '2018 Prizm Luka PSA 9', price: 800, soldAt: '2026-01-01', condition: 'PSA 9' },
      { title: '2018 Prizm Luka PSA 9', price: 900, soldAt: '2026-02-01', condition: 'PSA 9' },
      { title: '2018 Prizm Luka PSA 10', price: 2000, totalPrice: 2100, soldAt: '2026-03-01', condition: 'PSA 10' },
    ];
    expect(extractGradeCompMedian(sales, 9)).toBe(850);
    expect(extractGradeCompMedian(sales, 10)).toBe(2100);
    expect(extractGradeCompMedian(undefined, 10)).toBeNull();
    expect(extractGradeCompMedian([{ title: 'raw', price: 10, soldAt: '2026-01-01', condition: 'Raw' }], 9)).toBeNull();
    expect(extractGradeCompMedian([], 10)).toBeNull();
    expect(
      extractGradeCompMedian(
        [{ title: undefined as unknown as string, price: -5, totalPrice: -1, soldAt: '2026-01-01', condition: 'x' }],
        10,
      ),
    ).toBeNull();

    const row = estimateGradingRoiLite({ ...rawCard, salesData: sales });
    expect(row?.source).toBe('comps');
    expect(row?.psa9Estimate).toBe(850);
    expect(row?.psa10Estimate).toBe(2100);
    expect(row?.recommendation).toBe('Submit');
  });

  it('recommends hold when PSA 10 ROI is thin', () => {
    const row = estimateGradingRoiLite({
      ...rawCard,
      currentValue: 1000,
      salesData: [{ title: 'Luka PSA 10', price: 1100, soldAt: '2026-01-01', condition: 'PSA 10' }],
    });
    expect(row?.recommendation).toBe('Hold Raw');
    expect(row?.source).toBe('comps');
  });

  it('uses the zero-cost fallback when fee cancels the raw mark', () => {
    const row = estimateGradingRoiLite(rawCard, -500);
    expect(row?.roi9).toBe(0);
    expect(row?.roi10).toBe(0);
  });

  it('lists top raw ROI cards and skips graded inventory', () => {
    const list = listGradingRoiLite([
      rawCard,
      { ...rawCard, id: 'g1', isGraded: true, grade: '10', gradingCompany: 'PSA' },
      { ...rawCard, id: 'raw-2', player: 'SGA', currentValue: 200 },
    ], 1);
    expect(list).toHaveLength(1);
  });
});
