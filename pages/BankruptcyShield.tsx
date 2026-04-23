// @ts-nocheck
import React, { useState, useMemo, useRef } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  DollarSign,
  TrendingDown,
  Clock,
  ArrowDown,
  Printer,
  ChevronRight,
  Layers,
  BarChart3,
  Target,
  Zap,
  FileText,
  Info,
  ArrowUpDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Line,
  Area,
} from 'recharts';
import {
  generateLiquidationPlan,
  getFireSaleValues,
  renderCashOutPlanHTML,
  optimizeLiquidationOrder,
  calculateRecovery,
  generateEmergencyCashOut,
  getWaterfallData,
  getCategoryBreakdown,
  getPortfolioAssets,
  LIQUIDITY_TIERS,
} from '../lib/utils/bankruptcyShieldService';
import type {
  LiquidationAsset,
  LiquidationPlan,
  RecoveryScenario,
  CashOutPlan,
  LiquidityTierLevel,
} from '../lib/utils/bankruptcyShieldService';

// ─── Constants ────────────────────────────────────────────────────────────────

type TabKey = 'dashboard' | 'planner' | 'firesale' | 'recovery' | 'cashout';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'dashboard', label: 'Emergency Dashboard', icon: <ShieldAlert size={16} /> },
  { key: 'planner', label: 'Liquidation Planner', icon: <Layers size={16} /> },
  { key: 'firesale', label: 'Fire-Sale Analysis', icon: <TrendingDown size={16} /> },
  { key: 'recovery', label: 'Recovery Optimizer', icon: <Target size={16} /> },
  { key: 'cashout', label: 'Cash-Out Generator', icon: <FileText size={16} /> },
];

const URGENCY_OPTIONS: { value: 'immediate' | 'week' | 'month'; label: string; color: string }[] = [
  { value: 'immediate', label: '24 Hours', color: 'text-red-400' },
  { value: 'week', label: '7 Days', color: 'text-yellow-400' },
  { value: 'month', label: '30 Days', color: 'text-lime-400' },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function tierBadgeColor(tier: LiquidityTierLevel): string {
  switch (tier) {
    case 1: return 'bg-lime-500/20 text-lime-400 border-lime-500/30';
    case 2: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 3: return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 4: return 'bg-red-500/20 text-red-400 border-red-500/30';
  }
}

function riskBadge(risk: string): string {
  switch (risk) {
    case 'low': return 'bg-lime-500/20 text-lime-400';
    case 'medium': return 'bg-yellow-500/20 text-yellow-400';
    case 'high': return 'bg-red-500/20 text-red-400';
    default: return 'bg-slate-500/20 text-slate-400';
  }
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function StatCard({ label, value, subtitle, icon, accent = false }: {
  label: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-xl p-5 ${accent ? 'bg-lime-500/10 border border-lime-500/20' : 'bg-slate-800 border border-slate-700/50'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-400">{label}</span>
        <span className={accent ? 'text-lime-400' : 'text-slate-500'}>{icon}</span>
      </div>
      <div className={`text-2xl font-bold ${accent ? 'text-lime-400' : 'text-slate-100'}`}>{value}</div>
      {subtitle && <div className="text-xs text-slate-500 mt-1">{subtitle}</div>}
    </div>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────

function EmergencyDashboard({ plan }: { plan: LiquidationPlan }) {
  const waterfallData = useMemo(() => getWaterfallData(), []);
  const categoryData = useMemo(() => getCategoryBreakdown(), []);

  const lossAt24hr = plan.totalPortfolioValue - plan.totalFireSale24hr;
  const lossAt7d = plan.totalPortfolioValue - plan.totalFireSale7d;
  const lossAt30d = plan.totalPortfolioValue - plan.totalFireSale30d;

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 flex items-start gap-3">
        <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <h3 className="text-red-400 font-semibold text-sm">Emergency Liquidation Analysis</h3>
          <p className="text-slate-400 text-sm mt-1">
            This dashboard shows worst-case liquidation values for your portfolio across different time pressures.
            Values assume distressed selling conditions with maximum market impact.
          </p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Portfolio Market Value"
          value={formatCurrency(plan.totalPortfolioValue)}
          subtitle={`${plan.orderedAssets.length} graded cards`}
          icon={<DollarSign size={18} />}
          accent
        />
        <StatCard
          label="24-Hour Fire Sale"
          value={formatCurrency(plan.totalFireSale24hr)}
          subtitle={`Loss: ${formatCurrency(lossAt24hr)} (${Math.round((lossAt24hr / plan.totalPortfolioValue) * 100)}%)`}
          icon={<Zap size={18} />}
        />
        <StatCard
          label="7-Day Liquidation"
          value={formatCurrency(plan.totalFireSale7d)}
          subtitle={`Loss: ${formatCurrency(lossAt7d)} (${Math.round((lossAt7d / plan.totalPortfolioValue) * 100)}%)`}
          icon={<Clock size={18} />}
        />
        <StatCard
          label="30-Day Orderly Sale"
          value={formatCurrency(plan.totalFireSale30d)}
          subtitle={`Loss: ${formatCurrency(lossAt30d)} (${Math.round((lossAt30d / plan.totalPortfolioValue) * 100)}%)`}
          icon={<TrendingDown size={18} />}
        />
      </div>

      {/* Waterfall Chart */}
      <div className="rounded-xl bg-slate-800 border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-1">Value Erosion Waterfall</h3>
        <p className="text-sm text-slate-400 mb-4">Portfolio value under increasing liquidation pressure</p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={waterfallData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.75rem' }}
                labelStyle={{ color: '#e2e8f0' }}
                formatter={(value: number) => [formatCurrency(value), 'Value']}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {waterfallData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="rounded-xl bg-slate-800 border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-1">Category Breakdown</h3>
        <p className="text-sm text-slate-400 mb-4">Market value vs 7-day fire-sale value by sport</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.75rem' }}
                labelStyle={{ color: '#e2e8f0' }}
                formatter={(value: number) => [formatCurrency(value)]}
              />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              <Bar dataKey="marketValue" name="Market Value" fill="#84cc16" radius={[4, 4, 0, 0]} />
              <Bar dataKey="fireSale7d" name="7-Day Fire Sale" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Liquidity Tier Distribution */}
      <div className="rounded-xl bg-slate-800 border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Liquidity Tier Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {LIQUIDITY_TIERS.map((tier) => {
            const tierAssets = plan.orderedAssets.filter((a) => a.liquidityTier === tier.level);
            const tierValue = tierAssets.reduce((sum, a) => sum + a.marketValue, 0);
            return (
              <div
                key={tier.level}
                className="rounded-lg bg-slate-900 border border-slate-700/50 p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${tierBadgeColor(tier.level)}`}>
                    Tier {tier.level}
                  </span>
                  <span className="text-sm font-medium text-slate-200">{tier.name}</span>
                </div>
                <p className="text-xs text-slate-500 mb-3">{tier.description}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">{tierAssets.length} cards</span>
                  <span className="text-slate-200 font-medium">{formatCurrency(tierValue)}</span>
                </div>
                <div className="mt-2 w-full bg-slate-700 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-lime-500"
                    style={{ width: `${plan.totalPortfolioValue > 0 ? (tierValue / plan.totalPortfolioValue) * 100 : 0}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Liquidation Planner Tab ──────────────────────────────────────────────────

function LiquidationPlanner({ urgency }: { urgency: 'immediate' | 'week' | 'month' }) {
  const orderedAssets = useMemo(() => optimizeLiquidationOrder(urgency), [urgency]);

  const timeframeMap: Record<string, '24hr' | '7d' | '30d'> = {
    immediate: '24hr',
    week: '7d',
    month: '30d',
  };
  const tf = timeframeMap[urgency];

  let cumulative = 0;

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-slate-800 border border-slate-700/50 p-4 flex items-start gap-3">
        <Info className="text-lime-400 flex-shrink-0 mt-0.5" size={18} />
        <p className="text-sm text-slate-400">
          Assets are ordered by optimal liquidation sequence. Sell high-liquidity cards first to maximize
          early cash recovery and minimize market impact on remaining holdings.
        </p>
      </div>

      <div className="rounded-xl bg-slate-800 border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-4 py-3 text-slate-400 font-medium">#</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Card</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Tier</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">Market Value</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">Fire Sale</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">Recovery %</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Channel</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">Cumulative</th>
              </tr>
            </thead>
            <tbody>
              {orderedAssets.map((asset, index) => {
                const fsv = asset.fireSaleValues.find((f) => f.timeframe === tf)!;
                cumulative += fsv.value;
                return (
                  <tr
                    key={asset.id}
                    className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-500 font-mono">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="text-slate-100 font-medium">{asset.playerName}</div>
                      <div className="text-xs text-slate-500">
                        {asset.cardYear} {asset.cardSet} {asset.grade}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${tierBadgeColor(asset.liquidityTier)}`}>
                        T{asset.liquidityTier}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-200 font-mono">
                      {formatCurrency(asset.marketValue)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      <span className="text-orange-400">{formatCurrency(fsv.value)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-mono ${fsv.recoveryRatio >= 0.85 ? 'text-lime-400' : fsv.recoveryRatio >= 0.75 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {Math.round(fsv.recoveryRatio * 100)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{asset.optimalChannel}</td>
                    <td className="px-4 py-3 text-right text-lime-400 font-mono text-xs">
                      {formatCurrency(cumulative)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Fire-Sale Analysis Tab ───────────────────────────────────────────────────

function FireSaleAnalysis() {
  const { totalMarketValue, totals, assets } = useMemo(() => getFireSaleValues(), []);

  const chartData = useMemo(() => {
    return assets.map((a) => ({
      name: a.playerName.split(' ').pop(),
      market: a.marketValue,
      '24hr': a.fireSaleValues.find((f) => f.timeframe === '24hr')?.value ?? 0,
      '7d': a.fireSaleValues.find((f) => f.timeframe === '7d')?.value ?? 0,
      '30d': a.fireSaleValues.find((f) => f.timeframe === '30d')?.value ?? 0,
    }));
  }, [assets]);

  const topLosers = useMemo(() => {
    return [...assets]
      .sort((a, b) => {
        const aLoss = a.marketValue - (a.fireSaleValues.find((f) => f.timeframe === '24hr')?.value ?? 0);
        const bLoss = b.marketValue - (b.fireSaleValues.find((f) => f.timeframe === '24hr')?.value ?? 0);
        return bLoss - aLoss;
      })
      .slice(0, 5);
  }, [assets]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-lime-500/10 border border-lime-500/20 p-4">
          <div className="text-sm text-slate-400 mb-1">Market Value</div>
          <div className="text-xl font-bold text-lime-400">{formatCurrency(totalMarketValue)}</div>
        </div>
        {totals.map((t) => (
          <div key={t.timeframe} className="rounded-xl bg-slate-800 border border-slate-700/50 p-4">
            <div className="text-sm text-slate-400 mb-1">{t.label} Value</div>
            <div className="text-xl font-bold text-slate-100">{formatCurrency(t.totalValue)}</div>
            <div className="text-xs text-red-400 mt-1">-{t.discountPercent}% discount</div>
          </div>
        ))}
      </div>

      {/* Bar Chart Comparison */}
      <div className="rounded-xl bg-slate-800 border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-1">Fire-Sale Value Comparison</h3>
        <p className="text-sm text-slate-400 mb-4">Per-card value at different urgency levels</p>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                angle={-35}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.75rem' }}
                labelStyle={{ color: '#e2e8f0' }}
                formatter={(value: number, name: string) => [formatCurrency(value), name === 'market' ? 'Market' : name]}
              />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              <Bar dataKey="market" name="Market" fill="#84cc16" radius={[2, 2, 0, 0]} />
              <Bar dataKey="30d" name="30-Day" fill="#a3e635" radius={[2, 2, 0, 0]} />
              <Bar dataKey="7d" name="7-Day" fill="#facc15" radius={[2, 2, 0, 0]} />
              <Bar dataKey="24hr" name="24-Hour" fill="#ef4444" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Value-at-Risk */}
      <div className="rounded-xl bg-slate-800 border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Highest Value-at-Risk (24hr)</h3>
        <div className="space-y-3">
          {topLosers.map((asset) => {
            const fsv24 = asset.fireSaleValues.find((f) => f.timeframe === '24hr')!;
            const loss = asset.marketValue - fsv24.value;
            const pct = Math.round((loss / asset.marketValue) * 100);
            return (
              <div
                key={asset.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-700/50"
              >
                <div>
                  <span className="text-slate-100 font-medium">{asset.playerName}</span>
                  <span className="text-xs text-slate-500 ml-2">{asset.cardYear} {asset.cardSet}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-400 text-sm">{formatCurrency(asset.marketValue)}</span>
                  <ArrowDown size={14} className="text-red-400" />
                  <span className="text-red-400 font-mono font-medium">{formatCurrency(fsv24.value)}</span>
                  <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded">-{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Table */}
      <div className="rounded-xl bg-slate-800 border border-slate-700/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-slate-100">Full Fire-Sale Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Card</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">Market</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">24hr</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">7-Day</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">30-Day</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">Liquidity</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">Demand</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => {
                const fsv24 = asset.fireSaleValues.find((f) => f.timeframe === '24hr')!;
                const fsv7 = asset.fireSaleValues.find((f) => f.timeframe === '7d')!;
                const fsv30 = asset.fireSaleValues.find((f) => f.timeframe === '30d')!;
                return (
                  <tr key={asset.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-slate-100">{asset.playerName}</div>
                      <div className="text-xs text-slate-500">{asset.cardYear} {asset.cardSet} {asset.grade}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-200">{formatCurrency(asset.marketValue)}</td>
                    <td className="px-4 py-3 text-right font-mono text-red-400">{formatCurrency(fsv24.value)}</td>
                    <td className="px-4 py-3 text-right font-mono text-yellow-400">{formatCurrency(fsv7.value)}</td>
                    <td className="px-4 py-3 text-right font-mono text-lime-400">{formatCurrency(fsv30.value)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-slate-700 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full bg-lime-500" style={{ width: `${asset.liquidityScore}%` }} />
                        </div>
                        <span className="text-xs text-slate-400 font-mono w-8">{asset.liquidityScore}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400 font-mono text-xs">{asset.demandIndex}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Recovery Optimizer Tab ───────────────────────────────────────────────────

function RecoveryOptimizer() {
  const scenarios = useMemo(() => calculateRecovery(), []);
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null);

  const chartData = useMemo(() => {
    return scenarios.map((s) => ({
      name: s.strategy.length > 18 ? s.strategy.substring(0, 18) + '...' : s.strategy,
      fullName: s.strategy,
      recovery: s.recoveryPercent,
      timeline: s.timelineDays,
      netProceeds: s.netProceeds,
      fees: s.fees,
    }));
  }, [scenarios]);

  const radarData = useMemo(() => {
    return scenarios.map((s) => ({
      strategy: s.strategy.split(' ')[0],
      recovery: s.recoveryPercent,
      speed: Math.max(0, 100 - s.timelineDays * 1.5),
      risk: s.riskLevel === 'low' ? 90 : s.riskLevel === 'medium' ? 60 : 30,
      netReturn: Math.round((s.netProceeds / s.estimatedRecovery) * 100),
    }));
  }, [scenarios]);

  return (
    <div className="space-y-6">
      {/* Recovery Comparison Chart */}
      <div className="rounded-xl bg-slate-800 border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-1">Strategy Comparison</h3>
        <p className="text-sm text-slate-400 mb-4">Net proceeds and fees by selling strategy</p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.75rem' }}
                labelStyle={{ color: '#e2e8f0' }}
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
              />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              <Bar dataKey="netProceeds" name="Net Proceeds" fill="#84cc16" radius={[4, 4, 0, 0]} />
              <Bar dataKey="fees" name="Fees" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="netProceeds" name="Net (Line)" stroke="#a3e635" strokeWidth={2} dot={false} legendType="none" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="rounded-xl bg-slate-800 border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-1">Multi-Factor Analysis</h3>
        <p className="text-sm text-slate-400 mb-4">Recovery, speed, risk, and net return for each strategy</p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="strategy" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <PolarRadiusAxis tick={{ fill: '#64748b', fontSize: 10 }} domain={[0, 100]} />
              <Radar name="Recovery %" dataKey="recovery" stroke="#84cc16" fill="#84cc16" fillOpacity={0.15} />
              <Radar name="Speed" dataKey="speed" stroke="#facc15" fill="#facc15" fillOpacity={0.1} />
              <Radar name="Safety" dataKey="risk" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.1} />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.75rem' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strategy Cards */}
      <div className="space-y-4">
        {scenarios.map((scenario) => (
          <div
            key={scenario.strategy}
            className={`rounded-xl border transition-colors ${
              scenario.strategy.includes('Recommended')
                ? 'bg-lime-500/5 border-lime-500/20'
                : 'bg-slate-800 border-slate-700/50'
            }`}
          >
            <button
              className="w-full flex items-center justify-between p-5 text-left"
              onClick={() =>
                setExpandedStrategy(expandedStrategy === scenario.strategy ? null : scenario.strategy)
              }
            >
              <div className="flex items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-slate-100 font-semibold">{scenario.strategy}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded ${riskBadge(scenario.riskLevel)}`}>
                      {scenario.riskLevel} risk
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{scenario.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 flex-shrink-0">
                <div className="text-right">
                  <div className="text-lg font-bold text-lime-400">{formatCurrency(scenario.netProceeds)}</div>
                  <div className="text-xs text-slate-500">{scenario.recoveryPercent}% recovery | {scenario.timelineDays}d</div>
                </div>
                <ChevronRight
                  size={18}
                  className={`text-slate-500 transition-transform ${
                    expandedStrategy === scenario.strategy ? 'rotate-90' : ''
                  }`}
                />
              </div>
            </button>
            {expandedStrategy === scenario.strategy && (
              <div className="px-5 pb-5 border-t border-slate-700/50 pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="rounded-lg bg-slate-900 p-3">
                    <div className="text-xs text-slate-500">Gross Recovery</div>
                    <div className="text-slate-100 font-semibold">{formatCurrency(scenario.estimatedRecovery)}</div>
                  </div>
                  <div className="rounded-lg bg-slate-900 p-3">
                    <div className="text-xs text-slate-500">Platform Fees</div>
                    <div className="text-red-400 font-semibold">{formatCurrency(scenario.fees)}</div>
                  </div>
                  <div className="rounded-lg bg-slate-900 p-3">
                    <div className="text-xs text-slate-500">Net Proceeds</div>
                    <div className="text-lime-400 font-semibold">{formatCurrency(scenario.netProceeds)}</div>
                  </div>
                  <div className="rounded-lg bg-slate-900 p-3">
                    <div className="text-xs text-slate-500">Timeline</div>
                    <div className="text-slate-100 font-semibold">{scenario.timelineDays} days</div>
                  </div>
                </div>
                <h5 className="text-sm font-medium text-slate-300 mb-2">Execution Steps</h5>
                <ol className="space-y-2">
                  {scenario.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-300">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Cash-Out Generator Tab ──────────────────────────────────────────────────

function CashOutGenerator({ urgency }: { urgency: 'immediate' | 'week' | 'month' }) {
  const plan = useMemo(() => generateEmergencyCashOut(urgency), [urgency]);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const bodyHtml = renderCashOutPlanHTML(plan);
      printWindow.document.write(`
          <html><head><title>Cash-Out Plan</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 2rem; color: #1e293b; }
            table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
            th, td { padding: 8px 12px; border: 1px solid #cbd5e1; text-align: left; font-size: 13px; }
            th { background: #f1f5f9; font-weight: 600; }
            tr.notes td { font-size: 12px; color: #475569; border-top: none; padding-top: 0; }
            .meta { color: #64748b; font-size: 13px; }
            .total { margin-top: 1rem; font-weight: 600; }
          </style></head><body>
          ${bodyHtml}
          </body></html>
        `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const cumulativeChartData = useMemo(() => {
    return plan.steps.map((step) => ({
      step: step.order,
      name: step.asset.playerName.split(' ').pop(),
      proceeds: step.expectedProceeds,
      cumulative: step.cumulativeRecovery,
    }));
  }, [plan]);

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">
            Emergency Cash-Out Plan
          </h3>
          <p className="text-sm text-slate-400">
            Generated {new Date(plan.generatedAt).toLocaleString()} | Urgency:{' '}
            <span className={urgency === 'immediate' ? 'text-red-400' : urgency === 'week' ? 'text-yellow-400' : 'text-lime-400'}>
              {urgency === 'immediate' ? '24 Hours' : urgency === 'week' ? '7 Days' : '30 Days'}
            </span>
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-lime-500/20 text-lime-400 hover:bg-lime-500/30 transition-colors text-sm font-medium"
        >
          <Printer size={16} />
          Print Plan
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Assets"
          value={plan.summary.totalAssets.toString()}
          icon={<Layers size={18} />}
        />
        <StatCard
          label="Market Value"
          value={formatCurrency(plan.summary.totalMarketValue)}
          icon={<DollarSign size={18} />}
        />
        <StatCard
          label="Expected Recovery"
          value={formatCurrency(plan.summary.totalExpectedRecovery)}
          subtitle={`${plan.summary.recoveryPercent}% of market`}
          icon={<Target size={18} />}
          accent
        />
        <StatCard
          label="Avg Discount"
          value={`${plan.summary.averageDiscountPercent}%`}
          subtitle={`${plan.summary.estimatedCompletionDays}-day timeline`}
          icon={<ArrowUpDown size={18} />}
        />
      </div>

      {/* Cumulative Recovery Chart */}
      <div className="rounded-xl bg-slate-800 border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-1">Cumulative Recovery</h3>
        <p className="text-sm text-slate-400 mb-4">Running total as each card is sold in optimal order</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={cumulativeChartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.75rem' }}
                labelStyle={{ color: '#e2e8f0' }}
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === 'proceeds' ? 'Card Proceeds' : 'Cumulative',
                ]}
              />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              <Bar dataKey="proceeds" name="Card Proceeds" fill="#84cc16" radius={[4, 4, 0, 0]} opacity={0.6} />
              <Area type="monotone" dataKey="cumulative" name="Cumulative" stroke="#a3e635" fill="#84cc16" fillOpacity={0.1} strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Printable Plan */}
      <div ref={printRef}>
        <div className="rounded-xl bg-slate-800 border border-slate-700/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-100">Step-by-Step Liquidation Instructions</h3>
            <div className="text-sm text-slate-400">
              Best Recovery: <span className="text-lime-400">{plan.summary.highestRecoveryAsset}</span>
              {' | '}Worst: <span className="text-red-400">{plan.summary.lowestRecoveryAsset}</span>
            </div>
          </div>
          <div className="divide-y divide-slate-700/50">
            {plan.steps.map((step) => (
              <div key={step.order} className="p-4 hover:bg-slate-700/20 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-lime-500/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-lime-400">{step.order}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h4 className="text-slate-100 font-medium">{step.action}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded border ${tierBadgeColor(step.asset.liquidityTier)}`}>
                            Tier {step.asset.liquidityTier}
                          </span>
                          <span className="text-xs text-slate-500">via {step.channel}</span>
                          <span className="text-xs text-slate-500">~{step.estimatedDays}d to sell</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lime-400 font-mono font-semibold">{formatCurrency(step.expectedProceeds)}</div>
                        <div className="text-xs text-slate-500">
                          Running: {formatCurrency(step.cumulativeRecovery)}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 mt-2">{step.notes}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-slate-700 bg-slate-900/50">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Total Expected Recovery</span>
              <div className="text-right">
                <span className="text-xl font-bold text-lime-400">{formatCurrency(plan.summary.totalExpectedRecovery)}</span>
                <span className="text-sm text-slate-500 ml-2">
                  ({plan.summary.recoveryPercent}% of {formatCurrency(plan.summary.totalMarketValue)} market value)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

const BankruptcyShield: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [urgency, setUrgency] = useState<'immediate' | 'week' | 'month'>('week');

  const plan = useMemo(() => generateLiquidationPlan(urgency), [urgency]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
              <ShieldAlert className="text-red-400" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Collection Bankruptcy Shield</h1>
              <p className="text-sm text-slate-400">
                Worst-case liquidation planner and emergency cash-out strategy
              </p>
            </div>
          </div>

          {/* Urgency Selector */}
          <div className="flex items-center gap-2 bg-slate-800 rounded-xl p-1 border border-slate-700/50">
            {URGENCY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setUrgency(opt.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  urgency === opt.value
                    ? 'bg-slate-700 text-slate-100'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className={urgency === opt.value ? opt.color : ''}>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1 bg-slate-800/50 rounded-xl p-1 border border-slate-700/50">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'bg-lime-500/20 text-lime-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'dashboard' && <EmergencyDashboard plan={plan} />}
          {activeTab === 'planner' && <LiquidationPlanner urgency={urgency} />}
          {activeTab === 'firesale' && <FireSaleAnalysis />}
          {activeTab === 'recovery' && <RecoveryOptimizer />}
          {activeTab === 'cashout' && <CashOutGenerator urgency={urgency} />}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
          <p className="text-xs text-slate-500">
            Bankruptcy Shield values are estimates based on current market conditions and historical liquidation data.
            Actual recovery may vary based on market volatility, buyer demand, and execution timing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BankruptcyShield;
