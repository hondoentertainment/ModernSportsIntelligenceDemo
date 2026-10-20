/**
 * Places a collector's number on the low, median, and high of the last
 * sales already kept for that card. Stored sold comps when present.
 * Otherwise the same stable demo sketch as the comps snapshot.
 * Not a live tape.
 */
import type { TargetWatchlist } from '../../types';
import { compsSnapshot } from './deskNext';

export const SALE_RANGE_BLURB =
  'Low, median, and high from the last sales kept on this card. Sold comps when those sales are stored. Otherwise a stable demo sketch around the local mark.';

export const SALE_RANGE_NOTE = `${SALE_RANGE_BLURB} Not a live tape.`;

export const RANGE_LIMIT = 8;

export type RangeSeat = 'under low' | 'inside' | 'over high' | 'no price' | 'no range';

export interface SaleRange {
  source: 'comps' | 'demo' | 'none';
  low: number | null;
  median: number | null;
  high: number | null;
  count: number;
}

interface SaleInput {
  id: string;
  currentValue?: number;
  purchasePrice?: number;
  salesData?: readonly { price: number; totalPrice?: number; soldAt?: string }[];
}

export interface RangeRow {
  id: string;
  title: string;
  detail: string;
  href: string;
  seat: Exclude<RangeSeat, 'no price' | 'no range'>;
}

export interface TargetRangeDesk {
  rows: RangeRow[];
  omitted: number;
}

function money(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return `$${rounded.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function positive(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100) / 100;
}

export function saleRange(input: SaleInput): SaleRange {
  const snap = compsSnapshot(input);
  if (snap.source === 'none' || snap.median == null || snap.points.length === 0) {
    return { source: 'none', low: null, median: null, high: null, count: 0 };
  }
  return {
    source: snap.source,
    low: Math.min(...snap.points),
    median: snap.median,
    high: Math.max(...snap.points),
    count: snap.points.length,
  };
}

export function rangeSeat(price: number | null, range: SaleRange): RangeSeat {
  const value = positive(price);
  if (value == null) return 'no price';
  if (range.source === 'none' || range.low == null || range.high == null) return 'no range';
  if (value < range.low) return 'under low';
  if (value > range.high) return 'over high';
  return 'inside';
}

function where(seat: Exclude<RangeSeat, 'no price' | 'no range'>): string {
  if (seat === 'under low') return 'under the low';
  if (seat === 'over high') return 'over the high';
  return 'inside the range';
}

export function rangeSeatCopy(price: number | null, range: SaleRange, noun: string): string | null {
  const seat = rangeSeat(price, range);
  if (seat === 'no price' || seat === 'no range') return null;
  if (range.low == null || range.median == null || range.high == null || price == null) return null;
  const band = range.source === 'comps' ? 'sold comps' : 'demo sales';
  return `${noun} ${money(price)} is ${where(seat)} of ${band} (${money(range.low)}–${money(range.high)}, median ${money(range.median)}).`;
}

function sortGap(price: number, range: SaleRange, seat: RangeSeat): number {
  if (seat === 'under low') return price - (range.low ?? price);
  if (seat === 'inside') return price - (range.median ?? price);
  if (seat === 'over high') return price - (range.high ?? price);
  return 0;
}

const SEAT_RANK: Record<RangeRow['seat'], number> = {
  'under low': 0,
  inside: 1,
  'over high': 2,
};

export function targetRangeDesk(
  targets: readonly TargetWatchlist[],
  limit = RANGE_LIMIT
): TargetRangeDesk {
  const ranked: Array<RangeRow & { gap: number }> = [];
  for (const target of targets) {
    if (target.status !== 'active') continue;
    const price = positive(target.targetPrice);
    if (price == null) continue;
    const range = saleRange({
      id: target.id,
      currentValue: target.currentMarketPrice,
      salesData: target.salesData,
    });
    const seat = rangeSeat(price, range);
    if (seat === 'no price' || seat === 'no range') continue;
    const copy = rangeSeatCopy(price, range, 'Your target');
    if (!copy) continue;
    const player = target.player.trim() || 'Watchlist card';
    const detail = target.cardDescription.trim() || 'Watchlist row';
    ranked.push({
      id: `range:${target.id}`,
      title: `${player} is ${where(seat)}`,
      detail: `${copy} ${detail}.`,
      href: '/collection',
      seat,
      gap: sortGap(price, range, seat),
    });
  }
  ranked.sort(
    (a, b) =>
      SEAT_RANK[a.seat] - SEAT_RANK[b.seat] ||
      a.gap - b.gap ||
      a.title.localeCompare(b.title) ||
      a.id.localeCompare(b.id)
  );
  const cap = Math.max(0, limit);
  return {
    rows: ranked.slice(0, cap).map(row => ({
      id: row.id,
      title: row.title,
      detail: row.detail,
      href: row.href,
      seat: row.seat,
    })),
    omitted: Math.max(0, ranked.length - cap),
  };
}
