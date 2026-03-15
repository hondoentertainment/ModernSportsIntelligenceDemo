import { beforeEach, describe, expect, it } from 'vitest';
import { estimateGeminiCostUsd, getTelemetrySnapshot, incrementCounter, recordMetric, recordModelUsage } from '../../lib/telemetryService';

describe('telemetryService', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('records metrics and counters', () => {
        recordMetric('sync.duration_ms', 120);
        incrementCounter('sync.total');
        const snapshot = getTelemetrySnapshot();
        expect(snapshot.metrics.length).toBe(1);
        expect(snapshot.counters['sync.total']).toBe(1);
    });

    it('records model usage with estimated cost', () => {
        const cost = estimateGeminiCostUsd(5000);
        recordModelUsage({ provider: 'gemini', model: 'gemini-3-flash-preview', tokens: 5000, estimatedCostUsd: cost, context: 'test' });
        const snapshot = getTelemetrySnapshot();
        expect(snapshot.modelUsage.length).toBe(1);
        expect(snapshot.modelUsage[0].estimatedCostUsd).toBe(cost);
    });
});
