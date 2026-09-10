import { describe, expect, it } from 'vitest';
import {
  CARD_COMPARE_DESK_DISCLOSURE,
  COMPARE_DESK_MAX,
  buildCardCompareDesk,
  selectCompareCards,
} from '../../lib/analytics/cardCompareDesk';
import { makeCard } from '../helpers';
import type { MarketComp } from '../../types';

function comps(): MarketComp[] {
  return [
    { title: 'sold a', price: 200, condition: 'raw', soldAt: '2026-08-01' },
    { title: 'sold b', price: 210, condition: 'raw', soldAt: '2026-08-08' },
    { title: 'sold c', price: 220, condition: 'raw', soldAt: '2026-08-15' },
  ];
}

describe('cardCompareDesk', () => {
  it('requires two cards and caps at three', () => {
    const one = buildCardCompareDesk([makeCard({ id: 'a' })]);
    expect(one.incomplete).toBe(true);
    expect(one.emptyReason).toMatch(/two or three/i);
    expect(one.disclosure).toBe(CARD_COMPARE_DESK_DISCLOSURE);

    const cards = [
      makeCard({ id: 'a', player: 'A', currentValue: 100 }),
      makeCard({ id: 'b', player: 'B', currentValue: 200 }),
      makeCard({ id: 'c', player: 'C', currentValue: 300 }),
      makeCard({ id: 'd', player: 'D', currentValue: 400 }),
    ];
    const desk = buildCardCompareDesk(cards, cards, new Date('2026-09-10'));
    expect(desk.columns).toHaveLength(COMPARE_DESK_MAX);
    expect(desk.incomplete).toBe(false);
  });

  it('selects unique inventory ids in URL order', () => {
    const inventory = [makeCard({ id: 'a' }), makeCard({ id: 'b' }), makeCard({ id: 'c' })];
    expect(selectCompareCards(inventory, [null, 'b', 'b', 'missing', 'c', 'a']).map((card) => card.id)).toEqual([
      'b',
      'c',
      'a',
    ]);
  });

  it('fills mark, comps, horizon, ratio, and concentration columns', () => {
    const asOf = new Date('2026-09-10T00:00:00.000Z');
    const a = makeCard({
      id: 'a',
      player: 'Trout',
      purchaseDate: '2026-03-01',
      purchasePrice: 100,
      currentValue: 220,
      salesData: comps(),
    });
    const b = makeCard({
      id: 'b',
      player: 'Judge',
      purchaseDate: '2024-01-01',
      purchasePrice: 80,
      currentValue: 90,
    });
    const desk = buildCardCompareDesk([a, b], [a, b], asOf);
    expect(desk.columns[0].compsUsed).toBe(3);
    expect(desk.columns[0].thinTape).toBe(false);
    expect(desk.columns[0].treatment).toBe('Short-Term');
    expect(desk.columns[0].roiPct).toBeGreaterThan(0);
    expect(desk.columns[0].gradeRatio?.psa10Over9).not.toBeNull();
    expect(desk.columns[1].treatment).toBe('Long-Term');
    expect(desk.columns[0].concentrationSharePct).toBeGreaterThan(0);
  });

  it('zeros invalid marks and still desks a zero-cost lot against an empty universe', () => {
    const desk = buildCardCompareDesk(
      [
        makeCard({ id: 'a', player: 'A', purchasePrice: 0, currentValue: 0 }),
        makeCard({ id: 'b', player: 'B', purchasePrice: 50, currentValue: 60 }),
      ],
      [],
      new Date('2026-09-10T00:00:00.000Z'),
    );
    expect(desk.columns[0].mark).toBe(0);
    expect(desk.columns[0].roiPct).toBeNull();
    expect(desk.columns[1].roiPct).toBeGreaterThan(0);
  });
});
