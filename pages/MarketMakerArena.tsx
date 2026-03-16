import React, { useState, useMemo, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type {
  TradingBot,
  BotTrade,
  BotStrategy,
  OrderBook,
  MarketMicrostructure,
} from '../lib/marketMakerService';
import {
  getBots,
  getBotTrades,
  getStrategyPerformance,
  getOrderBook,
  getArenaLeaderboard,
  getMarketMicrostructure,
  getCardUniverse,
  getBotComparison,
} from '../lib/marketMakerService';

// ── Constants ───────────────────────────────────────────────────────────────

type TabKey =
  | 'leaderboard'
  | 'deep-dive'
  | 'order-book'
  | 'comparison'
  | 'trade-feed'
  | 'microstructure';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'leaderboard', label: 'Arena Leaderboard' },
  { key: 'deep-dive', label: 'Bot Deep Dive' },
  { key: 'order-book', label: 'Order Book Viewer' },
  { key: 'comparison', label: 'Strategy Comparison' },
  { key: 'trade-feed', label: 'Trade Feed' },
  { key: 'microstructure', label: 'Microstructure' },
];

const STRATEGY_COLORS: Record<BotStrategy, string> = {
  momentum: '#3b82f6',
  'mean-reversion': '#a855f7',
  arbitrage: '#22c55e',
  sentiment: '#f97316',
  value: '#14b8a6',
  hybrid: '#ec4899',
};

const STRATEGY_BG: Record<BotStrategy, string> = {
  momentum: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'mean-reversion': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  arbitrage: 'bg-green-500/20 text-green-400 border-green-500/30',
  sentiment: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  value: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  hybrid: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
};

const STATUS_DOT: Record<string, string> = {
  active: 'bg-green-400',
  paused: 'bg-yellow-400',
  backtesting: 'bg-gray-400',
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number, decimals = 2): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function pct(n: number): string {
  return `${(n * 100).toFixed(2)}%`;
}

function pnlClass(n: number): string {
  return n >= 0 ? 'text-green-400' : 'text-red-400';
}

function actionColor(action: string): string {
  if (action === 'buy' || action === 'bid') return 'text-green-400';
  return 'text-red-400';
}

// ── Sparkline (tiny inline line chart) ──────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const points = data.map((v, i) => ({ i, v }));
  return (
    <div className="h-8 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function MarketMakerArena() {
  const [activeTab, setActiveTab] = useState<TabKey>('leaderboard');
  const [selectedBotId, setSelectedBotId] = useState<string>('bot-001');
  const [selectedCardId, setSelectedCardId] = useState<string>('card-001');
  const [comparisonBotIds, setComparisonBotIds] = useState<string[]>([
    'bot-001',
    'bot-002',
    'bot-003',
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  // ── Data ────────────────────────────────────────────────────────────────

  const bots = useMemo(() => getBots(), []);
  const cards = useMemo(() => getCardUniverse(), []);
  const leaderboard = useMemo(() => getArenaLeaderboard(), []);

  const selectedBot = useMemo(() => bots.find((b) => b.id === selectedBotId), [bots, selectedBotId]);
  const selectedTrades = useMemo(() => getBotTrades(selectedBotId), [selectedBotId]);
  const selectedPerf = useMemo(() => getStrategyPerformance(selectedBotId), [selectedBotId]);

  const orderBook: OrderBook | undefined = useMemo(
    () => getOrderBook(selectedCardId),
    [selectedCardId],
  );
  const microstructure: MarketMicrostructure | undefined = useMemo(
    () => getMarketMicrostructure(selectedCardId),
    [selectedCardId],
  );

  const comparison = useMemo(
    () => getBotComparison(comparisonBotIds),
    [comparisonBotIds],
  );

  // All active-bot trades for the feed, sorted newest first
  const allTrades = useMemo(() => {
    const trades: BotTrade[] = [];
    bots.forEach((b) => {
      if (b.status !== 'backtesting') {
        trades.push(...getBotTrades(b.id));
      }
    });
    trades.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return trades.slice(0, 200);
  }, [bots]);

  // Equity curve from daily returns
  const equityCurve = useMemo(() => {
    if (!selectedPerf || !selectedBot) return [];
    let equity = selectedBot.capitalAllocated;
    return [
      { day: 0, equity },
      ...selectedPerf.dailyReturns.map((r, i) => {
        equity = equity * (1 + r);
        return { day: i + 1, equity: parseFloat(equity.toFixed(2)) };
      }),
    ];
  }, [selectedPerf, selectedBot]);

  // Radar data for risk metrics
  const radarData = useMemo(() => {
    if (!selectedBot || !selectedPerf) return [];
    return [
      { metric: 'Win Rate', value: selectedBot.winRate * 100 },
      { metric: 'Sharpe', value: Math.min(selectedBot.sharpeRatio * 30, 100) },
      { metric: 'Sortino', value: Math.min(selectedPerf.sortino * 25, 100) },
      { metric: 'Alpha', value: Math.min(Math.max(selectedPerf.alpha * 500 + 50, 0), 100) },
      { metric: 'Consistency', value: 100 - Math.abs(selectedBot.maxDrawdown) * 500 },
      { metric: 'Volume', value: Math.min(selectedBot.totalTrades / 10, 100) },
    ];
  }, [selectedBot, selectedPerf]);

  // Depth chart data for order book
  const depthData = useMemo(() => {
    if (!orderBook) return [];
    const bidLevels = [...orderBook.bids]
      .sort((a, b) => a.price - b.price)
      .reduce<{ price: number; bidDepth: number; askDepth: number }[]>((acc, lvl) => {
        const prev = acc.length > 0 ? acc[acc.length - 1].bidDepth : 0;
        acc.push({ price: lvl.price, bidDepth: prev + lvl.quantity, askDepth: 0 });
        return acc;
      }, []);

    const askLevels = [...orderBook.asks]
      .sort((a, b) => a.price - b.price)
      .reduce<{ price: number; bidDepth: number; askDepth: number }[]>((acc, lvl) => {
        const prev = acc.length > 0 ? acc[acc.length - 1].askDepth : 0;
        acc.push({ price: lvl.price, bidDepth: 0, askDepth: prev + lvl.quantity });
        return acc;
      }, []);

    return [...bidLevels, ...askLevels].sort((a, b) => a.price - b.price);
  }, [orderBook]);

  // Comparison overlay data
  const comparisonData = useMemo(() => {
    if (!comparison.performances.length) return [];
    const maxLen = Math.max(...comparison.performances.map((p) => p.dailyReturns.length));
    const rows: Record<string, number | string>[] = [];
    for (let d = 0; d <= maxLen; d++) {
      const row: Record<string, number | string> = { day: d };
      comparison.performances.forEach((p, idx) => {
        const bot = comparison.bots[idx];
        let cum = 1;
        for (let i = 0; i < d && i < p.dailyReturns.length; i++) {
          cum *= 1 + p.dailyReturns[i];
        }
        row[bot.name] = parseFloat(((cum - 1) * 100).toFixed(3));
      });
      rows.push(row);
    }
    return rows;
  }, [comparison]);

  // ── Loading state ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-blue-500" />
          <p className="text-gray-400">Initializing Market Maker Arena...</p>
        </div>
      </div>
    );
  }

  // ── Toggle comparison bot selection ─────────────────────────────────────

  function toggleComparisonBot(id: string) {
    setComparisonBotIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id],
    );
  }

  // ── Tab Renderers ─────────────────────────────────────────────────────

  function renderLeaderboard() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Arena Leaderboard</h2>
          <span className="text-xs text-gray-500">
            Updated {new Date(leaderboard.lastUpdated).toLocaleTimeString()}
          </span>
        </div>
        <div className="grid gap-3">
          {leaderboard.bots.map((entry) => {
            const bot = bots.find((b) => b.id === entry.botId);
            if (!bot) return null;
            const perf = getStrategyPerformance(bot.id);
            const dailyReturns = perf?.dailyReturns ?? [];
            return (
              <div
                key={entry.botId}
                className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900/80 p-4 transition-colors hover:border-gray-700 hover:bg-gray-900"
              >
                {/* Rank */}
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-800 text-lg font-bold text-gray-300">
                  {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                </div>

                {/* Avatar + Name */}
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="text-2xl">{bot.avatar}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{bot.name}</span>
                      <span className={`h-2 w-2 rounded-full ${STATUS_DOT[bot.status]}`} />
                    </div>
                    <span
                      className={`inline-block rounded border px-1.5 py-0.5 text-[10px] font-medium ${STRATEGY_BG[bot.strategy]}`}
                    >
                      {bot.strategy}
                    </span>
                  </div>
                </div>

                {/* Sparkline */}
                <Sparkline data={dailyReturns} color={STRATEGY_COLORS[bot.strategy]} />

                {/* Stats */}
                <div className="hidden gap-6 text-right text-sm md:flex">
                  <div>
                    <div className="text-gray-500">Return</div>
                    <div className={pnlClass(entry.totalReturn)}>{pct(entry.totalReturn)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Sharpe</div>
                    <div className="text-white">{entry.sharpeRatio.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Win Rate</div>
                    <div className="text-white">{pct(entry.winRate)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Trades</div>
                    <div className="text-white">{entry.tradeCount}</div>
                  </div>
                </div>

                {/* Action */}
                <button
                  onClick={() => {
                    setSelectedBotId(entry.botId);
                    setActiveTab('deep-dive');
                  }}
                  className="flex-shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-500"
                >
                  Inspect
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderDeepDive() {
    if (!selectedBot || !selectedPerf) {
      return <p className="text-gray-400">Select a bot to inspect.</p>;
    }
    return (
      <div className="space-y-6">
        {/* Bot selector */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-gray-400">Bot:</label>
          <select
            value={selectedBotId}
            onChange={(e) => setSelectedBotId(e.target.value)}
            className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white"
          >
            {bots.map((b) => (
              <option key={b.id} value={b.id}>
                {b.avatar} {b.name}
              </option>
            ))}
          </select>
          <span className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT[selectedBot.status]}`} />
          <span className="text-xs capitalize text-gray-400">{selectedBot.status}</span>
          <span
            className={`rounded border px-2 py-0.5 text-xs font-medium ${STRATEGY_BG[selectedBot.strategy]}`}
          >
            {selectedBot.strategy}
          </span>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {[
            { label: 'Capital', value: `$${fmt(selectedBot.capitalAllocated, 0)}` },
            {
              label: 'P&L',
              value: `$${fmt(selectedBot.currentPnL)}`,
              cls: pnlClass(selectedBot.currentPnL),
            },
            { label: 'Total Trades', value: String(selectedBot.totalTrades) },
            { label: 'Win Rate', value: pct(selectedBot.winRate) },
            { label: 'Sharpe', value: selectedBot.sharpeRatio.toFixed(2) },
            { label: 'Max Drawdown', value: pct(selectedBot.maxDrawdown), cls: 'text-red-400' },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-xl border border-gray-800 bg-gray-900/60 p-3">
              <div className="text-[11px] text-gray-500">{kpi.label}</div>
              <div className={`text-lg font-semibold ${kpi.cls ?? 'text-white'}`}>{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* Equity Curve */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-300">Equity Curve (30d)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={equityCurve}>
              <defs>
                <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={STRATEGY_COLORS[selectedBot.strategy]} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={STRATEGY_COLORS[selectedBot.strategy]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="day" stroke="#6b7280" tick={{ fontSize: 11 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                labelStyle={{ color: '#9ca3af' }}
                formatter={(v: number) => [`$${fmt(v)}`, 'Equity']}
              />
              <ReferenceLine y={selectedBot.capitalAllocated} stroke="#4b5563" strokeDasharray="4 4" />
              <Area
                type="monotone"
                dataKey="equity"
                stroke={STRATEGY_COLORS[selectedBot.strategy]}
                strokeWidth={2}
                fill="url(#eqGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Radar + Performance Grid */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Radar */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-300">Risk Metrics Radar</h3>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name={selectedBot.name}
                  dataKey="value"
                  stroke={STRATEGY_COLORS[selectedBot.strategy]}
                  fill={STRATEGY_COLORS[selectedBot.strategy]}
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Performance table */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-300">Performance Breakdown</h3>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-800">
                {[
                  ['Cumulative Return', pct(selectedPerf.cumulativeReturn)],
                  ['Benchmark Return', pct(selectedPerf.benchmarkReturn)],
                  ['Alpha', pct(selectedPerf.alpha)],
                  ['Beta', selectedPerf.beta.toFixed(3)],
                  ['Sortino Ratio', selectedPerf.sortino.toFixed(3)],
                  ['Calmar Ratio', selectedPerf.calmar.toFixed(3)],
                  ['Avg Hold Time', `${selectedBot.avgHoldTime}h`],
                  ['Risk Level', selectedBot.riskLevel],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td className="py-2 text-gray-400">{label}</td>
                    <td className="py-2 text-right font-medium text-white">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trade History */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-300">
            Recent Trades ({selectedTrades.length})
          </h3>
          <div className="max-h-72 overflow-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-gray-900">
                <tr className="border-b border-gray-800 text-left text-gray-500">
                  <th className="px-2 py-2">Time</th>
                  <th className="px-2 py-2">Card</th>
                  <th className="px-2 py-2">Action</th>
                  <th className="px-2 py-2 text-right">Price</th>
                  <th className="px-2 py-2 text-right">Qty</th>
                  <th className="px-2 py-2 text-right">P&L</th>
                  <th className="px-2 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {selectedTrades.slice(0, 50).map((t) => (
                  <tr key={t.id} className="hover:bg-gray-800/40">
                    <td className="whitespace-nowrap px-2 py-1.5 text-gray-400">
                      {new Date(t.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{' '}
                      {new Date(t.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="max-w-[200px] truncate px-2 py-1.5 text-gray-300">{t.cardName}</td>
                    <td className={`px-2 py-1.5 font-medium uppercase ${actionColor(t.action)}`}>
                      {t.action}
                    </td>
                    <td className="px-2 py-1.5 text-right text-white">${fmt(t.price)}</td>
                    <td className="px-2 py-1.5 text-right text-gray-300">{t.quantity}</td>
                    <td className={`px-2 py-1.5 text-right font-medium ${pnlClass(t.pnl)}`}>
                      {t.status === 'executed' ? `$${fmt(t.pnl)}` : '-'}
                    </td>
                    <td className="px-2 py-1.5">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                          t.status === 'executed'
                            ? 'bg-green-500/10 text-green-400'
                            : t.status === 'pending'
                              ? 'bg-yellow-500/10 text-yellow-400'
                              : 'bg-gray-500/10 text-gray-400'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  function renderOrderBook() {
    return (
      <div className="space-y-6">
        {/* Card selector */}
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-400">Card:</label>
          <select
            value={selectedCardId}
            onChange={(e) => setSelectedCardId(e.target.value)}
            className="max-w-md rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white"
          >
            {cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {orderBook && (
          <>
            {/* Summary strip */}
            <div className="flex flex-wrap gap-4">
              {[
                { label: 'Mid Price', value: `$${fmt(orderBook.midPrice)}` },
                { label: 'Spread', value: `$${fmt(orderBook.spread)}` },
                { label: 'Total Depth', value: `${orderBook.depth} units` },
                { label: 'Bid Levels', value: String(orderBook.bids.length) },
                { label: 'Ask Levels', value: String(orderBook.asks.length) },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg border border-gray-800 bg-gray-900/60 px-4 py-2"
                >
                  <div className="text-[10px] text-gray-500">{s.label}</div>
                  <div className="text-sm font-semibold text-white">{s.value}</div>
                </div>
              ))}
            </div>

            {/* Depth Chart */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-300">Depth Chart</h3>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={depthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis
                    dataKey="price"
                    stroke="#6b7280"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v: number) => `$${v.toFixed(0)}`}
                  />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                    formatter={(v: number, name: string) => [v, name === 'bidDepth' ? 'Bid Depth' : 'Ask Depth']}
                    labelFormatter={(v: number) => `$${Number(v).toFixed(2)}`}
                  />
                  <Area
                    type="stepAfter"
                    dataKey="bidDepth"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.2}
                    strokeWidth={2}
                    name="bidDepth"
                  />
                  <Area
                    type="stepAfter"
                    dataKey="askDepth"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.2}
                    strokeWidth={2}
                    name="askDepth"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Bid / Ask tables side by side */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Bids */}
              <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
                <h3 className="mb-2 text-sm font-semibold text-green-400">Bids</h3>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-800 text-left text-gray-500">
                      <th className="px-2 py-1.5">Price</th>
                      <th className="px-2 py-1.5 text-right">Qty</th>
                      <th className="px-2 py-1.5 text-right">Bot</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {orderBook.bids.map((lvl, i) => {
                      const bot = bots.find((b) => b.id === lvl.botId);
                      return (
                        <tr key={i} className="hover:bg-gray-800/40">
                          <td className="px-2 py-1 text-green-400">${fmt(lvl.price)}</td>
                          <td className="px-2 py-1 text-right text-gray-300">{lvl.quantity}</td>
                          <td className="px-2 py-1 text-right text-gray-400">{bot?.name ?? lvl.botId}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Asks */}
              <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
                <h3 className="mb-2 text-sm font-semibold text-red-400">Asks</h3>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-800 text-left text-gray-500">
                      <th className="px-2 py-1.5">Price</th>
                      <th className="px-2 py-1.5 text-right">Qty</th>
                      <th className="px-2 py-1.5 text-right">Bot</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {orderBook.asks.map((lvl, i) => {
                      const bot = bots.find((b) => b.id === lvl.botId);
                      return (
                        <tr key={i} className="hover:bg-gray-800/40">
                          <td className="px-2 py-1 text-red-400">${fmt(lvl.price)}</td>
                          <td className="px-2 py-1 text-right text-gray-300">{lvl.quantity}</td>
                          <td className="px-2 py-1 text-right text-gray-400">{bot?.name ?? lvl.botId}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  function renderComparison() {
    return (
      <div className="space-y-6">
        {/* Bot multi-select */}
        <div>
          <label className="mb-2 block text-sm text-gray-400">Select bots to compare:</label>
          <div className="flex flex-wrap gap-2">
            {bots
              .filter((b) => b.status !== 'backtesting')
              .map((b) => {
                const active = comparisonBotIds.includes(b.id);
                return (
                  <button
                    key={b.id}
                    onClick={() => toggleComparisonBot(b.id)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? `${STRATEGY_BG[b.strategy]} border-current`
                        : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {b.avatar} {b.name}
                  </button>
                );
              })}
          </div>
        </div>

        {/* Cumulative returns overlay */}
        {comparisonData.length > 0 && (
          <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-300">
              Cumulative Returns Comparison (%)
            </h3>
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="day" stroke="#6b7280" tick={{ fontSize: 11 }} label={{ value: 'Day', position: 'insideBottomRight', offset: -5, fill: '#6b7280', fontSize: 11 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${v.toFixed(1)}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                  formatter={(v: number) => [`${v.toFixed(3)}%`]}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine y={0} stroke="#4b5563" strokeDasharray="4 4" />
                {comparison.bots.map((b) => (
                  <Line
                    key={b.id}
                    type="monotone"
                    dataKey={b.name}
                    stroke={STRATEGY_COLORS[b.strategy]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Comparison table */}
        {comparison.bots.length > 0 && (
          <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-300">Side-by-Side Metrics</h3>
            <div className="overflow-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-800 text-left text-gray-500">
                    <th className="px-3 py-2">Metric</th>
                    {comparison.bots.map((b) => (
                      <th key={b.id} className="px-3 py-2 text-right">
                        <span style={{ color: STRATEGY_COLORS[b.strategy] }}>
                          {b.avatar} {b.name}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {[
                    { label: 'Strategy', fn: (b: TradingBot) => b.strategy },
                    { label: 'Capital', fn: (b: TradingBot) => `$${fmt(b.capitalAllocated, 0)}` },
                    { label: 'P&L', fn: (b: TradingBot) => `$${fmt(b.currentPnL)}` },
                    { label: 'Win Rate', fn: (b: TradingBot) => pct(b.winRate) },
                    { label: 'Sharpe', fn: (b: TradingBot) => b.sharpeRatio.toFixed(2) },
                    { label: 'Max Drawdown', fn: (b: TradingBot) => pct(b.maxDrawdown) },
                    { label: 'Trades', fn: (b: TradingBot) => String(b.totalTrades) },
                    { label: 'Avg Hold', fn: (b: TradingBot) => `${b.avgHoldTime}h` },
                    { label: 'Risk', fn: (b: TradingBot) => b.riskLevel },
                  ].map((row) => (
                    <tr key={row.label} className="hover:bg-gray-800/40">
                      <td className="px-3 py-1.5 text-gray-400">{row.label}</td>
                      {comparison.bots.map((b) => (
                        <td key={b.id} className="px-3 py-1.5 text-right text-white">
                          {row.fn(b)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Trade overlap among selected bots: {pct(comparison.tradeOverlap)}
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderTradeFeed() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Live Trade Feed</h2>
          <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
            {allTrades.length} recent trades
          </span>
        </div>
        <div className="max-h-[600px] space-y-1.5 overflow-auto pr-2">
          {allTrades.map((t) => {
            const bot = bots.find((b) => b.id === t.botId);
            return (
              <div
                key={t.id}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-xs ${
                  t.action === 'buy' || t.action === 'bid'
                    ? 'border-green-900/40 bg-green-950/20'
                    : 'border-red-900/40 bg-red-950/20'
                }`}
              >
                <span className="text-base">{bot?.avatar ?? '?'}</span>
                <span className="w-24 truncate font-medium text-gray-300">
                  {bot?.name ?? t.botId}
                </span>
                <span className={`w-10 font-bold uppercase ${actionColor(t.action)}`}>
                  {t.action}
                </span>
                <span className="min-w-0 flex-1 truncate text-gray-400">{t.cardName}</span>
                <span className="w-20 text-right font-medium text-white">${fmt(t.price)}</span>
                <span className="w-8 text-right text-gray-500">x{t.quantity}</span>
                {t.status === 'executed' && (
                  <span className={`w-16 text-right font-medium ${pnlClass(t.pnl)}`}>
                    {t.pnl >= 0 ? '+' : ''}${fmt(t.pnl)}
                  </span>
                )}
                {t.status === 'pending' && (
                  <span className="w-16 text-right text-yellow-400">pending</span>
                )}
                {t.status === 'cancelled' && (
                  <span className="w-16 text-right text-gray-500">cancel</span>
                )}
                <span className="w-28 text-right text-[10px] text-gray-600">
                  {new Date(t.timestamp).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderMicrostructure() {
    return (
      <div className="space-y-6">
        {/* Card selector */}
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-400">Card:</label>
          <select
            value={selectedCardId}
            onChange={(e) => setSelectedCardId(e.target.value)}
            className="max-w-md rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white"
          >
            {cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {microstructure && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-3">
                <div className="text-[10px] text-gray-500">Bid-Ask Spread</div>
                <div className="text-lg font-semibold text-white">${microstructure.bidAskSpread}</div>
              </div>
              <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-3">
                <div className="text-[10px] text-gray-500">Price Impact</div>
                <div className="text-lg font-semibold text-white">
                  {(microstructure.priceImpact * 100).toFixed(2)}%
                </div>
              </div>
              <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-3">
                <div className="text-[10px] text-gray-500">Liquidity Score</div>
                <div
                  className={`text-lg font-semibold ${
                    microstructure.liquidityScore >= 70
                      ? 'text-green-400'
                      : microstructure.liquidityScore >= 40
                        ? 'text-yellow-400'
                        : 'text-red-400'
                  }`}
                >
                  {microstructure.liquidityScore}
                </div>
              </div>
              <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-3">
                <div className="text-[10px] text-gray-500">Daily Volume</div>
                <div className="text-lg font-semibold text-white">
                  {microstructure.volumeProfile.reduce((a, v) => a + v.volume, 0)}
                </div>
              </div>
            </div>

            {/* Volume Profile */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-300">Volume Profile (24h)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={microstructure.volumeProfile}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis
                    dataKey="hour"
                    stroke="#6b7280"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(h: number) => `${h}:00`}
                  />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                    labelFormatter={(h: number) => `${h}:00 - ${h + 1}:00`}
                  />
                  <Bar dataKey="volume" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Liquidity heat map (simplified as a composed bar+line chart) */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-300">Spread &amp; Liquidity Analysis</h3>
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart
                  data={cards.map((c) => {
                    const ms = getMarketMicrostructure(c.id);
                    return {
                      name: c.name.split(' ').slice(-2).join(' '),
                      spread: ms?.bidAskSpread ?? 0,
                      liquidity: ms?.liquidityScore ?? 0,
                    };
                  })}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={60} />
                  <YAxis yAxisId="left" stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="left" dataKey="spread" fill="#f59e0b" name="Spread ($)" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="liquidity" stroke="#22d3ee" strokeWidth={2} name="Liquidity Score" dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────

  const tabContent: Record<TabKey, () => React.ReactNode> = {
    leaderboard: renderLeaderboard,
    'deep-dive': renderDeepDive,
    'order-book': renderOrderBook,
    comparison: renderComparison,
    'trade-feed': renderTradeFeed,
    microstructure: renderMicrostructure,
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 px-6 py-4 backdrop-blur">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-lg">
              🤖
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Market Maker Bot Arena</h1>
              <p className="text-xs text-gray-400">
                Deploy competing AI trading strategies on sports-card markets
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="border-b border-gray-800 bg-gray-950/60 px-6">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-6 py-6">{tabContent[activeTab]()}</main>
    </div>
  );
}
