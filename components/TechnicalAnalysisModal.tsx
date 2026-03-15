import React, { useMemo, useState } from 'react';
import {
  X,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Target,
  Layers,
} from 'lucide-react';
import {
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
  Legend,
} from 'recharts';
import { CardInventory } from '../types';
import { generatePriceHistory, calculateMovingAverage, calculateBollingerBands } from '../lib/priceChartService';
import {
  calculateRSI,
  calculateMACD,
  calculateFibonacci,
  detectCandlestickPatterns,
  generateVolumeProfile,
  generateTASignals,
  getOverallTASentiment,
} from '../lib/technicalAnalysisService';

interface TechnicalAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardInventory[];
  initialCard?: CardInventory;
}

type TimeRange = '1M' | '3M' | '6M' | '1Y' | 'ALL';
type IndicatorToggle = 'rsi' | 'macd' | 'fibonacci' | 'volumeProfile' | 'sma' | 'bollinger';

const TIME_RANGES: { key: TimeRange; label: string }[] = [
  { key: '1M', label: '1M' },
  { key: '3M', label: '3M' },
  { key: '6M', label: '6M' },
  { key: '1Y', label: '1Y' },
  { key: 'ALL', label: 'ALL' },
];

const INDICATOR_OPTIONS: { key: IndicatorToggle; label: string }[] = [
  { key: 'rsi', label: 'RSI' },
  { key: 'macd', label: 'MACD' },
  { key: 'fibonacci', label: 'Fibonacci' },
  { key: 'volumeProfile', label: 'Volume Profile' },
  { key: 'sma', label: 'SMA (20/50)' },
  { key: 'bollinger', label: 'Bollinger Bands' },
];

// Format date for axis labels
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export const TechnicalAnalysisModal: React.FC<TechnicalAnalysisModalProps> = ({
  isOpen,
  onClose,
  cards,
  initialCard,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string>(
    initialCard?.id ?? cards[0]?.id ?? ''
  );
  const [timeRange, setTimeRange] = useState<TimeRange>('6M');
  const [indicators, setIndicators] = useState<Set<IndicatorToggle>>(
    new Set(['rsi', 'sma'])
  );

  const selectedCard = useMemo(
    () => cards.find(c => c.id === selectedCardId) ?? cards[0],
    [cards, selectedCardId]
  );

  const toggleIndicator = (key: IndicatorToggle) => {
    setIndicators(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Generate all analysis data
  const analysisData = useMemo(() => {
    if (!selectedCard) return null;

    const priceData = generatePriceHistory(selectedCard, timeRange);
    const closePrices = priceData.map(p => p.price);

    const rsi = calculateRSI(closePrices);
    const macd = calculateMACD(closePrices);
    const fibonacci = calculateFibonacci(closePrices);
    const candlesticks = detectCandlestickPatterns(priceData);
    const volumeProfile = generateVolumeProfile(priceData);
    const sma20 = calculateMovingAverage(priceData, 20);
    const sma50 = calculateMovingAverage(priceData, 50);
    const bollinger = calculateBollingerBands(priceData);
    const signals = generateTASignals(selectedCard);
    const sentiment = getOverallTASentiment(signals);

    // Build combined chart data
    const chartData = priceData.map((p, i) => {
      const point: Record<string, unknown> = {
        date: p.date,
        dateLabel: formatDate(p.date),
        price: p.price,
        high: p.high,
        low: p.low,
        volume: p.volume,
      };

      if (sma20[i]) point.sma20 = sma20[i].ma;
      if (sma50[i]) point.sma50 = sma50[i].ma;
      if (bollinger[i]) {
        point.bbUpper = bollinger[i].upper;
        point.bbLower = bollinger[i].lower;
        point.bbMiddle = bollinger[i].middle;
      }

      return point;
    });

    // RSI chart data
    const rsiData = rsi.values.map((v, i) => ({
      date: priceData[i]?.date ?? v.date,
      dateLabel: priceData[i] ? formatDate(priceData[i].date) : v.date,
      rsi: v.rsi,
    }));

    // MACD chart data
    const macdData = macd.macdLine.map((m, i) => ({
      date: priceData[i]?.date ?? m.date,
      dateLabel: priceData[i] ? formatDate(priceData[i].date) : m.date,
      macd: m.value,
      signal: macd.signalLine[i]?.value ?? null,
      histogram: macd.histogram[i]?.value ?? null,
    }));

    return {
      priceData,
      chartData,
      rsi,
      rsiData,
      macd,
      macdData,
      fibonacci,
      candlesticks,
      volumeProfile,
      signals,
      sentiment,
    };
  }, [selectedCard, timeRange]);

  if (!isOpen || !selectedCard || !analysisData) return null;

  const { chartData, rsi, rsiData, macd, macdData, fibonacci, candlesticks, volumeProfile, signals, sentiment } = analysisData;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/80 backdrop-blur-md p-4 pt-8 pb-8">
      <div className="relative w-full max-w-6xl bg-brand-slate border border-slate-800 rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
              <Activity size={22} />
            </div>
            <div>
              <h2 className="text-3xl font-bebas tracking-widest text-white leading-tight">
                Technical <span className="text-blue-400">Analysis Suite</span>
              </h2>
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
                Advanced indicators & signals
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Controls Row */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Card Selector */}
            <div className="flex-1 min-w-[200px]">
              <select
                value={selectedCardId}
                onChange={e => setSelectedCardId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500"
              >
                {cards.map(card => (
                  <option key={card.id} value={card.id}>
                    {card.player} — {card.year} {card.set} #{card.cardNumber}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Range Selector */}
            <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1">
              {TIME_RANGES.map(tr => (
                <button
                  key={tr.key}
                  onClick={() => setTimeRange(tr.key)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    timeRange === tr.key
                      ? 'bg-blue-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tr.label}
                </button>
              ))}
            </div>
          </div>

          {/* Indicator Toggles */}
          <div className="flex flex-wrap gap-2">
            {INDICATOR_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => toggleIndicator(opt.key)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  indicators.has(opt.key)
                    ? 'bg-blue-500/15 border-blue-500/40 text-blue-400'
                    : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Main Price Chart */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={16} className="text-blue-400" />
              <span className="text-sm font-bold text-white">Price Chart</span>
              <span className="text-xs text-slate-500 ml-2">
                ${selectedCard.currentValue?.toFixed(2) ?? selectedCard.purchasePrice.toFixed(2)}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="dateLabel"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickLine={false}
                  interval={Math.max(1, Math.floor(chartData.length / 12))}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickLine={false}
                  width={55}
                  tickFormatter={v => `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number, name: string) => {
                    const labels: Record<string, string> = {
                      price: 'Price',
                      sma20: 'SMA 20',
                      sma50: 'SMA 50',
                      bbUpper: 'BB Upper',
                      bbLower: 'BB Lower',
                      bbMiddle: 'BB Middle',
                    };
                    return [`$${value?.toFixed(2) ?? '—'}`, labels[name] ?? name];
                  }}
                  labelFormatter={l => `Date: ${l}`}
                />

                {/* Bollinger Bands */}
                {indicators.has('bollinger') && (
                  <>
                    <Area
                      type="monotone"
                      dataKey="bbUpper"
                      stroke="transparent"
                      fill="#6366f1"
                      fillOpacity={0.05}
                      dot={false}
                      isAnimationActive={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="bbLower"
                      stroke="transparent"
                      fill="#6366f1"
                      fillOpacity={0.05}
                      dot={false}
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="bbUpper"
                      stroke="#6366f1"
                      strokeWidth={1}
                      strokeDasharray="4 2"
                      dot={false}
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="bbLower"
                      stroke="#6366f1"
                      strokeWidth={1}
                      strokeDasharray="4 2"
                      dot={false}
                      isAnimationActive={false}
                    />
                  </>
                )}

                {/* SMA Lines */}
                {indicators.has('sma') && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="sma20"
                      stroke="#f59e0b"
                      strokeWidth={1.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="sma50"
                      stroke="#ec4899"
                      strokeWidth={1.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </>
                )}

                {/* Fibonacci Reference Lines */}
                {indicators.has('fibonacci') &&
                  fibonacci.levels.map(level => (
                    <ReferenceLine
                      key={level.label}
                      y={level.price}
                      stroke="#8b5cf6"
                      strokeDasharray="6 3"
                      strokeOpacity={0.5}
                      label={{
                        value: `${level.label} $${level.price.toFixed(2)}`,
                        fill: '#8b5cf6',
                        fontSize: 9,
                        position: 'right',
                      }}
                    />
                  ))
                }

                {/* Price Line */}
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />

                <Legend
                  verticalAlign="top"
                  height={30}
                  wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }}
                />
              </ComposedChart>
            </ResponsiveContainer>

            {/* Candlestick Pattern Annotations */}
            {candlesticks.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {candlesticks.slice(-5).map((p, i) => {
                  const isBullish = ['hammer', 'engulfing_bullish', 'morning_star'].includes(p.type);
                  return (
                    <div
                      key={`${p.date}-${i}`}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        isBullish
                          ? 'text-green-400 bg-green-500/10 border-green-500/20'
                          : p.type === 'doji'
                            ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                            : 'text-red-400 bg-red-500/10 border-red-500/20'
                      }`}
                    >
                      <Target size={8} />
                      {p.type.replace(/_/g, ' ')} ({p.date})
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RSI Sub-Chart */}
          {indicators.has('rsi') && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Activity size={16} className="text-amber-400" />
                <span className="text-sm font-bold text-white">RSI (14)</span>
                <span className={`text-xs font-mono ml-2 ${
                  rsi.isOverbought ? 'text-red-400' : rsi.isOversold ? 'text-green-400' : 'text-slate-400'
                }`}>
                  {rsi.currentRSI.toFixed(1)}
                </span>
                {rsi.isOverbought && (
                  <span className="text-[10px] px-2 py-0.5 bg-red-500/10 border border-red-500/30 text-red-400 font-bold rounded-full">
                    Overbought
                  </span>
                )}
                {rsi.isOversold && (
                  <span className="text-[10px] px-2 py-0.5 bg-green-500/10 border border-green-500/30 text-green-400 font-bold rounded-full">
                    Oversold
                  </span>
                )}
                {rsi.divergence !== 'none' && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                    rsi.divergence === 'bullish'
                      ? 'bg-green-500/10 border-green-500/30 text-green-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}>
                    {rsi.divergence} divergence
                  </span>
                )}
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <ComposedChart data={rsiData} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="dateLabel"
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    tickLine={false}
                    interval={Math.max(1, Math.floor(rsiData.length / 12))}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    tickLine={false}
                    width={35}
                    ticks={[0, 30, 50, 70, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [value?.toFixed(1) ?? '—', 'RSI']}
                  />
                  <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="4 2" strokeOpacity={0.6} />
                  <ReferenceLine y={30} stroke="#10b981" strokeDasharray="4 2" strokeOpacity={0.6} />
                  <ReferenceLine y={50} stroke="#475569" strokeDasharray="2 2" strokeOpacity={0.4} />
                  <Area
                    type="monotone"
                    dataKey="rsi"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.1}
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                    connectNulls
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* MACD Sub-Chart */}
          {indicators.has('macd') && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Layers size={16} className="text-cyan-400" />
                <span className="text-sm font-bold text-white">MACD (12, 26, 9)</span>
                {macd.crossovers.length > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                    macd.crossovers[macd.crossovers.length - 1].type === 'bullish'
                      ? 'bg-green-500/10 border-green-500/30 text-green-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}>
                    Last: {macd.crossovers[macd.crossovers.length - 1].type}
                  </span>
                )}
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <ComposedChart data={macdData} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="dateLabel"
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    tickLine={false}
                    interval={Math.max(1, Math.floor(macdData.length / 12))}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    tickLine={false}
                    width={45}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number, name: string) => {
                      const labels: Record<string, string> = {
                        macd: 'MACD',
                        signal: 'Signal',
                        histogram: 'Histogram',
                      };
                      return [value?.toFixed(4) ?? '—', labels[name] ?? name];
                    }}
                  />
                  <ReferenceLine y={0} stroke="#475569" strokeDasharray="2 2" />
                  <Bar
                    dataKey="histogram"
                    fill="#06b6d4"
                    fillOpacity={0.4}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="macd"
                    stroke="#06b6d4"
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="signal"
                    stroke="#f97316"
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                    connectNulls
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Volume Profile */}
          {indicators.has('volumeProfile') && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 size={16} className="text-purple-400" />
                <span className="text-sm font-bold text-white">Volume Profile</span>
                <span className="text-xs text-slate-400 ml-2">
                  POC: ${volumeProfile.pointOfControl.toFixed(2)}
                </span>
                <span className="text-xs text-slate-500">
                  VA: ${volumeProfile.valueAreaLow.toFixed(2)} — ${volumeProfile.valueAreaHigh.toFixed(2)}
                </span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart
                  layout="vertical"
                  data={volumeProfile.buckets}
                  margin={{ top: 5, right: 10, bottom: 0, left: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="priceLevel"
                    tick={{ fill: '#64748b', fontSize: 9 }}
                    tickLine={false}
                    width={55}
                    tickFormatter={v => `$${Number(v).toFixed(0)}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [value, 'Volume']}
                    labelFormatter={l => `$${Number(l).toFixed(2)}`}
                  />
                  <Bar dataKey="volume" fill="#8b5cf6" fillOpacity={0.6} isAnimationActive={false} />
                  <ReferenceLine
                    y={volumeProfile.pointOfControl}
                    stroke="#f59e0b"
                    strokeWidth={2}
                    label={{ value: 'POC', fill: '#f59e0b', fontSize: 10 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Signals Summary Panel */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-blue-400" />
                <span className="text-sm font-bold text-white">Signal Summary</span>
              </div>
              {/* Overall Verdict */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${
                sentiment.verdict === 'bullish'
                  ? 'text-green-400 bg-green-500/10 border-green-500/30'
                  : sentiment.verdict === 'bearish'
                    ? 'text-red-400 bg-red-500/10 border-red-500/30'
                    : 'text-slate-400 bg-slate-500/10 border-slate-500/30'
              }`}>
                {sentiment.verdict === 'bullish' ? <TrendingUp size={12} /> : sentiment.verdict === 'bearish' ? <TrendingDown size={12} /> : <Minus size={12} />}
                <span className="capitalize">{sentiment.verdict}</span>
                <span className="text-slate-500">|</span>
                <span>{sentiment.confidence}% confidence</span>
              </div>
            </div>

            {/* Signal counts */}
            <div className="flex items-center gap-4 mb-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-slate-400">Bullish:</span>
                <span className="text-green-400 font-bold">{sentiment.bullishCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-slate-400">Bearish:</span>
                <span className="text-red-400 font-bold">{sentiment.bearishCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-500" />
                <span className="text-slate-400">Neutral:</span>
                <span className="text-slate-300 font-bold">{sentiment.neutralCount}</span>
              </div>
            </div>

            {/* Signal List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {signals.map((signal, i) => (
                <div
                  key={`${signal.name}-${i}`}
                  className="flex items-center gap-3 px-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl"
                >
                  {/* Direction Badge */}
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    signal.direction === 'bullish'
                      ? 'text-green-400 bg-green-500/10 border-green-500/30'
                      : signal.direction === 'bearish'
                        ? 'text-red-400 bg-red-500/10 border-red-500/30'
                        : 'text-slate-400 bg-slate-500/10 border-slate-500/30'
                  }`}>
                    {signal.direction === 'bullish' ? <TrendingUp size={8} /> : signal.direction === 'bearish' ? <TrendingDown size={8} /> : <Minus size={8} />}
                    {signal.direction}
                  </div>

                  {/* Signal Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white">{signal.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{signal.description}</div>
                  </div>

                  {/* Strength Bar */}
                  <div className="w-16 flex-shrink-0">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                      <span>Str</span>
                      <span className="font-mono">{signal.strength}</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          signal.direction === 'bullish'
                            ? 'bg-green-500'
                            : signal.direction === 'bearish'
                              ? 'bg-red-500'
                              : 'bg-slate-500'
                        }`}
                        style={{ width: `${signal.strength}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {signals.length === 0 && (
                <div className="text-center text-sm text-slate-600 py-8">
                  No signals available — add more price history data
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalAnalysisModal;
