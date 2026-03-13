import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  runStrategy,
  runBacktest,
  runScreener,
  getTemplates,
  getSavedStrategies,
  saveStrategy,
  deleteStrategy,
  SCREENER_FIELDS,
  SCREENER_OPERATORS,
} from '../../lib/quantWorkbenchService';
import { setupLocalStorageMock } from '../helpers';

const localStorageMock = setupLocalStorageMock();

describe('quantWorkbenchService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('runStrategy', () => {
    it('returns result for table-type code', () => {
      const result = runStrategy('filter(cards).sort()');
      expect(result.id).toBeTruthy();
      expect(result.timestamp).toBeTruthy();
      expect(result.executionTime).toBeGreaterThan(0);
      expect(result.rowCount).toBeGreaterThan(0);
      expect(result.summary).toBeTruthy();
    });

    it('returns chart result for backtest code', () => {
      const result = runStrategy('backtest(equityCurve)');
      expect(result.resultType).toBe('chart');
      expect(Array.isArray(result.output)).toBe(true);
    });

    it('returns number result for count code', () => {
      const result = runStrategy('count total');
      expect(result.resultType).toBe('number');
      expect(typeof result.output).toBe('number');
    });

    it('returns list result for alert code', () => {
      const result = runStrategy('alert signal');
      expect(result.resultType).toBe('list');
      expect(Array.isArray(result.output)).toBe(true);
    });

    it('is deterministic for same code', () => {
      const a = runStrategy('deterministic test filter');
      const b = runStrategy('deterministic test filter');
      expect(a.rowCount).toBe(b.rowCount);
      expect(a.resultType).toBe(b.resultType);
    });
  });

  describe('runBacktest', () => {
    it('returns backtest result', () => {
      const result = runBacktest('test-strat', '2024-01-01', '2025-12-31');
      expect(result.strategyId).toBe('test-strat');
      expect(result.startDate).toBe('2024-01-01');
      expect(result.endDate).toBe('2025-12-31');
      expect(typeof result.totalReturn).toBe('number');
      expect(typeof result.annualizedReturn).toBe('number');
      expect(typeof result.sharpeRatio).toBe('number');
      expect(typeof result.maxDrawdown).toBe('number');
      expect(typeof result.winRate).toBe('number');
      expect(result.trades.length).toBeGreaterThan(0);
      expect(result.equityCurve.length).toBeGreaterThan(0);
    });

    it('equity curve spans the period', () => {
      const result = runBacktest('test', '2024-01-01', '2024-12-31');
      expect(result.equityCurve.length).toBeGreaterThanOrEqual(12);
      expect(result.equityCurve[0].date).toContain('2024');
    });

    it('max drawdown is non-negative', () => {
      const result = runBacktest('test', '2024-01-01', '2025-06-30');
      expect(result.maxDrawdown).toBeGreaterThanOrEqual(0);
    });

    it('win rate is between 0 and 100', () => {
      const result = runBacktest('test', '2024-01-01', '2025-12-31');
      expect(result.winRate).toBeGreaterThanOrEqual(0);
      expect(result.winRate).toBeLessThanOrEqual(100);
    });

    it('trades have valid structure', () => {
      const result = runBacktest('test', '2024-06-01', '2025-06-01');
      for (const t of result.trades) {
        expect(['buy', 'sell']).toContain(t.action);
        expect(t.player).toBeTruthy();
        expect(t.price).toBeGreaterThan(0);
        expect(t.quantity).toBeGreaterThan(0);
      }
    });
  });

  describe('runScreener', () => {
    it('returns screener results', () => {
      const result = runScreener([
        { field: 'price', operator: '>', value: 100, label: 'Price > $100' },
      ]);
      expect(result.totalMatches).toBeGreaterThan(0);
      expect(result.matches.length).toBe(result.totalMatches);
      expect(result.filters.length).toBe(1);
    });

    it('matches have valid structure', () => {
      const result = runScreener([
        { field: 'sport', operator: '=', value: 'Baseball', label: 'Baseball' },
      ]);
      for (const m of result.matches) {
        expect(m.player).toBeTruthy();
        expect(m.card).toBeTruthy();
        expect(m.sport).toBeTruthy();
        expect(m.grade).toBeTruthy();
        expect(m.price).toBeGreaterThan(0);
        expect(typeof m.change).toBe('number');
      }
    });

    it('is deterministic for same filters', () => {
      const filters = [{ field: 'grade', operator: '=' as const, value: 'PSA 10', label: 'PSA 10' }];
      const a = runScreener(filters);
      const b = runScreener(filters);
      expect(a.totalMatches).toBe(b.totalMatches);
    });

    it('works with empty filters', () => {
      const result = runScreener([]);
      expect(result.totalMatches).toBeGreaterThan(0);
    });
  });

  describe('getTemplates', () => {
    it('returns template strategies', () => {
      const templates = getTemplates();
      expect(templates.length).toBeGreaterThan(0);
    });

    it('all templates are marked as templates', () => {
      const templates = getTemplates();
      for (const t of templates) {
        expect(t.isTemplate).toBe(true);
        expect(t.id).toBeTruthy();
        expect(t.name).toBeTruthy();
        expect(t.code).toBeTruthy();
        expect(['screener', 'backtest', 'analysis', 'alert']).toContain(t.type);
      }
    });

    it('returns a copy', () => {
      const a = getTemplates();
      const b = getTemplates();
      expect(a).not.toBe(b);
    });
  });

  describe('saveStrategy / getSavedStrategies / deleteStrategy', () => {
    it('starts with no saved strategies', () => {
      expect(getSavedStrategies()).toEqual([]);
    });

    it('saves a strategy', () => {
      const saved = saveStrategy({
        name: 'Test Strategy',
        description: 'A test',
        code: 'return universe;',
        type: 'screener',
        lastRun: null,
        lastResult: null,
        author: 'test',
      });
      expect(saved.id).toBeTruthy();
      expect(saved.isTemplate).toBe(false);
      expect(getSavedStrategies().length).toBe(1);
    });

    it('deletes a strategy', () => {
      const saved = saveStrategy({
        name: 'To Delete',
        description: 'Will be deleted',
        code: 'x',
        type: 'analysis',
        lastRun: null,
        lastResult: null,
        author: 'test',
      });
      deleteStrategy(saved.id);
      expect(getSavedStrategies()).toEqual([]);
    });
  });

  describe('constants', () => {
    it('SCREENER_FIELDS has entries', () => {
      expect(SCREENER_FIELDS.length).toBeGreaterThan(0);
      for (const f of SCREENER_FIELDS) {
        expect(f.value).toBeTruthy();
        expect(f.label).toBeTruthy();
      }
    });

    it('SCREENER_OPERATORS has entries', () => {
      expect(SCREENER_OPERATORS.length).toBeGreaterThan(0);
      expect(SCREENER_OPERATORS.map(o => o.value)).toContain('>');
      expect(SCREENER_OPERATORS.map(o => o.value)).toContain('<');
    });
  });
});
