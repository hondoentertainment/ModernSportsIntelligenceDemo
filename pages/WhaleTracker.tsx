import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import {
  Anchor, Eye, Map, Bell, UserCircle, TrendingUp, TrendingDown,
  DollarSign, Activity, Shield
} from 'lucide-react';
import {
  getWhaleActivities, getAccumulationPatterns, getWhaleProfiles,
  getWhaleHistory, getWhaleStats,
  type WhaleActivity, type AccumulationPattern, type WhaleProfile
} from '../lib/whaleTrackerService.ts';

type TabId = 'whale-watch' | 'accumulation' | 'distribution' | 'profiles';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'whale-watch', label: 'Whale Watch', icon: <Eye size={18} /> },
  { id: 'accumulation', label: 'Accumulation Map', icon: <Map size={18} /> },
  { id: 'distribution', label: 'Distribution Alerts', icon: <Bell size={18} /> },
  { id: 'profiles', label: 'Profiles', icon: <UserCircle size={18} /> },
];

const TIER_COLORS: Record<string, string> = {
  mega: '#f59e0b',
  major: '#8b5cf6',
  mid: '#3b82f6',
  emerging: '#10b981',
};

const PIE_COLORS = ['#f59e0b', '#8b5cf6', '#3b82f6', '#10b981', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];

export default function WhaleTracker() {
  const [activeTab, setActiveTab] = useState<TabId>('whale-watch');
  const activities = getWhaleActivities();
  const patterns = getAccumulationPatterns();
  const profiles = getWhaleProfiles();
  const history = getWhaleHistory();
  const stats = getWhaleStats();

  const portfolioData = profiles.map(p => ({
    name: p.alias,
    value: p.estimatedPortfolioValue,
  }));

  const historyChartData = history.filter(h => h.whaleId === 'wp1').map(h => ({
    month: h.month,
    buys: h.totalBuys / 1000,
    sells: h.totalSells / 1000,
    netFlow: h.netFlow / 1000,
  }));

  const patternChartData = patterns.filter(p => p.patternType !== 'distribution').map(p => ({
    name: p.whaleName.length > 14 ? p.whaleName.slice(0, 14) + '...' : p.whaleName,
    spent: p.totalSpent / 1000,
    impact: p.priceImpact,
    completion: p.completionEstimate,
  }));

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Anchor className="text-blue-400" size={32} />
            Whale Tracker
          </h1>
          <p className="text-gray-400">Track large collector movements and accumulation/distribution patterns</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Portfolio Value</p>
            <p className="text-2xl font-bold text-blue-400">${(stats.totalPortfolioValue / 1000000).toFixed(1)}M</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Active Whales</p>
            <p className="text-2xl font-bold text-purple-400">{stats.activeWhales}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Mega Whales</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.megaWhales}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">High Significance</p>
            <p className="text-2xl font-bold text-red-400">{stats.recentActivities}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Net Accumulation</p>
            <p className="text-2xl font-bold text-green-400">${(stats.netAccumulation / 1000).toFixed(0)}K</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Avg Win Rate</p>
            <p className="text-2xl font-bold text-cyan-400">{stats.avgWinRate}%</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'whale-watch' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Whale Portfolio Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={portfolioData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name.slice(0, 12)} ${(percent * 100).toFixed(0)}%`}>
                      {portfolioData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} formatter={(value: number) => `$${(value / 1000000).toFixed(1)}M`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold mb-4">GOAT Collector Monthly Flow ($K)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={historyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" tick={{ fill: '#9ca3af' }} />
                    <YAxis tick={{ fill: '#9ca3af' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="buys" fill="#10b981" name="Buys ($K)" />
                    <Bar dataKey="sells" fill="#ef4444" name="Sells ($K)" />
                    <Bar dataKey="netFlow" fill="#3b82f6" name="Net Flow ($K)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Recent Whale Activity</h3>
              <div className="space-y-3">
                {activities.map(act => (
                  <div key={act.id} className={`flex items-center gap-4 p-3 rounded-lg border ${
                    act.significance === 'critical' ? 'bg-red-950/20 border-red-800' :
                    act.significance === 'high' ? 'bg-orange-950/20 border-orange-800' :
                    'bg-gray-800/50 border-gray-700'
                  }`}>
                    <div className={`p-2 rounded-lg ${
                      act.activityType === 'accumulation' ? 'bg-green-900/50' :
                      act.activityType === 'distribution' ? 'bg-red-900/50' :
                      'bg-blue-900/50'
                    }`}>
                      {act.activityType === 'accumulation' ? <TrendingUp size={18} className="text-green-400" /> :
                       act.activityType === 'distribution' ? <TrendingDown size={18} className="text-red-400" /> :
                       <Activity size={18} className="text-blue-400" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{act.whaleName}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          act.activityType === 'accumulation' ? 'bg-green-900/50 text-green-400' :
                          act.activityType === 'distribution' ? 'bg-red-900/50 text-red-400' :
                          'bg-blue-900/50 text-blue-400'
                        }`}>
                          {act.activityType}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{act.cardName}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-white font-medium">${act.estimatedValue.toLocaleString()}</p>
                      <p className="text-gray-500">Qty: {act.quantity} | {act.platform}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'accumulation' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Accumulation Patterns</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={patternChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="spent" fill="#3b82f6" name="Total Spent ($K)" />
                  <Bar dataKey="impact" fill="#10b981" name="Price Impact %" />
                  <Bar dataKey="completion" fill="#f59e0b" name="Completion %" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patterns.map(p => (
                <div key={p.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{p.whaleName}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      p.patternType === 'aggressive_buying' ? 'bg-red-900/50 text-red-400' :
                      p.patternType === 'steady_accumulation' ? 'bg-green-900/50 text-green-400' :
                      p.patternType === 'dip_buying' ? 'bg-blue-900/50 text-blue-400' :
                      p.patternType === 'distribution' ? 'bg-orange-900/50 text-orange-400' :
                      'bg-purple-900/50 text-purple-400'
                    }`}>
                      {p.patternType.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{p.targetCard}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">Acquired:</span> <span className="text-white">{p.totalAcquired}</span></div>
                    <div><span className="text-gray-500">Spent:</span> <span className="text-green-400">${p.totalSpent.toLocaleString()}</span></div>
                    <div><span className="text-gray-500">Avg Price:</span> <span className="text-blue-400">${p.avgPrice.toLocaleString()}</span></div>
                    <div><span className="text-gray-500">Impact:</span> <span className={p.priceImpact > 0 ? 'text-green-400' : 'text-red-400'}>{p.priceImpact > 0 ? '+' : ''}{p.priceImpact}%</span></div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Completion</span>
                      <span>{p.completionEstimate}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${p.completionEstimate}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'distribution' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Distribution Alerts</h3>
              <div className="space-y-3">
                {activities.filter(a => a.activityType === 'distribution').map(act => (
                  <div key={act.id} className="p-4 rounded-lg bg-red-950/20 border border-red-800">
                    <div className="flex items-start gap-3">
                      <Bell size={20} className="text-red-400 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold">{act.whaleName}</span>
                          <span className="text-red-400 font-bold">${act.estimatedValue.toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-300 mb-2">{act.cardName}</p>
                        <div className="flex gap-4 text-xs text-gray-400">
                          <span>Qty: {act.quantity}</span>
                          <span>Platform: {act.platform}</span>
                          <span>Confidence: {act.confidence}%</span>
                          <span>Date: {act.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Distribution vs Accumulation Flow</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={history.map(h => ({
                  name: `${h.whaleId.slice(2)}-${h.month.slice(5)}`,
                  buys: h.totalBuys / 1000,
                  sells: -h.totalSells / 1000,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="buys" fill="#10b981" name="Buys ($K)" />
                  <Bar dataKey="sells" fill="#ef4444" name="Sells ($K)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'profiles' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profiles.map(p => (
                <div key={p.id} className="bg-gray-900 rounded-xl p-5 border border-gray-800 hover:border-blue-500 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold" style={{ backgroundColor: `${TIER_COLORS[p.tier]}20`, color: TIER_COLORS[p.tier] }}>
                        {p.alias.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold">{p.alias}</h4>
                        <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: `${TIER_COLORS[p.tier]}20`, color: TIER_COLORS[p.tier] }}>
                          {p.tier.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-400">${(p.estimatedPortfolioValue / 1000000).toFixed(1)}M</p>
                      <p className="text-xs text-gray-500">Est. Portfolio</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{p.tradingStyle}</p>
                  <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                    <div><span className="text-gray-500">Win Rate:</span> <span className="text-green-400">{p.winRate}%</span></div>
                    <div><span className="text-gray-500">Avg Txn:</span> <span className="text-blue-400">${p.avgTransactionSize.toLocaleString()}</span></div>
                    <div><span className="text-gray-500">Hold:</span> <span className="text-purple-400">{p.avgHoldPeriod}d</span></div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {p.primaryFocus.map((f, i) => (
                      <span key={i} className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded">{f}</span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500">
                    Last seen: {p.lastSeen} | Frequency: {p.activityFrequency}
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
