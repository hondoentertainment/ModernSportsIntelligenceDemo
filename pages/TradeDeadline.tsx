// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarClock,
  AlertTriangle,
  TrendingUp,
  Clock,
  Activity,
  Users,
  Flame,
  BarChart3,
  ArrowRightLeft,
} from 'lucide-react';
import {
  getTradeEvents as _getTradeEvents,
  getFreeAgencySignings,
  getMarketReactions as _getMarketReactions,
  getTradeRumors as _getTradeRumors,
  getLeagueDeadlines,
  getHistoricalComparisons,
  getSummaryStats,
  getValueChanges,
  formatCurrency,
  formatDate,
  type FreeAgencySigning,
  type LeagueDeadline,
  type HistoricalComparison,
  type TradeDeadlineSummary,
  type ValueChange,
} from '../lib/trading/tradeDeadlineService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from 'recharts';

// Page-local adapted types to match UI expectations
interface TradeEvent {
  id: string;
  title: string;
  date: string;
  league: string;
  impactLevel: string;
  marketImpact: number;
  description: string;
  playersInvolved: string[];
  fromTeam: string;
  toTeam: string;
  cardsAffected: number;
}

interface MarketReaction {
  date: string;
  marketIndex: number;
  tradingVolume: number;
  sentimentScore: number;
}

interface TradeRumor {
  id: string;
  title: string;
  description: string;
  status: string;
  confidence: number;
  source: string;
  players: string[];
  estimatedImpact: number;
}

function getTradeEvents(): TradeEvent[] {
  return _getTradeEvents().map(e => ({
    id: e.id,
    title: e.headline,
    date: e.date,
    league: e.league.toUpperCase(),
    impactLevel: Math.abs(e.cardValueImpact) > 500 ? 'major' : Math.abs(e.cardValueImpact) > 200 ? 'moderate' : 'minor',
    marketImpact: e.cardValueImpact,
    description: e.tradeDetails,
    playersInvolved: [e.playerTraded, ...e.assetsReceived.slice(0, 2)],
    fromTeam: e.fromTeam,
    toTeam: e.toTeam,
    cardsAffected: Math.ceil(Math.abs(e.cardValueImpact) / 50),
  }));
}

function getMarketReactions(): MarketReaction[] {
  return _getMarketReactions().map(r => ({
    date: r.timestamp.split('T')[0],
    marketIndex: 100 + r.priceMovement,
    tradingVolume: r.volumeSpike,
    sentimentScore: r.marketSentiment === 'bullish' ? 75 : r.marketSentiment === 'bearish' ? 25 : 50,
  }));
}

function getTradeRumors(): TradeRumor[] {
  return _getTradeRumors().map(r => ({
    id: r.id,
    title: `${r.playerName} to ${r.rumoredTeams[0] || 'TBD'}`,
    description: r.description,
    status: r.status,
    confidence: r.confidence,
    source: r.source,
    players: [r.playerName],
    estimatedImpact: r.potentialCardImpact,
  }));
}

const IMPACT_BADGES: Record<string, { bg: string; text: string }> = {
  major: { bg: 'bg-red-500/20', text: 'text-red-400' },
  moderate: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  minor: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  neutral: { bg: 'bg-slate-500/20', text: 'text-slate-400' },
};

const TradeDeadline: React.FC = () => {
  const [tradeEvents, setTradeEvents] = useState<TradeEvent[]>([]);
  const [signings, setSignings] = useState<FreeAgencySigning[]>([]);
  const [reactions, setReactions] = useState<MarketReaction[]>([]);
  const [rumors, setRumors] = useState<TradeRumor[]>([]);
  const [deadlines, setDeadlines] = useState<LeagueDeadline[]>([]);
  const [historicalComps, setHistoricalComps] = useState<HistoricalComparison[]>([]);
  const [summary, setSummary] = useState<TradeDeadlineSummary | null>(null);
  const [valueChanges, setValueChanges] = useState<ValueChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setTradeEvents(getTradeEvents());
      setSignings(getFreeAgencySignings());
      setReactions(getMarketReactions());
      setRumors(getTradeRumors());
      setDeadlines(getLeagueDeadlines());
      setHistoricalComps(getHistoricalComparisons());
      setSummary(getSummaryStats());
      setValueChanges(getValueChanges());
      setLoading(false);
    } catch  {
      setError('Failed to load Trade Deadline data');
      setLoading(false);
    }
  }, []);

  const totalMarketImpact = useMemo(() => tradeEvents.reduce((s, e) => s + e.marketImpact, 0), [tradeEvents]);
  const avgConfidence = useMemo(() => rumors.length > 0 ? rumors.reduce((s, r) => s + r.confidence, 0) / rumors.length : 0, [rumors]);

  const valueChangeChartData = useMemo(() => {
    return valueChanges.map(vc => ({
      trade: vc.tradeName.length > 20 ? vc.tradeName.slice(0, 20) + '...' : vc.tradeName,
      increase: vc.valueIncrease,
      decrease: vc.valueDecrease,
    }));
  }, [valueChanges]);

  const reactionChartData = useMemo(() => {
    return reactions.map(r => ({
      date: r.date,
      marketIndex: r.marketIndex,
      volume: r.tradingVolume,
      sentiment: r.sentimentScore,
    }));
  }, [reactions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Trade Deadline Tracker...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <AlertTriangle size={32} className="text-red-400 mx-auto mb-4" />
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/20">
            <CalendarClock size={24} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Trade Deadline &amp; Free Agency Impact Tracker</h1>
            <p className="text-sm text-slate-400">Real-time trade analysis and free agency market impact &mdash; Phase 149</p>
          </div>
        </div>
        {summary && (
          <span className="px-3 py-1.5 text-sm font-bold bg-red-500/20 text-red-300 rounded-full">
            {summary.activeTrades} Active Trades
          </span>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Trades</p>
          <p className="text-2xl font-bold text-white">{summary?.totalTrades ?? 0}</p>
          <p className="text-xs text-slate-600 mt-1">This season</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Market Impact</p>
          <p className="text-2xl font-bold text-red-400">{formatCurrency(totalMarketImpact)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">FA Signings</p>
          <p className="text-2xl font-bold text-blue-400">{signings.length}</p>
          <p className="text-xs text-slate-600 mt-1">Completed</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Active Rumors</p>
          <p className="text-2xl font-bold text-amber-400">{rumors.filter(r => r.status === 'active').length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Confidence</p>
          <p className="text-2xl font-bold text-violet-400">{avgConfidence.toFixed(0)}%</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Cards Affected</p>
          <p className="text-2xl font-bold text-emerald-400">{summary?.cardsAffected ?? 0}</p>
          <p className="text-xs text-slate-600 mt-1">Value shifted</p>
        </div>
      </div>

      {/* Trade Events Timeline */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
          <ArrowRightLeft size={18} className="text-red-400" />
          Trade Events Timeline
        </h2>
        <div className="space-y-3">
          {tradeEvents.map(event => {
            const badge = IMPACT_BADGES[event.impactLevel] || IMPACT_BADGES.neutral;
            return (
              <div key={event.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <div>
                      <p className="text-sm font-bold text-white">{event.title}</p>
                      <p className="text-[10px] text-slate-500">{formatDate(event.date)} &middot; {event.league}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                      {event.impactLevel}
                    </span>
                    <span className={`text-sm font-bold ${event.marketImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {event.marketImpact >= 0 ? '+' : ''}{formatCurrency(event.marketImpact)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-2">{event.description}</p>
                <div className="flex gap-2 flex-wrap">
                  {event.playersInvolved.map((player, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-300 border border-slate-600/30">
                      {player}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-[10px] text-slate-500">From: <span className="text-slate-300">{event.fromTeam}</span></span>
                  <span className="text-[10px] text-slate-500">To: <span className="text-slate-300">{event.toTeam}</span></span>
                  <span className="text-[10px] text-slate-500">Cards affected: <span className="text-slate-300">{event.cardsAffected}</span></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BarChart for Value Changes + LineChart for Market Reaction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-brand-lime" />
            Card Value Changes per Trade
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={valueChangeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="trade" tick={{ fontSize: 9, fill: '#64748b' }} angle={-15} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} formatter={(value: number) => [formatCurrency(value)]} />
                <Bar dataKey="increase" fill="#22c55e" name="Value Increase" radius={[4, 4, 0, 0]} />
                <Bar dataKey="decrease" fill="#ef4444" name="Value Decrease" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 text-[10px] text-slate-500 mt-2">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500 rounded" /> Increase</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded" /> Decrease</span>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <Activity size={18} className="text-cyan-400" />
            Market Reaction Over Time
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reactionChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="marketIndex" stroke="#3b82f6" strokeWidth={2} name="Market Index" dot={false} />
                <Line type="monotone" dataKey="sentiment" stroke="#84cc16" strokeWidth={2} name="Sentiment" dot={false} />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Free Agency Signings Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
          <Users size={18} className="text-blue-400" />
          Free Agency Signings &amp; Market Impact
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Player</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">From</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">To</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Contract</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Years</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Card Impact</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Market Shift</th>
              </tr>
            </thead>
            <tbody>
              {signings.map(signing => (
                <tr key={signing.id} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                  <td className="py-2 px-3 text-white font-medium">{signing.player}</td>
                  <td className="py-2 px-3 text-slate-400">{signing.fromTeam}</td>
                  <td className="py-2 px-3 text-slate-300 font-medium">{signing.toTeam}</td>
                  <td className="py-2 px-3 text-right text-emerald-400 font-bold">{formatCurrency(signing.contractValue)}</td>
                  <td className="py-2 px-3 text-right text-slate-300">{signing.years}</td>
                  <td className="py-2 px-3 text-right">
                    <span className={signing.cardImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {signing.cardImpact >= 0 ? '+' : ''}{signing.cardImpact.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${IMPACT_BADGES[signing.marketShift]?.bg || 'bg-slate-500/20'} ${IMPACT_BADGES[signing.marketShift]?.text || 'text-slate-400'}`}>
                      {signing.marketShift}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trade Rumors Panel + Deadline Countdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trade Rumors */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <Flame size={18} className="text-amber-400" />
            Trade Rumors &amp; Confidence Levels
          </h2>
          <div className="space-y-3">
            {rumors.map(rumor => (
              <div key={rumor.id} className={`bg-slate-900/50 border rounded-xl p-4 ${rumor.status === 'active' ? 'border-amber-500/30' : 'border-slate-700/30'}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-white">{rumor.title}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${rumor.status === 'active' ? 'bg-amber-500/20 text-amber-400' : rumor.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                      {rumor.status}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-2">{rumor.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">Confidence:</span>
                    <div className="w-24 h-2 bg-slate-700 rounded-full">
                      <div
                        className={`h-full rounded-full ${rumor.confidence >= 80 ? 'bg-emerald-500' : rumor.confidence >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${rumor.confidence}%` }}
                      />
                    </div>
                    <span className={`text-[10px] font-bold ${rumor.confidence >= 80 ? 'text-emerald-400' : rumor.confidence >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                      {rumor.confidence}%
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">Source: {rumor.source}</span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] text-slate-500">Players: <span className="text-slate-300">{rumor.players.join(', ')}</span></span>
                  <span className="text-[10px] text-slate-500">Est. Impact: <span className={rumor.estimatedImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}>{rumor.estimatedImpact >= 0 ? '+' : ''}{formatCurrency(rumor.estimatedImpact)}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deadline Countdown Cards per League */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <Clock size={18} className="text-red-400" />
            Deadline Countdown by League
          </h2>
          <div className="space-y-3">
            {deadlines.map(dl => {
              const now = new Date();
              const deadlineDate = new Date(dl.deadline);
              const daysLeft = Math.max(0, Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
              const isUrgent = daysLeft <= 7;
              const isPassed = daysLeft === 0;
              return (
                <div key={dl.id} className={`bg-slate-900/50 border rounded-xl p-4 ${isUrgent ? 'border-red-500/30' : 'border-slate-700/30'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold text-white">{dl.league}</p>
                      <p className="text-[10px] text-slate-500">{dl.deadlineType}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${isPassed ? 'text-slate-500' : isUrgent ? 'text-red-400' : 'text-emerald-400'}`}>
                        {isPassed ? 'PASSED' : `${daysLeft}d`}
                      </p>
                      <p className="text-[10px] text-slate-500">{formatDate(dl.deadline)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                      <p className="text-[10px] text-slate-500">Completed</p>
                      <p className="text-sm font-bold text-emerald-400">{dl.completedTrades}</p>
                    </div>
                    <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                      <p className="text-[10px] text-slate-500">Pending</p>
                      <p className="text-sm font-bold text-amber-400">{dl.pendingTrades}</p>
                    </div>
                    <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                      <p className="text-[10px] text-slate-500">Volume</p>
                      <p className="text-sm font-bold text-blue-400">{formatCurrency(dl.totalVolume)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Historical Trade Impact Comparison */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-violet-400" />
          Historical Trade Impact Comparison
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Season</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Notable Trade</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Total Trades</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Market Volume</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Avg Impact</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Top Card Change</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Impact Rating</th>
              </tr>
            </thead>
            <tbody>
              {historicalComps.map(comp => (
                <tr key={comp.id} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                  <td className="py-2 px-3 text-white font-medium">{comp.season}</td>
                  <td className="py-2 px-3 text-slate-400 text-xs truncate max-w-[200px]">{comp.notableTrade}</td>
                  <td className="py-2 px-3 text-right text-slate-300">{comp.totalTrades}</td>
                  <td className="py-2 px-3 text-right text-blue-400 font-bold">{formatCurrency(comp.marketVolume)}</td>
                  <td className="py-2 px-3 text-right">
                    <span className={comp.avgImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {comp.avgImpact >= 0 ? '+' : ''}{comp.avgImpact.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <span className={comp.topCardChange >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {comp.topCardChange >= 0 ? '+' : ''}{formatCurrency(comp.topCardChange)}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${i < comp.impactRating ? 'bg-red-400' : 'bg-slate-700'}`} />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TradeDeadline;
