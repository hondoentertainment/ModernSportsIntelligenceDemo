import React, { useState } from 'react';
import {
  ShieldCheck, AlertTriangle, Users, TrendingUp, BarChart3,
  Clock, CheckCircle, XCircle, DollarSign, Activity
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
  getSettlementRisks, getCounterpartyReliability, getFailureEvents, getRiskScores,
  getHighRiskCount, getAvgReliability, getTotalFailures, getRecoveryRate
} from '../lib/settlementRiskService.ts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

export default function SettlementRiskDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'scores' | 'failures'>('overview');
  const risks = getSettlementRisks();
  const reliability = getCounterpartyReliability();
  const failures = getFailureEvents();
  const riskScores = getRiskScores();
  const highRiskCount = getHighRiskCount();
  const avgReliability = getAvgReliability();
  const totalFailures = getTotalFailures();
  const recoveryRate = getRecoveryRate();

  const tabs = [
    { key: 'overview' as const, label: 'Risk Overview', icon: <ShieldCheck size={16} /> },
    { key: 'scores' as const, label: 'Counterparty Scores', icon: <Users size={16} /> },
    { key: 'failures' as const, label: 'Failure Events', icon: <AlertTriangle size={16} /> },
  ];

  const riskColor = (level: string) => {
    switch (level) {
      case 'minimal': return 'text-green-400 bg-green-400/10';
      case 'low': return 'text-blue-400 bg-blue-400/10';
      case 'moderate': return 'text-yellow-400 bg-yellow-400/10';
      case 'high': return 'text-orange-400 bg-orange-400/10';
      case 'critical': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const riskDistribution = risks.reduce((acc, r) => {
    const existing = acc.find(a => a.name === r.riskLevel);
    if (existing) existing.value++;
    else acc.push({ name: r.riskLevel, value: 1 });
    return acc;
  }, [] as { name: string; value: number }[]);

  const RISK_COLORS: Record<string, string> = {
    minimal: '#10b981', low: '#3b82f6', moderate: '#f59e0b', high: '#f97316', critical: '#ef4444'
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 rounded-xl">
            <ShieldCheck size={28} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Settlement Risk Dashboard</h1>
            <p className="text-sm text-gray-400">Track counterparty settlement reliability and failure rates</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">High Risk Counterparties</span>
              <AlertTriangle size={18} className="text-red-400" />
            </div>
            <p className="text-2xl font-bold text-red-400">{highRiskCount}</p>
            <p className="text-xs text-gray-500 mt-1">Require extra caution</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Avg Reliability</span>
              <Activity size={18} className="text-green-400" />
            </div>
            <p className="text-2xl font-bold text-green-400">{avgReliability}%</p>
            <p className="text-xs text-gray-500 mt-1">Across all counterparties</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Failures</span>
              <XCircle size={18} className="text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-orange-400">{totalFailures}</p>
            <p className="text-xs text-gray-500 mt-1">Settlement failure events</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Recovery Rate</span>
              <CheckCircle size={18} className="text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-400">{recoveryRate}%</p>
            <p className="text-xs text-gray-500 mt-1">Funds successfully recovered</p>
          </div>
        </div>

        <div className="flex gap-2 border-b border-gray-800 pb-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Risk Distribution</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }: { name: string; value: number }) => `${name}: ${value}`}>
                      {riskDistribution.map((entry) => (
                        <Cell key={entry.name} fill={RISK_COLORS[entry.name] || '#6b7280'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Risk by Category</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={riskScores}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="category" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                    <Legend />
                    <Bar dataKey="avgScore" fill="#10b981" name="Avg Score" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="failureRate" fill="#ef4444" name="Failure Rate %" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Counterparty Reliability Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reliability.filter(r => r.counterparty === 'CardKingCollectors')}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" domain={[60, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                  <Legend />
                  <Line type="monotone" dataKey="onTimeRate" stroke="#10b981" strokeWidth={2} name="On-Time Rate %" />
                  <Line type="monotone" dataKey="disputeRate" stroke="#ef4444" strokeWidth={2} name="Dispute Rate %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'scores' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Reliability Scores by Counterparty</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={risks.sort((a, b) => b.reliabilityScore - a.reliabilityScore)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="counterparty" stroke="#9ca3af" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={80} />
                  <YAxis stroke="#9ca3af" domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                  <Bar dataKey="reliabilityScore" name="Reliability Score" radius={[4, 4, 0, 0]}>
                    {risks.map((r, idx) => (
                      <Cell key={idx} fill={r.reliabilityScore >= 90 ? '#10b981' : r.reliabilityScore >= 75 ? '#f59e0b' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">All Counterparties</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-800">
                      <th className="text-left py-3 px-2">Counterparty</th>
                      <th className="text-left py-3 px-2">Type</th>
                      <th className="text-right py-3 px-2">Score</th>
                      <th className="text-right py-3 px-2">Txns</th>
                      <th className="text-right py-3 px-2">On-Time</th>
                      <th className="text-right py-3 px-2">Avg Days</th>
                      <th className="text-right py-3 px-2">Disputes</th>
                      <th className="text-center py-3 px-2">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {risks.sort((a, b) => a.reliabilityScore - b.reliabilityScore).map(r => (
                      <tr key={r.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="py-3 px-2 font-medium text-gray-200">{r.counterparty}</td>
                        <td className="py-3 px-2 text-gray-400">{r.type}</td>
                        <td className="py-3 px-2 text-right">
                          <span className={r.reliabilityScore >= 90 ? 'text-green-400' : r.reliabilityScore >= 75 ? 'text-yellow-400' : 'text-red-400'}>{r.reliabilityScore}</span>
                        </td>
                        <td className="py-3 px-2 text-right text-gray-300">{r.totalTransactions.toLocaleString()}</td>
                        <td className="py-3 px-2 text-right text-gray-300">{Math.round(r.completedOnTime / r.totalTransactions * 100)}%</td>
                        <td className="py-3 px-2 text-right text-gray-300">{r.avgSettlementDays}</td>
                        <td className="py-3 px-2 text-right text-orange-400">{r.disputeRate}%</td>
                        <td className="py-3 px-2 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${riskColor(r.riskLevel)}`}>{r.riskLevel}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'failures' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Failure Events by Value</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={failures}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="counterparty" stroke="#9ca3af" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} formatter={(v: number) => [`$${v.toLocaleString()}`, '']} />
                  <Legend />
                  <Bar dataKey="transactionValue" fill="#ef4444" name="Transaction Value ($)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="recoveredAmount" fill="#10b981" name="Recovered ($)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              {failures.map(f => (
                <div key={f.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-200">{f.counterparty}</span>
                      <span className="px-2 py-1 rounded-full text-xs text-orange-400 bg-orange-400/10">{f.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">{f.date}</span>
                      {f.recovered ? <CheckCircle size={16} className="text-green-400" /> : <XCircle size={16} className="text-red-400" />}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{f.failureReason}</p>
                  <p className="text-sm text-gray-300 mb-3">Resolution: {f.resolution}</p>
                  <div className="flex gap-6 text-sm">
                    <span className="text-gray-500">Value: <span className="text-yellow-400">${f.transactionValue.toLocaleString()}</span></span>
                    <span className="text-gray-500">Recovered: <span className={f.recovered ? 'text-green-400' : 'text-red-400'}>${f.recoveredAmount.toLocaleString()}</span></span>
                    <span className="text-gray-500">Days to resolve: <span className="text-gray-300">{f.daysToResolve || 'Pending'}</span></span>
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
