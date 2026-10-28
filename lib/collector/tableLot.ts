/**
 * One table note can name several cards sold as a lot.
 * The lot ask is the bundle. Each card's own ask sits on that card's range.
 * The lot price is not one card's sale. Not a dealer quote and not a live tape.
 */
import type { CardInventory, Sport } from '../../types';
import {
  buildFloorBuyDraft,
  cleanPlayer,
  floorBuyId,
  paidOnNote,
  unfiledBuys,
  type CloseNote,
} from './showClose';

export const TABLE_LOT_NOTE =
  'A lot keeps every card on one note. Each card\'s ask uses that card\'s range. The lot price is not one card\'s sale. Not a dealer quote and not a live tape.';

export const LOT_LIMIT = 6;

export interface LotLine {
  player?: string;
  detail?: string;
  sport?: Sport;
  cardId?: string;
  askUsd?: number;
}

export interface LotNote {
  id: string;
  showId: string;
  dealer: string;
  table: string;
  askUsd: number;
  offerUsd: number;
  result: string;
  player?: string;
  detail?: string;
  sport?: Sport;
  cardId?: string;
  savedAt?: string;
  lines?: readonly LotLine[];
}

export function isLot(note: { lines?: readonly LotLine[] | undefined }): boolean {
  return (note.lines?.length ?? 0) >= 2;
}

export function lotCopy(note: { askUsd: number; lines?: readonly LotLine[] | undefined }): string | null {
  if (!isLot(note) || !Number.isFinite(note.askUsd) || note.askUsd < 0) return null;
  const count = note.lines?.length ?? 0;
  return `${count} cards in this lot for $${note.askUsd.toFixed(2)}. The lot price is not one card's sale. Not a dealer quote.`;
}

export function lotLineLabel(line: LotLine): string {
  const name = cleanPlayer(line.player) ?? 'Card';
  if (typeof line.askUsd === 'number' && Number.isFinite(line.askUsd) && line.askUsd > 0) {
    return `${name} · ask $${line.askUsd.toFixed(2)}`;
  }
  return `${name} · no card ask, so this card stays off the sale range`;
}

export function lotCardId(noteId: string, index: number): string {
  return floorBuyId(`${noteId}:line:${index + 1}`);
}

function roundUsd(value: number): number {
  return Math.round(value * 100) / 100;
}

function allocate(total: number, weights: number[]): number[] {
  const sum = weights.reduce((acc, weight) => acc + weight, 0);
  if (!(sum > 0)) return weights.map(() => 0);
  const shares = weights.map((weight) => roundUsd((total * weight) / sum));
  const drift = roundUsd(total - shares.reduce((acc, share) => acc + share, 0));
  shares[shares.length - 1] = roundUsd(shares[shares.length - 1] + drift);
  return shares;
}

function fileableLines(note: LotNote): Array<{ line: LotLine; index: number }> {
  const lines = note.lines ?? [];
  return lines.flatMap((line, index) => {
    if (!cleanPlayer(line.player)) return [];
    if (typeof line.askUsd !== 'number' || !Number.isFinite(line.askUsd) || !(line.askUsd > 0)) return [];
    return [{ line, index }];
  });
}

export function lotReady(note: LotNote): boolean {
  if (!isLot(note) || note.result !== 'bought' || !paidOnNote(note)) return false;
  return fileableLines(note).length === (note.lines?.length ?? 0);
}

export function buildLotDrafts(input: {
  note: LotNote;
  showName: string;
  purchaseDate: string;
}): CardInventory[] | null {
  if (!lotReady(input.note)) return null;
  const paid = paidOnNote(input.note);
  if (!paid) return null;
  const rows = fileableLines(input.note);
  const shares = allocate(paid.usd, rows.map((row) => row.line.askUsd ?? 0));
  const drafts: CardInventory[] = [];
  rows.forEach((row, shareIndex) => {
    const draft = buildFloorBuyDraft({
      note: {
        id: `${input.note.id}:line:${row.index + 1}`,
        showId: input.note.showId,
        dealer: input.note.dealer,
        table: input.note.table,
        askUsd: shares[shareIndex],
        offerUsd: shares[shareIndex],
        result: 'bought',
        player: row.line.player,
        detail: row.line.detail,
        sport: row.line.sport,
        cardId: row.line.cardId,
        savedAt: input.note.savedAt,
      },
      showName: input.showName,
      purchaseDate: input.purchaseDate,
    });
    if (draft) {
      draft.notes = `Lot ${input.note.id} at ${input.showName.trim() || 'Local card show'}, card ${row.index + 1} of ${rows.length}. The paid price is split by each card's ask. Not a settlement and not a live tape.`;
      drafts.push(draft);
    }
  });
  return drafts.length === rows.length ? drafts : null;
}

export function boughtLotShares(note: {
  result: string;
  offerUsd: number;
  askUsd: number;
  lines?: readonly { askUsd?: number | null }[];
}): number[] | null {
  const lines = note.lines ?? [];
  if (note.result !== 'bought' || lines.length < 2) return null;
  const paid = paidOnNote(note);
  if (!paid) return null;
  const weights = lines.map((line) => (
    typeof line.askUsd === 'number' && Number.isFinite(line.askUsd) && line.askUsd > 0 ? line.askUsd : 0
  ));
  if (weights.some((weight) => !(weight > 0))) return null;
  return allocate(paid.usd, weights);
}

export function lotDraftIds(note: LotNote): string[] {
  if (!lotReady(note)) return [];
  return fileableLines(note).map((row) => lotCardId(note.id, row.index));
}

export function unfiledNotes(notes: readonly LotNote[], inventory: readonly { id: string }[]): CloseNote[] {
  const ids = new Set(inventory.map((row) => row.id));
  const waiting: CloseNote[] = unfiledBuys(notes.filter((note) => !isLot(note)), inventory);
  for (const note of notes) {
    if (!isLot(note) || note.result !== 'bought' || !paidOnNote(note) || !cleanPlayer(note.player)) continue;
    const drafted = lotDraftIds(note);
    const missing = drafted.length === 0 || drafted.some((id) => !ids.has(id));
    if (missing) waiting.push(note);
  }
  return waiting;
}

export function expandLotNotes<T extends LotNote>(notes: readonly T[]): T[] {
  const out: T[] = [];
  for (const note of notes) {
    if (!isLot(note)) {
      out.push(note);
      continue;
    }
    (note.lines ?? []).forEach((line, index) => {
      const player = cleanPlayer(line.player);
      if (!player || typeof line.askUsd !== 'number' || !Number.isFinite(line.askUsd) || !(line.askUsd > 0)) return;
      out.push({
        ...note,
        id: `${note.id}:${index}`,
        player,
        detail: line.detail,
        sport: line.sport,
        cardId: line.cardId,
        askUsd: line.askUsd,
        offerUsd: 0,
        lines: undefined,
      });
    });
  }
  return out;
}
