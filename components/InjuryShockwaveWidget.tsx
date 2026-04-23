// @ts-nocheck
import React, { useMemo } from 'react';
import { Zap, Activity, Layers, ShieldAlert } from 'lucide-react';
import {
  getShockwaveStats,
  getActiveShockwaves,
  severityConfig,
  timeAgo,
} from '../lib/analytics/injuryShockwaveService';

interface InjuryShockwaveWidgetProps {
  onViewAll?: () => void;
}

export const InjuryShockwaveWidget: React.FC<InjuryShockwaveWidgetProps> = ({ onViewAll }) => {
  const stats = useMemo(() => getShockwaveStats(), []);
  const activeShockwaves = useMemo(() => getActiveShockwaves(), []);
  const latestEvent = activeShockwaves[0] ?? null;

  return (
    <div className="bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-500/10 rounded-xl text-red-400">
            <Zap size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Injury <span className="text-red-400">Shockwave</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Cascade propagation engine
            </p>
          </div>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-bold text-brand-lime hover:text-white transition-colors uppercase tracking-widest"
          >
            View All
          </button>
        )}
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <ShieldAlert size={14} className="text-red-400" />
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Active Alerts</span>
          </div>
          <span className="text-2xl font-bebas tracking-wider text-white">{stats.activeAlerts}</span>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Layers size={14} className="text-amber-400" />
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Avg Depth</span>
          </div>
          <span className="text-2xl font-bebas tracking-wider text-white">{stats.averageCascadeDepth}</span>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Activity size={14} className="text-brand-lime" />
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Exposure</span>
          </div>
          <span className="text-2xl font-bebas tracking-wider text-white">
            ${Math.abs(stats.portfolioExposure).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      {/* Latest Event */}
      {latestEvent && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Latest Shockwave</p>
          <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${severityConfig[latestEvent.injuryEvent.severity].bg} ${severityConfig[latestEvent.injuryEvent.severity].color} border ${severityConfig[latestEvent.injuryEvent.severity].border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    latestEvent.injuryEvent.severity === 'season-ending' || latestEvent.injuryEvent.severity === 'severe'
                      ? 'bg-red-500'
                      : latestEvent.injuryEvent.severity === 'moderate'
                        ? 'bg-amber-500'
                        : 'bg-green-500'
                  }`} />
                  {severityConfig[latestEvent.injuryEvent.severity].label}
                </span>
                <span className="text-xs text-slate-500">{timeAgo(latestEvent.injuryEvent.timestamp)}</span>
              </div>
              <span className="text-xs font-mono text-slate-400">{latestEvent.nodes.length} nodes</span>
            </div>

            <div>
              <p className="text-sm text-white font-medium">{latestEvent.injuryEvent.playerName}</p>
              <p className="text-xs text-slate-400">{latestEvent.injuryEvent.injuryType} &mdash; {latestEvent.injuryEvent.team}</p>
            </div>

            {/* Risk bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500 uppercase tracking-widest font-black">Cascade Depth</span>
                <span className="font-mono text-white">{latestEvent.cascadeDepth} / 4</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    latestEvent.cascadeDepth >= 3
                      ? 'bg-red-500'
                      : latestEvent.cascadeDepth >= 2
                        ? 'bg-amber-500'
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${(latestEvent.cascadeDepth / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* Impact preview */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-700/50">
              <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Portfolio Impact</span>
              <span className={`font-mono text-sm font-bold ${
                latestEvent.totalPortfolioImpact < 0 ? 'text-red-400' : 'text-green-400'
              }`}>
                {latestEvent.totalPortfolioImpact < 0 ? '-' : '+'}$
                {Math.abs(latestEvent.totalPortfolioImpact).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!latestEvent && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-slate-800/50 rounded-2xl mb-4">
            <Zap size={32} className="text-slate-600" />
          </div>
          <p className="text-sm text-slate-400">No active shockwaves</p>
          <p className="text-xs text-slate-600 mt-1">Injury events will appear here when detected</p>
        </div>
      )}
    </div>
  );
};

export default React.memo(InjuryShockwaveWidget);
