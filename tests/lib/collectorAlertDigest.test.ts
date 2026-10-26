import { beforeEach, describe, expect, it } from 'vitest';
import type { TargetWatchlist } from '../../types';
import { store } from '../../lib/dal/syncStore';
import { SHOW_ALERT_PREFS_KEY, setShowAlertPrefs } from '../../lib/shows/showAlerts';
import type { ResolvedLocalCardShow } from '../../lib/shows/localCardShowCatalog';
import {
  MIN_PRICE_DROP,
  buildCollectorAlertDigest,
  loadCollectorAlertDigest,
  priceDropRows,
  readDigestTargets,
  showProximityRows,
} from '../../lib/alerts/collectorAlertDigest';
import { addHaggle } from '../../lib/shows/showHaggleLog';

function target(overrides: Partial<TargetWatchlist> = {}): TargetWatchlist {
  return {
    id: 'tatum',
    player: 'Jayson Tatum',
    cardDescription: '2024 Prizm Silver',
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

function show(overrides: Partial<ResolvedLocalCardShow> = {}): ResolvedLocalCardShow {
  return {
    id: 'nyc-monthly',
    name: 'NYC Monthly Card Meetup',
    venue: 'Hall',
    address: '1 Main',
    city: 'New York',
    state: 'NY',
    lat: 40.7571,
    lng: -74.0023,
    month: 10,
    day: 18,
    durationDays: 1,
    admissionUsd: 5,
    vendorCount: 10,
    expectedAttendance: 100,
    sports: ['Basketball'],
    focusPlayers: [],
    tableStyle: 'singles',
    notes: '',
    startDate: '2026-10-18',
    endDate: '2026-10-18',
    status: 'upcoming',
    daysUntilStart: 4,
    source: 'seeded-public-calendar',
    ...overrides,
  };
}

const home = { label: 'New York, NY', lat: 40.7571, lng: -74.0023 };

beforeEach(() => {
  store.remove(SHOW_ALERT_PREFS_KEY);
});

describe('collector alert digest', () => {
  it('keeps marks at least 5% under target and drops the rest', () => {
    expect(MIN_PRICE_DROP).toBe(0.05);
    const rows = priceDropRows([
      target(),
      target({ id: 'thin', player: 'Thin Tape', currentMarketPrice: 196, targetPrice: 200 }),
      target({ id: 'over', player: 'Over', currentMarketPrice: 250 }),
      target({ id: 'sold', status: 'acquired', player: 'Gone' }),
      target({ id: 'blank', currentMarketPrice: undefined }),
      target({ id: 'odd', player: 'Odd', currentMarketPrice: 90, targetPrice: 100, cardDescription: '' }),
    ]);
    expect(rows.map((row) => row.id)).toEqual(['drop:tatum', 'drop:odd']);
    expect(rows[0].title).toBe('Jayson Tatum under target');
    expect(rows[0].detail).toMatch(/\$80 is 60% under your \$200 target/);
    expect(rows[1].detail).toMatch(/10% under your \$100 target/);
    expect(rows[1].detail).toMatch(/Watchlist row/);
    expect(readDigestTargets(null)).toEqual([]);
    expect(readDigestTargets([{ id: 1 }, target({ player: 'Kept' })])).toHaveLength(1);
  });

  it('lists seeded shows only when a home radius is armed', () => {
    const prefs = {
      enabled: true,
      home,
      radiusMiles: 40,
      leadDays: 30,
    };
    const far = show({ id: 'far', name: 'Far Show', lat: 0, lng: 0, daysUntilStart: 3 });
    const late = show({ id: 'late', name: 'Late Show', daysUntilStart: 40 });
    expect(showProximityRows([show(), far, late], prefs).map((row) => row.title)).toEqual(['NYC Monthly Card Meetup']);
    expect(showProximityRows([show({ daysUntilStart: 0, status: 'in-progress' })], prefs)[0].detail).toMatch(/Open now/);

    const off = buildCollectorAlertDigest({
      targets: [target()],
      shows: [show()],
      prefs: { ...prefs, enabled: false },
    });
    expect(off.showAlertsArmed).toBe(false);
    expect(off.shows).toEqual([]);
    expect(off.drops).toHaveLength(1);
    expect(off.ranges.length).toBeGreaterThan(0);
    expect(off.ranges[0]?.title).toMatch(/Jayson Tatum is over the high/);
    expect(off.ranges[0]?.detail).toMatch(/demo sales/);
    expect(off.ranges[0]?.detail).toMatch(/Open \$/);
    expect(off.ranges[0]?.detail).toMatch(/walk \$/);
    expect(off.ranges[0]?.detail).not.toMatch(/Walk is the target/);
    expect(off.disclosure).toMatch(/owner-held VAPID/i);

    const noHome = buildCollectorAlertDigest({
      targets: [],
      shows: [show()],
      prefs: { ...prefs, home: null },
    });
    expect(noHome.showAlertsArmed).toBe(false);
  });

  it('loads targets from the book and show prefs from this browser', () => {
    setShowAlertPrefs({ enabled: true, home, radiusMiles: 50, leadDays: 366 });
    const digest = loadCollectorAlertDigest([target()], new Date('2026-10-14T12:00:00.000Z'));
    expect(digest.drops[0]?.title).toMatch(/Jayson Tatum/);
    expect(digest.showAlertsArmed).toBe(true);
    expect(digest.shows.some((row) => row.title === 'NYC Monthly Card Meetup')).toBe(true);
    expect(digest.follows).toEqual([]);
  });

  it('adds open notes and a cheap pass from this browser', () => {
    addHaggle({
      showId: 'nyc-monthly',
      dealer: 'Rivera',
      table: '4',
      askUsd: 12,
      offerUsd: 0,
      result: 'open',
      note: '',
      player: 'Showclose Player',
    });
    addHaggle({
      showId: 'nyc-monthly',
      dealer: 'Ace',
      table: '2',
      askUsd: 40,
      offerUsd: 0,
      result: 'passed',
      note: '',
      player: 'Showclose Player',
      cardId: 'slab',
    });
    const digest = loadCollectorAlertDigest(
      [target({ id: 'showclose', player: 'Showclose Player', targetPrice: 100, currentMarketPrice: undefined, cardDescription: 'other' })],
      new Date('2026-10-16T12:00:00.000Z'),
      [
        null,
        { id: 'bad' },
        { id: 'out', player: 'Out', status: 'consignment', currentValue: 10 },
        { id: 'empty', player: 'Empty', status: 'active' },
        {
          id: 'slab',
          player: 'Showclose Player',
          status: 'active',
          salesData: [
            { price: 100, soldAt: '2026-09-01' },
            { price: 120, soldAt: '2026-09-02' },
          ],
        },
      ],
    );
    expect(digest.follows.some(row => row.title === 'Open at NYC Monthly Card Meetup')).toBe(true);
    expect(digest.follows.some(row => row.kind === 'revisit' && row.watch)).toBe(true);
  });
});
