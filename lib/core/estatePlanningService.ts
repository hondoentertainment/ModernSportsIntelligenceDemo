// ---- Types ----

export type EstatePlanStatus = 'draft' | 'active' | 'under_review' | 'finalized';

export type DocumentStatus = 'complete' | 'pending' | 'expired' | 'not_started';

export interface EstatePlan {
  id: string;
  name: string;
  totalValue: number;
  beneficiaries: number;
  lastUpdated: string;
  status: EstatePlanStatus;
}

export interface Beneficiary {
  id: string;
  name: string;
  relationship: string;
  allocationPercent: number;
  assignedCards: AssignedCard[];
}

export interface AssignedCard {
  id: string;
  playerName: string;
  year: string;
  set: string;
  grade: string;
  estimatedValue: number;
}

export interface InsuranceRecord {
  id: string;
  provider: string;
  policyNumber: string;
  coverage: number;
  premium: number;
  expiresAt: string;
}

export interface DocumentChecklistItem {
  id: string;
  label: string;
  description: string;
  status: DocumentStatus;
  completedAt?: string;
  expiresAt?: string;
}

export interface ValuationSnapshot {
  date: string;
  totalValue: number;
  insuredValue: number;
}

export interface EstateValuation {
  currentTotal: number;
  insuredTotal: number;
  uninsuredGap: number;
  changePercent30d: number;
  history: ValuationSnapshot[];
}

// ---- Mock Data ----

const mockBeneficiaries: Beneficiary[] = [
  {
    id: 'ben-1',
    name: 'Michael Thompson Jr.',
    relationship: 'Son',
    allocationPercent: 40,
    assignedCards: [
      { id: 'ac-1', playerName: 'LeBron James', year: '2003', set: 'Topps Chrome', grade: 'PSA 10', estimatedValue: 42500 },
      { id: 'ac-2', playerName: 'Michael Jordan', year: '1986', set: 'Fleer', grade: 'PSA 9', estimatedValue: 31200 },
      { id: 'ac-3', playerName: 'Luka Doncic', year: '2018', set: 'Prizm Silver', grade: 'PSA 10', estimatedValue: 8900 },
    ],
  },
  {
    id: 'ben-2',
    name: 'Sarah Thompson-Lee',
    relationship: 'Daughter',
    allocationPercent: 35,
    assignedCards: [
      { id: 'ac-4', playerName: 'Ken Griffey Jr.', year: '1989', set: 'Upper Deck', grade: 'PSA 10', estimatedValue: 15800 },
      { id: 'ac-5', playerName: 'Derek Jeter', year: '1993', set: 'SP Foil', grade: 'BGS 9.5', estimatedValue: 28400 },
      { id: 'ac-6', playerName: 'Shohei Ohtani', year: '2018', set: 'Topps Update', grade: 'PSA 10', estimatedValue: 12300 },
    ],
  },
  {
    id: 'ben-3',
    name: 'David Thompson',
    relationship: 'Brother',
    allocationPercent: 15,
    assignedCards: [
      { id: 'ac-7', playerName: 'Tom Brady', year: '2000', set: 'Bowman Chrome', grade: 'PSA 9', estimatedValue: 18700 },
      { id: 'ac-8', playerName: 'Patrick Mahomes', year: '2017', set: 'Prizm', grade: 'PSA 10', estimatedValue: 11200 },
    ],
  },
  {
    id: 'ben-4',
    name: 'Thompson Family Trust',
    relationship: 'Trust',
    allocationPercent: 10,
    assignedCards: [
      { id: 'ac-9', playerName: 'Mickey Mantle', year: '1952', set: 'Topps', grade: 'PSA 5', estimatedValue: 85000 },
    ],
  },
];

const mockInsuranceRecords: InsuranceRecord[] = [
  {
    id: 'ins-1',
    provider: 'Collectibles Insurance Services',
    policyNumber: 'CIS-2024-88312',
    coverage: 250000,
    premium: 1875,
    expiresAt: '2026-09-15',
  },
  {
    id: 'ins-2',
    provider: 'American Collectors Insurance',
    policyNumber: 'ACI-78421-SP',
    coverage: 100000,
    premium: 820,
    expiresAt: '2026-06-01',
  },
  {
    id: 'ins-3',
    provider: 'Hugh Wood Collectibles',
    policyNumber: 'HWC-2025-4419',
    coverage: 50000,
    premium: 425,
    expiresAt: '2027-01-30',
  },
];

const mockDocumentChecklist: DocumentChecklistItem[] = [
  {
    id: 'doc-1',
    label: 'Professional Appraisal',
    description: 'Third-party certified valuation of entire collection',
    status: 'complete',
    completedAt: '2025-11-20',
  },
  {
    id: 'doc-2',
    label: 'Last Will & Testament',
    description: 'Updated will including specific card collection bequests',
    status: 'complete',
    completedAt: '2025-08-14',
  },
  {
    id: 'doc-3',
    label: 'Insurance Documentation',
    description: 'Active insurance policies covering full collection value',
    status: 'complete',
    completedAt: '2026-01-05',
  },
  {
    id: 'doc-4',
    label: 'Photographic Inventory',
    description: 'High-resolution front/back photos of all insured cards',
    status: 'pending',
    expiresAt: '2026-06-30',
  },
  {
    id: 'doc-5',
    label: 'Beneficiary Designations',
    description: 'Formal assignment of specific cards to each beneficiary',
    status: 'complete',
    completedAt: '2025-12-01',
  },
  {
    id: 'doc-6',
    label: 'Storage & Access Instructions',
    description: 'Vault locations, safe combinations, and access procedures',
    status: 'pending',
  },
  {
    id: 'doc-7',
    label: 'Tax Basis Records',
    description: 'Purchase receipts and cost basis for capital gains calculation',
    status: 'expired',
    completedAt: '2024-03-15',
    expiresAt: '2025-03-15',
  },
  {
    id: 'doc-8',
    label: 'Letter of Intent',
    description: 'Non-binding guidance on collection management preferences',
    status: 'not_started',
  },
];

const mockValuationHistory: ValuationSnapshot[] = [
  { date: '2025-04', totalValue: 218000, insuredValue: 200000 },
  { date: '2025-05', totalValue: 224500, insuredValue: 200000 },
  { date: '2025-06', totalValue: 231000, insuredValue: 250000 },
  { date: '2025-07', totalValue: 228400, insuredValue: 250000 },
  { date: '2025-08', totalValue: 235700, insuredValue: 250000 },
  { date: '2025-09', totalValue: 241200, insuredValue: 250000 },
  { date: '2025-10', totalValue: 238900, insuredValue: 250000 },
  { date: '2025-11', totalValue: 245600, insuredValue: 350000 },
  { date: '2025-12', totalValue: 249100, insuredValue: 350000 },
  { date: '2026-01', totalValue: 252800, insuredValue: 400000 },
  { date: '2026-02', totalValue: 254000, insuredValue: 400000 },
  { date: '2026-03', totalValue: 254000, insuredValue: 400000 },
];

const mockEstatePlan: EstatePlan = {
  id: 'ep-1',
  name: 'Thompson Collection Estate Plan',
  totalValue: 254000,
  beneficiaries: 4,
  lastUpdated: '2026-02-18',
  status: 'active',
};

// ---- Service Functions ----

export function getEstatePlan(): EstatePlan {
  return mockEstatePlan;
}

export function getBeneficiaries(): Beneficiary[] {
  return mockBeneficiaries;
}

export function getInsuranceRecords(): InsuranceRecord[] {
  return mockInsuranceRecords;
}

export function getEstateValuation(): EstateValuation {
  const currentTotal = 254000;
  const insuredTotal = 400000;
  const prevTotal = 249100;
  const changePercent30d = ((currentTotal - prevTotal) / prevTotal) * 100;

  return {
    currentTotal,
    insuredTotal,
    uninsuredGap: Math.max(0, currentTotal - insuredTotal),
    changePercent30d,
    history: mockValuationHistory,
  };
}

export function getDocumentChecklist(): DocumentChecklistItem[] {
  return mockDocumentChecklist;
}

// ---- Cross-reference: Portfolio Attribution (Phase 89) ----
// Bridge functions to integrate attribution data for estate valuation insights

import {
  getReturnAttribution,
  getPerformanceDecomposition,
  type ReturnAttribution,
  type PerformanceDecomposition,
} from '../analytics/portfolioAttributionService';

export interface EstatePerformanceContext {
  attribution: ReturnAttribution;
  decomposition: PerformanceDecomposition;
  estateImpactSummary: string[];
  projectedAnnualGrowth: number;
  recommendedReviewDate: string;
}

/**
 * Enriches estate planning with portfolio performance attribution from Phase 89.
 * Uses return decomposition to project estate value growth and identify
 * factors that may impact beneficiary allocations.
 */
export function getEstatePerformanceContext(
  period: '1m' | '3m' | '6m' | '1y' | 'ytd' = '1y'
): EstatePerformanceContext {
  const attribution = getReturnAttribution(period);
  const decomposition = getPerformanceDecomposition(period);

  const summary: string[] = [];

  if (attribution.totalReturn > 10) {
    summary.push(
      `Portfolio has appreciated ${attribution.totalReturn.toFixed(1)}% in the past year. Estate valuation may need updating.`
    );
  } else if (attribution.totalReturn < -5) {
    summary.push(
      `Portfolio has declined ${Math.abs(attribution.totalReturn).toFixed(1)}%. Review beneficiary allocations for fairness.`
    );
  }

  if (decomposition.percentSkill > 50) {
    summary.push(
      `${decomposition.percentSkill}% of returns are skill-driven, suggesting active management adds value. Consider succession planning for collection management.`
    );
  }

  const topFactor = attribution.factors.reduce((best, f) =>
    Math.abs(f.contribution) > Math.abs(best.contribution) ? f : best
  );
  summary.push(
    `Largest return driver: ${topFactor.name.replace(/_/g, ' ')} (${topFactor.contribution > 0 ? '+' : ''}${topFactor.contribution.toFixed(1)}%). Factor concentration may affect estate value stability.`
  );

  // Projected annual growth based on recent performance
  const projectedAnnualGrowth = Math.round(attribution.totalReturn * 10) / 10;

  // Recommend review if significant changes
  const now = new Date();
  const reviewMonths = Math.abs(attribution.totalReturn) > 15 ? 3 : 6;
  now.setMonth(now.getMonth() + reviewMonths);
  const recommendedReviewDate = now.toISOString().slice(0, 10);

  return {
    attribution,
    decomposition,
    estateImpactSummary: summary,
    projectedAnnualGrowth,
    recommendedReviewDate,
  };
}
