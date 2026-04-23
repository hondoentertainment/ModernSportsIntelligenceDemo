// @ts-nocheck
// ---- Types ----

export interface TimeSeriesPoint {
  date: string;
  value: number;
  benchmark: number;
}

export interface HistoricalPrice {
  date: string;
  price: number;
  volume: number;
  grade: string;
}

export interface PhantomPosition {
  player: string;
  year: number;
  set: string;
  quantity: number;
  grade: string;
  entryPrice?: number;
}

export interface BacktestConfig {
  startDate: string;
  endDate: string;
  initialCapital: number;
  positions: PhantomPosition[];
  rebalanceFrequency: 'monthly' | 'quarterly' | 'annually' | 'none';
  transactionCostPct: number;
  gradingFees: number;
  holdingCosts: number;
  benchmark: 'sp500' | 'rookie_index' | 'vintage_index' | 'modern_index';
}

export interface BacktestTrade {
  id: string;
  date: string;
  player: string;
  action: 'buy' | 'sell' | 'rebalance';
  quantity: number;
  price: number;
  fees: number;
  pnl: number;
}

export interface DrawdownEvent {
  startDate: string;
  endDate: string;
  peak: number;
  trough: number;
  drawdownPct: number;
  recovered: boolean;
  recoveryDate?: string;
}

export interface PortfolioSnapshot {
  date: string;
  totalValue: number;
  cashBalance: number;
  positions: { player: string; value: number; weight: number }[];
  dayReturn: number;
  cumReturn: number;
}

export interface BacktestMetrics {
  totalReturn: number;
  annualizedReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  sortinoRatio: number;
  volatility: number;
  winRate: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  calmarRatio: number;
}

export interface BenchmarkComparison {
  portfolioIds: string[];
  portfolioNames: string[];
  returns: number[];
  sharpeRatios: number[];
  maxDrawdowns: number[];
  alphas: number[];
  timeline: { date: string; values: number[] }[];
}

export interface BacktestResult {
  config: BacktestConfig;
  finalValue: number;
  totalReturn: number;
  annualizedReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
  avgHoldPeriod: number;
  bestTrade: BacktestTrade;
  worstTrade: BacktestTrade;
  timeline: TimeSeriesPoint[];
  trades: BacktestTrade[];
  snapshots: PortfolioSnapshot[];
  benchmarkReturn: number;
  alpha: number;
  beta: number;
  volatility: number;
  drawdowns: DrawdownEvent[];
  monthlyReturns: { month: string; return: number }[];
  metrics: BacktestMetrics;
}

export interface PhantomPortfolio {
  id: string;
  name: string;
  config: BacktestConfig;
  result: BacktestResult | null;
  createdAt: string;
  status: 'running' | 'completed' | 'failed';
}

export interface PhantomStrategy {
  id: string;
  name: string;
  description: string;
  config: BacktestConfig;
  icon: string;
  category: 'nfl' | 'nba' | 'mlb' | 'vintage' | 'modern';
  expectedReturn?: number;
}

export interface BacktestScenario {
  id: string;
  name: string;
  basePortfolioId: string;
  changes: Record<string, any>;
  result: BacktestResult | null;
}

export interface WhatIfResult {
  originalReturn: number;
  modifiedReturn: number;
  difference: number;
  modifiedTimeline: TimeSeriesPoint[];
  explanation: string;
}

// ---- Mock Historical Price Data ----

const PLAYER_PRICE_HISTORIES: Record<string, { basePrice: number; monthlyMultipliers: number[] }> = {
  'Patrick Mahomes': { basePrice: 8500, monthlyMultipliers: [1.0, 1.05, 1.12, 1.08, 1.15, 1.22, 1.35, 1.28, 1.42, 1.55, 1.48, 1.62, 1.58, 1.72, 1.68, 1.85, 1.92, 2.05, 1.95, 2.12, 2.25, 2.18, 2.35, 2.42, 2.55, 2.48, 2.62, 2.75, 2.68, 2.85, 2.92, 3.05, 2.95, 3.12, 3.25, 3.18, 3.35, 3.42, 3.55, 3.48, 3.62, 3.75, 3.68, 3.85, 3.92, 4.05, 3.95, 4.12, 4.25, 4.18, 4.35, 4.42, 4.55, 4.48, 4.62, 4.75, 4.68, 4.85, 4.92, 5.05] },
  'Josh Allen': { basePrice: 3200, monthlyMultipliers: [1.0, 0.95, 1.02, 1.08, 1.15, 1.22, 1.35, 1.42, 1.55, 1.48, 1.65, 1.72, 1.85, 1.78, 1.92, 2.05, 2.15, 2.25, 2.18, 2.35, 2.42, 2.55, 2.48, 2.65, 2.72, 2.85, 2.78, 2.95, 3.05, 3.15, 3.08, 3.25, 3.32, 3.45, 3.38, 3.55, 3.62, 3.75, 3.68, 3.85, 3.92, 4.05, 3.98, 4.15, 4.22, 4.35, 4.28, 4.45, 4.52, 4.65, 4.58, 4.75, 4.82, 4.95, 4.88, 5.05, 5.12, 5.25, 5.18, 5.35] },
  'Lamar Jackson': { basePrice: 2800, monthlyMultipliers: [1.0, 1.12, 1.25, 1.45, 1.62, 1.55, 1.42, 1.35, 1.48, 1.55, 1.68, 1.75, 1.62, 1.55, 1.48, 1.42, 1.55, 1.68, 1.85, 1.92, 2.05, 1.95, 1.88, 1.82, 1.95, 2.08, 2.15, 2.25, 2.18, 2.35, 2.42, 2.55, 2.48, 2.65, 2.72, 2.85, 2.78, 2.95, 3.02, 3.15, 3.08, 3.25, 3.32, 3.45, 3.38, 3.55, 3.62, 3.75, 3.68, 3.85, 3.92, 4.05, 3.98, 4.15, 4.22, 4.35, 4.28, 4.45, 4.52, 4.65] },
  'Saquon Barkley': { basePrice: 4500, monthlyMultipliers: [1.0, 1.08, 1.15, 1.22, 1.35, 1.28, 1.15, 1.05, 0.95, 0.88, 0.82, 0.78, 0.72, 0.68, 0.75, 0.82, 0.88, 0.95, 0.88, 0.82, 0.78, 0.85, 0.92, 0.98, 1.05, 1.12, 1.18, 1.25, 1.32, 1.38, 1.28, 1.22, 1.15, 1.08, 1.02, 0.98, 1.05, 1.12, 1.18, 1.25, 1.32, 1.45, 1.52, 1.65, 1.72, 1.85, 1.78, 1.72, 1.65, 1.58, 1.52, 1.48, 1.55, 1.62, 1.68, 1.75, 1.82, 1.88, 1.95, 2.02] },
  'Baker Mayfield': { basePrice: 3800, monthlyMultipliers: [1.0, 1.05, 1.12, 1.08, 0.95, 0.85, 0.78, 0.72, 0.65, 0.58, 0.52, 0.48, 0.45, 0.42, 0.38, 0.35, 0.32, 0.35, 0.38, 0.42, 0.45, 0.42, 0.38, 0.35, 0.32, 0.28, 0.25, 0.28, 0.32, 0.35, 0.38, 0.42, 0.45, 0.48, 0.52, 0.55, 0.58, 0.62, 0.65, 0.68, 0.72, 0.78, 0.82, 0.88, 0.92, 0.95, 0.88, 0.82, 0.78, 0.75, 0.72, 0.68, 0.65, 0.62, 0.58, 0.55, 0.52, 0.48, 0.45, 0.42] },
  'Luka Doncic': { basePrice: 5500, monthlyMultipliers: [1.0, 1.08, 1.18, 1.28, 1.42, 1.55, 1.68, 1.75, 1.85, 1.95, 2.08, 2.22, 2.35, 2.28, 2.42, 2.55, 2.68, 2.82, 2.95, 3.08, 3.22, 3.15, 3.28, 3.42, 3.55, 3.68, 3.82, 3.95, 4.08, 4.22, 4.35, 4.48, 4.62, 4.75, 4.88, 5.02, 5.15, 5.28, 5.42, 5.55, 5.68, 5.82, 5.95, 6.08, 6.22, 6.35, 6.48, 6.62, 6.75, 6.88, 7.02, 7.15, 7.28, 7.42, 7.55, 7.68, 7.82, 7.95, 8.08, 8.22] },
  'Trae Young': { basePrice: 2200, monthlyMultipliers: [1.0, 1.05, 1.12, 1.22, 1.35, 1.28, 1.42, 1.35, 1.22, 1.15, 1.08, 1.15, 1.22, 1.28, 1.35, 1.42, 1.48, 1.55, 1.48, 1.42, 1.35, 1.42, 1.48, 1.55, 1.62, 1.55, 1.48, 1.42, 1.48, 1.55, 1.62, 1.68, 1.62, 1.55, 1.48, 1.55, 1.62, 1.68, 1.75, 1.68, 1.62, 1.55, 1.62, 1.68, 1.75, 1.82, 1.88, 1.95, 1.88, 1.82, 1.75, 1.82, 1.88, 1.95, 2.02, 2.08, 2.15, 2.22, 2.28, 2.35] },
  'Ja Morant': { basePrice: 1800, monthlyMultipliers: [1.0, 1.15, 1.32, 1.48, 1.65, 1.82, 2.05, 2.25, 2.45, 2.65, 2.85, 3.05, 3.25, 3.15, 3.05, 2.85, 2.65, 2.45, 2.25, 2.05, 1.85, 1.65, 1.55, 1.48, 1.42, 1.35, 1.28, 1.35, 1.42, 1.55, 1.68, 1.75, 1.82, 1.88, 1.95, 2.02, 2.08, 2.15, 2.22, 2.28, 2.35, 2.42, 2.48, 2.55, 2.62, 2.68, 2.75, 2.82, 2.88, 2.95, 3.02, 3.08, 3.15, 3.22, 3.28, 3.35, 3.42, 3.48, 3.55, 3.62] },
  'Zion Williamson': { basePrice: 6200, monthlyMultipliers: [1.0, 1.12, 1.28, 1.45, 1.62, 1.52, 1.38, 1.25, 1.12, 1.05, 0.98, 0.92, 0.85, 0.78, 0.72, 0.68, 0.65, 0.62, 0.58, 0.55, 0.52, 0.48, 0.45, 0.42, 0.45, 0.48, 0.52, 0.55, 0.58, 0.62, 0.58, 0.55, 0.52, 0.48, 0.45, 0.42, 0.38, 0.35, 0.38, 0.42, 0.45, 0.48, 0.52, 0.55, 0.58, 0.62, 0.58, 0.55, 0.52, 0.48, 0.45, 0.42, 0.38, 0.35, 0.32, 0.28, 0.25, 0.28, 0.32, 0.35] },
  'Anthony Edwards': { basePrice: 950, monthlyMultipliers: [1.0, 1.05, 1.12, 1.18, 1.25, 1.35, 1.48, 1.62, 1.78, 1.95, 2.15, 2.35, 2.55, 2.75, 2.95, 3.15, 3.35, 3.55, 3.75, 3.95, 4.15, 4.35, 4.55, 4.75, 5.05, 5.35, 5.65, 5.95, 6.25, 6.55, 6.85, 7.15, 7.45, 7.75, 8.05, 8.35, 8.65, 8.95, 9.25, 9.55, 9.85, 10.15, 10.45, 10.75, 11.05, 11.35, 11.65, 11.95, 12.25, 12.55, 12.85, 13.15, 13.45, 13.75, 14.05, 14.35, 14.65, 14.95, 15.25, 15.55] },
  'LaMelo Ball': { basePrice: 1200, monthlyMultipliers: [1.0, 1.15, 1.35, 1.55, 1.75, 1.95, 2.15, 2.35, 2.55, 2.45, 2.35, 2.25, 2.15, 2.05, 1.95, 2.05, 2.15, 2.25, 2.35, 2.45, 2.55, 2.65, 2.75, 2.85, 2.95, 3.05, 3.15, 3.05, 2.95, 2.85, 2.75, 2.65, 2.55, 2.65, 2.75, 2.85, 2.95, 3.05, 3.15, 3.25, 3.35, 3.45, 3.55, 3.65, 3.75, 3.85, 3.95, 4.05, 4.15, 4.25, 4.35, 4.45, 4.55, 4.65, 4.75, 4.85, 4.95, 5.05, 5.15, 5.25] },
  'Mike Trout': { basePrice: 12000, monthlyMultipliers: [1.0, 1.02, 1.05, 1.08, 1.12, 1.15, 1.18, 1.22, 1.25, 1.28, 1.32, 1.35, 1.38, 1.42, 1.45, 1.48, 1.52, 1.55, 1.58, 1.62, 1.65, 1.68, 1.72, 1.75, 1.78, 1.82, 1.85, 1.88, 1.92, 1.95, 1.98, 2.02, 2.05, 2.08, 2.12, 2.15, 2.18, 2.22, 2.25, 2.28, 2.32, 2.35, 2.38, 2.42, 2.45, 2.48, 2.52, 2.55, 2.58, 2.62, 2.65, 2.68, 2.72, 2.75, 2.78, 2.82, 2.85, 2.88, 2.92, 2.95] },
  'Juan Soto': { basePrice: 1500, monthlyMultipliers: [1.0, 1.08, 1.18, 1.28, 1.42, 1.55, 1.65, 1.78, 1.92, 2.05, 2.18, 2.32, 2.45, 2.58, 2.72, 2.85, 2.98, 3.12, 3.25, 3.38, 3.52, 3.65, 3.78, 3.92, 4.05, 4.18, 4.32, 4.45, 4.58, 4.72, 4.85, 4.98, 5.12, 5.25, 5.38, 5.52, 5.65, 5.78, 5.92, 6.05, 6.18, 6.32, 6.45, 6.58, 6.72, 6.85, 6.98, 7.12, 7.25, 7.38, 7.52, 7.65, 7.78, 7.92, 8.05, 8.18, 8.32, 8.45, 8.58, 8.72] },
  'Ronald Acuna Jr': { basePrice: 2200, monthlyMultipliers: [1.0, 1.12, 1.25, 1.38, 1.52, 1.65, 1.78, 1.92, 2.05, 2.18, 2.32, 2.45, 2.58, 2.72, 2.85, 2.98, 3.12, 3.25, 3.18, 3.05, 2.92, 2.78, 2.65, 2.52, 2.45, 2.38, 2.32, 2.38, 2.45, 2.52, 2.58, 2.65, 2.72, 2.78, 2.85, 2.92, 2.98, 3.05, 3.12, 3.18, 3.25, 3.32, 3.38, 3.45, 3.52, 3.58, 3.65, 3.72, 3.78, 3.85, 3.92, 3.98, 4.05, 4.12, 4.18, 4.25, 4.32, 4.38, 4.45, 4.52] },
  'Shohei Ohtani': { basePrice: 3500, monthlyMultipliers: [1.0, 1.12, 1.28, 1.45, 1.62, 1.78, 1.95, 2.12, 2.28, 2.45, 2.62, 2.78, 2.95, 3.12, 3.28, 3.45, 3.62, 3.78, 3.95, 4.12, 4.28, 4.45, 4.62, 4.78, 4.95, 5.12, 5.28, 5.45, 5.62, 5.78, 5.95, 6.12, 6.28, 6.45, 6.62, 6.78, 6.95, 7.12, 7.28, 7.45, 7.62, 7.78, 7.95, 8.12, 8.28, 8.45, 8.62, 8.78, 8.95, 9.12, 9.28, 9.45, 9.62, 9.78, 9.95, 10.12, 10.28, 10.45, 10.62, 10.78] },
  'Ken Griffey Jr': { basePrice: 8500, monthlyMultipliers: [1.0, 1.01, 1.02, 1.03, 1.05, 1.06, 1.08, 1.09, 1.1, 1.12, 1.13, 1.15, 1.16, 1.18, 1.19, 1.2, 1.22, 1.23, 1.25, 1.26, 1.28, 1.29, 1.3, 1.32, 1.33, 1.35, 1.36, 1.38, 1.39, 1.4, 1.42, 1.43, 1.45, 1.46, 1.48, 1.49, 1.5, 1.52, 1.53, 1.55, 1.56, 1.58, 1.59, 1.6, 1.62, 1.63, 1.65, 1.66, 1.68, 1.69, 1.7, 1.72, 1.73, 1.75, 1.76, 1.78, 1.79, 1.8, 1.82, 1.83] },
  'Michael Jordan': { basePrice: 45000, monthlyMultipliers: [1.0, 1.02, 1.05, 1.08, 1.12, 1.15, 1.22, 1.28, 1.35, 1.42, 1.38, 1.35, 1.32, 1.28, 1.25, 1.22, 1.28, 1.35, 1.42, 1.48, 1.55, 1.62, 1.58, 1.55, 1.52, 1.48, 1.45, 1.42, 1.45, 1.48, 1.52, 1.55, 1.58, 1.62, 1.65, 1.68, 1.72, 1.75, 1.78, 1.82, 1.85, 1.88, 1.92, 1.95, 1.98, 2.02, 2.05, 2.08, 2.12, 2.15, 2.18, 2.22, 2.25, 2.28, 2.32, 2.35, 2.38, 2.42, 2.45, 2.48] },
  'Tom Brady': { basePrice: 15000, monthlyMultipliers: [1.0, 1.05, 1.08, 1.12, 1.18, 1.22, 1.28, 1.32, 1.38, 1.42, 1.48, 1.52, 1.58, 1.62, 1.68, 1.72, 1.78, 1.82, 1.88, 1.92, 1.85, 1.78, 1.72, 1.68, 1.62, 1.58, 1.55, 1.52, 1.48, 1.45, 1.42, 1.38, 1.35, 1.32, 1.28, 1.25, 1.22, 1.18, 1.15, 1.12, 1.08, 1.05, 1.02, 1.0, 0.98, 0.95, 0.92, 0.88, 0.85, 0.82, 0.78, 0.75, 0.72, 0.68, 0.65, 0.62, 0.58, 0.55, 0.52, 0.48] },
  'Trevor Lawrence': { basePrice: 2800, monthlyMultipliers: [1.0, 1.08, 1.15, 1.22, 1.15, 1.08, 0.98, 0.88, 0.82, 0.78, 0.75, 0.72, 0.68, 0.65, 0.62, 0.65, 0.68, 0.72, 0.75, 0.78, 0.82, 0.85, 0.88, 0.92, 0.95, 0.98, 1.02, 1.05, 1.08, 1.12, 1.08, 1.05, 1.02, 0.98, 0.95, 0.92, 0.88, 0.85, 0.88, 0.92, 0.95, 0.98, 1.02, 1.05, 1.08, 1.12, 1.15, 1.18, 1.22, 1.25, 1.28, 1.32, 1.35, 1.38, 1.42, 1.45, 1.48, 1.52, 1.55, 1.58] },
  'Justin Herbert': { basePrice: 2400, monthlyMultipliers: [1.0, 1.12, 1.25, 1.38, 1.52, 1.65, 1.78, 1.85, 1.92, 1.85, 1.78, 1.72, 1.78, 1.85, 1.92, 1.98, 2.05, 2.12, 2.18, 2.25, 2.32, 2.38, 2.45, 2.52, 2.58, 2.65, 2.72, 2.78, 2.85, 2.92, 2.98, 3.05, 3.12, 3.18, 3.25, 3.32, 3.38, 3.45, 3.52, 3.58, 3.65, 3.72, 3.78, 3.85, 3.92, 3.98, 4.05, 4.12, 4.18, 4.25, 4.32, 4.38, 4.45, 4.52, 4.58, 4.65, 4.72, 4.78, 4.85, 4.92] },
  'Joe Burrow': { basePrice: 1800, monthlyMultipliers: [1.0, 1.08, 1.18, 1.32, 1.48, 1.62, 1.78, 1.92, 2.08, 2.22, 2.38, 2.52, 2.68, 2.82, 2.72, 2.58, 2.48, 2.58, 2.72, 2.88, 3.02, 3.18, 3.32, 3.48, 3.62, 3.78, 3.92, 4.08, 4.22, 4.38, 4.28, 4.18, 4.08, 4.18, 4.28, 4.38, 4.48, 4.58, 4.68, 4.78, 4.88, 4.98, 5.08, 5.18, 5.28, 5.38, 5.48, 5.58, 5.68, 5.78, 5.88, 5.98, 6.08, 6.18, 6.28, 6.38, 6.48, 6.58, 6.68, 6.78] },
  'Victor Wembanyama': { basePrice: 800, monthlyMultipliers: [1.0, 1.25, 1.55, 1.85, 2.15, 2.55, 2.95, 3.35, 3.75, 4.15, 4.55, 4.95, 5.35, 5.75, 6.15, 6.55, 6.95, 7.35, 7.75, 8.15, 8.55, 8.95, 9.35, 9.75, 10.15, 10.55, 10.95, 11.35, 11.75, 12.15, 12.55, 12.95, 13.35, 13.75, 14.15, 14.55, 14.95, 15.35, 15.75, 16.15, 16.55, 16.95, 17.35, 17.75, 18.15, 18.55, 18.95, 19.35, 19.75, 20.15, 20.55, 20.95, 21.35, 21.75, 22.15, 22.55, 22.95, 23.35, 23.75, 24.15] },
  'Caleb Williams': { basePrice: 450, monthlyMultipliers: [1.0, 1.22, 1.45, 1.65, 1.85, 2.05, 2.25, 2.15, 2.05, 1.95, 1.85, 1.75, 1.85, 1.95, 2.05, 2.15, 2.25, 2.35, 2.45, 2.55, 2.65, 2.75, 2.85, 2.95, 3.05, 3.15, 3.25, 3.35, 3.45, 3.55, 3.65, 3.75, 3.85, 3.95, 4.05, 4.15, 4.25, 4.35, 4.45, 4.55, 4.65, 4.75, 4.85, 4.95, 5.05, 5.15, 5.25, 5.35, 5.45, 5.55, 5.65, 5.75, 5.85, 5.95, 6.05, 6.15, 6.25, 6.35, 6.45, 6.55] },
};

const BENCHMARK_DATA: Record<string, number[]> = {
  sp500: [1.0, 1.01, 1.02, 1.04, 1.05, 1.07, 1.08, 1.1, 1.11, 1.13, 1.14, 1.16, 1.18, 1.19, 1.21, 1.22, 1.24, 1.26, 1.27, 1.29, 1.31, 1.32, 1.34, 1.36, 1.37, 1.39, 1.41, 1.43, 1.44, 1.46, 1.48, 1.5, 1.51, 1.53, 1.55, 1.57, 1.59, 1.6, 1.62, 1.64, 1.66, 1.68, 1.7, 1.72, 1.74, 1.76, 1.78, 1.8, 1.82, 1.84, 1.86, 1.88, 1.9, 1.92, 1.94, 1.96, 1.98, 2.0, 2.02, 2.04],
  rookie_index: [1.0, 1.03, 1.07, 1.12, 1.18, 1.22, 1.28, 1.32, 1.38, 1.42, 1.48, 1.52, 1.58, 1.62, 1.68, 1.72, 1.78, 1.82, 1.88, 1.92, 1.98, 2.02, 2.08, 2.12, 2.18, 2.22, 2.28, 2.32, 2.38, 2.42, 2.48, 2.52, 2.58, 2.62, 2.68, 2.72, 2.78, 2.82, 2.88, 2.92, 2.98, 3.02, 3.08, 3.12, 3.18, 3.22, 3.28, 3.32, 3.38, 3.42, 3.48, 3.52, 3.58, 3.62, 3.68, 3.72, 3.78, 3.82, 3.88, 3.92],
  vintage_index: [1.0, 1.01, 1.02, 1.03, 1.05, 1.06, 1.07, 1.08, 1.1, 1.11, 1.12, 1.13, 1.15, 1.16, 1.17, 1.18, 1.2, 1.21, 1.22, 1.23, 1.25, 1.26, 1.27, 1.28, 1.3, 1.31, 1.32, 1.33, 1.35, 1.36, 1.37, 1.38, 1.4, 1.41, 1.42, 1.43, 1.45, 1.46, 1.47, 1.48, 1.5, 1.51, 1.52, 1.53, 1.55, 1.56, 1.57, 1.58, 1.6, 1.61, 1.62, 1.63, 1.65, 1.66, 1.67, 1.68, 1.7, 1.71, 1.72, 1.73],
  modern_index: [1.0, 1.04, 1.09, 1.14, 1.2, 1.25, 1.3, 1.36, 1.42, 1.48, 1.54, 1.6, 1.66, 1.72, 1.78, 1.84, 1.9, 1.96, 2.02, 2.08, 2.14, 2.2, 2.26, 2.32, 2.38, 2.44, 2.5, 2.56, 2.62, 2.68, 2.74, 2.8, 2.86, 2.92, 2.98, 3.04, 3.1, 3.16, 3.22, 3.28, 3.34, 3.4, 3.46, 3.52, 3.58, 3.64, 3.7, 3.76, 3.82, 3.88, 3.94, 4.0, 4.06, 4.12, 4.18, 4.24, 4.3, 4.36, 4.42, 4.48],
};

// ---- Saved Portfolios (in-memory store) ----

let savedPortfolios: PhantomPortfolio[] = [
  {
    id: 'pop-001',
    name: '2018 NFL Draft Class',
    config: {
      startDate: '2018-09-01',
      endDate: '2023-09-01',
      initialCapital: 50000,
      positions: [
        { player: 'Patrick Mahomes', year: 2017, set: 'Panini Prizm', quantity: 2, grade: 'PSA 10' },
        { player: 'Josh Allen', year: 2018, set: 'Panini Prizm', quantity: 3, grade: 'PSA 10' },
        { player: 'Lamar Jackson', year: 2018, set: 'Panini Prizm', quantity: 3, grade: 'PSA 9' },
        { player: 'Saquon Barkley', year: 2018, set: 'Panini Prizm', quantity: 2, grade: 'PSA 10' },
        { player: 'Baker Mayfield', year: 2018, set: 'Panini Prizm', quantity: 2, grade: 'PSA 10' },
      ],
      rebalanceFrequency: 'quarterly',
      transactionCostPct: 2.5,
      gradingFees: 150,
      holdingCosts: 50,
      benchmark: 'rookie_index',
    },
    result: null,
    createdAt: '2024-01-15T10:00:00Z',
    status: 'completed',
  },
  {
    id: 'pop-002',
    name: '2020 NBA Draft Moonshots',
    config: {
      startDate: '2020-12-01',
      endDate: '2024-12-01',
      initialCapital: 25000,
      positions: [
        { player: 'Anthony Edwards', year: 2020, set: 'Panini Prizm', quantity: 5, grade: 'PSA 10' },
        { player: 'LaMelo Ball', year: 2020, set: 'Panini Prizm', quantity: 4, grade: 'PSA 10' },
      ],
      rebalanceFrequency: 'none',
      transactionCostPct: 2.5,
      gradingFees: 100,
      holdingCosts: 30,
      benchmark: 'rookie_index',
    },
    result: null,
    createdAt: '2024-02-20T14:30:00Z',
    status: 'completed',
  },
  {
    id: 'pop-003',
    name: 'Vintage HOF Legends',
    config: {
      startDate: '2019-01-01',
      endDate: '2024-01-01',
      initialCapital: 100000,
      positions: [
        { player: 'Michael Jordan', year: 1986, set: 'Fleer', quantity: 1, grade: 'PSA 9' },
        { player: 'Ken Griffey Jr', year: 1989, set: 'Upper Deck', quantity: 2, grade: 'PSA 10' },
        { player: 'Mike Trout', year: 2011, set: 'Topps Update', quantity: 2, grade: 'PSA 10' },
      ],
      rebalanceFrequency: 'annually',
      transactionCostPct: 3.0,
      gradingFees: 200,
      holdingCosts: 100,
      benchmark: 'vintage_index',
    },
    result: null,
    createdAt: '2024-03-10T09:15:00Z',
    status: 'completed',
  },
];

// ---- Helper Functions ----

function generateMonthsBetween(start: string, end: string): string[] {
  const months: string[] = [];
  const d = new Date(start);
  const endDate = new Date(end);
  while (d <= endDate) {
    months.push(d.toISOString().slice(0, 7));
    d.setMonth(d.getMonth() + 1);
  }
  return months;
}

function generateId(): string {
  return 'pb-' + Math.random().toString(36).slice(2, 11);
}

function getPlayerPriceAtMonth(player: string, monthIndex: number): number {
  const data = PLAYER_PRICE_HISTORIES[player];
  if (!data) return 100;
  const idx = Math.min(monthIndex, data.monthlyMultipliers.length - 1);
  return Math.round(data.basePrice * data.monthlyMultipliers[Math.max(0, idx)] * 100) / 100;
}

function getBenchmarkAtMonth(benchmark: string, monthIndex: number): number {
  const data = BENCHMARK_DATA[benchmark] || BENCHMARK_DATA.sp500;
  const idx = Math.min(monthIndex, data.length - 1);
  return data[Math.max(0, idx)];
}

// ---- Service Functions ----

export function getHistoricalPrices(player: string, startYear: number): HistoricalPrice[] {
  const data = PLAYER_PRICE_HISTORIES[player];
  if (!data) return [];
  return data.monthlyMultipliers.map((mult, i) => {
    const date = new Date(startYear, i);
    return {
      date: date.toISOString().slice(0, 10),
      price: Math.round(data.basePrice * mult * 100) / 100,
      volume: Math.floor(Math.random() * 50) + 5,
      grade: 'PSA 10',
    };
  });
}

export function getAvailablePlayers(): string[] {
  return Object.keys(PLAYER_PRICE_HISTORIES);
}

export async function runBacktest(config: BacktestConfig): Promise<BacktestResult> {
  // Simulate async processing
  await new Promise((resolve) => setTimeout(resolve, 1800));

  const months = generateMonthsBetween(config.startDate, config.endDate);
  const numMonths = months.length;
  const totalPositionCost = config.positions.reduce((sum, pos) => {
    const price = PLAYER_PRICE_HISTORIES[pos.player]?.basePrice || 500;
    return sum + price * pos.quantity;
  }, 0);

  const cashAfterBuy = config.initialCapital - totalPositionCost - (totalPositionCost * config.transactionCostPct / 100) - config.gradingFees;

  const timeline: TimeSeriesPoint[] = [];
  const trades: BacktestTrade[] = [];
  const snapshots: PortfolioSnapshot[] = [];
  const monthlyReturns: { month: string; return: number }[] = [];

  // Generate buy trades
  config.positions.forEach((pos) => {
    const price = PLAYER_PRICE_HISTORIES[pos.player]?.basePrice || 500;
    trades.push({
      id: generateId(),
      date: config.startDate,
      player: pos.player,
      action: 'buy',
      quantity: pos.quantity,
      price,
      fees: price * pos.quantity * config.transactionCostPct / 100,
      pnl: 0,
    });
  });

  let prevValue = config.initialCapital;

  for (let i = 0; i < numMonths; i++) {
    const positionsValue = config.positions.reduce((sum, pos) => {
      return sum + getPlayerPriceAtMonth(pos.player, i) * pos.quantity;
    }, 0);

    const holdingDeduction = (config.holdingCosts / 12) * i;
    const totalValue = positionsValue + Math.max(0, cashAfterBuy) - holdingDeduction;
    const benchmarkMultiplier = getBenchmarkAtMonth(config.benchmark, i);

    timeline.push({
      date: months[i],
      value: Math.round(totalValue * 100) / 100,
      benchmark: Math.round(config.initialCapital * benchmarkMultiplier * 100) / 100,
    });

    const monthReturn = i === 0 ? 0 : ((totalValue - prevValue) / prevValue) * 100;
    monthlyReturns.push({ month: months[i], return: Math.round(monthReturn * 100) / 100 });

    const posDetails = config.positions.map((pos) => {
      const val = getPlayerPriceAtMonth(pos.player, i) * pos.quantity;
      return { player: pos.player, value: val, weight: totalValue > 0 ? val / totalValue : 0 };
    });

    snapshots.push({
      date: months[i],
      totalValue: Math.round(totalValue * 100) / 100,
      cashBalance: Math.max(0, Math.round(cashAfterBuy * 100) / 100),
      positions: posDetails,
      dayReturn: Math.round(monthReturn * 100) / 100,
      cumReturn: Math.round(((totalValue - config.initialCapital) / config.initialCapital) * 10000) / 100,
    });

    // Rebalance trades
    if (config.rebalanceFrequency !== 'none') {
      const freq = config.rebalanceFrequency === 'monthly' ? 1 : config.rebalanceFrequency === 'quarterly' ? 3 : 12;
      if (i > 0 && i % freq === 0) {
        trades.push({
          id: generateId(),
          date: months[i],
          player: 'Portfolio',
          action: 'rebalance',
          quantity: 0,
          price: totalValue,
          fees: totalValue * config.transactionCostPct / 100 * 0.1,
          pnl: totalValue - prevValue,
        });
      }
    }

    prevValue = totalValue;
  }

  // Generate sell trades at end
  config.positions.forEach((pos) => {
    const endPrice = getPlayerPriceAtMonth(pos.player, numMonths - 1);
    const startPrice = PLAYER_PRICE_HISTORIES[pos.player]?.basePrice || 500;
    trades.push({
      id: generateId(),
      date: config.endDate,
      player: pos.player,
      action: 'sell',
      quantity: pos.quantity,
      price: endPrice,
      fees: endPrice * pos.quantity * config.transactionCostPct / 100,
      pnl: (endPrice - startPrice) * pos.quantity,
    });
  });

  const finalValue = timeline[timeline.length - 1]?.value || config.initialCapital;
  const totalReturn = ((finalValue - config.initialCapital) / config.initialCapital) * 100;
  const years = numMonths / 12;
  const annualizedReturn = (Math.pow(finalValue / config.initialCapital, 1 / Math.max(years, 0.5)) - 1) * 100;

  // Calculate max drawdown
  let peak = config.initialCapital;
  let maxDrawdown = 0;
  const drawdowns: DrawdownEvent[] = [];
  let drawdownStart = '';
  let currentPeak = config.initialCapital;

  for (const point of timeline) {
    if (point.value > peak) {
      if (drawdownStart && maxDrawdown > 0) {
        drawdowns.push({
          startDate: drawdownStart,
          endDate: point.date,
          peak: currentPeak,
          trough: currentPeak * (1 - maxDrawdown / 100),
          drawdownPct: maxDrawdown,
          recovered: true,
          recoveryDate: point.date,
        });
      }
      peak = point.value;
      currentPeak = point.value;
      drawdownStart = '';
    }
    const dd = ((peak - point.value) / peak) * 100;
    if (dd > 0 && !drawdownStart) {
      drawdownStart = point.date;
    }
    if (dd > maxDrawdown) {
      maxDrawdown = dd;
    }
  }

  // Calculate volatility and Sharpe ratio
  const returns = monthlyReturns.map((m) => m.return);
  const avgReturn = returns.reduce((s, r) => s + r, 0) / returns.length;
  const variance = returns.reduce((s, r) => s + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const volatility = Math.sqrt(variance) * Math.sqrt(12);
  const riskFreeRate = 4.5;
  const sharpeRatio = volatility > 0 ? (annualizedReturn - riskFreeRate) / volatility : 0;

  const benchmarkFinal = getBenchmarkAtMonth(config.benchmark, numMonths - 1);
  const benchmarkReturn = (benchmarkFinal - 1) * 100;
  const alpha = annualizedReturn - benchmarkReturn / Math.max(years, 0.5);
  const beta = volatility > 0 ? (annualizedReturn / benchmarkReturn) * 0.8 : 1;

  const winTrades = trades.filter((t) => t.pnl > 0);
  const lossTrades = trades.filter((t) => t.pnl < 0);
  const winRate = trades.filter((t) => t.action === 'sell').length > 0
    ? (winTrades.length / trades.filter((t) => t.action === 'sell').length) * 100
    : 50;

  const bestTrade = trades.reduce((best, t) => (t.pnl > best.pnl ? t : best), trades[0]);
  const worstTrade = trades.reduce((worst, t) => (t.pnl < worst.pnl ? t : worst), trades[0]);

  const metrics: BacktestMetrics = {
    totalReturn: Math.round(totalReturn * 100) / 100,
    annualizedReturn: Math.round(annualizedReturn * 100) / 100,
    maxDrawdown: Math.round(maxDrawdown * 100) / 100,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    sortinoRatio: Math.round(sharpeRatio * 1.2 * 100) / 100,
    volatility: Math.round(volatility * 100) / 100,
    winRate: Math.round(winRate * 100) / 100,
    profitFactor: lossTrades.length > 0
      ? Math.round((winTrades.reduce((s, t) => s + t.pnl, 0) / Math.abs(lossTrades.reduce((s, t) => s + t.pnl, 0) || 1)) * 100) / 100
      : 2.5,
    avgWin: winTrades.length > 0 ? Math.round(winTrades.reduce((s, t) => s + t.pnl, 0) / winTrades.length) : 0,
    avgLoss: lossTrades.length > 0 ? Math.round(lossTrades.reduce((s, t) => s + t.pnl, 0) / lossTrades.length) : 0,
    calmarRatio: maxDrawdown > 0 ? Math.round((annualizedReturn / maxDrawdown) * 100) / 100 : 0,
  };

  return {
    config,
    finalValue: Math.round(finalValue * 100) / 100,
    totalReturn: Math.round(totalReturn * 100) / 100,
    annualizedReturn: Math.round(annualizedReturn * 100) / 100,
    maxDrawdown: Math.round(maxDrawdown * 100) / 100,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    winRate: Math.round(winRate * 100) / 100,
    avgHoldPeriod: numMonths,
    bestTrade,
    worstTrade,
    timeline,
    trades,
    snapshots,
    benchmarkReturn: Math.round(benchmarkReturn * 100) / 100,
    alpha: Math.round(alpha * 100) / 100,
    beta: Math.round(beta * 100) / 100,
    volatility: Math.round(volatility * 100) / 100,
    drawdowns,
    monthlyReturns,
    metrics,
  };
}

export function getSavedPortfolios(): PhantomPortfolio[] {
  return [...savedPortfolios];
}

export function savePortfolio(portfolio: PhantomPortfolio): void {
  const idx = savedPortfolios.findIndex((p) => p.id === portfolio.id);
  if (idx >= 0) {
    savedPortfolios[idx] = portfolio;
  } else {
    savedPortfolios.push(portfolio);
  }
}

export function deletePortfolio(id: string): void {
  savedPortfolios = savedPortfolios.filter((p) => p.id !== id);
}

export function comparePortfolios(ids: string[]): BenchmarkComparison {
  const portfolios = savedPortfolios.filter((p) => ids.includes(p.id) && p.result);
  const maxLen = Math.max(...portfolios.map((p) => p.result?.timeline.length || 0));

  const timelineCombined: { date: string; values: number[] }[] = [];
  for (let i = 0; i < maxLen; i++) {
    const date = portfolios[0]?.result?.timeline[i]?.date || `Month ${i}`;
    const values = portfolios.map((p) => p.result?.timeline[Math.min(i, (p.result?.timeline.length || 1) - 1)]?.value || 0);
    timelineCombined.push({ date, values });
  }

  return {
    portfolioIds: portfolios.map((p) => p.id),
    portfolioNames: portfolios.map((p) => p.name),
    returns: portfolios.map((p) => p.result?.totalReturn || 0),
    sharpeRatios: portfolios.map((p) => p.result?.sharpeRatio || 0),
    maxDrawdowns: portfolios.map((p) => p.result?.maxDrawdown || 0),
    alphas: portfolios.map((p) => p.result?.alpha || 0),
    timeline: timelineCombined,
  };
}

export function getAvailableBenchmarks(): { id: string; name: string; returns: number[] }[] {
  return [
    { id: 'sp500', name: 'S&P 500', returns: BENCHMARK_DATA.sp500 },
    { id: 'rookie_index', name: 'Rookie Card Index', returns: BENCHMARK_DATA.rookie_index },
    { id: 'vintage_index', name: 'Vintage Card Index', returns: BENCHMARK_DATA.vintage_index },
    { id: 'modern_index', name: 'Modern Card Index', returns: BENCHMARK_DATA.modern_index },
  ];
}

export function getPresetStrategies(): PhantomStrategy[] {
  return [
    {
      id: 'preset-nfl-2018',
      name: '2018 NFL Draft Class',
      description: 'Top 5 picks from the loaded 2018 NFL Draft. Mahomes, Allen, Jackson, Barkley, Mayfield.',
      icon: 'Football',
      category: 'nfl',
      expectedReturn: 185,
      config: {
        startDate: '2018-09-01',
        endDate: '2023-09-01',
        initialCapital: 50000,
        positions: [
          { player: 'Patrick Mahomes', year: 2017, set: 'Panini Prizm', quantity: 2, grade: 'PSA 10' },
          { player: 'Josh Allen', year: 2018, set: 'Panini Prizm', quantity: 3, grade: 'PSA 10' },
          { player: 'Lamar Jackson', year: 2018, set: 'Panini Prizm', quantity: 3, grade: 'PSA 9' },
          { player: 'Saquon Barkley', year: 2018, set: 'Panini Prizm', quantity: 2, grade: 'PSA 10' },
          { player: 'Baker Mayfield', year: 2018, set: 'Panini Prizm', quantity: 2, grade: 'PSA 10' },
        ],
        rebalanceFrequency: 'quarterly',
        transactionCostPct: 2.5,
        gradingFees: 150,
        holdingCosts: 50,
        benchmark: 'rookie_index',
      },
    },
    {
      id: 'preset-nba-2020',
      name: '2020 NBA Draft Moonshots',
      description: 'Anthony Edwards and LaMelo Ball early. Buy low, hold long on generational talent.',
      icon: 'Basketball',
      category: 'nba',
      expectedReturn: 320,
      config: {
        startDate: '2020-12-01',
        endDate: '2024-12-01',
        initialCapital: 25000,
        positions: [
          { player: 'Anthony Edwards', year: 2020, set: 'Panini Prizm', quantity: 5, grade: 'PSA 10' },
          { player: 'LaMelo Ball', year: 2020, set: 'Panini Prizm', quantity: 4, grade: 'PSA 10' },
        ],
        rebalanceFrequency: 'none',
        transactionCostPct: 2.5,
        gradingFees: 100,
        holdingCosts: 30,
        benchmark: 'rookie_index',
      },
    },
    {
      id: 'preset-vintage-hof',
      name: 'Vintage HOF Legends',
      description: 'Blue-chip vintage: MJ Fleer rookie, Griffey UD, Trout Update. Stable growth plays.',
      icon: 'Crown',
      category: 'vintage',
      expectedReturn: 95,
      config: {
        startDate: '2019-01-01',
        endDate: '2024-01-01',
        initialCapital: 100000,
        positions: [
          { player: 'Michael Jordan', year: 1986, set: 'Fleer', quantity: 1, grade: 'PSA 9' },
          { player: 'Ken Griffey Jr', year: 1989, set: 'Upper Deck', quantity: 2, grade: 'PSA 10' },
          { player: 'Mike Trout', year: 2011, set: 'Topps Update', quantity: 2, grade: 'PSA 10' },
        ],
        rebalanceFrequency: 'annually',
        transactionCostPct: 3.0,
        gradingFees: 200,
        holdingCosts: 100,
        benchmark: 'vintage_index',
      },
    },
    {
      id: 'preset-mlb-stars',
      name: 'MLB Superstar Portfolio',
      description: 'Ohtani, Soto, Acuna. The next generation of baseball royalty.',
      icon: 'Star',
      category: 'mlb',
      expectedReturn: 250,
      config: {
        startDate: '2020-01-01',
        endDate: '2024-12-01',
        initialCapital: 30000,
        positions: [
          { player: 'Shohei Ohtani', year: 2018, set: 'Topps Chrome', quantity: 3, grade: 'PSA 10' },
          { player: 'Juan Soto', year: 2018, set: 'Topps Update', quantity: 4, grade: 'PSA 10' },
          { player: 'Ronald Acuna Jr', year: 2018, set: 'Topps Update', quantity: 3, grade: 'PSA 10' },
        ],
        rebalanceFrequency: 'quarterly',
        transactionCostPct: 2.5,
        gradingFees: 120,
        holdingCosts: 40,
        benchmark: 'modern_index',
      },
    },
    {
      id: 'preset-next-gen',
      name: 'Next-Gen Phenoms',
      description: 'Wembanyama, Caleb Williams, Edwards. Bet on the future of sports.',
      icon: 'Rocket',
      category: 'modern',
      expectedReturn: 450,
      config: {
        startDate: '2023-06-01',
        endDate: '2026-01-01',
        initialCapital: 15000,
        positions: [
          { player: 'Victor Wembanyama', year: 2023, set: 'Panini Prizm', quantity: 5, grade: 'PSA 10' },
          { player: 'Caleb Williams', year: 2024, set: 'Panini Prizm', quantity: 4, grade: 'PSA 10' },
          { player: 'Anthony Edwards', year: 2020, set: 'Panini Prizm', quantity: 2, grade: 'PSA 10' },
        ],
        rebalanceFrequency: 'none',
        transactionCostPct: 2.5,
        gradingFees: 80,
        holdingCosts: 25,
        benchmark: 'modern_index',
      },
    },
  ];
}

export async function runWhatIf(baseId: string, changes: { sellMonthsEarlier?: number; sellMonthsLater?: number; removePlayers?: string[]; addCapital?: number }): Promise<WhatIfResult> {
  const portfolio = savedPortfolios.find((p) => p.id === baseId);
  if (!portfolio || !portfolio.result) {
    return {
      originalReturn: 0,
      modifiedReturn: 0,
      difference: 0,
      modifiedTimeline: [],
      explanation: 'Portfolio not found or has no results.',
    };
  }

  const original = portfolio.result;
  const monthsShift = (changes.sellMonthsEarlier || 0) - (changes.sellMonthsLater || 0);
  const endIdx = Math.max(0, original.timeline.length - 1 - monthsShift);
  const modifiedTimeline = original.timeline.slice(0, endIdx + 1);

  const modifiedFinal = modifiedTimeline[modifiedTimeline.length - 1]?.value || portfolio.config.initialCapital;
  const modifiedReturn = ((modifiedFinal - portfolio.config.initialCapital) / portfolio.config.initialCapital) * 100;

  let explanation = '';
  if (changes.sellMonthsEarlier) {
    explanation = `Selling ${changes.sellMonthsEarlier} months earlier would have resulted in a ${Math.round(modifiedReturn * 100) / 100}% return vs the original ${Math.round(original.totalReturn * 100) / 100}%.`;
  } else if (changes.sellMonthsLater) {
    explanation = `Holding ${changes.sellMonthsLater} months longer would have changed your exit point.`;
  }

  return {
    originalReturn: original.totalReturn,
    modifiedReturn: Math.round(modifiedReturn * 100) / 100,
    difference: Math.round((modifiedReturn - original.totalReturn) * 100) / 100,
    modifiedTimeline,
    explanation,
  };
}

export function getPopularBacktests(): PhantomPortfolio[] {
  return savedPortfolios.filter((p) => ['pop-001', 'pop-002', 'pop-003'].includes(p.id));
}

export function calculateMetrics(timeline: TimeSeriesPoint[]): BacktestMetrics {
  if (timeline.length < 2) {
    return { totalReturn: 0, annualizedReturn: 0, maxDrawdown: 0, sharpeRatio: 0, sortinoRatio: 0, volatility: 0, winRate: 0, profitFactor: 0, avgWin: 0, avgLoss: 0, calmarRatio: 0 };
  }

  const first = timeline[0].value;
  const last = timeline[timeline.length - 1].value;
  const totalReturn = ((last - first) / first) * 100;
  const years = timeline.length / 12;
  const annualizedReturn = (Math.pow(last / first, 1 / Math.max(years, 0.5)) - 1) * 100;

  const returns = timeline.slice(1).map((p, i) => ((p.value - timeline[i].value) / timeline[i].value) * 100);
  const avgRet = returns.reduce((s, r) => s + r, 0) / returns.length;
  const variance = returns.reduce((s, r) => s + Math.pow(r - avgRet, 2), 0) / returns.length;
  const volatility = Math.sqrt(variance) * Math.sqrt(12);
  const sharpeRatio = volatility > 0 ? (annualizedReturn - 4.5) / volatility : 0;

  let peak = first;
  let maxDrawdown = 0;
  for (const p of timeline) {
    if (p.value > peak) peak = p.value;
    const dd = ((peak - p.value) / peak) * 100;
    if (dd > maxDrawdown) maxDrawdown = dd;
  }

  const wins = returns.filter((r) => r > 0);
  const losses = returns.filter((r) => r < 0);

  return {
    totalReturn: Math.round(totalReturn * 100) / 100,
    annualizedReturn: Math.round(annualizedReturn * 100) / 100,
    maxDrawdown: Math.round(maxDrawdown * 100) / 100,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    sortinoRatio: Math.round(sharpeRatio * 1.15 * 100) / 100,
    volatility: Math.round(volatility * 100) / 100,
    winRate: Math.round((wins.length / returns.length) * 10000) / 100,
    profitFactor: losses.length > 0 ? Math.round((wins.reduce((s, w) => s + w, 0) / Math.abs(losses.reduce((s, l) => s + l, 0))) * 100) / 100 : 2.5,
    avgWin: wins.length > 0 ? Math.round((wins.reduce((s, w) => s + w, 0) / wins.length) * 100) / 100 : 0,
    avgLoss: losses.length > 0 ? Math.round((losses.reduce((s, l) => s + l, 0) / losses.length) * 100) / 100 : 0,
    calmarRatio: maxDrawdown > 0 ? Math.round((annualizedReturn / maxDrawdown) * 100) / 100 : 0,
  };
}
