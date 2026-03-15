import React, { useMemo } from 'react';
import { Radio, ChevronRight, Flame, Eye, Zap } from 'lucide-react';
import {
  getLiveBreaks,
  getRecentResults,
  getBreakSchedule,
  getViewerStats,
  getPlatformConfig,
  getFormatConfig,
  formatCurrency,
} from '../lib/liveBreakHubService';

interface LiveBreakHubWidgetProps {
  onOpenModal?: () => void;
}

const LiveBreakHubWidget: React.FC<LiveBreakHubWidgetProps> = ({ onOpenModal }) => {
  const breaks = useMemo(() => getLiveBreaks(), []);
  const results = useMemo(() => getRecentResults(10), []);
  const schedule = useMemo(() => getBreakSchedule(3), []);
  const viewerStats = useMemo(() => getViewerStats(), []);

  const liveBreaks = breaks.filter(b => b.status === 'live');
  const totalViewers = viewerStats.reduce((s, v) => s + v.totalViewers, 0);
  const upcomingCount = schedule.filter(s => s.status === 'scheduled' || s.status === 'filling').length;

  const bestHit = results
    .filter(r => r.isNotableHit)
    .sort((a, b) => b.estimatedValue - a.estimatedValue)[0];

  const hottestBreak = liveBreaks.sort((a, b) => b.viewerCount - a.viewerCount)[0];

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
      {/* Widget Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-red-400" />
          <h3 className="text-base font-bold text-white">Live Break Hub</h3>
          {liveBreaks.length > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500/20 text-red-400 rounded-full animate-pulse">
              LIVE
            </span>
          )}
        </div>
        <button
          onClick={onOpenModal}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          Details <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-4 divide-x divide-slate-700 border-b border-slate-700">
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Live Now</p>
          <p className="text-lg font-bold text-red-400">{liveBreaks.length}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Viewers</p>
          <p className="text-lg font-bold text-blue-400">{(totalViewers / 1000).toFixed(1)}K</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Best Hit</p>
          <p className="text-lg font-bold text-emerald-400">{bestHit ? formatCurrency(bestHit.estimatedValue) : '$0'}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Upcoming</p>
          <p className="text-lg font-bold text-amber-400">{upcomingCount}</p>
        </div>
      </div>

      {/* Hottest Break */}
      {hottestBreak && (
        <div className="p-4 border-b border-slate-700">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            Hottest Break
          </h4>
          <button
            onClick={onOpenModal}
            className="w-full flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl transition-colors text-left group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-white truncate">
                  {hottestBreak.breakerName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {(() => {
                  const pc = getPlatformConfig(hottestBreak.platform);
                  return (
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${pc.bg} ${pc.text} ${pc.border}`}>
                      {pc.label}
                    </span>
                  );
                })()}
                {(() => {
                  const fc = getFormatConfig(hottestBreak.format);
                  return (
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${fc.bg} ${fc.text} ${fc.border}`}>
                      {fc.label}
                    </span>
                  );
                })()}
                <span className="text-xs text-slate-400">{hottestBreak.product}</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-sm font-bold text-white flex items-center gap-1">
                <Eye className="w-3 h-3 text-red-400" /> {hottestBreak.viewerCount.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500">viewers</span>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
          </button>
        </div>
      )}

      {/* Top Hit Today */}
      {bestHit && (
        <div className="p-4">
          <div className="flex items-center justify-between p-3 bg-slate-800 border border-slate-700 rounded-xl">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-sm font-semibold text-white">{bestHit.player}</span>
                <p className="text-[10px] text-slate-500 truncate max-w-[180px]">{bestHit.cardPulled}</p>
              </div>
            </div>
            <span className="px-2 py-0.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              {formatCurrency(bestHit.estimatedValue)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveBreakHubWidget;
