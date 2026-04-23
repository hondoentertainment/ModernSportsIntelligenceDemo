// @ts-nocheck
/**
 * Sports Data Adapter — ESPN, MLB Stats API, and Sports Reference.
 *
 * When USE_REAL_SPORTS is enabled, proxies to backend APIs.
 * Otherwise returns realistic mock data for development.
 */

import { serverApiRequest } from '../serverApi';
import { isFeatureEnabled } from '../featureFlags';
import { withRetry } from '../apiResilience';
import { apiCache, CACHE_TTL } from '../apiCache';
import { logger } from '../logger';
import type { Sport, PlayerProfile, GameEvent, PlayerStatsSummary } from '../types/player';

// ─── Mock Data ────────────────────────────────────────────────────

const MOCK_PLAYERS: Record<string, Partial<PlayerProfile>> = {
  'mike-trout': {
    id: 'mlb-545361', name: 'Mike Trout', firstName: 'Mike', lastName: 'Trout',
    sport: 'baseball', league: 'MLB', team: 'Los Angeles Angels', position: 'CF',
    number: '27', isRookie: false, isActive: true, experience: 13,
    externalIds: { mlbId: 545361, espnId: 30836 },
  },
  'shohei-ohtani': {
    id: 'mlb-660271', name: 'Shohei Ohtani', firstName: 'Shohei', lastName: 'Ohtani',
    sport: 'baseball', league: 'MLB', team: 'Los Angeles Dodgers', position: 'DH',
    number: '17', isRookie: false, isActive: true, experience: 7,
    externalIds: { mlbId: 660271, espnId: 39832 },
  },
  'lebron-james': {
    id: 'nba-2544', name: 'LeBron James', firstName: 'LeBron', lastName: 'James',
    sport: 'basketball', league: 'NBA', team: 'Los Angeles Lakers', position: 'SF',
    number: '23', isRookie: false, isActive: true, experience: 22,
    externalIds: { espnId: 1966 },
  },
  'patrick-mahomes': {
    id: 'nfl-3139477', name: 'Patrick Mahomes', firstName: 'Patrick', lastName: 'Mahomes',
    sport: 'football', league: 'NFL', team: 'Kansas City Chiefs', position: 'QB',
    number: '15', isRookie: false, isActive: true, experience: 8,
    externalIds: { espnId: 3139477 },
  },
  'connor-mcdavid': {
    id: 'nhl-8478402', name: 'Connor McDavid', firstName: 'Connor', lastName: 'McDavid',
    sport: 'hockey', league: 'NHL', team: 'Edmonton Oilers', position: 'C',
    number: '97', isRookie: false, isActive: true, experience: 10,
    externalIds: { espnId: 3895074 },
  },
};

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function mockPlayerProfile(name: string): PlayerProfile {
  const slug = slugify(name);
  const known = MOCK_PLAYERS[slug];

  if (known) {
    return {
      birthDate: '1990-01-01',
      imageUrl: undefined,
      ...known,
    } as PlayerProfile;
  }

  // Generate deterministic mock for unknown players
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const sports: Sport[] = ['baseball', 'basketball', 'football', 'hockey'];
  const sport = sports[hash % sports.length];
  const leagues: Record<Sport, string> = {
    baseball: 'MLB', basketball: 'NBA', football: 'NFL', hockey: 'NHL', soccer: 'MLS',
  };

  const parts = name.split(' ');
  return {
    id: `generated-${hash}`,
    name,
    firstName: parts[0] || name,
    lastName: parts.slice(1).join(' ') || '',
    sport,
    league: leagues[sport],
    team: 'Unknown Team',
    position: 'Unknown',
    isRookie: false,
    isActive: true,
    experience: 1 + (hash % 15),
    externalIds: {},
  };
}

function mockPlayerStats(playerId: string, season: string): PlayerStatsSummary {
  const hash = (playerId + season).split('').reduce((a, c) => a + c.charCodeAt(0), 0);

  return {
    playerId,
    season,
    gamesPlayed: 80 + (hash % 82),
    stats: {
      avg: '.285',
      hr: 25 + (hash % 30),
      rbi: 70 + (hash % 60),
      ops: '.890',
    },
    performanceRating: 50 + (hash % 50),
    trending: hash % 3 === 0 ? 'up' : hash % 3 === 1 ? 'down' : 'stable',
  };
}

function mockRecentEvents(playerName: string, sport: Sport): GameEvent[] {
  const hash = playerName.split('').reduce((a, c) => a + c.charCodeAt(0), 0);

  const eventTypes: GameEvent['type'][] = ['milestone', 'award', 'trade', 'record'];
  const headlines: Record<string, string[]> = {
    baseball: ['Hits 30th home run of season', 'Named to All-Star team', 'Records 200th strikeout'],
    basketball: ['Scores 40+ points', 'Triple-double performance', 'Named Player of the Week'],
    football: ['Throws 4 TD passes', 'Named to Pro Bowl', 'Sets franchise record'],
    hockey: ['Hat trick performance', 'Named First Star', 'Records 50th assist'],
    soccer: ['Scores brace in win', 'Named to Best XI', 'Records 10th assist'],
  };

  const sportHeadlines = headlines[sport] || headlines.baseball;

  return Array.from({ length: 3 }, (_, i) => ({
    id: `evt-${hash}-${i}`,
    type: eventTypes[(hash + i) % eventTypes.length],
    playerId: `player-${hash}`,
    playerName,
    sport,
    headline: sportHeadlines[(hash + i) % sportHeadlines.length],
    description: `${playerName} ${sportHeadlines[(hash + i) % sportHeadlines.length].toLowerCase()} in recent action.`,
    impactScore: 40 + ((hash + i * 17) % 60),
    priceImpactPercent: Math.round((((hash + i * 7) % 200) - 50) / 10),
    timestamp: new Date(Date.now() - i * 86400000 * (1 + (hash % 5))).toISOString(),
    source: 'espn',
  }));
}

// ─── Real API Calls ───────────────────────────────────────────────

async function realPlayerSearch(name: string): Promise<PlayerProfile> {
  return withRetry(
    () => serverApiRequest<PlayerProfile>('/api/sports/player/search', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
    { maxAttempts: 2, timeoutMs: 10000 }
  );
}

async function realPlayerStats(playerId: string, season: string): Promise<PlayerStatsSummary> {
  return withRetry(
    () => serverApiRequest<PlayerStatsSummary>('/api/sports/player/stats', {
      method: 'POST',
      body: JSON.stringify({ playerId, season }),
    }),
    { maxAttempts: 2, timeoutMs: 10000 }
  );
}

async function realRecentEvents(playerName: string, sport: Sport): Promise<GameEvent[]> {
  return withRetry(
    () => serverApiRequest<GameEvent[]>('/api/sports/events', {
      method: 'POST',
      body: JSON.stringify({ playerName, sport }),
    }),
    { maxAttempts: 2, timeoutMs: 10000 }
  );
}

// ─── Public API ───────────────────────────────────────────────────

export const sportsDataAdapter = {
  /** Look up a player profile by name */
  async getPlayer(name: string): Promise<PlayerProfile> {
    const cacheKey = `sports:player:${slugify(name)}`;

    return apiCache.getOrFetch(cacheKey, async () => {
      if (isFeatureEnabled('USE_REAL_SPORTS')) {
        try {
          return await realPlayerSearch(name);
        } catch (err) {
          logger.warn('[Sports] Player search failed, falling back to mock', err);
          return mockPlayerProfile(name);
        }
      }
      return mockPlayerProfile(name);
    }, CACHE_TTL.PLAYER_PROFILE);
  },

  /** Get player season stats */
  async getStats(playerId: string, season?: string): Promise<PlayerStatsSummary> {
    const effectiveSeason = season || new Date().getFullYear().toString();
    const cacheKey = `sports:stats:${playerId}:${effectiveSeason}`;

    return apiCache.getOrFetch(cacheKey, async () => {
      if (isFeatureEnabled('USE_REAL_SPORTS')) {
        try {
          return await realPlayerStats(playerId, effectiveSeason);
        } catch (err) {
          logger.warn('[Sports] Stats API failed, falling back to mock', err);
          return mockPlayerStats(playerId, effectiveSeason);
        }
      }
      return mockPlayerStats(playerId, effectiveSeason);
    }, CACHE_TTL.PLAYER_PROFILE);
  },

  /** Get recent events that could impact card prices */
  async getRecentEvents(playerName: string, sport: Sport): Promise<GameEvent[]> {
    const cacheKey = `sports:events:${slugify(playerName)}:${sport}`;

    return apiCache.getOrFetch(cacheKey, async () => {
      if (isFeatureEnabled('USE_REAL_SPORTS')) {
        try {
          return await realRecentEvents(playerName, sport);
        } catch (err) {
          logger.warn('[Sports] Events API failed, falling back to mock', err);
          return mockRecentEvents(playerName, sport);
        }
      }
      return mockRecentEvents(playerName, sport);
    }, CACHE_TTL.PRICE_REALTIME); // Short TTL for event data
  },

  /** Calculate price impact from recent events for a player */
  async getPriceImpact(playerName: string, sport: Sport): Promise<{
    totalImpactPercent: number;
    events: GameEvent[];
    recommendation: 'buy' | 'sell' | 'hold';
  }> {
    const events = await this.getRecentEvents(playerName, sport);
    const totalImpact = events.reduce((sum, e) => sum + e.priceImpactPercent, 0);

    return {
      totalImpactPercent: Math.round(totalImpact * 100) / 100,
      events,
      recommendation: totalImpact > 5 ? 'buy' : totalImpact < -5 ? 'sell' : 'hold',
    };
  },

  /** Check if real sports data API is active */
  isLive(): boolean {
    return isFeatureEnabled('USE_REAL_SPORTS');
  },
};
