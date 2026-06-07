import { CardInventory } from '../../types';
import { LiquidityService } from './liquidityService';
import { countImportedCompSnapshots, getCardHistory } from './priceHistory';
import { generatePopData } from './scarcityService';

/** How forecast confidence is blended: internal history vs imported comp anchors. */
export type AlphaSignalSource = 'historical_only' | 'imported_comps' | 'hybrid';

/** Auditable inputs behind the headline confidence percentage. */
export interface AlphaConfidenceBreakdown {
  historyDepthScore: number;
  liquidityQualityScore: number;
  scarcityQualityScore: number;
  volatilityAdjustment: number;
  gradeBonusPoints: number;
  importedCompBonusPoints: number;
  sourceModelWeightPct: number;
  externalCompWeightPct: number;
  historyPoints: number;
  importedCompSnapshots: number;
  signalSource: AlphaSignalSource;
  summaryLines: string[];
}

/** Price trajectory forecast for a single card */
export interface PriceTrajectory {
  cardId: string;
  currentValue: number;
  projections: {
    days30: number;
    days90: number;
    days180: number;
    days365: number;
  };
  confidence: number;          // 0-100
  trajectory: 'moonshot' | 'bullish' | 'stable' | 'bearish' | 'declining';
  momentum: number;            // -100 to +100
  volatility: 'low' | 'medium' | 'high';
  catalysts: string[];         // Reasons driving the forecast
  signalSource: AlphaSignalSource;
  /** Short UI label for signal mode */
  signalSourceLabel: string;
  confidenceBreakdown: AlphaConfidenceBreakdown;
}

const SIGNAL_LABEL: Record<AlphaSignalSource, string> = {
  historical_only: 'In-app history only',
  imported_comps: 'Imported comps (sparse MSI history)',
  hybrid: 'History + imported comps',
};

/**
 * Pure helper for tests: choose signal mode from counts.
 * - `hybrid`: at least one imported comp anchor and enough internal points to blend.
 * - `imported_comps`: imported anchors exist but internal history is thin.
 */
export function resolveAlphaSignalSource(historyPoints: number, importedCompSnapshots: number): AlphaSignalSource {
  if (importedCompSnapshots === 0) return 'historical_only';
  if (historyPoints >= 4) return 'hybrid';
  return 'imported_comps';
}

function computeConfidenceAndBreakdown(params: {
  historyLen: number;
  importedCompSnapshots: number;
  signalSource: AlphaSignalSource;
  liquidityScore: number;
  volatility: 'low' | 'medium' | 'high';
  isGraded: boolean;
  popCount: number;
}): { confidence: number; breakdown: AlphaConfidenceBreakdown } {
  const {
    historyLen,
    importedCompSnapshots,
    signalSource,
    liquidityScore,
    volatility,
    isGraded,
    popCount,
  } = params;

  const historyDepthScore = Math.min(100, historyLen * 10);
  const liquidityQualityScore = Math.max(0, Math.min(100, liquidityScore));
  let scarcityQualityScore: number;
  if (popCount === 1) scarcityQualityScore = 95;
  else if (popCount < 10) scarcityQualityScore = 78;
  else if (popCount < 50) scarcityQualityScore = 62;
  else if (popCount < 200) scarcityQualityScore = 48;
  else scarcityQualityScore = 28;

  let volatilityAdjustment: number;
  if (volatility === 'low') volatilityAdjustment = 10;
  else if (volatility === 'medium') volatilityAdjustment = 3;
  else volatilityAdjustment = -12;

  const gradeBonusPoints = isGraded ? 10 : 0;

  let importedCompBonusPoints = 0;
  if (signalSource === 'hybrid') {
    importedCompBonusPoints = Math.min(12, importedCompSnapshots * 4);
  } else if (signalSource === 'imported_comps') {
    importedCompBonusPoints = Math.min(15, 6 + importedCompSnapshots * 3);
  }

  let externalCompWeightPct = 0;
  if (signalSource === 'hybrid') {
    externalCompWeightPct = Math.min(40, 12 + importedCompSnapshots * 9);
  } else if (signalSource === 'imported_comps') {
    externalCompWeightPct = Math.min(55, 25 + importedCompSnapshots * 10);
  }
  const sourceModelWeightPct = 100 - externalCompWeightPct;

  let confidence = 30;
  if (historyLen >= 5) confidence += 20;
  if (historyLen >= 10) confidence += 15;
  if (isGraded) confidence += 10;
  if (liquidityScore >= 60) confidence += 10;
  if (volatility === 'low') confidence += 10;
  else if (volatility === 'high') confidence -= 10;
  confidence += importedCompBonusPoints;
  confidence = Math.max(10, Math.min(95, confidence));

  const summaryLines: string[] = [
    `In-app snapshots: ${historyLen}; imported comp anchor(s): ${importedCompSnapshots}.`,
    `Planning weights: ~${sourceModelWeightPct}% MSI model / ~${externalCompWeightPct}% imported comp anchors (not a guarantee).`,
    `Liquidity ${liquidityQualityScore}/100; scarcity (POP ~${popCount}) display score ${scarcityQualityScore}/100.`,
  ];
  if (volatilityAdjustment <= -8) {
    summaryLines.push('Higher volatility on recent history widens uncertainty.');
  } else if (volatilityAdjustment >= 8) {
    summaryLines.push('Calmer recent history supports tighter heuristic bands.');
  }

  return {
    confidence,
    breakdown: {
      historyDepthScore,
      liquidityQualityScore,
      scarcityQualityScore,
      volatilityAdjustment,
      gradeBonusPoints,
      importedCompBonusPoints,
      sourceModelWeightPct,
      externalCompWeightPct,
      historyPoints: historyLen,
      importedCompSnapshots,
      signalSource,
      summaryLines,
    },
  };
}

/** Breakout probability for prospect/emerging cards */
export interface BreakoutAnalysis {
  cardId: string;
  player: string;
  breakoutScore: number;       // 0-100
  breakoutTier: 'Elite Breakout' | 'High Potential' | 'Moderate' | 'Low' | 'Unlikely';
  factors: BreakoutFactor[];
  upside: number;              // Potential % gain if breakout occurs
  timeHorizon: string;         // Expected breakout window
  recommendation: 'Strong Buy' | 'Buy' | 'Hold' | 'Reduce' | 'Sell';
}

export interface BreakoutFactor {
  name: string;
  score: number;               // 0-100 contribution
  weight: number;              // How much this factor matters
  description: string;
}

/** Portfolio-wide prediction summary */
export interface PredictivePortfolioSummary {
  totalProjectedValue30d: number;
  totalProjectedValue90d: number;
  projectedDelta30d: number;   // % change
  projectedDelta90d: number;
  topBreakouts: BreakoutAnalysis[];
  riskCards: PriceTrajectory[];  // Cards with bearish/declining trajectory
  overallSentiment: 'very bullish' | 'bullish' | 'neutral' | 'bearish' | 'very bearish';
}

// ── Momentum Calculation ──────────────────────────────────────────────────

function calculateMomentum(cardId: string, _currentValue: number): number {
  const history = getCardHistory(cardId);
  if (history.length < 2) return 0;

  const values = history.slice(0, 10).map(s => s.value).reverse();
  if (values.length < 2) return 0;

  // Weighted momentum: recent changes matter more
  let weightedChange = 0;
  let totalWeight = 0;
  for (let i = 1; i < values.length; i++) {
    const change = (values[i] - values[i - 1]) / values[i - 1];
    const weight = i; // More recent = higher weight
    weightedChange += change * weight;
    totalWeight += weight;
  }

  const avgChange = totalWeight > 0 ? weightedChange / totalWeight : 0;
  // Map to -100 to +100
  return Math.max(-100, Math.min(100, Math.round(avgChange * 1000)));
}

// ── Volatility Calculation ────────────────────────────────────────────────

function calculateVolatility(cardId: string): 'low' | 'medium' | 'high' {
  const history = getCardHistory(cardId);
  if (history.length < 3) return 'low';

  const values = history.slice(0, 10).map(s => s.value);
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  if (mean <= 0) return 'medium';
  const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length;
  const coeffOfVariation = Math.sqrt(variance) / mean;

  if (coeffOfVariation > 0.15) return 'high';
  if (coeffOfVariation > 0.07) return 'medium';
  return 'low';
}

// ── Catalyst Detection ────────────────────────────────────────────────────

function detectCatalysts(card: CardInventory, momentum: number, liquidityScore: number): string[] {
  const catalysts: string[] = [];

  // Scarcity catalysts
  const pop = card.popReport || generatePopData(card);
  const popCount = (pop as any).popAtGrade || (pop as any).popCount || card.popCount || 100;
  if (popCount === 1) catalysts.push('Pop 1 — extreme scarcity premium');
  else if (popCount < 10) catalysts.push(`Low pop (${popCount}) — limited supply drives price discovery`);
  else if (popCount < 50) catalysts.push('Below-average population supports upside');

  // Grade premium
  if (card.isGraded && (card.grade === '10' || card.grade === 'Gem Mint')) {
    catalysts.push('PSA 10 / Gem Mint grade commands peak premium');
  }

  // Momentum catalysts
  if (momentum > 30) catalysts.push('Strong positive price momentum detected');
  else if (momentum < -30) catalysts.push('Negative momentum — watch for further decline');

  // League/sport timing
  if (card.league === 'MLB') catalysts.push('MLB season activity drives demand cycles');
  if (card.league === 'NBA') catalysts.push('NBA playoff proximity impacts valuations');
  if (card.league === 'NFL') catalysts.push('NFL draft/season cycle creates entry windows');
  if (card.league === 'MiLB') catalysts.push('Minor league call-up potential — high upside, high risk');

  // Autograph premium
  if (card.isAutographed) catalysts.push('Authenticated autograph adds collector premium');

  // Liquidity catalyst
  if (liquidityScore >= 75) catalysts.push('High liquidity ensures reliable exit options');
  else if (liquidityScore < 30) catalysts.push('Low liquidity — may need patience for optimal exit');

  // Value vs cost
  const roi = card.currentValue && card.purchasePrice
    ? ((card.currentValue - card.purchasePrice) / card.purchasePrice) * 100
    : 0;
  if (roi > 100) catalysts.push(`${Math.round(roi)}% ROI — significant unrealized gains`);
  else if (roi < -30) catalysts.push('Heavily discounted from cost basis — contrarian opportunity or cut-loss candidate');

  return catalysts.slice(0, 5);
}

// ── Price Trajectory Forecast ─────────────────────────────────────────────

/**
 * Generate a price trajectory forecast for a single card.
 * Uses momentum, scarcity, grade, liquidity, and historical trends.
 */
export function forecastPriceTrajectory(card: CardInventory): PriceTrajectory {
  const currentValue = card.currentValue || card.purchasePrice || 0;
  const momentum = calculateMomentum(card.id, currentValue);
  const volatility = calculateVolatility(card.id);
  const liquidityScore = LiquidityService.calculateLiquidityScore(card);

  // Base growth rate from momentum (-10% to +10% per month)
  const monthlyGrowthRate = momentum / 1000;

  // Scarcity multiplier
  const pop = card.popReport || generatePopData(card);
  const popCount = (pop as any).popAtGrade || (pop as any).popCount || card.popCount || 100;
  let scarcityMult = 1.0;
  if (popCount === 1) scarcityMult = 1.3;
  else if (popCount < 10) scarcityMult = 1.15;
  else if (popCount < 50) scarcityMult = 1.05;
  else if (popCount > 500) scarcityMult = 0.95;

  // Grade multiplier
  let gradeMult = 1.0;
  if (card.isGraded && (card.grade === '10' || card.grade === 'Gem Mint')) gradeMult = 1.1;
  else if (!card.isGraded) gradeMult = 0.95;

  // Volatility adjustment (high volatility = wider projections)
  const volFactor = volatility === 'high' ? 1.3 : volatility === 'medium' ? 1.1 : 1.0;

  const history = getCardHistory(card.id);
  const importedCompSnapshots = countImportedCompSnapshots(card.id);
  const signalSource = resolveAlphaSignalSource(history.length, importedCompSnapshots);
  const { confidence, breakdown } = computeConfidenceAndBreakdown({
    historyLen: history.length,
    importedCompSnapshots,
    signalSource,
    liquidityScore,
    volatility,
    isGraded: Boolean(card.isGraded),
    popCount,
  });

  const compLift =
    signalSource === 'historical_only' ? 1 : 1 + Math.min(0.06, importedCompSnapshots * 0.018);

  // Compound projections
  const effectiveRate = monthlyGrowthRate * scarcityMult * gradeMult * volFactor * compLift;
  const project = (months: number) => Math.round(currentValue * Math.pow(1 + effectiveRate, months));

  const projections = {
    days30: project(1),
    days90: project(3),
    days180: project(6),
    days365: project(12),
  };

  // Determine trajectory label
  const annualizedChange = currentValue > 0
    ? ((projections.days365 - currentValue) / currentValue) * 100
    : 0;
  let trajectory: PriceTrajectory['trajectory'];
  if (currentValue <= 0) {
    trajectory = 'stable';
  } else if (annualizedChange > 30) trajectory = 'moonshot';
  else if (annualizedChange > 10) trajectory = 'bullish';
  else if (annualizedChange > -5) trajectory = 'stable';
  else if (annualizedChange > -20) trajectory = 'bearish';
  else trajectory = 'declining';

  const catalysts = detectCatalysts(card, momentum, liquidityScore);

  const normalizedCatalysts = currentValue > 0
    ? catalysts
    : ['Insufficient current valuation data; projections are low-confidence placeholders'];

  return {
    cardId: card.id,
    currentValue,
    projections,
    confidence,
    trajectory,
    momentum,
    volatility,
    catalysts: normalizedCatalysts,
    signalSource,
    signalSourceLabel: SIGNAL_LABEL[signalSource],
    confidenceBreakdown: breakdown,
  };
}

// ── Breakout Analysis ─────────────────────────────────────────────────────

/**
 * Analyze breakout probability for a card.
 * Higher scores for prospects, low-pop, high-momentum cards.
 */
export function analyzeBreakoutPotential(card: CardInventory): BreakoutAnalysis {
  const factors: BreakoutFactor[] = [];
  const momentum = calculateMomentum(card.id, card.currentValue || card.purchasePrice || 0);
  const _liquidityScore = LiquidityService.calculateLiquidityScore(card);

  // Factor 1: Prospect Status (MiLB/young player)
  const isProspect = card.league === 'MiLB' || (card.year >= 2022 && (card.league as string) !== 'MiLB');
  const prospectScore = card.league === 'MiLB' ? 85 : isProspect ? 60 : 20;
  factors.push({
    name: 'Prospect Status',
    score: prospectScore,
    weight: 0.25,
    description: card.league === 'MiLB'
      ? 'Minor league prospect — high breakout potential on call-up'
      : isProspect
        ? 'Recent draft class — emerging talent window'
        : 'Established player — limited breakout upside',
  });

  // Factor 2: Scarcity Profile
  const pop = card.popReport || generatePopData(card);
  const popCount = (pop as any).popAtGrade || (pop as any).popCount || card.popCount || 100;
  const scarcityScore = popCount === 1 ? 95 : popCount < 10 ? 80 : popCount < 50 ? 60 : popCount < 200 ? 40 : 15;
  factors.push({
    name: 'Scarcity',
    score: scarcityScore,
    weight: 0.20,
    description: popCount < 10
      ? `Pop ${popCount} — extreme scarcity amplifies breakout gains`
      : `Pop ${popCount} — ${popCount < 50 ? 'favorable' : 'moderate'} supply dynamics`,
  });

  // Factor 3: Price Momentum
  const momentumScore = Math.max(0, Math.min(100, momentum + 50));
  factors.push({
    name: 'Momentum',
    score: momentumScore,
    weight: 0.20,
    description: momentum > 20
      ? 'Strong upward trajectory in recent valuations'
      : momentum < -20
        ? 'Declining price action — breakout less likely near-term'
        : 'Neutral price movement',
  });

  // Factor 4: Grade Quality
  let gradeScore: number;
  if (card.isGraded) {
    if (card.grade === '10' || card.grade === 'Gem Mint') gradeScore = 90;
    else if (card.grade === '9.5') gradeScore = 80;
    else if (card.grade === '9') gradeScore = 65;
    else gradeScore = 50;
  } else {
    gradeScore = 30; // Raw cards have grading upside but uncertainty
  }
  factors.push({
    name: 'Grade',
    score: gradeScore,
    weight: 0.15,
    description: card.isGraded
      ? `${card.gradingCompany} ${card.grade} — ${gradeScore >= 80 ? 'top-tier grade premium' : 'solid grade with room for regrade'}`
      : 'Raw card — grading could unlock significant value',
  });

  // Factor 5: Market Position
  const currentVal = card.currentValue || card.purchasePrice || 0;
  const costBasis = card.purchasePrice || 0;
  const roi = costBasis > 0 ? ((currentVal - costBasis) / costBasis) * 100 : 0;
  // Undervalued cards (negative ROI) have more breakout room
  const positionScore = roi < -20 ? 80 : roi < 0 ? 65 : roi < 50 ? 50 : roi < 100 ? 35 : 20;
  factors.push({
    name: 'Value Position',
    score: positionScore,
    weight: 0.20,
    description: roi < 0
      ? `${Math.round(Math.abs(roi))}% below cost — contrarian breakout opportunity`
      : `${Math.round(roi)}% ROI — ${roi > 80 ? 'may be near ceiling' : 'room for further appreciation'}`,
  });

  // Calculate weighted breakout score
  const breakoutScore = Math.round(
    factors.reduce((sum, f) => sum + f.score * f.weight, 0)
  );

  // Determine tier
  let breakoutTier: BreakoutAnalysis['breakoutTier'];
  if (breakoutScore >= 80) breakoutTier = 'Elite Breakout';
  else if (breakoutScore >= 65) breakoutTier = 'High Potential';
  else if (breakoutScore >= 45) breakoutTier = 'Moderate';
  else if (breakoutScore >= 25) breakoutTier = 'Low';
  else breakoutTier = 'Unlikely';

  // Estimate upside potential
  const upside = breakoutScore >= 70
    ? Math.round(50 + (breakoutScore - 70) * 3) // 50-140% for high scores
    : Math.round(breakoutScore * 0.5); // 0-35% for low scores

  // Time horizon
  const timeHorizon = card.league === 'MiLB'
    ? '3-12 months (pending call-up)'
    : breakoutScore >= 70
      ? '1-6 months'
      : '6-18 months';

  // Recommendation
  let recommendation: BreakoutAnalysis['recommendation'];
  if (breakoutScore >= 80 && roi < 50) recommendation = 'Strong Buy';
  else if (breakoutScore >= 65) recommendation = 'Buy';
  else if (breakoutScore >= 40) recommendation = 'Hold';
  else if (roi > 80) recommendation = 'Reduce';
  else recommendation = 'Hold';

  return {
    cardId: card.id,
    player: card.player,
    breakoutScore,
    breakoutTier,
    factors,
    upside,
    timeHorizon,
    recommendation,
  };
}

// ── Portfolio-Wide Predictions ─────────────────────────────────────────────

/**
 * Generate a portfolio-wide predictive summary.
 */
export function generatePredictiveSummary(inventory: CardInventory[]): PredictivePortfolioSummary {
  const activeCards = inventory.filter(c => c.status !== 'sold');
  const trajectories = activeCards.map(c => forecastPriceTrajectory(c));
  const breakouts = activeCards.map(c => analyzeBreakoutPotential(c));

  const currentTotal = trajectories.reduce((sum, t) => sum + t.currentValue, 0);
  const total30d = trajectories.reduce((sum, t) => sum + t.projections.days30, 0);
  const total90d = trajectories.reduce((sum, t) => sum + t.projections.days90, 0);

  const projectedDelta30d = currentTotal > 0 ? ((total30d - currentTotal) / currentTotal) * 100 : 0;
  const projectedDelta90d = currentTotal > 0 ? ((total90d - currentTotal) / currentTotal) * 100 : 0;

  // Top breakout candidates
  const topBreakouts = breakouts
    .filter(b => b.breakoutScore >= 50)
    .sort((a, b) => b.breakoutScore - a.breakoutScore)
    .slice(0, 5);

  // Risk cards (bearish/declining)
  const riskCards = trajectories
    .filter(t => t.trajectory === 'bearish' || t.trajectory === 'declining')
    .sort((a, b) => a.momentum - b.momentum)
    .slice(0, 5);

  // Overall sentiment
  const avgMomentum = trajectories.reduce((sum, t) => sum + t.momentum, 0) / (trajectories.length || 1);
  let overallSentiment: PredictivePortfolioSummary['overallSentiment'];
  if (avgMomentum > 30) overallSentiment = 'very bullish';
  else if (avgMomentum > 10) overallSentiment = 'bullish';
  else if (avgMomentum > -10) overallSentiment = 'neutral';
  else if (avgMomentum > -30) overallSentiment = 'bearish';
  else overallSentiment = 'very bearish';

  return {
    totalProjectedValue30d: total30d,
    totalProjectedValue90d: total90d,
    projectedDelta30d: Math.round(projectedDelta30d * 10) / 10,
    projectedDelta90d: Math.round(projectedDelta90d * 10) / 10,
    topBreakouts,
    riskCards,
    overallSentiment,
  };
}
