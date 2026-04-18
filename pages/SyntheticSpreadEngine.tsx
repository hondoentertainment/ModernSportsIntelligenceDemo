import React, { useState } from 'react';
import {
  GitBranch, DollarSign, TrendingUp, TrendingDown, Activity,
  BarChart3, History, AlertTriangle, Layers, Target
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import {
  getSpreadTrades, getSyntheticPositions, getSpreadPnLs,
  getSpreadHistory, getActiveSpreadCount, getTotalUnrealizedPnL,
  getAvgRiskScore, getCumulativeSpreadPnL
} from '../lib/syntheticSpreadService.ts';

const TABS = [
  { id: 'spreads', label: 'Active Spreads', icon: <GitBranch className="w-4 h-4" /> },
  { id: 'builder', label: 'Position Builder', icon: <Layers className="w-4 h-4" /> },
  { id: 'pnl', label: 'P&L Monitor', icon: <DollarSign className="w-4 h-4" /> },
  { id: 'history', label: 'History', icon: <History className="w-4 h-4" /> },
] as const;

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const TYPE_STYLES: Record<string, string> = {
  calendar: 'bg-violet-500/20 text-violet-400',
  grade: 'bg-cyan-500/20 text-cyan-400',
  'cross-sport': 'bg-emerald-500/20 text-emerald-400',
  era: 'bg-amber-500/20 text-amber-400',
  'intra-set': 'bg-pink-500/20 text-pink-400',
};

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-400',
  'profit-target': 'bg-cyan-500/20 text-cyan-400',
  'stop-loss': 'bg-red-500/20 text-red-400',
  closed: 'bg-gray-500/20 text-gray-400',
};

export default function SyntheticSpreadEngine() {
  const [activeTab, setActiveTab] = useState<string>('spreads');

  const trades = getSpreadTrades();
  const positions = getSyntheticPositions();
  const pnls = getSpreadPnLs();
  const history = getSpreadHistory();

  const totalUnrealized = getTotalUnrealizedPnL();

  const stats = [
    { label: 'Active Spreads', value: getActiveSpreadCount(), icon: <GitBranch className="w-5 h-5" />, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Unrealized P&L', value: `$${totalUnrealized >= 0 ? '' : ''}${totalUnrealized.toLocaleString()}`, icon: <DollarSign className="w-5 h-5" />, color: totalUnrealized >= 0 ? 'text-emerald-400' : 'text-red-400', bg: totalUnrealized >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10' },
    { label: 'Avg Risk Score', value: `${getAvgRiskScore()}/100`, icon: <AlertTriangle className="w-5 h-5" />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Cumulative P&L', value: `$${getCumulativeSpreadPnL().toLocaleString()}`, icon: <TrendingUp className="w-5 h-5" />, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-500/20">
            <GitBranch className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Synthetic Spread Engine</h1>
            <p className="text-sm text-gray-400">Create synthetic spread trades between card positions</p>
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
                activeTab === tab.id ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}>{tab.icon}{tab.label}</button>
          ))}
        </div>

        {activeTab === 'spreads' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Spread P&L Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trades.map(t => ({
                  name: t.spreadName.length > 20 ? t.spreadName.substring(0, 20) + '...' : t.spreadName,
                  pnl: t.unrealizedPnL,
                  maxLoss: Math.abs(t.maxLoss),
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 9 }} angle={-15} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} formatter={(v: number) => `$${v.toLocaleString()}`} />
                  <Bar dataKey="pnl" name="Unrealized P&L" radius={[4, 4, 0, 0]}>
                    {trades.map((t, i) => (
                      <Cell key={i} fill={t.unrealizedPnL >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trades.map(t => (
                <div key={t.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-semibold text-white">{t.spreadName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_STYLES[t.type]}`}>{t.type}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[t.status]}`}>{t.status}</span>
                      </div>
                    </div>
                    <div className={`text-lg font-bold font-mono ${t.unrealizedPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {t.unrealizedPnL >= 0 ? '+' : ''}${t.unrealizedPnL.toLocaleString()}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div className="bg-gray-800/50 rounded p-2">
                      <span className="text-emerald-400 font-medium">LONG</span>
                      <div className="text-white mt-0.5">{t.longLeg.player}</div>
                      <div className="text-gray-500">${t.longLeg.price} x {t.longLeg.quantity}</div>
                    </div>
                    <div className="bg-gray-800/50 rounded p-2">
                      <span className="text-red-400 font-medium">SHORT</span>
                      <div className="text-white mt-0.5">{t.shortLeg.player}</div>
                      <div className="text-gray-500">${t.shortLeg.price} x {t.shortLeg.quantity}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div><span className="text-gray-500">Entry</span><div className="font-mono text-gray-300">{t.entrySpread}</div></div>
                    <div><span className="text-gray-500">Current</span><div className="font-mono text-violet-400">{t.currentSpread}</div></div>
                    <div><span className="text-gray-500">Target</span><div className="font-mono text-cyan-400">{t.targetSpread}</div></div>
                    <div><span className="text-gray-500">Days</span><div className="font-mono text-gray-300">{t.daysOpen}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'builder' && (
          <div className="space-y-6">
            {positions.map(pos => (
              <div key={pos.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">{pos.positionName}</h3>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-gray-500">Beta: <span className="text-cyan-400 font-mono">{pos.beta}</span></span>
                    <span className="text-gray-500">Sharpe: <span className="text-emerald-400 font-mono">{pos.sharpeRatio}</span></span>
                    <span className="text-gray-500">Expected: <span className="text-violet-400 font-mono">{pos.expectedReturn}%</span></span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {pos.components.map((c, i) => (
                    <div key={i} className={`rounded-lg p-3 border ${c.direction === 'long' ? 'bg-emerald-950/30 border-emerald-800/50' : 'bg-red-950/30 border-red-800/50'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-medium ${c.direction === 'long' ? 'text-emerald-400' : 'text-red-400'}`}>{c.direction.toUpperCase()}</span>
                        <span className="text-xs font-mono text-gray-400">{(c.weight * 100).toFixed(0)}%</span>
                      </div>
                      <div className="text-xs text-white">{c.cardName}</div>
                      <div className="text-xs text-gray-500 font-mono">${c.notional.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-4 mt-4 text-xs">
                  <div><span className="text-gray-500">Net Exposure</span><div className="font-mono text-white">{(pos.netExposure * 100).toFixed(0)}%</div></div>
                  <div><span className="text-gray-500">Gross Exposure</span><div className="font-mono text-white">{(pos.grossExposure * 100).toFixed(0)}%</div></div>
                  <div><span className="text-gray-500">Expected Return</span><div className="font-mono text-emerald-400">{pos.expectedReturn}%</div></div>
                  <div><span className="text-gray-500">Risk</span><div className="font-mono text-amber-400">{pos.risk}%</div></div>
                </div>
              </div>
            ))}

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Spread Type Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={['calendar', 'grade', 'cross-sport', 'era', 'intra-set'].map(type => ({
                  type: type.replace(/-/g, ' '),
                  count: trades.filter(t => t.type === type).length,
                  avgPnL: trades.filter(t => t.type === type).reduce((s, t) => s + t.unrealizedPnL, 0) / Math.max(1, trades.filter(t => t.type === type).length),
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="type" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="count" name="Count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'pnl' && (
          <div className="space-y-6">
            {pnls.map((p, idx) => (
              <div key={p.tradeId} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">{p.tradeName}</h3>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-gray-500">Total P&L: <span className={`font-mono ${p.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>${p.totalPnL}</span></span>
                    <span className="text-gray-500">Drawdown: <span className="text-red-400 font-mono">${p.maxDrawdown}</span></span>
                    <span className="text-gray-500">Win/Loss: <span className="text-cyan-400 font-mono">{p.winDays}/{p.lossDays}</span></span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={p.dailyPnL}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="cumPnl" name="Cumulative P&L" stroke={COLORS[idx]} fill={COLORS[idx]} fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Cumulative Spread P&L</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} formatter={(v: number) => `$${v.toLocaleString()}`} />
                    <Area type="monotone" dataKey="cumPnL" name="Cumulative P&L" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Monthly Win Rate</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="winRate" name="Win Rate %" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="avgReturn" name="Avg Return %" stroke="#f59e0b" strokeWidth={2} />
                    <Legend />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800"><h3 className="text-sm font-semibold text-gray-300">Monthly Performance</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-800">
                    <th className="text-left p-3 text-gray-500 font-medium">Month</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Active</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Closed</th>
                    <th className="text-right p-3 text-gray-500 font-medium">P&L</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Avg Return</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Win Rate</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Cum. P&L</th>
                  </tr></thead>
                  <tbody>
                    {history.map(h => (
                      <tr key={h.month} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="p-3 text-gray-300">{h.month}</td>
                        <td className="p-3 text-right font-mono text-gray-300">{h.activeSpreads}</td>
                        <td className="p-3 text-right font-mono text-gray-400">{h.closedSpreads}</td>
                        <td className="p-3 text-right font-mono"><span className={h.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}>${h.totalPnL.toLocaleString()}</span></td>
                        <td className="p-3 text-right font-mono"><span className={h.avgReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}>{h.avgReturn}%</span></td>
                        <td className="p-3 text-right font-mono text-violet-400">{h.winRate}%</td>
                        <td className="p-3 text-right font-mono text-white">${h.cumPnL.toLocaleString()}</td>
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
