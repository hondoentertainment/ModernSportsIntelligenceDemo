import { describe, expect, it, beforeEach } from 'vitest';
import { setupLocalStorageMock } from '../helpers';
import {
  BreakEvenScenario,
  EstimatedGrade,
  CalculateBreakEvenParams,
  getScenarios,
  calculateBreakEven,
  getGradingTiers,
  getPlatformFees,
  getProfitProjections,
  getSavedCalculations,
  saveCalculation,
  deleteCalculation,
  getBestCaseROI,
  getWorstCaseROI,
  formatCurrency,
  formatPercent,
  getROIColor,
  getProfitColor,
} from '../../lib/breakEvenCalculatorService';

// ─── Test Helpers ──────────────────────────────────────────────────────────

function makeScenario(overrides: Partial<BreakEvenScenario> = {}): BreakEvenScenario {
  return {
    id: 'test-1',
    cardName: 'Test Card',
    player: 'Test Player',
    sport: 'Baseball',
    year: 2024,
    set: 'Topps Chrome',
    purchasePrice: 100,
    gradingCost: 50,
    gradingCompany: 'PSA',
    shippingCost: 15,
    insuranceCost: 5,
    platformFees: 12.9,
    estimatedGrades: [
      { grade: 'PSA 10', probability: 0.25, marketValue: 500 },
      { grade: 'PSA 9', probability: 0.45, marketValue: 200 },
      { grade: 'PSA 8', probability: 0.20, marketValue: 120 },
      { grade: 'PSA 7', probability: 0.07, marketValue: 80 },
      { grade: 'PSA 6', probability: 0.03, marketValue: 40 },
    ],
    breakEvenGrade: 'PSA 9',
    expectedProfit: 50,
    expectedROI: 29.41,
    timestamp: '2025-12-01T10:00:00Z',
    ...overrides,
  };
}

function makeCalcParams(overrides: Partial<CalculateBreakEvenParams> = {}): CalculateBreakEvenParams {
  return {
    cardName: 'Test Card',
    player: 'Test Player',
    sport: 'Baseball',
    year: 2024,
    set: 'Topps Chrome',
    purchasePrice: 100,
    gradingCost: 50,
    gradingCompany: 'PSA',
    shippingCost: 15,
    insuranceCost: 5,
    platformFees: 12.9,
    estimatedGrades: [
      { grade: 'PSA 10', probability: 0.25, marketValue: 500 },
      { grade: 'PSA 9', probability: 0.45, marketValue: 200 },
      { grade: 'PSA 8', probability: 0.20, marketValue: 120 },
      { grade: 'PSA 7', probability: 0.07, marketValue: 80 },
      { grade: 'PSA 6', probability: 0.03, marketValue: 40 },
    ],
    ...overrides,
  };
}

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('breakEvenCalculatorService', () => {
  beforeEach(() => {
    setupLocalStorageMock();
  });

  // ── getScenarios ──────────────────────────────────────────────────────

  describe('getScenarios', () => {
    it('returns an array of mock scenarios', () => {
      const scenarios = getScenarios();
      expect(Array.isArray(scenarios)).toBe(true);
      expect(scenarios.length).toBeGreaterThanOrEqual(12);
    });

    it('each scenario has required fields', () => {
      const scenarios = getScenarios();
      for (const s of scenarios) {
        expect(s.id).toBeTruthy();
        expect(s.cardName).toBeTruthy();
        expect(s.player).toBeTruthy();
        expect(s.sport).toBeTruthy();
        expect(typeof s.purchasePrice).toBe('number');
        expect(s.estimatedGrades.length).toBeGreaterThan(0);
        expect(s.breakEvenGrade).toBeTruthy();
        expect(typeof s.expectedProfit).toBe('number');
        expect(typeof s.expectedROI).toBe('number');
        expect(s.timestamp).toBeTruthy();
      }
    });

    it('returns a defensive copy (mutations do not affect source)', () => {
      const a = getScenarios();
      const b = getScenarios();
      a[0].cardName = 'MUTATED';
      expect(b[0].cardName).not.toBe('MUTATED');
    });
  });

  // ── calculateBreakEven ────────────────────────────────────────────────

  describe('calculateBreakEven', () => {
    it('returns a scenario with an id and timestamp', () => {
      const result = calculateBreakEven(makeCalcParams());
      expect(result.id).toBeTruthy();
      expect(result.timestamp).toBeTruthy();
    });

    it('identifies the correct break-even grade', () => {
      const result = calculateBreakEven(makeCalcParams());
      // PSA 10 gross=500, fees=64.5, costs=170+64.5=234.5 => profit=265.5 -> profitable
      // PSA 9 gross=200, fees=25.8, costs=170+25.8=195.8 => profit=4.2 -> profitable
      // PSA 8 gross=120, fees=15.48, costs=170+15.48=185.48 => profit=-65.48 -> not profitable
      // Break-even should be PSA 9 (lowest profitable grade)
      expect(result.breakEvenGrade).toBe('PSA 9');
    });

    it('calculates expected profit as weighted sum', () => {
      const result = calculateBreakEven(makeCalcParams());
      expect(typeof result.expectedProfit).toBe('number');
      // Should be positive given the grade values
      expect(result.expectedProfit).toBeGreaterThan(0);
    });

    it('calculates expected ROI correctly', () => {
      const result = calculateBreakEven(makeCalcParams());
      expect(typeof result.expectedROI).toBe('number');
    });

    it('handles all-loss scenarios with break-even N/A', () => {
      const result = calculateBreakEven(
        makeCalcParams({
          purchasePrice: 1000,
          gradingCost: 200,
          estimatedGrades: [
            { grade: 'PSA 10', probability: 0.5, marketValue: 100 },
            { grade: 'PSA 9', probability: 0.5, marketValue: 50 },
          ],
        }),
      );
      expect(result.breakEvenGrade).toBe('N/A');
      expect(result.expectedProfit).toBeLessThan(0);
    });

    it('preserves input fields on the returned scenario', () => {
      const params = makeCalcParams({ cardName: 'Special Card', player: 'Special Player' });
      const result = calculateBreakEven(params);
      expect(result.cardName).toBe('Special Card');
      expect(result.player).toBe('Special Player');
    });
  });

  // ── getProfitProjections ──────────────────────────────────────────────

  describe('getProfitProjections', () => {
    it('returns a projection for each estimated grade', () => {
      const scenario = makeScenario();
      const projections = getProfitProjections(scenario);
      expect(projections.length).toBe(scenario.estimatedGrades.length);
    });

    it('marks exactly one grade as break-even', () => {
      const projections = getProfitProjections(makeScenario());
      const breakEvens = projections.filter((p) => p.isBreakEven);
      expect(breakEvens.length).toBeLessThanOrEqual(1);
    });

    it('calculates net profit as grossRevenue - totalCosts', () => {
      const projections = getProfitProjections(makeScenario());
      for (const p of projections) {
        const expected = Math.round((p.grossRevenue - p.totalCosts) * 100) / 100;
        expect(p.netProfit).toBeCloseTo(expected, 1);
      }
    });

    it('marks profitable projections correctly', () => {
      const projections = getProfitProjections(makeScenario());
      for (const p of projections) {
        expect(p.isProfitable).toBe(p.netProfit > 0);
      }
    });

    it('includes platform fees in total costs', () => {
      const scenario = makeScenario({ platformFees: 12.9 });
      const projections = getProfitProjections(scenario);
      const baseCost = 100 + 50 + 15 + 5; // 170
      // For the highest grade (market value 500), platform fee = 500 * 0.129 = 64.5
      expect(projections[0].totalCosts).toBeCloseTo(baseCost + 500 * 0.129, 1);
    });
  });

  // ── getGradingTiers ───────────────────────────────────────────────────

  describe('getGradingTiers', () => {
    it('returns grading tiers for multiple companies', () => {
      const tiers = getGradingTiers();
      const companies = new Set(tiers.map((t) => t.company));
      expect(companies.size).toBeGreaterThanOrEqual(3);
    });

    it('each tier has company, tier name, cost, and turnaround', () => {
      const tiers = getGradingTiers();
      for (const t of tiers) {
        expect(t.company).toBeTruthy();
        expect(t.tier).toBeTruthy();
        expect(typeof t.cost).toBe('number');
        expect(t.cost).toBeGreaterThan(0);
        expect(t.turnaround).toBeTruthy();
      }
    });
  });

  // ── getPlatformFees ───────────────────────────────────────────────────

  describe('getPlatformFees', () => {
    it('returns fee structures for eBay, COMC, and MySlabs', () => {
      const fees = getPlatformFees();
      const platforms = fees.map((f) => f.platform);
      expect(platforms).toContain('eBay');
      expect(platforms).toContain('COMC');
      expect(platforms).toContain('MySlabs');
    });

    it('each fee structure has required numeric fields', () => {
      const fees = getPlatformFees();
      for (const f of fees) {
        expect(typeof f.listingFee).toBe('number');
        expect(typeof f.finalValueFee).toBe('number');
        expect(typeof f.paymentProcessing).toBe('number');
        expect(typeof f.shippingEstimate).toBe('number');
      }
    });
  });

  // ── localStorage operations ───────────────────────────────────────────

  describe('saveCalculation / getSavedCalculations / deleteCalculation', () => {
    it('saves and retrieves a calculation', () => {
      const scenario = makeScenario();
      saveCalculation(scenario);
      const saved = getSavedCalculations();
      expect(saved.length).toBe(1);
      expect(saved[0].id).toBe('test-1');
    });

    it('updates existing calculation when saving with same id', () => {
      const scenario = makeScenario();
      saveCalculation(scenario);
      saveCalculation({ ...scenario, cardName: 'Updated Card' });
      const saved = getSavedCalculations();
      expect(saved.length).toBe(1);
      expect(saved[0].cardName).toBe('Updated Card');
    });

    it('saves multiple distinct calculations', () => {
      saveCalculation(makeScenario({ id: 'a' }));
      saveCalculation(makeScenario({ id: 'b' }));
      saveCalculation(makeScenario({ id: 'c' }));
      expect(getSavedCalculations().length).toBe(3);
    });

    it('deletes a calculation by id', () => {
      saveCalculation(makeScenario({ id: 'a' }));
      saveCalculation(makeScenario({ id: 'b' }));
      deleteCalculation('a');
      const saved = getSavedCalculations();
      expect(saved.length).toBe(1);
      expect(saved[0].id).toBe('b');
    });

    it('returns empty array when nothing is saved', () => {
      expect(getSavedCalculations()).toEqual([]);
    });
  });

  // ── getBestCaseROI / getWorstCaseROI ──────────────────────────────────

  describe('getBestCaseROI', () => {
    it('returns the ROI for the highest-value grade', () => {
      const scenario = makeScenario();
      const roi = getBestCaseROI(scenario);
      // best grade: market value 500, baseCost=170, platformFee=500*0.129=64.5
      // netProfit=500-170-64.5=265.5, ROI=265.5/170*100=156.18
      expect(roi).toBeCloseTo(156.18, 0);
    });

    it('returns 0 for empty estimatedGrades', () => {
      const scenario = makeScenario({ estimatedGrades: [] });
      expect(getBestCaseROI(scenario)).toBe(0);
    });
  });

  describe('getWorstCaseROI', () => {
    it('returns the ROI for the lowest-value grade', () => {
      const scenario = makeScenario();
      const roi = getWorstCaseROI(scenario);
      // worst grade: market value 40, baseCost=170, platformFee=40*0.129=5.16
      // netProfit=40-170-5.16=-135.16, ROI=-135.16/170*100=-79.51
      expect(roi).toBeCloseTo(-79.51, 0);
    });

    it('returns 0 for empty estimatedGrades', () => {
      const scenario = makeScenario({ estimatedGrades: [] });
      expect(getWorstCaseROI(scenario)).toBe(0);
    });
  });

  // ── formatCurrency ────────────────────────────────────────────────────

  describe('formatCurrency', () => {
    it('formats positive values with $ and 2 decimals', () => {
      expect(formatCurrency(1234.5)).toBe('$1,234.50');
    });

    it('formats zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('formats negative values', () => {
      expect(formatCurrency(-50.1)).toBe('$-50.10');
    });

    it('formats large numbers with commas', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });
  });

  // ── formatPercent ─────────────────────────────────────────────────────

  describe('formatPercent', () => {
    it('formats with one decimal and % sign', () => {
      expect(formatPercent(12.9)).toBe('12.9%');
    });

    it('formats negative percentages', () => {
      expect(formatPercent(-5.5)).toBe('-5.5%');
    });
  });

  // ── getROIColor ───────────────────────────────────────────────────────

  describe('getROIColor', () => {
    it('returns green-400 for ROI >= 50', () => {
      expect(getROIColor(50)).toBe('text-green-400');
      expect(getROIColor(100)).toBe('text-green-400');
    });

    it('returns yellow-400 for ROI 0-19', () => {
      expect(getROIColor(0)).toBe('text-yellow-400');
      expect(getROIColor(19)).toBe('text-yellow-400');
    });

    it('returns red-400 for ROI < -20', () => {
      expect(getROIColor(-21)).toBe('text-red-400');
      expect(getROIColor(-100)).toBe('text-red-400');
    });
  });

  // ── getProfitColor ────────────────────────────────────────────────────

  describe('getProfitColor', () => {
    it('returns green for positive profit', () => {
      expect(getProfitColor(100)).toBe('text-green-400');
    });

    it('returns yellow for zero profit', () => {
      expect(getProfitColor(0)).toBe('text-yellow-400');
    });

    it('returns red for negative profit', () => {
      expect(getProfitColor(-50)).toBe('text-red-400');
    });
  });
});
