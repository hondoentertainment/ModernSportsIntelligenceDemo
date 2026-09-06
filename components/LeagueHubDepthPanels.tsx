import React, { useMemo, useState } from 'react';
import { Search, Users, Shield } from 'lucide-react';
import {
  LEAGUE_HUB_DATA_DISCLOSURE,
  getLeagueTeamDesk,
  searchLeaguePlayers,
  type LeagueSport,
} from '../lib/social/leagueHubService';

interface LeagueHubDepthPanelsProps {
  sport: LeagueSport;
  accent: string;
  surface: 'players' | 'teams';
}

const ROLE_STYLES: Record<string, string> = {
  leader: 'bg-amber-500/20 text-amber-300',
  rookie: 'bg-purple-500/20 text-purple-300',
  watch: 'bg-slate-600/30 text-slate-300',
};

const LeagueHubDepthPanels: React.FC<LeagueHubDepthPanelsProps> = ({ sport, accent, surface }) => {
  const [query, setQuery] = useState('');
  const players = useMemo(() => searchLeaguePlayers(sport, query), [sport, query]);
  const teams = useMemo(() => getLeagueTeamDesk(sport), [sport]);

  if (surface === 'players') {
    return (
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Users size={18} className={accent} /> Player desk
          </h2>
          <label className="relative w-full md:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search player, team, or position"
              className="w-full pl-8 pr-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500"
            />
          </label>
        </div>
        <p className="text-[11px] text-slate-500">{LEAGUE_HUB_DATA_DISCLOSURE}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {players.map((player) => (
            <div key={player.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">{player.name}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${ROLE_STYLES[player.role]}`}>
                      {player.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {player.position} · {player.team}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">{player.note}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-white">${player.cardValue}</p>
                  <p className={`text-xs ${player.cardChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {player.cardChange >= 0 ? '+' : ''}{player.cardChange}%
                  </p>
                  <p className="text-[10px] text-slate-500">{player.headlineStat}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {players.length === 0 && (
          <p className="text-sm text-slate-500">No seeded players match that search.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
        <Shield size={18} className={accent} /> Team desk
      </h2>
      <p className="text-[11px] text-slate-500">{LEAGUE_HUB_DATA_DISCLOSURE}</p>
      <div className="overflow-x-auto bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 uppercase border-b border-slate-700/50">
              <th className="text-left py-2 px-2">Team</th>
              <th className="text-left py-2 px-2">Conf</th>
              <th className="text-center py-2 px-2">Record</th>
              <th className="text-center py-2 px-2">Seed</th>
              <th className="text-right py-2 px-2">Card idx</th>
              <th className="text-left py-2 px-2">Spotlight</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => (
              <tr key={team.team} className="border-b border-slate-700/30 hover:bg-slate-700/30">
                <td className="py-2 px-2 text-white font-medium">{team.team}</td>
                <td className="py-2 px-2 text-slate-400">{team.conference}</td>
                <td className="py-2 px-2 text-center text-slate-300">{team.record}</td>
                <td className="py-2 px-2 text-center text-slate-300">{team.playoffSeed ?? '—'}</td>
                <td className="py-2 px-2 text-right">
                  <span className="text-white font-medium">{team.cardMarketIndex}</span>
                  <span className={`ml-1 text-xs ${team.cardMarketChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {team.cardMarketChange >= 0 ? '+' : ''}{team.cardMarketChange}%
                  </span>
                </td>
                <td className="py-2 px-2 text-slate-400">{team.spotlightPlayer ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeagueHubDepthPanels;
