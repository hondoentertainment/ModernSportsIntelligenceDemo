// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import {
  HeartPulse,
  Shield,
  Activity,
  Brain,
  TrendingDown,
  Timer,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
} from 'lucide-react';
import {
  getBiometricStats,
  getTradingSessions,
  getCooldownEvents,
  getCurrentStressLevel,
  getMoneyProtected,
  getEmotionalStateColor,
  getEmotionalStateBg,
  getReadinessLabel,
  formatDuration,
  formatTimestamp,
  formatDate,
  type EmotionalState,
} from '../lib/utils/biometricTradingGuardService';

const EMOTION_LABELS: Record<EmotionalState, string> = {
  calm: 'Calm',
  elevated: 'Elevated',
  anxious: 'Anxious',
  euphoric: 'Euphoric',
  panic: 'Panic',
};

const BiometricTradingGuard: React.FC = () => {
  const stats = useMemo(() => getBiometricStats(), []);
  const sessions = useMemo(() => getTradingSessions(), []);
  const cooldowns = useMemo(() => getCooldownEvents(), []);
  const moneyProtected = useMemo(() => getMoneyProtected(), []);
  const [live, setLive] = useState(() => getCurrentStressLevel());

  useEffect(() => {
    const interval = setInterval(() => {
      setLive(getCurrentStressLevel());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const readiness = useMemo(() => getReadinessLabel(live.tradingReadiness), [live.tradingReadiness]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
              <HeartPulse size={22} className="text-rose-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Biometric Trading Guard</h1>
              <p className="text-slate-400 text-sm">
                Wearable-powered emotional trading protection with AI coaching
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Top Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} className="text-rose-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Trades Blocked</span>
            </div>
            <p className="text-white font-bold text-3xl">{stats.tradesBlocked}</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={16} className="text-green-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Money Protected</span>
            </div>
            <p className="text-white font-bold text-3xl">${stats.moneyProtected.toLocaleString()}</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-blue-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Total Sessions</span>
            </div>
            <p className="text-white font-bold text-3xl">{stats.totalSessions}</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Brain size={16} className="text-purple-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Coaching Msgs</span>
            </div>
            <p className="text-white font-bold text-3xl">{stats.coachingMessages}</p>
          </div>
        </div>

        {/* Live Monitor + Readiness */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Heart Rate */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="relative">
                <HeartPulse size={32} className="text-rose-400 animate-pulse" />
                <div className="absolute inset-0 animate-ping opacity-30">
                  <HeartPulse size={32} className="text-rose-400" />
                </div>
              </div>
            </div>
            <p className="text-white font-bold text-5xl tabular-nums mb-1">{live.heartRate}</p>
            <p className="text-slate-400 text-sm">bpm</p>
            <div className="mt-4">
              <span
                className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getEmotionalStateBg(live.emotionalState)} ${getEmotionalStateColor(live.emotionalState)}`}
              >
                {EMOTION_LABELS[live.emotionalState]}
              </span>
            </div>
          </div>

          {/* Trading Readiness */}
          <div className={`bg-slate-900 rounded-xl border border-slate-800 p-6 col-span-1 lg:col-span-2`}>
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <Zap size={16} className="text-rose-400" />
              Trading Readiness
            </h3>
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className={`font-bold text-2xl ${readiness.color}`}>{readiness.label}</p>
                <p className="text-slate-400 text-xs mt-1">
                  HRV: {live.hrv}ms | Stress: {live.stressLevel}% | Temp: {live.skinTemp.toFixed(1)}F
                </p>
              </div>
              <div className="text-right">
                <p className={`font-bold text-4xl tabular-nums ${readiness.color}`}>{live.tradingReadiness}</p>
                <p className="text-slate-500 text-xs">/100</p>
              </div>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  live.tradingReadiness >= 70 ? 'bg-green-500' : live.tradingReadiness >= 40 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${live.tradingReadiness}%` }}
              />
            </div>
            {live.coachingMessage && (
              <div className="mt-4 bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 flex items-start gap-2">
                <Brain size={14} className="text-rose-400 shrink-0 mt-0.5" />
                <p className="text-slate-200 text-xs leading-relaxed">{live.coachingMessage}</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Sessions + Money Protected Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Sessions */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <Activity size={16} className="text-rose-400" />
              Recent Sessions
            </h3>
            <div className="space-y-3">
              {sessions.slice(0, 4).map((session) => (
                <div
                  key={session.id}
                  className="bg-slate-800/50 rounded-lg p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-white text-sm font-medium">{formatDate(session.startTime)}</p>
                    <p className="text-slate-400 text-xs">
                      {formatDuration(session.startTime, session.endTime)} | {session.tradesAttempted} trades
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {session.tradesBlocked > 0 && (
                      <span className="text-rose-400 text-xs font-medium">
                        {session.tradesBlocked} blocked
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getEmotionalStateBg(session.emotionalState)} ${getEmotionalStateColor(session.emotionalState)}`}
                    >
                      {EMOTION_LABELS[session.emotionalState]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Money Protected Breakdown */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <Shield size={16} className="text-green-400" />
              Money Protected Breakdown
            </h3>
            <div className="mb-4">
              <p className="text-green-400 font-bold text-3xl">${moneyProtected.total.toLocaleString()}</p>
              <p className="text-slate-400 text-xs">Total saved by biometric guard</p>
            </div>
            <div className="space-y-2">
              {moneyProtected.breakdown.map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                  <span className="text-slate-300 text-xs truncate max-w-[240px]">{item.cardName}</span>
                  <span className="text-green-400 text-xs font-bold font-mono">
                    +${item.saved.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cooldown Timeline */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <Timer size={16} className="text-amber-400" />
            Recent Cooldown Events
          </h3>
          <div className="space-y-3">
            {cooldowns.slice(0, 3).map((event) => {
              const savedMoney = event.outcomeIfExecuted < 0;
              const amount = Math.abs(event.outcomeIfExecuted);
              return (
                <div key={event.id} className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-white text-sm font-medium">{formatDate(event.triggeredAt)}</p>
                      <p className="text-slate-400 text-xs">{event.reason}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-3">
                      {savedMoney ? (
                        <CheckCircle size={14} className="text-green-400" />
                      ) : (
                        <AlertTriangle size={14} className="text-amber-400" />
                      )}
                      <span className={`text-xs font-bold ${savedMoney ? 'text-green-400' : 'text-amber-400'}`}>
                        {savedMoney ? `Saved $${amount.toLocaleString()}` : `Missed +$${amount.toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiometricTradingGuard;
