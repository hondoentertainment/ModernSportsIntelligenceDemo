// @ts-nocheck
// ---- Types ----

export type GradingCompany = 'psa' | 'bgs' | 'sgc' | 'csg' | 'hga';

export type ServiceTier = 'economy' | 'regular' | 'express' | 'super_express' | 'walk_through';

export type SubmissionStatus =
  | 'preparing'
  | 'shipped'
  | 'received'
  | 'grading'
  | 'graded'
  | 'shipped_back'
  | 'delivered';

export interface GradingSubmission {
  id: string;
  cardName: string;
  cardYear: string;
  cardSet: string;
  cardNumber: string;
  sport: string;
  company: GradingCompany;
  tier: ServiceTier;
  status: SubmissionStatus;
  submittedDate: string;
  estimatedReturnDate: string;
  actualReturnDate?: string;
  declaredValue: number;
  estimatedGrade?: number;
  actualGrade?: number;
  gradingCost: number;
  shippingCost: number;
  insuranceCost: number;
  totalCost: number;
  preGradeValue: number;
  postGradeValue?: number;
  certNumber?: string;
  trackingOutbound?: string;
  trackingReturn?: string;
  notes?: string;
  groupId?: string;
  imageUrl?: string;
}

export interface GradingCost {
  company: GradingCompany;
  tier: ServiceTier;
  baseFee: number;
  maxDeclaredValue: number;
  additionalPerCard?: number;
  shippingFlatRate: number;
  insuranceRate: number; // % of declared value
  estimatedTurnaroundDays: number;
  memberDiscount?: number;
}

export interface TurnaroundEstimate {
  company: GradingCompany;
  tier: ServiceTier;
  advertisedDays: number;
  actualAverageDays: number;
  recentTrendDays: number; // last 30 day avg
  confidence: number; // 0-1
  estimatedReturnDate: string;
  historicalRange: { min: number; max: number };
}

export interface GradeResult {
  submissionId: string;
  company: GradingCompany;
  grade: number;
  subGrades?: {
    centering: number;
    corners: number;
    edges: number;
    surface: number;
  };
  population: number;
  higherPop: number;
  valueAtGrade: number;
  valueAtGradePlus: number;
  valueAtGradeMinus: number;
  certNumber: string;
}

export interface SubmissionOptimizer {
  cardName: string;
  estimatedGrade: number;
  confidence: number;
  recommendedCompany: GradingCompany;
  recommendedTier: ServiceTier;
  reasoning: string;
  expectedROI: number;
  expectedValueIncrease: number;
  costToGrade: number;
  breakEvenGrade: number;
  alternativeOptions: {
    company: GradingCompany;
    tier: ServiceTier;
    cost: number;
    turnaroundDays: number;
    roi: number;
  }[];
}

export interface GroupSubmission {
  id: string;
  name: string;
  organizer: string;
  company: GradingCompany;
  tier: ServiceTier;
  status: 'open' | 'closed' | 'shipped' | 'returned';
  members: GroupMember[];
  totalCards: number;
  maxCards: number;
  shippingCostTotal: number;
  shippingCostPerCard: number;
  deadline: string;
  createdDate: string;
  notes?: string;
}

export interface GroupMember {
  name: string;
  cardCount: number;
  paidAmount: number;
  cards: string[];
}

export interface CompanyComparison {
  company: GradingCompany;
  label: string;
  avgTurnaround: number;
  avgCostPerCard: number;
  reputationScore: number;
  populationReportQuality: number;
  holderQuality: number;
  crossoverAcceptance: number;
  marketPremium: number; // % premium vs raw
  totalGraded: string;
  yearFounded: number;
  color: string;
}

export interface SubmissionROI {
  submissionId: string;
  cardName: string;
  totalCost: number;
  preGradeValue: number;
  postGradeValue: number;
  netProfit: number;
  roi: number;
  daysHeld: number;
  annualizedROI: number;
}

// ---- Company Labels & Colors ----

const COMPANY_LABELS: Record<GradingCompany, string> = {
  psa: 'PSA',
  bgs: 'BGS (Beckett)',
  sgc: 'SGC',
  csg: 'CSG',
  hga: 'HGA',
};

const COMPANY_COLORS: Record<GradingCompany, string> = {
  psa: '#ef4444',
  bgs: '#3b82f6',
  sgc: '#f59e0b',
  csg: '#8b5cf6',
  hga: '#06b6d4',
};

const TIER_LABELS: Record<ServiceTier, string> = {
  economy: 'Economy',
  regular: 'Regular',
  express: 'Express',
  super_express: 'Super Express',
  walk_through: 'Walk-Through',
};

const STATUS_LABELS: Record<SubmissionStatus, string> = {
  preparing: 'Preparing',
  shipped: 'Shipped to Grader',
  received: 'Received by Grader',
  grading: 'In Grading',
  graded: 'Graded',
  shipped_back: 'Shipped Back',
  delivered: 'Delivered',
};

export function getCompanyLabel(company: GradingCompany): string {
  return COMPANY_LABELS[company];
}

export function getCompanyColor(company: GradingCompany): string {
  return COMPANY_COLORS[company];
}

export function getTierLabel(tier: ServiceTier): string {
  return TIER_LABELS[tier];
}

export function getStatusLabel(status: SubmissionStatus): string {
  return STATUS_LABELS[status];
}

// ---- Status Progress ----

const STATUS_ORDER: SubmissionStatus[] = [
  'preparing',
  'shipped',
  'received',
  'grading',
  'graded',
  'shipped_back',
  'delivered',
];

export function getStatusProgress(status: SubmissionStatus): number {
  const idx = STATUS_ORDER.indexOf(status);
  return Math.round(((idx + 1) / STATUS_ORDER.length) * 100);
}

export function getStatusSteps(): { status: SubmissionStatus; label: string }[] {
  return STATUS_ORDER.map((s) => ({ status: s, label: STATUS_LABELS[s] }));
}

// ---- Mock Grading Costs ----

const MOCK_GRADING_COSTS: GradingCost[] = [
  // PSA
  { company: 'psa', tier: 'economy', baseFee: 25, maxDeclaredValue: 499, shippingFlatRate: 12, insuranceRate: 0.01, estimatedTurnaroundDays: 120 },
  { company: 'psa', tier: 'regular', baseFee: 50, maxDeclaredValue: 999, shippingFlatRate: 12, insuranceRate: 0.015, estimatedTurnaroundDays: 65 },
  { company: 'psa', tier: 'express', baseFee: 100, maxDeclaredValue: 2499, shippingFlatRate: 15, insuranceRate: 0.02, estimatedTurnaroundDays: 20 },
  { company: 'psa', tier: 'super_express', baseFee: 200, maxDeclaredValue: 4999, shippingFlatRate: 18, insuranceRate: 0.025, estimatedTurnaroundDays: 10 },
  { company: 'psa', tier: 'walk_through', baseFee: 600, maxDeclaredValue: 24999, shippingFlatRate: 25, insuranceRate: 0.03, estimatedTurnaroundDays: 3 },
  // BGS
  { company: 'bgs', tier: 'economy', baseFee: 22, maxDeclaredValue: 499, shippingFlatRate: 10, insuranceRate: 0.01, estimatedTurnaroundDays: 90 },
  { company: 'bgs', tier: 'regular', baseFee: 40, maxDeclaredValue: 999, shippingFlatRate: 12, insuranceRate: 0.015, estimatedTurnaroundDays: 45 },
  { company: 'bgs', tier: 'express', baseFee: 80, maxDeclaredValue: 2499, shippingFlatRate: 15, insuranceRate: 0.02, estimatedTurnaroundDays: 15 },
  { company: 'bgs', tier: 'super_express', baseFee: 175, maxDeclaredValue: 4999, shippingFlatRate: 18, insuranceRate: 0.025, estimatedTurnaroundDays: 5 },
  { company: 'bgs', tier: 'walk_through', baseFee: 500, maxDeclaredValue: 24999, shippingFlatRate: 25, insuranceRate: 0.03, estimatedTurnaroundDays: 2 },
  // SGC
  { company: 'sgc', tier: 'economy', baseFee: 18, maxDeclaredValue: 499, shippingFlatRate: 10, insuranceRate: 0.01, estimatedTurnaroundDays: 80 },
  { company: 'sgc', tier: 'regular', baseFee: 35, maxDeclaredValue: 999, shippingFlatRate: 12, insuranceRate: 0.015, estimatedTurnaroundDays: 35 },
  { company: 'sgc', tier: 'express', baseFee: 75, maxDeclaredValue: 2499, shippingFlatRate: 15, insuranceRate: 0.02, estimatedTurnaroundDays: 12 },
  { company: 'sgc', tier: 'super_express', baseFee: 150, maxDeclaredValue: 4999, shippingFlatRate: 18, insuranceRate: 0.025, estimatedTurnaroundDays: 5 },
  // CSG
  { company: 'csg', tier: 'economy', baseFee: 15, maxDeclaredValue: 249, shippingFlatRate: 8, insuranceRate: 0.01, estimatedTurnaroundDays: 70 },
  { company: 'csg', tier: 'regular', baseFee: 30, maxDeclaredValue: 999, shippingFlatRate: 10, insuranceRate: 0.015, estimatedTurnaroundDays: 30 },
  { company: 'csg', tier: 'express', baseFee: 65, maxDeclaredValue: 2499, shippingFlatRate: 14, insuranceRate: 0.02, estimatedTurnaroundDays: 10 },
  // HGA
  { company: 'hga', tier: 'economy', baseFee: 20, maxDeclaredValue: 499, shippingFlatRate: 10, insuranceRate: 0.01, estimatedTurnaroundDays: 60 },
  { company: 'hga', tier: 'regular', baseFee: 35, maxDeclaredValue: 999, shippingFlatRate: 12, insuranceRate: 0.015, estimatedTurnaroundDays: 30 },
  { company: 'hga', tier: 'express', baseFee: 70, maxDeclaredValue: 2499, shippingFlatRate: 15, insuranceRate: 0.02, estimatedTurnaroundDays: 10 },
];

// ---- Mock Submissions ----

const MOCK_SUBMISSIONS: GradingSubmission[] = [
  {
    id: 'GS-001',
    cardName: '2023 Bowman Chrome Victor Wembanyama Auto',
    cardYear: '2023',
    cardSet: 'Bowman Chrome',
    cardNumber: 'CDA-VW',
    sport: 'Basketball',
    company: 'psa',
    tier: 'express',
    status: 'grading',
    submittedDate: '2026-02-10',
    estimatedReturnDate: '2026-03-15',
    declaredValue: 2200,
    estimatedGrade: 9.5,
    gradingCost: 100,
    shippingCost: 15,
    insuranceCost: 44,
    totalCost: 159,
    preGradeValue: 1800,
    trackingOutbound: '9400111899223100456789',
    notes: 'Centering looks strong, minor surface concern',
  },
  {
    id: 'GS-002',
    cardName: '2018 Panini Prizm Luka Doncic Silver RC',
    cardYear: '2018',
    cardSet: 'Panini Prizm',
    cardNumber: '280',
    sport: 'Basketball',
    company: 'psa',
    tier: 'regular',
    status: 'received',
    submittedDate: '2026-01-20',
    estimatedReturnDate: '2026-04-01',
    declaredValue: 800,
    estimatedGrade: 9,
    gradingCost: 50,
    shippingCost: 12,
    insuranceCost: 12,
    totalCost: 74,
    preGradeValue: 650,
    trackingOutbound: '9400111899223100456790',
  },
  {
    id: 'GS-003',
    cardName: '1986 Fleer Michael Jordan RC #57',
    cardYear: '1986',
    cardSet: 'Fleer',
    cardNumber: '57',
    sport: 'Basketball',
    company: 'bgs',
    tier: 'super_express',
    status: 'graded',
    submittedDate: '2026-02-01',
    estimatedReturnDate: '2026-02-15',
    actualReturnDate: '2026-02-12',
    declaredValue: 4500,
    estimatedGrade: 7,
    actualGrade: 7.5,
    gradingCost: 175,
    shippingCost: 18,
    insuranceCost: 112.5,
    totalCost: 305.5,
    preGradeValue: 3200,
    postGradeValue: 5800,
    certNumber: '0015678901',
  },
  {
    id: 'GS-004',
    cardName: '2020 Panini Select Justin Herbert Tie-Dye /25',
    cardYear: '2020',
    cardSet: 'Panini Select',
    cardNumber: '244',
    sport: 'Football',
    company: 'sgc',
    tier: 'regular',
    status: 'shipped',
    submittedDate: '2026-02-25',
    estimatedReturnDate: '2026-04-10',
    declaredValue: 450,
    estimatedGrade: 9,
    gradingCost: 35,
    shippingCost: 12,
    insuranceCost: 6.75,
    totalCost: 53.75,
    preGradeValue: 380,
    trackingOutbound: '9400111899223100456791',
  },
  {
    id: 'GS-005',
    cardName: '2011 Topps Update Mike Trout RC #US175',
    cardYear: '2011',
    cardSet: 'Topps Update',
    cardNumber: 'US175',
    sport: 'Baseball',
    company: 'psa',
    tier: 'express',
    status: 'shipped_back',
    submittedDate: '2026-01-15',
    estimatedReturnDate: '2026-02-20',
    declaredValue: 2000,
    estimatedGrade: 8.5,
    actualGrade: 9,
    gradingCost: 100,
    shippingCost: 15,
    insuranceCost: 40,
    totalCost: 155,
    preGradeValue: 1500,
    postGradeValue: 3200,
    certNumber: '0078901234',
    trackingReturn: '9400111899223100456792',
  },
  {
    id: 'GS-006',
    cardName: '2022 Topps Chrome Julio Rodriguez Gold /50',
    cardYear: '2022',
    cardSet: 'Topps Chrome',
    cardNumber: '220',
    sport: 'Baseball',
    company: 'csg',
    tier: 'regular',
    status: 'grading',
    submittedDate: '2026-02-05',
    estimatedReturnDate: '2026-03-20',
    declaredValue: 600,
    estimatedGrade: 9.5,
    gradingCost: 30,
    shippingCost: 10,
    insuranceCost: 9,
    totalCost: 49,
    preGradeValue: 500,
  },
  {
    id: 'GS-007',
    cardName: '2019 Panini Mosaic Zion Williamson Silver RC',
    cardYear: '2019',
    cardSet: 'Panini Mosaic',
    cardNumber: '209',
    sport: 'Basketball',
    company: 'hga',
    tier: 'regular',
    status: 'delivered',
    submittedDate: '2025-12-10',
    estimatedReturnDate: '2026-01-15',
    actualReturnDate: '2026-01-18',
    declaredValue: 300,
    estimatedGrade: 9,
    actualGrade: 9.5,
    gradingCost: 35,
    shippingCost: 12,
    insuranceCost: 4.5,
    totalCost: 51.5,
    preGradeValue: 220,
    postGradeValue: 380,
    certNumber: 'HGA-0045678',
  },
  {
    id: 'GS-008',
    cardName: '2023 Topps Chrome Elly De La Cruz Auto',
    cardYear: '2023',
    cardSet: 'Topps Chrome',
    cardNumber: 'RA-EDLC',
    sport: 'Baseball',
    company: 'psa',
    tier: 'regular',
    status: 'received',
    submittedDate: '2026-02-15',
    estimatedReturnDate: '2026-04-20',
    declaredValue: 500,
    estimatedGrade: 9,
    gradingCost: 50,
    shippingCost: 12,
    insuranceCost: 7.5,
    totalCost: 69.5,
    preGradeValue: 420,
  },
  {
    id: 'GS-009',
    cardName: '2024 Panini Prizm Caleb Williams Silver RC',
    cardYear: '2024',
    cardSet: 'Panini Prizm',
    cardNumber: '301',
    sport: 'Football',
    company: 'bgs',
    tier: 'express',
    status: 'preparing',
    submittedDate: '2026-03-10',
    estimatedReturnDate: '2026-04-05',
    declaredValue: 350,
    estimatedGrade: 9.5,
    gradingCost: 80,
    shippingCost: 15,
    insuranceCost: 7,
    totalCost: 102,
    preGradeValue: 280,
  },
  {
    id: 'GS-010',
    cardName: '2001 SP Authentic Tiger Woods RC Auto /900',
    cardYear: '2001',
    cardSet: 'SP Authentic',
    cardNumber: '45',
    sport: 'Golf',
    company: 'bgs',
    tier: 'super_express',
    status: 'delivered',
    submittedDate: '2025-11-20',
    estimatedReturnDate: '2025-12-05',
    actualReturnDate: '2025-12-03',
    declaredValue: 4000,
    estimatedGrade: 8,
    actualGrade: 8.5,
    gradingCost: 175,
    shippingCost: 18,
    insuranceCost: 100,
    totalCost: 293,
    preGradeValue: 3500,
    postGradeValue: 6200,
    certNumber: '0098765432',
  },
  {
    id: 'GS-011',
    cardName: '2023 Panini Prizm Connor Bedard Silver RC',
    cardYear: '2023',
    cardSet: 'Panini Prizm',
    cardNumber: '281',
    sport: 'Hockey',
    company: 'sgc',
    tier: 'express',
    status: 'graded',
    submittedDate: '2026-02-18',
    estimatedReturnDate: '2026-03-10',
    declaredValue: 700,
    estimatedGrade: 10,
    actualGrade: 9.5,
    gradingCost: 75,
    shippingCost: 15,
    insuranceCost: 14,
    totalCost: 104,
    preGradeValue: 550,
    postGradeValue: 850,
    certNumber: 'SGC-0056789',
  },
  {
    id: 'GS-012',
    cardName: '2020 Topps Chrome Yordan Alvarez RC Auto',
    cardYear: '2020',
    cardSet: 'Topps Chrome',
    cardNumber: 'RA-YA',
    sport: 'Baseball',
    company: 'psa',
    tier: 'economy',
    status: 'received',
    submittedDate: '2025-12-01',
    estimatedReturnDate: '2026-04-15',
    declaredValue: 400,
    estimatedGrade: 8.5,
    gradingCost: 25,
    shippingCost: 12,
    insuranceCost: 4,
    totalCost: 41,
    preGradeValue: 320,
  },
  {
    id: 'GS-013',
    cardName: '2022 Panini Flawless Ja Morant Patch Auto /25',
    cardYear: '2022',
    cardSet: 'Panini Flawless',
    cardNumber: 'PA-JM',
    sport: 'Basketball',
    company: 'bgs',
    tier: 'express',
    status: 'grading',
    submittedDate: '2026-02-20',
    estimatedReturnDate: '2026-03-12',
    declaredValue: 1800,
    estimatedGrade: 9,
    gradingCost: 80,
    shippingCost: 15,
    insuranceCost: 36,
    totalCost: 131,
    preGradeValue: 1400,
  },
];

// ---- Mock Group Submissions ----

const MOCK_GROUP_SUBMISSIONS: GroupSubmission[] = [
  {
    id: 'GRP-001',
    name: 'March PSA Bulk Run',
    organizer: 'CardVault Collective',
    company: 'psa',
    tier: 'economy',
    status: 'open',
    members: [
      { name: 'Alex M.', cardCount: 15, paidAmount: 555, cards: ['Wembanyama RC', 'Holmgren RC', 'Various Chrome'] },
      { name: 'Jordan K.', cardCount: 8, paidAmount: 296, cards: ['Trout Update', 'Jeter Chrome', 'Misc Baseball'] },
      { name: 'Sam T.', cardCount: 12, paidAmount: 444, cards: ['Brady RC', 'Mahomes Prizm', 'Football lot'] },
    ],
    totalCards: 35,
    maxCards: 50,
    shippingCostTotal: 28,
    shippingCostPerCard: 0.8,
    deadline: '2026-03-25',
    createdDate: '2026-03-01',
    notes: 'Economy tier, max declared $499/card. Ship to Alex by 3/20.',
  },
  {
    id: 'GRP-002',
    name: 'BGS Basketball Premium',
    organizer: 'Hoop Dreams Grading Co-op',
    company: 'bgs',
    tier: 'express',
    status: 'shipped',
    members: [
      { name: 'Chris P.', cardCount: 5, paidAmount: 507.5, cards: ['LeBron Exquisite', 'Curry Prizm Silver', 'Durant Fleer'] },
      { name: 'Mia R.', cardCount: 3, paidAmount: 304.5, cards: ['Wembanyama National Treasures', 'Giannis Prizm'] },
    ],
    totalCards: 8,
    maxCards: 10,
    shippingCostTotal: 22,
    shippingCostPerCard: 2.75,
    deadline: '2026-02-28',
    createdDate: '2026-02-10',
  },
  {
    id: 'GRP-003',
    name: 'SGC Vintage Run',
    organizer: 'Old School Collectors',
    company: 'sgc',
    tier: 'regular',
    status: 'returned',
    members: [
      { name: 'Dave L.', cardCount: 20, paidAmount: 760, cards: ['1952 Topps lot', '1955 Bowman lot'] },
      { name: 'Pete S.', cardCount: 10, paidAmount: 380, cards: ['1960s Topps stars', '1969 Topps Reggie'] },
      { name: 'Tom B.', cardCount: 6, paidAmount: 228, cards: ['1957 Topps Mantle', '1956 Topps lot'] },
    ],
    totalCards: 36,
    maxCards: 40,
    shippingCostTotal: 32,
    shippingCostPerCard: 0.89,
    deadline: '2026-01-15',
    createdDate: '2025-12-20',
  },
];

// ---- Mock Turnaround History ----

interface TurnaroundDataPoint {
  month: string;
  psa: number;
  bgs: number;
  sgc: number;
  csg: number;
  hga: number;
}

const TURNAROUND_HISTORY: TurnaroundDataPoint[] = [
  { month: 'Sep 2025', psa: 72, bgs: 50, sgc: 38, csg: 32, hga: 28 },
  { month: 'Oct 2025', psa: 68, bgs: 48, sgc: 36, csg: 30, hga: 30 },
  { month: 'Nov 2025', psa: 70, bgs: 46, sgc: 35, csg: 28, hga: 32 },
  { month: 'Dec 2025', psa: 75, bgs: 52, sgc: 40, csg: 35, hga: 28 },
  { month: 'Jan 2026', psa: 65, bgs: 45, sgc: 34, csg: 30, hga: 30 },
  { month: 'Feb 2026', psa: 62, bgs: 42, sgc: 32, csg: 28, hga: 26 },
];

export function getTurnaroundHistory(): TurnaroundDataPoint[] {
  return TURNAROUND_HISTORY;
}

// ---- Service Functions ----

export function getSubmissions(): GradingSubmission[] {
  return MOCK_SUBMISSIONS;
}

export function getActiveSubmissions(): GradingSubmission[] {
  return MOCK_SUBMISSIONS.filter(
    (s) => s.status !== 'delivered' && s.status !== 'graded'
  );
}

export function createSubmission(
  partial: Omit<GradingSubmission, 'id' | 'totalCost'>
): GradingSubmission {
  const totalCost = partial.gradingCost + partial.shippingCost + partial.insuranceCost;
  const newSubmission: GradingSubmission = {
    ...partial,
    id: `GS-${String(MOCK_SUBMISSIONS.length + 1).padStart(3, '0')}`,
    totalCost,
  };
  MOCK_SUBMISSIONS.push(newSubmission);
  return newSubmission;
}

export function updateStatus(
  submissionId: string,
  newStatus: SubmissionStatus
): GradingSubmission | null {
  const submission = MOCK_SUBMISSIONS.find((s) => s.id === submissionId);
  if (!submission) return null;
  submission.status = newStatus;
  if (newStatus === 'delivered') {
    submission.actualReturnDate = new Date().toISOString().split('T')[0];
  }
  return submission;
}

export function getTurnaroundEstimate(
  company: GradingCompany,
  tier: ServiceTier
): TurnaroundEstimate | null {
  const cost = MOCK_GRADING_COSTS.find(
    (c) => c.company === company && c.tier === tier
  );
  if (!cost) return null;

  const recentHistory = TURNAROUND_HISTORY.slice(-3);
  const avgRecent =
    recentHistory.reduce((sum, h) => sum + h[company], 0) / recentHistory.length;

  // Scale by tier relative to economy
  const tierMultipliers: Record<ServiceTier, number> = {
    economy: 1,
    regular: 0.55,
    express: 0.2,
    super_express: 0.08,
    walk_through: 0.03,
  };

  const adjustedDays = Math.round(avgRecent * (tierMultipliers[tier] || 0.55));
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + adjustedDays);

  return {
    company,
    tier,
    advertisedDays: cost.estimatedTurnaroundDays,
    actualAverageDays: adjustedDays,
    recentTrendDays: Math.round(avgRecent * tierMultipliers[tier]),
    confidence: tier === 'walk_through' ? 0.95 : tier === 'super_express' ? 0.88 : 0.72,
    estimatedReturnDate: estimatedDate.toISOString().split('T')[0],
    historicalRange: {
      min: Math.round(adjustedDays * 0.7),
      max: Math.round(adjustedDays * 1.4),
    },
  };
}

export function getOptimalTier(
  declaredValue: number,
  urgencyDays: number
): { company: GradingCompany; tier: ServiceTier; cost: number; turnaroundDays: number; score: number }[] {
  const options: { company: GradingCompany; tier: ServiceTier; cost: number; turnaroundDays: number; score: number }[] = [];

  for (const cost of MOCK_GRADING_COSTS) {
    if (declaredValue > cost.maxDeclaredValue) continue;

    const estimate = getTurnaroundEstimate(cost.company, cost.tier);
    if (!estimate) continue;

    const totalCost = cost.baseFee + cost.shippingFlatRate + declaredValue * cost.insuranceRate;
    const meetsDeadline = estimate.actualAverageDays <= urgencyDays;
    const speedScore = meetsDeadline ? 1 : Math.max(0, 1 - (estimate.actualAverageDays - urgencyDays) / urgencyDays);
    const costScore = 1 - Math.min(totalCost / declaredValue, 1);
    const score = speedScore * 0.6 + costScore * 0.4;

    options.push({
      company: cost.company,
      tier: cost.tier,
      cost: Math.round(totalCost * 100) / 100,
      turnaroundDays: estimate.actualAverageDays,
      score: Math.round(score * 100) / 100,
    });
  }

  return options.sort((a, b) => b.score - a.score);
}

export function getGradingCosts(
  company?: GradingCompany,
  tier?: ServiceTier
): GradingCost[] {
  let costs = MOCK_GRADING_COSTS;
  if (company) costs = costs.filter((c) => c.company === company);
  if (tier) costs = costs.filter((c) => c.tier === tier);
  return costs;
}

export function getGroupSubmissions(): GroupSubmission[] {
  return MOCK_GROUP_SUBMISSIONS;
}

export function getGradeHistory(): GradingSubmission[] {
  return MOCK_SUBMISSIONS.filter(
    (s) => s.status === 'delivered' || s.status === 'graded' || s.status === 'shipped_back'
  );
}

export function getCompanyComparison(): CompanyComparison[] {
  return [
    {
      company: 'psa',
      label: 'PSA',
      avgTurnaround: 65,
      avgCostPerCard: 55,
      reputationScore: 98,
      populationReportQuality: 95,
      holderQuality: 88,
      crossoverAcceptance: 95,
      marketPremium: 22,
      totalGraded: '52M+',
      yearFounded: 1991,
      color: COMPANY_COLORS.psa,
    },
    {
      company: 'bgs',
      label: 'BGS (Beckett)',
      avgTurnaround: 45,
      avgCostPerCard: 48,
      reputationScore: 95,
      populationReportQuality: 92,
      holderQuality: 96,
      crossoverAcceptance: 90,
      marketPremium: 25,
      totalGraded: '18M+',
      yearFounded: 1999,
      color: COMPANY_COLORS.bgs,
    },
    {
      company: 'sgc',
      label: 'SGC',
      avgTurnaround: 35,
      avgCostPerCard: 38,
      reputationScore: 85,
      populationReportQuality: 78,
      holderQuality: 82,
      crossoverAcceptance: 72,
      marketPremium: 12,
      totalGraded: '5M+',
      yearFounded: 1998,
      color: COMPANY_COLORS.sgc,
    },
    {
      company: 'csg',
      label: 'CSG',
      avgTurnaround: 30,
      avgCostPerCard: 28,
      reputationScore: 72,
      populationReportQuality: 70,
      holderQuality: 78,
      crossoverAcceptance: 55,
      marketPremium: 6,
      totalGraded: '2M+',
      yearFounded: 2020,
      color: COMPANY_COLORS.csg,
    },
    {
      company: 'hga',
      label: 'HGA',
      avgTurnaround: 28,
      avgCostPerCard: 32,
      reputationScore: 68,
      populationReportQuality: 65,
      holderQuality: 90,
      crossoverAcceptance: 48,
      marketPremium: 4,
      totalGraded: '1.5M+',
      yearFounded: 2020,
      color: COMPANY_COLORS.hga,
    },
  ];
}

export function getSubmissionROI(): SubmissionROI[] {
  return MOCK_SUBMISSIONS.filter((s) => s.postGradeValue != null).map((s) => {
    const postVal = s.postGradeValue!;
    const netProfit = postVal - s.preGradeValue - s.totalCost;
    const roi = ((postVal - s.preGradeValue - s.totalCost) / s.totalCost) * 100;
    const submittedDate = new Date(s.submittedDate);
    const returnDate = s.actualReturnDate ? new Date(s.actualReturnDate) : new Date();
    const daysHeld = Math.max(1, Math.round((returnDate.getTime() - submittedDate.getTime()) / 86400000));
    const annualizedROI = (roi / daysHeld) * 365;

    return {
      submissionId: s.id,
      cardName: s.cardName,
      totalCost: s.totalCost,
      preGradeValue: s.preGradeValue,
      postGradeValue: postVal,
      netProfit: Math.round(netProfit * 100) / 100,
      roi: Math.round(roi * 100) / 100,
      daysHeld,
      annualizedROI: Math.round(annualizedROI * 100) / 100,
    };
  });
}

export function getSubmissionsByCompany(): { company: GradingCompany; label: string; count: number; color: string }[] {
  const counts: Partial<Record<GradingCompany, number>> = {};
  for (const s of MOCK_SUBMISSIONS) {
    counts[s.company] = (counts[s.company] || 0) + 1;
  }
  return (Object.entries(counts) as [GradingCompany, number][]).map(([company, count]) => ({
    company,
    label: COMPANY_LABELS[company],
    count,
    color: COMPANY_COLORS[company],
  }));
}

export function getSubmissionsByStatus(): { status: SubmissionStatus; label: string; count: number }[] {
  const counts: Partial<Record<SubmissionStatus, number>> = {};
  for (const s of MOCK_SUBMISSIONS) {
    counts[s.status] = (counts[s.status] || 0) + 1;
  }
  return (Object.entries(counts) as [SubmissionStatus, number][]).map(([status, count]) => ({
    status,
    label: STATUS_LABELS[status],
    count,
  }));
}

export function getAverageTurnaround(): number {
  const completed = MOCK_SUBMISSIONS.filter((s) => s.actualReturnDate);
  if (completed.length === 0) return 0;
  const totalDays = completed.reduce((sum, s) => {
    const submitted = new Date(s.submittedDate);
    const returned = new Date(s.actualReturnDate!);
    return sum + Math.round((returned.getTime() - submitted.getTime()) / 86400000);
  }, 0);
  return Math.round(totalDays / completed.length);
}

export function getNextExpectedReturn(): GradingSubmission | null {
  const active = MOCK_SUBMISSIONS.filter(
    (s) => !s.actualReturnDate && s.status !== 'delivered' && s.status !== 'preparing'
  );
  if (active.length === 0) return null;
  return active.sort(
    (a, b) => new Date(a.estimatedReturnDate).getTime() - new Date(b.estimatedReturnDate).getTime()
  )[0];
}

export function getTotalGradingSpend(): number {
  return MOCK_SUBMISSIONS.reduce((sum, s) => sum + s.totalCost, 0);
}

export function getTotalValueGained(): number {
  return MOCK_SUBMISSIONS.filter((s) => s.postGradeValue != null).reduce(
    (sum, s) => sum + (s.postGradeValue! - s.preGradeValue),
    0
  );
}
