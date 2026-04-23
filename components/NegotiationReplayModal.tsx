// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  X,
  PlayCircle,
  Award,
  Target,
  TrendingUp,
  TrendingDown,
  Clock,
  MessageSquare,
  ChevronRight,
  Zap,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  BarChart3,
} from 'lucide-react';
import { getReplays, getPatterns } from '../lib/trading/negotiationReplayService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const NegotiationReplayModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('replays');
  const [expandedReplay, setExpandedReplay] = useState<string | null>(null);

  const replays = useMemo(() => getReplays(), []);
  const patterns = useMemo(() => getPatterns(), []);

  if (!isOpen) return null;

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-emerald-400';
    if (grade.startsWith('B')) return 'text-teal-400';
    if (grade.startsWith('C')) return 'text-amber-400';
    return 'text-red-400';
  };

  const getGradeBg = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-emerald-500/20 border-emerald-500/30';
    if (grade.startsWith('B')) return 'bg-teal-500/20 border-teal-500/30';
    if (grade.startsWith('C')) return 'bg-amber-500/20 border-amber-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const getOutcomeBadge = (outcome: string) => {
    const map: Record<string, { color: string; bg: string }> = {
      'won': { color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' },
      'lost': { color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/30' },
      'walked': { color: 'text-slate-400', bg: 'bg-slate-500/15 border-slate-500/30' },
      'compromised': { color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30' },
    };
    const info = map[outcome] || map['walked'];
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${info.bg} ${info.color}`}>
        {outcome}
      </span>
    );
  };

  const getToneColor = (tone: string) => {
    const map: Record<string, string> = {
      confident: 'text-emerald-400',
      aggressive: 'text-red-400',
      conciliatory: 'text-blue-400',
      desperate: 'text-amber-400',
      neutral: 'text-slate-400',
      firm: 'text-teal-400',
    };
    return map[tone] || 'text-slate-400';
  };

  const getMoveTypeColor = (type: string) => {
    const map: Record<string, string> = {
      'offer': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      'counter': 'bg-teal-500/15 text-teal-400 border-teal-500/30',
      'anchor': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      'concession': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      'walkaway-threat': 'bg-red-500/15 text-red-400 border-red-500/30',
      'information-reveal': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      'deadline-pressure': 'bg-orange-500/15 text-orange-400 border-orange-500/30',
      'bundle-proposal': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    };
    return map[type] || 'bg-slate-500/15 text-slate-400 border-slate-500/30';
  };

  const totalSavings = useMemo(() => {
    return replays
      .filter(r => r.outcome === 'won')
      .reduce((sum, r) => sum + (r.startPrice - r.finalPrice), 0);
  }, [replays]);

  const avgGrade = useMemo(() => {
    const gradeMap: Record<string, number> = { 'A+': 98, 'A': 93, 'A-': 90, 'B+': 87, 'B': 83, 'B-': 80, 'C+': 77, 'C': 73, 'C-': 70, 'D+': 67, 'D': 63, 'F': 50 };
    const total = replays.reduce((sum, r) => sum + (gradeMap[r.aiAnalysis.overallGrade] || 70), 0);
    return Math.round(total / replays.length);
  }, [replays]);

  const tabs = [
    { id: 'replays', label: 'Replay Library', icon: <PlayCircle size={16} /> },
    { id: 'moves', label: 'Move Analysis', icon: <Target size={16} /> },
    { id: 'patterns', label: 'Patterns & Tactics', icon: <Zap size={16} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500/10 to-slate-900 px-6 py-5 border-b border-slate-700/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <PlayCircle size={22} className="text-orange-400" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Negotiation Replay Theater</h2>
                <p className="text-slate-400 text-xs">Record, replay, and study negotiation sessions like game film</p>
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
                    ? 'bg-orange-500/20 text-orange-400'
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
          {/* Replay Library Tab */}
          {activeTab === 'replays' && (
            <div className="space-y-5">
              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40 text-center">
                  <p className="text-white font-bold text-2xl">{replays.length}</p>
                  <p className="text-slate-400 text-[10px] uppercase tracking-wide">Total Replays</p>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40 text-center">
                  <p className="text-emerald-400 font-bold text-2xl">${totalSavings.toLocaleString()}</p>
                  <p className="text-slate-400 text-[10px] uppercase tracking-wide">Total Saved</p>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40 text-center">
                  <p className="text-orange-400 font-bold text-2xl">{avgGrade}</p>
                  <p className="text-slate-400 text-[10px] uppercase tracking-wide">Avg Score</p>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40 text-center">
                  <p className="text-teal-400 font-bold text-2xl">{replays.filter(r => r.outcome === 'won').length}/{replays.length}</p>
                  <p className="text-slate-400 text-[10px] uppercase tracking-wide">Win Rate</p>
                </div>
              </div>

              {/* Replay Cards */}
              {replays.map((replay) => (
                <div
                  key={replay.id}
                  className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/40 hover:border-slate-600/60 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${getGradeBg(replay.aiAnalysis.overallGrade)}`}>
                        <span className={`font-bold text-lg ${getGradeColor(replay.aiAnalysis.overallGrade)}`}>{replay.aiAnalysis.overallGrade}</span>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-sm">{replay.title}</h3>
                        <p className="text-slate-500 text-xs">{replay.cardName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getOutcomeBadge(replay.outcome)}
                      <span className="text-slate-500 text-xs">{replay.date}</span>
                    </div>
                  </div>

                  {/* Price Flow */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                      <p className="text-slate-400 font-bold text-sm">${replay.startPrice.toLocaleString()}</p>
                      <p className="text-slate-500 text-[10px]">Ask Price</p>
                    </div>
                    <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                      <p className="text-orange-400 font-bold text-sm">${replay.targetPrice.toLocaleString()}</p>
                      <p className="text-slate-500 text-[10px]">Target</p>
                    </div>
                    <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                      <p className="text-white font-bold text-sm">${replay.finalPrice.toLocaleString()}</p>
                      <p className="text-slate-500 text-[10px]">Final</p>
                    </div>
                    <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                      <p className={`font-bold text-sm ${replay.savingsVsAsk > 10 ? 'text-emerald-400' : replay.savingsVsAsk > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                        {replay.savingsVsAsk}%
                      </p>
                      <p className="text-slate-500 text-[10px]">Savings</p>
                    </div>
                  </div>

                  {/* Analysis Summary */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Target size={12} className="text-orange-400" />
                      <span className="text-slate-400 text-[10px]">Tactical: <span className="text-white font-semibold">{replay.aiAnalysis.tacticalScore}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award size={12} className="text-blue-400" />
                      <span className="text-slate-400 text-[10px]">Emotional: <span className="text-white font-semibold">{replay.aiAnalysis.emotionalControl}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Zap size={12} className="text-teal-400" />
                      <span className="text-slate-400 text-[10px]">Anchoring: <span className="text-white font-semibold">{replay.aiAnalysis.anchoringEffectiveness}</span></span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-2 mb-3">
                    {replay.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded bg-slate-700/50 text-slate-400 text-[10px] font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Expand/Collapse */}
                  <button
                    onClick={() => setExpandedReplay(expandedReplay === replay.id ? null : replay.id)}
                    className="flex items-center gap-1 text-orange-400 text-xs font-medium hover:text-orange-300 transition-colors"
                  >
                    <PlayCircle size={14} />
                    {expandedReplay === replay.id ? 'Hide Replay' : 'Watch Replay'}
                    <ChevronRight size={12} className={`transition-transform ${expandedReplay === replay.id ? 'rotate-90' : ''}`} />
                  </button>

                  {/* Move-by-Move Timeline */}
                  {expandedReplay === replay.id && (
                    <div className="mt-4 pt-4 border-t border-slate-700/40 space-y-3">
                      {replay.moves.map((move) => (
                        <div
                          key={move.id}
                          className={`flex gap-3 ${move.actor === 'buyer' ? '' : 'flex-row-reverse'}`}
                        >
                          <div className={`flex-1 max-w-[80%] p-3 rounded-xl border ${
                            move.actor === 'buyer'
                              ? 'bg-orange-500/10 border-orange-500/20'
                              : 'bg-slate-700/40 border-slate-600/30'
                          }`}>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className={`text-[10px] font-bold uppercase ${move.actor === 'buyer' ? 'text-orange-400' : 'text-slate-400'}`}>
                                {move.actor === 'buyer' ? 'You' : 'Seller'}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${getMoveTypeColor(move.type)}`}>
                                {move.type.replace('-', ' ')}
                              </span>
                              <span className={`text-[10px] font-medium ${getToneColor(move.emotionalTone)}`}>
                                {move.emotionalTone}
                              </span>
                            </div>
                            <p className="text-slate-200 text-xs leading-relaxed mb-1.5">{move.message}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-white font-bold text-sm">${move.amount.toLocaleString()}</span>
                              <div className="flex items-center gap-1">
                                <span className="text-slate-500 text-[10px]">Tactical:</span>
                                <span className={`text-[10px] font-bold ${move.tacticalScore >= 70 ? 'text-emerald-400' : move.tacticalScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                  {move.tacticalScore}/100
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Lessons */}
                      <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mt-3">
                        <h4 className="text-orange-400 text-xs font-semibold uppercase tracking-wide mb-2">Lessons Learned</h4>
                        {replay.aiAnalysis.lessonsLearned.map((lesson, i) => (
                          <div key={i} className="flex items-start gap-2 text-[11px] text-slate-300 mb-1">
                            <ChevronRight size={10} className="text-orange-400 mt-0.5 shrink-0" />
                            <span>{lesson}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Move Analysis Tab */}
          {activeTab === 'moves' && (
            <div className="space-y-5">
              {replays.map((replay) => (
                <div key={replay.id} className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/40">
                  <h3 className="text-white font-semibold text-sm mb-1">{replay.title}</h3>
                  <p className="text-slate-500 text-xs mb-4">{replay.aiAnalysis.concessionPattern}</p>

                  {/* Strong Moves */}
                  <div className="mb-3">
                    <h4 className="text-emerald-400 text-[10px] font-bold uppercase tracking-wide mb-2">Strong Moves</h4>
                    {replay.aiAnalysis.strongMoves.map((m, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-slate-300 mb-1">
                        <CheckCircle size={10} className="text-emerald-400 mt-0.5 shrink-0" />
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>

                  {/* Missed Opportunities */}
                  <div className="mb-3">
                    <h4 className="text-amber-400 text-[10px] font-bold uppercase tracking-wide mb-2">Missed Opportunities</h4>
                    {replay.aiAnalysis.missedOpportunities.map((m, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-slate-300 mb-1">
                        <AlertTriangle size={10} className="text-amber-400 mt-0.5 shrink-0" />
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>

                  {/* Improvement Areas */}
                  <div>
                    <h4 className="text-blue-400 text-[10px] font-bold uppercase tracking-wide mb-2">Improvement Areas</h4>
                    {replay.aiAnalysis.improvementAreas.map((m, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-slate-300 mb-1">
                        <Target size={10} className="text-blue-400 mt-0.5 shrink-0" />
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Patterns & Tactics Tab */}
          {activeTab === 'patterns' && (
            <div className="space-y-5">
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-orange-300 text-xs font-semibold uppercase tracking-wide">Your Tactics Playbook</p>
                  <p className="text-white font-bold text-2xl">{patterns.length} Patterns Identified</p>
                </div>
                <BarChart3 size={28} className="text-orange-400" />
              </div>

              {patterns.map((pattern) => (
                <div
                  key={pattern.id}
                  className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/40 hover:border-slate-600/60 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold text-sm">{pattern.name}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 text-[10px] font-semibold border border-orange-500/30">
                      {pattern.winRate}% win rate
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed mb-4">{pattern.description}</p>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                      <p className="text-emerald-400 font-bold text-sm">{pattern.avgSavings}%</p>
                      <p className="text-slate-500 text-[10px]">Avg Savings</p>
                    </div>
                    <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                      <p className="text-white font-bold text-sm">{pattern.frequency}x</p>
                      <p className="text-slate-500 text-[10px]">Times Used</p>
                    </div>
                    <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                      <p className="text-orange-400 font-bold text-sm">{pattern.winRate}%</p>
                      <p className="text-slate-500 text-[10px]">Win Rate</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-[11px] bg-slate-700/30 rounded-lg p-3">
                    <Zap size={12} className="text-orange-400 mt-0.5 shrink-0" />
                    <span className="text-slate-300">
                      <span className="text-orange-400 font-semibold">Best against:</span> {pattern.bestAgainst}
                    </span>
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

export default NegotiationReplayModal;
