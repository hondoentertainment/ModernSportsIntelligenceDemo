// @ts-nocheck
import React, { useMemo } from 'react';
import {
  Lightbulb,
  ShieldCheck,
  Target,
  TrendingUp,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  getStrategy,
  assessRisk,
  generateWeeklyDigest,
  StrategyProfile,
} from '../lib/analytics/advisorService';

interface AdvisorWidgetProps {
  inventory: CardInventory[];
  onClick?: () => void;
}

const strategyLabels: Record<StrategyProfile, { name: string; color: string; bg: string }> = {
  conservative: { name: 'Conservative', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  aggressive: { name: 'Aggressive', color: 'text-red-400', bg: 'bg-red-500/10' },
  long_term: { name: 'Long-Term', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  completion: { name: 'Completion', color: 'text-purple-400', bg: 'bg-purple-500/10' },
};

function riskColor(score: number): string {
  if (score < 30) return 'bg-green-500';
  if (score < 60) return 'bg-amber-500';
  return 'bg-red-500';
}

function riskTextColor(score: number): string {
  if (score < 30) return 'text-green-400';
  if (score < 60) return 'text-amber-400';
  return 'text-red-400';
}

export const AdvisorWidget: React.FC<AdvisorWidgetProps> = ({ inventory, onClick }) => {
  const strategy = useMemo(() => getStrategy(), []);
  const digest = useMemo(() => generateWeeklyDigest(inventory, strategy), [inventory, strategy]);
  const risk = useMemo(() => assessRisk(inventory), [inventory]);

  const strategyInfo = strategyLabels[strategy];
  const topRec = digest.topBuys[0] ?? null;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-600 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400">
            <Lightbulb size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Smart <span className="text-amber-400">Advisor</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Collection intelligence engine
            </p>
          </div>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${strategyInfo.color} ${strategyInfo.bg}`}>
          {strategyInfo.name}
        </span>
      </div>

      {/* Top Recommendation */}
      {topRec && (
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">Top Recommendation</p>
          <div className="flex items-center gap-3">
            <TrendingUp size={16} className="text-brand-lime flex-shrink-0" />
            <span className="text-sm text-white font-medium truncate flex-1 group-hover:text-brand-lime transition-colors">
              Buy {topRec.player} — {topRec.sport} {topRec.year} {topRec.set}
            </span>
            <span className="font-mono text-xs text-brand-lime">
              {topRec.fitScore}% fit
            </span>
          </div>
        </div>
      )}

      {/* Risk Gauge */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-slate-400" />
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Risk Score</span>
          </div>
          <span className={`font-mono text-sm font-bold ${riskTextColor(risk.compositeScore)}`}>
            {risk.compositeScore}/100
          </span>
        </div>
        <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${riskColor(risk.compositeScore)}`}
            style={{ width: `${risk.compositeScore}%` }}
          />
        </div>
      </div>

      {/* Strategy Alignment */}
      <div className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-700/50 rounded-2xl">
        <div className="flex items-center gap-2">
          <Target size={14} className="text-slate-400" />
          <span className="text-xs text-slate-400 font-medium">Strategy Alignment</span>
        </div>
        <span className="font-bebas text-xl tracking-wider text-white">
          {digest.strategyAlignment}%
        </span>
      </div>
    </button>
  );
};

export default AdvisorWidget;
