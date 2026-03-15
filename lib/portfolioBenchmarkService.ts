// ---- Types ----

export type BenchmarkIndex =
  | 'sp500'
  | 'nasdaq'
  | 'bitcoin'
  | 'gold'
  | 'real_estate'
  | 'psa_500'
  | 'card_market'
  | 'vintage_index'
  | 'modern_index'
  | 'rookie_index';

export type TimeFrame = '1m' | '3m' | '6m' | 'ytd' | '1y' | '3y' | '5y' | 'all';

export type AssetClass =
  | 'sports_cards'
  | 'stocks'
  | 'crypto'
  | 'real_estate'
  | 'commodities'
  | 'bonds';

export type RiskProfile = 'conservative' | 'moderate' | 'aggressive' | 'speculative';

export interface BenchmarkData {
  index: BenchmarkIndex;
  label: string;
  currentValue: number;
  returns: {
    '1m': number;
    '3m': number;
    '6m': number;
    'ytd': number;
    '1y': number;
    '3y': number;
    '5y': number;
  };
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  correlation: number;
  color: string;
}

export interface PortfolioPerformance {
  totalValue: number;
  totalCostBasis: number;
  totalReturn: number;
  totalReturnPercent: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  sortino: number;
  maxDrawdown: number;
  maxDrawdownDate: string;
  bestMonth: { month: string; return_: number };
  worstMonth: { month: string; return_: number };
  winRate: number;
  avgWin: number;
  avgLoss: number;
  beta: number;
  alpha: number;
  rSquared: number;
  informationRatio: number;
}

export interface PerformanceTimeSeries {
  date: string;
  portfolioValue: number;
  portfolioReturn: number;
  sp500Return: number;
  cardMarketReturn: number;
  bitcoinReturn: number;
}

export interface AssetAllocation {
  category: string;
  value: number;
  percentage: number;
  return_: number;
  color: string;
}

export interface RiskMetrics {
  profile: RiskProfile;
  valueAtRisk95: number;
  valueAtRisk99: number;
  expectedShortfall: number;
  concentrationRisk: number;
  liquidityRisk: number;
  diversificationScore: number;
  stressTest: { scenario: string; impact: number; description: string }[];
}

export interface PeerComparison {
  percentile: number;
  totalUsers: number;
  avgReturn: number;
  medianReturn: number;
  topDecileReturn: number;
  bottomDecileReturn: number;
  yourReturn: number;
  rankByReturn: number;
  rankByRiskAdjusted: number;
  categoryRanks: { category: string; rank: number; total: number }[];
}

export interface DrawdownPeriod {
  startDate: string;
  endDate: string;
  peak: number;
  trough: number;
  drawdown: number;
  recoveryDate: string | null;
  duration: string;
}

export interface MonthlyReturn {
  year: number;
  month: number;
  monthLabel: string;
  return_: number;
  value: number;
}

// ---- Constants ----

const STORAGE_PREFIX = 'msi_benchmark';

const INDEX_LABELS: Record<BenchmarkIndex, string> = {
  sp500: 'S&P 500',
  nasdaq: 'NASDAQ Composite',
  bitcoin: 'Bitcoin',
  gold: 'Gold',
  real_estate: 'Real Estate (REIT)',
  psa_500: 'PSA 500 Index',
  card_market: 'Card Market Index',
  vintage_index: 'Vintage Card Index',
  modern_index: 'Modern Card Index',
  rookie_index: 'Rookie Card Index',
};

const INDEX_COLORS: Record<BenchmarkIndex, string> = {
  sp500: '#3b82f6',
  nasdaq: '#8b5cf6',
  bitcoin: '#f59e0b',
  gold: '#eab308',
  real_estate: '#10b981',
  psa_500: '#ef4444',
  card_market: '#06b6d4',
  vintage_index: '#d97706',
  modern_index: '#ec4899',
  rookie_index: '#14b8a6',
};

const RISK_COLORS: Record<RiskProfile, string> = {
  conservative: '#10b981',
  moderate: '#3b82f6',
  aggressive: '#f59e0b',
  speculative: '#ef4444',
};

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// ---- localStorage helpers ----

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}_${key}`);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    // ignore
  }
  return fallback;
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}_${key}`, JSON.stringify(data));
  } catch {
    // ignore
  }
}

// ---- Mock Data ----

const BENCHMARK_DATA: BenchmarkData[] = [
  {
    index: 'sp500',
    label: INDEX_LABELS.sp500,
    currentValue: 5248.32,
    returns: { '1m': 1.8, '3m': 4.2, '6m': 8.7, ytd: 6.3, '1y': 12.4, '3y': 34.2, '5y': 82.5 },
    volatility: 14.8,
    sharpeRatio: 0.84,
    maxDrawdown: -23.4,
    correlation: 0.32,
    color: INDEX_COLORS.sp500,
  },
  {
    index: 'nasdaq',
    label: INDEX_LABELS.nasdaq,
    currentValue: 16742.89,
    returns: { '1m': 2.3, '3m': 5.8, '6m': 12.1, ytd: 8.9, '1y': 18.6, '3y': 28.7, '5y': 112.4 },
    volatility: 19.2,
    sharpeRatio: 0.97,
    maxDrawdown: -33.1,
    correlation: 0.28,
    color: INDEX_COLORS.nasdaq,
  },
  {
    index: 'bitcoin',
    label: INDEX_LABELS.bitcoin,
    currentValue: 67432.18,
    returns: { '1m': -3.2, '3m': 8.4, '6m': 42.3, ytd: 28.7, '1y': 124.6, '3y': 89.3, '5y': 412.8 },
    volatility: 62.4,
    sharpeRatio: 0.72,
    maxDrawdown: -77.2,
    correlation: 0.15,
    color: INDEX_COLORS.bitcoin,
  },
  {
    index: 'gold',
    label: INDEX_LABELS.gold,
    currentValue: 2187.45,
    returns: { '1m': 0.4, '3m': 1.8, '6m': 5.2, ytd: 3.1, '1y': 8.7, '3y': 22.4, '5y': 48.3 },
    volatility: 12.6,
    sharpeRatio: 0.52,
    maxDrawdown: -18.7,
    correlation: 0.08,
    color: INDEX_COLORS.gold,
  },
  {
    index: 'real_estate',
    label: INDEX_LABELS.real_estate,
    currentValue: 342.67,
    returns: { '1m': 0.9, '3m': 2.1, '6m': 4.8, ytd: 2.7, '1y': 6.3, '3y': 14.8, '5y': 32.1 },
    volatility: 18.4,
    sharpeRatio: 0.41,
    maxDrawdown: -28.3,
    correlation: 0.22,
    color: INDEX_COLORS.real_estate,
  },
  {
    index: 'psa_500',
    label: INDEX_LABELS.psa_500,
    currentValue: 4821.36,
    returns: { '1m': 1.2, '3m': 3.4, '6m': 7.8, ytd: 5.6, '1y': 14.2, '3y': 42.8, '5y': 128.7 },
    volatility: 22.1,
    sharpeRatio: 0.65,
    maxDrawdown: -35.4,
    correlation: 0.88,
    color: INDEX_COLORS.psa_500,
  },
  {
    index: 'card_market',
    label: INDEX_LABELS.card_market,
    currentValue: 1847.92,
    returns: { '1m': 1.6, '3m': 4.8, '6m': 9.3, ytd: 7.2, '1y': 16.8, '3y': 52.4, '5y': 156.3 },
    volatility: 24.6,
    sharpeRatio: 0.71,
    maxDrawdown: -38.2,
    correlation: 0.92,
    color: INDEX_COLORS.card_market,
  },
  {
    index: 'vintage_index',
    label: INDEX_LABELS.vintage_index,
    currentValue: 3214.58,
    returns: { '1m': 0.8, '3m': 2.6, '6m': 5.4, ytd: 4.1, '1y': 11.2, '3y': 38.6, '5y': 94.2 },
    volatility: 16.8,
    sharpeRatio: 0.62,
    maxDrawdown: -22.8,
    correlation: 0.78,
    color: INDEX_COLORS.vintage_index,
  },
  {
    index: 'modern_index',
    label: INDEX_LABELS.modern_index,
    currentValue: 2156.43,
    returns: { '1m': 2.4, '3m': 6.2, '6m': 13.7, ytd: 9.8, '1y': 22.4, '3y': 48.2, '5y': 184.6 },
    volatility: 32.4,
    sharpeRatio: 0.76,
    maxDrawdown: -46.8,
    correlation: 0.85,
    color: INDEX_COLORS.modern_index,
  },
  {
    index: 'rookie_index',
    label: INDEX_LABELS.rookie_index,
    currentValue: 1423.87,
    returns: { '1m': 3.1, '3m': 8.4, '6m': 18.2, ytd: 12.6, '1y': 28.7, '3y': 62.4, '5y': 248.3 },
    volatility: 42.8,
    sharpeRatio: 0.68,
    maxDrawdown: -58.4,
    correlation: 0.82,
    color: INDEX_COLORS.rookie_index,
  },
];

function buildPortfolioPerformance(): PortfolioPerformance {
  return {
    totalValue: 142680,
    totalCostBasis: 98450,
    totalReturn: 44230,
    totalReturnPercent: 44.93,
    annualizedReturn: 18.72,
    volatility: 21.4,
    sharpeRatio: 1.12,
    sortino: 1.48,
    maxDrawdown: -24.6,
    maxDrawdownDate: '2024-06-15',
    bestMonth: { month: '2024-11', return_: 12.4 },
    worstMonth: { month: '2024-03', return_: -8.7 },
    winRate: 62.5,
    avgWin: 6.8,
    avgLoss: -4.2,
    beta: 0.87,
    alpha: 4.32,
    rSquared: 0.68,
    informationRatio: 0.92,
  };
}

function buildPerformanceTimeSeries(): PerformanceTimeSeries[] {
  const series: PerformanceTimeSeries[] = [];
  const startDate = new Date('2025-03-15');
  let pReturn = 0;
  let spReturn = 0;
  let cmReturn = 0;
  let btcReturn = 0;
  const baseValue = 100000;

  // Seed a deterministic-ish random walk
  const portfolioWeekly = [
    0.8, -0.3, 1.2, 0.5, -1.1, 0.9, 1.4, -0.6, 0.3, 1.8,
    -2.1, 0.7, 1.1, -0.4, 0.6, 2.3, -1.4, 0.8, -0.2, 1.6,
    0.4, -0.9, 1.3, 0.7, -0.5, 1.9, -1.2, 0.3, 1.5, -0.8,
    0.6, 1.1, -0.3, 2.1, -1.6, 0.9, 0.4, -0.7, 1.8, 0.2,
    -1.3, 0.5, 1.7, -0.1, 0.8, -0.6, 1.4, 0.3, -0.9, 2.2,
    -0.4, 1.0,
  ];
  const sp500Weekly = [
    0.5, -0.2, 0.8, 0.3, -0.7, 0.6, 0.9, -0.4, 0.2, 1.2,
    -1.4, 0.4, 0.7, -0.3, 0.4, 1.5, -0.9, 0.5, -0.1, 1.1,
    0.3, -0.6, 0.9, 0.4, -0.3, 1.3, -0.8, 0.2, 1.0, -0.5,
    0.4, 0.7, -0.2, 1.4, -1.1, 0.6, 0.3, -0.5, 1.2, 0.1,
    -0.9, 0.3, 1.1, -0.1, 0.5, -0.4, 0.9, 0.2, -0.6, 1.5,
    -0.3, 0.7,
  ];
  const cardMarketWeekly = [
    1.0, -0.5, 1.5, 0.7, -1.3, 1.1, 1.8, -0.8, 0.4, 2.2,
    -2.6, 0.9, 1.3, -0.5, 0.7, 2.8, -1.7, 1.0, -0.3, 1.9,
    0.5, -1.1, 1.6, 0.8, -0.6, 2.3, -1.5, 0.4, 1.8, -1.0,
    0.7, 1.4, -0.4, 2.5, -1.9, 1.1, 0.5, -0.9, 2.1, 0.3,
    -1.6, 0.6, 2.0, -0.2, 0.9, -0.7, 1.7, 0.4, -1.1, 2.7,
    -0.5, 1.2,
  ];
  const btcWeekly = [
    2.1, -1.4, 3.2, 1.1, -2.8, 1.9, 3.6, -1.7, 0.8, 4.2,
    -5.3, 1.8, 2.7, -1.2, 1.4, 5.4, -3.5, 2.1, -0.6, 3.8,
    1.0, -2.3, 3.3, 1.6, -1.3, 4.6, -3.1, 0.9, 3.6, -2.1,
    1.4, 2.8, -0.8, 5.1, -3.9, 2.2, 1.1, -1.8, 4.3, 0.6,
    -3.2, 1.2, 4.1, -0.4, 1.8, -1.5, 3.4, 0.8, -2.2, 5.5,
    -1.1, 2.4,
  ];

  for (let i = 0; i < 52; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() - (51 - i) * 7);
    const dateStr = date.toISOString().split('T')[0];

    pReturn += portfolioWeekly[i];
    spReturn += sp500Weekly[i];
    cmReturn += cardMarketWeekly[i];
    btcReturn += btcWeekly[i];

    series.push({
      date: dateStr,
      portfolioValue: Math.round(baseValue * (1 + pReturn / 100)),
      portfolioReturn: Math.round(pReturn * 100) / 100,
      sp500Return: Math.round(spReturn * 100) / 100,
      cardMarketReturn: Math.round(cmReturn * 100) / 100,
      bitcoinReturn: Math.round(btcReturn * 100) / 100,
    });
  }

  return series;
}

function buildMonthlyReturns(): MonthlyReturn[] {
  const returns: MonthlyReturn[] = [];
  const monthlyValues = [
    // 2024 Jan-Dec
    [2024, 1, 3.2], [2024, 2, -1.4], [2024, 3, -8.7], [2024, 4, 5.1],
    [2024, 5, 2.8], [2024, 6, -3.6], [2024, 7, 6.4], [2024, 8, -2.1],
    [2024, 9, 4.7], [2024, 10, 1.9], [2024, 11, 12.4], [2024, 12, -1.8],
    // 2025 Jan-Dec
    [2025, 1, 4.6], [2025, 2, -2.3], [2025, 3, 3.8], [2025, 4, 7.2],
    [2025, 5, -1.9], [2025, 6, 5.4], [2025, 7, -0.8], [2025, 8, 3.1],
    [2025, 9, 6.7], [2025, 10, -4.2], [2025, 11, 8.3], [2025, 12, 2.1],
  ];

  let value = 100000;
  for (const [year, month, ret] of monthlyValues) {
    value = Math.round(value * (1 + (ret as number) / 100));
    returns.push({
      year: year as number,
      month: month as number,
      monthLabel: MONTH_LABELS[(month as number) - 1],
      return_: ret as number,
      value,
    });
  }

  return returns;
}

function buildAssetAllocation(): AssetAllocation[] {
  return [
    { category: 'Modern Rookies', value: 48420, percentage: 33.9, return_: 28.4, color: '#ec4899' },
    { category: 'Vintage Cards', value: 32180, percentage: 22.5, return_: 12.8, color: '#d97706' },
    { category: 'Graded PSA 10s', value: 24860, percentage: 17.4, return_: 18.6, color: '#ef4444' },
    { category: 'Autographs', value: 18540, percentage: 13.0, return_: 22.1, color: '#8b5cf6' },
    { category: 'Sealed Wax', value: 12420, percentage: 8.7, return_: 34.2, color: '#06b6d4' },
    { category: 'Non-Sport/TCG', value: 6260, percentage: 4.4, return_: 8.4, color: '#10b981' },
  ];
}

function buildRiskMetrics(): RiskMetrics {
  return {
    profile: 'aggressive',
    valueAtRisk95: -8420,
    valueAtRisk99: -14280,
    expectedShortfall: -18640,
    concentrationRisk: 0.34,
    liquidityRisk: 0.42,
    diversificationScore: 72,
    stressTest: [
      {
        scenario: 'Market Crash (-30%)',
        impact: -42840,
        description: 'Broad market selloff similar to 2020. Card market historically declines 25-35% in equity crashes.',
      },
      {
        scenario: 'Interest Rate Spike (+200bps)',
        impact: -18420,
        description: 'Higher rates reduce speculative asset demand. Collectibles typically see 10-15% compression.',
      },
      {
        scenario: 'Recession (GDP -3%)',
        impact: -28560,
        description: 'Consumer discretionary spending drops. Premium cards hold better than mid-tier.',
      },
      {
        scenario: 'Sports Lockout/Strike',
        impact: -21380,
        description: 'Extended work stoppage reduces fan engagement and card demand for affected sport.',
      },
      {
        scenario: 'Grading Company Scandal',
        impact: -35640,
        description: 'Loss of confidence in grading integrity. PSA 10 premiums compressed by 40-60%.',
      },
    ],
  };
}

function buildPeerComparison(): PeerComparison {
  return {
    percentile: 78,
    totalUsers: 12480,
    avgReturn: 14.2,
    medianReturn: 11.8,
    topDecileReturn: 38.4,
    bottomDecileReturn: -12.6,
    yourReturn: 18.72,
    rankByReturn: 2746,
    rankByRiskAdjusted: 1872,
    categoryRanks: [
      { category: 'Modern Rookies', rank: 342, total: 8420 },
      { category: 'Vintage Cards', rank: 1240, total: 4680 },
      { category: 'Graded Cards', rank: 890, total: 6240 },
      { category: 'Autographs', rank: 567, total: 3210 },
      { category: 'Sealed Product', rank: 128, total: 2840 },
    ],
  };
}

function buildDrawdownPeriods(): DrawdownPeriod[] {
  return [
    {
      startDate: '2024-03-01',
      endDate: '2024-04-12',
      peak: 118400,
      trough: 89240,
      drawdown: -24.6,
      recoveryDate: '2024-07-18',
      duration: '42 days',
    },
    {
      startDate: '2024-08-05',
      endDate: '2024-08-22',
      peak: 132600,
      trough: 114820,
      drawdown: -13.4,
      recoveryDate: '2024-10-03',
      duration: '17 days',
    },
    {
      startDate: '2025-02-10',
      endDate: '2025-02-28',
      peak: 148200,
      trough: 134680,
      drawdown: -9.1,
      recoveryDate: '2025-03-14',
      duration: '18 days',
    },
    {
      startDate: '2025-05-01',
      endDate: '2025-05-18',
      peak: 156800,
      trough: 146420,
      drawdown: -6.6,
      recoveryDate: '2025-06-02',
      duration: '17 days',
    },
    {
      startDate: '2025-10-08',
      endDate: '2025-10-24',
      peak: 168400,
      trough: 152680,
      drawdown: -9.3,
      recoveryDate: null,
      duration: '16 days',
    },
  ];
}

function buildCorrelationMatrix(): { asset1: string; asset2: string; correlation: number }[] {
  const assets = [
    'Portfolio',
    'S&P 500',
    'NASDAQ',
    'Bitcoin',
    'Gold',
    'Real Estate',
    'Card Market',
    'Vintage Index',
    'Modern Index',
    'Rookie Index',
  ];

  // Upper triangle correlation values (row by row, excluding diagonal)
  const correlations: number[][] = [
    //          SP   NAS  BTC  GOLD RE   CM   VI   MI   RI
    /* Port */ [0.32, 0.28, 0.15, 0.08, 0.22, 0.92, 0.78, 0.85, 0.82],
    /* SP   */ [      0.92, 0.42, 0.12, 0.58, 0.28, 0.18, 0.32, 0.24],
    /* NAS  */ [            0.48, 0.08, 0.52, 0.24, 0.14, 0.36, 0.28],
    /* BTC  */ [                  -0.06, 0.18, 0.12, 0.04, 0.16, 0.14],
    /* GOLD */ [                        0.14, 0.06, 0.12, 0.02, -0.04],
    /* RE   */ [                              0.18, 0.22, 0.14, 0.08],
    /* CM   */ [                                    0.82, 0.88, 0.86],
    /* VI   */ [                                          0.64, 0.58],
    /* MI   */ [                                                0.78],
  ];

  const matrix: { asset1: string; asset2: string; correlation: number }[] = [];

  for (let i = 0; i < assets.length; i++) {
    for (let j = 0; j < assets.length; j++) {
      let corr: number;
      if (i === j) {
        corr = 1.0;
      } else if (i < j) {
        corr = correlations[i][j - i - 1];
      } else {
        // Symmetric: corr(i,j) === corr(j,i)
        corr = correlations[j][i - j - 1];
      }
      matrix.push({ asset1: assets[i], asset2: assets[j], correlation: corr });
    }
  }

  return matrix;
}

// ---- Exported Functions ----

export function getBenchmarks(): BenchmarkData[] {
  const cached = loadFromStorage<BenchmarkData[] | null>('benchmarks', null);
  if (cached && cached.length === BENCHMARK_DATA.length) return cached;
  saveToStorage('benchmarks', BENCHMARK_DATA);
  return BENCHMARK_DATA;
}

export function getPortfolioPerformance(): PortfolioPerformance {
  const cached = loadFromStorage<PortfolioPerformance | null>('performance', null);
  if (cached) return cached;
  const perf = buildPortfolioPerformance();
  saveToStorage('performance', perf);
  return perf;
}

export function getPerformanceTimeSeries(timeframe?: TimeFrame): PerformanceTimeSeries[] {
  const allData = loadFromStorage<PerformanceTimeSeries[] | null>('timeseries', null)
    ?? buildPerformanceTimeSeries();
  saveToStorage('timeseries', allData);

  if (!timeframe || timeframe === 'all') return allData;

  const weeksMap: Record<string, number> = {
    '1m': 4,
    '3m': 13,
    '6m': 26,
    ytd: 11,
    '1y': 52,
    '3y': 52,
    '5y': 52,
  };
  const weeks = weeksMap[timeframe] ?? allData.length;
  return allData.slice(Math.max(0, allData.length - weeks));
}

export function getAssetAllocation(): AssetAllocation[] {
  const cached = loadFromStorage<AssetAllocation[] | null>('allocation', null);
  if (cached && cached.length > 0) return cached;
  const alloc = buildAssetAllocation();
  saveToStorage('allocation', alloc);
  return alloc;
}

export function getRiskMetrics(): RiskMetrics {
  const cached = loadFromStorage<RiskMetrics | null>('risk', null);
  if (cached) return cached;
  const risk = buildRiskMetrics();
  saveToStorage('risk', risk);
  return risk;
}

export function getPeerComparison(): PeerComparison {
  const cached = loadFromStorage<PeerComparison | null>('peers', null);
  if (cached) return cached;
  const peers = buildPeerComparison();
  saveToStorage('peers', peers);
  return peers;
}

export function getDrawdownPeriods(): DrawdownPeriod[] {
  const cached = loadFromStorage<DrawdownPeriod[] | null>('drawdowns', null);
  if (cached && cached.length > 0) return cached;
  const drawdowns = buildDrawdownPeriods();
  saveToStorage('drawdowns', drawdowns);
  return drawdowns;
}

export function getMonthlyReturns(): MonthlyReturn[] {
  const cached = loadFromStorage<MonthlyReturn[] | null>('monthly', null);
  if (cached && cached.length > 0) return cached;
  const monthly = buildMonthlyReturns();
  saveToStorage('monthly', monthly);
  return monthly;
}

export function getCorrelationMatrix(): { asset1: string; asset2: string; correlation: number }[] {
  const cached = loadFromStorage<{ asset1: string; asset2: string; correlation: number }[] | null>('correlation', null);
  if (cached && cached.length > 0) return cached;
  const matrix = buildCorrelationMatrix();
  saveToStorage('correlation', matrix);
  return matrix;
}

export function getIndexLabel(index: BenchmarkIndex): string {
  return INDEX_LABELS[index] ?? index;
}

export function getIndexColor(index: BenchmarkIndex): string {
  return INDEX_COLORS[index] ?? '#94a3b8';
}

export function getRiskColor(profile: RiskProfile): string {
  return RISK_COLORS[profile] ?? '#94a3b8';
}

export function formatCurrency(n: number): string {
  const abs = Math.abs(n);
  const formatted = abs >= 1_000_000
    ? `${(abs / 1_000_000).toFixed(2)}M`
    : abs >= 1_000
      ? `${(abs / 1_000).toFixed(1)}K`
      : abs.toFixed(2);
  return `${n < 0 ? '-' : ''}$${formatted}`;
}

export function formatPercent(n: number): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
}

export function formatDate(d: string): string {
  const date = new Date(d + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
