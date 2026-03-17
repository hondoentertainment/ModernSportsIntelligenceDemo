import React, { useState, useMemo } from 'react';
import { X, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { getForecasts, getDemographicShifts, getWealthTransfers, getCulturalCycles } from '../lib/generationalDemandForecasterService';

interface Props { isOpen: boolean; onClose: () => void; }

const GenerationalDemandForecasterModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('forecasts');
  const forecasts = useMemo(() => getForecasts(), []);
  const shifts = useMemo(() => getDemographicShifts(), []);
  const transfers = useMemo(() => getWealthTransfers(), []);
  const cycles = useMemo(() => getCulturalCycles(), []);

  if (!isOpen) return null;

  const confColor = (c: string) => c === 'high' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : c === 'medium' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : 'text-red-400 bg-red-500/10 border-red-500/30';
  const dirColor = (d: string) => d === 'bullish' ? 'text-emerald-400' : d === 'bearish' ? 'text-red-400' : 'text-amber-400';
  const phaseColor = (p: string) => p === 'peak' ? 'text-emerald-400 bg-emerald-500/10' : p === 'growth' ? 'text-blue-400 bg-blue-500/10' : p === 'emergence' ? 'text-purple-400 bg-purple-500/10' : p === 'decline' ? 'text-red-400 bg-red-500/10' : p === 'revival' ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 bg-slate-500/10';

  const tabs = [
    { id: 'forecasts', label: 'Long-Term Forecasts', count: forecasts.length },
    { id: 'shifts', label: 'Demographic Shifts', count: shifts.length },
    { id: 'transfers', label: 'Wealth Transfers', count: transfers.length },
    { id: 'cycles', label: 'Cultural Cycles', count: cycles.length },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20"><Clock size={20} className="text-rose-400" /></div>
            <div><h2 className="text-lg font-bold text-white">Generational Demand Forecaster</h2><p className="text-xs text-slate-400">10-25 year demographic-driven demand projection modeling</p></div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg"><X size={18} className="text-slate-400" /></button>
        </div>

        <div className="flex gap-1 px-5 pt-3 border-b border-slate-700/50 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all ${activeTab === t.id ? 'border-rose-400 text-rose-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
              {t.label} <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-800 text-[9px]">{t.count}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'forecasts' && forecasts.map(f => (
            <div key={f.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">{f.player} — {f.cardType}</h3>
                  <p className="text-[10px] text-slate-500">Current Value: <span className="text-white font-bold">${f.currentValue.toLocaleString()}</span></p>
                </div>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${confColor(f.confidenceBand)}`}>{f.confidenceBand} confidence</span>
              </div>

              <div className="grid grid-cols-5 gap-2 mb-4">
                {f.projections.map(p => (
                  <div key={p.year} className="bg-slate-900/50 rounded-lg p-2 text-center">
                    <p className="text-[9px] text-slate-500">{p.year}</p>
                    <p className={`text-sm font-bold ${p.projectedValue >= f.currentValue ? 'text-emerald-400' : 'text-red-400'}`}>${(p.projectedValue / 1000).toFixed(0)}K</p>
                    <p className="text-[8px] text-slate-600">${(p.lowBound / 1000).toFixed(0)}K - ${(p.highBound / 1000).toFixed(0)}K</p>
                    <p className="text-[8px] text-slate-400 mt-1 line-clamp-2">{p.keyEvent}</p>
                  </div>
                ))}
              </div>

              <p className="text-[10px] text-slate-300 italic mb-3">{f.narrative}</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[9px] font-bold text-emerald-400 uppercase mb-1">Primary Drivers</p>
                  {f.primaryDrivers.map((d, i) => (
                    <p key={i} className="text-[10px] text-slate-300 flex items-center gap-1"><TrendingUp size={8} className="text-emerald-400" /> {d}</p>
                  ))}
                </div>
                <div>
                  <p className="text-[9px] font-bold text-red-400 uppercase mb-1">Risk Factors</p>
                  {f.riskFactors.map((d, i) => (
                    <p key={i} className="text-[10px] text-slate-300 flex items-center gap-1"><ArrowRight size={8} className="text-red-400" /> {d}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {activeTab === 'shifts' && shifts.map(s => (
            <div key={s.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-white">{s.name}</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold ${dirColor(s.direction)}`}>{s.direction}</span>
                  <span className="text-[9px] text-slate-500">{s.probability}% probability</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mb-2">{s.description}</p>
              <div className="flex items-center gap-4">
                <span className="text-[9px] text-slate-500">Timeframe: <span className="text-white font-bold">{s.timeframe}</span></span>
                <span className="text-[9px] text-slate-500">Magnitude: <span className="text-rose-400 font-bold">{s.magnitude}/100</span></span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {s.affectedCategories.map((c, i) => (
                  <span key={i} className="text-[8px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">{c}</span>
                ))}
              </div>
            </div>
          ))}

          {activeTab === 'transfers' && transfers.map(t => (
            <div key={t.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <h3 className="text-sm font-bold text-white mb-2">{t.name}</h3>
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div><p className="text-[9px] text-slate-500">Est. Value</p><p className="text-sm font-bold text-rose-400">${(t.estimatedValue / 1e9).toFixed(1)}B</p></div>
                <div><p className="text-[9px] text-slate-500">Peak Year</p><p className="text-sm font-bold text-white">{t.peakYear}</p></div>
                <div><p className="text-[9px] text-slate-500">From</p><p className="text-sm font-bold text-white">{t.sourceGeneration}</p></div>
                <div><p className="text-[9px] text-slate-500">Card Allocation</p><p className="text-sm font-bold text-emerald-400">{t.collectibleAllocation}%</p></div>
              </div>
              <p className="text-[10px] text-slate-300">{t.impactOnCards}</p>
            </div>
          ))}

          {activeTab === 'cycles' && cycles.map(c => (
            <div key={c.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-white">{c.cycleName}</h3>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${phaseColor(c.currentPhase)}`}>{c.currentPhase}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-2">
                <div><p className="text-[9px] text-slate-500">Period</p><p className="text-xs font-bold text-white">{c.periodYears} years</p></div>
                <div><p className="text-[9px] text-slate-500">Next Peak</p><p className="text-xs font-bold text-rose-400">{c.nextPeakEstimate}</p></div>
                <div><p className="text-[9px] text-slate-500">Intensity</p><p className="text-xs font-bold text-white">{c.intensityScore}/100</p></div>
              </div>
              <div className="flex flex-wrap gap-1">
                {c.affectedEras.map((e, i) => (
                  <span key={i} className="text-[8px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">{e}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GenerationalDemandForecasterModal;
