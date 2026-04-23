// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../lib/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

import {
  estimatePremium,
  createPolicy,
  updateCoverage,
  getCoverageRecommendations,
  getInsurancePolicies,
  getAppraisalHistory,
  generateAppraisalReport,
  getCollectionValuationSummary,
  getClaims,
  fileClaim,
  getClaimDocuments,
} from '../../lib/core/insuranceAppraisalService';

// ---- estimatePremium ----

describe('estimatePremium', () => {
  it('returns a positive annualPremium for a valid value and level', () => {
    const estimate = estimatePremium(100000, 'standard');
    expect(estimate.annualPremium).toBeGreaterThan(0);
  });

  it('monthlyPremium is approximately annualPremium / 12', () => {
    const estimate = estimatePremium(120000, 'premium');
    expect(estimate.monthlyPremium).toBeCloseTo(estimate.annualPremium / 12, 0);
  });

  it('coverageAmount matches the input value', () => {
    const value = 250000;
    const estimate = estimatePremium(value, 'basic');
    expect(estimate.coverageAmount).toBe(value);
  });

  it('institutional rate is higher than basic rate', () => {
    const value = 100000;
    const basic = estimatePremium(value, 'basic');
    const institutional = estimatePremium(value, 'institutional');
    expect(institutional.annualPremium).toBeGreaterThan(basic.annualPremium);
  });

  it('features array is non-empty for all coverage levels', () => {
    const levels = ['basic', 'standard', 'premium', 'institutional'] as const;
    for (const level of levels) {
      const est = estimatePremium(50000, level);
      expect(est.features.length).toBeGreaterThan(0);
    }
  });

  it('ratePerThousand is positive', () => {
    const estimate = estimatePremium(10000, 'premium');
    expect(estimate.ratePerThousand).toBeGreaterThan(0);
  });
});

// ---- createPolicy ----

describe('createPolicy', () => {
  it('creates a policy with status pending', () => {
    const policy = createPolicy({ coverageLevel: 'standard', coverageAmount: 50000 });
    expect(policy.status).toBe('pending');
  });

  it('annualPremium is greater than zero', () => {
    const policy = createPolicy({ coverageLevel: 'premium', coverageAmount: 200000 });
    expect(policy.annualPremium).toBeGreaterThan(0);
  });

  it('deductible for institutional level is zero', () => {
    const policy = createPolicy({ coverageLevel: 'institutional', coverageAmount: 500000 });
    expect(policy.deductible).toBe(0);
  });

  it('coverageAmount matches config input', () => {
    const policy = createPolicy({ coverageLevel: 'basic', coverageAmount: 75000 });
    expect(policy.coverageAmount).toBe(75000);
  });

  it('policyNumber is a non-empty string', () => {
    const policy = createPolicy({ coverageLevel: 'standard', coverageAmount: 30000 });
    expect(typeof policy.policyNumber).toBe('string');
    expect(policy.policyNumber.length).toBeGreaterThan(0);
  });

  it('autoRenew defaults to true', () => {
    const policy = createPolicy({ coverageLevel: 'basic', coverageAmount: 10000 });
    expect(policy.autoRenew).toBe(true);
  });
});

// ---- updateCoverage ----

describe('updateCoverage', () => {
  it('updates coverageAmount when adjustment type is increase_coverage', () => {
    const newAmount = 900000;
    const updated = updateCoverage('pol-001', {
      type: 'increase_coverage',
      newValue: newAmount,
      reason: 'Portfolio grew',
      effectiveDate: '2026-06-01',
    });
    expect(updated.coverageAmount).toBe(newAmount);
    expect(updated.annualPremium).toBeGreaterThan(0);
  });

  it('updates deductible when type is change_deductible', () => {
    const updated = updateCoverage('pol-001', {
      type: 'change_deductible',
      newValue: 250,
      reason: 'Lower risk tolerance',
      effectiveDate: '2026-06-01',
    });
    expect(updated.deductible).toBe(250);
  });

  it('updates coverageLevel when type is change_level', () => {
    const updated = updateCoverage('pol-001', {
      type: 'change_level',
      newLevel: 'institutional',
      reason: 'Upgrade coverage',
      effectiveDate: '2026-06-01',
    });
    expect(updated.coverageLevel).toBe('institutional');
    expect(updated.deductible).toBe(0);
  });
});

// ---- getCoverageRecommendations ----

describe('getCoverageRecommendations', () => {
  it('returns at least one recommendation', () => {
    const recs = getCoverageRecommendations(1000000);
    expect(recs.length).toBeGreaterThan(0);
  });

  it('recommends covering a gap when portfolioValue exceeds total coverage', () => {
    const recs = getCoverageRecommendations(99999999);
    const gapRec = recs.find(r => r.type === 'increase_coverage');
    expect(gapRec).toBeDefined();
    expect(gapRec!.priority).toBe('critical');
  });

  it('each recommendation has a title and reason', () => {
    const recs = getCoverageRecommendations(500000);
    for (const r of recs) {
      expect(r.title).toBeTruthy();
      expect(r.reason).toBeTruthy();
    }
  });
});

// ---- getInsurancePolicies ----

describe('getInsurancePolicies', () => {
  it('returns mock policies array', () => {
    const policies = getInsurancePolicies();
    expect(Array.isArray(policies)).toBe(true);
    expect(policies.length).toBeGreaterThan(0);
  });

  it('each policy has a positive coverageAmount', () => {
    const policies = getInsurancePolicies();
    for (const p of policies) {
      expect(p.coverageAmount).toBeGreaterThan(0);
    }
  });

  it('includes at least one active policy', () => {
    const policies = getInsurancePolicies();
    const active = policies.filter(p => p.status === 'active');
    expect(active.length).toBeGreaterThan(0);
  });
});

// ---- generateAppraisalReport ----

describe('generateAppraisalReport', () => {
  it('returns report with positive totalFairMarketValue for non-empty items', () => {
    const report = generateAppraisalReport([
      { name: 'Test Card', currentValue: 5000, grade: 'PSA 10', grader: 'PSA' },
    ]);
    expect(report.totalFairMarketValue).toBeGreaterThan(0);
  });

  it('totalReplacementValue exceeds totalFairMarketValue', () => {
    const report = generateAppraisalReport([{ name: 'Card A', currentValue: 10000 }]);
    expect(report.totalReplacementValue).toBeGreaterThan(report.totalFairMarketValue);
  });

  it('uses seed items when passed empty array', () => {
    const report = generateAppraisalReport([]);
    expect(report.lineItems.length).toBeGreaterThan(0);
    expect(report.totalFairMarketValue).toBeGreaterThan(0);
  });

  it('report status is finalized', () => {
    const report = generateAppraisalReport([{ name: 'Card B', currentValue: 3000 }]);
    expect(report.status).toBe('finalized');
  });

  it('certification is USPAP compliant', () => {
    const report = generateAppraisalReport([{ name: 'Card C', currentValue: 2000 }]);
    expect(report.certification.uspap).toBe(true);
    expect(report.certification.irsCompliant).toBe(true);
  });
});

// ---- getCollectionValuationSummary ----

describe('getCollectionValuationSummary', () => {
  it('coverageRatio is between 0 and 1', () => {
    const summary = getCollectionValuationSummary();
    expect(summary.coverageRatio).toBeGreaterThan(0);
    expect(summary.coverageRatio).toBeLessThanOrEqual(1);
  });

  it('coverageGap equals totalFMV minus totalInsuredValue', () => {
    const summary = getCollectionValuationSummary();
    expect(summary.coverageGap).toBe(summary.totalFairMarketValue - summary.totalInsuredValue);
  });
});

// ---- fileClaim ----

describe('fileClaim', () => {
  it('returns a claim with status filed', () => {
    const claim = fileClaim('pol-001', { claimAmount: 5000, description: 'Water damage' });
    expect(claim.status).toBe('filed');
  });

  it('claimAmount matches the provided value', () => {
    const claim = fileClaim('pol-001', { claimAmount: 12000, description: 'Theft' });
    expect(claim.claimAmount).toBe(12000);
  });

  it('required documents are present in a new claim', () => {
    const claim = fileClaim('pol-001', { claimAmount: 3000, description: 'Fire' });
    expect(claim.documents.length).toBeGreaterThan(0);
    const required = claim.documents.filter(d => d.status === 'required');
    expect(required.length).toBeGreaterThan(0);
  });
});
