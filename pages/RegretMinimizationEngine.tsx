// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, TrendingUp, DollarSign, Frown, Plus, X, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import {
  getPassedCards,
  getTopRegrets,
  getRegretPatterns,
  getRegretCoefficient,
  getRegretAlerts,
  getRegretTimeline,
  getRegretSummary,
  formatCurrency,
  type PassedCard,
  type RegretPattern,
  type RegretCoefficient,
  type RegretAlert,
  type RegretSummary,
} from '../lib/analytics/regretMinimizationService.ts';

const CHART_COLORS = ['#f87171', '#fb923c', '#fbbf24', '#a78bfa', '#60a5fa', '#34d399'];

const RegretMinimizationEngine: React.FC = () => {
  const [passedCards, setPassedCards] = useState<PassedCard[]>([]);
  const [topRegrets, setTopRegrets] = useState<PassedCard[]>([]);
  const [patterns, setPatterns] = useState<RegretPattern[]>([]);
  const [coefficient, setCoefficient] = useState<RegretCoefficient | null>(null);
  const [alerts, setAlerts] = useState<RegretAlert[]>([]);
  const [timeline, setTimeline] = useState<ReturnType<typeof getRegretTimeline>>([]);
  const [summary, setSummary] = useState<RegretSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      setPassedCards(getPassedCards());
      setTopRegrets(getTopRegrets(5));
      setPatterns(getRegretPatterns());
      setCoefficient(getRegretCoefficient());
      setAlerts(getRegretAlerts());
      setTimeline(getRegretTimeline());
      setSummary(getRegretSummary());
      setLoading(false);
    } catch {
      setError('Failed to load Regret Minimization Engine data');
      setLoading(false);
    }
  }, []);

  const patternChartData = useMemo(() =>
    patterns.map(p => ({
      name: p.patternType,
      regretScore: p.avgRegretScore,
      missedValue: Math.round(p.estimatedMissedValue / 1000),
    })), [patterns]);

  const timelineChartData = useMemo(() =>
    timeline.map(t => ({
      month: t.month,
      regretScore: t.regretScore,
      passedCards: t.passedCards,
    })), [timeline]);

  const gaugeData = useMemo(() => {
    if (!coefficient) return [];
    const score = coefficient.overall;
    return [
      { name: 'Regret', value: score, fill: score >= 80 ? '#f87171' : score >= 50 ? '#fbbf24' : '#34d399' },
      { name: 'Remaining', value: 100 - score, fill: '#1e293b' },
    ];
  }, [coefficient]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-red-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Regret Engine...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertTriangle size={48} className="text-red-400 mb-4" />
        <p className="text-red-400 font-medium text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg animate-pulse">
          <CheckCircle size={16} />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/20">
            <Frown size={24} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Regret Minimization Engine</h1>
            <p className="text-sm text-slate-400">Track every pass, calculate the cost, and predict future regret</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Passed Card
        </button>
      </div>

      {/* Summary Stat Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Missed Value</p>
            <p className="text-3xl font-bold text-red-400">{formatCurrency(summary.totalMissedValue)}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Return Missed</p>
            <p className="text-3xl font-bold text-orange-400">+{summary.avgReturnMissed.toLocaleString()}%</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Regret Coefficient</p>
            <p className="text-3xl font-bold text-amber-400">{summary.regretCoefficient}/100</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Passed Cards</p>
            <p className="text-3xl font-bold text-purple-400">{summary.totalPassedCards}</p>
          </div>
        </div>
      )}

      {/* Biggest Miss Banner */}
      {summary && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle size={20} className="text-red-400 flex-shrink-0" />
          <div>
            <p className="text-xs text-red-400 uppercase tracking-wider font-bold mb-0.5">Biggest Miss</p>
            <p className="text-sm text-slate-200 font-medium">{summary.biggestMiss}</p>
          </div>
        </div>
      )}

      {/* Regret Coefficient Gauge + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-1 flex items-center gap-2">
            <TrendingUp size={18} className="text-red-400" />
            Regret Coefficient Gauge
          </h2>
          {coefficient && (
            <p className="text-xs text-slate-500 mb-4">
              Overall: <span className={`font-bold ${coefficient.overall >= 70 ? 'text-red-400' : coefficient.overall >= 40 ? 'text-amber-400' : 'text-emerald-400'}`}>{coefficient.overall}/100</span>
              &nbsp;·&nbsp;Trend: <span className={`font-bold ${coefficient.trend === 'worsening' ? 'text-red-400' : coefficient.trend === 'improving' ? 'text-emerald-400' : 'text-amber-400'}`}>{coefficient.trend}</span>
            </p>
          )}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gaugeData} layout="vertical">
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} width={70} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="value" name="Score" radius={[0, 4, 4, 0]}>
                  {gaugeData.map((entry, idx) => (
                    <rect key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {coefficient && (
            <div className="mt-3 space-y-1">
              {Object.entries(coefficient.byCategory).map(([cat, score]) => (
                <div key={cat} className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 w-24 truncate">{cat}</span>
                  <div className="flex-1 bg-slate-700/40 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${score >= 70 ? 'bg-red-400' : score >= 40 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-bold w-8 text-right ${score >= 70 ? 'text-red-400' : score >= 40 ? 'text-amber-400' : 'text-emerald-400'}`}>{score}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-800/50 border border-red-500/20 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-400" />
            Regret Alerts — Cards You're Considering Now
          </h2>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className={`p-3 rounded-xl border ${
                alert.urgency === 'high' ? 'bg-red-900/20 border-red-500/30' :
                alert.urgency === 'medium' ? 'bg-amber-900/20 border-amber-500/30' :
                'bg-slate-900/50 border-slate-700/30'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold text-white truncate mr-2">{alert.cardName}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${
                    alert.urgency === 'high' ? 'bg-red-500/10 text-red-400' :
                    alert.urgency === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-blue-500/10 text-blue-400'
                  }`}>
                    {alert.urgency.toUpperCase()}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mb-1">{alert.message}</p>
                <p className="text-[10px] text-slate-500">Predicted Regret Score: <span className="text-red-400 font-bold">{alert.potentialRegretScore}/100</span></p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hall of Shame — Top 5 Regrets */}
      <div className="bg-slate-800/50 border border-red-500/20 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Frown size={18} className="text-red-400" />
          Passed Cards Hall of Shame — Top 5 Biggest Regrets
        </h2>
        <div className="space-y-3">
          {topRegrets.map((card, idx) => (
            <div key={card.id} className="flex items-center gap-4 p-4 bg-slate-900/50 border border-red-500/10 rounded-xl">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center">
                <span className="text-xs font-bold text-red-400">#{idx + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{card.cardName}</p>
                <p className="text-[10px] text-slate-500">{card.sport} · {card.year} · Passed: {card.passedOnDate} · Reason: {card.reason}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-[10px] text-slate-500">Passed @ {formatCurrency(card.passedOnPrice)}</p>
                <p className="text-sm font-bold text-emerald-400">Now: {formatCurrency(card.currentPrice)}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className={`text-lg font-bold ${card.returnPct > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {card.returnPct > 0 ? '+' : ''}{card.returnPct.toLocaleString()}%
                </p>
                <p className="text-[10px] text-slate-500">Regret: {card.regretScore}/100</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regret Patterns BarChart + Timeline LineChart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-orange-400" />
            Regret Patterns by Category
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={patternChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} />
                <YAxis yAxisId="left" domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v: number) => `$${v}K`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar yAxisId="left" dataKey="regretScore" name="Avg Regret Score" fill="#f87171" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="missedValue" name="Missed Value ($K)" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-purple-400" />
            Regret Score Timeline (Monthly)
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="regretScore" name="Regret Score" stroke="#f87171" strokeWidth={2} dot={{ fill: '#f87171', r: 3 }} />
                <Line type="monotone" dataKey="passedCards" name="Passed Cards" stroke="#a78bfa" strokeWidth={2} dot={{ fill: '#a78bfa', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Full Passed Cards Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <DollarSign size={18} className="text-slate-400" />
          All Passed Cards
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Card</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Passed Price</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Current Price</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Return %</th>
                <th className="text-center text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Regret Score</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3">Reason</th>
              </tr>
            </thead>
            <tbody>
              {passedCards.map((card) => (
                <tr key={card.id} className="border-b border-slate-700/20 hover:bg-slate-700/10">
                  <td className="py-3 pr-3">
                    <p className="text-sm font-bold text-white max-w-[240px] truncate">{card.cardName}</p>
                    <p className="text-[10px] text-slate-500">{card.sport} · {card.category} · {card.passedOnDate}</p>
                  </td>
                  <td className="py-3 pr-3 text-sm text-right text-slate-300">{formatCurrency(card.passedOnPrice)}</td>
                  <td className="py-3 pr-3 text-sm text-right font-bold text-emerald-400">{formatCurrency(card.currentPrice)}</td>
                  <td className="py-3 pr-3 text-sm text-right font-bold">
                    <span className={card.returnPct > 50 ? 'text-red-400' : card.returnPct > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                      {card.returnPct > 0 ? '+' : ''}{card.returnPct.toLocaleString()}%
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-center">
                    <span className={`text-sm font-bold ${card.regretScore >= 70 ? 'text-red-400' : card.regretScore >= 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {card.regretScore}
                    </span>
                    <span className="text-[10px] text-slate-600">/100</span>
                  </td>
                  <td className="py-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400">{card.reason}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Passed Card Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-200">Track a Passed Card</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-300">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider">Card Name</label>
                <input
                  className="w-full mt-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-500"
                  placeholder="e.g. 2023 Topps Chrome Victor Wembanyama RC PSA 10"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider">Passed-On Price ($)</label>
                  <input
                    type="number"
                    className="w-full mt-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-500"
                    placeholder="e.g. 450"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider">Date Passed</label>
                  <input
                    type="date"
                    className="w-full mt-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider">Reason for Passing</label>
                <select className="w-full mt-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-500">
                  <option>Price too high</option>
                  <option>Wrong timing</option>
                  <option>Passed on instinct</option>
                  <option>Liquidity concerns</option>
                  <option>Budget limit hit</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider">Category</label>
                <select className="w-full mt-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-500">
                  <option>Rookie Cards</option>
                  <option>Vintage</option>
                  <option>Autographs</option>
                  <option>Patch Autos</option>
                  <option>Base Cards</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-slate-700 text-slate-400 rounded-xl text-sm hover:bg-slate-700/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  showToast('Card tracked');
                }}
                className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-xl text-sm font-medium transition-colors"
              >
                Track Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegretMinimizationEngine;
