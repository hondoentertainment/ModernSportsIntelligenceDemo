import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Layers,
  RefreshCw,
  GitCompare,
  FlaskConical,
  Plus,
  ChevronRight,
  Calendar,
  Target,
  Shield,
  Activity,
  DollarSign,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  FileText,
  Loader2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Legend,
} from 'recharts';
import {
  getIndices,
  getIndexDetail,
  getIndexPerformance,
  getRebalanceHistory,
  compareIndices,
  backtestIndex,
  getIndexConstituents,
  createCustomIndex,
  getIndexMethodology,
  type CardIndex,
  type IndexConstituent,
  type IndexPerformance,
  type IndexMethodology,
  type RebalanceEvent,
  type IndexComparison,
  type BacktestResult,
} from '../lib/analytics/grailIndexService';

// ---- Constants ----

type TabKey = 'gallery' | 'deep-dive' | 'builder' | 'rebalance' | 'comparison' | 'backtest';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'gallery', label: 'Index Gallery', icon: <Layers size={16} /> },
  { key: 'deep-dive', label: 'Index Deep Dive', icon: <BarChart3 size={16} /> },
  { key: 'builder', label: 'Index Builder', icon: <Plus size={16} /> },
  { key: 'rebalance', label: 'Rebalance Log', icon: <RefreshCw size={16} /> },
  { key: 'comparison', label: 'Comparison', icon: <GitCompare size={16} /> },
  { key: 'backtest', label: 'Backtest Lab', icon: <FlaskConical size={16} /> },
];

const SPORT_COLORS: Record<string, string> = {
  baseball: '#ef4444',
  basketball: '#f97316',
  football: '#3b82f6',
  hockey: '#06b6d4',
  soccer: '#22c55e',
  multi: '#a855f7',
};

const INDEX_COLORS = ['#84cc16', '#f97316', '#3b82f6', '#ef4444', '#a855f7', '#06b6d4'];

const PIE_COLORS = ['#ef4444', '#f97316', '#3b82f6', '#06b6d4', '#22c55e', '#a855f7', '#eab308', '#ec4899'];

// ---- Helpers ----

function fmt$(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

function fmtPct(v: number): string {
  const sign = v >= 0 ? '+' : '';
  return `${sign}${v.toFixed(2)}%`;
}

function returnColor(v: number): string {
  if (v >= 5) return 'text-emerald-400';
  if (v > 0) return 'text-green-400';
  if (v === 0) return 'text-slate-400';
  if (v > -5) return 'text-red-400';
  return 'text-red-500';
}

function heatColor(v: number): string {
  if (v >= 8) return 'bg-emerald-500';
  if (v >= 5) return 'bg-emerald-600/80';
  if (v >= 2) return 'bg-green-600/70';
  if (v >= 0) return 'bg-green-800/50';
  if (v >= -2) return 'bg-red-900/50';
  if (v >= -5) return 'bg-red-700/70';
  if (v >= -8) return 'bg-red-600/80';
  return 'bg-red-500';
}

function heatText(v: number): string {
  if (v >= 5 || v <= -5) return 'text-white';
  return 'text-slate-300';
}

function corrColor(v: number): string {
  if (v >= 0.8) return 'bg-emerald-500/80';
  if (v >= 0.6) return 'bg-emerald-700/60';
  if (v >= 0.4) return 'bg-yellow-600/50';
  if (v >= 0.2) return 'bg-orange-700/40';
  return 'bg-red-700/40';
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ---- Mini Sparkline ----

const Sparkline: React.FC<{ data: { value: number }[]; color?: string; width?: number; height?: number }> = ({
  data,
  color = '#84cc16',
  width = 120,
  height = 40,
}) => {
  if (data.length < 2) return null;
  const vals = data.map((d) => d.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const points = vals
    .map((v, i) => {
      const x = (i / (vals.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg width={width} height={height} className="flex-shrink-0">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
};

// ---- Loading Skeleton ----

const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-700/50 rounded ${className}`} />
);

const LoadingOverlay: React.FC = () => (
  <div className="flex items-center justify-center py-20">
    <Loader2 className="animate-spin text-brand-lime" size={32} />
    <span className="ml-3 text-slate-400 text-sm">Loading index data...</span>
  </div>
);

// ---- Tab: Index Gallery ----

const IndexGallery: React.FC<{
  indices: CardIndex[];
  onSelect: (id: string) => void;
}> = ({ indices, onSelect }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
    {indices.map((idx, i) => {
      const ts = idx.performance.timeSeries;
      const sparkData = ts.slice(-24).map((p) => ({ value: p.value }));
      const up = idx.performance.returns1Y >= 0;
      return (
        <button
          key={idx.id}
          onClick={() => onSelect(idx.id)}
          className="text-left bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 hover:border-brand-lime/40 hover:bg-slate-800/80 transition-all group"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-white font-bold text-lg group-hover:text-brand-lime transition-colors">
                {idx.name}
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                {idx.constituents.length} constituents &middot; {idx.weightingMethod} weighted
              </p>
            </div>
            <div
              className={`flex items-center gap-1 text-sm font-bold ${up ? 'text-emerald-400' : 'text-red-400'}`}
            >
              {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {fmtPct(idx.performance.returns1Y)}
            </div>
          </div>

          <p className="text-slate-400 text-xs leading-relaxed mb-4 line-clamp-2">{idx.description}</p>

          <div className="flex items-end justify-between">
            <Sparkline data={sparkData} color={INDEX_COLORS[i % INDEX_COLORS.length]} />
            <div className="text-right">
              <div className="text-white text-sm font-semibold">{fmt$(idx.totalValue)}</div>
              <div className="text-slate-500 text-[10px] uppercase tracking-wider">Total Value</div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-700/40">
            {[
              { label: 'Sharpe', val: idx.performance.sharpeRatio.toFixed(2) },
              { label: 'Vol', val: `${idx.performance.volatility.toFixed(1)}%` },
              { label: 'Max DD', val: `${idx.performance.maxDrawdown.toFixed(1)}%` },
              { label: 'Alpha', val: `${idx.performance.alpha >= 0 ? '+' : ''}${idx.performance.alpha.toFixed(1)}%` },
            ].map((m) => (
              <div key={m.label} className="text-center">
                <div className="text-slate-300 text-xs font-medium">{m.val}</div>
                <div className="text-slate-600 text-[9px] uppercase">{m.label}</div>
              </div>
            ))}
          </div>
        </button>
      );
    })}
  </div>
);

// ---- Tab: Deep Dive ----

const IndexDeepDive: React.FC<{
  indices: CardIndex[];
  selectedId: string;
  onSelectId: (id: string) => void;
}> = ({ indices, selectedId, onSelectId }) => {
  const [perf, setPerf] = useState<IndexPerformance | null>(null);
  const [period, setPeriod] = useState<'1M' | '3M' | '6M' | '1Y' | '3Y' | 'MAX'>('MAX');
  const [loading, setLoading] = useState(true);

  const idx = useMemo(() => indices.find((i) => i.id === selectedId), [indices, selectedId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getIndexPerformance(selectedId, period).then((p) => {
      if (!cancelled) {
        setPerf(p);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [selectedId, period]);

  const sportBreakdown = useMemo(() => {
    if (!idx) return [];
    const map: Record<string, number> = {};
    for (const c of idx.constituents) {
      map[c.sport] = (map[c.sport] ?? 0) + c.weight;
    }
    return Object.entries(map)
      .map(([sport, weight]) => ({ sport, weight: Math.round(weight * 100) / 100 }))
      .sort((a, b) => b.weight - a.weight);
  }, [idx]);

  if (!idx) return <div className="text-slate-400 py-10 text-center">Select an index from the gallery.</div>;

  return (
    <div className="space-y-6">
      {/* Selector */}
      <div className="flex items-center gap-3 flex-wrap">
        {indices.map((ind) => (
          <button
            key={ind.id}
            onClick={() => onSelectId(ind.id)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
              ind.id === selectedId
                ? 'bg-brand-lime/20 border-brand-lime/40 text-brand-lime'
                : 'bg-slate-800/60 border-slate-700/40 text-slate-400 hover:text-white hover:border-slate-600'
            }`}
          >
            {ind.name}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-2xl font-black text-white">{idx.name}</h2>
            <p className="text-slate-400 text-sm mt-1">{idx.description}</p>
          </div>
          <div className="text-right">
            <div className="text-white text-2xl font-bold">{fmt$(idx.totalValue)}</div>
            <div className="text-slate-500 text-xs">Index NAV</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 mt-5">
          {[
            { label: '1M', val: idx.performance.returns1M },
            { label: '3M', val: idx.performance.returns3M },
            { label: '6M', val: idx.performance.returns6M },
            { label: '1Y', val: idx.performance.returns1Y },
            { label: 'Inception', val: idx.performance.returnsInception },
            { label: 'Sharpe', val: idx.performance.sharpeRatio, fmt: (v: number) => v.toFixed(2) },
            { label: 'Beta', val: idx.performance.beta, fmt: (v: number) => v.toFixed(2) },
            { label: 'Max DD', val: idx.performance.maxDrawdown },
          ].map((m) => (
            <div key={m.label} className="text-center">
              <div className={`text-sm font-bold ${returnColor(m.val)}`}>
                {m.fmt ? m.fmt(m.val) : fmtPct(m.val)}
              </div>
              <div className="text-slate-600 text-[10px] uppercase tracking-wider mt-0.5">{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* NAV Chart */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <Activity size={14} className="text-brand-lime" />
            NAV Performance vs. Benchmark
          </h3>
          <div className="flex gap-1">
            {(['1M', '3M', '6M', '1Y', '3Y', 'MAX'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-2 py-1 text-[10px] font-bold rounded ${
                  p === period
                    ? 'bg-brand-lime/20 text-brand-lime'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : perf ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={perf.timeSeries}>
              <defs>
                <linearGradient id="navGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#84cc16" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#84cc16" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                tick={{ fontSize: 10 }}
                tickFormatter={(d: string) => d.slice(0, 7)}
              />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={(v: number) => fmt$(v)} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#94a3b8' }}
                formatter={(v: number) => [fmt$(v), '']}
              />
              <Area type="monotone" dataKey="value" stroke="#84cc16" fill="url(#navGrad)" strokeWidth={2} name="Index" />
              <Line type="monotone" dataKey="benchmark" stroke="#64748b" strokeDasharray="4 4" dot={false} name="Benchmark" />
            </AreaChart>
          </ResponsiveContainer>
        ) : null}
      </div>

      {/* Bottom Row: Constituents + Sport Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Constituents Table */}
        <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 overflow-x-auto">
          <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
            <Layers size={14} className="text-brand-lime" />
            Constituents ({idx.constituents.length})
          </h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 uppercase tracking-wider border-b border-slate-700/50">
                <th className="pb-2 text-left font-medium">Card</th>
                <th className="pb-2 text-left font-medium">Player</th>
                <th className="pb-2 text-left font-medium">Sport</th>
                <th className="pb-2 text-right font-medium">Weight</th>
                <th className="pb-2 text-right font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {idx.constituents.slice(0, 15).map((c) => (
                <tr key={c.cardId} className="border-b border-slate-700/20 hover:bg-slate-700/20">
                  <td className="py-2 text-slate-300 font-medium">{c.cardName}</td>
                  <td className="py-2 text-slate-400">{c.player}</td>
                  <td className="py-2">
                    <span
                      className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase"
                      style={{ backgroundColor: `${SPORT_COLORS[c.sport]}20`, color: SPORT_COLORS[c.sport] }}
                    >
                      {c.sport}
                    </span>
                  </td>
                  <td className="py-2 text-right text-white font-semibold">{c.weight.toFixed(1)}%</td>
                  <td className="py-2 text-right text-slate-300">{fmt$(c.currentValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {idx.constituents.length > 15 && (
            <p className="text-slate-600 text-[10px] mt-2 text-center">
              Showing 15 of {idx.constituents.length} constituents
            </p>
          )}

          {/* Stacked Weight Bar */}
          <div className="mt-4">
            <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Weight Distribution</p>
            <div className="flex h-4 rounded-full overflow-hidden">
              {idx.constituents.map((c, i) => (
                <div
                  key={c.cardId}
                  style={{
                    width: `${c.weight}%`,
                    backgroundColor: INDEX_COLORS[i % INDEX_COLORS.length],
                    opacity: 0.8,
                  }}
                  title={`${c.player}: ${c.weight.toFixed(1)}%`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Sport Breakdown Pie */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
          <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
            <PieChartIcon size={14} className="text-brand-lime" />
            Sport Allocation
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={sportBreakdown}
                dataKey="weight"
                nameKey="sport"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                strokeWidth={0}
              >
                {sportBreakdown.map((entry) => (
                  <Cell key={entry.sport} fill={SPORT_COLORS[entry.sport] ?? '#6b7280'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
                formatter={(v: number) => [`${v.toFixed(1)}%`, 'Weight']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {sportBreakdown.map((s) => (
              <div key={s.sport} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SPORT_COLORS[s.sport] }} />
                  <span className="text-slate-300 capitalize">{s.sport}</span>
                </div>
                <span className="text-white font-semibold">{s.weight.toFixed(1)}%</span>
              </div>
            ))}
          </div>

          {/* Methodology Card */}
          <div className="mt-6 pt-4 border-t border-slate-700/40">
            <h4 className="text-white font-bold text-xs mb-2 flex items-center gap-1.5">
              <FileText size={12} className="text-brand-lime" />
              Methodology
            </h4>
            <div className="space-y-2 text-[11px]">
              <div>
                <span className="text-slate-500">Weighting:</span>{' '}
                <span className="text-slate-300 capitalize">{idx.weightingMethod}</span>
              </div>
              <div>
                <span className="text-slate-500">Rebalance:</span>{' '}
                <span className="text-slate-300 capitalize">{idx.rebalanceFrequency}</span>
              </div>
              <div>
                <span className="text-slate-500">Last:</span>{' '}
                <span className="text-slate-300">{idx.lastRebalance}</span>
              </div>
              <div>
                <span className="text-slate-500">Next:</span>{' '}
                <span className="text-slate-300">{idx.nextRebalance}</span>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Selection Criteria</p>
              <ul className="space-y-1">
                {idx.methodology.selectionCriteria.map((c, i) => (
                  <li key={i} className="text-slate-400 text-[10px] flex items-start gap-1.5">
                    <ChevronRight size={8} className="mt-0.5 text-brand-lime flex-shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---- Tab: Index Builder ----

const IndexBuilder: React.FC = () => {
  const [name, setName] = useState('');
  const [objectives, setObjectives] = useState('');
  const [universe, setUniverse] = useState('all-graded');
  const [weighting, setWeighting] = useState<'market-cap' | 'equal' | 'fundamental' | 'custom'>('equal');
  const [rebalance, setRebalance] = useState<'monthly' | 'quarterly' | 'annually'>('quarterly');
  const [sports, setSports] = useState<string[]>(['baseball', 'basketball', 'football', 'hockey']);
  const [minValue, setMinValue] = useState('10000');
  const [maxConstituents, setMaxConstituents] = useState('25');
  const [criteria, setCriteria] = useState<string[]>(['HOF player or active All-Star', 'PSA 8 or higher']);
  const [newCriterion, setNewCriterion] = useState('');
  const [preview, setPreview] = useState<CardIndex | null>(null);
  const [building, setBuilding] = useState(false);

  const toggleSport = useCallback((sport: string) => {
    setSports((prev) => (prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]));
  }, []);

  const addCriterion = useCallback(() => {
    if (newCriterion.trim()) {
      setCriteria((prev) => [...prev, newCriterion.trim()]);
      setNewCriterion('');
    }
  }, [newCriterion]);

  const removeCriterion = useCallback((idx: number) => {
    setCriteria((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleBuild = useCallback(async () => {
    setBuilding(true);
    const methodology: IndexMethodology = {
      objectives: objectives || `Custom index: ${name}`,
      universe: universe === 'all-graded' ? 'All professionally graded sports cards' : 'Modern chrome/prizm cards (2000+)',
      selectionCriteria: criteria,
      weightingRules: [`${weighting} weighting with ${maxConstituents}-card cap`],
      rebalancingRules: [`${rebalance} reconstitution`],
      exclusionCriteria: ['Cards with known authenticity issues'],
    };
    const result = await createCustomIndex(methodology);
    setPreview(result);
    setBuilding(false);
  }, [name, objectives, universe, weighting, rebalance, criteria, maxConstituents]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Builder Form */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-5">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          <Plus size={18} className="text-brand-lime" />
          Build Custom Index
        </h3>

        <div>
          <label className="text-slate-400 text-xs font-medium uppercase tracking-wider block mb-1">Index Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Custom Index"
            className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-lime/40"
          />
        </div>

        <div>
          <label className="text-slate-400 text-xs font-medium uppercase tracking-wider block mb-1">Investment Objective</label>
          <textarea
            value={objectives}
            onChange={(e) => setObjectives(e.target.value)}
            placeholder="Describe the goal of this index..."
            rows={2}
            className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-lime/40 resize-none"
          />
        </div>

        <div>
          <label className="text-slate-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Universe</label>
          <div className="flex gap-2">
            {[
              { val: 'all-graded', label: 'All Graded Cards' },
              { val: 'modern-chrome', label: 'Modern Chrome/Prizm' },
              { val: 'vintage', label: 'Vintage (Pre-1980)' },
            ].map((u) => (
              <button
                key={u.val}
                onClick={() => setUniverse(u.val)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  universe === u.val
                    ? 'bg-brand-lime/20 border-brand-lime/40 text-brand-lime'
                    : 'bg-slate-900/40 border-slate-700/40 text-slate-400 hover:border-slate-600'
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-slate-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Sports Filter</label>
          <div className="flex gap-2 flex-wrap">
            {['baseball', 'basketball', 'football', 'hockey', 'soccer'].map((s) => (
              <button
                key={s}
                onClick={() => toggleSport(s)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all capitalize ${
                  sports.includes(s)
                    ? 'border-brand-lime/40 text-white'
                    : 'bg-slate-900/40 border-slate-700/40 text-slate-600 hover:border-slate-600'
                }`}
                style={sports.includes(s) ? { backgroundColor: `${SPORT_COLORS[s]}30`, borderColor: `${SPORT_COLORS[s]}60` } : {}}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-slate-400 text-xs font-medium uppercase tracking-wider block mb-1">Weighting</label>
            <select
              value={weighting}
              onChange={(e) => setWeighting(e.target.value as typeof weighting)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-lime/40"
            >
              <option value="equal">Equal Weight</option>
              <option value="market-cap">Market Cap</option>
              <option value="fundamental">Fundamental</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div>
            <label className="text-slate-400 text-xs font-medium uppercase tracking-wider block mb-1">Rebalance</label>
            <select
              value={rebalance}
              onChange={(e) => setRebalance(e.target.value as typeof rebalance)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-lime/40"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-slate-400 text-xs font-medium uppercase tracking-wider block mb-1">Min Value ($)</label>
            <input
              type="number"
              value={minValue}
              onChange={(e) => setMinValue(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-lime/40"
            />
          </div>
          <div>
            <label className="text-slate-400 text-xs font-medium uppercase tracking-wider block mb-1">Max Constituents</label>
            <input
              type="number"
              value={maxConstituents}
              onChange={(e) => setMaxConstituents(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-lime/40"
            />
          </div>
        </div>

        <div>
          <label className="text-slate-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Selection Criteria</label>
          <div className="space-y-1.5 mb-2">
            {criteria.map((c, i) => (
              <div key={i} className="flex items-center gap-2 bg-slate-900/40 rounded-lg px-3 py-1.5">
                <ChevronRight size={10} className="text-brand-lime flex-shrink-0" />
                <span className="text-slate-300 text-xs flex-1">{c}</span>
                <button onClick={() => removeCriterion(i)} className="text-slate-600 hover:text-red-400">
                  <Minus size={12} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCriterion}
              onChange={(e) => setNewCriterion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCriterion()}
              placeholder="Add criterion..."
              className="flex-1 bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-lime/40"
            />
            <button
              onClick={addCriterion}
              className="px-3 py-1.5 bg-brand-lime/20 text-brand-lime text-xs font-bold rounded-lg border border-brand-lime/30 hover:bg-brand-lime/30 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        <button
          onClick={handleBuild}
          disabled={building || !name.trim()}
          className="w-full py-3 bg-brand-lime/20 text-brand-lime text-sm font-black uppercase tracking-widest rounded-xl border border-brand-lime/30 hover:bg-brand-lime/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {building ? <Loader2 size={16} className="animate-spin" /> : <FlaskConical size={16} />}
          {building ? 'Building Index...' : 'Build & Preview'}
        </button>
      </div>

      {/* Preview */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
        <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
          <Target size={14} className="text-brand-lime" />
          Real-Time Preview
        </h3>
        {preview ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-bold text-lg">{name || 'Custom Index'}</h4>
                <p className="text-slate-500 text-xs">{preview.constituents.length} constituents &middot; {weighting} weighted</p>
              </div>
              <div className="text-right">
                <div className="text-white text-lg font-bold">{fmt$(preview.totalValue)}</div>
                <div className="text-slate-500 text-[10px] uppercase">Estimated NAV</div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={preview.performance.timeSeries}>
                <defs>
                  <linearGradient id="prevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#84cc16" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#84cc16" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 9 }} tickFormatter={(d: string) => d.slice(5, 7)} />
                <YAxis stroke="#64748b" tick={{ fontSize: 9 }} tickFormatter={(v: number) => fmt$(v)} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
                  formatter={(v: number) => [fmt$(v), 'NAV']}
                />
                <Area type="monotone" dataKey="value" stroke="#84cc16" fill="url(#prevGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>

            <div>
              <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-2">Preview Constituents</p>
              <div className="space-y-1.5">
                {preview.constituents.slice(0, 8).map((c) => (
                  <div key={c.cardId} className="flex items-center justify-between text-xs bg-slate-900/40 rounded-lg px-3 py-1.5">
                    <div>
                      <span className="text-slate-300 font-medium">{c.player}</span>
                      <span className="text-slate-600 ml-2">{c.cardName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">{c.weight.toFixed(1)}%</span>
                      <span className="text-white font-medium">{fmt$(c.currentValue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/40 rounded-lg p-3">
              <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1.5">Configuration Summary</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-slate-500">Universe:</span> <span className="text-slate-300">{universe}</span></div>
                <div><span className="text-slate-500">Sports:</span> <span className="text-slate-300">{sports.join(', ')}</span></div>
                <div><span className="text-slate-500">Weighting:</span> <span className="text-slate-300 capitalize">{weighting}</span></div>
                <div><span className="text-slate-500">Rebalance:</span> <span className="text-slate-300 capitalize">{rebalance}</span></div>
                <div><span className="text-slate-500">Min Value:</span> <span className="text-slate-300">${parseInt(minValue).toLocaleString()}</span></div>
                <div><span className="text-slate-500">Max Cards:</span> <span className="text-slate-300">{maxConstituents}</span></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-700/40 flex items-center justify-center mb-4">
              <FlaskConical size={28} className="text-slate-600" />
            </div>
            <p className="text-slate-500 text-sm">Configure your index parameters and click "Build & Preview" to see a real-time simulation.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ---- Tab: Rebalance Log ----

const RebalanceLog: React.FC<{ indices: CardIndex[] }> = ({ indices }) => {
  const [selectedId, setSelectedId] = useState(indices[0]?.id ?? '');
  const [events, setEvents] = useState<RebalanceEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getRebalanceHistory(selectedId).then((e) => {
      if (!cancelled) {
        setEvents(e);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        {indices.map((ind) => (
          <button
            key={ind.id}
            onClick={() => setSelectedId(ind.id)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
              ind.id === selectedId
                ? 'bg-brand-lime/20 border-brand-lime/40 text-brand-lime'
                : 'bg-slate-800/60 border-slate-700/40 text-slate-400 hover:text-white hover:border-slate-600'
            }`}
          >
            {ind.name}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingOverlay />
      ) : (
        <div className="space-y-4">
          {events
            .slice()
            .reverse()
            .map((evt) => {
              const totalChanges = evt.additions.length + evt.removals.length + evt.weightChanges.length;
              return (
                <div key={evt.date} className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-lime/20 flex items-center justify-center">
                        <Calendar size={14} className="text-brand-lime" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm">{evt.date}</h4>
                        <p className="text-slate-500 text-[10px]">
                          {totalChanges} changes &middot; {evt.turnover.toFixed(1)}% turnover
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      {evt.additions.length > 0 && (
                        <span className="text-emerald-400 text-xs font-bold">+{evt.additions.length} added</span>
                      )}
                      {evt.removals.length > 0 && (
                        <span className="text-red-400 text-xs font-bold">-{evt.removals.length} removed</span>
                      )}
                      <span className="text-blue-400 text-xs font-bold">{evt.weightChanges.length} reweighted</span>
                    </div>
                  </div>

                  {evt.additions.length > 0 && (
                    <div className="mb-3">
                      <p className="text-emerald-400/70 text-[10px] uppercase tracking-wider mb-1 font-bold">Additions</p>
                      {evt.additions.map((a, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs py-1">
                          <Plus size={10} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-300">{a.reason}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {evt.removals.length > 0 && (
                    <div className="mb-3">
                      <p className="text-red-400/70 text-[10px] uppercase tracking-wider mb-1 font-bold">Removals</p>
                      {evt.removals.map((r, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs py-1">
                          <Minus size={10} className="text-red-400 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-300">{r.reason}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <p className="text-blue-400/70 text-[10px] uppercase tracking-wider mb-1 font-bold">Weight Adjustments</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {evt.weightChanges.slice(0, 4).map((w, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs py-1 bg-slate-900/30 rounded px-2">
                          <RefreshCw size={9} className="text-blue-400 flex-shrink-0" />
                          <span className="text-slate-500">{w.oldWeight}%</span>
                          <span className="text-slate-600">&rarr;</span>
                          <span className={w.newWeight > w.oldWeight ? 'text-emerald-400' : 'text-red-400'}>
                            {w.newWeight}%
                          </span>
                          <span className="text-slate-600 text-[10px] truncate flex-1">{w.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

// ---- Tab: Comparison ----

const ComparisonTab: React.FC<{ indices: CardIndex[] }> = ({ indices }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([indices[0]?.id ?? '', indices[1]?.id ?? '']);
  const [comparison, setComparison] = useState<IndexComparison | null>(null);
  const [loading, setLoading] = useState(true);

  const toggleIndex = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        if (prev.includes(id)) return prev.filter((x) => x !== id);
        if (prev.length >= 6) return prev;
        return [...prev, id];
      });
    },
    [],
  );

  useEffect(() => {
    if (selectedIds.length < 2) {
      setComparison(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    compareIndices(selectedIds).then((c) => {
      if (!cancelled) {
        setComparison(c);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [selectedIds]);

  const selectedIndices = useMemo(
    () => indices.filter((i) => selectedIds.includes(i.id)),
    [indices, selectedIds],
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        {indices.map((ind, i) => (
          <button
            key={ind.id}
            onClick={() => toggleIndex(ind.id)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
              selectedIds.includes(ind.id)
                ? 'text-white'
                : 'bg-slate-800/60 border-slate-700/40 text-slate-500 hover:text-white hover:border-slate-600'
            }`}
            style={
              selectedIds.includes(ind.id)
                ? { backgroundColor: `${INDEX_COLORS[i]}25`, borderColor: `${INDEX_COLORS[i]}50`, color: INDEX_COLORS[i] }
                : {}
            }
          >
            {ind.name}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingOverlay />
      ) : comparison ? (
        <div className="space-y-5">
          {/* Performance Overlay Chart */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
              <Activity size={14} className="text-brand-lime" />
              Performance Overlay
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={comparison.performanceOverlay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(d: string) => d.slice(0, 7)}
                />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={(v: number) => fmt$(v)} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(v: number, name: string) => [fmt$(v), name]}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {selectedIndices.map((ind, i) => (
                  <Line
                    key={ind.id}
                    type="monotone"
                    dataKey={`values[${i}]`}
                    name={ind.name}
                    stroke={INDEX_COLORS[indices.findIndex((x) => x.id === ind.id) % INDEX_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Correlation Matrix Heat Map */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                <Shield size={14} className="text-brand-lime" />
                Correlation Matrix
              </h3>
              <div className="overflow-x-auto">
                <table className="text-xs w-full">
                  <thead>
                    <tr>
                      <th className="p-1" />
                      {selectedIndices.map((ind) => (
                        <th key={ind.id} className="p-1 text-slate-400 font-medium text-center max-w-[80px] truncate">
                          {ind.name.split(' ')[0]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedIndices.map((row, ri) => (
                      <tr key={row.id}>
                        <td className="p-1 text-slate-400 font-medium text-right pr-2 max-w-[80px] truncate">
                          {row.name.split(' ')[0]}
                        </td>
                        {comparison.correlationMatrix[ri]?.map((corr, ci) => (
                          <td key={ci} className="p-1">
                            <div
                              className={`w-full text-center py-2 rounded font-bold ${corrColor(corr)} ${
                                ri === ci ? 'text-white' : 'text-slate-200'
                              }`}
                            >
                              {corr.toFixed(2)}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-center gap-1 mt-3">
                <span className="text-slate-600 text-[9px]">Low</span>
                <div className="flex h-2 rounded overflow-hidden">
                  {['bg-red-700/60', 'bg-orange-700/50', 'bg-yellow-600/50', 'bg-emerald-700/60', 'bg-emerald-500/80'].map(
                    (c, i) => (
                      <div key={i} className={`w-6 ${c}`} />
                    ),
                  )}
                </div>
                <span className="text-slate-600 text-[9px]">High</span>
              </div>
            </div>

            {/* Metrics Comparison Table */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                <DollarSign size={14} className="text-brand-lime" />
                Key Metrics
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-700/50">
                      <th className="pb-2 text-left font-medium">Metric</th>
                      {selectedIndices.map((ind) => (
                        <th key={ind.id} className="pb-2 text-right font-medium">{ind.name.split(' ').slice(0, 2).join(' ')}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: '1Y Return', key: 'returns1Y' as const },
                      { label: 'Inception', key: 'returnsInception' as const },
                      { label: 'Volatility', key: 'volatility' as const },
                      { label: 'Sharpe', key: 'sharpeRatio' as const },
                      { label: 'Max DD', key: 'maxDrawdown' as const },
                      { label: 'Alpha', key: 'alpha' as const },
                      { label: 'Beta', key: 'beta' as const },
                      { label: 'Info Ratio', key: 'informationRatio' as const },
                    ].map((m) => (
                      <tr key={m.label} className="border-b border-slate-700/20">
                        <td className="py-2 text-slate-400">{m.label}</td>
                        {selectedIndices.map((ind) => {
                          const v = ind.performance[m.key];
                          const isPct = !['sharpeRatio', 'beta', 'informationRatio'].includes(m.key);
                          return (
                            <td key={ind.id} className={`py-2 text-right font-semibold ${returnColor(v)}`}>
                              {isPct ? fmtPct(v) : v.toFixed(2)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-slate-500 text-sm text-center py-12">Select at least 2 indices to compare.</div>
      )}
    </div>
  );
};

// ---- Tab: Backtest Lab ----

const BacktestLab: React.FC<{ indices: CardIndex[] }> = ({ indices }) => {
  const [selectedId, setSelectedId] = useState(indices[0]?.id ?? '');
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    backtestIndex(selectedId).then((r) => {
      if (!cancelled) {
        setResult(r);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  // Build monthly return calendar grid: rows = years, cols = months
  const calendarData = useMemo(() => {
    if (!result) return [];
    const startYear = 2021;
    const rows: { year: number; months: (number | null)[] }[] = [];
    let idx = 0;
    for (let y = startYear; y <= 2025; y++) {
      const months: (number | null)[] = [];
      for (let m = 0; m < 12; m++) {
        if (idx < result.monthlyReturns.length) {
          months.push(result.monthlyReturns[idx]);
          idx++;
        } else {
          months.push(null);
        }
      }
      rows.push({ year: y, months });
    }
    return rows;
  }, [result]);

  // Drawdown chart data
  const drawdownData = useMemo(() => {
    if (!result) return [];
    return result.drawdowns.map((d, i) => ({
      name: `DD${i + 1}`,
      start: d.start,
      end: d.end,
      depth: d.depth,
    }));
  }, [result]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        {indices.map((ind) => (
          <button
            key={ind.id}
            onClick={() => setSelectedId(ind.id)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
              ind.id === selectedId
                ? 'bg-brand-lime/20 border-brand-lime/40 text-brand-lime'
                : 'bg-slate-800/60 border-slate-700/40 text-slate-400 hover:text-white hover:border-slate-600'
            }`}
          >
            {ind.name}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingOverlay />
      ) : result ? (
        <div className="space-y-5">
          {/* Summary Stats */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                <FlaskConical size={14} className="text-brand-lime" />
                Backtest Results: {indices.find((i) => i.id === selectedId)?.name}
              </h3>
              <span className="text-slate-500 text-xs">{result.period}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900/40 rounded-xl p-3 text-center">
                <div className={`text-xl font-black ${returnColor(result.returns)}`}>{fmtPct(result.returns)}</div>
                <div className="text-slate-500 text-[10px] uppercase mt-1">Total Return</div>
              </div>
              <div className="bg-slate-900/40 rounded-xl p-3 text-center">
                <div className="text-xl font-black text-white">{result.volatility.toFixed(1)}%</div>
                <div className="text-slate-500 text-[10px] uppercase mt-1">Annualized Vol</div>
              </div>
              <div className="bg-slate-900/40 rounded-xl p-3 text-center">
                <div className="text-xl font-black text-red-400">
                  {Math.min(...result.drawdowns.map((d) => d.depth)).toFixed(1)}%
                </div>
                <div className="text-slate-500 text-[10px] uppercase mt-1">Max Drawdown</div>
              </div>
              <div className="bg-slate-900/40 rounded-xl p-3 text-center">
                <div className="text-xl font-black text-emerald-400">{result.drawdowns.length}</div>
                <div className="text-slate-500 text-[10px] uppercase mt-1">Drawdown Events</div>
              </div>
            </div>
          </div>

          {/* Monthly Returns Heat Map Calendar */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
              <Calendar size={14} className="text-brand-lime" />
              Monthly Returns Heat Map
            </h3>
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                {/* Month headers */}
                <div className="grid grid-cols-[60px_repeat(12,1fr)] gap-1 mb-1">
                  <div />
                  {MONTHS_SHORT.map((m) => (
                    <div key={m} className="text-center text-slate-500 text-[10px] font-medium">
                      {m}
                    </div>
                  ))}
                </div>
                {/* Year rows */}
                {calendarData.map((row) => (
                  <div key={row.year} className="grid grid-cols-[60px_repeat(12,1fr)] gap-1 mb-1">
                    <div className="text-slate-400 text-xs font-bold flex items-center">{row.year}</div>
                    {row.months.map((val, mi) => (
                      <div
                        key={mi}
                        className={`rounded py-2 text-center text-[10px] font-bold ${
                          val !== null ? `${heatColor(val)} ${heatText(val)}` : 'bg-slate-800/30 text-slate-700'
                        }`}
                        title={val !== null ? `${MONTHS_SHORT[mi]} ${row.year}: ${val >= 0 ? '+' : ''}${val.toFixed(2)}%` : ''}
                      >
                        {val !== null ? `${val >= 0 ? '+' : ''}${val.toFixed(1)}` : '-'}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center gap-1 mt-3">
              <span className="text-slate-600 text-[9px]">-8%+</span>
              <div className="flex h-2 rounded overflow-hidden">
                {['bg-red-500', 'bg-red-600/80', 'bg-red-700/70', 'bg-red-900/50', 'bg-green-800/50', 'bg-green-600/70', 'bg-emerald-600/80', 'bg-emerald-500'].map(
                  (c, i) => (
                    <div key={i} className={`w-5 ${c}`} />
                  ),
                )}
              </div>
              <span className="text-slate-600 text-[9px]">+8%+</span>
            </div>
          </div>

          {/* Drawdown Chart */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
              <TrendingDown size={14} className="text-red-400" />
              Drawdown Events
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={drawdownData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#64748b"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v: number) => `${v}%`}
                  domain={['dataMin', 0]}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#64748b"
                  tick={{ fontSize: 10 }}
                  width={40}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
                  formatter={(v: number) => [`${v.toFixed(1)}%`, 'Depth']}
                  labelFormatter={(label: string) => {
                    const dd = drawdownData.find((d) => d.name === label);
                    return dd ? `${dd.start} to ${dd.end}` : label;
                  }}
                />
                <Bar dataKey="depth" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              {result.drawdowns.map((dd, i) => (
                <div key={i} className="flex items-center justify-between text-xs bg-slate-900/40 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-slate-400">
                      {dd.start} &rarr; {dd.end}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-red-400 font-bold">{dd.depth.toFixed(1)}%</span>
                    <span className="text-slate-600 text-[10px]">
                      {Math.round(
                        (new Date(dd.end).getTime() - new Date(dd.start).getTime()) / (1000 * 60 * 60 * 24),
                      )}{' '}
                      days
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-slate-500 text-sm text-center py-12">No backtest data available for this index.</div>
      )}
    </div>
  );
};

// ---- Main Page Component ----

const GrailIndexConstructor: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('gallery');
  const [indices, setIndices] = useState<CardIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndexId, setSelectedIndexId] = useState('');

  useEffect(() => {
    let cancelled = false;
    getIndices().then((data) => {
      if (!cancelled) {
        setIndices(data);
        setSelectedIndexId(data[0]?.id ?? '');
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleGallerySelect = useCallback((id: string) => {
    setSelectedIndexId(id);
    setActiveTab('deep-dive');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <BarChart3 className="text-brand-lime" size={32} />
              Grail Index Constructor
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Build, track, and backtest custom investable card indices with institutional-grade analytics.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-1.5">
            <Info size={12} className="text-brand-lime" />
            <span className="text-slate-400 text-[10px]">{indices.length} indices tracked</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 border-b border-slate-800/60">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-slate-800/80 text-brand-lime border-b-2 border-brand-lime'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {loading ? (
          <LoadingOverlay />
        ) : (
          <>
            {activeTab === 'gallery' && <IndexGallery indices={indices} onSelect={handleGallerySelect} />}
            {activeTab === 'deep-dive' && (
              <IndexDeepDive indices={indices} selectedId={selectedIndexId} onSelectId={setSelectedIndexId} />
            )}
            {activeTab === 'builder' && <IndexBuilder />}
            {activeTab === 'rebalance' && <RebalanceLog indices={indices} />}
            {activeTab === 'comparison' && <ComparisonTab indices={indices} />}
            {activeTab === 'backtest' && <BacktestLab indices={indices} />}
          </>
        )}
      </div>
    </div>
  );
};

export default GrailIndexConstructor;
