// Cross-Asset Correlation Engine Service
// Correlates sports card values with traditional financial assets to demonstrate
// cards as an investable alternative asset class.

/** UI copy: series and stats are seeded/synthetic until live or imported data is wired. */
export const CROSS_ASSET_DATA_SOURCE =
  'Synthetic seeded time series and summary statistics for visualization and education—not live broker, exchange, or index feeds. Connecting real or user-imported series is future work.';

// ─── Types ───────────────────────────────────────────────────────────────────

export type AssetCategory =
  | 'equity'
  | 'crypto'
  | 'commodity'
  | 'bond'
  | 'realestate'
  | 'collectible'
  | 'volatility';

export interface AssetClass {
  id: string;
  name: string;
  ticker: string;
  category: AssetCategory;
  currentValue: number;
  returns1Y: number;
  returns3Y: number;
  returns5Y: number;
  volatility: number;
  sharpeRatio: number;
  color: string;
}

export interface CorrelationMatrix {
  assets: string[];
  matrix: number[][];
  period: number; // months
  startDate: string;
  endDate: string;
}

export interface CrossAssetTimeSeries {
  dates: string[];
  series: { assetId: string; values: number[] }[];
}

export interface DiversificationScore {
  portfolioId: string;
  overallScore: number; // 0-100
  assetWeights: { assetId: string; weight: number; contribution: number }[];
  efficientFrontierPosition: { expectedReturn: number; volatility: number };
  maxDrawdown: number;
  recoveryTime: number; // months
}

export type MacroRegimeName =
  | 'risk-on'
  | 'risk-off'
  | 'inflation'
  | 'deflation'
  | 'stagflation';

export interface MacroRegime {
  name: MacroRegimeName;
  period: string;
  startDate: string;
  endDate: string;
  assetPerformance: { assetId: string; return: number }[];
}

export interface AlphaSignal {
  signal: string;
  assetPair: [string, string];
  direction: 'long' | 'short' | 'pair';
  strength: number; // 0-1
  confidence: number; // 0-1
  historicalAccuracy: number; // 0-1
  description: string;
  detectedDate: string;
}

export interface DrawdownEvent {
  assetId: string;
  peakDate: string;
  troughDate: string;
  recoveryDate: string | null;
  drawdownPct: number;
  recoveryMonths: number | null;
  peakValue: number;
  troughValue: number;
}

export interface EfficientFrontierPoint {
  expectedReturn: number;
  volatility: number;
  weights: { assetId: string; weight: number }[];
  sharpeRatio: number;
  isOptimal: boolean;
}

export interface RollingCorrelationPoint {
  date: string;
  correlation: number;
}

// ─── Asset Definitions ───────────────────────────────────────────────────────

export const ASSET_CLASSES: AssetClass[] = [
  {
    id: 'sp500',
    name: 'S&P 500',
    ticker: 'SPX',
    category: 'equity',
    currentValue: 5248.32,
    returns1Y: 12.4,
    returns3Y: 31.8,
    returns5Y: 82.6,
    volatility: 16.2,
    sharpeRatio: 0.91,
    color: '#3b82f6',
  },
  {
    id: 'nasdaq',
    name: 'NASDAQ 100',
    ticker: 'NDX',
    category: 'equity',
    currentValue: 18432.17,
    returns1Y: 18.7,
    returns3Y: 38.2,
    returns5Y: 121.4,
    volatility: 21.8,
    sharpeRatio: 0.97,
    color: '#6366f1',
  },
  {
    id: 'btc',
    name: 'Bitcoin',
    ticker: 'BTC',
    category: 'crypto',
    currentValue: 67842.0,
    returns1Y: 52.3,
    returns3Y: 78.1,
    returns5Y: 412.6,
    volatility: 62.4,
    sharpeRatio: 0.72,
    color: '#f59e0b',
  },
  {
    id: 'eth',
    name: 'Ethereum',
    ticker: 'ETH',
    category: 'crypto',
    currentValue: 3421.5,
    returns1Y: 38.1,
    returns3Y: 42.6,
    returns5Y: 892.3,
    volatility: 71.2,
    sharpeRatio: 0.58,
    color: '#8b5cf6',
  },
  {
    id: 'gold',
    name: 'Gold',
    ticker: 'GLD',
    category: 'commodity',
    currentValue: 2342.8,
    returns1Y: 14.2,
    returns3Y: 22.4,
    returns5Y: 48.1,
    volatility: 14.6,
    sharpeRatio: 0.68,
    color: '#eab308',
  },
  {
    id: 'silver',
    name: 'Silver',
    ticker: 'SLV',
    category: 'commodity',
    currentValue: 27.84,
    returns1Y: 8.6,
    returns3Y: 16.2,
    returns5Y: 34.8,
    volatility: 24.1,
    sharpeRatio: 0.42,
    color: '#94a3b8',
  },
  {
    id: 'realestate',
    name: 'US Real Estate Index',
    ticker: 'VNQ',
    category: 'realestate',
    currentValue: 92.46,
    returns1Y: 6.8,
    returns3Y: -2.4,
    returns5Y: 18.2,
    volatility: 19.4,
    sharpeRatio: 0.34,
    color: '#10b981',
  },
  {
    id: 'ust10y',
    name: '10Y Treasury Yield',
    ticker: 'TNX',
    category: 'bond',
    currentValue: 4.32,
    returns1Y: -2.1,
    returns3Y: 4.6,
    returns5Y: 8.2,
    volatility: 8.4,
    sharpeRatio: 0.21,
    color: '#06b6d4',
  },
  {
    id: 'vix',
    name: 'VIX',
    ticker: 'VIX',
    category: 'volatility',
    currentValue: 18.42,
    returns1Y: -12.6,
    returns3Y: -28.4,
    returns5Y: -6.2,
    volatility: 82.1,
    sharpeRatio: -0.18,
    color: '#ef4444',
  },
  {
    id: 'oil',
    name: 'Crude Oil',
    ticker: 'CL',
    category: 'commodity',
    currentValue: 78.24,
    returns1Y: -4.2,
    returns3Y: 12.8,
    returns5Y: 86.4,
    volatility: 34.6,
    sharpeRatio: 0.28,
    color: '#78716c',
  },
  {
    id: 'cards_all',
    name: 'Sports Cards Index',
    ticker: 'SCI',
    category: 'collectible',
    currentValue: 1842.6,
    returns1Y: 22.8,
    returns3Y: 68.4,
    returns5Y: 186.2,
    volatility: 28.4,
    sharpeRatio: 1.12,
    color: '#ec4899',
  },
  {
    id: 'cards_football',
    name: 'Football Cards Sub-Index',
    ticker: 'SCI-FB',
    category: 'collectible',
    currentValue: 2146.8,
    returns1Y: 28.4,
    returns3Y: 82.1,
    returns5Y: 224.6,
    volatility: 32.1,
    sharpeRatio: 1.08,
    color: '#f43f5e',
  },
  {
    id: 'cards_basketball',
    name: 'Basketball Cards Sub-Index',
    ticker: 'SCI-BK',
    category: 'collectible',
    currentValue: 1684.2,
    returns1Y: 18.2,
    returns3Y: 54.6,
    returns5Y: 162.8,
    volatility: 34.8,
    sharpeRatio: 0.94,
    color: '#fb923c',
  },
  {
    id: 'cards_hockey',
    name: 'Hockey Cards Sub-Index',
    ticker: 'SCI-HC',
    category: 'collectible',
    currentValue: 986.4,
    returns1Y: 14.6,
    returns3Y: 42.8,
    returns5Y: 118.4,
    volatility: 26.2,
    sharpeRatio: 0.82,
    color: '#2dd4bf',
  },
  {
    id: 'cards_soccer',
    name: 'Soccer Cards Sub-Index',
    ticker: 'SCI-SC',
    category: 'collectible',
    currentValue: 1248.6,
    returns1Y: 32.4,
    returns3Y: 96.2,
    returns5Y: 286.4,
    volatility: 38.6,
    sharpeRatio: 1.18,
    color: '#a3e635',
  },
];

// ─── Seeded Random Number Generator ──────────────────────────────────────────

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ─── Mock Time Series Generation ─────────────────────────────────────────────

function generateDates(months: number): string[] {
  const dates: string[] = [];
  const end = new Date(2026, 2, 1); // March 2026
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setMonth(d.getMonth() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

// Base monthly returns by asset (annualized drift / 12 + volatility component)
const ASSET_DRIFT: Record<string, number> = {
  sp500: 0.008,
  nasdaq: 0.012,
  btc: 0.025,
  eth: 0.02,
  gold: 0.006,
  silver: 0.004,
  realestate: 0.003,
  ust10y: -0.001,
  vix: -0.005,
  oil: 0.002,
  cards_all: 0.014,
  cards_football: 0.018,
  cards_basketball: 0.012,
  cards_hockey: 0.009,
  cards_soccer: 0.02,
};

const ASSET_VOL: Record<string, number> = {
  sp500: 0.042,
  nasdaq: 0.056,
  btc: 0.16,
  eth: 0.18,
  gold: 0.038,
  silver: 0.062,
  realestate: 0.05,
  ust10y: 0.022,
  vix: 0.21,
  oil: 0.09,
  cards_all: 0.072,
  cards_football: 0.082,
  cards_basketball: 0.088,
  cards_hockey: 0.066,
  cards_soccer: 0.098,
};

// Correlation seeds between asset pairs (approximate target correlations)
const CORR_TARGETS: Record<string, number> = {
  'sp500:nasdaq': 0.92,
  'sp500:btc': 0.38,
  'sp500:eth': 0.35,
  'sp500:gold': -0.12,
  'sp500:silver': 0.08,
  'sp500:realestate': 0.62,
  'sp500:ust10y': -0.34,
  'sp500:vix': -0.78,
  'sp500:oil': 0.24,
  'sp500:cards_all': 0.18,
  'sp500:cards_football': 0.14,
  'sp500:cards_basketball': 0.22,
  'sp500:cards_hockey': 0.08,
  'sp500:cards_soccer': 0.12,
  'nasdaq:btc': 0.48,
  'nasdaq:eth': 0.46,
  'nasdaq:gold': -0.18,
  'nasdaq:silver': 0.02,
  'nasdaq:realestate': 0.52,
  'nasdaq:ust10y': -0.38,
  'nasdaq:vix': -0.82,
  'nasdaq:oil': 0.18,
  'nasdaq:cards_all': 0.22,
  'nasdaq:cards_football': 0.16,
  'nasdaq:cards_basketball': 0.28,
  'nasdaq:cards_hockey': 0.1,
  'nasdaq:cards_soccer': 0.18,
  'btc:eth': 0.88,
  'btc:gold': 0.14,
  'btc:silver': 0.12,
  'btc:realestate': 0.08,
  'btc:ust10y': -0.22,
  'btc:vix': -0.26,
  'btc:oil': 0.06,
  'btc:cards_all': 0.32,
  'btc:cards_football': 0.28,
  'btc:cards_basketball': 0.36,
  'btc:cards_hockey': 0.18,
  'btc:cards_soccer': 0.34,
  'eth:gold': 0.08,
  'eth:silver': 0.1,
  'eth:realestate': 0.04,
  'eth:ust10y': -0.18,
  'eth:vix': -0.24,
  'eth:oil': 0.04,
  'eth:cards_all': 0.28,
  'eth:cards_football': 0.22,
  'eth:cards_basketball': 0.34,
  'eth:cards_hockey': 0.14,
  'eth:cards_soccer': 0.3,
  'gold:silver': 0.82,
  'gold:realestate': 0.16,
  'gold:ust10y': -0.42,
  'gold:vix': 0.22,
  'gold:oil': 0.28,
  'gold:cards_all': 0.06,
  'gold:cards_football': 0.04,
  'gold:cards_basketball': 0.08,
  'gold:cards_hockey': 0.12,
  'gold:cards_soccer': 0.02,
  'silver:realestate': 0.12,
  'silver:ust10y': -0.28,
  'silver:vix': 0.14,
  'silver:oil': 0.34,
  'silver:cards_all': 0.1,
  'silver:cards_football': 0.08,
  'silver:cards_basketball': 0.12,
  'silver:cards_hockey': 0.14,
  'silver:cards_soccer': 0.06,
  'realestate:ust10y': -0.56,
  'realestate:vix': -0.42,
  'realestate:oil': 0.18,
  'realestate:cards_all': 0.14,
  'realestate:cards_football': 0.12,
  'realestate:cards_basketball': 0.16,
  'realestate:cards_hockey': 0.08,
  'realestate:cards_soccer': 0.1,
  'ust10y:vix': 0.32,
  'ust10y:oil': 0.08,
  'ust10y:cards_all': -0.08,
  'ust10y:cards_football': -0.06,
  'ust10y:cards_basketball': -0.1,
  'ust10y:cards_hockey': -0.04,
  'ust10y:cards_soccer': -0.08,
  'vix:oil': -0.16,
  'vix:cards_all': -0.14,
  'vix:cards_football': -0.1,
  'vix:cards_basketball': -0.18,
  'vix:cards_hockey': -0.06,
  'vix:cards_soccer': -0.12,
  'oil:cards_all': 0.04,
  'oil:cards_football': 0.02,
  'oil:cards_basketball': 0.06,
  'oil:cards_hockey': 0.08,
  'oil:cards_soccer': 0.02,
  'cards_all:cards_football': 0.86,
  'cards_all:cards_basketball': 0.88,
  'cards_all:cards_hockey': 0.72,
  'cards_all:cards_soccer': 0.78,
  'cards_football:cards_basketball': 0.68,
  'cards_football:cards_hockey': 0.54,
  'cards_football:cards_soccer': 0.48,
  'cards_basketball:cards_hockey': 0.52,
  'cards_basketball:cards_soccer': 0.56,
  'cards_hockey:cards_soccer': 0.42,
};

function getTargetCorrelation(a: string, b: string): number {
  if (a === b) return 1;
  const key1 = `${a}:${b}`;
  const key2 = `${b}:${a}`;
  return CORR_TARGETS[key1] ?? CORR_TARGETS[key2] ?? 0;
}

// Generate correlated time series using Cholesky-like approach simplified
let cachedSeries: CrossAssetTimeSeries | null = null;

function generateAllTimeSeries(months: number): CrossAssetTimeSeries {
  if (cachedSeries && cachedSeries.dates.length === months) return cachedSeries;

  const dates = generateDates(months);
  const assetIds = ASSET_CLASSES.map((a) => a.id);
  const rng = seededRandom(42);

  // Generate independent normal-ish random variables
  const independent: number[][] = assetIds.map(() =>
    dates.map(() => {
      // Box-Muller approximation
      const u1 = rng();
      const u2 = rng();
      return Math.sqrt(-2 * Math.log(u1 + 0.0001)) * Math.cos(2 * Math.PI * u2);
    }),
  );

  // Apply approximate correlations with sp500 as the base factor
  const correlated: number[][] = assetIds.map((id, i) => {
    const corrWithSp500 = getTargetCorrelation(id, 'sp500');
    return dates.map((_, t) => {
      const base = independent[0][t]; // sp500 as common factor
      const idio = independent[i][t];
      return corrWithSp500 * base + Math.sqrt(1 - corrWithSp500 * corrWithSp500) * idio;
    });
  });

  // Convert to price series (normalized to 100)
  const series = assetIds.map((id, i) => {
    const drift = ASSET_DRIFT[id] ?? 0.005;
    const vol = ASSET_VOL[id] ?? 0.05;
    const values: number[] = [100];
    for (let t = 1; t < months; t++) {
      const ret = drift + vol * correlated[i][t];
      values.push(values[t - 1] * (1 + ret));
    }
    return { assetId: id, values };
  });

  cachedSeries = { dates, series };
  return cachedSeries;
}

// ─── Correlation Calculation ─────────────────────────────────────────────────

function computeCorrelation(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n < 3) return 0;
  // Use returns, not levels
  const rA: number[] = [];
  const rB: number[] = [];
  for (let i = 1; i < n; i++) {
    rA.push((a[i] - a[i - 1]) / a[i - 1]);
    rB.push((b[i] - b[i - 1]) / b[i - 1]);
  }
  const meanA = rA.reduce((s, v) => s + v, 0) / rA.length;
  const meanB = rB.reduce((s, v) => s + v, 0) / rB.length;
  let cov = 0,
    varA = 0,
    varB = 0;
  for (let i = 0; i < rA.length; i++) {
    const da = rA[i] - meanA;
    const db = rB[i] - meanB;
    cov += da * db;
    varA += da * da;
    varB += db * db;
  }
  const denom = Math.sqrt(varA * varB);
  return denom === 0 ? 0 : Math.round((cov / denom) * 100) / 100;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function getCorrelationMatrix(
  assetIds: string[],
  period: number = 60,
): CorrelationMatrix {
  const ts = generateAllTimeSeries(period);
  const filtered = assetIds.map(
    (id) => ts.series.find((s) => s.assetId === id)?.values ?? [],
  );

  const matrix: number[][] = assetIds.map((_, i) =>
    assetIds.map((_, j) => {
      if (i === j) return 1;
      return computeCorrelation(filtered[i], filtered[j]);
    }),
  );

  return {
    assets: assetIds,
    matrix,
    period,
    startDate: ts.dates[0],
    endDate: ts.dates[ts.dates.length - 1],
  };
}

export function getTimeSeries(
  assetIds: string[],
  months: number = 60,
): CrossAssetTimeSeries {
  const ts = generateAllTimeSeries(months);
  return {
    dates: ts.dates,
    series: ts.series.filter((s) => assetIds.includes(s.assetId)),
  };
}

export function getDiversificationScore(
  weights: { assetId: string; weight: number }[],
): DiversificationScore {
  const totalWeight = weights.reduce((s, w) => s + w.weight, 0);
  const normalized = weights.map((w) => ({
    ...w,
    weight: w.weight / totalWeight,
  }));

  // Calculate portfolio metrics
  const ts = generateAllTimeSeries(60);
  const assetReturns = normalized.map((w) => {
    const series = ts.series.find((s) => s.assetId === w.assetId);
    if (!series || series.values.length < 2) return { ...w, monthlyReturns: [] as number[] };
    const rets: number[] = [];
    for (let i = 1; i < series.values.length; i++) {
      rets.push((series.values[i] - series.values[i - 1]) / series.values[i - 1]);
    }
    return { ...w, monthlyReturns: rets };
  });

  // Portfolio returns
  const months = assetReturns[0]?.monthlyReturns.length ?? 0;
  const portReturns: number[] = [];
  for (let t = 0; t < months; t++) {
    let portRet = 0;
    for (const ar of assetReturns) {
      portRet += ar.weight * (ar.monthlyReturns[t] ?? 0);
    }
    portReturns.push(portRet);
  }

  const avgReturn =
    portReturns.length > 0
      ? portReturns.reduce((s, v) => s + v, 0) / portReturns.length
      : 0;
  const variance =
    portReturns.length > 0
      ? portReturns.reduce((s, v) => s + (v - avgReturn) ** 2, 0) / portReturns.length
      : 0;
  const portVol = Math.sqrt(variance) * Math.sqrt(12); // annualized
  const annReturn = avgReturn * 12;

  // Max drawdown
  let peak = 100;
  let maxDD = 0;
  let ddStart = 0;
  let recoveryMonths = 0;
  let cumValue = 100;
  for (let t = 0; t < portReturns.length; t++) {
    cumValue *= 1 + portReturns[t];
    if (cumValue > peak) {
      peak = cumValue;
      ddStart = t;
    }
    const dd = (peak - cumValue) / peak;
    if (dd > maxDD) {
      maxDD = dd;
      recoveryMonths = t - ddStart;
    }
  }

  // Diversification score: lower avg correlation = higher score
  const corrMatrix = getCorrelationMatrix(
    normalized.map((w) => w.assetId),
    60,
  );
  let totalCorr = 0;
  let count = 0;
  for (let i = 0; i < corrMatrix.matrix.length; i++) {
    for (let j = i + 1; j < corrMatrix.matrix[i].length; j++) {
      totalCorr += Math.abs(corrMatrix.matrix[i][j]);
      count++;
    }
  }
  const avgCorr = count > 0 ? totalCorr / count : 0;
  const score = Math.round(Math.max(0, Math.min(100, (1 - avgCorr) * 100)));

  return {
    portfolioId: 'user-portfolio',
    overallScore: score,
    assetWeights: normalized.map((w) => ({
      assetId: w.assetId,
      weight: w.weight,
      contribution:
        Math.round(
          (w.weight *
            (ASSET_CLASSES.find((a) => a.id === w.assetId)?.returns1Y ?? 0)) *
            100,
        ) / 100,
    })),
    efficientFrontierPosition: {
      expectedReturn: Math.round(annReturn * 10000) / 100,
      volatility: Math.round(portVol * 10000) / 100,
    },
    maxDrawdown: Math.round(maxDD * 10000) / 100,
    recoveryTime: recoveryMonths,
  };
}

export function getMacroRegimeAnalysis(): MacroRegime[] {
  const regimes: MacroRegime[] = [
    {
      name: 'risk-on',
      period: 'Q3 2023 - Q1 2024',
      startDate: '2023-07-01',
      endDate: '2024-03-31',
      assetPerformance: [
        { assetId: 'sp500', return: 18.2 },
        { assetId: 'nasdaq', return: 24.6 },
        { assetId: 'btc', return: 68.4 },
        { assetId: 'eth', return: 52.1 },
        { assetId: 'gold', return: 4.2 },
        { assetId: 'realestate', return: 8.4 },
        { assetId: 'ust10y', return: -6.8 },
        { assetId: 'vix', return: -32.4 },
        { assetId: 'oil', return: 12.6 },
        { assetId: 'cards_all', return: 28.4 },
        { assetId: 'cards_football', return: 34.2 },
        { assetId: 'cards_basketball', return: 22.8 },
      ],
    },
    {
      name: 'risk-off',
      period: 'Q2 2022 - Q4 2022',
      startDate: '2022-04-01',
      endDate: '2022-12-31',
      assetPerformance: [
        { assetId: 'sp500', return: -14.6 },
        { assetId: 'nasdaq', return: -22.8 },
        { assetId: 'btc', return: -48.2 },
        { assetId: 'eth', return: -56.4 },
        { assetId: 'gold', return: 2.8 },
        { assetId: 'realestate', return: -18.4 },
        { assetId: 'ust10y', return: 14.2 },
        { assetId: 'vix', return: 42.6 },
        { assetId: 'oil', return: -8.4 },
        { assetId: 'cards_all', return: -6.2 },
        { assetId: 'cards_football', return: -4.8 },
        { assetId: 'cards_basketball', return: -12.4 },
      ],
    },
    {
      name: 'inflation',
      period: 'Q1 2022 - Q2 2022',
      startDate: '2022-01-01',
      endDate: '2022-06-30',
      assetPerformance: [
        { assetId: 'sp500', return: -8.4 },
        { assetId: 'nasdaq', return: -16.2 },
        { assetId: 'btc', return: -24.6 },
        { assetId: 'eth', return: -32.8 },
        { assetId: 'gold', return: 12.4 },
        { assetId: 'realestate', return: -4.2 },
        { assetId: 'ust10y', return: 18.6 },
        { assetId: 'vix', return: 28.4 },
        { assetId: 'oil', return: 42.8 },
        { assetId: 'cards_all', return: 8.6 },
        { assetId: 'cards_football', return: 12.4 },
        { assetId: 'cards_basketball', return: 4.2 },
      ],
    },
    {
      name: 'deflation',
      period: 'Q1 2020',
      startDate: '2020-01-01',
      endDate: '2020-03-31',
      assetPerformance: [
        { assetId: 'sp500', return: -19.6 },
        { assetId: 'nasdaq', return: -14.2 },
        { assetId: 'btc', return: -38.4 },
        { assetId: 'eth', return: -42.6 },
        { assetId: 'gold', return: 6.8 },
        { assetId: 'realestate', return: -22.8 },
        { assetId: 'ust10y', return: -24.6 },
        { assetId: 'vix', return: 186.4 },
        { assetId: 'oil', return: -54.2 },
        { assetId: 'cards_all', return: -14.8 },
        { assetId: 'cards_football', return: -12.2 },
        { assetId: 'cards_basketball', return: -18.6 },
      ],
    },
    {
      name: 'stagflation',
      period: 'Q3 2022',
      startDate: '2022-07-01',
      endDate: '2022-09-30',
      assetPerformance: [
        { assetId: 'sp500', return: -6.2 },
        { assetId: 'nasdaq', return: -8.8 },
        { assetId: 'btc', return: -12.4 },
        { assetId: 'eth', return: -18.2 },
        { assetId: 'gold', return: -4.6 },
        { assetId: 'realestate', return: -12.8 },
        { assetId: 'ust10y', return: 8.4 },
        { assetId: 'vix', return: 18.2 },
        { assetId: 'oil', return: -14.6 },
        { assetId: 'cards_all', return: 2.4 },
        { assetId: 'cards_football', return: 4.8 },
        { assetId: 'cards_basketball', return: -2.6 },
      ],
    },
  ];
  return regimes;
}

export function getAlphaSignals(): AlphaSignal[] {
  return [
    {
      signal: 'VIX Spike → Cards Dip Lag',
      assetPair: ['vix', 'cards_all'],
      direction: 'long',
      strength: 0.78,
      confidence: 0.82,
      historicalAccuracy: 0.74,
      description:
        'When VIX spikes >25%, sports cards tend to dip 2-4 weeks later with a mean reversion within 6 weeks. Buy signal activates on VIX normalization.',
      detectedDate: '2026-03-01',
    },
    {
      signal: 'BTC Rally → Football Cards Lead',
      assetPair: ['btc', 'cards_football'],
      direction: 'long',
      strength: 0.64,
      confidence: 0.71,
      historicalAccuracy: 0.68,
      description:
        'Bitcoin rallies exceeding 15% monthly are followed by football card index outperformance within 3-5 weeks, driven by overlapping speculative buyer base.',
      detectedDate: '2026-02-18',
    },
    {
      signal: 'Real Estate Weakness → Card Rotation',
      assetPair: ['realestate', 'cards_all'],
      direction: 'long',
      strength: 0.56,
      confidence: 0.68,
      historicalAccuracy: 0.62,
      description:
        'Sustained real estate declines (>3 months) correlate with capital rotation into collectibles as investors seek tangible alternative stores of value.',
      detectedDate: '2026-02-10',
    },
    {
      signal: 'Gold-Card Divergence',
      assetPair: ['gold', 'cards_all'],
      direction: 'pair',
      strength: 0.72,
      confidence: 0.76,
      historicalAccuracy: 0.71,
      description:
        'When gold and sports cards diverge by >10% over 60 days, a mean-reversion pair trade has historically returned 4.2% with 71% win rate.',
      detectedDate: '2026-03-08',
    },
    {
      signal: 'Treasury Yield Inversion → Cards Safe Haven',
      assetPair: ['ust10y', 'cards_all'],
      direction: 'long',
      strength: 0.58,
      confidence: 0.64,
      historicalAccuracy: 0.66,
      description:
        'Yield curve inversions have preceded 8-12% outperformance in sports card indices over subsequent 6 months as collectors increase holdings.',
      detectedDate: '2026-01-22',
    },
    {
      signal: 'NASDAQ Drawdown → Basketball Cards Discount',
      assetPair: ['nasdaq', 'cards_basketball'],
      direction: 'long',
      strength: 0.68,
      confidence: 0.74,
      historicalAccuracy: 0.72,
      description:
        'NASDAQ drawdowns >10% create buying opportunities in basketball cards which overcorrect due to tech-worker liquidity constraints. Mean reversion in 8-12 weeks.',
      detectedDate: '2026-02-28',
    },
    {
      signal: 'Oil Shock → Hockey Cards Resilience',
      assetPair: ['oil', 'cards_hockey'],
      direction: 'long',
      strength: 0.48,
      confidence: 0.58,
      historicalAccuracy: 0.56,
      description:
        'Oil price spikes show near-zero impact on hockey card valuations, making them an effective hedge during energy-driven inflation periods.',
      detectedDate: '2026-01-15',
    },
    {
      signal: 'Soccer Cards → Emerging Market Proxy',
      assetPair: ['cards_soccer', 'sp500'],
      direction: 'short',
      strength: 0.52,
      confidence: 0.62,
      historicalAccuracy: 0.58,
      description:
        'Soccer card outperformance signals global risk appetite expansion and often leads S&P 500 by 4-6 weeks due to international collector demand dynamics.',
      detectedDate: '2026-03-12',
    },
  ];
}

export function getEfficientFrontier(assetIds: string[]): EfficientFrontierPoint[] {
  const rng = seededRandom(789);
  const points: EfficientFrontierPoint[] = [];

  // Generate ~40 portfolio combinations along the frontier
  for (let i = 0; i < 40; i++) {
    const rawWeights = assetIds.map(() => rng());
    const total = rawWeights.reduce((s, w) => s + w, 0);
    const weights = rawWeights.map((w) => w / total);

    // Calculate expected return and volatility from asset properties
    let expReturn = 0;
    let totalVol = 0;
    for (let k = 0; k < assetIds.length; k++) {
      const asset = ASSET_CLASSES.find((a) => a.id === assetIds[k]);
      if (asset) {
        expReturn += weights[k] * asset.returns1Y;
        totalVol += weights[k] * asset.volatility;
      }
    }

    // Add correlation effect (diversification benefit)
    const diversBenefit = 0.6 + 0.4 * rng();
    totalVol *= diversBenefit;

    const sharpe = totalVol > 0 ? (expReturn - 4.5) / totalVol : 0;

    points.push({
      expectedReturn: Math.round(expReturn * 100) / 100,
      volatility: Math.round(totalVol * 100) / 100,
      weights: assetIds.map((id, k) => ({
        assetId: id,
        weight: Math.round(weights[k] * 1000) / 1000,
      })),
      sharpeRatio: Math.round(sharpe * 100) / 100,
      isOptimal: false,
    });
  }

  // Sort by volatility for frontier shape
  points.sort((a, b) => a.volatility - b.volatility);

  // Mark the tangency portfolio (highest Sharpe)
  let maxSharpeIdx = 0;
  for (let i = 1; i < points.length; i++) {
    if (points[i].sharpeRatio > points[maxSharpeIdx].sharpeRatio) {
      maxSharpeIdx = i;
    }
  }
  points[maxSharpeIdx].isOptimal = true;

  // Add specific "cards-heavy" and "traditional" portfolios
  const cardsHeavy: EfficientFrontierPoint = {
    expectedReturn: 19.4,
    volatility: 22.8,
    weights: assetIds.map((id) => ({
      assetId: id,
      weight: id.startsWith('cards_') ? 0.6 / assetIds.filter((a) => a.startsWith('cards_')).length : 0.4 / assetIds.filter((a) => !a.startsWith('cards_')).length,
    })),
    sharpeRatio: 0.65,
    isOptimal: false,
  };

  const traditional: EfficientFrontierPoint = {
    expectedReturn: 10.8,
    volatility: 14.2,
    weights: assetIds.map((id) => ({
      assetId: id,
      weight: id.startsWith('cards_') ? 0 : 1 / assetIds.filter((a) => !a.startsWith('cards_')).length,
    })),
    sharpeRatio: 0.44,
    isOptimal: false,
  };

  points.push(cardsHeavy, traditional);
  return points;
}

export function getDrawdownAnalysis(assetId: string): DrawdownEvent[] {
  const ts = generateAllTimeSeries(60);
  const series = ts.series.find((s) => s.assetId === assetId);
  if (!series) return [];

  const values = series.values;
  const dates = ts.dates;
  const events: DrawdownEvent[] = [];

  let peak = values[0];
  let peakIdx = 0;
  let inDrawdown = false;
  let troughIdx = 0;
  let troughVal = values[0];

  for (let i = 1; i < values.length; i++) {
    if (values[i] > peak) {
      if (inDrawdown) {
        // Recovery
        const dd = (peak - troughVal) / peak;
        if (dd > 0.03) {
          // Only track drawdowns > 3%
          events.push({
            assetId,
            peakDate: dates[peakIdx],
            troughDate: dates[troughIdx],
            recoveryDate: dates[i],
            drawdownPct: Math.round(dd * 10000) / 100,
            recoveryMonths: i - troughIdx,
            peakValue: Math.round(peak * 100) / 100,
            troughValue: Math.round(troughVal * 100) / 100,
          });
        }
        inDrawdown = false;
      }
      peak = values[i];
      peakIdx = i;
      troughVal = values[i];
    } else {
      inDrawdown = true;
      if (values[i] < troughVal) {
        troughVal = values[i];
        troughIdx = i;
      }
    }
  }

  // Handle ongoing drawdown
  if (inDrawdown) {
    const dd = (peak - troughVal) / peak;
    if (dd > 0.03) {
      events.push({
        assetId,
        peakDate: dates[peakIdx],
        troughDate: dates[troughIdx],
        recoveryDate: null,
        drawdownPct: Math.round(dd * 10000) / 100,
        recoveryMonths: null,
        peakValue: Math.round(peak * 100) / 100,
        troughValue: Math.round(troughVal * 100) / 100,
      });
    }
  }

  return events;
}

export function getRollingCorrelation(
  asset1: string,
  asset2: string,
  windowMonths: number = 12,
): RollingCorrelationPoint[] {
  const ts = generateAllTimeSeries(60);
  const s1 = ts.series.find((s) => s.assetId === asset1)?.values;
  const s2 = ts.series.find((s) => s.assetId === asset2)?.values;
  if (!s1 || !s2) return [];

  const points: RollingCorrelationPoint[] = [];

  for (let i = windowMonths; i < ts.dates.length; i++) {
    const window1 = s1.slice(i - windowMonths, i + 1);
    const window2 = s2.slice(i - windowMonths, i + 1);
    const corr = computeCorrelation(window1, window2);
    points.push({
      date: ts.dates[i],
      correlation: corr,
    });
  }

  return points;
}

// ─── Helper Exports ──────────────────────────────────────────────────────────

export function getAssetById(id: string): AssetClass | undefined {
  return ASSET_CLASSES.find((a) => a.id === id);
}

export function getAssetsByCategory(category: AssetCategory): AssetClass[] {
  return ASSET_CLASSES.filter((a) => a.category === category);
}

export const DEFAULT_ASSET_IDS = [
  'sp500',
  'btc',
  'gold',
  'realestate',
  'ust10y',
  'vix',
  'cards_all',
];

export const CARD_ASSET_IDS = [
  'cards_all',
  'cards_football',
  'cards_basketball',
  'cards_hockey',
  'cards_soccer',
];
