import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from 'vitest';
import {
  getAllocationItems,
  getAllocationTargets,
  getRiskReturnProfiles,
  getRebalanceActions,
  getAllocationStats,
  setTargetAllocation,
  getHistoricalReturns,
  getPortfolioRisk,
  getDiversificationScore,
  getOptimalAllocation,
  formatCurrency,
  formatPercent,
  getCategoryColor,
  getCategoryLabel,
  getRiskColor,
  getLiquidityColor,
} from '../../lib/vintageAllocationService';
import type {
  AllocationCategory,
  AllocationItem,
  AllocationTarget,
  RiskReturnProfile,
  RebalanceAction,
  AllocationStats,
} from '../../lib/vintageAllocationService';
import { setupLocalStorageMock } from '../helpers';

const localStorageMock = setupLocalStorageMock();

describe('vintageAllocationService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  // ---- getAllocationItems ----
  describe('getAllocationItems', () => {
    it('returns default items when localStorage is empty', () => {
      const items = getAllocationItems();
      expect(items.length).toBeGreaterThanOrEqual(12);
    });

    it('every item has required fields', () => {
      const items = getAllocationItems();
      for (const item of items) {
        expect(item.id).toBeTruthy();
        expect(item.cardName).toBeTruthy();
        expect(item.player).toBeTruthy();
        expect(item.sport).toBeTruthy();
        expect(typeof item.year).toBe('number');
        expect(item.set).toBeTruthy();
        expect(['vintage', 'classic', 'modern', 'ultra_modern']).toContain(item.category);
        expect(item.currentValue).toBeGreaterThan(0);
        expect(item.purchasePrice).toBeGreaterThan(0);
        expect(typeof item.annualReturn).toBe('number');
        expect(item.riskScore).toBeGreaterThanOrEqual(1);
        expect(item.riskScore).toBeLessThanOrEqual(10);
        expect(['high', 'medium', 'low']).toContain(item.liquidity);
        expect(item.grade).toBeTruthy();
        expect(item.imageUrl).toBeTruthy();
      }
    });

    it('contains items from all four categories', () => {
      const items = getAllocationItems();
      const categories = new Set(items.map((i) => i.category));
      expect(categories.has('vintage')).toBe(true);
      expect(categories.has('classic')).toBe(true);
      expect(categories.has('modern')).toBe(true);
      expect(categories.has('ultra_modern')).toBe(true);
    });
  });

  // ---- getAllocationTargets ----
  describe('getAllocationTargets', () => {
    it('returns exactly 4 targets', () => {
      const targets = getAllocationTargets();
      expect(targets).toHaveLength(4);
    });

    it('each target has correct shape', () => {
      const targets = getAllocationTargets();
      for (const t of targets) {
        expect(['vintage', 'classic', 'modern', 'ultra_modern']).toContain(t.category);
        expect(typeof t.targetPercent).toBe('number');
        expect(typeof t.actualPercent).toBe('number');
        expect(typeof t.deviation).toBe('number');
        expect(Array.isArray(t.items)).toBe(true);
      }
    });

    it('actual percentages sum to approximately 100', () => {
      const targets = getAllocationTargets();
      const sum = targets.reduce((s, t) => s + t.actualPercent, 0);
      expect(sum).toBeGreaterThan(99);
      expect(sum).toBeLessThan(101);
    });

    it('deviation equals actualPercent minus targetPercent', () => {
      const targets = getAllocationTargets();
      for (const t of targets) {
        const expected = Math.round((t.actualPercent - t.targetPercent) * 100) / 100;
        expect(t.deviation).toBe(expected);
      }
    });
  });

  // ---- getRiskReturnProfiles ----
  describe('getRiskReturnProfiles', () => {
    it('returns exactly 4 profiles', () => {
      const profiles = getRiskReturnProfiles();
      expect(profiles).toHaveLength(4);
    });

    it('each profile has all required fields', () => {
      const profiles = getRiskReturnProfiles();
      for (const p of profiles) {
        expect(typeof p.avgReturn).toBe('number');
        expect(typeof p.avgRisk).toBe('number');
        expect(typeof p.sharpeRatio).toBe('number');
        expect(typeof p.maxDrawdown).toBe('number');
        expect(typeof p.volatility).toBe('number');
      }
    });

    it('maxDrawdown is negative', () => {
      const profiles = getRiskReturnProfiles();
      for (const p of profiles) {
        if (p.avgRisk > 0) {
          expect(p.maxDrawdown).toBeLessThan(0);
        }
      }
    });
  });

  // ---- getRebalanceActions ----
  describe('getRebalanceActions', () => {
    it('returns 4 actions (one per category)', () => {
      const actions = getRebalanceActions();
      expect(actions).toHaveLength(4);
    });

    it('each action has valid action type', () => {
      const actions = getRebalanceActions();
      for (const a of actions) {
        expect(['buy', 'sell', 'hold']).toContain(a.action);
        expect(typeof a.amount).toBe('number');
        expect(a.reason).toBeTruthy();
      }
    });

    it('hold actions have amount 0', () => {
      const actions = getRebalanceActions();
      for (const a of actions) {
        if (a.action === 'hold') {
          expect(a.amount).toBe(0);
        }
      }
    });
  });

  // ---- getAllocationStats ----
  describe('getAllocationStats', () => {
    it('returns correct shape', () => {
      const stats = getAllocationStats();
      expect(stats.totalValue).toBeGreaterThan(0);
      expect(typeof stats.vintagePercent).toBe('number');
      expect(typeof stats.classicPercent).toBe('number');
      expect(typeof stats.modernPercent).toBe('number');
      expect(typeof stats.ultraModernPercent).toBe('number');
      expect(typeof stats.overallReturn).toBe('number');
      expect(typeof stats.riskScore).toBe('number');
      expect(typeof stats.diversificationScore).toBe('number');
    });

    it('percentages sum to approximately 100', () => {
      const stats = getAllocationStats();
      const sum = stats.vintagePercent + stats.classicPercent + stats.modernPercent + stats.ultraModernPercent;
      expect(sum).toBeGreaterThan(99);
      expect(sum).toBeLessThan(101);
    });

    it('overall return is positive for default data', () => {
      const stats = getAllocationStats();
      expect(stats.overallReturn).toBeGreaterThan(0);
    });
  });

  // ---- setTargetAllocation ----
  describe('setTargetAllocation', () => {
    it('persists target to localStorage', () => {
      setTargetAllocation('vintage', 50);
      const targets = getAllocationTargets();
      const vintage = targets.find((t) => t.category === 'vintage');
      expect(vintage?.targetPercent).toBe(50);
    });

    it('clamps value to 0-100 range', () => {
      setTargetAllocation('modern', 150);
      const targets = getAllocationTargets();
      const modern = targets.find((t) => t.category === 'modern');
      expect(modern?.targetPercent).toBe(100);

      setTargetAllocation('modern', -10);
      const targets2 = getAllocationTargets();
      const modern2 = targets2.find((t) => t.category === 'modern');
      expect(modern2?.targetPercent).toBe(0);
    });
  });

  // ---- getHistoricalReturns ----
  describe('getHistoricalReturns', () => {
    it('returns an array of historical data', () => {
      const data = getHistoricalReturns();
      expect(data.length).toBeGreaterThan(0);
    });

    it('each entry has year and all four categories', () => {
      const data = getHistoricalReturns();
      for (const d of data) {
        expect(typeof d.year).toBe('number');
        expect(typeof d.vintage).toBe('number');
        expect(typeof d.classic).toBe('number');
        expect(typeof d.modern).toBe('number');
        expect(typeof d.ultra_modern).toBe('number');
      }
    });
  });

  // ---- getPortfolioRisk ----
  describe('getPortfolioRisk', () => {
    it('returns a number between 1 and 10 for default data', () => {
      const risk = getPortfolioRisk();
      expect(risk).toBeGreaterThanOrEqual(1);
      expect(risk).toBeLessThanOrEqual(10);
    });
  });

  // ---- getDiversificationScore ----
  describe('getDiversificationScore', () => {
    it('returns a score between 1 and 100 for default data', () => {
      const score = getDiversificationScore();
      expect(score).toBeGreaterThanOrEqual(1);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  // ---- getOptimalAllocation ----
  describe('getOptimalAllocation', () => {
    it('conservative favors vintage', () => {
      const alloc = getOptimalAllocation('conservative');
      expect(alloc.vintage).toBeGreaterThan(alloc.ultra_modern);
    });

    it('aggressive favors ultra_modern', () => {
      const alloc = getOptimalAllocation('aggressive');
      expect(alloc.ultra_modern).toBeGreaterThan(alloc.vintage);
    });

    it('all allocations sum to 100', () => {
      for (const risk of ['conservative', 'moderate', 'aggressive'] as const) {
        const alloc = getOptimalAllocation(risk);
        const sum = alloc.vintage + alloc.classic + alloc.modern + alloc.ultra_modern;
        expect(sum).toBe(100);
      }
    });
  });

  // ---- formatCurrency ----
  describe('formatCurrency', () => {
    it('formats positive numbers', () => {
      const result = formatCurrency(12500);
      expect(result).toContain('12,500');
      expect(result).toContain('$');
    });

    it('formats zero', () => {
      const result = formatCurrency(0);
      expect(result).toContain('$');
      expect(result).toContain('0');
    });
  });

  // ---- formatPercent ----
  describe('formatPercent', () => {
    it('formats positive percent with plus sign', () => {
      expect(formatPercent(12.5)).toBe('+12.5%');
    });

    it('formats negative percent with minus sign', () => {
      expect(formatPercent(-3.2)).toBe('-3.2%');
    });

    it('formats zero as positive', () => {
      expect(formatPercent(0)).toBe('+0.0%');
    });
  });

  // ---- getCategoryColor ----
  describe('getCategoryColor', () => {
    it('returns a hex color for each category', () => {
      const cats: AllocationCategory[] = ['vintage', 'classic', 'modern', 'ultra_modern'];
      for (const cat of cats) {
        const color = getCategoryColor(cat);
        expect(color).toMatch(/^#[0-9a-f]{6}$/);
      }
    });

    it('returns distinct colors', () => {
      const colors = new Set([
        getCategoryColor('vintage'),
        getCategoryColor('classic'),
        getCategoryColor('modern'),
        getCategoryColor('ultra_modern'),
      ]);
      expect(colors.size).toBe(4);
    });
  });

  // ---- getCategoryLabel ----
  describe('getCategoryLabel', () => {
    it('returns descriptive labels', () => {
      expect(getCategoryLabel('vintage')).toContain('Vintage');
      expect(getCategoryLabel('classic')).toContain('Classic');
      expect(getCategoryLabel('modern')).toContain('Modern');
      expect(getCategoryLabel('ultra_modern')).toContain('Ultra Modern');
    });
  });

  // ---- getRiskColor ----
  describe('getRiskColor', () => {
    it('returns green for low risk', () => {
      expect(getRiskColor(2)).toBe('#10b981');
    });

    it('returns amber for medium risk', () => {
      expect(getRiskColor(5)).toBe('#f59e0b');
    });

    it('returns red for high risk', () => {
      expect(getRiskColor(8)).toBe('#ef4444');
    });
  });

  // ---- getLiquidityColor ----
  describe('getLiquidityColor', () => {
    it('returns green for high liquidity', () => {
      expect(getLiquidityColor('high')).toBe('#10b981');
    });

    it('returns amber for medium liquidity', () => {
      expect(getLiquidityColor('medium')).toBe('#f59e0b');
    });

    it('returns red for low liquidity', () => {
      expect(getLiquidityColor('low')).toBe('#ef4444');
    });
  });
});
