import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Radio, TrendingDown, BarChart3, Award, Clock, Eye, Zap, Users
} from 'lucide-react';
import {
  getInfluencerCalls, getDecayProfiles, getImpactMeasurements,
  getDecayHistory, getInfluencerStats,
  type InfluencerCall, type DecayProfile
} from '../lib/influencerDecayService.ts';

type TabId = 'active-calls' | 'decay-curves' | 'impact' | 'ranking';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'active-calls', label: 'Active Calls', icon: <Radio size={18} /> },
  { id: 'decay-curves', label: 'Decay Curves', icon: <TrendingDown size={18} /> },
  { id: 'impact', label: 'Impact Measurement', icon: <BarChart3 size={18} /> },
  { id: 'ranking', label: 'Influencer Ranking', icon: <Award size={18} /> },
];

const CURVE_COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

export default function InfluencerDecayCurve() {
  const [activeTab, setActiveTab] = useState<TabId>('active-calls');
  const calls = getInfluencerCalls();
  const profiles = getDecayProfiles();
  const impacts = getImpactMeasurements();
  const decayHistory = getDecayHistory();
  const stats = getInfluencerStats();

  const callChartData = calls.slice(0, 8).map(c => ({
    name: c.influencerName.length > 12 ? c.influencerName.slice(0, 12) + '...' : c.influencerName,
    halfLife: c.halfLifeDays,
    decay: c.currentDecayPercent,
    engagement: c.engagementRate * 10,
  }));

  const impactChartData = impacts.map(im => ({
    name: `Call ${im.callId.slice(2)}`,
    priceChange: im.priceChange,
    volumeChange: im.volumeChange / 10,
    remaining: im.remainingImpact,
  }));

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Radio className="text-rose-400" size={32} />
            Influencer Decay Curve
          </h1>
          <p className="text-gray-400">Track diminishing impact of influencer calls over time</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Active Calls</p>
            <p className="text-2xl font-bold text-rose-400">{stats.totalCalls}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Avg Half-Life</p>
            <p className="text-2xl font-bold text-blue-400">{stats.avgHalfLife}d</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Avg Decay</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.avgDecay}%</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Total Views</p>
            <p className="text-2xl font-bold text-green-400">{(stats.totalViews / 1000000).toFixed(1)}M</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Avg Engagement</p>
            <p className="text-2xl font-bold text-purple-400">{stats.avgEngagement}%</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Profiles</p>
            <p className="text-2xl font-bold text-cyan-400">{stats.profileCount}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-rose-600 text-white'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'active-calls' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Call Half-Life vs Decay</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={callChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="halfLife" fill="#f43f5e" name="Half-Life (days)" />
                  <Bar dataKey="decay" fill="#6366f1" name="Current Decay %" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {calls.slice(0, 9).map(call => (
                <div key={call.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-rose-500 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">{call.influencerName}</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      call.callType === 'buy' ? 'bg-green-900/50 text-green-400' :
                      call.callType === 'sell' ? 'bg-red-900/50 text-red-400' :
                      'bg-yellow-900/50 text-yellow-400'
                    }`}>
                      {call.callType.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{call.cardName}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1"><Clock size={12} className="text-gray-500" /> <span className="text-gray-500">Half-life:</span> <span className="text-rose-400">{call.halfLifeDays}d</span></div>
                    <div className="flex items-center gap-1"><TrendingDown size={12} className="text-gray-500" /> <span className="text-gray-500">Decay:</span> <span className="text-yellow-400">{call.currentDecayPercent}%</span></div>
                    <div className="flex items-center gap-1"><Eye size={12} className="text-gray-500" /> <span className="text-gray-500">Views:</span> <span className="text-blue-400">{(call.totalViews / 1000).toFixed(0)}K</span></div>
                    <div className="flex items-center gap-1"><Zap size={12} className="text-gray-500" /> <span className="text-gray-500">Eng:</span> <span className="text-green-400">{call.engagementRate}%</span></div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-gray-500">{call.platform}</span>
                    <span className="text-gray-500">{call.callDate}</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${100 - call.currentDecayPercent}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{100 - call.currentDecayPercent}% impact remaining</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'decay-curves' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Decay Curves by Influencer Profile</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="day"
                    type="number"
                    tick={{ fill: '#9ca3af' }}
                    label={{ value: 'Days Since Call', position: 'insideBottom', offset: -5, fill: '#9ca3af' }}
                    allowDuplicatedCategory={false}
                  />
                  <YAxis tick={{ fill: '#9ca3af' }} label={{ value: 'Impact %', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                  <Legend />
                  {profiles.map((profile, idx) => (
                    <Line
                      key={profile.id}
                      data={profile.decayCurve}
                      dataKey="impactPercent"
                      name={profile.influencerName}
                      stroke={CURVE_COLORS[idx % CURVE_COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profiles.map((profile, idx) => (
                <div key={profile.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CURVE_COLORS[idx % CURVE_COLORS.length] }} />
                    <h4 className="font-semibold">{profile.influencerName}</h4>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{profile.category}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">Avg Half-Life:</span> <span className="text-rose-400">{profile.avgHalfLife}d</span></div>
                    <div><span className="text-gray-500">Peak Impact:</span> <span className="text-green-400">{profile.avgPeakImpact}%</span></div>
                    <div><span className="text-gray-500">Success Rate:</span> <span className="text-blue-400">{profile.successRate}%</span></div>
                    <div><span className="text-gray-500">Trust Score:</span> <span className="text-purple-400">{profile.trustScore}</span></div>
                    <div><span className="text-gray-500">Total Calls:</span> <span className="text-white">{profile.totalCalls}</span></div>
                    <div><span className="text-gray-500">Decay Rate:</span> <span className="text-yellow-400">{profile.avgDecayRate}%/d</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'impact' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Impact Measurements</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={impactChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af' }} />
                  <YAxis tick={{ fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="priceChange" fill="#10b981" name="Price Change %" />
                  <Bar dataKey="remaining" fill="#f43f5e" name="Remaining Impact %" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Credibility Trend Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={decayHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af' }} />
                  <YAxis tick={{ fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                  <Legend />
                  <Line dataKey="avgPriceImpact" stroke="#8b5cf6" name="Avg Price Impact %" strokeWidth={2} />
                  <Line dataKey="credibilityTrend" stroke="#10b981" name="Credibility Trend" strokeWidth={2} />
                  <Line dataKey="avgImpactDuration" stroke="#f59e0b" name="Avg Impact Duration (days)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'ranking' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Influencer Rankings</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-800">
                      <th className="text-left py-3 px-2">Rank</th>
                      <th className="text-left py-3 px-2">Influencer</th>
                      <th className="text-left py-3 px-2">Platform</th>
                      <th className="text-right py-3 px-2">Trust Score</th>
                      <th className="text-right py-3 px-2">Success Rate</th>
                      <th className="text-right py-3 px-2">Half-Life</th>
                      <th className="text-right py-3 px-2">Total Calls</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.sort((a, b) => b.trustScore - a.trustScore).map((p, i) => (
                      <tr key={p.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="py-3 px-2">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            i === 0 ? 'bg-yellow-900/50 text-yellow-400' :
                            i === 1 ? 'bg-gray-700 text-gray-300' :
                            i === 2 ? 'bg-orange-900/50 text-orange-400' :
                            'bg-gray-800 text-gray-500'
                          }`}>
                            {i + 1}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-medium">{p.influencerName}</td>
                        <td className="py-3 px-2 text-gray-400">{p.category}</td>
                        <td className="py-3 px-2 text-right">
                          <span className={p.trustScore >= 80 ? 'text-green-400' : p.trustScore >= 60 ? 'text-yellow-400' : 'text-red-400'}>
                            {p.trustScore}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right text-blue-400">{p.successRate}%</td>
                        <td className="py-3 px-2 text-right text-purple-400">{p.avgHalfLife}d</td>
                        <td className="py-3 px-2 text-right text-gray-300">{p.totalCalls}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Trust Score vs Half-Life Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={profiles.map(p => ({ name: p.influencerName, trustScore: p.trustScore, halfLife: p.avgHalfLife, successRate: p.successRate }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="trustScore" fill="#10b981" name="Trust Score" />
                  <Bar dataKey="halfLife" fill="#f43f5e" name="Avg Half-Life (days)" />
                  <Bar dataKey="successRate" fill="#3b82f6" name="Success Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
