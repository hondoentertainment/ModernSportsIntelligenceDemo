/**
 * Price Chart Service — Phase 36
 * Generates detailed price history data for interactive Recharts-based price charts.
 * Uses deterministic date-seeded random for consistent simulated data.
 */

import { CardInventory } from '../../types';

// ── Types ─────────────────────────────────────────────────────────────────

export interface PriceDataPoint {
  date: string;       // ISO date string
  price: number;
  volume: number;     // Number of sales
  high: number;
  low: number;
  source: 'market' | 'purchase' | 'sale' | 'valuation';
}

export type ChartTimeRange = '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

export interface PriceStatistics {
  currentPrice: number;
  allTimeHigh: number;
  allTimeLow: number;
  avgPrice: number;
  priceChange: number;       // absolute change
  priceChangePct: number;    // percentage change
  volatility: number;        // standard deviation
  sharpeRatio: number;
  maxDrawdown: number;       // absolute max drawdown
  maxDrawdownPct: number;    // percentage max drawdown
  support: number;           // price floor
  resistance: number;        // price ceiling
}

export interface ChartAnnotation {
  date: string;
  label: string;
  type: 'purchase' | 'sale' | 'grade' | 'catalyst' | 'milestone';
}

export interface MovingAveragePoint {
  date: string;
  ma: number | null;
}

export interface BollingerBandPoint {
  date: string;
  upper: number | null;
  lower: number | null;
  middle: number | null;
}

export interface TrendlineResult {
  slope: number;
  intercept: number;
}

export interface SupportResistance {
  support: number;
  resistance: number;
}

// ── Deterministic Seeded Random ───────────────────────────────────────────

function hashSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Simple seeded PRNG (mulberry32) */
function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────

function daysForRange(range: ChartTimeRange): number {
  switch (range) {
    case '1W': return 7;
    case '1M': return 30;
    case '3M': return 90;
    case '6M': return 180;
    case '1Y': return 365;
    case 'ALL': return 730; // ~2 years
  }
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

// ── Core Functions ────────────────────────────────────────────────────────

/**
 * Generate deterministic simulated price history for a card.
 * Uses purchaseDate as anchor, interpolates between purchasePrice and currentValue,
 * adds realistic noise, trends, and seasonal patterns.
 */
export function generatePriceHistory(
  card: CardInventory,
  range: ChartTimeRange
): PriceDataPoint[] {
  const purchasePrice = card.purchasePrice || 50;
  const currentValue = card.currentValue ?? purchasePrice;
  const purchaseDate = card.purchaseDate
    ? new Date(card.purchaseDate)
    : new Date(Date.now() - 365 * 86400000);

  const totalDays = daysForRange(range);
  const endDate = new Date();
  const startDate = addDays(endDate, -totalDays);

  // Seed based on card id + range for deterministic output
  const seed = hashSeed(`${card.id}-${range}-pricechart`);
  const rng = seededRandom(seed);

  // Calculate how many days from purchase to now
  const purchaseToNow = Math.max(
    1,
    Math.floor((endDate.getTime() - purchaseDate.getTime()) / 86400000)
  );

  // Determine the overall trend (annualized drift)
  const totalReturn = (currentValue - purchasePrice) / purchasePrice;
  const dailyDrift = totalReturn / purchaseToNow;

  // Volatility scaled to card value
  const baseVolatility = currentValue > 500 ? 0.012 : currentValue > 100 ? 0.018 : 0.025;

  const points: PriceDataPoint[] = [];
  let price = purchasePrice;

  // If startDate is before purchaseDate, start from purchaseDate
  const effectiveStart = startDate > purchaseDate ? startDate : purchaseDate;
  const numDays = Math.floor(
    (endDate.getTime() - effectiveStart.getTime()) / 86400000
  );

  // Pre-calculate price at effectiveStart
  if (effectiveStart > purchaseDate) {
    const daysElapsed = Math.floor(
      (effectiveStart.getTime() - purchaseDate.getTime()) / 86400000
    );
    // Rough interpolation to starting price
    price = purchasePrice * (1 + dailyDrift * daysElapsed);
    // Add some seeded randomness
    const startRng = seededRandom(seed + daysElapsed);
    price *= 1 + (startRng() - 0.5) * 0.1;
  }

  for (let i = 0; i <= numDays; i++) {
    const currentDate = addDays(effectiveStart, i);
    const dayOfYear = Math.floor(
      (currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / 86400000
    );

    // Seasonal pattern: slight boost in winter (hobby season) and spring (MLB)
    const seasonal = Math.sin((dayOfYear / 365) * Math.PI * 2 - Math.PI / 2) * 0.003;

    // Random walk with drift
    const noise = (rng() - 0.5) * 2 * baseVolatility;
    const momentum = i > 0 && points.length > 0
      ? (price - points[points.length - 1].price) / price * 0.1
      : 0;

    price = price * (1 + dailyDrift + noise + seasonal + momentum);
    price = Math.max(price, 0.5); // Floor at $0.50

    // Snap last day to currentValue
    if (i === numDays) {
      price = currentValue;
    }

    // Generate high/low with realistic intraday range
    const dayRange = price * baseVolatility * (0.5 + rng() * 1.5);
    const high = price + dayRange * (0.3 + rng() * 0.7);
    const low = Math.max(0.5, price - dayRange * (0.3 + rng() * 0.7));

    // Volume: random with some spikes
    const baseVolume = Math.floor(3 + rng() * 12);
    const volumeSpike = rng() > 0.92 ? Math.floor(rng() * 30) : 0;
    const volume = baseVolume + volumeSpike;

    // Determine source
    let source: PriceDataPoint['source'] = 'market';
    const dateStr = formatISO(currentDate);
    if (dateStr === formatISO(purchaseDate)) {
      source = 'purchase';
    } else if (card.saleDate && dateStr === card.saleDate.split('T')[0]) {
      source = 'sale';
    }

    points.push({
      date: dateStr,
      price: Math.round(price * 100) / 100,
      volume,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      source,
    });
  }

  return points;
}

/**
 * Calculate comprehensive statistics from price data points.
 */
export function calculateStatistics(data: PriceDataPoint[]): PriceStatistics {
  if (data.length === 0) {
    return {
      currentPrice: 0,
      allTimeHigh: 0,
      allTimeLow: 0,
      avgPrice: 0,
      priceChange: 0,
      priceChangePct: 0,
      volatility: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      maxDrawdownPct: 0,
      support: 0,
      resistance: 0,
    };
  }

  const prices = data.map(d => d.price);
  const currentPrice = prices[prices.length - 1];
  const firstPrice = prices[0];
  const allTimeHigh = Math.max(...prices);
  const allTimeLow = Math.min(...prices);
  const avgPrice = prices.reduce((s, p) => s + p, 0) / prices.length;

  const priceChange = currentPrice - firstPrice;
  const priceChangePct = firstPrice !== 0 ? (priceChange / firstPrice) * 100 : 0;

  // Daily returns for volatility
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] !== 0) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
  }

  const meanReturn = returns.length > 0
    ? returns.reduce((s, r) => s + r, 0) / returns.length
    : 0;

  const variance = returns.length > 1
    ? returns.reduce((s, r) => s + (r - meanReturn) ** 2, 0) / (returns.length - 1)
    : 0;

  const volatility = Math.sqrt(variance) * Math.sqrt(252); // Annualized
  const annualizedReturn = meanReturn * 252;
  const riskFreeRate = 0.04; // 4% risk-free rate assumption
  const sharpeRatio = volatility !== 0
    ? (annualizedReturn - riskFreeRate) / volatility
    : 0;

  // Max drawdown
  let peak = prices[0];
  let maxDrawdown = 0;
  let maxDrawdownPct = 0;
  for (const p of prices) {
    if (p > peak) peak = p;
    const dd = peak - p;
    const ddPct = peak !== 0 ? (dd / peak) * 100 : 0;
    if (dd > maxDrawdown) {
      maxDrawdown = dd;
      maxDrawdownPct = ddPct;
    }
  }

  // Support/Resistance
  const sr = getSupportResistance(data);

  return {
    currentPrice: Math.round(currentPrice * 100) / 100,
    allTimeHigh: Math.round(allTimeHigh * 100) / 100,
    allTimeLow: Math.round(allTimeLow * 100) / 100,
    avgPrice: Math.round(avgPrice * 100) / 100,
    priceChange: Math.round(priceChange * 100) / 100,
    priceChangePct: Math.round(priceChangePct * 100) / 100,
    volatility: Math.round(volatility * 10000) / 10000,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    maxDrawdown: Math.round(maxDrawdown * 100) / 100,
    maxDrawdownPct: Math.round(maxDrawdownPct * 100) / 100,
    support: sr.support,
    resistance: sr.resistance,
  };
}

/**
 * Generate annotations for a card's price chart.
 */
export function getAnnotations(card: CardInventory): ChartAnnotation[] {
  const annotations: ChartAnnotation[] = [];

  if (card.purchaseDate) {
    annotations.push({
      date: card.purchaseDate.split('T')[0],
      label: `Purchased at $${card.purchasePrice.toFixed(2)}`,
      type: 'purchase',
    });
  }

  if (card.saleDate && card.salePrice) {
    annotations.push({
      date: card.saleDate.split('T')[0],
      label: `Sold at $${card.salePrice.toFixed(2)}`,
      type: 'sale',
    });
  }

  if (card.isGraded && card.gradingCompany && card.grade) {
    // Place grading event shortly after purchase
    const purchaseMs = card.purchaseDate
      ? new Date(card.purchaseDate).getTime()
      : Date.now() - 365 * 86400000;
    const gradeDate = new Date(purchaseMs + 45 * 86400000); // ~45 days after purchase
    annotations.push({
      date: formatISO(gradeDate),
      label: `Graded ${card.gradingCompany} ${card.grade}`,
      type: 'grade',
    });
  }

  // Milestone: if card value doubled from purchase
  const currentVal = card.currentValue ?? card.purchasePrice;
  if (currentVal >= card.purchasePrice * 2) {
    const purchaseMs = card.purchaseDate
      ? new Date(card.purchaseDate).getTime()
      : Date.now() - 365 * 86400000;
    const midpoint = purchaseMs + (Date.now() - purchaseMs) * 0.6;
    annotations.push({
      date: formatISO(new Date(midpoint)),
      label: '2x Purchase Price',
      type: 'milestone',
    });
  }

  return annotations;
}

/**
 * Calculate Simple Moving Average for a given period.
 */
export function calculateMovingAverage(
  data: PriceDataPoint[],
  period: number
): MovingAveragePoint[] {
  return data.map((point, index) => {
    if (index < period - 1) {
      return { date: point.date, ma: null };
    }
    const window = data.slice(index - period + 1, index + 1);
    const avg = window.reduce((sum, p) => sum + p.price, 0) / period;
    return { date: point.date, ma: Math.round(avg * 100) / 100 };
  });
}

/**
 * Calculate Bollinger Bands (upper/lower/middle).
 */
export function calculateBollingerBands(
  data: PriceDataPoint[],
  period: number = 20,
  stdDevMultiplier: number = 2
): BollingerBandPoint[] {
  return data.map((point, index) => {
    if (index < period - 1) {
      return { date: point.date, upper: null, lower: null, middle: null };
    }
    const window = data.slice(index - period + 1, index + 1);
    const prices = window.map(p => p.price);
    const mean = prices.reduce((s, p) => s + p, 0) / period;
    const variance = prices.reduce((s, p) => s + (p - mean) ** 2, 0) / period;
    const stdDev = Math.sqrt(variance);

    return {
      date: point.date,
      middle: Math.round(mean * 100) / 100,
      upper: Math.round((mean + stdDevMultiplier * stdDev) * 100) / 100,
      lower: Math.round((mean - stdDevMultiplier * stdDev) * 100) / 100,
    };
  });
}

/**
 * Detect trendline via linear regression, returning slope and intercept.
 */
export function detectTrendline(data: PriceDataPoint[]): TrendlineResult {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: data[0]?.price ?? 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += data[i].price;
    sumXY += i * data[i].price;
    sumXX += i * i;
  }

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return { slope: 0, intercept: sumY / n };

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  return {
    slope: Math.round(slope * 10000) / 10000,
    intercept: Math.round(intercept * 100) / 100,
  };
}

/**
 * Find key support and resistance price levels.
 * Uses percentile-based approach on closing prices.
 */
export function getSupportResistance(data: PriceDataPoint[]): SupportResistance {
  if (data.length === 0) return { support: 0, resistance: 0 };

  const sorted = data.map(d => d.price).sort((a, b) => a - b);
  const len = sorted.length;

  // Support = 20th percentile, Resistance = 80th percentile
  const supportIdx = Math.floor(len * 0.2);
  const resistIdx = Math.min(Math.floor(len * 0.8), len - 1);

  return {
    support: Math.round(sorted[supportIdx] * 100) / 100,
    resistance: Math.round(sorted[resistIdx] * 100) / 100,
  };
}
