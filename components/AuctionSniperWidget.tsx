// Phase 95: Auction Sniper Pro Widget
import React, { useMemo } from 'react';
import { Gavel, ChevronRight, Clock, AlertTriangle } from 'lucide-react';
import {
  getActiveAuctions,
  getEndingSoon,
  getSniperStats,
  AuctionListing,
} from '../lib/auctionSniperService';

interface AuctionSniperWidgetProps {
  onOpenModal: () => void;
}

function formatTimeShort(seconds: number): string {
  if (seconds <= 0) return 'Ended';
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  return `${Math.floor(seconds / 86400)}d`;
}

const PATTERN_BADGE: Record<string, { label: string; cls: string }> = {
  organic: { label: 'ORGANIC', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  shill_suspect: { label: 'SHILL RISK', cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
  proxy_war: { label: 'PROXY WAR', cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  sniper_active: { label: 'SNIPER', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
};

const AuctionSniperWidget: React.FC<AuctionSniperWidgetProps> = ({ onOpenModal }) => {
  const auctions = useMemo(() => getActiveAuctions(), []);
  const endingSoon = useMemo(() => getEndingSoon(), []);
  const stats = useMemo(() => getSniperStats(), []);

  const bestDeal = useMemo(() => {
    if (auctions.length === 0) return null;
    return auctions.reduce((best, a) => a.dealScore > best.dealScore ? a : best, auctions[0]);
  }, [auctions]);

  const shillAlerts = useMemo(() => auctions.filter(a => a.shillRisk > 50), [auctions]);

  return (
    <div
      className="bg-slate-900 border border-slate-700/50 rounded-2xl p-4 hover:border-lime-500/30 transition-all cursor-pointer group"
      onClick={onOpenModal}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-lime-500/20">
            <Gavel size={16} className="text-lime-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">Auction Sniper Pro</h3>
        </div>
        <ChevronRight size={14} className="text-slate-600 group-hover:text-lime-400 transition-colors" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-slate-800/50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Tracked</p>
          <p className="text-lg font-bold text-slate-200">{auctions.length}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center justify-center gap-1">
            <Clock size={8} className="text-red-400" /> Ending
          </p>
          <p className="text-lg font-bold text-red-400">{endingSoon.length}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Win Rate</p>
          <p className="text-lg font-bold text-emerald-400">{stats.winRate}%</p>
        </div>
      </div>

      {/* Best deal */}
      {bestDeal && (
        <div className="bg-slate-800/60 rounded-xl p-3 mb-3 border border-slate-700/50">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Best Current Deal</p>
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{bestDeal.player}</p>
              <p className="text-xs text-slate-400 truncate">{bestDeal.cardDescription} &middot; {bestDeal.grade}</p>
            </div>
            <div className="flex flex-col items-end flex-shrink-0 ml-2">
              <span className="text-xs font-bold text-lime-400">Score {bestDeal.dealScore}</span>
              <span className="text-[10px] text-slate-500">${bestDeal.currentBid.toFixed(0)} / ${bestDeal.estimatedFMV.toFixed(0)} FMV</span>
            </div>
          </div>
        </div>
      )}

      {/* Shill alerts */}
      {shillAlerts.length > 0 && (
        <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertTriangle size={12} className="text-red-400 flex-shrink-0" />
          <span className="text-[11px] text-red-400">
            {shillAlerts.length} auction{shillAlerts.length > 1 ? 's' : ''} with shill risk detected
          </span>
        </div>
      )}

      {/* Lifetime savings */}
      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Lifetime Saved</span>
        <span className="text-sm font-bold text-emerald-400">${stats.totalSaved.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default AuctionSniperWidget;
