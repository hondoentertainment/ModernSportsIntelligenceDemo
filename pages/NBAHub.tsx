import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy, TrendingUp, TrendingDown, Minus, Calendar, Users, Activity,
  AlertTriangle, BarChart3, Star, Zap, Target, Flame
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell
} from 'recharts';
import {
  getLeagueStandings, getDraftClass, getSeasonCalendar, getStatLeaders,
  getCardMarketTrends, getRookieWatch,
  type LeagueStanding, type LeagueDraftClass, type LeagueSeasonEvent,
  type LeagueStatLeader, type LeagueCardMarketTrend, type LeagueRookieWatch,
} from '../lib/social/leagueHubService.ts';

type NBATab = 'standings' | 'draft' | 'calendar' | 'leaders' | 'market' | 'efficiency';

const TAB_CONFIG: { key: NBATab; label: string; icon: React.ReactNode }[] = [
  { key: 'standings', label: 'Standings', icon: <Trophy size={14} /> },
  { key: 'draft', label: 'Draft Class', icon: <Users size={14} /> },
  { key: 'calendar', label: 'Calendar', icon: <Calendar size={14} /> },
  { key: 'leaders', label: 'Stat Leaders', icon: <BarChart3 size={14} /> },
  { key: 'market', label: 'Card Market', icon: <TrendingUp size={14} /> },
  { key: 'efficiency', label: 'Efficiency', icon: <Target size={14} /> },
];

const EVENT_TYPE_STYLES: Record<string, string> = {
  draft: 'bg-purple-500/20 text-purple-400',
  playoff: 'bg-amber-500/20 text-amber-400',
  regular: 'bg-blue-500/20 text-blue-400',
  transfer: 'bg-emerald-500/20 text-emerald-400',
  allstar: 'bg-pink-500/20 text-pink-400',
  final: 'bg-yellow-500/20 text-yellow-400',
};

const NBAHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NBATab>('standings');
  const [standings, setStandings] = useState<LeagueStanding[]>([]);
  const [draftClass, setDraftClass] = useState<LeagueDraftClass[]>([]);
  const [calendar, setCalendar] = useState<LeagueSeasonEvent[]>([]);
  const [statLeaders, setStatLeaders] = useState<LeagueStatLeader[]>([]);
  const [marketTrends, setMarketTrends] = useState<LeagueCardMarketTrend[]>([]);
  const [rookieWatch, setRookieWatch] = useState<LeagueRookieWatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setStandings(getLeagueStandings('nba'));
      setDraftClass(getDraftClass('nba'));
      setCalendar(getSeasonCalendar('nba'));
      setStatLeaders(getStatLeaders('nba'));
      setMarketTrends(getCardMarketTrends('nba'));
      setRookieWatch(getRookieWatch('nba'));
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  const eastStandings = useMemo(() => standings.filter(s => s.conference === 'Eastern').sort((a, b) => b.winPct - a.winPct), [standings]);
  const westStandings = useMemo(() => standings.filter(s => s.conference === 'Western').sort((a, b) => b.winPct - a.winPct), [standings]);

  const ppgLeaders = useMemo(() => statLeaders.filter(l => l.statCategory === 'PPG'), [statLeaders]);
  const rpgLeaders = useMemo(() => statLeaders.filter(l => l.statCategory === 'RPG'), [statLeaders]);
  const apgLeaders = useMemo(() => statLeaders.filter(l => l.statCategory === 'APG'), [statLeaders]);

  const efficiencyData = useMemo(() => {
    return statLeaders
      .filter(l => l.efficiency !== undefined)
      .map(l => ({
        name: l.player,
        efficiency: l.efficiency,
        cardValue: l.cardValue,
        change: l.cardChange,
        stat: l.statValue,
        category: l.statCategory,
      }));
  }, [statLeaders]);

  const topRookieGainer = useMemo(() => {
    if (draftClass.length === 0) return null;
    return [...draftClass].sort((a, b) => b.rookieCardChange - a.rookieCardChange)[0];
  }, [draftClass]);

  const avgRookieValue = useMemo(() => {
    if (draftClass.length === 0) return 0;
    return Math.round(draftClass.reduce((s, d) => s + d.rookieCardValue, 0) / draftClass.length);
  }, [draftClass]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading NBA Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-orange-500/20">
            <Flame size={24} className="text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">NBA League Hub</h1>
            <p className="text-sm text-slate-400">
              2025-26 Season &mdash; Conference Standings, Draft Lottery, Stats &amp; Card Market
            </p>
          </div>
        </div>
        <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-orange-500/20 text-orange-400 uppercase">
          NBA 2025-26
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Teams Tracked</p>
          <p className="text-3xl font-bold text-cyan-400">{standings.length}</p>
          <p className="text-xs text-slate-600 mt-1">East &amp; West</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Rookie Card</p>
          <p className="text-3xl font-bold text-purple-400">${avgRookieValue}</p>
          <p className="text-xs text-slate-600 mt-1">2024 class</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Top Gainer</p>
          <p className="text-3xl font-bold text-emerald-400">+{topRookieGainer?.rookieCardChange || 0}%</p>
          <p className="text-xs text-slate-600 mt-1">{topRookieGainer?.name || 'N/A'}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Key Events</p>
          <p className="text-3xl font-bold text-amber-400">{calendar.length}</p>
          <p className="text-xs text-slate-600 mt-1">Season dates</p>
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
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

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
                      <th className="text-left py-2 px-2">Seed</th>
                      <th className="text-left py-2 px-2">Team</th>
                      <th className="text-center py-2 px-1">W</th>
                      <th className="text-center py-2 px-1">L</th>
                      <th className="text-center py-2 px-1">Pct</th>
                      <th className="text-center py-2 px-1">PPG</th>
                      <th className="text-right py-2 px-2">Card Idx</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conf.data.map((team, idx) => (
                      <tr key={team.team} className={`border-b border-slate-700/30 hover:bg-slate-700/30 ${idx < 6 ? '' : idx < 8 ? 'opacity-80' : 'opacity-50'}`}>
                        <td className="py-2 px-2">
                          <span className={`text-xs font-bold ${idx < 6 ? 'text-emerald-400' : idx < 8 ? 'text-amber-400' : 'text-slate-500'}`}>
                            {team.playoffSeed || idx + 1}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-white font-medium truncate max-w-[140px]">{team.team}</td>
                        <td className="py-2 px-1 text-center text-slate-300">{team.wins}</td>
                        <td className="py-2 px-1 text-center text-slate-300">{team.losses}</td>
                        <td className="py-2 px-1 text-center text-slate-300">{team.winPct.toFixed(3)}</td>
                        <td className="py-2 px-1 text-center text-slate-300">{team.pointsFor}</td>
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

      {/* Draft Class */}
      {activeTab === 'draft' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Users size={18} className="text-purple-400" /> 2024 NBA Draft Class &mdash; Rookie Card Price Tracker
          </h2>

          {/* Draft Lottery Tracker */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 mb-4">
            <h3 className="text-sm font-bold text-slate-300 mb-3">Rookie Card Price Chart</h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={draftClass.sort((a, b) => b.rookieCardValue - a.rookieCardValue)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#94a3b8' }}
                    formatter={(value: number) => [`$${value}`, 'Card Value']}
                  />
                  <Bar dataKey="rookieCardValue" name="Card Value" radius={[4, 4, 0, 0]}>
                    {draftClass.sort((a, b) => b.rookieCardValue - a.rookieCardValue).map((entry, idx) => (
                      <Cell key={idx} fill={entry.rookieCardChange >= 0 ? '#34d399' : '#f87171'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

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
                    <p className="text-xs text-slate-500 mt-0.5">{player.position} &bull; {player.team}</p>
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
            <Calendar size={18} className="text-cyan-400" /> NBA Season Calendar
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
            { title: 'Points Per Game', data: ppgLeaders, color: 'text-orange-400', icon: <Flame size={18} className="text-orange-400" /> },
            { title: 'Rebounds Per Game', data: rpgLeaders, color: 'text-blue-400', icon: <Activity size={18} className="text-blue-400" /> },
            { title: 'Assists Per Game', data: apgLeaders, color: 'text-purple-400', icon: <Star size={18} className="text-purple-400" /> },
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
              <TrendingUp size={18} className="text-cyan-400" /> NBA Card Market Trends
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
                  <Area type="monotone" dataKey="overall" stroke="#f97316" fill="#f97316" fillOpacity={0.1} strokeWidth={2} name="Overall" />
                  <Area type="monotone" dataKey="rookies" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.1} strokeWidth={2} name="Rookies" />
                  <Area type="monotone" dataKey="veterans" stroke="#34d399" fill="#34d399" fillOpacity={0.1} strokeWidth={2} name="Veterans" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Rookie Watch */}
          <div>
            <h2 className="text-lg font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Star size={18} className="text-amber-400" /> Rookie Card Watch
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
                    <p className="text-[10px] text-slate-500 mt-0.5">{rookie.team} &bull; {rookie.position} &bull; Hype: {rookie.hypeScore}/100</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">{rookie.recentPerformance}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-sm font-bold text-white">${rookie.topCardValue}</p>
                    <p className={`text-xs ${rookie.weeklyChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {rookie.weeklyChange >= 0 ? '+' : ''}{rookie.weeklyChange}%
                    </p>
                    <p className="text-[10px] text-slate-600">ROI: {rookie.projectedROI}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Efficiency to Card Value */}
      {activeTab === 'efficiency' && (
        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Target size={18} className="text-cyan-400" /> Player Efficiency vs Card Value
            </h2>
            <p className="text-sm text-slate-400 mb-4">
              Correlation between player efficiency rating (PER) and card market value. Identifies undervalued and overvalued cards.
            </p>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="efficiency"
                    type="number"
                    name="Efficiency"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    label={{ value: 'Player Efficiency', position: 'insideBottom', offset: -5, style: { fontSize: 11, fill: '#64748b' } }}
                  />
                  <YAxis
                    dataKey="cardValue"
                    type="number"
                    name="Card Value"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickFormatter={(v) => `$${v}`}
                    label={{ value: 'Card Value ($)', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#64748b' } }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value: number, name: string) => {
                      if (name === 'Card Value') return [`$${value}`, name];
                      return [value, name];
                    }}
                    labelFormatter={() => ''}
                    content={({ payload }) => {
                      if (!payload || payload.length === 0) return null;
                      const data = payload[0]?.payload;
                      if (!data) return null;
                      return (
                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs">
                          <p className="text-white font-bold">{data.name}</p>
                          <p className="text-slate-400">{data.category}: {data.stat}</p>
                          <p className="text-cyan-400">Efficiency: {data.efficiency}</p>
                          <p className="text-amber-400">Card: ${data.cardValue}</p>
                          <p className={data.change >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                            {data.change >= 0 ? '+' : ''}{data.change}%
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Scatter data={efficiencyData} fill="#f97316" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Efficiency Table */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <h3 className="text-sm font-bold text-slate-300 mb-3">Value vs Performance Analysis</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 uppercase border-b border-slate-700/50">
                    <th className="text-left py-2 px-2">Player</th>
                    <th className="text-left py-2 px-2">Category</th>
                    <th className="text-right py-2 px-2">Stat</th>
                    <th className="text-right py-2 px-2">PER</th>
                    <th className="text-right py-2 px-2">Card $</th>
                    <th className="text-right py-2 px-2">$/PER</th>
                    <th className="text-right py-2 px-2">Signal</th>
                  </tr>
                </thead>
                <tbody>
                  {efficiencyData.map((d, i) => {
                    const valuePerEfficiency = d.cardValue / (d.efficiency || 1);
                    const avgValuePerEff = efficiencyData.reduce((s, e) => s + e.cardValue / (e.efficiency || 1), 0) / efficiencyData.length;
                    const isUndervalued = valuePerEfficiency < avgValuePerEff * 0.8;
                    const isOvervalued = valuePerEfficiency > avgValuePerEff * 1.2;
                    return (
                      <tr key={i} className="border-b border-slate-700/30 hover:bg-slate-700/30">
                        <td className="py-2 px-2 text-white font-medium">{d.name}</td>
                        <td className="py-2 px-2 text-slate-400">{d.category}</td>
                        <td className="py-2 px-2 text-right text-white">{d.stat}</td>
                        <td className="py-2 px-2 text-right text-cyan-400">{d.efficiency}</td>
                        <td className="py-2 px-2 text-right text-amber-400">${d.cardValue}</td>
                        <td className="py-2 px-2 text-right text-slate-300">${Math.round(valuePerEfficiency)}</td>
                        <td className="py-2 px-2 text-right">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            isUndervalued ? 'bg-emerald-500/20 text-emerald-400' : isOvervalued ? 'bg-red-500/20 text-red-400' : 'bg-slate-600/20 text-slate-400'
                          }`}>
                            {isUndervalued ? 'UNDERVALUED' : isOvervalued ? 'OVERVALUED' : 'FAIR'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NBAHub;
