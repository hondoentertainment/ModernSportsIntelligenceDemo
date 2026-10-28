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

export const GRADE_RANGE_NOTE =
  'Raw and graded sales split when the title or condition names a grade. Sales that name neither stay on the mixed range. A demo sketch is not split. Not a population report and not a live tape.';

export interface SaleRange {
  source: 'comps' | 'demo' | 'none';
  low: number | null;
  median: number | null;
  high: number | null;
  count: number;
  /** Set when this range is one grade band, and that band is not the whole tape. */
  band?: string;
}

interface SalePoint {
  price: number;
  totalPrice?: number;
  soldAt?: string;
  title?: string;
  condition?: string;
}

interface SaleInput {
  id: string;
  currentValue?: number;
  purchasePrice?: number;
  salesData?: readonly SalePoint[];
  isGraded?: boolean;
  gradingCompany?: string | null;
  grade?: string | null;
  gradeText?: string | null;
}

export interface GradeBand {
  key: string;
  label: string;
  low: number;
  median: number;
  high: number;
  count: number;
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
  const kind = range.source === 'comps' ? 'sold comps' : 'demo sales';
  const band = range.band ? `${range.band} ${kind}` : kind;
  return `${noun} ${money(price)} is ${where(seat)} of ${band} (${money(range.low)}–${money(range.high)}, median ${money(range.median)}).`;
}

const GRADER = /\b(PSA|BGS|SGC|CGC|CSG|HGA)\s*(\d+(?:\.\d+)?)\b/i;
const COMP_LIMIT = 6;

function normalizeGradeNumber(raw: string): string | null {
  const match = raw.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? String(value) : null;
}

function gradeKeyFromHay(hay: string): string | null {
  const match = hay.match(GRADER);
  if (match) {
    const grade = normalizeGradeNumber(match[2]);
    return grade ? `${match[1].toUpperCase()} ${grade}` : null;
  }
  if (/\b(raw|ungraded)\b/i.test(hay)) return 'raw';
  return null;
}

export function preferredGradeKey(input: SaleInput): string | null {
  if (input.isGraded === true) {
    const company = input.gradingCompany && input.gradingCompany !== 'Other'
      ? input.gradingCompany.toUpperCase()
      : '';
    const grade = normalizeGradeNumber(input.grade ?? '');
    if (company && grade) return `${company} ${grade}`;
    return gradeKeyFromHay(input.gradeText ?? '');
  }
  if (input.isGraded === false) return 'raw';
  return gradeKeyFromHay(input.gradeText ?? '');
}

interface PricedSale {
  price: number;
  key: string | null;
}

function pricedSales(input: SaleInput): PricedSale[] {
  return (input.salesData ?? [])
    .map((sale) => ({
      price: typeof sale.totalPrice === 'number' && sale.totalPrice > 0 ? sale.totalPrice : sale.price,
      soldAt: sale.soldAt ?? '',
      key: gradeKeyFromHay(`${sale.title ?? ''} ${sale.condition ?? ''}`),
    }))
    .filter((sale) => sale.price > 0 && sale.soldAt)
    .sort((a, b) => a.soldAt.localeCompare(b.soldAt))
    .slice(-COMP_LIMIT)
    .map((sale) => ({ price: sale.price, key: sale.key }));
}

function medianOf(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const value = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  return Math.round(value * 100) / 100;
}

export function gradeBands(input: SaleInput): GradeBand[] {
  const groups = new Map<string, number[]>();
  for (const sale of pricedSales(input)) {
    if (!sale.key) continue;
    const list = groups.get(sale.key);
    if (list) list.push(sale.price);
    else groups.set(sale.key, [sale.price]);
  }
  const bands: GradeBand[] = [];
  for (const [key, prices] of groups) {
    bands.push({
      key,
      label: key === 'raw' ? 'Raw' : key,
      low: Math.min(...prices),
      median: medianOf(prices),
      high: Math.max(...prices),
      count: prices.length,
    });
  }
  bands.sort((a, b) => {
    if (a.key === 'raw') return -1;
    if (b.key === 'raw') return 1;
    return a.key.localeCompare(b.key) || a.low - b.low;
  });
  return bands;
}

export function rangeForSeat(input: SaleInput): SaleRange {
  const mixed = saleRange(input);
  if (mixed.source !== 'comps') return mixed;
  const key = preferredGradeKey(input);
  if (!key) return mixed;
  const band = gradeBands(input).find((row) => row.key === key);
  if (!band) return mixed;
  if (
    band.count === mixed.count
    && band.low === mixed.low
    && band.high === mixed.high
    && band.median === mixed.median
  ) {
    return mixed;
  }
  return {
    source: 'comps',
    low: band.low,
    median: band.median,
    high: band.high,
    count: band.count,
    band: key,
  };
}

export function gradeSplitCopy(input: SaleInput): string | null {
  const mixed = saleRange(input);
  if (mixed.source === 'none') return null;
  if (mixed.source === 'demo') return 'A demo sketch is not split by grade.';
  const bands = gradeBands(input);
  if (bands.length === 0) return 'Stored sales do not name a grade. This range still mixes them.';
  const unnamed = pricedSales(input).filter((sale) => sale.key == null).length;
  const parts = bands.map((band) => (
    `${band.label} sold comps ${money(band.low)}–${money(band.high)}, median ${money(band.median)} (${band.count}).`
  ));
  if (unnamed > 0) {
    const noun = unnamed === 1 ? 'sale does' : 'sales do';
    parts.push(`${unnamed} ${noun} not name a grade and stay on the mixed range.`);
  }
  const key = preferredGradeKey(input);
  const match = key ? bands.find((band) => band.key === key) : undefined;
  if (key && !match) {
    parts.push(`This card is ${key}. No ${key} sales are stored, so the ladder stays on the mixed range.`);
  } else if (key && match && match.count !== mixed.count) {
    parts.push(`The ladder uses the ${key} sales.`);
  }
  return parts.join(' ');
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
    const rangeInput: SaleInput = {
      id: target.id,
      currentValue: target.currentMarketPrice,
      salesData: target.salesData,
      gradeText: typeof target.cardDescription === 'string' ? target.cardDescription : '',
    };
    const range = rangeForSeat(rangeInput);
    const seat = rangeSeat(price, range);
    if (seat === 'no price' || seat === 'no range') continue;
    const copy = rangeSeatCopy(price, range, 'Your target');
    if (!copy) continue;
    const player = (typeof target.player === 'string' ? target.player.trim() : '') || 'Watchlist card';
    const detail = (typeof target.cardDescription === 'string' ? target.cardDescription.trim() : '') || 'Watchlist row';
    const split = gradeSplitCopy(rangeInput);
    ranked.push({
      id: `range:${target.id}`,
      title: `${player} is ${where(seat)}`,
      detail: `${copy} ${detail}.${split ? ` ${split}` : ''}`,
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
