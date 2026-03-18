import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Layers,
  Settings,
  PieChart as PieChartIcon,
  GitCompare,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Shield,
  Plus,
  Minus,
  Search,
  ChevronRight,
  Loader2,
  Info,
  Calendar,
  Check,
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
  ComposedChart,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  getPreBuiltIndices,
  getIndexPerformance,
  createCustomIndex,
  rebalanceIndex,
  backtestIndex,
  getFactorExposure,
  compareIndices,
  getTrackingError,
  getIndexComponents,
  getTopPerformingIndices,
  getAvailableCards,
  getBenchmarks,
  type SyntheticIndex,
  type IndexComponent,
  type IndexPerformance,
  type BacktestResult,
  type FactorExposure,
  type TrackingError,
  type IndexMethodology,
  type RebalanceFrequency,
  type IndexCreationParams,
} from '../lib/analytics/syntheticIndexService';

// ---- Constants ----

type TabKey = 'gallery' | 'performance' | 'builder' | 'backtest' | 'factors' | 'comparison';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'gallery', label: 'Index Gallery', icon: <Layers size={16} /> },
  { key: 'performance', label: 'Performance', icon: <TrendingUp size={16} /> },
  { key: 'builder', label: 'Index Builder', icon: <Settings size={16} /> },
  { key: 'backtest', label: 'Backtest', icon: <BarChart3 size={16} /> },
  { key: 'factors', label: 'Factor Analysis', icon: <PieChartIcon size={16} /> },
  { key: 'comparison', label: 'Comparison', icon: <GitCompare size={16} /> },
];

const CHART_COLORS = ['#84cc16', '#f97316', '#3b82f6', '#ef4444', '#a855f7', '#06b6d4', '#eab308', '#ec4899'];
const PIE_COLORS = ['#ef4444', '#f97316', '#3b82f6', '#06b6d4', '#22c55e', '#a855f7', '#eab308', '#ec4899'];

const METHODOLOGY_LABELS: Record<IndexMethodology, string> = {
  'market-cap-weighted': 'Market Cap',
  'equal-weighted': 'Equal Weight',
  'price-weighted': 'Price Weight',
  'factor-weighted': 'Factor Weight',
};

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
  if (v >= 0.8) return 'bg-emerald-500/80';
  if (v >= 0.6) return 'bg-emerald-700/60';
  if (v >= 0.4) return 'bg-yellow-600/50';
  if (v >= 0.2) return 'bg-orange-700/40';
  return 'bg-red-700/40';
}

// ---- Sparkline ----

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

// ---- Loading ----

const LoadingOverlay: React.FC = () => (
  <div className="flex items-center justify-center py-20">
    <Loader2 className="animate-spin text-brand-lime" size={32} />
    <span className="ml-3 text-slate-400 text-sm">Loading index data...</span>
  </div>
);

// ---- Tab: Index Gallery ----

const IndexGallery: React.FC<{
  indices: SyntheticIndex[];
  onSelect: (id: string) => void;
}> = ({ indices, onSelect }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
    {indices.map((idx, i) => {
      const sparkData = idx.performance.navHistory.slice(-24).map((p) => ({ value: p.nav }));
      const up = idx.performance.returns1Y >= 0;
      return (
        <button
          key={idx.id}
          onClick={() => onSelect(idx.id)}
          className="text-left bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 hover:border-brand-lime/40 hover:bg-slate-800/80 transition-all group"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-white font-bold text-lg group-hover:text-brand-lime transition-colors leading-tight">
                {idx.name}
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                {idx.componentCount} components &middot; {METHODOLOGY_LABELS[idx.methodology]}
              </p>
            </div>
            <div className={`flex items-center gap-1 text-sm font-bold ${up ? 'text-emerald-400' : 'text-red-400'}`}>
              {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {fmtPct(idx.performance.returns1Y)}
            </div>
          </div>

          <p className="text-slate-400 text-xs leading-relaxed mb-4 line-clamp-2">{idx.description}</p>

          <div className="flex items-end justify-between">
            <Sparkline data={sparkData} color={CHART_COLORS[i % CHART_COLORS.length]} />
            <div className="text-right">
              <div className="text-white text-sm font-semibold">{fmt$(idx.totalValue)}</div>
              <div className="text-slate-500 text-[10px] uppercase tracking-wider">Total Value</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mt-3">
            {idx.tags.map((tag) => (
              <span key={tag} className="text-[10px] bg-slate-700/50 text-slate-400 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-700/40">
            {[
              { label: 'Sharpe', val: idx.performance.sharpeRatio.toFixed(2) },
              { label: 'Vol', val: `${idx.performance.volatility.toFixed(1)}%` },
              { label: 'Max DD', val: `${idx.performance.maxDrawdown.toFixed(1)}%` },
              { label: 'NAV', val: idx.performance.nav.toFixed(0) },
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

// ---- Tab: Performance ----

const PerformanceTab: React.FC<{
  indices: SyntheticIndex[];
  selectedId: string;
  onSelectId: (id: string) => void;
}> = ({ indices, selectedId, onSelectId }) => {
  const [period, setPeriod] = useState<'6M' | '1Y' | '3Y' | 'MAX'>('MAX');

  const idx = useMemo(() => indices.find((i) => i.id === selectedId), [indices, selectedId]);

  const filteredNav = useMemo(() => {
    if (!idx) return [];
    const history = idx.performance.navHistory;
    const len = history.length;
    if (period === '6M') return history.slice(Math.max(0, len - 7));
    if (period === '1Y') return history.slice(Math.max(0, len - 13));
    if (period === '3Y') return history.slice(Math.max(0, len - 37));
    return history;
  }, [idx, period]);

  const sportBreakdown = useMemo(() => {
    if (!idx) return [];
    const map: Record<string, number> = {};
    for (const c of idx.components) {
      map[c.sport] = (map[c.sport] ?? 0) + c.weight;
    }
    return Object.entries(map)
      .map(([sport, weight]) => ({ sport, weight: Math.round(weight * 100) / 100 }))
      .sort((a, b) => b.weight - a.weight);
  }, [idx]);

  if (!idx) return <div className="text-slate-400 py-10 text-center">Select an index from the gallery.</div>;

  return (
    <div className="space-y-6">
      {/* Index selector */}
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

      {/* Header stats */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-2xl font-black text-white">{idx.name}</h2>
            <p className="text-slate-400 text-sm mt-1">{idx.description}</p>
          </div>
          <div className="text-right">
            <div className="text-white text-2xl font-bold">{idx.performance.nav.toFixed(2)}</div>
            <div className="text-slate-500 text-xs">Current NAV</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 mt-5">
          {[
            { label: '1M', val: idx.performance.returns1M },
            { label: '3M', val: idx.performance.returns3M },
            { label: '6M', val: idx.performance.returns6M },
            { label: '1Y', val: idx.performance.returns1Y },
            { label: 'YTD', val: idx.performance.returnsYTD },
            { label: 'Sharpe', val: idx.performance.sharpeRatio, fmt: (v: number) => v.toFixed(2) },
            { label: 'Sortino', val: idx.performance.sortino, fmt: (v: number) => v.toFixed(2) },
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

      {/* NAV Line Chart with benchmark */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <Activity size={14} className="text-brand-lime" />
            NAV Performance vs. Benchmark
          </h3>
          <div className="flex gap-1">
            {(['6M', '1Y', '3Y', 'MAX'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-2 py-1 text-[10px] font-bold rounded ${
                  p === period ? 'bg-brand-lime/20 text-brand-lime' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={filteredNav}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              tickFormatter={(v: string) => v.slice(0, 7)}
            />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: 8 }}
              labelStyle={{ color: '#e2e8f0' }}
              itemStyle={{ color: '#e2e8f0' }}
              formatter={(value: number) => [value.toFixed(2), '']}
            />
            <Legend />
            <Line type="monotone" dataKey="nav" stroke="#84cc16" strokeWidth={2} dot={false} name="Index NAV" />
            <Line type="monotone" dataKey="benchmark" stroke="#64748b" strokeWidth={1.5} dot={false} strokeDasharray="5 5" name="Benchmark" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Components table + Sport breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
          <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
            <Target size={14} className="text-brand-lime" />
            Index Components
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 text-left border-b border-slate-700/50">
                  <th className="pb-2 pr-3">Player</th>
                  <th className="pb-2 pr-3">Card</th>
                  <th className="pb-2 pr-3 text-right">Weight</th>
                  <th className="pb-2 pr-3 text-right">Value</th>
                  <th className="pb-2 text-right">Contrib.</th>
                </tr>
              </thead>
              <tbody>
                {idx.components.map((c) => (
                  <tr key={c.cardId} className="border-b border-slate-700/20 hover:bg-slate-700/20">
                    <td className="py-2 pr-3 text-white font-medium">{c.player}</td>
                    <td className="py-2 pr-3 text-slate-400">{c.cardName}</td>
                    <td className="py-2 pr-3 text-right text-slate-300">{c.weight.toFixed(1)}%</td>
                    <td className="py-2 pr-3 text-right text-slate-300">{fmt$(c.currentValue)}</td>
                    <td className={`py-2 text-right font-medium ${returnColor(c.contributionToReturn * 10)}`}>
                      {fmtPct(c.contributionToReturn)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
          <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
            <PieChartIcon size={14} className="text-brand-lime" />
            Sport Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={sportBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="weight"
                nameKey="sport"
                label={({ sport, weight }: { sport: string; weight: number }) => `${sport} ${weight.toFixed(0)}%`}
              >
                {sportBreakdown.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: 8 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ---- Tab: Index Builder ----

const IndexBuilder: React.FC<{
  onCreated: (idx: SyntheticIndex) => void;
}> = ({ onCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [methodology, setMethodology] = useState<IndexMethodology>('equal-weighted');
  const [rebalFreq, setRebalFreq] = useState<RebalanceFrequency>('quarterly');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);

  const allCards = useMemo(() => getAvailableCards(), []);

  const filteredCards = useMemo(() => {
    if (!searchTerm) return allCards;
    const lower = searchTerm.toLowerCase();
    return allCards.filter(
      (c) =>
        c.player.toLowerCase().includes(lower) ||
        c.cardName.toLowerCase().includes(lower) ||
        c.sport.toLowerCase().includes(lower),
    );
  }, [allCards, searchTerm]);

  const toggleCard = (cardId: string) => {
    setSelectedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  };

  const handleCreate = async () => {
    if (!name || selectedCardIds.size === 0) return;
    setCreating(true);
    const params: IndexCreationParams = {
      name,
      description: description || `Custom ${methodology} index with ${selectedCardIds.size} components`,
      methodology,
      rebalanceFrequency: rebalFreq,
      maxComponents: selectedCardIds.size,
      minCardValue: 0,
      sportFilter: [],
      eraFilter: '',
      themeFilter: '',
      selectedCardIds: Array.from(selectedCardIds),
    };
    const newIndex = await createCustomIndex(params);
    onCreated(newIndex);
    setCreating(false);
    setName('');
    setDescription('');
    setSelectedCardIds(new Set());
  };

  return (
    <div className="space-y-6">
      {/* Config */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <Settings size={18} className="text-brand-lime" />
          Index Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Index Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Custom Index"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-brand-lime/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your index thesis..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-brand-lime/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Methodology</label>
            <select
              value={methodology}
              onChange={(e) => setMethodology(e.target.value as IndexMethodology)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-lime/50 focus:outline-none"
            >
              <option value="market-cap-weighted">Market Cap Weighted</option>
              <option value="equal-weighted">Equal Weighted</option>
              <option value="price-weighted">Price Weighted</option>
              <option value="factor-weighted">Factor Weighted</option>
            </select>
          </div>
          <div>
            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Rebalance Frequency</label>
            <select
              value={rebalFreq}
              onChange={(e) => setRebalFreq(e.target.value as RebalanceFrequency)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-lime/50 focus:outline-none"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
        </div>
      </div>

      {/* Card selection with drag-and-drop style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Available cards */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-bold text-sm">Available Cards</h3>
            <span className="text-slate-500 text-xs">{filteredCards.length} cards</span>
          </div>
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by player, card, or sport..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-600 focus:border-brand-lime/50 focus:outline-none"
            />
          </div>
          <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
            {filteredCards.map((card) => {
              const isSelected = selectedCardIds.has(card.cardId);
              return (
                <button
                  key={card.cardId}
                  onClick={() => toggleCard(card.cardId)}
                  className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                    isSelected
                      ? 'bg-brand-lime/10 border border-brand-lime/30'
                      : 'bg-slate-900/50 border border-transparent hover:bg-slate-700/30 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-brand-lime text-slate-900' : 'bg-slate-700 text-slate-500'
                      }`}
                    >
                      {isSelected ? <Check size={12} /> : <Plus size={12} />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-white font-medium truncate">{card.player}</div>
                      <div className="text-slate-500 text-[10px] truncate">{card.cardName}</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="text-slate-300">{fmt$(card.currentValue)}</div>
                    <div className="text-slate-600 text-[10px]">{card.sport}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected cards */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-bold text-sm">Selected Components</h3>
            <span className="text-brand-lime text-xs font-bold">{selectedCardIds.size} selected</span>
          </div>
          {selectedCardIds.size === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Layers size={32} className="mb-3 opacity-50" />
              <p className="text-sm">Select cards from the left panel</p>
              <p className="text-xs mt-1">Click cards to add them to your index</p>
            </div>
          ) : (
            <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
              {allCards
                .filter((c) => selectedCardIds.has(c.cardId))
                .map((card, i) => (
                  <div
                    key={card.cardId}
                    className="flex items-center justify-between px-3 py-2 bg-slate-900/50 rounded-lg border border-slate-700/30"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-slate-600 text-[10px] font-mono w-4">{i + 1}</span>
                      <div className="min-w-0">
                        <div className="text-white font-medium text-xs truncate">{card.player}</div>
                        <div className="text-slate-500 text-[10px] truncate">{card.cardName}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleCard(card.cardId)}
                      className="text-red-400 hover:text-red-300 flex-shrink-0 ml-2"
                    >
                      <Minus size={14} />
                    </button>
                  </div>
                ))}
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={creating || !name || selectedCardIds.size === 0}
            className="w-full mt-4 bg-brand-lime text-slate-900 font-bold py-2.5 rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-lime/90 transition-colors flex items-center justify-center gap-2"
          >
            {creating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating Index...
              </>
            ) : (
              <>
                <Plus size={16} />
                Create Index ({selectedCardIds.size} cards)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---- Tab: Backtest ----

const BacktestTab: React.FC<{
  indices: SyntheticIndex[];
}> = ({ indices }) => {
  const [selectedId, setSelectedId] = useState(indices[0]?.id ?? '');
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runBacktest = async () => {
    setLoading(true);
    const res = await backtestIndex({ indexId: selectedId });
    setResult(res);
    setLoading(false);
  };

  useEffect(() => {
    if (selectedId) runBacktest();
  }, [selectedId]);

  const heatmapData = useMemo(() => {
    if (!result) return [];
    const years: Record<string, { month: string; return: number }[]> = {};
    for (const mr of result.monthlyReturns) {
      const year = mr.month.slice(0, 4);
      if (!years[year]) years[year] = [];
      years[year].push(mr);
    }
    return Object.entries(years).map(([year, months]) => ({ year, months }));
  }, [result]);

  return (
    <div className="space-y-6">
      {/* Index selector */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
        <h3 className="text-white font-bold text-sm mb-3">Select Index to Backtest</h3>
        <div className="flex items-center gap-3 flex-wrap">
          {indices.map((ind) => (
            <button
              key={ind.id}
              onClick={() => setSelectedId(ind.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                ind.id === selectedId
                  ? 'bg-brand-lime/20 border-brand-lime/40 text-brand-lime'
                  : 'bg-slate-800/60 border-slate-700/40 text-slate-400 hover:text-white'
              }`}
            >
              {ind.name}
            </button>
          ))}
        </div>
      </div>

      {loading && <LoadingOverlay />}

      {result && !loading && (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { label: 'Total Return', value: fmtPct(result.totalReturn), color: returnColor(result.totalReturn) },
              { label: 'Ann. Return', value: fmtPct(result.annualizedReturn), color: returnColor(result.annualizedReturn) },
              { label: 'Max DD', value: fmtPct(result.maxDrawdown), color: 'text-red-400' },
              { label: 'Sharpe', value: result.sharpeRatio.toFixed(2), color: 'text-slate-300' },
              { label: 'Volatility', value: `${result.volatility.toFixed(1)}%`, color: 'text-slate-300' },
              { label: 'Win Rate', value: `${result.winRate.toFixed(0)}%`, color: 'text-slate-300' },
              { label: 'Best Month', value: fmtPct(result.bestMonth), color: 'text-emerald-400' },
              { label: 'Worst Month', value: fmtPct(result.worstMonth), color: 'text-red-400' },
            ].map((s) => (
              <div key={s.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
                <div className={`text-sm font-bold ${s.color}`}>{s.value}</div>
                <div className="text-slate-600 text-[10px] uppercase tracking-wider mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Equity Curve */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
              <TrendingUp size={14} className="text-brand-lime" />
              Equity Curve
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={result.equityCurve}>
                <defs>
                  <linearGradient id="navGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v: string) => v.slice(0, 7)} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: 8 }} labelStyle={{ color: '#e2e8f0' }} />
                <Area type="monotone" dataKey="value" stroke="#84cc16" fill="url(#navGrad)" strokeWidth={2} name="Index" />
                <Line type="monotone" dataKey="benchmark" stroke="#64748b" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Benchmark" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly returns bar */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
              <BarChart3 size={14} className="text-brand-lime" />
              Monthly Returns
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={result.monthlyReturns}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 9 }} tickFormatter={(v: string) => v.slice(2)} interval={2} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v: number) => `${v}%`} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: 8 }} labelStyle={{ color: '#e2e8f0' }} formatter={(v: number) => [`${v.toFixed(2)}%`, 'Return']} />
                <Bar dataKey="return" radius={[2, 2, 0, 0]}>
                  {result.monthlyReturns.map((entry, i) => (
                    <Cell key={i} fill={entry.return >= 0 ? '#84cc16' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Returns heatmap */}
          {heatmapData.length > 0 && (
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                <Calendar size={14} className="text-brand-lime" />
                Returns Heatmap
              </h3>
              <div className="overflow-x-auto">
                <table className="text-xs">
                  <thead>
                    <tr>
                      <th className="text-slate-500 pr-2 pb-1 text-left">Year</th>
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                        <th key={m} className="text-slate-500 px-1 pb-1 text-center w-12">{m}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {heatmapData.map(({ year, months }) => (
                      <tr key={year}>
                        <td className="text-slate-400 font-medium pr-2 py-0.5">{year}</td>
                        {Array.from({ length: 12 }, (_, mi) => {
                          const monthStr = `${year}-${String(mi + 1).padStart(2, '0')}`;
                          const entry = months.find((m) => m.month === monthStr);
                          if (!entry) return <td key={mi} className="px-1 py-0.5"><div className="w-12 h-6 bg-slate-800 rounded" /></td>;
                          const v = entry.return;
                          const bg = v >= 5 ? 'bg-emerald-500' : v >= 2 ? 'bg-emerald-700/80' : v >= 0 ? 'bg-green-800/50' : v >= -2 ? 'bg-red-900/50' : v >= -5 ? 'bg-red-700/70' : 'bg-red-500';
                          return (
                            <td key={mi} className="px-1 py-0.5">
                              <div className={`w-12 h-6 ${bg} rounded flex items-center justify-center text-[10px] font-medium text-white`}>
                                {v.toFixed(1)}%
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ---- Tab: Factor Analysis ----

const FactorAnalysisTab: React.FC<{
  indices: SyntheticIndex[];
}> = ({ indices }) => {
  const [selectedId, setSelectedId] = useState(indices[0]?.id ?? '');
  const [exposure, setExposure] = useState<FactorExposure | null>(null);
  const [tracking, setTracking] = useState<TrackingError | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([getFactorExposure(selectedId), getTrackingError(selectedId, 'bmk-all-cards')]).then(
      ([fe, te]) => {
        if (!cancelled) {
          setExposure(fe);
          setTracking(te);
          setLoading(false);
        }
      },
    );
    return () => { cancelled = true; };
  }, [selectedId]);

  const radarData = useMemo(() => {
    if (!exposure) return [];
    return exposure.factors.map((f) => ({
      factor: f.name.replace(/\s+/g, '\n'),
      exposure: Math.abs(f.exposure),
      fullMark: 1.5,
    }));
  }, [exposure]);

  return (
    <div className="space-y-6">
      {/* Index selector */}
      <div className="flex items-center gap-3 flex-wrap">
        {indices.map((ind) => (
          <button
            key={ind.id}
            onClick={() => setSelectedId(ind.id)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
              ind.id === selectedId
                ? 'bg-brand-lime/20 border-brand-lime/40 text-brand-lime'
                : 'bg-slate-800/60 border-slate-700/40 text-slate-400 hover:text-white'
            }`}
          >
            {ind.name}
          </button>
        ))}
      </div>

      {loading && <LoadingOverlay />}

      {exposure && tracking && !loading && (
        <>
          {/* Factor exposure radar + stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                <Shield size={14} className="text-brand-lime" />
                Factor Exposure Radar
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#475569" />
                  <PolarAngleAxis dataKey="factor" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <PolarRadiusAxis tick={{ fill: '#64748b', fontSize: 9 }} domain={[0, 1.5]} />
                  <Radar name="Exposure" dataKey="exposure" stroke="#84cc16" fill="#84cc16" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                <BarChart3 size={14} className="text-brand-lime" />
                Factor Loadings
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={exposure.factors} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 9 }} width={100} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: 8 }} labelStyle={{ color: '#e2e8f0' }} />
                  <Bar dataKey="exposure" radius={[0, 4, 4, 0]}>
                    {exposure.factors.map((f, i) => (
                      <Cell key={i} fill={f.exposure >= 0 ? '#84cc16' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Factor details table */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="text-white font-bold text-sm mb-4">Factor Detail</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                <div className="text-white font-bold text-lg">{exposure.rSquared.toFixed(2)}</div>
                <div className="text-slate-500 text-[10px] uppercase">R-Squared</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                <div className={`font-bold text-lg ${returnColor(exposure.alpha * 5)}`}>{fmtPct(exposure.alpha)}</div>
                <div className="text-slate-500 text-[10px] uppercase">Alpha</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                <div className="text-white font-bold text-lg">{exposure.residualVol.toFixed(2)}%</div>
                <div className="text-slate-500 text-[10px] uppercase">Residual Vol</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                <div className="text-white font-bold text-lg">{tracking.trackingError.toFixed(2)}%</div>
                <div className="text-slate-500 text-[10px] uppercase">Tracking Error</div>
              </div>
            </div>

            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-700/50">
                  <th className="text-left pb-2">Factor</th>
                  <th className="text-right pb-2">Exposure</th>
                  <th className="text-right pb-2">t-Stat</th>
                  <th className="text-right pb-2">p-Value</th>
                  <th className="text-right pb-2">Significance</th>
                </tr>
              </thead>
              <tbody>
                {exposure.factors.map((f) => (
                  <tr key={f.name} className="border-b border-slate-700/20">
                    <td className="py-2 text-white font-medium">{f.name}</td>
                    <td className={`py-2 text-right font-bold ${f.exposure >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {f.exposure.toFixed(3)}
                    </td>
                    <td className="py-2 text-right text-slate-300">{f.tStat.toFixed(2)}</td>
                    <td className="py-2 text-right text-slate-300">{f.pValue.toFixed(3)}</td>
                    <td className="py-2 text-right">
                      {f.pValue < 0.01 ? (
                        <span className="text-emerald-400 font-bold">***</span>
                      ) : f.pValue < 0.05 ? (
                        <span className="text-green-400 font-bold">**</span>
                      ) : f.pValue < 0.10 ? (
                        <span className="text-yellow-400 font-bold">*</span>
                      ) : (
                        <span className="text-slate-600">ns</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Rolling tracking error */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
              <Activity size={14} className="text-brand-lime" />
              Rolling Tracking Error vs. All-Cards Composite
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
              {[
                { label: 'TE', val: `${tracking.trackingError.toFixed(2)}%` },
                { label: 'Info Ratio', val: tracking.informationRatio.toFixed(2) },
                { label: 'Active Return', val: fmtPct(tracking.activeReturn) },
                { label: 'Correlation', val: tracking.correlationToBenchmark.toFixed(2) },
                { label: 'Beta', val: tracking.beta.toFixed(2) },
              ].map((s) => (
                <div key={s.label} className="bg-slate-900/50 rounded-lg p-2 text-center">
                  <div className="text-white font-bold text-sm">{s.val}</div>
                  <div className="text-slate-600 text-[10px] uppercase">{s.label}</div>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={tracking.rollingTE}>
                <defs>
                  <linearGradient id="teGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v: string) => v.slice(0, 7)} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v: number) => `${v}%`} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: 8 }} formatter={(v: number) => [`${v.toFixed(2)}%`, 'TE']} />
                <Area type="monotone" dataKey="te" stroke="#f97316" fill="url(#teGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

// ---- Tab: Comparison ----

const ComparisonTab: React.FC<{
  indices: SyntheticIndex[];
}> = ({ indices }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(indices.slice(0, 3).map((i) => i.id)),
  );
  const [comparisonData, setComparisonData] = useState<{
    indices: SyntheticIndex[];
    correlationMatrix: number[][];
    performanceOverlay: { date: string; values: Record<string, number> }[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleIndex = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 6) next.add(id);
      return next;
    });
  };

  useEffect(() => {
    if (selectedIds.size < 2) {
      setComparisonData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    compareIndices(Array.from(selectedIds)).then((res) => {
      if (!cancelled) {
        setComparisonData(res);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [selectedIds]);

  const overlayChartData = useMemo(() => {
    if (!comparisonData) return [];
    return comparisonData.performanceOverlay.map((point) => ({
      date: point.date,
      ...point.values,
    }));
  }, [comparisonData]);

  return (
    <div className="space-y-6">
      {/* Selector */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
        <h3 className="text-white font-bold text-sm mb-3">Select Indices to Compare (2-6)</h3>
        <div className="flex flex-wrap gap-2">
          {indices.map((ind) => {
            const isSelected = selectedIds.has(ind.id);
            return (
              <button
                key={ind.id}
                onClick={() => toggleIndex(ind.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-brand-lime/20 border-brand-lime/40 text-brand-lime'
                    : 'bg-slate-800/60 border-slate-700/40 text-slate-400 hover:text-white'
                }`}
              >
                {ind.name}
              </button>
            );
          })}
        </div>
      </div>

      {loading && <LoadingOverlay />}

      {selectedIds.size < 2 && !loading && (
        <div className="text-slate-400 py-10 text-center text-sm">Select at least 2 indices to compare.</div>
      )}

      {comparisonData && !loading && (
        <>
          {/* Performance overlay */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
              <TrendingUp size={14} className="text-brand-lime" />
              NAV Performance Overlay
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={overlayChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v: string) => v.slice(0, 7)} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: 8 }} labelStyle={{ color: '#e2e8f0' }} />
                <Legend />
                {comparisonData.indices.map((idx, i) => (
                  <Line
                    key={idx.id}
                    type="monotone"
                    dataKey={idx.id}
                    stroke={CHART_COLORS[i % CHART_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    name={idx.name}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Stats comparison table */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
              <GitCompare size={14} className="text-brand-lime" />
              Key Metrics Comparison
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-700/50">
                    <th className="text-left pb-2 pr-4">Metric</th>
                    {comparisonData.indices.map((idx, i) => (
                      <th key={idx.id} className="text-right pb-2 px-2">
                        <span style={{ color: CHART_COLORS[i] }}>{idx.name}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: '1Y Return', get: (idx: SyntheticIndex) => fmtPct(idx.performance.returns1Y), raw: (idx: SyntheticIndex) => idx.performance.returns1Y },
                    { label: 'Since Inception', get: (idx: SyntheticIndex) => fmtPct(idx.performance.returnsSinceInception), raw: (idx: SyntheticIndex) => idx.performance.returnsSinceInception },
                    { label: 'Sharpe Ratio', get: (idx: SyntheticIndex) => idx.performance.sharpeRatio.toFixed(2), raw: (idx: SyntheticIndex) => idx.performance.sharpeRatio },
                    { label: 'Volatility', get: (idx: SyntheticIndex) => `${idx.performance.volatility.toFixed(1)}%`, raw: (idx: SyntheticIndex) => -idx.performance.volatility },
                    { label: 'Max Drawdown', get: (idx: SyntheticIndex) => `${idx.performance.maxDrawdown.toFixed(1)}%`, raw: (idx: SyntheticIndex) => idx.performance.maxDrawdown },
                    { label: 'Sortino', get: (idx: SyntheticIndex) => idx.performance.sortino.toFixed(2), raw: (idx: SyntheticIndex) => idx.performance.sortino },
                    { label: 'Components', get: (idx: SyntheticIndex) => String(idx.componentCount), raw: (idx: SyntheticIndex) => idx.componentCount },
                    { label: 'Total Value', get: (idx: SyntheticIndex) => fmt$(idx.totalValue), raw: (idx: SyntheticIndex) => idx.totalValue },
                  ].map((row) => {
                    const bestVal = Math.max(...comparisonData.indices.map((i) => row.raw(i)));
                    return (
                      <tr key={row.label} className="border-b border-slate-700/20">
                        <td className="py-2 pr-4 text-slate-400 font-medium">{row.label}</td>
                        {comparisonData.indices.map((idx) => {
                          const isBest = row.raw(idx) === bestVal;
                          return (
                            <td key={idx.id} className={`py-2 px-2 text-right ${isBest ? 'text-brand-lime font-bold' : 'text-slate-300'}`}>
                              {row.get(idx)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Correlation matrix */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
              <Info size={14} className="text-brand-lime" />
              Correlation Matrix
            </h3>
            <div className="overflow-x-auto">
              <table className="text-xs">
                <thead>
                  <tr>
                    <th className="pb-2 pr-3" />
                    {comparisonData.indices.map((idx, i) => (
                      <th key={idx.id} className="pb-2 px-2 text-center" style={{ color: CHART_COLORS[i] }}>
                        {idx.name.slice(0, 12)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.indices.map((row, ri) => (
                    <tr key={row.id}>
                      <td className="py-1 pr-3 text-slate-400 font-medium">{row.name.slice(0, 15)}</td>
                      {comparisonData.correlationMatrix[ri]?.map((corr, ci) => (
                        <td key={ci} className="py-1 px-1 text-center">
                          <div className={`w-16 h-7 ${heatColor(corr)} rounded flex items-center justify-center text-[10px] font-bold text-white`}>
                            {corr.toFixed(2)}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ---- Main Component ----

const SyntheticCardIndex: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('gallery');
  const [indices, setIndices] = useState<SyntheticIndex[]>([]);
  const [selectedIndexId, setSelectedIndexId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPreBuiltIndices().then((data) => {
      setIndices(data);
      if (data.length > 0) setSelectedIndexId(data[0].id);
      setLoading(false);
    });
  }, []);

  const handleSelectFromGallery = (id: string) => {
    setSelectedIndexId(id);
    setActiveTab('performance');
  };

  const handleIndexCreated = (newIdx: SyntheticIndex) => {
    setIndices((prev) => [...prev, newIdx]);
    setSelectedIndexId(newIdx.id);
    setActiveTab('performance');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-black text-white tracking-tight">Synthetic Card Index Creator</h1>
          <p className="text-slate-400 text-sm mt-1">
            Build, backtest, and analyze custom thematic indices across the sports card market.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-brand-lime/20 text-brand-lime border border-brand-lime/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <LoadingOverlay />
        ) : (
          <>
            {activeTab === 'gallery' && <IndexGallery indices={indices} onSelect={handleSelectFromGallery} />}
            {activeTab === 'performance' && (
              <PerformanceTab indices={indices} selectedId={selectedIndexId} onSelectId={setSelectedIndexId} />
            )}
            {activeTab === 'builder' && <IndexBuilder onCreated={handleIndexCreated} />}
            {activeTab === 'backtest' && <BacktestTab indices={indices} />}
            {activeTab === 'factors' && <FactorAnalysisTab indices={indices} />}
            {activeTab === 'comparison' && <ComparisonTab indices={indices} />}
          </>
        )}
      </div>
    </div>
  );
};

export default SyntheticCardIndex;
