import React, { useState } from 'react';
import {
  Calendar, TrendingUp, TrendingDown, BarChart3, Activity,
  Clock, Star, AlertCircle, Gift, Flame, ChevronRight
} from 'lucide-react';
import {
  BarChart, Bar, AreaChart, Area, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, ReferenceLine
} from 'recharts';
import {
  getCalendarEffects, getDayOfWeekEffects, getMonthlyEffects,
  getHolidayImpacts, getCalendarSummary
} from '../lib/calendarEffectService.ts';

const TABS = [
  { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'daily', label: 'Day-of-Week', icon: <Calendar className="w-4 h-4" /> },
  { id: 'monthly', label: 'Monthly', icon: <Activity className="w-4 h-4" /> },
  { id: 'holidays', label: 'Holidays', icon: <Star className="w-4 h-4" /> },
] as const;

const DIRECTION_STYLES: Record<string, string> = {
  positive: 'bg-emerald-500/20 text-emerald-400',
  negative: 'bg-red-500/20 text-red-400',
  neutral: 'bg-gray-500/20 text-gray-400',
};

const TYPE_STYLES: Record<string, string> = {
  'day-of-week': 'bg-blue-500/20 text-blue-400',
  monthly: 'bg-violet-500/20 text-violet-400',
  holiday: 'bg-amber-500/20 text-amber-400',
  event: 'bg-cyan-500/20 text-cyan-400',
};

function getSignificanceLabel(sig: number): { label: string; style: string } {
  if (sig <= 0.01) return { label: 'Very High', style: 'bg-emerald-500/20 text-emerald-400' };
  if (sig <= 0.03) return { label: 'High', style: 'bg-blue-500/20 text-blue-400' };
  if (sig <= 0.05) return { label: 'Moderate', style: 'bg-amber-500/20 text-amber-400' };
  return { label: 'Low', style: 'bg-gray-500/20 text-gray-400' };
}

export default function CalendarEffectQuantifier() {
  const [activeTab, setActiveTab] = useState<string>('overview');

  const effects = getCalendarEffects();
  const dailyEffects = getDayOfWeekEffects();
  const monthlyEffects = getMonthlyEffects();
  const holidays = getHolidayImpacts();
  const summary = getCalendarSummary();

  const stats = [
    { label: 'Strongest Effect', value: summary.strongestEffect.length > 20 ? summary.strongestEffect.substring(0, 20) + '...' : summary.strongestEffect, icon: <Flame className="w-5 h-5" />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Avg Significance', value: `p=${summary.avgSignificance}`, icon: <Activity className="w-5 h-5" />, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Effects Tracked', value: summary.totalEffectsTracked, icon: <BarChart3 className="w-5 h-5" />, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Next Event', value: summary.nextHolidayEvent.length > 18 ? summary.nextHolidayEvent.substring(0, 18) + '...' : summary.nextHolidayEvent, icon: <Clock className="w-5 h-5" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  const effectChartData = [...effects]
    .sort((a, b) => Math.abs(b.avgImpact) - Math.abs(a.avgImpact))
    .map(e => ({
      name: e.effectName.length > 22 ? e.effectName.substring(0, 22) + '...' : e.effectName,
      impact: e.avgImpact,
      fullName: e.effectName,
    }));

  const dailyChartData = dailyEffects.map(d => ({
    day: d.day.substring(0, 3),
    avgReturn: d.avgReturn,
    volume: d.avgVolume,
    fullDay: d.day,
  }));

  const monthlyChartData = monthlyEffects.map(m => ({
    month: m.month.substring(0, 3),
    avgReturn: m.avgReturn,
    volumeIndex: m.volumeIndex,
    winRate: m.winRate,
    seasonalStrength: m.seasonalStrength,
  }));

  const holidayChartData = holidays
    .sort((a, b) => Math.abs(b.avgPriceMove) - Math.abs(a.avgPriceMove))
    .map(h => ({
      name: h.holiday.length > 16 ? h.holiday.substring(0, 16) + '...' : h.holiday,
      priceMove: h.avgPriceMove,
      volumeSpike: h.volumeSpike,
      winRate: h.historicalWinRate,
      fullName: h.holiday,
    }));

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/20">
            <Calendar className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Calendar Effect Quantifier</h1>
            <p className="text-sm text-gray-400">Measure day-of-week, monthly, holiday, and event-driven pricing effects</p>
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
              <div className="text-lg font-bold text-white truncate">{stat.value}</div>
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

        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Calendar Effects by Price Impact</h3>
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={effectChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={200} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <ReferenceLine x={0} stroke="#374151" />
                  <Bar dataKey="impact" name="Avg Impact %" radius={[0, 4, 4, 0]}>
                    {effectChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.impact >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {effects.map(e => {
                const sig = getSignificanceLabel(e.significance);
                return (
                  <div key={e.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white text-sm">{e.effectName}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${TYPE_STYLES[e.type]}`}>{e.type}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${DIRECTION_STYLES[e.direction]}`}>{e.direction}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mb-3 leading-relaxed">{e.description}</p>
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase">Impact</div>
                        <div className={`text-sm font-bold ${e.avgImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {e.avgImpact >= 0 ? '+' : ''}{e.avgImpact}%
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase">Significance</div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${sig.style}`}>{sig.label} (p={e.significance})</span>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase">Sample</div>
                        <div className="text-sm font-mono text-gray-300">{e.sampleSize.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab: Day-of-Week */}
        {activeTab === 'daily' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Average Daily Returns</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <ReferenceLine y={0} stroke="#374151" />
                  <Bar dataKey="avgReturn" name="Avg Return %" radius={[4, 4, 0, 0]}>
                    {dailyChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.avgReturn >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800"><h3 className="text-sm font-semibold text-gray-300">Day-of-Week Statistics</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-800">
                    <th className="text-left p-3 text-gray-500 font-medium">Day</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Avg Return</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Avg Volume</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Listings</th>
                    <th className="text-left p-3 text-gray-500 font-medium">Best Category</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Volatility</th>
                  </tr></thead>
                  <tbody>
                    {dailyEffects.map(d => (
                      <tr key={d.day} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="p-3 font-medium text-white">{d.day}</td>
                        <td className="p-3 text-right">
                          <span className={`font-mono text-xs font-bold ${d.avgReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {d.avgReturn >= 0 ? '+' : ''}{d.avgReturn}%
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono text-gray-300 text-xs">{d.avgVolume.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono text-gray-300 text-xs">{d.listingCount.toLocaleString()}</td>
                        <td className="p-3 text-violet-400 text-xs">{d.bestCategory}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-12 bg-gray-800 rounded-full h-1.5">
                              <div className={`h-1.5 rounded-full ${d.volatility >= 4 ? 'bg-red-500' : d.volatility >= 3 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                style={{ width: `${(d.volatility / 5) * 100}%` }} />
                            </div>
                            <span className="font-mono text-xs text-gray-400">{d.volatility}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dailyEffects
                .filter(d => d.avgReturn >= 2 || d.avgReturn <= -1)
                .map(d => (
                  <div key={d.day} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white text-sm">{d.day}</h4>
                      <span className={`text-sm font-bold ${d.avgReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {d.avgReturn >= 0 ? '+' : ''}{d.avgReturn}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {d.avgReturn >= 2
                        ? `Strong buying day driven by ${d.bestCategory} activity. Volume: ${d.avgVolume.toLocaleString()}`
                        : `Weak day with higher listing supply (${d.listingCount.toLocaleString()} listings). Consider buying opportunities.`}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tab: Monthly */}
        {activeTab === 'monthly' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Monthly Returns & Volume Index</h3>
              <ResponsiveContainer width="100%" height={380}>
                <AreaChart data={monthlyChartData}>
                  <defs>
                    <linearGradient id="returnGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <ReferenceLine yAxisId="left" y={0} stroke="#374151" />
                  <Area yAxisId="left" type="monotone" dataKey="avgReturn" name="Avg Return %" stroke="#10b981" strokeWidth={2} fill="url(#returnGrad)" />
                  <Area yAxisId="right" type="monotone" dataKey="volumeIndex" name="Volume Index" stroke="#6366f1" strokeWidth={1.5} fill="url(#volumeGrad)" />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {monthlyEffects.map(m => (
                <div key={m.month} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-white text-sm">{m.month}</h4>
                    <span className={`text-sm font-bold ${m.avgReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {m.avgReturn >= 0 ? '+' : ''}{m.avgReturn}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase">Win Rate</div>
                      <div className="text-sm font-medium text-white">{m.winRate}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase">Seasonal Str.</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${m.seasonalStrength >= 70 ? 'bg-emerald-500' : m.seasonalStrength >= 40 ? 'bg-blue-500' : 'bg-gray-500'}`}
                            style={{ width: `${m.seasonalStrength}%` }} />
                        </div>
                        <span className="text-xs font-mono text-gray-400">{m.seasonalStrength}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] text-gray-500 flex justify-between">
                      <span>Best: <span className="text-emerald-400">{m.bestPerformer}</span></span>
                    </div>
                    <div className="text-[10px] text-gray-500 flex justify-between">
                      <span>Worst: <span className="text-red-400">{m.worstPerformer}</span></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Holidays */}
        {activeTab === 'holidays' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Holiday Price Impact Comparison</h3>
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={holidayChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 9 }} angle={-15} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="priceMove" name="Avg Price Move %" radius={[4, 4, 0, 0]}>
                    {holidayChartData.map((entry, i) => {
                      const colors = ['#10b981', '#8b5cf6', '#06b6d4', '#f59e0b', '#6366f1', '#ec4899', '#14b8a6', '#0ea5e9', '#a855f7', '#22c55e'];
                      return <Cell key={i} fill={colors[i % colors.length]} />;
                    })}
                  </Bar>
                  <Bar dataKey="volumeSpike" name="Volume Spike (x)" fill="#374151" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {holidays
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map(h => {
                  const isPast = new Date(h.date) < new Date(2026, 3, 18);
                  return (
                    <div key={h.id} className={`bg-gray-900 border rounded-xl p-5 ${isPast ? 'border-gray-800/50 opacity-75' : 'border-gray-800'}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isPast ? 'bg-gray-800' : 'bg-amber-500/10'}`}>
                            {isPast ? <Clock className="w-5 h-5 text-gray-500" /> : <Star className="w-5 h-5 text-amber-400" />}
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{h.holiday}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gray-500">{h.date}</span>
                              {isPast && <span className="px-1.5 py-0.5 bg-gray-700/50 text-gray-500 rounded text-[10px]">Past</span>}
                              {!isPast && <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px]">Upcoming</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-[10px] text-gray-500 uppercase">Price Move</div>
                            <div className="text-lg font-bold text-emerald-400">+{h.avgPriceMove}%</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-gray-500 uppercase">Vol. Spike</div>
                            <div className="text-lg font-bold text-violet-400">{h.volumeSpike}x</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-gray-500 uppercase">Win Rate</div>
                            <div className="text-lg font-bold text-cyan-400">{h.historicalWinRate}%</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mb-2 text-xs text-gray-500">
                        <span>Pre-event window: <span className="text-gray-300">{h.preEventDays} days</span></span>
                        <span>Post-event window: <span className="text-gray-300">{h.postEventDays} days</span></span>
                      </div>
                      <div className="flex items-start gap-2 bg-gray-800/40 rounded-lg p-3">
                        <ChevronRight className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-300 leading-relaxed">{h.bestStrategy}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
