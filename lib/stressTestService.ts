// ---------------------------------------------------------------------------
// Portfolio Stress Tester – service layer
// Monte Carlo simulation, historical stress scenarios, VaR, sensitivity
// analysis, tail-risk metrics, drawdown analysis, and correlation stress
// for sports-card portfolios treated as institutional-grade financial assets.
// ---------------------------------------------------------------------------

/* ================================================================== TYPES */

export interface PortfolioPosition {
  cardId: string;
  cardName: string;
  player: string;
  sport: 'baseball' | 'basketball' | 'football' | 'hockey' | 'soccer';
  quantity: number;
  avgCost: number;
  currentValue: number;
  /** Portfolio weight (0-1), computed from market value share. */
  weight: number;
}

export interface MonteCarloResult {
  simulations: number;
  timeHorizon: string;
  percentiles: { p5: number; p25: number; p50: number; p75: number; p95: number };
  expectedReturn: number;
  standardDeviation: number;
  maxDrawdown: number;
  /** Each inner array is one simulated path (portfolio value at each monthly step). */
  pathData: number[][];
}

export interface ScenarioFactor {
  name: string;
  /** Percentage change as decimal, e.g. -0.35 = -35 %. */
  change: number;
  description: string;
}

export interface CardImpact {
  cardId: string;
  cardName: string;
  impact: number;
}

export interface StressScenario {
  id: string;
  name: string;
  description: string;
  type: 'historical' | 'hypothetical';
  factors: ScenarioFactor[];
  /** Aggregate weighted portfolio impact (decimal). */
  portfolioImpact: number;
  cardImpacts: CardImpact[];
}

export interface ValueAtRisk {
  confidence95: number;
  confidence99: number;
  expectedShortfall: number;
  holdingPeriod: string;
  method: 'historical' | 'parametric' | 'monte-carlo';
}

export interface SensitivityPoint {
  factor: string;
  impactAtMinus20: number;
  impactAtMinus10: number;
  impactAtPlus10: number;
  impactAtPlus20: number;
  mostSensitiveCards: { cardId: string; cardName: string; sensitivity: number }[];
}

export type SensitivityAnalysis = SensitivityPoint[];

export interface TailRiskMetric {
  kurtosis: number;
  skewness: number;
  tailIndex: number;
  /** Probability of a >3-sigma negative monthly return. */
  blackSwanProbability: number;
}

export interface HistoricalDrawdown {
  startDate: string;
  endDate: string;
  depth: number;
  recoveryDays: number;
  trigger: string;
}

export interface CorrelationStressResult {
  pairLabel: string;
  normalCorrelation: number;
  stressCorrelation: number;
  contagionRisk: 'low' | 'moderate' | 'high' | 'extreme';
}

/* =========================================================== SEEDED PRNG */

const SEED = 42;
let _seedState = SEED;

function seededRandom(): number {
  _seedState = (_seedState * 16807 + 0) % 2147483647;
  return _seedState / 2147483647;
}

function resetSeed(): void {
  _seedState = SEED;
}

function boxMullerGaussian(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = seededRandom();
  while (v === 0) v = seededRandom();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/* ======================================================= MOCK PORTFOLIO */

export const MOCK_PORTFOLIO: PortfolioPosition[] = [
  // ── Baseball (6) ──────────────────────────────────────────────────────
  { cardId: 'bb-001', cardName: '2011 Topps Update #US175 Mike Trout RC PSA 10',       player: 'Mike Trout',       sport: 'baseball',   quantity: 2,  avgCost: 18500, currentValue: 42000, weight: 0 },
  { cardId: 'bb-002', cardName: '1952 Topps #311 Mickey Mantle PSA 5',                 player: 'Mickey Mantle',    sport: 'baseball',   quantity: 1,  avgCost: 95000, currentValue: 125000, weight: 0 },
  { cardId: 'bb-003', cardName: '2019 Bowman Chrome #BCP-150 Wander Franco Auto PSA 10', player: 'Wander Franco', sport: 'baseball',   quantity: 5,  avgCost: 2200,  currentValue: 1850,  weight: 0 },
  { cardId: 'bb-004', cardName: '1989 Upper Deck #1 Ken Griffey Jr. RC PSA 10',        player: 'Ken Griffey Jr.',  sport: 'baseball',   quantity: 10, avgCost: 350,   currentValue: 420,   weight: 0 },
  { cardId: 'bb-005', cardName: '2018 Topps Update #US250 Shohei Ohtani RC PSA 10',    player: 'Shohei Ohtani',    sport: 'baseball',   quantity: 3,  avgCost: 1400,  currentValue: 3200,  weight: 0 },
  { cardId: 'bb-006', cardName: '2001 Bowman Chrome #350 Albert Pujols RC PSA 10',     player: 'Albert Pujols',    sport: 'baseball',   quantity: 1,  avgCost: 6500,  currentValue: 8200,  weight: 0 },

  // ── Basketball (6) ────────────────────────────────────────────────────
  { cardId: 'bk-001', cardName: '2018 Panini Prizm #280 Luka Doncic Silver PSA 10',    player: 'Luka Doncic',        sport: 'basketball', quantity: 3,  avgCost: 4800,  currentValue: 6500,  weight: 0 },
  { cardId: 'bk-002', cardName: '2019 Panini Mosaic #209 Zion Williamson PSA 10',      player: 'Zion Williamson',    sport: 'basketball', quantity: 4,  avgCost: 1200,  currentValue: 680,   weight: 0 },
  { cardId: 'bk-003', cardName: '2003 Topps Chrome #111 LeBron James RC PSA 9',        player: 'LeBron James',       sport: 'basketball', quantity: 1,  avgCost: 22000, currentValue: 35000, weight: 0 },
  { cardId: 'bk-004', cardName: '1986 Fleer #57 Michael Jordan RC PSA 8',              player: 'Michael Jordan',     sport: 'basketball', quantity: 1,  avgCost: 38000, currentValue: 52000, weight: 0 },
  { cardId: 'bk-005', cardName: '2020 Panini Prizm #258 Anthony Edwards Silver PSA 10', player: 'Anthony Edwards',  sport: 'basketball', quantity: 6,  avgCost: 350,   currentValue: 1100,  weight: 0 },
  { cardId: 'bk-006', cardName: '2022 Panini Prizm #275 Victor Wembanyama RC PSA 10',  player: 'Victor Wembanyama', sport: 'basketball', quantity: 2,  avgCost: 3200,  currentValue: 5800,  weight: 0 },

  // ── Football (5) ──────────────────────────────────────────────────────
  { cardId: 'fb-001', cardName: '2017 Panini Prizm #269 Patrick Mahomes Silver PSA 10', player: 'Patrick Mahomes', sport: 'football',   quantity: 2,  avgCost: 8500,   currentValue: 14000,  weight: 0 },
  { cardId: 'fb-002', cardName: '2020 Panini Mosaic #210 Justin Herbert RC PSA 10',    player: 'Justin Herbert',   sport: 'football',   quantity: 5,  avgCost: 180,    currentValue: 320,    weight: 0 },
  { cardId: 'fb-003', cardName: '2000 Playoff Contenders #144 Tom Brady Auto PSA 9',   player: 'Tom Brady',        sport: 'football',   quantity: 1,  avgCost: 145000, currentValue: 210000, weight: 0 },
  { cardId: 'fb-004', cardName: '2023 Panini Prizm #301 Caleb Williams RC PSA 10',     player: 'Caleb Williams',   sport: 'football',   quantity: 8,  avgCost: 120,    currentValue: 95,     weight: 0 },
  { cardId: 'fb-005', cardName: '2018 Panini Prizm #201 Josh Allen Silver PSA 10',     player: 'Josh Allen',       sport: 'football',   quantity: 3,  avgCost: 2800,   currentValue: 4500,   weight: 0 },

  // ── Hockey (4) ────────────────────────────────────────────────────────
  { cardId: 'hk-001', cardName: '2015 Upper Deck #201 Connor McDavid Young Guns PSA 10', player: 'Connor McDavid', sport: 'hockey', quantity: 2, avgCost: 4200,  currentValue: 6800,  weight: 0 },
  { cardId: 'hk-002', cardName: '1979 O-Pee-Chee #18 Wayne Gretzky RC PSA 7',           player: 'Wayne Gretzky',  sport: 'hockey', quantity: 1, avgCost: 35000, currentValue: 48000, weight: 0 },
  { cardId: 'hk-003', cardName: '2005 Upper Deck #443 Sidney Crosby Young Guns PSA 10',  player: 'Sidney Crosby',  sport: 'hockey', quantity: 1, avgCost: 2800,  currentValue: 3500,  weight: 0 },
  { cardId: 'hk-004', cardName: '2023 Upper Deck #201 Connor Bedard Young Guns PSA 10',  player: 'Connor Bedard',  sport: 'hockey', quantity: 4, avgCost: 450,   currentValue: 780,   weight: 0 },

  // ── Soccer (4) ────────────────────────────────────────────────────────
  { cardId: 'sc-001', cardName: '2018 Panini Prizm World Cup #80 Kylian Mbappe RC PSA 10', player: 'Kylian Mbappe',    sport: 'soccer', quantity: 2, avgCost: 5200,  currentValue: 8500,  weight: 0 },
  { cardId: 'sc-002', cardName: '2004 Panini Mega Cracks #71 Lionel Messi RC PSA 9',      player: 'Lionel Messi',     sport: 'soccer', quantity: 1, avgCost: 52000, currentValue: 78000, weight: 0 },
  { cardId: 'sc-003', cardName: '2019 Topps Chrome UCL #74 Erling Haaland RC PSA 10',     player: 'Erling Haaland',   sport: 'soccer', quantity: 3, avgCost: 1800,  currentValue: 4200,  weight: 0 },
  { cardId: 'sc-004', cardName: '2020 Topps Chrome UCL #99 Jude Bellingham RC PSA 10',    player: 'Jude Bellingham',  sport: 'soccer', quantity: 4, avgCost: 280,   currentValue: 1650,  weight: 0 },
];

/* ============================================================== HELPERS */

function computeWeights(portfolio: PortfolioPosition[]): PortfolioPosition[] {
  const totalValue = portfolio.reduce((s, p) => s + p.currentValue * p.quantity, 0);
  return portfolio.map((p) => ({
    ...p,
    weight: totalValue > 0 ? (p.currentValue * p.quantity) / totalValue : 0,
  }));
}

export function getDefaultPortfolio(): PortfolioPosition[] {
  return computeWeights(MOCK_PORTFOLIO);
}

function horizonToSteps(horizon: string): number {
  if (horizon === '1Y') return 12;
  if (horizon === '3Y') return 36;
  if (horizon === '5Y') return 60;
  return 12;
}

/* ======================================================= STRESS SCENARIO
   Build card-level impacts dynamically from sport multipliers + card traits. */

function buildScenarioImpacts(
  portfolio: PortfolioPosition[],
  sportMultipliers: Record<string, number>,
  vintageBonus: number,
  rookieBonus: number,
): { portfolioImpact: number; cardImpacts: CardImpact[] } {
  const weighted = computeWeights(portfolio);
  const cardImpacts: CardImpact[] = weighted.map((p) => {
    let impact = sportMultipliers[p.sport] ?? -0.15;
    const isVintage = /^(19[0-7]\d|198[0-5])/.test(p.cardName);
    const isRookie = /RC|Young Guns/i.test(p.cardName);
    if (isVintage) impact += vintageBonus;
    if (isRookie) impact += rookieBonus;
    impact = Math.max(-0.95, Math.min(0.3, impact));
    return { cardId: p.cardId, cardName: p.cardName, impact: Math.round(impact * 10000) / 10000 };
  });
  const portfolioImpact = weighted.reduce((sum, pos, i) => sum + pos.weight * cardImpacts[i].impact, 0);
  return { portfolioImpact: Math.round(portfolioImpact * 10000) / 10000, cardImpacts };
}

const STRESS_SCENARIO_TEMPLATES: Omit<StressScenario, 'portfolioImpact' | 'cardImpacts'>[] = [
  {
    id: 'covid-2020',
    name: '2020 COVID Crash',
    description: 'Global pandemic shutters live sports for 4+ months. Auction houses close, shows cancelled, eBay volume spikes as panicked sellers liquidate. Initial 40-60 % drops followed by unprecedented stimulus-fueled rally.',
    type: 'historical',
    factors: [
      { name: 'Market Liquidity',  change: -0.55, description: 'Auction house closures, show cancellations' },
      { name: 'Consumer Spending', change: -0.35, description: 'Mass unemployment, discretionary cuts' },
      { name: 'Forced Selling',    change: -0.25, description: 'Panic liquidation on secondary markets' },
      { name: 'Stimulus Offset',   change:  0.15, description: 'Government checks redirected to hobby' },
    ],
  },
  {
    id: 'gfc-2008',
    name: '2008 Financial Crisis',
    description: 'Systemic banking collapse triggers 18-month bear market across all alternative assets. High-end vintage holds better than modern; speculative rookie cards devastated.',
    type: 'historical',
    factors: [
      { name: 'Wealth Effect',    change: -0.45, description: 'Stock portfolio losses reduce hobby spend' },
      { name: 'Credit Freeze',    change: -0.30, description: 'Financing unavailable, dealer credit lines pulled' },
      { name: 'Flight to Quality', change:  0.05, description: 'Blue-chip vintage outperforms modern' },
      { name: 'Auction Decline',  change: -0.40, description: 'Major auction realizations fall sharply' },
    ],
  },
  {
    id: 'junk-wax-repeat',
    name: 'Junk Wax Repeat',
    description: 'Massive overproduction of modern cards creates supply glut. Print runs 10x historical norms. Retail-tier modern cards collapse while vintage and ultra-low-pop items hold.',
    type: 'hypothetical',
    factors: [
      { name: 'Supply Flood',       change: -0.60, description: 'Print runs exceed demand by 10x' },
      { name: 'Collector Fatigue',   change: -0.25, description: 'Market exits as new products feel worthless' },
      { name: 'Grading Backlog',     change: -0.10, description: 'PSA/BGS overwhelmed, turnaround 12+ months' },
      { name: 'Vintage Insulation',  change:  0.08, description: 'Finite-supply vintage decouples from modern' },
    ],
  },
  {
    id: 'star-scandal',
    name: 'Star Player Scandal',
    description: 'Top-tier athlete involved in career-ending scandal (PEDs, gambling, criminal). Single-player exposure can devastate concentrated portfolios.',
    type: 'hypothetical',
    factors: [
      { name: 'Player Value Collapse', change: -0.80, description: 'Scandal player cards lose 60-90 %' },
      { name: 'Contagion Fear',        change: -0.12, description: 'Adjacent players/era cards see sympathy selling' },
      { name: 'Insurance Gap',         change: -0.05, description: 'No recovery mechanism for reputational loss' },
      { name: 'Sport Sentiment',       change: -0.08, description: 'Broader sport category sells off' },
    ],
  },
  {
    id: 'grading-collapse',
    name: 'Grading Company Collapse',
    description: 'Major grading company credibility crisis — counterfeit slabs discovered at scale. Reholder panic, population report unreliable, market freezes.',
    type: 'hypothetical',
    factors: [
      { name: 'Authentication Crisis', change: -0.35, description: 'Buyers refuse graded inventory' },
      { name: 'Reholder Costs',        change: -0.12, description: 'Mass re-submission at $100+/card' },
      { name: 'Market Freeze',         change: -0.28, description: 'Bid/ask spreads widen to 40 %+' },
      { name: 'Raw Premium',           change:  0.05, description: 'Known-authentic raw cards gain brief premium' },
    ],
  },
  {
    id: 'crypto-winter',
    name: 'Crypto Winter Spillover',
    description: 'Crypto market crashes 80 %+. Overlap between crypto-wealthy collectors and sports card buyers creates forced selling pressure, especially in high-end modern.',
    type: 'hypothetical',
    factors: [
      { name: 'Wealth Destruction', change: -0.30, description: 'Crypto portfolios down 80 %, margin calls' },
      { name: 'NFT Contagion',      change: -0.15, description: 'Digital collectible skepticism spills to physical' },
      { name: 'Buyer Pool Shrink',  change: -0.20, description: 'Tech/crypto buyers exit hobby' },
      { name: 'Vintage Resilience', change:  0.03, description: 'Traditional collectors unaffected' },
    ],
  },
  {
    id: 'rate-spike',
    name: 'Interest Rate Spike',
    description: 'Central banks raise rates aggressively (500+ bps). Alternative assets re-priced as opportunity cost of capital soars. Speculative modern hit hardest.',
    type: 'hypothetical',
    factors: [
      { name: 'Discount Rate',      change: -0.25, description: 'Higher rates discount future collectible returns' },
      { name: 'Leverage Unwind',     change: -0.18, description: 'Leveraged buyers forced to sell' },
      { name: 'Opportunity Cost',    change: -0.15, description: 'Risk-free 7 %+ pulls capital from hobby' },
      { name: 'Dollar Strength',     change: -0.08, description: 'International buyer purchasing power falls' },
    ],
  },
  {
    id: 'rookie-bust',
    name: 'Rookie Class Bust',
    description: 'Highly hyped draft class underperforms dramatically. Top rookies bust within 2 seasons. Modern rookie-heavy portfolios suffer outsized losses.',
    type: 'hypothetical',
    factors: [
      { name: 'Rookie Crash',         change: -0.55, description: 'Current-year rookies lose 40-70 %' },
      { name: 'Prospect Skepticism',   change: -0.20, description: 'Next-year prospect cards pre-sold off' },
      { name: 'Veteran Rally',         change:  0.10, description: 'Proven veteran cards gain as safe haven' },
      { name: 'Hobby Sentiment',       change: -0.12, description: 'New collector inflows slow dramatically' },
    ],
  },
];

/* Per-scenario sport-level multipliers */
const SPORT_MULT: Record<string, Record<string, number>> = {
  'covid-2020':       { baseball: -0.35, basketball: -0.40, football: -0.38, hockey: -0.30, soccer: -0.42 },
  'gfc-2008':         { baseball: -0.28, basketball: -0.35, football: -0.32, hockey: -0.25, soccer: -0.30 },
  'junk-wax-repeat':  { baseball: -0.45, basketball: -0.50, football: -0.48, hockey: -0.35, soccer: -0.40 },
  'star-scandal':     { baseball: -0.15, basketball: -0.15, football: -0.15, hockey: -0.12, soccer: -0.18 },
  'grading-collapse': { baseball: -0.30, basketball: -0.32, football: -0.30, hockey: -0.28, soccer: -0.25 },
  'crypto-winter':    { baseball: -0.18, basketball: -0.28, football: -0.22, hockey: -0.15, soccer: -0.20 },
  'rate-spike':       { baseball: -0.20, basketball: -0.25, football: -0.22, hockey: -0.18, soccer: -0.22 },
  'rookie-bust':      { baseball: -0.30, basketball: -0.38, football: -0.35, hockey: -0.28, soccer: -0.32 },
};

/* ========================================================= PUBLIC API */

/**
 * Run a Monte Carlo simulation on the portfolio.
 * Returns percentile bands, expected return, standard deviation, max drawdown,
 * and up to 200 sample paths for visualization.
 */
export async function runMonteCarloSimulation(
  portfolio: PortfolioPosition[],
  simCount: number = 5000,
  horizon: string = '3Y',
): Promise<MonteCarloResult> {
  resetSeed();

  const steps = horizonToSteps(horizon);
  const totalValue = portfolio.reduce((s, p) => s + p.currentValue * p.quantity, 0);

  // Monthly drift / vol calibrated to sports-card market
  const annualDrift = 0.07;
  const annualVol   = 0.32;
  const monthlyDrift = annualDrift / 12;
  const monthlyVol   = annualVol / Math.sqrt(12);

  const paths: number[][] = [];
  const finalValues: number[] = [];
  let worstDrawdown = 0;

  for (let sim = 0; sim < simCount; sim++) {
    const path: number[] = [totalValue];
    let peak = totalValue;
    let maxDd = 0;

    for (let t = 1; t <= steps; t++) {
      const shock = boxMullerGaussian();
      const ret = monthlyDrift + monthlyVol * shock;
      const nextVal = Math.max(0, path[t - 1] * (1 + ret));
      path.push(nextVal);
      if (nextVal > peak) peak = nextVal;
      const dd = (peak - nextVal) / peak;
      if (dd > maxDd) maxDd = dd;
    }

    if (sim < 200) paths.push(path);
    finalValues.push(path[steps]);
    if (maxDd > worstDrawdown) worstDrawdown = maxDd;
  }

  finalValues.sort((a, b) => a - b);
  const pct = (p: number) => finalValues[Math.floor(p * finalValues.length)] ?? 0;
  const mean = finalValues.reduce((a, b) => a + b, 0) / finalValues.length;
  const variance = finalValues.reduce((a, b) => a + (b - mean) ** 2, 0) / finalValues.length;

  return {
    simulations: simCount,
    timeHorizon: horizon,
    percentiles: {
      p5:  Math.round(pct(0.05)),
      p25: Math.round(pct(0.25)),
      p50: Math.round(pct(0.50)),
      p75: Math.round(pct(0.75)),
      p95: Math.round(pct(0.95)),
    },
    expectedReturn:    Math.round(((mean - totalValue) / totalValue) * 10000) / 10000,
    standardDeviation: Math.round((Math.sqrt(variance) / totalValue) * 10000) / 10000,
    maxDrawdown:       Math.round(worstDrawdown * 10000) / 10000,
    pathData: paths,
  };
}

/** Return all 8 pre-built stress scenarios with portfolio-specific impacts. */
export function getStressScenarios(portfolio?: PortfolioPosition[]): StressScenario[] {
  const p = portfolio ?? getDefaultPortfolio();
  return STRESS_SCENARIO_TEMPLATES.map((tmpl) => {
    const mults       = SPORT_MULT[tmpl.id] ?? {};
    const vintageBonus = tmpl.id === 'junk-wax-repeat' ? 0.20 : tmpl.id === 'gfc-2008' ? 0.10 : 0.05;
    const rookieBonus  = tmpl.id === 'rookie-bust' ? -0.25 : tmpl.id === 'junk-wax-repeat' ? -0.15 : -0.05;
    const { portfolioImpact, cardImpacts } = buildScenarioImpacts(p, mults, vintageBonus, rookieBonus);
    return { ...tmpl, portfolioImpact, cardImpacts } as StressScenario;
  });
}

/** Apply a specific scenario to the portfolio and return before/after values. */
export function applyStressScenario(
  portfolio: PortfolioPosition[],
  scenarioId: string,
): { before: number; after: number; scenario: StressScenario; stressedPositions: PortfolioPosition[] } {
  const scenarios = getStressScenarios(portfolio);
  const scenario = scenarios.find((s) => s.id === scenarioId);
  if (!scenario) throw new Error(`Unknown scenario: ${scenarioId}`);

  const before = portfolio.reduce((s, p) => s + p.currentValue * p.quantity, 0);
  const stressedPositions = portfolio.map((p) => {
    const ci = scenario.cardImpacts.find((c) => c.cardId === p.cardId);
    const impact = ci?.impact ?? scenario.portfolioImpact;
    return { ...p, currentValue: Math.round(p.currentValue * (1 + impact) * 100) / 100 };
  });
  const after = stressedPositions.reduce((s, p) => s + p.currentValue * p.quantity, 0);
  return { before: Math.round(before), after: Math.round(after), scenario, stressedPositions };
}

/** Parametric Value at Risk. */
export function calculateVaR(
  portfolio: PortfolioPosition[],
  _confidence: number = 0.95,
  period: string = '1M',
): ValueAtRisk {
  const totalValue = portfolio.reduce((s, p) => s + p.currentValue * p.quantity, 0);
  const annualVol = 0.32;
  const periodMult = period === '1W'
    ? Math.sqrt(7 / 365)
    : period === '1M'
      ? Math.sqrt(30 / 365)
      : Math.sqrt(90 / 365);
  const periodVol = annualVol * periodMult;

  const var95 = totalValue * 1.645 * periodVol;
  const var99 = totalValue * 2.326 * periodVol;
  const es    = totalValue * periodVol * (Math.exp(-(2.326 ** 2) / 2) / (Math.sqrt(2 * Math.PI) * 0.01));

  return {
    confidence95:     Math.round(var95),
    confidence99:     Math.round(var99),
    expectedShortfall: Math.round(es),
    holdingPeriod:    period,
    method:           'parametric',
  };
}

/** Factor-sensitivity tornado-chart data. */
export function getSensitivityAnalysis(portfolio: PortfolioPosition[]): SensitivityAnalysis {
  const weighted = computeWeights(portfolio);
  const factors = [
    'Market Sentiment',
    'Interest Rates',
    'Player Performance',
    'Grading Standards',
    'Supply (New Releases)',
    'Auction Volume',
    'Social Media Hype',
    'Economic Recession',
  ];

  const betas: Record<string, Record<string, number>> = {
    'Market Sentiment':     { baseball: 0.85, basketball: 1.15, football: 1.10, hockey: 0.70, soccer: 0.95 },
    'Interest Rates':       { baseball: -0.40, basketball: -0.55, football: -0.50, hockey: -0.35, soccer: -0.45 },
    'Player Performance':   { baseball: 0.65, basketball: 0.90, football: 0.85, hockey: 0.60, soccer: 0.75 },
    'Grading Standards':    { baseball: 0.50, basketball: 0.55, football: 0.52, hockey: 0.48, soccer: 0.42 },
    'Supply (New Releases)': { baseball: -0.60, basketball: -0.75, football: -0.70, hockey: -0.45, soccer: -0.55 },
    'Auction Volume':       { baseball: 0.30, basketball: 0.45, football: 0.40, hockey: 0.25, soccer: 0.35 },
    'Social Media Hype':    { baseball: 0.35, basketball: 0.80, football: 0.65, hockey: 0.25, soccer: 0.70 },
    'Economic Recession':   { baseball: -0.55, basketball: -0.70, football: -0.65, hockey: -0.45, soccer: -0.60 },
  };

  return factors.map((factor) => {
    const fb = betas[factor] ?? {};
    const computeImpact = (shock: number): number =>
      weighted.reduce((sum, pos) => sum + pos.weight * (fb[pos.sport] ?? 0.5) * shock, 0);

    const cards = weighted
      .map((pos) => ({
        cardId: pos.cardId,
        cardName: pos.cardName,
        sensitivity: Math.abs(fb[pos.sport] ?? 0.5) * pos.weight,
      }))
      .sort((a, b) => b.sensitivity - a.sensitivity)
      .slice(0, 5);

    return {
      factor,
      impactAtMinus20: Math.round(computeImpact(-0.20) * 10000) / 10000,
      impactAtMinus10: Math.round(computeImpact(-0.10) * 10000) / 10000,
      impactAtPlus10:  Math.round(computeImpact(0.10) * 10000) / 10000,
      impactAtPlus20:  Math.round(computeImpact(0.20) * 10000) / 10000,
      mostSensitiveCards: cards,
    };
  });
}

/** Higher-moment tail-risk analysis via mixture model (95 % normal + 5 % crisis). */
export function getTailRiskMetrics(_portfolio: PortfolioPosition[]): TailRiskMetric {
  resetSeed();
  const returns: number[] = [];
  const monthlyVol   = 0.32 / Math.sqrt(12);
  const monthlyDrift = 0.07 / 12;

  for (let i = 0; i < 10000; i++) {
    const isCrisis = seededRandom() < 0.05;
    const shock = boxMullerGaussian();
    const ret = isCrisis
      ? monthlyDrift - 0.08 + monthlyVol * 2.5 * shock
      : monthlyDrift + monthlyVol * shock;
    returns.push(ret);
  }

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  const m3 = returns.reduce((a, b) => a + ((b - mean) / stdDev) ** 3, 0) / returns.length;
  const m4 = returns.reduce((a, b) => a + ((b - mean) / stdDev) ** 4, 0) / returns.length;

  // Hill estimator proxy for tail index
  const sorted = [...returns].sort((a, b) => a - b);
  const k = Math.floor(returns.length * 0.05);
  const threshold = sorted[k];
  const tailReturns = sorted.slice(0, k);
  const hillSum = tailReturns.reduce(
    (s, r) => s + Math.log(Math.abs(threshold) / Math.max(Math.abs(r), 0.0001)),
    0,
  );
  const tailIndex = k / Math.max(hillSum, 0.01);

  const blackSwanCount = returns.filter((r) => r < mean - 3 * stdDev).length;

  return {
    kurtosis:            Math.round(m4 * 100) / 100,
    skewness:            Math.round(m3 * 100) / 100,
    tailIndex:           Math.round(tailIndex * 100) / 100,
    blackSwanProbability: Math.round((blackSwanCount / returns.length) * 10000) / 10000,
  };
}

/** Historical drawdown episodes for the card market. */
export function getHistoricalDrawdowns(_portfolio: PortfolioPosition[]): HistoricalDrawdown[] {
  return [
    { startDate: '2008-09-15', endDate: '2009-03-09', depth: -0.48, recoveryDays: 540, trigger: 'Global financial crisis' },
    { startDate: '2020-02-20', endDate: '2020-04-15', depth: -0.42, recoveryDays: 185, trigger: 'COVID-19 pandemic shutdown' },
    { startDate: '2022-03-01', endDate: '2022-09-30', depth: -0.35, recoveryDays: 320, trigger: 'Post-stimulus market correction' },
    { startDate: '2021-11-01', endDate: '2022-02-28', depth: -0.28, recoveryDays: 150, trigger: 'Crypto crash contagion' },
    { startDate: '2023-06-01', endDate: '2023-10-15', depth: -0.18, recoveryDays: 90,  trigger: 'Interest rate fears + modern card glut' },
    { startDate: '2024-04-01', endDate: '2024-07-30', depth: -0.15, recoveryDays: 110, trigger: 'Grading backlog & authentication scare' },
    { startDate: '2019-08-01', endDate: '2019-11-15', depth: -0.12, recoveryDays: 60,  trigger: 'Pre-pandemic seasonal slowdown' },
    { startDate: '2017-06-01', endDate: '2017-09-30', depth: -0.10, recoveryDays: 45,  trigger: 'Summer seasonal decline' },
  ].sort((a, b) => a.depth - b.depth);
}

/** Cross-sport correlation under normal vs stress regimes. */
export function getCorrelationStress(_portfolio: PortfolioPosition[]): CorrelationStressResult[] {
  return [
    { pairLabel: 'Football vs Basketball',  normalCorrelation: 0.52, stressCorrelation: 0.88, contagionRisk: 'extreme' },
    { pairLabel: 'Baseball vs Basketball',  normalCorrelation: 0.45, stressCorrelation: 0.82, contagionRisk: 'high' },
    { pairLabel: 'Rookies vs Veterans',     normalCorrelation: 0.35, stressCorrelation: 0.78, contagionRisk: 'high' },
    { pairLabel: 'Modern vs Vintage',       normalCorrelation: 0.22, stressCorrelation: 0.71, contagionRisk: 'high' },
    { pairLabel: 'Graded vs Raw',           normalCorrelation: 0.40, stressCorrelation: 0.75, contagionRisk: 'high' },
    { pairLabel: 'Hockey vs Baseball',      normalCorrelation: 0.30, stressCorrelation: 0.65, contagionRisk: 'moderate' },
    { pairLabel: 'Soccer vs Basketball',    normalCorrelation: 0.28, stressCorrelation: 0.58, contagionRisk: 'moderate' },
    { pairLabel: 'US Sports vs Soccer',     normalCorrelation: 0.18, stressCorrelation: 0.52, contagionRisk: 'low' },
  ];
}

// Backward-compatible aliases for consumers that depend on the old API names
export const getAllScenarios = getStressScenarios;
export function runStressTest(
  _inventory: unknown[],
  scenario: StressScenario,
  _days: number,
): { scenarioName: string; impact: number } {
  return { scenarioName: scenario.name, impact: scenario.portfolioImpact };
}
