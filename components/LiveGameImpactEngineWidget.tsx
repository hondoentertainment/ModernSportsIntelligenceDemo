import React, { useState, useEffect } from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Radio,
  ChevronRight,
  Bell,
  AlertTriangle,
  Target,
} from 'lucide-react';
import {
  getActiveGames,
  getPlayerPortfolioImpact,
  getMilestoneAlerts,
  type LiveGame,
  type PortfolioImpactCard,
  type MilestoneAlert,
} from '../lib/analytics/liveGameImpactEngineService.ts';
import { useSupabaseInventory } from '../lib/utils/useSupabaseInventory.ts';

interface Props {
  onOpenModal?: () => void;
}

const LiveGameImpactEngineWidget: React.FC<Props> = ({ onOpenModal }) => {
  const [games, setGames] = useState<LiveGame[]>([]);
  const [impactCards, setImpactCards] = useState<PortfolioImpactCard[]>([]);
  const [milestones, setMilestones] = useState<MilestoneAlert[]>([]);
  const [pulse, setPulse] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { inventory } = useSupabaseInventory();

  useEffect(() => {
    try {
      const activeGames = getActiveGames();
      setGames(activeGames);
      setImpactCards(getPlayerPortfolioImpact(inventory, activeGames));
      setMilestones(getMilestoneAlerts().filter(m => m.urgency === 'imminent'));
      setLoading(false);
    } catch  {
      setError('Failed to load live game data');
      setLoading(false);
    }

    const interval = setInterval(() => {
      try {
        const activeGames = getActiveGames();
        setGames(activeGames);
        setImpactCards(getPlayerPortfolioImpact(inventory, activeGames));
        setMilestones(getMilestoneAlerts().filter(m => m.urgency === 'imminent'));
        setPulse(true);
        setTimeout(() => setPulse(false), 500);
      } catch {
        // Silently handle refresh errors
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [inventory]);

  const liveGames = games.filter(g => g.status === 'live');
  const totalImpact = impactCards.reduce((sum, c) => sum + (c.projectedChange * c.currentValue / 100), 0);
  const totalImpactPct = impactCards.length > 0
    ? impactCards.reduce((sum, c) => sum + c.projectedChange, 0) / impactCards.length
    : 0;

  if (error) {
    return (
      <button
        onClick={onOpenModal}
        className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-6 hover:border-slate-700 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-500/10 rounded-xl text-red-400">
            <AlertTriangle size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Live Game <span className="text-red-400">Impact Engine</span>
            </h3>
            <p className="text-xs text-red-400">{error}</p>
          </div>
        </div>
      </button>
    );
  }

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
              Live Game <span className="text-red-400">Impact Engine</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Real-time card value predictions &middot; Phase 104
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

      {loading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin" />
          <p className="text-xs text-slate-500 mt-3">Loading live data...</p>
        </div>
      ) : liveGames.length === 0 ? (
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
          {/* Live Games Ticker */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {liveGames.map(game => (
              <div
                key={game.id}
                className="flex-shrink-0 px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-xl text-xs"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-slate-400 font-medium">{game.sport}</span>
                  <span className="text-slate-600">{game.period} {game.clock}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">{game.awayAbbrev}</span>
                  <span className="text-slate-400">{game.score.away}</span>
                  <span className="text-slate-600">-</span>
                  <span className="text-slate-400">{game.score.home}</span>
                  <span className="text-white font-bold">{game.homeAbbrev}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Portfolio Impact Summary */}
          <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
                Portfolio Impact
              </span>
              <span className={`text-2xl font-bebas tracking-wider ${totalImpactPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {totalImpactPct >= 0 ? '+' : ''}{totalImpactPct.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">{impactCards.length} cards affected</span>
              <span className={`font-medium ${totalImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {totalImpact >= 0 ? '+' : ''}${Math.abs(totalImpact).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Top Movers */}
          <div className="space-y-2">
            {impactCards.slice(0, 3).map(card => (
              <div
                key={card.cardId}
                className="flex items-center justify-between px-3 py-2 bg-slate-800/30 rounded-xl"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {card.trend === 'up' ? (
                    <TrendingUp size={14} className="text-emerald-400 flex-shrink-0" />
                  ) : card.trend === 'down' ? (
                    <TrendingDown size={14} className="text-red-400 flex-shrink-0" />
                  ) : (
                    <Activity size={14} className="text-slate-500 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white truncate">{card.player}</p>
                    <p className="text-[10px] text-slate-500 truncate">{card.gameName}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold flex-shrink-0 ${
                  card.projectedChange > 0 ? 'text-emerald-400' : card.projectedChange < 0 ? 'text-red-400' : 'text-slate-400'
                }`}>
                  {card.projectedChange > 0 ? '+' : ''}{card.projectedChange.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>

          {/* Milestone Alerts */}
          {milestones.length > 0 && (
            <div className="space-y-1.5">
              {milestones.slice(0, 2).map(ms => (
                <div
                  key={ms.id}
                  className="flex items-center gap-2 px-3 py-2 bg-amber-500/5 border border-amber-500/20 rounded-xl"
                >
                  <Target size={12} className="text-amber-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-amber-400 truncate">
                      {ms.milestoneType}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">{ms.playerName} &mdash; {ms.description}</p>
                  </div>
                  <span className="text-[10px] font-bold text-amber-400/80 flex-shrink-0">
                    +{ms.potentialPriceImpact}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </button>
  );
};

export default LiveGameImpactEngineWidget;
