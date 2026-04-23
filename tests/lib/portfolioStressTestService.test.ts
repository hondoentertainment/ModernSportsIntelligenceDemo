// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getScenarios,
  getScenarioById,
  runStressTest,
  getStressTestResults,
  getResilienceScore,
  getPortfolioResilience,
  getStressTestStats,
  getHistoricalCrashes,
  getRecoveryProjection,
  getMostVulnerableCards,
  getCustomScenario,
  formatCurrency,
  formatPercent,
  getSeverityColor,
  getSeverityLabel,
  getScenarioIcon,
  getRiskColor,
  type StressScenario,
  type StressTestResult,
  type PortfolioResilience,
  type StressTestStats,
  type SeverityLevel,
  type ScenarioType,
} from '../../lib/analytics/portfolioStressTestService';
import { setupLocalStorageMock } from '../helpers';

const localStorageMock = setupLocalStorageMock();

describe('portfolioStressTestService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  // ---- getScenarios ----

  describe('getScenarios', () => {
    it('returns at least 12 scenarios', () => {
      const scenarios = getScenarios();
      expect(scenarios.length).toBeGreaterThanOrEqual(12);
    });

    it('each scenario has required fields', () => {
      const scenarios = getScenarios();
      for (const s of scenarios) {
        expect(s.id).toBeTruthy();
        expect(s.name).toBeTruthy();
        expect(s.description).toBeTruthy();
        expect(['player_injury', 'retirement', 'scandal', 'market_crash', 'grading_scandal', 'regulation', 'recession', 'hype_cycle']).toContain(s.type);
        expect(['mild', 'moderate', 'severe', 'catastrophic']).toContain(s.severity);
        expect(Array.isArray(s.affectedSports)).toBe(true);
        expect(s.affectedSports.length).toBeGreaterThan(0);
        expect(Array.isArray(s.affectedCategories)).toBe(true);
        expect(s.affectedCategories.length).toBeGreaterThan(0);
        expect(typeof s.priceImpact).toBe('number');
        expect(s.recoveryTime).toBeTruthy();
      }
    });

    it('returns a new array (not mutable reference)', () => {
      const a = getScenarios();
      const b = getScenarios();
      expect(a).not.toBe(b);
      expect(a).toEqual(b);
    });
  });

  // ---- getScenarioById ----

  describe('getScenarioById', () => {
    it('returns a scenario for valid id', () => {
      const scenario = getScenarioById('sc-001');
      expect(scenario).toBeDefined();
      expect(scenario!.id).toBe('sc-001');
      expect(scenario!.name).toBeTruthy();
    });

    it('returns undefined for unknown id', () => {
      const scenario = getScenarioById('nonexistent');
      expect(scenario).toBeUndefined();
    });
  });

  // ---- runStressTest ----

  describe('runStressTest', () => {
    it('returns a valid StressTestResult', () => {
      const result = runStressTest('sc-001');
      expect(result.scenarioId).toBe('sc-001');
      expect(result.scenarioName).toBeTruthy();
      expect(typeof result.portfolioValueBefore).toBe('number');
      expect(typeof result.portfolioValueAfter).toBe('number');
      expect(typeof result.impactAmount).toBe('number');
      expect(typeof result.impactPercent).toBe('number');
      expect(result.riskScore).toBeGreaterThanOrEqual(1);
      expect(result.riskScore).toBeLessThanOrEqual(100);
      expect(Array.isArray(result.mostAffectedCards)).toBe(true);
      expect(result.mostAffectedCards.length).toBeGreaterThan(0);
      expect(Array.isArray(result.recoveryProjection)).toBe(true);
      expect(result.recoveryProjection.length).toBeGreaterThan(0);
    });

    it('throws for unknown scenario', () => {
      expect(() => runStressTest('nonexistent')).toThrow('Scenario not found');
    });

    it('persists result to localStorage', () => {
      runStressTest('sc-001');
      expect(localStorageMock.setItem).toHaveBeenCalled();
      const results = getStressTestResults();
      expect(results.length).toBe(1);
      expect(results[0].scenarioId).toBe('sc-001');
    });

    it('calculates negative impact for negative priceImpact scenario', () => {
      const result = runStressTest('sc-001');
      const scenario = getScenarioById('sc-001')!;
      expect(scenario.priceImpact).toBeLessThan(0);
      expect(result.impactAmount).toBeLessThan(0);
      expect(result.portfolioValueAfter).toBeLessThan(result.portfolioValueBefore);
    });

    it('replaces existing result for same scenario on re-run', () => {
      runStressTest('sc-001');
      runStressTest('sc-001');
      const results = getStressTestResults();
      const sc001Results = results.filter(r => r.scenarioId === 'sc-001');
      expect(sc001Results.length).toBe(1);
    });

    it('stores multiple results for different scenarios', () => {
      runStressTest('sc-001');
      runStressTest('sc-002');
      const results = getStressTestResults();
      expect(results.length).toBe(2);
    });

    it('mostAffectedCards have correct fields', () => {
      const result = runStressTest('sc-004');
      for (const card of result.mostAffectedCards) {
        expect(card.cardName).toBeTruthy();
        expect(card.player).toBeTruthy();
        expect(typeof card.currentValue).toBe('number');
        expect(typeof card.projectedValue).toBe('number');
        expect(typeof card.impactPercent).toBe('number');
        expect(card.projectedValue).toBeGreaterThanOrEqual(0);
      }
    });

    it('recovery projection starts at post-impact value and trends toward original', () => {
      const result = runStressTest('sc-004');
      const proj = result.recoveryProjection;
      expect(proj[0].month).toBe(0);
      expect(proj[0].value).toBe(result.portfolioValueAfter);
      const lastValue = proj[proj.length - 1].value;
      // Should be closer to before than after
      expect(lastValue).toBeGreaterThan(result.portfolioValueAfter);
    });
  });

  // ---- getStressTestResults ----

  describe('getStressTestResults', () => {
    it('returns empty array when no tests run', () => {
      const results = getStressTestResults();
      expect(results).toEqual([]);
    });

    it('returns persisted results', () => {
      runStressTest('sc-003');
      const results = getStressTestResults();
      expect(results.length).toBe(1);
    });
  });

  // ---- getResilienceScore ----

  describe('getResilienceScore', () => {
    it('returns default 50 when no tests run', () => {
      expect(getResilienceScore()).toBe(50);
    });

    it('returns a score between 1 and 100 after tests', () => {
      runStressTest('sc-001');
      const score = getResilienceScore();
      expect(score).toBeGreaterThanOrEqual(1);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  // ---- getPortfolioResilience ----

  describe('getPortfolioResilience', () => {
    it('returns resilience with all required fields', () => {
      const res = getPortfolioResilience();
      expect(typeof res.overallScore).toBe('number');
      expect(Array.isArray(res.vulnerabilities)).toBe(true);
      expect(Array.isArray(res.strengths)).toBe(true);
      expect(Array.isArray(res.recommendations)).toBe(true);
    });

    it('has untested vulnerability when no tests run', () => {
      const res = getPortfolioResilience();
      expect(res.vulnerabilities.length).toBeGreaterThan(0);
      expect(res.vulnerabilities[0].area).toContain('Untested');
    });

    it('includes concentration risk vulnerability after running tests', () => {
      runStressTest('sc-001');
      const res = getPortfolioResilience();
      const concRisk = res.vulnerabilities.find(v => v.area === 'Concentration Risk');
      expect(concRisk).toBeDefined();
    });

    it('provides recommendations', () => {
      runStressTest('sc-001');
      const res = getPortfolioResilience();
      expect(res.recommendations.length).toBeGreaterThan(0);
    });
  });

  // ---- getStressTestStats ----

  describe('getStressTestStats', () => {
    it('returns default stats when no tests run', () => {
      const stats = getStressTestStats();
      expect(stats.totalTestsRun).toBe(0);
      expect(stats.avgImpact).toBe(0);
      expect(stats.worstScenario).toBe('N/A');
      expect(stats.bestResilience).toBe('N/A');
    });

    it('updates after running tests', () => {
      runStressTest('sc-001');
      runStressTest('sc-004');
      const stats = getStressTestStats();
      expect(stats.totalTestsRun).toBe(2);
      expect(stats.avgImpact).toBeGreaterThan(0);
      expect(stats.worstScenario).toBeTruthy();
      expect(stats.worstScenario).not.toBe('N/A');
      expect(stats.lastTestDate).toBeTruthy();
    });
  });

  // ---- getHistoricalCrashes ----

  describe('getHistoricalCrashes', () => {
    it('returns at least 3 historical crashes', () => {
      const crashes = getHistoricalCrashes();
      expect(crashes.length).toBeGreaterThanOrEqual(3);
    });

    it('each crash has required fields', () => {
      const crashes = getHistoricalCrashes();
      for (const c of crashes) {
        expect(c.id).toBeTruthy();
        expect(c.name).toBeTruthy();
        expect(typeof c.year).toBe('number');
        expect(c.description).toBeTruthy();
        expect(typeof c.impactPercent).toBe('number');
        expect(typeof c.recoveryMonths).toBe('number');
        expect(Array.isArray(c.affectedMarkets)).toBe(true);
      }
    });
  });

  // ---- getRecoveryProjection ----

  describe('getRecoveryProjection', () => {
    it('returns projection for scenario even without prior run', () => {
      const proj = getRecoveryProjection('sc-001');
      expect(proj.length).toBeGreaterThan(0);
      expect(proj[0].month).toBe(0);
    });

    it('returns empty array for unknown scenario', () => {
      const proj = getRecoveryProjection('nonexistent');
      expect(proj).toEqual([]);
    });

    it('returns stored projection when test has been run', () => {
      const result = runStressTest('sc-001');
      const proj = getRecoveryProjection('sc-001');
      expect(proj).toEqual(result.recoveryProjection);
    });
  });

  // ---- getMostVulnerableCards ----

  describe('getMostVulnerableCards', () => {
    it('returns empty array when no tests run', () => {
      expect(getMostVulnerableCards()).toEqual([]);
    });

    it('returns cards sorted by impact (most negative first)', () => {
      runStressTest('sc-001');
      const cards = getMostVulnerableCards();
      expect(cards.length).toBeGreaterThan(0);
      for (let i = 1; i < cards.length; i++) {
        expect(cards[i].impactPercent).toBeGreaterThanOrEqual(cards[i - 1].impactPercent);
      }
    });
  });

  // ---- getCustomScenario ----

  describe('getCustomScenario', () => {
    it('creates a custom scenario with required fields', () => {
      const custom = getCustomScenario({
        name: 'Test Scenario',
        type: 'market_crash',
        severity: 'severe',
        priceImpact: -45,
      });
      expect(custom.id).toContain('custom-');
      expect(custom.name).toBe('Test Scenario');
      expect(custom.type).toBe('market_crash');
      expect(custom.severity).toBe('severe');
      expect(custom.priceImpact).toBe(-45);
      expect(custom.affectedSports.length).toBeGreaterThan(0);
      expect(custom.recoveryTime).toBeTruthy();
    });

    it('uses provided optional fields', () => {
      const custom = getCustomScenario({
        name: 'Custom',
        type: 'scandal',
        severity: 'mild',
        priceImpact: -10,
        affectedSports: ['Soccer'],
        description: 'Custom description',
      });
      expect(custom.affectedSports).toEqual(['Soccer']);
      expect(custom.description).toBe('Custom description');
    });
  });

  // ---- Formatting functions ----

  describe('formatCurrency', () => {
    it('formats positive numbers as USD', () => {
      const result = formatCurrency(1234);
      expect(result).toContain('1,234');
      expect(result).toContain('$');
    });

    it('formats zero', () => {
      expect(formatCurrency(0)).toContain('$');
      expect(formatCurrency(0)).toContain('0');
    });
  });

  describe('formatPercent', () => {
    it('adds + sign for positive values', () => {
      expect(formatPercent(5.5)).toBe('+5.5%');
    });

    it('shows negative values without + sign', () => {
      expect(formatPercent(-12.3)).toBe('-12.3%');
    });

    it('formats zero', () => {
      expect(formatPercent(0)).toContain('0.0%');
    });
  });

  describe('getSeverityColor', () => {
    it('returns correct color for each severity', () => {
      expect(getSeverityColor('mild')).toContain('green');
      expect(getSeverityColor('moderate')).toContain('yellow');
      expect(getSeverityColor('severe')).toContain('orange');
      expect(getSeverityColor('catastrophic')).toContain('red');
    });
  });

  describe('getSeverityLabel', () => {
    it('returns capitalized label for each severity', () => {
      expect(getSeverityLabel('mild')).toBe('Mild');
      expect(getSeverityLabel('moderate')).toBe('Moderate');
      expect(getSeverityLabel('severe')).toBe('Severe');
      expect(getSeverityLabel('catastrophic')).toBe('Catastrophic');
    });
  });

  describe('getScenarioIcon', () => {
    it('returns an icon string for each type', () => {
      const types: ScenarioType[] = ['player_injury', 'retirement', 'scandal', 'market_crash', 'grading_scandal', 'regulation', 'recession', 'hype_cycle'];
      for (const t of types) {
        expect(getScenarioIcon(t)).toBeTruthy();
      }
    });
  });

  describe('getRiskColor', () => {
    it('returns green for low risk', () => {
      expect(getRiskColor(10)).toContain('green');
    });

    it('returns yellow for moderate risk', () => {
      expect(getRiskColor(40)).toContain('yellow');
    });

    it('returns orange for high risk', () => {
      expect(getRiskColor(60)).toContain('orange');
    });

    it('returns red for extreme risk', () => {
      expect(getRiskColor(90)).toContain('red');
    });
  });
});
