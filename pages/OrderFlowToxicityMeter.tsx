import React, { useState } from 'react';
import {
  Activity, AlertTriangle, Gauge, TrendingUp, TrendingDown, BarChart3,
  Waves, Zap, Shield, ThermometerSun
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
  getToxicityReadings, getVPINScores, getFlowAnalysis, getToxicityHistory,
  getCriticalCount, getHighCount, getAvgVPIN, getMaxVPIN
} from '../lib/orderFlowToxicityService.ts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

export default function OrderFlowToxicityMeter() {
  const [activeTab, setActiveTab] = useState<'live' | 'vpin' | 'flow'>('live');
  const readings = getToxicityReadings();
  const vpinScores = getVPINScores();
  const flowAnalysis = getFlowAnalysis();
  const history = getToxicityHistory();
  const criticalCount = getCriticalCount();
  const highCount = getHighCount();
  const avgVPIN = getAvgVPIN();
  const maxVPIN = getMaxVPIN();

  const tabs = [
    { key: 'live' as const, label: 'Live Toxicity', icon: <ThermometerSun size={16} /> },
    { key: 'vpin' as const, label: 'VPIN Scores', icon: <Gauge size={16} /> },
    { key: 'flow' as const, label: 'Flow Analysis', icon: <Waves size={16} /> },
  ];

  const toxicityColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-400 bg-red-400/10';
      case 'high': return 'text-orange-400 bg-orange-400/10';
      case 'moderate': return 'text-yellow-400 bg-yellow-400/10';
      case 'low': return 'text-green-400 bg-green-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const vpinBarColor = (score: number) => {
    if (score >= 0.75) return '#ef4444';
    if (score >= 0.6) return '#f97316';
    if (score >= 0.4) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-500/20 rounded-xl">
            <Activity size={28} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Order Flow Toxicity Meter</h1>
            <p className="text-sm text-gray-400">VPIN-style toxic flow detection in card marketplace listings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Critical Alerts</span>
              <AlertTriangle size={18} className="text-red-400" />
            </div>
            <p className="text-2xl font-bold text-red-400">{criticalCount}</p>
            <p className="text-xs text-gray-500 mt-1">Categories at critical toxicity</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">High Risk</span>
              <Zap size={18} className="text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-orange-400">{highCount}</p>
            <p className="text-xs text-gray-500 mt-1">Categories above threshold</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Avg VPIN</span>
              <Gauge size={18} className="text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-yellow-400">{avgVPIN}</p>
            <p className="text-xs text-gray-500 mt-1">Market-wide average</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Max VPIN</span>
              <TrendingUp size={18} className="text-red-400" />
            </div>
            <p className="text-2xl font-bold text-red-400">{maxVPIN}</p>
            <p className="text-xs text-gray-500 mt-1">Highest category reading</p>
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

        {activeTab === 'live' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">VPIN Toxicity Trend (7 Days)</h3>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" domain={[0, 1]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                  <Legend />
                  <Area type="monotone" dataKey="basketballVPIN" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} name="Basketball" />
                  <Area type="monotone" dataKey="footballVPIN" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} name="Football" />
                  <Area type="monotone" dataKey="baseballVPIN" stroke="#10b981" fill="#10b981" fillOpacity={0.15} name="Baseball" />
                  <Area type="monotone" dataKey="overallVPIN" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} name="Overall" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Live Toxicity Readings</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-800">
                      <th className="text-left py-3 px-2">Category</th>
                      <th className="text-left py-3 px-2">Sport</th>
                      <th className="text-right py-3 px-2">VPIN</th>
                      <th className="text-center py-3 px-2">Level</th>
                      <th className="text-right py-3 px-2">Buy / Sell</th>
                      <th className="text-right py-3 px-2">Informed %</th>
                      <th className="text-right py-3 px-2">Volatility</th>
                    </tr>
                  </thead>
                  <tbody>
                    {readings.sort((a, b) => b.vpinScore - a.vpinScore).map(r => (
                      <tr key={r.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="py-3 px-2 font-medium text-gray-200">{r.category}</td>
                        <td className="py-3 px-2 text-gray-400">{r.sport}</td>
                        <td className="py-3 px-2 text-right font-mono font-bold" style={{ color: vpinBarColor(r.vpinScore) }}>{r.vpinScore.toFixed(2)}</td>
                        <td className="py-3 px-2 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${toxicityColor(r.toxicityLevel)}`}>{r.toxicityLevel}</span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span className="text-green-400">{r.buyPressure}%</span>
                          {' / '}
                          <span className="text-red-400">{r.sellPressure}%</span>
                        </td>
                        <td className="py-3 px-2 text-right text-orange-400">{r.informedTraderPct}%</td>
                        <td className="py-3 px-2 text-right text-yellow-400">{r.priceVolatility}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vpin' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">VPIN Score Distribution by Category</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={vpinScores}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="category" stroke="#9ca3af" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                  <YAxis stroke="#9ca3af" domain={[0, 1]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                  <Legend />
                  <Bar dataKey="currentVPIN" name="Current VPIN" radius={[4, 4, 0, 0]}>
                    {vpinScores.map((entry, idx) => (
                      <Cell key={idx} fill={vpinBarColor(entry.currentVPIN)} />
                    ))}
                  </Bar>
                  <Bar dataKey="avgVPIN" fill="#6b7280" name="Avg VPIN" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {vpinScores.map(v => (
                <div key={v.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <h4 className="font-medium text-gray-200 text-sm mb-3">{v.category}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current</span>
                      <span className="font-bold" style={{ color: vpinBarColor(v.currentVPIN) }}>{v.currentVPIN.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Z-Score</span>
                      <span className={v.zScore > 1.5 ? 'text-red-400' : v.zScore > 0.5 ? 'text-yellow-400' : 'text-green-400'}>{v.zScore.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Percentile</span>
                      <span className="text-gray-200">{v.percentile}th</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Trend</span>
                      <span className={v.trend === 'rising' ? 'text-red-400' : v.trend === 'falling' ? 'text-green-400' : 'text-gray-400'}>{v.trend}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'flow' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Order Flow Imbalance by Category</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={flowAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="category" stroke="#9ca3af" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} formatter={(value: number) => [`$${(value / 1000).toFixed(0)}K`, '']} />
                  <Legend />
                  <Bar dataKey="buyVolume" fill="#10b981" name="Buy Volume" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sellVolume" fill="#ef4444" name="Sell Volume" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Toxic Flow Breakdown</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={flowAnalysis.map(f => ({
                    category: f.category.split(' ').slice(0, 2).join(' '),
                    toxicBuy: f.toxicBuyPct,
                    toxicSell: f.toxicSellPct,
                    imbalance: f.imbalanceRatio * 100,
                  }))}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="category" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis stroke="#4b5563" />
                    <Radar name="Toxic Buy %" dataKey="toxicBuy" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                    <Radar name="Toxic Sell %" dataKey="toxicSell" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Alerts Triggered (7 Days)</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                    <Line type="monotone" dataKey="alertsTriggered" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} name="Alerts" />
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
