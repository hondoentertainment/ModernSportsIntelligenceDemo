// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getPriceForecasts,
  getTopForecasts,
  getCatalysts,
  getUpcomingCatalysts,
  getModelPerformance,
  getSeasonalPatterns,
  getPlayerForecasts,
  getForecastAccuracy,
  getMarketRegime,
  getSignalColor,
  getSignalLabel,
  getCatalystIcon,
  formatCurrency,
  formatPercent,
} from '../../lib/analytics/predictivePriceEngineService';
import { setupLocalStorageMock } from '../helpers';

const localStorageMock = setupLocalStorageMock();

describe('predictivePriceEngineService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('getPriceForecasts', () => {
    it('returns an array of 20+ forecasts', () => {
      const forecasts = getPriceForecasts();
      expect(Array.isArray(forecasts)).toBe(true);
      expect(forecasts.length).toBeGreaterThanOrEqual(20);
    });

    it('each forecast has valid structure', () => {
      const forecasts = getPriceForecasts();
      for (const f of forecasts) {
        expect(f.id).toBeTruthy();
        expect(f.player).toBeTruthy();
        expect(f.currentPrice).toBeGreaterThan(0);
        expect(['strong_buy', 'buy', 'hold', 'sell', 'strong_sell']).toContain(f.signal);
        expect(f.signalStrength).toBeGreaterThanOrEqual(0);
        expect(f.signalStrength).toBeLessThanOrEqual(100);
      }
    });

    it('each forecast has valid horizons with confidence 0-100', () => {
      const validHorizons = ['7d', '30d', '90d', '6m', '1y'];
      const forecasts = getPriceForecasts();
      for (const f of forecasts) {
        expect(f.forecasts.length).toBeGreaterThanOrEqual(1);
        for (const fc of f.forecasts) {
          expect(validHorizons).toContain(fc.horizon);
          expect(fc.confidence).toBeGreaterThanOrEqual(0);
          expect(fc.confidence).toBeLessThanOrEqual(100);
          expect(fc.predicted).toBeGreaterThan(0);
          expect(fc.low).toBeLessThanOrEqual(fc.predicted);
          expect(fc.high).toBeGreaterThanOrEqual(fc.predicted);
        }
      }
    });
  });

  describe('getTopForecasts', () => {
    it('returns filtered results when signal is provided', () => {
      const buys = getTopForecasts('strong_buy');
      expect(buys.length).toBeGreaterThan(0);
      buys.forEach(f => expect(f.signal).toBe('strong_buy'));
    });

    it('returns top 10 sorted by strength when no signal', () => {
      const top = getTopForecasts();
      expect(top.length).toBeLessThanOrEqual(10);
      for (let i = 1; i < top.length; i++) {
        expect(top[i - 1].signalStrength).toBeGreaterThanOrEqual(top[i].signalStrength);
      }
    });
  });

  describe('getCatalysts', () => {
    it('returns 15+ catalysts', () => {
      const catalysts = getCatalysts();
      expect(catalysts.length).toBeGreaterThanOrEqual(15);
    });

    it('each catalyst has valid impact and probability', () => {
      const catalysts = getCatalysts();
      for (const c of catalysts) {
        expect(c.impact).toBeGreaterThanOrEqual(-100);
        expect(c.impact).toBeLessThanOrEqual(100);
        expect(c.probability).toBeGreaterThanOrEqual(0);
        expect(c.probability).toBeLessThanOrEqual(100);
        expect(c.affectedPlayers.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getUpcomingCatalysts', () => {
    it('returns catalysts sorted by date', () => {
      const upcoming = getUpcomingCatalysts();
      for (let i = 1; i < upcoming.length; i++) {
        expect(upcoming[i - 1].expectedDate <= upcoming[i].expectedDate).toBe(true);
      }
    });
  });

  describe('getModelPerformance', () => {
    it('returns data for all 4 model types', () => {
      const perf = getModelPerformance();
      expect(perf.length).toBe(4);
      const models = perf.map(p => p.model);
      expect(models).toContain('time_series');
      expect(models).toContain('ml_ensemble');
      expect(models).toContain('sentiment');
      expect(models).toContain('composite');
    });

    it('accuracy values are within 0-100 range', () => {
      const perf = getModelPerformance();
      for (const p of perf) {
        expect(p.accuracy7d).toBeGreaterThanOrEqual(0);
        expect(p.accuracy7d).toBeLessThanOrEqual(100);
        expect(p.accuracy30d).toBeGreaterThanOrEqual(0);
        expect(p.accuracy30d).toBeLessThanOrEqual(100);
        expect(p.accuracy90d).toBeGreaterThanOrEqual(0);
        expect(p.accuracy90d).toBeLessThanOrEqual(100);
        expect(p.profitablePredictions).toBeLessThanOrEqual(p.totalPredictions);
      }
    });
  });

  describe('getSeasonalPatterns', () => {
    it('returns exactly 12 months', () => {
      const patterns = getSeasonalPatterns();
      expect(patterns.length).toBe(12);
    });

    it('covers all months January through December', () => {
      const patterns = getSeasonalPatterns();
      const months = patterns.map(p => p.month);
      expect(months[0]).toBe('January');
      expect(months[11]).toBe('December');
    });

    it('each pattern has valid fields', () => {
      const patterns = getSeasonalPatterns();
      for (const p of patterns) {
        expect(p.winRate).toBeGreaterThanOrEqual(0);
        expect(p.winRate).toBeLessThanOrEqual(100);
        expect(p.volume).toBeGreaterThan(0);
        expect(p.bestSport).toBeTruthy();
      }
    });
  });

  describe('getPlayerForecasts', () => {
    it('returns 10+ player forecasts', () => {
      const players = getPlayerForecasts();
      expect(players.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('getForecastAccuracy', () => {
    it('returns accuracy data for each model type', () => {
      const types: Array<'time_series' | 'ml_ensemble' | 'sentiment' | 'composite'> = [
        'time_series', 'ml_ensemble', 'sentiment', 'composite',
      ];
      for (const t of types) {
        const data = getForecastAccuracy(t);
        expect(data.length).toBeGreaterThan(0);
        for (const d of data) {
          expect(d.date).toBeTruthy();
          expect(d.predicted).toBeGreaterThan(0);
          expect(d.actual).toBeGreaterThan(0);
          expect(d.error).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });

  describe('getMarketRegime', () => {
    it('returns valid market regime', () => {
      const regime = getMarketRegime();
      expect(['bull', 'bear', 'sideways', 'volatile']).toContain(regime.current);
      expect(regime.strength).toBeGreaterThanOrEqual(0);
      expect(regime.strength).toBeLessThanOrEqual(100);
      const total = regime.transitionProbability.bull + regime.transitionProbability.bear + regime.transitionProbability.sideways;
      expect(total).toBe(100);
    });
  });

  describe('getSignalColor', () => {
    it('returns correct colors for all signals', () => {
      expect(getSignalColor('strong_buy')).toBe('#10b981');
      expect(getSignalColor('buy')).toBe('#34d399');
      expect(getSignalColor('hold')).toBe('#f59e0b');
      expect(getSignalColor('sell')).toBe('#f87171');
      expect(getSignalColor('strong_sell')).toBe('#ef4444');
    });
  });

  describe('getSignalLabel', () => {
    it('returns correct labels for all signals', () => {
      expect(getSignalLabel('strong_buy')).toBe('Strong Buy');
      expect(getSignalLabel('buy')).toBe('Buy');
      expect(getSignalLabel('hold')).toBe('Hold');
      expect(getSignalLabel('sell')).toBe('Sell');
      expect(getSignalLabel('strong_sell')).toBe('Strong Sell');
    });
  });

  describe('getCatalystIcon', () => {
    it('returns an icon string for each catalyst type', () => {
      const types: Array<'performance' | 'injury' | 'trade' | 'award' | 'rookie_debut' | 'retirement' | 'media' | 'population'> = [
        'performance', 'injury', 'trade', 'award', 'rookie_debut', 'retirement', 'media', 'population',
      ];
      for (const t of types) {
        expect(getCatalystIcon(t)).toBeTruthy();
        expect(typeof getCatalystIcon(t)).toBe('string');
      }
    });
  });

  describe('formatCurrency', () => {
    it('formats values correctly', () => {
      expect(formatCurrency(5)).toBe('$5.00');
      expect(formatCurrency(1500)).toBe('$1,500');
      expect(formatCurrency(1500000)).toBe('$1.50M');
    });
  });

  describe('formatPercent', () => {
    it('formats positive and negative percentages', () => {
      expect(formatPercent(10.5)).toBe('+10.5%');
      expect(formatPercent(-3.2)).toBe('-3.2%');
      expect(formatPercent(0)).toBe('+0.0%');
    });
  });
});
