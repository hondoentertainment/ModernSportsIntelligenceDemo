import React, { useState, useMemo } from 'react';
import { X, Users, TrendingUp, TrendingDown, Brain, Clock, Target, Zap } from 'lucide-react';
import { getCohorts, getForecasts, getNostalgiaWaves } from '../lib/analytics/psychographicDemandService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PsychographicDemandModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('cohorts');

  const cohorts = useMemo(() => getCohorts(), []);
  const forecasts = useMemo(() => getForecasts(), []);
  const waves = useMemo(() => getNostalgiaWaves(), []);

  if (!isOpen) return null;

  const getGrowthColor = (rate: number) => {
    if (rate >= 20) return 'text-emerald-400';
    if (rate >= 5) return 'text-cyan-400';
    if (rate >= 0) return 'text-amber-400';
    return 'text-red-400';
  };

  const getElasticityColor = (e: string) => {
    switch (e) {
      case 'inelastic': return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' };
      case 'moderate': return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' };
      case 'elastic': return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' };
      default: return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' };
    }
  };

  const getRiskColor = (r: string) => {
    switch (r) {
      case 'conservative': return 'text-blue-400';
      case 'moderate': return 'text-amber-400';
      case 'aggressive': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getDemandColor = (d: number) => {
    if (d >= 90) return 'text-emerald-400';
    if (d >= 75) return 'text-violet-400';
    if (d >= 60) return 'text-amber-400';
    return 'text-slate-400';
  };

  const getShiftIcon = (dir: string) => {
    if (dir === 'growing') return <TrendingUp size={12} className="text-emerald-400" />;
    if (dir === 'declining') return <TrendingDown size={12} className="text-red-400" />;
    return <span className="text-slate-400 text-xs">--</span>;
  };

  const tabs = [
    { id: 'cohorts', label: 'Buyer Cohorts', icon: <Users size={16} /> },
    { id: 'forecasts', label: 'Demand Forecasts', icon: <Target size={16} /> },
    { id: 'nostalgia', label: 'Nostalgia Waves', icon: <Clock size={16} /> },
  ];

  const totalMarket = cohorts.reduce((sum, c) => sum + c.estimatedSize, 0);
  const fastestGrowing = cohorts.reduce((a, b) => a.growthRate > b.growthRate ? a : b);
  const highestSpend = cohorts.reduce((a, b) => a.avgSpend > b.avgSpend ? a : b);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-500/10 rounded-xl">
              <Users size={24} className="text-violet-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Psychographic Demand Modeler</h2>
              <p className="text-xs text-slate-500">Buyer cohort modeling and demand prediction by persona</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 px-6 pt-4 border-b border-slate-700/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-800/60 text-violet-400 border-b-2 border-violet-400'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stat Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Market</p>
              <p className="text-2xl font-bold text-violet-400">{(totalMarket / 1000000).toFixed(1)}M</p>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Cohorts</p>
              <p className="text-2xl font-bold text-violet-400">{cohorts.length}</p>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Fastest Growing</p>
              <p className="text-lg font-bold text-emerald-400">+{fastestGrowing.growthRate}%</p>
              <p className="text-[10px] text-slate-500">{fastestGrowing.name}</p>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Top Spender</p>
              <p className="text-lg font-bold text-amber-400">${highestSpend.avgSpend.toLocaleString()}</p>
              <p className="text-[10px] text-slate-500">{highestSpend.name}</p>
            </div>
          </div>

          {/* Buyer Cohorts Tab */}
          {activeTab === 'cohorts' && (
            <div className="space-y-4">
              {cohorts.map(cohort => {
                const ec = getElasticityColor(cohort.priceElasticity);
                return (
                  <div key={cohort.id} className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cohort.color }} />
                          <h3 className="text-sm font-bold text-white">{cohort.name}</h3>
                          <span className="px-2 py-0.5 bg-slate-800/60 border border-slate-700/30 rounded-full text-[10px] font-semibold text-slate-400">
                            {cohort.generation} | {cohort.ageRange}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1.5">{cohort.buyingMotivation}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className={`text-2xl font-bold ${getGrowthColor(cohort.growthRate)}`}>
                          {cohort.growthRate > 0 ? '+' : ''}{cohort.growthRate}%
                        </p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Growth</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Est. Size</p>
                        <p className="text-sm font-bold text-violet-400">{(cohort.estimatedSize / 1000000).toFixed(1)}M</p>
                      </div>
                      <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Avg Spend</p>
                        <p className="text-sm font-bold text-violet-400">${cohort.avgSpend.toLocaleString()}</p>
                      </div>
                      <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Digital</p>
                        <p className="text-sm font-bold text-cyan-400">{cohort.digitalAdoption}%</p>
                      </div>
                      <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Risk</p>
                        <p className={`text-sm font-bold ${getRiskColor(cohort.riskTolerance)}`}>{cohort.riskTolerance}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-1.5 flex-wrap flex-1">
                        {cohort.topCategories.map((cat, i) => (
                          <span key={i} className="px-2 py-0.5 bg-violet-500/10 border border-violet-500/20 rounded-md text-[10px] font-semibold text-violet-400">
                            {cat}
                          </span>
                        ))}
                      </div>
                      <span className={`px-2.5 py-0.5 ${ec.bg} border ${ec.border} rounded-full text-[10px] font-black ${ec.text} uppercase tracking-widest ml-3`}>
                        {cohort.priceElasticity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Demand Forecasts Tab */}
          {activeTab === 'forecasts' && (
            <div className="space-y-4">
              <div className="bg-violet-500/5 border border-violet-500/20 rounded-2xl p-4">
                <p className="text-xs text-violet-400 font-semibold flex items-center gap-2">
                  <Brain size={14} />
                  AI-driven demand forecasts factoring cohort shifts and cultural catalysts.
                </p>
              </div>
              {forecasts.map(forecast => (
                <div key={forecast.id} className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">{forecast.player}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{forecast.cardType} | Cohorts: {forecast.primaryCohorts.join(', ')}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl font-bold ${getDemandColor(forecast.currentDemandIndex)}`}>{forecast.currentDemandIndex}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">Demand Index</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Current</p>
                      <p className={`text-lg font-bold ${getDemandColor(forecast.currentDemandIndex)}`}>{forecast.currentDemandIndex}</p>
                    </div>
                    <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">6M Forecast</p>
                      <p className={`text-lg font-bold ${getDemandColor(forecast.forecastedDemand6m)}`}>{forecast.forecastedDemand6m}</p>
                    </div>
                    <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">1Y Forecast</p>
                      <p className={`text-lg font-bold ${getDemandColor(forecast.forecastedDemand1y)}`}>{forecast.forecastedDemand1y}</p>
                    </div>
                  </div>

                  {/* Cohort Shifts */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cohort Shifts</p>
                    {forecast.cohortShifts.map((shift, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-slate-800/40 border border-slate-700/30 rounded-xl">
                        <div className="flex items-center gap-2">
                          {getShiftIcon(shift.direction)}
                          <span className="text-xs font-semibold text-slate-300">{shift.cohort}</span>
                        </div>
                        <span className={`text-xs font-bold ${shift.direction === 'growing' ? 'text-emerald-400' : shift.direction === 'declining' ? 'text-red-400' : 'text-slate-400'}`}>
                          {shift.magnitude > 0 ? '+' : ''}{shift.magnitude}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Catalysts */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <Zap size={10} /> Catalysts
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {forecast.catalysts.map((cat, i) => (
                        <span key={i} className="px-2.5 py-1 bg-violet-500/10 border border-violet-500/20 rounded-lg text-[10px] font-semibold text-violet-400">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Nostalgia Waves Tab */}
          {activeTab === 'nostalgia' && (
            <div className="space-y-4">
              <div className="bg-violet-500/5 border border-violet-500/20 rounded-2xl p-4">
                <p className="text-xs text-violet-400 font-semibold flex items-center gap-2">
                  <Clock size={14} />
                  Generational nostalgia cycles driving demand. Peak timing is critical for portfolio positioning.
                </p>
              </div>
              {waves.map(wave => (
                <div key={wave.id} className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">{wave.era}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{wave.yearRange} | Peak Cohort: {wave.peakCohort}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-violet-400">{wave.currentIntensity}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">Intensity</p>
                    </div>
                  </div>

                  {/* Intensity Bar */}
                  <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${wave.currentIntensity >= 80 ? 'bg-violet-400' : wave.currentIntensity >= 60 ? 'bg-violet-500' : 'bg-slate-500'}`}
                      style={{ width: `${wave.currentIntensity}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Projected Peak</p>
                      <p className="text-sm font-bold text-violet-400">{wave.projectedPeak}</p>
                    </div>
                    <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Price Impact</p>
                      <p className="text-sm font-bold text-emerald-400">+{wave.priceImpact}%</p>
                    </div>
                    <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Peak Cohort</p>
                      <p className="text-sm font-bold text-violet-400">{wave.peakCohort}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Affected Players</p>
                    <div className="flex gap-2 flex-wrap">
                      {wave.affectedPlayers.map((player, i) => (
                        <span key={i} className="px-2.5 py-1 bg-violet-500/10 border border-violet-500/20 rounded-lg text-xs font-semibold text-violet-400">
                          {player}
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

export default PsychographicDemandModal;
