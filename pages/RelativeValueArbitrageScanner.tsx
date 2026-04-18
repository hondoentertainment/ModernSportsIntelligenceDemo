import React, { useState } from 'react';
import {
  GitCompare, TrendingUp, TrendingDown, DollarSign, AlertTriangle,
  ArrowLeftRight, History, Target, BarChart3, Activity
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import {
  getRelativeValuePairs, getDislocations, getArbitrageOpportunities,
  getRelativeHistory, getActivePairCount, getActiveDislocations,
  getOpenArbitrageCount, getCumulativePnL
} from '../lib/relativeValueArbitrageService.ts';

const TABS = [
  { id: 'dislocations', label: 'Active Dislocations', icon: <AlertTriangle className="w-4 h-4" /> },
  { id: 'pairs', label: 'Pair Analysis', icon: <GitCompare className="w-4 h-4" /> },
  { id: 'queue', label: 'Arbitrage Queue', icon: <ArrowLeftRight className="w-4 h-4" /> },
  { id: 'history', label: 'History', icon: <History className="w-4 h-4" /> },
] as const;

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

export default function RelativeValueArbitrageScanner() {
  const [activeTab, setActiveTab] = useState<string>('dislocations');
  const [selectedPair, setSelectedPair] = useState<string | null>(null);

  const pairs = getRelativeValuePairs();
  const dislocations = getDislocations();
  const arbOpps = getArbitrageOpportunities();
  const history = getRelativeHistory();

  const stats = [
    { label: 'Tracked Pairs', value: getActivePairCount(), icon: <GitCompare className="w-5 h-5" />, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Active Dislocations', value: getActiveDislocations(), icon: <AlertTriangle className="w-5 h-5" />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Open Arbitrages', value: getOpenArbitrageCount(), icon: <ArrowLeftRight className="w-5 h-5" />, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Cumulative P&L', value: `$${getCumulativePnL().toLocaleString()}`, icon: <DollarSign className="w-5 h-5" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  const selectedPairData = selectedPair ? pairs.find(p => p.id === selectedPair) : null;

  const dislocationChart = dislocations.map(d => ({
    pair: d.pairLabel,
    zScore: Math.abs(d.zScore),
    confidence: d.confidence,
    magnitude: d.magnitude,
  }));

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20">
            <GitCompare className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Relative Value Arbitrage Scanner</h1>
            <p className="text-sm text-gray-400">Identify relative value dislocations between comparable cards</p>
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
                activeTab === tab.id ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}>{tab.icon}{tab.label}</button>
          ))}
        </div>

        {activeTab === 'dislocations' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Dislocation Z-Scores and Confidence</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dislocationChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="pair" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="zScore" name="Z-Score" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="confidence" name="Convergence Prob %" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dislocations.map(d => (
                <div key={d.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-white">{d.pairLabel}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      Math.abs(d.zScore) >= 3 ? 'bg-red-500/20 text-red-400' :
                      Math.abs(d.zScore) >= 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>Z: {d.zScore > 0 ? '+' : ''}{d.zScore}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{d.catalyst}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div><span className="text-gray-500">Direction</span><div className="text-cyan-400 font-mono text-xs">{d.direction}</div></div>
                    <div><span className="text-gray-500">Convergence</span><div className="text-emerald-400 font-mono">{d.confidence}%</div></div>
                    <div><span className="text-gray-500">Expected By</span><div className="text-gray-300 font-mono">{d.expectedConvergence}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'pairs' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Pair Spread Ratios vs Historical Mean</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pairs.slice(0, 10).map(p => ({
                  pair: `${p.cardA.player.split(' ').pop()} / ${p.cardB.player.split(' ').pop()}`,
                  current: p.currentRatio,
                  historical: p.historicalRatio,
                  dislocation: p.dislocationScore,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="pair" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="current" name="Current Ratio" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="historical" name="Historical Ratio" fill="#374151" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {selectedPairData && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Spread History: {selectedPairData.cardA.player} vs {selectedPairData.cardB.player}</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={selectedPairData.spreadHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="ratio" name="Price Ratio" stroke="#8b5cf6" strokeWidth={2} />
                    <Line type="monotone" dataKey="mean" name="Historical Mean" stroke="#6b7280" strokeWidth={1} strokeDasharray="5 5" />
                    <Legend />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800"><h3 className="text-sm font-semibold text-gray-300">All Tracked Pairs</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-800">
                    <th className="text-left p-3 text-gray-500 font-medium">Card A</th>
                    <th className="text-left p-3 text-gray-500 font-medium">Card B</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Current Ratio</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Hist. Ratio</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Z-Score</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Dislocation</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Correlation</th>
                    <th className="text-center p-3 text-gray-500 font-medium">Select</th>
                  </tr></thead>
                  <tbody>
                    {pairs.map(p => (
                      <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="p-3"><div className="text-white text-xs">{p.cardA.player}</div><div className="text-gray-500 text-xs">${p.cardA.price.toLocaleString()}</div></td>
                        <td className="p-3"><div className="text-white text-xs">{p.cardB.player}</div><div className="text-gray-500 text-xs">${p.cardB.price.toLocaleString()}</div></td>
                        <td className="p-3 text-right font-mono text-violet-400">{p.currentRatio.toFixed(2)}</td>
                        <td className="p-3 text-right font-mono text-gray-400">{p.historicalRatio.toFixed(2)}</td>
                        <td className="p-3 text-right font-mono"><span className={p.zScore > 0 ? 'text-red-400' : 'text-emerald-400'}>{p.zScore > 0 ? '+' : ''}{p.zScore}</span></td>
                        <td className="p-3 text-right font-mono text-amber-400">{p.dislocationScore}</td>
                        <td className="p-3 text-right font-mono text-cyan-400">{p.pairCorrelation}</td>
                        <td className="p-3 text-center">
                          <button onClick={() => setSelectedPair(p.id)} className="text-xs px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-gray-300">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Arbitrage Expected P&L</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={arbOpps} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis dataKey="pairLabel" type="category" width={130} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} formatter={(v: number) => `$${v.toLocaleString()}`} />
                  <Bar dataKey="expectedPnL" name="Expected P&L" radius={[0, 4, 4, 0]}>
                    {arbOpps.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {arbOpps.map(a => (
                <div key={a.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-white">{a.pairLabel}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      a.status === 'open' ? 'bg-emerald-500/20 text-emerald-400' :
                      a.status === 'monitoring' ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>{a.status}</span>
                  </div>
                  <div className="space-y-1 text-xs mb-3">
                    <div className="flex justify-between"><span className="text-gray-500">Long</span><span className="text-emerald-400">{a.longCard}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Short</span><span className="text-red-400">{a.shortCard}</span></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div><span className="text-gray-500">Exp. P&L</span><div className="font-mono text-emerald-400">${a.expectedPnL.toLocaleString()}</div></div>
                    <div><span className="text-gray-500">Max Risk</span><div className="font-mono text-red-400">${a.maxRisk.toLocaleString()}</div></div>
                    <div><span className="text-gray-500">R:R</span><div className="font-mono text-violet-400">{a.rewardRisk}x</div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Cumulative P&L</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} formatter={(v: number) => `$${v.toLocaleString()}`} />
                    <Area type="monotone" dataKey="cumPnL" name="Cumulative P&L" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
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
                    <Line type="monotone" dataKey="avgReturn" name="Avg Return %" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="hitRate" name="Hit Rate %" stroke="#f59e0b" strokeWidth={2} />
                    <Line type="monotone" dataKey="dislocationsFound" name="Dislocations" stroke="#8b5cf6" strokeWidth={2} />
                    <Legend />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800"><h3 className="text-sm font-semibold text-gray-300">Performance History</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-800">
                    <th className="text-left p-3 text-gray-500 font-medium">Month</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Pairs</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Dislocations</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Trades</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Avg Return</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Hit Rate</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Cum. P&L</th>
                  </tr></thead>
                  <tbody>
                    {history.map(h => (
                      <tr key={h.month} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="p-3 text-gray-300">{h.month}</td>
                        <td className="p-3 text-right font-mono text-gray-300">{h.pairsTracked}</td>
                        <td className="p-3 text-right font-mono text-amber-400">{h.dislocationsFound}</td>
                        <td className="p-3 text-right font-mono text-cyan-400">{h.tradesExecuted}</td>
                        <td className="p-3 text-right font-mono text-emerald-400">{h.avgReturn}%</td>
                        <td className="p-3 text-right font-mono text-violet-400">{h.hitRate}%</td>
                        <td className="p-3 text-right font-mono text-white">${h.cumPnL.toLocaleString()}</td>
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
