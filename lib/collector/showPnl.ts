/**
 * Show-day profit and loss for the local card-show loop.
 * Demo buys and recorded sales, the ~4% card-show fee, and the realized
 * result. Sold inventory and unsold inventory stay apart.
 * Not a settlement and not a live tape.
 */
import { allInCost, exitMarker, exitMath, signedUsd, takenOnNote } from './showExit';
import { cleanPlayer, floorBuyId, paidOnNote } from './showClose';
import { boughtLotShares, isLot, lotCardId } from './tableLot';
import { collectionDraftId } from '../shows/showTripLoop';

export const SHOW_PNL_NOTE =
  'Demo buys and recorded sales at this seeded show. The card-show fee is the existing ~4% heuristic. Realized is the price on the book, minus that fee, minus the cost. Unsold inventory is a buy you still hold, including a buy not filed yet. Sold inventory is a sale written on the book. A sale still held, a pass, an open note, and a lot that cannot be split stay off the realized total. A note with no date stays on this show and off the week. Not a settlement and not a live tape.';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const NAME_LIMIT = 4;
const EMPTY_SHOW =
  'No demo buy or recorded sale is on this profit and loss. A passed note, an open note, and a lot that cannot be split stay off. Not a live tape.';
const EMPTY_WEEK =
  'No dated show buy or recorded sale this week. A note with no date stays on that show and off the week. A passed note, an open note, and a lot that cannot be split stay off. Not a live tape.';

export interface PnlNote {
  id: string;
  result: string;
  askUsd: number;
  offerUsd: number;
  player?: string;
  cardId?: string;
  savedAt?: string;
  lines?: readonly { player?: string; cardId?: string; askUsd?: number }[];
}

export interface PnlBookCard {
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

export interface PnlDecision {
  opportunityId: string;
  showId?: string;
  player: string;
  call: string;
  tablePriceUsd: number | null;
  cardId: string | null;
  decidedAt?: string;
}

export type PnlSide = 'unsold' | 'sold';

export interface PnlRow {
  id: string;
  side: PnlSide;
  player: string;
  paidUsd: number | null;
  costUsd: number | null;
  takenUsd: number | null;
  feeUsd: number | null;
  realizedUsd: number | null;
}

export interface ShowPnl {
  buyCount: number;
  buyUsd: number;
  unsold: PnlRow[];
  sold: PnlRow[];
  takenUsd: number;
  feeUsd: number;
  realizedUsd: number;
  realizedRows: number;
  noBasis: number;
  unrecorded: number;
  otherSale: number;
  consigned: number;
  copy: string;
}

export interface WeekPnl {
  pnl: ShowPnl;
  copy: string;
}

interface BuyDraft {
  id: string;
  player: string;
  paidUsd: number;
}

function cents(value: number): number {
  return Math.round(value * 100) / 100;
}

function money(value: number): string {
  return `$${cents(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function positive(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null;
  return cents(value);
}

function playerName(value: string | undefined, fallback?: string): string {
  return cleanPlayer(value) || cleanPlayer(fallback) || 'Card';
}

function buyDrafts(notes: readonly PnlNote[]): BuyDraft[] {
  const rows: BuyDraft[] = [];
  for (const note of notes) {
    if (note.result !== 'bought') continue;
    if (isLot(note)) {
      const shares = boughtLotShares(note);
      if (!shares) continue;
      (note.lines ?? []).forEach((line, index) => {
        const paid = shares[index];
        const player = cleanPlayer(line.player);
        if (!player || !(paid > 0)) return;
        rows.push({ id: lotCardId(note.id, index), player, paidUsd: paid });
      });
      continue;
    }
    const player = cleanPlayer(note.player);
    const paid = paidOnNote(note);
    if (!player || !paid) continue;
    rows.push({ id: floorBuyId(note.id), player, paidUsd: paid.usd });
  }
  return rows;
}

function bookSale(card: PnlBookCard | undefined): number | null {
  if (!card || card.status !== 'sold') return null;
  return positive(card.salePrice);
}

function floorKey(decision: PnlDecision, showId: string | undefined): string | null {
  const scope = decision.showId?.trim() || showId?.trim() || '';
  const opportunity = decision.opportunityId.trim();
  if (!scope || !opportunity) return null;
  return collectionDraftId(scope, opportunity);
}

function soldFromBook(id: string, player: string, paid: number | null, card: PnlBookCard): PnlRow {
  const taken = bookSale(card);
  const cost = allInCost(card) ?? paid;
  const math = taken == null ? null : exitMath(taken, cost);
  return {
    id,
    side: 'sold',
    player,
    paidUsd: paid,
    costUsd: cost,
    takenUsd: taken,
    feeUsd: math?.feeUsd ?? null,
    realizedUsd: math?.realizedUsd ?? null,
  };
}

function unsoldRow(id: string, player: string, paid: number): PnlRow {
  return {
    id,
    side: 'unsold',
    player,
    paidUsd: paid,
    costUsd: paid,
    takenUsd: null,
    feeUsd: null,
    realizedUsd: null,
  };
}

export function pnlRowCopy(row: PnlRow): string {
  if (row.side === 'unsold') return `${row.player} · paid ${money(row.paidUsd ?? 0)} · unsold`;
  if (row.takenUsd == null || row.feeUsd == null) return `${row.player} · sold, no sale price`;
  if (row.realizedUsd == null) {
    return `${row.player} · taken ${money(row.takenUsd)} · card-show fee ${money(row.feeUsd)} · no cost basis`;
  }
  return `${row.player} · taken ${money(row.takenUsd)} · card-show fee ${money(row.feeUsd)} · realized ${signedUsd(row.realizedUsd)}`;
}

function nameList(rows: readonly PnlRow[]): string {
  if (rows.length === 0) return '';
  const shown = rows.slice(0, NAME_LIMIT).map((row) => row.player);
  const more = rows.length - shown.length;
  return ` (${shown.join(', ')}${more > 0 ? `, and ${more} more` : ''})`;
}

function joinParts(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? '';
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`;
}

function aside(pnl: Pick<ShowPnl, 'unrecorded' | 'otherSale' | 'consigned'>): string {
  const parts: string[] = [];
  if (pnl.unrecorded === 1) parts.push('1 sale is still held');
  else if (pnl.unrecorded > 1) parts.push(`${pnl.unrecorded} sales are still held`);
  if (pnl.otherSale === 1) parts.push('1 is not the sale recorded');
  else if (pnl.otherSale > 1) parts.push(`${pnl.otherSale} are not the sale recorded`);
  if (pnl.consigned === 1) parts.push('1 is on consignment');
  else if (pnl.consigned > 1) parts.push(`${pnl.consigned} are on consignment`);
  if (parts.length === 0) return '';
  return ` ${joinParts(parts)}.`;
}

function buySentence(pnl: ShowPnl, scope: 'show' | 'week'): string {
  if (pnl.buyCount === 0) return scope === 'week' ? 'No demo buy this week.' : 'No demo buy on this show.';
  const noun = pnl.buyCount === 1 ? '1 card' : `${pnl.buyCount} cards`;
  return `Bought ${noun} for ${money(pnl.buyUsd)}.`;
}

function recordedSentence(pnl: ShowPnl): string {
  const priced = pnl.sold.filter((row) => row.takenUsd != null).length;
  if (priced === 0) return 'No recorded sale.';
  const noun = priced === 1 ? '1 card' : `${priced} cards`;
  const realized = pnl.realizedRows === 0
    ? 'realized stays off without a cost'
    : `realized ${signedUsd(pnl.realizedUsd)}`;
  return `Recorded sales: ${noun} for ${money(pnl.takenUsd)}, card-show fee ${money(pnl.feeUsd)}, ${realized}.`;
}

function unsoldSentence(rows: readonly PnlRow[]): string {
  if (rows.length === 0) return 'Unsold inventory: none.';
  let cost = 0;
  for (const row of rows) cost = cents(cost + (row.paidUsd ?? 0));
  const noun = rows.length === 1 ? '1 card' : `${rows.length} cards`;
  return `Unsold inventory: ${noun}, cost ${money(cost)}${nameList(rows)}.`;
}

function soldSentence(rows: readonly PnlRow[]): string {
  if (rows.length === 0) return 'Sold inventory: none.';
  const names = nameList(rows);
  const priced = rows.filter((row) => row.takenUsd != null);
  if (priced.length === 0) {
    const noun = rows.length === 1 ? '1 card has' : `${rows.length} cards have`;
    return `Sold inventory: ${noun} no sale price${names}.`;
  }
  let taken = 0;
  let fees = 0;
  let realized = 0;
  let realizedRows = 0;
  let noBasis = 0;
  for (const row of priced) {
    taken = cents(taken + (row.takenUsd ?? 0));
    fees = cents(fees + (row.feeUsd ?? 0));
    if (row.realizedUsd == null) noBasis += 1;
    else {
      realized = cents(realized + row.realizedUsd);
      realizedRows += 1;
    }
  }
  const noun = rows.length === 1 ? '1 card' : `${rows.length} cards`;
  const realizedBit = realizedRows === 0
    ? 'no cost basis on a recorded sale'
    : `realized ${signedUsd(realized)} after the card-show fee`;
  const noPrice = rows.length - priced.length;
  const missingPrice = noPrice === 0 ? '' : noPrice === 1 ? ' 1 has no sale price.' : ` ${noPrice} have no sale price.`;
  const missingBasis = noBasis === 0 || realizedRows === 0
    ? ''
    : noBasis === 1
      ? ' 1 recorded sale has no cost basis.'
      : ` ${noBasis} recorded sales have no cost basis.`;
  return `Sold inventory: ${noun}, taken ${money(taken)}, card-show fee ${money(fees)}, ${realizedBit}${names}.${missingPrice}${missingBasis}`;
}

function quiet(pnl: ShowPnl): boolean {
  return pnl.buyCount === 0 && pnl.unsold.length === 0 && pnl.sold.length === 0 && pnl.unrecorded === 0 && pnl.otherSale === 0 && pnl.consigned === 0;
}

export function pnlCopy(pnl: ShowPnl, scope: 'show' | 'week'): string {
  if (quiet(pnl)) return scope === 'week' ? EMPTY_WEEK : EMPTY_SHOW;
  const lead = scope === 'week' ? 'Show profit and loss this week' : 'Show profit and loss';
  return `${lead}: ${buySentence(pnl, scope)} ${recordedSentence(pnl)} ${unsoldSentence(pnl.unsold)} ${soldSentence(pnl.sold)}${aside(pnl)} Not a settlement and not a live tape.`;
}

function totals(unsold: PnlRow[], sold: PnlRow[]): Pick<
  ShowPnl,
  'buyCount' | 'buyUsd' | 'takenUsd' | 'feeUsd' | 'realizedUsd' | 'realizedRows' | 'noBasis'
> {
  let buyCount = 0;
  let buyUsd = 0;
  let takenUsd = 0;
  let feeUsd = 0;
  let realizedUsd = 0;
  let realizedRows = 0;
  let noBasis = 0;
  for (const row of [...unsold, ...sold]) {
    if (row.paidUsd != null) {
      buyCount += 1;
      buyUsd = cents(buyUsd + row.paidUsd);
    }
    if (row.takenUsd == null) continue;
    takenUsd = cents(takenUsd + row.takenUsd);
    feeUsd = cents(feeUsd + (row.feeUsd ?? 0));
    if (row.realizedUsd == null) noBasis += 1;
    else {
      realizedUsd = cents(realizedUsd + row.realizedUsd);
      realizedRows += 1;
    }
  }
  return { buyCount, buyUsd, takenUsd, feeUsd, realizedUsd, realizedRows, noBasis };
}

function pushBuy(
  draft: BuyDraft,
  card: PnlBookCard | undefined,
  unsold: PnlRow[],
  sold: PnlRow[],
  seen: Set<string>,
  handled: Set<string>,
): 'consigned' | 'kept' {
  if (seen.has(draft.id)) return 'kept';
  seen.add(draft.id);
  if (card?.status === 'consignment') return 'consigned';
  if (card?.status === 'sold') {
    sold.push(soldFromBook(draft.id, draft.player, draft.paidUsd, card));
    handled.add(card.id);
    return 'kept';
  }
  unsold.push(unsoldRow(draft.id, draft.player, draft.paidUsd));
  return 'kept';
}

export function showPnl(input: {
  notes: readonly PnlNote[];
  decisions?: readonly PnlDecision[];
  inventory: readonly PnlBookCard[];
  showId?: string;
}): ShowPnl {
  const byId = new Map(input.inventory.map((card) => [card.id, card]));
  const unsold: PnlRow[] = [];
  const sold: PnlRow[] = [];
  const seen = new Set<string>();
  const handled = new Set<string>();
  let consigned = 0;
  let unrecorded = 0;
  let otherSale = 0;

  for (const draft of buyDrafts(input.notes)) {
    const card = byId.get(draft.id);
    if (pushBuy(draft, card, unsold, sold, seen, handled) === 'consigned') consigned += 1;
  }

  for (const decision of input.decisions ?? []) {
    if (decision.call !== 'buy') continue;
    const paid = positive(decision.tablePriceUsd);
    const player = cleanPlayer(decision.player);
    if (paid == null || !player) continue;
    const id = floorKey(decision, input.showId) ?? `buy:${decision.opportunityId.trim() || player}`;
    const card = byId.get(id);
    if (pushBuy({ id, player, paidUsd: paid }, card, unsold, sold, seen, handled) === 'consigned') consigned += 1;
  }

  for (const note of input.notes) {
    const taken = takenOnNote(note);
    if (taken == null) continue;
    const cardId = note.cardId?.trim() || '';
    if (cardId && handled.has(cardId)) continue;
    const card = cardId ? byId.get(cardId) : undefined;
    if (card?.status === 'consignment') {
      consigned += 1;
      if (cardId) handled.add(cardId);
      continue;
    }
    const recorded = card != null && card.status === 'sold' && (card.notes ?? '').includes(exitMarker(note.id));
    if (card?.status === 'sold' && !recorded) {
      otherSale += 1;
      if (cardId) handled.add(cardId);
      continue;
    }
    if (!recorded || card == null) {
      unrecorded += 1;
      if (cardId) handled.add(cardId);
      continue;
    }
    const price = bookSale(card) ?? taken;
    sold.push(soldFromBook(note.id, playerName(note.player, card.player), null, { ...card, salePrice: price }));
    handled.add(card.id);
    if (cardId) handled.add(cardId);
  }

  for (const decision of input.decisions ?? []) {
    if (decision.call !== 'sell') continue;
    const cardId = decision.cardId?.trim() || '';
    if (!cardId || handled.has(cardId)) continue;
    if (positive(decision.tablePriceUsd) == null) continue;
    const card = byId.get(cardId);
    const recorded = card != null
      && card.status === 'sold'
      && (card.notes ?? '').includes('Show recap')
      && bookSale(card) != null;
    if (card?.status === 'consignment') {
      consigned += 1;
      handled.add(cardId);
      continue;
    }
    if (!recorded || card == null) {
      unrecorded += 1;
      handled.add(cardId);
      continue;
    }
    sold.push(soldFromBook(
      `sell:${decision.opportunityId}`,
      playerName(decision.player, card.player),
      null,
      card,
    ));
    handled.add(cardId);
  }

  unsold.sort((a, b) => a.player.localeCompare(b.player) || a.id.localeCompare(b.id));
  sold.sort((a, b) => a.player.localeCompare(b.player) || a.id.localeCompare(b.id));
  const pnl: ShowPnl = {
    unsold,
    sold,
    ...totals(unsold, sold),
    unrecorded,
    otherSale,
    consigned,
    copy: '',
  };
  pnl.copy = pnlCopy(pnl, 'show');
  return pnl;
}

function inWeek(iso: string | undefined, now: number): boolean {
  const saved = Date.parse(iso ?? '');
  return Number.isFinite(saved) && saved <= now && saved >= now - WEEK_MS;
}

export function weekPnl(input: {
  notes: readonly PnlNote[];
  decisions?: readonly PnlDecision[];
  inventory: readonly PnlBookCard[];
  showId?: string;
  now?: number;
}): WeekPnl {
  const now = input.now ?? Date.now();
  const pnl = showPnl({
    ...input,
    notes: input.notes.filter((note) => inWeek(note.savedAt, now)),
    decisions: (input.decisions ?? []).filter((decision) => inWeek(decision.decidedAt, now)),
  });
  return { pnl, copy: pnlCopy(pnl, 'week') };
}
