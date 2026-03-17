import React, { useState, useMemo } from 'react';
import { X, ArrowLeftRight, TrendingUp, DollarSign, BarChart3, Target } from 'lucide-react';
import { getOpportunities } from '../lib/gradingArbitrageService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const GradingArbitrageModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('opportunities');
  const data = useMemo(() => getOpportunities(), []);

  if (!isOpen) return null;

  const tabs = [
    { id: 'opportunities', label: 'Opportunities', count: data.length },
    { id: 'analysis', label: 'Analysis', count: 0 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-xl">
              <ArrowLeftRight className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Grading Arbitrage</h2>
              <p className="text-sm text-slate-400">Cross-grade opportunities and arbitrage analysis</p>
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
                  ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
              {tab.count > 0 && <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-slate-700">{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'opportunities' && (
            <div className="space-y-4">
              {data.map((opp) => (
                <div key={opp.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold">{opp.player} — {opp.cardDescription}</h3>
                      <span className="text-sm text-slate-400">{opp.currentCompany} {opp.currentGrade} → {opp.targetCompany} {opp.expectedGrade}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium text-amber-400 bg-amber-400/10">
                      <TrendingUp className="w-4 h-4" />
                      +{opp.netROI}%
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">Current Value</div>
                      <div className="text-white font-bold">${opp.currentValue.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">After Crossover</div>
                      <div className="text-amber-400 font-bold">${opp.expectedValue.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">Crossover Odds</div>
                      <div className="text-emerald-400 font-bold">{opp.gradeUpProbability}%</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">Grading Cost</div>
                      <div className="text-slate-300 font-bold">${opp.crossoverFee}</div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mt-3">{opp.reasoning}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-4">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-400" />
                  Market Analysis
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <div className="text-sm text-slate-400 mb-2">PSA vs BGS Premium Gap</div>
                    <div className="text-2xl font-bold text-amber-400">18.3%</div>
                    <p className="text-xs text-slate-500 mt-1">Average premium PSA commands over BGS for equivalent grades</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <div className="text-sm text-slate-400 mb-2">SGC Crossover Success</div>
                    <div className="text-2xl font-bold text-emerald-400">72.1%</div>
                    <p className="text-xs text-slate-500 mt-1">Success rate for SGC to PSA crossover at same or higher grade</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <div className="text-sm text-slate-400 mb-2">Avg Profit Per Crossover</div>
                    <div className="text-2xl font-bold text-green-400">$147</div>
                    <p className="text-xs text-slate-500 mt-1">After grading fees and shipping costs</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <div className="text-sm text-slate-400 mb-2">Best Opportunity Window</div>
                    <div className="text-2xl font-bold text-blue-400">Q1-Q2</div>
                    <p className="text-xs text-slate-500 mt-1">Historically highest arbitrage margins</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GradingArbitrageModal;
