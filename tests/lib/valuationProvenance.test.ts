import { describe, expect, it } from 'vitest';
import type { CardInventory, PricingAnalysis, TargetWatchlist } from '../../types';
import {
  applyPricingAnalysisToCard,
  applyPricingAnalysisToTarget,
  computeFreshVerifiableCoverage,
  hasFreshVerifiableValuation,
  sortByVerifiableRefreshPriority,
  getValuationSourceChipForCard,
  getValuationSourceChipForTarget,
  valuationSourceToBadgeVariant,
  valuationBadgeVariantForEntity,
} from '../../lib/utils/valuationProvenance';

function makeCard(overrides: Partial<CardInventory> = {}): CardInventory {
  return {
    id: 'card-1',
    player: 'Test Player',
    year: 2024,
    manufacturer: 'Topps',
    cardNumber: '1',
    set: 'Chrome',
    sport: 'Baseball',
    league: 'MLB',
    isAutographed: false,
    condition: 'Near Mint',
    isGraded: false,
    purchasePrice: 100,
    purchaseDate: '2026-03-01',
    ...overrides,
  };
}

function makeTarget(overrides: Partial<TargetWatchlist> = {}): TargetWatchlist {
  return {
    id: 'target-1',
    player: 'Target Player',
    cardDescription: '2024 Chrome #1',
    priority: 'High',
    targetPrice: 120,
    sport: 'Baseball',
    league: 'MLB',
    status: 'active',
    createdAt: '2026-03-01T00:00:00.000Z',
    ...overrides,
  };
}

function makeAnalysis(overrides: Partial<PricingAnalysis> = {}): PricingAnalysis {
  return {
    estimatedValue: 150,
    low: 120,
    high: 180,
    avg: 150,
    confidence: 0.8,
    salesCount: 8,
    lastUpdated: '2026-03-26T10:00:00.000Z',
    valuationTimestamp: '2026-03-26T10:00:00.000Z',
    valuationSource: 'gemini',
    ...overrides,
  };
}

describe('valuationProvenance', () => {
  it('keeps higher-priority eBay valuation over fresh AI valuation', () => {
    const card = makeCard({
      currentValue: 400,
      valuationSource: 'ebay-api',
      valuationTimestamp: '2026-03-26T11:00:00.000Z',
      lastValuationDate: '2026-03-26T11:00:00.000Z',
    });
    const analysis = makeAnalysis({
      estimatedValue: 200,
      valuationSource: 'gemini',
      valuationTimestamp: '2026-03-26T11:05:00.000Z',
      lastUpdated: '2026-03-26T11:05:00.000Z',
    });

    const next = applyPricingAnalysisToCard(card, analysis, Date.parse('2026-03-26T11:06:00.000Z'));
    expect(next.currentValue).toBe(400);
    expect(next.valuationSource).toBe('ebay-api');
  });

  it('upgrades to higher-priority source when incoming is eBay', () => {
    const card = makeCard({
      currentValue: 180,
      valuationSource: 'gemini',
      valuationTimestamp: '2026-03-26T09:00:00.000Z',
    });
    const analysis = makeAnalysis({
      estimatedValue: 260,
      valuationSource: 'ebay-api',
      valuationTimestamp: '2026-03-26T10:00:00.000Z',
      lastUpdated: '2026-03-26T10:00:00.000Z',
    });

    const next = applyPricingAnalysisToCard(card, analysis);
    expect(next.currentValue).toBe(260);
    expect(next.valuationSource).toBe('ebay-api');
  });

  it('allows lower-priority source when existing valuation is stale', () => {
    const card = makeCard({
      currentValue: 500,
      valuationSource: 'ebay-api',
      valuationTimestamp: '2026-03-10T00:00:00.000Z',
    });
    const analysis = makeAnalysis({
      estimatedValue: 420,
      valuationSource: 'gemini',
      valuationTimestamp: '2026-03-26T10:00:00.000Z',
      lastUpdated: '2026-03-26T10:00:00.000Z',
    });

    const next = applyPricingAnalysisToCard(card, analysis, Date.parse('2026-03-26T10:01:00.000Z'));
    expect(next.currentValue).toBe(420);
    expect(next.valuationSource).toBe('gemini');
  });

  it('does not downgrade to stale lower-priority valuation even when existing is stale', () => {
    const card = makeCard({
      currentValue: 500,
      valuationSource: 'ebay-api',
      valuationTimestamp: '2026-03-10T00:00:00.000Z',
    });
    const analysis = makeAnalysis({
      estimatedValue: 420,
      valuationSource: 'gemini',
      valuationTimestamp: '2026-03-15T00:00:00.000Z',
      lastUpdated: '2026-03-15T00:00:00.000Z',
    });

    const next = applyPricingAnalysisToCard(card, analysis, Date.parse('2026-03-26T10:01:00.000Z'));
    expect(next.currentValue).toBe(500);
    expect(next.valuationSource).toBe('ebay-api');
  });

  it('updates watchlist targets with provenance fields', () => {
    const target = makeTarget({
      valuationSource: 'fallback',
      valuationTimestamp: '2026-03-20T00:00:00.000Z',
    });
    const analysis = makeAnalysis({
      estimatedValue: 95,
      valuationSource: 'ebay-api',
      valuationTimestamp: '2026-03-26T10:00:00.000Z',
      lastUpdated: '2026-03-26T10:00:00.000Z',
    });

    const next = applyPricingAnalysisToTarget(target, analysis);
    expect(next.currentMarketPrice).toBe(95);
    expect(next.valuationSource).toBe('ebay-api');
    expect(next.valuationTimestamp).toBe('2026-03-26T10:00:00.000Z');
  });

  it('uses normalized incoming timestamp as card lastValuationDate', () => {
    const card = makeCard({
      lastValuationDate: '2026-03-20T00:00:00.000Z',
    });
    const analysis = makeAnalysis({
      valuationSource: 'ebay-api',
      valuationTimestamp: '2026-03-26T12:00:00.000Z',
      lastUpdated: '2026-03-21T00:00:00.000Z',
    });
    const next = applyPricingAnalysisToCard(card, analysis);
    expect(next.lastValuationDate).toBe('2026-03-26T12:00:00.000Z');
  });

  it('renders historical comps chip when source missing but comps exist', () => {
    const chip = getValuationSourceChipForCard({
      salesData: [
        { title: 'A', price: 1, condition: 'Raw', soldAt: '2026-03-01' },
        { title: 'B', price: 2, condition: 'Raw', soldAt: '2026-03-02' },
        { title: 'C', price: 3, condition: 'Raw', soldAt: '2026-03-03' },
      ],
      valuationSource: undefined,
    });
    expect(chip.label).toBe('Historical comps');
  });

  it('renders live comps chip for eBay-backed target valuations', () => {
    const chip = getValuationSourceChipForTarget({
      valuationSource: 'ebay-api',
      salesData: [],
    });
    expect(chip.label).toBe('Live comps');
  });

  it('detects fresh verifiable valuations and computes coverage', () => {
    const nowMs = Date.parse('2026-03-27T00:00:00.000Z');
    const entities = [
      {
        valuationSource: 'ebay-api' as const,
        valuationTimestamp: '2026-03-26T08:00:00.000Z',
        lastValuationDate: undefined,
        salesData: [],
      },
      {
        valuationSource: 'gemini' as const,
        valuationTimestamp: '2026-03-26T08:00:00.000Z',
        lastValuationDate: undefined,
        salesData: [],
      },
      {
        valuationSource: undefined,
        valuationTimestamp: '2026-03-01T08:00:00.000Z',
        lastValuationDate: undefined,
        salesData: [
          { title: 'A', price: 1, condition: 'Raw', soldAt: '2026-02-20' },
          { title: 'B', price: 2, condition: 'Raw', soldAt: '2026-02-21' },
          { title: 'C', price: 3, condition: 'Raw', soldAt: '2026-02-22' },
        ],
      },
    ];

    expect(hasFreshVerifiableValuation(entities[0], nowMs)).toBe(true);
    expect(hasFreshVerifiableValuation(entities[1], nowMs)).toBe(false);
    expect(hasFreshVerifiableValuation(entities[2], nowMs)).toBe(false);

    const coverage = computeFreshVerifiableCoverage(entities, nowMs);
    expect(coverage.total).toBe(3);
    expect(coverage.covered).toBe(1);
    expect(coverage.coveragePct).toBe(33);
  });

  it('prioritizes stale and non-verifiable entities first', () => {
    const nowMs = Date.parse('2026-03-27T00:00:00.000Z');
    const sorted = sortByVerifiableRefreshPriority(
      [
        {
          id: 'fresh-ebay',
          valuationSource: 'ebay-api' as const,
          valuationTimestamp: '2026-03-26T20:00:00.000Z',
        },
        {
          id: 'stale-gemini',
          valuationSource: 'gemini' as const,
          valuationTimestamp: '2026-03-10T20:00:00.000Z',
        },
        {
          id: 'fresh-gemini',
          valuationSource: 'gemini' as const,
          valuationTimestamp: '2026-03-26T20:00:00.000Z',
        },
      ],
      nowMs,
    );
    expect(sorted[0].id).toBe('stale-gemini');
    expect(sorted[1].id).toBe('fresh-gemini');
    expect(sorted[2].id).toBe('fresh-ebay');
  });
});

describe('valuationSourceToBadgeVariant', () => {
  const NOW = Date.parse('2026-03-27T00:00:00.000Z');

  it('returns "live" for fresh ebay-api valuations', () => {
    expect(
      valuationSourceToBadgeVariant('ebay-api', '2026-03-26T20:00:00.000Z', NOW),
    ).toBe('live');
  });

  it('returns "stale" for ebay-api valuations older than 7 days', () => {
    expect(
      valuationSourceToBadgeVariant('ebay-api', '2026-03-19T00:00:00.000Z', NOW),
    ).toBe('stale');
  });

  it('returns "live" for fresh historical-comps valuations', () => {
    expect(
      valuationSourceToBadgeVariant(
        'historical-comps',
        '2026-03-26T12:00:00.000Z',
        NOW,
      ),
    ).toBe('live');
  });

  it('returns "sample" for gemini regardless of timestamp freshness', () => {
    expect(
      valuationSourceToBadgeVariant('gemini', '2026-03-26T12:00:00.000Z', NOW),
    ).toBe('sample');
    expect(
      valuationSourceToBadgeVariant('gemini', '2025-01-01T00:00:00.000Z', NOW),
    ).toBe('sample');
    expect(valuationSourceToBadgeVariant('gemini', undefined, NOW)).toBe('sample');
  });

  it('returns "mock" for undefined or fallback sources', () => {
    expect(valuationSourceToBadgeVariant(undefined, undefined, NOW)).toBe('mock');
    expect(
      valuationSourceToBadgeVariant('fallback', '2026-03-26T20:00:00.000Z', NOW),
    ).toBe('mock');
  });

  it('returns "stale" for verifiable sources with missing or invalid timestamp', () => {
    expect(valuationSourceToBadgeVariant('ebay-api', undefined, NOW)).toBe('stale');
    expect(valuationSourceToBadgeVariant('ebay-api', 'not-a-date', NOW)).toBe(
      'stale',
    );
    expect(
      valuationSourceToBadgeVariant('historical-comps', undefined, NOW),
    ).toBe('stale');
  });
});

describe('valuationBadgeVariantForEntity', () => {
  const NOW = Date.parse('2026-03-27T00:00:00.000Z');

  it('falls back to lastValuationDate when valuationTimestamp is missing', () => {
    expect(
      valuationBadgeVariantForEntity(
        {
          valuationSource: 'ebay-api',
          lastValuationDate: '2026-03-26T20:00:00.000Z',
        },
        NOW,
      ),
    ).toBe('live');

    expect(
      valuationBadgeVariantForEntity(
        {
          valuationSource: 'ebay-api',
          lastValuationDate: '2026-03-10T00:00:00.000Z',
        },
        NOW,
      ),
    ).toBe('stale');
  });
});
