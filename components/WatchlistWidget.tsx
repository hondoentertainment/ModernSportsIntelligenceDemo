// @ts-nocheck
import React, { useMemo } from 'react';
import {
  Eye,
  Bell,
  TrendingUp,
  TrendingDown,
  List,
  Target,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  getWatchlists,
  getWatchlistAnalytics,
  evaluateAlerts,
} from '../lib/trading/watchlistService';

interface WatchlistWidgetProps {
  inventory: CardInventory[];
  onClick?: () => void;
}

export const WatchlistWidget: React.FC<WatchlistWidgetProps> = ({ _inventory, onClick }) => {
  const watchlists = useMemo(() => getWatchlists(), []);
  const analytics = useMemo(() => getWatchlistAnalytics(watchlists), [watchlists]);
  const triggeredAlerts = useMemo(() => evaluateAlerts(watchlists), [watchlists]);

  const alertCount = triggeredAlerts.length;
  const watchlistCount = watchlists.length;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-400">
            <Eye size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Market <span className="text-cyan-400">Watchlists</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Price tracking & alerts
            </p>
          </div>
        </div>
        {alertCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 animate-pulse">
            <Bell size={14} />
            {alertCount}
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <div className="flex items-center gap-1.5 text-xs">
          <List size={14} className="text-slate-400" />
          <span className="text-slate-400 font-medium">Lists:</span>
          <span className="font-bebas text-lg text-white tracking-wider">{watchlistCount}</span>
        </div>
        <div className="h-5 w-px bg-slate-700" />
        <div className="flex items-center gap-1.5 text-xs">
          <Target size={14} className="text-slate-400" />
          <span className="text-slate-400 font-medium">Watching:</span>
          <span className="font-bebas text-lg text-white tracking-wider">{analytics.totalWatched}</span>
        </div>
        <div className="h-5 w-px bg-slate-700" />
        <div className="flex items-center gap-1.5 text-xs">
          <Bell size={14} className={alertCount > 0 ? 'text-red-400' : 'text-slate-400'} />
          <span className="text-slate-400 font-medium">Alerts:</span>
          <span className={`font-bebas text-lg tracking-wider ${alertCount > 0 ? 'text-red-400' : 'text-white'}`}>
            {alertCount}
          </span>
        </div>
      </div>

      {/* Top Mover */}
      {analytics.topMover && (
        <div className="flex items-center gap-3 p-4 bg-slate-800/30 border border-slate-700/50 rounded-2xl">
          <div className={`p-2 rounded-lg ${analytics.topMover.changePct >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {analytics.topMover.changePct >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Top Mover</p>
            <p className="text-sm text-white font-medium truncate group-hover:text-brand-lime transition-colors">
              {analytics.topMover.player}
            </p>
          </div>
          <span className={`font-mono text-sm font-bold ${analytics.topMover.changePct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {analytics.topMover.changePct >= 0 ? '+' : ''}{analytics.topMover.changePct.toFixed(1)}%
          </span>
        </div>
      )}

      {/* Best Entry Point */}
      {analytics.bestEntry && (
        <div className="flex items-center gap-3 p-4 bg-cyan-500/5 border border-cyan-500/15 rounded-2xl">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Target size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-cyan-400/70 uppercase tracking-widest">Best Entry</p>
            <p className="text-sm text-white font-medium truncate">
              {analytics.bestEntry.player}
            </p>
          </div>
          <span className="font-mono text-sm font-bold text-cyan-400">
            -${analytics.bestEntry.priceDrop.toFixed(2)}
          </span>
        </div>
      )}

      {/* Empty State */}
      {watchlistCount === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-slate-800/50 rounded-2xl mb-4">
            <Eye size={32} className="text-slate-600" />
          </div>
          <p className="text-sm text-slate-400">No watchlists created</p>
          <p className="text-xs text-slate-600 mt-1">Click to create your first market watchlist</p>
        </div>
      )}
    </button>
  );
};

export default WatchlistWidget;
