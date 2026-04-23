// @ts-nocheck
import React, { useMemo } from 'react';
import { AlertOctagon, ChevronRight, Search, DollarSign } from 'lucide-react';
import {
  getErrorCards,
  getRecentFinds,
  getPremiumMetrics,
  getErrorCategories,
  formatCurrency,
} from '../lib/core/errorCardService';

interface ErrorCardWidgetProps {
  onOpenModal?: () => void;
}

export const ErrorCardWidget: React.FC<ErrorCardWidgetProps> = ({ onOpenModal }) => {
  const errorCards = useMemo(() => getErrorCards(), []);
  const recentFinds = useMemo(() => getRecentFinds(), []);
  const premiums = useMemo(() => getPremiumMetrics(), []);
  const categories = useMemo(() => getErrorCategories(), []);

  const topError = useMemo(() => {
    if (errorCards.length === 0) return null;
    return errorCards.reduce((best, e) => e.premiumPercent > best.premiumPercent ? e : best, errorCards[0]);
  }, [errorCards]);

  const avgPremium = useMemo(() => {
    if (errorCards.length === 0) return 0;
    return errorCards.reduce((sum, e) => sum + e.premiumPercent, 0) / errorCards.length;
  }, [errorCards]);

  return (
    <button
      onClick={onOpenModal}
      className="w-full text-left bg-slate-900 rounded-2xl overflow-hidden p-8 hover:border-red-500/30 hover:bg-slate-800/60 transition-all duration-300 group border border-slate-700"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <AlertOctagon size={16} className="text-red-400" />
          </div>
          <span className="text-xs font-bebas text-slate-400 uppercase tracking-wider">Error Card Tracker</span>
        </div>
        <ChevronRight size={16} className="text-slate-500 group-hover:text-red-400 transition-colors" />
      </div>

      {/* 4-stat grid */}
      <div className="grid grid-cols-4 divide-x divide-slate-700 mb-5">
        <div className="pr-3">
          <p className="text-xs text-slate-400">Errors Tracked</p>
          <p className="text-lg font-bold text-red-400">{errorCards.length}</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-slate-400">Recent Finds</p>
          <p className="text-lg font-bold text-white">{recentFinds.length}</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-slate-400">Avg Premium</p>
          <p className="text-lg font-bold text-emerald-400">+{avgPremium.toFixed(0)}%</p>
        </div>
        <div className="pl-3">
          <p className="text-xs text-slate-400">Top Error</p>
          <p className="text-lg font-bold text-amber-400 truncate">{topError ? topError.errorType : 'N/A'}</p>
        </div>
      </div>

      {/* Top error card highlight */}
      {topError && (
        <div className="flex items-center gap-3 p-3 bg-red-500/5 border border-red-500/20 rounded-xl mb-4">
          <AlertOctagon size={14} className="text-red-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Highest Premium</p>
            <p className="text-xs text-white font-medium truncate">{topError.cardName}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-slate-500">Premium</p>
            <p className="text-sm font-bold text-red-400">+{topError.premiumPercent.toFixed(0)}%</p>
          </div>
        </div>
      )}

      {/* Bottom: categories + market value */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Search size={12} className="text-red-400" />
          <span className="text-xs text-slate-400">Categories: <span className="text-white font-bold">{categories.length} types</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <DollarSign size={12} className="text-emerald-400" />
          <span className="text-xs text-slate-400">
            Value: <span className="text-emerald-400 font-bold">{formatCurrency(premiums.totalMarketValue)}</span>
          </span>
        </div>
      </div>
    </button>
  );
};

export default ErrorCardWidget;
