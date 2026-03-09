import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calculatePortfolioDrift,
  generateRebalanceAlerts,
  getRebalanceSuggestions,
  calculateRebalanceCost,
  getPortfolioHealth,
  getDefaultTargets,
  getDefaultConfig,
  getAlertHistory,
  saveAlertHistory,
  acknowledgeAlert,
  persistAlerts,
} from '../../lib/rebalancingAlertService';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

function makeCard(overrides: Record<string, any> = {}) {
  return {
    id: '1',
    player: 'Test Player',
    year: 2023,
    manufacturer: 'Topps',
    cardNumber: '1',
    set: 'Chrome',
    sport: 'Baseball',
    league: 'MLB',
    status: 'active',
    purchasePrice: 100,
    currentValue: 100,
    purchaseDate: '2023-06-01',
    gradingFees: 0,
    shippingFees: 0,
    ...overrides,
  } as any;
}

describe('rebalancingAlertService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('getDefaultTargets', () => {
    it('returns targets for all 5 sports', () => {
      const targets = getDefaultTargets();
      expect(targets).toHaveLength(5);
      const sports = targets.map(t => t.sport);
      expect(sports).toContain('Baseball');
      expect(sports).toContain('Basketball');
      expect(sports).toContain('Football');
      expect(sports).toContain('Hockey');
      expect(sports).toContain('Soccer');
    });

    it('targets sum to 100%', () => {
      const total = getDefaultTargets().reduce((s, t) => s + t.targetPercent, 0);
      expect(total).toBe(100);
    });
  });

  describe('getDefaultConfig', () => {
    it('returns a valid config', () => {
      const config = getDefaultConfig();
      expect(config.checkFrequency).toBe('weekly');
      expect(config.autoAcknowledge).toBe(false);
      expect(config.targets).toHaveLength(5);
    });
  });

  describe('calculatePortfolioDrift', () => {
    it('returns zeros for empty inventory', () => {
      const drifts = calculatePortfolioDrift([]);
      expect(drifts).toHaveLength(5);
      for (const d of drifts) {
        expect(d.actualPercent).toBe(0);
        expect(d.cardCount).toBe(0);
        expect(d.totalValue).toBe(0);
      }
    });

    it('calculates 100% allocation for single-sport portfolio', () => {
      const inventory = [
        makeCard({ id: '1', sport: 'Baseball', currentValue: 200 }),
        makeCard({ id: '2', sport: 'Baseball', currentValue: 300 }),
      ];
      const drifts = calculatePortfolioDrift(inventory);
      const baseball = drifts.find(d => d.sport === 'Baseball')!;
      expect(baseball.actualPercent).toBe(100);
      expect(baseball.cardCount).toBe(2);
      expect(baseball.totalValue).toBe(500);
      // 100% actual - 25% target = 75% drift
      expect(baseball.driftAmount).toBe(75);
    });

    it('excludes sold cards', () => {
      const inventory = [
        makeCard({ id: '1', sport: 'Baseball', currentValue: 200, status: 'active' }),
        makeCard({ id: '2', sport: 'Baseball', currentValue: 300, status: 'sold' }),
      ];
      const drifts = calculatePortfolioDrift(inventory);
      const baseball = drifts.find(d => d.sport === 'Baseball')!;
      expect(baseball.cardCount).toBe(1);
      expect(baseball.totalValue).toBe(200);
    });

    it('calculates balanced portfolio with low drift', () => {
      const inventory = [
        makeCard({ id: '1', sport: 'Baseball', currentValue: 250 }),
        makeCard({ id: '2', sport: 'Basketball', currentValue: 250 }),
        makeCard({ id: '3', sport: 'Football', currentValue: 250 }),
        makeCard({ id: '4', sport: 'Hockey', currentValue: 150 }),
        makeCard({ id: '5', sport: 'Soccer', currentValue: 100 }),
      ];
      const drifts = calculatePortfolioDrift(inventory);
      // Each sport should be close to target
      for (const d of drifts) {
        expect(d.absDrift).toBeLessThan(1);
      }
    });
  });

  describe('generateRebalanceAlerts', () => {
    it('returns no alerts for balanced portfolio', () => {
      const inventory = [
        makeCard({ id: '1', sport: 'Baseball', currentValue: 250 }),
        makeCard({ id: '2', sport: 'Basketball', currentValue: 250 }),
        makeCard({ id: '3', sport: 'Football', currentValue: 250 }),
        makeCard({ id: '4', sport: 'Hockey', currentValue: 150 }),
        makeCard({ id: '5', sport: 'Soccer', currentValue: 100 }),
      ];
      const alerts = generateRebalanceAlerts(inventory);
      const driftAlerts = alerts.filter(a => a.type === 'drift');
      expect(driftAlerts).toHaveLength(0);
    });

    it('generates drift alerts when allocation exceeds tolerance', () => {
      const inventory = [
        makeCard({ id: '1', sport: 'Baseball', currentValue: 900 }),
        makeCard({ id: '2', sport: 'Basketball', currentValue: 100 }),
      ];
      const alerts = generateRebalanceAlerts(inventory);
      const driftAlerts = alerts.filter(a => a.type === 'drift');
      expect(driftAlerts.length).toBeGreaterThan(0);
    });

    it('generates concentration alert when sport exceeds 50%', () => {
      const inventory = [
        makeCard({ id: '1', sport: 'Baseball', currentValue: 600 }),
        makeCard({ id: '2', sport: 'Basketball', currentValue: 100 }),
        makeCard({ id: '3', sport: 'Football', currentValue: 100 }),
        makeCard({ id: '4', sport: 'Hockey', currentValue: 100 }),
        makeCard({ id: '5', sport: 'Soccer', currentValue: 100 }),
      ];
      const alerts = generateRebalanceAlerts(inventory);
      const concentrationAlerts = alerts.filter(a => a.type === 'concentration');
      expect(concentrationAlerts.length).toBe(1);
      expect(concentrationAlerts[0].sport).toBe('Baseball');
      expect(concentrationAlerts[0].severity).toBe('critical');
    });

    it('sorts alerts by severity (critical first)', () => {
      const inventory = [
        makeCard({ id: '1', sport: 'Baseball', currentValue: 900 }),
        makeCard({ id: '2', sport: 'Basketball', currentValue: 100 }),
      ];
      const alerts = generateRebalanceAlerts(inventory);
      if (alerts.length >= 2) {
        const severityOrder = { critical: 0, warning: 1, info: 2 };
        for (let i = 1; i < alerts.length; i++) {
          expect(severityOrder[alerts[i].severity]).toBeGreaterThanOrEqual(
            severityOrder[alerts[i - 1].severity]
          );
        }
      }
    });
  });

  describe('getRebalanceSuggestions', () => {
    it('returns empty for balanced portfolio', () => {
      const inventory = [
        makeCard({ id: '1', sport: 'Baseball', currentValue: 250 }),
        makeCard({ id: '2', sport: 'Basketball', currentValue: 250 }),
        makeCard({ id: '3', sport: 'Football', currentValue: 250 }),
        makeCard({ id: '4', sport: 'Hockey', currentValue: 150 }),
        makeCard({ id: '5', sport: 'Soccer', currentValue: 100 }),
      ];
      const suggestions = getRebalanceSuggestions(inventory);
      expect(suggestions).toHaveLength(0);
    });

    it('suggests sell for overallocated and buy for underallocated sports', () => {
      const inventory = [
        makeCard({ id: '1', sport: 'Baseball', currentValue: 800 }),
        makeCard({ id: '2', sport: 'Basketball', currentValue: 200 }),
      ];
      const suggestions = getRebalanceSuggestions(inventory);
      const sellSuggestions = suggestions.filter(s => s.action === 'sell');
      const buySuggestions = suggestions.filter(s => s.action === 'buy');
      expect(sellSuggestions.length).toBeGreaterThan(0);
      expect(buySuggestions.length).toBeGreaterThan(0);
    });

    it('sorts by priority', () => {
      const inventory = [
        makeCard({ id: '1', sport: 'Baseball', currentValue: 900 }),
        makeCard({ id: '2', sport: 'Basketball', currentValue: 100 }),
      ];
      const suggestions = getRebalanceSuggestions(inventory);
      for (let i = 1; i < suggestions.length; i++) {
        expect(suggestions[i].priority).toBeGreaterThanOrEqual(suggestions[i - 1].priority);
      }
    });
  });

  describe('calculateRebalanceCost', () => {
    it('returns zeros for balanced portfolio', () => {
      const inventory = [
        makeCard({ id: '1', sport: 'Baseball', currentValue: 250 }),
        makeCard({ id: '2', sport: 'Basketball', currentValue: 250 }),
        makeCard({ id: '3', sport: 'Football', currentValue: 250 }),
        makeCard({ id: '4', sport: 'Hockey', currentValue: 150 }),
        makeCard({ id: '5', sport: 'Soccer', currentValue: 100 }),
      ];
      const cost = calculateRebalanceCost(inventory);
      expect(cost.totalCost).toBe(0);
      expect(cost.sellTransactionFees).toBe(0);
      expect(cost.buyTransactionFees).toBe(0);
    });

    it('calculates fees for imbalanced portfolio', () => {
      const inventory = [
        makeCard({ id: '1', sport: 'Baseball', currentValue: 900 }),
        makeCard({ id: '2', sport: 'Basketball', currentValue: 100 }),
      ];
      const cost = calculateRebalanceCost(inventory);
      expect(cost.totalCost).toBeGreaterThan(0);
      expect(cost.netRebalanceValue).toBeGreaterThan(0);
    });
  });

  describe('getPortfolioHealth', () => {
    it('returns perfect score for balanced portfolio', () => {
      const inventory = [
        makeCard({ id: '1', sport: 'Baseball', currentValue: 250 }),
        makeCard({ id: '2', sport: 'Basketball', currentValue: 250 }),
        makeCard({ id: '3', sport: 'Football', currentValue: 250 }),
        makeCard({ id: '4', sport: 'Hockey', currentValue: 150 }),
        makeCard({ id: '5', sport: 'Soccer', currentValue: 100 }),
      ];
      const health = getPortfolioHealth(inventory);
      expect(health.score).toBeGreaterThanOrEqual(90);
      expect(health.label).toBe('Excellent');
      expect(health.totalCards).toBe(5);
      expect(health.totalValue).toBe(1000);
    });

    it('returns low score for heavily imbalanced portfolio', () => {
      const inventory = [
        makeCard({ id: '1', sport: 'Baseball', currentValue: 1000 }),
      ];
      const health = getPortfolioHealth(inventory);
      expect(health.score).toBeLessThan(60);
      expect(health.totalCards).toBe(1);
    });

    it('returns health for empty inventory', () => {
      const health = getPortfolioHealth([]);
      expect(health.totalCards).toBe(0);
      expect(health.totalValue).toBe(0);
      // With 0 cards, all actual allocations are 0% which means large drift from targets
      expect(health.score).toBeLessThanOrEqual(100);
    });
  });

  describe('alert persistence', () => {
    it('saves and retrieves alert history', () => {
      const alerts = [
        { id: 'test-1', isAcknowledged: false } as any,
        { id: 'test-2', isAcknowledged: true } as any,
      ];
      saveAlertHistory(alerts);
      const retrieved = getAlertHistory();
      expect(retrieved).toHaveLength(2);
      expect(retrieved[0].id).toBe('test-1');
    });

    it('returns empty array when localStorage is empty', () => {
      expect(getAlertHistory()).toEqual([]);
    });

    it('acknowledges an alert by id', () => {
      saveAlertHistory([
        { id: 'alert-1', isAcknowledged: false } as any,
        { id: 'alert-2', isAcknowledged: false } as any,
      ]);
      const updated = acknowledgeAlert('alert-1');
      expect(updated.find(a => a.id === 'alert-1')!.isAcknowledged).toBe(true);
      expect(updated.find(a => a.id === 'alert-2')!.isAcknowledged).toBe(false);
    });

    it('persistAlerts merges new and existing alerts', () => {
      saveAlertHistory([
        { id: 'old-1', isAcknowledged: true } as any,
      ]);
      persistAlerts([
        { id: 'old-1', isAcknowledged: false } as any,
        { id: 'new-1', isAcknowledged: false } as any,
      ]);
      const history = getAlertHistory();
      // old-1 should retain acknowledged status
      expect(history.find(a => a.id === 'old-1')!.isAcknowledged).toBe(true);
      expect(history.find(a => a.id === 'new-1')!.isAcknowledged).toBe(false);
    });
  });
});
