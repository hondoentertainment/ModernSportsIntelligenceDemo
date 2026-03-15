import React, { useState, useEffect, useMemo } from 'react';
import {
  Video,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Star,
  Users,
  Zap,
  Package,
  Clock,
  BarChart3,
  Filter,
  Play,
  Award,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  getLiveBreaks,
  getUpcomingBreaks,
  getBreakResults,
  getBreakerProfiles,
  getTopBreakers,
  getBreakROIStats,
  getProductEVs,
  getBreakTypeLabel,
  getPlatformColor,
  getPlatformLabel,
  getStatusColor,
  formatCurrency,
  formatROI,
  type LiveBreak,
  type BreakResult,
  type BreakerProfile,
  type BreakROIStats,
  type ProductEV,
  type BreakPlatform,
  type BreakType,
  type BreakHit,
} from '../lib/liveBreakRoiService.ts';

const CHART_COLORS = [
  '#a78bfa', '#60a5fa', '#f87171', '#c084fc', '#34d399',
  '#fbbf24', '#22d3ee', '#fb923c', '#e879f9', '#4ade80',
];

type TabKey = 'live' | 'results' | 'ev' | 'breakers';

const LiveBreakRoi: React.FC = () => {
  const [breaks, setBreaks] = useState<LiveBreak[]>([]);
  const [results, setResults] = useState<BreakResult[]>([]);
  const [breakers, setBreakers] = useState<BreakerProfile[]>([]);
  const [stats, setStats] = useState<BreakROIStats | null>(null);
  const [productEVs, setProductEVs] = useState<ProductEV[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('live');

  // Filters
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [evSort, setEvSort] = useState<'evRatio' | 'boxPrice' | 'expectedValue'>('evRatio');
  const [evSortDir, setEvSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    try {
      setBreaks(getLiveBreaks());
      setResults(getBreakResults());
      setBreakers(getTopBreakers());
      setStats(getBreakROIStats());
      setProductEVs(getProductEVs());
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Derived filter options ──
  const platforms = useMemo(() => {
    const set = new Set(breaks.map((b) => b.platform));
    return Array.from(set);
  }, [breaks]);

  const sports = useMemo(() => {
    const set = new Set(breaks.map((b) => b.sport));
    return Array.from(set);
  }, [breaks]);

  const breakTypes = useMemo(() => {
    const set = new Set(breaks.map((b) => b.breakType));
    return Array.from(set);
  }, [breaks]);

  // ── Filtered live breaks ──
  const filteredBreaks = useMemo(() => {
    return breaks.filter((b) => {
      if (platformFilter !== 'all' && b.platform !== platformFilter) return false;
      if (sportFilter !== 'all' && b.sport !== sportFilter) return false;
      if (typeFilter !== 'all' && b.breakType !== typeFilter) return false;
      return true;
    });
  }, [breaks, platformFilter, sportFilter, typeFilter]);

  const upcomingBreaks = useMemo(
    () => filteredBreaks.filter((b) => b.status === 'upcoming' || b.status === 'live'),
    [filteredBreaks],
  );

  const completedBreaks = useMemo(
    () => filteredBreaks.filter((b) => b.status === 'completed'),
    [filteredBreaks],
  );

  // ── Filtered results ──
  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      if (platformFilter !== 'all' && r.platform !== platformFilter) return false;
      if (sportFilter !== 'all' && r.sport !== sportFilter) return false;
      return true;
    });
  }, [results, platformFilter, sportFilter]);

  // ── Sorted EV table ──
  const sortedEVs = useMemo(() => {
    const list = [...productEVs];
    if (sportFilter !== 'all') {
      const filtered = list.filter((e) => e.sport === sportFilter);
      filtered.sort((a, b) => evSortDir === 'desc' ? b[evSort] - a[evSort] : a[evSort] - b[evSort]);
      return filtered;
    }
    list.sort((a, b) => evSortDir === 'desc' ? b[evSort] - a[evSort] : a[evSort] - b[evSort]);
    return list;
  }, [productEVs, sportFilter, evSort, evSortDir]);

  // ── Chart data ──
  const roiByTypeData = useMemo(() => {
    if (!stats) return [];
    return stats.avgROIByType.map((d) => ({
      name: getBreakTypeLabel(d.type),
      avgROI: d.avgROI,
      count: d.count,
    }));
  }, [stats]);

  const monthlyData = useMemo(() => {
    if (!stats) return [];
    return stats.monthlySpend.map((d) => ({
      month: d.month.slice(5), // MM
      spent: d.spent,
      value: d.value,
      roi: d.roi,
    }));
  }, [stats]);

  const platformBreakdown = useMemo(() => {
    if (!stats) return [];
    return stats.avgROIByPlatform.map((d) => ({
      name: getPlatformLabel(d.platform),
      value: d.count,
      avgROI: d.avgROI,
    }));
  }, [stats]);

  const handleEvSort = (col: 'evRatio' | 'boxPrice' | 'expectedValue') => {
    if (evSort === col) {
      setEvSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setEvSort(col);
      setEvSortDir('desc');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-[1400px] mx-auto">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Video className="text-purple-400" size={28} /> Live Break ROI Tracker
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Track live breaks, analyze ROI, and find the best expected value products
          </p>
        </div>
      </div>

      {/* ─── ROI Stats Banner ─── */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard
            icon={<DollarSign size={18} className="text-blue-400" />}
            label="Total Spent"
            value={formatCurrency(stats.totalSpent)}
          />
          <StatCard
            icon={<TrendingUp size={18} className="text-emerald-400" />}
            label="Total Value"
            value={formatCurrency(stats.totalValuePulled)}
          />
          <StatCard
            icon={stats.netROI >= 0
              ? <TrendingUp size={18} className="text-emerald-400" />
              : <TrendingDown size={18} className="text-red-400" />}
            label="Net ROI"
            value={formatCurrency(stats.netROI)}
            sub={formatROI(stats.roiPercent)}
            subColor={stats.roiPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}
          />
          <StatCard
            icon={<Zap size={18} className="text-amber-400" />}
            label="Hit Rate"
            value={`${stats.hitRate}%`}
            sub={`${stats.totalBreaksJoined} breaks`}
          />
          <StatCard
            icon={<Award size={18} className="text-purple-400" />}
            label="Best Break"
            value={formatCurrency(stats.bestBreak.roi)}
            sub={stats.bestBreak.topHit}
            subColor="text-purple-400"
          />
        </div>
      )}

      {/* ─── Filters ─── */}
      <div className="flex flex-wrap items-center gap-3 bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
        <Filter size={16} className="text-gray-400" />
        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className="bg-gray-700 text-gray-200 text-sm rounded px-2 py-1 border border-gray-600"
        >
          <option value="all">All Platforms</option>
          {platforms.map((p) => (
            <option key={p} value={p}>{getPlatformLabel(p)}</option>
          ))}
        </select>
        <select
          value={sportFilter}
          onChange={(e) => setSportFilter(e.target.value)}
          className="bg-gray-700 text-gray-200 text-sm rounded px-2 py-1 border border-gray-600"
        >
          <option value="all">All Sports</option>
          {sports.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-gray-700 text-gray-200 text-sm rounded px-2 py-1 border border-gray-600"
        >
          <option value="all">All Break Types</option>
          {breakTypes.map((t) => (
            <option key={t} value={t}>{getBreakTypeLabel(t as BreakType)}</option>
          ))}
        </select>
      </div>

      {/* ─── Tabs ─── */}
      <div className="flex gap-1 bg-gray-800/60 rounded-lg p-1 border border-gray-700/50 overflow-x-auto">
        {([
          { key: 'live' as TabKey, label: 'Live & Upcoming', icon: <Play size={14} /> },
          { key: 'results' as TabKey, label: 'Break Results', icon: <BarChart3 size={14} /> },
          { key: 'ev' as TabKey, label: 'Product EV', icon: <Package size={14} /> },
          { key: 'breakers' as TabKey, label: 'Top Breakers', icon: <Users size={14} /> },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Tab Content ─── */}
      {activeTab === 'live' && (
        <div className="space-y-6">
          {/* Live / Upcoming Breaks */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Play size={18} className="text-red-400" /> Live & Upcoming Breaks
              <span className="text-sm font-normal text-gray-400">({upcomingBreaks.length})</span>
            </h2>
            {upcomingBreaks.length === 0 ? (
              <div className="bg-gray-800/50 rounded-lg p-8 text-center text-gray-400 border border-gray-700/50">
                No upcoming breaks match the current filters.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingBreaks.map((b) => (
                  <BreakCard key={b.id} brk={b} />
                ))}
              </div>
            )}
          </div>

          {/* ROI by Type Chart */}
          {roiByTypeData.length > 0 && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <BarChart3 size={16} className="text-purple-400" /> Average Expected ROI by Break Type
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roiByTypeData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                      labelStyle={{ color: '#e5e7eb' }}
                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'Avg ROI']}
                    />
                    <Bar dataKey="avgROI" radius={[4, 4, 0, 0]}>
                      {roiByTypeData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Platform breakdown pie */}
          {platformBreakdown.length > 0 && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Video size={16} className="text-blue-400" /> Breaks by Platform
              </h3>
              <div className="h-56 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={platformBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, value }) => `${name} (${value})`}
                    >
                      {platformBreakdown.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                      formatter={(value: number, _name: string, entry: any) => [
                        `${value} breaks | Avg ROI: ${entry.payload.avgROI}%`,
                        entry.payload.name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'results' && (
        <div className="space-y-6">
          {/* Break Results */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <BarChart3 size={18} className="text-emerald-400" /> Break Results
              <span className="text-sm font-normal text-gray-400">({filteredResults.length})</span>
            </h2>
            {filteredResults.length === 0 ? (
              <div className="bg-gray-800/50 rounded-lg p-8 text-center text-gray-400 border border-gray-700/50">
                No break results match the current filters.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredResults.map((r) => (
                  <ResultCard key={r.id} result={r} />
                ))}
              </div>
            )}
          </div>

          {/* Monthly Spend Chart */}
          {monthlyData.length > 0 && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-400" /> Monthly Spend vs Value
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                      labelStyle={{ color: '#e5e7eb' }}
                      formatter={(value: number, name: string) => [
                        formatCurrency(value),
                        name === 'spent' ? 'Spent' : 'Value Pulled',
                      ]}
                    />
                    <Line type="monotone" dataKey="spent" stroke="#f87171" strokeWidth={2} dot={{ fill: '#f87171' }} />
                    <Line type="monotone" dataKey="value" stroke="#34d399" strokeWidth={2} dot={{ fill: '#34d399' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Top Hits Gallery */}
          {stats && stats.topHits.length > 0 && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Award size={16} className="text-amber-400" /> Top Hits
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {stats.topHits.map((hit) => (
                  <HitCard key={hit.id} hit={hit} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'ev' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Package size={18} className="text-blue-400" /> Product Expected Value (EV) Table
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700/50">
                    <th className="text-left py-2 px-3 font-medium">Product</th>
                    <th className="text-left py-2 px-3 font-medium">Sport</th>
                    <th
                      className="text-right py-2 px-3 font-medium cursor-pointer hover:text-white"
                      onClick={() => handleEvSort('boxPrice')}
                    >
                      Box Price {evSort === 'boxPrice' ? (evSortDir === 'desc' ? '▼' : '▲') : ''}
                    </th>
                    <th
                      className="text-right py-2 px-3 font-medium cursor-pointer hover:text-white"
                      onClick={() => handleEvSort('expectedValue')}
                    >
                      Expected Value {evSort === 'expectedValue' ? (evSortDir === 'desc' ? '▼' : '▲') : ''}
                    </th>
                    <th
                      className="text-right py-2 px-3 font-medium cursor-pointer hover:text-white"
                      onClick={() => handleEvSort('evRatio')}
                    >
                      EV Ratio {evSort === 'evRatio' ? (evSortDir === 'desc' ? '▼' : '▲') : ''}
                    </th>
                    <th className="text-right py-2 px-3 font-medium">Sample</th>
                    <th className="text-left py-2 px-3 font-medium">Top Chase</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEVs.map((ev) => {
                    const isPositive = ev.evRatio >= 1;
                    return (
                      <tr key={ev.product} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                        <td className="py-2.5 px-3">
                          <span className="text-white font-medium">{ev.product}</span>
                          <span className="block text-xs text-gray-500">{ev.manufacturer} | {ev.year}</span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-300">{ev.sport}</td>
                        <td className="py-2.5 px-3 text-right text-gray-300">{formatCurrency(ev.boxPrice)}</td>
                        <td className="py-2.5 px-3 text-right text-gray-300">{formatCurrency(ev.expectedValue)}</td>
                        <td className={`py-2.5 px-3 text-right font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                          {ev.evRatio.toFixed(2)}x
                        </td>
                        <td className="py-2.5 px-3 text-right text-gray-400">{ev.sampleSize.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-gray-300 text-xs max-w-[200px] truncate">
                          {ev.topCards[0]?.cardName ?? '-'}
                          <span className="text-gray-500 ml-1">({ev.topCards[0]?.odds})</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'breakers' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Users size={18} className="text-purple-400" /> Top Breakers Leaderboard
            </h2>
            <div className="space-y-3">
              {breakers.map((bp, idx) => (
                <BreakerRow key={bp.id} profile={bp} rank={idx + 1} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Sub-components ───────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
}

function StatCard({ icon, label, value, sub, subColor }: StatCardProps) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <div className="text-lg font-bold text-white">{value}</div>
      {sub && (
        <div className={`text-xs mt-0.5 ${subColor ?? 'text-gray-500'} truncate`}>{sub}</div>
      )}
    </div>
  );
}

function BreakCard({ brk }: { brk: LiveBreak }) {
  const spotsRemaining = brk.spotsTotal - brk.spotsFilled;
  const fillPct = (brk.spotsFilled / brk.spotsTotal) * 100;
  const isLive = brk.status === 'live';

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-purple-500/30 transition">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-white truncate">{brk.title}</h4>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getStatusColor(brk.status)}`}>
              {isLive ? 'LIVE' : brk.status.toUpperCase()}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getPlatformColor(brk.platform)}`}>
              {getPlatformLabel(brk.platform)}
            </span>
          </div>
        </div>
        {isLive && (
          <span className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
        )}
      </div>

      <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
        <Star size={12} className="text-amber-400" />
        <span className="text-white font-medium">{brk.breaker}</span>
        <span>({brk.breakerRating})</span>
        {brk.breakerVerified && (
          <span className="text-[10px] px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Verified</span>
        )}
      </div>

      <div className="text-xs text-gray-400 mb-2">
        {brk.sport} | {getBreakTypeLabel(brk.breakType)}
      </div>

      <div className="flex items-center justify-between text-xs mb-2">
        <div>
          <span className="text-gray-400">Spot Price: </span>
          <span className="text-white font-semibold">{formatCurrency(brk.spotPrice)}</span>
        </div>
        <div>
          <span className="text-gray-400">Est. ROI: </span>
          <span className={brk.expectedROI >= 0 ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
            {formatROI(brk.expectedROI)}
          </span>
        </div>
      </div>

      <div className="mb-1">
        <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
          <span>{brk.spotsFilled}/{brk.spotsTotal} spots filled</span>
          <span>{spotsRemaining} remaining</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${fillPct >= 90 ? 'bg-red-500' : fillPct >= 60 ? 'bg-amber-500' : 'bg-purple-500'}`}
            style={{ width: `${fillPct}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-2">
        <Clock size={10} />
        <span>{new Date(brk.scheduledTime).toLocaleString()}</span>
      </div>
    </div>
  );
}

function ResultCard({ result }: { result: BreakResult }) {
  const isPositive = result.roi >= 0;

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div>
          <h4 className="text-sm font-semibold text-white">{result.breakTitle}</h4>
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getPlatformColor(result.platform)}`}>
              {getPlatformLabel(result.platform)}
            </span>
            <span>{result.sport}</span>
            <span>|</span>
            <span>{result.team}</span>
            <span>|</span>
            <span>{new Date(result.completedAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-gray-400">Cost: </span>
            <span className="text-white font-medium">{formatCurrency(result.spotCost)}</span>
          </div>
          <div>
            <span className="text-gray-400">Value: </span>
            <span className="text-white font-medium">{formatCurrency(result.totalValue)}</span>
          </div>
          <div>
            <span className="text-gray-400">ROI: </span>
            <span className={`font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatROI(result.roiPercent)}
            </span>
          </div>
        </div>
      </div>

      {result.hits.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {result.hits.map((hit) => (
            <div
              key={hit.id}
              className={`text-xs px-2 py-1 rounded-md border ${
                hit.isTopHit
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-gray-700/50 border-gray-600/50 text-gray-300'
              }`}
            >
              <span className="font-medium">{hit.cardName}</span>
              <span className="text-gray-400 ml-1">({formatCurrency(hit.estimatedValue)})</span>
            </div>
          ))}
        </div>
      )}

      {result.hits.length === 0 && (
        <div className="text-xs text-gray-500 italic">No notable hits in this break</div>
      )}
    </div>
  );
}

function HitCard({ hit }: { hit: BreakHit }) {
  return (
    <div className="bg-gray-800/60 rounded-lg p-3 border border-gray-700/50">
      <div className="text-sm font-semibold text-white truncate mb-1">{hit.cardName}</div>
      <div className="text-xs text-gray-400 mb-1">{hit.player} | {hit.year} {hit.set}</div>
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        {hit.parallel && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">{hit.parallel}</span>
        )}
        {hit.isAutographed && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">Auto</span>
        )}
        {hit.isNumbered && hit.printRun && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">/{hit.printRun}</span>
        )}
      </div>
      <div className="text-sm font-bold text-emerald-400">{formatCurrency(hit.estimatedValue)}</div>
    </div>
  );
}

function BreakerRow({ profile, rank }: { profile: BreakerProfile; rank: number }) {
  const avgRecent =
    profile.recentROIs.length > 0
      ? profile.recentROIs.reduce((s, v) => s + v, 0) / profile.recentROIs.length
      : 0;

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-white">
          {rank}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-white truncate">{profile.name}</span>
            {profile.verified && (
              <span className="text-[10px] px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Verified</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getPlatformColor(profile.platform)}`}>
              {getPlatformLabel(profile.platform)}
            </span>
            <span>{profile.specialty.join(', ')}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs flex-shrink-0">
        <div className="text-center">
          <div className="text-gray-400">Rating</div>
          <div className="text-white font-bold flex items-center gap-0.5">
            <Star size={12} className="text-amber-400" /> {profile.rating}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">Breaks</div>
          <div className="text-white font-bold">{profile.totalBreaks.toLocaleString()}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">Avg ROI</div>
          <div className={`font-bold ${profile.avgROI >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatROI(profile.avgROI)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">Hit Rate</div>
          <div className="text-white font-bold">{profile.avgHitRate}%</div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">Followers</div>
          <div className="text-white font-bold">
            {profile.followers >= 1000 ? `${(profile.followers / 1000).toFixed(0)}K` : profile.followers}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">Recent Avg</div>
          <div className={`font-bold ${avgRecent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatROI(avgRecent)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveBreakRoi;
