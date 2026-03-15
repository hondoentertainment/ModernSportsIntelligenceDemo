import React, { useMemo } from 'react';
import { Sparkles, ChevronRight, TrendingUp, Layers } from 'lucide-react';
import {
  getCategories,
  getUnifiedPortfolio,
  getCategoryMarketData,
} from '../lib/nonSportsExpansionService';

interface NonSportsExpansionWidgetProps {
  onOpenModal?: () => void;
}

export const NonSportsExpansionWidget: React.FC<NonSportsExpansionWidgetProps> = ({ onOpenModal }) => {
  const categories = useMemo(() => getCategories(), []);
  const portfolio = useMemo(() => getUnifiedPortfolio(), []);
  const marketData = useMemo(() => getCategoryMarketData(), []);

  const topCategory = useMemo(() => {
    const sorted = [...marketData].sort((a, b) => b.priceChange30d - a.priceChange30d);
    return sorted[0];
  }, [marketData]);

  const formatCurrency = (val: number): string => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
    return `$${val.toFixed(0)}`;
  };

  return (
    <button
      onClick={onOpenModal}
      className="w-full text-left bg-brand-slate rounded-[2.5rem] p-8 hover:border-lime-500/30 hover:bg-slate-800/60 transition-all duration-300 group border border-slate-700/50"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-lime-500/10 rounded-lg">
            <Sparkles size={16} className="text-lime-400" />
          </div>
          <span className="text-xs font-bebas text-slate-400 uppercase tracking-wider">Non-Sports Expansion</span>
        </div>
        <ChevronRight size={16} className="text-slate-500 group-hover:text-lime-400 transition-colors" />
      </div>

      {/* Category Count */}
      <div className="mb-4">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Active Categories</div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">{portfolio.categoryCount}</span>
          <span className="text-sm text-slate-400">categories</span>
        </div>
      </div>

      {/* Unified Portfolio Value */}
      <div className="mb-4">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Portfolio Value</div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white">{formatCurrency(portfolio.totalValue)}</span>
          <span className={`text-sm font-bold ${portfolio.totalGainLossPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {portfolio.totalGainLossPercent >= 0 ? '+' : ''}{portfolio.totalGainLossPercent.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Category Dots */}
      <div className="flex items-center gap-2 mb-4">
        <Layers size={12} className="text-slate-500" />
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {categories.slice(0, 5).map((cat) => (
            <div key={cat.category} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
              <span className="text-[10px] text-slate-400">{cat.label}</span>
            </div>
          ))}
          {categories.length > 5 && (
            <span className="text-[10px] text-slate-500">+{categories.length - 5} more</span>
          )}
        </div>
      </div>

      {/* Top Performing Category */}
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
        <TrendingUp size={12} className="text-emerald-400" />
        <span className="text-xs font-bold text-emerald-400">
          Top: {topCategory.label} +{topCategory.priceChange30d.toFixed(1)}% (30d)
        </span>
      </div>
    </button>
  );
};

export default NonSportsExpansionWidget;
