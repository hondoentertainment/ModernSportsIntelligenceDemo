import React, { useMemo, useState } from 'react';
import {
  X,
  Scale,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  getPortfolioAllocations,
  getRebalanceRecommendations,
  getOptimizationScore,
  getPortfolioHealthScore,
  getAttributionEnrichedContext,
  RebalanceAction,
} from '../lib/portfolioRebalancerService';

interface RebalancerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLORS = ['#84cc16', '#60A5FA', '#FCD34D', '#F87171', '#C084FC', '#34D399'];

const actionConfig: Record<RebalanceAction, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  buy: { label: 'BUY', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: <ArrowUpRight size={14} /> },
  sell: { label: 'SELL', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: <ArrowDownRight size={14} /> },
  hold: { label: 'HOLD', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30', icon: <ShieldCheck size={14} /> },
  upgrade: { label: 'UPGRADE', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: <RefreshCw size={14} /> },
};

const priorityBadge: Record<string, { color: string; bg: string }> = {
  high: { color: 'text-red-400', bg: 'bg-red-500/10' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/10' },
  low: { color: 'text-slate-400', bg: 'bg-slate-500/10' },
};

type AllocationType = 'sport' | 'grade' | 'era';

const RebalancerModal: React.FC<RebalancerModalProps> = ({ isOpen, onClose }) => {
  const [allocationType, setAllocationType] = useState<AllocationType>('sport');
  const [expandedRec, setExpandedRec] = useState<string | null>(null);

  const allocations = useMemo(() => getPortfolioAllocations(allocationType), [allocationType]);
  const recommendations = useMemo(() => getRebalanceRecommendations(), []);
  const optimizationScore = useMemo(() => getOptimizationScore(), []);
  const healthScore = useMemo(() => getPortfolioHealthScore(), []);
  const attributionContext = useMemo(() => getAttributionEnrichedContext('1y'), []);

  const pieData = useMemo(
    () => allocations.map((a) => ({ name: a.category, value: a.currentPct })),
    [allocations]
  );

  if (!isOpen) return null;

  const toggleExpand = (id: string) => {
    setExpandedRec((prev) => (prev === id ? null : id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-brand-charcoal border border-slate-800 rounded-[2.5rem] p-8 space-y-8 animate-in zoom-in-95 duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-lime-500/10 rounded-xl text-lime-400">
            <Scale size={28} />
          </div>
          <div>
            <h2 className="text-4xl font-bebas tracking-widest text-white">
              Portfolio <span className="text-lime-400">Rebalancer</span>
            </h2>
            <p className="text-sm text-brand-muted font-medium">
              Allocation analysis and optimization recommendations
            </p>
          </div>
        </div>

        {/* Score Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 bg-brand-slate border border-slate-800 rounded-2xl">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Health Score</p>
            <p className={`text-3xl font-bebas tracking-wider ${healthScore >= 70 ? 'text-emerald-400' : healthScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
              {healthScore}<span className="text-lg text-brand-muted">/100</span>
            </p>
          </div>
          <div className="p-5 bg-brand-slate border border-slate-800 rounded-2xl">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Optimization</p>
            <p className={`text-3xl font-bebas tracking-wider ${optimizationScore >= 70 ? 'text-emerald-400' : optimizationScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
              {optimizationScore}<span className="text-lg text-brand-muted">%</span>
            </p>
          </div>
        </div>

        {/* Allocation Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bebas tracking-wider text-white">Allocation Breakdown</h3>
            <div className="flex gap-1">
              {(['sport', 'grade', 'era'] as AllocationType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setAllocationType(t)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    allocationType === t
                      ? 'bg-lime-500/20 text-lime-400 border border-lime-500/30'
                      : 'bg-slate-800 text-brand-muted border border-transparent hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Allocation Table */}
            <div className="space-y-2">
              {allocations.map((alloc, i) => (
                <div key={alloc.category} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-xs text-white font-medium flex-1">{alloc.category}</span>
                  <span className="text-xs font-mono text-brand-muted">{alloc.currentPct}%</span>
                  <span className="text-[10px] text-brand-muted">→</span>
                  <span className="text-xs font-mono text-lime-400">{alloc.targetPct}%</span>
                  <span
                    className={`text-[10px] font-mono font-bold min-w-[3rem] text-right ${
                      alloc.delta > 0 ? 'text-red-400' : alloc.delta < 0 ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {alloc.delta > 0 ? '+' : ''}{alloc.delta}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Attribution Insights (Phase 89 Cross-reference) */}
        {attributionContext.attributionDrivenRecommendations.length > 0 && (
          <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-indigo-400" />
              <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest">Attribution Insights</h3>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-800/40 rounded-xl p-3">
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Alpha</p>
                <p className={`text-xl font-bebas ${attributionContext.alphaBeta.alpha >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {attributionContext.alphaBeta.alpha > 0 ? '+' : ''}{attributionContext.alphaBeta.alpha.toFixed(2)}%
                </p>
              </div>
              <div className="bg-slate-800/40 rounded-xl p-3">
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Beta</p>
                <p className="text-xl font-bebas text-blue-400">{attributionContext.alphaBeta.beta.toFixed(2)}</p>
              </div>
              <div className="bg-slate-800/40 rounded-xl p-3">
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Skill %</p>
                <p className="text-xl font-bebas text-purple-400">{attributionContext.decomposition.percentSkill}%</p>
              </div>
            </div>
            <ul className="space-y-1">
              {attributionContext.attributionDrivenRecommendations.map((rec, i) => (
                <li key={i} className="text-xs text-brand-muted flex gap-2">
                  <span className="text-indigo-400 mt-0.5">{'>'}</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bebas tracking-wider text-white">All Recommendations</h3>
          <div className="space-y-3">
            {recommendations.map((rec) => {
              const config = actionConfig[rec.action];
              const pBadge = priorityBadge[rec.priority];
              const isExpanded = expandedRec === rec.id;

              return (
                <div
                  key={rec.id}
                  className={`bg-brand-slate border rounded-2xl transition-all ${
                    isExpanded ? `${config.border} border-opacity-50` : 'border-slate-800'
                  }`}
                >
                  <button
                    onClick={() => toggleExpand(rec.id)}
                    className="w-full text-left p-4 flex items-center gap-3"
                  >
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black ${config.color} ${config.bg}`}>
                      {config.icon}
                      {config.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{rec.cardDescription}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${pBadge.color} ${pBadge.bg}`}>
                      {rec.priority}
                    </span>
                    {rec.expectedImpact > 0 && (
                      <span className="text-xs font-mono font-bold text-emerald-400">+{rec.expectedImpact}%</span>
                    )}
                    {isExpanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                      <div className="h-px bg-slate-800" />
                      <p className="text-sm text-slate-300 leading-relaxed">{rec.reason}</p>
                      <div className="flex items-center gap-6 text-[10px] font-black text-brand-muted uppercase tracking-widest">
                        <span>Current: <span className="text-white">{rec.currentAllocation}%</span></span>
                        <span>Target: <span className="text-lime-400">{rec.targetAllocation}%</span></span>
                        <span>Impact: <span className="text-emerald-400">+{rec.expectedImpact}%</span></span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RebalancerModal;
