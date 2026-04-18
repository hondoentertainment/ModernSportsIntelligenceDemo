import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import {
  Link2, TrendingUp, TrendingDown, Activity, Target,
  ArrowLeftRight, BarChart3, AlertCircle, Zap
} from 'lucide-react';
import {
  getCointegrationPairs, getActivePairs, getPairStatistics,
  getSpreadHistory, getTradeSignals, getPairById
} from '../lib/cointegrationPairService.ts';

const tabs = ['Active Pairs', 'Pair Statistics', 'Spread Charts', 'Trade Signals'] as const;
type Tab = typeof tabs[number];

export default function CointegrationPairFinder() {
  const [activeTab, setActiveTab] = useState<Tab>('Active Pairs');
  const [selectedPair, setSelectedPair] = useState('cp-1');
  const pairs = getCointegrationPairs();
  const activePairs = getActivePairs();
  const signals = getTradeSignals();
  const spreadHistory = getSpreadHistory(selectedPair);

  const avgCoScore = Math.round(pairs.reduce((s, p) => s + p.cointegrationScore, 0) / pairs.length);
  const avgHalfLife = Math.round(pairs.reduce((s, p) => s + p.halfLife, 0) / pairs.length);

  const stats = [
    { label: 'Total Pairs', value: pairs.length.toString(), icon: Link2, color: '#3b82f6' },
    { label: 'Active Pairs', value: activePairs.length.toString(), icon: Activity, color: '#22c55e' },
    { label: 'Avg Score', value: avgCoScore.toString(), icon: Target, color: '#f59e0b' },
    { label: 'Trade Signals', value: signals.length.toString(), icon: Zap, color: '#a855f7' },
  ];

  const currentPair = getPairById(selectedPair);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/20">
            <Link2 size={24} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Cointegration Pair Finder</h1>
            <p className="text-sm text-gray-400">Find cointegrated card pairs for statistical arbitrage pair trading</p>
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

        {activeTab === 'Active Pairs' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Cointegration Scores</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={pairs.sort((a, b) => b.cointegrationScore - a.cointegrationScore)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="id" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca3af" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelFormatter={(label: string) => {
                      const p = pairs.find(pp => pp.id === label);
                      return p ? `${p.playerA} / ${p.playerB}` : label;
                    }}
                  />
                  <Bar dataKey="cointegrationScore" name="Score">
                    {pairs.sort((a, b) => b.cointegrationScore - a.cointegrationScore).map((p, i) => (
                      <Cell key={i} fill={p.status === 'active' ? '#22c55e' : p.status === 'monitoring' ? '#f59e0b' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Pair Details</h3>
              <div className="space-y-3">
                {pairs.map(pair => (
                  <div key={pair.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-blue-500/30 transition-colors cursor-pointer"
                    onClick={() => { setSelectedPair(pair.id); setActiveTab('Spread Charts'); }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          pair.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                          pair.status === 'monitoring' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>{pair.status}</span>
                        <span className="text-sm font-medium">{pair.playerA}</span>
                        <ArrowLeftRight size={14} className="text-gray-500" />
                        <span className="text-sm font-medium">{pair.playerB}</span>
                      </div>
                      <span className="text-sm font-bold text-blue-400">{pair.cointegrationScore}</span>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-400">
                      <span>p-value: <span className="text-emerald-400">{pair.pValue.toFixed(3)}</span></span>
                      <span>Half-life: <span className="text-blue-400">{pair.halfLife}d</span></span>
                      <span>Correlation: <span className="text-amber-400">{pair.correlation.toFixed(2)}</span></span>
                      <span>Z-Score: <span className={`font-medium ${Math.abs(pair.spreadZScore) > 2 ? 'text-red-400' : 'text-gray-300'}`}>{pair.spreadZScore.toFixed(2)}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Pair Statistics' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Half-Life vs Correlation</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={pairs}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="id" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelFormatter={(label: string) => {
                      const p = pairs.find(pp => pp.id === label);
                      return p ? `${p.playerA} / ${p.playerB}` : label;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="halfLife" name="Half-Life (days)" fill="#3b82f6" />
                  <Bar dataKey="correlation" name="Correlation" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">p-Value Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pairs.sort((a, b) => a.pValue - b.pValue)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="id" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelFormatter={(label: string) => {
                      const p = pairs.find(pp => pp.id === label);
                      return p ? `${p.playerA} / ${p.playerB}` : label;
                    }}
                  />
                  <Bar dataKey="pValue" name="p-Value">
                    {pairs.sort((a, b) => a.pValue - b.pValue).map((p, i) => (
                      <Cell key={i} fill={p.pValue < 0.01 ? '#22c55e' : p.pValue < 0.03 ? '#f59e0b' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Spread Z-Scores</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pairs}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="id" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelFormatter={(label: string) => {
                      const p = pairs.find(pp => pp.id === label);
                      return p ? `${p.playerA} / ${p.playerB}` : label;
                    }}
                  />
                  <Bar dataKey="spreadZScore" name="Spread Z-Score">
                    {pairs.map((p, i) => (
                      <Cell key={i} fill={p.spreadZScore > 0 ? '#ef4444' : '#22c55e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'Spread Charts' && (
          <div className="space-y-6">
            <div className="flex gap-2 flex-wrap">
              {pairs.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPair(p.id)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    selectedPair === p.id
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                  }`}
                >
                  {p.playerA} / {p.playerB}
                </button>
              ))}
            </div>

            {currentPair && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{currentPair.playerA} vs {currentPair.playerB}</h3>
                  <span className={`text-sm font-bold ${Math.abs(currentPair.spreadZScore) > 2 ? 'text-red-400' : 'text-blue-400'}`}>
                    Z-Score: {currentPair.spreadZScore.toFixed(2)}
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={spreadHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 9 }} />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="spread" name="Spread" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="upperBand" name="Upper Band" stroke="#ef4444" strokeDasharray="5 5" dot={false} />
                    <Line type="monotone" dataKey="lowerBand" name="Lower Band" stroke="#22c55e" strokeDasharray="5 5" dot={false} />
                    <Line type="monotone" dataKey="meanSpread" name="Mean" stroke="#f59e0b" strokeDasharray="3 3" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Trade Signals' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Signal Expected Returns</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={signals}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="expectedReturn" name="Expected Return %">
                    {signals.map((s, i) => (
                      <Cell key={i} fill={s.signal === 'long-spread' ? '#22c55e' : s.signal === 'short-spread' ? '#ef4444' : '#f59e0b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Active Signals</h3>
              <div className="space-y-3">
                {signals.map(signal => {
                  const pair = getPairById(signal.pairId);
                  return (
                    <div key={signal.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                            signal.signal === 'long-spread' ? 'bg-emerald-500/20 text-emerald-400' :
                            signal.signal === 'short-spread' ? 'bg-red-500/20 text-red-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>{signal.signal.replace('-', ' ')}</span>
                          <span className="text-sm">{pair?.playerA} / {pair?.playerB}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-emerald-400">+{signal.expectedReturn}%</div>
                          <div className="text-xs text-gray-400">{(signal.confidence * 100).toFixed(0)}% conf</div>
                        </div>
                      </div>
                      <div className="flex gap-4 text-xs text-gray-400 mb-1">
                        <span>{signal.date}</span>
                        <span>Z-Score: <span className="text-blue-400">{signal.zScoreAtSignal.toFixed(2)}</span></span>
                        <span>Spread: <span className="text-gray-300">${signal.spreadAtSignal}</span></span>
                      </div>
                      <p className="text-xs text-gray-500">{signal.reason}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
