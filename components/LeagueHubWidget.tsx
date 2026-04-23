// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy, TrendingUp, TrendingDown, Shield, Snowflake, Globe, Flame,
  ChevronRight, Star
} from 'lucide-react';
import {
  getLeagueStandings, getRookieWatch,
  type LeagueSport, type LeagueStanding, type LeagueRookieWatch,
} from '../lib/social/leagueHubService.ts';

interface LeagueHubWidgetProps {
  sport?: LeagueSport;
  onNavigate?: (sport: LeagueSport) => void;
  compact?: boolean;
}

const SPORT_CONFIG: Record<LeagueSport, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
  nfl: { label: 'NFL', icon: <Shield size={16} className="text-blue-400" />, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  nba: { label: 'NBA', icon: <Flame size={16} className="text-orange-400" />, color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
  nhl: { label: 'NHL', icon: <Snowflake size={16} className="text-cyan-400" />, color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
  soccer: { label: 'Soccer', icon: <Globe size={16} className="text-green-400" />, color: 'text-green-400', bgColor: 'bg-green-500/20' },
};

const SPORTS: LeagueSport[] = ['nfl', 'nba', 'nhl', 'soccer'];

const LeagueHubWidget: React.FC<LeagueHubWidgetProps> = ({ sport: initialSport, onNavigate, compact = false }) => {
  const [selectedSport, setSelectedSport] = useState<LeagueSport>(initialSport || 'nfl');
  const [standings, setStandings] = useState<LeagueStanding[]>([]);
  const [rookieWatch, setRookieWatch] = useState<LeagueRookieWatch[]>([]);

  useEffect(() => {
    setStandings(getLeagueStandings(selectedSport));
    setRookieWatch(getRookieWatch(selectedSport));
  }, [selectedSport]);

  const topTeams = useMemo(() => {
    return [...standings].sort((a, b) => b.winPct - a.winPct).slice(0, compact ? 3 : 5);
  }, [standings, compact]);

  const topRookies = useMemo(() => {
    return [...rookieWatch].sort((a, b) => b.hypeScore - a.hypeScore).slice(0, 3);
  }, [rookieWatch]);

  const config = SPORT_CONFIG[selectedSport];

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${config.bgColor}`}>
            {config.icon}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">League Hub</h3>
            <p className="text-[10px] text-slate-500">Multi-sport intelligence</p>
          </div>
        </div>
        {onNavigate && (
          <button
            onClick={() => onNavigate(selectedSport)}
            className={`text-xs font-medium ${config.color} hover:underline flex items-center gap-1`}
          >
            Full Hub <ChevronRight size={12} />
          </button>
        )}
      </div>

      {/* Sport Selector */}
      <div className="flex gap-1 mb-3">
        {SPORTS.map(sport => {
          const sc = SPORT_CONFIG[sport];
          return (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                selectedSport === sport
                  ? `${sc.bgColor} ${sc.color} border border-current/30`
                  : 'bg-slate-700/30 text-slate-500 hover:bg-slate-700/50'
              }`}
            >
              {sc.label}
            </button>
          );
        })}
      </div>

      {/* Top Teams */}
      <div className="space-y-1.5 mb-3">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Top Teams</p>
        {topTeams.map((team, idx) => (
          <div key={team.team} className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-[10px] text-slate-500 w-4">{idx + 1}</span>
              <span className="text-xs text-white truncate">{team.team}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] text-slate-400">{team.wins}-{team.losses}</span>
              <span className={`text-[10px] font-medium ${team.cardMarketChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {team.cardMarketChange >= 0 ? '+' : ''}{team.cardMarketChange}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Hot Rookies */}
      {!compact && (
        <div className="space-y-1.5 border-t border-slate-700/30 pt-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium flex items-center gap-1">
            <Star size={10} className="text-amber-400" /> Hot Rookies
          </p>
          {topRookies.map(rookie => (
            <div key={rookie.id} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className={`text-[10px] px-1 py-0.5 rounded ${config.bgColor} ${config.color} font-bold`}>
                  {rookie.seasonGrade}
                </span>
                <span className="text-xs text-white truncate">{rookie.name}</span>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <span className="text-xs text-white font-medium">${rookie.topCardValue}</span>
                <span className={`ml-1 text-[10px] ${rookie.weeklyChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {rookie.weeklyChange >= 0 ? '+' : ''}{rookie.weeklyChange}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeagueHubWidget;
