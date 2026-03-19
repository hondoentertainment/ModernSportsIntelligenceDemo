import { describe, expect, it } from 'vitest';
import { attachValuationQuality, evaluateValuationQuality } from '../../lib/analytics/valuationQuality';
import { PricingAnalysis } from '../../types';

describe('valuationQuality', () => {
    it('flags stale low-confidence valuations', () => {
        const analysis: PricingAnalysis = {
            estimatedValue: 100,
            low: 80,
            high: 120,
            avg: 100,
            confidence: 0.4,
            salesCount: 1,
            lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
            valuationSource: 'fallback'
        };

        const quality = evaluateValuationQuality(analysis, new Date());
        expect(quality.isStale).toBe(true);
        expect(quality.confidenceTier).toBe('Low');
        expect(quality.warnings.length).toBeGreaterThan(0);
    });

    it('attaches quality metadata to analysis', () => {
        const analysis: PricingAnalysis = {
            estimatedValue: 250,
            low: 220,
            high: 280,
            avg: 250,
            confidence: 0.9,
            salesCount: 14,
            lastUpdated: new Date().toISOString(),
            valuationSource: 'ebay-api'
        };

        const enriched = attachValuationQuality(analysis);
        expect(enriched.quality).toBeDefined();
        expect(enriched.quality?.qualityScore).toBeGreaterThan(70);
    });
});
