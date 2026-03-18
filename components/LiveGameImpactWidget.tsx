import React, { useState, useEffect } from 'react';
import { Activity, Zap, TrendingUp, TrendingDown, Radio, ChevronRight, Bell } from 'lucide-react';
import { getLiveGames, getGameDaySnapshot, type LiveGame } from '../lib/analytics/liveGameImpactService.ts';

interface Props {
  onOpenModal?: () => void;
  portfolioPlayers?: string[];
}

const LiveGameImpactWidget: React.FC<Props> = ({ onOpenModal, portfolioPlayers = [] }) => {
  const [games, setGames] = useState<LiveGame[]>([]);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setGames(getLiveGames());
    const interval = setInterval(() => {
      setGames(getLiveGames());
      setPulse(true);
      setTimeout(() => setPulse(false), 500);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const snapshot = getGameDaySnapshot(portfolioPlayers);
  const liveGames = games.filter(g => g.status === 'live');

  return (
    <button
      onClick={onOpenModal}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 bg-red-500/10 rounded-xl text-red-400 ${pulse ? 'animate-pulse' : ''}`}>
            <Radio size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Live Game <span className="text-red-400">Impact</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Real-time portfolio impact engine
            </p>
          </div>
        </div>
        {liveGames.length > 0 ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 animate-pulse">
            <Bell size={12} />
            {liveGames.length} LIVE
          </div>
        ) : (
          <ChevronRight
            size={20}
            className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
          />
        )}
      </div>

      {liveGames.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="p-4 bg-slate-800/50 rounded-2xl mb-4">
            <Activity size={32} className="text-slate-600" />
          </div>
          <p className="text-sm text-slate-400">No live games right now</p>
          <p className="text-xs text-slate-600 mt-1 group-hover:text-slate-500 transition-colors">
            Next game impact tracked automatically
          </p>
        </div>
      ) : (
        <>
          {/* Portfolio Impact Summary */}
          <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
                Portfolio Impact
              </span>
              <span className={`text-2xl font-bebas tracking-wider ${snapshot.totalImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {snapshot.totalImpact >= 0 ? '+' : ''}{snapshot.totalImpact.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Live Games */}
          <div className="space-y-2">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Live Games</p>
            <div className="space-y-1.5">
              {liveGames.slice(0, 3).map(game => (
                <div
                  key={game.id}
                  className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl text-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{game.awayTeam} @ {game.homeTeam}</p>
                    <p className="text-[10px] text-slate-500">{game.period} &bull; {game.score.away}-{game.score.home}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {game.portfolioImpact >= 0 ? (
                      <TrendingUp size={12} className="text-emerald-400" />
                    ) : (
                      <TrendingDown size={12} className="text-red-400" />
                    )}
                    <span className={`font-mono ${game.portfolioImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {game.portfolioImpact >= 0 ? '+' : ''}{game.portfolioImpact.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alert */}
          {snapshot.alerts.length > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
              <Zap size={14} className="text-amber-400 flex-shrink-0" />
              <p className="text-xs text-amber-300 truncate">{snapshot.alerts[0].message}</p>
            </div>
          )}

          {/* Footer hint */}
          <p className="text-[10px] text-slate-600 text-center group-hover:text-slate-500 transition-colors uppercase tracking-widest font-bold">
            Click to view full game impact dashboard
          </p>
        </>
      )}
    </button>
  );
};

export default LiveGameImpactWidget;
