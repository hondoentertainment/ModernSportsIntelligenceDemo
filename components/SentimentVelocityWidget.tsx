import React, { useMemo } from 'react';
import {
  Zap, ChevronRight, TrendingUp, TrendingDown, Minus, Clock, Target,
} from 'lucide-react';
import {
  getVelocityDashboard,
  getInflectionPoints,
  type SentimentVelocity,
} from '../lib/sentimentVelocityService';

interface SentimentVelocityWidgetProps {
  onOpenModal?: () => void;
}

const velColor = (v: number) => {
  if (v >= 3) return 'text-emerald-400';
  if (v >= 1) return 'text-emerald-300';
  if (v > -1) return 'text-slate-300';
  if (v > -3) return 'text-red-300';
  return 'text-red-400';
};

const velIcon = (v: number, size = 10) => {
  if (v > 0.5) return <TrendingUp size={size} className="text-emerald-400" />;
  if (v < -0.5) return <TrendingDown size={size} className="text-red-400" />;
  return <Minus size={size} className="text-slate-400" />;
};

const formatCountdown = (hours: number) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
};

const SentimentVelocityWidget: React.FC<SentimentVelocityWidgetProps> = ({ onOpenModal }) => {
  const velocities = useMemo(() => getVelocityDashboard(), []);
  const inflections = useMemo(() => getInflectionPoints(), []);

  const topMovers = useMemo(
    () => [...velocities].sort((a, b) => Math.abs(b.velocity) - Math.abs(a.velocity)).slice(0, 3),
    [velocities],
  );

  const nextInflection = useMemo(
    () => [...inflections].sort((a, b) => a.countdown - b.countdown)[0],
    [inflections],
  );

  return (
    <div
      onClick={onOpenModal}
      className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5 hover:border-amber-500/30 transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10">
            <Zap size={16} className="text-amber-400" />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Sentiment Velocity
          </span>
        </div>
        <ChevronRight
          size={14}
          className="text-slate-600 group-hover:text-amber-400 transition-colors"
        />
      </div>

      {/* Top 3 Velocity Movers */}
      <div className="space-y-2 mb-4">
        {topMovers.map((v, i) => (
          <div
            key={v.playerId}
            className="flex items-center justify-between py-1.5 border-b border-slate-800/50 last:border-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[10px] font-bold text-slate-600 w-3">{i + 1}</span>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-200 truncate">{v.playerName}</div>
                <div className="text-[10px] text-slate-500">{v.sport}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-0.5 font-mono text-xs font-bold ${velColor(v.velocity)}`}>
                {velIcon(v.velocity)}
                {v.velocity > 0 ? '+' : ''}{v.velocity.toFixed(1)}/hr
              </div>
              {v.isAccelerating && <Zap size={10} className="text-amber-400" />}
            </div>
          </div>
        ))}
      </div>

      {/* Next Inflection */}
      {nextInflection && (
        <div className="bg-slate-800/40 rounded-lg p-2.5 border border-slate-700/30">
          <div className="flex items-center gap-1.5 mb-1">
            <Target size={10} className="text-amber-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Next Inflection</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-200">{nextInflection.playerName}</div>
              <div className="text-[10px] text-slate-500">
                {nextInflection.type} — {nextInflection.priorTrend} → {nextInflection.expectedNewTrend}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-xs font-black text-amber-400">
                <Clock size={10} />
                {formatCountdown(nextInflection.countdown)}
              </div>
              <div className={`text-[10px] font-mono ${nextInflection.expectedPriceImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {nextInflection.expectedPriceImpact >= 0 ? '+' : ''}{nextInflection.expectedPriceImpact}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SentimentVelocityWidget;
