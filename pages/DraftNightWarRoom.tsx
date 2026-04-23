// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import {
  Radio,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  DollarSign,
  Award,
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Circle,
  Activity,
  Zap,
  ShoppingCart,
  Eye,
} from 'lucide-react';
import {
  getDraftWarRooms,
  getDraftWarRoomStats,
  getDraftStatusColor,
  getPredictionColor,
  type DraftWarRoom as DraftWarRoomType,
  type DraftWarRoomStats,
  type DraftStatus,
  type PredictionOutcome,
  type Prediction,
  type LiveTrade,
  type DraftPick,
  type WarRoomMember,
} from '../lib/utils/draftNightWarRoomService.ts';

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return value >= 0
    ? `$${value.toLocaleString()}`
    : `-$${Math.abs(value).toLocaleString()}`;
}

function formatPnl(value: number | null): string {
  if (value === null) return '—';
  const prefix = value >= 0 ? '+' : '';
  return `${prefix}${formatCurrency(value)}`;
}

function statusBadge(status: DraftStatus): React.ReactNode {
  const color = getDraftStatusColor(status);
  const label = status === 'live' ? 'LIVE' : status === 'pre-draft' ? 'PRE-DRAFT' : 'COMPLETED';
  const dotColor = status === 'live' ? 'bg-red-400' : status === 'pre-draft' ? 'bg-amber-400' : 'bg-emerald-400';
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${color}`}>
      <span className={`w-2 h-2 rounded-full ${dotColor} ${status === 'live' ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  );
}

function outcomeBadge(outcome: PredictionOutcome): React.ReactNode {
  const color = getPredictionColor(outcome);
  const Icon = outcome === 'correct' ? CheckCircle2 : outcome === 'incorrect' ? XCircle : Clock;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${color}`}>
      <Icon size={12} />
      {outcome.charAt(0).toUpperCase() + outcome.slice(1)}
    </span>
  );
}

function actionBadge(action: 'buy' | 'sell' | 'hold'): React.ReactNode {
  const styles = {
    buy: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    sell: 'bg-red-500/20 text-red-400 border-red-500/30',
    hold: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold uppercase rounded border ${styles[action]}`}>
      {action}
    </span>
  );
}

function predictionTypeBadge(type: string): React.ReactNode {
  const styles: Record<string, string> = {
    'pick-order': 'bg-blue-500/20 text-blue-400',
    'team-fit': 'bg-purple-500/20 text-purple-400',
    'price-move': 'bg-emerald-500/20 text-emerald-400',
    'sleeper': 'bg-amber-500/20 text-amber-400',
  };
  return (
    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${styles[type] || 'bg-slate-700 text-slate-300'}`}>
      {type.replace('-', ' ')}
    </span>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

const DraftWarRoom: React.FC = () => {
  const [rooms, setRooms] = useState<DraftWarRoomType[]>([]);
  const [stats, setStats] = useState<DraftWarRoomStats | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const warRooms = getDraftWarRooms();
      const warRoomStats = getDraftWarRoomStats();
      setRooms(warRooms);
      setStats(warRoomStats);
      // Default to the live room, or first room
      const liveRoom = warRooms.find(r => r.status === 'live');
      setSelectedRoomId(liveRoom?.id || warRooms[0]?.id || '');
      setLoading(false);
    } catch {
      setError('Failed to load Draft War Room data');
      setLoading(false);
    }
  }, []);

  const selectedRoom = useMemo(
    () => rooms.find(r => r.id === selectedRoomId) || null,
    [rooms, selectedRoomId],
  );

  const sortedPredictions = useMemo(() => {
    if (!selectedRoom) return [];
    return [...selectedRoom.predictions].sort((a, b) => b.points - a.points);
  }, [selectedRoom]);

  const memberLeaderboard = useMemo(() => {
    if (!selectedRoom) return [];
    return [...selectedRoom.members].sort((a, b) => b.accuracy - a.accuracy || b.correctPredictions - a.correctPredictions);
  }, [selectedRoom]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-red-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Draft Night War Room...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertTriangle size={48} className="text-red-400 mb-4" />
        <p className="text-red-400 font-medium text-lg">{error ?? 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/20">
            <Radio size={24} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Draft Night War Room</h1>
            <p className="text-sm text-slate-400">
              Live watch parties with real-time card price tracking, prediction markets &amp; position-taking
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats KPI Row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Drafts Attended', value: stats.draftsAttended, icon: BarChart3, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Prediction Accuracy', value: `${stats.predictionAccuracy}%`, icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Live Trades', value: stats.totalLiveTrades, icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Draft Night P&L', value: formatCurrency(stats.draftNightPnL), icon: DollarSign, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-lg ${kpi.bg}`}>
                <kpi.icon size={14} className={kpi.color} />
              </div>
              <span className="text-xs text-slate-400 font-medium">{kpi.label}</span>
            </div>
            <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* ── Room Selector ──────────────────────────────────────────────── */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => setSelectedRoomId(room.id)}
            className={`flex-shrink-0 px-4 py-3 rounded-xl border transition-all text-left min-w-[260px] ${
              selectedRoomId === room.id
                ? 'bg-slate-800 border-red-500/50 ring-1 ring-red-500/20'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-300">{room.draftSport}</span>
              {statusBadge(room.status)}
            </div>
            <p className="text-sm font-semibold text-slate-100 truncate">{room.name}</p>
            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
              <span className="flex items-center gap-1"><Users size={10} /> {room.memberCount}</span>
              <span className="flex items-center gap-1"><Target size={10} /> {room.predictions.length} predictions</span>
              <span className="flex items-center gap-1"><ShoppingCart size={10} /> {room.liveTrades.length} trades</span>
            </div>
          </button>
        ))}
      </div>

      {/* ── Selected Room Content ──────────────────────────────────────── */}
      {selectedRoom && (
        <div className="space-y-6">
          {/* Room Header Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-slate-100">{selectedRoom.name}</h2>
                  {statusBadge(selectedRoom.status)}
                </div>
                <p className="text-xs text-slate-500">
                  Host: <span className="text-slate-300">{selectedRoom.hostHandle}</span>
                  {' | '}Date: <span className="text-slate-300">{selectedRoom.draftDate}</span>
                  {selectedRoom.status === 'live' && (
                    <>
                      {' | '}Pick: <span className="text-red-400 font-bold">{selectedRoom.currentPick}</span>
                      <span className="text-slate-600">/{selectedRoom.totalPicks}</span>
                    </>
                  )}
                </p>
              </div>
              <div className="flex gap-6 text-xs">
                <div className="text-center">
                  <p className="text-slate-500">Pre-Draft Vol</p>
                  <p className="text-slate-200 font-bold">${(selectedRoom.preDraftVolume / 1000).toFixed(0)}K</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-500">Live Vol</p>
                  <p className="text-slate-200 font-bold">
                    {selectedRoom.liveDraftVolume > 0 ? `$${(selectedRoom.liveDraftVolume / 1000).toFixed(0)}K` : '—'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-slate-500">Biggest Mover</p>
                  <p className="text-emerald-400 font-bold text-[11px]">{selectedRoom.biggestMover}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-500">Smallest Move</p>
                  <p className="text-amber-400 font-bold text-[11px]">{selectedRoom.biggestDrop}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* ── Left Column: Pick Feed ──────────────────────────────── */}
            <div className="xl:col-span-2 space-y-6">
              {/* Pick-by-Pick Feed */}
              {selectedRoom.picks.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
                    <Zap size={14} className="text-red-400" />
                    <h3 className="text-sm font-bold text-slate-200">Pick-by-Pick Feed</h3>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full ml-auto">
                      {selectedRoom.picks.length} picks
                    </span>
                  </div>
                  <div className="divide-y divide-slate-800/50 max-h-[480px] overflow-y-auto">
                    {[...selectedRoom.picks].reverse().map((pick) => (
                      <div key={pick.pickNumber} className="px-4 py-3 hover:bg-slate-800/30 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-slate-300">#{pick.pickNumber}</span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-100">
                                {pick.playerName}
                                <span className="text-slate-500 font-normal ml-1.5">{pick.position} — {pick.college}</span>
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                R{pick.round} | {pick.team}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-slate-500 line-through">${pick.preDraftCardPrice}</span>
                              <ArrowUpRight size={12} className="text-emerald-400" />
                              <span className="text-sm font-bold text-emerald-400">${pick.postDraftCardPrice}</span>
                            </div>
                            <p className={`text-xs font-semibold mt-0.5 ${pick.priceMovePercent >= 50 ? 'text-emerald-400' : pick.priceMovePercent >= 30 ? 'text-green-400' : 'text-slate-400'}`}>
                              +{pick.priceMovePercent.toFixed(1)}% ({formatCurrency(pick.priceChange)})
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pre-Draft: Show message when no picks */}
              {selectedRoom.picks.length === 0 && selectedRoom.status === 'pre-draft' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
                  <Clock size={32} className="text-amber-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-200 mb-1">Draft Day is {selectedRoom.draftDate}</h3>
                  <p className="text-sm text-slate-500">
                    The pick feed will go live when the draft starts. In the meantime, place your predictions and pre-position your trades.
                  </p>
                </div>
              )}

              {/* Live Trade Ticker */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
                  <Activity size={14} className="text-purple-400" />
                  <h3 className="text-sm font-bold text-slate-200">Live Trade Ticker</h3>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full ml-auto">
                    {selectedRoom.liveTrades.length} trades
                  </span>
                </div>
                <div className="divide-y divide-slate-800/50 max-h-[360px] overflow-y-auto">
                  {selectedRoom.liveTrades.map((trade) => (
                    <div key={trade.id} className="px-4 py-3 hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {actionBadge(trade.action)}
                          <div>
                            <p className="text-sm font-medium text-slate-200">{trade.cardName}</p>
                            <p className="text-xs text-slate-500">
                              by <span className="text-slate-400">{trade.memberHandle}</span>
                              {trade.pickTrigger && (
                                <> | Triggered at pick #{trade.pickTrigger}</>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-slate-200">{formatCurrency(trade.price)}</p>
                          {trade.pnl !== null && (
                            <p className={`text-xs font-semibold ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {formatPnl(trade.pnl)}
                            </p>
                          )}
                          {trade.pnl === null && (
                            <p className="text-xs text-slate-600">Pending</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right Column: Predictions + Members ─────────────────── */}
            <div className="space-y-6">
              {/* Prediction Leaderboard */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
                  <Target size={14} className="text-amber-400" />
                  <h3 className="text-sm font-bold text-slate-200">Predictions</h3>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full ml-auto">
                    {selectedRoom.predictions.length} total
                  </span>
                </div>
                <div className="divide-y divide-slate-800/50 max-h-[400px] overflow-y-auto">
                  {sortedPredictions.map((pred) => (
                    <div key={pred.id} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          {predictionTypeBadge(pred.type)}
                          <span className="text-xs text-slate-400">{pred.memberHandle}</span>
                        </div>
                        {outcomeBadge(pred.outcome)}
                      </div>
                      <p className="text-sm text-slate-300 mt-1">{pred.content}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-600">
                        {pred.targetPick && <span>Pick #{pred.targetPick}</span>}
                        {pred.points > 0 && <span className="text-emerald-500 font-semibold">+{pred.points} pts</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Member Status */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
                  <Users size={14} className="text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-200">Members</h3>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full ml-auto">
                    {selectedRoom.members.filter(m => m.isOnline).length} online
                  </span>
                </div>
                <div className="divide-y divide-slate-800/50">
                  {memberLeaderboard.map((member, idx) => (
                    <div key={member.userId} className="px-4 py-3 hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                              <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                            </div>
                            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${member.isOnline ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-200">{member.handle}</p>
                            <p className="text-[11px] text-slate-500">
                              {member.correctPredictions}/{member.predictions} correct
                              {member.activeTrades > 0 && <> | {member.activeTrades} active</>}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-300">{member.accuracy.toFixed(1)}%</p>
                          <p className={`text-[11px] font-semibold ${member.profitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {formatPnl(member.profitLoss)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Completed Draft Summary */}
              {selectedRoom.status === 'completed' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
                    <Award size={14} className="text-emerald-400" />
                    <h3 className="text-sm font-bold text-slate-200">Draft Summary</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Total Picks</p>
                        <p className="text-lg font-bold text-slate-200">{selectedRoom.picks.length}</p>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Avg Price Move</p>
                        <p className="text-lg font-bold text-emerald-400">
                          +{(selectedRoom.picks.reduce((s, p) => s + p.priceMovePercent, 0) / selectedRoom.picks.length).toFixed(1)}%
                        </p>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Predictions Hit</p>
                        <p className="text-lg font-bold text-blue-400">
                          {selectedRoom.predictions.filter(p => p.outcome === 'correct').length}/{selectedRoom.predictions.length}
                        </p>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Trade P&L</p>
                        <p className="text-lg font-bold text-emerald-400">
                          {formatCurrency(selectedRoom.liveTrades.reduce((s, t) => s + (t.pnl || 0), 0))}
                        </p>
                      </div>
                    </div>

                    {/* Top Predictions */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Top Predictions</p>
                      {sortedPredictions
                        .filter(p => p.outcome === 'correct')
                        .slice(0, 3)
                        .map((pred, idx) => (
                          <div key={pred.id} className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-bold text-amber-400 w-4">{idx + 1}.</span>
                            <span className="text-xs text-slate-300 flex-1 truncate">{pred.content}</span>
                            <span className="text-[10px] text-emerald-400 font-bold">+{pred.points}</span>
                          </div>
                        ))}
                    </div>

                    {/* P&L Breakdown */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">P&L by Member</p>
                      {selectedRoom.members
                        .filter(m => m.profitLoss !== 0)
                        .sort((a, b) => b.profitLoss - a.profitLoss)
                        .map((m) => (
                          <div key={m.userId} className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-slate-400">{m.handle}</span>
                            <span className={`text-xs font-bold ${m.profitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {formatPnl(m.profitLoss)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftWarRoom;
