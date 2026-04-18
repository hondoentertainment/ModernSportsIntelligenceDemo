import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import {
  Calculator, TrendingUp, Target, DollarSign, BarChart3,
  Percent, Shield, AlertTriangle, Award, PieChart as PieIcon
} from 'lucide-react';
import {
  getKellyResults, getEdgeEstimates, getPositionSizes,
  getKellyHistory, getPortfolioValue, getStrongBets
} from '../lib/kellyCriterionService.ts';

const tabs = ['Position Sizer', 'Edge Estimates', 'Fractional Kelly', 'History'] as const;
type Tab = typeof tabs[number];

const ratingColors: Record<string, string> = {
  strong: '#22c55e',
  moderate: '#f59e0b',
  weak: '#ef4444',
  negative: '#dc2626',
};

export default function KellyCriterionPositionSizer() {
  const [activeTab, setActiveTab] = useState<Tab>('Position Sizer');
  const kellyResults = getKellyResults();
  const edgeEstimates = getEdgeEstimates();
  const positionSizes = getPositionSizes();
  const kellyHistory = getKellyHistory();
  const portfolioValue = getPortfolioValue();
  const strongBets = getStrongBets();

  const avgEdge = Math.round(kellyResults.reduce((s, k) => s + k.edge, 0) / kellyResults.length * 1000) / 10;
  const avgKelly = Math.round(kellyResults.reduce((s, k) => s + k.fullKelly, 0) / kellyResults.length * 1000) / 10;

  const stats = [
    { label: 'Portfolio Value', value: `$${(portfolioValue / 1000).toFixed(0)}k`, icon: DollarSign, color: '#22c55e' },
    { label: 'Strong Bets', value: strongBets.length.toString(), icon: Target, color: '#3b82f6' },
    { label: 'Avg Edge', value: `${avgEdge}%`, icon: TrendingUp, color: '#f59e0b' },
    { label: 'Avg Kelly', value: `${avgKelly}%`, icon: Calculator, color: '#a855f7' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-green-500/20">
            <Calculator size={24} className="text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Kelly Criterion Position Sizer</h1>
            <p className="text-sm text-gray-400">Optimal bet sizing for card investments using Kelly criterion</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">{s.label}</span>
                <s.icon size={16} style={{ color: s.color }} />
              </div>
              <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 border-b border-slate-800 pb-2">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Position Sizer' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Kelly Fraction by Card</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={kellyResults.sort((a, b) => b.fullKelly - a.fullKelly)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="player" stroke="#9ca3af" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={60} />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
                  />
                  <Legend />
                  <Bar dataKey="fullKelly" name="Full Kelly">
                    {kellyResults.sort((a, b) => b.fullKelly - a.fullKelly).map((k, i) => (
                      <Cell key={i} fill={ratingColors[k.kellyRating]} />
                    ))}
                  </Bar>
                  <Bar dataKey="halfKelly" name="Half Kelly" fill="#3b82f6" opacity={0.6} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Position Details</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-2 px-3 text-gray-400">Player</th>
                      <th className="text-left py-2 px-3 text-gray-400">Card</th>
                      <th className="text-right py-2 px-3 text-gray-400">Price</th>
                      <th className="text-right py-2 px-3 text-gray-400">Win %</th>
                      <th className="text-right py-2 px-3 text-gray-400">Edge</th>
                      <th className="text-right py-2 px-3 text-gray-400">Full Kelly</th>
                      <th className="text-right py-2 px-3 text-gray-400">Recommended</th>
                      <th className="text-right py-2 px-3 text-gray-400">Sizing $</th>
                      <th className="text-center py-2 px-3 text-gray-400">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kellyResults.map(kr => (
                      <tr key={kr.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-medium">{kr.player}</td>
                        <td className="py-2 px-3 text-gray-400 text-xs">{kr.cardName}</td>
                        <td className="py-2 px-3 text-right">${kr.currentPrice.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right text-blue-400">{(kr.winProbability * 100).toFixed(0)}%</td>
                        <td className="py-2 px-3 text-right text-emerald-400">{(kr.edge * 100).toFixed(1)}%</td>
                        <td className="py-2 px-3 text-right text-amber-400">{(kr.fullKelly * 100).toFixed(1)}%</td>
                        <td className="py-2 px-3 text-right text-violet-400">{(kr.recommendedFraction * 100).toFixed(1)}%</td>
                        <td className="py-2 px-3 text-right font-medium">${kr.optimalPositionSize.toLocaleString()}</td>
                        <td className="py-2 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: ratingColors[kr.kellyRating] + '22', color: ratingColors[kr.kellyRating] }}>
                            {kr.kellyRating}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Edge Estimates' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Estimated Edge by Card</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={edgeEstimates}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="player" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
                  />
                  <Legend />
                  <Bar dataKey="estimatedEdge" name="Estimated Edge" fill="#22c55e" />
                  <Bar dataKey="confidence" name="Confidence" fill="#3b82f6" opacity={0.6} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Win/Loss Profile</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={edgeEstimates}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="player" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
                  />
                  <Legend />
                  <Bar dataKey="avgWinSize" name="Avg Win Size" fill="#22c55e" />
                  <Bar dataKey="avgLossSize" name="Avg Loss Size" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {edgeEstimates.map(ee => (
                <div key={ee.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <h4 className="text-sm font-semibold mb-1">{ee.player}</h4>
                  <p className="text-xs text-gray-400 mb-3">{ee.cardName}</p>
                  <div className="bg-slate-800 rounded-lg p-3 mb-3">
                    <div className="text-xs text-gray-400">Edge Source</div>
                    <div className="text-sm text-emerald-400">{ee.edgeSource}</div>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between"><span className="text-gray-400">Edge</span><span className="text-emerald-400 font-bold">{(ee.estimatedEdge * 100).toFixed(1)}%</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Hit Rate</span><span className="text-blue-400">{(ee.historicalHitRate * 100).toFixed(0)}%</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Avg Win</span><span className="text-emerald-400">+{(ee.avgWinSize * 100).toFixed(0)}%</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Avg Loss</span><span className="text-red-400">-{(ee.avgLossSize * 100).toFixed(0)}%</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Sample Size</span><span className="text-gray-300">{ee.sampleSize} trades</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Confidence</span><span className="text-amber-400">{(ee.confidence * 100).toFixed(0)}%</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Fractional Kelly' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">Fractional Kelly Strategy</h3>
              <p className="text-xs text-gray-400 mb-4">Full Kelly maximizes long-term growth but with high variance. Half Kelly or Quarter Kelly reduces risk of ruin while preserving most of the growth.</p>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={kellyResults.filter(k => k.kellyRating !== 'negative').sort((a, b) => b.fullKelly - a.fullKelly)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="player" stroke="#9ca3af" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={60} />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
                  />
                  <Legend />
                  <Bar dataKey="fullKelly" name="Full Kelly" fill="#22c55e" />
                  <Bar dataKey="halfKelly" name="Half Kelly" fill="#3b82f6" />
                  <Bar dataKey="quarterKelly" name="Quarter Kelly" fill="#a855f7" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Dollar Position Sizes (Half Kelly Recommended)</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={positionSizes.sort((a, b) => b.recommendedDollars - a.recommendedDollars).slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="player" stroke="#9ca3af" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={60} />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                  />
                  <Legend />
                  <Bar dataKey="fullKellyDollars" name="Full Kelly $" fill="#22c55e" opacity={0.4} />
                  <Bar dataKey="recommendedDollars" name="Recommended $" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Risk of Ruin</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={positionSizes.sort((a, b) => b.riskOfRuin - a.riskOfRuin)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="player" stroke="#9ca3af" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={60} />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Bar dataKey="riskOfRuin" name="Risk of Ruin %">
                    {positionSizes.sort((a, b) => b.riskOfRuin - a.riskOfRuin).map((p, i) => (
                      <Cell key={i} fill={p.riskOfRuin > 30 ? '#ef4444' : p.riskOfRuin > 15 ? '#f59e0b' : '#22c55e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'History' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Kelly vs Actual Portfolio Returns</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={kellyHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="kellyReturn" name="Kelly Return" stroke="#22c55e" strokeWidth={2} />
                  <Line type="monotone" dataKey="portfolioReturn" name="Actual Return" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Average Edge Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={kellyHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} formatter={(value: number) => `${(value * 100).toFixed(1)}%`} />
                  <Legend />
                  <Area type="monotone" dataKey="avgEdge" name="Avg Edge" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
                  <Area type="monotone" dataKey="avgKellyFraction" name="Avg Kelly Fraction" stroke="#a855f7" fill="#a855f7" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Bet Sizing Accuracy</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={kellyHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="optimalBets" name="Optimal Bets" fill="#22c55e" />
                  <Bar dataKey="overbet" name="Overbet" fill="#ef4444" />
                  <Bar dataKey="underbet" name="Underbet" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
