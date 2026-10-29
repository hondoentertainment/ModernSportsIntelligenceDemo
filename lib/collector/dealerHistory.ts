/**
 * Prices typed for each dealer and table on this browser.
 * Fair means more of the scored asks sat at or under that card's walk
 * than over it. A note with no card in the book stays off the score.
 * Not a dealer rating and not a live tape.
 */
import { buyLadder } from './offerLadder';
import { buySeat } from './ladderScore';
import type { SaleRange } from './saleRange';
import { isLot } from './tableLot';
import { paidOnNote } from './showClose';

export const DEALER_HISTORY_NOTE =
  'Prices you typed for each dealer and table on this browser. Fair means more of the scored asks sat at or under that card\'s walk than over it. A note with no card in the book stays off the score. Not a dealer rating and not a live tape.';

export type DealerCall = 'fair' | 'steep' | 'even' | 'unscored';

export interface HistoryNote {
  dealer: string;
  table: string;
  askUsd: number;
  offerUsd: number;
  result: string;
  cardId?: string;
  lines?: readonly { cardId?: string; askUsd?: number }[];
}

export interface DealerRow {
  dealer: string;
  table: string;
  key: string;
  count: number;
  bought: number;
  passed: number;
  open: number;
  paidUsd: number;
  quotedUsd: number;
  overWalk: number;
  atOrUnder: number;
  unscored: number;
  call: DealerCall;
}

function cents(value: number): number {
  return Math.round(value * 100) / 100;
}

function money(value: number): string {
  return `$${cents(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function add(sum: number, value: number): number {
  return cents(sum + value);
}

function keyOf(dealer: string, table: string): string {
  return `${dealer.trim().toLowerCase()}|${table.trim().toLowerCase()}`;
}

function seatOf(ask: number | undefined, range: SaleRange | null | undefined): 'over' | 'under' | 'off' {
  if (!range || ask == null) return 'off';
  const seat = buySeat(ask, buyLadder(range));
  if (seat == null) return 'off';
  return seat === 'over walk' ? 'over' : 'under';
}

function asksOf(note: HistoryNote): Array<{ ask?: number; cardId?: string }> {
  if (isLot(note)) {
    return (note.lines ?? []).map((line) => ({ ask: line.askUsd, cardId: line.cardId }));
  }
  return [{ ask: note.askUsd, cardId: note.cardId }];
}

function callOf(over: number, under: number): DealerCall {
  if (over + under === 0) return 'unscored';
  if (over > under) return 'steep';
  if (under > over) return 'fair';
  return 'even';
}

export function dealerHistory(
  notes: readonly HistoryNote[],
  ranges: Readonly<Record<string, SaleRange | null | undefined>>,
): DealerRow[] {
  const groups = new Map<string, DealerRow>();
  for (const note of notes) {
    const dealer = note.dealer.trim();
    const table = note.table.trim();
    if (!dealer || !table) continue;
    const key = keyOf(dealer, table);
    let row = groups.get(key);
    if (!row) {
      row = {
        dealer,
        table,
        key,
        count: 0,
        bought: 0,
        passed: 0,
        open: 0,
        paidUsd: 0,
        quotedUsd: 0,
        overWalk: 0,
        atOrUnder: 0,
        unscored: 0,
        call: 'unscored',
      };
      groups.set(key, row);
    }
    row.count += 1;
    if (note.result === 'bought') row.bought += 1;
    else if (note.result === 'passed') row.passed += 1;
    else if (note.result === 'open') row.open += 1;
    if (note.askUsd > 0) row.quotedUsd = add(row.quotedUsd, note.askUsd);
    if (note.result === 'bought') {
      const paid = paidOnNote(note);
      if (paid) row.paidUsd = add(row.paidUsd, paid.usd);
    }
    for (const ask of asksOf(note)) {
      const seat = seatOf(ask.ask, ask.cardId ? ranges[ask.cardId] : null);
      if (seat === 'over') row.overWalk += 1;
      else if (seat === 'under') row.atOrUnder += 1;
      else row.unscored += 1;
    }
    row.call = callOf(row.overWalk, row.atOrUnder);
  }
  return [...groups.values()].sort((a, b) => (
    b.count - a.count
    || b.quotedUsd - a.quotedUsd
    || a.dealer.localeCompare(b.dealer)
    || a.table.localeCompare(b.table)
    || a.key.localeCompare(b.key)
  ));
}

function noun(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function dealerRowCopy(row: DealerRow): string {
  const results = `${row.bought} bought, ${row.passed} passed, ${row.open} open`;
  let fair = 'No ask on this dealer sits on a card in the book.';
  if (row.call === 'fair') {
    fair = `${noun(row.atOrUnder, 'ask sits', 'asks sit')} at or under the walk, ${row.overWalk} over. Fair on this book.`;
  } else if (row.call === 'steep') {
    fair = `${noun(row.overWalk, 'ask sits', 'asks sit')} over the walk, ${row.atOrUnder} at or under. Steep on this book.`;
  } else if (row.call === 'even') {
    fair = `${row.atOrUnder} at or under the walk and ${row.overWalk} over. Even on this book.`;
  }
  const off = row.call === 'unscored' || row.unscored === 0
    ? ''
    : ` ${noun(row.unscored, 'ask stays off the score.', 'asks stay off the score.')}`;
  return `${row.dealer} · table ${row.table} · ${noun(row.count, 'note', 'notes')} · paid ${money(row.paidUsd)} · quoted ${money(row.quotedUsd)} · ${results}. ${fair}${off} Not a dealer rating and not a live tape.`;
}
