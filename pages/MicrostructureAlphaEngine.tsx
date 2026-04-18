import React, { useState } from 'react';
import {
  Activity, Zap, Target, TrendingUp, TrendingDown, Clock, AlertTriangle,
  BarChart3, LineChart as LineChartIcon, Radar as RadarIcon, History
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell
} from 'recharts';
import {
  getMicrostructureSignals, getAlphaOpportunities, getSignalDecays,
  getAlphaHistory, getActiveSignalCount, getAvgAlphaEstimate,
  getTotalOpportunities, getAvgSharpe
} from '../lib/microstructureAlphaService.ts';

const TABS = [
  { id: 'signals', label: 'Alpha Signals', icon: <Zap className="w-4 h-4" /> },
  { id: 'decay', label: 'Signal Decay', icon: <TrendingDown className="w-4 h-4" /> },
  { id: 'opportunities', label: 'Opportunity Map', icon: <Target className="w-4 h-4" /> },
  { id: 'history', label: 'History', icon: <History className="w-4 h-4" /> },
] as const;

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

const URGENCY_STYLES: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-400',
  decaying: 'bg-yellow-500/20 text-yellow-400',
  expired: 'bg-red-500/20 text-red-400',
  fresh: 'bg-emerald-500/20 text-emerald-400',
  'near-expiry': 'bg-orange-500/20 text-orange-400',
};

export default function MicrostructureAlphaEngine() {
  const [activeTab, setActiveTab] = useState<string>('signals');

  const signals = getMicrostructureSignals();
  const opportunities = getAlphaOpportunities();
  const decays = getSignalDecays();
  const history = getAlphaHistory();

  const stats = [
    { label: 'Active Signals', value: getActiveSignalCount(), icon: <Activity className="w-5 h-5" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Avg Alpha', value: `${getAvgAlphaEstimate()}%`, icon: <Zap className="w-5 h-5" />, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Opportunities', value: getTotalOpportunities(), icon: <Target className="w-5 h-5" />, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Avg Sharpe', value: getAvgSharpe(), icon: <TrendingUp className="w-5 h-5" />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  const categoryData = ['bid-pattern', 'listing-flow', 'order-imbalance', 'timing-anomaly', 'spread-dynamics'].map(cat => {
    const catSignals = signals.filter(s => s.category === cat);
    return {
      category: cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      count: catSignals.length,
      avgAlpha: catSignals.length ? Math.round(catSignals.reduce((s, sig) => s + sig.alphaEstimate, 0) / catSignals.length * 100) / 100 : 0,
      avgWinRate: catSignals.length ? Math.round(catSignals.reduce((s, sig) => s + sig.winRate, 0) / catSignals.length * 10) / 10 : 0,
    };
  });

  const radarData = categoryData.map(c => ({
    subject: c.category,
    alpha: c.avgAlpha,
    winRate: c.avgWinRate / 10,
    signals: c.count * 2,
  }));

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-500/20">
            <Zap className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Microstructure Alpha Engine</h1>
            <p className="text-sm text-gray-400">Extract alpha from listing and bidding microstructure patterns</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${stat.bg}`}>
                  <span className={stat.color}>{stat.icon}</span>
                </div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Alpha Signals Tab */}
        {activeTab === 'signals' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Alpha by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="category" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Bar dataKey="avgAlpha" name="Avg Alpha %" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avgWinRate" name="Win Rate %" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Signal Profile Radar</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                    <PolarRadiusAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
                    <Radar name="Alpha" dataKey="alpha" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                    <Radar name="Win Rate" dataKey="winRate" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <h3 className="text-sm font-semibold text-gray-300">Active Microstructure Signals</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left p-3 text-gray-500 font-medium">Signal</th>
                      <th className="text-left p-3 text-gray-500 font-medium">Category</th>
                      <th className="text-right p-3 text-gray-500 font-medium">Alpha</th>
                      <th className="text-right p-3 text-gray-500 font-medium">Sharpe</th>
                      <th className="text-right p-3 text-gray-500 font-medium">Win Rate</th>
                      <th className="text-right p-3 text-gray-500 font-medium">Half-Life</th>
                      <th className="text-center p-3 text-gray-500 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {signals.map(sig => (
                      <tr key={sig.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="p-3">
                          <div className="font-medium text-white">{sig.signalName}</div>
                          <div className="text-xs text-gray-500 mt-0.5 max-w-xs truncate">{sig.description}</div>
                        </td>
                        <td className="p-3 text-gray-400 capitalize">{sig.category.replace(/-/g, ' ')}</td>
                        <td className="p-3 text-right font-mono text-violet-400">{sig.alphaEstimate}%</td>
                        <td className="p-3 text-right font-mono text-cyan-400">{sig.sharpeRatio}</td>
                        <td className="p-3 text-right font-mono text-emerald-400">{sig.winRate}%</td>
                        <td className="p-3 text-right font-mono text-gray-300">{sig.decayHalfLife}d</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[sig.status]}`}>
                            {sig.status}
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

        {/* Signal Decay Tab */}
        {activeTab === 'decay' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Signal Decay Curves (Top 6)</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="day" type="number" domain={[0, 60]} tick={{ fill: '#9ca3af', fontSize: 11 }} label={{ value: 'Days', position: 'bottom', fill: '#6b7280' }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} label={{ value: 'Alpha %', angle: -90, position: 'insideLeft', fill: '#6b7280' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  {decays.slice(0, 6).map((d, i) => (
                    <Line
                      key={d.signalId}
                      data={d.decayCurve}
                      dataKey="alpha"
                      name={d.signalName.length > 25 ? d.signalName.substring(0, 25) + '...' : d.signalName}
                      stroke={COLORS[i]}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {decays.slice(0, 9).map(d => (
                <div key={d.signalId} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-white truncate mr-2">{d.signalName}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[d.status]}`}>
                      {d.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <span className="text-gray-500">Initial Alpha</span>
                      <div className="font-mono text-violet-400">{d.initialAlpha}%</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Current Alpha</span>
                      <div className="font-mono text-cyan-400">{d.currentAlpha}%</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Half-Life</span>
                      <div className="font-mono text-gray-300">{d.halfLife} days</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Decay Rate</span>
                      <div className="font-mono text-amber-400">{d.decayRate}%</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
                      style={{ width: `${Math.max(5, 100 - d.decayRate)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Est. expiry: {d.estimatedExpiry}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Opportunity Map Tab */}
        {activeTab === 'opportunities' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Opportunity Expected Returns</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={opportunities} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis dataKey="player" type="category" width={120} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="expectedReturn" name="Expected Return %" radius={[0, 4, 4, 0]}>
                    {opportunities.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {opportunities.map(opp => (
                <div key={opp.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-semibold text-white">{opp.cardName}</h4>
                      <p className="text-xs text-gray-500">{opp.player} - {opp.sport}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${URGENCY_STYLES[opp.urgency]}`}>
                      {opp.urgency}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500">Current</span>
                      <div className="font-mono text-white">${opp.currentPrice.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Target</span>
                      <div className="font-mono text-emerald-400">${opp.targetPrice.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Return</span>
                      <div className="font-mono text-violet-400">+{opp.expectedReturn}%</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{opp.timeHorizon}</span>
                    <span className="flex items-center gap-1"><Target className="w-3 h-3" />{opp.confidence}% conf</span>
                    <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{opp.signalName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Cumulative Alpha Return</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="cumReturn" name="Cumulative Return %" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Monthly Metrics</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="avgSharpe" name="Avg Sharpe" stroke="#06b6d4" strokeWidth={2} />
                    <Line type="monotone" dataKey="winRate" name="Win Rate %" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="signalsActive" name="Signals Active" stroke="#f59e0b" strokeWidth={2} />
                    <Legend />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <h3 className="text-sm font-semibold text-gray-300">Monthly Alpha History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left p-3 text-gray-500 font-medium">Month</th>
                      <th className="text-right p-3 text-gray-500 font-medium">Total Alpha</th>
                      <th className="text-right p-3 text-gray-500 font-medium">Signals</th>
                      <th className="text-right p-3 text-gray-500 font-medium">Avg Sharpe</th>
                      <th className="text-right p-3 text-gray-500 font-medium">Win Rate</th>
                      <th className="text-right p-3 text-gray-500 font-medium">Cum. Return</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(h => (
                      <tr key={h.month} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="p-3 text-gray-300">{h.month}</td>
                        <td className="p-3 text-right font-mono text-violet-400">{h.totalAlpha}%</td>
                        <td className="p-3 text-right font-mono text-gray-300">{h.signalsActive}</td>
                        <td className="p-3 text-right font-mono text-cyan-400">{h.avgSharpe}</td>
                        <td className="p-3 text-right font-mono text-emerald-400">{h.winRate}%</td>
                        <td className="p-3 text-right font-mono text-amber-400">{h.cumReturn}%</td>
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
