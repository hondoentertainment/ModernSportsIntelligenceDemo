// ---- Types ----

export type GradingCompany = 'PSA' | 'BGS' | 'SGC' | 'CGC';
export type SubgradeCategory = 'centering' | 'corners' | 'edges' | 'surface';
export type SubmissionTier = 'value' | 'regular' | 'express' | 'super_express' | 'walk_through';

export interface GradePrediction {
  id: string;
  cardName: string;
  player: string;
  year: number;
  set: string;
  sport: string;
  imageUrl: string;
  predictions: {
    company: GradingCompany;
    predictedGrade: number;
    confidence: number;
    gradeDistribution: { grade: string; probability: number }[];
    subgrades: {
      centering: number;
      corners: number;
      edges: number;
      surface: number;
    };
  }[];
  overallConfidence: number;
  conditionNotes: string[];
  valueDelta: { raw: number; graded: number; uplift: number; upliftPercent: number };
  submissionRecommendation: {
    recommended: boolean;
    bestCompany: GradingCompany;
    bestTier: SubmissionTier;
    estimatedCost: number;
    estimatedTurnaround: string;
    expectedROI: number;
    reasoning: string;
  };
  timestamp: string;
}

export interface GradingCostComparison {
  company: GradingCompany;
  tiers: {
    tier: SubmissionTier;
    cost: number;
    turnaround: string;
    available: boolean;
  }[];
  bulkDiscount: { minCards: number; discount: number }[];
  membershipCost: number;
  membershipBenefits: string[];
}

export interface GradePopulationData {
  cardName: string;
  player: string;
  populations: {
    company: GradingCompany;
    grades: { grade: string; count: number; percentOfTotal: number }[];
    totalGraded: number;
    gem_rate: number;
  }[];
}

export interface GradingROI {
  grade: string;
  rawValue: number;
  gradedValue: number;
  gradingCost: number;
  netROI: number;
  roiPercent: number;
  breakEvenGrade: string;
  recommendation: 'submit' | 'skip' | 'borderline';
}

export interface SubmissionTracker {
  id: string;
  cardName: string;
  player: string;
  company: GradingCompany;
  tier: SubmissionTier;
  submittedDate: string;
  estimatedReturn: string;
  status: 'submitted' | 'received' | 'grading' | 'shipped' | 'complete';
  predictedGrade: number;
  actualGrade: number | null;
  cost: number;
}

export interface PredictionStats {
  totalPredictions: number;
  avgConfidence: number;
  accuracyRate: number;
  withinOneGrade: number;
  exactMatch: number;
  avgROIOnSubmissions: number;
  totalSubmissions: number;
  totalSavings: number;
  bestPrediction: { cardName: string; predicted: number; actual: number };
}

// ---- storage helpers ----

import { store } from './dal/syncStore';

const STORAGE_PREFIX = 'msi_grade_prediction';

function loadFromStorage<T>(key: string, fallback: T): T {
  return store.get<T>(`${STORAGE_PREFIX}_${key}`, fallback);
}

function saveToStorage<T>(key: string, data: T): void {
  store.set(`${STORAGE_PREFIX}_${key}`, data);
}

// ---- Internal helpers for mock data generation ----

function makeDistribution(peak: number): { grade: string; probability: number }[] {
  const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '8.5', '9', '9.5', '10'];
  const raw = grades.map(g => {
    const numG = parseFloat(g);
    const diff = Math.abs(numG - peak);
    return { grade: g, probability: Math.max(0.01, parseFloat((1 / (1 + diff * diff)).toFixed(3))) };
  });
  const sum = raw.reduce((s, r) => s + r.probability, 0);
  return raw.map(r => ({ grade: r.grade, probability: parseFloat((r.probability / sum).toFixed(3)) }));
}

function makePredictions(predictedGrade: number, confidence: number): GradePrediction['predictions'] {
  const companies: GradingCompany[] = ['PSA', 'BGS', 'SGC', 'CGC'];
  const offsets: Record<GradingCompany, number> = { PSA: 0, BGS: -0.25, SGC: 0.25, CGC: -0.1 };
  const confOffsets: Record<GradingCompany, number> = { PSA: 2, BGS: -3, SGC: 1, CGC: -1 };

  return companies.map(company => {
    const grade = Math.min(10, Math.max(1, Math.round((predictedGrade + offsets[company]) * 2) / 2));
    const conf = Math.min(100, Math.max(50, confidence + confOffsets[company]));
    // Deterministic subgrades based on grade and company index
    const ci = companies.indexOf(company);
    return {
      company,
      predictedGrade: grade,
      confidence: conf,
      gradeDistribution: makeDistribution(grade),
      subgrades: {
        centering: Math.min(10, Math.max(7, parseFloat((grade + (ci * 0.1 - 0.15)).toFixed(1)))),
        corners: Math.min(10, Math.max(7, parseFloat((grade + (ci * 0.05 - 0.1)).toFixed(1)))),
        edges: Math.min(10, Math.max(7, parseFloat((grade + (ci * 0.08 - 0.12)).toFixed(1)))),
        surface: Math.min(10, Math.max(7, parseFloat((grade + (ci * 0.06 - 0.08)).toFixed(1)))),
      },
    };
  });
}

// ---- Mock Grade Predictions (16 cards) ----

const mockGradePredictions: GradePrediction[] = [
  {
    id: 'gp-001',
    cardName: '2023 Panini Prizm Silver RC',
    player: 'Victor Wembanyama',
    year: 2023,
    set: 'Panini Prizm',
    sport: 'Basketball',
    imageUrl: '/cards/wemby-prizm.jpg',
    predictions: makePredictions(9.5, 92),
    overallConfidence: 92,
    conditionNotes: ['Sharp corners observed', 'Centering slightly left', 'Clean surface', 'Edges look pristine'],
    valueDelta: { raw: 450, graded: 1850, uplift: 1400, upliftPercent: 311 },
    submissionRecommendation: {
      recommended: true,
      bestCompany: 'PSA',
      bestTier: 'express',
      estimatedCost: 75,
      estimatedTurnaround: '15 business days',
      expectedROI: 1767,
      reasoning: 'High confidence PSA 9.5+ prediction with significant value uplift. Express tier recommended for optimal cost-to-speed ratio.',
    },
    timestamp: '2026-03-10T14:30:00Z',
  },
  {
    id: 'gp-002',
    cardName: '2018 Panini Prizm Silver RC',
    player: 'Luka Doncic',
    year: 2018,
    set: 'Panini Prizm',
    sport: 'Basketball',
    imageUrl: '/cards/luka-prizm.jpg',
    predictions: makePredictions(9, 87),
    overallConfidence: 87,
    conditionNotes: ['Minor corner whitening on back', 'Good centering', 'Light surface scratch under magnification'],
    valueDelta: { raw: 1200, graded: 4500, uplift: 3300, upliftPercent: 275 },
    submissionRecommendation: {
      recommended: true,
      bestCompany: 'PSA',
      bestTier: 'regular',
      estimatedCost: 50,
      estimatedTurnaround: '45 business days',
      expectedROI: 6500,
      reasoning: 'Strong PSA 9 candidate with significant market premium for graded copies.',
    },
    timestamp: '2026-03-09T10:15:00Z',
  },
  {
    id: 'gp-003',
    cardName: '2020 Panini Mosaic RC',
    player: 'Justin Herbert',
    year: 2020,
    set: 'Panini Mosaic',
    sport: 'Football',
    imageUrl: '/cards/herbert-mosaic.jpg',
    predictions: makePredictions(9.5, 89),
    overallConfidence: 89,
    conditionNotes: ['Excellent centering', 'Sharp corners', 'Clean edges', 'Minor print line on surface'],
    valueDelta: { raw: 80, graded: 350, uplift: 270, upliftPercent: 338 },
    submissionRecommendation: {
      recommended: true,
      bestCompany: 'SGC',
      bestTier: 'regular',
      estimatedCost: 30,
      estimatedTurnaround: '30 business days',
      expectedROI: 800,
      reasoning: 'SGC offers best value for football cards in this price range. High gem rate expected.',
    },
    timestamp: '2026-03-08T09:00:00Z',
  },
  {
    id: 'gp-004',
    cardName: '2011 Topps Update RC',
    player: 'Mike Trout',
    year: 2011,
    set: 'Topps Update',
    sport: 'Baseball',
    imageUrl: '/cards/trout-topps.jpg',
    predictions: makePredictions(8, 78),
    overallConfidence: 78,
    conditionNotes: ['Corner wear visible top-left', 'Centering 55/45 left-right', 'Surface looks clean', 'Edge ding on bottom'],
    valueDelta: { raw: 3500, graded: 8500, uplift: 5000, upliftPercent: 143 },
    submissionRecommendation: {
      recommended: true,
      bestCompany: 'PSA',
      bestTier: 'express',
      estimatedCost: 75,
      estimatedTurnaround: '15 business days',
      expectedROI: 6567,
      reasoning: 'Even at PSA 8, graded Trout RCs carry strong premiums. Express tier recommended given card value.',
    },
    timestamp: '2026-03-07T16:45:00Z',
  },
  {
    id: 'gp-005',
    cardName: '2022 Topps Series 1 RC',
    player: 'Julio Rodriguez',
    year: 2022,
    set: 'Topps Series 1',
    sport: 'Baseball',
    imageUrl: '/cards/jrod-topps.jpg',
    predictions: makePredictions(10, 95),
    overallConfidence: 95,
    conditionNotes: ['Pack-fresh condition', 'Perfect centering', 'No visible flaws', 'Pristine surface'],
    valueDelta: { raw: 25, graded: 180, uplift: 155, upliftPercent: 620 },
    submissionRecommendation: {
      recommended: true,
      bestCompany: 'PSA',
      bestTier: 'value',
      estimatedCost: 25,
      estimatedTurnaround: '65 business days',
      expectedROI: 520,
      reasoning: 'Pack-fresh card with gem mint potential. Value tier sufficient given lower card value.',
    },
    timestamp: '2026-03-06T11:20:00Z',
  },
  {
    id: 'gp-006',
    cardName: '2019 Panini Prizm Silver RC',
    player: 'Ja Morant',
    year: 2019,
    set: 'Panini Prizm',
    sport: 'Basketball',
    imageUrl: '/cards/ja-prizm.jpg',
    predictions: makePredictions(9, 84),
    overallConfidence: 84,
    conditionNotes: ['Good overall condition', 'Slight edge wear on right side', 'Centering within tolerance'],
    valueDelta: { raw: 200, graded: 750, uplift: 550, upliftPercent: 275 },
    submissionRecommendation: {
      recommended: true,
      bestCompany: 'PSA',
      bestTier: 'regular',
      estimatedCost: 50,
      estimatedTurnaround: '45 business days',
      expectedROI: 1000,
      reasoning: 'Strong candidate for PSA 9 with good value uplift.',
    },
    timestamp: '2026-03-05T08:30:00Z',
  },
  {
    id: 'gp-007',
    cardName: '2020 Panini Prizm RC',
    player: 'Joe Burrow',
    year: 2020,
    set: 'Panini Prizm',
    sport: 'Football',
    imageUrl: '/cards/burrow-prizm.jpg',
    predictions: makePredictions(8.5, 81),
    overallConfidence: 81,
    conditionNotes: ['Minor corner softness', 'Good centering', 'Clean surface', 'Edges acceptable'],
    valueDelta: { raw: 150, graded: 500, uplift: 350, upliftPercent: 233 },
    submissionRecommendation: {
      recommended: true,
      bestCompany: 'SGC',
      bestTier: 'regular',
      estimatedCost: 30,
      estimatedTurnaround: '30 business days',
      expectedROI: 1067,
      reasoning: 'SGC provides competitive grading at lower cost. Good 8.5-9 candidate.',
    },
    timestamp: '2026-03-04T13:10:00Z',
  },
  {
    id: 'gp-008',
    cardName: '2018 Topps Chrome RC Auto',
    player: 'Shohei Ohtani',
    year: 2018,
    set: 'Topps Chrome',
    sport: 'Baseball',
    imageUrl: '/cards/ohtani-chrome.jpg',
    predictions: makePredictions(9, 86),
    overallConfidence: 86,
    conditionNotes: ['Sharp corners', 'Good centering', 'Auto is clean and bold', 'Minor surface imperfection'],
    valueDelta: { raw: 2800, graded: 8000, uplift: 5200, upliftPercent: 186 },
    submissionRecommendation: {
      recommended: true,
      bestCompany: 'BGS',
      bestTier: 'express',
      estimatedCost: 100,
      estimatedTurnaround: '10 business days',
      expectedROI: 5100,
      reasoning: 'BGS subgrades add premium for auto cards. Express recommended given card value.',
    },
    timestamp: '2026-03-03T15:55:00Z',
  },
  {
    id: 'gp-009',
    cardName: '2023 Panini Prizm Silver RC',
    player: 'CJ Stroud',
    year: 2023,
    set: 'Panini Prizm',
    sport: 'Football',
    imageUrl: '/cards/stroud-prizm.jpg',
    predictions: makePredictions(9.5, 90),
    overallConfidence: 90,
    conditionNotes: ['Pack-fresh appearance', 'Great centering', 'Sharp corners', 'Clean surface'],
    valueDelta: { raw: 120, graded: 480, uplift: 360, upliftPercent: 300 },
    submissionRecommendation: {
      recommended: true,
      bestCompany: 'PSA',
      bestTier: 'regular',
      estimatedCost: 50,
      estimatedTurnaround: '45 business days',
      expectedROI: 620,
      reasoning: 'High confidence gem mint candidate. Regular tier balances cost and turnaround.',
    },
    timestamp: '2026-03-02T10:00:00Z',
  },
  {
    id: 'gp-010',
    cardName: '1986 Fleer RC',
    player: 'Michael Jordan',
    year: 1986,
    set: 'Fleer',
    sport: 'Basketball',
    imageUrl: '/cards/jordan-fleer.jpg',
    predictions: makePredictions(7, 72),
    overallConfidence: 72,
    conditionNotes: ['Visible corner wear all four corners', 'Centering off 60/40', 'Surface has light scratching', 'Edges show age'],
    valueDelta: { raw: 15000, graded: 32000, uplift: 17000, upliftPercent: 113 },
    submissionRecommendation: {
      recommended: true,
      bestCompany: 'PSA',
      bestTier: 'super_express',
      estimatedCost: 200,
      estimatedTurnaround: '5 business days',
      expectedROI: 8400,
      reasoning: 'Even lower grades carry massive premiums for this iconic card. Super express justified by card value.',
    },
    timestamp: '2026-03-01T09:30:00Z',
  },
  {
    id: 'gp-011',
    cardName: '2023 Bowman Chrome 1st Auto',
    player: 'Jackson Holliday',
    year: 2023,
    set: 'Bowman Chrome',
    sport: 'Baseball',
    imageUrl: '/cards/holliday-bowman.jpg',
    predictions: makePredictions(9.5, 91),
    overallConfidence: 91,
    conditionNotes: ['Pack-fresh', 'Auto is clean', 'Great centering', 'No visible defects'],
    valueDelta: { raw: 350, graded: 1200, uplift: 850, upliftPercent: 243 },
    submissionRecommendation: {
      recommended: true,
      bestCompany: 'BGS',
      bestTier: 'regular',
      estimatedCost: 50,
      estimatedTurnaround: '50 business days',
      expectedROI: 1600,
      reasoning: 'BGS 9.5 with subgrades carries premium for Bowman Chrome autos.',
    },
    timestamp: '2026-02-28T14:00:00Z',
  },
  {
    id: 'gp-012',
    cardName: '2022 Panini Flawless Patch Auto',
    player: 'Paolo Banchero',
    year: 2022,
    set: 'Panini Flawless',
    sport: 'Basketball',
    imageUrl: '/cards/paolo-flawless.jpg',
    predictions: makePredictions(8.5, 76),
    overallConfidence: 76,
    conditionNotes: ['Patch slightly off-center', 'Card has thick stock', 'Minor edge issue on left', 'Surface clean'],
    valueDelta: { raw: 600, graded: 1100, uplift: 500, upliftPercent: 83 },
    submissionRecommendation: {
      recommended: false,
      bestCompany: 'BGS',
      bestTier: 'regular',
      estimatedCost: 50,
      estimatedTurnaround: '50 business days',
      expectedROI: 900,
      reasoning: 'Lower confidence and moderate uplift suggest holding for now. Thick stock cards are harder to grade high.',
    },
    timestamp: '2026-02-27T11:30:00Z',
  },
  {
    id: 'gp-013',
    cardName: '2023 Topps Chrome RC',
    player: 'Corbin Carroll',
    year: 2023,
    set: 'Topps Chrome',
    sport: 'Baseball',
    imageUrl: '/cards/carroll-chrome.jpg',
    predictions: makePredictions(10, 93),
    overallConfidence: 93,
    conditionNotes: ['Flawless condition', 'Dead center', 'No print lines', 'Razor sharp corners'],
    valueDelta: { raw: 30, graded: 200, uplift: 170, upliftPercent: 567 },
    submissionRecommendation: {
      recommended: true,
      bestCompany: 'PSA',
      bestTier: 'value',
      estimatedCost: 25,
      estimatedTurnaround: '65 business days',
      expectedROI: 580,
      reasoning: 'Excellent gem mint candidate. Value tier for lower dollar cards maximizes ROI.',
    },
    timestamp: '2026-02-26T16:00:00Z',
  },
  {
    id: 'gp-014',
    cardName: '2020 Panini National Treasures RPA',
    player: 'Justin Jefferson',
    year: 2020,
    set: 'National Treasures',
    sport: 'Football',
    imageUrl: '/cards/jjeff-nt.jpg',
    predictions: makePredictions(8, 74),
    overallConfidence: 74,
    conditionNotes: ['Patch window has slight lift', 'Corners acceptable', 'Surface has minor mark', 'Centering OK'],
    valueDelta: { raw: 2500, graded: 4800, uplift: 2300, upliftPercent: 92 },
    submissionRecommendation: {
      recommended: true,
      bestCompany: 'BGS',
      bestTier: 'express',
      estimatedCost: 100,
      estimatedTurnaround: '10 business days',
      expectedROI: 2200,
      reasoning: 'High card value justifies express. BGS subgrades are valued on patch cards.',
    },
    timestamp: '2026-02-25T12:45:00Z',
  },
  {
    id: 'gp-015',
    cardName: '2023 Panini Prizm RC',
    player: 'Connor Bedard',
    year: 2023,
    set: 'Panini Prizm',
    sport: 'Hockey',
    imageUrl: '/cards/bedard-prizm.jpg',
    predictions: makePredictions(9.5, 88),
    overallConfidence: 88,
    conditionNotes: ['Very clean card', 'Centering slightly high', 'Corners sharp', 'Surface pristine'],
    valueDelta: { raw: 200, graded: 750, uplift: 550, upliftPercent: 275 },
    submissionRecommendation: {
      recommended: true,
      bestCompany: 'PSA',
      bestTier: 'regular',
      estimatedCost: 50,
      estimatedTurnaround: '45 business days',
      expectedROI: 1000,
      reasoning: 'Strong gem candidate for hockey star. PSA is most liquid market for hockey cards.',
    },
    timestamp: '2026-02-24T08:15:00Z',
  },
  {
    id: 'gp-016',
    cardName: '2021 Topps Chrome RC',
    player: 'Bobby Witt Jr',
    year: 2021,
    set: 'Topps Chrome',
    sport: 'Baseball',
    imageUrl: '/cards/witt-chrome.jpg',
    predictions: makePredictions(9, 85),
    overallConfidence: 85,
    conditionNotes: ['Good condition overall', 'Centering within spec', 'Minor edge touch point', 'Surface clean'],
    valueDelta: { raw: 40, graded: 175, uplift: 135, upliftPercent: 338 },
    submissionRecommendation: {
      recommended: true,
      bestCompany: 'PSA',
      bestTier: 'value',
      estimatedCost: 25,
      estimatedTurnaround: '65 business days',
      expectedROI: 440,
      reasoning: 'Value tier is cost-effective for this card. Good 9-10 candidate.',
    },
    timestamp: '2026-02-23T10:30:00Z',
  },
];

// ---- Grading Cost Comparisons (4 companies) ----

const mockGradingCosts: GradingCostComparison[] = [
  {
    company: 'PSA',
    tiers: [
      { tier: 'value', cost: 25, turnaround: '65 business days', available: true },
      { tier: 'regular', cost: 50, turnaround: '45 business days', available: true },
      { tier: 'express', cost: 75, turnaround: '15 business days', available: true },
      { tier: 'super_express', cost: 200, turnaround: '5 business days', available: true },
      { tier: 'walk_through', cost: 600, turnaround: '1 business day', available: true },
    ],
    bulkDiscount: [
      { minCards: 10, discount: 5 },
      { minCards: 25, discount: 10 },
      { minCards: 50, discount: 15 },
      { minCards: 100, discount: 20 },
    ],
    membershipCost: 99,
    membershipBenefits: ['Free value submissions (5/year)', 'Priority handling', 'Show pre-registration', 'Exclusive promotions'],
  },
  {
    company: 'BGS',
    tiers: [
      { tier: 'value', cost: 22, turnaround: '70 business days', available: true },
      { tier: 'regular', cost: 50, turnaround: '50 business days', available: true },
      { tier: 'express', cost: 100, turnaround: '10 business days', available: true },
      { tier: 'super_express', cost: 250, turnaround: '2 business days', available: true },
      { tier: 'walk_through', cost: 500, turnaround: 'Same day', available: true },
    ],
    bulkDiscount: [
      { minCards: 10, discount: 5 },
      { minCards: 25, discount: 8 },
      { minCards: 50, discount: 12 },
      { minCards: 100, discount: 18 },
    ],
    membershipCost: 149,
    membershipBenefits: ['Subgrades included free', 'Priority queue access', 'BGS Black Label eligible', 'Quarterly promotions'],
  },
  {
    company: 'SGC',
    tiers: [
      { tier: 'value', cost: 15, turnaround: '50 business days', available: true },
      { tier: 'regular', cost: 30, turnaround: '30 business days', available: true },
      { tier: 'express', cost: 60, turnaround: '10 business days', available: true },
      { tier: 'super_express', cost: 150, turnaround: '3 business days', available: true },
      { tier: 'walk_through', cost: 300, turnaround: '1 business day', available: false },
    ],
    bulkDiscount: [
      { minCards: 10, discount: 10 },
      { minCards: 25, discount: 15 },
      { minCards: 50, discount: 20 },
      { minCards: 100, discount: 25 },
    ],
    membershipCost: 0,
    membershipBenefits: ['No membership required', 'Best bulk pricing', 'Fast turnaround standard'],
  },
  {
    company: 'CGC',
    tiers: [
      { tier: 'value', cost: 20, turnaround: '55 business days', available: true },
      { tier: 'regular', cost: 40, turnaround: '40 business days', available: true },
      { tier: 'express', cost: 80, turnaround: '12 business days', available: true },
      { tier: 'super_express', cost: 180, turnaround: '4 business days', available: true },
      { tier: 'walk_through', cost: 400, turnaround: '1 business day', available: false },
    ],
    bulkDiscount: [
      { minCards: 10, discount: 5 },
      { minCards: 25, discount: 10 },
      { minCards: 50, discount: 15 },
    ],
    membershipCost: 59,
    membershipBenefits: ['Discounted submissions', 'Priority handling', 'Cross-over program access'],
  },
];

// ---- Population Data (11 cards) ----

const mockPopulationData: GradePopulationData[] = [
  {
    cardName: '2023 Panini Prizm Silver RC',
    player: 'Victor Wembanyama',
    populations: [
      {
        company: 'PSA',
        grades: [
          { grade: '10', count: 4520, percentOfTotal: 38.2 },
          { grade: '9', count: 4180, percentOfTotal: 35.3 },
          { grade: '8', count: 1890, percentOfTotal: 16.0 },
          { grade: '7', count: 750, percentOfTotal: 6.3 },
          { grade: '6', count: 310, percentOfTotal: 2.6 },
          { grade: '5', count: 180, percentOfTotal: 1.5 },
        ],
        totalGraded: 11830,
        gem_rate: 38.2,
      },
      {
        company: 'BGS',
        grades: [
          { grade: '10', count: 120, percentOfTotal: 5.1 },
          { grade: '9.5', count: 850, percentOfTotal: 36.2 },
          { grade: '9', count: 890, percentOfTotal: 37.9 },
          { grade: '8.5', count: 320, percentOfTotal: 13.6 },
          { grade: '8', count: 170, percentOfTotal: 7.2 },
        ],
        totalGraded: 2350,
        gem_rate: 41.3,
      },
    ],
  },
  {
    cardName: '2018 Panini Prizm Silver RC',
    player: 'Luka Doncic',
    populations: [
      {
        company: 'PSA',
        grades: [
          { grade: '10', count: 12450, percentOfTotal: 31.5 },
          { grade: '9', count: 15800, percentOfTotal: 40.0 },
          { grade: '8', count: 7200, percentOfTotal: 18.2 },
          { grade: '7', count: 2600, percentOfTotal: 6.6 },
          { grade: '6', count: 1450, percentOfTotal: 3.7 },
        ],
        totalGraded: 39500,
        gem_rate: 31.5,
      },
    ],
  },
  {
    cardName: '2011 Topps Update RC',
    player: 'Mike Trout',
    populations: [
      {
        company: 'PSA',
        grades: [
          { grade: '10', count: 3890, percentOfTotal: 22.1 },
          { grade: '9', count: 6750, percentOfTotal: 38.4 },
          { grade: '8', count: 4200, percentOfTotal: 23.9 },
          { grade: '7', count: 1520, percentOfTotal: 8.6 },
          { grade: '6', count: 750, percentOfTotal: 4.3 },
          { grade: '5', count: 480, percentOfTotal: 2.7 },
        ],
        totalGraded: 17590,
        gem_rate: 22.1,
      },
    ],
  },
  {
    cardName: '1986 Fleer RC',
    player: 'Michael Jordan',
    populations: [
      {
        company: 'PSA',
        grades: [
          { grade: '10', count: 320, percentOfTotal: 1.2 },
          { grade: '9', count: 3150, percentOfTotal: 11.6 },
          { grade: '8', count: 7800, percentOfTotal: 28.7 },
          { grade: '7', count: 6500, percentOfTotal: 23.9 },
          { grade: '6', count: 4200, percentOfTotal: 15.5 },
          { grade: '5', count: 3100, percentOfTotal: 11.4 },
          { grade: '4', count: 2100, percentOfTotal: 7.7 },
        ],
        totalGraded: 27170,
        gem_rate: 1.2,
      },
    ],
  },
  {
    cardName: '2018 Topps Chrome RC Auto',
    player: 'Shohei Ohtani',
    populations: [
      {
        company: 'PSA',
        grades: [
          { grade: '10', count: 1850, percentOfTotal: 28.3 },
          { grade: '9', count: 2640, percentOfTotal: 40.4 },
          { grade: '8', count: 1320, percentOfTotal: 20.2 },
          { grade: '7', count: 450, percentOfTotal: 6.9 },
          { grade: '6', count: 275, percentOfTotal: 4.2 },
        ],
        totalGraded: 6535,
        gem_rate: 28.3,
      },
      {
        company: 'BGS',
        grades: [
          { grade: '10', count: 65, percentOfTotal: 4.2 },
          { grade: '9.5', count: 480, percentOfTotal: 31.0 },
          { grade: '9', count: 620, percentOfTotal: 40.0 },
          { grade: '8.5', count: 250, percentOfTotal: 16.1 },
          { grade: '8', count: 135, percentOfTotal: 8.7 },
        ],
        totalGraded: 1550,
        gem_rate: 35.2,
      },
    ],
  },
  {
    cardName: '2020 Panini Mosaic RC',
    player: 'Justin Herbert',
    populations: [
      {
        company: 'PSA',
        grades: [
          { grade: '10', count: 8900, percentOfTotal: 42.1 },
          { grade: '9', count: 7500, percentOfTotal: 35.5 },
          { grade: '8', count: 3200, percentOfTotal: 15.1 },
          { grade: '7', count: 1050, percentOfTotal: 5.0 },
          { grade: '6', count: 500, percentOfTotal: 2.4 },
        ],
        totalGraded: 21150,
        gem_rate: 42.1,
      },
    ],
  },
  {
    cardName: '2022 Topps Series 1 RC',
    player: 'Julio Rodriguez',
    populations: [
      {
        company: 'PSA',
        grades: [
          { grade: '10', count: 15200, percentOfTotal: 45.8 },
          { grade: '9', count: 12300, percentOfTotal: 37.0 },
          { grade: '8', count: 3800, percentOfTotal: 11.4 },
          { grade: '7', count: 1200, percentOfTotal: 3.6 },
          { grade: '6', count: 700, percentOfTotal: 2.1 },
        ],
        totalGraded: 33200,
        gem_rate: 45.8,
      },
    ],
  },
  {
    cardName: '2023 Panini Prizm Silver RC',
    player: 'CJ Stroud',
    populations: [
      {
        company: 'PSA',
        grades: [
          { grade: '10', count: 3200, percentOfTotal: 40.5 },
          { grade: '9', count: 2850, percentOfTotal: 36.1 },
          { grade: '8', count: 1200, percentOfTotal: 15.2 },
          { grade: '7', count: 400, percentOfTotal: 5.1 },
          { grade: '6', count: 250, percentOfTotal: 3.2 },
        ],
        totalGraded: 7900,
        gem_rate: 40.5,
      },
    ],
  },
  {
    cardName: '2023 Bowman Chrome 1st Auto',
    player: 'Jackson Holliday',
    populations: [
      {
        company: 'BGS',
        grades: [
          { grade: '10', count: 45, percentOfTotal: 3.8 },
          { grade: '9.5', count: 410, percentOfTotal: 34.5 },
          { grade: '9', count: 480, percentOfTotal: 40.3 },
          { grade: '8.5', count: 180, percentOfTotal: 15.1 },
          { grade: '8', count: 75, percentOfTotal: 6.3 },
        ],
        totalGraded: 1190,
        gem_rate: 38.3,
      },
    ],
  },
  {
    cardName: '2023 Panini Prizm RC',
    player: 'Connor Bedard',
    populations: [
      {
        company: 'PSA',
        grades: [
          { grade: '10', count: 2100, percentOfTotal: 39.6 },
          { grade: '9', count: 1950, percentOfTotal: 36.8 },
          { grade: '8', count: 800, percentOfTotal: 15.1 },
          { grade: '7', count: 300, percentOfTotal: 5.7 },
          { grade: '6', count: 150, percentOfTotal: 2.8 },
        ],
        totalGraded: 5300,
        gem_rate: 39.6,
      },
    ],
  },
  {
    cardName: '2019 Panini Prizm Silver RC',
    player: 'Ja Morant',
    populations: [
      {
        company: 'PSA',
        grades: [
          { grade: '10', count: 9800, percentOfTotal: 35.7 },
          { grade: '9', count: 10500, percentOfTotal: 38.2 },
          { grade: '8', count: 4500, percentOfTotal: 16.4 },
          { grade: '7', count: 1700, percentOfTotal: 6.2 },
          { grade: '6', count: 950, percentOfTotal: 3.5 },
        ],
        totalGraded: 27450,
        gem_rate: 35.7,
      },
    ],
  },
];

// ---- Submission Tracker (12 entries) ----

const mockSubmissions: SubmissionTracker[] = [
  { id: 'sub-001', cardName: '2023 Prizm Silver RC', player: 'Victor Wembanyama', company: 'PSA', tier: 'express', submittedDate: '2026-02-15', estimatedReturn: '2026-03-08', status: 'complete', predictedGrade: 9.5, actualGrade: 10, cost: 75 },
  { id: 'sub-002', cardName: '2018 Prizm Silver RC', player: 'Luka Doncic', company: 'PSA', tier: 'regular', submittedDate: '2026-01-20', estimatedReturn: '2026-03-15', status: 'shipped', predictedGrade: 9, actualGrade: 9, cost: 50 },
  { id: 'sub-003', cardName: '2020 Mosaic RC', player: 'Justin Herbert', company: 'SGC', tier: 'regular', submittedDate: '2026-02-01', estimatedReturn: '2026-03-10', status: 'complete', predictedGrade: 9.5, actualGrade: 9.5, cost: 30 },
  { id: 'sub-004', cardName: '2011 Topps Update RC', player: 'Mike Trout', company: 'PSA', tier: 'express', submittedDate: '2026-02-25', estimatedReturn: '2026-03-18', status: 'grading', predictedGrade: 8, actualGrade: null, cost: 75 },
  { id: 'sub-005', cardName: '2022 Topps Series 1 RC', player: 'Julio Rodriguez', company: 'PSA', tier: 'value', submittedDate: '2026-01-10', estimatedReturn: '2026-03-25', status: 'shipped', predictedGrade: 10, actualGrade: 10, cost: 25 },
  { id: 'sub-006', cardName: '2018 Chrome RC Auto', player: 'Shohei Ohtani', company: 'BGS', tier: 'express', submittedDate: '2026-03-01', estimatedReturn: '2026-03-15', status: 'grading', predictedGrade: 9, actualGrade: null, cost: 100 },
  { id: 'sub-007', cardName: '2023 Prizm Silver RC', player: 'CJ Stroud', company: 'PSA', tier: 'regular', submittedDate: '2026-02-10', estimatedReturn: '2026-04-01', status: 'received', predictedGrade: 9.5, actualGrade: null, cost: 50 },
  { id: 'sub-008', cardName: '2020 Prizm RC', player: 'Joe Burrow', company: 'SGC', tier: 'regular', submittedDate: '2026-02-20', estimatedReturn: '2026-03-25', status: 'grading', predictedGrade: 8.5, actualGrade: null, cost: 30 },
  { id: 'sub-009', cardName: '2023 Bowman Chrome 1st Auto', player: 'Jackson Holliday', company: 'BGS', tier: 'regular', submittedDate: '2026-01-15', estimatedReturn: '2026-03-12', status: 'complete', predictedGrade: 9.5, actualGrade: 9.5, cost: 50 },
  { id: 'sub-010', cardName: '2023 Prizm RC', player: 'Connor Bedard', company: 'PSA', tier: 'regular', submittedDate: '2026-03-05', estimatedReturn: '2026-04-20', status: 'submitted', predictedGrade: 9.5, actualGrade: null, cost: 50 },
  { id: 'sub-011', cardName: '1986 Fleer RC', player: 'Michael Jordan', company: 'PSA', tier: 'super_express', submittedDate: '2026-03-08', estimatedReturn: '2026-03-15', status: 'received', predictedGrade: 7, actualGrade: null, cost: 200 },
  { id: 'sub-012', cardName: '2019 Prizm Silver RC', player: 'Ja Morant', company: 'PSA', tier: 'regular', submittedDate: '2026-01-25', estimatedReturn: '2026-03-15', status: 'complete', predictedGrade: 9, actualGrade: 8, cost: 50 },
];

// ---- Prediction Stats ----

const mockStats: PredictionStats = {
  totalPredictions: 847,
  avgConfidence: 85.4,
  accuracyRate: 78.2,
  withinOneGrade: 94.6,
  exactMatch: 42.3,
  avgROIOnSubmissions: 342,
  totalSubmissions: 156,
  totalSavings: 28450,
  bestPrediction: { cardName: '2023 Prizm Silver RC Wembanyama', predicted: 10, actual: 10 },
};

// ---- Exported Functions ----

export function getGradePredictions(): GradePrediction[] {
  return loadFromStorage<GradePrediction[]>('predictions', mockGradePredictions);
}

export function getGradingCosts(): GradingCostComparison[] {
  return loadFromStorage<GradingCostComparison[]>('costs', mockGradingCosts);
}

export function getPopulationData(): GradePopulationData[] {
  return loadFromStorage<GradePopulationData[]>('populations', mockPopulationData);
}

export function getGradingROI(cardValue: number): GradingROI[] {
  const gradingCost = 50;
  const grades = ['6', '7', '8', '9', '9.5', '10'];
  const multipliers: Record<string, number> = {
    '6': 1.1,
    '7': 1.4,
    '8': 1.9,
    '9': 3.0,
    '9.5': 4.5,
    '10': 8.0,
  };

  const results: GradingROI[] = grades.map(grade => {
    const gradedValue = Math.round(cardValue * multipliers[grade]);
    const netROI = gradedValue - cardValue - gradingCost;
    const roiPercent = cardValue + gradingCost > 0 ? Math.round((netROI / (cardValue + gradingCost)) * 100) : 0;

    let recommendation: 'submit' | 'skip' | 'borderline' = 'skip';
    if (roiPercent > 50) recommendation = 'submit';
    else if (roiPercent > 0) recommendation = 'borderline';

    return {
      grade,
      rawValue: cardValue,
      gradedValue,
      gradingCost,
      netROI,
      roiPercent,
      breakEvenGrade: '', // will be filled below
      recommendation,
    };
  });

  // Determine actual break-even grade
  const breakEvenEntry = results.find(r => r.netROI > 0);
  const breakEvenGrade = breakEvenEntry ? breakEvenEntry.grade : 'N/A';
  return results.map(r => ({ ...r, breakEvenGrade }));
}

export function getSubmissionTracker(): SubmissionTracker[] {
  return loadFromStorage<SubmissionTracker[]>('submissions', mockSubmissions);
}

export function getPredictionStats(): PredictionStats {
  return loadFromStorage<PredictionStats>('stats', mockStats);
}

export function predictGrade(imageUrl?: string): GradePrediction {
  const sampleCards = [
    { name: '2024 Topps Chrome RC', player: 'Paul Skenes', year: 2024, set: 'Topps Chrome', sport: 'Baseball' },
    { name: '2024 Panini Prizm RC', player: 'Zach Edey', year: 2024, set: 'Panini Prizm', sport: 'Basketball' },
    { name: '2024 Panini Prizm RC', player: 'Caleb Williams', year: 2024, set: 'Panini Prizm', sport: 'Football' },
    { name: '2024 Upper Deck RC', player: 'Macklin Celebrini', year: 2024, set: 'Upper Deck', sport: 'Hockey' },
  ];
  const card = sampleCards[Math.floor(Math.random() * sampleCards.length)];
  const predictedGrade = [8, 8.5, 9, 9.5, 10][Math.floor(Math.random() * 5)];
  const confidence = Math.floor(Math.random() * 25) + 70;
  const rawValue = Math.floor(Math.random() * 400) + 20;
  const multiplier = predictedGrade >= 9.5 ? 4.5 : predictedGrade >= 9 ? 3.0 : predictedGrade >= 8 ? 1.9 : 1.4;
  const gradedValue = Math.round(rawValue * multiplier);
  const uplift = gradedValue - rawValue;
  const gradingCost = 50;

  const newPrediction: GradePrediction = {
    id: `gp-${Date.now()}`,
    cardName: card.name,
    player: card.player,
    year: card.year,
    set: card.set,
    sport: card.sport,
    imageUrl: imageUrl || '/cards/placeholder.jpg',
    predictions: makePredictions(predictedGrade, confidence),
    overallConfidence: confidence,
    conditionNotes: [
      'AI analysis complete',
      `Predicted grade: ${predictedGrade}`,
      `Confidence: ${confidence}%`,
      'Upload a real image for more accurate results',
    ],
    valueDelta: {
      raw: rawValue,
      graded: gradedValue,
      uplift,
      upliftPercent: rawValue > 0 ? Math.round((uplift / rawValue) * 100) : 0,
    },
    submissionRecommendation: {
      recommended: uplift > gradingCost * 2,
      bestCompany: 'PSA',
      bestTier: rawValue > 500 ? 'express' : rawValue > 100 ? 'regular' : 'value',
      estimatedCost: gradingCost,
      estimatedTurnaround: '45 business days',
      expectedROI: gradingCost > 0 ? Math.round(((uplift - gradingCost) / gradingCost) * 100) : 0,
      reasoning: `AI-predicted ${card.player} ${card.name} at grade ${predictedGrade} with ${confidence}% confidence.`,
    },
    timestamp: new Date().toISOString(),
  };

  // Persist
  const existing = getGradePredictions();
  existing.unshift(newPrediction);
  saveToStorage('predictions', existing);

  return newPrediction;
}

export function getCompanyColor(company: GradingCompany): string {
  const colors: Record<GradingCompany, string> = {
    PSA: '#f87171',
    BGS: '#60a5fa',
    SGC: '#fbbf24',
    CGC: '#a78bfa',
  };
  return colors[company] || '#94a3b8';
}

export function getGradeColor(grade: number): string {
  if (grade >= 9.5) return '#10b981';
  if (grade >= 9) return '#34d399';
  if (grade >= 8) return '#fbbf24';
  if (grade >= 7) return '#f97316';
  if (grade >= 6) return '#ef4444';
  return '#dc2626';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    submitted: 'Submitted',
    received: 'Received',
    grading: 'Grading',
    shipped: 'Shipped',
    complete: 'Complete',
  };
  return labels[status] || status;
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export function getSubgradeLabel(cat: SubgradeCategory): string {
  const labels: Record<SubgradeCategory, string> = {
    centering: 'Centering',
    corners: 'Corners',
    edges: 'Edges',
    surface: 'Surface',
  };
  return labels[cat] || cat;
}

export function getRecommendationColor(rec: string): string {
  const colors: Record<string, string> = {
    submit: '#10b981',
    skip: '#ef4444',
    borderline: '#f59e0b',
  };
  return colors[rec] || '#94a3b8';
}
