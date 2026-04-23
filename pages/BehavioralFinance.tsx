// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import {
  Brain,
  AlertTriangle,
  Shield,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  BarChart3,
  Activity,
} from 'lucide-react';
import {
  getBehavioralProfile,
  detectBiases,
  getSpendingPatterns,
  getDecisionHistory,
  getMonthlyReport,
  getCoolDownRules,
  getOverpaymentAnalysis,
  getNudges,
  getBiasBreakdown,
  getSeverityConfig,
  getBiasConfig,
  formatCurrency,
  type BehavioralProfile,
  type BiasDetection,
  type DecisionQuality,
  type MonthlyReport,
  type CoolDownRule,
  type OverpaymentEntry,
  type Nudge,
} from '../lib/analytics/behavioralFinanceService.ts';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';

const BehavioralFinance: React.FC = () => {
  const [profile, setProfile] = useState<BehavioralProfile | null>(null);
  const [biases, setBiases] = useState<BiasDetection[]>([]);
  const [decisions, setDecisions] = useState<DecisionQuality[]>([]);
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [cooldowns, setCooldowns] = useState<CoolDownRule[]>([]);
  const [overpayments, setOverpayments] = useState<OverpaymentEntry[]>([]);
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setProfile(getBehavioralProfile());
      setBiases(detectBiases());
      setDecisions(getDecisionHistory());
      setReports(getMonthlyReport());
      setCooldowns(getCoolDownRules());
      setOverpayments(getOverpaymentAnalysis());
      setNudges(getNudges());
      setLoading(false);
    } catch {
      setError('Failed to load Behavioral Finance data');
      setLoading(false);
    }
  }, []);

  const _biasBreakdown = useMemo(() => getBiasBreakdown(), []);
  const spendingPatterns = useMemo(() => getSpendingPatterns(), []);

  const spendByHour = useMemo(() => {
    const hourMap: Record<number, { total: number; count: number }> = {};
    spendingPatterns.forEach(p => {
      if (!hourMap[p.hour_of_day]) hourMap[p.hour_of_day] = { total: 0, count: 0 };
      hourMap[p.hour_of_day].total += p.avg_amount * p.transaction_count;
      hourMap[p.hour_of_day].count += p.transaction_count;
    });
    return Object.entries(hourMap)
      .map(([hour, data]) => ({ hour: `${hour}:00`, amount: Math.round(data.total / data.count), transactions: data.count }))
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
  }, [spendingPatterns]);

  const totalSaved = useMemo(() => cooldowns.reduce((s, r) => s + r.moneySaved, 0), [cooldowns]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Behavioral Finance Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertTriangle size={48} className="text-red-400 mb-4" />
        <p className="text-red-400 font-medium text-lg">{error ?? 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-500/20">
            <Brain size={24} className="text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Behavioral Finance &amp; Collector Psychology</h1>
            <p className="text-sm text-slate-400">Bias detection, spending patterns &amp; decision quality scoring &mdash; Phase 131</p>
          </div>
        </div>
        <span className={`px-3 py-1.5 text-sm font-bold rounded-full ${profile.emotionalState === 'calm' ? 'bg-emerald-500/20 text-emerald-300' : profile.emotionalState === 'elevated' ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'}`}>
          {profile.emotionalState.toUpperCase()} STATE
        </span>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Decision Score</p>
          <p className="text-3xl font-bold text-violet-400">{profile.overallScore}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Active Biases</p>
          <p className="text-3xl font-bold text-amber-400">{profile.activeBiases}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Saved by Nudges</p>
          <p className="text-2xl font-bold text-emerald-400">{formatCurrency(profile.totalSavedByNudges)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Impulses Avoided</p>
          <p className="text-3xl font-bold text-brand-lime">{profile.impulsePurchasesAvoided}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Clean Streak</p>
          <p className="text-3xl font-bold text-blue-400">{profile.streakDays}d</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Risk Profile</p>
          <p className="text-xl font-bold text-purple-400 capitalize">{profile.riskTolerance}</p>
        </div>
      </div>

      {/* Spending Pattern Chart + Active Bias Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Hour */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-cyan-400" />
            Spending by Hour of Day
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendByHour}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v: number) => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Avg Spend']}
                />
                <Bar dataKey="amount" name="Avg Spend" radius={[4, 4, 0, 0]}>
                  {spendByHour.map((entry, idx) => (
                    <Cell key={idx} fill={parseInt(entry.hour) >= 22 || parseInt(entry.hour) <= 1 ? '#f87171' : '#8b5cf6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Red bars indicate high-risk late-night spending hours</p>
        </div>

        {/* Active Bias Alerts */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-400" />
            Active Bias Alerts
          </h2>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {biases.filter(b => b.severity === 'critical' || b.severity === 'high').map(b => {
              const sc = getSeverityConfig(b.severity);
              const bc = getBiasConfig(b.bias);
              return (
                <div key={b.id} className={`p-3 rounded-xl border ${sc.bg} ${sc.border}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${sc.bg} ${sc.text} ${sc.border}`}>{sc.label}</span>
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${bc.bg} ${bc.text} ${bc.border}`}>{bc.label}</span>
                  </div>
                  <p className="text-xs text-slate-300 mb-1.5">{b.evidence}</p>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <Shield size={10} /> {b.suggestion}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Decision History Timeline */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Target size={18} className="text-violet-400" />
          Decision History
        </h2>
        <div className="space-y-3">
          {decisions.slice(0, 12).map(d => {
            const biasInfo = d.bias_detected ? getBiasConfig(d.bias_detected) : null;
            return (
              <div key={d.id} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${d.score >= 75 ? 'bg-emerald-500/20 text-emerald-400' : d.score >= 50 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                    {d.score}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${d.decision === 'Buy' ? 'bg-blue-500/20 text-blue-400' : d.decision === 'Sell' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>{d.decision}</span>
                      <p className="text-sm font-bold text-white truncate">{d.cardName}</p>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">{d.notes}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                  {biasInfo && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${biasInfo.bg} ${biasInfo.text} ${biasInfo.border}`}>{biasInfo.label}</span>
                  )}
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{formatCurrency(d.amount)}</p>
                    <p className="text-[10px] text-slate-500">{d.date}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${d.outcome === 'profit' ? 'bg-emerald-500/20 text-emerald-400' : d.outcome === 'loss' ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400'}`}>
                    {d.outcome.toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Report + Overpayment Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Report Card */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-emerald-400" />
            Monthly Behavioral Report
          </h2>
          <div className="space-y-3">
            {reports.map(r => (
              <div key={r.month} className="p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">{r.month}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${r.decisionScore >= 70 ? 'text-emerald-400' : r.decisionScore >= 55 ? 'text-amber-400' : 'text-red-400'}`}>{r.decisionScore}</span>
                    {r.improvement > 0 && (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                        <TrendingUp size={10} /> +{r.improvement}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <p className="text-[10px] text-slate-500">Spent</p>
                    <p className="text-xs font-bold text-white">{formatCurrency(r.totalSpent)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500">Impulse</p>
                    <p className="text-xs font-bold text-amber-400">{r.impulsePurchases}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500">Biases</p>
                    <p className="text-xs font-bold text-red-400">{r.biasesTriggered}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500">Saved</p>
                    <p className="text-xs font-bold text-emerald-400">{formatCurrency(r.moneySavedByNudges)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overpayment Analysis */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <TrendingDown size={18} className="text-red-400" />
            Overpayment Analysis
          </h2>
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overpayments.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v: number) => `${v}%`} />
                <YAxis type="category" dataKey="cardName" tick={{ fontSize: 9, fill: '#64748b' }} width={150} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: number) => [`${value}%`, 'Overpay']}
                />
                <Bar dataKey="overpayPercent" name="Overpay %" fill="#f87171" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-slate-400">
            Total overpayment: <span className="text-red-400 font-bold">{formatCurrency(overpayments.reduce((s, o) => s + o.overpayAmount, 0))}</span> across {overpayments.length} purchases
          </div>
        </div>
      </div>

      {/* Cool-Down Rules */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Shield size={18} className="text-emerald-400" />
          Cool-Down Rules
          <span className="ml-auto text-sm text-emerald-400 font-bold">Total Saved: {formatCurrency(totalSaved)}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cooldowns.map(rule => (
            <div key={rule.id} className={`p-4 rounded-xl border ${rule.enabled ? 'bg-slate-900/50 border-emerald-500/20' : 'bg-slate-900/30 border-slate-700/30 opacity-60'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">{rule.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${rule.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                  {rule.enabled ? 'ACTIVE' : 'DISABLED'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">{rule.description}</p>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-500">Delay: {rule.cooldownMinutes}m</span>
                <span className="text-amber-400">Triggered: {rule.timesTriggered}x</span>
                <span className="text-emerald-400 font-bold">Saved: {formatCurrency(rule.moneySaved)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Nudges */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Activity size={18} className="text-violet-400" />
          Active Nudges
        </h2>
        <div className="space-y-3">
          {nudges.filter(n => !n.acknowledged).map(n => {
            const sc = getSeverityConfig(n.priority);
            return (
              <div key={n.id} className={`flex items-center gap-3 p-3 rounded-xl border ${sc.bg} ${sc.border}`}>
                <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${sc.bg} ${sc.text} ${sc.border} flex-shrink-0`}>
                  {n.type.toUpperCase()}
                </span>
                <p className="text-xs text-slate-300 flex-1">{n.message}</p>
                <span className={`text-[10px] font-bold ${sc.text}`}>{sc.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BehavioralFinance;
