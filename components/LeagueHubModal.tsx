// @ts-nocheck
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X, Trophy, TrendingUp, TrendingDown, Shield, Snowflake, Globe, Flame,
  Star, BarChart3, Calendar, Users, Minus
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import {
  getLeagueStandings, getDraftClass, getCardMarketTrends, getRookieWatch, getStatLeaders,
  type LeagueSport, type LeagueStanding, type LeagueDraftClass,
  type LeagueCardMarketTrend, type LeagueRookieWatch, type LeagueStatLeader,
} from '../lib/social/leagueHubService.ts';

interface LeagueHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSport?: LeagueSport;
}

const SPORT_CONFIG: Record<LeagueSport, { label: string; icon: React.ReactNode; color: string; borderColor: string; chartColor: string }> = {
  nfl: { label: 'NFL', icon: <Shield size={20} className="text-blue-400" />, color: 'text-blue-400', borderColor: 'border-blue-500/30', chartColor: '#3b82f6' },
  nba: { label: 'NBA', icon: <Flame size={20} className="text-orange-400" />, color: 'text-orange-400', borderColor: 'border-orange-500/30', chartColor: '#f97316' },
  nhl: { label: 'NHL', icon: <Snowflake size={20} className="text-cyan-400" />, color: 'text-cyan-400', borderColor: 'border-cyan-500/30', chartColor: '#22d3ee' },
  soccer: { label: 'Soccer', icon: <Globe size={20} className="text-green-400" />, color: 'text-green-400', borderColor: 'border-green-500/30', chartColor: '#22c55e' },
};

const SPORTS: LeagueSport[] = ['nfl', 'nba', 'nhl', 'soccer'];

type ModalView = 'overview' | 'standings' | 'rookies' | 'market';

const LeagueHubModal: React.FC<LeagueHubModalProps> = ({ isOpen, onClose, initialSport = 'nfl' }) => {
  const [sport, setSport] = useState<LeagueSport>(initialSport);
  const [view, setView] = useState<ModalView>('overview');
  const [standings, setStandings] = useState<LeagueStanding[]>([]);
  const [draftClass, setDraftClass] = useState<LeagueDraftClass[]>([]);
  const [marketTrends, setMarketTrends] = useState<LeagueCardMarketTrend[]>([]);
  const [rookieWatch, setRookieWatch] = useState<LeagueRookieWatch[]>([]);
  const [statLeaders, setStatLeaders] = useState<LeagueStatLeader[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setStandings(getLeagueStandings(sport));
    setDraftClass(getDraftClass(sport));
    setMarketTrends(getCardMarketTrends(sport));
    setRookieWatch(getRookieWatch(sport));
    setStatLeaders(getStatLeaders(sport));
  }, [sport, isOpen]);

  const topTeams = useMemo(() => [...standings].sort((a, b) => b.winPct - a.winPct).slice(0, 8), [standings]);
  const topRookies = useMemo(() => [...rookieWatch].sort((a, b) => b.hypeScore - a.hypeScore).slice(0, 6), [rookieWatch]);
  const topLeaders = useMemo(() => statLeaders.slice(0, 5), [statLeaders]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const config = SPORT_CONFIG[sport];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className={`relative w-full max-w-4xl max-h-[85vh] bg-slate-900 border ${config.borderColor} rounded-2xl shadow-2xl overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            {config.icon}
            <div>
              <h2 className="text-lg font-bold text-slate-100">{config.label} League Hub</h2>
              <p className="text-xs text-slate-500">Quick view &mdash; 2025-26 Season</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Sport Selector */}
            <div className="flex gap-1">
              {SPORTS.map(s => {
                const sc = SPORT_CONFIG[s];
                return (
                  <button
                    key={s}
                    onClick={() => { setSport(s); setView('overview'); }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                      sport === s ? `${sc.color} bg-slate-800` : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {sc.label}
                  </button>
                );
              })}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-1 px-4 pt-3 flex-shrink-0">
          {[
            { key: 'overview' as ModalView, label: 'Overview', icon: <BarChart3 size={12} /> },
            { key: 'standings' as ModalView, label: 'Standings', icon: <Trophy size={12} /> },
            { key: 'rookies' as ModalView, label: 'Rookies', icon: <Users size={12} /> },
            { key: 'market' as ModalView, label: 'Market', icon: <TrendingUp size={12} /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setView(tab.key)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                view === tab.key
                  ? `${config.color} bg-slate-800`
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Overview */}
          {view === 'overview' && (
            <>
              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-slate-500 uppercase">Teams</p>
                  <p className="text-xl font-bold text-cyan-400">{standings.length}</p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-slate-500 uppercase">Rookies</p>
                  <p className="text-xl font-bold text-purple-400">{draftClass.length}</p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-slate-500 uppercase">Top Card</p>
                  <p className="text-xl font-bold text-amber-400">
                    ${topLeaders[0]?.cardValue || 0}
                  </p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-slate-500 uppercase">Hot Rookie</p>
                  <p className="text-xl font-bold text-emerald-400">
                    ${topRookies[0]?.topCardValue || 0}
                  </p>
                </div>
              </div>

              {/* Mini Market Chart */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                <h3 className="text-sm font-bold text-slate-300 mb-2">Market Trend</h3>
                <div className="h-32 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={marketTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 9, fill: '#64748b' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }}
                      />
                      <Area type="monotone" dataKey="overall" stroke={config.chartColor} fill={config.chartColor} fillOpacity={0.1} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top 3 Quick View */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-1"><Trophy size={14} className="text-amber-400" /> Top Teams</h3>
                  {topTeams.slice(0, 5).map((team, idx) => (
                    <div key={team.team} className="flex items-center justify-between py-1.5 border-b border-slate-700/20 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">{idx + 1}</span>
                        <span className="text-xs text-white">{team.team}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{team.wins}-{team.losses}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-1"><Star size={14} className="text-amber-400" /> Hot Rookies</h3>
                  {topRookies.slice(0, 5).map(rookie => (
                    <div key={rookie.id} className="flex items-center justify-between py-1.5 border-b border-slate-700/20 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold`}>{rookie.seasonGrade}</span>
                        <span className="text-xs text-white">{rookie.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-white">${rookie.topCardValue}</span>
                        <span className={`ml-1 text-[10px] ${rookie.weeklyChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {rookie.weeklyChange >= 0 ? '+' : ''}{rookie.weeklyChange}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Standings */}
          {view === 'standings' && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <h3 className="text-sm font-bold text-slate-300 mb-3">Full Standings</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-500 uppercase border-b border-slate-700/50">
                      <th className="text-left py-2 px-2">#</th>
                      <th className="text-left py-2 px-2">Team</th>
                      <th className="text-left py-2 px-2">Conf</th>
                      <th className="text-center py-2 px-1">W</th>
                      <th className="text-center py-2 px-1">L</th>
                      <th className="text-center py-2 px-1">Pct</th>
                      <th className="text-right py-2 px-2">Card Idx</th>
                      <th className="text-right py-2 px-2">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topTeams.map((team, idx) => (
                      <tr key={team.team} className="border-b border-slate-700/30 hover:bg-slate-700/30">
                        <td className="py-2 px-2 text-slate-500">{idx + 1}</td>
                        <td className="py-2 px-2 text-white font-medium">{team.team}</td>
                        <td className="py-2 px-2 text-slate-400 text-xs">{team.conference}</td>
                        <td className="py-2 px-1 text-center text-slate-300">{team.wins}</td>
                        <td className="py-2 px-1 text-center text-slate-300">{team.losses}</td>
                        <td className="py-2 px-1 text-center text-slate-300">{team.winPct.toFixed(3)}</td>
                        <td className="py-2 px-2 text-right text-white font-medium">{team.cardMarketIndex}</td>
                        <td className="py-2 px-2 text-right">
                          <span className={team.cardMarketChange >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                            {team.cardMarketChange >= 0 ? '+' : ''}{team.cardMarketChange}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Rookies */}
          {view === 'rookies' && (
            <div className="space-y-3">
              {draftClass.slice(0, 8).map(player => (
                <div key={player.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {player.pickNumber > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded-full font-bold">
                          #{player.pickNumber}
                        </span>
                      )}
                      <p className="text-sm font-bold text-white">{player.name}</p>
                      {player.trend === 'up' && <TrendingUp size={12} className="text-emerald-400" />}
                      {player.trend === 'down' && <TrendingDown size={12} className="text-red-400" />}
                      {player.trend === 'stable' && <Minus size={12} className="text-slate-400" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{player.position} &bull; {player.team}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">${player.rookieCardValue}</p>
                    <p className={`text-xs ${player.rookieCardChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {player.rookieCardChange >= 0 ? '+' : ''}{player.rookieCardChange}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Market */}
          {view === 'market' && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <h3 className="text-sm font-bold text-slate-300 mb-3">Card Market Trend</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={marketTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="overall" stroke={config.chartColor} fill={config.chartColor} fillOpacity={0.1} strokeWidth={2} name="Overall" />
                    <Area type="monotone" dataKey="rookies" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.1} strokeWidth={2} name="Rookies" />
                    <Area type="monotone" dataKey="veterans" stroke="#34d399" fill="#34d399" fillOpacity={0.1} strokeWidth={2} name="Veterans" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeagueHubModal;
