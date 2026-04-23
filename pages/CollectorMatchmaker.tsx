// @ts-nocheck
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users, Heart, ArrowLeftRight, Star, Shield, Zap, Target, Bell,
  ChevronLeft, ChevronRight, MessageSquare, Check, X, ThumbsUp,
  ThumbsDown, Send, Settings, TrendingUp, Trophy, Search, Eye,
  BarChart3, Layers, Handshake, Scale, Clock, Award, Filter,
  AlertCircle, ArrowRight, Package, UserCheck, Sparkles,
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  Cell,
} from 'recharts';
import {
  findMatches, getMatchDetails, getTradeProposals, getMyProfile,
  getCollectionGaps, getCollectionSurplus, getMatchHistory,
  getNashEquilibrium, getMatchPreferences, updatePreferences,
  getMatchNotifications, evaluateTradeEquity, getLeaderboard,
  formatCurrency,
  type MatchResult, type TradeProposal, type CollectorProfile,
  type CollectionGap, type CollectorSurplus, type MatchHistory,
  type NashEquilibrium, type MatchPreference, type MatchNotification,
  type TradeEquity, type ProposalCard,
} from '../lib/core/collectorMatchmakerService';

type TabId = 'discover' | 'proposals' | 'gaps' | 'history' | 'leaderboard' | 'notifications' | 'preferences';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'discover', label: 'Discover', icon: <Heart size={16} /> },
  { id: 'proposals', label: 'Proposals', icon: <ArrowLeftRight size={16} /> },
  { id: 'gaps', label: 'Gaps', icon: <Target size={16} /> },
  { id: 'history', label: 'History', icon: <Clock size={16} /> },
  { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={16} /> },
  { id: 'notifications', label: 'Alerts', icon: <Bell size={16} /> },
  { id: 'preferences', label: 'Prefs', icon: <Settings size={16} /> },
];

const CHART_COLORS = ['#10b981', '#60a5fa', '#f87171', '#a78bfa', '#fbbf24', '#34d399'];

function scoreBadge(score: number) {
  if (score >= 85) return { text: 'Excellent', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
  if (score >= 70) return { text: 'Great', color: 'text-blue-400', bg: 'bg-blue-500/20' };
  if (score >= 50) return { text: 'Good', color: 'text-amber-400', bg: 'bg-amber-500/20' };
  return { text: 'Fair', color: 'text-slate-400', bg: 'bg-slate-500/20' };
}

function styleColor(style: string) {
  if (style === 'aggressive') return 'text-red-400';
  if (style === 'conservative') return 'text-blue-400';
  return 'text-emerald-400';
}

function statusBadge(status: string) {
  switch (status) {
    case 'proposed': return { color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Pending' };
    case 'accepted': return { color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'Accepted' };
    case 'countered': return { color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Countered' };
    case 'declined': return { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Declined' };
    default: return { color: 'text-slate-400', bg: 'bg-slate-500/20', label: status };
  }
}

function fairnessColor(score: number) {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-blue-500';
  if (score >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

const CollectorMatchmaker: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('discover');
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [proposals, setProposals] = useState<TradeProposal[]>([]);
  const [myProfile, setMyProfile] = useState<CollectorProfile | null>(null);
  const [gaps, setGaps] = useState<CollectionGap[]>([]);
  const [surplus, setSurplus] = useState<CollectorSurplus[]>([]);
  const [history, setHistory] = useState<MatchHistory[]>([]);
  const [preferences, setPreferences] = useState<MatchPreference | null>(null);
  const [notifications, setNotifications] = useState<MatchNotification[]>([]);
  const [currentMatchIdx, setCurrentMatchIdx] = useState(0);
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
  const [nashData, setNashData] = useState<NashEquilibrium | null>(null);
  const [showTradeBuilder, setShowTradeBuilder] = useState(false);
  const [builderOffered, setBuilderOffered] = useState<ProposalCard[]>([]);
  const [builderRequested, setBuilderRequested] = useState<ProposalCard[]>([]);
  const [liveEquity, setLiveEquity] = useState<TradeEquity | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<{ profile: CollectorProfile; score: number }[]>([]);

  useEffect(() => {
    try {
      setMatches(findMatches());
      setProposals(getTradeProposals());
      setMyProfile(getMyProfile());
      setGaps(getCollectionGaps());
      setSurplus(getCollectionSurplus());
      setHistory(getMatchHistory());
      setPreferences(getMatchPreferences());
      setNotifications(getMatchNotifications());
      setLeaderboardData(getLeaderboard());
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  const currentMatch = useMemo(() => matches[currentMatchIdx] ?? null, [matches, currentMatchIdx]);

  const unreadNotifs = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  const pendingProposals = useMemo(() => proposals.filter(p => p.status === 'proposed' || p.status === 'countered').length, [proposals]);

  const handleSelectMatch = useCallback((match: MatchResult) => {
    setSelectedMatch(match);
    setNashData(getNashEquilibrium(match.matchId));
    setShowTradeBuilder(false);
    setBuilderOffered([]);
    setBuilderRequested([]);
    setLiveEquity(null);
  }, []);

  const handleNextMatch = useCallback(() => {
    setCurrentMatchIdx(prev => Math.min(prev + 1, matches.length - 1));
  }, [matches.length]);

  const handlePrevMatch = useCallback(() => {
    setCurrentMatchIdx(prev => Math.max(prev - 1, 0));
  }, []);

  const toggleBuilderCard = useCallback((card: ProposalCard, side: 'offer' | 'request') => {
    if (side === 'offer') {
      setBuilderOffered(prev => {
        const exists = prev.find(c => c.id === card.id);
        const next = exists ? prev.filter(c => c.id !== card.id) : [...prev, card];
        const eq = evaluateTradeEquity({ id: '', matchId: '', offeredCards: next, requestedCards: builderRequested, equityDelta: 0, fairnessScore: 0, status: 'proposed', messages: [], createdAt: '', updatedAt: '', proposedBy: '' });
        setLiveEquity(eq);
        return next;
      });
    } else {
      setBuilderRequested(prev => {
        const exists = prev.find(c => c.id === card.id);
        const next = exists ? prev.filter(c => c.id !== card.id) : [...prev, card];
        const eq = evaluateTradeEquity({ id: '', matchId: '', offeredCards: builderOffered, requestedCards: next, equityDelta: 0, fairnessScore: 0, status: 'proposed', messages: [], createdAt: '', updatedAt: '', proposedBy: '' });
        setLiveEquity(eq);
        return next;
      });
    }
  }, [builderOffered, builderRequested]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-lg">Finding your best matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
              <Handshake size={28} />
            </div>
            Collector Matchmaker
          </h1>
          <p className="text-slate-400 mt-1">Nash equilibrium-optimized trading partner matching</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 flex items-center gap-2">
            <Users size={16} className="text-emerald-400" />
            <span className="text-slate-300 text-sm">{matches.length} Matches</span>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 flex items-center gap-2">
            <ArrowLeftRight size={16} className="text-blue-400" />
            <span className="text-slate-300 text-sm">{pendingProposals} Pending</span>
          </div>
          {unreadNotifs > 0 && (
            <button onClick={() => setActiveTab('notifications')} className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-2 flex items-center gap-2 hover:bg-red-500/30 transition-colors">
              <Bell size={16} className="text-red-400" />
              <span className="text-red-300 text-sm">{unreadNotifs} New</span>
            </button>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Your Rating', value: myProfile?.rating.toFixed(1) ?? '—', icon: <Star size={18} />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Completed Trades', value: myProfile?.completedTrades ?? 0, icon: <Check size={18} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Response Rate', value: `${myProfile?.responseRate ?? 0}%`, icon: <Zap size={18} />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Collection Value', value: formatCurrency(myProfile?.totalValue ?? 0), icon: <TrendingUp size={18} />, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map(stat => (
          <div key={stat.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-lg ${stat.bg} ${stat.color}`}>{stat.icon}</div>
              <span className="text-slate-400 text-xs">{stat.label}</span>
            </div>
            <p className="text-xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-slate-700">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSelectedMatch(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === tab.id ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.id === 'notifications' && unreadNotifs > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{unreadNotifs}</span>
            )}
            {tab.id === 'proposals' && pendingProposals > 0 && (
              <span className="bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{pendingProposals}</span>
            )}
          </button>
        ))}
      </div>

      {/* ===================== DISCOVER TAB ===================== */}
      {activeTab === 'discover' && !selectedMatch && (
        <div className="space-y-6">
          {/* Match Card - Swipe-style */}
          {currentMatch && (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Profile Card */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-5xl">{currentMatch.collector2.avatar}</div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">{currentMatch.collector2.alias}</h2>
                          <p className="text-slate-400 text-sm">{currentMatch.collector2.location} · {currentMatch.collector2.totalCards.toLocaleString()} cards</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Star size={14} className="text-amber-400 fill-amber-400" />
                            <span className="text-amber-400 text-sm font-medium">{currentMatch.collector2.rating}</span>
                            <span className="text-slate-500 text-xs">· {currentMatch.collector2.completedTrades} trades</span>
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1.5 rounded-full ${scoreBadge(currentMatch.compatibilityScore).bg}`}>
                        <span className={`text-lg font-bold ${scoreBadge(currentMatch.compatibilityScore).color}`}>
                          {currentMatch.compatibilityScore}%
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-300 text-sm italic">"{currentMatch.collector2.bio}"</p>

                    <div className="flex flex-wrap gap-2">
                      {currentMatch.collector2.collectionFocus.sports.map(s => (
                        <span key={s} className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-full">{s}</span>
                      ))}
                      {currentMatch.collector2.collectionFocus.eras.map(e => (
                        <span key={e} className="bg-blue-500/10 text-blue-400 text-xs px-2.5 py-1 rounded-full">{e}</span>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-slate-900 rounded-lg p-3">
                        <p className="text-xs text-slate-400">Style</p>
                        <p className={`text-sm font-medium capitalize ${styleColor(currentMatch.collector2.tradingStyle)}`}>{currentMatch.collector2.tradingStyle}</p>
                      </div>
                      <div className="bg-slate-900 rounded-lg p-3">
                        <p className="text-xs text-slate-400">Response</p>
                        <p className="text-sm font-medium text-white">{currentMatch.collector2.responseRate}%</p>
                      </div>
                      <div className="bg-slate-900 rounded-lg p-3">
                        <p className="text-xs text-slate-400">Value</p>
                        <p className="text-sm font-medium text-white">{formatCurrency(currentMatch.collector2.totalValue)}</p>
                      </div>
                    </div>

                    {/* Match Reason */}
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                      <p className="text-emerald-400 text-sm flex items-center gap-2">
                        <Sparkles size={14} />
                        <span className="font-medium">Why you match:</span> {currentMatch.matchReason}
                      </p>
                    </div>

                    {/* Needs vs Surplus */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">They Need (You Have)</h4>
                        {currentMatch.collector2.needsList.slice(0, 3).map(need => {
                          const youHave = myProfile?.surplusList.find(s => s.player === need.player);
                          return (
                            <div key={need.id} className={`text-sm p-2 rounded mb-1 ${youHave ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-900 text-slate-400'}`}>
                              {need.year} {need.player} {need.set}
                              {youHave && <Check size={12} className="inline ml-2 text-emerald-400" />}
                            </div>
                          );
                        })}
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">You Need (They Have)</h4>
                        {currentMatch.gaps.length > 0 ? currentMatch.gaps.slice(0, 3).map(gap => (
                          <div key={gap.id} className="text-sm p-2 rounded mb-1 bg-blue-500/10 text-blue-300">
                            {gap.description}
                            <Check size={12} className="inline ml-2 text-blue-400" />
                          </div>
                        )) : (
                          <p className="text-slate-500 text-sm p-2">No direct gap fills found</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Radar Chart */}
                  <div className="lg:w-80">
                    <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 text-center">Compatibility Breakdown</h4>
                    <ResponsiveContainer width="100%" height={280}>
                      <RadarChart data={currentMatch.radarData} outerRadius="70%">
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="axis" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="You" dataKey="collector1" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                        <Radar name="Them" dataKey="collector2" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.2} />
                        <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 mt-2">
                      <span className="flex items-center gap-1.5 text-xs text-emerald-400"><span className="w-3 h-3 bg-emerald-500/40 rounded-full inline-block" /> You</span>
                      <span className="flex items-center gap-1.5 text-xs text-blue-400"><span className="w-3 h-3 bg-blue-500/40 rounded-full inline-block" /> {currentMatch.collector2.alias}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="border-t border-slate-700 px-6 py-4 flex items-center justify-between bg-slate-900/50">
                <button onClick={handlePrevMatch} disabled={currentMatchIdx === 0} className="flex items-center gap-2 text-slate-400 hover:text-white disabled:opacity-30 transition-colors">
                  <ChevronLeft size={18} /> Previous
                </button>
                <div className="flex items-center gap-3">
                  <button onClick={handleNextMatch} className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors">
                    <ThumbsDown size={16} /> Pass
                  </button>
                  <button onClick={() => handleSelectMatch(currentMatch)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors font-medium">
                    <ThumbsUp size={16} /> View & Trade
                  </button>
                </div>
                <div className="text-slate-500 text-sm">{currentMatchIdx + 1} / {matches.length}</div>
              </div>
            </div>
          )}

          {/* All Matches Grid */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users size={18} className="text-emerald-400" /> All Matches
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {matches.map(match => (
                <button key={match.matchId} onClick={() => handleSelectMatch(match)}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-left hover:border-emerald-500/50 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{match.collector2.avatar}</span>
                      <div>
                        <p className="text-white font-medium group-hover:text-emerald-400 transition-colors">{match.collector2.alias}</p>
                        <p className="text-slate-500 text-xs">{match.collector2.location}</p>
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${scoreBadge(match.compatibilityScore).color}`}>
                      {match.compatibilityScore}%
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {match.collector2.collectionFocus.sports.map(s => (
                      <span key={s} className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded">{s}</span>
                    ))}
                  </div>
                  <p className="text-slate-400 text-xs line-clamp-1">{match.matchReason}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Star size={10} className="text-amber-400" /> {match.collector2.rating}</span>
                    <span>{match.collector2.completedTrades} trades</span>
                    <span className={`capitalize ${styleColor(match.collector2.tradingStyle)}`}>{match.collector2.tradingStyle}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================== SELECTED MATCH DETAIL ===================== */}
      {activeTab === 'discover' && selectedMatch && (
        <div className="space-y-6">
          <button onClick={() => { setSelectedMatch(null); setShowTradeBuilder(false); }} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
            <ChevronLeft size={16} /> Back to matches
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile + Radar */}
            <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{selectedMatch.collector2.avatar}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedMatch.collector2.alias}</h2>
                    <p className="text-slate-400 text-sm">{selectedMatch.collector2.location} · Joined {new Date(selectedMatch.collector2.joinedDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${scoreBadge(selectedMatch.compatibilityScore).color}`}>{selectedMatch.compatibilityScore}%</div>
                  <p className={`text-xs ${scoreBadge(selectedMatch.compatibilityScore).color}`}>{scoreBadge(selectedMatch.compatibilityScore).text} Match</p>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={selectedMatch.radarData} outerRadius="70%">
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="axis" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="You" dataKey="collector1" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
                  <Radar name={selectedMatch.collector2.alias} dataKey="collector2" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.25} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
                </RadarChart>
              </ResponsiveContainer>

              <div className="flex justify-center gap-6">
                <span className="flex items-center gap-2 text-sm text-emerald-400"><span className="w-3 h-3 bg-emerald-500/40 rounded-full" /> You</span>
                <span className="flex items-center gap-2 text-sm text-blue-400"><span className="w-3 h-3 bg-blue-500/40 rounded-full" /> {selectedMatch.collector2.alias}</span>
              </div>
            </div>

            {/* Nash Equilibrium */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Scale size={16} className="text-purple-400" /> Nash Equilibrium
              </h3>
              {nashData && (
                <>
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                    <p className="text-purple-300 text-sm">{nashData.explanation}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Equilibrium Value</span>
                      <span className="text-white font-medium">{formatCurrency(nashData.equilibriumValue)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Your Utility</span>
                      <span className="text-emerald-400 font-medium">{formatCurrency(nashData.collector1Utility)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Their Utility</span>
                      <span className="text-blue-400 font-medium">{formatCurrency(nashData.collector2Utility)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Pareto Optimal</span>
                      <span className={nashData.paretoOptimal ? 'text-emerald-400' : 'text-amber-400'}>{nashData.paretoOptimal ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={nashData.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
                      <Bar dataKey="collector1" fill="#10b981" name="You" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="collector2" fill="#60a5fa" name={selectedMatch.collector2.alias} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </>
              )}
              <button onClick={() => setShowTradeBuilder(true)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                <ArrowLeftRight size={16} /> Build a Trade
              </button>
            </div>
          </div>

          {/* Overlaps */}
          {selectedMatch.overlaps.length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
                <Layers size={16} className="text-blue-400" /> Collection Overlaps
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {selectedMatch.overlaps.map(overlap => (
                  <div key={overlap.id} className="bg-slate-900 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium text-sm">{overlap.area}</span>
                      <span className="text-blue-400 text-sm font-medium">{overlap.overlapPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5 mb-2">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${overlap.overlapPercentage}%` }} />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {overlap.sharedInterests.slice(0, 4).map((s, i) => (
                        <span key={i} className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trade Builder */}
          {showTradeBuilder && selectedMatch && (
            <div className="bg-slate-800 border border-emerald-500/30 rounded-xl p-6 space-y-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Package size={16} className="text-emerald-400" /> Trade Proposal Builder
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Your Offering */}
                <div>
                  <h4 className="text-sm font-medium text-emerald-400 mb-3 flex items-center gap-2">
                    <ArrowRight size={14} /> You Offer ({builderOffered.length} cards · {formatCurrency(builderOffered.reduce((s, c) => s + c.estimatedValue, 0))})
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {myProfile?.surplusList.map(card => {
                      const isSelected = builderOffered.some(c => c.id === card.id);
                      const pc: ProposalCard = { id: card.id, player: card.player, year: card.year, set: card.set, sport: card.sport, condition: card.condition, estimatedValue: card.estimatedValue };
                      return (
                        <button key={card.id} onClick={() => toggleBuilderCard(pc, 'offer')}
                          className={`w-full text-left p-3 rounded-lg border transition-all ${isSelected ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-slate-900 border-slate-700 hover:border-slate-600'}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white text-sm font-medium">{card.year} {card.player}</p>
                              <p className="text-slate-400 text-xs">{card.set} · {card.condition}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-emerald-400 text-sm font-medium">{formatCurrency(card.estimatedValue)}</p>
                              {isSelected && <Check size={14} className="text-emerald-400 ml-auto" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* You Request */}
                <div>
                  <h4 className="text-sm font-medium text-blue-400 mb-3 flex items-center gap-2">
                    <ArrowRight size={14} className="rotate-180" /> You Request ({builderRequested.length} cards · {formatCurrency(builderRequested.reduce((s, c) => s + c.estimatedValue, 0))})
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedMatch.collector2.surplusList.map(card => {
                      const isSelected = builderRequested.some(c => c.id === card.id);
                      const pc: ProposalCard = { id: card.id, player: card.player, year: card.year, set: card.set, sport: card.sport, condition: card.condition, estimatedValue: card.estimatedValue };
                      return (
                        <button key={card.id} onClick={() => toggleBuilderCard(pc, 'request')}
                          className={`w-full text-left p-3 rounded-lg border transition-all ${isSelected ? 'bg-blue-500/20 border-blue-500/50' : 'bg-slate-900 border-slate-700 hover:border-slate-600'}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white text-sm font-medium">{card.year} {card.player}</p>
                              <p className="text-slate-400 text-xs">{card.set} · {card.condition}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-blue-400 text-sm font-medium">{formatCurrency(card.estimatedValue)}</p>
                              {isSelected && <Check size={14} className="text-blue-400 ml-auto" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Equity Meter */}
              {liveEquity && (
                <div className="bg-slate-900 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-medium flex items-center gap-2">
                      <Scale size={14} className="text-purple-400" /> Equity Meter
                    </h4>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      liveEquity.recommendation === 'great_deal' ? 'bg-emerald-500/20 text-emerald-400' :
                      liveEquity.recommendation === 'fair' ? 'bg-blue-500/20 text-blue-400' :
                      liveEquity.recommendation === 'slightly_uneven' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {liveEquity.recommendation === 'great_deal' ? 'Great Deal' :
                       liveEquity.recommendation === 'fair' ? 'Fair Trade' :
                       liveEquity.recommendation === 'slightly_uneven' ? 'Slightly Uneven' : 'Unfair'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Offering: {formatCurrency(liveEquity.offeredTotal)}</span>
                        <span>Requesting: {formatCurrency(liveEquity.requestedTotal)}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                        <div className={`h-3 rounded-full transition-all ${fairnessColor(liveEquity.fairnessScore)}`} style={{ width: `${liveEquity.fairnessScore}%` }} />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{liveEquity.adjustmentSuggestion}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{liveEquity.fairnessScore}</p>
                      <p className="text-xs text-slate-400">Fairness</p>
                    </div>
                  </div>
                  <button disabled={builderOffered.length === 0 && builderRequested.length === 0}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Send size={16} /> Send Proposal
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===================== PROPOSALS TAB ===================== */}
      {activeTab === 'proposals' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <ArrowLeftRight size={18} className="text-blue-400" /> Trade Proposals
          </h3>
          {proposals.length === 0 ? (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
              <ArrowLeftRight size={48} className="text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No trade proposals yet. Find a match and start trading!</p>
            </div>
          ) : (
            proposals.map(proposal => {
              const sb = statusBadge(proposal.status);
              const match = matches.find(m => m.matchId === proposal.matchId);
              return (
                <div key={proposal.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{match?.collector2.avatar ?? '🃏'}</span>
                      <div>
                        <p className="text-white font-medium">{proposal.proposedBy === 'me' ? `To ${match?.collector2.alias ?? 'Unknown'}` : `From ${match?.collector2.alias ?? 'Unknown'}`}</p>
                        <p className="text-slate-500 text-xs">{new Date(proposal.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${sb.bg} ${sb.color}`}>{sb.label}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-2">Offered</h4>
                      {proposal.offeredCards.length > 0 ? proposal.offeredCards.map(card => (
                        <div key={card.id} className="bg-slate-900 rounded-lg p-2 mb-1 flex justify-between">
                          <span className="text-slate-300 text-sm">{card.year} {card.player} - {card.set}</span>
                          <span className="text-emerald-400 text-sm">{formatCurrency(card.estimatedValue)}</span>
                        </div>
                      )) : <p className="text-slate-500 text-sm">No cards offered yet</p>}
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-blue-400 uppercase tracking-wider mb-2">Requested</h4>
                      {proposal.requestedCards.map(card => (
                        <div key={card.id} className="bg-slate-900 rounded-lg p-2 mb-1 flex justify-between">
                          <span className="text-slate-300 text-sm">{card.year} {card.player} - {card.set}</span>
                          <span className="text-blue-400 text-sm">{formatCurrency(card.estimatedValue)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Fairness Score</span>
                        <span>{proposal.fairnessScore}/100</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className={`h-2 rounded-full ${fairnessColor(proposal.fairnessScore)}`} style={{ width: `${proposal.fairnessScore}%` }} />
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${proposal.equityDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {proposal.equityDelta >= 0 ? '+' : ''}{formatCurrency(proposal.equityDelta)} delta
                    </span>
                  </div>

                  {/* Messages */}
                  {proposal.messages.length > 0 && (
                    <div className="border-t border-slate-700 pt-3 space-y-2">
                      <h4 className="text-xs font-medium text-slate-400 flex items-center gap-1"><MessageSquare size={12} /> Messages</h4>
                      {proposal.messages.map(msg => (
                        <div key={msg.id} className={`p-2 rounded-lg text-sm ${msg.senderId === 'me' ? 'bg-emerald-500/10 text-emerald-300 ml-8' : 'bg-slate-900 text-slate-300 mr-8'}`}>
                          <span className="font-medium text-xs block mb-0.5">{msg.senderAlias}</span>
                          {msg.text}
                        </div>
                      ))}
                    </div>
                  )}

                  {(proposal.status === 'proposed' && proposal.proposedBy !== 'me') && (
                    <div className="flex gap-2 pt-2">
                      <button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                        <Check size={14} /> Accept
                      </button>
                      <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                        <ArrowLeftRight size={14} /> Counter
                      </button>
                      <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                        <X size={14} /> Decline
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ===================== GAPS TAB ===================== */}
      {activeTab === 'gaps' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Collection Gaps */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Target size={18} className="text-red-400" /> Your Collection Gaps
              </h3>
              {gaps.map(gap => (
                <div key={gap.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-medium">{gap.description}</p>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      gap.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      gap.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-slate-600/20 text-slate-400'
                    }`}>{gap.priority}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                    <span className="bg-slate-700 px-2 py-0.5 rounded">{gap.sport}</span>
                    <span className="bg-slate-700 px-2 py-0.5 rounded">{gap.era}</span>
                    <span>~{formatCurrency(gap.estimatedCost)}</span>
                  </div>
                  {gap.potentialFillers.length > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      <UserCheck size={12} className="text-emerald-400" />
                      <span className="text-emerald-400">Available from: {gap.potentialFillers.join(', ')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Your Surplus */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Package size={18} className="text-emerald-400" /> Your Surplus
              </h3>
              {surplus.map(item => (
                <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-medium">{item.year} {item.player}</p>
                    <span className="text-emerald-400 font-medium">{formatCurrency(item.estimatedValue)}</span>
                  </div>
                  <p className="text-slate-400 text-xs mb-2">{item.set} · {item.sport} · Qty: {item.quantity}</p>
                  {item.interestedCollectors > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      <Eye size={12} className="text-blue-400" />
                      <span className="text-blue-400">{item.interestedCollectors} collector{item.interestedCollectors > 1 ? 's' : ''} interested</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================== HISTORY TAB ===================== */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock size={18} className="text-slate-400" /> Trade History
          </h3>
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-xs font-medium text-slate-400 px-4 py-3 uppercase tracking-wider">Partner</th>
                    <th className="text-left text-xs font-medium text-slate-400 px-4 py-3 uppercase tracking-wider">Date</th>
                    <th className="text-center text-xs font-medium text-slate-400 px-4 py-3 uppercase tracking-wider">Sent</th>
                    <th className="text-center text-xs font-medium text-slate-400 px-4 py-3 uppercase tracking-wider">Received</th>
                    <th className="text-right text-xs font-medium text-slate-400 px-4 py-3 uppercase tracking-wider">Equity</th>
                    <th className="text-center text-xs font-medium text-slate-400 px-4 py-3 uppercase tracking-wider">Rating</th>
                    <th className="text-center text-xs font-medium text-slate-400 px-4 py-3 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{h.partnerAvatar}</span>
                          <span className="text-white text-sm font-medium">{h.partnerAlias}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-sm">{new Date(h.tradeDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-center text-slate-300 text-sm">{h.offeredCount}</td>
                      <td className="px-4 py-3 text-center text-slate-300 text-sm">{h.receivedCount}</td>
                      <td className={`px-4 py-3 text-right text-sm font-medium ${h.equityDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {h.equityDelta >= 0 ? '+' : ''}{formatCurrency(h.equityDelta)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={12} className={i < h.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'} />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          h.outcome === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                          h.outcome === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                          'bg-slate-600/20 text-slate-400'
                        }`}>{h.outcome}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== LEADERBOARD TAB ===================== */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" /> Top Trading Partners
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leaderboardData.map((entry, idx) => (
              <div key={entry.profile.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                  idx === 0 ? 'bg-amber-500/20 text-amber-400' :
                  idx === 1 ? 'bg-slate-400/20 text-slate-300' :
                  idx === 2 ? 'bg-orange-500/20 text-orange-400' :
                  'bg-slate-700 text-slate-400'
                }`}>
                  {idx + 1}
                </div>
                <span className="text-3xl">{entry.profile.avatar}</span>
                <div className="flex-1">
                  <p className="text-white font-medium">{entry.profile.alias}</p>
                  <p className="text-slate-400 text-xs">{entry.profile.location} · {entry.profile.completedTrades} trades</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                    <span className="text-white font-medium">{entry.profile.rating}</span>
                  </div>
                  <p className="text-slate-400 text-xs">Score: {entry.score}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== NOTIFICATIONS TAB ===================== */}
      {activeTab === 'notifications' && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Bell size={18} className="text-blue-400" /> Notifications
          </h3>
          {notifications.map(notif => {
            const iconMap: Record<string, React.ReactNode> = {
              new_match: <Heart size={16} className="text-pink-400" />,
              proposal_received: <ArrowLeftRight size={16} className="text-blue-400" />,
              proposal_accepted: <Check size={16} className="text-emerald-400" />,
              proposal_declined: <X size={16} className="text-red-400" />,
              counter_offer: <ArrowLeftRight size={16} className="text-amber-400" />,
              trade_completed: <Handshake size={16} className="text-emerald-400" />,
              rating_received: <Star size={16} className="text-amber-400" />,
            };
            return (
              <div key={notif.id} className={`bg-slate-800 border rounded-xl p-4 flex items-start gap-3 transition-colors ${
                notif.read ? 'border-slate-700' : 'border-emerald-500/30 bg-emerald-500/5'
              }`}>
                <div className="p-2 bg-slate-700/50 rounded-lg">{iconMap[notif.type] ?? <Bell size={16} className="text-slate-400" />}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium text-sm">{notif.title}</p>
                    {!notif.read && <span className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0" />}
                  </div>
                  <p className="text-slate-400 text-sm mt-0.5">{notif.message}</p>
                  <p className="text-slate-500 text-xs mt-1">{new Date(notif.timestamp).toLocaleString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===================== PREFERENCES TAB ===================== */}
      {activeTab === 'preferences' && preferences && (
        <div className="space-y-6 max-w-2xl">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Settings size={18} className="text-slate-400" /> Match Preferences
          </h3>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-6">
            {/* Sports */}
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">Preferred Sports</label>
              <div className="flex flex-wrap gap-2">
                {(['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'] as const).map(sport => {
                  const active = preferences.preferredSports.includes(sport);
                  return (
                    <button key={sport} onClick={() => {
                      const next = active ? preferences.preferredSports.filter(s => s !== sport) : [...preferences.preferredSports, sport];
                      const updated = { ...preferences, preferredSports: next };
                      setPreferences(updated);
                      updatePreferences({ preferredSports: next });
                    }} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-700 text-slate-400 border border-slate-600 hover:border-slate-500'}`}>
                      {sport}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Eras */}
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">Preferred Eras</label>
              <div className="flex flex-wrap gap-2">
                {['1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'].map(era => {
                  const active = preferences.preferredEras.includes(era);
                  return (
                    <button key={era} onClick={() => {
                      const next = active ? preferences.preferredEras.filter(e => e !== era) : [...preferences.preferredEras, era];
                      const updated = { ...preferences, preferredEras: next };
                      setPreferences(updated);
                      updatePreferences({ preferredEras: next });
                    }} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${active ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' : 'bg-slate-700 text-slate-400 border border-slate-600 hover:border-slate-500'}`}>
                      {era}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trading Style */}
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">Preferred Trading Styles</label>
              <div className="flex gap-2">
                {(['aggressive', 'fair', 'conservative'] as const).map(style => {
                  const active = preferences.tradingStylePreference.includes(style);
                  return (
                    <button key={style} onClick={() => {
                      const next = active ? preferences.tradingStylePreference.filter(s => s !== style) : [...preferences.tradingStylePreference, style];
                      const updated = { ...preferences, tradingStylePreference: next };
                      setPreferences(updated);
                      updatePreferences({ tradingStylePreference: next });
                    }} className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${active ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' : 'bg-slate-700 text-slate-400 border border-slate-600 hover:border-slate-500'}`}>
                      {style}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Min Rating */}
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">Minimum Partner Rating: {preferences.minRating.toFixed(1)}</label>
              <input type="range" min="1" max="5" step="0.5" value={preferences.minRating}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  setPreferences(p => p ? { ...p, minRating: val } : p);
                  updatePreferences({ minRating: val });
                }}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>1.0</span><span>5.0</span>
              </div>
            </div>

            {/* Auto Match */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-300 block">Auto-Match</label>
                <p className="text-xs text-slate-500">Automatically suggest new matches based on preferences</p>
              </div>
              <button onClick={() => {
                const next = !preferences.autoMatch;
                setPreferences(p => p ? { ...p, autoMatch: next } : p);
                updatePreferences({ autoMatch: next });
              }} className={`w-12 h-6 rounded-full transition-colors ${preferences.autoMatch ? 'bg-emerald-500' : 'bg-slate-600'}`}>
                <div className={`w-5 h-5 bg-white rounded-full transition-transform transform ${preferences.autoMatch ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {/* Deal Breakers */}
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">Deal Breakers</label>
              <div className="space-y-1">
                {preferences.dealBreakers.map((db, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg">
                    <AlertCircle size={12} /> {db}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectorMatchmaker;
