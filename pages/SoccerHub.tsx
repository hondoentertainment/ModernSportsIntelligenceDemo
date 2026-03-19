import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy, TrendingUp, TrendingDown, Minus, Calendar, Users, Activity,
  BarChart3, Star, Zap, Globe, ArrowRightLeft, ChevronRight, Target
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend, Cell
} from 'recharts';
import {
  getLeagueStandings, getDraftClass, getSeasonCalendar, getStatLeaders,
  getCardMarketTrends, getRookieWatch, getTransferImpacts,
  type LeagueStanding, type LeagueDraftClass, type LeagueSeasonEvent,
  type LeagueStatLeader, type LeagueCardMarketTrend, type LeagueRookieWatch,
  type TransferImpact,
} from '../lib/social/leagueHubService.ts';

type SoccerTab = 'tables' | 'youngstars' | 'calendar' | 'leaders' | 'market' | 'transfers';
type LeagueFilter = 'all' | 'Premier League' | 'La Liga' | 'Serie A' | 'Bundesliga' | 'MLS';

const TAB_CONFIG: { key: SoccerTab; label: string; icon: React.ReactNode }[] = [
  { key: 'tables', label: 'League Tables', icon: <Trophy size={14} /> },
  { key: 'youngstars', label: 'Young Stars', icon: <Star size={14} /> },
  { key: 'calendar', label: 'Calendar', icon: <Calendar size={14} /> },
  { key: 'leaders', label: 'Top Scorers', icon: <Target size={14} /> },
  { key: 'market', label: 'Card Market', icon: <TrendingUp size={14} /> },
  { key: 'transfers', label: 'Transfers', icon: <ArrowRightLeft size={14} /> },
];

const LEAGUE_FILTERS: LeagueFilter[] = ['all', 'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'MLS'];

const EVENT_TYPE_STYLES: Record<string, string> = {
  draft: 'bg-purple-500/20 text-purple-400',
  playoff: 'bg-amber-500/20 text-amber-400',
  regular: 'bg-blue-500/20 text-blue-400',
  transfer: 'bg-emerald-500/20 text-emerald-400',
  allstar: 'bg-pink-500/20 text-pink-400',
  final: 'bg-yellow-500/20 text-yellow-400',
  international: 'bg-cyan-500/20 text-cyan-400',
};

const SoccerHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SoccerTab>('tables');
  const [leagueFilter, setLeagueFilter] = useState<LeagueFilter>('all');
  const [standings, setStandings] = useState<LeagueStanding[]>([]);
  const [youngStars, setYoungStars] = useState<LeagueDraftClass[]>([]);
  const [calendar, setCalendar] = useState<LeagueSeasonEvent[]>([]);
  const [statLeaders, setStatLeaders] = useState<LeagueStatLeader[]>([]);
  const [marketTrends, setMarketTrends] = useState<LeagueCardMarketTrend[]>([]);
  const [rookieWatch, setRookieWatch] = useState<LeagueRookieWatch[]>([]);
  const [transfers, setTransfers] = useState<TransferImpact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setStandings(getLeagueStandings('soccer'));
      setYoungStars(getDraftClass('soccer'));
      setCalendar(getSeasonCalendar('soccer'));
      setStatLeaders(getStatLeaders('soccer'));
      setMarketTrends(getCardMarketTrends('soccer'));
      setRookieWatch(getRookieWatch('soccer'));
      setTransfers(getTransferImpacts());
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  const filteredStandings = useMemo(() => {
    if (leagueFilter === 'all') return standings;
    return standings.filter(s => s.conference === leagueFilter);
  }, [standings, leagueFilter]);

  const leagueGroups = useMemo(() => {
    const groups: Record<string, LeagueStanding[]> = {};
    const dataToGroup = leagueFilter === 'all' ? standings : filteredStandings;
    dataToGroup.forEach(s => {
      if (!groups[s.conference]) groups[s.conference] = [];
      groups[s.conference].push(s);
    });
    Object.values(groups).forEach(g => g.sort((a, b) => b.winPct - a.winPct));
    return groups;
  }, [standings, filteredStandings, leagueFilter]);

  const goalLeaders = useMemo(() => statLeaders.filter(l => l.statCategory === 'Goals'), [statLeaders]);
  const assistLeaders = useMemo(() => statLeaders.filter(l => l.statCategory === 'Assists'), [statLeaders]);

  const totalTransferImpact = useMemo(() => {
    return transfers.reduce((sum, t) => sum + (t.cardValueAfter - t.cardValueBefore), 0);
  }, [transfers]);

  const avgTransferGain = useMemo(() => {
    if (transfers.length === 0) return 0;
    return Math.round(transfers.reduce((s, t) => s + t.projectedImpact, 0) / transfers.length * 10) / 10;
  }, [transfers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Soccer Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-green-500/20">
            <Globe size={24} className="text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Soccer / Football Hub</h1>
            <p className="text-sm text-slate-400">
              Multi-League Intelligence &mdash; EPL, La Liga, Serie A, Bundesliga, MLS &amp; International
            </p>
          </div>
        </div>
        <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-green-500/20 text-green-400 uppercase">
          2025-26
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Leagues Tracked</p>
          <p className="text-3xl font-bold text-cyan-400">{Object.keys(leagueGroups).length}</p>
          <p className="text-xs text-slate-600 mt-1">Top 5 competitions</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Young Stars</p>
          <p className="text-3xl font-bold text-purple-400">{youngStars.length}</p>
          <p className="text-xs text-slate-600 mt-1">Breakout players</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Transfers</p>
          <p className="text-3xl font-bold text-emerald-400">{transfers.length}</p>
          <p className="text-xs text-slate-600 mt-1">Avg +{avgTransferGain}% card impact</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Transfer Card Gain</p>
          <p className="text-3xl font-bold text-amber-400">+${totalTransferImpact}</p>
          <p className="text-xs text-slate-600 mt-1">Aggregate value change</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TAB_CONFIG.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* League Tables */}
      {activeTab === 'tables' && (
        <div className="space-y-4">
          {/* League Filter */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {LEAGUE_FILTERS.map(filter => (
              <button
                key={filter}
                onClick={() => setLeagueFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  leagueFilter === filter
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50'
                }`}
              >
                {filter === 'all' ? 'All Leagues' : filter}
              </button>
            ))}
          </div>

          {Object.entries(leagueGroups).map(([league, teams]) => (
            <div key={league} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <h2 className="text-lg font-bold text-slate-200 mb-3 flex items-center gap-2">
                <Trophy size={18} className="text-green-400" /> {league}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-500 uppercase border-b border-slate-700/50">
                      <th className="text-left py-2 px-2">#</th>
                      <th className="text-left py-2 px-2">Team</th>
                      <th className="text-center py-2 px-1">W</th>
                      <th className="text-center py-2 px-1">D</th>
                      <th className="text-center py-2 px-1">L</th>
                      <th className="text-center py-2 px-1">GF</th>
                      <th className="text-center py-2 px-1">GA</th>
                      <th className="text-center py-2 px-1">PTS</th>
                      <th className="text-right py-2 px-2">Card Idx</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team, idx) => (
                      <tr key={team.team} className="border-b border-slate-700/30 hover:bg-slate-700/30">
                        <td className="py-2 px-2 text-slate-500">{idx + 1}</td>
                        <td className="py-2 px-2 text-white font-medium">{team.team}</td>
                        <td className="py-2 px-1 text-center text-slate-300">{team.wins}</td>
                        <td className="py-2 px-1 text-center text-slate-300">{team.draws || 0}</td>
                        <td className="py-2 px-1 text-center text-slate-300">{team.losses}</td>
                        <td className="py-2 px-1 text-center text-slate-300">{team.pointsFor}</td>
                        <td className="py-2 px-1 text-center text-slate-300">{team.pointsAgainst}</td>
                        <td className="py-2 px-1 text-center text-white font-bold">{team.wins * 3 + (team.draws || 0)}</td>
                        <td className="py-2 px-2 text-right">
                          <span className="text-white font-medium">{team.cardMarketIndex}</span>
                          <span className={`ml-1 text-xs ${team.cardMarketChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {team.cardMarketChange >= 0 ? '+' : ''}{team.cardMarketChange}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Young Stars */}
      {activeTab === 'youngstars' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Star size={18} className="text-amber-400" /> Young Stars &amp; Breakout Players
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {youngStars.map(player => (
              <div key={player.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white">{player.name}</p>
                      {player.trend === 'up' && <TrendingUp size={12} className="text-emerald-400" />}
                      {player.trend === 'down' && <TrendingDown size={12} className="text-red-400" />}
                      {player.trend === 'stable' && <Minus size={12} className="text-slate-400" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{player.position} &bull; {player.team} &bull; {player.school}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">${player.rookieCardValue}</p>
                    <p className={`text-xs font-medium ${player.rookieCardChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {player.rookieCardChange >= 0 ? '+' : ''}{player.rookieCardChange}%
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(player.keyStats).map(([key, val]) => (
                    <span key={key} className="text-[10px] px-2 py-1 bg-slate-700/50 text-slate-300 rounded-md">
                      {key}: <span className="text-white font-medium">{val}</span>
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{player.gamesPlayed} Appearances</span>
                  <span>Ceiling: <span className="text-amber-400 font-medium">${player.projectedCeiling}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Calendar size={18} className="text-cyan-400" /> Soccer Season Calendar &amp; International Events
          </h2>
          <div className="space-y-2">
            {calendar.sort((a, b) => a.date.localeCompare(b.date)).map(event => (
              <div key={event.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-center min-w-[50px]">
                    <p className="text-xs text-slate-500">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                    <p className="text-lg font-bold text-white">{new Date(event.date).getDate()}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white">{event.name}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase ${EVENT_TYPE_STYLES[event.type] || 'bg-slate-500/20 text-slate-400'}`}>
                        {event.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{event.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Zap size={12} className={event.cardMarketImpact === 'high' ? 'text-red-400' : event.cardMarketImpact === 'medium' ? 'text-amber-400' : 'text-slate-400'} />
                  <span className={`text-xs font-medium ${event.cardMarketImpact === 'high' ? 'text-red-400' : event.cardMarketImpact === 'medium' ? 'text-amber-400' : 'text-slate-400'}`}>
                    {event.cardMarketImpact}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* World Cup Callout */}
          <div className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 border border-cyan-500/30 rounded-xl p-6 text-center">
            <Globe size={32} className="text-cyan-400 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-cyan-400">FIFA World Cup 2026</h3>
            <p className="text-sm text-slate-400 mt-1">June 11 - July 19 &bull; USA, Mexico &amp; Canada</p>
            <p className="text-xs text-slate-500 mt-2">
              World Cup years see 60-120% increases in international player card values. Host nation players see additional 30-50% premiums.
            </p>
          </div>
        </div>
      )}

      {/* Top Scorers & Assist Leaders */}
      {activeTab === 'leaders' && (
        <div className="space-y-6">
          {[
            { title: 'Top Scorers (All Leagues)', data: goalLeaders, icon: <Target size={18} className="text-red-400" /> },
            { title: 'Assist Leaders (All Leagues)', data: assistLeaders, icon: <Activity size={18} className="text-cyan-400" /> },
          ].map(category => (
            <div key={category.title} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <h2 className="text-lg font-bold text-slate-200 mb-3 flex items-center gap-2">
                {category.icon} {category.title}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-500 uppercase border-b border-slate-700/50">
                      <th className="text-left py-2 px-2">#</th>
                      <th className="text-left py-2 px-2">Player</th>
                      <th className="text-left py-2 px-2">Team</th>
                      <th className="text-center py-2 px-2">Pos</th>
                      <th className="text-right py-2 px-2">{category.data[0]?.statLabel || 'Stat'}</th>
                      <th className="text-right py-2 px-2">GP</th>
                      <th className="text-right py-2 px-2">Card $</th>
                      <th className="text-right py-2 px-2">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.data.map(leader => (
                      <tr key={`${leader.player}-${leader.statCategory}`} className="border-b border-slate-700/30 hover:bg-slate-700/30">
                        <td className="py-2 px-2 text-slate-500">{leader.rank}</td>
                        <td className="py-2 px-2 text-white font-medium">{leader.player}</td>
                        <td className="py-2 px-2 text-slate-400">{leader.team}</td>
                        <td className="py-2 px-2 text-center text-slate-400">{leader.position}</td>
                        <td className="py-2 px-2 text-right font-bold text-white">{leader.statValue}</td>
                        <td className="py-2 px-2 text-right text-slate-400">{leader.gamesPlayed}</td>
                        <td className="py-2 px-2 text-right text-cyan-400 font-medium">${leader.cardValue}</td>
                        <td className="py-2 px-2 text-right">
                          <span className={leader.cardChange >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                            {leader.cardChange >= 0 ? '+' : ''}{leader.cardChange}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Card Market */}
      {activeTab === 'market' && (
        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-green-400" /> Soccer Card Market Trends
            </h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={marketTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area type="monotone" dataKey="overall" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} strokeWidth={2} name="Overall" />
                  <Area type="monotone" dataKey="rookies" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.1} strokeWidth={2} name="Young Stars" />
                  <Area type="monotone" dataKey="veterans" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={2} name="Veterans" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-amber-400" /> Monthly Trade Volume
            </h2>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marketTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value: number) => [value.toLocaleString(), 'Volume']}
                  />
                  <Bar dataKey="volume" fill="#22c55e" radius={[4, 4, 0, 0]} name="Volume" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Rookie Watch */}
          <div>
            <h2 className="text-lg font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Star size={18} className="text-amber-400" /> Young Star Card Watch
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rookieWatch.map(rookie => (
                <div key={rookie.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded-full font-bold">
                        {rookie.seasonGrade}
                      </span>
                      <p className="text-sm font-bold text-white truncate">{rookie.name}</p>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">{rookie.team} &bull; {rookie.position}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-sm font-bold text-white">${rookie.topCardValue}</p>
                    <p className={`text-xs ${rookie.weeklyChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {rookie.weeklyChange >= 0 ? '+' : ''}{rookie.weeklyChange}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transfer Window */}
      {activeTab === 'transfers' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <ArrowRightLeft size={18} className="text-emerald-400" /> Transfer Window &mdash; Card Value Impact
          </h2>
          <p className="text-sm text-slate-400">
            Tracking how player transfers between clubs affect card market values. Big moves to top clubs typically drive 20-100%+ increases.
          </p>

          {/* Transfer Impact Chart */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-sm font-bold text-slate-300 mb-3">Transfer Card Value Impact</h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transfers.sort((a, b) => b.projectedImpact - a.projectedImpact)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `${v}%`} />
                  <YAxis dataKey="player" type="category" tick={{ fontSize: 10, fill: '#64748b' }} width={120} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value: number) => [`+${value}%`, 'Impact']}
                  />
                  <Bar dataKey="projectedImpact" name="Card Impact %" radius={[0, 4, 4, 0]}>
                    {transfers.sort((a, b) => b.projectedImpact - a.projectedImpact).map((_, idx) => (
                      <Cell key={idx} fill={idx < 3 ? '#34d399' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transfer Details */}
          <div className="space-y-3">
            {transfers.map((transfer, idx) => (
              <div key={idx} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold text-white">{transfer.player}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                      <span>{transfer.fromTeam}</span>
                      <ChevronRight size={12} className="text-emerald-400" />
                      <span className="text-white font-medium">{transfer.toTeam}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{transfer.league} &bull; Fee: {transfer.fee}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-sm text-slate-400">${transfer.cardValueBefore}</span>
                      <ChevronRight size={12} className="text-emerald-400" />
                      <span className="text-sm font-bold text-emerald-400">${transfer.cardValueAfter}</span>
                    </div>
                    <p className="text-xs text-emerald-400 mt-0.5">
                      +{transfer.projectedImpact}% impact
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SoccerHub;
