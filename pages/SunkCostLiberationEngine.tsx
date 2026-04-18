import React, { useState } from 'react';
import {
  Unlock,
  AlertTriangle,
  TrendingDown,
  ArrowRight,
  DollarSign,
  Target,
  Brain,
  Sparkles,
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
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  getSunkCostCards,
  getLiberationOpportunities,
  getSunkCostPatterns,
  getSunkCostSummaryData,
  getSunkCostStats,
} from '../lib/sunkCostService.ts';

const TABS = ['Flagged Holdings', 'Liberation Queue', 'Historical Saves'] as const;
type Tab = typeof TABS[number];

const urgencyColors: Record<string, string> = {
  critical: 'text-red-400 bg-red-500/15',
  high: 'text-orange-400 bg-orange-500/15',
  medium: 'text-yellow-400 bg-yellow-500/15',
  low: 'text-green-400 bg-green-500/15',
};

const PIE_COLORS = ['#f87171', '#fb923c', '#facc15', '#4ade80'];

export default function SunkCostLiberationEngine() {
  const [activeTab, setActiveTab] = useState<Tab>('Flagged Holdings');
  const cards = getSunkCostCards();
  const opportunities = getLiberationOpportunities();
  const patterns = getSunkCostPatterns();
  const summary = getSunkCostSummaryData();
  const stats = getSunkCostStats();

  const urgencyDistribution = [
    { name: 'Critical', value: cards.filter(c => c.liberationUrgency === 'critical').length },
    { name: 'High', value: cards.filter(c => c.liberationUrgency === 'high').length },
    { name: 'Medium', value: cards.filter(c => c.liberationUrgency === 'medium').length },
    { name: 'Low', value: cards.filter(c => c.liberationUrgency === 'low').length },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Unlock size={22} className="text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Sunk Cost Liberation Engine</h1>
              <p className="text-gray-400 text-sm">Identify holdings kept due to sunk cost fallacy</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-purple-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide">Flagged Cards</span>
            </div>
            <p className="text-white font-bold text-3xl">{stats.totalFlagged}</p>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-red-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide">Critical</span>
            </div>
            <p className="text-red-400 font-bold text-3xl">{stats.criticalCards}</p>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={16} className="text-red-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide">Total Loss</span>
            </div>
            <p className="text-red-400 font-bold text-3xl">${stats.totalLoss.toLocaleString()}</p>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Brain size={16} className="text-yellow-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide">Avg Rational Score</span>
            </div>
            <p className="text-yellow-400 font-bold text-3xl">{stats.avgRationalScore}/100</p>
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
                  ? 'bg-gray-800 text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Flagged Holdings Tab */}
        {activeTab === 'Flagged Holdings' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Urgency Distribution */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="text-white font-semibold mb-4">Urgency Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={urgencyDistribution} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }: { name: string; value: number }) => `${name}: ${value}`}>
                      {urgencyDistribution.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Rational vs Emotional */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="text-white font-semibold mb-4">Rational vs Emotional Score</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={cards.slice(0, 8)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" />
                    <YAxis dataKey="cardName" type="category" stroke="#9ca3af" tick={{ fontSize: 9 }} width={120} tickFormatter={(v: string) => v.length > 18 ? v.slice(0, 18) + '...' : v} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="rationalScore" name="Rational" fill="#4ade80" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="emotionalScore" name="Emotional" fill="#f87171" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Card List */}
            <div className="space-y-3">
              {cards.filter(c => c.recommendation === 'sell').map(card => (
                <div key={card.id} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-white font-semibold">{card.cardName}</h4>
                      <p className="text-gray-500 text-xs">{card.sport} | Held: {card.holdDuration}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${urgencyColors[card.liberationUrgency]}`}>
                      {card.liberationUrgency.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm italic mb-3">&quot;{card.reasonForHolding}&quot;</p>
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <p className="text-gray-500 text-[10px] uppercase">Purchased</p>
                      <p className="text-white font-bold">${card.purchasePrice.toLocaleString()}</p>
                    </div>
                    <ArrowRight size={14} className="text-gray-600 mt-3" />
                    <div>
                      <p className="text-gray-500 text-[10px] uppercase">Current</p>
                      <p className="text-red-400 font-bold">${card.currentValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-[10px] uppercase">Loss</p>
                      <p className="text-red-400 font-bold">-{card.lossPercent}%</p>
                    </div>
                    <div className="ml-auto">
                      <p className="text-gray-500 text-[10px] uppercase">Rational Score</p>
                      <p className={`font-bold ${card.rationalScore < 20 ? 'text-red-400' : 'text-yellow-400'}`}>{card.rationalScore}/100</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Liberation Queue Tab */}
        {activeTab === 'Liberation Queue' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl border border-green-500/20 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={18} className="text-green-400" />
                <h3 className="text-white font-semibold">Liberation Opportunities</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">Sell these cards and redeploy capital into higher-potential alternatives</p>
              <div className="space-y-4">
                {opportunities.map(opp => (
                  <div key={opp.id} className="bg-gray-800/50 rounded-lg p-5">
                    <h4 className="text-white font-semibold mb-3">{opp.cardName}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 text-[10px] uppercase">Current Value</p>
                        <p className="text-yellow-400 font-bold">${opp.currentValue}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-[10px] uppercase">6-Month Projected</p>
                        <p className="text-red-400 font-bold">${opp.projectedValue6m}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-[10px] uppercase">Redeploy Into</p>
                        <p className="text-green-400 font-bold text-xs">{opp.alternativeInvestment}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-[10px] uppercase">Net Benefit</p>
                        <p className="text-green-400 font-bold">${opp.netBenefit}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Patterns */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-white font-semibold mb-4">Common Sunk Cost Patterns</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={patterns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="pattern" stroke="#9ca3af" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="frequency" name="Frequency %" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avgLoss" name="Avg Loss ($)" fill="#f87171" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Historical Saves Tab */}
        {activeTab === 'Historical Saves' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-white font-semibold mb-4">Sunk Cost Exposure Over Time</h3>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={summary}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} formatter={(v: number) => [`$${v.toLocaleString()}`, '']} />
                  <Legend />
                  <Area type="monotone" dataKey="totalTrapped" name="Total Trapped ($)" stroke="#f87171" fill="#f87171" fillOpacity={0.2} strokeWidth={2} />
                  <Area type="monotone" dataKey="totalCurrentValue" name="Current Value ($)" stroke="#4ade80" fill="#4ade80" fillOpacity={0.2} strokeWidth={2} />
                  <Area type="monotone" dataKey="liberationPotential" name="Liberation Potential ($)" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.2} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
