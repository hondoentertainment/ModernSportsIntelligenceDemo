// @ts-nocheck
import { store } from '../dal/syncStore';

// ── Phase 89: Portfolio Attribution & Performance Decomposition ──

const STORAGE_KEY = 'msi_portfolio_attribution';

// ── Types ──

export type FactorName =
  | 'player_performance'
  | 'market_beta'
  | 'grade_premium'
  | 'scarcity'
  | 'sport_rotation'
  | 'era_shift'
  | 'momentum'
  | 'sentiment';

export interface AttributionFactor {
  name: FactorName;
  contribution: number;        // percentage
  basisPoints: number;         // basis points (contribution * 100)
  description: string;
}

export interface ReturnAttribution {
  period: string;
  totalReturn: number;
  factors: AttributionFactor[];
  residual: number;
  benchmarkReturn: number;
  activeReturn: number;
}

export interface AlphaBeta {
  alpha: number;
  beta: number;
  rSquared: number;
  trackingError: number;
  informationRatio: number;
  benchmark: string;
  period: string;
}

export interface DrawdownEvent {
  startDate: string;
  endDate: string;
  depth: number;
  recovery: number;   // days
  cause: string;
}

export interface DrawdownAnalysis {
  currentDrawdown: number;
  maxDrawdown: number;
  maxDrawdownDate: string;
  recoveryDays: number;
  avgDrawdown: number;
  drawdowns: DrawdownEvent[];
}

export interface SectorEntry {
  name: string;
  weightStart: number;
  weightEnd: number;
  return: number;
  contribution: number;
  flow: 'inflow' | 'outflow' | 'neutral';
}

export interface SectorRotation {
  period: string;
  sectors: SectorEntry[];
}

export interface PerformanceDecomposition {
  period: string;
  skillReturn: number;   // alpha
  marketReturn: number;  // beta
  luckFactor: number;
  totalReturn: number;
  percentSkill: number;
  percentMarket: number;
  percentLuck: number;
}

export interface MonthlyAttributionPoint {
  month: string;
  player_performance: number;
  market_beta: number;
  grade_premium: number;
  scarcity: number;
  sport_rotation: number;
  era_shift: number;
  momentum: number;
  sentiment: number;
  total: number;
}

// ── Helpers ──

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function round(val: number, decimals = 2): number {
  return Math.round(val * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

const FACTOR_DESCRIPTIONS: Record<FactorName, string> = {
  player_performance: 'Returns driven by on-field player stats, awards, and career milestones',
  market_beta: 'Systematic market exposure — the overall sports card market tide lifting all boats',
  grade_premium: 'Alpha from holding higher-graded (PSA 10, BGS 9.5+) cards vs raw/lower grades',
  scarcity: 'Premium captured from low-population cards, serial numbers, and 1/1s',
  sport_rotation: 'Returns from over/underweighting specific sports during their seasonal cycles',
  era_shift: 'Generational rotation effect — vintage vs modern vs ultra-modern allocation drift',
  momentum: 'Short-term price momentum factor capturing trending cards and players',
  sentiment: 'Social media buzz, hobby community sentiment, and news-driven price moves',
};

const MONTH_LABELS = [
  'Apr 2025', 'May 2025', 'Jun 2025', 'Jul 2025', 'Aug 2025', 'Sep 2025',
  'Oct 2025', 'Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026',
];

// Monthly factor seeds — creates realistic attribution data
const MONTHLY_FACTORS: Record<string, number[]> = {
  'Apr 2025': [1.2, 2.1, 0.8, 0.4, 0.3, -0.2, 0.6, 0.3],
  'May 2025': [2.4, 1.8, 1.1, 0.6, -0.5, 0.3, 1.2, 0.7],
  'Jun 2025': [-0.8, -1.2, 0.4, 0.2, 0.8, 0.1, -1.0, -0.5],
  'Jul 2025': [1.6, 0.9, 1.3, 0.8, 0.6, 0.4, 0.3, 0.2],
  'Aug 2025': [3.1, 2.4, 1.8, 0.9, -0.3, 0.1, 0.5, -0.3],
  'Sep 2025': [-1.5, -2.0, 0.3, -0.4, 1.2, -0.6, -0.8, -1.1],
  'Oct 2025': [0.8, 1.6, 0.9, 0.5, 0.7, 0.3, 1.1, 0.4],
  'Nov 2025': [2.0, 1.4, 1.5, 1.2, -0.2, 0.6, 0.8, 0.3],
  'Dec 2025': [-0.3, 0.8, 0.6, 0.3, -0.4, 0.2, -0.2, 0.1],
  'Jan 2026': [1.8, 2.2, 1.0, 0.7, 0.5, -0.1, 1.4, 0.6],
  'Feb 2026': [0.6, 1.1, 0.7, 0.4, 0.3, 0.2, -0.3, 0.1],
  'Mar 2026': [3.1, 2.4, 1.8, 0.9, 0.2, -0.1, 0.5, -0.6],
};

const FACTOR_NAMES: FactorName[] = [
  'player_performance', 'market_beta', 'grade_premium', 'scarcity',
  'sport_rotation', 'era_shift', 'momentum', 'sentiment',
];

function buildMonthlyData(): MonthlyAttributionPoint[] {
  return MONTH_LABELS.map((month) => {
    const factors = MONTHLY_FACTORS[month] || [0, 0, 0, 0, 0, 0, 0, 0];
    const total = round(factors.reduce((s, v) => s + v, 0));
    return {
      month,
      player_performance: factors[0],
      market_beta: factors[1],
      grade_premium: factors[2],
      scarcity: factors[3],
      sport_rotation: factors[4],
      era_shift: factors[5],
      momentum: factors[6],
      sentiment: factors[7],
      total,
    };
  });
}

function aggregateFactors(months: MonthlyAttributionPoint[]): AttributionFactor[] {
  return FACTOR_NAMES.map((name, _idx) => {
    const contribution = round(months.reduce((s, m) => s + (m[name] as number), 0));
    return {
      name,
      contribution,
      basisPoints: Math.round(contribution * 100),
      description: FACTOR_DESCRIPTIONS[name],
    };
  });
}

function periodMonths(period: '1m' | '3m' | '6m' | '1y' | 'ytd'): number {
  switch (period) {
    case '1m': return 1;
    case '3m': return 3;
    case '6m': return 6;
    case '1y': return 12;
    case 'ytd': return 3; // Jan-Mar 2026
    default: return 12;
  }
}

// ── localStorage persistence ──

function loadCache<T>(key: string): T | null {
  return store.get<T | null>(`${STORAGE_KEY}_${key}`, null);
}

function saveCache(key: string, data: unknown): void {
  store.set(`${STORAGE_KEY}_${key}`, data);
}

// ── Public API ──

export function getReturnAttribution(period: '1m' | '3m' | '6m' | '1y' | 'ytd'): ReturnAttribution {
  const cached = loadCache<ReturnAttribution>(`attribution_${period}`);
  if (cached) return cached;

  const allMonths = buildMonthlyData();
  const count = periodMonths(period);
  const relevantMonths = allMonths.slice(-count);
  const factors = aggregateFactors(relevantMonths);
  const totalReturn = round(factors.reduce((s, f) => s + f.contribution, 0));
  const residual = round(seededRandom(count * 17) * 0.4 - 0.2);
  const benchmarkReturn = round(totalReturn - (1.2 + seededRandom(count * 31) * 1.8));
  const activeReturn = round(totalReturn - benchmarkReturn);

  const result: ReturnAttribution = {
    period,
    totalReturn: round(totalReturn + residual),
    factors,
    residual,
    benchmarkReturn,
    activeReturn,
  };

  saveCache(`attribution_${period}`, result);
  return result;
}

export function getAlphaBeta(benchmarkTicker: string = 'HOBBY-500'): AlphaBeta {
  const cached = loadCache<AlphaBeta>(`alphabeta_${benchmarkTicker}`);
  if (cached) return cached;

  const seed = benchmarkTicker.length * 137;
  const result: AlphaBeta = {
    alpha: round(2.3 + seededRandom(seed) * 1.4),
    beta: round(0.82 + seededRandom(seed + 1) * 0.25),
    rSquared: round(0.71 + seededRandom(seed + 2) * 0.18),
    trackingError: round(3.8 + seededRandom(seed + 3) * 2.1),
    informationRatio: round(0.62 + seededRandom(seed + 4) * 0.5),
    benchmark: benchmarkTicker,
    period: '1y',
  };

  saveCache(`alphabeta_${benchmarkTicker}`, result);
  return result;
}

export function getDrawdownAnalysis(): DrawdownAnalysis {
  const cached = loadCache<DrawdownAnalysis>('drawdowns');
  if (cached) return cached;

  const drawdowns: DrawdownEvent[] = [
    {
      startDate: '2023-03-15',
      endDate: '2023-05-22',
      depth: -12.4,
      recovery: 68,
      cause: 'Ja Morant scandal — mass panic selling across basketball cards',
    },
    {
      startDate: '2020-03-10',
      endDate: '2020-06-18',
      depth: -8.1,
      recovery: 100,
      cause: 'COVID lockdown — sports season cancellation fears',
    },
    {
      startDate: '2024-09-05',
      endDate: '2024-10-28',
      depth: -5.3,
      recovery: 53,
      cause: 'Broad market correction — interest rate fears spilling into hobby',
    },
    {
      startDate: '2025-07-12',
      endDate: '2025-08-19',
      depth: -3.7,
      recovery: 38,
      cause: 'Grading backlog FUD — PSA turnaround concerns',
    },
  ];

  const result: DrawdownAnalysis = {
    currentDrawdown: -1.2,
    maxDrawdown: -12.4,
    maxDrawdownDate: '2023-04-18',
    recoveryDays: 68,
    avgDrawdown: round(drawdowns.reduce((s, d) => s + d.depth, 0) / drawdowns.length),
    drawdowns,
  };

  saveCache('drawdowns', result);
  return result;
}

export function getSectorRotation(period: '1m' | '3m' | '6m' | '1y' | 'ytd'): SectorRotation {
  const cached = loadCache<SectorRotation>(`sector_${period}`);
  if (cached) return cached;

  const sectors: SectorEntry[] = [
    { name: 'Basketball', weightStart: 32, weightEnd: 36, return: 14.2, contribution: 4.8, flow: 'inflow' },
    { name: 'Football', weightStart: 28, weightEnd: 25, return: 6.3, contribution: 1.7, flow: 'outflow' },
    { name: 'Baseball', weightStart: 22, weightEnd: 24, return: 9.1, contribution: 2.1, flow: 'inflow' },
    { name: 'Hockey', weightStart: 8, weightEnd: 6, return: -2.4, contribution: -0.2, flow: 'outflow' },
    { name: 'Soccer', weightStart: 5, weightEnd: 5, return: 3.6, contribution: 0.2, flow: 'neutral' },
    { name: 'Vintage (pre-1980)', weightStart: 18, weightEnd: 20, return: 11.5, contribution: 2.2, flow: 'inflow' },
    { name: 'Modern (1980-2010)', weightStart: 35, weightEnd: 32, return: 4.8, contribution: 1.6, flow: 'outflow' },
    { name: 'Ultra-Modern (2010+)', weightStart: 47, weightEnd: 48, return: 8.9, contribution: 4.2, flow: 'inflow' },
  ];

  const result: SectorRotation = { period, sectors };
  saveCache(`sector_${period}`, result);
  return result;
}

export function getPerformanceDecomposition(period: '1m' | '3m' | '6m' | '1y' | 'ytd'): PerformanceDecomposition {
  const cached = loadCache<PerformanceDecomposition>(`decomp_${period}`);
  if (cached) return cached;

  const allMonths = buildMonthlyData();
  const count = periodMonths(period);
  const relevantMonths = allMonths.slice(-count);
  const totalReturn = round(relevantMonths.reduce((s, m) => s + m.total, 0));

  const marketReturn = round(relevantMonths.reduce((s, m) => s + m.market_beta, 0));
  const skillReturn = round(totalReturn - marketReturn - (seededRandom(count * 7) * 1.2));
  const luckFactor = round(totalReturn - skillReturn - marketReturn);

  const abs = Math.abs(skillReturn) + Math.abs(marketReturn) + Math.abs(luckFactor);
  const percentSkill = abs > 0 ? round((Math.abs(skillReturn) / abs) * 100) : 33;
  const percentMarket = abs > 0 ? round((Math.abs(marketReturn) / abs) * 100) : 33;
  const percentLuck = round(100 - percentSkill - percentMarket);

  const result: PerformanceDecomposition = {
    period,
    skillReturn,
    marketReturn,
    luckFactor,
    totalReturn,
    percentSkill,
    percentMarket,
    percentLuck,
  };

  saveCache(`decomp_${period}`, result);
  return result;
}

export function getAttributionTimeline(): MonthlyAttributionPoint[] {
  const cached = loadCache<MonthlyAttributionPoint[]>('timeline');
  if (cached) return cached;

  const data = buildMonthlyData();
  saveCache('timeline', data);
  return data;
}

// Scatter plot data for alpha/beta — portfolio vs benchmark monthly returns
export function getScatterData(): { portfolioReturn: number; benchmarkReturn: number; month: string }[] {
  const months = buildMonthlyData();
  return months.map((m, i) => {
    const port = m.total;
    const bench = round(port - (1.0 + seededRandom(i * 43) * 2.0 - 1.0));
    return { portfolioReturn: port, benchmarkReturn: bench, month: m.month };
  });
}

// Underwater chart data for drawdowns
export function getUnderwaterData(): { month: string; drawdown: number }[] {
  const months = buildMonthlyData();
  let peak = 100;
  let cumulative = 100;
  return months.map((m) => {
    cumulative = round(cumulative * (1 + m.total / 100));
    if (cumulative > peak) peak = cumulative;
    const dd = round(((cumulative - peak) / peak) * 100);
    return { month: m.month, drawdown: dd };
  });
}

// Sector weight timeline for stacked area
export function getSectorWeightTimeline(): { month: string; Basketball: number; Football: number; Baseball: number; Hockey: number; Soccer: number }[] {
  return MONTH_LABELS.map((month, i) => {
    const seed = i * 31;
    return {
      month,
      Basketball: round(30 + seededRandom(seed) * 8),
      Football: round(24 + seededRandom(seed + 1) * 6),
      Baseball: round(20 + seededRandom(seed + 2) * 5),
      Hockey: round(6 + seededRandom(seed + 3) * 4),
      Soccer: round(4 + seededRandom(seed + 4) * 3),
    };
  });
}
