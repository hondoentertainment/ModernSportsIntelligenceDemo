// @ts-nocheck
// Insurance & Appraisal Pipeline Service
// Production-grade insurance and appraisal workflow for sports card collections

// ─── Type Definitions ────────────────────────────────────────────────────────

export type InsuranceProvider = 'collectibles_insurance' | 'american_collectors' | 'hugh_wood' | 'berkley_asset' | 'custom';
export type CoverageLevel = 'basic' | 'standard' | 'premium' | 'institutional';
export type PolicyStatus = 'active' | 'pending' | 'expired' | 'cancelled' | 'suspended';
export type ClaimStatus = 'filed' | 'under_review' | 'approved' | 'denied' | 'settled' | 'closed';

export interface AppraisalComparable {
  id: string;
  description: string;
  saleDate: string;
  salePrice: number;
  venue: string;
  grade: string;
  condition: string;
  relevanceScore: number;
  source: string;
  url?: string;
}

export interface AppraisalLineItem {
  id: string;
  cardName: string;
  year: string;
  manufacturer: string;
  grade: string;
  grader: string;
  certNumber: string;
  fairMarketValue: number;
  replacementValue: number;
  liquidationValue: number;
  comparables: AppraisalComparable[];
  notes: string;
  imageUrl?: string;
}

export interface AppraisalCertification {
  certificationId: string;
  appraiserName: string;
  appraiserCredentials: string;
  appraiserLicense: string;
  irsCompliant: boolean;
  insuranceGrade: boolean;
   uspap: boolean;
  issuedDate: string;
  expirationDate: string;
  methodology: string;
}

export interface AppraisalReport {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'finalized' | 'expired';
  lineItems: AppraisalLineItem[];
  totalFairMarketValue: number;
  totalReplacementValue: number;
  totalLiquidationValue: number;
  certification: AppraisalCertification;
  purpose: 'insurance' | 'estate' | 'donation' | 'sale' | 'collateral';
  notes: string;
  pdfUrl?: string;
}

export interface InsurancePolicy {
  id: string;
  policyNumber: string;
  provider: InsuranceProvider;
  providerName: string;
  status: PolicyStatus;
  coverageLevel: CoverageLevel;
  coverageAmount: number;
  deductible: number;
  annualPremium: number;
  monthlyPremium: number;
  effectiveDate: string;
  expirationDate: string;
  renewalDate: string;
  autoRenew: boolean;
  coveredItems: number;
  coverageDetails: string[];
  exclusions: string[];
  lastAppraisalId?: string;
  lastAppraisalDate?: string;
}

export interface InsuranceClaim {
  id: string;
  claimNumber: string;
  policyId: string;
  status: ClaimStatus;
  filedDate: string;
  incidentDate: string;
  description: string;
  claimAmount: number;
  settledAmount?: number;
  adjusterId?: string;
  adjusterName?: string;
  category: 'damage' | 'theft' | 'loss' | 'fire' | 'water' | 'transit' | 'other';
  affectedItems: string[];
  timeline: { date: string; event: string; detail: string }[];
  documents: ClaimDocument[];
}

export interface ClaimDocument {
  id: string;
  claimId: string;
  name: string;
  type: 'photo' | 'receipt' | 'police_report' | 'appraisal' | 'proof_of_ownership' | 'correspondence' | 'other';
  status: 'required' | 'uploaded' | 'verified' | 'rejected';
  uploadedAt?: string;
  fileSize?: number;
  url?: string;
}

export interface CoverageRecommendation {
  id: string;
  type: 'increase_coverage' | 'add_rider' | 'switch_provider' | 'bundle' | 'upgrade_level' | 'reduce_deductible';
  title: string;
  description: string;
  currentValue: number;
  recommendedValue: number;
  estimatedCostChange: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
}

export interface PremiumEstimate {
  level: CoverageLevel;
  coverageAmount: number;
  annualPremium: number;
  monthlyPremium: number;
  deductible: number;
  ratePerThousand: number;
  features: string[];
  provider: InsuranceProvider;
  providerName: string;
}

export interface CollectionValuationSummary {
  totalFairMarketValue: number;
  totalReplacementValue: number;
  totalInsuredValue: number;
  coverageGap: number;
  coverageRatio: number;
  itemCount: number;
  insuredItemCount: number;
  uninsuredItemCount: number;
  highValueItems: { name: string; value: number; insured: boolean }[];
  valuationTrend: { month: string; fmv: number; insured: number }[];
  categoryBreakdown: { category: string; value: number; insured: number }[];
  lastAppraisalDate: string;
  nextRecommendedAppraisal: string;
}

export interface PolicyAdjustment {
  type: 'increase_coverage' | 'decrease_coverage' | 'change_deductible' | 'add_rider' | 'remove_rider' | 'change_level';
  newValue?: number;
  newLevel?: CoverageLevel;
  reason: string;
  effectiveDate: string;
}

// ─── Provider Metadata ───────────────────────────────────────────────────────

const PROVIDER_NAMES: Record<InsuranceProvider, string> = {
  collectibles_insurance: 'Collectibles Insurance Services',
  american_collectors: 'American Collectors Insurance',
  hugh_wood: 'Hugh Wood Inc.',
  berkley_asset: 'Berkley Asset Protection',
  custom: 'Custom / Private Policy',
};

const PREMIUM_RATES: Record<CoverageLevel, number> = {
  basic: 1.2,
  standard: 1.8,
  premium: 2.5,
  institutional: 3.4,
};

const DEDUCTIBLES: Record<CoverageLevel, number> = {
  basic: 2500,
  standard: 1000,
  premium: 500,
  institutional: 0,
};

const COVERAGE_FEATURES: Record<CoverageLevel, string[]> = {
  basic: [
    'Fire and theft coverage',
    'Named perils only',
    'Actual cash value payout',
  ],
  standard: [
    'All-risk coverage',
    'Agreed value payout',
    'Transit coverage (domestic)',
    'Show/exhibit coverage (30 days)',
  ],
  premium: [
    'All-risk coverage with worldwide transit',
    'Agreed value with replacement cost',
    'Show/exhibit coverage (unlimited)',
    'Pair & set clause',
    'Newly acquired items (90-day auto)',
    'Mysterious disappearance',
  ],
  institutional: [
    'Blanket all-risk worldwide coverage',
    'Replacement cost with market appreciation',
    'Unlimited show/exhibit/transit',
    'Pair & set clause with buyback option',
    'Automatic coverage for new acquisitions',
    'Mysterious disappearance',
    'Climate-controlled storage failure',
    'Dedicated claims adjuster',
    'Annual appraisal included',
  ],
};

// ─── Mock Data Generators ────────────────────────────────────────────────────

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
}

function randomDate(startDays: number, endDays: number): string {
  const now = Date.now();
  const start = now - startDays * 86400000;
  const end = now - endDays * 86400000;
  return new Date(start + Math.random() * (end - start)).toISOString().split('T')[0];
}

function futureDate(days: number): string {
  return new Date(Date.now() + days * 86400000).toISOString().split('T')[0];
}

// ─── Mock Comparables ────────────────────────────────────────────────────────

const MOCK_COMPARABLE_VENUES = ['Heritage Auctions', 'PWCC Marketplace', 'Goldin Auctions', 'eBay', 'REA Auctions', 'Lelands', 'Huggins & Scott'];

function generateComparables(cardName: string, baseValue: number): AppraisalComparable[] {
  const count = 3 + Math.floor(Math.random() * 4);
  return Array.from({ length: count }, (_, i) => ({
    id: generateId('comp'),
    description: `${cardName} - Comparable Sale #${i + 1}`,
    saleDate: randomDate(365, 1),
    salePrice: Math.round(baseValue * (0.75 + Math.random() * 0.5)),
    venue: MOCK_COMPARABLE_VENUES[Math.floor(Math.random() * MOCK_COMPARABLE_VENUES.length)],
    grade: ['PSA 9', 'PSA 10', 'BGS 9.5', 'SGC 9', 'PSA 8'][Math.floor(Math.random() * 5)],
    condition: 'Authenticated & Graded',
    relevanceScore: Math.round((0.7 + Math.random() * 0.3) * 100) / 100,
    source: ['Heritage Archives', 'PWCC Sales Data', '130point', 'Market Movers'][Math.floor(Math.random() * 4)],
  }));
}

// ─── Mock Appraisal Data ─────────────────────────────────────────────────────

const MOCK_CARDS = [
  { name: '1986 Fleer Michael Jordan #57', year: '1986', manufacturer: 'Fleer', grade: 'PSA 9', grader: 'PSA', fmv: 42500 },
  { name: '2003 Topps Chrome LeBron James #111', year: '2003', manufacturer: 'Topps', grade: 'BGS 9.5', grader: 'BGS', fmv: 28500 },
  { name: '2018 Panini Prizm Luka Doncic Silver #280', year: '2018', manufacturer: 'Panini', grade: 'PSA 10', grader: 'PSA', fmv: 6800 },
  { name: '1952 Topps Mickey Mantle #311', year: '1952', manufacturer: 'Topps', grade: 'PSA 5', grader: 'PSA', fmv: 185000 },
  { name: '2000 Playoff Contenders Tom Brady Auto #144', year: '2000', manufacturer: 'Playoff', grade: 'PSA 10', grader: 'PSA', fmv: 325000 },
  { name: '1993 SP Derek Jeter Foil #279', year: '1993', manufacturer: 'SP', grade: 'PSA 10', grader: 'PSA', fmv: 54000 },
  { name: '2009 Bowman Chrome Mike Trout Auto #BDPP89', year: '2009', manufacturer: 'Bowman', grade: 'BGS 9.5', grader: 'BGS', fmv: 72000 },
  { name: '1979 O-Pee-Chee Wayne Gretzky #18', year: '1979', manufacturer: 'O-Pee-Chee', grade: 'PSA 8', grader: 'PSA', fmv: 95000 },
  { name: '2017 Panini National Treasures Patrick Mahomes RPA', year: '2017', manufacturer: 'Panini', grade: 'BGS 9', grader: 'BGS', fmv: 48000 },
  { name: '1969 Topps Lew Alcindor #25', year: '1969', manufacturer: 'Topps', grade: 'PSA 8', grader: 'PSA', fmv: 18500 },
];

function buildAppraisalLineItems(count?: number): AppraisalLineItem[] {
  const cards = count ? MOCK_CARDS.slice(0, Math.min(count, MOCK_CARDS.length)) : MOCK_CARDS;
  return cards.map(card => ({
    id: generateId('item'),
    cardName: card.name,
    year: card.year,
    manufacturer: card.manufacturer,
    grade: card.grade,
    grader: card.grader,
    certNumber: `${Math.floor(10000000 + Math.random() * 89999999)}`,
    fairMarketValue: card.fmv,
    replacementValue: Math.round(card.fmv * 1.15),
    liquidationValue: Math.round(card.fmv * 0.72),
    comparables: generateComparables(card.name, card.fmv),
    notes: 'Authenticated and graded. Condition consistent with assigned grade.',
  }));
}

function buildCertification(): AppraisalCertification {
  return {
    certificationId: `CERT-${Date.now().toString(36).toUpperCase()}`,
    appraiserName: 'Dr. James T. Beckett III',
    appraiserCredentials: 'ISA CAPP, ASA, AAA',
    appraiserLicense: 'ISA-2024-00847',
    irsCompliant: true,
    insuranceGrade: true,
    uspap: true,
    issuedDate: new Date().toISOString().split('T')[0],
    expirationDate: futureDate(365),
    methodology: 'Comparable sales analysis with market adjustment factors per USPAP Standards Rule 7 & 8',
  };
}

// ─── Service Functions ───────────────────────────────────────────────────────

export function generateAppraisalReport(items: any[]): AppraisalReport {
  const lineItems = items.length > 0
    ? items.map(item => {
        const base = MOCK_CARDS[Math.floor(Math.random() * MOCK_CARDS.length)];
        const fmv = item.currentValue || item.purchasePrice || base.fmv;
        return {
          id: generateId('item'),
          cardName: item.name || item.cardName || base.name,
          year: item.year || base.year,
          manufacturer: item.manufacturer || base.manufacturer,
          grade: item.grade || base.grade,
          grader: item.grader || base.grader,
          certNumber: item.certNumber || `${Math.floor(10000000 + Math.random() * 89999999)}`,
          fairMarketValue: fmv,
          replacementValue: Math.round(fmv * 1.15),
          liquidationValue: Math.round(fmv * 0.72),
          comparables: generateComparables(item.name || base.name, fmv),
          notes: 'Authenticated and graded. Value determined via comparable sales analysis.',
        } as AppraisalLineItem;
      })
    : buildAppraisalLineItems(5);

  const totalFMV = lineItems.reduce((s, li) => s + li.fairMarketValue, 0);
  const totalReplacement = lineItems.reduce((s, li) => s + li.replacementValue, 0);
  const totalLiquidation = lineItems.reduce((s, li) => s + li.liquidationValue, 0);

  return {
    id: generateId('apr'),
    title: `Collection Appraisal - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'finalized',
    lineItems,
    totalFairMarketValue: totalFMV,
    totalReplacementValue: totalReplacement,
    totalLiquidationValue: totalLiquidation,
    certification: buildCertification(),
    purpose: 'insurance',
    notes: 'Appraisal performed for insurance coverage purposes. Values reflect current market conditions.',
    pdfUrl: '#',
  };
}

export function getAppraisalHistory(): AppraisalReport[] {
  const reports: AppraisalReport[] = [
    {
      id: 'apr-hist-001',
      title: 'Annual Collection Appraisal - 2025',
      createdAt: '2025-11-15T10:00:00Z',
      updatedAt: '2025-11-15T10:00:00Z',
      status: 'finalized',
      lineItems: buildAppraisalLineItems(8),
      totalFairMarketValue: 874300,
      totalReplacementValue: 1005445,
      totalLiquidationValue: 629496,
      certification: { ...buildCertification(), issuedDate: '2025-11-15', expirationDate: '2026-11-15' },
      purpose: 'insurance',
      notes: 'Annual appraisal for insurance renewal.',
      pdfUrl: '#',
    },
    {
      id: 'apr-hist-002',
      title: 'Acquisition Appraisal - Brady RC',
      createdAt: '2025-08-03T14:00:00Z',
      updatedAt: '2025-08-03T14:00:00Z',
      status: 'finalized',
      lineItems: buildAppraisalLineItems(1),
      totalFairMarketValue: 325000,
      totalReplacementValue: 373750,
      totalLiquidationValue: 234000,
      certification: { ...buildCertification(), issuedDate: '2025-08-03', expirationDate: '2026-08-03' },
      purpose: 'insurance',
      notes: 'Single-item appraisal for new high-value acquisition.',
      pdfUrl: '#',
    },
    {
      id: 'apr-hist-003',
      title: 'Estate Planning Appraisal - Q1 2025',
      createdAt: '2025-03-20T09:00:00Z',
      updatedAt: '2025-03-20T09:00:00Z',
      status: 'expired',
      lineItems: buildAppraisalLineItems(10),
      totalFairMarketValue: 792500,
      totalReplacementValue: 911375,
      totalLiquidationValue: 570600,
      certification: { ...buildCertification(), issuedDate: '2025-03-20', expirationDate: '2026-03-20' },
      purpose: 'estate',
      notes: 'Comprehensive appraisal for estate planning purposes.',
      pdfUrl: '#',
    },
  ];
  return reports;
}

export function getInsurancePolicies(): InsurancePolicy[] {
  return [
    {
      id: 'pol-001',
      policyNumber: 'CIS-2025-78432',
      provider: 'collectibles_insurance',
      providerName: PROVIDER_NAMES.collectibles_insurance,
      status: 'active',
      coverageLevel: 'premium',
      coverageAmount: 950000,
      deductible: 500,
      annualPremium: 2375,
      monthlyPremium: 198,
      effectiveDate: '2025-06-01',
      expirationDate: '2026-06-01',
      renewalDate: '2026-05-01',
      autoRenew: true,
      coveredItems: 42,
      coverageDetails: COVERAGE_FEATURES.premium,
      exclusions: ['War & civil unrest', 'Nuclear hazard', 'Intentional damage', 'Wear from improper storage'],
      lastAppraisalId: 'apr-hist-001',
      lastAppraisalDate: '2025-11-15',
    },
    {
      id: 'pol-002',
      policyNumber: 'ACI-2025-31887',
      provider: 'american_collectors',
      providerName: PROVIDER_NAMES.american_collectors,
      status: 'active',
      coverageLevel: 'standard',
      coverageAmount: 125000,
      deductible: 1000,
      annualPremium: 225,
      monthlyPremium: 19,
      effectiveDate: '2025-09-01',
      expirationDate: '2026-09-01',
      renewalDate: '2026-08-01',
      autoRenew: true,
      coveredItems: 15,
      coverageDetails: COVERAGE_FEATURES.standard,
      exclusions: ['War & civil unrest', 'Nuclear hazard', 'Intentional damage', 'Flood (separate rider available)'],
    },
    {
      id: 'pol-003',
      policyNumber: 'HW-2024-09213',
      provider: 'hugh_wood',
      providerName: PROVIDER_NAMES.hugh_wood,
      status: 'expired',
      coverageLevel: 'institutional',
      coverageAmount: 500000,
      deductible: 0,
      annualPremium: 1700,
      monthlyPremium: 142,
      effectiveDate: '2024-01-01',
      expirationDate: '2025-01-01',
      renewalDate: '2024-12-01',
      autoRenew: false,
      coveredItems: 25,
      coverageDetails: COVERAGE_FEATURES.institutional,
      exclusions: ['Intentional damage'],
    },
  ];
}

export function createPolicy(config: any): InsurancePolicy {
  const level = (config.coverageLevel || 'standard') as CoverageLevel;
  const provider = (config.provider || 'collectibles_insurance') as InsuranceProvider;
  const amount = config.coverageAmount || 100000;
  const rate = PREMIUM_RATES[level];
  const annual = Math.round((amount / 1000) * rate);

  return {
    id: generateId('pol'),
    policyNumber: `${provider.substring(0, 3).toUpperCase()}-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 89999)}`,
    provider,
    providerName: PROVIDER_NAMES[provider],
    status: 'pending',
    coverageLevel: level,
    coverageAmount: amount,
    deductible: DEDUCTIBLES[level],
    annualPremium: annual,
    monthlyPremium: Math.round(annual / 12),
    effectiveDate: futureDate(14),
    expirationDate: futureDate(379),
    renewalDate: futureDate(349),
    autoRenew: true,
    coveredItems: config.coveredItems || 0,
    coverageDetails: COVERAGE_FEATURES[level],
    exclusions: ['War & civil unrest', 'Nuclear hazard', 'Intentional damage'],
  };
}

export function updateCoverage(policyId: string, adjustment: PolicyAdjustment): InsurancePolicy {
  const policies = getInsurancePolicies();
  const policy = policies.find(p => p.id === policyId) || policies[0];

  const updated = { ...policy };
  if (adjustment.type === 'increase_coverage' || adjustment.type === 'decrease_coverage') {
    updated.coverageAmount = adjustment.newValue || policy.coverageAmount;
    const rate = PREMIUM_RATES[updated.coverageLevel];
    updated.annualPremium = Math.round((updated.coverageAmount / 1000) * rate);
    updated.monthlyPremium = Math.round(updated.annualPremium / 12);
  } else if (adjustment.type === 'change_level' && adjustment.newLevel) {
    updated.coverageLevel = adjustment.newLevel;
    updated.deductible = DEDUCTIBLES[adjustment.newLevel];
    const rate = PREMIUM_RATES[adjustment.newLevel];
    updated.annualPremium = Math.round((updated.coverageAmount / 1000) * rate);
    updated.monthlyPremium = Math.round(updated.annualPremium / 12);
    updated.coverageDetails = COVERAGE_FEATURES[adjustment.newLevel];
  } else if (adjustment.type === 'change_deductible') {
    updated.deductible = adjustment.newValue || policy.deductible;
  }

  return updated;
}

export function getCoverageRecommendations(portfolioValue: number): CoverageRecommendation[] {
  const policies = getInsurancePolicies().filter(p => p.status === 'active');
  const totalCoverage = policies.reduce((s, p) => s + p.coverageAmount, 0);
  const gap = portfolioValue - totalCoverage;

  const recs: CoverageRecommendation[] = [];

  if (gap > 0) {
    recs.push({
      id: generateId('rec'),
      type: 'increase_coverage',
      title: 'Close Coverage Gap',
      description: `Your collection is under-insured by $${gap.toLocaleString()}. Increase coverage to match current market value.`,
      currentValue: totalCoverage,
      recommendedValue: portfolioValue,
      estimatedCostChange: Math.round((gap / 1000) * 2.5),
      priority: gap / portfolioValue > 0.2 ? 'critical' : 'high',
      reason: 'Portfolio value exceeds total insured amount',
    });
  }

  if (policies.some(p => p.coverageLevel === 'basic' || p.coverageLevel === 'standard')) {
    recs.push({
      id: generateId('rec'),
      type: 'upgrade_level',
      title: 'Upgrade to Premium Coverage',
      description: 'Switch from standard to premium for all-risk worldwide coverage including mysterious disappearance.',
      currentValue: 0,
      recommendedValue: 0,
      estimatedCostChange: 450,
      priority: 'medium',
      reason: 'Standard coverage does not include transit or mysterious disappearance',
    });
  }

  recs.push({
    id: generateId('rec'),
    type: 'add_rider',
    title: 'Add Climate-Control Failure Rider',
    description: 'Protect against damage from HVAC or humidity control system failures in your storage facility.',
    currentValue: 0,
    recommendedValue: 0,
    estimatedCostChange: 120,
    priority: 'medium',
    reason: 'Climate damage is a common claim for high-value collections',
  });

  recs.push({
    id: generateId('rec'),
    type: 'reduce_deductible',
    title: 'Reduce Deductible on Secondary Policy',
    description: 'Lower the $1,000 deductible on your American Collectors policy to $250.',
    currentValue: 1000,
    recommendedValue: 250,
    estimatedCostChange: 85,
    priority: 'low',
    reason: 'Lower deductible provides better protection for mid-value items',
  });

  recs.push({
    id: generateId('rec'),
    type: 'bundle',
    title: 'Consolidate Policies with Single Provider',
    description: 'Bundling all coverage under one institutional policy could save 15-20% on premiums.',
    currentValue: 0,
    recommendedValue: 0,
    estimatedCostChange: -480,
    priority: 'medium',
    reason: 'Multi-policy discount available from institutional providers',
  });

  return recs;
}

export function estimatePremium(value: number, level: CoverageLevel): PremiumEstimate {
  const rate = PREMIUM_RATES[level];
  const annual = Math.round((value / 1000) * rate);
  const providers: InsuranceProvider[] = ['collectibles_insurance', 'american_collectors', 'berkley_asset', 'hugh_wood'];
  const provider = providers[Math.floor(Math.random() * providers.length)];

  return {
    level,
    coverageAmount: value,
    annualPremium: annual,
    monthlyPremium: Math.round(annual / 12),
    deductible: DEDUCTIBLES[level],
    ratePerThousand: rate,
    features: COVERAGE_FEATURES[level],
    provider,
    providerName: PROVIDER_NAMES[provider],
  };
}

export function fileClaim(policyId: string, details: any): InsuranceClaim {
  const claimNum = `CLM-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 89999)}`;
  const now = new Date().toISOString().split('T')[0];

  return {
    id: generateId('clm'),
    claimNumber: claimNum,
    policyId,
    status: 'filed',
    filedDate: now,
    incidentDate: details.incidentDate || now,
    description: details.description || 'Claim filed for covered item.',
    claimAmount: details.claimAmount || 5000,
    category: details.category || 'damage',
    affectedItems: details.affectedItems || ['Unknown item'],
    timeline: [
      { date: now, event: 'Claim Filed', detail: 'Claim submitted for review.' },
    ],
    documents: [
      { id: generateId('doc'), claimId: '', name: 'Proof of Ownership', type: 'proof_of_ownership', status: 'required' },
      { id: generateId('doc'), claimId: '', name: 'Photos of Damage', type: 'photo', status: 'required' },
      { id: generateId('doc'), claimId: '', name: 'Original Purchase Receipt', type: 'receipt', status: 'required' },
      { id: generateId('doc'), claimId: '', name: 'Appraisal Report', type: 'appraisal', status: 'required' },
    ],
  };
}

export function getClaims(): InsuranceClaim[] {
  return [
    {
      id: 'clm-001',
      claimNumber: 'CLM-2025-44821',
      policyId: 'pol-001',
      status: 'settled',
      filedDate: '2025-07-10',
      incidentDate: '2025-07-08',
      description: 'Water damage to 3 cards during basement flooding event. Cards were in sealed cases but water infiltrated the storage cabinet.',
      claimAmount: 18500,
      settledAmount: 17200,
      adjusterId: 'ADJ-112',
      adjusterName: 'Patricia Chen',
      category: 'water',
      affectedItems: ['1993 SP Derek Jeter Foil #279', '1969 Topps Lew Alcindor #25', '2018 Panini Prizm Luka Doncic Silver #280'],
      timeline: [
        { date: '2025-07-10', event: 'Claim Filed', detail: 'Initial claim submitted with photos.' },
        { date: '2025-07-12', event: 'Adjuster Assigned', detail: 'Patricia Chen assigned to claim.' },
        { date: '2025-07-15', event: 'Documentation Requested', detail: 'Additional photos and appraisal report requested.' },
        { date: '2025-07-18', event: 'Documents Received', detail: 'All required documentation verified.' },
        { date: '2025-07-25', event: 'Inspection Complete', detail: 'Physical inspection of damaged items completed.' },
        { date: '2025-08-02', event: 'Claim Approved', detail: 'Claim approved for $17,200 (agreed value less deductible).' },
        { date: '2025-08-10', event: 'Payment Issued', detail: 'Settlement payment of $17,200 issued via ACH transfer.' },
      ],
      documents: [
        { id: 'doc-001', claimId: 'clm-001', name: 'Flood Photos', type: 'photo', status: 'verified', uploadedAt: '2025-07-10' },
        { id: 'doc-002', claimId: 'clm-001', name: 'Purchase Receipts', type: 'receipt', status: 'verified', uploadedAt: '2025-07-10' },
        { id: 'doc-003', claimId: 'clm-001', name: 'Appraisal Report', type: 'appraisal', status: 'verified', uploadedAt: '2025-07-15' },
        { id: 'doc-004', claimId: 'clm-001', name: 'Proof of Ownership', type: 'proof_of_ownership', status: 'verified', uploadedAt: '2025-07-15' },
      ],
    },
    {
      id: 'clm-002',
      claimNumber: 'CLM-2026-01193',
      policyId: 'pol-001',
      status: 'under_review',
      filedDate: '2026-02-18',
      incidentDate: '2026-02-15',
      description: 'Shipping damage during transit to card show. 1986 Fleer Jordan #57 case cracked, card surface scratched.',
      claimAmount: 42500,
      adjusterId: 'ADJ-087',
      adjusterName: 'Robert Stinson',
      category: 'transit',
      affectedItems: ['1986 Fleer Michael Jordan #57'],
      timeline: [
        { date: '2026-02-18', event: 'Claim Filed', detail: 'Transit damage claim submitted.' },
        { date: '2026-02-20', event: 'Adjuster Assigned', detail: 'Robert Stinson assigned to claim.' },
        { date: '2026-02-25', event: 'Documentation Requested', detail: 'Shipping records and before/after photos requested.' },
        { date: '2026-03-01', event: 'Documents Received', detail: 'Shipping manifest and photos uploaded.' },
        { date: '2026-03-10', event: 'Under Review', detail: 'Claim under active review. Re-grading assessment pending.' },
      ],
      documents: [
        { id: 'doc-005', claimId: 'clm-002', name: 'Damage Photos', type: 'photo', status: 'verified', uploadedAt: '2026-02-18' },
        { id: 'doc-006', claimId: 'clm-002', name: 'Shipping Manifest', type: 'other', status: 'verified', uploadedAt: '2026-02-25' },
        { id: 'doc-007', claimId: 'clm-002', name: 'Original Appraisal', type: 'appraisal', status: 'verified', uploadedAt: '2026-02-25' },
        { id: 'doc-008', claimId: 'clm-002', name: 'Police Report', type: 'police_report', status: 'required' },
      ],
    },
    {
      id: 'clm-003',
      claimNumber: 'CLM-2025-22105',
      policyId: 'pol-002',
      status: 'denied',
      filedDate: '2025-04-05',
      incidentDate: '2025-03-28',
      description: 'Claim for alleged theft of 2 cards from display case at home. No evidence of forced entry.',
      claimAmount: 8200,
      adjusterId: 'ADJ-054',
      adjusterName: 'Maria Gonzales',
      category: 'theft',
      affectedItems: ['2009 Bowman Chrome Mike Trout Auto', '2017 Panini National Treasures Mahomes RPA'],
      timeline: [
        { date: '2025-04-05', event: 'Claim Filed', detail: 'Theft claim submitted.' },
        { date: '2025-04-08', event: 'Adjuster Assigned', detail: 'Maria Gonzales assigned.' },
        { date: '2025-04-12', event: 'Investigation Started', detail: 'Home visit scheduled for investigation.' },
        { date: '2025-04-20', event: 'Documentation Issue', detail: 'Police report does not confirm forced entry.' },
        { date: '2025-05-01', event: 'Claim Denied', detail: 'Claim denied: standard policy does not cover mysterious disappearance. Upgrade to premium recommended.' },
      ],
      documents: [
        { id: 'doc-009', claimId: 'clm-003', name: 'Police Report', type: 'police_report', status: 'verified', uploadedAt: '2025-04-05' },
        { id: 'doc-010', claimId: 'clm-003', name: 'Home Security Footage', type: 'other', status: 'verified', uploadedAt: '2025-04-10' },
      ],
    },
  ];
}

export function getClaimDocuments(claimId: string): ClaimDocument[] {
  const claims = getClaims();
  const claim = claims.find(c => c.id === claimId);
  return claim?.documents || [];
}

export function getCollectionValuationSummary(): CollectionValuationSummary {
  const policies = getInsurancePolicies().filter(p => p.status === 'active');
  const totalInsured = policies.reduce((s, p) => s + p.coverageAmount, 0);
  const totalFMV = 1125000;
  const totalReplacement = Math.round(totalFMV * 1.15);

  return {
    totalFairMarketValue: totalFMV,
    totalReplacementValue: totalReplacement,
    totalInsuredValue: totalInsured,
    coverageGap: totalFMV - totalInsured,
    coverageRatio: Math.round((totalInsured / totalFMV) * 100) / 100,
    itemCount: 57,
    insuredItemCount: 42,
    uninsuredItemCount: 15,
    highValueItems: [
      { name: '2000 Playoff Contenders Tom Brady Auto #144', value: 325000, insured: true },
      { name: '1952 Topps Mickey Mantle #311', value: 185000, insured: true },
      { name: '1979 O-Pee-Chee Wayne Gretzky #18', value: 95000, insured: true },
      { name: '2009 Bowman Chrome Mike Trout Auto', value: 72000, insured: true },
      { name: '1993 SP Derek Jeter Foil #279', value: 54000, insured: true },
      { name: '2017 Panini National Treasures Mahomes RPA', value: 48000, insured: false },
      { name: '1986 Fleer Michael Jordan #57', value: 42500, insured: true },
      { name: '2003 Topps Chrome LeBron James #111', value: 28500, insured: false },
    ],
    valuationTrend: [
      { month: 'Oct 2025', fmv: 980000, insured: 900000 },
      { month: 'Nov 2025', fmv: 1010000, insured: 950000 },
      { month: 'Dec 2025', fmv: 1045000, insured: 950000 },
      { month: 'Jan 2026', fmv: 1080000, insured: 1075000 },
      { month: 'Feb 2026', fmv: 1105000, insured: 1075000 },
      { month: 'Mar 2026', fmv: 1125000, insured: 1075000 },
    ],
    categoryBreakdown: [
      { category: 'Basketball', value: 320000, insured: 295000 },
      { category: 'Football', value: 373000, insured: 373000 },
      { category: 'Baseball', value: 312000, insured: 280000 },
      { category: 'Hockey', value: 95000, insured: 95000 },
      { category: 'Other', value: 25000, insured: 12000 },
    ],
    lastAppraisalDate: '2025-11-15',
    nextRecommendedAppraisal: '2026-05-15',
  };
}

export function getComparables(cardDescription: string): AppraisalComparable[] {
  const baseValue = 10000 + Math.random() * 50000;
  return generateComparables(cardDescription, baseValue);
}
