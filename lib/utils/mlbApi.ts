import { logger } from '../logger';
import { showToast } from './toast.ts';

const BASE_URL = 'https://statsapi.mlb.com/api/v1';

// ─── MLB Stats API types ────────────────────────────────────────────────────

export interface MLBPlayer {
  id: number;
  fullName: string;
  primaryNumber?: string;
  currentTeam?: { id: number; name: string };
  primaryPosition?: { code: string; name: string; abbreviation: string };
}

export interface MLBHittingStat {
  avg?: string;
  homeRuns?: number;
  rbi?: number;
  ops?: string;
  hits?: number;
  atBats?: number;
  strikeOuts?: number;
  walks?: number;
  stolenBases?: number;
  obp?: string;
  slg?: string;
  [key: string]: string | number | undefined;
}

export interface MLBPitchingStat {
  era?: string;
  wins?: number;
  losses?: number;
  strikeOuts?: number;
  walks?: number;
  inningsPitched?: string;
  whip?: string;
  [key: string]: string | number | undefined;
}

export interface MLBStatSplit {
  season?: string;
  stat: MLBHittingStat | MLBPitchingStat;
  player?: Partial<MLBPlayer>;
  team?: { id: number; name: string };
}

export interface MLBStatGroup {
  type: { displayName: string };
  group: { displayName: string };
  splits: MLBStatSplit[];
}

export interface MLBGame {
  gamePk: number;
  gameDate: string;
  status: { abstractGameState: string; detailedState: string };
  teams: {
    away: { team: { id: number; name: string }; score?: number };
    home: { team: { id: number; name: string }; score?: number };
  };
  venue?: { id: number; name: string };
}

export interface MLBTeamRecord {
  team: { id: number; name: string; division?: { id: number; name: string } };
  wins: number;
  losses: number;
  winningPercentage: string;
  divisionRank?: string;
  leagueRank?: string;
  gamesBack?: string;
}

export interface MLBStandingRecord {
  standingsType: string;
  league: { id: number; name: string };
  division: { id: number; name: string };
  teamRecords: MLBTeamRecord[];
}

export interface MLBLeaderEntry {
  rank: number;
  value: string;
  person: Pick<MLBPlayer, 'id' | 'fullName'>;
  team?: { id: number; name: string };
}

export interface MLBLeagueLeader {
  leaderCategory: string;
  season: string;
  leaders: MLBLeaderEntry[];
}

// ─── PressBox API types ──────────────────────────────────────────────────────

export interface PressBoxMetrics {
  playerId: number;
  [key: string]: unknown;
}

export interface PressBoxProspectRanking {
  rank: number;
  playerId: number;
  playerName: string;
  team: string;
  position: string;
  [key: string]: unknown;
}

export interface PressBoxTrend {
  playerId: number;
  days: number;
  dataPoints: Array<{ date: string; value: number }>;
  [key: string]: unknown;
}

export interface PressBoxSentiment {
  sentiment: 'bullish' | 'bearish' | 'neutral';
  score: number;
  factors: string[];
}

export interface PressBoxBreakoutProbability {
  probability: number;
  factors: string[];
  timeline: string;
}

// ─── MLB Stats API functions ─────────────────────────────────────────────────

export async function getLiveGames(signal?: AbortSignal): Promise<MLBGame[]> {
  const today = new Date().toISOString().split('T')[0];
  const response = await fetch(`${BASE_URL}/schedule/games/?sportId=1&date=${today}`, { signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch live games: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.dates?.[0]?.games ?? [];
}

export async function searchMLBPlayers(query: string, signal?: AbortSignal): Promise<MLBPlayer[]> {
  if (!query) return [];
  const response = await fetch(
    `${BASE_URL}/people/search?names=${encodeURIComponent(query)}&activeStatus=active`,
    { signal }
  );
  if (!response.ok) {
    throw new Error(`Failed to search MLB players: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.people ?? [];
}

export async function getPlayerStats(playerId: number, season = 2024, signal?: AbortSignal): Promise<MLBStatGroup[]> {
  const response = await fetch(
    `${BASE_URL}/people/${playerId}/stats?stats=season&group=hitting,pitching&season=${season}`,
    { signal }
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch player stats: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.stats ?? [];
}

export async function getStandings(signal?: AbortSignal): Promise<MLBStandingRecord[]> {
  const response = await fetch(
    `${BASE_URL}/standings?leagueId=103,104&season=2024&standingsTypes=regularSeason`,
    { signal }
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch standings: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.records ?? [];
}

export async function getLeagueLeaders(
  statGroup: 'hitting' | 'pitching',
  statType: string,
  signal?: AbortSignal
): Promise<MLBLeagueLeader[]> {
  const response = await fetch(
    `${BASE_URL}/stats/leaders?leaderCategories=${statType}&statGroup=${statGroup}&season=2024&sportId=1`,
    { signal }
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch league leaders: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.leagueLeaders ?? [];
}

/**
 * Fetch detailed game information including probable pitchers and lineups
 */
export async function getGameDetails(gamePk: number, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(`${BASE_URL}/game/${gamePk}/content`, { signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch game details: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Fetch live play-by-play for a game
 */
export async function getPlayByPlay(gamePk: number, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(`${BASE_URL}/game/${gamePk}/playByPlay`, { signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch play-by-play: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Fetch probable pitchers for today's games
 */
export async function getProbablePitchers(
  date: string = new Date().toISOString().split('T')[0],
  signal?: AbortSignal
): Promise<MLBGame[]> {
  const response = await fetch(
    `${BASE_URL}/schedule?sportId=1&date=${date}&hydrate=probablePitcher,person`,
    { signal }
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch probable pitchers: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.dates?.[0]?.games ?? [];
}

/**
 * Get the official MLB headshot URL for a player
 * @param playerId The MLB player ID
 * @param size The size of the image (66x90, 213x320, or 426x640)
 */
export function getAthleteHeadshotUrl(playerId: number, _size: 'small' | 'medium' | 'large' = 'medium'): string {
  const _sizeMap = {
    small: '66x90',
    medium: '213x320',
    large: '426x640'
  };
  void sizeMap[size]; // size param kept for API compatibility
  return `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_426,q_auto:best/v1/people/${playerId}/headshot/67/current`;
}

// ─── PressBox API ─────────────────────────────────────────────────────────────

const PRESSBOX_BASE_URL = 'https://api.pressbox.com/v1';
const PRESSBOX_API_KEY = import.meta.env.VITE_PRESSBOX_API_KEY || '';

/**
 * Check if PressBox API is configured
 */
export function isPressBoxConfigured(): boolean {
  return !!PRESSBOX_API_KEY;
}

/**
 * Get player performance metrics for prospect analysis
 */
export async function getPressBoxPlayerMetrics(playerId: number, signal?: AbortSignal): Promise<PressBoxMetrics | null> {
  if (!isPressBoxConfigured()) {
    logger.warn('PressBox API not configured');
    return null;
  }

  try {
    const response = await fetch(`${PRESSBOX_BASE_URL}/players/${playerId}/metrics`, {
      headers: {
        'Authorization': `Bearer ${PRESSBOX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      logger.error('PressBox API error:', response.status, response.statusText);
      showToast('warning', 'PressBox player metrics unavailable.', { dedupeKey: 'pressbox_metrics' });
      return null;
    }

    return await response.json() as PressBoxMetrics;
  } catch (error) {
    logger.error('Failed to fetch PressBox player metrics:', error);
    showToast('warning', 'PressBox player metrics unavailable.', { dedupeKey: 'pressbox_metrics' });
    return null;
  }
}

/**
 * Get prospect rankings and trends
 */
export async function getPressBoxProspectRankings(league: 'MLB' | 'MiLB' = 'MiLB', signal?: AbortSignal): Promise<PressBoxProspectRanking[]> {
  if (!isPressBoxConfigured()) {
    logger.warn('PressBox API not configured');
    return [];
  }

  try {
    const response = await fetch(`${PRESSBOX_BASE_URL}/prospects/rankings?league=${league}`, {
      headers: {
        'Authorization': `Bearer ${PRESSBOX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      logger.error('PressBox API error:', response.status, response.statusText);
      showToast('warning', 'PressBox prospect rankings unavailable.', { dedupeKey: 'pressbox_rankings' });
      return [];
    }

    const data = await response.json();
    return (data.rankings as PressBoxProspectRanking[]) ?? [];
  } catch (error) {
    logger.error('Failed to fetch PressBox prospect rankings:', error);
    showToast('warning', 'PressBox prospect rankings unavailable.', { dedupeKey: 'pressbox_rankings' });
    return [];
  }
}

/**
 * Get player trend data (search interest)
 */
export async function getPressBoxPlayerTrend(playerId: number, days: number = 30, signal?: AbortSignal): Promise<PressBoxTrend | null> {
  if (!isPressBoxConfigured()) {
    logger.warn('PressBox API not configured');
    return null;
  }

  try {
    const response = await fetch(`${PRESSBOX_BASE_URL}/players/${playerId}/trend?days=${days}`, {
      headers: {
        'Authorization': `Bearer ${PRESSBOX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      logger.error('PressBox API error:', response.status, response.statusText);
      return null;
    }

    return await response.json() as PressBoxTrend;
  } catch (error) {
    logger.error('Failed to fetch PressBox player trend:', error);
    return null;
  }
}

/**
 * Get market sentiment for a player
 */
export async function getPressBoxMarketSentiment(playerId: number, signal?: AbortSignal): Promise<PressBoxSentiment | null> {
  if (!isPressBoxConfigured()) {
    logger.warn('PressBox API not configured');
    return null;
  }

  try {
    const response = await fetch(`${PRESSBOX_BASE_URL}/players/${playerId}/sentiment`, {
      headers: {
        'Authorization': `Bearer ${PRESSBOX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      logger.error('PressBox API error:', response.status, response.statusText);
      return null;
    }

    return await response.json() as PressBoxSentiment;
  } catch (error) {
    logger.error('Failed to fetch PressBox market sentiment:', error);
    return null;
  }
}

/**
 * Get breakout probability for prospects
 */
export async function getPressBoxBreakoutProbability(playerId: number, signal?: AbortSignal): Promise<PressBoxBreakoutProbability | null> {
  if (!isPressBoxConfigured()) {
    logger.warn('PressBox API not configured');
    return null;
  }

  try {
    const response = await fetch(`${PRESSBOX_BASE_URL}/players/${playerId}/breakout-probability`, {
      headers: {
        'Authorization': `Bearer ${PRESSBOX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      logger.error('PressBox API error:', response.status, response.statusText);
      return null;
    }

    return await response.json() as PressBoxBreakoutProbability;
  } catch (error) {
    logger.error('Failed to fetch PressBox breakout probability:', error);
    return null;
  }
}

/**
 * Get comprehensive player data from both MLB Stats API and PressBox
 */
export async function getComprehensivePlayerData(playerId: number) {
  const [stats, pressbox] = await Promise.all([
    getPlayerStats(playerId),
    getPressBoxPlayerMetrics(playerId),
  ]);

  return {
    stats: stats,
    pressbox: {
      metrics: pressbox,
      trend: await getPressBoxPlayerTrend(playerId),
      sentiment: await getPressBoxMarketSentiment(playerId),
      breakout: await getPressBoxBreakoutProbability(playerId),
    },
  };
}
