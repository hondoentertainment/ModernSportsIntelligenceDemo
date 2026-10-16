import { describe, expect, it } from 'vitest';
import {
  askVersusBookCopy,
  buildFloorBuyDraft,
  cashFit,
  cashFitCopy,
  cashLineCopy,
  cleanDetail,
  cleanPlayer,
  cleanSport,
  floorBuyId,
  followUps,
  isRevisit,
  paidOnNote,
  referenceForNote,
  roomAskCopy,
  roomAsks,
  unfiledBuys,
  unfiledCopy,
  watchDraft,
  type CloseNote,
} from '../../lib/collector/showClose';

function note(overrides: Partial<CloseNote> = {}): CloseNote {
  return {
    id: 'n1',
    showId: 'nyc',
    dealer: 'Ace',
    table: '1',
    askUsd: 40,
    offerUsd: 30,
    result: 'bought',
    player: 'Showclose Player',
    ...overrides,
  };
}

describe('show close', () => {
  it('cleans a player, a card line, and a sport', () => {
    expect(cleanPlayer('  A   B  ')).toBe('A B');
    expect(cleanPlayer('   ')).toBeUndefined();
    expect(cleanPlayer(undefined)).toBeUndefined();
    expect(cleanPlayer('x'.repeat(90))?.length).toBe(80);
    expect(cleanDetail('  2024   Topps  ')).toBe('2024 Topps');
    expect(cleanDetail('')).toBeUndefined();
    expect(cleanDetail(`${'y'.repeat(130)}`)?.length).toBe(120);
    expect(cleanSport('Hockey')).toBe('Hockey');
    expect(cleanSport('Cricket')).toBeUndefined();
    expect(cleanSport(undefined)).toBeUndefined();
  });

  it('uses the offer, then the ask, as the paid price', () => {
    expect(paidOnNote({ offerUsd: 12.345, askUsd: 20 })).toEqual({ usd: 12.35, from: 'offer' });
    expect(paidOnNote({ offerUsd: 0, askUsd: 8 })).toEqual({ usd: 8, from: 'ask' });
    expect(paidOnNote({ offerUsd: Number.NaN, askUsd: 0 })).toBeNull();
    expect(paidOnNote({ offerUsd: -1, askUsd: -2 })).toBeNull();
    expect(floorBuyId(' ab c ')).toBe('floor:abc');
    expect(floorBuyId('z'.repeat(120)).length).toBe(96);
  });

  it('files a bought note and skips a pass, a blank name, and a blank price', () => {
    const filed = buildFloorBuyDraft({
      note: note({
        id: 'note-1',
        detail: '1999 Topps Chrome auto #7',
        sport: 'Basketball',
        offerUsd: 18.5,
        askUsd: 22,
      }),
      showName: '  NYC  ',
      purchaseDate: '2026-10-18T12:00:00Z',
    });
    expect(filed).toMatchObject({
      id: 'floor:note-1',
      player: 'Showclose Player',
      year: 1999,
      manufacturer: 'Topps',
      cardNumber: '7',
      sport: 'Basketball',
      league: 'NBA',
      isAutographed: true,
      purchasePrice: 18.5,
      taxBasis: 18.5,
      purchaseDate: '2026-10-18',
      status: 'active',
    });
    expect(filed?.notes).toMatch(/NYC/);
    expect(filed?.pricingRationale).toMatch(/not a live tape/i);

    expect(buildFloorBuyDraft({
      note: note({ sport: 'Football', detail: '', offerUsd: 0, askUsd: 9 }),
      showName: '',
      purchaseDate: 'soon',
    })).toMatchObject({ sport: 'Football', league: 'NFL', year: 2026, set: 'Show floor', manufacturer: 'Show purchase' });
    expect(buildFloorBuyDraft({
      note: note({ sport: 'Hockey', offerUsd: 4 }),
      showName: 'Hall',
      purchaseDate: '1899-01-01',
    })?.league).toBe('Other');
    expect(buildFloorBuyDraft({
      note: note({ sport: 'Soccer', offerUsd: 4 }),
      showName: 'Hall',
      purchaseDate: '2100-01-01',
    })).toMatchObject({ league: 'Other', year: 2026 });
    expect(buildFloorBuyDraft({
      note: note({ sport: 'Nope', offerUsd: 4 }),
      showName: 'Hall',
      purchaseDate: '1900-06-01',
    })).toMatchObject({ sport: 'Baseball', league: 'MLB', year: 1900 });
    expect(buildFloorBuyDraft({ note: note({ result: 'passed' }), showName: 'Hall', purchaseDate: '2026-01-01' })).toBeNull();
    expect(buildFloorBuyDraft({ note: note({ player: ' ' }), showName: 'Hall', purchaseDate: '2026-01-01' })).toBeNull();
    expect(buildFloorBuyDraft({ note: note({ offerUsd: 0, askUsd: 0 }), showName: 'Hall', purchaseDate: '2026-01-01' })).toBeNull();
  });

  it('names the lowest ask when the same player is at two tables', () => {
    expect(roomAsks([note({ player: 'Solo' })])).toEqual([]);
    expect(roomAsks([note({ player: 'Skip', askUsd: Number.NaN })])).toEqual([]);
    expect(roomAsks([note({ player: 'Skip', askUsd: -1 })])).toEqual([]);
    const sameDealer = roomAsks([
      note({ id: 't2', player: 'Tie', askUsd: 5, savedAt: '2026-01-01', dealer: 'Ace', table: '2', result: 'open' }),
      note({ id: 't1', player: 'Tie', askUsd: 5, savedAt: '2026-01-01', dealer: 'Ace', table: '1', result: 'open' }),
    ]);
    expect(sameDealer[0]).toMatchObject({ dealer: 'Ace', table: '1' });
    const dealers = roomAsks([
      note({ id: 'd2', player: 'Deal', askUsd: 6, savedAt: '2026-01-01', dealer: 'Zed', table: '1', result: 'open' }),
      note({ id: 'd1', player: 'Deal', askUsd: 6, savedAt: '2026-01-01', dealer: 'Ace', table: '9', result: 'open' }),
    ]);
    expect(dealers[0].dealer).toBe('Ace');
    const bare = roomAsks([
      note({ id: 'b1', player: 'Bare', askUsd: 4, dealer: 'Zed', table: '2', result: 'open' }),
      note({ id: 'b2', player: 'Bare', askUsd: 4, savedAt: '2026-03-01', dealer: 'Ace', table: '1', result: 'open' }),
    ]);
    expect(bare[0].dealer).toBe('Zed');
    const tied = roomAsks([
      note({ id: 'a', player: 'Same', askUsd: 10, savedAt: '2026-10-02', dealer: 'Zed', table: '2', result: 'open' }),
      note({ id: 'b', player: ' same ', askUsd: 10, savedAt: '2026-10-01', dealer: 'Ace', table: '9', result: 'open' }),
    ]);
    expect(tied[0]).toMatchObject({ dealer: 'Ace', table: '9', lowAskUsd: 10, highAskUsd: 10, tables: 2 });
    expect(roomAskCopy(tied[0])).toMatch(/Both asks are \$10\.00/);
    const spread = roomAsks([
      note({ id: 'hi', player: 'Zoe', askUsd: 50, dealer: 'High', table: '8', savedAt: '' }),
      note({ id: 'lo', player: 'Zoe', askUsd: 20, dealer: 'Low', table: '3', savedAt: '2026-10-01' }),
    ]);
    expect(spread[0]).toMatchObject({ dealer: 'Low', table: '3', lowAskUsd: 20, highAskUsd: 50 });
    expect(roomAskCopy(spread[0])).toMatch(/Lowest \$20\.00 at Low table 3\. Highest \$50\.00/);
    const many = roomAsks(Array.from({ length: 9 }, (_, index) => [
      note({ id: `p${index}a`, player: `P${index}`, askUsd: 10, dealer: 'A', table: '1' }),
      note({ id: `p${index}b`, player: `P${index}`, askUsd: 12, dealer: 'B', table: '2' }),
    ]).flat());
    expect(many).toHaveLength(8);
    expect(many.some(row => row.player === 'P8')).toBe(false);
  });

  it('fits the cheapest buys into saved cash', () => {
    const fit = cashFit([
      { id: 'no', usd: null },
      { id: 'bad', usd: Number.NaN },
      { id: 'neg', usd: -1 },
      { id: 'b', usd: 5 },
      { id: 'a', usd: 5 },
      { id: 'c', usd: 3 },
    ], 10);
    expect(fit.byId).toMatchObject({ no: 'no price', bad: 'no price', neg: 'no price', c: 'fits', a: 'fits', b: 'over' });
    expect(fit).toMatchObject({ fitCount: 2, overCount: 1, noPriceCount: 3, leftUsd: 2 });
    expect(cashFit([{ id: 'free', usd: 0 }], 0).byId.free).toBe('fits');
    const unset = cashFit([{ id: 'x', usd: 4 }], null);
    expect(unset.byId.x).toBe('cash unset');
    expect(unset.leftUsd).toBeNull();
    expect(cashFit([{ id: 'x', usd: 4 }], Number.NaN).byId.x).toBe('cash unset');
    expect(cashFit([{ id: 'x', usd: 4 }], -5).byId.x).toBe('cash unset');
    expect(cashLineCopy('fits')).toMatch(/Fits/);
    expect(cashLineCopy('over')).toMatch(/Over/);
    expect(cashLineCopy('no price')).toMatch(/No price/);
    expect(cashLineCopy('cash unset')).toMatch(/not set/i);
    expect(cashFitCopy(fit, 10, 'saved')).toMatch(/2 buys fit the \$10 saved for this trip/);
    expect(cashFitCopy(fit, 10, 'saved')).toMatch(/\$2 left/);
    expect(cashFitCopy({ ...fit, fitCount: 1, leftUsd: null }, 10, 'trip need')).toMatch(/1 buy fits the \$10 the trip need/);
    expect(cashFitCopy(fit, null, 'unset')).toMatch(/Trip cash is not set/);
    expect(cashFitCopy(fit, -1, 'saved')).toMatch(/Trip cash is not set/);
  });

  it('compares an ask with a held median or a shopping-list mark', () => {
    const targets = [{
      status: 'active' as const,
      player: 'Showclose Player',
      cardDescription: '2024 Topps',
      targetPrice: 100,
      currentMarketPrice: 80,
    }];
    expect(referenceForNote(note({ cardId: 'held' }), {
      medianByCardId: { held: { usd: 50, kind: 'comps' } },
      targets,
    })).toEqual({ usd: 50, kind: 'comps' });
    expect(referenceForNote(note({ cardId: 'missing' }), {
      medianByCardId: { missing: { usd: 0, kind: 'demo' } },
      targets,
    })).toEqual({ usd: 80, kind: 'list' });
    expect(referenceForNote(note({ cardId: undefined }), {
      medianByCardId: {},
      targets: [{ ...targets[0], currentMarketPrice: undefined }],
    })).toEqual({ usd: 100, kind: 'list' });
    expect(referenceForNote(note(), {
      medianByCardId: {},
      targets: [{ ...targets[0], status: 'expired', currentMarketPrice: undefined, targetPrice: 0 }],
    })).toEqual({ usd: null, kind: 'none' });
    expect(referenceForNote(note({ player: 'Other' }), { medianByCardId: {}, targets })).toEqual({ usd: null, kind: 'none' });
    expect(referenceForNote(note({ cardId: 'demo' }), {
      medianByCardId: { demo: { usd: 12, kind: 'demo' } },
      targets: [],
    })).toEqual({ usd: 12, kind: 'demo' });
    expect(referenceForNote(note(), {
      medianByCardId: {},
      targets: [{ status: 'active', player: 'Showclose Player', cardDescription: 'x', targetPrice: 0 }],
    })).toEqual({ usd: null, kind: 'none' });
    expect(askVersusBookCopy(10, { usd: null, kind: 'comps' })).toMatch(/No median/);

    expect(askVersusBookCopy(40, { usd: 80, kind: 'list' })).toMatch(/under the shopping-list mark \(\$80\) by 50%/);
    expect(askVersusBookCopy(80, { usd: 80, kind: 'list' })).toMatch(/within 5%/);
    expect(askVersusBookCopy(100, { usd: 80, kind: 'list' })).toMatch(/over the shopping-list mark/);
    expect(askVersusBookCopy(-1, { usd: 80, kind: 'list' })).toMatch(/No shopping-list mark/);
    expect(askVersusBookCopy(10, { usd: null, kind: 'list' })).toMatch(/No shopping-list mark/);
    expect(askVersusBookCopy(10, { usd: null, kind: 'none' }, true)).toMatch(/No median on this card/);
    expect(askVersusBookCopy(10, { usd: null, kind: 'none' })).toMatch(/No local mark on this note/);
    expect(askVersusBookCopy(40, { usd: 80, kind: 'comps' })).toMatch(/sold comps median/);
    expect(askVersusBookCopy(40, { usd: 80, kind: 'demo' })).toMatch(/demo sales/);
    expect(isRevisit(note({ result: 'passed', askUsd: 40 }), { usd: 80, kind: 'list' })).toBe(true);
    expect(isRevisit(note({ result: 'passed', askUsd: 80 }), { usd: 80, kind: 'list' })).toBe(false);
    expect(isRevisit(note({ result: 'open', askUsd: 10 }), { usd: 80, kind: 'list' })).toBe(false);
    expect(isRevisit(note({ result: 'passed', player: ' ' }), { usd: 80, kind: 'list' })).toBe(false);
  });

  it('lists open notes and cheap passes, and skips a pass already watched', () => {
    const targets = [{
      status: 'active' as const,
      player: 'Showclose Player',
      cardDescription: '2024 Topps #77',
      targetPrice: 100,
    }];
    const rows = followUps({
      notes: [
        note({ id: 'old', result: 'open', askUsd: 0, savedAt: '2026-10-01', player: undefined, showId: 'missing' }),
        note({ id: 'new', result: 'open', askUsd: 12, player: 'Showclose Player', savedAt: '2026-10-02', dealer: 'Rivera', table: '4' }),
        note({ id: 'pass', result: 'passed', askUsd: 40, detail: '1998 Fleer #3', savedAt: '2026-10-03' }),
        note({ id: 'zero', result: 'passed', askUsd: 0, savedAt: '2026-10-03' }),
        note({ id: 'held', result: 'bought' }),
      ],
      shows: [{ id: 'nyc', name: 'NYC Monthly' }],
      medianByCardId: {},
      targets,
    });
    expect(rows.map(row => row.id)).toEqual(['open:new', 'open:old', 'revisit:pass', 'revisit:zero']);
    expect(rows[0].detail).toMatch(/Rivera at table 4 · Showclose Player\. Ask \$12\.00/);
    expect(rows[1].title).toMatch(/a seeded show/);
    expect(rows[1].detail).toMatch(/Not a dealer quote/);
    expect(rows[2].watch).toMatchObject({ player: 'Showclose Player', priority: 'High', sport: 'Baseball', league: 'MLB', targetPrice: 40 });
    expect(rows[3].watch).toBeNull();

    const watched = followUps({
      notes: [note({ id: 'pass', result: 'passed', askUsd: 10, detail: '2024 Topps #77', sport: 'Soccer' })],
      shows: [],
      medianByCardId: {},
      targets,
      watched: [{ status: 'active', player: 'Showclose Player', cardDescription: '2024 Topps #77' }],
    });
    expect(watched[0].watch).toBeNull();
    expect(watched[0].watched).toBe(true);
    const filedAtTheAsk = followUps({
      notes: [note({ id: 'pass', result: 'passed', askUsd: 40, detail: '2023 Bowman #1' })],
      shows: [{ id: 'nyc', name: 'NYC Monthly' }],
      medianByCardId: {},
      targets: [
        { status: 'active', player: 'Showclose Player', cardDescription: '2023 Bowman #1', targetPrice: 40 },
        { status: 'active', player: 'Showclose Player', cardDescription: '2024 Topps #77', targetPrice: 80 },
      ],
    });
    expect(filedAtTheAsk).toHaveLength(1);
    expect(filedAtTheAsk[0].watched).toBe(true);
    expect(filedAtTheAsk[0].watch).toBeNull();
    expect(watchDraft(note({ result: 'passed', askUsd: 10, sport: 'Football' }))).toMatchObject({ priority: 'Medium', league: 'NFL' });
    expect(watchDraft(note({ player: ' ', askUsd: 10 }))).toBeNull();
    expect(watchDraft(note({ askUsd: Number.NaN }))).toBeNull();

    const capped = followUps({
      notes: Array.from({ length: 9 }, (_, index) => note({
        id: `o${index}`,
        result: 'open',
        savedAt: `2026-10-0${index}`,
        player: undefined,
      })),
      shows: [],
      medianByCardId: {},
      targets: [],
    });
    expect(capped).toHaveLength(8);
    const passes = followUps({
      notes: Array.from({ length: 9 }, (_, index) => note({
        id: `r${index}`,
        result: 'passed',
        askUsd: 10,
        player: `Passer ${index}`,
        detail: `Card ${index}`,
        savedAt: `2026-10-1${index}`,
      })),
      shows: [],
      medianByCardId: {},
      targets: Array.from({ length: 9 }, (_, index) => ({
        status: 'active' as const,
        player: `Passer ${index}`,
        cardDescription: 'other',
        targetPrice: 40,
      })),
    });
    expect(passes).toHaveLength(8);
    expect(passes.every(row => row.kind === 'revisit')).toBe(true);
  });

  it('names bought notes that are not in the book yet', () => {
    const waiting = [
      note({ id: 'a', player: 'One' }),
      note({ id: 'b', player: 'Two' }),
      note({ id: 'c', player: 'Three' }),
      note({ id: 'd', player: 'Four' }),
      note({ id: 'e', player: 'Five' }),
    ];
    expect(unfiledBuys([
      note({ id: 'a' }),
      note({ id: 'filed' }),
      note({ result: 'passed' }),
      note({ player: ' ' }),
      note({ offerUsd: 0, askUsd: 0 }),
    ], [{ id: 'floor:filed' }]).map(row => row.id)).toEqual(['a']);
    expect(unfiledCopy([])).toMatch(/No bought table note/);
    expect(unfiledCopy([note()])).toMatch(/1 bought note not in the book: Showclose Player/);
    expect(unfiledCopy(waiting)).toMatch(/5 bought notes not in the book: One, Two, Three, Four \+1/);
    expect(unfiledCopy(waiting)).toMatch(/Not a settlement/);
  });
});
