import React, { useState, useMemo } from 'react';
import { X, Dices, PieChart, AlertTriangle, Lightbulb, TrendingUp, Target } from 'lucide-react';
import { getScore, getPatterns } from '../lib/collectionEntropyService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CollectionEntropyModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('score');
  const score = useMemo(() => getScore(), []);
  const patterns = useMemo(() => getPatterns(), []);

  if (!isOpen) return null;

  const tabs = [
    { id: 'score', label: 'Score', count: 0 },
    { id: 'patterns', label: 'Patterns', count: patterns.length },
  ];

  const getScoreColor = (val: number) => {
    if (val >= 80) return 'text-emerald-400';
    if (val >= 60) return 'text-amber-400';
    if (val >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBg = (val: number) => {
    if (val >= 80) return 'bg-emerald-400';
    if (val >= 60) return 'bg-amber-400';
    if (val >= 40) return 'bg-orange-400';
    return 'bg-red-400';
  };

  const getTypeColor = (type: string) => {
    if (type === 'risk') return 'text-red-400 bg-red-400/10';
    if (type === 'bias') return 'text-amber-400 bg-amber-400/10';
    if (type === 'opportunity') return 'text-emerald-400 bg-emerald-400/10';
    return 'text-blue-400 bg-blue-400/10';
  };

  const getTypeIcon = (type: string) => {
    if (type === 'risk') return <AlertTriangle className="w-4 h-4" />;
    if (type === 'opportunity') return <TrendingUp className="w-4 h-4" />;
    if (type === 'bias') return <Target className="w-4 h-4" />;
    return <Lightbulb className="w-4 h-4" />;
  };

  const getRatingColor = (rating: string) => {
    if (rating === 'well-diversified') return 'text-emerald-400';
    if (rating === 'moderate') return 'text-amber-400';
    if (rating === 'concentrated') return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-xl">
              <Dices className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Collection Entropy</h2>
              <p className="text-sm text-slate-400">Portfolio diversity analysis and pattern detection</p>
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
                  ? 'bg-slate-800 text-indigo-400 border-b-2 border-indigo-400'
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
          {activeTab === 'score' && (
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center">
                <div className={`text-6xl font-bold mb-2 ${getScoreColor(score.overall)}`}>{score.overall}</div>
                <div className="text-slate-400 text-sm mb-1">Overall Entropy Score</div>
                <div className={`font-medium capitalize ${getRatingColor(score.riskRating)}`}>
                  {score.riskRating.replace('-', ' ')}
                </div>
              </div>

              {/* Sub-scores */}
              <div className="grid grid-cols-5 gap-3">
                {[
                  { label: 'Sport Diversity', value: score.sportDiversity },
                  { label: 'Era Diversity', value: score.eraDiversity },
                  { label: 'Grade Diversity', value: score.gradeDiversity },
                  { label: 'Price Tier', value: score.priceTierDiversity },
                  { label: 'Player Concentration', value: score.playerConcentration },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(item.value)}`}>{item.value}</div>
                    <div className="text-xs text-slate-500 mt-1">{item.label}</div>
                    <div className="mt-2 w-full bg-slate-700 rounded-full h-1.5">
                      <div className={`${getScoreBg(item.value)} h-1.5 rounded-full`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Allocation Breakdown */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-indigo-400" />
                  Allocation vs Ideal
                </h3>
                <div className="space-y-3">
                  {score.breakdown.map((b) => (
                    <div key={b.category} className="flex items-center gap-4">
                      <span className="text-sm text-slate-300 w-40 flex-shrink-0">{b.category}</span>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 bg-slate-700 rounded-full h-3 relative">
                          <div className="bg-indigo-500 h-3 rounded-full" style={{ width: `${b.allocation}%` }} />
                          <div className="absolute top-0 h-3 w-0.5 bg-emerald-400" style={{ left: `${b.ideal}%` }} />
                        </div>
                        <span className={`text-sm font-medium w-12 text-right ${b.allocation > b.ideal * 1.5 ? 'text-red-400' : 'text-slate-300'}`}>
                          {b.allocation}%
                        </span>
                        <span className="text-xs text-slate-500 w-16">ideal: {b.ideal}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation */}
              <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
                <p className="text-sm text-indigo-300">{score.recommendation}</p>
              </div>
            </div>
          )}

          {activeTab === 'patterns' && (
            <div className="space-y-3">
              {patterns.map((p) => (
                <div key={p.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium capitalize ${getTypeColor(p.type)}`}>
                        {getTypeIcon(p.type)}
                        {p.type}
                      </span>
                      <h3 className="text-white font-semibold">{p.name}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Severity</div>
                      <div className={`font-bold ${getScoreColor(100 - p.severity)}`}>{p.severity}/100</div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 mb-2">{p.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-2 flex-1">
                      <p className="text-xs text-indigo-300">{p.suggestion}</p>
                    </div>
                    <div className="text-right ml-4">
                      <span className="text-xs text-slate-500">{p.affectedCards} cards</span>
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

export default CollectionEntropyModal;
