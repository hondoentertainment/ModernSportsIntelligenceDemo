// ---- Types ----

export interface LiquiditySignal {
  id: string;
  source: string;
  metric: string;
  currentValue: number;
  previousValue: number;
  changePercent: number;
  direction: 'improving' | 'deteriorating' | 'stable';
  measuredAt: string;
  weight: number; // 0-1 importance in composite index
}

export interface SystemicRiskLevel {
  overall: number; // 0-100 composite score
  label: 'green' | 'yellow' | 'orange' | 'red';
  primaryDrivers: string[];
  updatedAt: string;
  trendDirection: 'worsening' | 'improving' | 'flat';
  weekOverWeekChange: number;
}

export interface MacroIndicator {
  id: string;
  name: string;
  category: 'marketplace' | 'grading' | 'auction' | 'break' | 'retail';
  value: number;
  unit: string;
  historicalValues: { date: string; value: number }[];
  healthStatus: 'healthy' | 'stressed' | 'critical';
}

export interface CrisisAlert {
  id: string;
  severity: 'systemic' | 'sector' | 'localized';
  title: string;
  description: string;
  affectedSegments: string[];
  triggeredAt: string;
  resolved: boolean;
  estimatedImpact: string;
}

// ---- Mock Data ----

const mockSignals: LiquiditySignal[] = [
  { id: 'ls-001', source: 'eBay', metric: 'Sell-through rate', currentValue: 38.2, previousValue: 44.6, changePercent: -14.3, direction: 'deteriorating', measuredAt: '2026-03-15', weight: 0.20 },
  { id: 'ls-002', source: 'eBay', metric: 'Average days to sale', currentValue: 14.8, previousValue: 11.2, changePercent: 32.1, direction: 'deteriorating', measuredAt: '2026-03-15', weight: 0.15 },
  { id: 'ls-003', source: 'PWCC', metric: 'Auction sell-through rate', currentValue: 72.1, previousValue: 78.4, changePercent: -8.0, direction: 'deteriorating', measuredAt: '2026-03-14', weight: 0.18 },
  { id: 'ls-004', source: 'PSA', metric: 'Monthly submission volume', currentValue: 285000, previousValue: 310000, changePercent: -8.1, direction: 'deteriorating', measuredAt: '2026-03-01', weight: 0.12 },
  { id: 'ls-005', source: 'BGS', metric: 'Monthly submission volume', currentValue: 62000, previousValue: 58000, changePercent: 6.9, direction: 'improving', measuredAt: '2026-03-01', weight: 0.08 },
  { id: 'ls-006', source: 'Whatnot', metric: 'Break participation rate', currentValue: 64.5, previousValue: 71.8, changePercent: -10.2, direction: 'deteriorating', measuredAt: '2026-03-15', weight: 0.14 },
  { id: 'ls-007', source: 'Heritage', metric: 'Avg hammer vs. estimate ratio', currentValue: 1.08, previousValue: 1.22, changePercent: -11.5, direction: 'deteriorating', measuredAt: '2026-03-12', weight: 0.10 },
  { id: 'ls-008', source: 'StockX', metric: 'Bid-ask spread %', currentValue: 18.4, previousValue: 12.7, changePercent: 44.9, direction: 'deteriorating', measuredAt: '2026-03-15', weight: 0.08 },
  { id: 'ls-009', source: 'MySlabs', metric: 'Portfolio listings (sell intent)', currentValue: 12400, previousValue: 9800, changePercent: 26.5, direction: 'deteriorating', measuredAt: '2026-03-14', weight: 0.05 },
  { id: 'ls-010', source: 'Panini', metric: 'New product velocity (retail)', currentValue: 0.82, previousValue: 0.91, changePercent: -9.9, direction: 'deteriorating', measuredAt: '2026-03-10', weight: 0.05 },
];

const mockIndicators: MacroIndicator[] = [
  {
    id: 'mi-001', name: 'eBay Sports Cards Sell-Through', category: 'marketplace', value: 38.2, unit: '%',
    historicalValues: [
      { date: '2025-09-01', value: 52.1 }, { date: '2025-10-01', value: 49.8 }, { date: '2025-11-01', value: 47.3 },
      { date: '2025-12-01', value: 46.1 }, { date: '2026-01-01', value: 44.6 }, { date: '2026-02-01', value: 41.0 },
      { date: '2026-03-01', value: 38.2 },
    ],
    healthStatus: 'stressed',
  },
  {
    id: 'mi-002', name: 'PSA Grading Submissions', category: 'grading', value: 285000, unit: 'cards/month',
    historicalValues: [
      { date: '2025-09-01', value: 340000 }, { date: '2025-10-01', value: 328000 }, { date: '2025-11-01', value: 315000 },
      { date: '2025-12-01', value: 305000 }, { date: '2026-01-01', value: 310000 }, { date: '2026-02-01', value: 298000 },
      { date: '2026-03-01', value: 285000 },
    ],
    healthStatus: 'stressed',
  },
  {
    id: 'mi-003', name: 'Heritage Auction Velocity', category: 'auction', value: 1.08, unit: 'hammer/estimate',
    historicalValues: [
      { date: '2025-09-01', value: 1.35 }, { date: '2025-10-01', value: 1.31 }, { date: '2025-11-01', value: 1.28 },
      { date: '2025-12-01', value: 1.25 }, { date: '2026-01-01', value: 1.22 }, { date: '2026-02-01', value: 1.15 },
      { date: '2026-03-01', value: 1.08 },
    ],
    healthStatus: 'stressed',
  },
  {
    id: 'mi-004', name: 'Live Break Fill Rate', category: 'break', value: 64.5, unit: '%',
    historicalValues: [
      { date: '2025-09-01', value: 82.0 }, { date: '2025-10-01', value: 79.5 }, { date: '2025-11-01', value: 76.3 },
      { date: '2025-12-01', value: 74.1 }, { date: '2026-01-01', value: 71.8 }, { date: '2026-02-01', value: 68.0 },
      { date: '2026-03-01', value: 64.5 },
    ],
    healthStatus: 'stressed',
  },
  {
    id: 'mi-005', name: 'Retail Hobby Box Velocity', category: 'retail', value: 0.82, unit: 'sell-through index',
    historicalValues: [
      { date: '2025-09-01', value: 1.05 }, { date: '2025-10-01', value: 1.01 }, { date: '2025-11-01', value: 0.97 },
      { date: '2025-12-01', value: 0.94 }, { date: '2026-01-01', value: 0.91 }, { date: '2026-02-01', value: 0.87 },
      { date: '2026-03-01', value: 0.82 },
    ],
    healthStatus: 'critical',
  },
];

const mockCrisisAlerts: CrisisAlert[] = [
  {
    id: 'ca-001', severity: 'sector', title: 'Break Market Contraction',
    description: 'Break fill rates have declined 21% over 6 months. Multiple mid-tier breakers reporting unsold spots. Indicates weakening retail demand for modern product.',
    affectedSegments: ['modern_breaks', 'sealed_product', 'mid_range_singles'],
    triggeredAt: '2026-03-10T08:00:00Z', resolved: false, estimatedImpact: 'Potential 10-15% price decline in break-heavy modern singles over 60 days',
  },
  {
    id: 'ca-002', severity: 'localized', title: 'eBay Bid-Ask Spread Widening',
    description: 'Bid-ask spreads on eBay sports cards have widened to 18.4%, highest since Q3 2023. Sellers resisting price drops while buyers pull back.',
    affectedSegments: ['ebay_marketplace', 'mid_value_singles'],
    triggeredAt: '2026-03-14T12:00:00Z', resolved: false, estimatedImpact: 'Slower transaction velocity for 30-60 days until price discovery resets',
  },
  {
    id: 'ca-003', severity: 'systemic', title: '2023 Q4 Hobby Liquidity Crunch',
    description: 'Simultaneous decline across sell-through rates, auction performance, and grading submissions triggered a 6-month correction. Vintage held better than modern.',
    affectedSegments: ['modern_singles', 'sealed_product', 'breaks', 'grading'],
    triggeredAt: '2023-10-15T00:00:00Z', resolved: true, estimatedImpact: 'Overall market declined 18-25% before stabilizing in Q2 2024',
  },
  {
    id: 'ca-004', severity: 'systemic', title: '2022 Modern Card Crash',
    description: 'Pandemic-era speculation unwound as interest rates rose and new collectors exited. Modern singles lost 40-60% from 2021 peaks.',
    affectedSegments: ['modern_singles', 'rookie_cards', 'parallels', 'sealed_wax'],
    triggeredAt: '2022-06-01T00:00:00Z', resolved: true, estimatedImpact: 'Broad market correction of 35-55% in modern segment. Vintage declined 10-15%.',
  },
];

// ---- Functions ----

export function getSignals(): LiquiditySignal[] {
  return [...mockSignals].sort((a, b) => b.weight - a.weight);
}

export function getRiskLevel(): SystemicRiskLevel {
  const signals = getSignals();
  const weightedScore = signals.reduce((sum, s) => {
    const directionMultiplier = s.direction === 'deteriorating' ? 1 : s.direction === 'stable' ? 0.5 : 0;
    const absChange = Math.min(Math.abs(s.changePercent), 50);
    const contribution = directionMultiplier * (absChange / 50) * 100 * s.weight;
    return sum + contribution;
  }, 0);

  const overall = Math.round(Math.min(100, weightedScore));

  let label: SystemicRiskLevel['label'];
  if (overall >= 70) label = 'red';
  else if (overall >= 50) label = 'orange';
  else if (overall >= 30) label = 'yellow';
  else label = 'green';

  const deteriorating = signals
    .filter((s) => s.direction === 'deteriorating')
    .sort((a, b) => Math.abs(b.changePercent) * b.weight - Math.abs(a.changePercent) * a.weight)
    .slice(0, 3)
    .map((s) => `${s.source} ${s.metric}`);

  return {
    overall,
    label,
    primaryDrivers: deteriorating,
    updatedAt: '2026-03-15T18:00:00Z',
    trendDirection: 'worsening',
    weekOverWeekChange: 4.2,
  };
}

export function getIndicators(category?: MacroIndicator['category']): MacroIndicator[] {
  let results = [...mockIndicators];
  if (category) {
    results = results.filter((i) => i.category === category);
  }
  return results;
}

export function getCrisisAlerts(includeResolved: boolean = false): CrisisAlert[] {
  let results = [...mockCrisisAlerts];
  if (!includeResolved) {
    results = results.filter((a) => !a.resolved);
  }
  return results.sort((a, b) => {
    const sevOrder: Record<string, number> = { systemic: 0, sector: 1, localized: 2 };
    return sevOrder[a.severity] - sevOrder[b.severity];
  });
}

export function getHistoricalCrises(): {
  crises: CrisisAlert[];
  avgDurationDays: number;
  avgDrawdownPercent: number;
  recoveryPatterns: { segment: string; avgRecoveryMonths: number }[];
} {
  const resolved = mockCrisisAlerts.filter((a) => a.resolved);
  return {
    crises: resolved,
    avgDurationDays: 178,
    avgDrawdownPercent: 21.5,
    recoveryPatterns: [
      { segment: 'vintage_pre1980', avgRecoveryMonths: 4.2 },
      { segment: 'vintage_1980s_1990s', avgRecoveryMonths: 7.8 },
      { segment: 'modern_flagship', avgRecoveryMonths: 9.1 },
      { segment: 'modern_parallels', avgRecoveryMonths: 14.5 },
      { segment: 'sealed_product', avgRecoveryMonths: 6.3 },
    ],
  };
}
