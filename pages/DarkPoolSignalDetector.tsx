import React, { useState } from 'react';
import {
  Eye, EyeOff, Activity, TrendingUp, DollarSign, Shield, AlertTriangle, Radio,
  Search, Filter, MapPin, BarChart3
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
  getDarkPoolSignals, getPrivateDealFlow, getSignalConfidence, getDarkPoolHistory,
  getActiveSignalCount, getConfirmedSignalCount, getTotalEstimatedValue, getAvgConfidence
} from '../lib/darkPoolSignalService.ts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

export default function DarkPoolSignalDetector() {
  const [activeTab, setActiveTab] = useState<'live' | 'flow' | 'history'>('live');
  const signals = getDarkPoolSignals();
  const dealFlow = getPrivateDealFlow();
  const confidence = getSignalConfidence();
  const history = getDarkPoolHistory();
  const activeCount = getActiveSignalCount();
  const confirmedCount = getConfirmedSignalCount();
  const totalValue = getTotalEstimatedValue();
  const avgConf = getAvgConfidence();

  const tabs = [
    { key: 'live' as const, label: 'Live Signals', icon: <Radio size={16} /> },
    { key: 'flow' as const, label: 'Deal Flow Map', icon: <MapPin size={16} /> },
    { key: 'history' as const, label: 'Historical Patterns', icon: <BarChart3 size={16} /> },
  ];

  const signalTypeData = signals.reduce((acc, s) => {
    const existing = acc.find(a => a.type === s.signalType);
    if (existing) { existing.count++; existing.value += s.estimatedValue; }
    else { acc.push({ type: s.signalType, count: 1, value: s.estimatedValue }); }
    return acc;
  }, [] as { type: string; count: number; value: number }[]);

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10';
      case 'confirmed': return 'text-blue-400 bg-blue-400/10';
      case 'investigating': return 'text-yellow-400 bg-yellow-400/10';
      case 'expired': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/20 rounded-xl">
            <EyeOff size={28} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Dark Pool Signal Detector</h1>
            <p className="text-sm text-gray-400">Off-market and private deal flow detection for sports cards</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Active Signals</span>
              <Radio size={18} className="text-green-400" />
            </div>
            <p className="text-2xl font-bold text-green-400">{activeCount}</p>
            <p className="text-xs text-gray-500 mt-1">Currently being tracked</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Confirmed Deals</span>
              <Shield size={18} className="text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-400">{confirmedCount}</p>
            <p className="text-xs text-gray-500 mt-1">Verified private transactions</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Estimated Value</span>
              <DollarSign size={18} className="text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-yellow-400">${(totalValue / 1000000).toFixed(2)}M</p>
            <p className="text-xs text-gray-500 mt-1">Across all detected signals</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Avg Confidence</span>
              <Activity size={18} className="text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-purple-400">{avgConf}%</p>
            <p className="text-xs text-gray-500 mt-1">Signal detection accuracy</p>
          </div>
        </div>

        {/* Tab Nav */}
        <div className="flex gap-2 border-b border-gray-800 pb-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            {/* Signal Type Distribution Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Signals by Type</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={signalTypeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="type" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Confidence Distribution</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={confidence.map(c => ({
                    signal: c.signalId,
                    algorithm: c.algorithmScore,
                    volume: c.volumeEvidence,
                    price: c.priceEvidence,
                    network: c.networkEvidence,
                    historical: c.historicalAccuracy,
                  }))}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="signal" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis stroke="#4b5563" />
                    <Radar name="Algorithm" dataKey="algorithm" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                    <Radar name="Volume" dataKey="volume" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Signal Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Live Signal Feed</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-800">
                      <th className="text-left py-3 px-2">Card</th>
                      <th className="text-left py-3 px-2">Type</th>
                      <th className="text-right py-3 px-2">Value</th>
                      <th className="text-right py-3 px-2">Confidence</th>
                      <th className="text-right py-3 px-2">Impact</th>
                      <th className="text-center py-3 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {signals.map(s => (
                      <tr key={s.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="py-3 px-2">
                          <p className="font-medium text-gray-200">{s.cardName}</p>
                          <p className="text-xs text-gray-500">{s.player} - {s.sport}</p>
                        </td>
                        <td className="py-3 px-2 text-gray-300">{s.signalType}</td>
                        <td className="py-3 px-2 text-right text-yellow-400">${s.estimatedValue.toLocaleString()}</td>
                        <td className="py-3 px-2 text-right">
                          <span className={s.confidenceScore >= 85 ? 'text-green-400' : s.confidenceScore >= 70 ? 'text-yellow-400' : 'text-red-400'}>
                            {s.confidenceScore}%
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right text-orange-400">+{s.priceImpact}%</td>
                        <td className="py-3 px-2 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${statusColor(s.status)}`}>{s.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'flow' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Private Deal Flow by Category</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={dealFlow}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="category" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                  <Legend />
                  <Bar dataKey="totalValue" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Total Value ($)" />
                  <Bar dataKey="cardsInvolved" fill="#10b981" radius={[4, 4, 0, 0]} name="Cards Involved" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dealFlow.map(df => (
                <div key={df.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-200">{df.dealType}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      df.flowDirection === 'accumulation' ? 'text-green-400 bg-green-400/10' :
                      df.flowDirection === 'distribution' ? 'text-red-400 bg-red-400/10' :
                      'text-blue-400 bg-blue-400/10'
                    }`}>{df.flowDirection}</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{df.category}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Value</p>
                      <p className="text-yellow-400 font-medium">${(df.totalValue / 1000).toFixed(0)}K</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Cards</p>
                      <p className="text-gray-200 font-medium">{df.cardsInvolved}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Parties</p>
                      <p className="text-gray-200 font-medium">{df.parties}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Premium</p>
                      <p className={df.avgPremium >= 0 ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                        {df.avgPremium >= 0 ? '+' : ''}{df.avgPremium}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Detection History - Signals Over Time</h3>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                  <Legend />
                  <Area type="monotone" dataKey="signalsDetected" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} name="Detected" />
                  <Area type="monotone" dataKey="confirmed" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Confirmed" />
                  <Area type="monotone" dataKey="falsePositives" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="False Positives" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Estimated Dark Pool Volume</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `$${(v / 1000000).toFixed(1)}M`} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} formatter={(v: number) => [`$${(v / 1000000).toFixed(2)}M`, 'Volume']} />
                    <Line type="monotone" dataKey="estimatedVolume" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Average Confidence Trend</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" domain={[70, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                    <Line type="monotone" dataKey="avgConfidence" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} name="Avg Confidence %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
