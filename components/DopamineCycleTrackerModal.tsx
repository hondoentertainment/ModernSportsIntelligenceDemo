import React, { useState, useMemo } from 'react';
import {
  X,
  Brain,
  Activity,
  ShoppingCart,
  Thermometer,
  AlertTriangle,
  Clock,
  DollarSign,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  ShieldAlert,
  Info,
  AlertCircle,
  Timer,
  Eye,
  Target,
  Flame,
  Snowflake,
  BarChart3,
  CalendarDays,
  Shield,
} from 'lucide-react';
import {
  getCycles,
  getPatterns,
  getCooldownScore,
  getAlerts,
  getBehaviorStats,
} from '../lib/dopamineCycleTrackerService';
import type {
  DopamineCycle,
  PurchasePattern,
  CooldownScore as CooldownScoreType,
  BehaviorAlert,
  BehaviorStats,
  CyclePhase,
  AlertSeverity,
} from '../lib/dopamineCycleTrackerService';

interface DopamineCycleTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const tabs = [
  { id: 'cycles', label: 'Cycle Monitor', icon: <Activity size={16} /> },
  { id: 'patterns', label: 'Purchase Patterns', icon: <ShoppingCart size={16} /> },
  { id: 'cooldown', label: 'Cooldown Score', icon: <Thermometer size={16} /> },
  { id: 'alerts', label: 'Behavior Alerts', icon: <AlertTriangle size={16} /> },
];

const phaseConfig: Record<CyclePhase, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  escalation: {
    color: 'text-orange-400',
    bg: 'bg-orange-500/20',
    icon: <TrendingUp size={16} className="text-orange-400" />,
    label: 'Escalation',
  },
  peak: {
    color: 'text-red-400',
    bg: 'bg-red-500/20',
    icon: <Flame size={16} className="text-red-400" />,
    label: 'Peak',
  },
  cooldown: {
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    icon: <Snowflake size={16} className="text-blue-400" />,
    label: 'Cooldown',
  },
  baseline: {
    color: 'text-green-400',
    bg: 'bg-green-500/20',
    icon: <Minus size={16} className="text-green-400" />,
    label: 'Baseline',
  },
};

const severityConfig: Record<AlertSeverity, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  critical: {
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: <ShieldAlert size={18} className="text-red-400" />,
  },
  warning: {
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    icon: <AlertCircle size={18} className="text-amber-400" />,
  },
  info: {
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    icon: <Info size={18} className="text-blue-400" />,
  },
};

const timeSlots = [
  '12AM', '1AM', '2AM', '3AM', '4AM', '5AM', '6AM', '7AM',
  '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM',
  '4PM', '5PM', '6PM', '7PM', '8PM', '9PM', '10PM', '11PM',
];
const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function generateHeatmapData(): number[][] {
  const data: number[][] = [];
  for (let day = 0; day < 7; day++) {
    const row: number[] = [];
    for (let hour = 0; hour < 24; hour++) {
      let base = 0;
      if (hour >= 22 || hour <= 2) base += 0.4;
      if (hour >= 11 && hour <= 14) base += 0.2;
      if (hour >= 17 && hour <= 20) base += 0.3;
      if (day === 4) base += 0.25;
      if (day === 0) base += 0.15;
      if (day === 2 && hour >= 18 && hour <= 21) base += 0.35;
      if (day === 3 && hour >= 13 && hour <= 16) base += 0.3;
      if (day === 6 && hour >= 7 && hour <= 10) base += 0.2;
      base += Math.sin(day * 1.3 + hour * 0.7) * 0.08;
      row.push(Math.min(1, Math.max(0, base)));
    }
    data.push(row);
  }
  return data;
}

function getHeatmapColor(value: number): string {
  if (value < 0.1) return 'bg-slate-800';
  if (value < 0.2) return 'bg-violet-900/30';
  if (value < 0.35) return 'bg-violet-800/40';
  if (value < 0.5) return 'bg-violet-700/50';
  if (value < 0.65) return 'bg-violet-600/60';
  if (value < 0.8) return 'bg-violet-500/70';
  return 'bg-violet-400/80';
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value);
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${(minutes / 60).toFixed(1)}h`;
  return `${(minutes / 1440).toFixed(1)}d`;
}

const DopamineCycleTrackerModal: React.FC<DopamineCycleTrackerModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<string>('cycles');

  const cycles = useMemo(() => getCycles(), []);
  const patterns = useMemo(() => getPatterns(), []);
  const cooldownScore = useMemo(() => getCooldownScore(), []);
  const alerts = useMemo(() => getAlerts(), []);
  const behaviorStats = useMemo(() => getBehaviorStats(), []);
  const heatmapData = useMemo(() => generateHeatmapData(), []);

  if (!isOpen) return null;

  const sortedCycles = [...cycles].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
  const maxSpend = Math.max(...cycles.map((c) => c.totalSpend), 1);

  const renderCycleMonitor = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart size={14} className="text-violet-400" />
            <span className="text-xs text-slate-400">Purchases (30d)</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">{behaviorStats.totalPurchases30d}</p>
          <p className="text-xs text-slate-500 mt-1">
            {(behaviorStats.totalPurchases30d / 30).toFixed(1)}/day avg
          </p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={14} className="text-violet-400" />
            <span className="text-xs text-slate-400">Total Spend (30d)</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">{formatCurrency(behaviorStats.totalSpend30d)}</p>
          <p className="text-xs text-slate-500 mt-1">
            {formatCurrency(behaviorStats.avgDailySpend)}/day avg
          </p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-violet-400" />
            <span className="text-xs text-slate-400">Impulse Rate</span>
          </div>
          <p className={`text-2xl font-bold ${behaviorStats.impulseRate > 50 ? 'text-red-400' : behaviorStats.impulseRate > 30 ? 'text-amber-400' : 'text-green-400'}`}>
            {behaviorStats.impulseRate}%
          </p>
          <p className="text-xs text-slate-500 mt-1">Under 2min browse</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-violet-400" />
            <span className="text-xs text-slate-400">Spend Acceleration</span>
          </div>
          <p className={`text-2xl font-bold ${behaviorStats.spendAcceleration > 30 ? 'text-red-400' : 'text-amber-400'}`}>
            +{behaviorStats.spendAcceleration}%
          </p>
          <p className="text-xs text-slate-500 mt-1">Week-over-week</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Detected Cycles
        </h3>
        {sortedCycles.map((cycle: DopamineCycle) => {
          const phase = phaseConfig[cycle.phase];
          const barWidth = (cycle.totalSpend / maxSpend) * 100;
          return (
            <div
              key={cycle.id}
              className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${phase.bg}`}>{phase.icon}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${phase.color}`}>
                        {phase.label} Phase
                      </span>
                      {!cycle.endDate && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-violet-500/20 text-violet-300 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {cycle.startDate} {cycle.endDate ? `to ${cycle.endDate}` : '(ongoing)'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 mb-1">Intensity</div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          cycle.intensityScore >= 80
                            ? 'bg-red-500'
                            : cycle.intensityScore >= 50
                            ? 'bg-orange-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${cycle.intensityScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-slate-200">
                      {cycle.intensityScore}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div>
                  <p className="text-xs text-slate-500">Purchases</p>
                  <p className="text-sm font-semibold text-slate-200">{cycle.purchaseCount}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Spend</p>
                  <p className="text-sm font-semibold text-slate-200">
                    {formatCurrency(cycle.totalSpend)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Avg Time Between</p>
                  <p className="text-sm font-semibold text-slate-200">
                    {formatMinutes(cycle.averageTimeBetweenPurchases)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Peak Spend Day</p>
                  <p className="text-sm font-semibold text-slate-200">{cycle.peakSpendDay}</p>
                </div>
              </div>
              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    cycle.phase === 'peak'
                      ? 'bg-red-500'
                      : cycle.phase === 'escalation'
                      ? 'bg-orange-500'
                      : cycle.phase === 'cooldown'
                      ? 'bg-blue-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-violet-500/10 rounded-xl p-5 border border-violet-500/30">
        <div className="flex items-center gap-2 mb-3">
          <Brain size={16} className="text-violet-400" />
          <p className="text-sm font-semibold text-violet-300">Break Addiction Score</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#334155" strokeWidth="2.5" />
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke={behaviorStats.breakAddiction > 60 ? '#ef4444' : behaviorStats.breakAddiction > 40 ? '#f59e0b' : '#22c55e'}
                strokeWidth="2.5"
                strokeDasharray={`${behaviorStats.breakAddiction} ${100 - behaviorStats.breakAddiction}`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">
              {behaviorStats.breakAddiction}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm text-white font-medium mb-1">
              Break participation is elevated
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Breaks account for the majority of your recent spending. High break addiction
              scores correlate with faster cycle escalation and shorter cooldown periods.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPurchasePatterns = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
          Purchase Activity Heatmap
        </h3>
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="flex mb-1">
              <div className="w-10 flex-shrink-0" />
              {timeSlots.map((slot, i) => (
                <div key={i} className="flex-1 text-center">
                  {i % 3 === 0 && (
                    <span className="text-[10px] text-slate-500">{slot}</span>
                  )}
                </div>
              ))}
            </div>
            {daysOfWeek.map((day, dayIdx) => (
              <div key={day} className="flex items-center mb-1">
                <div className="w-10 flex-shrink-0 text-xs text-slate-400">{day}</div>
                {heatmapData[dayIdx].map((value, hourIdx) => (
                  <div
                    key={hourIdx}
                    className={`flex-1 h-6 mx-px rounded-sm ${getHeatmapColor(value)} transition-colors`}
                    title={`${day} ${timeSlots[hourIdx]}: ${(value * 100).toFixed(0)}% activity`}
                  />
                ))}
              </div>
            ))}
            <div className="flex items-center justify-end gap-2 mt-3">
              <span className="text-[10px] text-slate-500">Low</span>
              <div className="flex gap-0.5">
                {[
                  'bg-slate-800',
                  'bg-violet-900/30',
                  'bg-violet-800/40',
                  'bg-violet-700/50',
                  'bg-violet-600/60',
                  'bg-violet-500/70',
                  'bg-violet-400/80',
                ].map((c, i) => (
                  <div key={i} className={`w-4 h-3 rounded-sm ${c}`} />
                ))}
              </div>
              <span className="text-[10px] text-slate-500">High</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-violet-500/10 border border-violet-500/30 rounded-xl">
        <Clock size={16} className="text-violet-400 flex-shrink-0" />
        <div>
          <p className="text-xs text-violet-300 font-semibold">
            Most Active Hour: {behaviorStats.mostActiveHour}:00
          </p>
          <p className="text-xs text-slate-400">
            Your purchasing peaks at{' '}
            {behaviorStats.mostActiveHour > 12
              ? `${behaviorStats.mostActiveHour - 12}PM`
              : `${behaviorStats.mostActiveHour}AM`}
            . Late-night buying is associated with higher regret rates.
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
          Frequency Analysis
        </h3>
        <div className="space-y-3">
          {patterns.map((pattern: PurchasePattern) => (
            <div
              key={pattern.id}
              className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">{pattern.label}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={12} /> {pattern.timeOfDay.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <CalendarDays size={12} /> {pattern.dayOfWeek}
                    </span>
                  </div>
                </div>
                <div
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    pattern.impulseProbability >= 0.7
                      ? 'bg-red-500/20 text-red-300'
                      : pattern.impulseProbability >= 0.4
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-green-500/20 text-green-300'
                  }`}
                >
                  {(pattern.impulseProbability * 100).toFixed(0)}% impulse
                </div>
              </div>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                {pattern.description}
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-500">Frequency</p>
                  <p className="text-sm font-semibold text-slate-200">{pattern.frequency}/wk</p>
                </div>
                <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-500">Avg Spend</p>
                  <p className="text-sm font-semibold text-slate-200">
                    {formatCurrency(pattern.averageSpend)}
                  </p>
                </div>
                <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-500">Impulse Prob.</p>
                  <div className="flex items-center gap-2 mt-1 justify-center">
                    <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          pattern.impulseProbability >= 0.7
                            ? 'bg-red-500'
                            : pattern.impulseProbability >= 0.4
                            ? 'bg-amber-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${pattern.impulseProbability * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCooldownScore = () => {
    const trendIcon =
      cooldownScore.trend === 'improving' ? (
        <TrendingUp size={16} className="text-green-400" />
      ) : cooldownScore.trend === 'worsening' ? (
        <TrendingDown size={16} className="text-red-400" />
      ) : (
        <Minus size={16} className="text-slate-400" />
      );

    const trendColor =
      cooldownScore.trend === 'improving'
        ? 'text-green-400'
        : cooldownScore.trend === 'worsening'
        ? 'text-red-400'
        : 'text-slate-400';

    const scoreColor =
      cooldownScore.overall >= 70
        ? 'text-green-400'
        : cooldownScore.overall >= 40
        ? 'text-amber-400'
        : 'text-red-400';

    const gaugeStroke =
      cooldownScore.overall >= 70
        ? '#22c55e'
        : cooldownScore.overall >= 40
        ? '#f59e0b'
        : '#ef4444';

    const gaugeLabel =
      cooldownScore.overall >= 70
        ? 'Healthy'
        : cooldownScore.overall >= 40
        ? 'At Risk'
        : 'Critical';

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-800/50 rounded-xl p-8 border border-slate-700/50">
          <div className="flex flex-col items-center">
            <div className="relative w-40 h-40">
              <svg className="w-40 h-40 -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke={gaugeStroke}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(cooldownScore.overall / 100) * 327} 327`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-5xl font-bold ${scoreColor}`}>
                  {cooldownScore.overall}
                </span>
                <span className="text-sm text-slate-400 mt-1">{gaugeLabel}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              {trendIcon}
              <span className={`text-sm font-medium ${trendColor} capitalize`}>
                {cooldownScore.trend}
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <h3 className="text-lg font-semibold text-slate-200">
              Cooldown Health Assessment
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {cooldownScore.recommendation}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-500 mb-0.5">Current Phase</p>
                <p className="text-sm font-bold text-orange-400">Escalation</p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-500 mb-0.5">Spend Velocity</p>
                <p className="text-sm font-bold text-red-400">
                  +{behaviorStats.spendAcceleration}% WoW
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
            <Timer size={20} className="text-violet-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-100">
              {cooldownScore.daysSinceLastPurchase}
            </p>
            <p className="text-xs text-slate-400 mt-1">Days Since Purchase</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
            <Target size={20} className="text-violet-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-100">
              {cooldownScore.breakParticipationRate}%
            </p>
            <p className="text-xs text-slate-400 mt-1">Break Participation</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
            <Clock size={20} className="text-violet-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-100">
              {cooldownScore.avgSessionDuration}m
            </p>
            <p className="text-xs text-slate-400 mt-1">Avg Session Duration</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
            <Eye size={20} className="text-violet-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-100">
              {cooldownScore.windowShoppingRatio}x
            </p>
            <p className="text-xs text-slate-400 mt-1">View-to-Purchase</p>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
            Cooldown Streak
          </h3>
          <div className="flex items-center gap-6 mb-4">
            <div className="flex-1">
              <p className="text-xs text-slate-400 mb-1">Longest Streak</p>
              <p className="text-3xl font-bold text-violet-400">
                {behaviorStats.longestCooldownStreak}{' '}
                <span className="text-base font-normal text-slate-400">days</span>
              </p>
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400 mb-1">Current Streak</p>
              <p className="text-3xl font-bold text-slate-200">
                {cooldownScore.daysSinceLastPurchase}{' '}
                <span className="text-base font-normal text-slate-400">days</span>
              </p>
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400 mb-1">Break Addiction</p>
              <p className="text-3xl font-bold text-amber-400">
                {behaviorStats.breakAddiction}
                <span className="text-base font-normal text-slate-400">/100</span>
              </p>
            </div>
          </div>
          <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400"
              style={{
                width: `${Math.min(
                  (cooldownScore.daysSinceLastPurchase /
                    behaviorStats.longestCooldownStreak) *
                    100,
                  100
                )}%`,
              }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {(
              (cooldownScore.daysSinceLastPurchase /
                behaviorStats.longestCooldownStreak) *
              100
            ).toFixed(0)}
            % of your personal best streak
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:bg-slate-800/60 transition-all cursor-pointer">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} className="text-violet-400" />
              <p className="text-xs font-semibold text-white">72h Purchase Lock</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Activate a voluntary cooling-off period. No purchases possible for 72 hours.
            </p>
          </div>
          <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:bg-slate-800/60 transition-all cursor-pointer">
            <div className="flex items-center gap-2 mb-2">
              <Timer size={16} className="text-violet-400" />
              <p className="text-xs font-semibold text-white">Delay Timer</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Add a 15-minute confirmation delay on all purchases over $50.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderBehaviorAlerts = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30 text-center">
          <ShieldAlert size={20} className="text-red-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-red-400">
            {alerts.filter((a: BehaviorAlert) => a.severity === 'critical').length}
          </p>
          <p className="text-xs text-slate-400 mt-1">Critical</p>
        </div>
        <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30 text-center">
          <AlertCircle size={20} className="text-amber-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-amber-400">
            {alerts.filter((a: BehaviorAlert) => a.severity === 'warning').length}
          </p>
          <p className="text-xs text-slate-400 mt-1">Warnings</p>
        </div>
        <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30 text-center">
          <Info size={20} className="text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-400">
            {alerts.filter((a: BehaviorAlert) => a.severity === 'info').length}
          </p>
          <p className="text-xs text-slate-400 mt-1">Informational</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Active Alerts
        </h3>
        {alerts.map((alert: BehaviorAlert) => {
          const sev = severityConfig[alert.severity];
          const thresholdPct = Math.min(
            (alert.currentValue / alert.threshold) * 100,
            150
          );
          return (
            <div
              key={alert.id}
              className={`${sev.bg} rounded-xl p-5 border ${sev.border}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  {sev.icon}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">
                      {alert.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Triggered{' '}
                      {new Date(alert.triggeredAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${sev.bg} ${sev.color} capitalize`}
                >
                  {alert.severity}
                </span>
              </div>
              <p className="text-sm text-slate-300 mb-4">{alert.description}</p>
              <div className="flex items-center gap-6 mb-4">
                <div>
                  <p className="text-xs text-slate-500">Metric</p>
                  <p className="text-sm font-medium text-slate-300">{alert.metric}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Current</p>
                  <p className={`text-sm font-bold ${sev.color}`}>
                    {alert.currentValue}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Threshold</p>
                  <p className="text-sm font-medium text-slate-400">{alert.threshold}</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 mb-1">Severity</p>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        alert.severity === 'critical'
                          ? 'bg-red-500'
                          : alert.severity === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(thresholdPct, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3 flex items-start gap-2">
                <BarChart3 size={14} className="text-violet-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-violet-300 mb-0.5">
                    Suggested Action
                  </p>
                  <p className="text-xs text-slate-300">{alert.suggestion}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-500/20">
              <Brain size={24} className="text-violet-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">
                Dopamine Cycle Tracker
              </h2>
              <p className="text-sm text-slate-400">
                Monitor spending impulses and behavioral patterns
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="flex gap-1 p-4 border-b border-slate-700/50">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === t.id
                  ? 'bg-violet-500/20 text-violet-400'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'cycles' && renderCycleMonitor()}
          {activeTab === 'patterns' && renderPurchasePatterns()}
          {activeTab === 'cooldown' && renderCooldownScore()}
          {activeTab === 'alerts' && renderBehaviorAlerts()}
        </div>
      </div>
    </div>
  );
};

export default DopamineCycleTrackerModal;
