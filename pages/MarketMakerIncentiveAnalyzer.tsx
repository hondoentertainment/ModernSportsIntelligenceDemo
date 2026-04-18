import React, { useState } from 'react';
import {
  Landmark, TrendingUp, DollarSign, Users, BarChart3,
  Activity, Target, Shield, ArrowUpDown, Gauge
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
  getIncentiveProfiles, getSpreadAnalysis, getMakerBehaviors, getIncentiveHistory,
  getAvgSpread, getActiveMakerCount, getAvgProfitMargin, getMarketEfficiency
} from '../lib/marketMakerIncentiveService.ts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

export default function MarketMakerIncentiveAnalyzer() {
  const [activeTab, setActiveTab] = useState<'incentive' | 'spreads' | 'dealers'>('incentive');
  const profiles = getIncentiveProfiles();
  const spreads = getSpreadAnalysis();
  const behaviors = getMakerBehaviors();
  const history = getIncentiveHistory();
  const avgSpread = getAvgSpread();
  const makerCount = getActiveMakerCount();
  const avgMargin = getAvgProfitMargin();
  const efficiency = getMarketEfficiency();

  const tabs = [
    { key: 'incentive' as const, label: 'Incentive Map', icon: <Target size={16} /> },
    { key: 'spreads' as const, label: 'Spread Analysis', icon: <ArrowUpDown size={16} /> },
    { key: 'dealers' as const, label: 'Dealer Profiles', icon: <Users size={16} /> },
  ];

  const impactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-400 bg-green-400/10';
      case 'negative': return 'text-red-400 bg-red-400/10';
      case 'neutral': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const trendColor = (trend: string) => {
    switch (trend) {
      case 'tightening': return 'text-green-400';
      case 'widening': return 'text-red-400';
      case 'stable': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const incentiveTypeData = profiles.reduce((acc, p) => {
    const existing = acc.find(a => a.type === p.incentiveType);
    if (existing) { existing.count++; existing.volume += p.monthlyVolume; }
    else acc.push({ type: p.incentiveType, count: 1, volume: p.monthlyVolume });
    return acc;
  }, [] as { type: string; count: number; volume: number }[]);

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 rounded-xl">
            <Landmark size={28} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Market Maker Incentive Analyzer</h1>
            <p className="text-sm text-gray-400">Analyze dealer spread incentives and market-making behavior</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Avg Spread</span>
              <ArrowUpDown size={18} className="text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-yellow-400">{avgSpread}%</p>
            <p className="text-xs text-gray-500 mt-1">Market-wide bid-ask spread</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Active Makers</span>
              <Users size={18} className="text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-400">{makerCount}</p>
            <p className="text-xs text-gray-500 mt-1">Tracked dealer profiles</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Avg Profit Margin</span>
              <DollarSign size={18} className="text-green-400" />
            </div>
            <p className="text-2xl font-bold text-green-400">{avgMargin}%</p>
            <p className="text-xs text-gray-500 mt-1">Across all dealers</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Market Efficiency</span>
              <Gauge size={18} className="text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-indigo-400">{efficiency}%</p>
            <p className="text-xs text-gray-500 mt-1">Current efficiency index</p>
          </div>
        </div>

        <div className="flex gap-2 border-b border-gray-800 pb-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'incentive' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Incentive Type Distribution</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={incentiveTypeData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="count" label={({ type, count }: { type: string; count: number }) => `${type}: ${count}`}>
                      {incentiveTypeData.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Market Efficiency Trend</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" domain={[55, 75]} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                    <Legend />
                    <Line type="monotone" dataKey="marketEfficiency" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Market Efficiency %" />
                    <Line type="monotone" dataKey="avgProfitMargin" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} name="Avg Profit Margin %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Spread & Volume Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                  <Legend />
                  <Area type="monotone" dataKey="avgSpread" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} name="Avg Spread %" />
                  <Area type="monotone" dataKey="activeMakers" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} name="Active Makers" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Maker Behaviors Detected</h3>
              {behaviors.map(b => (
                <div key={b.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-200">{b.dealerName}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${impactColor(b.impact)}`}>{b.impact}</span>
                    </div>
                    <span className="text-xs text-gray-500">{b.frequency} | Confidence: {b.confidence}%</span>
                  </div>
                  <p className="text-sm font-medium text-gray-300 mb-1">{b.behavior}</p>
                  <p className="text-sm text-gray-400">{b.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'spreads' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Bid-Ask Spreads by Category</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={spreads}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="category" stroke="#9ca3af" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                  <Legend />
                  <Bar dataKey="bidAskSpread" fill="#ef4444" name="Bid-Ask Spread %" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="effectiveSpread" fill="#f59e0b" name="Effective Spread %" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="realizedSpread" fill="#10b981" name="Realized Spread %" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Market Depth & Resilience</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={spreads.slice(0, 6).map(s => ({
                  category: s.category.split(' ').slice(0, 2).join(' '),
                  depth: s.depth,
                  resilience: s.resilience,
                  makers: s.makerCount,
                }))}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="category" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis stroke="#4b5563" />
                  <Radar name="Depth" dataKey="depth" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                  <Radar name="Resilience" dataKey="resilience" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Spread Details</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-800">
                      <th className="text-left py-3 px-2">Category</th>
                      <th className="text-right py-3 px-2">Bid-Ask</th>
                      <th className="text-right py-3 px-2">Effective</th>
                      <th className="text-right py-3 px-2">Impact</th>
                      <th className="text-right py-3 px-2">Depth</th>
                      <th className="text-right py-3 px-2">Makers</th>
                      <th className="text-center py-3 px-2">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spreads.map(s => (
                      <tr key={s.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="py-3 px-2 font-medium text-gray-200">{s.category}</td>
                        <td className="py-3 px-2 text-right text-red-400">{s.bidAskSpread}%</td>
                        <td className="py-3 px-2 text-right text-yellow-400">{s.effectiveSpread}%</td>
                        <td className="py-3 px-2 text-right text-orange-400">{s.priceImpact}%</td>
                        <td className="py-3 px-2 text-right text-blue-400">{s.depth}</td>
                        <td className="py-3 px-2 text-right text-gray-300">{s.makerCount}</td>
                        <td className="py-3 px-2 text-center">
                          <span className={trendColor(s.trend)}>{s.trend}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dealers' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Dealer Profit Margins vs Risk</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={profiles.sort((a, b) => b.profitMargin - a.profitMargin)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="dealerName" stroke="#9ca3af" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={80} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                  <Legend />
                  <Bar dataKey="profitMargin" fill="#10b981" name="Profit Margin %" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="riskScore" fill="#ef4444" name="Risk Score" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profiles.map(p => (
                <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-200">{p.dealerName}</h4>
                    <span className="text-xs px-2 py-1 rounded-full text-gray-400 bg-gray-800">{p.incentiveType}</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{p.category}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Net Spread</p>
                      <p className="text-yellow-400 font-medium">{p.netSpread}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Profit Margin</p>
                      <p className="text-green-400 font-medium">{p.profitMargin}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Turnover</p>
                      <p className="text-blue-400 font-medium">{p.inventoryTurnover}x</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Monthly Vol</p>
                      <p className="text-gray-200">${(p.monthlyVolume / 1000).toFixed(0)}K</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Listings</p>
                      <p className="text-gray-200">{p.activeListings.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Risk</p>
                      <p className={p.riskScore < 25 ? 'text-green-400' : p.riskScore < 50 ? 'text-yellow-400' : 'text-red-400'}>{p.riskScore}</p>
                    </div>
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
