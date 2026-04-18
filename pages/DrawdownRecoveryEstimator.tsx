import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import {
  TrendingDown, TrendingUp, Clock, AlertTriangle, BarChart3,
  ArrowDown, ArrowUp, Activity, Shield, Target
} from 'lucide-react';
import {
  getDrawdownEvents, getActiveDrawdowns, getRecoveryEstimates,
  getDrawdownPaths, getRecoveryScenarios, getDrawdownStats
} from '../lib/drawdownRecoveryService.ts';

const tabs = ['Active Drawdowns', 'Recovery Forecast', 'Historical', 'Scenarios'] as const;
type Tab = typeof tabs[number];

const severityColors: Record<string, string> = {
  minor: '#22c55e',
  moderate: '#f59e0b',
  severe: '#ef4444',
  extreme: '#dc2626',
};

export default function DrawdownRecoveryEstimator() {
  const [activeTab, setActiveTab] = useState<Tab>('Active Drawdowns');
  const [selectedDrawdown, setSelectedDrawdown] = useState('dd-3');
  const allDrawdowns = getDrawdownEvents();
  const activeDrawdowns = getActiveDrawdowns();
  const ddStats = getDrawdownStats();
  const scenarios = getRecoveryScenarios();

  const selectedEstimates = getRecoveryEstimates(selectedDrawdown);
  const selectedPath = getDrawdownPaths(selectedDrawdown);
  const selectedDD = allDrawdowns.find(d => d.id === selectedDrawdown);

  const stats = [
    { label: 'Active Drawdowns', value: ddStats.activeDrawdowns.toString(), icon: AlertTriangle, color: '#ef4444' },
    { label: 'Avg Recovery Days', value: `${ddStats.avgRecoveryDays}d`, icon: Clock, color: '#3b82f6' },
    { label: 'Worst Drawdown', value: `${ddStats.worstDrawdown}%`, icon: ArrowDown, color: '#dc2626' },
    { label: 'Avg Drawdown', value: `${ddStats.avgDrawdown}%`, icon: Activity, color: '#f59e0b' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-500/20">
            <TrendingDown size={24} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Drawdown Recovery Estimator</h1>
            <p className="text-sm text-gray-400">Time-to-recovery forecasting after portfolio drawdowns</p>
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
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Active Drawdowns' && (
          <div className="space-y-6">
            {activeDrawdowns.map(dd => (
              <div key={dd.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={18} style={{ color: severityColors[dd.severity] }} />
                    <h3 className="text-lg font-semibold">{dd.name}</h3>
                    <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: severityColors[dd.severity] + '22', color: severityColors[dd.severity] }}>
                      {dd.severity}
                    </span>
                  </div>
                  <span className="text-xl font-bold text-red-400">{dd.drawdownPercent}%</span>
                </div>
                <p className="text-sm text-gray-400 mb-4">{dd.cause}</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="text-xs text-gray-400">Peak Value</div>
                    <div className="text-sm font-bold text-gray-200">${dd.peakValue.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="text-xs text-gray-400">Trough Value</div>
                    <div className="text-sm font-bold text-red-400">${dd.troughValue.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="text-xs text-gray-400">Current Value</div>
                    <div className="text-sm font-bold text-blue-400">${dd.currentValue.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="text-xs text-gray-400">Days to Trough</div>
                    <div className="text-sm font-bold text-amber-400">{dd.daysToTrough}d</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="text-xs text-gray-400">Recovery %</div>
                    <div className="text-sm font-bold text-emerald-400">{dd.recoveryPercent.toFixed(1)}%</div>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedDrawdown(dd.id); setActiveTab('Recovery Forecast'); }}
                  className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
                >
                  View Recovery Forecast
                </button>
              </div>
            ))}

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">All Drawdowns Overview</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={allDrawdowns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 8 }} angle={-20} textAnchor="end" height={80} />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="drawdownPercent" name="Drawdown %">
                    {allDrawdowns.map((dd, i) => (
                      <Cell key={i} fill={severityColors[dd.severity]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'Recovery Forecast' && (
          <div className="space-y-6">
            <div className="flex gap-2 flex-wrap">
              {activeDrawdowns.map(dd => (
                <button
                  key={dd.id}
                  onClick={() => setSelectedDrawdown(dd.id)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    selectedDrawdown === dd.id
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                  }`}
                >
                  {dd.name}
                </button>
              ))}
            </div>

            {selectedDD && (
              <>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Drawdown Path - {selectedDD.name}</h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={selectedPath}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} formatter={(value: number) => `$${value.toLocaleString()}`} />
                      <Legend />
                      <Line type="monotone" dataKey="value" name="Portfolio Value" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Recovery Scenarios</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedEstimates.map((est, i) => (
                      <div key={i} className={`bg-gray-800 rounded-lg p-4 border ${
                        est.scenario === 'Bull Case' ? 'border-emerald-500/30' :
                        est.scenario === 'Bear Case' ? 'border-red-500/30' : 'border-blue-500/30'
                      }`}>
                        <h4 className={`text-sm font-semibold mb-3 ${
                          est.scenario === 'Bull Case' ? 'text-emerald-400' :
                          est.scenario === 'Bear Case' ? 'text-red-400' : 'text-blue-400'
                        }`}>{est.scenario}</h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between"><span className="text-gray-400">Est. Days</span><span className="font-bold">{est.estimatedDays}d</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">Est. Date</span><span>{est.estimatedDate}</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">Probability</span><span className="text-amber-400">{(est.probability * 100).toFixed(0)}%</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">Required Return</span><span className="text-blue-400">{(est.requiredReturnRate * 100).toFixed(0)}%</span></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{est.assumptions}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'Historical' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Drawdown Severity vs Recovery Time</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={allDrawdowns.filter(d => !d.isActive)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 8 }} angle={-20} textAnchor="end" height={80} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="daysToTrough" name="Days to Trough" fill="#ef4444" />
                  <Bar dataKey="daysToRecovery" name="Days to Recovery" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Recovery Details</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-2 px-3 text-gray-400">Event</th>
                      <th className="text-center py-2 px-3 text-gray-400">Severity</th>
                      <th className="text-right py-2 px-3 text-gray-400">Drawdown</th>
                      <th className="text-right py-2 px-3 text-gray-400">Days Down</th>
                      <th className="text-right py-2 px-3 text-gray-400">Days Recovery</th>
                      <th className="text-center py-2 px-3 text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allDrawdowns.map(dd => (
                      <tr key={dd.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="py-2 px-3 font-medium text-xs">{dd.name}</td>
                        <td className="py-2 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: severityColors[dd.severity] + '22', color: severityColors[dd.severity] }}>
                            {dd.severity}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right text-red-400 font-medium">{dd.drawdownPercent}%</td>
                        <td className="py-2 px-3 text-right text-gray-300">{dd.daysToTrough}d</td>
                        <td className="py-2 px-3 text-right text-gray-300">{dd.daysToRecovery ? `${dd.daysToRecovery}d` : '--'}</td>
                        <td className="py-2 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-xs ${dd.isActive ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            {dd.isActive ? 'Active' : 'Recovered'}
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

        {activeTab === 'Scenarios' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Recovery Scenario Paths</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9ca3af" type="number" label={{ value: 'Days', position: 'insideBottom', offset: -5, style: { fill: '#9ca3af' } }} />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `${v}%`} label={{ value: 'Recovery %', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af' } }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  {scenarios.map((s, i) => (
                    <Line
                      key={s.id}
                      data={s.projectedPath}
                      type="monotone"
                      dataKey="recoveryPercent"
                      name={s.name}
                      stroke={i === 0 ? '#22c55e' : i === 1 ? '#3b82f6' : '#ef4444'}
                      strokeWidth={2}
                      dot
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {scenarios.map((s, i) => (
                <div key={s.id} className={`bg-gray-900 border rounded-xl p-5 ${
                  i === 0 ? 'border-emerald-500/30' : i === 1 ? 'border-blue-500/30' : 'border-red-500/30'
                }`}>
                  <h4 className={`text-lg font-semibold mb-2 ${
                    i === 0 ? 'text-emerald-400' : i === 1 ? 'text-blue-400' : 'text-red-400'
                  }`}>{s.name}</h4>
                  <p className="text-xs text-gray-400 mb-4">{s.description}</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-gray-400">Avg Recovery Days</span><span className="font-bold">{s.avgRecoveryDays || 'N/A'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Median Recovery Days</span><span>{s.medianRecoveryDays || 'N/A'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Full Recovery Rate</span><span className={s.recoveryRate > 0.7 ? 'text-emerald-400' : 'text-amber-400'}>{(s.recoveryRate * 100).toFixed(0)}%</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Historical Count</span><span>{s.historicalCount}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
