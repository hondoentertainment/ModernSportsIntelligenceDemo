import React, { useMemo } from 'react';
import { Award, ChevronRight, Users, TrendingUp, ShieldAlert } from 'lucide-react';
import { getHofCandidates, getHofStats } from '../lib/hofProbabilityService';

interface HofProbabilityWidgetProps {
  onClick?: () => void;
}

export const HofProbabilityWidget: React.FC<HofProbabilityWidgetProps> = ({ onClick }) => {
  const candidates = useMemo(() => getHofCandidates(), []);
  const stats = useMemo(() => getHofStats(), []);

  const top3 = useMemo(
    () => [...candidates].sort((a, b) => b.hofProbability - a.hofProbability).slice(0, 3),
    [candidates],
  );

  const probabilityColor = (p: number) => {
    if (p >= 80) return 'bg-emerald-500';
    if (p >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const probabilityTextColor = (p: number) => {
    if (p >= 80) return 'text-emerald-400';
    if (p >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400">
            <Award size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              HOF <span className="text-amber-400">Probability</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Career Trajectory Engine
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* 3-col stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
          <Users size={14} className="text-amber-400 mx-auto mb-1" />
          <p className="text-lg font-bebas tracking-wider text-white">
            {stats.totalCandidatesTracked}
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Tracked</p>
        </div>
        <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
          <TrendingUp size={14} className="text-amber-400 mx-auto mb-1" />
          <p className="text-lg font-bebas tracking-wider text-white">{stats.avgProbability}%</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Avg Prob</p>
        </div>
        <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
          <ShieldAlert size={14} className="text-amber-400 mx-auto mb-1" />
          <p className="text-lg font-bebas tracking-wider text-white">
            ${(stats.premiumAtRisk / 1000).toFixed(1)}k
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Premium</p>
        </div>
      </div>

      {/* Top 3 candidates */}
      <div className="space-y-2.5">
        {top3.map((candidate) => (
          <div
            key={candidate.id}
            className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl"
          >
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <span className="text-xs font-bebas text-amber-400">
                {candidate.playerName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-bold text-white truncate">{candidate.playerName}</p>
                <span className={`text-xs font-bold ${probabilityTextColor(candidate.hofProbability)}`}>
                  {candidate.hofProbability}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${probabilityColor(candidate.hofProbability)}`}
                  style={{ width: `${candidate.hofProbability}%` }}
                />
              </div>
            </div>

            <span className="flex-shrink-0 text-[10px] font-bold text-slate-500 uppercase px-1.5 py-0.5 bg-slate-700/50 rounded">
              {candidate.sport}
            </span>
          </div>
        ))}
      </div>

      {/* Portfolio HOF Exposure */}
      <div className="flex items-center justify-between p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
        <div className="flex items-center gap-2">
          <Award size={14} className="text-amber-400" />
          <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
            Portfolio HOF Exposure
          </span>
        </div>
        <span className="text-sm font-bold text-white">
          ${stats.portfolioHofExposure.toLocaleString()}
        </span>
      </div>
    </button>
  );
};

export default HofProbabilityWidget;
