import React, { useState } from 'react';
import {
  Activity, Clock, TrendingDown, Heart, AlertTriangle, BarChart3,
  History, Skull, Zap, Target, RefreshCw
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import {
  getAlphaSignals, getDecayProfiles, getSignalLifespans,
  getDecayHistory, getHealthySignalCount, getDecayingSignalCount,
  getAvgHealthScore, getRetiredCount
} from '../lib/alphaDecayMonitorService.ts';

const TABS = [
  { id: 'health', label: 'Signal Health', icon: <Heart className="w-4 h-4" /> },
  { id: 'curves', label: 'Decay Curves', icon: <TrendingDown className="w-4 h-4" /> },
  { id: 'lifespan', label: 'Lifespan Estimates', icon: <Clock className="w-4 h-4" /> },
  { id: 'retired', label: 'Retired Signals', icon: <Skull className="w-4 h-4" /> },
] as const;

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6', '#a855f7', '#0ea5e9', '#22c55e', '#eab308'];

const STATUS_STYLES: Record<string, string> = {
  healthy: 'bg-emerald-500/20 text-emerald-400',
  decaying: 'bg-amber-500/20 text-amber-400',
  critical: 'bg-red-500/20 text-red-400',
  retired: 'bg-gray-500/20 text-gray-400',
};

const REC_STYLES: Record<string, string> = {
  'increase-size': 'bg-emerald-500/20 text-emerald-400',
  'maintain': 'bg-blue-500/20 text-blue-400',
  'reduce-size': 'bg-amber-500/20 text-amber-400',
  'retire': 'bg-red-500/20 text-red-400',
};

export default function AlphaDecayMonitor() {
  const [activeTab, setActiveTab] = useState<string>('health');

  const signals = getAlphaSignals();
  const decayProfiles = getDecayProfiles();
  const lifespans = getSignalLifespans();
  const history = getDecayHistory();

  const stats = [
    { label: 'Healthy Signals', value: getHealthySignalCount(), icon: <Heart className="w-5 h-5" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Decaying/Critical', value: getDecayingSignalCount(), icon: <TrendingDown className="w-5 h-5" />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Avg Health', value: `${getAvgHealthScore()}%`, icon: <Activity className="w-5 h-5" />, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Retired', value: getRetiredCount(), icon: <Skull className="w-5 h-5" />, color: 'text-gray-400', bg: 'bg-gray-500/10' },
  ];

  const healthChart = signals.filter(s => s.status !== 'retired').map(s => ({
    name: s.signalName.length > 22 ? s.signalName.substring(0, 22) + '...' : s.signalName,
    health: s.healthScore,
    currentAlpha: s.currentAlpha,
    winRate: s.winRate,
  }));

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20">
            <TrendingDown className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Alpha Decay Monitor</h1>
            <p className="text-sm text-gray-400">Track how trading signals lose effectiveness over time</p>
          </div>
        </div>

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

        <div className="flex gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}>{tab.icon}{tab.label}</button>
          ))}
        </div>

        {activeTab === 'health' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Signal Health Scores</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={healthChart} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={180} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="health" name="Health Score" radius={[0, 4, 4, 0]}>
                    {healthChart.map((entry, i) => (
                      <Cell key={i} fill={entry.health >= 75 ? '#10b981' : entry.health >= 50 ? '#f59e0b' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Alpha: Initial vs Current</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={signals.filter(s => s.status !== 'retired').map(s => ({
                    name: s.signalName.substring(0, 15),
                    initial: s.initialAlpha,
                    current: s.currentAlpha,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 9 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Bar dataKey="initial" name="Initial Alpha %" fill="#6b7280" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="current" name="Current Alpha %" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Avg Health Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="avgHealth" name="Avg Health %" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="activeSignals" name="Active Signals" stroke="#8b5cf6" strokeWidth={2} />
                    <Legend />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800"><h3 className="text-sm font-semibold text-gray-300">All Signals</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-800">
                    <th className="text-left p-3 text-gray-500 font-medium">Signal</th>
                    <th className="text-left p-3 text-gray-500 font-medium">Category</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Health</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Alpha</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Win Rate</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Trades</th>
                    <th className="text-center p-3 text-gray-500 font-medium">Status</th>
                  </tr></thead>
                  <tbody>
                    {signals.map(s => (
                      <tr key={s.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="p-3"><div className="font-medium text-white text-xs">{s.signalName}</div></td>
                        <td className="p-3 text-gray-400 capitalize text-xs">{s.category.replace(/-/g, ' ')}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 bg-gray-800 rounded-full h-1.5">
                              <div className={`h-1.5 rounded-full ${s.healthScore >= 75 ? 'bg-emerald-500' : s.healthScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${s.healthScore}%` }} />
                            </div>
                            <span className="font-mono text-xs">{s.healthScore}</span>
                          </div>
                        </td>
                        <td className="p-3 text-right font-mono text-violet-400 text-xs">{s.currentAlpha}%</td>
                        <td className="p-3 text-right font-mono text-cyan-400 text-xs">{s.winRate}%</td>
                        <td className="p-3 text-right font-mono text-gray-300 text-xs">{s.tradeCount}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[s.status]}`}>{s.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'curves' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Alpha Decay Curves (Active Signals)</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="day" type="number" domain={[0, 180]} tick={{ fill: '#9ca3af', fontSize: 11 }} label={{ value: 'Days Since Discovery', position: 'bottom', fill: '#6b7280' }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} label={{ value: 'Alpha %', angle: -90, position: 'insideLeft', fill: '#6b7280' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  {decayProfiles.filter((_, i) => signals[i].status !== 'retired').slice(0, 6).map((d, i) => (
                    <Line key={d.signalId} data={d.curve} dataKey="alpha"
                      name={d.signalName.length > 25 ? d.signalName.substring(0, 25) + '...' : d.signalName}
                      stroke={COLORS[i]} strokeWidth={2} dot={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {decayProfiles.filter((_, i) => signals[i].status !== 'retired').slice(0, 6).map((d, i) => (
                <div key={d.signalId} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-white mb-2 truncate">{d.signalName}</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div><span className="text-gray-500">Decay Type</span><div className="font-mono text-violet-400 capitalize">{d.decayType}</div></div>
                    <div><span className="text-gray-500">Half-Life</span><div className="font-mono text-cyan-400">{d.halfLife} days</div></div>
                    <div><span className="text-gray-500">Decay Rate</span><div className="font-mono text-amber-400">{d.decayRate}%</div></div>
                    <div><span className="text-gray-500">R2 Fit</span><div className="font-mono text-emerald-400">{d.r2Fit}</div></div>
                  </div>
                  <ResponsiveContainer width="100%" height={100}>
                    <AreaChart data={d.curve}>
                      <Area type="monotone" dataKey="alpha" stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'lifespan' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Signal Lifespan Overview</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={lifespans.filter(l => l.recommendation !== 'retire').map(l => ({
                  name: l.signalName.substring(0, 20),
                  age: l.currentAge,
                  remaining: l.remainingLife,
                  lifespan: l.estimatedLifespan,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 9 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} label={{ value: 'Days', angle: -90, position: 'insideLeft', fill: '#6b7280' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="age" name="Current Age" stackId="a" fill="#6b7280" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="remaining" name="Remaining Life" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800"><h3 className="text-sm font-semibold text-gray-300">Lifespan Detail</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-800">
                    <th className="text-left p-3 text-gray-500 font-medium">Signal</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Age (d)</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Remaining (d)</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Life Used</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Total P&L</th>
                    <th className="text-center p-3 text-gray-500 font-medium">Recommendation</th>
                  </tr></thead>
                  <tbody>
                    {lifespans.map(l => (
                      <tr key={l.signalId} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="p-3 text-white text-xs">{l.signalName}</td>
                        <td className="p-3 text-right font-mono text-gray-300 text-xs">{l.currentAge}</td>
                        <td className="p-3 text-right font-mono text-cyan-400 text-xs">{l.remainingLife}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 bg-gray-800 rounded-full h-1.5">
                              <div className={`h-1.5 rounded-full ${l.lifespanPct < 50 ? 'bg-emerald-500' : l.lifespanPct < 75 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, l.lifespanPct)}%` }} />
                            </div>
                            <span className="font-mono text-xs text-gray-400">{l.lifespanPct}%</span>
                          </div>
                        </td>
                        <td className="p-3 text-right font-mono text-emerald-400 text-xs">${l.totalPnL.toLocaleString()}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${REC_STYLES[l.recommendation]}`}>{l.recommendation.replace(/-/g, ' ')}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'retired' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Signal Lifecycle History</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="activeSignals" name="Active Signals" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="retiredSignals" name="Retired Signals" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {signals.filter(s => s.status === 'retired' || s.status === 'critical').map(s => {
                const profile = decayProfiles.find(d => d.signalId === s.id);
                return (
                  <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-white">{s.signalName}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[s.status]}`}>{s.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{s.description}</p>
                    <div className="grid grid-cols-4 gap-2 text-xs mb-3">
                      <div><span className="text-gray-500">Peak Alpha</span><div className="font-mono text-violet-400">{s.peakAlpha}%</div></div>
                      <div><span className="text-gray-500">Current</span><div className="font-mono text-red-400">{s.currentAlpha}%</div></div>
                      <div><span className="text-gray-500">Win Rate</span><div className="font-mono text-amber-400">{s.winRate}%</div></div>
                      <div><span className="text-gray-500">Trades</span><div className="font-mono text-gray-300">{s.tradeCount}</div></div>
                    </div>
                    {profile && (
                      <div className="text-xs text-gray-500">
                        Decay Type: <span className="text-gray-300 capitalize">{profile.decayType}</span> | Predicted Zero: <span className="text-gray-300">{profile.predictedZeroDate}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Total Alpha Generation Over Time</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="totalAlpha" name="Total Alpha %" stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" dataKey="avgLifespan" name="Avg Lifespan (days)" stroke="#06b6d4" strokeWidth={2} />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
