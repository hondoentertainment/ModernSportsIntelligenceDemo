// @ts-nocheck
import { store } from '../dal/syncStore';

// ── Quantitative Analysis Workbench Service ─────────────────────────────────
// Bloomberg BQuant equivalent for sports card analytics

// ── Interfaces ──────────────────────────────────────────────────────────────────

export interface StrategyResult {
  id: string;
  strategyId: string;
  timestamp: string;
  executionTime: number; // ms
  output: any;
  resultType: 'table' | 'chart' | 'number' | 'list' | 'error';
  rowCount: number;
  summary: string;
}

export interface QuantStrategy {
  id: string;
  name: string;
  description: string;
  code: string;
  type: 'screener' | 'backtest' | 'analysis' | 'alert';
  createdAt: string;
  lastRun: string | null;
  lastResult: StrategyResult | null;
  isTemplate: boolean;
  author: string;
}

export interface BacktestTrade {
  date: string;
  action: 'buy' | 'sell';
  player: string;
  card: string;
  price: number;
  quantity: number;
  pnl: number;
}

export interface BacktestResult {
  strategyId: string;
  period: string;
  startDate: string;
  endDate: string;
  totalReturn: number;
  annualizedReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  trades: BacktestTrade[];
  equityCurve: { date: string; value: number }[];
}

export interface ScreenerFilter {
  field: string;
  operator: '>' | '<' | '=' | 'between' | 'contains' | 'in';
  value: any;
  label: string;
}

export interface ScreenerResult {
  filters: ScreenerFilter[];
  matches: {
    player: string;
    card: string;
    sport: string;
    grade: string;
    price: number;
    change: number;
    matchedOn: string;
  }[];
  totalMatches: number;
}

// ── Constants ───────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'msi_quant_strategies';

// ── Seeded Random ───────────────────────────────────────────────────────────────

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// ── Mock Data Pools ─────────────────────────────────────────────────────────────

const PLAYERS = [
  'Mike Trout', 'Shohei Ohtani', 'Ronald Acuña Jr.', 'Juan Soto',
  'Julio Rodríguez', 'Gunnar Henderson', 'Corbin Carroll', 'Jasson Domínguez',
  'LeBron James', 'Luka Dončić', 'Victor Wembanyama', 'Jayson Tatum',
  'Patrick Mahomes', 'Josh Allen', 'CJ Stroud', 'Caleb Williams',
  'Connor McDavid', 'Wayne Gretzky', 'Mickey Mantle', 'Ken Griffey Jr.',
  'Derek Jeter', 'Hank Aaron', 'Willie Mays', 'Roberto Clemente',
];

const CARDS = [
  '2023 Topps Chrome RC', '2022 Bowman 1st', '2023 Panini Prizm Silver',
  '2021 Topps Update RC', '2023 Topps Heritage', '1986 Fleer #57',
  '1952 Topps #311', '2018 Topps Update RC', '2020 Bowman Chrome 1st',
  '2023 Select Concourse', '2019 Topps Chrome RC', '2022 Panini Mosaic',
  '1969 Topps #260', '1955 Topps #164', '1993 SP Foil #279',
];

const SPORTS = ['Baseball', 'Basketball', 'Football', 'Hockey'];
const GRADES = ['PSA 10', 'PSA 9', 'BGS 9.5', 'BGS 10', 'SGC 10', 'Raw', 'PSA 8', 'PSA 7'];

// ── Template Strategies ─────────────────────────────────────────────────────────

const TEMPLATES: QuantStrategy[] = [
  {
    id: 'tmpl-psa10-value',
    name: 'PSA 10 Rookie Value Screen',
    description: 'Find undervalued PSA 10 rookies under $200 with strong recent volume and positive sentiment signals.',
    code: `// PSA 10 Rookie Value Screen
// Finds undervalued PSA 10 rookies under $200

const filters = {
  grade: "PSA 10",
  cardType: "Rookie",
  maxPrice: 200,
  minVolume: 10,        // min 10 sales in 30 days
  maxPSARatio: 0.75,    // price < 75% of PSA avg
};

function screen(cards) {
  return cards
    .filter(c => c.grade === filters.grade)
    .filter(c => c.isRookie === true)
    .filter(c => c.price <= filters.maxPrice)
    .filter(c => c.volume30d >= filters.minVolume)
    .filter(c => c.price / c.psaAvg <= filters.maxPSARatio)
    .sort((a, b) => a.price / a.psaAvg - b.price / b.psaAvg);
}

return screen(universe);`,
    type: 'screener',
    createdAt: '2025-11-15T10:00:00Z',
    lastRun: null,
    lastResult: null,
    isTemplate: true,
    author: 'MSI Research',
  },
  {
    id: 'tmpl-momentum-surge',
    name: 'Momentum Surge Detector',
    description: 'Cards with >20% price increase in 7 days — captures breakout momentum before the crowd.',
    code: `// Momentum Surge Detector
// Cards with >20% price increase in 7 days

const SURGE_THRESHOLD = 0.20;  // 20%
const LOOKBACK_DAYS = 7;

function detectSurges(cards) {
  return cards
    .filter(c => c.change7d > SURGE_THRESHOLD)
    .filter(c => c.volume7d > c.avgVolume * 1.5)
    .map(c => ({
      ...c,
      surgeScore: c.change7d * (c.volume7d / c.avgVolume),
      signal: c.change7d > 0.40 ? "STRONG BUY" : "BUY"
    }))
    .sort((a, b) => b.surgeScore - a.surgeScore);
}

return detectSurges(universe);`,
    type: 'analysis',
    createdAt: '2025-11-20T14:30:00Z',
    lastRun: null,
    lastResult: null,
    isTemplate: true,
    author: 'MSI Research',
  },
  {
    id: 'tmpl-arbitrage',
    name: 'Arbitrage Scanner',
    description: 'Price discrepancies across platforms >15% — exploit market inefficiencies in real time.',
    code: `// Arbitrage Scanner
// Finds price discrepancies across platforms >15%

const MIN_SPREAD = 0.15;  // 15% minimum spread
const PLATFORMS = ["eBay", "COMC", "MySlabs", "StarStock"];

function findArbitrage(cards) {
  return cards
    .filter(c => c.platforms && c.platforms.length >= 2)
    .map(c => {
      const prices = c.platforms.map(p => p.price);
      const low = Math.min(...prices);
      const high = Math.max(...prices);
      const spread = (high - low) / low;
      return { ...c, spread, buyAt: low, sellAt: high };
    })
    .filter(c => c.spread >= MIN_SPREAD)
    .sort((a, b) => b.spread - a.spread);
}

return findArbitrage(universe);`,
    type: 'analysis',
    createdAt: '2025-12-01T09:15:00Z',
    lastRun: null,
    lastResult: null,
    isTemplate: true,
    author: 'MSI Research',
  },
  {
    id: 'tmpl-vintage-accum',
    name: 'Vintage Accumulator',
    description: 'Pre-1970 cards with low pop counts and declining supply — scarcity-driven value plays.',
    code: `// Vintage Accumulator
// Pre-1970 cards with low pop counts and declining supply

const MAX_YEAR = 1970;
const MAX_POP = 50;
const MIN_PRICE = 100;

function findVintageGems(cards) {
  return cards
    .filter(c => c.year < MAX_YEAR)
    .filter(c => c.popCount <= MAX_POP)
    .filter(c => c.price >= MIN_PRICE)
    .filter(c => c.supplyTrend === "declining")
    .map(c => ({
      ...c,
      scarcityScore: (1 / c.popCount) * c.price,
      supplyPressure: c.recentListings < c.avgListings * 0.7
        ? "HIGH" : "MODERATE"
    }))
    .sort((a, b) => b.scarcityScore - a.scarcityScore);
}

return findVintageGems(universe);`,
    type: 'screener',
    createdAt: '2025-12-05T16:00:00Z',
    lastRun: null,
    lastResult: null,
    isTemplate: true,
    author: 'MSI Research',
  },
  {
    id: 'tmpl-prospect-pipeline',
    name: 'Prospect Pipeline',
    description: 'Minor league players with rising metrics — early entry before call-up price spikes.',
    code: `// Prospect Pipeline
// Minor league players with rising metrics

const METRICS = ["batting_avg", "era", "strikeouts"];

function findProspects(cards) {
  return cards
    .filter(c => c.level === "minor_league")
    .filter(c => c.prospectRank <= 100)
    .filter(c => c.metricsTrend === "rising")
    .map(c => ({
      ...c,
      callUpProb: estimateCallUp(c),
      priceUpside: c.mlbComparablePrice / c.price,
      signal: c.prospectRank <= 20 ? "TOP PROSPECT" : "WATCH"
    }))
    .sort((a, b) => a.prospectRank - b.prospectRank);
}

function estimateCallUp(player) {
  if (player.age <= 21 && player.level === "AA") return 0.65;
  if (player.age <= 23 && player.level === "AAA") return 0.80;
  return 0.40;
}

return findProspects(universe);`,
    type: 'screener',
    createdAt: '2025-12-10T11:45:00Z',
    lastRun: null,
    lastResult: null,
    isTemplate: true,
    author: 'MSI Research',
  },
  {
    id: 'tmpl-contrarian',
    name: 'Contrarian Play',
    description: 'Cards with >30% decline but strong fundamentals — buy the dip with conviction.',
    code: `// Contrarian Play
// Cards with >30% decline but strong fundamentals

const DECLINE_THRESHOLD = -0.30;  // -30%

function findContrarianPlays(cards) {
  return cards
    .filter(c => c.change90d <= DECLINE_THRESHOLD)
    .filter(c => c.fundamentalScore >= 70)
    .filter(c => c.volume30d > 5)  // still liquid
    .map(c => ({
      ...c,
      recoveryScore: Math.abs(c.change90d) * c.fundamentalScore,
      buySignal: c.rsi14 < 30 ? "OVERSOLD" : "DECLINING",
      expectedRecovery: c.historicalAvg / c.price - 1
    }))
    .sort((a, b) => b.recoveryScore - a.recoveryScore);
}

return findContrarianPlays(universe);`,
    type: 'analysis',
    createdAt: '2025-12-15T08:30:00Z',
    lastRun: null,
    lastResult: null,
    isTemplate: true,
    author: 'MSI Research',
  },
  {
    id: 'tmpl-seasonal-backtest',
    name: 'Seasonal Rotation Backtest',
    description: 'Backtest seasonal sport rotation — buy baseball in Jan, football in Aug, basketball in Oct.',
    code: `// Seasonal Rotation Backtest
// Rotate into sports based on seasonal patterns

const ROTATION = {
  1: "Baseball",   // Spring Training hype
  2: "Baseball",
  3: "Baseball",
  4: "Basketball",  // Playoffs
  5: "Basketball",
  6: "Baseball",    // All-Star break
  7: "Baseball",
  8: "Football",    // Preseason
  9: "Football",
  10: "Basketball", // Season start
  11: "Football",   // Playoff push
  12: "Hockey",     // Winter Classic
};

function backtest(startDate, endDate) {
  let portfolio = 10000;
  const trades = [];
  let currentSport = null;

  for (let d = startDate; d <= endDate; d.setMonth(d.getMonth() + 1)) {
    const targetSport = ROTATION[d.getMonth() + 1];
    if (targetSport !== currentSport) {
      trades.push({ date: d, action: "rotate", to: targetSport });
      currentSport = targetSport;
    }
  }
  return { trades, finalValue: portfolio };
}

return backtest(new Date("2024-01-01"), new Date("2025-12-31"));`,
    type: 'backtest',
    createdAt: '2025-12-20T13:00:00Z',
    lastRun: null,
    lastResult: null,
    isTemplate: true,
    author: 'MSI Research',
  },
  {
    id: 'tmpl-grade-arb',
    name: 'Grade Arbitrage Alert',
    description: 'Alert when PSA 9 to PSA 10 price gap narrows below historical average — regrade opportunity.',
    code: `// Grade Arbitrage Alert
// Alert when PSA 9→10 gap narrows below average

const MAX_GAP_RATIO = 2.0;  // PSA 10 normally 2-3x PSA 9
const REGRADE_COST = 30;     // $30 PSA regrade fee

function findRegradeOpps(cards) {
  return cards
    .filter(c => c.grade === "PSA 9")
    .filter(c => c.psa10Price && c.psa9Price)
    .map(c => {
      const gap = c.psa10Price / c.psa9Price;
      const regradeProfit = c.psa10Price - c.psa9Price - REGRADE_COST;
      const regradeROI = regradeProfit / (c.psa9Price + REGRADE_COST);
      return {
        ...c,
        gapRatio: gap,
        regradeProfit,
        regradeROI,
        signal: regradeROI > 0.5 ? "STRONG" : "MODERATE"
      };
    })
    .filter(c => c.gapRatio <= MAX_GAP_RATIO && c.regradeProfit > 0)
    .sort((a, b) => b.regradeROI - a.regradeROI);
}

return findRegradeOpps(universe);`,
    type: 'alert',
    createdAt: '2026-01-05T10:00:00Z',
    lastRun: null,
    lastResult: null,
    isTemplate: true,
    author: 'MSI Research',
  },
];

// ── Screener Field Options ──────────────────────────────────────────────────────

export const SCREENER_FIELDS = [
  { value: 'price', label: 'Price ($)' },
  { value: 'grade', label: 'Grade' },
  { value: 'sport', label: 'Sport' },
  { value: 'change7d', label: '7D Change (%)' },
  { value: 'change30d', label: '30D Change (%)' },
  { value: 'volume', label: 'Sales Volume' },
  { value: 'year', label: 'Card Year' },
  { value: 'popCount', label: 'Pop Count' },
  { value: 'player', label: 'Player Name' },
];

export const SCREENER_OPERATORS: { value: ScreenerFilter['operator']; label: string }[] = [
  { value: '>', label: 'Greater than' },
  { value: '<', label: 'Less than' },
  { value: '=', label: 'Equals' },
  { value: 'between', label: 'Between' },
  { value: 'contains', label: 'Contains' },
  { value: 'in', label: 'In list' },
];

// ── Service Functions ───────────────────────────────────────────────────────────

export function runStrategy(code: string): StrategyResult {
  const _startTime = Date.now();
  const rand = seededRandom(hashStr(code));

  // Simulate execution delay
  const execTime = Math.floor(rand() * 800 + 200);

  // Determine result type based on code content
  let resultType: StrategyResult['resultType'] = 'table';
  if (code.includes('backtest') || code.includes('equityCurve')) resultType = 'chart';
  else if (code.includes('count') || code.includes('total')) resultType = 'number';
  else if (code.includes('alert') || code.includes('signal')) resultType = 'list';

  const rowCount = Math.floor(rand() * 40 + 5);

  // Generate mock output based on result type
  let output: any;
  let summary: string;

  if (resultType === 'table') {
    output = Array.from({ length: rowCount }, (_, i) => {
      const playerIdx = Math.floor(rand() * PLAYERS.length);
      const cardIdx = Math.floor(rand() * CARDS.length);
      const price = Math.floor(rand() * 500 + 20);
      const change = (rand() - 0.4) * 60;
      return {
        rank: i + 1,
        player: PLAYERS[playerIdx],
        card: CARDS[cardIdx],
        sport: SPORTS[Math.floor(rand() * SPORTS.length)],
        grade: GRADES[Math.floor(rand() * GRADES.length)],
        price,
        change: Math.round(change * 10) / 10,
        score: Math.round(rand() * 100),
      };
    });
    summary = `Found ${rowCount} matching cards. Top pick: ${output[0]?.player} at $${output[0]?.price}`;
  } else if (resultType === 'chart') {
    const months = Math.floor(rand() * 12 + 12);
    let val = 10000;
    output = Array.from({ length: months }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - months + i);
      val *= 1 + (rand() - 0.45) * 0.08;
      return { date: d.toISOString().slice(0, 7), value: Math.round(val) };
    });
    const totalRet = ((output[output.length - 1].value - 10000) / 10000 * 100).toFixed(1);
    summary = `Backtest complete: ${totalRet}% total return over ${months} months`;
  } else if (resultType === 'number') {
    output = Math.floor(rand() * 1000 + 50);
    summary = `Result: ${output} total matches in universe`;
  } else {
    output = Array.from({ length: Math.floor(rand() * 8 + 3) }, () => {
      const playerIdx = Math.floor(rand() * PLAYERS.length);
      const signals = ['BUY', 'STRONG BUY', 'WATCH', 'SELL', 'OVERSOLD'];
      return {
        player: PLAYERS[playerIdx],
        signal: signals[Math.floor(rand() * signals.length)],
        confidence: Math.round(rand() * 40 + 60),
        note: rand() > 0.5 ? 'Breaking out' : 'Near support',
      };
    });
    summary = `Generated ${output.length} alerts. ${output.filter((o: any) => o.signal === 'STRONG BUY').length} strong buy signals`;
  }

  return {
    id: `res-${Date.now()}`,
    strategyId: '',
    timestamp: new Date().toISOString(),
    executionTime: execTime,
    output,
    resultType,
    rowCount: resultType === 'number' ? 1 : (Array.isArray(output) ? output.length : 0),
    summary,
  };
}

export function runBacktest(strategyId: string, startDate: string, endDate: string): BacktestResult {
  const rand = seededRandom(hashStr(strategyId + startDate + endDate));

  const start = new Date(startDate);
  const end = new Date(endDate);
  const months = Math.max(1, Math.round((end.getTime() - start.getTime()) / (30.44 * 24 * 60 * 60 * 1000)));

  // Generate equity curve
  let equity = 10000;
  let peak = equity;
  let maxDD = 0;
  let wins = 0;
  let totalTrades = 0;

  const equityCurve: { date: string; value: number }[] = [];
  const trades: BacktestTrade[] = [];

  for (let i = 0; i <= months; i++) {
    const d = new Date(start);
    d.setMonth(d.getMonth() + i);
    const dateStr = d.toISOString().slice(0, 10);

    // Monthly return with slight positive bias
    const monthReturn = (rand() - 0.42) * 0.10;
    equity *= (1 + monthReturn);
    equity = Math.max(equity, 500); // floor

    if (equity > peak) peak = equity;
    const dd = (peak - equity) / peak;
    if (dd > maxDD) maxDD = dd;

    equityCurve.push({ date: dateStr, value: Math.round(equity * 100) / 100 });

    // Generate 1-3 trades per month
    const tradeCount = Math.floor(rand() * 3) + 1;
    for (let t = 0; t < tradeCount; t++) {
      const playerIdx = Math.floor(rand() * PLAYERS.length);
      const cardIdx = Math.floor(rand() * CARDS.length);
      const action: 'buy' | 'sell' = rand() > 0.5 ? 'buy' : 'sell';
      const price = Math.floor(rand() * 400 + 30);
      const pnl = action === 'sell' ? Math.round((rand() - 0.4) * price * 100) / 100 : 0;
      if (pnl > 0) wins++;
      if (action === 'sell') totalTrades++;

      trades.push({
        date: dateStr,
        action,
        player: PLAYERS[playerIdx],
        card: CARDS[cardIdx],
        price,
        quantity: Math.floor(rand() * 3) + 1,
        pnl,
      });
    }
  }

  const totalReturn = (equity - 10000) / 10000;
  const years = months / 12;
  const annualizedReturn = years > 0 ? Math.pow(1 + totalReturn, 1 / years) - 1 : totalReturn;
  const sharpe = annualizedReturn / (maxDD > 0 ? maxDD : 0.1);
  const winRate = totalTrades > 0 ? wins / totalTrades : 0;

  return {
    strategyId,
    period: `${months} months`,
    startDate,
    endDate,
    totalReturn: Math.round(totalReturn * 10000) / 100,
    annualizedReturn: Math.round(annualizedReturn * 10000) / 100,
    sharpeRatio: Math.round(sharpe * 100) / 100,
    maxDrawdown: Math.round(maxDD * 10000) / 100,
    winRate: Math.round(winRate * 10000) / 100,
    trades,
    equityCurve,
  };
}

export function runScreener(filters: ScreenerFilter[]): ScreenerResult {
  const seed = hashStr(JSON.stringify(filters));
  const rand = seededRandom(seed);

  const matchCount = Math.floor(rand() * 30 + 5);
  const matches = Array.from({ length: matchCount }, () => {
    const playerIdx = Math.floor(rand() * PLAYERS.length);
    const cardIdx = Math.floor(rand() * CARDS.length);
    const price = Math.floor(rand() * 600 + 15);
    const change = Math.round((rand() - 0.4) * 50 * 10) / 10;
    const sportIdx = Math.floor(rand() * SPORTS.length);
    const gradeIdx = Math.floor(rand() * GRADES.length);

    // Determine which filter matched
    const matchedFilter = filters.length > 0
      ? filters[Math.floor(rand() * filters.length)]
      : null;

    return {
      player: PLAYERS[playerIdx],
      card: CARDS[cardIdx],
      sport: SPORTS[sportIdx],
      grade: GRADES[gradeIdx],
      price,
      change,
      matchedOn: matchedFilter ? matchedFilter.label || matchedFilter.field : 'all',
    };
  });

  return {
    filters,
    matches,
    totalMatches: matchCount,
  };
}

export function getTemplates(): QuantStrategy[] {
  return [...TEMPLATES];
}

export function getSavedStrategies(): QuantStrategy[] {
  return store.get<QuantStrategy[]>(STORAGE_KEY, []);
}

export function saveStrategy(strategy: Omit<QuantStrategy, 'id' | 'createdAt' | 'isTemplate'>): QuantStrategy {
  const saved = getSavedStrategies();
  const newStrategy: QuantStrategy = {
    ...strategy,
    id: `strat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    isTemplate: false,
  };
  saved.push(newStrategy);
  store.set(STORAGE_KEY, saved);
  return newStrategy;
}

export function updateStrategy(id: string, updates: Partial<QuantStrategy>): void {
  const saved = getSavedStrategies();
  const idx = saved.findIndex(s => s.id === id);
  if (idx >= 0) {
    saved[idx] = { ...saved[idx], ...updates };
    store.set(STORAGE_KEY, saved);
  }
}

export function deleteStrategy(id: string): void {
  const saved = getSavedStrategies().filter(s => s.id !== id);
  store.set(STORAGE_KEY, saved);
}
