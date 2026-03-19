import React, { useMemo } from 'react';
import { Camera, ChevronRight, Sparkles, DollarSign } from 'lucide-react';
import {
  getListingScores,
  getOptimizedListings,
  getRevenueMetrics,
  getListingSummary,
  formatCurrency,
} from '../lib/trading/listingOptimizerService';

interface ListingOptimizerWidgetProps {
  onOpenModal?: () => void;
}

export const ListingOptimizerWidget: React.FC<ListingOptimizerWidgetProps> = ({ onOpenModal }) => {
  const scores = useMemo(() => getListingScores(), []);
  const optimized = useMemo(() => getOptimizedListings(), []);
  const revenue = useMemo(() => getRevenueMetrics(), []);
  const summary = useMemo(() => getListingSummary(), []);

  const avgScore = useMemo(() => {
    if (scores.length === 0) return 0;
    return scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
  }, [scores]);

  const bestListing = useMemo(() => {
    if (optimized.length === 0) return null;
    return optimized.reduce((best, l) => l.revenueBoost > best.revenueBoost ? l : best, optimized[0]);
  }, [optimized]);

  return (
    <button
      onClick={onOpenModal}
      className="w-full text-left bg-slate-900 rounded-2xl overflow-hidden p-8 hover:border-cyan-500/30 hover:bg-slate-800/60 transition-all duration-300 group border border-slate-700"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <Camera size={16} className="text-cyan-400" />
          </div>
          <span className="text-xs font-bebas text-slate-400 uppercase tracking-wider">Listing Optimizer</span>
        </div>
        <ChevronRight size={16} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
      </div>

      {/* 4-stat grid */}
      <div className="grid grid-cols-4 divide-x divide-slate-700 mb-5">
        <div className="pr-3">
          <p className="text-xs text-slate-400">Listings Scored</p>
          <p className="text-lg font-bold text-cyan-400">{scores.length}</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-slate-400">Avg Score</p>
          <p className="text-lg font-bold text-white">{avgScore.toFixed(0)}</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-slate-400">Optimized</p>
          <p className="text-lg font-bold text-emerald-400">{optimized.length}</p>
        </div>
        <div className="pl-3">
          <p className="text-xs text-slate-400">Revenue Boost</p>
          <p className="text-lg font-bold text-amber-400">+{revenue.boostPercent.toFixed(0)}%</p>
        </div>
      </div>

      {/* Best optimized listing highlight */}
      {bestListing && (
        <div className="flex items-center gap-3 p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl mb-4">
          <Sparkles size={14} className="text-cyan-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Best Optimization</p>
            <p className="text-xs text-white font-medium truncate">{bestListing.listingTitle}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-slate-500">Boost</p>
            <p className="text-sm font-bold text-cyan-400">+{bestListing.revenueBoost.toFixed(0)}%</p>
          </div>
        </div>
      )}

      {/* Bottom: total revenue + pending */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <DollarSign size={12} className="text-emerald-400" />
          <span className="text-xs text-slate-400">Revenue: <span className="text-emerald-400 font-bold">{formatCurrency(revenue.totalRevenue)}</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Camera size={12} className="text-cyan-400" />
          <span className="text-xs text-slate-400">
            Pending: <span className="text-white font-bold">{summary.pendingCount} listings</span>
          </span>
        </div>
      </div>
    </button>
  );
};

export default ListingOptimizerWidget;
