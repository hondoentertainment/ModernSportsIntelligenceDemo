import React, { useState } from 'react';
import {
  ArrowRightLeft, TrendingUp, DollarSign, Clock, Target, BarChart3,
  MapPin, Zap, ArrowUpRight, ArrowDownRight, CheckCircle
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
  getMigrationOpportunities, getVenueComparisons, getMigrationROI, getTimingSignals,
  getHighUrgencyCount, getAvgProjectedUplift, getTotalFeeSavings, getMigrateInSignals
} from '../lib/venueMigrationService.ts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

export default function VenueMigrationAdvisor() {
  const [activeTab, setActiveTab] = useState<'opportunities' | 'comparison' | 'roi' | 'timing'>('opportunities');
  const opportunities = getMigrationOpportunities();
  const comparisons = getVenueComparisons();
  const roiData = getMigrationROI();
  const timingSignals = getTimingSignals();
  const highUrgency = getHighUrgencyCount();
  const avgUplift = getAvgProjectedUplift();
  const feeSavings = getTotalFeeSavings();
  const migrateInCount = getMigrateInSignals();

  const tabs = [
    { key: 'opportunities' as const, label: 'Opportunities', icon: <Target size={16} /> },
    { key: 'comparison' as const, label: 'Venue Comparison', icon: <BarChart3 size={16} /> },
    { key: 'roi' as const, label: 'ROI Analysis', icon: <DollarSign size={16} /> },
    { key: 'timing' as const, label: 'Timing', icon: <Clock size={16} /> },
  ];

  const urgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return 'text-red-400 bg-red-400/10';
      case 'high': return 'text-orange-400 bg-orange-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'low': return 'text-blue-400 bg-blue-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const directionColor = (direction: string) => {
    switch (direction) {
      case 'migrate-in': return 'text-green-400 bg-green-400/10';
      case 'migrate-out': return 'text-red-400 bg-red-400/10';
      case 'hold': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/20 rounded-xl">
            <ArrowRightLeft size={28} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Venue Migration Advisor</h1>
            <p className="text-sm text-gray-400">When and where to migrate listings for better performance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">High Urgency</span>
              <Zap size={18} className="text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-orange-400">{highUrgency}</p>
            <p className="text-xs text-gray-500 mt-1">Opportunities requiring action</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Avg Projected Uplift</span>
              <TrendingUp size={18} className="text-green-400" />
            </div>
            <p className="text-2xl font-bold text-green-400">+{avgUplift}%</p>
            <p className="text-xs text-gray-500 mt-1">Average price improvement</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Net Fee Savings</span>
              <DollarSign size={18} className="text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-yellow-400">${feeSavings.toFixed(0)}</p>
            <p className="text-xs text-gray-500 mt-1">Potential fee reductions</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Migrate-In Signals</span>
              <ArrowUpRight size={18} className="text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-400">{migrateInCount}</p>
            <p className="text-xs text-gray-500 mt-1">Active venue opportunities</p>
          </div>
        </div>

        <div className="flex gap-2 border-b border-gray-800 pb-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'opportunities' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Projected Uplift by Opportunity</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={opportunities.filter(o => o.projectedUplift > 0)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="player" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                  <Legend />
                  <Bar dataKey="projectedUplift" fill="#10b981" name="Uplift %" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="confidence" fill="#3b82f6" name="Confidence %" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              {opportunities.map(o => (
                <div key={o.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-200">{o.cardName}</h4>
                      <p className="text-sm text-gray-400">{o.category}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${urgencyColor(o.urgency)}`}>{o.urgency}</span>
                  </div>
                  <div className="flex items-center gap-3 mb-3 text-sm">
                    <span className="text-gray-400">{o.currentVenue}</span>
                    <ArrowRightLeft size={14} className="text-gray-500" />
                    <span className="text-blue-400 font-medium">{o.recommendedVenue}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Current</p>
                      <p className="text-gray-200">${o.currentPrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Projected</p>
                      <p className="text-green-400">${o.projectedPrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Uplift</p>
                      <p className={o.projectedUplift >= 0 ? 'text-green-400' : 'text-red-400'}>{o.projectedUplift >= 0 ? '+' : ''}{o.projectedUplift}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Days to Sell</p>
                      <p className="text-gray-200">{o.currentDaysToSell}d &rarr; {o.projectedDaysToSell}d</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Confidence</p>
                      <p className="text-blue-400">{o.confidence}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'comparison' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Venue Performance Radar</h3>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={comparisons.slice(0, 6).map(c => ({
                  venue: c.venue,
                  sellThrough: c.avgSellThrough,
                  speed: Math.max(0, 100 - c.avgDaysToSell * 4),
                  lowFees: 100 - c.feePercent * 4,
                  buyerPool: Math.min(c.buyerPoolSize / 50000, 100),
                  overall: c.overallScore,
                }))}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="venue" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis stroke="#4b5563" />
                  <Radar name="Sell-Through" dataKey="sellThrough" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                  <Radar name="Speed" dataKey="speed" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                  <Radar name="Overall" dataKey="overall" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Venue Scorecard</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-800">
                      <th className="text-left py-3 px-2">Venue</th>
                      <th className="text-right py-3 px-2">Sell-Through</th>
                      <th className="text-right py-3 px-2">Avg Days</th>
                      <th className="text-right py-3 px-2">Avg Price</th>
                      <th className="text-right py-3 px-2">Fee</th>
                      <th className="text-right py-3 px-2">Score</th>
                      <th className="text-left py-3 px-2">Best For</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisons.sort((a, b) => b.overallScore - a.overallScore).map(c => (
                      <tr key={c.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="py-3 px-2 font-medium text-gray-200">{c.venue}</td>
                        <td className="py-3 px-2 text-right text-green-400">{c.avgSellThrough}%</td>
                        <td className="py-3 px-2 text-right text-gray-300">{c.avgDaysToSell}</td>
                        <td className="py-3 px-2 text-right text-yellow-400">${c.avgFinalPrice.toLocaleString()}</td>
                        <td className="py-3 px-2 text-right text-red-400">{c.feePercent}%</td>
                        <td className="py-3 px-2 text-right text-blue-400 font-bold">{c.overallScore}</td>
                        <td className="py-3 px-2 text-gray-400 text-xs">{c.bestFor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'roi' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Migration ROI by Route</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={roiData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="category" stroke="#9ca3af" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                  <Legend />
                  <Bar dataKey="netROI" fill="#10b981" name="Net ROI %" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avgPriceIncrease" fill="#3b82f6" name="Price Increase %" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roiData.map(r => (
                <div key={r.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-400 font-medium">{r.fromVenue}</span>
                    <ArrowRightLeft size={14} className="text-gray-500" />
                    <span className="text-green-400 font-medium">{r.toVenue}</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{r.category}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Net ROI</p>
                      <p className={r.netROI >= 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{r.netROI >= 0 ? '+' : ''}{r.netROI}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Price Change</p>
                      <p className={r.avgPriceIncrease >= 0 ? 'text-green-400' : 'text-red-400'}>{r.avgPriceIncrease >= 0 ? '+' : ''}{r.avgPriceIncrease}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Success Rate</p>
                      <p className="text-blue-400">{r.successRate}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Sample</p>
                      <p className="text-gray-300">{r.sampleSize} txns</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'timing' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Timing Signal Strength</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timingSignals}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="venue" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                  <Bar dataKey="strength" name="Signal Strength" radius={[4, 4, 0, 0]}>
                    {timingSignals.map((t, idx) => (
                      <Cell key={idx} fill={t.direction === 'migrate-in' ? '#10b981' : t.direction === 'migrate-out' ? '#ef4444' : '#f59e0b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {timingSignals.map(t => (
                <div key={t.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-200">{t.venue}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${directionColor(t.direction)}`}>{t.direction}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-400">Strength: {t.strength}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-200 mb-1">{t.signal}</p>
                  <p className="text-sm text-gray-400 mb-2">{t.reason}</p>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>Category: {t.category}</span>
                    <span>Valid until: {t.validUntil}</span>
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
