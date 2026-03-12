import React, { useState, useMemo, useCallback } from 'react';
import {
  X,
  Droplets,
  BarChart3,
  Zap,
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Target,
  Calendar,
  Shield,
  ArrowRight,
  ChevronDown,
  Package,
  Users,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  Area,
  AreaChart,
} from 'recharts';
import { CardInventory, Sport } from '../types';
import {
  calculateDetailedLiquidityScore,
  generateMarketDepth,
  calculateExitVelocity,
  getListingRecommendation,
  getPortfolioLiquidityReport,
  detectIlliquidityOpportunities,
  getSeasonalLiquidityProfiles,
  generateEmergencyLiquidationPlan,
  saveLiquiditySettings,
  loadLiquiditySettings,
  LiquidityScoreDetail,
  MarketDepthLevel,
  ExitVelocityPoint,
  ListingRecommendation,
  PortfolioLiquidityReport,
  IlliquidityOpportunity,
  SeasonalLiquidityProfile,
  EmergencyLiquidationPlan,
  LiquiditySettings,
} from '../lib/LiquidityService';

interface LiquidityModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardInventory[];
  selectedCardId?: string;
}

type TabId = 'card' | 'portfolio' | 'seasonal' | 'opportunities' | 'emergency';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'card', label: 'Card Analysis', icon: <Droplets size={16} /> },
  { id: 'portfolio', label: 'Portfolio', icon: <BarChart3 size={16} /> },
  { id: 'seasonal', label: 'Seasonal', icon: <Calendar size={16} /> },
  { id: 'opportunities', label: 'Opportunities', icon: <Zap size={16} /> },
  { id: 'emergency', label: 'Emergency', icon: <AlertTriangle size={16} /> },
];

const sportColors: Record<Sport, string> = {
  Baseball: '#ef4444',
  Basketball: '#f97316',
  Football: '#3b82f6',
  Hockey: '#8b5cf6',
  Soccer: '#10b981',
};

const sportTailwind: Record<Sport, { text: string; bg: string; border: string }> = {
  Baseball: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  Basketball: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  Football: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  Hockey: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  Soccer: { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
};

function tierBadge(tier: LiquidityScoreDetail['tier']): { text: string; bg: string; border: string } {
  switch (tier) {
    case 'Ultra-Liquid': return { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' };
    case 'Liquid': return { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
    case 'Moderate': return { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' };
    case 'Illiquid': return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    case 'Frozen': return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
  }
}

// ─── Card Analysis Tab ──────────────────────────────────────────────────────

const CardAnalysisTab: React.FC<{
  cards: CardInventory[];
  selectedCardId?: string;
}> = ({ cards, selectedCardId }) => {
  const activeCards = cards.filter(c => c.status !== 'sold');
  const [cardId, setCardId] = useState(selectedCardId || (activeCards[0]?.id ?? ''));

  const card = activeCards.find(c => c.id === cardId) || activeCards[0];

  const score = useMemo(() => card ? calculateDetailedLiquidityScore(card) : null, [card]);
  const depth = useMemo(() => card ? generateMarketDepth(card) : [], [card]);
  const velocity = useMemo(() => card ? calculateExitVelocity(card) : [], [card]);
  const listing = useMemo(() => card ? getListingRecommendation(card) : null, [card]);

  if (!card || !score) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Droplets size={40} className="text-slate-600 mb-4" />
        <p className="text-sm text-slate-400">No cards to analyze</p>
      </div>
    );
  }

  const val = card.currentValue || card.purchasePrice || 0;
  const badge = tierBadge(score.tier);

  // Order book chart data
  const depthChartData = depth.map(level => ({
    price: `$${level.priceLevel.toLocaleString()}`,
    priceNum: level.priceLevel,
    'Buy Orders': level.buyOrders,
    'Sell Orders': level.sellOrders,
  }));

  // Exit velocity chart data
  const velocityData = velocity.map(v => ({
    premium: `${v.premiumPercent >= 0 ? '+' : ''}${v.premiumPercent}%`,
    days: v.estimatedDays,
    probability: Math.round(v.probability * 100),
  }));

  return (
    <div className="space-y-6">
      {/* Card Selector */}
      <div className="relative">
        <select
          value={cardId}
          onChange={e => setCardId(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-cyan-500/50 cursor-pointer"
        >
          {activeCards.map(c => (
            <option key={c.id} value={c.id}>
              {c.player} — {c.year} {c.set} {c.isGraded ? `(${c.gradingCompany} ${c.grade})` : '(Raw)'}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>

      {/* Score Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-center col-span-2 md:col-span-1">
          <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">Score</p>
          <p className={`text-3xl font-bebas tracking-wider ${badge.text}`}>{score.overall}</p>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${badge.bg} ${badge.text} ${badge.border}`}>
            {score.tier}
          </span>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-center">
          <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">Days to Sell</p>
          <p className="text-2xl font-bebas tracking-wider text-white">{score.avgDaysToSell}</p>
          <p className="text-[9px] text-slate-500">days avg</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-center">
          <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">Spread</p>
          <p className="text-2xl font-bebas tracking-wider text-amber-400">{score.bidAskSpread}%</p>
          <p className="text-[9px] text-slate-500">bid-ask</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-center">
          <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">Volume</p>
          <p className="text-2xl font-bebas tracking-wider text-blue-400">{score.recentVolume}</p>
          <p className="text-[9px] text-slate-500">30d txns</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-center">
          <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">Buyers</p>
          <p className="text-2xl font-bebas tracking-wider text-green-400">{score.activeBuyers}</p>
          <p className="text-[9px] text-slate-500">active</p>
        </div>
      </div>

      {/* Market Depth (Order Book) */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-cyan-400" />
          <h4 className="text-sm font-bold text-white">Market Depth — Order Book</h4>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={depthChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="price" tick={{ fontSize: 10, fill: '#64748b' }} interval={1} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  border: '1px solid #374151',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="Buy Orders" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Sell Orders" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Exit Velocity Curve */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-amber-400" />
          <h4 className="text-sm font-bold text-white">Exit Velocity — Days to Sell by Premium</h4>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={velocityData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="premium" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis yAxisId="days" tick={{ fontSize: 10, fill: '#64748b' }} label={{ value: 'Days', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 10 } }} />
              <YAxis yAxisId="prob" orientation="right" tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 100]} label={{ value: 'Prob %', angle: 90, position: 'insideRight', style: { fill: '#64748b', fontSize: 10 } }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  border: '1px solid #374151',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line yAxisId="days" type="monotone" dataKey="days" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} name="Est. Days" />
              <Line yAxisId="prob" type="monotone" dataKey="probability" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Sell Prob %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Key velocity callouts */}
        <div className="grid grid-cols-3 gap-3">
          {velocity.filter(v => [0, 10, 20].includes(v.premiumPercent)).map(v => (
            <div key={v.premiumPercent} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3">
              <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">{v.label}</p>
              <p className="text-lg font-bebas tracking-wider text-white">~{v.estimatedDays} days</p>
              <p className="text-[10px] text-slate-500">{Math.round(v.probability * 100)}% chance in 30d</p>
            </div>
          ))}
        </div>
      </div>

      {/* Listing Price Optimizer */}
      {listing && (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-green-400" />
            <h4 className="text-sm font-bold text-white">Optimal Listing Price</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={14} className="text-green-400" />
                <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Fastest</span>
              </div>
              <p className="text-2xl font-bebas tracking-wider text-green-400">
                ${listing.fastestSale.price.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                ~{listing.fastestSale.days} days to sell
              </p>
              <p className="text-[9px] text-slate-500 mt-0.5">{listing.fastestSale.label}</p>
            </div>
            <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={14} className="text-cyan-400" />
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Risk-Adjusted</span>
              </div>
              <p className="text-2xl font-bebas tracking-wider text-cyan-400">
                ${listing.riskAdjusted.price.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                ~{listing.riskAdjusted.days} days to sell
              </p>
              <p className="text-[9px] text-slate-500 mt-0.5">{listing.riskAdjusted.label}</p>
            </div>
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={14} className="text-amber-400" />
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Max Value</span>
              </div>
              <p className="text-2xl font-bebas tracking-wider text-amber-400">
                ${listing.maxValue.price.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                ~{listing.maxValue.days} days to sell
              </p>
              <p className="text-[9px] text-slate-500 mt-0.5">{listing.maxValue.label}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Portfolio Tab ──────────────────────────────────────────────────────────

const PortfolioTab: React.FC<{ cards: CardInventory[] }> = ({ cards }) => {
  const report = useMemo(() => getPortfolioLiquidityReport(cards), [cards]);

  const activeCards = cards.filter(c => c.status !== 'sold');
  const cardScores = useMemo(() =>
    activeCards.map(c => ({ card: c, score: calculateDetailedLiquidityScore(c) }))
      .sort((a, b) => b.score.overall - a.score.overall),
    [activeCards],
  );

  const tierDistribution = useMemo(() => {
    const tiers: Record<string, { count: number; value: number }> = {
      'Ultra-Liquid': { count: 0, value: 0 },
      'Liquid': { count: 0, value: 0 },
      'Moderate': { count: 0, value: 0 },
      'Illiquid': { count: 0, value: 0 },
      'Frozen': { count: 0, value: 0 },
    };
    cardScores.forEach(({ card, score }) => {
      const val = card.currentValue || card.purchasePrice || 0;
      tiers[score.tier].count++;
      tiers[score.tier].value += val;
    });
    return Object.entries(tiers).map(([tier, data]) => ({
      tier,
      ...data,
    }));
  }, [cardScores]);

  const tierColors: Record<string, string> = {
    'Ultra-Liquid': '#10b981',
    'Liquid': '#3b82f6',
    'Moderate': '#06b6d4',
    'Illiquid': '#f59e0b',
    'Frozen': '#ef4444',
  };

  const timelineData = [
    { period: '7 days', pct: report.liquidWithin7Days.percent, value: report.liquidWithin7Days.value, count: report.liquidWithin7Days.count },
    { period: '30 days', pct: report.liquidWithin30Days.percent, value: report.liquidWithin30Days.value, count: report.liquidWithin30Days.count },
    { period: '90 days', pct: report.liquidWithin90Days.percent, value: report.liquidWithin90Days.value, count: report.liquidWithin90Days.count },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4">
          <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">Score</p>
          <p className="text-3xl font-bebas tracking-wider text-cyan-400">{report.overallScore}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4">
          <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">Avg Days</p>
          <p className="text-3xl font-bebas tracking-wider text-white">{report.avgDaysToSell}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4">
          <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">Total Value</p>
          <p className="text-3xl font-bebas tracking-wider text-green-400">${(report.totalValue / 1000).toFixed(1)}k</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4">
          <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">Illiquid</p>
          <p className="text-3xl font-bebas tracking-wider text-amber-400">{report.illiquidCards}</p>
        </div>
      </div>

      {/* Liquidation Timeline */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 space-y-3">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock size={16} className="text-blue-400" />
          Liquidation Timeline
        </h4>
        <div className="space-y-3">
          {timelineData.map(row => (
            <div key={row.period} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Within {row.period}</span>
                <span className="text-white font-mono">{row.pct}% — ${row.value.toLocaleString()} ({row.count} cards)</span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700"
                  style={{ width: `${row.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tier Distribution */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 space-y-3">
        <h4 className="text-sm font-bold text-white">Tier Distribution</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tierDistribution} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="tier" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px', fontSize: '12px' }}
                labelStyle={{ color: '#fff' }}
                formatter={(value: number, name: string) => [name === 'value' ? `$${value.toLocaleString()}` : value, name === 'value' ? 'Value' : 'Cards']}
              />
              <Bar dataKey="count" name="Cards" radius={[4, 4, 0, 0]}>
                {tierDistribution.map(entry => (
                  <Cell key={entry.tier} fill={tierColors[entry.tier] || '#64748b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Card Rankings */}
      <div className="space-y-2">
        <h4 className="text-sm font-bold text-white">Card Liquidity Rankings</h4>
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {cardScores.slice(0, 15).map(({ card: c, score: s }) => {
            const b = tierBadge(s.tier);
            return (
              <div key={c.id} className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl text-xs">
                <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center">
                  <span className={`font-bebas text-lg ${b.text}`}>{s.overall}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{c.player}</p>
                  <p className="text-[10px] text-slate-500 truncate">{c.year} {c.set}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${b.bg} ${b.text} ${b.border}`}>
                  {s.tier}
                </span>
                <span className="text-slate-400 font-mono w-12 text-right">{s.avgDaysToSell}d</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Seasonal Tab ───────────────────────────────────────────────────────────

const SeasonalTab: React.FC = () => {
  const profiles = useMemo(() => getSeasonalLiquidityProfiles(), []);
  const [selectedSport, setSelectedSport] = useState<Sport>('Baseball');

  const profile = profiles.find(p => p.sport === selectedSport) || profiles[0];
  const colors = sportTailwind[selectedSport];

  const chartData = profile.data.map(d => ({
    month: d.month,
    score: d.score,
    volume: d.volume,
  }));

  return (
    <div className="space-y-6">
      {/* Sport Selector */}
      <div className="flex gap-2 flex-wrap">
        {(['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'] as Sport[]).map(sport => {
          const sc = sportTailwind[sport];
          const active = sport === selectedSport;
          return (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                active
                  ? `${sc.bg} ${sc.text} ${sc.border}`
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
              }`}
            >
              {sport}
            </button>
          );
        })}
      </div>

      {/* Seasonal Chart */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 space-y-3">
        <h4 className="text-sm font-bold text-white">
          {selectedSport} — Liquidity by Month
        </h4>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px', fontSize: '12px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Area type="monotone" dataKey="score" stroke={sportColors[selectedSport]} fill={sportColors[selectedSport]} fillOpacity={0.15} strokeWidth={2} name="Liquidity Score" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Volume Chart */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 space-y-3">
        <h4 className="text-sm font-bold text-white">Transaction Volume by Month</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px', fontSize: '12px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="volume" fill={sportColors[selectedSport]} radius={[4, 4, 0, 0]} name="Volume" fillOpacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Peak/Trough Info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
          <p className="text-[9px] font-black text-green-400 uppercase tracking-widest mb-1">Peak Liquidity</p>
          <p className="text-2xl font-bebas tracking-wider text-green-400">{profile.peakMonth}</p>
          <p className="text-[10px] text-slate-400">Best time to sell {selectedSport} cards</p>
        </div>
        <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
          <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1">Trough Liquidity</p>
          <p className="text-2xl font-bebas tracking-wider text-red-400">{profile.troughMonth}</p>
          <p className="text-[10px] text-slate-400">Best time to buy {selectedSport} cards</p>
        </div>
      </div>

      {/* All Sports Comparison */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 space-y-3">
        <h4 className="text-sm font-bold text-white">Cross-Sport Comparison</h4>
        <div className="space-y-2">
          {profiles.map(p => {
            const avgScore = Math.round(p.data.reduce((s, d) => s + d.score, 0) / 12);
            const sc = sportTailwind[p.sport];
            return (
              <div key={p.sport} className="flex items-center gap-3 text-xs">
                <span className={`w-20 text-[10px] font-bold ${sc.text}`}>{p.sport}</span>
                <div className="flex-1 h-4 bg-slate-700 rounded-md overflow-hidden">
                  <div
                    className="h-full rounded-md transition-all"
                    style={{ width: `${avgScore}%`, backgroundColor: sportColors[p.sport] }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-white">{avgScore}</span>
                <span className="w-20 text-right text-slate-500">
                  Peak: {p.peakMonth}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Opportunities Tab ──────────────────────────────────────────────────────

const OpportunitiesTab: React.FC<{ cards: CardInventory[] }> = ({ cards }) => {
  const opportunities = useMemo(() => detectIlliquidityOpportunities(cards), [cards]);

  if (opportunities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Zap size={40} className="text-slate-600 mb-4" />
        <p className="text-sm text-slate-400">No illiquidity opportunities detected</p>
        <p className="text-xs text-slate-600 mt-1">All cards have adequate liquidity</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
        <p className="text-xs text-cyan-400 font-bold">
          {opportunities.length} card{opportunities.length !== 1 ? 's' : ''} with illiquidity discount detected
        </p>
        <p className="text-[10px] text-slate-400 mt-1">
          These cards trade below fair value due to low liquidity — buying opportunities for patient holders.
        </p>
      </div>

      <div className="space-y-2">
        {opportunities.map(opp => (
          <div key={opp.cardId} className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white font-bold">{opp.player}</span>
              <span className="text-xs font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/30">
                {opp.discount.toFixed(1)}% discount
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-slate-500">Current: </span>
                <span className="text-white font-mono">${opp.currentValue.toLocaleString()}</span>
              </div>
              <ArrowRight size={12} className="text-slate-600" />
              <div>
                <span className="text-slate-500">Fair Value: </span>
                <span className="text-green-400 font-mono">${opp.estimatedFairValue.toLocaleString()}</span>
              </div>
              <div className="ml-auto">
                <span className="text-slate-500">Liquidity: </span>
                <span className="text-amber-400 font-mono">{opp.liquidityScore}/100</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500">{opp.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Emergency Tab ──────────────────────────────────────────────────────────

const EmergencyTab: React.FC<{ cards: CardInventory[] }> = ({ cards }) => {
  const settings = useMemo(() => loadLiquiditySettings(), []);
  const [targetAmount, setTargetAmount] = useState(settings.emergencyTargetAmount);
  const [targetDays, setTargetDays] = useState(settings.emergencyTargetDays);

  const plan = useMemo<EmergencyLiquidationPlan>(
    () => generateEmergencyLiquidationPlan(cards, targetAmount, targetDays),
    [cards, targetAmount, targetDays],
  );

  const handleSave = useCallback(() => {
    saveLiquiditySettings({ emergencyTargetAmount: targetAmount, emergencyTargetDays: targetDays });
  }, [targetAmount, targetDays]);

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-400" />
          <h4 className="text-sm font-bold text-white">Emergency Liquidation Planner</h4>
        </div>
        <p className="text-xs text-slate-400">
          If you need cash quickly, this planner shows the optimal set of cards to sell.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[9px] font-black text-brand-muted uppercase tracking-widest block mb-1">
              Target Amount ($)
            </label>
            <input
              type="number"
              value={targetAmount}
              onChange={e => setTargetAmount(Math.max(0, Number(e.target.value)))}
              onBlur={handleSave}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div>
            <label className="text-[9px] font-black text-brand-muted uppercase tracking-widest block mb-1">
              Within (days)
            </label>
            <input
              type="number"
              value={targetDays}
              onChange={e => setTargetDays(Math.max(1, Number(e.target.value)))}
              onBlur={handleSave}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>
      </div>

      {/* Feasibility */}
      <div className={`p-4 rounded-xl border ${
        plan.feasible
          ? 'bg-green-500/5 border-green-500/20'
          : 'bg-red-500/5 border-red-500/20'
      }`}>
        <div className="flex items-center gap-2 mb-1">
          {plan.feasible ? (
            <Shield size={16} className="text-green-400" />
          ) : (
            <AlertTriangle size={16} className="text-red-400" />
          )}
          <span className={`text-sm font-bold ${plan.feasible ? 'text-green-400' : 'text-red-400'}`}>
            {plan.feasible ? 'Plan is feasible' : 'Shortfall detected'}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs mt-2">
          <div>
            <span className="text-slate-500">Target: </span>
            <span className="text-white font-mono">${plan.targetAmount.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-500">Can raise: </span>
            <span className={`font-mono ${plan.feasible ? 'text-green-400' : 'text-amber-400'}`}>
              ${plan.totalLiquidationValue.toLocaleString()}
            </span>
          </div>
          {!plan.feasible && (
            <div>
              <span className="text-slate-500">Shortfall: </span>
              <span className="text-red-400 font-mono">${plan.shortfall.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Cards to Sell */}
      {plan.cardsToSell.length > 0 ? (
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Package size={16} className="text-cyan-400" />
            Sell Order ({plan.cardsToSell.length} cards)
          </h4>
          <div className="space-y-1.5">
            {plan.cardsToSell.map(item => (
              <div key={item.cardId} className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl text-xs">
                <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center">
                  <span className="font-bebas text-sm text-cyan-400">#{item.priority}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{item.player}</p>
                  <p className="text-[10px] text-slate-500">
                    Liquidity: {item.liquidityScore}/100 — ~{item.estimatedDays}d to sell
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono text-white">${item.liquidationPrice.toLocaleString()}</p>
                  {item.liquidationPrice < item.currentValue && (
                    <p className="text-[9px] font-mono text-red-400">
                      -{Math.round(((item.currentValue - item.liquidationPrice) / item.currentValue) * 100)}% discount
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Total Summary */}
          <div className="flex items-center justify-between p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl text-xs">
            <span className="text-slate-400">Total Liquidation Value</span>
            <span className="text-lg font-bebas tracking-wider text-cyan-400">
              ${plan.totalLiquidationValue.toLocaleString()}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package size={32} className="text-slate-600 mb-3" />
          <p className="text-sm text-slate-400">No cards available to liquidate</p>
          <p className="text-xs text-slate-600 mt-1">Add cards to your portfolio first</p>
        </div>
      )}
    </div>
  );
};

// ─── Main Modal ─────────────────────────────────────────────────────────────

export const LiquidityModal: React.FC<LiquidityModalProps> = ({
  isOpen,
  onClose,
  cards,
  selectedCardId,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('card');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-brand-slate border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-400">
              <Droplets size={22} />
            </div>
            <div>
              <h2 className="text-3xl font-bebas tracking-widest text-white leading-tight">
                Liquidity <span className="text-cyan-400">Intelligence</span>
              </h2>
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
                Market depth, exit velocity & liquidation planning
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 pb-2 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'card' && <CardAnalysisTab cards={cards} selectedCardId={selectedCardId} />}
          {activeTab === 'portfolio' && <PortfolioTab cards={cards} />}
          {activeTab === 'seasonal' && <SeasonalTab />}
          {activeTab === 'opportunities' && <OpportunitiesTab cards={cards} />}
          {activeTab === 'emergency' && <EmergencyTab cards={cards} />}
        </div>
      </div>
    </div>
  );
};

export default LiquidityModal;
