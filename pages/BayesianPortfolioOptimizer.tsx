import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import {
  Brain, TrendingUp, Shield, BarChart3, RefreshCw,
  Target, PieChart as PieIcon, ArrowRight, Layers
} from 'lucide-react';
import {
  getPriorDistributions, getPosteriorEstimates, getAllocationResults,
  getBayesianUpdates, getPortfolioSummary
} from '../lib/bayesianOptimizerService.ts';

const tabs = ['Current Allocation', 'Prior/Posterior', 'Update History', 'Optimization'] as const;
type Tab = typeof tabs[number];

const allocationColors = ['#22c55e', '#3b82f6', '#f59e0b', '#a855f7', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

export default function BayesianPortfolioOptimizer() {
  const [activeTab, setActiveTab] = useState<Tab>('Current Allocation');
  const priors = getPriorDistributions();
  const posteriors = getPosteriorEstimates();
  const allocations = getAllocationResults();
  const updates = getBayesianUpdates();
  const summary = getPortfolioSummary();

  const stats = [
    { label: 'Portfolio Value', value: `$${(summary.totalValue / 1000).toFixed(1)}k`, icon: Layers, color: '#22c55e' },
    { label: 'Expected Return', value: `${summary.expectedReturn}%`, icon: TrendingUp, color: '#3b82f6' },
    { label: 'Portfolio Risk', value: `${summary.portfolioRisk}%`, icon: Shield, color: '#f59e0b' },
    { label: 'Sharpe Ratio', value: summary.portfolioSharpe.toFixed(2), icon: Target, color: '#a855f7' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-500/20">
            <Brain size={24} className="text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Bayesian Portfolio Optimizer</h1>
            <p className="text-sm text-gray-400">Bayesian posterior-based portfolio allocation with prior updating</p>
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
                  ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Current Allocation' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Posterior-Optimized Allocation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={allocations} dataKey="posteriorWeight" nameKey="player" cx="50%" cy="50%" outerRadius={110} label={({ name, value }: { name: string; value: number }) => `${name}: ${(value * 100).toFixed(0)}%`}>
                      {allocations.map((a, i) => (
                        <Cell key={i} fill={allocationColors[i % allocationColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${(value * 100).toFixed(1)}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {allocations.map((a, i) => (
                    <div key={a.id} className="flex items-center gap-3 py-1">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: allocationColors[i % allocationColors.length] }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{a.player}</div>
                        <div className="text-xs text-gray-400">{a.sport}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">{(a.posteriorWeight * 100).toFixed(0)}%</div>
                        <div className="text-xs text-gray-400">${a.currentValue.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Prior vs Posterior Weights</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={allocations}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="player" stroke="#9ca3af" tick={{ fontSize: 9 }} />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} formatter={(value: number) => `${(value * 100).toFixed(1)}%`} />
                  <Legend />
                  <Bar dataKey="priorWeight" name="Prior Weight" fill="#6b7280" />
                  <Bar dataKey="posteriorWeight" name="Posterior Weight" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'Prior/Posterior' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Prior vs Posterior Expected Returns</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={posteriors}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="player" stroke="#9ca3af" tick={{ fontSize: 9 }} />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="priorMean" name="Prior Mean" fill="#6b7280" />
                  <Bar dataKey="posteriorMean" name="Posterior Mean" fill="#8b5cf6" />
                  <Bar dataKey="observedReturn" name="Observed Return" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Uncertainty Reduction (Std Dev)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={posteriors}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="player" stroke="#9ca3af" tick={{ fontSize: 9 }} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="priorStdDev" name="Prior Std Dev" fill="#ef4444" />
                  <Bar dataKey="posteriorStdDev" name="Posterior Std Dev" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {posteriors.map(pe => (
                <div key={pe.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <h4 className="text-sm font-semibold mb-1">{pe.player}</h4>
                  <p className="text-xs text-gray-400 mb-3">{pe.assetName}</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-gray-400">Prior Mean</span><span className="text-gray-300">{pe.priorMean}%</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Posterior Mean</span><span className="text-violet-400 font-bold">{pe.posteriorMean}%</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Shrinkage Factor</span><span className="text-blue-400">{pe.shrinkageFactor.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Updates Applied</span><span className="text-amber-400">{pe.updatesApplied}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Update History' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Bayesian Update Timeline</h3>
              <div className="space-y-3">
                {updates.map(update => (
                  <div key={update.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <RefreshCw size={14} className="text-violet-400" />
                        <span className="text-sm font-medium">{update.player}</span>
                        <span className="px-2 py-0.5 rounded text-xs bg-violet-500/20 text-violet-400">{update.eventType}</span>
                      </div>
                      <span className="text-xs text-gray-400">{update.date}</span>
                    </div>
                    <div className="flex gap-4 text-xs mb-2">
                      <span className="text-gray-400">
                        Mean: <span className="text-gray-300">{update.priorMeanBefore}%</span>
                        <ArrowRight size={10} className="inline mx-1" />
                        <span className={update.priorMeanAfter > update.priorMeanBefore ? 'text-emerald-400' : 'text-red-400'}>{update.priorMeanAfter}%</span>
                      </span>
                      <span className="text-gray-400">
                        Std: <span className="text-gray-300">{update.priorStdBefore}</span>
                        <ArrowRight size={10} className="inline mx-1" />
                        <span className="text-blue-400">{update.priorStdAfter}</span>
                      </span>
                      <span className="text-gray-400">Observation: <span className={update.observation >= 0 ? 'text-emerald-400' : 'text-red-400'}>{update.observation}%</span></span>
                    </div>
                    <p className="text-xs text-gray-500">{update.impact}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Optimization' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Risk-Return Profile</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={allocations}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="player" stroke="#9ca3af" tick={{ fontSize: 9 }} />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="expectedReturn" name="Expected Return" fill="#22c55e" />
                  <Bar dataKey="risk" name="Risk" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Sharpe Ratios</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={allocations.sort((a, b) => b.sharpeRatio - a.sharpeRatio)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="player" stroke="#9ca3af" tick={{ fontSize: 9 }} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Bar dataKey="sharpeRatio" name="Sharpe Ratio">
                    {allocations.sort((a, b) => b.sharpeRatio - a.sharpeRatio).map((a, i) => (
                      <Cell key={i} fill={a.sharpeRatio > 0.5 ? '#22c55e' : a.sharpeRatio > 0.3 ? '#f59e0b' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Portfolio Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="text-xs text-gray-400">Total Assets</div>
                  <div className="text-2xl font-bold text-violet-400">{summary.assetCount}</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="text-xs text-gray-400">Total Updates</div>
                  <div className="text-2xl font-bold text-blue-400">{summary.totalUpdates}</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="text-xs text-gray-400">Expected Return</div>
                  <div className="text-2xl font-bold text-emerald-400">{summary.expectedReturn}%</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="text-xs text-gray-400">Portfolio Risk</div>
                  <div className="text-2xl font-bold text-amber-400">{summary.portfolioRisk}%</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="text-xs text-gray-400">Sharpe Ratio</div>
                  <div className="text-2xl font-bold text-emerald-400">{summary.portfolioSharpe}</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="text-xs text-gray-400">Total Value</div>
                  <div className="text-2xl font-bold text-white">${summary.totalValue.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
