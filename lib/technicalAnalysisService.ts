/**
 * Technical Analysis Service — Phase 47
 * Advanced TA indicators for sports card price analysis.
 * Uses generatePriceHistory from priceChartService for price data.
 */

import { CardInventory } from '../types';
import { generatePriceHistory, PriceDataPoint } from './priceChartService';

// ── Types ─────────────────────────────────────────────────────────────────

export interface TAIndicator {
  name: string;
  type: 'momentum' | 'trend' | 'volatility' | 'volume' | 'pattern';
  description: string;
}

export interface RSIResult {
  values: { date: string; rsi: number | null }[];
  currentRSI: number;
  isOverbought: boolean;
  isOversold: boolean;
  divergence: 'bullish' | 'bearish' | 'none';
}

export interface MACDResult {
  macdLine: { date: string; value: number | null }[];
  signalLine: { date: string; value: number | null }[];
  histogram: { date: string; value: number | null }[];
  crossovers: { date: string; type: 'bullish' | 'bearish' }[];
}

export interface FibonacciLevels {
  swingHigh: number;
  swingLow: number;
  levels: { ratio: number; label: string; price: number }[];
}

export interface CandlestickPattern {
  type: 'doji' | 'hammer' | 'engulfing_bullish' | 'engulfing_bearish' | 'morning_star';
  date: string;
  significance: 'high' | 'medium' | 'low';
  description: string;
}

export interface VolumeProfile {
  buckets: { priceLevel: number; volume: number }[];
  valueAreaHigh: number;
  valueAreaLow: number;
  pointOfControl: number;
}

export interface TASignal {
  name: string;
  direction: 'bullish' | 'bearish' | 'neutral';
  strength: number; // 0-100
  description: string;
}

export interface ChartAnnotation {
  id: string;
  cardId: string;
  date: string;
  label: string;
  type: 'support' | 'resistance' | 'trendline' | 'custom';
  price?: number;
  createdAt: string;
}

export interface TASentiment {
  verdict: 'bullish' | 'bearish' | 'neutral';
  confidence: number; // 0-100
  bullishCount: number;
  bearishCount: number;
  neutralCount: number;
}

// ── EMA Helper ────────────────────────────────────────────────────────────

export function calculateEMA(prices: number[], period: number): number[] {
  if (prices.length === 0) return [];
  const multiplier = 2 / (period + 1);
  const ema: number[] = [];

  // Start with SMA for the first period
  let sum = 0;
  for (let i = 0; i < Math.min(period, prices.length); i++) {
    sum += prices[i];
  }
  ema.push(sum / Math.min(period, prices.length));

  for (let i = 1; i < prices.length; i++) {
    if (i < period) {
      // Still building up — use cumulative average
      const cumAvg = prices.slice(0, i + 1).reduce((s, p) => s + p, 0) / (i + 1);
      ema.push(cumAvg);
    } else {
      const val = (prices[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1];
      ema.push(val);
    }
  }

  return ema;
}

// ── RSI ───────────────────────────────────────────────────────────────────

export function calculateRSI(prices: number[], period: number = 14): RSIResult {
  const values: { date: string; rsi: number | null }[] = [];

  if (prices.length < period + 1) {
    return {
      values: prices.map((_, i) => ({ date: `day-${i}`, rsi: null })),
      currentRSI: 50,
      isOverbought: false,
      isOversold: false,
      divergence: 'none',
    };
  }

  // Calculate price changes
  const changes: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  // Initial average gain/loss
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) avgGain += changes[i];
    else avgLoss += Math.abs(changes[i]);
  }
  avgGain /= period;
  avgLoss /= period;

  // First RSI value — first (period) entries are null
  for (let i = 0; i < period; i++) {
    values.push({ date: `day-${i}`, rsi: null });
  }

  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const firstRSI = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);
  values.push({ date: `day-${period}`, rsi: Math.round(firstRSI * 100) / 100 });

  // Smoothed RSI for remaining values
  for (let i = period; i < changes.length; i++) {
    const gain = changes[i] > 0 ? changes[i] : 0;
    const loss = changes[i] < 0 ? Math.abs(changes[i]) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const smoothedRS = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + smoothedRS);
    values.push({ date: `day-${i + 1}`, rsi: Math.round(rsi * 100) / 100 });
  }

  const currentRSI = values[values.length - 1].rsi ?? 50;

  // Divergence detection: compare last 20 points of price vs RSI
  let divergence: 'bullish' | 'bearish' | 'none' = 'none';
  const recentValues = values.filter(v => v.rsi !== null).slice(-20);
  if (recentValues.length >= 10) {
    const recentPrices = prices.slice(-20);
    const priceSlope = recentPrices.length >= 2
      ? recentPrices[recentPrices.length - 1] - recentPrices[0]
      : 0;
    const rsiSlope = recentValues.length >= 2
      ? (recentValues[recentValues.length - 1].rsi ?? 50) - (recentValues[0].rsi ?? 50)
      : 0;

    if (priceSlope < 0 && rsiSlope > 5) divergence = 'bullish';
    else if (priceSlope > 0 && rsiSlope < -5) divergence = 'bearish';
  }

  return {
    values,
    currentRSI: Math.round(currentRSI * 100) / 100,
    isOverbought: currentRSI > 70,
    isOversold: currentRSI < 30,
    divergence,
  };
}

// ── MACD ──────────────────────────────────────────────────────────────────

export function calculateMACD(
  prices: number[],
  fast: number = 12,
  slow: number = 26,
  signalPeriod: number = 9
): MACDResult {
  const fastEMA = calculateEMA(prices, fast);
  const slowEMA = calculateEMA(prices, slow);

  // MACD line = fast EMA - slow EMA
  const macdValues: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    macdValues.push(fastEMA[i] - slowEMA[i]);
  }

  // Signal line = EMA of MACD
  const signalValues = calculateEMA(macdValues, signalPeriod);

  // Histogram = MACD - Signal
  const histogramValues: number[] = macdValues.map((m, i) => m - signalValues[i]);

  // Detect crossovers
  const crossovers: { date: string; type: 'bullish' | 'bearish' }[] = [];
  for (let i = 1; i < macdValues.length; i++) {
    const prevDiff = macdValues[i - 1] - signalValues[i - 1];
    const currDiff = macdValues[i] - signalValues[i];
    if (prevDiff <= 0 && currDiff > 0) {
      crossovers.push({ date: `day-${i}`, type: 'bullish' });
    } else if (prevDiff >= 0 && currDiff < 0) {
      crossovers.push({ date: `day-${i}`, type: 'bearish' });
    }
  }

  const macdLine = macdValues.map((v, i) => ({
    date: `day-${i}`,
    value: i >= slow - 1 ? Math.round(v * 10000) / 10000 : null,
  }));
  const signalLine = signalValues.map((v, i) => ({
    date: `day-${i}`,
    value: i >= slow + signalPeriod - 2 ? Math.round(v * 10000) / 10000 : null,
  }));
  const histogram = histogramValues.map((v, i) => ({
    date: `day-${i}`,
    value: i >= slow + signalPeriod - 2 ? Math.round(v * 10000) / 10000 : null,
  }));

  return { macdLine, signalLine, histogram, crossovers };
}

// ── Fibonacci Retracement ─────────────────────────────────────────────────

export function calculateFibonacci(prices: number[]): FibonacciLevels {
  if (prices.length < 2) {
    return {
      swingHigh: prices[0] ?? 0,
      swingLow: prices[0] ?? 0,
      levels: [],
    };
  }

  // Find swing high and low in the recent half of data
  const recentStart = Math.floor(prices.length / 2);
  const recentPrices = prices.slice(recentStart);
  const swingHigh = Math.max(...recentPrices);
  const swingLow = Math.min(...recentPrices);
  const diff = swingHigh - swingLow;

  const ratios = [
    { ratio: 0, label: '0% (High)' },
    { ratio: 0.236, label: '23.6%' },
    { ratio: 0.382, label: '38.2%' },
    { ratio: 0.5, label: '50%' },
    { ratio: 0.618, label: '61.8%' },
    { ratio: 0.786, label: '78.6%' },
    { ratio: 1, label: '100% (Low)' },
  ];

  const levels = ratios.map(r => ({
    ratio: r.ratio,
    label: r.label,
    price: Math.round((swingHigh - diff * r.ratio) * 100) / 100,
  }));

  return { swingHigh, swingLow, levels };
}

// ── Candlestick Pattern Detection ─────────────────────────────────────────

export function detectCandlestickPatterns(prices: PriceDataPoint[]): CandlestickPattern[] {
  const patterns: CandlestickPattern[] = [];
  if (prices.length < 3) return patterns;

  for (let i = 1; i < prices.length; i++) {
    const curr = prices[i];
    const prev = prices[i - 1];

    const open = prev.price;
    const close = curr.price;
    const high = curr.high;
    const low = curr.low;
    const body = Math.abs(close - open);
    const totalRange = high - low;

    if (totalRange === 0) continue;

    const bodyRatio = body / totalRange;

    // Doji: open ≈ close (body < 10% of range)
    if (bodyRatio < 0.1) {
      patterns.push({
        type: 'doji',
        date: curr.date,
        significance: 'medium',
        description: 'Doji — indecision, potential reversal',
      });
      continue;
    }

    // Hammer: small body at top, long lower wick
    const lowerWick = Math.min(open, close) - low;
    const upperWick = high - Math.max(open, close);
    if (lowerWick > body * 2 && upperWick < body * 0.5 && bodyRatio < 0.35) {
      patterns.push({
        type: 'hammer',
        date: curr.date,
        significance: curr.price < prev.price ? 'high' : 'medium',
        description: 'Hammer — potential bullish reversal',
      });
      continue;
    }

    // Engulfing patterns
    if (i >= 2) {
      const prevPrev = prices[i - 2];
      const prevOpen = prevPrev.price;
      const prevClose = prev.price;
      const prevBody = Math.abs(prevClose - prevOpen);

      // Bullish engulfing: prev was bearish, current bullish and engulfs
      if (prevClose < prevOpen && close > open && body > prevBody && close > prevOpen && open < prevClose) {
        patterns.push({
          type: 'engulfing_bullish',
          date: curr.date,
          significance: 'high',
          description: 'Bullish Engulfing — strong buy signal',
        });
        continue;
      }

      // Bearish engulfing
      if (prevClose > prevOpen && close < open && body > prevBody && close < prevOpen && open > prevClose) {
        patterns.push({
          type: 'engulfing_bearish',
          date: curr.date,
          significance: 'high',
          description: 'Bearish Engulfing — strong sell signal',
        });
        continue;
      }
    }

    // Morning Star (3-candle): big bearish, small body (doji-ish), big bullish
    if (i >= 3) {
      const day1 = prices[i - 2];
      const day2 = prices[i - 1];
      const day3 = prices[i];

      const body1 = day1.price - prices[i - 3].price;
      const body2Abs = Math.abs(day2.price - day1.price);
      const body3 = day3.price - day2.price;
      const range2 = day2.high - day2.low;

      if (
        body1 < 0 &&
        range2 > 0 && body2Abs / range2 < 0.3 &&
        body3 > 0 &&
        Math.abs(body3) > Math.abs(body1) * 0.5
      ) {
        patterns.push({
          type: 'morning_star',
          date: day3.date,
          significance: 'high',
          description: 'Morning Star — bullish reversal pattern',
        });
      }
    }
  }

  // Limit to most recent patterns and remove duplicates on same date
  const seen = new Set<string>();
  return patterns
    .reverse()
    .filter(p => {
      const key = `${p.date}-${p.type}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 20)
    .reverse();
}

// ── Volume Profile ────────────────────────────────────────────────────────

export function generateVolumeProfile(prices: PriceDataPoint[]): VolumeProfile {
  if (prices.length === 0) {
    return { buckets: [], valueAreaHigh: 0, valueAreaLow: 0, pointOfControl: 0 };
  }

  const allPrices = prices.map(p => p.price);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const range = maxPrice - minPrice;

  if (range === 0) {
    return {
      buckets: [{ priceLevel: minPrice, volume: prices.reduce((s, p) => s + p.volume, 0) }],
      valueAreaHigh: minPrice,
      valueAreaLow: minPrice,
      pointOfControl: minPrice,
    };
  }

  const numBuckets = 20;
  const bucketSize = range / numBuckets;
  const buckets: { priceLevel: number; volume: number }[] = [];

  for (let i = 0; i < numBuckets; i++) {
    const level = Math.round((minPrice + bucketSize * (i + 0.5)) * 100) / 100;
    buckets.push({ priceLevel: level, volume: 0 });
  }

  // Assign volume to buckets
  for (const point of prices) {
    const idx = Math.min(
      numBuckets - 1,
      Math.floor((point.price - minPrice) / bucketSize)
    );
    buckets[idx].volume += point.volume;
  }

  // Point of control: bucket with highest volume
  const maxVolBucket = buckets.reduce((max, b) => b.volume > max.volume ? b : max, buckets[0]);
  const pointOfControl = maxVolBucket.priceLevel;

  // Value Area: 70% of total volume centered around POC
  const totalVolume = buckets.reduce((s, b) => s + b.volume, 0);
  const targetVolume = totalVolume * 0.7;
  const pocIdx = buckets.indexOf(maxVolBucket);

  let areaVolume = maxVolBucket.volume;
  let lowIdx = pocIdx;
  let highIdx = pocIdx;

  while (areaVolume < targetVolume && (lowIdx > 0 || highIdx < numBuckets - 1)) {
    const addLow = lowIdx > 0 ? buckets[lowIdx - 1].volume : -1;
    const addHigh = highIdx < numBuckets - 1 ? buckets[highIdx + 1].volume : -1;

    if (addLow >= addHigh) {
      lowIdx--;
      areaVolume += buckets[lowIdx].volume;
    } else {
      highIdx++;
      areaVolume += buckets[highIdx].volume;
    }
  }

  return {
    buckets,
    valueAreaHigh: buckets[highIdx].priceLevel,
    valueAreaLow: buckets[lowIdx].priceLevel,
    pointOfControl,
  };
}

// ── Signal Generation ─────────────────────────────────────────────────────

export function generateTASignals(card: CardInventory): TASignal[] {
  const priceData = generatePriceHistory(card, '1Y');
  const closePrices = priceData.map(p => p.price);
  const signals: TASignal[] = [];

  if (closePrices.length < 30) return signals;

  // RSI Signal
  const rsi = calculateRSI(closePrices);
  if (rsi.isOverbought) {
    signals.push({
      name: 'RSI Overbought',
      direction: 'bearish',
      strength: Math.min(100, Math.round((rsi.currentRSI - 70) * 3.3)),
      description: `RSI at ${rsi.currentRSI.toFixed(1)} — overbought territory`,
    });
  } else if (rsi.isOversold) {
    signals.push({
      name: 'RSI Oversold',
      direction: 'bullish',
      strength: Math.min(100, Math.round((30 - rsi.currentRSI) * 3.3)),
      description: `RSI at ${rsi.currentRSI.toFixed(1)} — oversold territory`,
    });
  } else {
    signals.push({
      name: 'RSI Neutral',
      direction: 'neutral',
      strength: 30,
      description: `RSI at ${rsi.currentRSI.toFixed(1)} — within normal range`,
    });
  }

  // RSI Divergence
  if (rsi.divergence !== 'none') {
    signals.push({
      name: `RSI ${rsi.divergence === 'bullish' ? 'Bullish' : 'Bearish'} Divergence`,
      direction: rsi.divergence,
      strength: 65,
      description: `Price and RSI diverging — ${rsi.divergence} signal`,
    });
  }

  // MACD Signal
  const macd = calculateMACD(closePrices);
  const recentCross = macd.crossovers.length > 0
    ? macd.crossovers[macd.crossovers.length - 1]
    : null;
  if (recentCross) {
    const recency = closePrices.length - parseInt(recentCross.date.replace('day-', ''), 10);
    const strength = Math.max(20, 90 - recency * 3);
    signals.push({
      name: `MACD ${recentCross.type === 'bullish' ? 'Bullish' : 'Bearish'} Crossover`,
      direction: recentCross.type,
      strength,
      description: `MACD ${recentCross.type} crossover ${recency} periods ago`,
    });
  }

  // MACD Histogram trend
  const recentHist = macd.histogram.filter(h => h.value !== null).slice(-5);
  if (recentHist.length >= 3) {
    const increasing = recentHist.every((h, i) =>
      i === 0 || (h.value ?? 0) >= (recentHist[i - 1].value ?? 0)
    );
    const decreasing = recentHist.every((h, i) =>
      i === 0 || (h.value ?? 0) <= (recentHist[i - 1].value ?? 0)
    );
    if (increasing) {
      signals.push({
        name: 'MACD Histogram Rising',
        direction: 'bullish',
        strength: 55,
        description: 'MACD histogram expanding upward — bullish momentum',
      });
    } else if (decreasing) {
      signals.push({
        name: 'MACD Histogram Falling',
        direction: 'bearish',
        strength: 55,
        description: 'MACD histogram contracting — bearish momentum',
      });
    }
  }

  // Fibonacci Signal
  const fib = calculateFibonacci(closePrices);
  const currentPrice = closePrices[closePrices.length - 1];
  const nearFibLevel = fib.levels.find(l =>
    Math.abs(currentPrice - l.price) / currentPrice < 0.02
  );
  if (nearFibLevel) {
    signals.push({
      name: `Near Fibonacci ${nearFibLevel.label}`,
      direction: nearFibLevel.ratio <= 0.382 ? 'bearish' : 'bullish',
      strength: 50,
      description: `Price near Fibonacci ${nearFibLevel.label} level ($${nearFibLevel.price.toFixed(2)})`,
    });
  }

  // Candlestick Patterns
  const candles = detectCandlestickPatterns(priceData);
  const recentPattern = candles.length > 0 ? candles[candles.length - 1] : null;
  if (recentPattern) {
    const isBullish = ['hammer', 'engulfing_bullish', 'morning_star'].includes(recentPattern.type);
    signals.push({
      name: `Candlestick: ${recentPattern.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`,
      direction: isBullish ? 'bullish' : recentPattern.type === 'doji' ? 'neutral' : 'bearish',
      strength: recentPattern.significance === 'high' ? 75 : recentPattern.significance === 'medium' ? 50 : 30,
      description: recentPattern.description,
    });
  }

  // Volume Profile Signal
  const volProfile = generateVolumeProfile(priceData);
  if (currentPrice > volProfile.valueAreaHigh) {
    signals.push({
      name: 'Above Value Area',
      direction: 'bullish',
      strength: 60,
      description: `Price above value area high ($${volProfile.valueAreaHigh.toFixed(2)})`,
    });
  } else if (currentPrice < volProfile.valueAreaLow) {
    signals.push({
      name: 'Below Value Area',
      direction: 'bearish',
      strength: 60,
      description: `Price below value area low ($${volProfile.valueAreaLow.toFixed(2)})`,
    });
  }

  // Moving Average Signal (20 vs 50 EMA)
  if (closePrices.length >= 50) {
    const ema20 = calculateEMA(closePrices, 20);
    const ema50 = calculateEMA(closePrices, 50);
    const last20 = ema20[ema20.length - 1];
    const last50 = ema50[ema50.length - 1];
    if (last20 > last50) {
      signals.push({
        name: 'EMA 20/50 Bullish',
        direction: 'bullish',
        strength: 60,
        description: '20 EMA above 50 EMA — uptrend',
      });
    } else {
      signals.push({
        name: 'EMA 20/50 Bearish',
        direction: 'bearish',
        strength: 60,
        description: '20 EMA below 50 EMA — downtrend',
      });
    }
  }

  return signals;
}

// ── Overall Sentiment ─────────────────────────────────────────────────────

export function getOverallTASentiment(signals: TASignal[]): TASentiment {
  if (signals.length === 0) {
    return { verdict: 'neutral', confidence: 0, bullishCount: 0, bearishCount: 0, neutralCount: 0 };
  }

  let bullishScore = 0;
  let bearishScore = 0;
  let bullishCount = 0;
  let bearishCount = 0;
  let neutralCount = 0;

  for (const s of signals) {
    if (s.direction === 'bullish') {
      bullishScore += s.strength;
      bullishCount++;
    } else if (s.direction === 'bearish') {
      bearishScore += s.strength;
      bearishCount++;
    } else {
      neutralCount++;
    }
  }

  const totalSignals = signals.length;
  const maxPossible = totalSignals * 100;
  const netScore = bullishScore - bearishScore;
  const absScore = Math.abs(netScore);
  const confidence = maxPossible > 0 ? Math.min(100, Math.round((absScore / maxPossible) * 200)) : 0;

  let verdict: 'bullish' | 'bearish' | 'neutral';
  if (netScore > 50) verdict = 'bullish';
  else if (netScore < -50) verdict = 'bearish';
  else verdict = 'neutral';

  return { verdict, confidence, bullishCount, bearishCount, neutralCount };
}

// ── Annotations Persistence ───────────────────────────────────────────────

const ANNOTATIONS_KEY = 'msi_chart_annotations';

export function saveAnnotations(annotations: ChartAnnotation[]): void {
  try {
    localStorage.setItem(ANNOTATIONS_KEY, JSON.stringify(annotations));
  } catch {
    // quota exceeded — ignore
  }
}

export function loadAnnotations(): ChartAnnotation[] {
  try {
    const raw = localStorage.getItem(ANNOTATIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ChartAnnotation[];
  } catch {
    return [];
  }
}
