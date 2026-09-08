import { describe, expect, it } from 'vitest';
import {
  buildLeaguePerformanceVsPriceSeries,
  buildPerformanceVsPriceSeries,
  leagueToHubSport,
  namesMatch,
  normalizeHittingToScore,
  normalizeLeagueLeaderToScore,
} from '../../lib/analytics/performanceVsPrice';
import type { LeagueStatLeader } from '../../lib/social/leagueHubService';
import type { CardInventory } from '../../types';
import type { PlayerPerformance } from '../../lib/utils/statsService';

const troutCard: CardInventory = {
  id: 'trout-1',
  player: 'Mike Trout',
  year: 2011,
  manufacturer: 'Topps',
  cardNumber: '1',
  set: 'Update',
  sport: 'Baseball',
  league: 'MLB',
  isAutographed: false,
  condition: 'Mint',
  isGraded: false,
  purchasePrice: 5000,
  purchaseDate: '2020-01-01',
  currentValue: 8500,
  status: 'active',
};

const troutPerf: PlayerPerformance = {
  id: 1,
  fullName: 'Mike Trout',
  primaryNumber: '27',
  stats: [
    { label: 'AVG', value: '.300', change: '+0.01' },
    { label: 'HR', value: 30, change: '+2' },
    { label: 'OPS', value: '.950', change: '+0.02' },
  ],
};

describe('performanceVsPrice', () => {
  it('normalizes OPS-heavy hitting lines into a 0-100 score', () => {
    const score = normalizeHittingToScore(troutPerf.stats);
    expect(score.score).toBeGreaterThan(40);
    expect(score.score).toBeLessThanOrEqual(100);
    expect(score.ops).toBe('.950');
  });

  it('returns 0 when stats are missing', () => {
    expect(normalizeHittingToScore(undefined).score).toBe(0);
  });

  it('binds matching MLB holdings to stats rows', () => {
    const series = buildPerformanceVsPriceSeries([troutCard], [troutPerf]);
    expect(series).toHaveLength(1);
    expect(series[0].player).toBe('Mike Trout');
    expect(series[0].price).toBe(8500);
    expect(series[0].source).toBe('mlb_stats_plus_mark');
  });

  it('skips sold cards and non-matches', () => {
    const sold = { ...troutCard, id: 'sold', status: 'sold' as const };
    const nba: CardInventory = { ...troutCard, id: 'nba', player: 'Wemby', sport: 'Basketball', league: 'NBA' };
    expect(buildPerformanceVsPriceSeries([sold, nba], [troutPerf])).toEqual([]);
  });

  it('maps league tabs to hub sports and scores seeded leaders', () => {
    expect(leagueToHubSport('NBA')).toBe('nba');
    expect(leagueToHubSport('NFL')).toBe('nfl');
    expect(leagueToHubSport('NHL')).toBe('nhl');
    expect(leagueToHubSport('MLB')).toBeNull();

    const nba: LeagueStatLeader = {
      rank: 1,
      player: 'Luka Doncic',
      team: 'DAL',
      position: 'PG',
      statCategory: 'PPG',
      statValue: 33,
      statLabel: 'PPG',
      gamesPlayed: 50,
      cardValue: 600,
      cardChange: 1,
      efficiency: 31,
    };
    expect(normalizeLeagueLeaderToScore(nba, 'nba')).toBeGreaterThan(40);
    expect(normalizeLeagueLeaderToScore({ ...nba, efficiency: undefined, statValue: 30 }, 'nba')).toBeGreaterThan(0);
    expect(normalizeLeagueLeaderToScore({ ...nba, efficiency: 90 }, 'nfl')).toBeGreaterThan(40);
    expect(normalizeLeagueLeaderToScore({ ...nba, efficiency: 5 }, 'nfl')).toBeGreaterThan(0);
    expect(normalizeLeagueLeaderToScore({ ...nba, efficiency: 1.5 }, 'nhl')).toBeGreaterThan(0);
    expect(normalizeLeagueLeaderToScore({ ...nba, efficiency: undefined, statValue: 4000 }, 'nfl')).toBeGreaterThan(0);
    expect(normalizeLeagueLeaderToScore({ ...nba, efficiency: undefined, statValue: 90 }, 'nhl')).toBeGreaterThan(0);
  });

  it('binds NBA holdings to seeded leaders and skips mismatches', () => {
    const luka: CardInventory = {
      ...troutCard,
      id: 'luka-1',
      player: 'Luka Doncic',
      sport: 'Basketball',
      league: 'NBA',
      currentValue: 1200,
    };
    const leaders: LeagueStatLeader[] = [
      {
        rank: 1,
        player: 'Luka Doncic',
        team: 'DAL',
        position: 'PG',
        statCategory: 'PPG',
        statValue: 33,
        statLabel: 'PPG',
        gamesPlayed: 50,
        cardValue: 600,
        cardChange: 1,
        efficiency: 31,
      },
    ];
    const series = buildLeaguePerformanceVsPriceSeries(
      [luka, { ...luka, id: 'sold', status: 'sold' }, troutCard],
      leaders,
      'nba',
    );
    expect(series).toHaveLength(1);
    expect(series[0].source).toBe('seeded_league_stats_plus_mark');
    expect(series[0].price).toBe(1200);
  });

  it('matches NFL/NHL holdings by sport field and skips soccer / zero marks / empties', () => {
    const leader = (player: string): LeagueStatLeader => ({
      rank: 1,
      player,
      team: 'X',
      position: 'X',
      statCategory: 'YDS',
      statValue: Number.NaN,
      statLabel: 'YDS',
      gamesPlayed: 1,
      cardValue: 1,
      cardChange: 0,
    });
    const lamar: CardInventory = {
      ...troutCard,
      id: 'lamar',
      player: 'Lamar Jackson',
      sport: 'Football',
      league: '' as CardInventory['league'],
      currentValue: 0,
      purchasePrice: 300,
    };
    const mack: CardInventory = {
      ...troutCard,
      id: 'mack',
      player: 'Nathan MacKinnon',
      sport: 'Hockey',
      league: '' as CardInventory['league'],
      currentValue: 900,
    };
    const zero: CardInventory = {
      ...lamar,
      id: 'zero',
      player: 'Lamar Jackson',
      currentValue: 0,
      purchasePrice: 0,
    };
    const nfl = buildLeaguePerformanceVsPriceSeries(
      [lamar, zero, lamar],
      [leader('Lamar Jackson')],
      'nfl',
    );
    expect(nfl).toHaveLength(1);
    expect(nfl[0].price).toBe(300);
    const nhl = buildLeaguePerformanceVsPriceSeries([mack], [leader('Nathan MacKinnon')], 'nhl');
    expect(nhl).toHaveLength(1);
    expect(buildLeaguePerformanceVsPriceSeries([mack], [leader('Nathan MacKinnon')], 'soccer')).toEqual([]);
    expect(namesMatch('', 'x')).toBe(false);
    expect(normalizeLeagueLeaderToScore(leader('x'), 'nba')).toBe(0);
  });

  it('skips MLB rows with no mark', () => {
    const broke = { ...troutCard, currentValue: 0, purchasePrice: 0 };
    expect(buildPerformanceVsPriceSeries([broke], [troutPerf])).toEqual([]);
    expect(normalizeHittingToScore([{ label: 'OPS', value: 'bad', change: '0' }]).score).toBeGreaterThanOrEqual(0);
  });
});
