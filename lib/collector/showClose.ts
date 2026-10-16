/**
 * Closes a seeded show back into the local book: the cheapest typed ask,
 * a bought note filed as cost basis, open offers and cheap passes for the
 * next trip, and which shopping-list buys fit the cash on hand.
 * Demo or stale tape. Not a dealer quote and not a live listing.
 */
import type { CardInventory, League, Sport } from '../../types';
import { askCallCopy, askVersusMedian, holeAlreadyWatched, type HoleTarget } from './floorPack';
import { parseShopDetail } from '../shows/showShoppingIngest';

export const SHOW_CLOSE_NOTE =
  'Typed notes and the cash for this seeded trip. Not a dealer quote, not a fare, and not a live tape.';

const SPORTS = new Set<Sport>(['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer']);
const LIST_LIMIT = 8;

export interface CloseNote {
  id: string;
  showId: string;
  dealer: string;
  table: string;
  askUsd: number;
  offerUsd: number;
  result: string;
  player?: string;
  detail?: string;
  sport?: string;
  cardId?: string;
  savedAt?: string;
}

export interface MarkRef {
  usd: number;
  kind: 'comps' | 'demo';
}

export interface ListTarget {
  status?: string;
  player: string;
  cardDescription: string;
  targetPrice: number;
  currentMarketPrice?: number;
}

export type ReferenceKind = 'comps' | 'demo' | 'list' | 'none';

export interface AskReference {
  usd: number | null;
  kind: ReferenceKind;
}

function norm(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function roundUsd(value: number): number {
  return Math.round(value * 100) / 100;
}

export function cleanPlayer(value: string | undefined): string | undefined {
  const player = (value ?? '').trim().replace(/\s+/g, ' ').slice(0, 80);
  return player || undefined;
}

export function cleanDetail(value: string | undefined): string | undefined {
  const detail = (value ?? '').trim().replace(/\s+/g, ' ').slice(0, 120);
  return detail || undefined;
}

export function cleanSport(value: string | undefined): Sport | undefined {
  if (!value || !SPORTS.has(value as Sport)) return undefined;
  return value as Sport;
}

export function paidOnNote(note: { offerUsd: number; askUsd: number }): { usd: number; from: 'offer' | 'ask' } | null {
  if (Number.isFinite(note.offerUsd) && note.offerUsd > 0) return { usd: roundUsd(note.offerUsd), from: 'offer' };
  if (Number.isFinite(note.askUsd) && note.askUsd > 0) return { usd: roundUsd(note.askUsd), from: 'ask' };
  return null;
}

export function floorBuyId(noteId: string): string {
  return `floor:${noteId}`.replace(/\s+/g, '').slice(0, 96);
}

function leagueFor(sport: Sport): League {
  if (sport === 'Baseball') return 'MLB';
  if (sport === 'Basketball') return 'NBA';
  if (sport === 'Football') return 'NFL';
  return 'Other';
}

function yearFromDate(iso: string): number {
  const year = Number(iso.slice(0, 4));
  return year >= 1900 && year <= 2099 ? year : 2026;
}

export function buildFloorBuyDraft(input: {
  note: CloseNote;
  showName: string;
  purchaseDate: string;
}): CardInventory | null {
  const player = cleanPlayer(input.note.player);
  const paid = paidOnNote(input.note);
  if (!player || !paid || input.note.result !== 'bought') return null;
  const purchaseDate = /^\d{4}-\d{2}-\d{2}/.test(input.purchaseDate) ? input.purchaseDate.slice(0, 10) : '2026-01-01';
  const parsed = parseShopDetail(cleanDetail(input.note.detail) ?? '');
  const sport = cleanSport(input.note.sport) ?? 'Baseball';
  const showName = input.showName.trim() || 'Local card show';
  return {
    id: floorBuyId(input.note.id),
    player,
    year: parsed.year ?? yearFromDate(purchaseDate),
    manufacturer: parsed.manufacturer,
    cardNumber: parsed.cardNumber,
    set: parsed.setName || 'Show floor',
    sport,
    league: leagueFor(sport),
    isAutographed: parsed.autographed,
    condition: 'Raw',
    isGraded: false,
    purchasePrice: paid.usd,
    purchaseDate,
    pricingRationale: 'Cost basis is the offer when one was typed, otherwise the ask. Not a settlement and not a live tape.',
    notes: `Table note ${input.note.id} at ${showName}. Confirm the card in hand.`,
    status: 'active',
    taxBasis: paid.usd,
  };
}

export interface RoomAsk {
  player: string;
  lowAskUsd: number;
  highAskUsd: number;
  tables: number;
  dealer: string;
  table: string;
}

export function roomAsks(notes: readonly CloseNote[]): RoomAsk[] {
  const groups = new Map<string, Array<CloseNote & { player: string }>>();
  for (const note of notes) {
    const player = cleanPlayer(note.player);
    if (!player || !Number.isFinite(note.askUsd) || note.askUsd < 0) continue;
    const key = norm(player);
    const list = groups.get(key);
    const next = { ...note, player };
    if (list) list.push(next);
    else groups.set(key, [next]);
  }
  const rows: RoomAsk[] = [];
  for (const list of groups.values()) {
    if (list.length < 2) continue;
    const sorted = [...list].sort((a, b) => {
      const ask = a.askUsd - b.askUsd;
      if (ask !== 0) return ask;
      const saved = (a.savedAt ?? '').localeCompare(b.savedAt ?? '');
      if (saved !== 0) return saved;
      return a.dealer.localeCompare(b.dealer) || a.table.localeCompare(b.table);
    });
    const low = sorted[0];
    let highAsk = low.askUsd;
    for (const note of list) if (note.askUsd > highAsk) highAsk = note.askUsd;
    rows.push({
      player: low.player,
      lowAskUsd: roundUsd(low.askUsd),
      highAskUsd: roundUsd(highAsk),
      tables: list.length,
      dealer: low.dealer,
      table: low.table,
    });
  }
  rows.sort((a, b) => a.player.localeCompare(b.player));
  return rows.slice(0, LIST_LIMIT);
}

export function roomAskCopy(row: RoomAsk): string {
  const low = `$${row.lowAskUsd.toFixed(2)}`;
  const high = `$${row.highAskUsd.toFixed(2)}`;
  const spread = row.highAskUsd === row.lowAskUsd
    ? `Both asks are ${low}.`
    : `Lowest ${low} at ${row.dealer} table ${row.table}. Highest ${high}.`;
  return `${row.player}: ${row.tables} tables. ${spread} Not a dealer quote.`;
}

export type CashFitCall = 'fits' | 'over' | 'no price' | 'cash unset';
export type CashSource = 'saved' | 'trip need' | 'unset';

export interface CashFit {
  fitCount: number;
  overCount: number;
  noPriceCount: number;
  leftUsd: number | null;
  byId: Record<string, CashFitCall>;
}

export function cashFit(lines: readonly { id: string; usd: number | null }[], cashUsd: number | null): CashFit {
  const unset = cashUsd == null || !Number.isFinite(cashUsd) || cashUsd < 0;
  const byId: Record<string, CashFitCall> = {};
  const priced: { id: string; usd: number }[] = [];
  let noPriceCount = 0;
  for (const line of lines) {
    if (line.usd == null || !Number.isFinite(line.usd) || line.usd < 0) {
      byId[line.id] = 'no price';
      noPriceCount += 1;
      continue;
    }
    priced.push({ id: line.id, usd: roundUsd(line.usd) });
  }
  if (unset) {
    for (const line of priced) byId[line.id] = 'cash unset';
    return { fitCount: 0, overCount: 0, noPriceCount, leftUsd: null, byId };
  }
  const cash = roundUsd(cashUsd as number);
  priced.sort((a, b) => a.usd - b.usd || a.id.localeCompare(b.id));
  let left = cash;
  let fitCount = 0;
  let overCount = 0;
  for (const line of priced) {
    if (line.usd <= left + 1e-9) {
      byId[line.id] = 'fits';
      left = roundUsd(left - line.usd);
      fitCount += 1;
    } else {
      byId[line.id] = 'over';
      overCount += 1;
    }
  }
  return { fitCount, overCount, noPriceCount, leftUsd: left, byId };
}

function money(value: number): string {
  return `$${Math.round(value).toLocaleString('en-US')}`;
}

export function cashFitCopy(fit: CashFit, cashUsd: number | null, source: CashSource): string {
  if (source === 'unset' || cashUsd == null || !Number.isFinite(cashUsd) || cashUsd < 0) {
    return 'Trip cash is not set. Not a fare quote.';
  }
  const which = source === 'saved' ? 'saved for this trip' : 'the trip need, because cash is blank';
  const left = fit.leftUsd == null ? '' : ` ${money(fit.leftUsd)} left after the ones that fit.`;
  const noun = fit.fitCount === 1 ? 'buy fits' : 'buys fit';
  return `${fit.fitCount} ${noun} the ${money(cashUsd)} ${which}, cheapest first.${left} ${fit.overCount} over that cash. Not a fare quote.`;
}

export function cashLineCopy(call: CashFitCall): string {
  if (call === 'fits') return 'Fits the cash for this trip.';
  if (call === 'over') return 'Over the cash for this trip.';
  if (call === 'no price') return 'No price on this line.';
  return 'Trip cash is not set.';
}

export function referenceForNote(
  note: CloseNote,
  input: { medianByCardId: Readonly<Record<string, MarkRef | undefined>>; targets: readonly ListTarget[] },
): AskReference {
  if (note.cardId) {
    const mark = input.medianByCardId[note.cardId];
    if (mark && mark.usd > 0) return { usd: mark.usd, kind: mark.kind };
  }
  const player = norm(note.player);
  if (player) {
    const target = input.targets.find(row => row.status === 'active' && norm(row.player) === player);
    if (target) {
      if (typeof target.currentMarketPrice === 'number' && target.currentMarketPrice > 0) {
        return { usd: target.currentMarketPrice, kind: 'list' };
      }
      if (Number.isFinite(target.targetPrice) && target.targetPrice > 0) {
        return { usd: target.targetPrice, kind: 'list' };
      }
    }
  }
  return { usd: null, kind: 'none' };
}

export function askVersusBookCopy(askUsd: number, reference: AskReference, pickedCard = false): string {
  if (reference.kind === 'list') {
    if (reference.usd == null || reference.usd <= 0) return 'No shopping-list mark on this name. Not a live tape.';
    const versus = askVersusMedian(askUsd, reference.usd);
    const listed = money(reference.usd);
    if (versus.call === 'at') return `Ask is within 5% of the shopping-list mark (${listed}). Not a live tape.`;
    if (versus.call !== 'under' && versus.call !== 'over') {
      return 'No shopping-list mark on this name. Not a live tape.';
    }
    return `Ask is ${versus.call} the shopping-list mark (${listed}) by ${Math.abs(Number(versus.gapPct))}%. Not a live tape.`;
  }
  if (reference.kind === 'none') {
    return pickedCard ? 'No median on this card. Not a live tape.' : 'No local mark on this note. Not a live tape.';
  }
  return askCallCopy({
    call: askVersusMedian(askUsd, reference.usd).call,
    gapPct: askVersusMedian(askUsd, reference.usd).gapPct,
    basis: reference.kind,
    medianUsd: reference.usd,
  });
}

export function isRevisit(note: CloseNote, reference: AskReference): boolean {
  if (note.result !== 'passed' || !cleanPlayer(note.player)) return false;
  return askVersusMedian(note.askUsd, reference.usd).call === 'under';
}

export function watchDraft(note: CloseNote): HoleTarget | null {
  const player = cleanPlayer(note.player);
  if (!player || !(note.askUsd > 0) || !Number.isFinite(note.askUsd)) return null;
  const sport = cleanSport(note.sport) ?? 'Baseball';
  return {
    player,
    cardDescription: cleanDetail(note.detail) ?? 'Passed at a seeded show',
    priority: note.askUsd >= 25 ? 'High' : 'Medium',
    targetPrice: roundUsd(note.askUsd),
    sport,
    league: leagueFor(sport),
    notes: 'Passed ask that was under the local reference. Not a live listing.',
  };
}

export interface FollowUp {
  id: string;
  kind: 'open' | 'revisit';
  title: string;
  detail: string;
  href: string;
  watch: HoleTarget | null;
  /** True when this pass is already on the watchlist, even if the new target makes the ask look "at" the mark. */
  watched: boolean;
}

function showLabel(shows: readonly { id: string; name: string }[], showId: string): string {
  return shows.find(show => show.id === showId)?.name ?? 'a seeded show';
}

export function followUps(input: {
  notes: readonly CloseNote[];
  shows: readonly { id: string; name: string }[];
  medianByCardId: Readonly<Record<string, MarkRef | undefined>>;
  targets: readonly ListTarget[];
  watched?: readonly { status?: string; player: string; cardDescription: string }[];
}): FollowUp[] {
  const watched = input.watched ?? input.targets;
  const ordered = [...input.notes].sort((a, b) => (b.savedAt ?? '').localeCompare(a.savedAt ?? ''));
  const opens: FollowUp[] = [];
  const revisits: FollowUp[] = [];
  for (const note of ordered) {
    if (note.result !== 'open') continue;
    const player = cleanPlayer(note.player);
    const ask = Number.isFinite(note.askUsd) && note.askUsd > 0 ? ` Ask $${note.askUsd.toFixed(2)}.` : '';
    opens.push({
      id: `open:${note.id}`,
      kind: 'open',
      title: `Open at ${showLabel(input.shows, note.showId)}`,
      detail: `Still open with ${note.dealer} at table ${note.table}${player ? ` · ${player}` : ''}.${ask} Not a dealer quote.`,
      href: '/local-card-shows',
      watch: null,
      watched: false,
    });
  }
  for (const note of ordered) {
    if (note.result !== 'passed' || !cleanPlayer(note.player)) continue;
    const reference = referenceForNote(note, input);
    const draft = watchDraft(note);
    const claimed = draft
      ? holeAlreadyWatched(watched, { player: draft.player, number: '', setLabel: draft.cardDescription })
      : false;
    if (!isRevisit(note, reference) && !claimed) continue;
    revisits.push({
      id: `revisit:${note.id}`,
      kind: 'revisit',
      title: `Revisit ${cleanPlayer(note.player)}`,
      detail: `${askVersusBookCopy(note.askUsd, reference)} Passed at ${showLabel(input.shows, note.showId)}.`,
      href: '/local-card-shows',
      watch: draft && !claimed ? draft : null,
      watched: claimed,
    });
  }
  return [...opens.slice(0, LIST_LIMIT), ...revisits.slice(0, LIST_LIMIT)];
}

export function unfiledBuys(notes: readonly CloseNote[], inventory: readonly { id: string }[]): CloseNote[] {
  const ids = new Set(inventory.map(row => row.id));
  return notes.filter(note => {
    if (note.result !== 'bought' || !cleanPlayer(note.player) || !paidOnNote(note)) return false;
    return !ids.has(floorBuyId(note.id));
  });
}

export function unfiledCopy(notes: readonly CloseNote[]): string {
  if (notes.length === 0) return 'No bought table note is waiting on the book.';
  const names = notes.slice(0, 4).map(note => cleanPlayer(note.player)).filter((name): name is string => Boolean(name));
  const more = notes.length > 4 ? ` +${notes.length - 4}` : '';
  const noun = notes.length === 1 ? 'note' : 'notes';
  return `${notes.length} bought ${noun} not in the book: ${names.join(', ')}${more}. Not a settlement.`;
}
