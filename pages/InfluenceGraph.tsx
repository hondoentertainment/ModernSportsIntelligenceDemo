import React, { useState, useMemo } from 'react';
import {
  Users,
  TrendingUp,
  TrendingDown,
  Zap,
  Activity,
  Eye,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import {
  getTopInfluencers,
  getInfluencerImpact,
  getAllMentions,
  getAllHypeDecayPredictions,
  getSocialAlphaSignals,
  getMentionedCardIds,
  formatFollowers,
  tierColor,
  platformIcon,
  platformColor,
  phaseLabel,
  actionLabel,
  actionColor,
  signalLabel,
  type CardCategory,
} from '../lib/influenceGraphService';

const CATEGORY_FILTERS: { label: string; value: CardCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Basketball', value: 'basketball' },
  { label: 'Baseball', value: 'baseball' },
  { label: 'Football', value: 'football' },
  { label: 'Hockey', value: 'hockey' },
  { label: 'Soccer', value: 'soccer' },
];

const InfluenceGraph: React.FC = () => {
  const [categoryFilter, setCategoryFilter] = useState<CardCategory | 'all'>('all');
  const [selectedInfluencer, setSelectedInfluencer] = useState<string | null>(null);
  const [selectedDecay, setSelectedDecay] = useState<string | null>(null);

  const influencers = useMemo(
    () => categoryFilter === 'all' ? getTopInfluencers() : getTopInfluencers(categoryFilter),
    [categoryFilter],
  );

  const mentions = useMemo(() => getAllMentions(), []);
  const hypeDecays = useMemo(() => getAllHypeDecayPredictions(), []);
  const signals = useMemo(() => getSocialAlphaSignals(), []);
  const _cardIds = useMemo(() => getMentionedCardIds(), []);

  const selectedImpact = useMemo(
    () => selectedInfluencer ? getInfluencerImpact(selectedInfluencer) : null,
    [selectedInfluencer],
  );

  const activeDecay = useMemo(
    () => selectedDecay
      ? hypeDecays.find(d => d.mentionId === selectedDecay) ?? hypeDecays[0]
      : hypeDecays[0],
    [selectedDecay, hypeDecays],
  );

  // Summary stats
  const totalMentions24h = mentions.filter(m => {
    const diff = Date.now() - new Date(m.mentionDate).getTime();
    return diff < 24 * 60 * 60 * 1000;
  }).length;

  const avgImpact = influencers.length > 0
    ? (influencers.reduce((s, i) => s + i.avgPriceImpactPct, 0) / influencers.length).toFixed(1)
    : '0';

  const actionableSignals = signals.filter(s => s.isActionable).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-brand-lime/20">
          <Users size={24} className="text-brand-lime" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Influence Graph &amp; Social Alpha Attribution
          </h1>
          <p className="text-sm text-slate-400">
            Track who moves card prices &mdash; attribute price movements to specific influencers across YouTube, X, TikTok &amp; podcasts
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-1">
        {CATEGORY_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setCategoryFilter(f.value)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
              categoryFilter === f.value
                ? 'bg-brand-lime/20 text-brand-lime border border-brand-lime/30'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users size={14} className="text-brand-lime" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tracked Influencers</span>
          </div>
          <p className="text-3xl font-black text-slate-100">{influencers.length}</p>
          <p className="text-[10px] text-slate-500 mt-1">Across all platforms</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={14} className="text-sky-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">24h Mentions</span>
          </div>
          <p className="text-3xl font-black text-sky-400">{totalMentions24h}</p>
          <p className="text-[10px] text-slate-500 mt-1">Price-moving mentions</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-emerald-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Impact</span>
          </div>
          <p className="text-3xl font-black text-emerald-400">+{avgImpact}%</p>
          <p className="text-[10px] text-slate-500 mt-1">Average price spike</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-amber-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Signals</span>
          </div>
          <p className="text-3xl font-black text-amber-400">{actionableSignals}</p>
          <p className="text-[10px] text-slate-500 mt-1">Actionable alpha signals</p>
        </div>
      </div>

      {/* ── Influencer Leaderboard + Detail ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
            Influencer Leaderboard &mdash; Ranked by Price Impact
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-[9px] text-slate-500 uppercase tracking-wider pb-2 pr-3">#</th>
                  <th className="text-left text-[9px] text-slate-500 uppercase tracking-wider pb-2 pr-3">Influencer</th>
                  <th className="text-left text-[9px] text-slate-500 uppercase tracking-wider pb-2 pr-3">Platform</th>
                  <th className="text-right text-[9px] text-slate-500 uppercase tracking-wider pb-2 pr-3">Avg Impact</th>
                  <th className="text-right text-[9px] text-slate-500 uppercase tracking-wider pb-2 pr-3">Reversion</th>
                  <th className="text-right text-[9px] text-slate-500 uppercase tracking-wider pb-2 pr-3">Reliability</th>
                  <th className="text-right text-[9px] text-slate-500 uppercase tracking-wider pb-2">30d Mentions</th>
                </tr>
              </thead>
              <tbody>
                {influencers.map((inf, idx) => (
                  <tr
                    key={inf.id}
                    onClick={() => setSelectedInfluencer(inf.id)}
                    className={`border-b border-slate-800/50 cursor-pointer transition-colors ${
                      selectedInfluencer === inf.id
                        ? 'bg-brand-lime/5'
                        : 'hover:bg-slate-800/30'
                    }`}
                  >
                    <td className="py-2.5 pr-3 text-[10px] font-black text-slate-600">{idx + 1}</td>
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-100">{inf.name}</span>
                        <span className={`text-[8px] font-black uppercase ${tierColor(inf.tier)}`}>
                          {inf.tier}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">{inf.handle}</p>
                    </td>
                    <td className="py-2.5 pr-3">
                      <span className={`text-[10px] font-black uppercase ${platformColor(inf.platform)}`}>
                        {platformIcon(inf.platform)}
                      </span>
                      <span className="text-[10px] text-slate-500 ml-1">{formatFollowers(inf.followers)}</span>
                    </td>
                    <td className="py-2.5 pr-3 text-right">
                      <span className="text-xs font-black text-emerald-400">+{inf.avgPriceImpactPct}%</span>
                    </td>
                    <td className="py-2.5 pr-3 text-right">
                      <span className="text-xs font-bold text-orange-400">{inf.avgReversionPct}%</span>
                    </td>
                    <td className="py-2.5 pr-3 text-right">
                      <span className={`text-xs font-bold ${
                        inf.reliability >= 80 ? 'text-emerald-400' :
                        inf.reliability >= 60 ? 'text-amber-400' :
                        'text-red-400'
                      }`}>{inf.reliability}</span>
                    </td>
                    <td className="py-2.5 text-right">
                      <span className="text-xs text-slate-300">{inf.last30dMentions}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Influencer Detail Panel */}
        <div className="lg:col-span-1 bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5">
          {selectedImpact ? (
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Influencer Profile
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base font-bold text-slate-100">{selectedImpact.influencer.name}</span>
                <span className={`text-[9px] font-black uppercase ${tierColor(selectedImpact.influencer.tier)}`}>
                  {selectedImpact.influencer.tier}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                {selectedImpact.influencer.handle} on {platformIcon(selectedImpact.influencer.platform)} &bull; {formatFollowers(selectedImpact.influencer.followers)} followers
              </p>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-800/50 rounded-lg p-2.5">
                  <p className="text-[9px] text-slate-500 uppercase">Avg Impact</p>
                  <p className="text-lg font-black text-emerald-400">+{selectedImpact.influencer.avgPriceImpactPct}%</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2.5">
                  <p className="text-[9px] text-slate-500 uppercase">Reversion</p>
                  <p className="text-lg font-black text-orange-400">{selectedImpact.influencer.avgReversionPct}%</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2.5">
                  <p className="text-[9px] text-slate-500 uppercase">Time to Peak</p>
                  <p className="text-lg font-black text-sky-400">{selectedImpact.influencer.avgTimeToPeakHours}h</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2.5">
                  <p className="text-[9px] text-slate-500 uppercase">Win Rate</p>
                  <p className="text-lg font-black text-purple-400">{selectedImpact.winRate.toFixed(0)}%</p>
                </div>
              </div>

              {/* Impact Distribution */}
              <div>
                <p className="text-[9px] text-slate-500 uppercase mb-2">Impact Distribution</p>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={selectedImpact.impactDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="range" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} />
                      <Bar dataKey="count" fill="#84cc16" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Best / Worst Calls */}
              <div className="space-y-2">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2">
                  <p className="text-[9px] text-emerald-400 font-bold uppercase">Best Call</p>
                  <p className="text-[10px] text-slate-300">{selectedImpact.bestCall.cardName}</p>
                  <p className="text-xs font-black text-emerald-400">+{selectedImpact.bestCall.impactPct.toFixed(1)}%</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                  <p className="text-[9px] text-red-400 font-bold uppercase">Worst Call</p>
                  <p className="text-[10px] text-slate-300">{selectedImpact.worstCall.cardName}</p>
                  <p className="text-xs font-black text-red-400">{selectedImpact.worstCall.impactPct.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Eye size={32} className="text-slate-700 mb-3" />
              <p className="text-sm text-slate-500">Select an influencer from the leaderboard</p>
              <p className="text-[10px] text-slate-600 mt-1">View detailed impact analytics and mention history</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Social Alpha Timeline ── */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
          Social Alpha Timeline &mdash; Latest Price-Moving Mentions
        </h3>
        <div className="space-y-2">
          {mentions.slice(0, 8).map(m => {
            const impactPct = ((m.priceNow - m.priceAtMention) / m.priceAtMention) * 100;
            const peakPct = ((m.pricePeak - m.priceAtMention) / m.priceAtMention) * 100;
            const isPositive = impactPct >= 0;

            return (
              <div key={m.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/30 transition-colors border border-transparent hover:border-slate-700/50">
                <div className="flex-shrink-0">
                  <span className={`text-xs font-black uppercase ${platformColor(m.platform)}`}>
                    {platformIcon(m.platform)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">{m.influencerName}</span>
                    <span className="text-[10px] text-slate-600">
                      {new Date(m.mentionDate).toLocaleDateString()} {new Date(m.mentionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">{m.cardName}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[10px] text-slate-500">
                    Peak +{peakPct.toFixed(1)}%
                  </span>
                  <div className="flex items-center gap-1">
                    {isPositive ? (
                      <TrendingUp size={12} className="text-emerald-400" />
                    ) : (
                      <TrendingDown size={12} className="text-red-400" />
                    )}
                    <span className={`text-sm font-black ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isPositive ? '+' : ''}{impactPct.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Hype Decay Analyzer + Portfolio Exposure ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Hype Decay */}
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
            Hype Decay Analyzer
          </h3>

          {/* Decay selector */}
          <div className="flex gap-1 mb-4 flex-wrap">
            {hypeDecays.map(d => (
              <button
                key={d.mentionId}
                onClick={() => setSelectedDecay(d.mentionId)}
                className={`px-2 py-1 rounded-md text-[9px] font-bold transition-colors ${
                  (selectedDecay ?? hypeDecays[0]?.mentionId) === d.mentionId
                    ? 'bg-brand-lime/20 text-brand-lime border border-brand-lime/30'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800 border border-transparent'
                }`}
              >
                {d.cardName.split(' ').slice(-2).join(' ')}
              </button>
            ))}
          </div>

          {activeDecay && (
            <>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-slate-100">{activeDecay.cardName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-black uppercase ${platformColor(activeDecay.platform)}`}>
                      {platformIcon(activeDecay.platform)}
                    </span>
                    <span className="text-[10px] text-slate-500">by {activeDecay.influencerName}</span>
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                      activeDecay.currentPhase === 'spiking' ? 'bg-emerald-500/20 text-emerald-400' :
                      activeDecay.currentPhase === 'plateau' ? 'bg-amber-500/20 text-amber-400' :
                      activeDecay.currentPhase === 'decaying' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {phaseLabel(activeDecay.currentPhase)}
                    </span>
                  </div>
                </div>
                <span className={`text-sm font-bold ${actionColor(activeDecay.recommendedAction)}`}>
                  {actionLabel(activeDecay.recommendedAction)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                  <p className="text-[9px] text-slate-500 uppercase">Peak</p>
                  <p className="text-sm font-black text-emerald-400">+{activeDecay.predictedPeakPct}%</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                  <p className="text-[9px] text-slate-500 uppercase">Current</p>
                  <p className="text-sm font-black text-sky-400">+{activeDecay.currentPriceVsMention}%</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                  <p className="text-[9px] text-slate-500 uppercase">Conf</p>
                  <p className="text-sm font-black text-slate-200">{activeDecay.confidence}%</p>
                </div>
              </div>

              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activeDecay.decayCurve}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="hoursFromMention"
                      tick={{ fontSize: 9, fill: '#94a3b8' }}
                      tickFormatter={(v) => `${v}h`}
                    />
                    <YAxis
                      tick={{ fontSize: 9, fill: '#94a3b8' }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
                      labelFormatter={(l) => `${l} hours after mention`}
                      formatter={(v: number) => [`${v.toFixed(1)}%`, 'Price Change']}
                    />
                    <Area
                      type="monotone"
                      dataKey="predictedChangePct"
                      stroke="#84cc16"
                      fill="url(#decayGradientPage)"
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="decayGradientPage" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>

        {/* Portfolio Exposure Dashboard */}
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
            Active Social Alpha Signals
          </h3>
          <div className="space-y-2">
            {signals.map(s => {
              const isPositive = s.predictedImpactPct >= 0;
              return (
                <div key={s.id} className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase ${platformColor(s.platform)}`}>
                        {platformIcon(s.platform)}
                      </span>
                      <span className="text-xs font-bold text-slate-200 truncate">{s.cardName}</span>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      s.signalStrength === 'strong_buy' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                      s.signalStrength === 'buy' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
                      s.signalStrength === 'sell' ? 'bg-red-500/15 text-red-300 border-red-500/30' :
                      s.signalStrength === 'strong_sell' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                      'bg-slate-500/20 text-slate-400 border-slate-500/40'
                    }`}>
                      {signalLabel(s.signalStrength)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500">
                    <span>By: {s.influencerName}</span>
                    <span className={`font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isPositive ? '+' : ''}{s.predictedImpactPct}%
                    </span>
                    <span>Conf: {s.confidence}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfluenceGraph;
