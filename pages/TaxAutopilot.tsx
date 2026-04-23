// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import {
  Calculator,
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  BarChart3,
  ChevronRight,
  Info,
  ArrowRight,
  CircleDot,
  XCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  getTaxSummary,
  getTransactions,
  formatCurrency,
  formatPercent,
  type TaxSummary,
  type Transaction,
  type TaxCategory,
  type QuarterlyEstimate,
  type ThresholdTracker,
  type IRSClassification,
  type IRSFactor,
  type TaxRecommendation,
  type ScheduleComparison,
} from '../lib/utils/taxAutopilotService';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TABS = [
  'Tax Dashboard',
  'Classification',
  '1099-K Tracker',
  'Quarterly Estimates',
  'Recommendations',
] as const;

type TabName = (typeof TABS)[number];

const PIE_COLORS = ['#84cc16', '#f97316', '#22d3ee', '#a78bfa', '#fbbf24', '#64748b', '#f87171'];

const PRIORITY_STYLES: Record<string, string> = {
  high: 'bg-red-900/40 text-red-400 border-red-500/30',
  medium: 'bg-yellow-900/40 text-yellow-400 border-yellow-500/30',
  low: 'bg-slate-700/40 text-slate-400 border-slate-500/30',
};

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  paid: { bg: 'bg-green-900/40', text: 'text-green-400', label: 'Paid' },
  current: { bg: 'bg-lime-900/40', text: 'text-lime-400', label: 'Current' },
  upcoming: { bg: 'bg-slate-700/40', text: 'text-slate-400', label: 'Upcoming' },
  overdue: { bg: 'bg-red-900/40', text: 'text-red-400', label: 'Overdue' },
};

// ---------------------------------------------------------------------------
// Custom Tooltip
// ---------------------------------------------------------------------------

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-300 font-medium mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.FC<any>;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl bg-slate-800 border border-slate-700 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-400 text-sm">{label}</span>
        <Icon className={`w-5 h-5 ${accent ? 'text-lime-400' : 'text-slate-500'}`} />
      </div>
      <p className={`text-2xl font-bold ${accent ? 'text-lime-400' : 'text-slate-100'}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const TaxAutopilot: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabName>('Tax Dashboard');
  const [summary, setSummary] = useState<TaxSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setSummary(getTaxSummary());
      setTransactions(getTransactions());
    } finally {
      setLoading(false);
    }
  }, []);

  // Derived data -----------------------------------------------------------

  const pieData = useMemo(() => {
    if (!summary) return [];
    return summary.categories
      .filter((c) => c.total !== 0)
      .map((c) => ({ name: c.label, value: Math.abs(c.total), color: c.color }));
  }, [summary]);

  const quarterBarData = useMemo(() => {
    if (!summary) return [];
    return summary.quarterlyEstimates.map((q) => ({
      name: q.quarter,
      'Estimated Tax': q.estimatedTax,
      'SE Tax': q.selfEmploymentTax,
    }));
  }, [summary]);

  // Render guards ----------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-slate-500 text-lg">Loading Tax Autopilot...</div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-red-400">Failed to load tax data.</p>
      </div>
    );
  }

  const { profile, categories, quarterlyEstimates, thresholds, classification, recommendations, scheduleComparison } = summary;

  // -----------------------------------------------------------------------
  // TAB: Tax Dashboard
  // -----------------------------------------------------------------------

  function renderDashboard() {
    const sellTxns = transactions.filter((t) => t.type === 'sell' || t.type === 'trade');
    return (
      <div className="space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Income" value={formatCurrency(profile.totalIncome)} sub="From sales & trades" icon={TrendingUp} accent />
          <StatCard label="Total Expenses" value={formatCurrency(profile.totalExpenses)} sub="Purchases & costs" icon={DollarSign} />
          <StatCard label="Net Income" value={formatCurrency(profile.netIncome)} sub={`${transactions.length} transactions`} icon={BarChart3} accent />
          <StatCard label="IRS Classification" value={classification.status.charAt(0).toUpperCase() + classification.status.slice(1)} sub={`${classification.confidence}% confidence`} icon={Shield} />
        </div>

        {/* Pie chart + Category breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl bg-slate-800 border border-slate-700 p-6">
            <h3 className="text-slate-100 font-semibold mb-4">Income by Category</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(val: string) => <span className="text-slate-400 text-xs">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl bg-slate-800 border border-slate-700 p-6">
            <h3 className="text-slate-100 font-semibold mb-4">Category Breakdown</h3>
            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-slate-300 text-sm">{cat.label}</span>
                    {cat.scheduleType !== 'none' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">
                        Sch {cat.scheduleType}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${cat.total >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
                      {formatCurrency(cat.total)}
                    </span>
                    <span className="text-slate-500 text-xs ml-2">({cat.count})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent transactions */}
        <div className="rounded-xl bg-slate-800 border border-slate-700 p-6">
          <h3 className="text-slate-100 font-semibold mb-4">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 border-b border-slate-700">
                  <th className="text-left py-2 font-medium">Date</th>
                  <th className="text-left py-2 font-medium">Card</th>
                  <th className="text-left py-2 font-medium">Type</th>
                  <th className="text-left py-2 font-medium">Platform</th>
                  <th className="text-right py-2 font-medium">Amount</th>
                  <th className="text-right py-2 font-medium">Gain/Loss</th>
                  <th className="text-left py-2 font-medium">Category</th>
                </tr>
              </thead>
              <tbody>
                {sellTxns.slice(0, 10).map((tx) => (
                  <tr key={tx.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-2.5 text-slate-400">{tx.date}</td>
                    <td className="py-2.5 text-slate-200 max-w-[200px] truncate">{tx.cardName}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        tx.type === 'sell' ? 'bg-lime-900/40 text-lime-400' : 'bg-yellow-900/40 text-yellow-400'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-400">{tx.platform}</td>
                    <td className="py-2.5 text-right text-slate-200">{formatCurrency(tx.amount)}</td>
                    <td className={`py-2.5 text-right font-medium ${tx.gain >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
                      {formatCurrency(tx.gain)}
                    </td>
                    <td className="py-2.5">
                      <span className="text-xs text-slate-500">{tx.category.replace(/_/g, ' ')}</span>
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

  // -----------------------------------------------------------------------
  // TAB: Classification
  // -----------------------------------------------------------------------

  function renderClassification() {
    const cls = classification;
    const statusColors: Record<string, string> = {
      dealer: 'text-red-400 bg-red-900/30 border-red-500/30',
      collector: 'text-green-400 bg-green-900/30 border-green-500/30',
      investor: 'text-blue-400 bg-blue-900/30 border-blue-500/30',
      hybrid: 'text-yellow-400 bg-yellow-900/30 border-yellow-500/30',
    };

    return (
      <div className="space-y-6">
        {/* Status banner */}
        <div className={`rounded-xl border p-6 ${statusColors[cls.status]}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-6 h-6" />
                <h3 className="text-xl font-bold">
                  IRS Classification: {cls.status.charAt(0).toUpperCase() + cls.status.slice(1)}
                </h3>
              </div>
              <p className="text-sm opacity-80">{cls.recommendation}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{cls.confidence}%</div>
              <div className="text-xs opacity-70">Confidence Score</div>
            </div>
          </div>
        </div>

        {/* Risk level */}
        <div className="rounded-xl bg-slate-800 border border-slate-700 p-6">
          <h3 className="text-slate-100 font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Risk Assessment
          </h3>
          <div className="flex items-center gap-4 mb-4">
            {['low', 'medium', 'high'].map((level) => (
              <div
                key={level}
                className={`flex-1 h-3 rounded-full ${
                  level === cls.riskLevel
                    ? level === 'low'
                      ? 'bg-green-500'
                      : level === 'medium'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                    : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
          <p className="text-slate-400 text-sm">
            Audit risk level: <span className="font-semibold text-slate-200 capitalize">{cls.riskLevel}</span>
            {cls.riskLevel === 'medium' &&
              ' — Your activity pattern could be interpreted multiple ways by the IRS. Maintain thorough records.'}
            {cls.riskLevel === 'high' &&
              ' — Strong dealer indicators present. Consider proactive tax planning with a CPA.'}
            {cls.riskLevel === 'low' &&
              ' — Your activity is consistent with typical collector/investor behavior.'}
          </p>
        </div>

        {/* IRS Nine-Factor Test */}
        <div className="rounded-xl bg-slate-800 border border-slate-700 p-6">
          <h3 className="text-slate-100 font-semibold mb-2">IRS Factor Analysis</h3>
          <p className="text-slate-500 text-sm mb-5">
            The IRS uses a multi-factor test to determine if an activity is a hobby or a business. Below is your score on each factor.
          </p>
          <div className="space-y-4">
            {cls.factors.map((f: IRSFactor) => {
              const pct = Math.round((f.score / f.maxScore) * 100);
              return (
                <div key={f.name} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {f.met ? (
                        <CheckCircle className="w-4 h-4 text-lime-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                      <span className="text-slate-200 text-sm font-medium">{f.name}</span>
                      <span className="text-slate-500 text-xs">({f.weight}% weight)</span>
                    </div>
                    <span className="text-slate-400 text-sm">{f.score}/{f.maxScore}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-700">
                    <div
                      className="h-2 rounded-full bg-lime-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-slate-500 text-xs pl-6">{f.details}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dealer vs Collector comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl bg-slate-800 border border-slate-700 p-6">
            <h4 className="text-slate-100 font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              Collector Indicators
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { text: 'Personal enjoyment motivation', met: true },
                { text: 'Long holding periods (>1 year)', met: true },
                { text: 'Selective, curated purchases', met: true },
                { text: 'Limited selling frequency', met: false },
                { text: 'No business entity or EIN', met: true },
                { text: 'No advertising or marketing', met: true },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  {item.met ? (
                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-600 shrink-0" />
                  )}
                  <span className={item.met ? 'text-slate-300' : 'text-slate-600'}>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-slate-800 border border-slate-700 p-6">
            <h4 className="text-slate-100 font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-400" />
              Dealer Indicators
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { text: 'Regular and continuous sales', met: true },
                { text: 'Quick-flip inventory pattern', met: true },
                { text: 'Multiple sales platforms', met: true },
                { text: 'High transaction volume', met: true },
                { text: 'Profit-driven acquisition strategy', met: true },
                { text: 'Show/booth participation', met: true },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  {item.met ? (
                    <CheckCircle className="w-4 h-4 text-orange-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-600 shrink-0" />
                  )}
                  <span className={item.met ? 'text-slate-300' : 'text-slate-600'}>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // TAB: 1099-K Tracker
  // -----------------------------------------------------------------------

  function render1099KTracker() {
    const totalGross = thresholds.reduce((s, t) => s + t.grossSales, 0);
    const totalCount = thresholds.reduce((s, t) => s + t.transactionCount, 0);
    const platformsTriggered = thresholds.filter((t) => t.will1099BeIssued).length;

    return (
      <div className="space-y-6">
        {/* Summary banner */}
        <div className="rounded-xl bg-slate-800 border border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <h3 className="text-slate-100 font-semibold">1099-K Reporting Threshold</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-slate-500 text-xs">Current Threshold (2026)</p>
              <p className="text-xl font-bold text-slate-100">$600</p>
              <p className="text-slate-500 text-xs mt-1">Per platform, no transaction minimum</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Your Total Gross Sales</p>
              <p className="text-xl font-bold text-lime-400">{formatCurrency(totalGross)}</p>
              <p className="text-slate-500 text-xs mt-1">{totalCount} transactions across {thresholds.length} platforms</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Platforms Triggering 1099-K</p>
              <p className="text-xl font-bold text-yellow-400">{platformsTriggered} of {thresholds.length}</p>
              <p className="text-slate-500 text-xs mt-1">Expect {platformsTriggered} form(s) at year-end</p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-yellow-900/20 border border-yellow-500/20 text-yellow-400 text-xs flex items-start gap-2">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              The IRS requires platforms to report gross sales exceeding $600. This reports <strong>gross proceeds</strong>, not profit. You are only taxed on your actual gain (sale price minus cost basis).
            </span>
          </div>
        </div>

        {/* Platform cards */}
        <div className="space-y-4">
          {thresholds
            .sort((a, b) => b.grossSales - a.grossSales)
            .map((t) => {
              const barWidth = Math.min(100, t.percentToThreshold);
              const barColor = t.will1099BeIssued ? 'bg-yellow-500' : 'bg-lime-500';
              return (
                <div key={t.platform} className="rounded-xl bg-slate-800 border border-slate-700 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-100 font-semibold">{t.platform}</span>
                      {t.will1099BeIssued ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-900/40 text-yellow-400 border border-yellow-500/30">
                          1099-K Expected
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">
                          Below Threshold
                        </span>
                      )}
                    </div>
                    <span className="text-slate-200 font-bold">{formatCurrency(t.grossSales)}</span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-slate-700 mb-2">
                    <div
                      className={`h-3 rounded-full transition-all ${barColor}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{t.transactionCount} transactions</span>
                    <span>
                      {t.percentToThreshold >= 100
                        ? `${formatPercent(t.percentToThreshold)} of $600 threshold`
                        : `${formatCurrency(600 - t.grossSales)} until threshold`}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Projected year-end gross:</span>
                    <span className="text-slate-300 font-medium">{formatCurrency(t.projectedYearEnd)}</span>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Old threshold reference */}
        <div className="rounded-xl bg-slate-800 border border-slate-700 p-6">
          <h4 className="text-slate-100 font-semibold mb-2">Legacy Threshold Reference</h4>
          <p className="text-slate-500 text-sm mb-4">
            Prior to 2024, the 1099-K threshold was $20,000 AND 200+ transactions. Some states still use higher thresholds.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-slate-900 border border-slate-700">
              <p className="text-slate-400 text-xs mb-1">Old Federal Threshold</p>
              <p className="text-slate-200 font-bold">$20,000 + 200 transactions</p>
              <div className="mt-2 w-full h-2 rounded-full bg-slate-700">
                <div
                  className="h-2 rounded-full bg-slate-500"
                  style={{ width: `${Math.min(100, Math.round((totalGross / 20000) * 100))}%` }}
                />
              </div>
              <p className="text-slate-500 text-xs mt-1">
                {formatPercent(Math.min(100, (totalGross / 20000) * 100))} of amount, {totalCount}/200 transactions
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-900 border border-slate-700">
              <p className="text-slate-400 text-xs mb-1">Current Federal Threshold</p>
              <p className="text-lime-400 font-bold">$600 (no transaction minimum)</p>
              <div className="mt-2 w-full h-2 rounded-full bg-slate-700">
                <div
                  className="h-2 rounded-full bg-lime-500"
                  style={{ width: '100%' }}
                />
              </div>
              <p className="text-slate-500 text-xs mt-1">Total gross {formatCurrency(totalGross)} exceeds threshold</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // TAB: Quarterly Estimates
  // -----------------------------------------------------------------------

  function renderQuarterlyEstimates() {
    const totalDue = quarterlyEstimates.reduce((s, q) => s + q.totalDue, 0);
    const totalPaid = quarterlyEstimates.reduce((s, q) => s + q.paidAmount, 0);

    return (
      <div className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Estimated Tax" value={formatCurrency(totalDue)} sub="Federal + SE Tax" icon={DollarSign} accent />
          <StatCard label="Total Paid" value={formatCurrency(totalPaid)} sub={`${totalDue - totalPaid > 0 ? formatCurrency(totalDue - totalPaid) + ' remaining' : 'All caught up'}`} icon={CheckCircle} />
          <StatCard label="Next Due Date" value={quarterlyEstimates.find((q) => q.status === 'current')?.dueDate ?? 'N/A'} sub="IRS Form 1040-ES" icon={Clock} />
        </div>

        {/* Bar chart */}
        <div className="rounded-xl bg-slate-800 border border-slate-700 p-6">
          <h3 className="text-slate-100 font-semibold mb-4">Quarterly Tax Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quarterBarData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#475569' }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#475569' }} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="Estimated Tax" fill="#84cc16" radius={[4, 4, 0, 0]} />
                <Bar dataKey="SE Tax" fill="#a78bfa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quarter cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quarterlyEstimates.map((q) => {
            const badge = STATUS_BADGE[q.status];
            return (
              <div key={q.quarter} className="rounded-xl bg-slate-800 border border-slate-700 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-100 text-lg font-bold">{q.quarter}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                      {badge.label}
                    </span>
                  </div>
                  <span className="text-slate-400 text-sm">{q.dueDate}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estimated Income</span>
                    <span className="text-slate-200">{formatCurrency(q.estimatedIncome)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Income Tax (24%)</span>
                    <span className="text-slate-200">{formatCurrency(q.estimatedTax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Self-Employment Tax</span>
                    <span className="text-slate-200">{formatCurrency(q.selfEmploymentTax)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-700 pt-2 mt-2">
                    <span className="text-slate-100 font-semibold">Total Due</span>
                    <span className="text-lime-400 font-bold">{formatCurrency(q.totalDue)}</span>
                  </div>
                </div>
                {q.status === 'current' && (
                  <div className="mt-4 p-3 rounded-lg bg-lime-900/20 border border-lime-500/20 text-lime-400 text-xs flex items-center gap-2">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>Payment due in {Math.max(0, Math.ceil((new Date(q.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // TAB: Recommendations
  // -----------------------------------------------------------------------

  function renderRecommendations() {
    const compC = scheduleComparison.find((s) => s.schedule === 'C')!;
    const compD = scheduleComparison.find((s) => s.schedule === 'D')!;
    const savings = compC.totalTax - compD.totalTax;
    const better = savings > 0 ? 'D' : 'C';

    return (
      <div className="space-y-6">
        {/* Schedule comparison */}
        <div className="rounded-xl bg-slate-800 border border-slate-700 p-6">
          <h3 className="text-slate-100 font-semibold mb-2">Schedule C vs. Schedule D Comparison</h3>
          <p className="text-slate-500 text-sm mb-5">
            Based on your current transaction data, here is how your tax liability compares under each filing approach.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scheduleComparison.map((sc) => {
              const isBetter = sc.schedule === better;
              return (
                <div
                  key={sc.schedule}
                  className={`rounded-xl border p-5 ${
                    isBetter
                      ? 'bg-lime-900/10 border-lime-500/30'
                      : 'bg-slate-900 border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-slate-100 font-semibold">{sc.label}</h4>
                    {isBetter && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-lime-900/40 text-lime-400 border border-lime-500/30">
                        Recommended
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Taxable Income</span>
                      <span className="text-slate-200">{formatCurrency(sc.taxableIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Income Tax</span>
                      <span className="text-slate-200">{formatCurrency(sc.estimatedTax)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Self-Employment Tax</span>
                      <span className="text-slate-200">{formatCurrency(sc.selfEmploymentTax)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-700 pt-2">
                      <span className="text-slate-100 font-semibold">Total Tax</span>
                      <span className={`font-bold ${isBetter ? 'text-lime-400' : 'text-slate-200'}`}>
                        {formatCurrency(sc.totalTax)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Net After Tax</span>
                      <span className="text-slate-200">{formatCurrency(sc.netAfterTax)}</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-slate-400 text-xs font-medium mb-2">Allowed Deductions</p>
                    <ul className="space-y-1">
                      {sc.allowedDeductions.map((d, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-xs text-slate-300">
                          <CheckCircle className="w-3 h-3 text-lime-400 shrink-0" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-medium mb-2">Limitations</p>
                    <ul className="space-y-1">
                      {sc.limitations.map((l, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
                          <AlertTriangle className="w-3 h-3 text-yellow-500 shrink-0" />
                          {l}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
          {Math.abs(savings) > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-lime-900/20 border border-lime-500/20 text-lime-400 text-sm flex items-center gap-2">
              <DollarSign className="w-5 h-5 shrink-0" />
              <span>
                Filing Schedule {better} saves you an estimated <strong>{formatCurrency(Math.abs(savings))}</strong> compared to Schedule {better === 'C' ? 'D' : 'C'}.
              </span>
            </div>
          )}
        </div>

        {/* Actionable recommendations */}
        <div className="rounded-xl bg-slate-800 border border-slate-700 p-6">
          <h3 className="text-slate-100 font-semibold mb-5">Actionable Tax Recommendations</h3>
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className={`rounded-xl border p-5 ${PRIORITY_STYLES[rec.priority]}`}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wide opacity-70">
                      {rec.priority} priority
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800/60">{rec.category}</span>
                  </div>
                  {rec.potentialSavings > 0 && (
                    <span className="text-sm font-semibold whitespace-nowrap">
                      Save {formatCurrency(rec.potentialSavings)}
                    </span>
                  )}
                </div>
                <h4 className="text-slate-100 font-semibold mb-1">{rec.title}</h4>
                <p className="text-sm opacity-80 mb-3">{rec.description}</p>
                <div className="flex items-center gap-2 text-sm">
                  <ArrowRight className="w-4 h-4 shrink-0" />
                  <span className="font-medium">{rec.action}</span>
                </div>
                {rec.deadline && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs opacity-60">
                    <Clock className="w-3 h-3" />
                    <span>Deadline: {rec.deadline}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Inventory method note */}
        <div className="rounded-xl bg-slate-800 border border-slate-700 p-6">
          <h3 className="text-slate-100 font-semibold mb-3 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-400" />
            Inventory Cost Basis Methods
          </h3>
          <p className="text-slate-500 text-sm mb-4">
            If classified as a dealer, you must choose an inventory method for cost basis. Your current selection:{' '}
            <span className="text-lime-400 font-semibold">Specific Identification</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                method: 'FIFO',
                label: 'First In, First Out',
                desc: 'Sell oldest inventory first. Simple but may result in higher gains during rising markets.',
                active: false,
              },
              {
                method: 'LIFO',
                label: 'Last In, First Out',
                desc: 'Sell newest inventory first. Can reduce taxable gains when costs are rising.',
                active: false,
              },
              {
                method: 'Specific ID',
                label: 'Specific Identification',
                desc: 'Choose exactly which card/lot you are selling. Most flexible, requires detailed records.',
                active: true,
              },
            ].map((m) => (
              <div
                key={m.method}
                className={`rounded-lg border p-4 ${
                  m.active ? 'bg-lime-900/10 border-lime-500/30' : 'bg-slate-900 border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CircleDot className={`w-4 h-4 ${m.active ? 'text-lime-400' : 'text-slate-600'}`} />
                  <span className={`text-sm font-semibold ${m.active ? 'text-lime-400' : 'text-slate-400'}`}>
                    {m.method}
                  </span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Layout
  // -----------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-lime-500/10 border border-lime-500/20">
              <Calculator className="w-6 h-6 text-lime-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Hobby Income Tax Autopilot</h1>
              <p className="text-slate-400 text-sm">
                Auto-classify income, track 1099-K thresholds, and get personalized tax recommendations
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 mb-8 p-1 rounded-xl bg-slate-800 border border-slate-700 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-lime-500/20 text-lime-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'Tax Dashboard' && renderDashboard()}
        {activeTab === 'Classification' && renderClassification()}
        {activeTab === '1099-K Tracker' && render1099KTracker()}
        {activeTab === 'Quarterly Estimates' && renderQuarterlyEstimates()}
        {activeTab === 'Recommendations' && renderRecommendations()}
      </div>
    </div>
  );
};

export default TaxAutopilot;
