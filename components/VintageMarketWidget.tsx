import React, { useMemo } from 'react';
import { Clock, ChevronRight, TrendingUp, Star } from 'lucide-react';
import {
  getVintageCards,
  getMarketCapData,
  getEraBreakdown,
  getGrowthMetrics,
  formatCurrency,
} from '../lib/vintageMarketService';

interface VintageMarketWidgetProps {
  onOpenModal?: () => void;
}

export const VintageMarketWidget: React.FC<VintageMarketWidgetProps> = ({ onOpenModal }) => {
  const cards = useMemo(() => getVintageCards(), []);
  const marketCap = useMemo(() => getMarketCapData(), []);
  const eras = useMemo(() => getEraBreakdown(), []);
  const growth = useMemo(() => getGrowthMetrics(), []);

  const topEra = useMemo(() => {
    if (eras.length === 0) return null;
    return eras.reduce((best, e) => e.totalValue > best.totalValue ? e : best, eras[0]);
  }, [eras]);

  const mostValuable = useMemo(() => {
    if (cards.length === 0) return null;
    return cards.reduce((best, c) => c.currentValue > best.currentValue ? c : best, cards[0]);
  }, [cards]);

  return (
    <button
      onClick={onOpenModal}
      className="w-full text-left bg-slate-900 rounded-2xl overflow-hidden p-8 hover:border-amber-500/30 hover:bg-slate-800/60 transition-all duration-300 group border border-slate-700"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Clock size={16} className="text-amber-400" />
          </div>
          <span className="text-xs font-bebas text-slate-400 uppercase tracking-wider">Vintage Market</span>
        </div>
        <ChevronRight size={16} className="text-slate-500 group-hover:text-amber-400 transition-colors" />
      </div>

      {/* 4-stat grid */}
      <div className="grid grid-cols-4 divide-x divide-slate-700 mb-5">
        <div className="pr-3">
          <p className="text-xs text-slate-400">Cards Tracked</p>
          <p className="text-lg font-bold text-amber-400">{cards.length}</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-slate-400">Market Cap</p>
          <p className="text-lg font-bold text-white">{formatCurrency(marketCap.total)}</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-slate-400">Top Era</p>
          <p className="text-lg font-bold text-emerald-400">{topEra ? topEra.name : 'N/A'}</p>
        </div>
        <div className="pl-3">
          <p className="text-xs text-slate-400">Growth</p>
          <p className="text-lg font-bold text-violet-400">+{growth.overallPercent.toFixed(1)}%</p>
        </div>
      </div>

      {/* Most valuable card highlight */}
      {mostValuable && (
        <div className="flex items-center gap-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl mb-4">
          <Star size={14} className="text-amber-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Most Valuable</p>
            <p className="text-xs text-white font-medium truncate">{mostValuable.cardName}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-slate-500">Value</p>
            <p className="text-sm font-bold text-amber-400">{formatCurrency(mostValuable.currentValue)}</p>
          </div>
        </div>
      )}

      {/* Bottom: market trend + era count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <TrendingUp size={12} className="text-emerald-400" />
          <span className="text-xs text-slate-400">24h: <span className="text-emerald-400 font-bold">+{growth.dailyPercent.toFixed(1)}%</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={12} className="text-amber-400" />
          <span className="text-xs text-slate-400">
            Eras: <span className="text-white font-bold">{eras.length} tracked</span>
          </span>
        </div>
      </div>
    </button>
  );
};

export default VintageMarketWidget;
