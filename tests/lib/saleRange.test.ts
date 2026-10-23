import { describe, expect, it } from 'vitest';
import {
  RANGE_LIMIT,
  SALE_RANGE_NOTE,
  rangeSeat,
  rangeSeatCopy,
  saleRange,
  targetRangeDesk,
} from '../../lib/collector/saleRange';
import type { TargetWatchlist } from '../../types';

function target(overrides: Partial<TargetWatchlist> = {}): TargetWatchlist {
  return {
    id: 'tatum',
    player: 'Jayson Tatum',
    cardDescription: '2024 Prizm Silver',
    priority: 'High',
    targetPrice: 40,
    currentMarketPrice: 80,
    sport: 'Basketball',
    league: 'NBA',
    status: 'active',
    createdAt: '2026-01-01',
    ...overrides,
  };
}

describe('saleRange', () => {
  it('uses stored sold comps for low, median, and high', () => {
    const range = saleRange({
      id: 'judge',
      currentValue: 999,
      salesData: [
        { price: 80, soldAt: '2026-09-01' },
        { price: 100, soldAt: '2026-09-02' },
        { price: 140, soldAt: '2026-09-03' },
      ],
    });
    expect(range).toEqual({ source: 'comps', low: 80, median: 100, high: 140, count: 3 });
    expect(rangeSeat(80, range)).toBe('inside');
    expect(rangeSeat(140, range)).toBe('inside');
    expect(rangeSeat(79.99, range)).toBe('under low');
    expect(rangeSeat(140.01, range)).toBe('over high');
    expect(rangeSeatCopy(50, range, 'This ask')).toBe(
      'This ask $50 is under the low of sold comps ($80–$140, median $100).'
    );
    expect(rangeSeatCopy(160, range, 'This mark')).toMatch(/over the high of sold comps/);
    expect(rangeSeatCopy(100, range, 'This buy')).toMatch(/inside the range of sold comps/);
  });

  it('sketches a stable demo band around the local mark and refuses an empty card', () => {
    const first = saleRange({ id: 'abc', currentValue: 100 });
    expect(first.source).toBe('demo');
    expect(first.low).toBeLessThanOrEqual(first.median ?? 0);
    expect(first.high).toBeGreaterThanOrEqual(first.median ?? 0);
    expect(saleRange({ id: 'abc', currentValue: 100 })).toEqual(first);
    expect(saleRange({ id: 'zero', currentValue: 0 }).source).toBe('none');
    expect(rangeSeat(10, saleRange({ id: 'zero', currentValue: 0 }))).toBe('no range');
    expect(rangeSeat(null, first)).toBe('no price');
    expect(rangeSeat(0, first)).toBe('no price');
    expect(rangeSeatCopy(null, first, 'Your target')).toBeNull();
    expect(SALE_RANGE_NOTE).toMatch(/not a live tape/i);
    expect(SALE_RANGE_NOTE).not.toMatch(/live market movers/i);
  });

  it('ranks active targets under the low ahead of the rest and caps the list', () => {
    const sales = [
      { title: 'a', price: 80, condition: 'raw', soldAt: '2026-09-01' },
      { title: 'b', price: 100, condition: 'raw', soldAt: '2026-09-02' },
      { title: 'c', price: 120, condition: 'raw', soldAt: '2026-09-03' },
    ];
    const desk = targetRangeDesk([
      target({ id: 'over', player: 'Over', targetPrice: 200, salesData: sales }),
      target({ id: 'inside', player: 'Inside', targetPrice: 100, salesData: sales }),
      target({ id: 'under', player: 'Under', targetPrice: 40, salesData: sales }),
      target({ id: 'gone', status: 'acquired', player: 'Gone', targetPrice: 10, salesData: sales }),
      target({ id: 'blank', player: 'Blank', targetPrice: 10, currentMarketPrice: undefined }),
      target({ id: 'free', player: 'Free', targetPrice: 0, currentMarketPrice: 80 }),
    ]);
    expect(desk.rows.map(row => row.id)).toEqual(['range:under', 'range:inside', 'range:over']);
    expect(desk.rows[0].title).toBe('Under is under the low');
    expect(desk.rows[0].detail).toMatch(/Your target \$40 is under the low of sold comps/);
    expect(desk.rows[0].detail).toMatch(/2024 Prizm Silver/);
    const legacy = targetRangeDesk([
      target({
        id: 'legacy',
        player: 'Legacy',
        targetPrice: 40,
        currentMarketPrice: 100,
        salesData: sales,
        cardDescription: undefined as unknown as string,
      }),
    ]);
    expect(legacy.rows[0]?.detail).toMatch(/Watchlist row/);
    expect(legacy.rows[0]?.title).toMatch(/Legacy is under the low/);
    expect(desk.rows[0].href).toBe('/collection');
    expect(desk.omitted).toBe(0);

    const many = Array.from({ length: RANGE_LIMIT + 2 }, (_, index) =>
      target({
        id: `row-${index}`,
        player: `Player ${String(index).padStart(2, '0')}`,
        targetPrice: 10,
        salesData: sales,
      })
    );
    const capped = targetRangeDesk(many);
    expect(capped.rows).toHaveLength(RANGE_LIMIT);
    expect(capped.omitted).toBe(2);
  });
});
