import { describe, expect, it } from 'vitest';
import { GRADE_ALERT_NOTE, watchlistAlertMark } from '../../lib/collector/gradeAlert';
import { priceDropRows } from '../../lib/alerts/collectorAlertDigest';
import type { TargetWatchlist } from '../../types';

const sales = [
  { title: 'raw', price: 40, condition: 'raw', soldAt: '2026-09-01' },
  { title: 'raw 2', price: 60, condition: 'raw', soldAt: '2026-09-02' },
  { title: 'slab', price: 200, condition: 'PSA 10', soldAt: '2026-09-03' },
  { title: 'slab 2', price: 240, condition: 'PSA 10', soldAt: '2026-09-04' },
];

function target(overrides: Partial<TargetWatchlist> = {}): TargetWatchlist {
  return {
    id: 'tatum',
    player: 'Jayson Tatum',
    cardDescription: '2024 Prizm',
    priority: 'High',
    targetPrice: 200,
    currentMarketPrice: 80,
    sport: 'Basketball',
    league: 'NBA',
    status: 'active',
    createdAt: '2026-01-01',
    ...overrides,
  };
}

describe('grade-aware watchlist alerts', () => {
  it('keeps an ungraded target on the local mark', () => {
    expect(GRADE_ALERT_NOTE).toMatch(/mixed mark/i);
    expect(watchlistAlertMark(target())).toEqual({ usd: 80, kind: 'market', label: 'Local mark' });
    expect(watchlistAlertMark(target({ currentMarketPrice: 0 }))).toBeNull();
    expect(watchlistAlertMark(target({ currentMarketPrice: undefined, cardDescription: undefined }))).toBeNull();
    const rows = priceDropRows([
      target({ salesData: sales }),
      target({ id: 'gone', status: 'acquired' }),
      target({ id: 'zero', targetPrice: 0 }),
      target({ id: 'blank', player: ' ', cardDescription: ' ', currentMarketPrice: 10, targetPrice: 100 }),
    ]);
    expect(rows.find((row) => row.id === 'drop:tatum')?.detail).toMatch(/Local mark \$80 is 60% under your \$200 target/);
    expect(rows.find((row) => row.id === 'drop:blank')?.title).toBe('Watchlist card under target');
    expect(rows.find((row) => row.id === 'drop:blank')?.detail).toMatch(/Watchlist row/);
  });

  it('alerts a named grade on that band and stays quiet when the band is missing', () => {
    const slab = target({
      id: 'slab',
      player: 'Aaron Judge',
      cardDescription: '2017 Update PSA 10',
      targetPrice: 300,
      currentMarketPrice: 40,
      salesData: sales,
    });
    expect(watchlistAlertMark(slab)).toEqual({
      usd: 220,
      kind: 'band',
      label: 'PSA 10 sold comps median',
    });
    expect(priceDropRows([slab])[0]?.detail).toMatch(/PSA 10 sold comps median \$220 is 26.7% under your \$300 target/);
    expect(priceDropRows([slab])[0]?.detail).not.toMatch(/\$40/);

    expect(priceDropRows([target({
      id: 'close',
      cardDescription: 'PSA 10',
      targetPrice: 230,
      currentMarketPrice: 40,
      salesData: sales,
    })]).some((row) => row.id === 'drop:close')).toBe(false);

    expect(priceDropRows([target({
      id: 'over',
      cardDescription: 'PSA 10',
      targetPrice: 200,
      currentMarketPrice: 40,
      salesData: sales,
    })]).some((row) => row.id === 'drop:over')).toBe(false);

    expect(watchlistAlertMark(target({
      cardDescription: 'BGS 9.5',
      currentMarketPrice: 40,
      salesData: sales,
    }))).toBeNull();
    expect(priceDropRows([target({
      id: 'missing',
      cardDescription: 'BGS 9.5',
      currentMarketPrice: 40,
      targetPrice: 200,
      salesData: sales,
    })])).toEqual([]);

    expect(watchlistAlertMark(target({
      cardDescription: 'PSA 10',
      currentMarketPrice: 40,
      salesData: undefined,
    }))).toBeNull();

    const rawOnly = [
      { title: 'a', price: 200, condition: 'PSA 10', soldAt: '2026-09-01' },
      { title: 'b', price: 240, condition: 'PSA 10', soldAt: '2026-09-02' },
    ];
    expect(watchlistAlertMark(target({
      cardDescription: '2018 Chrome PSA 10',
      currentMarketPrice: 40,
      salesData: rawOnly,
    }))?.usd).toBe(220);

    expect(watchlistAlertMark(target({
      cardDescription: 'raw',
      currentMarketPrice: 200,
      targetPrice: 80,
      salesData: sales,
    }))).toMatchObject({ usd: 50, label: 'Raw sold comps median' });
    expect(priceDropRows([target({
      id: 'raw',
      player: 'Raw Card',
      cardDescription: 'raw',
      currentMarketPrice: 200,
      targetPrice: 80,
      salesData: sales,
    })])[0]?.detail).toMatch(/Raw sold comps median \$50 is 37.5% under your \$80 target/);
  });
});
