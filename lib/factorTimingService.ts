// ─────────────────────────────────────────────────────────────────────────────
// Factor Timing Engine Service
// Time exposure to market factors for optimal sports card returns
// ─────────────────────────────────────────────────────────────────────────────

export interface FactorTiming {
  id: string;
  factorName: string;
  category: 'scarcity' | 'narrative' | 'grade' | 'vintage' | 'seasonal' | 'momentum';
  currentSignal: 'overweight' | 'neutral' | 'underweight';
  signalStrength: number;
  expectedReturn: number;
  confidence: number;
  nextRebalance: string;
  description: string;
  historicalAccuracy: number;
}

export interface TimingSignal {
  id: string;
  factorId: string;
  factorName: string;
  signalDate: string;
  direction: 'overweight' | 'neutral' | 'underweight';
  strength: number;
  outcome: number | null;
  realized: boolean;
  holdPeriod: string;
}

export interface FactorExposure {
  factorId: string;
  factorName: string;
  currentExposure: number;
  targetExposure: number;
  delta: number;
  rebalanceAction: string;
  costToRebalance: number;
  monthlyReturns: { month: string; return: number; benchmark: number }[];
}

export interface TimingHistory {
  month: string;
  scarcityReturn: number;
  narrativeReturn: number;
  gradeReturn: number;
  vintageReturn: number;
  seasonalReturn: number;
  momentumReturn: number;
  totalReturn: number;
  benchmark: number;
}

const factorTimings: FactorTiming[] = [
  {
    id: 'FT-01', factorName: 'Scarcity Factor', category: 'scarcity',
    currentSignal: 'overweight', signalStrength: 78, expectedReturn: 8.5, confidence: 72,
    nextRebalance: '2026-05-01', description: 'Low-population graded cards outperforming as collectors chase scarcity',
    historicalAccuracy: 68
  },
  {
    id: 'FT-02', factorName: 'Narrative Factor', category: 'narrative',
    currentSignal: 'neutral', signalStrength: 45, expectedReturn: 3.2, confidence: 55,
    nextRebalance: '2026-05-01', description: 'Player performance narratives have moderate pricing impact currently',
    historicalAccuracy: 62
  },
  {
    id: 'FT-03', factorName: 'Grade Premium Factor', category: 'grade',
    currentSignal: 'underweight', signalStrength: 65, expectedReturn: -2.1, confidence: 70,
    nextRebalance: '2026-05-01', description: 'PSA 10 premiums are elevated and grade compression is expected',
    historicalAccuracy: 71
  },
  {
    id: 'FT-04', factorName: 'Vintage Factor', category: 'vintage',
    currentSignal: 'overweight', signalStrength: 82, expectedReturn: 6.8, confidence: 75,
    nextRebalance: '2026-05-01', description: 'Pre-1980 cards showing relative strength as floor buyers accumulate',
    historicalAccuracy: 74
  },
  {
    id: 'FT-05', factorName: 'Seasonal Factor', category: 'seasonal',
    currentSignal: 'overweight', signalStrength: 88, expectedReturn: 5.5, confidence: 82,
    nextRebalance: '2026-05-15', description: 'MLB season ramp-up creates strong baseball card momentum through June',
    historicalAccuracy: 79
  },
  {
    id: 'FT-06', factorName: 'Momentum Factor', category: 'momentum',
    currentSignal: 'neutral', signalStrength: 52, expectedReturn: 2.8, confidence: 58,
    nextRebalance: '2026-05-01', description: 'Cross-category momentum signals are mixed with no clear directional bias',
    historicalAccuracy: 65
  },
];

const timingSignals: TimingSignal[] = [
  { id: 'TS-01', factorId: 'FT-01', factorName: 'Scarcity', signalDate: '2026-04-01', direction: 'overweight', strength: 78, outcome: 4.2, realized: true, holdPeriod: '17 days' },
  { id: 'TS-02', factorId: 'FT-05', factorName: 'Seasonal', signalDate: '2026-04-01', direction: 'overweight', strength: 88, outcome: 3.1, realized: true, holdPeriod: '17 days' },
  { id: 'TS-03', factorId: 'FT-03', factorName: 'Grade Premium', signalDate: '2026-04-01', direction: 'underweight', strength: 65, outcome: 1.8, realized: true, holdPeriod: '17 days' },
  { id: 'TS-04', factorId: 'FT-04', factorName: 'Vintage', signalDate: '2026-04-01', direction: 'overweight', strength: 82, outcome: null, realized: false, holdPeriod: 'ongoing' },
  { id: 'TS-05', factorId: 'FT-02', factorName: 'Narrative', signalDate: '2026-03-15', direction: 'neutral', strength: 45, outcome: 0.5, realized: true, holdPeriod: '34 days' },
  { id: 'TS-06', factorId: 'FT-06', factorName: 'Momentum', signalDate: '2026-03-15', direction: 'overweight', strength: 68, outcome: 2.9, realized: true, holdPeriod: '34 days' },
  { id: 'TS-07', factorId: 'FT-01', factorName: 'Scarcity', signalDate: '2026-03-01', direction: 'overweight', strength: 72, outcome: 5.1, realized: true, holdPeriod: '31 days' },
  { id: 'TS-08', factorId: 'FT-05', factorName: 'Seasonal', signalDate: '2026-02-15', direction: 'neutral', strength: 40, outcome: 1.2, realized: true, holdPeriod: '45 days' },
  { id: 'TS-09', factorId: 'FT-04', factorName: 'Vintage', signalDate: '2026-02-01', direction: 'overweight', strength: 75, outcome: 4.5, realized: true, holdPeriod: '59 days' },
  { id: 'TS-10', factorId: 'FT-03', factorName: 'Grade Premium', signalDate: '2026-01-15', direction: 'neutral', strength: 50, outcome: -0.8, realized: true, holdPeriod: '63 days' },
];

const factorExposures: FactorExposure[] = factorTimings.map(ft => {
  const current = ft.currentSignal === 'overweight' ? 25 + Math.random() * 10 : ft.currentSignal === 'underweight' ? 5 + Math.random() * 8 : 15 + Math.random() * 5;
  const target = ft.currentSignal === 'overweight' ? 30 + Math.random() * 10 : ft.currentSignal === 'underweight' ? 5 + Math.random() * 5 : 15 + Math.random() * 5;
  const months: { month: string; return: number; benchmark: number }[] = [];
  for (let i = 23; i >= 0; i--) {
    const d = new Date(2026, 3 - i, 1);
    months.push({
      month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      return: Math.round((Math.random() * 8 - 2) * 100) / 100,
      benchmark: Math.round((Math.random() * 5 - 1) * 100) / 100,
    });
  }
  return {
    factorId: ft.id,
    factorName: ft.factorName,
    currentExposure: Math.round(current * 10) / 10,
    targetExposure: Math.round(target * 10) / 10,
    delta: Math.round((target - current) * 10) / 10,
    rebalanceAction: target > current ? `Increase ${ft.factorName} exposure by ${Math.round((target - current) * 10) / 10}%` : target < current ? `Decrease ${ft.factorName} exposure by ${Math.round((current - target) * 10) / 10}%` : 'Hold current position',
    costToRebalance: Math.round(Math.abs(target - current) * 15),
    monthlyReturns: months,
  };
});

const timingHistory: TimingHistory[] = [
  { month: '2024-05', scarcityReturn: 3.2, narrativeReturn: 1.5, gradeReturn: -0.8, vintageReturn: 2.1, seasonalReturn: 4.5, momentumReturn: 1.8, totalReturn: 12.3, benchmark: 5.2 },
  { month: '2024-06', scarcityReturn: 2.8, narrativeReturn: 2.2, gradeReturn: 0.5, vintageReturn: 1.8, seasonalReturn: 3.8, momentumReturn: 2.1, totalReturn: 13.2, benchmark: 4.8 },
  { month: '2024-07', scarcityReturn: 1.5, narrativeReturn: 3.1, gradeReturn: -1.2, vintageReturn: 2.5, seasonalReturn: -0.5, momentumReturn: 1.2, totalReturn: 6.6, benchmark: 3.5 },
  { month: '2024-08', scarcityReturn: 4.1, narrativeReturn: -0.5, gradeReturn: 1.8, vintageReturn: 1.2, seasonalReturn: 5.2, momentumReturn: 3.5, totalReturn: 15.3, benchmark: 6.1 },
  { month: '2024-09', scarcityReturn: 2.5, narrativeReturn: 1.8, gradeReturn: -0.3, vintageReturn: 3.2, seasonalReturn: 4.1, momentumReturn: 2.8, totalReturn: 14.1, benchmark: 5.5 },
  { month: '2024-10', scarcityReturn: 3.8, narrativeReturn: 2.5, gradeReturn: 0.2, vintageReturn: 2.8, seasonalReturn: 1.5, momentumReturn: 1.5, totalReturn: 12.3, benchmark: 4.2 },
  { month: '2024-11', scarcityReturn: 1.2, narrativeReturn: 4.2, gradeReturn: -1.5, vintageReturn: 1.5, seasonalReturn: -1.2, momentumReturn: 3.8, totalReturn: 8.0, benchmark: 3.8 },
  { month: '2024-12', scarcityReturn: 5.5, narrativeReturn: 1.2, gradeReturn: 2.1, vintageReturn: 3.5, seasonalReturn: 2.8, momentumReturn: 0.5, totalReturn: 15.6, benchmark: 7.2 },
  { month: '2025-01', scarcityReturn: 2.2, narrativeReturn: 2.8, gradeReturn: -0.5, vintageReturn: 4.1, seasonalReturn: 3.5, momentumReturn: 2.2, totalReturn: 14.3, benchmark: 5.8 },
  { month: '2025-02', scarcityReturn: 3.5, narrativeReturn: 1.5, gradeReturn: 0.8, vintageReturn: 2.2, seasonalReturn: 1.8, momentumReturn: 3.1, totalReturn: 12.9, benchmark: 4.5 },
  { month: '2025-03', scarcityReturn: 4.2, narrativeReturn: 3.2, gradeReturn: -2.1, vintageReturn: 3.8, seasonalReturn: 5.5, momentumReturn: 1.8, totalReturn: 16.4, benchmark: 6.5 },
  { month: '2025-04', scarcityReturn: 2.8, narrativeReturn: 0.8, gradeReturn: 1.2, vintageReturn: 2.5, seasonalReturn: 4.8, momentumReturn: 2.5, totalReturn: 14.6, benchmark: 5.1 },
  { month: '2025-05', scarcityReturn: 3.1, narrativeReturn: 2.1, gradeReturn: -0.2, vintageReturn: 1.8, seasonalReturn: 3.2, momentumReturn: 1.5, totalReturn: 11.5, benchmark: 4.8 },
  { month: '2025-06', scarcityReturn: 1.8, narrativeReturn: 3.5, gradeReturn: 0.5, vintageReturn: 2.8, seasonalReturn: 2.5, momentumReturn: 2.8, totalReturn: 13.9, benchmark: 5.2 },
  { month: '2025-07', scarcityReturn: 4.5, narrativeReturn: 1.2, gradeReturn: -1.8, vintageReturn: 3.5, seasonalReturn: -0.8, momentumReturn: 3.2, totalReturn: 9.8, benchmark: 3.2 },
  { month: '2025-08', scarcityReturn: 2.5, narrativeReturn: 2.8, gradeReturn: 1.5, vintageReturn: 1.5, seasonalReturn: 5.8, momentumReturn: 1.2, totalReturn: 15.3, benchmark: 6.8 },
  { month: '2025-09', scarcityReturn: 3.8, narrativeReturn: 1.5, gradeReturn: -0.8, vintageReturn: 4.2, seasonalReturn: 4.2, momentumReturn: 2.5, totalReturn: 15.4, benchmark: 5.5 },
  { month: '2025-10', scarcityReturn: 2.2, narrativeReturn: 3.8, gradeReturn: 0.2, vintageReturn: 2.1, seasonalReturn: 1.2, momentumReturn: 3.5, totalReturn: 13.0, benchmark: 4.8 },
  { month: '2025-11', scarcityReturn: 5.1, narrativeReturn: 0.5, gradeReturn: -2.5, vintageReturn: 3.2, seasonalReturn: -1.5, momentumReturn: 2.8, totalReturn: 7.6, benchmark: 2.5 },
  { month: '2025-12', scarcityReturn: 3.5, narrativeReturn: 2.5, gradeReturn: 1.8, vintageReturn: 4.5, seasonalReturn: 3.5, momentumReturn: 0.8, totalReturn: 16.6, benchmark: 7.5 },
  { month: '2026-01', scarcityReturn: 2.8, narrativeReturn: 1.8, gradeReturn: -0.5, vintageReturn: 3.8, seasonalReturn: 2.8, momentumReturn: 2.2, totalReturn: 12.9, benchmark: 5.2 },
  { month: '2026-02', scarcityReturn: 4.2, narrativeReturn: 2.2, gradeReturn: 0.8, vintageReturn: 2.5, seasonalReturn: 1.5, momentumReturn: 3.5, totalReturn: 14.7, benchmark: 5.8 },
  { month: '2026-03', scarcityReturn: 3.5, narrativeReturn: 3.5, gradeReturn: -1.2, vintageReturn: 3.2, seasonalReturn: 4.5, momentumReturn: 1.8, totalReturn: 15.3, benchmark: 6.2 },
  { month: '2026-04', scarcityReturn: 2.5, narrativeReturn: 1.2, gradeReturn: 0.5, vintageReturn: 2.8, seasonalReturn: 5.2, momentumReturn: 2.1, totalReturn: 14.3, benchmark: 5.5 },
];

export function getFactorTimings(): FactorTiming[] { return factorTimings; }
export function getTimingSignals(): TimingSignal[] { return timingSignals; }
export function getFactorExposures(): FactorExposure[] { return factorExposures; }
export function getTimingHistory(): TimingHistory[] { return timingHistory; }
export function getOverweightFactors(): number { return factorTimings.filter(f => f.currentSignal === 'overweight').length; }
export function getAvgExpectedReturn(): number { return Math.round(factorTimings.reduce((s, f) => s + f.expectedReturn, 0) / factorTimings.length * 10) / 10; }
export function getAvgConfidence(): number { return Math.round(factorTimings.reduce((s, f) => s + f.confidence, 0) / factorTimings.length); }
export function getCumulativeAlpha(): number { return Math.round(timingHistory.reduce((s, h) => s + (h.totalReturn - h.benchmark), 0) * 10) / 10; }
