import React, { useState, useMemo } from 'react';
import {
  X,
  LineChart,
  Gauge,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  AlertTriangle,
  Shield,
  Clock,
  Zap,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers,
} from 'lucide-react';
import {
  getForecasts,
  getSubmissionVelocities,
  getScarcityImpacts,
  getTrends,
  getPopStats,
  type ConfidenceLevel,
  type ForecastDirection,
  type ScarcityTier,
} from '../lib/popForecasterService';

interface PopForecasterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'forecasts' | 'submission-velocity' | 'scarcity-impact' | 'trends';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'forecasts', label: 'Forecasts', icon: <LineChart size={16} /> },
  { id: 'submission-velocity', label: 'Submission Velocity', icon: <Activity size={16} /> },
  { id: 'scarcity-impact', label: 'Scarcity Impact', icon: <Layers size={16} /> },
  { id: 'trends', label: 'Trends', icon: <TrendingUp size={16} /> },
];

const confidenceConfig: Record<ConfidenceLevel, { label: string; color: string; bg: string; border: string }> = {
  high: { label: 'High', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  medium: { label: 'Medium', color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/30' },
  low: { label: 'Low', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
};

const scarcityConfig: Record<ScarcityTier, { label: string; color: string; bg: string; border: string }> = {
  'ultra-rare': { label: 'Ultra Rare', color: 'text-cyan-300', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  rare: { label: 'Rare', color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/30' },
  uncommon: { label: 'Uncommon', color: 'text-slate-300', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
  common: { label: 'Common', color: 'text-slate-500', bg: 'bg-slate-600/10', border: 'border-slate-600/30' },
};

const riskColors: Record<string, string> = {
  safe: 'text-green-400 bg-green-500/10 border-green-500/30',
  watch: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  danger: 'text-red-400 bg-red-500/10 border-red-500/30',
};

// ---- Tab: Forecasts ----

const ForecastsTab: React.FC = () => {
  const forecasts = useMemo(() => getForecasts(), []);

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-2 text-[10px] font-black text-brand-muted uppercase tracking-widest">Card</th>
              <th className="text-right py-3 px-2 text-[10px] font-black text-brand-muted uppercase tracking-widest">Current Pop</th>
              <th className="text-right py-3 px-2 text-[10px] font-black text-brand-muted uppercase tracking-widest">30d Pop</th>
              <th className="text-right py-3 px-2 text-[10px] font-black text-brand-muted uppercase tracking-widest">90d Pop</th>
              <th className="text-right py-3 px-2 text-[10px] font-black text-brand-muted uppercase tracking-widest">Value Now</th>
              <th className="text-right py-3 px-2 text-[10px] font-black text-brand-muted uppercase tracking-widest">Value 30d</th>
              <th className="text-right py-3 px-2 text-[10px] font-black text-brand-muted uppercase tracking-widest">Value 90d</th>
              <th className="text-center py-3 px-2 text-[10px] font-black text-brand-muted uppercase tracking-widest">Risk</th>
            </tr>
          </thead>
          <tbody>
            {forecasts.map(f => {
              const cCfg = confidenceConfig[f.confidence];
              const sCfg = scarcityConfig[f.scarcityTier];
              const val30Change = ((f.predictedValue30d - f.currentValue) / f.currentValue) * 100;
              const val90Change = ((f.predictedValue90d - f.currentValue) / f.currentValue) * 100;
              return (
                <tr key={f.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-sm text-white font-medium">{f.playerName}</p>
                        <p className="text-[10px] text-slate-500">{f.cardName} &bull; {f.grade}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-white">{f.currentPop.toLocaleString()}</td>
                  <td className="py-3 px-2 text-right font-mono text-slate-300">{f.predictedPop30d.toLocaleString()}</td>
                  <td className="py-3 px-2 text-right font-mono text-slate-300">{f.predictedPop90d.toLocaleString()}</td>
                  <td className="py-3 px-2 text-right font-mono text-white">
                    ${f.currentValue >= 1000000 ? `${(f.currentValue / 1000000).toFixed(1)}M` : f.currentValue >= 1000 ? `${(f.currentValue / 1000).toFixed(0)}K` : f.currentValue}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span className={`font-mono ${val30Change < 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {val30Change > 0 ? '+' : ''}{val30Change.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span className={`font-mono ${val90Change < 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {val90Change > 0 ? '+' : ''}{val90Change.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-8 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${f.dilutionRisk > 70 ? 'bg-red-500' : f.dilutionRisk > 40 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${f.dilutionRisk}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-400">{f.dilutionRisk}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {forecasts.filter(f => f.direction === 'up').slice(0, 2).map(f => (
          <div key={f.id} className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight size={14} className="text-green-400" />
              <p className="text-xs font-bold text-green-400">Appreciating</p>
            </div>
            <p className="text-sm text-white font-medium">{f.playerName}</p>
            <p className="text-[10px] text-slate-500">{f.cardName}</p>
            <p className="text-xs text-slate-400 mt-1">Pop nearly fixed at {f.currentPop}. Value projected to increase as scarcity premium solidifies.</p>
          </div>
        ))}
        {forecasts.filter(f => f.dilutionRisk > 80).slice(0, 2).map(f => (
          <div key={f.id} className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownRight size={14} className="text-red-400" />
              <p className="text-xs font-bold text-red-400">High Dilution Risk</p>
            </div>
            <p className="text-sm text-white font-medium">{f.playerName}</p>
            <p className="text-[10px] text-slate-500">{f.cardName}</p>
            <p className="text-xs text-slate-400 mt-1">Dilution risk at {f.dilutionRisk}%. Pop expected to grow {((f.predictedPop90d - f.currentPop) / f.currentPop * 100).toFixed(0)}% in 90 days.</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---- Tab: Submission Velocity ----

const SubmissionVelocityTab: React.FC = () => {
  const velocities = useMemo(() => getSubmissionVelocities(), []);
  const maxDaily = Math.max(...velocities.map(v => v.dailyRate));

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Submission Rate Tracker</p>
        <div className="space-y-2">
          {velocities.map(v => {
            const barWidth = (v.dailyRate / maxDaily) * 100;
            const trendColor = v.trend === 'accelerating' ? 'text-red-400' : v.trend === 'decelerating' ? 'text-green-400' : 'text-slate-400';
            const trendBg = v.trend === 'accelerating' ? 'bg-red-500/10 border-red-500/30' : v.trend === 'decelerating' ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-500/10 border-slate-500/30';
            return (
              <div key={v.id} className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:bg-slate-800/60 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm text-white font-medium">{v.playerName}</p>
                    <p className="text-[10px] text-slate-500">{v.cardName} &bull; {v.grade}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${trendColor} ${trendBg}`}>
                    {v.trend}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-3 mb-3">
                  <div className="text-center">
                    <p className="text-[9px] text-slate-500 uppercase">Daily</p>
                    <p className="text-sm font-bold text-white">{v.dailyRate}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-slate-500 uppercase">Weekly</p>
                    <p className="text-sm font-bold text-white">{v.weeklyRate}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-slate-500 uppercase">Monthly</p>
                    <p className="text-sm font-bold text-white">{v.monthlyRate}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-slate-500 uppercase">Queue</p>
                    <p className="text-sm font-bold text-white">{v.estimatedQueueDepth.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-slate-500 uppercase">Accel.</p>
                    <p className={`text-sm font-bold ${v.acceleration > 0 ? 'text-red-400' : v.acceleration < 0 ? 'text-green-400' : 'text-slate-400'}`}>
                      {v.acceleration > 0 ? '+' : ''}{v.acceleration}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${v.trend === 'accelerating' ? 'bg-cyan-500' : v.trend === 'decelerating' ? 'bg-teal-500' : 'bg-slate-500'}`} style={{ width: `${barWidth}%` }} />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Clock size={10} />
                    <span>Est. complete: {v.projectedCompletionDate}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ---- Tab: Scarcity Impact ----

const ScarcityImpactTab: React.FC = () => {
  const impacts = useMemo(() => getScarcityImpacts(), []);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Scarcity Premium Erosion Analysis</p>
        <div className="space-y-2">
          {impacts.map(imp => {
            const sCfg = scarcityConfig[imp.scarcityTier];
            const popProgress = imp.monthsToBreakEven ? Math.min(((imp.currentPop) / imp.breakEvenPop) * 100, 100) : (imp.currentPop / imp.breakEvenPop) * 100;
            return (
              <div key={imp.id} className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:bg-slate-800/60 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-white font-medium">{imp.playerName}</p>
                    <p className="text-[10px] text-slate-500">{imp.cardName} &bull; {imp.grade}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${sCfg.color} ${sCfg.bg} border ${sCfg.border}`}>
                      {sCfg.label}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${riskColors[imp.riskLevel]}`}>
                      {imp.riskLevel}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 mb-3">
                  <div className="p-2.5 bg-slate-800/50 rounded-lg text-center">
                    <p className="text-[9px] text-slate-500 uppercase">Current Pop</p>
                    <p className="text-sm font-bold text-white">{imp.currentPop.toLocaleString()}</p>
                  </div>
                  <div className="p-2.5 bg-slate-800/50 rounded-lg text-center">
                    <p className="text-[9px] text-slate-500 uppercase">Premium</p>
                    <p className="text-sm font-bold text-cyan-400">+{imp.premiumPercent}%</p>
                  </div>
                  <div className="p-2.5 bg-slate-800/50 rounded-lg text-center">
                    <p className="text-[9px] text-slate-500 uppercase">Erosion/10 Pop</p>
                    <p className={`text-sm font-bold ${imp.erosionRate > 5 ? 'text-red-400' : imp.erosionRate > 1 ? 'text-amber-400' : 'text-green-400'}`}>
                      -{imp.erosionRate}%
                    </p>
                  </div>
                  <div className="p-2.5 bg-slate-800/50 rounded-lg text-center">
                    <p className="text-[9px] text-slate-500 uppercase">Break-Even</p>
                    <p className="text-sm font-bold text-white">{imp.monthsToBreakEven ? `${imp.monthsToBreakEven}mo` : 'Never'}</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] text-slate-500 uppercase">Pop Progress to Break-Even ({imp.breakEvenPop.toLocaleString()})</span>
                    <span className="text-[10px] text-slate-400">{popProgress.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${imp.riskLevel === 'danger' ? 'bg-red-500' : imp.riskLevel === 'watch' ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${Math.min(popProgress, 100)}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ---- Tab: Trends ----

const TrendsTab: React.FC = () => {
  const trends = useMemo(() => getTrends(), []);

  const impactConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
    positive: { icon: <TrendingUp size={14} />, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
    negative: { icon: <TrendingDown size={14} />, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    neutral: { icon: <Minus size={14} />, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Market Trends Affecting Pop Reports</p>
        <div className="space-y-2">
          {trends.map(trend => {
            const iCfg = impactConfig[trend.impact];
            const cCfg = confidenceConfig[trend.confidence];
            return (
              <div key={trend.id} className={`p-5 ${iCfg.bg} border ${iCfg.border} rounded-xl`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={iCfg.color}>{iCfg.icon}</span>
                    <p className="text-sm text-white font-medium">{trend.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${cCfg.color} ${cCfg.bg} border ${cCfg.border}`}>
                      {cCfg.label} Conf.
                    </span>
                    <span className="text-xs text-slate-500">{trend.timeframe}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">{trend.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">Impact Magnitude:</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className={`w-3 h-2 rounded-sm ${i < trend.magnitude ? (trend.impact === 'negative' ? 'bg-red-500' : trend.impact === 'positive' ? 'bg-green-500' : 'bg-slate-500') : 'bg-slate-700'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{trend.magnitude}/10</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {trend.affectedCards.map(card => (
                    <span key={card} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-500/20">
                      {card}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ---- Main Modal ----

const PopForecasterModal: React.FC<PopForecasterModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('forecasts');
  const popStats = useMemo(() => getPopStats(), []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-700 bg-gradient-to-r from-cyan-500/10 to-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-cyan-500/20 rounded-2xl border border-cyan-500/30 text-cyan-400">
                <LineChart size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-bebas tracking-widest text-white leading-tight">
                  Pop <span className="text-cyan-400">Forecaster</span> Engine
                </h2>
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
                  Population report predictions &bull; {popStats.totalCardsTracked} cards tracked
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-slate-800 text-brand-muted hover:text-white rounded-xl transition-all">
              <X size={24} />
            </button>
          </div>
          <div className="flex items-center gap-4 mt-5 p-3 bg-slate-800/50 border border-slate-700 rounded-2xl">
            <div className="flex items-center gap-1.5 text-xs">
              <Gauge size={14} className="text-cyan-400" />
              <span className="text-slate-400">Avg Dilution:</span>
              <span className="font-bebas text-lg text-white tracking-wider">{popStats.avgDilutionRisk}%</span>
            </div>
            <div className="h-5 w-px bg-slate-700" />
            <div className="flex items-center gap-1.5 text-xs">
              <TrendingUp size={14} className="text-green-400" />
              <span className="text-slate-400">Up:</span>
              <span className="font-bebas text-lg text-green-400 tracking-wider">{popStats.trendingUp}</span>
            </div>
            <div className="h-5 w-px bg-slate-700" />
            <div className="flex items-center gap-1.5 text-xs">
              <TrendingDown size={14} className="text-red-400" />
              <span className="text-slate-400">Down:</span>
              <span className="font-bebas text-lg text-red-400 tracking-wider">{popStats.trendingDown}</span>
            </div>
            <div className="h-5 w-px bg-slate-700" />
            <div className="flex items-center gap-1.5 text-xs">
              <AlertTriangle size={14} className="text-amber-400" />
              <span className="text-slate-400">At Risk:</span>
              <span className="font-bebas text-lg text-amber-400 tracking-wider">{popStats.cardsAtRisk}</span>
            </div>
            <div className="ml-auto text-xs text-slate-400">
              High Conf.: <span className="text-white font-medium">{popStats.highConfidenceForecasts}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 px-8 pt-4 border-b border-slate-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'text-cyan-400 border-cyan-400'
                  : 'text-slate-500 border-transparent hover:text-white hover:border-slate-600'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-8">
          {activeTab === 'forecasts' && <ForecastsTab />}
          {activeTab === 'submission-velocity' && <SubmissionVelocityTab />}
          {activeTab === 'scarcity-impact' && <ScarcityImpactTab />}
          {activeTab === 'trends' && <TrendsTab />}
        </div>
      </div>
    </div>
  );
};

export default PopForecasterModal;
