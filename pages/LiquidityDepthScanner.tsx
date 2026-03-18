import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  Droplets,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Snowflake,
  DollarSign,
  Users,
  Layers,
  RefreshCw,
  ChevronRight,
  CheckCircle,
  XCircle,
  Info,
} from 'lucide-react';
import type {
  LiquidityProfile,
  LiquidityTier,
  ExitStrategy,
  LiquidityCrisis,
  PortfolioLiquidity,
  CrisisSeverity,
  ExitMethod,
  DepthLevel,
  VolumePoint,
} from '../lib/analytics/liquidityDepthService';
import {
  getAllLiquidityProfiles,
  getMarketDepth,
  getExitStrategies,
  getPortfolioLiquidity,
  getLiquidityCrises,
  getVolumeHistory,
  getOptimalExitTiming,
  getLiquidityHeatMap,
  simulateLiquidation,
} from '../lib/analytics/liquidityDepthService';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

type TabId = 'dashboard' | 'depth' | 'exit' | 'volume' | 'portfolio' | 'crisis';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Liquidity Dashboard', icon: <Droplets size={16} /> },
  { id: 'depth', label: 'Market Depth', icon: <Layers size={16} /> },
  { id: 'exit', label: 'Exit Planner', icon: <DollarSign size={16} /> },
  { id: 'volume', label: 'Volume Analysis', icon: <BarChart3 size={16} /> },
  { id: 'portfolio', label: 'Portfolio Liquidity', icon: <PieChartIcon size={16} /> },
  { id: 'crisis', label: 'Crisis Monitor', icon: <AlertTriangle size={16} /> },
];

const TIER_STYLES: Record<LiquidityTier, { bg: string; text: string; border: string; label: string }> = {
  'ultra-liquid': { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Ultra-Liquid' },
  liquid: { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30', label: 'Liquid' },
  moderate: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'Moderate' },
  illiquid: { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30', label: 'Illiquid' },
  frozen: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', label: 'Frozen' },
};

const SEVERITY_STYLES: Record<CrisisSeverity, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  watch: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30', icon: <Activity size={18} /> },
  warning: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30', icon: <AlertTriangle size={18} /> },
  critical: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', icon: <Zap size={18} /> },
};

const PIE_COLORS = ['#10b981', '#22c55e', '#eab308', '#f97316', '#ef4444'];

// ─────────────────────────────────────────────────────────────────────────────
// Utility formatters
// ─────────────────────────────────────────────────────────────────────────────

function fmtCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return `$${n.toFixed(2)}`;
}

function fmtPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function scoreColor(score: number): string {
  if (score >= 85) return '#10b981';
  if (score >= 65) return '#22c55e';
  if (score >= 40) return '#eab308';
  if (score >= 20) return '#f97316';
  return '#ef4444';
}

function daysColor(days: number): string {
  if (days <= 2) return 'text-emerald-400';
  if (days <= 7) return 'text-green-400';
  if (days <= 14) return 'text-yellow-400';
  if (days <= 30) return 'text-orange-400';
  return 'text-red-400';
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function LiquidityGauge({ score, size = 72 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = Math.PI * radius;
  const filled = (score / 100) * circumference;
  const color = scoreColor(score);

  return (
    <svg width={size} height={size / 2 + 8} viewBox={`0 0 ${size} ${size / 2 + 8}`}>
      <path
        d={`M 4 ${size / 2 + 4} A ${radius} ${radius} 0 0 1 ${size - 4} ${size / 2 + 4}`}
        fill="none"
        stroke="#1e293b"
        strokeWidth={6}
        strokeLinecap="round"
      />
      <path
        d={`M 4 ${size / 2 + 4} A ${radius} ${radius} 0 0 1 ${size - 4} ${size / 2 + 4}`}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circumference}`}
        className="transition-all duration-700"
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        fill={color}
        fontSize={size * 0.22}
        fontWeight="bold"
      >
        {score}
      </text>
    </svg>
  );
}

function TierBadge({ tier }: { tier: LiquidityTier }) {
  const s = TIER_STYLES[tier];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${s.bg} ${s.text} ${s.border}`}>
      {tier === 'frozen' && <Snowflake size={11} />}
      {tier === 'ultra-liquid' && <Zap size={11} />}
      {s.label}
    </span>
  );
}

function StatCard({ label, value, sub, icon }: { label: string; value: string | number; sub?: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 flex items-start gap-3">
      {icon && <div className="p-2 bg-slate-700/50 rounded-lg text-slate-400">{icon}</div>}
      <div className="min-w-0">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{label}</p>
        <p className="text-lg font-bold text-white truncate">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <RefreshCw size={32} className="text-slate-500 animate-spin" />
      <span className="ml-3 text-slate-400 font-medium">Scanning market depth...</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Liquidity Dashboard
// ─────────────────────────────────────────────────────────────────────────────

function DashboardTab({ profiles, onSelectCard }: { profiles: LiquidityProfile[]; onSelectCard: (id: string) => void }) {
  const [filterTier, setFilterTier] = useState<LiquidityTier | 'all'>('all');
  const [filterSport, setFilterSport] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'value' | 'days'>('score');

  const filtered = useMemo(() => {
    let list = [...profiles];
    if (filterTier !== 'all') list = list.filter((p) => p.liquidityTier === filterTier);
    if (filterSport !== 'all') list = list.filter((p) => p.sport === filterSport);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => p.player.toLowerCase().includes(q) || p.cardName.toLowerCase().includes(q));
    }
    if (sortBy === 'score') list.sort((a, b) => b.liquidityScore - a.liquidityScore);
    else if (sortBy === 'value') list.sort((a, b) => b.currentValue - a.currentValue);
    else list.sort((a, b) => a.avgDaysToSell - b.avgDaysToSell);
    return list;
  }, [profiles, filterTier, filterSport, searchQuery, sortBy]);

  const summaryStats = useMemo(() => {
    const total = profiles.length;
    const ultraLiquid = profiles.filter((p) => p.liquidityTier === 'ultra-liquid').length;
    const frozen = profiles.filter((p) => p.liquidityTier === 'frozen').length;
    const avgScore = Math.round(profiles.reduce((s, p) => s + p.liquidityScore, 0) / (total || 1));
    const totalValue = profiles.reduce((s, p) => s + p.currentValue, 0);
    const withMM = profiles.filter((p) => p.marketMakerPresence).length;
    return { total, ultraLiquid, frozen, avgScore, totalValue, withMM };
  }, [profiles]);

  return (
    <div className="space-y-6">
      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Total Cards" value={summaryStats.total} icon={<Layers size={18} />} />
        <StatCard label="Avg Score" value={summaryStats.avgScore} sub="out of 100" icon={<Activity size={18} />} />
        <StatCard label="Total Value" value={fmtCurrency(summaryStats.totalValue)} icon={<DollarSign size={18} />} />
        <StatCard label="Ultra-Liquid" value={summaryStats.ultraLiquid} sub="cards" icon={<Zap size={18} />} />
        <StatCard label="Frozen" value={summaryStats.frozen} sub="cards" icon={<Snowflake size={18} />} />
        <StatCard label="Market Makers" value={summaryStats.withMM} sub="detected" icon={<Users size={18} />} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search player or card..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-600"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter size={14} className="text-slate-500" />
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value as LiquidityTier | 'all')}
            className="bg-slate-800/60 border border-slate-700/50 rounded-lg px-2.5 py-2 text-sm text-white focus:outline-none"
          >
            <option value="all">All Tiers</option>
            <option value="ultra-liquid">Ultra-Liquid</option>
            <option value="liquid">Liquid</option>
            <option value="moderate">Moderate</option>
            <option value="illiquid">Illiquid</option>
            <option value="frozen">Frozen</option>
          </select>
        </div>
        <select
          value={filterSport}
          onChange={(e) => setFilterSport(e.target.value)}
          className="bg-slate-800/60 border border-slate-700/50 rounded-lg px-2.5 py-2 text-sm text-white focus:outline-none"
        >
          <option value="all">All Sports</option>
          <option value="basketball">Basketball</option>
          <option value="football">Football</option>
          <option value="baseball">Baseball</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'score' | 'value' | 'days')}
          className="bg-slate-800/60 border border-slate-700/50 rounded-lg px-2.5 py-2 text-sm text-white focus:outline-none"
        >
          <option value="score">Sort: Liquidity Score</option>
          <option value="value">Sort: Value</option>
          <option value="days">Sort: Days to Sell</option>
        </select>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <button
            key={p.cardId}
            onClick={() => onSelectCard(p.cardId)}
            className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-left hover:border-slate-600 transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="min-w-0 flex-1 mr-3">
                <p className="text-white font-semibold truncate group-hover:text-brand-lime transition-colors">{p.player}</p>
                <p className="text-xs text-slate-400 truncate">{p.cardName}</p>
              </div>
              <LiquidityGauge score={p.liquidityScore} size={64} />
            </div>

            <div className="flex items-center gap-2 mb-3">
              <TierBadge tier={p.liquidityTier} />
              <span className="text-xs text-slate-500 capitalize">{p.sport}</span>
              {p.marketMakerPresence && (
                <span className="text-xs text-blue-400 flex items-center gap-0.5">
                  <Shield size={10} /> MM
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-slate-500">Value</p>
                <p className="text-sm font-semibold text-white">{fmtCurrency(p.currentValue)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Spread</p>
                <p className="text-sm font-semibold text-white">{fmtPct(p.bidAskSpread)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Days to Sell</p>
                <p className={`text-sm font-semibold flex items-center justify-center gap-0.5 ${daysColor(p.avgDaysToSell)}`}>
                  <Clock size={12} />
                  {p.avgDaysToSell}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
              <span>{p.activeListings} listings</span>
              <span>{p.recentSales30d} sales / 30d</span>
              <span className="flex items-center gap-0.5">
                {p.buyerSellerRatio >= 1.5 ? <ArrowUpRight size={12} className="text-green-400" /> : p.buyerSellerRatio < 1 ? <ArrowDownRight size={12} className="text-red-400" /> : null}
                {p.buyerSellerRatio.toFixed(1)}x B/S
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Market Depth
// ─────────────────────────────────────────────────────────────────────────────

function DepthTab({ profiles, selectedCardId }: { profiles: LiquidityProfile[]; selectedCardId: string | null }) {
  const [cardId, setCardId] = useState(selectedCardId || profiles[0]?.cardId || '');
  const profile = useMemo(() => profiles.find((p) => p.cardId === cardId), [profiles, cardId]);

  useEffect(() => {
    if (selectedCardId) setCardId(selectedCardId);
  }, [selectedCardId]);

  const depthData = useMemo(() => {
    if (!profile) return [];
    // Build mirrored depth data: bids on left (negative x), asks on right
    const bids = profile.depthLevels.filter((l) => l.bidVolume > 0).sort((a, b) => b.priceLevel - a.priceLevel);
    const asks = profile.depthLevels.filter((l) => l.askVolume > 0).sort((a, b) => a.priceLevel - b.priceLevel);

    let cumBid = 0;
    let cumAsk = 0;
    const points: { price: number; bidDepth: number; askDepth: number; bidVol: number; askVol: number }[] = [];

    for (const b of bids) {
      cumBid += b.bidVolume;
      points.push({ price: b.priceLevel, bidDepth: cumBid, askDepth: 0, bidVol: b.bidVolume, askVol: 0 });
    }
    for (const a of asks) {
      cumAsk += a.askVolume;
      points.push({ price: a.priceLevel, bidDepth: 0, askDepth: cumAsk, bidVol: 0, askVol: a.askVolume });
    }

    return points.sort((a, b) => a.price - b.price);
  }, [profile]);

  const [snapshot, setSnapshot] = useState<{ totalBidDepth: number; totalAskDepth: number; imbalanceRatio: number; pressureDirection: string } | null>(null);

  useEffect(() => {
    if (!cardId) return;
    getMarketDepth(cardId).then(setSnapshot);
  }, [cardId]);

  if (!profile) return <div className="text-slate-500 text-center py-12">Select a card to view market depth.</div>;

  return (
    <div className="space-y-6">
      {/* Card selector */}
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={cardId}
          onChange={(e) => setCardId(e.target.value)}
          className="bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none min-w-[300px]"
        >
          {profiles.map((p) => (
            <option key={p.cardId} value={p.cardId}>{p.player} — {p.cardName}</option>
          ))}
        </select>
        <TierBadge tier={profile.liquidityTier} />
        <span className="text-sm text-slate-400">Score: <span className="font-bold text-white">{profile.liquidityScore}</span></span>
      </div>

      {/* Snapshot stats */}
      {snapshot && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Bid Depth" value={snapshot.totalBidDepth} sub="units" icon={<TrendingUp size={18} className="text-green-400" />} />
          <StatCard label="Total Ask Depth" value={snapshot.totalAskDepth} sub="units" icon={<TrendingDown size={18} className="text-red-400" />} />
          <StatCard label="Imbalance Ratio" value={`${snapshot.imbalanceRatio}x`} sub={snapshot.pressureDirection === 'buy' ? 'Buy pressure' : snapshot.pressureDirection === 'sell' ? 'Sell pressure' : 'Balanced'} icon={<Activity size={18} />} />
          <StatCard label="Bid-Ask Spread" value={fmtPct(profile.bidAskSpread)} sub={`${fmtCurrency(profile.currentValue * profile.bidAskSpread)} wide`} icon={<Layers size={18} />} />
        </div>
      )}

      {/* Depth chart */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">Order Book Depth — {profile.player}</h3>
        <ResponsiveContainer width="100%" height={360}>
          <AreaChart data={depthData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="price"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(v: number) => fmtCurrency(v)}
            />
            <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
              labelFormatter={(v: number) => `Price: ${fmtCurrency(v)}`}
              formatter={(value: number, name: string) => [value, name === 'bidDepth' ? 'Cumulative Bids' : 'Cumulative Asks']}
            />
            <ReferenceLine x={profile.currentValue} stroke="#94a3b8" strokeDasharray="5 5" label={{ value: 'Mid', fill: '#94a3b8', fontSize: 11 }} />
            <Area type="stepAfter" dataKey="bidDepth" stroke="#10b981" fill="#10b981" fillOpacity={0.25} strokeWidth={2} name="bidDepth" />
            <Area type="stepAfter" dataKey="askDepth" stroke="#ef4444" fill="#ef4444" fillOpacity={0.25} strokeWidth={2} name="askDepth" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Exit Planner
// ─────────────────────────────────────────────────────────────────────────────

function ExitPlannerTab({ profiles, selectedCardId }: { profiles: LiquidityProfile[]; selectedCardId: string | null }) {
  const [cardId, setCardId] = useState(selectedCardId || profiles[0]?.cardId || '');
  const [strategies, setStrategies] = useState<ExitStrategy[]>([]);
  const [timing, setTiming] = useState<{ bestMonth: string; reason: string; expectedPremium: number; currentVsOptimal: number } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedCardId) setCardId(selectedCardId);
  }, [selectedCardId]);

  useEffect(() => {
    if (!cardId) return;
    setLoading(true);
    Promise.all([getExitStrategies(cardId), getOptimalExitTiming(cardId)]).then(([strats, t]) => {
      setStrategies(strats);
      setTiming(t);
      setLoading(false);
    });
  }, [cardId]);

  const profile = useMemo(() => profiles.find((p) => p.cardId === cardId), [profiles, cardId]);
  const bestNet = useMemo(() => Math.max(...strategies.map((s) => s.netProceeds), 0), [strategies]);

  const chartData = useMemo(
    () =>
      strategies.map((s) => ({
        method: s.method.charAt(0).toUpperCase() + s.method.slice(1).replace('-', ' '),
        netProceeds: s.netProceeds,
        fees: s.fees,
        confidence: s.confidence,
      })),
    [strategies]
  );

  const methodColors: Record<string, string> = {
    auction: '#8b5cf6',
    'buy-it-now': '#3b82f6',
    consignment: '#06b6d4',
    dealer: '#f59e0b',
    trade: '#10b981',
    fractional: '#ec4899',
  };

  if (loading) return <LoadingSpinner />;
  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={cardId}
          onChange={(e) => setCardId(e.target.value)}
          className="bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none min-w-[300px]"
        >
          {profiles.map((p) => (
            <option key={p.cardId} value={p.cardId}>{p.player} — {p.cardName}</option>
          ))}
        </select>
        {timing && (
          <div className="flex items-center gap-2 text-sm">
            <Clock size={14} className="text-blue-400" />
            <span className="text-slate-400">Best exit:</span>
            <span className="text-white font-semibold">{timing.bestMonth}</span>
            {timing.expectedPremium > 0 && (
              <span className="text-emerald-400 text-xs">+{fmtCurrency(timing.expectedPremium)} premium</span>
            )}
          </div>
        )}
      </div>

      {/* Net proceeds bar chart */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">Net Proceeds by Exit Method</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="method" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v: number) => fmtCurrency(v)} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
              formatter={(value: number, name: string) => [fmtCurrency(value), name === 'netProceeds' ? 'Net Proceeds' : 'Fees']}
            />
            <Bar dataKey="netProceeds" fill="#10b981" radius={[4, 4, 0, 0]} name="netProceeds" />
            <Bar dataKey="fees" fill="#ef4444" radius={[4, 4, 0, 0]} name="fees" opacity={0.6} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Strategy comparison table */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-slate-400 font-medium px-4 py-3">Method</th>
                <th className="text-right text-slate-400 font-medium px-4 py-3">Est. Price</th>
                <th className="text-right text-slate-400 font-medium px-4 py-3">Fees</th>
                <th className="text-right text-slate-400 font-medium px-4 py-3">Net Proceeds</th>
                <th className="text-center text-slate-400 font-medium px-4 py-3">Time</th>
                <th className="text-center text-slate-400 font-medium px-4 py-3">Confidence</th>
                <th className="text-left text-slate-400 font-medium px-4 py-3">Pros</th>
                <th className="text-left text-slate-400 font-medium px-4 py-3">Cons</th>
              </tr>
            </thead>
            <tbody>
              {strategies.map((s) => {
                const isBest = s.netProceeds === bestNet;
                return (
                  <tr key={s.method} className={`border-b border-slate-700/30 ${isBest ? 'bg-emerald-500/5' : 'hover:bg-slate-700/20'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: methodColors[s.method] || '#64748b' }} />
                        <span className="text-white font-medium capitalize">{s.method.replace('-', ' ')}</span>
                        {isBest && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-semibold">BEST</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-white">{fmtCurrency(s.estimatedPrice)}</td>
                    <td className="px-4 py-3 text-right text-red-400">{s.fees > 0 ? `-${fmtCurrency(s.fees)}` : '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-white">{fmtCurrency(s.netProceeds)}</td>
                    <td className="px-4 py-3 text-center text-slate-300">{s.estimatedTime}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-semibold ${s.confidence >= 80 ? 'text-emerald-400' : s.confidence >= 60 ? 'text-yellow-400' : 'text-orange-400'}`}>
                        {s.confidence}%
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <ul className="space-y-0.5">
                        {s.pros.slice(0, 2).map((pro, i) => (
                          <li key={i} className="flex items-start gap-1 text-xs text-green-400">
                            <CheckCircle size={10} className="mt-0.5 shrink-0" />
                            <span className="text-slate-300">{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <ul className="space-y-0.5">
                        {s.cons.slice(0, 2).map((con, i) => (
                          <li key={i} className="flex items-start gap-1 text-xs text-red-400">
                            <XCircle size={10} className="mt-0.5 shrink-0" />
                            <span className="text-slate-300">{con}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {timing && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
          <Info size={18} className="text-blue-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-white font-medium">Optimal Exit Timing: {timing.bestMonth}</p>
            <p className="text-xs text-slate-400 mt-1">{timing.reason}</p>
            <p className="text-xs text-slate-500 mt-1">Current price is ~{timing.currentVsOptimal}% of optimal seasonal pricing.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Volume Analysis
// ─────────────────────────────────────────────────────────────────────────────

function VolumeTab({ profiles, selectedCardId }: { profiles: LiquidityProfile[]; selectedCardId: string | null }) {
  const [cardId, setCardId] = useState(selectedCardId || profiles[0]?.cardId || '');
  const [months, setMonths] = useState(12);
  const [volumeData, setVolumeData] = useState<VolumePoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedCardId) setCardId(selectedCardId);
  }, [selectedCardId]);

  useEffect(() => {
    if (!cardId) return;
    setLoading(true);
    getVolumeHistory(cardId, months).then((d) => {
      setVolumeData(d);
      setLoading(false);
    });
  }, [cardId, months]);

  const profile = useMemo(() => profiles.find((p) => p.cardId === cardId), [profiles, cardId]);

  const chartData = useMemo(
    () =>
      volumeData.map((v) => ({
        date: v.date,
        volume: v.volume,
        avgPrice: v.avgPrice,
        highPrice: v.highPrice,
        lowPrice: v.lowPrice,
        range: v.highPrice - v.lowPrice,
      })),
    [volumeData]
  );

  const volStats = useMemo(() => {
    if (volumeData.length === 0) return null;
    const totalVol = volumeData.reduce((s, v) => s + v.volume, 0);
    const avgVol = Math.round(totalVol / volumeData.length);
    const maxVol = Math.max(...volumeData.map((v) => v.volume));
    const minVol = Math.min(...volumeData.map((v) => v.volume));
    const latestVol = volumeData[volumeData.length - 1]?.volume || 0;
    const prevVol = volumeData[volumeData.length - 2]?.volume || 1;
    const volChange = Math.round(((latestVol - prevVol) / prevVol) * 100);
    return { totalVol, avgVol, maxVol, minVol, latestVol, volChange };
  }, [volumeData]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={cardId}
          onChange={(e) => setCardId(e.target.value)}
          className="bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none min-w-[300px]"
        >
          {profiles.map((p) => (
            <option key={p.cardId} value={p.cardId}>{p.player} — {p.cardName}</option>
          ))}
        </select>
        <div className="flex gap-1">
          {[3, 6, 12].map((m) => (
            <button
              key={m}
              onClick={() => setMonths(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${months === m ? 'bg-brand-lime/20 text-brand-lime' : 'bg-slate-800/60 text-slate-400 hover:text-white'}`}
            >
              {m}M
            </button>
          ))}
        </div>
      </div>

      {/* Volume stats */}
      {volStats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard label="Total Volume" value={volStats.totalVol.toLocaleString()} sub={`${months} months`} icon={<BarChart3 size={18} />} />
          <StatCard label="Avg Monthly" value={volStats.avgVol.toLocaleString()} icon={<Activity size={18} />} />
          <StatCard label="Peak Volume" value={volStats.maxVol.toLocaleString()} icon={<TrendingUp size={18} />} />
          <StatCard label="Latest Month" value={volStats.latestVol.toLocaleString()} icon={<Layers size={18} />} />
          <StatCard
            label="MoM Change"
            value={`${volStats.volChange >= 0 ? '+' : ''}${volStats.volChange}%`}
            icon={volStats.volChange >= 0 ? <ArrowUpRight size={18} className="text-green-400" /> : <ArrowDownRight size={18} className="text-red-400" />}
          />
        </div>
      )}

      {/* Candlestick-style composed chart */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">Volume & Price History — {profile?.player}</h3>
        <ResponsiveContainer width="100%" height={380}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis yAxisId="vol" orientation="left" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis yAxisId="price" orientation="right" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v: number) => fmtCurrency(v)} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
              formatter={(value: number, name: string) => {
                if (name === 'volume') return [value.toLocaleString(), 'Volume'];
                return [fmtCurrency(value), name === 'avgPrice' ? 'Avg Price' : name === 'highPrice' ? 'High' : 'Low'];
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
            <Bar yAxisId="vol" dataKey="volume" fill="#3b82f6" fillOpacity={0.4} radius={[3, 3, 0, 0]} name="volume" />
            <Line yAxisId="price" type="monotone" dataKey="avgPrice" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} name="avgPrice" />
            <Line yAxisId="price" type="monotone" dataKey="highPrice" stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 4" dot={false} name="highPrice" />
            <Line yAxisId="price" type="monotone" dataKey="lowPrice" stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 4" dot={false} name="lowPrice" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Portfolio Liquidity
// ─────────────────────────────────────────────────────────────────────────────

function PortfolioTab({ profiles }: { profiles: LiquidityProfile[] }) {
  const [portfolio, setPortfolio] = useState<PortfolioLiquidity | null>(null);
  const [loading, setLoading] = useState(true);
  const [urgency, setUrgency] = useState<'relaxed' | 'normal' | 'urgent' | 'fire-sale'>('normal');
  const [simResult, setSimResult] = useState<Awaited<ReturnType<typeof simulateLiquidation>> | null>(null);

  useEffect(() => {
    const ids = profiles.map((p) => p.cardId);
    getPortfolioLiquidity(ids).then((pl) => {
      setPortfolio(pl);
      setLoading(false);
    });
  }, [profiles]);

  const handleSimulate = useCallback(() => {
    const ids = profiles.map((p) => p.cardId);
    simulateLiquidation(ids, urgency).then(setSimResult);
  }, [profiles, urgency]);

  const tierDistribution = useMemo(() => {
    const tiers: LiquidityTier[] = ['ultra-liquid', 'liquid', 'moderate', 'illiquid', 'frozen'];
    return tiers.map((tier, i) => {
      const cards = profiles.filter((p) => p.liquidityTier === tier);
      return {
        name: TIER_STYLES[tier].label,
        value: cards.reduce((s, p) => s + p.currentValue, 0),
        count: cards.length,
        color: PIE_COLORS[i],
      };
    }).filter((d) => d.value > 0);
  }, [profiles]);

  if (loading) return <LoadingSpinner />;
  if (!portfolio) return null;

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Total Value" value={fmtCurrency(portfolio.totalValue)} icon={<DollarSign size={18} />} />
        <StatCard label="Liquid Value" value={fmtCurrency(portfolio.liquidValue)} sub={`${Math.round((portfolio.liquidValue / portfolio.totalValue) * 100)}%`} icon={<Droplets size={18} className="text-green-400" />} />
        <StatCard label="Illiquid Value" value={fmtCurrency(portfolio.illiquidValue)} sub={`${Math.round((portfolio.illiquidValue / portfolio.totalValue) * 100)}%`} icon={<Snowflake size={18} className="text-orange-400" />} />
        <StatCard label="Weighted Score" value={portfolio.weightedLiquidityScore} sub="out of 100" icon={<Activity size={18} />} />
        <StatCard label="Full Liquidation" value={portfolio.timeToFullLiquidation} icon={<Clock size={18} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Value by Liquidity Tier</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={tierDistribution}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
              >
                {tierDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                formatter={(value: number, name: string) => [fmtCurrency(value), name]}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Liquidation sequence */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Optimal Liquidation Order</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {portfolio.optimalLiquidationOrder.slice(0, 15).map((item) => {
              const card = profiles.find((p) => p.cardId === item.cardId);
              if (!card) return null;
              return (
                <div key={item.cardId} className="flex items-center gap-3 py-2 px-3 bg-slate-700/20 rounded-lg">
                  <span className="text-xs font-bold text-slate-500 w-6 text-center">#{item.order}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{card.player}</p>
                    <p className="text-xs text-slate-500 truncate">{item.reason}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-white">{fmtCurrency(card.currentValue)}</p>
                    <TierBadge tier={card.liquidityTier} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Liquidation simulator */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Liquidation Simulator</h3>
          <div className="flex items-center gap-2">
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as typeof urgency)}
              className="bg-slate-700/60 border border-slate-600/50 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
            >
              <option value="relaxed">Relaxed (max value)</option>
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="fire-sale">Fire Sale</option>
            </select>
            <button
              onClick={handleSimulate}
              className="px-4 py-1.5 bg-brand-lime/20 text-brand-lime rounded-lg text-sm font-medium hover:bg-brand-lime/30 transition-colors"
            >
              Simulate
            </button>
          </div>
        </div>

        {simResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Total Proceeds" value={fmtCurrency(simResult.totalProceeds)} icon={<DollarSign size={18} className="text-green-400" />} />
              <StatCard label="Total Fees" value={fmtCurrency(simResult.totalFees)} icon={<DollarSign size={18} className="text-red-400" />} />
              <StatCard label="Estimated Days" value={simResult.estimatedDays} icon={<Clock size={18} />} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left text-slate-400 font-medium px-3 py-2">Card</th>
                    <th className="text-center text-slate-400 font-medium px-3 py-2">Method</th>
                    <th className="text-right text-slate-400 font-medium px-3 py-2">Proceeds</th>
                    <th className="text-right text-slate-400 font-medium px-3 py-2">Fees</th>
                    <th className="text-center text-slate-400 font-medium px-3 py-2">Days</th>
                  </tr>
                </thead>
                <tbody>
                  {simResult.perCard.slice(0, 12).map((r) => {
                    const card = profiles.find((p) => p.cardId === r.cardId);
                    return (
                      <tr key={r.cardId} className="border-b border-slate-700/20 hover:bg-slate-700/20">
                        <td className="px-3 py-2 text-white">{card?.player ?? r.cardId}</td>
                        <td className="px-3 py-2 text-center text-slate-300 capitalize">{r.method.replace('-', ' ')}</td>
                        <td className="px-3 py-2 text-right text-green-400 font-medium">{fmtCurrency(r.proceeds)}</td>
                        <td className="px-3 py-2 text-right text-red-400">{r.fees > 0 ? fmtCurrency(r.fees) : '—'}</td>
                        <td className="px-3 py-2 text-center text-slate-300">{r.days}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Crisis Monitor
// ─────────────────────────────────────────────────────────────────────────────

function CrisisTab({ profiles }: { profiles: LiquidityProfile[] }) {
  const [crises, setCrises] = useState<LiquidityCrisis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLiquidityCrises().then((c) => {
      setCrises(c);
      setLoading(false);
    });
  }, []);

  const [heatMap, setHeatMap] = useState<{ tier: LiquidityTier; count: number; totalValue: number; avgDaysToSell: number }[]>([]);

  useEffect(() => {
    getLiquidityHeatMap().then(setHeatMap);
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Heat map summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {heatMap.map((h) => {
          const style = TIER_STYLES[h.tier];
          return (
            <div key={h.tier} className={`${style.bg} border ${style.border} rounded-xl p-4`}>
              <p className={`text-xs font-semibold uppercase tracking-wider ${style.text}`}>{style.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{h.count}</p>
              <p className="text-xs text-slate-400">{fmtCurrency(h.totalValue)} total</p>
              <p className="text-xs text-slate-500">{h.avgDaysToSell}d avg sale</p>
            </div>
          );
        })}
      </div>

      {/* Active crises */}
      <div>
        <h3 className="text-white font-semibold text-lg mb-4">
          Active Liquidity Alerts
          {crises.length > 0 && (
            <span className="ml-2 text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-medium">{crises.length} active</span>
          )}
        </h3>

        {crises.length === 0 ? (
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-8 text-center">
            <Shield size={40} className="text-emerald-400 mx-auto mb-3" />
            <p className="text-white font-medium">No Active Crises</p>
            <p className="text-slate-500 text-sm mt-1">All monitored cards are within healthy liquidity parameters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {crises.map((crisis) => {
              const sev = SEVERITY_STYLES[crisis.severity];
              const card = profiles.find((p) => p.cardId === crisis.cardId);
              const scoreDrop = crisis.previousLiquidityScore - crisis.currentLiquidityScore;
              return (
                <div key={crisis.cardId} className={`${sev.bg} border ${sev.border} rounded-xl p-5`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${sev.bg} ${sev.text}`}>{sev.icon}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-semibold">{crisis.player}</p>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${sev.bg} ${sev.text} border ${sev.border}`}>
                            {crisis.severity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{crisis.cardName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <ArrowDownRight size={14} className="text-red-400" />
                        <span className="text-red-400 font-bold text-sm">-{scoreDrop} pts</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {crisis.previousLiquidityScore} &rarr; {crisis.currentLiquidityScore}
                      </p>
                    </div>
                  </div>

                  {/* Triggers */}
                  <div className="mb-3">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1.5">Triggers</p>
                    <ul className="space-y-1">
                      {crisis.triggers.map((t, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-slate-300">
                          <AlertTriangle size={10} className={`mt-0.5 shrink-0 ${sev.text}`} />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendation */}
                  <div className="bg-slate-900/40 rounded-lg p-3 mb-3">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">Recommendation</p>
                    <p className="text-sm text-slate-200">{crisis.recommendation}</p>
                  </div>

                  {/* Recovery timeline */}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      Est. Recovery: <span className="text-slate-300 font-medium">{crisis.estimatedRecovery}</span>
                    </span>
                    <span>
                      Detected: {new Date(crisis.detectedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

const LiquidityDepthScanner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [profiles, setProfiles] = useState<LiquidityProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  useEffect(() => {
    getAllLiquidityProfiles().then((p) => {
      setProfiles(p);
      setLoading(false);
    });
  }, []);

  const handleSelectCard = useCallback((cardId: string) => {
    setSelectedCardId(cardId);
    setActiveTab('depth');
  }, []);

  const crisisCount = useMemo(() => {
    // Sync count from profiles with illiquid/frozen that are degrading
    return profiles.filter((p) => p.liquidityTier === 'illiquid' || p.liquidityTier === 'frozen').length;
  }, [profiles]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl md:text-7xl font-bebas tracking-tight text-white leading-none">
            Liquidity <span className="text-brand-lime">Depth Scanner</span>
          </h1>
          <p className="text-brand-muted max-w-2xl font-medium">
            Real-time market depth analysis, bid-ask spreads, volume profiles, and exit strategy optimization for your sports card portfolio.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live data
          </div>
          <span className="text-slate-600">|</span>
          <span>{profiles.length} cards tracked</span>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 overflow-x-auto pb-1 -mb-px">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-brand-lime/15 text-brand-lime border border-brand-lime/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.id === 'crisis' && crisisCount > 0 && (
              <span className="ml-1 bg-red-500/20 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{crisisCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {activeTab === 'dashboard' && <DashboardTab profiles={profiles} onSelectCard={handleSelectCard} />}
          {activeTab === 'depth' && <DepthTab profiles={profiles} selectedCardId={selectedCardId} />}
          {activeTab === 'exit' && <ExitPlannerTab profiles={profiles} selectedCardId={selectedCardId} />}
          {activeTab === 'volume' && <VolumeTab profiles={profiles} selectedCardId={selectedCardId} />}
          {activeTab === 'portfolio' && <PortfolioTab profiles={profiles} />}
          {activeTab === 'crisis' && <CrisisTab profiles={profiles} />}
        </>
      )}
    </div>
  );
};

export default LiquidityDepthScanner;
