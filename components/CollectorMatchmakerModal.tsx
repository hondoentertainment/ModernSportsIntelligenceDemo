import React, { useMemo, useState } from 'react';
import {
  X,
  Handshake,
  Heart,
  Star,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  Users,
  Target,
  Zap,
} from 'lucide-react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  findMatches,
  getTradeProposals,
  formatCurrency,
  type MatchResult,
} from '../lib/core/collectorMatchmakerService';

interface CollectorMatchmakerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function scoreBadge(score: number) {
  if (score >= 85) return { text: 'Excellent', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
  if (score >= 70) return { text: 'Great', color: 'text-blue-400', bg: 'bg-blue-500/20' };
  if (score >= 50) return { text: 'Good', color: 'text-amber-400', bg: 'bg-amber-500/20' };
  return { text: 'Fair', color: 'text-slate-400', bg: 'bg-slate-500/20' };
}

const CollectorMatchmakerModal: React.FC<CollectorMatchmakerModalProps> = ({ isOpen, onClose }) => {
  const matches = useMemo(() => findMatches(), []);
  const proposals = useMemo(() => getTradeProposals(), []);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [viewMode, setViewMode] = useState<'browse' | 'detail'>('browse');

  const currentMatch = matches[currentIdx] ?? null;
  const pendingCount = proposals.filter(p => p.status === 'proposed' || p.status === 'countered').length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Handshake size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Collector Matchmaker</h2>
              <p className="text-xs text-slate-400">{matches.length} matches · {pendingCount} pending proposals</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-800 rounded-xl p-3 text-center">
              <Users size={16} className="text-emerald-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{matches.length}</p>
              <p className="text-xs text-slate-400">Matches</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-3 text-center">
              <ArrowLeftRight size={16} className="text-blue-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{pendingCount}</p>
              <p className="text-xs text-slate-400">Pending</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-3 text-center">
              <Star size={16} className="text-amber-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{matches[0]?.compatibilityScore ?? 0}%</p>
              <p className="text-xs text-slate-400">Best Match</p>
            </div>
          </div>

          {/* Match Card Browser */}
          {currentMatch && viewMode === 'browse' && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{currentMatch.collector2.avatar}</span>
                    <div>
                      <h3 className="text-xl font-bold text-white">{currentMatch.collector2.alias}</h3>
                      <p className="text-slate-400 text-sm">{currentMatch.collector2.location}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span className="text-amber-400 text-xs">{currentMatch.collector2.rating}</span>
                        <span className="text-slate-500 text-xs">· {currentMatch.collector2.completedTrades} trades</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full ${scoreBadge(currentMatch.compatibilityScore).bg}`}>
                    <span className={`text-xl font-bold ${scoreBadge(currentMatch.compatibilityScore).color}`}>
                      {currentMatch.compatibilityScore}%
                    </span>
                  </div>
                </div>

                <p className="text-slate-300 text-sm italic">"{currentMatch.collector2.bio}"</p>

                <div className="flex flex-wrap gap-1.5">
                  {currentMatch.collector2.collectionFocus.sports.map(s => (
                    <span key={s} className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                  {currentMatch.collector2.collectionFocus.eras.slice(0, 3).map(e => (
                    <span key={e} className="bg-blue-500/10 text-blue-400 text-xs px-2 py-0.5 rounded-full">{e}</span>
                  ))}
                </div>

                {/* Match Reason */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                  <p className="text-emerald-400 text-sm flex items-center gap-2">
                    <Sparkles size={14} /> {currentMatch.matchReason}
                  </p>
                </div>

                {/* Gap fills */}
                {currentMatch.gaps.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Cards they have that you need</h4>
                    {currentMatch.gaps.slice(0, 3).map(gap => (
                      <div key={gap.id} className="flex items-center gap-2 text-sm text-blue-300 bg-blue-500/10 rounded-lg px-3 py-1.5 mb-1">
                        <Check size={12} className="text-blue-400 flex-shrink-0" />
                        {gap.description}
                        <span className="text-blue-400/60 ml-auto text-xs">~{formatCurrency(gap.estimatedCost)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="border-t border-slate-700 px-5 py-3 flex items-center justify-between bg-slate-900/50">
                <button onClick={() => setCurrentIdx(prev => Math.max(prev - 1, 0))} disabled={currentIdx === 0}
                  className="text-slate-400 hover:text-white disabled:opacity-30 transition-colors p-1">
                  <ChevronLeft size={20} />
                </button>
                <span className="text-slate-500 text-sm">{currentIdx + 1} / {matches.length}</span>
                <button onClick={() => setCurrentIdx(prev => Math.min(prev + 1, matches.length - 1))} disabled={currentIdx === matches.length - 1}
                  className="text-slate-400 hover:text-white disabled:opacity-30 transition-colors p-1">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Detail View with Radar */}
          {currentMatch && viewMode === 'detail' && (
            <div className="space-y-4">
              <button onClick={() => setViewMode('browse')} className="text-slate-400 hover:text-white text-sm flex items-center gap-1 transition-colors">
                <ChevronLeft size={14} /> Back
              </button>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                <h3 className="text-white font-semibold mb-2 text-center">Compatibility with {currentMatch.collector2.alias}</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={currentMatch.radarData} outerRadius="70%">
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="axis" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="You" dataKey="collector1" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                    <Radar name={currentMatch.collector2.alias} dataKey="collector2" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.2} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400"><span className="w-3 h-3 bg-emerald-500/40 rounded-full" /> You</span>
                  <span className="flex items-center gap-1.5 text-xs text-blue-400"><span className="w-3 h-3 bg-blue-500/40 rounded-full" /> {currentMatch.collector2.alias}</span>
                </div>
              </div>
            </div>
          )}

          {/* Toggle View */}
          <div className="flex gap-2">
            <button onClick={() => setViewMode('browse')}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                viewMode === 'browse' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}>
              <Heart size={14} /> Browse Matches
            </button>
            <button onClick={() => setViewMode('detail')}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                viewMode === 'detail' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}>
              <Target size={14} /> Compatibility Detail
            </button>
          </div>

          {/* Recent Proposals */}
          {proposals.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                <ArrowLeftRight size={14} className="text-blue-400" /> Recent Proposals
              </h4>
              {proposals.slice(0, 3).map(p => {
                const match = matches.find(m => m.matchId === p.matchId);
                return (
                  <div key={p.id} className="bg-slate-800 border border-slate-700 rounded-lg p-3 mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{match?.collector2.avatar ?? '🃏'}</span>
                      <div>
                        <p className="text-white text-sm font-medium">{match?.collector2.alias ?? 'Unknown'}</p>
                        <p className="text-slate-500 text-xs">{p.offeredCards.length} offered · {p.requestedCards.length} requested</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      p.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400' :
                      p.status === 'countered' ? 'bg-blue-500/20 text-blue-400' :
                      p.status === 'declined' ? 'bg-red-500/20 text-red-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>{p.status}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectorMatchmakerModal;
