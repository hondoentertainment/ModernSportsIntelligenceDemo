// @ts-nocheck
import React, { useMemo } from 'react';
import { Package, ChevronRight, TrendingUp, Star, Clock } from 'lucide-react';
import {
  getSealedProducts,
  getRoiMetrics,
  getBestHolds,
  getNewReleases,
  formatCurrency,
} from '../lib/utils/sealedProductService';

interface SealedProductWidgetProps {
  onOpenModal?: () => void;
}

export const SealedProductWidget: React.FC<SealedProductWidgetProps> = ({ onOpenModal }) => {
  const products = useMemo(() => getSealedProducts(), []);
  const roi = useMemo(() => getRoiMetrics(), []);
  const bestHolds = useMemo(() => getBestHolds(), []);
  const releases = useMemo(() => getNewReleases(), []);

  const topHold = useMemo(() => {
    if (bestHolds.length === 0) return null;
    return bestHolds[0];
  }, [bestHolds]);

  const avgRoi = useMemo(() => {
    if (products.length === 0) return 0;
    return products.reduce((sum, p) => sum + p.roiPercent, 0) / products.length;
  }, [products]);

  return (
    <button
      onClick={onOpenModal}
      className="w-full text-left bg-slate-900 rounded-2xl overflow-hidden p-8 hover:border-violet-500/30 hover:bg-slate-800/60 transition-all duration-300 group border border-slate-700"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-violet-500/10 rounded-lg">
            <Package size={16} className="text-violet-400" />
          </div>
          <span className="text-xs font-bebas text-slate-400 uppercase tracking-wider">Sealed Product</span>
        </div>
        <ChevronRight size={16} className="text-slate-500 group-hover:text-violet-400 transition-colors" />
      </div>

      {/* 4-stat grid */}
      <div className="grid grid-cols-4 divide-x divide-slate-700 mb-5">
        <div className="pr-3">
          <p className="text-xs text-slate-400">Products Tracked</p>
          <p className="text-lg font-bold text-violet-400">{products.length}</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-slate-400">Avg ROI</p>
          <p className="text-lg font-bold text-white">+{avgRoi.toFixed(0)}%</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-slate-400">Best Hold</p>
          <p className="text-lg font-bold text-emerald-400">{topHold ? topHold.productName.slice(0, 8) : 'N/A'}</p>
        </div>
        <div className="pl-3">
          <p className="text-xs text-slate-400">New Releases</p>
          <p className="text-lg font-bold text-amber-400">{releases.length}</p>
        </div>
      </div>

      {/* Top hold highlight */}
      {topHold && (
        <div className="flex items-center gap-3 p-3 bg-violet-500/5 border border-violet-500/20 rounded-xl mb-4">
          <Star size={14} className="text-violet-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Best Hold</p>
            <p className="text-xs text-white font-medium truncate">{topHold.productName}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-slate-500">ROI</p>
            <p className="text-sm font-bold text-violet-400">+{topHold.roiPercent.toFixed(0)}%</p>
          </div>
        </div>
      )}

      {/* Bottom: total value + upcoming */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <TrendingUp size={12} className="text-emerald-400" />
          <span className="text-xs text-slate-400">Value: <span className="text-emerald-400 font-bold">{formatCurrency(roi.totalValue)}</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={12} className="text-amber-400" />
          <span className="text-xs text-slate-400">
            Upcoming: <span className="text-white font-bold">{releases.filter(r => r.status === 'upcoming').length} products</span>
          </span>
        </div>
      </div>
    </button>
  );
};

export default SealedProductWidget;
