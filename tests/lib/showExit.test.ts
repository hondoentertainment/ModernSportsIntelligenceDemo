import { describe, expect, it } from 'vitest';
import type { SaleRange } from '../../lib/collector/saleRange';
import {
  EXIT_RECORD_NOTE,
  SHOW_EXIT_NOTE,
  allInCost,
  buildExitPatch,
  exitMath,
  exitRowCopy,
  showExit,
  signedUsd,
  takenOnNote,
  weekExit,
  type ExitBookCard,
  type ExitNote,
} from '../../lib/collector/showExit';

const comps: SaleRange = { source: 'comps', low: 40, median: 80, high: 120, count: 3 };
const graded: SaleRange = { source: 'comps', low: 80, median: 100, high: 140, count: 2, band: 'PSA 10' };
const demo: SaleRange = { source: 'demo', low: 10, median: 20, high: 30, count: 6 };
const none: SaleRange = { source: 'none', low: null, median: null, high: null, count: 0 };
const NOW = Date.parse('2026-10-30T12:00:00.000Z');
const WEEK = 7 * 24 * 60 * 60 * 1000;

function recorded(noteId: string, overrides: Partial<ExitBookCard> = {}): ExitBookCard {
  return card({
    ...overrides,
    status: 'sold',
    notes: `Show exit ${noteId}: sold at the table.`,
  });
}

function card(overrides: Partial<ExitBookCard> = {}): ExitBookCard {
  return {
    id: 'judge',
    player: 'Aaron Judge',
    status: 'active',
    purchasePrice: 40,
    ...overrides,
  };
}

function note(overrides: Partial<ExitNote> = {}): ExitNote {
  return {
    id: 'n1',
    result: 'sold',
    askUsd: 80,
    offerUsd: 100,
    player: 'Aaron Judge',
    cardId: 'judge',
    dealer: 'Rivera',
    table: '12',
    savedAt: '2026-10-29T00:00:00.000Z',
    ...overrides,
  };
}

function ranges(map: Record<string, SaleRange>): (id: string) => SaleRange | null {
  return (id) => map[id] ?? null;
}

describe('show exit', () => {
  it('prices the fee and the all-in cost', () => {
    expect(SHOW_EXIT_NOTE).toMatch(/not a settlement and not a live tape/i);
    expect(EXIT_RECORD_NOTE).toMatch(/not a settlement/i);
    expect(allInCost({ purchasePrice: 40, gradingFees: 10, shippingFees: 2, insuranceFees: 1 })).toBe(53);
    expect(allInCost({ purchasePrice: 40, gradingFees: -5, shippingFees: Number.NaN })).toBe(40);
    expect(allInCost({ purchasePrice: -1 })).toBeNull();
    expect(allInCost({})).toBeNull();
    expect(exitMath(100, 40)).toEqual({ feeUsd: 4, netUsd: 96, realizedUsd: 56 });
    expect(exitMath(10.01, null)).toEqual({ feeUsd: 0.4, netUsd: 9.61, realizedUsd: null });
    expect(signedUsd(-12.5)).toBe('-$12.5');
    expect(signedUsd(4)).toBe('$4');
    expect(takenOnNote(note())).toBe(100);
    expect(takenOnNote(note({ offerUsd: 0, askUsd: 22 }))).toBe(22);
    expect(takenOnNote(note({ result: 'bought' }))).toBeNull();
    expect(takenOnNote(note({ offerUsd: 0, askUsd: 0 }))).toBeNull();
    expect(takenOnNote(note({ lines: [{ player: 'A' }, { player: 'B' }] }))).toBeNull();
  });

  it('scores a taken price on the sell ladder and writes the sale', () => {
    const exit = showExit({
      notes: [
        note({ id: 'ask', offerUsd: 130, player: '  Amy   Bee  ' }),
        note({ id: 'take', offerUsd: 100, player: 'Take', cardId: 'take' }),
        note({ id: 'pass', offerUsd: 40, player: 'Pass', cardId: 'pass' }),
        note({ id: 'under', offerUsd: 20, player: 'Under', cardId: 'psa' }),
        note({ id: 'demo', offerUsd: 15, player: 'Demo', cardId: 'demo' }),
        note({ id: 'none', offerUsd: 12, player: 'None', cardId: 'missing' }),
        note({ id: 'empty', offerUsd: 11, player: '', cardId: '' }),
        note({ id: 'ask-price', offerUsd: 0, askUsd: 90, player: 'Ask', cardId: 'ask' }),
        note({ id: 'bought', result: 'bought', player: 'Buy' }),
        note({ id: 'open', result: 'open', player: 'Open' }),
        note({ id: 'passed', result: 'passed', player: 'Passed' }),
        note({ id: 'lot', player: 'Lot', lines: [{ player: 'A' }, { player: 'B' }] }),
        note({ id: 'zero', offerUsd: 0, askUsd: 0, player: 'Zero' }),
        note({ id: 'held', offerUsd: 50, player: 'Held', cardId: 'held', dealer: '', table: '' }),
        note({ id: 'ship', offerUsd: 80, player: 'Ship', cardId: 'ship' }),
      ],
      inventory: [
        recorded('ask', { id: 'judge', player: 'Amy Bee', purchasePrice: 40, salePrice: 130 }),
        recorded('take', { id: 'take', player: 'Take', purchasePrice: 70 }),
        recorded('pass', { id: 'pass', player: 'Pass', purchasePrice: undefined }),
        card({ id: 'psa', player: 'Under', status: 'active', purchasePrice: 10 }),
        card({ id: 'demo', player: 'Demo', status: 'consignment', purchasePrice: 15 }),
        recorded('ask-price', { id: 'ask', player: 'Ask', purchasePrice: 0, gradingFees: 5 }),
        card({ id: 'held', player: 'Held', purchasePrice: undefined }),
        card({ id: 'ship', player: 'Ship', status: 'consignment' }),
      ],
      rangeForId: ranges({ judge: comps, take: comps, pass: comps, psa: graded, demo, missing: none, ask: comps }),
    });
    const byPlayer = Object.fromEntries(exit.rows.map((row) => [row.player, row]));
    expect(exit.rows.map((row) => row.player)).toEqual([
      'Amy Bee', 'Ask', 'Card', 'Demo', 'Held', 'None', 'Pass', 'Ship', 'Take', 'Under',
    ]);
    expect(byPlayer['Amy Bee']).toMatchObject({
      seat: 'at or over ask',
      takenUsd: 130,
      closed: true,
      realizedUsd: 84.8,
      feeUsd: 5.2,
    });
    expect(byPlayer.Take).toMatchObject({ seat: 'down to take', closed: true, realizedUsd: 26 });
    expect(byPlayer.Pass).toMatchObject({ seat: 'down to pass', closed: true, realizedUsd: null, costUsd: null });
    expect(byPlayer.Under).toMatchObject({ seat: 'under pass', band: 'PSA 10', held: true, realizedUsd: 9.2 });
    expect(byPlayer.Demo).toMatchObject({ seat: 'down to pass', tape: 'demo', consigned: true });
    expect(byPlayer.None).toMatchObject({ seat: 'no ladder', missing: true });
    expect(byPlayer.Card).toMatchObject({ seat: 'no ladder', missing: true, player: 'Card' });
    expect(byPlayer.Ask).toMatchObject({ takenUsd: 90, seat: 'down to take', costUsd: 5, closed: true });
    expect(byPlayer.Held).toMatchObject({ held: true, realizedUsd: null, costUsd: null });
    expect(byPlayer.Ship.consigned).toBe(true);
    expect(exit.clearedAsk).toBe(1);
    expect(exit.clearedTake).toBe(2);
    expect(exit.downToPass).toBe(2);
    expect(exit.underPass).toBe(1);
    expect(exit.noLadder).toBe(4);
    expect(exit.onLadder).toBe(6);
    expect(exit.closed).toBe(4);
    expect(exit.stillHeld).toBe(2);
    expect(exit.consigned).toBe(2);
    expect(exit.missing).toBe(2);
    expect(exit.noBasis).toBe(2);
    expect(exit.realizedRows).toBe(3);
    expect(exit.copy).toMatch(/Exit: 10 cards/);
    expect(exit.copy).toMatch(/1 cleared the ask, 2 cleared the take, 2 are down to the pass, and 1 is under the pass/);
    expect(exit.copy).toMatch(/4 prices stay off the ladder/);
    expect(exit.copy).toMatch(/4 are sold in the book, realized/);
    expect(exit.copy).toMatch(/2 are still held/);
    expect(exit.copy).toMatch(/2 have no cost basis/);
    expect(exit.copy).toMatch(/2 are not in the book/);
    expect(exit.copy).toMatch(/2 are on consignment/);
    expect(exit.copy).toMatch(/and 6 more/);
    expect(exitRowCopy(byPlayer['Amy Bee'])).toMatch(/Rivera table 12/);
    expect(exitRowCopy(byPlayer['Amy Bee'])).toMatch(/cleared the ask on sold comps \(ask \$120\)/);
    expect(exitRowCopy(byPlayer['Amy Bee'])).toMatch(/sold in the book · realized \$84\.8 after the card-show fee/);
    expect(exitRowCopy(byPlayer.Take)).toMatch(/cleared the take on sold comps/);
    expect(exitRowCopy(byPlayer.Pass)).toMatch(/down to the pass on sold comps/);
    expect(exitRowCopy(byPlayer.Pass)).toMatch(/no cost basis/);
    expect(exitRowCopy(byPlayer.Under)).toMatch(/under the pass on PSA 10 sold comps/);
    expect(exitRowCopy(byPlayer.Under)).toMatch(/still held · would realize/);
    expect(exitRowCopy(byPlayer.Demo)).toMatch(/on demo ladder/);
    expect(exitRowCopy(byPlayer.Demo)).toMatch(/on consignment/);
    expect(exitRowCopy(byPlayer.None)).toMatch(/no ladder · not in the book/);
    expect(exitRowCopy(byPlayer.Held)).toMatch(/still held · no cost basis/);
    expect(exitRowCopy(byPlayer.Held)).not.toMatch(/table/);

    const single = showExit({
      notes: [note({ id: 'only', player: 'Only', offerUsd: 100, cardId: 'only' })],
      inventory: [recorded('only', { id: 'only', player: 'Only', purchasePrice: 40 })],
      rangeForId: ranges({ only: comps }),
    });
    expect(single.copy).toMatch(/Exit: 1 card, taken \$100 \(Only\)/);
    expect(single.copy).toMatch(/1 cleared the take\./);
    expect(single.copy).not.toMatch(/off the ladder/);
    expect(single.copy).toMatch(/1 is sold in the book and realized \$56/);
    expect(single.copy).toMatch(/1 is still held|Not a settlement/);
    expect(single.stillHeld).toBe(0);

    const pair = showExit({
      notes: [
        note({ id: 'a', player: 'Ada', offerUsd: 130, cardId: 'a' }),
        note({ id: 'b', player: 'Bea', offerUsd: 100, cardId: 'b' }),
      ],
      inventory: [
        card({ id: 'a', player: 'Ada', purchasePrice: 40 }),
        card({ id: 'b', player: 'Bea', purchasePrice: 40 }),
      ],
      rangeForId: ranges({ a: comps, b: comps }),
    });
    expect(pair.copy).toMatch(/1 cleared the ask and 1 cleared the take/);
    expect(pair.copy).toMatch(/2 are still held/);
    expect(pair.closed).toBe(0);

    const quiet = showExit({
      notes: [note({ result: 'bought' })],
      inventory: [],
      rangeForId: () => null,
    });
    expect(quiet.rows).toEqual([]);
    expect(quiet.copy).toMatch(/No sold table note is on this exit/);
  });

  it('builds a sale patch and skips a card that is already closed', () => {
    const patch = buildExitPatch({
      note: note({ id: 'exit-1', savedAt: '2026-10-30T23:30:00.000Z', offerUsd: 100 }),
      card: card(),
      purchaseDate: '2026-10-01',
      existingNotes: '  Binder  ',
    });
    expect(patch).toMatchObject({
      status: 'sold',
      salePrice: 100,
      saleDate: '2026-10-30',
      realizedGainLoss: 56,
    });
    expect(patch?.notes).toMatch(/Binder Show exit exit-1: sold at \$100/);
    expect(patch?.notes).toMatch(/Card-show fee \$4/);
    expect(patch?.pricingRationale).toMatch(/~4%/);

    const again = buildExitPatch({
      note: note({ id: 'exit-1', offerUsd: 100 }),
      card: card(),
      existingNotes: patch?.notes,
    });
    expect(again?.notes).toBe(patch?.notes);

    const bare = buildExitPatch({
      note: note({ id: 'bare', savedAt: 'not-a-date', offerUsd: 80, askUsd: 0 }),
      card: card({ purchasePrice: undefined, notes: '' }),
      purchaseDate: '2026-11-02',
    });
    expect(bare).toMatchObject({ salePrice: 80, saleDate: '2026-11-02' });
    expect(bare?.realizedGainLoss).toBeUndefined();
    expect(bare?.notes.startsWith('Show exit bare:')).toBe(true);

    const fallback = buildExitPatch({
      note: note({ id: 'old', savedAt: '', offerUsd: 50 }),
      card: card(),
      purchaseDate: 'soon',
    });
    expect(fallback?.saleDate).toBe('2026-01-01');

    expect(buildExitPatch({ note: note(), card: card({ status: 'sold' }) })).toBeNull();
    expect(buildExitPatch({ note: note(), card: card({ status: 'consignment' }) })).toBeNull();
    expect(buildExitPatch({ note: note(), card: null })).toBeNull();
    expect(buildExitPatch({ note: note({ result: 'bought' }), card: card() })).toBeNull();
    expect(buildExitPatch({
      note: note({ lines: [{ player: 'A' }, { player: 'B' }] }),
      card: card(),
    })).toBeNull();
  });

  it('counts dated sales that are already in the book', () => {
    const notes = [
      note({ id: 'booked', player: 'Booked', savedAt: new Date(NOW).toISOString(), cardId: 'booked', offerUsd: 100 }),
      note({ id: 'held', player: 'Held', savedAt: new Date(NOW - 1000).toISOString(), cardId: 'held', offerUsd: 50 }),
      note({ id: 'held-b', player: 'Second', savedAt: new Date(NOW - 2000).toISOString(), cardId: 'second', offerUsd: 40 }),
      note({ id: 'old', player: 'Old', savedAt: new Date(NOW - WEEK - 5).toISOString(), offerUsd: 90 }),
      note({ id: 'future', player: 'Future', savedAt: new Date(NOW + 60_000).toISOString(), offerUsd: 90 }),
      note({ id: 'blank', player: 'Blank', savedAt: undefined, offerUsd: 90 }),
      note({ id: 'bad', player: 'Bad', savedAt: 'nope', offerUsd: 90 }),
      note({ id: 'edge', player: 'Edge', savedAt: new Date(NOW - WEEK).toISOString(), cardId: 'edge', offerUsd: 20 }),
    ];
    const inventory = [
      recorded('booked', { id: 'booked', player: 'Booked', purchasePrice: 40 }),
      card({ id: 'held', player: 'Held', purchasePrice: 10 }),
      card({ id: 'second', player: 'Second', purchasePrice: undefined }),
      recorded('edge', { id: 'edge', player: 'Edge', purchasePrice: undefined }),
    ];
    const week = weekExit({
      notes,
      inventory,
      rangeForId: ranges({ booked: comps, held: comps, second: none, edge: comps }),
      now: NOW,
    });
    expect(week.exit.rows.map((row) => row.player).sort()).toEqual(['Booked', 'Edge', 'Held', 'Second']);
    expect(week.copy).toMatch(/Show exit this week: 2 cards, taken \$120, fees \$4\.8/);
    expect(week.copy).toMatch(/1 cleared the take and 1 is under the pass/);
    expect(week.copy).toMatch(/Realized \$56 after the card-show fee/);
    expect(week.copy).toMatch(/2 are still held/);
    expect(week.copy).toMatch(/Not a settlement and not a live tape/);

    const waiting = weekExit({
      notes: [note({ id: 'held', player: 'Held', savedAt: new Date(NOW).toISOString(), cardId: 'held' })],
      inventory: [card({ id: 'held', player: 'Held' })],
      rangeForId: () => null,
      now: NOW,
    });
    expect(waiting.copy).toMatch(/1 show sale this week is still held/);
    expect(waiting.copy).toMatch(/Not a live tape/);
    expect(waiting.copy).not.toMatch(/not a settlement/i);

    const many = weekExit({
      notes: [
        note({ id: 'a', player: 'A', savedAt: new Date(NOW).toISOString(), cardId: 'a' }),
        note({ id: 'b', player: 'B', savedAt: new Date(NOW).toISOString(), cardId: 'b' }),
      ],
      inventory: [card({ id: 'a', player: 'A' }), card({ id: 'b', player: 'B' })],
      rangeForId: () => comps,
      now: NOW,
    });
    expect(many.copy).toMatch(/2 show sales this week are still held/);

    const bookedOnly = weekExit({
      notes: [note({ id: 'booked', player: 'Booked', savedAt: new Date(NOW).toISOString(), cardId: 'booked', offerUsd: 100 })],
      inventory: [recorded('booked', { id: 'booked', player: 'Booked', purchasePrice: 40 })],
      rangeForId: () => comps,
      now: NOW,
    });
    expect(bookedOnly.copy).toMatch(/1 card, taken \$100, fees \$4/);
    expect(bookedOnly.copy).toMatch(/1 cleared the take\./);
    expect(bookedOnly.copy).not.toMatch(/still held/);

    const noCost = weekExit({
      notes: [note({ id: 'edge', player: 'Edge', savedAt: new Date(NOW).toISOString(), cardId: 'edge', offerUsd: 20 })],
      inventory: [recorded('edge', { id: 'edge', player: 'Edge', purchasePrice: undefined })],
      rangeForId: () => comps,
      now: NOW,
    });
    expect(noCost.copy).toMatch(/No recorded sale has a price and a cost/);

    const quiet = weekExit({
      notes: [note({ savedAt: undefined })],
      inventory: [],
      rangeForId: () => null,
      now: NOW,
    });
    expect(quiet.copy).toMatch(/No dated show sale this week/);
    expect(weekExit({ notes: [], inventory: [], rangeForId: () => null }).copy).toMatch(/No dated show sale/);

    const oneHeld = weekExit({
      notes: [
        note({ id: 'booked', player: 'Booked', savedAt: new Date(NOW).toISOString(), cardId: 'booked', offerUsd: 100 }),
        note({ id: 'held', player: '', savedAt: new Date(NOW).toISOString(), cardId: 'held', offerUsd: 50, dealer: undefined, table: undefined }),
        note({ id: 'held-b', player: 'Booked', savedAt: new Date(NOW).toISOString(), cardId: 'booked', offerUsd: 90 }),
      ],
      inventory: [
        recorded('booked', { id: 'booked', player: 'Booked', purchasePrice: 40 }),
        card({ id: 'held', player: 'From Book', purchasePrice: 10 }),
      ],
      rangeForId: () => comps,
      now: NOW,
    });
    expect(oneHeld.exit.rows.find((row) => row.id === 'held')?.player).toBe('From Book');
    expect(oneHeld.exit.rows.filter((row) => row.player === 'Booked').map((row) => row.id)).toEqual(['booked', 'held-b']);
    expect(oneHeld.copy).toMatch(/1 is still held/);
    expect(oneHeld.exit.closed).toBe(1);
    expect(oneHeld.exit.otherSale).toBe(1);
    expect(oneHeld.exit.realizedUsd).toBe(56);
    expect(oneHeld.copy).toMatch(/1 is not the sale recorded/);
  });

  it('does not treat a second note on a sold copy as another sale', () => {
    const exit = showExit({
      notes: [
        note({ id: 'a', player: 'Aaron Judge', offerUsd: 100, cardId: 'judge' }),
        note({ id: 'b', player: 'Aaron Judge', offerUsd: 90, cardId: 'judge' }),
      ],
      inventory: [recorded('a', { id: 'judge', player: 'Aaron Judge', purchasePrice: 40 })],
      rangeForId: () => comps,
    });
    expect(exit.closed).toBe(1);
    expect(exit.otherSale).toBe(1);
    expect(exit.realizedUsd).toBe(56);
    expect(exit.feeUsd).toBe(7.6);
    expect(exitRowCopy(exit.rows.find((row) => row.id === 'b')!)).toMatch(/not the sale recorded on this copy/);
    const week = weekExit({
      notes: [
        note({ id: 'a', player: 'Aaron Judge', offerUsd: 100, cardId: 'judge', savedAt: new Date(NOW).toISOString() }),
        note({ id: 'b', player: 'Aaron Judge', offerUsd: 90, cardId: 'judge', savedAt: new Date(NOW).toISOString() }),
      ],
      inventory: [card({ id: 'judge', player: 'Aaron Judge', status: 'sold', purchasePrice: 40, notes: 'Sold on the floor log.' })],
      rangeForId: () => comps,
      now: NOW,
    });
    expect(week.exit.closed).toBe(0);
    expect(week.exit.stillHeld).toBe(0);
    expect(week.copy).toMatch(/No dated show sale this week is the sale recorded on the book/);
  });
});
