import { describe, expect, it } from 'vitest';
import {
  DEAL_FINDER_LITE_DISCLOSURE,
  GREAT_DEAL_DISCOUNT_PCT,
  findDealCandidates,
  scoreDealCandidate,
} from '../../lib/analytics/dealFinderLite';
import { makeCard } from '../helpers';
import type { MarketComp, TargetWatchlist } from '../../types';

function target(overrides: Partial<TargetWatchlist> = {}): TargetWatchlist {
  return {
    id: 't1',
    player: 'Mike Trout',
    cardDescription: '2011 Topps Update',
    priority: 'High',
    targetPrice: 500,
    currentMarketPrice: 400,
    sport: 'Baseball',
    league: 'MLB',
    status: 'active',
    createdAt: '2026-01-01',
    ...overrides,
  };
}

function comps(prices: number[]): MarketComp[] {
  return prices.map((price, index) => ({
    title: `sold ${index}`,
    price,
    condition: 'PSA 9',
    soldAt: `2026-08-0${index + 1}`,
  }));
}

describe('dealFinderLite', () => {
  it('returns null when ask is missing or not below either threshold', () => {
    expect(
      scoreDealCandidate({
        id: 'x',
        kind: 'target',
        player: 'A',
        detail: 'd',
        askPrice: 0,
        consensusMark: 100,
        breakEvenPrice: 90,
        thinTape: false,
      }),
    ).toBeNull();
    expect(
      scoreDealCandidate({
        id: 'fair',
        kind: 'target',
        player: 'A',
        detail: 'd',
        askPrice: 100,
        consensusMark: 100,
        breakEvenPrice: 80,
        thinTape: false,
      }),
    ).toBeNull();
  });

  it('flags a great deal at the disclosed discount threshold', () => {
    const row = scoreDealCandidate({
      id: 'g',
      kind: 'watchlist',
      player: 'Trout',
      detail: 'Update',
      askPrice: 85,
      consensusMark: 100,
      breakEvenPrice: 110,
      thinTape: false,
    });
    expect(row?.greatDeal).toBe(true);
    expect(row?.discountPct).toBe(15);
    expect(row?.belowConsensus).toBe(true);
    expect(GREAT_DEAL_DISCOUNT_PCT).toBe(15);
  });

  it('flags below fee-aware break-even even without a 15% consensus gap', () => {
    const row = scoreDealCandidate({
      id: 'be',
      kind: 'holding-scan',
      player: 'Judge',
      detail: 'Chrome',
      askPrice: 95,
      consensusMark: 100,
      breakEvenPrice: 120,
      thinTape: true,
    });
    expect(row?.greatDeal).toBe(true);
    expect(row?.belowBreakEven).toBe(true);
    expect(row?.rationale).toMatch(/thin/i);
  });

  it('labels a sub-threshold consensus discount without calling it a great deal', () => {
    const row = scoreDealCandidate({
      id: 'small',
      kind: 'target',
      player: 'A',
      detail: 'd',
      askPrice: 95,
      consensusMark: 100,
      breakEvenPrice: 80,
      thinTape: false,
    });
    expect(row?.greatDeal).toBe(false);
    expect(row?.belowConsensus).toBe(true);
    expect(row?.rationale).toMatch(/short of/i);
  });

  it('matches watchlist targets to holdings and ignores expired rows', () => {
    const holding = makeCard({
      id: 'h1',
      player: 'Mike Trout',
      year: 2011,
      set: 'Update',
      currentValue: 500,
      purchasePrice: 200,
      salesData: comps([480, 500, 520]),
    });
    const report = findDealCandidates(
      [holding],
      [
        target({ currentMarketPrice: 400 }),
        target({ id: 'expired', status: 'expired', currentMarketPrice: 10 }),
      ],
    );
    expect(report.disclosure).toBe(DEAL_FINDER_LITE_DISCLOSURE);
    expect(report.greatDeals[0].kind).toBe('watchlist');
    expect(report.greatDeals[0].player).toBe('Mike Trout');
    expect(report.emptyReason).toBeNull();
  });

  it('uses target price as a thin consensus when no holding matches', () => {
    const report = findDealCandidates(
      [makeCard({ player: 'Someone Else', currentValue: 50 })],
      [target({ player: 'Wander Franco', cardDescription: 'Bowman', targetPrice: 200, currentMarketPrice: 120 })],
    );
    expect(report.candidates[0].kind).toBe('target');
    expect(report.candidates[0].thinTape).toBe(true);
  });

  it('scans holdings whose stored mark sits below sold-comp consensus', () => {
    const report = findDealCandidates([
      makeCard({
        id: 'scan',
        player: 'Acuña',
        currentValue: 200,
        purchasePrice: 150,
        salesData: comps([300, 310, 320]),
      }),
    ]);
    expect(report.candidates.some((row) => row.kind === 'holding-scan')).toBe(true);
  });

  it('flags a break-even-only deal when consensus is missing', () => {
    const row = scoreDealCandidate({
      id: 'be-only',
      kind: 'target',
      player: 'A',
      detail: 'd',
      askPrice: 80,
      consensusMark: null,
      breakEvenPrice: 100,
      thinTape: false,
    });
    expect(row?.greatDeal).toBe(true);
    expect(row?.discountPct).toBeNull();
    expect(row?.rationale).toMatch(/break-even/i);
  });

  it('prefers a year/set match and still scans sold rows as null', () => {
    const report = findDealCandidates(
      [
        makeCard({ id: 'old', player: 'Mike Trout', year: 2009, set: 'Chrome', currentValue: 900, purchasePrice: 100 }),
        makeCard({
          id: 'match',
          player: 'Mike Trout',
          year: 2011,
          set: 'Update',
          currentValue: 500,
          purchasePrice: 200,
          salesData: comps([480, 500, 520]),
        }),
        makeCard({
          id: 'sold-scan',
          status: 'sold',
          player: 'Sold Guy',
          currentValue: 10,
          salesData: comps([400, 410, 420]),
        }),
      ],
      [target({ currentMarketPrice: 300, cardDescription: '2011 Update Trout' })],
      { greatDealsOnly: false },
    );
    expect(report.candidates[0].kind).toBe('watchlist');
    expect(report.candidates.some((row) => row.id === 'scan-sold-scan')).toBe(false);
  });

  it('skips targets without an ask and holdings without a stored mark', () => {
    const report = findDealCandidates(
      [makeCard({ id: 'zero', currentValue: 0, purchasePrice: 0, salesData: comps([200, 210, 220]) })],
      [target({ currentMarketPrice: undefined })],
    );
    expect(report.candidates).toEqual([]);
  });

  it('sorts multiple candidates by discount', () => {
    const report = findDealCandidates(
      [],
      [
        target({ id: 't-a', player: 'A', currentMarketPrice: 80, targetPrice: 100 }),
        target({ id: 't-b', player: 'B', currentMarketPrice: 50, targetPrice: 100 }),
      ],
      { greatDealsOnly: false },
    );
    expect(report.candidates).toHaveLength(2);
    expect(report.candidates[0].discountPct).toBeGreaterThan(report.candidates[1].discountPct ?? 0);
  });

  it('keeps empty states honest', () => {
    expect(findDealCandidates([], []).emptyReason).toMatch(/add holdings or watchlist/i);
    expect(findDealCandidates([makeCard({ currentValue: 100 })], []).emptyReason).toMatch(/no watchlist/i);
    const filtered = findDealCandidates(
      [makeCard({ currentValue: 100 })],
      [target({ player: 'No Match', currentMarketPrice: 500, targetPrice: 500 })],
      { greatDealsOnly: true },
    );
    expect(filtered.candidates).toEqual([]);
  });
});
