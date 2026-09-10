/**
 * Collection and favorites top movers from stored snapshots / dated comps.
 * Not a global live Market Movers feed.
 */
import type { CardInventory } from '../../types';
import { getCardSparkline, type CardSparklineSource } from './priceHistory';
import { preferredValueForCard } from '../pricing/compConsensus';

export const PORTFOLIO_MOVERS_DISCLOSURE =
  'Portfolio-relative and favorites movers from local valuation snapshots, then dated sold comps. Not a live Sports Card Investor / Market Movers tape.';

export const MOVER_MIN_POINTS = 2;
export const MOVER_STABLE_BAND_PCT = 2;

export type MoverDirection = 'up' | 'down' | 'stable';

export interface MoverRow {
  cardId: string;
  player: string;
  year: number;
  set: string;
  from: number;
  to: number;
  changeAbs: number;
  changePct: number;
  direction: MoverDirection;
  source: CardSparklineSource;
  thin: boolean;
}

export interface MoversReport {
  gainers: MoverRow[];
  losers: MoverRow[];
  stable: MoverRow[];
  thinCount: number;
  pricedCount: number;
  emptyReason: string | null;
  disclosure: string;
}

function activeCards(inventory: CardInventory[]): CardInventory[] {
  return inventory.filter((card) => card.status !== 'sold');
}

function directionFromPct(changePct: number): MoverDirection {
  if (changePct > MOVER_STABLE_BAND_PCT) return 'up';
  if (changePct < -MOVER_STABLE_BAND_PCT) return 'down';
  return 'stable';
}

export function computeCardMover(card: CardInventory): MoverRow | null {
  if (card.status === 'sold') return null;
  const spark = getCardSparkline(card);
  const last = spark.values.length > 0 ? spark.values[spark.values.length - 1] : preferredValueForCard(card) || card.currentValue || 0;
  const first = spark.values.length > 0 ? spark.values[0] : last;
  if (!(last > 0) && !(first > 0)) return null;

  const from = first > 0 ? first : last;
  const to = last > 0 ? last : first;
  const changeAbs = Math.round((to - from) * 100) / 100;
  const changePct = from > 0 ? Math.round(((to - from) / from) * 1000) / 10 : 0;
  const thin = spark.source === 'thin' || spark.values.length < MOVER_MIN_POINTS;

  return {
    cardId: card.id,
    player: card.player,
    year: card.year,
    set: card.set,
    from: Math.round(from * 100) / 100,
    to: Math.round(to * 100) / 100,
    changeAbs,
    changePct,
    direction: thin ? 'stable' : directionFromPct(changePct),
    source: spark.source,
    thin,
  };
}

function sortByAbsPct(a: MoverRow, b: MoverRow): number {
  return Math.abs(b.changePct) - Math.abs(a.changePct);
}

export function listPortfolioMovers(
  inventory: CardInventory[],
  options?: { limit?: number; favoriteIds?: string[] },
): MoversReport {
  const limit = options?.limit ?? 5;
  const favoriteIds = options?.favoriteIds;
  const pool = favoriteIds
    ? activeCards(inventory).filter((card) => favoriteIds.includes(card.id))
    : activeCards(inventory);

  const rows = pool
    .map((card) => computeCardMover(card))
    .filter((row): row is MoverRow => row != null);

  const usable = rows.filter((row) => !row.thin);
  const thinCount = rows.filter((row) => row.thin).length;
  const gainers = usable.filter((row) => row.direction === 'up').sort(sortByAbsPct).slice(0, limit);
  const losers = usable.filter((row) => row.direction === 'down').sort(sortByAbsPct).slice(0, limit);
  const stable = usable.filter((row) => row.direction === 'stable').sort(sortByAbsPct).slice(0, limit);

  let emptyReason: string | null = null;
  if (pool.length === 0) {
    emptyReason = favoriteIds
      ? 'No favorites in the local collection yet — star a card to track watchlist movers.'
      : 'No active holdings to rank.';
  } else if (usable.length === 0) {
    emptyReason = 'Not enough local snapshots or dated comps yet — movers stay empty rather than invent a live tape.';
  }

  return {
    gainers,
    losers,
    stable,
    thinCount,
    pricedCount: rows.length,
    emptyReason,
    disclosure: PORTFOLIO_MOVERS_DISCLOSURE,
  };
}

export function listFavoriteMovers(
  inventory: CardInventory[],
  favoriteIds: string[],
  limit = 5,
): MoversReport {
  return listPortfolioMovers(inventory, { limit, favoriteIds });
}
