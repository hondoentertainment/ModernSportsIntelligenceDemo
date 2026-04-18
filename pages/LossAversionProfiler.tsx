import React, { useState } from 'react';
import {
  Scale,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Brain,
  BarChart3,
  DollarSign,
  Target,
  Activity,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import {
  getLossAversionProfile,
  getTradeDecisions,
  getAversionCoefficients,
  getAversionPatterns,
  getLossAversionStats,
} from '../lib/lossAversionService.ts';

const TABS = ['My Profile', 'Trade Analysis', 'Coefficient History'] as const;
type Tab = typeof TABS[number];

const PIE_COLORS = ['#f87171', '#4ade80', '#60a5fa', '#facc15'];

export default function LossAversionProfiler() {
  const [activeTab, setActiveTab] = useState<Tab>('My Profile');
  const profile = getLossAversionProfile();
  const trades = getTradeDecisions();
  const coefficients = getAversionCoefficients();
  const patterns = getAversionPatterns();
  const stats = getLossAversionStats();

  const tradeOutcomeData = [
    { name: 'Loss Aversion Trades', value: trades.filter(t => t.lossAversionIndicator).length },
    { name: 'Rational Trades', value: trades.filter(t => t.wasRational).length },
    { name: 'Premature Sells', value: trades.filter(t => !t.wasRational && !t.lossAversionIndicator).length },
  ];

  const actionDistribution = [
    { name: 'Held (Loss Aversion)', value: trades.filter(t => t.action === 'held' && t.lossAversionIndicator).length },
    { name: 'Held (Rational)', value: trades.filter(t => t.action === 'held' && !t.lossAversionIndicator).length },
    { name: 'Sold', value: trades.filter(t => t.action === 'sold').length },
    { name: 'Bought More', value: trades.filter(t => t.action === 'bought-more').length },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Scale size={22} className="text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Loss Aversion Profiler</h1>
              <p className="text-slate-400 text-sm">Map your personal loss aversion coefficients from trading history</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Brain size={16} className="text-amber-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Coefficient</span>
            </div>
            <p className="text-amber-400 font-bold text-3xl">{stats.coefficient}x</p>
            <p className="text-slate-500 text-xs mt-1">Losses feel {stats.coefficient}x worse than gains</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-red-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Aversion Rate</span>
            </div>
            <p className="text-red-400 font-bold text-3xl">{stats.lossAversionRate}%</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={16} className="text-green-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Rational Rate</span>
            </div>
            <p className="text-green-400 font-bold text-3xl">{stats.rationalRate}%</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={16} className="text-red-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Cost of Aversion</span>
            </div>
            <p className="text-red-400 font-bold text-3xl">${stats.totalCostOfAversion.toLocaleString()}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-0">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab
                  ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* My Profile Tab */}
        {activeTab === 'My Profile' && (
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-slate-900 rounded-xl border border-amber-500/20 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain size={20} className="text-amber-400" />
                <h3 className="text-white font-semibold">Your Loss Aversion Profile</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-slate-500 text-xs uppercase">Overall Coefficient</p>
                  <p className="text-amber-400 font-bold text-2xl">{profile.overallCoefficient}x</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase">Risk Category</p>
                  <p className="text-white font-bold capitalize">{profile.riskCategory.replace('-', ' ')}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase">Percentile</p>
                  <p className="text-white font-bold">{profile.percentile}th</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase">Holding Bias</p>
                  <p className="text-red-400 font-bold text-sm">{profile.holdingPeriodBias}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Trade Outcome Distribution */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                <h3 className="text-white font-semibold mb-4">Trade Decision Quality</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={tradeOutcomeData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }: { name: string; value: number }) => `${name}: ${value}`}>
                      {tradeOutcomeData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Action Distribution */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                <h3 className="text-white font-semibold mb-4">Action Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={actionDistribution} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }: { name: string; value: number }) => `${value}`}>
                      {actionDistribution.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Coefficients */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h3 className="text-white font-semibold mb-4">Aversion Coefficient by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={coefficients}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="category" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="coefficient" name="Coefficient" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sellWinRate" name="Sell Winners %" fill="#4ade80" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sellLossRate" name="Sell Losers %" fill="#f87171" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Trade Analysis Tab */}
        {activeTab === 'Trade Analysis' && (
          <div className="space-y-3">
            {trades.map(trade => (
              <div key={trade.id} className={`bg-slate-900 rounded-xl border p-5 ${trade.lossAversionIndicator ? 'border-red-500/20' : trade.wasRational ? 'border-green-500/20' : 'border-slate-800'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-white font-semibold text-sm">{trade.cardName}</h4>
                    <p className="text-slate-500 text-xs">{trade.sport} | {trade.decisionDate}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {trade.lossAversionIndicator && (
                      <span className="px-2 py-0.5 rounded text-xs font-bold text-red-400 bg-red-500/15">LOSS AVERSION</span>
                    )}
                    {trade.wasRational && (
                      <span className="px-2 py-0.5 rounded text-xs font-bold text-green-400 bg-green-500/15">RATIONAL</span>
                    )}
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      trade.action === 'sold' ? 'text-blue-400 bg-blue-500/15' :
                      trade.action === 'held' ? 'text-yellow-400 bg-yellow-500/15' :
                      'text-purple-400 bg-purple-500/15'
                    }`}>
                      {trade.action.toUpperCase()}
                    </span>
                  </div>
                </div>
                <p className="text-slate-400 text-sm mb-3">{trade.reason}</p>
                <div className="flex gap-6 text-sm">
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase">Purchased</p>
                    <p className="text-white font-bold">${trade.purchasePrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase">Decision Price</p>
                    <p className="text-white font-bold">${trade.decisionPrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase">Current</p>
                    <p className="text-white font-bold">${trade.currentPrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase">P/L</p>
                    <p className={`font-bold ${trade.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {trade.profitLoss >= 0 ? '+' : ''}${trade.profitLoss.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Coefficient History Tab */}
        {activeTab === 'Coefficient History' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h3 className="text-white font-semibold mb-4">Coefficient Trend Over Time</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={patterns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" domain={[1, 3]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="coefficient" name="Coefficient" stroke="#f59e0b" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h3 className="text-white font-semibold mb-4">Decision Breakdown by Month</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={patterns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="lossHolds" name="Loss Holds" fill="#f87171" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="gainSells" name="Gain Sells" fill="#fb923c" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="rationalDecisions" name="Rational" fill="#4ade80" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h3 className="text-white font-semibold mb-4">Cost of Loss Aversion</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={patterns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} formatter={(v: number) => [`$${v.toLocaleString()}`, 'Cost']} />
                  <Bar dataKey="costOfAversion" name="Cost ($)" fill="#f87171" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
