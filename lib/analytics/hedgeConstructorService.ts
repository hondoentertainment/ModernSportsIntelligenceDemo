// @ts-nocheck
// Collection Hedge Constructor Service
// Enables pair-trade and basket-hedge construction for sports card portfolios.
// Models negative correlations between rival teams, positions, and eras to build
// protection strategies against collection value drawdowns.

// ─── Types ───────────────────────────────────────────────────────────────────

export type HedgeStrategy =
  | 'pair-trade'
  | 'basket-hedge'
  | 'tail-risk'
  | 'calendar-spread';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface HedgeCard {
  id: string;
  name: string;
  player: string;
  team: string;
  sport: 'NFL' | 'NBA' | 'MLB' | 'NHL';
  year: number;
  position: string;
  currentValue: number;
  volatility30d: number; // annualized %
  beta: number; // relative to overall card market
  momentum: number; // -1 to 1
  liquidityScore: number; // 0-100
}

export interface HedgePair {
  id: string;
  longCard: HedgeCard;
  shortCard: HedgeCard;
  correlation: number; // -1 to 1
  hedgeRatio: number;
  expectedReturn: number; // annualized %
  residualRisk: number; // %
  strategy: HedgeStrategy;
  confidence: number; // 0-100
  rationale: string;
}

export interface CorrelationEntry {
  cardIdA: string;
  cardIdB: string;
  correlation: number;
}

export interface CorrelationMatrix {
  cardIds: string[];
  cardLabels: string[];
  matrix: number[][]; // NxN symmetric
  computedAt: string;
  windowDays: number;
}

export interface HedgeRatio {
  longCardId: string;
  shortCardId: string;
  ratio: number; // units of short per 1 unit of long
  method: 'ols' | 'tls' | 'kalman';
  rSquared: number;
  halfLife: number; // mean-reversion half-life in days
  confidence: number;
}

export interface ProtectionCost {
  hedgePairId: string;
  annualCostBps: number; // basis points
  impliedVolSpread: number;
  carryDrag: number; // % annual drag from maintaining hedge
  liquidityCost: number;
  totalCostPct: number;
  breakEvenDays: number;
}

export interface NetExposure {
  grossLong: number;
  grossShort: number;
  netExposure: number;
  hedgeRatioPct: number;
  beta: number;
  sectorExposures: { sector: string; net: number }[];
  sportExposures: { sport: string; net: number }[];
}

export interface RiskMetric {
  label: string;
  value: number;
  benchmark: number;
  unit: string;
  status: RiskLevel;
  description: string;
}

export interface BacktestResult {
  hedgePairId: string;
  strategy: HedgeStrategy;
  startDate: string;
  endDate: string;
  totalReturn: number;
  annualizedReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  trades: number;
  equityCurve: { date: string; value: number }[];
  monthlyReturns: { month: string; return: number }[];
}

export interface DrawdownAnalysis {
  hedgePairId: string;
  currentDrawdown: number;
  maxHistoricalDrawdown: number;
  avgRecoveryDays: number;
  drawdownEvents: {
    peakDate: string;
    troughDate: string;
    recoveryDate: string | null;
    depth: number;
    durationDays: number;
    recovered: boolean;
  }[];
  tailRiskVaR95: number;
  tailRiskVaR99: number;
  conditionalVaR: number;
}

export interface HedgePortfolio {
  id: string;
  name: string;
  pairs: HedgePair[];
  totalValue: number;
  netExposure: NetExposure;
  expectedReturn: number;
  portfolioSharpe: number;
  protectionLevel: number; // 0-100
  riskMetrics: RiskMetric[];
  rebalanceFrequency: string;
}

export interface HedgeRecommendation {
  id: string;
  title: string;
  description: string;
  strategy: HedgeStrategy;
  longCardId: string;
  shortCardId: string;
  expectedBenefit: number;
  urgency: RiskLevel;
  rationale: string;
}

// ─── Mock Card Universe ──────────────────────────────────────────────────────

const CARDS: HedgeCard[] = [
  { id: 'c1', name: '2020 Prizm #1 Trevor Lawrence RC', player: 'Trevor Lawrence', team: 'JAX', sport: 'NFL', year: 2020, position: 'QB', currentValue: 285, volatility30d: 42, beta: 1.35, momentum: 0.22, liquidityScore: 88 },
  { id: 'c2', name: '2018 Prizm #280 Josh Allen RC', player: 'Josh Allen', team: 'BUF', sport: 'NFL', year: 2018, position: 'QB', currentValue: 620, volatility30d: 38, beta: 1.20, momentum: 0.45, liquidityScore: 92 },
  { id: 'c3', name: '2020 Select #44 Justin Herbert RC', player: 'Justin Herbert', team: 'LAC', sport: 'NFL', year: 2020, position: 'QB', currentValue: 390, volatility30d: 40, beta: 1.28, momentum: 0.31, liquidityScore: 85 },
  { id: 'c4', name: '2017 Donruss Optic #177 Patrick Mahomes RC', player: 'Patrick Mahomes', team: 'KC', sport: 'NFL', year: 2017, position: 'QB', currentValue: 980, volatility30d: 32, beta: 1.05, momentum: 0.60, liquidityScore: 95 },
  { id: 'c5', name: '2018 Prizm #280 Saquon Barkley RC', player: 'Saquon Barkley', team: 'NYG', sport: 'NFL', year: 2018, position: 'RB', currentValue: 145, volatility30d: 55, beta: 1.50, momentum: -0.30, liquidityScore: 72 },
  { id: 'c6', name: '2020 Prizm #339 Joe Burrow RC', player: 'Joe Burrow', team: 'CIN', sport: 'NFL', year: 2020, position: 'QB', currentValue: 310, volatility30d: 44, beta: 1.32, momentum: 0.18, liquidityScore: 82 },
  { id: 'c7', name: '2019 Prizm #248 Ja Morant RC', player: 'Ja Morant', team: 'MEM', sport: 'NBA', year: 2019, position: 'PG', currentValue: 520, volatility30d: 50, beta: 1.45, momentum: -0.15, liquidityScore: 78 },
  { id: 'c8', name: '2018 Prizm #280 Luka Doncic RC', player: 'Luka Doncic', team: 'DAL', sport: 'NBA', year: 2018, position: 'PG', currentValue: 1450, volatility30d: 35, beta: 1.10, momentum: 0.55, liquidityScore: 96 },
  { id: 'c9', name: '2019 Prizm #248 Zion Williamson RC', player: 'Zion Williamson', team: 'NOP', sport: 'NBA', year: 2019, position: 'PF', currentValue: 380, volatility30d: 62, beta: 1.60, momentum: -0.40, liquidityScore: 70 },
  { id: 'c10', name: '2003 Topps Chrome #111 LeBron James RC', player: 'LeBron James', team: 'CLE', sport: 'NBA', year: 2003, position: 'SF', currentValue: 4200, volatility30d: 22, beta: 0.65, momentum: 0.12, liquidityScore: 98 },
  { id: 'c11', name: '2018 Prizm #280 Trae Young RC', player: 'Trae Young', team: 'ATL', sport: 'NBA', year: 2018, position: 'PG', currentValue: 210, volatility30d: 48, beta: 1.38, momentum: 0.05, liquidityScore: 74 },
  { id: 'c12', name: '2017 Topps Chrome #169 Aaron Judge RC', player: 'Aaron Judge', team: 'NYY', sport: 'MLB', year: 2017, position: 'OF', currentValue: 720, volatility30d: 28, beta: 0.85, momentum: 0.52, liquidityScore: 90 },
  { id: 'c13', name: '2019 Topps Chrome #1 Fernando Tatis Jr RC', player: 'Fernando Tatis Jr', team: 'SD', sport: 'MLB', year: 2019, position: 'SS', currentValue: 260, volatility30d: 58, beta: 1.55, momentum: -0.48, liquidityScore: 68 },
  { id: 'c14', name: '2011 Topps Update #US175 Mike Trout RC', player: 'Mike Trout', team: 'LAA', sport: 'MLB', year: 2011, position: 'OF', currentValue: 3800, volatility30d: 18, beta: 0.55, momentum: 0.08, liquidityScore: 97 },
  { id: 'c15', name: '2018 Topps Chrome #150 Shohei Ohtani RC', player: 'Shohei Ohtani', team: 'LAA', sport: 'MLB', year: 2018, position: 'P/DH', currentValue: 890, volatility30d: 30, beta: 0.92, momentum: 0.65, liquidityScore: 94 },
  { id: 'c16', name: '2019 Topps Chrome #200 Yordan Alvarez RC', player: 'Yordan Alvarez', team: 'HOU', sport: 'MLB', year: 2019, position: 'DH', currentValue: 180, volatility30d: 36, beta: 1.10, momentum: 0.20, liquidityScore: 76 },
  { id: 'c17', name: '2015 OPC #U16 Connor McDavid RC', player: 'Connor McDavid', team: 'EDM', sport: 'NHL', year: 2015, position: 'C', currentValue: 950, volatility30d: 25, beta: 0.78, momentum: 0.42, liquidityScore: 88 },
  { id: 'c18', name: '2016 Upper Deck #201 Auston Matthews RC', player: 'Auston Matthews', team: 'TOR', sport: 'NHL', year: 2016, position: 'C', currentValue: 410, volatility30d: 32, beta: 0.95, momentum: 0.28, liquidityScore: 82 },
  { id: 'c19', name: '2019 Upper Deck #201 Cale Makar RC', player: 'Cale Makar', team: 'COL', sport: 'NHL', year: 2019, position: 'D', currentValue: 320, volatility30d: 38, beta: 1.08, momentum: 0.35, liquidityScore: 78 },
  { id: 'c20', name: '2003 Topps Chrome #221 Tom Brady', player: 'Tom Brady', team: 'NE', sport: 'NFL', year: 2003, position: 'QB', currentValue: 2800, volatility30d: 20, beta: 0.52, momentum: 0.05, liquidityScore: 96 },
  { id: 'c21', name: '1986 Fleer #57 Michael Jordan RC', player: 'Michael Jordan', team: 'CHI', sport: 'NBA', year: 1986, position: 'SG', currentValue: 42000, volatility30d: 15, beta: 0.35, momentum: 0.02, liquidityScore: 99 },
  { id: 'c22', name: '2020 Prizm #1 CeeDee Lamb RC', player: 'CeeDee Lamb', team: 'DAL', sport: 'NFL', year: 2020, position: 'WR', currentValue: 175, volatility30d: 52, beta: 1.42, momentum: 0.10, liquidityScore: 70 },
  { id: 'c23', name: '2021 Prizm #1 Mac Jones RC', player: 'Mac Jones', team: 'NE', sport: 'NFL', year: 2021, position: 'QB', currentValue: 55, volatility30d: 68, beta: 1.72, momentum: -0.62, liquidityScore: 60 },
  { id: 'c24', name: '2020 Panini Prizm #258 Anthony Edwards RC', player: 'Anthony Edwards', team: 'MIN', sport: 'NBA', year: 2020, position: 'SG', currentValue: 680, volatility30d: 42, beta: 1.25, momentum: 0.48, liquidityScore: 86 },
  { id: 'c25', name: '2021 Topps Chrome #27 Julio Rodriguez RC', player: 'Julio Rodriguez', team: 'SEA', sport: 'MLB', year: 2021, position: 'OF', currentValue: 240, volatility30d: 46, beta: 1.30, momentum: 0.15, liquidityScore: 74 },
  { id: 'c26', name: '2020 Upper Deck #201 Alexis Lafreniere RC', player: 'Alexis Lafreniere', team: 'NYR', sport: 'NHL', year: 2020, position: 'LW', currentValue: 110, volatility30d: 56, beta: 1.48, momentum: -0.25, liquidityScore: 64 },
  { id: 'c27', name: '2022 Prizm #1 Brock Purdy RC', player: 'Brock Purdy', team: 'SF', sport: 'NFL', year: 2022, position: 'QB', currentValue: 195, volatility30d: 60, beta: 1.55, momentum: 0.38, liquidityScore: 80 },
];

// ─── Deterministic Correlation Data ──────────────────────────────────────────

function buildCorrelationSeed(): Map<string, number> {
  const seeds = new Map<string, number>();
  const key = (a: string, b: string) => a < b ? `${a}|${b}` : `${b}|${a}`;

  // Rival teams / same-position: negative correlations (one gains at other's expense)
  seeds.set(key('c1', 'c6'), -0.68);  // Lawrence vs Burrow — AFC rivals
  seeds.set(key('c2', 'c4'), -0.55);  // Allen vs Mahomes — AFC championship rivalry
  seeds.set(key('c7', 'c8'), -0.45);  // Morant vs Doncic — young PG rivalry
  seeds.set(key('c8', 'c11'), -0.52); // Doncic vs Trae Young — draft class rivals
  seeds.set(key('c12', 'c15'), -0.38); // Judge vs Ohtani — AL MVP race
  seeds.set(key('c17', 'c18'), -0.60); // McDavid vs Matthews — NHL rivalry
  seeds.set(key('c9', 'c24'), -0.48); // Zion vs Edwards — young star replacement
  seeds.set(key('c5', 'c22'), -0.35); // Barkley vs Lamb — same draft, different trajectory
  seeds.set(key('c20', 'c4'), -0.30); // Brady vs Mahomes — GOAT debate
  seeds.set(key('c13', 'c25'), -0.42); // Tatis vs Rodriguez — NL young stars
  seeds.set(key('c23', 'c27'), -0.58); // Mac Jones vs Purdy — narrative replacement

  // Same team / era: positive correlations
  seeds.set(key('c14', 'c15'), 0.72); // Trout & Ohtani — same team LAA
  seeds.set(key('c10', 'c21'), 0.55); // LeBron & Jordan — GOAT legacy linked
  seeds.set(key('c20', 'c23'), 0.48); // Brady & Mac Jones — NE connection
  seeds.set(key('c1', 'c3'), 0.62);   // Lawrence & Herbert — 2020 QB class
  seeds.set(key('c7', 'c9'), 0.40);   // Morant & Zion — 2019 class
  seeds.set(key('c2', 'c6'), 0.35);   // Allen & Burrow — similar era QBs
  seeds.set(key('c17', 'c19'), 0.45); // McDavid & Makar — Canadian hockey stars
  seeds.set(key('c22', 'c27'), 0.38); // Lamb & Purdy — 2020 class

  // Cross-sport: low correlation
  seeds.set(key('c4', 'c8'), 0.12);   // Mahomes vs Doncic
  seeds.set(key('c2', 'c12'), 0.08);  // Allen vs Judge
  seeds.set(key('c10', 'c14'), 0.15); // LeBron vs Trout — blue chip stable
  seeds.set(key('c21', 'c20'), 0.45); // Jordan vs Brady — GOAT premium
  seeds.set(key('c17', 'c4'), 0.05);  // McDavid vs Mahomes
  seeds.set(key('c8', 'c15'), 0.10);  // Doncic vs Ohtani

  return seeds;
}

const CORRELATION_SEEDS = buildCorrelationSeed();

function getCorrelationValue(idA: string, idB: string): number {
  if (idA === idB) return 1.0;
  const key = idA < idB ? `${idA}|${idB}` : `${idB}|${idA}`;
  const seeded = CORRELATION_SEEDS.get(key);
  if (seeded !== undefined) return seeded;

  // Deterministic fallback based on card properties
  const a = CARDS.find(c => c.id === idA);
  const b = CARDS.find(c => c.id === idB);
  if (!a || !b) return 0;

  let base = 0;
  if (a.sport === b.sport) base += 0.25;
  if (a.position === b.position) base -= 0.15; // same position competes for attention
  if (Math.abs(a.year - b.year) <= 2) base += 0.10;
  if (a.team === b.team) base += 0.20;

  // Add deterministic pseudo-random variation
  const hash = (idA.charCodeAt(1) * 31 + idB.charCodeAt(1) * 17) % 100;
  base += (hash - 50) * 0.004;

  return Math.max(-1, Math.min(1, parseFloat(base.toFixed(2))));
}

// ─── Pre-Built Hedge Strategies ──────────────────────────────────────────────

const HEDGE_PAIRS: HedgePair[] = [
  {
    id: 'hp1', strategy: 'pair-trade',
    longCard: CARDS[1],  // Josh Allen
    shortCard: CARDS[3], // Mahomes
    correlation: -0.55, hedgeRatio: 0.63, expectedReturn: 8.2, residualRisk: 12.5, confidence: 82,
    rationale: 'AFC Championship rivalry: Allen outperformance hedged against Mahomes. Seasonal divergence during NFL playoffs.',
  },
  {
    id: 'hp2', strategy: 'pair-trade',
    longCard: CARDS[7],  // Luka Doncic
    shortCard: CARDS[10], // Trae Young
    correlation: -0.52, hedgeRatio: 6.90, expectedReturn: 11.5, residualRisk: 18.2, confidence: 78,
    rationale: '2018 draft swap pair. Doncic premium widens when Trae narrative weakens — classic substitution effect.',
  },
  {
    id: 'hp3', strategy: 'pair-trade',
    longCard: CARDS[0],  // Trevor Lawrence
    shortCard: CARDS[5], // Joe Burrow
    correlation: -0.68, hedgeRatio: 0.92, expectedReturn: 6.8, residualRisk: 15.0, confidence: 85,
    rationale: 'AFC South vs AFC North QB narrative. Strong negative correlation during regular season weeks.',
  },
  {
    id: 'hp4', strategy: 'basket-hedge',
    longCard: CARDS[9],  // LeBron James
    shortCard: CARDS[8], // Zion Williamson
    correlation: -0.22, hedgeRatio: 11.05, expectedReturn: 4.2, residualRisk: 8.5, confidence: 90,
    rationale: 'Blue-chip legacy hedge. LeBron stable value insulated by shorting high-vol bust risk of Zion.',
  },
  {
    id: 'hp5', strategy: 'tail-risk',
    longCard: CARDS[13], // Trout
    shortCard: CARDS[12], // Tatis Jr
    correlation: -0.18, hedgeRatio: 14.62, expectedReturn: 3.1, residualRisk: 6.8, confidence: 92,
    rationale: 'Injury/suspension tail risk hedge. Tatis negative sentiment protects Trout exposure during MLB off-season.',
  },
  {
    id: 'hp6', strategy: 'pair-trade',
    longCard: CARDS[16], // McDavid
    shortCard: CARDS[17], // Auston Matthews
    correlation: -0.60, hedgeRatio: 2.32, expectedReturn: 7.5, residualRisk: 14.2, confidence: 80,
    rationale: 'NHL superstar rivalry. Hart Trophy narrative drives inverse movement annually.',
  },
  {
    id: 'hp7', strategy: 'calendar-spread',
    longCard: CARDS[23], // Anthony Edwards
    shortCard: CARDS[6], // Ja Morant
    correlation: -0.48, hedgeRatio: 1.31, expectedReturn: 14.2, residualRisk: 22.0, confidence: 72,
    rationale: 'Generational transition trade. Edwards ascendancy vs Morant off-court risk creates calendar divergence.',
  },
  {
    id: 'hp8', strategy: 'basket-hedge',
    longCard: CARDS[14], // Ohtani
    shortCard: CARDS[11], // Judge
    correlation: -0.38, hedgeRatio: 1.24, expectedReturn: 5.8, residualRisk: 10.5, confidence: 86,
    rationale: 'AL MVP substitution hedge. Market attention shifts between Judge and Ohtani narratives seasonally.',
  },
  {
    id: 'hp9', strategy: 'tail-risk',
    longCard: CARDS[3],  // Mahomes
    shortCard: CARDS[22], // Mac Jones
    correlation: -0.30, hedgeRatio: 17.82, expectedReturn: 2.5, residualRisk: 5.2, confidence: 94,
    rationale: 'Cheap tail-risk protection. Mac Jones as deep out-of-the-money put against QB market collapse.',
  },
  {
    id: 'hp10', strategy: 'calendar-spread',
    longCard: CARDS[26], // Brock Purdy
    shortCard: CARDS[22], // Mac Jones
    correlation: -0.58, hedgeRatio: 3.55, expectedReturn: 18.5, residualRisk: 28.0, confidence: 68,
    rationale: 'Late-round QB narrative spread. Purdy upside vs Mac Jones decay — high conviction calendar play.',
  },
  {
    id: 'hp11', strategy: 'pair-trade',
    longCard: CARDS[11], // Judge
    shortCard: CARDS[12], // Tatis Jr
    correlation: -0.32, hedgeRatio: 2.77, expectedReturn: 9.8, residualRisk: 16.5, confidence: 76,
    rationale: 'Clean vs controversial narrative trade. Judge consistency hedged against Tatis headline risk.',
  },
  {
    id: 'hp12', strategy: 'basket-hedge',
    longCard: CARDS[20], // Michael Jordan
    shortCard: CARDS[19], // Tom Brady
    correlation: 0.45, hedgeRatio: 15.0, expectedReturn: 1.8, residualRisk: 4.0, confidence: 96,
    rationale: 'GOAT basket. Both ultra-stable blue chips — minimal residual, maximum capital preservation.',
  },
];

// ─── Public API ──────────────────────────────────────────────────────────────

export function getCards(): HedgeCard[] {
  return [...CARDS];
}

export function getCardById(id: string): HedgeCard | undefined {
  return CARDS.find(c => c.id === id);
}

export function getHedgePairs(): HedgePair[] {
  return [...HEDGE_PAIRS];
}

export function buildHedge(longCardId: string, shortCardId: string): HedgePair | null {
  const longCard = CARDS.find(c => c.id === longCardId);
  const shortCard = CARDS.find(c => c.id === shortCardId);
  if (!longCard || !shortCard) return null;

  const correlation = getCorrelationValue(longCardId, shortCardId);
  const hedgeRatio = parseFloat((longCard.beta / shortCard.beta).toFixed(2));
  const residualRisk = parseFloat(
    (Math.abs(correlation + 1) * 15 + Math.abs(longCard.volatility30d - shortCard.volatility30d) * 0.3).toFixed(1)
  );
  const expectedReturn = parseFloat(
    ((longCard.momentum - shortCard.momentum) * 10 + (1 - Math.abs(correlation)) * 5).toFixed(1)
  );

  let strategy: HedgeStrategy = 'pair-trade';
  if (correlation > 0.3) strategy = 'basket-hedge';
  if (Math.abs(longCard.year - shortCard.year) >= 5) strategy = 'calendar-spread';
  if (residualRisk < 8) strategy = 'tail-risk';

  return {
    id: `hp-custom-${longCardId}-${shortCardId}`,
    longCard, shortCard, correlation, hedgeRatio,
    expectedReturn, residualRisk, strategy,
    confidence: Math.max(50, Math.min(95, Math.round(80 - residualRisk * 1.5 + (correlation < 0 ? 10 : -5)))),
    rationale: `Custom hedge: ${longCard.player} (long) vs ${shortCard.player} (short). Correlation: ${correlation.toFixed(2)}. Strategy auto-selected as ${strategy}.`,
  };
}

export function calculateHedgeRatio(longCardId: string, shortCardId: string): HedgeRatio {
  const longCard = CARDS.find(c => c.id === longCardId) ?? CARDS[0];
  const shortCard = CARDS.find(c => c.id === shortCardId) ?? CARDS[1];
  const ratio = parseFloat((longCard.beta / shortCard.beta).toFixed(4));
  const corr = Math.abs(getCorrelationValue(longCardId, shortCardId));

  return {
    longCardId, shortCardId, ratio,
    method: 'ols',
    rSquared: parseFloat((corr * corr).toFixed(4)),
    halfLife: Math.round(15 + (1 - corr) * 60),
    confidence: Math.round(corr * 100),
  };
}

export function getCorrelationMatrix(cardIds?: string[]): CorrelationMatrix {
  const ids = cardIds ?? CARDS.map(c => c.id);
  const labels = ids.map(id => {
    const card = CARDS.find(c => c.id === id);
    return card ? card.player : id;
  });
  const n = ids.length;
  const matrix: number[][] = [];
  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    for (let j = 0; j < n; j++) {
      row.push(getCorrelationValue(ids[i], ids[j]));
    }
    matrix.push(row);
  }
  return {
    cardIds: ids,
    cardLabels: labels,
    matrix,
    computedAt: '2026-03-16T12:00:00Z',
    windowDays: 90,
  };
}

export function getProtectionCost(hedgePairId: string): ProtectionCost {
  const pair = HEDGE_PAIRS.find(p => p.id === hedgePairId) ?? HEDGE_PAIRS[0];
  const annualCostBps = Math.round(pair.residualRisk * 12 + pair.shortCard.volatility30d * 2);
  const liquidityCost = parseFloat(((100 - pair.shortCard.liquidityScore) * 0.08).toFixed(2));
  const carryDrag = parseFloat((pair.hedgeRatio * pair.shortCard.volatility30d * 0.01).toFixed(2));
  const impliedVolSpread = parseFloat((pair.longCard.volatility30d - pair.shortCard.volatility30d).toFixed(1));
  const totalCostPct = parseFloat((annualCostBps / 100 + liquidityCost + carryDrag).toFixed(2));

  return {
    hedgePairId: pair.id, annualCostBps, impliedVolSpread, carryDrag,
    liquidityCost, totalCostPct,
    breakEvenDays: Math.round(totalCostPct > 0 ? (pair.expectedReturn / totalCostPct) * 365 / 12 : 90),
  };
}

export function getNetExposure(): NetExposure {
  const longPairs = HEDGE_PAIRS.slice(0, 8);
  const grossLong = longPairs.reduce((s, p) => s + p.longCard.currentValue, 0);
  const grossShort = longPairs.reduce((s, p) => s + p.shortCard.currentValue * p.hedgeRatio, 0);
  const net = grossLong - grossShort;

  const sportMap = new Map<string, number>();
  longPairs.forEach(p => {
    sportMap.set(p.longCard.sport, (sportMap.get(p.longCard.sport) ?? 0) + p.longCard.currentValue);
    sportMap.set(p.shortCard.sport, (sportMap.get(p.shortCard.sport) ?? 0) - p.shortCard.currentValue * p.hedgeRatio);
  });

  const sectorMap = new Map<string, number>();
  longPairs.forEach(p => {
    const lSec = p.longCard.position;
    const sSec = p.shortCard.position;
    sectorMap.set(lSec, (sectorMap.get(lSec) ?? 0) + p.longCard.currentValue);
    sectorMap.set(sSec, (sectorMap.get(sSec) ?? 0) - p.shortCard.currentValue * p.hedgeRatio);
  });

  return {
    grossLong, grossShort,
    netExposure: parseFloat(net.toFixed(2)),
    hedgeRatioPct: parseFloat(((grossShort / grossLong) * 100).toFixed(1)),
    beta: parseFloat((longPairs.reduce((s, p) => s + p.longCard.beta - p.shortCard.beta * p.hedgeRatio, 0) / longPairs.length).toFixed(2)),
    sectorExposures: Array.from(sectorMap.entries()).map(([sector, net]) => ({ sector, net: parseFloat(net.toFixed(2)) })),
    sportExposures: Array.from(sportMap.entries()).map(([sport, net]) => ({ sport, net: parseFloat(net.toFixed(2)) })),
  };
}

export function backtestHedge(hedgePairId?: string): BacktestResult {
  const pair = HEDGE_PAIRS.find(p => p.id === (hedgePairId ?? 'hp1')) ?? HEDGE_PAIRS[0];

  const equityCurve: { date: string; value: number }[] = [];
  const monthlyReturns: { month: string; return: number }[] = [];
  let equity = 10000;

  for (let m = 0; m < 24; m++) {
    const date = new Date(2024, 3 + m, 1);
    const monthStr = date.toISOString().slice(0, 7);
    // Deterministic returns based on pair characteristics
    const seedVal = (pair.id.charCodeAt(2) * 17 + m * 31) % 100;
    const monthReturn = (seedVal - 42) * 0.004 + pair.expectedReturn / 1200;
    equity *= (1 + monthReturn);
    equityCurve.push({ date: monthStr, value: parseFloat(equity.toFixed(2)) });
    monthlyReturns.push({ month: monthStr, return: parseFloat((monthReturn * 100).toFixed(2)) });
  }

  const totalReturn = parseFloat(((equity / 10000 - 1) * 100).toFixed(2));
  const annualizedReturn = parseFloat((totalReturn / 2).toFixed(2));
  const returns = monthlyReturns.map(m => m.return);
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const stdDev = Math.sqrt(returns.reduce((s, r) => s + (r - avgReturn) ** 2, 0) / returns.length);
  const sharpe = parseFloat((stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(12) : 0).toFixed(2));

  let maxEquity = 10000;
  let maxDD = 0;
  equityCurve.forEach(e => {
    if (e.value > maxEquity) maxEquity = e.value;
    const dd = (maxEquity - e.value) / maxEquity;
    if (dd > maxDD) maxDD = dd;
  });

  const wins = monthlyReturns.filter(m => m.return > 0).length;

  return {
    hedgePairId: pair.id, strategy: pair.strategy,
    startDate: '2024-04-01', endDate: '2026-03-01',
    totalReturn, annualizedReturn, sharpeRatio: sharpe,
    maxDrawdown: parseFloat((maxDD * 100).toFixed(2)),
    winRate: parseFloat(((wins / monthlyReturns.length) * 100).toFixed(1)),
    profitFactor: parseFloat((1 + pair.expectedReturn / (pair.residualRisk || 1) * 0.3).toFixed(2)),
    trades: Math.round(24 * 2.5),
    equityCurve, monthlyReturns,
  };
}

export function getDrawdownAnalysis(hedgePairId?: string): DrawdownAnalysis {
  const pair = HEDGE_PAIRS.find(p => p.id === (hedgePairId ?? 'hp1')) ?? HEDGE_PAIRS[0];
  const baseDepth = pair.residualRisk * 1.2;

  const drawdownEvents = [
    { peakDate: '2024-06-15', troughDate: '2024-07-22', recoveryDate: '2024-09-10', depth: parseFloat((baseDepth * 0.8).toFixed(1)), durationDays: 37, recovered: true },
    { peakDate: '2024-11-01', troughDate: '2024-12-14', recoveryDate: '2025-02-05', depth: parseFloat((baseDepth * 1.2).toFixed(1)), durationDays: 43, recovered: true },
    { peakDate: '2025-04-10', troughDate: '2025-05-18', recoveryDate: '2025-07-01', depth: parseFloat((baseDepth * 0.6).toFixed(1)), durationDays: 38, recovered: true },
    { peakDate: '2025-09-20', troughDate: '2025-11-05', recoveryDate: null, depth: parseFloat((baseDepth * 1.5).toFixed(1)), durationDays: 46, recovered: false },
  ];

  return {
    hedgePairId: pair.id,
    currentDrawdown: parseFloat((baseDepth * 0.4).toFixed(1)),
    maxHistoricalDrawdown: parseFloat((baseDepth * 1.5).toFixed(1)),
    avgRecoveryDays: 39,
    drawdownEvents,
    tailRiskVaR95: parseFloat((baseDepth * 0.9).toFixed(1)),
    tailRiskVaR99: parseFloat((baseDepth * 1.8).toFixed(1)),
    conditionalVaR: parseFloat((baseDepth * 2.1).toFixed(1)),
  };
}

export function getOptimalHedgePortfolio(): HedgePortfolio {
  const selectedPairs = HEDGE_PAIRS.slice(0, 6);
  const exposure = getNetExposure();
  const totalValue = selectedPairs.reduce((s, p) => s + p.longCard.currentValue, 0);

  const riskMetrics: RiskMetric[] = [
    { label: 'Portfolio Beta', value: 0.42, benchmark: 1.0, unit: '', status: 'low', description: 'Market sensitivity significantly reduced through hedging' },
    { label: 'Sharpe Ratio', value: 1.85, benchmark: 1.0, unit: '', status: 'low', description: 'Risk-adjusted returns well above benchmark' },
    { label: 'Max Drawdown', value: 8.2, benchmark: 22.0, unit: '%', status: 'low', description: 'Worst peak-to-trough decline, hedges limiting downside' },
    { label: 'Value at Risk (95%)', value: 4.5, benchmark: 12.0, unit: '%', status: 'medium', description: 'Daily VaR at 95% confidence interval' },
    { label: 'Correlation to Market', value: 0.28, benchmark: 1.0, unit: '', status: 'low', description: 'Low correlation to broad card market index' },
    { label: 'Hedge Effectiveness', value: 78, benchmark: 70, unit: '%', status: 'low', description: 'Percentage of downside risk offset by hedge positions' },
    { label: 'Liquidity Score', value: 82, benchmark: 75, unit: '/100', status: 'low', description: 'Weighted average liquidity of hedge portfolio' },
    { label: 'Rebalance Urgency', value: 35, benchmark: 50, unit: '/100', status: 'low', description: 'Current drift from target allocations' },
  ];

  return {
    id: 'portfolio-optimal',
    name: 'Optimal Hedge Portfolio',
    pairs: selectedPairs,
    totalValue,
    netExposure: exposure,
    expectedReturn: parseFloat((selectedPairs.reduce((s, p) => s + p.expectedReturn, 0) / selectedPairs.length).toFixed(2)),
    portfolioSharpe: 1.85,
    protectionLevel: 78,
    riskMetrics,
    rebalanceFrequency: 'bi-weekly',
  };
}

export function getHedgeRecommendations(): HedgeRecommendation[] {
  return [
    { id: 'rec1', title: 'Add QB Rivalry Hedge', description: 'Your Allen exposure is unhedged. Pair with Mahomes short to capture AFC Championship rivalry dynamics.', strategy: 'pair-trade', longCardId: 'c2', shortCardId: 'c4', expectedBenefit: 8.2, urgency: 'high', rationale: 'Strong negative correlation of -0.55 during playoff months' },
    { id: 'rec2', title: 'Protect Doncic with Trae Young Short', description: 'Draft-class substitution effect creates reliable mean-reversion pair.', strategy: 'pair-trade', longCardId: 'c8', shortCardId: 'c11', expectedBenefit: 11.5, urgency: 'high', rationale: '2018 draft swap narrative creates persistent -0.52 correlation' },
    { id: 'rec3', title: 'Tail Risk: Insure Trout with Tatis Short', description: 'Cheap insurance against MLB star-card selloff using Tatis suspension risk as hedge.', strategy: 'tail-risk', longCardId: 'c14', shortCardId: 'c13', expectedBenefit: 3.1, urgency: 'medium', rationale: 'Tatis headline risk provides asymmetric downside protection' },
    { id: 'rec4', title: 'Calendar Spread: Edwards vs Morant', description: 'Generational transition creates calendar divergence opportunity.', strategy: 'calendar-spread', longCardId: 'c24', shortCardId: 'c7', expectedBenefit: 14.2, urgency: 'medium', rationale: 'Edwards ascending while Morant faces off-court headwinds' },
    { id: 'rec5', title: 'Blue-Chip Basket: Jordan + Brady', description: 'Ultra-stable GOAT basket for capital preservation. Near-zero residual risk.', strategy: 'basket-hedge', longCardId: 'c21', shortCardId: 'c20', expectedBenefit: 1.8, urgency: 'low', rationale: 'Both assets exhibit sub-0.35 beta and 0.45 positive correlation — capital preservation play' },
    { id: 'rec6', title: 'NHL Rivalry: McDavid vs Matthews', description: 'Hart Trophy narrative drives annual inverse movement between Edmonton and Toronto.', strategy: 'pair-trade', longCardId: 'c17', shortCardId: 'c18', expectedBenefit: 7.5, urgency: 'medium', rationale: 'Strong -0.60 correlation, high confidence pair' },
  ];
}

// ─── Utility Exports ─────────────────────────────────────────────────────────

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export function formatPct(value: number, decimals: number = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

export function strategyLabel(s: HedgeStrategy): string {
  switch (s) {
    case 'pair-trade': return 'Pair Trade';
    case 'basket-hedge': return 'Basket Hedge';
    case 'tail-risk': return 'Tail Risk';
    case 'calendar-spread': return 'Calendar Spread';
  }
}

export function strategyColor(s: HedgeStrategy): string {
  switch (s) {
    case 'pair-trade': return '#3b82f6';
    case 'basket-hedge': return '#22c55e';
    case 'tail-risk': return '#ef4444';
    case 'calendar-spread': return '#f59e0b';
  }
}

export function riskColor(r: RiskLevel): string {
  switch (r) {
    case 'low': return 'text-green-400';
    case 'medium': return 'text-yellow-400';
    case 'high': return 'text-orange-400';
    case 'critical': return 'text-red-400';
  }
}

export function riskBg(r: RiskLevel): string {
  switch (r) {
    case 'low': return 'bg-green-500/10 border-green-500/20';
    case 'medium': return 'bg-yellow-500/10 border-yellow-500/20';
    case 'high': return 'bg-orange-500/10 border-orange-500/20';
    case 'critical': return 'bg-red-500/10 border-red-500/20';
  }
}
