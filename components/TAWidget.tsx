import React, { useMemo } from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  BarChart3,
  ArrowUpCircle,
  ArrowDownCircle,
} from 'lucide-react';
import { CardInventory } from '../types';
import { generatePriceHistory } from '../lib/analytics/priceChartService';
import {
  calculateRSI,
  calculateMACD,
  getOverallTASentiment,
  generateTASignals,
  TASignal,
  TASentiment,
} from '../lib/analytics/technicalAnalysisService';

interface TAWidgetProps {
  cards: CardInventory[];
  onClick?: () => void;
}

interface RSIExtreme {
  card: CardInventory;
  rsi: number;
}

interface MACDCrossover {
  card: CardInventory;
  type: 'bullish' | 'bearish';
  date: string;
}

export const TAWidget: React.FC<TAWidgetProps> = ({ cards, onClick }) => {
  // Cards at RSI extremes
  const { overbought, oversold } = useMemo(() => {
    const ob: RSIExtreme[] = [];
    const os: RSIExtreme[] = [];

    for (const card of cards.slice(0, 50)) {
      const priceData = generatePriceHistory(card, '6M');
      const prices = priceData.map(p => p.price);
      if (prices.length < 20) continue;

      const rsi = calculateRSI(prices);
      if (rsi.isOverbought) {
        ob.push({ card, rsi: rsi.currentRSI });
      } else if (rsi.isOversold) {
        os.push({ card, rsi: rsi.currentRSI });
      }
    }

    ob.sort((a, b) => b.rsi - a.rsi);
    os.sort((a, b) => a.rsi - b.rsi);

    return { overbought: ob.slice(0, 3), oversold: os.slice(0, 3) };
  }, [cards]);

  // Recent MACD crossovers
  const crossovers = useMemo(() => {
    const crosses: MACDCrossover[] = [];

    for (const card of cards.slice(0, 50)) {
      const priceData = generatePriceHistory(card, '3M');
      const prices = priceData.map(p => p.price);
      if (prices.length < 30) continue;

      const macd = calculateMACD(prices);
      if (macd.crossovers.length > 0) {
        const last = macd.crossovers[macd.crossovers.length - 1];
        crosses.push({ card, type: last.type, date: last.date });
      }
    }

    return crosses.slice(0, 5);
  }, [cards]);

  // Overall market sentiment from all cards
  const sentiment: TASentiment = useMemo(() => {
    if (cards.length === 0) {
      return { verdict: 'neutral', confidence: 0, bullishCount: 0, bearishCount: 0, neutralCount: 0 };
    }

    const allSignals: TASignal[] = [];
    for (const card of cards.slice(0, 20)) {
      const signals = generateTASignals(card);
      allSignals.push(...signals);
    }

    return getOverallTASentiment(allSignals);
  }, [cards]);

  const sentimentColor =
    sentiment.verdict === 'bullish'
      ? 'text-green-400'
      : sentiment.verdict === 'bearish'
        ? 'text-red-400'
        : 'text-slate-400';

  const sentimentBg =
    sentiment.verdict === 'bullish'
      ? 'bg-green-500/10 border-green-500/30'
      : sentiment.verdict === 'bearish'
        ? 'bg-red-500/10 border-red-500/30'
        : 'bg-slate-500/10 border-slate-500/30';

  const sentimentIcon =
    sentiment.verdict === 'bullish'
      ? <TrendingUp size={16} />
      : sentiment.verdict === 'bearish'
        ? <TrendingDown size={16} />
        : <Minus size={16} />;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
            <Activity size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Technical <span className="text-blue-400">Analysis</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              RSI, MACD, Fibonacci & more
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* Sentiment Gauge */}
      <div className={`flex items-center gap-3 p-4 border rounded-2xl ${sentimentBg}`}>
        <div className={`flex items-center gap-2 ${sentimentColor} font-bold text-sm`}>
          {sentimentIcon}
          <span className="capitalize">{sentiment.verdict}</span>
        </div>
        <div className="h-5 w-px bg-slate-700" />
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400">Confidence</span>
            <span className="text-white font-mono">{sentiment.confidence}%</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                sentiment.verdict === 'bullish'
                  ? 'bg-green-500'
                  : sentiment.verdict === 'bearish'
                    ? 'bg-red-500'
                    : 'bg-slate-500'
              }`}
              style={{ width: `${sentiment.confidence}%` }}
            />
          </div>
        </div>
        <div className="text-xs text-slate-500">
          <span className="text-green-400 font-mono">{sentiment.bullishCount}</span>
          <span className="mx-1">/</span>
          <span className="text-red-400 font-mono">{sentiment.bearishCount}</span>
        </div>
      </div>

      {/* RSI Extremes */}
      {(overbought.length > 0 || oversold.length > 0) && (
        <div className="grid grid-cols-2 gap-3">
          {/* Overbought */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-400">
              <ArrowUpCircle size={12} />
              Overbought
            </div>
            {overbought.length === 0 ? (
              <div className="text-xs text-slate-600">None</div>
            ) : (
              overbought.map(item => (
                <div
                  key={item.card.id}
                  className="flex items-center justify-between px-3 py-1.5 bg-red-500/5 border border-red-500/15 rounded-lg"
                >
                  <span className="text-xs text-slate-300 truncate max-w-[100px]">
                    {item.card.player}
                  </span>
                  <span className="text-xs font-mono text-red-400">
                    {item.rsi.toFixed(1)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Oversold */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-green-400">
              <ArrowDownCircle size={12} />
              Oversold
            </div>
            {oversold.length === 0 ? (
              <div className="text-xs text-slate-600">None</div>
            ) : (
              oversold.map(item => (
                <div
                  key={item.card.id}
                  className="flex items-center justify-between px-3 py-1.5 bg-green-500/5 border border-green-500/15 rounded-lg"
                >
                  <span className="text-xs text-slate-300 truncate max-w-[100px]">
                    {item.card.player}
                  </span>
                  <span className="text-xs font-mono text-green-400">
                    {item.rsi.toFixed(1)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Recent MACD Crossovers */}
      {crossovers.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <BarChart3 size={12} />
            Recent MACD Crossovers
          </div>
          <div className="flex flex-wrap gap-2">
            {crossovers.map((c, i) => (
              <div
                key={`${c.card.id}-${i}`}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                  c.type === 'bullish'
                    ? 'text-green-400 bg-green-500/10 border-green-500/30'
                    : 'text-red-400 bg-red-500/10 border-red-500/30'
                }`}
              >
                {c.type === 'bullish' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                <span className="truncate max-w-[80px]">{c.card.player}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Open TA Suite button hint */}
      <div className="text-center text-xs text-slate-500 group-hover:text-brand-lime transition-colors">
        Open TA Suite
      </div>
    </button>
  );
};

export default TAWidget;
