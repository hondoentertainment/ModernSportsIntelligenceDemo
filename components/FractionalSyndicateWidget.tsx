// @ts-nocheck
import React, { useMemo } from 'react';
import { Users, ChevronRight, DollarSign, Vote, TrendingUp } from 'lucide-react';
import { getSyndicates, getSyndicateStats } from '../lib/utils/fractionalSyndicateService';

interface FractionalSyndicateWidgetProps {
  onClick?: () => void;
}

export const FractionalSyndicateWidget: React.FC<FractionalSyndicateWidgetProps> = ({ onClick }) => {
  const stats = useMemo(() => getSyndicateStats(), []);
  const syndicates = useMemo(() => getSyndicates(), []);

  const topSyndicate = useMemo(() => {
    const active = syndicates.filter(s => s.status === 'active' && s.deployedCapital > 0);
    if (active.length === 0) return null;
    return active.reduce((best, s) => {
      const bestReturn = best.unrealizedGain / best.deployedCapital;
      const sReturn = s.unrealizedGain / s.deployedCapital;
      return sReturn > bestReturn ? s : best;
    });
  }, [syndicates]);

  const topReturn = topSyndicate && topSyndicate.deployedCapital > 0
    ? Math.round((topSyndicate.unrealizedGain / topSyndicate.deployedCapital) * 1000) / 10
    : 0;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400">
            <Users size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Syndicates
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Pooled capital vehicles
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* 3-col Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Users size={12} className="text-indigo-400" />
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Active</p>
          </div>
          <p className="text-xl font-bebas tracking-wider text-white">{stats.activeSyndicates}</p>
        </div>
        <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <DollarSign size={12} className="text-indigo-400" />
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Capital</p>
          </div>
          <p className="text-xl font-bebas tracking-wider text-white">
            ${stats.totalCapitalManaged >= 1000000
              ? `${(stats.totalCapitalManaged / 1000000).toFixed(1)}M`
              : `${(stats.totalCapitalManaged / 1000).toFixed(0)}K`}
          </p>
        </div>
        <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Vote size={12} className="text-indigo-400" />
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Votes</p>
          </div>
          <p className="text-xl font-bebas tracking-wider text-white">{stats.pendingVotes}</p>
        </div>
      </div>

      {/* Top Syndicate */}
      {topSyndicate && (
        <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              Top Performer
            </span>
            <span className={`flex items-center gap-1 text-xs font-mono font-bold ${topReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              <TrendingUp size={12} />
              {topReturn >= 0 ? '+' : ''}{topReturn}%
            </span>
          </div>
          <p className="text-sm text-white font-semibold">{topSyndicate.name}</p>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {topSyndicate.members.slice(0, 4).map((m, i) => (
                <div
                  key={m.id}
                  className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-[9px] font-bold text-indigo-300"
                  title={m.name}
                >
                  {m.name.charAt(0)}
                </div>
              ))}
              {topSyndicate.members.length > 4 && (
                <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-[9px] font-bold text-slate-400">
                  +{topSyndicate.members.length - 4}
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-500">
              {topSyndicate.members.length} members
            </span>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="flex items-center justify-center gap-2 py-2.5 bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-400 text-xs font-bold uppercase tracking-widest group-hover:bg-indigo-500/30 transition-colors">
        <Users size={14} />
        Create Syndicate
      </div>
    </button>
  );
};

export default FractionalSyndicateWidget;
