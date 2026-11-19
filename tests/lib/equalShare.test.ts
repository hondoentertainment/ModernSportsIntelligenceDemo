import { afterEach, describe, expect, it } from 'vitest';
import { EQUAL_SHARE_DISCLOSURE, equalShare } from '../../lib/analytics/equalShare';
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

describe('equalShare', () => {
  it('stays quiet when the book cannot form an index', () => {
    expect(equalShare([]).copy).toBe('Equal share: no held card is on this desk.');
    expect(equalShare([], []).copy).toBe('Equal share: no favorite is on this desk.');
    snap('solo', 100, 150);
    expect(equalShare([
      makeCard({ id: 'solo', currentValue: 150 }),
      makeCard({ id: 'sold', status: 'sold', currentValue: 900 }),
    ]).copy).toBe('Equal share: one card cannot move to an equal share against itself.');
    expect(equalShare([makeCard({ id: 'thin', currentValue: 40 })]).copy).toBe(
      'Equal share: 1 held card stays off this desk, so it does not name an equal share.',
    );
    expect(equalShare([makeCard({ id: 'thin', currentValue: 40 })], ['thin']).copy).toBe(
      'Equal share: 1 favorite stays off this desk, so it does not name an equal share.',
    );
  });

  it('names the dollars a lead would give up to sit at an equal share', () => {
    snap('up', 400, 600);
    snap('down', 100, 80);
    const share = equalShare([
      makeCard({ id: 'up', player: 'Heavy', currentValue: 600 }),
      makeCard({ id: 'down', player: 'Light', currentValue: 80 }),
      makeCard({ id: 'zero', player: 'Zero', currentValue: 40 }),
      makeCard({ id: 'thin', player: 'Thin', currentValue: 20 }),
      makeCard({ id: 'sold', status: 'sold', currentValue: 500 }),
    ]);
    expect(share.call).toBe('beat');
    expect(share.after).toBe('match');
    expect(share.afterGapPct).toBe(0);
    expect(share.alert).toBeNull();
    expect(share.move).toMatchObject({ id: 'up', player: 'Heavy', side: 'trim', moveUsd: -300 });
    expect(share.disclosure).toBe(EQUAL_SHARE_DISCLOSURE);
    expect(share.copy).toBe(
      'Equal share: Heavy is $300 of the $500 start above an equal share. Moving that start to an equal share, with the same percent change, would match the index. That is a trim of sparkline start, not a sale. The book is $105 ahead of the index today. That gap is 21.0 points. 2 cards stay off. Not a live Sports Card Investor or Market Movers index.',
    );
  });

  it('alerts when adding start to the lag card would match the index', () => {
    snap('drag', 400, 280);
    snap('lift', 100, 140);
    const share = equalShare([
      makeCard({ id: 'drag', player: 'Drag', currentValue: 280 }),
      makeCard({ id: 'lift', player: 'Lift', currentValue: 140 }),
    ]);
    expect(share.call).toBe('lag');
    expect(share.after).toBe('match');
    expect(share.move).toMatchObject({ id: 'lift', side: 'fill', moveUsd: 300 });
    expect(share.alert).toEqual({
      copy: 'Equal share: The book lagged. Adding that start to Lift would match the index. That is a fill, not a buy. Not a live tape.',
      player: 'Lift',
      cardId: 'lift',
      href: '/audit-dossier?cardId=lift',
    });
    expect(share.copy).toMatch(/Lift is \$300 of the \$500 start below an equal share/);
    expect(share.copy).toMatch(/Adding that start, with the same percent change, would match the index/);
    expect(share.copy).toMatch(/That is a fill, not a buy/);
    const favorites = equalShare([
      makeCard({ id: 'drag', player: 'Drag', currentValue: 280 }),
      makeCard({ id: 'lift', player: 'Lift', currentValue: 140 }),
    ], ['drag', 'lift']);
    expect(favorites.scoped).toBe(true);
    expect(favorites.alert?.copy).toBe(
      'Equal share: These favorites lagged. Adding that start to Lift would match the index. That is a fill, not a buy. Not a live tape.',
    );
  });

  it('alerts when the trim would turn a lag into a beat', () => {
    snap('heavy', 700, 350);
    snap('mid', 250, 500);
    snap('small', 50, 50);
    const share = equalShare([
      makeCard({ id: 'heavy', player: 'Heavy', currentValue: 350 }),
      makeCard({ id: 'mid', player: 'Mid', currentValue: 500 }),
      makeCard({ id: 'small', player: 'Small', currentValue: 50 }),
    ]);
    expect(share.call).toBe('lag');
    expect(share.after).toBe('beat');
    expect(share.afterGapPct).toBe(22.2);
    expect(share.move).toMatchObject({ id: 'heavy', side: 'trim', moveUsd: -550 });
    expect(share.alert?.copy).toBe(
      'Equal share: The book lagged. Moving Heavy to an equal share would beat the index by 22.2 points. That is a trim of sparkline start, not a sale. Not a live tape.',
    );
  });

  it('stays quiet when the trim would still lag', () => {
    snap('heavy', 800, 400);
    snap('mid', 150, 180);
    snap('light', 50, 80);
    const share = equalShare([
      makeCard({ id: 'heavy', player: 'Heavy', currentValue: 400 }),
      makeCard({ id: 'mid', player: 'Mid', currentValue: 180 }),
      makeCard({ id: 'light', player: 'Light', currentValue: 80 }),
    ]);
    expect(share.call).toBe('lag');
    expect(share.after).toBe('lag');
    expect(share.afterGapPct).toBe(-6.7);
    expect(share.alert).toBeNull();
    expect(share.move).toMatchObject({ id: 'heavy', side: 'trim', moveUsd: -700 });
    expect(share.copy).toBe(
      'Equal share: Heavy is $700 of the $1,000 start above an equal share. Moving that start to an equal share, with the same percent change, would still lag the index by 6.7 points. That is a trim of sparkline start, not a sale. The book is $440 behind the index today. That gap is 44.0 points. Not a live Sports Card Investor or Market Movers index.',
    );
  });

  it('names a trim that clears a lag and does not call it a sale', () => {
    snap('heavy', 2000, 1400);
    snap('flat', 100, 100);
    snap('other', 100, 100);
    const share = equalShare([
      makeCard({ id: 'heavy', player: 'Heavy', currentValue: 1400 }),
      makeCard({ id: 'flat', player: 'Flat', currentValue: 100 }),
      makeCard({ id: 'other', player: 'Other', currentValue: 100 }),
    ]);
    expect(share.call).toBe('lag');
    expect(share.after).toBe('match');
    expect(share.move).toMatchObject({ id: 'heavy', side: 'trim', moveUsd: -1900 });
    expect(share.alert?.copy).toBe(
      'Equal share: The book lagged. Moving Heavy to an equal share would match the index. That is a trim of sparkline start, not a sale. Not a live tape.',
    );
    expect(share.alert?.href).toBe('/audit-dossier?cardId=heavy');
  });

  it('keeps a 2-point match off the alert and does not move a tie', () => {
    snap('a', 300, 360);
    snap('b', 100, 112);
    const match = equalShare([
      makeCard({ id: 'a', player: 'Heavy', currentValue: 360 }),
      makeCard({ id: 'b', player: 'Light', currentValue: 112 }),
    ]);
    expect(match.call).toBe('match');
    expect(match.after).toBe('match');
    expect(match.alert).toBeNull();
    expect(match.move).toMatchObject({ id: 'a', side: 'trim', moveUsd: -200 });
    expect(match.copy).toMatch(/Those 2.0 points are inside the 2-point band, so the dollars matched/);
    expect(match.copy).toMatch(/not a sale/);

    clearPriceHistory();
    snap('big', 300, 300);
    snap('ada', 50, 100);
    snap('bea', 50, 100);
    const tied = equalShare([
      makeCard({ id: 'big', player: 'Big', currentValue: 300 }),
      makeCard({ id: 'ada', player: 'Ada', currentValue: 100 }),
      makeCard({ id: 'bea', player: 'Bea', currentValue: 100 }),
    ]);
    expect(tied.call).toBe('lag');
    expect(tied.move).toBeNull();
    expect(tied.alert).toBeNull();
    expect(tied.tied.map((card) => card.player)).toEqual(['Ada', 'Bea']);
    expect(tied.tied.every((card) => card.side === 'fill' && card.moveUsd === 125)).toBe(true);
    expect(tied.copy).toMatch(/Ada and Bea are each \$125 of that start below an equal share/);
    expect(tied.copy).toMatch(/A tie does not name one card to move/);
  });

  it('names no card when favorites already moved with the index', () => {
    snap('fav', 100, 112);
    const sales: MarketComp[] = [
      { title: 'old', price: 100, condition: 'raw', soldAt: '2026-07-01' },
      { title: 'new', price: 108, condition: 'raw', soldAt: '2026-08-01' },
    ];
    const share = equalShare([
      makeCard({ id: 'fav', player: 'Star', currentValue: 112 }),
      makeCard({ id: 'comp', player: 'Comp', currentValue: 108, salesData: sales }),
      makeCard({ id: 'other', player: 'Other', currentValue: 40 }),
    ], ['fav', 'comp', 'missing']);
    expect(share.scoped).toBe(true);
    expect(share.gapUsd).toBe(0);
    expect(share.move).toBeNull();
    expect(share.alert).toBeNull();
    expect(share.copy).toBe(
      'Equal share: These favorites moved with the equal-weighted index on the $200 start, so no card is named. Not a live Sports Card Investor or Market Movers index.',
    );
  });
});
