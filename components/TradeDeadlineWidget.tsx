import React, { useMemo } from 'react';
import { CalendarClock, ChevronRight, AlertTriangle, TrendingUp } from 'lucide-react';
import {
  getTradeEvents,
  getAffectedPlayers,
  getDeadlineInfo,
  getMarketImpact,
  formatCurrency,
} from '../lib/trading/tradeDeadlineService';

interface TradeDeadlineWidgetProps {
  onOpenModal?: () => void;
}

export const TradeDeadlineWidget: React.FC<TradeDeadlineWidgetProps> = ({ onOpenModal }) => {
  const trades = useMemo(() => getTradeEvents(), []);
  const players = useMemo(() => getAffectedPlayers(), []);
  const deadline = useMemo(() => getDeadlineInfo(), []);
  const impact = useMemo(() => getMarketImpact(), []);

  const biggestTrade = useMemo(() => {
    if (trades.length === 0) return null;
    return trades.reduce((best, t) => t.impactScore > best.impactScore ? t : best, trades[0]);
  }, [trades]);

  const urgentTrades = useMemo(() => trades.filter(t => t.status === 'pending'), [trades]);

  return (
    <button
      onClick={onOpenModal}
      className="w-full text-left bg-slate-900 rounded-2xl overflow-hidden p-8 hover:border-red-500/30 hover:bg-slate-800/60 transition-all duration-300 group border border-slate-700"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <CalendarClock size={16} className="text-red-400" />
          </div>
          <span className="text-xs font-bebas text-slate-400 uppercase tracking-wider">Trade Deadline</span>
        </div>
        <ChevronRight size={16} className="text-slate-500 group-hover:text-red-400 transition-colors" />
      </div>

      {/* 4-stat grid */}
      <div className="grid grid-cols-4 divide-x divide-slate-700 mb-5">
        <div className="pr-3">
          <p className="text-xs text-slate-400">Active Trades</p>
          <p className="text-lg font-bold text-red-400">{trades.length}</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-slate-400">Players Affected</p>
          <p className="text-lg font-bold text-white">{players.length}</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-slate-400">Deadline</p>
          <p className="text-lg font-bold text-amber-400">{deadline.daysRemaining}d</p>
        </div>
        <div className="pl-3">
          <p className="text-xs text-slate-400">Market Impact</p>
          <p className="text-lg font-bold text-emerald-400">{formatCurrency(impact.totalImpact)}</p>
        </div>
      </div>

      {/* Biggest trade highlight */}
      {biggestTrade && (
        <div className="flex items-center gap-3 p-3 bg-red-500/5 border border-red-500/20 rounded-xl mb-4">
          <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Biggest Trade</p>
            <p className="text-xs text-white font-medium truncate">{biggestTrade.playerName} → {biggestTrade.toTeam}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-slate-500">Impact</p>
            <p className="text-sm font-bold text-red-400">+{biggestTrade.impactScore}%</p>
          </div>
        </div>
      )}

      {/* Bottom: urgent trades + market trend */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CalendarClock size={12} className="text-red-400" />
          <span className="text-xs text-slate-400">Urgent: <span className="text-white font-bold">{urgentTrades.length} pending</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingUp size={12} className="text-emerald-400" />
          <span className="text-xs text-slate-400">
            Trend: <span className="text-emerald-400 font-bold">+{impact.trendPercent.toFixed(1)}%</span>
          </span>
        </div>
      </div>
    </button>
  );
};

export default TradeDeadlineWidget;
