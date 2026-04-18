import React, { useState } from 'react';
import {
  Heart,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BarChart3,
  DollarSign,
  Eye,
  Scale,
  Gem,
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import {
  getEndowmentBiases,
  getOwnershipPremiums,
  getEndowmentHistory,
  getEndowmentScores,
  getEndowmentStats,
} from '../lib/endowmentEffectService.ts';

const TABS = ['Active Biases', 'Premium History', 'Portfolio Bias Score'] as const;
type Tab = typeof TABS[number];

export default function EndowmentEffectCalculator() {
  const [activeTab, setActiveTab] = useState<Tab>('Active Biases');
  const biases = getEndowmentBiases();
  const premiums = getOwnershipPremiums();
  const history = getEndowmentHistory();
  const scores = getEndowmentScores();
  const stats = getEndowmentStats();

  const chartData = biases.slice(0, 10).map(b => ({
    name: b.cardName.length > 20 ? b.cardName.slice(0, 20) + '...' : b.cardName,
    perceived: b.ownerPerceivedValue > 10000 ? Math.round(b.ownerPerceivedValue / 1000) : b.ownerPerceivedValue,
    market: b.marketValue > 10000 ? Math.round(b.marketValue / 1000) : b.marketValue,
    unit: b.ownerPerceivedValue > 10000 ? 'K' : '$',
    markup: b.endowmentMarkup,
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
              <Heart size={22} className="text-pink-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Endowment Effect Calculator</h1>
              <p className="text-slate-400 text-sm">Quantify how ownership bias inflates your perceived values</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-pink-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Overvalued Cards</span>
            </div>
            <p className="text-white font-bold text-3xl">{stats.overvaluedCards}</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-orange-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Avg Markup</span>
            </div>
            <p className="text-orange-400 font-bold text-3xl">{stats.avgMarkup}%</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Eye size={16} className="text-blue-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">You Think</span>
            </div>
            <p className="text-blue-400 font-bold text-3xl">${(stats.totalPerceived / 1000).toFixed(0)}K</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={16} className="text-green-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Market Says</span>
            </div>
            <p className="text-green-400 font-bold text-3xl">${(stats.totalMarket / 1000).toFixed(0)}K</p>
            <p className="text-red-400 text-xs mt-1">Phantom: ${(stats.phantomValue / 1000).toFixed(0)}K</p>
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
                  ? 'bg-slate-800 text-pink-400 border-b-2 border-pink-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Active Biases Tab */}
        {activeTab === 'Active Biases' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h3 className="text-white font-semibold mb-4">Endowment Markup by Card (%)</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={biases.map(b => ({ name: b.cardName.length > 22 ? b.cardName.slice(0, 22) + '...' : b.cardName, markup: b.endowmentMarkup })).slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" height={80} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Bar dataKey="markup" name="Markup %" fill="#f472b6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Ownership Premium by Category */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h3 className="text-white font-semibold mb-4">Ownership Premium by Category</h3>
              <div className="space-y-3">
                {premiums.map((p, i) => (
                  <div key={i} className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white text-sm font-medium">{p.category}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${p.trend === 'increasing' ? 'text-red-400' : p.trend === 'decreasing' ? 'text-green-400' : 'text-slate-400'}`}>
                          {p.trend === 'increasing' ? 'Rising' : p.trend === 'decreasing' ? 'Falling' : 'Stable'}
                        </span>
                        <span className="text-pink-400 font-bold">{p.avgMarkup}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-pink-500 h-2 rounded-full" style={{ width: `${Math.min(p.avgMarkup, 100)}%` }} />
                    </div>
                    <p className="text-slate-500 text-xs mt-1">{p.sampleSize} cards analyzed</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Card Details */}
            <div className="space-y-3">
              {biases.filter(b => b.status === 'overvalued').slice(0, 6).map(bias => (
                <div key={bias.id} className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-white font-semibold text-sm">{bias.cardName}</h4>
                      <p className="text-slate-500 text-xs">{bias.sport} | Owned: {bias.ownershipDuration} | {bias.grade}</p>
                    </div>
                    <span className="text-pink-400 font-bold text-lg">+{bias.endowmentMarkup}%</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase">You Think</p>
                      <p className="text-blue-400 font-bold">${bias.ownerPerceivedValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase">Market Says</p>
                      <p className="text-green-400 font-bold">${bias.marketValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase">Emotional Attachment</p>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-700 rounded-full h-1.5">
                          <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${bias.emotionalAttachment}%` }} />
                        </div>
                        <span className="text-red-400 text-xs font-bold">{bias.emotionalAttachment}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Premium History Tab */}
        {activeTab === 'Premium History' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h3 className="text-white font-semibold mb-4">Endowment Markup Trend</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="avgMarkup" name="Avg Markup %" stroke="#f472b6" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="correctionsMade" name="Corrections Made" stroke="#4ade80" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="biasReduction" name="Bias Reduction %" stroke="#60a5fa" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h3 className="text-white font-semibold mb-4">Perceived vs Market Value Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} formatter={(v: number) => [`$${v.toLocaleString()}`, '']} />
                  <Legend />
                  <Bar dataKey="portfolioPerceivedValue" name="Perceived Value" fill="#f472b6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="portfolioMarketValue" name="Market Value" fill="#4ade80" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Portfolio Bias Score Tab */}
        {activeTab === 'Portfolio Bias Score' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h3 className="text-white font-semibold mb-4">Endowment Bias Radar</h3>
              <ResponsiveContainer width="100%" height={380}>
                <RadarChart data={scores.map(s => ({ metric: s.metric, score: s.score, benchmark: s.benchmark }))}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="metric" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis stroke="#475569" domain={[0, 100]} />
                  <Radar name="Your Score" dataKey="score" stroke="#f472b6" fill="#f472b6" fillOpacity={0.3} />
                  <Radar name="Benchmark" dataKey="benchmark" stroke="#4ade80" fill="#4ade80" fillOpacity={0.1} />
                  <Legend />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {scores.map((s, i) => (
                <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-white font-semibold text-sm">{s.metric}</h4>
                      <p className="text-slate-500 text-xs">{s.description}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-xl ${s.status === 'danger' ? 'text-red-400' : s.status === 'warning' ? 'text-yellow-400' : 'text-green-400'}`}>
                        {s.score}
                      </p>
                      <p className="text-slate-500 text-xs">Benchmark: {s.benchmark}</p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${s.status === 'danger' ? 'bg-red-500' : s.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${s.score}%` }}
                    />
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
