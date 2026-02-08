
const BASE_URL = 'https://statsapi.mlb.com/api/v1';

export async function getLiveGames() {
  const today = new Date().toISOString().split('T')[0];
  const response = await fetch(`${BASE_URL}/schedule/games/?sportId=1&date=${today}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch live games: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.dates?.[0]?.games || [];
}

export async function searchMLBPlayers(query: string) {
  if (!query) return [];
  const response = await fetch(`${BASE_URL}/people/search?names=${encodeURIComponent(query)}&activeStatus=active`);
  if (!response.ok) {
    throw new Error(`Failed to search MLB players: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.people || [];
}

export async function getPlayerStats(playerId: number, season = 2024) {
  const response = await fetch(`${BASE_URL}/people/${playerId}/stats?stats=season&group=hitting,pitching&season=${season}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch player stats: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.stats || [];
}

export async function getStandings() {
  const response = await fetch(`${BASE_URL}/standings?leagueId=103,104&season=2024&standingsTypes=regularSeason`);
  if (!response.ok) {
    throw new Error(`Failed to fetch standings: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.records || [];
}

export async function getLeagueLeaders(statGroup: 'hitting' | 'pitching', statType: string) {
  const response = await fetch(`${BASE_URL}/stats/leaders?leaderCategories=${statType}&statGroup=${statGroup}&season=2024&sportId=1`);
  if (!response.ok) {
    throw new Error(`Failed to fetch league leaders: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.leagueLeaders || [];
}

/**
 * Fetch detailed game information including probable pitchers and lineups
 */
export async function getGameDetails(gamePk: number) {
  const response = await fetch(`${BASE_URL}/game/${gamePk}/content`);
  if (!response.ok) {
    throw new Error(`Failed to fetch game details: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Fetch live play-by-play for a game
 */
export async function getPlayByPlay(gamePk: number) {
  const response = await fetch(`${BASE_URL}/game/${gamePk}/playByPlay`);
  if (!response.ok) {
    throw new Error(`Failed to fetch play-by-play: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Fetch probable pitchers for today's games
 */
export async function getProbablePitchers(date: string = new Date().toISOString().split('T')[0]) {
  const response = await fetch(`${BASE_URL}/schedule?sportId=1&date=${date}&hydrate=probablePitcher,person`);
  if (!response.ok) {
    throw new Error(`Failed to fetch probable pitchers: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.dates?.[0]?.games || [];
}

// PressBox API Integration
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
export async function getPressBoxPlayerMetrics(playerId: number): Promise<any> {
  if (!isPressBoxConfigured()) {
    console.warn('PressBox API not configured');
    return null;
  }

  try {
    const response = await fetch(`${PRESSBOX_BASE_URL}/players/${playerId}/metrics`, {
      headers: {
        'Authorization': `Bearer ${PRESSBOX_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('PressBox API error:', response.status, response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch PressBox player metrics:', error);
    return null;
  }
}

/**
 * Get prospect rankings and trends
 */
export async function getPressBoxProspectRankings(league: 'MLB' | 'MiLB' = 'MiLB'): Promise<any[]> {
  if (!isPressBoxConfigured()) {
    console.warn('PressBox API not configured');
    return [];
  }

  try {
    const response = await fetch(`${PRESSBOX_BASE_URL}/prospects/rankings?league=${league}`, {
      headers: {
        'Authorization': `Bearer ${PRESSBOX_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('PressBox API error:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    return data.rankings || [];
  } catch (error) {
    console.error('Failed to fetch PressBox prospect rankings:', error);
    return [];
  }
}

/**
 * Get player trend data (search interest)
 */
export async function getPressBoxPlayerTrend(playerId: number, days: number = 30): Promise<any> {
  if (!isPressBoxConfigured()) {
    console.warn('PressBox API not configured');
    return null;
  }

  try {
    const response = await fetch(`${PRESSBOX_BASE_URL}/players/${playerId}/trend?days=${days}`, {
      headers: {
        'Authorization': `Bearer ${PRESSBOX_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('PressBox API error:', response.status, response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch PressBox player trend:', error);
    return null;
  }
}

/**
 * Get market sentiment for a player
 */
export async function getPressBoxMarketSentiment(playerId: number): Promise<{
  sentiment: 'bullish' | 'bearish' | 'neutral';
  score: number;
  factors: string[];
}> {
  if (!isPressBoxConfigured()) {
    console.warn('PressBox API not configured');
    return null;
  }

  try {
    const response = await fetch(`${PRESSBOX_BASE_URL}/players/${playerId}/sentiment`, {
      headers: {
        'Authorization': `Bearer ${PRESSBOX_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('PressBox API error:', response.status, response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch PressBox market sentiment:', error);
    return null;
  }
}

/**
 * Get breakout probability for prospects
 */
export async function getPressBoxBreakoutProbability(playerId: number): Promise<{
  probability: number;
  factors: string[];
  timeline: string;
}> {
  if (!isPressBoxConfigured()) {
    console.warn('PressBox API not configured');
    return null;
  }

  try {
    const response = await fetch(`${PRESSBOX_BASE_URL}/players/${playerId}/breakout-probability`, {
      headers: {
        'Authorization': `Bearer ${PRESSBOX_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('PressBox API error:', response.status, response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch PressBox breakout probability:', error);
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
