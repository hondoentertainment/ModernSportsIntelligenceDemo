import React, { useState } from 'react';
import {
  Megaphone,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Eye,
  Shield,
  BarChart3,
  CheckCircle2,
  XCircle,
  Activity,
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
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import {
  getCascadeNarratives,
  getNarrativeStrengthData,
  getTruthScores,
  getCascadeHistory,
  getCascadeStats,
} from '../lib/availabilityCascadeService.ts';

const TABS = ['Active Cascades', 'Narrative Strength', 'Truth Scores'] as const;
type Tab = typeof TABS[number];

const statusColors: Record<string, string> = {
  growing: 'text-red-400 bg-red-500/15',
  peaked: 'text-yellow-400 bg-yellow-500/15',
  declining: 'text-green-400 bg-green-500/15',
  debunked: 'text-gray-400 bg-gray-500/15',
};

const verdictColors: Record<string, string> = {
  'mostly-true': 'text-green-400 bg-green-500/15',
  'mixed': 'text-yellow-400 bg-yellow-500/15',
  'misleading': 'text-orange-400 bg-orange-500/15',
  'false': 'text-red-400 bg-red-500/15',
};

const CHART_COLORS = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#a78bfa', '#f472b6', '#34d399'];

export default function AvailabilityCascadeTracker() {
  const [activeTab, setActiveTab] = useState<Tab>('Active Cascades');
  const narratives = getCascadeNarratives();
  const strengthData = getNarrativeStrengthData();
  const truthScoresData = getTruthScores();
  const history = getCascadeHistory();
  const stats = getCascadeStats();

  const uniqueNarratives = [...new Set(strengthData.map(s => s.narrativeName))];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
              <Megaphone size={22} className="text-rose-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Availability Cascade Tracker</h1>
              <p className="text-slate-400 text-sm">Track how repeated narratives become accepted market truth</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Megaphone size={16} className="text-rose-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Active Narratives</span>
            </div>
            <p className="text-white font-bold text-3xl">{stats.activeNarratives}</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-orange-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Avg Strength</span>
            </div>
            <p className="text-orange-400 font-bold text-3xl">{stats.avgStrength}/100</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} className="text-red-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Avg Truth</span>
            </div>
            <p className="text-red-400 font-bold text-3xl">{stats.avgTruth}/100</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Eye size={16} className="text-blue-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Total Reach</span>
            </div>
            <p className="text-blue-400 font-bold text-3xl">{(stats.totalReach / 1000000).toFixed(1)}M</p>
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
                  ? 'bg-slate-800 text-rose-400 border-b-2 border-rose-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Active Cascades Tab */}
        {activeTab === 'Active Cascades' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h3 className="text-white font-semibold mb-4">Narrative Strength vs Truth Score</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={narratives}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="narrative" stroke="#94a3b8" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={80} tickFormatter={(v: string) => v.length > 22 ? v.slice(0, 22) + '...' : v} />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="strengthScore" name="Strength" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="truthScore" name="Truth" fill="#4ade80" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              {narratives.map(narrative => (
                <div key={narrative.id} className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">{narrative.narrative}</h4>
                      <p className="text-slate-500 text-xs mt-0.5">{narrative.category} | Origin: {narrative.originSource} ({narrative.originDate})</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ml-3 ${statusColors[narrative.status]}`}>
                      {narrative.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mb-3">{narrative.description}</p>
                  <div className="flex gap-6 text-xs text-slate-400">
                    <span>Strength: <span className="text-rose-400 font-bold">{narrative.strengthScore}</span></span>
                    <span>Truth: <span className={`font-bold ${narrative.truthScore > 50 ? 'text-green-400' : 'text-red-400'}`}>{narrative.truthScore}</span></span>
                    <span>Repeats: <span className="text-white">{narrative.repetitions.toLocaleString()}</span></span>
                    <span>Reach: <span className="text-blue-400">{(narrative.currentReach / 1000).toFixed(0)}K</span></span>
                    <span>Price Impact: <span className={`${narrative.priceImpact > 0 ? 'text-orange-400' : 'text-green-400'}`}>{narrative.priceImpact > 0 ? '+' : ''}{narrative.priceImpact}%</span></span>
                  </div>
                  {narrative.affectedCards.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {narrative.affectedCards.map((card, i) => (
                        <span key={i} className="text-[10px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded">{card}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Narrative Strength Tab */}
        {activeTab === 'Narrative Strength' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h3 className="text-white font-semibold mb-4">Narrative Strength Over Time</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={
                  ['Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026'].map(month => {
                    const point: Record<string, string | number> = { month };
                    uniqueNarratives.forEach(name => {
                      const item = strengthData.find(s => s.month === month && s.narrativeName === name);
                      if (item) point[name] = item.strength;
                    });
                    return point;
                  })
                }>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Legend />
                  {uniqueNarratives.map((name, i) => (
                    <Line key={name} type="monotone" dataKey={name} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={{ r: 4 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h3 className="text-white font-semibold mb-4">Cascade Activity Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Legend />
                  <Area type="monotone" dataKey="activeNarratives" name="Active Narratives" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.2} strokeWidth={2} />
                  <Area type="monotone" dataKey="avgStrength" name="Avg Strength" stroke="#fb923c" fill="#fb923c" fillOpacity={0.1} strokeWidth={2} />
                  <Area type="monotone" dataKey="avgTruth" name="Avg Truth" stroke="#4ade80" fill="#4ade80" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Truth Scores Tab */}
        {activeTab === 'Truth Scores' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h3 className="text-white font-semibold mb-4">Truth Score Breakdown</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={truthScoresData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" />
                  <YAxis dataKey="narrative" type="category" stroke="#94a3b8" tick={{ fontSize: 9 }} width={160} tickFormatter={(v: string) => v.length > 25 ? v.slice(0, 25) + '...' : v} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="dataSupport" name="Data Support" fill="#60a5fa" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="expertConsensus" name="Expert Consensus" fill="#a78bfa" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="historicalAccuracy" name="Historical Accuracy" fill="#4ade80" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              {truthScoresData.map((ts, i) => (
                <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-semibold text-sm">{ts.narrative}</h4>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${verdictColors[ts.verdict]}`}>
                      {ts.verdict.toUpperCase().replace('-', ' ')}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <p className="text-slate-500 text-[10px] uppercase mb-1">Claimed</p>
                      <p className="text-slate-300 text-xs">{ts.claimedTruth}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <p className="text-slate-500 text-[10px] uppercase mb-1">Evidence</p>
                      <p className="text-slate-300 text-xs">{ts.actualEvidence}</p>
                    </div>
                  </div>
                  <div className="flex gap-6 text-xs">
                    <div>
                      <p className="text-slate-500 uppercase">Truth Score</p>
                      <p className={`font-bold ${ts.truthScore > 50 ? 'text-green-400' : 'text-red-400'}`}>{ts.truthScore}/100</p>
                    </div>
                    <div>
                      <p className="text-slate-500 uppercase">Data Support</p>
                      <p className="text-blue-400 font-bold">{ts.dataSupport}/100</p>
                    </div>
                    <div>
                      <p className="text-slate-500 uppercase">Expert Consensus</p>
                      <p className="text-purple-400 font-bold">{ts.expertConsensus}/100</p>
                    </div>
                    <div>
                      <p className="text-slate-500 uppercase">Historical</p>
                      <p className="text-green-400 font-bold">{ts.historicalAccuracy}/100</p>
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
