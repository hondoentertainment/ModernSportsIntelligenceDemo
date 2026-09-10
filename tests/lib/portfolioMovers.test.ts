import { afterEach, describe, expect, it } from 'vitest';
import {
  PORTFOLIO_MOVERS_DISCLOSURE,
  computeCardMover,
  listFavoriteMovers,
  listPortfolioMovers,
} from '../../lib/analytics/portfolioMovers';
import { clearPriceHistory, recordBatchSnapshots } from '../../lib/analytics/priceHistory';
import { makeCard } from '../helpers';
import type { MarketComp } from '../../types';

afterEach(() => {
  clearPriceHistory();
});

describe('portfolioMovers', () => {
  it('returns null for sold or unpriced cards', () => {
    expect(computeCardMover(makeCard({ status: 'sold', currentValue: 400 }))).toBeNull();
    expect(computeCardMover(makeCard({ currentValue: 0, purchasePrice: 0, salesData: [] }))).toBeNull();
  });

  it('marks thin movers when fewer than two snapshot/comp points exist', () => {
    const row = computeCardMover(makeCard({ id: 'thin', currentValue: 120 }));
    expect(row?.thin).toBe(true);
    expect(row?.direction).toBe('stable');
    expect(row?.source).toBe('thin');
  });

  it('ranks collection gainers and losers from stored snapshots', () => {
    recordBatchSnapshots([
      { id: 'up', value: 100, timestamp: '2026-08-01T00:00:00.000Z' },
      { id: 'up', value: 150, timestamp: '2026-09-01T00:00:00.000Z' },
      { id: 'down', value: 200, timestamp: '2026-08-01T00:00:00.000Z' },
      { id: 'down', value: 140, timestamp: '2026-09-01T00:00:00.000Z' },
    ]);
    const report = listPortfolioMovers([
      makeCard({ id: 'up', player: 'Gainer', currentValue: 150 }),
      makeCard({ id: 'down', player: 'Loser', currentValue: 140 }),
      makeCard({ id: 'sold', status: 'sold', currentValue: 900 }),
    ]);
    expect(report.disclosure).toBe(PORTFOLIO_MOVERS_DISCLOSURE);
    expect(report.gainers[0].player).toBe('Gainer');
    expect(report.gainers[0].changePct).toBe(50);
    expect(report.losers[0].player).toBe('Loser');
    expect(report.losers[0].changePct).toBe(-30);
    expect(report.emptyReason).toBeNull();
  });

  it('uses dated sold comps when snapshots are missing', () => {
    const sales: MarketComp[] = [
      { title: 'sold 1', price: 80, condition: 'raw', soldAt: '2026-07-01' },
      { title: 'sold 2', price: 100, condition: 'raw', soldAt: '2026-08-01' },
    ];
    const row = computeCardMover(makeCard({ id: 'comp', currentValue: 100, salesData: sales }));
    expect(row?.source).toBe('comps');
    expect(row?.thin).toBe(false);
    expect(row?.direction).toBe('up');
  });

  it('treats a sub-2% snapshot move as stable and ranks multiple gainers', () => {
    recordBatchSnapshots([
      { id: 'flat', value: 100, timestamp: '2026-08-01T00:00:00.000Z' },
      { id: 'flat', value: 101, timestamp: '2026-09-01T00:00:00.000Z' },
      { id: 'up1', value: 50, timestamp: '2026-08-01T00:00:00.000Z' },
      { id: 'up1', value: 80, timestamp: '2026-09-01T00:00:00.000Z' },
      { id: 'up2', value: 40, timestamp: '2026-08-01T00:00:00.000Z' },
      { id: 'up2', value: 48, timestamp: '2026-09-01T00:00:00.000Z' },
    ]);
    const report = listPortfolioMovers([
      makeCard({ id: 'flat', player: 'Flat', currentValue: 101 }),
      makeCard({ id: 'up1', player: 'Up One', currentValue: 80 }),
      makeCard({ id: 'up2', player: 'Up Two', currentValue: 48 }),
    ]);
    expect(report.stable[0].player).toBe('Flat');
    expect(report.gainers[0].changePct).toBeGreaterThan(report.gainers[1].changePct);
  });

  it('keeps favorites empty state honest', () => {
    const empty = listFavoriteMovers([makeCard({ id: 'x' })], []);
    expect(empty.emptyReason).toMatch(/no favorites/i);
    const thin = listFavoriteMovers([makeCard({ id: 'x', currentValue: 50 })], ['x']);
    expect(thin.emptyReason).toMatch(/not enough local snapshots/i);
    expect(listPortfolioMovers([]).emptyReason).toMatch(/no active holdings/i);
  });
});
