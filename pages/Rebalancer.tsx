// @ts-nocheck
import React, { useMemo, useState } from 'react';
import {
  Scale,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Target,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import {
  getPortfolioAllocations,
  getRebalanceRecommendations,
  getOptimizationScore,
  getPortfolioHealthScore,
  getRiskMetrics,
  RebalanceAction,
  PortfolioAllocation,
} from '../lib/analytics/portfolioRebalancerService';

const COLORS = ['#84cc16', '#60A5FA', '#FCD34D', '#F87171', '#C084FC', '#34D399'];

const actionConfig: Record<RebalanceAction, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  buy: { label: 'BUY', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: <ArrowUpRight size={14} /> },
  sell: { label: 'SELL', color: 'text-red-400', bg: 'bg-red-500/10', icon: <ArrowDownRight size={14} /> },
  hold: { label: 'HOLD', color: 'text-slate-400', bg: 'bg-slate-500/10', icon: <ShieldCheck size={14} /> },
  upgrade: { label: 'UPGRADE', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: <RefreshCw size={14} /> },
};

const priorityBadge: Record<string, { color: string; bg: string; border: string }> = {
  high: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  low: { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
};

type AllocationType = 'sport' | 'grade' | 'era';

function riskScoreColor(score: number): string {
  if (score < 40) return 'text-emerald-400';
  if (score < 60) return 'text-amber-400';
  return 'text-red-400';
}

function riskBarColor(score: number): string {
  if (score < 40) return 'bg-emerald-500';
  if (score < 60) return 'bg-amber-500';
  return 'bg-red-500';
}

function buildPieData(allocations: PortfolioAllocation[], key: 'currentPct' | 'targetPct') {
  return allocations.map((a) => ({ name: a.category, value: a[key] }));
}

const Rebalancer: React.FC = () => {
  const [allocationType, setAllocationType] = useState<AllocationType>('sport');

  const allocations = useMemo(() => getPortfolioAllocations(allocationType), [allocationType]);
  const recommendations = useMemo(() => getRebalanceRecommendations(), []);
  const optimizationScore = useMemo(() => getOptimizationScore(), []);
  const healthScore = useMemo(() => getPortfolioHealthScore(), []);
  const riskMetrics = useMemo(() => getRiskMetrics(), []);

  const currentPieData = useMemo(() => buildPieData(allocations, 'currentPct'), [allocations]);
  const targetPieData = useMemo(() => buildPieData(allocations, 'targetPct'), [allocations]);

  const circumference = 2 * Math.PI * 52;
  const scoreOffset = circumference - (optimizationScore / 100) * circumference;

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-lime-500/10 border border-lime-500/20 rounded-full mb-2">
            <Scale size={12} className="text-lime-400" />
            <span className="text-[10px] font-black text-lime-400 uppercase tracking-widest">
              Portfolio Optimization Engine
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bebas tracking-tight text-white leading-none">
            Portfolio <span className="text-lime-400">Rebalancer</span>
          </h1>
          <p className="text-brand-muted max-w-2xl font-medium">
            Analyze allocation drift, optimize by sport, grade, and era. AI-powered recommendations to maximize risk-adjusted returns.
          </p>
        </div>

        {/* Optimization Score Gauge */}
        <div className="flex items-center gap-6 p-6 bg-brand-charcoal border border-slate-800 rounded-[2rem]">
          <div className="relative flex-shrink-0">
            <svg width={120} height={120} className="-rotate-90">
              <circle cx={60} cy={60} r={52} fill="none" stroke="#1e293b" strokeWidth={8} />
              <circle
                cx={60}
                cy={60}
                r={52}
                fill="none"
                stroke={optimizationScore >= 70 ? '#84cc16' : optimizationScore >= 50 ? '#f59e0b' : '#ef4444'}
                strokeWidth={8}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={scoreOffset}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bebas tracking-wider ${
                optimizationScore >= 70 ? 'text-lime-400' : optimizationScore >= 50 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {optimizationScore}
              </span>
              <span className="text-[8px] font-black text-brand-muted uppercase tracking-widest">Score</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-white">Optimization Score</p>
            <p className="text-xs text-brand-muted">Health: {healthScore}/100</p>
            <p className="text-[10px] text-brand-muted">
              {recommendations.filter((r) => r.priority === 'high').length} high-priority actions
            </p>
          </div>
        </div>
      </div>

      {/* Current vs Target Allocation */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bebas tracking-widest text-white flex items-center gap-3">
            <Target className="text-lime-400" size={24} />
            Allocation Comparison
          </h2>
          <div className="flex gap-1">
            {(['sport', 'grade', 'era'] as AllocationType[]).map((t) => (
              <button
                key={t}
                onClick={() => setAllocationType(t)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  allocationType === t
                    ? 'bg-lime-500/20 text-lime-400 border border-lime-500/30'
                    : 'bg-slate-800 text-brand-muted border border-transparent hover:text-white'
                }`}
              >
                By {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Allocation */}
          <div className="bg-brand-charcoal border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
            <h3 className="text-2xl font-bebas tracking-wider text-white">Current Allocation</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={currentPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {currentPieData.map((_entry, index) => (
                      <Cell key={`curr-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      border: '1px solid #1e293b',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [`${value}%`, 'Current']}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string) => <span className="text-xs text-slate-300">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Target Allocation */}
          <div className="bg-brand-charcoal border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
            <h3 className="text-2xl font-bebas tracking-wider text-white">
              Target Allocation <span className="text-lime-400">*</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={targetPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {targetPieData.map((_entry, index) => (
                      <Cell key={`tgt-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      border: '1px solid #1e293b',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [`${value}%`, 'Target']}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string) => <span className="text-xs text-slate-300">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Drift Table */}
        <div className="bg-brand-charcoal border border-slate-800 rounded-[2.5rem] p-8">
          <h3 className="text-xl font-bebas tracking-wider text-white mb-4">Allocation Drift</h3>
          <div className="space-y-2">
            {allocations.map((alloc, i) => (
              <div key={alloc.category} className="flex items-center gap-4 p-3 bg-brand-slate rounded-xl">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-sm text-white font-medium flex-1 min-w-0">{alloc.category}</span>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-brand-muted w-12 text-right">{alloc.currentPct}%</span>
                  <span className="text-brand-muted">→</span>
                  <span className="text-lime-400 w-12 text-right">{alloc.targetPct}%</span>
                  <span
                    className={`w-14 text-right font-bold ${
                      alloc.delta > 0 ? 'text-red-400' : alloc.delta < 0 ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {alloc.delta > 0 ? '+' : ''}{alloc.delta}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bebas tracking-widest text-white flex items-center gap-3">
          <CheckCircle2 className="text-lime-400" size={24} />
          Rebalance Recommendations
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {recommendations.map((rec) => {
            const config = actionConfig[rec.action];
            const pBadge = priorityBadge[rec.priority];

            return (
              <div
                key={rec.id}
                className={`bg-brand-charcoal border rounded-[2rem] p-6 space-y-4 hover:border-slate-600 transition-all ${pBadge.border}`}
              >
                {/* Top row: action + priority */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black ${config.color} ${config.bg}`}>
                    {config.icon}
                    {config.label}
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${pBadge.color} ${pBadge.bg}`}>
                    {rec.priority} priority
                  </span>
                </div>

                {/* Card info */}
                <div>
                  <p className="text-base text-white font-bold">{rec.player}</p>
                  <p className="text-xs text-brand-muted mt-0.5">{rec.cardDescription}</p>
                </div>

                {/* Reason */}
                <p className="text-sm text-slate-300 leading-relaxed">{rec.reason}</p>

                {/* Metrics */}
                <div className="flex items-center gap-4 pt-2 border-t border-slate-800">
                  <div className="text-center flex-1">
                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Current</p>
                    <p className="text-sm font-mono font-bold text-white">{rec.currentAllocation}%</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Target</p>
                    <p className="text-sm font-mono font-bold text-lime-400">{rec.targetAllocation}%</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Impact</p>
                    <p className={`text-sm font-mono font-bold ${rec.expectedImpact > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {rec.expectedImpact > 0 ? '+' : ''}{rec.expectedImpact}%
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Risk Analysis */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bebas tracking-widest text-white flex items-center gap-3">
          <AlertTriangle className="text-amber-400" size={24} />
          Risk Analysis
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {riskMetrics.map((metric) => (
            <div
              key={metric.category}
              className="bg-brand-charcoal border border-slate-800 rounded-[2rem] p-6 space-y-4 hover:border-slate-600 transition-all"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">{metric.category}</h4>
                <span className={`text-xl font-bebas tracking-wider ${riskScoreColor(metric.score)}`}>
                  {metric.score}
                </span>
              </div>

              {/* Risk bar */}
              <div className="space-y-1">
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${riskBarColor(metric.score)}`}
                    style={{ width: `${metric.score}%` }}
                  />
                </div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${riskScoreColor(metric.score)}`}>
                  {metric.label}
                </p>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">{metric.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Rebalancer;
