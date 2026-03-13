import React, { useMemo, useState } from 'react';
import {
  X,
  PieChart,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Activity,
  BarChart3,
  Layers,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  ReturnAttribution,
  AlphaBeta,
  DrawdownAnalysis,
  SectorRotation,
  PerformanceDecomposition,
  FactorName,
  getReturnAttribution,
  getAlphaBeta,
  getDrawdownAnalysis,
  getSectorRotation,
  getPerformanceDecomposition,
  getAttributionTimeline,
  getScatterData,
  getUnderwaterData,
  getSectorWeightTimeline,
} from '../lib/portfolioAttributionService';

interface PortfolioAttributionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'attribution' | 'alphabeta' | 'drawdowns' | 'sector';
type Period = '1m' | '3m' | '6m' | '1y' | 'ytd';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'attribution', label: 'Attribution', icon: <BarChart3 size={16} /> },
  { id: 'alphabeta', label: 'Alpha/Beta', icon: <Target size={16} /> },
  { id: 'drawdowns', label: 'Drawdowns', icon: <AlertTriangle size={16} /> },
  { id: 'sector', label: 'Sector Rotation', icon: <Layers size={16} /> },
];

const PERIODS: { value: Period; label: string }[] = [
  { value: '1m', label: '1M' },
  { value: '3m', label: '3M' },
  { value: '6m', label: '6M' },
  { value: '1y', label: '1Y' },
  { value: 'ytd', label: 'YTD' },
];

const FACTOR_COLORS: Record<FactorName, string> = {
  player_performance: '#10b981',
  market_beta: '#3b82f6',
  grade_premium: '#a855f7',
  scarcity: '#f59e0b',
  sport_rotation: '#06b6d4',
  era_shift: '#ec4899',
  momentum: '#f97316',
  sentiment: '#f43f5e',
};

const FACTOR_LABELS: Record<FactorName, string> = {
  player_performance: 'Player Performance',
  market_beta: 'Market Beta',
  grade_premium: 'Grade Premium',
  scarcity: 'Scarcity',
  sport_rotation: 'Sport Rotation',
  era_shift: 'Era Shift',
  momentum: 'Momentum',
  sentiment: 'Sentiment',
};

const FACTOR_NAMES: FactorName[] = [
  'player_performance', 'market_beta', 'grade_premium', 'scarcity',
  'sport_rotation', 'era_shift', 'momentum', 'sentiment',
];

export const PortfolioAttributionModal: React.FC<PortfolioAttributionModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('attribution');
  const [period, setPeriod] = useState<Period>('1m');

  const attribution = useMemo(() => getReturnAttribution(period), [period]);
  const alphaBeta = useMemo(() => getAlphaBeta(), []);
  const drawdownAnalysis = useMemo(() => getDrawdownAnalysis(), []);
  const sectorRotation = useMemo(() => getSectorRotation(period), [period]);
  const decomposition = useMemo(() => getPerformanceDecomposition(period), [period]);
  const timeline = useMemo(() => getAttributionTimeline(), []);
  const scatterData = useMemo(() => getScatterData(), []);
  const underwaterData = useMemo(() => getUnderwaterData(), []);
  const sectorWeightTimeline = useMemo(() => getSectorWeightTimeline(), []);

  if (!isOpen) return null;

  const summaryItems = [
    { label: 'Total Return', value: `${attribution.totalReturn >= 0 ? '+' : ''}${attribution.totalReturn.toFixed(1)}%`, color: attribution.totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400' },
    { label: 'Alpha Generated', value: `${alphaBeta.alpha >= 0 ? '+' : ''}${alphaBeta.alpha.toFixed(1)}%`, color: alphaBeta.alpha >= 0 ? 'text-lime-400' : 'text-red-400' },
    { label: 'Current DD', value: `${drawdownAnalysis.currentDrawdown.toFixed(1)}%`, color: drawdownAnalysis.currentDrawdown < -5 ? 'text-red-400' : 'text-amber-400' },
    { label: 'Top Factor', value: FACTOR_LABELS[attribution.factors.sort((a, b) => b.contribution - a.contribution)[0].name], color: 'text-white' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-lime-500/10 rounded-xl">
              <PieChart size={20} className="text-lime-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Portfolio Attribution</h2>
              <p className="text-xs text-slate-400">Factor-Based Return Decomposition</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Summary Bar */}
        <div className="grid grid-cols-4 gap-4 px-6 py-3 bg-slate-800/50 border-b border-slate-700/30">
          {summaryItems.map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</div>
              <div className={`text-sm font-bold ${item.color}`}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 border-b border-slate-700/30">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-lime-400 border border-slate-700/50 border-b-transparent'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Period Selector (shared) */}
          {(activeTab === 'attribution' || activeTab === 'sector') && (
            <div className="flex gap-2 mb-6">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    period === p.value
                      ? 'bg-lime-500/20 text-lime-400 border border-lime-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700/30 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {activeTab === 'attribution' && (
            <AttributionTab attribution={attribution} timeline={timeline} />
          )}
          {activeTab === 'alphabeta' && (
            <AlphaBetaTab alphaBeta={alphaBeta} decomposition={decomposition} scatterData={scatterData} period={period} setPeriod={setPeriod} />
          )}
          {activeTab === 'drawdowns' && (
            <DrawdownsTab analysis={drawdownAnalysis} underwaterData={underwaterData} />
          )}
          {activeTab === 'sector' && (
            <SectorRotationTab rotation={sectorRotation} weightTimeline={sectorWeightTimeline} />
          )}
        </div>
      </div>
    </div>
  );
};

// ── Attribution Tab ──

function AttributionTab({ attribution, timeline }: { attribution: ReturnAttribution; timeline: any[] }) {
  return (
    <div className="space-y-6">
      {/* Stacked Bar Chart */}
      <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 size={16} className="text-lime-400" />
          Monthly Factor Contributions
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timeline} stackOffset="sign">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} interval={1} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v: number) => `${v}%`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                labelStyle={{ color: '#f8fafc' }}
                formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, FACTOR_LABELS[name as FactorName] || name]}
              />
              <ReferenceLine y={0} stroke="#64748b" />
              {FACTOR_NAMES.map((name) => (
                <Bar key={name} dataKey={name} stackId="a" fill={FACTOR_COLORS[name]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Factor Detail Table */}
      <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Activity size={16} className="text-lime-400" />
          Factor Breakdown — {attribution.period.toUpperCase()}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Factor</th>
                <th className="text-right py-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Contribution</th>
                <th className="text-right py-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Basis Pts</th>
                <th className="text-left py-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody>
              {[...attribution.factors]
                .sort((a, b) => b.contribution - a.contribution)
                .map((factor) => (
                  <tr key={factor.name} className="border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: FACTOR_COLORS[factor.name] }} />
                        <span className="text-white font-medium">{FACTOR_LABELS[factor.name]}</span>
                      </div>
                    </td>
                    <td className={`text-right py-2.5 px-3 font-bold ${factor.contribution >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {factor.contribution >= 0 ? '+' : ''}{factor.contribution.toFixed(1)}%
                    </td>
                    <td className={`text-right py-2.5 px-3 font-mono text-xs ${factor.basisPoints >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {factor.basisPoints >= 0 ? '+' : ''}{factor.basisPoints} bps
                    </td>
                    <td className="py-2.5 px-3 text-xs text-slate-400 max-w-xs">{factor.description}</td>
                  </tr>
                ))}
              <tr className="border-t border-slate-600">
                <td className="py-2.5 px-3 text-white font-bold">Residual</td>
                <td className={`text-right py-2.5 px-3 font-bold ${attribution.residual >= 0 ? 'text-slate-300' : 'text-slate-300'}`}>
                  {attribution.residual >= 0 ? '+' : ''}{attribution.residual.toFixed(1)}%
                </td>
                <td className="text-right py-2.5 px-3 font-mono text-xs text-slate-400">
                  {Math.round(attribution.residual * 100)} bps
                </td>
                <td className="py-2.5 px-3 text-xs text-slate-500">Unexplained residual return</td>
              </tr>
              <tr className="bg-slate-700/30">
                <td className="py-2.5 px-3 text-white font-bold">Total</td>
                <td className={`text-right py-2.5 px-3 font-bold text-lg ${attribution.totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {attribution.totalReturn >= 0 ? '+' : ''}{attribution.totalReturn.toFixed(1)}%
                </td>
                <td className="text-right py-2.5 px-3 font-mono text-xs text-white">
                  {Math.round(attribution.totalReturn * 100)} bps
                </td>
                <td className="py-2.5 px-3 text-xs text-slate-400">
                  vs Benchmark: {attribution.benchmarkReturn >= 0 ? '+' : ''}{attribution.benchmarkReturn.toFixed(1)}% | Active: {attribution.activeReturn >= 0 ? '+' : ''}{attribution.activeReturn.toFixed(1)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Alpha/Beta Tab ──

function AlphaBetaTab({
  alphaBeta,
  decomposition,
  scatterData,
  period,
  setPeriod,
}: {
  alphaBeta: AlphaBeta;
  decomposition: PerformanceDecomposition;
  scatterData: { portfolioReturn: number; benchmarkReturn: number; month: string }[];
  period: Period;
  setPeriod: (p: Period) => void;
}) {
  const pieData = [
    { name: 'Skill (Alpha)', value: decomposition.percentSkill, color: '#84cc16' },
    { name: 'Market (Beta)', value: decomposition.percentMarket, color: '#3b82f6' },
    { name: 'Luck', value: decomposition.percentLuck, color: '#f59e0b' },
  ];

  const metrics = [
    { label: 'Alpha', value: `${alphaBeta.alpha >= 0 ? '+' : ''}${alphaBeta.alpha.toFixed(2)}%`, color: alphaBeta.alpha >= 0 ? 'text-lime-400' : 'text-red-400', desc: 'Excess return over benchmark' },
    { label: 'Beta', value: alphaBeta.beta.toFixed(2), color: 'text-blue-400', desc: 'Market sensitivity' },
    { label: 'R-Squared', value: `${(alphaBeta.rSquared * 100).toFixed(0)}%`, color: 'text-purple-400', desc: 'Benchmark correlation' },
    { label: 'Tracking Error', value: `${alphaBeta.trackingError.toFixed(1)}%`, color: 'text-amber-400', desc: 'Return deviation from benchmark' },
    { label: 'Information Ratio', value: alphaBeta.informationRatio.toFixed(2), color: 'text-cyan-400', desc: 'Alpha per unit of risk' },
  ];

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              period === p.value
                ? 'bg-lime-500/20 text-lime-400 border border-lime-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700/30 hover:text-white'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scatter Plot */}
        <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Target size={16} className="text-lime-400" />
            Portfolio vs {alphaBeta.benchmark}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="benchmarkReturn"
                  name="Benchmark"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  label={{ value: 'Benchmark Return %', position: 'bottom', fill: '#64748b', fontSize: 10 }}
                />
                <YAxis
                  dataKey="portfolioReturn"
                  name="Portfolio"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  label={{ value: 'Portfolio Return %', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc' }}
                  formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
                />
                <ReferenceLine y={0} stroke="#475569" />
                <ReferenceLine x={0} stroke="#475569" />
                <Scatter data={scatterData} fill="#84cc16" fillOpacity={0.8} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Award size={16} className="text-lime-400" />
            Risk-Adjusted Metrics
          </h3>
          <div className="space-y-4">
            {metrics.map((m) => (
              <div key={m.label} className="flex items-center justify-between py-2 border-b border-slate-700/20">
                <div>
                  <div className="text-sm text-white font-medium">{m.label}</div>
                  <div className="text-[10px] text-slate-500">{m.desc}</div>
                </div>
                <span className={`text-lg font-bold font-mono ${m.color}`}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skill vs Luck PieChart */}
      <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <PieChart size={16} className="text-lime-400" />
          Skill vs Market vs Luck Decomposition
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`]}
                />
                <Legend
                  formatter={(value: string) => <span className="text-slate-300 text-xs">{value}</span>}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-lime-500/10 border border-lime-500/20 rounded-lg">
              <div className="text-xs text-lime-400 font-bold">Skill (Alpha)</div>
              <div className="text-2xl font-bold text-white">{decomposition.percentSkill.toFixed(0)}%</div>
              <div className="text-xs text-slate-400">Return: {decomposition.skillReturn >= 0 ? '+' : ''}{decomposition.skillReturn.toFixed(1)}%</div>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="text-xs text-blue-400 font-bold">Market (Beta)</div>
              <div className="text-2xl font-bold text-white">{decomposition.percentMarket.toFixed(0)}%</div>
              <div className="text-xs text-slate-400">Return: {decomposition.marketReturn >= 0 ? '+' : ''}{decomposition.marketReturn.toFixed(1)}%</div>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <div className="text-xs text-amber-400 font-bold">Luck / Noise</div>
              <div className="text-2xl font-bold text-white">{decomposition.percentLuck.toFixed(0)}%</div>
              <div className="text-xs text-slate-400">Return: {decomposition.luckFactor >= 0 ? '+' : ''}{decomposition.luckFactor.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Drawdowns Tab ──

function DrawdownsTab({ analysis, underwaterData }: { analysis: DrawdownAnalysis; underwaterData: { month: string; drawdown: number }[] }) {
  const metrics = [
    { label: 'Current Drawdown', value: `${analysis.currentDrawdown.toFixed(1)}%`, color: analysis.currentDrawdown < -5 ? 'text-red-400' : 'text-amber-400' },
    { label: 'Max Drawdown', value: `${analysis.maxDrawdown.toFixed(1)}%`, color: 'text-red-400' },
    { label: 'Max DD Date', value: analysis.maxDrawdownDate, color: 'text-slate-300' },
    { label: 'Avg Recovery', value: `${analysis.recoveryDays}d`, color: 'text-blue-400' },
    { label: 'Avg Drawdown', value: `${analysis.avgDrawdown.toFixed(1)}%`, color: 'text-amber-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-5 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-3 text-center">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{m.label}</div>
            <div className={`text-lg font-bold ${m.color}`}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Underwater Chart */}
      <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Activity size={16} className="text-red-400" />
          Underwater Chart (Drawdown from Peak)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={underwaterData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} interval={1} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v: number) => `${v}%`} domain={['dataMin', 0]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                formatter={(value: number) => [`${value.toFixed(2)}%`, 'Drawdown']}
              />
              <ReferenceLine y={0} stroke="#64748b" />
              <defs>
                <linearGradient id="ddGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="drawdown" stroke="#ef4444" fill="url(#ddGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Drawdown History Table */}
      <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-400" />
          Drawdown History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Start</th>
                <th className="text-left py-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">End</th>
                <th className="text-right py-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Depth</th>
                <th className="text-right py-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Recovery</th>
                <th className="text-left py-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cause</th>
              </tr>
            </thead>
            <tbody>
              {analysis.drawdowns.map((dd, i) => (
                <tr key={i} className="border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors">
                  <td className="py-2.5 px-3 text-slate-300 font-mono text-xs">{dd.startDate}</td>
                  <td className="py-2.5 px-3 text-slate-300 font-mono text-xs">{dd.endDate}</td>
                  <td className="text-right py-2.5 px-3">
                    <span className="text-red-400 font-bold">{dd.depth.toFixed(1)}%</span>
                  </td>
                  <td className="text-right py-2.5 px-3">
                    <span className="text-blue-400 font-medium">{dd.recovery}d</span>
                  </td>
                  <td className="py-2.5 px-3 text-xs text-slate-400 max-w-sm">{dd.cause}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Sector Rotation Tab ──

function SectorRotationTab({
  rotation,
  weightTimeline,
}: {
  rotation: SectorRotation;
  weightTimeline: { month: string; Basketball: number; Football: number; Baseball: number; Hockey: number; Soccer: number }[];
}) {
  const sportColors: Record<string, string> = {
    Basketball: '#f59e0b',
    Football: '#3b82f6',
    Baseball: '#ef4444',
    Hockey: '#06b6d4',
    Soccer: '#10b981',
  };

  const flowIcon = (flow: string) => {
    if (flow === 'inflow') return <ArrowUpRight size={14} className="text-emerald-400" />;
    if (flow === 'outflow') return <ArrowDownRight size={14} className="text-red-400" />;
    return <Minus size={14} className="text-slate-400" />;
  };

  const flowColor = (flow: string) => {
    if (flow === 'inflow') return 'text-emerald-400';
    if (flow === 'outflow') return 'text-red-400';
    return 'text-slate-400';
  };

  return (
    <div className="space-y-6">
      {/* Stacked Area Chart */}
      <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Layers size={16} className="text-lime-400" />
          Sector Weight Evolution
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weightTimeline} stackOffset="expand">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} interval={1} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                formatter={(value: number) => [`${(typeof value === 'number' ? value : 0).toFixed(1)}%`]}
              />
              {Object.keys(sportColors).map((sport) => (
                <Area
                  key={sport}
                  type="monotone"
                  dataKey={sport}
                  stackId="1"
                  fill={sportColors[sport]}
                  stroke={sportColors[sport]}
                  fillOpacity={0.7}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Flow Analysis Table */}
      <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-lime-400" />
          Sector Flow Analysis — {rotation.period.toUpperCase()}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sector</th>
                <th className="text-right py-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Wt Start</th>
                <th className="text-right py-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Wt End</th>
                <th className="text-right py-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Return</th>
                <th className="text-right py-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Contribution</th>
                <th className="text-center py-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Flow</th>
              </tr>
            </thead>
            <tbody>
              {rotation.sectors.map((sector) => (
                <tr key={sector.name} className="border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors">
                  <td className="py-2.5 px-3 text-white font-medium">{sector.name}</td>
                  <td className="text-right py-2.5 px-3 text-slate-300">{sector.weightStart}%</td>
                  <td className="text-right py-2.5 px-3 text-slate-300">{sector.weightEnd}%</td>
                  <td className={`text-right py-2.5 px-3 font-bold ${sector.return >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {sector.return >= 0 ? '+' : ''}{sector.return.toFixed(1)}%
                  </td>
                  <td className={`text-right py-2.5 px-3 font-bold ${sector.contribution >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {sector.contribution >= 0 ? '+' : ''}{sector.contribution.toFixed(1)}%
                  </td>
                  <td className="text-center py-2.5 px-3">
                    <div className="inline-flex items-center gap-1">
                      {flowIcon(sector.flow)}
                      <span className={`text-xs font-bold uppercase ${flowColor(sector.flow)}`}>{sector.flow}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PortfolioAttributionModal;
