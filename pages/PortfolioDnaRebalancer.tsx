import React, { useState, useMemo } from 'react';
import {
  Dna,
  Target,
  BarChart3,
  ArrowRightLeft,
  PlayCircle,
  Shield,
  Rocket,
  Scale,
  Banknote,
  Flame,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowUpCircle,
  ArrowDownCircle,
  Info,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';
import {
  analyzePortfolioDNA,
  getModelPortfolios,
  calculateDrift,
  suggestRebalanceTrades,
  simulateRebalance,
  getDNAScore,
  type PortfolioDNA,
  type AllocationModel,
  type DriftAnalysis,
  type RebalanceTrade,
  type SimulationResult,
  type DNAStrandKey,
} from '../lib/portfolioDnaRebalancerService';

// ─── Constants ────────────────────────────────────────────────────────────────

type TabKey = 'analysis' | 'models' | 'drift' | 'rebalance' | 'simulation';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'analysis', label: 'DNA Analysis', icon: <Dna size={16} /> },
  { key: 'models', label: 'Model Portfolios', icon: <Target size={16} /> },
  { key: 'drift', label: 'Drift Monitor', icon: <BarChart3 size={16} /> },
  { key: 'rebalance', label: 'Rebalance Plan', icon: <ArrowRightLeft size={16} /> },
  { key: 'simulation', label: 'Simulation', icon: <PlayCircle size={16} /> },
];

const PIE_COLORS = ['#84cc16', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const MODEL_ICONS: Record<string, React.ReactNode> = {
  shield: <Shield size={20} />,
  rocket: <Rocket size={20} />,
  scale: <Scale size={20} />,
  banknote: <Banknote size={20} />,
  flame: <Flame size={20} />,
};

const RISK_BADGE: Record<string, string> = {
  conservative: 'bg-blue-500/20 text-blue-400',
  moderate: 'bg-yellow-500/20 text-yellow-400',
  aggressive: 'bg-orange-500/20 text-orange-400',
  speculative: 'bg-red-500/20 text-red-400',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreBadge({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const color =
    score >= 80 ? 'text-lime-400' : score >= 60 ? 'text-yellow-400' : score >= 40 ? 'text-orange-400' : 'text-red-400';
  const ring =
    score >= 80
      ? 'ring-lime-400/30'
      : score >= 60
        ? 'ring-yellow-400/30'
        : score >= 40
          ? 'ring-orange-400/30'
          : 'ring-red-400/30';

  const dims = size === 'lg' ? 'w-20 h-20 text-2xl' : size === 'md' ? 'w-14 h-14 text-lg' : 'w-10 h-10 text-sm';

  return (
    <div
      className={`${dims} rounded-full ring-2 ${ring} flex items-center justify-center font-bold ${color} bg-slate-800`}
    >
      {score}
    </div>
  );
}

function SeverityDot({ severity }: { severity: string }) {
  const bg =
    severity === 'critical'
      ? 'bg-red-500'
      : severity === 'high'
        ? 'bg-orange-500'
        : severity === 'medium'
          ? 'bg-yellow-500'
          : 'bg-green-500';
  return <span className={`inline-block w-2 h-2 rounded-full ${bg}`} />;
}

// ─── DNA Analysis Tab ─────────────────────────────────────────────────────────

function DNAAnalysisTab({ dna }: { dna: PortfolioDNA }) {
  const radarData = dna.strands.map((s) => ({
    strand: s.label.split(' ')[0],
    score: s.healthScore,
    fullMark: 100,
  }));

  return (
    <div className="space-y-6">
      {/* Overview row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl p-5 flex items-center gap-4">
          <ScoreBadge score={dna.overallScore} size="lg" />
          <div>
            <p className="text-slate-400 text-sm">Overall DNA Score</p>
            <p className="text-slate-100 text-xl font-semibold">{dna.overallScore}/100</p>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm">Total Cards</p>
          <p className="text-slate-100 text-2xl font-bold">{dna.totalCards.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm">Portfolio Value</p>
          <p className="text-lime-400 text-2xl font-bold">${dna.totalValue.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm">DNA Strands Analyzed</p>
          <p className="text-slate-100 text-2xl font-bold">{dna.strands.length}</p>
        </div>
      </div>

      {/* Radar chart */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-slate-100 font-semibold mb-4">DNA Strand Radar</h3>
        <div className="flex justify-center">
          <ResponsiveContainer width="100%" height={340}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="strand" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
              <Radar name="Health Score" dataKey="score" stroke="#84cc16" fill="#84cc16" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strand breakdown pie charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dna.strands.map((strand) => (
          <div key={strand.key} className="bg-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-slate-100 font-medium">{strand.label}</h4>
              <ScoreBadge score={strand.healthScore} size="sm" />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={strand.allocations.map((a) => ({ name: a.label, value: a.currentPct }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {strand.allocations.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  itemStyle={{ color: '#e2e8f0' }}
                  formatter={(value: number) => [`${value}%`, 'Allocation']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 mt-2">
              {strand.allocations.map((a, idx) => (
                <div key={a.category} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-sm inline-block"
                      style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                    <span className="text-slate-400 truncate max-w-[140px]">{a.label}</span>
                  </div>
                  <span className="text-slate-100 font-medium">{a.currentPct}%</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Model Portfolios Tab ─────────────────────────────────────────────────────

function ModelPortfoliosTab({
  models,
  selectedModelId,
  onSelect,
}: {
  models: AllocationModel[];
  selectedModelId: string;
  onSelect: (id: string) => void;
}) {
  const selected = models.find((m) => m.id === selectedModelId) ?? models[0];

  return (
    <div className="space-y-6">
      {/* Model selector cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {models.map((model) => {
          const isActive = model.id === selectedModelId;
          return (
            <button
              key={model.id}
              onClick={() => onSelect(model.id)}
              className={`rounded-xl p-4 text-left transition-all border ${
                isActive
                  ? 'bg-slate-700 border-lime-500/50 ring-1 ring-lime-500/30'
                  : 'bg-slate-800 border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span style={{ color: model.color }}>{MODEL_ICONS[model.icon]}</span>
                <span className="text-slate-100 font-medium text-sm">{model.name}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${RISK_BADGE[model.riskLevel]}`}>
                {model.riskLevel}
              </span>
              <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                <span className="text-lime-400 font-medium">+{model.expectedReturn}%</span>
                <span>Vol {model.volatility}%</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected model detail */}
      <div className="bg-slate-800 rounded-xl p-6">
        <div className="flex items-start gap-4 mb-6">
          <span style={{ color: selected.color }}>{MODEL_ICONS[selected.icon]}</span>
          <div>
            <h3 className="text-slate-100 text-lg font-semibold">{selected.name}</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">{selected.description}</p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className={`px-2 py-0.5 rounded-full ${RISK_BADGE[selected.riskLevel]}`}>
                {selected.riskLevel}
              </span>
              <span className="text-slate-400">
                Expected Return: <span className="text-lime-400 font-medium">{selected.expectedReturn}%</span>
              </span>
              <span className="text-slate-400">
                Volatility: <span className="text-slate-100 font-medium">{selected.volatility}%</span>
              </span>
            </div>
          </div>
        </div>

        {/* Allocation pie charts for selected model */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.keys(selected.targets) as DNAStrandKey[]).map((strandKey) => {
            const targets = selected.targets[strandKey];
            return (
              <div key={strandKey} className="bg-slate-900 rounded-xl p-4">
                <h4 className="text-slate-300 text-sm font-medium mb-2 capitalize">
                  {strandKey === 'tier' ? 'Player Tier' : strandKey === 'grade' ? 'Grade Quality' : strandKey}
                </h4>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={targets.map((t) => ({ name: t.label, value: t.targetPct }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {targets.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                      itemStyle={{ color: '#e2e8f0' }}
                      formatter={(value: number) => [`${value}%`, 'Target']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1">
                  {targets.map((t, idx) => (
                    <div key={t.category} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-sm inline-block"
                          style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                        />
                        <span className="text-slate-400 truncate max-w-[130px]">{t.label}</span>
                      </div>
                      <span className="text-slate-100 font-medium">{t.targetPct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Drift Monitor Tab ────────────────────────────────────────────────────────

function DriftMonitorTab({ drift }: { drift: DriftAnalysis }) {
  const [filterStrand, setFilterStrand] = useState<DNAStrandKey | 'all'>('all');

  const filteredItems = useMemo(
    () => (filterStrand === 'all' ? drift.items : drift.items.filter((i) => i.strand === filterStrand)),
    [drift.items, filterStrand],
  );

  const chartData = filteredItems.map((item) => ({
    name: item.label.length > 18 ? item.label.slice(0, 16) + '...' : item.label,
    drift: item.driftPct,
    fill: item.driftPct > 0 ? '#f59e0b' : '#3b82f6',
  }));

  return (
    <div className="space-y-6">
      {/* Summary row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm">Target Model</p>
          <p className="text-slate-100 text-lg font-semibold">{drift.modelName}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm">Average Drift</p>
          <p className="text-yellow-400 text-lg font-semibold">{drift.overallDrift}%</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm">Active Alerts</p>
          <p className="text-red-400 text-lg font-semibold">{drift.alerts.length}</p>
        </div>
      </div>

      {/* Strand filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-slate-400 text-sm">Filter:</span>
        {(['all', 'sport', 'era', 'grade', 'tier', 'liquidity'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setFilterStrand(key)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filterStrand === key
                ? 'bg-lime-500/20 text-lime-400'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {key === 'all' ? 'All Strands' : key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>

      {/* Drift bar chart */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-slate-100 font-semibold mb-4">Allocation Drift (Current vs Target)</h3>
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              type="number"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              domain={['dataMin - 5', 'dataMax + 5']}
              tickFormatter={(v: number) => `${v > 0 ? '+' : ''}${v}%`}
            />
            <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={140} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
              itemStyle={{ color: '#e2e8f0' }}
              formatter={(value: number) => [`${value > 0 ? '+' : ''}${value}%`, 'Drift']}
            />
            <Bar dataKey="drift" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, idx) => (
                <Cell key={idx} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Drift alerts */}
      {drift.alerts.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-6">
          <h3 className="text-slate-100 font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-yellow-400" />
            Drift Alerts
          </h3>
          <div className="space-y-2">
            {drift.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-lg p-3 flex items-start gap-3 ${
                  alert.severity === 'critical'
                    ? 'bg-red-500/10 border border-red-500/20'
                    : alert.severity === 'warning'
                      ? 'bg-yellow-500/10 border border-yellow-500/20'
                      : 'bg-blue-500/10 border border-blue-500/20'
                }`}
              >
                <SeverityDot severity={alert.severity === 'warning' ? 'high' : alert.severity} />
                <div className="flex-1">
                  <p className="text-slate-200 text-sm">{alert.message}</p>
                  <p className="text-slate-500 text-xs mt-0.5 capitalize">{alert.strand} strand</p>
                </div>
                <span
                  className={`text-xs font-mono font-medium ${alert.driftPct > 0 ? 'text-yellow-400' : 'text-blue-400'}`}
                >
                  {alert.driftPct > 0 ? '+' : ''}
                  {alert.driftPct.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed drift table */}
      <div className="bg-slate-800 rounded-xl p-6 overflow-x-auto">
        <h3 className="text-slate-100 font-semibold mb-4">Detailed Drift Breakdown</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 text-left border-b border-slate-700">
              <th className="pb-2 font-medium">Strand</th>
              <th className="pb-2 font-medium">Category</th>
              <th className="pb-2 font-medium text-right">Current</th>
              <th className="pb-2 font-medium text-right">Target</th>
              <th className="pb-2 font-medium text-right">Drift</th>
              <th className="pb-2 font-medium text-center">Severity</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, idx) => (
              <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                <td className="py-2 text-slate-400 capitalize">{item.strand}</td>
                <td className="py-2 text-slate-200">{item.label}</td>
                <td className="py-2 text-right text-slate-300">{item.currentPct}%</td>
                <td className="py-2 text-right text-slate-300">{item.targetPct}%</td>
                <td className="py-2 text-right">
                  <span className={item.driftPct > 0 ? 'text-yellow-400' : item.driftPct < 0 ? 'text-blue-400' : 'text-green-400'}>
                    {item.driftPct > 0 ? '+' : ''}
                    {item.driftPct}%
                  </span>
                </td>
                <td className="py-2 text-center">
                  <SeverityDot severity={item.severity} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Rebalance Plan Tab ───────────────────────────────────────────────────────

function RebalancePlanTab({ trades }: { trades: RebalanceTrade[] }) {
  const [sortBy, setSortBy] = useState<'impact' | 'value' | 'urgency'>('impact');

  const sortedTrades = useMemo(() => {
    const copy = [...trades];
    if (sortBy === 'impact') return copy.sort((a, b) => b.impactScore - a.impactScore);
    if (sortBy === 'value') return copy.sort((a, b) => b.estimatedValue - a.estimatedValue);
    const urgencyOrder = { high: 3, medium: 2, low: 1 };
    return copy.sort((a, b) => urgencyOrder[b.urgency] - urgencyOrder[a.urgency]);
  }, [trades, sortBy]);

  const totalBuy = trades.filter((t) => t.action === 'buy').reduce((s, t) => s + t.estimatedValue, 0);
  const totalSell = trades.filter((t) => t.action === 'sell').reduce((s, t) => s + t.estimatedValue, 0);
  const netCost = totalBuy - totalSell;
  const avgImpact = Math.round(trades.reduce((s, t) => s + t.impactScore, 0) / trades.length);
  const highUrgencyCount = trades.filter((t) => t.urgency === 'high').length;

  const actionStyles: Record<string, string> = {
    buy: 'bg-green-500/20 text-green-400',
    sell: 'bg-red-500/20 text-red-400',
    trade: 'bg-blue-500/20 text-blue-400',
  };

  const actionIcons: Record<string, React.ReactNode> = {
    buy: <ArrowDownCircle size={18} className="text-green-400" />,
    sell: <ArrowUpCircle size={18} className="text-red-400" />,
    trade: <ArrowRightLeft size={18} className="text-blue-400" />,
  };

  const urgencyStyles: Record<string, string> = {
    high: 'bg-red-500/15 text-red-400',
    medium: 'bg-yellow-500/15 text-yellow-400',
    low: 'bg-slate-500/15 text-slate-400',
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm">Total Trades</p>
          <p className="text-slate-100 text-2xl font-bold">{trades.length}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm">Total Buys</p>
          <p className="text-green-400 text-2xl font-bold">${totalBuy.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm">Total Sells</p>
          <p className="text-red-400 text-2xl font-bold">${totalSell.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm">Net Cost</p>
          <p className={`text-2xl font-bold ${netCost > 0 ? 'text-yellow-400' : 'text-lime-400'}`}>
            {netCost > 0 ? '+' : '-'}${Math.abs(netCost).toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm">Avg Impact Score</p>
          <p className="text-lime-400 text-2xl font-bold">{avgImpact}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm">High Urgency</p>
          <p className="text-red-400 text-2xl font-bold">{highUrgencyCount}</p>
        </div>
      </div>

      {/* Sort controls */}
      <div className="flex items-center gap-3">
        <span className="text-slate-400 text-sm">Sort by:</span>
        {(['impact', 'value', 'urgency'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setSortBy(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              sortBy === key
                ? 'bg-lime-500/20 text-lime-400'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {key === 'impact' ? 'Impact Score' : key === 'value' ? 'Card Value' : 'Urgency'}
          </button>
        ))}
      </div>

      {/* Action breakdown */}
      <div className="bg-slate-800 rounded-xl p-5">
        <h3 className="text-slate-100 font-semibold mb-3">Action Breakdown</h3>
        <div className="grid grid-cols-3 gap-4">
          {(['buy', 'sell', 'trade'] as const).map((action) => {
            const count = trades.filter((t) => t.action === action).length;
            const totalVal = trades
              .filter((t) => t.action === action)
              .reduce((s, t) => s + t.estimatedValue, 0);
            const color =
              action === 'buy' ? 'text-green-400' : action === 'sell' ? 'text-red-400' : 'text-blue-400';
            const bg =
              action === 'buy'
                ? 'bg-green-500/10'
                : action === 'sell'
                  ? 'bg-red-500/10'
                  : 'bg-blue-500/10';
            return (
              <div key={action} className={`${bg} rounded-lg p-4`}>
                <p className={`${color} text-sm font-medium uppercase`}>{action}</p>
                <p className="text-slate-100 text-xl font-bold mt-1">{count} cards</p>
                <p className="text-slate-400 text-sm">${totalVal.toLocaleString()} total</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trade list */}
      <div className="space-y-3">
        {sortedTrades.map((trade, idx) => (
          <div
            key={trade.id}
            className="bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-start gap-4">
              {/* Rank & action icon */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-slate-500 text-xs font-mono">#{idx + 1}</span>
                {actionIcons[trade.action]}
              </div>

              {/* Main content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium uppercase ${actionStyles[trade.action]}`}>
                    {trade.action}
                  </span>
                  <h4 className="text-slate-100 font-medium truncate">{trade.cardName}</h4>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 flex-wrap">
                  <span>{trade.sport}</span>
                  <span className="text-slate-600">|</span>
                  <span>{trade.era}</span>
                  <span className="text-slate-600">|</span>
                  <span>{trade.grade}</span>
                  <span className="text-slate-600">|</span>
                  <span>{trade.playerTier}</span>
                </div>
                <p className="text-slate-400 text-sm mt-2">{trade.reason}</p>
              </div>

              {/* Right side stats */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="text-slate-100 font-semibold">${trade.estimatedValue.toLocaleString()}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-xs">Impact</span>
                  <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-lime-500 rounded-full"
                      style={{ width: `${trade.impactScore}%` }}
                    />
                  </div>
                  <span className="text-lime-400 text-xs font-medium">{trade.impactScore}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${urgencyStyles[trade.urgency]}`}>
                  {trade.urgency} urgency
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Simulation Tab ───────────────────────────────────────────────────────────

function SimulationTab({ simulation }: { simulation: SimulationResult }) {
  const { before, after, projectedMonths, netCostToRebalance, driftReduction, tradesApplied } = simulation;

  return (
    <div className="space-y-6">
      {/* Before / After comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Before</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <ScoreBadge score={before.overallScore} size="lg" />
            <div>
              <p className="text-slate-100 text-lg font-semibold">DNA Score: {before.overallScore}</p>
              <p className="text-slate-400 text-sm">{before.totalCards} cards / ${before.totalValue.toLocaleString()}</p>
            </div>
          </div>
          <div className="space-y-2">
            {before.strands.map((s) => (
              <div key={s.key} className="flex items-center gap-3">
                <span className="text-slate-400 text-xs w-20 truncate">{s.label}</span>
                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-500 rounded-full" style={{ width: `${s.healthScore}%` }} />
                </div>
                <span className="text-slate-400 text-xs w-8 text-right">{s.healthScore}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-5 border border-lime-500/30">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lime-400 text-sm font-medium uppercase tracking-wider">After Rebalance</span>
            <CheckCircle2 size={14} className="text-lime-400" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <ScoreBadge score={after.overallScore} size="lg" />
            <div>
              <p className="text-slate-100 text-lg font-semibold">DNA Score: {after.overallScore}</p>
              <p className="text-lime-400 text-sm">
                +{after.overallScore - before.overallScore} improvement
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {after.strands.map((s) => (
              <div key={s.key} className="flex items-center gap-3">
                <span className="text-slate-400 text-xs w-20 truncate">{s.label}</span>
                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-lime-500 rounded-full" style={{ width: `${s.healthScore}%` }} />
                </div>
                <span className="text-lime-400 text-xs w-8 text-right">{s.healthScore}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm">Trades Required</p>
          <p className="text-slate-100 text-xl font-bold">{tradesApplied}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm">Net Rebalance Cost</p>
          <p className={`text-xl font-bold ${netCostToRebalance > 0 ? 'text-yellow-400' : 'text-lime-400'}`}>
            {netCostToRebalance > 0 ? '+' : '-'}${Math.abs(netCostToRebalance).toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm">Drift Reduction</p>
          <p className="text-lime-400 text-xl font-bold">{driftReduction}%</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm">Score Improvement</p>
          <div className="flex items-center gap-2">
            <p className="text-lime-400 text-xl font-bold">+{after.overallScore - before.overallScore}</p>
            <TrendingUp size={18} className="text-lime-400" />
          </div>
        </div>
      </div>

      {/* Projected performance chart */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-slate-100 font-semibold mb-1">Projected 12-Month Performance</h3>
        <p className="text-slate-400 text-sm mb-4">Comparison of current allocation vs rebalanced portfolio vs market benchmark</p>
        <ResponsiveContainer width="100%" height={360}>
          <AreaChart data={projectedMonths} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="gradRebalanced" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#64748b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
              itemStyle={{ color: '#e2e8f0' }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
            />
            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
            <Area
              type="monotone"
              dataKey="rebalancedValue"
              name="Rebalanced"
              stroke="#84cc16"
              fill="url(#gradRebalanced)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="currentValue"
              name="Current Allocation"
              stroke="#64748b"
              fill="url(#gradCurrent)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="benchmarkValue"
              name="Market Benchmark"
              stroke="#3b82f6"
              fill="none"
              strokeWidth={1.5}
              strokeDasharray="5 5"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Risk & return comparison */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-slate-100 font-semibold mb-4">Risk & Return Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-1">Current Projected Annual Return</p>
            <p className="text-slate-100 text-xl font-bold">6.5%</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
              <Info size={12} />
              <span>Based on historical performance of current mix</span>
            </div>
          </div>
          <div className="bg-slate-900 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-1">Rebalanced Projected Return</p>
            <p className="text-lime-400 text-xl font-bold">
              {projectedMonths.length > 0
                ? `${(((projectedMonths[projectedMonths.length - 1].rebalancedValue / before.totalValue) - 1) * 100).toFixed(1)}%`
                : 'N/A'}
            </p>
            <div className="flex items-center gap-1 mt-1 text-xs text-lime-500/60">
              <TrendingUp size={12} />
              <span>Using selected model allocation targets</span>
            </div>
          </div>
          <div className="bg-slate-900 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-1">Projected 12-Month Value</p>
            <p className="text-lime-400 text-xl font-bold">
              ${projectedMonths.length > 0 ? projectedMonths[projectedMonths.length - 1].rebalancedValue.toLocaleString() : 'N/A'}
            </p>
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
              <TrendingUp size={12} />
              <span>
                +${projectedMonths.length > 0
                  ? (projectedMonths[projectedMonths.length - 1].rebalancedValue - before.totalValue).toLocaleString()
                  : '0'}{' '}
                from current
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly projection table */}
      <div className="bg-slate-800 rounded-xl p-6 overflow-x-auto">
        <h3 className="text-slate-100 font-semibold mb-4">Monthly Projection Detail</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 text-left border-b border-slate-700">
              <th className="pb-2 font-medium">Month</th>
              <th className="pb-2 font-medium text-right">Current Allocation</th>
              <th className="pb-2 font-medium text-right">Rebalanced</th>
              <th className="pb-2 font-medium text-right">Benchmark</th>
              <th className="pb-2 font-medium text-right">Rebalance Edge</th>
            </tr>
          </thead>
          <tbody>
            {projectedMonths.map((pm) => {
              const edge = pm.rebalancedValue - pm.currentValue;
              return (
                <tr key={pm.month} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="py-2 text-slate-300">{pm.month}</td>
                  <td className="py-2 text-right text-slate-400">${pm.currentValue.toLocaleString()}</td>
                  <td className="py-2 text-right text-lime-400">${pm.rebalancedValue.toLocaleString()}</td>
                  <td className="py-2 text-right text-blue-400">${pm.benchmarkValue.toLocaleString()}</td>
                  <td className="py-2 text-right">
                    <span className={edge > 0 ? 'text-lime-400' : 'text-red-400'}>
                      {edge > 0 ? '+' : ''}${edge.toLocaleString()}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Strand-by-strand improvement table */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-slate-100 font-semibold mb-4">Strand-by-Strand Improvement</h3>
        <div className="space-y-3">
          {before.strands.map((beforeStrand) => {
            const afterStrand = after.strands.find((s) => s.key === beforeStrand.key);
            if (!afterStrand) return null;
            const delta = afterStrand.healthScore - beforeStrand.healthScore;
            return (
              <div key={beforeStrand.key} className="flex items-center gap-4">
                <span className="text-slate-300 text-sm w-28">{beforeStrand.label}</span>
                <div className="flex-1 flex items-center gap-3">
                  <span className="text-slate-500 text-sm w-8 text-right">{beforeStrand.healthScore}</span>
                  <ChevronRight size={14} className="text-slate-600" />
                  <span className="text-lime-400 text-sm w-8">{afterStrand.healthScore}</span>
                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden relative">
                    <div
                      className="absolute h-full bg-slate-600 rounded-full"
                      style={{ width: `${beforeStrand.healthScore}%` }}
                    />
                    <div
                      className="absolute h-full bg-lime-500 rounded-full opacity-60"
                      style={{ width: `${afterStrand.healthScore}%` }}
                    />
                  </div>
                </div>
                <span className="text-lime-400 text-xs font-medium w-10 text-right">+{delta}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

const PortfolioDnaRebalancer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('analysis');
  const [selectedModelId, setSelectedModelId] = useState<string>('balanced_all_era');

  // Compute all data upfront (cheap with mock data)
  const dna = useMemo(() => analyzePortfolioDNA(), []);
  const models = useMemo(() => getModelPortfolios(), []);
  const drift = useMemo(() => calculateDrift(selectedModelId), [selectedModelId]);
  const trades = useMemo(() => suggestRebalanceTrades(selectedModelId), [selectedModelId]);
  const simulation = useMemo(() => simulateRebalance(selectedModelId), [selectedModelId]);
  const dnaScore = useMemo(() => getDNAScore(selectedModelId), [selectedModelId]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-lime-500/10 rounded-lg">
            <Dna size={28} className="text-lime-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100">Portfolio DNA Rebalancer</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Analyze your collection's genetic makeup and rebalance toward optimal allocation models
            </p>
          </div>
        </div>

        {/* Quick stats bar */}
        <div className="flex items-center gap-6 mt-4 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">DNA Score:</span>
            <span className="text-lime-400 font-semibold">{dna.overallScore}/100</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Model Fit:</span>
            <span className="text-yellow-400 font-semibold">{dnaScore}/100</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Avg Drift:</span>
            <span className="text-yellow-400 font-semibold">{drift.overallDrift}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Alerts:</span>
            <span className={`font-semibold ${drift.alerts.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {drift.alerts.length}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-800 rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-lime-500/15 text-lime-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'analysis' && <DNAAnalysisTab dna={dna} />}
      {activeTab === 'models' && (
        <ModelPortfoliosTab models={models} selectedModelId={selectedModelId} onSelect={setSelectedModelId} />
      )}
      {activeTab === 'drift' && <DriftMonitorTab drift={drift} />}
      {activeTab === 'rebalance' && <RebalancePlanTab trades={trades} />}
      {activeTab === 'simulation' && <SimulationTab simulation={simulation} />}
    </div>
  );
};

export default PortfolioDnaRebalancer;
