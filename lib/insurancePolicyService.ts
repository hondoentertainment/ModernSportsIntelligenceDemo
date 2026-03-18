import { CardInventory, Sport } from '../types';
import { store } from './dal/syncStore';

// ---- Types ----

export interface InsurancePolicy {
  id: string;
  provider: string;
  policyNumber: string;
  coverageAmount: number;
  premium: number;
  deductible: number;
  startDate: string;
  endDate: string;
  type: 'blanket' | 'scheduled' | 'rider';
  status: 'active' | 'expired' | 'pending';
  coveredSports?: Sport[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CoverageGap {
  category: string;
  totalValue: number;
  coveredAmount: number;
  gapAmount: number;
  gapPercent: number;
  severity: 'critical' | 'warning' | 'ok';
}

export interface PremiumEstimate {
  totalValue: number;
  tier: string;
  rate: number;
  annualPremium: number;
  monthlyPremium: number;
  deductibleOptions: { deductible: number; premium: number }[];
}

export interface RiderRecommendation {
  cardId: string;
  player: string;
  currentValue: number;
  reason: string;
  suggestedCoverage: number;
  estimatedRiderCost: number;
}

export interface RenewalReminder {
  policyId: string;
  provider: string;
  policyNumber: string;
  endDate: string;
  daysUntilExpiry: number;
  urgency: 'urgent' | 'upcoming' | 'future';
}

export interface InsuranceClaim {
  id: string;
  policyId: string;
  cardId?: string;
  type: 'damage' | 'theft' | 'loss' | 'shipping';
  description: string;
  claimAmount: number;
  status: 'submitted' | 'under_review' | 'approved' | 'denied' | 'paid';
  filedDate: string;
  resolvedDate?: string;
  payout?: number;
  notes?: string;
}

export interface CoverageHistory {
  month: string;
  totalValue: number;
  coveredAmount: number;
  ratio: number;
}

export interface CoverageSnapshot {
  policies: InsurancePolicy[];
  coverageGaps: CoverageGap[];
  premiumEstimate: PremiumEstimate;
  riderRecommendations: RiderRecommendation[];
  renewalReminders: RenewalReminder[];
  totalCollectionValue: number;
}

// ---- Constants ----

const POLICIES_KEY = 'msi_insurance_policies';
const CLAIMS_KEY = 'msi_insurance_claims';

// ---- localStorage helpers ----

function loadFromStorage<T>(key: string): T[] {
  return store.get<T[]>(key, []);
}

function saveToStorage<T>(key: string, data: T[]): void {
  store.set(key, data);
}

// ---- Policy CRUD ----

export function getPolicies(): InsurancePolicy[] {
  return loadFromStorage<InsurancePolicy>(POLICIES_KEY);
}

export function addPolicy(policy: InsurancePolicy): InsurancePolicy[] {
  const policies = getPolicies();
  policies.push(policy);
  saveToStorage(POLICIES_KEY, policies);
  return policies;
}

export function updatePolicy(updated: InsurancePolicy): InsurancePolicy[] {
  const policies = getPolicies();
  const idx = policies.findIndex(p => p.id === updated.id);
  if (idx >= 0) {
    policies[idx] = { ...updated, updatedAt: new Date().toISOString() };
  }
  saveToStorage(POLICIES_KEY, policies);
  return policies;
}

export function deletePolicy(id: string): InsurancePolicy[] {
  let policies = getPolicies();
  policies = policies.filter(p => p.id !== id);
  saveToStorage(POLICIES_KEY, policies);
  return policies;
}

// ---- Coverage Gap Analysis ----

export function analyzeCoverageGaps(
  policies: InsurancePolicy[],
  cards: CardInventory[]
): CoverageGap[] {
  const activePolicies = policies.filter(p => p.status === 'active');
  const totalCoverage = activePolicies.reduce((s, p) => s + p.coverageAmount, 0);

  // Overall gap
  const totalValue = cards.reduce(
    (s, c) => s + (c.currentValue ?? c.purchasePrice),
    0
  );

  const gaps: CoverageGap[] = [];

  // Overall
  const overallGap = Math.max(0, totalValue - totalCoverage);
  const overallPercent = totalValue > 0 ? (overallGap / totalValue) * 100 : 0;
  gaps.push({
    category: 'Overall Collection',
    totalValue,
    coveredAmount: Math.min(totalCoverage, totalValue),
    gapAmount: overallGap,
    gapPercent: overallPercent,
    severity: overallPercent > 30 ? 'critical' : overallPercent > 10 ? 'warning' : 'ok',
  });

  // By sport
  const sports = [...new Set(cards.map(c => c.sport))];
  for (const sport of sports) {
    const sportCards = cards.filter(c => c.sport === sport);
    const sportValue = sportCards.reduce(
      (s, c) => s + (c.currentValue ?? c.purchasePrice),
      0
    );

    // Check if any active policy covers this sport
    const sportCoverage = activePolicies
      .filter(p => !p.coveredSports || p.coveredSports.length === 0 || p.coveredSports.includes(sport))
      .reduce((s, p) => s + p.coverageAmount, 0);

    // Proportional coverage
    const proportionalCoverage = totalValue > 0
      ? (sportCoverage * (sportValue / totalValue))
      : 0;

    const sportGap = Math.max(0, sportValue - proportionalCoverage);
    const sportPercent = sportValue > 0 ? (sportGap / sportValue) * 100 : 0;

    gaps.push({
      category: sport,
      totalValue: sportValue,
      coveredAmount: Math.min(proportionalCoverage, sportValue),
      gapAmount: sportGap,
      gapPercent: sportPercent,
      severity: sportPercent > 30 ? 'critical' : sportPercent > 10 ? 'warning' : 'ok',
    });
  }

  // By value tier
  const tiers = [
    { label: 'Under $100', min: 0, max: 100 },
    { label: '$100-$500', min: 100, max: 500 },
    { label: '$500-$1,000', min: 500, max: 1000 },
    { label: '$1,000-$5,000', min: 1000, max: 5000 },
    { label: '$5,000+', min: 5000, max: Infinity },
  ];

  for (const tier of tiers) {
    const tierCards = cards.filter(c => {
      const v = c.currentValue ?? c.purchasePrice;
      return v >= tier.min && v < tier.max;
    });
    if (tierCards.length === 0) continue;

    const tierValue = tierCards.reduce(
      (s, c) => s + (c.currentValue ?? c.purchasePrice),
      0
    );

    const proportionalCoverage = totalValue > 0
      ? (totalCoverage * (tierValue / totalValue))
      : 0;

    const tierGap = Math.max(0, tierValue - proportionalCoverage);
    const tierPercent = tierValue > 0 ? (tierGap / tierValue) * 100 : 0;

    gaps.push({
      category: tier.label,
      totalValue: tierValue,
      coveredAmount: Math.min(proportionalCoverage, tierValue),
      gapAmount: tierGap,
      gapPercent: tierPercent,
      severity: tierPercent > 30 ? 'critical' : tierPercent > 10 ? 'warning' : 'ok',
    });
  }

  return gaps;
}

// ---- Premium Estimation ----

export function estimatePremium(totalValue: number): PremiumEstimate {
  let rate: number;
  let tier: string;

  if (totalValue <= 0) {
    return {
      totalValue: 0,
      tier: 'None',
      rate: 0,
      annualPremium: 0,
      monthlyPremium: 0,
      deductibleOptions: [],
    };
  } else if (totalValue <= 10000) {
    rate = 0.02;
    tier = 'Standard ($0-$10K)';
  } else if (totalValue <= 50000) {
    rate = 0.015;
    tier = 'Preferred ($10K-$50K)';
  } else {
    rate = 0.01;
    tier = 'Premium ($50K+)';
  }

  const annualPremium = Math.round(totalValue * rate * 100) / 100;
  const monthlyPremium = Math.round((annualPremium / 12) * 100) / 100;

  const deductibleOptions = [
    { deductible: 0, premium: Math.round(annualPremium * 1.25 * 100) / 100 },
    { deductible: 250, premium: annualPremium },
    { deductible: 500, premium: Math.round(annualPremium * 0.85 * 100) / 100 },
    { deductible: 1000, premium: Math.round(annualPremium * 0.70 * 100) / 100 },
  ];

  return {
    totalValue,
    tier,
    rate,
    annualPremium,
    monthlyPremium,
    deductibleOptions,
  };
}

// ---- Rider Recommendations ----

export function getRiderRecommendations(
  cards: CardInventory[],
  policies: InsurancePolicy[]
): RiderRecommendation[] {
  const scheduledPolicies = policies.filter(
    p => p.type === 'scheduled' && p.status === 'active'
  );
  const _scheduledTotal = scheduledPolicies.reduce((s, p) => s + p.coverageAmount, 0);

  // Cards worth over $5,000 that may need individual scheduling
  const highValueCards = cards.filter(c => {
    const val = c.currentValue ?? c.purchasePrice;
    return val >= 5000;
  });

  return highValueCards.map(card => {
    const value = card.currentValue ?? card.purchasePrice;
    const suggestedCoverage = Math.round(value * 1.1); // 110% of value
    const riderRate = 0.012; // Slightly lower rate for scheduled items
    const estimatedRiderCost = Math.round(suggestedCoverage * riderRate * 100) / 100;

    let reason = `High-value card ($${value.toLocaleString()}) — recommend individual scheduling for full coverage`;
    if (card.isAutographed) {
      reason = `Autographed high-value card ($${value.toLocaleString()}) — authenticated items need scheduled coverage`;
    } else if (card.isGraded && card.grade) {
      reason = `Graded ${card.gradingCompany ?? ''} ${card.grade} card ($${value.toLocaleString()}) — graded cards should be individually listed`;
    }

    return {
      cardId: card.id,
      player: card.player,
      currentValue: value,
      reason,
      suggestedCoverage,
      estimatedRiderCost,
    };
  });
}

// ---- Renewal Reminders ----

export function getRenewalReminders(policies: InsurancePolicy[]): RenewalReminder[] {
  const now = new Date();
  const reminders: RenewalReminder[] = [];

  for (const policy of policies) {
    if (policy.status === 'expired') continue;

    const endDate = new Date(policy.endDate);
    const diffMs = endDate.getTime() - now.getTime();
    const daysUntilExpiry = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry <= 90) {
      let urgency: 'urgent' | 'upcoming' | 'future';
      if (daysUntilExpiry <= 30) {
        urgency = 'urgent';
      } else if (daysUntilExpiry <= 60) {
        urgency = 'upcoming';
      } else {
        urgency = 'future';
      }

      reminders.push({
        policyId: policy.id,
        provider: policy.provider,
        policyNumber: policy.policyNumber,
        endDate: policy.endDate,
        daysUntilExpiry: Math.max(0, daysUntilExpiry),
        urgency,
      });
    }
  }

  return reminders.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
}

// ---- Claims CRUD ----

export function getClaims(): InsuranceClaim[] {
  return loadFromStorage<InsuranceClaim>(CLAIMS_KEY);
}

export function addClaim(claim: InsuranceClaim): InsuranceClaim[] {
  const claims = getClaims();
  claims.push(claim);
  saveToStorage(CLAIMS_KEY, claims);
  return claims;
}

export function updateClaim(updated: InsuranceClaim): InsuranceClaim[] {
  const claims = getClaims();
  const idx = claims.findIndex(c => c.id === updated.id);
  if (idx >= 0) {
    claims[idx] = updated;
  }
  saveToStorage(CLAIMS_KEY, claims);
  return claims;
}

// ---- Coverage History ----

export function getCoverageHistory(policies: InsurancePolicy[]): CoverageHistory[] {
  const history: CoverageHistory[] = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const _monthStr = date.toISOString().slice(0, 7); // YYYY-MM
    const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

    // Simulate growing collection value over past 12 months
    const growthFactor = 1 + (11 - i) * 0.03;
    const baseValue = policies.reduce((s, p) => s + p.coverageAmount, 0) || 10000;
    const totalValue = Math.round(baseValue * growthFactor * (0.9 + Math.sin(i * 0.5) * 0.1));

    // Coverage: active policies during that month
    const activeDuringMonth = policies.filter(p => {
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      return start <= date && end >= date;
    });

    const coveredAmount = activeDuringMonth.reduce((s, p) => s + p.coverageAmount, 0);
    const ratio = totalValue > 0 ? Math.min(1, coveredAmount / totalValue) : 0;

    history.push({
      month: monthLabel,
      totalValue,
      coveredAmount: Math.min(coveredAmount, totalValue),
      ratio: Math.round(ratio * 100),
    });
  }

  return history;
}

export function buildCoverageSnapshot(cards: CardInventory[]): CoverageSnapshot {
  const policies = getPolicies();
  const totalCollectionValue = cards.reduce(
    (sum, card) => sum + (card.currentValue ?? card.purchasePrice),
    0
  );

  return {
    policies,
    coverageGaps: analyzeCoverageGaps(policies, cards),
    premiumEstimate: estimatePremium(totalCollectionValue),
    riderRecommendations: getRiderRecommendations(cards, policies),
    renewalReminders: getRenewalReminders(policies),
    totalCollectionValue,
  };
}

// ---- Seed Data ----

export function generateSamplePolicies(): InsurancePolicy[] {
  const now = new Date();
  const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  const threeMonths = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());

  return [
    {
      id: 'pol_001',
      provider: 'Collectibles Insurance Services',
      policyNumber: 'CIS-2024-78901',
      coverageAmount: 25000,
      premium: 375,
      deductible: 250,
      startDate: sixMonthsAgo.toISOString().slice(0, 10),
      endDate: oneYearFromNow.toISOString().slice(0, 10),
      type: 'blanket',
      status: 'active',
      notes: 'Blanket coverage for entire collection',
      createdAt: sixMonthsAgo.toISOString(),
      updatedAt: sixMonthsAgo.toISOString(),
    },
    {
      id: 'pol_002',
      provider: 'American Collectors Insurance',
      policyNumber: 'ACI-2024-45678',
      coverageAmount: 10000,
      premium: 150,
      deductible: 500,
      startDate: sixMonthsAgo.toISOString().slice(0, 10),
      endDate: threeMonths.toISOString().slice(0, 10),
      type: 'scheduled',
      status: 'active',
      coveredSports: ['Baseball', 'Basketball'],
      notes: 'Scheduled items — high-value graded cards',
      createdAt: sixMonthsAgo.toISOString(),
      updatedAt: sixMonthsAgo.toISOString(),
    },
  ];
}

export function generateSampleClaims(): InsuranceClaim[] {
  return [
    {
      id: 'clm_001',
      policyId: 'pol_001',
      type: 'shipping',
      description: 'Card damaged during USPS Priority Mail shipment',
      claimAmount: 450,
      status: 'paid',
      filedDate: '2024-08-15',
      resolvedDate: '2024-09-02',
      payout: 420,
      notes: 'Deductible applied, paid within 18 days',
    },
    {
      id: 'clm_002',
      policyId: 'pol_001',
      type: 'damage',
      description: 'Water damage to storage area — 3 cards affected',
      claimAmount: 1200,
      status: 'under_review',
      filedDate: '2025-01-10',
      notes: 'Adjuster assigned, photos submitted',
    },
  ];
}

export function ensureSampleData(): { policies: InsurancePolicy[]; claims: InsuranceClaim[] } {
  let policies = getPolicies();
  if (policies.length === 0) {
    policies = generateSamplePolicies();
    saveToStorage(POLICIES_KEY, policies);
  }

  let claims = getClaims();
  if (claims.length === 0) {
    claims = generateSampleClaims();
    saveToStorage(CLAIMS_KEY, claims);
  }

  return { policies, claims };
}
