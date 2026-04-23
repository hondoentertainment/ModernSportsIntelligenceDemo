// @ts-nocheck
import React, { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Shield,
  Zap,
} from 'lucide-react';
import { CardInventory } from '../types';
import { generatePriceHistory, calculateStatistics } from '../lib/analytics/priceChartService';

interface PriceHistoryWidgetProps {
  inventory: CardInventory[];
  onCardClick?: (_card: CardInventory) => void;
}

interface CardMover {
  card: CardInventory;
  changePct: number;
  sparklineData: number[];
}

const formatCurrency = (value: number): string =>
  value >= 1000
    ? `$${(value / 1000).toFixed(1)}k`
    : `$${value.toFixed(0)}`;

/**
 * Compute portfolio-level price points by summing each card's
 * 30-day simulated history.
 */
function buildPortfolioChart(
  inventory: CardInventory[],
): { date: string; value: number }[] {
  if (inventory.length === 0) return [];

  // Generate 30-day history for each card and merge by date
  const dateMap = new Map<string, number>();

  for (const card of inventory) {
    const history = generatePriceHistory(card, '1M');
    for (const pt of history) {
      dateMap.set(pt.date, (dateMap.get(pt.date) ?? 0) + pt.price);
    }
  }

  return Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({
      date,
      value: Math.round(value * 100) / 100,
    }));
}

/**
 * Rank cards by 30-day price change percentage.
 */
function computeMovers(inventory: CardInventory[]): CardMover[] {
  return inventory
    .map((card) => {
      const history = generatePriceHistory(card, '1M');
      if (history.length < 2) {
        return { card, changePct: 0, sparklineData: [] };
      }
      const first = history[0].price;
      const last = history[history.length - 1].price;
      const changePct = first !== 0 ? ((last - first) / first) * 100 : 0;
      // Downsample to ~10 points for sparkline
      const step = Math.max(1, Math.floor(history.length / 10));
      const sparklineData = history
        .filter((_, i) => i % step === 0 || i === history.length - 1)
        .map((p) => p.price);
      return { card, changePct: Math.round(changePct * 100) / 100, sparklineData };
    })
    .sort((a, b) => b.changePct - a.changePct);
}

const MiniSparkline: React.FC<{
  data: number[];
  color: string;
  id: string;
}> = ({ data, color, id }) => {
  if (data.length < 2) return null;
  const chartData = data.map((value, index) => ({ value, index }));
  return (
    <div className="w-16 h-6">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 1, right: 0, left: 0, bottom: 1 }}>
          <defs>
            <linearGradient id={`sparkGrad-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#sparkGrad-${id})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const MoverRow: React.FC<{
  mover: CardMover;
  onClick?: (_card: CardInventory) => void;
}> = ({ mover, onClick }) => {
  const isUp = mover.changePct >= 0;
  return (
    <button
      onClick={() => onClick?.(mover.card)}
      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-brand-charcoal/30 border border-slate-800 hover:border-slate-600 transition-colors text-left"
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-white truncate">
          {mover.card.player}
        </p>
        <p className="text-[9px] text-brand-muted truncate">
          {mover.card.year} {mover.card.set}
        </p>
      </div>
      <MiniSparkline
        data={mover.sparklineData}
        color={isUp ? '#22C55E' : '#EF4444'}
        id={`mover-${mover.card.id}`}
      />
      <div
        className={`ml-2 text-xs font-mono font-bold tabular-nums ${
          isUp ? 'text-green-400' : 'text-red-400'
        }`}
      >
        {isUp ? '+' : ''}
        {mover.changePct.toFixed(1)}%
      </div>
    </button>
  );
};

const PriceHistoryWidget: React.FC<PriceHistoryWidgetProps> = ({
  inventory,
  onCardClick,
}) => {
  const portfolioChart = useMemo(() => buildPortfolioChart(inventory), [inventory]);

  const movers = useMemo(() => computeMovers(inventory), [inventory]);

  const topGainers = useMemo(() => movers.slice(0, 5), [movers]);
  const topLosers = useMemo(
    () => [...movers].sort((a, b) => a.changePct - b.changePct).slice(0, 5),
    [movers],
  );

  // Summary stats
  const summary = useMemo(() => {
    if (inventory.length === 0) {
      return { avgVolatility: 0, mostVolatile: null, mostStable: null };
    }

    const volatilities = inventory.map((card) => {
      const history = generatePriceHistory(card, '1M');
      const stats = calculateStatistics(history);
      return { card, volatility: stats.volatility };
    });

    const avgVolatility =
      volatilities.reduce((s, v) => s + v.volatility, 0) / volatilities.length;

    const sorted = [...volatilities].sort(
      (a, b) => b.volatility - a.volatility,
    );
    const mostVolatile = sorted[0]?.card ?? null;
    const mostStable = sorted[sorted.length - 1]?.card ?? null;

    return {
      avgVolatility: Math.round(avgVolatility * 10000) / 100,
      mostVolatile,
      mostStable,
    };
  }, [inventory]);

  // Portfolio value change
  const portfolioChange = useMemo(() => {
    if (portfolioChart.length < 2) return { amount: 0, pct: 0 };
    const first = portfolioChart[0].value;
    const last = portfolioChart[portfolioChart.length - 1].value;
    const amount = last - first;
    const pct = first !== 0 ? (amount / first) * 100 : 0;
    return {
      amount: Math.round(amount * 100) / 100,
      pct: Math.round(pct * 100) / 100,
    };
  }, [portfolioChart]);

  const isPortfolioUp = portfolioChange.amount >= 0;

  if (inventory.length === 0) {
    return (
      <div className="bg-brand-slate rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-brand-lime/10 rounded-xl border border-brand-lime/20">
            <BarChart3 size={18} className="text-brand-lime" />
          </div>
          <h3 className="text-sm font-bebas tracking-widest text-white uppercase">
            Price Trends
          </h3>
        </div>
        <p className="text-xs text-brand-muted text-center py-8">
          Add cards to see price trends
        </p>
      </div>
    );
  }

  return (
    <div className="bg-brand-slate rounded-2xl border border-slate-800 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-lime/10 rounded-xl border border-brand-lime/20">
            <BarChart3 size={18} className="text-brand-lime" />
          </div>
          <div>
            <h3 className="text-sm font-bebas tracking-widest text-white uppercase">
              Price Trends
            </h3>
            <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">
              30-Day Portfolio Performance
            </p>
          </div>
        </div>
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
            isPortfolioUp
              ? 'bg-green-500/10 text-green-400'
              : 'bg-red-500/10 text-red-400'
          }`}
        >
          {isPortfolioUp ? (
            <TrendingUp size={12} />
          ) : (
            <TrendingDown size={12} />
          )}
          {isPortfolioUp ? '+' : ''}
          {portfolioChange.pct.toFixed(1)}%
        </div>
      </div>

      {/* Portfolio Mini Chart */}
      <div className="bg-brand-charcoal/30 rounded-xl border border-slate-800 p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-black text-brand-muted uppercase tracking-widest">
            Portfolio Value
          </span>
          <span className="text-sm font-mono font-bold text-white">
            {formatCurrency(
              portfolioChart[portfolioChart.length - 1]?.value ?? 0,
            )}
          </span>
        </div>
        <div className="h-20">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={portfolioChart}
              margin={{ top: 2, right: 0, left: 0, bottom: 2 }}
            >
              <defs>
                <linearGradient
                  id="portfolioGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={isPortfolioUp ? '#ADFF2F' : '#EF4444'}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={isPortfolioUp ? '#2DD4BF' : '#EF4444'}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={isPortfolioUp ? '#ADFF2F' : '#EF4444'}
                strokeWidth={2}
                fill="url(#portfolioGradient)"
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Movers Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Top Gainers */}
        <div>
          <h4 className="text-[9px] font-black text-green-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <TrendingUp size={12} />
            Top Gainers
          </h4>
          <div className="space-y-1.5">
            {topGainers.map((m) => (
              <MoverRow key={m.card.id} mover={m} onClick={onCardClick} />
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div>
          <h4 className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <TrendingDown size={12} />
            Top Losers
          </h4>
          <div className="space-y-1.5">
            {topLosers.map((m) => (
              <MoverRow key={m.card.id} mover={m} onClick={onCardClick} />
            ))}
          </div>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-brand-charcoal/40 rounded-xl p-3 border border-slate-800">
          <div className="flex items-center gap-1.5 mb-1">
            <Activity size={10} className="text-brand-muted" />
            <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">
              Avg Volatility
            </p>
          </div>
          <p
            className={`text-sm font-mono font-bold ${
              summary.avgVolatility > 50
                ? 'text-red-400'
                : summary.avgVolatility > 25
                  ? 'text-yellow-400'
                  : 'text-green-400'
            }`}
          >
            {summary.avgVolatility.toFixed(1)}%
          </p>
        </div>
        <div className="bg-brand-charcoal/40 rounded-xl p-3 border border-slate-800">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap size={10} className="text-brand-muted" />
            <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">
              Most Volatile
            </p>
          </div>
          <p className="text-xs font-bold text-red-400 truncate">
            {summary.mostVolatile?.player ?? '-'}
          </p>
        </div>
        <div className="bg-brand-charcoal/40 rounded-xl p-3 border border-slate-800">
          <div className="flex items-center gap-1.5 mb-1">
            <Shield size={10} className="text-brand-muted" />
            <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">
              Most Stable
            </p>
          </div>
          <p className="text-xs font-bold text-green-400 truncate">
            {summary.mostStable?.player ?? '-'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PriceHistoryWidget);
