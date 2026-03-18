import React, { useMemo } from 'react';
import { GitBranch, ChevronRight, TrendingUp } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import {
  getTopProjectedPlayer,
  getAllPlayerTrajectories,
} from '../lib/analytics/playerTrajectoryService';

interface PlayerTrajectoryWidgetProps {
  onClick?: () => void;
}

function scoreBadge(score: number): { label: string; cls: string } {
  if (score >= 90) return { label: 'ELITE', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
  if (score >= 80) return { label: 'STRONG', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/40' };
  if (score >= 65) return { label: 'MODERATE', cls: 'bg-amber-500/20 text-amber-400 border-amber-500/40' };
  return { label: 'CAUTIOUS', cls: 'bg-red-500/20 text-red-400 border-red-500/40' };
}

function riskColor(risk: string): string {
  switch (risk) {
    case 'low': return 'text-emerald-400';
    case 'moderate': return 'text-amber-400';
    case 'high': return 'text-red-400';
    default: return 'text-slate-400';
  }
}

export const PlayerTrajectoryWidget: React.FC<PlayerTrajectoryWidgetProps> = ({ onClick }) => {
  const topPlayer = useMemo(() => getTopProjectedPlayer(), []);
  const allPlayers = useMemo(() => getAllPlayerTrajectories(), []);

  const sparklineData = useMemo(
    () => topPlayer.projections.map((p) => ({ year: p.year, value: p.baseline })),
    [topPlayer],
  );

  const badge = scoreBadge(topPlayer.trajectoryScore);
  const avgScore = Math.round(allPlayers.reduce((s, p) => s + p.trajectoryScore, 0) / allPlayers.length);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-lime/10 rounded-xl text-brand-lime">
            <GitBranch size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Player <span className="text-brand-lime">Trajectory</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              ML career projection engine
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all"
        />
      </div>

      {/* Trajectory Score Badge */}
      <div className="flex items-center gap-3">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${badge.cls}`}>
          <TrendingUp size={12} />
          {badge.label}
        </span>
        <span className="text-xs text-brand-muted font-bold">
          Avg Score: <span className="text-white">{avgScore}</span>/100
        </span>
      </div>

      {/* Top Projected Player */}
      <div className="bg-slate-900/60 border border-slate-800/50 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-brand-lime uppercase tracking-widest mb-1">
              Top Projected Player
            </p>
            <p className="text-xl font-bold text-white">{topPlayer.playerName}</p>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
              {topPlayer.sport} &middot; {topPlayer.position} &middot; Age {topPlayer.age}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bebas text-brand-lime leading-none">{topPlayer.trajectoryScore}</p>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Score</p>
          </div>
        </div>

        {/* Mini Sparkline */}
        <div className="h-16 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <YAxis hide domain={['dataMin', 'dataMax']} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#84cc16"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-brand-muted font-bold">
            ${topPlayer.currentCardValue} <span className="text-slate-600">&rarr;</span>{' '}
            <span className="text-emerald-400">${topPlayer.peakProjectedValue}</span> peak
          </span>
          <span className={`font-black uppercase tracking-widest text-[10px] ${riskColor(topPlayer.riskLevel)}`}>
            {topPlayer.riskLevel} risk
          </span>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        {allPlayers.slice(0, 3).map((p) => (
          <div key={p.playerId} className="text-center">
            <p className="text-[9px] font-black text-brand-muted uppercase tracking-tighter truncate">{p.playerName}</p>
            <p className="text-lg font-bebas text-white">{p.trajectoryScore}</p>
          </div>
        ))}
      </div>
    </button>
  );
};

export default PlayerTrajectoryWidget;
