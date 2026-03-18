import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  Users,
  FileText,
  TrendingUp,
  DollarSign,
  Heart,
  Calendar,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Gift,
  Scale,
  Landmark,
  ArrowRight,
  Download,
  Plus,
  User,
  Building2,
  Percent,
  Info,
  BookOpen,
  BarChart3,
  Target,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
  Legend,
  PieChart,
  Pie,
} from 'recharts';
import {
  getEstatePlan,
  getWealthProjection,
  getTaxStrategies,
  getCharitableOptions,
  getGenerationalTimeline,
  getEstateSummary,
  calculateStepUpBasis,
  calculateInheritanceTax,
  generateDocument,
  getAvailableStates,
  formatCurrency,
  type EstatePlan,
  type WealthProjection,
  type TaxStrategy,
  type CharitableGiving,
  type LegacyTimeline,
  type EstateSummary,
  type StepUpBasis,
  type InheritanceTaxProjection,
  type TrustStructure,
  type Beneficiary,
  type DocumentTemplate,
} from '../lib/utils/generationalWealthService.ts';

type TabId =
  | 'overview'
  | 'beneficiaries'
  | 'tax'
  | 'trusts'
  | 'projection'
  | 'documents'
  | 'charitable'
  | 'timeline';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <Shield size={16} /> },
  { id: 'beneficiaries', label: 'Beneficiaries', icon: <Users size={16} /> },
  { id: 'tax', label: 'Tax Planning', icon: <DollarSign size={16} /> },
  { id: 'trusts', label: 'Trusts', icon: <Landmark size={16} /> },
  { id: 'projection', label: 'Projections', icon: <TrendingUp size={16} /> },
  { id: 'documents', label: 'Documents', icon: <FileText size={16} /> },
  { id: 'charitable', label: 'Charitable', icon: <Heart size={16} /> },
  { id: 'timeline', label: 'Timeline', icon: <Calendar size={16} /> },
];

const relationshipColors: Record<string, string> = {
  spouse: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  child: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  grandchild: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  sibling: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  charity: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  trust: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  other: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const trustTypeLabels: Record<string, string> = {
  revocable_living: 'Revocable Living',
  irrevocable: 'Irrevocable',
  charitable_remainder: 'Charitable Remainder',
  grantor_retained: 'Grantor Retained',
  dynasty: 'Dynasty',
  qualified_personal_residence: 'QPRT',
};

const healthColors: Record<string, string> = {
  excellent: 'text-emerald-400',
  good: 'text-blue-400',
  needs_attention: 'text-amber-400',
  critical: 'text-red-400',
};

const healthBg: Record<string, string> = {
  excellent: 'bg-emerald-500/10',
  good: 'bg-blue-500/10',
  needs_attention: 'bg-amber-500/10',
  critical: 'bg-red-500/10',
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
      <p className="text-slate-300 text-sm font-medium mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

const GenerationalWealth: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<EstatePlan | null>(null);
  const [summary, setSummary] = useState<EstateSummary | null>(null);
  const [projections, setProjections] = useState<WealthProjection[]>([]);
  const [strategies, setStrategies] = useState<TaxStrategy[]>([]);
  const [charitable, setCharitable] = useState<CharitableGiving[]>([]);
  const [timeline, setTimeline] = useState<LegacyTimeline | null>(null);
  const [stepUpBasis, setStepUpBasis] = useState<StepUpBasis[]>([]);
  const [selectedState, setSelectedState] = useState('New York');
  const [taxProjection, setTaxProjection] = useState<InheritanceTaxProjection | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<DocumentTemplate | null>(null);
  const [projectionYears, setProjectionYears] = useState(30);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPlan(getEstatePlan());
      setSummary(getEstateSummary());
      setProjections(getWealthProjection(30));
      setStrategies(getTaxStrategies());
      setCharitable(getCharitableOptions());
      setTimeline(getGenerationalTimeline());
      setStepUpBasis(calculateStepUpBasis());
      setTaxProjection(calculateInheritanceTax(1847500, 'New York'));
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      setTaxProjection(calculateInheritanceTax(plan?.totalValue || 1847500, selectedState));
    }
  }, [selectedState, loading, plan?.totalValue]);

  const filteredProjections = useMemo(
    () => projections.slice(0, projectionYears + 1),
    [projections, projectionYears]
  );

  const totalStepUpSavings = useMemo(
    () => stepUpBasis.reduce((sum, s) => sum + s.taxSavings, 0),
    [stepUpBasis]
  );

  const beneficiaryPieData = useMemo(() => {
    if (!plan) return [];
    return plan.beneficiaries.map((b) => ({
      name: b.name.split(' ')[0],
      value: b.allocationPercent,
      fill:
        b.relationship === 'spouse'
          ? '#ec4899'
          : b.relationship === 'child'
          ? '#3b82f6'
          : b.relationship === 'charity'
          ? '#10b981'
          : '#8b5cf6',
    }));
  }, [plan]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-lg">Loading estate plan...</p>
        </div>
      </div>
    );
  }

  if (!plan || !summary) return null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                <Shield className="text-emerald-400" size={24} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Generational Wealth Planner
                </h1>
                <p className="text-slate-400 text-sm">
                  Estate planning for your collectible portfolio
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${healthBg[summary.estateHealth]} ${healthColors[summary.estateHealth]}`}>
                {summary.estateHealth === 'excellent' && <CheckCircle2 size={14} className="inline mr-1" />}
                {summary.estateHealth === 'needs_attention' && <AlertTriangle size={14} className="inline mr-1" />}
                Estate: {summary.estateHealth.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-500">Next Review</p>
                <p className="text-sm text-slate-300">{summary.nextReviewDate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto pb-px scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ===================== OVERVIEW TAB ===================== */}
        {activeTab === 'overview' && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={18} className="text-emerald-400" />
                  <span className="text-slate-400 text-sm">Total Estate Value</span>
                </div>
                <p className="text-2xl font-bold text-white">{formatCurrency(summary.totalValue)}</p>
                <p className="text-xs text-slate-500 mt-1">{summary.totalAssets} collectible assets</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={18} className="text-amber-400" />
                  <span className="text-slate-400 text-sm">Tax Exposure</span>
                </div>
                <p className="text-2xl font-bold text-white">{formatCurrency(summary.taxExposure)}</p>
                <p className="text-xs text-slate-500 mt-1">{summary.taxExposurePercent.toFixed(1)}% effective rate</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={18} className="text-blue-400" />
                  <span className="text-slate-400 text-sm">Beneficiaries</span>
                </div>
                <p className="text-2xl font-bold text-white">{summary.beneficiaryCount}</p>
                <p className="text-xs text-slate-500 mt-1">{plan.bequests.length} assets assigned</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={18} className="text-purple-400" />
                  <span className="text-slate-400 text-sm">Protected Value</span>
                </div>
                <p className="text-2xl font-bold text-white">{formatCurrency(summary.protectedValue)}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {summary.unassignedValue > 0
                    ? `${formatCurrency(summary.unassignedValue)} unassigned`
                    : 'Fully assigned'}
                </p>
              </div>
            </div>

            {/* Legacy Dashboard */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BookOpen size={20} className="text-emerald-400" />
                Your Collection's Generational Impact
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-slate-400">Wealth Preservation</h3>
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <p className="text-2xl font-bold text-emerald-400">{formatCurrency(plan.taxProjection.netToHeirs)}</p>
                    <p className="text-sm text-slate-400 mt-1">Net value to heirs after taxes</p>
                    <div className="mt-3 w-full bg-slate-600 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${((plan.taxProjection.netToHeirs / plan.totalValue) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {((plan.taxProjection.netToHeirs / plan.totalValue) * 100).toFixed(1)}% preservation rate
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-slate-400">Step-Up Basis Savings</h3>
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <p className="text-2xl font-bold text-blue-400">{formatCurrency(totalStepUpSavings)}</p>
                    <p className="text-sm text-slate-400 mt-1">Capital gains tax eliminated for heirs</p>
                    <div className="mt-3 space-y-1">
                      {stepUpBasis.slice(0, 3).map((s) => (
                        <div key={s.assetId} className="flex justify-between text-xs">
                          <span className="text-slate-400 truncate mr-2">{s.assetName.split(' ').slice(0, 3).join(' ')}</span>
                          <span className="text-blue-400 shrink-0">{formatCurrency(s.taxSavings)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-slate-400">Recommendations</h3>
                  <div className="bg-slate-700/50 rounded-xl p-4 space-y-2">
                    {summary.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-300">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Beneficiary Allocation Pie + Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Allocation Breakdown</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={beneficiaryPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name} ${value}%`}
                      >
                        {beneficiaryPieData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Asset Assignments</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {plan.bequests.map((beq) => (
                    <div
                      key={beq.id}
                      className="flex items-center justify-between bg-slate-700/50 rounded-xl p-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{beq.assetName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <ArrowRight size={12} className="text-slate-500" />
                          <span className="text-xs text-slate-400">{beq.beneficiaryName}</span>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-emerald-400 shrink-0 ml-3">
                        {formatCurrency(beq.estimatedValue)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ===================== BENEFICIARIES TAB ===================== */}
        {activeTab === 'beneficiaries' && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Beneficiary Manager</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-colors">
                <Plus size={16} />
                Add Beneficiary
              </button>
            </div>

            {/* Allocation Overview Bar */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
              <h3 className="text-sm font-medium text-slate-400 mb-3">Total Allocation</h3>
              <div className="flex rounded-full h-6 overflow-hidden bg-slate-700">
                {plan.beneficiaries.map((b) => (
                  <div
                    key={b.id}
                    className={`h-full flex items-center justify-center text-xs font-medium ${
                      b.relationship === 'spouse'
                        ? 'bg-pink-500'
                        : b.relationship === 'child'
                        ? 'bg-blue-500'
                        : b.relationship === 'charity'
                        ? 'bg-emerald-500'
                        : 'bg-purple-500'
                    }`}
                    style={{ width: `${b.allocationPercent}%` }}
                    title={`${b.name}: ${b.allocationPercent}%`}
                  >
                    {b.allocationPercent >= 15 ? `${b.allocationPercent}%` : ''}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 mt-3">
                {plan.beneficiaries.map((b) => (
                  <div key={b.id} className="flex items-center gap-2 text-xs text-slate-400">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        b.relationship === 'spouse'
                          ? 'bg-pink-500'
                          : b.relationship === 'child'
                          ? 'bg-blue-500'
                          : b.relationship === 'charity'
                          ? 'bg-emerald-500'
                          : 'bg-purple-500'
                      }`}
                    />
                    {b.name} ({b.allocationPercent}%)
                  </div>
                ))}
              </div>
            </div>

            {/* Beneficiary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.beneficiaries.map((b) => (
                <div
                  key={b.id}
                  className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${
                        b.relationship === 'charity' ? 'bg-emerald-500/10' : 'bg-blue-500/10'
                      }`}>
                        {b.relationship === 'charity' ? (
                          <Building2 size={20} className="text-emerald-400" />
                        ) : (
                          <User size={20} className="text-blue-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{b.name}</h3>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium border ${relationshipColors[b.relationship]}`}>
                          {b.relationship.charAt(0).toUpperCase() + b.relationship.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">{b.allocationPercent}%</p>
                      <p className="text-xs text-slate-500">
                        {formatCurrency((plan.totalValue * b.allocationPercent) / 100)}
                      </p>
                    </div>
                  </div>

                  {/* Allocation Slider Visual */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span>Allocation</span>
                      <span>{b.allocationPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          b.relationship === 'spouse'
                            ? 'bg-pink-500'
                            : b.relationship === 'child'
                            ? 'bg-blue-500'
                            : b.relationship === 'charity'
                            ? 'bg-emerald-500'
                            : 'bg-purple-500'
                        }`}
                        style={{ width: `${b.allocationPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Assigned Assets */}
                  <div>
                    <p className="text-xs text-slate-400 mb-2">
                      Assigned Assets ({b.assignedAssets.length})
                    </p>
                    <div className="space-y-1.5">
                      {plan.bequests
                        .filter((bq) => bq.beneficiaryId === b.id)
                        .map((bq) => (
                          <div
                            key={bq.id}
                            className="flex items-center justify-between bg-slate-700/50 rounded-lg px-3 py-2"
                          >
                            <span className="text-sm text-slate-300 truncate mr-2">{bq.assetName}</span>
                            <span className="text-xs text-emerald-400 shrink-0">
                              {formatCurrency(bq.estimatedValue)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Flags */}
                  <div className="flex flex-wrap gap-2">
                    {b.contingent && (
                      <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full text-xs">
                        Contingent
                      </span>
                    )}
                    {b.minorProtection && (
                      <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full text-xs">
                        Minor Protection
                      </span>
                    )}
                  </div>

                  {b.notes && (
                    <p className="text-xs text-slate-500 italic border-t border-slate-700 pt-3">
                      {b.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ===================== TAX PLANNING TAB ===================== */}
        {activeTab === 'tax' && taxProjection && (
          <>
            {/* Tax Calculator */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Scale size={20} className="text-amber-400" />
                  Inheritance Tax Calculator
                </h2>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-400">State:</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {getAvailableStates().map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1">Federal Tax</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(taxProjection.federalTaxOwed)}</p>
                  <p className="text-xs text-slate-500">
                    Exemption: {formatCurrency(taxProjection.federalExemption)}
                  </p>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1">State Tax ({selectedState})</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(taxProjection.stateTaxOwed)}</p>
                  <p className="text-xs text-slate-500">
                    {taxProjection.stateRate > 0
                      ? `Rate: up to ${taxProjection.stateRate}%`
                      : 'No state estate tax'}
                  </p>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1">Total Tax Owed</p>
                  <p className="text-xl font-bold text-red-400">{formatCurrency(taxProjection.totalTaxOwed)}</p>
                  <p className="text-xs text-slate-500">
                    Effective rate: {taxProjection.effectiveRate.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1">Net to Heirs</p>
                  <p className="text-xl font-bold text-emerald-400">{formatCurrency(taxProjection.netToHeirs)}</p>
                  <p className="text-xs text-slate-500">
                    {((taxProjection.netToHeirs / plan.totalValue) * 100).toFixed(1)}% preservation
                  </p>
                </div>
              </div>

              {/* Strategies */}
              {taxProjection.strategies.length > 0 && (
                <div className="border-t border-slate-700 pt-4">
                  <h3 className="text-sm font-medium text-slate-400 mb-3">Suggested Strategies</h3>
                  <div className="space-y-2">
                    {taxProjection.strategies.map((s, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-300">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Step-Up Basis Calculator */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-400" />
                Step-Up in Basis Calculator
              </h2>
              <p className="text-sm text-slate-400 mb-4">
                Shows the tax savings your heirs receive from the stepped-up cost basis at transfer.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400">
                      <th className="text-left py-3 px-2">Asset</th>
                      <th className="text-right py-3 px-2">Original Basis</th>
                      <th className="text-right py-3 px-2">Fair Market Value</th>
                      <th className="text-right py-3 px-2">Step-Up Amount</th>
                      <th className="text-right py-3 px-2">Tax Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stepUpBasis.map((s) => (
                      <tr key={s.assetId} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="py-3 px-2 text-white font-medium">{s.assetName}</td>
                        <td className="py-3 px-2 text-right text-slate-400">{formatCurrency(s.originalBasis)}</td>
                        <td className="py-3 px-2 text-right text-white">{formatCurrency(s.currentFairMarketValue)}</td>
                        <td className="py-3 px-2 text-right text-blue-400">{formatCurrency(s.stepUpAmount)}</td>
                        <td className="py-3 px-2 text-right text-emerald-400 font-semibold">
                          {formatCurrency(s.taxSavings)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-600">
                      <td className="py-3 px-2 text-white font-bold">Total</td>
                      <td className="py-3 px-2 text-right text-slate-400">
                        {formatCurrency(stepUpBasis.reduce((s, b) => s + b.originalBasis, 0))}
                      </td>
                      <td className="py-3 px-2 text-right text-white">
                        {formatCurrency(stepUpBasis.reduce((s, b) => s + b.currentFairMarketValue, 0))}
                      </td>
                      <td className="py-3 px-2 text-right text-blue-400">
                        {formatCurrency(stepUpBasis.reduce((s, b) => s + b.stepUpAmount, 0))}
                      </td>
                      <td className="py-3 px-2 text-right text-emerald-400 font-bold">
                        {formatCurrency(totalStepUpSavings)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-300">
                    Step-up in basis eliminates capital gains tax on appreciation that occurred during
                    your lifetime. Your heirs' cost basis resets to fair market value at date of death,
                    saving an estimated <strong>{formatCurrency(totalStepUpSavings)}</strong> in capital
                    gains taxes (at 21% collectibles rate).
                  </p>
                </div>
              </div>
            </div>

            {/* Tax Strategies */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Target size={20} className="text-purple-400" />
                Tax Reduction Strategies
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {strategies.map((strat) => (
                  <div
                    key={strat.id}
                    className={`border rounded-xl p-4 ${
                      strat.recommended
                        ? 'border-emerald-500/30 bg-emerald-500/5'
                        : 'border-slate-700 bg-slate-700/30'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-semibold text-sm">{strat.name}</h3>
                      {strat.recommended && (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-xs shrink-0">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{strat.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-semibold text-sm">
                        Saves {formatCurrency(strat.potentialSavings)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          strat.complexity === 'low'
                            ? 'bg-green-500/10 text-green-400'
                            : strat.complexity === 'medium'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {strat.complexity} complexity
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">{strat.timeframe}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ===================== TRUSTS TAB ===================== */}
        {activeTab === 'trusts' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Landmark size={20} className="text-purple-400" />
              Trust Comparison
            </h2>

            {/* Trust Comparison Table */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-700/50 border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Feature</th>
                      {plan.trusts.map((t) => (
                        <th key={t.id} className="text-center py-3 px-4 text-white font-semibold">
                          {trustTypeLabels[t.type] || t.type}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    <tr className="hover:bg-slate-700/20">
                      <td className="py-3 px-4 text-slate-400">Revocable</td>
                      {plan.trusts.map((t) => (
                        <td key={t.id} className="py-3 px-4 text-center">
                          {t.revocable ? (
                            <CheckCircle2 size={16} className="text-emerald-400 inline" />
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-slate-700/20">
                      <td className="py-3 px-4 text-slate-400">Asset Protection</td>
                      {plan.trusts.map((t) => (
                        <td key={t.id} className="py-3 px-4 text-center">
                          {t.assetProtection ? (
                            <CheckCircle2 size={16} className="text-emerald-400 inline" />
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-slate-700/20">
                      <td className="py-3 px-4 text-slate-400">Tax Benefit</td>
                      {plan.trusts.map((t) => (
                        <td key={t.id} className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              t.taxBenefit === 'high'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : t.taxBenefit === 'medium'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-slate-500/20 text-slate-400'
                            }`}
                          >
                            {t.taxBenefit}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-slate-700/20">
                      <td className="py-3 px-4 text-slate-400">Setup Cost</td>
                      {plan.trusts.map((t) => (
                        <td key={t.id} className="py-3 px-4 text-center text-white">
                          {formatCurrency(t.estimatedSetupCost)}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-slate-700/20">
                      <td className="py-3 px-4 text-slate-400">Annual Cost</td>
                      {plan.trusts.map((t) => (
                        <td key={t.id} className="py-3 px-4 text-center text-white">
                          {formatCurrency(t.annualMaintenanceCost)}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-slate-700/20">
                      <td className="py-3 px-4 text-slate-400">Min. Value</td>
                      {plan.trusts.map((t) => (
                        <td key={t.id} className="py-3 px-4 text-center text-white">
                          {formatCurrency(t.recommendedMinValue)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Trust Detail Cards */}
            {plan.trusts.map((trust) => (
              <div key={trust.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{trust.name}</h3>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full text-xs">
                      {trustTypeLabels[trust.type]}
                    </span>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      trust.taxBenefit === 'high'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-slate-500/10 text-slate-400'
                    }`}
                  >
                    {trust.taxBenefit === 'high' ? 'High Tax Benefit' : 'Low Tax Benefit'}
                  </div>
                </div>
                <p className="text-sm text-slate-300 mb-4">{trust.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-emerald-400 mb-2">Advantages</h4>
                    <ul className="space-y-1.5">
                      {trust.pros.map((pro, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-red-400 mb-2">Considerations</h4>
                    <ul className="space-y-1.5">
                      {trust.cons.map((con, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-4 bg-slate-700/50 rounded-xl p-3">
                  <p className="text-sm text-slate-400">
                    <strong className="text-white">Tax Implications:</strong> {trust.taxImplications}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===================== PROJECTIONS TAB ===================== */}
        {activeTab === 'projection' && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <BarChart3 size={20} className="text-cyan-400" />
                Wealth Projection
              </h2>
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-400">Projection:</label>
                {[10, 20, 30].map((y) => (
                  <button
                    key={y}
                    onClick={() => setProjectionYears(y)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      projectionYears === y
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {y}yr
                  </button>
                ))}
              </div>
            </div>

            {/* Area Chart */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Portfolio Value vs. Net to Heirs ({projectionYears}-Year Projection)
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredProjections}>
                    <defs>
                      <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorInflation" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <YAxis
                      stroke="#94a3b8"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="portfolioValue"
                      name="Portfolio Value"
                      stroke="#10b981"
                      fill="url(#colorPortfolio)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="netToHeirs"
                      name="Net to Heirs"
                      stroke="#3b82f6"
                      fill="url(#colorNet)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="inflationAdjusted"
                      name="Inflation Adjusted"
                      stroke="#8b5cf6"
                      fill="url(#colorInflation)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Projection Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  label: `Value in ${projectionYears} Years`,
                  value: filteredProjections[filteredProjections.length - 1]?.portfolioValue || 0,
                  color: 'text-emerald-400',
                  sub: `${((((filteredProjections[filteredProjections.length - 1]?.portfolioValue || 0) / plan.totalValue - 1) * 100)).toFixed(0)}% total growth`,
                },
                {
                  label: `Net to Heirs (${projectionYears}yr)`,
                  value: filteredProjections[filteredProjections.length - 1]?.netToHeirs || 0,
                  color: 'text-blue-400',
                  sub: 'After federal estate tax',
                },
                {
                  label: 'Inflation-Adjusted Value',
                  value: filteredProjections[filteredProjections.length - 1]?.inflationAdjusted || 0,
                  color: 'text-purple-400',
                  sub: 'In today\'s purchasing power',
                },
              ].map((item, i) => (
                <div key={i} className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                  <p className="text-sm text-slate-400 mb-1">{item.label}</p>
                  <p className={`text-2xl font-bold ${item.color}`}>
                    {formatCurrency(item.value)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{item.sub}</p>
                </div>
              ))}
            </div>

            {/* Step-Up Bar Chart */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Step-Up Basis Savings by Asset
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stepUpBasis.map((s) => ({
                    name: s.assetName.split(' ').slice(0, 3).join(' '),
                    savings: s.taxSavings,
                    basis: s.originalBasis,
                    fmv: s.currentFairMarketValue,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="savings" name="Tax Savings" radius={[4, 4, 0, 0]}>
                      {stepUpBasis.map((_, i) => (
                        <Cell key={i} fill={['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'][i % 6]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* ===================== DOCUMENTS TAB ===================== */}
        {activeTab === 'documents' && (
          <>
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <FileText size={20} className="text-cyan-400" />
              Legal Document Generator
            </h2>
            <p className="text-sm text-slate-400 -mt-4">
              Generate legal-ready estate planning documents for your collectibles portfolio.
            </p>

            {/* Document Type Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(
                [
                  { type: 'will_excerpt', label: 'Will Excerpt', icon: <FileText size={20} />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                  { type: 'trust_summary', label: 'Trust Summary', icon: <Landmark size={20} />, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                  { type: 'appraisal_letter', label: 'Appraisal Letter', icon: <Scale size={20} />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                  { type: 'insurance_certificate', label: 'Insurance Cert', icon: <Shield size={20} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                ] as const
              ).map((dt) => {
                const existing = plan.documents.find((d) => d.type === dt.type);
                return (
                  <button
                    key={dt.type}
                    onClick={() => setSelectedDoc(existing || generateDocument(dt.type))}
                    className="bg-slate-800 border border-slate-700 rounded-2xl p-5 text-left hover:border-slate-600 transition-all group"
                  >
                    <div className={`p-2.5 ${dt.bg} rounded-xl inline-block mb-3`}>
                      <span className={dt.color}>{dt.icon}</span>
                    </div>
                    <h3 className="text-white font-semibold text-sm mb-1">{dt.label}</h3>
                    {existing ? (
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            existing.status === 'final'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : existing.status === 'review'
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-slate-500/10 text-slate-400'
                          }`}
                        >
                          {existing.status}
                        </span>
                        <span className="text-xs text-slate-500">{existing.generatedDate}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">Click to generate</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Document Viewer */}
            {selectedDoc && (
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{selectedDoc.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          selectedDoc.status === 'final'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : selectedDoc.status === 'review'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-slate-500/10 text-slate-400'
                        }`}
                      >
                        {selectedDoc.status}
                      </span>
                      <span className="text-xs text-slate-500">
                        Generated: {selectedDoc.generatedDate}
                      </span>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-300 transition-colors">
                    <Download size={14} />
                    Export PDF
                  </button>
                </div>

                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 font-mono text-sm text-slate-300 whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {selectedDoc.content}
                </div>

                {selectedDoc.signatures.length > 0 && (
                  <div className="mt-4 border-t border-slate-700 pt-4">
                    <h4 className="text-sm font-medium text-slate-400 mb-2">Required Signatures</h4>
                    <div className="flex flex-wrap gap-3">
                      {selectedDoc.signatures.map((sig, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 bg-slate-700/50 rounded-lg px-3 py-2"
                        >
                          <div className="w-3 h-3 rounded-full border-2 border-slate-500" />
                          <span className="text-sm text-slate-300">{sig}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* All Documents List */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">All Documents</h3>
              <div className="space-y-2">
                {plan.documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`w-full flex items-center justify-between bg-slate-700/30 rounded-xl p-4 text-left hover:bg-slate-700/50 transition-colors ${
                      selectedDoc?.id === doc.id ? 'ring-2 ring-emerald-500/50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText size={18} className="text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-white font-medium truncate">{doc.title}</p>
                        <p className="text-xs text-slate-500">{doc.generatedDate}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs shrink-0 ml-2 ${
                        doc.status === 'final'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : doc.status === 'review'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-slate-500/10 text-slate-400'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ===================== CHARITABLE TAB ===================== */}
        {activeTab === 'charitable' && (
          <>
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Heart size={20} className="text-pink-400" />
              Charitable Giving Planner
            </h2>
            <p className="text-sm text-slate-400 -mt-4">
              Maximize tax deductions while supporting causes you care about through strategic collectible donations.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {charitable.map((option) => (
                <div
                  key={option.id}
                  className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-white font-semibold">{option.name}</h3>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-pink-500/10 text-pink-400 rounded-full text-xs">
                        {option.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-400">
                        {formatCurrency(option.estimatedSavings)}
                      </p>
                      <p className="text-xs text-slate-500">estimated savings</p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300">{option.description}</p>

                  <div className="bg-slate-700/50 rounded-xl p-3">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-400">Tax Deduction</span>
                      <span className="text-white font-medium">
                        {(option.taxDeduction * 100).toFixed(0)}% of FMV
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Annual Limit</span>
                      <span className="text-white font-medium">{option.annualLimit}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs text-slate-400 font-medium mb-2">Benefits</h4>
                    <ul className="space-y-1.5">
                      {option.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Charitable Savings Comparison */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Tax Savings Comparison</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charitable.map((c) => ({
                    name: c.name.split(' ').slice(0, 2).join(' '),
                    savings: c.estimatedSavings,
                    deduction: c.taxDeduction * 100,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="savings" name="Estimated Savings" radius={[4, 4, 0, 0]}>
                      {charitable.map((_, i) => (
                        <Cell key={i} fill={['#ec4899', '#8b5cf6', '#3b82f6', '#10b981'][i % 4]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* ===================== TIMELINE TAB ===================== */}
        {activeTab === 'timeline' && timeline && (
          <>
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Calendar size={20} className="text-cyan-400" />
              Legacy Timeline
            </h2>
            <p className="text-sm text-slate-400 -mt-4">
              Key milestones for your estate plan from {timeline.currentYear} to {timeline.projectedEndYear}.
            </p>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-700" />

                <div className="space-y-8">
                  {timeline.milestones.map((ms, i) => {
                    const typeColors: Record<string, string> = {
                      review: 'bg-blue-500/20 text-blue-400 border-blue-500',
                      distribution: 'bg-emerald-500/20 text-emerald-400 border-emerald-500',
                      beneficiary_age: 'bg-purple-500/20 text-purple-400 border-purple-500',
                      trust_event: 'bg-amber-500/20 text-amber-400 border-amber-500',
                      tax_event: 'bg-red-500/20 text-red-400 border-red-500',
                    };
                    const colors = typeColors[ms.type] || typeColors.review;
                    const isPast = ms.year <= timeline.currentYear;
                    const isCurrent = ms.year === timeline.currentYear;

                    return (
                      <div key={ms.id} className="relative flex items-start gap-4 pl-2">
                        {/* Dot */}
                        <div
                          className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 ${
                            isCurrent
                              ? 'border-emerald-500 bg-emerald-500/20'
                              : isPast
                              ? 'border-slate-600 bg-slate-700'
                              : colors.split(' ').slice(0, 1).join(' ') + ' border-slate-600'
                          }`}
                        >
                          {isCurrent ? (
                            <CheckCircle2 size={14} className="text-emerald-400" />
                          ) : ms.type === 'review' ? (
                            <RefreshCw size={14} className="text-blue-400" />
                          ) : ms.type === 'distribution' ? (
                            <Gift size={14} className="text-emerald-400" />
                          ) : ms.type === 'beneficiary_age' ? (
                            <User size={14} className="text-purple-400" />
                          ) : ms.type === 'tax_event' ? (
                            <AlertTriangle size={14} className="text-red-400" />
                          ) : (
                            <Shield size={14} className="text-amber-400" />
                          )}
                        </div>

                        <div className={`flex-1 ${isPast && !isCurrent ? 'opacity-60' : ''}`}>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-lg font-bold text-white">{ms.year}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs border ${colors}`}
                            >
                              {ms.type.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <h3 className="text-white font-semibold text-sm">{ms.title}</h3>
                          <p className="text-sm text-slate-400 mt-0.5">{ms.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GenerationalWealth;
