import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy, TrendingUp, TrendingDown, Minus, Calendar, Users, Activity,
  BarChart3, Star, Zap, Target, Snowflake, Award, ChevronRight, Shield
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import {
  getLeagueStandings, getDraftClass, getSeasonCalendar, getStatLeaders,
  getCardMarketTrends, getRookieWatch,
  type LeagueStanding, type LeagueDraftClass, type LeagueSeasonEvent,
  type LeagueStatLeader, type LeagueCardMarketTrend, type LeagueRookieWatch,
  LEAGUE_HUB_DATA_DISCLOSURE,
} from '../lib/social/leagueHubService.ts';
import LeagueHubDepthPanels from '../components/LeagueHubDepthPanels';

type NHLTab = 'standings' | 'draft' | 'calendar' | 'leaders' | 'market' | 'playoffs' | 'players' | 'teams';

const TAB_CONFIG: { key: NHLTab; label: string; icon: React.ReactNode }[] = [
  { key: 'standings', label: 'Standings', icon: <Trophy size={14} /> },
  { key: 'players', label: 'Players', icon: <Users size={14} /> },
  { key: 'teams', label: 'Teams', icon: <Shield size={14} /> },
  { key: 'draft', label: 'Draft Prospects', icon: <Users size={14} /> },
  { key: 'calendar', label: 'Calendar', icon: <Calendar size={14} /> },
  { key: 'leaders', label: 'Stat Leaders', icon: <BarChart3 size={14} /> },
  { key: 'market', label: 'Card Market', icon: <TrendingUp size={14} /> },
  { key: 'playoffs', label: 'Playoff Bracket', icon: <Award size={14} /> },
];

const EVENT_TYPE_STYLES: Record<string, string> = {
  draft: 'bg-purple-500/20 text-purple-400',
  playoff: 'bg-amber-500/20 text-amber-400',
  regular: 'bg-blue-500/20 text-blue-400',
  transfer: 'bg-emerald-500/20 text-emerald-400',
  allstar: 'bg-pink-500/20 text-pink-400',
  final: 'bg-yellow-500/20 text-yellow-400',
};

const NHLHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NHLTab>('standings');
  const [standings, setStandings] = useState<LeagueStanding[]>([]);
  const [draftClass, setDraftClass] = useState<LeagueDraftClass[]>([]);
  const [calendar, setCalendar] = useState<LeagueSeasonEvent[]>([]);
  const [statLeaders, setStatLeaders] = useState<LeagueStatLeader[]>([]);
  const [marketTrends, setMarketTrends] = useState<LeagueCardMarketTrend[]>([]);
  const [rookieWatch, setRookieWatch] = useState<LeagueRookieWatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setStandings(getLeagueStandings('nhl'));
      setDraftClass(getDraftClass('nhl'));
      setCalendar(getSeasonCalendar('nhl'));
      setStatLeaders(getStatLeaders('nhl'));
      setMarketTrends(getCardMarketTrends('nhl'));
      setRookieWatch(getRookieWatch('nhl'));
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  const eastStandings = useMemo(() => standings.filter(s => s.conference === 'Eastern').sort((a, b) => b.winPct - a.winPct), [standings]);
  const westStandings = useMemo(() => standings.filter(s => s.conference === 'Western').sort((a, b) => b.winPct - a.winPct), [standings]);

  const pointsLeaders = useMemo(() => statLeaders.filter(l => l.statCategory === 'Points'), [statLeaders]);
  const goalsLeaders = useMemo(() => statLeaders.filter(l => l.statCategory === 'Goals'), [statLeaders]);
  const assistsLeaders = useMemo(() => statLeaders.filter(l => l.statCategory === 'Assists'), [statLeaders]);

  const topYoungStar = useMemo(() => {
    return draftClass.length > 0 ? [...draftClass].sort((a, b) => b.rookieCardValue - a.rookieCardValue)[0] : null;
  }, [draftClass]);

  const playoffTeamsEast = useMemo(() => eastStandings.slice(0, 4), [eastStandings]);
  const playoffTeamsWest = useMemo(() => westStandings.slice(0, 4), [westStandings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading NHL Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20">
            <Snowflake size={24} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">NHL League Hub</h1>
            <p className="text-sm text-slate-400">
              2025-26 Season &mdash; Division Standings, Player/Team desk, Draft Prospects, Stats &amp; Card Market
            </p>
          </div>
        </div>
        <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-cyan-500/20 text-cyan-400 uppercase">
          NHL 2025-26 · seeded
        </span>
      </div>
      <p className="text-[11px] text-slate-500 border border-slate-800 rounded-lg px-3 py-2 bg-slate-900/40">
        {LEAGUE_HUB_DATA_DISCLOSURE}
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Teams Tracked</p>
          <p className="text-3xl font-bold text-cyan-400">{standings.length}</p>
          <p className="text-xs text-slate-600 mt-1">East &amp; West</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Draft Prospects</p>
          <p className="text-3xl font-bold text-purple-400">{draftClass.length}</p>
          <p className="text-xs text-slate-600 mt-1">2024 class</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Top Young Star</p>
          <p className="text-3xl font-bold text-amber-400">${topYoungStar?.rookieCardValue || 0}</p>
          <p className="text-xs text-slate-600 mt-1">{topYoungStar?.name || 'N/A'}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Playoff Contenders</p>
          <p className="text-3xl font-bold text-emerald-400">{playoffTeamsEast.length + playoffTeamsWest.length}</p>
          <p className="text-xs text-slate-600 mt-1">Top seeds</p>
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
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'players' && <LeagueHubDepthPanels sport="nhl" accent="text-cyan-400" surface="players" />}
      {activeTab === 'teams' && <LeagueHubDepthPanels sport="nhl" accent="text-cyan-400" surface="teams" />}

      {/* Standings */}
      {activeTab === 'standings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[
            { title: 'Eastern Conference', data: eastStandings, color: 'text-blue-400' },
            { title: 'Western Conference', data: westStandings, color: 'text-red-400' },
          ].map(conf => (
            <div key={conf.title} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <h2 className="text-lg font-bold text-slate-200 mb-3 flex items-center gap-2">
                <Trophy size={18} className={conf.color} /> {conf.title}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-500 uppercase border-b border-slate-700/50">
                      <th className="text-left py-2 px-2">#</th>
                      <th className="text-left py-2 px-2">Team</th>
                      <th className="text-center py-2 px-1">W</th>
                      <th className="text-center py-2 px-1">L</th>
                      <th className="text-center py-2 px-1">OTL</th>
                      <th className="text-center py-2 px-1">PTS</th>
                      <th className="text-right py-2 px-2">Card Idx</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conf.data.map((team, idx) => (
                      <tr key={team.team} className="border-b border-slate-700/30 hover:bg-slate-700/30">
                        <td className="py-2 px-2 text-slate-500">{idx + 1}</td>
                        <td className="py-2 px-2 text-white font-medium truncate max-w-[140px]">{team.team}</td>
                        <td className="py-2 px-1 text-center text-slate-300">{team.wins}</td>
                        <td className="py-2 px-1 text-center text-slate-300">{team.losses}</td>
                        <td className="py-2 px-1 text-center text-slate-300">{team.otLosses || 0}</td>
                        <td className="py-2 px-1 text-center text-white font-bold">{team.wins * 2 + (team.otLosses || 0)}</td>
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

      {/* Draft Prospects */}
      {activeTab === 'draft' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Users size={18} className="text-purple-400" /> 2024 NHL Draft Class &mdash; Young Stars Card Tracker
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {draftClass.map(player => (
              <div key={player.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded-full font-bold">
                        #{player.pickNumber}
                      </span>
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
                  <span>{player.gamesPlayed} GP</span>
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
            <Calendar size={18} className="text-cyan-400" /> NHL Season Calendar
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
        </div>
      )}

      {/* Stat Leaders */}
      {activeTab === 'leaders' && (
        <div className="space-y-6">
          {[
            { title: 'Points Leaders', data: pointsLeaders, icon: <Star size={18} className="text-amber-400" /> },
            { title: 'Goals Leaders', data: goalsLeaders, icon: <Target size={18} className="text-red-400" /> },
            { title: 'Assists Leaders', data: assistsLeaders, icon: <Activity size={18} className="text-cyan-400" /> },
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
                      <th className="text-right py-2 px-2">Stat</th>
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
              <TrendingUp size={18} className="text-cyan-400" /> NHL Card Market Trends
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
                  <Area type="monotone" dataKey="overall" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.1} strokeWidth={2} name="Overall" />
                  <Area type="monotone" dataKey="rookies" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.1} strokeWidth={2} name="Rookies" />
                  <Area type="monotone" dataKey="veterans" stroke="#34d399" fill="#34d399" fillOpacity={0.1} strokeWidth={2} name="Veterans" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Young Stars Watch */}
          <div>
            <h2 className="text-lg font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Star size={18} className="text-amber-400" /> Young Stars Card Watch
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

      {/* Playoff Bracket */}
      {activeTab === 'playoffs' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Award size={18} className="text-amber-400" /> Stanley Cup Playoff Picture
          </h2>
          <p className="text-sm text-slate-400">
            Current projected bracket based on standings. Card market impact increases significantly during playoff runs.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Eastern Conference Bracket */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-4">Eastern Conference</h3>
              <div className="space-y-4">
                {/* Round 1 Matchups */}
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">First Round</p>
                  {playoffTeamsEast.length >= 4 && (
                    <>
                      <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-amber-400 font-bold">(1)</span>
                            <span className="text-sm font-medium text-white">{playoffTeamsEast[0]?.team}</span>
                          </div>
                          <span className="text-xs text-slate-400">{playoffTeamsEast[0]?.wins}W</span>
                        </div>
                        <div className="text-[10px] text-slate-600 my-1 text-center">vs</div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-bold">(4)</span>
                            <span className="text-sm font-medium text-slate-300">{playoffTeamsEast[3]?.team}</span>
                          </div>
                          <span className="text-xs text-slate-400">{playoffTeamsEast[3]?.wins}W</span>
                        </div>
                      </div>
                      <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-amber-400 font-bold">(2)</span>
                            <span className="text-sm font-medium text-white">{playoffTeamsEast[1]?.team}</span>
                          </div>
                          <span className="text-xs text-slate-400">{playoffTeamsEast[1]?.wins}W</span>
                        </div>
                        <div className="text-[10px] text-slate-600 my-1 text-center">vs</div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-bold">(3)</span>
                            <span className="text-sm font-medium text-slate-300">{playoffTeamsEast[2]?.team}</span>
                          </div>
                          <span className="text-xs text-slate-400">{playoffTeamsEast[2]?.wins}W</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Conference Final */}
                <div className="border-t border-slate-700/30 pt-3">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Conference Final</p>
                  <div className="bg-slate-900/50 border border-amber-500/20 rounded-lg p-3 text-center">
                    <p className="text-xs text-amber-400">Winner advances to Stanley Cup Final</p>
                    <p className="text-[10px] text-slate-500 mt-1">Card values surge 25-50% for Cup contenders</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Western Conference Bracket */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-4">Western Conference</h3>
              <div className="space-y-4">
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">First Round</p>
                  {playoffTeamsWest.length >= 4 && (
                    <>
                      <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-amber-400 font-bold">(1)</span>
                            <span className="text-sm font-medium text-white">{playoffTeamsWest[0]?.team}</span>
                          </div>
                          <span className="text-xs text-slate-400">{playoffTeamsWest[0]?.wins}W</span>
                        </div>
                        <div className="text-[10px] text-slate-600 my-1 text-center">vs</div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-bold">(4)</span>
                            <span className="text-sm font-medium text-slate-300">{playoffTeamsWest[3]?.team}</span>
                          </div>
                          <span className="text-xs text-slate-400">{playoffTeamsWest[3]?.wins}W</span>
                        </div>
                      </div>
                      <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-amber-400 font-bold">(2)</span>
                            <span className="text-sm font-medium text-white">{playoffTeamsWest[1]?.team}</span>
                          </div>
                          <span className="text-xs text-slate-400">{playoffTeamsWest[1]?.wins}W</span>
                        </div>
                        <div className="text-[10px] text-slate-600 my-1 text-center">vs</div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-bold">(3)</span>
                            <span className="text-sm font-medium text-slate-300">{playoffTeamsWest[2]?.team}</span>
                          </div>
                          <span className="text-xs text-slate-400">{playoffTeamsWest[2]?.wins}W</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="border-t border-slate-700/30 pt-3">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Conference Final</p>
                  <div className="bg-slate-900/50 border border-amber-500/20 rounded-lg p-3 text-center">
                    <p className="text-xs text-amber-400">Winner advances to Stanley Cup Final</p>
                    <p className="text-[10px] text-slate-500 mt-1">Card values surge 25-50% for Cup contenders</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stanley Cup Final */}
          <div className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 border border-amber-500/30 rounded-xl p-6 text-center">
            <Award size={32} className="text-amber-400 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-amber-400">Stanley Cup Final</h3>
            <p className="text-sm text-slate-400 mt-1">East Champion vs West Champion</p>
            <p className="text-xs text-slate-500 mt-2">
              Historic card value data: Cup-winning players see 40-80% increase in top card values within 30 days of winning.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NHLHub;
