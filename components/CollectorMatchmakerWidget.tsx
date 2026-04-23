// @ts-nocheck
import React, { useMemo } from 'react';
import {
  Handshake,
  Users,
  ArrowLeftRight,
  Star,
  TrendingUp,
  Bell,
} from 'lucide-react';
import {
  findMatches,
  getTradeProposals,
  getMatchNotifications,
  formatCurrency,
} from '../lib/core/collectorMatchmakerService';

interface CollectorMatchmakerWidgetProps {
  onClick?: () => void;
}

export const CollectorMatchmakerWidget: React.FC<CollectorMatchmakerWidgetProps> = ({ onClick }) => {
  const matches = useMemo(() => findMatches(), []);
  const proposals = useMemo(() => getTradeProposals(), []);
  const notifications = useMemo(() => getMatchNotifications(), []);

  const topMatch = matches[0] ?? null;
  const pendingCount = proposals.filter(p => p.status === 'proposed' || p.status === 'countered').length;
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-600 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
            <Handshake size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              COLLECTOR MATCHMAKER
            </h3>
            <p className="text-sm text-slate-400">Nash equilibrium trading partner matching</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <span className="bg-red-500/20 text-red-400 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
            <Bell size={12} /> {unreadCount}
          </span>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-3 text-center">
          <Users size={16} className="text-emerald-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-white">{matches.length}</p>
          <p className="text-xs text-slate-400">Matches</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-3 text-center">
          <ArrowLeftRight size={16} className="text-blue-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-white">{pendingCount}</p>
          <p className="text-xs text-slate-400">Pending</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-3 text-center">
          <Star size={16} className="text-amber-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-white">{topMatch?.compatibilityScore ?? 0}%</p>
          <p className="text-xs text-slate-400">Best Match</p>
        </div>
      </div>

      {/* Top Match Preview */}
      {topMatch && (
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{topMatch.collector2.avatar}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{topMatch.collector2.alias}</p>
              <p className="text-slate-400 text-xs truncate">{topMatch.matchReason}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-emerald-400 font-bold text-lg">{topMatch.compatibilityScore}%</p>
              <p className="text-slate-500 text-xs">compatibility</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer CTA */}
      <div className="flex items-center justify-between">
        <span className="text-emerald-400 text-sm font-medium group-hover:text-emerald-300 transition-colors">
          Find trading partners
        </span>
        <TrendingUp size={16} className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
};

export default CollectorMatchmakerWidget;
