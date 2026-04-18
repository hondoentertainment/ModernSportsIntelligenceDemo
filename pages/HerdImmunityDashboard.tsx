import React, { useState } from 'react';
import {
  Users,
  Shield,
  AlertTriangle,
  TrendingUp,
  Activity,
  Target,
  Zap,
  DollarSign,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
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
  Cell,
} from 'recharts';
import {
  getHerdSignals,
  getBubbleExposures,
  getImmunityScores,
  getHerdHistory,
  getHerdStats,
} from '../lib/herdImmunityService.ts';

const TABS = ['Immunity Score', 'Herd Signals', 'Bubble Exposure', 'History'] as const;
type Tab = typeof TABS[number];

const statusColors: Record<string, string> = {
  active: 'text-red-400 bg-red-500/15',
  building: 'text-orange-400 bg-orange-500/15',
  peaked: 'text-yellow-400 bg-yellow-500/15',
  declining: 'text-green-400 bg-green-500/15',
};

const riskColors: Record<string, string> = {
  extreme: 'text-red-400 bg-red-500/15',
  high: 'text-orange-400 bg-orange-500/15',
  moderate: 'text-yellow-400 bg-yellow-500/15',
  low: 'text-green-400 bg-green-500/15',
};

export default function HerdImmunityDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('Immunity Score');
  const signals = getHerdSignals();
  const exposures = getBubbleExposures();
  const immunityScores = getImmunityScores();
  const history = getHerdHistory();
  const stats = getHerdStats();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Shield size={22} className="text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Herd Immunity Dashboard</h1>
              <p className="text-gray-400 text-sm">Score your portfolio resistance to herd-driven market bubbles</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} className="text-emerald-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide">Immunity Score</span>
            </div>
            <p className="text-emerald-400 font-bold text-3xl">{stats.overallImmunity}/100</p>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} className="text-red-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide">Active Signals</span>
            </div>
            <p className="text-red-400 font-bold text-3xl">{stats.activeSignals}</p>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={16} className="text-orange-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide">At Risk</span>
            </div>
            <p className="text-orange-400 font-bold text-3xl">${stats.totalAtRisk.toLocaleString()}</p>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-yellow-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide">High Exposure</span>
            </div>
            <p className="text-yellow-400 font-bold text-3xl">{stats.extremeExposures}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-800 pb-0">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab
                  ? 'bg-gray-800 text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Immunity Score Tab */}
        {activeTab === 'Immunity Score' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-white font-semibold mb-4">Immunity Radar</h3>
              <ResponsiveContainer width="100%" height={380}>
                <RadarChart data={immunityScores.map(s => ({ category: s.category, score: s.score, max: s.maxScore }))}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="category" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis stroke="#4b5563" domain={[0, 100]} />
                  <Radar name="Your Score" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Radar name="Maximum" dataKey="max" stroke="#374151" fill="transparent" strokeDasharray="5 5" />
                  <Legend />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {immunityScores.map((score, i) => (
                <div key={i} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-white font-semibold text-sm">{score.category}</h4>
                      <p className="text-gray-500 text-xs">{score.description}</p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <span className={`text-xs ${score.trend === 'improving' ? 'text-green-400' : score.trend === 'declining' ? 'text-red-400' : 'text-gray-400'}`}>
                        {score.trend === 'improving' ? 'Improving' : score.trend === 'declining' ? 'Declining' : 'Stable'}
                      </span>
                      <span className="text-emerald-400 font-bold text-xl">{score.score}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${score.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Herd Signals Tab */}
        {activeTab === 'Herd Signals' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-white font-semibold mb-4">Signal Intensity by Category</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={signals.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="signalName" stroke="#9ca3af" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={70} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="herdIntensity" name="Herd Intensity" fill="#f87171" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="priceInflation" name="Price Inflation %" fill="#fb923c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {signals.map(signal => (
                <div key={signal.id} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-white font-semibold text-sm">{signal.signalName}</h4>
                      <p className="text-gray-500 text-xs">{signal.category} | Source: {signal.source}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${statusColors[signal.status]}`}>
                      {signal.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{signal.description}</p>
                  <div className="flex gap-6 text-xs text-gray-400">
                    <span>Intensity: <span className="text-red-400 font-bold">{signal.herdIntensity}</span></span>
                    <span>Affected: <span className="text-white">{signal.affectedCards} cards</span></span>
                    <span>Inflation: <span className="text-orange-400">+{signal.priceInflation}%</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bubble Exposure Tab */}
        {activeTab === 'Bubble Exposure' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-white font-semibold mb-4">Bubble Premium by Card</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={exposures.map(e => ({ name: e.cardName.length > 25 ? e.cardName.slice(0, 25) + '...' : e.cardName, premium: e.bubblePremium, herdPct: e.herdDrivenPct }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={70} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="premium" name="Bubble Premium %" fill="#f87171" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="herdPct" name="Herd-Driven %" fill="#fb923c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {exposures.map(exposure => (
                <div key={exposure.id} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-white font-semibold text-sm">{exposure.cardName}</h4>
                      <p className="text-gray-500 text-xs">{exposure.sport} | Signal: {exposure.relatedSignal}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${riskColors[exposure.riskLevel]}`}>
                      {exposure.riskLevel.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex gap-6 text-sm mt-3">
                    <div>
                      <p className="text-gray-500 text-[10px] uppercase">Current</p>
                      <p className="text-white font-bold">${exposure.currentPrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-[10px] uppercase">Fair Value</p>
                      <p className="text-green-400 font-bold">${exposure.estimatedFairValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-[10px] uppercase">Bubble Premium</p>
                      <p className="text-red-400 font-bold">+{exposure.bubblePremium}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-[10px] uppercase">Herd-Driven</p>
                      <p className="text-orange-400 font-bold">{exposure.herdDrivenPct}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'History' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-white font-semibold mb-4">18-Month Immunity Trend</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="immunityScore" name="Immunity Score" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="herdExposure" name="Herd Exposure %" stroke="#f87171" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-white font-semibold mb-4">Portfolio at Risk Over Time</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} formatter={(v: number) => [`$${v.toLocaleString()}`, 'At Risk']} />
                  <Area type="monotone" dataKey="portfolioAtRisk" name="Portfolio at Risk" stroke="#f87171" fill="#f87171" fillOpacity={0.2} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
