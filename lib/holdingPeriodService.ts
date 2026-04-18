// ─────────────────────────────────────────────────────────────────────────────
// Holding Period Optimizer Service
// Analyzes optimal hold durations, return curves, and timing windows for cards
// ─────────────────────────────────────────────────────────────────────────────

export interface HoldingAnalysis {
  id: string;
  cardName: string;
  category: string;
  acquisitionDate: string;
  currentHoldDays: number;
  optimalHoldDays: number;
  currentReturn: number;
  projectedOptimalReturn: number;
  holdEfficiency: number;
  recommendation: 'hold' | 'sell' | 'extend' | 'at-optimal';
  riskOfOverholding: number;
}

export interface ReturnCurve {
  period: string;
  avgReturn: number;
  medianReturn: number;
  bestCase: number;
  worstCase: number;
  sharpe: number;
  winRate: number;
}

export interface OptimalWindow {
  id: string;
  segment: string;
  optimalEntryMonth: string;
  optimalExitMonth: string;
  avgHoldMonths: number;
  expectedReturn: number;
  confidence: number;
  sampleSize: number;
  currentPhase: 'entry-window' | 'hold-phase' | 'exit-window' | 'off-cycle';
}

export interface HoldingComparison {
  id: string;
  strategy: string;
  avgHoldPeriod: string;
  totalReturn: number;
  annualizedReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
}

const holdingAnalyses: HoldingAnalysis[] = [
  { id: 'HA-01', cardName: '2024 Bowman Chrome 1st Auto Felnin Celesten', category: 'Prospect Auto', acquisitionDate: '2024-08-15', currentHoldDays: 245, optimalHoldDays: 365, currentReturn: 18.5, projectedOptimalReturn: 42.0, holdEfficiency: 67, recommendation: 'hold', riskOfOverholding: 12 },
  { id: 'HA-02', cardName: '2023 Topps Chrome Sapphire Elly De La Cruz RC', category: 'Rookie Chrome', acquisitionDate: '2023-11-02', currentHoldDays: 532, optimalHoldDays: 540, currentReturn: 85.2, projectedOptimalReturn: 88.0, holdEfficiency: 97, recommendation: 'at-optimal', riskOfOverholding: 45 },
  { id: 'HA-03', cardName: '2024 Prizm Draft Caleb Williams RC Auto', category: 'Football RC Auto', acquisitionDate: '2024-05-20', currentHoldDays: 333, optimalHoldDays: 270, currentReturn: 22.0, projectedOptimalReturn: 35.0, holdEfficiency: 63, recommendation: 'sell', riskOfOverholding: 72 },
  { id: 'HA-04', cardName: '2022 Panini Flawless Wemby Logoman 1/1', category: 'Ultra Premium', acquisitionDate: '2023-01-10', currentHoldDays: 829, optimalHoldDays: 1095, currentReturn: 145.0, projectedOptimalReturn: 210.0, holdEfficiency: 69, recommendation: 'hold', riskOfOverholding: 8 },
  { id: 'HA-05', cardName: '2024 Topps Series 1 Paul Skenes RC', category: 'Base Rookie', acquisitionDate: '2024-12-01', currentHoldDays: 138, optimalHoldDays: 450, currentReturn: 5.2, projectedOptimalReturn: 28.0, holdEfficiency: 31, recommendation: 'hold', riskOfOverholding: 5 },
  { id: 'HA-06', cardName: '2023 Bowman Chrome Shohei Ohtani Refractor', category: 'Veteran Chrome', acquisitionDate: '2023-06-15', currentHoldDays: 672, optimalHoldDays: 365, currentReturn: 32.0, projectedOptimalReturn: 55.0, holdEfficiency: 58, recommendation: 'sell', riskOfOverholding: 82 },
  { id: 'HA-07', cardName: '2024 Donruss Optic Jayden Daniels RC Auto', category: 'Football RC Auto', acquisitionDate: '2024-09-10', currentHoldDays: 220, optimalHoldDays: 540, currentReturn: 14.8, projectedOptimalReturn: 52.0, holdEfficiency: 28, recommendation: 'extend', riskOfOverholding: 3 },
  { id: 'HA-08', cardName: '2020 Bowman Chrome Sapphire Jasson Dominguez Auto', category: 'Prospect Auto', acquisitionDate: '2021-03-20', currentHoldDays: 1855, optimalHoldDays: 730, currentReturn: -18.5, projectedOptimalReturn: 65.0, holdEfficiency: 0, recommendation: 'sell', riskOfOverholding: 95 },
  { id: 'HA-09', cardName: '2024 Select Concourse Caitlin Clark RC', category: 'WNBA Rookie', acquisitionDate: '2024-10-05', currentHoldDays: 195, optimalHoldDays: 365, currentReturn: 38.0, projectedOptimalReturn: 60.0, holdEfficiency: 53, recommendation: 'hold', riskOfOverholding: 10 },
  { id: 'HA-10', cardName: '2023 Topps Chrome Black Gold Refractor Acuna Jr', category: 'Veteran Chrome', acquisitionDate: '2023-09-01', currentHoldDays: 595, optimalHoldDays: 540, currentReturn: 28.5, projectedOptimalReturn: 30.0, holdEfficiency: 95, recommendation: 'at-optimal', riskOfOverholding: 55 },
];

const returnCurves: ReturnCurve[] = [
  { period: '30d', avgReturn: 3.2, medianReturn: 1.8, bestCase: 45.0, worstCase: -22.0, sharpe: 0.35, winRate: 52 },
  { period: '90d', avgReturn: 8.5, medianReturn: 6.2, bestCase: 85.0, worstCase: -35.0, sharpe: 0.58, winRate: 58 },
  { period: '6m', avgReturn: 15.8, medianReturn: 12.0, bestCase: 120.0, worstCase: -40.0, sharpe: 0.72, winRate: 62 },
  { period: '1y', avgReturn: 24.5, medianReturn: 18.5, bestCase: 210.0, worstCase: -45.0, sharpe: 0.88, winRate: 66 },
  { period: '2y', avgReturn: 35.0, medianReturn: 22.0, bestCase: 350.0, worstCase: -55.0, sharpe: 0.82, winRate: 64 },
  { period: '5y', avgReturn: 55.0, medianReturn: 30.0, bestCase: 800.0, worstCase: -70.0, sharpe: 0.68, winRate: 60 },
];

const optimalWindows: OptimalWindow[] = [
  { id: 'OW-01', segment: 'Baseball Prospect Autos', optimalEntryMonth: 'January', optimalExitMonth: 'July', avgHoldMonths: 6, expectedReturn: 42.5, confidence: 78, sampleSize: 1240, currentPhase: 'hold-phase' },
  { id: 'OW-02', segment: 'Football RC Autos', optimalEntryMonth: 'March', optimalExitMonth: 'November', avgHoldMonths: 8, expectedReturn: 55.0, confidence: 82, sampleSize: 890, currentPhase: 'exit-window' },
  { id: 'OW-03', segment: 'Basketball Chrome RCs', optimalEntryMonth: 'July', optimalExitMonth: 'February', avgHoldMonths: 7, expectedReturn: 38.0, confidence: 71, sampleSize: 1560, currentPhase: 'off-cycle' },
  { id: 'OW-04', segment: 'Vintage Pre-War (<1940)', optimalEntryMonth: 'November', optimalExitMonth: 'April', avgHoldMonths: 18, expectedReturn: 22.0, confidence: 85, sampleSize: 420, currentPhase: 'exit-window' },
  { id: 'OW-05', segment: 'Modern Ultra Premium (1/1)', optimalEntryMonth: 'September', optimalExitMonth: 'March', avgHoldMonths: 12, expectedReturn: 65.0, confidence: 68, sampleSize: 180, currentPhase: 'hold-phase' },
  { id: 'OW-06', segment: 'Bowman 1st Chrome Refractors', optimalEntryMonth: 'February', optimalExitMonth: 'August', avgHoldMonths: 6, expectedReturn: 48.0, confidence: 75, sampleSize: 2100, currentPhase: 'entry-window' },
  { id: 'OW-07', segment: 'WNBA / Womens Sports RCs', optimalEntryMonth: 'April', optimalExitMonth: 'October', avgHoldMonths: 6, expectedReturn: 35.0, confidence: 62, sampleSize: 340, currentPhase: 'entry-window' },
  { id: 'OW-08', segment: 'Graded Vintage HOF (PSA 7+)', optimalEntryMonth: 'October', optimalExitMonth: 'May', avgHoldMonths: 24, expectedReturn: 18.5, confidence: 88, sampleSize: 750, currentPhase: 'hold-phase' },
];

const holdingComparisons: HoldingComparison[] = [
  { id: 'HC-01', strategy: 'Flip (<30d)', avgHoldPeriod: '14 days', totalReturn: 125.0, annualizedReturn: 42.0, maxDrawdown: -18.5, sharpeRatio: 0.45, winRate: 54 },
  { id: 'HC-02', strategy: 'Short-Term (1-6m)', avgHoldPeriod: '3.5 months', totalReturn: 210.0, annualizedReturn: 38.5, maxDrawdown: -25.0, sharpeRatio: 0.72, winRate: 61 },
  { id: 'HC-03', strategy: 'Medium (6-18m)', avgHoldPeriod: '11 months', totalReturn: 345.0, annualizedReturn: 32.0, maxDrawdown: -32.0, sharpeRatio: 0.88, winRate: 66 },
  { id: 'HC-04', strategy: 'Long-Term (18m-5y)', avgHoldPeriod: '2.8 years', totalReturn: 580.0, annualizedReturn: 28.5, maxDrawdown: -42.0, sharpeRatio: 0.95, winRate: 72 },
  { id: 'HC-05', strategy: 'Ultra-Long (5y+)', avgHoldPeriod: '7.2 years', totalReturn: 920.0, annualizedReturn: 22.0, maxDrawdown: -55.0, sharpeRatio: 0.78, winRate: 68 },
];

export function getHoldingAnalyses(): HoldingAnalysis[] { return holdingAnalyses; }
export function getReturnCurves(): ReturnCurve[] { return returnCurves; }
export function getOptimalWindows(): OptimalWindow[] { return optimalWindows; }
export function getHoldingComparisons(): HoldingComparison[] { return holdingComparisons; }

export function getHoldingSummary(): {
  avgHoldEfficiency: number;
  cardsAtOptimal: number;
  avgOptimalHold: string;
  bestStrategyReturn: number;
} {
  const avgHoldEfficiency = Math.round(
    holdingAnalyses.reduce((s, h) => s + h.holdEfficiency, 0) / holdingAnalyses.length
  );
  const cardsAtOptimal = holdingAnalyses.filter(h => h.recommendation === 'at-optimal').length;
  const avgDays = Math.round(
    holdingAnalyses.reduce((s, h) => s + h.optimalHoldDays, 0) / holdingAnalyses.length
  );
  const avgMonths = Math.round(avgDays / 30);
  const avgOptimalHold = avgMonths >= 12
    ? `${(avgMonths / 12).toFixed(1)}y`
    : `${avgMonths}m`;
  const bestStrategyReturn = Math.max(...holdingComparisons.map(c => c.annualizedReturn));

  return { avgHoldEfficiency, cardsAtOptimal, avgOptimalHold, bestStrategyReturn };
}
