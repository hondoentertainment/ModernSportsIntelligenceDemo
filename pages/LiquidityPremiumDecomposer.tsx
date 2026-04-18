import React, { useState } from 'react';
import {
  Droplets, DollarSign, Layers, BarChart3, TrendingUp,
  Activity, History, ArrowUpDown, Globe, Gauge
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import {
  getLiquidityPremiums, getPremiumDecompositions, getLiquidityScores,
  getPremiumHistory, getAvgLiquidityPremium, getHighestPremiumCard,
  getAvgLiquidityScore, getUltraLiquidCount
} from '../lib/liquidityPremiumService.ts';

const TABS = [
  { id: 'map', label: 'Premium Map', icon: <Droplets className="w-4 h-4" /> },
  { id: 'decomposition', label: 'Decomposition', icon: <Layers className="w-4 h-4" /> },
  { id: 'scores', label: 'Liquidity Scores', icon: <Gauge className="w-4 h-4" /> },
  { id: 'crossvenue', label: 'Cross-Venue', icon: <Globe className="w-4 h-4" /> },
] as const;

const PIE_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const TIER_STYLES: Record<string, string> = {
  'ultra-liquid': 'bg-emerald-500/20 text-emerald-400',
  'liquid': 'bg-blue-500/20 text-blue-400',
  'moderate': 'bg-amber-500/20 text-amber-400',
  'illiquid': 'bg-orange-500/20 text-orange-400',
  'frozen': 'bg-red-500/20 text-red-400',
};

export default function LiquidityPremiumDecomposer() {
  const [activeTab, setActiveTab] = useState<string>('map');
  const [selectedCard, setSelectedCard] = useState<number>(0);

  const premiums = getLiquidityPremiums();
  const decompositions = getPremiumDecompositions();
  const scores = getLiquidityScores();
  const history = getPremiumHistory();

  const stats = [
    { label: 'Avg Liquidity Premium', value: `${getAvgLiquidityPremium()}%`, icon: <Droplets className="w-5 h-5" />, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Highest Premium', value: getHighestPremiumCard(), icon: <TrendingUp className="w-5 h-5" />, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Avg Liquidity Score', value: getAvgLiquidityScore(), icon: <Gauge className="w-5 h-5" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Ultra-Liquid Cards', value: getUltraLiquidCount(), icon: <Activity className="w-5 h-5" />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20">
            <Droplets className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Liquidity Premium Decomposer</h1>
            <p className="text-sm text-gray-400">Separate liquidity premium from fundamental value in card pricing</p>
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
                activeTab === tab.id ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}>{tab.icon}{tab.label}</button>
          ))}
        </div>

        {activeTab === 'map' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Liquidity Premium % by Card</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={premiums.map(p => ({
                  name: p.player,
                  premium: p.liquidityPremiumPct,
                  score: p.liquidityScore,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-25} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="premium" name="Liquidity Premium %" radius={[4, 4, 0, 0]}>
                    {premiums.map((p, i) => (
                      <Cell key={i} fill={p.liquidityPremiumPct > 15 ? '#ef4444' : p.liquidityPremiumPct > 10 ? '#f59e0b' : '#10b981'} />
                    ))}
                  </Bar>
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Premium Trend Over Time</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="avgLiquidityPremiumPct" name="Avg Premium %" stroke="#06b6d4" strokeWidth={2} />
                  <Line type="monotone" dataKey="medianPremiumPct" name="Median Premium %" stroke="#8b5cf6" strokeWidth={2} />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800"><h3 className="text-sm font-semibold text-gray-300">All Cards - Liquidity Premium Detail</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-800">
                    <th className="text-left p-3 text-gray-500 font-medium">Card</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Market Price</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Fundamental</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Liq. Premium</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Premium %</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Liq. Score</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Days to Sell</th>
                  </tr></thead>
                  <tbody>
                    {premiums.map(p => (
                      <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="p-3"><div className="text-white text-xs">{p.player}</div><div className="text-gray-500 text-xs">{p.grade} - {p.venue}</div></td>
                        <td className="p-3 text-right font-mono text-white text-xs">${p.marketPrice.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono text-gray-400 text-xs">${p.fundamentalValue.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono text-cyan-400 text-xs">${p.liquidityPremium.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono text-xs"><span className={p.liquidityPremiumPct > 15 ? 'text-red-400' : p.liquidityPremiumPct > 10 ? 'text-amber-400' : 'text-emerald-400'}>{p.liquidityPremiumPct}%</span></td>
                        <td className="p-3 text-right font-mono text-violet-400 text-xs">{p.liquidityScore}</td>
                        <td className="p-3 text-right font-mono text-gray-300 text-xs">{p.avgDaysToSell}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'decomposition' && (
          <div className="space-y-6">
            <div className="flex gap-2 flex-wrap">
              {decompositions.map((d, i) => (
                <button key={d.cardId} onClick={() => setSelectedCard(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCard === i ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}>{d.cardName.substring(0, 25)}...</button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Price Decomposition</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={decompositions[selectedCard].components}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      label={({ name, pct }) => `${name}: ${pct}%`}
                    >
                      {decompositions[selectedCard].components.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} formatter={(v: number) => `$${v.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Component Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={decompositions[selectedCard].components} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={90} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} formatter={(v: number) => `$${v.toLocaleString()}`} />
                    <Bar dataKey="value" name="Value ($)" radius={[0, 4, 4, 0]}>
                      {decompositions[selectedCard].components.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">All Cards - Stacked Decomposition</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={decompositions.map(d => ({
                  name: d.cardName.substring(0, 20),
                  Fundamental: d.fundamentalValue,
                  Liquidity: d.liquidityPremium,
                  Scarcity: d.scarcityPremium,
                  Narrative: d.narrativePremium,
                  Grade: d.gradePremium,
                  Venue: d.venuePremium,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 9 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} formatter={(v: number) => `$${v.toLocaleString()}`} />
                  <Bar dataKey="Fundamental" stackId="a" fill="#6366f1" />
                  <Bar dataKey="Liquidity" stackId="a" fill="#06b6d4" />
                  <Bar dataKey="Scarcity" stackId="a" fill="#10b981" />
                  <Bar dataKey="Narrative" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="Grade" stackId="a" fill="#8b5cf6" />
                  <Bar dataKey="Venue" stackId="a" fill="#ec4899" />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'scores' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Liquidity Score Components</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={scores.slice(0, 10).map(s => ({
                  name: s.player,
                  volume: s.volumeScore,
                  spread: s.spreadScore,
                  depth: s.depthScore,
                  velocity: s.velocityScore,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="volume" name="Volume" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="spread" name="Spread" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="depth" name="Depth" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="velocity" name="Velocity" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800"><h3 className="text-sm font-semibold text-gray-300">Full Liquidity Scores</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-800">
                    <th className="text-left p-3 text-gray-500 font-medium">Card</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Overall</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Volume</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Spread</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Depth</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Velocity</th>
                    <th className="text-center p-3 text-gray-500 font-medium">Tier</th>
                    <th className="text-center p-3 text-gray-500 font-medium">Trend</th>
                  </tr></thead>
                  <tbody>
                    {scores.map(s => (
                      <tr key={s.cardId} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="p-3 text-white text-xs">{s.player}</td>
                        <td className="p-3 text-right font-mono text-white text-xs">{s.overallScore}</td>
                        <td className="p-3 text-right font-mono text-violet-400 text-xs">{s.volumeScore}</td>
                        <td className="p-3 text-right font-mono text-cyan-400 text-xs">{s.spreadScore}</td>
                        <td className="p-3 text-right font-mono text-emerald-400 text-xs">{s.depthScore}</td>
                        <td className="p-3 text-right font-mono text-amber-400 text-xs">{s.velocityScore}</td>
                        <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TIER_STYLES[s.tier]}`}>{s.tier}</span></td>
                        <td className="p-3 text-center text-xs">
                          <span className={s.trend === 'improving' ? 'text-emerald-400' : s.trend === 'stable' ? 'text-gray-400' : 'text-red-400'}>{s.trend}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'crossvenue' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Avg Days to Sell & Spread Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="avgDaysToSell" name="Avg Days to Sell" stroke="#ef4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="avgSpread" name="Avg Spread %" stroke="#06b6d4" strokeWidth={2} />
                    <Legend />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Volume vs Premium Dispersion</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="totalVolume" name="Total Volume" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                    <Legend />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Premium by Venue</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={['eBay', 'PWCC', 'Goldin', 'Heritage'].map(v => {
                  const venueCards = premiums.filter(p => p.venue === v);
                  return {
                    venue: v,
                    avgPremium: venueCards.length ? Math.round(venueCards.reduce((s, c) => s + c.liquidityPremiumPct, 0) / venueCards.length * 10) / 10 : 0,
                    avgScore: venueCards.length ? Math.round(venueCards.reduce((s, c) => s + c.liquidityScore, 0) / venueCards.length) : 0,
                    count: venueCards.length,
                  };
                })}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="venue" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="avgPremium" name="Avg Premium %" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avgScore" name="Avg Liquidity Score" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
