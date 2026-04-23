// @ts-nocheck
// ── Market Maker Bot Arena Service ──────────────────────────────────────────
// Provides types, mock data generators, and accessor functions for a
// competitive AI trading-bot arena where collectors deploy automated
// bid/ask strategies on sports-card markets.

// ── Types ───────────────────────────────────────────────────────────────────

export type BotStrategy =
  | 'momentum'
  | 'mean-reversion'
  | 'arbitrage'
  | 'sentiment'
  | 'value'
  | 'hybrid';

export type BotStatus = 'active' | 'paused' | 'backtesting';

export type RiskLevel = 'conservative' | 'moderate' | 'aggressive';

export type TradeAction = 'buy' | 'sell' | 'bid' | 'ask';

export type TradeStatus = 'executed' | 'pending' | 'cancelled';

export interface TradingBot {
  id: string;
  name: string;
  strategy: BotStrategy;
  status: BotStatus;
  capitalAllocated: number;
  currentPnL: number;
  totalTrades: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  avgHoldTime: number; // hours
  createdAt: string;
  riskLevel: RiskLevel;
  description: string;
  avatar: string; // emoji
}

export interface BotTrade {
  id: string;
  botId: string;
  cardId: string;
  cardName: string;
  action: TradeAction;
  price: number;
  quantity: number;
  timestamp: string;
  status: TradeStatus;
  pnl: number;
}

export interface StrategyPerformance {
  botId: string;
  dailyReturns: number[];
  weeklyReturns: number[];
  monthlyReturns: number[];
  cumulativeReturn: number;
  benchmarkReturn: number;
  alpha: number;
  beta: number;
  sortino: number;
  calmar: number;
}

export interface OrderBookLevel {
  price: number;
  quantity: number;
  botId: string;
}

export interface OrderBook {
  cardId: string;
  cardName: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  spread: number;
  midPrice: number;
  depth: number;
}

export interface LeaderboardEntry {
  botId: string;
  rank: number;
  totalReturn: number;
  sharpeRatio: number;
  winRate: number;
  tradeCount: number;
}

export interface ArenaLeaderboard {
  bots: LeaderboardEntry[];
  lastUpdated: string;
}

export interface MarketMicrostructure {
  cardId: string;
  cardName: string;
  bidAskSpread: number;
  volumeProfile: { hour: number; volume: number }[];
  priceImpact: number;
  liquidityScore: number;
}

export interface BotComparison {
  botIds: string[];
  bots: TradingBot[];
  performances: StrategyPerformance[];
  tradeOverlap: number;
}

export interface SimulationResult {
  strategy: BotStrategy;
  projectedReturn: number;
  projectedSharpe: number;
  projectedMaxDrawdown: number;
  equityCurve: number[];
  tradeCount: number;
  winRate: number;
}

// ── Seeded PRNG for deterministic mock data ─────────────────────────────────

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seededRandom(42);

function randomBetween(min: number, max: number): number {
  return min + rand() * (max - min);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

// ── Card Universe ───────────────────────────────────────────────────────────

const CARD_UNIVERSE: { id: string; name: string; basePrice: number }[] = [
  { id: 'card-001', name: '2023 Topps Chrome Victor Wembanyama RC #1', basePrice: 485.0 },
  { id: 'card-002', name: '2022 Panini Prizm Ja Morant Silver #118', basePrice: 220.5 },
  { id: 'card-003', name: '2018 Panini Prizm Luka Doncic RC #280', basePrice: 1250.0 },
  { id: 'card-004', name: '2020 Topps Chrome Luis Robert RC #60', basePrice: 95.0 },
  { id: 'card-005', name: '2023 Bowman Chrome Elly De La Cruz 1st #BCP-12', basePrice: 340.0 },
  { id: 'card-006', name: '2019 Panini Mosaic Zion Williamson RC #209', basePrice: 175.0 },
  { id: 'card-007', name: '2021 Topps Update Juan Soto HR Derby #US50', basePrice: 62.0 },
  { id: 'card-008', name: '2023 Panini Prizm Chet Holmgren RC #231', basePrice: 130.0 },
  { id: 'card-009', name: '2022 Topps Chrome Julio Rodriguez RC #44', basePrice: 285.0 },
  { id: 'card-010', name: '2020 Panini Select Justin Herbert RC #44', basePrice: 410.0 },
];

// ── Pre-built Bot Strategies ────────────────────────────────────────────────

const BOTS: TradingBot[] = [
  {
    id: 'bot-001',
    name: 'MomentumHawk',
    strategy: 'momentum',
    status: 'active',
    capitalAllocated: 25000,
    currentPnL: 3842.5,
    totalTrades: 347,
    winRate: 0.584,
    sharpeRatio: 1.82,
    maxDrawdown: -0.087,
    avgHoldTime: 18.4,
    createdAt: '2026-02-13T08:00:00Z',
    riskLevel: 'aggressive',
    description:
      'Rides price breakouts on trending rookies. Enters on volume spikes above the 20-day moving average and trails a 5 % stop-loss.',
    avatar: '🦅',
  },
  {
    id: 'bot-002',
    name: 'RevertBot',
    strategy: 'mean-reversion',
    status: 'active',
    capitalAllocated: 30000,
    currentPnL: 2215.8,
    totalTrades: 512,
    winRate: 0.638,
    sharpeRatio: 2.14,
    maxDrawdown: -0.054,
    avgHoldTime: 42.1,
    createdAt: '2026-02-10T14:30:00Z',
    riskLevel: 'conservative',
    description:
      'Fades overreactions. Buys when a card drops >2 standard deviations below its 30-day mean and sells on reversion to the mean.',
    avatar: '🔄',
  },
  {
    id: 'bot-003',
    name: 'ArbHunter',
    strategy: 'arbitrage',
    status: 'active',
    capitalAllocated: 50000,
    currentPnL: 5120.3,
    totalTrades: 891,
    winRate: 0.712,
    sharpeRatio: 2.67,
    maxDrawdown: -0.032,
    avgHoldTime: 2.3,
    createdAt: '2026-02-05T09:15:00Z',
    riskLevel: 'moderate',
    description:
      'Scans cross-platform price discrepancies between eBay, COMC, and MySlabs. Executes near-instant round-trip trades.',
    avatar: '⚡',
  },
  {
    id: 'bot-004',
    name: 'SentimentSurfer',
    strategy: 'sentiment',
    status: 'active',
    capitalAllocated: 20000,
    currentPnL: 1680.0,
    totalTrades: 263,
    winRate: 0.555,
    sharpeRatio: 1.45,
    maxDrawdown: -0.112,
    avgHoldTime: 28.7,
    createdAt: '2026-02-18T11:00:00Z',
    riskLevel: 'aggressive',
    description:
      'Monitors social-media buzz, injury reports, and trade rumors. Goes long on positive sentiment shifts before the market prices them in.',
    avatar: '📡',
  },
  {
    id: 'bot-005',
    name: 'DeepValue',
    strategy: 'value',
    status: 'active',
    capitalAllocated: 40000,
    currentPnL: 4475.2,
    totalTrades: 184,
    winRate: 0.625,
    sharpeRatio: 1.96,
    maxDrawdown: -0.068,
    avgHoldTime: 168.0,
    createdAt: '2026-02-01T07:45:00Z',
    riskLevel: 'conservative',
    description:
      'Identifies cards trading below intrinsic value using population-report scarcity, player trajectory, and historical comp analysis.',
    avatar: '🔍',
  },
  {
    id: 'bot-006',
    name: 'HybridAlpha',
    strategy: 'hybrid',
    status: 'active',
    capitalAllocated: 35000,
    currentPnL: 3190.6,
    totalTrades: 421,
    winRate: 0.602,
    sharpeRatio: 2.08,
    maxDrawdown: -0.045,
    avgHoldTime: 36.5,
    createdAt: '2026-02-08T16:20:00Z',
    riskLevel: 'moderate',
    description:
      'Blends momentum and mean-reversion signals with sentiment weighting. Dynamically adjusts factor exposure based on regime detection.',
    avatar: '🧬',
  },
  {
    id: 'bot-007',
    name: 'ScalpKing',
    strategy: 'momentum',
    status: 'paused',
    capitalAllocated: 15000,
    currentPnL: -412.3,
    totalTrades: 1023,
    winRate: 0.521,
    sharpeRatio: 0.87,
    maxDrawdown: -0.156,
    avgHoldTime: 0.8,
    createdAt: '2026-02-20T13:00:00Z',
    riskLevel: 'aggressive',
    description:
      'Ultra-high-frequency scalper targeting micro-spreads. Currently paused due to elevated transaction costs eating into thin margins.',
    avatar: '👑',
  },
  {
    id: 'bot-008',
    name: 'BacktestLab',
    strategy: 'value',
    status: 'backtesting',
    capitalAllocated: 10000,
    currentPnL: 0,
    totalTrades: 0,
    winRate: 0,
    sharpeRatio: 0,
    maxDrawdown: 0,
    avgHoldTime: 0,
    createdAt: '2026-03-10T10:00:00Z',
    riskLevel: 'moderate',
    description:
      'Experimental deep-value variant currently running historical simulations on 5 years of PSA-10 rookie data before going live.',
    avatar: '🧪',
  },
];

// ── Daily-returns generator (30 days per bot) ───────────────────────────────

function generateDailyReturns(bot: TradingBot): number[] {
  const days = 30;
  const returns: number[] = [];
  const drift =
    bot.currentPnL > 0
      ? 0.002 + rand() * 0.003
      : -0.001 + rand() * 0.002;
  const vol =
    bot.riskLevel === 'aggressive'
      ? 0.025
      : bot.riskLevel === 'moderate'
        ? 0.015
        : 0.008;

  for (let i = 0; i < days; i++) {
    const r = drift + vol * (rand() - 0.5) * 2;
    returns.push(parseFloat(r.toFixed(5)));
  }
  return returns;
}

function aggregateWeekly(daily: number[]): number[] {
  const weekly: number[] = [];
  for (let i = 0; i < daily.length; i += 7) {
    const slice = daily.slice(i, i + 7);
    const weekReturn = slice.reduce((a, b) => (1 + a) * (1 + b) - 1, 0);
    weekly.push(parseFloat(weekReturn.toFixed(5)));
  }
  return weekly;
}

function aggregateMonthly(daily: number[]): number[] {
  const cum = daily.reduce((a, b) => (1 + a) * (1 + b) - 1, 0);
  return [parseFloat(cum.toFixed(5))];
}

// ── Trade generator (50+ trades per active bot) ─────────────────────────────

function generateTradesForBot(bot: TradingBot): BotTrade[] {
  if (bot.status === 'backtesting') return [];
  const count = Math.max(52, Math.floor(bot.totalTrades * 0.15));
  const trades: BotTrade[] = [];
  const actions: TradeAction[] = ['buy', 'sell', 'bid', 'ask'];
  const statuses: TradeStatus[] = ['executed', 'executed', 'executed', 'pending', 'cancelled'];

  for (let i = 0; i < count; i++) {
    const card = pick(CARD_UNIVERSE);
    const action = pick(actions);
    const priceNoise = card.basePrice * randomBetween(-0.08, 0.08);
    const price = parseFloat((card.basePrice + priceNoise).toFixed(2));
    const status = pick(statuses);
    const pnl =
      status === 'executed'
        ? parseFloat((randomBetween(-price * 0.06, price * 0.12)).toFixed(2))
        : 0;

    const dayOffset = Math.floor(randomBetween(0, 30));
    const hourOffset = Math.floor(randomBetween(0, 24));
    const minOffset = Math.floor(randomBetween(0, 60));
    const ts = new Date(2026, 1, 13 + dayOffset, hourOffset, minOffset);

    trades.push({
      id: `trade-${bot.id}-${String(i).padStart(4, '0')}`,
      botId: bot.id,
      cardId: card.id,
      cardName: card.name,
      action,
      price,
      quantity: Math.ceil(randomBetween(1, 4)),
      timestamp: ts.toISOString(),
      status,
      pnl,
    });
  }

  trades.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return trades;
}

// ── Order book generator (per card) ─────────────────────────────────────────

function generateOrderBook(card: { id: string; name: string; basePrice: number }): OrderBook {
  const bids: OrderBookLevel[] = [];
  const asks: OrderBookLevel[] = [];
  const activeBots = BOTS.filter((b) => b.status === 'active');

  for (let i = 0; i < 8; i++) {
    const bot = pick(activeBots);
    const offset = randomBetween(0.005, 0.04) * card.basePrice;
    bids.push({
      price: parseFloat((card.basePrice - offset).toFixed(2)),
      quantity: Math.ceil(randomBetween(1, 5)),
      botId: bot.id,
    });
  }

  for (let i = 0; i < 8; i++) {
    const bot = pick(activeBots);
    const offset = randomBetween(0.005, 0.04) * card.basePrice;
    asks.push({
      price: parseFloat((card.basePrice + offset).toFixed(2)),
      quantity: Math.ceil(randomBetween(1, 5)),
      botId: bot.id,
    });
  }

  bids.sort((a, b) => b.price - a.price);
  asks.sort((a, b) => a.price - b.price);

  const bestBid = bids[0].price;
  const bestAsk = asks[0].price;
  const spread = parseFloat((bestAsk - bestBid).toFixed(2));
  const midPrice = parseFloat(((bestAsk + bestBid) / 2).toFixed(2));
  const depth =
    bids.reduce((s, l) => s + l.quantity, 0) + asks.reduce((s, l) => s + l.quantity, 0);

  return { cardId: card.id, cardName: card.name, bids, asks, spread, midPrice, depth };
}

// ── Microstructure generator ────────────────────────────────────────────────

function generateMicrostructure(card: {
  id: string;
  name: string;
  basePrice: number;
}): MarketMicrostructure {
  const volumeProfile: { hour: number; volume: number }[] = [];
  for (let h = 0; h < 24; h++) {
    // volume peaks at 10-11 AM and 7-9 PM
    const base =
      (h >= 9 && h <= 11) || (h >= 19 && h <= 21)
        ? randomBetween(80, 150)
        : randomBetween(5, 50);
    volumeProfile.push({ hour: h, volume: Math.round(base) });
  }

  return {
    cardId: card.id,
    cardName: card.name,
    bidAskSpread: parseFloat((randomBetween(0.5, 3.5)).toFixed(2)),
    volumeProfile,
    priceImpact: parseFloat((randomBetween(0.002, 0.015)).toFixed(4)),
    liquidityScore: parseFloat((randomBetween(40, 98)).toFixed(1)),
  };
}

// ── Pre-compute caches ──────────────────────────────────────────────────────

const dailyReturnsCache = new Map<string, number[]>();
const tradesCache = new Map<string, BotTrade[]>();
const orderBookCache = new Map<string, OrderBook>();
const microstructureCache = new Map<string, MarketMicrostructure>();

BOTS.forEach((bot) => {
  dailyReturnsCache.set(bot.id, generateDailyReturns(bot));
  tradesCache.set(bot.id, generateTradesForBot(bot));
});

CARD_UNIVERSE.forEach((card) => {
  orderBookCache.set(card.id, generateOrderBook(card));
  microstructureCache.set(card.id, generateMicrostructure(card));
});

// ── Performance builder ─────────────────────────────────────────────────────

function buildPerformance(bot: TradingBot): StrategyPerformance {
  const daily = dailyReturnsCache.get(bot.id) ?? [];
  const weekly = aggregateWeekly(daily);
  const monthly = aggregateMonthly(daily);
  const cumReturn = daily.reduce((a, b) => (1 + a) * (1 + b) - 1, 0);
  const benchmarkReturn = parseFloat((randomBetween(0.02, 0.06)).toFixed(4));

  const mean = daily.reduce((a, b) => a + b, 0) / daily.length;
  const downside = daily.filter((r) => r < 0);
  const downsideDev =
    downside.length > 0
      ? Math.sqrt(downside.reduce((a, r) => a + r * r, 0) / downside.length)
      : 0.001;
  const sortino = parseFloat((mean / downsideDev).toFixed(3));

  const maxDd = Math.abs(bot.maxDrawdown) || 0.01;
  const annualReturn = cumReturn * 12; // rough annualization from 30 days
  const calmar = parseFloat((annualReturn / maxDd).toFixed(3));

  return {
    botId: bot.id,
    dailyReturns: daily,
    weeklyReturns: weekly,
    monthlyReturns: monthly,
    cumulativeReturn: parseFloat(cumReturn.toFixed(5)),
    benchmarkReturn,
    alpha: parseFloat((cumReturn - benchmarkReturn).toFixed(5)),
    beta: parseFloat((randomBetween(0.4, 1.3)).toFixed(3)),
    sortino,
    calmar,
  };
}

// ── Public API ──────────────────────────────────────────────────────────────

export function getBots(): TradingBot[] {
  return BOTS;
}

export function getBotDetail(id: string): TradingBot | undefined {
  return BOTS.find((b) => b.id === id);
}

export function getBotTrades(id: string): BotTrade[] {
  return tradesCache.get(id) ?? [];
}

export function getStrategyPerformance(id: string): StrategyPerformance | undefined {
  const bot = BOTS.find((b) => b.id === id);
  if (!bot) return undefined;
  return buildPerformance(bot);
}

export function getOrderBook(cardId: string): OrderBook | undefined {
  return orderBookCache.get(cardId);
}

export function getArenaLeaderboard(): ArenaLeaderboard {
  const entries: LeaderboardEntry[] = BOTS.filter((b) => b.status !== 'backtesting')
    .map((bot) => {
      const perf = buildPerformance(bot);
      return {
        botId: bot.id,
        rank: 0,
        totalReturn: perf.cumulativeReturn,
        sharpeRatio: bot.sharpeRatio,
        winRate: bot.winRate,
        tradeCount: bot.totalTrades,
      };
    })
    .sort((a, b) => b.totalReturn - a.totalReturn)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  return { bots: entries, lastUpdated: new Date().toISOString() };
}

export function getMarketMicrostructure(cardId: string): MarketMicrostructure | undefined {
  return microstructureCache.get(cardId);
}

export function simulateBotStrategy(
  strategy: BotStrategy,
  params: { capital?: number; riskLevel?: RiskLevel; days?: number } = {},
): SimulationResult {
  const { capital = 10000, riskLevel = 'moderate', days = 30 } = params;
  const vol =
    riskLevel === 'aggressive' ? 0.03 : riskLevel === 'moderate' ? 0.018 : 0.009;

  const driftMap: Record<BotStrategy, number> = {
    momentum: 0.004,
    'mean-reversion': 0.003,
    arbitrage: 0.005,
    sentiment: 0.002,
    value: 0.0035,
    hybrid: 0.0038,
  };
  const drift = driftMap[strategy];

  const equityCurve: number[] = [capital];
  let peak = capital;
  let maxDd = 0;
  let wins = 0;
  const tradeCount = Math.floor(randomBetween(days * 2, days * 8));

  for (let d = 1; d <= days; d++) {
    const r = drift + vol * (rand() - 0.5) * 2;
    const prev = equityCurve[equityCurve.length - 1];
    const next = parseFloat((prev * (1 + r)).toFixed(2));
    equityCurve.push(next);
    if (next > peak) peak = next;
    const dd = (next - peak) / peak;
    if (dd < maxDd) maxDd = dd;
    if (r > 0) wins++;
  }

  const totalReturn = (equityCurve[equityCurve.length - 1] - capital) / capital;
  const winRate = wins / days;
  const dailyReturns: number[] = [];
  for (let i = 1; i < equityCurve.length; i++) {
    dailyReturns.push((equityCurve[i] - equityCurve[i - 1]) / equityCurve[i - 1]);
  }
  const mean = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
  const std = Math.sqrt(
    dailyReturns.reduce((a, r) => a + (r - mean) ** 2, 0) / dailyReturns.length,
  );
  const sharpe = std > 0 ? parseFloat(((mean / std) * Math.sqrt(252)).toFixed(3)) : 0;

  return {
    strategy,
    projectedReturn: parseFloat(totalReturn.toFixed(5)),
    projectedSharpe: sharpe,
    projectedMaxDrawdown: parseFloat(maxDd.toFixed(5)),
    equityCurve,
    tradeCount,
    winRate: parseFloat(winRate.toFixed(3)),
  };
}

export function getBotComparison(botIds: string[]): BotComparison {
  const bots = botIds.map((id) => BOTS.find((b) => b.id === id)).filter(Boolean) as TradingBot[];
  const performances = bots.map((b) => buildPerformance(b));

  // Trade overlap: fraction of cards traded by all selected bots
  const tradeSets = bots.map((b) => {
    const trades = tradesCache.get(b.id) ?? [];
    return new Set(trades.map((t) => t.cardId));
  });

  let overlap = 0;
  if (tradeSets.length >= 2) {
    const first = tradeSets[0];
    const common = [...first].filter((cardId) => tradeSets.every((s) => s.has(cardId)));
    const union = new Set(tradeSets.flatMap((s) => [...s]));
    overlap = union.size > 0 ? common.length / union.size : 0;
  }

  return {
    botIds,
    bots,
    performances,
    tradeOverlap: parseFloat(overlap.toFixed(3)),
  };
}

// ── Convenience: card list for UI selectors ─────────────────────────────────

export function getCardUniverse(): { id: string; name: string; basePrice: number }[] {
  return CARD_UNIVERSE;
}
