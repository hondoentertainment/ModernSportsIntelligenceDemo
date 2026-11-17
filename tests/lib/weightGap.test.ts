import { afterEach, describe, expect, it } from 'vitest';
import { WEIGHT_GAP_DISCLOSURE, weightGap } from '../../lib/analytics/weightGap';
import { clearPriceHistory, recordBatchSnapshots } from '../../lib/analytics/priceHistory';
import { makeCard } from '../helpers';
import type { MarketComp } from '../../types';

afterEach(() => {
  clearPriceHistory();
});

function snap(id: string, from: number, to: number): void {
  recordBatchSnapshots([
    { id, value: from, timestamp: '2026-08-01T00:00:00.000Z' },
    { id, value: to, timestamp: '2026-09-01T00:00:00.000Z' },
  ]);
}

describe('weightGap', () => {
  it('stays quiet when the book cannot form an index', () => {
    expect(weightGap([]).copy).toBe('Weight gap: no held card is on this desk.');
    expect(weightGap([], []).copy).toBe('Weight gap: no favorite is on this desk.');
    snap('solo', 100, 150);
    expect(weightGap([
      makeCard({ id: 'solo', currentValue: 150 }),
      makeCard({ id: 'sold', status: 'sold', currentValue: 900 }),
    ]).copy).toBe('Weight gap: one card cannot show a weight gap against itself.');
    expect(weightGap([makeCard({ id: 'thin', currentValue: 40 })]).copy).toBe(
      'Weight gap: 1 held card stays off this desk, so it does not price a weight gap.',
    );
    expect(weightGap([makeCard({ id: 'thin', currentValue: 40 })], ['thin']).copy).toBe(
      'Weight gap: 1 favorite stays off this desk, so it does not price a weight gap.',
    );
  });

  it('prices the lead and the card whose extra weight carried it', () => {
    snap('up', 400, 600);
    snap('down', 100, 80);
    const gap = weightGap([
      makeCard({ id: 'up', player: 'Heavy', currentValue: 600 }),
      makeCard({ id: 'down', player: 'Light', currentValue: 80 }),
      makeCard({ id: 'zero', player: 'Zero', currentValue: 40 }),
      makeCard({ id: 'thin', player: 'Thin', currentValue: 20 }),
      makeCard({ id: 'sold', status: 'sold', currentValue: 500 }),
    ]);
    expect(gap.call).toBe('beat');
    expect(gap.gapPct).toBe(21);
    expect(gap.gapUsd).toBe(105);
    expect(gap.startUsd).toBe(500);
    expect(gap.carry).toMatchObject({ id: 'up', player: 'Heavy', sharePct: 80, partPct: 71.4 });
    expect(gap.alert).toBeNull();
    expect(gap.disclosure).toBe(WEIGHT_GAP_DISCLOSURE);
    expect(gap.copy).toBe(
      'Weight gap: The book is $105 ahead of the equal-weighted index on the $500 start. That gap is 21.0 points. 2 cards stay off. Heavy is 80.0% of that start. The equal share is 50.0%. That extra weight carried 71.4% of this net lead. Not a live Sports Card Investor or Market Movers index.',
    );
  });

  it('alerts the card that carried a lag when that card is not the percent drag', () => {
    snap('drag', 400, 280);
    snap('lift', 100, 140);
    const gap = weightGap([
      makeCard({ id: 'drag', player: 'Drag', currentValue: 280 }),
      makeCard({ id: 'lift', player: 'Lift', currentValue: 140 }),
    ]);
    expect(gap.call).toBe('lag');
    expect(gap.gapUsd).toBe(-105);
    expect(gap.carry).toMatchObject({ id: 'lift', player: 'Lift', sharePct: 20, partPct: 57.1 });
    expect(gap.alert).toEqual({
      copy: 'Weight gap: The book lagged, and Lift carried 57.1% of that net lag. Not a live tape.',
      player: 'Lift',
      cardId: 'lift',
      href: '/audit-dossier?cardId=lift',
    });
    expect(gap.copy).toMatch(/Lift is 20.0% of that start/);
    expect(gap.copy).toMatch(/The percent drag is a different card/);
  });

  it('keeps a 2-point match off the alert and names a tie without a single card', () => {
    snap('a', 300, 360);
    snap('b', 100, 112);
    const match = weightGap([
      makeCard({ id: 'a', player: 'Heavy', currentValue: 360 }),
      makeCard({ id: 'b', player: 'Light', currentValue: 112 }),
    ]);
    expect(match.call).toBe('match');
    expect(match.gapUsd).toBe(8);
    expect(match.alert).toBeNull();
    expect(match.copy).toMatch(/inside the 2-point band, so the dollars matched/);
    expect(match.offsetUsd).toBe(12);
    expect(match.copy).toMatch(/Heavy is 75.0% of that start/);
    expect(match.copy).toMatch(/That extra weight pulled \$20, and other cards offset \$12/);
    expect(match.copy).not.toMatch(/100\.0% of this/);

    clearPriceHistory();
    snap('big', 300, 300);
    snap('ada', 50, 100);
    snap('bea', 50, 100);
    const tied = weightGap([
      makeCard({ id: 'big', player: 'Big', currentValue: 300 }),
      makeCard({ id: 'ada', player: 'Ada', currentValue: 100 }),
      makeCard({ id: 'bea', player: 'Bea', currentValue: 100 }),
    ]);
    expect(tied.call).toBe('lag');
    expect(tied.carry).toBeNull();
    expect(tied.tied.map((card) => card.player)).toEqual(['Ada', 'Bea']);
    expect(tied.alert).toBeNull();
    expect(tied.copy).toMatch(/Ada and Bea each carried 50.0% of this net lag/);
    expect(tied.copy).toMatch(/The percent drag is a different card/);
  });

  it('scores favorites on their own tape', () => {
    snap('fav', 100, 112);
    const sales: MarketComp[] = [
      { title: 'old', price: 100, condition: 'raw', soldAt: '2026-07-01' },
      { title: 'new', price: 108, condition: 'raw', soldAt: '2026-08-01' },
    ];
    const gap = weightGap([
      makeCard({ id: 'fav', player: 'Star', currentValue: 112 }),
      makeCard({ id: 'comp', player: 'Comp', currentValue: 108, salesData: sales }),
      makeCard({ id: 'other', player: 'Other', currentValue: 40 }),
    ], ['fav', 'comp', 'missing']);
    expect(gap.scoped).toBe(true);
    expect(gap.call).toBe('match');
    expect(gap.gapUsd).toBe(0);
    expect(gap.carry).toBeNull();
    expect(gap.copy).toBe(
      'Weight gap: These favorites moved with the equal-weighted index on the $200 start. Not a live Sports Card Investor or Market Movers index.',
    );
  });

  it('names a heavy card that carried its own lag', () => {
    snap('heavy', 2000, 1400);
    snap('flat', 100, 100);
    snap('other', 100, 100);
    const gap = weightGap([
      makeCard({ id: 'heavy', player: 'Heavy', currentValue: 1400 }),
      makeCard({ id: 'flat', player: 'Flat', currentValue: 100 }),
      makeCard({ id: 'other', player: 'Other', currentValue: 100 }),
    ]);
    expect(gap.call).toBe('lag');
    expect(gap.carry?.id).toBe('heavy');
    expect(gap.alert?.cardId).toBe('heavy');
    expect(gap.copy).not.toMatch(/different card/);
  });

  it('names an offset instead of calling one card the whole lag', () => {
    snap('heavy', 600, 480);
    snap('mid', 300, 240);
    snap('light', 100, 90);
    const gap = weightGap([
      makeCard({ id: 'heavy', player: 'Heavy', currentValue: 480 }),
      makeCard({ id: 'mid', player: 'Mid', currentValue: 240 }),
      makeCard({ id: 'light', player: 'Light', currentValue: 90 }),
    ]);
    expect(gap.call).toBe('lag');
    expect(gap.gapUsd).toBe(-23);
    expect(gap.offsetUsd).toBe(30.33);
    expect(gap.carry).toMatchObject({ id: 'heavy', partPct: 231.9 });
    expect(gap.copy).toMatch(/That extra weight pulled \$53\.33, and other cards offset \$30\.33/);
    expect(gap.copy).not.toMatch(/100\.0% of this/);
    expect(gap.alert?.copy).toBe(
      'Weight gap: The book lagged, and Heavy pulled more than that net lag. Other cards offset $30.33. Not a live tape.',
    );
  });
});
