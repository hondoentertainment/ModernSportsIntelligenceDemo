import React, { useState, useMemo } from 'react';
import { X, Clock, AlertTriangle, Shield, Thermometer, Droplets } from 'lucide-react';
import { getAnalyses, getMaterialReports } from '../lib/cardAgingClockService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CardAgingClockModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('age-analysis');
  const analyses = useMemo(() => getAnalyses(), []);
  const materials = useMemo(() => getMaterialReports(), []);

  if (!isOpen) return null;

  const tabs = [
    { id: 'age-analysis', label: 'Age Analysis', count: analyses.length },
    { id: 'material', label: 'Material', count: materials.length },
  ];

  const getRiskColor = (risk: string) => {
    if (risk === 'low') return 'text-emerald-400 bg-emerald-400/10';
    if (risk === 'moderate') return 'text-amber-400 bg-amber-400/10';
    if (risk === 'high') return 'text-orange-400 bg-orange-400/10';
    return 'text-red-400 bg-red-400/10';
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getHealthBar = (score: number) => {
    const color = score >= 80 ? 'bg-emerald-400' : score >= 60 ? 'bg-amber-400' : score >= 40 ? 'bg-orange-400' : 'bg-red-400';
    return (
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${score}%` }} />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-xl">
              <Clock className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Card Aging Clock</h2>
              <p className="text-sm text-slate-400">Track card degradation and material health over time</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 px-6 pt-4 border-b border-slate-700/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-orange-400 border-b-2 border-orange-400'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-slate-700">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'age-analysis' && (
            <div className="space-y-4">
              {analyses.map((a) => (
                <div key={a.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold">{a.cardName}</h3>
                      <span className="text-sm text-slate-400">{a.grade} — {a.materialType} — Age: {a.currentAge} years</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getRiskColor(a.riskLevel)}`}>
                      {a.riskLevel} risk
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-3">
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">Year</div>
                      <div className="text-white font-bold">{a.year}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">Degradation</div>
                      <div className="text-orange-400 font-bold">{a.degradationRate}%/yr</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">5yr Projection</div>
                      <div className="text-amber-400 font-bold">{a.projectedGrade5yr}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">10yr Projection</div>
                      <div className="text-red-400 font-bold">{a.projectedGrade10yr}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">Storage</div>
                      <div className="text-slate-300 font-medium text-xs">{a.storageQuality}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'material' && (
            <div className="space-y-4">
              {materials.map((m) => (
                <div key={m.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold">{m.cardName}</h3>
                      <span className="text-sm text-slate-400">{m.paperStock} — {m.coatingType}</span>
                    </div>
                    <div className={`text-2xl font-bold ${getHealthColor(m.overallHealth)}`}>{m.overallHealth}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Ink Stability</span>
                        <span className="text-slate-300">{m.inkStability}%</span>
                      </div>
                      {getHealthBar(m.inkStability)}
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Surface</span>
                        <span className="text-slate-300">{m.surfaceIntegrity}%</span>
                      </div>
                      {getHealthBar(m.surfaceIntegrity)}
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Corners</span>
                        <span className="text-slate-300">{m.cornerDurability}%</span>
                      </div>
                      {getHealthBar(m.cornerDurability)}
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Yellowing Resist.</span>
                        <span className="text-slate-300">{m.yellowing}%</span>
                      </div>
                      {getHealthBar(m.yellowing)}
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Brittleness Resist.</span>
                        <span className="text-slate-300">{m.brittleness}%</span>
                      </div>
                      {getHealthBar(m.brittleness)}
                    </div>
                  </div>
                  <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-3">
                    <p className="text-sm text-orange-300">{m.recommendation}</p>
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

export default CardAgingClockModal;
