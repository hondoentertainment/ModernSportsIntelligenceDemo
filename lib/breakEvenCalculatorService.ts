// ─── Break Even Calculator Service ─────────────────────────────────────────
// Calculates break-even grades, profit projections, and ROI analysis for
// sports card grading investments.

// ─── Types ─────────────────────────────────────────────────────────────────

export interface EstimatedGrade {
  grade: string;
  probability: number;
  marketValue: number;
}

export interface BreakEvenScenario {
  id: string;
  cardName: string;
  player: string;
  sport: string;
  year: number;
  set: string;
  purchasePrice: number;
  gradingCost: number;
  gradingCompany: string;
  shippingCost: number;
  insuranceCost: number;
  platformFees: number; // percent (e.g. 13 means 13%)
  estimatedGrades: EstimatedGrade[];
  breakEvenGrade: string;
  expectedProfit: number;
  expectedROI: number;
  timestamp: string;
}

export interface FeeStructure {
  platform: string;
  listingFee: number;
  finalValueFee: number;
  paymentProcessing: number;
  shippingEstimate: number;
}

export interface GradingTier {
  company: string;
  tier: string;
  cost: number;
  turnaround: string;
}

export interface ProfitProjection {
  grade: string;
  grossRevenue: number;
  totalCosts: number;
  netProfit: number;
  roi: number;
  isBreakEven: boolean;
  isProfitable: boolean;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const STORAGE_PREFIX = 'msi_break_even';

const GRADING_TIERS: GradingTier[] = [
  { company: 'PSA', tier: 'Value', cost: 25, turnaround: '65 business days' },
  { company: 'PSA', tier: 'Regular', cost: 50, turnaround: '30 business days' },
  { company: 'PSA', tier: 'Express', cost: 100, turnaround: '15 business days' },
  { company: 'PSA', tier: 'Super Express', cost: 200, turnaround: '5 business days' },
  { company: 'PSA', tier: 'Walk-Through', cost: 300, turnaround: '1 business day' },
  { company: 'BGS', tier: 'Economy', cost: 22, turnaround: '80 business days' },
  { company: 'BGS', tier: 'Standard', cost: 40, turnaround: '40 business days' },
  { company: 'BGS', tier: 'Express', cost: 100, turnaround: '10 business days' },
  { company: 'BGS', tier: 'Premium', cost: 250, turnaround: '2 business days' },
  { company: 'SGC', tier: 'Economy', cost: 18, turnaround: '60 business days' },
  { company: 'SGC', tier: 'Regular', cost: 35, turnaround: '25 business days' },
  { company: 'SGC', tier: 'Express', cost: 85, turnaround: '10 business days' },
  { company: 'CGC', tier: 'Economy', cost: 20, turnaround: '70 business days' },
  { company: 'CGC', tier: 'Standard', cost: 38, turnaround: '30 business days' },
  { company: 'CGC', tier: 'Express', cost: 90, turnaround: '12 business days' },
];

const PLATFORM_FEES: FeeStructure[] = [
  {
    platform: 'eBay',
    listingFee: 0.30,
    finalValueFee: 12.9,
    paymentProcessing: 0,
    shippingEstimate: 5.00,
  },
  {
    platform: 'COMC',
    listingFee: 0,
    finalValueFee: 5.0,
    paymentProcessing: 2.5,
    shippingEstimate: 0,
  },
  {
    platform: 'MySlabs',
    listingFee: 0,
    finalValueFee: 8.0,
    paymentProcessing: 2.9,
    shippingEstimate: 4.50,
  },
];

// ─── Mock Scenarios ────────────────────────────────────────────────────────

const MOCK_SCENARIOS: BreakEvenScenario[] = [
  {
    id: 'mock-1',
    cardName: '2023 Topps Chrome Victor Wembanyama RC #1',
    player: 'Victor Wembanyama',
    sport: 'Basketball',
    year: 2023,
    set: 'Topps Chrome',
    purchasePrice: 250,
    gradingCost: 50,
    gradingCompany: 'PSA',
    shippingCost: 15,
    insuranceCost: 10,
    platformFees: 12.9,
    estimatedGrades: [
      { grade: 'PSA 10', probability: 0.30, marketValue: 850 },
      { grade: 'PSA 9', probability: 0.45, marketValue: 400 },
      { grade: 'PSA 8', probability: 0.15, marketValue: 280 },
      { grade: 'PSA 7', probability: 0.07, marketValue: 200 },
      { grade: 'PSA 6', probability: 0.03, marketValue: 150 },
    ],
    breakEvenGrade: 'PSA 9',
    expectedProfit: 152.78,
    expectedROI: 46.97,
    timestamp: '2025-12-01T10:00:00Z',
  },
  {
    id: 'mock-2',
    cardName: '2018 Panini Prizm Luka Doncic RC #280',
    player: 'Luka Doncic',
    sport: 'Basketball',
    year: 2018,
    set: 'Panini Prizm',
    purchasePrice: 500,
    gradingCost: 100,
    gradingCompany: 'PSA',
    shippingCost: 20,
    insuranceCost: 15,
    platformFees: 12.9,
    estimatedGrades: [
      { grade: 'PSA 10', probability: 0.20, marketValue: 3500 },
      { grade: 'PSA 9', probability: 0.50, marketValue: 900 },
      { grade: 'PSA 8', probability: 0.20, marketValue: 600 },
      { grade: 'PSA 7', probability: 0.08, marketValue: 400 },
      { grade: 'PSA 6', probability: 0.02, marketValue: 300 },
    ],
    breakEvenGrade: 'PSA 9',
    expectedProfit: 399.86,
    expectedROI: 62.97,
    timestamp: '2025-11-15T14:30:00Z',
  },
  {
    id: 'mock-3',
    cardName: '2011 Topps Update Mike Trout RC #US175',
    player: 'Mike Trout',
    sport: 'Baseball',
    year: 2011,
    set: 'Topps Update',
    purchasePrice: 1200,
    gradingCost: 200,
    gradingCompany: 'PSA',
    shippingCost: 25,
    insuranceCost: 30,
    platformFees: 12.9,
    estimatedGrades: [
      { grade: 'PSA 10', probability: 0.10, marketValue: 25000 },
      { grade: 'PSA 9', probability: 0.35, marketValue: 4500 },
      { grade: 'PSA 8', probability: 0.35, marketValue: 2200 },
      { grade: 'PSA 7', probability: 0.15, marketValue: 1500 },
      { grade: 'PSA 6', probability: 0.05, marketValue: 900 },
    ],
    breakEvenGrade: 'PSA 8',
    expectedProfit: 3252.14,
    expectedROI: 223.60,
    timestamp: '2025-10-20T09:15:00Z',
  },
  {
    id: 'mock-4',
    cardName: '2020 Panini Mosaic Justin Herbert RC #211',
    player: 'Justin Herbert',
    sport: 'Football',
    year: 2020,
    set: 'Panini Mosaic',
    purchasePrice: 80,
    gradingCost: 25,
    gradingCompany: 'PSA',
    shippingCost: 10,
    insuranceCost: 5,
    platformFees: 12.9,
    estimatedGrades: [
      { grade: 'PSA 10', probability: 0.35, marketValue: 350 },
      { grade: 'PSA 9', probability: 0.40, marketValue: 130 },
      { grade: 'PSA 8', probability: 0.15, marketValue: 85 },
      { grade: 'PSA 7', probability: 0.07, marketValue: 60 },
      { grade: 'PSA 6', probability: 0.03, marketValue: 45 },
    ],
    breakEvenGrade: 'PSA 9',
    expectedProfit: 55.29,
    expectedROI: 46.07,
    timestamp: '2025-09-10T16:45:00Z',
  },
  {
    id: 'mock-5',
    cardName: '2022 Topps Chrome Julio Rodriguez RC #44',
    player: 'Julio Rodriguez',
    sport: 'Baseball',
    year: 2022,
    set: 'Topps Chrome',
    purchasePrice: 60,
    gradingCost: 22,
    gradingCompany: 'BGS',
    shippingCost: 10,
    insuranceCost: 5,
    platformFees: 5.0,
    estimatedGrades: [
      { grade: 'BGS 10', probability: 0.05, marketValue: 600 },
      { grade: 'BGS 9.5', probability: 0.30, marketValue: 250 },
      { grade: 'BGS 9', probability: 0.40, marketValue: 120 },
      { grade: 'BGS 8.5', probability: 0.15, marketValue: 80 },
      { grade: 'BGS 8', probability: 0.10, marketValue: 60 },
    ],
    breakEvenGrade: 'BGS 9',
    expectedProfit: 56.10,
    expectedROI: 57.84,
    timestamp: '2025-08-01T11:20:00Z',
  },
  {
    id: 'mock-6',
    cardName: '2023 Panini Prizm Jalin Hyatt RC #310',
    player: 'Jalin Hyatt',
    sport: 'Football',
    year: 2023,
    set: 'Panini Prizm',
    purchasePrice: 15,
    gradingCost: 18,
    gradingCompany: 'SGC',
    shippingCost: 8,
    insuranceCost: 0,
    platformFees: 8.0,
    estimatedGrades: [
      { grade: 'SGC 10', probability: 0.40, marketValue: 80 },
      { grade: 'SGC 9.5', probability: 0.30, marketValue: 40 },
      { grade: 'SGC 9', probability: 0.20, marketValue: 25 },
      { grade: 'SGC 8', probability: 0.10, marketValue: 15 },
    ],
    breakEvenGrade: 'SGC 9.5',
    expectedProfit: 5.54,
    expectedROI: 13.51,
    timestamp: '2025-07-15T08:00:00Z',
  },
  {
    id: 'mock-7',
    cardName: '2019 Panini Prizm Zion Williamson RC #248',
    player: 'Zion Williamson',
    sport: 'Basketball',
    year: 2019,
    set: 'Panini Prizm',
    purchasePrice: 300,
    gradingCost: 50,
    gradingCompany: 'PSA',
    shippingCost: 15,
    insuranceCost: 10,
    platformFees: 12.9,
    estimatedGrades: [
      { grade: 'PSA 10', probability: 0.25, marketValue: 1500 },
      { grade: 'PSA 9', probability: 0.45, marketValue: 500 },
      { grade: 'PSA 8', probability: 0.20, marketValue: 350 },
      { grade: 'PSA 7', probability: 0.07, marketValue: 250 },
      { grade: 'PSA 6', probability: 0.03, marketValue: 180 },
    ],
    breakEvenGrade: 'PSA 9',
    expectedProfit: 184.25,
    expectedROI: 49.13,
    timestamp: '2025-06-05T13:00:00Z',
  },
  {
    id: 'mock-8',
    cardName: '2023 Topps Chrome Corbin Carroll RC #200',
    player: 'Corbin Carroll',
    sport: 'Baseball',
    year: 2023,
    set: 'Topps Chrome',
    purchasePrice: 35,
    gradingCost: 25,
    gradingCompany: 'PSA',
    shippingCost: 10,
    insuranceCost: 5,
    platformFees: 12.9,
    estimatedGrades: [
      { grade: 'PSA 10', probability: 0.30, marketValue: 200 },
      { grade: 'PSA 9', probability: 0.45, marketValue: 60 },
      { grade: 'PSA 8', probability: 0.15, marketValue: 40 },
      { grade: 'PSA 7', probability: 0.07, marketValue: 30 },
      { grade: 'PSA 6', probability: 0.03, marketValue: 20 },
    ],
    breakEvenGrade: 'PSA 9',
    expectedProfit: 13.66,
    expectedROI: 18.21,
    timestamp: '2025-05-20T10:30:00Z',
  },
  {
    id: 'mock-9',
    cardName: '2024 Panini Prizm Caleb Williams RC #101',
    player: 'Caleb Williams',
    sport: 'Football',
    year: 2024,
    set: 'Panini Prizm',
    purchasePrice: 150,
    gradingCost: 35,
    gradingCompany: 'SGC',
    shippingCost: 12,
    insuranceCost: 8,
    platformFees: 8.0,
    estimatedGrades: [
      { grade: 'SGC 10', probability: 0.25, marketValue: 650 },
      { grade: 'SGC 9.5', probability: 0.35, marketValue: 320 },
      { grade: 'SGC 9', probability: 0.25, marketValue: 200 },
      { grade: 'SGC 8', probability: 0.10, marketValue: 150 },
      { grade: 'SGC 7', probability: 0.05, marketValue: 100 },
    ],
    breakEvenGrade: 'SGC 9.5',
    expectedProfit: 91.62,
    expectedROI: 44.69,
    timestamp: '2025-04-12T15:45:00Z',
  },
  {
    id: 'mock-10',
    cardName: '2023 Bowman Chrome Elly De La Cruz 1st #BCP-1',
    player: 'Elly De La Cruz',
    sport: 'Baseball',
    year: 2023,
    set: 'Bowman Chrome',
    purchasePrice: 180,
    gradingCost: 40,
    gradingCompany: 'BGS',
    shippingCost: 12,
    insuranceCost: 8,
    platformFees: 5.0,
    estimatedGrades: [
      { grade: 'BGS 10', probability: 0.05, marketValue: 2500 },
      { grade: 'BGS 9.5', probability: 0.30, marketValue: 600 },
      { grade: 'BGS 9', probability: 0.40, marketValue: 300 },
      { grade: 'BGS 8.5', probability: 0.15, marketValue: 220 },
      { grade: 'BGS 8', probability: 0.10, marketValue: 170 },
    ],
    breakEvenGrade: 'BGS 9',
    expectedProfit: 139.50,
    expectedROI: 58.12,
    timestamp: '2025-03-08T12:00:00Z',
  },
  {
    id: 'mock-11',
    cardName: '2018 Topps Chrome Shohei Ohtani RC #150',
    player: 'Shohei Ohtani',
    sport: 'Baseball',
    year: 2018,
    set: 'Topps Chrome',
    purchasePrice: 400,
    gradingCost: 100,
    gradingCompany: 'PSA',
    shippingCost: 20,
    insuranceCost: 15,
    platformFees: 12.9,
    estimatedGrades: [
      { grade: 'PSA 10', probability: 0.15, marketValue: 5000 },
      { grade: 'PSA 9', probability: 0.40, marketValue: 1200 },
      { grade: 'PSA 8', probability: 0.30, marketValue: 700 },
      { grade: 'PSA 7', probability: 0.10, marketValue: 500 },
      { grade: 'PSA 6', probability: 0.05, marketValue: 350 },
    ],
    breakEvenGrade: 'PSA 9',
    expectedProfit: 477.35,
    expectedROI: 89.22,
    timestamp: '2025-02-14T09:00:00Z',
  },
  {
    id: 'mock-12',
    cardName: '2024 Topps Chrome Paul Skenes RC #250',
    player: 'Paul Skenes',
    sport: 'Baseball',
    year: 2024,
    set: 'Topps Chrome',
    purchasePrice: 100,
    gradingCost: 50,
    gradingCompany: 'PSA',
    shippingCost: 15,
    insuranceCost: 8,
    platformFees: 12.9,
    estimatedGrades: [
      { grade: 'PSA 10', probability: 0.30, marketValue: 500 },
      { grade: 'PSA 9', probability: 0.40, marketValue: 180 },
      { grade: 'PSA 8', probability: 0.20, marketValue: 120 },
      { grade: 'PSA 7', probability: 0.07, marketValue: 90 },
      { grade: 'PSA 6', probability: 0.03, marketValue: 60 },
    ],
    breakEvenGrade: 'PSA 9',
    expectedProfit: 48.55,
    expectedROI: 28.09,
    timestamp: '2025-01-20T17:30:00Z',
  },
];

// ─── Utility Helpers ───────────────────────────────────────────────────────

export function formatCurrency(n: number): string {
  return `$${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

export function formatPercent(n: number): string {
  return `${n.toFixed(1)}%`;
}

export function getROIColor(roi: number): string {
  if (roi >= 50) return 'text-green-400';
  if (roi >= 20) return 'text-green-300';
  if (roi >= 0) return 'text-yellow-400';
  if (roi >= -20) return 'text-orange-400';
  return 'text-red-400';
}

export function getProfitColor(profit: number): string {
  if (profit > 0) return 'text-green-400';
  if (profit === 0) return 'text-yellow-400';
  return 'text-red-400';
}

// ─── Core Calculations ─────────────────────────────────────────────────────

function computeTotalCost(
  purchasePrice: number,
  gradingCost: number,
  shippingCost: number,
  insuranceCost: number,
): number {
  return purchasePrice + gradingCost + shippingCost + insuranceCost;
}

function computePlatformDeductions(grossRevenue: number, platformFeePercent: number): number {
  return grossRevenue * (platformFeePercent / 100);
}

export function getProfitProjections(scenario: BreakEvenScenario): ProfitProjection[] {
  const baseCost = computeTotalCost(
    scenario.purchasePrice,
    scenario.gradingCost,
    scenario.shippingCost,
    scenario.insuranceCost,
  );

  let foundBreakEven = false;

  return scenario.estimatedGrades.map((g) => {
    const grossRevenue = g.marketValue;
    const platformDeductions = computePlatformDeductions(grossRevenue, scenario.platformFees);
    const totalCosts = baseCost + platformDeductions;
    const netProfit = grossRevenue - totalCosts;
    const roi = baseCost > 0 ? (netProfit / baseCost) * 100 : 0;
    const isProfitable = netProfit > 0;

    let isBreakEven = false;
    if (!foundBreakEven && isProfitable) {
      // Highest profitable grade in a descending-sorted list is break-even
      isBreakEven = true;
      foundBreakEven = true;
    }

    return {
      grade: g.grade,
      grossRevenue,
      totalCosts: Math.round(totalCosts * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
      roi: Math.round(roi * 100) / 100,
      isBreakEven,
      isProfitable,
    };
  });
}

function findBreakEvenGrade(projections: ProfitProjection[]): string {
  // Walk from lowest grade upward; the first profitable one is break-even.
  // Grades are ordered best-first in the array, so reverse iterate.
  for (let i = projections.length - 1; i >= 0; i--) {
    if (projections[i].isProfitable) {
      return projections[i].grade;
    }
  }
  return 'N/A';
}

function computeExpectedProfit(
  grades: EstimatedGrade[],
  baseCost: number,
  platformFeePct: number,
): number {
  return grades.reduce((acc, g) => {
    const platformDeductions = computePlatformDeductions(g.marketValue, platformFeePct);
    const netProfit = g.marketValue - baseCost - platformDeductions;
    return acc + netProfit * g.probability;
  }, 0);
}

function computeExpectedROI(expectedProfit: number, baseCost: number): number {
  if (baseCost === 0) return 0;
  return (expectedProfit / baseCost) * 100;
}

// ─── Public API ────────────────────────────────────────────────────────────

export function getScenarios(): BreakEvenScenario[] {
  return MOCK_SCENARIOS.map((s) => ({
    ...s,
    estimatedGrades: s.estimatedGrades.map((g) => ({ ...g })),
  }));
}

export interface CalculateBreakEvenParams {
  cardName: string;
  player: string;
  sport: string;
  year: number;
  set: string;
  purchasePrice: number;
  gradingCost: number;
  gradingCompany: string;
  shippingCost: number;
  insuranceCost: number;
  platformFees: number;
  estimatedGrades: EstimatedGrade[];
}

export function calculateBreakEven(params: CalculateBreakEvenParams): BreakEvenScenario {
  const baseCost = computeTotalCost(
    params.purchasePrice,
    params.gradingCost,
    params.shippingCost,
    params.insuranceCost,
  );

  const tempScenario: BreakEvenScenario = {
    id: `be-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    ...params,
    breakEvenGrade: '',
    expectedProfit: 0,
    expectedROI: 0,
    timestamp: new Date().toISOString(),
  };

  const projections = getProfitProjections(tempScenario);
  const breakEvenGrade = findBreakEvenGrade(projections);
  const expectedProfit = computeExpectedProfit(params.estimatedGrades, baseCost, params.platformFees);
  const expectedROI = computeExpectedROI(expectedProfit, baseCost);

  return {
    ...tempScenario,
    breakEvenGrade,
    expectedProfit: Math.round(expectedProfit * 100) / 100,
    expectedROI: Math.round(expectedROI * 100) / 100,
  };
}

export function getGradingTiers(): GradingTier[] {
  return [...GRADING_TIERS];
}

export function getPlatformFees(): FeeStructure[] {
  return [...PLATFORM_FEES];
}

export function getSavedCalculations(): BreakEvenScenario[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}_calculations`);
    if (!raw) return [];
    return JSON.parse(raw) as BreakEvenScenario[];
  } catch {
    return [];
  }
}

export function saveCalculation(calc: BreakEvenScenario): void {
  const existing = getSavedCalculations();
  const idx = existing.findIndex((s) => s.id === calc.id);
  if (idx >= 0) {
    existing[idx] = calc;
  } else {
    existing.push(calc);
  }
  localStorage.setItem(`${STORAGE_PREFIX}_calculations`, JSON.stringify(existing));
}

export function deleteCalculation(id: string): void {
  const existing = getSavedCalculations();
  const filtered = existing.filter((s) => s.id !== id);
  localStorage.setItem(`${STORAGE_PREFIX}_calculations`, JSON.stringify(filtered));
}

export function getBestCaseROI(scenario: BreakEvenScenario): number {
  if (scenario.estimatedGrades.length === 0) return 0;
  const baseCost = computeTotalCost(
    scenario.purchasePrice,
    scenario.gradingCost,
    scenario.shippingCost,
    scenario.insuranceCost,
  );
  const bestGrade = scenario.estimatedGrades.reduce((best, g) =>
    g.marketValue > best.marketValue ? g : best,
  );
  const platformDeductions = computePlatformDeductions(bestGrade.marketValue, scenario.platformFees);
  const netProfit = bestGrade.marketValue - baseCost - platformDeductions;
  return baseCost > 0 ? Math.round((netProfit / baseCost) * 100 * 100) / 100 : 0;
}

export function getWorstCaseROI(scenario: BreakEvenScenario): number {
  if (scenario.estimatedGrades.length === 0) return 0;
  const baseCost = computeTotalCost(
    scenario.purchasePrice,
    scenario.gradingCost,
    scenario.shippingCost,
    scenario.insuranceCost,
  );
  const worstGrade = scenario.estimatedGrades.reduce((worst, g) =>
    g.marketValue < worst.marketValue ? g : worst,
  );
  const platformDeductions = computePlatformDeductions(worstGrade.marketValue, scenario.platformFees);
  const netProfit = worstGrade.marketValue - baseCost - platformDeductions;
  return baseCost > 0 ? Math.round((netProfit / baseCost) * 100 * 100) / 100 : 0;
}
