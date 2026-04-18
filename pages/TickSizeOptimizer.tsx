import React, { useState } from 'react';
import {
  Hash, TrendingUp, BarChart3, Target, DollarSign, Activity,
  Sliders, Clock, ArrowUpRight, Layers
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
  getTickAnalyses, getPriceIncrements, getOptimalTicks, getTickHistory,
  getAvgImprovement, getAvgEfficiency, getOptimalTickCount, getTotalListings
} from '../lib/tickSizeOptimizerService.ts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

export default function TickSizeOptimizer() {
  const [activeTab, setActiveTab] = useState<'optimal' | 'category' | 'historical'>('optimal');
  const analyses = getTickAnalyses();
  const increments = getPriceIncrements();
  const optimalTicks = getOptimalTicks();
  const history = getTickHistory();
  const avgImprovement = getAvgImprovement();
  const avgEfficiency = getAvgEfficiency();
  const optimalCount = getOptimalTickCount();
  const totalListings = getTotalListings();

  const tabs = [
    { key: 'optimal' as const, label: 'Optimal Ticks', icon: <Target size={16} /> },
    { key: 'category' as const, label: 'Category Analysis', icon: <Layers size={16} /> },
    { key: 'historical' as const, label: 'Historical Performance', icon: <Clock size={16} /> },
  ];

  const performanceColor = (perf: string) => {
    switch (perf) {
      case 'optimal': return 'text-green-400 bg-green-400/10';
      case 'overperforming': return 'text-blue-400 bg-blue-400/10';
      case 'average': return 'text-yellow-400 bg-yellow-400/10';
      case 'underperforming': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/20 rounded-xl">
            <Hash size={28} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Tick Size Optimizer</h1>
            <p className="text-sm text-gray-400">Optimal price increment analysis for card listings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Avg Improvement</span>
              <TrendingUp size={18} className="text-green-400" />
            </div>
            <p className="text-2xl font-bold text-green-400">+{avgImprovement}%</p>
            <p className="text-xs text-gray-500 mt-1">Sell-through rate gain potential</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Avg Efficiency</span>
              <Activity size={18} className="text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-400">{avgEfficiency}%</p>
            <p className="text-xs text-gray-500 mt-1">Current pricing efficiency</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Optimal Ticks Found</span>
              <Target size={18} className="text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-indigo-400">{optimalCount}</p>
            <p className="text-xs text-gray-500 mt-1">Best-performing increments</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Listings Analyzed</span>
              <BarChart3 size={18} className="text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-yellow-400">{(totalListings / 1000).toFixed(0)}K</p>
            <p className="text-xs text-gray-500 mt-1">Across all categories</p>
          </div>
        </div>

        <div className="flex gap-2 border-b border-gray-800 pb-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'optimal' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Optimal vs Current Tick Size</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={optimalTicks}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="category" stroke="#9ca3af" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} formatter={(v: number) => [`$${v}`, '']} />
                  <Legend />
                  <Bar dataKey="currentMedianTick" fill="#ef4444" name="Current Tick ($)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="recommendedTick" fill="#10b981" name="Recommended Tick ($)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {optimalTicks.map(o => (
                <div key={o.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <h4 className="font-semibold text-gray-200 mb-1">{o.category}</h4>
                  <p className="text-xs text-gray-500 mb-3">${o.priceFloor.toLocaleString()} - ${o.priceCeiling.toLocaleString()}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Current Tick</p>
                      <p className="text-red-400 font-medium">${o.currentMedianTick}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Recommended</p>
                      <p className="text-green-400 font-medium">${o.recommendedTick}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Sell-Through Gain</p>
                      <p className="text-blue-400 font-medium">+{o.sellThroughDiff}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Revenue Impact</p>
                      <p className="text-yellow-400 font-medium">+{o.revenueImpact}%</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500">Confidence</p>
                      <div className="w-full bg-gray-800 rounded-full h-2 mt-1">
                        <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${o.confidence}%` }} />
                      </div>
                      <p className="text-right text-xs text-gray-500 mt-1">{o.confidence}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'category' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Price Efficiency by Category</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={analyses}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="category" stroke="#9ca3af" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={70} />
                  <YAxis stroke="#9ca3af" domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                  <Legend />
                  <Bar dataKey="priceEfficiency" fill="#8b5cf6" name="Price Efficiency %" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="improvementPotential" fill="#f59e0b" name="Improvement %" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Increment Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-800">
                      <th className="text-left py-3 px-2">Category</th>
                      <th className="text-right py-3 px-2">Increment</th>
                      <th className="text-right py-3 px-2">Frequency</th>
                      <th className="text-right py-3 px-2">Sell-Through</th>
                      <th className="text-right py-3 px-2">Avg Days</th>
                      <th className="text-center py-3 px-2">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {increments.map(i => (
                      <tr key={i.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="py-3 px-2 font-medium text-gray-200">{i.category}</td>
                        <td className="py-3 px-2 text-right text-gray-300 font-mono">${i.increment.toFixed(2)}</td>
                        <td className="py-3 px-2 text-right text-gray-300">{i.frequency.toLocaleString()}</td>
                        <td className="py-3 px-2 text-right text-green-400">{i.sellThroughRate}%</td>
                        <td className="py-3 px-2 text-right text-gray-300">{i.avgDaysToSell}</td>
                        <td className="py-3 px-2 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${performanceColor(i.performance)}`}>{i.performance}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'historical' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Tick Size Convergence - Basketball Prizm</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} formatter={(v: number) => [`$${v}`, '']} />
                  <Legend />
                  <Line type="monotone" dataKey="avgTick" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} name="Avg Tick ($)" />
                  <Line type="monotone" dataKey="optimalTick" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Optimal Tick ($)" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Sell-Through Rate Trend</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" domain={[60, 85]} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                    <Area type="monotone" dataKey="sellThrough" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} name="Sell-Through %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Price Efficiency Trend</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" domain={[60, 80]} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                    <Area type="monotone" dataKey="priceEfficiency" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} name="Price Efficiency %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
