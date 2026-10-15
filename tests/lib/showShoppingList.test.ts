import { describe, expect, it } from 'vitest';
import type { MarketComp, TargetWatchlist } from '../../types';
import type { ResolvedLocalCardShow } from '../../lib/shows/localCardShowCatalog';
import {
  SHOW_SHOPPING_LIST_DISCLOSURE,
  buildShowShoppingList,
  shopLineLabel,
} from '../../lib/shows/showShoppingList';
import { makeCard } from '../helpers';
import { buildShoppingBuyDraft } from '../../lib/shows/showShoppingIngest';

const NOW = Date.parse('2026-10-13T00:00:00Z');

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
    sports: ['Baseball', 'Basketball'],
    focusPlayers: ['Jayson Tatum'],
    tableStyle: 'mixed',
    notes: 'seed',
    startDate: '2026-10-18',
    endDate: '2026-10-18',
    status: 'upcoming',
    daysUntilStart: 5,
    source: 'seeded-public-calendar',
    ...overrides,
  };
}

function target(overrides: Partial<TargetWatchlist> = {}): TargetWatchlist {
  return {
    id: 't-tatum',
    player: 'Jayson Tatum',
    cardDescription: '2024 Prizm',
    priority: 'High',
    targetPrice: 200,
    currentMarketPrice: 180,
    sport: 'Basketball',
    league: 'NBA',
    status: 'active',
    createdAt: '2026-01-01',
    ...overrides,
  };
}

function comp(price: number, soldAt = '2026-09-01T00:00:00.000Z'): MarketComp {
  return { title: `sold ${price}`, price, condition: 'raw', soldAt };
}

describe('buildShowShoppingList', () => {
  it('prices a collection gap at the lower of sold-comp consensus and the collector target', () => {
    const list = buildShowShoppingList({
      show: show(),
      inventory: [],
      targets: [target({
        targetPrice: 200,
        currentMarketPrice: 90,
        salesData: [comp(120), comp(130), comp(140)],
      })],
      nowMs: NOW,
    });
    expect(list.emptyReason).toBeNull();
    expect(list.buys).toHaveLength(1);
    expect(list.buys[0]).toMatchObject({
      kind: 'collection-gap',
      side: 'buy',
      player: 'Jayson Tatum',
      targetBuyUsd: 130,
      marketMarkUsd: 130,
      collectorCeilingUsd: 200,
      targetId: 't-tatum',
    });
    expect(list.buys[0].priceSource).toMatch(/sold-comp consensus/i);
    expect(list.buys[0].why).toMatch(/this room highlights that name/i);
    expect(list.buys[0].why).toMatch(/local \/ demo tape/i);
    expect(list.sells).toEqual([]);
    expect(list.disclosure).toBe(SHOW_SHOPPING_LIST_DISCLOSURE);
    expect(list.disclosure).toMatch(/not live Market Movers/i);
    expect(shopLineLabel('collection-gap')).toBe('Collection gap');
  });

  it('uses the collector target when it is under the local mark, and the mark alone when there is no ceiling', () => {
    const under = buildShowShoppingList({
      show: show({ focusPlayers: [] }),
      inventory: [],
      targets: [target({ targetPrice: 100, currentMarketPrice: 180, salesData: undefined })],
      nowMs: NOW,
    });
    expect(under.buys[0].targetBuyUsd).toBe(100);
    expect(under.buys[0].priceSource).toMatch(/collector target is under/i);
    expect(under.buys[0].why).not.toMatch(/highlights that name/i);

    const markOnly = buildShowShoppingList({
      show: show(),
      inventory: [],
      targets: [target({
        id: 'mark-only',
        targetPrice: 0,
        currentMarketPrice: 0,
        salesData: [comp(80)],
      })],
      nowMs: NOW,
    });
    expect(markOnly.buys[0].targetBuyUsd).toBe(80);
    expect(markOnly.buys[0].collectorCeilingUsd).toBeNull();
    expect(markOnly.buys[0].priceSource).toMatch(/thin sold comps/i);

    const ceilingOnly = buildShowShoppingList({
      show: show(),
      inventory: [],
      targets: [target({ id: 'ceiling', targetPrice: 75, currentMarketPrice: undefined, salesData: undefined })],
      nowMs: NOW,
    });
    expect(ceilingOnly.buys[0]).toMatchObject({
      targetBuyUsd: 75,
      marketMarkUsd: null,
      priceSource: 'Collector target',
    });
  });

  it('skips inactive rows, blank names, and sports the show does not cover', () => {
    const list = buildShowShoppingList({
      show: show(),
      inventory: [],
      targets: [
        target({ id: 'sold-target', status: 'acquired' }),
        target({ id: 'blank', player: '   ' }),
        target({ id: 'football', player: 'Patrick Mahomes', sport: 'Football', league: 'NFL', cardDescription: '2020 Prizm' }),
      ],
      nowMs: NOW,
    });
    expect(list.buys).toEqual([]);
    expect(list.emptyReason).toMatch(/no active watchlist/i);
  });

  it('keeps a watchlist row that is already in the book and sorts gaps first', () => {
    const inventory = [
      makeCard({
        id: 'trout-held',
        player: 'Mike Trout',
        year: 2011,
        manufacturer: 'Topps',
        set: 'Update',
        cardNumber: 'US175',
        sport: 'Baseball',
        currentValue: 400,
      }),
    ];
    const list = buildShowShoppingList({
      show: show({ focusPlayers: [] }),
      inventory,
      targets: [
        target({
          id: 'held',
          player: 'Mike Trout',
          cardDescription: '2011 Topps Update',
          priority: 'Low',
          sport: 'Baseball',
          league: 'MLB',
          targetPrice: 350,
          currentMarketPrice: 400,
        }),
        target({ id: 'gap', priority: 'Medium', targetPrice: 90, currentMarketPrice: 80 }),
      ],
      liveTape: true,
      nowMs: NOW,
    });
    expect(list.tapeLabel).toBe('Live comps');
    expect(list.buys.map((row) => row.id)).toEqual([
      'show-nyc:buy:gap',
      'show-nyc:buy:held',
    ]);
    expect(list.buys[1].kind).toBe('watchlist');
    expect(list.buys[1].why).toMatch(/already in the book/i);
    expect(list.buys[1].why).toMatch(/live comps flag is on/i);
    expect(shopLineLabel('watchlist')).toBe('Watchlist');
  });

  it('offers duplicate extras and turns them into trades when the same player is a buy', () => {
    const inventory = [
      makeCard({
        id: 'raw',
        player: 'Mike Trout',
        year: 2011,
        manufacturer: 'Topps',
        set: 'Update',
        cardNumber: 'US175',
        sport: 'Baseball',
        isGraded: false,
        currentValue: 100,
      }),
      makeCard({
        id: 'slab',
        player: 'Mike Trout',
        year: 2011,
        manufacturer: 'Topps',
        set: 'Update',
        cardNumber: 'US175',
        sport: 'Baseball',
        isGraded: true,
        gradingCompany: 'PSA',
        grade: '10',
        currentValue: 100,
      }),
      makeCard({
        id: 'sold-copy',
        player: 'Mike Trout',
        year: 2011,
        manufacturer: 'Topps',
        set: 'Update',
        cardNumber: 'US175',
        sport: 'Baseball',
        status: 'sold',
        currentValue: 999,
      }),
      makeCard({
        id: 'consigned',
        player: 'Aaron Judge',
        year: 2017,
        manufacturer: 'Topps',
        set: 'Chrome',
        cardNumber: '1',
        sport: 'Baseball',
        status: 'consignment',
        currentValue: 50,
      }),
      makeCard({
        id: 'judge-home',
        player: 'Aaron Judge',
        year: 2017,
        manufacturer: 'Topps',
        set: 'Chrome',
        cardNumber: '1',
        sport: 'Baseball',
        currentValue: 40,
      }),
      makeCard({
        id: 'other-number',
        player: 'Mike Trout',
        year: 2011,
        manufacturer: 'Topps',
        set: 'Update',
        cardNumber: 'US176',
        sport: 'Baseball',
        currentValue: 20,
      }),
    ];
    const list = buildShowShoppingList({
      show: show({ focusPlayers: [] }),
      inventory,
      targets: [target({
        id: 'trout-gap',
        player: 'Mike Trout',
        cardDescription: '2019 Bowman',
        sport: 'Baseball',
        league: 'MLB',
        targetPrice: 50,
        currentMarketPrice: 40,
      })],
      nowMs: NOW,
    });
    expect(list.sells.map((row) => row.cardId)).toEqual(['raw', 'judge-home']);
    expect(list.sells[0]).toMatchObject({
      kind: 'duplicate-trade',
      side: 'sell',
      copies: 2,
      extraCopies: 1,
      targetBuyUsd: 100,
    });
    expect(list.sells[0].why).toMatch(/PSA 10/i);
    expect(list.sells[0].why).toMatch(/buy list/i);
    expect(list.sells[1]).toMatchObject({ kind: 'duplicate-sell', cardId: 'judge-home' });
    expect(shopLineLabel('duplicate-trade')).toBe('Trade duplicate');
    expect(list.sells.some((row) => row.cardId === 'slab' || row.cardId === 'sold-copy' || row.cardId === 'consigned')).toBe(false);
  });

  it('sells an extra when nothing on the buy list matches, and skips a sport the show does not cover', () => {
    const baseball = buildShowShoppingList({
      show: show({ sports: ['Baseball'], focusPlayers: [] }),
      inventory: [
        makeCard({ id: 'a', player: 'Shohei Ohtani', year: 2018, set: 'Update', cardNumber: '1', currentValue: 30 }),
        makeCard({ id: 'b', player: 'Shohei Ohtani', year: 2018, set: 'Update', cardNumber: '1', currentValue: 80 }),
        makeCard({
          id: 'hoop-a',
          player: 'Jayson Tatum',
          year: 2018,
          set: 'Prizm',
          cardNumber: '2',
          sport: 'Basketball',
          league: 'NBA',
          currentValue: 70,
        }),
        makeCard({
          id: 'hoop-b',
          player: 'Jayson Tatum',
          year: 2018,
          set: 'Prizm',
          cardNumber: '2',
          sport: 'Basketball',
          league: 'NBA',
          currentValue: 60,
        }),
      ],
      targets: [],
      nowMs: NOW,
    });
    expect(baseball.sells).toHaveLength(1);
    expect(baseball.sells[0]).toMatchObject({ cardId: 'a', kind: 'duplicate-sell', targetBuyUsd: 30 });
    expect(baseball.sells[0].why).toMatch(/keep the higher local mark/i);
    expect(shopLineLabel('duplicate-sell')).toBe('Sell duplicate');
    expect(shopLineLabel('set-hole')).toBe('Set hole');

    const unpriced = buildShowShoppingList({
      show: show({ sports: ['Baseball'], focusPlayers: [] }),
      inventory: [
        makeCard({ id: 'c1', player: 'No Mark', currentValue: 0, year: 2020, set: 'Chrome', cardNumber: '9' }),
        makeCard({ id: 'c2', player: 'No Mark', currentValue: 0, year: 2020, set: 'Chrome', cardNumber: '9' }),
      ],
      targets: [],
      nowMs: NOW,
    });
    expect(unpriced.sells[0].targetBuyUsd).toBeNull();
    expect(unpriced.sells[0].priceSource).toMatch(/no local mark/i);

    const none = buildShowShoppingList({
      show: show(),
      inventory: [],
      targets: [],
      nowMs: NOW,
    });
    expect(none.emptyReason).toMatch(/no active watchlist/i);
  });

  it('sorts equal-priority buys by name and equal-mark sells by player', () => {
    const list = buildShowShoppingList({
      show: show({ sports: ['Baseball'], focusPlayers: [] }),
      inventory: [
        makeCard({ id: 'only', player: 'Solo Player', year: 2020, set: 'Chrome', cardNumber: '1', currentValue: 10 }),
        makeCard({ id: 'j1a', player: 'Aaron Judge', year: 2017, set: 'Chrome', cardNumber: '1', currentValue: 40 }),
        makeCard({ id: 'j1b', player: 'Aaron Judge', year: 2017, set: 'Chrome', cardNumber: '1', currentValue: 40 }),
        makeCard({ id: 'j2a', player: 'Aaron Judge', year: 2018, set: 'Update', cardNumber: '2', currentValue: 40 }),
        makeCard({ id: 'j2b', player: 'Aaron Judge', year: 2018, set: 'Update', cardNumber: '2', currentValue: 40 }),
        makeCard({ id: 'oa', player: 'Shohei Ohtani', year: 2018, set: 'Update', cardNumber: '9', currentValue: 90 }),
        makeCard({ id: 'ob', player: 'Shohei Ohtani', year: 2018, set: 'Update', cardNumber: '9', currentValue: 50 }),
      ],
      targets: [
        target({ id: 'harper-late', player: 'Bryce Harper', cardDescription: '2022 Chrome', priority: 'Low', sport: 'Baseball', league: 'MLB', targetPrice: 20, currentMarketPrice: 10 }),
        target({ id: 'harper-early', player: 'Bryce Harper', cardDescription: '2018 Update', priority: 'Low', sport: 'Baseball', league: 'MLB', targetPrice: 20, currentMarketPrice: 10 }),
        target({ id: 'judge-gap', player: 'Aaron Judge', cardDescription: '2024 Prizm', priority: 'Low', sport: 'Baseball', league: 'MLB', targetPrice: 20, currentMarketPrice: 10 }),
      ],
      nowMs: NOW,
    });
    expect(list.buys.map((row) => row.id)).toEqual([
      'show-nyc:buy:judge-gap',
      'show-nyc:buy:harper-early',
      'show-nyc:buy:harper-late',
    ]);
    expect(list.sells.map((row) => row.cardId)).toEqual(['j1b', 'j2b', 'ob']);
  });

  it('adds demo checklist holes and turns a same-player extra into a trade', () => {
    const list = buildShowShoppingList({
      show: show({ sports: ['Baseball'], focusPlayers: ['Juan Soto'] }),
      inventory: [
        makeCard({ id: 'judge', player: 'Aaron Judge', year: 2024, manufacturer: 'Topps', set: 'Series 1', cardNumber: '1', sport: 'Baseball', currentValue: 20 }),
        makeCard({ id: 'soto-a', player: 'Juan Soto', year: 2019, manufacturer: 'Topps', set: 'Chrome', cardNumber: '9', sport: 'Baseball', currentValue: 40 }),
        makeCard({ id: 'soto-b', player: 'Juan Soto', year: 2019, manufacturer: 'Topps', set: 'Chrome', cardNumber: '9', sport: 'Baseball', currentValue: 30 }),
      ],
      targets: [target({ id: 'alonso', player: 'Pete Alonso', cardDescription: '2024 Topps Series 1 #120', sport: 'Baseball', league: 'MLB', targetPrice: 12 })],
      nowMs: NOW,
    });
    const holes = list.buys.filter((row) => row.kind === 'set-hole');
    expect(holes.map((row) => row.player)).toEqual(['Juan Soto', 'Paul Skenes']);
    expect(holes[0]).toMatchObject({
      targetBuyUsd: 4,
      marketMarkUsd: null,
      priceSource: 'Demo checklist estimate',
    });
    expect(holes[0].why).toMatch(/this room highlights that name/i);
    expect(holes[0].why).toMatch(/demo checklist/i);
    expect(list.buys.some((row) => row.player === 'Pete Alonso' && row.kind === 'set-hole')).toBe(false);
    expect(list.sells[0]).toMatchObject({ player: 'Juan Soto', kind: 'duplicate-trade' });
    const draft = buildShoppingBuyDraft({
      line: holes[0],
      paidUsd: 4,
      showName: 'Metro Card Meetup',
      purchaseDate: '2026-10-18',
    });
    expect(draft).toMatchObject({ player: 'Juan Soto', year: 2024, manufacturer: 'Topps', set: 'Series 1', cardNumber: '15', purchasePrice: 4, taxBasis: 4 });
    expect(draft?.currentValue).toBeUndefined();
  });
});
