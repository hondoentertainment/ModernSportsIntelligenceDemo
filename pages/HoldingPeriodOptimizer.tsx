import React, { useState } from 'react';
import {
  Timer, TrendingUp, Target, BarChart3, Clock, ArrowUpRight,
  ArrowDownRight, Minus, CheckCircle2, AlertTriangle, Shield
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import {
  getHoldingAnalyses, getReturnCurves, getOptimalWindows,
  getHoldingComparisons, getHoldingSummary,
  HoldingAnalysis, ReturnCurve, OptimalWindow, HoldingComparison
} from '../lib/holdingPeriodService.ts';

const TABS = [
  { id: 'holdings', label: 'Holdings', icon: <Timer className="w-4 h-4" /> },
  { id: 'curves', label: 'Return Curves', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'windows', label: 'Optimal Windows', icon: <Target className="w-4 h-4" /> },
  { id: 'strategies', label: 'Strategies', icon: <BarChart3 className="w-4 h-4" /> },
] as const;

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

const REC_STYLES: Record<string, string> = {
  'hold': 'bg-blue-500/20 text-blue-400',
  'sell': 'bg-red-500/20 text-red-400',
  'extend': 'bg-violet-500/20 text-violet-400',
  'at-optimal': 'bg-emerald-500/20 text-emerald-400',
};

const REC_LABELS: Record<string, string> = {
  'hold': 'Hold',
  'sell': 'Sell Now',
  'extend': 'Extend',
  'at-optimal': 'At Optimal',
};

const PHASE_STYLES: Record<string, string> = {
  'entry-window': 'bg-emerald-500/20 text-emerald-400',
  'hold-phase': 'bg-blue-500/20 text-blue-400',
  'exit-window': 'bg-amber-500/20 text-amber-400',
  'off-cycle': 'bg-gray-500/20 text-gray-400',
};

const PHASE_LABELS: Record<string, string> = {
  'entry-window': 'Entry Window',
  'hold-phase': 'Hold Phase',
  'exit-window': 'Exit Window',
  'off-cycle': 'Off Cycle',
};

export default function HoldingPeriodOptimizer() {
  const [activeTab, setActiveTab] = useState<string>('holdings');

  const analyses = getHoldingAnalyses();
  const curves = getReturnCurves();
  const windows = getOptimalWindows();
  const comparisons = getHoldingComparisons();
  const summary = getHoldingSummary();

  const stats = [
    { label: 'Avg Hold Efficiency', value: `${summary.avgHoldEfficiency}%`, icon: <Timer className="w-5 h-5" />, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Cards at Optimal', value: summary.cardsAtOptimal, icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Avg Optimal Hold', value: summary.avgOptimalHold, icon: <Clock className="w-5 h-5" />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Best Strategy Return', value: `${summary.bestStrategyReturn}%`, icon: <TrendingUp className="w-5 h-5" />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  const curveChartData = curves.map(c => ({
    period: c.period,
    avg: c.avgReturn,
    best: c.bestCase,
    worst: c.worstCase,
    median: c.medianReturn,
  }));

  const windowChartData = windows.map(w => ({
    name: w.segment.length > 20 ? w.segment.substring(0, 20) + '...' : w.segment,
    expectedReturn: w.expectedReturn,
    confidence: w.confidence,
    fullName: w.segment,
  }));

  const strategyChartData = comparisons.map(c => ({
    name: c.strategy,
    totalReturn: c.totalReturn,
    annualized: c.annualizedReturn,
    sharpe: c.sharpeRatio,
    winRate: c.winRate,
  }));

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-500/20">
            <Timer className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Holding Period Optimizer</h1>
            <p className="text-sm text-gray-400">Analyze optimal hold durations, return curves, and timing windows</p>
          </div>
        </div>

        {/* Stat Cards */}
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

        {/* Tab Bar */}
        <div className="flex gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}>{tab.icon}{tab.label}</button>
          ))}
        </div>

        {/* Tab: Holdings */}
        {activeTab === 'holdings' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Holding Analysis</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-2 text-gray-500 font-medium">Card</th>
                      <th className="text-left py-3 px-2 text-gray-500 font-medium">Category</th>
                      <th className="text-right py-3 px-2 text-gray-500 font-medium">Current / Optimal</th>
                      <th className="text-right py-3 px-2 text-gray-500 font-medium">Return</th>
                      <th className="text-center py-3 px-2 text-gray-500 font-medium">Efficiency</th>
                      <th className="text-center py-3 px-2 text-gray-500 font-medium">Rec</th>
                      <th className="text-right py-3 px-2 text-gray-500 font-medium">Over-Hold Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyses.map((a) => (
                      <tr key={a.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="py-3 px-2">
                          <div className="text-white font-medium truncate max-w-[220px]">{a.cardName}</div>
                          <div className="text-xs text-gray-500">{a.id}</div>
                        </td>
                        <td className="py-3 px-2 text-gray-400">{a.category}</td>
                        <td className="py-3 px-2 text-right text-gray-300">
                          <span className="text-white">{a.currentHoldDays}d</span>
                          <span className="text-gray-600 mx-1">/</span>
                          <span className="text-gray-400">{a.optimalHoldDays}d</span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span className={a.currentReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                            {a.currentReturn >= 0 ? '+' : ''}{a.currentReturn}%
                          </span>
                          <div className="text-xs text-gray-500">proj: +{a.projectedOptimalReturn}%</div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  a.holdEfficiency >= 80 ? 'bg-emerald-500' :
                                  a.holdEfficiency >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(a.holdEfficiency, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400 w-8 text-right">{a.holdEfficiency}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${REC_STYLES[a.recommendation]}`}>
                            {REC_LABELS[a.recommendation]}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span className={
                            a.riskOfOverholding >= 70 ? 'text-red-400' :
                            a.riskOfOverholding >= 40 ? 'text-amber-400' : 'text-gray-400'
                          }>
                            {a.riskOfOverholding}%
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

        {/* Tab: Return Curves */}
        {activeTab === 'curves' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Return Curves by Holding Period</h3>
              <ResponsiveContainer width="100%" height={380}>
                <LineChart data={curveChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="period" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.75rem' }}
                    labelStyle={{ color: '#e5e7eb' }}
                    formatter={(value: number) => [`${value}%`]}
                  />
                  <Legend wrapperStyle={{ color: '#9ca3af' }} />
                  <Line type="monotone" dataKey="best" stroke="#10b981" name="Best Case" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="avg" stroke="#8b5cf6" name="Avg Return" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="median" stroke="#06b6d4" name="Median" strokeWidth={2} dot={{ r: 4 }} strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="worst" stroke="#ef4444" name="Worst Case" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {curves.map((c, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-white">{c.period}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      c.winRate >= 65 ? 'bg-emerald-500/20 text-emerald-400' :
                      c.winRate >= 55 ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>Win: {c.winRate}%</span>
                  </div>
                  <div className="text-xl font-bold text-emerald-400 mb-1">+{c.avgReturn}%</div>
                  <div className="text-xs text-gray-500">Avg Return</div>
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-800">
                    <div>
                      <div className="text-xs text-gray-500">Sharpe</div>
                      <div className="text-sm font-medium text-gray-300">{c.sharpe}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Best/Worst</div>
                      <div className="text-sm">
                        <span className="text-emerald-400">+{c.bestCase}%</span>
                        <span className="text-gray-600 mx-1">/</span>
                        <span className="text-red-400">{c.worstCase}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Optimal Windows */}
        {activeTab === 'windows' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Expected Returns by Segment</h3>
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={windowChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis type="number" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} unit="%" />
                  <YAxis type="category" dataKey="name" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 11 }} width={160} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.75rem' }}
                    labelStyle={{ color: '#e5e7eb' }}
                    formatter={(value: number, name: string) => [`${value}%`, name === 'expectedReturn' ? 'Expected Return' : 'Confidence']}
                  />
                  <Bar dataKey="expectedReturn" name="Expected Return" radius={[0, 6, 6, 0]}>
                    {windowChartData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {windows.map((w) => (
                <div key={w.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-sm font-semibold text-white">{w.segment}</span>
                      <div className="text-xs text-gray-500 mt-0.5">{w.id}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${PHASE_STYLES[w.currentPhase]}`}>
                      {PHASE_LABELS[w.currentPhase]}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-3 mt-3">
                    <div>
                      <div className="text-xs text-gray-500">Entry</div>
                      <div className="text-sm font-medium text-gray-300">{w.optimalEntryMonth.substring(0, 3)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Exit</div>
                      <div className="text-sm font-medium text-gray-300">{w.optimalExitMonth.substring(0, 3)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Hold</div>
                      <div className="text-sm font-medium text-gray-300">{w.avgHoldMonths}m</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Return</div>
                      <div className="text-sm font-bold text-emerald-400">+{w.expectedReturn}%</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-800">
                    <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${w.confidence}%` }} />
                    </div>
                    <span className="text-xs text-gray-400">{w.confidence}% conf</span>
                    <span className="text-xs text-gray-600">|</span>
                    <span className="text-xs text-gray-500">n={w.sampleSize}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Strategies */}
        {activeTab === 'strategies' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Strategy Return Comparison</h3>
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={strategyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.75rem' }}
                    labelStyle={{ color: '#e5e7eb' }}
                  />
                  <Legend wrapperStyle={{ color: '#9ca3af' }} />
                  <Bar dataKey="totalReturn" name="Total Return %" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="annualized" name="Annualized %" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Strategy Comparison Table</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-2 text-gray-500 font-medium">Strategy</th>
                      <th className="text-right py-3 px-2 text-gray-500 font-medium">Avg Hold</th>
                      <th className="text-right py-3 px-2 text-gray-500 font-medium">Total Return</th>
                      <th className="text-right py-3 px-2 text-gray-500 font-medium">Annualized</th>
                      <th className="text-right py-3 px-2 text-gray-500 font-medium">Max Drawdown</th>
                      <th className="text-right py-3 px-2 text-gray-500 font-medium">Sharpe</th>
                      <th className="text-right py-3 px-2 text-gray-500 font-medium">Win Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisons.map((c) => (
                      <tr key={c.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="py-3 px-2">
                          <div className="text-white font-medium">{c.strategy}</div>
                        </td>
                        <td className="py-3 px-2 text-right text-gray-300">{c.avgHoldPeriod}</td>
                        <td className="py-3 px-2 text-right text-emerald-400 font-medium">+{c.totalReturn}%</td>
                        <td className="py-3 px-2 text-right text-violet-400 font-medium">+{c.annualizedReturn}%</td>
                        <td className="py-3 px-2 text-right text-red-400">{c.maxDrawdown}%</td>
                        <td className="py-3 px-2 text-right">
                          <span className={
                            c.sharpeRatio >= 0.85 ? 'text-emerald-400' :
                            c.sharpeRatio >= 0.6 ? 'text-blue-400' : 'text-gray-400'
                          }>{c.sharpeRatio}</span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            c.winRate >= 65 ? 'bg-emerald-500/20 text-emerald-400' :
                            c.winRate >= 55 ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                          }`}>{c.winRate}%</span>
                        </td>
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
