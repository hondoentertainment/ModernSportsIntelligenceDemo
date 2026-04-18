// ---- Types ----

export type RegimeType = 'bull' | 'bear' | 'range-bound' | 'high-volatility' | 'recovery';

export interface MarketRegimeState {
  id: string;
  regime: RegimeType;
  label: string;
  description: string;
  confidence: number;
  startDate: string;
  durationDays: number;
  avgReturn: number;
  volatility: number;
  recommendedStrategy: string;
  color: string;
}

export interface RegimeTransition {
  fromRegime: RegimeType;
  toRegime: RegimeType;
  probability: number;
  avgTransitionDays: number;
  historicalCount: number;
}

export interface StrategySwitch {
  id: string;
  date: string;
  fromStrategy: string;
  toStrategy: string;
  fromRegime: RegimeType;
  toRegime: RegimeType;
  portfolioImpact: number;
  reason: string;
}

export interface RegimeHistory {
  month: string;
  regime: RegimeType;
  confidence: number;
  marketReturn: number;
  strategyReturn: number;
  volatility: number;
}

// ---- Mock Data ----

const mockRegimeStates: MarketRegimeState[] = [
  {
    id: 'rs-1',
    regime: 'bull',
    label: 'Bull Market',
    description: 'Strong upward momentum across premium sports cards with high transaction volume',
    confidence: 0.87,
    startDate: '2026-01-15',
    durationDays: 93,
    avgReturn: 12.4,
    volatility: 14.2,
    recommendedStrategy: 'Aggressive Growth - Load up on high-beta rookies and parallels',
    color: '#22c55e',
  },
  {
    id: 'rs-2',
    regime: 'bear',
    label: 'Bear Market',
    description: 'Declining valuations with reduced buyer interest and thinning liquidity',
    confidence: 0.91,
    startDate: '2025-06-01',
    durationDays: 120,
    avgReturn: -8.7,
    volatility: 22.5,
    recommendedStrategy: 'Defensive - Rotate into blue-chip vintage and graded PSA 10s',
    color: '#ef4444',
  },
  {
    id: 'rs-3',
    regime: 'range-bound',
    label: 'Range-Bound',
    description: 'Prices oscillating within a defined band with no clear directional trend',
    confidence: 0.74,
    startDate: '2025-10-01',
    durationDays: 75,
    avgReturn: 1.2,
    volatility: 9.8,
    recommendedStrategy: 'Mean Reversion - Buy dips and sell rips within established ranges',
    color: '#f59e0b',
  },
  {
    id: 'rs-4',
    regime: 'high-volatility',
    label: 'High Volatility',
    description: 'Extreme price swings driven by major events like draft picks or injury news',
    confidence: 0.82,
    startDate: '2025-04-15',
    durationDays: 45,
    avgReturn: 3.1,
    volatility: 35.6,
    recommendedStrategy: 'Options-Like - Use straddle positions across correlated player cards',
    color: '#a855f7',
  },
  {
    id: 'rs-5',
    regime: 'recovery',
    label: 'Recovery Phase',
    description: 'Gradual rebound from bear territory with selective buying returning',
    confidence: 0.69,
    startDate: '2025-12-01',
    durationDays: 45,
    avgReturn: 6.8,
    volatility: 18.3,
    recommendedStrategy: 'Selective Accumulation - Target oversold quality with strong fundamentals',
    color: '#06b6d4',
  },
];

const mockTransitions: RegimeTransition[] = [
  { fromRegime: 'bull', toRegime: 'range-bound', probability: 0.35, avgTransitionDays: 14, historicalCount: 8 },
  { fromRegime: 'bull', toRegime: 'high-volatility', probability: 0.20, avgTransitionDays: 7, historicalCount: 5 },
  { fromRegime: 'bull', toRegime: 'bear', probability: 0.15, avgTransitionDays: 21, historicalCount: 3 },
  { fromRegime: 'bull', toRegime: 'bull', probability: 0.30, avgTransitionDays: 0, historicalCount: 12 },
  { fromRegime: 'bear', toRegime: 'recovery', probability: 0.40, avgTransitionDays: 28, historicalCount: 9 },
  { fromRegime: 'bear', toRegime: 'range-bound', probability: 0.25, avgTransitionDays: 18, historicalCount: 6 },
  { fromRegime: 'bear', toRegime: 'bear', probability: 0.25, avgTransitionDays: 0, historicalCount: 7 },
  { fromRegime: 'bear', toRegime: 'high-volatility', probability: 0.10, avgTransitionDays: 10, historicalCount: 2 },
  { fromRegime: 'range-bound', toRegime: 'bull', probability: 0.30, avgTransitionDays: 12, historicalCount: 7 },
  { fromRegime: 'range-bound', toRegime: 'bear', probability: 0.20, avgTransitionDays: 15, historicalCount: 4 },
  { fromRegime: 'range-bound', toRegime: 'range-bound', probability: 0.35, avgTransitionDays: 0, historicalCount: 10 },
  { fromRegime: 'range-bound', toRegime: 'high-volatility', probability: 0.15, avgTransitionDays: 8, historicalCount: 3 },
  { fromRegime: 'high-volatility', toRegime: 'bear', probability: 0.30, avgTransitionDays: 10, historicalCount: 6 },
  { fromRegime: 'high-volatility', toRegime: 'range-bound', probability: 0.30, avgTransitionDays: 14, historicalCount: 5 },
  { fromRegime: 'high-volatility', toRegime: 'bull', probability: 0.15, avgTransitionDays: 18, historicalCount: 3 },
  { fromRegime: 'high-volatility', toRegime: 'high-volatility', probability: 0.25, avgTransitionDays: 0, historicalCount: 4 },
  { fromRegime: 'recovery', toRegime: 'bull', probability: 0.45, avgTransitionDays: 20, historicalCount: 10 },
  { fromRegime: 'recovery', toRegime: 'range-bound', probability: 0.30, avgTransitionDays: 14, historicalCount: 6 },
  { fromRegime: 'recovery', toRegime: 'bear', probability: 0.10, avgTransitionDays: 25, historicalCount: 2 },
  { fromRegime: 'recovery', toRegime: 'recovery', probability: 0.15, avgTransitionDays: 0, historicalCount: 3 },
];

const mockStrategySwitches: StrategySwitch[] = [
  { id: 'ss-1', date: '2026-01-15', fromStrategy: 'Selective Accumulation', toStrategy: 'Aggressive Growth', fromRegime: 'recovery', toRegime: 'bull', portfolioImpact: 4.2, reason: 'Recovery momentum accelerated beyond threshold' },
  { id: 'ss-2', date: '2025-12-01', fromStrategy: 'Mean Reversion', toStrategy: 'Selective Accumulation', fromRegime: 'range-bound', toRegime: 'recovery', portfolioImpact: 2.8, reason: 'Breakout above upper range band confirmed' },
  { id: 'ss-3', date: '2025-10-01', fromStrategy: 'Defensive', toStrategy: 'Mean Reversion', fromRegime: 'bear', toRegime: 'range-bound', portfolioImpact: 1.5, reason: 'Selling pressure exhausted, range forming' },
  { id: 'ss-4', date: '2025-06-01', fromStrategy: 'Options-Like', toStrategy: 'Defensive', fromRegime: 'high-volatility', toRegime: 'bear', portfolioImpact: -3.1, reason: 'Volatility resolved to downside' },
  { id: 'ss-5', date: '2025-04-15', fromStrategy: 'Aggressive Growth', toStrategy: 'Options-Like', fromRegime: 'bull', toRegime: 'high-volatility', portfolioImpact: -1.8, reason: 'NBA playoff injuries caused sudden vol spike' },
  { id: 'ss-6', date: '2024-11-20', fromStrategy: 'Mean Reversion', toStrategy: 'Aggressive Growth', fromRegime: 'range-bound', toRegime: 'bull', portfolioImpact: 5.6, reason: 'Football rookie class breakout drove broad rally' },
  { id: 'ss-7', date: '2024-08-10', fromStrategy: 'Defensive', toStrategy: 'Mean Reversion', fromRegime: 'bear', toRegime: 'range-bound', portfolioImpact: 2.1, reason: 'Bear market bottomed, sideways consolidation began' },
  { id: 'ss-8', date: '2024-05-01', fromStrategy: 'Aggressive Growth', toStrategy: 'Defensive', fromRegime: 'bull', toRegime: 'bear', portfolioImpact: -5.4, reason: 'Market-wide sell-off triggered by grading backlog crisis' },
];

const mockRegimeHistory: RegimeHistory[] = [
  { month: '2024-05', regime: 'bear', confidence: 0.88, marketReturn: -6.2, strategyReturn: -2.1, volatility: 24.5 },
  { month: '2024-06', regime: 'bear', confidence: 0.91, marketReturn: -4.8, strategyReturn: -1.5, volatility: 22.1 },
  { month: '2024-07', regime: 'bear', confidence: 0.85, marketReturn: -3.1, strategyReturn: 0.2, volatility: 20.8 },
  { month: '2024-08', regime: 'range-bound', confidence: 0.72, marketReturn: 1.2, strategyReturn: 2.4, volatility: 12.3 },
  { month: '2024-09', regime: 'range-bound', confidence: 0.78, marketReturn: -0.5, strategyReturn: 1.8, volatility: 10.9 },
  { month: '2024-10', regime: 'range-bound', confidence: 0.81, marketReturn: 0.8, strategyReturn: 2.1, volatility: 11.4 },
  { month: '2024-11', regime: 'bull', confidence: 0.76, marketReturn: 5.4, strategyReturn: 7.2, volatility: 15.6 },
  { month: '2024-12', regime: 'bull', confidence: 0.84, marketReturn: 8.1, strategyReturn: 9.8, volatility: 14.2 },
  { month: '2025-01', regime: 'bull', confidence: 0.89, marketReturn: 6.7, strategyReturn: 8.4, volatility: 13.8 },
  { month: '2025-02', regime: 'bull', confidence: 0.86, marketReturn: 4.2, strategyReturn: 5.9, volatility: 12.5 },
  { month: '2025-03', regime: 'bull', confidence: 0.82, marketReturn: 3.8, strategyReturn: 5.1, volatility: 13.1 },
  { month: '2025-04', regime: 'high-volatility', confidence: 0.79, marketReturn: -2.1, strategyReturn: 1.4, volatility: 32.4 },
  { month: '2025-05', regime: 'high-volatility', confidence: 0.85, marketReturn: 4.6, strategyReturn: 3.8, volatility: 36.8 },
  { month: '2025-06', regime: 'bear', confidence: 0.88, marketReturn: -7.2, strategyReturn: -3.4, volatility: 25.1 },
  { month: '2025-07', regime: 'bear', confidence: 0.92, marketReturn: -5.5, strategyReturn: -2.1, volatility: 23.4 },
  { month: '2025-08', regime: 'bear', confidence: 0.89, marketReturn: -3.8, strategyReturn: -0.9, volatility: 21.7 },
  { month: '2025-09', regime: 'bear', confidence: 0.84, marketReturn: -1.2, strategyReturn: 0.5, volatility: 19.2 },
  { month: '2025-10', regime: 'range-bound', confidence: 0.71, marketReturn: 0.4, strategyReturn: 1.9, volatility: 11.8 },
  { month: '2025-11', regime: 'range-bound', confidence: 0.77, marketReturn: 1.1, strategyReturn: 2.6, volatility: 10.5 },
  { month: '2025-12', regime: 'recovery', confidence: 0.68, marketReturn: 3.2, strategyReturn: 4.5, volatility: 16.9 },
  { month: '2026-01', regime: 'bull', confidence: 0.74, marketReturn: 5.8, strategyReturn: 7.6, volatility: 15.3 },
  { month: '2026-02', regime: 'bull', confidence: 0.82, marketReturn: 7.4, strategyReturn: 9.1, volatility: 14.8 },
  { month: '2026-03', regime: 'bull', confidence: 0.86, marketReturn: 6.1, strategyReturn: 8.3, volatility: 13.5 },
  { month: '2026-04', regime: 'bull', confidence: 0.87, marketReturn: 4.9, strategyReturn: 6.7, volatility: 14.2 },
];

// ---- Getter Functions ----

export function getRegimeStates(): MarketRegimeState[] {
  return mockRegimeStates;
}

export function getCurrentRegime(): MarketRegimeState {
  return mockRegimeStates[0];
}

export function getRegimeTransitions(): RegimeTransition[] {
  return mockTransitions;
}

export function getStrategySwitches(): StrategySwitch[] {
  return mockStrategySwitches;
}

export function getRegimeHistory(): RegimeHistory[] {
  return mockRegimeHistory;
}

export function getTransitionMatrix(): { from: string; to: string; probability: number }[] {
  return mockTransitions.map(t => ({
    from: t.fromRegime,
    to: t.toRegime,
    probability: t.probability,
  }));
}
