import React, { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, Shield, Heart, Clock, Plus, X, CheckCircle, TrendingUp, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import {
  getCircuitBreakers,
  getAddictionSignals,
  getSessionPatterns,
  getCoolingOffPeriods,
  getWellnessScore,
  getSpendingVelocity,
  getWellnessTips,
  formatCurrency,
  type SpendingCircuitBreaker,
  type AddictionSignal,
  type SessionPattern,
  type CoolingOffPeriod,
  type WellnessScore,
  type SpendingVelocity,
  type WellnessTip,
} from '../lib/utils/mentalHealthSafeguardsService.ts';

const MentalHealthSafeguards: React.FC = () => {
  const [breakers, setBreakers] = useState<SpendingCircuitBreaker[]>([]);
  const [signals, setSignals] = useState<AddictionSignal[]>([]);
  const [sessionPatterns, setSessionPatterns] = useState<SessionPattern[]>([]);
  const [coolingOff, setCoolingOff] = useState<CoolingOffPeriod[]>([]);
  const [wellness, setWellness] = useState<WellnessScore | null>(null);
  const [velocity, setVelocity] = useState<SpendingVelocity[]>([]);
  const [tips, setTips] = useState<WellnessTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    try {
      setBreakers(getCircuitBreakers());
      setSignals(getAddictionSignals());
      setSessionPatterns(getSessionPatterns());
      setCoolingOff(getCoolingOffPeriods());
      setWellness(getWellnessScore());
      setVelocity(getSpendingVelocity());
      setTips(getWellnessTips());
      setLoading(false);
    } catch {
      setError('Failed to load Mental Health Safeguards data');
      setLoading(false);
    }
  }, []);

  const hourlyChartData = useMemo(() =>
    sessionPatterns.map(p => ({
      hour: `${p.hour.toString().padStart(2, '0')}:00`,
      purchases: p.purchaseCount,
      sessions: p.sessionCount,
      spend: p.avgSpend,
    })), [sessionPatterns]);

  const velocityChartData = useMemo(() =>
    velocity.map(v => ({
      period: v.period,
      amount: v.amount,
      transactions: v.transactions,
    })), [velocity]);

  const wellnessColor = (score: number) => {
    if (score >= 70) return 'text-emerald-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-red-400';
  };

  const wellnessBg = (score: number) => {
    if (score >= 70) return 'bg-emerald-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const currentTip = tips[tipIndex % tips.length];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Wellness Dashboard...</p>
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
          <div className="p-2 rounded-xl bg-emerald-500/20">
            <Heart size={24} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Mental Health Safeguards</h1>
            <p className="text-sm text-slate-400">Spending circuit breakers, addiction signals, and wellness tools</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Set Circuit Breaker
        </button>
      </div>

      {/* Motivational Tip Banner */}
      {currentTip && (
        <div className="bg-slate-800/50 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
          <Heart size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-slate-200 italic">"{currentTip.message}"</p>
            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">{currentTip.category} wellness</p>
          </div>
          <button
            onClick={() => setTipIndex(i => i + 1)}
            className="text-[10px] text-slate-500 hover:text-slate-300 flex-shrink-0"
          >
            Next tip
          </button>
        </div>
      )}

      {/* Wellness Score Dashboard */}
      {wellness && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Activity size={18} className="text-emerald-400" />
            Wellness Score Dashboard
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 text-center md:col-span-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Overall Wellness</p>
              <p className={`text-5xl font-bold mb-1 ${wellnessColor(wellness.overall)}`}>{wellness.overall}</p>
              <p className="text-[10px] text-slate-500">/100</p>
              <div className="mt-3 bg-slate-700/40 rounded-full h-2">
                <div className={`h-2 rounded-full transition-all ${wellnessBg(wellness.overall)}`} style={{ width: `${wellness.overall}%` }} />
              </div>
              <p className={`text-[10px] mt-2 font-medium ${wellness.overall < 40 ? 'text-red-400' : wellness.overall < 70 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {wellness.overall < 40 ? 'Needs Attention' : wellness.overall < 70 ? 'Moderate Risk' : 'Healthy'}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Trend: {wellness.trend}</p>
            </div>
            <div className="md:col-span-3 grid grid-cols-3 gap-4">
              {[
                { label: 'Financial', score: wellness.financial, icon: '💰' },
                { label: 'Behavioral', score: wellness.behavioral, icon: '🧠' },
                { label: 'Emotional', score: wellness.emotional, icon: '❤️' },
              ].map((dim) => (
                <div key={dim.label} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 text-center">
                  <p className="text-lg mb-1">{dim.icon}</p>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{dim.label}</p>
                  <p className={`text-3xl font-bold ${wellnessColor(dim.score)}`}>{dim.score}</p>
                  <p className="text-[10px] text-slate-600">/100</p>
                  <div className="mt-2 bg-slate-700/40 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${wellnessBg(dim.score)}`} style={{ width: `${dim.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Circuit Breakers */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Shield size={18} className="text-blue-400" />
          Active Spending Circuit Breakers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {breakers.map((cb) => (
            <div key={cb.id} className={`p-4 rounded-xl border ${
              cb.status === 'triggered' ? 'bg-red-900/20 border-red-500/40' :
              cb.status === 'warning' ? 'bg-amber-900/20 border-amber-500/30' :
              'bg-slate-900/50 border-slate-700/30'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-white">{cb.name}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  cb.status === 'triggered' ? 'bg-red-500/20 text-red-400' :
                  cb.status === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {cb.status.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2">
                <span>Used: <span className="text-slate-300 font-medium">{formatCurrency(cb.current)}</span></span>
                <span>Limit: <span className="text-slate-300 font-medium">{formatCurrency(cb.limit)}</span></span>
                <span>Left: <span className={`font-bold ${cb.remaining <= 0 ? 'text-red-400' : cb.remaining < cb.limit * 0.2 ? 'text-amber-400' : 'text-emerald-400'}`}>{formatCurrency(cb.remaining)}</span></span>
              </div>
              <div className="bg-slate-700/40 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    cb.status === 'triggered' ? 'bg-red-500' :
                    cb.status === 'warning' ? 'bg-amber-500' :
                    'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min((cb.current / cb.limit) * 100, 100)}%` }}
                />
              </div>
              {cb.triggeredAt && (
                <p className="text-[10px] text-red-400 mt-1">Triggered: {new Date(cb.triggeredAt).toLocaleString()}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Addiction Signals */}
      <div className="bg-slate-800/50 border border-red-500/20 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-red-400" />
          Addiction Signals Detected
        </h2>
        <div className="space-y-3">
          {signals.map((sig, idx) => (
            <div key={idx} className={`p-4 rounded-xl border ${
              sig.severity === 'critical' ? 'bg-red-950/30 border-red-500/40' :
              sig.severity === 'high' ? 'bg-red-900/20 border-red-500/20' :
              sig.severity === 'medium' ? 'bg-amber-900/20 border-amber-500/20' :
              'bg-slate-900/50 border-slate-700/30'
            }`}>
              <div className="flex items-start gap-3">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 mt-0.5 ${
                  sig.severity === 'critical' ? 'bg-red-500/20 text-red-300' :
                  sig.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                  sig.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {sig.severity.toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white mb-1">{sig.signal}</p>
                  <p className="text-[10px] text-slate-400 mb-2">{sig.description}</p>
                  <div className="flex items-start gap-1.5">
                    <CheckCircle size={12} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-emerald-300">{sig.recommendation}</p>
                  </div>
                  <p className="text-[10px] text-slate-600 mt-1">Detected: {new Date(sig.detectedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Late Night Activity Heatmap + Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-amber-400" />
            Late Night Activity — Purchases by Hour
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 8, fill: '#64748b' }}
                  interval={2}
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar
                  dataKey="purchases"
                  name="Purchases"
                  radius={[4, 4, 0, 0]}
                  fill="#f87171"
                />
                <Bar
                  dataKey="sessions"
                  name="Sessions"
                  radius={[4, 4, 0, 0]}
                  fill="#fbbf2480"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Red bars = purchases. Most activity detected 10 PM – 3 AM (high-risk window).</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-red-400" />
            Spending Velocity — This Week vs Average
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={velocityChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="period" tick={{ fontSize: 8, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v: number) => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: number, name: string) => [name === 'amount' ? formatCurrency(value) : value, name === 'amount' ? 'Spend' : 'Transactions']}
                />
                <Bar dataKey="amount" name="amount" fill="#f87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {velocity.slice(-3).map((v) => (
              <div key={v.period} className="bg-slate-900/50 rounded-lg p-2 text-center">
                <p className="text-[9px] text-slate-500 truncate">{v.period}</p>
                <p className="text-xs font-bold text-white">{formatCurrency(v.amount)}</p>
                <p className={`text-[9px] font-bold ${v.vsAverage > 50 ? 'text-red-400' : v.vsAverage > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {v.vsAverage > 0 ? '+' : ''}{v.vsAverage}% vs avg
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cooling-Off Periods Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Clock size={18} className="text-blue-400" />
          Cooling-Off Period History
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Trigger Reason</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Started</th>
                <th className="text-center text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Duration</th>
                <th className="text-center text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Cards Considered</th>
                <th className="text-center text-[10px] text-slate-500 uppercase tracking-wider pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {coolingOff.map((period) => (
                <tr key={period.id} className="border-b border-slate-700/20 hover:bg-slate-700/10">
                  <td className="py-3 pr-3">
                    <p className="text-sm text-slate-200">{period.triggerReason}</p>
                  </td>
                  <td className="py-3 pr-3 text-[10px] text-slate-500">
                    {new Date(period.startedAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 pr-3 text-center text-sm text-slate-300">{period.duration}</td>
                  <td className="py-3 pr-3 text-center">
                    <span className="text-sm font-bold text-amber-400">{period.cardsConsideredDuring}</span>
                  </td>
                  <td className="py-3 text-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      period.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                      period.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                      'bg-slate-700/50 text-slate-500'
                    }`}>
                      {period.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Set Circuit Breaker Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-200">Set a Circuit Breaker</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-300">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider">Breaker Name</label>
                <input
                  className="w-full mt-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-500"
                  placeholder="e.g. Grail Card Cap"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider">Type</label>
                  <select className="w-full mt-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-500">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider">Limit ($)</label>
                  <input
                    type="number"
                    className="w-full mt-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-500"
                    placeholder="e.g. 500"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider">Warning Threshold</label>
                <select className="w-full mt-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-500">
                  <option>80% of limit</option>
                  <option>70% of limit</option>
                  <option>50% of limit</option>
                  <option>90% of limit</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider">Action on Trigger</label>
                <select className="w-full mt-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-500">
                  <option>Alert only</option>
                  <option>Block purchases</option>
                  <option>Start cooling-off period</option>
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
                  showToast('Circuit breaker activated');
                }}
                className="flex-1 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-sm font-medium transition-colors"
              >
                Activate Breaker
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentalHealthSafeguards;
