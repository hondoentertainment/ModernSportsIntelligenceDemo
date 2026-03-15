import React, { useState, useEffect, useMemo } from 'react';
import {
  Radio,
  TrendingUp,
  Users,
  Flame,
  BarChart3,
  Activity,
} from 'lucide-react';
import {
  getTrendingTopics,
  getInfluencerAlerts,
  detectViral,
  getNarrativeMomentum,
  getHypeScores,
  getSentimentTimeline,
  getTopInfluencers,
  getPlatformBreakdown,
  getViralStatusColor,
  getMomentumColor,
  getTierColor,
  getRecommendationColor,
  getPlatformLabel,
  type TrendingTopic,
  type InfluencerAlert,
  type ViralDetection,
  type NarrativeMomentum as NarrativeMomentumType,
  type HypeScore,
  type SentimentTimeline,
  type TopInfluencer,
  type PlatformBreakdown,
} from '../lib/hypeRadarService.ts';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const HypeRadar: React.FC = () => {
  const [trending, setTrending] = useState<TrendingTopic[]>([]);
  const [_influencers, setInfluencers] = useState<InfluencerAlert[]>([]);
  const [viral, setViral] = useState<ViralDetection[]>([]);
  const [narratives, setNarratives] = useState<NarrativeMomentumType[]>([]);
  const [hypeScores, setHypeScores] = useState<HypeScore[]>([]);
  const [timeline, setTimeline] = useState<SentimentTimeline[]>([]);
  const [topInfluencers, setTopInfluencers] = useState<TopInfluencer[]>([]);
  const [platforms, setPlatforms] = useState<PlatformBreakdown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setTrending(getTrendingTopics());
      setInfluencers(getInfluencerAlerts());
      setViral(detectViral());
      setNarratives(getNarrativeMomentum());
      setHypeScores(getHypeScores());
      setTimeline(getSentimentTimeline());
      setTopInfluencers(getTopInfluencers());
      setPlatforms(getPlatformBreakdown());
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  const avgSentiment = useMemo(() => {
    if (timeline.length === 0) return 0;
    return timeline[timeline.length - 1].avgScore;
  }, [timeline]);

  const totalMentions = useMemo(() => {
    return trending.reduce((sum, t) => sum + t.mentionCount, 0);
  }, [trending]);

  const viralCount = useMemo(() => {
    return viral.filter(v => v.status === 'viral' || v.status === 'mega_viral').length;
  }, [viral]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Hype Radar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-fuchsia-500/20 animate-pulse">
            <Radio size={24} className="text-fuchsia-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Sentiment &amp; Hype Radar</h1>
            <p className="text-sm text-slate-400">
              Social listening, influencer tracking &amp; viral detection &mdash; Phase 125
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Market Sentiment</p>
          <p className={`text-3xl font-bold ${avgSentiment >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {avgSentiment >= 0 ? '+' : ''}{(avgSentiment * 100).toFixed(0)}
          </p>
          <p className="text-xs text-slate-600 mt-1">sentiment index</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Mentions</p>
          <p className="text-3xl font-bold text-blue-400">{(totalMentions / 1000).toFixed(1)}k</p>
          <p className="text-xs text-slate-600 mt-1">across platforms</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Viral Events</p>
          <p className="text-3xl font-bold text-red-400">{viralCount}</p>
          <p className="text-xs text-slate-600 mt-1">active now</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Trending Topics</p>
          <p className="text-3xl font-bold text-amber-400">{trending.length}</p>
          <p className="text-xs text-slate-600 mt-1">tracked topics</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Top Hype</p>
          {hypeScores.length > 0 ? (
            <>
              <p className="text-lg font-bold text-white truncate">{hypeScores[0].player}</p>
              <p className="text-sm text-fuchsia-400">Score: {hypeScores[0].overallScore}</p>
            </>
          ) : (
            <p className="text-lg text-slate-500">N/A</p>
          )}
        </div>
      </div>

      {/* Sentiment Timeline Chart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Activity size={18} className="text-brand-lime" />
          Sentiment Timeline (7-Day)
        </h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline}>
              <defs>
                <linearGradient id="hypeGradBull" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="hypeGradBear" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area type="monotone" dataKey="bullish" stroke="#22c55e" strokeWidth={2} fill="url(#hypeGradBull)" name="Bullish %" />
              <Area type="monotone" dataKey="bearish" stroke="#ef4444" strokeWidth={2} fill="url(#hypeGradBear)" name="Bearish %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 text-[10px] text-slate-500 mt-2">
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-emerald-500 rounded" /> Bullish</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-500 rounded" /> Bearish</span>
        </div>
      </div>

      {/* Hype Scores & Viral Detection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hype Scores */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Flame size={18} className="text-orange-400" />
            Hype Scores
          </h2>
          <div className="space-y-3">
            {hypeScores.slice(0, 6).map(hs => {
              const recColor = getRecommendationColor(hs.recommendation);
              return (
                <div key={hs.player} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold text-white">{hs.player}</p>
                      <p className="text-[10px] text-slate-500">{hs.card}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-fuchsia-400">{hs.overallScore}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${recColor.bg} ${recColor.text} ${recColor.border} border`}>
                        {hs.recommendation.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-6 gap-1">
                    {Object.entries(hs.components).map(([key, val]) => (
                      <div key={key} className="text-center">
                        <div className="w-full h-1 bg-slate-700 rounded-full mb-0.5">
                          <div className="h-full bg-fuchsia-500/60 rounded-full" style={{ width: `${val}%` }} />
                        </div>
                        <p className="text-[8px] text-slate-600 truncate">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
                    <span>Trend: <span className={hs.trend === 'rising' ? 'text-emerald-400' : hs.trend === 'falling' ? 'text-red-400' : 'text-slate-400'}>{hs.trend}</span></span>
                    <span>Percentile: {hs.percentile}th</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Viral Detection */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <TrendingUp size={18} className="text-red-400" />
            Viral Detection
          </h2>
          <div className="space-y-3">
            {viral.map(v => {
              const statusColor = getViralStatusColor(v.status);
              return (
                <div key={v.id} className={`bg-slate-800/50 border rounded-xl p-4 ${statusColor.border}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white">{v.subject}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColor.bg} ${statusColor.text} font-bold uppercase`}>
                        {v.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <span className="text-xl font-bold text-amber-400">{v.velocityScore}</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{v.triggerEvent}</p>
                  <div className="flex items-center gap-4 text-[10px] text-slate-500 mb-2">
                    <span>Mentions: {v.totalMentions.toLocaleString()}</span>
                    <span>Reach: {(v.estimatedReach / 1000000).toFixed(1)}M</span>
                    <span className={v.priceImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      Price: {v.priceImpact >= 0 ? '+' : ''}{v.priceImpact.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {v.platforms.map(p => (
                      <span key={p.platform} className="text-[10px] px-1.5 py-0.5 bg-slate-700/50 text-slate-400 rounded">
                        {getPlatformLabel(p.platform)} ({p.mentionCount.toLocaleString()})
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Narrative Momentum */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-purple-400" />
          Narrative Momentum
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {narratives.map(nm => {
            const momColor = getMomentumColor(nm.direction);
            return (
              <div key={nm.id} className={`bg-slate-900/50 border rounded-xl p-4 ${momColor.border}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-white">{nm.player}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${momColor.bg} ${momColor.text} font-bold uppercase`}>
                    {nm.direction}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-2 italic">&ldquo;{nm.narrative}&rdquo;</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-slate-500">Momentum:</span>
                  <div className="flex-1 h-2 bg-slate-700 rounded-full">
                    <div className={`h-full rounded-full ${momColor.bg.replace('/10', '/60')}`} style={{ width: `${nm.momentumScore}%` }} />
                  </div>
                  <span className="text-xs font-bold text-slate-300">{nm.momentumScore}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>{nm.daysTrending}d trending &middot; {nm.currentMentions.toLocaleString()} mentions</span>
                  <span className={nm.priceCorrelation >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                    r={nm.priceCorrelation.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Influencer Tracking */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Users size={18} className="text-cyan-400" />
          Top Influencers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {topInfluencers.slice(0, 8).map(inf => (
            <div key={inf.name} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white">{inf.name}</p>
                  {inf.isVerified && <span className="text-[8px] px-1 py-0.5 bg-blue-500/20 text-blue-400 rounded">V</span>}
                </div>
                <span className={`text-[10px] font-bold uppercase ${getTierColor(inf.tier)}`}>{inf.tier}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2">
                <span>{getPlatformLabel(inf.platform)}</span>
                <span>{(inf.followers / 1000).toFixed(0)}K followers</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs font-bold text-amber-400">{inf.avgImpactScore}</p>
                  <p className="text-[8px] text-slate-600">Impact</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-400">{inf.accuracy}%</p>
                  <p className="text-[8px] text-slate-600">Accuracy</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-400">{inf.totalMentions}</p>
                  <p className="text-[8px] text-slate-600">Mentions</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Breakdown */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Radio size={18} className="text-slate-400" />
          Platform Breakdown
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {platforms.map(p => (
            <div key={p.platform} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 text-center">
              <p className="text-xs font-bold text-white mb-2">{getPlatformLabel(p.platform)}</p>
              <p className="text-lg font-bold text-blue-400">{p.mentions}</p>
              <p className="text-[10px] text-slate-600 mb-1">mentions</p>
              <div className="flex items-center justify-center gap-2 text-[10px]">
                <span className={p.sentiment >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                  {p.sentiment >= 0 ? '+' : ''}{p.sentiment}
                </span>
                <span className="text-emerald-400">+{p.growth}%</span>
              </div>
              <p className="text-[8px] text-slate-600 mt-1 truncate">{p.topAuthor}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HypeRadar;
