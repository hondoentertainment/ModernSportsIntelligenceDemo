import React, { useMemo } from 'react';
import { Crosshair, ChevronRight, Bell, DollarSign } from 'lucide-react';
import {
  getLiveAuctions,
  getEndingSoon,
  getAlerts,
  getSniperStats,
  formatCurrency,
} from '../lib/auctionSniperService';

interface AuctionSniperWidgetProps {
  onOpenModal?: () => void;
}

export const AuctionSniperWidget: React.FC<AuctionSniperWidgetProps> = ({ onOpenModal }) => {
  const auctions = useMemo(() => getLiveAuctions(), []);
  const endingSoon = useMemo(() => getEndingSoon(), []);
  const alerts = useMemo(() => getAlerts(), []);
  const stats = useMemo(() => getSniperStats(), []);

  const bestDeal = useMemo(() => {
    if (auctions.length === 0) return null;
    return auctions.reduce((best, a) => a.potentialSavings > best.potentialSavings ? a : best, auctions[0]);
  }, [auctions]);

  const totalSavings = useMemo(() => {
    return auctions.reduce((sum, a) => sum + a.potentialSavings, 0);
  }, [auctions]);

  return (
    <button
      onClick={onOpenModal}
      className="w-full text-left bg-slate-900 rounded-2xl overflow-hidden p-8 hover:border-emerald-500/30 hover:bg-slate-800/60 transition-all duration-300 group border border-slate-700"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Crosshair size={16} className="text-emerald-400" />
          </div>
          <span className="text-xs font-bebas text-slate-400 uppercase tracking-wider">Auction Sniper</span>
        </div>
        <ChevronRight size={16} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
      </div>

      {/* 4-stat grid */}
      <div className="grid grid-cols-4 divide-x divide-slate-700 mb-5">
        <div className="pr-3">
          <p className="text-xs text-slate-400">Live Auctions</p>
          <p className="text-lg font-bold text-emerald-400">{auctions.length}</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-slate-400">Ending Soon</p>
          <p className="text-lg font-bold text-white">{endingSoon.length}</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-slate-400">Alerts</p>
          <p className="text-lg font-bold text-amber-400">{alerts.length}</p>
        </div>
        <div className="pl-3">
          <p className="text-xs text-slate-400">Potential Saves</p>
          <p className="text-lg font-bold text-violet-400">{formatCurrency(totalSavings)}</p>
        </div>
      </div>

      {/* Best deal highlight */}
      {bestDeal && (
        <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl mb-4">
          <Crosshair size={14} className="text-emerald-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Best Deal</p>
            <p className="text-xs text-white font-medium truncate">{bestDeal.itemName}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-slate-500">Save</p>
            <p className="text-sm font-bold text-emerald-400">{formatCurrency(bestDeal.potentialSavings)}</p>
          </div>
        </div>
      )}

      {/* Bottom: wins + success rate */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Bell size={12} className="text-amber-400" />
          <span className="text-xs text-slate-400">Active: <span className="text-white font-bold">{alerts.filter(a => a.active).length} alerts</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <DollarSign size={12} className="text-emerald-400" />
          <span className="text-xs text-slate-400">
            Win Rate: <span className="text-emerald-400 font-bold">{stats.winRate.toFixed(0)}%</span>
          </span>
        </div>
      </div>
    </button>
  );
};

export default AuctionSniperWidget;
