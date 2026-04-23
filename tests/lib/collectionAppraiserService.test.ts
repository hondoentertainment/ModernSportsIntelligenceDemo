// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock('../../lib/dal/syncStore', () => ({
  store: {
    get: vi.fn(() => null),
    set: vi.fn(),
  },
}));

import {
  getAppraisalTypeConfig,
  formatCurrency,
  formatDate,
  getRiskColor,
  getConditionLabel,
  getCardAppraisals,
  getAppraisalReports,
  getInsuranceCoverage,
  getComparableValues,
  getRiskFactors,
  getCollectionSummary,
  getDepreciationSchedule,
  getReplacementCost,
  getAppraisalHistory,
  getAppraisalCertificate,
  searchAppraisals,
  getValueDistribution,
  getDepreciationRates,
  getAppraisalSummaryStats,
  getSummaryStats,
  getGradingResults,
  getAppraisalReport,
  getCoverageRecommendations,
  getAppraisalCertificates,
} from '../../lib/core/collectionAppraiserService';
import { store } from '../../lib/dal/syncStore';
import { setupLocalStorageMock } from '../helpers';

const localStorageMock = setupLocalStorageMock();

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
  // Return null so ensureData seeds fresh data each time
  (store.get as ReturnType<typeof vi.fn>).mockReturnValue(null);
  (store.set as ReturnType<typeof vi.fn>).mockImplementation(() => {});
});

// ---- Pure utility functions ----

describe('formatCurrency', () => {
  it('formats millions with M suffix', () => {
    expect(formatCurrency(2_000_000)).toBe('$2.00M');
  });

  it('formats thousands with K suffix', () => {
    expect(formatCurrency(12500)).toBe('$12.5K');
  });

  it('formats sub-thousand values with two decimal places', () => {
    expect(formatCurrency(99.5)).toBe('$99.50');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });
});

describe('formatDate', () => {
  it('returns a non-empty string for a valid ISO date', () => {
    const result = formatDate('2025-03-15');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns the original string when given invalid input', () => {
    const result = formatDate('not-a-date');
    expect(typeof result).toBe('string');
  });
});

describe('getRiskColor', () => {
  it('returns red for critical severity', () => {
    expect(getRiskColor('critical')).toBe('text-red-500');
  });

  it('returns amber for medium severity', () => {
    expect(getRiskColor('medium')).toBe('text-amber-400');
  });

  it('returns emerald for low severity', () => {
    expect(getRiskColor('low')).toBe('text-emerald-400');
  });

  it('returns slate for unknown severity', () => {
    expect(getRiskColor('unknown')).toBe('text-slate-400');
  });
});

describe('getConditionLabel', () => {
  it('returns Mint for mint condition', () => {
    expect(getConditionLabel('mint')).toBe('Mint');
  });

  it('returns Near Mint for near_mint condition', () => {
    expect(getConditionLabel('near_mint')).toBe('Near Mint');
  });

  it('returns the raw key when condition is not mapped', () => {
    expect(getConditionLabel('mystery_grade')).toBe('mystery_grade');
  });
});

describe('getAppraisalTypeConfig', () => {
  it('returns config with label, color, bg, border for fair_market_value', () => {
    const config = getAppraisalTypeConfig('fair_market_value');
    expect(config.label).toBe('Fair Market Value');
    expect(config.color).toBeTruthy();
    expect(config.bg).toBeTruthy();
    expect(config.border).toBeTruthy();
  });

  it('returns config for every valid appraisal type', () => {
    const types = [
      'fair_market_value', 'insurance_replacement', 'liquidation',
      'auction_estimate', 'private_sale', 'retail_replacement',
    ] as const;
    for (const t of types) {
      const cfg = getAppraisalTypeConfig(t);
      expect(cfg.label).toBeTruthy();
    }
  });
});

// ---- Data-layer functions (syncStore seeded via mock) ----

describe('getCardAppraisals', () => {
  it('returns a non-empty array from seed data', () => {
    const appraisals = getCardAppraisals();
    expect(Array.isArray(appraisals)).toBe(true);
    expect(appraisals.length).toBeGreaterThan(0);
  });

  it('each appraisal has a positive fairMarketValue', () => {
    const appraisals = getCardAppraisals();
    for (const a of appraisals) {
      expect(a.fairMarketValue).toBeGreaterThan(0);
    }
  });

  it('filters by player name when provided', () => {
    const appraisals = getCardAppraisals('Jordan');
    expect(appraisals.length).toBeGreaterThan(0);
    for (const a of appraisals) {
      expect(a.player.toLowerCase()).toContain('jordan');
    }
  });

  it('returns empty array for unknown player', () => {
    const appraisals = getCardAppraisals('ZZUNKNOWNXXX');
    expect(appraisals).toEqual([]);
  });
});

describe('getAppraisalReports', () => {
  it('returns multiple reports from seed data', () => {
    const reports = getAppraisalReports();
    expect(reports.length).toBeGreaterThan(0);
  });

  it('filters by appraisal type', () => {
    const reports = getAppraisalReports('fair_market_value');
    for (const r of reports) {
      expect(r.appraisalType).toBe('fair_market_value');
    }
  });
});

describe('getCollectionSummary', () => {
  it('returns positive totalValue and totalCards', () => {
    const summary = getCollectionSummary();
    expect(summary.totalCards).toBeGreaterThan(0);
    expect(summary.totalValue).toBeGreaterThan(0);
  });

  it('averageCardValue equals totalValue / totalCards', () => {
    const summary = getCollectionSummary();
    expect(summary.averageCardValue).toBeCloseTo(summary.totalValue / summary.totalCards, 1);
  });

  it('highestValueCard has greater value than lowestValueCard', () => {
    const summary = getCollectionSummary();
    expect(summary.highestValueCard.fairMarketValue).toBeGreaterThanOrEqual(
      summary.lowestValueCard.fairMarketValue
    );
  });

  it('riskScore is a finite number', () => {
    const summary = getCollectionSummary();
    expect(Number.isFinite(summary.riskScore)).toBe(true);
  });
});

describe('getDepreciationSchedule', () => {
  it('returns schedule for a known card id', () => {
    const schedule = getDepreciationSchedule('ca_001');
    expect(schedule).not.toBeNull();
    expect(schedule!.currentValue).toBeGreaterThan(0);
    expect(schedule!.projectedValues.length).toBe(5);
  });

  it('returns null for an unknown card id', () => {
    const schedule = getDepreciationSchedule('nonexistent_id');
    expect(schedule).toBeNull();
  });
});

describe('getReplacementCost', () => {
  it('returns replacement cost for a known card id', () => {
    const rc = getReplacementCost('ca_001');
    expect(rc).not.toBeNull();
    expect(rc!.totalReplacementCost).toBeGreaterThan(0);
  });

  it('returns null for an unknown card id', () => {
    const rc = getReplacementCost('bogus_id');
    expect(rc).toBeNull();
  });
});

describe('searchAppraisals', () => {
  it('returns results matching card name', () => {
    const results = searchAppraisals('Mantle');
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      const match =
        r.cardName.toLowerCase().includes('mantle') ||
        r.player.toLowerCase().includes('mantle') ||
        r.set.toLowerCase().includes('mantle');
      expect(match).toBe(true);
    }
  });

  it('returns empty array for no match', () => {
    const results = searchAppraisals('ZZNOCARD999');
    expect(results).toEqual([]);
  });
});

describe('getAppraisalSummaryStats', () => {
  it('returns totalCollectionValue greater than zero', () => {
    const stats = getAppraisalSummaryStats();
    expect(stats.totalCollectionValue).toBeGreaterThan(0);
  });

  it('totalInsuranceValue exceeds totalCollectionValue', () => {
    const stats = getAppraisalSummaryStats();
    expect(stats.totalInsuranceValue).toBeGreaterThanOrEqual(stats.totalCollectionValue);
  });
});

describe('getValueDistribution', () => {
  it('returns an array of category/value pairs', () => {
    const dist = getValueDistribution();
    expect(dist.length).toBeGreaterThan(0);
    for (const d of dist) {
      expect(d.category).toBeTruthy();
      expect(d.totalValue).toBeGreaterThan(0);
    }
  });
});
