import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  X,
  HeartPulse,
  Activity,
  Clock,
  Settings,
  Shield,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Bluetooth,
  Brain,
  Thermometer,
  Timer,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import {
  getBiometricReadings,
  getTradingSessions,
  getCooldownEvents,
  getBiometricStats,
  getGuardConfig,
  updateGuardConfig,
  getCurrentStressLevel,
  getEmotionalStateColor,
  getEmotionalStateBg,
  getReadinessLabel,
  formatDuration,
  formatTimestamp,
  formatDate,
  type TradingSession,
  type CooldownEvent,
  type EmotionalState,
  type GuardConfig,
} from '../lib/biometricTradingGuardService';

interface BiometricTradingGuardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'monitor' | 'sessions' | 'cooldowns' | 'settings';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'monitor', label: 'Live Monitor', icon: <Activity size={16} /> },
  { id: 'sessions', label: 'Session History', icon: <Clock size={16} /> },
  { id: 'cooldowns', label: 'Cooldown Log', icon: <Shield size={16} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
];

const EMOTION_LABELS: Record<EmotionalState, string> = {
  calm: 'Calm',
  elevated: 'Elevated',
  anxious: 'Anxious',
  euphoric: 'Euphoric',
  panic: 'Panic',
};

const BiometricTradingGuardModal: React.FC<BiometricTradingGuardModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('monitor');
  const [live, setLive] = useState(() => getCurrentStressLevel());
  const [config, setConfig] = useState<GuardConfig>(() => getGuardConfig());

  const sessions = useMemo(() => getTradingSessions(), []);
  const cooldowns = useMemo(() => getCooldownEvents(), []);
  const stats = useMemo(() => getBiometricStats(), []);

  // Simulate live biometric updates
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setLive(getCurrentStressLevel());
    }, 2500);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleConfigChange = useCallback((key: keyof GuardConfig, value: number | boolean | string) => {
    const updated = updateGuardConfig({ [key]: value });
    setConfig(updated);
  }, []);

  const readiness = useMemo(() => getReadinessLabel(live.tradingReadiness), [live.tradingReadiness]);

  if (!isOpen) return null;

  // ── Stress Gauge Helper ──
  const renderStressGauge = (level: number) => {
    const getZoneColor = (val: number) => {
      if (val <= 30) return 'bg-green-500';
      if (val <= 60) return 'bg-amber-500';
      if (val <= 80) return 'bg-orange-500';
      return 'bg-red-500';
    };
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">Stress Level</span>
          <span className="text-white font-bold text-sm">{level}%</span>
        </div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${getZoneColor(level)}`}
            style={{ width: `${level}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>Calm</span>
          <span>Moderate</span>
          <span>High</span>
          <span>Panic</span>
        </div>
      </div>
    );
  };

  // ── Tab: Live Monitor ──
  const renderMonitor = () => (
    <div className="space-y-5">
      {/* Heart Rate Big Display */}
      <div className="bg-slate-800/60 rounded-xl p-6 border border-slate-700/40 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="relative">
            <HeartPulse size={36} className="text-rose-400 animate-pulse" />
            <div className="absolute inset-0 animate-ping opacity-30">
              <HeartPulse size={36} className="text-rose-400" />
            </div>
          </div>
          <span className="text-white font-bold text-5xl tabular-nums">{live.heartRate}</span>
          <span className="text-slate-400 text-lg self-end mb-1">bpm</span>
        </div>
        <p className="text-slate-400 text-xs">Real-time heart rate via {config.wearableType}</p>
      </div>

      {/* 3-col: HRV, Skin Temp, Emotional State */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40 text-center">
          <Activity size={18} className="text-blue-400 mx-auto mb-2" />
          <p className="text-white font-bold text-xl">{live.hrv}</p>
          <p className="text-slate-400 text-[10px] uppercase tracking-wide">HRV (ms)</p>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40 text-center">
          <Thermometer size={18} className="text-orange-400 mx-auto mb-2" />
          <p className="text-white font-bold text-xl">{live.skinTemp.toFixed(1)}</p>
          <p className="text-slate-400 text-[10px] uppercase tracking-wide">Skin Temp</p>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40 text-center">
          <Brain size={18} className={`${getEmotionalStateColor(live.emotionalState)} mx-auto mb-2`} />
          <p className={`font-bold text-sm ${getEmotionalStateColor(live.emotionalState)}`}>
            {EMOTION_LABELS[live.emotionalState]}
          </p>
          <p className="text-slate-400 text-[10px] uppercase tracking-wide">Emotion</p>
        </div>
      </div>

      {/* Stress Gauge */}
      <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40">
        {renderStressGauge(live.stressLevel)}
      </div>

      {/* Trading Readiness */}
      <div className={`rounded-xl p-4 border ${readiness.bg} border-slate-700/40`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-300 text-xs font-medium uppercase tracking-wide mb-1">Trading Readiness</p>
            <p className={`font-bold text-lg ${readiness.color}`}>{readiness.label}</p>
          </div>
          <div className="text-right">
            <p className={`font-bold text-3xl tabular-nums ${readiness.color}`}>{live.tradingReadiness}</p>
            <p className="text-slate-400 text-xs">/100</p>
          </div>
        </div>
      </div>

      {/* Coaching Message */}
      {live.coachingMessage && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Brain size={18} className="text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-rose-300 text-xs font-semibold uppercase tracking-wide mb-1">AI Coaching</p>
              <p className="text-slate-200 text-sm leading-relaxed">{live.coachingMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── Tab: Session History ──
  const renderSessions = () => (
    <div className="space-y-3">
      {sessions.map((session: TradingSession) => (
        <div
          key={session.id}
          className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40 hover:border-slate-600/60 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white font-semibold text-sm">{formatDate(session.startTime)}</p>
              <p className="text-slate-400 text-xs">
                {formatTimestamp(session.startTime)} - {formatTimestamp(session.endTime)} ({formatDuration(session.startTime, session.endTime)})
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getEmotionalStateBg(session.emotionalState)} ${getEmotionalStateColor(session.emotionalState)}`}
            >
              {EMOTION_LABELS[session.emotionalState]}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <p className="text-white font-bold text-sm">{session.avgHeartRate}</p>
              <p className="text-slate-500 text-[10px]">Avg HR</p>
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-sm">{session.avgStress}%</p>
              <p className="text-slate-500 text-[10px]">Avg Stress</p>
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-sm">{session.tradesAttempted}</p>
              <p className="text-slate-500 text-[10px]">Attempted</p>
            </div>
            <div className="text-center">
              <p className={`font-bold text-sm ${session.tradesBlocked > 0 ? 'text-rose-400' : 'text-green-400'}`}>
                {session.tradesBlocked}
              </p>
              <p className="text-slate-500 text-[10px]">Blocked</p>
            </div>
          </div>

          {session.cooldownsTriggered > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-700/40 flex items-center gap-2">
              <Timer size={12} className="text-amber-400" />
              <span className="text-amber-400 text-xs">
                {session.cooldownsTriggered} cooldown{session.cooldownsTriggered > 1 ? 's' : ''} triggered
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // ── Tab: Cooldown Log ──
  const renderCooldowns = () => (
    <div className="space-y-3">
      {/* Summary Banner */}
      <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-rose-300 text-xs font-semibold uppercase tracking-wide">Total Money Protected</p>
          <p className="text-white font-bold text-2xl">${stats.moneyProtected.toLocaleString()}</p>
        </div>
        <Shield size={28} className="text-rose-400" />
      </div>

      {/* Timeline */}
      {cooldowns.map((event: CooldownEvent) => {
        const savedMoney = event.outcomeIfExecuted < 0;
        const amount = Math.abs(event.outcomeIfExecuted);
        return (
          <div
            key={event.id}
            className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40 relative"
          >
            {/* Timeline dot */}
            <div className="absolute -left-0 top-5 w-2 h-2 rounded-full bg-rose-400 -translate-x-1/2 hidden sm:block" />

            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-white font-semibold text-sm">{formatDate(event.triggeredAt)}</p>
                <p className="text-slate-400 text-xs">{formatTimestamp(event.triggeredAt)}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <HeartPulse size={12} className="text-rose-400" />
                <span className="text-rose-400 text-xs font-mono">{event.heartRateAtTrigger} bpm</span>
                <span className="text-slate-600 mx-1">|</span>
                <AlertTriangle size={12} className="text-amber-400" />
                <span className="text-amber-400 text-xs font-mono">{event.stressAtTrigger}%</span>
              </div>
            </div>

            {/* Reason */}
            <p className="text-slate-300 text-xs leading-relaxed mb-3">{event.reason}</p>

            {/* Blocked Trade */}
            <div className="bg-slate-700/40 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      event.tradeBlocked.action === 'sell'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}
                  >
                    {event.tradeBlocked.action}
                  </span>
                  <span className="text-white text-xs font-medium truncate max-w-[200px]">
                    {event.tradeBlocked.cardName}
                  </span>
                </div>
                <span className="text-slate-300 text-xs font-mono">${event.tradeBlocked.value.toLocaleString()}</span>
              </div>
            </div>

            {/* Outcome */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {savedMoney ? (
                  <>
                    <CheckCircle size={14} className="text-green-400" />
                    <span className="text-green-400 text-xs font-medium">
                      Saved you ${amount.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle size={14} className="text-amber-400" />
                    <span className="text-amber-400 text-xs font-medium">
                      Missed +${amount.toLocaleString()} gain
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Timer size={12} className="text-slate-400" />
                <span className="text-slate-400 text-xs">{event.cooldownDuration}m cooldown</span>
                {event.userOverride && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-medium">
                    Overridden
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── Tab: Settings ──
  const renderSettings = () => (
    <div className="space-y-5">
      {/* Wearable Connection */}
      <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white font-semibold text-sm">Wearable Device</h4>
          <div className="flex items-center gap-2">
            <Bluetooth size={14} className={config.wearableConnected ? 'text-blue-400' : 'text-slate-500'} />
            <span className={`text-xs font-medium ${config.wearableConnected ? 'text-green-400' : 'text-slate-500'}`}>
              {config.wearableConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        {config.wearableConnected && (
          <div className="flex items-center gap-3 bg-slate-700/40 rounded-lg p-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Activity size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">{config.wearableType}</p>
              <p className="text-slate-400 text-xs">Last synced: Just now</p>
            </div>
            <RefreshCw size={14} className="text-slate-400 ml-auto cursor-pointer hover:text-white transition-colors" />
          </div>
        )}
      </div>

      {/* Heart Rate Threshold */}
      <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-white font-semibold text-sm">Heart Rate Threshold</h4>
            <p className="text-slate-400 text-xs">Block trades when HR exceeds this value</p>
          </div>
          <span className="text-rose-400 font-bold text-lg font-mono">{config.heartRateThreshold} bpm</span>
        </div>
        <input
          type="range"
          min={70}
          max={130}
          value={config.heartRateThreshold}
          onChange={(e) => handleConfigChange('heartRateThreshold', parseInt(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-rose-500"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>70 bpm</span>
          <span>100 bpm</span>
          <span>130 bpm</span>
        </div>
      </div>

      {/* Stress Threshold */}
      <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-white font-semibold text-sm">Stress Threshold</h4>
            <p className="text-slate-400 text-xs">Block trades when stress exceeds this level</p>
          </div>
          <span className="text-amber-400 font-bold text-lg font-mono">{config.stressThreshold}%</span>
        </div>
        <input
          type="range"
          min={20}
          max={100}
          value={config.stressThreshold}
          onChange={(e) => handleConfigChange('stressThreshold', parseInt(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-amber-500"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>20%</span>
          <span>60%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Cooldown Duration */}
      <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-white font-semibold text-sm">Cooldown Duration</h4>
            <p className="text-slate-400 text-xs">How long to pause trading after a trigger</p>
          </div>
          <span className="text-blue-400 font-bold text-lg font-mono">{config.cooldownMinutes}m</span>
        </div>
        <input
          type="range"
          min={5}
          max={30}
          step={5}
          value={config.cooldownMinutes}
          onChange={(e) => handleConfigChange('cooldownMinutes', parseInt(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>5 min</span>
          <span>15 min</span>
          <span>30 min</span>
        </div>
      </div>

      {/* Toggles */}
      <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40 space-y-4">
        {/* Auto-Block Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-semibold text-sm">Auto-Block Trades</h4>
            <p className="text-slate-400 text-xs">Automatically block trades during elevated states</p>
          </div>
          <button
            onClick={() => handleConfigChange('enableAutoBlock', !config.enableAutoBlock)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              config.enableAutoBlock ? 'bg-rose-500' : 'bg-slate-600'
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                config.enableAutoBlock ? 'translate-x-[22px]' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        <div className="border-t border-slate-700/40" />

        {/* Coaching Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-semibold text-sm">AI Coaching Messages</h4>
            <p className="text-slate-400 text-xs">Show behavioral finance coaching during triggers</p>
          </div>
          <button
            onClick={() => handleConfigChange('enableCoaching', !config.enableCoaching)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              config.enableCoaching ? 'bg-rose-500' : 'bg-slate-600'
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                config.enableCoaching ? 'translate-x-[22px]' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-slate-900 rounded-2xl border border-slate-700/60 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-rose-500/10 to-slate-900 px-6 py-5 border-b border-slate-700/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                <HeartPulse size={22} className="text-rose-400" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Biometric Trading Guard</h2>
                <p className="text-slate-400 text-xs">Wearable-powered emotional trading protection</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-rose-500/20 text-rose-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'monitor' && renderMonitor()}
          {activeTab === 'sessions' && renderSessions()}
          {activeTab === 'cooldowns' && renderCooldowns()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </div>
    </div>
  );
};

export default BiometricTradingGuardModal;
