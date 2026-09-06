import { describe, expect, it } from 'vitest';
import {
  LEAGUE_HUB_DATA_DISCLOSURE,
  getLeaguePlayerDesk,
  getLeagueTeamDesk,
  searchLeaguePlayers,
} from '../../lib/social/leagueHubService';

describe('league hub player/team desk', () => {
  it('builds a non-empty NBA player desk with card marks', () => {
    const players = getLeaguePlayerDesk('nba');
    expect(players.length).toBeGreaterThan(8);
    expect(players[0].cardValue).toBeGreaterThanOrEqual(players[1].cardValue);
    expect(players.some((p) => p.role === 'leader')).toBe(true);
    expect(players.some((p) => p.role === 'rookie')).toBe(true);
  });

  it('builds NFL and NHL team desks from seeded standings', () => {
    const nfl = getLeagueTeamDesk('nfl');
    const nhl = getLeagueTeamDesk('nhl');
    const nba = getLeagueTeamDesk('nba');
    expect(nfl.length).toBeGreaterThan(5);
    expect(nhl.length).toBeGreaterThan(5);
    expect(nba.some((t) => t.team.includes('Celtics'))).toBe(true);
    expect(nba.some((t) => t.team.includes('Lions'))).toBe(false);
    expect(nfl[0].cardMarketIndex).toBeGreaterThanOrEqual(nfl[nfl.length - 1].cardMarketIndex);
    expect(nhl.every((t) => t.record.includes('-'))).toBe(true);
  });

  it('filters player search without inventing rows', () => {
    const all = searchLeaguePlayers('nba', '');
    const luka = searchLeaguePlayers('nba', 'luka');
    expect(luka.length).toBeGreaterThan(0);
    expect(luka.length).toBeLessThan(all.length);
    expect(luka.every((p) => p.name.toLowerCase().includes('luka') || p.team.toLowerCase().includes('luka'))).toBe(true);
  });

  it('discloses seeded / non-live data', () => {
    expect(LEAGUE_HUB_DATA_DISCLOSURE).toMatch(/Seeded/);
    expect(LEAGUE_HUB_DATA_DISCLOSURE).toMatch(/Not a live league feed/);
  });
});
