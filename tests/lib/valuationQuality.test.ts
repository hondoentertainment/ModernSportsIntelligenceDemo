import { describe, it, expect } from 'vitest';
import { evaluateValuationQuality, attachValuationQuality } from '../../lib/analytics/valuationQuality';
import type { PricingAnalysis } from '../../types';

describe('valuationQuality', () => {
  describe('evaluateValuationQuality', () => {
    it('evaluates quality for fresh high-confidence analysis', () => {
      const analysis: PricingAnalysis = {
        estimatedValue: 100,
        low: 90,
        high: 110,
        avg: 100,
        confidence: 0.9,
        salesCount: 20,
        lastUpdated: new Date().toISOString(),
        valuationSource: 'ebay-api',
        valuationTimestamp: new Date().toISOString(),
      };
      const quality = evaluateValuationQuality(analysis);
      expect(quality.qualityScore).toBeGreaterThan(80);
      expect(quality.confidenceTier).toBe('High');
      expect(quality.isStale).toBe(false);
    });

    it('marks stale valuations', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      const analysis: PricingAnalysis = {
        estimatedValue: 100,
        low: 90,
        high: 110,
        avg: 100,
        confidence: 0.9,
        salesCount: 20,
        lastUpdated: threeDaysAgo,
        valuationTimestamp: threeDaysAgo,
      };
      const quality = evaluateValuationQuality(analysis);
      expect(quality.isStale).toBe(true);
      expect(quality.warnings).toContain('Valuation data is stale (>48h).');
    });

    it('warns about low sales depth', () => {
      const analysis: PricingAnalysis = {
        estimatedValue: 100,
        low: 90,
        high: 110,
        avg: 100,
        confidence: 0.9,
        salesCount: 2,
        lastUpdated: new Date().toISOString(),
        valuationTimestamp: new Date().toISOString(),
      };
      const quality = evaluateValuationQuality(analysis);
      expect(quality.warnings).toContain('Low sales depth may reduce reliability.');
    });

    it('warns about low confidence', () => {
      const analysis: PricingAnalysis = {
        estimatedValue: 100,
        low: 90,
        high: 110,
        avg: 100,
        confidence: 0.4,
        salesCount: 20,
        lastUpdated: new Date().toISOString(),
        valuationTimestamp: new Date().toISOString(),
      };
      const quality = evaluateValuationQuality(analysis);
      expect(quality.confidenceTier).toBe('Low');
      expect(quality.warnings).toContain('Model confidence is low.');
    });

    it('gives boost for eBay API source', () => {
      const analysis: PricingAnalysis = {
        estimatedValue: 100,
        low: 90,
        high: 110,
        avg: 100,
        confidence: 0.8,
        salesCount: 20,
        lastUpdated: new Date().toISOString(),
        valuationSource: 'ebay-api',
        valuationTimestamp: new Date().toISOString(),
      };
      const quality = evaluateValuationQuality(analysis);
      expect(quality.qualityScore).toBeGreaterThan(80);
    });

    it('gives boost for Gemini source', () => {
      const analysis: PricingAnalysis = {
        estimatedValue: 100,
        low: 90,
        high: 110,
        avg: 100,
        confidence: 0.8,
        salesCount: 20,
        lastUpdated: new Date().toISOString(),
        valuationSource: 'gemini',
        valuationTimestamp: new Date().toISOString(),
      };
      const quality = evaluateValuationQuality(analysis);
      expect(quality.qualityScore).toBeGreaterThan(70);
    });

    it('scores historical comps above Gemini at equal confidence/depth', () => {
      const base = {
        estimatedValue: 100,
        low: 90,
        high: 110,
        avg: 100,
        confidence: 0.8,
        salesCount: 20,
        lastUpdated: new Date().toISOString(),
        valuationTimestamp: new Date().toISOString(),
      } satisfies PricingAnalysis;

      const historical = evaluateValuationQuality({
        ...base,
        valuationSource: 'historical-comps',
      });
      const gemini = evaluateValuationQuality({
        ...base,
        valuationSource: 'gemini',
      });

      expect(historical.qualityScore).toBeGreaterThan(gemini.qualityScore);
    });

    it('handles missing confidence', () => {
      const analysis: PricingAnalysis = {
        estimatedValue: 100,
        low: 90,
        high: 110,
        avg: 100,
        salesCount: 20,
        lastUpdated: new Date().toISOString(),
        valuationTimestamp: new Date().toISOString(),
      };
      const quality = evaluateValuationQuality(analysis);
      expect(quality.confidenceTier).toBe('Low');
    });

    it('calculates freshness score correctly', () => {
      const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();
      const analysis: PricingAnalysis = {
        estimatedValue: 100,
        low: 90,
        high: 110,
        avg: 100,
        confidence: 0.8,
        salesCount: 20,
        lastUpdated: oneDayAgo,
        valuationTimestamp: oneDayAgo,
      };
      const quality = evaluateValuationQuality(analysis);
      expect(quality.freshnessHours).toBeLessThan(25);
    });

    it('treats invalid timestamps as stale (NaN date branch)', () => {
      const analysis: PricingAnalysis = {
        estimatedValue: 100,
        low: 90,
        high: 110,
        avg: 100,
        confidence: 0.8,
        salesCount: 20,
        lastUpdated: 'not-a-real-iso-date',
        valuationTimestamp: 'also-invalid',
      };
      const quality = evaluateValuationQuality(analysis);
      expect(quality.isStale).toBe(true);
    });
  });

  describe('attachValuationQuality', () => {
    it('attaches quality to analysis', () => {
      const analysis: PricingAnalysis = {
        estimatedValue: 100,
        low: 90,
        high: 110,
        avg: 100,
        confidence: 0.9,
        salesCount: 20,
        lastUpdated: new Date().toISOString(),
        valuationTimestamp: new Date().toISOString(),
      };
      const result = attachValuationQuality(analysis);
      expect(result.quality).toBeDefined();
      expect(result.quality?.qualityScore).toBeGreaterThan(0);
    });

    it('preserves all original analysis fields', () => {
      const analysis: PricingAnalysis = {
        estimatedValue: 100,
        low: 90,
        high: 110,
        avg: 100,
        confidence: 0.9,
        salesCount: 20,
        lastUpdated: new Date().toISOString(),
        valuationTimestamp: new Date().toISOString(),
      };
      const result = attachValuationQuality(analysis);
      expect(result.estimatedValue).toBe(100);
      expect(result.confidence).toBe(0.9);
    });
  });
});
