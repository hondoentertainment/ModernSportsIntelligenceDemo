import React, { useState, useMemo } from 'react';
import {
  Eye, Users, TrendingUp, TrendingDown, MessageSquare, Star,
  Target, Zap, Shield, ChevronRight, BarChart3, Clock,
} from 'lucide-react';
import {
  getSharedWatchlists,
  getCollaborationStats,
  getResearchStatusLabel,
  getResearchStatusColor,
} from '../lib/social/sharedWatchlistService';

const SharedWatchlists: React.FC = () => {
  const watchlists = useMemo(() => getSharedWatchlists(), []);
  const stats = useMemo(() => getCollaborationStats(), []);
  const [selectedWatchlist, setSelectedWatchlist] = useState(watchlists[0]?.id || '');

  const active = watchlists.find(w => w.id === selectedWatchlist);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Eye size={22} className="text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Shared Watchlists & Collaborative Research</h1>
              <p className="text-slate-400 text-sm">
                Multi-user watchlists with real-time collaboration, shared notes, and consensus signals
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Eye, color: 'text-cyan-400', label: 'Shared Lists', value: stats.totalSharedWatchlists },
            { icon: Users, color: 'text-blue-400', label: 'Collaborators', value: stats.totalCollaborators },
            { icon: Target, color: 'text-green-400', label: 'Buy Signals', value: stats.consensusBuySignals },
            { icon: TrendingUp, color: 'text-emerald-400', label: 'Group Alpha', value: `+${stats.avgGroupAlpha}%` },
          ].map((s, i) => (
            <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <div className="flex items-center gap-2 mb-2">
                <s.icon size={16} className={s.color} />
                <span className="text-slate-400 text-xs uppercase tracking-wide">{s.label}</span>
              </div>
              <p className="text-white font-bold text-3xl">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Watchlist Selector */}
        <div className="flex gap-2 flex-wrap">
          {watchlists.map(w => (
            <button
              key={w.id}
              onClick={() => setSelectedWatchlist(w.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                selectedWatchlist === w.id ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
              }`}
            >
              {w.name}
            </button>
          ))}
        </div>

        {active && (
          <>
            {/* Watchlist Header */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold text-lg">{active.name}</h3>
                  <p className="text-slate-400 text-sm mt-1">{active.description}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    active.visibility === 'public' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'
                  }`}>{active.visibility}</span>
                </div>
              </div>
              <div className="flex items-center gap-6 text-xs text-slate-400">
                <span>Created by <span className="text-white font-semibold">@{active.createdBy}</span></span>
                <span><Users size={12} className="inline mr-1" />{active.contributors.length} contributors</span>
                <span><MessageSquare size={12} className="inline mr-1" />{active.activeResearchThreads} research threads</span>
                <span>Avg consensus: <span className={`font-bold ${active.avgConsensus >= 50 ? 'text-green-400' : active.avgConsensus >= 0 ? 'text-amber-400' : 'text-red-400'}`}>{active.avgConsensus}</span></span>
              </div>
            </div>

            {/* Contributors */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {active.contributors.map(c => (
                <div key={c.userId} className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold text-sm">@{c.handle}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      c.role === 'owner' ? 'bg-amber-500/10 text-amber-400' : c.role === 'editor' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-500/10 text-slate-400'
                    }`}>{c.role}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500">
                    <span>{c.notesCount} notes</span>
                    <span>Active {c.lastActive}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Cards */}
            <div className="space-y-3">
              {active.cards.map(card => (
                <div key={card.id} className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-white font-semibold text-sm">{card.cardName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getResearchStatusColor(card.researchStatus)}`}>
                          {getResearchStatusLabel(card.researchStatus)}
                        </span>
                        <span className="text-slate-500 text-xs">Added by @{card.addedBy}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase">Added At</p>
                          <p className="text-white font-bold">${card.priceAtAdd.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase">Current</p>
                          <p className="text-white font-bold">${card.currentPrice.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase">Change</p>
                          <p className={`font-bold ${card.currentPrice >= card.priceAtAdd ? 'text-green-400' : 'text-red-400'}`}>
                            {card.currentPrice >= card.priceAtAdd ? '+' : ''}{Math.round(((card.currentPrice - card.priceAtAdd) / card.priceAtAdd) * 100)}%
                          </p>
                        </div>
                      </div>
                      {card.targetPrice && (
                        <p className="text-slate-500 text-xs mt-1">
                          Target: <span className="text-cyan-400 font-bold">${card.targetPrice.toLocaleString()}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Consensus Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-500 text-[10px] uppercase">Consensus</span>
                      <span className={`text-xs font-bold ${card.consensusScore >= 50 ? 'text-green-400' : card.consensusScore >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
                        {card.consensusScore > 0 ? '+' : ''}{card.consensusScore}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden relative">
                      <div className="absolute inset-0 flex">
                        <div className="w-1/2 flex justify-end"><div className="h-full bg-red-500/30 rounded-l-full" style={{ width: `${Math.max(0, -card.consensusScore)}%` }} /></div>
                        <div className="w-1/2"><div className="h-full bg-green-500 rounded-r-full" style={{ width: `${Math.max(0, card.consensusScore)}%` }} /></div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {card.notes.length > 0 && (
                    <div className="space-y-2">
                      {card.notes.map(note => (
                        <div key={note.id} className="bg-slate-800/50 rounded-lg p-3 flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            note.sentiment === 'bullish' ? 'bg-green-400' : note.sentiment === 'bearish' ? 'bg-red-400' : 'bg-slate-400'
                          }`} />
                          <div className="flex-1">
                            <p className="text-slate-300 text-xs">{note.content}</p>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                              <span>@{note.authorHandle}</span>
                              <span>{note.timestamp}</span>
                              <span className="text-cyan-400">{note.upvotes} upvotes</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SharedWatchlists;
