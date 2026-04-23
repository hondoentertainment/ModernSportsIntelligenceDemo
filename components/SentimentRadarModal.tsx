import React, { useState, useMemo } from 'react';
import {
  X,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Bird,
  Globe,
  Hash,
  ArrowUpRight,
  BarChart3,
  Activity,
} from 'lucide-react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ScatterChart,
  Scatter,
  Cell,
} from 'recharts';
import {
  getAllPlayerSentiments,
  getSentimentAlerts,
  getSentimentTimeline,
  getMarketSentimentOverview,
  getScatterData,
  type SentimentData,
  type SentimentAlert,
} from '../lib/analytics/sentimentRadarService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type TabKey = 'overview' | 'players' | 'alerts' | 'correlation';

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
  if (src === 'twitter') return <Bird size={12} className="text-sky-400" />;
  if (src === 'reddit') return <ArrowUpRight size={12} className="text-orange-400" />;
  if (src === 'forums') return <Globe size={12} className="text-purple-400" />;
  return <Activity size={12} className="text-brand-lime" />;
};

const SentimentRadarModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<TabKey>('overview');
  const [sportFilter, setSportFilter] = useState<string>('All');
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  const allPlayers = useMemo(() => getAllPlayerSentiments(), []);
  const alerts = useMemo(() => getSentimentAlerts(), []);
  const overview = useMemo(() => getMarketSentimentOverview(), []);
  const scatterData = useMemo(() => getScatterData(), []);

  const filteredPlayers = useMemo(
    () => sportFilter === 'All' ? allPlayers : allPlayers.filter(p => p.sport === sportFilter),
    [allPlayers, sportFilter],
  );

  const timeline = useMemo(
    () => selectedPlayer ? getSentimentTimeline(selectedPlayer) : [],
    [selectedPlayer],
  );

  if (!isOpen) return null;

  const gaugePercent = Math.round((overview.overall + 100) / 2);

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'players', label: 'Players' },
    { key: 'alerts', label: `Alerts (${alerts.length})` },
    { key: 'correlation', label: 'Correlation' },
  ];

  /* ── Radar data for a single player ── */
  const radarDataFor = (p: SentimentData) => [
    { source: 'Twitter', value: Math.max(0, p.sources.twitter.score + 100) / 2 },
    { source: 'Reddit', value: Math.max(0, p.sources.reddit.score + 100) / 2 },
    { source: 'Forums', value: Math.max(0, p.sources.forums.score + 100) / 2 },
    { source: 'Volume', value: Math.min(100, (p.volume / 35000) * 100) },
    { source: 'Price Δ', value: Math.min(100, Math.max(0, p.priceChange24h * 4 + 50)) },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-lime/20">
              <MessageCircle size={20} className="text-brand-lime" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Sentiment Radar</h2>
              <p className="text-xs text-slate-400">
                Social media &amp; forum sentiment analysis &mdash; tracking buzz to predict market moves
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                tab === t.key
                  ? 'bg-brand-lime/20 text-brand-lime border border-brand-lime/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Sport filter */}
        {(tab === 'overview' || tab === 'players') && (
          <div className="flex gap-1 px-6 pt-3">
            {SPORT_FILTERS.map(s => (
              <button
                key={s}
                onClick={() => setSportFilter(s)}
                className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  sportFilter === s
                    ? 'bg-slate-700 text-slate-200'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ─── Overview ─── */}
          {tab === 'overview' && (
            <>
              {/* Gauge + Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-5 col-span-1">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    Market Sentiment
                  </h3>
                  <div className="flex items-center justify-center mb-3">
                    <span className={`text-4xl font-black ${sentimentColor(overview.overall)}`}>
                      {overview.overall > 0 ? '+' : ''}{overview.overall}
                    </span>
                  </div>
                  <div className="h-3 bg-slate-700 rounded-full overflow-hidden mb-2">
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

                <div className="bg-slate-800/50 rounded-xl p-5 col-span-1 grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-black text-emerald-400">{overview.bullish}</div>
                    <div className="text-[10px] text-slate-500 uppercase">Bullish</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-slate-300">{overview.neutral}</div>
                    <div className="text-[10px] text-slate-500 uppercase">Neutral</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-red-400">{overview.bearish}</div>
                    <div className="text-[10px] text-slate-500 uppercase">Bearish</div>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-5 col-span-1">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    Total Mentions
                  </h3>
                  <div className="text-3xl font-black text-slate-100">
                    {(overview.totalVolume / 1000).toFixed(1)}k
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">across all tracked platforms</div>
                </div>
              </div>

              {/* Trending Keywords */}
              <div className="bg-slate-800/50 rounded-xl p-5">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  <Hash size={10} className="inline mr-1" />
                  Trending Keywords
                </h3>
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

              {/* Top Movers Table */}
              <div className="bg-slate-800/50 rounded-xl p-5">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  Sentiment Leaderboard
                </h3>
                <div className="space-y-2">
                  {filteredPlayers
                    .sort((a, b) => b.overallSentiment - a.overallSentiment)
                    .map(p => (
                      <div key={p.playerId} className="flex items-center justify-between bg-slate-900/50 rounded-lg px-4 py-3">
                        <div className="flex items-center gap-3">
                          {trendIcon(p.trendDirection)}
                          <div>
                            <div className="text-sm font-bold text-slate-200">{p.player}</div>
                            <div className="text-[10px] text-slate-500">{p.sport} &middot; {(p.volume / 1000).toFixed(1)}k mentions</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-[10px] text-slate-500">Twitter</div>
                            <div className={`text-xs font-bold ${sentimentColor(p.sources.twitter.score)}`}>
                              {p.sources.twitter.score > 0 ? '+' : ''}{p.sources.twitter.score}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-slate-500">Reddit</div>
                            <div className={`text-xs font-bold ${sentimentColor(p.sources.reddit.score)}`}>
                              {p.sources.reddit.score > 0 ? '+' : ''}{p.sources.reddit.score}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-slate-500">Forums</div>
                            <div className={`text-xs font-bold ${sentimentColor(p.sources.forums.score)}`}>
                              {p.sources.forums.score > 0 ? '+' : ''}{p.sources.forums.score}
                            </div>
                          </div>
                          <span className={`text-sm font-black px-2 py-1 rounded border ${sentimentBg(p.overallSentiment)} ${sentimentColor(p.overallSentiment)}`}>
                            {p.overallSentiment > 0 ? '+' : ''}{p.overallSentiment}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}

          {/* ─── Players ─── */}
          {tab === 'players' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredPlayers.map(p => (
                <div
                  key={p.playerId}
                  onClick={() => setSelectedPlayer(selectedPlayer === p.playerId ? null : p.playerId)}
                  className={`bg-slate-800/50 rounded-xl p-5 cursor-pointer transition-all border ${
                    selectedPlayer === p.playerId ? 'border-brand-lime/40' : 'border-transparent hover:border-slate-600'
                  }`}
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
                    <span className={`text-lg font-black ${sentimentColor(p.overallSentiment)}`}>
                      {p.overallSentiment > 0 ? '+' : ''}{p.overallSentiment}
                    </span>
                  </div>

                  {/* Radar Chart */}
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarDataFor(p)} cx="50%" cy="50%" outerRadius="75%">
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis
                          dataKey="source"
                          tick={{ fill: '#94a3b8', fontSize: 10 }}
                        />
                        <PolarRadiusAxis
                          angle={90}
                          domain={[0, 100]}
                          tick={false}
                          axisLine={false}
                        />
                        <Radar
                          name="Sentiment"
                          dataKey="value"
                          stroke="#84cc16"
                          fill="#84cc16"
                          fillOpacity={0.2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Source breakdown */}
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {(['twitter', 'reddit', 'forums'] as const).map(src => {
                      const s = p.sources[src];
                      return (
                        <div key={src} className="bg-slate-900/50 rounded-lg p-2 text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            {sourceIcon(src)}
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{src}</span>
                          </div>
                          <div className={`text-sm font-black ${sentimentColor(s.score)}`}>
                            {s.score > 0 ? '+' : ''}{s.score}
                          </div>
                          <div className="text-[9px] text-slate-500">{(s.volume / 1000).toFixed(1)}k</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Keywords */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {p.keywords.slice(0, 4).map(kw => (
                      <span key={kw} className="px-2 py-0.5 bg-slate-700/50 rounded text-[10px] text-slate-400">
                        #{kw}
                      </span>
                    ))}
                  </div>

                  {/* Expanded timeline */}
                  {selectedPlayer === p.playerId && timeline.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        30-Day Sentiment Timeline
                      </h4>
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={timeline}>
                            <defs>
                              <linearGradient id={`grad-${p.playerId}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#84cc16" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#84cc16" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                            <XAxis
                              dataKey="date"
                              tick={{ fill: '#64748b', fontSize: 9 }}
                              tickFormatter={(v: string) => v.slice(5)}
                            />
                            <YAxis
                              domain={[-100, 100]}
                              tick={{ fill: '#64748b', fontSize: 9 }}
                              width={35}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#0f172a',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                fontSize: 11,
                              }}
                              labelStyle={{ color: '#94a3b8' }}
                            />
                            <Area
                              type="monotone"
                              dataKey="sentiment"
                              stroke="#84cc16"
                              fill={`url(#grad-${p.playerId})`}
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ─── Alerts ─── */}
          {tab === 'alerts' && (
            <div className="space-y-3">
              {alerts.map((a: SentimentAlert) => (
                <div key={a.id} className="bg-slate-800/50 rounded-xl p-4 flex items-start gap-3">
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
          )}

          {/* ─── Correlation ─── */}
          {tab === 'correlation' && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-xl p-5">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  Sentiment vs 24h Price Change
                </h3>
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
                        label={{ value: 'Sentiment Score', position: 'insideBottom', offset: -10, style: { fill: '#64748b', fontSize: 10 } }}
                      />
                      <YAxis
                        type="number"
                        dataKey="priceChange"
                        name="Price Change"
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        label={{ value: 'Price Change %', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 10 } }}
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
                            opacity={0.8}
                          />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Correlation insight */}
              <div className="bg-slate-800/50 rounded-xl p-5">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  <BarChart3 size={10} className="inline mr-1" />
                  Correlation Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {allPlayers
                    .sort((a, b) => b.priceCorrelation - a.priceCorrelation)
                    .slice(0, 6)
                    .map(p => (
                      <div key={p.playerId} className="flex items-center justify-between bg-slate-900/50 rounded-lg px-4 py-3">
                        <div>
                          <div className="text-xs font-bold text-slate-200">{p.player}</div>
                          <div className="text-[10px] text-slate-500">Sentiment {p.overallSentiment > 0 ? '+' : ''}{p.overallSentiment} &middot; Price {p.priceChange24h > 0 ? '+' : ''}{p.priceChange24h}%</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-brand-lime">{(p.priceCorrelation * 100).toFixed(0)}%</div>
                          <div className="text-[9px] text-slate-500">correlation</div>
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

export default SentimentRadarModal;
