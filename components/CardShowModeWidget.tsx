// @ts-nocheck
import React, { useMemo } from 'react';
import { MapPin, Wifi, WifiOff, ChevronRight, DollarSign, ShoppingBag } from 'lucide-react';
import {
  getNextShow,
  getShowHaul,
  getOfflineStatus,
} from '../lib/utils/cardShowModeService';

interface CardShowModeWidgetProps {
  onOpenModal?: () => void;
}

const formatCurrency = (val: number): string => {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
  return `$${val.toFixed(0)}`;
};

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getDaysUntil = (dateStr: string): number => {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
};

export const CardShowModeWidget: React.FC<CardShowModeWidgetProps> = ({ onOpenModal }) => {
  const nextShow = useMemo(() => getNextShow(), []);
  const haul = useMemo(() => getShowHaul(), []);
  const offlineStatus = useMemo(() => getOfflineStatus(), []);

  const daysUntil = nextShow ? getDaysUntil(nextShow.startDate) : 0;

  return (
    <button
      onClick={onOpenModal}
      className="w-full text-left bg-brand-slate rounded-[2.5rem] p-8 hover:border-lime-500/30 hover:bg-slate-800/60 transition-all duration-300 group border border-slate-700/50"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-lime-500/10 rounded-lg">
            <MapPin size={16} className="text-lime-400" />
          </div>
          <span className="text-xs font-bebas text-slate-400 uppercase tracking-wider">Card Show Mode</span>
        </div>
        <ChevronRight size={16} className="text-slate-500 group-hover:text-lime-400 transition-colors" />
      </div>

      {/* Next Show */}
      {nextShow && (
        <div className="mb-4">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Next Show</div>
          <div className="text-lg font-bold text-white leading-tight truncate">{nextShow.name}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-400">{formatDate(nextShow.startDate)}</span>
            <span className="text-[10px] text-slate-600">|</span>
            <span className="text-xs text-lime-400 font-bold">{daysUntil}d away</span>
          </div>
        </div>
      )}

      {/* Offline Status */}
      <div className="flex items-center gap-2 mb-4">
        {offlineStatus.isOnline ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <Wifi size={10} className="text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400">Online</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
            <WifiOff size={10} className="text-amber-400" />
            <span className="text-[10px] font-bold text-amber-400">Offline</span>
          </div>
        )}
        <span className="text-[10px] text-slate-500">{offlineStatus.cachedComps} comps cached</span>
      </div>

      {/* Haul Stats Row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-800/40 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <ShoppingBag size={10} className="text-slate-400" />
            <span className="text-[10px] text-slate-500 font-bold uppercase">Haul Value</span>
          </div>
          <span className="text-lg font-bold text-white">{formatCurrency(haul.totalEstimatedValue)}</span>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign size={10} className="text-slate-400" />
            <span className="text-[10px] text-slate-500 font-bold uppercase">P&L</span>
          </div>
          <span className={`text-lg font-bold ${haul.profitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {haul.profitLoss >= 0 ? '+' : ''}{formatCurrency(haul.profitLoss)}
          </span>
        </div>
      </div>

      {/* Deals Badge */}
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-lime-500/10 border border-lime-500/20 rounded-full">
        <ShoppingBag size={12} className="text-lime-400" />
        <span className="text-xs font-bold text-lime-400">{haul.deals.length} deals logged</span>
      </div>
    </button>
  );
};

export default CardShowModeWidget;
