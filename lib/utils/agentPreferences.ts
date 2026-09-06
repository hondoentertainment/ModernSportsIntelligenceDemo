/**
 * User-defined agent priorities (Phase 19).
 * Persisted via syncStore — demo-safe, no cloud required.
 */
import { store } from '../dal/syncStore';

export const AGENT_PREFERENCES_KEY = 'msi_agent_user_preferences';

export type AgentTimeHorizon = 'short' | 'medium' | 'long';
export type AgentLeagueStyle = 'balanced' | 'mlb-first' | 'nba-first' | 'nfl-first';

export interface AgentUserPreferences {
  /** 0 = conservative, 100 = aggressive. */
  riskTolerance: number;
  timeHorizon: AgentTimeHorizon;
  leagueStyle: AgentLeagueStyle;
  /** Soft cap for a single position as % of NAV (UI + prompt; not a hard broker limit). */
  maxPositionPct: number;
}

export const DEFAULT_AGENT_PREFERENCES: AgentUserPreferences = {
  riskTolerance: 50,
  timeHorizon: 'medium',
  leagueStyle: 'balanced',
  maxPositionPct: 15,
};

const LEAGUE_STYLES: readonly AgentLeagueStyle[] = ['balanced', 'mlb-first', 'nba-first', 'nfl-first'];
const HORIZONS: readonly AgentTimeHorizon[] = ['short', 'medium', 'long'];

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

export function normalizeAgentPreferences(raw: unknown): AgentUserPreferences {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_AGENT_PREFERENCES };
  const o = raw as Partial<AgentUserPreferences>;
  const timeHorizon = HORIZONS.includes(o.timeHorizon as AgentTimeHorizon)
    ? (o.timeHorizon as AgentTimeHorizon)
    : DEFAULT_AGENT_PREFERENCES.timeHorizon;
  const leagueStyle = LEAGUE_STYLES.includes(o.leagueStyle as AgentLeagueStyle)
    ? (o.leagueStyle as AgentLeagueStyle)
    : DEFAULT_AGENT_PREFERENCES.leagueStyle;
  return {
    riskTolerance: clamp(Number(o.riskTolerance), 0, 100),
    timeHorizon,
    leagueStyle,
    maxPositionPct: clamp(Number(o.maxPositionPct), 5, 40),
  };
}

export function getAgentPreferences(): AgentUserPreferences {
  return normalizeAgentPreferences(store.get<unknown>(AGENT_PREFERENCES_KEY, DEFAULT_AGENT_PREFERENCES));
}

export function setAgentPreferences(partial: Partial<AgentUserPreferences>): AgentUserPreferences {
  const next = normalizeAgentPreferences({ ...getAgentPreferences(), ...partial });
  store.set(AGENT_PREFERENCES_KEY, next);
  return next;
}

export function riskToleranceLabel(score: number): 'conservative' | 'moderate' | 'aggressive' {
  if (score < 34) return 'conservative';
  if (score < 67) return 'moderate';
  return 'aggressive';
}

export function formatAgentPreferencesSummary(prefs: AgentUserPreferences = getAgentPreferences()): string {
  const league =
    prefs.leagueStyle === 'balanced'
      ? 'balanced leagues'
      : prefs.leagueStyle.replace('-first', '').toUpperCase() + ' tilt';
  return `${riskToleranceLabel(prefs.riskTolerance)} risk · ${prefs.timeHorizon} horizon · ${league} · max position ${prefs.maxPositionPct}%`;
}

export function formatAgentPreferencesForPrompt(prefs: AgentUserPreferences = getAgentPreferences()): string {
  return `USER AGENT PRIORITIES (honor these when weighing insights; human still approves trades):
- Risk tolerance: ${prefs.riskTolerance}/100 (${riskToleranceLabel(prefs.riskTolerance)})
- Time horizon: ${prefs.timeHorizon}
- League preference style: ${prefs.leagueStyle}
- Max single-position hint: ${prefs.maxPositionPct}% of NAV
Conservative users want smaller concentration and fewer speculative buys. Aggressive users tolerate more volatility. Short horizon favors liquidity and nearer exits; long horizon favors hold/compound. League tilt should overweight matching inventory comments, not invent live tape.`;
}

const LEAGUE_STYLE_NEEDLE: Record<Exclude<AgentLeagueStyle, 'balanced'>, string> = {
  'mlb-first': 'MLB',
  'nba-first': 'NBA',
  'nfl-first': 'NFL',
};

export function leagueMatchesPreference(league: string | undefined, style: AgentLeagueStyle): boolean {
  if (style === 'balanced' || !league) return true;
  const needle = LEAGUE_STYLE_NEEDLE[style];
  return league.toUpperCase().includes(needle);
}

export function timeHorizonSellMultiplier(horizon: AgentTimeHorizon): number {
  if (horizon === 'short') return 0.7;
  if (horizon === 'long') return 1.35;
  return 1;
}
