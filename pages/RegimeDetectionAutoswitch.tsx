import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import {
  Activity, TrendingUp, TrendingDown, Shield, Zap, RefreshCw,
  ArrowRightLeft, Clock, BarChart3, GitBranch
} from 'lucide-react';
import {
  getRegimeStates, getCurrentRegime, getRegimeTransitions,
  getStrategySwitches, getRegimeHistory
} from '../lib/regimeDetectionService.ts';

const tabs = ['Current Regime', 'Transition Matrix', 'Strategy Map', 'History'] as const;
type Tab = typeof tabs[number];

const regimeColors: Record<string, string> = {
  bull: '#22c55e',
  bear: '#ef4444',
  'range-bound': '#f59e0b',
  'high-volatility': '#a855f7',
  recovery: '#06b6d4',
};

export default function RegimeDetectionAutoswitch() {
  const [activeTab, setActiveTab] = useState<Tab>('Current Regime');
  const regimeStates = getRegimeStates();
  const current = getCurrentRegime();
  const transitions = getRegimeTransitions();
  const switches = getStrategySwitches();
  const history = getRegimeHistory();

  const regimeTypes = ['bull', 'bear', 'range-bound', 'high-volatility', 'recovery'];

  const matrixData = regimeTypes.map(from => {
    const row: Record<string, string | number> = { from };
    regimeTypes.forEach(to => {
      const t = transitions.find(tr => tr.fromRegime === from && tr.toRegime === to);
      row[to] = t ? t.probability : 0;
    });
    return row;
  });

  const stats = [
    { label: 'Current Regime', value: current.label, icon: Activity, color: current.color },
    { label: 'Confidence', value: `${(current.confidence * 100).toFixed(0)}%`, icon: Shield, color: '#3b82f6' },
    { label: 'Duration', value: `${current.durationDays}d`, icon: Clock, color: '#f59e0b' },
    { label: 'Strategy Switches', value: switches.length.toString(), icon: ArrowRightLeft, color: '#a855f7' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20">
            <GitBranch size={24} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Regime Detection Autoswitch</h1>
            <p className="text-sm text-gray-400">Auto-detect market regime changes and switch strategies dynamically</p>
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

        {activeTab === 'Current Regime' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: current.color }} />
                <h2 className="text-xl font-bold">{current.label}</h2>
                <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: current.color + '22', color: current.color }}>
                  {(current.confidence * 100).toFixed(0)}% Confidence
                </span>
              </div>
              <p className="text-gray-400 mb-4">{current.description}</p>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-xs text-gray-400">Avg Return</div>
                  <div className={`text-lg font-bold ${current.avgReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{current.avgReturn >= 0 ? '+' : ''}{current.avgReturn}%</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-xs text-gray-400">Volatility</div>
                  <div className="text-lg font-bold text-amber-400">{current.volatility}%</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-xs text-gray-400">Duration</div>
                  <div className="text-lg font-bold text-blue-400">{current.durationDays} days</div>
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-xs text-gray-400 mb-1">Recommended Strategy</div>
                <div className="text-sm font-medium text-emerald-400">{current.recommendedStrategy}</div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">All Regime States</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {regimeStates.filter(r => r.id !== current.id).map(regime => (
                  <div key={regime.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: regime.color }} />
                      <span className="font-medium">{regime.label}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{regime.description}</p>
                    <div className="flex gap-4 text-xs">
                      <span className={regime.avgReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}>Return: {regime.avgReturn >= 0 ? '+' : ''}{regime.avgReturn}%</span>
                      <span className="text-amber-400">Vol: {regime.volatility}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Transition Matrix' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Regime Transition Probabilities</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left py-2 px-3 text-gray-400">From / To</th>
                      {regimeTypes.map(r => (
                        <th key={r} className="py-2 px-3 text-center">
                          <span className="inline-flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: regimeColors[r] }} />
                            <span className="text-xs capitalize">{r}</span>
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrixData.map((row, i) => (
                      <tr key={i} className="border-t border-gray-800">
                        <td className="py-2 px-3 font-medium capitalize">{row.from as string}</td>
                        {regimeTypes.map(to => {
                          const val = row[to] as number;
                          const intensity = Math.floor(val * 255);
                          return (
                            <td key={to} className="py-2 px-3 text-center">
                              <span
                                className="inline-block px-2 py-1 rounded text-xs font-mono"
                                style={{
                                  backgroundColor: `rgba(34, 197, 94, ${val * 0.4})`,
                                  color: val > 0.25 ? '#fff' : '#9ca3af',
                                }}
                              >
                                {(val * 100).toFixed(0)}%
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Transition Probability Distribution</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={matrixData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="from" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    formatter={(value: number) => `${(value * 100).toFixed(0)}%`}
                  />
                  <Legend />
                  {regimeTypes.map(r => (
                    <Bar key={r} dataKey={r} stackId="a" fill={regimeColors[r]} name={r} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'Strategy Map' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Strategy Switch Timeline</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={switches} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" tickFormatter={(v: number) => `${v >= 0 ? '+' : ''}${v}%`} />
                  <YAxis type="category" dataKey="date" stroke="#9ca3af" tick={{ fontSize: 10 }} width={90} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    formatter={(value: number) => `${value >= 0 ? '+' : ''}${value}%`}
                  />
                  <Bar dataKey="portfolioImpact" name="Portfolio Impact">
                    {switches.map((s, i) => (
                      <Cell key={i} fill={s.portfolioImpact >= 0 ? '#22c55e' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Switch History</h3>
              <div className="space-y-3">
                {switches.map(s => (
                  <div key={s.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">{s.date}</span>
                        <ArrowRightLeft size={14} className="text-gray-500" />
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: regimeColors[s.fromRegime] + '22', color: regimeColors[s.fromRegime] }}>
                            {s.fromRegime}
                          </span>
                          <span className="text-gray-500">to</span>
                          <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: regimeColors[s.toRegime] + '22', color: regimeColors[s.toRegime] }}>
                            {s.toRegime}
                          </span>
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${s.portfolioImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {s.portfolioImpact >= 0 ? '+' : ''}{s.portfolioImpact}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mb-1">
                      <span className="text-gray-300">{s.fromStrategy}</span> → <span className="text-emerald-400">{s.toStrategy}</span>
                    </div>
                    <div className="text-xs text-gray-500">{s.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'History' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Regime History - Returns</h3>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Area type="monotone" dataKey="strategyReturn" name="Strategy Return" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} />
                  <Area type="monotone" dataKey="marketReturn" name="Market Return" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Volatility and Confidence</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="volatility" name="Volatility" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="confidence" name="Confidence" stroke="#a855f7" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Regime Timeline</h3>
              <div className="flex flex-wrap gap-1">
                {history.map((h, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: regimeColors[h.regime] }}
                      title={`${h.month}: ${h.regime} (${(h.confidence * 100).toFixed(0)}%)`}
                    />
                    <span className="text-[8px] text-gray-500">{h.month.slice(5)}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-4">
                {Object.entries(regimeColors).map(([regime, color]) => (
                  <div key={regime} className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
                    <span className="text-xs text-gray-400 capitalize">{regime}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
