/**
 * Bought table notes and lots, followed into the local book.
 * The paid price sits on that card's ladder. The stored mark is what
 * the filed copy is worth. A binder, box, or slab is the place on this
 * browser. Not a settlement and not a live tape.
 */
import type { SaleRange } from './saleRange';
import { buyLadder } from './offerLadder';
import { buySeat } from './ladderScore';
import { markOf, type Place } from './deskNext';
import { cleanPlayer, floorBuyId, paidOnNote } from './showClose';
import { boughtLotShares, isLot, lotCardId } from './tableLot';

export const SHOW_HAUL_NOTE =
  'Bought table notes and lots at this seeded show, followed into the book. Paid price sits on that card\'s ladder, with no watchlist target and no trip cash. The local mark is the stored value once the card is filed. A second copy matches player, year, manufacturer, set, and number. A note with no date still sits on this show. The weekly recap leaves it off. Not a settlement and not a live tape.';

export const HAUL_PLACE_NOTE =
  'Unplaced cards on this haul get that place. A card already in a binder, box, or slab stays put. This browser only. Not a warehouse system.';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const NAME_LIMIT = 4;
const EMPTY_SHOW =
  'No bought table note is on this haul. A passed note, an open note, and a lot that cannot be split stay off. Not a live tape.';
const EMPTY_WEEK =
  'No dated show buy this week. A passed note, an open note, a note with no date, and a buy with no player stay off this count. Not a live tape.';

export type HaulLadder = 'beat fair' | 'up to walk' | 'over walk' | 'no ladder';
export type HaulTape = 'comps' | 'demo';

export interface HaulNote {
  id: string;
  result: string;
  askUsd: number;
  offerUsd: number;
  player?: string;
  cardId?: string;
  savedAt?: string;
  lines?: readonly { player?: string; cardId?: string; askUsd?: number }[];
}

export interface HaulBookCard {
  id: string;
  player: string;
  year?: number;
  manufacturer?: string;
  set?: string;
  cardNumber?: string;
  status?: string;
  purchasePrice?: number;
  currentValue?: number;
}

export interface HaulRow {
  id: string;
  player: string;
  paidUsd: number;
  ladder: HaulLadder;
  fairUsd: number | null;
  walkUsd: number | null;
  tape: HaulTape | null;
  band: string | null;
  filed: boolean;
  markUsd: number | null;
  unrealizedUsd: number | null;
  place: Place | null;
  duplicate: boolean;
}

export interface ShowHaul {
  rows: HaulRow[];
  paidUsd: number;
  fairUsd: number;
  onLadder: number;
  beatFair: number;
  upToWalk: number;
  overWalk: number;
  noLadder: number;
  filed: number;
  unfiled: number;
  markUsd: number;
  unrealizedUsd: number;
  unplaced: number;
  duplicates: number;
  copy: string;
}

export interface WeekHaul {
  haul: ShowHaul;
  copy: string;
}

interface DraftRow {
  id: string;
  player: string;
  paidUsd: number;
  cardId?: string;
}

function cents(value: number): number {
  return Math.round(value * 100) / 100;
}

function money(value: number): string {
  return `$${cents(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function signed(value: number): string {
  if (value < -0.001) return `-${money(Math.abs(value))}`;
  return money(value);
}

function norm(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function active(card: HaulBookCard): boolean {
  return card.status !== 'sold' && card.status !== 'consignment';
}

function identity(card: HaulBookCard): string {
  return [
    norm(card.player),
    String(card.year ?? ''),
    norm(card.manufacturer),
    norm(card.set),
    norm(card.cardNumber),
  ].join('|');
}

function placeOf(places: Readonly<Record<string, string | undefined>>, id: string): Place | null {
  const value = places[id];
  if (value === 'binder' || value === 'box' || value === 'slab') return value;
  return null;
}

function homeLabel(place: Place | null): string {
  if (place === 'slab') return 'slab case';
  if (place === 'binder' || place === 'box') return place;
  return 'no place';
}

function ladderOf(paid: number, range: SaleRange | null): Pick<HaulRow, 'ladder' | 'fairUsd' | 'walkUsd' | 'tape' | 'band'> {
  const empty = { ladder: 'no ladder' as const, fairUsd: null, walkUsd: null, tape: null, band: null };
  if (range == null) return empty;
  const ladder = buyLadder(range);
  const seat = buySeat(paid, ladder);
  if (ladder == null || seat == null) return empty;
  const call: HaulLadder = seat === 'over walk' ? 'over walk' : seat === 'up to walk' ? 'up to walk' : 'beat fair';
  return {
    ladder: call,
    fairUsd: ladder.fair,
    walkUsd: ladder.walk,
    tape: ladder.source,
    band: ladder.band,
  };
}

function draftRows(notes: readonly HaulNote[]): DraftRow[] {
  const rows: DraftRow[] = [];
  for (const note of notes) {
    if (note.result !== 'bought') continue;
    if (isLot(note)) {
      const shares = boughtLotShares(note);
      if (!shares) continue;
      (note.lines ?? []).forEach((line, index) => {
        const paid = shares[index];
        const player = cleanPlayer(line.player);
        if (!player || paid == null || !(paid > 0)) return;
        rows.push({
          id: lotCardId(note.id, index),
          player,
          paidUsd: paid,
          cardId: line.cardId,
        });
      });
      continue;
    }
    const player = cleanPlayer(note.player);
    const paid = paidOnNote(note);
    if (!player || !paid) continue;
    rows.push({
      id: floorBuyId(note.id),
      player,
      paidUsd: paid.usd,
      cardId: note.cardId,
    });
  }
  return rows;
}

function nameList(rows: readonly HaulRow[]): string {
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

function ladderSentence(haul: ShowHaul): string {
  if (haul.onLadder === 0) return 'No paid price sits on a ladder.';
  const parts: string[] = [];
  if (haul.beatFair > 0) parts.push(`${haul.beatFair} beat the fair`);
  if (haul.upToWalk === 1) parts.push('1 is up to the walk');
  else if (haul.upToWalk > 1) parts.push(`${haul.upToWalk} are up to the walk`);
  if (haul.overWalk === 1) parts.push('1 is over the walk');
  else if (haul.overWalk > 1) parts.push(`${haul.overWalk} are over the walk`);
  const seated = `${joinParts(parts)}.`;
  if (haul.noLadder === 0) return seated;
  const off = haul.noLadder === 1 ? '1 price stays off the ladder.' : `${haul.noLadder} prices stay off the ladder.`;
  return `${seated} ${off}`;
}

function bookSentence(haul: ShowHaul): string {
  const filed = haul.filed === 1
    ? `1 is in the book at a local mark of ${money(haul.markUsd)} (unrealized ${signed(haul.unrealizedUsd)}).`
    : `${haul.filed} are in the book at a local mark of ${money(haul.markUsd)} (unrealized ${signed(haul.unrealizedUsd)}).`;
  const held = haul.filed === 0 ? 'None of these buys are in the book yet.' : filed;
  if (haul.unfiled === 0) return held;
  const waiting = haul.unfiled === 1 ? '1 is still off the book.' : `${haul.unfiled} are still off the book.`;
  return `${held} ${waiting}`;
}

function placeSentence(haul: ShowHaul): string {
  if (haul.filed === 0) return '';
  if (haul.unplaced === 0) return ' Every filed card has a binder, box, or slab.';
  if (haul.unplaced === 1) return ' 1 filed card has no binder, box, or slab.';
  return ` ${haul.unplaced} filed cards have no binder, box, or slab.`;
}

function duplicateSentence(haul: ShowHaul): string {
  if (haul.duplicates === 0) return '';
  if (haul.duplicates === 1) return ' 1 is a second copy.';
  return ` ${haul.duplicates} are second copies.`;
}

function showCopy(haul: Omit<ShowHaul, 'copy'>): string {
  if (haul.rows.length === 0) return EMPTY_SHOW;
  const noun = haul.rows.length === 1 ? 'card' : 'cards';
  return `Haul: ${haul.rows.length} ${noun}, paid ${money(haul.paidUsd)}${nameList(haul.rows)}. ${ladderSentence(haul as ShowHaul)} ${bookSentence(haul as ShowHaul)}${placeSentence(haul as ShowHaul)}${duplicateSentence(haul as ShowHaul)} Not a settlement and not a live tape.`;
}

function where(row: HaulRow): string {
  if (row.tape == null) return '';
  const kind = row.tape === 'comps' ? 'sold comps' : 'demo ladder';
  const band = row.band ? `${row.band} ` : '';
  return ` on ${band}${kind}`;
}

export function haulRowCopy(row: HaulRow): string {
  const fair = row.fairUsd;
  const walk = row.walkUsd;
  let ladder = 'no ladder';
  if (row.ladder !== 'no ladder' && fair != null && walk != null) {
    const tape = where(row);
    if (row.ladder === 'beat fair') ladder = `beat the fair${tape} (fair ${money(fair)})`;
    else if (row.ladder === 'up to walk') ladder = `up to the walk${tape} (fair ${money(fair)}, walk ${money(walk)})`;
    else ladder = `over the walk${tape} (walk ${money(walk)})`;
  }
  if (!row.filed) return `${row.player} · paid ${money(row.paidUsd)} · ${ladder} · still off the book`;
  const copy = row.duplicate ? ' · second copy' : '';
  return `${row.player} · paid ${money(row.paidUsd)} · ${ladder} · in the book at ${money(row.markUsd ?? 0)} · ${homeLabel(row.place)}${copy}`;
}

export function showHaul(input: {
  notes: readonly HaulNote[];
  inventory: readonly HaulBookCard[];
  places: Readonly<Record<string, string | undefined>>;
  rangeForId: (id: string) => SaleRange | null;
}): ShowHaul {
  const byId = new Map(input.inventory.map((card) => [card.id, card]));
  const copies = new Map<string, number>();
  for (const card of input.inventory) {
    if (!active(card)) continue;
    const key = identity(card);
    copies.set(key, (copies.get(key) ?? 0) + 1);
  }
  const rows = draftRows(input.notes).map((draft) => {
    const held = byId.get(draft.id);
    const spot = ladderOf(draft.paidUsd, draft.cardId ? input.rangeForId(draft.cardId) : null);
    const mark = held ? cents(markOf(held)) : null;
    const place = held ? placeOf(input.places, draft.id) : null;
    const duplicate = held != null && active(held) && (copies.get(identity(held)) ?? 0) >= 2;
    return {
      id: draft.id,
      player: draft.player,
      paidUsd: draft.paidUsd,
      ...spot,
      filed: held != null,
      markUsd: mark,
      unrealizedUsd: held != null && mark != null ? cents(mark - draft.paidUsd) : null,
      place,
      duplicate,
    };
  });
  rows.sort((a, b) => a.player.localeCompare(b.player) || a.id.localeCompare(b.id));
  let paidUsd = 0;
  let fairUsd = 0;
  let markUsd = 0;
  let unrealizedUsd = 0;
  let beatFair = 0;
  let upToWalk = 0;
  let overWalk = 0;
  let noLadder = 0;
  let filed = 0;
  let unplaced = 0;
  let duplicates = 0;
  for (const row of rows) {
    paidUsd = cents(paidUsd + row.paidUsd);
    if (row.ladder === 'beat fair') beatFair += 1;
    else if (row.ladder === 'up to walk') upToWalk += 1;
    else if (row.ladder === 'over walk') overWalk += 1;
    else noLadder += 1;
    if (row.fairUsd != null) fairUsd = cents(fairUsd + row.fairUsd);
    if (!row.filed) continue;
    filed += 1;
    markUsd = cents(markUsd + (row.markUsd ?? 0));
    unrealizedUsd = cents(unrealizedUsd + (row.unrealizedUsd ?? 0));
    if (row.place == null) unplaced += 1;
    if (row.duplicate) duplicates += 1;
  }
  const haul = {
    rows,
    paidUsd,
    fairUsd,
    onLadder: beatFair + upToWalk + overWalk,
    beatFair,
    upToWalk,
    overWalk,
    noLadder,
    filed,
    unfiled: rows.length - filed,
    markUsd,
    unrealizedUsd,
    unplaced,
    duplicates,
  };
  return { ...haul, copy: showCopy(haul) };
}

export function haulPlaceIds(haul: ShowHaul): string[] {
  return haul.rows.filter((row) => row.filed && row.place == null).map((row) => row.id);
}

function inWeek(iso: string | undefined, now: number): boolean {
  const saved = Date.parse(iso ?? '');
  return Number.isFinite(saved) && saved <= now && saved >= now - WEEK_MS;
}

function weekCopy(haul: ShowHaul): string {
  if (haul.rows.length === 0) return EMPTY_WEEK;
  if (haul.filed === 0) {
    const line = haul.rows.length === 1
      ? '1 show buy this week is still off the book.'
      : `${haul.rows.length} show buys this week are still off the book.`;
    return `${line} Not a live tape.`;
  }
  const cards = haul.filed === 1 ? '1 card' : `${haul.filed} cards`;
  let paid = 0;
  for (const row of haul.rows) {
    if (row.filed) paid = cents(paid + row.paidUsd);
  }
  const place = haul.unplaced === 0
    ? 'Every filed card has a binder, box, or slab.'
    : haul.unplaced === 1
      ? '1 filed card has no binder, box, or slab.'
      : `${haul.unplaced} filed cards have no binder, box, or slab.`;
  const off = haul.unfiled === 0
    ? ''
    : haul.unfiled === 1
      ? ' 1 is still off the book.'
      : ` ${haul.unfiled} are still off the book.`;
  return `Show haul in the book this week: ${cards}, paid ${money(paid)}, local mark ${money(haul.markUsd)}, unrealized ${signed(haul.unrealizedUsd)}. ${place}${off} Not a settlement and not a live tape.`;
}

export function weekHaul(input: {
  notes: readonly HaulNote[];
  inventory: readonly HaulBookCard[];
  places: Readonly<Record<string, string | undefined>>;
  rangeForId: (id: string) => SaleRange | null;
  now?: number;
}): WeekHaul {
  const now = input.now ?? Date.now();
  const notes = input.notes.filter((note) => inWeek(note.savedAt, now));
  const haul = showHaul({ ...input, notes });
  return { haul, copy: weekCopy(haul) };
}
