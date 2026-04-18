// ─────────────────────────────────────────────────────────────────────────────
// Vintage Yield Curve Service
// Models card market returns as yield curves across holding tenors, analyzing
// curve shapes, spread signals, and shift dynamics for portfolio positioning
// ─────────────────────────────────────────────────────────────────────────────

export interface YieldPoint {
  tenor: string; // '1m','3m','6m','1y','2y','3y','5y','10y'
  currentYield: number;
  previousYield: number;
  change: number;
  impliedReturn: number;
}

export interface YieldCurve {
  id: string;
  name: string;
  date: string;
  category: string;
  shape: 'normal' | 'inverted' | 'flat' | 'humped';
  points: YieldPoint[];
  steepness: number;
  curvature: number;
}

export interface YieldSpread {
  id: string;
  name: string;
  longTenor: string;
  shortTenor: string;
  currentSpread: number;
  historicalAvg: number;
  zScore: number;
  signal: 'bullish' | 'bearish' | 'neutral';
  description: string;
}

export interface CurveShift {
  id: string;
  date: string;
  shiftType: 'parallel' | 'steepening' | 'flattening' | 'twist';
  magnitude: number;
  driver: string;
  affectedTenors: string[];
  portfolioImpact: number;
}

// ── Data ─────────────────────────────────────────────────────────────────────

const yieldCurves: YieldCurve[] = [
  {
    id: 'YC-01',
    name: 'Vintage Baseball',
    date: '2026-04-15',
    category: 'Pre-War & Vintage',
    shape: 'normal',
    steepness: 3.45,
    curvature: 0.82,
    points: [
      { tenor: '1m', currentYield: 1.2, previousYield: 1.0, change: 0.2, impliedReturn: 1.5 },
      { tenor: '3m', currentYield: 2.8, previousYield: 2.5, change: 0.3, impliedReturn: 3.4 },
      { tenor: '6m', currentYield: 5.1, previousYield: 4.6, change: 0.5, impliedReturn: 6.2 },
      { tenor: '1y', currentYield: 8.4, previousYield: 7.8, change: 0.6, impliedReturn: 10.5 },
      { tenor: '2y', currentYield: 12.6, previousYield: 11.9, change: 0.7, impliedReturn: 15.8 },
      { tenor: '3y', currentYield: 16.2, previousYield: 15.3, change: 0.9, impliedReturn: 20.1 },
      { tenor: '5y', currentYield: 22.8, previousYield: 21.5, change: 1.3, impliedReturn: 28.5 },
      { tenor: '10y', currentYield: 35.0, previousYield: 33.2, change: 1.8, impliedReturn: 42.0 },
    ],
  },
  {
    id: 'YC-02',
    name: 'Modern Chrome',
    date: '2026-04-15',
    category: 'Chrome & Refractors',
    shape: 'humped',
    steepness: 1.85,
    curvature: 2.14,
    points: [
      { tenor: '1m', currentYield: 4.5, previousYield: 5.2, change: -0.7, impliedReturn: 5.8 },
      { tenor: '3m', currentYield: 9.8, previousYield: 10.5, change: -0.7, impliedReturn: 12.2 },
      { tenor: '6m', currentYield: 15.2, previousYield: 16.8, change: -1.6, impliedReturn: 18.5 },
      { tenor: '1y', currentYield: 18.6, previousYield: 20.1, change: -1.5, impliedReturn: 22.0 },
      { tenor: '2y', currentYield: 16.4, previousYield: 18.0, change: -1.6, impliedReturn: 19.2 },
      { tenor: '3y', currentYield: 14.2, previousYield: 15.5, change: -1.3, impliedReturn: 16.8 },
      { tenor: '5y', currentYield: 12.8, previousYield: 14.0, change: -1.2, impliedReturn: 15.0 },
      { tenor: '10y', currentYield: 10.5, previousYield: 12.2, change: -1.7, impliedReturn: 12.8 },
    ],
  },
  {
    id: 'YC-03',
    name: 'Prospect Pipeline',
    date: '2026-04-15',
    category: 'Prospects & 1st Bowman',
    shape: 'inverted',
    steepness: -2.10,
    curvature: 1.45,
    points: [
      { tenor: '1m', currentYield: 12.0, previousYield: 10.5, change: 1.5, impliedReturn: 15.2 },
      { tenor: '3m', currentYield: 18.5, previousYield: 16.2, change: 2.3, impliedReturn: 22.8 },
      { tenor: '6m', currentYield: 14.8, previousYield: 13.5, change: 1.3, impliedReturn: 17.6 },
      { tenor: '1y', currentYield: 10.2, previousYield: 9.8, change: 0.4, impliedReturn: 12.5 },
      { tenor: '2y', currentYield: 6.5, previousYield: 7.0, change: -0.5, impliedReturn: 7.8 },
      { tenor: '3y', currentYield: 3.8, previousYield: 4.5, change: -0.7, impliedReturn: 4.5 },
      { tenor: '5y', currentYield: 1.2, previousYield: 2.0, change: -0.8, impliedReturn: 1.5 },
      { tenor: '10y', currentYield: -2.5, previousYield: -1.8, change: -0.7, impliedReturn: -3.0 },
    ],
  },
];

const yieldSpreads: YieldSpread[] = [
  {
    id: 'YS-01',
    name: 'Vintage 10y-1m',
    longTenor: '10y',
    shortTenor: '1m',
    currentSpread: 33.8,
    historicalAvg: 28.5,
    zScore: 1.85,
    signal: 'bullish',
    description: 'Wide vintage spread signals continued long-term appreciation in pre-war cards; long-hold positions favored.',
  },
  {
    id: 'YS-02',
    name: 'Chrome 1y-3m',
    longTenor: '1y',
    shortTenor: '3m',
    currentSpread: 8.8,
    historicalAvg: 12.5,
    zScore: -1.42,
    signal: 'bearish',
    description: 'Compressed chrome spread indicates weakening mid-term demand; hype-driven short-term buying outpacing fundamentals.',
  },
  {
    id: 'YS-03',
    name: 'Prospect 3m-1y',
    longTenor: '3m',
    shortTenor: '1y',
    currentSpread: 8.3,
    historicalAvg: 5.2,
    zScore: 2.15,
    signal: 'bearish',
    description: 'Inverted prospect spread at extreme levels; speculative frenzy in short tenors suggests bubble conditions.',
  },
  {
    id: 'YS-04',
    name: 'Vintage vs Chrome 5y',
    longTenor: '5y',
    shortTenor: '5y',
    currentSpread: 10.0,
    historicalAvg: 8.8,
    zScore: 0.65,
    signal: 'neutral',
    description: 'Vintage premium over chrome at 5-year tenor near historical average; cross-category allocation balanced.',
  },
  {
    id: 'YS-05',
    name: 'Chrome 5y-1y',
    longTenor: '5y',
    shortTenor: '1y',
    currentSpread: -5.8,
    historicalAvg: -2.0,
    zScore: -1.90,
    signal: 'bearish',
    description: 'Deepening inversion in chrome long-end; collectors expecting significant price resets in modern product.',
  },
  {
    id: 'YS-06',
    name: 'Vintage 3y-1y',
    longTenor: '3y',
    shortTenor: '1y',
    currentSpread: 7.8,
    historicalAvg: 6.5,
    zScore: 0.92,
    signal: 'bullish',
    description: 'Healthy mid-curve steepness in vintage segment; strong conviction in medium-term hold strategies.',
  },
];

const curveShifts: CurveShift[] = [
  {
    id: 'CS-01',
    date: '2026-04-12',
    shiftType: 'parallel',
    magnitude: 1.2,
    driver: 'PSA grading backlog clearance flooded market with newly graded vintage',
    affectedTenors: ['1m', '3m', '6m', '1y', '2y', '3y', '5y', '10y'],
    portfolioImpact: -2.8,
  },
  {
    id: 'CS-02',
    date: '2026-04-08',
    shiftType: 'steepening',
    magnitude: 2.5,
    driver: 'Heritage Auctions record sale of T206 Honus Wagner drove long-end vintage yields higher',
    affectedTenors: ['3y', '5y', '10y'],
    portfolioImpact: 4.2,
  },
  {
    id: 'CS-03',
    date: '2026-03-28',
    shiftType: 'flattening',
    magnitude: 1.8,
    driver: 'Topps Chrome product release saturation compressed modern card spreads',
    affectedTenors: ['6m', '1y', '2y', '3y'],
    portfolioImpact: -1.5,
  },
  {
    id: 'CS-04',
    date: '2026-03-15',
    shiftType: 'twist',
    magnitude: 3.1,
    driver: 'Prospect call-up wave inverted short-end while long-end sold off on bust concerns',
    affectedTenors: ['1m', '3m', '5y', '10y'],
    portfolioImpact: -5.2,
  },
  {
    id: 'CS-05',
    date: '2026-03-02',
    shiftType: 'parallel',
    magnitude: 0.8,
    driver: 'Spring training hype cycle lifted all baseball card tenors uniformly',
    affectedTenors: ['1m', '3m', '6m', '1y', '2y', '3y', '5y', '10y'],
    portfolioImpact: 3.1,
  },
  {
    id: 'CS-06',
    date: '2026-02-18',
    shiftType: 'steepening',
    magnitude: 1.6,
    driver: 'PWCC marketplace data showed accelerating vintage appreciation vs flat modern prices',
    affectedTenors: ['2y', '3y', '5y', '10y'],
    portfolioImpact: 2.4,
  },
  {
    id: 'CS-07',
    date: '2026-02-05',
    shiftType: 'flattening',
    magnitude: 2.2,
    driver: 'eBay algorithm change reduced visibility of modern listings, compressing short-term yields',
    affectedTenors: ['1m', '3m', '6m'],
    portfolioImpact: -3.0,
  },
  {
    id: 'CS-08',
    date: '2026-01-20',
    shiftType: 'twist',
    magnitude: 1.4,
    driver: 'NFL playoff surprises drove football card demand, pulling capital from baseball short-end',
    affectedTenors: ['1m', '3m', '1y', '2y'],
    portfolioImpact: -0.8,
  },
];

// ── Getters ──────────────────────────────────────────────────────────────────

export function getYieldCurves(): YieldCurve[] {
  return yieldCurves;
}

export function getYieldSpreads(): YieldSpread[] {
  return yieldSpreads;
}

export function getCurveShifts(): CurveShift[] {
  return curveShifts;
}

export function getYieldSummary(): {
  avgSteepness: number;
  invertedCurves: number;
  widestSpread: number;
  recentShiftCount: number;
} {
  const avgSteepness = +(
    yieldCurves.reduce((s, c) => s + c.steepness, 0) / yieldCurves.length
  ).toFixed(2);

  const invertedCurves = yieldCurves.filter(c => c.shape === 'inverted').length;

  const widestSpread = Math.max(
    ...yieldSpreads.map(s => Math.abs(s.currentSpread))
  );

  const cutoff = new Date('2026-03-01');
  const recentShiftCount = curveShifts.filter(
    s => new Date(s.date) >= cutoff
  ).length;

  return { avgSteepness, invertedCurves, widestSpread, recentShiftCount };
}
