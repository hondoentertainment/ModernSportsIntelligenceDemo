import React, { useState, useEffect, useMemo } from 'react';
import { Users, TrendingUp, TrendingDown, AlertTriangle, Star, ChevronRight, BarChart3, Eye, Shield, Radio } from 'lucide-react';
import {
  getTopInfluencers,
  getContentEvents,
  getPumpDumpAlerts,
  getInfluencerAlphaScores,
  getImpactByPlatform,
  getTrendingMentions,
  getMarketManipulationFlags,
  measureImpact,
  detectAccumulation,
  platformBadgeColor,
  platformLabel,
  severityBadgeColor,
  formatFollowers,
  formatViews,
  momentumColor,
  type Influencer,
  type ContentEvent,
  type PumpDumpAlert,
  type InfluencerRanking,
  type PlatformImpact,
  type TrendingMention,
  type AccumulationSignal,
  type MarketManipulationFlag,
} from '../lib/influencerImpactService.ts';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';

const InfluencerImpact: React.FC = () => {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [events, setEvents] = useState<ContentEvent[]>([]);
  const [alerts, setAlerts] = useState<PumpDumpAlert[]>([]);
  const [rankings, setRankings] = useState<InfluencerRanking[]>([]);
  const [platformData, setPlatformData] = useState<PlatformImpact[]>([]);
  const [trending, setTrending] = useState<TrendingMention[]>([]);
  const [manipulationFlags, setManipulationFlags] = useState<MarketManipulationFlag[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setInfluencers(getTopInfluencers());
      setEvents(getContentEvents({ limit: 12 }));
      setAlerts(getPumpDumpAlerts());
      setRankings(getInfluencerAlphaScores());
      setPlatformData(getImpactByPlatform());
      setTrending(getTrendingMentions());
      setManipulationFlags(getMarketManipulationFlags());
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  const impactTimeline = useMemo(() => {
    if (!selectedEventId) {
      const firstEvent = events[0];
      if (!firstEvent) return [];
      const analysis = measureImpact(firstEvent.id);
      return analysis?.timeline ?? [];
    }
    const analysis = measureImpact(selectedEventId);
    return analysis?.timeline ?? [];
  }, [selectedEventId, events]);

  const activeAlertCount = alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length;
  const weeklyEvents = events.filter(e => {
    const d = new Date(e.publish_date);
    const now = new Date();
    return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
  });
  const avgImpact = events.length > 0
    ? Math.round(events.reduce((sum, e) => sum + ((e.price_after_24h - e.price_before) / e.price_before) * 100, 0) / events.length * 10) / 10
    : 0;

  const platformChartData = platformData.map(p => ({
    name: platformLabel(p.platform),
    impact: p.avg_impact_pct,
    decay: p.avg_decay_hours,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Influencer Impact Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-pink-500/20">
            <Users size={24} className="text-pink-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Influencer Impact Attribution Engine</h1>
            <p className="text-sm text-slate-400">
              Track influencer content and measure price impact &mdash; Phase 134
            </p>
          </div>
        </div>
        {activeAlertCount > 0 && (
          <span className="px-3 py-1.5 text-sm font-bold bg-red-500/20 text-red-300 rounded-full">
            {activeAlertCount} Active Alerts
          </span>
        )}
      </div>

      {/* ─── Summary Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Influencers Tracked</p>
          <p className="text-3xl font-bold text-white">{influencers.length}</p>
          <p className="text-xs text-slate-600 mt-1">across 5 platforms</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Events This Week</p>
          <p className="text-3xl font-bold text-purple-400">{weeklyEvents.length}</p>
          <p className="text-xs text-slate-600 mt-1">content mentions</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Price Impact</p>
          <p className="text-3xl font-bold text-emerald-400">+{avgImpact}%</p>
          <p className="text-xs text-slate-600 mt-1">24h post-mention</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Active Alerts</p>
          <p className="text-3xl font-bold text-red-400">{alerts.length}</p>
          <p className="text-xs text-slate-600 mt-1">{activeAlertCount} critical/high</p>
        </div>
      </div>

      {/* ─── Influencer Leaderboard + Impact Timeline ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <Star size={18} className="text-amber-400" />
            Influencer Leaderboard
          </h2>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {rankings.slice(0, 10).map((r, idx) => (
              <div key={r.influencer_id} className="flex items-center justify-between p-2.5 bg-slate-900/50 rounded-lg">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-slate-500 w-5 text-center">#{idx + 1}</span>
                  <div>
                    <p className="text-xs font-bold text-white">{r.name}</p>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] px-1 py-0.5 rounded border ${platformBadgeColor(r.platform)}`}>
                        {platformLabel(r.platform)}
                      </span>
                      <span className="text-[9px] text-slate-600">{r.total_events} events</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-brand-lime">{r.alpha_score}</p>
                  <p className="text-[9px] text-slate-500">{r.reliability_score}% reliable</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Impact Timeline Chart */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-brand-lime" />
            Impact Timeline (Price Change Post-Mention)
          </h2>
          {impactTimeline.length > 0 ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={impactTimeline}>
                  <defs>
                    <linearGradient id="impactGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#84cc16" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="hours" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `${v}h`} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#94a3b8' }}
                    labelFormatter={(v) => `${v} hours after mention`}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Price Change']}
                  />
                  <Area type="monotone" dataKey="price_change_pct" stroke="#84cc16" strokeWidth={2} fill="url(#impactGrad)" dot={{ r: 3, fill: '#84cc16' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center py-16 text-slate-500 text-sm">
              Select a content event to view impact timeline
            </div>
          )}
        </div>
      </div>

      {/* ─── Recent Content Events Feed ────────────────────────── */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Radio size={18} className="text-purple-400" />
          Recent Content Events
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {events.slice(0, 9).map(evt => {
            const impact24h = ((evt.price_after_24h - evt.price_before) / evt.price_before) * 100;
            const isSelected = selectedEventId === evt.id;
            return (
              <button
                key={evt.id}
                onClick={() => setSelectedEventId(evt.id === selectedEventId ? null : evt.id)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-slate-800 border-brand-lime/50 shadow-lg shadow-brand-lime/5'
                    : 'bg-slate-900/50 border-slate-700/30 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${platformBadgeColor(evt.platform)}`}>
                    {platformLabel(evt.platform)}
                  </span>
                  <span className="text-[10px] text-slate-600">{formatViews(evt.views)} views</span>
                </div>
                <p className="text-xs font-bold text-white mb-1 truncate">{evt.influencer_name}</p>
                <p className="text-[10px] text-slate-500 line-clamp-1 mb-2">{evt.title}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-600 truncate">{evt.card_mentioned.split(' ').slice(-3).join(' ')}</span>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    {impact24h >= 0 ? (
                      <TrendingUp size={10} className="text-emerald-400" />
                    ) : (
                      <TrendingDown size={10} className="text-red-400" />
                    )}
                    <span className={`text-[10px] font-bold ${impact24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {impact24h >= 0 ? '+' : ''}{impact24h.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 text-[9px] text-slate-600">
                  <span>${evt.price_before} &rarr; ${evt.price_after_24h} (24h)</span>
                  <span>${evt.price_after_7d} (7d)</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Pump & Dump Alerts + Platform Breakdown ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pump & Dump Alerts */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-400" />
            Pump &amp; Dump Alerts
          </h2>
          <div className="space-y-3">
            {alerts.map(alert => (
              <div key={alert.id} className="p-4 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${severityBadgeColor(alert.severity)}`}>
                    {alert.severity}
                  </span>
                  <span className="text-[10px] text-slate-600">{alert.alert_type.replace(/_/g, ' ')}</span>
                </div>
                <p className="text-xs font-bold text-white mb-1">{alert.influencer_name} &mdash; {alert.card_name.split(' ').slice(-3).join(' ')}</p>
                <p className="text-[10px] text-slate-500 mb-2">{alert.description}</p>
                <div className="space-y-1">
                  {alert.evidence.slice(0, 2).map((e, i) => (
                    <p key={i} className="text-[9px] text-slate-600 flex items-start gap-1">
                      <span className="text-slate-500 mt-0.5">&#8226;</span> {e}
                    </p>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-[10px] font-bold ${alert.price_impact_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    +{alert.price_impact_pct.toFixed(1)}% impact
                  </span>
                  <button className="text-[10px] text-brand-lime hover:underline flex items-center gap-1">
                    View Details <ChevronRight size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Breakdown */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-sky-400" />
            Platform Impact Breakdown
          </h2>
          <div className="h-48 w-full mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(value: number, name: string) => [name === 'impact' ? `${value}%` : `${value}h`, name === 'impact' ? 'Avg Impact' : 'Avg Decay']}
                />
                <Bar dataKey="impact" fill="#84cc16" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {platformData.map(p => (
              <div key={p.platform} className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${platformBadgeColor(p.platform)}`}>
                    {platformLabel(p.platform)}
                  </span>
                  <span className="text-[10px] text-slate-500">{p.total_events} events</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-emerald-400 font-bold">+{p.avg_impact_pct}%</span>
                  <span className="text-[10px] text-slate-600">{p.avg_decay_hours}h decay</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Trending Mentions + Accumulation Signals ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trending Card Mentions */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-400" />
            Trending Card Mentions (24h)
          </h2>
          <div className="space-y-3">
            {trending.map(t => (
              <div key={t.card_name} className="p-4 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white truncate">{t.card_name.split(' ').slice(-4).join(' ')}</span>
                  <span className={`text-xs font-bold ${t.price_change_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {t.price_change_pct >= 0 ? '+' : ''}{t.price_change_pct.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-500">{t.mention_count_24h} mentions &middot; {formatViews(t.combined_reach)} reach</span>
                  <span className={`text-[10px] font-bold ${momentumColor(t.momentum)}`}>{t.momentum}</span>
                </div>
                <p className="text-[9px] text-slate-600">{t.influencers.slice(0, 3).join(', ')}{t.influencers.length > 3 ? ` +${t.influencers.length - 3} more` : ''}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Market Manipulation Flags */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Shield size={18} className="text-red-400" />
            Market Manipulation Flags
          </h2>
          <div className="space-y-3">
            {manipulationFlags.map(flag => (
              <div key={flag.id} className="p-4 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${severityBadgeColor(flag.severity)}`}>
                    {flag.severity}
                  </span>
                  <span className="text-[10px] text-slate-600">{flag.type.replace(/_/g, ' ')}</span>
                </div>
                <p className="text-xs text-slate-300 mb-2">{flag.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-slate-600">
                    {flag.influencers_involved.join(', ')}
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold">{flag.evidence_strength}% confidence</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfluencerImpact;
