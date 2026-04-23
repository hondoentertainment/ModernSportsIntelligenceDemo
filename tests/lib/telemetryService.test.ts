// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  recordMetric,
  incrementCounter,
  recordModelUsage,
  estimateGeminiCostUsd,
  getTelemetrySnapshot,
} from '../../lib/utils/telemetryService';
import { store } from '../../lib/dal/syncStore';

vi.mock('../../lib/dal/syncStore', () => ({
  store: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

describe('telemetryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(store.get).mockReturnValue([]);
  });

  describe('recordMetric', () => {
    it('records a metric sample', () => {
      recordMetric('test.metric', 100);
      expect(store.set).toHaveBeenCalled();
      const callArgs = vi.mocked(store.set).mock.calls[0];
      expect(callArgs[0]).toBe('msi_metrics_samples');
      expect(Array.isArray(callArgs[1])).toBe(true);
    });

    it('includes tags when provided', () => {
      recordMetric('test.metric', 100, { env: 'test' });
      expect(store.set).toHaveBeenCalled();
    });

    it('limits samples to MAX_SAMPLES', () => {
      const manySamples = Array.from({ length: 600 }, (_, i) => ({
        name: 'test',
        value: i,
        timestamp: new Date().toISOString(),
      }));
      vi.mocked(store.get).mockReturnValue(manySamples);
      recordMetric('test.metric', 100);
      const callArgs = vi.mocked(store.set).mock.calls[0];
      expect((callArgs[1] as any[]).length).toBeLessThanOrEqual(500);
    });
  });

  describe('incrementCounter', () => {
    it('increments a counter', () => {
      vi.mocked(store.get).mockReturnValue({});
      incrementCounter('test.counter');
      expect(store.set).toHaveBeenCalled();
      const callArgs = vi.mocked(store.set).mock.calls[0];
      expect(callArgs[0]).toBe('msi_metrics_counters');
      expect((callArgs[1] as Record<string, number>)['test.counter']).toBe(1);
    });

    it('increments by custom amount', () => {
      vi.mocked(store.get).mockReturnValue({ 'test.counter': 5 });
      incrementCounter('test.counter', 3);
      const callArgs = vi.mocked(store.set).mock.calls[0];
      expect((callArgs[1] as Record<string, number>)['test.counter']).toBe(8);
    });

    it('initializes counter at 0 if not exists', () => {
      vi.mocked(store.get).mockReturnValue({});
      incrementCounter('new.counter');
      const callArgs = vi.mocked(store.set).mock.calls[0];
      expect((callArgs[1] as Record<string, number>)['new.counter']).toBe(1);
    });
  });

  describe('recordModelUsage', () => {
    it('records model usage sample', () => {
      recordModelUsage({
        provider: 'gemini',
        model: 'gemini-1.5-flash',
        tokens: 1000,
        estimatedCostUsd: 0.00035,
        context: 'test',
      });
      expect(store.set).toHaveBeenCalled();
    });

    it('increments model calls counter', () => {
      vi.mocked(store.get).mockReturnValueOnce([]).mockReturnValueOnce({});
      recordModelUsage({
        provider: 'gemini',
        model: 'test-model',
        tokens: 1000,
        estimatedCostUsd: 0.00035,
      });
      expect(store.set).toHaveBeenCalledTimes(3); // usage, counter, metric
    });

    it('records cost metric', () => {
      vi.mocked(store.get).mockReturnValueOnce([]).mockReturnValueOnce({}).mockReturnValueOnce([]);
      recordModelUsage({
        provider: 'gemini',
        model: 'test-model',
        tokens: 1000,
        estimatedCostUsd: 0.00035,
      });
      // Should record cost metric
      expect(store.set).toHaveBeenCalled();
    });
  });

  describe('estimateGeminiCostUsd', () => {
    it('calculates cost correctly', () => {
      const cost = estimateGeminiCostUsd(1000000);
      expect(cost).toBeCloseTo(0.35, 5);
    });

    it('uses custom rate', () => {
      const cost = estimateGeminiCostUsd(1000000, 0.5);
      expect(cost).toBeCloseTo(0.5, 5);
    });

    it('rounds to 6 decimal places', () => {
      const cost = estimateGeminiCostUsd(1234567);
      const decimalPlaces = cost.toString().split('.')[1]?.length || 0;
      expect(decimalPlaces).toBeLessThanOrEqual(6);
    });
  });

  describe('getTelemetrySnapshot', () => {
    it('returns all telemetry data', () => {
      vi.mocked(store.get)
        .mockReturnValueOnce([{ name: 'test', value: 1, timestamp: '2024-01-01' }])
        .mockReturnValueOnce({ counter: 5 })
        .mockReturnValueOnce([{ provider: 'gemini', model: 'test', tokens: 100, estimatedCostUsd: 0.1, timestamp: '2024-01-01' }]);

      const snapshot = getTelemetrySnapshot();
      expect(snapshot).toHaveProperty('metrics');
      expect(snapshot).toHaveProperty('counters');
      expect(snapshot).toHaveProperty('modelUsage');
    });
  });
});
