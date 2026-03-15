import React, { useMemo, useState, useCallback } from 'react';
import {
  X,
  Shield,
  Plus,
  Trash2,
  Edit3,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  ShieldAlert,
  CalendarClock,
  Tag,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { CardInventory, Sport } from '../types';
import {
  InsurancePolicy,
  InsuranceClaim,
  CoverageGap,
  RiderRecommendation,
  getPolicies,
  addPolicy,
  updatePolicy,
  deletePolicy,
  analyzeCoverageGaps,
  estimatePremium,
  getRiderRecommendations,
  getRenewalReminders,
  getClaims,
  addClaim,
  getCoverageHistory,
  ensureSampleData,
} from '../lib/insurancePolicyService';

interface InsurancePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardInventory[];
}

type TabId = 'policies' | 'coverage' | 'premium' | 'claims' | 'riders';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'policies', label: 'Policies', icon: <FileText size={16} /> },
  { id: 'coverage', label: 'Coverage', icon: <ShieldAlert size={16} /> },
  { id: 'premium', label: 'Premium', icon: <DollarSign size={16} /> },
  { id: 'claims', label: 'Claims', icon: <Tag size={16} /> },
  { id: 'riders', label: 'Riders', icon: <Shield size={16} /> },
];

const _SPORTS_OPTIONS: Sport[] = ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'];

// ---- Policies Tab ----

const PoliciesTab: React.FC<{
  policies: InsurancePolicy[];
  onRefresh: () => void;
}> = ({ policies, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<InsurancePolicy | null>(null);
  const [form, setForm] = useState({
    provider: '',
    policyNumber: '',
    coverageAmount: '',
    premium: '',
    deductible: '',
    startDate: '',
    endDate: '',
    type: 'blanket' as InsurancePolicy['type'],
    notes: '',
  });

  const openAdd = () => {
    setEditingPolicy(null);
    setForm({
      provider: '',
      policyNumber: '',
      coverageAmount: '',
      premium: '',
      deductible: '',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      type: 'blanket',
      notes: '',
    });
    setShowForm(true);
  };

  const openEdit = (policy: InsurancePolicy) => {
    setEditingPolicy(policy);
    setForm({
      provider: policy.provider,
      policyNumber: policy.policyNumber,
      coverageAmount: String(policy.coverageAmount),
      premium: String(policy.premium),
      deductible: String(policy.deductible),
      startDate: policy.startDate,
      endDate: policy.endDate,
      type: policy.type,
      notes: policy.notes ?? '',
    });
    setShowForm(true);
  };

  const handleSave = () => {
    const now = new Date().toISOString();
    const endDate = new Date(form.endDate);
    const status: InsurancePolicy['status'] = endDate < new Date() ? 'expired' : 'active';

    if (editingPolicy) {
      updatePolicy({
        ...editingPolicy,
        provider: form.provider,
        policyNumber: form.policyNumber,
        coverageAmount: parseFloat(form.coverageAmount) || 0,
        premium: parseFloat(form.premium) || 0,
        deductible: parseFloat(form.deductible) || 0,
        startDate: form.startDate,
        endDate: form.endDate,
        type: form.type,
        status,
        notes: form.notes || undefined,
        updatedAt: now,
      });
    } else {
      addPolicy({
        id: `pol_${Date.now()}`,
        provider: form.provider,
        policyNumber: form.policyNumber,
        coverageAmount: parseFloat(form.coverageAmount) || 0,
        premium: parseFloat(form.premium) || 0,
        deductible: parseFloat(form.deductible) || 0,
        startDate: form.startDate,
        endDate: form.endDate,
        type: form.type,
        status,
        notes: form.notes || undefined,
        createdAt: now,
        updatedAt: now,
      });
    }
    setShowForm(false);
    onRefresh();
  };

  const handleDelete = (id: string) => {
    deletePolicy(id);
    onRefresh();
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-500/10 text-green-400 border-green-500/30',
    expired: 'bg-red-500/10 text-red-400 border-red-500/30',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  };

  const typeLabels: Record<string, string> = {
    blanket: 'Blanket',
    scheduled: 'Scheduled',
    rider: 'Rider',
  };

  if (showForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">
            {editingPolicy ? 'Edit Policy' : 'Add New Policy'}
          </h3>
          <button
            onClick={() => setShowForm(false)}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Provider</label>
            <input
              type="text"
              value={form.provider}
              onChange={e => setForm({ ...form, provider: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              placeholder="Insurance provider name"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Policy Number</label>
            <input
              type="text"
              value={form.policyNumber}
              onChange={e => setForm({ ...form, policyNumber: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              placeholder="Policy #"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Coverage Amount ($)</label>
            <input
              type="number"
              value={form.coverageAmount}
              onChange={e => setForm({ ...form, coverageAmount: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              placeholder="25000"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Annual Premium ($)</label>
            <input
              type="number"
              value={form.premium}
              onChange={e => setForm({ ...form, premium: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              placeholder="375"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Deductible ($)</label>
            <input
              type="number"
              value={form.deductible}
              onChange={e => setForm({ ...form, deductible: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              placeholder="250"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Type</label>
            <select
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value as InsurancePolicy['type'] })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="blanket">Blanket</option>
              <option value="scheduled">Scheduled</option>
              <option value="rider">Rider</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Start Date</label>
            <input
              type="date"
              value={form.startDate}
              onChange={e => setForm({ ...form, startDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">End Date</label>
            <input
              type="date"
              value={form.endDate}
              onChange={e => setForm({ ...form, endDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Notes</label>
          <textarea
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
            rows={2}
            placeholder="Optional notes..."
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!form.provider || !form.coverageAmount}
          className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-bold rounded-xl transition-colors"
        >
          {editingPolicy ? 'Update Policy' : 'Add Policy'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          {policies.length} {policies.length === 1 ? 'Policy' : 'Policies'}
        </p>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold rounded-lg border border-blue-500/30 transition-colors"
        >
          <Plus size={14} />
          Add Policy
        </button>
      </div>

      {policies.map(policy => (
        <div
          key={policy.id}
          className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-blue-400" />
              <span className="text-sm font-bold text-white">{policy.provider}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-md border ${statusColors[policy.status]}`}>
                {policy.status}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-md border border-slate-600 text-slate-400">
                {typeLabels[policy.type]}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-500">Policy #</span>
              <p className="text-white font-mono">{policy.policyNumber}</p>
            </div>
            <div>
              <span className="text-slate-500">Coverage</span>
              <p className="text-green-400 font-bold">${policy.coverageAmount.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-slate-500">Premium/yr</span>
              <p className="text-white font-bold">${policy.premium.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-slate-500">Deductible</span>
              <p className="text-white font-bold">${policy.deductible.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-500">
              <CalendarClock size={12} />
              {policy.startDate} to {policy.endDate}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => openEdit(policy)}
                className="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <Edit3 size={14} />
              </button>
              <button
                onClick={() => handleDelete(policy.id)}
                className="p-1.5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {policy.notes && (
            <p className="text-xs text-slate-500 italic">{policy.notes}</p>
          )}
        </div>
      ))}

      {policies.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-sm">
          No policies added yet. Click "Add Policy" to get started.
        </div>
      )}
    </div>
  );
};

// ---- Coverage Tab ----

const CoverageTab: React.FC<{
  gaps: CoverageGap[];
  policies: InsurancePolicy[];
}> = ({ gaps, policies }) => {
  const history = useMemo(() => getCoverageHistory(policies), [policies]);

  const severityColors: Record<string, { text: string; bg: string; border: string }> = {
    critical: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    warning: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    ok: { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  };

  const chartData = gaps.map(g => ({
    name: g.category,
    Covered: Math.round(g.coveredAmount),
    Gap: Math.round(g.gapAmount),
  }));

  return (
    <div className="space-y-6">
      {/* Gap Analysis Chart */}
      <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          Coverage Gap Analysis
        </p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                type="number"
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
                stroke="#475569"
                tick={{ fill: '#64748b', fontSize: 11 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                stroke="#475569"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  border: '1px solid #374151',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
              />
              <Bar dataKey="Covered" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Gap" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gap Details */}
      <div className="space-y-3">
        {gaps.map((gap, i) => {
          const colors = severityColors[gap.severity];
          return (
            <div
              key={i}
              className={`p-4 rounded-xl border ${colors.border} ${colors.bg} flex items-center justify-between`}
            >
              <div className="flex items-center gap-3">
                {gap.severity === 'critical' ? (
                  <AlertTriangle size={16} className={colors.text} />
                ) : gap.severity === 'warning' ? (
                  <AlertTriangle size={16} className={colors.text} />
                ) : (
                  <CheckCircle2 size={16} className={colors.text} />
                )}
                <div>
                  <span className="text-sm font-bold text-white">{gap.category}</span>
                  <p className="text-xs text-slate-400">
                    ${gap.coveredAmount.toLocaleString()} of ${gap.totalValue.toLocaleString()} covered
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-sm font-bold ${colors.text}`}>
                  {gap.gapPercent > 0 ? `-$${gap.gapAmount.toLocaleString()}` : 'Covered'}
                </span>
                <p className={`text-xs ${colors.text}`}>
                  {Math.round(gap.gapPercent)}% gap
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Coverage History Chart */}
      <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          Coverage Ratio Over Time
        </p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="month"
                stroke="#475569"
                tick={{ fill: '#64748b', fontSize: 10 }}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(v: number) => `${v}%`}
                stroke="#475569"
                tick={{ fill: '#64748b', fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  border: '1px solid #374151',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`${value}%`, 'Coverage Ratio']}
              />
              <Line
                type="monotone"
                dataKey="ratio"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ---- Premium Tab ----

const PremiumTab: React.FC<{
  cards: CardInventory[];
}> = ({ cards }) => {
  const totalValue = useMemo(
    () => cards.reduce((s, c) => s + (c.currentValue ?? c.purchasePrice), 0),
    [cards]
  );

  const [customValue, setCustomValue] = useState('');
  const effectiveValue = customValue ? parseFloat(customValue) || 0 : totalValue;
  const estimate = useMemo(() => estimatePremium(effectiveValue), [effectiveValue]);

  const tiers = [
    { label: '$0 - $10K', rate: '2.0%', active: effectiveValue > 0 && effectiveValue <= 10000 },
    { label: '$10K - $50K', rate: '1.5%', active: effectiveValue > 10000 && effectiveValue <= 50000 },
    { label: '$50K+', rate: '1.0%', active: effectiveValue > 50000 },
  ];

  return (
    <div className="space-y-6">
      {/* Value Input */}
      <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-4">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          Premium Calculator
        </p>
        <div className="flex items-center gap-3">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs text-slate-400">Collection Value</label>
            <input
              type="number"
              value={customValue || ''}
              onChange={e => setCustomValue(e.target.value)}
              placeholder={`${totalValue.toLocaleString()} (auto-detected)`}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          {customValue && (
            <button
              onClick={() => setCustomValue('')}
              className="mt-5 px-3 py-2 text-xs text-slate-400 hover:text-white bg-slate-800 border border-slate-700 rounded-xl transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Rate Tiers */}
      <div className="grid grid-cols-3 gap-3">
        {tiers.map((tier, i) => (
          <div
            key={i}
            className={`p-4 rounded-2xl border text-center ${
              tier.active
                ? 'bg-blue-500/10 border-blue-500/30'
                : 'bg-slate-800/50 border-slate-700'
            }`}
          >
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
              {tier.label}
            </p>
            <p className={`text-xl font-bebas tracking-wider ${tier.active ? 'text-blue-400' : 'text-slate-400'}`}>
              {tier.rate}
            </p>
            {tier.active && (
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">
                Your Tier
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Estimate */}
      {effectiveValue > 0 && (
        <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white">Estimated Premium</span>
            <span className="text-xs text-blue-400 font-bold">{estimate.tier}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-slate-800/50 rounded-xl">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Annual</p>
              <p className="text-2xl font-bebas tracking-wider text-green-400">
                ${estimate.annualPremium.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-3 bg-slate-800/50 rounded-xl">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Monthly</p>
              <p className="text-2xl font-bebas tracking-wider text-white">
                ${estimate.monthlyPremium.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Deductible Options */}
          <div className="space-y-2">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
              Deductible Options
            </p>
            {estimate.deductibleOptions.map((opt, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-xs"
              >
                <span className="text-slate-400">
                  ${opt.deductible.toLocaleString()} deductible
                </span>
                <span className="text-white font-bold">
                  ${opt.premium.toLocaleString()}/yr
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ---- Claims Tab ----

const ClaimsTab: React.FC<{
  claims: InsuranceClaim[];
  policies: InsurancePolicy[];
  onRefresh: () => void;
}> = ({ claims, policies, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    policyId: '',
    type: 'damage' as InsuranceClaim['type'],
    description: '',
    claimAmount: '',
  });

  const handleSubmit = () => {
    addClaim({
      id: `clm_${Date.now()}`,
      policyId: form.policyId || policies[0]?.id || '',
      type: form.type,
      description: form.description,
      claimAmount: parseFloat(form.claimAmount) || 0,
      status: 'submitted',
      filedDate: new Date().toISOString().slice(0, 10),
    });
    setShowForm(false);
    setForm({ policyId: '', type: 'damage', description: '', claimAmount: '' });
    onRefresh();
  };

  const statusConfig: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
    submitted: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: <Clock size={12} /> },
    under_review: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: <Clock size={12} /> },
    approved: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', icon: <CheckCircle2 size={12} /> },
    denied: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: <X size={12} /> },
    paid: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', icon: <DollarSign size={12} /> },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          {claims.length} {claims.length === 1 ? 'Claim' : 'Claims'}
        </p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold rounded-lg border border-blue-500/30 transition-colors"
        >
          <Plus size={14} />
          File Claim
        </button>
      </div>

      {showForm && (
        <div className="p-5 bg-slate-800/50 border border-blue-500/30 rounded-2xl space-y-3">
          <h4 className="text-sm font-bold text-white">New Claim</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Policy</label>
              <select
                value={form.policyId}
                onChange={e => setForm({ ...form, policyId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Select policy...</option>
                {policies.map(p => (
                  <option key={p.id} value={p.id}>{p.provider} — {p.policyNumber}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Type</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value as InsuranceClaim['type'] })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="damage">Damage</option>
                <option value="theft">Theft</option>
                <option value="loss">Loss</option>
                <option value="shipping">Shipping</option>
              </select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                rows={2}
                placeholder="Describe the incident..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Claim Amount ($)</label>
              <input
                type="number"
                value={form.claimAmount}
                onChange={e => setForm({ ...form, claimAmount: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                placeholder="500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSubmit}
              disabled={!form.description || !form.claimAmount}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-bold rounded-xl transition-colors"
            >
              Submit Claim
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {claims.map(claim => {
        const config = statusConfig[claim.status];
        return (
          <div
            key={claim.id}
            className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-md bg-slate-700/50 text-slate-300 border border-slate-600">
                  {claim.type}
                </span>
                <span className="text-sm font-bold text-white truncate">
                  {claim.description.length > 60
                    ? claim.description.slice(0, 60) + '...'
                    : claim.description}
                </span>
              </div>
              <span className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-md border ${config.color} ${config.bg} ${config.border}`}>
                {config.icon}
                {claim.status.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500">Filed</span>
                <p className="text-white">{claim.filedDate}</p>
              </div>
              <div>
                <span className="text-slate-500">Amount</span>
                <p className="text-white font-bold">${claim.claimAmount.toLocaleString()}</p>
              </div>
              {claim.payout !== undefined && (
                <div>
                  <span className="text-slate-500">Payout</span>
                  <p className="text-green-400 font-bold">${claim.payout.toLocaleString()}</p>
                </div>
              )}
              {claim.resolvedDate && (
                <div>
                  <span className="text-slate-500">Resolved</span>
                  <p className="text-white">{claim.resolvedDate}</p>
                </div>
              )}
            </div>

            {claim.notes && (
              <p className="text-xs text-slate-500 italic">{claim.notes}</p>
            )}
          </div>
        );
      })}

      {claims.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-sm">
          No claims filed. Click "File Claim" to submit a new claim.
        </div>
      )}
    </div>
  );
};

// ---- Riders Tab ----

const RidersTab: React.FC<{
  recommendations: RiderRecommendation[];
}> = ({ recommendations }) => {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
        <div className="flex items-center gap-2 mb-2">
          <Shield size={16} className="text-blue-400" />
          <span className="text-sm font-bold text-white">Individual Scheduling Recommendations</span>
        </div>
        <p className="text-xs text-slate-400">
          Cards valued over $5,000 should be individually scheduled (listed) on your policy for full replacement coverage.
          Blanket policies may not cover the full value of high-end items.
        </p>
      </div>

      {recommendations.length > 0 ? (
        <div className="space-y-3">
          {recommendations.map(rec => (
            <div
              key={rec.cardId}
              className="p-5 bg-slate-800/50 border border-amber-500/20 rounded-2xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-white">{rec.player}</span>
                  <p className="text-xs text-slate-400 mt-0.5">{rec.reason}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="text-lg font-bebas tracking-wider text-amber-400">
                    ${rec.currentValue.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Current Value</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Suggested Coverage:</span>
                  <span className="text-green-400 font-bold">
                    ${rec.suggestedCoverage.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Est. Rider Cost:</span>
                  <span className="text-white font-bold">
                    ${rec.estimatedRiderCost.toLocaleString()}/yr
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Total Recommended Riders: <span className="text-white font-bold">{recommendations.length}</span>
            </span>
            <span className="text-slate-400">
              Est. Total Cost:{' '}
              <span className="text-green-400 font-bold">
                ${recommendations.reduce((s, r) => s + r.estimatedRiderCost, 0).toLocaleString()}/yr
              </span>
            </span>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500 text-sm">
          No cards currently require individual scheduling. Cards over $5,000 will appear here.
        </div>
      )}
    </div>
  );
};

// ---- Main Modal ----

export const InsurancePolicyModal: React.FC<InsurancePolicyModalProps> = ({
  isOpen,
  onClose,
  cards,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('policies');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  const { policies, claims, gaps, recommendations, reminders } = useMemo(() => {
    ensureSampleData();
    const pols = getPolicies();
    const cls = getClaims();
    const gps = analyzeCoverageGaps(pols, cards);
    const recs = getRiderRecommendations(cards, pols);
    const rems = getRenewalReminders(pols);
    return { policies: pols, claims: cls, gaps: gps, recommendations: recs, reminders: rems };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards, refreshKey]);

  const activePolicies = policies.filter(p => p.status === 'active');
  const totalCoverage = activePolicies.reduce((s, p) => s + p.coverageAmount, 0);
  const totalValue = cards.reduce((s, c) => s + (c.currentValue ?? c.purchasePrice), 0);
  const coverageRatio = totalValue > 0 ? Math.min(100, Math.round((totalCoverage / totalValue) * 100)) : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-700 flex items-center justify-between bg-blue-500/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/30">
              <Shield size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/30">
                  <CheckCircle2 size={10} />
                  {coverageRatio}% covered
                </span>
                {reminders.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <CalendarClock size={10} />
                    {reminders[0].daysUntilExpiry}d to renewal
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bebas tracking-widest text-white leading-tight">
                Collection <span className="text-blue-400">Insurance</span> Manager
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-800 text-brand-muted hover:text-white rounded-xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-slate-700 bg-slate-800/30">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'text-brand-lime border-brand-lime bg-brand-lime/5'
                  : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-8 max-h-[65vh] overflow-y-auto no-scrollbar">
          {activeTab === 'policies' && (
            <PoliciesTab policies={policies} onRefresh={handleRefresh} />
          )}
          {activeTab === 'coverage' && (
            <CoverageTab gaps={gaps} policies={policies} />
          )}
          {activeTab === 'premium' && (
            <PremiumTab cards={cards} />
          )}
          {activeTab === 'claims' && (
            <ClaimsTab claims={claims} policies={policies} onRefresh={handleRefresh} />
          )}
          {activeTab === 'riders' && (
            <RidersTab recommendations={recommendations} />
          )}
        </div>
      </div>
    </div>
  );
};

export default InsurancePolicyModal;
