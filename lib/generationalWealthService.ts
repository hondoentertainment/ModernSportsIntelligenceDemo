// ---- Types ----

export type TrustType =
  | 'revocable_living'
  | 'irrevocable'
  | 'charitable_remainder'
  | 'grantor_retained'
  | 'dynasty'
  | 'qualified_personal_residence';

export type RelationshipType =
  | 'spouse'
  | 'child'
  | 'grandchild'
  | 'sibling'
  | 'charity'
  | 'trust'
  | 'other';

export interface Beneficiary {
  id: string;
  name: string;
  relationship: RelationshipType;
  allocationPercent: number;
  assignedAssets: string[];
  contingent: boolean;
  minorProtection: boolean;
  dateOfBirth?: string;
  notes?: string;
}

export interface TrustStructure {
  id: string;
  type: TrustType;
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  taxImplications: string;
  estimatedSetupCost: number;
  annualMaintenanceCost: number;
  recommendedMinValue: number;
  assetProtection: boolean;
  revocable: boolean;
  taxBenefit: 'high' | 'medium' | 'low';
}

export interface InheritanceTaxProjection {
  federalExemption: number;
  federalRate: number;
  federalTaxOwed: number;
  stateExemption: number;
  stateRate: number;
  stateTaxOwed: number;
  totalTaxOwed: number;
  effectiveRate: number;
  state: string;
  strategies: string[];
  netToHeirs: number;
}

export interface StepUpBasis {
  assetId: string;
  assetName: string;
  originalBasis: number;
  currentFairMarketValue: number;
  stepUpAmount: number;
  taxSavings: number;
  capitalGainsAvoided: number;
}

export interface BequestAssignment {
  id: string;
  assetId: string;
  assetName: string;
  beneficiaryId: string;
  beneficiaryName: string;
  estimatedValue: number;
  assignedDate: string;
  conditions?: string;
}

export interface DocumentTemplate {
  id: string;
  type: 'will_excerpt' | 'trust_summary' | 'appraisal_letter' | 'insurance_certificate' | 'beneficiary_designation' | 'gift_letter';
  title: string;
  generatedDate: string;
  content: string;
  status: 'draft' | 'review' | 'final';
  signatures: string[];
}

export interface EstateSummary {
  totalValue: number;
  totalAssets: number;
  beneficiaryCount: number;
  taxExposure: number;
  taxExposurePercent: number;
  protectedValue: number;
  unassignedValue: number;
  nextReviewDate: string;
  estateHealth: 'excellent' | 'good' | 'needs_attention' | 'critical';
  recommendations: string[];
}

export interface AssetDistribution {
  beneficiaryId: string;
  beneficiaryName: string;
  totalValue: number;
  percentOfEstate: number;
  assetCount: number;
}

export interface TaxStrategy {
  id: string;
  name: string;
  description: string;
  potentialSavings: number;
  complexity: 'low' | 'medium' | 'high';
  timeframe: string;
  requirements: string[];
  recommended: boolean;
}

export interface LegacyTimeline {
  milestones: LegacyMilestone[];
  currentYear: number;
  projectedEndYear: number;
}

export interface LegacyMilestone {
  id: string;
  year: number;
  title: string;
  description: string;
  type: 'review' | 'distribution' | 'beneficiary_age' | 'trust_event' | 'tax_event';
  icon: string;
}

export interface GenerationalTransfer {
  id: string;
  fromGeneration: string;
  toGeneration: string;
  estimatedValue: number;
  transferMethod: string;
  taxImplication: number;
  timeline: string;
}

export interface WealthProjection {
  year: number;
  portfolioValue: number;
  appreciatedValue: number;
  taxLiability: number;
  netToHeirs: number;
  inflationAdjusted: number;
}

export interface CharitableGiving {
  id: string;
  name: string;
  type: 'donor_advised_fund' | 'charitable_trust' | 'direct_donation' | 'private_foundation';
  description: string;
  taxDeduction: number;
  annualLimit: string;
  benefits: string[];
  estimatedSavings: number;
}

export interface EstatePlan {
  id: string;
  name: string;
  totalValue: number;
  beneficiaries: Beneficiary[];
  trusts: TrustStructure[];
  taxProjection: InheritanceTaxProjection;
  bequests: BequestAssignment[];
  documents: DocumentTemplate[];
  createdAt: string;
  updatedAt: string;
  reviewDate: string;
}

// ---- Mock Data ----

const mockBeneficiaries: Beneficiary[] = [
  {
    id: 'ben-001',
    name: 'Sarah Mitchell',
    relationship: 'spouse',
    allocationPercent: 40,
    assignedAssets: ['asset-001', 'asset-005', 'asset-009'],
    contingent: false,
    minorProtection: false,
    dateOfBirth: '1982-06-15',
    notes: 'Primary beneficiary — unlimited marital deduction applies',
  },
  {
    id: 'ben-002',
    name: 'James Mitchell Jr.',
    relationship: 'child',
    allocationPercent: 25,
    assignedAssets: ['asset-002', 'asset-006'],
    contingent: false,
    minorProtection: false,
    dateOfBirth: '2005-03-22',
    notes: 'Receives distribution at age 25 per trust terms',
  },
  {
    id: 'ben-003',
    name: 'Emma Mitchell',
    relationship: 'child',
    allocationPercent: 25,
    assignedAssets: ['asset-003', 'asset-007'],
    contingent: false,
    minorProtection: true,
    dateOfBirth: '2012-11-08',
    notes: 'Minor — UTMA custodial account until age 21',
  },
  {
    id: 'ben-004',
    name: 'National Sports Collectors Foundation',
    relationship: 'charity',
    allocationPercent: 10,
    assignedAssets: ['asset-004'],
    contingent: true,
    minorProtection: false,
    notes: 'Charitable remainder — qualifies for estate tax deduction',
  },
];

const mockTrusts: TrustStructure[] = [
  {
    id: 'trust-001',
    type: 'revocable_living',
    name: 'Revocable Living Trust',
    description:
      'A flexible trust that allows you to maintain control over your collectible assets during your lifetime while avoiding probate for your heirs.',
    pros: [
      'Avoids probate court',
      'Maintains privacy',
      'Can be modified at any time',
      'You retain full control',
      'Seamless disability management',
    ],
    cons: [
      'No estate tax benefits',
      'Assets still part of taxable estate',
      'Setup and maintenance costs',
      'Must fund the trust properly',
    ],
    taxImplications: 'No income tax or estate tax benefits. Assets included in gross estate for federal estate tax purposes.',
    estimatedSetupCost: 2500,
    annualMaintenanceCost: 500,
    recommendedMinValue: 100000,
    assetProtection: false,
    revocable: true,
    taxBenefit: 'low',
  },
  {
    id: 'trust-002',
    type: 'irrevocable',
    name: 'Irrevocable Life Insurance Trust (ILIT)',
    description:
      'Removes high-value collectibles from your taxable estate permanently. Ideal for collections exceeding the federal exemption.',
    pros: [
      'Removes assets from taxable estate',
      'Creditor protection',
      'Generation-skipping potential',
      'Fixed estate tax value at transfer',
    ],
    cons: [
      'Cannot be modified once created',
      'Loss of control over assets',
      'Gift tax implications on transfer',
      'Complex administration',
    ],
    taxImplications:
      'Removes assets from gross estate. Transfer may trigger gift tax if exceeding annual exclusion. Assets appreciate outside estate.',
    estimatedSetupCost: 5000,
    annualMaintenanceCost: 1200,
    recommendedMinValue: 500000,
    assetProtection: true,
    revocable: false,
    taxBenefit: 'high',
  },
  {
    id: 'trust-003',
    type: 'charitable_remainder',
    name: 'Charitable Remainder Trust (CRT)',
    description:
      'Donate appreciated collectibles to receive an income stream and significant tax deductions while supporting a cause you care about.',
    pros: [
      'Immediate charitable income tax deduction',
      'Avoid capital gains on appreciated assets',
      'Income stream for life or term of years',
      'Reduce estate tax liability',
    ],
    cons: [
      'Irrevocable — charity receives remainder',
      'Complex IRS compliance',
      'Minimum 10% remainder requirement',
      'Annual filing requirements',
    ],
    taxImplications:
      'Immediate income tax deduction of present value of remainder interest. Capital gains deferred. Estate tax reduced by charitable portion.',
    estimatedSetupCost: 4000,
    annualMaintenanceCost: 1500,
    recommendedMinValue: 250000,
    assetProtection: false,
    revocable: false,
    taxBenefit: 'high',
  },
];

const mockBequests: BequestAssignment[] = [
  {
    id: 'beq-001',
    assetId: 'asset-001',
    assetName: '1952 Topps Mickey Mantle #311 PSA 8',
    beneficiaryId: 'ben-001',
    beneficiaryName: 'Sarah Mitchell',
    estimatedValue: 485000,
    assignedDate: '2025-09-15',
    conditions: 'Outright bequest with no restrictions',
  },
  {
    id: 'beq-002',
    assetId: 'asset-002',
    assetName: '1986 Fleer Michael Jordan #57 PSA 10',
    beneficiaryId: 'ben-002',
    beneficiaryName: 'James Mitchell Jr.',
    estimatedValue: 195000,
    assignedDate: '2025-09-15',
    conditions: 'Held in trust until age 25',
  },
  {
    id: 'beq-003',
    assetId: 'asset-003',
    assetName: '2003 Topps Chrome LeBron James #111 PSA 10',
    beneficiaryId: 'ben-003',
    beneficiaryName: 'Emma Mitchell',
    estimatedValue: 82000,
    assignedDate: '2025-09-15',
    conditions: 'UTMA custodial until age 21; trustee discretion thereafter',
  },
  {
    id: 'beq-004',
    assetId: 'asset-004',
    assetName: '1909 T206 Honus Wagner SGC 3',
    beneficiaryId: 'ben-004',
    beneficiaryName: 'National Sports Collectors Foundation',
    estimatedValue: 320000,
    assignedDate: '2025-09-15',
    conditions: 'Charitable remainder — donated at fair market value for tax deduction',
  },
  {
    id: 'beq-005',
    assetId: 'asset-005',
    assetName: '1979 O-Pee-Chee Wayne Gretzky #18 PSA 9',
    beneficiaryId: 'ben-001',
    beneficiaryName: 'Sarah Mitchell',
    estimatedValue: 165000,
    assignedDate: '2025-10-01',
  },
  {
    id: 'beq-006',
    assetId: 'asset-006',
    assetName: '2018 Panini Prizm Luka Doncic #280 PSA 10',
    beneficiaryId: 'ben-002',
    beneficiaryName: 'James Mitchell Jr.',
    estimatedValue: 48000,
    assignedDate: '2025-10-01',
  },
];

const mockDocuments: DocumentTemplate[] = [
  {
    id: 'doc-001',
    type: 'will_excerpt',
    title: 'Last Will & Testament — Collectibles Schedule',
    generatedDate: '2025-11-01',
    content: `ARTICLE VII — TANGIBLE PERSONAL PROPERTY (COLLECTIBLES)

Section 7.1. I direct that my sports memorabilia and collectible card collection, as itemized in Schedule C attached hereto, shall be distributed as follows:

(a) To my spouse, SARAH MITCHELL, I give and bequeath the items identified as Lots 1, 5, and 9 on Schedule C, having an aggregate appraised value of approximately $650,000 as of the date of this instrument.

(b) To my son, JAMES MITCHELL JR., I give and bequeath the items identified as Lots 2 and 6, to be held in trust pursuant to Article IX until he attains the age of twenty-five (25) years.

(c) To my daughter, EMMA MITCHELL, I give and bequeath the items identified as Lots 3 and 7, to be held pursuant to the Uniform Transfers to Minors Act until she attains the age of twenty-one (21) years.

(d) To the NATIONAL SPORTS COLLECTORS FOUNDATION, I give the item identified as Lot 4, qualifying as a charitable bequest under IRC §2055.

Section 7.2. In the event any beneficiary predeceases me, their share shall pass to their living descendants, per stirpes.`,
    status: 'review',
    signatures: ['Testator', 'Witness 1', 'Witness 2', 'Notary Public'],
  },
  {
    id: 'doc-002',
    type: 'trust_summary',
    title: 'Revocable Living Trust — Collectibles Amendment',
    generatedDate: '2025-11-01',
    content: `THE MITCHELL FAMILY REVOCABLE TRUST
Amendment No. 3 — Sports Collectibles Schedule

This Amendment modifies the Mitchell Family Revocable Trust dated January 15, 2020 to incorporate the Grantor's sports memorabilia collection into the trust corpus.

SCHEDULE OF COLLECTIBLE ASSETS:
Total appraised value: $1,847,500
Number of items: 47 graded cards, 12 authenticated memorabilia pieces
Last professional appraisal: October 15, 2025
Appraiser: Heritage Auctions / PSA

DISTRIBUTION PROVISIONS:
Upon the death of the Grantor, the Trustee shall distribute the collectible assets in accordance with the allocation schedule set forth in Exhibit A, subject to the following conditions...`,
    status: 'draft',
    signatures: ['Grantor', 'Trustee', 'Successor Trustee'],
  },
  {
    id: 'doc-003',
    type: 'appraisal_letter',
    title: 'Collection Appraisal Summary for Estate Purposes',
    generatedDate: '2025-11-15',
    content: `QUALIFIED APPRAISAL — IRS FORM 8283 SUPPORTING DOCUMENTATION

Appraiser: Certified Sports Memorabilia Valuation Services
Date of Appraisal: November 15, 2025
Purpose: Estate planning and charitable donation substantiation

SUMMARY OF APPRAISED VALUES:
Total collection fair market value: $1,847,500
Cost basis (original acquisition): $412,300
Unrealized appreciation: $1,435,200

Top 5 items by value:
1. 1952 Topps Mickey Mantle #311 PSA 8 — $485,000
2. 1909 T206 Honus Wagner SGC 3 — $320,000
3. 1986 Fleer Michael Jordan #57 PSA 10 — $195,000
4. 1979 O-Pee-Chee Wayne Gretzky #18 PSA 9 — $165,000
5. 2003 Topps Chrome LeBron James #111 PSA 10 — $82,000

This appraisal has been prepared in compliance with the Uniform Standards of Professional Appraisal Practice (USPAP) and IRS requirements for qualified appraisals under IRC §170(f)(11)(E).`,
    status: 'final',
    signatures: ['Certified Appraiser', 'Collection Owner'],
  },
  {
    id: 'doc-004',
    type: 'insurance_certificate',
    title: 'Collectibles Insurance Certificate',
    generatedDate: '2025-12-01',
    content: `CERTIFICATE OF INSURANCE — SCHEDULED PERSONAL PROPERTY

Policy Number: SP-2025-847291
Insured: James Mitchell
Coverage Type: Agreed Value — Scheduled Articles
Effective Date: December 1, 2025
Expiration Date: December 1, 2026

SCHEDULED ITEMS — SPORTS COLLECTIBLES:
Total insured value: $1,847,500
Deductible: $0 (zero deductible for scheduled items)
Coverage: All-risk, worldwide, including transit and exhibition

SPECIAL CONDITIONS:
- Items stored in approved climate-controlled vault
- Annual reappraisal required for items exceeding $100,000
- 48-hour notice required before removing items from primary storage
- Exhibition coverage requires prior written approval`,
    status: 'final',
    signatures: ['Underwriter', 'Insurance Agent', 'Policyholder'],
  },
];

// ---- State tax data ----

interface StateTaxInfo {
  hasEstateTax: boolean;
  exemption: number;
  topRate: number;
}

const stateTaxData: Record<string, StateTaxInfo> = {
  'New York': { hasEstateTax: true, exemption: 6940000, topRate: 16 },
  'Massachusetts': { hasEstateTax: true, exemption: 2000000, topRate: 16 },
  'Oregon': { hasEstateTax: true, exemption: 1000000, topRate: 16 },
  'Minnesota': { hasEstateTax: true, exemption: 3000000, topRate: 16 },
  'Washington': { hasEstateTax: true, exemption: 2193000, topRate: 20 },
  'Illinois': { hasEstateTax: true, exemption: 4000000, topRate: 16 },
  'Maryland': { hasEstateTax: true, exemption: 5000000, topRate: 16 },
  'Connecticut': { hasEstateTax: true, exemption: 13610000, topRate: 12 },
  'Hawaii': { hasEstateTax: true, exemption: 5490000, topRate: 20 },
  'Vermont': { hasEstateTax: true, exemption: 5000000, topRate: 16 },
  'Maine': { hasEstateTax: true, exemption: 6800000, topRate: 12 },
  'Rhode Island': { hasEstateTax: true, exemption: 1774583, topRate: 16 },
  'California': { hasEstateTax: false, exemption: 0, topRate: 0 },
  'Texas': { hasEstateTax: false, exemption: 0, topRate: 0 },
  'Florida': { hasEstateTax: false, exemption: 0, topRate: 0 },
  'Nevada': { hasEstateTax: false, exemption: 0, topRate: 0 },
};

const FEDERAL_EXEMPTION = 13610000; // 2025 federal estate tax exemption
const FEDERAL_TOP_RATE = 40;

// ---- Service Functions ----

export function getEstatePlan(): EstatePlan {
  const taxProjection = calculateInheritanceTax(1847500, 'New York');

  return {
    id: 'plan-001',
    name: 'Mitchell Family Sports Collection Estate Plan',
    totalValue: 1847500,
    beneficiaries: mockBeneficiaries,
    trusts: mockTrusts,
    taxProjection,
    bequests: mockBequests,
    documents: mockDocuments,
    createdAt: '2025-08-01',
    updatedAt: '2025-12-15',
    reviewDate: '2026-06-01',
  };
}

export function createBeneficiary(b: Partial<Beneficiary>): Beneficiary {
  return {
    id: `ben-${Date.now()}`,
    name: b.name || 'New Beneficiary',
    relationship: b.relationship || 'other',
    allocationPercent: b.allocationPercent || 0,
    assignedAssets: b.assignedAssets || [],
    contingent: b.contingent || false,
    minorProtection: b.minorProtection || false,
    dateOfBirth: b.dateOfBirth,
    notes: b.notes,
  };
}

export function assignAssetToBeneficiary(
  assetId: string,
  beneficiaryId: string
): BequestAssignment {
  const beneficiary = mockBeneficiaries.find((b) => b.id === beneficiaryId);
  return {
    id: `beq-${Date.now()}`,
    assetId,
    assetName: `Asset ${assetId}`,
    beneficiaryId,
    beneficiaryName: beneficiary?.name || 'Unknown',
    estimatedValue: 50000,
    assignedDate: new Date().toISOString().split('T')[0],
  };
}

export function calculateInheritanceTax(
  totalValue: number,
  state: string
): InheritanceTaxProjection {
  // Federal calculation
  const federalTaxable = Math.max(0, totalValue - FEDERAL_EXEMPTION);
  const federalTaxOwed = federalTaxable * (FEDERAL_TOP_RATE / 100);

  // State calculation
  const stateInfo = stateTaxData[state] || { hasEstateTax: false, exemption: 0, topRate: 0 };
  let stateTaxOwed = 0;
  if (stateInfo.hasEstateTax) {
    const stateTaxable = Math.max(0, totalValue - stateInfo.exemption);
    stateTaxOwed = stateTaxable * (stateInfo.topRate / 100) * 0.6; // simplified progressive
  }

  const totalTaxOwed = federalTaxOwed + stateTaxOwed;
  const effectiveRate = totalValue > 0 ? (totalTaxOwed / totalValue) * 100 : 0;

  const strategies: string[] = [];
  if (totalValue > 1000000) strategies.push('Consider irrevocable trust to remove assets from estate');
  if (totalValue > 500000) strategies.push('Annual gifting strategy — $18,000 per recipient per year');
  if (stateInfo.hasEstateTax) strategies.push(`Relocate to state without estate tax to save ${formatCurrency(stateTaxOwed)}`);
  strategies.push('Charitable remainder trust for appreciated collectibles');
  strategies.push('Leverage step-up in basis for heirs to eliminate capital gains');

  return {
    federalExemption: FEDERAL_EXEMPTION,
    federalRate: FEDERAL_TOP_RATE,
    federalTaxOwed,
    stateExemption: stateInfo.exemption,
    stateRate: stateInfo.topRate,
    stateTaxOwed,
    totalTaxOwed,
    effectiveRate,
    state,
    strategies,
    netToHeirs: totalValue - totalTaxOwed,
  };
}

export function calculateStepUpBasis(
  _assets?: unknown[]
): StepUpBasis[] {
  return [
    {
      assetId: 'asset-001',
      assetName: '1952 Topps Mickey Mantle #311 PSA 8',
      originalBasis: 45000,
      currentFairMarketValue: 485000,
      stepUpAmount: 440000,
      taxSavings: 92400,
      capitalGainsAvoided: 440000,
    },
    {
      assetId: 'asset-002',
      assetName: '1986 Fleer Michael Jordan #57 PSA 10',
      originalBasis: 28000,
      currentFairMarketValue: 195000,
      stepUpAmount: 167000,
      taxSavings: 35070,
      capitalGainsAvoided: 167000,
    },
    {
      assetId: 'asset-003',
      assetName: '2003 Topps Chrome LeBron James #111 PSA 10',
      originalBasis: 5200,
      currentFairMarketValue: 82000,
      stepUpAmount: 76800,
      taxSavings: 16128,
      capitalGainsAvoided: 76800,
    },
    {
      assetId: 'asset-004',
      assetName: '1909 T206 Honus Wagner SGC 3',
      originalBasis: 120000,
      currentFairMarketValue: 320000,
      stepUpAmount: 200000,
      taxSavings: 42000,
      capitalGainsAvoided: 200000,
    },
    {
      assetId: 'asset-005',
      assetName: '1979 O-Pee-Chee Wayne Gretzky #18 PSA 9',
      originalBasis: 18000,
      currentFairMarketValue: 165000,
      stepUpAmount: 147000,
      taxSavings: 30870,
      capitalGainsAvoided: 147000,
    },
    {
      assetId: 'asset-006',
      assetName: '2018 Panini Prizm Luka Doncic #280 PSA 10',
      originalBasis: 8500,
      currentFairMarketValue: 48000,
      stepUpAmount: 39500,
      taxSavings: 8295,
      capitalGainsAvoided: 39500,
    },
  ];
}

export function getTrustRecommendations(portfolioValue: number): TrustStructure[] {
  return mockTrusts.filter((t) => portfolioValue >= t.recommendedMinValue);
}

export function generateDocument(type: string): DocumentTemplate {
  const doc = mockDocuments.find((d) => d.type === type);
  if (doc) return { ...doc, generatedDate: new Date().toISOString().split('T')[0] };
  return {
    id: `doc-${Date.now()}`,
    type: type as DocumentTemplate['type'],
    title: `Generated ${type.replace(/_/g, ' ')}`,
    generatedDate: new Date().toISOString().split('T')[0],
    content: `Document template for ${type}. Please consult your estate planning attorney for final review.`,
    status: 'draft',
    signatures: ['Owner'],
  };
}

export function getWealthProjection(years: number): WealthProjection[] {
  const baseValue = 1847500;
  const appreciationRate = 0.072; // 7.2% annual for collectibles
  const inflationRate = 0.031;
  const projections: WealthProjection[] = [];

  for (let i = 0; i <= years; i++) {
    const portfolioValue = baseValue * Math.pow(1 + appreciationRate, i);
    const appreciatedValue = portfolioValue - baseValue;
    const federalTaxable = Math.max(0, portfolioValue - FEDERAL_EXEMPTION);
    const taxLiability = federalTaxable * 0.4;
    const netToHeirs = portfolioValue - taxLiability;
    const inflationAdjusted = netToHeirs / Math.pow(1 + inflationRate, i);

    projections.push({
      year: new Date().getFullYear() + i,
      portfolioValue: Math.round(portfolioValue),
      appreciatedValue: Math.round(appreciatedValue),
      taxLiability: Math.round(taxLiability),
      netToHeirs: Math.round(netToHeirs),
      inflationAdjusted: Math.round(inflationAdjusted),
    });
  }

  return projections;
}

export function getTaxStrategies(): TaxStrategy[] {
  return [
    {
      id: 'strat-001',
      name: 'Annual Gift Exclusion',
      description:
        'Gift up to $18,000 per recipient annually without gift tax. Transfer collectibles to heirs over time to reduce estate.',
      potentialSavings: 28800,
      complexity: 'low',
      timeframe: 'Ongoing — annual',
      requirements: ['Qualified appraisal for gifts over $5,000', 'File Form 709 for gifts over exclusion'],
      recommended: true,
    },
    {
      id: 'strat-002',
      name: 'Irrevocable Trust Transfer',
      description:
        'Move high-appreciation collectibles into an irrevocable trust. Removes future appreciation from taxable estate.',
      potentialSavings: 185000,
      complexity: 'high',
      timeframe: '3-6 months to establish',
      requirements: ['Estate attorney', 'Trustee appointment', 'Qualified appraisal', 'Gift tax return filing'],
      recommended: true,
    },
    {
      id: 'strat-003',
      name: 'Charitable Remainder Trust',
      description:
        'Donate appreciated collectibles, receive income stream, and get immediate tax deduction. Ideal for items with very low basis.',
      potentialSavings: 142000,
      complexity: 'high',
      timeframe: '2-4 months to establish',
      requirements: ['IRS-compliant trust document', '10% remainder test', 'Qualified appraisal'],
      recommended: true,
    },
    {
      id: 'strat-004',
      name: 'Step-Up in Basis Planning',
      description:
        'Hold appreciated collectibles until death to give heirs a stepped-up basis, eliminating capital gains tax on appreciation.',
      potentialSavings: 224763,
      complexity: 'low',
      timeframe: 'At transfer (death)',
      requirements: ['Updated will or trust provisions', 'Regular appraisals'],
      recommended: true,
    },
    {
      id: 'strat-005',
      name: 'Family Limited Partnership (FLP)',
      description:
        'Create an FLP to hold collectibles. Transfer limited partnership interests at a valuation discount of 25-35%.',
      potentialSavings: 92000,
      complexity: 'high',
      timeframe: '4-6 months to establish',
      requirements: ['Partnership agreement', 'Independent appraisal', 'Legitimate business purpose'],
      recommended: false,
    },
    {
      id: 'strat-006',
      name: 'Qualified Personal Residence Trust (QPRT)',
      description:
        'If collectibles are displayed in a personal residence, QPRT can reduce gift tax value of the residence transfer.',
      potentialSavings: 45000,
      complexity: 'medium',
      timeframe: 'Term of years (10-15)',
      requirements: ['Personal residence qualification', 'Actuarial calculations', 'Irrevocable transfer'],
      recommended: false,
    },
  ];
}

export function getCharitableOptions(): CharitableGiving[] {
  return [
    {
      id: 'char-001',
      name: 'Donor-Advised Fund',
      type: 'donor_advised_fund',
      description:
        'Contribute appreciated collectibles to a DAF for an immediate tax deduction. Recommend grants to charities over time.',
      taxDeduction: 0.3,
      annualLimit: '30% of AGI for appreciated property',
      benefits: [
        'Immediate tax deduction at fair market value',
        'Avoid capital gains tax entirely',
        'Flexible grant-making timeline',
        'Simplifies record-keeping',
      ],
      estimatedSavings: 96000,
    },
    {
      id: 'char-002',
      name: 'Charitable Remainder Unitrust',
      type: 'charitable_trust',
      description:
        'Transfer collectibles to a CRUT. Receive variable income based on trust value annually. Remainder goes to charity.',
      taxDeduction: 0.25,
      annualLimit: '30% of AGI; 5-year carryforward',
      benefits: [
        'Income stream for life or term',
        'Partial charitable deduction upfront',
        'Capital gains deferred',
        'Reduce estate size',
      ],
      estimatedSavings: 142000,
    },
    {
      id: 'char-003',
      name: 'Direct Museum Donation',
      type: 'direct_donation',
      description:
        'Donate significant collectibles directly to a qualified museum. Full FMV deduction for related-use donations.',
      taxDeduction: 0.5,
      annualLimit: '50% of AGI for public charities',
      benefits: [
        'Maximum tax deduction at FMV',
        'Collection preserved for public benefit',
        'Potential naming opportunities',
        'Estate size reduction',
      ],
      estimatedSavings: 128000,
    },
    {
      id: 'char-004',
      name: 'Private Foundation',
      type: 'private_foundation',
      description:
        'Establish a private foundation focused on sports history. Transfer collectibles and maintain family involvement.',
      taxDeduction: 0.2,
      annualLimit: '20% of AGI for private foundations',
      benefits: [
        'Family governance and involvement',
        'Multi-generational charitable legacy',
        'Tax deduction at cost basis',
        'Public recognition and impact',
      ],
      estimatedSavings: 64000,
    },
  ];
}

export function getGenerationalTimeline(): LegacyTimeline {
  const currentYear = new Date().getFullYear();
  return {
    currentYear,
    projectedEndYear: currentYear + 30,
    milestones: [
      {
        id: 'ms-001',
        year: currentYear,
        title: 'Estate Plan Created',
        description: 'Initial collectibles estate plan established with beneficiary designations.',
        type: 'review',
        icon: 'FileText',
      },
      {
        id: 'ms-002',
        year: currentYear + 1,
        title: 'Annual Review',
        description: 'First annual review — update appraisals and beneficiary allocations.',
        type: 'review',
        icon: 'Calendar',
      },
      {
        id: 'ms-003',
        year: currentYear + 4,
        title: 'James Jr. Turns 25',
        description: 'Trust distribution triggered — James receives full control of assigned collectibles.',
        type: 'beneficiary_age',
        icon: 'User',
      },
      {
        id: 'ms-004',
        year: currentYear + 5,
        title: 'Federal Exemption Review',
        description: 'Current exemption sunsets in 2026 — re-evaluate trust strategy if exemption decreases.',
        type: 'tax_event',
        icon: 'AlertTriangle',
      },
      {
        id: 'ms-005',
        year: currentYear + 7,
        title: 'Emma Turns 21',
        description: 'UTMA custodial account transfers to Emma. Consider trust continuation provisions.',
        type: 'beneficiary_age',
        icon: 'User',
      },
      {
        id: 'ms-006',
        year: currentYear + 10,
        title: 'Dynasty Trust Review',
        description: 'If collection exceeds $5M, evaluate dynasty trust for generation-skipping transfer tax savings.',
        type: 'trust_event',
        icon: 'Shield',
      },
      {
        id: 'ms-007',
        year: currentYear + 15,
        title: 'Mid-Life Estate Review',
        description: 'Comprehensive review of all trust structures, beneficiary designations, and tax strategies.',
        type: 'review',
        icon: 'RefreshCw',
      },
      {
        id: 'ms-008',
        year: currentYear + 20,
        title: 'Grandchild Provisions',
        description: 'Evaluate adding grandchildren as beneficiaries. Consider generation-skipping trusts.',
        type: 'distribution',
        icon: 'Users',
      },
      {
        id: 'ms-009',
        year: currentYear + 25,
        title: 'Legacy Collection Transfer',
        description: 'Begin systematic transfer of collection to next generation via gifting strategy.',
        type: 'distribution',
        icon: 'Gift',
      },
    ],
  };
}

export function getEstateSummary(): EstateSummary {
  const plan = getEstatePlan();
  const taxProjection = plan.taxProjection;
  const assignedValue = plan.bequests.reduce((sum, b) => sum + b.estimatedValue, 0);
  const unassignedValue = plan.totalValue - assignedValue;

  return {
    totalValue: plan.totalValue,
    totalAssets: 47,
    beneficiaryCount: plan.beneficiaries.length,
    taxExposure: taxProjection.totalTaxOwed,
    taxExposurePercent: taxProjection.effectiveRate,
    protectedValue: assignedValue,
    unassignedValue: Math.max(0, unassignedValue),
    nextReviewDate: plan.reviewDate,
    estateHealth: unassignedValue <= 0 ? 'excellent' : unassignedValue < plan.totalValue * 0.2 ? 'good' : 'needs_attention',
    recommendations: [
      'Schedule annual appraisal update for high-value items',
      'Review trust provisions after federal exemption sunset',
      'Consider charitable remainder trust for T206 Wagner',
      'Update insurance certificate with latest valuations',
    ],
  };
}

// ---- Helpers ----

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function getAvailableStates(): string[] {
  return Object.keys(stateTaxData).sort();
}
