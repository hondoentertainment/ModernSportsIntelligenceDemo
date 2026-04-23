// @ts-nocheck
import React, { useMemo } from 'react';
import {
  Users,
  TrendingUp,
  ChevronRight,
  ArrowUpRight,
  Bell,
  Layers,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  getProspectsNearestCallUp,
  getRecentPromotions,
  getStashSummary,
  getCallUpAlerts,
  Prospect,
} from '../lib/analytics/prospectPipelineService';

interface ProspectWidgetProps {
  inventory: CardInventory[];
  onClick?: () => void;
}

function stageBadge(stage: string): { label: string; cls: string } {
  switch (stage) {
    case 'call_up':      return { label: 'CALL-UP', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
    case 'minor_league': return { label: 'MINORS',  cls: 'bg-blue-500/20 text-blue-400 border-blue-500/40' };
    case 'drafted':      return { label: 'DRAFTED', cls: 'bg-purple-500/20 text-purple-400 border-purple-500/40' };
    case 'rookie':       return { label: 'ROOKIE',  cls: 'bg-amber-500/20 text-amber-400 border-amber-500/40' };
    default:             return { label: 'AMATEUR', cls: 'bg-slate-500/20 text-slate-400 border-slate-500/40' };
  }
}

function sportColor(sport: string): string {
  switch (sport) {
    case 'Baseball':    return 'text-red-400';
    case 'Basketball':  return 'text-orange-400';
    case 'Football':    return 'text-green-400';
    case 'Hockey':      return 'text-cyan-400';
    case 'Soccer':      return 'text-yellow-400';
    default:            return 'text-slate-400';
  }
}

export const ProspectWidget: React.FC<ProspectWidgetProps> = ({ onClick }) => {
  const nearCallUp = useMemo(() => getProspectsNearestCallUp(5), []);
  const recentPromos = useMemo(() => getRecentPromotions(), []);
  const stash = useMemo(() => getStashSummary(), []);
  const alerts = useMemo(() => getCallUpAlerts().filter(a => !a.acknowledged), []);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
            <Users size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Prospect <span className="text-blue-400">Pipeline</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Draft tracker &amp; call-up alerts
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all"
        />
      </div>

      {/* Alert banner */}
      {alerts.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
          <Bell size={14} className="text-emerald-400 flex-shrink-0" />
          <span className="text-xs text-emerald-400 font-semibold">
            {alerts.length} new call-up alert{alerts.length !== 1 ? 's' : ''}
          </span>
          <span className="ml-auto text-[10px] text-emerald-500/70 font-mono">
            +{alerts[0].priceJump}% avg jump
          </span>
        </div>
      )}

      {/* Top 5 nearest call-up */}
      <div className="bg-slate-800/50 rounded-2xl p-4 space-y-2.5">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
          Nearest to Call-Up
        </p>
        {nearCallUp.map((p: Prospect) => {
          const badge = stageBadge(p.stage);
          return (
            <div key={p.id} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white truncate group-hover:text-blue-300 transition-colors">
                    {p.name}
                  </span>
                  <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${badge.cls}`}>
                    {badge.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className={sportColor(p.sport)}>{p.sport}</span>
                  <span className="text-slate-600">&middot;</span>
                  <span className="text-slate-500">{p.position}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-mono font-bold text-emerald-400">{p.callUpProbability}%</p>
                <p className="text-[10px] text-slate-500">prob.</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent promotions */}
      {recentPromos.length > 0 && (
        <div className="bg-slate-800/50 rounded-2xl p-4 space-y-2">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-1.5">
            <ArrowUpRight size={12} className="text-emerald-400" />
            Recent Promotions
          </p>
          {recentPromos.slice(0, 3).map((p: Prospect) => (
            <div key={p.id} className="flex items-center justify-between">
              <span className="text-sm text-white font-medium truncate">{p.name}</span>
              <span className="text-xs font-mono text-emerald-400">+{p.avgPriceJump}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Stash summary */}
      <div className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-700/50 rounded-2xl">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-slate-400" />
          <span className="text-xs text-slate-400 font-medium">Stash Portfolio</span>
        </div>
        {stash.count > 0 ? (
          <div className="flex items-center gap-3">
            <span className="font-bebas text-xl tracking-wider text-white">
              ${stash.currentValue.toFixed(0)}
            </span>
            <span className={`text-xs font-mono font-semibold ${stash.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {stash.roi >= 0 ? '+' : ''}{stash.roi}%
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-500">No stash entries yet</span>
        )}
      </div>

      {/* CTA */}
      <div className="flex items-center gap-2 text-blue-400 group-hover:text-blue-300 transition-colors">
        <TrendingUp size={14} />
        <span className="text-xs font-semibold uppercase tracking-wider">Browse full pipeline</span>
        <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
      </div>
    </button>
  );
};

export default ProspectWidget;
