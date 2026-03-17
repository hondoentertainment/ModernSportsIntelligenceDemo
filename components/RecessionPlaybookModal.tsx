import React, { useState, useMemo } from 'react';
import { X, BookOpen, TrendingDown, ShieldAlert, Target, Percent, BarChart } from 'lucide-react';
import { getScenarios } from '../lib/recessionPlaybookService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const RecessionPlaybookModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('scenarios');

  const scenarios = useMemo(() => getScenarios(), []);

  if (!isOpen) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe': return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' };
      case 'moderate': return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' };
      case 'mild': return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' };
      default: return { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400' };
    }
  };

  const getProbabilityColor = (prob: number) => {
    if (prob >= 70) return 'text-red-400';
    if (prob >= 40) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const tabs = [
    { id: 'scenarios', label: 'Scenarios', icon: <ShieldAlert size={16} />, count: scenarios.length },
    { id: 'strategies', label: 'Strategies', icon: <Target size={16} />, count: scenarios.reduce((sum: number, s: any) => sum + (s.strategies?.length || 1), 0) },
  ];

  const highRiskCount = scenarios.filter((s: any) => s.severity === 'severe').length;
  const avgImpact = Math.round(scenarios.reduce((sum: number, s: any) => sum + (s.portfolioImpact || 0), 0) / scenarios.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-500/10 rounded-xl">
              <BookOpen size={24} className="text-slate-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Recession Playbook</h2>
              <p className="text-xs text-slate-500">Economic downturn scenario planning for collectibles</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 px-6 pt-4">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
            <p className="text-xs text-slate-500">Severe Scenarios</p>
            <p className="text-lg font-bold text-red-400">{highRiskCount}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
            <p className="text-xs text-slate-500">Avg Portfolio Impact</p>
            <p className="text-lg font-bold text-amber-400">{avgImpact}%</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
            <p className="text-xs text-slate-500">Active Scenarios</p>
            <p className="text-lg font-bold text-white">{scenarios.length}</p>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 px-6 pt-4 border-b border-slate-700/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'text-slate-300 bg-slate-800/50 border-b-2 border-slate-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
              }`}
            >
              {tab.icon}
              {tab.label}
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-slate-700/50">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'scenarios' && (
            <div className="grid gap-4">
              {scenarios.map((scenario: any, idx: number) => {
                const severity = getSeverityColor(scenario.severity || 'moderate');
                return (
                  <div key={idx} className="bg-slate-800/40 rounded-xl border border-slate-700/30 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-500/20 flex items-center justify-center">
                          <TrendingDown size={18} className="text-slate-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{scenario.name || `Scenario ${idx + 1}`}</h3>
                          <p className="text-xs text-slate-500">{scenario.trigger || 'Economic downturn'} • {scenario.timeframe || '6-12 months'}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full border ${severity.bg} ${severity.border} ${severity.text}`}>
                        {scenario.severity || 'moderate'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{scenario.description || 'Market correction scenario with potential impact on collectible values.'}</p>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Probability</p>
                        <p className={`text-sm font-bold ${getProbabilityColor(scenario.probability || 0)}`}>{scenario.probability || 0}%</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Portfolio Hit</p>
                        <p className="text-sm font-bold text-red-400">-{scenario.portfolioImpact || 0}%</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Recovery</p>
                        <p className="text-sm font-bold text-blue-400">{scenario.recoveryMonths || 12}mo</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Hedges</p>
                        <p className="text-sm font-bold text-white">{scenario.hedgeCount || 3}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'strategies' && (
            <div className="grid gap-4">
              {scenarios.map((scenario: any, idx: number) => (
                <div key={idx} className="bg-slate-800/40 rounded-xl border border-slate-700/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold">{scenario.name || `Scenario ${idx + 1}`} - Strategy</h3>
                    <div className="flex items-center gap-2">
                      <BarChart size={14} className="text-slate-500" />
                      <span className="text-sm text-slate-400">Effectiveness: {scenario.strategyEffectiveness || 75}%</span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Protection Level</span>
                      <span className="text-emerald-400">{scenario.protectionLevel || 70}%</span>
                    </div>
                    <div className="w-full bg-slate-700/30 rounded-full h-2">
                      <div className="bg-slate-400 rounded-full h-2 transition-all" style={{ width: `${scenario.protectionLevel || 70}%` }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Action</p>
                      <p className="text-sm font-bold text-amber-400">{scenario.primaryAction || 'Diversify'}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Cost</p>
                      <p className="text-sm font-bold text-red-400">{scenario.hedgeCost || '2.5'}%</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Timeline</p>
                      <p className="text-sm font-bold text-blue-400">{scenario.implementTime || '2 weeks'}</p>
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

export default RecessionPlaybookModal;
