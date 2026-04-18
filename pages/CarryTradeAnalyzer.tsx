import React, { useState } from 'react';
import {
  Wallet, TrendingUp, TrendingDown, DollarSign, BarChart3,
  Layers, History, ArrowUpDown, Target, Activity
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie
} from 'recharts';
import {
  getCarryAnalyses, getCarryComponents, getNetCarries,
  getCarryHistory, getPositiveCarryCount, getNegativeCarryCount,
  getAvgNetCarryPct, getTotalPortfolioCarry
} from '../lib/carryTradeService.ts';

const TABS = [
  { id: 'dashboard', label: 'Carry Dashboard', icon: <Wallet className="w-4 h-4" /> },
  { id: 'components', label: 'Component Analysis', icon: <Layers className="w-4 h-4" /> },
  { id: 'ranking', label: 'Net Carry Ranking', icon: <ArrowUpDown className="w-4 h-4" /> },
  { id: 'history', label: 'History', icon: <History className="w-4 h-4" /> },
] as const;

const PIE_COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6'];

const REC_STYLES: Record<string, string> = {
  'strong-hold': 'bg-emerald-500/20 text-emerald-400',
  hold: 'bg-blue-500/20 text-blue-400',
  neutral: 'bg-gray-500/20 text-gray-400',
  'consider-selling': 'bg-amber-500/20 text-amber-400',
  sell: 'bg-red-500/20 text-red-400',
};

const CARRY_STYLES: Record<string, string> = {
  'premium-carry': 'bg-emerald-500/20 text-emerald-400',
  'positive-carry': 'bg-blue-500/20 text-blue-400',
  'break-even': 'bg-gray-500/20 text-gray-400',
  'negative-carry': 'bg-amber-500/20 text-amber-400',
  'deep-negative': 'bg-red-500/20 text-red-400',
};

export default function CarryTradeAnalyzer() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedCard, setSelectedCard] = useState<number>(0);

  const analyses = getCarryAnalyses();
  const components = getCarryComponents();
  const netCarries = getNetCarries();
  const history = getCarryHistory();

  const totalCarry = getTotalPortfolioCarry();

  const stats = [
    { label: 'Positive Carry', value: getPositiveCarryCount(), icon: <TrendingUp className="w-5 h-5" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Negative Carry', value: getNegativeCarryCount(), icon: <TrendingDown className="w-5 h-5" />, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Avg Net Carry', value: `${getAvgNetCarryPct()}%`, icon: <Activity className="w-5 h-5" />, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Portfolio Carry', value: `$${totalCarry >= 0 ? '' : ''}${totalCarry.toLocaleString()}`, icon: <DollarSign className="w-5 h-5" />, color: totalCarry >= 0 ? 'text-emerald-400' : 'text-red-400', bg: totalCarry >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-teal-500/20">
            <Wallet className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Carry Trade Analyzer</h1>
            <p className="text-sm text-gray-400">Analyze carry (hold yield minus cost of carry) for card positions</p>
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
                activeTab === tab.id ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}>{tab.icon}{tab.label}</button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Net Carry % by Card</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={analyses.sort((a, b) => b.netCarryPct - a.netCarryPct).map(a => ({
                  name: a.player,
                  netCarry: a.netCarryPct,
                  appreciation: a.annualAppreciation,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-25} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="netCarry" name="Net Carry %" radius={[4, 4, 0, 0]}>
                    {analyses.sort((a, b) => b.netCarryPct - a.netCarryPct).map((a, i) => (
                      <Cell key={i} fill={a.netCarryPct > 5 ? '#10b981' : a.netCarryPct > 0 ? '#06b6d4' : a.netCarryPct > -5 ? '#f59e0b' : '#ef4444'} />
                    ))}
                  </Bar>
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800"><h3 className="text-sm font-semibold text-gray-300">Carry Detail</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-800">
                    <th className="text-left p-3 text-gray-500 font-medium">Card</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Value</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Appreciation</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Cost of Carry</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Net Carry</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Net %</th>
                    <th className="text-center p-3 text-gray-500 font-medium">Action</th>
                  </tr></thead>
                  <tbody>
                    {analyses.map(a => (
                      <tr key={a.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="p-3"><div className="text-white text-xs">{a.player}</div><div className="text-gray-500 text-xs">{a.sport}</div></td>
                        <td className="p-3 text-right font-mono text-white text-xs">${a.currentValue.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono text-xs"><span className={a.annualAppreciation > 0 ? 'text-emerald-400' : 'text-red-400'}>{a.annualAppreciation}%</span></td>
                        <td className="p-3 text-right font-mono text-amber-400 text-xs">${a.totalCostOfCarry.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono text-xs"><span className={a.netCarry > 0 ? 'text-emerald-400' : 'text-red-400'}>${a.netCarry.toLocaleString()}</span></td>
                        <td className="p-3 text-right font-mono text-xs"><span className={a.netCarryPct > 0 ? 'text-emerald-400' : 'text-red-400'}>{a.netCarryPct}%</span></td>
                        <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${REC_STYLES[a.recommendation]}`}>{a.recommendation.replace(/-/g, ' ')}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'components' && (
          <div className="space-y-6">
            <div className="flex gap-2 flex-wrap">
              {components.slice(0, 8).map((c, i) => (
                <button key={c.cardId} onClick={() => setSelectedCard(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCard === i ? 'bg-teal-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}>{analyses[i].player}</button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Carry Waterfall</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={components[selectedCard].components.map(c => ({
                    name: c.name,
                    value: c.value,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} formatter={(v: number) => `$${v.toLocaleString()}`} />
                    <Bar dataKey="value" name="Value ($)" radius={[4, 4, 0, 0]}>
                      {components[selectedCard].components.map((c, i) => (
                        <Cell key={i} fill={c.type === 'revenue' ? '#10b981' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Revenue vs Cost Split</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Gross Carry (Revenue)', value: Math.abs(components[selectedCard].totalRevenue) },
                        { name: 'Total Cost of Carry', value: Math.abs(components[selectedCard].totalCost) },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, value }) => `${name}: $${value.toLocaleString()}`}
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} formatter={(v: number) => `$${v.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Appreciation vs Cost of Carry (All Cards)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyses.map(a => ({
                  name: a.player,
                  appreciation: a.annualAppreciation,
                  costOfCarry: Math.round(a.totalCostOfCarry / a.currentValue * 1000) / 10,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="appreciation" name="Appreciation %" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="costOfCarry" name="Cost of Carry %" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'ranking' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Net Carry Ranking (Annual $)</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={netCarries} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis dataKey="player" type="category" width={130} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} formatter={(v: number) => `$${v.toLocaleString()}`} />
                  <Bar dataKey="netCarryAnnual" name="Net Carry (Annual $)" radius={[0, 4, 4, 0]}>
                    {netCarries.map((n, i) => (
                      <Cell key={i} fill={n.netCarryAnnual > 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800"><h3 className="text-sm font-semibold text-gray-300">Full Rankings</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-800">
                    <th className="text-center p-3 text-gray-500 font-medium">Rank</th>
                    <th className="text-left p-3 text-gray-500 font-medium">Card</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Annual $</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Monthly $</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Percentile</th>
                    <th className="text-center p-3 text-gray-500 font-medium">Category</th>
                  </tr></thead>
                  <tbody>
                    {netCarries.map(n => (
                      <tr key={n.cardId} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="p-3 text-center font-mono text-gray-400">#{n.rank}</td>
                        <td className="p-3 text-white text-xs">{n.player}</td>
                        <td className="p-3 text-right font-mono text-xs"><span className={n.netCarryAnnual > 0 ? 'text-emerald-400' : 'text-red-400'}>${n.netCarryAnnual.toLocaleString()}</span></td>
                        <td className="p-3 text-right font-mono text-xs"><span className={n.netCarryMonthly > 0 ? 'text-emerald-400' : 'text-red-400'}>${n.netCarryMonthly.toLocaleString()}</span></td>
                        <td className="p-3 text-right font-mono text-cyan-400 text-xs">{n.percentile}%</td>
                        <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CARRY_STYLES[n.category]}`}>{n.category.replace(/-/g, ' ')}</span></td>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Portfolio Carry Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} formatter={(v: number) => `$${v.toLocaleString()}`} />
                    <Area type="monotone" dataKey="totalPortfolioCarry" name="Total Carry ($)" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Appreciation vs Cost of Carry</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="avgAppreciation" name="Avg Appreciation %" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="avgCostOfCarry" name="Avg Cost of Carry %" stroke="#ef4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="avgNetCarry" name="Avg Net Carry %" stroke="#06b6d4" strokeWidth={2} />
                    <Legend />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Positive vs Negative Carry Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="positiveCarryCards" name="Positive Carry Cards" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="negativeCarryCards" name="Negative Carry Cards" fill="#ef4444" radius={[4, 4, 0, 0]} />
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
