import React, { useState, useMemo } from 'react';
import {
  GitBranch,
  TrendingUp,
  Users,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Target,
  Shield,
  Zap,
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
import { getPlayerTrajectory, getAllPlayerTrajectories, getPlayerIds } from '../lib/playerTrajectoryService';

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

function riskIcon(risk: string) {
  switch (risk) {
    case 'low': return <Shield size={14} className="text-emerald-400" />;
    case 'moderate': return <Zap size={14} className="text-amber-400" />;
    case 'high': return <Target size={14} className="text-red-400" />;
    default: return null;
  }
}

const PlayerTrajectory: React.FC = () => {
  const playerList = useMemo(() => getPlayerIds(), []);
  const allPlayers = useMemo(() => getAllPlayerTrajectories(), []);
  const [selectedId, setSelectedId] = useState(playerList[0]?.id ?? '');

  const player = useMemo(() => getPlayerTrajectory(selectedId), [selectedId]);

  const chartData = useMemo(
    () =>
      player?.projections.map((p) => ({
        year: p.year.toString(),
        Optimistic: p.optimistic,
        Baseline: p.baseline,
        Pessimistic: p.pessimistic,
      })) ?? [],
    [player],
  );

  const badge = player ? scoreBadge(player.trajectoryScore) : scoreBadge(0);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-lime/10 border border-brand-lime/20 rounded-full mb-2">
            <GitBranch size={12} className="text-brand-lime" />
            <span className="text-[10px] font-black text-brand-lime uppercase tracking-widest">
              ML Career Projection
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bebas tracking-tight text-white leading-none">
            Player <span className="text-brand-lime">Trajectory</span>
          </h1>
          <p className="text-slate-400 max-w-2xl font-medium">
            Predicted card value paths based on performance trajectory, age curves, and comparable player analysis
          </p>
        </div>
      </div>

      {/* ── Player Selector ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 p-2 bg-brand-slate border border-slate-800 rounded-2xl w-fit">
        {playerList.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedId(p.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              selectedId === p.id
                ? 'bg-brand-lime text-brand-charcoal shadow-lg shadow-brand-lime/20'
                : 'text-brand-muted hover:text-white'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {player && (
        <>
          {/* ── Score Summary Cards ─────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-brand-slate border border-slate-800 rounded-[2rem] p-6 text-center space-y-2">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Trajectory Score</p>
              <p className="text-5xl font-bebas text-white leading-none">{player.trajectoryScore}</p>
              <span className={`inline-block px-3 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${badge.cls}`}>
                {badge.label}
              </span>
            </div>
            <div className="bg-brand-slate border border-slate-800 rounded-[2rem] p-6 text-center space-y-2">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Current Card Value</p>
              <p className="text-5xl font-bebas text-white leading-none">${player.currentCardValue}</p>
              <p className="text-[10px] font-bold text-brand-muted">
                {player.sport} &middot; {player.position} &middot; Age {player.age}
              </p>
            </div>
            <div className="bg-brand-slate border border-slate-800 rounded-[2rem] p-6 text-center space-y-2">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Peak Projection</p>
              <p className="text-5xl font-bebas text-emerald-400 leading-none">${player.peakProjectedValue}</p>
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-brand-muted">
                <Calendar size={10} />
                Age {player.peakProjectedAge}
              </div>
            </div>
            <div className="bg-brand-slate border border-slate-800 rounded-[2rem] p-6 text-center space-y-2">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Max Upside</p>
              <p className="text-5xl font-bebas text-brand-lime leading-none">
                +{Math.round(((player.peakProjectedValue - player.currentCardValue) / player.currentCardValue) * 100)}%
              </p>
              <div className="flex items-center justify-center gap-1.5">
                {riskIcon(player.riskLevel)}
                <span className={`text-[10px] font-black uppercase tracking-widest ${
                  player.riskLevel === 'low' ? 'text-emerald-400' : player.riskLevel === 'moderate' ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {player.riskLevel} risk
                </span>
              </div>
            </div>
          </div>

          {/* ── Multi-line Area Chart ───────────────────────────────── */}
          <section className="bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp size={20} className="text-brand-lime" />
              <h2 className="text-2xl font-bebas tracking-widest text-white">
                10-Year <span className="text-brand-lime">Value Projection</span>
              </h2>
            </div>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="pageGradOptimistic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="pageGradBaseline" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="pageGradPessimistic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 12 }} tickFormatter={(v: number) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => [`$${value}`, undefined]}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" dataKey="Optimistic" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#pageGradOptimistic)" />
                  <Area type="monotone" dataKey="Baseline" stroke="#84cc16" strokeWidth={3} fillOpacity={1} fill="url(#pageGradBaseline)" />
                  <Area type="monotone" dataKey="Pessimistic" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#pageGradPessimistic)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* ── Comparable Players ───────────────────────────────────── */}
          <section className="bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <Users size={20} className="text-brand-lime" />
              <h2 className="text-2xl font-bebas tracking-widest text-white">
                Comparable <span className="text-brand-lime">Players</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {player.comparables.map((comp) => {
                const ab = arcBadge(comp.careerArc);
                return (
                  <div
                    key={comp.name}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-base font-bold text-white">{comp.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${ab.cls}`}>
                        {ab.label}
                      </span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Similarity</p>
                        <p className="text-3xl font-bebas text-white leading-none">{comp.similarity}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Peak Age</p>
                        <p className="text-xl font-bebas text-brand-lime leading-none">{comp.peakAge}</p>
                      </div>
                    </div>
                    {/* Similarity bar */}
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-lime rounded-full transition-all"
                        style={{ width: `${comp.similarity}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Key Trajectory Factors ──────────────────────────────── */}
          <section className="bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 size={20} className="text-brand-lime" />
              <h2 className="text-2xl font-bebas tracking-widest text-white">
                Key Trajectory <span className="text-brand-lime">Factors</span>
              </h2>
            </div>
            <div className="space-y-4">
              {player.factors.map((f) => (
                <div key={f.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-32 flex-shrink-0">
                      <p className="text-sm font-bold text-white">{f.label}</p>
                    </div>
                    <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${f.impact >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.abs(f.impact)}%` }}
                      />
                    </div>
                    <div className="w-16 flex items-center justify-end gap-1">
                      {f.impact >= 0 ? (
                        <ArrowUpRight size={14} className="text-emerald-400" />
                      ) : (
                        <ArrowDownRight size={14} className="text-red-400" />
                      )}
                      <span className={`text-sm font-bold ${f.impact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {f.impact > 0 ? '+' : ''}{f.impact}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-brand-muted font-medium pl-36">{f.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Card Value Projection Timeline ─────────────────────── */}
          <section className="bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <Calendar size={20} className="text-brand-lime" />
              <h2 className="text-2xl font-bebas tracking-widest text-white">
                Card Value <span className="text-brand-lime">Timeline</span>
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left text-[10px] font-black text-brand-muted uppercase tracking-widest py-3 px-4">Year</th>
                    <th className="text-right text-[10px] font-black text-emerald-400 uppercase tracking-widest py-3 px-4">Optimistic</th>
                    <th className="text-right text-[10px] font-black text-brand-lime uppercase tracking-widest py-3 px-4">Baseline</th>
                    <th className="text-right text-[10px] font-black text-red-400 uppercase tracking-widest py-3 px-4">Pessimistic</th>
                    <th className="text-right text-[10px] font-black text-brand-muted uppercase tracking-widest py-3 px-4">YoY Change</th>
                  </tr>
                </thead>
                <tbody>
                  {player.projections.map((p, i) => {
                    const prevBaseline = i > 0 ? player.projections[i - 1].baseline : p.baseline;
                    const yoyChange = i > 0 ? Math.round(((p.baseline - prevBaseline) / prevBaseline) * 100) : 0;
                    return (
                      <tr key={p.year} className="border-b border-slate-800/50 hover:bg-slate-900/50 transition-colors">
                        <td className="py-3 px-4 text-sm font-bold text-white">{p.year}</td>
                        <td className="py-3 px-4 text-sm font-mono text-emerald-400 text-right">${p.optimistic.toLocaleString()}</td>
                        <td className="py-3 px-4 text-sm font-mono text-brand-lime text-right font-bold">${p.baseline.toLocaleString()}</td>
                        <td className="py-3 px-4 text-sm font-mono text-red-400 text-right">${p.pessimistic.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">
                          {i === 0 ? (
                            <span className="text-xs text-brand-muted">--</span>
                          ) : (
                            <span className={`inline-flex items-center gap-1 text-xs font-bold ${yoyChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {yoyChange >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                              {yoyChange > 0 ? '+' : ''}{yoyChange}%
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── All Players Comparison ──────────────────────────────── */}
          <section className="bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <Target size={20} className="text-brand-lime" />
              <h2 className="text-2xl font-bebas tracking-widest text-white">
                All Tracked <span className="text-brand-lime">Players</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allPlayers.map((p) => {
                const sb = scoreBadge(p.trajectoryScore);
                const isSelected = p.playerId === selectedId;
                return (
                  <button
                    key={p.playerId}
                    onClick={() => setSelectedId(p.playerId)}
                    className={`text-left bg-slate-900 border rounded-2xl p-5 transition-all hover:border-slate-700 ${
                      isSelected ? 'border-brand-lime/50 ring-1 ring-brand-lime/20' : 'border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-base font-bold text-white">{p.playerName}</p>
                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
                          {p.sport} &middot; {p.position} &middot; Age {p.age}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${sb.cls}`}>
                        {sb.label}
                      </span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Score</p>
                        <p className="text-3xl font-bebas text-white leading-none">{p.trajectoryScore}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Value</p>
                        <p className="text-lg font-bebas text-brand-lime leading-none">${p.currentCardValue}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Peak</p>
                        <p className="text-lg font-bebas text-emerald-400 leading-none">${p.peakProjectedValue}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default PlayerTrajectory;
