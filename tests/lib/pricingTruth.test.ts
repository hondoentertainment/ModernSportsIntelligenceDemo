import { afterEach, describe, expect, it } from 'vitest';
import {
  CONFIDENCE_UNKNOWN_LABEL,
  PRICING_TRUTH_SOURCE_PRIORITY,
  PRICING_TRUTH_THRESHOLDS,
  assemblePricingTruth,
  buildPricingTruthForCard,
  buildPricingTruthForTarget,
  chipsFromPricingTruth,
  classifyLowLiquidity,
  classifySourceTier,
  classifyStaleData,
  honestSourceChip,
  resolveDisclosedConfidence,
} from '../../lib/pricing/pricingTruth';
import { selectPreferredValuation } from '../../lib/pricing/compConsensus';
import { resetFeatureFlags, setFeatureFlag } from '../../lib/featureFlags';
import type { CardInventory, TargetWatchlist } from '../../types';

const NOW = Date.parse('2026-09-10T12:00:00.000Z');

function sale(price: number, soldAt: string) {
  return { title: `Comp ${price}`, condition: 'Raw', price, soldAt };
}

function freshComps() {
  return [sale(240, '2026-08-20'), sale(260, '2026-08-22'), sale(250, '2026-08-25')];
}

afterEach(() => {
  setFeatureFlag('USE_REAL_EBAY', false);
  resetFeatureFlags();
});

describe('pricingTruth source priority', () => {
  it('discloses the eBay/sold → historical → AI order', () => {
    expect(PRICING_TRUTH_SOURCE_PRIORITY).toEqual([
      'ebay-sold-comps',
      'portfolio-historical-comps',
      'ai-estimate-fallback',
    ]);
    expect(PRICING_TRUTH_THRESHOLDS.valuationStaleAfterDays).toBe(7);
    expect(PRICING_TRUTH_THRESHOLDS.soldCompFreshWindowDays).toBe(90);
    expect(PRICING_TRUTH_THRESHOLDS.thinTapeMaxComps).toBe(2);
    expect(PRICING_TRUTH_THRESHOLDS.minCompsForConsensus).toBe(3);
    expect(PRICING_TRUTH_THRESHOLDS.lowLiquidityScoreBelow).toBe(40);
  });

  it('ranks sold-comp consensus above AI even when the live eBay flag is off', () => {
    setFeatureFlag('USE_REAL_EBAY', false);
    const preferred = selectPreferredValuation({
      salesData: freshComps(),
      aiEstimate: 900,
      storedValue: 880,
      storedSource: 'gemini',
      nowMs: NOW,
    });
    expect(classifySourceTier(preferred)).toBe('ebay-sold-comps');
    expect(honestSourceChip(preferred, false).label).toBe('Sold comps');
    expect(honestSourceChip(preferred, false).label).not.toMatch(/live/i);
  });

  it('labels ebay-api Live comps only when the real eBay flag is on', () => {
    const preferred = selectPreferredValuation({
      salesData: freshComps(),
      storedSource: 'ebay-api',
      nowMs: NOW,
    });
    expect(honestSourceChip(preferred, false).label).toBe('Sold comps');
    expect(honestSourceChip(preferred, true).label).toBe('Live comps');
  });

  it('ranks thin / historical tape above unlabeled AI', () => {
    const thin = selectPreferredValuation({
      salesData: [sale(175, '2026-08-15')],
      aiEstimate: 400,
      nowMs: NOW,
    });
    expect(classifySourceTier(thin)).toBe('portfolio-historical-comps');
    expect(honestSourceChip(thin).label).toBe('Thin sold comps');

    const ai = selectPreferredValuation({ aiEstimate: 400, nowMs: NOW });
    expect(classifySourceTier(ai)).toBe('ai-estimate-fallback');
    expect(honestSourceChip(ai).label).toBe('AI estimate');
  });
});

describe('pricingTruth stale + low-liquidity classifiers', () => {
  it('flags a 7-day valuation stamp as stale', () => {
    const preferred = selectPreferredValuation({ storedValue: 100, storedSource: 'gemini', nowMs: NOW });
    const stamp = classifyStaleData({
      preferred,
      timestamp: '2026-08-20T12:00:00.000Z',
      nowMs: NOW,
    });
    expect(stamp.stale).toBe(true);
    expect(stamp.staleReason).toBe('valuation-stamp');
    expect(stamp.staleLabel).toBe('Stale · 21d');
  });

  it('flags sold-comp tape with no 90-day clears as stale', () => {
    const preferred = selectPreferredValuation({
      salesData: [sale(100, '2026-04-01'), sale(110, '2026-04-10')],
      nowMs: NOW,
    });
    const tape = classifyStaleData({ preferred, nowMs: NOW });
    expect(preferred.stale).toBe(true);
    expect(tape.stale).toBe(true);
    expect(tape.staleReason).toBe('stale-comp-tape');
    expect(tape.staleLabel).toBe('Stale');
  });

  it('combines stamp + tape stale reasons', () => {
    const preferred = selectPreferredValuation({
      salesData: [sale(100, '2026-04-01')],
      nowMs: NOW,
    });
    const both = classifyStaleData({
      preferred,
      lastValuationDate: '2026-08-01',
      nowMs: NOW,
    });
    expect(both.staleReason).toBe('both');
    expect(both.staleLabel).toMatch(/Stale · \d+d/);
  });

  it('does not mark a fresh stamp + fresh consensus as stale', () => {
    const preferred = selectPreferredValuation({
      salesData: freshComps(),
      nowMs: NOW,
    });
    const fresh = classifyStaleData({
      preferred,
      timestamp: '2026-09-09T12:00:00.000Z',
      nowMs: NOW,
    });
    expect(fresh.stale).toBe(false);
    expect(fresh.staleLabel).toBeNull();
  });

  it('flags thin tape at ≤2 comps and low liquidity below score 40', () => {
    const thin = selectPreferredValuation({
      salesData: [sale(100, '2026-08-20')],
      nowMs: NOW,
    });
    const tape = classifyLowLiquidity({ preferred: thin });
    expect(tape.thinTape).toBe(true);
    expect(tape.lowLiquidity).toBe(true);
    expect(tape.lowLiquidityReasons).toContain('thin-tape');
    expect(tape.lowLiquidityLabel).toBe('Thin tape');

    const deep = selectPreferredValuation({ salesData: freshComps(), nowMs: NOW });
    const score = classifyLowLiquidity({ preferred: deep, liquidityScore: 39 });
    expect(score.thinTape).toBe(false);
    expect(score.lowLiquidityReasons).toEqual(['liquidity-score']);
    expect(score.lowLiquidityLabel).toBe('Low liquidity');

    const ok = classifyLowLiquidity({ preferred: deep, liquidityScore: 40 });
    expect(ok.lowLiquidity).toBe(false);
    expect(ok.lowLiquidityLabel).toBeNull();
  });
});

describe('pricingTruth disclosed confidence + provenance', () => {
  it('surfaces sold-comp formula confidence and discloses unknown on AI-only', () => {
    const consensus = selectPreferredValuation({ salesData: freshComps(), nowMs: NOW });
    const known = resolveDisclosedConfidence(consensus);
    expect(known.known).toBe(true);
    expect(known.label).toMatch(/% conf/);

    const ai = selectPreferredValuation({ aiEstimate: 400, nowMs: NOW });
    const unknown = resolveDisclosedConfidence(ai);
    expect(unknown.known).toBe(false);
    expect(unknown.value).toBeNull();
    expect(unknown.label).toBe(CONFIDENCE_UNKNOWN_LABEL);
  });

  it('uses a stored model score when present instead of inventing one', () => {
    const stored = selectPreferredValuation({ storedValue: 120, storedSource: 'gemini', nowMs: NOW });
    const resolved = resolveDisclosedConfidence(stored, 0.81);
    expect(resolved.known).toBe(true);
    expect(resolved.label).toBe('81% conf');
  });

  it('builds a compact provenance title with source, freshness, confidence, and comps count', () => {
    const preferred = selectPreferredValuation({
      salesData: freshComps(),
      nowMs: NOW,
    });
    const truth = assemblePricingTruth(preferred, {
      timestamp: '2026-09-10T06:00:00.000Z',
      nowMs: NOW,
    });
    expect(truth.sourceChip.label).toBe('Sold comps');
    expect(truth.title).toMatch(/Sold comps/);
    expect(truth.title).toMatch(/priced 6h ago/);
    expect(truth.title).toMatch(/% conf/);
    expect(truth.title).toMatch(/3 comps/);
    expect(truth.compCount).toBe(3);
    expect(truth.flags.stale).toBe(false);
  });

  it('prefers sold-comp marks on cards and targets over stored AI', () => {
    const card = {
      currentValue: 900,
      valuationSource: 'gemini' as const,
      valuationTimestamp: '2026-09-09T00:00:00.000Z',
      salesData: freshComps(),
    } satisfies Partial<CardInventory>;
    const cardTruth = buildPricingTruthForCard(card as CardInventory, NOW);
    expect(cardTruth.value).toBe(250);
    expect(cardTruth.sourceChip.label).toBe('Sold comps');
    expect(cardTruth.method).toBe('sold-comp-consensus');

    const target = {
      currentMarketPrice: 900,
      valuationSource: 'gemini' as const,
      valuationTimestamp: '2026-09-09T00:00:00.000Z',
      salesData: freshComps(),
    } satisfies Partial<TargetWatchlist>;
    const targetTruth = buildPricingTruthForTarget(target as TargetWatchlist, NOW);
    expect(targetTruth.value).toBe(250);
    expect(targetTruth.sourceChip.label).toBe('Sold comps');
  });

  it('labels stored marks, unavailable estimates, and stored historical comps honestly', () => {
    const stored = selectPreferredValuation({ storedValue: 80, storedSource: 'fallback', nowMs: NOW });
    expect(classifySourceTier(stored)).toBe('ai-estimate-fallback');
    expect(honestSourceChip(stored).label).toBe('Stored mark');

    const historicalStored = selectPreferredValuation({
      storedValue: 80,
      storedSource: 'historical-comps',
      nowMs: NOW,
    });
    expect(honestSourceChip(historicalStored).label).toBe('Historical comps');

    const none = selectPreferredValuation({ nowMs: NOW });
    expect(classifySourceTier(none)).toBe('unavailable');
    expect(honestSourceChip(none).label).toBe('Estimate');

    const assembled = assemblePricingTruth(none);
    const chips = chipsFromPricingTruth(assembled);
    expect(chips.compsCount).toBe(0);
    expect(chips.title).toMatch(/Estimate/);
    expect(chips.title).toMatch(CONFIDENCE_UNKNOWN_LABEL);
  });
});
