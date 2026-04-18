import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CardInventory } from '../../types';

vi.mock('../../lib/analytics/priceHistory', () => ({
  getCardHistory: vi.fn(),
  countImportedCompSnapshots: vi.fn(),
}));

import * as priceHistory from '../../lib/analytics/priceHistory';
import { forecastPriceTrajectory, resolveAlphaSignalSource } from '../../lib/analytics/predictiveAlpha';

function makeCard(overrides: Partial<CardInventory> = {}): CardInventory {
  return {
    id: 'card-zero-value',
    player: 'Test Player',
    year: 2024,
    set: 'Test Set',
    league: 'MLB',
    purchasePrice: 0,
    currentValue: 0,
    isGraded: false,
    isAutographed: false,
    status: 'active',
    ...overrides,
  } as CardInventory;
}

describe('predictiveAlpha', () => {
  beforeEach(() => {
    vi.mocked(priceHistory.getCardHistory).mockReturnValue([]);
    vi.mocked(priceHistory.countImportedCompSnapshots).mockReturnValue(0);
  });

  describe('resolveAlphaSignalSource', () => {
    it('returns historical_only when no imported comps', () => {
      expect(resolveAlphaSignalSource(20, 0)).toBe('historical_only');
    });

    it('returns hybrid when history is deep enough and comps exist', () => {
      expect(resolveAlphaSignalSource(4, 1)).toBe('hybrid');
      expect(resolveAlphaSignalSource(10, 2)).toBe('hybrid');
    });

    it('returns imported_comps when comps exist but history is thin', () => {
      expect(resolveAlphaSignalSource(0, 2)).toBe('imported_comps');
      expect(resolveAlphaSignalSource(3, 1)).toBe('imported_comps');
    });
  });

  describe('forecastPriceTrajectory', () => {
    it('returns stable low-confidence output when current value is missing', () => {
      const trajectory = forecastPriceTrajectory(makeCard());

      expect(trajectory.trajectory).toBe('stable');
      expect(Number.isFinite(trajectory.projections.days365)).toBe(true);
      expect(trajectory.catalysts[0]).toContain('Insufficient current valuation data');
      expect(trajectory.signalSource).toBe('historical_only');
      expect(trajectory.confidenceBreakdown.signalSource).toBe('historical_only');
      expect(trajectory.confidenceBreakdown.externalCompWeightPct).toBe(0);
    });

    it('uses hybrid signal and lifts confidence when imported comps and history exist', () => {
      vi.mocked(priceHistory.getCardHistory).mockReturnValue(
        [1, 2, 3, 4].map((i) => ({ timestamp: `2026-01-${10 + i}T12:00:00Z`, value: 100 + i * 2 }))
      );
      vi.mocked(priceHistory.countImportedCompSnapshots).mockReturnValue(2);

      const trajectory = forecastPriceTrajectory(
        makeCard({ id: 'blend-card', currentValue: 200, purchasePrice: 100, isGraded: true })
      );

      expect(trajectory.signalSource).toBe('hybrid');
      expect(trajectory.confidenceBreakdown.importedCompSnapshots).toBe(2);
      expect(trajectory.confidenceBreakdown.importedCompBonusPoints).toBeGreaterThan(0);
      expect(trajectory.confidenceBreakdown.externalCompWeightPct).toBeGreaterThan(0);
      expect(trajectory.confidenceBreakdown.sourceModelWeightPct).toBeLessThan(100);
      expect(trajectory.confidenceBreakdown.summaryLines.length).toBeGreaterThanOrEqual(3);
    });
  });
});
