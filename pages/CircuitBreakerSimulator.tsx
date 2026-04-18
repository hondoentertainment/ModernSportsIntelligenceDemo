import React, { useState } from 'react';
import {
  ShieldAlert, Zap, Clock, AlertTriangle, Settings, Play, History,
  DollarSign, CheckCircle, XCircle, Activity, Shield
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import {
  getCircuitBreakers, getBreakerEvents, getBreakerRules, getSimulationResults,
  getArmedCount, getTriggeredCount, getTotalValueSaved, getAvgRiskReduction
} from '../lib/circuitBreakerService.ts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

export default function CircuitBreakerSimulator() {
  const [activeTab, setActiveTab] = useState<'active' | 'simulation' | 'events' | 'rules'>('active');
  const breakers = getCircuitBreakers();
  const events = getBreakerEvents();
  const rules = getBreakerRules();
  const simulations = getSimulationResults();
  const armedCount = getArmedCount();
  const triggeredCount = getTriggeredCount();
  const totalSaved = getTotalValueSaved();
  const avgReduction = getAvgRiskReduction();

  const tabs = [
    { key: 'active' as const, label: 'Active Breakers', icon: <ShieldAlert size={16} /> },
    { key: 'simulation' as const, label: 'Simulation', icon: <Play size={16} /> },
    { key: 'events' as const, label: 'Event History', icon: <History size={16} /> },
    { key: 'rules' as const, label: 'Rules', icon: <Settings size={16} /> },
  ];

  const statusColor = (status: string) => {
    switch (status) {
      case 'armed': return 'text-green-400 bg-green-400/10';
      case 'triggered': return 'text-red-400 bg-red-400/10';
      case 'cooldown': return 'text-yellow-400 bg-yellow-400/10';
      case 'disabled': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-400/10';
      case 'high': return 'text-orange-400 bg-orange-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'low': return 'text-blue-400 bg-blue-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const breakerTypeData = breakers.reduce((acc, b) => {
    const existing = acc.find(a => a.type === b.type);
    if (existing) existing.count++;
    else acc.push({ type: b.type, count: 1 });
    return acc;
  }, [] as { type: string; count: number }[]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-500/20 rounded-xl">
            <ShieldAlert size={28} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Circuit Breaker Simulator</h1>
            <p className="text-sm text-gray-400">Portfolio-level trading halts triggered by extreme market moves</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Armed Breakers</span>
              <Shield size={18} className="text-green-400" />
            </div>
            <p className="text-2xl font-bold text-green-400">{armedCount}</p>
            <p className="text-xs text-gray-500 mt-1">Ready to protect portfolio</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Currently Triggered</span>
              <AlertTriangle size={18} className="text-red-400" />
            </div>
            <p className="text-2xl font-bold text-red-400">{triggeredCount}</p>
            <p className="text-xs text-gray-500 mt-1">Active halt conditions</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Value Saved</span>
              <DollarSign size={18} className="text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-yellow-400">${(totalSaved / 1000).toFixed(0)}K</p>
            <p className="text-xs text-gray-500 mt-1">Estimated losses prevented</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Avg Risk Reduction</span>
              <Activity size={18} className="text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-400">{avgReduction}%</p>
            <p className="text-xs text-gray-500 mt-1">In simulation scenarios</p>
          </div>
        </div>

        <div className="flex gap-2 border-b border-gray-800 pb-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'active' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Breaker Types</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={breakerTypeData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="count" label={({ type, count }: { type: string; count: number }) => `${type}: ${count}`}>
                      {breakerTypeData.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Trigger Count by Breaker</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={breakers.filter(b => b.triggerCount > 0).map(b => ({ name: b.name.split(' ').slice(0, 2).join(' '), triggers: b.triggerCount }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                    <Bar dataKey="triggers" fill="#ef4444" radius={[4, 4, 0, 0]} name="Trigger Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {breakers.map(b => (
                <div key={b.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-200">{b.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(b.status)}`}>{b.status}</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{b.category}</p>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Threshold</p>
                      <p className="text-gray-200 font-medium">{b.threshold} {b.thresholdUnit}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Window</p>
                      <p className="text-gray-200 font-medium">{b.timeWindow}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Triggers</p>
                      <p className="text-gray-200 font-medium">{b.triggerCount}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'simulation' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Simulation: Portfolio Impact With vs Without Breakers</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={simulations}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="scenario" stroke="#9ca3af" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={80} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                  <Legend />
                  <Bar dataKey="portfolioImpact" fill="#10b981" name="With Breakers %" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="withoutBreakers" fill="#ef4444" name="Without Breakers %" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {simulations.map(s => (
                <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <h4 className="font-semibold text-gray-200 mb-3">{s.scenario}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">With breakers</span>
                      <span className="text-green-400 font-medium">{s.portfolioImpact}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Without breakers</span>
                      <span className="text-red-400 font-medium">{s.withoutBreakers}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Savings</span>
                      <span className="text-yellow-400 font-medium">{s.savings}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Risk Reduction</span>
                      <span className="text-blue-400 font-medium">{s.riskReduction}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Breakers triggered</span>
                      <span className="text-gray-200 font-medium">{s.breakersTriggered}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Value Saved by Event</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={events.slice(0, 8).map(e => ({ name: e.breakerName.split(' ').slice(0, 2).join(' '), saved: e.valueSaved, cards: e.cardsAffected }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} formatter={(v: number) => [`$${v.toLocaleString()}`, '']} />
                  <Bar dataKey="saved" fill="#10b981" radius={[4, 4, 0, 0]} name="Value Saved ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Event Log</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-800">
                      <th className="text-left py-3 px-2">Breaker</th>
                      <th className="text-left py-3 px-2">Category</th>
                      <th className="text-left py-3 px-2">Triggered</th>
                      <th className="text-right py-3 px-2">Duration</th>
                      <th className="text-right py-3 px-2">Cards</th>
                      <th className="text-right py-3 px-2">Saved</th>
                      <th className="text-center py-3 px-2">Resolved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map(e => (
                      <tr key={e.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="py-3 px-2 font-medium text-gray-200">{e.breakerName}</td>
                        <td className="py-3 px-2 text-gray-400">{e.category}</td>
                        <td className="py-3 px-2 text-gray-400">{new Date(e.triggeredAt).toLocaleDateString()}</td>
                        <td className="py-3 px-2 text-right text-gray-300">{e.duration}</td>
                        <td className="py-3 px-2 text-right text-gray-300">{e.cardsAffected}</td>
                        <td className="py-3 px-2 text-right text-green-400">${e.valueSaved.toLocaleString()}</td>
                        <td className="py-3 px-2 text-center">
                          {e.resolved ? <CheckCircle size={16} className="text-green-400 inline" /> : <XCircle size={16} className="text-red-400 inline" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Breaker Rules Configuration</h3>
              <div className="space-y-4">
                {rules.map(r => (
                  <div key={r.id} className={`border rounded-xl p-4 ${r.enabled ? 'border-gray-700 bg-gray-800/30' : 'border-gray-800 bg-gray-900/50 opacity-60'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-200">{r.name}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${priorityColor(r.priority)}`}>{r.priority}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">Triggered {r.triggerCount}x</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${r.enabled ? 'text-green-400 bg-green-400/10' : 'text-gray-400 bg-gray-400/10'}`}>{r.enabled ? 'Enabled' : 'Disabled'}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Condition: </span>
                        <span className="text-gray-300 font-mono text-xs">{r.condition}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Action: </span>
                        <span className="text-gray-300">{r.action}</span>
                      </div>
                    </div>
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
