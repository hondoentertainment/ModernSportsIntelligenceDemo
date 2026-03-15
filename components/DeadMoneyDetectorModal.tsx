import React, { useState, useMemo } from 'react';
import {
  X,
  Skull,
  ArrowRightLeft,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  AlertCircle,
  Shield,
  Activity,
  Target,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  scanPortfolio,
  getHealthScore,
  getSwapRecommendations,
  getCapitalEfficiency,
  getOpportunityCost,
  getDeadMoneyAlerts,
  formatCurrency,
  type DeadMoneyAsset,
  type SwapRecommendation,
  type DeadMoneyAlert,
  type PortfolioHealthScore,
  type CapitalEfficiency,
} from '../lib/deadMoneyDetectorService';

interface DeadMoneyDetectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'overview' | 'leaderboard' | 'swaps' | 'alerts';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'swaps', label: 'Swaps' },
  { id: 'alerts', label: 'Alerts' },
];

const DeadMoneyDetectorModal: React.FC<DeadMoneyDetectorModalProps> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<TabId>('overview');

  const assets = useMemo(() => scanPortfolio(), []);
  const health = useMemo(() => getHealthScore(), []);
  const swaps = useMemo(() => getSwapRecommendations(), []);
  const efficiency = useMemo(() => getCapitalEfficiency(), []);
  const oppCost = useMemo(() => getOpportunityCost(365), []);
  const alerts = useMemo(() => getDeadMoneyAlerts(), []);

  const deadAssets = useMemo(() => assets.filter(a => a.deadMoneyScore >= 60), [assets]);
  const unreadAlerts = useMemo(() => alerts.filter(a => !a.read).length, [alerts]);

  const costChartData = useMemo(() =>
    oppCost.costByAsset.slice(0, 8).map(c => ({ name: c.cardName, cost: c.cost })),
  [oppCost]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-xl">
              <Skull size={20} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Dead Money Detector</h2>
              <p className="text-xs text-slate-500">Portfolio stagnation analysis</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700/50 px-5">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-xs font-medium transition-colors relative ${
                tab === t.id
                  ? 'text-red-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t.label}
              {t.id === 'alerts' && unreadAlerts > 0 && (
                <span className="absolute -top-0 -right-0 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">{unreadAlerts}</span>
              )}
              {tab === t.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-400 rounded-full" />}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Overview Tab */}
          {tab === 'overview' && (
            <>
              {/* Score + key stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-3 text-center">
                  <p className="text-[10px] text-slate-500 uppercase">Health Score</p>
                  <p className="text-2xl font-bold text-white">{health.score}</p>
                  <p className="text-xs font-bold" style={{ color: health.score >= 70 ? '#10b981' : health.score >= 40 ? '#fbbf24' : '#f87171' }}>{health.grade}</p>
                </div>
                <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-3 text-center">
                  <p className="text-[10px] text-slate-500 uppercase">Dead Money</p>
                  <p className="text-2xl font-bold text-red-400">{health.deadMoneyPercentage}%</p>
                  <p className="text-[10px] text-slate-500">{deadAssets.length} cards</p>
                </div>
                <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-3 text-center">
                  <p className="text-[10px] text-slate-500 uppercase">Opp Cost (1yr)</p>
                  <p className="text-2xl font-bold text-amber-400">{formatCurrency(oppCost.totalCost)}</p>
                  <p className="text-[10px] text-slate-500">{formatCurrency(oppCost.dailyAverage)}/day</p>
                </div>
                <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-3 text-center">
                  <p className="text-[10px] text-slate-500 uppercase">Efficiency</p>
                  <p className="text-2xl font-bold text-emerald-400">{efficiency.efficiencyRatio}%</p>
                  <p className="text-[10px] text-slate-500">productive capital</p>
                </div>
              </div>

              {/* Opp cost bar chart */}
              <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-4">
                <p className="text-xs font-bold text-white mb-3">Opportunity Cost by Player</p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={costChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `$${v}`} />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={100} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                      formatter={(v: number) => [formatCurrency(v), 'Opp Cost']}
                    />
                    <Bar dataKey="cost" fill="#f87171" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Recommendations */}
              <div>
                <p className="text-xs font-bold text-white mb-2">Recommendations</p>
                <div className="space-y-1.5">
                  {health.recommendations.slice(0, 3).map((r, i) => (
                    <div key={i} className="flex items-start gap-2 bg-slate-800/40 rounded-lg p-2.5 border border-slate-700/50">
                      <Shield size={12} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-slate-300">{r}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Leaderboard Tab */}
          {tab === 'leaderboard' && (
            <div className="space-y-2">
              {deadAssets.map((a, i) => {
                const change = ((a.currentValue - a.purchasePrice) / a.purchasePrice) * 100;
                return (
                  <div key={a.cardId} className="flex items-center gap-3 bg-slate-800/40 rounded-lg p-3 border border-slate-700/50">
                    <span className="text-lg font-bold text-slate-600 w-6 text-center">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white font-medium">{a.player}</p>
                      <p className="text-[10px] text-slate-500 truncate">{a.cardName}</p>
                    </div>
                    <div className="text-right min-w-[60px]">
                      <p className="text-xs text-red-400 font-bold">{change.toFixed(0)}%</p>
                      <p className="text-[10px] text-slate-500">{a.stagnationDays}d stag</p>
                    </div>
                    <div className="text-center min-w-[40px]">
                      <p className={`text-sm font-bold ${a.deadMoneyScore >= 80 ? 'text-red-400' : 'text-amber-400'}`}>{a.deadMoneyScore}</p>
                      <p className="text-[9px] text-slate-500">score</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                      a.suggestedAction === 'sell' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                      a.suggestedAction === 'swap' ? 'bg-violet-500/10 text-violet-400 border-violet-500/30' :
                      a.suggestedAction === 'reduce' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                      'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {a.suggestedAction}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Swaps Tab */}
          {tab === 'swaps' && (
            <div className="space-y-3">
              {swaps.slice(0, 6).map(swap => (
                <div key={swap.id} className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-400 font-medium">{swap.fromAsset.player}</span>
                        <ArrowRightLeft size={12} className="text-emerald-400" />
                        <span className="text-xs text-emerald-400 font-medium">{swap.toAsset.player}</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-emerald-400">+{formatCurrency(swap.expectedGain)}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mb-2">{swap.rationale.substring(0, 120)}...</p>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-500">Confidence: <span className="text-white font-bold">{swap.confidence}%</span></span>
                    <span className="text-[10px] text-slate-500">Timeframe: <span className="text-white font-bold">{swap.timeframe}</span></span>
                    <span className={`text-[10px] font-semibold ${swap.riskLevel === 'low' ? 'text-emerald-400' : swap.riskLevel === 'medium' ? 'text-amber-400' : 'text-red-400'}`}>{swap.riskLevel} risk</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Alerts Tab */}
          {tab === 'alerts' && (
            <div className="space-y-2">
              {alerts.map(a => {
                const severityStyles: Record<string, string> = {
                  critical: 'border-red-500/30 bg-red-500/5',
                  warning: 'border-amber-500/30 bg-amber-500/5',
                  info: 'border-blue-500/30 bg-blue-500/5',
                };
                return (
                  <div key={a.id} className={`rounded-lg p-3 border ${severityStyles[a.severity]} ${!a.read ? 'ring-1 ring-red-500/20' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {a.severity === 'critical' ? <AlertTriangle size={12} className="text-red-400" /> :
                       a.severity === 'warning' ? <AlertCircle size={12} className="text-amber-400" /> :
                       <Shield size={12} className="text-blue-400" />}
                      <p className="text-xs text-white font-medium">{a.player}</p>
                      {!a.read && <span className="w-1.5 h-1.5 rounded-full bg-red-400" />}
                      <span className="text-[9px] text-slate-500 ml-auto">{new Date(a.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">{a.message}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[9px] text-slate-500">{a.daysStagnant}d stagnant</span>
                      <span className="text-[9px] text-slate-500">Cost: {formatCurrency(a.opportunityCost)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeadMoneyDetectorModal;
