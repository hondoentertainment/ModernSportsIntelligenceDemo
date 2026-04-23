// @ts-nocheck
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getCoverageHistory,
  trackCoverageHealthTransition,
} from '../../lib/utils/valuationCoverageAlerts';
import { store } from '../../lib/dal/syncStore';
import { incrementCounter, recordMetric } from '../../lib/utils/telemetryService';

vi.mock('../../lib/utils/telemetryService', () => ({
  incrementCounter: vi.fn(),
  recordMetric: vi.fn(),
}));

const INVENTORY_KEY = 'msi_valuation_coverage_health_v1:inventory';
const HISTORY_KEY = 'msi_valuation_coverage_history_v1';

describe('valuationCoverageAlerts', () => {
  beforeEach(() => {
    store.remove(INVENTORY_KEY);
    store.remove(HISTORY_KEY);
    vi.clearAllMocks();
  });

  it('emits degraded event on first degraded snapshot', () => {
    const result = trackCoverageHealthTransition('inventory', 60, 10, 95);
    expect(result.event).toBe('degraded');
    expect(result.status).toBe('degraded');
    expect(incrementCounter).toHaveBeenCalledWith('valuation.coverage.inventory.degraded');
    expect(recordMetric).toHaveBeenCalledWith(
      'valuation.coverage.transition',
      1,
      expect.objectContaining({ scope: 'inventory', event: 'degraded' }),
    );
  });

  it('does not emit when degraded state remains degraded', () => {
    trackCoverageHealthTransition('inventory', 60, 10, 95);
    const result = trackCoverageHealthTransition('inventory', 70, 10, 95);
    expect(result.event).toBeNull();
    expect(result.status).toBe('degraded');
    expect(incrementCounter).toHaveBeenCalledTimes(1);
  });

  it('emits recovered when crossing above target', () => {
    trackCoverageHealthTransition('inventory', 60, 10, 95);
    const result = trackCoverageHealthTransition('inventory', 96, 10, 95);
    expect(result.event).toBe('recovered');
    expect(result.status).toBe('healthy');
    expect(incrementCounter).toHaveBeenCalledWith('valuation.coverage.inventory.recovered');
  });

  it('clears persisted state when total is zero', () => {
    trackCoverageHealthTransition('inventory', 60, 10, 95);
    const result = trackCoverageHealthTransition('inventory', 0, 0, 95);
    expect(result.event).toBeNull();
    expect(result.status).toBeNull();
    expect(store.has(INVENTORY_KEY)).toBe(false);
  });

  it('persists hourly coverage history snapshots', () => {
    trackCoverageHealthTransition('inventory', 90, 10, 95);
    const history = getCoverageHistory('inventory');
    expect(history).toHaveLength(1);
    expect(history[0].coveragePct).toBe(90);
    expect(history[0].status).toBe('degraded');
  });
});
