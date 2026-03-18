import { describe, it, expect, beforeEach } from 'vitest';
import { setupLocalStorageMock } from '../helpers';
import {
  getCardTimelines,
  getTimeline,
  runBacktest,
  getStrategies,
  getBacktestResults,
  createWhatIf,
  getWhatIfScenarios,
  getReplayStats,
  getTopPerformers,
  getWorstPerformers,
  calculateReturn,
  formatCurrency,
  formatPercent,
  getReturnColor,
  getStrategyColor,
  CardTimeline,
  BacktestStrategy,
  BacktestResult,
  WhatIfScenario,
  ReplayStats,
  PriceDataPoint,
} from '../../lib/analytics/marketReplayService';

describe('marketReplayService', () => {
  beforeEach(() => {
    setupLocalStorageMock();
  });

  // ---- formatCurrency ----
  describe('formatCurrency', () => {
    it('formats positive numbers with dollar sign and two decimals', () => {
      expect(formatCurrency(1234.5)).toBe('$1,234.50');
    });

    it('formats zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('formats negative numbers', () => {
      const result = formatCurrency(-50.1);
      expect(result).toContain('50.10');
    });
  });

  // ---- formatPercent ----
  describe('formatPercent', () => {
    it('formats positive percentages with + prefix', () => {
      expect(formatPercent(12.345)).toBe('+12.35%');
    });

    it('formats negative percentages with - prefix', () => {
      expect(formatPercent(-5.6)).toBe('-5.60%');
    });

    it('formats zero as +0.00%', () => {
      expect(formatPercent(0)).toBe('+0.00%');
    });
  });

  // ---- calculateReturn ----
  describe('calculateReturn', () => {
    it('calculates positive return correctly', () => {
      expect(calculateReturn(100, 150)).toBe(50);
    });

    it('calculates negative return correctly', () => {
      expect(calculateReturn(100, 80)).toBe(-20);
    });

    it('returns 0 when buy price is 0', () => {
      expect(calculateReturn(0, 100)).toBe(0);
    });

    it('returns 0 for same buy and sell', () => {
      expect(calculateReturn(100, 100)).toBe(0);
    });
  });

  // ---- getReturnColor ----
  describe('getReturnColor', () => {
    it('returns green-400 for returns above 20', () => {
      expect(getReturnColor(25)).toBe('text-green-400');
    });

    it('returns green-300 for returns between 0 and 20', () => {
      expect(getReturnColor(10)).toBe('text-green-300');
    });

    it('returns slate-400 for zero return', () => {
      expect(getReturnColor(0)).toBe('text-slate-400');
    });

    it('returns red-300 for returns between -20 and 0', () => {
      expect(getReturnColor(-10)).toBe('text-red-300');
    });

    it('returns red-400 for returns below -20', () => {
      expect(getReturnColor(-25)).toBe('text-red-400');
    });
  });

  // ---- getStrategyColor ----
  describe('getStrategyColor', () => {
    it('returns blue for buy_dip', () => {
      expect(getStrategyColor('buy_dip')).toBe('text-blue-400');
    });

    it('returns purple for momentum', () => {
      expect(getStrategyColor('momentum')).toBe('text-purple-400');
    });

    it('returns yellow for mean_reversion', () => {
      expect(getStrategyColor('mean_reversion')).toBe('text-yellow-400');
    });

    it('returns green for hold', () => {
      expect(getStrategyColor('hold')).toBe('text-green-400');
    });

    it('returns orange for seasonal', () => {
      expect(getStrategyColor('seasonal')).toBe('text-orange-400');
    });
  });

  // ---- getCardTimelines ----
  describe('getCardTimelines', () => {
    it('returns an array of timelines', () => {
      const timelines = getCardTimelines();
      expect(Array.isArray(timelines)).toBe(true);
      expect(timelines.length).toBeGreaterThanOrEqual(10);
    });

    it('each timeline has required fields', () => {
      const timelines = getCardTimelines();
      for (const t of timelines) {
        expect(t).toHaveProperty('id');
        expect(t).toHaveProperty('cardName');
        expect(t).toHaveProperty('player');
        expect(t).toHaveProperty('sport');
        expect(t).toHaveProperty('year');
        expect(t).toHaveProperty('set');
        expect(t).toHaveProperty('priceHistory');
        expect(t).toHaveProperty('currentPrice');
        expect(t).toHaveProperty('allTimeHigh');
        expect(t).toHaveProperty('allTimeLow');
        expect(t).toHaveProperty('peakDate');
        expect(t).toHaveProperty('troughDate');
      }
    });

    it('price history contains valid data points', () => {
      const timelines = getCardTimelines();
      const t = timelines[0];
      expect(t.priceHistory.length).toBeGreaterThan(0);
      for (const p of t.priceHistory) {
        expect(typeof p.date).toBe('string');
        expect(typeof p.price).toBe('number');
        expect(typeof p.volume).toBe('number');
      }
    });

    it('allTimeHigh >= allTimeLow for every timeline', () => {
      const timelines = getCardTimelines();
      for (const t of timelines) {
        expect(t.allTimeHigh).toBeGreaterThanOrEqual(t.allTimeLow);
      }
    });
  });

  // ---- getTimeline ----
  describe('getTimeline', () => {
    it('returns a specific timeline by id', () => {
      const timelines = getCardTimelines();
      const t = getTimeline(timelines[0].id);
      expect(t).toBeDefined();
      expect(t!.id).toBe(timelines[0].id);
    });

    it('returns undefined for unknown id', () => {
      expect(getTimeline('nonexistent')).toBeUndefined();
    });
  });

  // ---- getStrategies ----
  describe('getStrategies', () => {
    it('returns an array of strategies', () => {
      const strategies = getStrategies();
      expect(Array.isArray(strategies)).toBe(true);
      expect(strategies.length).toBeGreaterThanOrEqual(5);
    });

    it('each strategy has required fields', () => {
      const strategies = getStrategies();
      for (const s of strategies) {
        expect(s).toHaveProperty('id');
        expect(s).toHaveProperty('name');
        expect(s).toHaveProperty('description');
        expect(s).toHaveProperty('type');
        expect(s).toHaveProperty('params');
        expect(['buy_dip', 'momentum', 'mean_reversion', 'hold', 'seasonal']).toContain(s.type);
      }
    });
  });

  // ---- runBacktest ----
  describe('runBacktest', () => {
    it('returns a BacktestResult for valid strategy and card', () => {
      const strategies = getStrategies();
      const timelines = getCardTimelines();
      const result = runBacktest(strategies[0].id, timelines[0].id);
      expect(result).not.toBeNull();
      expect(result!.strategyId).toBe(strategies[0].id);
      expect(result!.cardId).toBe(timelines[0].id);
    });

    it('returns null for unknown strategy', () => {
      const timelines = getCardTimelines();
      expect(runBacktest('bad-strat', timelines[0].id)).toBeNull();
    });

    it('returns null for unknown card', () => {
      const strategies = getStrategies();
      expect(runBacktest(strategies[0].id, 'bad-card')).toBeNull();
    });

    it('result contains expected numeric fields', () => {
      const strategies = getStrategies();
      const timelines = getCardTimelines();
      const result = runBacktest(strategies[0].id, timelines[0].id)!;
      expect(typeof result.initialInvestment).toBe('number');
      expect(typeof result.finalValue).toBe('number');
      expect(typeof result.totalReturn).toBe('number');
      expect(typeof result.annualizedReturn).toBe('number');
      expect(typeof result.maxDrawdown).toBe('number');
      expect(typeof result.winRate).toBe('number');
      expect(typeof result.sharpeRatio).toBe('number');
    });

    it('result has trades array', () => {
      const strategies = getStrategies();
      const timelines = getCardTimelines();
      const result = runBacktest(strategies[0].id, timelines[0].id)!;
      expect(Array.isArray(result.trades)).toBe(true);
      for (const t of result.trades) {
        expect(['buy', 'sell']).toContain(t.action);
        expect(typeof t.price).toBe('number');
        expect(typeof t.quantity).toBe('number');
      }
    });

    it('hold strategy produces exactly 2 trades (buy + sell)', () => {
      const holdStrategy = getStrategies().find(s => s.type === 'hold')!;
      const timelines = getCardTimelines();
      const result = runBacktest(holdStrategy.id, timelines[0].id)!;
      expect(result.trades.length).toBe(2);
      expect(result.trades[0].action).toBe('buy');
      expect(result.trades[1].action).toBe('sell');
    });

    it('persists result to storage', () => {
      const strategies = getStrategies();
      const timelines = getCardTimelines();
      runBacktest(strategies[0].id, timelines[0].id);
      const results = getBacktestResults();
      expect(results.length).toBe(1);
    });

    it('accepts param overrides', () => {
      const holdStrategy = getStrategies().find(s => s.type === 'hold')!;
      const timelines = getCardTimelines();
      const result = runBacktest(holdStrategy.id, timelines[0].id, { holdMonths: 6 });
      expect(result).not.toBeNull();
    });

    it('seasonal strategy generates trades on correct months', () => {
      const seasonalStrategy = getStrategies().find(s => s.type === 'seasonal')!;
      const timelines = getCardTimelines();
      const result = runBacktest(seasonalStrategy.id, timelines[0].id, { buyMonth: 3, sellMonth: 11 })!;
      const buyTrades = result.trades.filter(t => t.action === 'buy');
      const sellTrades = result.trades.filter(t => t.action === 'sell');
      for (const bt of buyTrades) {
        const month = parseInt(bt.date.split('-')[1], 10);
        expect(month).toBe(3);
      }
      // sell trades are on sellMonth OR the final liquidation
      for (const st of sellTrades.slice(0, -1)) {
        const month = parseInt(st.date.split('-')[1], 10);
        expect(month).toBe(11);
      }
    });
  });

  // ---- getBacktestResults ----
  describe('getBacktestResults', () => {
    it('returns empty array initially', () => {
      expect(getBacktestResults()).toEqual([]);
    });

    it('accumulates results from multiple backtests', () => {
      const strategies = getStrategies();
      const timelines = getCardTimelines();
      runBacktest(strategies[0].id, timelines[0].id);
      runBacktest(strategies[1].id, timelines[1].id);
      expect(getBacktestResults().length).toBe(2);
    });
  });

  // ---- createWhatIf / getWhatIfScenarios ----
  describe('createWhatIf', () => {
    it('creates a what-if scenario with calculated fields', () => {
      const result = createWhatIf({
        name: 'Test scenario',
        cardId: 'ct-001',
        purchaseDate: '2020-01-01',
        purchasePrice: 100,
        sellDate: '2023-01-01',
        sellPrice: 200,
        fees: 10,
      });
      expect(result.id).toBeTruthy();
      expect(result.holdingPeriod).toBeGreaterThan(0);
      expect(result.actualReturn).toBeGreaterThan(0);
    });

    it('persists scenario to storage', () => {
      createWhatIf({
        name: 'Test',
        cardId: 'ct-001',
        purchaseDate: '2020-01-01',
        purchasePrice: 100,
        sellDate: '2023-01-01',
        sellPrice: 200,
        fees: 0,
      });
      const scenarios = getWhatIfScenarios();
      expect(scenarios.length).toBe(1);
      expect(scenarios[0].name).toBe('Test');
    });

    it('calculates negative return when sell < buy + fees', () => {
      const result = createWhatIf({
        name: 'Loss',
        cardId: 'ct-001',
        purchaseDate: '2020-01-01',
        purchasePrice: 200,
        sellDate: '2021-01-01',
        sellPrice: 100,
        fees: 10,
      });
      expect(result.actualReturn).toBeLessThan(0);
    });
  });

  // ---- getWhatIfScenarios ----
  describe('getWhatIfScenarios', () => {
    it('returns empty array initially', () => {
      expect(getWhatIfScenarios()).toEqual([]);
    });
  });

  // ---- getReplayStats ----
  describe('getReplayStats', () => {
    it('returns stats with correct structure', () => {
      const stats = getReplayStats();
      expect(typeof stats.totalCardsTracked).toBe('number');
      expect(typeof stats.avgAnnualReturn).toBe('number');
      expect(typeof stats.bestPerformer).toBe('string');
      expect(typeof stats.worstPerformer).toBe('string');
      expect(typeof stats.totalBacktests).toBe('number');
    });

    it('totalCardsTracked matches timelines count', () => {
      const stats = getReplayStats();
      const timelines = getCardTimelines();
      expect(stats.totalCardsTracked).toBe(timelines.length);
    });

    it('totalBacktests increments after running backtests', () => {
      expect(getReplayStats().totalBacktests).toBe(0);
      const strategies = getStrategies();
      const timelines = getCardTimelines();
      runBacktest(strategies[0].id, timelines[0].id);
      expect(getReplayStats().totalBacktests).toBe(1);
    });
  });

  // ---- getTopPerformers / getWorstPerformers ----
  describe('getTopPerformers', () => {
    it('returns timelines sorted by return descending', () => {
      const top = getTopPerformers('all');
      expect(top.length).toBeGreaterThan(0);
      // Verify sorted descending by full-period return
      for (let i = 1; i < top.length; i++) {
        const prevRet = calculateReturn(top[i - 1].priceHistory[0].price, top[i - 1].priceHistory[top[i - 1].priceHistory.length - 1].price);
        const currRet = calculateReturn(top[i].priceHistory[0].price, top[i].priceHistory[top[i].priceHistory.length - 1].price);
        expect(prevRet).toBeGreaterThanOrEqual(currRet);
      }
    });

    it('supports different period filters', () => {
      const all = getTopPerformers('all');
      const month1 = getTopPerformers('1m');
      expect(all.length).toBe(month1.length);
    });
  });

  describe('getWorstPerformers', () => {
    it('returns timelines sorted by return ascending', () => {
      const worst = getWorstPerformers('all');
      expect(worst.length).toBeGreaterThan(0);
      for (let i = 1; i < worst.length; i++) {
        const prevRet = calculateReturn(worst[i - 1].priceHistory[0].price, worst[i - 1].priceHistory[worst[i - 1].priceHistory.length - 1].price);
        const currRet = calculateReturn(worst[i].priceHistory[0].price, worst[i].priceHistory[worst[i].priceHistory.length - 1].price);
        expect(prevRet).toBeLessThanOrEqual(currRet);
      }
    });
  });
});
