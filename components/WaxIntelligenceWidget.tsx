import React, { useMemo } from 'react';
import {
  Package,
  ChevronRight,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { getWaxStats, getWaxProducts } from '../lib/analytics/waxIntelligenceService';

interface WaxIntelligenceWidgetProps {
  onClick?: () => void;
}

export const WaxIntelligenceWidget: React.FC<WaxIntelligenceWidgetProps> = ({ onClick }) => {
  const stats = useMemo(() => getWaxStats(), []);
  const products = useMemo(() => getWaxProducts(), []);

  // Find top EV ratio product
  const topEvProduct = useMemo(() => {
    if (products.length === 0) return null;
    return [...products].sort((a, b) => b.evRatio - a.evRatio)[0];
  }, [products]);

  // Find best break opportunity (highest EV ratio that is in_print or sealed_limited)
  const bestBreak = useMemo(() => {
    const available = products.filter(p => p.supply !== 'out_of_print');
    if (available.length === 0) return null;
    return [...available].sort((a, b) => b.evRatio - a.evRatio)[0];
  }, [products]);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400">
            <Package size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Wax Market <span className="text-amber-400">Intelligence</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Sealed product commodity desk
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* Top EV Ratio Product */}
      {topEvProduct && (
        <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
          <div className="flex-1">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
              Top EV Ratio
            </p>
            <p className="text-sm font-medium text-white truncate">{topEvProduct.name}</p>
          </div>
          <div className="h-10 w-px bg-slate-700" />
          <div className="flex-shrink-0 text-right">
            <div className="flex items-center gap-1">
              <Percent size={12} className="text-brand-lime" />
              <span className="text-2xl font-bebas tracking-wider text-brand-lime">
                {(topEvProduct.evRatio * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-[10px] text-slate-500">EV / Price</p>
          </div>
        </div>
      )}

      {/* Sealed Portfolio + Best Break */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-slate-800/30 border border-slate-700 rounded-xl">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            Sealed Value
          </p>
          <p className="text-xl font-bebas tracking-wider text-white">
            ${stats.totalSealedValue.toLocaleString()}
          </p>
        </div>
        {bestBreak && (
          <div className="p-3 bg-brand-lime/5 border border-brand-lime/15 rounded-xl">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
              Best Break
            </p>
            <div className="flex items-center gap-1">
              <TrendingUp size={12} className="text-brand-lime flex-shrink-0" />
              <p className="text-xs text-white font-medium truncate">{bestBreak.name.split(' ').slice(0, 3).join(' ')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Best ROI */}
      {stats.bestProductByROI && (
        <div className="flex items-center gap-3 px-4 py-3 bg-green-500/5 border border-green-500/15 rounded-xl">
          <TrendingUp size={14} className="text-green-400 flex-shrink-0" />
          <span className="text-xs text-slate-400 flex-shrink-0">Best ROI:</span>
          <span className="text-xs text-white font-medium truncate">
            {stats.bestProductByROI.name}
          </span>
          <span className="ml-auto text-xs font-bold text-green-400 flex-shrink-0">
            +{stats.bestProductByROI.roi.toFixed(1)}%
          </span>
        </div>
      )}
    </button>
  );
};

export default WaxIntelligenceWidget;
