import React, { useState, useMemo, useCallback } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import {
  X,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Eye,
  EyeOff,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  generatePriceHistory,
  calculateStatistics,
  getAnnotations,
  calculateMovingAverage,
  calculateBollingerBands,
  ChartTimeRange,
  ChartAnnotation,
} from '../lib/analytics/priceChartService';

interface PriceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardInventory | null;
}

const TIME_RANGES: ChartTimeRange[] = ['1W', '1M', '3M', '6M', '1Y', 'ALL'];

const formatCurrency = (value: number): string =>
  value >= 1000
    ? `$${(value / 1000).toFixed(1)}k`
    : `$${value.toFixed(2)}`;

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatFullDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

interface ChartDataPoint {
  date: string;
  price: number;
  volume: number;
  high: number;
  low: number;
  source: string;
  ma?: number | null;
  bbUpper?: number | null;
  bbLower?: number | null;
  bbMiddle?: number | null;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const CustomTooltip = ({ active, payload, _label }: any) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload as ChartDataPoint | undefined;
  if (!data) return null;

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl">
      <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
        {formatFullDate(data.date)}
      </p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-brand-muted">Price</span>
          <span className="text-sm font-mono font-bold text-white">
            ${data.price.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-brand-muted">High</span>
          <span className="text-xs font-mono text-green-400">
            ${data.high.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-brand-muted">Low</span>
          <span className="text-xs font-mono text-red-400">
            ${data.low.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-brand-muted">Volume</span>
          <span className="text-xs font-mono text-brand-muted">
            {data.volume}
          </span>
        </div>
      </div>
    </div>
  );
};
/* eslint-enable @typescript-eslint/no-explicit-any */

const StatCard: React.FC<{
  label: string;
  value: string;
  color?: string;
}> = ({ label, value, color = 'text-white' }) => (
  <div className="bg-brand-charcoal/40 rounded-xl p-3 border border-slate-800">
    <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">
      {label}
    </p>
    <p className={`text-base font-mono font-bold ${color}`}>{value}</p>
  </div>
);

const PriceHistoryModal: React.FC<PriceHistoryModalProps> = ({
  isOpen,
  onClose,
  card,
}) => {
  const [range, setRange] = useState<ChartTimeRange>('3M');
  const [showMA, setShowMA] = useState(false);
  const [showBB, setShowBB] = useState(false);

  const priceData = useMemo(() => {
    if (!card) return [];
    return generatePriceHistory(card, range);
  }, [card, range]);

  const stats = useMemo(() => calculateStatistics(priceData), [priceData]);

  const annotations = useMemo(() => {
    if (!card) return [];
    return getAnnotations(card);
  }, [card]);

  const maData = useMemo(
    () => calculateMovingAverage(priceData, 20),
    [priceData],
  );

  const bbData = useMemo(
    () => calculateBollingerBands(priceData, 20, 2),
    [priceData],
  );

  // Merge all overlays into one dataset for Recharts
  const chartData: ChartDataPoint[] = useMemo(() => {
    return priceData.map((pt, i) => ({
      ...pt,
      ma: showMA ? maData[i]?.ma ?? null : null,
      bbUpper: showBB ? bbData[i]?.upper ?? null : null,
      bbLower: showBB ? bbData[i]?.lower ?? null : null,
      bbMiddle: showBB ? bbData[i]?.middle ?? null : null,
    }));
  }, [priceData, maData, bbData, showMA, showBB]);

  // Annotations that fall within the current data range
  const visibleAnnotations = useMemo(() => {
    if (chartData.length === 0) return [];
    const dateSet = new Set(chartData.map((d) => d.date));
    return annotations.filter((a) => dateSet.has(a.date));
  }, [annotations, chartData]);

  const annotationColor = (type: ChartAnnotation['type']): string => {
    switch (type) {
      case 'purchase':
        return '#FBBF24';
      case 'sale':
        return '#EF4444';
      case 'grade':
        return '#3B82F6';
      case 'catalyst':
        return '#A855F7';
      case 'milestone':
        return '#22C55E';
      default:
        return '#94A3B8';
    }
  };

  // Find price at annotation date
  const getAnnotationPrice = useCallback(
    (date: string): number | null => {
      const pt = priceData.find((p) => p.date === date);
      return pt?.price ?? null;
    },
    [priceData],
  );

  if (!isOpen || !card) return null;

  const currentPrice = card.currentValue ?? card.purchasePrice;
  const change = stats.priceChange;
  const changePct = stats.priceChangePct;
  const isPositive = change >= 0;

  // Y-axis domain with padding
  const prices = chartData.map((d) => d.price);
  const allValues = [
    ...prices,
    ...(showBB
      ? chartData
          .filter((d) => d.bbUpper != null)
          .flatMap((d) => [d.bbUpper!, d.bbLower!])
      : []),
    card.purchasePrice,
  ];
  const yMin = Math.min(...allValues) * 0.95;
  const yMax = Math.max(...allValues) * 1.05;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-700 flex items-center justify-between bg-gradient-to-r from-brand-charcoal/60 to-brand-charcoal/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-lime/10 rounded-2xl border border-brand-lime/20">
              <BarChart3 size={24} className="text-brand-lime" />
            </div>
            <div>
              <h2 className="text-2xl font-bebas tracking-widest text-white">
                Price History
              </h2>
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
                {card.player} &bull; {card.year} {card.manufacturer} {card.set}{' '}
                #{card.cardNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-3 bg-brand-charcoal hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X size={20} className="text-brand-muted" />
          </button>
        </div>

        <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Price Change Banner */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-3xl font-mono font-bold text-white">
                ${currentPrice.toFixed(2)}
              </span>
              <div
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-mono font-bold ${
                  isPositive
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-red-500/10 text-red-400'
                }`}
              >
                {isPositive ? (
                  <TrendingUp size={16} />
                ) : (
                  <TrendingDown size={16} />
                )}
                {isPositive ? '+' : ''}
                ${change.toFixed(2)} ({isPositive ? '+' : ''}
                {changePct.toFixed(2)}%)
              </div>
            </div>

            {/* Overlay Toggles */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMA(!showMA)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${
                  showMA
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'bg-brand-charcoal text-brand-muted border border-slate-800 hover:border-slate-600'
                }`}
              >
                {showMA ? <Eye size={12} /> : <EyeOff size={12} />}
                SMA 20
              </button>
              <button
                onClick={() => setShowBB(!showBB)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${
                  showBB
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'bg-brand-charcoal text-brand-muted border border-slate-800 hover:border-slate-600'
                }`}
              >
                {showBB ? <Eye size={12} /> : <EyeOff size={12} />}
                Bollinger
              </button>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-1.5">
            {TIME_RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${
                  range === r
                    ? 'bg-brand-lime/20 text-brand-lime border border-brand-lime/30'
                    : 'bg-brand-charcoal text-brand-muted border border-slate-800 hover:border-slate-600'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Main Price Chart */}
          <div className="bg-brand-charcoal/30 rounded-2xl border border-slate-800 p-4">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="priceGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#ADFF2F"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="50%"
                      stopColor="#2DD4BF"
                      stopOpacity={0.1}
                    />
                    <stop
                      offset="95%"
                      stopColor="#2DD4BF"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient
                    id="bbGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#A855F7"
                      stopOpacity={0.1}
                    />
                    <stop
                      offset="95%"
                      stopColor="#A855F7"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                </defs>

                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={40}
                />
                <YAxis
                  domain={[yMin, yMax]}
                  tickFormatter={formatCurrency}
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />

                {/* Bollinger Bands shaded area */}
                {showBB && (
                  <>
                    <Area
                      type="monotone"
                      dataKey="bbUpper"
                      stroke="#A855F7"
                      strokeWidth={1}
                      strokeDasharray="4 4"
                      fill="none"
                      dot={false}
                      isAnimationActive={false}
                      connectNulls={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="bbLower"
                      stroke="#A855F7"
                      strokeWidth={1}
                      strokeDasharray="4 4"
                      fill="url(#bbGradient)"
                      dot={false}
                      isAnimationActive={false}
                      connectNulls={false}
                    />
                  </>
                )}

                {/* Main price area */}
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#ADFF2F"
                  strokeWidth={2}
                  fill="url(#priceGradient)"
                  dot={false}
                  isAnimationActive={false}
                />

                {/* Moving Average overlay */}
                {showMA && (
                  <Area
                    type="monotone"
                    dataKey="ma"
                    stroke="#FBBF24"
                    strokeWidth={1.5}
                    strokeDasharray="6 3"
                    fill="none"
                    dot={false}
                    isAnimationActive={false}
                    connectNulls={false}
                  />
                )}

                {/* Purchase price reference line */}
                <ReferenceLine
                  y={card.purchasePrice}
                  stroke="#FBBF24"
                  strokeDasharray="8 4"
                  strokeWidth={1}
                  label={{
                    value: `Buy $${card.purchasePrice.toFixed(2)}`,
                    position: 'insideTopRight',
                    fill: '#FBBF24',
                    fontSize: 10,
                  }}
                />

                {/* Support line */}
                {stats.support > 0 && (
                  <ReferenceLine
                    y={stats.support}
                    stroke="#22C55E"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                    label={{
                      value: `Support $${stats.support.toFixed(2)}`,
                      position: 'insideBottomRight',
                      fill: '#22C55E',
                      fontSize: 9,
                    }}
                  />
                )}

                {/* Resistance line */}
                {stats.resistance > 0 && (
                  <ReferenceLine
                    y={stats.resistance}
                    stroke="#EF4444"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                    label={{
                      value: `Resist $${stats.resistance.toFixed(2)}`,
                      position: 'insideTopRight',
                      fill: '#EF4444',
                      fontSize: 9,
                    }}
                  />
                )}

                {/* Annotation dots */}
                {visibleAnnotations.map((ann) => {
                  const price = getAnnotationPrice(ann.date);
                  if (price == null) return null;
                  return (
                    <ReferenceDot
                      key={`${ann.type}-${ann.date}`}
                      x={ann.date}
                      y={price}
                      r={5}
                      fill={annotationColor(ann.type)}
                      stroke="#0F172A"
                      strokeWidth={2}
                      label={{
                        value: ann.label,
                        position: 'top',
                        fill: annotationColor(ann.type),
                        fontSize: 9,
                        offset: 10,
                      }}
                    />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>

            {/* Annotation Legend */}
            {visibleAnnotations.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-slate-800">
                {visibleAnnotations.map((ann) => (
                  <div
                    key={`${ann.type}-${ann.date}`}
                    className="flex items-center gap-1.5"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: annotationColor(ann.type) }}
                    />
                    <span className="text-[9px] font-mono text-brand-muted">
                      {ann.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Statistics Grid */}
          <div>
            <h4 className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 flex items-center gap-2">
              <Activity size={14} className="text-brand-muted" />
              Key Statistics
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatCard
                label="All-Time High"
                value={`$${stats.allTimeHigh.toFixed(2)}`}
                color="text-green-400"
              />
              <StatCard
                label="All-Time Low"
                value={`$${stats.allTimeLow.toFixed(2)}`}
                color="text-red-400"
              />
              <StatCard
                label="Average"
                value={`$${stats.avgPrice.toFixed(2)}`}
              />
              <StatCard
                label="Volatility"
                value={`${(stats.volatility * 100).toFixed(1)}%`}
                color={
                  stats.volatility > 0.5
                    ? 'text-red-400'
                    : stats.volatility > 0.25
                      ? 'text-yellow-400'
                      : 'text-green-400'
                }
              />
              <StatCard
                label="Max Drawdown"
                value={`-${stats.maxDrawdownPct.toFixed(1)}%`}
                color="text-red-400"
              />
              <StatCard
                label="Sharpe Ratio"
                value={stats.sharpeRatio.toFixed(2)}
                color={
                  stats.sharpeRatio > 1
                    ? 'text-green-400'
                    : stats.sharpeRatio > 0
                      ? 'text-yellow-400'
                      : 'text-red-400'
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceHistoryModal;
