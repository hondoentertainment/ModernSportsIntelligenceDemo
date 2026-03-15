// ─── Monte Carlo Portfolio Stress Testing Service ───────────────────────────
import { CardInventory, Sport } from '../types';

// ─── Types ──────────────────────────────────────────────────────────────────

export type TimeHorizon = 30 | 90 | 365 | 730 | 1825; // days
export type ConfidenceLevel = 95 | 99;

export interface StressScenario {
  id: string;
  name: string;
  description: string;
  category: 'market' | 'grading' | 'sport' | 'player' | 'boom';
  shocks: ScenarioShock[];
  isCustom: boolean;
  createdAt: string;
}

export interface ScenarioShock {
  target: 'all' | Sport | 'graded' | 'ungraded' | 'high_value' | 'low_value';
  magnitude: number; // -1 to +2 (percentage as decimal, e.g. -0.4 = -40%)
  durationMonths: number;
  recoveryMonths: number;
}

export interface MonteCarloPath {
  month: number;
  values: number[]; // one value per simulation
}

export interface PercentileBand {
  month: number;
  p5: number;
  p25: number;
  p50: number;
  p75: number;
  p95: number;
  mean: number;
}

export interface VaRResult {
  horizon: TimeHorizon;
  confidence: ConfidenceLevel;
  portfolioValue: number;
  varAbsolute: number; // dollar loss
  varPercent: number;  // percentage loss
  expectedShortfall: number; // average loss beyond VaR (CVaR)
}

export interface DrawdownResult {
  worstDrawdown: number;        // percentage
  worstDrawdownDollar: number;  // dollar amount
  peakValue: number;
  troughValue: number;
  peakMonth: number;
  troughMonth: number;
  expectedRecoveryMonths: number;
  medianDrawdown: number;
}

export interface ConcentrationRisk {
  type: 'player' | 'sport' | 'era' | 'grading_company';
  name: string;
  exposure: number;   // percentage of portfolio
  cardCount: number;
  value: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
}

export interface DiversificationMetrics {
  herfindahlIndex: number;       // 0-1, lower is more diversified
  effectivePositions: number;    // 1/HHI
  diversificationBenefit: number; // % risk reduction from diversification
  sportCount: number;
  playerCount: number;
  eraSpread: number;             // years between oldest and newest
  riskScore: number;             // 1-100, higher = more risky
}

export interface HedgingRecommendation {
  id: string;
  action: string;
  rationale: string;
  impact: string;
  priority: 'high' | 'medium' | 'low';
  category: 'diversify' | 'reduce' | 'hedge' | 'rebalance';
}

export interface StressTestResult {
  id: string;
  scenarioId: string;
  scenarioName: string;
  timestamp: string;
  portfolioValue: number;
  numSimulations: number;
  horizon: TimeHorizon;
  percentileBands: PercentileBand[];
  var95: VaRResult;
  var99: VaRResult;
  drawdown: DrawdownResult;
  concentrationRisks: ConcentrationRisk[];
  diversification: DiversificationMetrics;
  hedgingRecommendations: HedgingRecommendation[];
  riskScore: number; // 1-100
}

// ─── Constants ──────────────────────────────────────────────────────────────

const STORAGE_KEY_RESULTS = 'msi_stress_test_results';
const STORAGE_KEY_CUSTOM_SCENARIOS = 'msi_stress_custom_scenarios';
const NUM_SIMULATIONS = 1000;

const SPORT_VOLATILITY: Record<Sport, number> = {
  Baseball: 0.18,
  Basketball: 0.25,
  Football: 0.22,
  Hockey: 0.15,
  Soccer: 0.20,
};

const SPORT_CORRELATION: Record<string, number> = {
  'Baseball-Basketball': 0.35,
  'Baseball-Football': 0.40,
  'Baseball-Hockey': 0.25,
  'Baseball-Soccer': 0.15,
  'Basketball-Football': 0.55,
  'Basketball-Hockey': 0.20,
  'Basketball-Soccer': 0.30,
  'Football-Hockey': 0.25,
  'Football-Soccer': 0.20,
  'Hockey-Soccer': 0.30,
};

const GRADE_STABILITY: Record<string, number> = {
  '10':  0.70, // gem mint very stable
  '9.5': 0.75,
  '9':   0.80,
  '8.5': 0.90,
  '8':   0.95,
  '7':   1.05,
  '6':   1.10,
  '5':   1.15,
  'ungraded': 1.30,
};

// ─── Seeded PRNG (Mulberry32) ───────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function boxMullerTransform(rng: () => number): number {
  const u1 = rng();
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(Math.max(u1, 1e-10))) * Math.cos(2 * Math.PI * u2);
}

// ─── Pre-built Scenarios ────────────────────────────────────────────────────

export const PRESET_SCENARIOS: StressScenario[] = [
  {
    id: 'market_crash_2008',
    name: '2008-Style Market Crash',
    description: 'Broad-based collectibles crash mirroring the 2008 financial crisis. All segments decline 40% over 12 months with slow 24-month recovery.',
    category: 'market',
    shocks: [{ target: 'all', magnitude: -0.40, durationMonths: 12, recoveryMonths: 24 }],
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'psa_grading_scandal',
    name: 'PSA Grading Scandal',
    description: 'Major grading scandal erodes trust in graded premiums. Graded cards lose 25% of their premium while raw cards are relatively unaffected.',
    category: 'grading',
    shocks: [
      { target: 'graded', magnitude: -0.25, durationMonths: 6, recoveryMonths: 18 },
      { target: 'ungraded', magnitude: -0.05, durationMonths: 3, recoveryMonths: 6 },
    ],
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'nfl_lockout',
    name: 'NFL Lockout',
    description: 'Extended NFL lockout crushes football card demand. Football drops 30%, other sports see mild uplift from collector rotation.',
    category: 'sport',
    shocks: [
      { target: 'Football', magnitude: -0.30, durationMonths: 8, recoveryMonths: 12 },
      { target: 'Baseball', magnitude: 0.05, durationMonths: 8, recoveryMonths: 4 },
      { target: 'Basketball', magnitude: 0.08, durationMonths: 8, recoveryMonths: 4 },
    ],
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'rookie_bust',
    name: 'Rookie Bust',
    description: 'High-value single-player concentration risk realized. Top holding loses 60% as the player underperforms dramatically.',
    category: 'player',
    shocks: [{ target: 'high_value', magnitude: -0.60, durationMonths: 4, recoveryMonths: 36 }],
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'hobby_boom',
    name: 'Hobby Boom',
    description: 'New wave of collectors enters the market driven by social media. Broad price appreciation of 80% over 18 months, especially high-value cards.',
    category: 'boom',
    shocks: [
      { target: 'all', magnitude: 0.80, durationMonths: 18, recoveryMonths: 6 },
      { target: 'high_value', magnitude: 0.30, durationMonths: 18, recoveryMonths: 6 },
    ],
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'soccer_world_cup',
    name: 'World Cup Rally',
    description: 'FIFA World Cup drives massive soccer card demand. Soccer cards surge 50%, slight positive spillover to other sports.',
    category: 'sport',
    shocks: [
      { target: 'Soccer', magnitude: 0.50, durationMonths: 6, recoveryMonths: 12 },
      { target: 'all', magnitude: 0.05, durationMonths: 4, recoveryMonths: 2 },
    ],
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'high_value_correction',
    name: 'High-Value Correction',
    description: 'Premium card tier corrects after speculative run-up. Cards over $500 drop 35%, budget cards hold steady.',
    category: 'market',
    shocks: [
      { target: 'high_value', magnitude: -0.35, durationMonths: 6, recoveryMonths: 18 },
      { target: 'low_value', magnitude: 0.02, durationMonths: 6, recoveryMonths: 3 },
    ],
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function getCardVolatility(card: CardInventory): number {
  const base = SPORT_VOLATILITY[card.sport] ?? 0.20;
  const gradeKey = card.isGraded && card.grade ? card.grade : 'ungraded';
  const gradeMult = GRADE_STABILITY[gradeKey] ?? GRADE_STABILITY['ungraded'];
  const valueMult = (card.currentValue ?? card.purchasePrice) > 500 ? 1.15 : 1.0;
  const autoMult = card.isAutographed ? 1.10 : 1.0;
  return base * gradeMult * valueMult * autoMult;
}

function getCardValue(card: CardInventory): number {
  return card.currentValue ?? card.purchasePrice;
}

function getPortfolioValue(cards: CardInventory[]): number {
  return cards.reduce((sum, c) => sum + getCardValue(c), 0);
}

function getSportCorrelation(s1: Sport, s2: Sport): number {
  if (s1 === s2) return 1.0;
  const key1 = `${s1}-${s2}`;
  const key2 = `${s2}-${s1}`;
  return SPORT_CORRELATION[key1] ?? SPORT_CORRELATION[key2] ?? 0.20;
}

function isCardAffectedByShock(card: CardInventory, shock: ScenarioShock): boolean {
  switch (shock.target) {
    case 'all': return true;
    case 'graded': return card.isGraded === true;
    case 'ungraded': return !card.isGraded;
    case 'high_value': return getCardValue(card) >= 500;
    case 'low_value': return getCardValue(card) < 500;
    default: return card.sport === shock.target;
  }
}

function percentile(arr: number[], p: number): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower);
}

// ─── Monte Carlo Engine ─────────────────────────────────────────────────────

function runMonteCarloSimulation(
  cards: CardInventory[],
  scenario: StressScenario,
  horizonDays: TimeHorizon,
  seed: number = 42
): { paths: MonteCarloPath[]; finalValues: number[] } {
  const rng = mulberry32(seed);
  const horizonMonths = Math.ceil(horizonDays / 30);
  const totalValue = getPortfolioValue(cards);
  if (totalValue === 0 || cards.length === 0) {
    const emptyBand: MonteCarloPath[] = Array.from({ length: horizonMonths + 1 }, (_, m) => ({
      month: m,
      values: Array(NUM_SIMULATIONS).fill(0),
    }));
    return { paths: emptyBand, finalValues: Array(NUM_SIMULATIONS).fill(0) };
  }

  // Pre-compute card weights and volatilities
  const _cardWeights = cards.map(c => getCardValue(c) / totalValue);
  const cardVols = cards.map(c => getCardVolatility(c));

  // Pre-compute shock impacts per card per month
  const shockImpacts: number[][] = cards.map(card => {
    return Array.from({ length: horizonMonths }, (_, m) => {
      let totalShock = 0;
      for (const shock of scenario.shocks) {
        if (!isCardAffectedByShock(card, shock)) continue;
        if (m < shock.durationMonths) {
          // During shock: linear ramp to magnitude
          totalShock += shock.magnitude * ((m + 1) / shock.durationMonths);
        } else if (m < shock.durationMonths + shock.recoveryMonths) {
          // Recovery: linear decay back to 0
          const recoveryProgress = (m - shock.durationMonths) / shock.recoveryMonths;
          totalShock += shock.magnitude * (1 - recoveryProgress);
        }
      }
      return totalShock;
    });
  });

  // Run simulations
  const paths: MonteCarloPath[] = Array.from({ length: horizonMonths + 1 }, (_, m) => ({
    month: m,
    values: new Array(NUM_SIMULATIONS),
  }));

  const finalValues: number[] = new Array(NUM_SIMULATIONS);

  for (let sim = 0; sim < NUM_SIMULATIONS; sim++) {
    // Initialize card values for this simulation
    const cardValues = cards.map(c => getCardValue(c));
    paths[0].values[sim] = totalValue;

    for (let m = 0; m < horizonMonths; m++) {
      // Generate correlated random shocks per sport group
      const sportShocks = new Map<Sport, number>();
      const baseShock = boxMullerTransform(rng);

      for (const card of cards) {
        if (!sportShocks.has(card.sport)) {
          const sportSpecific = boxMullerTransform(rng);
          const corr = getSportCorrelation(card.sport, cards[0].sport);
          const combined = corr * baseShock + Math.sqrt(1 - corr * corr) * sportSpecific;
          sportShocks.set(card.sport, combined);
        }
      }

      let portfolioVal = 0;
      for (let i = 0; i < cards.length; i++) {
        const vol = cardVols[i] / Math.sqrt(12); // monthly vol
        const randomShock = sportShocks.get(cards[i].sport) ?? boxMullerTransform(rng);
        const drift = -0.5 * vol * vol; // risk-neutral drift
        const scenarioEffect = shockImpacts[i][m] / Math.max(1, scenario.shocks[0]?.durationMonths ?? 1);
        const monthlyReturn = drift + vol * randomShock + scenarioEffect;
        cardValues[i] = Math.max(0, cardValues[i] * Math.exp(monthlyReturn));
        portfolioVal += cardValues[i];
      }

      paths[m + 1].values[sim] = portfolioVal;
    }

    finalValues[sim] = paths[horizonMonths].values[sim];
  }

  return { paths, finalValues };
}

// ─── VaR Calculation ────────────────────────────────────────────────────────

function calculateVaR(
  portfolioValue: number,
  finalValues: number[],
  horizon: TimeHorizon,
  confidence: ConfidenceLevel
): VaRResult {
  const losses = finalValues.map(v => portfolioValue - v).sort((a, b) => b - a);
  const varIndex = Math.floor((confidence / 100) * losses.length);
  const varAbsolute = Math.max(0, losses[varIndex] ?? 0);

  // Expected Shortfall (CVaR) = average of losses beyond VaR
  const tailLosses = losses.slice(0, losses.length - varIndex);
  const expectedShortfall = tailLosses.length > 0
    ? tailLosses.reduce((s, l) => s + l, 0) / tailLosses.length
    : varAbsolute;

  return {
    horizon,
    confidence,
    portfolioValue,
    varAbsolute: Math.round(varAbsolute * 100) / 100,
    varPercent: portfolioValue > 0 ? Math.round((varAbsolute / portfolioValue) * 10000) / 100 : 0,
    expectedShortfall: Math.round(Math.max(0, expectedShortfall) * 100) / 100,
  };
}

// ─── Drawdown Analysis ──────────────────────────────────────────────────────

function calculateDrawdown(paths: MonteCarloPath[]): DrawdownResult {
  // Use median path for drawdown analysis
  const medianPath = paths.map(p => ({
    month: p.month,
    value: percentile(p.values, 50),
  }));

  let peakValue = medianPath[0].value;
  let peakMonth = 0;
  let worstDrawdown = 0;
  let worstTrough = medianPath[0].value;
  let worstTroughMonth = 0;
  let worstPeak = medianPath[0].value;
  let worstPeakMonth = 0;

  for (const point of medianPath) {
    if (point.value > peakValue) {
      peakValue = point.value;
      peakMonth = point.month;
    }
    const dd = peakValue > 0 ? (peakValue - point.value) / peakValue : 0;
    if (dd > worstDrawdown) {
      worstDrawdown = dd;
      worstTrough = point.value;
      worstTroughMonth = point.month;
      worstPeak = peakValue;
      worstPeakMonth = peakMonth;
    }
  }

  // P5 worst-case drawdown
  const p5Path = paths.map(p => percentile(p.values, 5));
  let p5Peak = p5Path[0];
  let medianDrawdown = 0;
  for (const val of p5Path) {
    if (val > p5Peak) p5Peak = val;
    const dd = p5Peak > 0 ? (p5Peak - val) / p5Peak : 0;
    if (dd > medianDrawdown) medianDrawdown = dd;
  }

  // Estimate recovery: months from trough until median returns to peak
  let recoveryMonths = 0;
  for (let i = worstTroughMonth; i < medianPath.length; i++) {
    if (medianPath[i].value >= worstPeak * 0.95) {
      recoveryMonths = i - worstTroughMonth;
      break;
    }
  }
  if (recoveryMonths === 0 && worstDrawdown > 0.01) {
    recoveryMonths = Math.ceil(worstDrawdown * 36); // estimate
  }

  return {
    worstDrawdown: Math.round(worstDrawdown * 10000) / 100,
    worstDrawdownDollar: Math.round((worstPeak - worstTrough) * 100) / 100,
    peakValue: Math.round(worstPeak * 100) / 100,
    troughValue: Math.round(worstTrough * 100) / 100,
    peakMonth: worstPeakMonth,
    troughMonth: worstTroughMonth,
    expectedRecoveryMonths: recoveryMonths,
    medianDrawdown: Math.round(medianDrawdown * 10000) / 100,
  };
}

// ─── Concentration Risk ─────────────────────────────────────────────────────

function analyzeConcentrationRisks(cards: CardInventory[]): ConcentrationRisk[] {
  const totalValue = getPortfolioValue(cards);
  if (totalValue === 0) return [];
  const risks: ConcentrationRisk[] = [];

  // By player
  const playerMap = new Map<string, { value: number; count: number }>();
  for (const c of cards) {
    const prev = playerMap.get(c.player) ?? { value: 0, count: 0 };
    playerMap.set(c.player, { value: prev.value + getCardValue(c), count: prev.count + 1 });
  }
  for (const [name, data] of playerMap) {
    const exposure = (data.value / totalValue) * 100;
    if (exposure >= 10) {
      risks.push({
        type: 'player',
        name,
        exposure: Math.round(exposure * 10) / 10,
        cardCount: data.count,
        value: Math.round(data.value * 100) / 100,
        riskLevel: exposure >= 40 ? 'critical' : exposure >= 25 ? 'high' : exposure >= 15 ? 'medium' : 'low',
      });
    }
  }

  // By sport
  const sportMap = new Map<string, { value: number; count: number }>();
  for (const c of cards) {
    const prev = sportMap.get(c.sport) ?? { value: 0, count: 0 };
    sportMap.set(c.sport, { value: prev.value + getCardValue(c), count: prev.count + 1 });
  }
  for (const [name, data] of sportMap) {
    const exposure = (data.value / totalValue) * 100;
    if (exposure >= 30) {
      risks.push({
        type: 'sport',
        name,
        exposure: Math.round(exposure * 10) / 10,
        cardCount: data.count,
        value: Math.round(data.value * 100) / 100,
        riskLevel: exposure >= 70 ? 'critical' : exposure >= 50 ? 'high' : exposure >= 40 ? 'medium' : 'low',
      });
    }
  }

  // By era (decade)
  const eraMap = new Map<string, { value: number; count: number }>();
  for (const c of cards) {
    const decade = `${Math.floor(c.year / 10) * 10}s`;
    const prev = eraMap.get(decade) ?? { value: 0, count: 0 };
    eraMap.set(decade, { value: prev.value + getCardValue(c), count: prev.count + 1 });
  }
  for (const [name, data] of eraMap) {
    const exposure = (data.value / totalValue) * 100;
    if (exposure >= 40) {
      risks.push({
        type: 'era',
        name,
        exposure: Math.round(exposure * 10) / 10,
        cardCount: data.count,
        value: Math.round(data.value * 100) / 100,
        riskLevel: exposure >= 80 ? 'critical' : exposure >= 60 ? 'high' : exposure >= 50 ? 'medium' : 'low',
      });
    }
  }

  // By grading company
  const gradingMap = new Map<string, { value: number; count: number }>();
  for (const c of cards) {
    if (c.isGraded && c.gradingCompany) {
      const prev = gradingMap.get(c.gradingCompany) ?? { value: 0, count: 0 };
      gradingMap.set(c.gradingCompany, { value: prev.value + getCardValue(c), count: prev.count + 1 });
    }
  }
  for (const [name, data] of gradingMap) {
    const exposure = (data.value / totalValue) * 100;
    if (exposure >= 30) {
      risks.push({
        type: 'grading_company',
        name,
        exposure: Math.round(exposure * 10) / 10,
        cardCount: data.count,
        value: Math.round(data.value * 100) / 100,
        riskLevel: exposure >= 70 ? 'critical' : exposure >= 50 ? 'high' : exposure >= 40 ? 'medium' : 'low',
      });
    }
  }

  return risks.sort((a, b) => b.exposure - a.exposure);
}

// ─── Diversification Metrics ────────────────────────────────────────────────

function calculateDiversification(cards: CardInventory[]): DiversificationMetrics {
  const totalValue = getPortfolioValue(cards);
  if (totalValue === 0 || cards.length === 0) {
    return { herfindahlIndex: 1, effectivePositions: 1, diversificationBenefit: 0, sportCount: 0, playerCount: 0, eraSpread: 0, riskScore: 100 };
  }

  // Herfindahl-Hirschman Index by player
  const playerValues = new Map<string, number>();
  for (const c of cards) {
    playerValues.set(c.player, (playerValues.get(c.player) ?? 0) + getCardValue(c));
  }
  const shares = [...playerValues.values()].map(v => v / totalValue);
  const hhi = shares.reduce((s, w) => s + w * w, 0);
  const effectivePositions = 1 / Math.max(hhi, 0.001);

  // Sport diversity
  const sports = new Set(cards.map(c => c.sport));

  // Era spread
  const years = cards.map(c => c.year);
  const eraSpread = years.length > 0 ? Math.max(...years) - Math.min(...years) : 0;

  // Undiversified portfolio variance vs diversified
  const sportWeights = new Map<Sport, number>();
  for (const c of cards) {
    sportWeights.set(c.sport, (sportWeights.get(c.sport) ?? 0) + getCardValue(c) / totalValue);
  }

  let undiversifiedVol = 0;
  for (const [, w] of sportWeights) {
    undiversifiedVol += w * 0.20; // average vol
  }

  let diversifiedVar = 0;
  const sportEntries = [...sportWeights.entries()];
  for (let i = 0; i < sportEntries.length; i++) {
    for (let j = 0; j < sportEntries.length; j++) {
      const [s1, w1] = sportEntries[i];
      const [s2, w2] = sportEntries[j];
      const corr = getSportCorrelation(s1, s2);
      const v1 = SPORT_VOLATILITY[s1] ?? 0.20;
      const v2 = SPORT_VOLATILITY[s2] ?? 0.20;
      diversifiedVar += w1 * w2 * v1 * v2 * corr;
    }
  }
  const diversifiedVol = Math.sqrt(Math.max(0, diversifiedVar));
  const diversificationBenefit = undiversifiedVol > 0
    ? Math.round(((undiversifiedVol - diversifiedVol) / undiversifiedVol) * 10000) / 100
    : 0;

  // Risk score: 1-100 (100 = most risky)
  const hhiScore = Math.min(hhi * 100, 40);
  const sportScore = Math.max(0, (1 - sports.size / 5) * 25);
  const countScore = Math.max(0, (1 - Math.min(cards.length, 20) / 20) * 20);
  const eraScore = Math.max(0, (1 - Math.min(eraSpread, 30) / 30) * 15);
  const riskScore = Math.round(Math.min(100, Math.max(1, hhiScore + sportScore + countScore + eraScore)));

  return {
    herfindahlIndex: Math.round(hhi * 1000) / 1000,
    effectivePositions: Math.round(effectivePositions * 10) / 10,
    diversificationBenefit: Math.max(0, diversificationBenefit),
    sportCount: sports.size,
    playerCount: playerValues.size,
    eraSpread,
    riskScore,
  };
}

// ─── Hedging Recommendations ────────────────────────────────────────────────

function generateHedgingRecommendations(
  concentrationRisks: ConcentrationRisk[],
  diversification: DiversificationMetrics,
  cards: CardInventory[]
): HedgingRecommendation[] {
  const recs: HedgingRecommendation[] = [];
  let recId = 0;

  // Player concentration
  const criticalPlayers = concentrationRisks.filter(r => r.type === 'player' && r.riskLevel === 'critical');
  for (const risk of criticalPlayers) {
    recs.push({
      id: `rec_${recId++}`,
      action: `Reduce ${risk.name} exposure from ${risk.exposure.toFixed(1)}% to under 25%`,
      rationale: `Single-player concentration of ${risk.exposure.toFixed(1)}% creates catastrophic risk if player value declines.`,
      impact: `Could reduce portfolio VaR by 15-25%`,
      priority: 'high',
      category: 'reduce',
    });
  }

  // Sport concentration
  const criticalSports = concentrationRisks.filter(r => r.type === 'sport' && (r.riskLevel === 'critical' || r.riskLevel === 'high'));
  for (const risk of criticalSports) {
    const otherSports = ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'].filter(s => s !== risk.name);
    recs.push({
      id: `rec_${recId++}`,
      action: `Diversify into ${otherSports.slice(0, 2).join(' or ')} to balance ${risk.name} exposure`,
      rationale: `${risk.name} at ${risk.exposure.toFixed(1)}% of portfolio leaves you vulnerable to sport-specific events.`,
      impact: `Diversification benefit could increase by ${Math.round(risk.exposure * 0.3)}%`,
      priority: risk.riskLevel === 'critical' ? 'high' : 'medium',
      category: 'diversify',
    });
  }

  // Low diversification
  if (diversification.sportCount < 3) {
    recs.push({
      id: `rec_${recId++}`,
      action: `Add cards from ${3 - diversification.sportCount} more sport(s) to improve diversification`,
      rationale: `Only ${diversification.sportCount} sport(s) represented. Cross-sport diversification reduces correlated risk.`,
      impact: `Could reduce portfolio volatility by 10-20%`,
      priority: 'medium',
      category: 'diversify',
    });
  }

  // Grading company concentration
  const gradingRisks = concentrationRisks.filter(r => r.type === 'grading_company' && r.exposure > 60);
  for (const risk of gradingRisks) {
    recs.push({
      id: `rec_${recId++}`,
      action: `Consider BGS or SGC-graded cards to reduce ${risk.name} dependency`,
      rationale: `${risk.exposure.toFixed(1)}% exposure to ${risk.name} means a grading controversy could hit your entire portfolio.`,
      impact: `Reduces grading-specific tail risk`,
      priority: 'medium',
      category: 'hedge',
    });
  }

  // Low effective positions
  if (diversification.effectivePositions < 5 && cards.length >= 3) {
    recs.push({
      id: `rec_${recId++}`,
      action: `Rebalance to equalize position sizes (currently ${diversification.effectivePositions.toFixed(1)} effective positions)`,
      rationale: `Portfolio is concentrated in a few high-value cards. Equal-weighting reduces idiosyncratic risk.`,
      impact: `Could improve risk-adjusted returns by 5-15%`,
      priority: 'low',
      category: 'rebalance',
    });
  }

  // Era concentration
  const eraRisks = concentrationRisks.filter(r => r.type === 'era' && r.riskLevel !== 'low');
  for (const risk of eraRisks) {
    recs.push({
      id: `rec_${recId++}`,
      action: `Add vintage or modern cards to diversify beyond the ${risk.name} era`,
      rationale: `${risk.exposure.toFixed(1)}% in ${risk.name} cards. Era-specific trends can shift rapidly.`,
      impact: `Smooths generational demand cycles`,
      priority: 'low',
      category: 'diversify',
    });
  }

  return recs.sort((a, b) => {
    const pOrder = { high: 0, medium: 1, low: 2 };
    return pOrder[a.priority] - pOrder[b.priority];
  });
}

// ─── Public API ─────────────────────────────────────────────────────────────

export function getPercentileBands(paths: MonteCarloPath[]): PercentileBand[] {
  return paths.map(p => ({
    month: p.month,
    p5: Math.round(percentile(p.values, 5) * 100) / 100,
    p25: Math.round(percentile(p.values, 25) * 100) / 100,
    p50: Math.round(percentile(p.values, 50) * 100) / 100,
    p75: Math.round(percentile(p.values, 75) * 100) / 100,
    p95: Math.round(percentile(p.values, 95) * 100) / 100,
    mean: Math.round((p.values.reduce((s, v) => s + v, 0) / p.values.length) * 100) / 100,
  }));
}

export function runStressTest(
  cards: CardInventory[],
  scenario: StressScenario,
  horizon: TimeHorizon = 365
): StressTestResult {
  const portfolioValue = getPortfolioValue(cards);
  const seed = cards.length * 1337 + horizon + scenario.id.length * 7;
  const { paths, finalValues } = runMonteCarloSimulation(cards, scenario, horizon, seed);
  const percentileBands = getPercentileBands(paths);
  const var95 = calculateVaR(portfolioValue, finalValues, horizon, 95);
  const var99 = calculateVaR(portfolioValue, finalValues, horizon, 99);
  const drawdown = calculateDrawdown(paths);
  const concentrationRisks = analyzeConcentrationRisks(cards);
  const diversification = calculateDiversification(cards);
  const hedgingRecommendations = generateHedgingRecommendations(concentrationRisks, diversification, cards);

  const result: StressTestResult = {
    id: `st_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    timestamp: new Date().toISOString(),
    portfolioValue,
    numSimulations: NUM_SIMULATIONS,
    horizon,
    percentileBands,
    var95,
    var99,
    drawdown,
    concentrationRisks,
    diversification,
    hedgingRecommendations,
    riskScore: diversification.riskScore,
  };

  saveResult(result);
  return result;
}

export function getQuickRiskSummary(cards: CardInventory[]): {
  riskScore: number;
  worstCaseVaR: VaRResult;
  topConcentration: ConcentrationRisk | null;
  diversification: DiversificationMetrics;
} {
  const portfolioValue = getPortfolioValue(cards);
  const scenario = PRESET_SCENARIOS[0]; // market crash for worst-case
  const seed = cards.length * 42 + 365;
  const { finalValues } = runMonteCarloSimulation(cards, scenario, 365, seed);
  const worstCaseVaR = calculateVaR(portfolioValue, finalValues, 365, 95);
  const concentrationRisks = analyzeConcentrationRisks(cards);
  const diversification = calculateDiversification(cards);

  return {
    riskScore: diversification.riskScore,
    worstCaseVaR,
    topConcentration: concentrationRisks.length > 0 ? concentrationRisks[0] : null,
    diversification,
  };
}

export function createCustomScenario(
  name: string,
  description: string,
  shocks: ScenarioShock[]
): StressScenario {
  const scenario: StressScenario = {
    id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    description,
    category: 'market',
    shocks,
    isCustom: true,
    createdAt: new Date().toISOString(),
  };
  const existing = getCustomScenarios();
  existing.push(scenario);
  localStorage.setItem(STORAGE_KEY_CUSTOM_SCENARIOS, JSON.stringify(existing));
  return scenario;
}

export function getCustomScenarios(): StressScenario[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_SCENARIOS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function deleteCustomScenario(id: string): void {
  const scenarios = getCustomScenarios().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY_CUSTOM_SCENARIOS, JSON.stringify(scenarios));
}

export function getAllScenarios(): StressScenario[] {
  return [...PRESET_SCENARIOS, ...getCustomScenarios()];
}

function saveResult(result: StressTestResult): void {
  try {
    const existing = getSavedResults();
    existing.unshift(result);
    // Keep last 20 results
    const trimmed = existing.slice(0, 20);
    localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(trimmed));
  } catch {
    // storage full, ignore
  }
}

export function getSavedResults(): StressTestResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RESULTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearResults(): void {
  localStorage.removeItem(STORAGE_KEY_RESULTS);
}

export function getRiskScoreLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Very High', color: 'text-red-400' };
  if (score >= 60) return { label: 'High', color: 'text-amber-400' };
  if (score >= 40) return { label: 'Moderate', color: 'text-yellow-400' };
  if (score >= 20) return { label: 'Low', color: 'text-green-400' };
  return { label: 'Very Low', color: 'text-emerald-400' };
}

export function getScenarioCategoryColor(category: StressScenario['category']): {
  text: string; bg: string; border: string;
} {
  switch (category) {
    case 'market': return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
    case 'grading': return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    case 'sport': return { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
    case 'player': return { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' };
    case 'boom': return { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' };
    default: return { text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' };
  }
}
