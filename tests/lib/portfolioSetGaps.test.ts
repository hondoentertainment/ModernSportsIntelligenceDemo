import { beforeEach, describe, expect, it } from 'vitest';
import { store } from '../../lib/dal/syncStore';
import { makeCard } from '../helpers';
import {
  DEMO_SET_CHECKLISTS,
  SET_GAP_DISCLOSURE,
  SET_GOAL_KEY,
  buildPortfolioSetGaps,
  clearSetGoal,
  formatGapPercent,
  formatGapUsd,
  goalRemaining,
  readSetGoals,
  saveSetGoal,
} from '../../lib/collection/portfolioSetGaps';

beforeEach(() => {
  store.remove(SET_GOAL_KEY);
});

describe('portfolio set gaps', () => {
  it('scores only started demo checklists and ignores sold copies', () => {
    const gaps = buildPortfolioSetGaps([
      makeCard({ id: 'a', year: 2024, manufacturer: 'topps', set: 'series 1', sport: 'Baseball', cardNumber: '#1', player: 'Aaron Judge' }),
      makeCard({ id: 'dup', year: 2024, manufacturer: 'Topps', set: 'Series 1', sport: 'Baseball', cardNumber: '1', player: 'Aaron Judge' }),
      makeCard({ id: 'b', year: 2024, manufacturer: 'Topps', set: 'Series 1', sport: 'Baseball', cardNumber: '250', player: 'Paul Skenes' }),
      makeCard({ id: 'sold', year: 2024, manufacturer: 'Topps', set: 'Series 1', sport: 'Baseball', cardNumber: '15', player: 'Juan Soto', status: 'sold' }),
      makeCard({ id: 'other', year: 2024, manufacturer: 'Topps', set: 'Chrome', sport: 'Baseball', cardNumber: '1' }),
      makeCard({ id: 'hoop', year: 2023, manufacturer: 'Panini', set: 'Prizm', sport: 'Basketball', cardNumber: '89', player: 'Jayson Tatum' }),
    ]);
    expect(SET_GAP_DISCLOSURE).toMatch(/not a beckett registry/i);
    expect(DEMO_SET_CHECKLISTS).toHaveLength(2);
    const series = gaps.find((gap) => gap.id === '2024-topps-s1');
    const prizm = gaps.find((gap) => gap.id === '2023-prizm');
    expect(series).toMatchObject({ owned: 2, total: 4, percent: 50, costToCompleteUsd: 16 });
    expect(series?.missing.map((card) => card.player)).toEqual(['Juan Soto', 'Pete Alonso']);
    expect(prizm).toMatchObject({ owned: 1, total: 2, percent: 50, costToCompleteUsd: 40 });
    expect(formatGapUsd(16)).toBe('$16');
    expect(formatGapPercent(50)).toBe('50%');
    expect(formatGapPercent(33.333)).toBe('33.3%');
    expect(buildPortfolioSetGaps([])).toEqual([]);
  });

  it('stores a completion goal and reports what is left', () => {
    expect(readSetGoals()).toEqual([]);
    expect(saveSetGoal('  ', 100)).toEqual([]);
    expect(saveSetGoal('2024-topps-s1', 100)).toEqual([{ setId: '2024-topps-s1', targetPercent: 100 }]);
    expect(saveSetGoal('2024-topps-s1', 80.2)).toEqual([{ setId: '2024-topps-s1', targetPercent: 80 }]);
    store.set(SET_GOAL_KEY, [{ setId: 'ok', targetPercent: 140 }, { setId: '', targetPercent: 10 }, { nope: true }]);
    expect(readSetGoals()).toEqual([{ setId: 'ok', targetPercent: 100 }]);
    expect(goalRemaining(50, 100)).toBe(50);
    expect(goalRemaining(100, 80)).toBe(0);
    expect(clearSetGoal('ok')).toEqual([]);
    expect(readSetGoals()).toEqual([]);
  });
});
