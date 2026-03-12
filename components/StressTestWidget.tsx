import React, { useMemo } from 'react';
import {
  FlaskConical,
  ChevronRight,
  ShieldAlert,
  TrendingDown,
  AlertTriangle,
  Activity,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  getQuickRiskSummary,
  getRiskScoreLabel,
} from '../lib/stressTestService';

interface StressTestWidgetProps {
  inventory: CardInventory[];
  onClick?: () => void;
}

function formatCurrency(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

function getRiskColor(score: number): string {
  if (score >= 80) return 'text-red-400';
  if (score >= 60) return 'text-amber-400';
  if (score >= 40) return 'text-yellow-400';
  if (score >= 20) return 'text-green-400';
  return 'text-emerald-400';
}

function getRiskBg(score: number): string {
  if (score >= 80) return 'bg-red-500';
  if (score >= 60) return 'bg-amber-500';
  if (score >= 40) return 'bg-yellow-500';
  if (score >= 20) return 'bg-green-500';
  return 'bg-emerald-500';
}

export const StressTestWidget: React.FC<StressTestWidgetProps> = ({ inventory, onClick }) => {
  const summary = useMemo(() => {
    if (inventory.length === 0) return null;
    return getQuickRiskSummary(inventory);
  }, [inventory]);

  const riskLabel = summary ? getRiskScoreLabel(summary.riskScore) : null;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400">
            <FlaskConical size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Stress <span className="text-purple-400">Testing</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Monte Carlo portfolio simulation
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* Risk Score */}
      {summary && (
        <div className="flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
          {/* Circular score */}
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
              <circle cx="32" cy="32" r="28" fill="none" stroke="#1e293b" strokeWidth="5" />
              <circle
                cx="32" cy="32" r="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                strokeDasharray={`${(summary.riskScore / 100) * 175.9} 175.9`}
                strokeLinecap="round"
                className={getRiskColor(summary.riskScore)}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-lg font-bebas tracking-wider ${getRiskColor(summary.riskScore)}`}>
                {summary.riskScore}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-slate-400 font-medium">Portfolio Risk</span>
              <span className={`text-xs font-bold ${riskLabel?.color ?? 'text-slate-400'}`}>
                {riskLabel?.label ?? '—'}
              </span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${getRiskBg(summary.riskScore)}`}
                style={{ width: `${summary.riskScore}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      {summary && (
        <div className="grid grid-cols-3 gap-3">
          {/* Worst-case VaR */}
          <div className="p-3 bg-slate-800/50 rounded-2xl text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingDown size={12} className="text-red-400" />
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">VaR 95%</span>
            </div>
            <p className="text-lg font-bebas tracking-wider text-red-400">
              -{summary.worstCaseVaR.varPercent.toFixed(1)}%
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              {formatCurrency(summary.worstCaseVaR.varAbsolute)}
            </p>
          </div>

          {/* Concentration */}
          <div className="p-3 bg-slate-800/50 rounded-2xl text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertTriangle size={12} className="text-amber-400" />
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Top Risk</span>
            </div>
            {summary.topConcentration ? (
              <>
                <p className="text-sm font-bold text-white truncate px-1">
                  {summary.topConcentration.name}
                </p>
                <p className="text-[10px] text-amber-400 font-mono">
                  {summary.topConcentration.exposure.toFixed(1)}% exposed
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-green-400">None</p>
                <p className="text-[10px] text-slate-500">Well diversified</p>
              </>
            )}
          </div>

          {/* Diversification */}
          <div className="p-3 bg-slate-800/50 rounded-2xl text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity size={12} className="text-blue-400" />
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Div. Benefit</span>
            </div>
            <p className="text-lg font-bebas tracking-wider text-blue-400">
              {summary.diversification.diversificationBenefit.toFixed(1)}%
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              {summary.diversification.sportCount} sport{summary.diversification.sportCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!summary && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="p-4 bg-slate-800/50 rounded-2xl mb-3">
            <ShieldAlert size={28} className="text-slate-600" />
          </div>
          <p className="text-sm text-slate-400">Add cards to run stress tests</p>
          <p className="text-xs text-slate-600 mt-1">Monte Carlo simulations require portfolio data</p>
        </div>
      )}

      {/* CTA */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
          {summary ? `${summary.diversification.playerCount} positions analyzed` : 'Run 1,000+ simulations'}
        </span>
        <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 group-hover:text-brand-lime transition-colors">
          Open Simulator
        </span>
      </div>
    </button>
  );
};

export default StressTestWidget;
