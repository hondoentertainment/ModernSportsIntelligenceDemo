import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  HOLD_QUEUE_CASH_KEY,
  HOLD_QUEUE_NOTE,
  HOLD_SLIP_CSV_HEADER,
  HOLD_SLIP_NOTE,
  HOLD_WAIT_NOTE,
  cashNeedDraft,
  downloadHoldSlip,
  holdQueueCopy,
  holdQueueRows,
  holdSlip,
  holdSlipCsv,
  holdWait,
  loadHoldQueueUnsold,
  parseCashNeed,
  readHoldQueueNeed,
  type HoldQueueSource,
  type HoldSlip,
} from '../../lib/collector/holdQueue';
import { floorBuyId } from '../../lib/collector/showClose';
import { store } from '../../lib/dal/syncStore';
import { HAGGLE_KEY } from '../../lib/shows/showHaggleLog';

const NOW = Date.parse('2026-10-31T12:00:00.000Z');

function source(overrides: Partial<HoldQueueSource> = {}): HoldQueueSource {
  return {
    id: 'near',
    player: 'Near',
    holdCall: 'hold',
    treatment: 'short-term',
    daysToLongTerm: 20,
    holdMarkUsd: 80,
    holdRealizedUsd: 56.8,
    ...overrides,
  };
}

describe('hold queue', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    store.remove(HOLD_QUEUE_CASH_KEY);
    store.remove(HAGGLE_KEY);
  });

  it('keeps the eBay fee and a tax determination off the note', () => {
    expect(HOLD_QUEUE_NOTE).toMatch(/35% versus 20%/);
    expect(HOLD_QUEUE_NOTE).toMatch(/~4% card-show fee/);
    expect(HOLD_QUEUE_NOTE).toMatch(/not the eBay fee/i);
    expect(HOLD_QUEUE_NOTE).toMatch(/not a tax determination, not the eBay fee, and not a live tape/i);
    expect(HOLD_QUEUE_NOTE).toMatch(/more than 45 days/);
    expect(HOLD_QUEUE_NOTE).toMatch(/need of \$0 takes no card/);
  });

  it('parses a typed cash need and ignores anything else', () => {
    expect(parseCashNeed('')).toBeNull();
    expect(parseCashNeed('   ')).toBeNull();
    expect(parseCashNeed('0')).toBe(0);
    expect(parseCashNeed('0.00')).toBe(0);
    expect(parseCashNeed('$1,200.50')).toBe(1200.5);
    expect(parseCashNeed('00.10')).toBe(0.1);
    expect(parseCashNeed('1000000')).toBe(1_000_000);
    expect(parseCashNeed('1000000.01')).toBeNull();
    expect(parseCashNeed('-1')).toBeNull();
    expect(parseCashNeed('12.')).toBeNull();
    expect(parseCashNeed('12.345')).toBeNull();
    expect(parseCashNeed('1e2')).toBeNull();
    expect(parseCashNeed('abc')).toBeNull();
    expect(cashNeedDraft(null)).toBe('');
    expect(cashNeedDraft(76.8)).toBe('76.8');
  });

  it('reads a stored need and drops a value this desk will not use', () => {
    expect(readHoldQueueNeed()).toBeNull();
    store.set(HOLD_QUEUE_CASH_KEY, 40);
    expect(readHoldQueueNeed()).toBe(40);
    store.set(HOLD_QUEUE_CASH_KEY, 12.344);
    expect(readHoldQueueNeed()).toBe(12.34);
    store.set(HOLD_QUEUE_CASH_KEY, '100');
    expect(readHoldQueueNeed()).toBeNull();
    store.set(HOLD_QUEUE_CASH_KEY, -5);
    expect(readHoldQueueNeed()).toBeNull();
    store.set(HOLD_QUEUE_CASH_KEY, 1_000_001);
    expect(readHoldQueueNeed()).toBeNull();
    store.set(HOLD_QUEUE_CASH_KEY, Number.NaN);
    expect(readHoldQueueNeed()).toBeNull();
    store.set(HOLD_QUEUE_CASH_KEY, Number.POSITIVE_INFINITY);
    expect(readHoldQueueNeed()).toBeNull();
  });

  it('stays quiet when no unsold card has a call or a mark', () => {
    expect(holdQueueRows([])).toEqual([]);
    expect(holdQueueCopy([])).toBe('');
    expect(holdQueueCopy([source({ holdCall: null })])).toBe('');
    expect(holdQueueCopy([source({ holdMarkUsd: null })])).toBe('');
    expect(holdQueueCopy([source({ holdMarkUsd: -1 })])).toBe('');
    expect(holdQueueCopy([source({ holdMarkUsd: Number.NaN })])).toBe('');
    expect(holdQueueCopy([source()], Number.NaN, NOW)).toMatch(/sell under and clear before a hold/);
    expect(holdQueueCopy([source()], -5, NOW)).toMatch(/sell under and clear before a hold/);
    expect(holdQueueCopy([source()], 1_000_001, NOW)).toMatch(/sell under and clear before a hold/);
  });

  it('sells under and clear before a hold and breaks the cheaper hold first', () => {
    const rows = holdQueueRows([
      source({ id: 'far', player: 'Far', holdMarkUsd: 50, holdRealizedUsd: 133.33, daysToLongTerm: 40 }),
      source({ id: 'near-b', player: 'Near', holdMarkUsd: 30, holdRealizedUsd: 56.8, daysToLongTerm: 20 }),
      source(),
      source({ id: 'cheap', player: 'Cheap', holdCall: 'under', treatment: 'short-term', holdMarkUsd: 62, holdRealizedUsd: -4, daysToLongTerm: 12 }),
      source({ id: 'rich', player: 'Rich', holdCall: 'under', treatment: 'long-term', holdMarkUsd: 10, holdRealizedUsd: -1, daysToLongTerm: 0 }),
      source({ id: 'booked', player: 'Booked', holdCall: 'clear', treatment: 'long-term', holdMarkUsd: 80, holdRealizedUsd: 40, daysToLongTerm: 0 }),
    ], NOW);
    expect(rows.map((row) => row.player)).toEqual(['Cheap', 'Rich', 'Booked', 'Near', 'Near', 'Far']);
    expect(rows[0]).toMatchObject({ call: 'under', cashUsd: 59.52, lineOn: null, keptUsd: 0 });
    expect(rows[2]).toMatchObject({ call: 'clear', cashUsd: 76.8, lineOn: null });
    expect(rows[3]).toMatchObject({
      call: 'hold',
      cashUsd: 76.8,
      keptUsd: 8.52,
      lineOn: '2026-11-20',
      perDayUsd: 0.43,
    });
    expect(rows[4]?.cashUsd).toBe(28.8);
    expect(rows[5]).toMatchObject({ keptUsd: 20, lineOn: '2026-12-10' });
    expect(rows.map((row) => row.id)).toEqual(['cheap', 'rich', 'booked', 'near', 'near-b', 'far']);
    const tied = holdQueueRows([
      source({ id: 'b', player: 'Twin' }),
      source({ id: 'a', player: 'Twin' }),
    ], NOW);
    expect(tied.map((row) => row.id)).toEqual(['a', 'b']);
    expect(holdQueueCopy([source()], Number.NaN)).toMatch(/sell under and clear before a hold/);
  });

  it('names the line, the dollars a day, and a hold that keeps nothing', () => {
    expect(holdQueueCopy([source({ player: '  ' })], null, NOW)).toBe(
      'Hold queue: sell under and clear before a hold, because waiting keeps nothing more. Order: Unsold card (raises $76.8 after the card-show fee, gives up $8.52, line 2026-11-20, $0.43 a day). Not a tax determination and not a live tape.',
    );
    expect(holdQueueCopy([
      source({ holdRealizedUsd: 0.05, daysToLongTerm: 45 }),
    ], null, NOW)).toMatch(/gives up \$0\.01, line 2026-12-15, under \$0\.01 a day/);
    expect(holdQueueCopy([
      source({ holdRealizedUsd: 0.01, daysToLongTerm: 20 }),
    ], null, NOW)).toMatch(/gives up nothing\)/);
    expect(holdQueueCopy([
      source({ daysToLongTerm: null }),
    ], null, NOW)).toBe(
      'Hold queue: sell under and clear before a hold, because waiting keeps nothing more. Order: Near (raises $76.8 after the card-show fee, gives up $8.52). Not a tax determination and not a live tape.',
    );
    expect(holdQueueCopy([
      source({ id: 'booked', player: 'Booked', holdCall: 'clear', treatment: 'long-term', daysToLongTerm: 0, holdRealizedUsd: 40 }),
    ], null, NOW)).toMatch(/Booked \(raises \$76\.8 after the card-show fee, clear, waiting keeps nothing more\)/);
    const year = holdQueueCopy([source({ daysToLongTerm: 20 })], null, Date.parse('2026-12-20T12:00:00.000Z'));
    expect(year).toMatch(/line 2027-01-09/);
  });

  it('covers a typed need with whole cards and leaves the holds that still pay', () => {
    const book = [
      source({ id: 'cheap', player: 'Cheap', holdCall: 'under', holdMarkUsd: 62, holdRealizedUsd: -4, daysToLongTerm: 12 }),
      source(),
      source({ id: 'far', player: 'Far', holdMarkUsd: 50, holdRealizedUsd: 133.33, daysToLongTerm: 40 }),
    ];
    expect(holdQueueCopy(book, 0, NOW)).toMatch(/a table need of \$0 takes no card/);
    expect(holdQueueCopy(book, 50, NOW)).toBe(
      'Hold queue: $50 at the table takes Cheap. Gives up nothing. Near and Far stay holds. Waiting keeps $28.52. The soonest line is 2026-11-20. Order: Cheap (raises $59.52 after the card-show fee, under, waiting keeps nothing more), Near (raises $76.8 after the card-show fee, gives up $8.52, line 2026-11-20, $0.43 a day), and Far (raises $48 after the card-show fee, gives up $20, line 2026-12-10, $0.5 a day). Not a tax determination and not a live tape.',
    );
    expect(holdQueueCopy(book, 60, NOW)).toMatch(
      /\$60 at the table takes Cheap and Near\. Gives up \$8\.52\. Far stays a hold\. Waiting keeps \$20 until 2026-12-10, \$0\.5 a day/,
    );
    expect(holdQueueCopy(book, 200, NOW)).toMatch(
      /\$200 at the table takes Cheap, Near, and Far\. Gives up \$28\.52 and is still short \$15\.68/,
    );
    expect(holdQueueCopy(book, 200, NOW)).not.toMatch(/stays a hold/);
    expect(holdQueueCopy([
      source({ id: 'zero', player: 'Zero', holdCall: 'under', holdMarkUsd: 0, holdRealizedUsd: -2, daysToLongTerm: 0 }),
    ], 10, NOW)).toBe(
      'Hold queue: $10 at the table stays uncovered. No listed card raises cash after the card-show fee. Order: Zero (raises $0 after the card-show fee, under, waiting keeps nothing more). Not a tax determination and not a live tape.',
    );
    expect(holdQueueCopy([
      source({ id: 'quiet', player: 'Quiet', daysToLongTerm: null, holdMarkUsd: 0 }),
      source({ id: 'also', player: 'Also', daysToLongTerm: null, holdRealizedUsd: 56.8, holdMarkUsd: 0 }),
    ], 10, NOW)).toMatch(/Also and Quiet stay holds\. Waiting keeps \$17\.04\./);
    expect(holdQueueCopy([
      source({ id: 'quiet', player: 'Quiet', daysToLongTerm: null, holdMarkUsd: 0 }),
    ], 10, NOW)).toMatch(/Quiet stays a hold\. Waiting keeps \$8\.52\./);
  });

  it('cuts the order after four cards', () => {
    const rows = ['Ada', 'Bea', 'Cara', 'Dee', 'Eve'].map((player, index) => source({
      id: player,
      player,
      holdCall: 'under',
      holdMarkUsd: 24 - index,
      holdRealizedUsd: -1,
      daysToLongTerm: 0,
    }));
    const copy = holdQueueCopy(rows, 1_000, NOW);
    expect(copy).toMatch(/Ada \(raises \$23\.04 after the card-show fee, under, waiting keeps nothing more\), Bea \(raises \$22\.08 after the card-show fee, under, waiting keeps nothing more\), Cara \(raises \$21\.12 after the card-show fee, under, waiting keeps nothing more\), Dee \(raises \$20\.16 after the card-show fee, under, waiting keeps nothing more\), and 1 more/);
    expect(copy).toMatch(/takes Ada, Bea, Cara, Dee, and 1 more/);
    expect(copy).toMatch(/still short/);
  });

  it('loads unsold show cards and ignores a book with no call', () => {
    expect(holdQueueCopy(loadHoldQueueUnsold([]), null, NOW)).toBe('');
    const boughtAt = new Date(NOW - 330 * 24 * 60 * 60 * 1000).toISOString();
    store.set(HAGGLE_KEY, [{
      id: 'near-buy',
      showId: 'nyc',
      dealer: 'Ada',
      table: '1',
      askUsd: 20,
      offerUsd: 20,
      result: 'bought',
      note: '',
      player: 'Near',
      savedAt: boughtAt,
    }]);
    const unsold = loadHoldQueueUnsold([{
      id: floorBuyId('near-buy'),
      player: 'Near',
      purchasePrice: 20,
      purchaseDate: boughtAt,
      currentValue: 80,
      status: 'active',
    }], NOW);
    expect(holdQueueRows(unsold, NOW)[0]).toMatchObject({
      player: 'Near',
      call: 'hold',
      keptUsd: 8.52,
      lineOn: '2026-12-04',
    });
  });
});

describe('hold slip', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const book = [
    source({ id: 'cheap', player: 'Cheap', holdCall: 'under', holdMarkUsd: 62, holdRealizedUsd: -4, daysToLongTerm: 12 }),
    source({ id: 'tiny', player: 'Tiny', holdCall: 'under', holdMarkUsd: 10, holdRealizedUsd: -1, daysToLongTerm: 0 }),
    source(),
    source({ id: 'far', player: 'Far', holdMarkUsd: 50, holdRealizedUsd: 133.33, daysToLongTerm: 40 }),
  ];

  it('keeps the realized file, the eBay fee, and Web Push off the note', () => {
    expect(HOLD_SLIP_NOTE).toMatch(/next, take, stay, later, or off/);
    expect(HOLD_SLIP_NOTE).toMatch(/not the realized-results download/i);
    expect(HOLD_SLIP_NOTE).toMatch(/Unsold cards stay off that file/);
    expect(HOLD_SLIP_NOTE).toMatch(/not the eBay fee/i);
    expect(HOLD_SLIP_NOTE).toMatch(/not Web Push/i);
    expect(HOLD_SLIP_NOTE).toMatch(/need of \$0 takes no card/);
    expect(HOLD_SLIP_NOTE).toMatch(/not a live tape/i);
  });

  it('stays quiet when the queue has no card', () => {
    expect(holdSlip([])).toBeNull();
    expect(holdSlip([source({ holdCall: null })])).toBeNull();
    expect(holdSlip([source({ holdMarkUsd: null })])).toBeNull();
    expect(holdSlip([source()], Number.NaN, NOW)?.bookCopy).toMatch(/No cash need is typed/);
    expect(holdSlip([source()], -5, NOW)?.copy).toMatch(/sell Near/);
    expect(holdSlip([source()], 1_000_001, NOW)?.alert).toBeNull();
  });

  it('names the next card and the book when no cash need is typed', () => {
    const slip = holdSlip(book, null, NOW);
    expect(slip?.rows.map((row) => row.place)).toEqual(['next', 'later', 'later', 'later']);
    expect(slip?.copy).toBe(
      'Next: sell Cheap. It raises $59.52 after the card-show fee. Waiting keeps nothing more.',
    );
    expect(slip?.bookCopy).toBe(
      'Book: the order raises $193.92 after the card-show fee. Waiting does not pay to keep $69.12 of that. Paying holds are worth $28.52 if you wait. The soonest line is 2026-11-20. No cash need is typed, so this book does not take a card.',
    );
    expect(slip?.alert).toBeNull();
    expect(slip?.book).toMatchObject({
      orderCashUsd: 193.92,
      freeCashUsd: 69.12,
      holdWorthUsd: 28.52,
      takeCount: 0,
      shortUsd: 0,
    });
    expect(holdSlip([
      source({ id: 'booked', player: 'Booked', holdCall: 'clear', treatment: 'long-term', daysToLongTerm: 0, holdRealizedUsd: 40 }),
    ], null, NOW)?.copy).toBe(
      'Next: sell Booked. It raises $76.8 after the card-show fee. Waiting keeps nothing more.',
    );
    expect(holdSlip([source({ player: '  ' })], null, NOW)?.copy).toBe(
      'Next: sell Unsold card. It raises $76.8 after the card-show fee and gives up $8.52. The line is 2026-11-20, $0.43 a day.',
    );
    expect(holdSlip([
      source({ holdRealizedUsd: 0.05, daysToLongTerm: 45 }),
    ], null, NOW)?.copy).toMatch(/gives up \$0\.01\. The line is 2026-12-15, under \$0\.01 a day/);
    expect(holdSlip([source({ daysToLongTerm: null })], null, NOW)?.copy).toBe(
      'Next: sell Near. It raises $76.8 after the card-show fee and gives up $8.52.',
    );
    expect(holdSlip([source({ daysToLongTerm: null })], null, NOW)?.bookCopy).toBe(
      'Book: the order raises $76.8 after the card-show fee. All of that breaks a paying hold, worth $8.52 if you wait. No cash need is typed, so this book does not take a card.',
    );
    expect(holdSlip([
      source({ holdRealizedUsd: 0.01, daysToLongTerm: 20 }),
    ], null, NOW)?.copy).toBe(
      'Next: sell Near. It raises $76.8 after the card-show fee and gives up nothing.',
    );
  });

  it('covers a typed need, leaves the holds, and alerts when the take gives up hold worth', () => {
    expect(holdSlip(book, 0, NOW)?.copy).toBe('Next: a table need of $0 takes no card.');
    expect(holdSlip(book, 0, NOW)?.bookCopy).toMatch(/A need of \$0 takes no card off this book\./);
    expect(holdSlip(book, 0, NOW)?.rows.every((row) => row.place === 'off')).toBe(true);
    expect(holdSlip(book, 0, NOW)?.alert).toBeNull();

    const covered = holdSlip(book, 50, NOW);
    expect(covered?.copy).toBe('Next: sell Cheap. That covers $50 and gives up nothing.');
    expect(covered?.rows.map((row) => [row.player, row.place])).toEqual([
      ['Cheap', 'next'],
      ['Tiny', 'off'],
      ['Near', 'stay'],
      ['Far', 'stay'],
    ]);
    expect(covered?.bookCopy).toMatch(/A need of \$50 takes 1 card, raises \$59\.52, and gives up nothing\. 2 holds stay, and waiting keeps \$28\.52\. The soonest line left is 2026-11-20\./);
    expect(covered?.alert).toBeNull();

    const pair = holdSlip(book, 60, NOW);
    expect(pair?.copy).toBe('Next: sell Cheap and Tiny. That covers $60 and gives up nothing.');
    expect(pair?.alert).toBeNull();

    const give = holdSlip(book, 80, NOW);
    expect(give?.copy).toBe('Next: sell Cheap, Tiny, and Near. That covers $80 and gives up $8.52.');
    expect(give?.bookCopy).toMatch(/takes 3 cards, raises \$145\.92, and gives up \$8\.52\. 1 hold stays, and waiting keeps \$20\. The soonest line left is 2026-12-10\./);
    expect(give?.alert).toEqual({
      copy: 'Hold slip: a table need of $80 covers and gives up $8.52 by selling Cheap, Tiny, and Near. Not a tax determination and not a live tape.',
      player: 'Near',
      href: '/audit-dossier?cardId=near',
    });

    const short = holdSlip(book, 200, NOW);
    expect(short?.copy).toBe(
      'Next: sell Cheap, Tiny, Near, and Far. That raises $193.92 toward $200 and is still short $6.08. Gives up $28.52.',
    );
    expect(short?.bookCopy).toMatch(/The book is still short \$6\.08\./);
    expect(short?.bookCopy).not.toMatch(/stays/);
    expect(short?.alert?.copy).toBe(
      'Hold slip: a table need of $200 is still short $6.08. Selling Cheap, Tiny, Near, and Far gives up $28.52. Not a tax determination and not a live tape.',
    );
    expect(short?.alert?.href).toBe('/audit-dossier?cardId=near');
  });

  it('warns when the need stays short without breaking a hold, and when nothing raises cash', () => {
    const short = holdSlip([
      source({ id: 'cheap', player: 'Cheap', holdCall: 'under', holdMarkUsd: 62, holdRealizedUsd: -4, daysToLongTerm: 12 }),
    ], 100, NOW);
    expect(short?.copy).toBe(
      'Next: sell Cheap. That raises $59.52 toward $100 and is still short $40.48. Gives up nothing.',
    );
    expect(short?.alert).toEqual({
      copy: 'Hold slip: a table need of $100 is still short $40.48 after Cheap. Waiting keeps nothing more on that take. Not a tax determination and not a live tape.',
      player: 'Cheap',
      href: '/audit-dossier?cardId=cheap',
    });

    const quiet = holdSlip([
      source({ id: 'quiet', player: 'Quiet', daysToLongTerm: null, holdMarkUsd: 0 }),
      source({ id: 'cheap', player: 'Cheap', holdCall: 'under', holdMarkUsd: 62, holdRealizedUsd: -4, daysToLongTerm: 12 }),
    ], 10, NOW);
    expect(quiet?.bookCopy).toMatch(/1 hold stays, and waiting keeps \$8\.52\./);
    expect(quiet?.bookCopy).not.toMatch(/line left/);
    expect(quiet?.alert).toBeNull();

    const uncovered = holdSlip([
      source({ id: 'zero', player: 'Zero', holdCall: 'under', holdMarkUsd: 0, holdRealizedUsd: -2, daysToLongTerm: 0 }),
    ], 10, NOW);
    expect(uncovered?.copy).toBe(
      'Next: $10 at the table stays uncovered. No listed card raises cash after the card-show fee.',
    );
    expect(uncovered?.bookCopy).toMatch(/Waiting does not pay to keep any of it\. A need of \$10 stays uncovered\. This book takes no card\./);
    expect(uncovered?.alert).toEqual({
      copy: 'Hold slip: a table need of $10 stays uncovered. No listed card raises cash after the card-show fee. Not a tax determination and not a live tape.',
      player: null,
      href: null,
    });
  });

  it('cuts the next card list after four names', () => {
    const rows = ['Ada', 'Bea', 'Cara', 'Dee', 'Eve'].map((player) => source({
      id: player,
      player,
      holdCall: 'under',
      holdMarkUsd: 10,
      holdRealizedUsd: -1,
      daysToLongTerm: 0,
    }));
    const slip = holdSlip(rows, 1_000, NOW);
    expect(slip?.copy).toMatch(/sell Ada, Bea, Cara, Dee, and 1 more/);
    expect(slip?.alert?.copy).toMatch(/after Ada, Bea, Cara, Dee, and 1 more/);
    expect(slip?.alert?.player).toBe('Ada');
  });

  it('downloads the order and leaves a card with no call off the file', () => {
    const slip = holdSlip([
      ...book,
      source({ id: 'skip', player: '=Cheap, "A"', holdCall: null }),
    ], 80, NOW);
    expect(slip).not.toBeNull();
    const csv = holdSlipCsv(slip as HoldSlip);
    expect(csv.startsWith(`${HOLD_SLIP_CSV_HEADER}\n`)).toBe(true);
    expect(csv).toContain('1,Cheap,under,59.52,0,,,next');
    expect(csv).toContain('2,Tiny,under,9.6,0,,,take');
    expect(csv).toContain('3,Near,hold,76.8,8.52,2026-11-20,0.43,take');
    expect(csv).toContain('4,Far,hold,48,20,2026-12-10,0.5,stay');
    expect(csv).not.toContain('=Cheap');
    const blank = holdSlip([
      source({ id: 'odd', player: '=Cheap, "A"', holdCall: 'under', holdMarkUsd: 10, holdRealizedUsd: -1, daysToLongTerm: 0 }),
    ], null, NOW);
    expect(holdSlipCsv(blank as HoldSlip)).toContain(`"'=Cheap, ""A""",under,9.6,0,,,next`);
    expect(holdSlipCsv({
      ...(blank as HoldSlip),
      rows: [{
        ...(blank as HoldSlip).rows[0],
        cashUsd: Number.NaN,
        keptUsd: Number.POSITIVE_INFINITY,
        perDayUsd: Number.NaN,
      }],
    })).toContain('1,');
    expect(holdSlipCsv({
      ...(blank as HoldSlip),
      rows: [{
        ...(blank as HoldSlip).rows[0],
        cashUsd: Number.NaN,
        keptUsd: Number.POSITIVE_INFINITY,
        perDayUsd: Number.NaN,
      }],
    })).toMatch(/,under,,,,,next/);
    const createObjectURL = vi.fn(() => 'blob:slip');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });
    downloadHoldSlip(slip as HoldSlip, 'msi-hold-slip.csv', null);
    expect(createObjectURL).not.toHaveBeenCalled();
    downloadHoldSlip(slip as HoldSlip);
    expect(createObjectURL).toHaveBeenCalled();
    const blob = createObjectURL.mock.calls[0]?.[0] as Blob;
    expect(blob.type).toMatch(/text\/csv/);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:slip');
  });
});

describe('hold wait', () => {
  const book = [
    source({ id: 'cheap', player: 'Cheap', holdCall: 'under', holdMarkUsd: 62, holdRealizedUsd: -4, daysToLongTerm: 12 }),
    source({ id: 'tiny', player: 'Tiny', holdCall: 'under', holdMarkUsd: 10, holdRealizedUsd: -1, daysToLongTerm: 0 }),
    source(),
    source({ id: 'far', player: 'Far', holdMarkUsd: 50, holdRealizedUsd: 133.33, daysToLongTerm: 40 }),
  ];

  it('keeps the slip file, the eBay fee, and Web Push off the note', () => {
    expect(HOLD_WAIT_NOTE).toMatch(/not the hold slip file/i);
    expect(HOLD_WAIT_NOTE).toMatch(/not the eBay fee/i);
    expect(HOLD_WAIT_NOTE).toMatch(/not Web Push/i);
    expect(HOLD_WAIT_NOTE).toMatch(/need of \$0 does not wait/);
    expect(HOLD_WAIT_NOTE).toMatch(/no line date/);
    expect(HOLD_WAIT_NOTE).toMatch(/not a live tape/i);
  });

  it('stays quiet when the queue has no card, no need, or nothing to gain by waiting', () => {
    expect(holdWait([])).toBeNull();
    expect(holdWait([source({ holdCall: null })])).toBeNull();
    expect(holdWait([source({ holdMarkUsd: null })])).toBeNull();
    expect(holdWait(book, Number.NaN, NOW)?.copy).toBe(
      'Wait: no cash need is typed, so this desk does not name a day to wait.',
    );
    expect(holdWait(book, -5, NOW)?.alert).toBeNull();
    expect(holdWait(book, 1_000_001, NOW)?.day).toBeNull();
    expect(holdWait(book, 0, NOW)).toEqual({
      day: null,
      keptUsd: 0,
      copy: 'Wait: a table need of $0 does not wait.',
      alert: null,
    });
    expect(holdWait(book, 50, NOW)?.copy).toBe(
      'Wait: selling today covers $50 and gives up nothing, so waiting does not change which cards come off.',
    );
    expect(holdWait(book, 200, NOW)?.copy).toBe(
      'Wait: waiting does not raise more than the order. The table stays short $6.08.',
    );
    expect(holdWait(book, 200, NOW)?.alert).toBeNull();
  });

  it('names the earliest day the same cards cover without giving up hold worth', () => {
    const wait = holdWait(book, 80, NOW);
    expect(wait?.day).toBe('2026-11-20');
    expect(wait?.keptUsd).toBe(8.52);
    expect(wait?.copy).toBe(
      'Wait: wait until 2026-11-20. Sell Cheap, Tiny, and Near. That covers $80 and keeps the $8.52 selling today would give up. Far stays a hold until 2026-12-10.',
    );
    expect(wait?.alert).toEqual({
      copy: 'Hold wait: waiting until 2026-11-20 covers $80 and keeps $8.52. Selling Cheap, Tiny, and Near today gives that up. Not a tax determination and not a live tape.',
      player: 'Near',
      href: '/audit-dossier?cardId=near',
    });

    const later = holdWait(book, 150, NOW);
    expect(later?.day).toBe('2026-12-10');
    expect(later?.copy).toBe(
      'Wait: wait until 2026-12-10. Sell Cheap, Tiny, Near, and Far. That covers $150 and keeps the $28.52 selling today would give up.',
    );
    expect(later?.alert?.href).toBe('/audit-dossier?cardId=far');
    expect(later?.alert?.player).toBe('Far');
  });

  it('sells a later clear card instead of the hold that is cheapest today', () => {
    const wait = holdWait([
      source({ id: 'cheap', player: 'Cheap', holdCall: 'under', holdMarkUsd: 10, holdRealizedUsd: -1, daysToLongTerm: 0 }),
      source({ id: 'near', player: 'Near', holdMarkUsd: 10, daysToLongTerm: 20 }),
      source({ id: 'far', player: 'Far', holdMarkUsd: 80, holdRealizedUsd: 133.33, daysToLongTerm: 40 }),
    ], 70, NOW);
    expect(wait?.copy).toBe(
      'Wait: wait until 2026-12-10. Sell Cheap and Far. That covers $70 and keeps the $28.52 selling today would give up. Near is clear by then and stays off the take.',
    );
    expect(wait?.alert?.copy).toBe(
      'Hold wait: waiting until 2026-12-10 covers $70 and keeps $28.52. Selling Cheap, Near, and Far today gives that up. Not a tax determination and not a live tape.',
    );
    expect(wait?.alert?.href).toBe('/audit-dossier?cardId=far');
  });

  it('leaves holds that cross together off the take when one of them covers', () => {
    const wait = holdWait([
      source({ id: 'ada', player: 'Ada', holdMarkUsd: 80, daysToLongTerm: 20 }),
      source({ id: 'bea', player: 'Bea', holdMarkUsd: 50, holdRealizedUsd: 133.33, daysToLongTerm: 20 }),
      source({ id: 'cara', player: 'Cara', holdMarkUsd: 10, daysToLongTerm: 20 }),
    ], 70, NOW);
    expect(wait?.copy).toBe(
      'Wait: wait until 2026-11-20. Sell Ada. That covers $70 and keeps the $8.52 selling today would give up. Cara and Bea are clear by then and stay off the take.',
    );
    expect(wait?.alert?.player).toBe('Ada');
  });

  it('keeps a later hold and a hold with no line when an earlier line covers', () => {
    const stayed = holdWait([
      source({ id: 'cheap', player: 'Cheap', holdCall: 'under', holdMarkUsd: 62, holdRealizedUsd: -4, daysToLongTerm: 12 }),
      source(),
      source({ id: 'mid', player: 'Mid', holdMarkUsd: 20, daysToLongTerm: 25 }),
      source({ id: 'far', player: 'Far', holdMarkUsd: 50, holdRealizedUsd: 133.33, daysToLongTerm: 40 }),
    ], 60, NOW);
    expect(stayed?.copy).toBe(
      'Wait: wait until 2026-11-20. Sell Cheap and Near. That covers $60 and keeps the $8.52 selling today would give up. Mid and Far stay holds. The soonest line left is 2026-11-25.',
    );

    const quiet = holdWait([
      source({ id: 'cheap', player: 'Cheap', holdCall: 'under', holdMarkUsd: 62, holdRealizedUsd: -4, daysToLongTerm: 12 }),
      source(),
      source({ id: 'quiet', player: 'Quiet', daysToLongTerm: null, holdMarkUsd: 0 }),
    ], 60, NOW);
    expect(quiet?.copy).toBe(
      'Wait: wait until 2026-11-20. Sell Cheap and Near. That covers $60 and keeps the $8.52 selling today would give up. Quiet stays a hold and has no line date.',
    );
    expect(holdWait([
      source({ id: 'cheap', player: 'Cheap', holdCall: 'under', holdMarkUsd: 62, holdRealizedUsd: -4, daysToLongTerm: 12 }),
      source(),
      source({ id: 'quiet', player: 'Quiet', daysToLongTerm: null, holdMarkUsd: 0 }),
      source({ id: 'also', player: 'Also', daysToLongTerm: null, holdMarkUsd: 0 }),
    ], 60, NOW)?.copy).toBe(
      'Wait: wait until 2026-11-20. Sell Cheap and Near. That covers $60 and keeps the $8.52 selling today would give up. Also and Quiet stay holds.',
    );
  });

  it('says waiting cannot cover a need that still sells a hold with no line', () => {
    expect(holdWait([
      source({ id: 'cheap', player: 'Cheap', holdCall: 'under', holdMarkUsd: 62, holdRealizedUsd: -4, daysToLongTerm: 12 }),
      source({ daysToLongTerm: null }),
    ], 60, NOW)?.copy).toBe(
      'Wait: no wait covers $60 without giving up hold worth. Near has no line date.',
    );
    expect(holdWait([
      source({ id: 'cheap', player: 'Cheap', holdCall: 'under', holdMarkUsd: 10, holdRealizedUsd: -1, daysToLongTerm: 0 }),
      source({ id: 'near', player: 'Near', holdMarkUsd: 10, daysToLongTerm: null }),
      source({ id: 'far', player: 'Far', holdMarkUsd: 80, holdRealizedUsd: 133.33, daysToLongTerm: null }),
    ], 80, NOW)?.copy).toBe(
      'Wait: no wait covers $80 without giving up hold worth. Near and Far have no line date.',
    );
  });
});
