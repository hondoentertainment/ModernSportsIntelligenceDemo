import { describe, expect, it } from 'vitest';
import { buildPerformanceVsPriceSeries, normalizeHittingToScore } from '../../lib/analytics/performanceVsPrice';
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
});
