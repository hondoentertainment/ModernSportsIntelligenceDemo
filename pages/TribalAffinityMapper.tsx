import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, PieChart, Pie, Cell
} from 'recharts';
import {
  Users, Map, GitBranch, Heart, TrendingUp, Shield, ArrowRightLeft, Star
} from 'lucide-react';
import {
  getCollectorTribes, getAffinityScores, getTribeMigrations,
  getTribalOverlaps, getTribeStats,
  type CollectorTribe, type AffinityScore, type TribeMigration, type TribalOverlap
} from '../lib/tribalAffinityService.ts';

type TabId = 'tribe-map' | 'affinity' | 'migration' | 'my-tribe';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'tribe-map', label: 'Tribe Map', icon: <Map size={18} /> },
  { id: 'affinity', label: 'Affinity Scores', icon: <Heart size={18} /> },
  { id: 'migration', label: 'Migration Patterns', icon: <ArrowRightLeft size={18} /> },
  { id: 'my-tribe', label: 'My Tribe', icon: <Star size={18} /> },
];

const COLORS = ['#e53e3e', '#2b6cb0', '#ed8936', '#38a169', '#805ad5', '#d69e2e', '#319795', '#dd6b20', '#9f7aea', '#e53e3e'];

export default function TribalAffinityMapper() {
  const [activeTab, setActiveTab] = useState<TabId>('tribe-map');
  const tribes = getCollectorTribes();
  const affinityScores = getAffinityScores();
  const migrations = getTribeMigrations();
  const overlaps = getTribalOverlaps();
  const stats = getTribeStats();

  const tribeChartData = tribes.map(t => ({
    name: t.name.length > 15 ? t.name.slice(0, 15) + '...' : t.name,
    members: t.memberCount,
    loyalty: t.loyaltyScore,
    growth: t.growthRate,
    avgSpend: t.avgSpend,
  }));

  const affinityChartData = affinityScores.map(a => ({
    name: `${a.tribeA.slice(0, 10)} - ${a.tribeB.slice(0, 10)}`,
    affinity: a.affinityScore,
    overlap: a.overlapPercentage,
    conflict: a.conflictLevel,
    trading: a.tradingFrequency,
  }));

  const migrationChartData = migrations.map(m => ({
    name: `${m.fromTribe.slice(0, 8)} -> ${m.toTribe.slice(0, 8)}`,
    migrants: m.migrantCount,
    valueShift: m.avgValueShift,
    returnRate: m.returnRate,
  }));

  const pieData = tribes.map(t => ({
    name: t.name,
    value: t.memberCount,
  }));

  const radarData = [
    { trait: 'Loyalty', Jordan: 97, Modern: 68, Vintage: 99, Gridiron: 85 },
    { trait: 'Growth', Jordan: 32, Modern: 100, Vintage: 11, Gridiron: 58 },
    { trait: 'Spend', Jordan: 68, Modern: 35, Vintage: 100, Gridiron: 42 },
    { trait: 'Size', Jordan: 67, Modern: 100, Vintage: 42, Gridiron: 57 },
    { trait: 'Engagement', Jordan: 85, Modern: 92, Vintage: 65, Gridiron: 72 },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Users className="text-purple-400" size={32} />
            Tribal Affinity Mapper
          </h1>
          <p className="text-gray-400">Map collector tribe identity and loyalty patterns across player, team, and era fandoms</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Total Tribes</p>
            <p className="text-2xl font-bold text-purple-400">{stats.tribeCount}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Total Members</p>
            <p className="text-2xl font-bold text-blue-400">{(stats.totalMembers / 1000).toFixed(0)}K</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Avg Loyalty</p>
            <p className="text-2xl font-bold text-green-400">{stats.avgLoyalty}%</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Avg Growth</p>
            <p className="text-2xl font-bold text-orange-400">{stats.avgGrowth}%</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Total Migrations</p>
            <p className="text-2xl font-bold text-red-400">{(stats.totalMigrations / 1000).toFixed(1)}K</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'tribe-map' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Tribe Size Distribution</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={120} dataKey="value" label={({ name, percent }) => `${name.slice(0, 12)} ${(percent * 100).toFixed(0)}%`}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Tribe Comparison Radar</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="trait" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                    <PolarRadiusAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
                    <Radar name="Jordan Dynasty" dataKey="Jordan" stroke="#e53e3e" fill="#e53e3e" fillOpacity={0.2} />
                    <Radar name="Modern Basketball" dataKey="Modern" stroke="#ed8936" fill="#ed8936" fillOpacity={0.2} />
                    <Radar name="Vintage Baseball" dataKey="Vintage" stroke="#2b6cb0" fill="#2b6cb0" fillOpacity={0.2} />
                    <Radar name="Gridiron Legends" dataKey="Gridiron" stroke="#38a169" fill="#38a169" fillOpacity={0.2} />
                    <Legend />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Members vs Average Spend by Tribe</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={tribeChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-25} textAnchor="end" height={80} />
                  <YAxis yAxisId="left" tick={{ fill: '#9ca3af' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="members" fill="#8b5cf6" name="Members" />
                  <Bar yAxisId="right" dataKey="avgSpend" fill="#10b981" name="Avg Spend ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tribes.map(tribe => (
                <div key={tribe.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-purple-500 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tribe.color }} />
                    <h4 className="font-semibold">{tribe.name}</h4>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{tribe.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">Members:</span> <span className="text-white">{tribe.memberCount.toLocaleString()}</span></div>
                    <div><span className="text-gray-500">Avg Spend:</span> <span className="text-green-400">${tribe.avgSpend.toLocaleString()}</span></div>
                    <div><span className="text-gray-500">Loyalty:</span> <span className="text-blue-400">{tribe.loyaltyScore}%</span></div>
                    <div><span className="text-gray-500">Growth:</span> <span className={tribe.growthRate > 10 ? 'text-green-400' : 'text-yellow-400'}>{tribe.growthRate}%</span></div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {tribe.topPlayers.map((p, i) => (
                      <span key={i} className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded">{p}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'affinity' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Tribe Affinity Scores</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={affinityChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" tick={{ fill: '#9ca3af' }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#9ca3af', fontSize: 11 }} width={150} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="affinity" fill="#8b5cf6" name="Affinity Score" />
                  <Bar dataKey="overlap" fill="#10b981" name="Overlap %" />
                  <Bar dataKey="trading" fill="#3b82f6" name="Trading Freq" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {affinityScores.map(score => (
                <div key={score.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <GitBranch size={16} className="text-purple-400" />
                      <span className="font-semibold text-sm">{score.tribeA}</span>
                      <ArrowRightLeft size={14} className="text-gray-500" />
                      <span className="font-semibold text-sm">{score.tribeB}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                    <div><span className="text-gray-500">Affinity:</span> <span className="text-purple-400 font-bold">{score.affinityScore}</span></div>
                    <div><span className="text-gray-500">Overlap:</span> <span className="text-green-400">{score.overlapPercentage}%</span></div>
                    <div><span className="text-gray-500">Conflict:</span> <span className={score.conflictLevel > 30 ? 'text-red-400' : 'text-yellow-400'}>{score.conflictLevel}</span></div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {score.sharedInterests.map((interest, i) => (
                      <span key={i} className="bg-purple-900/30 text-purple-300 text-xs px-2 py-1 rounded">{interest}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Overlap Analysis</h3>
              {overlaps.map(o => (
                <div key={o.id} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
                  <div>
                    <p className="font-medium">{o.tribes.join(' + ')}</p>
                    <p className="text-sm text-gray-400">{o.overlapCount.toLocaleString()} shared members</p>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div><span className="text-gray-500">Synergy:</span> <span className="text-green-400 font-bold">{o.synergyScore}</span></div>
                    <div><span className="text-gray-500">Dual Spend:</span> <span className="text-blue-400">${o.avgDualSpend.toLocaleString()}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'migration' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Migration Volume by Route</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={migrationChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="migrants" fill="#8b5cf6" name="Migrants" />
                  <Bar dataKey="returnRate" fill="#f59e0b" name="Return Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {migrations.map(m => (
                <div key={m.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-400 font-semibold">{m.fromTribe}</span>
                    <ArrowRightLeft size={14} className="text-gray-500" />
                    <span className="text-green-400 font-semibold">{m.toTribe}</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{m.reason}</p>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div><span className="text-gray-500">Migrants:</span> <span className="text-white">{m.migrantCount.toLocaleString()}</span></div>
                    <div><span className="text-gray-500">Value Shift:</span> <span className={m.avgValueShift > 0 ? 'text-green-400' : 'text-red-400'}>{m.avgValueShift > 0 ? '+' : ''}{m.avgValueShift}%</span></div>
                    <div><span className="text-gray-500">Return:</span> <span className="text-yellow-400">{m.returnRate}%</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'my-tribe' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-purple-800">
              <h3 className="text-xl font-bold mb-2">Your Tribe: Jordan Dynasty</h3>
              <p className="text-gray-300 mb-4">Based on your collection patterns, you align most closely with the Jordan Dynasty tribe</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><p className="text-gray-400 text-sm">Loyalty Match</p><p className="text-2xl font-bold text-purple-400">94%</p></div>
                <div><p className="text-gray-400 text-sm">Tribe Rank</p><p className="text-2xl font-bold text-blue-400">#847</p></div>
                <div><p className="text-gray-400 text-sm">Affinity Matches</p><p className="text-2xl font-bold text-green-400">3</p></div>
                <div><p className="text-gray-400 text-sm">Cross-Tribe</p><p className="text-2xl font-bold text-orange-400">2</p></div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Tribe Loyalty vs Growth</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={tribeChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-25} textAnchor="end" height={80} />
                  <YAxis tick={{ fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="loyalty" fill="#8b5cf6" name="Loyalty Score" />
                  <Bar dataKey="growth" fill="#10b981" name="Growth Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Recommended Tribe Connections</h3>
              <div className="space-y-3">
                {['PSA 10 Chasers', 'Vintage Baseball Purists', 'The Patch Collectors'].map((tribe, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield size={18} className="text-purple-400" />
                      <span className="font-medium">{tribe}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-green-400">Match: {[82, 45, 68][i]}%</span>
                      <button className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm transition-colors">Connect</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
