import React, { useMemo } from 'react';
import { Users, ChevronRight, TrendingUp, Trophy, Target } from 'lucide-react';
import {
  getActiveTraders,
  getDailyPicks,
  getLeaderboard,
  getTradingStats,
  formatCurrency,
} from '../lib/social/socialTradingService';

interface SocialTradingWidgetProps {
  onOpenModal?: () => void;
}

export const SocialTradingWidget: React.FC<SocialTradingWidgetProps> = ({ onOpenModal }) => {
  const traders = useMemo(() => getActiveTraders(), []);
  const picks = useMemo(() => getDailyPicks(), []);
  const leaderboard = useMemo(() => getLeaderboard(), []);
  const stats = useMemo(() => getTradingStats(), []);

  const topTrader = useMemo(() => {
    if (leaderboard.length === 0) return null;
    return leaderboard[0];
  }, [leaderboard]);

  const winRate = useMemo(() => {
    if (picks.length === 0) return 0;
    const wins = picks.filter(p => p.outcome === 'win').length;
    return (wins / picks.length) * 100;
  }, [picks]);

  return (
    <button
      onClick={onOpenModal}
      className="w-full text-left bg-slate-900 rounded-2xl overflow-hidden p-8 hover:border-pink-500/30 hover:bg-slate-800/60 transition-all duration-300 group border border-slate-700"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-pink-500/10 rounded-lg">
            <Users size={16} className="text-pink-400" />
          </div>
          <span className="text-xs font-bebas text-slate-400 uppercase tracking-wider">Social Trading</span>
        </div>
        <ChevronRight size={16} className="text-slate-500 group-hover:text-pink-400 transition-colors" />
      </div>

      {/* 4-stat grid */}
      <div className="grid grid-cols-4 divide-x divide-slate-700 mb-5">
        <div className="pr-3">
          <p className="text-xs text-slate-400">Active Traders</p>
          <p className="text-lg font-bold text-pink-400">{traders.length}</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-slate-400">Picks Today</p>
          <p className="text-lg font-bold text-white">{picks.length}</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-slate-400">Win Rate</p>
          <p className="text-lg font-bold text-emerald-400">{winRate.toFixed(0)}%</p>
        </div>
        <div className="pl-3">
          <p className="text-xs text-slate-400">Top Trader</p>
          <p className="text-lg font-bold text-amber-400 truncate">{topTrader ? topTrader.username : 'N/A'}</p>
        </div>
      </div>

      {/* Top trader highlight */}
      {topTrader && (
        <div className="flex items-center gap-3 p-3 bg-pink-500/5 border border-pink-500/20 rounded-xl mb-4">
          <Trophy size={14} className="text-pink-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-pink-400 uppercase tracking-widest">Top Performer</p>
            <p className="text-xs text-white font-medium truncate">{topTrader.username}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-slate-500">ROI</p>
            <p className="text-sm font-bold text-pink-400">+{topTrader.roiPercent.toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Bottom: community profit + accuracy */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <TrendingUp size={12} className="text-emerald-400" />
          <span className="text-xs text-slate-400">Profit: <span className="text-emerald-400 font-bold">{formatCurrency(stats.communityProfit)}</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Target size={12} className="text-pink-400" />
          <span className="text-xs text-slate-400">
            Accuracy: <span className="text-pink-400 font-bold">{stats.accuracy.toFixed(0)}%</span>
          </span>
        </div>
      </div>
    </button>
  );
};

export default SocialTradingWidget;
