// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import {
  Scale,
  Gavel,
  TrendingUp,
  Users,
  BarChart3,
  Clock,
  AlertTriangle,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  getRuleChanges,
  getHistoricalImpacts,
  getAllPlayerImpacts,
  getPositionImpacts,
  getAllStatShifts,
  getStatShift,
  getUpcomingChanges,
  getProjectedStatLines,
  getCardPriceImpacts,
  getRuleChangeTimeline,
  getRuleChangeScenarios,
  getSportLabel,
  getCategoryLabel,
  getCategoryColor,
  formatPct,
  type RuleChange,
  type HistoricalRuleChange,
  type PlayerImpactProfile,
  type PositionImpact,
  type StatDistributionShift,
  type ProjectedStatLine,
  type CardPriceImpact,
  type RuleChangeTimelineEvent,
  type RuleChangeScenario,
  type Sport,
} from '../lib/analytics/ruleChangeService.ts';

type TabId = 'dashboard' | 'historical' | 'stat-shifts' | 'winners-losers' | 'scenario' | 'timeline';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Impact Dashboard', icon: <Scale size={16} /> },
  { id: 'historical', label: 'Historical Analysis', icon: <Gavel size={16} /> },
  { id: 'stat-shifts', label: 'Stat Shifts', icon: <TrendingUp size={16} /> },
  { id: 'winners-losers', label: 'Winners & Losers', icon: <Users size={16} /> },
  { id: 'scenario', label: 'Scenario Builder', icon: <BarChart3 size={16} /> },
  { id: 'timeline', label: 'Timeline', icon: <Clock size={16} /> },
];

const SPORT_COLORS: Record<Sport, string> = {
  mlb: '#ef4444',
  nfl: '#3b82f6',
  nba: '#f97316',
  nhl: '#06b6d4',
  soccer: '#22c55e',
};

const TOOLTIP_STYLE = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  fontSize: '12px',
};

const RuleChangeImpactModeler: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sportFilter, setSportFilter] = useState<Sport | 'all'>('all');

  // Data state
  const [ruleChanges, setRuleChanges] = useState<RuleChange[]>([]);
  const [historical, setHistorical] = useState<HistoricalRuleChange[]>([]);
  const [playerImpacts, setPlayerImpacts] = useState<PlayerImpactProfile[]>([]);
  const [statShifts, setStatShifts] = useState<StatDistributionShift[]>([]);
  const [projections, setProjections] = useState<ProjectedStatLine[]>([]);
  const [cardImpacts, setCardImpacts] = useState<CardPriceImpact[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<RuleChangeTimelineEvent[]>([]);
  const [scenarios, setScenarios] = useState<RuleChangeScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string>('');

  useEffect(() => {
    try {
      setRuleChanges(getRuleChanges());
      setHistorical(getHistoricalImpacts());
      setPlayerImpacts(getAllPlayerImpacts());
      setStatShifts(getAllStatShifts());
      setProjections(getProjectedStatLines());
      setCardImpacts(getCardPriceImpacts());
      setTimelineEvents(getRuleChangeTimeline());
      setScenarios(getRuleChangeScenarios());
      setLoading(false);
    } catch {
      setError('Failed to load Rule Change Impact data');
      setLoading(false);
    }
  }, []);

  // Filtered data
  const filteredHistorical = useMemo(
    () => sportFilter === 'all' ? historical : historical.filter(h => h.sport === sportFilter),
    [historical, sportFilter]
  );
  const filteredPlayerImpacts = useMemo(
    () => sportFilter === 'all' ? playerImpacts : playerImpacts.filter(p => p.sport === sportFilter),
    [playerImpacts, sportFilter]
  );

  // Dashboard aggregates
  const dashboardStats = useMemo(() => {
    const totalHistorical = historical.length;
    const upcoming = ruleChanges.filter(r => r.status === 'proposed' || r.status === 'approved').length;
    const avgImpact = historical.length > 0
      ? historical.reduce((s, h) => s + Math.abs(h.avgCardPriceImpactPct), 0) / historical.length
      : 0;
    const maxImpact = historical.reduce((max, h) => Math.max(max, h.topWinnerImpactPct), 0);
    const sportsAffected = new Set(ruleChanges.map(r => r.sport)).size;
    const hypothetical = ruleChanges.filter(r => r.status === 'hypothetical').length;
    return { totalHistorical, upcoming, avgImpact, maxImpact, sportsAffected, hypothetical };
  }, [historical, ruleChanges]);

  // Chart data
  const impactBySportData = useMemo(() => {
    const sportMap: Record<string, { sport: string; avgImpact: number; count: number }> = {};
    historical.forEach(h => {
      const label = getSportLabel(h.sport);
      if (!sportMap[label]) sportMap[label] = { sport: label, avgImpact: 0, count: 0 };
      sportMap[label].avgImpact += Math.abs(h.avgCardPriceImpactPct);
      sportMap[label].count += 1;
    });
    return Object.values(sportMap).map(s => ({ ...s, avgImpact: +(s.avgImpact / s.count).toFixed(1) }));
  }, [historical]);

  const categoryDistribution = useMemo(() => {
    const catMap: Record<string, number> = {};
    [...historical, ...ruleChanges].forEach(r => {
      const label = getCategoryLabel(r.category);
      catMap[label] = (catMap[label] || 0) + 1;
    });
    return Object.entries(catMap).map(([name, value]) => ({ name, value }));
  }, [historical, ruleChanges]);

  const historicalChartData = useMemo(
    () => filteredHistorical
      .sort((a, b) => a.year - b.year)
      .map(h => ({
        name: h.name.length > 25 ? h.name.slice(0, 25) + '...' : h.name,
        fullName: h.name,
        year: h.year,
        impact: h.avgCardPriceImpactPct,
        winner: h.topWinnerImpactPct,
        loser: h.topLoserImpactPct,
        sport: getSportLabel(h.sport),
      })),
    [filteredHistorical]
  );

  const scatterData = useMemo(
    () => filteredHistorical.map(h => ({
      x: h.marketReactionDays,
      y: h.avgCardPriceImpactPct,
      z: h.sustainedMonths,
      name: h.name,
      sport: h.sport,
    })),
    [filteredHistorical]
  );

  const selectedScenarioData = useMemo(() => {
    if (!selectedScenario) return null;
    return scenarios.find(s => s.id === selectedScenario) || null;
  }, [selectedScenario, scenarios]);

  const scenarioProjections = useMemo(() => {
    if (!selectedScenarioData) return [];
    const rcId = ruleChanges.find(r => r.name.includes(selectedScenarioData.name.split(' ').slice(0, 2).join(' ')))?.id;
    if (!rcId) return projections.slice(0, 4);
    const matched = projections.filter(p => p.ruleChangeId === rcId);
    return matched.length > 0 ? matched : projections.slice(0, 4);
  }, [selectedScenarioData, projections, ruleChanges]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Rule Change Impact Modeler...</p>
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
          <div className="p-2 rounded-xl bg-indigo-500/20">
            <Scale size={24} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Referee &amp; Rule Change Impact Modeler</h1>
            <p className="text-sm text-slate-400">Analyze how rule changes affect player stats, card values &amp; collecting strategy &mdash; Phase 145</p>
          </div>
        </div>
        {/* Sport Filter */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-500" />
          <select
            value={sportFilter}
            onChange={e => setSportFilter(e.target.value as Sport | 'all')}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Sports</option>
            <option value="mlb">MLB</option>
            <option value="nfl">NFL</option>
            <option value="nba">NBA</option>
            <option value="nhl">NHL</option>
            <option value="soccer">Soccer</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/50 border border-slate-700/50 rounded-xl p-1 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════ TAB: Impact Dashboard ═══════════════════════ */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Historical Rules</p>
              <p className="text-3xl font-bold text-indigo-400">{dashboardStats.totalHistorical}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Upcoming</p>
              <p className="text-3xl font-bold text-emerald-400">{dashboardStats.upcoming}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Card Impact</p>
              <p className="text-2xl font-bold text-amber-400">{formatPct(dashboardStats.avgImpact)}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Max Winner</p>
              <p className="text-2xl font-bold text-green-400">{formatPct(dashboardStats.maxImpact)}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Sports Covered</p>
              <p className="text-3xl font-bold text-cyan-400">{dashboardStats.sportsAffected}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Hypothetical</p>
              <p className="text-3xl font-bold text-purple-400">{dashboardStats.hypothetical}</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Impact by Sport */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="text-indigo-400" />
                Average Card Impact by Sport
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={impactBySportData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="sport" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v: number) => `${v}%`} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => [`${value}%`, 'Avg Impact']} />
                    <Bar dataKey="avgImpact" name="Avg Impact %" radius={[4, 4, 0, 0]}>
                      {impactBySportData.map((entry, idx) => {
                        const sportKey = Object.entries({ MLB: 'mlb', NFL: 'nfl', NBA: 'nba', NHL: 'nhl', Soccer: 'soccer' })
                          .find(([k]) => k === entry.sport)?.[1] as Sport;
                        return <Cell key={idx} fill={SPORT_COLORS[sportKey] || '#8b5cf6'} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Distribution */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <Gavel size={18} className="text-amber-400" />
                Rule Changes by Category
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={categoryDistribution}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <PolarRadiusAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Radar name="Count" dataKey="value" stroke="#818cf8" fill="#818cf8" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Upcoming Rule Changes Table */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-emerald-400" />
              Upcoming &amp; Proposed Rule Changes
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 px-3 text-slate-400 font-medium">Rule Change</th>
                    <th className="text-left py-2 px-3 text-slate-400 font-medium">Sport</th>
                    <th className="text-left py-2 px-3 text-slate-400 font-medium">Category</th>
                    <th className="text-left py-2 px-3 text-slate-400 font-medium">Status</th>
                    <th className="text-right py-2 px-3 text-slate-400 font-medium">Est. Impact</th>
                    <th className="text-center py-2 px-3 text-slate-400 font-medium">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {getUpcomingChanges()
                    .filter(r => sportFilter === 'all' || r.sport === sportFilter)
                    .map(rc => (
                    <tr key={rc.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="py-2.5 px-3 text-slate-200 font-medium">{rc.name}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 text-xs rounded-full font-bold" style={{ backgroundColor: `${SPORT_COLORS[rc.sport]}20`, color: SPORT_COLORS[rc.sport] }}>
                          {getSportLabel(rc.sport)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 text-xs rounded-full" style={{ backgroundColor: `${getCategoryColor(rc.category)}20`, color: getCategoryColor(rc.category) }}>
                          {getCategoryLabel(rc.category)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${rc.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                          {rc.status.toUpperCase()}
                        </span>
                      </td>
                      <td className={`py-2.5 px-3 text-right font-bold ${rc.cardPriceImpactPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {formatPct(rc.cardPriceImpactPct)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${rc.confidence === 'high' ? 'bg-emerald-500/20 text-emerald-300' : rc.confidence === 'medium' ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'}`}>
                          {rc.confidence}
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

      {/* ═══════════════════════ TAB: Historical Analysis ═══════════════════════ */}
      {activeTab === 'historical' && (
        <div className="space-y-6">
          {/* Historical Impact Chart */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Gavel size={18} className="text-indigo-400" />
              Historical Rule Change Card Price Impact
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={historicalChartData} margin={{ bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} angle={-35} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]} labelFormatter={(label: string) => {
                    const item = historicalChartData.find(d => d.name === label);
                    return item ? `${item.fullName} (${item.year})` : label;
                  }} />
                  <Legend verticalAlign="top" height={36} />
                  <ReferenceLine y={0} stroke="#475569" />
                  <Bar dataKey="impact" name="Avg Card Impact %" fill="#818cf8" radius={[4, 4, 0, 0]} />
                  <Line dataKey="winner" name="Top Winner %" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
                  <Line dataKey="loser" name="Top Loser %" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Reaction Time vs Impact Scatter */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-cyan-400" />
              Market Reaction Time vs. Impact Magnitude
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="x" name="Reaction Days" tick={{ fontSize: 11, fill: '#64748b' }} label={{ value: 'Days to React', position: 'bottom', fill: '#64748b', fontSize: 11 }} />
                  <YAxis dataKey="y" name="Impact %" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number, name: string) => [name === 'Reaction Days' ? `${value} days` : `${value}%`, name]} labelFormatter={() => ''} />
                  <Scatter data={scatterData} name="Rule Changes">
                    {scatterData.map((entry, idx) => (
                      <Cell key={idx} fill={SPORT_COLORS[entry.sport]} r={Math.max(4, entry.z / 3)} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">Bubble size indicates sustained impact duration (months). Color = sport.</p>
          </div>

          {/* Historical Cards Table */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-amber-400" />
              Card Price Impact Examples
            </h2>
            <div className="space-y-3">
              {cardImpacts
                .filter(c => sportFilter === 'all' || c.sport === sportFilter)
                .map(ci => (
                <div key={ci.id} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-200">{ci.cardName}</p>
                    <p className="text-xs text-slate-500">{ci.playerName} &middot; {ci.grade} &middot; {ci.timeframe}</p>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-xs text-slate-500">Before</p>
                      <p className="text-sm font-bold text-slate-300">${ci.beforePrice.toLocaleString()}</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-600" />
                    <div>
                      <p className="text-xs text-slate-500">After</p>
                      <p className="text-sm font-bold text-slate-200">${ci.afterPrice.toLocaleString()}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-bold rounded-lg ${ci.changePct >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                      {formatPct(ci.changePct)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════ TAB: Stat Shifts ═══════════════════════ */}
      {activeTab === 'stat-shifts' && (
        <div className="space-y-6">
          {/* Before/After Stat Comparison */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-indigo-400" />
              Statistical Distribution Shifts (Before vs. After)
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={statShifts
                    .filter(s => sportFilter === 'all' || s.sport === sportFilter)
                    .map(s => ({
                      name: s.statName.length > 20 ? s.statName.slice(0, 20) + '...' : s.statName,
                      fullName: s.statName,
                      before: s.beforeMean,
                      after: s.afterMean,
                      shift: s.shiftPct,
                    }))}
                  margin={{ bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} angle={-30} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={(label: string) => {
                    const item = statShifts.find(s => s.statName.startsWith(label.replace('...', '')));
                    return item ? item.statName : label;
                  }} />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="before" name="Before" fill="#64748b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="after" name="After" fill="#818cf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Shift Percentage Area Chart */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-emerald-400" />
              Percentage Shift Magnitude
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={statShifts
                    .filter(s => sportFilter === 'all' || s.sport === sportFilter)
                    .sort((a, b) => b.shiftPct - a.shiftPct)
                    .map(s => ({
                      name: s.statName.length > 18 ? s.statName.slice(0, 18) + '...' : s.statName,
                      shift: s.shiftPct,
                      sport: getSportLabel(s.sport),
                    }))}
                  margin={{ bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} angle={-30} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => [`${value.toFixed(1)}%`, 'Shift']} />
                  <ReferenceLine y={0} stroke="#475569" />
                  <Area dataKey="shift" name="Shift %" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stat Shift Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statShifts
              .filter(s => sportFilter === 'all' || s.sport === sportFilter)
              .sort((a, b) => Math.abs(b.shiftPct) - Math.abs(a.shiftPct))
              .map(ss => (
              <div key={ss.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">{getSportLabel(ss.sport)}</span>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${ss.shiftPct >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                    {formatPct(ss.shiftPct)}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-200 mb-2">{ss.statName}</p>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex-1">
                    <p className="text-slate-500 mb-0.5">Before</p>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-500 rounded-full" style={{ width: `${Math.min(100, (ss.beforeMean / Math.max(ss.beforeMean, ss.afterMean)) * 100)}%` }} />
                    </div>
                    <p className="text-slate-300 mt-0.5">{ss.beforeMean} (&sigma; {ss.beforeStdDev})</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-500 mb-0.5">After</p>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (ss.afterMean / Math.max(ss.beforeMean, ss.afterMean)) * 100)}%` }} />
                    </div>
                    <p className="text-slate-300 mt-0.5">{ss.afterMean} (&sigma; {ss.afterStdDev})</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-2">n={ss.sampleSize.toLocaleString()} &middot; p={ss.pValue}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════ TAB: Winners & Losers ═══════════════════════ */}
      {activeTab === 'winners-losers' && (
        <div className="space-y-6">
          {/* Player Impact Chart */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Users size={18} className="text-indigo-400" />
              Player Impact Scores by Rule Change
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredPlayerImpacts
                    .sort((a, b) => b.impactScore - a.impactScore)
                    .map(p => ({
                      name: p.playerName,
                      impact: p.impactScore,
                      cardChange: p.cardValueChangePct,
                      sport: p.sport,
                    }))}
                  margin={{ bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-30} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend verticalAlign="top" height={36} />
                  <ReferenceLine y={0} stroke="#475569" />
                  <Bar dataKey="impact" name="Impact Score" radius={[4, 4, 0, 0]}>
                    {filteredPlayerImpacts
                      .sort((a, b) => b.impactScore - a.impactScore)
                      .map((entry, idx) => (
                        <Cell key={idx} fill={entry.impactScore >= 0 ? '#22c55e' : '#ef4444'} />
                      ))}
                  </Bar>
                  <Bar dataKey="cardChange" name="Card Value Change %" fill="#818cf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Winners & Losers Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Winners */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <ArrowUpRight size={18} className="text-emerald-400" />
                Biggest Winners
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredPlayerImpacts
                  .filter(p => p.tier === 'major-winner' || p.tier === 'minor-winner')
                  .sort((a, b) => b.impactScore - a.impactScore)
                  .map(p => (
                  <div key={p.id} className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-slate-200">{p.playerName}</span>
                      <span className="text-xs font-bold text-emerald-400">{formatPct(p.cardValueChangePct)}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded" style={{ backgroundColor: `${SPORT_COLORS[p.sport]}20`, color: SPORT_COLORS[p.sport] }}>
                        {getSportLabel(p.sport)}
                      </span>
                      <span className="text-[10px] text-slate-500">{p.team} &middot; {p.position}</span>
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300">
                        Score: {p.impactScore}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{p.reasoning}</p>
                    {/* Before/After Key Stats */}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {Object.entries(p.keyStatsAfter).slice(0, 3).map(([stat, after]) => {
                        const before = p.keyStatsBefore[stat] ?? 0;
                        const diff = after - before;
                        return (
                          <div key={stat} className="px-2 py-1 bg-slate-900/50 rounded text-[10px]">
                            <span className="text-slate-500">{stat}: </span>
                            <span className="text-slate-400">{before}</span>
                            <span className="text-slate-600 mx-0.5">&rarr;</span>
                            <span className="text-emerald-300">{after}</span>
                            <span className={`ml-1 ${diff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              ({diff >= 0 ? '+' : ''}{typeof after === 'number' && after < 1 ? diff.toFixed(3) : diff.toFixed(0)})
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Losers */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <ArrowDownRight size={18} className="text-red-400" />
                Biggest Losers
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredHistorical
                  .sort((a, b) => a.topLoserImpactPct - b.topLoserImpactPct)
                  .map(h => (
                  <div key={h.id} className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-slate-200">{h.topLoser}</span>
                      <span className="text-xs font-bold text-red-400">{formatPct(h.topLoserImpactPct)}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded" style={{ backgroundColor: `${SPORT_COLORS[h.sport]}20`, color: SPORT_COLORS[h.sport] }}>
                        {getSportLabel(h.sport)}
                      </span>
                      <span className="text-[10px] text-slate-500">Due to: {h.name}</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Rule change ({h.year}) caused avg {formatPct(h.avgCardPriceImpactPct)} market shift.
                      Market reacted within {h.marketReactionDays} days; impact sustained for {h.sustainedMonths} months.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Position Impact */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Scale size={18} className="text-purple-400" />
              Position-Level Impact Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {positionImpacts
                .filter(p => sportFilter === 'all' || p.sport === sportFilter)
                .sort((a, b) => b.impactScore - a.impactScore)
                .slice(0, 12)
                .map(pi => (
                <div key={pi.id} className="p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-300">{pi.position}</span>
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded" style={{ backgroundColor: `${SPORT_COLORS[pi.sport]}20`, color: SPORT_COLORS[pi.sport] }}>
                      {getSportLabel(pi.sport)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`text-lg font-bold ${pi.impactScore >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {pi.impactScore >= 0 ? '+' : ''}{pi.impactScore}
                    </div>
                    <span className={`text-xs ${pi.avgCardValueChangePct >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                      {formatPct(pi.avgCardValueChangePct)} cards
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{pi.reasoning}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════ TAB: Scenario Builder ═══════════════════════ */}
      {activeTab === 'scenario' && (
        <div className="space-y-6">
          {/* Scenario Selector */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-indigo-400" />
              Select a Rule Change Scenario
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scenarios
                .filter(s => sportFilter === 'all' || s.sport === sportFilter)
                .map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedScenario(s.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedScenario === s.id
                      ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500'
                      : 'border-slate-700/50 bg-slate-900/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded" style={{ backgroundColor: `${SPORT_COLORS[s.sport]}20`, color: SPORT_COLORS[s.sport] }}>
                      {getSportLabel(s.sport)}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${s.probability >= 50 ? 'bg-emerald-500/20 text-emerald-300' : s.probability >= 25 ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'}`}>
                      {s.probability}% likely
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-200 mb-1">{s.name}</p>
                  <p className="text-xs text-slate-400 line-clamp-2">{s.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-slate-500">{s.timelineEstimate}</span>
                    <span className={`text-sm font-bold ${s.estimatedImpactPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatPct(s.estimatedImpactPct)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Scenario Detail */}
          {selectedScenarioData && (
            <>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <h2 className="text-lg font-bold text-slate-200 mb-2">{selectedScenarioData.name}</h2>
                <p className="text-sm text-slate-400 mb-4">{selectedScenarioData.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-xs text-slate-500 uppercase mb-1">Probability</p>
                    <p className="text-2xl font-bold text-indigo-400">{selectedScenarioData.probability}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 uppercase mb-1">Est. Impact</p>
                    <p className="text-2xl font-bold text-emerald-400">{formatPct(selectedScenarioData.estimatedImpactPct)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 uppercase mb-1">Positions</p>
                    <p className="text-lg font-bold text-amber-400">{selectedScenarioData.affectedPositions.join(', ')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 uppercase mb-1">Timeline</p>
                    <p className="text-lg font-bold text-cyan-400">{selectedScenarioData.timelineEstimate}</p>
                  </div>
                </div>

                {/* Winners vs Losers Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                    <p className="text-xs font-bold text-emerald-400 uppercase mb-2">Projected Winners</p>
                    {selectedScenarioData.projectedWinners.map((w, i) => (
                      <div key={i} className="flex items-center gap-2 py-1">
                        <ArrowUpRight size={12} className="text-emerald-400" />
                        <span className="text-sm text-slate-200">{w}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                    <p className="text-xs font-bold text-red-400 uppercase mb-2">Projected Losers</p>
                    {selectedScenarioData.projectedLosers.map((l, i) => (
                      <div key={i} className="flex items-center gap-2 py-1">
                        <ArrowDownRight size={12} className="text-red-400" />
                        <span className="text-sm text-slate-200">{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Projected Stat Lines */}
              {scenarioProjections.length > 0 && (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                  <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                    <TrendingUp size={18} className="text-emerald-400" />
                    Projected Stat Line Changes
                  </h2>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={scenarioProjections.flatMap(p =>
                          Object.entries(p.stats).map(([stat, vals]) => ({
                            name: `${p.playerName.split(' ').pop()} - ${stat}`,
                            before: vals.before,
                            after: vals.after,
                            changePct: vals.changePct,
                          }))
                        ).slice(0, 12)}
                        margin={{ bottom: 50 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} angle={-30} textAnchor="end" interval={0} />
                        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                        <Legend verticalAlign="top" height={36} />
                        <Bar dataKey="before" name="Before" fill="#64748b" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="after" name="After" fill="#818cf8" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Stat Detail Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {scenarioProjections.map(p => (
                      <div key={p.id} className="p-4 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-sm font-bold text-slate-200">{p.playerName}</p>
                            <p className="text-xs text-slate-500">{p.position} &middot; {getSportLabel(p.sport)}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-bold rounded-lg ${p.cardValueProjection >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                            Card: {formatPct(p.cardValueProjection)}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {Object.entries(p.stats).map(([stat, vals]) => (
                            <div key={stat} className="flex items-center justify-between text-xs">
                              <span className="text-slate-400 w-28">{stat}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500 w-12 text-right">{vals.before}</span>
                                <span className="text-slate-600">&rarr;</span>
                                <span className="text-slate-200 w-12 text-right">{vals.after}</span>
                                <span className={`w-16 text-right font-bold ${vals.changePct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {formatPct(vals.changePct)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {!selectedScenarioData && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
              <BarChart3 size={48} className="text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Select a scenario above to see projected impacts</p>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════ TAB: Timeline ═══════════════════════ */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          {/* Timeline Chart */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-indigo-400" />
              Rule Change Timeline
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={timelineEvents
                    .filter(e => sportFilter === 'all' || e.sport === sportFilter)
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((e, idx) => ({
                      date: e.date,
                      title: e.title,
                      idx: idx + 1,
                      type: e.type,
                    }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} angle={-20} textAnchor="end" />
                  <YAxis hide />
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={(label: string) => label} formatter={(_v: number, _n: string, props: { payload?: { title?: string; type?: string } }) => [props.payload?.title || '', props.payload?.type || '']} />
                  <Line dataKey="idx" stroke="#818cf8" strokeWidth={2} dot={{ r: 5, fill: '#818cf8' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Timeline Events */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4">Event Details</h2>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-700" />
              <div className="space-y-4">
                {timelineEvents
                  .filter(e => sportFilter === 'all' || e.sport === sportFilter)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(event => {
                    const typeColors: Record<string, string> = {
                      'announcement': 'bg-blue-500',
                      'vote': 'bg-purple-500',
                      'implementation': 'bg-emerald-500',
                      'market-reaction': 'bg-amber-500',
                      'stat-shift': 'bg-cyan-500',
                    };
                    const typeLabels: Record<string, string> = {
                      'announcement': 'Announcement',
                      'vote': 'Vote',
                      'implementation': 'Implementation',
                      'market-reaction': 'Market Reaction',
                      'stat-shift': 'Stat Shift',
                    };
                    return (
                      <div key={event.id} className="relative pl-10">
                        <div className={`absolute left-2.5 w-3 h-3 rounded-full ${typeColors[event.type] || 'bg-slate-500'} ring-4 ring-slate-900`} />
                        <div className="p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-slate-500">{event.date}</span>
                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded" style={{ backgroundColor: `${SPORT_COLORS[event.sport]}20`, color: SPORT_COLORS[event.sport] }}>
                              {getSportLabel(event.sport)}
                            </span>
                            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded text-white/80 ${typeColors[event.type] || 'bg-slate-500'}`}>
                              {typeLabels[event.type] || event.type}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-200">{event.title}</p>
                          <p className="text-xs text-slate-400 mt-1">{event.description}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RuleChangeImpactModeler;
