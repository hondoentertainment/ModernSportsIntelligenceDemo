import React, { useMemo, useState } from 'react';
import {
  Shield,
  Users,
  ShieldCheck,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  CircleDot,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  getEstatePlan,
  getBeneficiaries,
  getInsuranceRecords,
  getEstateValuation,
  getDocumentChecklist,
  DocumentStatus,
} from '../lib/estatePlanningService';

const PIE_COLORS = ['#84cc16', '#22d3ee', '#f59e0b', '#a78bfa'];

const STATUS_CONFIG: Record<DocumentStatus, { icon: React.ReactNode; color: string; label: string; bg: string }> = {
  complete: {
    icon: <CheckCircle2 size={16} />,
    color: 'text-emerald-400',
    label: 'Complete',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  pending: {
    icon: <Clock size={16} />,
    color: 'text-yellow-400',
    label: 'Pending',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
  },
  expired: {
    icon: <AlertTriangle size={16} />,
    color: 'text-red-400',
    label: 'Expired',
    bg: 'bg-red-500/10 border-red-500/20',
  },
  not_started: {
    icon: <CircleDot size={16} />,
    color: 'text-slate-500',
    label: 'Not Started',
    bg: 'bg-slate-500/10 border-slate-500/20',
  },
};

const EstatePlanning: React.FC = () => {
  const plan = useMemo(() => getEstatePlan(), []);
  const beneficiaries = useMemo(() => getBeneficiaries(), []);
  const insurance = useMemo(() => getInsuranceRecords(), []);
  const valuation = useMemo(() => getEstateValuation(), []);
  const checklist = useMemo(() => getDocumentChecklist(), []);

  const [expandedBen, setExpandedBen] = useState<string | null>(null);

  const totalCoverage = insurance.reduce((s, r) => s + r.coverage, 0);
  const totalPremium = insurance.reduce((s, r) => s + r.premium, 0);
  const completedDocs = checklist.filter((d) => d.status === 'complete').length;

  const pieData = beneficiaries.map((b) => ({
    name: b.name.split(' ')[0],
    value: b.allocationPercent,
  }));

  const formatCurrency = (val: number) =>
    '$' + val.toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-lime-500/10 border border-lime-500/20 rounded-full mb-2">
            <Shield size={12} className="text-lime-400" />
            <span className="text-[10px] font-black text-lime-400 uppercase tracking-widest">
              Plan {plan.status === 'active' ? 'Active' : plan.status}
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-none">
            Estate <span className="text-lime-400">Planning</span>
          </h1>
          <p className="text-slate-400 max-w-2xl">
            Document, protect, and plan the transfer of your card collection for future generations.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Last Updated</p>
          <p className="text-sm text-slate-300">
            {new Date(plan.lastUpdated).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Value Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign size={16} className="text-lime-400" />
            <span className="text-xs text-slate-400 font-medium">Estate Value</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(valuation.currentTotal)}</p>
          <span
            className={`text-xs font-medium ${
              valuation.changePercent30d >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {valuation.changePercent30d >= 0 ? '+' : ''}
            {valuation.changePercent30d.toFixed(1)}% (30d)
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span className="text-xs text-slate-400 font-medium">Insurance Coverage</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalCoverage)}</p>
          <span className="text-xs text-slate-400">
            {formatCurrency(totalPremium)}/yr premium
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-cyan-400" />
            <span className="text-xs text-slate-400 font-medium">Beneficiaries</span>
          </div>
          <p className="text-2xl font-bold text-white">{beneficiaries.length}</p>
          <span className="text-xs text-slate-400">
            {beneficiaries.reduce((s, b) => s + b.assignedCards.length, 0)} cards assigned
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={16} className="text-amber-400" />
            <span className="text-xs text-slate-400 font-medium">Documents</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {completedDocs}/{checklist.length}
          </p>
          <span className="text-xs text-slate-400">checklist items complete</span>
        </div>
      </div>

      {/* Beneficiary Allocation Chart + List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Allocation by Beneficiary</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                dataKey="value"
                stroke="none"
                paddingAngle={2}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f1f5f9',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`${value}%`, 'Allocation']}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => (
                  <span className="text-xs text-slate-300">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Beneficiary Cards */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-white">Beneficiary Details</h2>
          {beneficiaries.map((ben, idx) => {
            const benValue = ben.assignedCards.reduce((s, c) => s + c.estimatedValue, 0);
            const isExpanded = expandedBen === ben.id;

            return (
              <div
                key={ben.id}
                className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedBen(isExpanded ? null : ben.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-slate-900"
                      style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                    >
                      {ben.allocationPercent}%
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{ben.name}</p>
                      <p className="text-xs text-slate-400">{ben.relationship}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{formatCurrency(benValue)}</p>
                    <p className="text-xs text-slate-500">
                      {ben.assignedCards.length} card{ben.assignedCards.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-800 p-4">
                    <div className="space-y-2">
                      {ben.assignedCards.map((card) => (
                        <div
                          key={card.id}
                          className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg"
                        >
                          <div>
                            <p className="text-sm text-white">
                              {card.year} {card.playerName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {card.set} &middot; {card.grade}
                            </p>
                          </div>
                          <p className="text-sm font-medium text-emerald-400">
                            {formatCurrency(card.estimatedValue)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Insurance Records */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <ShieldCheck size={18} className="text-emerald-400" />
          <h2 className="text-sm font-semibold text-white">Insurance Records</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="pb-3 text-xs font-medium text-slate-500">Provider</th>
                <th className="pb-3 text-xs font-medium text-slate-500">Policy #</th>
                <th className="pb-3 text-xs font-medium text-slate-500 text-right">Coverage</th>
                <th className="pb-3 text-xs font-medium text-slate-500 text-right">Premium</th>
                <th className="pb-3 text-xs font-medium text-slate-500 text-right">Expires</th>
                <th className="pb-3 text-xs font-medium text-slate-500 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {insurance.map((rec) => {
                const expires = new Date(rec.expiresAt);
                const now = new Date();
                const daysLeft = Math.ceil(
                  (expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                );
                const isExpiringSoon = daysLeft > 0 && daysLeft <= 90;
                const isExpired = daysLeft <= 0;

                return (
                  <tr key={rec.id}>
                    <td className="py-3 text-sm text-white">{rec.provider}</td>
                    <td className="py-3 text-sm text-slate-400 font-mono text-xs">
                      {rec.policyNumber}
                    </td>
                    <td className="py-3 text-sm text-white text-right font-medium">
                      {formatCurrency(rec.coverage)}
                    </td>
                    <td className="py-3 text-sm text-slate-300 text-right">
                      {formatCurrency(rec.premium)}/yr
                    </td>
                    <td className="py-3 text-sm text-slate-300 text-right">
                      {expires.toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      {isExpired ? (
                        <span className="text-xs font-medium text-red-400 bg-red-500/10 px-2 py-1 rounded">
                          Expired
                        </span>
                      ) : isExpiringSoon ? (
                        <span className="text-xs font-medium text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded">
                          {daysLeft}d left
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                          Active
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Total coverage: {formatCurrency(totalCoverage)}
          </span>
          <span
            className={`text-xs font-medium ${
              totalCoverage >= valuation.currentTotal ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {totalCoverage >= valuation.currentTotal
              ? 'Collection fully covered'
              : `Coverage gap: ${formatCurrency(valuation.currentTotal - totalCoverage)}`}
          </span>
        </div>
      </div>

      {/* Document Checklist */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-amber-400" />
            <h2 className="text-sm font-semibold text-white">Document Checklist</h2>
          </div>
          <span className="text-xs text-slate-400">
            {completedDocs} of {checklist.length} complete
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${(completedDocs / checklist.length) * 100}%` }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {checklist.map((item) => {
            const cfg = STATUS_CONFIG[item.status];
            return (
              <div
                key={item.id}
                className={`flex items-start gap-3 p-4 rounded-xl border ${cfg.bg}`}
              >
                <span className={`mt-0.5 ${cfg.color}`}>{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                  {item.completedAt && item.status === 'complete' && (
                    <p className="text-xs text-emerald-400/60 mt-1">
                      Completed {new Date(item.completedAt).toLocaleDateString()}
                    </p>
                  )}
                  {item.expiresAt && item.status === 'expired' && (
                    <p className="text-xs text-red-400/60 mt-1">
                      Expired {new Date(item.expiresAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Valuation History Chart */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp size={18} className="text-lime-400" />
          <h2 className="text-sm font-semibold text-white">Valuation History</h2>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={valuation.history}>
            <XAxis
              dataKey="date"
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#f1f5f9',
                fontSize: '12px',
              }}
              formatter={(value: number, name: string) => [
                formatCurrency(value),
                name === 'totalValue' ? 'Collection Value' : 'Insured Value',
              ]}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={8}
              formatter={(value: string) => (
                <span className="text-xs text-slate-400">
                  {value === 'totalValue' ? 'Collection Value' : 'Insured Value'}
                </span>
              )}
            />
            <Line
              type="monotone"
              dataKey="totalValue"
              stroke="#84cc16"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#84cc16' }}
            />
            <Line
              type="monotone"
              dataKey="insuredValue"
              stroke="#22d3ee"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              activeDot={{ r: 4, fill: '#22d3ee' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EstatePlanning;
