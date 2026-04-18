import React, { useState } from 'react';
import {
  Network, Map, BarChart3, ArrowRightLeft, TrendingUp, Layers,
  Globe, Split, DollarSign, Activity
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
  getVenueFragments, getFragmentationScores, getPriceDispersals, getVenueFlows,
  getTotalVenues, getAvgFragmentation, getArbitrageCount, getTopVenue
} from '../lib/marketFragmentationService.ts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

export default function MarketFragmentationMapper() {
  const [activeTab, setActiveTab] = useState<'map' | 'dispersal' | 'flow' | 'concentration'>('map');
  const venues = getVenueFragments();
  const fragScores = getFragmentationScores();
  const dispersals = getPriceDispersals();
  const flows = getVenueFlows();
  const totalVenues = getTotalVenues();
  const avgFrag = getAvgFragmentation();
  const arbCount = getArbitrageCount();
  const topVenue = getTopVenue();

  const tabs = [
    { key: 'map' as const, label: 'Fragmentation Map', icon: <Map size={16} /> },
    { key: 'dispersal' as const, label: 'Price Dispersal', icon: <Split size={16} /> },
    { key: 'flow' as const, label: 'Venue Flow', icon: <ArrowRightLeft size={16} /> },
    { key: 'concentration' as const, label: 'Concentration', icon: <Layers size={16} /> },
  ];

  const fragLevelColor = (level: string) => {
    switch (level) {
      case 'extreme': return 'text-red-400 bg-red-400/10';
      case 'high': return 'text-orange-400 bg-orange-400/10';
      case 'moderate': return 'text-yellow-400 bg-yellow-400/10';
      case 'low': return 'text-green-400 bg-green-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const marketShareData = venues.map(v => ({ name: v.venue, value: v.marketShare }));

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/20 rounded-xl">
            <Network size={28} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Market Fragmentation Mapper</h1>
            <p className="text-sm text-gray-400">Cross-venue fragmentation impact analysis on card pricing</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Active Venues</span>
              <Globe size={18} className="text-cyan-400" />
            </div>
            <p className="text-2xl font-bold text-cyan-400">{totalVenues}</p>
            <p className="text-xs text-gray-500 mt-1">Tracked marketplaces</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Avg HHI</span>
              <Activity size={18} className="text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-yellow-400">{avgFrag}</p>
            <p className="text-xs text-gray-500 mt-1">Herfindahl-Hirschman Index</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Arbitrage Opportunities</span>
              <DollarSign size={18} className="text-green-400" />
            </div>
            <p className="text-2xl font-bold text-green-400">{arbCount}</p>
            <p className="text-xs text-gray-500 mt-1">Cross-venue price gaps</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Top Venue</span>
              <TrendingUp size={18} className="text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-400">{topVenue}</p>
            <p className="text-xs text-gray-500 mt-1">Largest market share</p>
          </div>
        </div>

        <div className="flex gap-2 border-b border-gray-800 pb-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'map' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Market Share by Venue</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={marketShareData} cx="50%" cy="50%" innerRadius={60} outerRadius={110} dataKey="value" label={({ name, value }: { name: string; value: number }) => `${name}: ${value}%`}>
                      {marketShareData.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Venue Comparison - Volume & Fees</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={venues}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="venue" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                    <Legend />
                    <Bar dataKey="feeStructure" fill="#ef4444" name="Fee %" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avgDaysToSell" fill="#3b82f6" name="Avg Days to Sell" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Fragmentation by Category</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-800">
                      <th className="text-left py-3 px-2">Category</th>
                      <th className="text-right py-3 px-2">HHI</th>
                      <th className="text-right py-3 px-2">Venues</th>
                      <th className="text-right py-3 px-2">Price Dispersion</th>
                      <th className="text-right py-3 px-2">Liquidity</th>
                      <th className="text-center py-3 px-2">Level</th>
                      <th className="text-center py-3 px-2">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fragScores.map(f => (
                      <tr key={f.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="py-3 px-2 font-medium text-gray-200">{f.category}</td>
                        <td className="py-3 px-2 text-right text-gray-300">{f.herfindahlIndex.toFixed(2)}</td>
                        <td className="py-3 px-2 text-right text-gray-300">{f.venueCount}</td>
                        <td className="py-3 px-2 text-right text-yellow-400">{f.priceDispersion}%</td>
                        <td className="py-3 px-2 text-right text-blue-400">{f.liquidityScore}</td>
                        <td className="py-3 px-2 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${fragLevelColor(f.fragmentationLevel)}`}>{f.fragmentationLevel}</span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={f.trend === 'fragmenting' ? 'text-red-400' : f.trend === 'consolidating' ? 'text-green-400' : 'text-gray-400'}>{f.trend}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dispersal' && (
          <div className="space-y-6">
            {dispersals.map(d => (
              <div key={d.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-200">{d.cardName}</h3>
                    <p className="text-sm text-gray-400">{d.player} | Avg: ${d.avgPrice.toLocaleString()} | Max Spread: {d.maxSpread}%</p>
                  </div>
                  {d.arbitrageOpportunity && (
                    <span className="px-3 py-1 rounded-full text-xs text-green-400 bg-green-400/10 font-medium">Arbitrage Opportunity</span>
                  )}
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={d.venues}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="venue" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} formatter={(v: number) => [`$${v.toLocaleString()}`, '']} />
                    <Bar dataKey="price" radius={[4, 4, 0, 0]} name="Price">
                      {d.venues.map((v, idx) => (
                        <Cell key={idx} fill={v.spread > 10 ? '#ef4444' : v.spread < -2 ? '#10b981' : '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'flow' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Migration Volume Between Venues</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={flows}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="fromVenue" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                  <Legend />
                  <Bar dataKey="migrationVolume" fill="#8b5cf6" name="Migration Volume" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avgValueMigrated" fill="#06b6d4" name="Avg Value ($)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flows.map(f => (
                <div key={f.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-blue-400 font-medium">{f.fromVenue}</span>
                    <ArrowRightLeft size={16} className="text-gray-500" />
                    <span className="text-green-400 font-medium">{f.toVenue}</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{f.reason}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Volume</p>
                      <p className="text-gray-200 font-medium">{f.migrationVolume.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Avg Value</p>
                      <p className="text-yellow-400 font-medium">${f.avgValueMigrated}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'concentration' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Venue Performance Radar</h3>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={venues.slice(0, 6).map(v => ({
                  venue: v.venue,
                  marketShare: v.marketShare,
                  avgPrice: Math.min(v.avgSoldPrice / 50, 100),
                  speed: Math.max(0, 100 - v.avgDaysToSell * 4),
                  fees: 100 - v.feeStructure * 4,
                  buyers: Math.min(v.buyerBase / 50000, 100),
                }))}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="venue" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis stroke="#4b5563" />
                  <Radar name="Market Share" dataKey="marketShare" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                  <Radar name="Speed" dataKey="speed" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                  <Radar name="Low Fees" dataKey="fees" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Venue Details</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-800">
                      <th className="text-left py-3 px-2">Venue</th>
                      <th className="text-right py-3 px-2">Market Share</th>
                      <th className="text-right py-3 px-2">Avg Sold</th>
                      <th className="text-right py-3 px-2">Days to Sell</th>
                      <th className="text-right py-3 px-2">Fee %</th>
                      <th className="text-right py-3 px-2">Buyers</th>
                      <th className="text-left py-3 px-2">Specialty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {venues.map(v => (
                      <tr key={v.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="py-3 px-2 font-medium text-gray-200">{v.venue}</td>
                        <td className="py-3 px-2 text-right text-cyan-400">{v.marketShare}%</td>
                        <td className="py-3 px-2 text-right text-yellow-400">${v.avgSoldPrice.toLocaleString()}</td>
                        <td className="py-3 px-2 text-right text-gray-300">{v.avgDaysToSell}</td>
                        <td className="py-3 px-2 text-right text-red-400">{v.feeStructure}%</td>
                        <td className="py-3 px-2 text-right text-gray-300">{(v.buyerBase / 1000).toFixed(0)}K</td>
                        <td className="py-3 px-2 text-gray-400">{v.specialty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
