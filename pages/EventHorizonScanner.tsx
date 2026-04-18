import React, { useState } from 'react';
import {
  Crosshair, Calendar, TrendingUp, TrendingDown, Target,
  BarChart3, Clock, AlertTriangle, Zap, BookOpen, Layers, Activity
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import {
  getUpcomingEvents, getImpactForecasts, getHistoricalEventImpacts,
  getEventCategories, getEventSummary,
} from '../lib/eventHorizonService.ts';

const TABS = [
  { id: 'timeline', label: 'Timeline', icon: <Calendar className="w-4 h-4" /> },
  { id: 'forecasts', label: 'Forecasts', icon: <Target className="w-4 h-4" /> },
  { id: 'historical', label: 'Historical', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'categories', label: 'Categories', icon: <Layers className="w-4 h-4" /> },
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  draft: 'bg-emerald-500/20 text-emerald-400',
  playoff: 'bg-violet-500/20 text-violet-400',
  award: 'bg-amber-500/20 text-amber-400',
  release: 'bg-blue-500/20 text-blue-400',
  cultural: 'bg-cyan-500/20 text-cyan-400',
  grading: 'bg-red-500/20 text-red-400',
};

const CATEGORY_DOT_COLORS: Record<string, string> = {
  draft: 'bg-emerald-500',
  playoff: 'bg-violet-500',
  award: 'bg-amber-500',
  release: 'bg-blue-500',
  cultural: 'bg-cyan-500',
  grading: 'bg-red-500',
};

const WINDOW_STYLES: Record<string, string> = {
  'pre-event': 'bg-emerald-500/20 text-emerald-400',
  'during': 'bg-blue-500/20 text-blue-400',
  'post-event': 'bg-amber-500/20 text-amber-400',
};

const CHART_COLORS = ['#10b981', '#8b5cf6', '#f59e0b', '#3b82f6', '#06b6d4', '#ef4444', '#ec4899', '#14b8a6', '#a855f7', '#0ea5e9'];

export default function EventHorizonScanner() {
  const [activeTab, setActiveTab] = useState<string>('timeline');

  const events = getUpcomingEvents();
  const forecasts = getImpactForecasts();
  const historical = getHistoricalEventImpacts();
  const categories = getEventCategories();
  const summary = getEventSummary();

  const stats = [
    { label: 'Events Next 30d', value: summary.eventsNext30Days, icon: <Calendar className="w-5 h-5" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Highest Impact', value: summary.highestImpactEvent, icon: <Zap className="w-5 h-5" />, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Forecast Accuracy', value: `${summary.avgForecastAccuracy}%`, icon: <Target className="w-5 h-5" />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Events Tracked', value: summary.totalEventsTracked, icon: <Activity className="w-5 h-5" />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  // Forecast chart data
  const forecastChart = forecasts.map(f => ({
    name: `${f.segment.substring(0, 10)}`,
    predicted: f.predictedMove,
    low: f.lowEstimate,
    high: f.highEstimate,
    event: f.eventName,
  }));

  // Historical comparison chart data
  const historicalChart = historical.map(h => ({
    name: h.eventName.length > 18 ? h.eventName.substring(0, 18) + '...' : h.eventName,
    actual: h.actualMove,
    predicted: h.predictedMove,
  }));

  // Radar chart data for categories
  const categoryRadar = categories.map(c => ({
    category: c.category,
    impact: c.avgImpact * 10,
    reliability: c.reliability,
    duration: c.avgDuration,
    eventCount: c.eventCount,
  }));

  // Sort events by daysUntil for timeline
  const sortedEvents = [...events].sort((a, b) => a.daysUntil - b.daysUntil);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/20">
            <Crosshair className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Event Horizon Scanner</h1>
            <p className="text-sm text-gray-400">Forecast market impact of upcoming sports and hobby events on card values</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${stat.bg}`}><span className={stat.color}>{stat.icon}</span></div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-white truncate">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}>{tab.icon}{tab.label}</button>
          ))}
        </div>

        {/* Tab 1: Timeline */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Impact Timeline</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={sortedEvents.map(e => ({
                  name: e.name.length > 16 ? e.name.substring(0, 16) + '...' : e.name,
                  impact: e.expectedImpact,
                  daysUntil: e.daysUntil,
                  confidence: e.confidence,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 9 }} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="impact" name="Expected Impact" radius={[4, 4, 0, 0]}>
                    {sortedEvents.map((e, i) => (
                      <Cell key={i} fill={e.expectedImpact >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Visual timeline */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Upcoming Events</h3>
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-700" />
                <div className="space-y-4">
                  {sortedEvents.map(event => (
                    <div key={event.id} className="relative flex items-start gap-4 pl-12">
                      <div className="absolute left-4 top-2 w-4 h-4 rounded-full border-2 border-gray-700 bg-gray-900 flex items-center justify-center">
                        <div className={`w-2 h-2 rounded-full ${CATEGORY_DOT_COLORS[event.category]}`} />
                      </div>
                      <div className="flex-1 bg-gray-800/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">{event.name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${CATEGORY_COLORS[event.category]}`}>
                              {event.category}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${WINDOW_STYLES[event.actionWindow]}`}>
                              {event.actionWindow}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 font-mono">{event.date}</span>
                            <span className={`text-xs font-bold ${event.daysUntil <= 14 ? 'text-red-400' : event.daysUntil <= 30 ? 'text-amber-400' : 'text-gray-400'}`}>
                              {event.daysUntil}d
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <span className={`font-mono font-bold ${event.expectedImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            Impact: {event.expectedImpact > 0 ? '+' : ''}{event.expectedImpact}
                          </span>
                          <span className="font-mono text-violet-400">Confidence: {event.confidence}%</span>
                          <span className="font-mono text-cyan-400">Hist Avg: {event.historicalAvgMove > 0 ? '+' : ''}{event.historicalAvgMove}%</span>
                          <span className="text-gray-500">Segments: {event.affectedSegments.join(', ')}</span>
                        </div>
                        {/* Impact bar */}
                        <div className="mt-2">
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${event.expectedImpact >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                              style={{ width: `${Math.min(100, Math.abs(event.expectedImpact) * 10)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Forecasts */}
        {activeTab === 'forecasts' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Predicted Moves by Segment</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={forecastChart} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                    formatter={(value: number, name: string) => [`${value}%`, name]}
                  />
                  <Bar dataKey="predicted" name="Predicted Move %" radius={[0, 4, 4, 0]}>
                    {forecastChart.map((entry, i) => (
                      <Cell key={i} fill={entry.predicted >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {forecasts.map(f => (
                <div key={f.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-white">{f.eventName}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      f.predictedMove >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {f.predictedMove > 0 ? '+' : ''}{f.predictedMove}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">Segment: <span className="text-blue-400">{f.segment}</span></p>
                  <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                    <div>
                      <span className="text-gray-500">Low Estimate</span>
                      <div className="font-mono text-red-400">{f.lowEstimate}%</div>
                    </div>
                    <div>
                      <span className="text-gray-500">High Estimate</span>
                      <div className="font-mono text-emerald-400">{f.highEstimate > 0 ? '+' : ''}{f.highEstimate}%</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Optimal Entry</span>
                      <div className="font-mono text-violet-400">{f.optimalEntryDays}d before</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Optimal Exit</span>
                      <div className="font-mono text-amber-400">{f.optimalExitDays}d after</div>
                    </div>
                  </div>
                  {/* Confidence range bar */}
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Model Accuracy</span>
                      <span className="font-mono">{f.modelAccuracy}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${f.modelAccuracy >= 80 ? 'bg-emerald-500' : f.modelAccuracy >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${f.modelAccuracy}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Historical */}
        {activeTab === 'historical' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Predicted vs Actual Moves</h3>
              <ResponsiveContainer width="100%" height={380}>
                <LineChart data={historicalChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 9 }} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="predicted" name="Predicted Move %" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4, fill: '#8b5cf6' }} />
                  <Line type="monotone" dataKey="actual" name="Actual Move %" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981' }} />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Forecast Error by Event</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={historical.map(h => ({
                  name: h.eventName.length > 16 ? h.eventName.substring(0, 16) + '...' : h.eventName,
                  error: h.forecastError,
                  recovery: h.recoveryDays,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 9 }} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="error" name="Forecast Error %" radius={[4, 4, 0, 0]}>
                    {historical.map((h, i) => (
                      <Cell key={i} fill={Math.abs(h.forecastError) <= 1.5 ? '#10b981' : '#f59e0b'} />
                    ))}
                  </Bar>
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {historical.map(h => (
                <div key={h.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-white">{h.eventName}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${CATEGORY_COLORS[h.category]}`}>
                      {h.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{h.date}</p>
                  <div className="grid grid-cols-4 gap-2 text-xs mb-3">
                    <div>
                      <span className="text-gray-500">Actual</span>
                      <div className={`font-mono ${h.actualMove >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {h.actualMove > 0 ? '+' : ''}{h.actualMove}%
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Predicted</span>
                      <div className={`font-mono ${h.predictedMove >= 0 ? 'text-violet-400' : 'text-amber-400'}`}>
                        {h.predictedMove > 0 ? '+' : ''}{h.predictedMove}%
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Peak Day</span>
                      <div className="font-mono text-blue-400">Day {h.peakImpactDay}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Recovery</span>
                      <div className="font-mono text-cyan-400">{h.recoveryDays}d</div>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="w-3 h-3 text-amber-400" />
                      <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Lesson Learned</span>
                    </div>
                    <p className="text-xs text-gray-300">{h.lesson}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Categories */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Category Metrics Radar</h3>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={categoryRadar}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="category" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <Radar name="Impact (x10)" dataKey="impact" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                  <Radar name="Reliability" dataKey="reliability" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
                  <Radar name="Duration" dataKey="duration" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={2} strokeDasharray="5 5" />
                  <Legend />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat, i) => (
                <div key={cat.category} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-bold text-white capitalize">{cat.category}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${CATEGORY_COLORS[cat.category.toLowerCase()] || 'bg-gray-500/20 text-gray-400'}`}>
                      {cat.eventCount} events
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div>
                      <span className="text-gray-500 text-xs">Avg Impact</span>
                      <div className={`font-mono text-lg ${cat.avgImpact >= 5 ? 'text-emerald-400' : 'text-blue-400'}`}>
                        {cat.avgImpact > 0 ? '+' : ''}{cat.avgImpact}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Reliability</span>
                      <div className={`font-mono text-lg ${cat.reliability >= 80 ? 'text-emerald-400' : cat.reliability >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                        {cat.reliability}%
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Avg Duration</span>
                      <div className="font-mono text-lg text-violet-400">{cat.avgDuration}d</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Best Segment</span>
                      <div className="font-mono text-sm text-cyan-400 truncate">{cat.bestPerformingSegment}</div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Reliability Score</span>
                      <span className="font-mono">{cat.reliability}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${cat.reliability >= 80 ? 'bg-emerald-500' : cat.reliability >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${cat.reliability}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800"><h3 className="text-sm font-semibold text-gray-300">Category Comparison</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-800">
                    <th className="text-left p-3 text-gray-500 font-medium">Category</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Avg Impact</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Events</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Avg Duration</th>
                    <th className="text-left p-3 text-gray-500 font-medium">Best Segment</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Reliability</th>
                  </tr></thead>
                  <tbody>
                    {categories.map(cat => (
                      <tr key={cat.category} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${CATEGORY_COLORS[cat.category.toLowerCase()] || 'bg-gray-500/20 text-gray-400'}`}>
                            {cat.category}
                          </span>
                        </td>
                        <td className={`p-3 text-right font-mono text-xs ${cat.avgImpact >= 5 ? 'text-emerald-400' : 'text-blue-400'}`}>
                          +{cat.avgImpact}
                        </td>
                        <td className="p-3 text-right font-mono text-gray-300 text-xs">{cat.eventCount}</td>
                        <td className="p-3 text-right font-mono text-violet-400 text-xs">{cat.avgDuration}d</td>
                        <td className="p-3 text-cyan-400 text-xs">{cat.bestPerformingSegment}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 bg-gray-800 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${cat.reliability >= 80 ? 'bg-emerald-500' : cat.reliability >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${cat.reliability}%` }}
                              />
                            </div>
                            <span className="font-mono text-xs">{cat.reliability}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
