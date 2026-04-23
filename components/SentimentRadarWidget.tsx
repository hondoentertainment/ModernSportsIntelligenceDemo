// @ts-nocheck
import React, { useMemo } from 'react';
import { MessageCircle, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  getTrendingSentiments,
  getMarketSentimentOverview,
  type SentimentData,
} from '../lib/analytics/sentimentRadarService';

interface SentimentRadarWidgetProps {
  onOpenModal?: () => void;
}

const trendIcon = (dir: string) => {
  if (dir === 'rising') return <TrendingUp size={10} className="text-emerald-400" />;
  if (dir === 'falling') return <TrendingDown size={10} className="text-red-400" />;
  return <Minus size={10} className="text-slate-400" />;
};

const sentimentColor = (s: number) => {
  if (s >= 60) return 'text-emerald-400';
  if (s >= 20) return 'text-emerald-300';
  if (s >= -20) return 'text-slate-300';
  if (s >= -60) return 'text-red-300';
  return 'text-red-400';
};

const sentimentBg = (s: number) => {
  if (s >= 20) return 'bg-emerald-500/20 border-emerald-500/30';
  if (s >= -20) return 'bg-slate-500/20 border-slate-500/30';
  return 'bg-red-500/20 border-red-500/30';
};

const SentimentRadarWidget: React.FC<SentimentRadarWidgetProps> = ({ onOpenModal }) => {
  const trending = useMemo(() => getTrendingSentiments().slice(0, 3), []);
  const overview = useMemo(() => getMarketSentimentOverview(), []);

  /* Gauge percentage: map -100..100 → 0..100 */
  const gaugePercent = Math.round((overview.overall + 100) / 2);

  return (
    <div
      onClick={onOpenModal}
      className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5 hover:border-brand-lime/30 transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-lime/10">
            <MessageCircle size={16} className="text-brand-lime" />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Sentiment Radar
          </span>
        </div>
        <ChevronRight
          size={14}
          className="text-slate-600 group-hover:text-brand-lime transition-colors"
        />
      </div>

      {/* Market Sentiment Gauge */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Market Mood</span>
          <span className={`text-sm font-bold ${sentimentColor(overview.overall)}`}>
            {overview.overall > 0 ? '+' : ''}{overview.overall}
          </span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${gaugePercent}%`,
              background: overview.overall >= 0
                ? `linear-gradient(90deg, #84cc16, #34d399)`
                : `linear-gradient(90deg, #ef4444, #f97316)`,
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-red-400/60">Bearish</span>
          <span className="text-[9px] text-emerald-400/60">Bullish</span>
        </div>
      </div>

      {/* Top Movers */}
      <div className="space-y-2">
        {trending.map((p: SentimentData) => (
          <div
            key={p.playerId}
            className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2"
          >
            <div className="flex items-center gap-2">
              {trendIcon(p.trendDirection)}
              <span className="text-xs font-semibold text-slate-200 truncate max-w-[100px]">
                {p.player}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${sentimentBg(p.overallSentiment)} ${sentimentColor(p.overallSentiment)}`}>
                {p.overallSentiment > 0 ? '+' : ''}{p.overallSentiment}
              </span>
              <span className={`text-[10px] font-bold ${p.priceChange24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {p.priceChange24h >= 0 ? '+' : ''}{p.priceChange24h.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Volume */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[10px] text-slate-500">
          {(overview.totalVolume / 1000).toFixed(1)}k mentions tracked
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-emerald-400">{overview.bullish} bullish</span>
          <span className="text-[9px] text-red-400">{overview.bearish} bearish</span>
        </div>
      </div>
    </div>
  );
};

export default SentimentRadarWidget;
