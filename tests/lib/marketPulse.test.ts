import { afterEach, describe, expect, it } from 'vitest';
import { computeMarketPulse, eraBucket, isSealedLike, MARKET_PULSE_DISCLOSURE } from '../../lib/analytics/marketPulse';
import { bandForHobbyScore } from '../../lib/utils/hobbyHealthIndex';
import { clearPriceHistory, recordBatchSnapshots } from '../../lib/analytics/priceHistory';
import { makeCard } from '../helpers';

afterEach(() => {
  clearPriceHistory();
});

describe('marketPulse', () => {
  it('classifies era and sealed wax proxies', () => {
    expect(eraBucket(1952)).toBe('vintage');
    expect(eraBucket(1991)).toBe('junk');
    expect(eraBucket(2023)).toBe('modern');
    expect(isSealedLike(makeCard({ set: 'Hobby Box', notes: 'sealed wax' }))).toBe(true);
    expect(isSealedLike(makeCard({ set: 'Chrome' }))).toBe(false);
  });

  it('is deterministic and discloses seeded multi-segment Pulse', () => {
    const inventory = [
      makeCard({ id: 'mlb', sport: 'Baseball', league: 'MLB', year: 2018, currentValue: 400 }),
      makeCard({ id: 'nba', sport: 'Basketball', league: 'NBA', year: 1998, currentValue: 200 }),
      makeCard({ id: 'wax', sport: 'Baseball', year: 2024, set: 'Hobby Box', currentValue: 150 }),
      makeCard({ id: 'sold', status: 'sold', currentValue: 9000 }),
    ];
    const a = computeMarketPulse({
      inventory,
      seed: 42,
      asOf: '2026-09-10T00:00:00.000Z',
    });
    const b = computeMarketPulse({
      inventory,
      seed: 42,
      asOf: '2026-09-10T00:00:00.000Z',
    });
    expect(a.headline.score).toBe(b.headline.score);
    expect(a.disclosure).toBe(MARKET_PULSE_DISCLOSURE);
    expect(a.segments).toHaveLength(10);
    expect(a.segments.every((row) => row.band === bandForHobbyScore(row.score))).toBe(true);
    expect(a.segments.find((row) => row.id === 'format-sealed')?.cardCount).toBe(1);
    expect(a.segments.find((row) => row.id === 'era-vintage')?.cardCount).toBe(0);
    expect(a.segments.find((row) => row.id === 'era-vintage')?.thin).toBe(true);
  });

  it('nudges a segment with local snapshot movers when tape exists', () => {
    recordBatchSnapshots([
      { id: 'mlb', value: 100, timestamp: '2026-08-01T00:00:00.000Z' },
      { id: 'mlb', value: 130, timestamp: '2026-09-01T00:00:00.000Z' },
    ]);
    const report = computeMarketPulse({
      inventory: [makeCard({ id: 'mlb', sport: 'Baseball', currentValue: 130 })],
      seed: 7,
      asOf: '2026-09-10T00:00:00.000Z',
    });
    const baseball = report.segments.find((row) => row.id === 'sport-baseball');
    expect(baseball?.moverPct).toBe(30);
    expect(baseball?.thin).toBe(false);
  });

  it('still emits Pulse with an empty book', () => {
    const report = computeMarketPulse({ inventory: [], seed: 1, asOf: '2026-09-10T00:00:00.000Z' });
    expect(report.segments.every((row) => row.cardCount === 0)).toBe(true);
    expect(report.headline.disclosure).toMatch(/seeded/i);
    expect(computeMarketPulse().segments.length).toBe(10);
  });

  it('uses purchase-price NAV and ignores a zero first snapshot', () => {
    recordBatchSnapshots([
      { id: 'z', value: 0, timestamp: '2026-08-01T00:00:00.000Z' },
      { id: 'z', value: 80, timestamp: '2026-09-01T00:00:00.000Z' },
    ]);
    const report = computeMarketPulse({
      inventory: [makeCard({ id: 'z', currentValue: 0, purchasePrice: 75, sport: 'Hockey' })],
      seed: 3,
      asOf: '2026-09-10T00:00:00.000Z',
    });
    expect(report.segments.find((row) => row.id === 'sport-hockey')?.navSharePct).toBe(100);
    expect(report.segments.find((row) => row.id === 'sport-hockey')?.moverPct).toBeNull();
  });
});
