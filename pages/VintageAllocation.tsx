// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import {
  PieChart as PieChartIcon,
  BarChart3,
  RefreshCw,
  TrendingUp,
  Shield,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Layers,
  Activity,
  Clock,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import {
  getAllocationItems,
  getAllocationTargets,
  getRiskReturnProfiles,
  getRebalanceActions,
  getAllocationStats,
  setTargetAllocation,
  getHistoricalReturns,
  getPortfolioRisk,
  getDiversificationScore,
  getOptimalAllocation,
  formatCurrency,
  formatPercent,
  getCategoryColor,
  getCategoryLabel,
  getRiskColor,
  getLiquidityColor,
  type AllocationCategory,
  type AllocationItem,
  type AllocationTarget,
  type RiskReturnProfile,
  type RebalanceAction,
  type AllocationStats,
  type HistoricalReturn,
} from '../lib/analytics/vintageAllocationService.ts';

type TabId = 'overview' | 'risk' | 'rebalance' | 'historical';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Allocation Overview', icon: <PieChartIcon className="w-4 h-4" /> },
  { id: 'risk', label: 'Risk / Return', icon: <Activity className="w-4 h-4" /> },
  { id: 'rebalance', label: 'Rebalance', icon: <RefreshCw className="w-4 h-4" /> },
  { id: 'historical', label: 'Historical', icon: <Clock className="w-4 h-4" /> },
];

const VintageAllocation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [stats, setStats] = useState<AllocationStats | null>(null);
  const [targets, setTargets] = useState<AllocationTarget[]>([]);
  const [profiles, setProfiles] = useState<RiskReturnProfile[]>([]);
  const [actions, setActions] = useState<RebalanceAction[]>([]);
  const [historicalData, setHistoricalData] = useState<HistoricalReturn[]>([]);
  const [items, setItems] = useState<AllocationItem[]>([]);
  const [portfolioRisk, setPortfolioRisk] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    setLoading(true);
    try {
      setStats(getAllocationStats());
      setTargets(getAllocationTargets());
      setProfiles(getRiskReturnProfiles());
      setActions(getRebalanceActions());
      setHistoricalData(getHistoricalReturns());
      setItems(getAllocationItems());
      setPortfolioRisk(getPortfolioRisk());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTargetChange = (category: AllocationCategory, value: number) => {
    setTargetAllocation(category, value);
    loadData();
  };

  const applyOptimalAllocation = (riskTolerance: 'conservative' | 'moderate' | 'aggressive') => {
    const optimal = getOptimalAllocation(riskTolerance);
    const cats: AllocationCategory[] = ['vintage', 'classic', 'modern', 'ultra_modern'];
    cats.forEach((cat) => setTargetAllocation(cat, optimal[cat]));
    loadData();
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
      </div>
    );
  }

  const donutData = targets.map((t) => ({
    name: getCategoryLabel(t.category),
    value: t.actualPercent,
    color: getCategoryColor(t.category),
  }));

  const targetDonutData = targets.map((t) => ({
    name: getCategoryLabel(t.category),
    value: t.targetPercent,
    color: getCategoryColor(t.category),
  }));

  const scatterData = profiles.map((p) => ({
    x: p.avgRisk,
    y: p.avgReturn,
    category: p.category,
    label: getCategoryLabel(p.category),
    color: getCategoryColor(p.category),
  }));

  const diversScore = stats.diversificationScore;
  const diversColor = diversScore >= 70 ? '#10b981' : diversScore >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Layers className="w-8 h-8 text-amber-500" />
            Vintage vs Modern Allocation
          </h1>
          <p className="text-slate-400 mt-2">
            Analyze and optimize your portfolio allocation across card eras for maximum risk-adjusted returns.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-slate-400 text-sm">Total Value</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalValue)}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-slate-400 text-sm">Overall Return</p>
            <p className={`text-2xl font-bold ${stats.overallReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatPercent(stats.overallReturn)}
            </p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-slate-400 text-sm">Portfolio Risk</p>
            <p className="text-2xl font-bold" style={{ color: getRiskColor(stats.riskScore) }}>
              {stats.riskScore.toFixed(1)}/10
            </p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-slate-400 text-sm">Diversification</p>
            <p className="text-2xl font-bold" style={{ color: diversColor }}>
              {diversScore}/100
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-black'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Donut Charts Row */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Current Allocation</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      dataKey="value"
                      stroke="none"
                    >
                      {donutData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `${value.toFixed(1)}%`}
                      contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 mt-2 justify-center">
                  {donutData.map((d, i) => (
                    <span key={i} className="flex items-center gap-1 text-xs text-slate-300">
                      <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: d.color }} />
                      {d.name}: {d.value.toFixed(1)}%
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Target Allocation</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={targetDonutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      dataKey="value"
                      stroke="none"
                    >
                      {targetDonutData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `${value.toFixed(1)}%`}
                      contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 mt-2 justify-center">
                  {targetDonutData.map((d, i) => (
                    <span key={i} className="flex items-center gap-1 text-xs text-slate-300">
                      <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: d.color }} />
                      {d.name}: {d.value.toFixed(1)}%
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Allocation Sliders */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-500" />
                Target Allocation Controls
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {targets.map((t) => (
                  <div key={t.category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span style={{ color: getCategoryColor(t.category) }}>{getCategoryLabel(t.category)}</span>
                      <span className="text-slate-400">{t.targetPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={t.targetPercent}
                      onChange={(e) => handleTargetChange(t.category, Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>Actual: {t.actualPercent.toFixed(1)}%</span>
                      <span className={t.deviation >= 0 ? 'text-green-400' : 'text-red-400'}>
                        Dev: {t.deviation >= 0 ? '+' : ''}{t.deviation.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={() => applyOptimalAllocation('conservative')} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors">
                  Conservative
                </button>
                <button onClick={() => applyOptimalAllocation('moderate')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
                  Moderate
                </button>
                <button onClick={() => applyOptimalAllocation('aggressive')} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors">
                  Aggressive
                </button>
              </div>
            </div>

            {/* Diversification Gauge */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500" />
                Diversification Score
              </h2>
              <div className="flex items-center gap-6">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 120 120" className="w-full h-full">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#334155" strokeWidth="10" />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke={diversColor}
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${(diversScore / 100) * 314} 314`}
                      transform="rotate(-90 60 60)"
                    />
                    <text x="60" y="65" textAnchor="middle" className="text-2xl font-bold" fill="white" fontSize="24">
                      {diversScore}
                    </text>
                  </svg>
                </div>
                <div className="text-slate-300 text-sm space-y-1">
                  <p>Your portfolio spans <strong>{new Set(items.map((i) => i.category)).size}</strong> era categories.</p>
                  <p>Across <strong>{new Set(items.map((i) => i.sport)).size}</strong> sports.</p>
                  <p>With <strong>{items.length}</strong> total cards.</p>
                  <p className="mt-2 text-xs text-slate-500">Score based on allocation entropy and sport diversity.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'risk' && (
          <div className="space-y-6">
            {/* Scatter Plot */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Risk vs Return by Category</h2>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" dataKey="x" name="Risk" domain={[0, 10]} stroke="#94a3b8" label={{ value: 'Risk Score', position: 'insideBottom', offset: -5, fill: '#94a3b8' }} />
                  <YAxis type="number" dataKey="y" name="Return" stroke="#94a3b8" label={{ value: 'Avg Return %', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                  <Tooltip
                    content={({ payload }) => {
                      if (!payload || payload.length === 0) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-700 p-3 rounded-lg text-sm">
                          <p className="font-semibold" style={{ color: d.color }}>{d.label}</p>
                          <p>Risk: {d.x.toFixed(1)}</p>
                          <p>Return: {d.y.toFixed(1)}%</p>
                        </div>
                      );
                    }}
                  />
                  {scatterData.map((d, i) => (
                    <Scatter key={i} data={[d]} fill={d.color} name={d.label}>
                      <Cell fill={d.color} />
                    </Scatter>
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Risk profiles table */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Risk-Return Profiles</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700">
                      <th className="text-left py-3 px-4">Category</th>
                      <th className="text-right py-3 px-4">Avg Return</th>
                      <th className="text-right py-3 px-4">Avg Risk</th>
                      <th className="text-right py-3 px-4">Sharpe Ratio</th>
                      <th className="text-right py-3 px-4">Max Drawdown</th>
                      <th className="text-right py-3 px-4">Volatility</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((p) => (
                      <tr key={p.category} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="py-3 px-4 font-medium" style={{ color: getCategoryColor(p.category) }}>
                          {getCategoryLabel(p.category)}
                        </td>
                        <td className="text-right py-3 px-4 text-green-400">{p.avgReturn.toFixed(1)}%</td>
                        <td className="text-right py-3 px-4" style={{ color: getRiskColor(p.avgRisk) }}>{p.avgRisk.toFixed(1)}</td>
                        <td className="text-right py-3 px-4">{p.sharpeRatio.toFixed(2)}</td>
                        <td className="text-right py-3 px-4 text-red-400">{p.maxDrawdown.toFixed(1)}%</td>
                        <td className="text-right py-3 px-4">{p.volatility.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Portfolio risk summary */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Portfolio Risk Summary</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-slate-900 rounded-lg p-4 text-center">
                  <p className="text-slate-400 text-sm mb-1">Weighted Risk</p>
                  <p className="text-3xl font-bold" style={{ color: getRiskColor(portfolioRisk) }}>
                    {portfolioRisk.toFixed(1)}
                  </p>
                </div>
                <div className="bg-slate-900 rounded-lg p-4 text-center">
                  <p className="text-slate-400 text-sm mb-1">Diversification</p>
                  <p className="text-3xl font-bold" style={{ color: diversColor }}>
                    {diversScore}
                  </p>
                </div>
                <div className="bg-slate-900 rounded-lg p-4 text-center">
                  <p className="text-slate-400 text-sm mb-1">Total Positions</p>
                  <p className="text-3xl font-bold text-blue-400">{items.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rebalance' && (
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-amber-500" />
                Rebalance Recommendations
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {actions.map((a, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl p-5 border ${
                      a.action === 'buy'
                        ? 'border-green-500/30 bg-green-500/5'
                        : a.action === 'sell'
                        ? 'border-red-500/30 bg-red-500/5'
                        : 'border-slate-600 bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold" style={{ color: getCategoryColor(a.category) }}>
                        {getCategoryLabel(a.category)}
                      </span>
                      <span
                        className={`flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full ${
                          a.action === 'buy'
                            ? 'bg-green-500/20 text-green-400'
                            : a.action === 'sell'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-slate-600/50 text-slate-300'
                        }`}
                      >
                        {a.action === 'buy' ? <ArrowUpRight className="w-4 h-4" /> : a.action === 'sell' ? <ArrowDownRight className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                        {a.action.toUpperCase()}
                      </span>
                    </div>
                    {a.amount > 0 && (
                      <p className="text-xl font-bold text-white mb-2">{formatCurrency(a.amount)}</p>
                    )}
                    <p className="text-sm text-slate-400">{a.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Deviation bar chart */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Allocation Deviation</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={targets.map((t) => ({ name: getCategoryLabel(t.category), deviation: t.deviation, color: getCategoryColor(t.category) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="deviation" name="Deviation %">
                    {targets.map((t, i) => (
                      <Cell key={i} fill={t.deviation >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'historical' && (
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                Historical Performance by Category
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="year" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    formatter={(value: number) => `${value.toFixed(1)}%`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="vintage" stroke={getCategoryColor('vintage')} name="Vintage" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="classic" stroke={getCategoryColor('classic')} name="Classic" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="modern" stroke={getCategoryColor('modern')} name="Modern" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="ultra_modern" stroke={getCategoryColor('ultra_modern')} name="Ultra Modern" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Historical returns table */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Year-by-Year Returns</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700">
                      <th className="text-left py-3 px-4">Year</th>
                      <th className="text-right py-3 px-4" style={{ color: getCategoryColor('vintage') }}>Vintage</th>
                      <th className="text-right py-3 px-4" style={{ color: getCategoryColor('classic') }}>Classic</th>
                      <th className="text-right py-3 px-4" style={{ color: getCategoryColor('modern') }}>Modern</th>
                      <th className="text-right py-3 px-4" style={{ color: getCategoryColor('ultra_modern') }}>Ultra Modern</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historicalData.map((row) => (
                      <tr key={row.year} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="py-3 px-4 font-medium">{row.year}</td>
                        <td className={`text-right py-3 px-4 ${row.vintage >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatPercent(row.vintage)}</td>
                        <td className={`text-right py-3 px-4 ${row.classic >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatPercent(row.classic)}</td>
                        <td className={`text-right py-3 px-4 ${row.modern >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatPercent(row.modern)}</td>
                        <td className={`text-right py-3 px-4 ${row.ultra_modern >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatPercent(row.ultra_modern)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VintageAllocation;
