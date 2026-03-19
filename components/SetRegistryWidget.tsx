import React, { useMemo } from 'react';
import { LayoutGrid, ChevronRight, Target, Search, Hash } from 'lucide-react';
import {
  getSetRegistries,
  getOwnedCards,
  getMissingCards,
  getCompletionSummary,
  formatCurrency,
} from '../lib/core/setRegistryService';

interface SetRegistryWidgetProps {
  onOpenModal?: () => void;
}

export const SetRegistryWidget: React.FC<SetRegistryWidgetProps> = ({ onOpenModal }) => {
  const registries = useMemo(() => getSetRegistries(), []);
  const ownedCards = useMemo(() => getOwnedCards(), []);
  const missingCards = useMemo(() => getMissingCards(), []);
  const stats = useMemo(() => getCompletionSummary(), []);

  const nearestCompletion = useMemo(() => {
    if (registries.length === 0) return null;
    return registries.reduce((best, r) => r.completionPercent > best.completionPercent ? r : best, registries[0]);
  }, [registries]);

  const avgCompletion = useMemo(() => {
    if (registries.length === 0) return 0;
    return registries.reduce((sum, r) => sum + r.completionPercent, 0) / registries.length;
  }, [registries]);

  return (
    <button
      onClick={onOpenModal}
      className="w-full text-left bg-slate-900 rounded-2xl overflow-hidden p-8 hover:border-blue-500/30 hover:bg-slate-800/60 transition-all duration-300 group border border-slate-700"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <LayoutGrid size={16} className="text-blue-400" />
          </div>
          <span className="text-xs font-bebas text-slate-400 uppercase tracking-wider">Set Registry</span>
        </div>
        <ChevronRight size={16} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
      </div>

      {/* 4-stat grid */}
      <div className="grid grid-cols-4 divide-x divide-slate-700 mb-5">
        <div className="pr-3">
          <p className="text-xs text-slate-400">Sets Tracked</p>
          <p className="text-lg font-bold text-blue-400">{registries.length}</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-slate-400">Avg Completion</p>
          <p className="text-lg font-bold text-white">{avgCompletion.toFixed(0)}%</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-slate-400">Cards Owned</p>
          <p className="text-lg font-bold text-emerald-400">{ownedCards.length}</p>
        </div>
        <div className="pl-3">
          <p className="text-xs text-slate-400">Missing Cards</p>
          <p className="text-lg font-bold text-red-400">{missingCards.length}</p>
        </div>
      </div>

      {/* Nearest completion highlight */}
      {nearestCompletion && (
        <div className="flex items-center gap-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl mb-4">
          <Target size={14} className="text-blue-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Nearest Complete</p>
            <p className="text-xs text-white font-medium truncate">{nearestCompletion.setName}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-slate-500">Progress</p>
            <p className="text-sm font-bold text-blue-400">{nearestCompletion.completionPercent}%</p>
          </div>
        </div>
      )}

      {/* Bottom: total sets value + missing cost */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Hash size={12} className="text-blue-400" />
          <span className="text-xs text-slate-400">Value: <span className="text-white font-bold">{formatCurrency(stats.totalValue)}</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Search size={12} className="text-red-400" />
          <span className="text-xs text-slate-400">
            Missing Cost: <span className="text-red-400 font-bold">{formatCurrency(stats.missingCost)}</span>
          </span>
        </div>
      </div>
    </button>
  );
};

export default SetRegistryWidget;
