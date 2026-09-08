import type { CardInventory } from '../../types';
import type { LeagueSport, LeagueStatLeader } from '../social/leagueHubService';
import type { PlayerPerformance } from '../utils/statsService';
import { preferredValueForCard } from '../pricing/compConsensus';

export const SEEDED_LEAGUE_PVP_DISCLOSURE =
  'Seeded/heuristic league desk vs your collection mark · not a live feed or valuation model';

export type PerformanceVsPriceSource = 'mlb_stats_plus_mark' | 'seeded_league_stats_plus_mark';

export interface PerformanceVsPricePoint {
  player: string;
  cardId: string;
  price: number;
  performance: number;
  ops?: string;
  avg?: string;
  homeRuns?: string | number;
  source: PerformanceVsPriceSource;
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

export function namesMatch(cardPlayer: string, statName: string): boolean {
  const a = cardPlayer.trim().toLowerCase();
  const b = statName.trim().toLowerCase();
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
}

export function leagueToHubSport(league: string | undefined): LeagueSport | null {
  const key = (league || '').trim().toUpperCase();
  if (key === 'NBA') return 'nba';
  if (key === 'NFL') return 'nfl';
  if (key === 'NHL') return 'nhl';
  return null;
}

function cardMatchesSport(card: CardInventory, sport: LeagueSport): boolean {
  const league = (card.league || '').toUpperCase();
  const game = (card.sport || '').toLowerCase();
  if (sport === 'nba') return league === 'NBA' || game === 'basketball';
  if (sport === 'nfl') return league === 'NFL' || game === 'football';
  if (sport === 'nhl') return league === 'NHL' || game === 'hockey';
  return false;
}

/**
 * Map a seeded leader row to a 0–100 score. Efficiency is preferred;
 * otherwise the primary counting stat is scaled per sport.
 */
export function normalizeLeagueLeaderToScore(leader: LeagueStatLeader, sport: LeagueSport): number {
  if (typeof leader.efficiency === 'number' && Number.isFinite(leader.efficiency)) {
    if (sport === 'nba') {
      return Math.round(Math.min(100, Math.max(0, ((leader.efficiency - 10) / 25) * 75 + 20)));
    }
    if (sport === 'nfl') {
      const scaled = leader.efficiency > 20 ? ((leader.efficiency - 70) / 40) * 75 + 20 : ((leader.efficiency - 3) / 12) * 75 + 20;
      return Math.round(Math.min(100, Math.max(0, scaled)));
    }
    return Math.round(Math.min(100, Math.max(0, (leader.efficiency / 2) * 80 + 15)));
  }
  const value = Number.isFinite(leader.statValue) ? leader.statValue : 0;
  if (sport === 'nba') return Math.round(Math.min(100, Math.max(0, (value / 40) * 90)));
  if (sport === 'nfl') return Math.round(Math.min(100, Math.max(0, (value / 4500) * 90)));
  return Math.round(Math.min(100, Math.max(0, (value / 120) * 90)));
}

export function buildLeaguePerformanceVsPriceSeries(
  cards: CardInventory[],
  leaders: LeagueStatLeader[],
  sport: LeagueSport,
): PerformanceVsPricePoint[] {
  const points: PerformanceVsPricePoint[] = [];
  const seen = new Set<string>();

  for (const card of cards) {
    if (card.status === 'sold') continue;
    if (!cardMatchesSport(card, sport)) continue;
    const match = leaders.find((row) => namesMatch(card.player, row.player));
    if (!match) continue;
    if (seen.has(card.id)) continue;
    const price = preferredValueForCard(card) || card.currentValue || card.purchasePrice || 0;
    if (price <= 0) continue;
    seen.add(card.id);
    points.push({
      player: match.player || card.player,
      cardId: card.id,
      price,
      performance: normalizeLeagueLeaderToScore(match, sport),
      source: 'seeded_league_stats_plus_mark',
    });
  }

  return points.sort((a, b) => b.price - a.price).slice(0, 8);
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
