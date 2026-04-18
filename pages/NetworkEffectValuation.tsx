import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
  Network, TrendingUp, Users, BarChart3, Layers, Zap,
  Globe, ArrowUpRight
} from 'lucide-react';
import {
  getNetworkMetrics, getNetworkPremiums, getCollectorDensities,
  getNetworkHistory, getNetworkStats,
  type NetworkMetric, type NetworkPremium, type CollectorDensity
} from '../lib/networkEffectService.ts';

type TabId = 'network-map' | 'premium' | 'density' | 'growth';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'network-map', label: 'Network Map', icon: <Network size={18} /> },
  { id: 'premium', label: 'Premium Analysis', icon: <TrendingUp size={18} /> },
  { id: 'density', label: 'Density Scores', icon: <Users size={18} /> },
  { id: 'growth', label: 'Growth', icon: <ArrowUpRight size={18} /> },
];

export default function NetworkEffectValuation() {
  const [activeTab, setActiveTab] = useState<TabId>('network-map');
  const metrics = getNetworkMetrics();
  const premiums = getNetworkPremiums();
  const densities = getCollectorDensities();
  const history = getNetworkHistory();
  const stats = getNetworkStats();

  const networkChartData = metrics.map(m => ({
    name: m.playerName,
    networkScore: m.networkScore,
    premium: m.networkPremium,
    growth: m.growthVelocity,
    collectors: m.collectorCount / 1000,
  }));

  const premiumChartData = premiums.map(p => ({
    name: p.factor.length > 18 ? p.factor.slice(0, 18) + '...' : p.factor,
    premium: p.premiumPercent,
    reliability: p.reliability,
    avgImpact: p.avgImpact,
  }));

  const radarData = densities.map(d => ({
    name: d.playerName.length > 10 ? d.playerName.slice(0, 10) : d.playerName,
    density: d.densityScore,
    liquidity: d.liquidityRating,
    concentration: 100 - d.concentrationRisk,
    geographic: d.geographicSpread,
  }));

  const wembyHistory = history.filter(h => h.cardName.includes('Wembanyama'));
  const zionHistory = history.filter(h => h.cardName.includes('Zion'));

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Network className="text-indigo-400" size={32} />
            Network Effect Valuation
          </h1>
          <p className="text-gray-400">Value cards based on community network effects and collector density</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Avg Network Score</p>
            <p className="text-2xl font-bold text-indigo-400">{stats.avgNetworkScore}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Avg Premium</p>
            <p className="text-2xl font-bold text-green-400">{stats.avgPremium}%</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Total Collectors</p>
            <p className="text-2xl font-bold text-blue-400">{(stats.totalCollectors / 1000).toFixed(0)}K</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Active Traders</p>
            <p className="text-2xl font-bold text-purple-400">{(stats.totalActiveTraders / 1000).toFixed(0)}K</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Avg Growth</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.avgGrowth}%</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Cards Tracked</p>
            <p className="text-2xl font-bold text-cyan-400">{stats.cardsTracked}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'network-map' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Network Score vs Premium by Card</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={networkChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="networkScore" fill="#6366f1" name="Network Score" />
                  <Bar dataKey="premium" fill="#10b981" name="Premium %" />
                  <Bar dataKey="collectors" fill="#3b82f6" name="Collectors (K)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.map(m => (
                <div key={m.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-indigo-500 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">{m.playerName}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      m.networkScore >= 90 ? 'bg-green-900/50 text-green-400' :
                      m.networkScore >= 75 ? 'bg-blue-900/50 text-blue-400' :
                      m.networkScore >= 60 ? 'bg-yellow-900/50 text-yellow-400' :
                      'bg-red-900/50 text-red-400'
                    }`}>
                      Score: {m.networkScore}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{m.cardName}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">Base:</span> <span className="text-white">${m.baseValue.toLocaleString()}</span></div>
                    <div><span className="text-gray-500">Adjusted:</span> <span className="text-indigo-400">${m.networkAdjustedValue.toLocaleString()}</span></div>
                    <div><span className="text-gray-500">Premium:</span> <span className={m.networkPremium >= 0 ? 'text-green-400' : 'text-red-400'}>{m.networkPremium > 0 ? '+' : ''}{m.networkPremium}%</span></div>
                    <div><span className="text-gray-500">Growth:</span> <span className={m.growthVelocity > 0 ? 'text-green-400' : 'text-red-400'}>{m.growthVelocity > 0 ? '+' : ''}{m.growthVelocity}%</span></div>
                  </div>
                  <div className="mt-3 flex gap-2 text-xs text-gray-500">
                    <span><Users size={12} className="inline" /> {m.collectorCount.toLocaleString()} collectors</span>
                    <span><Globe size={12} className="inline" /> {m.communitySize.toLocaleString()} community</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'premium' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Network Premium Factors</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={premiumChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" tick={{ fill: '#9ca3af' }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#9ca3af', fontSize: 11 }} width={160} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="premium" fill="#6366f1" name="Premium %" />
                  <Bar dataKey="reliability" fill="#10b981" name="Reliability %" />
                  <Bar dataKey="avgImpact" fill="#f59e0b" name="Avg Impact %" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {premiums.map(p => (
                <div key={p.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{p.factor}</h4>
                    <span className={`px-2 py-1 rounded text-xs ${
                      p.trend === 'increasing' ? 'bg-green-900/50 text-green-400' :
                      p.trend === 'stable' ? 'bg-blue-900/50 text-blue-400' :
                      'bg-red-900/50 text-red-400'
                    }`}>
                      {p.trend}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{p.description}</p>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div><span className="text-gray-500">Premium:</span> <span className={p.premiumPercent >= 0 ? 'text-green-400' : 'text-red-400'}>{p.premiumPercent > 0 ? '+' : ''}{p.premiumPercent}%</span></div>
                    <div><span className="text-gray-500">Cards:</span> <span className="text-blue-400">{p.applicableCards}%</span></div>
                    <div><span className="text-gray-500">Reliability:</span> <span className="text-purple-400">{p.reliability}%</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'density' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Collector Density Radar</h3>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <PolarRadiusAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <Radar name="Density" dataKey="density" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                  <Radar name="Liquidity" dataKey="liquidity" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                  <Radar name="Safety (100 - Risk)" dataKey="concentration" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                  <Legend />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {densities.map(d => (
                <div key={d.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                  <h4 className="font-semibold mb-2">{d.playerName} - {d.cardName}</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div><span className="text-gray-500">Total Collectors:</span> <span className="text-white">{d.totalCollectors.toLocaleString()}</span></div>
                    <div><span className="text-gray-500">Active:</span> <span className="text-green-400">{d.activeCollectors.toLocaleString()}</span></div>
                    <div><span className="text-gray-500">Casual:</span> <span className="text-blue-400">{d.casualCollectors.toLocaleString()}</span></div>
                    <div><span className="text-gray-500">Investors:</span> <span className="text-purple-400">{d.investorCollectors.toLocaleString()}</span></div>
                    <div><span className="text-gray-500">Density Score:</span> <span className="text-indigo-400 font-bold">{d.densityScore}</span></div>
                    <div><span className="text-gray-500">Liquidity:</span> <span className="text-cyan-400">{d.liquidityRating}</span></div>
                    <div><span className="text-gray-500">Concentration Risk:</span> <span className={d.concentrationRisk > 40 ? 'text-red-400' : 'text-green-400'}>{d.concentrationRisk}%</span></div>
                    <div><span className="text-gray-500">Geographic:</span> <span className="text-yellow-400">{d.geographicSpread}%</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'growth' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Wembanyama - Network Growth Trajectory</h3>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={wembyHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af' }} />
                  <YAxis yAxisId="left" tick={{ fill: '#9ca3af' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="networkScore" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} name="Network Score" />
                  <Area yAxisId="left" type="monotone" dataKey="premiumPercent" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Premium %" />
                  <Line yAxisId="right" type="monotone" dataKey="collectorCount" stroke="#f59e0b" name="Collectors" strokeWidth={2} dot={{ r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Zion - Network Decline Trajectory</h3>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={zionHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af' }} />
                  <YAxis yAxisId="left" tick={{ fill: '#9ca3af' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="networkScore" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="Network Score" />
                  <Area yAxisId="left" type="monotone" dataKey="premiumPercent" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} name="Premium %" />
                  <Line yAxisId="right" type="monotone" dataKey="collectorCount" stroke="#3b82f6" name="Collectors" strokeWidth={2} dot={{ r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Growth Velocity Rankings</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={metrics.sort((a, b) => b.growthVelocity - a.growthVelocity).map(m => ({
                  name: m.playerName,
                  growth: m.growthVelocity,
                  score: m.networkScore,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="growth" fill="#10b981" name="Growth Velocity %" />
                  <Bar dataKey="score" fill="#6366f1" name="Network Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
