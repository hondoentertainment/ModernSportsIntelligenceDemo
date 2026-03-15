// Predictive Price Engine Service
// AI-powered forecasting with multi-model ensemble predictions, catalyst analysis, and seasonal patterns

// ---- Types ----

export type ForecastHorizon = '7d' | '30d' | '90d' | '6m' | '1y';
export type ModelType = 'time_series' | 'ml_ensemble' | 'sentiment' | 'composite';
export type TrendSignal = 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
export type CatalystType = 'performance' | 'injury' | 'trade' | 'award' | 'rookie_debut' | 'retirement' | 'media' | 'population';

export interface PriceForecast {
  id: string;
  cardName: string;
  player: string;
  year: number;
  set: string;
  grade: string;
  currentPrice: number;
  forecasts: {
    horizon: ForecastHorizon;
    predicted: number;
    low: number;
    high: number;
    confidence: number;
    model: ModelType;
    changePercent: number;
  }[];
  signal: TrendSignal;
  signalStrength: number;
  catalysts: PriceCatalyst[];
  lastUpdated: string;
}

export interface PriceCatalyst {
  id: string;
  type: CatalystType;
  title: string;
  description: string;
  impact: number; // -100 to 100
  probability: number; // 0-100
  expectedDate: string;
  affectedPlayers: string[];
}

export interface ModelPerformance {
  model: ModelType;
  accuracy7d: number;
  accuracy30d: number;
  accuracy90d: number;
  mape: number; // Mean Absolute Percentage Error
  sharpeRatio: number;
  totalPredictions: number;
  profitablePredictions: number;
  avgReturnOnSignal: number;
}

export interface SeasonalPattern {
  month: string;
  avgReturn: number;
  winRate: number;
  volume: number;
  bestSport: string;
  pattern: string;
}

export interface PlayerForecast {
  player: string;
  sport: string;
  currentTrend: TrendSignal;
  priceChangeYTD: number;
  upcomingCatalysts: number;
  portfolioImpact: number;
  forecastSummary: string;
}

export interface ForecastAccuracy {
  date: string;
  predicted: number;
  actual: number;
  error: number;
}

export interface MarketRegime {
  current: 'bull' | 'bear' | 'sideways' | 'volatile';
  strength: number;
  duration: string;
  historicalAvgDuration: string;
  transitionProbability: { bull: number; bear: number; sideways: number };
}

export interface PortfolioForecastSummary {
  totalCurrentValue: number;
  totalPredictedValue: number;
  expectedReturn: number;
  expectedReturnPercent: number;
  strongBuyCount: number;
  buyCount: number;
  holdCount: number;
  sellCount: number;
  strongSellCount: number;
  avgConfidence: number;
  topPick: string;
  topPickReturn: number;
  worstPick: string;
  worstPickReturn: number;
  riskScore: number;
}

export interface PriceCorrelation {
  playerA: string;
  playerB: string;
  correlation: number;
  period: string;
  significance: 'high' | 'medium' | 'low';
}

export interface ForecastAlert {
  id: string;
  type: 'breakout' | 'breakdown' | 'catalyst_trigger' | 'confidence_shift' | 'regime_change';
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  player: string;
  timestamp: string;
  actionable: boolean;
}

// ---- Constants ----

const STORAGE_PREFIX = 'msi_predictive_engine';

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

// ---- Mock Data: Catalysts ----

const MOCK_CATALYSTS: PriceCatalyst[] = [
  {
    id: 'cat_001',
    type: 'performance',
    title: 'Victor Wembanyama All-Star Selection',
    description: 'Expected first All-Star nod could drive significant price appreciation for rookie cards.',
    impact: 45,
    probability: 78,
    expectedDate: '2026-02-15',
    affectedPlayers: ['Victor Wembanyama'],
  },
  {
    id: 'cat_002',
    type: 'award',
    title: 'Shohei Ohtani MVP Race Heats Up',
    description: 'Dominant two-way performance positions Ohtani as front-runner for NL MVP, boosting card values.',
    impact: 55,
    probability: 65,
    expectedDate: '2026-09-30',
    affectedPlayers: ['Shohei Ohtani'],
  },
  {
    id: 'cat_003',
    type: 'injury',
    title: 'Ja Morant Injury Scare',
    description: 'Reports of knee soreness during practice could suppress short-term prices.',
    impact: -35,
    probability: 40,
    expectedDate: '2026-04-01',
    affectedPlayers: ['Ja Morant'],
  },
  {
    id: 'cat_004',
    type: 'trade',
    title: 'Potential Blockbuster NBA Trade Deadline Deals',
    description: 'Several star players rumored to be on the move, creating volatility in card markets.',
    impact: 30,
    probability: 55,
    expectedDate: '2026-02-06',
    affectedPlayers: ['Luka Doncic', 'Ja Morant'],
  },
  {
    id: 'cat_005',
    type: 'rookie_debut',
    title: 'Caleb Williams Sophomore Season Surge',
    description: 'Second-year breakout potential after strong rookie campaign could boost card values.',
    impact: 40,
    probability: 60,
    expectedDate: '2026-09-07',
    affectedPlayers: ['Caleb Williams'],
  },
  {
    id: 'cat_006',
    type: 'retirement',
    title: 'LeBron James Retirement Watch',
    description: 'Approaching final seasons, any retirement hints would cause massive price spikes for legacy cards.',
    impact: 70,
    probability: 25,
    expectedDate: '2026-06-15',
    affectedPlayers: ['LeBron James'],
  },
  {
    id: 'cat_007',
    type: 'media',
    title: 'Patrick Mahomes Netflix Documentary',
    description: 'Upcoming documentary release expected to drive mainstream interest and card demand.',
    impact: 25,
    probability: 90,
    expectedDate: '2026-05-01',
    affectedPlayers: ['Patrick Mahomes'],
  },
  {
    id: 'cat_008',
    type: 'population',
    title: 'PSA 10 Pop Report Surge for 2023 Bowman Chrome',
    description: 'Rising population counts may pressure prices downward for previously scarce cards.',
    impact: -20,
    probability: 85,
    expectedDate: '2026-04-15',
    affectedPlayers: ['Jackson Holliday', 'Paul Skenes'],
  },
  {
    id: 'cat_009',
    type: 'performance',
    title: 'Connor McDavid Stanley Cup Run',
    description: 'Deep playoff run by Edmonton could drive hockey card demand significantly.',
    impact: 50,
    probability: 45,
    expectedDate: '2026-06-01',
    affectedPlayers: ['Connor McDavid'],
  },
  {
    id: 'cat_010',
    type: 'award',
    title: 'Caitlin Clark WNBA MVP Candidacy',
    description: 'Continued dominance in sophomore WNBA season positions Clark for MVP conversation.',
    impact: 60,
    probability: 50,
    expectedDate: '2026-09-15',
    affectedPlayers: ['Caitlin Clark'],
  },
  {
    id: 'cat_011',
    type: 'rookie_debut',
    title: 'Cooper Flagg NBA Draft #1 Pick',
    description: 'Consensus top pick debut will create massive demand for pre-NBA and rookie cards.',
    impact: 65,
    probability: 92,
    expectedDate: '2026-06-26',
    affectedPlayers: ['Cooper Flagg'],
  },
  {
    id: 'cat_012',
    type: 'performance',
    title: 'Tyrese Haliburton Triple-Double Streak',
    description: 'Elite playmaking numbers driving increased collector interest.',
    impact: 30,
    probability: 35,
    expectedDate: '2026-03-20',
    affectedPlayers: ['Tyrese Haliburton'],
  },
  {
    id: 'cat_013',
    type: 'media',
    title: 'Mike Trout Comeback Narrative',
    description: 'Return from injury with strong spring training creating renewed excitement.',
    impact: 35,
    probability: 55,
    expectedDate: '2026-03-25',
    affectedPlayers: ['Mike Trout'],
  },
  {
    id: 'cat_014',
    type: 'trade',
    title: 'Juan Soto Free Agency Impact',
    description: 'Record contract driving sustained interest in flagship cards.',
    impact: 40,
    probability: 95,
    expectedDate: '2026-04-01',
    affectedPlayers: ['Juan Soto'],
  },
  {
    id: 'cat_015',
    type: 'population',
    title: 'BGS 9.5 Scarcity for 2020 Prizm Football',
    description: 'Low gem mint population keeping prices elevated for key rookies.',
    impact: 25,
    probability: 80,
    expectedDate: '2026-05-15',
    affectedPlayers: ['Justin Herbert', 'Joe Burrow'],
  },
  {
    id: 'cat_016',
    type: 'performance',
    title: 'Anthony Edwards Scoring Title Push',
    description: 'Elite scoring season could position Edwards as face of the NBA, boosting all cards.',
    impact: 45,
    probability: 40,
    expectedDate: '2026-04-10',
    affectedPlayers: ['Anthony Edwards'],
  },
];

// ---- Mock Data: Price Forecasts ----

function makeForecast(
  id: string,
  cardName: string,
  player: string,
  year: number,
  set: string,
  grade: string,
  currentPrice: number,
  signal: TrendSignal,
  signalStrength: number,
  catalystIds: string[],
  forecasts: { horizon: ForecastHorizon; predicted: number; low: number; high: number; confidence: number; model: ModelType; changePercent: number }[]
): PriceForecast {
  return {
    id,
    cardName,
    player,
    year,
    set,
    grade,
    currentPrice,
    forecasts,
    signal,
    signalStrength,
    catalysts: MOCK_CATALYSTS.filter(c => catalystIds.includes(c.id)),
    lastUpdated: '2026-03-15T10:00:00Z',
  };
}

const MOCK_FORECASTS: PriceForecast[] = [
  makeForecast('fc_001', '2023 Prizm Victor Wembanyama RC #1 PSA 10', 'Victor Wembanyama', 2023, 'Prizm', 'PSA 10', 4850, 'strong_buy', 92, ['cat_001'], [
    { horizon: '7d', predicted: 4920, low: 4750, high: 5100, confidence: 88, model: 'composite', changePercent: 1.4 },
    { horizon: '30d', predicted: 5350, low: 4900, high: 5800, confidence: 82, model: 'ml_ensemble', changePercent: 10.3 },
    { horizon: '90d', predicted: 6200, low: 5400, high: 7200, confidence: 74, model: 'ml_ensemble', changePercent: 27.8 },
    { horizon: '6m', predicted: 7500, low: 5800, high: 9500, confidence: 65, model: 'time_series', changePercent: 54.6 },
    { horizon: '1y', predicted: 9800, low: 6500, high: 14000, confidence: 52, model: 'composite', changePercent: 102.1 },
  ]),
  makeForecast('fc_002', '2018 Topps Update Shohei Ohtani RC #US1 PSA 10', 'Shohei Ohtani', 2018, 'Topps Update', 'PSA 10', 1250, 'buy', 78, ['cat_002'], [
    { horizon: '7d', predicted: 1270, low: 1220, high: 1320, confidence: 85, model: 'composite', changePercent: 1.6 },
    { horizon: '30d', predicted: 1380, low: 1280, high: 1500, confidence: 79, model: 'sentiment', changePercent: 10.4 },
    { horizon: '90d', predicted: 1550, low: 1350, high: 1800, confidence: 71, model: 'ml_ensemble', changePercent: 24.0 },
    { horizon: '6m', predicted: 1750, low: 1400, high: 2200, confidence: 62, model: 'time_series', changePercent: 40.0 },
    { horizon: '1y', predicted: 2100, low: 1500, high: 2900, confidence: 50, model: 'composite', changePercent: 68.0 },
  ]),
  makeForecast('fc_003', '2019 Prizm Ja Morant RC #249 PSA 10', 'Ja Morant', 2019, 'Prizm', 'PSA 10', 320, 'sell', 68, ['cat_003', 'cat_004'], [
    { horizon: '7d', predicted: 310, low: 290, high: 330, confidence: 80, model: 'sentiment', changePercent: -3.1 },
    { horizon: '30d', predicted: 280, low: 240, high: 320, confidence: 72, model: 'composite', changePercent: -12.5 },
    { horizon: '90d', predicted: 260, low: 200, high: 330, confidence: 60, model: 'ml_ensemble', changePercent: -18.8 },
    { horizon: '6m', predicted: 290, low: 210, high: 380, confidence: 50, model: 'time_series', changePercent: -9.4 },
    { horizon: '1y', predicted: 350, low: 230, high: 500, confidence: 42, model: 'composite', changePercent: 9.4 },
  ]),
  makeForecast('fc_004', '2018 Panini Prizm Luka Doncic RC #280 PSA 10', 'Luka Doncic', 2018, 'Prizm', 'PSA 10', 3200, 'hold', 55, ['cat_004'], [
    { horizon: '7d', predicted: 3210, low: 3100, high: 3320, confidence: 86, model: 'time_series', changePercent: 0.3 },
    { horizon: '30d', predicted: 3280, low: 3050, high: 3500, confidence: 78, model: 'composite', changePercent: 2.5 },
    { horizon: '90d', predicted: 3350, low: 2900, high: 3800, confidence: 68, model: 'ml_ensemble', changePercent: 4.7 },
    { horizon: '6m', predicted: 3500, low: 2800, high: 4300, confidence: 58, model: 'time_series', changePercent: 9.4 },
    { horizon: '1y', predicted: 3800, low: 2700, high: 5200, confidence: 48, model: 'composite', changePercent: 18.8 },
  ]),
  makeForecast('fc_005', '2017 Panini Prizm Patrick Mahomes RC #269 PSA 10', 'Patrick Mahomes', 2017, 'Prizm', 'PSA 10', 18500, 'buy', 75, ['cat_007'], [
    { horizon: '7d', predicted: 18700, low: 18200, high: 19200, confidence: 84, model: 'composite', changePercent: 1.1 },
    { horizon: '30d', predicted: 19500, low: 18000, high: 21000, confidence: 76, model: 'sentiment', changePercent: 5.4 },
    { horizon: '90d', predicted: 21000, low: 18500, high: 24000, confidence: 67, model: 'ml_ensemble', changePercent: 13.5 },
    { horizon: '6m', predicted: 22500, low: 18000, high: 28000, confidence: 58, model: 'composite', changePercent: 21.6 },
    { horizon: '1y', predicted: 25000, low: 17500, high: 35000, confidence: 47, model: 'time_series', changePercent: 35.1 },
  ]),
  makeForecast('fc_006', '2003 Topps Chrome LeBron James RC #111 PSA 10', 'LeBron James', 2003, 'Topps Chrome', 'PSA 10', 52000, 'strong_buy', 88, ['cat_006'], [
    { horizon: '7d', predicted: 52500, low: 51000, high: 54000, confidence: 90, model: 'composite', changePercent: 1.0 },
    { horizon: '30d', predicted: 55000, low: 50000, high: 60000, confidence: 83, model: 'ml_ensemble', changePercent: 5.8 },
    { horizon: '90d', predicted: 62000, low: 52000, high: 75000, confidence: 72, model: 'sentiment', changePercent: 19.2 },
    { horizon: '6m', predicted: 70000, low: 55000, high: 90000, confidence: 60, model: 'composite', changePercent: 34.6 },
    { horizon: '1y', predicted: 85000, low: 58000, high: 120000, confidence: 50, model: 'time_series', changePercent: 63.5 },
  ]),
  makeForecast('fc_007', '2023 Bowman Chrome Jackson Holliday RC #BCP-1 PSA 10', 'Jackson Holliday', 2023, 'Bowman Chrome', 'PSA 10', 185, 'sell', 62, ['cat_008'], [
    { horizon: '7d', predicted: 180, low: 170, high: 190, confidence: 82, model: 'time_series', changePercent: -2.7 },
    { horizon: '30d', predicted: 165, low: 145, high: 185, confidence: 73, model: 'composite', changePercent: -10.8 },
    { horizon: '90d', predicted: 150, low: 120, high: 190, confidence: 60, model: 'ml_ensemble', changePercent: -18.9 },
    { horizon: '6m', predicted: 160, low: 110, high: 220, confidence: 48, model: 'sentiment', changePercent: -13.5 },
    { horizon: '1y', predicted: 200, low: 120, high: 300, confidence: 38, model: 'composite', changePercent: 8.1 },
  ]),
  makeForecast('fc_008', '2015 Upper Deck Connor McDavid Young Guns RC #201 PSA 10', 'Connor McDavid', 2015, 'Upper Deck Young Guns', 'PSA 10', 850, 'buy', 72, ['cat_009'], [
    { horizon: '7d', predicted: 860, low: 835, high: 885, confidence: 86, model: 'composite', changePercent: 1.2 },
    { horizon: '30d', predicted: 920, low: 860, high: 990, confidence: 78, model: 'ml_ensemble', changePercent: 8.2 },
    { horizon: '90d', predicted: 1050, low: 880, high: 1250, confidence: 68, model: 'sentiment', changePercent: 23.5 },
    { horizon: '6m', predicted: 1150, low: 850, high: 1500, confidence: 55, model: 'time_series', changePercent: 35.3 },
    { horizon: '1y', predicted: 1300, low: 800, high: 1900, confidence: 44, model: 'composite', changePercent: 52.9 },
  ]),
  makeForecast('fc_009', '2024 Panini Prizm Caitlin Clark RC #101 PSA 10', 'Caitlin Clark', 2024, 'Prizm', 'PSA 10', 420, 'strong_buy', 85, ['cat_010'], [
    { horizon: '7d', predicted: 435, low: 410, high: 460, confidence: 87, model: 'composite', changePercent: 3.6 },
    { horizon: '30d', predicted: 500, low: 440, high: 570, confidence: 80, model: 'sentiment', changePercent: 19.0 },
    { horizon: '90d', predicted: 620, low: 480, high: 780, confidence: 70, model: 'ml_ensemble', changePercent: 47.6 },
    { horizon: '6m', predicted: 750, low: 500, high: 1050, confidence: 58, model: 'composite', changePercent: 78.6 },
    { horizon: '1y', predicted: 950, low: 500, high: 1500, confidence: 45, model: 'time_series', changePercent: 126.2 },
  ]),
  makeForecast('fc_010', '2024 Bowman Chrome Paul Skenes RC #BDC-150 PSA 10', 'Paul Skenes', 2024, 'Bowman Chrome', 'PSA 10', 310, 'buy', 70, ['cat_008'], [
    { horizon: '7d', predicted: 315, low: 300, high: 330, confidence: 84, model: 'time_series', changePercent: 1.6 },
    { horizon: '30d', predicted: 340, low: 310, high: 380, confidence: 76, model: 'composite', changePercent: 9.7 },
    { horizon: '90d', predicted: 400, low: 330, high: 480, confidence: 66, model: 'ml_ensemble', changePercent: 29.0 },
    { horizon: '6m', predicted: 450, low: 320, high: 600, confidence: 54, model: 'sentiment', changePercent: 45.2 },
    { horizon: '1y', predicted: 520, low: 300, high: 800, confidence: 42, model: 'composite', changePercent: 67.7 },
  ]),
  makeForecast('fc_011', '2020 Panini Prizm Justin Herbert RC #325 PSA 10', 'Justin Herbert', 2020, 'Prizm', 'PSA 10', 480, 'hold', 50, ['cat_015'], [
    { horizon: '7d', predicted: 482, low: 465, high: 500, confidence: 85, model: 'composite', changePercent: 0.4 },
    { horizon: '30d', predicted: 490, low: 455, high: 525, confidence: 77, model: 'time_series', changePercent: 2.1 },
    { horizon: '90d', predicted: 500, low: 430, high: 580, confidence: 66, model: 'ml_ensemble', changePercent: 4.2 },
    { horizon: '6m', predicted: 520, low: 400, high: 660, confidence: 55, model: 'composite', changePercent: 8.3 },
    { horizon: '1y', predicted: 560, low: 380, high: 780, confidence: 44, model: 'time_series', changePercent: 16.7 },
  ]),
  makeForecast('fc_012', '2020 Panini Prizm Joe Burrow RC #307 PSA 10', 'Joe Burrow', 2020, 'Prizm', 'PSA 10', 620, 'buy', 73, ['cat_015'], [
    { horizon: '7d', predicted: 630, low: 610, high: 650, confidence: 86, model: 'composite', changePercent: 1.6 },
    { horizon: '30d', predicted: 670, low: 620, high: 730, confidence: 78, model: 'ml_ensemble', changePercent: 8.1 },
    { horizon: '90d', predicted: 740, low: 640, high: 860, confidence: 68, model: 'sentiment', changePercent: 19.4 },
    { horizon: '6m', predicted: 820, low: 620, high: 1050, confidence: 56, model: 'composite', changePercent: 32.3 },
    { horizon: '1y', predicted: 950, low: 600, high: 1400, confidence: 45, model: 'time_series', changePercent: 53.2 },
  ]),
  makeForecast('fc_013', '2022 Topps Chrome Caleb Williams College RC PSA 10', 'Caleb Williams', 2022, 'Topps Chrome', 'PSA 10', 145, 'hold', 48, ['cat_005'], [
    { horizon: '7d', predicted: 146, low: 138, high: 154, confidence: 82, model: 'time_series', changePercent: 0.7 },
    { horizon: '30d', predicted: 152, low: 135, high: 170, confidence: 73, model: 'composite', changePercent: 4.8 },
    { horizon: '90d', predicted: 165, low: 130, high: 210, confidence: 62, model: 'ml_ensemble', changePercent: 13.8 },
    { horizon: '6m', predicted: 190, low: 120, high: 280, confidence: 50, model: 'sentiment', changePercent: 31.0 },
    { horizon: '1y', predicted: 230, low: 110, high: 380, confidence: 38, model: 'composite', changePercent: 58.6 },
  ]),
  makeForecast('fc_014', '2021 Panini Prizm Anthony Edwards RC #258 PSA 10', 'Anthony Edwards', 2021, 'Prizm', 'PSA 10', 720, 'strong_buy', 90, ['cat_016'], [
    { horizon: '7d', predicted: 740, low: 710, high: 770, confidence: 89, model: 'composite', changePercent: 2.8 },
    { horizon: '30d', predicted: 820, low: 740, high: 910, confidence: 82, model: 'ml_ensemble', changePercent: 13.9 },
    { horizon: '90d', predicted: 980, low: 800, high: 1200, confidence: 73, model: 'sentiment', changePercent: 36.1 },
    { horizon: '6m', predicted: 1150, low: 820, high: 1550, confidence: 62, model: 'composite', changePercent: 59.7 },
    { horizon: '1y', predicted: 1400, low: 800, high: 2200, confidence: 50, model: 'time_series', changePercent: 94.4 },
  ]),
  makeForecast('fc_015', '2022 Panini Prizm Tyrese Haliburton #35 PSA 10', 'Tyrese Haliburton', 2022, 'Prizm', 'PSA 10', 95, 'buy', 65, ['cat_012'], [
    { horizon: '7d', predicted: 97, low: 92, high: 102, confidence: 83, model: 'composite', changePercent: 2.1 },
    { horizon: '30d', predicted: 105, low: 92, high: 118, confidence: 75, model: 'ml_ensemble', changePercent: 10.5 },
    { horizon: '90d', predicted: 118, low: 88, high: 150, confidence: 64, model: 'sentiment', changePercent: 24.2 },
    { horizon: '6m', predicted: 130, low: 82, high: 185, confidence: 52, model: 'time_series', changePercent: 36.8 },
    { horizon: '1y', predicted: 155, low: 75, high: 250, confidence: 40, model: 'composite', changePercent: 63.2 },
  ]),
  makeForecast('fc_016', '2014 Topps Update Mike Trout #US-1 PSA 10', 'Mike Trout', 2014, 'Topps Update', 'PSA 10', 2800, 'hold', 52, ['cat_013'], [
    { horizon: '7d', predicted: 2810, low: 2750, high: 2870, confidence: 87, model: 'time_series', changePercent: 0.4 },
    { horizon: '30d', predicted: 2850, low: 2700, high: 3000, confidence: 79, model: 'composite', changePercent: 1.8 },
    { horizon: '90d', predicted: 2950, low: 2600, high: 3350, confidence: 69, model: 'ml_ensemble', changePercent: 5.4 },
    { horizon: '6m', predicted: 3100, low: 2500, high: 3800, confidence: 57, model: 'sentiment', changePercent: 10.7 },
    { horizon: '1y', predicted: 3350, low: 2400, high: 4500, confidence: 46, model: 'composite', changePercent: 19.6 },
  ]),
  makeForecast('fc_017', '2019 Topps Chrome Juan Soto RC #203 PSA 10', 'Juan Soto', 2019, 'Topps Chrome', 'PSA 10', 580, 'buy', 74, ['cat_014'], [
    { horizon: '7d', predicted: 590, low: 570, high: 610, confidence: 85, model: 'composite', changePercent: 1.7 },
    { horizon: '30d', predicted: 640, low: 590, high: 700, confidence: 77, model: 'sentiment', changePercent: 10.3 },
    { horizon: '90d', predicted: 720, low: 610, high: 850, confidence: 67, model: 'ml_ensemble', changePercent: 24.1 },
    { horizon: '6m', predicted: 800, low: 580, high: 1050, confidence: 56, model: 'composite', changePercent: 37.9 },
    { horizon: '1y', predicted: 920, low: 550, high: 1350, confidence: 44, model: 'time_series', changePercent: 58.6 },
  ]),
  makeForecast('fc_018', '2025 Bowman Draft Cooper Flagg #BD-1 PSA 10', 'Cooper Flagg', 2025, 'Bowman Draft', 'PSA 10', 250, 'strong_buy', 86, ['cat_011'], [
    { horizon: '7d', predicted: 260, low: 245, high: 280, confidence: 85, model: 'composite', changePercent: 4.0 },
    { horizon: '30d', predicted: 310, low: 265, high: 360, confidence: 78, model: 'ml_ensemble', changePercent: 24.0 },
    { horizon: '90d', predicted: 420, low: 300, high: 560, confidence: 68, model: 'sentiment', changePercent: 68.0 },
    { horizon: '6m', predicted: 580, low: 350, high: 850, confidence: 55, model: 'composite', changePercent: 132.0 },
    { horizon: '1y', predicted: 750, low: 350, high: 1300, confidence: 42, model: 'time_series', changePercent: 200.0 },
  ]),
  makeForecast('fc_019', '2022 Topps Chrome Julio Rodriguez RC #164 PSA 10', 'Julio Rodriguez', 2022, 'Topps Chrome', 'PSA 10', 165, 'hold', 48, [], [
    { horizon: '7d', predicted: 166, low: 158, high: 174, confidence: 84, model: 'time_series', changePercent: 0.6 },
    { horizon: '30d', predicted: 170, low: 155, high: 188, confidence: 76, model: 'composite', changePercent: 3.0 },
    { horizon: '90d', predicted: 180, low: 148, high: 220, confidence: 65, model: 'ml_ensemble', changePercent: 9.1 },
    { horizon: '6m', predicted: 195, low: 140, high: 260, confidence: 53, model: 'sentiment', changePercent: 18.2 },
    { horizon: '1y', predicted: 220, low: 130, high: 330, confidence: 41, model: 'composite', changePercent: 33.3 },
  ]),
  makeForecast('fc_020', '2022 Panini Prizm Paolo Banchero RC #301 PSA 10', 'Paolo Banchero', 2022, 'Prizm', 'PSA 10', 135, 'sell', 60, [], [
    { horizon: '7d', predicted: 132, low: 125, high: 140, confidence: 83, model: 'composite', changePercent: -2.2 },
    { horizon: '30d', predicted: 122, low: 108, high: 138, confidence: 74, model: 'ml_ensemble', changePercent: -9.6 },
    { horizon: '90d', predicted: 115, low: 92, high: 145, confidence: 62, model: 'sentiment', changePercent: -14.8 },
    { horizon: '6m', predicted: 120, low: 85, high: 165, confidence: 50, model: 'time_series', changePercent: -11.1 },
    { horizon: '1y', predicted: 140, low: 80, high: 210, confidence: 39, model: 'composite', changePercent: 3.7 },
  ]),
  makeForecast('fc_021', '2023 Topps Chrome Elly De La Cruz RC #220 PSA 10', 'Elly De La Cruz', 2023, 'Topps Chrome', 'PSA 10', 210, 'buy', 71, [], [
    { horizon: '7d', predicted: 215, low: 205, high: 226, confidence: 85, model: 'composite', changePercent: 2.4 },
    { horizon: '30d', predicted: 235, low: 210, high: 265, confidence: 77, model: 'ml_ensemble', changePercent: 11.9 },
    { horizon: '90d', predicted: 270, low: 220, high: 330, confidence: 67, model: 'sentiment', changePercent: 28.6 },
    { horizon: '6m', predicted: 310, low: 220, high: 420, confidence: 55, model: 'composite', changePercent: 47.6 },
    { horizon: '1y', predicted: 380, low: 210, high: 580, confidence: 43, model: 'time_series', changePercent: 81.0 },
  ]),
  makeForecast('fc_022', '2019 Panini Prizm Zion Williamson RC #248 PSA 10', 'Zion Williamson', 2019, 'Prizm', 'PSA 10', 380, 'strong_sell', 80, [], [
    { horizon: '7d', predicted: 370, low: 350, high: 390, confidence: 84, model: 'composite', changePercent: -2.6 },
    { horizon: '30d', predicted: 340, low: 300, high: 380, confidence: 76, model: 'ml_ensemble', changePercent: -10.5 },
    { horizon: '90d', predicted: 300, low: 240, high: 370, confidence: 65, model: 'sentiment', changePercent: -21.1 },
    { horizon: '6m', predicted: 260, low: 190, high: 350, confidence: 54, model: 'time_series', changePercent: -31.6 },
    { horizon: '1y', predicted: 230, low: 150, high: 340, confidence: 42, model: 'composite', changePercent: -39.5 },
  ]),
  makeForecast('fc_023', '2018 Topps Chrome Ronald Acuna Jr. RC #193 PSA 10', 'Ronald Acuna Jr.', 2018, 'Topps Chrome', 'PSA 10', 680, 'buy', 69, [], [
    { horizon: '7d', predicted: 690, low: 670, high: 710, confidence: 85, model: 'composite', changePercent: 1.5 },
    { horizon: '30d', predicted: 730, low: 680, high: 790, confidence: 77, model: 'ml_ensemble', changePercent: 7.4 },
    { horizon: '90d', predicted: 800, low: 690, high: 930, confidence: 67, model: 'sentiment', changePercent: 17.6 },
    { horizon: '6m', predicted: 880, low: 660, high: 1120, confidence: 55, model: 'time_series', changePercent: 29.4 },
    { horizon: '1y', predicted: 1000, low: 620, high: 1450, confidence: 43, model: 'composite', changePercent: 47.1 },
  ]),
  makeForecast('fc_024', '2019 Panini Mosaic Trae Young RC #242 PSA 10', 'Trae Young', 2019, 'Mosaic', 'PSA 10', 210, 'hold', 45, [], [
    { horizon: '7d', predicted: 211, low: 200, high: 222, confidence: 83, model: 'time_series', changePercent: 0.5 },
    { horizon: '30d', predicted: 215, low: 195, high: 238, confidence: 74, model: 'composite', changePercent: 2.4 },
    { horizon: '90d', predicted: 225, low: 185, high: 270, confidence: 63, model: 'ml_ensemble', changePercent: 7.1 },
    { horizon: '6m', predicted: 240, low: 175, high: 315, confidence: 51, model: 'sentiment', changePercent: 14.3 },
    { horizon: '1y', predicted: 265, low: 165, high: 385, confidence: 40, model: 'composite', changePercent: 26.2 },
  ]),
  makeForecast('fc_025', '2018 Panini National Treasures Saquon Barkley RPA /99 BGS 9.5', 'Saquon Barkley', 2018, 'National Treasures', 'BGS 9.5', 1450, 'sell', 58, [], [
    { horizon: '7d', predicted: 1420, low: 1370, high: 1470, confidence: 82, model: 'composite', changePercent: -2.1 },
    { horizon: '30d', predicted: 1350, low: 1250, high: 1460, confidence: 73, model: 'ml_ensemble', changePercent: -6.9 },
    { horizon: '90d', predicted: 1280, low: 1100, high: 1480, confidence: 62, model: 'sentiment', changePercent: -11.7 },
    { horizon: '6m', predicted: 1220, low: 980, high: 1520, confidence: 50, model: 'time_series', changePercent: -15.9 },
    { horizon: '1y', predicted: 1300, low: 900, high: 1750, confidence: 39, model: 'composite', changePercent: -10.3 },
  ]),
  makeForecast('fc_026', '2019 Topps Chrome Yordan Alvarez RC #204 PSA 10', 'Yordan Alvarez', 2019, 'Topps Chrome', 'PSA 10', 290, 'buy', 66, [], [
    { horizon: '7d', predicted: 295, low: 282, high: 308, confidence: 84, model: 'time_series', changePercent: 1.7 },
    { horizon: '30d', predicted: 315, low: 288, high: 345, confidence: 76, model: 'composite', changePercent: 8.6 },
    { horizon: '90d', predicted: 350, low: 290, high: 420, confidence: 65, model: 'ml_ensemble', changePercent: 20.7 },
    { horizon: '6m', predicted: 390, low: 280, high: 520, confidence: 53, model: 'sentiment', changePercent: 34.5 },
    { horizon: '1y', predicted: 440, low: 260, high: 650, confidence: 41, model: 'composite', changePercent: 51.7 },
  ]),
  makeForecast('fc_027', '2022 Panini Prizm Jayson Tatum #67 PSA 10', 'Jayson Tatum', 2022, 'Prizm', 'PSA 10', 155, 'buy', 67, [], [
    { horizon: '7d', predicted: 158, low: 150, high: 166, confidence: 84, model: 'composite', changePercent: 1.9 },
    { horizon: '30d', predicted: 170, low: 155, high: 188, confidence: 76, model: 'ml_ensemble', changePercent: 9.7 },
    { horizon: '90d', predicted: 190, low: 158, high: 228, confidence: 66, model: 'sentiment', changePercent: 22.6 },
    { horizon: '6m', predicted: 215, low: 150, high: 290, confidence: 54, model: 'time_series', changePercent: 38.7 },
    { horizon: '1y', predicted: 250, low: 140, high: 375, confidence: 42, model: 'composite', changePercent: 61.3 },
  ]),
  makeForecast('fc_028', '2020 Panini Select Justin Jefferson RC #150 PSA 10', 'Justin Jefferson', 2020, 'Select', 'PSA 10', 350, 'hold', 53, [], [
    { horizon: '7d', predicted: 352, low: 340, high: 365, confidence: 86, model: 'time_series', changePercent: 0.6 },
    { horizon: '30d', predicted: 360, low: 335, high: 390, confidence: 78, model: 'composite', changePercent: 2.9 },
    { horizon: '90d', predicted: 375, low: 320, high: 440, confidence: 67, model: 'ml_ensemble', changePercent: 7.1 },
    { horizon: '6m', predicted: 400, low: 310, high: 510, confidence: 55, model: 'sentiment', changePercent: 14.3 },
    { horizon: '1y', predicted: 440, low: 290, high: 620, confidence: 43, model: 'composite', changePercent: 25.7 },
  ]),
  makeForecast('fc_029', '2021 Topps Chrome Bobby Witt Jr. RC #175 PSA 10', 'Bobby Witt Jr.', 2021, 'Topps Chrome', 'PSA 10', 245, 'buy', 68, [], [
    { horizon: '7d', predicted: 250, low: 238, high: 262, confidence: 85, model: 'composite', changePercent: 2.0 },
    { horizon: '30d', predicted: 270, low: 248, high: 298, confidence: 77, model: 'ml_ensemble', changePercent: 10.2 },
    { horizon: '90d', predicted: 310, low: 255, high: 375, confidence: 66, model: 'sentiment', changePercent: 26.5 },
    { horizon: '6m', predicted: 350, low: 240, high: 480, confidence: 54, model: 'time_series', changePercent: 42.9 },
    { horizon: '1y', predicted: 420, low: 230, high: 640, confidence: 42, model: 'composite', changePercent: 71.4 },
  ]),
  makeForecast('fc_030', '2019 Panini Prizm Lamar Jackson RC #203 PSA 10', 'Lamar Jackson', 2019, 'Prizm', 'PSA 10', 520, 'hold', 51, [], [
    { horizon: '7d', predicted: 522, low: 505, high: 540, confidence: 85, model: 'time_series', changePercent: 0.4 },
    { horizon: '30d', predicted: 530, low: 498, high: 568, confidence: 77, model: 'composite', changePercent: 1.9 },
    { horizon: '90d', predicted: 545, low: 475, high: 625, confidence: 66, model: 'ml_ensemble', changePercent: 4.8 },
    { horizon: '6m', predicted: 570, low: 440, high: 720, confidence: 54, model: 'sentiment', changePercent: 9.6 },
    { horizon: '1y', predicted: 610, low: 400, high: 850, confidence: 43, model: 'composite', changePercent: 17.3 },
  ]),
];

// ---- Mock Data: Model Performance ----

const MOCK_MODEL_PERFORMANCE: ModelPerformance[] = [
  {
    model: 'time_series',
    accuracy7d: 89.2,
    accuracy30d: 78.5,
    accuracy90d: 67.3,
    mape: 8.4,
    sharpeRatio: 1.42,
    totalPredictions: 12450,
    profitablePredictions: 8120,
    avgReturnOnSignal: 6.8,
  },
  {
    model: 'ml_ensemble',
    accuracy7d: 91.8,
    accuracy30d: 82.1,
    accuracy90d: 71.6,
    mape: 6.9,
    sharpeRatio: 1.78,
    totalPredictions: 10230,
    profitablePredictions: 7260,
    avgReturnOnSignal: 9.2,
  },
  {
    model: 'sentiment',
    accuracy7d: 84.5,
    accuracy30d: 75.3,
    accuracy90d: 63.8,
    mape: 11.2,
    sharpeRatio: 1.15,
    totalPredictions: 8670,
    profitablePredictions: 5410,
    avgReturnOnSignal: 5.4,
  },
  {
    model: 'composite',
    accuracy7d: 93.4,
    accuracy30d: 85.7,
    accuracy90d: 74.2,
    mape: 5.8,
    sharpeRatio: 2.05,
    totalPredictions: 15380,
    profitablePredictions: 11535,
    avgReturnOnSignal: 11.3,
  },
];

// ---- Mock Data: Seasonal Patterns ----

const MOCK_SEASONAL_PATTERNS: SeasonalPattern[] = [
  { month: 'January', avgReturn: 3.2, winRate: 58, volume: 82000, bestSport: 'Basketball', pattern: 'NBA season peak interest drives basketball card demand' },
  { month: 'February', avgReturn: 1.8, winRate: 54, volume: 78000, bestSport: 'Basketball', pattern: 'All-Star break creates buying opportunities in basketball' },
  { month: 'March', avgReturn: 5.4, winRate: 65, volume: 95000, bestSport: 'Baseball', pattern: 'Spring training and March Madness boost baseball and basketball' },
  { month: 'April', avgReturn: 6.1, winRate: 68, volume: 110000, bestSport: 'Baseball', pattern: 'MLB Opening Day drives massive baseball card demand' },
  { month: 'May', avgReturn: 2.5, winRate: 56, volume: 88000, bestSport: 'Basketball', pattern: 'NBA Playoffs push star player card prices higher' },
  { month: 'June', avgReturn: 4.8, winRate: 62, volume: 102000, bestSport: 'Basketball', pattern: 'NBA Finals and MLB Draft create dual-sport momentum' },
  { month: 'July', avgReturn: -1.2, winRate: 42, volume: 65000, bestSport: 'Baseball', pattern: 'Summer slowdown with reduced collector activity' },
  { month: 'August', avgReturn: -0.8, winRate: 45, volume: 70000, bestSport: 'Football', pattern: 'Pre-season football excitement starts building' },
  { month: 'September', avgReturn: 7.3, winRate: 72, volume: 125000, bestSport: 'Football', pattern: 'NFL kickoff and new product releases drive strongest month' },
  { month: 'October', avgReturn: 4.2, winRate: 60, volume: 105000, bestSport: 'Baseball', pattern: 'MLB Postseason and football momentum sustain high volume' },
  { month: 'November', avgReturn: 2.1, winRate: 53, volume: 92000, bestSport: 'Football', pattern: 'Thanksgiving holiday shopping begins, football dominates' },
  { month: 'December', avgReturn: 1.5, winRate: 51, volume: 85000, bestSport: 'Hockey', pattern: 'Holiday gift buying and Winter Classic boost hockey cards' },
];

// ---- Mock Data: Player Forecasts ----

const MOCK_PLAYER_FORECASTS: PlayerForecast[] = [
  { player: 'Victor Wembanyama', sport: 'Basketball', currentTrend: 'strong_buy', priceChangeYTD: 28.5, upcomingCatalysts: 2, portfolioImpact: 18.2, forecastSummary: 'Generational talent with All-Star trajectory. Strong upside across all card grades.' },
  { player: 'Shohei Ohtani', sport: 'Baseball', currentTrend: 'buy', priceChangeYTD: 15.3, upcomingCatalysts: 1, portfolioImpact: 12.4, forecastSummary: 'Unique two-way player in Dodger blue. MVP candidacy supports sustained demand.' },
  { player: 'Patrick Mahomes', sport: 'Football', currentTrend: 'buy', priceChangeYTD: 8.7, upcomingCatalysts: 1, portfolioImpact: 22.1, forecastSummary: 'Dynasty-era quarterback with documentary catalyst incoming. Blue-chip hold.' },
  { player: 'LeBron James', sport: 'Basketball', currentTrend: 'strong_buy', priceChangeYTD: 12.1, upcomingCatalysts: 1, portfolioImpact: 25.8, forecastSummary: 'Legacy premium increasing as career winds down. Retirement catalyst is asymmetric upside.' },
  { player: 'Caitlin Clark', sport: 'Basketball', currentTrend: 'strong_buy', priceChangeYTD: 45.2, upcomingCatalysts: 1, portfolioImpact: 8.5, forecastSummary: 'Crossover star driving unprecedented WNBA card demand. Sophomore season will be pivotal.' },
  { player: 'Anthony Edwards', sport: 'Basketball', currentTrend: 'strong_buy', priceChangeYTD: 35.8, upcomingCatalysts: 1, portfolioImpact: 14.3, forecastSummary: 'Emerging as face of the NBA. Scoring title push could trigger major repricing.' },
  { player: 'Cooper Flagg', sport: 'Basketball', currentTrend: 'strong_buy', priceChangeYTD: 62.0, upcomingCatalysts: 1, portfolioImpact: 5.2, forecastSummary: 'Pre-draft hype at peak. Draft night will be major catalyst for price discovery.' },
  { player: 'Ja Morant', sport: 'Basketball', currentTrend: 'sell', priceChangeYTD: -18.4, upcomingCatalysts: 2, portfolioImpact: -3.1, forecastSummary: 'Injury concerns and off-court issues weighing on demand. Watch for recovery signals.' },
  { player: 'Connor McDavid', sport: 'Hockey', currentTrend: 'buy', priceChangeYTD: 11.2, upcomingCatalysts: 1, portfolioImpact: 6.8, forecastSummary: 'Generational hockey talent. Playoff run could catalyze crossover collector interest.' },
  { player: 'Zion Williamson', sport: 'Basketball', currentTrend: 'strong_sell', priceChangeYTD: -32.5, upcomingCatalysts: 0, portfolioImpact: -5.7, forecastSummary: 'Chronic injury history eroding long-term confidence. Consider reducing exposure.' },
  { player: 'Juan Soto', sport: 'Baseball', currentTrend: 'buy', priceChangeYTD: 14.8, upcomingCatalysts: 1, portfolioImpact: 7.2, forecastSummary: 'Record contract and prime years ahead. Flagship cards have strong upside.' },
  { player: 'Paul Skenes', sport: 'Baseball', currentTrend: 'buy', priceChangeYTD: 22.1, upcomingCatalysts: 1, portfolioImpact: 4.5, forecastSummary: 'Elite pitching prospect delivering on hype. Population growth is key risk to monitor.' },
  { player: 'Ronald Acuna Jr.', sport: 'Baseball', currentTrend: 'buy', priceChangeYTD: 9.8, upcomingCatalysts: 0, portfolioImpact: 6.1, forecastSummary: 'Elite five-tool player back healthy. Full season production should stabilize prices.' },
  { player: 'Justin Herbert', sport: 'Football', currentTrend: 'hold', priceChangeYTD: 3.2, upcomingCatalysts: 1, portfolioImpact: 4.8, forecastSummary: 'Steady QB1 with limited upside catalysts. Population stability supports floor pricing.' },
  { player: 'Jayson Tatum', sport: 'Basketball', currentTrend: 'buy', priceChangeYTD: 16.4, upcomingCatalysts: 0, portfolioImpact: 5.3, forecastSummary: 'Championship window open. Another deep playoff run would confirm premium status.' },
  { player: 'Bobby Witt Jr.', sport: 'Baseball', currentTrend: 'buy', priceChangeYTD: 19.7, upcomingCatalysts: 0, portfolioImpact: 3.9, forecastSummary: 'Young superstar entering prime. Five-tool potential makes him a strong long-term hold.' },
  { player: 'Elly De La Cruz', sport: 'Baseball', currentTrend: 'buy', priceChangeYTD: 24.3, upcomingCatalysts: 0, portfolioImpact: 3.2, forecastSummary: 'Electrifying speed and power combo generating sustained buzz. High volatility expected.' },
  { player: 'Lamar Jackson', sport: 'Football', currentTrend: 'hold', priceChangeYTD: 4.1, upcomingCatalysts: 0, portfolioImpact: 5.6, forecastSummary: 'Dual-threat MVP with established floor. Playoff success would be the key catalyst.' },
];

// ---- Mock Data: Forecast Accuracy (per model) ----

function generateAccuracyData(model: ModelType): ForecastAccuracy[] {
  const baseError = model === 'composite' ? 4 : model === 'ml_ensemble' ? 6 : model === 'time_series' ? 7 : 10;
  const data: ForecastAccuracy[] = [];
  let basePrice = 1000;

  for (let i = 0; i < 30; i++) {
    const date = new Date(2026, 0, 1 + i * 3);
    const dateStr = date.toISOString().split('T')[0];
    const actualChange = (Math.sin(i * 0.3) * 8 + (Math.random() - 0.4) * 6);
    const actual = Math.round(basePrice * (1 + actualChange / 100));
    const errorMagnitude = (Math.random() * baseError * 2 - baseError) * 0.6;
    const predicted = Math.round(actual * (1 + errorMagnitude / 100));
    const error = Math.round(Math.abs(predicted - actual) / actual * 10000) / 100;
    data.push({ date: dateStr, predicted, actual, error });
    basePrice = actual;
  }

  return data;
}

// ---- Mock Data: Market Regime ----

const MOCK_MARKET_REGIME: MarketRegime = {
  current: 'bull',
  strength: 72,
  duration: '4 months',
  historicalAvgDuration: '6.2 months',
  transitionProbability: { bull: 62, bear: 18, sideways: 20 },
};

// ---- Mock Data: Price Correlations ----

const MOCK_CORRELATIONS: PriceCorrelation[] = [
  { playerA: 'Victor Wembanyama', playerB: 'Anthony Edwards', correlation: 0.82, period: '6 months', significance: 'high' },
  { playerA: 'LeBron James', playerB: 'Luka Doncic', correlation: 0.71, period: '1 year', significance: 'high' },
  { playerA: 'Patrick Mahomes', playerB: 'Joe Burrow', correlation: 0.88, period: '6 months', significance: 'high' },
  { playerA: 'Shohei Ohtani', playerB: 'Juan Soto', correlation: 0.65, period: '1 year', significance: 'medium' },
  { playerA: 'Caitlin Clark', playerB: 'Victor Wembanyama', correlation: 0.58, period: '3 months', significance: 'medium' },
  { playerA: 'Ja Morant', playerB: 'Zion Williamson', correlation: 0.76, period: '1 year', significance: 'high' },
  { playerA: 'Justin Herbert', playerB: 'Justin Jefferson', correlation: 0.69, period: '6 months', significance: 'medium' },
  { playerA: 'Connor McDavid', playerB: 'Mike Trout', correlation: 0.34, period: '1 year', significance: 'low' },
  { playerA: 'Cooper Flagg', playerB: 'Victor Wembanyama', correlation: 0.45, period: '3 months', significance: 'medium' },
  { playerA: 'Paul Skenes', playerB: 'Jackson Holliday', correlation: 0.72, period: '6 months', significance: 'high' },
];

// ---- Mock Data: Forecast Alerts ----

const MOCK_ALERTS: ForecastAlert[] = [
  {
    id: 'alert_001',
    type: 'breakout',
    title: 'Anthony Edwards Breakout Signal',
    description: 'Price broke above 90-day moving average with high volume. Composite model upgraded to Strong Buy.',
    severity: 'critical',
    player: 'Anthony Edwards',
    timestamp: '2026-03-15T08:30:00Z',
    actionable: true,
  },
  {
    id: 'alert_002',
    type: 'catalyst_trigger',
    title: 'Cooper Flagg Draft Projection Confirmed',
    description: 'Multiple major mock drafts locked in Flagg at #1 overall. Pre-draft cards seeing accelerated demand.',
    severity: 'critical',
    player: 'Cooper Flagg',
    timestamp: '2026-03-14T16:45:00Z',
    actionable: true,
  },
  {
    id: 'alert_003',
    type: 'breakdown',
    title: 'Zion Williamson Breakdown Alert',
    description: 'Price dropped below key support level. Sentiment analysis shows sustained negative momentum.',
    severity: 'warning',
    player: 'Zion Williamson',
    timestamp: '2026-03-14T12:00:00Z',
    actionable: true,
  },
  {
    id: 'alert_004',
    type: 'confidence_shift',
    title: 'Caitlin Clark Confidence Upgrade',
    description: '30-day forecast confidence increased from 72% to 80% based on strong early-season performance data.',
    severity: 'info',
    player: 'Caitlin Clark',
    timestamp: '2026-03-13T10:15:00Z',
    actionable: false,
  },
  {
    id: 'alert_005',
    type: 'regime_change',
    title: 'Baseball Market Entering Bull Phase',
    description: 'Baseball card sector transitioning from sideways to bull regime as spring training excitement builds.',
    severity: 'info',
    player: 'Market Wide',
    timestamp: '2026-03-12T09:00:00Z',
    actionable: false,
  },
  {
    id: 'alert_006',
    type: 'catalyst_trigger',
    title: 'Patrick Mahomes Documentary Trailer Released',
    description: 'Netflix released trailer for Mahomes documentary. Social media engagement spiked 340% in 24 hours.',
    severity: 'warning',
    player: 'Patrick Mahomes',
    timestamp: '2026-03-11T14:30:00Z',
    actionable: true,
  },
  {
    id: 'alert_007',
    type: 'breakout',
    title: 'Elly De La Cruz Velocity Milestone',
    description: 'Spring training performance metrics triggering breakout signals across multiple models.',
    severity: 'warning',
    player: 'Elly De La Cruz',
    timestamp: '2026-03-10T11:00:00Z',
    actionable: true,
  },
  {
    id: 'alert_008',
    type: 'confidence_shift',
    title: 'LeBron James Retirement Probability Increased',
    description: 'Media sentiment analysis raised retirement probability from 20% to 25%. Legacy card premium expanding.',
    severity: 'info',
    player: 'LeBron James',
    timestamp: '2026-03-09T15:20:00Z',
    actionable: false,
  },
];

// ---- Exported Functions ----

export function getPriceForecasts(): PriceForecast[] {
  return loadFromStorage('forecasts', MOCK_FORECASTS);
}

export function getTopForecasts(signal?: TrendSignal): PriceForecast[] {
  const all = getPriceForecasts();
  if (signal) {
    return all.filter(f => f.signal === signal).sort((a, b) => b.signalStrength - a.signalStrength);
  }
  return all.sort((a, b) => b.signalStrength - a.signalStrength).slice(0, 10);
}

export function getCatalysts(): PriceCatalyst[] {
  return loadFromStorage('catalysts', MOCK_CATALYSTS);
}

export function getUpcomingCatalysts(): PriceCatalyst[] {
  const now = new Date().toISOString().split('T')[0];
  return getCatalysts()
    .filter(c => c.expectedDate >= now)
    .sort((a, b) => a.expectedDate.localeCompare(b.expectedDate));
}

export function getModelPerformance(): ModelPerformance[] {
  return loadFromStorage('model_performance', MOCK_MODEL_PERFORMANCE);
}

export function getSeasonalPatterns(): SeasonalPattern[] {
  return loadFromStorage('seasonal_patterns', MOCK_SEASONAL_PATTERNS);
}

export function getPlayerForecasts(): PlayerForecast[] {
  return loadFromStorage('player_forecasts', MOCK_PLAYER_FORECASTS);
}

export function getForecastAccuracy(modelType: ModelType): ForecastAccuracy[] {
  const key = `accuracy_${modelType}`;
  const stored = loadFromStorage<ForecastAccuracy[] | null>(key, null);
  if (stored) return stored;
  const generated = generateAccuracyData(modelType);
  saveToStorage(key, generated);
  return generated;
}

export function getMarketRegime(): MarketRegime {
  return loadFromStorage('market_regime', MOCK_MARKET_REGIME);
}

export function getSignalColor(signal: TrendSignal): string {
  switch (signal) {
    case 'strong_buy': return '#10b981';
    case 'buy': return '#34d399';
    case 'hold': return '#f59e0b';
    case 'sell': return '#f87171';
    case 'strong_sell': return '#ef4444';
    default: return '#94a3b8';
  }
}

export function getSignalLabel(signal: TrendSignal): string {
  switch (signal) {
    case 'strong_buy': return 'Strong Buy';
    case 'buy': return 'Buy';
    case 'hold': return 'Hold';
    case 'sell': return 'Sell';
    case 'strong_sell': return 'Strong Sell';
    default: return 'Unknown';
  }
}

export function getCatalystIcon(type: CatalystType): string {
  switch (type) {
    case 'performance': return '⚡';
    case 'injury': return '🏥';
    case 'trade': return '🔄';
    case 'award': return '🏆';
    case 'rookie_debut': return '⭐';
    case 'retirement': return '👋';
    case 'media': return '📺';
    case 'population': return '📊';
    default: return '📌';
  }
}

export function formatCurrency(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000) return `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  return `$${n.toFixed(2)}`;
}

export function formatPercent(n: number): string {
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(1)}%`;
}

// ---- Additional Exported Analysis Functions ----

/**
 * Generate a portfolio-level forecast summary from all active forecasts.
 * Aggregates individual card predictions into a single portfolio outlook.
 */
export function getPortfolioForecastSummary(horizon: ForecastHorizon = '30d'): PortfolioForecastSummary {
  const forecasts = getPriceForecasts();
  let totalCurrent = 0;
  let totalPredicted = 0;
  let totalConfidence = 0;
  let bestReturn = -Infinity;
  let worstReturn = Infinity;
  let topPick = '';
  let worstPick = '';
  const signalCounts = { strong_buy: 0, buy: 0, hold: 0, sell: 0, strong_sell: 0 };

  for (const f of forecasts) {
    totalCurrent += f.currentPrice;
    signalCounts[f.signal]++;

    const horizonData = f.forecasts.find(fc => fc.horizon === horizon);
    if (horizonData) {
      totalPredicted += horizonData.predicted;
      totalConfidence += horizonData.confidence;

      if (horizonData.changePercent > bestReturn) {
        bestReturn = horizonData.changePercent;
        topPick = f.player;
      }
      if (horizonData.changePercent < worstReturn) {
        worstReturn = horizonData.changePercent;
        worstPick = f.player;
      }
    } else {
      totalPredicted += f.currentPrice;
    }
  }

  const expectedReturn = totalPredicted - totalCurrent;
  const expectedReturnPercent = totalCurrent > 0 ? (expectedReturn / totalCurrent) * 100 : 0;
  const avgConfidence = forecasts.length > 0 ? Math.round(totalConfidence / forecasts.length) : 0;

  // Risk score: higher when more sells, lower confidence, higher variance
  const sellWeight = (signalCounts.sell * 2 + signalCounts.strong_sell * 4) / Math.max(forecasts.length, 1);
  const riskScore = Math.min(100, Math.round(sellWeight * 25 + (100 - avgConfidence) * 0.5));

  return {
    totalCurrentValue: Math.round(totalCurrent),
    totalPredictedValue: Math.round(totalPredicted),
    expectedReturn: Math.round(expectedReturn),
    expectedReturnPercent: Math.round(expectedReturnPercent * 10) / 10,
    strongBuyCount: signalCounts.strong_buy,
    buyCount: signalCounts.buy,
    holdCount: signalCounts.hold,
    sellCount: signalCounts.sell,
    strongSellCount: signalCounts.strong_sell,
    avgConfidence,
    topPick,
    topPickReturn: Math.round(bestReturn * 10) / 10,
    worstPick,
    worstPickReturn: Math.round(worstReturn * 10) / 10,
    riskScore,
  };
}

/**
 * Get price correlations between player cards.
 * Identifies which players' cards move together or inversely.
 */
export function getPriceCorrelations(): PriceCorrelation[] {
  return loadFromStorage('correlations', MOCK_CORRELATIONS);
}

/**
 * Get active forecast alerts sorted by timestamp (newest first).
 * These represent significant changes in predictions, catalysts, or market conditions.
 */
export function getForecastAlerts(): ForecastAlert[] {
  return loadFromStorage('alerts', MOCK_ALERTS)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

/**
 * Get the forecast for a specific player by name.
 * Returns null if no forecast exists for the player.
 */
export function getPlayerForecastByName(playerName: string): PlayerForecast | null {
  const all = getPlayerForecasts();
  return all.find(pf => pf.player.toLowerCase() === playerName.toLowerCase()) || null;
}

/**
 * Get forecasts filtered by multiple criteria.
 * Useful for building filtered views and search results.
 */
export function searchForecasts(options: {
  query?: string;
  signals?: TrendSignal[];
  minConfidence?: number;
  horizon?: ForecastHorizon;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'signalStrength' | 'changePercent' | 'confidence' | 'price';
  sortDir?: 'asc' | 'desc';
}): PriceForecast[] {
  let results = getPriceForecasts();
  const { query, signals, minConfidence, horizon = '30d', minPrice, maxPrice, sortBy = 'signalStrength', sortDir = 'desc' } = options;

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(f =>
      f.player.toLowerCase().includes(q) ||
      f.cardName.toLowerCase().includes(q) ||
      f.set.toLowerCase().includes(q)
    );
  }

  if (signals && signals.length > 0) {
    results = results.filter(f => signals.includes(f.signal));
  }

  if (minConfidence !== undefined) {
    results = results.filter(f => {
      const hd = f.forecasts.find(fc => fc.horizon === horizon);
      return hd && hd.confidence >= minConfidence;
    });
  }

  if (minPrice !== undefined) {
    results = results.filter(f => f.currentPrice >= minPrice);
  }

  if (maxPrice !== undefined) {
    results = results.filter(f => f.currentPrice <= maxPrice);
  }

  results.sort((a, b) => {
    let aVal = 0;
    let bVal = 0;
    const aHorizon = a.forecasts.find(fc => fc.horizon === horizon);
    const bHorizon = b.forecasts.find(fc => fc.horizon === horizon);

    switch (sortBy) {
      case 'signalStrength':
        aVal = a.signalStrength;
        bVal = b.signalStrength;
        break;
      case 'changePercent':
        aVal = aHorizon?.changePercent ?? 0;
        bVal = bHorizon?.changePercent ?? 0;
        break;
      case 'confidence':
        aVal = aHorizon?.confidence ?? 0;
        bVal = bHorizon?.confidence ?? 0;
        break;
      case 'price':
        aVal = a.currentPrice;
        bVal = b.currentPrice;
        break;
    }

    return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
  });

  return results;
}

/**
 * Calculate the expected value of a forecast based on predicted price,
 * confidence level, and catalyst probabilities.
 */
export function calculateExpectedValue(forecastId: string, horizon: ForecastHorizon = '30d'): number | null {
  const forecasts = getPriceForecasts();
  const forecast = forecasts.find(f => f.id === forecastId);
  if (!forecast) return null;

  const horizonData = forecast.forecasts.find(fc => fc.horizon === horizon);
  if (!horizonData) return null;

  // Weighted expected value: confidence-weighted predicted + (1-confidence) * current
  const confidenceWeight = horizonData.confidence / 100;
  const baseExpected = horizonData.predicted * confidenceWeight + forecast.currentPrice * (1 - confidenceWeight);

  // Adjust for catalyst probabilities
  let catalystAdjustment = 0;
  for (const catalyst of forecast.catalysts) {
    const probabilityWeight = catalyst.probability / 100;
    const impactDollar = forecast.currentPrice * (catalyst.impact / 100);
    catalystAdjustment += impactDollar * probabilityWeight * 0.3; // 30% weight to catalysts
  }

  return Math.round(baseExpected + catalystAdjustment);
}

/**
 * Get the horizon label in human-readable format.
 */
export function getHorizonLabel(horizon: ForecastHorizon): string {
  switch (horizon) {
    case '7d': return '7 Days';
    case '30d': return '30 Days';
    case '90d': return '90 Days';
    case '6m': return '6 Months';
    case '1y': return '1 Year';
    default: return horizon;
  }
}

/**
 * Get the model type label in human-readable format.
 */
export function getModelLabel(model: ModelType): string {
  switch (model) {
    case 'time_series': return 'Time Series';
    case 'ml_ensemble': return 'ML Ensemble';
    case 'sentiment': return 'Sentiment';
    case 'composite': return 'Composite';
    default: return model;
  }
}

/**
 * Get the severity color for forecast alerts.
 */
export function getAlertSeverityColor(severity: ForecastAlert['severity']): string {
  switch (severity) {
    case 'critical': return '#ef4444';
    case 'warning': return '#f59e0b';
    case 'info': return '#3b82f6';
    default: return '#94a3b8';
  }
}

/**
 * Get the regime color for market regime display.
 */
export function getRegimeColor(regime: MarketRegime['current']): string {
  switch (regime) {
    case 'bull': return '#10b981';
    case 'bear': return '#ef4444';
    case 'sideways': return '#f59e0b';
    case 'volatile': return '#a855f7';
    default: return '#94a3b8';
  }
}
