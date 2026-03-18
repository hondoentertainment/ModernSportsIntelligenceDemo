import { store } from '../dal/syncStore';
import { CardInventory } from '../../types';

// ---- Types ----

export interface PopSnapshot {
  weekIndex: number;
  date: string;
  grades: Record<string, number>; // e.g. "PSA 7", "PSA 8", "PSA 9", "PSA 10"
  totalPop: number;
}

export interface PopGrowthData {
  cardId: string;
  player: string;
  snapshots: PopSnapshot[];
  growthRateByGrade: Record<string, number>; // annualized % growth
  overallGrowthRate: number;
  supplyRisk: boolean; // true if >20% annual growth
}

export type SupplyDemandLabel =
  | 'supply_pressure'
  | 'demand_driven'
  | 'scarcity_play'
  | 'neutral';

export interface SupplyDemandIndicator {
  cardId: string;
  player: string;
  label: SupplyDemandLabel;
  popGrowthRate: number;
  priceTrend: number; // simulated % price change
  description: string;
}

export interface GemRateData {
  cardId: string;
  player: string;
  gemRate: number; // current % of PSA 10 / BGS 9.5+
  gemRateTrend: 'rising' | 'falling' | 'stable';
  monthlyGemRates: { month: string; rate: number }[];
}

export interface SubmissionVolume {
  cardId: string;
  player: string;
  monthlySubmissions: { month: string; volume: number }[];
  averageMonthly: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface CollectionPopImpact {
  cardId: string;
  player: string;
  currentPop: number;
  growthRate: number;
  projectedPop12m: number;
  estimatedPriceImpact: number; // % price change if growth continues
  riskLevel: 'high' | 'medium' | 'low';
}

export interface SupplyRiskAlert {
  cardId: string;
  player: string;
  growthRate: number;
  currentPop: number;
  grade: string;
  severity: 'critical' | 'warning' | 'watch';
  message: string;
}

// ---- Constants ----

const STORAGE_KEY = 'msi_pop_snapshots';
const GRADE_LEVELS = ['PSA 7', 'PSA 8', 'PSA 9', 'PSA 10'];
const WEEKS_IN_YEAR = 52;

// ---- Deterministic seed helpers ----

function seededRandom(seed: number, offset: number): number {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
}

function seededRange(seed: number, offset: number, min: number, max: number): number {
  return min + seededRandom(seed, offset) * (max - min);
}

function cardSeed(card: CardInventory): number {
  let hash = 0;
  const str = `${card.id}_${card.player}_${card.year}`;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return Math.abs(hash);
}

// ---- localStorage helpers ----

interface StoredPopData {
  cardId: string;
  snapshots: PopSnapshot[];
  generatedAt: string;
}

function loadStoredData(): StoredPopData[] {
  return store.get<StoredPopData[]>(STORAGE_KEY, []);
}

function saveStoredData(data: StoredPopData[]): void {
  store.set(STORAGE_KEY, data);
}

// ---- Pop History Generation ----

export function generatePopHistory(card: CardInventory): PopSnapshot[] {
  // Check cache first
  const stored = loadStoredData();
  const existing = stored.find(d => d.cardId === card.id);
  if (existing && existing.snapshots.length > 0) {
    return existing.snapshots;
  }

  const seed = cardSeed(card);
  const snapshots: PopSnapshot[] = [];

  // Base population determined by card characteristics
  const isHighEnd = (card.currentValue ?? card.purchasePrice) > 200;
  const isVintage = card.year < 2000;

  // Base pop counts per grade (PSA 7 highest pop, PSA 10 lowest)
  const basePops: Record<string, number> = {
    'PSA 7': Math.round(seededRange(seed, 10, isVintage ? 200 : 500, isVintage ? 1500 : 5000)),
    'PSA 8': Math.round(seededRange(seed, 11, isVintage ? 150 : 400, isVintage ? 1200 : 4000)),
    'PSA 9': Math.round(seededRange(seed, 12, isVintage ? 80 : 300, isVintage ? 800 : 3000)),
    'PSA 10': Math.round(seededRange(seed, 13, isHighEnd ? 20 : 50, isHighEnd ? 200 : 1500)),
  };

  // Annual growth rate per grade: 2-15% varying by card
  const annualGrowthRates: Record<string, number> = {
    'PSA 7': seededRange(seed, 20, 0.02, 0.08),
    'PSA 8': seededRange(seed, 21, 0.03, 0.10),
    'PSA 9': seededRange(seed, 22, 0.04, 0.12),
    'PSA 10': seededRange(seed, 23, 0.05, 0.15),
  };

  // Some cards get a supply surge modifier (hot cards get more submissions)
  const surgeModifier = seededRandom(seed, 30) > 0.7 ? seededRange(seed, 31, 1.5, 3.0) : 1.0;
  if (surgeModifier > 1.0) {
    annualGrowthRates['PSA 9'] *= surgeModifier;
    annualGrowthRates['PSA 10'] *= surgeModifier;
  }

  // Generate 52 weekly snapshots (12 months)
  const now = new Date();
  for (let week = 0; week < WEEKS_IN_YEAR; week++) {
    const weekDate = new Date(now.getTime() - (WEEKS_IN_YEAR - 1 - week) * 7 * 24 * 60 * 60 * 1000);
    const weekFraction = week / WEEKS_IN_YEAR;

    const grades: Record<string, number> = {};
    let totalPop = 0;

    for (const grade of GRADE_LEVELS) {
      const base = basePops[grade];
      const annualRate = annualGrowthRates[grade];
      // Smooth growth with small weekly noise
      const growthFactor = 1 + annualRate * weekFraction;
      const noise = 1 + (seededRandom(seed + week, GRADE_LEVELS.indexOf(grade) * 100) - 0.5) * 0.005;
      const pop = Math.round(base * growthFactor * noise);
      grades[grade] = pop;
      totalPop += pop;
    }

    snapshots.push({
      weekIndex: week,
      date: weekDate.toISOString().slice(0, 10),
      grades,
      totalPop,
    });
  }

  // Persist to localStorage
  const updatedStored = stored.filter(d => d.cardId !== card.id);
  updatedStored.push({
    cardId: card.id,
    snapshots,
    generatedAt: new Date().toISOString(),
  });
  // Keep only last 50 cards to limit storage
  saveStoredData(updatedStored.slice(-50));

  return snapshots;
}

// ---- Pop Growth Rate ----

export function getPopGrowthRate(card: CardInventory): PopGrowthData {
  const snapshots = generatePopHistory(card);
  const growthRateByGrade: Record<string, number> = {};
  let totalGrowth = 0;
  let gradeCount = 0;

  for (const grade of GRADE_LEVELS) {
    const firstPop = snapshots[0]?.grades[grade] ?? 1;
    const lastPop = snapshots[snapshots.length - 1]?.grades[grade] ?? 1;
    const annualizedRate = ((lastPop - firstPop) / firstPop) * 100;
    growthRateByGrade[grade] = Math.round(annualizedRate * 10) / 10;
    totalGrowth += annualizedRate;
    gradeCount++;
  }

  const overallGrowthRate = Math.round((totalGrowth / Math.max(1, gradeCount)) * 10) / 10;

  return {
    cardId: card.id,
    player: card.player,
    snapshots,
    growthRateByGrade,
    overallGrowthRate,
    supplyRisk: overallGrowthRate > 20,
  };
}

// ---- Supply/Demand Indicator ----

export function getSupplyDemandIndicator(card: CardInventory): SupplyDemandIndicator {
  const popData = getPopGrowthRate(card);
  const seed = cardSeed(card);

  // Simulated price trend (-30% to +50%)
  const priceTrend = Math.round(seededRange(seed, 50, -30, 50) * 10) / 10;

  let label: SupplyDemandLabel;
  let description: string;

  if (popData.overallGrowthRate > 15 && priceTrend < 5) {
    label = 'supply_pressure';
    description = `Population growing ${popData.overallGrowthRate.toFixed(1)}% while prices stagnate. Increasing supply may depress values.`;
  } else if (popData.overallGrowthRate < 5 && priceTrend > 15) {
    label = 'scarcity_play';
    description = `Low pop growth (${popData.overallGrowthRate.toFixed(1)}%) with strong price gains (+${priceTrend.toFixed(1)}%). Scarcity driving value.`;
  } else if (popData.overallGrowthRate > 10 && priceTrend > 10) {
    label = 'demand_driven';
    description = `Both pop (+${popData.overallGrowthRate.toFixed(1)}%) and prices (+${priceTrend.toFixed(1)}%) rising. Strong demand absorbing new supply.`;
  } else {
    label = 'neutral';
    description = `Pop growth at ${popData.overallGrowthRate.toFixed(1)}% with ${priceTrend >= 0 ? '+' : ''}${priceTrend.toFixed(1)}% price trend. Market in equilibrium.`;
  }

  return {
    cardId: card.id,
    player: card.player,
    label,
    popGrowthRate: popData.overallGrowthRate,
    priceTrend,
    description,
  };
}

// ---- Gem Rate Data ----

export function getGemRateData(card: CardInventory): GemRateData {
  const snapshots = generatePopHistory(card);
  const monthlyGemRates: { month: string; rate: number }[] = [];

  // Sample every ~4 weeks for monthly gem rate
  for (let i = 0; i < snapshots.length; i += 4) {
    const snap = snapshots[i];
    const psa10 = snap.grades['PSA 10'] ?? 0;
    const total = snap.totalPop || 1;
    const rate = Math.round((psa10 / total) * 1000) / 10; // percentage with 1 decimal

    const dateObj = new Date(snap.date);
    const monthLabel = dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    monthlyGemRates.push({ month: monthLabel, rate });
  }

  const currentRate = monthlyGemRates[monthlyGemRates.length - 1]?.rate ?? 0;
  const firstRate = monthlyGemRates[0]?.rate ?? 0;
  const rateDiff = currentRate - firstRate;

  let gemRateTrend: 'rising' | 'falling' | 'stable';
  if (rateDiff > 0.5) gemRateTrend = 'rising';
  else if (rateDiff < -0.5) gemRateTrend = 'falling';
  else gemRateTrend = 'stable';

  return {
    cardId: card.id,
    player: card.player,
    gemRate: currentRate,
    gemRateTrend,
    monthlyGemRates,
  };
}

// ---- Submission Volume ----

export function estimateSubmissionVolume(card: CardInventory): SubmissionVolume {
  const snapshots = generatePopHistory(card);
  const monthlySubmissions: { month: string; volume: number }[] = [];

  // Calculate monthly new submissions from pop deltas
  for (let i = 4; i < snapshots.length; i += 4) {
    const prev = snapshots[Math.max(0, i - 4)];
    const curr = snapshots[i];
    const delta = Math.max(0, curr.totalPop - prev.totalPop);

    const dateObj = new Date(curr.date);
    const monthLabel = dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    monthlySubmissions.push({ month: monthLabel, volume: delta });
  }

  const avgMonthly = monthlySubmissions.length > 0
    ? Math.round(monthlySubmissions.reduce((s, m) => s + m.volume, 0) / monthlySubmissions.length)
    : 0;

  // Trend: compare last 3 months to first 3 months
  const recent = monthlySubmissions.slice(-3);
  const early = monthlySubmissions.slice(0, 3);
  const recentAvg = recent.length > 0 ? recent.reduce((s, m) => s + m.volume, 0) / recent.length : 0;
  const earlyAvg = early.length > 0 ? early.reduce((s, m) => s + m.volume, 0) / early.length : 0;

  let trend: 'increasing' | 'decreasing' | 'stable';
  if (recentAvg > earlyAvg * 1.15) trend = 'increasing';
  else if (recentAvg < earlyAvg * 0.85) trend = 'decreasing';
  else trend = 'stable';

  return {
    cardId: card.id,
    player: card.player,
    monthlySubmissions,
    averageMonthly: avgMonthly,
    trend,
  };
}

// ---- Collection Pop Impact ----

export function getCollectionPopImpact(cards: CardInventory[]): CollectionPopImpact[] {
  return cards.map(card => {
    const popData = getPopGrowthRate(card);
    const lastSnap = popData.snapshots[popData.snapshots.length - 1];
    const currentPop = lastSnap?.totalPop ?? 0;
    const growthRate = popData.overallGrowthRate;

    // Project 12 months forward
    const projectedPop12m = Math.round(currentPop * (1 + growthRate / 100));

    // Estimated price impact: inverse relationship with pop growth
    // High pop growth -> negative price pressure, low growth -> positive
    const estimatedPriceImpact = Math.round((-0.6 * growthRate + 5) * 10) / 10;

    let riskLevel: 'high' | 'medium' | 'low';
    if (growthRate > 20) riskLevel = 'high';
    else if (growthRate > 10) riskLevel = 'medium';
    else riskLevel = 'low';

    return {
      cardId: card.id,
      player: card.player,
      currentPop,
      growthRate,
      projectedPop12m,
      estimatedPriceImpact,
      riskLevel,
    };
  });
}

// ---- Supply Risk Alerts ----

export function getSupplyRiskAlerts(cards: CardInventory[]): SupplyRiskAlert[] {
  const alerts: SupplyRiskAlert[] = [];

  for (const card of cards) {
    const popData = getPopGrowthRate(card);

    for (const grade of GRADE_LEVELS) {
      const rate = popData.growthRateByGrade[grade] ?? 0;
      if (rate <= 10) continue;

      const lastSnap = popData.snapshots[popData.snapshots.length - 1];
      const currentPop = lastSnap?.grades[grade] ?? 0;

      let severity: 'critical' | 'warning' | 'watch';
      let message: string;

      if (rate > 25) {
        severity = 'critical';
        message = `${card.player} ${grade} pop surging +${rate.toFixed(1)}%/yr (${currentPop} total). Significant supply risk.`;
      } else if (rate > 20) {
        severity = 'warning';
        message = `${card.player} ${grade} pop growing +${rate.toFixed(1)}%/yr (${currentPop} total). Monitor for value dilution.`;
      } else {
        severity = 'watch';
        message = `${card.player} ${grade} pop growth elevated at +${rate.toFixed(1)}%/yr (${currentPop} total).`;
      }

      alerts.push({
        cardId: card.id,
        player: card.player,
        growthRate: rate,
        currentPop,
        grade,
        severity,
        message,
      });
    }
  }

  // Sort by severity then growth rate
  const severityOrder: Record<string, number> = { critical: 0, warning: 1, watch: 2 };
  alerts.sort((a, b) => {
    const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (sevDiff !== 0) return sevDiff;
    return b.growthRate - a.growthRate;
  });

  return alerts;
}
