// ---- Types ----

export type RebalanceAction = 'buy' | 'sell' | 'hold' | 'upgrade';

export interface RebalanceRecommendation {
  id: string;
  action: RebalanceAction;
  cardDescription: string;
  player: string;
  reason: string;
  expectedImpact: number; // percentage change
  priority: 'high' | 'medium' | 'low';
  currentAllocation: number;
  targetAllocation: number;
}

export interface PortfolioAllocation {
  category: string;
  currentPct: number;
  targetPct: number;
  delta: number;
}

export interface RiskMetric {
  category: string;
  score: number; // 0-100
  label: string;
  description: string;
}

// ---- Mock Data ----

const SPORT_ALLOCATIONS: PortfolioAllocation[] = [
  { category: 'Baseball', currentPct: 38, targetPct: 30, delta: 8 },
  { category: 'Basketball', currentPct: 25, targetPct: 30, delta: -5 },
  { category: 'Football', currentPct: 22, targetPct: 25, delta: -3 },
  { category: 'Hockey', currentPct: 8, targetPct: 8, delta: 0 },
  { category: 'Soccer', currentPct: 4, targetPct: 5, delta: -1 },
  { category: 'Other', currentPct: 3, targetPct: 2, delta: 1 },
];

const GRADE_ALLOCATIONS: PortfolioAllocation[] = [
  { category: 'PSA 10 / BGS 9.5+', currentPct: 18, targetPct: 25, delta: -7 },
  { category: 'PSA 9 / BGS 9', currentPct: 30, targetPct: 30, delta: 0 },
  { category: 'PSA 8 / BGS 8.5', currentPct: 22, targetPct: 20, delta: 2 },
  { category: 'PSA 7 & Below', currentPct: 15, targetPct: 10, delta: 5 },
  { category: 'Raw / Ungraded', currentPct: 15, targetPct: 15, delta: 0 },
];

const ERA_ALLOCATIONS: PortfolioAllocation[] = [
  { category: 'Vintage (Pre-1980)', currentPct: 12, targetPct: 15, delta: -3 },
  { category: 'Junk Wax (1980-1994)', currentPct: 20, targetPct: 10, delta: 10 },
  { category: 'Modern (1995-2015)', currentPct: 28, targetPct: 30, delta: -2 },
  { category: 'Ultra-Modern (2016+)', currentPct: 40, targetPct: 45, delta: -5 },
];

const RECOMMENDATIONS: RebalanceRecommendation[] = [
  {
    id: 'rec-001',
    action: 'sell',
    cardDescription: '1989 Topps Ken Griffey Jr. RC #1 PSA 8',
    player: 'Ken Griffey Jr.',
    reason: 'Junk wax era overweight by 10%. This card has peaked in the current cycle. Reallocate proceeds to underweight modern basketball.',
    expectedImpact: 2.4,
    priority: 'high',
    currentAllocation: 3.2,
    targetAllocation: 1.5,
  },
  {
    id: 'rec-002',
    action: 'buy',
    cardDescription: '2020 Panini Prizm Anthony Edwards RC Silver #258',
    player: 'Anthony Edwards',
    reason: 'Basketball allocation is 5% below target. Edwards has strong upside with playoff performance trending up and is undervalued relative to peers.',
    expectedImpact: 3.1,
    priority: 'high',
    currentAllocation: 0,
    targetAllocation: 2.5,
  },
  {
    id: 'rec-003',
    action: 'upgrade',
    cardDescription: '2018 Topps Chrome Shohei Ohtani RC #150 PSA 9 → PSA 10',
    player: 'Shohei Ohtani',
    reason: 'Gem-mint allocation is 7% below target. PSA 10 commands 3.2x premium over PSA 9 for this card. High ROI upgrade candidate.',
    expectedImpact: 4.8,
    priority: 'high',
    currentAllocation: 1.8,
    targetAllocation: 3.0,
  },
  {
    id: 'rec-004',
    action: 'sell',
    cardDescription: '1987 Topps Barry Bonds RC #320 PSA 9',
    player: 'Barry Bonds',
    reason: 'Low-grade vintage overweight. HOF controversy limits upside. Redirect to modern football allocation gap.',
    expectedImpact: 1.2,
    priority: 'medium',
    currentAllocation: 2.1,
    targetAllocation: 0.5,
  },
  {
    id: 'rec-005',
    action: 'buy',
    cardDescription: '2020 Panini Mosaic Justin Herbert RC Prizm #263',
    player: 'Justin Herbert',
    reason: 'Football allocation is 3% underweight. Herbert is a franchise QB entering his prime. Strong floor with significant ceiling.',
    expectedImpact: 2.2,
    priority: 'medium',
    currentAllocation: 0.5,
    targetAllocation: 2.0,
  },
  {
    id: 'rec-006',
    action: 'hold',
    cardDescription: '2003 Topps Chrome LeBron James RC #111 PSA 9',
    player: 'LeBron James',
    reason: 'Blue-chip anchor holding. Post-retirement appreciation expected. Current allocation aligns with target weight.',
    expectedImpact: 0,
    priority: 'low',
    currentAllocation: 5.5,
    targetAllocation: 5.5,
  },
  {
    id: 'rec-007',
    action: 'sell',
    cardDescription: '1990 Score #1 Joe Montana PSA 10',
    player: 'Joe Montana',
    reason: 'Junk wax surplus. High pop count limits price appreciation. Better options exist for football allocation.',
    expectedImpact: 0.8,
    priority: 'medium',
    currentAllocation: 1.4,
    targetAllocation: 0.3,
  },
  {
    id: 'rec-008',
    action: 'buy',
    cardDescription: '1986 Fleer Michael Jordan RC #57 SGC 7',
    player: 'Michael Jordan',
    reason: 'Vintage allocation is 3% underweight. Even lower-grade Jordan RCs appreciate consistently. Iconic card with deep liquidity.',
    expectedImpact: 2.0,
    priority: 'medium',
    currentAllocation: 0,
    targetAllocation: 1.8,
  },
  {
    id: 'rec-009',
    action: 'upgrade',
    cardDescription: '2022 Topps Chrome Julio Rodriguez RC #200 Raw → PSA 10',
    player: 'Julio Rodriguez',
    reason: 'Raw card pool is at target but gem-mint is underweight. Centering looks strong — high probability of PSA 10 at 85%+ odds.',
    expectedImpact: 1.5,
    priority: 'low',
    currentAllocation: 0.6,
    targetAllocation: 1.2,
  },
  {
    id: 'rec-010',
    action: 'hold',
    cardDescription: '2018 Panini Prizm Luka Doncic RC Silver #280 PSA 10',
    player: 'Luka Doncic',
    reason: 'Core holding in basketball allocation. MVP trajectory intact. No action needed until target rebalance threshold is triggered.',
    expectedImpact: 0,
    priority: 'low',
    currentAllocation: 4.2,
    targetAllocation: 4.0,
  },
];

const RISK_METRICS: RiskMetric[] = [
  {
    category: 'Concentration Risk',
    score: 62,
    label: 'Moderate',
    description: 'Top 5 holdings represent 22% of portfolio. Consider diversifying to reduce single-player exposure.',
  },
  {
    category: 'Liquidity Risk',
    score: 35,
    label: 'Low',
    description: 'Most holdings have strong secondary market demand. Average days-to-sell: 8.',
  },
  {
    category: 'Grade Risk',
    score: 48,
    label: 'Moderate',
    description: 'Gem-mint allocation is below target. Lower grades carry higher downside in market corrections.',
  },
  {
    category: 'Era Diversification',
    score: 55,
    label: 'Moderate',
    description: 'Heavy tilt toward junk wax era. These cards have limited upside due to overproduction.',
  },
  {
    category: 'Sport Diversification',
    score: 42,
    label: 'Low-Moderate',
    description: 'Slight overweight in baseball. Adding basketball and football exposure would improve balance.',
  },
];

// ---- Service Functions ----

export function getPortfolioAllocations(
  type: 'sport' | 'grade' | 'era' = 'sport'
): PortfolioAllocation[] {
  switch (type) {
    case 'grade':
      return GRADE_ALLOCATIONS;
    case 'era':
      return ERA_ALLOCATIONS;
    case 'sport':
    default:
      return SPORT_ALLOCATIONS;
  }
}

export function getRebalanceRecommendations(): RebalanceRecommendation[] {
  return RECOMMENDATIONS;
}

export function getOptimizationScore(): number {
  // Composite score based on how close current allocations are to targets
  const allAllocations = [
    ...SPORT_ALLOCATIONS,
    ...GRADE_ALLOCATIONS,
    ...ERA_ALLOCATIONS,
  ];
  const totalDelta = allAllocations.reduce(
    (sum, a) => sum + Math.abs(a.delta),
    0
  );
  // Max possible delta spread across all categories ~100
  const score = Math.max(0, Math.round(100 - totalDelta * 1.2));
  return score;
}

export function getPortfolioHealthScore(): number {
  const optScore = getOptimizationScore();
  const avgRisk =
    RISK_METRICS.reduce((sum, r) => sum + r.score, 0) / RISK_METRICS.length;
  // Health = weighted combo of optimization and inverse risk
  return Math.round(optScore * 0.6 + (100 - avgRisk) * 0.4);
}

export function getRiskMetrics(): RiskMetric[] {
  return RISK_METRICS;
}

// ---- Cross-reference: Portfolio Attribution (Phase 89) ----
// Bridge functions to integrate attribution data into rebalancer recommendations

import {
  getReturnAttribution,
  getAlphaBeta,
  getPerformanceDecomposition,
  type ReturnAttribution,
  type AlphaBeta,
  type PerformanceDecomposition,
} from './portfolioAttributionService';

export interface RebalancerAttributionContext {
  attribution: ReturnAttribution;
  alphaBeta: AlphaBeta;
  decomposition: PerformanceDecomposition;
  attributionDrivenRecommendations: string[];
}

/**
 * Enriches rebalancer recommendations with attribution analysis from Phase 89.
 * Uses factor-level return data to identify which allocation changes would
 * improve portfolio alpha generation.
 */
export function getAttributionEnrichedContext(
  period: '1m' | '3m' | '6m' | '1y' | 'ytd' = '1y'
): RebalancerAttributionContext {
  const attribution = getReturnAttribution(period);
  const alphaBeta = getAlphaBeta();
  const decomposition = getPerformanceDecomposition(period);

  const recommendations: string[] = [];

  // Generate attribution-driven recommendations
  const negativeFactors = attribution.factors.filter(f => f.contribution < 0);
  for (const factor of negativeFactors) {
    if (factor.name === 'sport_rotation') {
      recommendations.push(
        `Sport rotation dragged returns by ${Math.abs(factor.contribution).toFixed(1)}%. Consider adjusting sport allocation weights.`
      );
    }
    if (factor.name === 'era_shift') {
      recommendations.push(
        `Era shift factor negative at ${factor.contribution.toFixed(1)}%. Review vintage vs modern allocation.`
      );
    }
    if (factor.name === 'momentum') {
      recommendations.push(
        `Momentum factor negative. Consider reducing holdings in cards with declining price trends.`
      );
    }
  }

  if (alphaBeta.alpha < 0) {
    recommendations.push(
      `Negative alpha of ${alphaBeta.alpha.toFixed(2)}% vs ${alphaBeta.benchmark}. Rebalancing towards higher-conviction positions may help.`
    );
  }

  if (decomposition.percentLuck > 40) {
    recommendations.push(
      `${decomposition.percentLuck}% of returns attributed to luck factor. Increase systematic allocation to reduce randomness.`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push('Attribution analysis shows balanced factor exposure. Current allocation is well-optimized.');
  }

  return {
    attribution,
    alphaBeta,
    decomposition,
    attributionDrivenRecommendations: recommendations,
  };
}

export default {
  getPortfolioAllocations,
  getRebalanceRecommendations,
  getOptimizationScore,
  getPortfolioHealthScore,
  getRiskMetrics,
  getAttributionEnrichedContext,
};
