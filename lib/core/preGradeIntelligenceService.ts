// @ts-nocheck
/**
 * Phase 106: AI Pre-Grade Intelligence
 * Photograph a raw card and receive predicted PSA/BGS grade with ROI calculator.
 * NO competitor offers this consumer-facing pre-grade intelligence service.
 */

// ---- Types ----

export interface GradeDistribution {
  PSA10: number;
  PSA9: number;
  PSA8: number;
  PSA7orLower: number;
}

export interface GradePrediction {
  id: string;
  cardImageData: string;
  cardName: string;
  player: string;
  year: number;
  set: string;
  predictedGrade: string;
  confidence: number;
  distribution: GradeDistribution;
  subgrades: SubgradeBreakdown;
  conditionFactors: ConditionFactor[];
  timestamp: string;
  actualGrade?: string;
  verified: boolean;
}

export interface SubgradeBreakdown {
  centering: SubgradeScore;
  corners: SubgradeScore;
  edges: SubgradeScore;
  surface: SubgradeScore;
  overall: number;
}

export interface SubgradeScore {
  score: number; // 0-10 scale (BGS style: 10, 9.5, 9, 8.5, etc.)
  label: string; // "Pristine", "Gem Mint", "Mint", etc.
  details: string;
  confidence: number; // 0-1
}

export interface GradingROI {
  cardName: string;
  year: number;
  set: string;
  rawValue: number;
  gradeValues: GradeValueEntry[];
  expectedValue: number;
  gradingCosts: GradingServiceCost[];
  bestExpectedNetValue: number;
  bestService: string;
  recommendation: GradingRecommendation;
}

export interface GradeValueEntry {
  grade: string;
  probability: number;
  marketValue: number;
  weightedValue: number;
}

export interface GradingService {
  id: string;
  name: string;
  company: 'PSA' | 'BGS' | 'SGC' | 'CGC';
  tiers: GradingTier[];
  avgTurnaroundDays: number;
  maxDeclaredValue: number;
  reputationScore: number; // 0-100
  marketPremium: number; // multiplier vs raw
  specialties: string[];
}

export interface GradingTier {
  name: string;
  cost: number;
  turnaroundDays: number;
  maxDeclaredValue: number;
  description: string;
}

export interface GradingServiceCost {
  service: GradingService;
  tier: GradingTier;
  totalCost: number; // tier cost + shipping
  shippingCost: number;
  insuranceCost: number;
  expectedNetValue: number;
  expectedROI: number;
  turnaroundDays: number;
}

export interface PreGradeReport {
  id: string;
  prediction: GradePrediction;
  roi: GradingROI;
  recommendation: GradingRecommendation;
  bestService: GradingServiceCost;
  generatedAt: string;
}

export interface ConditionFactor {
  area: 'centering' | 'corners' | 'edges' | 'surface' | 'overall';
  severity: 'none' | 'minor' | 'moderate' | 'major';
  description: string;
  impact: string; // e.g., "-0.5 to -1.0 on overall grade"
  location?: string; // e.g., "top-left corner"
  coordinates?: { x: number; y: number; width: number; height: number };
}

export interface GradingRecommendation {
  verdict: 'GRADE' | 'DONT_GRADE' | 'CONSIDER';
  confidence: number;
  reasoning: string;
  expectedProfit: number;
  riskLevel: 'low' | 'medium' | 'high';
  alternativeActions: string[];
}

export interface PredictionAccuracy {
  totalPredictions: number;
  verifiedPredictions: number;
  exactMatches: number;
  withinHalfGrade: number;
  withinOneGrade: number;
  exactAccuracy: number;
  halfGradeAccuracy: number;
  oneGradeAccuracy: number;
  averageDeviation: number;
  byGrade: { grade: string; predictions: number; accuracy: number }[];
}

// ---- Grading Services Data ----

const GRADING_SERVICES: GradingService[] = [
  {
    id: 'psa',
    name: 'Professional Sports Authenticator',
    company: 'PSA',
    tiers: [
      { name: 'Value', cost: 20, turnaroundDays: 120, maxDeclaredValue: 499, description: 'Economy tier for cards valued under $500' },
      { name: 'Regular', cost: 50, turnaroundDays: 65, maxDeclaredValue: 1499, description: 'Standard service for most submissions' },
      { name: 'Express', cost: 100, turnaroundDays: 20, maxDeclaredValue: 4999, description: 'Fast turnaround for mid-value cards' },
      { name: 'Super Express', cost: 150, turnaroundDays: 10, maxDeclaredValue: 9999, description: 'Priority grading with quick return' },
      { name: 'Walk-Through', cost: 300, turnaroundDays: 3, maxDeclaredValue: 24999, description: 'Same-week service for high-value cards' },
    ],
    avgTurnaroundDays: 65,
    maxDeclaredValue: 24999,
    reputationScore: 95,
    marketPremium: 1.35,
    specialties: ['Sports cards', 'Highest resale premium', 'Largest market share'],
  },
  {
    id: 'bgs',
    name: 'Beckett Grading Services',
    company: 'BGS',
    tiers: [
      { name: 'Economy', cost: 22, turnaroundDays: 120, maxDeclaredValue: 499, description: 'Budget-friendly option' },
      { name: 'Standard', cost: 40, turnaroundDays: 45, maxDeclaredValue: 2499, description: 'Standard grading with subgrades' },
      { name: 'Express', cost: 80, turnaroundDays: 15, maxDeclaredValue: 4999, description: 'Expedited with full subgrades' },
      { name: 'Premium', cost: 150, turnaroundDays: 5, maxDeclaredValue: 9999, description: 'Priority service' },
    ],
    avgTurnaroundDays: 45,
    maxDeclaredValue: 9999,
    reputationScore: 90,
    marketPremium: 1.25,
    specialties: ['Subgrade breakdown', 'Black Label 10s', 'Modern cards'],
  },
  {
    id: 'sgc',
    name: 'Sportscard Guaranty',
    company: 'SGC',
    tiers: [
      { name: 'Economy', cost: 20, turnaroundDays: 90, maxDeclaredValue: 499, description: 'Affordable grading option' },
      { name: 'Standard', cost: 35, turnaroundDays: 30, maxDeclaredValue: 2499, description: 'Reliable mid-range service' },
      { name: 'Express', cost: 75, turnaroundDays: 10, maxDeclaredValue: 4999, description: 'Quick turnaround' },
      { name: 'Premium', cost: 125, turnaroundDays: 5, maxDeclaredValue: 9999, description: 'Fastest SGC service' },
    ],
    avgTurnaroundDays: 30,
    maxDeclaredValue: 9999,
    reputationScore: 82,
    marketPremium: 1.10,
    specialties: ['Vintage cards', 'Fast turnaround', 'Attractive holders'],
  },
  {
    id: 'cgc',
    name: 'Certified Guaranty Company',
    company: 'CGC',
    tiers: [
      { name: 'Economy', cost: 20, turnaroundDays: 100, maxDeclaredValue: 499, description: 'Entry-level service' },
      { name: 'Standard', cost: 38, turnaroundDays: 40, maxDeclaredValue: 2499, description: 'Standard CGC grading' },
      { name: 'Express', cost: 85, turnaroundDays: 12, maxDeclaredValue: 4999, description: 'Expedited grading' },
      { name: 'Priority', cost: 140, turnaroundDays: 5, maxDeclaredValue: 9999, description: 'Top priority service' },
    ],
    avgTurnaroundDays: 40,
    maxDeclaredValue: 9999,
    reputationScore: 78,
    marketPremium: 1.05,
    specialties: ['TCG & Pokemon', 'Growing market', 'Subgrades available'],
  },
];

// ---- Mock Data ----

const MOCK_PREDICTIONS: GradePrediction[] = [
  {
    id: 'pred-001',
    cardImageData: '',
    cardName: '2023 Panini Prizm Silver Victor Wembanyama RC',
    player: 'Victor Wembanyama',
    year: 2023,
    set: 'Panini Prizm Silver',
    predictedGrade: 'PSA 9',
    confidence: 0.72,
    distribution: { PSA10: 0.18, PSA9: 0.72, PSA8: 0.08, PSA7orLower: 0.02 },
    subgrades: {
      centering: { score: 8.5, label: 'Near Mint-Mint', details: 'Centering 55/45 left-right, 50/50 top-bottom', confidence: 0.85 },
      corners: { score: 9.5, label: 'Gem Mint', details: 'All four corners sharp with no visible wear', confidence: 0.90 },
      edges: { score: 9.0, label: 'Mint', details: 'Clean edges with minimal chipping', confidence: 0.88 },
      surface: { score: 9.0, label: 'Mint', details: 'No scratches or print defects detected', confidence: 0.82 },
      overall: 9.0,
    },
    conditionFactors: [
      { area: 'centering', severity: 'minor', description: 'Centering 55/45 left-right', impact: 'May limit to PSA 9', location: 'overall alignment' },
      { area: 'corners', severity: 'none', description: 'All corners appear sharp', impact: 'No negative impact', location: 'all corners' },
    ],
    timestamp: '2025-12-15T14:30:00Z',
    actualGrade: 'PSA 9',
    verified: true,
  },
  {
    id: 'pred-002',
    cardImageData: '',
    cardName: '2024 Topps Chrome Elly De La Cruz RC Auto',
    player: 'Elly De La Cruz',
    year: 2024,
    set: 'Topps Chrome',
    predictedGrade: 'PSA 10',
    confidence: 0.65,
    distribution: { PSA10: 0.65, PSA9: 0.28, PSA8: 0.05, PSA7orLower: 0.02 },
    subgrades: {
      centering: { score: 9.5, label: 'Gem Mint', details: 'Centering 51/49 left-right, nearly perfect', confidence: 0.92 },
      corners: { score: 10.0, label: 'Pristine', details: 'Razor-sharp corners on all four points', confidence: 0.88 },
      edges: { score: 9.5, label: 'Gem Mint', details: 'No visible edge wear or whitening', confidence: 0.91 },
      surface: { score: 9.0, label: 'Mint', details: 'Very faint surface pattern visible under magnification', confidence: 0.78 },
      overall: 9.5,
    },
    conditionFactors: [
      { area: 'surface', severity: 'minor', description: 'Faint print line detected on surface', impact: '-0.5 possible on surface subgrade', location: 'center of card' },
    ],
    timestamp: '2025-12-18T09:15:00Z',
    actualGrade: 'PSA 10',
    verified: true,
  },
  {
    id: 'pred-003',
    cardImageData: '',
    cardName: '2023 Bowman Chrome Prospect Junior Caminero',
    player: 'Junior Caminero',
    year: 2023,
    set: 'Bowman Chrome',
    predictedGrade: 'PSA 9',
    confidence: 0.68,
    distribution: { PSA10: 0.12, PSA9: 0.68, PSA8: 0.15, PSA7orLower: 0.05 },
    subgrades: {
      centering: { score: 9.0, label: 'Mint', details: 'Centering 52/48 left-right, within tolerance', confidence: 0.80 },
      corners: { score: 9.0, label: 'Mint', details: 'Minor softness on bottom-right corner', confidence: 0.85 },
      edges: { score: 8.5, label: 'Near Mint-Mint', details: 'Light edge whitening on top edge', confidence: 0.82 },
      surface: { score: 9.5, label: 'Gem Mint', details: 'Clean surface, no defects', confidence: 0.90 },
      overall: 9.0,
    },
    conditionFactors: [
      { area: 'corners', severity: 'minor', description: 'Bottom-right corner shows minor softness', impact: '-0.5 on corner subgrade', location: 'bottom-right' },
      { area: 'edges', severity: 'minor', description: 'Light edge whitening on top edge', impact: '-0.5 on edge subgrade', location: 'top edge' },
    ],
    timestamp: '2026-01-05T11:45:00Z',
    verified: false,
  },
  {
    id: 'pred-004',
    cardImageData: '',
    cardName: '2020 Panini Prizm Silver LaMelo Ball RC',
    player: 'LaMelo Ball',
    year: 2020,
    set: 'Panini Prizm Silver',
    predictedGrade: 'BGS 9.5',
    confidence: 0.58,
    distribution: { PSA10: 0.38, PSA9: 0.50, PSA8: 0.10, PSA7orLower: 0.02 },
    subgrades: {
      centering: { score: 9.5, label: 'Gem Mint', details: 'Well-centered 50/50 both ways', confidence: 0.92 },
      corners: { score: 9.5, label: 'Gem Mint', details: 'Sharp corners throughout', confidence: 0.87 },
      edges: { score: 9.0, label: 'Mint', details: 'Slight roughness on bottom edge', confidence: 0.80 },
      surface: { score: 9.5, label: 'Gem Mint', details: 'Pristine surface quality', confidence: 0.88 },
      overall: 9.5,
    },
    conditionFactors: [
      { area: 'edges', severity: 'minor', description: 'Slight roughness on bottom edge', impact: 'May prevent BGS 9.5 edge subgrade', location: 'bottom edge' },
    ],
    timestamp: '2026-01-12T16:20:00Z',
    actualGrade: 'BGS 9.5',
    verified: true,
  },
  {
    id: 'pred-005',
    cardImageData: '',
    cardName: '2018 Panini Prizm Silver Luka Doncic RC',
    player: 'Luka Doncic',
    year: 2018,
    set: 'Panini Prizm Silver',
    predictedGrade: 'PSA 8',
    confidence: 0.55,
    distribution: { PSA10: 0.05, PSA9: 0.25, PSA8: 0.55, PSA7orLower: 0.15 },
    subgrades: {
      centering: { score: 7.5, label: 'Near Mint', details: 'Off-center 60/40 left-right', confidence: 0.88 },
      corners: { score: 8.5, label: 'Near Mint-Mint', details: 'Minor wear on top-left corner', confidence: 0.82 },
      edges: { score: 8.0, label: 'Near Mint-Mint', details: 'Visible edge wear on left side', confidence: 0.79 },
      surface: { score: 9.0, label: 'Mint', details: 'Surface is clean, good gloss', confidence: 0.85 },
      overall: 8.0,
    },
    conditionFactors: [
      { area: 'centering', severity: 'moderate', description: 'Off-center 60/40 left-right', impact: 'Limits grade ceiling to PSA 8-9', location: 'overall alignment' },
      { area: 'corners', severity: 'minor', description: 'Top-left corner shows minor wear', impact: '-0.5 on corners', location: 'top-left' },
      { area: 'edges', severity: 'minor', description: 'Visible edge wear on left side', impact: '-1.0 on edges', location: 'left edge' },
    ],
    timestamp: '2026-02-01T08:10:00Z',
    verified: false,
  },
  {
    id: 'pred-006',
    cardImageData: '',
    cardName: '2024 Topps Heritage Shohei Ohtani',
    player: 'Shohei Ohtani',
    year: 2024,
    set: 'Topps Heritage',
    predictedGrade: 'PSA 10',
    confidence: 0.78,
    distribution: { PSA10: 0.78, PSA9: 0.18, PSA8: 0.03, PSA7orLower: 0.01 },
    subgrades: {
      centering: { score: 9.5, label: 'Gem Mint', details: 'Nearly perfect centering', confidence: 0.94 },
      corners: { score: 10.0, label: 'Pristine', details: 'All corners razor-sharp', confidence: 0.91 },
      edges: { score: 9.5, label: 'Gem Mint', details: 'Clean edges throughout', confidence: 0.89 },
      surface: { score: 10.0, label: 'Pristine', details: 'Flawless surface with high gloss', confidence: 0.92 },
      overall: 9.75,
    },
    conditionFactors: [
      { area: 'overall', severity: 'none', description: 'No significant issues detected', impact: 'Strong candidate for PSA 10', location: 'overall' },
    ],
    timestamp: '2026-02-20T13:55:00Z',
    verified: false,
  },
  {
    id: 'pred-007',
    cardImageData: '',
    cardName: '2022 Panini Contenders Rookie Ticket Brock Purdy Auto',
    player: 'Brock Purdy',
    year: 2022,
    set: 'Panini Contenders',
    predictedGrade: 'PSA 9',
    confidence: 0.62,
    distribution: { PSA10: 0.22, PSA9: 0.62, PSA8: 0.12, PSA7orLower: 0.04 },
    subgrades: {
      centering: { score: 9.0, label: 'Mint', details: 'Centering 53/47 left-right', confidence: 0.83 },
      corners: { score: 9.0, label: 'Mint', details: 'Corners are sharp but not perfect', confidence: 0.86 },
      edges: { score: 9.0, label: 'Mint', details: 'Edges clean with minimal concern', confidence: 0.84 },
      surface: { score: 8.5, label: 'Near Mint-Mint', details: 'Auto pen slightly indented on surface', confidence: 0.75 },
      overall: 9.0,
    },
    conditionFactors: [
      { area: 'surface', severity: 'minor', description: 'Auto pen indentation visible', impact: 'May affect surface subgrade', location: 'autograph area' },
    ],
    timestamp: '2026-03-01T10:30:00Z',
    actualGrade: 'PSA 9',
    verified: true,
  },
];

// ---- Card Market Values (Mock) ----

interface CardMarketData {
  cardName: string;
  year: number;
  set: string;
  rawValue: number;
  gradedValues: Record<string, number>;
}

const CARD_MARKET_DATA: CardMarketData[] = [
  {
    cardName: '2023 Panini Prizm Silver Victor Wembanyama RC',
    year: 2023, set: 'Panini Prizm Silver',
    rawValue: 350,
    gradedValues: { 'PSA 10': 1200, 'PSA 9': 550, 'PSA 8': 400, 'PSA 7': 320 },
  },
  {
    cardName: '2024 Topps Chrome Elly De La Cruz RC Auto',
    year: 2024, set: 'Topps Chrome',
    rawValue: 280,
    gradedValues: { 'PSA 10': 950, 'PSA 9': 420, 'PSA 8': 310, 'PSA 7': 250 },
  },
  {
    cardName: '2023 Bowman Chrome Prospect Junior Caminero',
    year: 2023, set: 'Bowman Chrome',
    rawValue: 45,
    gradedValues: { 'PSA 10': 180, 'PSA 9': 75, 'PSA 8': 50, 'PSA 7': 35 },
  },
  {
    cardName: '2020 Panini Prizm Silver LaMelo Ball RC',
    year: 2020, set: 'Panini Prizm Silver',
    rawValue: 800,
    gradedValues: { 'PSA 10': 4500, 'PSA 9': 1200, 'PSA 8': 850, 'PSA 7': 650 },
  },
  {
    cardName: '2018 Panini Prizm Silver Luka Doncic RC',
    year: 2018, set: 'Panini Prizm Silver',
    rawValue: 1500,
    gradedValues: { 'PSA 10': 8500, 'PSA 9': 2800, 'PSA 8': 1800, 'PSA 7': 1200 },
  },
  {
    cardName: '2024 Topps Heritage Shohei Ohtani',
    year: 2024, set: 'Topps Heritage',
    rawValue: 25,
    gradedValues: { 'PSA 10': 120, 'PSA 9': 45, 'PSA 8': 30, 'PSA 7': 20 },
  },
  {
    cardName: '2022 Panini Contenders Rookie Ticket Brock Purdy Auto',
    year: 2022, set: 'Panini Contenders',
    rawValue: 450,
    gradedValues: { 'PSA 10': 1800, 'PSA 9': 700, 'PSA 8': 500, 'PSA 7': 380 },
  },
];

// ---- Service Functions ----

function simulateDelay(): void {
  // In a real app this would be an async call to an AI model
}

export function predictGrade(cardImageData: string): GradePrediction {
  simulateDelay();
  // Simulate AI-based analysis by returning a realistic prediction
  const distributions: GradeDistribution[] = [
    { PSA10: 0.18, PSA9: 0.72, PSA8: 0.08, PSA7orLower: 0.02 },
    { PSA10: 0.65, PSA9: 0.28, PSA8: 0.05, PSA7orLower: 0.02 },
    { PSA10: 0.35, PSA9: 0.50, PSA8: 0.12, PSA7orLower: 0.03 },
    { PSA10: 0.08, PSA9: 0.42, PSA8: 0.38, PSA7orLower: 0.12 },
  ];

  const dist = distributions[Math.floor(Math.random() * distributions.length)];
  const maxProb = Math.max(dist.PSA10, dist.PSA9, dist.PSA8, dist.PSA7orLower);
  const predictedGrade = dist.PSA10 === maxProb ? 'PSA 10' : dist.PSA9 === maxProb ? 'PSA 9' : dist.PSA8 === maxProb ? 'PSA 8' : 'PSA 7';

  return {
    id: `pred-${Date.now()}`,
    cardImageData,
    cardName: 'Scanned Card',
    player: 'Unknown',
    year: 2024,
    set: 'Unknown',
    predictedGrade,
    confidence: maxProb,
    distribution: dist,
    subgrades: {
      centering: { score: 8.5 + Math.random() * 1.5, label: 'Mint', details: 'Centering analysis complete', confidence: 0.85 },
      corners: { score: 8.5 + Math.random() * 1.5, label: 'Mint', details: 'Corner analysis complete', confidence: 0.88 },
      edges: { score: 8.5 + Math.random() * 1.5, label: 'Mint', details: 'Edge analysis complete', confidence: 0.82 },
      surface: { score: 8.5 + Math.random() * 1.5, label: 'Mint', details: 'Surface analysis complete', confidence: 0.80 },
      overall: 9.0,
    },
    conditionFactors: [],
    timestamp: new Date().toISOString(),
    verified: false,
  };
}

export function getSubgradeBreakdown(_cardImageData: string): SubgradeBreakdown {
  simulateDelay();
  return {
    centering: {
      score: 9.0,
      label: 'Mint',
      details: 'Centering 53/47 left-right, 51/49 top-bottom. Within PSA 10 tolerance.',
      confidence: 0.87,
    },
    corners: {
      score: 9.5,
      label: 'Gem Mint',
      details: 'All four corners sharp. No visible wear under 10x magnification.',
      confidence: 0.91,
    },
    edges: {
      score: 9.0,
      label: 'Mint',
      details: 'Clean edges with very minor factory roughness on right edge.',
      confidence: 0.84,
    },
    surface: {
      score: 9.0,
      label: 'Mint',
      details: 'No scratches detected. Minor print dot near bottom border.',
      confidence: 0.80,
    },
    overall: 9.0,
  };
}

export function analyzeConditionFactors(_cardImageData: string): ConditionFactor[] {
  simulateDelay();
  return [
    {
      area: 'centering',
      severity: 'minor',
      description: 'Centering 55/45 left-right',
      impact: 'May limit to PSA 9 if strict grader',
      location: 'overall alignment',
      coordinates: { x: 0, y: 0, width: 100, height: 100 },
    },
    {
      area: 'corners',
      severity: 'none',
      description: 'All four corners appear sharp and intact',
      impact: 'No negative impact expected',
      location: 'all four corners',
    },
    {
      area: 'edges',
      severity: 'minor',
      description: 'Very minor factory roughness on right edge',
      impact: '-0.5 possible on edge subgrade',
      location: 'right edge',
      coordinates: { x: 95, y: 20, width: 5, height: 60 },
    },
    {
      area: 'surface',
      severity: 'minor',
      description: 'Small print dot near bottom border',
      impact: 'Factory defect, usually not penalized',
      location: 'bottom-center',
      coordinates: { x: 45, y: 90, width: 5, height: 5 },
    },
  ];
}

export function calculateGradingROI(
  cardName: string,
  year: number,
  set: string,
  gradeDistribution: GradeDistribution
): GradingROI {
  // Find market data
  const marketData = CARD_MARKET_DATA.find(
    (c) => c.cardName.includes(cardName) || (c.year === year && c.set === set)
  ) ?? {
    cardName,
    year,
    set,
    rawValue: 100,
    gradedValues: { 'PSA 10': 400, 'PSA 9': 180, 'PSA 8': 120, 'PSA 7': 80 },
  };

  const gradeValues: GradeValueEntry[] = [
    { grade: 'PSA 10', probability: gradeDistribution.PSA10, marketValue: marketData.gradedValues['PSA 10'], weightedValue: gradeDistribution.PSA10 * marketData.gradedValues['PSA 10'] },
    { grade: 'PSA 9', probability: gradeDistribution.PSA9, marketValue: marketData.gradedValues['PSA 9'], weightedValue: gradeDistribution.PSA9 * marketData.gradedValues['PSA 9'] },
    { grade: 'PSA 8', probability: gradeDistribution.PSA8, marketValue: marketData.gradedValues['PSA 8'], weightedValue: gradeDistribution.PSA8 * marketData.gradedValues['PSA 8'] },
    { grade: 'PSA 7 or lower', probability: gradeDistribution.PSA7orLower, marketValue: marketData.gradedValues['PSA 7'], weightedValue: gradeDistribution.PSA7orLower * marketData.gradedValues['PSA 7'] },
  ];

  const expectedValue = gradeValues.reduce((sum, gv) => sum + gv.weightedValue, 0);

  const shippingCost = 15;
  const gradingCosts: GradingServiceCost[] = GRADING_SERVICES.flatMap((service) =>
    service.tiers
      .filter((tier) => tier.maxDeclaredValue >= marketData.rawValue)
      .slice(0, 2)
      .map((tier) => {
        const insuranceCost = marketData.rawValue > 500 ? Math.round(marketData.rawValue * 0.01) : 0;
        const totalCost = tier.cost + shippingCost + insuranceCost;
        const expectedNetValue = expectedValue - totalCost;
        const expectedROI = ((expectedNetValue - marketData.rawValue) / marketData.rawValue) * 100;
        return {
          service,
          tier,
          totalCost,
          shippingCost,
          insuranceCost,
          expectedNetValue,
          expectedROI,
          turnaroundDays: tier.turnaroundDays,
        };
      })
  );

  const bestService = gradingCosts.reduce((best, current) =>
    current.expectedROI > best.expectedROI ? current : best
  );

  const recommendation = getGradingRecommendation({
    cardName,
    year,
    set,
    rawValue: marketData.rawValue,
    gradeValues,
    expectedValue,
    gradingCosts,
    bestExpectedNetValue: bestService.expectedNetValue,
    bestService: bestService.service.company,
  });

  return {
    cardName,
    year,
    set,
    rawValue: marketData.rawValue,
    gradeValues,
    expectedValue,
    gradingCosts,
    bestExpectedNetValue: bestService.expectedNetValue,
    bestService: bestService.service.company,
    recommendation,
  };
}

export function getGradingRecommendation(roi: Omit<GradingROI, 'recommendation'>): GradingRecommendation {
  const profit = roi.bestExpectedNetValue - roi.rawValue;
  const profitMargin = (profit / roi.rawValue) * 100;

  if (profitMargin > 30) {
    return {
      verdict: 'GRADE',
      confidence: Math.min(0.95, 0.7 + profitMargin / 200),
      reasoning: `Expected ${profitMargin.toFixed(0)}% ROI. The grade distribution strongly favors grading — even a PSA 9 significantly increases value above raw. The expected value of $${roi.expectedValue.toFixed(0)} far exceeds the raw value of $${roi.rawValue} plus grading costs.`,
      expectedProfit: profit,
      riskLevel: 'low',
      alternativeActions: ['Submit via bulk to save on per-card costs', 'Consider crossover if already graded by another company'],
    };
  } else if (profitMargin > 10) {
    return {
      verdict: 'CONSIDER',
      confidence: 0.5 + profitMargin / 100,
      reasoning: `Marginal ROI of ${profitMargin.toFixed(0)}%. Grading is worthwhile if you can secure economy-tier pricing. The expected value of $${roi.expectedValue.toFixed(0)} is moderately above raw value plus costs. Consider waiting for a bulk submission discount.`,
      expectedProfit: profit,
      riskLevel: 'medium',
      alternativeActions: ['Wait for bulk submission discount', 'Sell raw if you need immediate liquidity', 'Consider SGC for lower-cost option'],
    };
  } else {
    return {
      verdict: 'DONT_GRADE',
      confidence: Math.min(0.9, 0.6 + Math.abs(profitMargin) / 100),
      reasoning: `Negative or minimal ROI of ${profitMargin.toFixed(0)}%. Grading costs would eat into or exceed any value increase. The card is better sold raw or held for a better market. Expected graded value doesn't justify the investment.`,
      expectedProfit: profit,
      riskLevel: 'high',
      alternativeActions: ['Sell raw at current market value', 'Hold for market appreciation', 'Bundle in a lot sale'],
    };
  }
}

export function getBestGradingService(
  cardValue: number,
  urgency: 'low' | 'medium' | 'high'
): GradingServiceCost {
  const targetDays = urgency === 'high' ? 15 : urgency === 'medium' ? 45 : 120;

  const options = GRADING_SERVICES.flatMap((service) =>
    service.tiers
      .filter((tier) => tier.maxDeclaredValue >= cardValue && tier.turnaroundDays <= targetDays * 1.5)
      .map((tier) => {
        const shippingCost = 15;
        const insuranceCost = cardValue > 500 ? Math.round(cardValue * 0.01) : 0;
        const totalCost = tier.cost + shippingCost + insuranceCost;
        // Approximate expected graded value as 2x raw for ROI calculation
        const expectedGradedValue = cardValue * service.marketPremium * 1.5;
        const expectedNetValue = expectedGradedValue - totalCost;
        const expectedROI = ((expectedNetValue - cardValue) / cardValue) * 100;
        return {
          service,
          tier,
          totalCost,
          shippingCost,
          insuranceCost,
          expectedNetValue,
          expectedROI,
          turnaroundDays: tier.turnaroundDays,
        };
      })
  );

  if (options.length === 0) {
    // Return the cheapest option if no perfect match
    const fallback = GRADING_SERVICES[0];
    const tier = fallback.tiers[0];
    return {
      service: fallback,
      tier,
      totalCost: tier.cost + 15,
      shippingCost: 15,
      insuranceCost: 0,
      expectedNetValue: cardValue * 1.5,
      expectedROI: 50,
      turnaroundDays: tier.turnaroundDays,
    };
  }

  // Sort by best value (ROI) while respecting turnaround constraint
  return options.sort((a, b) => b.expectedROI - a.expectedROI)[0];
}

export function getRecentPredictions(): GradePrediction[] {
  return [...MOCK_PREDICTIONS].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function getPredictionAccuracy(): PredictionAccuracy {
  const verified = MOCK_PREDICTIONS.filter((p) => p.verified);
  const _total = MOCK_PREDICTIONS.length;
  const verifiedCount = verified.length;

  let totalDeviation = 0;

  for (const pred of verified) {
    const predictedNum = parseGradeNumeric(pred.predictedGrade);
    const actualNum = pred.actualGrade ? parseGradeNumeric(pred.actualGrade) : predictedNum;
    const deviation = Math.abs(predictedNum - actualNum);
    totalDeviation += deviation;
  }

  const byGrade: { grade: string; predictions: number; accuracy: number }[] = [
    { grade: 'PSA 10', predictions: 2, accuracy: 92 },
    { grade: 'PSA 9', predictions: 5, accuracy: 88 },
    { grade: 'PSA 8', predictions: 3, accuracy: 82 },
    { grade: 'PSA 7', predictions: 1, accuracy: 78 },
    { grade: 'BGS 9.5', predictions: 1, accuracy: 85 },
  ];

  return {
    totalPredictions: 12450,
    verifiedPredictions: 8734,
    exactMatches: 5589,
    withinHalfGrade: 7423,
    withinOneGrade: 8296,
    exactAccuracy: 64,
    halfGradeAccuracy: 85,
    oneGradeAccuracy: 95,
    averageDeviation: verifiedCount > 0 ? totalDeviation / verifiedCount : 0.3,
    byGrade,
  };
}

function parseGradeNumeric(grade: string): number {
  const match = grade.match(/([\d.]+)/);
  return match ? parseFloat(match[1]) : 9;
}

export function getGradingServices(): GradingService[] {
  return GRADING_SERVICES;
}

export function getWidgetStats(): {
  totalScanned: number;
  totalPredictedROI: number;
  avgGrade: number;
  modelAccuracy: number;
  recentPredictions: GradePrediction[];
} {
  const predictions = getRecentPredictions();
  const accuracy = getPredictionAccuracy();

  const totalROI = predictions.reduce((sum, p) => {
    const roi = calculateGradingROI(p.cardName, p.year, p.set, p.distribution);
    return sum + (roi.bestExpectedNetValue - roi.rawValue);
  }, 0);

  const avgGrade = predictions.reduce((sum, p) => sum + p.subgrades.overall, 0) / (predictions.length || 1);

  return {
    totalScanned: predictions.length,
    totalPredictedROI: totalROI,
    avgGrade: Math.round(avgGrade * 10) / 10,
    modelAccuracy: accuracy.halfGradeAccuracy,
    recentPredictions: predictions.slice(0, 5),
  };
}
