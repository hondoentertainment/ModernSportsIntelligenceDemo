import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Users,
  TrendingUp,
  Award,
  Clock,
  ChevronRight,
  BarChart3,
  Star,
  Calendar,
} from 'lucide-react';
import {
  getActiveTournaments,
  getUpcomingTournaments,
  getTournamentLeaderboard,
  getMyEntries,
  getTournamentHistory,
  getWinningStrategies,
  getSeasonalChampionship,
  getTournamentStats,
  tournamentTypeBadgeColor,
  tournamentTypeLabel,
  statusBadgeColor,
  statusLabel,
  rankChangeIndicator,
  type Tournament,
  type TournamentEntry,
  type LeaderboardEntry,
  type TournamentHistory,
  type WinningStrategy,
  type SeasonalChampionship,
} from '../lib/tournamentArenaService.ts';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const TournamentArena: React.FC = () => {
  const [activeTournaments, setActiveTournaments] = useState<Tournament[]>([]);
  const [upcomingTournaments, setUpcomingTournaments] = useState<Tournament[]>([]);
  const [myEntries, setMyEntries] = useState<TournamentEntry[]>([]);
  const [history, setHistory] = useState<TournamentHistory | null>(null);
  const [strategies, setStrategies] = useState<WinningStrategy[]>([]);
  const [championship, setChampionship] = useState<SeasonalChampionship | null>(null);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const active = getActiveTournaments();
      setActiveTournaments(active);
      setUpcomingTournaments(getUpcomingTournaments());
      setMyEntries(getMyEntries());
      setHistory(getTournamentHistory());
      setStrategies(getWinningStrategies());
      setChampionship(getSeasonalChampionship());
      if (active.length > 0) {
        setSelectedTournamentId(active[0].id);
        setLeaderboard(getTournamentLeaderboard(active[0].id));
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  const handleSelectTournament = (id: string) => {
    setSelectedTournamentId(id);
    setLeaderboard(getTournamentLeaderboard(id));
  };

  const selectedEntry = useMemo(
    () => myEntries.find(e => e.tournament_id === selectedTournamentId) ?? null,
    [myEntries, selectedTournamentId]
  );

  const _stats = useMemo(() => getTournamentStats(), []);

  const pnlChartData = useMemo(() => {
    if (!selectedEntry) return [];
    const base = selectedEntry.starting_value;
    return [
      { day: 'Day 1', value: base },
      { day: 'Day 2', value: Math.round(base * 1.035) },
      { day: 'Day 3', value: Math.round(base * 1.08) },
      { day: 'Day 4', value: Math.round(base * 1.065) },
      { day: 'Day 5', value: Math.round(base * 1.12) },
      { day: 'Day 6', value: Math.round(base * 1.16) },
      { day: 'Today', value: selectedEntry.current_value },
    ];
  }, [selectedEntry]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Tournament Arena...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20">
            <Trophy size={24} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Social Trading Tournament Arena</h1>
            <p className="text-sm text-slate-400">
              Compete in paper trading tournaments &mdash; Phase 133
            </p>
          </div>
        </div>
        {myEntries.length > 0 && (
          <span className="px-3 py-1.5 text-sm font-bold bg-emerald-500/20 text-emerald-300 rounded-full">
            {myEntries.length} Active Entries
          </span>
        )}
      </div>

      {/* ─── Summary Cards ──────────────────────────────────────── */}
      {history && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Tournaments Entered</p>
            <p className="text-3xl font-bold text-white">{history.total_entered}</p>
            <p className="text-xs text-slate-600 mt-1">{myEntries.length} active now</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Best Finish</p>
            <p className="text-3xl font-bold text-amber-400">#{history.best_finish}</p>
            <p className="text-xs text-slate-600 mt-1">out of 210 players</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Winnings</p>
            <p className="text-3xl font-bold text-emerald-400">${history.total_winnings.toLocaleString()}</p>
            <p className="text-xs text-slate-600 mt-1">lifetime earnings</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Win Rate (Top 3)</p>
            <p className="text-3xl font-bold text-brand-lime">{history.win_rate}%</p>
            <p className="text-xs text-slate-600 mt-1">top 3 finishes</p>
          </div>
        </div>
      )}

      {/* ─── Active Tournaments Grid ────────────────────────────── */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Users size={18} className="text-emerald-400" />
          Active Tournaments
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeTournaments.map(t => {
            const isEntered = myEntries.some(e => e.tournament_id === t.id);
            const isSelected = selectedTournamentId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleSelectTournament(t.id)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-slate-800 border-brand-lime/50 shadow-lg shadow-brand-lime/5'
                    : 'bg-slate-900/50 border-slate-700/30 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white truncate">{t.name}</span>
                  {isEntered && <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${tournamentTypeBadgeColor(t.type)}`}>
                    {tournamentTypeLabel(t.type)}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${statusBadgeColor(t.status)}`}>
                    {statusLabel(t.status)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>{t.entry_fee === 0 ? 'Free' : `$${t.entry_fee} entry`}</span>
                  <span className="text-brand-lime font-bold">${t.prize_pool.toLocaleString()} pool</span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-600">
                  <Users size={10} />
                  <span>{t.current_participants}/{t.max_participants}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Leaderboard + Portfolio Panel ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Leaderboard */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-brand-lime" />
            Live Leaderboard
            {selectedTournamentId && (
              <span className="text-xs text-slate-500 font-normal ml-2">
                {activeTournaments.find(t => t.id === selectedTournamentId)?.name}
              </span>
            )}
          </h2>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {leaderboard.slice(0, 15).map(entry => {
              const rc = rankChangeIndicator(entry.rank, entry.prev_rank);
              return (
                <div
                  key={entry.user}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    entry.is_you ? 'bg-brand-lime/10 border border-brand-lime/20' : 'bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-400 w-8 text-center">#{entry.rank}</span>
                    <span className={`text-[10px] w-6 text-center ${rc.color}`}>{rc.symbol}</span>
                    <div className={`w-7 h-7 rounded-full ${entry.avatar_color} flex items-center justify-center text-[10px] font-bold text-white`}>
                      {entry.user.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{entry.is_you ? 'You' : entry.user}</p>
                      <p className="text-[10px] text-slate-600">{entry.trades_count} trades</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold ${entry.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {entry.pnl >= 0 ? '+' : ''}${entry.pnl.toLocaleString()}
                    </p>
                    <p className={`text-[10px] ${entry.pnl_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {entry.pnl_pct >= 0 ? '+' : ''}{entry.pnl_pct.toFixed(1)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* My Portfolio Panel */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <Award size={18} className="text-amber-400" />
            My Portfolio
          </h2>
          {selectedEntry ? (
            <>
              <div className="mb-4 p-3 bg-slate-900/50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">Value</span>
                  <span className="text-sm font-bold text-white">${selectedEntry.current_value.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">P&L</span>
                  <span className={`text-sm font-bold ${selectedEntry.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {selectedEntry.pnl >= 0 ? '+' : ''}${selectedEntry.pnl.toLocaleString()} ({selectedEntry.pnl_pct.toFixed(1)}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Rank</span>
                  <span className="text-sm font-bold text-brand-lime">#{selectedEntry.rank}</span>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Positions</span>
                {selectedEntry.portfolio_snapshot.positions.filter(p => p.quantity > 0).map(pos => (
                  <div key={pos.card_name} className="p-2 bg-slate-900/50 rounded-lg">
                    <p className="text-xs font-bold text-slate-200 truncate">{pos.card_name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-slate-500">{pos.quantity}x @ ${pos.avg_cost}</span>
                      <span className={`text-[10px] font-bold ${pos.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {pos.pnl >= 0 ? '+' : ''}${pos.pnl}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-slate-500">
                Cash: <span className="text-slate-300 font-bold">${selectedEntry.portfolio_snapshot.cash.toLocaleString()}</span>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Trophy size={32} className="text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Select a tournament you've entered</p>
            </div>
          )}
        </div>
      </div>

      {/* ─── P&L Chart ──────────────────────────────────────────── */}
      {selectedEntry && pnlChartData.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-brand-lime" />
            Portfolio Performance
          </h2>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pnlChartData}>
                <defs>
                  <linearGradient id="tournamentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#84cc16" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                />
                <Area type="monotone" dataKey="value" stroke="#84cc16" strokeWidth={2} fill="url(#tournamentGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ─── Tournament History ─────────────────────────────────── */}
      {history && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-sky-400" />
            Tournament History
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {history.results.slice(0, 6).map(result => (
              <div key={result.tournament_id} className="p-4 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white truncate">{result.tournament_name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${tournamentTypeBadgeColor(result.type)}`}>
                    {tournamentTypeLabel(result.type)}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">Finish</span>
                  <span className={`text-xs font-bold ${result.finish_rank <= 3 ? 'text-amber-400' : 'text-slate-300'}`}>
                    #{result.finish_rank} / {result.total_participants}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">P&L</span>
                  <span className={`text-xs font-bold ${result.final_pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    +${result.final_pnl.toLocaleString()} ({result.final_pnl_pct.toFixed(1)}%)
                  </span>
                </div>
                {result.prize_won > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Prize</span>
                    <span className="text-xs font-bold text-brand-lime">${result.prize_won}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Upcoming Tournaments + Winning Strategies ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-purple-400" />
            Upcoming Tournaments
          </h2>
          <div className="space-y-3">
            {upcomingTournaments.map(t => (
              <div key={t.id} className="p-4 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">{t.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${tournamentTypeBadgeColor(t.type)}`}>
                    {tournamentTypeLabel(t.type)}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mb-2">{t.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-600">
                    {t.entry_fee === 0 ? 'Free Entry' : `$${t.entry_fee}`} &middot; ${t.prize_pool.toLocaleString()} pool
                  </span>
                  <button className="text-[10px] text-brand-lime font-bold hover:underline flex items-center gap-1">
                    Join <ChevronRight size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Winning Strategies */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Star size={18} className="text-amber-400" />
            Winning Strategies
          </h2>
          <div className="space-y-3">
            {strategies.map(s => (
              <div key={s.strategy_name} className="p-4 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-white">{s.strategy_name}</span>
                  <span className="text-[10px] text-emerald-400 font-bold">{s.win_rate}% win rate</span>
                </div>
                <p className="text-[10px] text-slate-500 mb-2">{s.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-600">Avg Return: +{s.avg_return_pct}%</span>
                  <span className="text-[10px] text-slate-600">By: {s.example_user}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Seasonal Championship ──────────────────────────────── */}
      {championship && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" />
            {championship.season} Championship
            <span className="text-xs text-slate-500 font-normal ml-2">{championship.events_remaining} events remaining</span>
          </h2>
          <div className="space-y-1">
            {championship.standings.slice(0, 10).map(s => (
              <div
                key={s.user}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  s.user === 'You' ? 'bg-brand-lime/10 border border-brand-lime/20' : 'bg-slate-900/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-400 w-8 text-center">#{s.rank}</span>
                  <span className="text-xs font-bold text-white">{s.user}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-slate-500">{s.events_played} events</span>
                  <span className="text-xs font-bold text-brand-lime">{s.points.toLocaleString()} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentArena;
