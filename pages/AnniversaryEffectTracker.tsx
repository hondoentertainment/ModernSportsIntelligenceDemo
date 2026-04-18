import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Activity,
  AlertTriangle,
  Star,
  Award,
  Zap,
  BarChart3,
  Shield,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  getAnniversaryEvents,
  getPriceEffects,
  getEffectPatterns,
  getAnniversaryCalendar,
  getAnniversarySummary,
  type AnniversaryEvent,
  type PriceEffect,
  type EffectPattern,
  type AnniversaryCalendar,
} from '../lib/anniversaryEffectService';

type TabId = 'calendar' | 'events' | 'effects' | 'patterns';

const TABS: { id: TabId; label: string }[] = [
  { id: 'calendar', label: 'Calendar' },
  { id: 'events', label: 'Events' },
  { id: 'effects', label: 'Effects' },
  { id: 'patterns', label: 'Patterns' },
];

const CATEGORY_COLORS: Record<string, string> = {
  championship: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  record: 'bg-red-500/20 text-red-400 border-red-500/30',
  debut: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  milestone: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  cultural: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  championship: <Award size={14} />,
  record: <Zap size={14} />,
  debut: <Star size={14} />,
  milestone: <Target size={14} />,
  cultural: <Activity size={14} />,
};

function formatCountdown(days: number): string {
  if (days < 0) return `${Math.abs(days)}d ago`;
  if (days === 0) return 'Today';
  if (days <= 7) return `${days}d away`;
  if (days <= 60) return `${Math.round(days / 7)}w away`;
  return `${Math.round(days / 30)}mo away`;
}

function getCountdownColor(days: number): string {
  if (days < 0) return 'text-gray-500';
  if (days === 0) return 'text-emerald-400';
  if (days <= 14) return 'text-red-400';
  if (days <= 30) return 'text-amber-400';
  return 'text-blue-400';
}

const AnniversaryEffectTracker: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('calendar');

  const events = useMemo(() => getAnniversaryEvents(), []);
  const priceEffects = useMemo(() => getPriceEffects(), []);
  const patterns = useMemo(() => getEffectPatterns(), []);
  const calendar = useMemo(() => getAnniversaryCalendar(), []);
  const summary = useMemo(() => getAnniversarySummary(), []);

  // Calendar chart data
  const calendarChartData = useMemo(() => {
    return calendar.map(c => ({
      name: c.month.substring(0, 3),
      events: c.events,
      impact: c.avgImpact,
      cumulative: c.cumulativeEffect,
    }));
  }, [calendar]);

  // Price effects chart data (pre/peak/post timeline)
  const effectTimelineData = useMemo(() => {
    const uniqueEvents = [...new Set(priceEffects.map(e => e.eventName))].slice(0, 6);
    return uniqueEvents.map(name => {
      const latest = priceEffects.filter(e => e.eventName === name).sort((a, b) => b.year - a.year)[0];
      return {
        name: name.length > 20 ? name.substring(0, 18) + '...' : name,
        preDays: latest.preDays,
        peakDay: latest.peakDay,
        postDays: latest.postDays,
        priceChange: latest.priceChange,
        volumeChange: latest.volumeChange,
      };
    });
  }, [priceEffects]);

  // Radar chart data for patterns
  const radarData = useMemo(() => {
    return patterns.map(p => ({
      pattern: p.patternName.split(' ').slice(0, 2).join(' '),
      magnitude: p.avgMagnitude,
      duration: p.avgDuration,
      reliability: p.reliability,
      occurrences: Math.min(p.occurrenceCount, 50),
    }));
  }, [patterns]);

  // Sorted events for upcoming view
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      if (a.daysUntilAnniversary < 0 && b.daysUntilAnniversary >= 0) return 1;
      if (a.daysUntilAnniversary >= 0 && b.daysUntilAnniversary < 0) return -1;
      return a.daysUntilAnniversary - b.daysUntilAnniversary;
    });
  }, [events]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <CalendarDays size={22} className="text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Anniversary Effect Tracker</h1>
              <p className="text-gray-400 text-sm">
                How historic sports anniversaries create predictable price effects in the card market
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-emerald-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide">Upcoming (30d)</span>
            </div>
            <p className="text-emerald-400 font-bold text-3xl">{summary.upcomingEvents30d}</p>
            <p className="text-gray-500 text-xs mt-1">events in next 30 days</p>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-violet-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide">Avg Price Effect</span>
            </div>
            <p className="text-violet-400 font-bold text-3xl">+{summary.avgEffect}%</p>
            <p className="text-gray-500 text-xs mt-1">historical average impact</p>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Target size={16} className="text-blue-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide">Strongest Pattern</span>
            </div>
            <p className="text-blue-400 font-bold text-lg leading-tight">{summary.strongestPattern.split(' ').slice(0, 2).join(' ')}</p>
            <p className="text-gray-500 text-xs mt-1">{summary.strongestPattern.split(' ').slice(2).join(' ')}</p>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays size={16} className="text-amber-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide">Calendar Coverage</span>
            </div>
            <p className="text-amber-400 font-bold text-3xl">{summary.calendarCoverage}%</p>
            <p className="text-gray-500 text-xs mt-1">months with tracked events</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-gray-900 rounded-xl border border-gray-800 p-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            {/* Monthly Events BarChart */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                <BarChart3 size={16} className="text-emerald-400" />
                Monthly Anniversary Events and Impact
              </h3>
              <p className="text-gray-500 text-xs mb-4">Number of tracked events and average price impact per month</p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={calendarChartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#f3f4f6' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar yAxisId="left" dataKey="events" name="Events" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="impact" name="Avg Impact %" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Calendar Month Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {calendar.map(month => (
                <div key={month.month} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-semibold text-sm">{month.month}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      month.events >= 3 ? 'bg-emerald-500/20 text-emerald-400' :
                      month.events >= 2 ? 'bg-amber-500/20 text-amber-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {month.events} event{month.events !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={12} className="text-emerald-400" />
                    <span className="text-emerald-400 font-bold text-sm">+{month.avgImpact}%</span>
                    <span className="text-gray-600 text-xs">avg impact</span>
                  </div>
                  <div className="bg-gray-800/50 rounded px-2 py-1.5">
                    <p className="text-gray-400 text-[10px]">Top Event</p>
                    <p className="text-white text-xs font-medium truncate">{month.topEvent}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedEvents.map(event => (
                <div key={event.id} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${CATEGORY_COLORS[event.category]}`}>
                          {CATEGORY_ICONS[event.category]}
                          {event.category}
                        </span>
                        <span className="text-gray-600 text-xs">{event.yearsAgo}yr anniversary</span>
                      </div>
                      <h4 className="text-white font-semibold text-sm">{event.eventName}</h4>
                      <p className="text-gray-500 text-xs">Original: {event.originalDate}</p>
                    </div>
                    <div className="text-right ml-3">
                      <div className={`px-3 py-1.5 rounded-lg bg-gray-800/50 ${getCountdownColor(event.daysUntilAnniversary)}`}>
                        <p className="font-bold text-sm">{formatCountdown(event.daysUntilAnniversary)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                      <p className="text-emerald-400 font-bold text-lg">+{event.expectedPriceEffect}%</p>
                      <p className="text-gray-500 text-[10px]">Expected Effect</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                      <p className="text-violet-400 font-bold text-lg">+{event.historicalAvgEffect}%</p>
                      <p className="text-gray-500 text-[10px]">Historical Avg</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-1">Affected Cards</p>
                    <div className="flex flex-wrap gap-1">
                      {event.affectedCards.map((card, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-gray-800 text-gray-400 text-[10px]">{card}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'effects' && (
          <div className="space-y-6">
            {/* Price Effect Timeline LineChart */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                <Activity size={16} className="text-emerald-400" />
                Price Effects Around Anniversary Dates
              </h3>
              <p className="text-gray-500 text-xs mb-4">Price change and volume change observed for recent anniversary events</p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={effectTimelineData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
                    <YAxis yAxisId="left" tick={{ fill: '#9ca3af', fontSize: 11 }} label={{ value: 'Price %', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9ca3af', fontSize: 11 }} label={{ value: 'Volume %', angle: 90, position: 'insideRight', fill: '#6b7280', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#f3f4f6' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line yAxisId="left" type="monotone" dataKey="priceChange" name="Price Change %" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
                    <Line yAxisId="right" type="monotone" dataKey="volumeChange" name="Volume Change %" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Effect Detail Cards */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-800">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <BarChart3 size={16} className="text-emerald-400" />
                  Detailed Price Effects
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wide">
                      <th className="text-left px-5 py-3">Event</th>
                      <th className="text-center px-3 py-3">Year</th>
                      <th className="text-center px-3 py-3">Pre (days)</th>
                      <th className="text-center px-3 py-3">Peak Day</th>
                      <th className="text-center px-3 py-3">Post (days)</th>
                      <th className="text-right px-3 py-3">Price Change</th>
                      <th className="text-right px-3 py-3">Volume Change</th>
                      <th className="text-center px-5 py-3">Sustained</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceEffects.map(effect => (
                      <tr key={effect.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                        <td className="px-5 py-3 text-white font-medium text-xs">{effect.eventName}</td>
                        <td className="px-3 py-3 text-center text-gray-400">{effect.year}</td>
                        <td className="px-3 py-3 text-center text-blue-400">{effect.preDays}d</td>
                        <td className="px-3 py-3 text-center text-amber-400">Day {effect.peakDay}</td>
                        <td className="px-3 py-3 text-center text-gray-400">{effect.postDays}d</td>
                        <td className="px-3 py-3 text-right text-emerald-400 font-bold">+{effect.priceChange}%</td>
                        <td className="px-3 py-3 text-right text-violet-400">+{effect.volumeChange}%</td>
                        <td className="px-5 py-3 text-center">
                          {effect.sustainedEffect ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">YES</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-gray-500/20 text-gray-500 text-[10px] font-bold">NO</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'patterns' && (
          <div className="space-y-6">
            {/* Radar Chart */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                <Target size={16} className="text-emerald-400" />
                Pattern Metrics Radar
              </h3>
              <p className="text-gray-500 text-xs mb-4">Comparing magnitude, duration, reliability, and occurrence frequency across patterns</p>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="pattern" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                    <PolarRadiusAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#f3f4f6' }}
                    />
                    <Radar name="Magnitude" dataKey="magnitude" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
                    <Radar name="Reliability" dataKey="reliability" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} strokeWidth={2} />
                    <Radar name="Duration (days)" dataKey="duration" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={2} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pattern Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patterns.map(pattern => (
                <div key={pattern.id} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${CATEGORY_COLORS[pattern.category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                          {pattern.category}
                        </span>
                      </div>
                      <h4 className="text-white font-semibold text-sm">{pattern.patternName}</h4>
                    </div>
                    <div className="ml-3">
                      <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                        pattern.reliability >= 85 ? 'border-emerald-500 text-emerald-400' :
                        pattern.reliability >= 70 ? 'border-blue-500 text-blue-400' :
                        'border-amber-500 text-amber-400'
                      }`}>
                        <span className="text-sm font-bold">{pattern.reliability}%</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-400 text-xs leading-relaxed mb-3">{pattern.description}</p>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                      <p className="text-emerald-400 font-bold text-sm">+{pattern.avgMagnitude}%</p>
                      <p className="text-gray-500 text-[10px]">Avg Magnitude</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                      <p className="text-blue-400 font-bold text-sm">{pattern.avgDuration}d</p>
                      <p className="text-gray-500 text-[10px]">Avg Duration</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                      <p className="text-violet-400 font-bold text-sm">{pattern.occurrenceCount}x</p>
                      <p className="text-gray-500 text-[10px]">Occurrences</p>
                    </div>
                  </div>

                  <div className="bg-gray-800/30 rounded-lg px-3 py-2">
                    <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-0.5">Best Strategy</p>
                    <p className="text-amber-400 text-xs">{pattern.bestExploitStrategy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnniversaryEffectTracker;
