import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy, TrendingUp, TrendingDown, Minus, Calendar, Shield, Users, Activity,
  AlertTriangle, Heart, ChevronRight, BarChart3, Star, Zap, Target
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import {
  getLeagueStandings, getDraftClass, getSeasonCalendar, getStatLeaders,
  getCardMarketTrends, getRookieWatch, getInjuryImpacts,
  type LeagueStanding, type LeagueDraftClass, type LeagueSeasonEvent,
  type LeagueStatLeader, type LeagueCardMarketTrend, type LeagueRookieWatch,
  type InjuryCardImpact,
} from '../lib/leagueHubService.ts';

type NFLTab = 'standings' | 'draft' | 'calendar' | 'leaders' | 'market' | 'injuries';

const TAB_CONFIG: { key: NFLTab; label: string; icon: React.ReactNode }[] = [
  { key: 'standings', label: 'Standings', icon: <Trophy size={14} /> },
  { key: 'draft', label: 'Draft Class', icon: <Users size={14} /> },
  { key: 'calendar', label: 'Calendar', icon: <Calendar size={14} /> },
  { key: 'leaders', label: 'Stat Leaders', icon: <BarChart3 size={14} /> },
  { key: 'market', label: 'Card Market', icon: <TrendingUp size={14} /> },
  { key: 'injuries', label: 'Injury Impact', icon: <Heart size={14} /> },
];

const INJURY_STATUS_STYLES: Record<string, string> = {
  out: 'bg-red-500/20 text-red-400',
  doubtful: 'bg-orange-500/20 text-orange-400',
  questionable: 'bg-amber-500/20 text-amber-400',
  'day-to-day': 'bg-yellow-500/20 text-yellow-400',
};

const EVENT_TYPE_STYLES: Record<string, string> = {
  draft: 'bg-purple-500/20 text-purple-400',
  playoff: 'bg-amber-500/20 text-amber-400',
  regular: 'bg-blue-500/20 text-blue-400',
  transfer: 'bg-emerald-500/20 text-emerald-400',
  allstar: 'bg-pink-500/20 text-pink-400',
  final: 'bg-yellow-500/20 text-yellow-400',
  bye: 'bg-slate-500/20 text-slate-400',
};

const IMPACT_STYLES: Record<string, string> = {
  high: 'text-red-400',
  medium: 'text-amber-400',
  low: 'text-slate-400',
};

const NFLHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NFLTab>('standings');
  const [standings, setStandings] = useState<LeagueStanding[]>([]);
  const [draftClass, setDraftClass] = useState<LeagueDraftClass[]>([]);
  const [calendar, setCalendar] = useState<LeagueSeasonEvent[]>([]);
  const [statLeaders, setStatLeaders] = useState<LeagueStatLeader[]>([]);
  const [marketTrends, setMarketTrends] = useState<LeagueCardMarketTrend[]>([]);
  const [rookieWatch, setRookieWatch] = useState<LeagueRookieWatch[]>([]);
  const [injuries, setInjuries] = useState<InjuryCardImpact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setStandings(getLeagueStandings('nfl'));
      setDraftClass(getDraftClass('nfl'));
      setCalendar(getSeasonCalendar('nfl'));
      setStatLeaders(getStatLeaders('nfl'));
      setMarketTrends(getCardMarketTrends('nfl'));
      setRookieWatch(getRookieWatch('nfl'));
      setInjuries(getInjuryImpacts());
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  const afcStandings = useMemo(() => standings.filter(s => s.conference === 'AFC').sort((a, b) => b.winPct - a.winPct), [standings]);
  const nfcStandings = useMemo(() => standings.filter(s => s.conference === 'NFC').sort((a, b) => b.winPct - a.winPct), [standings]);

  const passingLeaders = useMemo(() => statLeaders.filter(l => l.statCategory === 'Passing Yards'), [statLeaders]);
  const rushingLeaders = useMemo(() => statLeaders.filter(l => l.statCategory === 'Rushing Yards'), [statLeaders]);
  const receivingLeaders = useMemo(() => statLeaders.filter(l => l.statCategory === 'Receiving Yards'), [statLeaders]);

  const totalInjuryLoss = useMemo(() => {
    return injuries.reduce((sum, inj) => sum + (inj.cardValueBefore - inj.cardValueAfter), 0);
  }, [injuries]);

  const buyOpportunities = useMemo(() => injuries.filter(i => i.buyOpportunity), [injuries]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading NFL Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/20">
            <Shield size={24} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">NFL League Hub</h1>
            <p className="text-sm text-slate-400">
              2025-26 Season &mdash; Standings, Draft Class, Stat Leaders &amp; Card Market Intelligence
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-blue-500/20 text-blue-400 uppercase">
            NFL 2025-26
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Teams Tracked</p>
          <p className="text-3xl font-bold text-cyan-400">{standings.length}</p>
          <p className="text-xs text-slate-600 mt-1">AFC &amp; NFC</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Draft Rookies</p>
          <p className="text-3xl font-bold text-purple-400">{draftClass.length}</p>
          <p className="text-xs text-slate-600 mt-1">2024 class</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Buy Opportunities</p>
          <p className="text-3xl font-bold text-emerald-400">{buyOpportunities.length}</p>
          <p className="text-xs text-slate-600 mt-1">Injury dips</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Injury Card Loss</p>
          <p className="text-3xl font-bold text-red-400">-${totalInjuryLoss}</p>
          <p className="text-xs text-slate-600 mt-1">Aggregate value impact</p>
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
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'standings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AFC */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <h2 className="text-lg font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Shield size={18} className="text-red-400" /> AFC Standings
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 uppercase border-b border-slate-700/50">
                    <th className="text-left py-2 px-2">#</th>
                    <th className="text-left py-2 px-2">Team</th>
                    <th className="text-center py-2 px-1">W</th>
                    <th className="text-center py-2 px-1">L</th>
                    <th className="text-center py-2 px-1">Pct</th>
                    <th className="text-center py-2 px-1">Streak</th>
                    <th className="text-right py-2 px-2">Card Idx</th>
                  </tr>
                </thead>
                <tbody>
                  {afcStandings.map((team, idx) => (
                    <tr key={team.team} className="border-b border-slate-700/30 hover:bg-slate-700/30">
                      <td className="py-2 px-2 text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-2 text-white font-medium truncate max-w-[140px]">{team.team}</td>
                      <td className="py-2 px-1 text-center text-slate-300">{team.wins}</td>
                      <td className="py-2 px-1 text-center text-slate-300">{team.losses}</td>
                      <td className="py-2 px-1 text-center text-slate-300">{team.winPct.toFixed(3)}</td>
                      <td className="py-2 px-1 text-center">
                        <span className={team.streak.startsWith('W') ? 'text-emerald-400' : 'text-red-400'}>{team.streak}</span>
                      </td>
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
          {/* NFC */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <h2 className="text-lg font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Shield size={18} className="text-blue-400" /> NFC Standings
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 uppercase border-b border-slate-700/50">
                    <th className="text-left py-2 px-2">#</th>
                    <th className="text-left py-2 px-2">Team</th>
                    <th className="text-center py-2 px-1">W</th>
                    <th className="text-center py-2 px-1">L</th>
                    <th className="text-center py-2 px-1">Pct</th>
                    <th className="text-center py-2 px-1">Streak</th>
                    <th className="text-right py-2 px-2">Card Idx</th>
                  </tr>
                </thead>
                <tbody>
                  {nfcStandings.map((team, idx) => (
                    <tr key={team.team} className="border-b border-slate-700/30 hover:bg-slate-700/30">
                      <td className="py-2 px-2 text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-2 text-white font-medium truncate max-w-[140px]">{team.team}</td>
                      <td className="py-2 px-1 text-center text-slate-300">{team.wins}</td>
                      <td className="py-2 px-1 text-center text-slate-300">{team.losses}</td>
                      <td className="py-2 px-1 text-center text-slate-300">{team.winPct.toFixed(3)}</td>
                      <td className="py-2 px-1 text-center">
                        <span className={team.streak.startsWith('W') ? 'text-emerald-400' : 'text-red-400'}>{team.streak}</span>
                      </td>
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
        </div>
      )}

      {activeTab === 'draft' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Users size={18} className="text-purple-400" /> 2024 NFL Draft Class &mdash; Rookie Card Tracker
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

      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Calendar size={18} className="text-cyan-400" /> Season Calendar &amp; Key Dates
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
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase ${EVENT_TYPE_STYLES[event.type] || EVENT_TYPE_STYLES.regular}`}>
                        {event.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{event.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Zap size={12} className={IMPACT_STYLES[event.cardMarketImpact]} />
                  <span className={`text-xs font-medium ${IMPACT_STYLES[event.cardMarketImpact]}`}>
                    {event.cardMarketImpact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'leaders' && (
        <div className="space-y-6">
          {[
            { title: 'Passing Yards Leaders', data: passingLeaders, color: 'text-blue-400', icon: <Target size={18} className="text-blue-400" /> },
            { title: 'Rushing Yards Leaders', data: rushingLeaders, color: 'text-emerald-400', icon: <Activity size={18} className="text-emerald-400" /> },
            { title: 'Receiving Yards Leaders', data: receivingLeaders, color: 'text-purple-400', icon: <Star size={18} className="text-purple-400" /> },
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
                      <th className="text-right py-2 px-2">Stat</th>
                      <th className="text-right py-2 px-2">GP</th>
                      <th className="text-right py-2 px-2">Card $</th>
                      <th className="text-right py-2 px-2">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.data.map((leader) => (
                      <tr key={`${leader.player}-${leader.statCategory}`} className="border-b border-slate-700/30 hover:bg-slate-700/30">
                        <td className="py-2 px-2 text-slate-500">{leader.rank}</td>
                        <td className="py-2 px-2 text-white font-medium">{leader.player}</td>
                        <td className="py-2 px-2 text-slate-400">{leader.team}</td>
                        <td className="py-2 px-2 text-right font-bold text-white">{leader.statValue.toLocaleString()}</td>
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

      {activeTab === 'market' && (
        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-cyan-400" /> NFL Card Market Trends
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
                    labelStyle={{ color: '#94a3b8' }}
                    formatter={(value: number) => [value.toLocaleString(), 'Volume']}
                  />
                  <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Volume" />
                </BarChart>
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

      {activeTab === 'injuries' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Heart size={18} className="text-red-400" /> Injury Impact on Card Values
          </h2>
          <p className="text-sm text-slate-400">
            Tracking how injuries affect card values. Buy opportunities flagged for players expected to recover.
          </p>
          <div className="space-y-3">
            {injuries.map((injury, idx) => (
              <div key={idx} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white">{injury.player}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${INJURY_STATUS_STYLES[injury.status]}`}>
                        {injury.status}
                      </span>
                      {injury.buyOpportunity && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 uppercase flex items-center gap-1">
                          <ChevronRight size={10} /> Buy
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{injury.team} &bull; {injury.injury} &bull; Return: {injury.returnTimeline}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-sm text-slate-400 line-through">${injury.cardValueBefore}</span>
                      <ChevronRight size={12} className="text-slate-600" />
                      <span className="text-sm font-bold text-red-400">${injury.cardValueAfter}</span>
                    </div>
                    <p className="text-xs text-red-400 mt-0.5">
                      -{Math.round((1 - injury.cardValueAfter / injury.cardValueBefore) * 100)}% decline
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

export default NFLHub;
