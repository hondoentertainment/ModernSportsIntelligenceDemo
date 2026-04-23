// @ts-nocheck
import React, { useMemo } from 'react';
import {
  Scale,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import {
  getPortfolioHealthScore,
  getOptimizationScore,
  getRebalanceRecommendations,
  RebalanceAction,
} from '../lib/analytics/portfolioRebalancerService';

interface RebalancerWidgetProps {
  onClick?: () => void;
}

const actionConfig: Record<RebalanceAction, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  buy: { label: 'BUY', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: <ArrowUpRight size={14} /> },
  sell: { label: 'SELL', color: 'text-red-400', bg: 'bg-red-500/10', icon: <ArrowDownRight size={14} /> },
  hold: { label: 'HOLD', color: 'text-slate-400', bg: 'bg-slate-500/10', icon: <ShieldCheck size={14} /> },
  upgrade: { label: 'UPGRADE', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: <RefreshCw size={14} /> },
};

function scoreColor(score: number): string {
  if (score >= 75) return 'text-emerald-400';
  if (score >= 50) return 'text-amber-400';
  return 'text-red-400';
}

function scoreTrackColor(score: number): string {
  if (score >= 75) return 'stroke-emerald-500';
  if (score >= 50) return 'stroke-amber-500';
  return 'stroke-red-500';
}

export const RebalancerWidget: React.FC<RebalancerWidgetProps> = ({ onClick }) => {
  const healthScore = useMemo(() => getPortfolioHealthScore(), []);
  const optimizationScore = useMemo(() => getOptimizationScore(), []);
  const recommendations = useMemo(() => getRebalanceRecommendations().slice(0, 3), []);

  const circumference = 2 * Math.PI * 36;
  const healthOffset = circumference - (healthScore / 100) * circumference;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-600 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-lime-500/10 rounded-xl text-lime-400">
            <Scale size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Portfolio <span className="text-lime-400">Rebalancer</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Robo-advisor for sports cards
            </p>
          </div>
        </div>
        <ChevronRight size={20} className="text-slate-500 group-hover:text-lime-400 transition-colors" />
      </div>

      {/* Health Score Gauge & Optimization */}
      <div className="flex items-center gap-6">
        {/* Circular gauge */}
        <div className="relative flex-shrink-0">
          <svg width={88} height={88} className="-rotate-90">
            <circle cx={44} cy={44} r={36} fill="none" stroke="#1e293b" strokeWidth={6} />
            <circle
              cx={44}
              cy={44}
              r={36}
              fill="none"
              className={scoreTrackColor(healthScore)}
              strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={healthOffset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bebas tracking-wider ${scoreColor(healthScore)}`}>
              {healthScore}
            </span>
            <span className="text-[8px] font-black text-brand-muted uppercase tracking-widest">Health</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Optimization</span>
            <span className={`text-sm font-mono font-bold ${scoreColor(optimizationScore)}`}>
              {optimizationScore}%
            </span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                optimizationScore >= 75 ? 'bg-emerald-500' : optimizationScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${optimizationScore}%` }}
            />
          </div>
          <p className="text-[10px] text-brand-muted">
            {optimizationScore >= 75
              ? 'Portfolio is well-balanced'
              : optimizationScore >= 50
              ? 'Some rebalancing recommended'
              : 'Significant rebalancing needed'}
          </p>
        </div>
      </div>

      {/* Top 3 Recommendations */}
      <div className="space-y-2">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
          Top Recommendations
        </p>
        {recommendations.map((rec) => {
          const config = actionConfig[rec.action];
          return (
            <div
              key={rec.id}
              className="flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl"
            >
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black ${config.color} ${config.bg}`}>
                {config.icon}
                {config.label}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white font-medium truncate">{rec.player}</p>
                <p className="text-[10px] text-brand-muted truncate">{rec.cardDescription}</p>
              </div>
              {rec.expectedImpact > 0 && (
                <span className="text-[10px] font-mono font-bold text-emerald-400 flex-shrink-0">
                  +{rec.expectedImpact}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </button>
  );
};

export default RebalancerWidget;
