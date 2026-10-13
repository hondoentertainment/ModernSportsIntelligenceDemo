import { describe, expect, it } from 'vitest';
import type { MarketComp } from '../../types';
import {
  DUPLICATE_WATCH_SHARE,
  ERA_NOTE_SHARE,
  PLAYER_NOTE_SHARE,
  PLAYER_WATCH_SHARE,
  PORTFOLIO_INSIGHTS_DISCLOSURE,
  buildPortfolioInsights,
} from '../../lib/analytics/portfolioInsights';
import { makeCard } from '../helpers';

const NOW = Date.parse('2026-10-13T00:00:00Z');

function comp(price: number, soldAt: string): MarketComp {
  return { title: `sold ${price}`, price, condition: 'raw', soldAt };
}

describe('buildPortfolioInsights', () => {
  it('returns an empty book without inventing marks', () => {
    const report = buildPortfolioInsights([]);
    expect(report.emptyReason).toMatch(/no cards/i);
    expect(report.totals.mark).toBe(0);
    expect(report.totals.unrealizedPct).toBe(0);
    expect(report.insights).toEqual([]);
    expect(report.disclosure).toBe(PORTFOLIO_INSIGHTS_DISCLOSURE);
    expect(report.disclosure).toMatch(/not a live Sports Card Investor/i);
  });

  it('prices the book from all-in cost and ignores negative or non-finite money', () => {
    const report = buildPortfolioInsights(
      [
        makeCard({
          id: 'fee',
          player: 'Alpha',
          purchasePrice: 100,
          gradingFees: 25,
          shippingFees: 10,
          insuranceFees: 5,
          currentValue: 200,
          year: 2023,
          set: 'Chrome',
        }),
        makeCard({
          id: 'bad-money',
          player: 'Beta',
          purchasePrice: Number.NaN,
          gradingFees: -4,
          shippingFees: undefined,
          insuranceFees: Number.POSITIVE_INFINITY,
          currentValue: 40,
          year: 2022,
          set: 'Heritage',
        }),
      ],
      { nowMs: NOW },
    );

    expect(report.totals.purchaseCost).toBe(100);
    expect(report.totals.feeDrag).toBe(40);
    expect(report.totals.allInCost).toBe(140);
    expect(report.totals.mark).toBe(240);
    expect(report.totals.pricedMark).toBe(200);
    expect(report.totals.unpricedCount).toBe(1);
    expect(report.totals.unrealized).toBe(60);
    expect(report.totals.unrealizedPct).toBe(42.9);
    expect(report.totals.compBackedCount).toBe(0);
    expect(report.gainers.map((row) => row.cardId)).toEqual(['fee']);
    expect(report.losers).toEqual([]);
    expect(report.insights[0]).toMatchObject({ id: 'unrealized', tone: 'positive' });
    expect(report.insights[0].detail).toMatch(/\+\$60/);
  });

  it('uses a fresh sold-comp median and a stale thin tape instead of the stored mark', () => {
    const report = buildPortfolioInsights(
      [
        makeCard({
          id: 'fresh',
          player: 'Fresh',
          purchasePrice: 50,
          currentValue: 50,
          salesData: [comp(180, '2026-09-01'), comp(200, '2026-08-01'), comp(220, '2026-07-01')],
        }),
        makeCard({
          id: 'stale',
          player: 'Stale',
          purchasePrice: 100,
          currentValue: 200,
          salesData: [comp(80, '2020-01-01')],
        }),
      ],
      { nowMs: NOW },
    );

    expect(report.totals.compBackedCount).toBe(2);
    expect(report.totals.mark).toBe(280);
    const fresh = report.gainers.find((row) => row.cardId === 'fresh');
    const stale = report.losers.find((row) => row.cardId === 'stale');
    expect(fresh?.mark).toBe(200);
    expect(stale?.mark).toBe(80);
    expect(stale?.gain).toBe(-20);
  });

  it('keeps sold cards out of the mark and realizes only priced sales', () => {
    const report = buildPortfolioInsights([
      makeCard({
        id: 'sold-win',
        status: 'sold',
        purchasePrice: 40,
        gradingFees: 10,
        salePrice: 90,
        currentValue: 500,
      }),
      makeCard({
        id: 'sold-loss',
        status: 'sold',
        purchasePrice: 80,
        salePrice: 20,
        currentValue: 80,
      }),
      makeCard({
        id: 'sold-blank',
        status: 'sold',
        purchasePrice: 15,
        salePrice: 0,
        currentValue: 15,
      }),
      makeCard({
        id: 'sold-negative',
        status: 'sold',
        purchasePrice: 15,
        salePrice: -5,
        currentValue: 15,
      }),
    ]);

    expect(report.totals.activeCount).toBe(0);
    expect(report.totals.mark).toBe(0);
    expect(report.totals.soldCount).toBe(4);
    expect(report.totals.soldUnpricedCount).toBe(2);
    expect(report.totals.realized).toBe(-20);
    expect(report.slabMix).toEqual([]);
    const realized = report.insights.find((insight) => insight.id === 'realized');
    expect(realized?.tone).toBe('watch');
    expect(realized?.detail).toMatch(/no sale price/i);
    expect(realized?.detail).toMatch(/2 sold cards have no sale price/);
  });

  it('pluralizes priced sales and a single unpriced sale', () => {
    const priced = buildPortfolioInsights([
      makeCard({ id: 's1', status: 'sold', purchasePrice: 10, salePrice: 30, currentValue: 30 }),
      makeCard({ id: 's2', status: 'sold', purchasePrice: 10, salePrice: 5, currentValue: 5 }),
    ]);
    expect(priced.insights.find((insight) => insight.id === 'realized')?.detail).toMatch(/2 sold cards/);

    const oneBlank = buildPortfolioInsights([
      makeCard({ id: 'blank', status: 'sold', purchasePrice: 10, salePrice: 0, currentValue: 10 }),
    ]);
    expect(oneBlank.insights.find((insight) => insight.id === 'realized')?.detail).toMatch(/1 sold card has no sale price/);
  });

  it('orders duplicate stacks that tie on extra mark by copies, then name', () => {
    const stack = (player: string, copies: number, extraMark: number) => {
      const rows = [
        makeCard({
          id: `${player}-keeper`,
          player,
          cardNumber: '1',
          purchasePrice: 10,
          currentValue: 100,
        }),
      ];
      for (let index = 0; index < copies - 1; index += 1) {
        rows.push(
          makeCard({
            id: `${player}-extra-${index}`,
            player,
            cardNumber: '1',
            purchasePrice: 10,
            currentValue: extraMark / (copies - 1),
          }),
        );
      }
      return rows;
    };

    const report = buildPortfolioInsights([
      ...stack('Moe', 3, 10),
      ...stack('Ann', 2, 10),
      ...stack('Bev', 2, 10),
    ], { limit: 5 });

    expect(report.duplicates.map((row) => row.player)).toEqual(['Moe', 'Ann', 'Bev']);
  });

  it('orders equal losers of the same player by card id', () => {
    const report = buildPortfolioInsights([
      makeCard({ id: 'b', player: 'Same', cardNumber: '1', purchasePrice: 30, currentValue: 10 }),
      makeCard({ id: 'a', player: 'Same', cardNumber: '2', purchasePrice: 30, currentValue: 10 }),
    ]);
    expect(report.losers.map((row) => row.cardId)).toEqual(['a', 'b']);
  });

  it('names a single priced sale and a flat realized result', () => {
    const win = buildPortfolioInsights([
      makeCard({ id: 'one', status: 'sold', purchasePrice: 10, salePrice: 25, currentValue: 25 }),
    ]);
    expect(win.insights.find((insight) => insight.id === 'realized')).toMatchObject({ tone: 'positive' });
    expect(win.insights.find((insight) => insight.id === 'realized')?.detail).toMatch(/1 sold card\./);
    expect(win.insights.find((insight) => insight.id === 'realized')?.detail).not.toMatch(/no sale price/i);

    const flat = buildPortfolioInsights([
      makeCard({ id: 'flat-sale', status: 'sold', purchasePrice: 30, salePrice: 30, currentValue: 30 }),
    ]);
    expect(flat.totals.realized).toBe(0);
    expect(flat.insights.find((insight) => insight.id === 'realized')?.tone).toBe('info');
  });

  it('stacks duplicates by identity, prefers the graded keeper on a mark tie, and sums every extra', () => {
    const report = buildPortfolioInsights(
      [
        makeCard({
          id: 'b',
          player: ' julio  rodriguez ',
          year: 2019,
          manufacturer: 'Bowman',
          set: 'Paper',
          cardNumber: 'BCP-33',
          isGraded: false,
          purchasePrice: 20,
          currentValue: 40,
        }),
        makeCard({
          id: 'a',
          player: 'Julio Rodriguez',
          year: 2019,
          manufacturer: ' bowman ',
          set: 'paper',
          cardNumber: 'bcp-33',
          isGraded: true,
          gradingCompany: 'PSA',
          grade: '10',
          purchasePrice: 20,
          currentValue: 40,
        }),
        makeCard({
          id: 'c',
          player: 'Julio Rodriguez',
          year: 2019,
          manufacturer: 'Bowman',
          set: 'Paper',
          cardNumber: 'BCP-33',
          isGraded: true,
          gradingCompany: 'SGC',
          purchasePrice: 20,
          currentValue: 10,
        }),
        makeCard({
          id: 'other-number',
          player: 'Julio Rodriguez',
          year: 2019,
          manufacturer: 'Bowman',
          set: 'Paper',
          cardNumber: '1',
          purchasePrice: 20,
          currentValue: 20,
        }),
        makeCard({
          id: 'blank-number-1',
          player: 'No Number',
          year: 2020,
          manufacturer: 'Topps',
          set: 'Chrome',
          cardNumber: '  ',
          purchasePrice: 5,
          currentValue: 8,
        }),
        makeCard({
          id: 'blank-number-2',
          player: 'No Number',
          year: 2020,
          manufacturer: 'Topps',
          set: 'Chrome',
          cardNumber: '',
          isGraded: true,
          grade: '9',
          purchasePrice: 5,
          currentValue: 8,
        }),
      ],
      { limit: 1 },
    );

    expect(report.duplicateStackCount).toBe(2);
    expect(report.duplicateExtraCopies).toBe(3);
    expect(report.duplicateExtraMark).toBe(58);
    expect(report.duplicates).toHaveLength(1);
    expect(report.duplicates[0]).toMatchObject({
      player: 'Julio Rodriguez',
      copies: 3,
      extraCopies: 2,
      extraMark: 50,
    });
    expect(report.duplicates[0].grades).toEqual(['PSA 10', 'Raw', 'SGC']);
    expect(report.duplicates[0].label).toMatch(/no number|BCP-33|bcp-33/i);
    expect(report.insights.find((insight) => insight.id === 'duplicates')?.title).toMatch(/2 duplicate stacks/);
    expect(report.insights.find((insight) => insight.id === 'duplicates')?.detail).toMatch(/3 extra copies/);
  });

  it('labels a graded duplicate that has no company and no grade', () => {
    const report = buildPortfolioInsights([
      makeCard({
        id: 'g1',
        player: 'Plain',
        cardNumber: '9',
        isGraded: true,
        gradingCompany: undefined,
        grade: ' ',
        purchasePrice: 10,
        currentValue: 12,
      }),
      makeCard({
        id: 'g2',
        player: 'Plain',
        cardNumber: '9',
        isGraded: true,
        gradingCompany: '  ',
        grade: undefined,
        purchasePrice: 10,
        currentValue: 11,
      }),
    ]);
    expect(report.duplicates[0].grades).toEqual(['Graded']);
    expect(report.slabMix.find((slice) => slice.key === 'graded')?.label).toBe('Graded');
  });

  it('uses singular duplicate copy language and an info tone under the watch share', () => {
    const report = buildPortfolioInsights([
      makeCard({ id: 'k', player: 'Solo', purchasePrice: 10, currentValue: 90, set: 'Base' }),
      makeCard({ id: 'e', player: 'Solo', purchasePrice: 10, currentValue: 10, set: 'Base' }),
    ]);
    expect(report.duplicateExtraMark).toBe(10);
    expect(shareOf(report.duplicateExtraMark, report.totals.mark)).toBeLessThan(DUPLICATE_WATCH_SHARE);
    const note = report.insights.find((insight) => insight.id === 'duplicates');
    expect(note?.tone).toBe('info');
    expect(note?.title).toBe('1 duplicate stack');
    expect(note?.detail).toMatch(/1 extra copy/);
  });

  it('flags a duplicate stack that ties up at least the watch share of the mark', () => {
    const report = buildPortfolioInsights([
      makeCard({ id: 'k', player: 'Pair', purchasePrice: 10, currentValue: 50, set: 'Base' }),
      makeCard({ id: 'e', player: 'Pair', purchasePrice: 10, currentValue: 50, set: 'Base' }),
    ]);
    expect(shareOf(report.duplicateExtraMark, report.totals.mark)).toBeGreaterThanOrEqual(DUPLICATE_WATCH_SHARE);
    expect(report.insights.find((insight) => insight.id === 'duplicates')?.tone).toBe('watch');
  });

  it('splits slab, era, and print-run mix and caps the insight list', () => {
    const report = buildPortfolioInsights([
      makeCard({
        id: 'slab',
        player: 'Julio Rodriguez',
        year: 2023,
        set: 'Silver /499',
        isGraded: true,
        gradingCompany: 'PSA',
        grade: '10',
        purchasePrice: 20,
        currentValue: 100,
      }),
      makeCard({
        id: 'raw-dup',
        player: 'Julio Rodriguez',
        year: 2023,
        set: 'Silver /499',
        cardNumber: '1',
        purchasePrice: 20,
        currentValue: 30,
      }),
      makeCard({
        id: 'other',
        player: 'Other',
        year: 2023,
        set: 'Paper',
        purchasePrice: 10,
        currentValue: 20,
      }),
      makeCard({
        id: 'free',
        player: 'Unpriced',
        year: 1979,
        set: 'Vintage /10',
        purchasePrice: 0,
        currentValue: 5,
      }),
      makeCard({
        id: 'sold',
        status: 'sold',
        player: 'Gone',
        purchasePrice: 10,
        salePrice: 40,
        currentValue: 40,
      }),
    ]);

    expect(report.insights.map((insight) => insight.id)).toEqual(['unrealized', 'duplicates', 'player', 'graded']);
    expect(report.slabMix.map((slice) => slice.label)).toEqual(['PSA', 'Raw']);
    expect(report.eraMix[0].label).toBe('Modern (2016+)');
    expect(report.printRunMix.some((slice) => slice.label === 'Numbered /100–/499')).toBe(true);
    expect(report.printRunMix.some((slice) => slice.label === 'Unnumbered')).toBe(true);
    expect(report.totals.unpricedCount).toBe(1);
    expect(report.totals.realized).toBe(30);
    expect(report.insights.find((insight) => insight.id === 'player')?.tone).toBe('watch');
    expect(report.insights.find((insight) => insight.id === 'graded')?.detail).toMatch(/1 card/);
  });

  it('covers the remaining era and print-run buckets plus a note-level player share', () => {
    const report = buildPortfolioInsights([
      makeCard({ id: 'v', player: 'Lead', year: 1960, set: 'Set /1', purchasePrice: 10, currentValue: 30, isGraded: true }),
      makeCard({ id: 'j', player: 'Other', year: 1990, set: 'Set /11', purchasePrice: 10, currentValue: 20 }),
      makeCard({ id: 'm', player: 'Third', year: 2010, set: 'Set /99', purchasePrice: 10, currentValue: 20 }),
      makeCard({ id: 'n', player: 'Fourth', year: 2016, set: 'Set /100', purchasePrice: 10, currentValue: 15 }),
      makeCard({ id: 'h', player: 'Fifth', year: 0, set: 'Set /500', purchasePrice: 10, currentValue: 15 }),
      makeCard({ id: 'z', player: 'Sixth', year: Number.NaN, set: 'Set /0', purchasePrice: 10, currentValue: 0 }),
      makeCard({
        id: 'noset',
        player: 'NoSet',
        year: 2016,
        set: undefined as unknown as string,
        cardNumber: undefined as unknown as string,
        purchasePrice: 10,
        currentValue: 1,
      }),
    ]);

    expect(report.eraMix.map((slice) => slice.key)).toEqual(
      expect.arrayContaining(['vintage', 'junk', 'mid', 'modern', 'unknown']),
    );
    expect(report.printRunMix.map((slice) => slice.key)).toEqual(
      expect.arrayContaining(['short', 'low', 'mid', 'high', 'open']),
    );
    expect(report.slabMix.find((slice) => slice.key === 'graded')?.label).toBe('Graded');
    const player = report.insights.find((insight) => insight.id === 'player');
    expect(player?.tone).toBe('info');
    expect(report.totals.mark).toBeGreaterThan(0);
    const leadShare = report.insights.find((insight) => insight.id === 'player');
    expect(leadShare?.detail).toMatch(/Lead/);
    expect(PLAYER_NOTE_SHARE).toBe(25);
    expect(PLAYER_WATCH_SHARE).toBe(35);
  });

  it('skips era and player notes when the book is a single small holding or evenly spread', () => {
    const one = buildPortfolioInsights([
      makeCard({
        id: 'only',
        player: 'Only',
        year: 2024,
        set: 'Silver /499',
        isGraded: true,
        gradingCompany: 'BGS',
        purchasePrice: 10,
        currentValue: 10,
        status: undefined,
      }),
    ]);
    expect(one.totals.unrealized).toBe(0);
    expect(one.insights.find((insight) => insight.id === 'unrealized')?.title).toMatch(/matches all-in cost/i);
    expect(one.insights.find((insight) => insight.id === 'era')).toBeUndefined();
    expect(one.insights.find((insight) => insight.id === 'graded')).toBeUndefined();
    expect(one.insights.find((insight) => insight.id === 'numbered')).toBeDefined();
    expect(one.gainers).toEqual([]);
    expect(one.losers).toEqual([]);
    expect(one.slabMix[0].label).toBe('BGS');

    const spread = buildPortfolioInsights(
      ['A', 'B', 'C', 'D', 'E'].map((player, index) =>
        makeCard({
          id: player,
          player,
          year: index % 2 === 0 ? 2020 : 1995,
          set: 'Paper',
          purchasePrice: 10,
          currentValue: 20,
        }),
      ),
    );
    expect(spread.insights.find((insight) => insight.id === 'player')).toBeUndefined();
    expect(spread.insights.find((insight) => insight.id === 'numbered')).toBeUndefined();
    expect(spread.insights.find((insight) => insight.id === 'era')).toBeUndefined();
    expect(Math.max(...spread.eraMix.map((slice) => slice.sharePct))).toBeLessThan(ERA_NOTE_SHARE);
    expect(spread.printRunMix.find((slice) => slice.key === 'open')?.sharePct).toBe(100);
  });

  it('calls out a book with marks and no cost, and a book with neither', () => {
    const noCost = buildPortfolioInsights([
      makeCard({ id: 'free', player: 'Free', purchasePrice: 0, currentValue: 40, set: 'Paper' }),
      makeCard({
        id: 'also',
        player: 'Also',
        purchasePrice: 0,
        currentValue: 10,
        set: 'Paper',
        status: 'consignment',
      }),
    ]);
    expect(noCost.totals.allInCost).toBe(0);
    expect(noCost.totals.unpricedCount).toBe(2);
    expect(noCost.totals.consignmentCount).toBe(1);
    expect(noCost.totals.unrealizedPct).toBe(0);
    expect(noCost.insights.map((insight) => insight.id)).toContain('no-cost');
    expect(noCost.insights.find((insight) => insight.id === 'missing-cost')).toBeUndefined();

    const blank = buildPortfolioInsights([
      makeCard({ id: 'zero', player: '   ', purchasePrice: 0, currentValue: 0, set: 'Open' }),
    ]);
    expect(blank.totals.mark).toBe(0);
    expect(blank.insights).toEqual([]);
    expect(blank.emptyReason).toBeNull();
  });

  it('mentions missing cost only when the rest of the book has a basis', () => {
    const report = buildPortfolioInsights([
      makeCard({ id: 'priced', player: 'Priced', purchasePrice: 50, currentValue: 40, set: 'Base', year: 2005 }),
      makeCard({ id: 'open', player: 'Open', purchasePrice: 0, currentValue: 15, set: 'Base', year: 2005 }),
    ]);
    expect(report.totals.unrealized).toBe(-10);
    expect(report.insights.find((insight) => insight.id === 'unrealized')?.tone).toBe('watch');
    expect(report.insights.find((insight) => insight.id === 'missing-cost')?.detail).toMatch(/1 active card/);
    expect(report.losers[0].cardId).toBe('priced');
  });

  it('pluralizes missing-cost copy and orders tied losers by name', () => {
    const report = buildPortfolioInsights([
      makeCard({ id: 'b', player: 'Beta', purchasePrice: 30, currentValue: 10, set: 'Base' }),
      makeCard({ id: 'a', player: 'Alpha', purchasePrice: 30, currentValue: 10, set: 'Base' }),
      makeCard({ id: 'u1', player: 'U1', purchasePrice: 0, currentValue: 1, set: 'Base' }),
      makeCard({ id: 'u2', player: 'U2', purchasePrice: 0, currentValue: 1, set: 'Base' }),
    ]);
    expect(report.losers.map((row) => row.player)).toEqual(['Alpha', 'Beta']);
    expect(report.insights.find((insight) => insight.id === 'missing-cost')?.detail).toMatch(/2 active cards/);
  });

  it('orders equal gainers by player then id and keeps consignment in the active book', () => {
    const report = buildPortfolioInsights([
      makeCard({ id: 'b', player: 'Beta', purchasePrice: 10, currentValue: 20, status: 'consignment' }),
      makeCard({ id: 'a2', player: 'Alpha', purchasePrice: 10, currentValue: 20 }),
      makeCard({ id: 'a1', player: 'Alpha', purchasePrice: 10, currentValue: 20, cardNumber: '2' }),
    ]);
    expect(report.totals.consignmentCount).toBe(1);
    expect(report.totals.activeCount).toBe(3);
    expect(report.gainers.map((row) => row.cardId)).toEqual(['a1', 'a2', 'b']);
  });

  it('notes a modern-heavy book once other higher-priority notes are absent', () => {
    const report = buildPortfolioInsights([
      makeCard({ id: 'a', player: 'A', year: 2021, set: 'Paper', purchasePrice: 10, currentValue: 12 }),
      makeCard({ id: 'b', player: 'B', year: 2022, set: 'Paper', purchasePrice: 10, currentValue: 11 }),
      makeCard({ id: 'c', player: 'C', year: 2023, set: 'Paper', purchasePrice: 10, currentValue: 11 }),
      makeCard({ id: 'd', player: 'D', year: 2024, set: 'Paper', purchasePrice: 10, currentValue: 11 }),
      makeCard({ id: 'e', player: 'E', year: 1999, set: 'Paper', purchasePrice: 10, currentValue: 5 }),
    ]);
    expect(report.insights.find((insight) => insight.id === 'era')?.detail).toMatch(/Modern \(2016\+\)/);
    expect(report.insights.find((insight) => insight.id === 'player')).toBeUndefined();
  });
});

function shareOf(part: number, total: number): number {
  return total > 0 ? (part / total) * 100 : 0;
}
