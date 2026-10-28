/**
 * Dealer and table notes for one seeded show trip.
 * Typed by the collector. Not a dealer quote and not a live tape.
 */
import type { Sport } from '../../types';
import { store } from '../dal/syncStore';
import { LOT_LIMIT, type LotLine } from '../collector/tableLot';
import { cleanDetail, cleanPlayer, cleanSport } from '../collector/showClose';

export const HAGGLE_KEY = 'msi_show_haggle_v1';

export const HAGGLE_DISCLOSURE =
  'Notes you type for this seeded show. Name the player to compare asks across tables and to file a buy. An ask compared with a held card uses sold comps when that card has them, otherwise a demo sketch. Raw and graded sales split when the title or condition names a grade. A lot keeps every card on one note. Each card\'s ask uses that card\'s range. The lot price is not one card\'s sale. The offer ladder opens at the low, calls the median fair, and walks at the high of that held card. The ladder score places the paid price, the offer still open, or the ask you passed on that ladder. A different card on the watchlist does not cap it. A shopping-list mark is the local target, not a live print. Not a dealer quote and not a live tape.';

export type HaggleResult = 'bought' | 'passed' | 'open';

export interface HaggleNote {
  id: string;
  showId: string;
  dealer: string;
  table: string;
  askUsd: number;
  offerUsd: number;
  result: HaggleResult;
  note: string;
  savedAt?: string;
  cardId?: string;
  player?: string;
  detail?: string;
  sport?: Sport;
  lines?: LotLine[];
}

export interface HaggleDraft {
  showId: string;
  dealer: string;
  table: string;
  askUsd: number;
  offerUsd: number;
  result: HaggleResult;
  note: string;
  savedAt?: string;
  cardId?: string;
  player?: string;
  detail?: string;
  sport?: Sport;
  lines?: LotLine[];
}

const RESULTS = new Set<HaggleResult>(['bought', 'passed', 'open']);

function cleanCardId(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const id = value.trim();
  return /^[A-Za-z0-9:_-]{1,80}$/.test(id) ? id : undefined;
}

function cleanAsk(value: number | undefined): { ask: number | undefined; error: string | null } {
  if (value == null) return { ask: undefined, error: null };
  if (!Number.isFinite(value) || value < 0 || value > 1_000_000) {
    return { ask: undefined, error: 'Each card ask must be 0 or more.' };
  }
  return { ask: Math.round(value * 100) / 100, error: null };
}

function cleanLines(lines: readonly LotLine[] | undefined): { lines: LotLine[] | undefined; error: string | null } {
  if (!lines || lines.length < 2) return { lines: undefined, error: null };
  if (lines.length > LOT_LIMIT) return { lines: undefined, error: 'A lot can name up to 6 cards.' };
  const cleaned: LotLine[] = [];
  for (const line of lines) {
    const player = cleanPlayer(line.player);
    const cardId = cleanCardId(line.cardId);
    if (!player && !cardId) return { lines: undefined, error: 'Name each card in the lot.' };
    const ask = cleanAsk(line.askUsd);
    if (ask.error) return { lines: undefined, error: ask.error };
    cleaned.push({
      player,
      detail: cleanDetail(line.detail),
      sport: cleanSport(line.sport),
      cardId,
      askUsd: ask.ask,
    });
  }
  if (cleaned.length < 2) return { lines: undefined, error: 'Name each card in the lot.' };
  return { lines: cleaned, error: null };
}

function savedStamp(value: string | undefined): string {
  const parsed = Date.parse(value ?? '');
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : new Date().toISOString();
}

function readAll(): HaggleNote[] {
  const rows = store.get<HaggleNote[]>(HAGGLE_KEY, []);
  return Array.isArray(rows) ? rows : [];
}

let haggleCacheKey = '';
let haggleCache: HaggleNote[] = [];

export function haggleSnapshot(): HaggleNote[] {
  const rows = readAll();
  const key = JSON.stringify(rows);
  if (key === haggleCacheKey) return haggleCache;
  haggleCacheKey = key;
  haggleCache = rows;
  return haggleCache;
}

export function subscribeHaggle(listener: () => void): () => void {
  return store.onWrite(listener);
}

function writeAll(rows: HaggleNote[]): void {
  store.set(HAGGLE_KEY, rows.slice(0, 80));
}

export function readHaggle(showId: string): HaggleNote[] {
  return readAll().filter((row) => row.showId === showId);
}

export function addHaggle(draft: HaggleDraft): { notes: HaggleNote[]; error: string | null } {
  const dealer = draft.dealer.trim().slice(0, 60);
  const table = draft.table.trim().slice(0, 40);
  const note = draft.note.trim().slice(0, 140);
  if (!dealer || !table) {
    return { notes: readHaggle(draft.showId), error: 'Enter a dealer and a table.' };
  }
  if (!(draft.askUsd >= 0) || !(draft.offerUsd >= 0) || draft.askUsd > 1_000_000 || draft.offerUsd > 1_000_000) {
    return { notes: readHaggle(draft.showId), error: 'Ask and offer must be 0 or more.' };
  }
  if (!RESULTS.has(draft.result)) {
    return { notes: readHaggle(draft.showId), error: 'Pick a result.' };
  }
  const lot = cleanLines(draft.lines);
  if (lot.error) return { notes: readHaggle(draft.showId), error: lot.error };
  const entry: HaggleNote = {
    id: crypto.randomUUID(),
    showId: draft.showId,
    dealer,
    table,
    askUsd: Math.round(draft.askUsd * 100) / 100,
    offerUsd: Math.round(draft.offerUsd * 100) / 100,
    result: draft.result,
    note,
    savedAt: savedStamp(draft.savedAt),
    cardId: cleanCardId(draft.cardId),
    player: cleanPlayer(draft.player),
    detail: cleanDetail(draft.detail),
    sport: cleanSport(draft.sport),
    lines: lot.lines,
  };
  const next = [entry, ...readAll()].slice(0, 80);
  writeAll(next);
  return { notes: next.filter((row) => row.showId === draft.showId), error: null };
}

export function removeHaggle(showId: string, id: string): HaggleNote[] {
  const next = readAll().filter((row) => row.id !== id);
  writeAll(next);
  return next.filter((row) => row.showId === showId);
}
