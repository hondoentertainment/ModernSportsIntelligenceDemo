import React, { useState } from 'react';
import {
  Network, Layers, Users, GitBranch, TrendingUp, TrendingDown,
  ArrowRight, Activity, BarChart3, Target, Filter
} from 'lucide-react';
import {
  PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  getTemporalClusters, getClusterMembers, getClusterCorrelations,
  getTemporalPatterns, getClusteringSummary
} from '../lib/temporalClusteringService.ts';

const TABS = [
  { id: 'clusters', label: 'Clusters', icon: <Layers className="w-4 h-4" /> },
  { id: 'members', label: 'Members', icon: <Users className="w-4 h-4" /> },
  { id: 'correlations', label: 'Correlations', icon: <GitBranch className="w-4 h-4" /> },
  { id: 'patterns', label: 'Patterns', icon: <Activity className="w-4 h-4" /> },
] as const;

const TRAJECTORY_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  rising: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: <TrendingUp className="w-3 h-3" /> },
  falling: { bg: 'bg-red-500/20', text: 'text-red-400', icon: <TrendingDown className="w-3 h-3" /> },
  stable: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: <ArrowRight className="w-3 h-3" /> },
  cyclical: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: <Activity className="w-3 h-3" /> },
};

const STRENGTH_STYLES: Record<string, string> = {
  strong: 'bg-violet-500/20 text-violet-400',
  moderate: 'bg-blue-500/20 text-blue-400',
  weak: 'bg-gray-500/20 text-gray-400',
};

const RELATIONSHIP_STYLES: Record<string, string> = {
  positive: 'bg-emerald-500/20 text-emerald-400',
  negative: 'bg-red-500/20 text-red-400',
  independent: 'bg-gray-500/20 text-gray-400',
};

export default function TemporalClusteringEngine() {
  const [activeTab, setActiveTab] = useState<string>('clusters');
  const [memberFilter, setMemberFilter] = useState<string>('all');

  const clusters = getTemporalClusters();
  const members = getClusterMembers();
  const correlations = getClusterCorrelations();
  const patterns = getTemporalPatterns();
  const summary = getClusteringSummary();

  const clusterMap = Object.fromEntries(clusters.map(c => [c.id, c]));

  const stats = [
    { label: 'Total Clusters', value: summary.totalClusters, icon: <Layers className="w-5 h-5" />, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Total Members', value: summary.totalMembers, icon: <Users className="w-5 h-5" />, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Avg Correlation', value: summary.avgCorrelation.toFixed(2), icon: <GitBranch className="w-5 h-5" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Strongest Pattern', value: summary.strongestPattern, icon: <Target className="w-5 h-5" />, color: 'text-amber-400', bg: 'bg-amber-500/10', small: true },
  ];

  const pieData = clusters.map(c => ({
    name: c.name,
    value: c.memberCount,
    color: c.color,
  }));

  const filteredMembers = memberFilter === 'all'
    ? members
    : members.filter(m => m.clusterId === memberFilter);

  // Build correlation heatmap data: for each cluster pair, show bar
  const corrChartData = correlations.map(c => ({
    name: `${(clusterMap[c.cluster1]?.name || c.cluster1).substring(0, 8)} / ${(clusterMap[c.cluster2]?.name || c.cluster2).substring(0, 8)}`,
    correlation: c.correlation,
    absCorrelation: Math.abs(c.correlation),
    fill: c.correlation > 0.3 ? '#10b981' : c.correlation < -0.3 ? '#ef4444' : '#6b7280',
  }));

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const patternLineData = months.map((month, i) => {
    const row: Record<string, string | number> = { month };
    patterns.forEach(p => {
      const val = p.amplitude * Math.sin(((i - p.phase) / p.seasonality) * 2 * Math.PI);
      row[p.patternName] = Math.round(val * 10) / 10;
    });
    return row;
  });

  const PATTERN_COLORS = ['#8b5cf6', '#10b981', '#ef4444', '#f59e0b', '#06b6d4', '#ec4899'];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20">
            <Network className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Temporal Clustering Engine</h1>
            <p className="text-sm text-gray-400">Group cards by shared seasonal price patterns and temporal correlations</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${stat.bg}`}><span className={stat.color}>{stat.icon}</span></div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</span>
              </div>
              <div className={`font-bold text-white ${stat.small ? 'text-base' : 'text-2xl'}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}>{tab.icon}{tab.label}</button>
          ))}
        </div>

        {/* Tab 1: Clusters */}
        {activeTab === 'clusters' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Cluster Size Distribution</h3>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={120}
                      dataKey="value" nameKey="name" paddingAngle={3} stroke="#030712" strokeWidth={2}>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Annualized Return vs Volatility</h3>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={clusters.map(c => ({
                    name: c.name.length > 14 ? c.name.substring(0, 14) + '...' : c.name,
                    return: c.annualizedReturn,
                    volatility: c.volatility,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 9 }} angle={-20} textAnchor="end" height={55} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Bar dataKey="return" name="Ann. Return %" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="volatility" name="Volatility %" fill="#6b7280" radius={[4, 4, 0, 0]} />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clusters.map(c => (
                <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                    <h4 className="text-sm font-semibold text-white">{c.name}</h4>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 leading-relaxed">{c.description}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                    <div>
                      <span className="text-gray-500">Members</span>
                      <div className="font-mono text-white font-medium">{c.memberCount}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Avg Corr.</span>
                      <div className="font-mono text-cyan-400">{c.avgCorrelation}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Return</span>
                      <div className="font-mono text-emerald-400">+{c.annualizedReturn}%</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Pattern</span>
                      <div className="text-violet-400 font-medium">{c.dominantPattern}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Peak</span>
                      <div className="text-emerald-400">{c.peakMonth}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Trough</span>
                      <div className="text-red-400">{c.troughMonth}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Members */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-3 flex-wrap">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-500">Filter by cluster:</span>
                <button onClick={() => setMemberFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    memberFilter === 'all' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}>All</button>
                {clusters.map(c => (
                  <button key={c.id} onClick={() => setMemberFilter(c.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                      memberFilter === c.id ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.name.split(' ').slice(0, 2).join(' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <h3 className="text-sm font-semibold text-gray-300">Cluster Members ({filteredMembers.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left p-3 text-gray-500 font-medium">Card</th>
                      <th className="text-left p-3 text-gray-500 font-medium">Cluster</th>
                      <th className="text-left p-3 text-gray-500 font-medium">Category</th>
                      <th className="text-right p-3 text-gray-500 font-medium">Correlation</th>
                      <th className="text-right p-3 text-gray-500 font-medium">Distance</th>
                      <th className="text-center p-3 text-gray-500 font-medium">Trajectory</th>
                      <th className="text-right p-3 text-gray-500 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map(m => {
                      const cluster = clusterMap[m.clusterId];
                      const traj = TRAJECTORY_STYLES[m.priceTrajectory];
                      return (
                        <tr key={m.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                          <td className="p-3">
                            <div className="font-medium text-white text-xs">{m.cardName}</div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cluster?.color || '#6b7280' }} />
                              <span className="text-xs text-gray-400">{cluster?.name.split(' ').slice(0, 2).join(' ') || m.clusterId}</span>
                            </div>
                          </td>
                          <td className="p-3 text-gray-400 text-xs">{m.category}</td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-14 bg-gray-800 rounded-full h-1.5">
                                <div className="h-1.5 rounded-full bg-cyan-500" style={{ width: `${m.correlationToCluster * 100}%` }} />
                              </div>
                              <span className="font-mono text-xs text-cyan-400">{m.correlationToCluster.toFixed(2)}</span>
                            </div>
                          </td>
                          <td className="p-3 text-right font-mono text-xs text-gray-300">{m.distanceFromCentroid.toFixed(2)}</td>
                          <td className="p-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${traj.bg} ${traj.text}`}>
                              {traj.icon}{m.priceTrajectory}
                            </span>
                          </td>
                          <td className="p-3 text-right text-gray-500 text-xs">{m.joinedDate}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Correlations */}
        {activeTab === 'correlations' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Pairwise Cluster Correlations</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={corrChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis type="number" domain={[-1, 1]} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={140} tick={{ fill: '#9ca3af', fontSize: 9 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="correlation" name="Correlation" radius={[0, 4, 4, 0]}>
                    {corrChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Heatmap-style grid */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Correlation Heatmap</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      <th className="p-2 text-left text-gray-500"></th>
                      {clusters.map(c => (
                        <th key={c.id} className="p-2 text-center text-gray-400 font-medium" style={{ minWidth: 80 }}>
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                            <span>{c.name.split(' ')[0]}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {clusters.map(row => (
                      <tr key={row.id}>
                        <td className="p-2 text-gray-400 font-medium">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: row.color }} />
                            {row.name.split(' ')[0]}
                          </div>
                        </td>
                        {clusters.map(col => {
                          if (row.id === col.id) {
                            return (
                              <td key={col.id} className="p-2 text-center">
                                <div className="bg-violet-500/30 rounded-lg py-1.5 font-mono text-violet-400 font-medium">1.00</div>
                              </td>
                            );
                          }
                          const corr = correlations.find(
                            c => (c.cluster1 === row.id && c.cluster2 === col.id) ||
                                 (c.cluster1 === col.id && c.cluster2 === row.id)
                          );
                          const val = corr?.correlation ?? 0;
                          const intensity = Math.abs(val);
                          const bg = val > 0
                            ? `rgba(16, 185, 129, ${intensity * 0.4})`
                            : val < 0
                            ? `rgba(239, 68, 68, ${intensity * 0.4})`
                            : 'rgba(107, 114, 128, 0.1)';
                          return (
                            <td key={col.id} className="p-2 text-center">
                              <div className="rounded-lg py-1.5 font-mono text-gray-200" style={{ backgroundColor: bg }}>
                                {val > 0 ? '+' : ''}{val.toFixed(2)}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {correlations.filter(c => c.strength !== 'weak').map((c, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: clusterMap[c.cluster1]?.color || '#6b7280' }} />
                      <span className="text-white font-medium">{clusterMap[c.cluster1]?.name.split(' ').slice(0, 2).join(' ')}</span>
                      <ArrowRight className="w-3 h-3 text-gray-600" />
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: clusterMap[c.cluster2]?.color || '#6b7280' }} />
                      <span className="text-white font-medium">{clusterMap[c.cluster2]?.name.split(' ').slice(0, 2).join(' ')}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs mt-3">
                    <div>
                      <span className="text-gray-500">Correlation</span>
                      <div className={`font-mono font-medium ${c.correlation >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {c.correlation > 0 ? '+' : ''}{c.correlation.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Lead/Lag</span>
                      <div className="font-mono text-gray-300">{c.leadLagDays}d</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Type</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`px-1.5 py-0.5 rounded text-xs ${RELATIONSHIP_STYLES[c.relationship]}`}>{c.relationship}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Patterns */}
        {activeTab === 'patterns' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Seasonal Pattern Amplitudes Over Months</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={patternLineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} label={{ value: 'Amplitude %', angle: -90, position: 'insideLeft', fill: '#6b7280' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  {patterns.map((p, i) => (
                    <Line key={p.id} type="monotone" dataKey={p.patternName}
                      stroke={PATTERN_COLORS[i % PATTERN_COLORS.length]} strokeWidth={2} dot={false} />
                  ))}
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patterns.map((p, i) => (
                <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PATTERN_COLORS[i % PATTERN_COLORS.length] }} />
                    <h4 className="text-sm font-semibold text-white">{p.patternName}</h4>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 leading-relaxed">{p.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {p.clusters.map(cId => {
                      const cluster = clusterMap[cId];
                      return cluster ? (
                        <span key={cId} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-800 rounded text-xs text-gray-400">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cluster.color }} />
                          {cluster.name.split(' ').slice(0, 2).join(' ')}
                        </span>
                      ) : null;
                    })}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Seasonality</span>
                      <div className="font-mono text-violet-400">{p.seasonality}mo</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Amplitude</span>
                      <div className="font-mono text-cyan-400">{p.amplitude}%</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Predictive</span>
                      <div className="flex items-center gap-1">
                        <div className="w-10 bg-gray-800 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${p.predictivePower >= 0.8 ? 'bg-emerald-500' : p.predictivePower >= 0.7 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${p.predictivePower * 100}%` }} />
                        </div>
                        <span className="font-mono text-gray-300">{Math.round(p.predictivePower * 100)}%</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Edge</span>
                      <div className="font-mono text-emerald-400">+{p.tradingEdge}%</div>
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
