import React, { useState } from 'react';
import {
  Gauge, Activity, Signal, TrendingUp, TrendingDown, Clock,
  AlertTriangle, ArrowUpRight, ArrowDownRight, Ban, Zap, Target
} from 'lucide-react';
import {
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell
} from 'recharts';
import {
  getMomentumEvents, getHalfLifeResults, getDecayProfiles,
  getTimingSignals, getMomentumSummary
} from '../lib/momentumHalfLifeService.ts';

const TABS = [
  { id: 'events', label: 'Events', icon: <Zap className="w-4 h-4" /> },
  { id: 'halflives', label: 'Half-Lives', icon: <Clock className="w-4 h-4" /> },
  { id: 'profiles', label: 'Profiles', icon: <Activity className="w-4 h-4" /> },
  { id: 'signals', label: 'Signals', icon: <Signal className="w-4 h-4" /> },
] as const;

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6', '#a855f7', '#0ea5e9', '#22c55e', '#eab308'];

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-400',
  decayed: 'bg-gray-500/20 text-gray-400',
  permanent: 'bg-violet-500/20 text-violet-400',
};

const SIGNAL_STYLES: Record<string, string> = {
  entry: 'bg-emerald-500/20 text-emerald-400',
  exit: 'bg-red-500/20 text-red-400',
  avoid: 'bg-amber-500/20 text-amber-400',
};

const SIGNAL_STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-400',
  expired: 'bg-gray-500/20 text-gray-400',
  pending: 'bg-blue-500/20 text-blue-400',
};

const RISK_STYLES: Record<string, string> = {
  high: 'bg-red-500/20 text-red-400',
  medium: 'bg-amber-500/20 text-amber-400',
  low: 'bg-emerald-500/20 text-emerald-400',
};

const SHAPE_LABELS: Record<string, string> = {
  'fast-exponential': 'Fast Exp.',
  'slow-exponential': 'Slow Exp.',
  'linear': 'Linear',
  'step-function': 'Step Fn.',
  'permanent': 'Permanent',
};

export default function MomentumHalfLifeCalculator() {
  const [activeTab, setActiveTab] = useState<string>('events');

  const events = getMomentumEvents();
  const halfLifeResults = getHalfLifeResults();
  const profiles = getDecayProfiles();
  const signals = getTimingSignals();
  const summary = getMomentumSummary();

  const stats = [
    { label: 'Active Events', value: summary.activeEvents, icon: <Zap className="w-5 h-5" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Avg Half-Life', value: `${summary.avgHalfLife}d`, icon: <Clock className="w-5 h-5" />, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Active Signals', value: summary.activeSignals, icon: <Signal className="w-5 h-5" />, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Best Signal Return', value: `+${summary.bestSignalReturn}%`, icon: <TrendingUp className="w-5 h-5" />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  const impactChart = events.map(e => ({
    name: e.eventName.length > 18 ? e.eventName.substring(0, 18) + '...' : e.eventName,
    initial: Math.abs(e.initialImpact),
    residual: Math.abs(e.currentResidual),
  }));

  const halfLifeChart = halfLifeResults.map(r => ({
    name: r.eventType,
    avg: r.avgHalfLife,
    min: r.minHalfLife,
    max: r.maxHalfLife,
    median: r.medianHalfLife,
  }));

  const radarData = profiles.map(p => ({
    profile: p.profileName,
    impact: Math.min(p.avgInitialImpact, 100),
    halfLife: Math.min(p.avgHalfLife / 3.65, 100),
    risk: p.riskLevel === 'high' ? 90 : p.riskLevel === 'medium' ? 55 : 20,
    events: p.typicalEvents.length * 33,
    tradability: p.riskLevel === 'low' ? 85 : p.riskLevel === 'medium' ? 65 : 40,
  }));

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-500/20">
            <Gauge className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Momentum Half-Life Calculator</h1>
            <p className="text-sm text-gray-400">Model how price momentum from market events decays over time</p>
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
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}>{tab.icon}{tab.label}</button>
          ))}
        </div>

        {/* Tab 1: Events */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Initial Impact vs Current Residual</h3>
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={impactChart} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={160} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="initial" name="Initial Impact %" fill="#6b7280" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="residual" name="Current Residual %" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map(e => (
                <div key={e.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-white truncate pr-2">{e.eventName}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_STYLES[e.status]}`}>{e.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{e.category} &middot; {e.eventDate}</p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500">Initial Impact</span>
                      <div className={`font-mono font-medium ${e.initialImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{e.initialImpact > 0 ? '+' : ''}{e.initialImpact}%</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Current Residual</span>
                      <div className={`font-mono font-medium ${e.currentResidual >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>{e.currentResidual > 0 ? '+' : ''}{e.currentResidual}%</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Half-Life</span>
                      <div className="font-mono text-violet-400">{e.halfLife}d</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Affected Cards</span>
                      <div className="font-mono text-gray-300">{e.affectedCards}</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Decay Progress</span>
                      <span className="font-mono">{Math.round((1 - Math.abs(e.currentResidual) / Math.abs(e.initialImpact)) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-violet-500" style={{ width: `${Math.round((1 - Math.abs(e.currentResidual) / Math.abs(e.initialImpact)) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Half-Lives */}
        {activeTab === 'halflives' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Average Half-Life by Event Type</h3>
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={halfLifeChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-25} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} label={{ value: 'Days', angle: -90, position: 'insideLeft', fill: '#6b7280' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="avg" name="Avg Half-Life" radius={[4, 4, 0, 0]}>
                    {halfLifeChart.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {halfLifeResults.map((r, i) => (
                <div key={r.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <h4 className="text-sm font-semibold text-white">{r.eventType}</h4>
                    </div>
                    <span className="text-xs text-gray-500 uppercase">{r.category}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-xs mt-3">
                    <div>
                      <span className="text-gray-500">Avg</span>
                      <div className="font-mono text-violet-400 font-medium">{r.avgHalfLife}d</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Median</span>
                      <div className="font-mono text-cyan-400">{r.medianHalfLife}d</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Range</span>
                      <div className="font-mono text-gray-300">{r.minHalfLife}-{r.maxHalfLife}d</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Samples</span>
                      <div className="font-mono text-gray-300">{r.sampleSize}</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Reliability</span>
                      <span className="font-mono">{Math.round(r.reliability * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${r.reliability >= 0.85 ? 'bg-emerald-500' : r.reliability >= 0.75 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${r.reliability * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Profiles */}
        {activeTab === 'profiles' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Decay Profile Characteristics</h3>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="profile" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <PolarRadiusAxis tick={{ fill: '#6b7280', fontSize: 9 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Radar name="Impact" dataKey="impact" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} />
                  <Radar name="Half-Life Scale" dataKey="halfLife" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                  <Radar name="Risk" dataKey="risk" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profiles.map(p => (
                <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-white">{p.profileName}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${RISK_STYLES[p.riskLevel]}`}>{p.riskLevel} risk</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                    <div>
                      <span className="text-gray-500">Shape</span>
                      <div className="font-mono text-violet-400">{SHAPE_LABELS[p.decayShape]}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Avg Impact</span>
                      <div className="font-mono text-emerald-400">+{p.avgInitialImpact}%</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Half-Life</span>
                      <div className="font-mono text-cyan-400">{p.avgHalfLife}d</div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <span className="text-xs text-gray-500">Typical Events</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {p.typicalEvents.map((ev, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-gray-800 rounded text-xs text-gray-400">{ev}</span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-2.5">
                    <span className="text-xs text-gray-500">Trading Implication</span>
                    <p className="text-xs text-gray-300 mt-1 leading-relaxed">{p.tradingImplication}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Signals */}
        {activeTab === 'signals' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <h3 className="text-sm font-semibold text-gray-300">Active Timing Signals</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left p-3 text-gray-500 font-medium">Event</th>
                      <th className="text-center p-3 text-gray-500 font-medium">Signal</th>
                      <th className="text-left p-3 text-gray-500 font-medium">Trigger Condition</th>
                      <th className="text-right p-3 text-gray-500 font-medium">Exp. Return</th>
                      <th className="text-right p-3 text-gray-500 font-medium">Horizon</th>
                      <th className="text-right p-3 text-gray-500 font-medium">Confidence</th>
                      <th className="text-center p-3 text-gray-500 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {signals.map(s => (
                      <tr key={s.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="p-3">
                          <div className="font-medium text-white text-xs">{s.eventName}</div>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${SIGNAL_STYLES[s.signalType]}`}>
                            {s.signalType === 'entry' && <ArrowUpRight className="w-3 h-3" />}
                            {s.signalType === 'exit' && <ArrowDownRight className="w-3 h-3" />}
                            {s.signalType === 'avoid' && <Ban className="w-3 h-3" />}
                            {s.signalType}
                          </span>
                        </td>
                        <td className="p-3 text-gray-400 text-xs max-w-[240px]">{s.triggerCondition}</td>
                        <td className="p-3 text-right">
                          <span className={`font-mono text-xs font-medium ${s.expectedReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {s.expectedReturn > 0 ? '+' : ''}{s.expectedReturn}%
                          </span>
                        </td>
                        <td className="p-3 text-right text-gray-300 text-xs">{s.timeHorizon}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-14 bg-gray-800 rounded-full h-1.5">
                              <div className={`h-1.5 rounded-full ${s.confidence >= 85 ? 'bg-emerald-500' : s.confidence >= 70 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${s.confidence}%` }} />
                            </div>
                            <span className="font-mono text-xs text-gray-400">{s.confidence}%</span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SIGNAL_STATUS_STYLES[s.status]}`}>{s.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['entry', 'exit', 'avoid'] as const).map(type => {
                const typeSignals = signals.filter(s => s.signalType === type);
                const activeCount = typeSignals.filter(s => s.status === 'active').length;
                const avgReturn = typeSignals.length > 0
                  ? Math.round((typeSignals.reduce((sum, s) => sum + s.expectedReturn, 0) / typeSignals.length) * 10) / 10
                  : 0;
                return (
                  <div key={type} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${SIGNAL_STYLES[type]}`}>
                        {type === 'entry' && <ArrowUpRight className="w-3 h-3" />}
                        {type === 'exit' && <ArrowDownRight className="w-3 h-3" />}
                        {type === 'avoid' && <Ban className="w-3 h-3" />}
                        {type.charAt(0).toUpperCase() + type.slice(1)} Signals
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Total</span>
                        <div className="font-mono text-white text-lg font-bold">{typeSignals.length}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Active</span>
                        <div className="font-mono text-emerald-400 text-lg font-bold">{activeCount}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Avg Return</span>
                        <div className={`font-mono text-lg font-bold ${avgReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{avgReturn > 0 ? '+' : ''}{avgReturn}%</div>
                      </div>
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
