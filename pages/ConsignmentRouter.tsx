// Consignment Router Page — full-page platform recommendation engine
// Route: /consignment-router | Icon: Route
import React, { useState, useMemo } from 'react';
import {
  Route,
  DollarSign,
  Clock,
  Users,
  TrendingUp,
  Award,
  Percent,
  BarChart3,
  Shield,
  Zap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { getConsignmentOptions, ConsignmentOption } from '../lib/trading/consignmentRouterService';

// ── Helpers ─────────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function formatCurrencyExact(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPercent(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function formatBuyerPool(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

const PLATFORM_COLORS: Record<string, string> = {
  ebay: '#3b82f6',
  pwcc: '#10b981',
  heritage: '#a855f7',
  myslabs: '#f43f5e',
  goldin: '#f59e0b',
  comc: '#06b6d4',
};

const PLATFORM_TEXT_COLORS: Record<string, string> = {
  ebay: 'text-blue-400',
  pwcc: 'text-emerald-400',
  heritage: 'text-purple-400',
  myslabs: 'text-rose-400',
  goldin: 'text-amber-400',
  comc: 'text-cyan-400',
};

const TIER_BADGE: Record<string, { label: string; cls: string }> = {
  premium: { label: 'PREMIUM', cls: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  mid: { label: 'MID-TIER', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  budget: { label: 'BUDGET', cls: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
};

const PRESET_VALUES = [100, 250, 500, 1000, 2500, 5000, 10000, 25000];

// ── Score Badge ─────────────────────────────────────────────────────────────────

const ScoreBadge: React.FC<{ score: number; size?: 'sm' | 'lg' }> = ({ score, size = 'sm' }) => {
  const color = score >= 70 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    : score >= 50 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    : 'bg-red-500/20 text-red-400 border-red-500/30';
  const sizeClass = size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs';
  return (
    <span className={`inline-flex items-center font-bold rounded border ${color} ${sizeClass}`}>
      {score}
    </span>
  );
};

// ── Recommendation Card ─────────────────────────────────────────────────────────

const RecommendationCard: React.FC<{ option: ConsignmentOption; rank: number }> = ({ option, rank }) => {
  const [expanded, setExpanded] = useState(rank === 0);
  const opt = option;
  const tierBadge = TIER_BADGE[opt.platform.tier] ?? TIER_BADGE.mid;
  const feePercent = opt.fees.total / opt.estimatedSalePrice;

  return (
    <div className={`bg-slate-900 rounded-xl border transition-all ${
      rank === 0 ? 'border-lime-500/40 shadow-lg shadow-lime-500/5' : 'border-slate-700/50 hover:border-slate-600'
    }`}>
      {/* Card header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
            rank === 0 ? 'bg-lime-500/20 text-lime-400' : 'bg-slate-800 text-slate-400'
          }`}>
            #{rank + 1}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${PLATFORM_TEXT_COLORS[opt.platform.id] ?? 'text-white'}`}>
                {opt.platform.name}
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${tierBadge.cls}`}>
                {tierBadge.label}
              </span>
              {rank === 0 && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border bg-lime-500/20 text-lime-400 border-lime-500/30">
                  RECOMMENDED
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">{opt.reasoning}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-bold text-emerald-400">{formatCurrency(opt.netProceeds)}</p>
            <p className="text-[10px] text-slate-500">net proceeds</p>
          </div>
          <ScoreBadge score={opt.recommendationScore} />
          {expanded
            ? <ChevronUp size={14} className="text-slate-400" />
            : <ChevronDown size={14} className="text-slate-400" />}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-700/30">
          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <DollarSign size={12} className="text-slate-400" />
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Est. Sale</span>
              </div>
              <p className="text-sm font-bold text-white">{formatCurrency(opt.estimatedSalePrice)}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Percent size={12} className="text-red-400" />
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Total Fees</span>
              </div>
              <p className="text-sm font-bold text-red-400">{formatCurrencyExact(opt.fees.total)}</p>
              <p className="text-[10px] text-slate-600">{formatPercent(feePercent)} of sale</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp size={12} className="text-blue-400" />
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Sell-Through</span>
              </div>
              <p className="text-sm font-bold text-blue-400">{formatPercent(opt.sellThroughRate)}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock size={12} className="text-amber-400" />
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Avg Days</span>
              </div>
              <p className="text-sm font-bold text-amber-400">{opt.avgDaysToSell}d</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Users size={12} className="text-purple-400" />
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Buyer Pool</span>
              </div>
              <p className="text-sm font-bold text-purple-400">{formatBuyerPool(opt.buyerPoolSize)}</p>
            </div>
          </div>

          {/* Fee breakdown */}
          <div className="mt-4 bg-slate-800/30 rounded-lg p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-2">Fee Breakdown</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Seller Fee</span>
                <span className="text-red-400 font-mono">{formatCurrencyExact(opt.fees.sellerFee)}</span>
              </div>
              {opt.fees.buyersPremium > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Buyer Premium</span>
                  <span className="text-amber-400 font-mono">{formatCurrencyExact(opt.fees.buyersPremium)}</span>
                </div>
              )}
              {opt.fees.fixedFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Fixed Fee</span>
                  <span className="text-red-400 font-mono">{formatCurrencyExact(opt.fees.fixedFee)}</span>
                </div>
              )}
              {opt.fees.shipping > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Shipping</span>
                  <span className="text-red-400 font-mono">{formatCurrencyExact(opt.fees.shipping)}</span>
                </div>
              )}
              {opt.fees.insurance > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Insurance</span>
                  <span className="text-red-400 font-mono">{formatCurrencyExact(opt.fees.insurance)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Specialties */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Specialties:</span>
            {opt.platform.specialties.map((s) => (
              <span key={s} className="text-[10px] px-2 py-0.5 bg-slate-800/50 text-slate-300 rounded-full border border-slate-700/50">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Page ───────────────────────────────────────────────────────────────────

const ConsignmentRouter: React.FC = () => {
  const [cardValue, setCardValue] = useState(1000);
  const [cardDescription, setCardDescription] = useState('');

  const options = useMemo(() => getConsignmentOptions(cardDescription || 'Card', cardValue), [cardValue, cardDescription]);
  const best = options[0] ?? null;

  // Chart data
  const netProceedsChart = useMemo(
    () => options.map(o => ({
      name: o.platform.name.split(' ')[0],
      netProceeds: Math.round(o.netProceeds),
      fees: Math.round(o.fees.total),
      platformId: o.platform.id,
    })),
    [options],
  );

  const sellThroughChart = useMemo(
    () => options.map(o => ({
      name: o.platform.name.split(' ')[0],
      sellThrough: Math.round(o.sellThroughRate * 100),
      platformId: o.platform.id,
    })),
    [options],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-lime-500/20">
          <Route size={24} className="text-lime-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Consignment Router &mdash; Platform Recommendation Engine
          </h1>
          <p className="text-sm text-slate-400">
            Find the best platform to sell each card based on value, fees, buyer pool, and sell-through rates
          </p>
        </div>
      </div>

      <div
        role="status"
        className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90"
      >
        <strong className="text-amber-200">Illustrative data: </strong>
        Platform fees, scores, and sell-through rates are demo models for comparison—not live PWCC, Goldin,
        Heritage, or eBay terms. Confirm all pricing and submission rules with the venue before consigning.
      </div>

      {/* Input section */}
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-4">
        <div className="flex flex-wrap items-end gap-4">
          {/* Card description */}
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-slate-400 font-medium mb-1 block">Card Description (optional)</label>
            <input
              type="text"
              value={cardDescription}
              onChange={(e) => setCardDescription(e.target.value)}
              placeholder="e.g., 2020 Prizm Justin Herbert PSA 10"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-lime-500/50"
            />
          </div>

          {/* Value input */}
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">Estimated Value</label>
            <div className="relative">
              <DollarSign size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="number"
                value={cardValue}
                onChange={(e) => setCardValue(Math.max(0, Number(e.target.value)))}
                className="bg-slate-800 border border-slate-700 rounded-lg pl-7 pr-3 py-2 text-sm text-white w-36 focus:outline-none focus:border-lime-500/50"
              />
            </div>
          </div>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {PRESET_VALUES.map((val) => (
            <button
              key={val}
              onClick={() => setCardValue(val)}
              className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors ${
                cardValue === val
                  ? 'bg-lime-500/20 text-lime-400 border-lime-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600 hover:text-slate-300'
              }`}
            >
              ${val.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Top recommendation banner */}
      {best && (
        <div className="bg-gradient-to-r from-lime-500/10 via-slate-900 to-slate-900 border border-lime-500/30 rounded-2xl p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Award size={20} className="text-lime-400" />
              <div>
                <p className="text-xs text-lime-400 font-semibold uppercase tracking-wider">Top Recommendation</p>
                <p className="text-lg font-bold text-white">{best.platform.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{best.reasoning}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xl font-bold text-emerald-400">{formatCurrency(best.netProceeds)}</p>
                <p className="text-[10px] text-slate-500">Net Proceeds</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-blue-400">{formatPercent(best.sellThroughRate)}</p>
                <p className="text-[10px] text-slate-500">Sell-Through</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-amber-400">{best.avgDaysToSell}d</p>
                <p className="text-[10px] text-slate-500">Avg Time</p>
              </div>
              <ScoreBadge score={best.recommendationScore} size="lg" />
            </div>
          </div>
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Net proceeds chart */}
        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-lime-400" />
            <h3 className="text-sm font-semibold text-slate-200">Net Proceeds by Platform</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={netProceedsChart} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v: number) => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  labelStyle={{ color: '#e2e8f0' }}
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name === 'netProceeds' ? 'Net Proceeds' : 'Total Fees',
                  ]}
                />
                <Bar dataKey="netProceeds" radius={[4, 4, 0, 0]}>
                  {netProceedsChart.map((entry) => (
                    <Cell key={entry.platformId} fill={PLATFORM_COLORS[entry.platformId] ?? '#84cc16'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sell-through rate chart */}
        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-blue-400" />
            <h3 className="text-sm font-semibold text-slate-200">Sell-Through Rate (%)</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sellThroughChart} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  labelStyle={{ color: '#e2e8f0' }}
                  formatter={(value: number) => [`${value}%`, 'Sell-Through Rate']}
                />
                <Bar dataKey="sellThrough" radius={[4, 4, 0, 0]}>
                  {sellThroughChart.map((entry) => (
                    <Cell key={entry.platformId} fill={PLATFORM_COLORS[entry.platformId] ?? '#84cc16'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Platform recommendation cards */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} className="text-lime-400" />
          <h3 className="text-sm font-semibold text-slate-200">Platform Rankings</h3>
          <span className="text-[10px] text-slate-500 ml-auto">{options.length} platforms evaluated</span>
        </div>
        <div className="space-y-3">
          {options.map((opt, i) => (
            <RecommendationCard key={opt.platform.id} option={opt} rank={i} />
          ))}
        </div>
      </div>

      {/* Quick comparison table */}
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} className="text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-200">Quick Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left px-3 py-2.5 text-slate-400 font-medium">Platform</th>
                <th className="text-right px-3 py-2.5 text-slate-400 font-medium">Seller Fee</th>
                <th className="text-right px-3 py-2.5 text-slate-400 font-medium">Buyer Premium</th>
                <th className="text-right px-3 py-2.5 text-slate-400 font-medium">Est. Sale</th>
                <th className="text-right px-3 py-2.5 text-slate-400 font-medium">Total Fees</th>
                <th className="text-right px-3 py-2.5 text-slate-400 font-medium">Net Proceeds</th>
                <th className="text-right px-3 py-2.5 text-slate-400 font-medium">STR</th>
                <th className="text-right px-3 py-2.5 text-slate-400 font-medium">Avg Days</th>
                <th className="text-right px-3 py-2.5 text-slate-400 font-medium">Buyers</th>
                <th className="text-right px-3 py-2.5 text-slate-400 font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {options.map((opt, i) => (
                <tr
                  key={opt.platform.id}
                  className={`border-b border-slate-700/30 hover:bg-slate-800/50 transition-colors ${i === 0 ? 'bg-lime-500/5' : ''}`}
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      {i === 0 && <Award size={12} className="text-lime-400" />}
                      <span className={`font-semibold ${PLATFORM_TEXT_COLORS[opt.platform.id] ?? 'text-white'}`}>
                        {opt.platform.name}
                      </span>
                    </div>
                  </td>
                  <td className="text-right px-3 py-2.5 text-slate-300">{formatPercent(opt.platform.sellerFeeRate)}</td>
                  <td className="text-right px-3 py-2.5 text-slate-300">
                    {opt.platform.buyersPremium > 0 ? formatPercent(opt.platform.buyersPremium) : '—'}
                  </td>
                  <td className="text-right px-3 py-2.5 text-slate-300 font-mono">{formatCurrency(opt.estimatedSalePrice)}</td>
                  <td className="text-right px-3 py-2.5 text-red-400 font-mono">{formatCurrencyExact(opt.fees.total)}</td>
                  <td className="text-right px-3 py-2.5 text-emerald-400 font-bold font-mono">{formatCurrency(opt.netProceeds)}</td>
                  <td className="text-right px-3 py-2.5 text-slate-300">{formatPercent(opt.sellThroughRate)}</td>
                  <td className="text-right px-3 py-2.5 text-slate-300">{opt.avgDaysToSell}d</td>
                  <td className="text-right px-3 py-2.5 text-slate-300">{formatBuyerPool(opt.buyerPoolSize)}</td>
                  <td className="text-right px-3 py-2.5"><ScoreBadge score={opt.recommendationScore} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ConsignmentRouter;
