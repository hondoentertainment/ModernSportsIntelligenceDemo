import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import {
  ThumbsUp, Activity, ShoppingCart, History, AlertCircle, Eye,
  TrendingUp, Shield
} from 'lucide-react';
import {
  getSocialProofSignals, getProofPressures, getBuyingInfluences,
  getProofHistory, getSocialProofStats,
  type SocialProofSignal, type ProofPressure, type BuyingInfluence
} from '../lib/socialProofService.ts';

type TabId = 'live-pressure' | 'signal-map' | 'buying-influence' | 'history';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'live-pressure', label: 'Live Pressure', icon: <Activity size={18} /> },
  { id: 'signal-map', label: 'Signal Map', icon: <Eye size={18} /> },
  { id: 'buying-influence', label: 'Buying Influence', icon: <ShoppingCart size={18} /> },
  { id: 'history', label: 'History', icon: <History size={18} /> },
];

const SIGNAL_COLORS: Record<string, string> = {
  influencer_mention: '#8b5cf6',
  forum_hype: '#3b82f6',
  auction_frenzy: '#ef4444',
  social_media_trend: '#f59e0b',
  group_buy: '#10b981',
  celebrity_sighting: '#ec4899',
  news_coverage: '#06b6d4',
  community_poll: '#6366f1',
};

export default function SocialProofQuantifier() {
  const [activeTab, setActiveTab] = useState<TabId>('live-pressure');
  const signals = getSocialProofSignals();
  const pressures = getProofPressures();
  const influences = getBuyingInfluences();
  const history = getProofHistory();
  const stats = getSocialProofStats();

  const signalTypeData = Object.entries(
    signals.reduce<Record<string, number>>((acc, s) => {
      acc[s.signalType] = (acc[s.signalType] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value,
    fill: SIGNAL_COLORS[name] || '#6b7280',
  }));

  const influenceChartData = influences.map(inf => ({
    name: inf.category.length > 15 ? inf.category.slice(0, 15) + '...' : inf.category,
    pressure: inf.avgPressure,
    conversion: inf.conversionRate,
    premium: inf.avgPremiumPaid,
    regret: inf.regretRate,
  }));

  const activeSignals = signals.filter(s => s.status === 'active');

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <ThumbsUp className="text-amber-400" size={32} />
            Social Proof Quantifier
          </h1>
          <p className="text-gray-400">Measure social proof pressure on buying decisions</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <p className="text-gray-400 text-sm">Active Signals</p>
            <p className="text-2xl font-bold text-amber-400">{stats.activeSignals}</p>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <p className="text-gray-400 text-sm">Avg Pressure</p>
            <p className="text-2xl font-bold text-red-400">{stats.avgPressure}</p>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <p className="text-gray-400 text-sm">Total Reach</p>
            <p className="text-2xl font-bold text-blue-400">{(stats.totalReach / 1000000).toFixed(1)}M</p>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <p className="text-gray-400 text-sm">High Risk</p>
            <p className="text-2xl font-bold text-orange-400">{stats.highRiskCount}</p>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <p className="text-gray-400 text-sm">Avg Regret Rate</p>
            <p className="text-2xl font-bold text-purple-400">{stats.avgRegret}%</p>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <p className="text-gray-400 text-sm">Total Signals</p>
            <p className="text-2xl font-bold text-green-400">{stats.totalSignals}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-900 text-gray-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'live-pressure' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h3 className="text-lg font-semibold mb-4">Pressure by Card</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={pressures.map(p => ({ name: p.cardName.length > 20 ? p.cardName.slice(0, 20) + '...' : p.cardName, pressure: p.totalPressure, fakeRisk: p.fakeSignalRisk, surge: p.buyerSurge / 10 }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 9 }} angle={-15} textAnchor="end" height={60} />
                    <YAxis tick={{ fill: '#9ca3af' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="pressure" fill="#f59e0b" name="Pressure Score" />
                    <Bar dataKey="fakeRisk" fill="#ef4444" name="Fake Signal Risk" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h3 className="text-lg font-semibold mb-4">Signal Type Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={signalTypeData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {signalTypeData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pressures.map(p => (
                <div key={p.id} className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">{p.cardName}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      p.recommendation === 'buy' ? 'bg-green-900/50 text-green-400' :
                      p.recommendation === 'wait' ? 'bg-yellow-900/50 text-yellow-400' :
                      'bg-red-900/50 text-red-400'
                    }`}>
                      {p.recommendation.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div><span className="text-gray-500">Pressure:</span> <span className="text-amber-400 font-bold">{p.totalPressure}</span></div>
                    <div><span className="text-gray-500">Impact:</span> <span className="text-blue-400">+{p.priceImpact}%</span></div>
                    <div><span className="text-gray-500">Fake Risk:</span> <span className={p.fakeSignalRisk > 30 ? 'text-red-400' : 'text-green-400'}>{p.fakeSignalRisk}%</span></div>
                  </div>
                  <div className="mt-2 w-full bg-slate-800 rounded-full h-2">
                    <div className={`h-2 rounded-full ${p.totalPressure > 80 ? 'bg-red-500' : p.totalPressure > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${p.totalPressure}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'signal-map' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSignals.map(signal => (
                <div key={signal.id} className="bg-slate-900 rounded-xl p-4 border border-slate-800 hover:border-amber-500 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: `${SIGNAL_COLORS[signal.signalType]}20`, color: SIGNAL_COLORS[signal.signalType] }}>
                      {signal.signalType.replace(/_/g, ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      signal.status === 'active' ? 'bg-green-900/50 text-green-400' :
                      signal.status === 'fading' ? 'bg-yellow-900/50 text-yellow-400' :
                      'bg-gray-800 text-gray-500'
                    }`}>
                      {signal.status}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{signal.playerName}</h4>
                  <p className="text-xs text-gray-400 mb-2">{signal.source}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">Pressure:</span> <span className="text-amber-400 font-bold">{signal.pressureScore}</span></div>
                    <div><span className="text-gray-500">Reach:</span> <span className="text-blue-400">{signal.reach > 1000000 ? (signal.reach / 1000000).toFixed(1) + 'M' : (signal.reach / 1000).toFixed(0) + 'K'}</span></div>
                  </div>
                  <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${signal.pressureScore}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'buying-influence' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h3 className="text-lg font-semibold mb-4">Buying Influence by Category</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={influenceChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="pressure" fill="#f59e0b" name="Avg Pressure" />
                  <Bar dataKey="conversion" fill="#10b981" name="Conversion %" />
                  <Bar dataKey="premium" fill="#3b82f6" name="Avg Premium Paid %" />
                  <Bar dataKey="regret" fill="#ef4444" name="Regret Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h3 className="text-lg font-semibold mb-4">Detailed Influence Metrics</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-slate-700">
                      <th className="text-left py-3 px-2">Category</th>
                      <th className="text-right py-3 px-2">Pressure</th>
                      <th className="text-right py-3 px-2">Conversion</th>
                      <th className="text-right py-3 px-2">Premium</th>
                      <th className="text-right py-3 px-2">Regret Rate</th>
                      <th className="text-right py-3 px-2">Days to Regret</th>
                      <th className="text-right py-3 px-2">Sample Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {influences.map(inf => (
                      <tr key={inf.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="py-3 px-2 font-medium">{inf.category}</td>
                        <td className="py-3 px-2 text-right text-amber-400">{inf.avgPressure}</td>
                        <td className="py-3 px-2 text-right text-green-400">{inf.conversionRate}%</td>
                        <td className="py-3 px-2 text-right text-blue-400">{inf.avgPremiumPaid}%</td>
                        <td className="py-3 px-2 text-right text-red-400">{inf.regretRate}%</td>
                        <td className="py-3 px-2 text-right text-purple-400">{inf.timeToRegret}d</td>
                        <td className="py-3 px-2 text-right text-gray-400">{inf.sampleSize.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h3 className="text-lg font-semibold mb-4">Historical Social Proof Events</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={history.map(h => ({
                  name: h.cardName.length > 20 ? h.cardName.slice(0, 20) + '...' : h.cardName,
                  peakPressure: h.peakPressure,
                  priceAtPeak: h.priceAtPeak / 100,
                  priceNow: h.priceNow / 100,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="peakPressure" fill="#f59e0b" name="Peak Pressure" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {history.map(h => (
              <div key={h.id} className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{h.cardName}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    h.outcome === 'profitable' ? 'bg-green-900/50 text-green-400' :
                    h.outcome === 'break_even' ? 'bg-yellow-900/50 text-yellow-400' :
                    'bg-red-900/50 text-red-400'
                  }`}>
                    {h.outcome.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                  <div><span className="text-gray-500">Peak Pressure:</span> <span className="text-amber-400">{h.peakPressure}</span></div>
                  <div><span className="text-gray-500">Price at Peak:</span> <span className="text-white">${h.priceAtPeak.toLocaleString()}</span></div>
                  <div><span className="text-gray-500">Price Now:</span> <span className={h.priceNow > h.priceAtPeak ? 'text-green-400' : 'text-red-400'}>${h.priceNow.toLocaleString()}</span></div>
                  <div><span className="text-gray-500">Change:</span> <span className={h.priceNow > h.priceAtPeak ? 'text-green-400' : 'text-red-400'}>{((h.priceNow - h.priceAtPeak) / h.priceAtPeak * 100).toFixed(1)}%</span></div>
                </div>
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-sm text-gray-300"><Shield size={14} className="inline mr-2 text-amber-400" />{h.lessonsLearned}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
