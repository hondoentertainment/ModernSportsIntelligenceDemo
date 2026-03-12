import { CardInventory, ExitPlan, Sport } from '../types';
import { generatePopData } from './scarcityService';

// ─── Phase 68: Liquidity Intelligence Types ─────────────────────────────────

export interface LiquidityScoreDetail {
  cardId: string;
  overall: number; // 0-100
  avgDaysToSell: number;
  bidAskSpread: number; // percentage
  recentVolume: number; // transactions in last 30 days
  activeBuyers: number;
  tier: 'Ultra-Liquid' | 'Liquid' | 'Moderate' | 'Illiquid' | 'Frozen';
}

export interface MarketDepthLevel {
  priceLevel: number;
  buyOrders: number;
  sellOrders: number;
  cumulativeBuy: number;
  cumulativeSell: number;
}

export interface ExitVelocityPoint {
  premiumPercent: number; // -10 to +30
  estimatedDays: number;
  probability: number; // 0-1 chance of selling within that timeframe
  label: string;
}

export interface ListingRecommendation {
  fastestSale: { price: number; days: number; label: string };
  maxValue: { price: number; days: number; label: string };
  riskAdjusted: { price: number; days: number; label: string };
}

export interface PortfolioLiquidityReport {
  overallScore: number;
  avgDaysToSell: number;
  totalValue: number;
  liquidWithin7Days: { count: number; value: number; percent: number };
  liquidWithin30Days: { count: number; value: number; percent: number };
  liquidWithin90Days: { count: number; value: number; percent: number };
  illiquidCards: number;
  illiquidValue: number;
}

export interface IlliquidityOpportunity {
  cardId: string;
  player: string;
  currentValue: number;
  estimatedFairValue: number;
  discount: number; // percentage
  liquidityScore: number;
  reason: string;
}

export interface SeasonalLiquidityPoint {
  month: string;
  monthIndex: number;
  score: number;
  volume: number;
}

export interface SeasonalLiquidityProfile {
  sport: Sport;
  data: SeasonalLiquidityPoint[];
  peakMonth: string;
  troughMonth: string;
}

export interface EmergencyLiquidationCard {
  cardId: string;
  player: string;
  currentValue: number;
  liquidationPrice: number;
  estimatedDays: number;
  liquidityScore: number;
  priority: number; // 1 = sell first
}

export interface EmergencyLiquidationPlan {
  targetAmount: number;
  targetDays: number;
  totalLiquidationValue: number;
  cardsToSell: EmergencyLiquidationCard[];
  feasible: boolean;
  shortfall: number;
}

export interface LiquiditySettings {
  emergencyTargetAmount: number;
  emergencyTargetDays: number;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const STORAGE_KEY = 'msi_liquidity_intel_v68';
const SETTINGS_KEY = 'msi_liquidity_settings_v68';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const SPORT_SEASONAL_PEAKS: Record<Sport, number[]> = {
  Baseball: [2, 3, 4, 6, 7, 9],    // spring training, opening day, ASG, postseason
  Basketball: [0, 1, 2, 3, 5, 9],   // season start, ASG, march madness, draft
  Football: [0, 1, 8, 9, 10, 11],   // playoffs, super bowl, season start
  Hockey: [0, 3, 4, 5, 9],          // season, playoffs, draft
  Soccer: [5, 6, 7, 11],            // summer tournaments, transfer windows
};

// ─── Deterministic Helpers ──────────────────────────────────────────────────

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function seededRange(seed: number, min: number, max: number): number {
  return min + seededRandom(seed) * (max - min);
}

// ─── Original LiquidityService Class (backward compat) ─────────────────────

export class LiquidityService {
  /** Institutional-grade liquidity scoring model. Score 0-100. */
  static calculateLiquidityScore(card: CardInventory): number {
    let score = 50;
    if (card.league === 'MLB' || card.league === 'NBA' || card.league === 'NFL') score += 15;
    if (card.league === 'MiLB') score -= 10;
    const popData = card.popReport || generatePopData(card);
    const pop = (popData as any).popAtGrade || (popData as any).popCount || 0;
    if (pop > 1000) score += 20;
    else if (pop > 100) score += 10;
    else if (pop < 10) score -= 20;
    else if (pop === 1) score -= 35;
    if (card.isGraded) {
      if (card.grade === '10' || card.grade === 'Gem Mint') score += 10;
      if (card.gradingCompany === 'PSA') score += 5;
    } else {
      score -= 15;
    }
    const val = card.currentValue || card.purchasePrice || 0;
    if (val > 10000) score -= 20;
    else if (val < 100) score += 10;
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /** Exit strategy recommendation based on portfolio health and market depth. */
  static generateExitRecommendation(card: CardInventory): Partial<ExitPlan> {
    const score = this.calculateLiquidityScore(card);
    const val = card.currentValue || card.purchasePrice || 0;
    const purchasePrice = card.purchasePrice || 0;
    const roi = val > 0 && purchasePrice > 0 ? ((val - purchasePrice) / purchasePrice) * 100 : 0;
    if (score < 40) {
      return { targetPrice: Math.round(val * 1.5), timeframe: 'Long (1-3y)', strategy: 'Institutional Hold', notes: 'Low liquidity requires specialized auction placement for maximum ROI.' };
    }
    if (roi > 50) {
      return { targetPrice: Math.round(val * 1.1), timeframe: 'Short (3m)', strategy: 'Take Profit', notes: 'High ROI and strong liquidity suggest locking in gains now.' };
    }
    return { targetPrice: Math.round(val * 1.25), timeframe: 'Medium (6-12m)', strategy: 'Take Profit', notes: 'Steady market depth; targeting mid-range appreciation.' };
  }
}

// ─── Phase 68: Enhanced Liquidity Scoring ───────────────────────────────────

function computeBaseLiquidity(card: CardInventory): number {
  let score = 50;
  const sportWeights: Record<Sport, number> = {
    Baseball: 12, Basketball: 15, Football: 14, Hockey: 5, Soccer: 8,
  };
  score += sportWeights[card.sport] || 0;
  if (card.league === 'MLB' || card.league === 'NBA' || card.league === 'NFL') score += 5;
  if (card.league === 'MiLB') score -= 8;

  if (card.isGraded) {
    score += 8;
    if (card.grade === '10' || card.grade === 'Gem Mint') score += 10;
    else if (card.grade === '9' || card.grade === 'Mint') score += 5;
    if (card.gradingCompany === 'PSA') score += 5;
    else if (card.gradingCompany === 'BGS') score += 3;
  } else {
    score -= 12;
  }

  const val = card.currentValue || card.purchasePrice || 0;
  if (val < 50) score += 10;
  else if (val < 200) score += 5;
  else if (val > 10000) score -= 25;
  else if (val > 5000) score -= 15;

  if (card.isAutographed) score += 3;

  if (card.year < 1980) score -= 10;
  else if (card.year < 2000) score -= 5;
  else if (card.year >= 2020) score += 5;

  const playerHash = hashString(card.player + card.id);
  score += seededRange(playerHash, -5, 5);

  return Math.max(0, Math.min(100, Math.round(score)));
}

function computeDaysToSell(liquidityScore: number, card: CardInventory): number {
  const baseDays = Math.round(120 - (liquidityScore * 1.1));
  const seed = hashString(card.id + 'days');
  const jitter = seededRange(seed, 0.85, 1.15);
  return Math.max(1, Math.round(baseDays * jitter));
}

function computeBidAskSpread(liquidityScore: number, card: CardInventory): number {
  const baseSpread = 25 - (liquidityScore * 0.2);
  const seed = hashString(card.id + 'spread');
  const jitter = seededRange(seed, 0.8, 1.2);
  return Math.max(1, Math.round(baseSpread * jitter * 10) / 10);
}

function computeVolume(liquidityScore: number, card: CardInventory): number {
  const baseVolume = Math.round((liquidityScore / 100) * 45);
  const seed = hashString(card.id + 'volume');
  const jitter = seededRange(seed, 0.7, 1.3);
  return Math.max(0, Math.round(baseVolume * jitter));
}

function computeActiveBuyers(liquidityScore: number, card: CardInventory): number {
  const baseBuyers = Math.round((liquidityScore / 100) * 30);
  const seed = hashString(card.id + 'buyers');
  const jitter = seededRange(seed, 0.6, 1.4);
  return Math.max(1, Math.round(baseBuyers * jitter));
}

function scoreTier(score: number): LiquidityScoreDetail['tier'] {
  if (score >= 85) return 'Ultra-Liquid';
  if (score >= 65) return 'Liquid';
  if (score >= 45) return 'Moderate';
  if (score >= 25) return 'Illiquid';
  return 'Frozen';
}

export function calculateDetailedLiquidityScore(card: CardInventory): LiquidityScoreDetail {
  const overall = computeBaseLiquidity(card);
  return {
    cardId: card.id,
    overall,
    avgDaysToSell: computeDaysToSell(overall, card),
    bidAskSpread: computeBidAskSpread(overall, card),
    recentVolume: computeVolume(overall, card),
    activeBuyers: computeActiveBuyers(overall, card),
    tier: scoreTier(overall),
  };
}

// ─── Market Depth ───────────────────────────────────────────────────────────

export function generateMarketDepth(card: CardInventory): MarketDepthLevel[] {
  const val = card.currentValue || card.purchasePrice || 100;
  const score = computeBaseLiquidity(card);
  const levels: MarketDepthLevel[] = [];
  const seed = hashString(card.id + 'depth');

  let cumBuy = 0;
  let cumSell = 0;

  for (let i = -5; i <= 5; i++) {
    const priceLevel = Math.round(val * (1 + i * 0.05));
    const levelSeed = seed + i * 137;

    const buyBase = Math.max(0, Math.round((score / 100) * 15 * (1 - i * 0.15)));
    const sellBase = Math.max(0, Math.round((score / 100) * 12 * (1 + i * 0.15)));

    const buyOrders = Math.max(0, Math.round(buyBase * seededRange(levelSeed, 0.5, 1.5)));
    const sellOrders = Math.max(0, Math.round(sellBase * seededRange(levelSeed + 77, 0.5, 1.5)));

    cumBuy += buyOrders;
    cumSell += sellOrders;

    levels.push({ priceLevel, buyOrders, sellOrders, cumulativeBuy: cumBuy, cumulativeSell: cumSell });
  }

  return levels;
}

// ─── Exit Velocity ──────────────────────────────────────────────────────────

export function calculateExitVelocity(card: CardInventory): ExitVelocityPoint[] {
  const score = computeBaseLiquidity(card);
  const baseDays = computeDaysToSell(score, card);
  const points: ExitVelocityPoint[] = [];

  const premiums = [
    { pct: -10, label: '10% discount', factor: 0.3 },
    { pct: -5, label: '5% discount', factor: 0.5 },
    { pct: 0, label: 'Market price', factor: 1.0 },
    { pct: 5, label: '5% premium', factor: 1.8 },
    { pct: 10, label: '10% premium', factor: 3.2 },
    { pct: 15, label: '15% premium', factor: 5.5 },
    { pct: 20, label: '20% premium', factor: 9.0 },
    { pct: 25, label: '25% premium', factor: 14.0 },
    { pct: 30, label: '30% premium', factor: 22.0 },
  ];

  premiums.forEach(({ pct, label, factor }) => {
    const days = Math.max(1, Math.round(baseDays * factor));
    const prob = Math.max(0.05, Math.min(0.99, 1 - (days / 120)));
    points.push({
      premiumPercent: pct,
      estimatedDays: days,
      probability: Math.round(prob * 100) / 100,
      label,
    });
  });

  return points;
}

// ─── Listing Price Recommendation ───────────────────────────────────────────

export function getListingRecommendation(card: CardInventory): ListingRecommendation {
  const val = card.currentValue || card.purchasePrice || 100;
  const velocity = calculateExitVelocity(card);
  const discountPoint = velocity.find(v => v.premiumPercent === -5) || velocity[0];
  const marketPoint = velocity.find(v => v.premiumPercent === 0) || velocity[2];
  const premiumPoint = velocity.find(v => v.premiumPercent === 10) || velocity[4];

  return {
    fastestSale: {
      price: Math.round(val * 0.95),
      days: discountPoint.estimatedDays,
      label: 'Fastest sale — 5% below market',
    },
    maxValue: {
      price: Math.round(val * 1.15),
      days: Math.round(premiumPoint.estimatedDays * 1.5),
      label: 'Maximum value — 15% above market',
    },
    riskAdjusted: {
      price: Math.round(val * 1.05),
      days: Math.round(marketPoint.estimatedDays * 1.3),
      label: 'Best risk-adjusted — 5% above market',
    },
  };
}

// ─── Portfolio Liquidity Report ─────────────────────────────────────────────

export function getPortfolioLiquidityReport(cards: CardInventory[]): PortfolioLiquidityReport {
  const activeCards = cards.filter(c => c.status !== 'sold');
  if (activeCards.length === 0) {
    return {
      overallScore: 0, avgDaysToSell: 0, totalValue: 0,
      liquidWithin7Days: { count: 0, value: 0, percent: 0 },
      liquidWithin30Days: { count: 0, value: 0, percent: 0 },
      liquidWithin90Days: { count: 0, value: 0, percent: 0 },
      illiquidCards: 0, illiquidValue: 0,
    };
  }

  const scores = activeCards.map(c => ({
    card: c,
    score: calculateDetailedLiquidityScore(c),
    value: c.currentValue || c.purchasePrice || 0,
  }));

  const totalValue = scores.reduce((s, x) => s + x.value, 0);
  const weightedScore = totalValue > 0
    ? scores.reduce((s, x) => s + x.score.overall * (x.value / totalValue), 0)
    : scores.reduce((s, x) => s + x.score.overall, 0) / scores.length;
  const avgDays = scores.reduce((s, x) => s + x.score.avgDaysToSell, 0) / scores.length;

  const within7 = scores.filter(x => x.score.avgDaysToSell <= 7);
  const within30 = scores.filter(x => x.score.avgDaysToSell <= 30);
  const within90 = scores.filter(x => x.score.avgDaysToSell <= 90);
  const illiquid = scores.filter(x => x.score.overall < 25);

  const sumValue = (arr: typeof scores) => arr.reduce((s, x) => s + x.value, 0);

  return {
    overallScore: Math.round(weightedScore),
    avgDaysToSell: Math.round(avgDays),
    totalValue,
    liquidWithin7Days: { count: within7.length, value: sumValue(within7), percent: totalValue > 0 ? Math.round((sumValue(within7) / totalValue) * 100) : 0 },
    liquidWithin30Days: { count: within30.length, value: sumValue(within30), percent: totalValue > 0 ? Math.round((sumValue(within30) / totalValue) * 100) : 0 },
    liquidWithin90Days: { count: within90.length, value: sumValue(within90), percent: totalValue > 0 ? Math.round((sumValue(within90) / totalValue) * 100) : 0 },
    illiquidCards: illiquid.length,
    illiquidValue: sumValue(illiquid),
  };
}

// ─── Illiquidity Premium Detector ───────────────────────────────────────────

export function detectIlliquidityOpportunities(cards: CardInventory[]): IlliquidityOpportunity[] {
  const activeCards = cards.filter(c => c.status !== 'sold');
  const opportunities: IlliquidityOpportunity[] = [];

  for (const card of activeCards) {
    const score = calculateDetailedLiquidityScore(card);
    if (score.overall >= 40) continue;

    const val = card.currentValue || card.purchasePrice || 0;
    if (val <= 0) continue;

    const seed = hashString(card.id + 'illiq');
    const discountPct = seededRange(seed, 8, 25);
    const fairValue = Math.round(val * (1 + discountPct / 100));

    const reasons: string[] = [];
    if (score.recentVolume < 5) reasons.push('Very low trading volume');
    if (score.bidAskSpread > 15) reasons.push('Wide bid-ask spread');
    if (score.activeBuyers < 5) reasons.push('Few active buyers');
    if (score.avgDaysToSell > 60) reasons.push('Extended sell timeline');

    opportunities.push({
      cardId: card.id,
      player: card.player,
      currentValue: val,
      estimatedFairValue: fairValue,
      discount: Math.round(discountPct * 10) / 10,
      liquidityScore: score.overall,
      reason: reasons.join('; ') || 'Low overall liquidity',
    });
  }

  return opportunities.sort((a, b) => b.discount - a.discount);
}

// ─── Seasonal Liquidity Patterns ────────────────────────────────────────────

export function getSeasonalLiquidityProfiles(): SeasonalLiquidityProfile[] {
  const sports: Sport[] = ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'];

  return sports.map(sport => {
    const peaks = SPORT_SEASONAL_PEAKS[sport];
    const data: SeasonalLiquidityPoint[] = MONTH_NAMES.map((month, idx) => {
      const isPeak = peaks.includes(idx);
      const seed = hashString(sport + month);
      const baseScore = isPeak ? seededRange(seed, 70, 95) : seededRange(seed, 30, 65);
      const baseVolume = isPeak ? seededRange(seed + 11, 150, 400) : seededRange(seed + 11, 40, 150);

      return { month, monthIndex: idx, score: Math.round(baseScore), volume: Math.round(baseVolume) };
    });

    const peak = data.reduce((best, d) => d.score > best.score ? d : best, data[0]);
    const trough = data.reduce((worst, d) => d.score < worst.score ? d : worst, data[0]);

    return { sport, data, peakMonth: peak.month, troughMonth: trough.month };
  });
}

// ─── Emergency Liquidation Planner ──────────────────────────────────────────

export function generateEmergencyLiquidationPlan(
  cards: CardInventory[],
  targetAmount: number,
  targetDays: number,
): EmergencyLiquidationPlan {
  const activeCards = cards.filter(c => c.status !== 'sold');

  const candidates = activeCards.map(card => {
    const score = calculateDetailedLiquidityScore(card);
    const val = card.currentValue || card.purchasePrice || 0;

    const urgencyDiscount = targetDays <= 3 ? 0.85 : targetDays <= 7 ? 0.90 : targetDays <= 14 ? 0.93 : 0.95;
    const liquidityDiscount = score.overall >= 70 ? 1.0 : score.overall >= 40 ? 0.95 : 0.88;
    const liquidationPrice = Math.round(val * urgencyDiscount * liquidityDiscount);
    const estimatedDays = Math.max(1, Math.round(score.avgDaysToSell * urgencyDiscount));

    return {
      cardId: card.id,
      player: card.player,
      currentValue: val,
      liquidationPrice,
      estimatedDays,
      liquidityScore: score.overall,
      priority: 0,
      efficiency: liquidationPrice / Math.max(1, estimatedDays),
    };
  })
    .filter(c => c.estimatedDays <= targetDays && c.liquidationPrice > 0)
    .sort((a, b) => b.efficiency - a.efficiency);

  const selected: EmergencyLiquidationCard[] = [];
  let accumulated = 0;

  for (const candidate of candidates) {
    if (accumulated >= targetAmount) break;
    selected.push({
      cardId: candidate.cardId,
      player: candidate.player,
      currentValue: candidate.currentValue,
      liquidationPrice: candidate.liquidationPrice,
      estimatedDays: candidate.estimatedDays,
      liquidityScore: candidate.liquidityScore,
      priority: selected.length + 1,
    });
    accumulated += candidate.liquidationPrice;
  }

  return {
    targetAmount,
    targetDays,
    totalLiquidationValue: accumulated,
    cardsToSell: selected,
    feasible: accumulated >= targetAmount,
    shortfall: Math.max(0, targetAmount - accumulated),
  };
}

// ─── Persistence ────────────────────────────────────────────────────────────

export function saveLiquidityData(data: Record<string, LiquidityScoreDetail>): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* quota */ }
}

export function loadLiquidityData(): Record<string, LiquidityScoreDetail> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function saveLiquiditySettings(settings: LiquiditySettings): void {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* quota */ }
}

export function loadLiquiditySettings(): LiquiditySettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : { emergencyTargetAmount: 5000, emergencyTargetDays: 7 };
  } catch { return { emergencyTargetAmount: 5000, emergencyTargetDays: 7 }; }
}

// ─── Batch Operations ───────────────────────────────────────────────────────

export function computeAllLiquidityScores(cards: CardInventory[]): Record<string, LiquidityScoreDetail> {
  const results: Record<string, LiquidityScoreDetail> = {};
  for (const card of cards) {
    if (card.status === 'sold') continue;
    results[card.id] = calculateDetailedLiquidityScore(card);
  }
  saveLiquidityData(results);
  return results;
}

export function getCardLiquiditySummary(card: CardInventory): {
  score: LiquidityScoreDetail;
  depth: MarketDepthLevel[];
  velocity: ExitVelocityPoint[];
  listing: ListingRecommendation;
} {
  return {
    score: calculateDetailedLiquidityScore(card),
    depth: generateMarketDepth(card),
    velocity: calculateExitVelocity(card),
    listing: getListingRecommendation(card),
  };
}
