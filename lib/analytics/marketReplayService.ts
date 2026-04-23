// @ts-nocheck
import { store } from '../dal/syncStore';

// ---- Types ----

export interface PriceDataPoint {
  date: string;
  price: number;
  volume: number;
  event?: string;
}

export interface CardTimeline {
  id: string;
  cardName: string;
  player: string;
  sport: string;
  year: number;
  set: string;
  priceHistory: PriceDataPoint[];
  currentPrice: number;
  allTimeHigh: number;
  allTimeLow: number;
  peakDate: string;
  troughDate: string;
}

export interface BacktestStrategy {
  id: string;
  name: string;
  description: string;
  type: 'buy_dip' | 'momentum' | 'mean_reversion' | 'hold' | 'seasonal';
  params: { [key: string]: number };
}

export interface BacktestResult {
  strategyId: string;
  strategyName: string;
  cardId: string;
  startDate: string;
  endDate: string;
  initialInvestment: number;
  finalValue: number;
  totalReturn: number;
  annualizedReturn: number;
  maxDrawdown: number;
  winRate: number;
  trades: { date: string; action: 'buy' | 'sell'; price: number; quantity: number }[];
  sharpeRatio: number;
}

export interface WhatIfScenario {
  id: string;
  name: string;
  cardId: string;
  purchaseDate: string;
  purchasePrice: number;
  sellDate: string;
  sellPrice: number;
  holdingPeriod: number;
  actualReturn: number;
  fees: number;
}

export interface ReplayStats {
  totalCardsTracked: number;
  avgAnnualReturn: number;
  bestPerformer: string;
  worstPerformer: string;
  totalBacktests: number;
}

// ---- Constants ----

const STORAGE_PREFIX = 'msi_market_replay';

// ---- Mock Data ----

function generatePriceHistory(basePrice: number, volatility: number, events: { date: string; event: string }[]): PriceDataPoint[] {
  const points: PriceDataPoint[] = [];
  let price = basePrice * 0.4;
  const startYear = 2019;
  const eventMap = new Map(events.map(e => [e.date, e.event]));

  for (let y = startYear; y <= 2025; y++) {
    for (let m = 1; m <= 12; m++) {
      if (y === 2025 && m > 10) break;
      const date = `${y}-${String(m).padStart(2, '0')}-01`;
      const change = (Math.sin(y * 3 + m * 0.7) * volatility + (Math.cos(m * 2.1 + y) * volatility * 0.5));
      price = Math.max(price * 0.3, price + change);
      const volume = Math.floor(50 + Math.abs(Math.sin(y + m * 1.3)) * 200);
      const event = eventMap.get(date);
      points.push({ date, price: Math.round(price * 100) / 100, volume, ...(event ? { event } : {}) });
    }
  }
  return points;
}

const mockTimelines: CardTimeline[] = [
  (() => {
    const history = generatePriceHistory(850, 45, [
      { date: '2020-03-01', event: 'rookieYear' },
      { date: '2021-06-01', event: 'championship' },
      { date: '2023-01-01', event: 'injury' },
      { date: '2024-09-01', event: 'comeback' },
    ]);
    const prices = history.map(p => p.price);
    const maxIdx = prices.indexOf(Math.max(...prices));
    const minIdx = prices.indexOf(Math.min(...prices));
    return {
      id: 'ct-001', cardName: '2018 Prizm Silver', player: 'Luka Doncic', sport: 'Basketball',
      year: 2018, set: 'Prizm', priceHistory: history, currentPrice: prices[prices.length - 1],
      allTimeHigh: Math.max(...prices), allTimeLow: Math.min(...prices),
      peakDate: history[maxIdx].date, troughDate: history[minIdx].date,
    };
  })(),
  (() => {
    const history = generatePriceHistory(1200, 60, [
      { date: '2019-06-01', event: 'draft' },
      { date: '2022-02-01', event: 'championship' },
      { date: '2024-01-01', event: 'mvpSeason' },
    ]);
    const prices = history.map(p => p.price);
    const maxIdx = prices.indexOf(Math.max(...prices));
    const minIdx = prices.indexOf(Math.min(...prices));
    return {
      id: 'ct-002', cardName: '2018 Optic Rated Rookie', player: 'Josh Allen', sport: 'Football',
      year: 2018, set: 'Optic', priceHistory: history, currentPrice: prices[prices.length - 1],
      allTimeHigh: Math.max(...prices), allTimeLow: Math.min(...prices),
      peakDate: history[maxIdx].date, troughDate: history[minIdx].date,
    };
  })(),
  (() => {
    const history = generatePriceHistory(500, 30, [
      { date: '2019-09-01', event: 'rookieYear' },
      { date: '2021-10-01', event: 'worldSeries' },
      { date: '2023-07-01', event: 'allStar' },
    ]);
    const prices = history.map(p => p.price);
    const maxIdx = prices.indexOf(Math.max(...prices));
    const minIdx = prices.indexOf(Math.min(...prices));
    return {
      id: 'ct-003', cardName: '2019 Bowman Chrome Auto', player: 'Julio Rodriguez', sport: 'Baseball',
      year: 2019, set: 'Bowman Chrome', priceHistory: history, currentPrice: prices[prices.length - 1],
      allTimeHigh: Math.max(...prices), allTimeLow: Math.min(...prices),
      peakDate: history[maxIdx].date, troughDate: history[minIdx].date,
    };
  })(),
  (() => {
    const history = generatePriceHistory(2000, 100, [
      { date: '2020-10-01', event: 'championship' },
      { date: '2022-05-01', event: 'injury' },
      { date: '2024-06-01', event: 'comeback' },
    ]);
    const prices = history.map(p => p.price);
    const maxIdx = prices.indexOf(Math.max(...prices));
    const minIdx = prices.indexOf(Math.min(...prices));
    return {
      id: 'ct-004', cardName: '2019 Prizm Draft Picks', player: 'Joe Burrow', sport: 'Football',
      year: 2019, set: 'Prizm', priceHistory: history, currentPrice: prices[prices.length - 1],
      allTimeHigh: Math.max(...prices), allTimeLow: Math.min(...prices),
      peakDate: history[maxIdx].date, troughDate: history[minIdx].date,
    };
  })(),
  (() => {
    const history = generatePriceHistory(350, 20, [
      { date: '2020-01-01', event: 'rookieYear' },
      { date: '2022-06-01', event: 'allStar' },
    ]);
    const prices = history.map(p => p.price);
    const maxIdx = prices.indexOf(Math.max(...prices));
    const minIdx = prices.indexOf(Math.min(...prices));
    return {
      id: 'ct-005', cardName: '2020 Topps Chrome', player: 'Luis Robert', sport: 'Baseball',
      year: 2020, set: 'Topps Chrome', priceHistory: history, currentPrice: prices[prices.length - 1],
      allTimeHigh: Math.max(...prices), allTimeLow: Math.min(...prices),
      peakDate: history[maxIdx].date, troughDate: history[minIdx].date,
    };
  })(),
  (() => {
    const history = generatePriceHistory(600, 35, [
      { date: '2021-01-01', event: 'rookieYear' },
      { date: '2023-05-01', event: 'championship' },
    ]);
    const prices = history.map(p => p.price);
    const maxIdx = prices.indexOf(Math.max(...prices));
    const minIdx = prices.indexOf(Math.min(...prices));
    return {
      id: 'ct-006', cardName: '2020 Mosaic', player: 'Anthony Edwards', sport: 'Basketball',
      year: 2020, set: 'Mosaic', priceHistory: history, currentPrice: prices[prices.length - 1],
      allTimeHigh: Math.max(...prices), allTimeLow: Math.min(...prices),
      peakDate: history[maxIdx].date, troughDate: history[minIdx].date,
    };
  })(),
  (() => {
    const history = generatePriceHistory(900, 50, [
      { date: '2020-09-01', event: 'draft' },
      { date: '2022-01-01', event: 'mvpSeason' },
      { date: '2024-02-01', event: 'championship' },
    ]);
    const prices = history.map(p => p.price);
    const maxIdx = prices.indexOf(Math.max(...prices));
    const minIdx = prices.indexOf(Math.min(...prices));
    return {
      id: 'ct-007', cardName: '2020 Select', player: 'Justin Herbert', sport: 'Football',
      year: 2020, set: 'Select', priceHistory: history, currentPrice: prices[prices.length - 1],
      allTimeHigh: Math.max(...prices), allTimeLow: Math.min(...prices),
      peakDate: history[maxIdx].date, troughDate: history[minIdx].date,
    };
  })(),
  (() => {
    const history = generatePriceHistory(1500, 80, [
      { date: '2019-01-01', event: 'rookieYear' },
      { date: '2021-03-01', event: 'injury' },
      { date: '2023-10-01', event: 'comeback' },
    ]);
    const prices = history.map(p => p.price);
    const maxIdx = prices.indexOf(Math.max(...prices));
    const minIdx = prices.indexOf(Math.min(...prices));
    return {
      id: 'ct-008', cardName: '2018 National Treasures', player: 'Trae Young', sport: 'Basketball',
      year: 2018, set: 'National Treasures', priceHistory: history, currentPrice: prices[prices.length - 1],
      allTimeHigh: Math.max(...prices), allTimeLow: Math.min(...prices),
      peakDate: history[maxIdx].date, troughDate: history[minIdx].date,
    };
  })(),
  (() => {
    const history = generatePriceHistory(750, 40, [
      { date: '2021-04-01', event: 'draft' },
      { date: '2023-12-01', event: 'mvpSeason' },
    ]);
    const prices = history.map(p => p.price);
    const maxIdx = prices.indexOf(Math.max(...prices));
    const minIdx = prices.indexOf(Math.min(...prices));
    return {
      id: 'ct-009', cardName: '2021 Prizm', player: 'Trevor Lawrence', sport: 'Football',
      year: 2021, set: 'Prizm', priceHistory: history, currentPrice: prices[prices.length - 1],
      allTimeHigh: Math.max(...prices), allTimeLow: Math.min(...prices),
      peakDate: history[maxIdx].date, troughDate: history[minIdx].date,
    };
  })(),
  (() => {
    const history = generatePriceHistory(400, 25, [
      { date: '2020-07-01', event: 'rookieYear' },
      { date: '2022-11-01', event: 'championship' },
      { date: '2024-04-01', event: 'allStar' },
    ]);
    const prices = history.map(p => p.price);
    const maxIdx = prices.indexOf(Math.max(...prices));
    const minIdx = prices.indexOf(Math.min(...prices));
    return {
      id: 'ct-010', cardName: '2020 Topps Series 1', player: 'Bobby Witt Jr', sport: 'Baseball',
      year: 2020, set: 'Topps Series 1', priceHistory: history, currentPrice: prices[prices.length - 1],
      allTimeHigh: Math.max(...prices), allTimeLow: Math.min(...prices),
      peakDate: history[maxIdx].date, troughDate: history[minIdx].date,
    };
  })(),
  (() => {
    const history = generatePriceHistory(3000, 150, [
      { date: '2019-07-01', event: 'rookieYear' },
      { date: '2021-01-01', event: 'championship' },
      { date: '2023-06-01', event: 'injury' },
      { date: '2025-01-01', event: 'comeback' },
    ]);
    const prices = history.map(p => p.price);
    const maxIdx = prices.indexOf(Math.max(...prices));
    const minIdx = prices.indexOf(Math.min(...prices));
    return {
      id: 'ct-011', cardName: '2018 Contenders Optic', player: 'Patrick Mahomes', sport: 'Football',
      year: 2018, set: 'Contenders Optic', priceHistory: history, currentPrice: prices[prices.length - 1],
      allTimeHigh: Math.max(...prices), allTimeLow: Math.min(...prices),
      peakDate: history[maxIdx].date, troughDate: history[minIdx].date,
    };
  })(),
  (() => {
    const history = generatePriceHistory(450, 28, [
      { date: '2021-10-01', event: 'rookieYear' },
      { date: '2023-03-01', event: 'allStar' },
    ]);
    const prices = history.map(p => p.price);
    const maxIdx = prices.indexOf(Math.max(...prices));
    const minIdx = prices.indexOf(Math.min(...prices));
    return {
      id: 'ct-012', cardName: '2021 Bowman 1st', player: 'Jackson Holliday', sport: 'Baseball',
      year: 2021, set: 'Bowman 1st', priceHistory: history, currentPrice: prices[prices.length - 1],
      allTimeHigh: Math.max(...prices), allTimeLow: Math.min(...prices),
      peakDate: history[maxIdx].date, troughDate: history[minIdx].date,
    };
  })(),
];

const mockStrategies: BacktestStrategy[] = [
  { id: 'strat-001', name: 'Buy the Dip', description: 'Buy when price drops below moving average by threshold', type: 'buy_dip', params: { dipPercent: 15, holdDays: 90 } },
  { id: 'strat-002', name: 'Momentum Rider', description: 'Buy when price shows upward momentum above threshold', type: 'momentum', params: { momentumDays: 30, threshold: 10 } },
  { id: 'strat-003', name: 'Mean Reversion', description: 'Buy below mean, sell above mean by standard deviations', type: 'mean_reversion', params: { stdDevThreshold: 1.5, lookbackDays: 60 } },
  { id: 'strat-004', name: 'Buy & Hold', description: 'Simple buy and hold for the entire period', type: 'hold', params: { holdMonths: 24 } },
  { id: 'strat-005', name: 'Seasonal Trader', description: 'Buy before season start, sell at peak season', type: 'seasonal', params: { buyMonth: 3, sellMonth: 11 } },
];

// ---- Helper functions ----

export function formatCurrency(n: number): string {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPercent(n: number): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
}

export function calculateReturn(buy: number, sell: number): number {
  if (buy === 0) return 0;
  return ((sell - buy) / buy) * 100;
}

export function getReturnColor(ret: number): string {
  if (ret > 20) return 'text-green-400';
  if (ret > 0) return 'text-green-300';
  if (ret === 0) return 'text-slate-400';
  if (ret > -20) return 'text-red-300';
  return 'text-red-400';
}

export function getStrategyColor(type: BacktestStrategy['type']): string {
  switch (type) {
    case 'buy_dip': return 'text-blue-400';
    case 'momentum': return 'text-purple-400';
    case 'mean_reversion': return 'text-yellow-400';
    case 'hold': return 'text-green-400';
    case 'seasonal': return 'text-orange-400';
    default: return 'text-slate-400';
  }
}

// ---- Storage helpers ----

function loadFromStorage<T>(key: string, fallback: T): T {
  return store.get<T>(`${STORAGE_PREFIX}_${key}`, fallback);
}

function saveToStorage<T>(key: string, data: T): void {
  store.set(`${STORAGE_PREFIX}_${key}`, data);
}

// ---- Core functions ----

export function getCardTimelines(): CardTimeline[] {
  return loadFromStorage<CardTimeline[]>('timelines', mockTimelines);
}

export function getTimeline(cardId: string): CardTimeline | undefined {
  const timelines = getCardTimelines();
  return timelines.find(t => t.id === cardId);
}

export function getStrategies(): BacktestStrategy[] {
  return loadFromStorage<BacktestStrategy[]>('strategies', mockStrategies);
}

export function runBacktest(strategyId: string, cardId: string, params?: { [key: string]: number }): BacktestResult | null {
  const strategy = getStrategies().find(s => s.id === strategyId);
  const timeline = getTimeline(cardId);
  if (!strategy || !timeline || timeline.priceHistory.length < 2) return null;

  const mergedParams = { ...strategy.params, ...(params || {}) };
  const history = timeline.priceHistory;
  const startDate = history[0].date;
  const endDate = history[history.length - 1].date;
  const initialInvestment = 1000;

  const trades: BacktestResult['trades'] = [];
  let cash = initialInvestment;
  let holdings = 0;
  let wins = 0;
  let totalTrades = 0;
  let peakValue = initialInvestment;
  let maxDrawdown = 0;

  if (strategy.type === 'hold') {
    const buyPrice = history[0].price;
    const quantity = Math.floor(cash / buyPrice) || 1;
    const cost = buyPrice * quantity;
    cash -= cost;
    holdings = quantity;
    trades.push({ date: startDate, action: 'buy', price: buyPrice, quantity });

    const finalPrice = history[history.length - 1].price;
    trades.push({ date: endDate, action: 'sell', price: finalPrice, quantity: holdings });
    cash += finalPrice * holdings;
    if (finalPrice > buyPrice) wins++;
    totalTrades = 1;
    holdings = 0;
  } else if (strategy.type === 'buy_dip') {
    const dipPercent = mergedParams.dipPercent || 15;
    let movingAvg = history[0].price;

    for (let i = 1; i < history.length; i++) {
      const p = history[i];
      movingAvg = movingAvg * 0.9 + p.price * 0.1;

      if (holdings === 0 && p.price < movingAvg * (1 - dipPercent / 100)) {
        const quantity = Math.floor(cash / p.price) || 1;
        if (cash >= p.price) {
          cash -= p.price * quantity;
          holdings = quantity;
          trades.push({ date: p.date, action: 'buy', price: p.price, quantity });
        }
      } else if (holdings > 0 && p.price > movingAvg) {
        trades.push({ date: p.date, action: 'sell', price: p.price, quantity: holdings });
        const buyTrade = trades.filter(t => t.action === 'buy').pop();
        if (buyTrade && p.price > buyTrade.price) wins++;
        totalTrades++;
        cash += p.price * holdings;
        holdings = 0;
      }

      const currentVal = cash + holdings * p.price;
      peakValue = Math.max(peakValue, currentVal);
      const dd = peakValue > 0 ? (peakValue - currentVal) / peakValue * 100 : 0;
      maxDrawdown = Math.max(maxDrawdown, dd);
    }
  } else if (strategy.type === 'momentum') {
    const momentumDays = mergedParams.momentumDays || 30;
    const threshold = mergedParams.threshold || 10;
    const lookback = Math.max(1, Math.floor(momentumDays / 30));

    for (let i = lookback; i < history.length; i++) {
      const p = history[i];
      const prev = history[i - lookback];
      const momentum = ((p.price - prev.price) / prev.price) * 100;

      if (holdings === 0 && momentum > threshold && cash >= p.price) {
        const quantity = Math.floor(cash / p.price) || 1;
        cash -= p.price * quantity;
        holdings = quantity;
        trades.push({ date: p.date, action: 'buy', price: p.price, quantity });
      } else if (holdings > 0 && momentum < -threshold / 2) {
        trades.push({ date: p.date, action: 'sell', price: p.price, quantity: holdings });
        const buyTrade = trades.filter(t => t.action === 'buy').pop();
        if (buyTrade && p.price > buyTrade.price) wins++;
        totalTrades++;
        cash += p.price * holdings;
        holdings = 0;
      }

      const currentVal = cash + holdings * p.price;
      peakValue = Math.max(peakValue, currentVal);
      const dd = peakValue > 0 ? (peakValue - currentVal) / peakValue * 100 : 0;
      maxDrawdown = Math.max(maxDrawdown, dd);
    }
  } else if (strategy.type === 'mean_reversion') {
    const stdThreshold = mergedParams.stdDevThreshold || 1.5;
    const lookbackMonths = Math.max(3, Math.floor((mergedParams.lookbackDays || 60) / 30));

    for (let i = lookbackMonths; i < history.length; i++) {
      const window = history.slice(i - lookbackMonths, i).map(h => h.price);
      const mean = window.reduce((a, b) => a + b, 0) / window.length;
      const variance = window.reduce((a, b) => a + (b - mean) ** 2, 0) / window.length;
      const std = Math.sqrt(variance);
      const p = history[i];

      if (holdings === 0 && p.price < mean - std * stdThreshold && cash >= p.price) {
        const quantity = Math.floor(cash / p.price) || 1;
        cash -= p.price * quantity;
        holdings = quantity;
        trades.push({ date: p.date, action: 'buy', price: p.price, quantity });
      } else if (holdings > 0 && p.price > mean + std * (stdThreshold * 0.5)) {
        trades.push({ date: p.date, action: 'sell', price: p.price, quantity: holdings });
        const buyTrade = trades.filter(t => t.action === 'buy').pop();
        if (buyTrade && p.price > buyTrade.price) wins++;
        totalTrades++;
        cash += p.price * holdings;
        holdings = 0;
      }

      const currentVal = cash + holdings * p.price;
      peakValue = Math.max(peakValue, currentVal);
      const dd = peakValue > 0 ? (peakValue - currentVal) / peakValue * 100 : 0;
      maxDrawdown = Math.max(maxDrawdown, dd);
    }
  } else if (strategy.type === 'seasonal') {
    const buyMonth = mergedParams.buyMonth || 3;
    const sellMonth = mergedParams.sellMonth || 11;

    for (let i = 0; i < history.length; i++) {
      const p = history[i];
      const month = parseInt(p.date.split('-')[1], 10);

      if (holdings === 0 && month === buyMonth && cash >= p.price) {
        const quantity = Math.floor(cash / p.price) || 1;
        cash -= p.price * quantity;
        holdings = quantity;
        trades.push({ date: p.date, action: 'buy', price: p.price, quantity });
      } else if (holdings > 0 && month === sellMonth) {
        trades.push({ date: p.date, action: 'sell', price: p.price, quantity: holdings });
        const buyTrade = trades.filter(t => t.action === 'buy').pop();
        if (buyTrade && p.price > buyTrade.price) wins++;
        totalTrades++;
        cash += p.price * holdings;
        holdings = 0;
      }

      const currentVal = cash + holdings * p.price;
      peakValue = Math.max(peakValue, currentVal);
      const dd = peakValue > 0 ? (peakValue - currentVal) / peakValue * 100 : 0;
      maxDrawdown = Math.max(maxDrawdown, dd);
    }
  }

  // Liquidate remaining holdings at last price
  if (holdings > 0) {
    const lastPrice = history[history.length - 1].price;
    trades.push({ date: endDate, action: 'sell', price: lastPrice, quantity: holdings });
    const buyTrade = trades.filter(t => t.action === 'buy').pop();
    if (buyTrade && lastPrice > buyTrade.price) wins++;
    totalTrades++;
    cash += lastPrice * holdings;
    holdings = 0;
  }

  const finalValue = cash;
  const totalReturn = calculateReturn(initialInvestment, finalValue);

  // Annualized return
  const startMs = new Date(startDate).getTime();
  const endMs = new Date(endDate).getTime();
  const years = Math.max(0.01, (endMs - startMs) / (365.25 * 24 * 60 * 60 * 1000));
  const annualizedReturn = (Math.pow(finalValue / initialInvestment, 1 / years) - 1) * 100;

  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;

  // Simplified Sharpe ratio
  const riskFreeRate = 4;
  const sharpeRatio = maxDrawdown > 0 ? (annualizedReturn - riskFreeRate) / (maxDrawdown / 2) : 0;

  const result: BacktestResult = {
    strategyId: strategy.id,
    strategyName: strategy.name,
    cardId,
    startDate,
    endDate,
    initialInvestment,
    finalValue: Math.round(finalValue * 100) / 100,
    totalReturn: Math.round(totalReturn * 100) / 100,
    annualizedReturn: Math.round(annualizedReturn * 100) / 100,
    maxDrawdown: Math.round(maxDrawdown * 100) / 100,
    winRate: Math.round(winRate * 100) / 100,
    trades,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
  };

  // Persist result
  const existing = getBacktestResults();
  existing.push(result);
  saveToStorage('backtest_results', existing);

  return result;
}

export function getBacktestResults(): BacktestResult[] {
  return loadFromStorage<BacktestResult[]>('backtest_results', []);
}

export function createWhatIf(scenario: Omit<WhatIfScenario, 'id' | 'holdingPeriod' | 'actualReturn'>): WhatIfScenario {
  const purchaseMs = new Date(scenario.purchaseDate).getTime();
  const sellMs = new Date(scenario.sellDate).getTime();
  const holdingPeriod = Math.max(0, Math.round((sellMs - purchaseMs) / (1000 * 60 * 60 * 24)));
  const actualReturn = calculateReturn(scenario.purchasePrice + scenario.fees, scenario.sellPrice);

  const whatIf: WhatIfScenario = {
    id: `wif-${Date.now()}`,
    name: scenario.name,
    cardId: scenario.cardId,
    purchaseDate: scenario.purchaseDate,
    purchasePrice: scenario.purchasePrice,
    sellDate: scenario.sellDate,
    sellPrice: scenario.sellPrice,
    holdingPeriod,
    actualReturn: Math.round(actualReturn * 100) / 100,
    fees: scenario.fees,
  };

  const existing = getWhatIfScenarios();
  existing.push(whatIf);
  saveToStorage('whatif_scenarios', existing);

  return whatIf;
}

export function getWhatIfScenarios(): WhatIfScenario[] {
  return loadFromStorage<WhatIfScenario[]>('whatif_scenarios', []);
}

export function getReplayStats(): ReplayStats {
  const timelines = getCardTimelines();
  const backtests = getBacktestResults();

  const returns = timelines.map(t => {
    const first = t.priceHistory[0]?.price ?? 0;
    const last = t.priceHistory[t.priceHistory.length - 1]?.price ?? 0;
    return calculateReturn(first, last);
  });

  const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;

  let bestIdx = 0;
  let worstIdx = 0;
  for (let i = 1; i < returns.length; i++) {
    if (returns[i] > returns[bestIdx]) bestIdx = i;
    if (returns[i] < returns[worstIdx]) worstIdx = i;
  }

  return {
    totalCardsTracked: timelines.length,
    avgAnnualReturn: Math.round(avgReturn * 100) / 100,
    bestPerformer: timelines[bestIdx]?.player ?? 'N/A',
    worstPerformer: timelines[worstIdx]?.player ?? 'N/A',
    totalBacktests: backtests.length,
  };
}

export function getTopPerformers(period: '1m' | '3m' | '6m' | '1y' | 'all'): CardTimeline[] {
  const timelines = getCardTimelines();
  const monthsMap: Record<string, number> = { '1m': 1, '3m': 3, '6m': 6, '1y': 12, 'all': 999 };
  const months = monthsMap[period] ?? 999;

  return [...timelines].sort((a, b) => {
    const aSlice = months >= 999 ? a.priceHistory : a.priceHistory.slice(-months);
    const bSlice = months >= 999 ? b.priceHistory : b.priceHistory.slice(-months);
    const aReturn = aSlice.length >= 2 ? calculateReturn(aSlice[0].price, aSlice[aSlice.length - 1].price) : 0;
    const bReturn = bSlice.length >= 2 ? calculateReturn(bSlice[0].price, bSlice[bSlice.length - 1].price) : 0;
    return bReturn - aReturn;
  });
}

export function getWorstPerformers(period: '1m' | '3m' | '6m' | '1y' | 'all'): CardTimeline[] {
  const timelines = getCardTimelines();
  const monthsMap: Record<string, number> = { '1m': 1, '3m': 3, '6m': 6, '1y': 12, 'all': 999 };
  const months = monthsMap[period] ?? 999;

  return [...timelines].sort((a, b) => {
    const aSlice = months >= 999 ? a.priceHistory : a.priceHistory.slice(-months);
    const bSlice = months >= 999 ? b.priceHistory : b.priceHistory.slice(-months);
    const aReturn = aSlice.length >= 2 ? calculateReturn(aSlice[0].price, aSlice[aSlice.length - 1].price) : 0;
    const bReturn = bSlice.length >= 2 ? calculateReturn(bSlice[0].price, bSlice[bSlice.length - 1].price) : 0;
    return aReturn - bReturn;
  });
}
