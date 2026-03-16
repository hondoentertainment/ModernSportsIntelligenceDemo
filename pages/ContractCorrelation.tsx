import React, { useState, useMemo } from 'react';
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Clock,
  Shield,
  Brain,
  Zap,
  Filter,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Info,
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  Legend,
  ReferenceLine,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  getHistoricalCorrelations,
  getUpcomingContracts,
  getPatternsByType,
  getCorrelationMatrix,
  getPredictionModels,
  getStrategySignals,
  getScatterData,
  getSummaryStats,
  contractTypeLabels,
  contractTypeColors,
  type ContractEvent,
  type UpcomingContract,
  type CorrelationPattern,
  type PredictionModel,
  type StrategySignal,
  type CorrelationMatrixEntry,
  type ContractType,
  type Sport,
  type SignalDirection,
} from '../lib/contractCorrelationService';

type TabId = 'correlation' | 'historical' | 'upcoming' | 'predictions' | 'signals';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'correlation', label: 'Correlation Map', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'historical', label: 'Historical Data', icon: <Clock className="w-4 h-4" /> },
  { id: 'upcoming', label: 'Upcoming Contracts', icon: <Calendar className="w-4 h-4" /> },
  { id: 'predictions', label: 'Predictions', icon: <Brain className="w-4 h-4" /> },
  { id: 'signals', label: 'Strategy Signals', icon: <Zap className="w-4 h-4" /> },
];

const SPORT_COLORS: Record<Sport, string> = {
  NFL: '#60a5fa',
  NBA: '#a78bfa',
  MLB: '#f87171',
};

const SIGNAL_CONFIG: Record<SignalDirection, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  buy: { color: 'text-lime-400', bg: 'bg-lime-400/10', icon: <ArrowUpRight className="w-4 h-4" />, label: 'BUY' },
  sell: { color: 'text-red-400', bg: 'bg-red-400/10', icon: <ArrowDownRight className="w-4 h-4" />, label: 'SELL' },
  hold: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: <Minus className="w-4 h-4" />, label: 'HOLD' },
};

function formatCurrency(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function formatMillions(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}B`;
  return `$${value.toFixed(1)}M`;
}

function formatPct(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

// ─── Custom Tooltip Components ───────────────────────────────────────

const ScatterTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
      <p className="text-slate-100 font-semibold text-sm">{data.player}</p>
      <p className="text-slate-400 text-xs">{data.sport} &middot; {contractTypeLabels[data.type as ContractType]}</p>
      <div className="mt-2 space-y-1">
        <p className="text-slate-300 text-xs">Contract: {formatMillions(data.contractValue)}</p>
        <p className={`text-xs font-medium ${data.priceChange >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
          Card Impact: {formatPct(data.priceChange)}
        </p>
      </div>
    </div>
  );
};

const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
      <p className="text-slate-100 font-semibold text-sm">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-xs mt-1" style={{ color: entry.color }}>
          {entry.name}: {formatPct(entry.value)}
        </p>
      ))}
    </div>
  );
};

// ─── Sub-Components ──────────────────────────────────────────────────

const SummaryCards: React.FC = () => {
  const stats = useMemo(() => getSummaryStats(), []);
  const cards = [
    { label: 'Total Events Tracked', value: stats.totalEvents.toString(), sub: 'Historical data points', icon: <BarChart3 className="w-5 h-5 text-lime-400" /> },
    { label: 'Avg Card Impact', value: formatPct(stats.avgImpact), sub: 'Across all contract types', icon: <TrendingUp className="w-5 h-5 text-lime-400" /> },
    { label: 'Positive Rate', value: `${stats.positiveRate}%`, sub: 'Events with price increase', icon: <CheckCircle className="w-5 h-5 text-lime-400" /> },
    { label: 'Best Contract Type', value: stats.bestType, sub: `Top performing sport: ${stats.bestSport}`, icon: <Target className="w-5 h-5 text-lime-400" /> },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, i) => (
        <div key={i} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">{card.label}</span>
            {card.icon}
          </div>
          <p className="text-2xl font-bold text-slate-100">{card.value}</p>
          <p className="text-slate-500 text-xs mt-1">{card.sub}</p>
        </div>
      ))}
    </div>
  );
};

// ─── Correlation Map Tab ─────────────────────────────────────────────

const CorrelationMapTab: React.FC = () => {
  const scatterData = useMemo(() => getScatterData(), []);
  const matrix = useMemo(() => getCorrelationMatrix(), []);
  const patterns = useMemo(() => getPatternsByType(), []);

  const barData = useMemo(() => {
    const grouped: Record<string, { type: string; flagship: number; mid: number; low: number }> = {};
    matrix.forEach((m) => {
      const key = `${contractTypeLabels[m.contractType]} (${m.sport})`;
      grouped[key] = {
        type: key,
        flagship: m.flagshipImpact,
        mid: m.midTierImpact,
        low: m.lowTierImpact,
      };
    });
    return Object.values(grouped);
  }, [matrix]);

  const radarData = useMemo(() => {
    const sports: Sport[] = ['NFL', 'NBA', 'MLB'];
    return sports.map((sport) => {
      const sportPatterns = patterns.filter((p) => p.sport === sport && p.cardTier === 'flagship');
      const avgImpact = sportPatterns.length
        ? sportPatterns.reduce((s, p) => s + p.avgPriceChange, 0) / sportPatterns.length
        : 0;
      const avgConsistency = sportPatterns.length
        ? sportPatterns.reduce((s, p) => s + p.positiveRate * 100, 0) / sportPatterns.length
        : 0;
      const avgSustain = sportPatterns.length
        ? sportPatterns.reduce((s, p) => s + (100 - p.avgRetracePercent), 0) / sportPatterns.length
        : 0;
      return {
        sport,
        impact: Math.round(avgImpact),
        consistency: Math.round(avgConsistency),
        sustainability: Math.round(avgSustain),
      };
    });
  }, [patterns]);

  return (
    <div className="space-y-6">
      {/* Scatter Plot */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-slate-100 mb-1">Contract Value vs Card Price Impact</h3>
        <p className="text-slate-400 text-sm mb-4">Each point represents a historical contract event and its impact on the player's flagship RC</p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 30, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                type="number"
                dataKey="contractValue"
                name="Contract Value"
                unit="M"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                label={{ value: 'Contract Value ($M)', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 12 }}
              />
              <YAxis
                type="number"
                dataKey="priceChange"
                name="Price Change"
                unit="%"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                label={{ value: 'Card Price Change (%)', angle: -90, position: 'insideLeft', offset: 10, fill: '#94a3b8', fontSize: 12 }}
              />
              <Tooltip content={<ScatterTooltip />} />
              <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" />
              {(['NFL', 'NBA', 'MLB'] as Sport[]).map((sport) => (
                <Scatter
                  key={sport}
                  name={sport}
                  data={scatterData.filter((d) => d.sport === sport)}
                  fill={SPORT_COLORS[sport]}
                  fillOpacity={0.8}
                  r={6}
                />
              ))}
              <Legend
                wrapperStyle={{ paddingTop: 16 }}
                formatter={(value: string) => <span className="text-slate-300 text-sm">{value}</span>}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Impact by Contract Type & Card Tier */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-slate-100 mb-1">Impact by Contract Type &amp; Card Tier</h3>
          <p className="text-slate-400 text-sm mb-4">Average price change across flagship, mid-tier, and low-tier cards</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 20, bottom: 50, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="type"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                  height={70}
                />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} unit="%" />
                <Tooltip content={<BarTooltip />} />
                <Bar dataKey="flagship" name="Flagship" fill="#84cc16" radius={[2, 2, 0, 0]} />
                <Bar dataKey="mid" name="Mid-Tier" fill="#60a5fa" radius={[2, 2, 0, 0]} />
                <Bar dataKey="low" name="Low-Tier" fill="#94a3b8" radius={[2, 2, 0, 0]} />
                <Legend formatter={(value: string) => <span className="text-slate-300 text-xs">{value}</span>} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sport Comparison Radar */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-slate-100 mb-1">Sport Comparison</h3>
          <p className="text-slate-400 text-sm mb-4">Impact strength, consistency, and sustainability by sport</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="sport" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis tick={{ fill: '#64748b', fontSize: 10 }} domain={[0, 100]} />
                <Radar name="Impact" dataKey="impact" stroke="#84cc16" fill="#84cc16" fillOpacity={0.15} />
                <Radar name="Consistency" dataKey="consistency" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.15} />
                <Radar name="Sustainability" dataKey="sustainability" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.15} />
                <Legend formatter={(value: string) => <span className="text-slate-300 text-xs">{value}</span>} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pattern Cards */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Key Correlation Patterns</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patterns.filter((p) => p.cardTier === 'flagship').map((pattern) => (
            <div key={pattern.id} className="bg-slate-900 rounded-lg p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-100">
                  {contractTypeLabels[pattern.contractType]} ({pattern.sport})
                </span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    color: contractTypeColors[pattern.contractType],
                    backgroundColor: `${contractTypeColors[pattern.contractType]}20`,
                  }}
                >
                  {formatPct(pattern.avgPriceChange)} avg
                </span>
              </div>
              <p className="text-slate-400 text-xs mb-3">{pattern.description}</p>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>n={pattern.sampleSize}</span>
                <span>&sigma;={pattern.stdDeviation.toFixed(1)}%</span>
                <span>Win rate: {(pattern.positiveRate * 100).toFixed(0)}%</span>
                <span>Peak: ~{pattern.avgPeakDays}d</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Historical Data Tab ─────────────────────────────────────────────

const HistoricalDataTab: React.FC = () => {
  const events = useMemo(() => getHistoricalCorrelations(), []);
  const [sportFilter, setSportFilter] = useState<Sport | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ContractType | 'all'>('all');
  const [sortField, setSortField] = useState<'date' | 'impact' | 'volume'>('date');

  const filtered = useMemo(() => {
    let result = [...events];
    if (sportFilter !== 'all') result = result.filter((e) => e.sport === sportFilter);
    if (typeFilter !== 'all') result = result.filter((e) => e.contractType === typeFilter);
    if (sortField === 'impact') result.sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange));
    else if (sortField === 'volume') result.sort((a, b) => b.volumeChangePct - a.volumeChangePct);
    else result.sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
    return result;
  }, [events, sportFilter, typeFilter, sortField]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400 text-sm">Filters:</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-slate-400 text-xs">Sport:</label>
            <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value as Sport | 'all')}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-lime-400"
            >
              <option value="all">All Sports</option>
              <option value="NFL">NFL</option>
              <option value="NBA">NBA</option>
              <option value="MLB">MLB</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-slate-400 text-xs">Type:</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ContractType | 'all')}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-lime-400"
            >
              <option value="all">All Types</option>
              <option value="rookie_extension">Rookie Extension</option>
              <option value="5th_year_option">5th-Year Option</option>
              <option value="max_deal">Max Deal</option>
              <option value="franchise_tag">Franchise Tag</option>
              <option value="free_agency_signing">Free Agency</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-slate-400 text-xs">Sort:</label>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as 'date' | 'impact' | 'volume')}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-lime-400"
            >
              <option value="date">Date</option>
              <option value="impact">Impact</option>
              <option value="volume">Volume</option>
            </select>
          </div>
          <span className="text-slate-500 text-xs ml-auto">{filtered.length} events</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900/50">
                <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wide">Player</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wide">Sport</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wide">Contract Type</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wide">Value</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wide">Card</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wide">Before</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wide">After</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wide">Impact</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wide">Volume</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((event) => (
                <tr key={event.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-100 font-medium">{event.player}</span>
                      <span className="text-slate-500 text-xs">{event.position}</span>
                    </div>
                    <span className="text-slate-500 text-xs">{event.team}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ color: SPORT_COLORS[event.sport], backgroundColor: `${SPORT_COLORS[event.sport]}20` }}
                    >
                      {event.sport}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        color: contractTypeColors[event.contractType],
                        backgroundColor: `${contractTypeColors[event.contractType]}20`,
                      }}
                    >
                      {contractTypeLabels[event.contractType]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300 text-xs">
                    {formatMillions(event.contractValue)}
                    <span className="text-slate-500 block">{event.contractYears}yr</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-slate-200 text-xs">{event.card.year} {event.card.set}</span>
                    <span className="text-slate-500 text-xs block">{event.card.grade}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-400 text-xs">{formatCurrency(event.priceBefore)}</td>
                  <td className="px-4 py-3 text-right text-slate-300 text-xs">{formatCurrency(event.priceAfter)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-xs font-bold ${event.percentChange >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
                      {formatPct(event.percentChange)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-lime-400/80 text-xs">+{event.volumeChangePct}%</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{event.eventDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── Upcoming Contracts Tab ──────────────────────────────────────────

const UpcomingContractsTab: React.FC = () => {
  const contracts = useMemo(() => getUpcomingContracts(), []);

  return (
    <div className="space-y-6">
      {/* Timeline Header */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-4 h-4 text-lime-400" />
          <h3 className="text-sm font-semibold text-slate-100">Contract Decision Timeline</h3>
        </div>
        <p className="text-slate-400 text-xs">Upcoming contract events sorted by proximity with predicted card impact</p>
      </div>

      {/* Timeline Cards */}
      <div className="space-y-4">
        {contracts.map((contract) => {
          const signal = SIGNAL_CONFIG[contract.signal];
          const urgencyColor =
            contract.daysUntil <= 60 ? 'border-l-lime-400' :
            contract.daysUntil <= 180 ? 'border-l-yellow-400' :
            'border-l-slate-600';

          return (
            <div
              key={contract.id}
              className={`bg-slate-800 rounded-xl p-5 border border-slate-700 border-l-4 ${urgencyColor}`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                {/* Player Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-slate-100">{contract.player}</h4>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ color: SPORT_COLORS[contract.sport], backgroundColor: `${SPORT_COLORS[contract.sport]}20` }}
                    >
                      {contract.sport}
                    </span>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        color: contractTypeColors[contract.contractType],
                        backgroundColor: `${contractTypeColors[contract.contractType]}20`,
                      }}
                    >
                      {contractTypeLabels[contract.contractType]}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm">{contract.team} &middot; {contract.position}</p>
                  <p className="text-slate-500 text-xs mt-1">{contract.notes}</p>
                </div>

                {/* Timing */}
                <div className="text-center lg:text-right shrink-0">
                  <div className="flex items-center gap-1 justify-center lg:justify-end">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span className={`text-sm font-bold ${contract.daysUntil <= 60 ? 'text-lime-400' : contract.daysUntil <= 180 ? 'text-yellow-400' : 'text-slate-400'}`}>
                      {contract.daysUntil} days
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs">{contract.expectedDate}</p>
                  <div className="mt-1">
                    <span className="text-slate-400 text-xs">Likelihood: </span>
                    <span className={`text-xs font-medium ${contract.likelihood >= 80 ? 'text-lime-400' : contract.likelihood >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {contract.likelihood}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                <div className="bg-slate-900 rounded-lg p-3">
                  <p className="text-slate-500 text-xs">Current Contract</p>
                  <p className="text-slate-200 text-sm font-medium">{formatMillions(contract.currentContractValue)}</p>
                </div>
                <div className="bg-slate-900 rounded-lg p-3">
                  <p className="text-slate-500 text-xs">Projected New</p>
                  <p className="text-slate-200 text-sm font-medium">{formatMillions(contract.projectedNewValue)}</p>
                </div>
                <div className="bg-slate-900 rounded-lg p-3">
                  <p className="text-slate-500 text-xs">Top Card Price</p>
                  <p className="text-slate-200 text-sm font-medium">{formatCurrency(contract.topCard.currentPrice)}</p>
                  <p className="text-slate-500 text-xs">{contract.topCard.year} {contract.topCard.set} {contract.topCard.grade}</p>
                </div>
                <div className="bg-slate-900 rounded-lg p-3">
                  <p className="text-slate-500 text-xs">Predicted Impact</p>
                  <p className={`text-sm font-bold ${contract.predictedImpact >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
                    {formatPct(contract.predictedImpact)}
                  </p>
                </div>
                <div className="bg-slate-900 rounded-lg p-3">
                  <p className="text-slate-500 text-xs">Confidence Range</p>
                  <p className="text-slate-300 text-xs">
                    {formatPct(contract.confidenceInterval.low)} to {formatPct(contract.confidenceInterval.high)}
                  </p>
                </div>
                <div className="bg-slate-900 rounded-lg p-3">
                  <p className="text-slate-500 text-xs">Signal</p>
                  <div className={`flex items-center gap-1 ${signal.color}`}>
                    {signal.icon}
                    <span className="text-sm font-bold">{signal.label}</span>
                    <span className="text-xs text-slate-500 ml-1">({contract.signalStrength})</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Predictions Tab ─────────────────────────────────────────────────

const PredictionsTab: React.FC = () => {
  const models = useMemo(() => getPredictionModels(), []);
  const contracts = useMemo(() => getUpcomingContracts(), []);

  const confidenceData = useMemo(() => {
    return contracts.map((c) => ({
      name: c.player,
      low: c.confidenceInterval.low,
      mid: c.confidenceInterval.mid,
      high: c.confidenceInterval.high,
      sport: c.sport,
    }));
  }, [contracts]);

  const modelComparisonData = useMemo(() => {
    return contracts.map((c) => {
      const row: any = { name: c.player };
      models.forEach((m) => {
        const pred = m.predictions.find((p) => p.contractEventId === c.id);
        if (pred) row[m.name] = pred.predictedChange;
      });
      return row;
    });
  }, [contracts, models]);

  const modelColors = ['#84cc16', '#60a5fa', '#a78bfa'];

  return (
    <div className="space-y-6">
      {/* Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {models.map((model, idx) => (
          <div key={model.id} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5" style={{ color: modelColors[idx] }} />
                <h4 className="text-sm font-semibold text-slate-100">{model.name}</h4>
              </div>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ color: modelColors[idx], backgroundColor: `${modelColors[idx]}20` }}
              >
                {(model.accuracy * 100).toFixed(1)}% accuracy
              </span>
            </div>
            <p className="text-slate-400 text-xs mb-3">{model.description}</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {model.features.map((f) => (
                <span key={f} className="bg-slate-900 text-slate-500 text-xs px-2 py-0.5 rounded-full">{f}</span>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Backtest: {model.backtestPeriod}</span>
              <span>Updated: {model.lastUpdated}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Confidence Intervals Chart */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-slate-100 mb-1">Predicted Impact Confidence Intervals</h3>
        <p className="text-slate-400 text-sm mb-4">Low, mid, and high estimates for each upcoming contract event</p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={confidenceData} margin={{ top: 10, right: 30, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} unit="%" />
              <Tooltip content={<BarTooltip />} />
              <ReferenceLine y={0} stroke="#475569" />
              <Bar dataKey="low" name="Low Estimate" fill="#475569" radius={[2, 2, 0, 0]} />
              <Bar dataKey="mid" name="Mid Estimate" fill="#84cc16" radius={[2, 2, 0, 0]} />
              <Bar dataKey="high" name="High Estimate" fill="#22d3ee" radius={[2, 2, 0, 0]} />
              <Legend formatter={(value: string) => <span className="text-slate-300 text-xs">{value}</span>} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model Comparison Chart */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-slate-100 mb-1">Model Prediction Comparison</h3>
        <p className="text-slate-400 text-sm mb-4">How each model predicts the price impact for upcoming events</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={modelComparisonData} margin={{ top: 10, right: 30, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
                itemStyle={{ color: '#94a3b8' }}
              />
              <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" />
              {models.map((m, idx) => (
                <Line
                  key={m.id}
                  type="monotone"
                  dataKey={m.name}
                  stroke={modelColors[idx]}
                  strokeWidth={2}
                  dot={{ r: 4, fill: modelColors[idx] }}
                />
              ))}
              <Legend formatter={(value: string) => <span className="text-slate-300 text-xs">{value}</span>} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Per-Player Prediction Details */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Detailed Predictions</h3>
        <div className="space-y-3">
          {contracts.map((contract) => {
            const preds = models.map((m) => {
              const p = m.predictions.find((pred) => pred.contractEventId === contract.id);
              return { model: m.name, ...p };
            });

            return (
              <div key={contract.id} className="bg-slate-900 rounded-lg p-4 border border-slate-700/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-100 font-medium">{contract.player}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ color: SPORT_COLORS[contract.sport], backgroundColor: `${SPORT_COLORS[contract.sport]}20` }}
                    >
                      {contract.sport}
                    </span>
                    <span className="text-slate-500 text-xs">{contractTypeLabels[contract.contractType]}</span>
                  </div>
                  <span className="text-slate-500 text-xs">{contract.daysUntil}d away</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {preds.map((pred, idx) => (
                    <div key={idx} className="bg-slate-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-400">{pred.model}</span>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{
                            color: pred.confidence === 'high' ? '#84cc16' : pred.confidence === 'medium' ? '#fbbf24' : '#f87171',
                            backgroundColor: pred.confidence === 'high' ? '#84cc1620' : pred.confidence === 'medium' ? '#fbbf2420' : '#f8717120',
                          }}
                        >
                          {pred.confidence}
                        </span>
                      </div>
                      <p className={`text-lg font-bold ${(pred.predictedChange ?? 0) >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
                        {formatPct(pred.predictedChange ?? 0)}
                      </p>
                      <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${(pred.confidenceScore ?? 0) * 100}%`,
                            backgroundColor: modelColors[idx],
                          }}
                        />
                      </div>
                      <span className="text-slate-500 text-xs">{((pred.confidenceScore ?? 0) * 100).toFixed(0)}% confidence</span>
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
};

// ─── Strategy Signals Tab ────────────────────────────────────────────

const StrategySignalsTab: React.FC = () => {
  const signals = useMemo(() => getStrategySignals(), []);
  const [actionFilter, setActionFilter] = useState<SignalDirection | 'all'>('all');

  const filtered = useMemo(() => {
    if (actionFilter === 'all') return signals;
    return signals.filter((s) => s.action === actionFilter);
  }, [signals, actionFilter]);

  const signalSummary = useMemo(() => {
    const buys = signals.filter((s) => s.action === 'buy');
    const sells = signals.filter((s) => s.action === 'sell');
    const holds = signals.filter((s) => s.action === 'hold');
    const totalUpside = buys.reduce((sum, s) => sum + (s.targetPrice - s.currentPrice), 0);
    return { buys: buys.length, sells: sells.length, holds: holds.length, totalUpside };
  }, [signals]);

  return (
    <div className="space-y-6">
      {/* Signal Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Buy Signals</p>
          <p className="text-2xl font-bold text-lime-400">{signalSummary.buys}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Sell Signals</p>
          <p className="text-2xl font-bold text-red-400">{signalSummary.sells}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Hold Signals</p>
          <p className="text-2xl font-bold text-yellow-400">{signalSummary.holds}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Total Potential Upside</p>
          <p className="text-2xl font-bold text-lime-400">{formatCurrency(signalSummary.totalUpside)}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400" />
        <div className="flex gap-2">
          {(['all', 'buy', 'sell', 'hold'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActionFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                actionFilter === f
                  ? 'bg-lime-400/20 text-lime-400 border border-lime-400/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
              }`}
            >
              {f === 'all' ? 'All' : f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Signal Cards */}
      <div className="space-y-4">
        {filtered.map((sig) => {
          const config = SIGNAL_CONFIG[sig.action];
          const pctToTarget = ((sig.targetPrice - sig.currentPrice) / sig.currentPrice) * 100;
          const riskColors = {
            low: { text: 'text-lime-400', bg: 'bg-lime-400/10' },
            medium: { text: 'text-yellow-400', bg: 'bg-yellow-400/10' },
            high: { text: 'text-red-400', bg: 'bg-red-400/10' },
          };

          return (
            <div key={sig.id} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                {/* Left: Signal + Player */}
                <div className="flex items-start gap-4 flex-1">
                  <div className={`${config.bg} rounded-xl p-3 shrink-0`}>
                    <div className={`${config.color} flex flex-col items-center`}>
                      {config.icon}
                      <span className="text-xs font-bold mt-1">{config.label}</span>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-lg font-semibold text-slate-100">{sig.player}</h4>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ color: SPORT_COLORS[sig.sport], backgroundColor: `${SPORT_COLORS[sig.sport]}20` }}
                      >
                        {sig.sport}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm mb-2">{sig.reasoning}</p>
                    <p className="text-slate-500 text-xs">{sig.contractContext}</p>
                  </div>
                </div>

                {/* Right: Metrics */}
                <div className="grid grid-cols-2 gap-3 shrink-0 lg:w-72">
                  <div className="bg-slate-900 rounded-lg p-3">
                    <p className="text-slate-500 text-xs">Target Card</p>
                    <p className="text-slate-200 text-xs font-medium truncate">{sig.targetCard}</p>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-3">
                    <p className="text-slate-500 text-xs">Signal Strength</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-lime-400"
                          style={{ width: `${sig.strength}%` }}
                        />
                      </div>
                      <span className="text-slate-300 text-xs font-medium">{sig.strength}</span>
                    </div>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-3">
                    <p className="text-slate-500 text-xs">Current → Target</p>
                    <p className="text-slate-200 text-xs">
                      {formatCurrency(sig.currentPrice)} <ChevronRight className="w-3 h-3 inline" /> {formatCurrency(sig.targetPrice)}
                    </p>
                    <span className={`text-xs font-medium ${pctToTarget >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
                      {formatPct(pctToTarget)}
                    </span>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-3">
                    <p className="text-slate-500 text-xs">Risk / Horizon</p>
                    <div className="flex items-center gap-1">
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${riskColors[sig.riskLevel].bg} ${riskColors[sig.riskLevel].text}`}>
                        {sig.riskLevel.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-slate-400 text-xs">{sig.timeHorizon}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 flex items-start gap-3">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p className="text-slate-500 text-xs">
          Strategy signals are generated from historical correlation patterns and predictive models.
          They are not financial advice. Past contract-card correlations do not guarantee future results.
          Always conduct your own research and consider your risk tolerance before making portfolio decisions.
        </p>
      </div>
    </div>
  );
};

// ─── Main Page Component ─────────────────────────────────────────────

const ContractCorrelation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('correlation');

  const renderTab = () => {
    switch (activeTab) {
      case 'correlation':
        return <CorrelationMapTab />;
      case 'historical':
        return <HistoricalDataTab />;
      case 'upcoming':
        return <UpcomingContractsTab />;
      case 'predictions':
        return <PredictionsTab />;
      case 'signals':
        return <StrategySignalsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-lime-400/10 rounded-xl p-2.5">
              <FileText className="w-6 h-6 text-lime-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Rookie Contract Correlation Engine</h1>
              <p className="text-slate-400 text-sm">
                Maps contract extensions and options to card value movements across NFL, NBA, and MLB
              </p>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <SummaryCards />

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-slate-700">
          <div className="flex gap-1 overflow-x-auto pb-px">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-lime-400 text-lime-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {renderTab()}
      </div>
    </div>
  );
};

export default ContractCorrelation;
