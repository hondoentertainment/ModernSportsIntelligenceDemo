import React, { useState, useEffect } from 'react';
import { X, Radio, TrendingUp, TrendingDown, Zap, Activity, Clock, Users, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { getLiveGames, getGameDaySnapshot, getLiveImpactAlerts, type LiveGame, type ImpactAlert } from '../lib/liveGameImpactService.ts';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  portfolioPlayers?: string[];
}

const LiveGameImpactModal: React.FC<Props> = ({ isOpen, onClose, portfolioPlayers = [] }) => {
  const [games, setGames] = useState<LiveGame[]>([]);
  const [alerts, setAlerts] = useState<ImpactAlert[]>([]);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [tab, setTab] = useState<'games' | 'alerts' | 'timeline'>('games');

  useEffect(() => {
    if (isOpen) {
      setGames(getLiveGames());
      setAlerts(getLiveImpactAlerts());
      const interval = setInterval(() => {
        setGames(getLiveGames());
        setAlerts(getLiveImpactAlerts());
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const snapshot = getGameDaySnapshot(portfolioPlayers);
  const liveGames = games.filter(g => g.status === 'live');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-gradient-to-r from-red-500/10 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/20 animate-pulse">
              <Radio size={20} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Live Game Impact Engine</h2>
              <p className="text-xs text-slate-400">{liveGames.length} games live · Portfolio impact in real-time</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Impact Summary Bar */}
        <div className="grid grid-cols-4 gap-3 p-4 bg-slate-800/30">
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Portfolio Impact</p>
            <p className={`text-xl font-bold ${snapshot.totalImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {snapshot.totalImpact >= 0 ? '+' : ''}{snapshot.totalImpact.toFixed(2)}%
            </p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Games Tracked</p>
            <p className="text-xl font-bold text-slate-200">{snapshot.gamesTracked}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Players Impacted</p>
            <p className="text-xl font-bold text-blue-400">{snapshot.playersImpacted}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Biggest Mover</p>
            <p className="text-sm font-bold text-amber-400 truncate">{snapshot.biggestMover.player}</p>
            <p className={`text-xs ${snapshot.biggestMover.delta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {snapshot.biggestMover.delta >= 0 ? '+' : ''}{snapshot.biggestMover.delta.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-4 pb-0">
          {(['games', 'alerts', 'timeline'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${tab === t ? 'bg-brand-lime/20 text-brand-lime' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>
              {t === 'games' ? `Live Games (${liveGames.length})` : t === 'alerts' ? `Impact Alerts (${alerts.length})` : 'Portfolio Timeline'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[45vh]">
          {tab === 'games' && (
            <div className="space-y-3">
              {games.map(game => (
                <div key={game.id} className={`bg-slate-800/50 border rounded-xl p-4 transition-all ${game.status === 'live' ? 'border-red-500/30' : 'border-slate-700/30'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {game.status === 'live' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{game.awayTeam} @ {game.homeTeam}</p>
                        <p className="text-xs text-slate-500">{game.sport} · {game.venue}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-200">{game.score.away} - {game.score.home}</p>
                      <p className="text-xs text-slate-400">{game.period} · {game.clock}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="text-slate-400">{game.impactedCards} cards impacted</span>
                    <span className={`font-bold ${game.portfolioImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      Portfolio: {game.portfolioImpact >= 0 ? '+' : ''}{game.portfolioImpact.toFixed(1)}%
                    </span>
                  </div>

                  <button onClick={() => setSelectedGame(selectedGame === game.id ? null : game.id)} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
                    {selectedGame === game.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {game.events.length} play-by-play events
                  </button>

                  {selectedGame === game.id && (
                    <div className="mt-3 space-y-2 border-t border-slate-700/30 pt-3">
                      {game.events.map(event => (
                        <div key={event.id} className="flex items-start gap-3 bg-slate-900/50 rounded-lg p-2">
                          <div className={`p-1 rounded ${event.cardValueDelta >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                            {event.cardValueDelta >= 0 ? <TrendingUp size={12} className="text-emerald-400" /> : <TrendingDown size={12} className="text-red-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-medium text-slate-300">{event.playerName}</p>
                              <span className={`text-xs font-bold ${event.cardValueDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {event.cardValueDelta >= 0 ? '+' : ''}{event.cardValueDelta.toFixed(1)}%
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5">{event.description}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] text-slate-600">Volume: {event.volumeSpike.toFixed(1)}x</span>
                              <span className="text-[10px] text-slate-600">{new Date(event.timestamp).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === 'alerts' && (
            <div className="space-y-2">
              {alerts.map(alert => (
                <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg border ${alert.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' : alert.severity === 'high' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700/30'}`}>
                  <div className={`p-1.5 rounded-lg ${alert.type === 'surge' ? 'bg-emerald-500/20' : alert.type === 'crash' ? 'bg-red-500/20' : 'bg-amber-500/20'}`}>
                    {alert.type === 'surge' ? <TrendingUp size={14} className="text-emerald-400" /> : alert.type === 'crash' ? <TrendingDown size={14} className="text-red-400" /> : <Zap size={14} className="text-amber-400" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-slate-200">{alert.playerName}</p>
                      <span className={`text-xs font-bold ${alert.cardValueChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {alert.cardValueChange >= 0 ? '+' : ''}{alert.cardValueChange.toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{alert.message}</p>
                    {alert.suggestedAction && (
                      <p className="text-[10px] text-blue-400 mt-1 flex items-center gap-1">
                        <Zap size={8} /> {alert.suggestedAction}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'timeline' && (
            <div>
              <p className="text-xs text-slate-400 mb-3">Portfolio value movement during today's games</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={snapshot.timeline}>
                    <defs>
                      <linearGradient id="impactGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={['dataMin - 50', 'dataMax + 50']} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }} />
                    <Area type="monotone" dataKey="portfolioValue" stroke="#84cc16" fill="url(#impactGrad)" strokeWidth={2} />
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

export default LiveGameImpactModal;
