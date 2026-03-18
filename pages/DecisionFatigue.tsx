import React, { useState, useMemo, useEffect } from 'react';
import {
  Brain,
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  Clock,
  AlertTriangle,
  TrendingDown,
  Shield,
  Activity,
  Zap,
  Target,
  BarChart3,
  Pause,
} from 'lucide-react';
import {
  getFatigueSessions,
  getSessionDecisions,
  getCurrentEnergyState,
  getFatigueStats,
  getFatigueForensics,
  getFatigueColor,
  getFatigueLabel,
  getDecisionTypeLabel,
  type FatigueLevel,
} from '../lib/utils/decisionFatigueService';

const BatteryIcon: React.FC<{ level: FatigueLevel }> = ({ level }) => {
  if (level === 'fresh' || level === 'engaged') return <BatteryFull size={20} className="text-green-400" />;
  if (level === 'fatigued') return <BatteryMedium size={20} className="text-amber-400" />;
  return <BatteryLow size={20} className="text-red-400" />;
};

const DecisionFatigue: React.FC = () => {
  const sessions = useMemo(() => getFatigueSessions(), []);
  const decisions = useMemo(() => getSessionDecisions(), []);
  const stats = useMemo(() => getFatigueStats(), []);
  const forensics = useMemo(() => getFatigueForensics(), []);
  const [live, setLive] = useState(() => getCurrentEnergyState());
  const [activeTab, setActiveTab] = useState<'live' | 'history' | 'forensics'>('live');

  useEffect(() => {
    const interval = setInterval(() => {
      setLive(getCurrentEnergyState());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const energyColor = live.currentEnergy >= 70 ? 'text-green-400' : live.currentEnergy >= 40 ? 'text-amber-400' : 'text-red-400';
  const energyBg = live.currentEnergy >= 70 ? 'bg-green-500' : live.currentEnergy >= 40 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
              <Brain size={22} className="text-teal-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Decision Fatigue Guardian</h1>
              <p className="text-slate-400 text-sm">
                Cognitive load monitoring — protect decision quality through awareness
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Live Energy Meter */}
        <div className={`bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-800/50 rounded-xl border p-6 ${
          live.fatigueLevel === 'exhausted' || live.fatigueLevel === 'impaired' ? 'border-red-500/50' : 'border-slate-800'
        }`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={`w-20 h-20 rounded-full border-4 ${energyColor} flex items-center justify-center`} style={{
                  borderColor: live.currentEnergy >= 70 ? '#4ade80' : live.currentEnergy >= 40 ? '#fbbf24' : '#f87171'
                }}>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${energyColor}`}>{live.currentEnergy}</p>
                    <p className="text-slate-500 text-[8px] uppercase">energy</p>
                  </div>
                </div>
                {(live.fatigueLevel === 'impaired' || live.fatigueLevel === 'exhausted') && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                    <AlertTriangle size={12} className="text-white" />
                  </div>
                )}
              </div>
              <div>
                <p className={`text-lg font-bold ${getFatigueColor(live.fatigueLevel)}`}>
                  {getFatigueLabel(live.fatigueLevel)}
                </p>
                <p className="text-slate-400 text-xs">
                  {live.decisionsThisSession} decisions • {live.sessionDuration}
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-slate-500 text-[10px] uppercase">Avg Quality</p>
                <p className={`font-bold text-xl ${live.avgQualityThisSession >= 70 ? 'text-green-400' : live.avgQualityThisSession >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                  {live.avgQualityThisSession}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-slate-500 text-[10px] uppercase">Bid Deviation</p>
                <p className={`font-bold text-xl ${live.bidDeviationFromTarget > 5 ? 'text-red-400' : 'text-green-400'}`}>
                  {live.bidDeviationFromTarget > 0 ? '+' : ''}{live.bidDeviationFromTarget}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-slate-500 text-[10px] uppercase">Last Decision</p>
                <p className="text-white font-bold text-xl">{live.lastDecisionQuality}%</p>
              </div>
            </div>
          </div>

          {/* Energy Bar */}
          <div className="mt-4">
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${energyBg}`}
                style={{ width: `${live.currentEnergy}%` }}
              />
            </div>
          </div>

          {live.recommendedAction && (
            <div className="mt-3 bg-slate-800/50 rounded-lg p-3 flex items-center gap-2">
              <Zap size={14} className="text-teal-400" />
              <span className="text-slate-300 text-xs">{live.recommendedAction}</span>
              {live.cooldownRemaining && live.cooldownRemaining > 0 && (
                <span className="ml-auto text-amber-400 text-xs font-bold flex items-center gap-1">
                  <Pause size={12} />
                  Cooldown: {Math.floor(live.cooldownRemaining / 60)}:{String(live.cooldownRemaining % 60).padStart(2, '0')}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={16} className="text-teal-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Total Sessions</span>
            </div>
            <p className="text-white font-bold text-3xl">{stats.totalSessions}</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Target size={16} className="text-amber-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Avg Fatigue Onset</span>
            </div>
            <p className="text-white font-bold text-3xl">Decision #{stats.avgFatigueOnset}</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} className="text-green-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Money Protected</span>
            </div>
            <p className="text-white font-bold text-3xl">${stats.totalMoneyProtected.toLocaleString()}</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={16} className="text-red-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Avg Degradation</span>
            </div>
            <p className="text-red-400 font-bold text-3xl">{stats.avgQualityDegradation}%</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(['live', 'history', 'forensics'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                activeTab === tab ? 'bg-teal-500/20 text-teal-400 border border-teal-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
              }`}
            >
              {tab === 'live' ? 'Live Decisions' : tab === 'history' ? 'Session History' : 'Fatigue Forensics'}
            </button>
          ))}
        </div>

        {activeTab === 'live' && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <Clock size={16} className="text-teal-400" />
              Recent Decisions This Session
            </h3>
            <div className="space-y-2">
              {decisions.slice(0, 10).map(d => (
                <div key={d.id} className="flex items-center gap-3 bg-slate-800/50 rounded-lg px-4 py-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    d.qualityScore >= 70 ? 'bg-green-500/20 text-green-400' :
                    d.qualityScore >= 50 ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {d.qualityScore}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{d.description}</p>
                    <p className="text-slate-500 text-xs">{getDecisionTypeLabel(d.type)} • Decision #{d.decisionNumber}</p>
                  </div>
                  <div className="text-right">
                    {d.value && <p className="text-white text-sm font-bold">${d.value.toLocaleString()}</p>}
                    <p className="text-slate-500 text-xs">{d.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {sessions.map(s => (
              <div key={s.id} className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-white font-semibold text-sm">{s.startTime} - {s.endTime}</p>
                    <p className="text-slate-500 text-xs">{s.totalDecisions} decisions</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-xs">Quality degradation</p>
                    <p className="text-red-400 font-bold text-lg">-{s.qualityDegradation}%</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase">First 20 Avg</p>
                    <p className="text-green-400 font-bold">{s.avgQualityFirst20}%</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase">Last 20 Avg</p>
                    <p className="text-red-400 font-bold">{s.avgQualityLast20}%</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase">Fatigue Onset</p>
                    <p className="text-white font-bold">Decision #{s.fatigueOnset}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase">Money at Risk</p>
                    <p className="text-amber-400 font-bold">${s.moneyAtRisk.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase">Interventions</p>
                    <p className="text-teal-400 font-bold">{s.interventionsTriggered}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'forensics' && (
          <div className="space-y-6">
            {forensics.map(f => (
              <div key={f.sessionId} className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                <h4 className="text-white font-semibold text-sm mb-2">Session {f.sessionId}</h4>
                <p className="text-teal-400 text-xs font-medium mb-4">{f.keyInsight}</p>

                {/* Quality Timeline */}
                <div className="h-32 flex items-end gap-0.5 mb-4">
                  {f.qualityTrendline.map((q, i) => {
                    const isIntervention = f.interventionPoints.includes(i);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center relative group">
                        <div
                          className={`w-full rounded-t transition-all ${
                            q >= 70 ? 'bg-green-500' : q >= 50 ? 'bg-amber-500' : 'bg-red-500'
                          } ${isIntervention ? 'ring-2 ring-teal-400' : ''}`}
                          style={{ height: `${q}%` }}
                        />
                        {isIntervention && (
                          <div className="absolute -top-4 text-teal-400">
                            <Zap size={10} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /> Good (&ge;70)</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" /> Declining (50-69)</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /> Poor (&lt;50)</span>
                  <span className="flex items-center gap-1"><Zap size={10} className="text-teal-400" /> Intervention</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DecisionFatigue;
