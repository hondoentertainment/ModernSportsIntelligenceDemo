// ─────────────────────────────────────────────────────────────────────────────
// Tail Risk Hedging Engine Service
// Protects against extreme downside events in sports card portfolios
// ─────────────────────────────────────────────────────────────────────────────

export interface TailRiskMetric {
  id: string;
  metricName: string;
  category: 'var' | 'cvar' | 'max-drawdown' | 'tail-ratio' | 'skewness' | 'kurtosis';
  currentValue: number;
  threshold: number;
  status: 'safe' | 'warning' | 'danger';
  percentile: number;
  historicalWorst: number;
  description: string;
  trendData: { date: string; value: number }[];
}

export interface HedgeStrategy {
  id: string;
  strategyName: string;
  type: 'diversification' | 'cash-reserve' | 'grade-spread' | 'sport-rotation' | 'vintage-hedge' | 'era-neutral' | 'liquidity-buffer' | 'correlation-break';
  description: string;
  protectionLevel: number;
  annualCost: number;
  costBps: number;
  maxProtection: number;
  triggerEvent: string;
  currentAllocation: number;
  effectiveness: number;
  implementationSteps: string[];
  riskReduction: number;
}

export interface ProtectionLevel {
  scenario: string;
  probability: number;
  unhedgedLoss: number;
  hedgedLoss: number;
  protectionGained: number;
  costOfProtection: number;
  netBenefit: number;
  severity: 'mild' | 'moderate' | 'severe' | 'extreme';
}

export interface TailRiskHistory {
  month: string;
  portfolioVar: number;
  portfolioCVaR: number;
  hedgeCost: number;
  protectionUtilized: number;
  maxDrawdown: number;
  tailRatio: number;
}

const tailRiskMetrics: TailRiskMetric[] = [
  {
    id: 'TRM-01', metricName: 'Portfolio Value-at-Risk (95%)', category: 'var',
    currentValue: -8.2, threshold: -10, status: 'warning', percentile: 95,
    historicalWorst: -24.5, description: 'Maximum expected loss at 95% confidence over 30 days',
    trendData: Array.from({ length: 12 }, (_, i) => ({ date: `2025-${String(i + 5 > 12 ? i - 7 : i + 5).padStart(2, '0')}`, value: -(5 + Math.random() * 8) }))
  },
  {
    id: 'TRM-02', metricName: 'Conditional VaR (99%)', category: 'cvar',
    currentValue: -15.4, threshold: -18, status: 'warning', percentile: 99,
    historicalWorst: -38.2, description: 'Expected loss in the worst 1% of scenarios',
    trendData: Array.from({ length: 12 }, (_, i) => ({ date: `2025-${String(i + 5 > 12 ? i - 7 : i + 5).padStart(2, '0')}`, value: -(10 + Math.random() * 12) }))
  },
  {
    id: 'TRM-03', metricName: 'Maximum Drawdown', category: 'max-drawdown',
    currentValue: -12.8, threshold: -20, status: 'safe', percentile: 85,
    historicalWorst: -42.1, description: 'Largest peak-to-trough decline in portfolio value',
    trendData: Array.from({ length: 12 }, (_, i) => ({ date: `2025-${String(i + 5 > 12 ? i - 7 : i + 5).padStart(2, '0')}`, value: -(8 + Math.random() * 10) }))
  },
  {
    id: 'TRM-04', metricName: 'Tail Ratio', category: 'tail-ratio',
    currentValue: 0.72, threshold: 0.5, status: 'safe', percentile: 68,
    historicalWorst: 0.28, description: 'Ratio of right tail gains to left tail losses',
    trendData: Array.from({ length: 12 }, (_, i) => ({ date: `2025-${String(i + 5 > 12 ? i - 7 : i + 5).padStart(2, '0')}`, value: 0.5 + Math.random() * 0.5 }))
  },
  {
    id: 'TRM-05', metricName: 'Return Skewness', category: 'skewness',
    currentValue: -0.85, threshold: -1.5, status: 'safe', percentile: 72,
    historicalWorst: -2.8, description: 'Negative skew indicates more frequent large losses',
    trendData: Array.from({ length: 12 }, (_, i) => ({ date: `2025-${String(i + 5 > 12 ? i - 7 : i + 5).padStart(2, '0')}`, value: -(0.3 + Math.random() * 1.5) }))
  },
  {
    id: 'TRM-06', metricName: 'Excess Kurtosis', category: 'kurtosis',
    currentValue: 4.2, threshold: 6, status: 'warning', percentile: 82,
    historicalWorst: 9.5, description: 'Fat tails indicating higher probability of extreme events',
    trendData: Array.from({ length: 12 }, (_, i) => ({ date: `2025-${String(i + 5 > 12 ? i - 7 : i + 5).padStart(2, '0')}`, value: 2 + Math.random() * 5 }))
  },
];

const hedgeStrategies: HedgeStrategy[] = [
  {
    id: 'HS-01', strategyName: 'Cross-Sport Diversification', type: 'diversification',
    description: 'Distribute holdings across baseball, basketball, football, and hockey to reduce single-sport concentration risk',
    protectionLevel: 35, annualCost: 0.8, costBps: 80, maxProtection: 45, triggerEvent: 'Sport-specific downturn exceeding 15%',
    currentAllocation: 22, effectiveness: 78, riskReduction: 28,
    implementationSteps: ['Audit current sport allocation', 'Identify underweight sports', 'Acquire positions in uncorrelated sport segments', 'Rebalance quarterly']
  },
  {
    id: 'HS-02', strategyName: 'Cash Reserve Buffer', type: 'cash-reserve',
    description: 'Maintain 15-25% cash reserve to buy dips and avoid forced selling during downturns',
    protectionLevel: 50, annualCost: 2.5, costBps: 250, maxProtection: 60, triggerEvent: 'Portfolio drawdown exceeding 10%',
    currentAllocation: 18, effectiveness: 85, riskReduction: 42,
    implementationSteps: ['Liquidate lowest-conviction positions', 'Set target cash allocation at 20%', 'Create automatic rebalance triggers', 'Deploy cash on 15%+ drawdowns']
  },
  {
    id: 'HS-03', strategyName: 'Grade Spread Hedge', type: 'grade-spread',
    description: 'Pair high-grade positions with mid-grade of same card to capture grade premium compression',
    protectionLevel: 25, annualCost: 0.5, costBps: 50, maxProtection: 35, triggerEvent: 'PSA 10 premium over PSA 9 exceeds 3x',
    currentAllocation: 12, effectiveness: 62, riskReduction: 18,
    implementationSteps: ['Identify cards with extreme grade premiums', 'Buy PSA 9 versions as hedge', 'Monitor grade premium ratios', 'Close when premium normalizes']
  },
  {
    id: 'HS-04', strategyName: 'Sport Rotation Defense', type: 'sport-rotation',
    description: 'Rotate into in-season sports and out of off-season sports to capture seasonal momentum',
    protectionLevel: 30, annualCost: 1.2, costBps: 120, maxProtection: 40, triggerEvent: 'Season transition periods',
    currentAllocation: 15, effectiveness: 71, riskReduction: 24,
    implementationSteps: ['Map sport season calendar', 'Reduce off-season holdings 30 days pre-end', 'Increase in-season holdings at start', 'Track seasonal momentum signals']
  },
  {
    id: 'HS-05', strategyName: 'Vintage Barbell Strategy', type: 'vintage-hedge',
    description: 'Combine ultra-modern rookies with established vintage to hedge against era-specific crashes',
    protectionLevel: 40, annualCost: 1.5, costBps: 150, maxProtection: 50, triggerEvent: 'Modern or vintage segment drops 20%+',
    currentAllocation: 20, effectiveness: 74, riskReduction: 32,
    implementationSteps: ['Allocate 40% to pre-1985 vintage', 'Allocate 40% to current year rookies', 'Keep 20% in mid-era blue chips', 'Rebalance semi-annually']
  },
  {
    id: 'HS-06', strategyName: 'Era-Neutral Portfolio', type: 'era-neutral',
    description: 'Equal weight across card eras (vintage, junk, modern, ultra-modern) to minimize era risk',
    protectionLevel: 32, annualCost: 0.9, costBps: 90, maxProtection: 42, triggerEvent: 'Any era segment drawdown exceeding 12%',
    currentAllocation: 25, effectiveness: 69, riskReduction: 26,
    implementationSteps: ['Define era buckets and current weights', 'Target 25% allocation per era', 'Trim overweight eras quarterly', 'Add to underweight eras on dips']
  },
  {
    id: 'HS-07', strategyName: 'Liquidity Buffer Maintenance', type: 'liquidity-buffer',
    description: 'Ensure 30%+ of portfolio is in highly liquid cards (sell within 48h) for emergency exits',
    protectionLevel: 45, annualCost: 1.8, costBps: 180, maxProtection: 55, triggerEvent: 'Market-wide liquidity crisis',
    currentAllocation: 32, effectiveness: 82, riskReduction: 38,
    implementationSteps: ['Score all holdings by liquidity', 'Ensure 30% in tier-1 liquid cards', 'Reduce illiquid position sizes', 'Monitor bid-ask spreads weekly']
  },
  {
    id: 'HS-08', strategyName: 'Correlation Break Strategy', type: 'correlation-break',
    description: 'Hold positions with negative or zero correlation to core holdings for crash protection',
    protectionLevel: 55, annualCost: 3.2, costBps: 320, maxProtection: 65, triggerEvent: 'Correlation spike above 0.8 across portfolio',
    currentAllocation: 10, effectiveness: 88, riskReduction: 48,
    implementationSteps: ['Compute correlation matrix of all holdings', 'Identify negatively correlated segments', 'Allocate 10-15% to decorrelated assets', 'Recompute correlations monthly']
  },
];

const protectionLevels: ProtectionLevel[] = [
  { scenario: 'Minor Market Correction (-5%)', probability: 35, unhedgedLoss: -5.0, hedgedLoss: -2.8, protectionGained: 2.2, costOfProtection: 0.8, netBenefit: 1.4, severity: 'mild' },
  { scenario: 'Sport-Specific Crash (-15%)', probability: 18, unhedgedLoss: -15.0, hedgedLoss: -8.5, protectionGained: 6.5, costOfProtection: 1.2, netBenefit: 5.3, severity: 'moderate' },
  { scenario: 'Grading Scandal (-25%)', probability: 5, unhedgedLoss: -25.0, hedgedLoss: -14.2, protectionGained: 10.8, costOfProtection: 1.5, netBenefit: 9.3, severity: 'severe' },
  { scenario: 'Market-Wide Crash (-40%)', probability: 2, unhedgedLoss: -40.0, hedgedLoss: -22.5, protectionGained: 17.5, costOfProtection: 2.0, netBenefit: 15.5, severity: 'extreme' },
  { scenario: 'Liquidity Crisis (-30%)', probability: 4, unhedgedLoss: -30.0, hedgedLoss: -16.8, protectionGained: 13.2, costOfProtection: 1.8, netBenefit: 11.4, severity: 'severe' },
  { scenario: 'Regulatory Shock (-20%)', probability: 8, unhedgedLoss: -20.0, hedgedLoss: -11.5, protectionGained: 8.5, costOfProtection: 1.3, netBenefit: 7.2, severity: 'moderate' },
  { scenario: 'Platform Failure (-35%)', probability: 1, unhedgedLoss: -35.0, hedgedLoss: -19.0, protectionGained: 16.0, costOfProtection: 2.5, netBenefit: 13.5, severity: 'extreme' },
  { scenario: 'Counterfeiting Scare (-12%)', probability: 12, unhedgedLoss: -12.0, hedgedLoss: -7.2, protectionGained: 4.8, costOfProtection: 1.0, netBenefit: 3.8, severity: 'mild' },
];

const tailRiskHistory: TailRiskHistory[] = [
  { month: '2025-05', portfolioVar: -7.5, portfolioCVaR: -13.8, hedgeCost: 1.1, protectionUtilized: 0, maxDrawdown: -5.2, tailRatio: 0.81 },
  { month: '2025-06', portfolioVar: -8.1, portfolioCVaR: -14.5, hedgeCost: 1.2, protectionUtilized: 0, maxDrawdown: -6.8, tailRatio: 0.75 },
  { month: '2025-07', portfolioVar: -9.8, portfolioCVaR: -17.2, hedgeCost: 1.4, protectionUtilized: 15, maxDrawdown: -11.3, tailRatio: 0.62 },
  { month: '2025-08', portfolioVar: -7.2, portfolioCVaR: -13.1, hedgeCost: 1.0, protectionUtilized: 0, maxDrawdown: -4.5, tailRatio: 0.85 },
  { month: '2025-09', portfolioVar: -8.5, portfolioCVaR: -15.0, hedgeCost: 1.3, protectionUtilized: 5, maxDrawdown: -7.9, tailRatio: 0.72 },
  { month: '2025-10', portfolioVar: -7.8, portfolioCVaR: -14.2, hedgeCost: 1.1, protectionUtilized: 0, maxDrawdown: -6.1, tailRatio: 0.78 },
  { month: '2025-11', portfolioVar: -6.9, portfolioCVaR: -12.5, hedgeCost: 1.0, protectionUtilized: 0, maxDrawdown: -3.8, tailRatio: 0.88 },
  { month: '2025-12', portfolioVar: -10.5, portfolioCVaR: -18.8, hedgeCost: 1.5, protectionUtilized: 22, maxDrawdown: -14.2, tailRatio: 0.55 },
  { month: '2026-01', portfolioVar: -8.8, portfolioCVaR: -15.9, hedgeCost: 1.3, protectionUtilized: 8, maxDrawdown: -9.5, tailRatio: 0.68 },
  { month: '2026-02', portfolioVar: -7.6, portfolioCVaR: -13.5, hedgeCost: 1.1, protectionUtilized: 0, maxDrawdown: -5.8, tailRatio: 0.79 },
  { month: '2026-03', portfolioVar: -8.2, portfolioCVaR: -15.4, hedgeCost: 1.2, protectionUtilized: 3, maxDrawdown: -7.1, tailRatio: 0.74 },
  { month: '2026-04', portfolioVar: -8.2, portfolioCVaR: -15.4, hedgeCost: 1.2, protectionUtilized: 0, maxDrawdown: -6.5, tailRatio: 0.72 },
];

export function getTailRiskMetrics(): TailRiskMetric[] { return tailRiskMetrics; }
export function getHedgeStrategies(): HedgeStrategy[] { return hedgeStrategies; }
export function getProtectionLevels(): ProtectionLevel[] { return protectionLevels; }
export function getTailRiskHistory(): TailRiskHistory[] { return tailRiskHistory; }
export function getCurrentVaR(): number { return tailRiskMetrics[0].currentValue; }
export function getCurrentCVaR(): number { return tailRiskMetrics[1].currentValue; }
export function getTotalHedgeCost(): number { return hedgeStrategies.reduce((s, h) => s + h.annualCost * h.currentAllocation / 100, 0); }
export function getAvgProtection(): number { return Math.round(hedgeStrategies.reduce((s, h) => s + h.protectionLevel, 0) / hedgeStrategies.length); }
