import React, { useMemo } from 'react';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Crown,
  ChevronRight,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  getPercentileRanking,
  getMonthlyChallenge,
  evaluateChallengeProgress,
  CATEGORY_LABELS,
  PercentileRanking,
} from '../lib/analytics/benchmarkService';

interface BenchmarkWidgetProps {
  inventory: CardInventory[];
  onClick?: () => void;
}

const trendIcons = {
  up: <TrendingUp size={14} />,
  down: <TrendingDown size={14} />,
  stable: <Minus size={14} />,
};

const trendColors = {
  up: 'text-green-400',
  down: 'text-red-400',
  stable: 'text-slate-400',
};

function getPercentileBadge(percentile: number): { label: string; color: string; bg: string; border: string } {
  if (percentile >= 95) return { label: 'Top 5%', color: 'text-amber-300', bg: 'bg-amber-500/15', border: 'border-amber-500/30' };
  if (percentile >= 90) return { label: 'Top 10%', color: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/30' };
  if (percentile >= 75) return { label: `Top ${100 - percentile}%`, color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/30' };
  if (percentile >= 50) return { label: `Top ${100 - percentile}%`, color: 'text-green-400', bg: 'bg-green-500/15', border: 'border-green-500/30' };
  return { label: `Top ${100 - percentile}%`, color: 'text-slate-400', bg: 'bg-slate-500/15', border: 'border-slate-500/30' };
}

export const BenchmarkWidget: React.FC<BenchmarkWidgetProps> = ({ inventory, onClick }) => {
  const rankings = useMemo(() => getPercentileRanking(inventory), [inventory]);

  const challenges = useMemo(() => getMonthlyChallenge(), []);
  const progress = useMemo(
    () => evaluateChallengeProgress(challenges, inventory),
    [challenges, inventory]
  );

  const overallPercentile = useMemo(() => {
    if (rankings.length === 0) return 0;
    return Math.round(rankings.reduce((s, r) => s + r.percentile, 0) / rankings.length);
  }, [rankings]);

  const bestCategory = useMemo(() => {
    if (rankings.length === 0) return null;
    return rankings.reduce<PercentileRanking | null>(
      (best, r) => (!best || r.percentile > best.percentile ? r : best),
      null
    );
  }, [rankings]);

  const activeChallenges = progress.filter(p => !p.completed).length;
  const completedChallenges = progress.filter(p => p.completed).length;
  const badge = getPercentileBadge(overallPercentile);

  // Dominant trend
  const trendCounts = { up: 0, down: 0, stable: 0 };
  rankings.forEach(r => trendCounts[r.trend]++);
  const dominantTrend: 'up' | 'down' | 'stable' =
    trendCounts.up >= trendCounts.down && trendCounts.up >= trendCounts.stable
      ? 'up'
      : trendCounts.down > trendCounts.up && trendCounts.down >= trendCounts.stable
        ? 'down'
        : 'stable';

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400">
            <Trophy size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Community <span className="text-amber-400">Rankings</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Benchmarking & leaderboards
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* Percentile Badge + Trend */}
      <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${badge.color} ${badge.bg} border ${badge.border}`}>
          <Crown size={14} />
          {badge.label}
        </div>
        <div className="h-5 w-px bg-slate-700" />
        <div className={`flex items-center gap-1.5 text-xs font-bold ${trendColors[dominantTrend]}`}>
          {trendIcons[dominantTrend]}
          {dominantTrend === 'up' ? 'Rising' : dominantTrend === 'down' ? 'Falling' : 'Steady'}
        </div>
        <div className="ml-auto text-xs text-slate-400">
          Rank <span className="font-mono text-white">#{rankings.length > 0 ? rankings[0].rank : '—'}</span>
          <span className="text-slate-600"> / {rankings.length > 0 ? rankings[0].totalParticipants : '—'}</span>
        </div>
      </div>

      {/* Best Category */}
      {bestCategory && (
        <div className="flex items-center gap-3 px-4 py-3 bg-brand-lime/5 border border-brand-lime/15 rounded-xl">
          <Target size={14} className="text-brand-lime flex-shrink-0" />
          <span className="text-xs text-slate-400">Strongest:</span>
          <span className="text-xs text-brand-lime font-bold">
            {CATEGORY_LABELS[bestCategory.category]}
          </span>
          <span className="ml-auto text-xs font-mono text-white">
            Top {100 - bestCategory.percentile}%
          </span>
        </div>
      )}

      {/* Challenges Summary */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Challenges:</span>
          {activeChallenges > 0 && (
            <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold rounded-md">
              {activeChallenges} active
            </span>
          )}
          {completedChallenges > 0 && (
            <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 text-green-400 font-bold rounded-md">
              {completedChallenges} done
            </span>
          )}
        </div>
        {progress.length > 0 && (
          <div className="flex-1">
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-500"
                style={{
                  width: `${Math.round(
                    progress.reduce((s, p) => s + p.percentComplete, 0) / progress.length
                  )}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </button>
  );
};

export default BenchmarkWidget;
