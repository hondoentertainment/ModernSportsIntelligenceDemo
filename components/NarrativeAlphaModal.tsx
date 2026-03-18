import React, { useState, useMemo, useCallback } from 'react';
import {
  X,
  BookOpen,
  Radio,
  Zap,
  TrendingUp,
  Clock,
  Target,
  BarChart3,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Filter,
} from 'lucide-react';
import {
  getNarrativeSignals,
  getEmergingNarratives,
  getNarrativeTimeline,
  getMediaMentions,
  getNarrativeStats,
  getNarrativesByPhase,
  getTopAlphaOpportunities,
  NarrativeSignal,
  MediaMention,
  NarrativeTimeline,
  MaturityPhase,
  NARRATIVE_TYPE_META,
  PHASE_COLORS,
  PHASE_ORDER,
} from '../lib/analytics/narrativeAlphaService';

interface NarrativeAlphaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'feed' | 'timeline' | 'media' | 'alpha';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'feed', label: 'Narrative Feed', icon: <Radio size={16} /> },
  { id: 'timeline', label: 'Timeline View', icon: <Clock size={16} /> },
  { id: 'media', label: 'Media Scanner', icon: <Eye size={16} /> },
  { id: 'alpha', label: 'Alpha Tracker', icon: <BarChart3 size={16} /> },
];

const SOURCE_ICONS: Record<string, string> = {
  'ESPN': '📺',
  'Twitter/X': '𝕏',
  'Reddit': '🔴',
  'YouTube': '▶',
  'Podcast': '🎙',
  'Bloomberg': '💹',
  'Local News': '📰',
};

const NarrativeAlphaModal: React.FC<NarrativeAlphaModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('feed');
  const [phaseFilter, setPhaseFilter] = useState<MaturityPhase | 'all'>('all');
  const [selectedNarrativeId, setSelectedNarrativeId] = useState<string>('ns-001');
  const [mediaPlayerFilter, setMediaPlayerFilter] = useState<string>('');

  const stats = useMemo(() => getNarrativeStats(), []);
  const allSignals = useMemo(() => getNarrativeSignals(), []);
  const emerging = useMemo(() => getEmergingNarratives(), []);
  const topAlpha = useMemo(() => getTopAlphaOpportunities(), []);

  const filteredSignals = useMemo(() => {
    if (phaseFilter === 'all') return allSignals;
    return getNarrativesByPhase(phaseFilter);
  }, [phaseFilter, allSignals]);

  const selectedTimeline = useMemo(
    () => getNarrativeTimeline(selectedNarrativeId),
    [selectedNarrativeId]
  );

  const selectedNarrative = useMemo(
    () => allSignals.find((s) => s.id === selectedNarrativeId),
    [selectedNarrativeId, allSignals]
  );

  const mediaMentions = useMemo(
    () => getMediaMentions(mediaPlayerFilter || undefined),
    [mediaPlayerFilter]
  );

  const uniquePlayers = useMemo(() => {
    const players = new Set(allSignals.map((s) => s.playerName));
    return Array.from(players).sort();
  }, [allSignals]);

  // Mock alpha tracking data
  const alphaPerformance = useMemo(() => ({
    actedOn: [
      { player: 'Shohei Ohtani', narrative: '50/50 Season Legacy', entryPhase: 'emerging', gain: 45.2, status: 'closed' as const },
      { player: 'Patrick Mahomes', narrative: 'Three-Peat Quest', entryPhase: 'seed', gain: 40.0, status: 'open' as const },
      { player: 'Caitlin Clark', narrative: 'WNBA Crossover', entryPhase: 'seed', gain: 28.5, status: 'open' as const },
      { player: 'Victor Wembanyama', narrative: 'Dynasty Formation', entryPhase: 'emerging', gain: 18.3, status: 'open' as const },
      { player: 'Caleb Williams', narrative: 'Chicago Revival', entryPhase: 'emerging', gain: 12.7, status: 'open' as const },
    ],
    missed: [
      { player: 'Travis Kelce', narrative: 'Pop Culture Crossover', peakGain: 62.0, currentPhase: 'fading' as MaturityPhase },
      { player: 'Connor Bedard', narrative: 'Calder Trophy Chase', peakGain: 35.0, currentPhase: 'fading' as MaturityPhase },
    ],
    totalPL: 144.7,
    winRate: 0.83,
    avgReturn: 28.9,
  }), []);

  const handleSelectNarrative = useCallback((id: string) => {
    setSelectedNarrativeId(id);
    setActiveTab('timeline');
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500/10 to-slate-900 border-b border-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-pink-500/20 rounded-xl">
                <BookOpen size={24} className="text-pink-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Narrative Alpha Detector</h2>
                <p className="text-sm text-slate-400">
                  AI-powered narrative detection — identify price catalysts 2-6 weeks early
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-3 mt-4">
            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-white">{stats.activeNarratives}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Active Narratives</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-cyan-400">{stats.emergingCount}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Emerging Signals</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-green-400">{stats.avgLeadTime}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Avg Lead Time</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-pink-400">{(stats.successRate * 100).toFixed(0)}%</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Success Rate</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-pink-500/20 text-pink-400'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tab 1: Narrative Feed */}
          {activeTab === 'feed' && (
            <div className="space-y-4">
              {/* Phase Filter */}
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-slate-500" />
                <button
                  onClick={() => setPhaseFilter('all')}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                    phaseFilter === 'all' ? 'bg-pink-500/20 text-pink-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  All
                </button>
                {PHASE_ORDER.map((phase) => (
                  <button
                    key={phase}
                    onClick={() => setPhaseFilter(phase)}
                    className={`text-xs px-3 py-1 rounded-full font-medium transition-colors capitalize ${
                      phaseFilter === phase
                        ? PHASE_COLORS[phase]
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {phase}
                  </button>
                ))}
              </div>

              {/* Narrative Cards */}
              <div className="space-y-3">
                {filteredSignals.map((signal) => (
                  <NarrativeCard
                    key={signal.id}
                    signal={signal}
                    onSelect={handleSelectNarrative}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Timeline View */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {/* Narrative Selector */}
              <div className="flex flex-wrap gap-2">
                {allSignals
                  .filter((s) => ['ns-001', 'ns-004', 'ns-009'].includes(s.id))
                  .map((signal) => (
                    <button
                      key={signal.id}
                      onClick={() => setSelectedNarrativeId(signal.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        selectedNarrativeId === signal.id
                          ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                          : 'bg-slate-800/50 text-slate-400 hover:text-slate-300 border border-slate-700/50'
                      }`}
                    >
                      {signal.playerName}
                    </button>
                  ))}
              </div>

              {/* Selected Narrative Info */}
              {selectedNarrative && (
                <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white">{selectedNarrative.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${PHASE_COLORS[selectedNarrative.maturityPhase]}`}>
                      {selectedNarrative.maturityPhase}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{selectedNarrative.description}</p>
                  <div className="flex gap-4 text-xs text-slate-500">
                    <span>Strength: <span className="text-pink-400 font-bold">{selectedNarrative.strengthScore}/100</span></span>
                    <span>Impact: <span className="text-green-400 font-bold">+{selectedNarrative.priceImpactEstimate}%</span></span>
                    <span>Confidence: <span className="text-cyan-400 font-bold">{(selectedNarrative.confidenceScore * 100).toFixed(0)}%</span></span>
                  </div>
                </div>
              )}

              {/* Timeline Events */}
              {selectedTimeline ? (
                <div className="relative pl-6">
                  <div className="absolute left-2 top-0 bottom-0 w-px bg-slate-700" />
                  {selectedTimeline.events.map((event, idx) => {
                    const isPositive = event.priceChange >= 0;
                    return (
                      <div key={idx} className="relative pb-6 last:pb-0">
                        <div
                          className={`absolute left-[-16px] w-3 h-3 rounded-full border-2 ${
                            isPositive
                              ? 'bg-green-500/30 border-green-400'
                              : 'bg-red-500/30 border-red-400'
                          }`}
                        />
                        <div className="bg-slate-800/30 rounded-xl p-4 ml-4 border border-slate-700/30">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-500 font-mono">{event.date}</span>
                            <span
                              className={`text-sm font-bold flex items-center gap-1 ${
                                isPositive ? 'text-green-400' : 'text-red-400'
                              }`}
                            >
                              {isPositive ? (
                                <ArrowUpRight size={14} />
                              ) : (
                                <ArrowDownRight size={14} />
                              )}
                              {isPositive ? '+' : ''}
                              {event.priceChange}%
                            </span>
                          </div>
                          <p className="text-sm text-slate-300">{event.event}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Clock size={32} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No timeline data available for this narrative.</p>
                  <p className="text-xs mt-1">Select a narrative with timeline events above.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Media Scanner */}
          {activeTab === 'media' && (
            <div className="space-y-4">
              {/* Player Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <Filter size={14} className="text-slate-500" />
                <button
                  onClick={() => setMediaPlayerFilter('')}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                    !mediaPlayerFilter ? 'bg-pink-500/20 text-pink-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  All Players
                </button>
                {uniquePlayers.slice(0, 8).map((player) => (
                  <button
                    key={player}
                    onClick={() => setMediaPlayerFilter(player)}
                    className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                      mediaPlayerFilter === player
                        ? 'bg-pink-500/20 text-pink-400'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {player.split(' ').pop()}
                  </button>
                ))}
              </div>

              {/* Media Mentions Stream */}
              <div className="space-y-2">
                {mediaMentions.map((mention) => (
                  <MediaMentionRow key={mention.id} mention={mention} />
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Alpha Tracker */}
          {activeTab === 'alpha' && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800/40 rounded-xl p-4 text-center border border-slate-700/30">
                  <p className="text-2xl font-bold text-green-400">+{alphaPerformance.totalPL}%</p>
                  <p className="text-xs text-slate-500 mt-1">Total P/L from Narrative Trades</p>
                </div>
                <div className="bg-slate-800/40 rounded-xl p-4 text-center border border-slate-700/30">
                  <p className="text-2xl font-bold text-pink-400">{(alphaPerformance.winRate * 100).toFixed(0)}%</p>
                  <p className="text-xs text-slate-500 mt-1">Win Rate</p>
                </div>
                <div className="bg-slate-800/40 rounded-xl p-4 text-center border border-slate-700/30">
                  <p className="text-2xl font-bold text-cyan-400">+{alphaPerformance.avgReturn}%</p>
                  <p className="text-xs text-slate-500 mt-1">Avg Return per Narrative</p>
                </div>
              </div>

              {/* Acted On */}
              <div>
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-green-400" />
                  Narratives You Acted On
                </h3>
                <div className="space-y-2">
                  {alphaPerformance.actedOn.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-slate-800/30 rounded-xl p-3 border border-slate-700/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                          <TrendingUp size={14} className="text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{item.player}</p>
                          <p className="text-xs text-slate-500">{item.narrative}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-400">+{item.gain}%</p>
                        <p className="text-[10px] text-slate-500 uppercase">
                          Entry: {item.entryPhase} · {item.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missed */}
              <div>
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <XCircle size={14} className="text-red-400" />
                  Narratives You Missed
                </h3>
                <div className="space-y-2">
                  {alphaPerformance.missed.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-slate-800/30 rounded-xl p-3 border border-red-900/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                          <XCircle size={14} className="text-red-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{item.player}</p>
                          <p className="text-xs text-slate-500">{item.narrative}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-400">+{item.peakGain}% missed</p>
                        <p className={`text-[10px] uppercase ${PHASE_COLORS[item.currentPhase]}`}>
                          Now {item.currentPhase}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Alpha Opportunities */}
              <div>
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Target size={14} className="text-pink-400" />
                  Top Alpha Opportunities Right Now
                </h3>
                <div className="space-y-2">
                  {topAlpha.map((signal) => (
                    <div
                      key={signal.id}
                      className="flex items-center justify-between bg-gradient-to-r from-pink-500/5 to-slate-800/30 rounded-xl p-3 border border-pink-500/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center">
                          <Zap size={14} className="text-pink-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{signal.playerName}</p>
                          <p className="text-xs text-slate-500">{signal.title}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-pink-400">
                          +{signal.priceImpactEstimate}% est.
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {signal.timeToImpact} · {(signal.confidenceScore * 100).toFixed(0)}% conf
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const NarrativeCard: React.FC<{
  signal: NarrativeSignal;
  onSelect: (id: string) => void;
}> = ({ signal, onSelect }) => {
  const typeMeta = NARRATIVE_TYPE_META[signal.narrativeType];
  const phaseIdx = PHASE_ORDER.indexOf(signal.maturityPhase);

  return (
    <div
      className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30 hover:border-pink-500/20 transition-all cursor-pointer"
      onClick={() => onSelect(signal.id)}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base font-bold text-white">{signal.playerName}</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${typeMeta.color} bg-slate-700/50`}
            >
              {typeMeta.label}
            </span>
          </div>
          <p className="text-sm text-slate-300 font-medium">{signal.title}</p>
        </div>
        <ChevronRight size={16} className="text-slate-600 mt-1 flex-shrink-0" />
      </div>

      <p className="text-xs text-slate-500 mb-3 line-clamp-2">{signal.description}</p>

      {/* Maturity Phase Dots */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider w-16">Phase</span>
        <div className="flex items-center gap-1.5">
          {PHASE_ORDER.map((phase, idx) => (
            <div key={phase} className="flex items-center gap-1.5">
              <div
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx <= phaseIdx
                    ? idx === phaseIdx
                      ? 'bg-pink-400 ring-2 ring-pink-400/30'
                      : 'bg-pink-500/50'
                    : 'bg-slate-700'
                }`}
                title={phase}
              />
              {idx < PHASE_ORDER.length - 1 && (
                <div className={`w-3 h-px ${idx < phaseIdx ? 'bg-pink-500/50' : 'bg-slate-700'}`} />
              )}
            </div>
          ))}
        </div>
        <span className={`text-[10px] font-bold capitalize ${PHASE_COLORS[signal.maturityPhase]?.split(' ')[0]}`}>
          {signal.maturityPhase}
        </span>
      </div>

      {/* Metrics Row */}
      <div className="flex items-center gap-4">
        {/* Strength Meter */}
        <div className="flex-1">
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-slate-500">Strength</span>
            <span className="text-pink-400 font-bold">{signal.strengthScore}/100</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all bg-gradient-to-r from-pink-600 to-pink-400"
              style={{ width: `${signal.strengthScore}%` }}
            />
          </div>
        </div>

        {/* Price Impact */}
        <div className="text-center px-3">
          <p className={`text-sm font-bold ${signal.priceImpactEstimate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {signal.priceImpactEstimate >= 0 ? '+' : ''}{signal.priceImpactEstimate}%
          </p>
          <p className="text-[10px] text-slate-500">Est. Impact</p>
        </div>

        {/* Time to Impact */}
        <div className="text-center px-3">
          <p className="text-sm font-bold text-cyan-400">{signal.timeToImpact}</p>
          <p className="text-[10px] text-slate-500">Time to Impact</p>
        </div>

        {/* Source Count */}
        <div className="text-center px-3">
          <p className="text-sm font-bold text-amber-400">{signal.sources.length}</p>
          <p className="text-[10px] text-slate-500">Sources</p>
        </div>
      </div>
    </div>
  );
};

const MediaMentionRow: React.FC<{ mention: MediaMention }> = ({ mention }) => {
  const sentimentPct = ((mention.sentimentScore + 1) / 2) * 100;
  const sentimentColor =
    mention.sentimentScore > 0.5
      ? 'text-green-400'
      : mention.sentimentScore > 0
      ? 'text-amber-400'
      : 'text-red-400';
  const barColor =
    mention.sentimentScore > 0.5
      ? 'bg-green-500'
      : mention.sentimentScore > 0
      ? 'bg-amber-500'
      : 'bg-red-500';

  const formattedReach =
    mention.reach >= 1000000
      ? `${(mention.reach / 1000000).toFixed(1)}M`
      : mention.reach >= 1000
      ? `${(mention.reach / 1000).toFixed(0)}K`
      : mention.reach.toString();

  const timestamp = new Date(mention.timestamp);
  const timeAgo = getTimeAgo(timestamp);

  return (
    <div className="flex items-center gap-3 bg-slate-800/30 rounded-xl p-3 border border-slate-700/30">
      {/* Source Icon */}
      <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center text-lg flex-shrink-0">
        {SOURCE_ICONS[mention.source] || '📄'}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider">
            {mention.source}
          </span>
          <span className="text-[10px] text-slate-600">·</span>
          <span className="text-[10px] text-slate-500">{mention.playerName}</span>
          <span className="text-[10px] text-slate-600">·</span>
          <span className="text-[10px] text-slate-500">{timeAgo}</span>
        </div>
        <p className="text-sm text-slate-300 truncate">{mention.headline}</p>

        {/* Sentiment Bar */}
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${barColor}`}
              style={{ width: `${sentimentPct}%` }}
            />
          </div>
          <span className={`text-[10px] font-bold ${sentimentColor}`}>
            {mention.sentimentScore > 0 ? '+' : ''}
            {(mention.sentimentScore * 100).toFixed(0)}
          </span>
        </div>
      </div>

      {/* Reach */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-white">{formattedReach}</p>
        <p className="text-[10px] text-slate-500">Reach</p>
      </div>
    </div>
  );
};

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 7)}w ago`;
}

export default NarrativeAlphaModal;
