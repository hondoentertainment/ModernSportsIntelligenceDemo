// ---- Types ----

export interface InformationRatio {
  id: string;
  portfolioName: string;
  benchmarkName: string;
  ir: number;
  alpha: number;
  trackingError: number;
  period: string;
  annualized: boolean;
  interpretation: string;
}

export interface BenchmarkComparison {
  id: string;
  benchmarkName: string;
  benchmarkDescription: string;
  benchmarkReturn: number;
  portfolioReturn: number;
  excessReturn: number;
  trackingError: number;
  ir: number;
  correlation: number;
  beta: number;
  color: string;
}

export interface AlphaDecomposition {
  source: string;
  contribution: number;
  percentage: number;
  description: string;
  trend: 'improving' | 'declining' | 'stable';
}

export interface RatioHistory {
  month: string;
  ir: number;
  alpha: number;
  trackingError: number;
  portfolioReturn: number;
  benchmarkReturn: number;
  excessReturn: number;
  rollingIR3m: number;
  rollingIR6m: number;
}

// ---- Mock Data ----

const mockBenchmarkComparisons: BenchmarkComparison[] = [
  { id: 'bc-1', benchmarkName: 'Sports Card 500 Index', benchmarkDescription: 'Broad market index of top 500 most liquid sports cards', benchmarkReturn: 8.4, portfolioReturn: 14.2, excessReturn: 5.8, trackingError: 6.2, ir: 0.94, correlation: 0.82, beta: 1.12, color: '#3b82f6' },
  { id: 'bc-2', benchmarkName: 'Rookie Card Index', benchmarkDescription: 'Index tracking first-year player cards across all sports', benchmarkReturn: 12.8, portfolioReturn: 14.2, excessReturn: 1.4, trackingError: 8.5, ir: 0.16, correlation: 0.74, beta: 0.92, color: '#22c55e' },
  { id: 'bc-3', benchmarkName: 'Vintage Card Index', benchmarkDescription: 'Pre-1980 cards graded PSA 7 and above', benchmarkReturn: 4.2, portfolioReturn: 14.2, excessReturn: 10.0, trackingError: 12.4, ir: 0.81, correlation: 0.45, beta: 0.58, color: '#f59e0b' },
  { id: 'bc-4', benchmarkName: 'PSA 10 Modern Index', benchmarkDescription: 'Gem mint modern cards from 2015 to present', benchmarkReturn: 10.5, portfolioReturn: 14.2, excessReturn: 3.7, trackingError: 5.8, ir: 0.64, correlation: 0.88, beta: 1.05, color: '#a855f7' },
  { id: 'bc-5', benchmarkName: 'Basketball Card Index', benchmarkDescription: 'All-sport basketball card market tracker', benchmarkReturn: 11.2, portfolioReturn: 14.2, excessReturn: 3.0, trackingError: 7.1, ir: 0.42, correlation: 0.78, beta: 0.95, color: '#ef4444' },
  { id: 'bc-6', benchmarkName: 'Baseball Card Index', benchmarkDescription: 'All-sport baseball card market tracker', benchmarkReturn: 6.8, portfolioReturn: 14.2, excessReturn: 7.4, trackingError: 9.2, ir: 0.80, correlation: 0.62, beta: 0.78, color: '#06b6d4' },
];

const mockAlphaDecomposition: AlphaDecomposition[] = [
  { source: 'Card Selection', contribution: 3.2, percentage: 38.1, description: 'Alpha from picking outperforming individual cards', trend: 'improving' },
  { source: 'Sport Rotation', contribution: 1.8, percentage: 21.4, description: 'Alpha from rotating between sports based on seasonal cycles', trend: 'stable' },
  { source: 'Grade Arbitrage', contribution: 1.4, percentage: 16.7, description: 'Alpha from exploiting mispricing between grade tiers', trend: 'improving' },
  { source: 'Timing', contribution: 0.9, percentage: 10.7, description: 'Alpha from market entry and exit timing decisions', trend: 'declining' },
  { source: 'Regime Adaptation', contribution: 0.7, percentage: 8.3, description: 'Alpha from adjusting strategy to market regime changes', trend: 'improving' },
  { source: 'Scarcity Premium', contribution: 0.4, percentage: 4.8, description: 'Alpha from identifying underpriced scarce cards', trend: 'stable' },
];

const mockRatioHistory: RatioHistory[] = [
  { month: '2024-05', ir: 0.42, alpha: 2.1, trackingError: 5.0, portfolioReturn: -4.1, benchmarkReturn: -6.2, excessReturn: 2.1, rollingIR3m: 0.38, rollingIR6m: 0.35 },
  { month: '2024-06', ir: 0.55, alpha: 3.3, trackingError: 6.0, portfolioReturn: -1.5, benchmarkReturn: -4.8, excessReturn: 3.3, rollingIR3m: 0.45, rollingIR6m: 0.38 },
  { month: '2024-07', ir: 0.62, alpha: 3.3, trackingError: 5.3, portfolioReturn: 0.2, benchmarkReturn: -3.1, excessReturn: 3.3, rollingIR3m: 0.53, rollingIR6m: 0.42 },
  { month: '2024-08', ir: 0.71, alpha: 3.6, trackingError: 5.1, portfolioReturn: 4.8, benchmarkReturn: 1.2, excessReturn: 3.6, rollingIR3m: 0.63, rollingIR6m: 0.48 },
  { month: '2024-09', ir: 0.68, alpha: 3.7, trackingError: 5.4, portfolioReturn: 3.2, benchmarkReturn: -0.5, excessReturn: 3.7, rollingIR3m: 0.67, rollingIR6m: 0.55 },
  { month: '2024-10', ir: 0.74, alpha: 4.1, trackingError: 5.5, portfolioReturn: 4.9, benchmarkReturn: 0.8, excessReturn: 4.1, rollingIR3m: 0.71, rollingIR6m: 0.60 },
  { month: '2024-11', ir: 0.82, alpha: 4.8, trackingError: 5.9, portfolioReturn: 10.2, benchmarkReturn: 5.4, excessReturn: 4.8, rollingIR3m: 0.75, rollingIR6m: 0.65 },
  { month: '2024-12', ir: 0.78, alpha: 4.7, trackingError: 6.0, portfolioReturn: 12.8, benchmarkReturn: 8.1, excessReturn: 4.7, rollingIR3m: 0.78, rollingIR6m: 0.70 },
  { month: '2025-01', ir: 0.85, alpha: 5.1, trackingError: 6.0, portfolioReturn: 11.8, benchmarkReturn: 6.7, excessReturn: 5.1, rollingIR3m: 0.82, rollingIR6m: 0.74 },
  { month: '2025-02', ir: 0.88, alpha: 5.3, trackingError: 6.0, portfolioReturn: 9.5, benchmarkReturn: 4.2, excessReturn: 5.3, rollingIR3m: 0.84, rollingIR6m: 0.78 },
  { month: '2025-03', ir: 0.86, alpha: 5.1, trackingError: 5.9, portfolioReturn: 8.9, benchmarkReturn: 3.8, excessReturn: 5.1, rollingIR3m: 0.86, rollingIR6m: 0.80 },
  { month: '2025-04', ir: 0.72, alpha: 3.5, trackingError: 4.9, portfolioReturn: -0.7, benchmarkReturn: -2.1, excessReturn: 1.4, rollingIR3m: 0.82, rollingIR6m: 0.82 },
  { month: '2025-05', ir: 0.65, alpha: 3.8, trackingError: 5.8, portfolioReturn: 8.4, benchmarkReturn: 4.6, excessReturn: 3.8, rollingIR3m: 0.74, rollingIR6m: 0.80 },
  { month: '2025-06', ir: 0.58, alpha: 3.8, trackingError: 6.6, portfolioReturn: -3.4, benchmarkReturn: -7.2, excessReturn: 3.8, rollingIR3m: 0.65, rollingIR6m: 0.76 },
  { month: '2025-07', ir: 0.62, alpha: 3.4, trackingError: 5.5, portfolioReturn: -2.1, benchmarkReturn: -5.5, excessReturn: 3.4, rollingIR3m: 0.62, rollingIR6m: 0.72 },
  { month: '2025-08', ir: 0.68, alpha: 2.9, trackingError: 4.3, portfolioReturn: -0.9, benchmarkReturn: -3.8, excessReturn: 2.9, rollingIR3m: 0.63, rollingIR6m: 0.68 },
  { month: '2025-09', ir: 0.75, alpha: 3.7, trackingError: 4.9, portfolioReturn: 4.2, benchmarkReturn: -1.2, excessReturn: 5.4, rollingIR3m: 0.68, rollingIR6m: 0.65 },
  { month: '2025-10', ir: 0.80, alpha: 4.5, trackingError: 5.6, portfolioReturn: 6.4, benchmarkReturn: 0.4, excessReturn: 6.0, rollingIR3m: 0.74, rollingIR6m: 0.68 },
  { month: '2025-11', ir: 0.84, alpha: 4.5, trackingError: 5.4, portfolioReturn: 7.1, benchmarkReturn: 1.1, excessReturn: 6.0, rollingIR3m: 0.80, rollingIR6m: 0.72 },
  { month: '2025-12', ir: 0.88, alpha: 5.3, trackingError: 6.0, portfolioReturn: 9.8, benchmarkReturn: 3.2, excessReturn: 6.6, rollingIR3m: 0.84, rollingIR6m: 0.76 },
  { month: '2026-01', ir: 0.91, alpha: 5.8, trackingError: 6.4, portfolioReturn: 13.4, benchmarkReturn: 5.8, excessReturn: 7.6, rollingIR3m: 0.88, rollingIR6m: 0.82 },
  { month: '2026-02', ir: 0.93, alpha: 5.7, trackingError: 6.1, portfolioReturn: 14.8, benchmarkReturn: 7.4, excessReturn: 7.4, rollingIR3m: 0.91, rollingIR6m: 0.86 },
  { month: '2026-03', ir: 0.92, alpha: 5.2, trackingError: 5.7, portfolioReturn: 13.5, benchmarkReturn: 6.1, excessReturn: 7.4, rollingIR3m: 0.92, rollingIR6m: 0.89 },
  { month: '2026-04', ir: 0.94, alpha: 5.8, trackingError: 6.2, portfolioReturn: 11.6, benchmarkReturn: 4.9, excessReturn: 6.7, rollingIR3m: 0.93, rollingIR6m: 0.91 },
];

// ---- Getter Functions ----

export function getBenchmarkComparisons(): BenchmarkComparison[] {
  return mockBenchmarkComparisons;
}

export function getAlphaDecomposition(): AlphaDecomposition[] {
  return mockAlphaDecomposition;
}

export function getRatioHistory(): RatioHistory[] {
  return mockRatioHistory;
}

export function getCurrentIR(): InformationRatio {
  return {
    id: 'ir-current',
    portfolioName: 'MSI Core Portfolio',
    benchmarkName: 'Sports Card 500 Index',
    ir: 0.94,
    alpha: 5.8,
    trackingError: 6.2,
    period: 'Trailing 12 months',
    annualized: true,
    interpretation: 'Exceptional risk-adjusted alpha generation vs broad market',
  };
}

export function getTotalAlpha(): number {
  return mockAlphaDecomposition.reduce((s, a) => s + a.contribution, 0);
}

export function getBestBenchmarkFit(): BenchmarkComparison {
  return mockBenchmarkComparisons.reduce((best, bc) => bc.ir > best.ir ? bc : best, mockBenchmarkComparisons[0]);
}
