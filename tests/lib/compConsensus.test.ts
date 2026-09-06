import { describe, expect, it } from 'vitest';
import {
  computeSoldCompConsensus,
  isFreshSoldComp,
  isThinCompSet,
  preferredValuationForCard,
  resolveAnalysisValue,
  selectPreferredValuation,
} from '../../lib/pricing/compConsensus';
import type { CardInventory, PricingAnalysis } from '../../types';

const NOW = Date.parse('2026-09-06T12:00:00.000Z');

function sale(price: number, soldAt: string) {
  return { price, soldAt };
}

describe('compConsensus selection + freshness', () => {
  it('treats comps sold within 90 days as fresh', () => {
    expect(isFreshSoldComp('2026-08-01', NOW)).toBe(true);
    expect(isFreshSoldComp('2026-05-01', NOW)).toBe(false);
    expect(isFreshSoldComp('not-a-date', NOW)).toBe(false);
  });

  it('flags thin tape at 1–2 usable comps', () => {
    expect(isThinCompSet([sale(100, '2026-08-01')])).toBe(true);
    expect(isThinCompSet([sale(100, '2026-08-01'), sale(110, '2026-08-02')])).toBe(true);
    expect(isThinCompSet([sale(100, '2026-08-01'), sale(110, '2026-08-02'), sale(120, '2026-08-03')])).toBe(false);
    expect(isThinCompSet([])).toBe(false);
  });

  it('computes median consensus and freshness counts', () => {
    const consensus = computeSoldCompConsensus(
      [sale(100, '2026-08-01'), sale(200, '2026-08-10'), sale(150, '2026-04-01')],
      NOW,
    );
    expect(consensus).not.toBeNull();
    expect(consensus?.median).toBe(150);
    expect(consensus?.count).toBe(3);
    expect(consensus?.freshCount).toBe(2);
    expect(consensus?.thin).toBe(false);
    expect(consensus?.stale).toBe(false);
  });

  it('prefers sold-comp consensus over an AI estimate when comps are fresh', () => {
    const preferred = selectPreferredValuation({
      salesData: [sale(240, '2026-08-20'), sale(260, '2026-08-22'), sale(250, '2026-08-25')],
      aiEstimate: 900,
      storedValue: 880,
      storedSource: 'gemini',
      nowMs: NOW,
    });
    expect(preferred.method).toBe('sold-comp-consensus');
    expect(preferred.source).toBe('historical-comps');
    expect(preferred.value).toBe(250);
    expect(preferred.thinMarket).toBe(false);
    expect(preferred.rationale).toMatch(/Median of 3 sold comps/);
  });

  it('keeps ebay-api as source when stored source is live and comps consensus', () => {
    const preferred = selectPreferredValuation({
      salesData: [sale(80, '2026-08-01'), sale(90, '2026-08-02'), sale(100, '2026-08-03')],
      storedSource: 'ebay-api',
      nowMs: NOW,
    });
    expect(preferred.source).toBe('ebay-api');
    expect(preferred.method).toBe('sold-comp-consensus');
  });

  it('uses thin-comp fallback with honest copy when tape is thin', () => {
    const preferred = selectPreferredValuation({
      salesData: [sale(175, '2026-08-15')],
      aiEstimate: 400,
      nowMs: NOW,
    });
    expect(preferred.method).toBe('thin-comp-fallback');
    expect(preferred.value).toBe(175);
    expect(preferred.thinMarket).toBe(true);
    expect(preferred.rationale).toMatch(/thin tape/i);
  });

  it('falls back to AI with demo/sample rationale when comps are missing', () => {
    const preferred = selectPreferredValuation({
      aiEstimate: 310,
      nowMs: NOW,
    });
    expect(preferred.method).toBe('ai-estimate');
    expect(preferred.source).toBe('gemini');
    expect(preferred.value).toBe(310);
    expect(preferred.rationale).toMatch(/demo\/sample/i);
  });

  it('resolves Gemini analysis that carries sold comps to the consensus mark', () => {
    const analysis: PricingAnalysis = {
      estimatedValue: 999,
      low: 100,
      high: 200,
      avg: 150,
      confidence: 0.3,
      salesCount: 3,
      lastUpdated: '2026-09-06T12:00:00.000Z',
      valuationSource: 'gemini',
      salesData: [
        { title: 'A', price: 120, condition: 'Raw', soldAt: '2026-08-01' },
        { title: 'B', price: 140, condition: 'Raw', soldAt: '2026-08-10' },
        { title: 'C', price: 130, condition: 'Raw', soldAt: '2026-08-20' },
      ],
    };
    const resolved = resolveAnalysisValue(analysis, NOW);
    expect(resolved.value).toBe(130);
    expect(resolved.source).toBe('historical-comps');
  });

  it('prefers comps on a card that still stores an AI mark', () => {
    const card = {
      currentValue: 800,
      valuationSource: 'gemini' as const,
      valuationTimestamp: '2026-09-01T00:00:00.000Z',
      salesData: [
        { title: 'A', price: 200, condition: 'Raw', soldAt: '2026-08-01' },
        { title: 'B', price: 220, condition: 'Raw', soldAt: '2026-08-08' },
        { title: 'C', price: 210, condition: 'Raw', soldAt: '2026-08-15' },
      ],
    } as Pick<CardInventory, 'currentValue' | 'valuationSource' | 'valuationTimestamp' | 'salesData'>;
    const preferred = preferredValuationForCard(card, NOW);
    expect(preferred.method).toBe('sold-comp-consensus');
    expect(preferred.value).toBe(210);
  });
});
