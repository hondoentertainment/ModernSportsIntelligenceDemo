import { CardInventory, Sport } from '../types';

// ── Types ──────────────────────────────────────────────────────────────

export type PolicyStatus = 'active' | 'expired' | 'cancelled' | 'pending';
export type ClaimStatus = 'filed' | 'pending' | 'approved' | 'denied';
export type RenewalAlertWindow = 30 | 60 | 90;

export interface InsurancePolicy {
  id: string;
  provider: string;
  policyNumber: string;
  coverageLimit: number;
  annualPremium: number;
  deductible: number;
  startDate: string;
  renewalDate: string;
  status: PolicyStatus;
  coverageType: 'blanket' | 'scheduled' | 'hybrid';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsuranceClaim {
  id: string;
  policyId: string;
  cardId?: string;
  cardName: string;
  claimAmount: number;
  approvedAmount?: number;
  status: ClaimStatus;
  filedDate: string;
  resolvedDate?: string;
  description: string;
  documentReference?: string;
  notes?: string;
}

export interface ScheduledRider {
  id: string;
  policyId: string;
  cardId: string;
  cardName: string;
  insuredValue: number;
  additionalPremium: number;
  sport: Sport;
}

export interface CoverageGap {
  category: string;
  totalValue: number;
  coveredAmount: number;
  gapAmount: number;
  gapPercentage: number;
  isUnderInsured: boolean;
}

export interface PremiumEstimate {
  collectionValue: number;
  blanketRate: number;
  blanketPremium: number;
  scheduledRate: number;
  scheduledPremium: number;
  recommendedPremium: number;
  recommendedType: 'blanket' | 'scheduled' | 'hybrid';
  savings: number;
}

export interface RiderRecommendation {
  cardId: string;
  cardName: string;
  currentValue: number;
  sport: Sport;
  reason: string;
  estimatedRiderPremium: number;
}

export interface RenewalReminder {
  policyId: string;
  provider: string;
  policyNumber: string;
  renewalDate: string;
  daysUntilRenewal: number;
  currentCoverage: number;
  recommendedCoverage: number;
  alertLevel: 'urgent' | 'warning' | 'info';
}

export interface CoverageHistoryEntry {
  date: string;
  totalCoverage: number;
  collectionValue: number;
  coverageRatio: number;
  policyCount: number;
}

export interface InsuranceSummary {
  totalPolicies: number;
  activePolicies: number;
  totalCoverage: number;
  totalPremiums: number;
  totalDeductibles: number;
  collectionValue: number;
  coverageRatio: number;
  isUnderInsured: boolean;
  coverageGap: number;
  nextRenewal: string | null;
  daysToNextRenewal: number | null;
  openClaims: number;
  totalClaimsPaid: number;
  scheduledRiders: number;
}

// ── Constants ──────────────────────────────────────────────────────────

const POLICIES_KEY = 'msi_insurance_policies';
const CLAIMS_KEY = 'msi_insurance_claims';
const RIDERS_KEY = 'msi_insurance_riders';
const HISTORY_KEY = 'msi_insurance_coverage_history';
const PREFS_KEY = 'msi_insurance_prefs';

// Industry-standard rates for collectibles insurance
const BLANKET_RATE_LOW = 0.012; // 1.2% for lower-value collections
const BLANKET_RATE_HIGH = 0.018; // 1.8% for higher-value collections
const SCHEDULED_RATE = 0.008; // 0.8% for individually scheduled items
const HIGH_VALUE_THRESHOLD = 5000; // Cards above this should be individually scheduled
const BLANKET_THRESHOLD = 50000; // Collections above this get lower rates

const DEFAULT_PROVIDERS = [
  'Collectibles Insurance Services',
  'American Collectors Insurance',
  'Hugh Wood Inc.',
  'Chubb Collectors',
  'State Farm Valuable Items',
  'USAA Valuable Personal Property',
];

// ── Helpers ────────────────────────────────────────────────────────────

function loadPolicies(): InsurancePolicy[] {
  try {
    const raw = localStorage.getItem(POLICIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePolicies(policies: InsurancePolicy[]): void {
  localStorage.setItem(POLICIES_KEY, JSON.stringify(policies));
}

function loadClaims(): InsuranceClaim[] {
  try {
    const raw = localStorage.getItem(CLAIMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveClaims(claims: InsuranceClaim[]): void {
  localStorage.setItem(CLAIMS_KEY, JSON.stringify(claims));
}

function loadRiders(): ScheduledRider[] {
  try {
    const raw = localStorage.getItem(RIDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRiders(riders: ScheduledRider[]): void {
  localStorage.setItem(RIDERS_KEY, JSON.stringify(riders));
}

function loadCoverageHistory(): CoverageHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCoverageHistory(history: CoverageHistoryEntry[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function loadPrefs(): { alertWindows: RenewalAlertWindow[] } {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? JSON.parse(raw) : { alertWindows: [30, 60, 90] };
  } catch {
    return { alertWindows: [30, 60, 90] };
  }
}

function savePrefs(prefs: { alertWindows: RenewalAlertWindow[] }): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA).getTime();
  const b = new Date(dateB).getTime();
  return Math.floor(Math.abs(b - a) / (1000 * 60 * 60 * 24));
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

function getCollectionValue(cards: CardInventory[]): number {
  return cards
    .filter((c) => c.status !== 'sold')
    .reduce((sum, c) => sum + (c.currentValue ?? c.purchasePrice), 0);
}

function getCollectionValueBySport(cards: CardInventory[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const card of cards.filter((c) => c.status !== 'sold')) {
    const val = card.currentValue ?? card.purchasePrice;
    result[card.sport] = (result[card.sport] || 0) + val;
  }
  return result;
}

function getCollectionValueByCategory(cards: CardInventory[]): Record<string, number> {
  const categories: Record<string, number> = {};
  for (const card of cards.filter((c) => c.status !== 'sold')) {
    const val = card.currentValue ?? card.purchasePrice;
    // Categorize by value tier
    let cat: string;
    if (val >= 10000) cat = 'Ultra High Value ($10K+)';
    else if (val >= 5000) cat = 'High Value ($5K-$10K)';
    else if (val >= 1000) cat = 'Mid Value ($1K-$5K)';
    else if (val >= 250) cat = 'Low-Mid Value ($250-$1K)';
    else cat = 'Low Value (Under $250)';
    categories[cat] = (categories[cat] || 0) + val;
  }
  return categories;
}

// ── Service ────────────────────────────────────────────────────────────

export const InsurancePolicyService = {
  // ── Provider list ──

  getProviders(): string[] {
    return [...DEFAULT_PROVIDERS];
  },

  // ── Policy CRUD ──

  getPolicies(): InsurancePolicy[] {
    return loadPolicies();
  },

  getActivePolicies(): InsurancePolicy[] {
    return loadPolicies().filter((p) => p.status === 'active');
  },

  getPolicyById(id: string): InsurancePolicy | undefined {
    return loadPolicies().find((p) => p.id === id);
  },

  createPolicy(
    provider: string,
    policyNumber: string,
    coverageLimit: number,
    annualPremium: number,
    deductible: number,
    startDate: string,
    renewalDate: string,
    coverageType: 'blanket' | 'scheduled' | 'hybrid',
    notes?: string
  ): InsurancePolicy {
    const now = new Date().toISOString();
    const policy: InsurancePolicy = {
      id: generateId('pol'),
      provider,
      policyNumber,
      coverageLimit,
      annualPremium,
      deductible,
      startDate,
      renewalDate,
      status: 'active',
      coverageType,
      notes,
      createdAt: now,
      updatedAt: now,
    };

    const all = loadPolicies();
    all.push(policy);
    savePolicies(all);
    return policy;
  },

  updatePolicy(
    id: string,
    updates: Partial<Omit<InsurancePolicy, 'id' | 'createdAt'>>
  ): InsurancePolicy | null {
    const all = loadPolicies();
    const idx = all.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    all[idx] = {
      ...all[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    savePolicies(all);
    return all[idx];
  },

  deletePolicy(id: string): boolean {
    const all = loadPolicies();
    const filtered = all.filter((p) => p.id !== id);
    if (filtered.length === all.length) return false;
    savePolicies(filtered);
    return true;
  },

  // ── Claim CRUD ──

  getClaims(): InsuranceClaim[] {
    return loadClaims();
  },

  getClaimsByPolicy(policyId: string): InsuranceClaim[] {
    return loadClaims().filter((c) => c.policyId === policyId);
  },

  getOpenClaims(): InsuranceClaim[] {
    return loadClaims().filter((c) => c.status === 'filed' || c.status === 'pending');
  },

  createClaim(
    policyId: string,
    cardName: string,
    claimAmount: number,
    description: string,
    cardId?: string,
    documentReference?: string,
    notes?: string
  ): InsuranceClaim {
    const claim: InsuranceClaim = {
      id: generateId('clm'),
      policyId,
      cardId,
      cardName,
      claimAmount,
      status: 'filed',
      filedDate: new Date().toISOString(),
      description,
      documentReference,
      notes,
    };

    const all = loadClaims();
    all.push(claim);
    saveClaims(all);
    return claim;
  },

  updateClaimStatus(
    claimId: string,
    status: ClaimStatus,
    approvedAmount?: number
  ): InsuranceClaim | null {
    const all = loadClaims();
    const idx = all.findIndex((c) => c.id === claimId);
    if (idx === -1) return null;

    all[idx].status = status;
    if (status === 'approved' && approvedAmount !== undefined) {
      all[idx].approvedAmount = approvedAmount;
      all[idx].resolvedDate = new Date().toISOString();
    }
    if (status === 'denied') {
      all[idx].resolvedDate = new Date().toISOString();
    }
    saveClaims(all);
    return all[idx];
  },

  deleteClaim(claimId: string): boolean {
    const all = loadClaims();
    const filtered = all.filter((c) => c.id !== claimId);
    if (filtered.length === all.length) return false;
    saveClaims(filtered);
    return true;
  },

  // ── Rider Management ──

  getRiders(): ScheduledRider[] {
    return loadRiders();
  },

  getRidersByPolicy(policyId: string): ScheduledRider[] {
    return loadRiders().filter((r) => r.policyId === policyId);
  },

  addRider(
    policyId: string,
    cardId: string,
    cardName: string,
    insuredValue: number,
    sport: Sport
  ): ScheduledRider {
    const additionalPremium = insuredValue * SCHEDULED_RATE;
    const rider: ScheduledRider = {
      id: generateId('rdr'),
      policyId,
      cardId,
      cardName,
      insuredValue,
      additionalPremium,
      sport,
    };

    const all = loadRiders();
    all.push(rider);
    saveRiders(all);
    return rider;
  },

  removeRider(riderId: string): boolean {
    const all = loadRiders();
    const filtered = all.filter((r) => r.id !== riderId);
    if (filtered.length === all.length) return false;
    saveRiders(filtered);
    return true;
  },

  // ── Coverage Gap Analysis ──

  analyzeCoverageGaps(cards: CardInventory[]): CoverageGap[] {
    const policies = this.getActivePolicies();
    const totalCoverage = policies.reduce((sum, p) => sum + p.coverageLimit, 0);
    const valueBySport = getCollectionValueBySport(cards);
    const totalValue = getCollectionValue(cards);

    // Proportionally allocate coverage across sports
    const gaps: CoverageGap[] = [];
    for (const [sport, value] of Object.entries(valueBySport)) {
      const proportion = totalValue > 0 ? value / totalValue : 0;
      const allocatedCoverage = totalCoverage * proportion;
      const gap = Math.max(0, value - allocatedCoverage);
      const gapPct = value > 0 ? (gap / value) * 100 : 0;

      gaps.push({
        category: sport,
        totalValue: value,
        coveredAmount: Math.min(allocatedCoverage, value),
        gapAmount: gap,
        gapPercentage: gapPct,
        isUnderInsured: gap > 0,
      });
    }

    return gaps.sort((a, b) => b.gapAmount - a.gapAmount);
  },

  analyzeCoverageGapsByTier(cards: CardInventory[]): CoverageGap[] {
    const policies = this.getActivePolicies();
    const totalCoverage = policies.reduce((sum, p) => sum + p.coverageLimit, 0);
    const valueByCategory = getCollectionValueByCategory(cards);
    const totalValue = getCollectionValue(cards);

    const gaps: CoverageGap[] = [];
    for (const [category, value] of Object.entries(valueByCategory)) {
      const proportion = totalValue > 0 ? value / totalValue : 0;
      const allocatedCoverage = totalCoverage * proportion;
      const gap = Math.max(0, value - allocatedCoverage);
      const gapPct = value > 0 ? (gap / value) * 100 : 0;

      gaps.push({
        category,
        totalValue: value,
        coveredAmount: Math.min(allocatedCoverage, value),
        gapAmount: gap,
        gapPercentage: gapPct,
        isUnderInsured: gap > 0,
      });
    }

    return gaps.sort((a, b) => b.totalValue - a.totalValue);
  },

  // ── Premium Calculator ──

  estimatePremium(cards: CardInventory[]): PremiumEstimate {
    const collectionValue = getCollectionValue(cards);
    const highValueCards = cards.filter(
      (c) => c.status !== 'sold' && (c.currentValue ?? c.purchasePrice) >= HIGH_VALUE_THRESHOLD
    );
    const highValueTotal = highValueCards.reduce(
      (sum, c) => sum + (c.currentValue ?? c.purchasePrice),
      0
    );
    const blanketPortion = collectionValue - highValueTotal;

    // Blanket rate depends on collection size
    const blanketRate =
      collectionValue >= BLANKET_THRESHOLD ? BLANKET_RATE_LOW : BLANKET_RATE_HIGH;

    const blanketPremium = collectionValue * blanketRate;
    const scheduledPremium = collectionValue * SCHEDULED_RATE;

    // Hybrid: blanket for low-value, scheduled for high-value
    const hybridPremium =
      blanketPortion * blanketRate + highValueTotal * SCHEDULED_RATE;

    let recommendedType: 'blanket' | 'scheduled' | 'hybrid' = 'blanket';
    let recommendedPremium = blanketPremium;

    if (highValueCards.length > 0 && highValueCards.length <= 20) {
      recommendedType = 'hybrid';
      recommendedPremium = hybridPremium;
    } else if (highValueCards.length > 20) {
      recommendedType = 'scheduled';
      recommendedPremium = scheduledPremium;
    }

    const savings = blanketPremium - recommendedPremium;

    return {
      collectionValue,
      blanketRate: blanketRate * 100,
      blanketPremium,
      scheduledRate: SCHEDULED_RATE * 100,
      scheduledPremium,
      recommendedPremium,
      recommendedType,
      savings: Math.max(0, savings),
    };
  },

  // ── Rider Recommendations ──

  getHighValueRiderRecommendations(cards: CardInventory[]): RiderRecommendation[] {
    const existingRiders = loadRiders();
    const rideredCardIds = new Set(existingRiders.map((r) => r.cardId));

    return cards
      .filter((c) => {
        const val = c.currentValue ?? c.purchasePrice;
        return (
          val >= HIGH_VALUE_THRESHOLD &&
          c.status !== 'sold' &&
          !rideredCardIds.has(c.id)
        );
      })
      .map((c) => {
        const val = c.currentValue ?? c.purchasePrice;
        let reason = '';
        if (val >= 25000) {
          reason = 'Museum-grade asset — individual scheduling strongly recommended';
        } else if (val >= 10000) {
          reason = 'High-value card exceeds blanket sub-limits — schedule individually';
        } else {
          reason = 'Value exceeds $5,000 threshold — consider individual rider';
        }
        if (c.isAutographed) {
          reason += '. Autographed items have unique replacement considerations.';
        }
        if (c.isGraded && c.grade) {
          reason += `. ${c.gradingCompany} ${c.grade} grade adds verification value.`;
        }

        return {
          cardId: c.id,
          cardName: `${c.player} ${c.year} ${c.set}${c.isGraded ? ` ${c.gradingCompany} ${c.grade}` : ''}`,
          currentValue: val,
          sport: c.sport,
          reason,
          estimatedRiderPremium: val * SCHEDULED_RATE,
        };
      })
      .sort((a, b) => b.currentValue - a.currentValue);
  },

  // ── Renewal Reminders ──

  getRenewalReminders(cards: CardInventory[]): RenewalReminder[] {
    const policies = this.getActivePolicies();
    const prefs = loadPrefs();
    const collectionValue = getCollectionValue(cards);
    const maxWindow = Math.max(...prefs.alertWindows);

    const reminders: RenewalReminder[] = [];

    for (const policy of policies) {
      const days = daysUntil(policy.renewalDate);
      if (days <= maxWindow && days >= 0) {
        let alertLevel: 'urgent' | 'warning' | 'info' = 'info';
        if (days <= 30) alertLevel = 'urgent';
        else if (days <= 60) alertLevel = 'warning';

        // Recommend coverage based on current collection value
        const recommendedCoverage = Math.ceil(collectionValue * 1.1); // 110% of value

        reminders.push({
          policyId: policy.id,
          provider: policy.provider,
          policyNumber: policy.policyNumber,
          renewalDate: policy.renewalDate,
          daysUntilRenewal: days,
          currentCoverage: policy.coverageLimit,
          recommendedCoverage,
          alertLevel,
        });
      }
    }

    return reminders.sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal);
  },

  getRenewalPreferences(): { alertWindows: RenewalAlertWindow[] } {
    return loadPrefs();
  },

  setRenewalPreferences(alertWindows: RenewalAlertWindow[]): void {
    savePrefs({ alertWindows });
  },

  // ── Coverage History ──

  getCoverageHistory(): CoverageHistoryEntry[] {
    return loadCoverageHistory();
  },

  recordCoverageSnapshot(cards: CardInventory[]): CoverageHistoryEntry {
    const policies = this.getActivePolicies();
    const totalCoverage = policies.reduce((sum, p) => sum + p.coverageLimit, 0);
    const collectionValue = getCollectionValue(cards);
    const ratio = collectionValue > 0 ? totalCoverage / collectionValue : 0;

    const entry: CoverageHistoryEntry = {
      date: new Date().toISOString().split('T')[0],
      totalCoverage,
      collectionValue,
      coverageRatio: ratio,
      policyCount: policies.length,
    };

    const history = loadCoverageHistory();
    // Avoid duplicate entries for the same date
    const existingIdx = history.findIndex((h) => h.date === entry.date);
    if (existingIdx >= 0) {
      history[existingIdx] = entry;
    } else {
      history.push(entry);
    }

    // Keep last 365 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 365);
    const filtered = history.filter((h) => new Date(h.date) >= cutoff);
    saveCoverageHistory(filtered);

    return entry;
  },

  generateDeterministicHistory(cards: CardInventory[]): CoverageHistoryEntry[] {
    const existing = loadCoverageHistory();
    if (existing.length >= 12) return existing;

    const collectionValue = getCollectionValue(cards);
    const policies = this.getActivePolicies();
    const currentCoverage = policies.reduce((sum, p) => sum + p.coverageLimit, 0);

    // Generate 12 months of simulated history
    const history: CoverageHistoryEntry[] = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Simulate growth patterns
      const monthFactor = 1 - i * 0.06; // Collection grows ~6% per month simulated
      const valueAtTime = Math.round(collectionValue * Math.max(0.3, monthFactor));
      const coverageAtTime = Math.round(
        (currentCoverage || collectionValue * 0.85) * Math.max(0.5, 1 - i * 0.04)
      );
      const ratio = valueAtTime > 0 ? coverageAtTime / valueAtTime : 0;

      history.push({
        date: dateStr,
        totalCoverage: coverageAtTime,
        collectionValue: valueAtTime,
        coverageRatio: ratio,
        policyCount: Math.max(1, policies.length - Math.floor(i / 4)),
      });
    }

    saveCoverageHistory(history);
    return history;
  },

  // ── Summary ──

  generateSummary(cards: CardInventory[]): InsuranceSummary {
    const policies = loadPolicies();
    const activePolicies = policies.filter((p) => p.status === 'active');
    const claims = loadClaims();
    const riders = loadRiders();
    const collectionValue = getCollectionValue(cards);

    const totalCoverage = activePolicies.reduce((sum, p) => sum + p.coverageLimit, 0);
    const totalPremiums = activePolicies.reduce((sum, p) => sum + p.annualPremium, 0);
    const totalDeductibles = activePolicies.reduce((sum, p) => sum + p.deductible, 0);

    const coverageRatio = collectionValue > 0 ? totalCoverage / collectionValue : 0;
    const coverageGap = Math.max(0, collectionValue - totalCoverage);

    // Next renewal
    const futureRenewals = activePolicies
      .filter((p) => daysUntil(p.renewalDate) >= 0)
      .sort((a, b) => daysUntil(a.renewalDate) - daysUntil(b.renewalDate));

    const nextRenewal = futureRenewals.length > 0 ? futureRenewals[0].renewalDate : null;
    const daysToNextRenewal = nextRenewal ? daysUntil(nextRenewal) : null;

    // Claims
    const openClaims = claims.filter(
      (c) => c.status === 'filed' || c.status === 'pending'
    ).length;
    const totalClaimsPaid = claims
      .filter((c) => c.status === 'approved')
      .reduce((sum, c) => sum + (c.approvedAmount ?? 0), 0);

    return {
      totalPolicies: policies.length,
      activePolicies: activePolicies.length,
      totalCoverage,
      totalPremiums,
      totalDeductibles,
      collectionValue,
      coverageRatio,
      isUnderInsured: coverageRatio < 0.95,
      coverageGap,
      nextRenewal,
      daysToNextRenewal,
      openClaims,
      totalClaimsPaid,
      scheduledRiders: riders.length,
    };
  },
};
