// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  MessageCircle, TrendingUp, TrendingDown, Minus,
  Hash, AlertTriangle, Activity, Twitter, Globe,
  ArrowUpRight,
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, ScatterChart, Scatter, XAxis, YAxis,
  CartesianGrid, Cell,
} from 'recharts';
import {
  getAllPlayerSentiments,
  getSentimentAlerts,
  getMarketSentimentOverview,
  getScatterData,
  type SentimentData,
  type SentimentAlert,
} from '../lib/analytics/sentimentRadarService';

const SPORT_FILTERS = ['All', 'NBA', 'NFL', 'MLB', 'NHL', 'WNBA'] as const;

const sentimentColor = (s: number) => {
  if (s >= 60) return 'text-emerald-400';
  if (s >= 20) return 'text-emerald-300';
  if (s >= -20) return 'text-slate-300';
  if (s >= -60) return 'text-red-300';
  return 'text-red-400';
};

const sentimentBg = (s: number) => {
  if (s >= 20) return 'bg-emerald-500/20 border-emerald-500/30';
  if (s >= -20) return 'bg-slate-500/20 border-slate-500/30';
  return 'bg-red-500/20 border-red-500/30';
};

const trendIcon = (dir: string, size = 12) => {
  if (dir === 'rising') return <TrendingUp size={size} className="text-emerald-400" />;
  if (dir === 'falling') return <TrendingDown size={size} className="text-red-400" />;
  return <Minus size={size} className="text-slate-400" />;
};

const severityBadge = (sev: string) => {
  const map: Record<string, string> = {
    high: 'bg-red-500/20 text-red-400 border-red-500/40',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    low: 'bg-slate-500/20 text-slate-400 border-slate-500/40',
  };
  return map[sev] || map.low;
};

const sourceIcon = (src: string) => {
  if (src === 'twitter') return <Twitter size={12} className="text-sky-400" />;
  if (src === 'reddit') return <ArrowUpRight size={12} className="text-orange-400" />;
  if (src === 'forums') return <Globe size={12} className="text-purple-400" />;
  return <Activity size={12} className="text-brand-lime" />;
};

const radarDataFor = (p: SentimentData) => [
  { source: 'Twitter', value: Math.max(0, p.sources.twitter.score + 100) / 2 },
  { source: 'Reddit', value: Math.max(0, p.sources.reddit.score + 100) / 2 },
  { source: 'Forums', value: Math.max(0, p.sources.forums.score + 100) / 2 },
  { source: 'Volume', value: Math.min(100, (p.volume / 35000) * 100) },
  { source: 'Price Corr.', value: p.priceCorrelation * 100 },
];

const SentimentRadar: React.FC = () => {
  const [sportFilter, setSportFilter] = useState<string>('All');

  const allPlayers = useMemo(() => getAllPlayerSentiments(), []);
  const alerts = useMemo(() => getSentimentAlerts(), []);
  const overview = useMemo(() => getMarketSentimentOverview(), []);
  const scatterData = useMemo(() => getScatterData(), []);

  const filteredPlayers = useMemo(
    () => sportFilter === 'All' ? allPlayers : allPlayers.filter(p => p.sport === sportFilter),
    [allPlayers, sportFilter],
  );

  const gaugePercent = Math.round((overview.overall + 100) / 2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-brand-lime/20">
          <MessageCircle size={24} className="text-brand-lime" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Sentiment Radar &mdash; Social Intelligence &amp; Market Prediction
          </h1>
          <p className="text-sm text-slate-400">
            Track Twitter, Reddit &amp; forum buzz to anticipate card market moves before they happen
          </p>
        </div>
      </div>

      {/* Sport filter */}
      <div className="flex gap-1">
        {SPORT_FILTERS.map(s => (
          <button
            key={s}
            onClick={() => setSportFilter(s)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
              sportFilter === s
                ? 'bg-brand-lime/20 text-brand-lime border border-brand-lime/30'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* ── Market Sentiment Overview ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Gauge */}
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5 col-span-1">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
            Market Sentiment
          </h3>
          <div className="flex items-center justify-center mb-3">
            <span className={`text-5xl font-black ${sentimentColor(overview.overall)}`}>
              {overview.overall > 0 ? '+' : ''}{overview.overall}
            </span>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${gaugePercent}%`,
                background: overview.overall >= 0
                  ? 'linear-gradient(90deg, #84cc16, #34d399)'
                  : 'linear-gradient(90deg, #ef4444, #f97316)',
              }}
            />
          </div>
          <div className="flex justify-between">
            <span className="text-[9px] text-red-400/60">Bearish</span>
            <span className="text-[9px] text-emerald-400/60">Bullish</span>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5 col-span-1 flex flex-col justify-center">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 uppercase">Bullish Players</span>
              <span className="text-lg font-black text-emerald-400">{overview.bullish}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 uppercase">Neutral</span>
              <span className="text-lg font-black text-slate-300">{overview.neutral}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 uppercase">Bearish Players</span>
              <span className="text-lg font-black text-red-400">{overview.bearish}</span>
            </div>
          </div>
        </div>

        {/* Total Volume */}
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5 col-span-1 flex flex-col justify-center">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            Total Mentions
          </h3>
          <div className="text-4xl font-black text-slate-100">{(overview.totalVolume / 1000).toFixed(1)}k</div>
          <div className="text-[10px] text-slate-500 mt-1">across Twitter, Reddit &amp; forums</div>
        </div>

        {/* Latest Alert */}
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5 col-span-1">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            <AlertTriangle size={10} className="inline mr-1" />
            Latest Alert
          </h3>
          {alerts[0] && (
            <>
              <div className="flex items-center gap-2 mb-2">
                {sourceIcon(alerts[0].source)}
                <span className="text-sm font-bold text-slate-200">{alerts[0].player}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${severityBadge(alerts[0].severity)}`}>
                  {alerts[0].severity}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">{alerts[0].message}</p>
            </>
          )}
        </div>
      </div>

      {/* ── Player Sentiment Cards with Radar ── */}
      <div>
        <h2 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-4">
          Player Sentiment Breakdown
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPlayers
            .sort((a, b) => b.overallSentiment - a.overallSentiment)
            .map(p => (
              <div
                key={p.playerId}
                className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5 hover:border-brand-lime/30 transition-all"
              >
                {/* Player header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {trendIcon(p.trendDirection, 14)}
                    <div>
                      <span className="text-sm font-bold text-slate-200">{p.player}</span>
                      <span className="ml-2 text-[10px] text-slate-500">{p.sport}</span>
                    </div>
                  </div>
                  <span className={`text-xl font-black ${sentimentColor(p.overallSentiment)}`}>
                    {p.overallSentiment > 0 ? '+' : ''}{p.overallSentiment}
                  </span>
                </div>

                {/* Radar */}
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarDataFor(p)} cx="50%" cy="50%" outerRadius="70%">
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="source" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar
                        name="Score"
                        dataKey="value"
                        stroke="#84cc16"
                        fill="#84cc16"
                        fillOpacity={0.2}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          fontSize: 10,
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Source scores */}
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {(['twitter', 'reddit', 'forums'] as const).map(src => {
                    const s = p.sources[src];
                    return (
                      <div key={src} className="bg-slate-800/50 rounded-lg p-2 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          {sourceIcon(src)}
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{src}</span>
                        </div>
                        <div className={`text-sm font-black ${sentimentColor(s.score)}`}>
                          {s.score > 0 ? '+' : ''}{s.score}
                        </div>
                        <div className="text-[9px] text-slate-500">{(s.volume / 1000).toFixed(1)}k mentions</div>
                      </div>
                    );
                  })}
                </div>

                {/* Price + Keywords */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
                  <div className="flex flex-wrap gap-1">
                    {p.keywords.slice(0, 3).map(kw => (
                      <span key={kw} className="px-2 py-0.5 bg-slate-800/80 rounded text-[10px] text-slate-400">
                        #{kw}
                      </span>
                    ))}
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-200">${p.currentPrice.toLocaleString()}</div>
                    <div className={`text-[10px] font-bold ${p.priceChange24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {p.priceChange24h >= 0 ? '+' : ''}{p.priceChange24h.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* ── Trending Keywords ── */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
          <Hash size={10} className="inline mr-1" />
          Trending Keywords &amp; Topics
        </h2>
        <div className="flex flex-wrap gap-2">
          {overview.topKeywords.map(kw => (
            <span
              key={kw.keyword}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${sentimentBg(kw.sentiment)} ${sentimentColor(kw.sentiment)}`}
            >
              {kw.keyword}
              <span className="ml-1.5 opacity-60">({kw.count})</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Sentiment Alerts Feed ── */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
          <AlertTriangle size={10} className="inline mr-1" />
          Sentiment Alerts Feed
        </h2>
        <div className="space-y-3">
          {alerts.map((a: SentimentAlert) => (
            <div key={a.id} className="flex items-start gap-3 bg-slate-800/50 rounded-xl p-4">
              <div className="mt-0.5">{sourceIcon(a.source)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-slate-200">{a.player}</span>
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${severityBadge(a.severity)}`}>
                    {a.severity}
                  </span>
                  <span className={`text-[10px] font-bold ${sentimentColor(a.sentiment)}`}>
                    {a.sentiment > 0 ? '+' : ''}{a.sentiment}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{a.message}</p>
                <span className="text-[10px] text-slate-600 mt-1 block">
                  {new Date(a.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Sentiment vs Price Correlation Scatter ── */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
          Sentiment vs Price Change Correlation
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="sentiment"
                name="Sentiment"
                domain={[-100, 100]}
                tick={{ fill: '#64748b', fontSize: 10 }}
                label={{
                  value: 'Sentiment Score',
                  position: 'insideBottom',
                  offset: -10,
                  style: { fill: '#64748b', fontSize: 10 },
                }}
              />
              <YAxis
                type="number"
                dataKey="priceChange"
                name="Price Change %"
                tick={{ fill: '#64748b', fontSize: 10 }}
                label={{
                  value: 'Price Change %',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fill: '#64748b', fontSize: 10 },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  fontSize: 11,
                }}
                formatter={(value: number, name: string) => [
                  name === 'Sentiment' ? value : `${value.toFixed(1)}%`,
                  name,
                ]}
                labelFormatter={(_, payload) => {
                  if (payload && payload[0]) return (payload[0].payload as { player: string }).player;
                  return '';
                }}
              />
              <Scatter data={scatterData} fill="#84cc16">
                {scatterData.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={entry.sentiment >= 0 ? '#34d399' : '#f87171'}
                    opacity={0.85}
                    r={8}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-slate-400">Positive sentiment</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <span className="text-[10px] text-slate-400">Negative sentiment</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentRadar;
