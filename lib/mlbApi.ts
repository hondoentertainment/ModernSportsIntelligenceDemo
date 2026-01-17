
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
