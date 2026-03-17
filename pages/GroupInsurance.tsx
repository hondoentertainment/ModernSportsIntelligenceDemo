import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck, Users, DollarSign, TrendingDown, Activity,
  Clock, CheckCircle, XCircle, AlertTriangle, FileText,
  ChevronRight, Award, BarChart3, Percent, Heart,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, PieChart, Pie,
} from 'recharts';
import {
  getInsurancePools, getGroupInsuranceStats, getPoolMembers,
  getPoolTierColor, getPoolTierBg, getClaimStatusColor, getClaimStatusBg,
  getCoverageLabel, getCoverageIcon, formatCurrency, formatPercent,
  type InsurancePool, type PoolMember, type InsuranceClaim,
  type GroupInsuranceStats, type PoolTier, type CoverageType, type ClaimStatus,
} from '../lib/groupInsuranceService';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CHART_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  'filed': 'Filed',
  'under-review': 'Under Review',
  'approved': 'Approved',
  'denied': 'Denied',
  'paid': 'Paid',
};

const CLAIM_STATUS_ICONS: Record<ClaimStatus, React.ReactNode> = {
  'filed': <FileText size={14} />,
  'under-review': <Clock size={14} />,
  'approved': <CheckCircle size={14} />,
  'denied': <XCircle size={14} />,
  'paid': <DollarSign size={14} />,
};

// ---------------------------------------------------------------------------
// Savings Calculator
// ---------------------------------------------------------------------------

const CALCULATOR_PRESETS = [
  { label: '$10k Collection', value: 10000 },
  { label: '$50k Collection', value: 50000 },
  { label: '$100k Collection', value: 100000 },
  { label: '$250k Collection', value: 250000 },
  { label: '$500k Collection', value: 500000 },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const GroupInsurance: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [pools, setPools] = useState<InsurancePool[]>([]);
  const [stats, setStats] = useState<GroupInsuranceStats | null>(null);
  const [selectedPoolId, setSelectedPoolId] = useState<string>('');
  const [members, setMembers] = useState<PoolMember[]>([]);
  const [calcValue, setCalcValue] = useState<number>(50000);

  useEffect(() => {
    try {
      const p = getInsurancePools();
      const s = getGroupInsuranceStats();
      setPools(p);
      setStats(s);
      if (p.length > 0) {
        setSelectedPoolId(p[0].id);
        setMembers(getPoolMembers(p[0].id));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectPool = (poolId: string) => {
    setSelectedPoolId(poolId);
    setMembers(getPoolMembers(poolId));
  };

  const selectedPool = useMemo(
    () => pools.find((p) => p.id === selectedPoolId) ?? null,
    [pools, selectedPoolId],
  );

  // Savings calculator derived data
  const savingsData = useMemo(() => {
    if (!selectedPool) return null;
    const individualRate = 0.035;
    const poolRate = individualRate * (1 - selectedPool.savingsPercent / 100);
    const individualPremium = calcValue * individualRate;
    const poolPremium = calcValue * poolRate;
    const savings = individualPremium - poolPremium;
    return { individualPremium, poolPremium, savings, savingsPercent: selectedPool.savingsPercent };
  }, [calcValue, selectedPool]);

  // Coverage breakdown pie chart data
  const coveragePieData = useMemo(() => {
    if (!selectedPool) return [];
    return selectedPool.coverageTypes.map((ct, i) => ({
      name: getCoverageLabel(ct),
      value: 1,
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [selectedPool]);

  // Member premium comparison bar chart
  const memberComparisonData = useMemo(() => {
    if (!members.length) return [];
    return members.map((m) => ({
      name: m.handle,
      poolPremium: m.premium,
      individualPremium: Math.round(m.insuredValue * 0.035),
      savings: Math.round(m.insuredValue * 0.035) - m.premium,
    }));
  }, [members]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      {/* ---- Header ---- */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-cyan-500/20 rounded-xl">
          <ShieldCheck size={28} className="text-cyan-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Group Insurance &amp; Risk Pool</h1>
          <p className="text-sm text-slate-400">Shared premiums for high-value collections — save 40-60% vs individual policies</p>
        </div>
      </div>

      {/* ---- Stats Row ---- */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Active Pools', value: stats.totalPools.toString(), sub: `${stats.totalMembers} total members`, icon: <Users size={20} className="text-blue-400" />, accent: 'border-blue-500/40' },
            { label: 'Total Insured Value', value: formatCurrency(stats.totalInsuredValue), sub: `Pool health ${formatPercent(stats.poolHealth)}`, icon: <DollarSign size={20} className="text-emerald-400" />, accent: 'border-emerald-500/40' },
            { label: 'Avg Savings', value: `${stats.avgSavings}%`, sub: `vs individual policies`, icon: <TrendingDown size={20} className="text-amber-400" />, accent: 'border-amber-500/40' },
            { label: 'Claims Processed', value: stats.claimsProcessed.toString(), sub: `${stats.claimsPaid} paid — avg ${stats.avgClaimTime}d`, icon: <Activity size={20} className="text-cyan-400" />, accent: 'border-cyan-500/40' },
          ].map((kpi) => (
            <div key={kpi.label} className={`bg-slate-900 border border-slate-800 ${kpi.accent} rounded-xl p-4 flex items-start gap-3`}>
              <div className="mt-0.5">{kpi.icon}</div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">{kpi.label}</p>
                <p className="text-xl font-bold mt-0.5">{kpi.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{kpi.sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---- Pool Selector Tabs ---- */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {pools.map((pool) => {
          const active = pool.id === selectedPoolId;
          return (
            <button
              key={pool.id}
              onClick={() => handleSelectPool(pool.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                active
                  ? 'bg-slate-800 border border-slate-600 text-white shadow-lg shadow-slate-900/50'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <ShieldCheck size={16} className={getPoolTierColor(pool.tier)} />
              <span>{pool.name}</span>
              <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${getPoolTierBg(pool.tier)} ${getPoolTierColor(pool.tier)}`}>
                {pool.tier.toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>

      {/* ---- Pool Detail ---- */}
      {selectedPool && (
        <div className="space-y-6">
          {/* Pool Overview Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <ShieldCheck size={20} className={getPoolTierColor(selectedPool.tier)} />
                  {selectedPool.name}
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  {selectedPool.memberCount} / {selectedPool.maxMembers} members — Renews {selectedPool.renewalDate}
                </p>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-slate-400 text-xs">Insured Value</p>
                  <p className="font-bold text-emerald-400">{formatCurrency(selectedPool.totalInsuredValue)}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-xs">Pool Premium</p>
                  <p className="font-bold text-blue-400">{formatCurrency(selectedPool.poolPremium)}/yr</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-xs">Individual Equiv.</p>
                  <p className="font-bold text-red-400 line-through">{formatCurrency(selectedPool.individualEquivalent)}/yr</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-xs">Savings</p>
                  <p className="font-bold text-amber-400">{selectedPool.savingsPercent}%</p>
                </div>
              </div>
            </div>

            {/* Pool meta row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="bg-slate-800/60 rounded-lg p-3">
                <p className="text-xs text-slate-400">Deductible</p>
                <p className="font-semibold mt-0.5">{formatCurrency(selectedPool.deductible)}</p>
              </div>
              <div className="bg-slate-800/60 rounded-lg p-3">
                <p className="text-xs text-slate-400">Max Payout</p>
                <p className="font-semibold mt-0.5">{formatCurrency(selectedPool.maxPayout)}</p>
              </div>
              <div className="bg-slate-800/60 rounded-lg p-3">
                <p className="text-xs text-slate-400">Claim Ratio</p>
                <p className="font-semibold mt-0.5">{(selectedPool.claimRatio * 100).toFixed(1)}%</p>
              </div>
              <div className="bg-slate-800/60 rounded-lg p-3">
                <p className="text-xs text-slate-400">Active Claims</p>
                <p className="font-semibold mt-0.5">{selectedPool.claims.filter((c) => c.status !== 'paid' && c.status !== 'denied').length}</p>
              </div>
            </div>
          </div>

          {/* Coverage Breakdown + Member Premium Comparison (side by side) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coverage Breakdown */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <ShieldCheck size={16} className="text-cyan-400" />
                Coverage Breakdown
              </h3>
              <div className="flex items-center gap-6">
                <div className="w-40 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={coveragePieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={65}
                        innerRadius={35}
                        strokeWidth={0}
                      >
                        {coveragePieData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', fontSize: '0.75rem' }}
                        itemStyle={{ color: '#e2e8f0' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {selectedPool.coverageTypes.map((ct, i) => (
                    <div key={ct} className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-sm" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-slate-300">{getCoverageIcon(ct)} {getCoverageLabel(ct)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Individual vs Group Premium Comparison */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <BarChart3 size={16} className="text-amber-400" />
                Individual vs Pool Premium by Member
              </h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={memberComparisonData} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', fontSize: '0.75rem' }}
                      itemStyle={{ color: '#e2e8f0' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Bar dataKey="individualPremium" name="Individual" fill="#ef4444" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="poolPremium" name="Pool" fill="#10b981" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Member List */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Users size={16} className="text-blue-400" />
              Pool Members ({members.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-slate-800">
                    <th className="pb-2 pr-4">Member</th>
                    <th className="pb-2 pr-4">Insured Value</th>
                    <th className="pb-2 pr-4">Premium</th>
                    <th className="pb-2 pr-4">Cards</th>
                    <th className="pb-2 pr-4">Risk Score</th>
                    <th className="pb-2 pr-4">Coverage</th>
                    <th className="pb-2 pr-4">Claims</th>
                    <th className="pb-2">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.userId} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 pr-4 font-medium text-slate-200">@{m.handle}</td>
                      <td className="py-2.5 pr-4 text-emerald-400">{formatCurrency(m.insuredValue)}</td>
                      <td className="py-2.5 pr-4 text-blue-400">{formatCurrency(m.premium)}/yr</td>
                      <td className="py-2.5 pr-4">{m.cardsInsured}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                          m.riskScore <= 10 ? 'bg-emerald-500/20 text-emerald-400'
                          : m.riskScore <= 20 ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-red-500/20 text-red-400'
                        }`}>
                          {m.riskScore}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4">
                        <div className="flex gap-1 flex-wrap">
                          {m.coverageTypes.map((ct) => (
                            <span key={ct} className="text-xs" title={getCoverageLabel(ct)}>
                              {getCoverageIcon(ct)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 pr-4">{m.claimsHistory}</td>
                      <td className="py-2.5 text-slate-400">{m.joinedDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Claims History */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <FileText size={16} className="text-purple-400" />
              Claims History ({selectedPool.claims.length})
            </h3>
            {selectedPool.claims.length === 0 ? (
              <p className="text-sm text-slate-500">No claims filed for this pool.</p>
            ) : (
              <div className="space-y-3">
                {selectedPool.claims.map((claim) => (
                  <div
                    key={claim.id}
                    className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-200">{claim.cardName}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Filed by @{claim.memberHandle} on {claim.filedDate} — Cause: {getCoverageLabel(claim.cause)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-slate-300 font-semibold">{formatCurrency(claim.claimValue)}</span>
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getClaimStatusBg(claim.status)} ${getClaimStatusColor(claim.status)}`}>
                          {CLAIM_STATUS_ICONS[claim.status]}
                          {CLAIM_STATUS_LABELS[claim.status]}
                        </span>
                      </div>
                    </div>
                    {(claim.paidAmount !== null || claim.adjusterNotes || claim.resolvedDate) && (
                      <div className="mt-3 pt-3 border-t border-slate-700/40 flex flex-wrap gap-4 text-xs text-slate-400">
                        {claim.paidAmount !== null && (
                          <span className="text-green-400">Paid: {formatCurrency(claim.paidAmount)}</span>
                        )}
                        {claim.resolvedDate && (
                          <span>Resolved: {claim.resolvedDate}</span>
                        )}
                        {claim.adjusterNotes && (
                          <span className="text-slate-500 italic">{claim.adjusterNotes}</span>
                        )}
                      </div>
                    )}
                    {claim.evidence.length > 0 && (
                      <div className="mt-2 flex gap-1.5 flex-wrap">
                        {claim.evidence.map((e) => (
                          <span key={e} className="text-xs bg-slate-700/50 px-2 py-0.5 rounded text-slate-400">
                            {e}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Savings Calculator */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Percent size={16} className="text-emerald-400" />
              Savings Calculator — Individual vs Pooled Cost
            </h3>
            <div className="space-y-4">
              {/* Preset buttons */}
              <div className="flex gap-2 flex-wrap">
                {CALCULATOR_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setCalcValue(preset.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      calcValue === preset.value
                        ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
                        : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Custom input */}
              <div className="flex items-center gap-3">
                <label className="text-xs text-slate-400">Custom value:</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                  <input
                    type="number"
                    value={calcValue}
                    onChange={(e) => setCalcValue(Math.max(0, Number(e.target.value)))}
                    className="bg-slate-800 border border-slate-700 rounded-lg pl-7 pr-3 py-1.5 text-sm text-slate-200 w-40 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              {/* Results */}
              {savingsData && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
                    <p className="text-xs text-red-400 uppercase tracking-wider">Individual Premium</p>
                    <p className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(savingsData.individualPremium)}</p>
                    <p className="text-xs text-slate-500 mt-1">per year at 3.5% rate</p>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-center">
                    <p className="text-xs text-emerald-400 uppercase tracking-wider">Pool Premium</p>
                    <p className="text-2xl font-bold text-emerald-400 mt-1">{formatCurrency(savingsData.poolPremium)}</p>
                    <p className="text-xs text-slate-500 mt-1">per year at pooled rate</p>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 text-center">
                    <p className="text-xs text-amber-400 uppercase tracking-wider">You Save</p>
                    <p className="text-2xl font-bold text-amber-400 mt-1">{formatCurrency(savingsData.savings)}</p>
                    <p className="text-xs text-slate-500 mt-1">{savingsData.savingsPercent}% reduction</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupInsurance;
