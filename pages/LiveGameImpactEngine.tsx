import React, { useState, useEffect, useCallback } from 'react';
import {
  Radio,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Trophy,
  BarChart3,
  History,
  Bell,
  Zap,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
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
  getPlayerPerformances,
  type LiveGame,
  type PortfolioImpactCard,
  type PriceProjection,
  type HistoricalCorrelation,
  type MilestoneAlert,
  type AlertPreference,
  type PlayerPerformance,
} from '../lib/liveGameImpactEngineService.ts';
import { useSupabaseInventory } from '../lib/useSupabaseInventory.ts';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const LiveGameImpactEngine: React.FC = () => {
  const [games, setGames] = useState<LiveGame[]>([]);
  const [impactCards, setImpactCards] = useState<PortfolioImpactCard[]>([]);
  const [milestones, setMilestones] = useState<MilestoneAlert[]>([]);
  const [correlations, setCorrelations] = useState<HistoricalCorrelation[]>([]);
  const [alertPrefs, setAlertPrefs] = useState<AlertPreference[]>([]);
  const [_performances, setPerformances] = useState<PlayerPerformance[]>([]);
  const [selectedProjection, setSelectedProjection] = useState<PriceProjection | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [historyFilter, setHistoryFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [pulse, setPulse] = useState(false);

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
      setLastRefresh(new Date());
      setLoading(false);
      setPulse(true);
      setTimeout(() => setPulse(false), 500);
    } catch  {
      setError('Failed to load live game data');
      setLoading(false);
    }
  }, [inventory]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  const liveGames = games.filter(g => g.status === 'live');
  const totalImpactPct = impactCards.length > 0
    ? impactCards.reduce((sum, c) => sum + c.projectedChange, 0) / impactCards.length
    : 0;
  const totalImpactDollar = impactCards.reduce((sum, c) => sum + (c.projectedChange * c.currentValue / 100), 0);

  const selectedGameEvents = selectedGameId ? getGameEvents(selectedGameId) : [];
  const filteredCorrelations = historyFilter
    ? correlations.filter(c => c.eventType === historyFilter)
    : correlations;

  const handleProjectionSelect = (card: PortfolioImpactCard) => {
    if (card.impactEvents.length > 0) {
      setSelectedProjection(getPriceProjectionTimeline(card.impactEvents[0].playerId, card.impactEvents[0]));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Live Game Impact Engine...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertTriangle size={48} className="text-red-400 mb-4" />
        <p className="text-red-400 font-medium text-lg">{error}</p>
        <button onClick={loadData} className="mt-4 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl bg-red-500/20 ${liveGames.length > 0 ? 'animate-pulse' : ''}`}>
            <Radio size={24} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Live Game Impact Engine</h1>
            <p className="text-sm text-slate-400">
              Real-time card value predictions powered by ML-style scoring &mdash; Phase 104
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {liveGames.length > 0 && (
            <span className="px-3 py-1.5 text-sm font-bold bg-red-500/20 text-red-300 rounded-full animate-pulse">
              {liveGames.length} GAMES LIVE
            </span>
          )}
          <button
            onClick={loadData}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title="Refresh data"
          >
            <RefreshCw size={18} className={pulse ? 'animate-spin' : ''} />
          </button>
          <span className="text-[10px] text-slate-600">
            Updated {lastRefresh.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* ─── Summary Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Portfolio Impact</p>
          <p className={`text-3xl font-bold ${totalImpactPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalImpactPct >= 0 ? '+' : ''}{totalImpactPct.toFixed(2)}%
          </p>
          <p className={`text-xs mt-1 ${totalImpactDollar >= 0 ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
            {totalImpactDollar >= 0 ? '+' : ''}${Math.abs(totalImpactDollar).toFixed(2)}
          </p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Live Games</p>
          <p className="text-3xl font-bold text-red-400">{liveGames.length}</p>
          <p className="text-xs text-slate-600 mt-1">{games.length} total tracked</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Cards Affected</p>
          <p className="text-3xl font-bold text-blue-400">{impactCards.length}</p>
          <p className="text-xs text-slate-600 mt-1">in your portfolio</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Milestones</p>
          <p className="text-3xl font-bold text-amber-400">{milestones.filter(m => m.urgency === 'imminent').length}</p>
          <p className="text-xs text-slate-600 mt-1">imminent tonight</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Top Mover</p>
          {impactCards.length > 0 ? (
            <>
              <p className="text-lg font-bold text-white truncate">{impactCards[0].player}</p>
              <p className={`text-sm ${impactCards[0].projectedChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {impactCards[0].projectedChange >= 0 ? '+' : ''}{impactCards[0].projectedChange.toFixed(1)}%
              </p>
            </>
          ) : (
            <p className="text-lg text-slate-500">N/A</p>
          )}
        </div>
      </div>

      {/* ─── Live Game Scoreboard ───────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {games.map(game => (
          <button
            key={game.id}
            onClick={() => setSelectedGameId(selectedGameId === game.id ? null : game.id)}
            className={`text-left p-4 rounded-xl border transition-all ${
              selectedGameId === game.id
                ? 'bg-slate-800 border-brand-lime/50 shadow-lg shadow-brand-lime/5'
                : game.status === 'live'
                  ? 'bg-slate-800/50 border-slate-700/50 hover:border-red-500/30'
                  : 'bg-slate-800/30 border-slate-700/30 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {game.status === 'live' && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
                <span className="text-xs font-bold text-slate-400 uppercase">{game.sport}</span>
              </div>
              <span className="text-xs text-slate-500">
                {game.status === 'live' ? `${game.period} ${game.clock}` : game.status === 'pre_game' ? 'Pre-Game' : game.status}
              </span>
            </div>

            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="text-center min-w-[3rem]">
                <p className="text-sm font-bold text-white">{game.awayAbbrev}</p>
                <p className="text-2xl font-bebas text-white">{game.score.away}</p>
              </div>
              <span className="text-slate-600">@</span>
              <div className="text-center min-w-[3rem]">
                <p className="text-sm font-bold text-white">{game.homeAbbrev}</p>
                <p className="text-2xl font-bebas text-white">{game.score.home}</p>
              </div>
            </div>

            <p className="text-[10px] text-slate-600 text-center truncate">
              {game.venue} {game.broadcast ? `| ${game.broadcast}` : ''}
            </p>
          </button>
        ))}
      </div>

      {/* Selected Game Play-by-Play */}
      {selectedGameId && selectedGameEvents.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Zap size={14} className="text-amber-400" />
            Play-by-Play: {games.find(g => g.id === selectedGameId)?.awayAbbrev} @ {games.find(g => g.id === selectedGameId)?.homeAbbrev}
          </h3>
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
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">
                        {evt.eventType.replace(/_/g, ' ')}
                      </span>
                      {evt.isHighlight && <Zap size={10} className="text-amber-400" />}
                    </div>
                    <span className="text-[10px] text-slate-600">{evt.period} {evt.clock}</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-1">{evt.description}</p>
                  <div className="flex items-center gap-4 text-[10px]">
                    <span className={evt.cardValueDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      Card Impact: {evt.cardValueDelta >= 0 ? '+' : ''}{evt.cardValueDelta.toFixed(1)}%
                    </span>
                    <span className="text-slate-500">Volume: {evt.volumeSpike.toFixed(1)}x</span>
                    <span className="text-slate-500">Confidence: {(evt.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Real-time Portfolio Impact ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Impact Cards */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <BarChart3 size={18} className="text-blue-400" />
            Real-Time Portfolio Impact
          </h2>
          {impactCards.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
              <Activity size={40} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No portfolio cards affected by live games</p>
            </div>
          ) : (
            <div className="space-y-3">
              {impactCards.map(card => (
                <div key={card.cardId} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {card.trend === 'up' ? (
                        <TrendingUp size={18} className="text-emerald-400" />
                      ) : card.trend === 'down' ? (
                        <TrendingDown size={18} className="text-red-400" />
                      ) : (
                        <Activity size={18} className="text-slate-500" />
                      )}
                      <div>
                        <p className="text-sm font-bold text-white">{card.player}</p>
                        <p className="text-[10px] text-slate-500">{card.cardDescription}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${card.projectedChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {card.projectedChange >= 0 ? '+' : ''}{card.projectedChange.toFixed(1)}%
                      </p>
                      <p className="text-[10px] text-slate-500">
                        ${card.currentValue.toLocaleString()} &rarr; ${card.projectedNewValue.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-slate-400 truncate flex-1 mr-4">{card.latestEvent}</p>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-[10px] text-slate-500">
                        Conf: {(card.confidence * 100).toFixed(0)}% | {card.gameName}
                      </span>
                      <button
                        onClick={() => handleProjectionSelect(card)}
                        className="text-[10px] text-brand-lime hover:underline flex items-center gap-1"
                      >
                        Projections <ChevronRight size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Milestone Alerts Sidebar */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Target size={18} className="text-amber-400" />
            Milestone Alerts
          </h2>
          <div className="space-y-3">
            {milestones.map(ms => (
              <div key={ms.id} className={`bg-slate-800/50 border rounded-xl p-4 ${
                ms.urgency === 'imminent' ? 'border-amber-500/30' :
                ms.urgency === 'approaching' ? 'border-blue-500/20' : 'border-slate-700/50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {ms.urgency === 'imminent' ? (
                      <AlertTriangle size={14} className="text-amber-400" />
                    ) : (
                      <Trophy size={14} className="text-slate-500" />
                    )}
                    <span className="text-xs font-bold text-white">{ms.playerName}</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    ms.urgency === 'imminent' ? 'bg-amber-500/20 text-amber-400' :
                    ms.urgency === 'approaching' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-slate-700 text-slate-400'
                  }`}>
                    {ms.urgency}
                    {ms.isLiveRelevant && ' (LIVE)'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium">{ms.milestoneType}</p>
                <p className="text-[10px] text-slate-500 mt-1 mb-2">{ms.description}</p>

                {/* Progress */}
                <div className="mb-1">
                  <div className="w-full h-1.5 bg-slate-700 rounded-full">
                    <div
                      className={`h-full rounded-full ${
                        ms.progressPercent > 90 ? 'bg-amber-500' :
                        ms.progressPercent > 70 ? 'bg-blue-500' : 'bg-slate-500'
                      }`}
                      style={{ width: `${Math.min(100, ms.progressPercent)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
                    <span>{ms.currentProgress}/{ms.target}</span>
                    <span className="text-amber-400/80">+{ms.potentialPriceImpact}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Interactive Price Projection Charts ───────────────── */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-brand-lime" />
          Price Projection Charts
        </h2>

        {/* Player Selector */}
        <div className="flex gap-2 flex-wrap mb-6">
          {impactCards.filter(c => c.impactEvents.length > 0).map(card => (
            <button
              key={card.cardId}
              onClick={() => handleProjectionSelect(card)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                selectedProjection?.playerName === card.player
                  ? 'bg-brand-lime/10 border-brand-lime/50 text-brand-lime'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
              }`}
            >
              {card.player}
              <span className={`ml-1 ${card.projectedChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {card.projectedChange >= 0 ? '+' : ''}{card.projectedChange.toFixed(1)}%
              </span>
            </button>
          ))}
        </div>

        {selectedProjection ? (
          <div className="space-y-6">
            {/* Projection Windows */}
            <div className="grid grid-cols-4 gap-4">
              {selectedProjection.projections.map(proj => (
                <div key={proj.window} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 text-center">
                  <p className="text-xs text-slate-500 uppercase mb-2">{proj.window}</p>
                  <p className={`text-2xl font-bold ${proj.predictedChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {proj.predictedChange >= 0 ? '+' : ''}{proj.predictedChange.toFixed(1)}%
                  </p>
                  <p className="text-sm text-slate-400 mt-1">${proj.predictedPrice.toLocaleString()}</p>
                  <div className="mt-2 w-full h-1 bg-slate-700 rounded-full">
                    <div
                      className="h-full bg-brand-lime rounded-full"
                      style={{ width: `${proj.confidence * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-600 mt-1">Conf: {(proj.confidence * 100).toFixed(0)}%</p>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={selectedProjection.chartData}>
                  <defs>
                    <linearGradient id="pageGradUpper" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="pageGradPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#84cc16" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#94a3b8' }}
                    formatter={(value: number, name: string) => [
                      `$${value.toFixed(2)}`,
                      name === 'price' ? 'Predicted' : name === 'upper' ? 'Upper Band' : 'Lower Band'
                    ]}
                  />
                  <Area type="monotone" dataKey="upper" stroke="none" fill="url(#pageGradUpper)" />
                  <Area type="monotone" dataKey="price" stroke="#84cc16" strokeWidth={2} fill="url(#pageGradPrice)" dot={false} />
                  <Area type="monotone" dataKey="lower" stroke="none" fill="url(#pageGradUpper)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-brand-lime rounded" /> Projected Price
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-emerald-500/12 rounded" /> Confidence Band
              </span>
            </div>

            {/* Event Context */}
            <div className="bg-slate-900/50 rounded-lg p-4">
              <p className="text-xs text-slate-300 font-medium mb-1">Event: {selectedProjection.eventDescription}</p>
              <p className="text-[10px] text-slate-500">
                Current price: ${selectedProjection.currentPrice.toLocaleString()} |
                Band: ${selectedProjection.confidenceBand.lower.toLocaleString()} - ${selectedProjection.confidenceBand.upper.toLocaleString()}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 size={40} className="text-slate-600 mb-3" />
            <p className="text-slate-400">Select a player above to view price projections</p>
            <p className="text-xs text-slate-600 mt-1">Shows predicted price curves at 1h, 24h, 48h, and 7d windows</p>
          </div>
        )}
      </div>

      {/* ─── Historical Correlation Explorer ────────────────────── */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <History size={18} className="text-purple-400" />
          Historical Correlation Explorer
        </h2>

        {/* Filter Chips */}
        <div className="flex gap-2 flex-wrap mb-4">
          <button
            onClick={() => setHistoryFilter('')}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              !historyFilter ? 'bg-brand-lime/10 border-brand-lime/50 text-brand-lime' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            All
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCorrelations.map(corr => (
            <div key={corr.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">{corr.playerName}</span>
                <span className={`text-sm font-bold ${corr.actualChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {corr.actualChange >= 0 ? '+' : ''}{corr.actualChange.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-2">{corr.eventDescription}</p>

              <div className="grid grid-cols-4 gap-2 mb-2">
                <div className="text-center">
                  <p className="text-[10px] text-slate-600">Before</p>
                  <p className="text-xs text-slate-400">${corr.priceBeforeEvent}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-600">+24h</p>
                  <p className={`text-xs ${corr.priceAfter24h >= corr.priceBeforeEvent ? 'text-emerald-400' : 'text-red-400'}`}>
                    ${corr.priceAfter24h}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-600">+48h</p>
                  <p className={`text-xs ${corr.priceAfter48h >= corr.priceBeforeEvent ? 'text-emerald-400' : 'text-red-400'}`}>
                    ${corr.priceAfter48h}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-600">+7d</p>
                  <p className={`text-xs ${corr.priceAfter7d >= corr.priceBeforeEvent ? 'text-emerald-400' : 'text-red-400'}`}>
                    ${corr.priceAfter7d}
                  </p>
                </div>
              </div>

              <p className="text-[10px] text-slate-500">{corr.cardDescription} | {corr.grade} | Vol: {corr.volumeSpike}x</p>
              <p className="text-[10px] text-slate-600 mt-1 italic">{corr.summary}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Alert Configuration Panel ──────────────────────────── */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Bell size={18} className="text-slate-400" />
          Alert Configuration
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {alertPrefs.map(pref => (
            <div key={pref.id} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const updated = updateAlertPreference(pref.id, { enabled: !pref.enabled });
                    setAlertPrefs(updated);
                  }}
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveGameImpactEngine;
