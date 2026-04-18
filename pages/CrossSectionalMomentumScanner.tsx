import React, { useState } from 'react';
import {
  TrendingUp, TrendingDown, BarChart3, Activity, Target,
  Users, History, ArrowUpDown, Zap, Gauge
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
  getMomentumRankings, getPeerGroups, getRelativeStrengths,
  getMomentumHistory, getStrongBuyCount, getStrongSellCount,
  getAvgMomentumScore, getAvgSpreadReturn
} from '../lib/crossSectionalMomentumService.ts';

const TABS = [
  { id: 'rankings', label: 'Momentum Rankings', icon: <ArrowUpDown className="w-4 h-4" /> },
  { id: 'peers', label: 'Peer Groups', icon: <Users className="w-4 h-4" /> },
  { id: 'strength', label: 'Relative Strength', icon: <Gauge className="w-4 h-4" /> },
  { id: 'rebalance', label: 'Rebalance Signals', icon: <Zap className="w-4 h-4" /> },
] as const;

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

const SIGNAL_STYLES: Record<string, string> = {
  'strong-buy': 'bg-emerald-500/20 text-emerald-400',
  buy: 'bg-green-500/20 text-green-400',
  hold: 'bg-gray-500/20 text-gray-400',
  sell: 'bg-orange-500/20 text-orange-400',
  'strong-sell': 'bg-red-500/20 text-red-400',
};

const TREND_STYLES: Record<string, string> = {
  accelerating: 'text-emerald-400',
  steady: 'text-blue-400',
  decelerating: 'text-amber-400',
  reversing: 'text-red-400',
};

export default function CrossSectionalMomentumScanner() {
  const [activeTab, setActiveTab] = useState<string>('rankings');
  const [selectedGroup, setSelectedGroup] = useState<number>(0);

  const rankings = getMomentumRankings();
  const peerGroups = getPeerGroups();
  const strengths = getRelativeStrengths();
  const history = getMomentumHistory();

  const stats = [
    { label: 'Strong Buys', value: getStrongBuyCount(), icon: <TrendingUp className="w-5 h-5" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Strong Sells', value: getStrongSellCount(), icon: <TrendingDown className="w-5 h-5" />, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Avg Momentum', value: getAvgMomentumScore(), icon: <Activity className="w-5 h-5" />, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Avg Spread Return', value: `${getAvgSpreadReturn()}%`, icon: <Target className="w-5 h-5" />, color: 'text-violet-400', bg: 'bg-violet-500/10' },
  ];

  const radarData = peerGroups.map(pg => ({
    group: pg.groupName.length > 18 ? pg.groupName.substring(0, 18) + '...' : pg.groupName,
    momentum: pg.avgMomentum,
    dispersion: pg.dispersion,
    return3m: Math.max(0, pg.avgReturn3m * 5),
  }));

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/20">
            <TrendingUp className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Cross-Sectional Momentum Scanner</h1>
            <p className="text-sm text-gray-400">Rank cards by relative momentum within peer groups</p>
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
                activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}>{tab.icon}{tab.label}</button>
          ))}
        </div>

        {activeTab === 'rankings' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Momentum Score Distribution</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={rankings.sort((a, b) => b.momentumScore - a.momentumScore).slice(0, 12).map(r => ({
                  name: r.player,
                  score: r.momentumScore,
                  return3m: r.return3m,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-25} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="score" name="Momentum Score" radius={[4, 4, 0, 0]}>
                    {rankings.sort((a, b) => b.momentumScore - a.momentumScore).slice(0, 12).map((r, i) => (
                      <Cell key={i} fill={r.momentumScore >= 80 ? '#10b981' : r.momentumScore >= 50 ? '#06b6d4' : r.momentumScore >= 30 ? '#f59e0b' : '#ef4444'} />
                    ))}
                  </Bar>
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800"><h3 className="text-sm font-semibold text-gray-300">Full Momentum Rankings</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-800">
                    <th className="text-left p-3 text-gray-500 font-medium">Card</th>
                    <th className="text-left p-3 text-gray-500 font-medium">Peer Group</th>
                    <th className="text-right p-3 text-gray-500 font-medium">1M</th>
                    <th className="text-right p-3 text-gray-500 font-medium">3M</th>
                    <th className="text-right p-3 text-gray-500 font-medium">6M</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Score</th>
                    <th className="text-center p-3 text-gray-500 font-medium">Rank</th>
                    <th className="text-center p-3 text-gray-500 font-medium">Signal</th>
                  </tr></thead>
                  <tbody>
                    {rankings.sort((a, b) => b.momentumScore - a.momentumScore).map(r => (
                      <tr key={r.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="p-3"><div className="text-white text-xs">{r.player}</div><div className="text-gray-500 text-xs">{r.sport}</div></td>
                        <td className="p-3 text-gray-400 text-xs">{r.peerGroup}</td>
                        <td className="p-3 text-right font-mono text-xs"><span className={r.return1m >= 0 ? 'text-emerald-400' : 'text-red-400'}>{r.return1m > 0 ? '+' : ''}{r.return1m}%</span></td>
                        <td className="p-3 text-right font-mono text-xs"><span className={r.return3m >= 0 ? 'text-emerald-400' : 'text-red-400'}>{r.return3m > 0 ? '+' : ''}{r.return3m}%</span></td>
                        <td className="p-3 text-right font-mono text-xs"><span className={r.return6m >= 0 ? 'text-emerald-400' : 'text-red-400'}>{r.return6m > 0 ? '+' : ''}{r.return6m}%</span></td>
                        <td className="p-3 text-right font-mono text-violet-400 text-xs">{r.momentumScore}</td>
                        <td className="p-3 text-center font-mono text-gray-300 text-xs">{r.relativeRank}/{r.peerGroupSize}</td>
                        <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SIGNAL_STYLES[r.signal]}`}>{r.signal.replace(/-/g, ' ')}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'peers' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Peer Group Comparison</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={peerGroups.map(pg => ({
                    group: pg.groupName.substring(0, 18),
                    avgMomentum: pg.avgMomentum,
                    avgReturn: pg.avgReturn3m,
                    dispersion: pg.dispersion,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="group" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Bar dataKey="avgMomentum" name="Avg Momentum" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="dispersion" name="Dispersion" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Group Profile Radar</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="group" tick={{ fill: '#9ca3af', fontSize: 9 }} />
                    <PolarRadiusAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
                    <Radar name="Momentum" dataKey="momentum" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                    <Radar name="Dispersion" dataKey="dispersion" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {peerGroups.map((pg, i) => (
                <button key={pg.id} onClick={() => setSelectedGroup(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedGroup === i ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}>{pg.groupName}</button>
              ))}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">{peerGroups[selectedGroup].groupName} - Member Rankings</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={peerGroups[selectedGroup].members} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis dataKey="player" type="category" width={160} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="momentumScore" name="Momentum Score" radius={[0, 4, 4, 0]}>
                    {peerGroups[selectedGroup].members.map((m, i) => (
                      <Cell key={i} fill={m.momentumScore >= 80 ? '#10b981' : m.momentumScore >= 50 ? '#06b6d4' : m.momentumScore >= 30 ? '#f59e0b' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {peerGroups.map(pg => (
                <div key={pg.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-white mb-2">{pg.groupName}</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div><span className="text-gray-500">Members</span><div className="font-mono text-white">{pg.memberCount}</div></div>
                    <div><span className="text-gray-500">Avg Momentum</span><div className="font-mono text-violet-400">{pg.avgMomentum}</div></div>
                    <div><span className="text-gray-500">Avg Return 3M</span><div className={`font-mono ${pg.avgReturn3m >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{pg.avgReturn3m}%</div></div>
                    <div><span className="text-gray-500">Dispersion</span><div className="font-mono text-amber-400">{pg.dispersion}</div></div>
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between"><span className="text-gray-500">Top</span><span className="text-emerald-400">{pg.topPerformer}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Bottom</span><span className="text-red-400">{pg.bottomPerformer}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'strength' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Relative Strength Trends (Top 5)</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="month" type="category" allowDuplicatedCategory={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  {strengths.slice(0, 5).map((s, i) => (
                    <Line key={s.cardId} data={s.rsHistory} dataKey="rs"
                      name={s.player} stroke={COLORS[i]} strokeWidth={2} dot={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800"><h3 className="text-sm font-semibold text-gray-300">Relative Strength Detail</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-800">
                    <th className="text-left p-3 text-gray-500 font-medium">Card</th>
                    <th className="text-right p-3 text-gray-500 font-medium">RS Score</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Percentile</th>
                    <th className="text-right p-3 text-gray-500 font-medium">vs Market</th>
                    <th className="text-right p-3 text-gray-500 font-medium">vs Peers</th>
                    <th className="text-center p-3 text-gray-500 font-medium">Trend</th>
                  </tr></thead>
                  <tbody>
                    {strengths.map(s => (
                      <tr key={s.cardId} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="p-3 text-white text-xs">{s.player}</td>
                        <td className="p-3 text-right font-mono text-violet-400 text-xs">{s.rsScore}</td>
                        <td className="p-3 text-right font-mono text-cyan-400 text-xs">{s.rsPercentile}%</td>
                        <td className="p-3 text-right font-mono text-xs"><span className={s.vsMarket >= 0 ? 'text-emerald-400' : 'text-red-400'}>{s.vsMarket > 0 ? '+' : ''}{s.vsMarket.toFixed(1)}%</span></td>
                        <td className="p-3 text-right font-mono text-xs"><span className={s.vsPeerGroup >= 0 ? 'text-emerald-400' : 'text-red-400'}>{s.vsPeerGroup > 0 ? '+' : ''}{s.vsPeerGroup.toFixed(1)}%</span></td>
                        <td className="p-3 text-center"><span className={`text-xs font-medium ${TREND_STYLES[s.trend]}`}>{s.trend}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rebalance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Long-Short Momentum Spread</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="topQuintileReturn" name="Top Quintile %" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                    <Area type="monotone" dataKey="bottomQuintileReturn" name="Bottom Quintile %" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                    <Legend />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Spread Return (Top - Bottom)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="spreadReturn" name="Spread Return %" stroke="#8b5cf6" strokeWidth={2} />
                    <Line type="monotone" dataKey="turnover" name="Turnover %" stroke="#f59e0b" strokeWidth={2} />
                    <Legend />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800"><h3 className="text-sm font-semibold text-gray-300">Rebalance Actions Required</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-800">
                    <th className="text-left p-3 text-gray-500 font-medium">Card</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Momentum</th>
                    <th className="text-center p-3 text-gray-500 font-medium">Signal</th>
                    <th className="text-left p-3 text-gray-500 font-medium">Rebalance Action</th>
                  </tr></thead>
                  <tbody>
                    {rankings.filter(r => r.signal !== 'hold').sort((a, b) => b.momentumScore - a.momentumScore).map(r => (
                      <tr key={r.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="p-3"><div className="text-white text-xs">{r.player}</div><div className="text-gray-500 text-xs">{r.peerGroup}</div></td>
                        <td className="p-3 text-right font-mono text-violet-400 text-xs">{r.momentumScore}</td>
                        <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SIGNAL_STYLES[r.signal]}`}>{r.signal.replace(/-/g, ' ')}</span></td>
                        <td className="p-3 text-gray-300 text-xs">{r.rebalanceAction}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Monthly Rebalance Activity</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="rebalanceCount" name="Rebalance Count" fill="#6366f1" radius={[4, 4, 0, 0]} />
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
