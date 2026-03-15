import React, { useState, useMemo } from 'react';
import {
  X,
  GitBranch,
  Users,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { getPlayerTrajectory, getPlayerIds } from '../lib/playerTrajectoryService';

interface PlayerTrajectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function scoreBadge(score: number): { label: string; cls: string } {
  if (score >= 90) return { label: 'ELITE', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
  if (score >= 80) return { label: 'STRONG', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/40' };
  if (score >= 65) return { label: 'MODERATE', cls: 'bg-amber-500/20 text-amber-400 border-amber-500/40' };
  return { label: 'CAUTIOUS', cls: 'bg-red-500/20 text-red-400 border-red-500/40' };
}

function arcBadge(arc: string): { label: string; cls: string } {
  switch (arc) {
    case 'rising':    return { label: 'RISING',    cls: 'bg-emerald-500/20 text-emerald-400' };
    case 'peak':      return { label: 'PEAK',      cls: 'bg-brand-lime/20 text-brand-lime' };
    case 'breakout':  return { label: 'BREAKOUT',  cls: 'bg-blue-500/20 text-blue-400' };
    case 'steady':    return { label: 'STEADY',    cls: 'bg-amber-500/20 text-amber-400' };
    case 'declining': return { label: 'DECLINING', cls: 'bg-red-500/20 text-red-400' };
    default:          return { label: arc.toUpperCase(), cls: 'bg-slate-500/20 text-slate-400' };
  }
}

const PlayerTrajectoryModal: React.FC<PlayerTrajectoryModalProps> = ({ isOpen, onClose }) => {
  const playerList = useMemo(() => getPlayerIds(), []);
  const [selectedId, setSelectedId] = useState(playerList[0]?.id ?? '');

  const player = useMemo(() => getPlayerTrajectory(selectedId), [selectedId]);

  if (!isOpen) return null;

  const chartData = player?.projections.map((p) => ({
    year: p.year.toString(),
    Optimistic: p.optimistic,
    Baseline: p.baseline,
    Pessimistic: p.pessimistic,
  })) ?? [];

  const badge = player ? scoreBadge(player.trajectoryScore) : scoreBadge(0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-5xl bg-brand-charcoal border border-slate-800 rounded-[2rem] shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-lime/10 rounded-xl text-brand-lime">
              <GitBranch size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-bebas tracking-widest text-white">
                Player <span className="text-brand-lime">Trajectory</span> Engine
              </h2>
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
                ML-powered career projection &amp; comparable analysis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Player Selector */}
          <div className="flex flex-wrap items-center gap-3">
            {playerList.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                  selectedId === p.id
                    ? 'bg-brand-lime text-brand-charcoal border-brand-lime shadow-lg shadow-brand-lime/20'
                    : 'bg-slate-900 text-brand-muted border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {player && (
            <>
              {/* Score + Summary Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">Trajectory Score</p>
                  <p className="text-4xl font-bebas text-white leading-none">{player.trajectoryScore}</p>
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${badge.cls}`}>
                    {badge.label}
                  </span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">Current Value</p>
                  <p className="text-4xl font-bebas text-white leading-none">${player.currentCardValue}</p>
                  <p className="text-[10px] text-brand-muted font-bold mt-1">{player.sport} &middot; {player.position}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">Peak Projection</p>
                  <p className="text-4xl font-bebas text-emerald-400 leading-none">${player.peakProjectedValue}</p>
                  <p className="text-[10px] text-brand-muted font-bold mt-1">Age {player.peakProjectedAge}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">Upside</p>
                  <p className="text-4xl font-bebas text-brand-lime leading-none">
                    +{Math.round(((player.peakProjectedValue - player.currentCardValue) / player.currentCardValue) * 100)}%
                  </p>
                  <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${
                    player.riskLevel === 'low' ? 'text-emerald-400' : player.riskLevel === 'moderate' ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {player.riskLevel} risk
                  </p>
                </div>
              </div>

              {/* Full Trajectory Chart */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bebas tracking-widest text-white mb-4">
                  10-Year <span className="text-brand-lime">Projection</span> with Confidence Bands
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="gradOptimistic" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradBaseline" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradPessimistic" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${v}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: number) => [`$${value}`, undefined]}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Area type="monotone" dataKey="Optimistic" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#gradOptimistic)" />
                      <Area type="monotone" dataKey="Baseline" stroke="#84cc16" strokeWidth={3} fillOpacity={1} fill="url(#gradBaseline)" />
                      <Area type="monotone" dataKey="Pessimistic" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#gradPessimistic)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Comparable Players */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users size={16} className="text-brand-lime" />
                  <h3 className="text-lg font-bebas tracking-widest text-white">
                    Comparable <span className="text-brand-lime">Players</span>
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {player.comparables.map((comp) => {
                    const ab = arcBadge(comp.careerArc);
                    return (
                      <div key={comp.name} className="flex items-center justify-between bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                        <div>
                          <p className="text-sm font-bold text-white">{comp.name}</p>
                          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
                            Peak age {comp.peakAge}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${ab.cls}`}>
                            {ab.label}
                          </span>
                          <div className="text-right">
                            <p className="text-lg font-bebas text-white leading-none">{comp.similarity}%</p>
                            <p className="text-[9px] font-black text-brand-muted uppercase">Match</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Trajectory Factors */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 size={16} className="text-brand-lime" />
                  <h3 className="text-lg font-bebas tracking-widest text-white">
                    Key <span className="text-brand-lime">Trajectory</span> Factors
                  </h3>
                </div>
                <div className="space-y-3">
                  {player.factors.map((f) => (
                    <div key={f.label} className="flex items-center gap-4">
                      <div className="w-32 flex-shrink-0">
                        <p className="text-xs font-bold text-white">{f.label}</p>
                      </div>
                      <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${f.impact >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.abs(f.impact)}%` }}
                        />
                      </div>
                      <div className="w-14 text-right flex items-center justify-end gap-1">
                        {f.impact >= 0 ? (
                          <ArrowUpRight size={12} className="text-emerald-400" />
                        ) : (
                          <ArrowDownRight size={12} className="text-red-400" />
                        )}
                        <span className={`text-xs font-bold ${f.impact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {f.impact > 0 ? '+' : ''}{f.impact}
                        </span>
                      </div>
                      <p className="hidden lg:block flex-1 text-[10px] text-brand-muted font-medium truncate">
                        {f.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerTrajectoryModal;
