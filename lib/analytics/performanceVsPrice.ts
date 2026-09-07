import type { CardInventory } from '../../types';
import type { PlayerPerformance } from '../utils/statsService';

export interface PerformanceVsPricePoint {
  player: string;
  cardId: string;
  price: number;
  performance: number;
  ops?: string;
  avg?: string;
  homeRuns?: string | number;
  source: 'mlb_stats_plus_mark';
}

function parseStatNumber(value: string | number | undefined): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return 0;
  const parsed = Number.parseFloat(value.replace(/^[.]+/, (m) => `0${m}`));
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Map hitting line to a 0–100 performance score (OPS-weighted, demo-safe fallback).
 */
export function normalizeHittingToScore(
  stats: PlayerPerformance['stats'] | undefined,
): { score: number; ops?: string; avg?: string; homeRuns?: string | number } {
  if (!stats || stats.length === 0) return { score: 0 };
  const byLabel = new Map(stats.map((s) => [s.label.toUpperCase(), s.value]));
  const ops = byLabel.get('OPS');
  const avg = byLabel.get('AVG');
  const hr = byLabel.get('HR');
  const opsNum = parseStatNumber(ops);
  const avgNum = parseStatNumber(avg);
  const hrNum = parseStatNumber(hr);
  // OPS 0.600–1.100 → 20–95; AVG and HR nudge the remainder.
  const opsScore = Math.min(95, Math.max(15, ((opsNum - 0.6) / 0.5) * 80 + 20));
  const avgNudge = Math.min(8, Math.max(-4, (avgNum - 0.25) * 40));
  const hrNudge = Math.min(6, hrNum / 8);
  return {
    score: Math.round(Math.min(100, Math.max(0, opsScore + avgNudge + hrNudge))),
    ops: ops !== undefined ? String(ops) : undefined,
    avg: avg !== undefined ? String(avg) : undefined,
    homeRuns: hr,
  };
}

function namesMatch(cardPlayer: string, statName: string): boolean {
  const a = cardPlayer.trim().toLowerCase();
  const b = statName.trim().toLowerCase();
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
}

/**
 * Bind inventory marks to MLB StatsService rows for Performance vs Price charts.
 */
export function buildPerformanceVsPriceSeries(
  cards: CardInventory[],
  performances: Array<PlayerPerformance | null | undefined>,
): PerformanceVsPricePoint[] {
  const live = performances.filter((p): p is PlayerPerformance => !!p);
  const points: PerformanceVsPricePoint[] = [];

  for (const card of cards) {
    if (card.status === 'sold') continue;
    if (card.league !== 'MLB' && card.sport !== 'Baseball') continue;
    const match = live.find((p) => namesMatch(card.player, p.fullName));
    if (!match) continue;
    const hitting = normalizeHittingToScore(match.stats);
    const price = card.currentValue || card.purchasePrice || 0;
    if (price <= 0) continue;
    points.push({
      player: match.fullName || card.player,
      cardId: card.id,
      price,
      performance: hitting.score,
      ops: hitting.ops,
      avg: hitting.avg,
      homeRuns: hitting.homeRuns,
      source: 'mlb_stats_plus_mark',
    });
  }

  return points.sort((a, b) => b.price - a.price).slice(0, 8);
}
