import { afterEach, describe, expect, it } from 'vitest';
import { INDEX_BEAT_DISCLOSURE, indexBeat } from '../../lib/analytics/indexBeat';
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

describe('indexBeat', () => {
  it('stays quiet when the book cannot form an index', () => {
    expect(indexBeat([]).copy).toBe('Index beat: no held card is on this desk.');
    expect(indexBeat([], []).copy).toBe('Index beat: no favorite is on this desk.');
    snap('solo', 100, 150);
    expect(indexBeat([
      makeCard({ id: 'solo', currentValue: 150 }),
      makeCard({ id: 'sold', status: 'sold', currentValue: 900 }),
    ]).copy).toBe('Index beat: one card cannot beat an index of itself.');
    expect(indexBeat([makeCard({ id: 'thin', currentValue: 40 })]).copy).toBe(
      'Index beat: 1 held card stays off this desk, so it does not say the book beat the index.',
    );
    expect(indexBeat([makeCard({ id: 'thin', currentValue: 40 })], ['thin']).copy).toBe(
      'Index beat: 1 favorite stays off this desk, so it does not say these favorites beat the index.',
    );
  });

  it('keeps a zero start, thin tape, and a sold card off the weight', () => {
    snap('up', 400, 600);
    snap('down', 100, 80);
    snap('zero', 0, 40);
    const beat = indexBeat([
      makeCard({ id: 'up', player: 'Heavy', currentValue: 600 }),
      makeCard({ id: 'down', player: 'Light', currentValue: 80 }),
      makeCard({ id: 'zero', player: 'Zero', currentValue: 40 }),
      makeCard({ id: 'thin', player: 'Thin', currentValue: 20 }),
      makeCard({ id: 'sold', status: 'sold', currentValue: 500 }),
    ]);
    expect(beat.call).toBe('beat');
    expect(beat.cards).toBe(2);
    expect(beat.off).toBe(2);
    expect(beat.bookPct).toBe(36);
    expect(beat.indexPct).toBe(15);
    expect(beat.gapPct).toBe(21);
    expect(beat.alert).toBeNull();
    expect(beat.disclosure).toBe(INDEX_BEAT_DISCLOSURE);
    expect(beat.copy).toBe(
      'Index beat: 2 held cards. The book is up 36.0% and the equal-weighted index is up 15.0%. The dollars beat that index by 21.0 points. 2 cards stay off. Not a live Sports Card Investor or Market Movers index.',
    );
  });

  it('names a lag and the card that dragged the dollars', () => {
    snap('drag', 400, 280);
    snap('lift', 100, 140);
    const beat = indexBeat([
      makeCard({ id: 'drag', player: 'Drag', sport: 'Baseball', year: 2018, currentValue: 280 }),
      makeCard({ id: 'lift', player: 'Lift', sport: 'Baseball', year: 2018, currentValue: 140 }),
    ]);
    expect(beat.call).toBe('lag');
    expect(beat.bookPct).toBe(-16);
    expect(beat.indexPct).toBe(5);
    expect(beat.gapPct).toBe(-21);
    expect(beat.widest).toBeNull();
    expect(beat.alert).toEqual({
      copy: 'Index beat: The book lagged the local index by 21.0 points. Drag dragged it. Not a live tape.',
      player: 'Drag',
      cardId: 'drag',
      href: '/audit-dossier?cardId=drag',
    });
  });

  it('treats a 2-point gap as a match and a wider gap as a beat', () => {
    snap('a', 300, 360);
    snap('b', 100, 112);
    const match = indexBeat([
      makeCard({ id: 'a', currentValue: 360 }),
      makeCard({ id: 'b', currentValue: 112 }),
    ]);
    expect(match.gapPct).toBe(2);
    expect(match.call).toBe('match');
    expect(match.copy).toMatch(/within 2 points, so the dollars matched the index/);
    expect(match.alert).toBeNull();

    clearPriceHistory();
    snap('a', 300, 363);
    snap('b', 100, 112);
    const beat = indexBeat([
      makeCard({ id: 'a', currentValue: 363 }),
      makeCard({ id: 'b', currentValue: 112 }),
    ]);
    expect(beat.bookPct).toBe(18.8);
    expect(beat.indexPct).toBe(16.5);
    expect(beat.gapPct).toBe(2.3);
    expect(beat.call).toBe('beat');
  });

  it('names the slice that missed by the most, and skips a slice that is the whole set', () => {
    snap('heavy', 400, 600);
    snap('light', 100, 80);
    snap('hoop', 200, 100);
    snap('other', 40, 60);
    const beat = indexBeat([
      makeCard({ id: 'heavy', player: 'Heavy', sport: 'Baseball', year: 2018, currentValue: 600 }),
      makeCard({ id: 'light', player: 'Light', sport: 'Baseball', year: 1991, currentValue: 80 }),
      makeCard({ id: 'hoop', player: 'Hoop', sport: 'Basketball', year: 2020, set: 'Hobby Box', currentValue: 100 }),
      makeCard({ id: 'other', player: 'Other', sport: 'Basketball', year: 1975, currentValue: 60 }),
    ]);
    expect(beat.call).toBe('beat');
    expect(beat.gapPct).toBe(6);
    expect(beat.widest?.label).toBe('Basketball');
    expect(beat.widest?.call).toBe('lag');
    expect(beat.widest?.gapPct).toBe(-33.3);
    expect(beat.slices.some((slice) => slice.kind === 'format' && slice.label === 'Singles')).toBe(true);
    expect(beat.slices.some((slice) => slice.label === 'Sealed')).toBe(false);
    expect(beat.slices.some((slice) => slice.cards === beat.cards)).toBe(false);
    expect(beat.copy).toMatch(/Basketball lagged its own index by 33.3 points/);
    expect(beat.alert).toBeNull();
  });

  it('scores favorites on their own tape and uses sold comps when snapshots are missing', () => {
    snap('fav', 100, 112);
    snap('other', 80, 40);
    const sales: MarketComp[] = [
      { title: 'old', price: 100, condition: 'raw', soldAt: '2026-07-01' },
      { title: 'new', price: 108, condition: 'raw', soldAt: '2026-08-01' },
    ];
    const beat = indexBeat([
      makeCard({ id: 'fav', player: 'Star', currentValue: 112 }),
      makeCard({ id: 'comp', player: 'Comp', currentValue: 108, salesData: sales }),
      makeCard({ id: 'other', player: 'Other', currentValue: 40 }),
    ], ['fav', 'comp', 'missing']);
    expect(beat.scoped).toBe(true);
    expect(beat.cards).toBe(2);
    expect(beat.bookPct).toBe(10);
    expect(beat.indexPct).toBe(10);
    expect(beat.call).toBe('match');
    expect(beat.copy).toMatch(/2 favorites/);
    expect(beat.copy).toMatch(/These favorites are up 10.0%/);
    expect(beat.alert).toBeNull();
  });

  it('names sealed wax when those dollars beat the singles', () => {
    snap('wax', 200, 280);
    snap('case', 50, 40);
    snap('single', 100, 100);
    snap('other', 100, 100);
    const beat = indexBeat([
      makeCard({ id: 'wax', player: 'Wax', set: 'Hobby Box', year: 2024, currentValue: 280 }),
      makeCard({ id: 'case', player: 'Case', set: 'Jumbo', year: 2024, currentValue: 40 }),
      makeCard({ id: 'single', player: 'Single', set: 'Chrome', year: 2024, currentValue: 100 }),
      makeCard({ id: 'other', player: 'Other', set: 'Chrome', year: 2024, currentValue: 100 }),
    ]);
    expect(beat.widest?.label).toBe('Sealed');
    expect(beat.widest?.call).toBe('beat');
    expect(beat.widest?.gapPct).toBe(18);
    expect(beat.copy).toMatch(/Sealed beat its own index by 18.0 points/);
  });

  it('breaks a drag tie toward the larger start', () => {
    snap('small', 40, 20);
    snap('large', 80, 40);
    const beat = indexBeat([
      makeCard({ id: 'small', player: 'Small', currentValue: 20 }),
      makeCard({ id: 'large', player: 'Large', currentValue: 40 }),
    ]);
    expect(beat.call).toBe('match');
    expect(beat.drag?.player).toBe('Large');
  });
});
