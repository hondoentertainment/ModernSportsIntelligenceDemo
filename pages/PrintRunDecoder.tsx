import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  BarChart3,
  PieChart as PieIcon,
  Layers,
  TrendingUp,
  BookOpen,
  Target,
  Info,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Shield,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
  Legend,
  ZAxis,
} from 'recharts';
import {
  getAllPrintRunEstimates,
  getPrintRunEstimate,
  getScarcityScore,
  getAllScarcityScores,
  getSetAnalysis,
  getAllSetAnalyses,
  getSupplyDemandProjection,
  comparePrintRuns,
  getSubmissionTrend,
  type PrintRunEstimate,
  type ScarcityScore,
  type SetAnalysis,
  type SupplyDemandProjection,
} from '../lib/printRunDecoderService.ts';

const TABS = [
  { key: 'dashboard', label: 'Decoder Dashboard', icon: Target },
  { key: 'population', label: 'Population Analysis', icon: BarChart3 },
  { key: 'scarcity', label: 'Scarcity Matrix', icon: Layers },
  { key: 'set', label: 'Set Breakdown', icon: PieIcon },
  { key: 'supply', label: 'Supply / Demand', icon: TrendingUp },
  { key: 'methodology', label: 'Methodology', icon: BookOpen },
] as const;

type TabKey = (typeof TABS)[number]['key'];

const CHART_COLORS = ['#10b981', '#60a5fa', '#f87171', '#a78bfa', '#fbbf24', '#34d399', '#22d3ee', '#fb923c'];

// ─── Confidence Badge ────────────────────────────────────────────────────────

const ConfidenceBadge: React.FC<{ value: number }> = ({ value }) => {
  const color =
    value >= 80 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    : value >= 50 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    : 'bg-red-500/20 text-red-400 border-red-500/30';
  const icon =
    value >= 80 ? <CheckCircle className="w-3 h-3" />
    : value >= 50 ? <AlertTriangle className="w-3 h-3" />
    : <AlertTriangle className="w-3 h-3" />;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {icon} {value}%
    </span>
  );
};

// ─── Range Bar (horizontal) ─────────────────────────────────────────────────

const RangeBar: React.FC<{ low: number; median: number; high: number; maxVal: number }> = ({
  low,
  median,
  high,
  maxVal,
}) => {
  const scale = (v: number) => (v / maxVal) * 100;
  const leftPct = scale(low);
  const widthPct = scale(high - low);
  const medPct = scale(median);
  return (
    <div className="relative h-5 w-full rounded bg-slate-700/50">
      <div
        className="absolute top-0.5 bottom-0.5 rounded bg-gradient-to-r from-blue-500/40 via-blue-500/60 to-blue-500/40"
        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
      />
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-blue-400"
        style={{ left: `${medPct}%` }}
      />
      <span className="absolute left-1 top-0 text-[10px] text-slate-400 leading-5">
        {low.toLocaleString()}
      </span>
      <span
        className="absolute top-0 text-[10px] text-blue-300 font-semibold leading-5"
        style={{ left: `${medPct + 1}%` }}
      >
        {median.toLocaleString()}
      </span>
      <span className="absolute right-1 top-0 text-[10px] text-slate-400 leading-5">
        {high.toLocaleString()}
      </span>
    </div>
  );
};

// ─── Trend Icon ──────────────────────────────────────────────────────────────

const TrendIcon: React.FC<{ trend: 'up' | 'down' | 'stable' }> = ({ trend }) => {
  if (trend === 'up') return <ArrowUpRight className="w-4 h-4 text-emerald-400" />;
  if (trend === 'down') return <ArrowDownRight className="w-4 h-4 text-red-400" />;
  return <Minus className="w-4 h-4 text-slate-400" />;
};

// ─── Main Component ──────────────────────────────────────────────────────────

const PrintRunDecoder: React.FC = () => {
  const [tab, setTab] = useState<TabKey>('dashboard');
  const [loading, setLoading] = useState(true);
  const [estimates, setEstimates] = useState<PrintRunEstimate[]>([]);
  const [scarcityScores, setScarcityScores] = useState<ScarcityScore[]>([]);
  const [setAnalyses, setSetAnalyses] = useState<SetAnalysis[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedSet, setSelectedSet] = useState<string>('');

  useEffect(() => {
    try {
      setEstimates(getAllPrintRunEstimates());
      setScarcityScores(getAllScarcityScores());
      setSetAnalyses(getAllSetAnalyses());
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  // Default selections once data loads
  useEffect(() => {
    if (estimates.length > 0 && !selectedCardId) {
      setSelectedCardId(estimates[0].cardId);
    }
  }, [estimates, selectedCardId]);

  useEffect(() => {
    if (setAnalyses.length > 0 && !selectedSet) {
      setSelectedSet(setAnalyses[0].setName);
    }
  }, [setAnalyses, selectedSet]);

  const filteredEstimates = useMemo(() => {
    if (!search.trim()) return estimates;
    const q = search.toLowerCase();
    return estimates.filter(
      e =>
        e.cardName.toLowerCase().includes(q) ||
        e.player.toLowerCase().includes(q) ||
        e.set.toLowerCase().includes(q) ||
        e.parallel.toLowerCase().includes(q),
    );
  }, [estimates, search]);

  const selectedEstimate = useMemo(
    () => (selectedCardId ? getPrintRunEstimate(selectedCardId) : undefined),
    [selectedCardId],
  );

  const selectedScarcity = useMemo(
    () => (selectedCardId ? getScarcityScore(selectedCardId) : undefined),
    [selectedCardId],
  );

  const selectedProjection = useMemo(
    () => (selectedCardId ? getSupplyDemandProjection(selectedCardId) : undefined),
    [selectedCardId],
  );

  const selectedSubmissionTrend = useMemo(
    () => (selectedCardId ? getSubmissionTrend(selectedCardId) : []),
    [selectedCardId],
  );

  const currentSetAnalysis = useMemo(
    () => (selectedSet ? getSetAnalysis(selectedSet) : undefined),
    [selectedSet],
  );

  const maxEstimate = useMemo(
    () => Math.max(...estimates.map(e => e.estimatedPrintRun.high), 1),
    [estimates],
  );

  const scatterData = useMemo(
    () =>
      scarcityScores.map(s => {
        const est = estimates.find(e => e.cardId === s.cardId);
        return {
          cardId: s.cardId,
          name: est?.cardName ?? s.cardId,
          absoluteScarcity: s.absoluteScarcity,
          relativeScarcity: s.relativeScarcity,
          functionalScarcity: s.functionalScarcity,
          z: s.populationAdjusted,
        };
      }),
    [scarcityScores, estimates],
  );

  const comparisonData = useMemo(() => {
    if (!selectedCardId) return undefined;
    const ids = estimates.slice(0, 8).map(e => e.cardId);
    if (!ids.includes(selectedCardId)) ids[0] = selectedCardId;
    return comparePrintRuns(ids);
  }, [estimates, selectedCardId]);

  // ─── Loading / Error ────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Decoding print runs...</p>
        </div>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Shield className="w-7 h-7 text-blue-400" />
            Predictive Print Run Decoder
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Reverse-engineering actual print runs from population data, sales velocity &amp; statistical modeling
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="px-2 py-1 bg-slate-800 rounded">{estimates.length} cards analyzed</span>
          <span className="px-2 py-1 bg-slate-800 rounded">{setAnalyses.length} sets decoded</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-slate-800">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-t whitespace-nowrap transition-colors ${
                tab === t.key
                  ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ─── Dashboard Tab ──────────────────────────────────────────────── */}
      {tab === 'dashboard' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search cards, players, sets..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Cards Decoded', value: estimates.length, sub: 'across all sports' },
              { label: 'Avg Confidence', value: `${Math.round(estimates.reduce((s, e) => s + e.confidence, 0) / estimates.length)}%`, sub: 'weighted mean' },
              { label: 'Known Print Runs', value: estimates.filter(e => e.officialPrintRun !== null).length, sub: 'officially confirmed' },
              { label: 'Sets Analyzed', value: setAnalyses.length, sub: 'full parallel maps' },
            ].map(c => (
              <div key={c.label} className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                <p className="text-xs text-slate-500">{c.label}</p>
                <p className="text-xl font-bold text-slate-100 mt-1">{c.value}</p>
                <p className="text-[10px] text-slate-600">{c.sub}</p>
              </div>
            ))}
          </div>

          {/* Card list with range bars */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <div className="grid grid-cols-[1fr_120px_200px_80px_60px] gap-2 px-4 py-2 text-xs text-slate-500 font-medium border-b border-slate-800 hidden md:grid">
              <span>Card</span>
              <span className="text-right">Graded Pop</span>
              <span>Estimated Print Run</span>
              <span className="text-center">Confidence</span>
              <span />
            </div>
            <div className="max-h-[520px] overflow-y-auto divide-y divide-slate-800/50">
              {filteredEstimates.map(est => (
                <button
                  key={est.cardId}
                  onClick={() => { setSelectedCardId(est.cardId); setTab('population'); }}
                  className={`w-full grid grid-cols-1 md:grid-cols-[1fr_120px_200px_80px_60px] gap-2 px-4 py-3 text-left hover:bg-slate-800/40 transition-colors ${
                    selectedCardId === est.cardId ? 'bg-slate-800/60' : ''
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-slate-200 truncate">{est.cardName}</p>
                    <p className="text-[11px] text-slate-500">
                      {est.year} &middot; {est.set} &middot; {est.parallel}
                    </p>
                  </div>
                  <p className="text-sm text-slate-300 text-right tabular-nums hidden md:block self-center">
                    {est.populationData.totalGraded.toLocaleString()}
                  </p>
                  <div className="hidden md:block self-center">
                    <RangeBar
                      low={est.estimatedPrintRun.low}
                      median={est.estimatedPrintRun.median}
                      high={est.estimatedPrintRun.high}
                      maxVal={maxEstimate}
                    />
                  </div>
                  <div className="hidden md:flex justify-center self-center">
                    <ConfidenceBadge value={est.confidence} />
                  </div>
                  <div className="hidden md:flex items-center justify-end">
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Comparison bar chart */}
          {comparisonData && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Print Run Comparison</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={comparisonData.cards.map(c => ({
                    name: c.name.length > 30 ? c.name.slice(0, 28) + '...' : c.name,
                    estimated: c.estimatedRun,
                    official: c.officialRun,
                  }))}
                  layout="vertical"
                  margin={{ left: 180, right: 20, top: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 10 }} width={170} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Bar dataKey="estimated" fill="#60a5fa" name="Estimated" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="official" fill="#10b981" name="Official" radius={[0, 4, 4, 0]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ─── Population Analysis Tab ─────────────────────────────────── */}
      {tab === 'population' && selectedEstimate && (
        <div className="space-y-4">
          {/* Card selector */}
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedCardId ?? ''}
              onChange={e => setSelectedCardId(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 max-w-md"
            >
              {estimates.map(e => (
                <option key={e.cardId} value={e.cardId}>
                  {e.cardName}
                </option>
              ))}
            </select>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Total Graded', value: selectedEstimate.populationData.totalGraded.toLocaleString() },
              { label: 'Avg Grade', value: selectedEstimate.populationData.avgGrade.toFixed(1) },
              { label: 'Median Grade', value: selectedEstimate.populationData.medianGrade.toString() },
              { label: 'Survival Rate', value: `${(selectedEstimate.survivalRate * 100).toFixed(0)}%` },
              { label: 'Graded %', value: `${selectedEstimate.gradedPercent}%` },
            ].map(m => (
              <div key={m.label} className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                <p className="text-xs text-slate-500">{m.label}</p>
                <p className="text-lg font-bold text-slate-100 mt-1">{m.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Grade Distribution Histogram */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Grade Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={selectedEstimate.populationData.gradeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="grade" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis yAxisId="count" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis yAxisId="pct" orientation="right" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Bar yAxisId="count" dataKey="count" fill="#60a5fa" name="Count" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="pct" dataKey="percent" stroke="#f87171" strokeWidth={2} dot={{ r: 3 }} name="% of Total" />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Submission Timeline */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Submission Timeline</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={selectedSubmissionTrend}>
                  <defs>
                    <linearGradient id="subGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 9 }} interval={2} angle={-30} textAnchor="end" height={50} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Area type="monotone" dataKey="submissions" stroke="#10b981" fill="url(#subGrad)" name="Submissions" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Print run estimate detail */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-300">Print Run Estimate Detail</h3>
              <ConfidenceBadge value={selectedEstimate.confidence} />
            </div>
            <div className="mb-3">
              <RangeBar
                low={selectedEstimate.estimatedPrintRun.low}
                median={selectedEstimate.estimatedPrintRun.median}
                high={selectedEstimate.estimatedPrintRun.high}
                maxVal={selectedEstimate.estimatedPrintRun.high * 1.2}
              />
            </div>
            <p className="text-xs text-slate-400 mb-3">
              <span className="text-slate-300 font-medium">Methodology:</span> {selectedEstimate.methodology}
            </p>
            {selectedEstimate.officialPrintRun !== null && (
              <p className="text-xs text-emerald-400 mb-3">
                Official print run: {selectedEstimate.officialPrintRun.toLocaleString()} (confirmed)
              </p>
            )}
            <div className="space-y-2">
              {selectedEstimate.dataPoints.map((dp, i) => (
                <div key={i} className="flex items-start gap-3 text-xs">
                  <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5" />
                  <div>
                    <span className="text-slate-300 font-medium">{dp.source}</span>
                    <span className="text-slate-500"> &mdash; {dp.description}</span>
                    <span className="text-slate-600 ml-2">(weight: {(dp.weight * 100).toFixed(0)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Survival Rate Gauge */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Survival Rate</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Surviving', value: selectedEstimate.survivalRate * 100 },
                      { name: 'Lost', value: (1 - selectedEstimate.survivalRate) * 100 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    startAngle={180}
                    endAngle={0}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#334155" />
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-center text-lg font-bold text-emerald-400 -mt-6">
                {(selectedEstimate.survivalRate * 100).toFixed(0)}%
              </p>
              <p className="text-center text-xs text-slate-500 mt-1">of original print run estimated surviving</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Grading Penetration</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Graded', value: selectedEstimate.gradedPercent },
                      { name: 'Raw', value: 100 - selectedEstimate.gradedPercent },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    startAngle={180}
                    endAngle={0}
                    dataKey="value"
                  >
                    <Cell fill="#60a5fa" />
                    <Cell fill="#334155" />
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-center text-lg font-bold text-blue-400 -mt-6">
                {selectedEstimate.gradedPercent}%
              </p>
              <p className="text-center text-xs text-slate-500 mt-1">of estimated total have been professionally graded</p>
            </div>
          </div>
        </div>
      )}

      {/* ─── Scarcity Matrix Tab ─────────────────────────────────────── */}
      {tab === 'scarcity' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-1">
              Absolute vs Relative Scarcity
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Cards in the upper-right quadrant are both absolutely rare and relatively scarce within their set
            </p>
            <ResponsiveContainer width="100%" height={420}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  type="number"
                  dataKey="absoluteScarcity"
                  name="Absolute Scarcity"
                  domain={[0, 100]}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  label={{ value: 'Absolute Scarcity', position: 'bottom', fill: '#64748b', fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="relativeScarcity"
                  name="Relative Scarcity"
                  domain={[0, 100]}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  label={{ value: 'Relative Scarcity', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
                />
                <ZAxis type="number" dataKey="z" range={[40, 400]} name="Pop Adjusted" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#e2e8f0' }}
                  formatter={(value: number, name: string) => [value, name]}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.name ?? ''
                  }
                />
                <ReferenceLine x={50} stroke="#475569" strokeDasharray="4 4" />
                <ReferenceLine y={50} stroke="#475569" strokeDasharray="4 4" />
                <Scatter data={scatterData} fill="#60a5fa" fillOpacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
            {/* Quadrant labels */}
            <div className="grid grid-cols-2 gap-2 mt-2 text-[10px]">
              <div className="text-right pr-4 text-slate-500">Low Production / Common in Set</div>
              <div className="text-left pl-4 text-emerald-500 font-semibold">True Gems: Rare &amp; Undervalued</div>
              <div className="text-right pr-4 text-yellow-500">High Production / Common in Set</div>
              <div className="text-left pl-4 text-slate-500">High Production / Rare in Set Context</div>
            </div>
          </div>

          {/* Scarcity table */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <div className="grid grid-cols-[1fr_repeat(4,80px)] gap-2 px-4 py-2 text-xs text-slate-500 font-medium border-b border-slate-800 hidden md:grid">
              <span>Card</span>
              <span className="text-center">Absolute</span>
              <span className="text-center">Relative</span>
              <span className="text-center">Functional</span>
              <span className="text-center">Pop Adj.</span>
            </div>
            <div className="max-h-96 overflow-y-auto divide-y divide-slate-800/50">
              {scarcityScores
                .sort((a, b) => b.absoluteScarcity - a.absoluteScarcity)
                .map(s => {
                  const est = estimates.find(e => e.cardId === s.cardId);
                  return (
                    <div
                      key={s.cardId}
                      className="grid grid-cols-1 md:grid-cols-[1fr_repeat(4,80px)] gap-2 px-4 py-2 text-sm hover:bg-slate-800/40"
                    >
                      <p className="text-slate-200 truncate text-xs">{est?.cardName}</p>
                      {[s.absoluteScarcity, s.relativeScarcity, s.functionalScarcity, s.populationAdjusted].map(
                        (v, i) => (
                          <div key={i} className="hidden md:flex items-center justify-center">
                            <div className="w-full bg-slate-700 rounded h-2 relative">
                              <div
                                className="h-2 rounded"
                                style={{
                                  width: `${v}%`,
                                  backgroundColor:
                                    v >= 70 ? '#10b981' : v >= 40 ? '#fbbf24' : '#64748b',
                                }}
                              />
                            </div>
                            <span className="ml-1 text-[10px] text-slate-400 w-8 text-right">{v}</span>
                          </div>
                        ),
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ─── Set Breakdown Tab ───────────────────────────────────────── */}
      {tab === 'set' && (
        <div className="space-y-4">
          <select
            value={selectedSet}
            onChange={e => setSelectedSet(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          >
            {setAnalyses.map(sa => (
              <option key={sa.setName} value={sa.setName}>
                {sa.year} {sa.setName}
              </option>
            ))}
          </select>

          {currentSetAnalysis && (
            <>
              {/* Summary row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Manufacturer</p>
                  <p className="text-lg font-bold text-slate-100 mt-1">{currentSetAnalysis.manufacturer}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Base Run Est.</p>
                  <p className="text-lg font-bold text-slate-100 mt-1">{currentSetAnalysis.baseRunEstimate.toLocaleString()}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Parallel Tiers</p>
                  <p className="text-lg font-bold text-slate-100 mt-1">{currentSetAnalysis.parallelRuns.length}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Total Cards Est.</p>
                  <p className="text-lg font-bold text-slate-100 mt-1">{currentSetAnalysis.totalCardsEstimate.toLocaleString()}</p>
                </div>
              </div>

              {/* Parallel comparison bars */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Parallel Print Runs (per card)</h3>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={currentSetAnalysis.parallelRuns.map(p => ({
                      parallel: p.parallel,
                      estimatedRun: p.estimatedRun,
                      multiplier: p.multiplier,
                    }))}
                    layout="vertical"
                    margin={{ left: 150, right: 40, top: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis dataKey="parallel" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={140} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: '#e2e8f0' }}
                      formatter={(value: number, name: string) => {
                        if (name === 'Estimated Run') return [value.toLocaleString(), name];
                        return [value, name];
                      }}
                    />
                    <Bar dataKey="estimatedRun" name="Estimated Run" radius={[0, 4, 4, 0]}>
                      {currentSetAnalysis.parallelRuns.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Multiplier pie */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Parallel Share of Total Set Production</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={currentSetAnalysis.parallelRuns.map(p => ({
                        name: p.parallel,
                        value: p.estimatedRun,
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    >
                      {currentSetAnalysis.parallelRuns.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                      formatter={(value: number) => [value.toLocaleString(), 'Est. Run']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── Supply / Demand Tab ──────────────────────────────────────── */}
      {tab === 'supply' && selectedEstimate && selectedProjection && (
        <div className="space-y-4">
          <select
            value={selectedCardId ?? ''}
            onChange={e => setSelectedCardId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 max-w-md"
          >
            {estimates.map(e => (
              <option key={e.cardId} value={e.cardId}>
                {e.cardName}
              </option>
            ))}
          </select>

          {/* Supply metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Current Graded Supply', value: selectedProjection.currentSupply.toLocaleString() },
              { label: 'Projected Submissions (12m)', value: `+${selectedProjection.projectedSubmissions12M.toLocaleString()}` },
              { label: 'Est. Ungraded Remaining', value: selectedProjection.estimatedUngraded.toLocaleString() },
              { label: 'Equilibrium Price', value: `$${selectedProjection.equilibriumPrice.toLocaleString()}` },
            ].map(m => (
              <div key={m.label} className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                <p className="text-xs text-slate-500">{m.label}</p>
                <p className="text-lg font-bold text-slate-100 mt-1">{m.value}</p>
              </div>
            ))}
          </div>

          {/* Supply curve chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">
              Projected Graded Supply Over 12 Months
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart
                data={Array.from({ length: 13 }, (_, i) => {
                  const monthlyRate = selectedProjection.projectedSubmissions12M / 12;
                  const decay = Math.exp(-i * 0.08);
                  const supply = selectedProjection.currentSupply + Math.round(monthlyRate * i * decay);
                  const price = selectedProjection.equilibriumPrice * (1 + (1 - supply / (selectedProjection.currentSupply + selectedProjection.projectedSubmissions12M)) * 0.3);
                  return {
                    month: `M+${i}`,
                    supply,
                    price: Math.round(price),
                    equilibrium: selectedProjection.equilibriumPrice,
                  };
                })}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis yAxisId="supply" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis yAxisId="price" orientation="right" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Area yAxisId="supply" type="monotone" dataKey="supply" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.15} name="Graded Supply" />
                <Line yAxisId="price" type="monotone" dataKey="price" stroke="#f87171" strokeWidth={2} dot={false} name="Est. Price ($)" />
                <ReferenceLine yAxisId="price" y={selectedProjection.equilibriumPrice} stroke="#fbbf24" strokeDasharray="6 3" label={{ value: 'Equilibrium', fill: '#fbbf24', fontSize: 10 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Demand indicators */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Demand Indicators</h3>
            <div className="space-y-3">
              {selectedProjection.demandIndicators.map(d => (
                <div key={d.metric} className="flex items-center gap-3">
                  <TrendIcon trend={d.trend} />
                  <span className="text-sm text-slate-300 w-48">{d.metric}</span>
                  <div className="flex-1 bg-slate-700 rounded h-2">
                    <div
                      className="h-2 rounded"
                      style={{
                        width: `${Math.min(100, (d.value / Math.max(...selectedProjection.demandIndicators.map(x => x.value))) * 100)}%`,
                        backgroundColor: d.trend === 'up' ? '#10b981' : d.trend === 'down' ? '#f87171' : '#94a3b8',
                      }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 w-16 text-right tabular-nums">{d.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Supply breakdown pie */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Estimated Supply Breakdown</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Graded', value: selectedProjection.currentSupply },
                    { name: 'Ungraded (Est.)', value: selectedProjection.estimatedUngraded },
                    { name: 'Lost / Destroyed', value: Math.round(selectedEstimate.estimatedPrintRun.median * (1 - selectedEstimate.survivalRate)) },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                >
                  <Cell fill="#60a5fa" />
                  <Cell fill="#a78bfa" />
                  <Cell fill="#475569" />
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                  formatter={(value: number) => [value.toLocaleString(), 'Cards']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ─── Methodology Tab ──────────────────────────────────────────── */}
      {tab === 'methodology' && (
        <div className="space-y-4 max-w-3xl">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h3 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-400" />
              How We Estimate Print Runs
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Most card manufacturers do not disclose production numbers for unnumbered parallels or base
              cards. Our decoder combines multiple statistical approaches, each independently estimating
              the total print run, then merges them using a weighted confidence model.
            </p>

            {[
              {
                name: 'Capture-Recapture Modeling',
                quality: 'high' as const,
                desc: 'Adapted from wildlife population ecology. We track individual cards (via serial numbers, centering fingerprints, or unique defects) as they appear across multiple marketplaces. The Lincoln-Petersen estimator calculates total population from the overlap between "captures." Requires at least two independent observation windows.',
                weight: '25-35%',
              },
              {
                name: 'Submission Rate Extrapolation',
                quality: 'high' as const,
                desc: 'We model the percentage of any given card\'s total production that gets submitted for professional grading. Using known-print-run cards as calibration points (e.g., /199, /75 numbered cards where we know the denominator), we build sport-specific and era-specific grading rate curves. Applying these rates to unnumbered cards yields a total production estimate.',
                weight: '15-25%',
              },
              {
                name: 'Sales Velocity Analysis',
                quality: 'medium' as const,
                desc: 'Tracks how frequently a card appears for sale across eBay, COMC, MySlabs, and auction houses. Higher velocity relative to population suggests a larger total supply. We normalize for card value (expensive cards trade less frequently) and market conditions.',
                weight: '10-15%',
              },
              {
                name: 'Serial Number Gap Analysis',
                quality: 'high' as const,
                desc: 'For cards with visible serial numbers (common in Panini products), we collect observed serial numbers from marketplace listings and apply gap-sampling statistics. If the highest observed serial is N and we\'ve seen k unique serials, the estimated total is approximately N * (k+1) / k.',
                weight: '15-25%',
              },
              {
                name: 'Population Growth Curve Fitting',
                quality: 'medium' as const,
                desc: 'Grading submissions follow a predictable S-curve (logistic growth). By fitting the observed submission timeline to a logistic function, we can project the asymptotic total graded population, then divide by the estimated grading rate to get total production.',
                weight: '10-15%',
              },
              {
                name: 'Manufacturer Historical Patterns',
                quality: 'low' as const,
                desc: 'Panini, Topps, and Upper Deck have relatively consistent production ratios between parallels within a product line. By analyzing sets where print runs are known, we build manufacturer-specific multiplier tables. These are the least precise but provide useful bounds.',
                weight: '5-10%',
              },
            ].map(m => (
              <div key={m.name} className="mb-5 last:mb-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <h4 className="text-sm font-semibold text-slate-200">{m.name}</h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                      m.quality === 'high'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : m.quality === 'medium'
                        ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                        : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                    }`}
                  >
                    {m.quality} reliability
                  </span>
                  <span className="text-[10px] text-slate-500 ml-auto">Weight: {m.weight}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>

          {/* Data source quality */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">Data Source Quality Indicators</h3>
            <div className="space-y-3">
              {[
                { source: 'PSA Population Report', freshness: 'Daily', completeness: 95, reliability: 98 },
                { source: 'BGS Population Report', freshness: 'Weekly', completeness: 88, reliability: 96 },
                { source: 'SGC Population Report', freshness: 'Weekly', completeness: 72, reliability: 94 },
                { source: 'eBay Sold Listings', freshness: 'Real-time', completeness: 85, reliability: 82 },
                { source: 'COMC Inventory', freshness: 'Real-time', completeness: 60, reliability: 90 },
                { source: 'Auction House Records', freshness: 'Post-sale', completeness: 45, reliability: 95 },
                { source: 'Collector Census Surveys', freshness: 'Quarterly', completeness: 30, reliability: 65 },
              ].map(s => (
                <div key={s.source} className="flex items-center gap-3 text-xs">
                  <span className="text-slate-300 w-44 shrink-0">{s.source}</span>
                  <span className="text-slate-500 w-20 shrink-0">{s.freshness}</span>
                  <div className="flex items-center gap-1 flex-1">
                    <span className="text-slate-500 w-24 shrink-0">Completeness</span>
                    <div className="flex-1 bg-slate-700 rounded h-1.5">
                      <div
                        className="h-1.5 rounded"
                        style={{
                          width: `${s.completeness}%`,
                          backgroundColor: s.completeness >= 80 ? '#10b981' : s.completeness >= 50 ? '#fbbf24' : '#f87171',
                        }}
                      />
                    </div>
                    <span className="text-slate-400 w-8 text-right">{s.completeness}%</span>
                  </div>
                  <div className="flex items-center gap-1 flex-1">
                    <span className="text-slate-500 w-20 shrink-0">Reliability</span>
                    <div className="flex-1 bg-slate-700 rounded h-1.5">
                      <div
                        className="h-1.5 rounded"
                        style={{
                          width: `${s.reliability}%`,
                          backgroundColor: s.reliability >= 80 ? '#10b981' : s.reliability >= 50 ? '#fbbf24' : '#f87171',
                        }}
                      />
                    </div>
                    <span className="text-slate-400 w-8 text-right">{s.reliability}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Limitations */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">Known Limitations</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                Estimates for cards released within the last 6 months have wider confidence intervals due to incomplete submission data.
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                International grading services (e.g., ACE, HGA) are not yet fully integrated, which may under-count total graded population by 5-12%.
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                Vintage cards (pre-1980) have significantly lower grading rates and higher attrition, making print run estimates less reliable.
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                Capture-recapture assumes random mixing of the population, which may not hold for cards concentrated in small collector communities.
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                Manufacturer pattern matching assumes consistent production across years, but print runs can vary significantly between product releases.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintRunDecoder;
