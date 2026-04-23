// @ts-nocheck
import React, { useEffect, useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  getYieldPools,
  getYieldPositions,
  getYieldStrategies,
  getRewardHistory,
  getFarmMetrics,
  getLendingOffers,
  getStakingTiers,
} from '../lib/utils/yieldFarmingService';
import type {
  YieldPool,
  YieldPosition,
  YieldStrategy,
  RewardDistribution,
  YieldFarmMetrics,
  LendingOffer,
  StakingTier,
  PoolType,
  RiskLevel,
} from '../lib/utils/yieldFarmingService';

/* -------------------------------- Helpers -------------------------------- */

type TabId =
  | 'pools'
  | 'positions'
  | 'strategy'
  | 'rewards'
  | 'lending'
  | 'analytics';

const TABS: { id: TabId; label: string }[] = [
  { id: 'pools', label: 'Yield Pools' },
  { id: 'positions', label: 'My Positions' },
  { id: 'strategy', label: 'Strategy Builder' },
  { id: 'rewards', label: 'Reward History' },
  { id: 'lending', label: 'Lending Market' },
  { id: 'analytics', label: 'Analytics' },
];

const POOL_COLORS: Record<PoolType, string> = {
  lending: '#3b82f6',
  licensing: '#a855f7',
  rental: '#22c55e',
  staking: '#eab308',
  'insurance-pool': '#14b8a6',
};

const POOL_BG: Record<PoolType, string> = {
  lending: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  licensing: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  rental: 'bg-green-500/20 text-green-400 border-green-500/30',
  staking: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'insurance-pool': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
};

const RISK_BADGE: Record<RiskLevel, string> = {
  low: 'bg-green-500/20 text-green-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  high: 'bg-red-500/20 text-red-400',
};

const PURPOSE_BADGE: Record<string, string> = {
  exhibition: 'bg-blue-500/20 text-blue-400',
  media: 'bg-purple-500/20 text-purple-400',
  'corporate-display': 'bg-green-500/20 text-green-400',
  museum: 'bg-amber-500/20 text-amber-400',
  event: 'bg-pink-500/20 text-pink-400',
};

function fmtCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

function fmtUSD(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

function daysUntil(isoDate: string): number {
  const diff = new Date(isoDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

function countdownLabel(isoDate: string): string {
  const d = daysUntil(isoDate);
  if (d === 0) return 'Unlocked';
  if (d === 1) return '1 day';
  if (d < 30) return `${d} days`;
  const months = Math.floor(d / 30);
  const remaining = d % 30;
  return remaining > 0 ? `${months}mo ${remaining}d` : `${months}mo`;
}

/* ----------------------------- Loading Skeleton -------------------------- */

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-slate-700/50 ${className}`}
    />
  );
}

function LoadingGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
          <Skeleton className="mb-3 h-5 w-2/3" />
          <Skeleton className="mb-2 h-4 w-1/2" />
          <Skeleton className="mb-4 h-3 w-full" />
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  );
}

/* =========================== Tab: Yield Pools ============================ */

function YieldPoolsTab({ pools }: { pools: YieldPool[] }) {
  const maxTVL = useMemo(
    () => Math.max(...pools.map((p) => p.totalValueLocked)),
    [pools],
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {pools.map((pool) => {
        const utilPct = (pool.totalValueLocked / maxTVL) * 100;
        return (
          <div
            key={pool.id}
            className="group relative overflow-hidden rounded-xl border border-slate-700 bg-slate-800/60 p-5 transition hover:border-slate-500"
          >
            {/* color accent top bar */}
            <div
              className="absolute inset-x-0 top-0 h-1"
              style={{ backgroundColor: POOL_COLORS[pool.type] }}
            />

            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-100">
                  {pool.name}
                </h3>
                <span
                  className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${POOL_BG[pool.type]}`}
                >
                  {pool.type.replace('-', ' ')}
                </span>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-lg font-bold text-green-400">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                  {pool.apy}% APY
                </div>
              </div>
            </div>

            <p className="mb-3 text-xs leading-relaxed text-slate-400 line-clamp-2">
              {pool.description}
            </p>

            {/* TVL bar */}
            <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
              <span>TVL</span>
              <span className="font-medium text-slate-300">
                {fmtCurrency(pool.totalValueLocked)}
              </span>
            </div>
            <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-700">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${utilPct}%`,
                  backgroundColor: POOL_COLORS[pool.type],
                }}
              />
            </div>

            <div className="mb-4 flex items-center gap-3 text-xs text-slate-400">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${RISK_BADGE[pool.riskLevel]}`}
              >
                {pool.riskLevel} risk
              </span>
              <span>{pool.participants} participants</span>
              <span>Min {pool.minLockPeriod}d lock</span>
            </div>

            <button className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:from-blue-500 hover:to-indigo-500">
              Deposit Cards
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ========================= Tab: My Positions ============================= */

function PositionsTab({ positions }: { positions: YieldPosition[] }) {
  const totalAccrued = useMemo(
    () => positions.reduce((s, p) => s + p.accruedRewards, 0),
    [positions],
  );
  const totalDeposited = useMemo(
    () => positions.reduce((s, p) => s + p.depositedValue, 0),
    [positions],
  );

  return (
    <div>
      {/* Summary row */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
          <p className="text-xs text-slate-400">Total Deposited</p>
          <p className="text-xl font-bold text-slate-100">
            {fmtUSD(totalDeposited)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
          <p className="text-xs text-slate-400">Accrued Rewards</p>
          <p className="text-xl font-bold text-green-400">
            {fmtUSD(totalAccrued)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
          <p className="text-xs text-slate-400">Active Positions</p>
          <p className="text-xl font-bold text-slate-100">
            {positions.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
          <p className="text-xs text-slate-400">Avg. Yield</p>
          <p className="text-xl font-bold text-green-400">
            {(
              positions.reduce((s, p) => s + p.currentYield, 0) /
              positions.length
            ).toFixed(1)}
            %
          </p>
        </div>
      </div>

      {/* Position cards */}
      <div className="space-y-3">
        {positions.map((pos) => {
          const days = daysUntil(pos.lockExpiry);
          const isUnlocked = days === 0;
          return (
            <div
              key={pos.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-700 bg-slate-800/60 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-100">
                  {pos.cardName}
                </p>
                <p className="text-xs text-slate-400">{pos.player}</p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="text-center">
                  <p className="text-xs text-slate-500">Deposited</p>
                  <p className="font-medium text-slate-200">
                    {fmtUSD(pos.depositedValue)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500">Yield</p>
                  <p className="font-medium text-green-400">
                    {pos.currentYield}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500">Rewards</p>
                  <p className="font-medium text-green-400">
                    {fmtUSD(pos.accruedRewards)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500">Unlock</p>
                  <p
                    className={`font-medium ${isUnlocked ? 'text-green-400' : 'text-amber-400'}`}
                  >
                    {countdownLabel(pos.lockExpiry)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                    pos.status === 'earning'
                      ? 'bg-green-500/20 text-green-400'
                      : pos.status === 'locked'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  {pos.status.replace('-', ' ')}
                </span>
                {isUnlocked && (
                  <button className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-500">
                    Withdraw
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ======================== Tab: Strategy Builder ========================== */

function StrategyBuilderTab({
  strategies,
  pools,
}: {
  strategies: YieldStrategy[];
  pools: YieldPool[];
}) {
  const [selected, setSelected] = useState<YieldStrategy>(strategies[0]);
  const [projectionMonths] = useState(12);

  const projectionData = useMemo(() => {
    const monthlyRate = selected.expectedAPY / 100 / 12;
    const baseValue = 100_000; // hypothetical $100K portfolio
    return Array.from({ length: projectionMonths }, (_, i) => {
      const month = i + 1;
      const cumulative = baseValue * monthlyRate * month;
      return {
        month: `M${month}`,
        returns: Math.round(cumulative),
        value: Math.round(baseValue + cumulative),
      };
    });
  }, [selected, projectionMonths]);

  const poolMap = useMemo(() => {
    const m = new Map<string, YieldPool>();
    pools.forEach((p) => m.set(p.id, p));
    return m;
  }, [pools]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Strategy list */}
      <div className="space-y-3 lg:col-span-1">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Strategies
        </h3>
        {strategies.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelected(s)}
            className={`w-full rounded-xl border p-4 text-left transition ${
              selected.id === s.id
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-700 bg-slate-800/60 hover:border-slate-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-100">
                {s.name}
              </span>
              <span className="flex items-center gap-1 text-sm font-bold text-green-400">
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
                {s.expectedAPY}%
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400 line-clamp-2">
              {s.description}
            </p>
            <div className="mt-2 flex gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${RISK_BADGE[s.risk]}`}>
                {s.risk}
              </span>
              <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
                Diversification: {s.diversificationScore}/100
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Detail + chart */}
      <div className="space-y-5 lg:col-span-2">
        <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                {selected.name}
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                {selected.description}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-400">
                {selected.expectedAPY}% APY
              </p>
              <p className="text-xs text-slate-500">
                {selected.autoCompound ? 'Auto-compound ON' : 'Manual compound'}
              </p>
            </div>
          </div>

          {/* Pools in strategy */}
          <div className="mb-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pools in this strategy
            </p>
            <div className="flex flex-wrap gap-2">
              {selected.pools.map((pid) => {
                const pool = poolMap.get(pid);
                if (!pool) return null;
                return (
                  <span
                    key={pid}
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${POOL_BG[pool.type]}`}
                  >
                    {pool.name} ({pool.apy}%)
                  </span>
                );
              })}
            </div>
          </div>

          {/* Projected returns table */}
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-slate-900/50 p-3 text-center">
              <p className="text-xs text-slate-500">3 Months</p>
              <p className="text-lg font-bold text-green-400">
                +{selected.projectedReturns.months3}%
              </p>
            </div>
            <div className="rounded-lg bg-slate-900/50 p-3 text-center">
              <p className="text-xs text-slate-500">6 Months</p>
              <p className="text-lg font-bold text-green-400">
                +{selected.projectedReturns.months6}%
              </p>
            </div>
            <div className="rounded-lg bg-slate-900/50 p-3 text-center">
              <p className="text-xs text-slate-500">12 Months</p>
              <p className="text-lg font-bold text-green-400">
                +{selected.projectedReturns.months12}%
              </p>
            </div>
          </div>
        </div>

        {/* Projected returns chart */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
          <h4 className="mb-3 text-sm font-semibold text-slate-300">
            Projected Returns on $100K Portfolio
          </h4>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={projectionData}>
              <defs>
                <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value: number) => [fmtUSD(value), '']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#projGrad)"
                name="Portfolio Value"
              />
              <Area
                type="monotone"
                dataKey="returns"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="transparent"
                strokeDasharray="4 2"
                name="Cumulative Returns"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ======================== Tab: Reward History ============================= */

function RewardHistoryTab({ rewards }: { rewards: RewardDistribution[] }) {
  // Build cumulative stacked area data by month and source type
  const chartData = useMemo(() => {
    const months = new Map<
      string,
      { lending: number; licensing: number; rental: number; staking: number; insurance: number }
    >();

    // Map sources to categories
    const categorize = (source: string): string => {
      const s = source.toLowerCase();
      if (s.includes('exhibition') || s.includes('lending')) return 'lending';
      if (s.includes('media') || s.includes('licensing') || s.includes('content'))
        return 'licensing';
      if (s.includes('corporate') || s.includes('display') || s.includes('rental'))
        return 'rental';
      if (s.includes('staking') || s.includes('diamond') || s.includes('platinum'))
        return 'staking';
      return 'insurance';
    };

    rewards.forEach((r) => {
      const month = r.date.slice(0, 7); // YYYY-MM
      if (!months.has(month)) {
        months.set(month, {
          lending: 0,
          licensing: 0,
          rental: 0,
          staking: 0,
          insurance: 0,
        });
      }
      const entry = months.get(month)!;
      const cat = categorize(r.source);
      (entry as Record<string, number>)[cat] =
        ((entry as Record<string, number>)[cat] || 0) + r.amount;
    });

    return Array.from(months.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, vals]) => ({ month, ...vals }));
  }, [rewards]);

  const totalRewards = useMemo(
    () => rewards.reduce((s, r) => s + r.amount, 0),
    [rewards],
  );

  // Recent rewards for table
  const recentRewards = useMemo(
    () =>
      [...rewards]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 20),
    [rewards],
  );

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
        <p className="text-xs text-slate-400">Total Rewards Distributed</p>
        <p className="text-2xl font-bold text-green-400">
          {fmtUSD(totalRewards)}
        </p>
      </div>

      {/* Stacked area chart */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
        <h4 className="mb-3 text-sm font-semibold text-slate-300">
          Rewards by Pool Type
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}K`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value: number) => [fmtUSD(value), '']}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="staking"
              stackId="1"
              stroke="#eab308"
              fill="#eab30833"
              name="Staking"
            />
            <Area
              type="monotone"
              dataKey="rental"
              stackId="1"
              stroke="#22c55e"
              fill="#22c55e33"
              name="Rental"
            />
            <Area
              type="monotone"
              dataKey="insurance"
              stackId="1"
              stroke="#14b8a6"
              fill="#14b8a633"
              name="Insurance"
            />
            <Area
              type="monotone"
              dataKey="lending"
              stackId="1"
              stroke="#3b82f6"
              fill="#3b82f633"
              name="Lending"
            />
            <Area
              type="monotone"
              dataKey="licensing"
              stackId="1"
              stroke="#a855f7"
              fill="#a855f733"
              name="Licensing"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Transaction table */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/60">
        <div className="border-b border-slate-700 px-5 py-3">
          <h4 className="text-sm font-semibold text-slate-300">
            Recent Transactions
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Source</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentRewards.map((r, i) => (
                <tr
                  key={`${r.positionId}-${r.date}-${i}`}
                  className="border-b border-slate-700/50 transition hover:bg-slate-700/20"
                >
                  <td className="whitespace-nowrap px-5 py-3 text-slate-400">
                    {r.date}
                  </td>
                  <td className="px-5 py-3 text-slate-300">{r.source}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs capitalize text-slate-300">
                      {r.type.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right font-medium text-green-400">
                    +{fmtUSD(r.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ======================== Tab: Lending Market ============================= */

function LendingMarketTab({
  offers,
  tiers,
}: {
  offers: LendingOffer[];
  tiers: StakingTier[];
}) {
  return (
    <div className="space-y-6">
      {/* Active lending offers */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Active Lending Offers
        </h3>
        <div className="space-y-3">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-700 bg-slate-800/60 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-100">
                  {offer.borrower}
                </p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${PURPOSE_BADGE[offer.purpose] || 'bg-slate-700 text-slate-300'}`}
                  >
                    {offer.purpose.replace('-', ' ')}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                      offer.status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : offer.status === 'offered'
                          ? 'bg-blue-500/20 text-blue-400'
                          : offer.status === 'completed'
                            ? 'bg-slate-600 text-slate-300'
                            : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {offer.status}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="text-center">
                  <p className="text-xs text-slate-500">Fee</p>
                  <p className="font-medium text-green-400">
                    {fmtUSD(offer.fee)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500">Duration</p>
                  <p className="font-medium text-slate-200">
                    {offer.duration} days
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500">Insurance</p>
                  <p className="font-medium text-slate-200">
                    {fmtCurrency(offer.insurance)}
                  </p>
                </div>
                {offer.status === 'offered' && (
                  <button className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500">
                    Accept Offer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Staking tiers */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Staking Tiers
        </h3>
        <div className="flex flex-col items-end gap-3 md:flex-row md:items-end md:gap-4">
          {tiers.map((t, i) => {
            const height = 120 + i * 50;
            const colors = [
              'from-orange-700 to-orange-500',
              'from-slate-500 to-slate-300',
              'from-yellow-600 to-yellow-400',
              'from-cyan-500 to-cyan-300',
            ];
            return (
              <div key={t.tier} className="flex flex-col items-center">
                <div
                  className={`flex w-36 flex-col items-center justify-end rounded-t-xl bg-gradient-to-t ${colors[i]} p-3`}
                  style={{ height }}
                >
                  <p className="text-lg font-bold text-white">{t.multiplier}x</p>
                  <p className="text-xs font-semibold text-white/80">
                    {t.tier}
                  </p>
                  <p className="mt-1 text-xs text-white/60">
                    {fmtCurrency(t.minValue)}+ | {t.lockDays}d
                  </p>
                </div>
                <div className="mt-2 w-36 space-y-1">
                  {t.bonusRewards.map((b, j) => (
                    <p
                      key={j}
                      className="text-center text-xs text-slate-400"
                    >
                      {b}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* =========================== Tab: Analytics ============================== */

function AnalyticsTab({
  metrics,
  pools,
}: {
  metrics: YieldFarmMetrics;
  pools: YieldPool[];
}) {
  const tvlChartData = useMemo(
    () =>
      metrics.tvlHistory.map((h) => ({
        date: h.date.slice(0, 7),
        tvl: h.tvl,
      })),
    [metrics],
  );

  const apyBarData = useMemo(
    () =>
      pools.map((p) => ({
        name: p.name.length > 18 ? p.name.slice(0, 16) + '...' : p.name,
        apy: p.apy,
        fill: POOL_COLORS[p.type],
      })),
    [pools],
  );

  const pieData = useMemo(() => {
    const typeMap = new Map<PoolType, number>();
    pools.forEach((p) => {
      typeMap.set(p.type, (typeMap.get(p.type) || 0) + p.totalValueLocked);
    });
    return Array.from(typeMap.entries()).map(([type, value]) => ({
      name: type.replace('-', ' '),
      value,
      color: POOL_COLORS[type],
    }));
  }, [pools]);

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
          <p className="text-xs text-slate-400">Total Value Locked</p>
          <p className="text-xl font-bold text-slate-100">
            {fmtCurrency(metrics.totalValueLocked)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
          <p className="text-xs text-slate-400">Rewards Distributed</p>
          <p className="text-xl font-bold text-green-400">
            {fmtCurrency(metrics.totalRewardsDistributed)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
          <p className="text-xs text-slate-400">Avg APY</p>
          <p className="flex items-center gap-1 text-xl font-bold text-green-400">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
            {metrics.avgAPY}%
          </p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
          <p className="text-xs text-slate-400">Top Pool</p>
          <p className="text-sm font-bold text-slate-100">{metrics.topPool}</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
          <p className="text-xs text-slate-400">Participants</p>
          <p className="text-xl font-bold text-slate-100">
            {metrics.participantCount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* TVL over time */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
          <h4 className="mb-3 text-sm font-semibold text-slate-300">
            TVL Over Time
          </h4>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={tvlChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(v: number) => `$${(v / 1_000_000).toFixed(0)}M`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value: number) => [fmtUSD(value), 'TVL']}
              />
              <Line
                type="monotone"
                dataKey="tvl"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3, fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* APY comparison */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
          <h4 className="mb-3 text-sm font-semibold text-slate-300">
            APY Comparison
          </h4>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={apyBarData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#64748b" fontSize={12} unit="%" />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#64748b"
                fontSize={11}
                width={130}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value: number) => [`${value}%`, 'APY']}
              />
              <Bar dataKey="apy" radius={[0, 4, 4, 0]}>
                {apyBarData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pool distribution pie */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
        <h4 className="mb-3 text-sm font-semibold text-slate-300">
          TVL Distribution by Pool Type
        </h4>
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-center">
          <ResponsiveContainer width="100%" height={300} className="max-w-md">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={120}
                paddingAngle={2}
                label={({ name, percent }: { name: string; percent: number }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {pieData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value: number) => [fmtCurrency(value), 'TVL']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2">
            {pieData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm capitalize text-slate-300">
                  {entry.name}
                </span>
                <span className="text-sm font-medium text-slate-400">
                  {fmtCurrency(entry.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================= Main Page Component =========================== */

export default function CardYieldFarming() {
  const [activeTab, setActiveTab] = useState<TabId>('pools');
  const [loading, setLoading] = useState(true);

  const [pools, setPools] = useState<YieldPool[]>([]);
  const [positions, setPositions] = useState<YieldPosition[]>([]);
  const [strategies, setStrategies] = useState<YieldStrategy[]>([]);
  const [rewards, setRewards] = useState<RewardDistribution[]>([]);
  const [metrics, setMetrics] = useState<YieldFarmMetrics | null>(null);
  const [offers, setOffers] = useState<LendingOffer[]>([]);
  const [tiers, setTiers] = useState<StakingTier[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [p, pos, strat, rew, met, off, ti] = await Promise.all([
        getYieldPools(),
        getYieldPositions(),
        getYieldStrategies(),
        getRewardHistory(),
        getFarmMetrics(),
        getLendingOffers(),
        getStakingTiers(),
      ]);
      if (cancelled) return;
      setPools(p);
      setPositions(pos);
      setStrategies(strat);
      setRewards(rew);
      setMetrics(met);
      setOffers(off);
      setTiers(ti);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const content = useMemo(() => {
    if (loading) return <LoadingGrid count={6} />;

    switch (activeTab) {
      case 'pools':
        return <YieldPoolsTab pools={pools} />;
      case 'positions':
        return <PositionsTab positions={positions} />;
      case 'strategy':
        return strategies.length > 0 ? (
          <StrategyBuilderTab strategies={strategies} pools={pools} />
        ) : null;
      case 'rewards':
        return <RewardHistoryTab rewards={rewards} />;
      case 'lending':
        return <LendingMarketTab offers={offers} tiers={tiers} />;
      case 'analytics':
        return metrics ? (
          <AnalyticsTab metrics={metrics} pools={pools} />
        ) : null;
      default:
        return null;
    }
  }, [
    activeTab,
    loading,
    pools,
    positions,
    strategies,
    rewards,
    metrics,
    offers,
    tiers,
  ]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-50">
                Card Yield Farming
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Earn passive income from your sports card collection through
                lending, licensing, rentals, staking, and insurance pooling.
              </p>
            </div>
            {metrics && !loading && (
              <div className="flex items-center gap-4 text-sm">
                <div className="text-right">
                  <p className="text-xs text-slate-500">Platform TVL</p>
                  <p className="font-bold text-slate-100">
                    {fmtCurrency(metrics.totalValueLocked)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Avg APY</p>
                  <p className="flex items-center gap-1 font-bold text-green-400">
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                      />
                    </svg>
                    {metrics.avgAPY}%
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-1 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{content}</div>
    </div>
  );
}
