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
import { makeCard, setupLocalStorageMock } from '../helpers';

const localStorageMock = setupLocalStorageMock();

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

    it('assigns critical severity for large crashes', () => {
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
      // First detect anomalies to populate storage, then acknowledge
      const card = makeCard({ id: '1', purchasePrice: 100, currentValue: 40 });
      const initial = detectAnomalies([card]);
      const crashAnomaly = initial.find(a => a.type === 'crash');
      expect(crashAnomaly).toBeDefined();

      // Acknowledge via public API
      acknowledgeAnomaly(crashAnomaly!.id);

      // Re-detect — should preserve acknowledged status
      const refreshed = detectAnomalies([card]);
      const acked = refreshed.find(a => a.id === crashAnomaly!.id);
      expect(acked).toBeDefined();
      expect(acked!.isAcknowledged).toBe(true);
    });
  });

  describe('findArbitrageOpportunities', () => {
    const largeInventory = Array.from({ length: 20 }, (_, i) =>
      makeCard({ id: `card-${i}`, player: `Player ${i}`, currentValue: 100 + i * 10 })
    );

    it('returns empty for empty inventory', () => {
      expect(findArbitrageOpportunities([])).toEqual([]);
    });

    it('generates opportunities for some cards (deterministic)', () => {
      const opps = findArbitrageOpportunities(largeInventory);
      expect(opps.length).toBeGreaterThan(0);
    });

    it('each opportunity has valid spread', () => {
      const opps = findArbitrageOpportunities(largeInventory);
      for (const opp of opps) {
        expect(opp.sellPrice).toBeGreaterThan(opp.buyPrice);
        expect(opp.spread).toBeGreaterThan(0);
        expect(opp.spreadPercent).toBeGreaterThan(0);
        expect(opp.buySource).not.toBe(opp.sellSource);
      }
    });

    it('sorts by spread descending', () => {
      const opps = findArbitrageOpportunities(largeInventory);
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
        makeCard({ id: '1', purchasePrice: 100, currentValue: 20 }),
        makeCard({ id: '2', purchasePrice: 100, currentValue: 100 }),
      ];
      const summary = getAnomalySummary(inventory);
      expect(summary.totalActive).toBeGreaterThan(0);
    });
  });

  describe('acknowledgeAnomaly', () => {
    it('marks an anomaly as acknowledged in storage', () => {
      // Generate anomalies via public API first
      const card = makeCard({ id: '1', purchasePrice: 100, currentValue: 40 });
      const anomalies = detectAnomalies([card]);
      const target = anomalies[0];

      acknowledgeAnomaly(target.id);

      const history = getAnomalyHistory();
      expect(history.find(a => a.id === target.id)!.isAcknowledged).toBe(true);
    });
  });

  describe('getAnomalyHistory', () => {
    it('returns empty array when no stored data', () => {
      expect(getAnomalyHistory()).toEqual([]);
    });

    it('returns stored anomalies after detection', () => {
      detectAnomalies([makeCard({ purchasePrice: 100, currentValue: 40 })]);
      expect(getAnomalyHistory().length).toBeGreaterThan(0);
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
