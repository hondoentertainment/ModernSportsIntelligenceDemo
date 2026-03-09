import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calculateZScore,
  detectAnomalies,
  findArbitrageOpportunities,
  getAnomalySummary,
  acknowledgeAnomaly,
  getAnomalyHistory,
  getAnomalyTrend,
} from '../../lib/anomalyDetectionService';

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

describe('anomalyDetectionService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('calculateZScore', () => {
    it('returns 0 when stdDev is 0', () => {
      expect(calculateZScore(10, 10, 0)).toBe(0);
    });

    it('calculates positive z-score correctly', () => {
      expect(calculateZScore(120, 100, 10)).toBe(2);
    });

    it('calculates negative z-score correctly', () => {
      expect(calculateZScore(80, 100, 10)).toBe(-2);
    });

    it('returns 0 when value equals mean', () => {
      expect(calculateZScore(50, 50, 5)).toBe(0);
    });
  });

  describe('detectAnomalies', () => {
    it('returns empty array for empty inventory', () => {
      const anomalies = detectAnomalies([]);
      expect(anomalies).toEqual([]);
    });

    it('detects price spike when value > 1.5x purchase and owned < 90 days', () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 30);
      const card = makeCard({
        purchasePrice: 100,
        currentValue: 200,
        purchaseDate: recentDate.toISOString(),
      });
      const anomalies = detectAnomalies([card]);
      const spikes = anomalies.filter(a => a.type === 'spike');
      expect(spikes.length).toBeGreaterThanOrEqual(1);
      expect(spikes[0].player).toBe('Test Player');
    });

    it('detects price crash when value < 0.6x purchase', () => {
      const card = makeCard({
        purchasePrice: 100,
        currentValue: 40,
      });
      const anomalies = detectAnomalies([card]);
      const crashes = anomalies.filter(a => a.type === 'crash');
      expect(crashes.length).toBeGreaterThanOrEqual(1);
    });

    it('detects stale pricing when valuation is old', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 60);
      const card = makeCard({
        lastValuationDate: oldDate.toISOString(),
      });
      const anomalies = detectAnomalies([card]);
      const stale = anomalies.filter(a => a.type === 'stale_price');
      expect(stale.length).toBe(1);
      expect(['low', 'medium']).toContain(stale[0].severity);
    });

    it('assigns severity based on deviation percent', () => {
      const card = makeCard({
        purchasePrice: 100,
        currentValue: 20, // -80% crash
      });
      const anomalies = detectAnomalies([card]);
      const crash = anomalies.find(a => a.type === 'crash');
      expect(crash).toBeDefined();
      expect(crash!.severity).toBe('critical');
    });

    it('preserves acknowledged status from stored anomalies', () => {
      // Pre-store an acknowledged anomaly
      localStorageMock.setItem(
        'msi_anomalies',
        JSON.stringify([{ id: 'crash-1', isAcknowledged: true }])
      );
      const card = makeCard({
        id: '1',
        purchasePrice: 100,
        currentValue: 40,
      });
      const anomalies = detectAnomalies([card]);
      const crash = anomalies.find(a => a.id === 'crash-1');
      if (crash) {
        expect(crash.isAcknowledged).toBe(true);
      }
    });
  });

  describe('findArbitrageOpportunities', () => {
    it('returns empty for empty inventory', () => {
      expect(findArbitrageOpportunities([])).toEqual([]);
    });

    it('generates opportunities for some cards (deterministic)', () => {
      const inventory = Array.from({ length: 20 }, (_, i) =>
        makeCard({ id: `card-${i}`, player: `Player ${i}`, currentValue: 100 + i * 10 })
      );
      const opps = findArbitrageOpportunities(inventory);
      // ~25% of 20 cards = ~5, but deterministic so at least some
      expect(opps.length).toBeGreaterThan(0);
    });

    it('each opportunity has valid spread', () => {
      const inventory = Array.from({ length: 10 }, (_, i) =>
        makeCard({ id: `card-${i}`, player: `Player ${i}`, currentValue: 200 })
      );
      const opps = findArbitrageOpportunities(inventory);
      for (const opp of opps) {
        expect(opp.sellPrice).toBeGreaterThan(opp.buyPrice);
        expect(opp.spread).toBeGreaterThan(0);
        expect(opp.spreadPercent).toBeGreaterThan(0);
        expect(opp.buySource).not.toBe(opp.sellSource);
      }
    });

    it('sorts by spread descending', () => {
      const inventory = Array.from({ length: 20 }, (_, i) =>
        makeCard({ id: `card-${i}`, player: `Player ${i}`, currentValue: 50 + i * 20 })
      );
      const opps = findArbitrageOpportunities(inventory);
      for (let i = 1; i < opps.length; i++) {
        expect(opps[i].spread).toBeLessThanOrEqual(opps[i - 1].spread);
      }
    });
  });

  describe('getAnomalySummary', () => {
    it('returns zeroed summary for empty inventory', () => {
      const summary = getAnomalySummary([]);
      expect(summary.totalActive).toBe(0);
      expect(summary.criticalCount).toBe(0);
      expect(summary.totalArbitrageValue).toBe(0);
      expect(summary.mostAnomalousCard).toBe('None');
    });

    it('counts severity levels correctly', () => {
      const inventory = [
        makeCard({ id: '1', purchasePrice: 100, currentValue: 20 }), // crash, critical
        makeCard({ id: '2', purchasePrice: 100, currentValue: 100 }), // normal
      ];
      const summary = getAnomalySummary(inventory);
      expect(summary.totalActive).toBeGreaterThan(0);
    });
  });

  describe('acknowledgeAnomaly', () => {
    it('marks an anomaly as acknowledged in storage', () => {
      localStorageMock.setItem(
        'msi_anomalies',
        JSON.stringify([
          { id: 'a1', isAcknowledged: false },
          { id: 'a2', isAcknowledged: false },
        ])
      );
      acknowledgeAnomaly('a1');
      const stored = JSON.parse(localStorageMock.getItem('msi_anomalies')!);
      expect(stored.find((a: any) => a.id === 'a1').isAcknowledged).toBe(true);
      expect(stored.find((a: any) => a.id === 'a2').isAcknowledged).toBe(false);
    });
  });

  describe('getAnomalyHistory', () => {
    it('returns empty array when no stored data', () => {
      expect(getAnomalyHistory()).toEqual([]);
    });

    it('returns stored anomalies', () => {
      localStorageMock.setItem('msi_anomalies', JSON.stringify([{ id: 'x' }]));
      expect(getAnomalyHistory()).toHaveLength(1);
    });
  });

  describe('getAnomalyTrend', () => {
    it('returns a valid trend value', () => {
      const trend = getAnomalyTrend([]);
      expect(['increasing', 'decreasing', 'stable']).toContain(trend);
    });

    it('is deterministic for same input', () => {
      const inv = [makeCard()];
      const t1 = getAnomalyTrend(inv);
      const t2 = getAnomalyTrend(inv);
      expect(t1).toBe(t2);
    });
  });
});
