// @ts-nocheck
import React, { useMemo } from 'react';
import { Gift, ChevronRight, Zap, Trophy, DollarSign } from 'lucide-react';
import {
  getDailyDeals,
  getPackHistory,
  getJackpotInfo,
  getCollectorProfile,
  formatCurrency,
} from '../lib/trading/vendingMachineService';

interface VendingMachineWidgetProps {
  onOpenModal?: () => void;
}

export const VendingMachineWidget: React.FC<VendingMachineWidgetProps> = ({ onOpenModal }) => {
  const deals = useMemo(() => getDailyDeals(), []);
  const history = useMemo(() => getPackHistory(), []);
  const jackpot = useMemo(() => getJackpotInfo(), []);
  const profile = useMemo(() => getCollectorProfile(), []);

  const bestPull = useMemo(() => {
    const allCards = history.flatMap(h => h.cards);
    if (allCards.length === 0) return null;
    return allCards.reduce((best, c) => c.estimatedValue > best.estimatedValue ? c : best, allCards[0]);
  }, [history]);

  const featuredDeal = useMemo(() => deals.find(d => d.featured) || deals[0], [deals]);

  return (
    <button
      onClick={onOpenModal}
      className="w-full text-left bg-brand-slate rounded-[2.5rem] p-8 hover:border-lime-500/30 hover:bg-slate-800/60 transition-all duration-300 group border border-slate-700/50"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-lime-500/10 rounded-lg">
            <Gift size={16} className="text-lime-400" />
          </div>
          <span className="text-xs font-bebas text-slate-400 uppercase tracking-wider">Vending Machine</span>
        </div>
        <ChevronRight size={16} className="text-slate-500 group-hover:text-lime-400 transition-colors" />
      </div>

      {/* 4-stat grid */}
      <div className="grid grid-cols-4 divide-x divide-slate-700 mb-5">
        <div className="pr-3">
          <p className="text-xs text-slate-400">Daily Deals</p>
          <p className="text-lg font-bold text-amber-400">{deals.length}</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-slate-400">Packs Opened</p>
          <p className="text-lg font-bold text-white">{profile.totalPacks}</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-slate-400">Best Pull</p>
          <p className="text-lg font-bold text-emerald-400">{bestPull ? formatCurrency(bestPull.estimatedValue) : '$0'}</p>
        </div>
        <div className="pl-3">
          <p className="text-xs text-slate-400">Jackpot Pool</p>
          <p className="text-lg font-bold text-violet-400">{formatCurrency(jackpot.poolAmount)}</p>
        </div>
      </div>

      {/* Featured daily deal highlight */}
      {featuredDeal && (
        <div className="flex items-center gap-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl mb-4">
          <Zap size={14} className="text-amber-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Featured Deal</p>
            <p className="text-xs text-white font-medium truncate">{featuredDeal.packName}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-slate-500 line-through">{formatCurrency(featuredDeal.originalPrice)}</p>
            <p className="text-sm font-bold text-amber-400">{formatCurrency(featuredDeal.dealPrice)}</p>
          </div>
        </div>
      )}

      {/* Bottom: streak + ROI */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Trophy size={12} className="text-brand-lime" />
          <span className="text-xs text-slate-400">Streak: <span className="text-white font-bold">{profile.streak} days</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <DollarSign size={12} className="text-emerald-400" />
          <span className="text-xs text-slate-400">
            ROI: <span className="text-emerald-400 font-bold">
              {profile.totalSpent > 0 ? `+${(((profile.totalValue - profile.totalSpent) / profile.totalSpent) * 100).toFixed(0)}%` : '0%'}
            </span>
          </span>
        </div>
      </div>
    </button>
  );
};

export default VendingMachineWidget;
