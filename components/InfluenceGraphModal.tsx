import React, { useState, useMemo } from 'react';
import {
  X,
  Users,
  Shield,
  Bell,
  Clock,
  Activity,
  Settings,
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
  getAttributionReport,
  formatFollowers,
  tierColor,
  platformIcon,
  platformColor,
  phaseLabel,
  actionLabel,
  actionColor,
  signalLabel,
  type CardCategory,
} from '../lib/analytics/influenceGraphService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type TabKey = 'rankings' | 'timeline' | 'exposure' | 'hype_decay' | 'alerts';

const CATEGORY_FILTERS: { label: string; value: CardCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Basketball', value: 'basketball' },
  { label: 'Baseball', value: 'baseball' },
  { label: 'Football', value: 'football' },
  { label: 'Hockey', value: 'hockey' },
  { label: 'Soccer', value: 'soccer' },
];

const _priorityBadge = (p: string) => {
  const map: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/40',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    low: 'bg-slate-500/20 text-slate-400 border-slate-500/40',
  };
  return map[p] || map.low;
};

const InfluenceGraphModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<TabKey>('rankings');
  const [categoryFilter, setCategoryFilter] = useState<CardCategory | 'all'>('all');
  const [selectedInfluencer, setSelectedInfluencer] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const influencers = useMemo(
    () => categoryFilter === 'all'
      ? getTopInfluencers()
      : getTopInfluencers(categoryFilter),
    [categoryFilter],
  );

  const mentions = useMemo(() => getAllMentions(), []);
  const hypeDecays = useMemo(() => getAllHypeDecayPredictions(), []);
  const signals = useMemo(() => getSocialAlphaSignals(), []);

  const selectedImpact = useMemo(
    () => selectedInfluencer ? getInfluencerImpact(selectedInfluencer) : null,
    [selectedInfluencer],
  );

  const attribution = useMemo(
    () => selectedCard ? getAttributionReport(selectedCard) : null,
    [selectedCard],
  );

  if (!isOpen) return null;

  const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'rankings', label: 'Influencer Rankings', icon: <Users size={12} /> },
    { key: 'timeline', label: 'Social Timeline', icon: <Activity size={12} /> },
    { key: 'exposure', label: 'Portfolio Exposure', icon: <Shield size={12} /> },
    { key: 'hype_decay', label: 'Hype Decay', icon: <Clock size={12} /> },
    { key: 'alerts', label: 'Alert Config', icon: <Bell size={12} /> },
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
              <Users size={20} className="text-brand-lime" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Influence Graph &amp; Social Alpha Attribution</h2>
              <p className="text-xs text-slate-400">
                Track who moves card prices &mdash; attribute price spikes to specific influencers
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
        <div className="flex gap-1 px-6 pt-4 flex-wrap">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                tab === t.key
                  ? 'bg-brand-lime/20 text-brand-lime border border-brand-lime/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ── Rankings Tab ── */}
          {tab === 'rankings' && (
            <>
              {/* Category Filter */}
              <div className="flex gap-1">
                {CATEGORY_FILTERS.map(f => (
                  <button
                    key={f.value}
                    onClick={() => setCategoryFilter(f.value)}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      categoryFilter === f.value
                        ? 'bg-brand-lime/20 text-brand-lime border border-brand-lime/30'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Leaderboard */}
                <div className="lg:col-span-2">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    Influencer Leaderboard by Price Impact
                  </h3>
                  <div className="space-y-1">
                    {influencers.map((inf, idx) => (
                      <button
                        key={inf.id}
                        onClick={() => setSelectedInfluencer(inf.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                          selectedInfluencer === inf.id
                            ? 'bg-brand-lime/10 border border-brand-lime/30'
                            : 'hover:bg-slate-800/50 border border-transparent'
                        }`}
                      >
                        <span className="text-[10px] font-black text-slate-600 w-5 text-right">{idx + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-100 truncate">{inf.name}</span>
                            <span className={`text-[9px] font-black uppercase ${tierColor(inf.tier)}`}>
                              {inf.tier}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-bold ${platformColor(inf.platform)}`}>
                              {platformIcon(inf.platform)}
                            </span>
                            <span className="text-[10px] text-slate-500">{inf.handle}</span>
                            <span className="text-[10px] text-slate-600">{formatFollowers(inf.followers)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black text-emerald-400">
                            +{inf.avgPriceImpactPct}%
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {inf.avgReversionPct}% reverts
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Influencer Detail */}
                <div className="lg:col-span-1">
                  {selectedImpact ? (
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Influencer Detail
                      </h3>
                      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-slate-100">
                            {selectedImpact.influencer.name}
                          </span>
                          <span className={`text-[9px] font-black uppercase ${tierColor(selectedImpact.influencer.tier)}`}>
                            {selectedImpact.influencer.tier}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-slate-900/60 rounded-lg p-2">
                            <p className="text-[9px] text-slate-500 uppercase">Avg Impact</p>
                            <p className="text-sm font-black text-emerald-400">+{selectedImpact.influencer.avgPriceImpactPct}%</p>
                          </div>
                          <div className="bg-slate-900/60 rounded-lg p-2">
                            <p className="text-[9px] text-slate-500 uppercase">Reversion</p>
                            <p className="text-sm font-black text-orange-400">{selectedImpact.influencer.avgReversionPct}%</p>
                          </div>
                          <div className="bg-slate-900/60 rounded-lg p-2">
                            <p className="text-[9px] text-slate-500 uppercase">Time to Peak</p>
                            <p className="text-sm font-black text-sky-400">{selectedImpact.influencer.avgTimeToPeakHours}h</p>
                          </div>
                          <div className="bg-slate-900/60 rounded-lg p-2">
                            <p className="text-[9px] text-slate-500 uppercase">Win Rate</p>
                            <p className="text-sm font-black text-purple-400">{selectedImpact.winRate.toFixed(0)}%</p>
                          </div>
                          <div className="bg-slate-900/60 rounded-lg p-2">
                            <p className="text-[9px] text-slate-500 uppercase">Reliability</p>
                            <p className="text-sm font-black text-brand-lime">{selectedImpact.influencer.reliability}/100</p>
                          </div>
                          <div className="bg-slate-900/60 rounded-lg p-2">
                            <p className="text-[9px] text-slate-500 uppercase">30d Mentions</p>
                            <p className="text-sm font-black text-slate-200">{selectedImpact.influencer.last30dMentions}</p>
                          </div>
                        </div>

                        {/* Best / Worst Call */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-emerald-400 font-bold">Best Call</span>
                            <span className="text-slate-300">{selectedImpact.bestCall.cardName}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-red-400 font-bold">Worst Call</span>
                            <span className="text-slate-300">{selectedImpact.worstCall.cardName}</span>
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

                        {/* Recent Mentions */}
                        {selectedImpact.recentMentions.length > 0 && (
                          <div>
                            <p className="text-[9px] text-slate-500 uppercase mb-2">Recent Mentions</p>
                            <div className="space-y-2">
                              {selectedImpact.recentMentions.slice(0, 3).map(m => (
                                <div key={m.id} className="bg-slate-900/60 rounded-lg p-2">
                                  <p className="text-[10px] text-slate-300 truncate">{m.cardName}</p>
                                  <p className="text-[9px] text-slate-500 truncate mt-0.5">{m.contentSnippet}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                      Select an influencer to view details
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── Timeline Tab ── */}
          {tab === 'timeline' && (
            <>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Social Mentions Timeline &mdash; Price Impact Overlay
              </h3>

              {/* Card selector */}
              <div className="flex gap-1 flex-wrap">
                {[...new Set(mentions.map(m => m.cardId))].map(cardId => {
                  const mention = mentions.find(m => m.cardId === cardId);
                  return (
                    <button
                      key={cardId}
                      onClick={() => setSelectedCard(cardId)}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold transition-colors ${
                        selectedCard === cardId
                          ? 'bg-brand-lime/20 text-brand-lime border border-brand-lime/30'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800 border border-transparent'
                      }`}
                    >
                      {mention?.cardName?.split(' ').slice(-2).join(' ') ?? cardId}
                    </button>
                  );
                })}
              </div>

              {/* Mentions list */}
              <div className="space-y-2">
                {(selectedCard ? mentions.filter(m => m.cardId === selectedCard) : mentions).map(m => {
                  const impactPct = ((m.priceNow - m.priceAtMention) / m.priceAtMention) * 100;
                  const peakPct = ((m.pricePeak - m.priceAtMention) / m.priceAtMention) * 100;
                  const isPositive = impactPct >= 0;

                  return (
                    <div key={m.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase ${platformColor(m.platform)}`}>
                            {platformIcon(m.platform)}
                          </span>
                          <span className="text-sm font-bold text-slate-100">{m.influencerName}</span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(m.mentionDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500">Peak: +{peakPct.toFixed(1)}%</span>
                          <span className={`text-sm font-black ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isPositive ? '+' : ''}{impactPct.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 mb-2">{m.cardName}</p>
                      <p className="text-[11px] text-slate-400 italic">&ldquo;{m.contentSnippet}&rdquo;</p>
                      <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500">
                        <span>Reach: {formatFollowers(m.reach)}</span>
                        <span>Engagement: {formatFollowers(m.engagement)}</span>
                        <span>Sentiment: {m.sentiment > 0 ? '+' : ''}{m.sentiment}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Attribution Report */}
              {attribution && (
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    Attribution Report &mdash; {attribution.cardName}
                  </h4>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-black text-purple-400">{attribution.influencerDrivenPct}%</p>
                      <p className="text-[10px] text-slate-500">Influencer-Driven</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-black text-sky-400">{attribution.fundamentalDrivenPct}%</p>
                      <p className="text-[10px] text-slate-500">Fundamentals</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-black text-slate-400">{attribution.unknownPct}%</p>
                      <p className="text-[10px] text-slate-500">Unknown</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {attribution.topContributors.map((c, i) => (
                      <div key={i} className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-2">
                          <span className={platformColor(c.platform)}>{platformIcon(c.platform)}</span>
                          <span className="text-slate-300">{c.influencerName}</span>
                        </div>
                        <span className="text-purple-400 font-bold">{c.contributionPct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Portfolio Exposure Tab ── */}
          {tab === 'exposure' && (
            <>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                Portfolio Influence Exposure
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Shows which cards are currently being discussed by tracked influencers.
                Connect your inventory to see personalized exposure analysis.
              </p>

              {/* Active signals as proxy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {signals.map(s => {
                  const isPositive = s.predictedImpactPct >= 0;
                  return (
                    <div key={s.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase ${platformColor(s.platform)}`}>
                            {platformIcon(s.platform)}
                          </span>
                          <span className="text-sm font-bold text-slate-100">{s.cardName}</span>
                        </div>
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full border ${
                          isPositive
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : 'bg-red-500/20 text-red-400 border-red-500/40'
                        }`}>
                          {signalLabel(s.signalStrength)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] text-slate-500">
                        <span>By: {s.influencerName}</span>
                        <span>Impact: {isPositive ? '+' : ''}{s.predictedImpactPct}%</span>
                        <span>Confidence: {s.confidence}%</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 italic">&ldquo;{s.mentionSnippet}&rdquo;</p>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── Hype Decay Tab ── */}
          {tab === 'hype_decay' && (
            <>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                Hype Decay Predictions &mdash; When Do Price Spikes Revert?
              </h3>
              <div className="space-y-4">
                {hypeDecays.map(decay => (
                  <div key={decay.mentionId} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-bold text-slate-100">{decay.cardName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-black uppercase ${platformColor(decay.platform)}`}>
                            {platformIcon(decay.platform)}
                          </span>
                          <span className="text-[10px] text-slate-500">by {decay.influencerName}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          decay.currentPhase === 'spiking' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                          decay.currentPhase === 'plateau' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                          decay.currentPhase === 'decaying' ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' :
                          decay.currentPhase === 'new_floor' ? 'bg-purple-500/20 text-purple-400 border-purple-500/40' :
                          'bg-slate-500/20 text-slate-400 border-slate-500/40'
                        }`}>
                          {phaseLabel(decay.currentPhase)}
                        </span>
                        <span className={`text-sm font-bold ${actionColor(decay.recommendedAction)}`}>
                          {actionLabel(decay.recommendedAction)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3 mb-3">
                      <div className="bg-slate-900/60 rounded-lg p-2 text-center">
                        <p className="text-[9px] text-slate-500 uppercase">Peak</p>
                        <p className="text-sm font-black text-emerald-400">+{decay.predictedPeakPct}%</p>
                      </div>
                      <div className="bg-slate-900/60 rounded-lg p-2 text-center">
                        <p className="text-[9px] text-slate-500 uppercase">Reversion</p>
                        <p className="text-sm font-black text-orange-400">{decay.predictedReversionPct}%</p>
                      </div>
                      <div className="bg-slate-900/60 rounded-lg p-2 text-center">
                        <p className="text-[9px] text-slate-500 uppercase">Current</p>
                        <p className="text-sm font-black text-sky-400">+{decay.currentPriceVsMention}%</p>
                      </div>
                      <div className="bg-slate-900/60 rounded-lg p-2 text-center">
                        <p className="text-[9px] text-slate-500 uppercase">Confidence</p>
                        <p className="text-sm font-black text-slate-200">{decay.confidence}%</p>
                      </div>
                    </div>

                    {/* Decay Curve Chart */}
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={decay.decayCurve}>
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
                            labelFormatter={(l) => `${l} hours`}
                            formatter={(v: number) => [`${v.toFixed(1)}%`, 'Price Change']}
                          />
                          <Area
                            type="monotone"
                            dataKey="predictedChangePct"
                            stroke="#84cc16"
                            fill="url(#decayGradient)"
                            strokeWidth={2}
                          />
                          <defs>
                            <linearGradient id="decayGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Alert Configuration Tab ── */}
          {tab === 'alerts' && (
            <>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                Influencer Alert Configuration
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Settings size={14} className="text-brand-lime" />
                    <h4 className="text-xs font-bold text-slate-200">Alert Thresholds</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Mega-tier mention</span>
                      <span className="text-[10px] font-bold text-red-400">Critical</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Impact &gt; 15%</span>
                      <span className="text-[10px] font-bold text-orange-400">High</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Impact &gt; 10%</span>
                      <span className="text-[10px] font-bold text-amber-400">Medium</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Any mention</span>
                      <span className="text-[10px] font-bold text-slate-400">Low</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Bell size={14} className="text-brand-lime" />
                    <h4 className="text-xs font-bold text-slate-200">Notification Channels</h4>
                  </div>
                  <div className="space-y-3">
                    {['In-App Push', 'Email Digest', 'SMS (Critical Only)', 'Webhook'].map((ch) => (
                      <div key={ch} className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">{ch}</span>
                        <div className="w-8 h-4 bg-brand-lime/30 rounded-full relative">
                          <div className="absolute right-0.5 top-0.5 w-3 h-3 rounded-full bg-brand-lime" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tracked Influencers */}
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                Tracked Influencers ({influencers.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {influencers.slice(0, 12).map(inf => (
                  <div key={inf.id} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-[10px] font-black ${platformColor(inf.platform)}`}>
                        {platformIcon(inf.platform)}
                      </span>
                      <span className="text-xs font-bold text-slate-200 truncate">{inf.name}</span>
                    </div>
                    <div className="w-8 h-4 bg-brand-lime/30 rounded-full relative flex-shrink-0 ml-2">
                      <div className="absolute right-0.5 top-0.5 w-3 h-3 rounded-full bg-brand-lime" />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfluenceGraphModal;
