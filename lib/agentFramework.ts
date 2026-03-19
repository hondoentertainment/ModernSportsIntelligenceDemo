import { CardInventory } from '../types';
import { LiquidityService } from './liquidityService';
import { forecastPriceTrajectory, analyzeBreakoutPotential } from './predictiveAlpha';
import { generatePopData } from './scarcityService';

// ── Agent Types ───────────────────────────────────────────────────────────

export type AgentRole = 'scout' | 'market' | 'risk' | 'negotiator';

export interface AgentPersona {
  role: AgentRole;
  name: string;
  title: string;
  icon: string;
  color: string;
  specialty: string;
}

export interface AgentAnalysis {
  agent: AgentPersona;
  verdict: 'strong_buy' | 'buy' | 'hold' | 'reduce' | 'sell';
  confidence: number;       // 0-100
  summary: string;
  keyPoints: string[];
  dataPoints: { label: string; value: string; sentiment: 'positive' | 'neutral' | 'negative' }[];
}

export interface InvestmentThesis {
  cardId: string;
  player: string;
  analyses: AgentAnalysis[];
  consensus: {
    verdict: 'strong_buy' | 'buy' | 'hold' | 'reduce' | 'sell';
    confidence: number;
    summary: string;
  };
  dissent?: string;          // If agents disagree, note it
  generatedAt: string;
}

export interface PortfolioBriefing {
  overallHealth: 'excellent' | 'good' | 'fair' | 'poor';
  healthScore: number;       // 0-100
  agentReports: {
    agent: AgentPersona;
    headline: string;
    details: string;
    actionItems: string[];
  }[];
  topPicks: { cardId: string; player: string; reason: string; agent: AgentRole }[];
  warnings: { cardId: string; player: string; warning: string; agent: AgentRole }[];
}

// ── Agent Personas ────────────────────────────────────────────────────────

export const AGENTS: Record<AgentRole, AgentPersona> = {
  scout: {
    role: 'scout',
    name: 'Atlas',
    title: 'Scout Agent',
    icon: '🔭',
    color: '#22C55E',
    specialty: 'Prospect evaluation, breakout detection, talent identification',
  },
  market: {
    role: 'market',
    name: 'Apex',
    title: 'Market Agent',
    icon: '📊',
    color: '#3B82F6',
    specialty: 'Price analysis, market depth, trend identification',
  },
  risk: {
    role: 'risk',
    name: 'Sentinel',
    title: 'Risk Agent',
    icon: '🛡️',
    color: '#F59E0B',
    specialty: 'Risk assessment, portfolio concentration, downside protection',
  },
  negotiator: {
    role: 'negotiator',
    name: 'Viper',
    title: 'Negotiator Agent',
    icon: '🤝',
    color: '#EF4444',
    specialty: 'Deal timing, entry/exit points, negotiation strategy',
  },
};

// ── Scout Agent ───────────────────────────────────────────────────────────

function scoutAnalysis(card: CardInventory): AgentAnalysis {
  const breakout = analyzeBreakoutPotential(card);
  const isProspect = card.league === 'MiLB' || card.year >= 2022;

  let verdict: AgentAnalysis['verdict'] = 'hold';
  let confidence = 50;
  const keyPoints: string[] = [];
  const dataPoints: AgentAnalysis['dataPoints'] = [];

  dataPoints.push({
    label: 'Breakout Score',
    value: `${breakout.breakoutScore}/100`,
    sentiment: breakout.breakoutScore >= 65 ? 'positive' : breakout.breakoutScore >= 40 ? 'neutral' : 'negative',
  });

  dataPoints.push({
    label: 'Prospect Status',
    value: card.league === 'MiLB' ? 'Active Prospect' : isProspect ? 'Recent Class' : 'Established',
    sentiment: card.league === 'MiLB' ? 'positive' : 'neutral',
  });

  if (breakout.breakoutScore >= 75) {
    verdict = 'strong_buy';
    confidence = 80;
    keyPoints.push(`Elite breakout potential (${breakout.breakoutScore}/100) — high-conviction prospect play`);
    keyPoints.push(`Projected upside: +${breakout.upside}% within ${breakout.timeHorizon}`);
  } else if (breakout.breakoutScore >= 55) {
    verdict = 'buy';
    confidence = 65;
    keyPoints.push(`Solid breakout indicators at ${breakout.breakoutScore}/100`);
    keyPoints.push('Accumulate on dips for portfolio growth');
  } else if (isProspect) {
    verdict = 'hold';
    confidence = 50;
    keyPoints.push('Prospect with development upside but unproven');
  } else {
    verdict = 'hold';
    confidence = 45;
    keyPoints.push('Established player — limited breakout catalysts');
  }

  if (card.isAutographed) keyPoints.push('Authenticated autograph adds collector premium');

  const pop = card.popReport || generatePopData(card);
  const popCount = (pop as any).popAtGrade || (pop as any).popCount || card.popCount || 100;
  dataPoints.push({
    label: 'Population',
    value: `${popCount}`,
    sentiment: popCount < 10 ? 'positive' : popCount > 200 ? 'negative' : 'neutral',
  });

  const summary = verdict === 'strong_buy'
    ? `${card.player} shows elite breakout signals. High-conviction accumulation target.`
    : verdict === 'buy'
      ? `${card.player} demonstrates solid prospect indicators. Worth building a position.`
      : `${card.player} is a ${isProspect ? 'developing' : 'stable'} hold in current market conditions.`;

  return { agent: AGENTS.scout, verdict, confidence, summary, keyPoints, dataPoints };
}

// ── Market Agent ──────────────────────────────────────────────────────────

function marketAnalysis(card: CardInventory): AgentAnalysis {
  const trajectory = forecastPriceTrajectory(card);
  const liquidityScore = LiquidityService.calculateLiquidityScore(card);
  const currentVal = card.currentValue || card.purchasePrice || 0;
  const costBasis = card.purchasePrice || 0;
  const roi = costBasis > 0 ? ((currentVal - costBasis) / costBasis) * 100 : 0;

  let verdict: AgentAnalysis['verdict'] = 'hold';
  let confidence = 55;
  const keyPoints: string[] = [];
  const dataPoints: AgentAnalysis['dataPoints'] = [];

  dataPoints.push({
    label: 'Trajectory',
    value: trajectory.trajectory.charAt(0).toUpperCase() + trajectory.trajectory.slice(1),
    sentiment: ['moonshot', 'bullish'].includes(trajectory.trajectory) ? 'positive' : trajectory.trajectory === 'stable' ? 'neutral' : 'negative',
  });

  dataPoints.push({
    label: 'Liquidity',
    value: `${liquidityScore}/100`,
    sentiment: liquidityScore >= 60 ? 'positive' : liquidityScore >= 35 ? 'neutral' : 'negative',
  });

  dataPoints.push({
    label: 'Current ROI',
    value: `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%`,
    sentiment: roi > 20 ? 'positive' : roi > -10 ? 'neutral' : 'negative',
  });

  const proj30Change = trajectory.currentValue > 0
    ? ((trajectory.projections.days30 - trajectory.currentValue) / trajectory.currentValue) * 100
    : 0;
  dataPoints.push({
    label: '30d Projected',
    value: `$${trajectory.projections.days30.toLocaleString()}`,
    sentiment: proj30Change > 3 ? 'positive' : proj30Change < -3 ? 'negative' : 'neutral',
  });

  if (trajectory.trajectory === 'moonshot') {
    verdict = 'strong_buy';
    confidence = 75;
    keyPoints.push('Moonshot trajectory detected — strong upward momentum with favorable fundamentals');
  } else if (trajectory.trajectory === 'bullish') {
    verdict = 'buy';
    confidence = 65;
    keyPoints.push('Bullish price trajectory with positive momentum signals');
  } else if (trajectory.trajectory === 'bearish') {
    verdict = 'reduce';
    confidence = 60;
    keyPoints.push('Bearish market signals — consider reducing exposure');
  } else if (trajectory.trajectory === 'declining') {
    verdict = 'sell';
    confidence = 70;
    keyPoints.push('Declining trajectory — exit or cut losses recommended');
  } else {
    verdict = 'hold';
    confidence = 50;
    keyPoints.push('Stable pricing with no strong directional signals');
  }

  if (liquidityScore >= 70) keyPoints.push('High liquidity ensures flexible exit options');
  if (liquidityScore < 30) keyPoints.push('Low liquidity — may face challenges finding buyers');
  if (roi > 80) keyPoints.push(`Strong ${roi.toFixed(0)}% ROI — consider partial profit-taking`);

  const summary = `Market analysis indicates a ${trajectory.trajectory} outlook for ${card.player}. ` +
    `30-day projection: $${trajectory.projections.days30.toLocaleString()} (${proj30Change >= 0 ? '+' : ''}${proj30Change.toFixed(1)}%). ` +
    `Liquidity score: ${liquidityScore}/100.`;

  return { agent: AGENTS.market, verdict, confidence, summary, keyPoints, dataPoints };
}

// ── Risk Agent ────────────────────────────────────────────────────────────

function riskAnalysis(card: CardInventory, portfolio: CardInventory[]): AgentAnalysis {
  const currentVal = card.currentValue || card.purchasePrice || 0;
  const totalPortfolioVal = portfolio.reduce((sum, c) => sum + (c.currentValue || c.purchasePrice || 0), 0);
  const concentration = totalPortfolioVal > 0 ? (currentVal / totalPortfolioVal) * 100 : 0;
  const volatility = forecastPriceTrajectory(card).volatility;
  const liquidityScore = LiquidityService.calculateLiquidityScore(card);

  let verdict: AgentAnalysis['verdict'] = 'hold';
  let confidence = 60;
  const keyPoints: string[] = [];
  const dataPoints: AgentAnalysis['dataPoints'] = [];

  // Concentration risk
  dataPoints.push({
    label: 'Concentration',
    value: `${concentration.toFixed(1)}%`,
    sentiment: concentration > 25 ? 'negative' : concentration > 15 ? 'neutral' : 'positive',
  });

  if (concentration > 30) {
    keyPoints.push(`ALERT: ${concentration.toFixed(0)}% portfolio concentration — significant single-asset risk`);
    verdict = 'reduce';
    confidence = 75;
  } else if (concentration > 20) {
    keyPoints.push(`Elevated concentration at ${concentration.toFixed(0)}% — monitor for rebalancing`);
  }

  // Volatility risk
  dataPoints.push({
    label: 'Volatility',
    value: volatility.charAt(0).toUpperCase() + volatility.slice(1),
    sentiment: volatility === 'low' ? 'positive' : volatility === 'medium' ? 'neutral' : 'negative',
  });

  if (volatility === 'high') {
    keyPoints.push('High price volatility increases downside risk');
    if (verdict !== 'reduce') verdict = 'hold';
    confidence = Math.max(confidence, 60);
  }

  // Liquidity risk
  dataPoints.push({
    label: 'Exit Risk',
    value: liquidityScore < 30 ? 'High' : liquidityScore < 60 ? 'Medium' : 'Low',
    sentiment: liquidityScore >= 60 ? 'positive' : liquidityScore >= 30 ? 'neutral' : 'negative',
  });

  if (liquidityScore < 25) {
    keyPoints.push('Low liquidity creates significant exit risk — hard to sell quickly at fair price');
  }

  // Ungraded risk
  if (!card.isGraded) {
    keyPoints.push('Raw card — condition uncertainty adds risk premium; consider grading');
    dataPoints.push({ label: 'Grade Risk', value: 'Ungraded', sentiment: 'negative' });
  } else {
    dataPoints.push({ label: 'Grade', value: `${card.gradingCompany} ${card.grade}`, sentiment: 'positive' });
  }

  // Cost basis risk
  const roi = card.purchasePrice > 0 && currentVal > 0
    ? ((currentVal - card.purchasePrice) / card.purchasePrice) * 100
    : 0;
  if (roi < -30) {
    keyPoints.push(`${Math.abs(roi).toFixed(0)}% below cost basis — evaluate whether thesis remains intact`);
    if (verdict === 'hold') verdict = 'reduce';
  }

  if (keyPoints.length === 0) {
    keyPoints.push('No significant risk flags detected');
    verdict = 'hold';
  }

  const riskLevel = concentration > 25 || volatility === 'high' || liquidityScore < 25 ? 'elevated' : 'manageable';
  const summary = `Risk assessment for ${card.player}: ${riskLevel} risk profile. ` +
    `Portfolio concentration: ${concentration.toFixed(1)}%, volatility: ${volatility}, exit risk: ${liquidityScore < 30 ? 'high' : 'manageable'}.`;

  return { agent: AGENTS.risk, verdict, confidence, summary, keyPoints, dataPoints };
}

// ── Negotiator Agent ──────────────────────────────────────────────────────

function negotiatorAnalysis(card: CardInventory): AgentAnalysis {
  const currentVal = card.currentValue || card.purchasePrice || 0;
  const costBasis = card.purchasePrice || 0;
  const roi = costBasis > 0 ? ((currentVal - costBasis) / costBasis) * 100 : 0;
  const trajectory = forecastPriceTrajectory(card);
  const liquidityScore = LiquidityService.calculateLiquidityScore(card);

  let verdict: AgentAnalysis['verdict'] = 'hold';
  let confidence = 55;
  const keyPoints: string[] = [];
  const dataPoints: AgentAnalysis['dataPoints'] = [];

  // Timing analysis
  const isBuyWindow = trajectory.trajectory === 'bearish' || trajectory.trajectory === 'declining';
  const isSellWindow = roi > 60 && (trajectory.trajectory === 'stable' || trajectory.momentum < 0);

  dataPoints.push({
    label: 'Entry Timing',
    value: isBuyWindow ? 'Favorable' : trajectory.trajectory === 'stable' ? 'Neutral' : 'Unfavorable',
    sentiment: isBuyWindow ? 'positive' : 'neutral',
  });

  dataPoints.push({
    label: 'Exit Timing',
    value: isSellWindow ? 'Optimal' : roi > 30 ? 'Good' : 'Premature',
    sentiment: isSellWindow ? 'positive' : roi > 30 ? 'neutral' : 'negative',
  });

  // Fair deal price range
  const fairLow = Math.round(currentVal * 0.88);
  const fairHigh = Math.round(currentVal * 1.05);
  dataPoints.push({
    label: 'Fair Range',
    value: `$${fairLow.toLocaleString()} – $${fairHigh.toLocaleString()}`,
    sentiment: 'neutral',
  });

  // Negotiation leverage
  const leverage = liquidityScore >= 60 ? 'strong' : liquidityScore >= 35 ? 'moderate' : 'weak';
  dataPoints.push({
    label: 'Leverage',
    value: leverage.charAt(0).toUpperCase() + leverage.slice(1),
    sentiment: leverage === 'strong' ? 'positive' : leverage === 'weak' ? 'negative' : 'neutral',
  });

  if (isBuyWindow) {
    verdict = 'buy';
    confidence = 70;
    keyPoints.push(`Declining price creates buying opportunity — target entry at $${fairLow.toLocaleString()}`);
    keyPoints.push('Use lowball-and-walk strategy for maximum discount');
  } else if (isSellWindow) {
    verdict = 'sell';
    confidence = 70;
    keyPoints.push(`${roi.toFixed(0)}% ROI with fading momentum — optimal exit window`);
    keyPoints.push(`Target exit price: $${fairHigh.toLocaleString()} via auction/BIN listing`);
  } else if (roi > 80) {
    verdict = 'reduce';
    confidence = 60;
    keyPoints.push(`Lock in gains at ${roi.toFixed(0)}% ROI — sell half, hold half strategy`);
  } else {
    verdict = 'hold';
    confidence = 50;
    keyPoints.push('No urgent entry or exit trigger — maintain position');
  }

  if (leverage === 'strong') keyPoints.push('High liquidity gives strong negotiation leverage');
  if (leverage === 'weak') keyPoints.push('Low liquidity weakens negotiation position — patience required');

  const summary = `Deal analysis for ${card.player}: ${isBuyWindow ? 'favorable buy window' : isSellWindow ? 'optimal exit timing' : 'neutral timing'}. ` +
    `Fair value range: $${fairLow.toLocaleString()}–$${fairHigh.toLocaleString()}. Negotiation leverage: ${leverage}.`;

  return { agent: AGENTS.negotiator, verdict, confidence, summary, keyPoints, dataPoints };
}

// ── Multi-Agent Collaboration ─────────────────────────────────────────────

/**
 * Generate a full investment thesis by running all 4 agents on a card.
 */
export function generateInvestmentThesis(card: CardInventory, portfolio: CardInventory[]): InvestmentThesis {
  const analyses = [
    scoutAnalysis(card),
    marketAnalysis(card),
    riskAnalysis(card, portfolio),
    negotiatorAnalysis(card),
  ];

  // Consensus: weighted average of agent verdicts
  const verdictScores: Record<AgentAnalysis['verdict'], number> = {
    strong_buy: 5, buy: 4, hold: 3, reduce: 2, sell: 1,
  };
  const scoreToVerdict: Record<number, AgentAnalysis['verdict']> = {
    5: 'strong_buy', 4: 'buy', 3: 'hold', 2: 'reduce', 1: 'sell',
  };

  const weights = [0.25, 0.30, 0.25, 0.20]; // market agent weighted slightly higher
  let weightedScore = 0;
  let totalConfidence = 0;
  analyses.forEach((a, i) => {
    weightedScore += verdictScores[a.verdict] * weights[i];
    totalConfidence += a.confidence * weights[i];
  });

  const roundedScore = Math.round(weightedScore);
  const consensusVerdict = scoreToVerdict[Math.max(1, Math.min(5, roundedScore))] || 'hold';

  // Detect dissent
  const verdicts = analyses.map(a => a.verdict);
  const uniqueVerdicts = new Set(verdicts);
  let dissent: string | undefined;
  if (uniqueVerdicts.size >= 3) {
    const dissentingAgents = analyses.filter(a => a.verdict !== consensusVerdict);
    dissent = `${dissentingAgents.map(a => a.agent.name).join(' & ')} disagree: ${dissentingAgents.map(a => `${a.agent.name} says ${a.verdict.replace('_', ' ')}`).join(', ')}.`;
  }

  const consensusSummary = `${analyses.length} agents analyzed ${card.player}. ` +
    `Consensus: ${consensusVerdict.replace('_', ' ').toUpperCase()} with ${Math.round(totalConfidence)}% confidence. ` +
    (dissent ? `Note: ${dissent}` : 'All agents aligned.');

  return {
    cardId: card.id,
    player: card.player,
    analyses,
    consensus: {
      verdict: consensusVerdict,
      confidence: Math.round(totalConfidence),
      summary: consensusSummary,
    },
    dissent,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generate a portfolio-wide briefing from all agents.
 */
export function generatePortfolioBriefing(inventory: CardInventory[]): PortfolioBriefing {
  const active = inventory.filter(c => c.status !== 'sold');
  if (active.length === 0) {
    return {
      overallHealth: 'fair',
      healthScore: 50,
      agentReports: [],
      topPicks: [],
      warnings: [],
    };
  }

  const totalVal = active.reduce((sum, c) => sum + (c.currentValue || c.purchasePrice || 0), 0);
  const avgLiquidity = active.reduce((sum, c) => sum + LiquidityService.calculateLiquidityScore(c), 0) / active.length;

  // Scout report
  const breakouts = active.map(c => ({ card: c, analysis: analyzeBreakoutPotential(c) }));
  const topBreakouts = breakouts.sort((a, b) => b.analysis.breakoutScore - a.analysis.breakoutScore).slice(0, 3);

  // Risk report
  const concentrations = active.map(c => {
    const val = c.currentValue || c.purchasePrice || 0;
    return { card: c, pct: totalVal > 0 ? (val / totalVal) * 100 : 0 };
  }).sort((a, b) => b.pct - a.pct);
  const overConcentrated = concentrations.filter(c => c.pct > 20);

  // Market report
  const trajectories = active.map(c => ({ card: c, trajectory: forecastPriceTrajectory(c) }));
  const declining = trajectories.filter(t => t.trajectory.trajectory === 'declining' || t.trajectory.trajectory === 'bearish');

  // Health score
  let healthScore = 50;
  healthScore += Math.min(avgLiquidity / 5, 15);
  healthScore += topBreakouts.length * 5;
  healthScore -= overConcentrated.length * 10;
  healthScore -= declining.length * 5;
  const leagues = new Set(active.map(c => c.league));
  healthScore += Math.min(leagues.size * 5, 15);
  healthScore = Math.max(10, Math.min(95, Math.round(healthScore)));

  const overallHealth: PortfolioBriefing['overallHealth'] =
    healthScore >= 80 ? 'excellent' : healthScore >= 60 ? 'good' : healthScore >= 40 ? 'fair' : 'poor';

  const agentReports: PortfolioBriefing['agentReports'] = [
    {
      agent: AGENTS.scout,
      headline: topBreakouts.length > 0
        ? `${topBreakouts.length} high-potential breakout candidates identified`
        : 'No strong breakout candidates at this time',
      details: topBreakouts.length > 0
        ? `Top prospect: ${topBreakouts[0].card.player} with a ${topBreakouts[0].analysis.breakoutScore}/100 breakout score.`
        : 'Portfolio skews toward established players. Consider adding prospect exposure.',
      actionItems: topBreakouts.slice(0, 2).map(b =>
        `Monitor ${b.card.player} — ${b.analysis.breakoutTier} with +${b.analysis.upside}% upside`
      ),
    },
    {
      agent: AGENTS.market,
      headline: `Portfolio NAV: $${totalVal.toLocaleString()} across ${active.length} assets`,
      details: `Average liquidity score: ${avgLiquidity.toFixed(0)}/100. ${declining.length > 0 ? `${declining.length} asset(s) showing negative trajectory.` : 'No significant bearish signals.'}`,
      actionItems: declining.slice(0, 2).map(d =>
        `Review ${d.card.player} — ${d.trajectory.trajectory} trajectory (momentum: ${d.trajectory.momentum})`
      ),
    },
    {
      agent: AGENTS.risk,
      headline: overConcentrated.length > 0
        ? `${overConcentrated.length} concentration warning(s) active`
        : 'Portfolio concentration within acceptable limits',
      details: overConcentrated.length > 0
        ? `${overConcentrated[0].card.player} represents ${overConcentrated[0].pct.toFixed(1)}% of portfolio.`
        : `Largest position is ${concentrations[0]?.card.player || 'N/A'} at ${concentrations[0]?.pct.toFixed(1) || 0}%.`,
      actionItems: overConcentrated.map(c =>
        `Reduce ${c.card.player} exposure (${c.pct.toFixed(0)}% → target <15%)`
      ),
    },
    {
      agent: AGENTS.negotiator,
      headline: `${declining.length} potential buy windows, ${active.filter(c => {
        const roi = c.purchasePrice > 0 ? (((c.currentValue || 0) - c.purchasePrice) / c.purchasePrice) * 100 : 0;
        return roi > 60;
      }).length} exit opportunities`,
      details: 'Scanning market timing signals across all positions.',
      actionItems: active
        .filter(c => c.purchasePrice > 0 && ((c.currentValue || 0) - c.purchasePrice) / c.purchasePrice > 0.6)
        .slice(0, 2)
        .map(c => `Consider profit-taking on ${c.player} (ROI: +${(((c.currentValue || 0) - c.purchasePrice) / c.purchasePrice * 100).toFixed(0)}%)`),
    },
  ];

  const topPicks = topBreakouts.map(b => ({
    cardId: b.card.id,
    player: b.card.player,
    reason: `Breakout score ${b.analysis.breakoutScore}/100 — ${b.analysis.recommendation}`,
    agent: 'scout' as AgentRole,
  }));

  const warnings = [
    ...overConcentrated.map(c => ({
      cardId: c.card.id,
      player: c.card.player,
      warning: `${c.pct.toFixed(0)}% portfolio concentration — rebalance recommended`,
      agent: 'risk' as AgentRole,
    })),
    ...declining.slice(0, 3).map(d => ({
      cardId: d.card.id,
      player: d.card.player,
      warning: `${d.trajectory.trajectory} trajectory — evaluate exit`,
      agent: 'market' as AgentRole,
    })),
  ];

  return { overallHealth, healthScore, agentReports, topPicks, warnings };
}
