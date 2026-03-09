import { CardInventory, Sport } from '../types';

// ---- Types ----

export type AnomalyType = 'spike' | 'crash' | 'arbitrage' | 'mispricing' | 'volume_surge' | 'stale_price';
export type AnomalySeverity = 'critical' | 'high' | 'medium' | 'low';

export interface MarketAnomaly {
  id: string;
  cardId: string;
  player: string;
  sport: Sport;
  type: AnomalyType;
  severity: AnomalySeverity;
  title: string;
  description: string;
  detectedAt: string;
  priceAtDetection: number;
  expectedPrice: number;
  deviationPercent: number;
  confidence: number; // 0-100
  actionRecommendation: string;
  expiresAt: string;
  isAcknowledged: boolean;
}

export interface ArbitrageOpportunity {
  id: string;
  cardId: string;
  player: string;
  buyPrice: number;
  sellPrice: number;
  spread: number;
  spreadPercent: number;
  buySource: string;
  sellSource: string;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface AnomalySummary {
  totalActive: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  totalArbitrageValue: number;
  avgDeviation: number;
  mostAnomalousCard: string;
  trendDirection: 'increasing' | 'decreasing' | 'stable';
}

// ---- Constants ----

const STORAGE_KEY = 'msi_anomalies';
const MARKET_SOURCES = ['eBay', 'COMC', 'MySlabs', 'PWCC', 'Private Sale'] as const;

const SPORT_AVG_MULTIPLIER: Record<Sport, number> = {
  Baseball: 1.35,
  Basketball: 1.55,
  Football: 1.45,
  Hockey: 1.2,
  Soccer: 1.3,
};

// ---- Deterministic seed helpers ----

function dateSeed(): number {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number, offset: number): number {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
}

function seededRange(seed: number, offset: number, min: number, max: number): number {
  return min + seededRandom(seed, offset) * (max - min);
}

// ---- Statistical helpers ----

export function calculateZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA).getTime();
  const b = new Date(dateB).getTime();
  return Math.abs(b - a) / (1000 * 60 * 60 * 24);
}

function determineSeverity(deviationPercent: number): AnomalySeverity {
  const abs = Math.abs(deviationPercent);
  if (abs >= 60) return 'critical';
  if (abs >= 40) return 'high';
  if (abs >= 20) return 'medium';
  return 'low';
}

function expiresFromNow(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  return d.toISOString();
}

// ---- localStorage helpers ----

function loadStoredAnomalies(): MarketAnomaly[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as MarketAnomaly[];
  } catch {
    return [];
  }
}

function saveAnomalies(anomalies: MarketAnomaly[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(anomalies));
  } catch {
    // quota exceeded – silently ignore
  }
}

// ---- Core detection ----

export function detectAnomalies(inventory: CardInventory[]): MarketAnomaly[] {
  const now = new Date().toISOString();
  const seed = dateSeed();
  const anomalies: MarketAnomaly[] = [];

  // Compute sport-average price ratio
  const sportTotals: Record<string, { sum: number; count: number }> = {};
  for (const card of inventory) {
    const cv = card.currentValue ?? card.purchasePrice;
    if (!sportTotals[card.sport]) sportTotals[card.sport] = { sum: 0, count: 0 };
    sportTotals[card.sport].sum += cv / card.purchasePrice;
    sportTotals[card.sport].count += 1;
  }
  const sportAvgRatio: Record<string, number> = {};
  for (const sport of Object.keys(sportTotals)) {
    sportAvgRatio[sport] = sportTotals[sport].count > 0
      ? sportTotals[sport].sum / sportTotals[sport].count
      : SPORT_AVG_MULTIPLIER[sport as Sport] ?? 1.3;
  }

  for (const card of inventory) {
    const cv = card.currentValue ?? card.purchasePrice;
    const pp = card.purchasePrice;
    const ratio = cv / pp;
    const cardHash = hashString(card.id + card.player);
    const cardSeed = seed + cardHash;

    // Spike detection: currentValue > purchasePrice * 1.5 and owned < 90 days
    if (ratio > 1.5) {
      const ownedDays = daysBetween(card.purchaseDate, now);
      if (ownedDays < 90) {
        const deviation = ((cv - pp) / pp) * 100;
        const severity = determineSeverity(deviation);
        anomalies.push({
          id: `spike-${card.id}`,
          cardId: card.id,
          player: card.player,
          sport: card.sport,
          type: 'spike',
          severity,
          title: `Price Spike: ${card.player}`,
          description: `${card.player} ${card.year} ${card.set} has surged ${deviation.toFixed(0)}% in ${ownedDays.toFixed(0)} days.`,
          detectedAt: now,
          priceAtDetection: cv,
          expectedPrice: pp * SPORT_AVG_MULTIPLIER[card.sport],
          deviationPercent: Math.round(deviation * 100) / 100,
          confidence: Math.min(95, 60 + Math.round(deviation / 3)),
          actionRecommendation: severity === 'critical'
            ? 'Consider taking profits immediately. This level of appreciation is unsustainable.'
            : 'Monitor closely. Set a trailing stop-loss to protect gains.',
          expiresAt: expiresFromNow(48),
          isAcknowledged: false,
        });
      }
    }

    // Crash detection: currentValue < purchasePrice * 0.6
    if (ratio < 0.6) {
      const deviation = ((cv - pp) / pp) * 100;
      const severity = determineSeverity(deviation);
      anomalies.push({
        id: `crash-${card.id}`,
        cardId: card.id,
        player: card.player,
        sport: card.sport,
        type: 'crash',
        severity,
        title: `Price Crash: ${card.player}`,
        description: `${card.player} ${card.year} ${card.set} has declined ${Math.abs(deviation).toFixed(0)}% from purchase price.`,
        detectedAt: now,
        priceAtDetection: cv,
        expectedPrice: pp,
        deviationPercent: Math.round(deviation * 100) / 100,
        confidence: Math.min(90, 50 + Math.round(Math.abs(deviation) / 4)),
        actionRecommendation: severity === 'critical'
          ? 'Evaluate for tax-loss harvesting. This card may not recover near-term.'
          : 'Hold and reassess. Check for market-wide downturn vs card-specific decline.',
        expiresAt: expiresFromNow(72),
        isAcknowledged: false,
      });
    }

    // Mispricing: card deviates >30% from sport average price ratio
    const avgRatio = sportAvgRatio[card.sport] ?? SPORT_AVG_MULTIPLIER[card.sport];
    const ratioDev = ((ratio - avgRatio) / avgRatio) * 100;
    if (Math.abs(ratioDev) > 30) {
      const direction = ratioDev > 0 ? 'overpriced' : 'underpriced';
      const severity = determineSeverity(ratioDev);
      anomalies.push({
        id: `misprice-${card.id}`,
        cardId: card.id,
        player: card.player,
        sport: card.sport,
        type: 'mispricing',
        severity,
        title: `Potential Mispricing: ${card.player}`,
        description: `This ${card.sport} card appears ${direction} by ${Math.abs(ratioDev).toFixed(0)}% relative to the ${card.sport} average.`,
        detectedAt: now,
        priceAtDetection: cv,
        expectedPrice: pp * avgRatio,
        deviationPercent: Math.round(ratioDev * 100) / 100,
        confidence: Math.min(85, 40 + Math.round(Math.abs(ratioDev) / 2)),
        actionRecommendation: direction === 'overpriced'
          ? 'Consider selling if the premium isn\'t justified by scarcity or player momentum.'
          : 'Potential buying opportunity. Verify with recent comparable sales.',
        expiresAt: expiresFromNow(96),
        isAcknowledged: false,
      });
    }

    // Volume surge: simulated based on card hash + date
    const volumeChance = seededRandom(cardSeed, 42);
    if (volumeChance > 0.85) {
      const volumeMultiplier = seededRange(cardSeed, 43, 2, 5);
      const deviation = (volumeMultiplier - 1) * 100;
      anomalies.push({
        id: `volume-${card.id}`,
        cardId: card.id,
        player: card.player,
        sport: card.sport,
        type: 'volume_surge',
        severity: volumeMultiplier > 3.5 ? 'high' : 'medium',
        title: `Volume Surge: ${card.player}`,
        description: `Trading volume for ${card.player} ${card.year} ${card.set} is ${volumeMultiplier.toFixed(1)}x the 30-day average.`,
        detectedAt: now,
        priceAtDetection: cv,
        expectedPrice: cv,
        deviationPercent: Math.round(deviation * 100) / 100,
        confidence: Math.round(seededRange(cardSeed, 44, 55, 80)),
        actionRecommendation: 'High volume often precedes price movement. Watch for news or hype catalysts.',
        expiresAt: expiresFromNow(24),
        isAcknowledged: false,
      });
    }

    // Stale price: lastValuationDate older than 30 days
    if (card.lastValuationDate) {
      const staleDays = daysBetween(card.lastValuationDate, now);
      if (staleDays > 30) {
        anomalies.push({
          id: `stale-${card.id}`,
          cardId: card.id,
          player: card.player,
          sport: card.sport,
          type: 'stale_price',
          severity: staleDays > 90 ? 'high' : staleDays > 60 ? 'medium' : 'low',
          title: `Stale Pricing: ${card.player}`,
          description: `Last valuation was ${Math.round(staleDays)} days ago. Current price data may be unreliable.`,
          detectedAt: now,
          priceAtDetection: cv,
          expectedPrice: cv,
          deviationPercent: 0,
          confidence: Math.min(95, 50 + Math.round(staleDays / 3)),
          actionRecommendation: 'Refresh pricing data. Run a market sync or check recent comparable sales.',
          expiresAt: expiresFromNow(168),
          isAcknowledged: false,
        });
      }
    }
  }

  // Merge acknowledgment status from stored anomalies
  const stored = loadStoredAnomalies();
  const ackSet = new Set(stored.filter(a => a.isAcknowledged).map(a => a.id));
  for (const anomaly of anomalies) {
    if (ackSet.has(anomaly.id)) {
      anomaly.isAcknowledged = true;
    }
  }

  saveAnomalies(anomalies);
  return anomalies;
}

// ---- Arbitrage detection ----

export function findArbitrageOpportunities(inventory: CardInventory[]): ArbitrageOpportunity[] {
  const seed = dateSeed();
  const opportunities: ArbitrageOpportunity[] = [];

  for (const card of inventory) {
    const cv = card.currentValue ?? card.purchasePrice;
    const cardHash = hashString(card.id + card.player);
    const cardSeed = seed + cardHash;

    // Only generate arbitrage for ~25% of cards
    if (seededRandom(cardSeed, 100) > 0.25) continue;

    const spreadPercent = seededRange(cardSeed, 101, 3, 12);
    const buySourceIdx = Math.floor(seededRange(cardSeed, 102, 0, MARKET_SOURCES.length));
    let sellSourceIdx = Math.floor(seededRange(cardSeed, 103, 0, MARKET_SOURCES.length));
    if (sellSourceIdx === buySourceIdx) {
      sellSourceIdx = (sellSourceIdx + 1) % MARKET_SOURCES.length;
    }

    const buyPrice = cv * (1 - spreadPercent / 200);
    const sellPrice = cv * (1 + spreadPercent / 200);
    const spread = sellPrice - buyPrice;

    const riskVal = seededRandom(cardSeed, 104);
    const riskLevel: 'low' | 'medium' | 'high' = riskVal < 0.4 ? 'low' : riskVal < 0.75 ? 'medium' : 'high';

    opportunities.push({
      id: `arb-${card.id}`,
      cardId: card.id,
      player: card.player,
      buyPrice: Math.round(buyPrice * 100) / 100,
      sellPrice: Math.round(sellPrice * 100) / 100,
      spread: Math.round(spread * 100) / 100,
      spreadPercent: Math.round(spreadPercent * 100) / 100,
      buySource: MARKET_SOURCES[buySourceIdx],
      sellSource: MARKET_SOURCES[sellSourceIdx],
      confidence: Math.round(seededRange(cardSeed, 105, 55, 92)),
      riskLevel,
    });
  }

  // Sort by spread descending
  opportunities.sort((a, b) => b.spread - a.spread);
  return opportunities;
}

// ---- Summary ----

export function getAnomalySummary(inventory: CardInventory[]): AnomalySummary {
  const anomalies = detectAnomalies(inventory);
  const arb = findArbitrageOpportunities(inventory);

  const active = anomalies.filter(a => !a.isAcknowledged);
  const criticalCount = active.filter(a => a.severity === 'critical').length;
  const highCount = active.filter(a => a.severity === 'high').length;
  const mediumCount = active.filter(a => a.severity === 'medium').length;
  const lowCount = active.filter(a => a.severity === 'low').length;

  const totalArbitrageValue = arb.reduce((sum, o) => sum + o.spread, 0);

  const deviations = anomalies.map(a => Math.abs(a.deviationPercent)).filter(d => d > 0);
  const avgDeviation = deviations.length > 0
    ? deviations.reduce((s, d) => s + d, 0) / deviations.length
    : 0;

  // Most anomalous card by absolute deviation
  let mostAnomalousCard = 'None';
  if (anomalies.length > 0) {
    const sorted = [...anomalies].sort((a, b) => Math.abs(b.deviationPercent) - Math.abs(a.deviationPercent));
    mostAnomalousCard = sorted[0].player;
  }

  const trendDirection = getAnomalyTrend(inventory);

  return {
    totalActive: active.length,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    totalArbitrageValue: Math.round(totalArbitrageValue * 100) / 100,
    avgDeviation: Math.round(avgDeviation * 100) / 100,
    mostAnomalousCard,
    trendDirection,
  };
}

// ---- Acknowledge ----

export function acknowledgeAnomaly(id: string): void {
  const stored = loadStoredAnomalies();
  const updated = stored.map(a => a.id === id ? { ...a, isAcknowledged: true } : a);
  saveAnomalies(updated);
}

// ---- History ----

export function getAnomalyHistory(): MarketAnomaly[] {
  return loadStoredAnomalies();
}

// ---- Trend analysis ----

export function getAnomalyTrend(inventory: CardInventory[]): 'increasing' | 'decreasing' | 'stable' {
  // Use a deterministic approach based on portfolio composition
  const seed = dateSeed();

  // Count cards with significant deviations
  let deviatingCount = 0;
  for (const card of inventory) {
    const cv = card.currentValue ?? card.purchasePrice;
    const ratio = cv / card.purchasePrice;
    if (Math.abs(ratio - 1) > 0.3) deviatingCount++;
  }

  const deviationRate = inventory.length > 0 ? deviatingCount / inventory.length : 0;

  // Simulate trend based on deviation rate and date seed
  const trendVal = seededRandom(seed, 999) + deviationRate;
  if (trendVal > 1.2) return 'increasing';
  if (trendVal < 0.5) return 'decreasing';
  return 'stable';
}
