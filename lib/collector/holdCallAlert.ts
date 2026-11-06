/**
 * Hold-call alerts for unsold cards on the watchlist hub and the alert
 * digest. Hold, clear, and under use the same test as the show profit
 * and loss. A missing mark, a buy that is not filed, and a short-term
 * gain more than 45 days from the line stay off. Not a tax determination
 * and not a live tape.
 */
import type { CardInventory } from '../../types';
import { store } from '../dal/syncStore';
import { haggleSnapshot } from '../shows/showHaggleLog';
import { readFloorDecisions } from '../shows/showTripLoop';
import type { ShowHoldCall } from './holdingBuckets';
import { showPnl, type PnlBookCard, type PnlDecision, type PnlNote } from './showPnl';

export const HOLD_CALL_ALERT_NOTE =
  'An unsold card on the watchlist hub and the alert digest. Inside 45 days of long-term, and still ahead after the ~4% card-show fee, is a hold. Already long-term and still ahead is clear. Not ahead after that fee is under. A missing mark, a buy that is not filed, and a short-term gain more than 45 days from the line stay off. Not a tax determination and not a live tape.';

export interface HoldCallAlert {
  id: string;
  cardId: string;
  player: string;
  call: ShowHoldCall;
  daysToLongTerm: number | null;
  title: string;
  detail: string;
  href: string;
}

const CALL_RANK: Record<ShowHoldCall, number> = { hold: 0, clear: 1, under: 2 };

export function holdCallAlertHref(cardId: string): string {
  return `/audit-dossier?cardId=${encodeURIComponent(cardId)}`;
}

function daysPhrase(days: number): string {
  return days === 1 ? '1 day to long-term' : `${days} days to long-term`;
}

export function holdCallAlertCopy(input: {
  player: string;
  call: ShowHoldCall;
  daysToLongTerm?: number | null;
}): { title: string; detail: string } {
  const player = input.player.trim() || 'Unsold card';
  const days = input.daysToLongTerm;
  const dayBit = typeof days === 'number' && days > 0 ? ` ${daysPhrase(days)}.` : '';
  if (input.call === 'hold') {
    const left = typeof days === 'number' && days > 0 ? daysPhrase(days) : 'inside 45 days of long-term';
    return {
      title: `${player} · hold`,
      detail: `Entered the hold window. ${left}. Still ahead after the ~4% card-show fee. Not a tax determination.`,
    };
  }
  if (input.call === 'clear') {
    return {
      title: `${player} · clear`,
      detail: 'Crossed into long-term and is clear. Still ahead after the ~4% card-show fee. Not a tax determination.',
    };
  }
  return {
    title: `${player} · under`,
    detail: `The mark no longer clears the ~4% card-show fee.${dayBit} Not a tax determination.`,
  };
}

function readCards(raw: unknown): PnlBookCard[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((row): row is PnlBookCard => {
    if (!row || typeof row !== 'object') return false;
    const card = row as PnlBookCard;
    return typeof card.id === 'string' && typeof card.player === 'string';
  });
}

export function holdCallAlerts(input: {
  notes: readonly PnlNote[];
  decisions?: readonly PnlDecision[];
  inventory: readonly PnlBookCard[];
  now?: number;
}): HoldCallAlert[] {
  const pnl = showPnl({
    notes: input.notes,
    decisions: input.decisions,
    inventory: input.inventory,
    now: input.now,
  });
  const rows: HoldCallAlert[] = [];
  for (const row of pnl.unsold) {
    if (row.holdCall !== 'hold' && row.holdCall !== 'clear' && row.holdCall !== 'under') continue;
    const copy = holdCallAlertCopy({
      player: row.player,
      call: row.holdCall,
      daysToLongTerm: row.daysToLongTerm,
    });
    rows.push({
      id: `hold:${row.id}`,
      cardId: row.id,
      player: row.player.trim() || 'Unsold card',
      call: row.holdCall,
      daysToLongTerm: row.daysToLongTerm ?? null,
      title: copy.title,
      detail: copy.detail,
      href: holdCallAlertHref(row.id),
    });
  }
  rows.sort((a, b) => {
    const rank = CALL_RANK[a.call] - CALL_RANK[b.call];
    if (rank !== 0) return rank;
    if (a.call === 'hold') {
      const days = (a.daysToLongTerm ?? 0) - (b.daysToLongTerm ?? 0);
      if (days !== 0) return days;
    }
    const name = a.player.localeCompare(b.player);
    if (name !== 0) return name;
    return a.cardId.localeCompare(b.cardId);
  });
  return rows;
}

export function loadHoldCallAlerts(inventoryRaw: unknown = undefined, now = Date.now()): HoldCallAlert[] {
  const inventory = inventoryRaw === undefined ? store.get<CardInventory[]>('cardx_inventory', []) : inventoryRaw;
  return holdCallAlerts({
    notes: haggleSnapshot(),
    decisions: readFloorDecisions(),
    inventory: readCards(inventory),
    now,
  });
}
