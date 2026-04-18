import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import {
  Gauge, TrendingUp, Target, BarChart3, Award,
  ArrowUpRight, Activity, Layers
} from 'lucide-react';
import {
  getBenchmarkComparisons, getAlphaDecomposition, getRatioHistory,
  getCurrentIR, getTotalAlpha
} from '../lib/informationRatioService.ts';

const tabs = ['IR Dashboard', 'Benchmark Compare', 'Alpha Decomposition', 'History'] as const;
type Tab = typeof tabs[number];

export default function InformationRatioTracker() {
  const [activeTab, setActiveTab] = useState<Tab>('IR Dashboard');
  const benchmarks = getBenchmarkComparisons();
  const alphaDecomp = getAlphaDecomposition();
  const history = getRatioHistory();
  const currentIR = getCurrentIR();
  const totalAlpha = getTotalAlpha();

  const latestHistory = history[history.length - 1];

  const stats = [
    { label: 'Information Ratio', value: currentIR.ir.toFixed(2), icon: Gauge, color: '#22c55e' },
    { label: 'Total Alpha', value: `${totalAlpha.toFixed(1)}%`, icon: Award, color: '#3b82f6' },
    { label: 'Tracking Error', value: `${currentIR.trackingError}%`, icon: Activity, color: '#f59e0b' },
    { label: 'Excess Return', value: `${latestHistory.excessReturn}%`, icon: ArrowUpRight, color: '#a855f7' },
  ];

  const alphaColors = ['#22c55e', '#3b82f6', '#f59e0b', '#a855f7', '#06b6d4', '#ec4899'];

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20">
            <Gauge size={24} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Information Ratio Tracker</h1>
            <p className="text-sm text-gray-400">Risk-adjusted alpha measurement vs benchmark indices</p>
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
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'IR Dashboard' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Current Information Ratio</h3>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">{currentIR.period}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-emerald-400">{currentIR.ir.toFixed(2)}</div>
                  <div className="text-xs text-gray-400 mt-1">Information Ratio</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-400">{currentIR.alpha}%</div>
                  <div className="text-xs text-gray-400 mt-1">Alpha</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-amber-400">{currentIR.trackingError}%</div>
                  <div className="text-xs text-gray-400 mt-1">Tracking Error</div>
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-sm text-gray-300">{currentIR.interpretation}</p>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">IR Trend</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="ir" name="IR" stroke="#22c55e" strokeWidth={2} />
                  <Line type="monotone" dataKey="rollingIR3m" name="3M Rolling IR" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="rollingIR6m" name="6M Rolling IR" stroke="#a855f7" strokeWidth={1.5} strokeDasharray="3 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'Benchmark Compare' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">IR by Benchmark</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={benchmarks}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="benchmarkName" stroke="#9ca3af" tick={{ fontSize: 8 }} angle={-15} textAnchor="end" height={60} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="ir" name="Information Ratio">
                    {benchmarks.map((b, i) => (
                      <Cell key={i} fill={b.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Portfolio vs Benchmark Returns</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={benchmarks}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="benchmarkName" stroke="#9ca3af" tick={{ fontSize: 8 }} angle={-15} textAnchor="end" height={60} />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="portfolioReturn" name="Portfolio Return" fill="#22c55e" />
                  <Bar dataKey="benchmarkReturn" name="Benchmark Return" fill="#6b7280" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {benchmarks.map(b => (
                <div key={b.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: b.color }} />
                    <h4 className="text-sm font-semibold">{b.benchmarkName}</h4>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{b.benchmarkDescription}</p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between"><span className="text-gray-400">IR</span><span className="font-bold text-emerald-400">{b.ir.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Excess Return</span><span className="text-blue-400">{b.excessReturn}%</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Tracking Error</span><span className="text-amber-400">{b.trackingError}%</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Correlation</span><span className="text-gray-300">{b.correlation.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Beta</span><span className="text-gray-300">{b.beta.toFixed(2)}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Alpha Decomposition' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Alpha Sources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={alphaDecomp} dataKey="contribution" nameKey="source" cx="50%" cy="50%" outerRadius={110} label={({ name, value }: { name: string; value: number }) => `${name}: ${value}%`}>
                      {alphaDecomp.map((a, i) => (
                        <Cell key={i} fill={alphaColors[i % alphaColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {alphaDecomp.map((a, i) => (
                    <div key={a.source} className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: alphaColors[i % alphaColors.length] }} />
                          <span className="text-sm font-medium">{a.source}</span>
                        </div>
                        <span className="text-sm font-bold text-emerald-400">+{a.contribution}%</span>
                      </div>
                      <p className="text-xs text-gray-400">{a.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs ${a.trend === 'improving' ? 'text-emerald-400' : a.trend === 'declining' ? 'text-red-400' : 'text-gray-400'}`}>
                          {a.trend === 'improving' ? 'Improving' : a.trend === 'declining' ? 'Declining' : 'Stable'}
                        </span>
                        <span className="text-xs text-gray-500">({a.percentage.toFixed(1)}% of total)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Alpha Contribution by Source</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={alphaDecomp}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="source" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="contribution" name="Alpha Contribution %">
                    {alphaDecomp.map((a, i) => (
                      <Cell key={i} fill={alphaColors[i % alphaColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'History' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Portfolio vs Benchmark Returns Over Time</h3>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Area type="monotone" dataKey="portfolioReturn" name="Portfolio Return" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} />
                  <Area type="monotone" dataKey="benchmarkReturn" name="Benchmark Return" stroke="#6b7280" fill="#6b7280" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Excess Return and Alpha</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="excessReturn" name="Excess Return" stroke="#22c55e" strokeWidth={2} />
                  <Line type="monotone" dataKey="alpha" name="Alpha" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="trackingError" name="Tracking Error" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
