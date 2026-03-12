import React, { useState, useEffect } from 'react';
import { Activity, Zap, TrendingUp, TrendingDown, Radio, ChevronRight } from 'lucide-react';
import { getLiveGames, getGameDaySnapshot, type LiveGame } from '../lib/liveGameImpactService.ts';

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
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-brand-lime/30 transition-all cursor-pointer" onClick={onOpenModal}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-red-500/20 ${pulse ? 'animate-pulse' : ''}`}>
            <Radio size={16} className="text-red-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">Live Game Impact</h3>
          {liveGames.length > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500/30 text-red-300 rounded-full animate-pulse">
              {liveGames.length} LIVE
            </span>
          )}
        </div>
        <ChevronRight size={14} className="text-slate-500" />
      </div>

      {liveGames.length === 0 ? (
        <div className="text-center py-4">
          <Activity size={24} className="text-slate-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500">No live games right now</p>
          <p className="text-[10px] text-slate-600 mt-1">Next game impact tracked automatically</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-slate-900/50 rounded-lg p-2">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Portfolio Impact</span>
            <span className={`text-lg font-bold ${snapshot.totalImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {snapshot.totalImpact >= 0 ? '+' : ''}{snapshot.totalImpact.toFixed(1)}%
            </span>
          </div>

          {liveGames.slice(0, 2).map(game => (
            <div key={game.id} className="flex items-center justify-between text-xs border-t border-slate-700/30 pt-2">
              <div>
                <p className="text-slate-300 font-medium">{game.awayTeam} @ {game.homeTeam}</p>
                <p className="text-slate-500 text-[10px]">{game.period} · {game.score.away}-{game.score.home}</p>
              </div>
              <div className="flex items-center gap-1">
                {game.portfolioImpact >= 0 ? (
                  <TrendingUp size={12} className="text-emerald-400" />
                ) : (
                  <TrendingDown size={12} className="text-red-400" />
                )}
                <span className={`font-mono text-xs ${game.portfolioImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {game.portfolioImpact >= 0 ? '+' : ''}{game.portfolioImpact.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}

          {snapshot.alerts.length > 0 && (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 mt-2">
              <Zap size={12} className="text-amber-400 flex-shrink-0" />
              <p className="text-[10px] text-amber-300 truncate">{snapshot.alerts[0].message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveGameImpactWidget;
