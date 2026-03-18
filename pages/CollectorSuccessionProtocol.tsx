import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  FileText,
  BookOpen,
  Briefcase,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Play,
  RefreshCw,
  Lock,
  ChevronRight,
  User,
  Layers,
  DollarSign,
  Key,
  Activity,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  getBeneficiaries,
  getLiquidationWaterfall,
  getSuccessionDocuments,
  getSuccessionReadiness,
  getEducationModules,
  getAttorneyContacts,
  formatCurrency,
  type Beneficiary,
  type LiquidationWaterfall,
  type SuccessionDocument,
  type SuccessionReadiness,
  type EducationModule,
  type AttorneyContact,
} from '../lib/collectorSuccessionService.ts';

const TIER_COLORS = ['#64748b', '#3b82f6', '#f59e0b', '#a855f7', '#ef4444'];

const accessLevelColors: Record<string, string> = {
  full: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'view-only': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'liquidation-only': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const docTypeIcons: Record<string, React.ReactNode> = {
  appraisal: <DollarSign size={14} />,
  inventory: <Layers size={14} />,
  insurance: <Shield size={14} />,
  'trust-language': <Briefcase size={14} />,
  'beneficiary-letter': <FileText size={14} />,
  'education-guide': <BookOpen size={14} />,
};

const CollectorSuccessionProtocol: React.FC = () => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [waterfall, setWaterfall] = useState<LiquidationWaterfall[]>([]);
  const [documents, setDocuments] = useState<SuccessionDocument[]>([]);
  const [readiness, setReadiness] = useState<SuccessionReadiness | null>(null);
  const [modules, setModules] = useState<EducationModule[]>([]);
  const [attorneys, setAttorneys] = useState<AttorneyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      setBeneficiaries(getBeneficiaries());
      setWaterfall(getLiquidationWaterfall());
      setDocuments(getSuccessionDocuments());
      setReadiness(getSuccessionReadiness());
      setModules(getEducationModules());
      setAttorneys(getAttorneyContacts());
      setLoading(false);
    } catch {
      setError('Failed to load Succession Protocol data');
      setLoading(false);
    }
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Succession Protocol...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertTriangle size={48} className="text-red-400 mb-4" />
        <p className="text-red-400 font-medium text-lg">{error}</p>
      </div>
    );
  }

  const score = readiness?.score ?? 0;
  const scoreColor = score >= 80 ? 'text-emerald-400' : score >= 55 ? 'text-amber-400' : 'text-red-400';
  const scoreBg = score >= 80 ? 'bg-emerald-500/20' : score >= 55 ? 'bg-amber-500/20' : 'bg-red-500/20';
  const scoreBorder = score >= 80 ? 'border-emerald-500/30' : score >= 55 ? 'border-amber-500/30' : 'border-red-500/30';

  const waterfallChartData = waterfall.map(t => ({
    name: `Tier ${t.tier}`,
    value: t.estimatedValue,
    cards: t.cardsInTier,
  }));

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 bg-emerald-600 text-white rounded-xl shadow-2xl font-semibold text-sm animate-pulse">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/20">
            <Shield size={24} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Collector Succession Protocol</h1>
            <p className="text-sm text-slate-400">Generational transfer planning for your collection — your legacy, protected</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => showToast('Protocol test successful — all beneficiaries would be notified')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm font-semibold hover:bg-purple-500/30 transition-colors"
          >
            <Activity size={14} />
            Test Succession Protocol
          </button>
          <button
            onClick={() => showToast('Emergency access code updated successfully')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700/50 border border-slate-600/50 text-slate-300 text-sm font-semibold hover:bg-slate-700 transition-colors"
          >
            <Key size={14} />
            Update Emergency Access Code
          </button>
        </div>
      </div>

      {/* Readiness Score + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Gauge */}
        <div className={`bg-slate-800/50 border ${scoreBorder} rounded-xl p-6 flex flex-col items-center justify-center`}>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Succession Readiness Score</p>
          <div className={`w-36 h-36 rounded-full border-4 ${scoreBorder} flex items-center justify-center ${scoreBg} mb-4`}>
            <div className="text-center">
              <p className={`text-5xl font-black ${scoreColor}`}>{score}</p>
              <p className="text-xs text-slate-500 mt-0.5">/ 100</p>
            </div>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-1000 ${score >= 80 ? 'bg-emerald-500' : score >= 55 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${score}%` }}
            />
          </div>
          <p className={`text-sm font-bold mt-2 ${scoreColor}`}>
            {score >= 80 ? 'Well Prepared' : score >= 55 ? 'Moderately Prepared' : 'Needs Attention'}
          </p>
        </div>

        {/* Stats */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Est. Collection Value</p>
            <p className="text-2xl font-bold text-emerald-400">{formatCurrency(readiness?.estimatedCollectionValue ?? 0)}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Beneficiaries</p>
            <p className="text-2xl font-bold text-blue-400">{readiness?.designatedBeneficiaries ?? 0}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Completed Steps</p>
            <p className="text-2xl font-bold text-purple-400">{readiness?.completedSteps.length ?? 0}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Pending Steps</p>
            <p className="text-2xl font-bold text-amber-400">{readiness?.pendingSteps.length ?? 0}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Critical Gaps</p>
            <p className="text-2xl font-bold text-red-400">{readiness?.criticalGaps.length ?? 0}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Liquidation Tiers</p>
            <p className="text-2xl font-bold text-slate-300">{waterfall.length}</p>
          </div>
        </div>
      </div>

      {/* Completed vs Pending Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <CheckCircle size={18} className="text-emerald-400" />
            Completed Steps
          </h2>
          <div className="space-y-2">
            {readiness?.completedSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                <CheckCircle size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-amber-400" />
            Pending &amp; Critical Items
          </h2>
          <div className="space-y-2 mb-4">
            {readiness?.pendingSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                <Clock size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300">{step}</p>
              </div>
            ))}
          </div>
          {readiness?.criticalGaps && readiness.criticalGaps.length > 0 && (
            <>
              <p className="text-xs text-red-400 uppercase tracking-wider font-bold mb-2">Critical Gaps</p>
              <div className="space-y-2">
                {readiness.criticalGaps.map((gap, i) => (
                  <div key={i} className="flex items-start gap-3 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <AlertTriangle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-300">{gap}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Beneficiaries Panel */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Users size={18} className="text-blue-400" />
          Designated Beneficiaries
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {beneficiaries.map(b => (
            <div key={b.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center">
                  <User size={18} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{b.name}</p>
                  <p className="text-[10px] text-slate-500">{b.relationship}</p>
                </div>
              </div>
              <div className="space-y-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Access Level</span>
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${accessLevelColors[b.accessLevel]}`}>
                    {b.accessLevel.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Notification</span>
                  <span className="text-slate-300">{b.notificationPreference}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Education</span>
                  {b.educationCompleted
                    ? <span className="flex items-center gap-1 text-emerald-400"><CheckCircle size={11} /> Complete</span>
                    : <span className="flex items-center gap-1 text-amber-400"><Clock size={11} /> Pending</span>
                  }
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Last Verified</span>
                  <span className="text-slate-400">{b.lastVerified}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700/30 text-[10px] text-slate-500 space-y-0.5">
                <p>{b.email}</p>
                <p>{b.phone}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Liquidation Waterfall */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-2 flex items-center gap-2">
          <Layers size={18} className="text-amber-400" />
          Liquidation Waterfall
        </h2>
        <p className="text-xs text-slate-500 mb-4">Assets flow from Tier 1 (liquidate first) to Tier 5 (hold / grails)</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tier Cards */}
          <div className="space-y-3">
            {waterfall.map((tier, idx) => (
              <div key={tier.id} className="bg-slate-900/50 border border-slate-700/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                      style={{ backgroundColor: TIER_COLORS[idx] }}
                    >
                      {tier.tier}
                    </div>
                    <p className="text-sm font-bold text-white">{tier.name}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    tier.liquidationMethod === 'hold'
                      ? 'bg-purple-500/10 text-purple-400'
                      : tier.liquidationMethod === 'auction'
                      ? 'bg-amber-500/10 text-amber-400'
                      : tier.liquidationMethod === 'dealer'
                      ? 'bg-blue-500/10 text-blue-400'
                      : 'bg-slate-500/10 text-slate-400'
                  }`}>
                    {tier.liquidationMethod.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-2">{tier.description}</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-800/50 rounded-lg p-1.5">
                    <p className="text-[9px] text-slate-500">Cards</p>
                    <p className="text-sm font-bold text-slate-200">{tier.cardsInTier.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-1.5">
                    <p className="text-[9px] text-slate-500">Est. Value</p>
                    <p className="text-sm font-bold text-emerald-400">{formatCurrency(tier.estimatedValue)}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-1.5">
                    <p className="text-[9px] text-slate-500">Timeline</p>
                    <p className="text-[9px] font-bold text-amber-400 leading-tight">{tier.timeline.split('—')[0].trim()}</p>
                  </div>
                </div>
                {tier.notes && (
                  <p className="text-[10px] text-slate-500 mt-2 italic border-t border-slate-700/20 pt-2">{tier.notes}</p>
                )}
              </div>
            ))}
          </div>

          {/* Chart */}
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Estimated Value by Tier</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={waterfallChartData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} width={50} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value: number) => [formatCurrency(value), 'Est. Value']}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {waterfallChartData.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={TIER_COLORS[idx]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl text-center">
              <p className="text-xs text-slate-500 mb-1">Total Collection Value (All Tiers)</p>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(waterfall.reduce((s, t) => s + t.estimatedValue, 0))}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Document Vault */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <FileText size={18} className="text-slate-300" />
          Document Vault
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {documents.map(doc => (
            <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`p-2 rounded-lg ${
                  doc.status === 'generated' ? 'bg-emerald-500/10 text-emerald-400' :
                  doc.status === 'outdated' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-slate-600/20 text-slate-400'
                }`}>
                  {docTypeIcons[doc.type]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{doc.name}</p>
                  <p className="text-[10px] text-slate-500">
                    {doc.status === 'generated' && doc.generatedAt ? `Generated ${doc.generatedAt} · ${doc.fileSize}` :
                     doc.status === 'outdated' && doc.generatedAt ? `Outdated — last updated ${doc.generatedAt}` :
                     'Not yet generated'}
                  </p>
                </div>
              </div>
              {doc.status === 'generated' ? (
                <button
                  onClick={() => showToast(`Downloading: ${doc.name}`)}
                  className="flex items-center gap-1 ml-2 px-3 py-1.5 rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-300 text-[11px] font-medium hover:bg-slate-700 transition-colors flex-shrink-0"
                >
                  <Download size={12} /> Download
                </button>
              ) : doc.status === 'outdated' ? (
                <button
                  onClick={() => showToast(`Regenerating: ${doc.name}`)}
                  className="flex items-center gap-1 ml-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-medium hover:bg-amber-500/20 transition-colors flex-shrink-0"
                >
                  <RefreshCw size={12} /> Refresh
                </button>
              ) : (
                <button
                  onClick={() => showToast(`Generating: ${doc.name}`)}
                  className="flex items-center gap-1 ml-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[11px] font-medium hover:bg-purple-500/20 transition-colors flex-shrink-0"
                >
                  <Play size={12} /> Generate
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Heir Education Modules */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <BookOpen size={18} className="text-cyan-400" />
          Heir &amp; Executor Education Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map(mod => (
            <div key={mod.id} className={`bg-slate-900/50 border rounded-xl p-4 ${mod.completed ? 'border-emerald-500/20' : 'border-slate-700/30'}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">{mod.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400">{mod.targetAudience.replace('-', ' ').toUpperCase()}</span>
                    <span className="text-[10px] text-slate-500">{mod.duration}</span>
                  </div>
                </div>
                {mod.completed
                  ? <CheckCircle size={16} className="text-emerald-400 flex-shrink-0 ml-2" />
                  : <Clock size={16} className="text-slate-500 flex-shrink-0 ml-2" />
                }
              </div>
              <ul className="space-y-1 mb-3">
                {mod.content.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] text-slate-400">
                    <ChevronRight size={10} className="text-slate-600 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => showToast(`Opening module: ${mod.title}`)}
                className="flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-medium hover:bg-cyan-500/20 transition-colors"
              >
                <Play size={11} /> Preview Module
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Attorney Integration */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Briefcase size={18} className="text-amber-400" />
          Attorney Integration
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attorneys.map((atty, idx) => (
            <div key={idx} className={`bg-slate-900/50 border rounded-xl p-4 ${atty.integrationStatus === 'connected' ? 'border-emerald-500/20' : 'border-slate-700/30'}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-white">{atty.name}</p>
                  <p className="text-[11px] text-slate-400">{atty.firm}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{atty.specialty}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  atty.integrationStatus === 'connected'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : atty.integrationStatus === 'pending'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                }`}>
                  {atty.integrationStatus.toUpperCase()}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 space-y-0.5 border-t border-slate-700/30 pt-2">
                <p>{atty.phone}</p>
                <p>{atty.email}</p>
              </div>
              {atty.integrationStatus !== 'connected' && (
                <button
                  onClick={() => showToast(`Integration request sent to ${atty.name}`)}
                  className="mt-3 flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium hover:bg-amber-500/20 transition-colors"
                >
                  <Lock size={11} /> Connect Attorney Portal
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectorSuccessionProtocol;
