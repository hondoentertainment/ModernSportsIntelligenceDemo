import React, { useState, useEffect, useCallback } from 'react';
import {
  X, Radio, TrendingUp, TrendingDown, Zap, Activity, Clock, Users,
  AlertTriangle, Target, Trophy, BarChart3, History, Bell, Settings,
  ChevronDown, ChevronUp, Eye, Percent, Volume2
} from 'lucide-react';
import {
  getActiveGames,
  getGameEvents,
  getPlayerPortfolioImpact,
  getPriceProjectionTimeline,
  getHistoricalCorrelations,
  getMilestoneAlerts,
  getAlertPreferences,
  updateAlertPreference,
  getAllLiveEvents,
  getPlayerPerformances,
  calculateRealTimeImpact,
  type LiveGame,
  type GameEvent,
  type PortfolioImpactCard,
  type PriceProjection,
  type HistoricalCorrelation,
  type MilestoneAlert,
  type AlertPreference,
  type PlayerPerformance,
} from '../lib/liveGameImpactEngineService.ts';
import { useSupabaseInventory } from '../lib/useSupabaseInventory.ts';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type TabKey = 'games' | 'portfolio' | 'projections' | 'history' | 'alerts';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'games', label: 'Live Games', icon: <Radio size={16} /> },
  { key: 'portfolio', label: 'Portfolio Impact', icon: <BarChart3 size={16} /> },
  { key: 'projections', label: 'Projections', icon: <TrendingUp size={16} /> },
  { key: 'history', label: 'History', icon: <History size={16} /> },
  { key: 'alerts', label: 'Alerts', icon: <Bell size={16} /> },
];

const LiveGameImpactEngineModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('games');
  const [games, setGames] = useState<LiveGame[]>([]);
  const [impactCards, setImpactCards] = useState<PortfolioImpactCard[]>([]);
  const [milestones, setMilestones] = useState<MilestoneAlert[]>([]);
  const [correlations, setCorrelations] = useState<HistoricalCorrelation[]>([]);
  const [alertPrefs, setAlertPrefs] = useState<AlertPreference[]>([]);
  const [performances, setPerformances] = useState<PlayerPerformance[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [selectedProjection, setSelectedProjection] = useState<PriceProjection | null>(null);
  const [historyFilter, setHistoryFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { inventory } = useSupabaseInventory();

  const loadData = useCallback(() => {
    try {
      const activeGames = getActiveGames();
      setGames(activeGames);
      setImpactCards(getPlayerPortfolioImpact(inventory, activeGames));
      setMilestones(getMilestoneAlerts());
      setCorrelations(getHistoricalCorrelations());
      setAlertPrefs(getAlertPreferences());
      setPerformances(getPlayerPerformances());
      setLoading(false);
    } catch (err) {
      setError('Failed to load live game data');
      setLoading(false);
    }
  }, [inventory]);

  useEffect(() => {
    if (!isOpen) return;
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [isOpen, loadData]);

  const handleProjectionSelect = useCallback((card: PortfolioImpactCard) => {
    if (card.impactEvents.length > 0) {
      const projection = getPriceProjectionTimeline(card.impactEvents[0].playerId, card.impactEvents[0]);
      setSelectedProjection(projection);
      setActiveTab('projections');
    }
  }, []);

  const handleAlertToggle = useCallback((id: string, enabled: boolean) => {
    const updated = updateAlertPreference(id, { enabled });
    setAlertPrefs(updated);
  }, []);

  if (!isOpen) return null;

  const liveGames = games.filter(g => g.status === 'live');
  const selectedGame = selectedGameId ? games.find(g => g.id === selectedGameId) : null;
  const selectedGameEvents = selectedGameId ? getGameEvents(selectedGameId) : [];
  const filteredCorrelations = historyFilter
    ? correlations.filter(c => c.eventType === historyFilter)
    : correlations;

  const totalImpactPct = impactCards.length > 0
    ? impactCards.reduce((sum, c) => sum + c.projectedChange, 0) / impactCards.length
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-xl">
              <Radio size={24} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Live Game Impact Engine</h2>
              <p className="text-xs text-slate-500">Real-time card value predictions powered by ML-style scoring</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {liveGames.length > 0 && (
              <span className="px-3 py-1.5 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 rounded-full animate-pulse">
                {liveGames.length} LIVE
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Summary Bar */}
        <div className="grid grid-cols-5 gap-3 p-4 bg-slate-800/30 border-b border-slate-800">
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Portfolio Impact</p>
            <p className={`text-xl font-bold ${totalImpactPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {totalImpactPct >= 0 ? '+' : ''}{totalImpactPct.toFixed(2)}%
            </p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Live Games</p>
            <p className="text-xl font-bold text-red-400">{liveGames.length}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Cards Affected</p>
            <p className="text-xl font-bold text-blue-400">{impactCards.length}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Active Milestones</p>
            <p className="text-xl font-bold text-amber-400">{milestones.filter(m => m.isLiveRelevant).length}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Top Mover</p>
            {impactCards.length > 0 ? (
              <>
                <p className="text-sm font-bold text-white truncate">{impactCards[0].player}</p>
                <p className={`text-xs ${impactCards[0].projectedChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {impactCards[0].projectedChange >= 0 ? '+' : ''}{impactCards[0].projectedChange.toFixed(1)}%
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-500">N/A</p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 px-4">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'text-brand-lime border-brand-lime'
                  : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AlertTriangle size={40} className="text-red-400 mb-4" />
              <p className="text-red-400 font-medium">{error}</p>
            </div>
          ) : (
            <>
              {/* ─── LIVE GAMES TAB ─────────────────────────────── */}
              {activeTab === 'games' && (
                <div className="space-y-6">
                  {/* Games Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {games.map(game => (
                      <button
                        key={game.id}
                        onClick={() => setSelectedGameId(selectedGameId === game.id ? null : game.id)}
                        className={`text-left p-4 rounded-xl border transition-all ${
                          selectedGameId === game.id
                            ? 'bg-slate-800 border-brand-lime/50'
                            : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {game.status === 'live' && (
                              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            )}
                            <span className="text-xs font-bold text-slate-400 uppercase">{game.sport}</span>
                            <span className="text-xs text-slate-600">{game.broadcast}</span>
                          </div>
                          <span className="text-xs text-slate-500">
                            {game.status === 'live' ? `${game.period} ${game.clock}` : game.status === 'pre_game' ? 'Pre-Game' : game.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-center gap-6 mb-3">
                          <div className="text-center">
                            <p className="text-lg font-bold text-white">{game.awayAbbrev}</p>
                            <p className="text-3xl font-bebas text-white">{game.score.away}</p>
                          </div>
                          <span className="text-slate-600 text-lg">@</span>
                          <div className="text-center">
                            <p className="text-lg font-bold text-white">{game.homeAbbrev}</p>
                            <p className="text-3xl font-bebas text-white">{game.score.home}</p>
                          </div>
                        </div>

                        <div className="text-xs text-slate-500 text-center">
                          {game.venue} {game.weather ? `| ${game.weather}` : ''}
                        </div>

                        {/* Key Players */}
                        {game.keyPlayers.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-1.5">
                            {game.keyPlayers.map(p => (
                              <div key={p.playerId} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-slate-300">{p.playerName}</span>
                                  <span className="text-[10px] text-slate-600">{p.position}</span>
                                </div>
                                <span className="text-xs text-slate-400">{p.statLine}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Play-by-Play for Selected Game */}
                  {selectedGame && (
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                      <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                        <Zap size={14} className="text-amber-400" />
                        Play-by-Play: {selectedGame.awayAbbrev} @ {selectedGame.homeAbbrev}
                      </h3>
                      {selectedGameEvents.length === 0 ? (
                        <p className="text-sm text-slate-500">No significant events yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {selectedGameEvents.map(evt => (
                            <div key={evt.id} className="flex gap-3 p-3 bg-slate-900/50 rounded-lg">
                              <div className={`w-1 rounded-full flex-shrink-0 ${
                                evt.cardValueDelta > 3 ? 'bg-emerald-500' :
                                evt.cardValueDelta < -1 ? 'bg-red-500' : 'bg-slate-600'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-white">{evt.playerName}</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">{evt.eventType.replace(/_/g, ' ')}</span>
                                    {evt.isHighlight && <Zap size={10} className="text-amber-400" />}
                                  </div>
                                  <span className="text-[10px] text-slate-600">{evt.period} {evt.clock}</span>
                                </div>
                                <p className="text-xs text-slate-400 mb-1">{evt.description}</p>
                                <div className="flex items-center gap-4 text-[10px]">
                                  <span className={evt.cardValueDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                                    Card: {evt.cardValueDelta >= 0 ? '+' : ''}{evt.cardValueDelta.toFixed(1)}%
                                  </span>
                                  <span className="text-slate-500">Vol: {evt.volumeSpike.toFixed(1)}x</span>
                                  <span className="text-slate-500">Conf: {(evt.confidence * 100).toFixed(0)}%</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Milestone Alerts */}
                  {milestones.filter(m => m.isLiveRelevant).length > 0 && (
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5">
                      <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                        <Target size={14} />
                        Live Milestone Alerts
                      </h3>
                      <div className="space-y-2">
                        {milestones.filter(m => m.isLiveRelevant).map(ms => (
                          <div key={ms.id} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
                            <Trophy size={16} className="text-amber-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-white">{ms.playerName}: {ms.milestoneType}</p>
                              <p className="text-[10px] text-slate-400">{ms.description}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-xs font-bold text-amber-400">+{ms.potentialPriceImpact}%</p>
                              <p className="text-[10px] text-slate-500">{ms.progressPercent.toFixed(0)}% there</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── PORTFOLIO IMPACT TAB ──────────────────────── */}
              {activeTab === 'portfolio' && (
                <div className="space-y-6">
                  {impactCards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Activity size={40} className="text-slate-600 mb-4" />
                      <p className="text-slate-400">No cards in your portfolio are affected by live games</p>
                      <p className="text-xs text-slate-600 mt-1">Cards matching live game players will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {impactCards.map(card => (
                        <div key={card.cardId} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {card.trend === 'up' ? (
                                <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                                  <TrendingUp size={16} className="text-emerald-400" />
                                </div>
                              ) : card.trend === 'down' ? (
                                <div className="p-1.5 bg-red-500/10 rounded-lg">
                                  <TrendingDown size={16} className="text-red-400" />
                                </div>
                              ) : (
                                <div className="p-1.5 bg-slate-700/50 rounded-lg">
                                  <Activity size={16} className="text-slate-500" />
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-bold text-white">{card.player}</p>
                                <p className="text-[10px] text-slate-500">{card.cardDescription}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-lg font-bold ${card.projectedChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {card.projectedChange >= 0 ? '+' : ''}{card.projectedChange.toFixed(1)}%
                              </p>
                              <p className="text-[10px] text-slate-500">Conf: {(card.confidence * 100).toFixed(0)}%</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3 mb-3">
                            <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                              <p className="text-[10px] text-slate-500">Current</p>
                              <p className="text-sm font-medium text-white">${card.currentValue.toLocaleString()}</p>
                            </div>
                            <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                              <p className="text-[10px] text-slate-500">Projected</p>
                              <p className={`text-sm font-medium ${card.projectedChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                ${card.projectedNewValue.toLocaleString()}
                              </p>
                            </div>
                            <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                              <p className="text-[10px] text-slate-500">Game</p>
                              <p className="text-sm font-medium text-slate-300">{card.gameName}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-400 truncate flex-1 mr-3">{card.latestEvent}</p>
                            <button
                              onClick={() => handleProjectionSelect(card)}
                              className="text-[10px] text-brand-lime hover:underline flex-shrink-0"
                            >
                              View Projections
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Player Performances */}
                  {performances.length > 0 && (
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5">
                      <h3 className="text-sm font-semibold text-slate-300 mb-4">Player Performance Tracker</h3>
                      <div className="space-y-2">
                        {performances.map(perf => (
                          <div key={perf.playerId} className="flex items-center justify-between p-3 bg-slate-900/40 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${
                                perf.performanceTrend === 'rising' ? 'bg-emerald-500' :
                                perf.performanceTrend === 'declining' ? 'bg-red-500' : 'bg-slate-500'
                              }`} />
                              <div>
                                <p className="text-xs font-medium text-white">{perf.playerName}</p>
                                <p className="text-[10px] text-slate-500">{perf.team} | {perf.currentStatLine}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-[10px] text-slate-500">Momentum</p>
                                <div className="w-16 h-1.5 bg-slate-700 rounded-full">
                                  <div
                                    className={`h-full rounded-full ${
                                      perf.momentumScore > 80 ? 'bg-emerald-500' :
                                      perf.momentumScore > 50 ? 'bg-amber-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${perf.momentumScore}%` }}
                                  />
                                </div>
                              </div>
                              <span className={`text-sm font-bold ${perf.sessionImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {perf.sessionImpact >= 0 ? '+' : ''}{perf.sessionImpact.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── PROJECTIONS TAB ──────────────────────────── */}
              {activeTab === 'projections' && (
                <div className="space-y-6">
                  {/* Projection Selector */}
                  <div className="flex gap-2 flex-wrap">
                    {impactCards.filter(c => c.impactEvents.length > 0).map(card => (
                      <button
                        key={card.cardId}
                        onClick={() => handleProjectionSelect(card)}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                          selectedProjection?.playerName === card.player
                            ? 'bg-brand-lime/10 border-brand-lime/50 text-brand-lime'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        {card.player}
                      </button>
                    ))}
                  </div>

                  {selectedProjection ? (
                    <>
                      {/* Projection Header */}
                      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-bold text-white">{selectedProjection.playerName}</h3>
                          <span className="text-xs text-slate-400">Current: ${selectedProjection.currentPrice.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-400 mb-4">{selectedProjection.eventDescription}</p>

                        {/* Projection Windows */}
                        <div className="grid grid-cols-4 gap-3">
                          {selectedProjection.projections.map(proj => (
                            <div key={proj.window} className="bg-slate-900/50 rounded-lg p-3 text-center">
                              <p className="text-[10px] text-slate-500 uppercase mb-1">{proj.window}</p>
                              <p className={`text-lg font-bold ${proj.predictedChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {proj.predictedChange >= 0 ? '+' : ''}{proj.predictedChange.toFixed(1)}%
                              </p>
                              <p className="text-xs text-slate-400">${proj.predictedPrice.toLocaleString()}</p>
                              <div className="mt-1">
                                <p className="text-[10px] text-slate-600">Conf: {(proj.confidence * 100).toFixed(0)}%</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Price Projection Chart */}
                      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-slate-300 mb-4">Price Projection Curve</h3>
                        <div className="h-72 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={selectedProjection.chartData}>
                              <defs>
                                <linearGradient id="projGradUpper" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="projGradPrice" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3} />
                                  <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} interval="preserveStartEnd" />
                              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={['auto', 'auto']} />
                              <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                                labelStyle={{ color: '#94a3b8' }}
                              />
                              <Area type="monotone" dataKey="upper" stroke="none" fill="url(#projGradUpper)" />
                              <Area type="monotone" dataKey="price" stroke="#84cc16" strokeWidth={2} fill="url(#projGradPrice)" />
                              <Area type="monotone" dataKey="lower" stroke="none" fill="url(#projGradUpper)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex items-center justify-center gap-6 mt-3 text-[10px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <span className="w-3 h-0.5 bg-brand-lime rounded" /> Projected Price
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-3 h-3 bg-emerald-500/15 rounded" /> Confidence Band
                          </span>
                        </div>
                      </div>

                      {/* Reasoning */}
                      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-slate-300 mb-3">Projection Reasoning</h3>
                        <div className="space-y-2">
                          {selectedProjection.projections.map(proj => (
                            <div key={proj.window} className="flex gap-3 p-2">
                              <span className="text-xs font-bold text-slate-400 w-10 flex-shrink-0">{proj.window}</span>
                              <p className="text-xs text-slate-500">{proj.reasoning}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <BarChart3 size={40} className="text-slate-600 mb-4" />
                      <p className="text-slate-400">Select a player above to view price projections</p>
                      <p className="text-xs text-slate-600 mt-1">Projections show predicted price at 1h, 24h, 48h, and 7d windows</p>
                    </div>
                  )}
                </div>
              )}

              {/* ─── HISTORY TAB ──────────────────────────────── */}
              {activeTab === 'history' && (
                <div className="space-y-6">
                  {/* Filter */}
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setHistoryFilter('')}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                        !historyFilter ? 'bg-brand-lime/10 border-brand-lime/50 text-brand-lime' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      All Events
                    </button>
                    {Array.from(new Set(correlations.map(c => c.eventType))).map((et: string) => (
                      <button
                        key={et}
                        onClick={() => setHistoryFilter(et)}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                          historyFilter === et ? 'bg-brand-lime/10 border-brand-lime/50 text-brand-lime' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        {et.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>

                  {/* Historical Correlation Cards */}
                  <div className="space-y-3">
                    {filteredCorrelations.map(corr => (
                      <div key={corr.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-sm font-bold text-white">{corr.playerName}</p>
                            <p className="text-xs text-slate-400">{corr.eventDescription}</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-lg font-bold ${corr.actualChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {corr.actualChange >= 0 ? '+' : ''}{corr.actualChange.toFixed(1)}%
                            </span>
                            <p className="text-[10px] text-slate-500">{corr.date}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-3 mb-3">
                          <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                            <p className="text-[10px] text-slate-500">Before</p>
                            <p className="text-xs font-medium text-slate-300">${corr.priceBeforeEvent}</p>
                          </div>
                          <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                            <p className="text-[10px] text-slate-500">+24h</p>
                            <p className={`text-xs font-medium ${corr.priceAfter24h >= corr.priceBeforeEvent ? 'text-emerald-400' : 'text-red-400'}`}>
                              ${corr.priceAfter24h}
                            </p>
                          </div>
                          <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                            <p className="text-[10px] text-slate-500">+48h</p>
                            <p className={`text-xs font-medium ${corr.priceAfter48h >= corr.priceBeforeEvent ? 'text-emerald-400' : 'text-red-400'}`}>
                              ${corr.priceAfter48h}
                            </p>
                          </div>
                          <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                            <p className="text-[10px] text-slate-500">+7d</p>
                            <p className={`text-xs font-medium ${corr.priceAfter7d >= corr.priceBeforeEvent ? 'text-emerald-400' : 'text-red-400'}`}>
                              ${corr.priceAfter7d}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-xs text-slate-400">{corr.cardDescription} | {corr.grade}</p>
                          <span className="text-[10px] text-slate-500">Vol: {corr.volumeSpike.toFixed(1)}x</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 italic">{corr.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── ALERTS TAB ───────────────────────────────── */}
              {activeTab === 'alerts' && (
                <div className="space-y-6">
                  {/* Milestone Alerts */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                      <Target size={14} className="text-amber-400" />
                      Upcoming Milestones
                    </h3>
                    <div className="space-y-3">
                      {milestones.map(ms => (
                        <div key={ms.id} className={`bg-slate-800/50 border rounded-xl p-4 ${
                          ms.urgency === 'imminent' ? 'border-amber-500/30' : 'border-slate-700/50'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {ms.urgency === 'imminent' && <AlertTriangle size={14} className="text-amber-400" />}
                              <span className="text-xs font-bold text-white">{ms.playerName}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                ms.urgency === 'imminent' ? 'bg-amber-500/20 text-amber-400' :
                                ms.urgency === 'approaching' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-slate-700 text-slate-400'
                              }`}>
                                {ms.urgency}
                              </span>
                              {ms.isLiveRelevant && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">LIVE</span>
                              )}
                            </div>
                            <span className="text-xs font-bold text-amber-400">+{ms.potentialPriceImpact}% potential</span>
                          </div>
                          <p className="text-xs text-slate-300 font-medium mb-1">{ms.milestoneType}</p>
                          <p className="text-xs text-slate-500 mb-2">{ms.description}</p>

                          {/* Progress Bar */}
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                              <span>{ms.currentProgress} / {ms.target}</span>
                              <span>{ms.progressPercent.toFixed(1)}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-700 rounded-full">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  ms.progressPercent > 90 ? 'bg-amber-500' :
                                  ms.progressPercent > 70 ? 'bg-blue-500' : 'bg-slate-500'
                                }`}
                                style={{ width: `${Math.min(100, ms.progressPercent)}%` }}
                              />
                            </div>
                          </div>

                          <p className="text-[10px] text-slate-600 italic">{ms.historicalPrecedent}</p>
                          <p className="text-[10px] text-slate-500 mt-1">Est: {ms.estimatedDate}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notification Preferences */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                      <Settings size={14} className="text-slate-400" />
                      Notification Preferences
                    </h3>
                    <div className="space-y-2">
                      {alertPrefs.map(pref => (
                        <div key={pref.id} className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleAlertToggle(pref.id, !pref.enabled); }}
                              className={`w-10 h-5 rounded-full transition-colors relative ${pref.enabled ? 'bg-brand-lime' : 'bg-slate-700'}`}
                            >
                              <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${pref.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </button>
                            <div>
                              <p className="text-xs font-medium text-white capitalize">{pref.type.replace(/_/g, ' ')}</p>
                              <p className="text-[10px] text-slate-500">
                                {pref.threshold !== 0 ? `Threshold: ${pref.threshold > 0 ? '+' : ''}${pref.threshold}%` : 'All events'}
                              </p>
                            </div>
                          </div>
                          <span className={`text-[10px] ${pref.enabled ? 'text-brand-lime' : 'text-slate-600'}`}>
                            {pref.enabled ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveGameImpactEngineModal;
