// @ts-nocheck
import { store } from '../dal/syncStore';

// Phase 86 — MSI Market Indices & Proprietary Benchmarks Service

// ---- Types ----

export interface IndexDataPoint {
  date: string;
  value: number;
  volume: number;
}

export interface MarketIndex {
  id: string;
  name: string;
  ticker: string;
  description: string;
  currentValue: number;
  previousClose: number;
  change: number;
  changePercent: number;
  high52Week: number;
  low52Week: number;
  components: number;
  category: 'composite' | 'sport' | 'era' | 'specialty';
  dataPoints: IndexDataPoint[];
  sharpeRatio: number;
  annualizedReturn: number;
  maxDrawdown: number;
  inception: string;
}

export interface IndexComponent {
  rank: number;
  player: string;
  cardDescription: string;
  weight: number;
  value: number;
  change24h: number;
  contribution: number;
}

export interface PortfolioBeta {
  portfolioBeta: number;
  indexCorrelation: number;
  trackingError: number;
  activeReturn: number;
  informationRatio: number;
}

export interface IndexComparison {
  indices: {
    name: string;
    ticker: string;
    returns: {
      day: number;
      week: number;
      month: number;
      quarter: number;
      year: number;
      ytd: number;
    };
  }[];
}

// ---- Deterministic seed helpers ----

function seededRandom(seed: number, offset: number = 0): number {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
}

// ---- Constants ----

const STORAGE_KEY = 'msi_market_indices_v1';

interface IndexDefinition {
  id: string;
  name: string;
  ticker: string;
  description: string;
  currentValue: number;
  ytdPercent: number;
  components: number;
  category: 'composite' | 'sport' | 'era' | 'specialty';
  sharpeRatio: number;
  annualizedReturn: number;
  maxDrawdown: number;
  inception: string;
}

const INDEX_DEFINITIONS: IndexDefinition[] = [
  {
    id: 'msi500',
    name: 'MSI 500',
    ticker: 'MSI500',
    description: 'Top 500 cards by market capitalization — the definitive broad-market benchmark for sports cards.',
    currentValue: 1247.83,
    ytdPercent: 8.2,
    components: 500,
    category: 'composite',
    sharpeRatio: 1.34,
    annualizedReturn: 12.6,
    maxDrawdown: -18.4,
    inception: '2020-01-01',
  },
  {
    id: 'msivnt',
    name: 'MSI Vintage',
    ticker: 'MSIVNT',
    description: 'Pre-1980 cards index tracking classic and vintage sports card values.',
    currentValue: 2891.45,
    ytdPercent: 3.1,
    components: 200,
    category: 'era',
    sharpeRatio: 0.92,
    annualizedReturn: 7.8,
    maxDrawdown: -12.1,
    inception: '2020-01-01',
  },
  {
    id: 'msimod',
    name: 'MSI Modern',
    ticker: 'MSIMOD',
    description: '2015+ rookie and prospect cards — capturing the modern hobby boom.',
    currentValue: 834.21,
    ytdPercent: 14.7,
    components: 300,
    category: 'era',
    sharpeRatio: 1.58,
    annualizedReturn: 18.2,
    maxDrawdown: -28.6,
    inception: '2020-06-01',
  },
  {
    id: 'msimlb',
    name: 'MSI Baseball',
    ticker: 'MSIMLB',
    description: 'Comprehensive index of all graded baseball cards across eras.',
    currentValue: 1102.56,
    ytdPercent: 6.8,
    components: 350,
    category: 'sport',
    sharpeRatio: 1.12,
    annualizedReturn: 10.4,
    maxDrawdown: -15.2,
    inception: '2020-01-01',
  },
  {
    id: 'msinba',
    name: 'MSI Basketball',
    ticker: 'MSINBA',
    description: 'All basketball cards index — driven by NBA star power and rookie demand.',
    currentValue: 1445.32,
    ytdPercent: 11.2,
    components: 280,
    category: 'sport',
    sharpeRatio: 1.41,
    annualizedReturn: 15.1,
    maxDrawdown: -22.8,
    inception: '2020-01-01',
  },
  {
    id: 'msinfl',
    name: 'MSI Football',
    ticker: 'MSINFL',
    description: 'NFL football cards index tracking gridiron collectibles market.',
    currentValue: 987.64,
    ytdPercent: 5.3,
    components: 260,
    category: 'sport',
    sharpeRatio: 1.05,
    annualizedReturn: 9.2,
    maxDrawdown: -19.7,
    inception: '2020-01-01',
  },
  {
    id: 'msinhl',
    name: 'MSI Hockey',
    ticker: 'MSINHL',
    description: 'Hockey cards index — niche market with strong collector loyalty.',
    currentValue: 456.78,
    ytdPercent: 2.1,
    components: 150,
    category: 'sport',
    sharpeRatio: 0.78,
    annualizedReturn: 5.4,
    maxDrawdown: -14.3,
    inception: '2020-03-01',
  },
  {
    id: 'msipro',
    name: 'MSI Prospect',
    ticker: 'MSIPRO',
    description: 'Minor league, draft prospect, and pre-debut cards — high-beta speculation index.',
    currentValue: 623.91,
    ytdPercent: 22.4,
    components: 120,
    category: 'specialty',
    sharpeRatio: 1.72,
    annualizedReturn: 28.6,
    maxDrawdown: -38.2,
    inception: '2021-01-01',
  },
];

// ---- Data generation ----

function generateDataPoints(currentValue: number, ytdPercent: number, seed: number): IndexDataPoint[] {
  const points: IndexDataPoint[] = [];
  const now = new Date();

  // Work backward 24 months from current value
  // Calculate a base value roughly 24 months ago
  const totalGrowth = 1 + (ytdPercent / 100) * 2.4; // rough 2-year extrapolation
  const baseValue = currentValue / totalGrowth;

  for (let i = 23; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const progress = (24 - i) / 24;

    // Smooth growth with noise
    const trend = baseValue + (currentValue - baseValue) * progress;
    const noise = (seededRandom(seed, i) - 0.5) * trend * 0.06;
    const value = Math.round((trend + noise) * 100) / 100;

    const volume = Math.round(50000 + seededRandom(seed, i + 100) * 150000);

    points.push({
      date: date.toISOString().slice(0, 10),
      value,
      volume,
    });
  }

  // Ensure last point matches currentValue
  points[points.length - 1].value = currentValue;

  return points;
}

function buildIndex(def: IndexDefinition, seed: number): MarketIndex {
  const dataPoints = generateDataPoints(def.currentValue, def.ytdPercent, seed);
  const previousClose = dataPoints.length >= 2 ? dataPoints[dataPoints.length - 2].value : def.currentValue;
  const change = Math.round((def.currentValue - previousClose) * 100) / 100;
  const changePercent = Math.round((change / previousClose) * 10000) / 100;

  // 52-week high/low from last 12 data points
  const last12 = dataPoints.slice(-12);
  const high52Week = Math.round(Math.max(...last12.map(d => d.value)) * 1.02 * 100) / 100;
  const low52Week = Math.round(Math.min(...last12.map(d => d.value)) * 0.97 * 100) / 100;

  return {
    id: def.id,
    name: def.name,
    ticker: def.ticker,
    description: def.description,
    currentValue: def.currentValue,
    previousClose,
    change,
    changePercent,
    high52Week,
    low52Week,
    components: def.components,
    category: def.category,
    dataPoints,
    sharpeRatio: def.sharpeRatio,
    annualizedReturn: def.annualizedReturn,
    maxDrawdown: def.maxDrawdown,
    inception: def.inception,
  };
}

// ---- Component generation ----

const PLAYER_POOL: { player: string; card: string; sport: string }[] = [
  { player: 'Mickey Mantle', card: '1952 Topps #311 PSA 8', sport: 'Baseball' },
  { player: 'Mike Trout', card: '2011 Topps Update #US175 PSA 10', sport: 'Baseball' },
  { player: 'Shohei Ohtani', card: '2018 Topps #700 PSA 10', sport: 'Baseball' },
  { player: 'LeBron James', card: '2003 Topps Chrome #111 PSA 10', sport: 'Basketball' },
  { player: 'Luka Doncic', card: '2018 Prizm #280 PSA 10', sport: 'Basketball' },
  { player: 'Victor Wembanyama', card: '2023 Prizm #1 PSA 10', sport: 'Basketball' },
  { player: 'Michael Jordan', card: '1986 Fleer #57 PSA 9', sport: 'Basketball' },
  { player: 'Patrick Mahomes', card: '2017 Prizm #269 PSA 10', sport: 'Football' },
  { player: 'Josh Allen', card: '2018 Prizm #205 PSA 10', sport: 'Football' },
  { player: 'Tom Brady', card: '2000 Playoff Contenders #144 PSA 10', sport: 'Football' },
  { player: 'Wayne Gretzky', card: '1979 O-Pee-Chee #18 PSA 8', sport: 'Hockey' },
  { player: 'Connor McDavid', card: '2015 Upper Deck Young Guns #201 PSA 10', sport: 'Hockey' },
  { player: 'Ken Griffey Jr.', card: '1989 Upper Deck #1 PSA 10', sport: 'Baseball' },
  { player: 'Kobe Bryant', card: '1996 Topps Chrome #138 PSA 10', sport: 'Basketball' },
  { player: 'Stephen Curry', card: '2009 Topps Chrome #101 PSA 10', sport: 'Basketball' },
  { player: 'Ja Morant', card: '2019 Prizm #249 PSA 10', sport: 'Basketball' },
  { player: 'Aaron Judge', card: '2017 Topps Chrome #169 PSA 10', sport: 'Baseball' },
  { player: 'Juan Soto', card: '2018 Topps Update #US300 PSA 10', sport: 'Baseball' },
  { player: 'Justin Herbert', card: '2020 Prizm #325 PSA 10', sport: 'Football' },
  { player: 'Joe Burrow', card: '2020 Prizm #307 PSA 10', sport: 'Football' },
  { player: 'Roberto Clemente', card: '1955 Topps #164 PSA 7', sport: 'Baseball' },
  { player: 'Hank Aaron', card: '1954 Topps #128 PSA 7', sport: 'Baseball' },
  { player: 'Willie Mays', card: '1952 Topps #261 PSA 6', sport: 'Baseball' },
  { player: 'Babe Ruth', card: '1933 Goudey #53 PSA 5', sport: 'Baseball' },
  { player: 'Jackie Robinson', card: '1948 Leaf #79 PSA 5', sport: 'Baseball' },
  { player: 'Larry Bird', card: '1980 Topps #34 PSA 9', sport: 'Basketball' },
  { player: 'Magic Johnson', card: '1980 Topps #139 PSA 9', sport: 'Basketball' },
  { player: 'Anthony Edwards', card: '2020 Prizm #258 PSA 10', sport: 'Basketball' },
  { player: 'Caleb Williams', card: '2024 Prizm Draft #101 PSA 10', sport: 'Football' },
  { player: 'C.J. Stroud', card: '2023 Prizm #301 PSA 10', sport: 'Football' },
];

function generateComponents(ticker: string, limit: number): IndexComponent[] {
  const seed = ticker.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const components: IndexComponent[] = [];

  // Filter players if sport-specific
  let pool = [...PLAYER_POOL];
  if (ticker === 'MSIMLB') pool = pool.filter(p => p.sport === 'Baseball');
  else if (ticker === 'MSINBA') pool = pool.filter(p => p.sport === 'Basketball');
  else if (ticker === 'MSINFL') pool = pool.filter(p => p.sport === 'Football');
  else if (ticker === 'MSINHL') pool = pool.filter(p => p.sport === 'Hockey');

  const count = Math.min(limit, pool.length);

  // Sort pool by seeded random for consistent ordering
  pool.sort((a, b) => seededRandom(seed, pool.indexOf(a)) - seededRandom(seed, pool.indexOf(b)));

  let remainingWeight = 100;
  for (let i = 0; i < count; i++) {
    const p = pool[i];
    // Decreasing weights
    const weight = i === count - 1
      ? Math.round(remainingWeight * 100) / 100
      : Math.round((remainingWeight * (0.25 + seededRandom(seed, i) * 0.15)) * 100) / 100;
    remainingWeight -= weight;
    if (remainingWeight < 0) remainingWeight = 0;

    const value = Math.round((5000 + seededRandom(seed, i + 50) * 45000) * 100) / 100;
    const change24h = Math.round((seededRandom(seed, i + 200) - 0.45) * 800) / 100;
    const contribution = Math.round((weight * change24h) * 10) / 10;

    components.push({
      rank: i + 1,
      player: p.player,
      cardDescription: p.card,
      weight,
      value,
      change24h,
      contribution,
    });
  }

  return components;
}

// ---- localStorage persistence ----

function loadFromStorage(): MarketIndex[] | null {
  try {
    const parsed = store.get<{ indices: MarketIndex[]; timestamp: number } | null>(STORAGE_KEY, null);
    if (parsed && parsed.timestamp && Date.now() - parsed.timestamp < 3600000) {
      return parsed.indices;
    }
    return null;
  } catch {
    return null;
  }
}

function saveToStorage(indices: MarketIndex[]): void {
  store.set(STORAGE_KEY, { indices, timestamp: Date.now() });
}

// ---- Public API ----

let cachedIndices: MarketIndex[] | null = null;

function ensureIndices(): MarketIndex[] {
  if (cachedIndices) return cachedIndices;

  const stored = loadFromStorage();
  if (stored) {
    cachedIndices = stored;
    return stored;
  }

  const indices = INDEX_DEFINITIONS.map((def, i) => buildIndex(def, (i + 1) * 137));
  cachedIndices = indices;
  saveToStorage(indices);
  return indices;
}

export function getIndices(): MarketIndex[] {
  return ensureIndices();
}

export function getIndexDetail(ticker: string): (MarketIndex & { topComponents: IndexComponent[] }) | null {
  const indices = ensureIndices();
  const idx = indices.find(i => i.ticker === ticker);
  if (!idx) return null;

  return {
    ...idx,
    topComponents: generateComponents(ticker, 10),
  };
}

export function getIndexComparison(): IndexComparison {
  const indices = ensureIndices();

  return {
    indices: indices.map(idx => {
      const pts = idx.dataPoints;
      const current = idx.currentValue;
      const prev1d = idx.previousClose;
      const prev1w = pts.length >= 1 ? pts[pts.length - 1].value * 0.995 : current;
      const prev1m = pts.length >= 2 ? pts[pts.length - 2].value : current;
      const prev3m = pts.length >= 4 ? pts[pts.length - 4].value : current;
      const prev1y = pts.length >= 13 ? pts[pts.length - 13].value : current;
      // YTD approximation
      const janIdx = pts.findIndex(p => p.date.endsWith('-01'));
      const ytdBase = janIdx >= 0 ? pts[janIdx].value : pts[0].value;

      const pctReturn = (cur: number, base: number) => Math.round(((cur - base) / base) * 10000) / 100;

      return {
        name: idx.name,
        ticker: idx.ticker,
        returns: {
          day: pctReturn(current, prev1d),
          week: pctReturn(current, prev1w),
          month: pctReturn(current, prev1m),
          quarter: pctReturn(current, prev3m),
          year: pctReturn(current, prev1y),
          ytd: Math.round(((idx as any).ytdPercent ?? pctReturn(current, ytdBase)) * 100) / 100 ||
               pctReturn(current, ytdBase),
        },
      };
    }),
  };
}

export function calculatePortfolioBeta(indexTicker: string): PortfolioBeta {
  const seed = indexTicker.split('').reduce((a, c) => a + c.charCodeAt(0), 0);

  const beta = Math.round((0.6 + seededRandom(seed, 1) * 1.2) * 100) / 100;
  const correlation = Math.round((0.5 + seededRandom(seed, 2) * 0.45) * 100) / 100;
  const trackingError = Math.round((2 + seededRandom(seed, 3) * 8) * 100) / 100;
  const activeReturn = Math.round((seededRandom(seed, 4) - 0.4) * 12 * 100) / 100;
  const informationRatio = trackingError > 0
    ? Math.round((activeReturn / trackingError) * 100) / 100
    : 0;

  return {
    portfolioBeta: beta,
    indexCorrelation: correlation,
    trackingError,
    activeReturn,
    informationRatio,
  };
}

export function getTopComponents(ticker: string, limit: number = 10): IndexComponent[] {
  return generateComponents(ticker, limit);
}
