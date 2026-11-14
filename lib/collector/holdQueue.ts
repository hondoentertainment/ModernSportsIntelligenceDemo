/**
 * Which unsold card to sell first when the table needs cash, the hold
 * slip that says the next card to pull, and the hold wait that names
 * the earliest day that cash is covered without giving up hold worth.
 * Under and clear come off before a hold, because waiting keeps
 * nothing more. A hold breaks from the smallest dollars kept, the
 * same difference hold worth already prices after the ~4% card-show
 * fee. The line is the UTC day that hold crosses into long-term. The
 * slip names that next card, what the order does to the book, and a
 * file of the order. The wait names the day a hold joins the cards
 * waiting no longer pays to keep. The eBay fee stays off this desk.
 * Not a tax determination and not a live tape.
 */
import { store } from '../dal/syncStore';
import { haggleSnapshot } from '../shows/showHaggleLog';
import { readFloorDecisions } from '../shows/showTripLoop';
import type { ShowHoldCall } from './holdingBuckets';
import { gainWorth } from './holdWorth';
import { longTermOn, type HoldTreatment } from './inventoryAge';
import { exitMath } from './showExit';
import { showPnl, type PnlBookCard } from './showPnl';

export const HOLD_QUEUE_CASH_KEY = 'msi_hold_queue_cash_need';

export const HOLD_QUEUE_NOTE =
  'Hold queue names which unsold card to sell first when the table needs cash. Under and clear come off before a hold, because waiting keeps nothing more. A hold breaks from the smallest dollars kept, the same 35% versus 20% difference after the ~4% card-show fee. The line is the UTC day that hold crosses the 365-day line, and the daily figure is those dollars divided by the days left. Cash is the stored mark after that fee. A typed need on this browser takes whole cards until the cash is covered and names what that gives up. A blank amount lists the order. A need of $0 takes no card. A card that raises nothing does not cover the need. A missing mark, a buy that is not filed, and a short-term gain more than 45 days from the line stay off. A price you have not recorded yet stays on the show exit. Not a tax determination, not the eBay fee, and not a live tape.';

export const HOLD_SLIP_NOTE =
  'The hold slip names the next card to pull from that order, the cash the order raises after the ~4% card-show fee, and what a typed need does to the book. Waiting does not pay to keep an under card or a clear card. A paying hold is worth the dollars waiting keeps. The file is that order: next, take, stay, later, or off. A blank amount does not pretend a need. A need of $0 takes no card. A card that raises nothing does not cover the need. An alert appears when that need is short or gives up hold worth, and it stays quiet when the need covers and gives up nothing. A missing mark, a buy that is not filed, and a short-term gain more than 45 days from the line stay off. This file is not the realized-results download. Unsold cards stay off that file. Not a tax determination, not the eBay fee, not Web Push, and not a live tape.';

export const HOLD_WAIT_NOTE =
  'Hold wait names the earliest day a typed cash need is covered by cards waiting no longer pays to keep. Under and clear are already in that set. A hold joins it on the UTC day the purchase reaches the 365.25-day line. The rounded countdown on the hold queue is not that day. The cash is still the stored mark after the ~4% card-show fee. Selling today when that day exists gives up hold worth this wait keeps. A blank amount does not name a day. A need of $0 does not wait. A need selling today already covers without giving up hold worth does not wait. Waiting does not raise more than the order. A hold with no purchase date does not become free by waiting. This is not the hold slip file. A missing mark, a buy that is not filed, and a short-term gain more than 45 days from the line stay off. Not a tax determination, not the eBay fee, not Web Push, and not a live tape.';

export const HOLD_SLIP_CSV_HEADER = 'order,player,call,cash_after_fee,hold_worth_given_up,line_date,dollars_a_day,place';

export type HoldSlipPlace = 'next' | 'take' | 'stay' | 'later' | 'off';

export interface HoldSlipRow {
  order: number;
  id: string;
  player: string;
  call: ShowHoldCall;
  cashUsd: number;
  keptUsd: number;
  lineOn: string | null;
  perDayUsd: number | null;
  place: HoldSlipPlace;
}

export interface HoldSlipBook {
  orderCashUsd: number;
  freeCashUsd: number;
  holdWorthUsd: number;
  soonestLine: string | null;
  takeCount: number;
  takeCashUsd: number;
  giveUpUsd: number;
  stayCount: number;
  stayKeptUsd: number;
  stayLine: string | null;
  shortUsd: number;
}

export interface HoldSlipAlert {
  copy: string;
  player: string | null;
  href: string | null;
}

export interface HoldSlip {
  rows: HoldSlipRow[];
  copy: string;
  bookCopy: string;
  book: HoldSlipBook;
  alert: HoldSlipAlert | null;
}

export interface HoldWait {
  day: string | null;
  keptUsd: number;
  copy: string;
  alert: HoldSlipAlert | null;
}

const NAME_LIMIT = 4;
const CASH_CAP = 1_000_000;
const DAY_MS = 24 * 60 * 60 * 1000;
const CALL_RANK: Record<ShowHoldCall, number> = { under: 0, clear: 1, hold: 2 };

export interface HoldQueueSource {
  id: string;
  player: string;
  holdCall?: ShowHoldCall | null;
  treatment?: HoldTreatment | null;
  daysToLongTerm?: number | null;
  acquiredAt?: string | null;
  holdMarkUsd?: number | null;
  holdRealizedUsd?: number | null;
}

export interface HoldQueueRow {
  id: string;
  player: string;
  call: ShowHoldCall;
  cashUsd: number;
  keptUsd: number;
  daysToLongTerm: number | null;
  lineOn: string | null;
  clearsOn: string | null;
  perDayUsd: number | null;
}

function cents(value: number): number {
  return Math.round(value * 100) / 100;
}

function money(value: number): string {
  return `$${cents(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function playerName(player: string): string {
  const trimmed = player.trim();
  return trimmed || 'Unsold card';
}

export function parseCashNeed(raw: string): number | null {
  const trimmed = raw.trim().replace(/[$,]/g, '');
  if (!trimmed || !/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value > CASH_CAP) return null;
  return cents(value);
}

export function readHoldQueueNeed(): number | null {
  const value = store.get<unknown>(HOLD_QUEUE_CASH_KEY, null);
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > CASH_CAP) return null;
  return cents(value);
}

export function cashNeedDraft(value: number | null): string {
  return value == null ? '' : String(value);
}

function asOf(now?: number): number {
  return typeof now === 'number' && Number.isFinite(now) ? now : Date.now();
}

function lineOn(now: number, days: number): string {
  const today = new Date(now).toISOString().slice(0, 10);
  const start = Date.parse(`${today}T00:00:00.000Z`);
  return new Date(start + days * DAY_MS).toISOString().slice(0, 10);
}

function projectedClear(acquiredAt: string | null | undefined, now: number): string | null {
  const day = longTermOn(acquiredAt);
  if (!day) return null;
  const today = new Date(now).toISOString().slice(0, 10);
  return day < today ? today : day;
}

function finiteMark(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return null;
  return cents(value);
}

function queueOrder(a: HoldQueueRow, b: HoldQueueRow): number {
  const rank = CALL_RANK[a.call] - CALL_RANK[b.call];
  if (rank !== 0) return rank;
  if (a.call === 'hold' && a.keptUsd !== b.keptUsd) return a.keptUsd - b.keptUsd;
  if (a.cashUsd !== b.cashUsd) return b.cashUsd - a.cashUsd;
  const name = a.player.localeCompare(b.player);
  if (name !== 0) return name;
  return a.id.localeCompare(b.id);
}

export function holdQueueRows(unsold: readonly HoldQueueSource[], now?: number): HoldQueueRow[] {
  const clock = asOf(now);
  const rows: HoldQueueRow[] = [];
  for (const row of unsold) {
    if (row.holdCall !== 'hold' && row.holdCall !== 'clear' && row.holdCall !== 'under') continue;
    const mark = finiteMark(row.holdMarkUsd);
    if (mark == null) continue;
    const worth = gainWorth(row.holdRealizedUsd, row.treatment);
    const keptUsd = row.holdCall === 'hold' && worth != null ? worth.keptUsd : 0;
    const days = row.holdCall === 'hold'
      && typeof row.daysToLongTerm === 'number'
      && Number.isFinite(row.daysToLongTerm)
      && row.daysToLongTerm > 0
      ? row.daysToLongTerm
      : null;
    const dated = keptUsd > 0 && days != null;
    rows.push({
      id: row.id,
      player: playerName(row.player),
      call: row.holdCall,
      cashUsd: exitMath(mark, null).netUsd,
      keptUsd,
      daysToLongTerm: dated ? days : null,
      lineOn: dated ? lineOn(clock, days) : null,
      clearsOn: row.holdCall === 'hold' && keptUsd > 0 ? projectedClear(row.acquiredAt, clock) : null,
      perDayUsd: dated ? cents(keptUsd / days) : null,
    });
  }
  rows.sort(queueOrder);
  return rows;
}

function listed(items: readonly string[]): string {
  const shown = items.slice(0, NAME_LIMIT);
  const extra = items.length - shown.length;
  if (extra > 0) return `${shown.join(', ')}, and ${extra} more`;
  if (shown.length === 1) return shown[0];
  if (shown.length === 2) return `${shown[0]} and ${shown[1]}`;
  return `${shown.slice(0, -1).join(', ')}, and ${shown[shown.length - 1]}`;
}

function perDayPhrase(row: HoldQueueRow): string {
  if (row.perDayUsd != null && row.perDayUsd > 0) return `${money(row.perDayUsd)} a day`;
  return 'under $0.01 a day';
}

function cardBit(row: HoldQueueRow): string {
  const cash = `raises ${money(row.cashUsd)} after the card-show fee`;
  if (row.call === 'hold' && row.keptUsd > 0 && row.lineOn) {
    return `${row.player} (${cash}, gives up ${money(row.keptUsd)}, line ${row.lineOn}, ${perDayPhrase(row)})`;
  }
  if (row.call === 'hold' && row.keptUsd > 0) {
    return `${row.player} (${cash}, gives up ${money(row.keptUsd)})`;
  }
  if (row.call === 'hold') {
    return `${row.player} (${cash}, gives up nothing)`;
  }
  return `${row.player} (${cash}, ${row.call}, waiting keeps nothing more)`;
}

function staySentence(rows: readonly HoldQueueRow[]): string {
  if (rows.length === 0) return '';
  const kept = rows.reduce((total, row) => cents(total + row.keptUsd), 0);
  const soonest = rows.map((row) => row.lineOn).filter((day): day is string => Boolean(day)).sort()[0];
  if (rows.length === 1) {
    const row = rows[0];
    const when = row.lineOn ? ` until ${row.lineOn}, ${perDayPhrase(row)}` : '';
    return `${row.player} stays a hold. Waiting keeps ${money(kept)}${when}.`;
  }
  const line = soonest ? ` The soonest line is ${soonest}.` : '';
  return `${listed(rows.map((row) => row.player))} stay holds. Waiting keeps ${money(kept)}.${line}`;
}

function coverSentence(rows: readonly HoldQueueRow[], need: number): string {
  const payers = rows.filter((row) => row.cashUsd > 0);
  if (payers.length === 0) {
    const stay = staySentence(rows.filter((row) => row.call === 'hold' && row.keptUsd > 0));
    return `${money(need)} at the table stays uncovered. No listed card raises cash after the card-show fee. ${stay}`.trim();
  }
  const taken: HoldQueueRow[] = [];
  let cash = 0;
  for (const row of payers) {
    taken.push(row);
    cash = cents(cash + row.cashUsd);
    if (cash >= need) break;
  }
  const takenIds = new Set(taken.map((row) => row.id));
  const kept = taken.reduce((total, row) => cents(total + (row.call === 'hold' ? row.keptUsd : 0)), 0);
  const short = cents(need - cash);
  const give = kept > 0 ? `Gives up ${money(kept)}` : 'Gives up nothing';
  const shortBit = short > 0 ? ` and is still short ${money(short)}` : '';
  const stay = staySentence(rows.filter((row) => row.call === 'hold' && row.keptUsd > 0 && !takenIds.has(row.id)));
  return `${money(need)} at the table takes ${listed(taken.map((row) => row.player))}. ${give}${shortBit}. ${stay}`.trim();
}

function usableNeed(cashNeed: number | null | undefined): number | null {
  if (typeof cashNeed !== 'number' || !Number.isFinite(cashNeed) || cashNeed < 0 || cashNeed > CASH_CAP) return null;
  return cents(cashNeed);
}

export function holdQueueCopy(
  unsold: readonly HoldQueueSource[],
  cashNeed: number | null = null,
  now?: number,
): string {
  const rows = holdQueueRows(unsold, asOf(now));
  if (rows.length === 0) return '';
  const need = usableNeed(cashNeed);
  const order = `Order: ${listed(rows.map(cardBit))}.`;
  const lead = need == null
    ? 'sell under and clear before a hold, because waiting keeps nothing more.'
    : need === 0
      ? 'a table need of $0 takes no card. Sell under and clear before a hold, because waiting keeps nothing more.'
      : coverSentence(rows, need);
  return `Hold queue: ${lead} ${order} Not a tax determination and not a live tape.`;
}

function payingHolds(rows: readonly HoldQueueRow[]): HoldQueueRow[] {
  return rows.filter((row) => row.call === 'hold' && row.keptUsd > 0);
}

function soonestLine(rows: readonly HoldQueueRow[]): string | null {
  return rows.map((row) => row.lineOn).filter((day): day is string => Boolean(day)).sort()[0] ?? null;
}

function cardsTaken(rows: readonly HoldQueueRow[], need: number): HoldQueueRow[] {
  const taken: HoldQueueRow[] = [];
  let cash = 0;
  for (const row of rows) {
    if (row.cashUsd <= 0) continue;
    taken.push(row);
    cash = cents(cash + row.cashUsd);
    if (cash >= need) break;
  }
  return taken;
}

function slipPlace(row: HoldQueueRow, index: number, need: number | null, taken: readonly HoldQueueRow[]): HoldSlipPlace {
  if (need == null) return index === 0 ? 'next' : 'later';
  if (need === 0) return 'off';
  const at = taken.indexOf(row);
  if (at === 0) return 'next';
  if (at > 0) return 'take';
  if (row.call === 'hold' && row.keptUsd > 0) return 'stay';
  return 'off';
}

function cardCount(count: number): string {
  return count === 1 ? '1 card' : `${count} cards`;
}

function holdCount(count: number): string {
  return count === 1 ? '1 hold stays' : `${count} holds stay`;
}

function blankNext(row: HoldQueueRow): string {
  const cash = `It raises ${money(row.cashUsd)} after the card-show fee`;
  if (row.call === 'hold' && row.keptUsd > 0 && row.lineOn) {
    return `Next: sell ${row.player}. ${cash} and gives up ${money(row.keptUsd)}. The line is ${row.lineOn}, ${perDayPhrase(row)}.`;
  }
  if (row.call === 'hold' && row.keptUsd > 0) {
    return `Next: sell ${row.player}. ${cash} and gives up ${money(row.keptUsd)}.`;
  }
  if (row.call === 'hold') {
    return `Next: sell ${row.player}. ${cash} and gives up nothing.`;
  }
  return `Next: sell ${row.player}. ${cash}. Waiting keeps nothing more.`;
}

function nextCopy(rows: readonly HoldSlipRow[], need: number | null, book: HoldSlipBook): string {
  if (need === 0) return 'Next: a table need of $0 takes no card.';
  const taken = rows.filter((row) => row.place === 'next' || row.place === 'take');
  if (need != null && taken.length === 0) {
    return `Next: ${money(need)} at the table stays uncovered. No listed card raises cash after the card-show fee.`;
  }
  if (need == null) return blankNext(rows[0]);
  const names = listed(taken.map((row) => row.player));
  const give = book.giveUpUsd > 0 ? `gives up ${money(book.giveUpUsd)}` : 'gives up nothing';
  if (book.shortUsd > 0) {
    return `Next: sell ${names}. That raises ${money(book.takeCashUsd)} toward ${money(need)} and is still short ${money(book.shortUsd)}. ${give.charAt(0).toUpperCase()}${give.slice(1)}.`;
  }
  return `Next: sell ${names}. That covers ${money(need)} and ${give}.`;
}

function bookLead(book: HoldSlipBook): string {
  const order = `Book: the order raises ${money(book.orderCashUsd)} after the card-show fee.`;
  if (book.holdWorthUsd <= 0) return `${order} Waiting does not pay to keep any of it.`;
  const line = book.soonestLine ? ` The soonest line is ${book.soonestLine}.` : '';
  if (book.freeCashUsd <= 0) {
    return `${order} All of that breaks a paying hold, worth ${money(book.holdWorthUsd)} if you wait.${line}`;
  }
  return `${order} Waiting does not pay to keep ${money(book.freeCashUsd)} of that. Paying holds are worth ${money(book.holdWorthUsd)} if you wait.${line}`;
}

function needCopy(need: number | null, book: HoldSlipBook): string {
  if (need == null) return 'No cash need is typed, so this book does not take a card.';
  if (need === 0) return 'A need of $0 takes no card off this book.';
  if (book.takeCount === 0) return `A need of ${money(need)} stays uncovered. This book takes no card.`;
  const give = book.giveUpUsd > 0 ? `gives up ${money(book.giveUpUsd)}` : 'gives up nothing';
  const stay = book.stayCount > 0
    ? ` ${holdCount(book.stayCount)}, and waiting keeps ${money(book.stayKeptUsd)}.${book.stayLine ? ` The soonest line left is ${book.stayLine}.` : ''}`
    : '';
  const short = book.shortUsd > 0 ? ` The book is still short ${money(book.shortUsd)}.` : '';
  return `A need of ${money(need)} takes ${cardCount(book.takeCount)}, raises ${money(book.takeCashUsd)}, and ${give}.${stay}${short}`;
}

function slipHref(id: string): string {
  return `/audit-dossier?cardId=${encodeURIComponent(id)}`;
}

function alertFor(rows: readonly HoldSlipRow[], need: number | null, book: HoldSlipBook): HoldSlipAlert | null {
  if (need == null || need === 0 || (book.shortUsd === 0 && book.giveUpUsd === 0)) return null;
  const taken = rows.filter((row) => row.place === 'next' || row.place === 'take');
  const tail = ' Not a tax determination and not a live tape.';
  if (taken.length === 0) {
    return {
      copy: `Hold slip: a table need of ${money(need)} stays uncovered. No listed card raises cash after the card-show fee.${tail}`,
      player: null,
      href: null,
    };
  }
  const names = listed(taken.map((row) => row.player));
  const target = taken.find((row) => row.call === 'hold' && row.keptUsd > 0) ?? taken[0];
  const copy = book.shortUsd > 0 && book.giveUpUsd > 0
    ? `Hold slip: a table need of ${money(need)} is still short ${money(book.shortUsd)}. Selling ${names} gives up ${money(book.giveUpUsd)}.${tail}`
    : book.shortUsd > 0
      ? `Hold slip: a table need of ${money(need)} is still short ${money(book.shortUsd)} after ${names}. Waiting keeps nothing more on that take.${tail}`
      : `Hold slip: a table need of ${money(need)} covers and gives up ${money(book.giveUpUsd)} by selling ${names}.${tail}`;
  return { copy, player: target.player, href: slipHref(target.id) };
}

export function holdSlip(
  unsold: readonly HoldQueueSource[],
  cashNeed: number | null = null,
  now?: number,
): HoldSlip | null {
  const queued = holdQueueRows(unsold, asOf(now));
  if (queued.length === 0) return null;
  const need = usableNeed(cashNeed);
  const taken = need != null && need > 0 ? cardsTaken(queued, need) : [];
  const takenSet = new Set(taken);
  const rows = queued.map((row, index): HoldSlipRow => ({
    order: index + 1,
    id: row.id,
    player: row.player,
    call: row.call,
    cashUsd: row.cashUsd,
    keptUsd: row.keptUsd,
    lineOn: row.lineOn,
    perDayUsd: row.perDayUsd,
    place: slipPlace(row, index, need, taken),
  }));
  const stays = payingHolds(queued).filter((row) => !takenSet.has(row));
  const takeCashUsd = cents(taken.reduce((total, row) => total + row.cashUsd, 0));
  const book: HoldSlipBook = {
    orderCashUsd: cents(queued.reduce((total, row) => total + row.cashUsd, 0)),
    freeCashUsd: cents(queued.reduce((total, row) => total + (row.keptUsd > 0 ? 0 : row.cashUsd), 0)),
    holdWorthUsd: cents(queued.reduce((total, row) => total + (row.keptUsd > 0 ? row.keptUsd : 0), 0)),
    soonestLine: soonestLine(payingHolds(queued)),
    takeCount: taken.length,
    takeCashUsd,
    giveUpUsd: cents(taken.reduce((total, row) => total + (row.call === 'hold' ? row.keptUsd : 0), 0)),
    stayCount: stays.length,
    stayKeptUsd: cents(stays.reduce((total, row) => total + row.keptUsd, 0)),
    stayLine: soonestLine(stays),
    shortUsd: need != null && need > 0 ? Math.max(0, cents(need - takeCashUsd)) : 0,
  };
  return {
    rows,
    copy: nextCopy(rows, need, book),
    bookCopy: `${bookLead(book)} ${needCopy(need, book)}`,
    book,
    alert: alertFor(rows, need, book),
  };
}

function takeCash(rows: readonly HoldQueueRow[]): number {
  return cents(rows.reduce((total, row) => total + row.cashUsd, 0));
}

function takeGiveUp(rows: readonly HoldQueueRow[]): number {
  return cents(rows.reduce((total, row) => total + (row.call === 'hold' ? row.keptUsd : 0), 0));
}

function cleared(row: HoldQueueRow): HoldQueueRow {
  return { ...row, call: 'clear', keptUsd: 0, daysToLongTerm: null, lineOn: null, perDayUsd: null };
}

function rowsOnDay(rows: readonly HoldQueueRow[], day: string): HoldQueueRow[] {
  return rows
    .map((row) => (row.call === 'hold' && row.clearsOn != null && row.clearsOn <= day ? cleared(row) : row))
    .sort(queueOrder);
}

function lineDays(rows: readonly HoldQueueRow[]): string[] {
  return [...new Set(
    rows
      .filter((row) => row.call === 'hold' && row.keptUsd > 0 && row.clearsOn)
      .map((row) => row.clearsOn as string),
  )].sort();
}

function earliestFreeCover(
  rows: readonly HoldQueueRow[],
  need: number,
): { day: string; taken: HoldQueueRow[] } | null {
  for (const day of lineDays(rows)) {
    const taken = cardsTaken(rowsOnDay(rows, day), need);
    if (takeGiveUp(taken) === 0 && takeCash(taken) >= need) return { day, taken };
  }
  return null;
}

function stayRows(rows: readonly HoldQueueRow[], takenIds: ReadonlySet<string>, day: string): HoldQueueRow[] {
  return rows.filter((row) => (
    row.call === 'hold'
    && row.keptUsd > 0
    && !takenIds.has(row.id)
    && (row.clearsOn == null || row.clearsOn > day)
  ));
}

function crossedAside(rows: readonly HoldQueueRow[], takenIds: ReadonlySet<string>, day: string): HoldQueueRow[] {
  return rows.filter((row) => (
    row.call === 'hold'
    && row.clearsOn != null
    && row.clearsOn <= day
    && !takenIds.has(row.id)
  ));
}

function stayClause(rows: readonly HoldQueueRow[]): string {
  if (rows.length === 0) return '';
  if (rows.length === 1) {
    const row = rows[0];
    return row.clearsOn
      ? ` ${row.player} stays a hold until ${row.clearsOn}.`
      : ` ${row.player} stays a hold and has no purchase date.`;
  }
  const soonest = rows.map((row) => row.clearsOn).filter((day): day is string => Boolean(day)).sort()[0];
  const line = soonest ? ` The soonest line left is ${soonest}.` : '';
  return ` ${listed(rows.map((row) => row.player))} stay holds.${line}`;
}

function asideClause(rows: readonly HoldQueueRow[]): string {
  if (rows.length === 0) return '';
  if (rows.length === 1) return ` ${rows[0].player} is clear by then and stays off the take.`;
  return ` ${listed(rows.map((row) => row.player))} are clear by then and stay off the take.`;
}

function waitCoverCopy(
  need: number,
  day: string,
  taken: readonly HoldQueueRow[],
  kept: number,
  rows: readonly HoldQueueRow[],
): string {
  const takenIds = new Set(taken.map((row) => row.id));
  const names = listed(taken.map((row) => row.player));
  const tail = `${stayClause(stayRows(rows, takenIds, day))}${asideClause(crossedAside(rows, takenIds, day))}`;
  return `Wait: wait until ${day}. Sell ${names}. That covers ${money(need)} and keeps the ${money(kept)} selling today would give up.${tail}`;
}

function noLineCopy(need: number, blocked: readonly HoldQueueRow[]): string {
  const names = listed(blocked.map((row) => row.player));
  const verb = blocked.length === 1 ? 'has' : 'have';
  return `Wait: no wait covers ${money(need)} without giving up hold worth. ${names} ${verb} no purchase date.`;
}

function waitAlert(
  need: number,
  day: string,
  kept: number,
  today: readonly HoldQueueRow[],
  taken: readonly HoldQueueRow[],
  rows: readonly HoldQueueRow[],
): HoldSlipAlert {
  const byId = new Map(rows.map((row) => [row.id, row]));
  const target = taken
    .map((row) => byId.get(row.id))
    .find((row): row is HoldQueueRow => row != null && row.clearsOn === day) ?? taken[0];
  return {
    copy: `Hold wait: waiting until ${day} covers ${money(need)} and keeps ${money(kept)}. Selling ${listed(today.map((row) => row.player))} today gives that up. Not a tax determination and not a live tape.`,
    player: target.player,
    href: slipHref(target.id),
  };
}

function quietWait(copy: string): HoldWait {
  return { day: null, keptUsd: 0, copy, alert: null };
}

export function holdWait(
  unsold: readonly HoldQueueSource[],
  cashNeed: number | null = null,
  now?: number,
): HoldWait | null {
  const rows = holdQueueRows(unsold, asOf(now));
  if (rows.length === 0) return null;
  const need = usableNeed(cashNeed);
  if (need == null) {
    return quietWait('Wait: no cash need is typed, so this desk does not name a day to wait.');
  }
  if (need === 0) return quietWait('Wait: a table need of $0 does not wait.');
  const today = cardsTaken(rows, need);
  const keptUsd = takeGiveUp(today);
  const shortUsd = Math.max(0, cents(need - takeCash(today)));
  if (shortUsd > 0) {
    return quietWait(`Wait: waiting does not raise more than the order. The table stays short ${money(shortUsd)}.`);
  }
  if (keptUsd === 0) {
    return quietWait(`Wait: selling today covers ${money(need)} and gives up nothing, so waiting does not change which cards come off.`);
  }
  const cover = earliestFreeCover(rows, need);
  if (!cover) {
    const takenIds = new Set(today.map((row) => row.id));
    const blocked = rows.filter((row) => (
      takenIds.has(row.id) && row.call === 'hold' && row.keptUsd > 0 && row.clearsOn == null
    ));
    return quietWait(noLineCopy(need, blocked));
  }
  return {
    day: cover.day,
    keptUsd,
    copy: waitCoverCopy(need, cover.day, cover.taken, keptUsd, rows),
    alert: waitAlert(need, cover.day, keptUsd, today, cover.taken, rows),
  };
}

function textCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  if (/[",\n\r]/.test(safe)) return `"${safe.replace(/"/g, '""')}"`;
  return safe;
}

function numCell(value: number | null): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '';
  return String(cents(value));
}

export function holdSlipCsv(slip: HoldSlip): string {
  const lines = [HOLD_SLIP_CSV_HEADER];
  for (const row of slip.rows) {
    lines.push([
      String(row.order),
      textCell(row.player),
      textCell(row.call),
      numCell(row.cashUsd),
      numCell(row.keptUsd),
      textCell(row.lineOn ?? ''),
      numCell(row.perDayUsd),
      textCell(row.place),
    ].join(','));
  }
  return `${lines.join('\n')}\n`;
}

export function downloadHoldSlip(
  slip: HoldSlip,
  filename = 'msi-hold-slip.csv',
  host: Document | null = typeof document !== 'undefined' ? document : null,
): void {
  if (!host) return;
  const blob = new Blob([holdSlipCsv(slip)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = host.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  host.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function loadHoldQueueUnsold(inventory: readonly PnlBookCard[], now?: number) {
  return showPnl({
    notes: haggleSnapshot(),
    decisions: readFloorDecisions(),
    inventory,
    now: asOf(now),
  }).unsold;
}
