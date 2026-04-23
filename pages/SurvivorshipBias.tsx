// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  BarChart3,
  Activity,
  Target,
  Zap,
  ChevronRight,
} from 'lucide-react';
import {
  getSurvivorshipAnalyses,
  getBiasAlerts,
  getSurvivorshipStats,
  getOutcomeColor,
  getOutcomeLabel,
  getBiasGapSeverity,
  type SurvivorshipAnalysis,
} from '../lib/utils/survivorshipBiasService';

const SurvivorshipBias: React.FC = () => {
  const analyses = useMemo(() => getSurvivorshipAnalyses(), []);
  const alerts = useMemo(() => getBiasAlerts(), []);
  const stats = useMemo(() => getSurvivorshipStats(), []);
  const [selectedSet, setSelectedSet] = useState<SurvivorshipAnalysis | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <EyeOff size={22} className="text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Survivorship Bias Corrector</h1>
              <p className="text-slate-400 text-sm">
                See the FULL distribution — including the cards that crashed, delisted, or disappeared
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={16} className="text-amber-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Sets Analyzed</span>
            </div>
            <p className="text-white font-bold text-3xl">{stats.setsAnalyzed}</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-red-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Avg Bias Gap</span>
            </div>
            <p className="text-red-400 font-bold text-3xl">{stats.avgBiasGap}%</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <EyeOff size={16} className="text-slate-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Hidden Cards</span>
            </div>
            <p className="text-white font-bold text-3xl">{stats.totalHiddenCards.toLocaleString()}</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} className="text-green-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Corrected</span>
            </div>
            <p className="text-white font-bold text-3xl">{stats.correctedValuations}</p>
          </div>
        </div>

        {/* Bias Alerts */}
        {alerts.length > 0 && (
          <div className="bg-slate-900 rounded-xl border border-amber-500/30 p-5">
            <h3 className="text-amber-400 font-semibold text-sm mb-3 flex items-center gap-2">
              <AlertTriangle size={16} />
              Active Overvaluation Alerts
            </h3>
            <div className="space-y-3">
              {alerts.map(alert => {
                const severity = getBiasGapSeverity(alert.overvaluationRisk);
                return (
                  <div key={alert.id} className="bg-slate-800/50 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-sm">{alert.cardName}</h4>
                      <p className="text-slate-400 text-xs mt-0.5">{alert.message}</p>
                      <div className="flex gap-4 mt-2 text-xs">
                        <span className="text-slate-400">
                          Visible comps: <span className="text-white">{alert.visibleComps}</span>
                        </span>
                        <span className="text-slate-400">
                          Hidden comps: <span className="text-red-400">{alert.hiddenComps}</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase">Visible Median</p>
                          <p className="text-white font-bold">${alert.visibleMedian.toLocaleString()}</p>
                        </div>
                        <ChevronRight size={16} className="text-slate-600" />
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase">True Median</p>
                          <p className="text-amber-400 font-bold">${alert.trueMedian.toLocaleString()}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold ${severity.color}`}>
                        {alert.overvaluationRisk}% overvaluation risk
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Set Analysis Cards */}
        <div className="space-y-4">
          {analyses.map(set => {
            const isSelected = selectedSet?.id === set.id;
            const biasGap = getBiasGapSeverity(set.biasGap);
            return (
              <div
                key={set.id}
                onClick={() => setSelectedSet(isSelected ? null : set)}
                className={`bg-slate-900 rounded-xl border cursor-pointer transition-all hover:border-amber-500/50 ${
                  isSelected ? 'border-amber-500/70 ring-1 ring-amber-500/30' : 'border-slate-800'
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-white font-semibold text-lg">{set.setName}</h3>
                      <p className="text-slate-500 text-xs">{set.year} • {set.totalCardsInSet} total cards</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${biasGap.bg} ${biasGap.color}`}>
                        {set.biasGap}% bias gap
                      </span>
                    </div>
                  </div>

                  {/* Outcome Distribution */}
                  <div className="mb-4">
                    <p className="text-slate-500 text-[10px] uppercase mb-2">Outcome Distribution</p>
                    <div className="h-6 rounded-full overflow-hidden flex">
                      {set.outcomeDistribution.map((o, i) => (
                        <div
                          key={i}
                          className={`${getOutcomeColor(o.outcome)} relative group`}
                          style={{ width: `${o.percentage}%` }}
                          title={`${getOutcomeLabel(o.outcome)}: ${o.count} cards (${o.percentage}%)`}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-700 rounded px-2 py-0.5 text-[9px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            {getOutcomeLabel(o.outcome)}: {o.count} ({o.percentage}%)
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3 mt-2 flex-wrap">
                      {set.outcomeDistribution.map((o, i) => (
                        <span key={i} className="flex items-center gap-1 text-[10px] text-slate-400">
                          <div className={`w-2 h-2 rounded-full ${getOutcomeColor(o.outcome)}`} />
                          {getOutcomeLabel(o.outcome)} ({o.percentage}%)
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase">Survival Rate</p>
                      <p className="text-white font-bold">{set.survivalRate}%</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase">Visible Median</p>
                      <p className="text-green-400 font-bold">{set.medianReturn > 0 ? '+' : ''}{set.medianReturn}%</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase">True Median</p>
                      <p className="text-amber-400 font-bold">{set.adjustedMedianReturn > 0 ? '+' : ''}{set.adjustedMedianReturn}%</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase">Still Tracked</p>
                      <p className="text-white font-bold">{set.cardsStillTracked}/{set.totalCardsInSet}</p>
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="border-t border-slate-800 p-5 bg-slate-900/70">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-green-400 font-semibold text-xs uppercase tracking-wide mb-3">
                          <TrendingUp size={14} className="inline mr-1" />
                          Top Survivors
                        </h4>
                        <div className="space-y-2">
                          {set.topSurvivors.map((s, i) => (
                            <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2">
                              <span className="text-white text-sm">{s.name}</span>
                              <span className="text-green-400 text-sm font-bold">+{s.return}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-red-400 font-semibold text-xs uppercase tracking-wide mb-3">
                          <TrendingDown size={14} className="inline mr-1" />
                          Notable Casualties (Hidden from Comps)
                        </h4>
                        <div className="space-y-2">
                          {set.notableCasualties.map((c, i) => (
                            <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2">
                              <div>
                                <span className="text-white text-sm">{c.name}</span>
                                <span className="text-slate-500 text-xs ml-2">Peak: ${c.peakValue.toLocaleString()}</span>
                              </div>
                              <span className="text-red-400 text-sm font-bold">-{c.decline}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SurvivorshipBias;
