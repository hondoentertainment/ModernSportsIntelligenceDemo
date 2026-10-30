/**
 * A price you took for a card you hold, followed onto that card's sell ladder
 * and into the book. The card-show fee is the existing ~4% heuristic.
 * A lot stays a buy. Not a settlement and not a live tape.
 */
import type { SaleRange } from './saleRange';
import { sellLadder } from './offerLadder';
import { sellSeat, type SellSeat } from './ladderScore';
import { cleanPlayer, paidOnNote } from './showClose';
import { isLot } from './tableLot';

export const SHOW_EXIT_NOTE =
  'Sold table notes at this seeded show, for one card you hold. The price you took, offer first, sits on that card\'s sell ladder. Ask, take, and pass come from sold comps when that card has them, otherwise a demo sketch. The card-show fee is the existing ~4% heuristic. Recording writes that price and the realized result onto the copy. A buy, a pass, an open note, and a lot stay off. Not a settlement and not a live tape.';

export const EXIT_RECORD_NOTE =
  'Recording writes the price you took, the ~4% card-show fee, and the realized result onto that copy. A card already sold, and a card on consignment, stay put. Not a settlement.';

export const CARD_SHOW_FEE_RATE = 0.04;

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const NAME_LIMIT = 4;
const EMPTY_SHOW =
  'No sold table note is on this exit. A buy, a pass, an open note, and a lot stay off. Not a live tape.';
const EMPTY_WEEK =
  'No dated show sale this week. A buy, a pass, an open note, a lot, and a note with no date stay off this count. Not a live tape.';

export type ExitSeat = SellSeat | 'no ladder';

export interface ExitNote {
  id: string;
  result: string;
  askUsd: number;
  offerUsd: number;
  player?: string;
  cardId?: string;
  savedAt?: string;
  dealer?: string;
  table?: string;
  lines?: readonly { player?: string; cardId?: string; askUsd?: number }[];
}

export interface ExitBookCard {
  id: string;
  player: string;
  status?: string;
  purchasePrice?: number;
  gradingFees?: number;
  shippingFees?: number;
  insuranceFees?: number;
  salePrice?: number;
  notes?: string;
}

export interface ExitMath {
  feeUsd: number;
  netUsd: number;
  realizedUsd: number | null;
}

export interface ExitPatch {
  status: 'sold';
  salePrice: number;
  saleDate: string;
  realizedGainLoss?: number;
  notes: string;
  pricingRationale: string;
}

export interface ExitRow {
  id: string;
  cardId: string | null;
  player: string;
  dealer: string;
  table: string;
  takenUsd: number;
  seat: ExitSeat;
  askUsd: number | null;
  takeUsd: number | null;
  passUsd: number | null;
  tape: 'comps' | 'demo' | null;
  band: string | null;
  costUsd: number | null;
  feeUsd: number;
  netUsd: number;
  realizedUsd: number | null;
  held: boolean;
  closed: boolean;
  consigned: boolean;
  missing: boolean;
}

export interface ShowExit {
  rows: ExitRow[];
  takenUsd: number;
  feeUsd: number;
  onLadder: number;
  clearedAsk: number;
  clearedTake: number;
  downToPass: number;
  underPass: number;
  noLadder: number;
  closed: number;
  stillHeld: number;
  consigned: number;
  missing: number;
  noBasis: number;
  realizedUsd: number;
  realizedRows: number;
  copy: string;
}

export interface WeekExit {
  exit: ShowExit;
  copy: string;
}

function cents(value: number): number {
  return Math.round(value * 100) / 100;
}

function money(value: number): string {
  return `$${cents(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function signedUsd(value: number): string {
  if (value < -0.001) return `-${money(Math.abs(value))}`;
  return money(value);
}

function feeOf(value: number | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return 0;
  return value;
}

export function allInCost(card: {
  purchasePrice?: number;
  gradingFees?: number;
  shippingFees?: number;
  insuranceFees?: number;
}): number | null {
  if (typeof card.purchasePrice !== 'number' || !Number.isFinite(card.purchasePrice) || card.purchasePrice < 0) {
    return null;
  }
  return cents(card.purchasePrice + feeOf(card.gradingFees) + feeOf(card.shippingFees) + feeOf(card.insuranceFees));
}

export function exitMath(taken: number, cost: number | null): ExitMath {
  const price = cents(taken);
  const feeUsd = cents(price * CARD_SHOW_FEE_RATE);
  const netUsd = cents(price - feeUsd);
  if (cost == null) return { feeUsd, netUsd, realizedUsd: null };
  return { feeUsd, netUsd, realizedUsd: cents(netUsd - cents(cost)) };
}

export function takenOnNote(note: {
  result: string;
  offerUsd: number;
  askUsd: number;
  lines?: readonly unknown[];
}): number | null {
  if (note.result !== 'sold' || isLot(note)) return null;
  return paidOnNote(note)?.usd ?? null;
}

function saleDay(iso: string | undefined, fallback: string): string {
  const parsed = Date.parse(iso ?? '');
  if (Number.isFinite(parsed)) return new Date(parsed).toISOString().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}/.test(fallback)) return fallback.slice(0, 10);
  return '2026-01-01';
}

export function buildExitPatch(input: {
  note: ExitNote;
  card: ExitBookCard | null;
  purchaseDate?: string;
  existingNotes?: string;
}): ExitPatch | null {
  const taken = takenOnNote(input.note);
  if (taken == null || input.card == null) return null;
  if (input.card.status === 'sold' || input.card.status === 'consignment') return null;
  const math = exitMath(taken, allInCost(input.card));
  const saleDate = saleDay(input.note.savedAt, input.purchaseDate ?? '');
  const marker = `Show exit ${input.note.id}:`;
  const line = `${marker} sold at ${money(taken)} on ${saleDate}. Card-show fee ${money(math.feeUsd)}. Advisory table note — not a marketplace settlement.`;
  const prior = input.existingNotes?.trim();
  const notes = prior?.includes(marker) ? prior : prior ? `${prior} ${line}` : line;
  const patch: ExitPatch = {
    status: 'sold',
    salePrice: taken,
    saleDate,
    notes,
    pricingRationale: 'Sale price is the number you took at the table. The card-show fee is the ~4% heuristic. Not a live marketplace print.',
  };
  if (math.realizedUsd != null) patch.realizedGainLoss = math.realizedUsd;
  return patch;
}

function ladderOf(taken: number, range: SaleRange | null, cost: number | null): Pick<
  ExitRow,
  'seat' | 'askUsd' | 'takeUsd' | 'passUsd' | 'tape' | 'band'
> {
  const empty = { seat: 'no ladder' as const, askUsd: null, takeUsd: null, passUsd: null, tape: null, band: null };
  if (range == null) return empty;
  const ladder = sellLadder(range, cost);
  const seat = sellSeat(taken, ladder);
  if (ladder == null || seat == null) return empty;
  return {
    seat,
    askUsd: ladder.ask,
    takeUsd: ladder.take,
    passUsd: ladder.passUnder,
    tape: ladder.source,
    band: ladder.band,
  };
}

function where(row: ExitRow): string {
  if (row.tape == null) return '';
  const kind = row.tape === 'comps' ? 'sold comps' : 'demo ladder';
  const band = row.band ? `${row.band} ` : '';
  return ` on ${band}${kind}`;
}

function seatPhrase(row: ExitRow): string {
  if (row.seat === 'no ladder' || row.askUsd == null || row.takeUsd == null || row.passUsd == null) return 'no ladder';
  const tape = where(row);
  if (row.seat === 'at or over ask') return `cleared the ask${tape} (ask ${money(row.askUsd)})`;
  if (row.seat === 'down to take') return `cleared the take${tape} (ask ${money(row.askUsd)}, take ${money(row.takeUsd)})`;
  if (row.seat === 'down to pass') return `down to the pass${tape} (take ${money(row.takeUsd)}, pass under ${money(row.passUsd)})`;
  return `under the pass${tape} (pass under ${money(row.passUsd)})`;
}

function bookPhrase(row: ExitRow): string {
  if (row.missing) return 'not in the book';
  if (row.consigned) return 'on consignment';
  const realized = row.realizedUsd == null
    ? 'no cost basis'
    : `${row.closed ? 'realized' : 'would realize'} ${signedUsd(row.realizedUsd)} after the card-show fee`;
  if (row.closed) return `sold in the book · ${realized}`;
  return `still held · ${realized}`;
}

export function exitRowCopy(row: ExitRow): string {
  const who = row.dealer ? `${row.player} · ${row.dealer}` : row.player;
  const table = row.table ? ` table ${row.table}` : '';
  return `${who}${table} · taken ${money(row.takenUsd)} · ${seatPhrase(row)} · ${bookPhrase(row)}`;
}

function nameList(rows: readonly ExitRow[]): string {
  if (rows.length === 0) return '';
  const shown = rows.slice(0, NAME_LIMIT).map((row) => row.player);
  const more = rows.length - shown.length;
  const extra = more > 0 ? `, and ${more} more` : '';
  return ` (${shown.join(', ')}${extra})`;
}

function joinParts(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? '';
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`;
}

function tally(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function ladderSentence(rows: readonly ExitRow[]): string {
  let clearedAsk = 0;
  let clearedTake = 0;
  let downToPass = 0;
  let underPass = 0;
  let noLadder = 0;
  for (const row of rows) {
    if (row.seat === 'at or over ask') clearedAsk += 1;
    else if (row.seat === 'down to take') clearedTake += 1;
    else if (row.seat === 'down to pass') downToPass += 1;
    else if (row.seat === 'under pass') underPass += 1;
    else noLadder += 1;
  }
  if (clearedAsk + clearedTake + downToPass + underPass === 0) return 'No taken price sits on a ladder.';
  const parts: string[] = [];
  if (clearedAsk > 0) parts.push(tally(clearedAsk, 'cleared the ask', 'cleared the ask'));
  if (clearedTake > 0) parts.push(tally(clearedTake, 'cleared the take', 'cleared the take'));
  if (downToPass > 0) parts.push(tally(downToPass, 'is down to the pass', 'are down to the pass'));
  if (underPass > 0) parts.push(tally(underPass, 'is under the pass', 'are under the pass'));
  const seated = `${joinParts(parts)}.`;
  if (noLadder === 0) return seated;
  const off = noLadder === 1 ? '1 price stays off the ladder.' : `${noLadder} prices stay off the ladder.`;
  return `${seated} ${off}`;
}

function bookSentence(exit: ShowExit): string {
  const parts: string[] = [];
  if (exit.closed === 1) parts.push('1 is sold in the book');
  else if (exit.closed > 1) parts.push(`${exit.closed} are sold in the book`);
  if (exit.realizedRows > 0) parts.push(`realized ${signedUsd(exit.realizedUsd)} after the card-show fee`);
  if (exit.stillHeld === 1) parts.push('1 is still held');
  else if (exit.stillHeld > 1) parts.push(`${exit.stillHeld} are still held`);
  if (exit.noBasis === 1) parts.push('1 has no cost basis');
  else if (exit.noBasis > 1) parts.push(`${exit.noBasis} have no cost basis`);
  if (exit.missing === 1) parts.push('1 is not in the book');
  else if (exit.missing > 1) parts.push(`${exit.missing} are not in the book`);
  if (exit.consigned === 1) parts.push('1 is on consignment');
  else if (exit.consigned > 1) parts.push(`${exit.consigned} are on consignment`);
  return `${joinParts(parts)}.`;
}

function showCopy(exit: ShowExit): string {
  if (exit.rows.length === 0) return EMPTY_SHOW;
  const noun = exit.rows.length === 1 ? 'card' : 'cards';
  return `Exit: ${exit.rows.length} ${noun}, taken ${money(exit.takenUsd)}${nameList(exit.rows)}. ${ladderSentence(exit.rows)} ${bookSentence(exit)} Not a settlement and not a live tape.`;
}

function countSeats(rows: readonly ExitRow[]): Pick<
  ShowExit,
  'clearedAsk' | 'clearedTake' | 'downToPass' | 'underPass' | 'noLadder' | 'onLadder'
> {
  let clearedAsk = 0;
  let clearedTake = 0;
  let downToPass = 0;
  let underPass = 0;
  let noLadder = 0;
  for (const row of rows) {
    if (row.seat === 'at or over ask') clearedAsk += 1;
    else if (row.seat === 'down to take') clearedTake += 1;
    else if (row.seat === 'down to pass') downToPass += 1;
    else if (row.seat === 'under pass') underPass += 1;
    else noLadder += 1;
  }
  return {
    clearedAsk,
    clearedTake,
    downToPass,
    underPass,
    noLadder,
    onLadder: clearedAsk + clearedTake + downToPass + underPass,
  };
}

export function showExit(input: {
  notes: readonly ExitNote[];
  inventory: readonly ExitBookCard[];
  rangeForId: (id: string) => SaleRange | null;
}): ShowExit {
  const byId = new Map(input.inventory.map((card) => [card.id, card]));
  const rows: ExitRow[] = [];
  for (const note of input.notes) {
    const taken = takenOnNote(note);
    if (taken == null) continue;
    const cardId = note.cardId?.trim() || '';
    const card = cardId ? byId.get(cardId) : undefined;
    const cost = card ? allInCost(card) : null;
    const math = exitMath(taken, cost);
    const spot = ladderOf(taken, cardId ? input.rangeForId(cardId) : null, cost);
    const closed = card?.status === 'sold';
    const consigned = card?.status === 'consignment';
    const missing = card == null;
    rows.push({
      id: note.id,
      cardId: card?.id ?? (cardId || null),
      player: cleanPlayer(note.player) || cleanPlayer(card?.player) || 'Card',
      dealer: note.dealer?.trim() ?? '',
      table: note.table?.trim() ?? '',
      takenUsd: taken,
      ...spot,
      costUsd: cost,
      feeUsd: math.feeUsd,
      netUsd: math.netUsd,
      realizedUsd: math.realizedUsd,
      held: card != null && !closed && !consigned,
      closed,
      consigned,
      missing,
    });
  }
  rows.sort((a, b) => a.player.localeCompare(b.player) || a.id.localeCompare(b.id));
  let takenUsd = 0;
  let feeUsd = 0;
  let closed = 0;
  let stillHeld = 0;
  let consigned = 0;
  let missing = 0;
  let noBasis = 0;
  let realizedUsd = 0;
  let realizedRows = 0;
  for (const row of rows) {
    takenUsd = cents(takenUsd + row.takenUsd);
    feeUsd = cents(feeUsd + row.feeUsd);
    if (row.closed) closed += 1;
    else if (row.consigned) consigned += 1;
    else if (row.missing) missing += 1;
    else stillHeld += 1;
    if ((row.closed || row.held) && row.realizedUsd == null) noBasis += 1;
    if (row.closed && row.realizedUsd != null) {
      realizedUsd = cents(realizedUsd + row.realizedUsd);
      realizedRows += 1;
    }
  }
  const exit: ShowExit = {
    rows,
    takenUsd,
    feeUsd,
    ...countSeats(rows),
    closed,
    stillHeld,
    consigned,
    missing,
    noBasis,
    realizedUsd,
    realizedRows,
    copy: '',
  };
  exit.copy = showCopy(exit);
  return exit;
}

function inWeek(iso: string | undefined, now: number): boolean {
  const saved = Date.parse(iso ?? '');
  return Number.isFinite(saved) && saved <= now && saved >= now - WEEK_MS;
}

function weekCopy(exit: ShowExit): string {
  if (exit.rows.length === 0) return EMPTY_WEEK;
  if (exit.closed === 0) {
    const line = exit.rows.length === 1
      ? '1 show sale this week is still held.'
      : `${exit.rows.length} show sales this week are still held.`;
    return `${line} Record the sale to put realized on the book. Not a live tape.`;
  }
  const booked = exit.rows.filter((row) => row.closed);
  let taken = 0;
  let fees = 0;
  for (const row of booked) {
    taken = cents(taken + row.takenUsd);
    fees = cents(fees + row.feeUsd);
  }
  const cards = exit.closed === 1 ? '1 card' : `${exit.closed} cards`;
  const realized = exit.realizedRows === 0
    ? 'No recorded sale has a price and a cost.'
    : `Realized ${signedUsd(exit.realizedUsd)} after the card-show fee.`;
  const waiting = exit.stillHeld === 0
    ? ''
    : exit.stillHeld === 1
      ? ' 1 is still held.'
      : ` ${exit.stillHeld} are still held.`;
  return `Show exit this week: ${cards}, taken ${money(taken)}, fees ${money(fees)}. ${ladderSentence(booked)} ${realized}${waiting} Not a settlement and not a live tape.`;
}

export function weekExit(input: {
  notes: readonly ExitNote[];
  inventory: readonly ExitBookCard[];
  rangeForId: (id: string) => SaleRange | null;
  now?: number;
}): WeekExit {
  const now = input.now ?? Date.now();
  const notes = input.notes.filter((note) => inWeek(note.savedAt, now));
  const exit = showExit({ ...input, notes });
  return { exit, copy: weekCopy(exit) };
}
