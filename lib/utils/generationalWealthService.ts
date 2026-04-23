// @ts-nocheck
// ---- Types ----

export type TrustType =
  | 'revocable'
  | 'irrevocable'
  | 'dynasty'
  | 'charitable'
  | 'grantor_retained'
  | 'qualified_personal_residence';

export type RelationshipType =
  | 'spouse'
  | 'child'
  | 'grandchild'
  | 'sibling'
  | 'charity'
  | 'trust'
  | 'other';

export type ProjectionHorizon = 10 | 20 | 30;

export type TaxCategory = 'inheritance' | 'gift' | 'capital_gains';

export type MilestoneType =
  | 'review'
  | 'distribution'
  | 'beneficiary_age'
  | 'trust_event'
  | 'tax_event'
  | 'gift_event'
  | 'insurance_event';

export interface FamilyMember {
  id: string;
  name: string;
  relationship: RelationshipType;
  dateOfBirth: string;
  lifeExpectancy: number;
  generation: number;
  dependents: string[];
  financialLiteracy: 'beginner' | 'intermediate' | 'advanced';
  notes?: string;
}

export interface TaxImpact {
  category: TaxCategory;
  description: string;
  grossValue: number;
  exemption: number;
  taxableAmount: number;
  rate: number;
  taxOwed: number;
  effectiveRate: number;
  netAfterTax: number;
  strategies: string[];
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
  generationSkipping: boolean;
  maxDuration: string;
}

export interface GiftingSchedule {
  id: string;
  recipientId: string;
  recipientName: string;
  annualExclusion: number;
  plannedGiftValue: number;
  assetDescription: string;
  giftDate: string;
  requiresAppraisal: boolean;
  requiresForm709: boolean;
  lifetimeExemptionUsed: number;
  remainingLifetimeExemption: number;
  taxConsequence: number;
  notes: string;
}

export interface InsuranceRequirement {
  id: string;
  type: 'collectibles_floater' | 'umbrella' | 'life_insurance' | 'key_person' | 'transit';
  provider: string;
  policyName: string;
  coverageAmount: number;
  annualPremium: number;
  deductible: number;
  coverageDetails: string[];
  expirationDate: string;
  status: 'active' | 'pending' | 'expired' | 'recommended';
  adequacyRating: 'sufficient' | 'under_insured' | 'over_insured';
  recommendation: string;
}

export interface WealthTransferScenario {
  id: string;
  name: string;
  description: string;
  method: 'outright_bequest' | 'trust_transfer' | 'gifting_program' | 'charitable_split' | 'family_lp' | 'installment_sale';
  totalValue: number;
  taxCost: number;
  netToHeirs: number;
  timeframeYears: number;
  complexity: 'low' | 'medium' | 'high';
  riskLevel: 'low' | 'medium' | 'high';
  advantages: string[];
  disadvantages: string[];
  recommended: boolean;
}

export interface InflationModel {
  year: number;
  nominalValue: number;
  inflationRate: number;
  cumulativeInflation: number;
  realValue: number;
  purchasingPowerLoss: number;
}

export interface AppreciationModel {
  year: number;
  baseValue: number;
  conservativeValue: number;
  moderateValue: number;
  aggressiveValue: number;
  conservativeRate: number;
  moderateRate: number;
  aggressiveRate: number;
}

export interface GenerationalTimeline {
  generations: GenerationEntry[];
  milestones: TimelineMilestone[];
  currentYear: number;
  projectedEndYear: number;
  totalProjectedValue: number;
}

export interface GenerationEntry {
  generation: number;
  label: string;
  members: FamilyMember[];
  estimatedInheritance: number;
  startYear: number;
  endYear: number;
  color: string;
}

export interface TimelineMilestone {
  id: string;
  year: number;
  title: string;
  description: string;
  type: MilestoneType;
  icon: string;
  generation: number;
  financialImpact?: number;
}

export interface CollectionProfile {
  id: string;
  name: string;
  sport: string;
  grade: string;
  currentValue: number;
  purchasePrice: number;
  purchaseYear: number;
  annualAppreciation: number;
  projectedValue10: number;
  projectedValue20: number;
  projectedValue30: number;
  volatility: 'low' | 'medium' | 'high';
  liquidityScore: number;
  insuranceValue: number;
}

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

export interface EstatePlan {
  id: string;
  name: string;
  totalValue: number;
  beneficiaries: Beneficiary[];
  trusts: TrustStructure[];
  taxImpacts: TaxImpact[];
  bequests: BequestAssignment[];
  documents: DocumentTemplate[];
  collectionProfiles: CollectionProfile[];
  insuranceRequirements: InsuranceRequirement[];
  giftingSchedule: GiftingSchedule[];
  createdAt: string;
  updatedAt: string;
  reviewDate: string;
}

export interface WealthProjection {
  year: number;
  portfolioValue: number;
  appreciatedValue: number;
  taxLiability: number;
  netToHeirs: number;
  inflationAdjusted: number;
}

export interface TrustComparison {
  trustA: TrustStructure;
  trustB: TrustStructure;
  taxSavingsDiff: number;
  costDiff: number;
  protectionDiff: string;
  recommendation: string;
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
  totalInsuranceCoverage: number;
  totalAnnualPremiums: number;
}

// ---- Mock Data ----

const FEDERAL_EXEMPTION = 13610000;
const FEDERAL_TOP_RATE = 40;
const ANNUAL_GIFT_EXCLUSION = 18000;
const LIFETIME_GIFT_EXEMPTION = 13610000;
const COLLECTIBLES_CG_RATE = 28;

const mockFamilyMembers: FamilyMember[] = [
  {
    id: 'fm-001', name: 'James Mitchell', relationship: 'other',
    dateOfBirth: '1978-04-12', lifeExpectancy: 82, generation: 1,
    dependents: ['fm-002', 'fm-003', 'fm-004'], financialLiteracy: 'advanced',
  },
  {
    id: 'fm-002', name: 'Sarah Mitchell', relationship: 'spouse',
    dateOfBirth: '1982-06-15', lifeExpectancy: 85, generation: 1,
    dependents: ['fm-003', 'fm-004'], financialLiteracy: 'intermediate',
  },
  {
    id: 'fm-003', name: 'James Mitchell Jr.', relationship: 'child',
    dateOfBirth: '2005-03-22', lifeExpectancy: 88, generation: 2,
    dependents: [], financialLiteracy: 'beginner',
  },
  {
    id: 'fm-004', name: 'Emma Mitchell', relationship: 'child',
    dateOfBirth: '2012-11-08', lifeExpectancy: 90, generation: 2,
    dependents: [], financialLiteracy: 'beginner',
  },
  {
    id: 'fm-005', name: 'Future Grandchild A', relationship: 'grandchild',
    dateOfBirth: '2035-01-01', lifeExpectancy: 92, generation: 3,
    dependents: [], financialLiteracy: 'beginner',
    notes: 'Projected — planning purposes only',
  },
  {
    id: 'fm-006', name: 'Future Grandchild B', relationship: 'grandchild',
    dateOfBirth: '2038-01-01', lifeExpectancy: 92, generation: 3,
    dependents: [], financialLiteracy: 'beginner',
    notes: 'Projected — planning purposes only',
  },
];

const mockBeneficiaries: Beneficiary[] = [
  {
    id: 'ben-001', name: 'Sarah Mitchell', relationship: 'spouse',
    allocationPercent: 40, assignedAssets: ['cp-001', 'cp-005', 'cp-009'],
    contingent: false, minorProtection: false, dateOfBirth: '1982-06-15',
    notes: 'Primary beneficiary — unlimited marital deduction applies',
  },
  {
    id: 'ben-002', name: 'James Mitchell Jr.', relationship: 'child',
    allocationPercent: 25, assignedAssets: ['cp-002', 'cp-006'],
    contingent: false, minorProtection: false, dateOfBirth: '2005-03-22',
    notes: 'Receives distribution at age 25 per trust terms',
  },
  {
    id: 'ben-003', name: 'Emma Mitchell', relationship: 'child',
    allocationPercent: 25, assignedAssets: ['cp-003', 'cp-007'],
    contingent: false, minorProtection: true, dateOfBirth: '2012-11-08',
    notes: 'Minor — UTMA custodial account until age 21',
  },
  {
    id: 'ben-004', name: 'National Sports Collectors Foundation', relationship: 'charity',
    allocationPercent: 10, assignedAssets: ['cp-004'],
    contingent: true, minorProtection: false,
    notes: 'Charitable remainder — qualifies for estate tax deduction',
  },
];

const mockCollectionProfiles: CollectionProfile[] = [
  {
    id: 'cp-001', name: '1952 Topps Mickey Mantle #311', sport: 'Baseball',
    grade: 'PSA 8', currentValue: 485000, purchasePrice: 45000, purchaseYear: 2003,
    annualAppreciation: 0.082, projectedValue10: 1065000, projectedValue20: 2340000, projectedValue30: 5140000,
    volatility: 'low', liquidityScore: 95, insuranceValue: 510000,
  },
  {
    id: 'cp-002', name: '1986 Fleer Michael Jordan #57', sport: 'Basketball',
    grade: 'PSA 10', currentValue: 195000, purchasePrice: 28000, purchaseYear: 2010,
    annualAppreciation: 0.075, projectedValue10: 400000, projectedValue20: 825000, projectedValue30: 1700000,
    volatility: 'medium', liquidityScore: 92, insuranceValue: 210000,
  },
  {
    id: 'cp-003', name: '2003 Topps Chrome LeBron James #111', sport: 'Basketball',
    grade: 'PSA 10', currentValue: 82000, purchasePrice: 5200, purchaseYear: 2015,
    annualAppreciation: 0.095, projectedValue10: 205000, projectedValue20: 515000, projectedValue30: 1290000,
    volatility: 'high', liquidityScore: 90, insuranceValue: 88000,
  },
  {
    id: 'cp-004', name: '1909 T206 Honus Wagner', sport: 'Baseball',
    grade: 'SGC 3', currentValue: 320000, purchasePrice: 120000, purchaseYear: 2008,
    annualAppreciation: 0.065, projectedValue10: 600000, projectedValue20: 1120000, projectedValue30: 2100000,
    volatility: 'low', liquidityScore: 88, insuranceValue: 340000,
  },
  {
    id: 'cp-005', name: '1979 O-Pee-Chee Wayne Gretzky #18', sport: 'Hockey',
    grade: 'PSA 9', currentValue: 165000, purchasePrice: 18000, purchaseYear: 2012,
    annualAppreciation: 0.070, projectedValue10: 325000, projectedValue20: 640000, projectedValue30: 1260000,
    volatility: 'medium', liquidityScore: 85, insuranceValue: 175000,
  },
  {
    id: 'cp-006', name: '2018 Panini Prizm Luka Doncic #280', sport: 'Basketball',
    grade: 'PSA 10', currentValue: 48000, purchasePrice: 8500, purchaseYear: 2019,
    annualAppreciation: 0.088, projectedValue10: 110000, projectedValue20: 255000, projectedValue30: 590000,
    volatility: 'high', liquidityScore: 93, insuranceValue: 52000,
  },
  {
    id: 'cp-007', name: '2000 Playoff Contenders Tom Brady #144', sport: 'Football',
    grade: 'PSA 9', currentValue: 375000, purchasePrice: 62000, purchaseYear: 2014,
    annualAppreciation: 0.078, projectedValue10: 790000, projectedValue20: 1665000, projectedValue30: 3510000,
    volatility: 'medium', liquidityScore: 91, insuranceValue: 395000,
  },
  {
    id: 'cp-008', name: '1933 Goudey Babe Ruth #53', sport: 'Baseball',
    grade: 'PSA 5', currentValue: 210000, purchasePrice: 85000, purchaseYear: 2011,
    annualAppreciation: 0.060, projectedValue10: 376000, projectedValue20: 674000, projectedValue30: 1208000,
    volatility: 'low', liquidityScore: 82, insuranceValue: 225000,
  },
  {
    id: 'cp-009', name: '1996 Topps Chrome Kobe Bryant #138', sport: 'Basketball',
    grade: 'PSA 10', currentValue: 128000, purchasePrice: 14000, purchaseYear: 2016,
    annualAppreciation: 0.085, projectedValue10: 290000, projectedValue20: 656000, projectedValue30: 1485000,
    volatility: 'high', liquidityScore: 89, insuranceValue: 138000,
  },
  {
    id: 'cp-010', name: '1916 Sporting News Babe Ruth #151', sport: 'Baseball',
    grade: 'SGC 2', currentValue: 440000, purchasePrice: 200000, purchaseYear: 2009,
    annualAppreciation: 0.058, projectedValue10: 765000, projectedValue20: 1330000, projectedValue30: 2310000,
    volatility: 'low', liquidityScore: 75, insuranceValue: 465000,
  },
  {
    id: 'cp-011', name: '2020 Panini Prizm Justin Herbert #325', sport: 'Football',
    grade: 'PSA 10', currentValue: 22000, purchasePrice: 3200, purchaseYear: 2021,
    annualAppreciation: 0.092, projectedValue10: 53000, projectedValue20: 128000, projectedValue30: 310000,
    volatility: 'high', liquidityScore: 94, insuranceValue: 24000,
  },
  {
    id: 'cp-012', name: '1951 Bowman Willie Mays #305', sport: 'Baseball',
    grade: 'PSA 6', currentValue: 95000, purchasePrice: 32000, purchaseYear: 2013,
    annualAppreciation: 0.068, projectedValue10: 185000, projectedValue20: 360000, projectedValue30: 700000,
    volatility: 'low', liquidityScore: 80, insuranceValue: 102000,
  },
  {
    id: 'cp-013', name: '2019 Panini Prizm Zion Williamson #248', sport: 'Basketball',
    grade: 'PSA 10', currentValue: 15500, purchasePrice: 4800, purchaseYear: 2020,
    annualAppreciation: 0.065, projectedValue10: 29000, projectedValue20: 55000, projectedValue30: 103000,
    volatility: 'high', liquidityScore: 91, insuranceValue: 17000,
  },
  {
    id: 'cp-014', name: '1986 Topps Jerry Rice #161', sport: 'Football',
    grade: 'PSA 10', currentValue: 38000, purchasePrice: 6500, purchaseYear: 2017,
    annualAppreciation: 0.055, projectedValue10: 65000, projectedValue20: 112000, projectedValue30: 193000,
    volatility: 'low', liquidityScore: 86, insuranceValue: 41000,
  },
  {
    id: 'cp-015', name: '2018 Topps Update Shohei Ohtani #US1', sport: 'Baseball',
    grade: 'PSA 10', currentValue: 72000, purchasePrice: 9500, purchaseYear: 2019,
    annualAppreciation: 0.105, projectedValue10: 195000, projectedValue20: 530000, projectedValue30: 1440000,
    volatility: 'high', liquidityScore: 93, insuranceValue: 78000,
  },
  {
    id: 'cp-016', name: '1948 Leaf Jackie Robinson #79', sport: 'Baseball',
    grade: 'PSA 4', currentValue: 155000, purchasePrice: 55000, purchaseYear: 2010,
    annualAppreciation: 0.062, projectedValue10: 283000, projectedValue20: 517000, projectedValue30: 945000,
    volatility: 'low', liquidityScore: 78, insuranceValue: 165000,
  },
];

const mockTrusts: TrustStructure[] = [
  {
    id: 'trust-001', type: 'revocable',
    name: 'Revocable Living Trust',
    description: 'A flexible trust that allows you to maintain control over your collectible assets during your lifetime while avoiding probate for your heirs.',
    pros: ['Avoids probate court', 'Maintains privacy', 'Can be modified at any time', 'You retain full control', 'Seamless disability management'],
    cons: ['No estate tax benefits', 'Assets still part of taxable estate', 'Setup and maintenance costs', 'Must fund the trust properly'],
    taxImplications: 'No income tax or estate tax benefits. Assets included in gross estate for federal estate tax purposes.',
    estimatedSetupCost: 2500, annualMaintenanceCost: 500, recommendedMinValue: 100000,
    assetProtection: false, revocable: true, taxBenefit: 'low',
    generationSkipping: false, maxDuration: 'Lifetime of grantor',
  },
  {
    id: 'trust-002', type: 'irrevocable',
    name: 'Irrevocable Life Insurance Trust (ILIT)',
    description: 'Removes high-value collectibles from your taxable estate permanently. Ideal for collections exceeding the federal exemption.',
    pros: ['Removes assets from taxable estate', 'Creditor protection', 'Generation-skipping potential', 'Fixed estate tax value at transfer'],
    cons: ['Cannot be modified once created', 'Loss of control over assets', 'Gift tax implications on transfer', 'Complex administration'],
    taxImplications: 'Removes assets from gross estate. Transfer may trigger gift tax if exceeding annual exclusion. Assets appreciate outside estate.',
    estimatedSetupCost: 5000, annualMaintenanceCost: 1200, recommendedMinValue: 500000,
    assetProtection: true, revocable: false, taxBenefit: 'high',
    generationSkipping: true, maxDuration: 'Perpetual in some states',
  },
  {
    id: 'trust-003', type: 'charitable',
    name: 'Charitable Remainder Trust (CRT)',
    description: 'Donate appreciated collectibles to receive an income stream and significant tax deductions while supporting a cause you care about.',
    pros: ['Immediate charitable income tax deduction', 'Avoid capital gains on appreciated assets', 'Income stream for life or term of years', 'Reduce estate tax liability'],
    cons: ['Irrevocable — charity receives remainder', 'Complex IRS compliance', 'Minimum 10% remainder requirement', 'Annual filing requirements'],
    taxImplications: 'Immediate income tax deduction of present value of remainder interest. Capital gains deferred. Estate tax reduced by charitable portion.',
    estimatedSetupCost: 4000, annualMaintenanceCost: 1500, recommendedMinValue: 250000,
    assetProtection: false, revocable: false, taxBenefit: 'high',
    generationSkipping: false, maxDuration: '20 years or life of beneficiary',
  },
  {
    id: 'trust-004', type: 'dynasty',
    name: 'Dynasty Trust',
    description: 'Multi-generational trust designed to pass collectible wealth through multiple generations while minimizing transfer taxes at each level.',
    pros: ['Avoids estate tax at each generation', 'Perpetual asset protection', 'Centralized collection management', 'GST exemption allocation'],
    cons: ['Very high setup cost', 'Complex administration', 'State law variations on duration', 'Requires ongoing professional management'],
    taxImplications: 'Allocate GST exemption to shield trust assets from generation-skipping transfer tax. Appreciation grows tax-free for future generations.',
    estimatedSetupCost: 15000, annualMaintenanceCost: 5000, recommendedMinValue: 2000000,
    assetProtection: true, revocable: false, taxBenefit: 'high',
    generationSkipping: true, maxDuration: '360 years (varies by state; perpetual in some)',
  },
  {
    id: 'trust-005', type: 'irrevocable',
    name: 'Grantor Retained Annuity Trust (GRAT)',
    description: 'Transfer appreciating collectibles while retaining an annuity stream. Ideal for assets expected to appreciate faster than IRS Section 7520 rate.',
    pros: ['Transfers appreciation tax-free', 'Retain income stream', 'Low or zero gift tax', 'Works well with high-appreciation assets'],
    cons: ['Must survive trust term', 'Complex actuarial calculations', 'Assets revert if grantor dies during term', 'IRS scrutiny on valuation'],
    taxImplications: 'Gift value is reduced by retained annuity interest. Appreciation above 7520 rate passes tax-free to beneficiaries.',
    estimatedSetupCost: 8000, annualMaintenanceCost: 2000, recommendedMinValue: 1000000,
    assetProtection: false, revocable: false, taxBenefit: 'high',
    generationSkipping: false, maxDuration: '2-10 year term typically',
  },
  {
    id: 'trust-006', type: 'charitable',
    name: 'Charitable Lead Annuity Trust (CLAT)',
    description: 'Provides an annuity to charity for a term of years, then passes remaining assets (including appreciation) to heirs tax-free.',
    pros: ['Zeroed-out gift tax possible', 'Appreciation passes to heirs', 'Charitable deduction', 'Estate freeze technique'],
    cons: ['Charity receives income first', 'No income tax deduction for grantor trust', 'Complex setup', 'Interest rate sensitivity'],
    taxImplications: 'Gift tax value reduced by present value of charity annuity. Low interest rate environment increases tax benefit. Remainder to heirs at reduced or zero tax.',
    estimatedSetupCost: 10000, annualMaintenanceCost: 3000, recommendedMinValue: 1500000,
    assetProtection: false, revocable: false, taxBenefit: 'high',
    generationSkipping: false, maxDuration: '10-25 year term',
  },
];

const mockInsuranceRequirements: InsuranceRequirement[] = [
  {
    id: 'ins-001', type: 'collectibles_floater', provider: 'Collectibles Insurance Services',
    policyName: 'Scheduled Collectibles Policy', coverageAmount: 2900000,
    annualPremium: 4350, deductible: 0,
    coverageDetails: ['All-risk coverage', 'Agreed value — no depreciation', 'Worldwide transit', 'Exhibition coverage', 'Climate damage'],
    expirationDate: '2027-01-15', status: 'active', adequacyRating: 'sufficient',
    recommendation: 'Coverage adequate. Reappraise top-5 items annually.',
  },
  {
    id: 'ins-002', type: 'umbrella', provider: 'Chubb Personal Risk Services',
    policyName: 'Personal Umbrella Liability', coverageAmount: 5000000,
    annualPremium: 1200, deductible: 10000,
    coverageDetails: ['Liability for displayed items', 'Visitor injury coverage', 'Third-party damage claims'],
    expirationDate: '2027-03-01', status: 'active', adequacyRating: 'sufficient',
    recommendation: 'Consider increasing to $10M if hosting public exhibitions.',
  },
  {
    id: 'ins-003', type: 'life_insurance', provider: 'Northwestern Mutual',
    policyName: 'Irrevocable Life Insurance Trust Policy', coverageAmount: 3000000,
    annualPremium: 8400, deductible: 0,
    coverageDetails: ['Term life — 20 year', 'Estate liquidity provision', 'Trust-owned to avoid estate inclusion'],
    expirationDate: '2044-06-01', status: 'active', adequacyRating: 'under_insured',
    recommendation: 'Increase coverage to match projected collection growth. Target $5M by 2030.',
  },
  {
    id: 'ins-004', type: 'transit', provider: 'Hugh Wood Inc.',
    policyName: 'Fine Art & Collectibles Transit', coverageAmount: 1000000,
    annualPremium: 1800, deductible: 500,
    coverageDetails: ['Door-to-door coverage', 'Professional packing required', 'Climate-controlled transport', 'Armed courier for items > $100K'],
    expirationDate: '2027-01-15', status: 'active', adequacyRating: 'sufficient',
    recommendation: 'Adequate for current shipping volume. Review if consignment activity increases.',
  },
  {
    id: 'ins-005', type: 'collectibles_floater', provider: 'American Collectors Insurance',
    policyName: 'Blanket Unscheduled Coverage', coverageAmount: 250000,
    annualPremium: 625, deductible: 250,
    coverageDetails: ['Blanket coverage for items under $5,000', 'New acquisitions auto-covered 90 days', 'Market value settlement'],
    expirationDate: '2027-04-01', status: 'active', adequacyRating: 'sufficient',
    recommendation: 'Good supplemental policy for lower-tier holdings.',
  },
];

const mockGiftingSchedule: GiftingSchedule[] = [
  {
    id: 'gift-001', recipientId: 'ben-002', recipientName: 'James Mitchell Jr.',
    annualExclusion: 18000, plannedGiftValue: 18000,
    assetDescription: 'Fractional interest in 2019 Panini Prizm Zion Williamson',
    giftDate: '2026-12-15', requiresAppraisal: true, requiresForm709: false,
    lifetimeExemptionUsed: 0, remainingLifetimeExemption: LIFETIME_GIFT_EXEMPTION,
    taxConsequence: 0, notes: 'Annual exclusion gift — no tax impact',
  },
  {
    id: 'gift-002', recipientId: 'ben-003', recipientName: 'Emma Mitchell',
    annualExclusion: 18000, plannedGiftValue: 18000,
    assetDescription: 'Fractional interest in 2020 Panini Prizm Justin Herbert',
    giftDate: '2026-12-15', requiresAppraisal: true, requiresForm709: false,
    lifetimeExemptionUsed: 0, remainingLifetimeExemption: LIFETIME_GIFT_EXEMPTION,
    taxConsequence: 0, notes: 'Annual exclusion gift — UTMA custodial',
  },
  {
    id: 'gift-003', recipientId: 'ben-002', recipientName: 'James Mitchell Jr.',
    annualExclusion: 18000, plannedGiftValue: 48000,
    assetDescription: '2018 Panini Prizm Luka Doncic #280 PSA 10',
    giftDate: '2027-06-01', requiresAppraisal: true, requiresForm709: true,
    lifetimeExemptionUsed: 30000, remainingLifetimeExemption: LIFETIME_GIFT_EXEMPTION - 30000,
    taxConsequence: 0, notes: 'Exceeds annual exclusion by $30K — uses lifetime exemption',
  },
  {
    id: 'gift-004', recipientId: 'ben-001', recipientName: 'Sarah Mitchell',
    annualExclusion: 0, plannedGiftValue: 165000,
    assetDescription: '1979 O-Pee-Chee Wayne Gretzky #18 PSA 9',
    giftDate: '2027-01-01', requiresAppraisal: false, requiresForm709: false,
    lifetimeExemptionUsed: 0, remainingLifetimeExemption: LIFETIME_GIFT_EXEMPTION,
    taxConsequence: 0, notes: 'Unlimited marital deduction — no gift tax for spousal transfer',
  },
];

const mockDocuments: DocumentTemplate[] = [
  {
    id: 'doc-001', type: 'will_excerpt', title: 'Last Will & Testament — Collectibles Schedule',
    generatedDate: '2025-11-01',
    content: `ARTICLE VII — TANGIBLE PERSONAL PROPERTY (COLLECTIBLES)\n\nSection 7.1. I direct that my sports memorabilia and collectible card collection, as itemized in Schedule C attached hereto, shall be distributed as follows:\n\n(a) To my spouse, SARAH MITCHELL, Lots 1, 5, and 9.\n(b) To my son, JAMES MITCHELL JR., Lots 2 and 6, held in trust until age 25.\n(c) To my daughter, EMMA MITCHELL, Lots 3 and 7, held per UTMA until age 21.\n(d) To the NATIONAL SPORTS COLLECTORS FOUNDATION, Lot 4, as charitable bequest under IRC section 2055.`,
    status: 'review', signatures: ['Testator', 'Witness 1', 'Witness 2', 'Notary Public'],
  },
  {
    id: 'doc-002', type: 'trust_summary', title: 'Revocable Living Trust — Collectibles Amendment',
    generatedDate: '2025-11-01',
    content: `THE MITCHELL FAMILY REVOCABLE TRUST\nAmendment No. 3 — Sports Collectibles Schedule\n\nTotal appraised value: $2,845,500\nItems: 47 graded cards, 12 authenticated memorabilia pieces\nLast appraisal: October 15, 2025\n\nDistribution per Exhibit A allocation schedule.`,
    status: 'draft', signatures: ['Grantor', 'Trustee', 'Successor Trustee'],
  },
  {
    id: 'doc-003', type: 'appraisal_letter', title: 'Collection Appraisal Summary',
    generatedDate: '2025-11-15',
    content: `QUALIFIED APPRAISAL — IRS FORM 8283\n\nTotal FMV: $2,845,500\nCost basis: $697,700\nUnrealized appreciation: $2,147,800\n\nPrepared in compliance with USPAP and IRC section 170(f)(11)(E).`,
    status: 'final', signatures: ['Certified Appraiser', 'Collection Owner'],
  },
  {
    id: 'doc-004', type: 'insurance_certificate', title: 'Collectibles Insurance Certificate',
    generatedDate: '2025-12-01',
    content: `CERTIFICATE OF INSURANCE — SCHEDULED PERSONAL PROPERTY\n\nPolicy: SP-2025-847291\nInsured: James Mitchell\nTotal insured value: $2,900,000\nDeductible: $0\nCoverage: All-risk, worldwide, including transit and exhibition`,
    status: 'final', signatures: ['Underwriter', 'Insurance Agent', 'Policyholder'],
  },
];

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

// ---- Helper Functions ----

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(value);
}

export function getAvailableStates(): string[] {
  return Object.keys(stateTaxData).sort();
}

function getTotalCollectionValue(): number {
  return mockCollectionProfiles.reduce((sum, p) => sum + p.currentValue, 0);
}

function getTotalCostBasis(): number {
  return mockCollectionProfiles.reduce((sum, p) => sum + p.purchasePrice, 0);
}

// ---- Service Functions ----

export function getEstatePlan(): EstatePlan {
  const taxImpacts = calculateTaxImpact(getTotalCollectionValue(), 'New York');

  return {
    id: 'plan-001',
    name: 'Mitchell Family Sports Collection Estate Plan',
    totalValue: getTotalCollectionValue(),
    beneficiaries: mockBeneficiaries,
    trusts: mockTrusts,
    taxImpacts,
    bequests: [
      { id: 'beq-001', assetId: 'cp-001', assetName: '1952 Topps Mickey Mantle #311 PSA 8', beneficiaryId: 'ben-001', beneficiaryName: 'Sarah Mitchell', estimatedValue: 485000, assignedDate: '2025-09-15', conditions: 'Outright bequest — unlimited marital deduction' },
      { id: 'beq-002', assetId: 'cp-002', assetName: '1986 Fleer Michael Jordan #57 PSA 10', beneficiaryId: 'ben-002', beneficiaryName: 'James Mitchell Jr.', estimatedValue: 195000, assignedDate: '2025-09-15', conditions: 'Held in trust until age 25' },
      { id: 'beq-003', assetId: 'cp-003', assetName: '2003 Topps Chrome LeBron James #111 PSA 10', beneficiaryId: 'ben-003', beneficiaryName: 'Emma Mitchell', estimatedValue: 82000, assignedDate: '2025-09-15', conditions: 'UTMA custodial until age 21' },
      { id: 'beq-004', assetId: 'cp-004', assetName: '1909 T206 Honus Wagner SGC 3', beneficiaryId: 'ben-004', beneficiaryName: 'National Sports Collectors Foundation', estimatedValue: 320000, assignedDate: '2025-09-15', conditions: 'Charitable bequest under IRC section 2055' },
      { id: 'beq-005', assetId: 'cp-005', assetName: '1979 O-Pee-Chee Wayne Gretzky #18 PSA 9', beneficiaryId: 'ben-001', beneficiaryName: 'Sarah Mitchell', estimatedValue: 165000, assignedDate: '2025-10-01' },
      { id: 'beq-006', assetId: 'cp-007', assetName: '2000 Playoff Contenders Tom Brady #144 PSA 9', beneficiaryId: 'ben-002', beneficiaryName: 'James Mitchell Jr.', estimatedValue: 375000, assignedDate: '2025-10-01' },
    ],
    documents: mockDocuments,
    collectionProfiles: mockCollectionProfiles,
    insuranceRequirements: mockInsuranceRequirements,
    giftingSchedule: mockGiftingSchedule,
    createdAt: '2025-08-01',
    updatedAt: '2025-12-15',
    reviewDate: '2026-06-01',
  };
}

export function calculateTaxImpact(totalValue: number, state: string): TaxImpact[] {
  const costBasis = getTotalCostBasis();
  const appreciation = totalValue - costBasis;

  // Inheritance tax
  const stateInfo = stateTaxData[state] || { hasEstateTax: false, exemption: 0, topRate: 0 };
  const federalTaxable = Math.max(0, totalValue - FEDERAL_EXEMPTION);
  const federalTax = federalTaxable * (FEDERAL_TOP_RATE / 100);
  let stateTax = 0;
  if (stateInfo.hasEstateTax) {
    const stateTaxable = Math.max(0, totalValue - stateInfo.exemption);
    stateTax = stateTaxable * (stateInfo.topRate / 100) * 0.6;
  }
  const totalInheritanceTax = federalTax + stateTax;

  // Gift tax
  const giftTaxable = Math.max(0, totalValue - LIFETIME_GIFT_EXEMPTION);
  const giftTax = giftTaxable * (FEDERAL_TOP_RATE / 100);

  // Capital gains (collectibles rate is 28%)
  const capitalGainsTax = appreciation * (COLLECTIBLES_CG_RATE / 100);

  return [
    {
      category: 'inheritance',
      description: `Federal and ${state} estate tax on collection transfer at death`,
      grossValue: totalValue,
      exemption: FEDERAL_EXEMPTION,
      taxableAmount: federalTaxable,
      rate: FEDERAL_TOP_RATE,
      taxOwed: totalInheritanceTax,
      effectiveRate: totalValue > 0 ? (totalInheritanceTax / totalValue) * 100 : 0,
      netAfterTax: totalValue - totalInheritanceTax,
      strategies: [
        'Leverage unlimited marital deduction for spousal transfers',
        'Use irrevocable trust to remove assets from taxable estate',
        'Annual gifting to reduce estate size over time',
        'Charitable remainder trust for highly appreciated items',
      ],
    },
    {
      category: 'gift',
      description: 'Federal gift tax for lifetime transfers exceeding annual and lifetime exemptions',
      grossValue: totalValue,
      exemption: LIFETIME_GIFT_EXEMPTION,
      taxableAmount: giftTaxable,
      rate: FEDERAL_TOP_RATE,
      taxOwed: giftTax,
      effectiveRate: totalValue > 0 ? (giftTax / totalValue) * 100 : 0,
      netAfterTax: totalValue - giftTax,
      strategies: [
        `Use $${ANNUAL_GIFT_EXCLUSION.toLocaleString()} annual exclusion per recipient`,
        'Split gifts with spouse to double exclusion',
        'Gift low-basis assets to shift future appreciation',
        'Consider GRAT for high-appreciation collectibles',
      ],
    },
    {
      category: 'capital_gains',
      description: 'Collectibles capital gains tax at 28% federal rate on sale of appreciated cards',
      grossValue: totalValue,
      exemption: costBasis,
      taxableAmount: appreciation,
      rate: COLLECTIBLES_CG_RATE,
      taxOwed: capitalGainsTax,
      effectiveRate: totalValue > 0 ? (capitalGainsTax / totalValue) * 100 : 0,
      netAfterTax: totalValue - capitalGainsTax,
      strategies: [
        'Hold until death for stepped-up basis (eliminates capital gains)',
        'Donate to charity to avoid capital gains entirely',
        'Installment sale to spread gains across tax years',
        'Opportunity Zone reinvestment for deferral',
      ],
    },
  ];
}

export function getGiftingSchedule(): GiftingSchedule[] {
  return mockGiftingSchedule;
}

export function getTrustOptions(): TrustStructure[] {
  return mockTrusts;
}

export function getProjection(years: ProjectionHorizon): WealthProjection[] {
  const baseValue = getTotalCollectionValue();
  const appreciationRate = 0.072;
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

export function getInsuranceRequirements(): InsuranceRequirement[] {
  return mockInsuranceRequirements;
}

export function getWealthTransferScenarios(): WealthTransferScenario[] {
  const totalValue = getTotalCollectionValue();

  return [
    {
      id: 'wts-001', name: 'Outright Bequest via Will',
      description: 'Transfer entire collection through will at death. Simplest approach but maximum tax exposure.',
      method: 'outright_bequest', totalValue, taxCost: 0,
      netToHeirs: totalValue, timeframeYears: 0, complexity: 'low', riskLevel: 'low',
      advantages: ['Simple to implement', 'No upfront costs', 'Step-up in basis eliminates capital gains', 'Full control during lifetime'],
      disadvantages: ['Subject to probate', 'No estate tax reduction', 'Public record', 'Potential court challenges'],
      recommended: false,
    },
    {
      id: 'wts-002', name: 'Irrevocable Trust Transfer',
      description: 'Move collection into irrevocable trust now. Removes future appreciation from estate.',
      method: 'trust_transfer', totalValue,
      taxCost: Math.round(totalValue * 0.03),
      netToHeirs: Math.round(totalValue * 0.97 * 1.5),
      timeframeYears: 1, complexity: 'high', riskLevel: 'medium',
      advantages: ['Removes appreciation from estate', 'Creditor protection', 'Professional management', 'Generation-skipping potential'],
      disadvantages: ['Loss of control', 'Gift tax on transfer', 'Irrevocable — cannot undo', 'Ongoing administration costs'],
      recommended: true,
    },
    {
      id: 'wts-003', name: 'Systematic Gifting Program',
      description: 'Transfer collection over 10-15 years using annual gift exclusions and lifetime exemption.',
      method: 'gifting_program', totalValue,
      taxCost: 0, netToHeirs: totalValue,
      timeframeYears: 15, complexity: 'medium', riskLevel: 'low',
      advantages: ['Zero gift tax using exclusions', 'Gradual wealth transfer', 'Teaches financial responsibility', 'Reduces estate over time'],
      disadvantages: ['Takes many years', 'Annual appraisals required', 'Donee receives carryover basis', 'Loss of assets during lifetime'],
      recommended: true,
    },
    {
      id: 'wts-004', name: 'Charitable Split Strategy',
      description: 'Split collection between heirs and charity. CRT provides income stream plus immediate tax deduction.',
      method: 'charitable_split', totalValue,
      taxCost: Math.round(totalValue * -0.08),
      netToHeirs: Math.round(totalValue * 0.75),
      timeframeYears: 2, complexity: 'high', riskLevel: 'low',
      advantages: ['Immediate tax deduction', 'Income stream from CRT', 'Capital gains avoidance', 'Philanthropic legacy'],
      disadvantages: ['Heirs receive less', 'Complex setup', 'IRS scrutiny on valuation', 'Irrevocable charitable portion'],
      recommended: false,
    },
    {
      id: 'wts-005', name: 'Family Limited Partnership',
      description: 'Create FLP to hold collection. Transfer LP interests at valuation discounts of 25-35%.',
      method: 'family_lp', totalValue,
      taxCost: Math.round(totalValue * 0.02),
      netToHeirs: Math.round(totalValue * 0.98),
      timeframeYears: 3, complexity: 'high', riskLevel: 'high',
      advantages: ['Valuation discounts', 'Centralized management', 'Gradual control transfer', 'Asset protection'],
      disadvantages: ['IRS audit risk', 'Must have business purpose', 'Ongoing compliance', 'Discount challenges'],
      recommended: false,
    },
    {
      id: 'wts-006', name: 'Installment Sale to Defective Grantor Trust',
      description: 'Sell collection to intentionally defective grantor trust (IDGT) for a promissory note. Freezes estate value.',
      method: 'installment_sale', totalValue,
      taxCost: Math.round(totalValue * 0.01),
      netToHeirs: Math.round(totalValue * 1.3),
      timeframeYears: 9, complexity: 'high', riskLevel: 'medium',
      advantages: ['Estate freeze at current value', 'No gift tax', 'Income tax neutral', 'Appreciation passes to heirs tax-free'],
      disadvantages: ['Complex structure', 'Must charge AFR interest', 'Seed gift required', 'Note must be bona fide'],
      recommended: true,
    },
  ];
}

export function getInflationAdjustedValue(nominalValue: number, years: number, inflationRate: number = 0.031): InflationModel[] {
  const results: InflationModel[] = [];
  for (let i = 0; i <= years; i++) {
    const cumulativeInflation = Math.pow(1 + inflationRate, i);
    const realValue = nominalValue / cumulativeInflation;
    results.push({
      year: new Date().getFullYear() + i,
      nominalValue,
      inflationRate,
      cumulativeInflation,
      realValue: Math.round(realValue),
      purchasingPowerLoss: Math.round(nominalValue - realValue),
    });
  }
  return results;
}

export function getAppreciationModel(years: number): AppreciationModel[] {
  const baseValue = getTotalCollectionValue();
  const results: AppreciationModel[] = [];

  for (let i = 0; i <= years; i++) {
    results.push({
      year: new Date().getFullYear() + i,
      baseValue,
      conservativeValue: Math.round(baseValue * Math.pow(1.04, i)),
      moderateValue: Math.round(baseValue * Math.pow(1.072, i)),
      aggressiveValue: Math.round(baseValue * Math.pow(1.10, i)),
      conservativeRate: 4.0,
      moderateRate: 7.2,
      aggressiveRate: 10.0,
    });
  }
  return results;
}

export function compareStructures(trustAId: string, trustBId: string): TrustComparison {
  const trustA = mockTrusts.find((t) => t.id === trustAId) || mockTrusts[0];
  const trustB = mockTrusts.find((t) => t.id === trustBId) || mockTrusts[1];

  const taxSavingsMap: Record<string, number> = {
    high: 185000, medium: 65000, low: 15000,
  };

  const taxSavingsDiff = taxSavingsMap[trustB.taxBenefit] - taxSavingsMap[trustA.taxBenefit];
  const costDiff =
    (trustB.estimatedSetupCost + trustB.annualMaintenanceCost * 10) -
    (trustA.estimatedSetupCost + trustA.annualMaintenanceCost * 10);

  let protectionDiff = 'Equal protection';
  if (trustA.assetProtection && !trustB.assetProtection) protectionDiff = `${trustA.name} offers superior asset protection`;
  else if (!trustA.assetProtection && trustB.assetProtection) protectionDiff = `${trustB.name} offers superior asset protection`;

  let recommendation = '';
  if (taxSavingsDiff > 50000) recommendation = `${trustB.name} saves significantly more in taxes, despite higher costs.`;
  else if (taxSavingsDiff < -50000) recommendation = `${trustA.name} saves significantly more in taxes.`;
  else recommendation = `Both structures offer comparable tax benefits. Choose based on control preference and asset protection needs.`;

  return { trustA, trustB, taxSavingsDiff, costDiff, protectionDiff, recommendation };
}

export function getGenerationalTimeline(): GenerationalTimeline {
  const currentYear = new Date().getFullYear();
  const projection30 = getProjection(30);
  const finalValue = projection30[projection30.length - 1]?.portfolioValue || 0;

  return {
    currentYear,
    projectedEndYear: currentYear + 30,
    totalProjectedValue: finalValue,
    generations: [
      {
        generation: 1, label: 'Generation 1 — Founders',
        members: mockFamilyMembers.filter((m) => m.generation === 1),
        estimatedInheritance: getTotalCollectionValue(),
        startYear: currentYear, endYear: currentYear + 20,
        color: '#6366f1',
      },
      {
        generation: 2, label: 'Generation 2 — Children',
        members: mockFamilyMembers.filter((m) => m.generation === 2),
        estimatedInheritance: Math.round(finalValue * 0.65),
        startYear: currentYear + 10, endYear: currentYear + 40,
        color: '#22d3ee',
      },
      {
        generation: 3, label: 'Generation 3 — Grandchildren',
        members: mockFamilyMembers.filter((m) => m.generation === 3),
        estimatedInheritance: Math.round(finalValue * 0.35),
        startYear: currentYear + 25, endYear: currentYear + 60,
        color: '#a78bfa',
      },
    ],
    milestones: [
      { id: 'ms-001', year: currentYear, title: 'Estate Plan Created', description: 'Initial collectibles estate plan with beneficiary designations.', type: 'review', icon: 'FileText', generation: 1 },
      { id: 'ms-002', year: currentYear + 1, title: 'Annual Gifting Begins', description: 'Start $18K annual exclusion gifts to each child.', type: 'gift_event', icon: 'Gift', generation: 1 },
      { id: 'ms-003', year: currentYear + 2, title: 'Insurance Review', description: 'Reappraise top items and adjust coverage to match growth.', type: 'insurance_event', icon: 'Shield', generation: 1 },
      { id: 'ms-004', year: currentYear + 4, title: 'James Jr. Turns 25', description: 'Trust distribution triggered — full control of assigned collectibles.', type: 'beneficiary_age', icon: 'User', generation: 2 },
      { id: 'ms-005', year: currentYear + 5, title: 'Federal Exemption Review', description: 'Exemption sunset evaluation — re-assess trust strategy.', type: 'tax_event', icon: 'AlertTriangle', generation: 1 },
      { id: 'ms-006', year: currentYear + 7, title: 'Emma Turns 21', description: 'UTMA custodial account transfers to Emma.', type: 'beneficiary_age', icon: 'User', generation: 2 },
      { id: 'ms-007', year: currentYear + 10, title: 'Dynasty Trust Review', description: 'If collection exceeds $5M, evaluate dynasty trust for GST savings.', type: 'trust_event', icon: 'Shield', generation: 1 },
      { id: 'ms-008', year: currentYear + 15, title: 'Mid-Life Estate Review', description: 'Comprehensive review of all trust structures and tax strategies.', type: 'review', icon: 'RefreshCw', generation: 1 },
      { id: 'ms-009', year: currentYear + 20, title: 'Generation 2 Takes Stewardship', description: 'Children assume primary collection management roles.', type: 'distribution', icon: 'Users', generation: 2 },
      { id: 'ms-010', year: currentYear + 25, title: 'Grandchild Provisions', description: 'Evaluate adding grandchildren as beneficiaries with GST trusts.', type: 'trust_event', icon: 'Users', generation: 3 },
      { id: 'ms-011', year: currentYear + 30, title: 'Legacy Collection Transfer', description: 'Systematic transfer to Generation 3 via dynasty trust distributions.', type: 'distribution', icon: 'Gift', generation: 3 },
    ],
  };
}

export function getEstateSummary(): EstateSummary {
  const plan = getEstatePlan();
  const inheritanceTax = plan.taxImpacts.find((t) => t.category === 'inheritance');
  const assignedValue = plan.bequests.reduce((sum, b) => sum + b.estimatedValue, 0);
  const unassignedValue = plan.totalValue - assignedValue;
  const totalInsuranceCoverage = mockInsuranceRequirements.reduce((sum, i) => sum + i.coverageAmount, 0);
  const totalAnnualPremiums = mockInsuranceRequirements.reduce((sum, i) => sum + i.annualPremium, 0);

  return {
    totalValue: plan.totalValue,
    totalAssets: mockCollectionProfiles.length,
    beneficiaryCount: plan.beneficiaries.length,
    taxExposure: inheritanceTax?.taxOwed || 0,
    taxExposurePercent: inheritanceTax?.effectiveRate || 0,
    protectedValue: assignedValue,
    unassignedValue: Math.max(0, unassignedValue),
    nextReviewDate: plan.reviewDate,
    estateHealth: unassignedValue <= 0 ? 'excellent' : unassignedValue < plan.totalValue * 0.2 ? 'good' : 'needs_attention',
    recommendations: [
      'Schedule annual appraisal update for high-value items',
      'Review trust provisions after federal exemption sunset',
      'Consider charitable remainder trust for T206 Wagner',
      'Update insurance certificate with latest valuations',
      'Begin systematic gifting program for Gen 2',
    ],
    totalInsuranceCoverage,
    totalAnnualPremiums,
  };
}

export function getCollectionProfiles(): CollectionProfile[] {
  return mockCollectionProfiles;
}

export function getFamilyMembers(): FamilyMember[] {
  return mockFamilyMembers;
}

// ---- Backward-compatible exports for GenerationalWealth.tsx and GenerationalWealthModal.tsx ----

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

export function getWealthProjection(years: number): WealthProjection[] {
  return getProjection(years as ProjectionHorizon);
}

export function calculateInheritanceTax(totalValue: number, state: string): InheritanceTaxProjection {
  const stateInfo = stateTaxData[state] || { hasEstateTax: false, exemption: 0, topRate: 0 };
  const federalTaxable = Math.max(0, totalValue - FEDERAL_EXEMPTION);
  const federalTaxOwed = federalTaxable * (FEDERAL_TOP_RATE / 100);

  let stateTaxOwed = 0;
  if (stateInfo.hasEstateTax) {
    const stateTaxable = Math.max(0, totalValue - stateInfo.exemption);
    stateTaxOwed = stateTaxable * (stateInfo.topRate / 100) * 0.6;
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

export function calculateStepUpBasis(_assets?: unknown[]): StepUpBasis[] {
  return mockCollectionProfiles.slice(0, 6).map((cp) => ({
    assetId: cp.id,
    assetName: `${cp.name} ${cp.grade}`,
    originalBasis: cp.purchasePrice,
    currentFairMarketValue: cp.currentValue,
    stepUpAmount: cp.currentValue - cp.purchasePrice,
    taxSavings: Math.round((cp.currentValue - cp.purchasePrice) * 0.21),
    capitalGainsAvoided: cp.currentValue - cp.purchasePrice,
  }));
}

export function getTaxStrategies(): TaxStrategy[] {
  return [
    { id: 'strat-001', name: 'Annual Gift Exclusion', description: 'Gift up to $18,000 per recipient annually without gift tax.', potentialSavings: 28800, complexity: 'low', timeframe: 'Ongoing — annual', requirements: ['Qualified appraisal for gifts over $5,000', 'File Form 709 for gifts over exclusion'], recommended: true },
    { id: 'strat-002', name: 'Irrevocable Trust Transfer', description: 'Move high-appreciation collectibles into an irrevocable trust.', potentialSavings: 185000, complexity: 'high', timeframe: '3-6 months to establish', requirements: ['Estate attorney', 'Trustee appointment', 'Qualified appraisal', 'Gift tax return filing'], recommended: true },
    { id: 'strat-003', name: 'Charitable Remainder Trust', description: 'Donate appreciated collectibles, receive income stream, and get immediate tax deduction.', potentialSavings: 142000, complexity: 'high', timeframe: '2-4 months to establish', requirements: ['IRS-compliant trust document', '10% remainder test', 'Qualified appraisal'], recommended: true },
    { id: 'strat-004', name: 'Step-Up in Basis Planning', description: 'Hold appreciated collectibles until death to give heirs a stepped-up basis.', potentialSavings: 224763, complexity: 'low', timeframe: 'At transfer (death)', requirements: ['Updated will or trust provisions', 'Regular appraisals'], recommended: true },
    { id: 'strat-005', name: 'Family Limited Partnership (FLP)', description: 'Create an FLP to hold collectibles. Transfer limited partnership interests at a valuation discount.', potentialSavings: 92000, complexity: 'high', timeframe: '4-6 months to establish', requirements: ['Partnership agreement', 'Independent appraisal', 'Legitimate business purpose'], recommended: false },
    { id: 'strat-006', name: 'Qualified Personal Residence Trust (QPRT)', description: 'If collectibles are displayed in a personal residence, QPRT can reduce gift tax value.', potentialSavings: 45000, complexity: 'medium', timeframe: 'Term of years (10-15)', requirements: ['Personal residence qualification', 'Actuarial calculations', 'Irrevocable transfer'], recommended: false },
  ];
}

export function getCharitableOptions(): CharitableGiving[] {
  return [
    { id: 'char-001', name: 'Donor-Advised Fund', type: 'donor_advised_fund', description: 'Contribute appreciated collectibles to a DAF for an immediate tax deduction.', taxDeduction: 0.3, annualLimit: '30% of AGI for appreciated property', benefits: ['Immediate tax deduction at FMV', 'Avoid capital gains tax', 'Flexible grant-making'], estimatedSavings: 96000 },
    { id: 'char-002', name: 'Charitable Remainder Unitrust', type: 'charitable_trust', description: 'Transfer collectibles to a CRUT. Receive variable income annually.', taxDeduction: 0.25, annualLimit: '30% of AGI; 5-year carryforward', benefits: ['Income stream for life', 'Partial charitable deduction', 'Capital gains deferred'], estimatedSavings: 142000 },
    { id: 'char-003', name: 'Direct Museum Donation', type: 'direct_donation', description: 'Donate significant collectibles directly to a qualified museum.', taxDeduction: 0.5, annualLimit: '50% of AGI for public charities', benefits: ['Maximum tax deduction at FMV', 'Collection preserved for public', 'Estate size reduction'], estimatedSavings: 128000 },
    { id: 'char-004', name: 'Private Foundation', type: 'private_foundation', description: 'Establish a private foundation focused on sports history.', taxDeduction: 0.2, annualLimit: '20% of AGI for private foundations', benefits: ['Family governance', 'Multi-generational legacy', 'Public recognition'], estimatedSavings: 64000 },
  ];
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
