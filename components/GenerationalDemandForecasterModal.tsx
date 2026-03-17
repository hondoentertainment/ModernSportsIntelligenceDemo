import React, { useState, useMemo } from 'react';
import {
  X,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Shield,
  Target,
} from 'lucide-react';
import {
  getForecasts,
  getDemographicShifts,
  getWealthTransfers,
  getCulturalCycles,
} from '../lib/generationalDemandForecasterService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const GenerationalDemandForecasterModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('forecasts');
  const [expandedForecast, setExpandedForecast] = useState<string | null>(null);

  const forecasts = useMemo(() => getForecasts(), []);
  const demographicShifts = useMemo(() => getDemographicShifts(), []);
  const wealthTransfers = useMemo(() => getWealthTransfers(), []);
  const culturalCycles = useMemo(() => getCulturalCycles(), []);

  if (!isOpen) return null;

  const getConfidenceColor = (band: string) => {
    if (band === 'high') return 'text-emerald-400';
    if (band === 'medium') return 'text-amber-400';
    return 'text-red-400';
  };

  const getConfidenceBg = (band: string) => {
    if (band === 'high') return 'bg-emerald-500/15 border-emerald-500/30';
    if (band === 'medium') return 'bg-amber-500/15 border-amber-500/30';
    return 'bg-red-500/15 border-red-500/30';
  };

  const getDirectionIcon = (direction: string) => {
    if (direction === 'bullish') return <ArrowUpRight size={14} className="text-emerald-400" />;
    if (direction === 'bearish') return <ArrowDownRight size={14} className="text-red-400" />;
    return <Minus size={14} className="text-amber-400" />;
  };

  const getDirectionColor = (direction: string) => {
    if (direction === 'bullish') return 'text-emerald-400';
    if (direction === 'bearish') return 'text-red-400';
    return 'text-amber-400';
  };

  const getPhaseColor = (phase: string) => {
    const map: Record<string, string> = {
      emergence: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
      growth: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
      peak: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
      decline: 'text-red-400 bg-red-500/15 border-red-500/30',
      dormant: 'text-slate-400 bg-slate-500/15 border-slate-500/30',
      revival: 'text-teal-400 bg-teal-500/15 border-teal-500/30',
    };
    return map[phase] || 'text-slate-400 bg-slate-500/15 border-slate-500/30';
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  const tabs = [
    { id: 'forecasts', label: 'Forecasts', icon: <TrendingUp size={16} /> },
    { id: 'demographics', label: 'Demographic Shifts', icon: <Users size={16} /> },
    { id: 'wealth', label: 'Wealth Transfers', icon: <DollarSign size={16} /> },
    { id: 'cycles', label: 'Cultural Cycles', icon: <RefreshCw size={16} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500/10 to-slate-900 px-6 py-5 border-b border-slate-700/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                <Clock size={22} className="text-rose-400" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Generational Demand Forecaster</h2>
                <p className="text-slate-400 text-xs">10-25 year demographic-driven demand projection modeling</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tab Bar */}
          <div className="flex gap-1 mt-4">
            {tabs.map((tab) => (
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
          {/* Forecasts Tab */}
          {activeTab === 'forecasts' && (
            <div className="space-y-5">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40 text-center">
                  <p className="text-white font-bold text-2xl">{forecasts.length}</p>
                  <p className="text-slate-400 text-[10px] uppercase tracking-wide">Active Forecasts</p>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40 text-center">
                  <p className="text-rose-400 font-bold text-2xl">{demographicShifts.length}</p>
                  <p className="text-slate-400 text-[10px] uppercase tracking-wide">Demographic Shifts</p>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40 text-center">
                  <p className="text-amber-400 font-bold text-2xl">{culturalCycles.length}</p>
                  <p className="text-slate-400 text-[10px] uppercase tracking-wide">Cultural Cycles</p>
                </div>
              </div>

              {/* Forecast Cards */}
              {forecasts.map((forecast) => (
                <div
                  key={forecast.id}
                  className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/40 hover:border-slate-600/60 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-white font-semibold text-sm">{forecast.player}</h3>
                      <p className="text-slate-500 text-xs">{forecast.cardType}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getConfidenceBg(forecast.confidenceBand)} ${getConfidenceColor(forecast.confidenceBand)}`}>
                        {forecast.confidenceBand} confidence
                      </span>
                      <span className="text-white font-bold text-sm">{formatCurrency(forecast.currentValue)}</span>
                    </div>
                  </div>

                  {/* Projections Timeline */}
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {forecast.projections.map((proj) => {
                      const change = ((proj.projectedValue - forecast.currentValue) / forecast.currentValue * 100).toFixed(0);
                      const isUp = proj.projectedValue >= forecast.currentValue;
                      return (
                        <div key={proj.year} className="text-center p-2 bg-slate-700/30 rounded-lg">
                          <p className="text-slate-500 text-[10px] font-bold">{proj.year}</p>
                          <p className="text-white font-bold text-sm">{formatCurrency(proj.projectedValue)}</p>
                          <p className={`text-[10px] font-semibold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isUp ? '+' : ''}{change}%
                          </p>
                          <div className="mt-1">
                            <p className="text-slate-600 text-[8px]">{formatCurrency(proj.lowBound)} - {formatCurrency(proj.highBound)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Drivers & Risks */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <h4 className="text-emerald-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">Primary Drivers</h4>
                      {forecast.primaryDrivers.map((d, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-300 mb-1">
                          <TrendingUp size={10} className="text-emerald-400 mt-0.5 shrink-0" />
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h4 className="text-red-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">Risk Factors</h4>
                      {forecast.riskFactors.map((r, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-300 mb-1">
                          <AlertTriangle size={10} className="text-red-400 mt-0.5 shrink-0" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expand for narrative */}
                  <button
                    onClick={() => setExpandedForecast(expandedForecast === forecast.id ? null : forecast.id)}
                    className="flex items-center gap-1 text-rose-400 text-xs font-medium hover:text-rose-300 transition-colors"
                  >
                    <BarChart3 size={14} />
                    {expandedForecast === forecast.id ? 'Hide Analysis' : 'Full Analysis'}
                    <ChevronRight size={12} className={`transition-transform ${expandedForecast === forecast.id ? 'rotate-90' : ''}`} />
                  </button>

                  {expandedForecast === forecast.id && (
                    <div className="mt-4 pt-4 border-t border-slate-700/40 space-y-3">
                      <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4">
                        <p className="text-slate-200 text-xs leading-relaxed">{forecast.narrative}</p>
                      </div>

                      {/* Demand Driver Breakdown by Year */}
                      <h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-wide">Cohort Influence Over Time</h4>
                      {forecast.projections.map((proj) => (
                        <div key={proj.year} className="bg-slate-700/30 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white text-xs font-semibold">{proj.year}</span>
                            <span className="text-slate-400 text-[10px]">{proj.keyEvent}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {proj.demandDrivers.map((driver) => (
                              <span
                                key={driver.cohort}
                                className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                                  driver.influence > 0
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}
                              >
                                {driver.cohort}: {driver.influence > 0 ? '+' : ''}{driver.influence}%
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Demographic Shifts Tab */}
          {activeTab === 'demographics' && (
            <div className="space-y-5">
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-rose-300 text-xs font-semibold uppercase tracking-wide">Macro Demographic Forces</p>
                  <p className="text-white font-bold text-2xl">{demographicShifts.length} Active Shifts</p>
                </div>
                <Users size={28} className="text-rose-400" />
              </div>

              {demographicShifts.map((shift) => (
                <div
                  key={shift.id}
                  className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/40 hover:border-slate-600/60 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getDirectionIcon(shift.direction)}
                      <h3 className="text-white font-semibold text-sm">{shift.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${
                        shift.direction === 'bullish' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : shift.direction === 'bearish' ? 'bg-red-500/15 text-red-400 border-red-500/30'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      }`}>
                        {shift.direction}
                      </span>
                      <span className="text-slate-500 text-xs">{shift.timeframe}</span>
                    </div>
                  </div>

                  <p className="text-slate-300 text-xs leading-relaxed mb-4">{shift.description}</p>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-slate-400 text-[10px] uppercase tracking-wide">Magnitude</span>
                        <span className="text-white font-bold text-sm">{shift.magnitude}/100</span>
                      </div>
                      <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${shift.magnitude >= 80 ? 'bg-rose-500' : shift.magnitude >= 60 ? 'bg-amber-500' : 'bg-blue-500'}`}
                          style={{ width: `${shift.magnitude}%` }}
                        />
                      </div>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-slate-400 text-[10px] uppercase tracking-wide">Probability</span>
                        <span className="text-white font-bold text-sm">{shift.probability}%</span>
                      </div>
                      <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${shift.probability >= 90 ? 'bg-emerald-500' : shift.probability >= 75 ? 'bg-teal-500' : 'bg-amber-500'}`}
                          style={{ width: `${shift.probability}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {shift.affectedCategories.map((cat) => (
                      <span key={cat} className="px-2 py-0.5 rounded bg-slate-700/50 text-slate-400 text-[10px] font-medium border border-slate-600/30">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Wealth Transfers Tab */}
          {activeTab === 'wealth' && (
            <div className="space-y-5">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-amber-300 text-xs font-semibold uppercase tracking-wide">Intergenerational Wealth Flow</p>
                  <p className="text-white font-bold text-2xl">
                    {formatCurrency(wealthTransfers.reduce((sum, w) => sum + w.estimatedValue, 0))} in Motion
                  </p>
                </div>
                <DollarSign size={28} className="text-amber-400" />
              </div>

              {wealthTransfers.map((transfer) => (
                <div
                  key={transfer.id}
                  className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/40 hover:border-slate-600/60 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold text-sm">{transfer.name}</h3>
                    <span className="text-amber-400 font-bold text-lg">{formatCurrency(transfer.estimatedValue)}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                      <p className="text-rose-400 font-bold text-sm">{transfer.peakYear}</p>
                      <p className="text-slate-500 text-[10px]">Peak Year</p>
                    </div>
                    <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                      <p className="text-slate-300 font-bold text-[11px]">{transfer.sourceGeneration}</p>
                      <p className="text-slate-500 text-[10px]">From</p>
                    </div>
                    <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                      <p className="text-slate-300 font-bold text-[11px]">{transfer.beneficiaryGeneration}</p>
                      <p className="text-slate-500 text-[10px]">To</p>
                    </div>
                    <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                      <p className="text-amber-400 font-bold text-sm">{transfer.collectibleAllocation}%</p>
                      <p className="text-slate-500 text-[10px]">To Cards</p>
                    </div>
                  </div>

                  {/* Flow Visualization */}
                  <div className="bg-slate-700/30 rounded-lg p-3 flex items-center gap-3 mb-3">
                    <div className="flex-1 text-center">
                      <p className="text-slate-400 text-[10px] uppercase">Source</p>
                      <p className="text-white text-xs font-semibold">{transfer.sourceGeneration}</p>
                    </div>
                    <ChevronRight size={16} className="text-amber-400" />
                    <div className="flex-1 text-center px-3 py-1 rounded bg-amber-500/10 border border-amber-500/20">
                      <p className="text-amber-400 text-[10px] uppercase">Allocation</p>
                      <p className="text-amber-400 text-xs font-bold">{formatCurrency(transfer.estimatedValue * transfer.collectibleAllocation / 100)}</p>
                    </div>
                    <ChevronRight size={16} className="text-amber-400" />
                    <div className="flex-1 text-center">
                      <p className="text-slate-400 text-[10px] uppercase">Beneficiary</p>
                      <p className="text-white text-xs font-semibold">{transfer.beneficiaryGeneration}</p>
                    </div>
                  </div>

                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Target size={12} className="text-rose-400 mt-0.5 shrink-0" />
                      <p className="text-slate-300 text-[11px] leading-relaxed">{transfer.impactOnCards}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Cultural Cycles Tab */}
          {activeTab === 'cycles' && (
            <div className="space-y-5">
              <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-teal-300 text-xs font-semibold uppercase tracking-wide">Nostalgia & Cultural Cycles</p>
                  <p className="text-white font-bold text-2xl">{culturalCycles.length} Active Cycles</p>
                </div>
                <RefreshCw size={28} className="text-teal-400" />
              </div>

              {culturalCycles.map((cycle) => (
                <div
                  key={cycle.id}
                  className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/40 hover:border-slate-600/60 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold text-sm">{cycle.cycleName}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${getPhaseColor(cycle.currentPhase)}`}>
                      {cycle.currentPhase}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                      <p className="text-white font-bold text-sm">{cycle.periodYears}yr</p>
                      <p className="text-slate-500 text-[10px]">Cycle Length</p>
                    </div>
                    <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                      <p className="text-rose-400 font-bold text-sm">{cycle.nextPeakEstimate}</p>
                      <p className="text-slate-500 text-[10px]">Next Peak</p>
                    </div>
                    <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                      <p className="text-teal-400 font-bold text-sm">{cycle.intensityScore}/100</p>
                      <p className="text-slate-500 text-[10px]">Intensity</p>
                    </div>
                  </div>

                  {/* Intensity Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-400 text-[10px] uppercase tracking-wide">Cycle Intensity</span>
                      <span className="text-white text-[10px] font-semibold">{cycle.intensityScore}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${cycle.intensityScore >= 80 ? 'bg-rose-500' : cycle.intensityScore >= 60 ? 'bg-amber-500' : 'bg-teal-500'}`}
                        style={{ width: `${cycle.intensityScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Affected Eras */}
                  <div>
                    <h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">Affected Eras</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {cycle.affectedEras.map((era) => (
                        <span key={era} className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[10px] font-medium border border-rose-500/20">
                          {era}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerationalDemandForecasterModal;
