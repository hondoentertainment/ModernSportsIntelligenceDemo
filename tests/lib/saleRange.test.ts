import { describe, expect, it } from 'vitest';
import {
  GRADE_RANGE_NOTE,
  RANGE_LIMIT,
  SALE_RANGE_NOTE,
  gradeSplitCopy,
  preferredGradeKey,
  rangeForSeat,
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
    expect(desk.rows[0].detail).toMatch(/Raw sold comps \$80–\$120/);
  });

  it('splits stored sales by grade and keeps the ladder on the matching band', () => {
    const sales = [
      { title: 'old raw', price: 1, condition: 'raw', soldAt: '2026-01-01' },
      { title: 'raw', price: 40, condition: 'raw', soldAt: '2026-09-01', totalPrice: 42 },
      { title: 'raw two', price: 60, condition: 'Ungraded', soldAt: '2026-09-02' },
      { title: 'slab', price: 200, condition: 'PSA 10', soldAt: '2026-09-03' },
      { title: 'slab two', price: 240, condition: 'PSA10', soldAt: '2026-09-04' },
      { title: 'bgs', price: 180, condition: 'BGS 9.5', soldAt: '2026-09-05' },
      { title: 'quiet', price: 90, condition: 'Near Mint', soldAt: '2026-09-06' },
      { title: 'skip', price: 15, condition: 'raw', soldAt: '' },
    ];
    const rawCard = {
      id: 'judge',
      isGraded: false,
      currentValue: 50,
      salesData: sales,
    };
    const mixed = saleRange(rawCard);
    expect(mixed.band).toBeUndefined();
    expect(mixed).toMatchObject({ source: 'comps', low: 42, high: 240 });
    const seated = rangeForSeat(rawCard);
    expect(seated.band).toBe('raw');
    expect(seated).toMatchObject({ low: 42, high: 60, count: 2 });
    expect(rangeSeatCopy(50, seated, 'Local mark')).toBe(
      'Local mark $50 is inside the range of raw sold comps ($42–$60, median $51).',
    );
    expect(gradeSplitCopy(rawCard)).toMatch(/Raw sold comps \$42–\$60, median \$51 \(2\)/);
    expect(gradeSplitCopy(rawCard)).toMatch(/PSA 10 sold comps \$200–\$240, median \$220 \(2\)/);
    expect(gradeSplitCopy(rawCard)).toMatch(/BGS 9.5 sold comps \$180–\$180, median \$180 \(1\)/);
    expect(gradeSplitCopy(rawCard)).toMatch(/1 sale does not name a grade/);
    expect(gradeSplitCopy(rawCard)).toMatch(/The ladder uses the raw sales/);
    expect(gradeSplitCopy(rawCard)).not.toMatch(/live market movers/i);

    const slab = rangeForSeat({
      id: 'slab',
      isGraded: true,
      gradingCompany: 'PSA',
      grade: 'GEM MT 10',
      currentValue: 220,
      salesData: sales,
    });
    expect(slab.band).toBe('PSA 10');
    expect(slab.low).toBe(200);
    expect(slab.high).toBe(240);
    const missing = gradeSplitCopy({
      id: 'nine',
      isGraded: true,
      gradingCompany: 'PSA',
      grade: '9',
      currentValue: 100,
      salesData: sales,
    });
    expect(missing).toMatch(/This card is PSA 9\. No PSA 9 sales are stored/);
    expect(rangeForSeat({
      id: 'nine',
      isGraded: true,
      gradingCompany: 'PSA',
      grade: '9',
      currentValue: 100,
      salesData: sales,
    }).band).toBeUndefined();

    expect(gradeSplitCopy({ id: 'plain', currentValue: 80, salesData: [
      { price: 80, soldAt: '2026-09-01' },
      { price: 100, soldAt: '2026-09-02' },
    ] })).toMatch(/do not name a grade/);
    expect(gradeSplitCopy({ id: 'demo', currentValue: 80 })).toBe('A demo sketch is not split by grade.');
    expect(gradeSplitCopy({ id: 'zero', currentValue: 0 })).toBeNull();
    expect(rangeForSeat({
      id: 'watch',
      currentValue: 200,
      gradeText: '2024 Prizm PSA 10',
      salesData: sales,
    }).band).toBe('PSA 10');
    expect(preferredGradeKey({ id: 'other', isGraded: true, gradingCompany: 'Other', grade: '10' })).toBeNull();
    expect(GRADE_RANGE_NOTE).toMatch(/not a population report/i);
    expect(GRADE_RANGE_NOTE).toMatch(/not a live tape/i);
  });
});
