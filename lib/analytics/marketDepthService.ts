import { CardInventory } from '../../types';
import { LiquidityService } from './liquidityService';
import { generatePopData } from './scarcityService';
import { getCardHistory } from './priceHistory';

// ── Types ─────────────────────────────────────────────────────────────────

/** Simulated order book level */
export interface DepthLevel {
  price: number;
  quantity: number;
  cumulative: number;
}

/** Full market depth snapshot for a card */
export interface MarketDepth {
  cardId: string;
  midPrice: number;
  spread: number;              // Bid-ask spread %
  spreadCategory: 'tight' | 'normal' | 'wide';
  bids: DepthLevel[];          // Buy orders (descending by price)
  asks: DepthLevel[];          // Sell orders (ascending by price)
  totalBidVolume: number;
  totalAskVolume: number;
  buyPressure: number;         // 0-100 (higher = more buyers)
  marketImpact: { units: number; avgSlippage: number }[];
}

/** Volume and velocity metrics for a card */
export interface VolumeMetrics {
  cardId: string;
  dailyVolume: number;         // Estimated cards traded per day
  weeklyVolume: number;
  monthlyVolume: number;
  velocity: 'very fast' | 'fast' | 'moderate' | 'slow' | 'very slow';
  avgDaysToSell: number;       // Average days to sell at market price
  sellThroughRate: number;     // % of listings that sell (0-100)
  recentSales: { price: number; daysAgo: number }[];
  priceConsensus: number;      // How tightly clustered recent sales are (0-100)
}

/** Portfolio-wide liquidity analytics */
export interface PortfolioLiquidityReport {
  totalValue: number;
  liquidValue: number;         // Value in liquid assets (score >= 60)
  moderateValue: number;       // Score 30-59
  illiquidValue: number;       // Score < 30
  liquidPct: number;
  avgLiquidity: number;
  avgDaysToLiquidate: number;  // Days to sell entire portfolio
  buckets: LiquidityBucket[];
  stuckInventory: { card: CardInventory; daysStuck: number; reason: string }[];
  concentrationRisk: { card: CardInventory; pct: number; liquidity: number }[];
}

export interface LiquidityBucket {
  label: string;
  range: string;
  count: number;
  value: number;
  color: string;
}

// ── Market Depth Generation ───────────────────────────────────────────────

/**
 * Generate simulated market depth for a card.
 * Uses liquidity score, population, and value to create realistic order books.
 */
export function generateMarketDepth(card: CardInventory): MarketDepth {
  const currentVal = card.currentValue || card.purchasePrice || 0;
  const liquidityScore = LiquidityService.calculateLiquidityScore(card);
  const pop = card.popReport || generatePopData(card);
  const popCount = (pop as any).popAtGrade || (pop as any).popCount || card.popCount || 100;

  // Spread is inversely proportional to liquidity
  const spreadPct = liquidityScore >= 70 ? 3 + Math.random() * 2
    : liquidityScore >= 40 ? 6 + Math.random() * 4
    : 12 + Math.random() * 8;

  const midPrice = currentVal;
  const halfSpread = midPrice * (spreadPct / 200);

  // Generate bid levels (buyers)
  const bidLevels = liquidityScore >= 60 ? 6 : liquidityScore >= 30 ? 4 : 2;
  const bids: DepthLevel[] = [];
  let cumBid = 0;
  for (let i = 0; i < bidLevels; i++) {
    const price = Math.round((midPrice - halfSpread - (midPrice * 0.02 * i)) * 100) / 100;
    const qty = Math.max(1, Math.round((popCount / 50) * (1 + Math.random()) * (bidLevels - i) / bidLevels));
    cumBid += qty;
    bids.push({ price: Math.max(1, price), quantity: qty, cumulative: cumBid });
  }

  // Generate ask levels (sellers)
  const askLevels = liquidityScore >= 60 ? 6 : liquidityScore >= 30 ? 4 : 2;
  const asks: DepthLevel[] = [];
  let cumAsk = 0;
  for (let i = 0; i < askLevels; i++) {
    const price = Math.round((midPrice + halfSpread + (midPrice * 0.02 * i)) * 100) / 100;
    const qty = Math.max(1, Math.round((popCount / 40) * (1 + Math.random()) * (askLevels - i) / askLevels));
    cumAsk += qty;
    asks.push({ price, quantity: qty, cumulative: cumAsk });
  }

  const totalBidVolume = bids.reduce((s, b) => s + b.quantity, 0);
  const totalAskVolume = asks.reduce((s, a) => s + a.quantity, 0);
  const buyPressure = Math.round((totalBidVolume / (totalBidVolume + totalAskVolume)) * 100);

  // Market impact: slippage for selling N units
  const marketImpact = [1, 3, 5, 10].map(units => {
    const slippage = units <= totalBidVolume
      ? (units / totalBidVolume) * spreadPct * 0.5
      : spreadPct + ((units - totalBidVolume) / Math.max(1, totalBidVolume)) * 10;
    return { units, avgSlippage: Math.round(slippage * 10) / 10 };
  });

  return {
    cardId: card.id,
    midPrice,
    spread: Math.round(spreadPct * 10) / 10,
    spreadCategory: spreadPct < 5 ? 'tight' : spreadPct < 10 ? 'normal' : 'wide',
    bids,
    asks,
    totalBidVolume,
    totalAskVolume,
    buyPressure,
    marketImpact,
  };
}

// ── Volume & Velocity Metrics ─────────────────────────────────────────────

/**
 * Generate volume and velocity metrics for a card.
 */
export function getVolumeMetrics(card: CardInventory): VolumeMetrics {
  const liquidityScore = LiquidityService.calculateLiquidityScore(card);
  const pop = card.popReport || generatePopData(card);
  const popCount = (pop as any).popAtGrade || (pop as any).popCount || card.popCount || 100;
  const currentVal = card.currentValue || card.purchasePrice || 0;

  // Estimate daily volume from population and liquidity
  const baseVolume = (popCount / 500) * (liquidityScore / 50);
  const dailyVolume = Math.max(0.01, Math.round(baseVolume * 100) / 100);
  const weeklyVolume = Math.round(dailyVolume * 7 * 10) / 10;
  const monthlyVolume = Math.round(dailyVolume * 30);

  // Velocity classification
  let velocity: VolumeMetrics['velocity'];
  if (dailyVolume >= 2) velocity = 'very fast';
  else if (dailyVolume >= 0.5) velocity = 'fast';
  else if (dailyVolume >= 0.1) velocity = 'moderate';
  else if (dailyVolume >= 0.03) velocity = 'slow';
  else velocity = 'very slow';

  // Average days to sell
  const avgDaysToSell = dailyVolume > 0
    ? Math.round(Math.max(1, 1 / dailyVolume))
    : 90;

  // Sell-through rate (% of listings that actually sell)
  const sellThroughRate = Math.min(95, Math.max(15,
    liquidityScore * 0.8 + (currentVal < 100 ? 15 : currentVal > 5000 ? -20 : 0)
  ));

  // Simulated recent sales
  const history = getCardHistory(card.id);
  const recentSales = history.length > 0
    ? history.slice(0, 5).map((s, i) => ({
      price: s.value,
      daysAgo: i * Math.max(1, Math.round(avgDaysToSell / 2)),
    }))
    : [
      { price: Math.round(currentVal * (0.95 + Math.random() * 0.1)), daysAgo: 2 },
      { price: Math.round(currentVal * (0.93 + Math.random() * 0.12)), daysAgo: 5 },
      { price: Math.round(currentVal * (0.90 + Math.random() * 0.15)), daysAgo: 10 },
    ];

  // Price consensus: how tightly clustered are recent sales (0-100)
  const prices = recentSales.map(s => s.price);
  const mean = prices.reduce((s, p) => s + p, 0) / prices.length;
  const variance = prices.reduce((s, p) => s + Math.pow(p - mean, 2), 0) / prices.length;
  const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;
  const priceConsensus = Math.max(10, Math.min(100, Math.round((1 - cv * 5) * 100)));

  return {
    cardId: card.id,
    dailyVolume,
    weeklyVolume,
    monthlyVolume,
    velocity,
    avgDaysToSell,
    sellThroughRate: Math.round(sellThroughRate),
    recentSales,
    priceConsensus,
  };
}

// ── Portfolio Liquidity Report ─────────────────────────────────────────────

/**
 * Generate a comprehensive portfolio liquidity report.
 */
export function generatePortfolioLiquidityReport(inventory: CardInventory[]): PortfolioLiquidityReport {
  const active = inventory.filter(c => c.status !== 'sold');

  let liquidValue = 0, moderateValue = 0, illiquidValue = 0;
  const cardScores: { card: CardInventory; score: number; val: number; days: number }[] = [];

  active.forEach(c => {
    const val = c.currentValue || c.purchasePrice || 0;
    const score = LiquidityService.calculateLiquidityScore(c);
    const metrics = getVolumeMetrics(c);

    if (score >= 60) liquidValue += val;
    else if (score >= 30) moderateValue += val;
    else illiquidValue += val;

    cardScores.push({ card: c, score, val, days: metrics.avgDaysToSell });
  });

  const totalValue = liquidValue + moderateValue + illiquidValue;
  const avgLiquidity = cardScores.length > 0
    ? Math.round(cardScores.reduce((s, c) => s + c.score, 0) / cardScores.length)
    : 0;

  // Days to liquidate entire portfolio (sequential selling)
  const avgDaysToLiquidate = cardScores.length > 0
    ? Math.round(cardScores.reduce((s, c) => s + c.days, 0) / cardScores.length * Math.log2(cardScores.length + 1))
    : 0;

  // Liquidity buckets
  const buckets: LiquidityBucket[] = [
    { label: 'Highly Liquid', range: '80-100', count: cardScores.filter(c => c.score >= 80).length, value: cardScores.filter(c => c.score >= 80).reduce((s, c) => s + c.val, 0), color: '#22C55E' },
    { label: 'Liquid', range: '60-79', count: cardScores.filter(c => c.score >= 60 && c.score < 80).length, value: cardScores.filter(c => c.score >= 60 && c.score < 80).reduce((s, c) => s + c.val, 0), color: '#10B981' },
    { label: 'Moderate', range: '40-59', count: cardScores.filter(c => c.score >= 40 && c.score < 60).length, value: cardScores.filter(c => c.score >= 40 && c.score < 60).reduce((s, c) => s + c.val, 0), color: '#F59E0B' },
    { label: 'Low', range: '20-39', count: cardScores.filter(c => c.score >= 20 && c.score < 40).length, value: cardScores.filter(c => c.score >= 20 && c.score < 40).reduce((s, c) => s + c.val, 0), color: '#EF4444' },
    { label: 'Illiquid', range: '0-19', count: cardScores.filter(c => c.score < 20).length, value: cardScores.filter(c => c.score < 20).reduce((s, c) => s + c.val, 0), color: '#991B1B' },
  ];

  // Stuck inventory: cards with very low liquidity and high days-to-sell
  const stuckInventory = cardScores
    .filter(c => c.days >= 30 && c.score < 35)
    .sort((a, b) => b.days - a.days)
    .slice(0, 5)
    .map(c => ({
      card: c.card,
      daysStuck: c.days,
      reason: c.score < 20
        ? 'Extremely low liquidity — consider private sale or auction house'
        : 'Below-average demand — may need price reduction to move',
    }));

  // Concentration risk in illiquid positions
  const concentrationRisk = cardScores
    .filter(c => c.score < 40 && totalValue > 0 && (c.val / totalValue) > 0.1)
    .sort((a, b) => b.val - a.val)
    .slice(0, 5)
    .map(c => ({
      card: c.card,
      pct: Math.round((c.val / totalValue) * 1000) / 10,
      liquidity: c.score,
    }));

  return {
    totalValue,
    liquidValue,
    moderateValue,
    illiquidValue,
    liquidPct: totalValue > 0 ? Math.round((liquidValue / totalValue) * 100) : 0,
    avgLiquidity,
    avgDaysToLiquidate,
    buckets,
    stuckInventory,
    concentrationRisk,
  };
}
