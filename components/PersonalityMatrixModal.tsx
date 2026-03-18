import React, { useState, useMemo } from 'react';
import { X, Users, Brain, Sparkles, BarChart3, Heart, Target } from 'lucide-react';
import { getProfiles } from '../lib/utils/personalityMatrixService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PersonalityMatrixModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('profiles');

  const profiles = useMemo(() => getProfiles(), []);

  if (!isOpen) return null;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'collector': return { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' };
      case 'investor': return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' };
      case 'speculator': return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' };
      case 'flipper': return { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' };
      default: return { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400' };
    }
  };

  const getTraitColor = (score: number) => {
    if (score >= 80) return 'text-purple-400';
    if (score >= 60) return 'text-blue-400';
    return 'text-slate-400';
  };

  const tabs = [
    { id: 'profiles', label: 'Profiles', icon: <Users size={16} />, count: profiles.length },
    { id: 'quiz', label: 'Quiz', icon: <Brain size={16} />, count: profiles.filter((p: any) => p.quizCompleted).length },
  ];

  const collectorCount = profiles.filter((p: any) => p.type === 'collector').length;
  const investorCount = profiles.filter((p: any) => p.type === 'investor').length;
  const avgRiskTolerance = Math.round(profiles.reduce((sum: number, p: any) => sum + (p.riskTolerance || 50), 0) / profiles.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 rounded-xl">
              <Users size={24} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Personality Matrix</h2>
              <p className="text-xs text-slate-500">Collector personality profiling and behavior analysis</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 px-6 pt-4">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
            <p className="text-xs text-slate-500">Collectors</p>
            <p className="text-lg font-bold text-purple-400">{collectorCount}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
            <p className="text-xs text-slate-500">Investors</p>
            <p className="text-lg font-bold text-emerald-400">{investorCount}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
            <p className="text-xs text-slate-500">Avg Risk Tolerance</p>
            <p className="text-lg font-bold text-white">{avgRiskTolerance}/100</p>
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
                  ? 'text-purple-400 bg-slate-800/50 border-b-2 border-purple-400'
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
          {activeTab === 'profiles' && (
            <div className="grid gap-4">
              {profiles.map((profile: any, idx: number) => {
                const typeStyle = getTypeColor(profile.type || 'collector');
                return (
                  <div key={idx} className="bg-slate-800/40 rounded-xl border border-slate-700/30 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <Sparkles size={18} className="text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{profile.name || `Profile ${idx + 1}`}</h3>
                          <p className="text-xs text-slate-500">{profile.archetype || 'Classic Collector'} • {profile.yearsActive || 3} years active</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full border ${typeStyle.bg} ${typeStyle.border} ${typeStyle.text}`}>
                        {profile.type || 'collector'}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Patience</p>
                        <p className={`text-sm font-bold ${getTraitColor(profile.patience || 0)}`}>{profile.patience || 0}</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Risk</p>
                        <p className="text-sm font-bold text-amber-400">{profile.riskTolerance || 0}</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">FOMO Score</p>
                        <p className="text-sm font-bold text-red-400">{profile.fomoScore || 0}</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Discipline</p>
                        <p className="text-sm font-bold text-emerald-400">{profile.discipline || 0}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'quiz' && (
            <div className="grid gap-4">
              {profiles.map((profile: any, idx: number) => (
                <div key={idx} className="bg-slate-800/40 rounded-xl border border-slate-700/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold">{profile.name || `Profile ${idx + 1}`}</h3>
                    <div className="flex items-center gap-2">
                      <Heart size={14} className="text-purple-400" />
                      <span className="text-sm text-purple-400">{profile.quizCompleted ? 'Completed' : 'Pending'}</span>
                    </div>
                  </div>
                  <div className="space-y-2 mb-3">
                    {['Emotional Buying', 'Research Depth', 'Community Influence', 'Long-term Focus'].map((trait, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500">{trait}</span>
                          <span className="text-purple-400">{[profile.emotionalBuying, profile.researchDepth, profile.communityInfluence, profile.longTermFocus][i] || (60 + i * 8)}/100</span>
                        </div>
                        <div className="w-full bg-slate-700/30 rounded-full h-1.5">
                          <div className="bg-purple-500 rounded-full h-1.5 transition-all" style={{ width: `${[profile.emotionalBuying, profile.researchDepth, profile.communityInfluence, profile.longTermFocus][i] || (60 + i * 8)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Best Match</p>
                      <p className="text-sm font-bold text-purple-400">{profile.bestMatch || 'Vintage'}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Avoid</p>
                      <p className="text-sm font-bold text-red-400">{profile.avoidCategory || 'Hype'}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Compatibility</p>
                      <p className="text-sm font-bold text-emerald-400">{profile.compatibility || 82}%</p>
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

export default PersonalityMatrixModal;
