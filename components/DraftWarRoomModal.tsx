import React, { useState, useMemo, useCallback } from 'react';
import {
  X, Users, Target, Zap, TrendingUp, TrendingDown,
  Calendar, Star, Shield, Clock, ChevronDown, ChevronUp, MapPin,
  AlertTriangle, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  getDraftEvents,
  getDraftProspects,
  getLandingSpotAnalysis,
  getDraftNightStrategies,
  getDraftStats,
  daysUntilDraft,
  watchProspect,
  unwatchProspect,
  isProspectWatched,
  type DraftProspect,
  type LandingSpotAnalysis,
  type DraftNightStrategy,
  type DraftEvent,
  type CardPresence,
  type LandingSpotFit,
  type DraftStrategy,
} from '../lib/draftWarRoomService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type TabKey = 'bigboard' | 'landingspots' | 'strategies' | 'calendar';

const SPORT_FILTERS = ['All', 'NFL', 'NBA', 'MLB', 'NHL'] as const;

const PRESENCE_BADGE: Record<CardPresence, { label: string; cls: string }> = {
  high:   { label: 'HIGH',   cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
  medium: { label: 'MED',    cls: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
  low:    { label: 'LOW',    cls: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
  none:   { label: 'NONE',   cls: 'bg-slate-500/20 text-slate-400 border-slate-500/40' },
};

const FIT_CONFIG: Record<LandingSpotFit, { label: string; color: string; bg: string }> = {
  perfect: { label: 'PERFECT', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  good:    { label: 'GOOD',    color: 'text-blue-400',    bg: 'bg-blue-500/20' },
  neutral: { label: 'NEUTRAL', color: 'text-amber-400',   bg: 'bg-amber-500/20' },
  poor:    { label: 'POOR',    color: 'text-red-400',     bg: 'bg-red-500/20' },
};

const STRATEGY_CONFIG: Record<DraftStrategy, { label: string; color: string; bg: string; border: string }> = {
  buy_before:   { label: 'BUY BEFORE',   color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40' },
  buy_during:   { label: 'BUY DURING',   color: 'text-blue-400',    bg: 'bg-blue-500/20',    border: 'border-blue-500/40' },
  buy_after:    { label: 'BUY AFTER',    color: 'text-cyan-400',    bg: 'bg-cyan-500/20',    border: 'border-cyan-500/40' },
  sell_before:  { label: 'SELL BEFORE',  color: 'text-amber-400',   bg: 'bg-amber-500/20',   border: 'border-amber-500/40' },
  sell_during:  { label: 'SELL DURING',  color: 'text-orange-400',  bg: 'bg-orange-500/20',  border: 'border-orange-500/40' },
  avoid:        { label: 'AVOID',        color: 'text-red-400',     bg: 'bg-red-500/20',     border: 'border-red-500/40' },
};

const SPORT_COLOR: Record<string, string> = {
  NFL: 'text-emerald-400',
  NBA: 'text-blue-400',
  MLB: 'text-amber-400',
  NHL: 'text-cyan-400',
  MLS: 'text-rose-400',
};

const SPORT_BG: Record<string, string> = {
  NFL: 'bg-emerald-500/10 border-emerald-500/30',
  NBA: 'bg-blue-500/10 border-blue-500/30',
  MLB: 'bg-amber-500/10 border-amber-500/30',
  NHL: 'bg-cyan-500/10 border-cyan-500/30',
  MLS: 'bg-rose-500/10 border-rose-500/30',
};

const FIT_BAR_COLORS: Record<LandingSpotFit, string> = {
  perfect: '#34d399',
  good: '#60a5fa',
  neutral: '#fbbf24',
  poor: '#f87171',
};

const DraftWarRoomModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<TabKey>('bigboard');
  const [sportFilter, setSportFilter] = useState<string>('All');
  const [selectedProspect, setSelectedProspect] = useState<string | null>(null);
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null);

  const stats = useMemo(() => getDraftStats(), []);
  const events = useMemo(() => getDraftEvents(), []);
  const allProspects = useMemo(() => getDraftProspects(), []);
  const strategies = useMemo(() => getDraftNightStrategies(), []);

  const filteredProspects = useMemo(() => {
    if (sportFilter === 'All') return allProspects;
    return allProspects.filter(p => p.sport === sportFilter);
  }, [allProspects, sportFilter]);

  const landingSpots = useMemo(() => {
    if (!selectedProspect) return [];
    return getLandingSpotAnalysis(selectedProspect);
  }, [selectedProspect]);

  const landingChartData = useMemo(() => {
    return landingSpots.map(ls => ({
      team: ls.team.length > 16 ? ls.team.slice(0, 14) + '...' : ls.team,
      impact: ls.cardImpact,
      fit: ls.fit,
    }));
  }, [landingSpots]);

  const handleProspectClick = useCallback((id: string) => {
    setSelectedProspect(prev => prev === id ? null : id);
  }, []);

  const toggleWatch = useCallback((prospectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isProspectWatched(prospectId)) {
      unwatchProspect(prospectId);
    } else {
      watchProspect(prospectId);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-6xl max-h-[88vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-gradient-to-r from-brand-lime/5 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-lime/20">
              <Users size={20} className="text-brand-lime" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Draft War Room</h2>
              <p className="text-xs text-slate-400">Multi-sport draft intelligence · Prospect rankings · Card timing</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Summary Bar */}
        <div className="grid grid-cols-5 gap-3 p-4 bg-slate-800/30">
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Upcoming Drafts</p>
            <p className="text-xl font-bold text-brand-lime">{stats.upcomingDrafts}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Prospects Tracked</p>
            <p className="text-xl font-bold text-blue-400">{stats.trackedProspects}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Avg Draft Surge</p>
            <p className="text-xl font-bold text-emerald-400">+{stats.avgDraftNightSurge}%</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Best Gain</p>
            <p className="text-xl font-bold text-amber-400">+{stats.bestDraftNightGain}%</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Watchlist</p>
            <p className="text-xl font-bold text-rose-400">{stats.portfolioProspectExposure}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-4 pb-0">
          {([
            { key: 'bigboard' as TabKey, label: 'Big Board' },
            { key: 'landingspots' as TabKey, label: 'Landing Spots' },
            { key: 'strategies' as TabKey, label: 'Strategies' },
            { key: 'calendar' as TabKey, label: 'Draft Calendar' },
          ]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
                tab === t.key
                  ? 'bg-brand-lime/20 text-brand-lime'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[48vh]">

          {/* ─── BIG BOARD ─── */}
          {tab === 'bigboard' && (
            <div className="space-y-3">
              {/* Sport filter */}
              <div className="flex gap-2 mb-3">
                {SPORT_FILTERS.map(s => (
                  <button
                    key={s}
                    onClick={() => setSportFilter(s)}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors ${
                      sportFilter === s
                        ? 'bg-brand-lime/20 text-brand-lime border border-brand-lime/30'
                        : 'text-slate-500 hover:text-slate-300 bg-slate-800/50 border border-slate-700/30'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Prospect list */}
              <div className="space-y-2">
                {filteredProspects.map((p, idx) => {
                  const isSelected = selectedProspect === p.id;
                  const watched = isProspectWatched(p.id);
                  const projChange = Math.round(((p.draftNightProjection.likelyCase - p.topCard.currentValue) / p.topCard.currentValue) * 100);

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleProspectClick(p.id)}
                      className={`bg-slate-800/50 border rounded-xl p-4 transition-all cursor-pointer ${
                        isSelected ? 'border-brand-lime/40 bg-slate-800/80' : 'border-slate-700/30 hover:border-slate-600/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700/50 text-sm font-bold text-slate-300 shrink-0">
                          {sportFilter === 'All' ? idx + 1 : p.consensusRank}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-bold text-slate-100">{p.name}</span>
                            <span className={`text-[9px] font-bold ${SPORT_COLOR[p.sport] || 'text-slate-400'}`}>{p.sport}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${PRESENCE_BADGE[p.cardPresence].cls}`}>
                              {PRESENCE_BADGE[p.cardPresence].label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-slate-500">
                            <span>{p.position}</span>
                            <span>·</span>
                            <span>{p.school}</span>
                            <span>·</span>
                            <span>Age {p.age}</span>
                            <span>·</span>
                            <span>Mock #{p.mockDraftPosition}</span>
                          </div>
                        </div>

                        {/* Card value */}
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-slate-200">${p.topCard.currentValue}</p>
                          <div className="flex items-center gap-1 justify-end">
                            {projChange > 0 ? (
                              <ArrowUpRight size={10} className="text-emerald-400" />
                            ) : (
                              <ArrowDownRight size={10} className="text-red-400" />
                            )}
                            <span className={`text-[10px] font-bold ${projChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {projChange > 0 ? '+' : ''}{projChange}% proj
                            </span>
                          </div>
                        </div>

                        {/* Watch star */}
                        <button
                          onClick={(e) => toggleWatch(p.id, e)}
                          className="p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors shrink-0"
                        >
                          <Star size={14} className={watched ? 'text-amber-400 fill-amber-400' : 'text-slate-600'} />
                        </button>
                      </div>

                      {/* Expanded detail */}
                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-slate-700/30 grid grid-cols-4 gap-3">
                          <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                            <p className="text-[9px] text-slate-500 uppercase mb-1">Best Case</p>
                            <p className="text-sm font-bold text-emerald-400">${p.draftNightProjection.bestCase}</p>
                          </div>
                          <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                            <p className="text-[9px] text-slate-500 uppercase mb-1">Likely</p>
                            <p className="text-sm font-bold text-blue-400">${p.draftNightProjection.likelyCase}</p>
                          </div>
                          <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                            <p className="text-[9px] text-slate-500 uppercase mb-1">Worst Case</p>
                            <p className="text-sm font-bold text-red-400">${p.draftNightProjection.worstCase}</p>
                          </div>
                          <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                            <p className="text-[9px] text-slate-500 uppercase mb-1">Boom/Bust</p>
                            <p className="text-sm font-bold">
                              <span className="text-emerald-400">{p.boomProbability}%</span>
                              <span className="text-slate-600 mx-1">/</span>
                              <span className="text-red-400">{p.bustProbability}%</span>
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── LANDING SPOTS ─── */}
          {tab === 'landingspots' && (
            <div className="space-y-4">
              {/* Prospect selector */}
              <div className="flex flex-wrap gap-2 mb-2">
                {allProspects.filter(p => getLandingSpotAnalysis(p.id).length > 0).map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProspect(p.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      selectedProspect === p.id
                        ? 'bg-brand-lime/20 text-brand-lime border border-brand-lime/30'
                        : 'text-slate-400 hover:text-slate-200 bg-slate-800/50 border border-slate-700/30'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              {selectedProspect && landingSpots.length > 0 ? (
                <>
                  {/* Chart */}
                  <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                      Card Impact by Landing Spot
                    </h3>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={landingChartData} layout="vertical" margin={{ left: 10, right: 30 }}>
                          <XAxis type="number" domain={[-20, 70]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                          <YAxis
                            dataKey="team"
                            type="category"
                            width={120}
                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                            labelStyle={{ color: '#e2e8f0' }}
                            formatter={(value: number) => [`${value > 0 ? '+' : ''}${value}%`, 'Card Impact']}
                          />
                          <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                            {landingChartData.map((entry, i) => (
                              <Cell key={i} fill={FIT_BAR_COLORS[entry.fit as LandingSpotFit] || '#64748b'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Detail cards */}
                  <div className="space-y-2">
                    {landingSpots.map((ls, i) => {
                      const fitCfg = FIT_CONFIG[ls.fit];
                      return (
                        <div key={i} className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Shield size={14} className={fitCfg.color} />
                              <span className="text-sm font-bold text-slate-200">{ls.team}</span>
                              <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${fitCfg.bg} ${fitCfg.color}`}>
                                {fitCfg.label} FIT
                              </span>
                            </div>
                            <span className={`text-sm font-bold ${ls.cardImpact > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {ls.cardImpact > 0 ? '+' : ''}{ls.cardImpact}%
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mb-2">{ls.reasoning}</p>
                          <div className="flex items-center gap-1.5">
                            <Clock size={10} className="text-slate-500" />
                            <span className="text-[10px] text-slate-500 italic">{ls.historicalComps}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Target size={32} className="mx-auto mb-3 text-slate-600" />
                  <p className="text-sm">Select a prospect to view landing spot analysis</p>
                </div>
              )}
            </div>
          )}

          {/* ─── STRATEGIES ─── */}
          {tab === 'strategies' && (
            <div className="space-y-2">
              {strategies.map((s, i) => {
                const cfg = STRATEGY_CONFIG[s.strategy];
                const isExpanded = expandedStrategy === s.prospect;

                return (
                  <div
                    key={i}
                    onClick={() => setExpandedStrategy(isExpanded ? null : s.prospect)}
                    className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4 cursor-pointer hover:border-slate-600/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] px-2 py-1 rounded border font-bold ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                          {cfg.label}
                        </span>
                        <span className="text-sm font-bold text-slate-200">{s.prospect}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">{s.timing}</span>
                        {isExpanded ? (
                          <ChevronUp size={14} className="text-slate-500" />
                        ) : (
                          <ChevronDown size={14} className="text-slate-500" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-700/30 space-y-2">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Reasoning</p>
                          <p className="text-xs text-slate-300">{s.reasoning}</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-3 flex items-start gap-2">
                          <TrendingUp size={14} className="text-brand-lime mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Historical Pattern</p>
                            <p className="text-xs text-brand-lime font-medium">{s.historicalPattern}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ─── DRAFT CALENDAR ─── */}
          {tab === 'calendar' && (
            <div className="space-y-3">
              {events.map(evt => {
                const days = daysUntilDraft(evt.date);
                const sportClr = SPORT_COLOR[evt.sport] || 'text-slate-400';
                const sportBg = SPORT_BG[evt.sport] || 'bg-slate-500/10 border-slate-500/30';
                const prospects = getDraftProspects(evt.sport).slice(0, 3);

                return (
                  <div key={evt.id} className={`border rounded-xl p-4 ${sportBg} transition-all`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800/50">
                          <Calendar size={18} className={sportClr} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-100">{evt.name}</h3>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <MapPin size={10} />
                            <span>{evt.location}</span>
                            <span>·</span>
                            <span>{evt.rounds} rounds</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${days <= 30 ? 'text-amber-400' : days <= 60 ? 'text-blue-400' : 'text-slate-400'}`}>
                          {days}d
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {new Date(evt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    {/* Top prospects for this draft */}
                    {prospects.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {prospects.map(p => (
                          <div key={p.id} className="bg-slate-900/40 rounded-lg px-3 py-1.5 flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-500">#{p.mockDraftPosition}</span>
                            <span className="text-[11px] font-medium text-slate-300">{p.name}</span>
                            <span className="text-[10px] font-bold text-emerald-400">${p.topCard.currentValue}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Alert */}
                    {days <= 45 && (
                      <div className="mt-3 bg-amber-500/10 rounded-lg p-2 flex items-center gap-2">
                        <AlertTriangle size={12} className="text-amber-400 shrink-0" />
                        <span className="text-[10px] text-amber-300 font-medium">
                          {days <= 14
                            ? 'Draft imminent — finalize positions now!'
                            : days <= 30
                            ? 'Draft approaching — review buy/sell timing strategies'
                            : 'Draft within 45 days — begin pre-draft positioning'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DraftWarRoomModal;
