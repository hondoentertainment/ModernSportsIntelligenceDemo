import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  Activity,
  BarChart3,
  Target,
  AlertTriangle,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Timer,
  Flame,
  Snowflake,
  Sun,
  Shield,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
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
  getMicroSeasons,
  getActiveWindows,
  getUpcomingOpportunities,
  getElasticityCurve,
  getAllElasticityCurves,
  getCalendarHeatMap,
  getHistoricalPatterns,
  getSignals,
  getSeasonalReturns,
  getBestEntryPoints,
  getEventImpactHistory,
  formatPct,
  getCategoryColor,
  getCategoryLabel,
  type MicroSeason,
  type EventWindow,
  type PriceElasticityCurve,
  type SeasonalSignal,
  type HistoricalPattern,
  type CalendarHeatMapEntry,
  type WindowOpportunity,
  type SeasonalReturn,
  type EventImpactRecord,
  type EventCategory,
} from '../lib/analytics/microSeasonService.ts';

type TabId = 'active' | 'heatmap' | 'elasticity' | 'signals' | 'patterns' | 'returns';

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const tabs: TabDef[] = [
  { id: 'active', label: 'Active Windows', icon: <Zap size={16} /> },
  { id: 'heatmap', label: 'Calendar Heat Map', icon: <Calendar size={16} /> },
  { id: 'elasticity', label: 'Elasticity Curves', icon: <Activity size={16} /> },
  { id: 'signals', label: 'Signal Dashboard', icon: <Target size={16} /> },
  { id: 'patterns', label: 'Historical Patterns', icon: <BarChart3 size={16} /> },
  { id: 'returns', label: 'Seasonal Returns', icon: <TrendingUp size={16} /> },
];

// ---- Confidence badge helper ----

function ConfidenceBadge({ confidence }: { confidence: number }) {
  let bg: string, text: string, label: string;
  if (confidence >= 0.85) {
    bg = 'bg-emerald-500/20'; text = 'text-emerald-300'; label = 'High';
  } else if (confidence >= 0.7) {
    bg = 'bg-amber-500/20'; text = 'text-amber-300'; label = 'Medium';
  } else {
    bg = 'bg-red-500/20'; text = 'text-red-300'; label = 'Low';
  }
  return (
    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${bg} ${text}`}>
      {label} ({(confidence * 100).toFixed(0)}%)
    </span>
  );
}

function DirectionBadge({ direction }: { direction: 'buy' | 'sell' }) {
  return direction === 'buy' ? (
    <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300">
      <ArrowUpRight size={10} /> BUY
    </span>
  ) : (
    <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/20 text-rose-300">
      <ArrowDownRight size={10} /> SELL
    </span>
  );
}

function CategoryBadge({ category }: { category: EventCategory }) {
  const color = getCategoryColor(category);
  return (
    <span
      className="px-2 py-0.5 text-[10px] font-bold rounded-full border"
      style={{ color, borderColor: color + '44', backgroundColor: color + '18' }}
    >
      {getCategoryLabel(category)}
    </span>
  );
}

// ---- Countdown timer ----

function useCountdown(targetISO: string): string {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const target = new Date(targetISO).getTime();
  const diff = target - now;
  if (diff <= 0) return 'Expired';

  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  if (days > 0) return `${days}d ${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
  return `${mins}m ${secs}s`;
}

function CountdownDisplay({ endISO, label }: { endISO: string; label: string }) {
  const countdown = useCountdown(endISO);
  return (
    <div className="flex items-center gap-2">
      <Timer size={14} className="text-amber-400" />
      <span className="text-xs text-slate-400">{label}:</span>
      <span className="text-xs font-mono font-bold text-amber-300">{countdown}</span>
    </div>
  );
}

// ---- Tooltip Styles ----

const tooltipStyle = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  fontSize: '12px',
};

// ---- Active Windows Tab ----

function ActiveWindowsTab() {
  const activeWindows = useMemo(() => getActiveWindows(), []);
  const opportunities = useMemo(() => getUpcomingOpportunities(), []);
  const impactHistory = useMemo(() => getEventImpactHistory(), []);

  const immediateOpps = opportunities.filter(o => o.urgency === 'immediate');
  const upcomingOpps = opportunities.filter(o => o.urgency === 'upcoming').slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Active Windows */}
      <div>
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Flame size={18} className="text-orange-400" />
          Live Event Windows ({activeWindows.length} active)
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {activeWindows.map(w => (
            <div key={w.id} className="bg-slate-800/50 border border-emerald-500/30 rounded-xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-bl-full" />
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{w.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{w.windowDescription}</p>
                </div>
                <div className="flex gap-1.5">
                  <DirectionBadge direction={w.direction} />
                  <CategoryBadge category={w.category} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">Avg Return</p>
                  <p className="text-lg font-bold text-emerald-400">{formatPct(w.avgReturnPct)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">Peak Elasticity</p>
                  <p className="text-lg font-bold text-violet-400">{w.priceElasticityPeak.toFixed(1)}x</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">Confidence</p>
                  <ConfidenceBadge confidence={w.confidenceLevel} />
                </div>
              </div>
              <CountdownDisplay endISO={w.endISO} label="Window closes in" />
              <div className="mt-3 flex flex-wrap gap-1.5">
                {w.relatedPlayerTags.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 text-[10px] bg-slate-700/50 text-slate-300 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Opportunities */}
      <div>
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Clock size={18} className="text-blue-400" />
          Upcoming Opportunities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingOpps.map(o => (
            <div key={o.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-200">{o.windowName}</h3>
                <DirectionBadge direction={o.direction} />
              </div>
              <div className="flex items-center gap-3 mb-2">
                <CategoryBadge category={o.category} />
                <span className="text-xs text-slate-400">{o.sport}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                <div>
                  <p className="text-slate-500">Opens in</p>
                  <p className="font-bold text-blue-400">{o.daysUntilOpen}d</p>
                </div>
                <div>
                  <p className="text-slate-500">Est. Return</p>
                  <p className="font-bold text-emerald-400">{formatPct(o.estimatedReturn)}</p>
                </div>
              </div>
              <ConfidenceBadge confidence={o.confidence} />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Impact History */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-emerald-400" />
          Recent Event Impact History
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 text-slate-400 font-medium">Event</th>
                <th className="text-left py-2 text-slate-400 font-medium">Sport</th>
                <th className="text-left py-2 text-slate-400 font-medium">Category</th>
                <th className="text-right py-2 text-slate-400 font-medium">Price Impact</th>
                <th className="text-right py-2 text-slate-400 font-medium">Volume</th>
                <th className="text-right py-2 text-slate-400 font-medium">Duration</th>
                <th className="text-left py-2 text-slate-400 font-medium">Top Mover</th>
              </tr>
            </thead>
            <tbody>
              {impactHistory.map(record => (
                <tr key={record.eventId} className="border-b border-slate-800 hover:bg-slate-700/20">
                  <td className="py-2.5 font-medium text-slate-200">{record.eventName}</td>
                  <td className="py-2.5 text-slate-400">{record.sport}</td>
                  <td className="py-2.5"><CategoryBadge category={record.category} /></td>
                  <td className={`py-2.5 text-right font-bold ${record.priceChangePct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatPct(record.priceChangePct)}
                  </td>
                  <td className="py-2.5 text-right text-slate-300">+{record.volumeChange}%</td>
                  <td className="py-2.5 text-right text-slate-300">{record.durationDays}d</td>
                  <td className="py-2.5 text-slate-300">{record.topMovers[0]?.player}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---- Calendar Heat Map Tab ----

function CalendarHeatMapTab() {
  const heatMap = useMemo(() => getCalendarHeatMap(), []);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const intensityToColor = (intensity: number): string => {
    if (intensity >= 0.9) return '#22c55e';
    if (intensity >= 0.75) return '#84cc16';
    if (intensity >= 0.6) return '#eab308';
    if (intensity >= 0.4) return '#f97316';
    return '#64748b';
  };

  const monthlyAggregates = useMemo(() => {
    return monthNames.map((name, i) => {
      const entries = heatMap.filter(e => e.month === i + 1);
      const avgIntensity = entries.reduce((s, e) => s + e.intensity, 0) / entries.length;
      const avgReturn = entries.reduce((s, e) => s + e.avgReturn, 0) / entries.length;
      const totalEvents = entries.reduce((s, e) => s + e.eventCount, 0);
      return { month: name, avgIntensity: +avgIntensity.toFixed(2), avgReturn: +avgReturn.toFixed(1), totalEvents };
    });
  }, [heatMap]);

  return (
    <div className="space-y-6">
      {/* Heat Map Grid */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-cyan-400" />
          Annual Event Intensity Heat Map
        </h2>
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Header */}
            <div className="grid grid-cols-13 gap-1 mb-2">
              <div className="text-[10px] text-slate-500 font-medium" />
              {monthNames.map(m => (
                <div key={m} className="text-[10px] text-slate-400 font-medium text-center">{m}</div>
              ))}
            </div>
            {/* Weeks */}
            {[1, 2, 3, 4].map(week => (
              <div key={week} className="grid grid-cols-13 gap-1 mb-1">
                <div className="text-[10px] text-slate-500 font-medium flex items-center">W{week}</div>
                {monthNames.map((_, mIdx) => {
                  const entry = heatMap.find(e => e.month === mIdx + 1 && e.week === week);
                  if (!entry) return <div key={mIdx} className="h-10 rounded bg-slate-800" />;
                  return (
                    <div
                      key={mIdx}
                      className="h-10 rounded flex items-center justify-center cursor-pointer transition-transform hover:scale-110 group relative"
                      style={{ backgroundColor: intensityToColor(entry.intensity) + '33', border: `1px solid ${intensityToColor(entry.intensity)}44` }}
                    >
                      <span className="text-[10px] font-bold" style={{ color: intensityToColor(entry.intensity) }}>
                        {entry.eventCount}
                      </span>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                        <div className="bg-slate-900 border border-slate-600 rounded-lg p-2 text-[10px] whitespace-nowrap shadow-xl">
                          <p className="text-slate-200 font-bold">{entry.label}</p>
                          <p className="text-slate-400">{entry.topEvent}</p>
                          <p className="text-emerald-400">Avg Return: {formatPct(entry.avgReturn)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            {/* Legend */}
            <div className="flex items-center gap-4 mt-4">
              <span className="text-[10px] text-slate-500">Intensity:</span>
              {[
                { label: 'Low', color: '#64748b' },
                { label: 'Moderate', color: '#f97316' },
                { label: 'High', color: '#eab308' },
                { label: 'Very High', color: '#84cc16' },
                { label: 'Peak', color: '#22c55e' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: l.color + '55' }} />
                  <span className="text-[10px] text-slate-400">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Event Density Bar Chart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-violet-400" />
          Monthly Event Density & Average Returns
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthlyAggregates}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v: number) => `${v}%`} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar yAxisId="left" dataKey="totalEvents" name="Events" fill="#8b5cf6" radius={[4, 4, 0, 0]} opacity={0.8} />
              <Line yAxisId="right" dataKey="avgReturn" name="Avg Return %" type="monotone" stroke="#34d399" strokeWidth={2} dot={{ fill: '#34d399', r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ---- Elasticity Curves Tab ----

function ElasticityCurvesTab() {
  const curves = useMemo(() => getAllElasticityCurves(), []);
  const [selectedCurve, setSelectedCurve] = useState(0);
  const currentCurve = curves[selectedCurve];

  return (
    <div className="space-y-6">
      {/* Curve Selector */}
      <div className="flex flex-wrap gap-2">
        {curves.map((c, i) => (
          <button
            key={c.eventId}
            onClick={() => setSelectedCurve(i)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              i === selectedCurve
                ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            {c.eventName}
          </button>
        ))}
      </div>

      {/* Selected Curve */}
      {currentCurve && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-1">{currentCurve.eventName}</h2>
          <p className="text-xs text-slate-400 mb-4">Price elasticity and volume over event timeline (day offset from start)</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={currentCurve.points}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="dayOffset" tick={{ fontSize: 10, fill: '#64748b' }} label={{ value: 'Day Offset', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748b' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#64748b' }} label={{ value: 'Elasticity', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#64748b' }} label={{ value: 'Volume', angle: 90, position: 'insideRight', fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area yAxisId="right" dataKey="volume" name="Volume" fill="#3b82f6" fillOpacity={0.15} stroke="#3b82f6" strokeWidth={1} type="monotone" />
                <Line yAxisId="left" dataKey="elasticity" name="Elasticity" stroke="#a78bfa" strokeWidth={2.5} dot={false} type="monotone" />
                <Line yAxisId="left" dataKey="avgPriceChangePct" name="Avg Price Change %" stroke="#34d399" strokeWidth={1.5} dot={false} type="monotone" strokeDasharray="5 5" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Elasticity Comparison Scatter */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Activity size={18} className="text-cyan-400" />
          Peak Elasticity vs Average Return (All Events)
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="peakElasticity"
                name="Peak Elasticity"
                tick={{ fontSize: 10, fill: '#64748b' }}
                label={{ value: 'Peak Elasticity', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748b' }}
                type="number"
              />
              <YAxis
                dataKey="avgReturn"
                name="Avg Return %"
                tick={{ fontSize: 10, fill: '#64748b' }}
                label={{ value: 'Avg Return %', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }}
                type="number"
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number, name: string) => [name === 'Peak Elasticity' ? `${value}x` : `${value}%`, name]}
                labelFormatter={() => ''}
              />
              <Scatter
                name="Events"
                data={curves.map(c => {
                  const peakPoint = c.points.reduce((max, p) => p.elasticity > max.elasticity ? p : max, c.points[0]);
                  return {
                    peakElasticity: peakPoint.elasticity,
                    avgReturn: peakPoint.avgPriceChangePct,
                    name: c.eventName,
                  };
                })}
                fill="#a78bfa"
              >
                {curves.map((_, i) => (
                  <Cell key={i} fill={['#a78bfa', '#34d399', '#60a5fa', '#fbbf24', '#f87171', '#f472b6', '#38bdf8', '#818cf8', '#fb923c', '#4ade80', '#e879f9', '#22d3ee'][i % 12]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ---- Signal Dashboard Tab ----

function SignalDashboardTab() {
  const signals = useMemo(() => getSignals(), []);
  const buySignals = signals.filter(s => s.direction === 'buy');
  const sellSignals = signals.filter(s => s.direction === 'sell');

  const strengthData = useMemo(() =>
    signals.slice(0, 12).map(s => ({
      name: s.eventName.length > 25 ? s.eventName.slice(0, 22) + '...' : s.eventName,
      strength: s.strength,
      confidence: Math.round(s.confidence * 100),
      expectedReturn: s.expectedReturnPct,
      fill: s.direction === 'buy' ? '#34d399' : '#f87171',
    })), [signals]);

  return (
    <div className="space-y-6">
      {/* Signal Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Signals</p>
          <p className="text-3xl font-bold text-slate-100">{signals.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-emerald-500/20 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Buy Signals</p>
          <p className="text-3xl font-bold text-emerald-400">{buySignals.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-rose-500/20 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Sell Signals</p>
          <p className="text-3xl font-bold text-rose-400">{sellSignals.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-violet-500/20 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Confidence</p>
          <p className="text-3xl font-bold text-violet-400">
            {(signals.reduce((s, sig) => s + sig.confidence, 0) / signals.length * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Signal Strength Chart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Target size={18} className="text-amber-400" />
          Signal Strength Comparison
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={strengthData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} width={160} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number, name: string) => {
                  if (name === 'Strength') return [value, 'Signal Strength'];
                  return [`${value}%`, name];
                }}
              />
              <Bar dataKey="strength" name="Strength" radius={[0, 4, 4, 0]}>
                {strengthData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} opacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Signal Cards */}
      <div>
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Zap size={18} className="text-yellow-400" />
          Active Signal Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {signals.slice(0, 8).map(sig => (
            <div key={sig.id} className={`bg-slate-800/50 border rounded-xl p-4 ${sig.direction === 'buy' ? 'border-emerald-500/20' : 'border-rose-500/20'}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-200">{sig.eventName}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">{sig.sport} &middot; {sig.timeToEvent}</p>
                </div>
                <div className="flex gap-1.5">
                  <DirectionBadge direction={sig.direction} />
                  <CategoryBadge category={sig.category} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div>
                  <p className="text-[10px] text-slate-500">Strength</p>
                  <div className="flex items-center gap-1">
                    <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(sig.strength, 100)}%`,
                          backgroundColor: sig.strength >= 80 ? '#34d399' : sig.strength >= 50 ? '#fbbf24' : '#f87171',
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-300">{sig.strength}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Expected</p>
                  <p className={`text-sm font-bold ${sig.expectedReturnPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatPct(sig.expectedReturnPct)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Confidence</p>
                  <ConfidenceBadge confidence={sig.confidence} />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic">{sig.suggestedAction}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Historical Patterns Tab ----

function HistoricalPatternsTab() {
  const categories: (EventCategory | 'all')[] = ['all', 'award', 'milestone', 'draft', 'trade-deadline', 'playoff', 'media', 'cultural'];
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>('all');
  const patterns = useMemo(
    () => selectedCategory === 'all' ? getHistoricalPatterns() : getHistoricalPatterns(selectedCategory as EventCategory),
    [selectedCategory],
  );
  const [selectedPattern, setSelectedPattern] = useState(0);

  const currentPattern = patterns[selectedPattern] || patterns[0];

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => { setSelectedCategory(cat); setSelectedPattern(0); }}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors capitalize ${
              cat === selectedCategory
                ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat === 'all' ? 'All Types' : getCategoryLabel(cat as EventCategory)}
          </button>
        ))}
      </div>

      {/* Pattern List + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="space-y-2">
          {patterns.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setSelectedPattern(i)}
              className={`w-full text-left p-3 rounded-xl border transition-colors ${
                i === selectedPattern
                  ? 'bg-slate-700/50 border-violet-500/40'
                  : 'bg-slate-800/30 border-slate-700/30 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-200">{p.eventName}</span>
                <span className={`text-xs font-bold ${p.avgReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatPct(p.avgReturn)}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-slate-400">{p.sport}</span>
                <span className="text-[10px] text-slate-500">&middot;</span>
                <span className="text-[10px] text-slate-400">Win Rate: {(p.winRate * 100).toFixed(0)}%</span>
              </div>
            </button>
          ))}
        </div>

        {/* Detail Chart */}
        {currentPattern && (
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-200">{currentPattern.eventName}</h2>
                  <p className="text-xs text-slate-400">{currentPattern.sport} &middot; {currentPattern.years.length} years of data</p>
                </div>
                <CategoryBadge category={currentPattern.eventType} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                  <p className="text-[10px] text-slate-500 uppercase">Avg Return</p>
                  <p className={`text-xl font-bold ${currentPattern.avgReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatPct(currentPattern.avgReturn)}
                  </p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                  <p className="text-[10px] text-slate-500 uppercase">Win Rate</p>
                  <p className="text-xl font-bold text-violet-400">{(currentPattern.winRate * 100).toFixed(0)}%</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                  <p className="text-[10px] text-slate-500 uppercase">Best Year</p>
                  <p className="text-xl font-bold text-emerald-400">{currentPattern.bestYear.year}</p>
                  <p className="text-[10px] text-emerald-400/70">{formatPct(currentPattern.bestYear.returnPct)}</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                  <p className="text-[10px] text-slate-500 uppercase">Consistency</p>
                  <p className="text-xl font-bold text-blue-400">{(currentPattern.consistency * 100).toFixed(0)}%</p>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={currentPattern.dataPoints}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v: number) => `${v}%`} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <ReferenceLine yAxisId="left" y={0} stroke="#475569" strokeDasharray="3 3" />
                    <Bar yAxisId="right" dataKey="volume" name="Volume" fill="#3b82f6" opacity={0.3} radius={[4, 4, 0, 0]} />
                    <Line yAxisId="left" dataKey="returnPct" name="Return %" type="monotone" stroke="#34d399" strokeWidth={2.5} dot={{ fill: '#34d399', r: 4, strokeWidth: 0 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Seasonal Returns Tab ----

function SeasonalReturnsTab() {
  const returns = useMemo(() => getSeasonalReturns(), []);
  const entryPoints = useMemo(() => getBestEntryPoints(), []);
  const seasons = useMemo(() => getMicroSeasons(), []);

  const sportColors: Record<string, string> = {
    baseball: '#ef4444',
    basketball: '#f97316',
    football: '#22c55e',
    hockey: '#3b82f6',
    soccer: '#a855f7',
    overall: '#94a3b8',
  };

  return (
    <div className="space-y-6">
      {/* Seasonal Returns Area Chart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-emerald-400" />
          Monthly Seasonal Returns by Sport
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={returns}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v: number) => `${v}%`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value}%`, '']} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Area type="monotone" dataKey="football" name="Football" stroke={sportColors.football} fill={sportColors.football} fillOpacity={0.1} strokeWidth={2} />
              <Area type="monotone" dataKey="basketball" name="Basketball" stroke={sportColors.basketball} fill={sportColors.basketball} fillOpacity={0.1} strokeWidth={2} />
              <Area type="monotone" dataKey="baseball" name="Baseball" stroke={sportColors.baseball} fill={sportColors.baseball} fillOpacity={0.1} strokeWidth={2} />
              <Area type="monotone" dataKey="hockey" name="Hockey" stroke={sportColors.hockey} fill={sportColors.hockey} fillOpacity={0.1} strokeWidth={2} />
              <Area type="monotone" dataKey="soccer" name="Soccer" stroke={sportColors.soccer} fill={sportColors.soccer} fillOpacity={0.1} strokeWidth={2} />
              <Line type="monotone" dataKey="overall" name="Overall" stroke={sportColors.overall} strokeWidth={3} strokeDasharray="5 5" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Best Entry Points */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Snowflake size={18} className="text-blue-400" />
            Best Entry Points (Buy Low)
          </h2>
          <div className="space-y-3">
            {entryPoints.map((ep, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-900/40 rounded-lg border border-slate-700/30">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-blue-400 w-8">{ep.month}</span>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{ep.sport}</p>
                    <p className="text-[10px] text-slate-400">{ep.reason}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-emerald-400">-{ep.avgDiscount}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Seasonal Calendar Overview */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Sun size={18} className="text-amber-400" />
            Top Micro-Seasons by Return
          </h2>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {[...seasons]
              .sort((a, b) => Math.abs(b.avgPriceImpactPct) - Math.abs(a.avgPriceImpactPct))
              .slice(0, 10)
              .map(ms => (
                <div key={ms.id} className="flex items-center justify-between p-3 bg-slate-900/40 rounded-lg border border-slate-700/30">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-slate-200">{ms.name}</p>
                      <DirectionBadge direction={ms.recommendedAction} />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>{ms.sport}</span>
                      <span>&middot;</span>
                      <CategoryBadge category={ms.category} />
                      <span>&middot;</span>
                      <span>Win: {(ms.historicalWinRate * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${ms.avgPriceImpactPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatPct(ms.avgPriceImpactPct)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Overall Return by Sport Bar Chart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Shield size={18} className="text-indigo-400" />
          Annual Average Return by Sport
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'].map(sport => {
                const key = sport.toLowerCase() as keyof SeasonalReturn;
                const avg = returns.reduce((s, r) => s + (r[key] as number), 0) / returns.length;
                return { sport, avgReturn: +avg.toFixed(1) };
              })}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="sport" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v: number) => `${v}%`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value}%`, 'Avg Return']} />
              <Bar dataKey="avgReturn" name="Avg Annual Return" radius={[6, 6, 0, 0]}>
                {['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'].map((sport, i) => (
                  <Cell key={i} fill={sportColors[sport.toLowerCase()]} opacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ---- Main Component ----

const MicroSeasonCapitalizer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Micro-Season Capitalizer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20">
            <Calendar size={24} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Micro-Season Capitalizer</h1>
            <p className="text-sm text-slate-400">
              Calendar-driven event windows, price elasticity curves &amp; seasonal buy/sell signals
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {getActiveWindows().length} Live Windows
          </span>
          <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
            {getMicroSeasons().length} Micro-Seasons
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 bg-slate-800/30 border border-slate-700/50 rounded-xl p-1.5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-slate-700/70 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'active' && <ActiveWindowsTab />}
      {activeTab === 'heatmap' && <CalendarHeatMapTab />}
      {activeTab === 'elasticity' && <ElasticityCurvesTab />}
      {activeTab === 'signals' && <SignalDashboardTab />}
      {activeTab === 'patterns' && <HistoricalPatternsTab />}
      {activeTab === 'returns' && <SeasonalReturnsTab />}
    </div>
  );
};

export default MicroSeasonCapitalizer;
