import React, { useMemo } from 'react';
import { BarChart3, ChevronRight, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { getIndices, MarketIndex } from '../lib/marketIndicesService';

interface MarketIndicesWidgetProps {
  onOpenModal?: () => void;
}

export const MarketIndicesWidget: React.FC<MarketIndicesWidgetProps> = ({ onOpenModal }) => {
  const indices = useMemo(() => getIndices(), []);
  const topIndices = useMemo(() => indices.slice(0, 4), [indices]);

  // Duplicate for infinite scroll effect
  const tickerItems = useMemo(() => [...topIndices, ...topIndices], [topIndices]);

  return (
    <div
      onClick={onOpenModal}
      className="relative bg-slate-900/50 border border-slate-800 rounded-2xl p-4 cursor-pointer hover:border-brand-lime/30 transition-all group overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-brand-lime/10 rounded-lg">
            <BarChart3 size={16} className="text-brand-lime" />
          </div>
          <span className="text-xs font-black text-white uppercase tracking-wider">
            MSI Indices
          </span>
          <Activity size={12} className="text-brand-lime animate-pulse" />
        </div>
        <ChevronRight
          size={16}
          className="text-slate-500 group-hover:text-brand-lime transition-colors"
        />
      </div>

      {/* Ticker tape */}
      <div className="relative overflow-hidden">
        <div className="flex gap-5 animate-ticker-scroll">
          {tickerItems.map((idx, i) => (
            <TickerItem key={`${idx.ticker}-${i}`} index={idx} />
          ))}
        </div>
      </div>

      {/* Subtle gradient edges */}
      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-slate-900/50 to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-slate-900/50 to-transparent pointer-events-none z-10" />

      {/* Inline animation style */}
      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker-scroll {
          animation: ticker-scroll 20s linear infinite;
          width: max-content;
        }
        .animate-ticker-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

const TickerItem: React.FC<{ index: MarketIndex }> = ({ index }) => {
  const isPositive = index.change >= 0;

  return (
    <div className="flex items-center gap-2 flex-shrink-0 px-3 py-1.5 rounded-lg bg-slate-800/50">
      <span
        className="text-[11px] font-black tracking-wider"
        style={{ color: '#FFD700' }}
      >
        {index.ticker}
      </span>
      <span className="text-xs font-bold text-white">
        {index.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
      <span
        className={`flex items-center gap-0.5 text-[10px] font-bold ${
          isPositive ? 'text-emerald-400' : 'text-red-400'
        }`}
      >
        {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
        {isPositive ? '+' : ''}
        {index.changePercent.toFixed(2)}%
      </span>
    </div>
  );
};

export default MarketIndicesWidget;
