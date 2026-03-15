import React, { useState, useEffect, useMemo } from 'react';
import {
  HeartPulse,
  AlertTriangle,
  Activity,
  Shield,
} from 'lucide-react';
import {
  getInjuryReports,
  getInjuryProbabilities,
  getRosterMoves,
  getRetirementWatch,
  getCardImpact,
  getPlayerHealth,
  getUpcomingEvents,
  type InjuryReport,
  type InjuryProbability,
  type TradeDeadlineScenario,
  type RetirementWatch,
  type CardImpactProjection,
  type PlayerHealthTimeline,
  type UpcomingRosterEvent,
} from '../lib/injuryIntelService.ts';
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

const SEVERITY_COLORS: Record<string, string> = {
  minor: 'text-yellow-400',
  moderate: 'text-orange-400',
  severe: 'text-red-400',
  career_threatening: 'text-red-600',
};

const URGENCY_STYLES: Record<string, string> = {
  low: 'bg-slate-700 text-slate-400',
  medium: 'bg-blue-500/20 text-blue-400',
  high: 'bg-amber-500/20 text-amber-400',
  critical: 'bg-red-500/20 text-red-400',
};

const InjuryIntel: React.FC = () => {
  const [reports, setReports] = useState<InjuryReport[]>([]);
  const [probabilities, setProbabilities] = useState<InjuryProbability[]>([]);
  const [rosterMoves, setRosterMoves] = useState<TradeDeadlineScenario[]>([]);
  const [retirements, setRetirements] = useState<RetirementWatch[]>([]);
  const [cardImpacts, setCardImpacts] = useState<CardImpactProjection[]>([]);
  const [healthTimelines, setHealthTimelines] = useState<PlayerHealthTimeline[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingRosterEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setReports(getInjuryReports());
      setProbabilities(getInjuryProbabilities());
      setRosterMoves(getRosterMoves());
      setRetirements(getRetirementWatch());
      setCardImpacts(getCardImpact());
      setHealthTimelines(getPlayerHealth());
      setUpcomingEvents(getUpcomingEvents());
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  const riskChartData = useMemo(() => {
    return probabilities.slice(0, 10).map(p => ({
      name: p.playerName.split(' ').pop(),
      risk: p.injuryRisk,
      fill: p.injuryRisk > 70 ? '#ef4444' : p.injuryRisk > 50 ? '#f59e0b' : '#22c55e',
    }));
  }, [probabilities]);

  const criticalAlerts = useMemo(() => {
    return cardImpacts.filter(ci => ci.urgency === 'critical' || ci.urgency === 'high');
  }, [cardImpacts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Injury Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-red-500/20">
          <HeartPulse size={24} className="text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Predictive Injury &amp; Roster Intelligence</h1>
          <p className="text-sm text-slate-400">
            Real-time injury tracking, roster moves &amp; card value impact analysis &mdash; Phase 127
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Active Injuries</p>
          <p className="text-3xl font-bold text-red-400">{reports.filter(r => r.status !== 'recovered').length}</p>
          <p className="text-xs text-slate-600 mt-1">being tracked</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">High Risk Players</p>
          <p className="text-3xl font-bold text-amber-400">{probabilities.filter(p => p.injuryRisk > 60).length}</p>
          <p className="text-xs text-slate-600 mt-1">risk &gt; 60%</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Roster Moves</p>
          <p className="text-3xl font-bold text-blue-400">{rosterMoves.length}</p>
          <p className="text-xs text-slate-600 mt-1">scenarios tracked</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Critical Alerts</p>
          <p className="text-3xl font-bold text-red-400">{criticalAlerts.length}</p>
          <p className="text-xs text-slate-600 mt-1">card value impact</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Upcoming Events</p>
          <p className="text-3xl font-bold text-purple-400">{upcomingEvents.length}</p>
          <p className="text-xs text-slate-600 mt-1">on calendar</p>
        </div>
      </div>

      {/* Injury Risk Chart & Active Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Activity size={18} className="text-amber-400" />
            Injury Risk Assessment
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: number) => [`${value}%`, 'Injury Risk']}
                />
                <Bar dataKey="risk" radius={[0, 4, 4, 0]}>
                  {riskChartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active Injury Reports */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-400" />
            Active Injury Reports
          </h2>
          <div className="space-y-3">
            {reports.map(report => (
              <div key={report.id} className={`bg-slate-800/50 border rounded-xl p-4 ${
                report.severity === 'severe' ? 'border-red-500/30' :
                report.severity === 'moderate' ? 'border-orange-500/20' : 'border-slate-700/50'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-white">{report.playerName}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase ${
                    report.status === 'ir' ? 'bg-red-500/20 text-red-400' :
                    report.status === 'out' ? 'bg-orange-500/20 text-orange-400' :
                    report.status === 'day_to_day' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {report.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{report.team} | {report.injuryType}</p>
                <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
                  <span className={SEVERITY_COLORS[report.severity]}>{report.severity}</span>
                  <span>{report.gamesExpectedMissed} games</span>
                  {report.estimatedReturn && <span>Return: {report.estimatedReturn}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Card Value Impact Projections */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Shield size={18} className="text-blue-400" />
          Card Value Impact Projections
        </h2>
        <div className="space-y-3">
          {cardImpacts.map(ci => (
            <div key={ci.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 hover:border-slate-600 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${URGENCY_STYLES[ci.urgency]}`}>
                    {ci.urgency}
                  </span>
                  <span className="text-sm font-bold text-white">{ci.playerName}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">
                    {ci.eventType.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${ci.percentChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {ci.percentChange >= 0 ? '+' : ''}{ci.percentChange.toFixed(1)}%
                  </span>
                  <p className="text-[10px] text-slate-500">Prob: {ci.probability}%</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 mb-2">{ci.eventDescription}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-3 text-[10px] text-slate-500">
                  <span>Before: ${ci.cardValueBefore}</span>
                  <span>After: ${ci.cardValueAfter}</span>
                  <span>Date: {ci.eventDate}</span>
                </div>
                <p className="text-[10px] text-brand-lime">{ci.recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Player Health Timelines & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Timelines */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <HeartPulse size={18} className="text-red-400" />
            Player Health Timelines
          </h2>
          <div className="space-y-4">
            {healthTimelines.map(ht => (
              <div key={ht.playerId} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-white">{ht.playerName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">Durability</span>
                    <div className="w-16 h-1.5 bg-slate-700 rounded-full">
                      <div
                        className={`h-full rounded-full ${ht.overallDurability > 60 ? 'bg-emerald-500' : ht.overallDurability > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${ht.overallDurability}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400">{ht.overallDurability}%</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-2">{ht.currentStatus}</p>
                <div className="space-y-1.5">
                  {ht.entries.slice(-3).map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[10px]">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        entry.type === 'injury' ? 'bg-red-500' :
                        entry.type === 'recovery' ? 'bg-emerald-500' :
                        entry.type === 'surgery' ? 'bg-red-600' : 'bg-blue-500'
                      }`} />
                      <span className="text-slate-500">{entry.date}</span>
                      <span className="text-slate-400 flex-1 truncate">{entry.event}</span>
                      <span className={entry.cardValueChange >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {entry.cardValueChange >= 0 ? '+' : ''}{entry.cardValueChange}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Roster Events */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Activity size={18} className="text-purple-400" />
            Upcoming Roster Events
          </h2>
          <div className="space-y-3">
            {upcomingEvents.map(evt => (
              <div key={evt.id} className={`bg-slate-900/50 border rounded-xl p-4 ${
                evt.importance === 'critical' ? 'border-red-500/30' :
                evt.importance === 'high' ? 'border-amber-500/20' : 'border-slate-700/30'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase ${URGENCY_STYLES[evt.importance]}`}>
                      {evt.importance}
                    </span>
                    <span className="text-sm font-bold text-white">{evt.playerName}</span>
                  </div>
                  <span className="text-xs text-slate-500">{evt.date}</span>
                </div>
                <p className="text-xs text-slate-400 mb-1">{evt.description}</p>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">{evt.sport} | {evt.team}</span>
                  <span className="text-slate-400">
                    Impact: <span className="text-red-400">{evt.cardImpactRange[0]}%</span> to <span className="text-emerald-400">+{evt.cardImpactRange[1]}%</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Retirement Watch */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Shield size={18} className="text-amber-400" />
          Retirement Watch
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {retirements.filter(r => r.retirementProbability > 0 && r.retirementProbability < 100).map(rw => (
            <div key={rw.playerId} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">{rw.playerName}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  rw.recommendedAction === 'hold' ? 'bg-blue-500/20 text-blue-400' :
                  rw.recommendedAction === 'sell_now' ? 'bg-red-500/20 text-red-400' :
                  rw.recommendedAction === 'accumulate' ? 'bg-emerald-500/20 text-emerald-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {rw.recommendedAction.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] text-slate-500">Retirement Prob:</span>
                <div className="flex-1 h-1.5 bg-slate-700 rounded-full">
                  <div
                    className={`h-full rounded-full ${rw.retirementProbability > 60 ? 'bg-red-500' : rw.retirementProbability > 30 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${rw.retirementProbability}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-300">{rw.retirementProbability}%</span>
              </div>
              <div className="text-[10px] text-slate-500 space-y-0.5">
                <p>Age {rw.age} | {rw.seasonsPlayed} seasons | {rw.sport}</p>
                <p>Card value at retirement: <span className="text-emerald-400">+{rw.cardValueAtRetirement}%</span></p>
                <p>Timeline: {rw.timeline}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InjuryIntel;
