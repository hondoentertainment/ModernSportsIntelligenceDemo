/**
 * Demo portfolio path from cost to the local mark. Not a price-history table.
 */
import type { CardInventory } from '../../types';

export const PORTFOLIO_SERIES_DISCLOSURE =
  'Demo path from cost to the local mark. Not a live price history.';

export interface SeriesPoint {
  label: string;
  valueUsd: number;
}

function pointDate(now: Date, offset: number): Date {
  if (offset === 0) return now;
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1));
  return new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0, 23, 59, 59));
}

function valueAt(card: CardInventory, at: Date, now: Date): number {
  const mark = card.currentValue ?? card.purchasePrice;
  const startMs = Date.parse(card.purchaseDate);
  if (!Number.isFinite(startMs)) return mark;
  if (at.getTime() < startMs) return 0;
  const span = now.getTime() - startMs;
  if (span <= 0) return mark;
  const t = Math.min(1, Math.max(0, (at.getTime() - startMs) / span));
  return card.purchasePrice + (mark - card.purchasePrice) * t;
}

export function buildPortfolioSeries(cards: CardInventory[], now = new Date()): SeriesPoint[] {
  const held = cards.filter((card) => card.status !== 'sold' && card.status !== 'consignment');
  const points: SeriesPoint[] = [];
  for (let offset = -5; offset <= 0; offset += 1) {
    const at = pointDate(now, offset);
    const valueUsd = Math.round(held.reduce((sum, card) => sum + valueAt(card, at, now), 0));
    points.push({ label: at.toISOString().slice(0, 7), valueUsd });
  }
  return points;
}
