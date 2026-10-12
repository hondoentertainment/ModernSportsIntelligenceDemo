import { describe, expect, it } from 'vitest';
import type { DealLiteCandidate } from '../../lib/analytics/dealFinderLite';
import type { MoverRow } from '../../lib/analytics/portfolioMovers';
import type { ResolvedLocalCardShow } from '../../lib/shows/localCardShowCatalog';
import {
  BUY_AT_SHOW_SCORE,
  SHOW_BUYING_DESK_DISCLOSURE,
  TAPE_LABEL_DEMO,
  TAPE_LABEL_LIVE,
  assembleShowBuyingDesk,
  isCollectionGap,
  rankShowBuyingDesk,
} from '../../lib/shows/showBuyingDesk';
import { makeCard } from '../helpers';
import type { TargetWatchlist } from '../../types';

function show(overrides: Partial<ResolvedLocalCardShow> = {}): ResolvedLocalCardShow {
  return {
    id: 'show-nyc',
    name: 'Metro Card Meetup',
    venue: 'Hall A',
    address: '1 Main',
    city: 'New York',
    state: 'NY',
    lat: 40.7571,
    lng: -74.0023,
    month: 10,
    day: 18,
    durationDays: 1,
    admissionUsd: 5,
    vendorCount: 40,
    expectedAttendance: 800,
    sports: ['Baseball'],
    focusPlayers: ['Mike Trout'],
    tableStyle: 'mixed',
    notes: 'seed',
    startDate: '2026-10-18',
    endDate: '2026-10-18',
    status: 'upcoming',
    daysUntilStart: 6,
    source: 'seeded-public-calendar',
    ...overrides,
  };
}

function target(overrides: Partial<TargetWatchlist> = {}): TargetWatchlist {
  return {
    id: 't1',
    player: 'Mike Trout',
    cardDescription: '2011 Topps Update',
    priority: 'High',
    targetPrice: 500,
    currentMarketPrice: 400,
    sport: 'Baseball',
    league: 'MLB',
    status: 'active',
    createdAt: '2026-01-01',
    ...overrides,
  };
}

function mover(overrides: Partial<MoverRow> = {}): MoverRow {
  return {
    cardId: 'c1',
    player: 'Mike Trout',
    year: 2011,
    set: 'Update',
    from: 100,
    to: 80,
    changeAbs: -20,
    changePct: -20,
    direction: 'down',
    source: 'snapshots',
    thin: false,
    ...overrides,
  };
}

function deal(overrides: Partial<DealLiteCandidate> = {}): DealLiteCandidate {
  return {
    id: 'deal-1',
    kind: 'target',
    player: 'Mike Trout',
    detail: '2011 Update',
    askPrice: 300,
    consensusMark: 500,
    breakEvenPrice: null,
    discountPct: 40,
    belowConsensus: true,
    belowBreakEven: false,
    greatDeal: true,
    thinTape: true,
    rationale: 'Ask is 40.0% below local consensus.',
    ...overrides,
  };
}

const nycGeo = { lat: 40.76, lng: -73.99 };

describe('showBuyingDesk', () => {
  it('treats a missing year as a gap and a held copy as not a gap', () => {
    const held = [makeCard({ player: 'Mike Trout', year: 2011, sport: 'Baseball' })];
    expect(isCollectionGap(target(), held)).toBe(false);
    expect(isCollectionGap(target({ cardDescription: '2018 Topps Chrome' }), held)).toBe(true);
    expect(isCollectionGap(target(), [])).toBe(true);
    expect(isCollectionGap(target({ status: 'acquired' }), [])).toBe(false);
  });

  it('ranks a nearby matching show ahead of a far one and hides distance without geo', () => {
    const gap = target();
    const near = show();
    const far = show({
      id: 'show-dal',
      name: 'Dallas Room',
      city: 'Dallas',
      state: 'TX',
      lat: 32.774,
      lng: -96.801,
      venue: 'Dallas Hall',
    });
    const withGeo = rankShowBuyingDesk({
      shows: [far, near],
      inventory: [],
      targets: [gap],
      geo: nycGeo,
      liveTape: false,
    });
    expect(withGeo.shows[0].show.id).toBe('show-nyc');
    expect(withGeo.shows[0].geoStatus).toBe('nearby');
    expect(withGeo.shows[1].geoStatus).toBe('far');
    expect(withGeo.shows[0].verdict).toBe('buy-at-show');
    expect(withGeo.shows[0].worthAttendingScore).toBeGreaterThanOrEqual(BUY_AT_SHOW_SCORE);
    expect(withGeo.shows[0].opportunities.some((row) => row.kind === 'collection-gap')).toBe(true);
    expect(withGeo.geoStatus).toBe('provided');

    const noGeo = rankShowBuyingDesk({
      shows: [far, near],
      inventory: [],
      targets: [gap],
      geo: null,
      liveTape: false,
    });
    expect(noGeo.geoStatus).toBe('unavailable');
    expect(noGeo.shows.every((row) => row.distanceMiles == null && row.geoStatus === 'unknown')).toBe(true);
    expect(noGeo.shows[0].reasons.join(' ')).toMatch(/distance unknown/i);
    expect(noGeo.headline?.opportunities[0].tapeLabel).toBe(TAPE_LABEL_DEMO);
    expect(noGeo.headline?.opportunities[0].why).toMatch(/not a live eBay/i);
    expect(noGeo.disclosure).toMatch(/not live Market Movers/i);
  });

  it('attaches deal-finder buys and keeps live comps off unless the caller opts in', () => {
    const report = rankShowBuyingDesk({
      shows: [show()],
      inventory: [],
      targets: [target()],
      deals: [deal()],
      liveTape: false,
    });
    const kinds = report.shows[0].opportunities.map((row) => row.kind);
    expect(kinds).toContain('deal-finder');
    expect(report.shows[0].opportunities.every((row) => row.tapeLabel === TAPE_LABEL_DEMO)).toBe(true);
    expect(SHOW_BUYING_DESK_DISCLOSURE).toMatch(/Seeded public-style calendar/);

    const live = rankShowBuyingDesk({
      shows: [show()],
      inventory: [makeCard({ id: 'c1', player: 'Mike Trout', year: 2009, sport: 'Baseball' })],
      targets: [target()],
      deals: [deal()],
      liveTape: true,
    });
    const priced = live.shows[0].opportunities.find((row) => row.kind === 'deal-finder');
    expect(priced?.tapeLabel).toBe(TAPE_LABEL_LIVE);
    expect(priced?.compsHref).toBe('/compare?card1=c1');
    expect(priced?.why).not.toMatch(/Market Movers print/);
  });

  it('surfaces mover dips, sell-into-room, and a lot when two cards are up', () => {
    const trout = makeCard({ id: 'c1', player: 'Mike Trout', year: 2011, set: 'Update', sport: 'Baseball' });
    const judge = makeCard({ id: 'c2', player: 'Aaron Judge', year: 2017, set: 'Chrome', sport: 'Baseball' });
    const dip = rankShowBuyingDesk({
      shows: [show({ focusPlayers: [] })],
      inventory: [trout],
      targets: [target()],
      losers: [mover()],
      liveTape: false,
    });
    expect(dip.shows[0].opportunities.some((row) => row.kind === 'mover-dip')).toBe(true);
    expect(dip.shows[0].opportunities.some((row) => row.kind === 'collection-gap')).toBe(false);

    const sell = rankShowBuyingDesk({
      shows: [show({ focusPlayers: [], daysUntilStart: 200 })],
      inventory: [trout, judge],
      gainers: [
        mover({ cardId: 'c1', player: 'Mike Trout', changePct: 12, direction: 'up', to: 140, from: 125, changeAbs: 15 }),
        mover({ cardId: 'c2', player: 'Aaron Judge', year: 2017, set: 'Chrome', changePct: 15, direction: 'up', to: 200, from: 174, changeAbs: 26 }),
      ],
      showBagItems: [
        { id: 'review:c1', label: '2011 Mike Trout · Update', section: 'review', packed: true },
        { id: 'consign:c2', label: '2017 Aaron Judge · Chrome', section: 'consign', packed: true },
      ],
      liveTape: false,
    });
    const sellKinds = sell.shows[0].opportunities.map((row) => row.kind);
    expect(sellKinds).toContain('sell-into-room');
    expect(sellKinds).toContain('lot-negotiate');
    expect(sell.shows[0].verdict).toBe('sell-into-show');
    expect(sell.shows[0].opportunities.find((row) => row.kind === 'lot-negotiate')?.showBagHref).toBe('/card-show-mode');
  });

  it('ignores a sport the show does not cover and explains an empty filter', () => {
    const football = rankShowBuyingDesk({
      shows: [show({ sports: ['Football'], focusPlayers: ['Patrick Mahomes'] })],
      inventory: [],
      targets: [target()],
      deals: [deal()],
      liveTape: false,
    });
    expect(football.shows[0].opportunities).toEqual([]);
    expect(football.shows[0].verdict).not.toBe('buy-at-show');

    const empty = rankShowBuyingDesk({
      shows: [show()],
      inventory: [],
      cityQuery: 'zzzz-no-city',
      liveTape: false,
    });
    expect(empty.shows).toEqual([]);
    expect(empty.emptyReason).toMatch(/no seeded shows match/i);
  });

  it('still lists the seeded calendar when the book is empty', () => {
    const report = assembleShowBuyingDesk({
      inventory: [],
      targets: [],
      liveTape: false,
      now: new Date(Date.UTC(2026, 9, 12)),
    });
    expect(report.shows.length).toBeGreaterThanOrEqual(12);
    expect(report.shows[0].show.id).toBe('nyc-monthly');
    expect(report.catalogSource).toBe('seeded-public-calendar');
    expect(report.tapeLabel).toBe(TAPE_LABEL_DEMO);
    expect(report.opportunityCount).toBe(0);
  });
});
