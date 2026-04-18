import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
  Target, TrendingUp, TrendingDown, AlertTriangle, ArrowDown,
  ArrowUp, Activity, Clock, BarChart3, Crosshair
} from 'lucide-react';
import {
  getReversionCandidates, getDeviationScores, getReversionHistory,
  getReversionAlerts, getTopCandidates
} from '../lib/meanReversionService.ts';

const tabs = ['Active Candidates', 'Deviation Scores', 'Reversion History'] as const;
type Tab = typeof tabs[number];

export default function MeanReversionRadar() {
  const [activeTab, setActiveTab] = useState<Tab>('Active Candidates');
  const candidates = getReversionCandidates();
  const deviationScores = getDeviationScores();
  const history = getReversionHistory();
  const alerts = getReversionAlerts();
  const topCandidates = getTopCandidates(5);

  const aboveMean = candidates.filter(c => c.direction === 'above-mean');
  const belowMean = candidates.filter(c => c.direction === 'below-mean');
  const avgDeviation = Math.round(candidates.reduce((s, c) => s + Math.abs(c.deviationPercent), 0) / candidates.length * 10) / 10;
  const avgSuccessRate = Math.round(history.reduce((s, h) => s + h.successRate, 0) / history.length * 10) / 10;

  const stats = [
    { label: 'Active Candidates', value: candidates.length.toString(), icon: Target, color: '#3b82f6' },
    { label: 'Above Mean', value: aboveMean.length.toString(), icon: ArrowUp, color: '#ef4444' },
    { label: 'Below Mean', value: belowMean.length.toString(), icon: ArrowDown, color: '#22c55e' },
    { label: 'Avg Success Rate', value: `${avgSuccessRate}%`, icon: Activity, color: '#f59e0b' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/20">
            <Crosshair size={24} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Mean Reversion Radar</h1>
            <p className="text-sm text-gray-400">Identify cards far from historical mean for reversion opportunities</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">{s.label}</span>
                <s.icon size={16} style={{ color: s.color }} />
              </div>
              <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 border-b border-gray-800 pb-2">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Active Candidates' && (
          <div className="space-y-6">
            {alerts.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-400" /> Active Alerts
                </h3>
                <div className="space-y-2">
                  {alerts.map(alert => (
                    <div key={alert.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                      alert.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                      alert.severity === 'high' ? 'bg-amber-500/10 border-amber-500/30' :
                      'bg-blue-500/10 border-blue-500/30'
                    }`}>
                      <div>
                        <span className="text-sm font-medium">{alert.player}</span>
                        <span className="text-xs text-gray-400 ml-2">{alert.cardName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold ${alert.direction === 'above-mean' ? 'text-red-400' : 'text-emerald-400'}`}>
                          {alert.deviationPercent >= 0 ? '+' : ''}{alert.deviationPercent}%
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                          alert.severity === 'high' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>{alert.severity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Deviation Scores by Candidate</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={candidates.sort((a, b) => b.deviationScore - a.deviationScore)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" />
                  <YAxis type="category" dataKey="player" stroke="#9ca3af" tick={{ fontSize: 10 }} width={120} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="deviationScore" name="Deviation Score">
                    {candidates.sort((a, b) => b.deviationScore - a.deviationScore).map((c, i) => (
                      <Cell key={i} fill={c.direction === 'above-mean' ? '#ef4444' : '#22c55e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">All Candidates</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-2 px-3 text-gray-400">Player</th>
                      <th className="text-left py-2 px-3 text-gray-400">Card</th>
                      <th className="text-right py-2 px-3 text-gray-400">Price</th>
                      <th className="text-right py-2 px-3 text-gray-400">Mean</th>
                      <th className="text-right py-2 px-3 text-gray-400">Deviation</th>
                      <th className="text-right py-2 px-3 text-gray-400">Z-Score</th>
                      <th className="text-right py-2 px-3 text-gray-400">Est. Days</th>
                      <th className="text-right py-2 px-3 text-gray-400">Expected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map(c => (
                      <tr key={c.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="py-2 px-3 font-medium">{c.player}</td>
                        <td className="py-2 px-3 text-gray-400 text-xs">{c.cardName}</td>
                        <td className="py-2 px-3 text-right">${c.currentPrice.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right text-gray-400">${c.historicalMean.toLocaleString()}</td>
                        <td className={`py-2 px-3 text-right font-medium ${c.direction === 'above-mean' ? 'text-red-400' : 'text-emerald-400'}`}>
                          {c.deviationPercent >= 0 ? '+' : ''}{c.deviationPercent}%
                        </td>
                        <td className="py-2 px-3 text-right text-amber-400">{c.zScore.toFixed(2)}</td>
                        <td className="py-2 px-3 text-right text-gray-400">{c.expectedReversionDays}d</td>
                        <td className={`py-2 px-3 text-right font-medium ${c.expectedReturnPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {c.expectedReturnPercent >= 0 ? '+' : ''}{c.expectedReturnPercent}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Deviation Scores' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Deviation by Category</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={deviationScores}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="category" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="avgDeviation" name="Avg Deviation %" fill="#3b82f6" />
                  <Bar dataKey="maxDeviation" name="Max Deviation %" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Top 5 Radar</h3>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={topCandidates.map(c => ({
                  player: c.player,
                  deviation: Math.abs(c.deviationPercent),
                  zScore: Math.abs(c.zScore) * 20,
                  confidence: c.confidence * 100,
                  score: c.deviationScore,
                }))}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="player" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis stroke="#9ca3af" />
                  <Radar name="Deviation Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Radar name="Confidence" dataKey="confidence" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {deviationScores.map((ds, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <h4 className="text-sm font-semibold mb-3">{ds.category}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Candidates</span>
                      <span className="font-medium">{ds.candidateCount}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Avg Deviation</span>
                      <span className="text-amber-400 font-medium">{ds.avgDeviation}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Max Deviation</span>
                      <span className="text-red-400 font-medium">{ds.maxDeviation}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Avg Z-Score</span>
                      <span className="text-blue-400 font-medium">{ds.avgZScore.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Avg Reversion Days</span>
                      <span className="text-gray-300 font-medium">{ds.avgReversionDays}d</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Reversion History' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Signal Success Rate Over Time</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="successRate" name="Success Rate %" stroke="#22c55e" strokeWidth={2} />
                  <Line type="monotone" dataKey="avgReturn" name="Avg Return %" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Signals Generated vs Successful</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="signalsGenerated" name="Signals Generated" fill="#374151" />
                  <Bar dataKey="signalsSuccessful" name="Signals Successful" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Average Days to Revert</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="avgDaysToRevert" name="Avg Days to Revert" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
