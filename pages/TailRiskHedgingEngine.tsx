import React, { useState } from 'react';
import {
  Shield, AlertTriangle, TrendingDown, DollarSign, Activity,
  BarChart3, Layers, History, ShieldCheck, Gauge
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
  getTailRiskMetrics, getHedgeStrategies, getProtectionLevels,
  getTailRiskHistory, getCurrentVaR, getCurrentCVaR,
  getTotalHedgeCost, getAvgProtection
} from '../lib/tailRiskHedgingService.ts';

const TABS = [
  { id: 'dashboard', label: 'Risk Dashboard', icon: <Gauge className="w-4 h-4" /> },
  { id: 'strategies', label: 'Hedge Strategies', icon: <Shield className="w-4 h-4" /> },
  { id: 'protection', label: 'Protection Analysis', icon: <ShieldCheck className="w-4 h-4" /> },
  { id: 'costbenefit', label: 'Cost/Benefit', icon: <DollarSign className="w-4 h-4" /> },
] as const;

const SEVERITY_COLORS: Record<string, string> = {
  mild: '#10b981', moderate: '#f59e0b', severe: '#ef4444', extreme: '#dc2626',
};

const STATUS_STYLES: Record<string, string> = {
  safe: 'bg-emerald-500/20 text-emerald-400',
  warning: 'bg-amber-500/20 text-amber-400',
  danger: 'bg-red-500/20 text-red-400',
};

export default function TailRiskHedgingEngine() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const metrics = getTailRiskMetrics();
  const strategies = getHedgeStrategies();
  const protection = getProtectionLevels();
  const history = getTailRiskHistory();

  const stats = [
    { label: 'Portfolio VaR (95%)', value: `${getCurrentVaR()}%`, icon: <TrendingDown className="w-5 h-5" />, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'CVaR (99%)', value: `${getCurrentCVaR()}%`, icon: <AlertTriangle className="w-5 h-5" />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Hedge Cost', value: `${getTotalHedgeCost().toFixed(1)}% p.a.`, icon: <DollarSign className="w-5 h-5" />, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Avg Protection', value: `${getAvgProtection()}%`, icon: <Shield className="w-5 h-5" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  const radarData = strategies.map(s => ({
    strategy: s.strategyName.length > 20 ? s.strategyName.substring(0, 20) + '...' : s.strategyName,
    protection: s.protectionLevel,
    effectiveness: s.effectiveness,
    riskReduction: s.riskReduction,
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/20">
            <Shield className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Tail Risk Hedging Engine</h1>
            <p className="text-sm text-gray-400">Protect against extreme downside events with tail risk strategies</p>
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
                activeTab === tab.id ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}>{tab.icon}{tab.label}</button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">VaR and CVaR Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="portfolioVar" name="VaR (95%)" stroke="#ef4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="portfolioCVaR" name="CVaR (99%)" stroke="#f59e0b" strokeWidth={2} />
                    <Line type="monotone" dataKey="maxDrawdown" name="Max Drawdown" stroke="#8b5cf6" strokeWidth={2} />
                    <Legend />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Tail Ratio Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} domain={[0, 1]} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="tailRatio" name="Tail Ratio" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.map(m => (
                <div key={m.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-white">{m.metricName}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[m.status]}`}>{m.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{m.description}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div><span className="text-gray-500">Current</span><div className="font-mono text-white">{m.currentValue}</div></div>
                    <div><span className="text-gray-500">Threshold</span><div className="font-mono text-amber-400">{m.threshold}</div></div>
                    <div><span className="text-gray-500">Hist. Worst</span><div className="font-mono text-red-400">{m.historicalWorst}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'strategies' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Strategy Effectiveness Radar</h3>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="strategy" tick={{ fill: '#9ca3af', fontSize: 9 }} />
                  <PolarRadiusAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <Radar name="Protection %" dataKey="protection" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                  <Radar name="Effectiveness %" dataKey="effectiveness" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                  <Radar name="Risk Reduction %" dataKey="riskReduction" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {strategies.map(s => (
                <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-white">{s.strategyName}</h4>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 capitalize">{s.type.replace(/-/g, ' ')}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{s.description}</p>
                  <div className="grid grid-cols-4 gap-2 text-xs mb-3">
                    <div><span className="text-gray-500">Protection</span><div className="font-mono text-emerald-400">{s.protectionLevel}%</div></div>
                    <div><span className="text-gray-500">Cost</span><div className="font-mono text-amber-400">{s.annualCost}% p.a.</div></div>
                    <div><span className="text-gray-500">Effectiveness</span><div className="font-mono text-cyan-400">{s.effectiveness}%</div></div>
                    <div><span className="text-gray-500">Allocation</span><div className="font-mono text-violet-400">{s.currentAllocation}%</div></div>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-red-500 to-emerald-500" style={{ width: `${s.effectiveness}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'protection' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Scenario Protection Analysis</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={protection}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="scenario" tick={{ fill: '#9ca3af', fontSize: 9 }} angle={-15} textAnchor="end" height={80} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="unhedgedLoss" name="Unhedged Loss %" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="hedgedLoss" name="Hedged Loss %" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="protectionGained" name="Protection %" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800"><h3 className="text-sm font-semibold text-gray-300">Scenario Detail</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-800">
                    <th className="text-left p-3 text-gray-500 font-medium">Scenario</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Probability</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Unhedged</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Hedged</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Protected</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Cost</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Net Benefit</th>
                    <th className="text-center p-3 text-gray-500 font-medium">Severity</th>
                  </tr></thead>
                  <tbody>
                    {protection.map((p, i) => (
                      <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="p-3 text-white text-xs">{p.scenario}</td>
                        <td className="p-3 text-right font-mono text-gray-300">{p.probability}%</td>
                        <td className="p-3 text-right font-mono text-red-400">{p.unhedgedLoss}%</td>
                        <td className="p-3 text-right font-mono text-amber-400">{p.hedgedLoss}%</td>
                        <td className="p-3 text-right font-mono text-emerald-400">+{p.protectionGained}%</td>
                        <td className="p-3 text-right font-mono text-gray-400">{p.costOfProtection}%</td>
                        <td className="p-3 text-right font-mono text-cyan-400">+{p.netBenefit}%</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${SEVERITY_COLORS[p.severity]}20`, color: SEVERITY_COLORS[p.severity] }}>
                            {p.severity}
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

        {activeTab === 'costbenefit' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Hedge Cost vs Protection Utilized</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Bar dataKey="hedgeCost" name="Hedge Cost %" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="protectionUtilized" name="Protection Used %" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Strategy Cost vs Risk Reduction</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={strategies.map(s => ({ name: s.strategyName.substring(0, 18), cost: s.annualCost, reduction: s.riskReduction }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 9 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Bar dataKey="cost" name="Annual Cost %" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="reduction" name="Risk Reduction %" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Net Benefit by Scenario (Protection - Cost)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={protection} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis dataKey="scenario" type="category" width={180} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="netBenefit" name="Net Benefit %" radius={[0, 4, 4, 0]}>
                    {protection.map((p, i) => (<Cell key={i} fill={SEVERITY_COLORS[p.severity]} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
