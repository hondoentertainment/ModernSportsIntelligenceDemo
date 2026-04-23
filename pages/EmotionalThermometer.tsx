// @ts-nocheck
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Thermometer,
  Brain,
  AlertTriangle,
  Shield,
  TrendingUp,
  TrendingDown,
  Clock,
  Activity,
  Heart,
  Eye,
  Zap,
  BookOpen,
  Target,
  BarChart3,
  ChevronRight,
  RefreshCw,
  Pause,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import {
  getCurrentReading,
  getEmotionalHistory,
  analyzeTradingSession,
  detectBiases,
  getBehavioralPatterns,
  getCooldownRecommendation,
  getEmotionalProfile,
  getEmotionalTriggers,
  getEmotionalPatterns,
  getJournalEntries,
  getTemperatureColor,
  getStateColor,
  STATE_LABELS,
  type ThermometerReading,
  type EmotionalHistory,
  type TradingSession,
  type BiasDetection,
  type TradingBehavior,
  type CooldownRecommendation,
  type EmotionalProfile,
  type EmotionTrigger,
  type EmotionalPattern,
  type EmotionalJournalEntry,
  type EmotionalState,
} from '../lib/utils/emotionalThermometerService';

// ---- Sub-components ----

const ThermometerViz: React.FC<{ temperature: number; state: EmotionalState }> = ({ temperature, state }) => {
  const fillPercent = Math.max(2, Math.min(100, temperature));
  const color = getTemperatureColor(temperature);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-20 h-64 sm:h-80">
        {/* Thermometer body */}
        <div className="absolute inset-x-2 top-0 bottom-10 rounded-t-full border-2 border-slate-600 bg-slate-900 overflow-hidden">
          {/* Colored zone backgrounds */}
          <div className="absolute inset-0 flex flex-col">
            <div className="flex-1 bg-red-900/20" />
            <div className="flex-1 bg-orange-900/20" />
            <div className="flex-1 bg-yellow-900/20" />
            <div className="flex-1 bg-green-900/20" />
            <div className="flex-1 bg-blue-900/20" />
          </div>
          {/* Fill */}
          <div
            className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out rounded-t-sm"
            style={{
              height: `${fillPercent}%`,
              background: `linear-gradient(to top, ${color}, ${color}cc)`,
              boxShadow: `0 0 12px ${color}66`,
            }}
          />
          {/* Temperature markers */}
          {[20, 40, 60, 80].map(mark => (
            <div
              key={mark}
              className="absolute left-0 right-0 border-t border-slate-600/50"
              style={{ bottom: `${mark}%` }}
            >
              <span className="absolute -right-8 -top-2 text-[10px] text-slate-500">{mark}°</span>
            </div>
          ))}
          {/* Current temp indicator */}
          <div
            className="absolute left-0 right-0 flex items-center transition-all duration-1000"
            style={{ bottom: `${fillPercent}%` }}
          >
            <div
              className="w-full h-0.5 animate-pulse"
              style={{ backgroundColor: color }}
            />
          </div>
        </div>
        {/* Bulb */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full border-2 border-slate-600 flex items-center justify-center transition-colors duration-1000"
          style={{ backgroundColor: color, boxShadow: `0 0 20px ${color}55` }}
        >
          <span className="text-white font-bold text-lg">{temperature}°</span>
        </div>
      </div>
      <div className="text-center mt-2">
        <div className="text-lg font-semibold" style={{ color }}>{STATE_LABELS[state]}</div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string | number; sub?: string; icon: React.ReactNode; color?: string }> = ({ label, value, sub, icon, color }) => (
  <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
    <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">{icon}<span>{label}</span></div>
    <div className="text-2xl font-bold" style={{ color: color || '#e2e8f0' }}>{value}</div>
    {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
  </div>
);

const SeverityBadge: React.FC<{ severity: string }> = ({ severity }) => {
  const cfg: Record<string, { bg: string; text: string; border: string }> = {
    low: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
    medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
    high: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
    critical: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
    info: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
    warning: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
    danger: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  };
  const c = cfg[severity] || cfg.low;
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border}`}>
      {severity.toUpperCase()}
    </span>
  );
};

const TrendIcon: React.FC<{ trend: 'rising' | 'falling' | 'stable' }> = ({ trend }) => {
  if (trend === 'rising') return <ArrowUp size={14} className="text-red-400" />;
  if (trend === 'falling') return <ArrowDown size={14} className="text-green-400" />;
  return <Minus size={14} className="text-slate-400" />;
};

// ---- Custom Recharts Tooltip ----

const TempTooltip: React.FC<{ active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm shadow-xl">
      <div className="text-slate-300 font-medium mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getTemperatureColor(p.value) }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="text-slate-100 font-medium">{p.value}°</span>
        </div>
      ))}
    </div>
  );
};

// ---- Main Page ----

const EmotionalThermometer: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reading, setReading] = useState<ThermometerReading | null>(null);
  const [history, setHistory] = useState<EmotionalHistory[]>([]);
  const [session, setSession] = useState<TradingSession | null>(null);
  const [biases, setBiases] = useState<BiasDetection[]>([]);
  const [behaviors, setBehaviors] = useState<TradingBehavior[]>([]);
  const [cooldown, setCooldown] = useState<CooldownRecommendation | null>(null);
  const [profile, setProfile] = useState<EmotionalProfile | null>(null);
  const [triggers, setTriggers] = useState<EmotionTrigger[]>([]);
  const [patterns, setPatterns] = useState<EmotionalPattern[]>([]);
  const [journal, setJournal] = useState<EmotionalJournalEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'biases' | 'patterns' | 'journal'>('overview');
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState(0);

  useEffect(() => {
    try {
      setReading(getCurrentReading());
      setHistory(getEmotionalHistory(30));
      setSession(analyzeTradingSession());
      setBiases(detectBiases());
      setBehaviors(getBehavioralPatterns());
      setCooldown(getCooldownRecommendation());
      setProfile(getEmotionalProfile());
      setTriggers(getEmotionalTriggers());
      setPatterns(getEmotionalPatterns());
      setJournal(getJournalEntries());
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (!cooldownActive || cooldownTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setCooldownTimeLeft(prev => {
        if (prev <= 1) { setCooldownActive(false); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownActive, cooldownTimeLeft]);

  const startCooldown = useCallback(() => {
    if (cooldown) {
      setCooldownActive(true);
      setCooldownTimeLeft(cooldown.minutes * 60);
    }
  }, [cooldown]);

  const historyChartData = useMemo(() =>
    history.map(h => ({
      date: h.date.slice(5),
      avg: h.avgTemperature,
      peak: h.peakTemperature,
      low: h.lowTemperature,
      quality: h.tradeQuality,
    })),
    [history]
  );

  const qualityChartData = useMemo(() =>
    history.map(h => ({
      date: h.date.slice(5),
      quality: h.tradeQuality,
      trades: h.tradesExecuted,
    })),
    [history]
  );

  const behaviorTypeLabel: Record<string, string> = {
    rapid_fire_buying: 'Rapid Fire Buying',
    panic_selling: 'Panic Selling',
    chasing_losses: 'Chasing Losses',
    fomo_buying: 'FOMO Buying',
    revenge_trading: 'Revenge Trading',
    overtrading: 'Overtrading',
    balanced: 'Balanced Trading',
  };

  const biasLabel: Record<string, string> = {
    recency: 'Recency Bias',
    anchoring: 'Anchoring',
    loss_aversion: 'Loss Aversion',
    endowment: 'Endowment Effect',
    confirmation: 'Confirmation Bias',
    sunk_cost: 'Sunk Cost Fallacy',
    herd_mentality: 'Herd Mentality',
  };

  const emotionTagLabel: Record<string, string> = {
    calm_and_calculated: 'Calm & Calculated',
    excited: 'Excited',
    nervous: 'Nervous',
    impulsive: 'Impulsive',
    fearful: 'Fearful',
    greedy: 'Greedy',
    regretful: 'Regretful',
    confident: 'Confident',
    desperate: 'Desperate',
    relieved: 'Relieved',
  };

  const formatCooldownTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <RefreshCw className="animate-spin" size={24} />
          <span className="text-lg">Analyzing emotional patterns...</span>
        </div>
      </div>
    );
  }

  if (!reading || !session || !cooldown || !profile) return null;

  const tabs = [
    { key: 'overview' as const, label: 'Overview', icon: <Activity size={16} /> },
    { key: 'biases' as const, label: 'Bias Detection', icon: <Eye size={16} /> },
    { key: 'patterns' as const, label: 'Patterns', icon: <Brain size={16} /> },
    { key: 'journal' as const, label: 'Journal', icon: <BookOpen size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <Thermometer className="text-orange-400" size={28} />
              Emotional Portfolio Thermometer
            </h1>
            <p className="text-slate-400 mt-1">Behavioral finance layer analyzing your trading emotions in real-time</p>
          </div>
          <div className="flex items-center gap-3">
            {cooldown.shouldCoolDown && !cooldownActive && (
              <button
                onClick={startCooldown}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <Pause size={16} />
                Start Cooldown
              </button>
            )}
            {cooldownActive && (
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-300">
                <Clock size={16} className="animate-pulse" />
                <span className="font-mono font-bold">{formatCooldownTime(cooldownTimeLeft)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Cooldown Banner */}
        {cooldownActive && (
          <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield className="text-blue-400 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <div className="font-medium text-blue-300 mb-1">Cooldown Active - {formatCooldownTime(cooldownTimeLeft)} remaining</div>
                <div className="text-sm text-blue-400/80 mb-2">{cooldown.reason}</div>
                <div className="text-sm text-slate-400">Suggested activities:</div>
                <ul className="text-sm text-slate-500 mt-1 space-y-1">
                  {cooldown.suggestedActivities.map((a, i) => (
                    <li key={i} className="flex items-center gap-2"><ChevronRight size={12} />{a}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Top Section: Thermometer + Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Thermometer */}
          <div className="lg:col-span-4 bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col items-center">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Heart size={18} className="text-red-400" />
              Current Reading
            </h2>
            <ThermometerViz temperature={reading.temperature} state={reading.state} />
            <div className="mt-4 w-full space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Trend</span>
                <span className="flex items-center gap-1">
                  <TrendIcon trend={reading.trend} />
                  <span className={reading.trend === 'rising' ? 'text-red-400' : reading.trend === 'falling' ? 'text-green-400' : 'text-slate-400'}>
                    {reading.trend.charAt(0).toUpperCase() + reading.trend.slice(1)}
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Risk Multiplier</span>
                <span className={reading.riskMultiplier > 1.5 ? 'text-red-400 font-medium' : 'text-slate-200'}>{reading.riskMultiplier}x</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Session Duration</span>
                <span className="text-slate-200">{Math.floor(reading.sessionDuration / 60)}h {reading.sessionDuration % 60}m</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Trading Quality</span>
                <span style={{ color: getTemperatureColor(100 - reading.tradingQuality) }} className="font-medium">{reading.tradingQuality}/100</span>
              </div>
            </div>
          </div>

          {/* Stats Grid + Session */}
          <div className="lg:col-span-8 space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Avg Temperature" value={`${profile.averageTemperature}°`} sub="30-day average" icon={<Thermometer size={14} />} color={getTemperatureColor(profile.averageTemperature)} />
              <StatCard label="Volatility" value={profile.volatility} sub="Emotional swing range" icon={<Activity size={14} />} color={profile.volatility > 20 ? '#f97316' : '#22c55e'} />
              <StatCard label="Resilience" value={`${profile.resilience}%`} sub="Recovery speed" icon={<Shield size={14} />} color={profile.resilience > 50 ? '#22c55e' : '#ef4444'} />
              <StatCard label="Calm Streak" value={`${profile.streakDaysCalm}d`} sub="Days below 40°" icon={<Target size={14} />} color="#3b82f6" />
            </div>

            {/* Session Alerts */}
            {session.alerts.filter(a => !a.acknowledged).length > 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-yellow-400" />
                  Active Session Alerts
                </h3>
                <div className="space-y-2">
                  {session.alerts.filter(a => !a.acknowledged).map(alert => (
                    <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg ${
                      alert.severity === 'danger' ? 'bg-red-900/20 border border-red-500/20' : 'bg-yellow-900/20 border border-yellow-500/20'
                    }`}>
                      <Zap size={14} className={alert.severity === 'danger' ? 'text-red-400 mt-0.5' : 'text-yellow-400 mt-0.5'} />
                      <div className="flex-1">
                        <div className="text-sm">{alert.message}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          {behaviorTypeLabel[alert.relatedBehavior]} - {new Date(alert.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <SeverityBadge severity={alert.severity} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Profile Summary */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <Brain size={16} className="text-purple-400" />
                Emotional Profile
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Personality Type</div>
                  <div className="text-sm font-medium text-purple-300">{profile.personalityType}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Self-Awareness Score</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${profile.selfAwareness}%` }} />
                    </div>
                    <span className="text-sm font-medium text-purple-300">{profile.selfAwareness}%</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Best Trading State</div>
                  <div className="text-sm" style={{ color: getStateColor(profile.bestTradingState) }}>
                    {STATE_LABELS[profile.bestTradingState]}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Worst Trading State</div>
                  <div className="text-sm" style={{ color: getStateColor(profile.worstTradingState) }}>
                    {STATE_LABELS[profile.worstTradingState]}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-800 rounded-xl p-1 border border-slate-700 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-slate-700 text-slate-100'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Temperature History Chart */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="text-blue-400" />
                Temperature History (30 Days)
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historyChartData}>
                    <defs>
                      <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip content={<TempTooltip />} />
                    <ReferenceArea y1={0} y2={35} fill="#22c55e" fillOpacity={0.05} />
                    <ReferenceArea y1={35} y2={65} fill="#eab308" fillOpacity={0.05} />
                    <ReferenceArea y1={65} y2={100} fill="#ef4444" fillOpacity={0.05} />
                    <ReferenceLine y={65} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Danger Zone', fill: '#ef4444', fontSize: 11 }} />
                    <ReferenceLine y={35} stroke="#22c55e" strokeDasharray="3 3" label={{ value: 'Calm Zone', fill: '#22c55e', fontSize: 11 }} />
                    <Area type="monotone" dataKey="peak" stroke="transparent" fill="url(#tempGrad)" />
                    <Line type="monotone" dataKey="avg" stroke="#f97316" strokeWidth={2} dot={false} name="Average" />
                    <Line type="monotone" dataKey="peak" stroke="#ef4444" strokeWidth={1} strokeDasharray="4 4" dot={false} name="Peak" />
                    <Line type="monotone" dataKey="low" stroke="#3b82f6" strokeWidth={1} strokeDasharray="4 4" dot={false} name="Low" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Trade Quality Score Chart */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target size={18} className="text-green-400" />
                Trade Quality Over Time
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={qualityChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: 8 }}
                      labelStyle={{ color: '#cbd5e1' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <ReferenceLine y={70} stroke="#22c55e" strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="quality" stroke="#22c55e" strokeWidth={2} dot={false} name="Quality Score" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Trading Behaviors */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity size={18} className="text-orange-400" />
                Trading Behavior Breakdown
              </h3>
              <div className="space-y-3">
                {behaviors.map((b, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-slate-900 rounded-lg border border-slate-700">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{behaviorTypeLabel[b.type]}</span>
                        <SeverityBadge severity={b.severity} />
                      </div>
                      <div className="text-xs text-slate-400">{b.description}</div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-slate-500 text-xs">Frequency</div>
                        <div className="font-medium">{b.frequency}x</div>
                      </div>
                      <div className="text-center">
                        <div className="text-slate-500 text-xs">Impact</div>
                        <div className={`font-medium ${b.financialImpact >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {b.financialImpact >= 0 ? '+' : ''}${b.financialImpact.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Triggers */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap size={18} className="text-yellow-400" />
                Emotional Triggers
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {triggers.map(t => (
                  <div key={t.id} className="p-3 bg-slate-900 rounded-lg border border-slate-700">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{t.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">{t.category}</span>
                    </div>
                    <div className="text-xs text-slate-400 mb-2">{t.description}</div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>Frequency: {t.frequency}x</span>
                      <span className="text-orange-400">+{t.avgTemperatureIncrease}° avg</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'biases' && (
          <div className="space-y-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Eye size={18} className="text-purple-400" />
                Detected Cognitive Biases
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Active biases detected from your recent trading patterns. Total estimated cost: ${biases.reduce((s, b) => s + b.financialCost, 0).toLocaleString()}
              </p>
              <div className="space-y-4">
                {biases.map(b => (
                  <div key={b.id} className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold">{biasLabel[b.biasType]}</span>
                        <SeverityBadge severity={b.severity} />
                      </div>
                      <div className="text-sm text-red-400 font-medium">-${b.financialCost.toLocaleString()} est. cost</div>
                    </div>
                    <div className="mb-3">
                      <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Evidence</div>
                      <div className="text-sm text-slate-300">{b.evidence}</div>
                    </div>
                    <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-3">
                      <div className="text-xs text-green-400 uppercase tracking-wide mb-1">Suggested Correction</div>
                      <div className="text-sm text-green-300">{b.suggestedCorrection}</div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span>Detected {b.frequency}x</span>
                      <span>Last: {new Date(b.detectedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bias Resistance Score */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 sm:p-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Bias Resistance Score</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-4 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${profile.biasResistance}%`,
                      backgroundColor: profile.biasResistance > 60 ? '#22c55e' : profile.biasResistance > 30 ? '#eab308' : '#ef4444',
                    }}
                  />
                </div>
                <span className="text-xl font-bold" style={{
                  color: profile.biasResistance > 60 ? '#22c55e' : profile.biasResistance > 30 ? '#eab308' : '#ef4444',
                }}>{profile.biasResistance}%</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Based on {profile.totalTradesAnalyzed} trades analyzed. Improve by following suggested corrections above.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'patterns' && (
          <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Brain size={18} className="text-cyan-400" />
                Recognized Patterns
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                AI-detected behavioral patterns from your trading history
              </p>
              <div className="space-y-4">
                {patterns.map(p => (
                  <div key={p.id} className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{p.pattern}</span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full border"
                          style={{
                            color: getStateColor(p.associatedState),
                            borderColor: getStateColor(p.associatedState) + '44',
                            backgroundColor: getStateColor(p.associatedState) + '11',
                          }}
                        >
                          {p.associatedState}
                        </span>
                      </div>
                      <div className={`text-sm font-medium ${p.averageImpact >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {p.averageImpact >= 0 ? '+' : ''}${p.averageImpact}/trade avg
                      </div>
                    </div>
                    <div className="text-sm text-slate-300 mb-2">{p.description}</div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>Occurrences: {p.occurrences}</span>
                      {p.dayOfWeek && <span>Day: {p.dayOfWeek}</span>}
                      {p.timeOfDay && <span>Time: {p.timeOfDay}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Session Journey */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-green-400" />
                Current Session Emotional Journey
              </h3>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {session.emotionalJourney.map((state, i) => (
                  <React.Fragment key={i}>
                    <div
                      className="flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium border whitespace-nowrap"
                      style={{
                        color: getStateColor(state),
                        borderColor: getStateColor(state) + '44',
                        backgroundColor: getStateColor(state) + '11',
                      }}
                    >
                      Trade {i + 1}: {state}
                    </div>
                    {i < session.emotionalJourney.length - 1 && (
                      <ChevronRight size={14} className="text-slate-600 flex-shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-sm">
                <div>
                  <div className="text-xs text-slate-500">Start Temp</div>
                  <div style={{ color: getTemperatureColor(session.startTemperature) }} className="font-medium">{session.startTemperature}°</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Peak Temp</div>
                  <div style={{ color: getTemperatureColor(session.peakTemperature) }} className="font-medium">{session.peakTemperature}°</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">End Temp</div>
                  <div style={{ color: getTemperatureColor(session.endTemperature) }} className="font-medium">{session.endTemperature}°</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Session P/L</div>
                  <div className={`font-medium ${session.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {session.profitLoss >= 0 ? '+' : ''}${session.profitLoss}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'journal' && (
          <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BookOpen size={18} className="text-indigo-400" />
                Emotional Journal
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Track how emotions impacted your trades. Entries with higher temperatures tend to produce worse outcomes.
              </p>
              <div className="space-y-3">
                {journal.map(entry => (
                  <div key={entry.id} className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                          style={{
                            backgroundColor: getTemperatureColor(entry.temperature) + '22',
                            color: getTemperatureColor(entry.temperature),
                            border: `2px solid ${getTemperatureColor(entry.temperature)}44`,
                          }}
                        >
                          {entry.temperature}°
                        </div>
                        <div>
                          <div className="text-sm font-medium">Trade {entry.tradeId}</div>
                          <div className="text-xs text-slate-500">{new Date(entry.timestamp).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className={`text-sm font-medium ${entry.outcome === 'profit' ? 'text-green-400' : entry.outcome === 'loss' ? 'text-red-400' : 'text-slate-400'}`}>
                        {entry.amount >= 0 ? '+' : ''}${entry.amount}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2 text-xs">
                      <span className="text-slate-500">Before:</span>
                      <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-300">{emotionTagLabel[entry.preTradeFeeling]}</span>
                      <ChevronRight size={12} className="text-slate-600" />
                      <span className="text-slate-500">After:</span>
                      <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-300">{emotionTagLabel[entry.postTradeFeeling]}</span>
                    </div>
                    <div className="text-sm text-slate-400 italic">"{entry.notes}"</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Journal Insights */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 sm:p-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Journal Insights</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-700">
                  <div className="text-xs text-slate-500 mb-1">Profitable Trades Avg Temp</div>
                  <div className="text-xl font-bold text-green-400">
                    {Math.round(journal.filter(j => j.outcome === 'profit').reduce((s, j) => s + j.temperature, 0) / Math.max(1, journal.filter(j => j.outcome === 'profit').length))}°
                  </div>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-700">
                  <div className="text-xs text-slate-500 mb-1">Losing Trades Avg Temp</div>
                  <div className="text-xl font-bold text-red-400">
                    {Math.round(journal.filter(j => j.outcome === 'loss').reduce((s, j) => s + j.temperature, 0) / Math.max(1, journal.filter(j => j.outcome === 'loss').length))}°
                  </div>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-700">
                  <div className="text-xs text-slate-500 mb-1">Most Common Pre-Trade Feeling</div>
                  <div className="text-xl font-bold text-indigo-400">Impulsive</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmotionalThermometer;
