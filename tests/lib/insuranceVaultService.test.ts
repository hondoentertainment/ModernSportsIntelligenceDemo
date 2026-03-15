import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getInsuredItems,
  addInsuredItem,
  updateCoverage,
  getCoverageGaps,
  getInsuranceReport,
  getClaimHistory,
  fileClaim,
  calculatePremium,
  getRiskScore,
  getExpiringPolicies,
  formatCurrency,
  getCoverageColor,
  getRiskColor,
  getPriorityColor,
  type InsuredItem,
  type CoverageGap,
  type ClaimHistory,
  type InsuranceReport,
} from '../../lib/insuranceVaultService';
import { setupLocalStorageMock } from '../helpers';

const localStorageMock = setupLocalStorageMock();

function makeItem(overrides: Partial<InsuredItem> = {}): InsuredItem {
  return {
    id: 'test-001',
    cardName: 'Test Card',
    player: 'Test Player',
    sport: 'Basketball',
    year: 2023,
    set: 'Topps Chrome',
    grade: 'PSA 10',
    imageUrl: '/cards/test.jpg',
    purchasePrice: 1000,
    currentMarketValue: 1500,
    insuredValue: 1400,
    coverageType: 'premium',
    premium: 31,
    deductible: 70,
    lastAppraisal: '2025-12-01',
    nextAppraisalDue: '2026-06-01',
    riskScore: 35,
    storageLocation: 'Home Safe',
    condition: 'Gem Mint',
    photos: ['/photos/test-front.jpg'],
    ...overrides,
  };
}

describe('insuranceVaultService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  // ---- getInsuredItems ----

  describe('getInsuredItems', () => {
    it('returns an array of insured items', () => {
      const items = getInsuredItems();
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThanOrEqual(15);
    });

    it('items have all required fields', () => {
      const items = getInsuredItems();
      for (const item of items) {
        expect(item.id).toBeTruthy();
        expect(item.cardName).toBeTruthy();
        expect(item.player).toBeTruthy();
        expect(item.sport).toBeTruthy();
        expect(item.year).toBeGreaterThan(0);
        expect(item.insuredValue).toBeGreaterThan(0);
        expect(item.currentMarketValue).toBeGreaterThan(0);
        expect(item.riskScore).toBeGreaterThanOrEqual(1);
        expect(item.riskScore).toBeLessThanOrEqual(100);
        expect(['basic', 'premium', 'collector']).toContain(item.coverageType);
      }
    });

    it('persists to localStorage on first call', () => {
      getInsuredItems();
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'msi_insurance_vault_items',
        expect.any(String)
      );
    });

    it('returns cached data from localStorage on subsequent calls', () => {
      const a = getInsuredItems();
      const b = getInsuredItems();
      expect(a.length).toBe(b.length);
      expect(a[0].id).toBe(b[0].id);
    });
  });

  // ---- addInsuredItem ----

  describe('addInsuredItem', () => {
    it('adds a new item and returns updated list', () => {
      const initial = getInsuredItems();
      const newItem = makeItem({ id: 'new-001' });
      const updated = addInsuredItem(newItem);
      expect(updated.length).toBe(initial.length + 1);
      expect(updated.find((i) => i.id === 'new-001')).toBeTruthy();
    });

    it('persists the added item to localStorage', () => {
      const newItem = makeItem({ id: 'persist-001' });
      addInsuredItem(newItem);
      const reloaded = getInsuredItems();
      expect(reloaded.find((i) => i.id === 'persist-001')).toBeTruthy();
    });
  });

  // ---- updateCoverage ----

  describe('updateCoverage', () => {
    it('updates coverage type for an existing item', () => {
      const items = getInsuredItems();
      const target = items[0];
      const result = updateCoverage(target.id, 'basic');
      expect(result).not.toBeNull();
      expect(result!.coverageType).toBe('basic');
    });

    it('recalculates premium when coverage changes', () => {
      const items = getInsuredItems();
      const target = items[0];
      const result = updateCoverage(target.id, 'basic');
      expect(result).not.toBeNull();
      expect(result!.premium).toBe(calculatePremium(target.insuredValue, 'basic'));
    });

    it('returns null for non-existent item', () => {
      getInsuredItems(); // seed data
      const result = updateCoverage('nonexistent-id', 'premium');
      expect(result).toBeNull();
    });
  });

  // ---- getCoverageGaps ----

  describe('getCoverageGaps', () => {
    it('returns an array of coverage gaps', () => {
      const gaps = getCoverageGaps();
      expect(Array.isArray(gaps)).toBe(true);
    });

    it('gaps have required fields', () => {
      const gaps = getCoverageGaps();
      for (const gap of gaps) {
        expect(gap.id).toBeTruthy();
        expect(gap.itemId).toBeTruthy();
        expect(gap.cardName).toBeTruthy();
        expect(gap.gap).toBeGreaterThan(0);
        expect(['high', 'medium', 'low']).toContain(gap.priority);
        expect(gap.recommendedCoverage).toBeGreaterThan(gap.currentCoverage);
      }
    });

    it('gaps are sorted by priority (high first)', () => {
      const gaps = getCoverageGaps();
      const order = { high: 0, medium: 1, low: 2 };
      for (let i = 1; i < gaps.length; i++) {
        expect(order[gaps[i].priority]).toBeGreaterThanOrEqual(order[gaps[i - 1].priority]);
      }
    });
  });

  // ---- getInsuranceReport ----

  describe('getInsuranceReport', () => {
    it('returns a valid report with all fields', () => {
      const report = getInsuranceReport();
      expect(report.totalInsuredValue).toBeGreaterThan(0);
      expect(report.totalPremiums).toBeGreaterThan(0);
      expect(report.coverageRatio).toBeGreaterThan(0);
      expect(report.coverageRatio).toBeLessThanOrEqual(100);
      expect(report.avgRiskScore).toBeGreaterThan(0);
      expect(typeof report.gapCount).toBe('number');
      expect(report.lastUpdated).toBeTruthy();
    });

    it('totalInsuredValue equals sum of all item insured values', () => {
      const items = getInsuredItems();
      const report = getInsuranceReport();
      const expectedTotal = items.reduce((sum, i) => sum + i.insuredValue, 0);
      expect(report.totalInsuredValue).toBe(expectedTotal);
    });
  });

  // ---- getClaimHistory ----

  describe('getClaimHistory', () => {
    it('returns an array of claims', () => {
      const claims = getClaimHistory();
      expect(Array.isArray(claims)).toBe(true);
      expect(claims.length).toBeGreaterThan(0);
    });

    it('claims have required fields', () => {
      const claims = getClaimHistory();
      for (const claim of claims) {
        expect(claim.id).toBeTruthy();
        expect(claim.itemId).toBeTruthy();
        expect(claim.cardName).toBeTruthy();
        expect(['damage', 'theft', 'loss']).toContain(claim.claimType);
        expect(['filed', 'reviewing', 'approved', 'denied']).toContain(claim.status);
        expect(claim.amount).toBeGreaterThan(0);
        expect(claim.filedDate).toBeTruthy();
      }
    });
  });

  // ---- fileClaim ----

  describe('fileClaim', () => {
    it('files a new claim and returns it with generated id', () => {
      const claim = fileClaim({
        itemId: 'ins-001',
        cardName: 'Test Claim Card',
        claimType: 'damage',
        amount: 5000,
        filedDate: '2026-03-01',
      });
      expect(claim.id).toBeTruthy();
      expect(claim.status).toBe('filed');
      expect(claim.resolvedDate).toBeNull();
      expect(claim.amount).toBe(5000);
    });

    it('persists the filed claim', () => {
      fileClaim({
        itemId: 'ins-002',
        cardName: 'Persist Claim',
        claimType: 'theft',
        amount: 10000,
        filedDate: '2026-03-15',
      });
      const claims = getClaimHistory();
      expect(claims.find((c) => c.cardName === 'Persist Claim')).toBeTruthy();
    });
  });

  // ---- calculatePremium ----

  describe('calculatePremium', () => {
    it('calculates basic premium at 1.2%', () => {
      expect(calculatePremium(10000, 'basic')).toBe(120);
    });

    it('calculates premium premium at 2.2%', () => {
      expect(calculatePremium(10000, 'premium')).toBe(220);
    });

    it('calculates collector premium at 3.5%', () => {
      expect(calculatePremium(10000, 'collector')).toBe(350);
    });

    it('rounds to nearest dollar', () => {
      expect(calculatePremium(999, 'basic')).toBe(Math.round(999 * 0.012));
    });
  });

  // ---- getRiskScore ----

  describe('getRiskScore', () => {
    it('returns lower score for bank vault storage', () => {
      const score = getRiskScore({ storageLocation: 'Bank Vault', condition: 'Mint', currentMarketValue: 50000 });
      expect(score).toBeLessThan(40);
    });

    it('returns higher score for display storage', () => {
      const score = getRiskScore({ storageLocation: 'Home Display', condition: 'Good', currentMarketValue: 1000 });
      expect(score).toBeGreaterThan(50);
    });

    it('clamps score between 1 and 100', () => {
      const low = getRiskScore({ storageLocation: 'Bank Vault', condition: 'Gem Mint', currentMarketValue: 500000 });
      const high = getRiskScore({ storageLocation: 'Home Display', condition: 'Poor', currentMarketValue: 500 });
      expect(low).toBeGreaterThanOrEqual(1);
      expect(low).toBeLessThanOrEqual(100);
      expect(high).toBeGreaterThanOrEqual(1);
      expect(high).toBeLessThanOrEqual(100);
    });
  });

  // ---- getExpiringPolicies ----

  describe('getExpiringPolicies', () => {
    it('returns items with appraisals due within 30 days', () => {
      const expiring = getExpiringPolicies();
      expect(Array.isArray(expiring)).toBe(true);
      const now = new Date();
      for (const item of expiring) {
        const due = new Date(item.nextAppraisalDue);
        const diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        expect(diffDays).toBeLessThanOrEqual(30);
      }
    });
  });

  // ---- formatCurrency ----

  describe('formatCurrency', () => {
    it('formats a number as USD', () => {
      const result = formatCurrency(1500);
      expect(result).toContain('1,500');
      expect(result).toContain('$');
    });

    it('handles zero', () => {
      expect(formatCurrency(0)).toContain('$');
    });

    it('handles large values', () => {
      const result = formatCurrency(1000000);
      expect(result).toContain('1,000,000');
    });
  });

  // ---- getCoverageColor ----

  describe('getCoverageColor', () => {
    it('returns purple for collector', () => {
      expect(getCoverageColor('collector')).toContain('purple');
    });

    it('returns blue for premium', () => {
      expect(getCoverageColor('premium')).toContain('blue');
    });

    it('returns gray for basic', () => {
      expect(getCoverageColor('basic')).toContain('gray');
    });
  });

  // ---- getRiskColor ----

  describe('getRiskColor', () => {
    it('returns red for high risk scores', () => {
      expect(getRiskColor(75)).toContain('red');
    });

    it('returns yellow for medium risk scores', () => {
      expect(getRiskColor(50)).toContain('yellow');
    });

    it('returns green for low risk scores', () => {
      expect(getRiskColor(20)).toContain('green');
    });
  });

  // ---- getPriorityColor ----

  describe('getPriorityColor', () => {
    it('returns red for high priority', () => {
      expect(getPriorityColor('high')).toContain('red');
    });

    it('returns yellow for medium priority', () => {
      expect(getPriorityColor('medium')).toContain('yellow');
    });

    it('returns green for low priority', () => {
      expect(getPriorityColor('low')).toContain('green');
    });
  });
});
