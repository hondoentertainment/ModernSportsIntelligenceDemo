// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Radio, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { getLiveGames, getGameDaySnapshot, getLiveImpactAlerts, type LiveGame } from '../lib/analytics/liveGameImpactService.ts';
import LiveGameImpactModal from '../components/LiveGameImpactModal.tsx';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const LiveImpact: React.FC = () => {
  const [games, setGames] = useState<LiveGame[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setGames(getLiveGames());
    const interval = setInterval(() => setGames(getLiveGames()), 10000);
    return () => clearInterval(interval);
  }, []);

  const snapshot = getGameDaySnapshot([]);
  const alerts = getLiveImpactAlerts();
  const liveGames = games.filter(g => g.status === 'live');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/20 animate-pulse">
            <Radio size={24} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Live Game Impact Engine</h1>
            <p className="text-sm text-slate-400">Real-time card value shifts during live games — no competitor offers this</p>
          </div>
        </div>
        {liveGames.length > 0 && (
          <span className="px-3 py-1.5 text-sm font-bold bg-red-500/20 text-red-300 rounded-full animate-pulse">
            {liveGames.length} GAMES LIVE
          </span>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Portfolio Impact</p>
          <p className={`text-3xl font-bold ${snapshot.totalImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {snapshot.totalImpact >= 0 ? '+' : ''}{snapshot.totalImpact.toFixed(2)}%
          </p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Live Games</p>
          <p className="text-3xl font-bold text-red-400">{snapshot.gamesTracked}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Players Impacted</p>
          <p className="text-3xl font-bold text-blue-400">{snapshot.playersImpacted}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Biggest Mover</p>
          <p className="text-lg font-bold text-amber-400">{snapshot.biggestMover.player}</p>
          <p className={`text-sm ${snapshot.biggestMover.delta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {snapshot.biggestMover.delta >= 0 ? '+' : ''}{snapshot.biggestMover.delta.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Portfolio Timeline */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Game Day Portfolio Timeline</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={snapshot.timeline}>
              <defs>
                <linearGradient id="timelineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={['dataMin - 50', 'dataMax + 50']} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="portfolioValue" stroke="#84cc16" fill="url(#timelineGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Live Games Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {games.map(game => (
          <div key={game.id} className={`bg-slate-800/50 border rounded-xl p-5 ${game.status === 'live' ? 'border-red-500/30' : 'border-slate-700/50'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {game.status === 'live' && <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />}
                <span className="text-xs text-slate-500">{game.sport}</span>
              </div>
              <span className="text-xs text-slate-500">{game.venue}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-center flex-1">
                <p className="text-lg font-bold text-slate-200">{game.awayTeam}</p>
                <p className="text-3xl font-bold text-slate-100">{game.score.away}</p>
              </div>
              <div className="text-center px-4">
                <p className="text-xs text-slate-500">vs</p>
                <p className="text-sm font-semibold text-slate-400">{game.period}</p>
                <p className="text-xs text-slate-500">{game.clock}</p>
              </div>
              <div className="text-center flex-1">
                <p className="text-lg font-bold text-slate-200">{game.homeTeam}</p>
                <p className="text-3xl font-bold text-slate-100">{game.score.home}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-slate-700/30 pt-3">
              <span className="text-slate-400">{game.impactedCards} cards impacted</span>
              <span className={`font-bold ${game.portfolioImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                Portfolio: {game.portfolioImpact >= 0 ? '+' : ''}{game.portfolioImpact.toFixed(1)}%
              </span>
            </div>

            {game.events.length > 0 && (
              <div className="mt-3 space-y-2">
                {game.events.map(event => (
                  <div key={event.id} className="flex items-start gap-2 bg-slate-900/50 rounded-lg p-2">
                    <div className={`p-1 rounded mt-0.5 ${event.cardValueDelta >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                      {event.cardValueDelta >= 0 ? <TrendingUp size={10} className="text-emerald-400" /> : <TrendingDown size={10} className="text-red-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-300">{event.playerName}</span>
                        <span className={`text-xs font-bold ${event.cardValueDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {event.cardValueDelta >= 0 ? '+' : ''}{event.cardValueDelta.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Impact Alerts */}
      {alerts.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Zap size={14} className="text-amber-400" />
            Impact Alerts
          </h3>
          <div className="space-y-2">
            {alerts.map(alert => (
              <div key={alert.id} className={`flex items-center justify-between p-3 rounded-lg ${alert.severity === 'critical' ? 'bg-red-500/10 border border-red-500/30' : 'bg-slate-900/50'}`}>
                <div className="flex items-center gap-2">
                  {alert.type === 'surge' ? <TrendingUp size={14} className="text-emerald-400" /> : <TrendingDown size={14} className="text-red-400" />}
                  <div>
                    <p className="text-xs font-medium text-slate-300">{alert.message}</p>
                    {alert.suggestedAction && <p className="text-[10px] text-blue-400">{alert.suggestedAction}</p>}
                  </div>
                </div>
                <span className={`text-xs font-bold ${alert.cardValueChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {alert.cardValueChange >= 0 ? '+' : ''}{alert.cardValueChange.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <LiveGameImpactModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default LiveImpact;
