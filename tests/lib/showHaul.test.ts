import { describe, expect, it } from 'vitest';
import {
  HAUL_PLACE_NOTE,
  SHOW_HAUL_NOTE,
  haulPlaceIds,
  haulRowCopy,
  showHaul,
  weekHaul,
  type HaulBookCard,
  type HaulNote,
  type HaulRow,
} from '../../lib/collector/showHaul';
import type { SaleRange } from '../../lib/collector/saleRange';

const comps: SaleRange = { source: 'comps', low: 40, median: 80, high: 120, count: 3 };
const graded: SaleRange = { source: 'comps', low: 40, median: 80, high: 120, count: 2, band: 'PSA 10' };
const demo: SaleRange = { source: 'demo', low: 10, median: 20, high: 30, count: 6 };
const none: SaleRange = { source: 'none', low: null, median: null, high: null, count: 0 };
const NOW = Date.parse('2026-10-29T12:00:00.000Z');
const WEEK = 7 * 24 * 60 * 60 * 1000;

function card(overrides: Partial<HaulBookCard> = {}): HaulBookCard {
  return {
    id: 'held',
    player: 'Aaron Judge',
    year: 2023,
    manufacturer: 'Topps',
    set: 'Chrome',
    cardNumber: '1',
    status: 'active',
    purchasePrice: 40,
    currentValue: 90,
    ...overrides,
  };
}

function note(overrides: Partial<HaulNote> = {}): HaulNote {
  return {
    id: 'n1',
    result: 'bought',
    askUsd: 50,
    offerUsd: 40,
    player: 'Aaron Judge',
    cardId: 'judge',
    savedAt: new Date(NOW).toISOString(),
    ...overrides,
  };
}

function ranges(map: Record<string, SaleRange | null>) {
  return (id: string) => map[id] ?? null;
}

describe('show haul', () => {
  it('states the honest limit', () => {
    expect(SHOW_HAUL_NOTE).toMatch(/no watchlist target/i);
    expect(SHOW_HAUL_NOTE).toMatch(/not a settlement and not a live tape/i);
    expect(HAUL_PLACE_NOTE).toMatch(/not a warehouse/i);
  });

  it('leaves passes, opens, blank players, and unsplittable lots off the haul', () => {
    const haul = showHaul({
      notes: [
        note({ id: 'pass', result: 'passed' }),
        note({ id: 'open', result: 'open' }),
        note({ id: 'caps', result: 'Bought' }),
        note({ id: 'blank', player: '  ' }),
        note({ id: 'zero', player: 'Zero', offerUsd: 0, askUsd: 0 }),
        note({
          id: 'lot-gap',
          player: 'Lot',
          offerUsd: 20,
          lines: [
            { player: 'One', askUsd: 10 },
            { player: 'Two' },
          ],
        }),
      ],
      inventory: [],
      places: {},
      rangeForId: () => {
        throw new Error('no card');
      },
    });
    expect(haul.rows).toEqual([]);
    expect(haul.copy).toMatch(/No bought table note is on this haul/);
    expect(haul.copy).toMatch(/lot that cannot be split/);
    expect(haulPlaceIds(haul)).toEqual([]);
  });

  it('scores a single buy on the ladder and follows the filed copy', () => {
    const haul = showHaul({
      notes: [
        note({ id: 'a b', offerUsd: 40, player: '  Amy   Bee  ' }),
        note({ id: 'walk', player: 'Walk', offerUsd: 100, cardId: 'judge' }),
        note({ id: 'over', player: 'Over', offerUsd: 200, cardId: 'psa' }),
        note({ id: 'demo', player: 'Demo', offerUsd: 15, cardId: 'demo' }),
        note({ id: 'none', player: 'None', offerUsd: 12, cardId: 'missing' }),
        note({ id: 'empty', player: 'Empty', offerUsd: 11, cardId: '' }),
        note({ id: 'ask', player: 'Ask', offerUsd: 0, askUsd: 18, cardId: undefined }),
        note({ id: 'neg', player: 'Neg', offerUsd: Number.NaN, askUsd: 16, cardId: undefined }),
      ],
      inventory: [
        card({ id: 'floor:ab', player: 'Amy Bee', currentValue: 90, purchasePrice: 40 }),
        card({ id: 'other', player: 'Amy Bee', currentValue: 10 }),
        card({ id: 'floor:walk', player: 'Walk', currentValue: 0, purchasePrice: 100 }),
        card({ id: 'floor:over', player: 'Over', status: 'sold', currentValue: 10 }),
        card({ id: 'peer', player: 'Over', status: 'active' }),
        card({ id: 'floor:demo', player: 'Demo', status: 'consignment', currentValue: Number.NaN, purchasePrice: 15 }),
        card({ id: 'floor:ask', player: 'Ask', status: undefined, currentValue: undefined, purchasePrice: undefined }),
      ],
      places: {
        'floor:ab': 'binder',
        'floor:walk': 'box',
        'floor:over': 'slab',
        'floor:demo': 'closet',
      },
      rangeForId: ranges({ judge: comps, psa: graded, demo, missing: none }),
    });
    const byPlayer = Object.fromEntries(haul.rows.map((row) => [row.player, row]));
    expect(byPlayer['Amy Bee']).toMatchObject({
      id: 'floor:ab',
      paidUsd: 40,
      ladder: 'beat fair',
      fairUsd: 80,
      walkUsd: 120,
      tape: 'comps',
      band: null,
      filed: true,
      markUsd: 90,
      unrealizedUsd: 50,
      place: 'binder',
      duplicate: true,
    });
    expect(byPlayer.Walk).toMatchObject({
      ladder: 'up to walk',
      markUsd: 0,
      unrealizedUsd: -100,
      place: 'box',
      duplicate: false,
    });
    expect(byPlayer.Over).toMatchObject({
      ladder: 'over walk',
      tape: 'comps',
      band: 'PSA 10',
      place: 'slab',
      duplicate: false,
      filed: true,
    });
    expect(byPlayer.Demo).toMatchObject({
      ladder: 'beat fair',
      tape: 'demo',
      band: null,
      place: null,
      markUsd: 15,
      duplicate: false,
    });
    expect(byPlayer.None.ladder).toBe('no ladder');
    expect(byPlayer.Empty.ladder).toBe('no ladder');
    expect(byPlayer.Empty.filed).toBe(false);
    expect(byPlayer.Ask).toMatchObject({ paidUsd: 18, filed: true, markUsd: 0, unrealizedUsd: -18 });
    expect(byPlayer.Neg.paidUsd).toBe(16);
    expect(haul.beatFair).toBe(2);
    expect(haul.upToWalk).toBe(1);
    expect(haul.overWalk).toBe(1);
    expect(haul.noLadder).toBe(4);
    expect(haul.onLadder).toBe(4);
    expect(haul.filed).toBe(5);
    expect(haul.unfiled).toBe(3);
    expect(haul.duplicates).toBe(1);
    expect(haul.unplaced).toBe(2);
    expect(haul.fairUsd).toBe(80 * 3 + 20);
    expect(haul.copy).toMatch(/Haul: 8 cards/);
    expect(haul.copy).toMatch(/2 beat the fair, 1 is up to the walk, and 1 is over the walk/);
    expect(haul.copy).toMatch(/4 prices stay off the ladder/);
    expect(haul.copy).toMatch(/5 are in the book/);
    expect(haul.copy).toMatch(/unrealized -\$/);
    expect(haul.copy).toMatch(/3 are still off the book/);
    expect(haul.copy).toMatch(/2 filed cards have no binder/);
    expect(haul.copy).toMatch(/1 is a second copy/);
    expect(haul.copy).toMatch(/and 4 more/);
    expect(haulRowCopy(byPlayer['Amy Bee'])).toMatch(/beat the fair on sold comps \(fair \$80\)/);
    expect(haulRowCopy(byPlayer['Amy Bee'])).toMatch(/binder · second copy/);
    expect(haulRowCopy(byPlayer.Walk)).toMatch(/up to the walk on sold comps/);
    expect(haulRowCopy(byPlayer.Walk)).toMatch(/box/);
    expect(haulRowCopy(byPlayer.Over)).toMatch(/over the walk on PSA 10 sold comps \(walk \$120\)/);
    expect(haulRowCopy(byPlayer.Over)).toMatch(/slab case/);
    expect(haulRowCopy(byPlayer.Demo)).toMatch(/on demo ladder/);
    expect(haulRowCopy(byPlayer.Demo)).toMatch(/no place/);
    expect(haulRowCopy(byPlayer.Empty)).toMatch(/no ladder · still off the book/);
    expect(haulPlaceIds(haul)).toEqual(['floor:ask', 'floor:demo']);
  });

  it('splits a bought lot by each card ask and skips a line with no player', () => {
    const haul = showHaul({
      notes: [
        note({
          id: 'lot',
          player: 'Bundle',
          offerUsd: 40,
          askUsd: 80,
          lines: [
            { player: 'Zee', askUsd: 30, cardId: 'judge' },
            { player: 'Amy', askUsd: 10, cardId: 'judge' },
          ],
        }),
        note({
          id: 'half',
          offerUsd: 20,
          lines: [
            { player: 'Kept', askUsd: 10, cardId: 'judge' },
            { player: '   ', askUsd: 10 },
          ],
        }),
      ],
      inventory: [card({ id: 'floor:lot:line:2', player: 'Amy', currentValue: 50, purchasePrice: 10 })],
      places: { 'floor:lot:line:2': 'binder' },
      rangeForId: ranges({ judge: comps }),
    });
    expect(haul.rows.map((row) => row.player)).toEqual(['Amy', 'Kept', 'Zee']);
    expect(haul.rows.map((row) => row.paidUsd)).toEqual([10, 10, 30]);
    expect(haul.rows[0]).toMatchObject({ filed: true, ladder: 'beat fair', place: 'binder' });
    expect(haul.rows[2].filed).toBe(false);
    expect(haul.paidUsd).toBe(50);
    expect(haul.unfiled).toBe(2);
    expect(haul.filed).toBe(1);
    expect(haul.copy).toMatch(/1 is in the book/);
    expect(haul.copy).toMatch(/Every filed card has a binder, box, or slab/);
    expect(haul.copy).toMatch(/2 are still off the book/);
  });

  it('names one card, two ladder seats, and a haul that is already shelved', () => {
    const quiet = showHaul({
      notes: [note({ id: 'solo', player: 'Solo', offerUsd: 80, cardId: 'judge' })],
      inventory: [card({ id: 'floor:solo', player: 'Solo', currentValue: 80, purchasePrice: 80 })],
      places: { 'floor:solo': 'binder' },
      rangeForId: ranges({ judge: comps }),
    });
    expect(quiet.copy).toMatch(/Haul: 1 card, paid \$80 \(Solo\)/);
    expect(quiet.copy).toMatch(/1 beat the fair\./);
    expect(quiet.copy).toMatch(/unrealized \$0/);
    expect(quiet.copy).toMatch(/Every filed card has a binder, box, or slab/);
    expect(quiet.copy).not.toMatch(/second copy/);
    expect(quiet.copy).not.toMatch(/off the book/);
    expect(haulPlaceIds(quiet)).toEqual([]);

    const pair = showHaul({
      notes: [
        note({ id: 'a', player: 'Ann', offerUsd: 40, cardId: 'judge' }),
        note({ id: 'b', player: 'Bea', offerUsd: 100, cardId: 'judge' }),
      ],
      inventory: [],
      places: {},
      rangeForId: ranges({ judge: comps }),
    });
    expect(pair.copy).toMatch(/1 beat the fair and 1 is up to the walk/);
    expect(pair.copy).toMatch(/None of these buys are in the book yet/);
    expect(pair.fairUsd).toBe(160);

    const overs = showHaul({
      notes: [
        note({ id: 'o1', player: 'One', offerUsd: 200, cardId: 'judge' }),
        note({ id: 'o2', player: 'Two', offerUsd: 200, cardId: 'judge' }),
        note({ id: 'w1', player: 'Mid', offerUsd: 100, cardId: 'judge' }),
        note({ id: 'w2', player: 'Low Mid', offerUsd: 100, cardId: 'judge' }),
      ],
      inventory: [],
      places: {},
      rangeForId: ranges({ judge: comps }),
    });
    expect(overs.copy).toMatch(/2 are up to the walk and 2 are over the walk/);

    const off = showHaul({
      notes: [
        note({ id: 'on', player: 'On', offerUsd: 40, cardId: 'judge' }),
        note({ id: 'off-1', player: 'Off A', offerUsd: 5, cardId: undefined }),
        note({ id: 'off-2', player: 'Off B', offerUsd: 6, cardId: undefined }),
      ],
      inventory: [],
      places: {},
      rangeForId: ranges({ judge: comps }),
    });
    expect(off.copy).toMatch(/1 beat the fair\. 2 prices stay off the ladder/);
    expect(off.copy).not.toMatch(/and 1 more/);

    const oneOff = showHaul({
      notes: [
        note({ id: 'in', player: 'In Book', offerUsd: 40, cardId: 'judge' }),
        note({ id: 'out', player: 'Out Book', offerUsd: 12, cardId: undefined }),
      ],
      inventory: [card({ id: 'floor:in', player: 'In Book', currentValue: 40 })],
      places: {},
      rangeForId: ranges({ judge: comps }),
    });
    expect(oneOff.copy).toMatch(/1 price stays off the ladder/);
    expect(oneOff.copy).toMatch(/1 is still off the book/);
    expect(oneOff.copy).toMatch(/1 filed card has no binder/);

    const twins = showHaul({
      notes: [
        note({ id: 't1', player: 'Twin', offerUsd: 10 }),
        note({ id: 't2', player: 'Twin', offerUsd: 12 }),
      ],
      inventory: [
        card({ id: 'floor:t1', player: 'Twin', currentValue: 10 }),
        card({ id: 'floor:t2', player: 'Twin', currentValue: 12 }),
      ],
      places: { 'floor:t1': 'binder', 'floor:t2': 'box' },
      rangeForId: () => null,
    });
    expect(twins.duplicates).toBe(2);
    expect(twins.copy).toMatch(/2 are second copies/);
  });

  it('describes a row that is missing ladder numbers or a mark', () => {
    const bare: HaulRow = {
      id: 'x',
      player: 'Bare',
      paidUsd: 10,
      ladder: 'beat fair',
      fairUsd: null,
      walkUsd: null,
      tape: null,
      band: null,
      filed: true,
      markUsd: null,
      unrealizedUsd: null,
      place: null,
      duplicate: false,
    };
    expect(haulRowCopy(bare)).toMatch(/no ladder · in the book at \$0 · no place/);
    expect(haulRowCopy({ ...bare, ladder: 'up to walk', fairUsd: 5, walkUsd: null, filed: false })).toMatch(/still off the book/);
    expect(haulRowCopy({
      ...bare,
      ladder: 'beat fair',
      fairUsd: 5,
      walkUsd: 9,
      tape: null,
      filed: false,
    })).toMatch(/beat the fair \(fair \$5\)/);
  });

  it('counts dated buys on the week and leaves undated notes on the show only', () => {
    const notes: HaulNote[] = [
      note({ id: 'now', player: 'Now', offerUsd: 40, savedAt: new Date(NOW).toISOString() }),
      note({ id: 'edge', player: 'Edge', offerUsd: 10, savedAt: new Date(NOW - WEEK).toISOString(), cardId: undefined }),
      note({ id: 'old', player: 'Old', offerUsd: 99, savedAt: new Date(NOW - WEEK - 1).toISOString() }),
      note({ id: 'future', player: 'Future', offerUsd: 99, savedAt: new Date(NOW + 1).toISOString() }),
      note({ id: 'bad', player: 'Bad', offerUsd: 99, savedAt: 'nope' }),
      note({ id: 'blank-date', player: 'Undated', offerUsd: 7, savedAt: undefined }),
      note({ id: 'pass', result: 'passed', player: 'Pass', savedAt: new Date(NOW).toISOString() }),
    ];
    const show = showHaul({
      notes,
      inventory: [card({ id: 'floor:now', player: 'Now', currentValue: 10, purchasePrice: 40 })],
      places: {},
      rangeForId: ranges({ judge: comps }),
    });
    expect(show.rows.map((row) => row.player).sort()).toEqual(['Bad', 'Edge', 'Future', 'Now', 'Old', 'Undated']);

    const week = weekHaul({
      notes,
      inventory: [card({ id: 'floor:now', player: 'Now', currentValue: 10, purchasePrice: 40 })],
      places: {},
      rangeForId: ranges({ judge: comps }),
      now: NOW,
    });
    expect(week.haul.rows.map((row) => row.player).sort()).toEqual(['Edge', 'Now']);
    expect(week.copy).toMatch(/Show haul in the book this week: 1 card, paid \$40, local mark \$10, unrealized -\$30/);
    expect(week.copy).toMatch(/1 filed card has no binder, box, or slab/);
    expect(week.copy).toMatch(/1 is still off the book/);
    expect(week.copy).toMatch(/Not a settlement and not a live tape/);

    const waiting = weekHaul({
      notes: [note({ id: 'wait', player: 'Wait', savedAt: new Date(NOW).toISOString() })],
      inventory: [],
      places: {},
      rangeForId: () => null,
      now: NOW,
    });
    expect(waiting.copy).toBe('1 show buy this week is still off the book. Not a live tape.');

    const many = weekHaul({
      notes: [
        note({ id: 'a', player: 'A', savedAt: new Date(NOW).toISOString() }),
        note({ id: 'b', player: 'B', savedAt: new Date(NOW).toISOString() }),
      ],
      inventory: [],
      places: {},
      rangeForId: () => null,
      now: NOW,
    });
    expect(many.copy).toBe('2 show buys this week are still off the book. Not a live tape.');

    const shelved = weekHaul({
      notes: [
        note({ id: 's1', player: 'Shelved', offerUsd: 20, savedAt: new Date(NOW).toISOString() }),
        note({ id: 's2', player: 'Open', offerUsd: 30, savedAt: new Date(NOW).toISOString() }),
        note({ id: 's3', player: 'Loose', offerUsd: 5, savedAt: new Date(NOW).toISOString() }),
      ],
      inventory: [
        card({ id: 'floor:s1', player: 'Shelved', currentValue: 20, purchasePrice: 20 }),
        card({ id: 'floor:s2', player: 'Open', currentValue: 30, purchasePrice: 30 }),
      ],
      places: { 'floor:s1': 'binder' },
      rangeForId: () => null,
      now: NOW,
    });
    expect(shelved.copy).toMatch(/2 cards, paid \$50, local mark \$50, unrealized \$0/);
    expect(shelved.copy).toMatch(/1 filed card has no binder, box, or slab\. 1 is still off the book/);

    const twoWaiting = weekHaul({
      notes: [
        note({ id: 'p1', player: 'Placed', offerUsd: 7, savedAt: new Date(NOW).toISOString() }),
        note({ id: 'w1', player: 'Wait A', offerUsd: 3, savedAt: new Date(NOW).toISOString() }),
        note({ id: 'w2', player: 'Wait B', offerUsd: 4, savedAt: new Date(NOW).toISOString() }),
      ],
      inventory: [card({ id: 'floor:p1', player: 'Placed', currentValue: 7 })],
      places: { 'floor:p1': 'binder' },
      rangeForId: () => null,
      now: NOW,
    });
    expect(twoWaiting.copy).toMatch(/2 are still off the book/);

    const full = weekHaul({
      notes: [
        note({ id: 'f1', player: 'Full', offerUsd: 8, savedAt: new Date(NOW).toISOString() }),
        note({ id: 'f2', player: 'Also', offerUsd: 9, savedAt: new Date(NOW).toISOString() }),
      ],
      inventory: [
        card({ id: 'floor:f1', player: 'Full', currentValue: 8 }),
        card({ id: 'floor:f2', player: 'Also', currentValue: 9 }),
      ],
      places: { 'floor:f1': 'box', 'floor:f2': 'slab' },
      rangeForId: () => null,
      now: NOW,
    });
    expect(full.copy).toMatch(/Every filed card has a binder, box, or slab/);
    expect(full.copy).not.toMatch(/still off the book/);

    const bothLoose = weekHaul({
      notes: [
        note({ id: 'u1', player: 'U1', offerUsd: 4, savedAt: new Date(NOW).toISOString() }),
        note({ id: 'u2', player: 'U2', offerUsd: 6, savedAt: new Date(NOW).toISOString() }),
      ],
      inventory: [
        card({ id: 'floor:u1', player: 'U1', currentValue: 4 }),
        card({ id: 'floor:u2', player: 'U2', currentValue: 6 }),
      ],
      places: {},
      rangeForId: () => null,
      now: NOW,
    });
    expect(bothLoose.copy).toMatch(/2 filed cards have no binder, box, or slab/);
    expect(bothLoose.copy).not.toMatch(/still off the book/);

    const quiet = weekHaul({
      notes: [note({ id: 'old-only', savedAt: new Date(NOW - WEEK - 5).toISOString() })],
      inventory: [],
      places: {},
      rangeForId: () => null,
      now: NOW,
    });
    expect(quiet.copy).toMatch(/No dated show buy this week/);
    expect(quiet.copy).not.toMatch(/not a settlement/i);

    const live = weekHaul({
      notes: [note({ id: 'live', player: 'Live', savedAt: new Date().toISOString() })],
      inventory: [],
      places: {},
      rangeForId: () => null,
    });
    expect(live.copy).toMatch(/1 show buy this week is still off the book/);
  });
});
