// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import {
  Repeat, Users, TrendingUp, BarChart3, Clock, CheckCircle,
  XCircle, ArrowRightLeft, Star, Timer, Activity, Trophy,
  ChevronRight, Zap, Target, Shield,
} from 'lucide-react';
import {
  getSwapMeetEvents,
  getSwapMeetStats,
  getEventStatusColor,
  getMatchQualityColor,
  getDealStatusColor,
  type SwapMeetEvent,
  type SwapMeetStats,
  type TradeMatch,
  type LiveDeal,
  type EventParticipant,
  type EventStatus,
  type MatchQuality,
  type DealStatus,
} from '../lib/utils/swapMeetService.ts';

// ── Helpers ─────────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toLocaleString()}`;
}

function formatFullCurrency(n: number): string {
  return `$${n.toLocaleString()}`;
}

function formatPercent(n: number): string {
  return `${(n * 100).toFixed(0)}%`;
}

function statusBadgeBg(status: EventStatus): string {
  switch (status) {
    case 'live': return 'bg-green-500/20 border-green-500/30';
    case 'scheduled': return 'bg-blue-500/20 border-blue-500/30';
    case 'registration': return 'bg-cyan-500/20 border-cyan-500/30';
    case 'matching': return 'bg-purple-500/20 border-purple-500/30';
    case 'closing': return 'bg-yellow-500/20 border-yellow-500/30';
    case 'completed': return 'bg-slate-500/20 border-slate-500/30';
  }
}

function matchQualityBg(quality: MatchQuality): string {
  switch (quality) {
    case 'perfect': return 'bg-green-500/10 border-green-500/20';
    case 'strong': return 'bg-blue-500/10 border-blue-500/20';
    case 'moderate': return 'bg-yellow-500/10 border-yellow-500/20';
    case 'weak': return 'bg-orange-500/10 border-orange-500/20';
  }
}

function dealStatusBg(status: DealStatus): string {
  switch (status) {
    case 'proposed': return 'bg-blue-500/10';
    case 'negotiating': return 'bg-yellow-500/10';
    case 'accepted': return 'bg-cyan-500/10';
    case 'declined': return 'bg-red-500/10';
    case 'completed': return 'bg-green-500/10';
  }
}

function dealStatusIcon(status: DealStatus) {
  switch (status) {
    case 'proposed': return <Clock size={14} className="text-blue-400" />;
    case 'negotiating': return <ArrowRightLeft size={14} className="text-yellow-400" />;
    case 'accepted': return <CheckCircle size={14} className="text-cyan-400" />;
    case 'declined': return <XCircle size={14} className="text-red-400" />;
    case 'completed': return <CheckCircle size={14} className="text-green-400" />;
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

// ── Component ───────────────────────────────────────────────────────────────────

const SwapMeet: React.FC = () => {
  const [events, setEvents] = useState<SwapMeetEvent[]>([]);
  const [stats, setStats] = useState<SwapMeetStats | null>(null);
  const [selectedEventIdx, setSelectedEventIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setEvents(getSwapMeetEvents());
      setStats(getSwapMeetStats());
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  const selectedEvent = events[selectedEventIdx] ?? null;

  const completedDeals = useMemo(() => {
    if (!selectedEvent) return [];
    return selectedEvent.liveDeals.filter(d => d.status === 'completed');
  }, [selectedEvent]);

  const activeDeals = useMemo(() => {
    if (!selectedEvent) return [];
    return selectedEvent.liveDeals.filter(d => d.status !== 'completed' && d.status !== 'declined');
  }, [selectedEvent]);

  const topTraders = useMemo(() => {
    if (!selectedEvent) return [];
    return [...selectedEvent.participants].sort((a, b) => b.totalTradeValue - a.totalTradeValue);
  }, [selectedEvent]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Swap Meet Engine...</p>
        </div>
      </div>
    );
  }

  if (!stats || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <XCircle size={48} className="text-red-400 mb-4" />
        <p className="text-red-400 font-medium text-lg">Failed to load swap meet data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/20">
            <Repeat size={24} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Swap Meet & Trade Night Engine</h1>
            <p className="text-sm text-slate-400">Scheduled virtual trade events with auto-matching, live deal rooms & analytics</p>
          </div>
        </div>
        {selectedEvent?.status === 'live' && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-green-400 text-sm font-medium">Event Live</span>
          </div>
        )}
      </div>

      {/* ── Stats Row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Events Hosted', value: stats.eventsHosted.toString(), icon: <BarChart3 size={18} className="text-purple-400" />, sub: `${stats.upcomingEvents} upcoming`, color: 'purple' },
          { label: 'Total Participants', value: stats.totalParticipants.toLocaleString(), icon: <Users size={18} className="text-blue-400" />, sub: `${formatPercent(stats.avgMatchRate)} match rate`, color: 'blue' },
          { label: 'Deals Completed', value: stats.totalDealsCompleted.toLocaleString(), icon: <CheckCircle size={18} className="text-green-400" />, sub: `${formatPercent(stats.avgDealCompletionRate)} completion rate`, color: 'green' },
          { label: 'Trade Volume', value: formatCurrency(stats.totalTradeVolume), icon: <TrendingUp size={18} className="text-amber-400" />, sub: `Best event: ${formatCurrency(stats.bestEventVolume)}`, color: 'amber' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              {kpi.icon}
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">{kpi.label}</span>
            </div>
            <p className="text-2xl font-bold text-slate-100">{kpi.value}</p>
            <p className="text-xs text-slate-500 mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Event Selector Tabs ─────────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {events.map((evt, idx) => (
          <button
            key={evt.id}
            onClick={() => setSelectedEventIdx(idx)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap border ${
              idx === selectedEventIdx
                ? 'bg-slate-800 border-slate-700 text-slate-100'
                : 'bg-slate-900/50 border-slate-800/50 text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'
            }`}
          >
            <span className={`inline-block w-2 h-2 rounded-full ${
              evt.status === 'live' ? 'bg-green-500 animate-pulse' :
              evt.status === 'scheduled' ? 'bg-blue-500' : 'bg-slate-500'
            }`} />
            <span>{evt.name}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded border ${statusBadgeBg(evt.status)} ${getEventStatusColor(evt.status)}`}>
              {evt.status}
            </span>
          </button>
        ))}
      </div>

      {/* ── Selected Event Detail ───────────────────────────────────────────── */}
      {selectedEvent && (
        <div className="space-y-6">
          {/* Event Info Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100">{selectedEvent.name}</h2>
                <p className="text-sm text-slate-400">{selectedEvent.theme}</p>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock size={14} />
                  <span>{formatDate(selectedEvent.scheduledDate)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Timer size={14} />
                  <span>{selectedEvent.duration}min</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Users size={14} />
                  <span>{selectedEvent.registeredCount}/{selectedEvent.maxParticipants}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Shield size={14} />
                  <span>Host: {selectedEvent.hostHandle}</span>
                </div>
              </div>
            </div>

            {/* Event KPIs */}
            {(selectedEvent.status === 'live' || selectedEvent.status === 'completed') && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Trade Volume</p>
                  <p className="text-lg font-bold text-slate-100">{formatFullCurrency(selectedEvent.totalTradeVolume)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Completion Rate</p>
                  <p className="text-lg font-bold text-slate-100">{formatPercent(selectedEvent.dealCompletionRate)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Avg Deal Value</p>
                  <p className="text-lg font-bold text-slate-100">{formatFullCurrency(selectedEvent.avgDealValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Matches Found</p>
                  <p className="text-lg font-bold text-slate-100">{selectedEvent.matches.length}</p>
                </div>
              </div>
            )}
          </div>

          {/* Two-Column Layout: Matches + Deals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ── Match Board ─────────────────────────────────────────────── */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
                <Target size={16} className="text-purple-400" />
                <h3 className="text-sm font-semibold text-slate-200">Match Board</h3>
                <span className="ml-auto text-xs text-slate-500">{selectedEvent.matches.length} matches</span>
              </div>
              <div className="divide-y divide-slate-800 max-h-[520px] overflow-y-auto">
                {selectedEvent.matches.map((match) => (
                  <div key={match.id} className={`p-4 ${matchQualityBg(match.matchQuality)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-200">{match.memberA}</span>
                        <ArrowRightLeft size={12} className="text-slate-500" />
                        <span className="text-sm font-semibold text-slate-200">{match.memberB}</span>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                        matchQualityBg(match.matchQuality)} ${getMatchQualityColor(match.matchQuality)}`}>
                        {match.matchQuality}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs mb-2">
                      <div>
                        <p className="text-slate-500 mb-1">Offers:</p>
                        {match.memberAOffers.map((c, i) => (
                          <p key={i} className="text-slate-300 truncate">{c}</p>
                        ))}
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Wants:</p>
                        {match.memberBOffers.map((c, i) => (
                          <p key={i} className="text-slate-300 truncate">{c}</p>
                        ))}
                      </div>
                    </div>
                    {match.estimatedValueDiff > 0 && (
                      <p className="text-xs text-slate-500">
                        Value diff: <span className="text-amber-400">{formatFullCurrency(match.estimatedValueDiff)}</span>
                      </p>
                    )}
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{match.matchReason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Deal Room Feed ───────────────────────────────────────────── */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
                <Activity size={16} className="text-green-400" />
                <h3 className="text-sm font-semibold text-slate-200">
                  {selectedEvent.status === 'live' ? 'Active Deal Room' : 'Deal History'}
                </h3>
                <span className="ml-auto text-xs text-slate-500">{selectedEvent.liveDeals.length} deals</span>
              </div>
              <div className="divide-y divide-slate-800 max-h-[520px] overflow-y-auto">
                {selectedEvent.liveDeals.map((deal) => (
                  <div key={deal.id} className={`p-4 ${dealStatusBg(deal.status)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {dealStatusIcon(deal.status)}
                        <span className="text-sm font-semibold text-slate-200">{deal.proposer}</span>
                        <ChevronRight size={12} className="text-slate-600" />
                        <span className="text-sm font-semibold text-slate-200">{deal.responder}</span>
                      </div>
                      <span className={`text-xs font-medium ${getDealStatusColor(deal.status)}`}>
                        {deal.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs mb-2">
                      <div>
                        <p className="text-slate-500 mb-1">Offering:</p>
                        {deal.offeredCards.map((c, i) => (
                          <p key={i} className="text-slate-300 truncate">{c}</p>
                        ))}
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Requesting:</p>
                        {deal.requestedCards.map((c, i) => (
                          <p key={i} className="text-slate-300 truncate">{c}</p>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      {deal.cashDiff !== null && deal.cashDiff > 0 ? (
                        <span>Cash balancer: <span className="text-amber-400">+{formatFullCurrency(deal.cashDiff)}</span></span>
                      ) : (
                        <span>Even trade</span>
                      )}
                      <span>{formatDate(deal.timestamp)}</span>
                    </div>
                    {deal.completedAt && (
                      <p className="text-xs text-green-400/70 mt-1">Completed: {formatDate(deal.completedAt)}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Participant Status ───────────────────────────────────────────── */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
              <Users size={16} className="text-blue-400" />
              <h3 className="text-sm font-semibold text-slate-200">
                {selectedEvent.status === 'completed' ? 'Top Traders' : 'Participant Status'}
              </h3>
              <span className="ml-auto text-xs text-slate-500">{selectedEvent.participants.length} participants</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
                      {selectedEvent.status === 'completed' ? 'Rank' : '#'}
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide">Trader</th>
                    <th className="text-center px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide">Listed</th>
                    <th className="text-center px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide">Matches</th>
                    <th className="text-center px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide">Deals</th>
                    <th className="text-right px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide">Volume</th>
                    <th className="text-center px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {topTraders.map((p, idx) => (
                    <tr key={p.userId} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 text-slate-400">
                        {idx === 0 && selectedEvent.status === 'completed' ? (
                          <Trophy size={14} className="text-amber-400" />
                        ) : (
                          <span className="text-xs">{idx + 1}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-slate-200 font-medium">{p.handle}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-400">{p.itemsListed}</td>
                      <td className="px-4 py-3 text-center text-slate-400">{p.matchesFound}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={p.dealsCompleted > 0 ? 'text-green-400' : 'text-slate-500'}>
                          {p.dealsCompleted}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={p.totalTradeValue > 0 ? 'text-slate-200 font-medium' : 'text-slate-500'}>
                          {p.totalTradeValue > 0 ? formatFullCurrency(p.totalTradeValue) : '--'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star size={12} className="text-amber-400" />
                          <span className="text-slate-300">{p.rating}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Completed Event Summary Analytics ─────────────────────────────── */}
          {selectedEvent.status === 'completed' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={16} className="text-amber-400" />
                <h3 className="text-sm font-semibold text-slate-200">Post-Event Summary</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Total Volume</p>
                  <p className="text-xl font-bold text-slate-100">{formatFullCurrency(selectedEvent.totalTradeVolume)}</p>
                </div>
                <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Deals Closed</p>
                  <p className="text-xl font-bold text-green-400">{completedDeals.length}</p>
                  <p className="text-xs text-slate-500">{selectedEvent.liveDeals.length} total proposed</p>
                </div>
                <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Completion Rate</p>
                  <p className="text-xl font-bold text-blue-400">{formatPercent(selectedEvent.dealCompletionRate)}</p>
                </div>
                <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Avg Deal Value</p>
                  <p className="text-xl font-bold text-amber-400">{formatFullCurrency(selectedEvent.avgDealValue)}</p>
                </div>
              </div>
              {selectedEvent.nextEvent && (
                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-2 text-sm text-slate-400">
                  <Clock size={14} />
                  <span>Next event: <span className="text-slate-200 font-medium">{formatDate(selectedEvent.nextEvent)}</span></span>
                </div>
              )}
            </div>
          )}

          {/* ── Live Event: Trade Volume Counter ──────────────────────────────── */}
          {selectedEvent.status === 'live' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Live Trade Volume</p>
                <p className="text-3xl font-bold text-green-400">{formatFullCurrency(selectedEvent.totalTradeVolume)}</p>
                <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all"
                    style={{ width: `${Math.min((selectedEvent.totalTradeVolume / 50000) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Goal: $50,000</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Active Deals</p>
                <p className="text-3xl font-bold text-yellow-400">{activeDeals.length}</p>
                <p className="text-xs text-slate-500 mt-2">{completedDeals.length} completed so far</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Time Remaining</p>
                <p className="text-3xl font-bold text-purple-400">47:22</p>
                <p className="text-xs text-slate-500 mt-2">{selectedEvent.duration}min session</p>
              </div>
            </div>
          )}

          {/* ── Upcoming Event: Registration Preview ──────────────────────────── */}
          {selectedEvent.status === 'scheduled' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Registration</p>
                <p className="text-3xl font-bold text-blue-400">{selectedEvent.registeredCount}/{selectedEvent.maxParticipants}</p>
                <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all"
                    style={{ width: `${(selectedEvent.registeredCount / selectedEvent.maxParticipants) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">{selectedEvent.maxParticipants - selectedEvent.registeredCount} spots remaining</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Pre-Matches Found</p>
                <p className="text-3xl font-bold text-purple-400">{selectedEvent.matches.length}</p>
                <p className="text-xs text-slate-500 mt-2">Based on want/have lists</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Event Duration</p>
                <p className="text-3xl font-bold text-slate-200">{selectedEvent.duration}<span className="text-lg text-slate-500">min</span></p>
                <p className="text-xs text-slate-500 mt-2">Starts {formatDate(selectedEvent.scheduledDate)}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SwapMeet;
