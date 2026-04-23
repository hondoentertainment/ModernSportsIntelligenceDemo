// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ComposedChart,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import {
  Shield,
  GitBranch,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Layers,
  ArrowRightLeft,
  Activity,
  Zap,
  Info,
  ChevronRight,
} from 'lucide-react';
import {
  getHedgePairs,
  getCards,
  buildHedge,
  getCorrelationMatrix,
  backtestHedge,
  getDrawdownAnalysis,
  getNetExposure,
  getOptimalHedgePortfolio,
  getHedgeRecommendations,
  getProtectionCost,
  formatCurrency,
  formatPct,
  strategyLabel,
  strategyColor,
  riskColor,
  riskBg,
  type HedgePair,
  type HedgeCard,
  type CorrelationMatrix,
  type BacktestResult,
  type DrawdownAnalysis,
  type NetExposure,
  type HedgePortfolio,
  type HedgeRecommendation,
  type ProtectionCost,
} from '../lib/analytics/hedgeConstructorService.ts';

// ─── Tab Definitions ─────────────────────────────────────────────────────────

type TabId =
  | 'dashboard'
  | 'pair-builder'
  | 'correlation'
  | 'backtest'
  | 'risk'
  | 'protection';

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabDef[] = [
  { id: 'dashboard', label: 'Hedge Dashboard', icon: <Shield size={16} /> },
  { id: 'pair-builder', label: 'Pair Builder', icon: <ArrowRightLeft size={16} /> },
  { id: 'correlation', label: 'Correlation Matrix', icon: <BarChart3 size={16} /> },
  { id: 'backtest', label: 'Backtest Results', icon: <TrendingUp size={16} /> },
  { id: 'risk', label: 'Risk Analysis', icon: <AlertTriangle size={16} /> },
  { id: 'protection', label: 'Portfolio Protection', icon: <Layers size={16} /> },
];

// ─── Color Utilities ─────────────────────────────────────────────────────────

function correlationCellColor(v: number): string {
  if (v >= 0.7) return 'rgba(34, 197, 94, 0.7)';
  if (v >= 0.4) return 'rgba(34, 197, 94, 0.4)';
  if (v >= 0.15) return 'rgba(34, 197, 94, 0.2)';
  if (v > -0.15) return 'rgba(100, 116, 139, 0.25)';
  if (v > -0.4) return 'rgba(239, 68, 68, 0.2)';
  if (v > -0.7) return 'rgba(239, 68, 68, 0.4)';
  return 'rgba(239, 68, 68, 0.7)';
}

function correlationTextColor(v: number): string {
  if (v >= 0.4) return '#4ade80';
  if (v >= 0.15) return '#86efac';
  if (v > -0.15) return '#94a3b8';
  if (v > -0.4) return '#fca5a5';
  return '#f87171';
}

function confidenceBadge(c: number): string {
  if (c >= 85) return 'bg-green-500/20 text-green-300';
  if (c >= 70) return 'bg-blue-500/20 text-blue-300';
  if (c >= 55) return 'bg-yellow-500/20 text-yellow-300';
  return 'bg-red-500/20 text-red-300';
}

// ─── Main Component ──────────────────────────────────────────────────────────

const CollectionHedgeConstructor: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [pairs, setPairs] = useState<HedgePair[]>([]);
  const [cards, setCards] = useState<HedgeCard[]>([]);
  const [matrix, setMatrix] = useState<CorrelationMatrix | null>(null);
  const [backtest, setBacktest] = useState<BacktestResult | null>(null);
  const [drawdown, setDrawdown] = useState<DrawdownAnalysis | null>(null);
  const [exposure, setExposure] = useState<NetExposure | null>(null);
  const [portfolio, setPortfolio] = useState<HedgePortfolio | null>(null);
  const [recommendations, setRecommendations] = useState<HedgeRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pair builder state
  const [longCardId, setLongCardId] = useState<string>('');
  const [shortCardId, setShortCardId] = useState<string>('');
  const [customPair, setCustomPair] = useState<HedgePair | null>(null);
  const [customCost, setCustomCost] = useState<ProtectionCost | null>(null);

  // Backtest selection
  const [selectedPairId, setSelectedPairId] = useState<string>('hp1');

  useEffect(() => {
    try {
      setPairs(getHedgePairs());
      setCards(getCards());
      // Use a subset for the correlation matrix display
      const topIds = ['c1', 'c2', 'c3', 'c4', 'c5', 'c7', 'c8', 'c9', 'c10', 'c12', 'c14', 'c15', 'c17'];
      setMatrix(getCorrelationMatrix(topIds));
      setBacktest(backtestHedge('hp1'));
      setDrawdown(getDrawdownAnalysis('hp1'));
      setExposure(getNetExposure());
      setPortfolio(getOptimalHedgePortfolio());
      setRecommendations(getHedgeRecommendations());
      setLoading(false);
    } catch {
      setError('Failed to load Collection Hedge Constructor data');
      setLoading(false);
    }
  }, []);

  // Rebuild backtest when selected pair changes
  useEffect(() => {
    if (!loading) {
      setBacktest(backtestHedge(selectedPairId));
      setDrawdown(getDrawdownAnalysis(selectedPairId));
    }
  }, [selectedPairId, loading]);

  // Build custom pair
  useEffect(() => {
    if (longCardId && shortCardId && longCardId !== shortCardId) {
      const built = buildHedge(longCardId, shortCardId);
      setCustomPair(built);
      if (built) {
        setCustomCost(getProtectionCost(built.id));
      }
    } else {
      setCustomPair(null);
      setCustomCost(null);
    }
  }, [longCardId, shortCardId]);

  // Scatter data for dashboard
  const scatterData = useMemo(() =>
    pairs.map(p => ({
      name: `${p.longCard.player} / ${p.shortCard.player}`,
      expectedReturn: p.expectedReturn,
      residualRisk: p.residualRisk,
      strategy: p.strategy,
      confidence: p.confidence,
    })),
  [pairs]);

  // Strategy distribution
  const strategyDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    pairs.forEach(p => {
      counts[p.strategy] = (counts[p.strategy] || 0) + 1;
    });
    return Object.entries(counts).map(([strategy, count]) => ({
      strategy: strategyLabel(strategy as any),
      count,
      color: strategyColor(strategy as any),
    }));
  }, [pairs]);

  // Radar data for risk metrics
  const radarData = useMemo(() => {
    if (!portfolio) return [];
    return portfolio.riskMetrics.slice(0, 6).map(m => ({
      metric: m.label.replace(/\s*\(.*\)/, '').slice(0, 16),
      value: m.unit === '%' ? 100 - m.value * 3 : m.value > 10 ? m.value : m.value * 50,
      benchmark: m.unit === '%' ? 100 - m.benchmark * 3 : m.benchmark > 10 ? m.benchmark : m.benchmark * 50,
    }));
  }, [portfolio]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Hedge Constructor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertTriangle size={48} className="text-red-400 mb-4" />
        <p className="text-red-400 font-medium text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/20">
            <Shield size={24} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Collection Hedge Constructor</h1>
            <p className="text-sm text-slate-400">Pair-trade and basket-hedge strategies for portfolio downside protection</p>
          </div>
        </div>
        {portfolio && (
          <span className="px-3 py-1.5 text-sm font-bold bg-blue-500/20 text-blue-300 rounded-full">
            {portfolio.protectionLevel}% Protected
          </span>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-slate-800/50 border border-slate-700/50 rounded-xl p-1 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-slate-700 text-slate-100 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Hedge Dashboard ────────────────────────────────────────────── */}
      {activeTab === 'dashboard' && portfolio && exposure && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Active Pairs</p>
              <p className="text-3xl font-bold text-blue-400">{pairs.length}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Net Exposure</p>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(exposure.netExposure)}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Hedge Ratio</p>
              <p className="text-3xl font-bold text-amber-400">{exposure.hedgeRatioPct}%</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Portfolio Beta</p>
              <p className="text-3xl font-bold text-purple-400">{exposure.beta}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Sharpe Ratio</p>
              <p className="text-3xl font-bold text-cyan-400">{portfolio.portfolioSharpe}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Protection</p>
              <p className="text-3xl font-bold text-green-400">{portfolio.protectionLevel}%</p>
            </div>
          </div>

          {/* Risk/Return Scatter + Strategy Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <Target size={16} className="text-blue-400" />
                Risk / Return Scatter
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" dataKey="residualRisk" name="Residual Risk %" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'Risk %', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }} />
                  <YAxis type="number" dataKey="expectedReturn" name="Expected Return %" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'Return %', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#e2e8f0' }}
                    formatter={(value: number, name: string) => [value.toFixed(1) + '%', name]}
                  />
                  <Scatter data={scatterData} fill="#3b82f6">
                    {scatterData.map((entry, i) => (
                      <Cell key={i} fill={strategyColor(pairs[i]?.strategy ?? 'pair-trade')} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <Layers size={16} className="text-purple-400" />
                Strategy Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={strategyDistribution} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="strategy" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="count" name="Pairs" radius={[6, 6, 0, 0]}>
                    {strategyDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Zap size={16} className="text-amber-400" />
              Hedge Recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map(rec => (
                <div key={rec.id} className={`border rounded-xl p-4 ${riskBg(rec.urgency)}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-semibold text-slate-200">{rec.title}</h4>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${riskColor(rec.urgency)}`}>
                      {rec.urgency}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">{rec.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{strategyLabel(rec.strategy)}</span>
                    <span className="text-emerald-400 font-semibold">{formatPct(rec.expectedBenefit)} expected</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Hedge Pairs Table */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <ArrowRightLeft size={16} className="text-blue-400" />
              Active Hedge Pairs
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-700/50">
                    <th className="text-left py-3 px-2">Long</th>
                    <th className="text-left py-3 px-2">Short</th>
                    <th className="text-center py-3 px-2">Strategy</th>
                    <th className="text-center py-3 px-2">Correlation</th>
                    <th className="text-center py-3 px-2">Hedge Ratio</th>
                    <th className="text-center py-3 px-2">Exp. Return</th>
                    <th className="text-center py-3 px-2">Residual Risk</th>
                    <th className="text-center py-3 px-2">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {pairs.map(pair => (
                    <tr key={pair.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp size={14} className="text-green-400" />
                          <div>
                            <p className="text-slate-200 font-medium">{pair.longCard.player}</p>
                            <p className="text-[10px] text-slate-500">{pair.longCard.team} &middot; {pair.longCard.sport}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <TrendingDown size={14} className="text-red-400" />
                          <div>
                            <p className="text-slate-200 font-medium">{pair.shortCard.player}</p>
                            <p className="text-[10px] text-slate-500">{pair.shortCard.team} &middot; {pair.shortCard.sport}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold" style={{ backgroundColor: `${strategyColor(pair.strategy)}22`, color: strategyColor(pair.strategy) }}>
                          {strategyLabel(pair.strategy)}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center font-mono" style={{ color: correlationTextColor(pair.correlation) }}>
                        {pair.correlation.toFixed(2)}
                      </td>
                      <td className="py-3 px-2 text-center font-mono text-slate-300">{pair.hedgeRatio.toFixed(2)}</td>
                      <td className="py-3 px-2 text-center font-mono text-emerald-400">{formatPct(pair.expectedReturn)}</td>
                      <td className="py-3 px-2 text-center font-mono text-amber-400">{pair.residualRisk}%</td>
                      <td className="py-3 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${confidenceBadge(pair.confidence)}`}>
                          {pair.confidence}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── Pair Builder ───────────────────────────────────────────────── */}
      {activeTab === 'pair-builder' && (
        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <ArrowRightLeft size={16} className="text-blue-400" />
              Build Custom Hedge Pair
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Long Side */}
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Long Position</label>
                <select
                  value={longCardId}
                  onChange={e => setLongCardId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:border-green-500 focus:outline-none"
                >
                  <option value="">Select card to go long...</option>
                  {cards.map(c => (
                    <option key={c.id} value={c.id}>{c.player} — {c.team} ({c.sport}) — {formatCurrency(c.currentValue)}</option>
                  ))}
                </select>
                {longCardId && (() => {
                  const card = cards.find(c => c.id === longCardId);
                  if (!card) return null;
                  return (
                    <div className="mt-3 bg-green-500/5 border border-green-500/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={14} className="text-green-400" />
                        <span className="text-sm font-semibold text-green-300">{card.player}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div><p className="text-slate-500">Value</p><p className="text-slate-200 font-mono">{formatCurrency(card.currentValue)}</p></div>
                        <div><p className="text-slate-500">Volatility</p><p className="text-slate-200 font-mono">{card.volatility30d}%</p></div>
                        <div><p className="text-slate-500">Beta</p><p className="text-slate-200 font-mono">{card.beta}</p></div>
                        <div><p className="text-slate-500">Momentum</p><p className="text-slate-200 font-mono">{card.momentum > 0 ? '+' : ''}{card.momentum}</p></div>
                        <div><p className="text-slate-500">Liquidity</p><p className="text-slate-200 font-mono">{card.liquidityScore}/100</p></div>
                        <div><p className="text-slate-500">Position</p><p className="text-slate-200">{card.position}</p></div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Short Side */}
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Short Position</label>
                <select
                  value={shortCardId}
                  onChange={e => setShortCardId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:border-red-500 focus:outline-none"
                >
                  <option value="">Select card to short...</option>
                  {cards.filter(c => c.id !== longCardId).map(c => (
                    <option key={c.id} value={c.id}>{c.player} — {c.team} ({c.sport}) — {formatCurrency(c.currentValue)}</option>
                  ))}
                </select>
                {shortCardId && (() => {
                  const card = cards.find(c => c.id === shortCardId);
                  if (!card) return null;
                  return (
                    <div className="mt-3 bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingDown size={14} className="text-red-400" />
                        <span className="text-sm font-semibold text-red-300">{card.player}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div><p className="text-slate-500">Value</p><p className="text-slate-200 font-mono">{formatCurrency(card.currentValue)}</p></div>
                        <div><p className="text-slate-500">Volatility</p><p className="text-slate-200 font-mono">{card.volatility30d}%</p></div>
                        <div><p className="text-slate-500">Beta</p><p className="text-slate-200 font-mono">{card.beta}</p></div>
                        <div><p className="text-slate-500">Momentum</p><p className="text-slate-200 font-mono">{card.momentum > 0 ? '+' : ''}{card.momentum}</p></div>
                        <div><p className="text-slate-500">Liquidity</p><p className="text-slate-200 font-mono">{card.liquidityScore}/100</p></div>
                        <div><p className="text-slate-500">Position</p><p className="text-slate-200">{card.position}</p></div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Custom Pair Results */}
          {customPair && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <Activity size={16} className="text-cyan-400" />
                  Pair Analysis
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-slate-700/30">
                    <span className="text-xs text-slate-500">Correlation</span>
                    <span className="font-mono text-sm" style={{ color: correlationTextColor(customPair.correlation) }}>{customPair.correlation.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-700/30">
                    <span className="text-xs text-slate-500">Hedge Ratio</span>
                    <span className="font-mono text-sm text-slate-200">{customPair.hedgeRatio.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-700/30">
                    <span className="text-xs text-slate-500">Expected Return</span>
                    <span className="font-mono text-sm text-emerald-400">{formatPct(customPair.expectedReturn)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-700/30">
                    <span className="text-xs text-slate-500">Residual Risk</span>
                    <span className="font-mono text-sm text-amber-400">{customPair.residualRisk}%</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-700/30">
                    <span className="text-xs text-slate-500">Strategy</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: `${strategyColor(customPair.strategy)}22`, color: strategyColor(customPair.strategy) }}>
                      {strategyLabel(customPair.strategy)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-slate-500">Confidence</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${confidenceBadge(customPair.confidence)}`}>{customPair.confidence}%</span>
                  </div>
                </div>
                <div className="mt-4 bg-slate-900/50 border border-slate-700/30 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Info size={14} className="text-blue-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-400">{customPair.rationale}</p>
                  </div>
                </div>
              </div>

              {customCost && (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                    <Shield size={16} className="text-amber-400" />
                    Protection Cost Breakdown
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-slate-700/30">
                      <span className="text-xs text-slate-500">Annual Cost</span>
                      <span className="font-mono text-sm text-slate-200">{customCost.annualCostBps} bps</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-700/30">
                      <span className="text-xs text-slate-500">Implied Vol Spread</span>
                      <span className="font-mono text-sm text-slate-200">{customCost.impliedVolSpread > 0 ? '+' : ''}{customCost.impliedVolSpread}%</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-700/30">
                      <span className="text-xs text-slate-500">Carry Drag</span>
                      <span className="font-mono text-sm text-red-400">-{customCost.carryDrag}%</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-700/30">
                      <span className="text-xs text-slate-500">Liquidity Cost</span>
                      <span className="font-mono text-sm text-red-400">-{customCost.liquidityCost}%</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-700/30">
                      <span className="text-xs text-slate-500">Total Cost</span>
                      <span className="font-mono text-sm font-bold text-amber-400">{customCost.totalCostPct}%</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-xs text-slate-500">Break-Even</span>
                      <span className="font-mono text-sm text-slate-200">{customCost.breakEvenDays} days</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!customPair && longCardId && shortCardId && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 text-center">
              <AlertTriangle size={32} className="text-amber-400 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Unable to construct hedge pair with selected cards.</p>
            </div>
          )}
        </div>
      )}

      {/* ─── Correlation Matrix ─────────────────────────────────────────── */}
      {activeTab === 'correlation' && matrix && (
        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-1 flex items-center gap-2">
              <BarChart3 size={16} className="text-purple-400" />
              Card-to-Card Correlation Heat Map
            </h3>
            <p className="text-xs text-slate-500 mb-4">{matrix.windowDays}-day rolling window &middot; {matrix.cardIds.length} cards</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[10px]">
                <thead>
                  <tr>
                    <th className="p-1 text-left text-slate-500 min-w-[80px]"></th>
                    {matrix.cardLabels.map((label, i) => (
                      <th key={i} className="p-1 text-center text-slate-500 min-w-[52px]" style={{ writingMode: 'vertical-lr', height: '80px' }}>
                        {label.length > 12 ? label.slice(0, 12) + '.' : label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.matrix.map((row, i) => (
                    <tr key={i}>
                      <td className="p-1 text-right text-slate-400 font-medium pr-2 whitespace-nowrap">
                        {matrix.cardLabels[i].length > 14 ? matrix.cardLabels[i].slice(0, 14) + '.' : matrix.cardLabels[i]}
                      </td>
                      {row.map((val, j) => (
                        <td
                          key={j}
                          className="p-0.5 text-center font-mono"
                          style={{
                            backgroundColor: correlationCellColor(val),
                            color: correlationTextColor(val),
                            fontSize: '10px',
                            fontWeight: i === j ? 700 : 500,
                          }}
                        >
                          {val.toFixed(2)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-slate-500">
              <div className="flex items-center gap-1">
                <div className="w-4 h-3 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.7)' }} />
                <span>Strong Negative</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-3 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }} />
                <span>Weak Negative</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-3 rounded" style={{ backgroundColor: 'rgba(100, 116, 139, 0.25)' }} />
                <span>Neutral</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-3 rounded" style={{ backgroundColor: 'rgba(34, 197, 94, 0.4)' }} />
                <span>Positive</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-3 rounded" style={{ backgroundColor: 'rgba(34, 197, 94, 0.7)' }} />
                <span>Strong Positive</span>
              </div>
            </div>
          </div>

          {/* Strongest Negative Correlations for Hedging */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <GitBranch size={16} className="text-red-400" />
              Strongest Negative Correlations (Best Hedge Candidates)
            </h3>
            <div className="space-y-2">
              {(() => {
                const entries: { a: string; b: string; val: number }[] = [];
                for (let i = 0; i < matrix.matrix.length; i++) {
                  for (let j = i + 1; j < matrix.matrix[i].length; j++) {
                    if (matrix.matrix[i][j] < -0.2) {
                      entries.push({ a: matrix.cardLabels[i], b: matrix.cardLabels[j], val: matrix.matrix[i][j] });
                    }
                  }
                }
                entries.sort((x, y) => x.val - y.val);
                return entries.slice(0, 8).map((e, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-900/50 rounded-lg px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-300">{e.a}</span>
                      <ChevronRight size={14} className="text-slate-600" />
                      <span className="text-sm text-slate-300">{e.b}</span>
                    </div>
                    <span className="font-mono text-sm font-bold" style={{ color: correlationTextColor(e.val) }}>
                      {e.val.toFixed(2)}
                    </span>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ─── Backtest Results ───────────────────────────────────────────── */}
      {activeTab === 'backtest' && backtest && (
        <div className="space-y-6">
          {/* Pair Selector */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Select Hedge Pair to Backtest</label>
            <select
              value={selectedPairId}
              onChange={e => setSelectedPairId(e.target.value)}
              className="w-full md:w-96 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              {pairs.map(p => (
                <option key={p.id} value={p.id}>{p.longCard.player} / {p.shortCard.player} ({strategyLabel(p.strategy)})</option>
              ))}
            </select>
          </div>

          {/* Backtest Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { label: 'Total Return', value: formatPct(backtest.totalReturn), color: backtest.totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400' },
              { label: 'Annualized', value: formatPct(backtest.annualizedReturn), color: 'text-blue-400' },
              { label: 'Sharpe Ratio', value: backtest.sharpeRatio.toFixed(2), color: 'text-cyan-400' },
              { label: 'Max Drawdown', value: `-${backtest.maxDrawdown}%`, color: 'text-red-400' },
              { label: 'Win Rate', value: `${backtest.winRate}%`, color: 'text-emerald-400' },
              { label: 'Profit Factor', value: backtest.profitFactor.toFixed(2), color: 'text-purple-400' },
              { label: 'Total Trades', value: String(backtest.trades), color: 'text-slate-200' },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
                <p className={`text-xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Equity Curve */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-400" />
              Equity Curve (24 Months)
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={backtest.equityCurve} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                <defs>
                  <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} domain={['auto', 'auto']} tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} formatter={(v: number) => [`$${v.toLocaleString()}`, 'Equity']} />
                <ReferenceLine y={10000} stroke="#64748b" strokeDasharray="3 3" label={{ value: 'Initial $10k', fill: '#64748b', fontSize: 10 }} />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#equityGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Returns Bar */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <BarChart3 size={16} className="text-amber-400" />
              Monthly Returns Distribution
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={backtest.monthlyReturns} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 9 }} angle={-45} textAnchor="end" height={50} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v: number) => `${v}%`} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} formatter={(v: number) => [`${v.toFixed(2)}%`, 'Return']} />
                <ReferenceLine y={0} stroke="#64748b" />
                <Bar dataKey="return" radius={[4, 4, 0, 0]}>
                  {backtest.monthlyReturns.map((entry, i) => (
                    <Cell key={i} fill={entry.return >= 0 ? '#22c55e' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ─── Risk Analysis ──────────────────────────────────────────────── */}
      {activeTab === 'risk' && drawdown && portfolio && exposure && (
        <div className="space-y-6">
          {/* Drawdown Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Current Drawdown</p>
              <p className="text-2xl font-bold font-mono text-amber-400">-{drawdown.currentDrawdown}%</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Max Drawdown</p>
              <p className="text-2xl font-bold font-mono text-red-400">-{drawdown.maxHistoricalDrawdown}%</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">VaR (95%)</p>
              <p className="text-2xl font-bold font-mono text-orange-400">-{drawdown.tailRiskVaR95}%</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">CVaR</p>
              <p className="text-2xl font-bold font-mono text-red-400">-{drawdown.conditionalVaR}%</p>
            </div>
          </div>

          {/* Risk Radar + Drawdown Events */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <Shield size={16} className="text-cyan-400" />
                Risk Profile Radar
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <PolarRadiusAxis tick={{ fill: '#64748b', fontSize: 9 }} />
                  <Radar name="Portfolio" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                  <Radar name="Benchmark" dataKey="benchmark" stroke="#64748b" fill="#64748b" fillOpacity={0.1} strokeDasharray="4 4" />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-400" />
                Drawdown Events
              </h3>
              <div className="space-y-3">
                {drawdown.drawdownEvents.map((event, i) => (
                  <div key={i} className={`border rounded-lg p-3 ${event.recovered ? 'bg-slate-900/50 border-slate-700/30' : 'bg-red-500/5 border-red-500/20'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400">{event.peakDate} &rarr; {event.troughDate}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${event.recovered ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                        {event.recovered ? 'Recovered' : 'Active'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-slate-500">Depth</p>
                        <p className="font-mono text-red-400 font-bold">-{event.depth}%</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Duration</p>
                        <p className="font-mono text-slate-200">{event.durationDays}d</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Recovery</p>
                        <p className="font-mono text-slate-200">{event.recoveryDate ?? 'Pending'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sport Exposure Bar Chart */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Activity size={16} className="text-purple-400" />
              Net Exposure by Sport
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={exposure.sportExposures} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="sport" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} formatter={(v: number) => [formatCurrency(v), 'Net Exposure']} />
                <ReferenceLine y={0} stroke="#64748b" />
                <Bar dataKey="net" radius={[6, 6, 0, 0]}>
                  {exposure.sportExposures.map((entry, i) => (
                    <Cell key={i} fill={entry.net >= 0 ? '#3b82f6' : '#ef4444'} />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ─── Portfolio Protection ────────────────────────────────────────── */}
      {activeTab === 'protection' && portfolio && (
        <div className="space-y-6">
          {/* Portfolio Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Value</p>
              <p className="text-2xl font-bold text-slate-100">{formatCurrency(portfolio.totalValue)}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Expected Return</p>
              <p className="text-2xl font-bold text-emerald-400">{formatPct(portfolio.expectedReturn)}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Portfolio Sharpe</p>
              <p className="text-2xl font-bold text-cyan-400">{portfolio.portfolioSharpe}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Rebalance</p>
              <p className="text-lg font-bold text-purple-400 capitalize">{portfolio.rebalanceFrequency}</p>
            </div>
          </div>

          {/* Risk Metrics Grid */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Shield size={16} className="text-green-400" />
              Protection Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {portfolio.riskMetrics.map((metric, i) => (
                <div key={i} className={`border rounded-xl p-4 ${riskBg(metric.status)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-slate-300">{metric.label}</h4>
                    <span className={`text-[10px] font-bold uppercase ${riskColor(metric.status)}`}>{metric.status}</span>
                  </div>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-2xl font-bold font-mono text-slate-100">{metric.value}{metric.unit}</span>
                    <span className="text-xs text-slate-500 mb-1">vs {metric.benchmark}{metric.unit} bench</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-700/30 rounded-full h-1.5 mb-2">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (metric.value / Math.max(metric.benchmark, metric.value)) * 100)}%`,
                        backgroundColor: metric.status === 'low' ? '#22c55e' : metric.status === 'medium' ? '#eab308' : '#ef4444',
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">{metric.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio Pairs Allocation */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Layers size={16} className="text-blue-400" />
              Portfolio Hedge Allocation
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="name"
                  type="category"
                  allowDuplicatedCategory={false}
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  data={portfolio.pairs.map(p => ({ name: `${p.longCard.player.split(' ').pop()} / ${p.shortCard.player.split(' ').pop()}` }))}
                />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line
                  data={portfolio.pairs.map(p => ({
                    name: `${p.longCard.player.split(' ').pop()} / ${p.shortCard.player.split(' ').pop()}`,
                    value: p.expectedReturn,
                  }))}
                  type="monotone"
                  dataKey="value"
                  name="Expected Return %"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: '#22c55e', r: 5 }}
                />
                <Line
                  data={portfolio.pairs.map(p => ({
                    name: `${p.longCard.player.split(' ').pop()} / ${p.shortCard.player.split(' ').pop()}`,
                    value: p.residualRisk,
                  }))}
                  type="monotone"
                  dataKey="value"
                  name="Residual Risk %"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', r: 5 }}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Position-level detail */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Target size={16} className="text-amber-400" />
              Position Detail
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolio.pairs.map(pair => (
                <div key={pair.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: `${strategyColor(pair.strategy)}22`, color: strategyColor(pair.strategy) }}>
                      {strategyLabel(pair.strategy)}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${confidenceBadge(pair.confidence)}`}>
                      {pair.confidence}%
                    </span>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={12} className="text-green-400" />
                      <span className="text-xs text-slate-300">{pair.longCard.player}</span>
                      <span className="text-[10px] text-slate-500 ml-auto font-mono">{formatCurrency(pair.longCard.currentValue)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingDown size={12} className="text-red-400" />
                      <span className="text-xs text-slate-300">{pair.shortCard.player}</span>
                      <span className="text-[10px] text-slate-500 ml-auto font-mono">{formatCurrency(pair.shortCard.currentValue)}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] border-t border-slate-700/30 pt-2">
                    <div>
                      <p className="text-slate-500">Corr</p>
                      <p className="font-mono" style={{ color: correlationTextColor(pair.correlation) }}>{pair.correlation.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Exp Ret</p>
                      <p className="font-mono text-emerald-400">{formatPct(pair.expectedReturn)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Risk</p>
                      <p className="font-mono text-amber-400">{pair.residualRisk}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionHedgeConstructor;
