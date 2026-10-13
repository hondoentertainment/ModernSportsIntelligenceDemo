import { describe, expect, it } from 'vitest';
import {
  SELL_TRADE_PLANNER_DISCLOSURE,
  SUGGESTION_LIMIT,
  buildSellTradePlan,
} from '../../lib/analytics/sellTradePlanner';
import { buildPortfolioInsights } from '../../lib/analytics/portfolioInsights';
import { LOT_METHOD_DISCLAIMER, SPECIFIC_ID_MISSING } from '../../lib/utils/taxLotService';
import { makeCard } from '../helpers';

const AS_OF = Date.parse('2026-10-13T00:00:00.000Z');

function daysBefore(days: number): string {
  return new Date(AS_OF - days * 24 * 60 * 60 * 1000).toISOString();
}

const sameCard = {
  player: 'Julio Rodriguez',
  year: 2019,
  manufacturer: 'Bowman',
  set: 'Chrome',
  cardNumber: 'BCP-33',
  sport: 'Baseball' as const,
  league: 'MLB' as const,
};

describe('buildSellTradePlan', () => {
  it('returns an empty book without inventing a sale', () => {
    const plan = buildSellTradePlan([], { nowMs: AS_OF });
    expect(plan.emptyReason).toMatch(/no cards/i);
    expect(plan.suggestions).toEqual([]);
    expect(plan.totals.count).toBe(0);
    expect(plan.disclosure).toBe(SELL_TRADE_PLANNER_DISCLOSURE);
    expect(plan.disclosure).toMatch(/not a Sports Card Investor or Market Movers/i);
    expect(plan.lotDisclosure).toBe(LOT_METHOD_DISCLAIMER);
  });

  it('ignores sold cards and leaves consignment with the partner', () => {
    const sold = buildSellTradePlan(
      [makeCard({ id: 'sold', status: 'sold', purchasePrice: 10, salePrice: 4, currentValue: 4 })],
      { nowMs: AS_OF },
    );
    expect(sold.emptyReason).toMatch(/no active holdings/i);

    const consigned = buildSellTradePlan(
      [
        makeCard({ id: 'out', status: 'consignment', purchasePrice: 80, currentValue: 20 }),
        makeCard({ id: 'gone', status: 'sold', purchasePrice: 10, salePrice: 4, currentValue: 4 }),
      ],
      { nowMs: AS_OF },
    );
    expect(consigned.emptyReason).toMatch(/consigned cards stay with the partner/i);

    const unpriced = buildSellTradePlan(
      [makeCard({ id: 'blank', purchasePrice: 0, currentValue: 0, gradingFees: 0 })],
      { nowMs: AS_OF },
    );
    expect(unpriced.emptyReason).toMatch(/no active holdings/i);
  });

  it('trades in the lower duplicate and keeps the graded copy on a mark tie', () => {
    const plan = buildSellTradePlan(
      [
        makeCard({
          ...sameCard,
          id: 'raw',
          isGraded: false,
          purchasePrice: 40,
          currentValue: 100,
          purchaseDate: '2020-01-01',
        }),
        makeCard({
          ...sameCard,
          id: 'slab',
          isGraded: true,
          gradingCompany: 'PSA',
          grade: '10',
          purchasePrice: 40,
          currentValue: 100,
          purchaseDate: '2020-02-01',
        }),
      ],
      { nowMs: AS_OF, method: 'FIFO' },
    );
    expect(plan.suggestions.map((row) => row.cardId)).toEqual(['raw']);
    expect(plan.suggestions[0]).toMatchObject({
      action: 'trade-in',
      reason: 'duplicate',
      venue: 'Card Show',
      mark: 100,
      feeAmount: 4,
      netProceeds: 96,
    });
    expect(plan.suggestions[0].label).toMatch(/#BCP-33/);
    expect(plan.duplicateExtraCopies).toBe(1);
    expect(plan.bookUnrealized).toBe(buildPortfolioInsights(
      [
        makeCard({ ...sameCard, id: 'raw', purchasePrice: 40, currentValue: 100, purchaseDate: '2020-01-01' }),
        makeCard({
          ...sameCard,
          id: 'slab',
          isGraded: true,
          gradingCompany: 'PSA',
          grade: '10',
          purchasePrice: 40,
          currentValue: 100,
          purchaseDate: '2020-02-01',
        }),
      ],
      { nowMs: AS_OF },
    ).totals.unrealized);
  });

  it('orders duplicate extras FIFO and LIFO and averages stack cost', () => {
    const copies = [
      makeCard({ ...sameCard, id: 'keeper', purchasePrice: 50, currentValue: 300, purchaseDate: '2019-01-01' }),
      makeCard({ ...sameCard, id: 'older', purchasePrice: 20, currentValue: 80, purchaseDate: '2020-01-01' }),
      makeCard({ ...sameCard, id: 'newer', purchasePrice: 40, currentValue: 100, purchaseDate: '2024-06-01' }),
    ];
    const fifo = buildSellTradePlan(copies, { nowMs: AS_OF, method: 'FIFO' });
    const lifo = buildSellTradePlan(copies, { nowMs: AS_OF, method: 'LIFO' });
    expect(fifo.suggestions.map((row) => row.cardId)).toEqual(['older', 'newer']);
    expect(lifo.suggestions.map((row) => row.cardId)).toEqual(['newer', 'older']);

    const averaged = buildSellTradePlan(
      [
        makeCard({ ...sameCard, id: 'high', purchasePrice: 100, currentValue: 200, purchaseDate: '2020-01-01' }),
        makeCard({ ...sameCard, id: 'low', purchasePrice: 40, currentValue: 80, purchaseDate: '2021-01-01' }),
      ],
      { nowMs: AS_OF, method: 'AvgCost' },
    );
    expect(averaged.suggestions[0]).toMatchObject({ cardId: 'low', costBasis: 70, action: 'trade-in' });
    expect(averaged.suggestions[0].note).toMatch(/Average cost of this stack \(\$70\)/);

    const even = buildSellTradePlan(
      [
        makeCard({ ...sameCard, id: 'a', purchasePrice: 50, currentValue: 120, purchaseDate: '2020-01-01' }),
        makeCard({ ...sameCard, id: 'b', purchasePrice: 50, currentValue: 80, purchaseDate: '2021-01-01' }),
      ],
      { nowMs: AS_OF, method: 'AvgCost' },
    );
    expect(even.suggestions[0].note).not.toMatch(/Average cost/);
  });

  it('keeps the lexicographically first copy when mark and grade tie', () => {
    const plan = buildSellTradePlan(
      [
        makeCard({ ...sameCard, id: 'b', cardNumber: '', purchasePrice: 30, currentValue: 90, purchaseDate: '2020-01-01' }),
        makeCard({ ...sameCard, id: 'a', cardNumber: '', purchasePrice: 30, currentValue: 90, purchaseDate: '2020-06-01' }),
      ],
      { nowMs: AS_OF, method: 'FIFO' },
    );
    expect(plan.suggestions.map((row) => row.cardId)).toEqual(['b']);
    expect(plan.suggestions[0].label).toMatch(/no number/);
  });

  it('names only the specific lots that were marked', () => {
    const copies = [
      makeCard({ ...sameCard, id: 'keeper', purchasePrice: 40, currentValue: 200, purchaseDate: '2020-01-01' }),
      makeCard({ ...sameCard, id: 'extra', purchasePrice: 30, currentValue: 80, purchaseDate: '2021-01-01' }),
    ];
    const unmarked = buildSellTradePlan(copies, { nowMs: AS_OF, method: 'SpecificID', specificLotIds: ['', '   '] });
    expect(unmarked.suggestions).toEqual([]);
    expect(unmarked.specificIdNote).toMatch(/no lots are marked/i);

    const named = buildSellTradePlan(copies, { nowMs: AS_OF, method: 'SpecificID', specificLotIds: ['extra', 'missing'] });
    expect(named.suggestions.map((row) => row.cardId)).toEqual(['extra']);
    expect(named.specificIdNote).toContain(SPECIFIC_ID_MISSING);

    const kept = buildSellTradePlan(copies, { nowMs: AS_OF, method: 'SpecificID', specificLotIds: ['keeper'] });
    expect(kept.suggestions).toEqual([]);
    expect(kept.specificIdNote).toMatch(/copy this desk keeps/i);
  });

  it('sells cost-basis losers and long-term winners, and skips fee-eaten or fresh short-term gains', () => {
    const plan = buildSellTradePlan(
      [
        makeCard({
          id: 'loser-big',
          player: 'Big Loss',
          purchasePrice: 200,
          insuranceFees: 10,
          gradingFees: -5,
          currentValue: 50,
          purchaseDate: '2020-01-01',
        }),
        makeCard({
          id: 'loser-small',
          player: 'Small Loss',
          purchasePrice: Number.NaN,
          currentValue: 40,
          purchaseDate: '2020-01-01',
        }),
        makeCard({
          id: 'winner',
          player: 'Long Winner',
          purchasePrice: 100,
          currentValue: 400,
          purchaseDate: '2020-01-01',
        }),
        makeCard({
          id: 'fee-eaten',
          player: 'Thin Gain',
          purchasePrice: 174,
          currentValue: 200,
          purchaseDate: '2020-01-01',
        }),
        makeCard({
          id: 'fresh',
          player: 'Fresh Gain',
          purchasePrice: 100,
          currentValue: 400,
          purchaseDate: daysBefore(10),
        }),
        makeCard({ id: 'parked', player: 'Parked', status: 'consignment', purchasePrice: 90, currentValue: 10 }),
      ],
      { nowMs: AS_OF },
    );

    expect(plan.suggestions.map((row) => row.cardId)).toEqual(['loser-big', 'winner', 'loser-small']);
    expect(plan.suggestions[2].costBasis).toBe(0);
    expect(plan.suggestions[0]).toMatchObject({
      action: 'sell',
      reason: 'cost-basis-loser',
      venue: 'eBay',
      costBasis: 210,
      mark: 50,
      unrealized: -160,
      feeAmount: 6.5,
      netProceeds: 43.5,
      estimatedTax: 0,
    });
    expect(plan.suggestions[1]).toMatchObject({
      action: 'sell',
      reason: 'unrealized-gain',
      holdingPeriod: 'Long Term',
      feeAmount: 52,
      netProceeds: 348,
      estimatedTax: 49.6,
      cashAfterTax: 298.4,
    });
    expect(plan.loserCount).toBe(1);
    expect(plan.totals).toMatchObject({
      count: 3,
      fees: 63.7,
      netProceeds: 426.3,
    });
  });

  it('holds a loss when a same-card copy was acquired inside 30 days', () => {
    const plan = buildSellTradePlan(
      [
        makeCard({
          ...sameCard,
          id: 'keeper',
          purchasePrice: 20,
          currentValue: 300,
          purchaseDate: '',
        }),
        makeCard({
          ...sameCard,
          id: 'old-loss',
          purchasePrice: 200,
          currentValue: 40,
          purchaseDate: '2020-01-01',
        }),
        makeCard({
          ...sameCard,
          id: 'recent',
          purchasePrice: 30,
          currentValue: 80,
          purchaseDate: daysBefore(4),
        }),
        makeCard({
          ...sameCard,
          id: 'stale-peer',
          player: 'Someone Else',
          purchasePrice: 90,
          currentValue: 20,
          purchaseDate: daysBefore(40),
        }),
      ],
      { nowMs: AS_OF, method: 'FIFO' },
    );

    const held = plan.holds.find((row) => row.cardId === 'old-loss');
    expect(held).toMatchObject({
      action: 'hold',
      washSale: 'restricted',
      venue: 'Card Show',
    });
    expect(held?.note).toMatch(/4d away/);
    expect(held?.washSaleDisallowed).toBeGreaterThan(0);
    expect(plan.suggestions.map((row) => row.cardId)).toContain('stale-peer');
    expect(plan.suggestions.find((row) => row.cardId === 'stale-peer')?.action).toBe('sell');
    expect(plan.totals.count).toBe(plan.suggestions.length);
  });

  it('flags a prior loss window without blocking a sale that has no replacement copy', () => {
    const plan = buildSellTradePlan(
      [
        makeCard({
          ...sameCard,
          id: 'sold-loss',
          status: 'sold',
          purchasePrice: 100,
          salePrice: 40,
          saleDate: daysBefore(5),
          currentValue: 40,
        }),
        makeCard({
          ...sameCard,
          id: 'replacement',
          purchasePrice: 80,
          currentValue: 50,
          purchaseDate: daysBefore(3),
        }),
      ],
      { nowMs: AS_OF },
    );
    expect(plan.suggestions[0]).toMatchObject({ cardId: 'replacement', action: 'sell', washSale: 'watch' });
    expect(plan.suggestions[0].note).toMatch(/30-day wash-sale window/);
    expect(plan.holds).toEqual([]);
  });

  it('holds a short-term winner that is close to long-term treatment', () => {
    const plan = buildSellTradePlan(
      [
        makeCard({
          id: 'soon',
          player: 'Almost Long',
          purchasePrice: 100,
          currentValue: 220,
          purchaseDate: daysBefore(340),
        }),
        makeCard({
          id: 'sooner',
          player: 'Closer',
          purchasePrice: 100,
          currentValue: 260,
          purchaseDate: daysBefore(350),
        }),
      ],
      { nowMs: AS_OF },
    );
    expect(plan.suggestions).toEqual([]);
    expect(plan.holds.map((row) => row.cardId)).toEqual(['sooner', 'soon']);
    expect(plan.holds[0].note).toMatch(/days until long-term/);
    expect(plan.holds[0].daysToLongTerm).toBe(15);
    expect(plan.emptyReason).toBeNull();
  });

  it('caps the visible list and still reports the omitted rows', () => {
    const losers = Array.from({ length: 10 }, (_, index) =>
      makeCard({
        id: `loss-${index}`,
        player: `Loser ${String.fromCharCode(65 + index)}`,
        purchasePrice: 500 - index,
        currentValue: 100,
        purchaseDate: '2020-01-01',
      }),
    );
    const plan = buildSellTradePlan(losers, { nowMs: AS_OF, method: 'FIFO' });
    expect(plan.suggestions).toHaveLength(SUGGESTION_LIMIT);
    expect(plan.suggestions[0].cardId).toBe('loss-0');
    expect(plan.omittedCount).toBe(2);

    const holds = Array.from({ length: 8 }, (_, index) =>
      makeCard({
        id: `hold-${index}`,
        player: `Hold ${index}`,
        purchasePrice: 100,
        currentValue: 250,
        purchaseDate: daysBefore(320 + index),
      }),
    );
    const held = buildSellTradePlan(holds, { nowMs: AS_OF });
    expect(held.holds).toHaveLength(6);
    expect(held.omittedCount).toBe(2);
    expect(held.holds[0].daysToLongTerm).toBeLessThan(held.holds[1].daysToLongTerm);
  });

  it('tie-breaks equal losses by card id and says when nothing qualifies', () => {
    const tied = buildSellTradePlan(
      [
        makeCard({ id: 'b', player: 'Tie', purchasePrice: 80, currentValue: 40, purchaseDate: '2020-01-01', year: 2021, cardNumber: '2' }),
        makeCard({ id: 'a', player: 'Tie', purchasePrice: 80, currentValue: 40, purchaseDate: '2020-01-01', year: 2022, cardNumber: '9' }),
      ],
      { nowMs: AS_OF },
    );
    expect(tied.suggestions.map((row) => row.cardId)).toEqual(['a', 'b']);

    const flat = buildSellTradePlan(
      [makeCard({ id: 'flat', player: 'Flat', purchasePrice: 40, currentValue: 50, purchaseDate: '2020-01-01' })],
      { nowMs: AS_OF },
    );
    expect(flat.emptyReason).toMatch(/nothing in this book stands out/i);
    expect(flat.suggestions).toEqual([]);
  });

  it('sorts mixed holds by wash rank and breaks equal long-term gains by id', () => {
    const plan = buildSellTradePlan(
      [
        makeCard({
          ...sameCard,
          id: 'kept',
          purchasePrice: 20,
          currentValue: 300,
          purchaseDate: daysBefore(6),
        }),
        makeCard({
          ...sameCard,
          id: 'washed',
          purchasePrice: 180,
          currentValue: 40,
          purchaseDate: '2020-01-01',
        }),
        makeCard({
          id: 'b-soon',
          player: 'Soon B',
          year: 2024,
          cardNumber: '8',
          purchasePrice: 100,
          currentValue: 200,
          purchaseDate: daysBefore(340),
        }),
        makeCard({
          id: 'a-soon',
          player: 'Soon A',
          year: 2023,
          cardNumber: '7',
          purchasePrice: 100,
          currentValue: 200,
          purchaseDate: daysBefore(340),
        }),
        makeCard({
          id: 'b-win',
          player: 'Win B',
          year: 2018,
          cardNumber: '2',
          purchasePrice: 100,
          currentValue: 200,
          purchaseDate: '2020-01-01',
        }),
        makeCard({
          id: 'a-win',
          player: 'Win A',
          year: 2017,
          cardNumber: '3',
          purchasePrice: 100,
          currentValue: 200,
          purchaseDate: '2020-01-01',
        }),
      ],
      { nowMs: AS_OF },
    );
    expect(plan.holds.map((row) => row.cardId)).toEqual(['washed', 'a-soon', 'b-soon']);
    expect(plan.suggestions.map((row) => row.cardId)).toEqual(['a-win', 'b-win']);
  });

  it('uses FIFO when no method is passed', () => {
    const plan = buildSellTradePlan([
      makeCard({ id: 'only', player: 'Solo', purchasePrice: 20, currentValue: 10, purchaseDate: '2020-01-01' }),
    ]);
    expect(plan.method).toBe('FIFO');
    expect(plan.suggestions[0]?.action).toBe('sell');
  });
});
