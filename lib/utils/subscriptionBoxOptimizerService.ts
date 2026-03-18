// Subscription Box Forward Optimizer Service

// ---- Types ----

export interface UpcomingBox {
  id: string;
  name: string;
  manufacturer: string;
  sport: string;
  releaseDate: string;
  price: number;
  spotsAvailable: number;
  spotsTotal: number;
  keyRookies: string[];
  predictedTopPullValue: number;
  expectedROI: number; // %
  confidence: number;
  recommendation: 'strong buy' | 'buy' | 'neutral' | 'avoid';
  collectionFitScore: number; // 0-100
}

export interface PullOddsProfile {
  boxId: string;
  boxName: string;
  autoROI: number;
  rookieROI: number;
  baseROI: number;
  holoROI: number;
  avgBoxValue: number;
  medianBoxValue: number;
  bestCaseValue: number;
  worstCaseValue: number;
}

export interface CollectionGapMatch {
  boxId: string;
  boxName: string;
  gapCards: string[];
  gapFillProbability: number;
  currentGapValue: number;
  afterBoxExpectedValue: number;
}

export interface BudgetAllocation {
  totalBudget: number;
  allocations: Array<{
    boxId: string;
    boxName: string;
    spots: number;
    totalCost: number;
    expectedReturn: number;
    priority: number;
  }>;
}

export interface BoxHistoricalPerformance {
  boxName: string;
  month: string;
  buyersROI: number;
  bestPull: string;
  bestPullValue: number;
}

// ---- Data Generation ----

const UPCOMING_BOXES: UpcomingBox[] = [
  {
    id: 'box-001',
    name: '2025 Topps Chrome Baseball Jumbo',
    manufacturer: 'Topps',
    sport: 'Baseball',
    releaseDate: '2025-03-28',
    price: 189,
    spotsAvailable: 142,
    spotsTotal: 500,
    keyRookies: ['Paul Skenes', 'Jackson Holliday', 'Wyatt Langford'],
    predictedTopPullValue: 1240,
    expectedROI: 38,
    confidence: 82,
    recommendation: 'strong buy',
    collectionFitScore: 91,
  },
  {
    id: 'box-002',
    name: '2025 Panini Prizm Basketball Hobby',
    manufacturer: 'Panini',
    sport: 'Basketball',
    releaseDate: '2025-04-11',
    price: 245,
    spotsAvailable: 88,
    spotsTotal: 300,
    keyRookies: ['Zaccharie Risacher', 'Alexandre Sarr', 'Reed Sheppard'],
    predictedTopPullValue: 2100,
    expectedROI: 52,
    confidence: 76,
    recommendation: 'strong buy',
    collectionFitScore: 88,
  },
  {
    id: 'box-003',
    name: '2025 Select Football Hobby Box',
    manufacturer: 'Panini',
    sport: 'Football',
    releaseDate: '2025-04-25',
    price: 175,
    spotsAvailable: 210,
    spotsTotal: 400,
    keyRookies: ['Caleb Williams', 'Marvin Harrison Jr.', 'Drake Maye'],
    predictedTopPullValue: 1800,
    expectedROI: 41,
    confidence: 79,
    recommendation: 'strong buy',
    collectionFitScore: 84,
  },
  {
    id: 'box-004',
    name: '2025 Bowman Chrome Prospect Jumbo',
    manufacturer: 'Topps',
    sport: 'Baseball',
    releaseDate: '2025-05-09',
    price: 225,
    spotsAvailable: 320,
    spotsTotal: 600,
    keyRookies: ['Druw Jones', 'Termarr Johnson', 'Chase DeLauter'],
    predictedTopPullValue: 980,
    expectedROI: 22,
    confidence: 64,
    recommendation: 'buy',
    collectionFitScore: 72,
  },
  {
    id: 'box-005',
    name: '2025 Upper Deck Young Guns Hockey',
    manufacturer: 'Upper Deck',
    sport: 'Hockey',
    releaseDate: '2025-03-14',
    price: 135,
    spotsAvailable: 55,
    spotsTotal: 200,
    keyRookies: ['Connor Bedard', 'Matvei Michkov', 'Leo Carlsson'],
    predictedTopPullValue: 1650,
    expectedROI: 61,
    confidence: 85,
    recommendation: 'strong buy',
    collectionFitScore: 77,
  },
  {
    id: 'box-006',
    name: '2025 Topps Series 1 Baseball Hobby',
    manufacturer: 'Topps',
    sport: 'Baseball',
    releaseDate: '2025-02-05',
    price: 95,
    spotsAvailable: 780,
    spotsTotal: 1200,
    keyRookies: ['Paul Skenes', 'Jackson Holliday'],
    predictedTopPullValue: 420,
    expectedROI: 8,
    confidence: 71,
    recommendation: 'neutral',
    collectionFitScore: 48,
  },
  {
    id: 'box-007',
    name: '2025 Panini National Treasures Football',
    manufacturer: 'Panini',
    sport: 'Football',
    releaseDate: '2025-06-20',
    price: 1200,
    spotsAvailable: 30,
    spotsTotal: 100,
    keyRookies: ['Caleb Williams Auto RPA', 'Marvin Harrison Jr. Auto RPA'],
    predictedTopPullValue: 9800,
    expectedROI: 44,
    confidence: 58,
    recommendation: 'buy',
    collectionFitScore: 62,
  },
  {
    id: 'box-008',
    name: '2025 Donruss Optic Basketball Hobby',
    manufacturer: 'Panini',
    sport: 'Basketball',
    releaseDate: '2025-05-22',
    price: 120,
    spotsAvailable: 450,
    spotsTotal: 800,
    keyRookies: ['Zaccharie Risacher', 'Reed Sheppard'],
    predictedTopPullValue: 680,
    expectedROI: -4,
    confidence: 68,
    recommendation: 'avoid',
    collectionFitScore: 31,
  },
  {
    id: 'box-009',
    name: '2025 Topps Chrome Update Baseball',
    manufacturer: 'Topps',
    sport: 'Baseball',
    releaseDate: '2025-07-18',
    price: 165,
    spotsAvailable: 190,
    spotsTotal: 450,
    keyRookies: ['Jackson Holliday Auto', 'Dylan Crews'],
    predictedTopPullValue: 1100,
    expectedROI: 29,
    confidence: 73,
    recommendation: 'buy',
    collectionFitScore: 69,
  },
  {
    id: 'box-010',
    name: '2025 Fleer Retro Basketball Nostalgia Box',
    manufacturer: 'Upper Deck',
    sport: 'Basketball',
    releaseDate: '2025-08-01',
    price: 310,
    spotsAvailable: 40,
    spotsTotal: 120,
    keyRookies: ['Michael Jordan 1986 Redux Auto'],
    predictedTopPullValue: 3400,
    expectedROI: 18,
    confidence: 51,
    recommendation: 'neutral',
    collectionFitScore: 55,
  },
];

const PULL_ODDS_PROFILES: PullOddsProfile[] = UPCOMING_BOXES.map(box => {
  const base = box.price;
  return {
    boxId: box.id,
    boxName: box.name,
    autoROI: Math.round((box.expectedROI * 1.8) * 10) / 10,
    rookieROI: Math.round((box.expectedROI * 1.2) * 10) / 10,
    baseROI: Math.round((box.expectedROI * 0.3) * 10) / 10,
    holoROI: Math.round((box.expectedROI * 0.9) * 10) / 10,
    avgBoxValue: Math.round(base * (1 + box.expectedROI / 100)),
    medianBoxValue: Math.round(base * (1 + (box.expectedROI * 0.65) / 100)),
    bestCaseValue: Math.round(box.predictedTopPullValue * 0.9),
    worstCaseValue: Math.round(base * 0.35),
  };
});

const COLLECTION_GAP_MATCHES: CollectionGapMatch[] = [
  {
    boxId: 'box-001',
    boxName: '2025 Topps Chrome Baseball Jumbo',
    gapCards: ['Paul Skenes Chrome Auto RC', 'Jackson Holliday Chrome Refractor'],
    gapFillProbability: 48,
    currentGapValue: 2800,
    afterBoxExpectedValue: 4100,
  },
  {
    boxId: 'box-002',
    boxName: '2025 Panini Prizm Basketball Hobby',
    gapCards: ['Zaccharie Risacher Prizm Auto RC', 'Reed Sheppard Silver Prizm'],
    gapFillProbability: 38,
    currentGapValue: 3200,
    afterBoxExpectedValue: 5400,
  },
  {
    boxId: 'box-005',
    boxName: '2025 Upper Deck Young Guns Hockey',
    gapCards: ['Connor Bedard Young Guns RC', 'Matvei Michkov Young Guns'],
    gapFillProbability: 62,
    currentGapValue: 1900,
    afterBoxExpectedValue: 3500,
  },
  {
    boxId: 'box-003',
    boxName: '2025 Select Football Hobby Box',
    gapCards: ['Caleb Williams Concourse Auto', 'Drake Maye Select Prizm'],
    gapFillProbability: 31,
    currentGapValue: 2100,
    afterBoxExpectedValue: 3400,
  },
];

const BUDGET_ALLOCATION_DEFAULT: BudgetAllocation = {
  totalBudget: 1000,
  allocations: [
    { boxId: 'box-001', boxName: '2025 Topps Chrome Baseball Jumbo', spots: 2, totalCost: 378, expectedReturn: 521, priority: 1 },
    { boxId: 'box-002', boxName: '2025 Panini Prizm Basketball Hobby', spots: 1, totalCost: 245, expectedReturn: 372, priority: 2 },
    { boxId: 'box-005', boxName: '2025 Upper Deck Young Guns Hockey', spots: 2, totalCost: 270, expectedReturn: 435, priority: 3 },
  ],
};

const HISTORICAL_PERFORMANCE: BoxHistoricalPerformance[] = [
  { boxName: '2024 Topps Chrome Baseball', month: 'Sep 2024', buyersROI: 44, bestPull: 'Jackson Holliday Auto /50', bestPullValue: 1850 },
  { boxName: '2024 Panini Prizm Basketball', month: 'Oct 2024', buyersROI: 58, bestPull: 'Zaccharie Risacher Auto /99', bestPullValue: 2200 },
  { boxName: '2024 Select Football', month: 'Nov 2024', buyersROI: 37, bestPull: 'Caleb Williams RPA /25', bestPullValue: 4800 },
  { boxName: '2024 Bowman Chrome Prospect', month: 'Oct 2024', buyersROI: 19, bestPull: 'Druw Jones Auto /150', bestPullValue: 720 },
  { boxName: '2024 Upper Deck Hockey', month: 'Aug 2024', buyersROI: 67, bestPull: 'Connor Bedard Young Guns', bestPullValue: 1400 },
  { boxName: '2024 Topps Series 2 Baseball', month: 'Jul 2024', buyersROI: 6, bestPull: 'Paul Skenes RC /50', bestPullValue: 380 },
];

// ---- Exports ----

export function getUpcomingBoxes(): UpcomingBox[] {
  return [...UPCOMING_BOXES].sort((a, b) => b.expectedROI - a.expectedROI);
}

export function getPullOddsProfile(boxId: string): PullOddsProfile | undefined {
  return PULL_ODDS_PROFILES.find(p => p.boxId === boxId);
}

export function getAllPullOddsProfiles(): PullOddsProfile[] {
  return PULL_ODDS_PROFILES;
}

export function getCollectionGapMatches(): CollectionGapMatch[] {
  return COLLECTION_GAP_MATCHES;
}

export function getBudgetAllocation(): BudgetAllocation {
  return BUDGET_ALLOCATION_DEFAULT;
}

export function getHistoricalPerformance(): BoxHistoricalPerformance[] {
  return HISTORICAL_PERFORMANCE;
}
