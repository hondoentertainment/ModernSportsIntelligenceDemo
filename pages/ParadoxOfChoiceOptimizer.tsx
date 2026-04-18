import React, { useState } from 'react';
import {
  Filter,
  Target,
  TrendingUp,
  Zap,
  BarChart3,
  CheckCircle2,
  Star,
  Layers,
  DollarSign,
  Clock,
  Award,
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
  getChoiceOverloads,
  getFilteredOpportunities,
  getTopPicks,
  getDecisionQuality,
  getOptimizationResults,
  getParadoxStats,
} from '../lib/paradoxOfChoiceService.ts';

const TABS = ['Filtered Picks', 'Full Opportunity Set', 'Decision Quality'] as const;
type Tab = typeof TABS[number];

const riskColors: Record<string, string> = {
  low: 'text-green-400 bg-green-500/15',
  medium: 'text-yellow-400 bg-yellow-500/15',
  high: 'text-red-400 bg-red-500/15',
};

const PIE_COLORS = ['#4ade80', '#facc15', '#f87171'];

export default function ParadoxOfChoiceOptimizer() {
  const [activeTab, setActiveTab] = useState<Tab>('Filtered Picks');
  const overloads = getChoiceOverloads();
  const allOpportunities = getFilteredOpportunities();
  const topPicks = getTopPicks();
  const quality = getDecisionQuality();
  const results = getOptimizationResults();
  const stats = getParadoxStats();

  const riskDistribution = [
    { name: 'Low Risk', value: allOpportunities.filter(o => o.riskLevel === 'low').length },
    { name: 'Medium Risk', value: allOpportunities.filter(o => o.riskLevel === 'medium').length },
    { name: 'High Risk', value: allOpportunities.filter(o => o.riskLevel === 'high').length },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
              <Filter size={22} className="text-teal-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Paradox of Choice Optimizer</h1>
              <p className="text-gray-400 text-sm">Reduce decision paralysis with smart filtering</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Star size={16} className="text-teal-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide">Top Picks</span>
            </div>
            <p className="text-teal-400 font-bold text-3xl">{stats.topPicks}</p>
            <p className="text-gray-500 text-xs mt-1">of {stats.totalOptions} options</p>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Filter size={16} className="text-blue-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide">Reduction</span>
            </div>
            <p className="text-blue-400 font-bold text-3xl">{stats.reductionPct}%</p>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Target size={16} className="text-yellow-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide">Top Confidence</span>
            </div>
            <p className="text-yellow-400 font-bold text-3xl">{stats.avgTopConfidence}%</p>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={16} className="text-green-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide">Success Rate</span>
            </div>
            <p className="text-green-400 font-bold text-3xl">{stats.successRate}%</p>
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
                  ? 'bg-gray-800 text-teal-400 border-b-2 border-teal-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filtered Picks Tab */}
        {activeTab === 'Filtered Picks' && (
          <div className="space-y-6">
            {/* Top 5 Picks */}
            <div className="bg-gray-900 rounded-xl border border-teal-500/20 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Award size={20} className="text-teal-400" />
                <h3 className="text-white font-semibold">Top 5 Filtered Picks</h3>
                <span className="text-gray-500 text-xs ml-2">From {stats.totalOptions} analyzed opportunities</span>
              </div>
              <div className="space-y-4">
                {topPicks.map((pick, i) => (
                  <div key={pick.id} className="bg-gray-800/50 rounded-lg p-5 border border-gray-700/50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-lg">
                          {i + 1}
                        </span>
                        <div>
                          <h4 className="text-white font-semibold text-sm">{pick.cardName}</h4>
                          <p className="text-gray-500 text-xs">{pick.sport} | {pick.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-teal-400 font-bold text-lg">{pick.matchScore}/100</p>
                        <p className="text-gray-500 text-[10px] uppercase">Match Score</p>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{pick.reason}</p>
                    <div className="flex gap-6 text-sm">
                      <div>
                        <p className="text-gray-500 text-[10px] uppercase">Price</p>
                        <p className="text-white font-bold">${pick.price.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-[10px] uppercase">Projected Return</p>
                        <p className="text-green-400 font-bold">+{pick.projectedReturn}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-[10px] uppercase">Confidence</p>
                        <p className="text-blue-400 font-bold">{pick.confidenceScore}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-[10px] uppercase">Risk</p>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${riskColors[pick.riskLevel]}`}>{pick.riskLevel.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Choice Overload Analysis */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-white font-semibold mb-4">Decision Paralysis by Category</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={overloads}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="category" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="decisionParalysis" name="Paralysis Score" fill="#f87171" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="satisfactionScore" name="Satisfaction" fill="#4ade80" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="regretRate" name="Regret Rate %" fill="#fb923c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Full Opportunity Set Tab */}
        {activeTab === 'Full Opportunity Set' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Risk Distribution */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="text-white font-semibold mb-4">Risk Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={riskDistribution} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }: { name: string; value: number }) => `${name}: ${value}`}>
                      {riskDistribution.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Match Score Distribution */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="text-white font-semibold mb-4">Match Score by Rank</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={allOpportunities.slice(0, 12).map(o => ({ rank: `#${o.rank}`, score: o.matchScore, confidence: o.confidenceScore }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="rank" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Bar dataKey="score" name="Match Score" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Full List */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <h3 className="text-white font-semibold">All {allOpportunities.length} Opportunities (Ranked)</h3>
              </div>
              <div className="divide-y divide-gray-800">
                {allOpportunities.map(opp => (
                  <div key={opp.id} className={`px-5 py-3 flex items-center justify-between ${opp.isTopPick ? 'bg-teal-500/5' : ''}`}>
                    <div className="flex items-center gap-3 flex-1">
                      <span className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold ${opp.isTopPick ? 'bg-teal-500/20 text-teal-400' : 'bg-gray-800 text-gray-400'}`}>
                        {opp.rank}
                      </span>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{opp.cardName}</p>
                        <p className="text-gray-500 text-xs">{opp.sport}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-xs">
                      <span className="text-white font-bold">${opp.price}</span>
                      <span className="text-green-400">+{opp.projectedReturn}%</span>
                      <span className="text-blue-400">{opp.confidenceScore}%</span>
                      <span className={`px-2 py-0.5 rounded font-bold ${riskColors[opp.riskLevel]}`}>{opp.riskLevel}</span>
                      <span className={`font-bold ${opp.matchScore >= 80 ? 'text-teal-400' : opp.matchScore >= 60 ? 'text-yellow-400' : 'text-gray-400'}`}>{opp.matchScore}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Decision Quality Tab */}
        {activeTab === 'Decision Quality' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-white font-semibold mb-4">Filtered vs Unfiltered Decision Success</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={quality}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="filteredSuccessRate" name="Filtered Success %" stroke="#14b8a6" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="unfilteredSuccessRate" name="Unfiltered Success %" stroke="#f87171" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-white font-semibold mb-4">Average Returns Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={quality}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="avgFilteredReturn" name="Filtered Return %" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avgUnfilteredReturn" name="Unfiltered Return %" fill="#f87171" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Optimization Results */}
            <div className="bg-gray-900 rounded-xl border border-teal-500/20 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={20} className="text-teal-400" />
                <h3 className="text-white font-semibold">Optimization Impact</h3>
              </div>
              <div className="space-y-4">
                {results.map((result, i) => (
                  <div key={i} className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-white text-sm font-medium">{result.metric}</h4>
                        <p className="text-gray-500 text-xs">{result.description}</p>
                      </div>
                      <span className="text-teal-400 font-bold text-lg">+{result.improvement.toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-xs">Before:</span>
                        <span className="text-red-400 font-bold">{result.before}{result.unit === '%' || result.unit === 'pts' ? result.unit : ` ${result.unit}`}</span>
                      </div>
                      <span className="text-gray-600">to</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-xs">After:</span>
                        <span className="text-green-400 font-bold">{result.after}{result.unit === '%' || result.unit === 'pts' ? result.unit : ` ${result.unit}`}</span>
                      </div>
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
