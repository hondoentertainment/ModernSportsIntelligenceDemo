import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Gift,
  Landmark,
  ArrowRight,
  User,
  Percent,
  BarChart3,
  Target,
  RefreshCw,
  FileText,
  ChevronDown,
  ChevronUp,
  Layers,
  Lock,
  Unlock,
  Heart,
  Activity,
  Umbrella,
  Zap,
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
  LineChart,
  Line,
  ComposedChart,
} from 'recharts';
import {
  getEstatePlan,
  getProjection,
  getGenerationalTimeline,
  getEstateSummary,
  calculateTaxImpact,
  getTrustOptions,
  getGiftingSchedule,
  getInsuranceRequirements,
  getWealthTransferScenarios,
  getInflationAdjustedValue,
  getAppreciationModel,
  compareStructures,
  getCollectionProfiles,
  getFamilyMembers,
  formatCurrency,
  getAvailableStates,
  type EstatePlan,
  type WealthProjection,
  type TaxImpact,
  type TrustStructure,
  type GiftingSchedule,
  type InsuranceRequirement,
  type WealthTransferScenario,
  type GenerationalTimeline,
  type EstateSummary,
  type AppreciationModel,
  type CollectionProfile,
  type ProjectionHorizon,
  type TrustComparison,
} from '../lib/generationalWealthService.ts';

type TabId = 'overview' | 'projections' | 'trusts' | 'tax' | 'insurance' | 'timeline';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Estate Overview', icon: <Shield size={16} /> },
  { id: 'projections', label: 'Projections', icon: <TrendingUp size={16} /> },
  { id: 'trusts', label: 'Trust Structures', icon: <Landmark size={16} /> },
  { id: 'tax', label: 'Tax Planning', icon: <DollarSign size={16} /> },
  { id: 'insurance', label: 'Insurance', icon: <Umbrella size={16} /> },
  { id: 'timeline', label: 'Timeline', icon: <Calendar size={16} /> },
];

const taxCategoryColors: Record<string, string> = {
  inheritance: '#f59e0b',
  gift: '#8b5cf6',
  capital_gains: '#ef4444',
};

const taxCategoryLabels: Record<string, string> = {
  inheritance: 'Estate/Inheritance Tax',
  gift: 'Gift Tax',
  capital_gains: 'Capital Gains Tax',
};

const taxBracketColors: Record<string, string> = {
  low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  high: 'text-red-400 bg-red-500/10 border-red-500/30',
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

const milestoneColors: Record<string, string> = {
  review: 'border-blue-500 bg-blue-500/10',
  distribution: 'border-emerald-500 bg-emerald-500/10',
  beneficiary_age: 'border-cyan-500 bg-cyan-500/10',
  trust_event: 'border-purple-500 bg-purple-500/10',
  tax_event: 'border-amber-500 bg-amber-500/10',
  gift_event: 'border-pink-500 bg-pink-500/10',
  insurance_event: 'border-teal-500 bg-teal-500/10',
};

const milestoneIcons: Record<string, React.ReactNode> = {
  FileText: <FileText size={16} />,
  Gift: <Gift size={16} />,
  Shield: <Shield size={16} />,
  User: <User size={16} />,
  AlertTriangle: <AlertTriangle size={16} />,
  Users: <Users size={16} />,
  RefreshCw: <RefreshCw size={16} />,
  Calendar: <Calendar size={16} />,
};

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
      <p className="text-slate-300 text-sm font-medium mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' ? formatCurrency(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
}

function PercentTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
      <p className="text-slate-300 text-sm font-medium mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {entry.value.toFixed(1)}%
        </p>
      ))}
    </div>
  );
}

const GenerationalWealthPlanner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<EstatePlan | null>(null);
  const [summary, setSummary] = useState<EstateSummary | null>(null);
  const [projections, setProjections] = useState<WealthProjection[]>([]);
  const [appreciationData, setAppreciationData] = useState<AppreciationModel[]>([]);
  const [taxImpacts, setTaxImpacts] = useState<TaxImpact[]>([]);
  const [trusts, setTrusts] = useState<TrustStructure[]>([]);
  const [giftSchedule, setGiftSchedule] = useState<GiftingSchedule[]>([]);
  const [insurance, setInsurance] = useState<InsuranceRequirement[]>([]);
  const [scenarios, setScenarios] = useState<WealthTransferScenario[]>([]);
  const [timeline, setTimeline] = useState<GenerationalTimeline | null>(null);
  const [collectionProfiles, setCollectionProfiles] = useState<CollectionProfile[]>([]);

  const [selectedState, setSelectedState] = useState('New York');
  const [projectionHorizon, setProjectionHorizon] = useState<ProjectionHorizon>(30);
  const [expandedTrust, setExpandedTrust] = useState<string | null>(null);
  const [compareA, setCompareA] = useState('trust-001');
  const [compareB, setCompareB] = useState('trust-004');
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPlan(getEstatePlan());
      setSummary(getEstateSummary());
      setProjections(getProjection(30));
      setAppreciationData(getAppreciationModel(30));
      setTaxImpacts(calculateTaxImpact(0, 'New York'));
      setTrusts(getTrustOptions());
      setGiftSchedule(getGiftingSchedule());
      setInsurance(getInsuranceRequirements());
      setScenarios(getWealthTransferScenarios());
      setTimeline(getGenerationalTimeline());
      setCollectionProfiles(getCollectionProfiles());
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && plan) {
      setTaxImpacts(calculateTaxImpact(plan.totalValue, selectedState));
    }
  }, [selectedState, loading, plan]);

  useEffect(() => {
    if (!loading) {
      setProjections(getProjection(projectionHorizon));
      setAppreciationData(getAppreciationModel(projectionHorizon));
    }
  }, [projectionHorizon, loading]);

  const trustComparison = useMemo<TrustComparison | null>(() => {
    if (!trusts.length) return null;
    return compareStructures(compareA, compareB);
  }, [trusts, compareA, compareB]);

  const beneficiaryPieData = useMemo(() => {
    if (!plan) return [];
    return plan.beneficiaries.map((b) => ({
      name: b.name.split(' ')[0],
      value: b.allocationPercent,
      fill:
        b.relationship === 'spouse' ? '#ec4899'
        : b.relationship === 'child' ? '#3b82f6'
        : b.relationship === 'charity' ? '#10b981'
        : '#8b5cf6',
    }));
  }, [plan]);

  const taxPieData = useMemo(() => {
    return taxImpacts.map((t) => ({
      name: taxCategoryLabels[t.category],
      value: t.taxOwed,
      fill: taxCategoryColors[t.category],
    }));
  }, [taxImpacts]);

  const insurancePieData = useMemo(() => {
    return insurance.map((ins) => ({
      name: ins.policyName.length > 25 ? ins.policyName.slice(0, 22) + '...' : ins.policyName,
      value: ins.coverageAmount,
      fill: ins.type === 'collectibles_floater' ? '#22d3ee'
        : ins.type === 'umbrella' ? '#a78bfa'
        : ins.type === 'life_insurance' ? '#f472b6'
        : '#34d399',
    }));
  }, [insurance]);

  const inflationImpactData = useMemo(() => {
    if (!plan) return [];
    const data = getInflationAdjustedValue(plan.totalValue, projectionHorizon);
    return data.filter((_, i) => i % 5 === 0 || i === data.length - 1);
  }, [plan, projectionHorizon]);

  const topAssetsByValue = useMemo(() => {
    return [...collectionProfiles].sort((a, b) => b.currentValue - a.currentValue).slice(0, 8);
  }, [collectionProfiles]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-lg">Loading wealth planner...</p>
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
                  Multi-decade estate strategy for your collectible portfolio
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

        {/* ===================== ESTATE OVERVIEW ===================== */}
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
                  <Shield size={18} className="text-purple-400" />
                  <span className="text-slate-400 text-sm">Insurance Coverage</span>
                </div>
                <p className="text-2xl font-bold text-white">{formatCurrency(summary.totalInsuranceCoverage)}</p>
                <p className="text-xs text-slate-500 mt-1">{formatCurrency(summary.totalAnnualPremiums)}/yr premiums</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={18} className="text-blue-400" />
                  <span className="text-slate-400 text-sm">Beneficiaries</span>
                </div>
                <p className="text-2xl font-bold text-white">{summary.beneficiaryCount}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {summary.unassignedValue > 0
                    ? `${formatCurrency(summary.unassignedValue)} unassigned`
                    : 'Fully assigned'}
                </p>
              </div>
            </div>

            {/* Beneficiary Allocation + Top Assets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Users size={20} className="text-blue-400" />
                  Beneficiary Allocation
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={beneficiaryPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, value }) => `${name} ${value}%`}
                      >
                        {beneficiaryPieData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: number) => `${val}%`} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BarChart3 size={20} className="text-emerald-400" />
                  Top Assets by Value
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topAssetsByValue} layout="vertical" margin={{ left: 10, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="currentValue" name="Current Value" radius={[0, 4, 4, 0]}>
                        {topAssetsByValue.map((_, i) => (
                          <Cell key={i} fill={['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#22d3ee', '#f472b6', '#a78bfa'][i % 8]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target size={20} className="text-amber-400" />
                Action Items
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {summary.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 bg-slate-700/30 rounded-xl p-4">
                    <div className="mt-0.5 p-1 bg-amber-500/10 rounded-lg shrink-0">
                      <ArrowRight size={14} className="text-amber-400" />
                    </div>
                    <p className="text-sm text-slate-300">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ===================== PROJECTIONS ===================== */}
        {activeTab === 'projections' && (
          <>
            {/* Horizon Selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">Projection Horizon:</span>
              {([10, 20, 30] as ProjectionHorizon[]).map((h) => (
                <button
                  key={h}
                  onClick={() => setProjectionHorizon(h)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    projectionHorizon === h
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {h} Years
                </button>
              ))}
            </div>

            {/* Portfolio Growth Area Chart */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                <TrendingUp size={20} className="text-emerald-400" />
                Portfolio Value Projection
              </h2>
              <p className="text-sm text-slate-400 mb-4">Nominal value, net to heirs, and inflation-adjusted over {projectionHorizon} years</p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projections} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                    <defs>
                      <linearGradient id="gradPortfolio" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradNet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradInflation" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Area type="monotone" dataKey="portfolioValue" name="Portfolio Value" stroke="#10b981" fill="url(#gradPortfolio)" strokeWidth={2} />
                    <Area type="monotone" dataKey="netToHeirs" name="Net to Heirs" stroke="#3b82f6" fill="url(#gradNet)" strokeWidth={2} />
                    <Area type="monotone" dataKey="inflationAdjusted" name="Inflation Adjusted" stroke="#f59e0b" fill="url(#gradInflation)" strokeWidth={2} strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Appreciation Scenarios */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                <Activity size={20} className="text-cyan-400" />
                Appreciation Scenarios
              </h2>
              <p className="text-sm text-slate-400 mb-4">Conservative (4%), Moderate (7.2%), Aggressive (10%) growth rates</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={appreciationData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="conservativeValue" name="Conservative (4%)" stroke="#94a3b8" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="moderateValue" name="Moderate (7.2%)" stroke="#22d3ee" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="aggressiveValue" name="Aggressive (10%)" stroke="#f472b6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Inflation Impact + Tax Liability Composed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                  <Percent size={20} className="text-amber-400" />
                  Purchasing Power Erosion
                </h2>
                <p className="text-sm text-slate-400 mb-4">Inflation at 3.1% annually</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={inflationImpactData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="purchasingPowerLoss" name="Purchasing Power Loss" fill="#ef4444" fillOpacity={0.4} radius={[4, 4, 0, 0]} />
                      <Line type="monotone" dataKey="realValue" name="Real Value" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                  <DollarSign size={20} className="text-red-400" />
                  Tax Liability Over Time
                </h2>
                <p className="text-sm text-slate-400 mb-4">Projected estate tax as portfolio grows</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projections.filter((_, i) => i % 2 === 0 || i === projections.length - 1)} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                      <defs>
                        <linearGradient id="gradTax" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="taxLiability" name="Tax Liability" stroke="#ef4444" fill="url(#gradTax)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Per-Asset Projections Table */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Layers size={20} className="text-purple-400" />
                Individual Asset Projections
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-3 text-slate-400 font-medium">Asset</th>
                      <th className="text-right py-3 px-3 text-slate-400 font-medium">Current</th>
                      <th className="text-right py-3 px-3 text-slate-400 font-medium">10 Yr</th>
                      <th className="text-right py-3 px-3 text-slate-400 font-medium">20 Yr</th>
                      <th className="text-right py-3 px-3 text-slate-400 font-medium">30 Yr</th>
                      <th className="text-right py-3 px-3 text-slate-400 font-medium">Ann. Rate</th>
                      <th className="text-center py-3 px-3 text-slate-400 font-medium">Volatility</th>
                    </tr>
                  </thead>
                  <tbody>
                    {collectionProfiles.map((cp) => (
                      <tr key={cp.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                        <td className="py-3 px-3 text-slate-200 max-w-[200px] truncate">{cp.name}</td>
                        <td className="py-3 px-3 text-right text-white font-medium">{formatCurrency(cp.currentValue)}</td>
                        <td className="py-3 px-3 text-right text-emerald-400">{formatCurrency(cp.projectedValue10)}</td>
                        <td className="py-3 px-3 text-right text-blue-400">{formatCurrency(cp.projectedValue20)}</td>
                        <td className="py-3 px-3 text-right text-purple-400">{formatCurrency(cp.projectedValue30)}</td>
                        <td className="py-3 px-3 text-right text-slate-300">{(cp.annualAppreciation * 100).toFixed(1)}%</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            cp.volatility === 'low' ? 'bg-emerald-500/10 text-emerald-400'
                            : cp.volatility === 'medium' ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-red-500/10 text-red-400'
                          }`}>
                            {cp.volatility}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ===================== TRUST STRUCTURES ===================== */}
        {activeTab === 'trusts' && (
          <>
            {/* Trust Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trusts.map((trust) => {
                const isExpanded = expandedTrust === trust.id;
                return (
                  <div key={trust.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {trust.revocable ? <Unlock size={18} className="text-blue-400" /> : <Lock size={18} className="text-amber-400" />}
                        <h3 className="text-base font-semibold text-white">{trust.name}</h3>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${taxBracketColors[trust.taxBenefit]}`}>
                        {trust.taxBenefit} tax benefit
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{trust.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-400 mb-3">
                      <span>Setup: {formatCurrency(trust.estimatedSetupCost)}</span>
                      <span>Annual: {formatCurrency(trust.annualMaintenanceCost)}</span>
                      <span>Min Value: {formatCurrency(trust.recommendedMinValue)}</span>
                    </div>
                    <div className="flex gap-2 mb-3">
                      {trust.assetProtection && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Asset Protection
                        </span>
                      )}
                      {trust.generationSkipping && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/30">
                          Generation Skipping
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setExpandedTrust(isExpanded ? null : trust.id)}
                      className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {isExpanded ? 'Less details' : 'More details'}
                    </button>
                    {isExpanded && (
                      <div className="mt-4 space-y-3 border-t border-slate-700 pt-4">
                        <div>
                          <p className="text-xs font-medium text-emerald-400 mb-1">Advantages</p>
                          <ul className="space-y-1">
                            {trust.pros.map((p, i) => (
                              <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                                <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                                {p}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-red-400 mb-1">Disadvantages</p>
                          <ul className="space-y-1">
                            {trust.cons.map((c, i) => (
                              <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                                <AlertTriangle size={12} className="text-red-500 mt-0.5 shrink-0" />
                                {c}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-slate-700/30 rounded-lg p-3">
                          <p className="text-xs font-medium text-amber-400 mb-1">Tax Implications</p>
                          <p className="text-xs text-slate-300">{trust.taxImplications}</p>
                        </div>
                        <p className="text-xs text-slate-500">Max Duration: {trust.maxDuration}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Trust Comparison */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Layers size={20} className="text-cyan-400" />
                Structure Comparison
              </h2>
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-400">Structure A:</label>
                  <select
                    value={compareA}
                    onChange={(e) => setCompareA(e.target.value)}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    {trusts.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-400">Structure B:</label>
                  <select
                    value={compareB}
                    onChange={(e) => setCompareB(e.target.value)}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    {trusts.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              {trustComparison && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Tax Savings Difference</h3>
                    <p className={`text-xl font-bold ${trustComparison.taxSavingsDiff > 0 ? 'text-emerald-400' : trustComparison.taxSavingsDiff < 0 ? 'text-red-400' : 'text-slate-300'}`}>
                      {trustComparison.taxSavingsDiff > 0 ? '+' : ''}{formatCurrency(trustComparison.taxSavingsDiff)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Structure B vs A</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-slate-400 mb-2">10-Year Cost Difference</h3>
                    <p className={`text-xl font-bold ${trustComparison.costDiff > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {trustComparison.costDiff > 0 ? '+' : ''}{formatCurrency(trustComparison.costDiff)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Setup + 10yr maintenance</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Protection Comparison</h3>
                    <p className="text-sm text-slate-200">{trustComparison.protectionDiff}</p>
                  </div>
                  <div className="md:col-span-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                    <p className="text-sm text-emerald-300 flex items-start gap-2">
                      <Zap size={16} className="shrink-0 mt-0.5" />
                      {trustComparison.recommendation}
                    </p>
                  </div>
                </div>
              )}

              {/* Cost Comparison Bar Chart */}
              {trustComparison && (
                <div className="mt-6 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: trustComparison.trustA.name.length > 20 ? trustComparison.trustA.name.slice(0, 20) + '...' : trustComparison.trustA.name, setup: trustComparison.trustA.estimatedSetupCost, annual: trustComparison.trustA.annualMaintenanceCost * 10, minValue: trustComparison.trustA.recommendedMinValue },
                        { name: trustComparison.trustB.name.length > 20 ? trustComparison.trustB.name.slice(0, 20) + '...' : trustComparison.trustB.name, setup: trustComparison.trustB.estimatedSetupCost, annual: trustComparison.trustB.annualMaintenanceCost * 10, minValue: trustComparison.trustB.recommendedMinValue },
                      ]}
                      margin={{ top: 5, right: 20, bottom: 5, left: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="setup" name="Setup Cost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="annual" name="10yr Maintenance" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </>
        )}

        {/* ===================== TAX PLANNING ===================== */}
        {activeTab === 'tax' && (
          <>
            {/* State Selector */}
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-400">State:</label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                {getAvailableStates().map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Tax Impact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {taxImpacts.map((ti) => (
                <div
                  key={ti.category}
                  className="bg-slate-800 border border-slate-700 rounded-2xl p-5"
                  style={{ borderTopColor: taxCategoryColors[ti.category], borderTopWidth: '3px' }}
                >
                  <h3 className="text-sm font-medium mb-3" style={{ color: taxCategoryColors[ti.category] }}>
                    {taxCategoryLabels[ti.category]}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Gross Value</span>
                      <span className="text-white">{formatCurrency(ti.grossValue)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Exemption</span>
                      <span className="text-emerald-400">{formatCurrency(ti.exemption)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Taxable Amount</span>
                      <span className="text-amber-400">{formatCurrency(ti.taxableAmount)}</span>
                    </div>
                    <div className="border-t border-slate-700 my-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Tax Rate</span>
                      <span className="text-white">{ti.rate}%</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-slate-300">Tax Owed</span>
                      <span className="text-red-400">{formatCurrency(ti.taxOwed)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Effective Rate</span>
                      <span className={`font-medium ${ti.effectiveRate > 15 ? 'text-red-400' : ti.effectiveRate > 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {ti.effectiveRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Net After Tax</span>
                      <span className="text-emerald-400 font-medium">{formatCurrency(ti.netAfterTax)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tax Breakdown Pie + Strategies */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BarChart3 size={20} className="text-amber-400" />
                  Tax Exposure by Category
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={taxPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, value }) => value > 0 ? `${(name as string).split(' ')[0]}` : ''}
                      >
                        {taxPieData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Target size={20} className="text-emerald-400" />
                  Tax Reduction Strategies
                </h2>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                  {taxImpacts.map((ti) => (
                    <div key={ti.category}>
                      <p className="text-xs font-medium mb-2" style={{ color: taxCategoryColors[ti.category] }}>
                        {taxCategoryLabels[ti.category]}
                      </p>
                      {ti.strategies.map((strat, i) => (
                        <div key={i} className="flex items-start gap-2 mb-2 ml-2">
                          <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                          <p className="text-xs text-slate-300">{strat}</p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Wealth Transfer Scenarios */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Gift size={20} className="text-pink-400" />
                Wealth Transfer Scenarios
              </h2>
              <div className="space-y-3">
                {scenarios.map((sc) => {
                  const isExpanded = expandedScenario === sc.id;
                  return (
                    <div key={sc.id} className={`border rounded-xl p-4 transition-colors ${sc.recommended ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-700 bg-slate-700/20'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-white">{sc.name}</h3>
                            {sc.recommended && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                Recommended
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mb-2">{sc.description}</p>
                          <div className="flex flex-wrap gap-4 text-xs">
                            <span className="text-slate-400">Tax Cost: <span className="text-red-400 font-medium">{formatCurrency(Math.abs(sc.taxCost))}</span></span>
                            <span className="text-slate-400">Net to Heirs: <span className="text-emerald-400 font-medium">{formatCurrency(sc.netToHeirs)}</span></span>
                            <span className="text-slate-400">Timeline: <span className="text-slate-200">{sc.timeframeYears === 0 ? 'At death' : `${sc.timeframeYears} years`}</span></span>
                            <span className={`px-2 py-0.5 rounded-full font-medium ${
                              sc.complexity === 'low' ? 'bg-emerald-500/10 text-emerald-400'
                              : sc.complexity === 'medium' ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-red-500/10 text-red-400'
                            }`}>
                              {sc.complexity} complexity
                            </span>
                            <span className={`px-2 py-0.5 rounded-full font-medium ${
                              sc.riskLevel === 'low' ? 'bg-emerald-500/10 text-emerald-400'
                              : sc.riskLevel === 'medium' ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-red-500/10 text-red-400'
                            }`}>
                              {sc.riskLevel} risk
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setExpandedScenario(isExpanded ? null : sc.id)}
                          className="text-slate-400 hover:text-slate-200 ml-2"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                      {isExpanded && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-700 pt-4">
                          <div>
                            <p className="text-xs font-medium text-emerald-400 mb-2">Advantages</p>
                            {sc.advantages.map((a, i) => (
                              <p key={i} className="text-xs text-slate-300 flex items-start gap-1.5 mb-1">
                                <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                                {a}
                              </p>
                            ))}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-red-400 mb-2">Disadvantages</p>
                            {sc.disadvantages.map((d, i) => (
                              <p key={i} className="text-xs text-slate-300 flex items-start gap-1.5 mb-1">
                                <AlertTriangle size={12} className="text-red-500 mt-0.5 shrink-0" />
                                {d}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gifting Schedule */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Gift size={20} className="text-purple-400" />
                Gifting Schedule
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-3 text-slate-400 font-medium">Recipient</th>
                      <th className="text-left py-3 px-3 text-slate-400 font-medium">Asset</th>
                      <th className="text-right py-3 px-3 text-slate-400 font-medium">Value</th>
                      <th className="text-left py-3 px-3 text-slate-400 font-medium">Date</th>
                      <th className="text-center py-3 px-3 text-slate-400 font-medium">Form 709</th>
                      <th className="text-right py-3 px-3 text-slate-400 font-medium">Tax</th>
                    </tr>
                  </thead>
                  <tbody>
                    {giftSchedule.map((g) => (
                      <tr key={g.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                        <td className="py-3 px-3 text-slate-200">{g.recipientName}</td>
                        <td className="py-3 px-3 text-slate-300 max-w-[200px] truncate">{g.assetDescription}</td>
                        <td className="py-3 px-3 text-right text-white font-medium">{formatCurrency(g.plannedGiftValue)}</td>
                        <td className="py-3 px-3 text-slate-300">{g.giftDate}</td>
                        <td className="py-3 px-3 text-center">
                          {g.requiresForm709 ? (
                            <span className="text-amber-400 text-xs font-medium">Required</span>
                          ) : (
                            <span className="text-emerald-400 text-xs font-medium">Not Required</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className={g.taxConsequence > 0 ? 'text-red-400' : 'text-emerald-400'}>
                            {formatCurrency(g.taxConsequence)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ===================== INSURANCE ===================== */}
        {activeTab === 'insurance' && (
          <>
            {/* Insurance KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={18} className="text-cyan-400" />
                  <span className="text-slate-400 text-sm">Total Coverage</span>
                </div>
                <p className="text-2xl font-bold text-white">{formatCurrency(summary.totalInsuranceCoverage)}</p>
                <p className="text-xs text-slate-500 mt-1">{insurance.length} active policies</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={18} className="text-amber-400" />
                  <span className="text-slate-400 text-sm">Annual Premiums</span>
                </div>
                <p className="text-2xl font-bold text-white">{formatCurrency(summary.totalAnnualPremiums)}</p>
                <p className="text-xs text-slate-500 mt-1">{((summary.totalAnnualPremiums / summary.totalValue) * 100).toFixed(2)}% of collection value</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Target size={18} className="text-emerald-400" />
                  <span className="text-slate-400 text-sm">Coverage Ratio</span>
                </div>
                <p className="text-2xl font-bold text-white">{((summary.totalInsuranceCoverage / summary.totalValue) * 100).toFixed(0)}%</p>
                <p className="text-xs text-slate-500 mt-1">
                  {summary.totalInsuranceCoverage >= summary.totalValue ? 'Fully covered' : 'Under-insured'}
                </p>
              </div>
            </div>

            {/* Coverage Breakdown Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Umbrella size={20} className="text-cyan-400" />
                  Coverage by Policy
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={insurancePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {insurancePieData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BarChart3 size={20} className="text-purple-400" />
                  Premium vs Coverage
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={insurance.map((ins) => ({
                        name: ins.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).slice(0, 15),
                        coverage: ins.coverageAmount,
                        premium: ins.annualPremium,
                        ratio: ins.coverageAmount / ins.annualPremium,
                      }))}
                      margin={{ top: 5, right: 20, bottom: 5, left: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <YAxis yAxisId="left" tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar yAxisId="left" dataKey="coverage" name="Coverage" fill="#22d3ee" fillOpacity={0.6} radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="premium" name="Annual Premium" stroke="#f472b6" strokeWidth={2} dot={{ r: 4 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Insurance Policy Detail Cards */}
            <div className="space-y-4">
              {insurance.map((ins) => (
                <div key={ins.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-base font-semibold text-white">{ins.policyName}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          ins.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : ins.status === 'expired' ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {ins.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          ins.adequacyRating === 'sufficient' ? 'bg-emerald-500/10 text-emerald-400'
                          : ins.adequacyRating === 'under_insured' ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-blue-500/10 text-blue-400'
                        }`}>
                          {ins.adequacyRating.replace('_', '-')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{ins.provider}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-400 mb-3">
                        <span>Coverage: <span className="text-white font-medium">{formatCurrency(ins.coverageAmount)}</span></span>
                        <span>Premium: <span className="text-white font-medium">{formatCurrency(ins.annualPremium)}/yr</span></span>
                        <span>Deductible: <span className="text-white font-medium">{formatCurrency(ins.deductible)}</span></span>
                        <span>Expires: <span className="text-white">{ins.expirationDate}</span></span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {ins.coverageDetails.map((d, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-slate-700/50 text-slate-300 border border-slate-600">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-3 md:max-w-xs shrink-0">
                      <p className="text-xs font-medium text-amber-400 mb-1">Recommendation</p>
                      <p className="text-xs text-slate-300">{ins.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ===================== TIMELINE ===================== */}
        {activeTab === 'timeline' && timeline && (
          <>
            {/* Generation Bands */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Users size={20} className="text-indigo-400" />
                Multi-Generational Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {timeline.generations.map((gen) => (
                  <div
                    key={gen.generation}
                    className="rounded-xl p-4 border"
                    style={{ borderColor: gen.color + '40', backgroundColor: gen.color + '08' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: gen.color }} />
                      <h3 className="text-sm font-semibold text-white">{gen.label}</h3>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{gen.members.length} member{gen.members.length !== 1 ? 's' : ''}</p>
                    <p className="text-lg font-bold text-white">{formatCurrency(gen.estimatedInheritance)}</p>
                    <p className="text-xs text-slate-500">{gen.startYear} - {gen.endYear}</p>
                    <div className="mt-3 space-y-1">
                      {gen.members.map((m) => (
                        <div key={m.id} className="flex justify-between text-xs">
                          <span className="text-slate-300">{m.name}</span>
                          <span className="text-slate-500">{m.financialLiteracy}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Generational Value Flow Chart */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={timeline.generations.map((g) => ({
                      name: `Gen ${g.generation}`,
                      value: g.estimatedInheritance,
                      color: g.color,
                    }))}
                    margin={{ top: 5, right: 20, bottom: 5, left: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="value" name="Estimated Inheritance" radius={[6, 6, 0, 0]}>
                      {timeline.generations.map((g, i) => (
                        <Cell key={i} fill={g.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Multi-Decade Timeline */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Calendar size={20} className="text-emerald-400" />
                Multi-Decade Milestone Timeline
              </h2>
              <div className="relative">
                {/* Vertical timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-700" />

                <div className="space-y-6">
                  {timeline.milestones.map((ms, idx) => {
                    const colorClass = milestoneColors[ms.type] || 'border-slate-500 bg-slate-500/10';
                    const yearsFromNow = ms.year - timeline.currentYear;
                    return (
                      <div key={ms.id} className="relative flex items-start gap-4 pl-12">
                        {/* Timeline dot */}
                        <div className={`absolute left-4 w-5 h-5 rounded-full border-2 flex items-center justify-center ${colorClass}`}>
                          <div className="w-2 h-2 rounded-full bg-current" />
                        </div>

                        <div className={`flex-1 rounded-xl border p-4 ${colorClass}`}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              {milestoneIcons[ms.icon] || <Clock size={16} />}
                              <h3 className="text-sm font-semibold text-white">{ms.title}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400 font-medium">
                                {ms.year}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-xs bg-slate-700/50 text-slate-300">
                                {yearsFromNow === 0 ? 'Now' : `+${yearsFromNow}yr`}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-xs bg-slate-700/50 text-slate-400">
                                Gen {ms.generation}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-400">{ms.description}</p>
                          {ms.financialImpact && (
                            <p className="text-xs text-emerald-400 mt-1 font-medium">
                              Impact: {formatCurrency(ms.financialImpact)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 30-Year Value Projection in Timeline Context */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-purple-400" />
                30-Year Legacy Value Projection
              </h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={getProjection(30).filter((_, i) => i % 3 === 0 || i === 30)} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                    <defs>
                      <linearGradient id="gradLegacy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Area type="monotone" dataKey="portfolioValue" name="Portfolio Value" stroke="#8b5cf6" fill="url(#gradLegacy)" strokeWidth={2} />
                    <Line type="monotone" dataKey="netToHeirs" name="Net to Heirs" stroke="#22d3ee" strokeWidth={2} dot={false} />
                    <Bar dataKey="taxLiability" name="Tax Liability" fill="#ef4444" fillOpacity={0.3} radius={[2, 2, 0, 0]} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-xs text-slate-500">Today</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(plan.totalValue)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500">In 10 Years</p>
                  <p className="text-lg font-bold text-emerald-400">{formatCurrency(getProjection(10)[10]?.portfolioValue || 0)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500">In 20 Years</p>
                  <p className="text-lg font-bold text-blue-400">{formatCurrency(getProjection(20)[20]?.portfolioValue || 0)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500">In 30 Years</p>
                  <p className="text-lg font-bold text-purple-400">{formatCurrency(timeline.totalProjectedValue)}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GenerationalWealthPlanner;
