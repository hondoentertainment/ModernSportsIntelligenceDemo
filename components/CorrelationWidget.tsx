import React, { useMemo } from 'react';
import {
  GitBranch,
  TrendingUp,
  TrendingDown,
  Shield,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  getDiversificationReport,
  REGIME_LABELS,
  DiversificationReport,
} from '../lib/analytics/crossAssetCorrelationService';

interface CorrelationWidgetProps {
  inventory: CardInventory[];
  onClick?: () => void;
}

const regimeColors: Record<string, { text: string; bg: string; border: string }> = {
  risk_on:     { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  risk_off:    { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  hobby_boom:  { text: 'text-blue-400',  bg: 'bg-blue-500/10',  border: 'border-blue-500/30' },
  hobby_bust:  { text: 'text-red-400',   bg: 'bg-red-500/10',   border: 'border-red-500/30' },
};

function getBetaBadge(beta: number): { label: string; color: string } {
  const abs = Math.abs(beta);
  if (abs < 0.15) return { label: 'Uncorrelated', color: 'text-green-400' };
  if (abs < 0.4) return { label: 'Low Beta', color: 'text-blue-400' };
  if (abs < 0.7) return { label: 'Moderate Beta', color: 'text-amber-400' };
  return { label: 'High Beta', color: 'text-red-400' };
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-green-400';
  if (score >= 45) return 'text-blue-400';
  if (score >= 25) return 'text-amber-400';
  return 'text-red-400';
}

export const CorrelationWidget: React.FC<CorrelationWidgetProps> = ({ inventory, onClick }) => {
  const report: DiversificationReport = useMemo(
    () => getDiversificationReport(inventory),
    [inventory]
  );

  const betaBadge = getBetaBadge(report.portfolioBeta);
  const regime = regimeColors[report.currentRegime] || regimeColors.risk_on;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
            <GitBranch size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Cross-Asset <span className="text-indigo-400">Correlation</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Market regime & beta analysis
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* Beta + Diversification Score */}
      <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <div className="flex-1">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            Portfolio Beta (S&P 500)
          </p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-mono font-black text-white">
              {report.portfolioBeta.toFixed(2)}
            </span>
            <span className={`text-xs font-bold ${betaBadge.color}`}>
              {betaBadge.label}
            </span>
          </div>
        </div>
        <div className="h-10 w-px bg-slate-700" />
        <div className="text-right">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            Diversification
          </p>
          <span className={`text-2xl font-mono font-black ${getScoreColor(report.score)}`}>
            {report.score}
          </span>
          <span className="text-xs text-slate-500">/100</span>
        </div>
      </div>

      {/* Regime Indicator */}
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/30 border border-slate-700/50 rounded-xl">
        <Activity size={14} className={regime.text} />
        <span className="text-xs text-slate-400">Current Regime:</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${regime.text} ${regime.bg} border ${regime.border}`}>
          {REGIME_LABELS[report.currentRegime]}
        </span>
      </div>

      {/* Correlated / Uncorrelated Assets */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-slate-800/30 rounded-xl">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={12} className="text-red-400" />
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
              Most Correlated
            </span>
          </div>
          <p className="text-sm font-bold text-white">{report.topCorrelated.label}</p>
          <p className="text-xs text-slate-400 font-mono">
            r = {report.topCorrelated.correlation90d.toFixed(2)}
          </p>
        </div>
        <div className="p-3 bg-slate-800/30 rounded-xl">
          <div className="flex items-center gap-1.5 mb-1">
            <Shield size={12} className="text-green-400" />
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
              Best Hedge
            </span>
          </div>
          <p className="text-sm font-bold text-white">{report.leastCorrelated.label}</p>
          <p className="text-xs text-slate-400 font-mono">
            r = {report.leastCorrelated.correlation90d.toFixed(2)}
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center gap-2 text-xs text-slate-500 group-hover:text-indigo-400 transition-colors">
        <TrendingDown size={12} />
        <span>View full correlation matrix, regime analysis & hedge calculator</span>
      </div>
    </button>
  );
};

export default CorrelationWidget;
