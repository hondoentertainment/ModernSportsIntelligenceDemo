import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Thermometer,
  Brain,
  AlertTriangle,
  Shield,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Clock,
  Zap,
  Eye,
  ChevronRight,
} from 'lucide-react';
import {
  getCurrentReading,
  getEmotionalProfile,
  getCooldownRecommendation,
  detectBiases,
  getBehavioralPatterns,
  getEmotionalHistory,
  getTemperatureColor,
  getStateColor,
  STATE_LABELS,
  type ThermometerReading,
  type EmotionalProfile,
  type CooldownRecommendation,
  type BiasDetection,
  type TradingBehavior,
  type EmotionalHistory,
} from '../lib/utils/emotionalThermometerService';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

interface EmotionalThermometerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TrendIcon: React.FC<{ trend: 'rising' | 'falling' | 'stable' }> = ({ trend }) => {
  if (trend === 'rising') return <TrendingUp size={14} className="text-red-400" />;
  if (trend === 'falling') return <TrendingDown size={14} className="text-green-400" />;
  return <Minus size={14} className="text-slate-400" />;
};

const EmotionalThermometerModal: React.FC<EmotionalThermometerModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [reading, setReading] = useState<ThermometerReading | null>(null);
  const [profile, setProfile] = useState<EmotionalProfile | null>(null);
  const [cooldown, setCooldown] = useState<CooldownRecommendation | null>(null);
  const [biases, setBiases] = useState<BiasDetection[]>([]);
  const [behaviors, setBehaviors] = useState<TradingBehavior[]>([]);
  const [history, setHistory] = useState<EmotionalHistory[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    try {
      setReading(getCurrentReading());
      setProfile(getEmotionalProfile());
      setCooldown(getCooldownRecommendation());
      setBiases(detectBiases());
      setBehaviors(getBehavioralPatterns());
      setHistory(getEmotionalHistory(7));
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, [isOpen]);

  const chartData = useMemo(() =>
    history.map(h => ({
      date: h.date.slice(5),
      temp: h.avgTemperature,
      quality: h.tradeQuality,
    })),
    [history]
  );

  const topBiases = useMemo(() => biases.slice(0, 3), [biases]);
  const riskyBehaviors = useMemo(() => behaviors.filter(b => b.severity === 'high' || b.severity === 'critical'), [behaviors]);

  if (!isOpen) return null;

  const behaviorLabel: Record<string, string> = {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-700 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Thermometer size={20} className="text-orange-400" />
            <h2 className="text-lg font-semibold">Emotional Thermometer</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400" />
          </div>
        ) : reading && profile && cooldown ? (
          <div className="p-4 space-y-5">
            {/* Current Reading */}
            <div className="flex items-center gap-6">
              {/* Mini visual */}
              <div className="flex flex-col items-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all"
                  style={{
                    borderColor: getTemperatureColor(reading.temperature),
                    boxShadow: `0 0 20px ${getTemperatureColor(reading.temperature)}33`,
                  }}
                >
                  <span className="text-2xl font-bold" style={{ color: getTemperatureColor(reading.temperature) }}>
                    {reading.temperature}°
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <div className="text-lg font-semibold" style={{ color: getTemperatureColor(reading.temperature) }}>
                  {STATE_LABELS[reading.state]}
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <TrendIcon trend={reading.trend} />
                    {reading.trend}
                  </span>
                  <span>Quality: {reading.tradingQuality}/100</span>
                  <span>Risk: {reading.riskMultiplier}x</span>
                </div>
                {reading.temperature >= 65 && (
                  <div className="mt-2 px-3 py-1.5 bg-orange-900/20 border border-orange-500/30 rounded-lg text-sm text-orange-300 flex items-center gap-2">
                    <AlertTriangle size={14} />
                    High emotional state - consider pausing trades
                  </div>
                )}
              </div>
            </div>

            {/* 7-day chart */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                <Activity size={14} className="text-blue-400" />
                7-Day Temperature
              </h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="modalTempGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: '#cbd5e1' }}
                    />
                    <ReferenceLine y={65} stroke="#ef4444" strokeDasharray="3 3" />
                    <Area type="monotone" dataKey="temp" stroke="#f97316" fill="url(#modalTempGrad)" strokeWidth={2} name="Temperature" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Profile quick stats */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Avg Temp', value: `${profile.averageTemperature}°`, color: getTemperatureColor(profile.averageTemperature) },
                { label: 'Resilience', value: `${profile.resilience}%`, color: profile.resilience > 50 ? '#22c55e' : '#ef4444' },
                { label: 'Awareness', value: `${profile.selfAwareness}%`, color: '#a855f7' },
                { label: 'Calm Streak', value: `${profile.streakDaysCalm}d`, color: '#3b82f6' },
              ].map((s, i) => (
                <div key={i} className="text-center p-2 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="text-xs text-slate-500">{s.label}</div>
                  <div className="text-lg font-bold" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Cooldown Recommendation */}
            {cooldown.shouldCoolDown && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-blue-400" />
                  <span className="font-medium text-blue-300">Cooldown Recommended: {cooldown.minutes} min</span>
                </div>
                <p className="text-sm text-blue-400/80">{cooldown.reason}</p>
              </div>
            )}

            {/* Top Biases */}
            {topBiases.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <Eye size={14} className="text-purple-400" />
                  Top Active Biases
                </h3>
                <div className="space-y-2">
                  {topBiases.map(b => (
                    <div key={b.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          b.severity === 'critical' ? 'bg-red-500' : b.severity === 'high' ? 'bg-orange-500' : b.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`} />
                        <span className="text-sm font-medium">{biasLabel[b.biasType]}</span>
                      </div>
                      <span className="text-xs text-red-400">-${b.financialCost.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risky Behaviors */}
            {riskyBehaviors.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <Zap size={14} className="text-yellow-400" />
                  Risky Behaviors Detected
                </h3>
                <div className="space-y-2">
                  {riskyBehaviors.map((b, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
                      <div>
                        <span className="text-sm font-medium">{behaviorLabel[b.type]}</span>
                        <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                          b.severity === 'critical' ? 'bg-red-500/10 text-red-400' : 'bg-orange-500/10 text-orange-400'
                        }`}>{b.severity}</span>
                      </div>
                      <span className="text-xs text-red-400">{b.financialImpact >= 0 ? '+' : ''}${b.financialImpact.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personality */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Brain size={14} className="text-purple-400" />
                <span className="text-sm font-medium text-slate-300">Your Trading Personality</span>
              </div>
              <div className="text-purple-300 font-medium">{profile.personalityType}</div>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                <span>Best state: <span style={{ color: getStateColor(profile.bestTradingState) }}>{profile.bestTradingState}</span></span>
                <span>Worst state: <span style={{ color: getStateColor(profile.worstTradingState) }}>{profile.worstTradingState}</span></span>
                <span>{profile.totalTradesAnalyzed} trades analyzed</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400">Failed to load data</div>
        )}
      </div>
    </div>
  );
};

export default EmotionalThermometerModal;
