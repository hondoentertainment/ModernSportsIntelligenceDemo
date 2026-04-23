// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  Shield,
  AlertTriangle,
  DollarSign,
  FileText,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  TrendingUp,
  Lock,
  MapPin,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  getInsuredItems,
  getCoverageGaps,
  getInsuranceReport,
  getClaimHistory,
  getExpiringPolicies,
  formatCurrency,
  getCoverageColor,
  getRiskColor,
  getPriorityColor,
  type InsuredItem,
  type CoverageGap,
  type ClaimHistory,
  type InsuranceReport,
} from '../lib/core/insuranceVaultService';

type TabKey = 'overview' | 'gaps' | 'claims' | 'reports';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'overview', label: 'Vault Overview', icon: <Shield className="w-4 h-4" /> },
  { key: 'gaps', label: 'Coverage Gaps', icon: <AlertTriangle className="w-4 h-4" /> },
  { key: 'claims', label: 'Claims', icon: <FileText className="w-4 h-4" /> },
  { key: 'reports', label: 'Reports', icon: <BarChart3 className="w-4 h-4" /> },
];

const PIE_COLORS = ['#a78bfa', '#60a5fa', '#9ca3af', '#34d399'];

function StatCard({ label, value, icon, sub }: { label: string; value: string; icon: React.ReactNode; sub?: string }) {
  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function VaultOverview({ items, expiring }: { items: InsuredItem[]; expiring: InsuredItem[] }) {
  return (
    <div className="space-y-6">
      {expiring.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 text-yellow-400 font-semibold mb-2">
            <Clock className="w-5 h-5" />
            Appraisals Due Soon ({expiring.length})
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {expiring.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-slate-300 bg-slate-800/50 rounded-lg px-3 py-2">
                <span className="truncate mr-2">{item.cardName}</span>
                <span className="text-yellow-400 whitespace-nowrap">
                  {daysUntil(item.nextAppraisalDue)} days
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const appraisalDays = daysUntil(item.nextAppraisalDue);
          return (
            <div key={item.id} className="bg-slate-800 rounded-xl border border-slate-700 p-4 hover:border-slate-600 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm truncate">{item.cardName}</h3>
                  <p className="text-slate-400 text-xs">{item.player} &middot; {item.sport}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${getCoverageColor(item.coverageType)}`}>
                  {item.coverageType}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <div className="text-slate-500 text-xs">Insured Value</div>
                  <div className="text-white font-medium">{formatCurrency(item.insuredValue)}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs">Market Value</div>
                  <div className="text-emerald-400 font-medium">{formatCurrency(item.currentMarketValue)}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs">Premium/yr</div>
                  <div className="text-blue-400">{formatCurrency(item.premium)}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs">Deductible</div>
                  <div className="text-slate-300">{formatCurrency(item.deductible)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs border-t border-slate-700 pt-2">
                <div className="flex items-center gap-1">
                  <AlertTriangle className={`w-3 h-3 ${getRiskColor(item.riskScore)}`} />
                  <span className={getRiskColor(item.riskScore)}>Risk: {item.riskScore}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate max-w-[100px]">{item.storageLocation}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span className={appraisalDays <= 30 ? 'text-yellow-400' : ''}>
                    {appraisalDays}d
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CoverageGapsTab({ gaps }: { gaps: CoverageGap[] }) {
  if (gaps.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl p-8 text-center">
        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
        <h3 className="text-white text-lg font-semibold">All Items Fully Covered</h3>
        <p className="text-slate-400 mt-1">No coverage gaps detected in your collection.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Coverage Gap Analysis ({gaps.length} items under-insured)
          </h3>
        </div>
        <div className="divide-y divide-slate-700">
          {gaps.map((gap) => (
            <div key={gap.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">{gap.cardName}</div>
                <div className="flex gap-4 text-xs text-slate-400 mt-1">
                  <span>Current: {formatCurrency(gap.currentCoverage)}</span>
                  <span>Recommended: {formatCurrency(gap.recommendedCoverage)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-red-400 font-semibold text-sm">
                    -{formatCurrency(gap.gap)}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(gap.priority)}`}>
                  {gap.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <h3 className="text-white font-semibold mb-4">Gap Distribution by Priority</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          {(['high', 'medium', 'low'] as const).map((p) => {
            const count = gaps.filter((g) => g.priority === p).length;
            const total = gaps.filter((g) => g.priority === p).reduce((s, g) => s + g.gap, 0);
            return (
              <div key={p} className="bg-slate-900 rounded-lg p-3">
                <div className={`text-lg font-bold ${getPriorityColor(p).split(' ')[0]}`}>{count}</div>
                <div className="text-slate-400 text-xs capitalize">{p} Priority</div>
                <div className="text-slate-500 text-xs mt-1">{formatCurrency(total)} gap</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function statusIcon(status: ClaimHistory['status']) {
  switch (status) {
    case 'approved':
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    case 'denied':
      return <XCircle className="w-4 h-4 text-red-400" />;
    case 'reviewing':
      return <Eye className="w-4 h-4 text-yellow-400" />;
    case 'filed':
      return <FileText className="w-4 h-4 text-blue-400" />;
  }
}

function statusColor(status: ClaimHistory['status']): string {
  switch (status) {
    case 'approved':
      return 'text-green-400 bg-green-400/10';
    case 'denied':
      return 'text-red-400 bg-red-400/10';
    case 'reviewing':
      return 'text-yellow-400 bg-yellow-400/10';
    case 'filed':
      return 'text-blue-400 bg-blue-400/10';
  }
}

function ClaimsTab({ claims }: { claims: ClaimHistory[] }) {
  const sorted = useMemo(
    () => [...claims].sort((a, b) => new Date(b.filedDate).getTime() - new Date(a.filedDate).getTime()),
    [claims]
  );

  return (
    <div className="space-y-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Claims Timeline
          </h3>
        </div>
        {sorted.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No claims filed yet.</div>
        ) : (
          <div className="divide-y divide-slate-700">
            {sorted.map((claim) => (
              <div key={claim.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{statusIcon(claim.status)}</div>
                  <div>
                    <div className="text-white text-sm font-medium">{claim.cardName}</div>
                    <div className="text-slate-400 text-xs mt-0.5">
                      {claim.claimType.charAt(0).toUpperCase() + claim.claimType.slice(1)} &middot; Filed {claim.filedDate}
                      {claim.resolvedDate && ` &middot; Resolved ${claim.resolvedDate}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-white font-semibold text-sm">{formatCurrency(claim.amount)}</div>
                  <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusColor(claim.status)}`}>
                    {claim.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReportsTab({ report, items }: { report: InsuranceReport; items: InsuredItem[] }) {
  const coverageData = useMemo(() => {
    const counts = { collector: 0, premium: 0, basic: 0 };
    items.forEach((i) => counts[i.coverageType]++);
    return [
      { name: 'Collector', value: counts.collector },
      { name: 'Premium', value: counts.premium },
      { name: 'Basic', value: counts.basic },
    ].filter((d) => d.value > 0);
  }, [items]);

  const premiumData = useMemo(() => {
    const counts: Record<string, number> = { collector: 0, premium: 0, basic: 0 };
    items.forEach((i) => (counts[i.coverageType] += i.premium));
    return [
      { name: 'Collector', value: counts.collector },
      { name: 'Premium', value: counts.premium },
      { name: 'Basic', value: counts.basic },
    ].filter((d) => d.value > 0);
  }, [items]);

  const sportData = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach((i) => (map[i.sport] = (map[i.sport] || 0) + i.insuredValue));
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [items]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <h3 className="text-white font-semibold mb-4">Coverage Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={coverageData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {coverageData.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <h3 className="text-white font-semibold mb-4">Insurance Cost Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={premiumData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${formatCurrency(value)}`}>
                {premiumData.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <h3 className="text-white font-semibold mb-4">Insured Value by Sport</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={sportData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
            <Bar dataKey="value" fill="#60a5fa" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <h3 className="text-white font-semibold mb-3">Report Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-slate-400">Total Insured Value</div>
            <div className="text-white font-semibold">{formatCurrency(report.totalInsuredValue)}</div>
          </div>
          <div>
            <div className="text-slate-400">Annual Premiums</div>
            <div className="text-white font-semibold">{formatCurrency(report.totalPremiums)}</div>
          </div>
          <div>
            <div className="text-slate-400">Coverage Ratio</div>
            <div className="text-white font-semibold">{report.coverageRatio}%</div>
          </div>
          <div>
            <div className="text-slate-400">Avg Risk Score</div>
            <div className="text-white font-semibold">{report.avgRiskScore}</div>
          </div>
          <div>
            <div className="text-slate-400">Coverage Gaps</div>
            <div className="text-white font-semibold">{report.gapCount}</div>
          </div>
          <div>
            <div className="text-slate-400">Last Updated</div>
            <div className="text-white font-semibold">{new Date(report.lastUpdated).toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InsuranceVault() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const items = useMemo(() => getInsuredItems(), []);
  const gaps = useMemo(() => getCoverageGaps(), []);
  const report = useMemo(() => getInsuranceReport(), []);
  const claims = useMemo(() => getClaimHistory(), []);
  const expiring = useMemo(() => getExpiringPolicies(), []);

  const claimsFiled = claims.length;
  const itemsAtRisk = items.filter((i) => i.riskScore >= 50).length;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold">Collection Insurance Vault</h1>
            <p className="text-slate-400 text-sm">Protect and insure your high-value sports card collection</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard
            label="Total Insured Value"
            value={formatCurrency(report.totalInsuredValue)}
            icon={<Lock className="w-4 h-4" />}
          />
          <StatCard
            label="Annual Premiums"
            value={formatCurrency(report.totalPremiums)}
            icon={<DollarSign className="w-4 h-4" />}
          />
          <StatCard
            label="Coverage Ratio"
            value={`${report.coverageRatio}%`}
            icon={<TrendingUp className="w-4 h-4" />}
          />
          <StatCard
            label="Items at Risk"
            value={String(itemsAtRisk)}
            icon={<AlertTriangle className="w-4 h-4" />}
            sub={`of ${items.length} insured`}
          />
          <StatCard
            label="Claims Filed"
            value={String(claimsFiled)}
            icon={<FileText className="w-4 h-4" />}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <VaultOverview items={items} expiring={expiring} />}
        {activeTab === 'gaps' && <CoverageGapsTab gaps={gaps} />}
        {activeTab === 'claims' && <ClaimsTab claims={claims} />}
        {activeTab === 'reports' && <ReportsTab report={report} items={items} />}
      </div>
    </div>
  );
}
