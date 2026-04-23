// @ts-nocheck
// ---- Types ----

export type ScenarioType = 'buy' | 'sell' | 'trade' | 'grade' | 'hold' | 'liquidate';
export type ImpactLevel = 'high' | 'medium' | 'low' | 'neutral';

export interface Scenario {
  id: string;
  name: string;
  type: ScenarioType;
  description: string;
  createdAt: string;
  cards: ScenarioCard[];
  projectedNavChange: number;
  projectedNavPercent: number;
  riskDelta: number;
  diversificationDelta: number;
  taxImpact: number;
  confidenceScore: number;
}

export interface ScenarioCard {
  id: string;
  cardName: string;
  player: string;
  action: 'add' | 'remove' | 'upgrade' | 'downgrade';
  currentValue: number;
  projectedValue: number;
  quantity: number;
  grade: string;
}

export interface NavProjection {
  date: string;
  baselineNav: number;
  scenarioNav: number;
  delta: number;
}

export interface DiversificationImpact {
  category: string;
  currentAllocation: number;
  projectedAllocation: number;
  optimalAllocation: number;
  impact: ImpactLevel;
}

export interface ScenarioComparison {
  scenarioA: string;
  scenarioB: string;
  navDifference: number;
  riskDifference: number;
  taxDifference: number;
  recommendation: string;
}

export interface SimulatorStats {
  totalScenarios: number;
  avgProjectedReturn: number;
  bestScenarioId: string;
  bestScenarioReturn: number;
  worstScenarioId: string;
  worstScenarioReturn: number;
  avgConfidence: number;
  mostTestedAction: ScenarioType;
}

// ---- Mock Data ----

const mockScenarios: Scenario[] = [
  {
    id: 'sc-1',
    name: 'Sell High-Grade Vintage',
    type: 'sell',
    description: 'Liquidate top 5 vintage cards at current market peak',
    createdAt: '2026-03-15T10:30:00Z',
    cards: [
      { id: 'c1', cardName: '1986 Fleer Michael Jordan #57', player: 'Michael Jordan', action: 'remove', currentValue: 45000, projectedValue: 0, quantity: 1, grade: 'PSA 9' },
      { id: 'c2', cardName: '1952 Topps Mickey Mantle #311', player: 'Mickey Mantle', action: 'remove', currentValue: 125000, projectedValue: 0, quantity: 1, grade: 'PSA 5' },
      { id: 'c3', cardName: '1979 O-Pee-Chee Wayne Gretzky #18', player: 'Wayne Gretzky', action: 'remove', currentValue: 68000, projectedValue: 0, quantity: 1, grade: 'PSA 8' },
    ],
    projectedNavChange: -238000,
    projectedNavPercent: -18.5,
    riskDelta: -12.3,
    diversificationDelta: -8.7,
    taxImpact: 42600,
    confidenceScore: 87,
  },
  {
    id: 'sc-2',
    name: 'Rookie Class 2025 Buy',
    type: 'buy',
    description: 'Acquire top 10 2025 rookie cards before season breakouts',
    createdAt: '2026-03-14T14:15:00Z',
    cards: [
      { id: 'c4', cardName: '2025 Bowman Chrome Paul Skenes #1', player: 'Paul Skenes', action: 'add', currentValue: 0, projectedValue: 4500, quantity: 3, grade: 'PSA 10' },
      { id: 'c5', cardName: '2025 Topps Chrome Roki Sasaki #RC', player: 'Roki Sasaki', action: 'add', currentValue: 0, projectedValue: 3200, quantity: 2, grade: 'PSA 10' },
      { id: 'c6', cardName: '2025 Prizm Cooper Flagg #RC', player: 'Cooper Flagg', action: 'add', currentValue: 0, projectedValue: 8500, quantity: 1, grade: 'PSA 10' },
    ],
    projectedNavChange: 28900,
    projectedNavPercent: 2.2,
    riskDelta: 5.1,
    diversificationDelta: 3.4,
    taxImpact: 0,
    confidenceScore: 72,
  },
  {
    id: 'sc-3',
    name: 'Grade & Flip Strategy',
    type: 'grade',
    description: 'Submit 20 raw cards for grading and sell upgraded copies',
    createdAt: '2026-03-13T09:00:00Z',
    cards: [
      { id: 'c7', cardName: '2023 Topps Chrome Elly De La Cruz', player: 'Elly De La Cruz', action: 'upgrade', currentValue: 800, projectedValue: 2400, quantity: 5, grade: 'Raw → PSA 10' },
      { id: 'c8', cardName: '2024 Prizm Caitlin Clark', player: 'Caitlin Clark', action: 'upgrade', currentValue: 450, projectedValue: 1800, quantity: 3, grade: 'Raw → PSA 10' },
    ],
    projectedNavChange: 13350,
    projectedNavPercent: 1.0,
    riskDelta: -2.1,
    diversificationDelta: 0.5,
    taxImpact: 2400,
    confidenceScore: 65,
  },
  {
    id: 'sc-4',
    name: 'Defensive Rebalance',
    type: 'trade',
    description: 'Shift allocation from modern to vintage for stability',
    createdAt: '2026-03-12T16:45:00Z',
    cards: [
      { id: 'c9', cardName: '2023 Topps Chrome Various', player: 'Various', action: 'remove', currentValue: 35000, projectedValue: 0, quantity: 15, grade: 'Mixed' },
      { id: 'c10', cardName: '1970s Vintage Lot', player: 'Various', action: 'add', currentValue: 0, projectedValue: 33000, quantity: 8, grade: 'PSA 6-8' },
    ],
    projectedNavChange: -2000,
    projectedNavPercent: -0.15,
    riskDelta: -8.5,
    diversificationDelta: 6.2,
    taxImpact: 5200,
    confidenceScore: 81,
  },
];

const mockProjections: NavProjection[] = [
  { date: '2026-03', baselineNav: 1285000, scenarioNav: 1285000, delta: 0 },
  { date: '2026-04', baselineNav: 1298000, scenarioNav: 1312000, delta: 14000 },
  { date: '2026-05', baselineNav: 1305000, scenarioNav: 1328000, delta: 23000 },
  { date: '2026-06', baselineNav: 1318000, scenarioNav: 1355000, delta: 37000 },
  { date: '2026-07', baselineNav: 1325000, scenarioNav: 1372000, delta: 47000 },
  { date: '2026-08', baselineNav: 1340000, scenarioNav: 1398000, delta: 58000 },
  { date: '2026-09', baselineNav: 1335000, scenarioNav: 1385000, delta: 50000 },
  { date: '2026-10', baselineNav: 1348000, scenarioNav: 1410000, delta: 62000 },
  { date: '2026-11', baselineNav: 1360000, scenarioNav: 1432000, delta: 72000 },
  { date: '2026-12', baselineNav: 1375000, scenarioNav: 1458000, delta: 83000 },
];

const mockDiversification: DiversificationImpact[] = [
  { category: 'Vintage (Pre-1980)', currentAllocation: 32.5, projectedAllocation: 38.2, optimalAllocation: 35.0, impact: 'medium' },
  { category: 'Modern (2020+)', currentAllocation: 41.3, projectedAllocation: 35.8, optimalAllocation: 30.0, impact: 'high' },
  { category: 'Basketball', currentAllocation: 28.5, projectedAllocation: 26.1, optimalAllocation: 25.0, impact: 'low' },
  { category: 'Baseball', currentAllocation: 45.2, projectedAllocation: 48.7, optimalAllocation: 40.0, impact: 'medium' },
  { category: 'Football', currentAllocation: 18.1, projectedAllocation: 17.4, optimalAllocation: 20.0, impact: 'low' },
  { category: 'High-Grade (PSA 9-10)', currentAllocation: 55.3, projectedAllocation: 52.8, optimalAllocation: 50.0, impact: 'low' },
  { category: 'Mid-Grade (PSA 5-8)', currentAllocation: 35.2, projectedAllocation: 38.5, optimalAllocation: 35.0, impact: 'medium' },
  { category: 'Raw / Ungraded', currentAllocation: 9.5, projectedAllocation: 8.7, optimalAllocation: 15.0, impact: 'neutral' },
];

// ---- Service Functions ----

export function getScenarios(): Scenario[] {
  return mockScenarios;
}

export function getScenario(id: string): Scenario | undefined {
  return mockScenarios.find(s => s.id === id);
}

export function getNavProjections(_scenarioId?: string): NavProjection[] {
  return mockProjections;
}

export function getDiversificationImpact(_scenarioId?: string): DiversificationImpact[] {
  return mockDiversification;
}

export function compareScenarios(idA: string, idB: string): ScenarioComparison {
  const a = mockScenarios.find(s => s.id === idA) || mockScenarios[0];
  const b = mockScenarios.find(s => s.id === idB) || mockScenarios[1];
  return {
    scenarioA: a.name,
    scenarioB: b.name,
    navDifference: a.projectedNavChange - b.projectedNavChange,
    riskDifference: a.riskDelta - b.riskDelta,
    taxDifference: a.taxImpact - b.taxImpact,
    recommendation: a.confidenceScore > b.confidenceScore
      ? `${a.name} has higher confidence (${a.confidenceScore}% vs ${b.confidenceScore}%)`
      : `${b.name} has higher confidence (${b.confidenceScore}% vs ${a.confidenceScore}%)`,
  };
}

export function getSimulatorStats(): SimulatorStats {
  return {
    totalScenarios: mockScenarios.length,
    avgProjectedReturn: mockScenarios.reduce((sum, s) => sum + s.projectedNavPercent, 0) / mockScenarios.length,
    bestScenarioId: 'sc-2',
    bestScenarioReturn: 2.2,
    worstScenarioId: 'sc-1',
    worstScenarioReturn: -18.5,
    avgConfidence: mockScenarios.reduce((sum, s) => sum + s.confidenceScore, 0) / mockScenarios.length,
    mostTestedAction: 'sell',
  };
}
