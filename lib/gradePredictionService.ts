// ---- Types ----

export type GradingCompany = 'PSA' | 'BGS' | 'SGC' | 'CGC';

export type SubgradeCategory = 'centering' | 'corners' | 'edges' | 'surface';

export type SubmissionTier = 'value' | 'regular' | 'express' | 'super_express' | 'walk_through';

export interface SubgradeDetail {
  category: SubgradeCategory;
  score: number; // 1-10
  confidence: number; // 0-100
  notes: string;
}

export interface GradeDistributionEntry {
  grade: number;
  probability: number; // 0-100
}

export interface CompanyPrediction {
  company: GradingCompany;
  predictedGrade: number;
  confidence: number; // 0-100
  gradeDistribution: GradeDistributionEntry[];
  subgrades: SubgradeDetail[];
}

export interface SubmissionRecommendation {
  recommendedCompany: GradingCompany;
  recommendedTier: SubmissionTier;
  reason: string;
  estimatedTurnaround: number; // days
  estimatedCost: number;
}

export interface GradePrediction {
  id: string;
  cardName: string;
  player: string;
  year: number;
  set: string;
  sport: string;
  imageUrl: string;
  predictions: CompanyPrediction[];
  overallConfidence: number; // 0-100
  conditionNotes: string[];
  valueDelta: { rawValue: number; predictedGradedValue: number; percentIncrease: number };
  submissionRecommendation: SubmissionRecommendation;
  timestamp: string;
}

export interface GradingTierCost {
  tier: SubmissionTier;
  label: string;
  cost: number;
  turnaroundDays: number;
  maxDeclaredValue: number;
}

export interface GradingCostComparison {
  company: GradingCompany;
  tiers: GradingTierCost[];
  insuranceRate: number; // percentage
  shippingCost: number;
  membershipRequired: boolean;
  membershipCost: number;
}

export interface GradePopulationData {
  id: string;
  cardName: string;
  player: string;
  year: number;
  set: string;
  sport: string;
  populations: {
    company: GradingCompany;
    totalGraded: number;
    gradeBreakdown: { grade: number; count: number; percentage: number }[];
    gemRate: number; // percentage
    lastUpdated: string;
  }[];
}

export interface GradingROI {
  grade: number;
  rawValue: number;
  gradedValue: number;
  gradingCost: number;
  netROI: number;
  roiPercent: number;
  recommendation: 'strong_submit' | 'submit' | 'hold' | 'skip';
}

export type SubmissionStatus =
  | 'pending_shipment'
  | 'in_transit'
  | 'received'
  | 'grading_queue'
  | 'grading_in_progress'
  | 'quality_review'
  | 'graded'
  | 'shipped_back'
  | 'delivered';

export interface SubmissionTracker {
  id: string;
  cardName: string;
  player: string;
  company: GradingCompany;
  tier: SubmissionTier;
  status: SubmissionStatus;
  submittedDate: string;
  expectedReturnDate: string;
  declaredValue: number;
  cost: number;
  trackingNumber: string;
  estimatedGrade: number;
  actualGrade: number | null;
  notes: string;
}

export interface PredictionStats {
  totalPredictions: number;
  accuracyRate: number; // percentage — within 0.5 of actual
  exactMatchRate: number; // percentage — exact match
  averageDeviation: number; // average grade difference
  averageROI: number; // percentage
  totalSavings: number; // dollars
  companyBreakdown: { company: GradingCompany; predictions: number; accuracy: number }[];
  monthlyAccuracy: { month: string; accuracy: number; predictions: number }[];
}

// ---- Constants ----

const STORAGE_KEY = 'msi_grade_predictions';
const TRACKER_KEY = 'msi_grade_submission_tracker';

// ---- Seed Data: Grade Predictions ----

function buildSubgrades(
  centering: number,
  corners: number,
  edges: number,
  surface: number,
): SubgradeDetail[] {
  return [
    { category: 'centering', score: centering, confidence: 82 + Math.round(centering * 1.5), notes: centering >= 9 ? 'Well centered within tolerance' : 'Slight off-center to left' },
    { category: 'corners', score: corners, confidence: 80 + Math.round(corners * 1.8), notes: corners >= 9 ? 'Sharp corners, no wear' : 'Minor corner softness detected' },
    { category: 'edges', score: edges, confidence: 78 + Math.round(edges * 2), notes: edges >= 9 ? 'Clean edges throughout' : 'Light edge wear visible' },
    { category: 'surface', score: surface, confidence: 81 + Math.round(surface * 1.6), notes: surface >= 9 ? 'Clean surface, no defects' : 'Minor surface imperfection' },
  ];
}

function buildDistribution(center: number): GradeDistributionEntry[] {
  const grades = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];
  const dist: GradeDistributionEntry[] = [];
  let remaining = 100;
  for (const g of grades) {
    const distance = Math.abs(g - center);
    let prob = Math.max(0, Math.round(40 - distance * 12 + (Math.random() * 4 - 2)));
    if (prob > remaining) prob = remaining;
    remaining -= prob;
    dist.push({ grade: g, probability: prob });
  }
  // distribute remaining to center
  const centerIdx = dist.findIndex(d => d.grade === center) ?? dist.length - 1;
  if (centerIdx >= 0) dist[centerIdx].probability += remaining;
  else dist[dist.length - 1].probability += remaining;
  return dist;
}

function buildPredictions(
  psaGrade: number,
  bgsGrade: number,
  sgcGrade: number,
  cgcGrade: number,
  confidence: number,
  centering: number,
  corners: number,
  edges: number,
  surface: number,
): CompanyPrediction[] {
  return [
    {
      company: 'PSA',
      predictedGrade: psaGrade,
      confidence: confidence,
      gradeDistribution: buildDistribution(psaGrade),
      subgrades: buildSubgrades(centering, corners, edges, surface),
    },
    {
      company: 'BGS',
      predictedGrade: bgsGrade,
      confidence: confidence - 2,
      gradeDistribution: buildDistribution(bgsGrade),
      subgrades: buildSubgrades(centering, corners, edges, surface),
    },
    {
      company: 'SGC',
      predictedGrade: sgcGrade,
      confidence: confidence - 4,
      gradeDistribution: buildDistribution(sgcGrade),
      subgrades: buildSubgrades(centering, corners, edges, surface),
    },
    {
      company: 'CGC',
      predictedGrade: cgcGrade,
      confidence: confidence - 3,
      gradeDistribution: buildDistribution(cgcGrade),
      subgrades: buildSubgrades(centering, corners, edges, surface),
    },
  ];
}

const DEFAULT_PREDICTIONS: GradePrediction[] = [
  {
    id: 'gp-001',
    cardName: '2023 Prizm Silver #1',
    player: 'Victor Wembanyama',
    year: 2023,
    set: 'Panini Prizm',
    sport: 'Basketball',
    imageUrl: '/cards/wembanyama-prizm.jpg',
    predictions: buildPredictions(10, 9.5, 10, 9.5, 94, 9.5, 9.5, 10, 9.5),
    overallConfidence: 94,
    conditionNotes: ['Pack-fresh condition', 'Sharp corners observed', 'Excellent centering'],
    valueDelta: { rawValue: 450, predictedGradedValue: 2800, percentIncrease: 522 },
    submissionRecommendation: { recommendedCompany: 'PSA', recommendedTier: 'express', reason: 'High-value rookie — PSA 10 commands highest premium', estimatedTurnaround: 15, estimatedCost: 150 },
    timestamp: '2026-03-10T08:30:00Z',
  },
  {
    id: 'gp-002',
    cardName: '2023 Topps Chrome #1',
    player: 'Shohei Ohtani',
    year: 2023,
    set: 'Topps Chrome',
    sport: 'Baseball',
    imageUrl: '/cards/ohtani-chrome.jpg',
    predictions: buildPredictions(9, 9, 9, 9, 88, 9, 9, 9, 8.5),
    overallConfidence: 88,
    conditionNotes: ['Minor surface print line', 'Good centering', 'Sharp corners'],
    valueDelta: { rawValue: 120, predictedGradedValue: 580, percentIncrease: 383 },
    submissionRecommendation: { recommendedCompany: 'PSA', recommendedTier: 'regular', reason: 'PSA 9 still strong premium for Ohtani', estimatedTurnaround: 30, estimatedCost: 50 },
    timestamp: '2026-03-09T14:15:00Z',
  },
  {
    id: 'gp-003',
    cardName: '2017 Prizm Silver #269',
    player: 'Patrick Mahomes',
    year: 2017,
    set: 'Panini Prizm',
    sport: 'Football',
    imageUrl: '/cards/mahomes-prizm.jpg',
    predictions: buildPredictions(9.5, 9.5, 9.5, 9, 91, 9.5, 9, 9.5, 9.5),
    overallConfidence: 91,
    conditionNotes: ['Excellent condition for age', 'Near-perfect centering', 'Clean surfaces'],
    valueDelta: { rawValue: 1800, predictedGradedValue: 8500, percentIncrease: 372 },
    submissionRecommendation: { recommendedCompany: 'PSA', recommendedTier: 'super_express', reason: 'High-value vintage rookie — expedite to maximize ROI', estimatedTurnaround: 5, estimatedCost: 300 },
    timestamp: '2026-03-08T10:00:00Z',
  },
  {
    id: 'gp-004',
    cardName: '2003 Topps Chrome #111 Refractor',
    player: 'LeBron James',
    year: 2003,
    set: 'Topps Chrome',
    sport: 'Basketball',
    imageUrl: '/cards/lebron-chrome.jpg',
    predictions: buildPredictions(8, 8, 8.5, 8, 82, 8, 8.5, 8, 7.5),
    overallConfidence: 82,
    conditionNotes: ['Light corner wear', 'Surface scratching under magnification', 'Centering 55/45'],
    valueDelta: { rawValue: 12000, predictedGradedValue: 28000, percentIncrease: 133 },
    submissionRecommendation: { recommendedCompany: 'BGS', recommendedTier: 'express', reason: 'BGS subgrades add value for vintage LeBron', estimatedTurnaround: 10, estimatedCost: 250 },
    timestamp: '2026-03-07T16:45:00Z',
  },
  {
    id: 'gp-005',
    cardName: '2011 Topps Update #US175',
    player: 'Mike Trout',
    year: 2011,
    set: 'Topps Update',
    sport: 'Baseball',
    imageUrl: '/cards/trout-update.jpg',
    predictions: buildPredictions(9, 9, 9, 8.5, 86, 9, 8.5, 9, 9),
    overallConfidence: 86,
    conditionNotes: ['Strong corners', 'Clean back', 'Very slight edge wear at top'],
    valueDelta: { rawValue: 3500, predictedGradedValue: 12000, percentIncrease: 243 },
    submissionRecommendation: { recommendedCompany: 'PSA', recommendedTier: 'express', reason: 'PSA 9 Trout rookies are highly liquid', estimatedTurnaround: 15, estimatedCost: 150 },
    timestamp: '2026-03-06T09:20:00Z',
  },
  {
    id: 'gp-006',
    cardName: '2018 Prizm Silver #280',
    player: 'Luka Doncic',
    year: 2018,
    set: 'Panini Prizm',
    sport: 'Basketball',
    imageUrl: '/cards/doncic-prizm.jpg',
    predictions: buildPredictions(10, 9.5, 10, 9.5, 92, 10, 9.5, 9.5, 10),
    overallConfidence: 92,
    conditionNotes: ['Pack-fresh', 'Perfect centering', 'Pristine surfaces'],
    valueDelta: { rawValue: 800, predictedGradedValue: 4200, percentIncrease: 425 },
    submissionRecommendation: { recommendedCompany: 'PSA', recommendedTier: 'express', reason: 'Gem Mint candidate — PSA 10 premium is substantial', estimatedTurnaround: 15, estimatedCost: 150 },
    timestamp: '2026-03-05T11:30:00Z',
  },
  {
    id: 'gp-007',
    cardName: '2020 Prizm #339 Silver',
    player: 'Justin Herbert',
    year: 2020,
    set: 'Panini Prizm',
    sport: 'Football',
    imageUrl: '/cards/herbert-prizm.jpg',
    predictions: buildPredictions(9, 9, 9, 9, 87, 9, 8.5, 9, 9),
    overallConfidence: 87,
    conditionNotes: ['Good condition', 'Minor corner softness at bottom left', 'Clean surface'],
    valueDelta: { rawValue: 200, predictedGradedValue: 750, percentIncrease: 275 },
    submissionRecommendation: { recommendedCompany: 'SGC', recommendedTier: 'regular', reason: 'SGC offers best value for mid-tier football', estimatedTurnaround: 25, estimatedCost: 30 },
    timestamp: '2026-03-04T13:00:00Z',
  },
  {
    id: 'gp-008',
    cardName: '2022 Bowman Chrome #BCP-1',
    player: 'Jackson Holliday',
    year: 2022,
    set: 'Bowman Chrome',
    sport: 'Baseball',
    imageUrl: '/cards/holliday-bowman.jpg',
    predictions: buildPredictions(9.5, 9.5, 9.5, 9, 90, 9.5, 9.5, 9, 9.5),
    overallConfidence: 90,
    conditionNotes: ['Near-mint condition', 'Excellent centering', 'Clean chrome surface'],
    valueDelta: { rawValue: 150, predictedGradedValue: 620, percentIncrease: 313 },
    submissionRecommendation: { recommendedCompany: 'PSA', recommendedTier: 'regular', reason: 'PSA preferred for Bowman Chrome prospects', estimatedTurnaround: 30, estimatedCost: 50 },
    timestamp: '2026-03-03T15:45:00Z',
  },
  {
    id: 'gp-009',
    cardName: '2024 Topps #1',
    player: 'Elly De La Cruz',
    year: 2024,
    set: 'Topps Series 1',
    sport: 'Baseball',
    imageUrl: '/cards/delacruz-topps.jpg',
    predictions: buildPredictions(10, 9.5, 10, 10, 95, 10, 10, 10, 9.5),
    overallConfidence: 95,
    conditionNotes: ['Pack-fresh mint condition', 'Perfect centering', 'Flawless corners and edges'],
    valueDelta: { rawValue: 50, predictedGradedValue: 280, percentIncrease: 460 },
    submissionRecommendation: { recommendedCompany: 'PSA', recommendedTier: 'value', reason: 'Low declared value — value tier saves cost', estimatedTurnaround: 60, estimatedCost: 25 },
    timestamp: '2026-03-02T08:00:00Z',
  },
  {
    id: 'gp-010',
    cardName: '2019 Mosaic #209',
    player: 'Ja Morant',
    year: 2019,
    set: 'Panini Mosaic',
    sport: 'Basketball',
    imageUrl: '/cards/morant-mosaic.jpg',
    predictions: buildPredictions(8.5, 8.5, 8.5, 8, 79, 8, 8.5, 8.5, 8.5),
    overallConfidence: 79,
    conditionNotes: ['Edge wear visible under loupe', 'Decent centering', 'Surface clean'],
    valueDelta: { rawValue: 100, predictedGradedValue: 320, percentIncrease: 220 },
    submissionRecommendation: { recommendedCompany: 'SGC', recommendedTier: 'regular', reason: 'SGC cost-effective for mid-grade modern', estimatedTurnaround: 25, estimatedCost: 30 },
    timestamp: '2026-03-01T12:30:00Z',
  },
  {
    id: 'gp-011',
    cardName: '2018 Topps Chrome Update #HMT32',
    player: 'Juan Soto',
    year: 2018,
    set: 'Topps Chrome Update',
    sport: 'Baseball',
    imageUrl: '/cards/soto-chrome.jpg',
    predictions: buildPredictions(9.5, 9, 9.5, 9, 89, 9.5, 9, 9.5, 9),
    overallConfidence: 89,
    conditionNotes: ['Strong overall condition', 'Slight corner softness bottom right', 'Good centering'],
    valueDelta: { rawValue: 280, predictedGradedValue: 1050, percentIncrease: 275 },
    submissionRecommendation: { recommendedCompany: 'PSA', recommendedTier: 'regular', reason: 'PSA 9.5 or 10 for Soto RC commands premium', estimatedTurnaround: 30, estimatedCost: 50 },
    timestamp: '2026-02-28T09:00:00Z',
  },
  {
    id: 'gp-012',
    cardName: '2020 Select #44 Concourse',
    player: 'Joe Burrow',
    year: 2020,
    set: 'Panini Select',
    sport: 'Football',
    imageUrl: '/cards/burrow-select.jpg',
    predictions: buildPredictions(9, 8.5, 9, 8.5, 84, 9, 8, 9, 8.5),
    overallConfidence: 84,
    conditionNotes: ['Good overall condition', 'Centering slightly off vertically', 'Clean surface'],
    valueDelta: { rawValue: 180, predictedGradedValue: 620, percentIncrease: 244 },
    submissionRecommendation: { recommendedCompany: 'PSA', recommendedTier: 'regular', reason: 'PSA 9 most marketable for Burrow', estimatedTurnaround: 30, estimatedCost: 50 },
    timestamp: '2026-02-27T14:00:00Z',
  },
  {
    id: 'gp-013',
    cardName: '2022 Topps #659 Rookie',
    player: 'Julio Rodriguez',
    year: 2022,
    set: 'Topps Series 2',
    sport: 'Baseball',
    imageUrl: '/cards/jrod-topps.jpg',
    predictions: buildPredictions(10, 10, 10, 9.5, 96, 10, 10, 10, 10),
    overallConfidence: 96,
    conditionNotes: ['Gem Mint candidate', 'Perfect in all categories', 'Pack-fresh condition'],
    valueDelta: { rawValue: 40, predictedGradedValue: 220, percentIncrease: 450 },
    submissionRecommendation: { recommendedCompany: 'PSA', recommendedTier: 'value', reason: 'Strong Gem Mint candidate — value tier ideal', estimatedTurnaround: 60, estimatedCost: 25 },
    timestamp: '2026-02-26T10:15:00Z',
  },
  {
    id: 'gp-014',
    cardName: '2023 Donruss Optic Rated Rookie #201',
    player: 'Caleb Williams',
    year: 2023,
    set: 'Donruss Optic',
    sport: 'Football',
    imageUrl: '/cards/williams-optic.jpg',
    predictions: buildPredictions(9.5, 9.5, 9, 9, 88, 9, 9.5, 9.5, 9.5),
    overallConfidence: 88,
    conditionNotes: ['Near-mint plus', 'Centering slightly off-center', 'Strong corners and edges'],
    valueDelta: { rawValue: 95, predictedGradedValue: 380, percentIncrease: 300 },
    submissionRecommendation: { recommendedCompany: 'BGS', recommendedTier: 'regular', reason: 'BGS 9.5 with strong subgrades adds value', estimatedTurnaround: 30, estimatedCost: 40 },
    timestamp: '2026-02-25T11:00:00Z',
  },
  {
    id: 'gp-015',
    cardName: '2024 Bowman #1 1st Edition',
    player: 'Ethan Salas',
    year: 2024,
    set: 'Bowman 1st Edition',
    sport: 'Baseball',
    imageUrl: '/cards/salas-bowman.jpg',
    predictions: buildPredictions(9, 9, 9, 8.5, 85, 8.5, 9, 9, 9),
    overallConfidence: 85,
    conditionNotes: ['Good condition', 'Centering slightly bottom-heavy', 'Clean surface and edges'],
    valueDelta: { rawValue: 75, predictedGradedValue: 310, percentIncrease: 313 },
    submissionRecommendation: { recommendedCompany: 'PSA', recommendedTier: 'regular', reason: 'PSA is standard for Bowman 1st prospects', estimatedTurnaround: 30, estimatedCost: 50 },
    timestamp: '2026-02-24T16:30:00Z',
  },
  {
    id: 'gp-016',
    cardName: '2019 Prizm #248 Silver',
    player: 'Zion Williamson',
    year: 2019,
    set: 'Panini Prizm',
    sport: 'Basketball',
    imageUrl: '/cards/zion-prizm.jpg',
    predictions: buildPredictions(8, 7.5, 8, 7.5, 76, 7.5, 8, 7.5, 8),
    overallConfidence: 76,
    conditionNotes: ['Visible corner wear', 'Surface dimple near top edge', 'Centering acceptable'],
    valueDelta: { rawValue: 350, predictedGradedValue: 700, percentIncrease: 100 },
    submissionRecommendation: { recommendedCompany: 'SGC', recommendedTier: 'regular', reason: 'SGC cost-effective for expected mid-grade', estimatedTurnaround: 25, estimatedCost: 30 },
    timestamp: '2026-02-23T09:45:00Z',
  },
];

// ---- Seed Data: Grading Cost Comparisons ----

const DEFAULT_GRADING_COSTS: GradingCostComparison[] = [
  {
    company: 'PSA',
    tiers: [
      { tier: 'value', label: 'Value', cost: 25, turnaroundDays: 65, maxDeclaredValue: 499 },
      { tier: 'regular', label: 'Regular', cost: 50, turnaroundDays: 30, maxDeclaredValue: 1499 },
      { tier: 'express', label: 'Express', cost: 150, turnaroundDays: 15, maxDeclaredValue: 4999 },
      { tier: 'super_express', label: 'Super Express', cost: 300, turnaroundDays: 5, maxDeclaredValue: 9999 },
      { tier: 'walk_through', label: 'Walk-Through', cost: 600, turnaroundDays: 1, maxDeclaredValue: 24999 },
    ],
    insuranceRate: 1.0,
    shippingCost: 12,
    membershipRequired: true,
    membershipCost: 99,
  },
  {
    company: 'BGS',
    tiers: [
      { tier: 'value', label: 'Economy', cost: 22, turnaroundDays: 60, maxDeclaredValue: 499 },
      { tier: 'regular', label: 'Standard', cost: 40, turnaroundDays: 25, maxDeclaredValue: 2499 },
      { tier: 'express', label: 'Express', cost: 100, turnaroundDays: 10, maxDeclaredValue: 4999 },
      { tier: 'super_express', label: 'Super Express', cost: 250, turnaroundDays: 3, maxDeclaredValue: 9999 },
      { tier: 'walk_through', label: 'Premium', cost: 500, turnaroundDays: 1, maxDeclaredValue: 49999 },
    ],
    insuranceRate: 1.2,
    shippingCost: 15,
    membershipRequired: false,
    membershipCost: 0,
  },
  {
    company: 'SGC',
    tiers: [
      { tier: 'value', label: 'Bulk', cost: 15, turnaroundDays: 45, maxDeclaredValue: 499 },
      { tier: 'regular', label: 'Standard', cost: 30, turnaroundDays: 20, maxDeclaredValue: 2499 },
      { tier: 'express', label: 'Express', cost: 75, turnaroundDays: 7, maxDeclaredValue: 4999 },
      { tier: 'super_express', label: 'Priority', cost: 150, turnaroundDays: 3, maxDeclaredValue: 9999 },
      { tier: 'walk_through', label: 'Walk-Through', cost: 350, turnaroundDays: 1, maxDeclaredValue: 24999 },
    ],
    insuranceRate: 0.8,
    shippingCost: 10,
    membershipRequired: false,
    membershipCost: 0,
  },
  {
    company: 'CGC',
    tiers: [
      { tier: 'value', label: 'Economy', cost: 20, turnaroundDays: 50, maxDeclaredValue: 399 },
      { tier: 'regular', label: 'Standard', cost: 38, turnaroundDays: 22, maxDeclaredValue: 1999 },
      { tier: 'express', label: 'Express', cost: 85, turnaroundDays: 8, maxDeclaredValue: 4999 },
      { tier: 'super_express', label: 'Priority', cost: 200, turnaroundDays: 3, maxDeclaredValue: 9999 },
      { tier: 'walk_through', label: 'Walk-Through', cost: 450, turnaroundDays: 1, maxDeclaredValue: 24999 },
    ],
    insuranceRate: 1.0,
    shippingCost: 12,
    membershipRequired: true,
    membershipCost: 49,
  },
];

// ---- Seed Data: Population Data ----

function buildPopBreakdown(total: number, gemRate: number): { grade: number; count: number; percentage: number }[] {
  const grades = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const weights = [0.5, 0.8, 1.5, 2.5, 4, 6, 12, 22, 28, gemRate];
  const sumW = weights.reduce((a, b) => a + b, 0);
  return grades.map((g, i) => {
    const pct = Math.round((weights[i] / sumW) * 1000) / 10;
    return { grade: g, count: Math.round(total * (pct / 100)), percentage: pct };
  });
}

const DEFAULT_POPULATION_DATA: GradePopulationData[] = [
  {
    id: 'pop-001', cardName: '2023 Prizm Silver #1', player: 'Victor Wembanyama', year: 2023, set: 'Panini Prizm', sport: 'Basketball',
    populations: [
      { company: 'PSA', totalGraded: 48250, gradeBreakdown: buildPopBreakdown(48250, 22), gemRate: 22, lastUpdated: '2026-03-14' },
      { company: 'BGS', totalGraded: 12400, gradeBreakdown: buildPopBreakdown(12400, 8), gemRate: 8, lastUpdated: '2026-03-14' },
      { company: 'SGC', totalGraded: 8900, gradeBreakdown: buildPopBreakdown(8900, 18), gemRate: 18, lastUpdated: '2026-03-13' },
      { company: 'CGC', totalGraded: 3200, gradeBreakdown: buildPopBreakdown(3200, 15), gemRate: 15, lastUpdated: '2026-03-12' },
    ],
  },
  {
    id: 'pop-002', cardName: '2023 Topps Chrome #1', player: 'Shohei Ohtani', year: 2023, set: 'Topps Chrome', sport: 'Baseball',
    populations: [
      { company: 'PSA', totalGraded: 65100, gradeBreakdown: buildPopBreakdown(65100, 25), gemRate: 25, lastUpdated: '2026-03-14' },
      { company: 'BGS', totalGraded: 15200, gradeBreakdown: buildPopBreakdown(15200, 9), gemRate: 9, lastUpdated: '2026-03-13' },
      { company: 'SGC', totalGraded: 11300, gradeBreakdown: buildPopBreakdown(11300, 20), gemRate: 20, lastUpdated: '2026-03-13' },
      { company: 'CGC', totalGraded: 4100, gradeBreakdown: buildPopBreakdown(4100, 16), gemRate: 16, lastUpdated: '2026-03-12' },
    ],
  },
  {
    id: 'pop-003', cardName: '2017 Prizm Silver #269', player: 'Patrick Mahomes', year: 2017, set: 'Panini Prizm', sport: 'Football',
    populations: [
      { company: 'PSA', totalGraded: 32800, gradeBreakdown: buildPopBreakdown(32800, 12), gemRate: 12, lastUpdated: '2026-03-14' },
      { company: 'BGS', totalGraded: 9800, gradeBreakdown: buildPopBreakdown(9800, 5), gemRate: 5, lastUpdated: '2026-03-13' },
      { company: 'SGC', totalGraded: 6500, gradeBreakdown: buildPopBreakdown(6500, 10), gemRate: 10, lastUpdated: '2026-03-12' },
      { company: 'CGC', totalGraded: 2100, gradeBreakdown: buildPopBreakdown(2100, 8), gemRate: 8, lastUpdated: '2026-03-11' },
    ],
  },
  {
    id: 'pop-004', cardName: '2003 Topps Chrome #111', player: 'LeBron James', year: 2003, set: 'Topps Chrome', sport: 'Basketball',
    populations: [
      { company: 'PSA', totalGraded: 18500, gradeBreakdown: buildPopBreakdown(18500, 6), gemRate: 6, lastUpdated: '2026-03-14' },
      { company: 'BGS', totalGraded: 7200, gradeBreakdown: buildPopBreakdown(7200, 3), gemRate: 3, lastUpdated: '2026-03-13' },
      { company: 'SGC', totalGraded: 2800, gradeBreakdown: buildPopBreakdown(2800, 5), gemRate: 5, lastUpdated: '2026-03-12' },
      { company: 'CGC', totalGraded: 950, gradeBreakdown: buildPopBreakdown(950, 4), gemRate: 4, lastUpdated: '2026-03-10' },
    ],
  },
  {
    id: 'pop-005', cardName: '2011 Topps Update #US175', player: 'Mike Trout', year: 2011, set: 'Topps Update', sport: 'Baseball',
    populations: [
      { company: 'PSA', totalGraded: 42600, gradeBreakdown: buildPopBreakdown(42600, 8), gemRate: 8, lastUpdated: '2026-03-14' },
      { company: 'BGS', totalGraded: 14500, gradeBreakdown: buildPopBreakdown(14500, 4), gemRate: 4, lastUpdated: '2026-03-13' },
      { company: 'SGC', totalGraded: 5200, gradeBreakdown: buildPopBreakdown(5200, 7), gemRate: 7, lastUpdated: '2026-03-12' },
      { company: 'CGC', totalGraded: 1800, gradeBreakdown: buildPopBreakdown(1800, 5), gemRate: 5, lastUpdated: '2026-03-11' },
    ],
  },
  {
    id: 'pop-006', cardName: '2018 Prizm Silver #280', player: 'Luka Doncic', year: 2018, set: 'Panini Prizm', sport: 'Basketball',
    populations: [
      { company: 'PSA', totalGraded: 38100, gradeBreakdown: buildPopBreakdown(38100, 15), gemRate: 15, lastUpdated: '2026-03-14' },
      { company: 'BGS', totalGraded: 10500, gradeBreakdown: buildPopBreakdown(10500, 6), gemRate: 6, lastUpdated: '2026-03-13' },
      { company: 'SGC', totalGraded: 7400, gradeBreakdown: buildPopBreakdown(7400, 12), gemRate: 12, lastUpdated: '2026-03-12' },
      { company: 'CGC', totalGraded: 2500, gradeBreakdown: buildPopBreakdown(2500, 10), gemRate: 10, lastUpdated: '2026-03-11' },
    ],
  },
  {
    id: 'pop-007', cardName: '2020 Prizm #339 Silver', player: 'Justin Herbert', year: 2020, set: 'Panini Prizm', sport: 'Football',
    populations: [
      { company: 'PSA', totalGraded: 28700, gradeBreakdown: buildPopBreakdown(28700, 18), gemRate: 18, lastUpdated: '2026-03-14' },
      { company: 'BGS', totalGraded: 8200, gradeBreakdown: buildPopBreakdown(8200, 7), gemRate: 7, lastUpdated: '2026-03-13' },
      { company: 'SGC', totalGraded: 6100, gradeBreakdown: buildPopBreakdown(6100, 14), gemRate: 14, lastUpdated: '2026-03-12' },
      { company: 'CGC', totalGraded: 2000, gradeBreakdown: buildPopBreakdown(2000, 11), gemRate: 11, lastUpdated: '2026-03-10' },
    ],
  },
  {
    id: 'pop-008', cardName: '2022 Bowman Chrome #BCP-1', player: 'Jackson Holliday', year: 2022, set: 'Bowman Chrome', sport: 'Baseball',
    populations: [
      { company: 'PSA', totalGraded: 18900, gradeBreakdown: buildPopBreakdown(18900, 20), gemRate: 20, lastUpdated: '2026-03-14' },
      { company: 'BGS', totalGraded: 5400, gradeBreakdown: buildPopBreakdown(5400, 8), gemRate: 8, lastUpdated: '2026-03-13' },
      { company: 'SGC', totalGraded: 4200, gradeBreakdown: buildPopBreakdown(4200, 16), gemRate: 16, lastUpdated: '2026-03-12' },
      { company: 'CGC', totalGraded: 1500, gradeBreakdown: buildPopBreakdown(1500, 12), gemRate: 12, lastUpdated: '2026-03-10' },
    ],
  },
  {
    id: 'pop-009', cardName: '2024 Topps #1', player: 'Elly De La Cruz', year: 2024, set: 'Topps Series 1', sport: 'Baseball',
    populations: [
      { company: 'PSA', totalGraded: 55200, gradeBreakdown: buildPopBreakdown(55200, 28), gemRate: 28, lastUpdated: '2026-03-14' },
      { company: 'BGS', totalGraded: 12800, gradeBreakdown: buildPopBreakdown(12800, 10), gemRate: 10, lastUpdated: '2026-03-13' },
      { company: 'SGC', totalGraded: 9600, gradeBreakdown: buildPopBreakdown(9600, 22), gemRate: 22, lastUpdated: '2026-03-12' },
      { company: 'CGC', totalGraded: 3800, gradeBreakdown: buildPopBreakdown(3800, 18), gemRate: 18, lastUpdated: '2026-03-10' },
    ],
  },
  {
    id: 'pop-010', cardName: '2019 Mosaic #209', player: 'Ja Morant', year: 2019, set: 'Panini Mosaic', sport: 'Basketball',
    populations: [
      { company: 'PSA', totalGraded: 22400, gradeBreakdown: buildPopBreakdown(22400, 16), gemRate: 16, lastUpdated: '2026-03-14' },
      { company: 'BGS', totalGraded: 6500, gradeBreakdown: buildPopBreakdown(6500, 6), gemRate: 6, lastUpdated: '2026-03-13' },
      { company: 'SGC', totalGraded: 4800, gradeBreakdown: buildPopBreakdown(4800, 13), gemRate: 13, lastUpdated: '2026-03-12' },
      { company: 'CGC', totalGraded: 1600, gradeBreakdown: buildPopBreakdown(1600, 9), gemRate: 9, lastUpdated: '2026-03-10' },
    ],
  },
  {
    id: 'pop-011', cardName: '2018 Topps Chrome Update #HMT32', player: 'Juan Soto', year: 2018, set: 'Topps Chrome Update', sport: 'Baseball',
    populations: [
      { company: 'PSA', totalGraded: 31200, gradeBreakdown: buildPopBreakdown(31200, 14), gemRate: 14, lastUpdated: '2026-03-14' },
      { company: 'BGS', totalGraded: 8800, gradeBreakdown: buildPopBreakdown(8800, 5), gemRate: 5, lastUpdated: '2026-03-13' },
      { company: 'SGC', totalGraded: 5500, gradeBreakdown: buildPopBreakdown(5500, 11), gemRate: 11, lastUpdated: '2026-03-12' },
      { company: 'CGC', totalGraded: 1900, gradeBreakdown: buildPopBreakdown(1900, 8), gemRate: 8, lastUpdated: '2026-03-10' },
    ],
  },
];

// ---- Seed Data: Submission Tracker ----

const DEFAULT_SUBMISSIONS: SubmissionTracker[] = [
  { id: 'st-001', cardName: '2023 Prizm Silver #1', player: 'Victor Wembanyama', company: 'PSA', tier: 'express', status: 'grading_in_progress', submittedDate: '2026-02-20', expectedReturnDate: '2026-03-10', declaredValue: 2500, cost: 150, trackingNumber: 'PS9283746501', estimatedGrade: 10, actualGrade: null, notes: 'High-value rookie submission' },
  { id: 'st-002', cardName: '2023 Topps Chrome #1', player: 'Shohei Ohtani', company: 'PSA', tier: 'regular', status: 'graded', submittedDate: '2026-01-15', expectedReturnDate: '2026-02-15', declaredValue: 500, cost: 50, trackingNumber: 'PS9283746502', estimatedGrade: 9, actualGrade: 9, notes: 'Grade matched prediction' },
  { id: 'st-003', cardName: '2017 Prizm Silver #269', player: 'Patrick Mahomes', company: 'PSA', tier: 'super_express', status: 'shipped_back', submittedDate: '2026-03-01', expectedReturnDate: '2026-03-08', declaredValue: 8000, cost: 300, trackingNumber: 'PS9283746503', estimatedGrade: 9.5, actualGrade: 10, notes: 'Exceeded prediction — Gem Mint!' },
  { id: 'st-004', cardName: '2003 Topps Chrome #111', player: 'LeBron James', company: 'BGS', tier: 'express', status: 'quality_review', submittedDate: '2026-02-25', expectedReturnDate: '2026-03-10', declaredValue: 25000, cost: 250, trackingNumber: 'BG7362514801', estimatedGrade: 8, actualGrade: null, notes: 'Vintage Chrome — handling with care' },
  { id: 'st-005', cardName: '2011 Topps Update #US175', player: 'Mike Trout', company: 'PSA', tier: 'express', status: 'received', submittedDate: '2026-03-05', expectedReturnDate: '2026-03-22', declaredValue: 10000, cost: 150, trackingNumber: 'PS9283746505', estimatedGrade: 9, actualGrade: null, notes: 'Key vintage rookie' },
  { id: 'st-006', cardName: '2018 Prizm Silver #280', player: 'Luka Doncic', company: 'PSA', tier: 'express', status: 'delivered', submittedDate: '2026-01-10', expectedReturnDate: '2026-01-28', declaredValue: 4000, cost: 150, trackingNumber: 'PS9283746506', estimatedGrade: 10, actualGrade: 10, notes: 'Gem Mint — perfect prediction' },
  { id: 'st-007', cardName: '2020 Prizm #339 Silver', player: 'Justin Herbert', company: 'SGC', tier: 'regular', status: 'grading_queue', submittedDate: '2026-03-01', expectedReturnDate: '2026-03-25', declaredValue: 700, cost: 30, trackingNumber: 'SG5847261301', estimatedGrade: 9, actualGrade: null, notes: 'Budget-friendly submission' },
  { id: 'st-008', cardName: '2022 Bowman Chrome #BCP-1', player: 'Jackson Holliday', company: 'PSA', tier: 'regular', status: 'in_transit', submittedDate: '2026-03-10', expectedReturnDate: '2026-04-10', declaredValue: 600, cost: 50, trackingNumber: 'PS9283746508', estimatedGrade: 9.5, actualGrade: null, notes: 'Top prospect submission' },
  { id: 'st-009', cardName: '2024 Topps #1', player: 'Elly De La Cruz', company: 'PSA', tier: 'value', status: 'pending_shipment', submittedDate: '2026-03-14', expectedReturnDate: '2026-05-15', declaredValue: 250, cost: 25, trackingNumber: '', estimatedGrade: 10, actualGrade: null, notes: 'Value tier for lower declared value' },
  { id: 'st-010', cardName: '2019 Mosaic #209', player: 'Ja Morant', company: 'SGC', tier: 'regular', status: 'delivered', submittedDate: '2025-12-15', expectedReturnDate: '2026-01-10', declaredValue: 300, cost: 30, trackingNumber: 'SG5847261310', estimatedGrade: 8.5, actualGrade: 8, notes: 'Slight under-prediction — edge wear' },
  { id: 'st-011', cardName: '2018 Topps Chrome Update #HMT32', player: 'Juan Soto', company: 'PSA', tier: 'regular', status: 'graded', submittedDate: '2026-01-20', expectedReturnDate: '2026-02-20', declaredValue: 1000, cost: 50, trackingNumber: 'PS9283746511', estimatedGrade: 9.5, actualGrade: 9, notes: 'Slightly below prediction — corner softness' },
  { id: 'st-012', cardName: '2020 Select #44', player: 'Joe Burrow', company: 'PSA', tier: 'regular', status: 'graded', submittedDate: '2026-02-01', expectedReturnDate: '2026-03-01', declaredValue: 600, cost: 50, trackingNumber: 'PS9283746512', estimatedGrade: 9, actualGrade: 9, notes: 'Exact match on prediction' },
];

// ---- Helper Functions ----

export function getCompanyColor(company: GradingCompany): string {
  const colors: Record<GradingCompany, string> = {
    PSA: '#ef4444',
    BGS: '#3b82f6',
    SGC: '#f59e0b',
    CGC: '#10b981',
  };
  return colors[company] ?? '#6b7280';
}

export function getGradeColor(grade: number): string {
  if (grade >= 9.5) return '#22c55e';
  if (grade >= 9) return '#84cc16';
  if (grade >= 8) return '#eab308';
  if (grade >= 7) return '#f97316';
  if (grade >= 6) return '#ef4444';
  return '#dc2626';
}

export function getStatusLabel(status: SubmissionStatus): string {
  const labels: Record<SubmissionStatus, string> = {
    pending_shipment: 'Pending Shipment',
    in_transit: 'In Transit',
    received: 'Received',
    grading_queue: 'In Queue',
    grading_in_progress: 'Grading In Progress',
    quality_review: 'Quality Review',
    graded: 'Graded',
    shipped_back: 'Shipped Back',
    delivered: 'Delivered',
  };
  return labels[status] ?? status;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

export function getSubgradeLabel(category: SubgradeCategory): string {
  const labels: Record<SubgradeCategory, string> = {
    centering: 'Centering',
    corners: 'Corners',
    edges: 'Edges',
    surface: 'Surface',
  };
  return labels[category] ?? category;
}

export function getRecommendationColor(rec: GradingROI['recommendation']): string {
  const colors: Record<GradingROI['recommendation'], string> = {
    strong_submit: '#22c55e',
    submit: '#84cc16',
    hold: '#eab308',
    skip: '#ef4444',
  };
  return colors[rec] ?? '#6b7280';
}

function getTierLabel(tier: SubmissionTier): string {
  const labels: Record<SubmissionTier, string> = {
    value: 'Value',
    regular: 'Regular',
    express: 'Express',
    super_express: 'Super Express',
    walk_through: 'Walk-Through',
  };
  return labels[tier] ?? tier;
}

// ---- localStorage Persistence ----

function loadPredictions(): GradePrediction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as GradePrediction[];
  } catch {
    // ignore parse errors
  }
  return [...DEFAULT_PREDICTIONS];
}

function savePredictions(predictions: GradePrediction[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(predictions));
}

function loadTracker(): SubmissionTracker[] {
  try {
    const raw = localStorage.getItem(TRACKER_KEY);
    if (raw) return JSON.parse(raw) as SubmissionTracker[];
  } catch {
    // ignore parse errors
  }
  return [...DEFAULT_SUBMISSIONS];
}

function saveTracker(tracker: SubmissionTracker[]): void {
  localStorage.setItem(TRACKER_KEY, JSON.stringify(tracker));
}

// ---- Exported Functions ----

export function getGradePredictions(): GradePrediction[] {
  return loadPredictions();
}

export function getGradingCosts(): GradingCostComparison[] {
  return [...DEFAULT_GRADING_COSTS];
}

export function getPopulationData(): GradePopulationData[] {
  return [...DEFAULT_POPULATION_DATA];
}

export function getGradingROI(cardValue: number): GradingROI[] {
  const grades = [6, 7, 7.5, 8, 8.5, 9, 9.5, 10];
  const multipliers: Record<number, number> = {
    6: 1.2,
    7: 1.5,
    7.5: 1.8,
    8: 2.2,
    8.5: 3.0,
    9: 4.5,
    9.5: 7.0,
    10: 12.0,
  };

  const gradingCostBase = 50; // regular PSA tier

  return grades.map((grade) => {
    const gradedValue = Math.round(cardValue * (multipliers[grade] ?? 1));
    const gradingCost = gradingCostBase;
    const netROI = gradedValue - cardValue - gradingCost;
    const roiPercent = Math.round(((gradedValue - cardValue - gradingCost) / (cardValue + gradingCost)) * 100);

    let recommendation: GradingROI['recommendation'];
    if (roiPercent >= 200) recommendation = 'strong_submit';
    else if (roiPercent >= 50) recommendation = 'submit';
    else if (roiPercent >= 0) recommendation = 'hold';
    else recommendation = 'skip';

    return { grade, rawValue: cardValue, gradedValue, gradingCost, netROI, roiPercent, recommendation };
  });
}

export function getSubmissionTracker(): SubmissionTracker[] {
  return loadTracker();
}

export function getPredictionStats(): PredictionStats {
  const predictions = loadPredictions();
  const tracker = loadTracker();

  const completedSubmissions = tracker.filter((s) => s.actualGrade !== null);
  const totalPredictions = predictions.length;

  let exactMatches = 0;
  let withinHalf = 0;
  let totalDeviation = 0;
  let totalROI = 0;
  let totalSavings = 0;

  for (const sub of completedSubmissions) {
    const deviation = Math.abs(sub.estimatedGrade - (sub.actualGrade as number));
    totalDeviation += deviation;
    if (deviation === 0) exactMatches++;
    if (deviation <= 0.5) withinHalf++;

    // Calculate ROI from the matching prediction
    const pred = predictions.find((p) => p.player === sub.player);
    if (pred) {
      const roi = ((pred.valueDelta.predictedGradedValue - pred.valueDelta.rawValue - sub.cost) / (pred.valueDelta.rawValue + sub.cost)) * 100;
      totalROI += roi;
      totalSavings += pred.valueDelta.predictedGradedValue - pred.valueDelta.rawValue - sub.cost;
    }
  }

  const completedCount = completedSubmissions.length || 1;
  const accuracyRate = Math.round((withinHalf / completedCount) * 100);
  const exactMatchRate = Math.round((exactMatches / completedCount) * 100);
  const averageDeviation = Math.round((totalDeviation / completedCount) * 100) / 100;
  const averageROI = Math.round(totalROI / completedCount);

  const companyBreakdown: PredictionStats['companyBreakdown'] = (['PSA', 'BGS', 'SGC', 'CGC'] as GradingCompany[]).map((company) => {
    const companySubs = completedSubmissions.filter((s) => s.company === company);
    const companyAccurate = companySubs.filter((s) => Math.abs(s.estimatedGrade - (s.actualGrade as number)) <= 0.5).length;
    return {
      company,
      predictions: companySubs.length,
      accuracy: companySubs.length > 0 ? Math.round((companyAccurate / companySubs.length) * 100) : 0,
    };
  });

  const monthlyAccuracy: PredictionStats['monthlyAccuracy'] = [
    { month: 'Oct 2025', accuracy: 78, predictions: 12 },
    { month: 'Nov 2025', accuracy: 82, predictions: 15 },
    { month: 'Dec 2025', accuracy: 85, predictions: 18 },
    { month: 'Jan 2026', accuracy: 88, predictions: 22 },
    { month: 'Feb 2026', accuracy: 91, predictions: 20 },
    { month: 'Mar 2026', accuracy: 93, predictions: 16 },
  ];

  return {
    totalPredictions,
    accuracyRate,
    exactMatchRate,
    averageDeviation,
    averageROI,
    totalSavings,
    companyBreakdown,
    monthlyAccuracy,
  };
}

export function predictGrade(
  cardName: string,
  player: string,
  year: number,
  set: string,
  sport: string,
): GradePrediction {
  // Simulated AI prediction based on card attributes
  const hash = (cardName + player + year + set).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const baseGrade = 7 + (hash % 30) / 10; // 7.0 - 10.0 range
  const psaGrade = Math.min(10, Math.round(baseGrade * 2) / 2);
  const bgsGrade = Math.min(10, Math.round((baseGrade - 0.25) * 2) / 2);
  const sgcGrade = Math.min(10, Math.round(baseGrade * 2) / 2);
  const cgcGrade = Math.min(10, Math.round((baseGrade - 0.15) * 2) / 2);
  const confidence = 70 + (hash % 25);

  const centering = Math.min(10, Math.round((7 + (hash % 30) / 10) * 2) / 2);
  const corners = Math.min(10, Math.round((7.5 + ((hash * 3) % 25) / 10) * 2) / 2);
  const edges = Math.min(10, Math.round((7.5 + ((hash * 7) % 25) / 10) * 2) / 2);
  const surface = Math.min(10, Math.round((7 + ((hash * 11) % 30) / 10) * 2) / 2);

  const rawValue = 50 + (hash % 500);
  const predictedGradedValue = Math.round(rawValue * (1 + psaGrade / 5));

  const prediction: GradePrediction = {
    id: `gp-sim-${Date.now()}`,
    cardName,
    player,
    year,
    set,
    sport,
    imageUrl: '/cards/placeholder.jpg',
    predictions: buildPredictions(psaGrade, bgsGrade, sgcGrade, cgcGrade, confidence, centering, corners, edges, surface),
    overallConfidence: confidence,
    conditionNotes: ['AI-generated prediction', 'Based on card attribute analysis', `Estimated base grade: ${baseGrade.toFixed(1)}`],
    valueDelta: { rawValue, predictedGradedValue, percentIncrease: Math.round(((predictedGradedValue - rawValue) / rawValue) * 100) },
    submissionRecommendation: {
      recommendedCompany: psaGrade >= 9 ? 'PSA' : 'SGC',
      recommendedTier: rawValue > 1000 ? 'express' : rawValue > 200 ? 'regular' : 'value',
      reason: psaGrade >= 9 ? 'High grade candidate — PSA commands best premium' : 'Cost-effective option for mid-grade cards',
      estimatedTurnaround: rawValue > 1000 ? 15 : 30,
      estimatedCost: rawValue > 1000 ? 150 : 50,
    },
    timestamp: new Date().toISOString(),
  };

  // Persist the new prediction
  const all = loadPredictions();
  all.unshift(prediction);
  savePredictions(all);

  return prediction;
}

// ---- Status Pipeline Ordering ----

const STATUS_ORDER: SubmissionStatus[] = [
  'pending_shipment',
  'in_transit',
  'received',
  'grading_queue',
  'grading_in_progress',
  'quality_review',
  'graded',
  'shipped_back',
  'delivered',
];

export function getStatusProgress(status: SubmissionStatus): number {
  const idx = STATUS_ORDER.indexOf(status);
  return idx >= 0 ? Math.round(((idx + 1) / STATUS_ORDER.length) * 100) : 0;
}

export { getTierLabel, STATUS_ORDER };
