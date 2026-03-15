import React, { useState, useMemo } from 'react';
import {
  X,
  RefreshCw,
  ArrowRightLeft,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Package,
  BarChart3,
  Zap,
} from 'lucide-react';
import {
  getCrossGradeOpportunities,
  getGradeTranslationTable,
  getGradePremiums,
  getActiveSubmissions,
  getGradingArbitrageStats,
  getAIEnrichedOpportunities,
  type CrossGradeOpportunity,
  type GradeTranslation,
  type CrossGradeTracker,
  type GradingCompany,
} from '../lib/gradingArbitrageService.ts';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'opportunities' | 'translation' | 'premiums' | 'tracker';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'opportunities', label: 'Opportunities', icon: <TrendingUp size={14} /> },
  { id: 'translation', label: 'Translation Table', icon: <ArrowRightLeft size={14} /> },
  { id: 'premiums', label: 'Premiums', icon: <BarChart3 size={14} /> },
  { id: 'tracker', label: 'Tracker', icon: <Package size={14} /> },
];

const companyColors: Record<GradingCompany, { text: string; bg: string; bar: string }> = {
  PSA: { text: 'text-red-400', bg: 'bg-red-500/20', bar: '#f87171' },
  BGS: { text: 'text-blue-400', bg: 'bg-blue-500/20', bar: '#60a5fa' },
  SGC: { text: 'text-amber-400', bg: 'bg-amber-500/20', bar: '#fbbf24' },
  CSG: { text: 'text-purple-400', bg: 'bg-purple-500/20', bar: '#c084fc' },
};

const riskConfig: Record<string, { text: string; bg: string; icon: React.ReactNode }> = {
  low: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: <CheckCircle2 size={12} /> },
  medium: { text: 'text-amber-400', bg: 'bg-amber-500/10', icon: <AlertTriangle size={12} /> },
  high: { text: 'text-red-400', bg: 'bg-red-500/10', icon: <XCircle size={12} /> },
};

const statusConfig: Record<string, { text: string; bg: string; label: string }> = {
  submitted: { text: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Submitted' },
  in_progress: { text: 'text-amber-400', bg: 'bg-amber-500/10', label: 'In Progress' },
  success: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Success' },
  fail: { text: 'text-red-400', bg: 'bg-red-500/10', label: 'Failed' },
  returned: { text: 'text-slate-400', bg: 'bg-slate-500/10', label: 'Returned' },
};

const GradingArbitrageModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('opportunities');
  const [selectedPlayer, setSelectedPlayer] = useState('Victor Wembanyama');
  const [selectedCard, setSelectedCard] = useState('2023 Panini Prizm Silver RC');

  const opportunities = useMemo(() => getCrossGradeOpportunities(), []);
  const aiEnriched = useMemo(() => getAIEnrichedOpportunities(), []);
  const translations = useMemo(() => getGradeTranslationTable(), []);
  const submissions = useMemo(() => getActiveSubmissions(), []);
  const stats = useMemo(() => getGradingArbitrageStats(), []);

  if (!isOpen) return null;

  const premiums = getGradePremiums(selectedPlayer, selectedCard);

  const premiumChartData = premiums.map(row => ({
    grade: row.grade,
    PSA: row.psa,
    BGS: row.bgs,
    SGC: row.sgc,
    CSG: row.csg,
  }));

  // Group translations by fromCompany → toCompany
  const translationGroups = translations.reduce<Record<string, GradeTranslation[]>>((acc, t) => {
    const key = `${t.fromCompany} → ${t.toCompany}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-gradient-to-r from-lime-500/10 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-lime-500/20">
              <RefreshCw size={20} className="text-lime-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Grading Arbitrage Intelligence</h2>
              <p className="text-xs text-slate-400">Cross-grade opportunities, translation tables & ROI tracking</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-3 p-4 border-b border-slate-800/50">
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-lime-400">{stats.totalOpportunities}</p>
            <p className="text-[10px] text-slate-500">Opportunities</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-emerald-400">{stats.avgROI}%</p>
            <p className="text-[10px] text-slate-500">Avg ROI</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-amber-400">${stats.totalPotentialProfit.toLocaleString()}</p>
            <p className="text-[10px] text-slate-500">Potential Profit</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-blue-400">{stats.activeSubmissions}</p>
            <p className="text-[10px] text-slate-500">Active Submissions</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
                activeTab === t.id
                  ? 'bg-lime-500/20 text-lime-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          {/* ---- Opportunities Tab ---- */}
          {activeTab === 'opportunities' && (
            <div className="space-y-3">
              {/* AI Predictive Grading Insights (Phase 65 Cross-reference) */}
              {aiEnriched.length > 0 && (
                <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-3 mb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={14} className="text-indigo-400" />
                    <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">AI Grade Predictions</span>
                  </div>
                  <div className="space-y-1.5">
                    {aiEnriched.filter(e => e.aiPredictedGrade).slice(0, 3).map((e, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="text-indigo-400">{'>'}</span>
                        <span className="text-slate-200 font-medium">{e.opportunity.player}</span>
                        <span>AI: {e.aiPredictedGrade} ({e.aiConfidence}% conf)</span>
                        <span className={`font-bold ${e.adjustedROI > e.opportunity.netROI ? 'text-emerald-400' : 'text-amber-400'}`}>
                          Adj ROI: {e.adjustedROI}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {opportunities.map((opp, idx) => (
                <OpportunityCard key={opp.id} opp={opp} rank={idx + 1} />
              ))}
            </div>
          )}

          {/* ---- Translation Table Tab ---- */}
          {activeTab === 'translation' && (
            <div className="space-y-6">
              {Object.entries(translationGroups).map(([groupKey, rows]) => (
                <div key={groupKey}>
                  <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                    <ArrowRightLeft size={14} className="text-lime-400" />
                    {groupKey}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-700/50">
                          <th className="text-left py-2 px-3 text-slate-400 font-medium">From Grade</th>
                          <th className="text-left py-2 px-3 text-slate-400 font-medium">Expected Grade</th>
                          <th className="text-left py-2 px-3 text-slate-400 font-medium">Success Rate</th>
                          <th className="text-left py-2 px-3 text-slate-400 font-medium">Avg Time</th>
                          <th className="text-left py-2 px-3 text-slate-400 font-medium">Sample Size</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, i) => (
                          <tr key={i} className="border-b border-slate-800/30 hover:bg-slate-800/30 transition-colors">
                            <td className="py-2.5 px-3 text-slate-200 font-medium">{row.fromGrade}</td>
                            <td className="py-2.5 px-3 text-slate-200">{row.expectedGrade}</td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      row.successRate >= 70 ? 'bg-emerald-500' : row.successRate >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${row.successRate}%` }}
                                  />
                                </div>
                                <span className={`font-medium ${
                                  row.successRate >= 70 ? 'text-emerald-400' : row.successRate >= 50 ? 'text-amber-400' : 'text-red-400'
                                }`}>
                                  {row.successRate}%
                                </span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-slate-400">{row.avgCrossoverTime} days</td>
                            <td className="py-2.5 px-3 text-slate-500">{row.sampleSize.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ---- Premiums Tab ---- */}
          {activeTab === 'premiums' && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-slate-400 mb-1">Player</label>
                  <select
                    value={selectedPlayer}
                    onChange={e => setSelectedPlayer(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-lime-500/50 focus:outline-none"
                  >
                    {['Victor Wembanyama', 'Luka Doncic', 'Anthony Edwards', 'Jayson Tatum', 'Patrick Mahomes', 'Shohei Ohtani'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-slate-400 mb-1">Card</label>
                  <select
                    value={selectedCard}
                    onChange={e => setSelectedCard(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-lime-500/50 focus:outline-none"
                  >
                    {['2023 Panini Prizm Silver RC', '2023 Panini Prizm Base RC', '2023 Topps Chrome RC', '2023 Select Concourse RC'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-slate-800/30 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-slate-200 mb-1">Price Multiplier by Company & Grade</h4>
                <p className="text-[10px] text-slate-500 mb-4">Multiplier relative to base card value — higher = more valuable</p>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={premiumChartData} barCategoryGap="20%">
                    <XAxis dataKey="grade" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: '#e2e8f0', fontWeight: 600 }}
                      itemStyle={{ color: '#94a3b8' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="PSA" fill={companyColors.PSA.bar} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="BGS" fill={companyColors.BGS.bar} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="SGC" fill={companyColors.SGC.bar} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="CSG" fill={companyColors.CSG.bar} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Premium table below chart */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="text-left py-2 px-3 text-slate-400 font-medium">Grade</th>
                      <th className="text-center py-2 px-3 text-red-400 font-medium">PSA</th>
                      <th className="text-center py-2 px-3 text-blue-400 font-medium">BGS</th>
                      <th className="text-center py-2 px-3 text-amber-400 font-medium">SGC</th>
                      <th className="text-center py-2 px-3 text-purple-400 font-medium">CSG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {premiums.map((row, i) => (
                      <tr key={i} className="border-b border-slate-800/30 hover:bg-slate-800/30 transition-colors">
                        <td className="py-2 px-3 text-slate-200 font-medium">{row.grade}</td>
                        <td className="py-2 px-3 text-center text-red-300 font-semibold">{row.psa}x</td>
                        <td className="py-2 px-3 text-center text-blue-300">{row.bgs}x</td>
                        <td className="py-2 px-3 text-center text-amber-300">{row.sgc}x</td>
                        <td className="py-2 px-3 text-center text-purple-300">{row.csg}x</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---- Tracker Tab ---- */}
          {activeTab === 'tracker' && (
            <div className="space-y-3">
              {submissions.length === 0 ? (
                <div className="text-center py-8">
                  <Package size={32} className="text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">No cross-grade submissions yet</p>
                  <p className="text-xs text-slate-500 mt-1">Submit a card for crossover and track it here</p>
                </div>
              ) : (
                submissions.map(sub => <TrackerCard key={sub.id} submission={sub} />)
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ---- Sub-components ---- */

function OpportunityCard({ opp, rank }: { opp: CrossGradeOpportunity; rank: number }) {
  const risk = riskConfig[opp.riskLevel];
  const profit = opp.expectedValue - opp.currentValue - opp.crossoverFee - opp.shippingCost;

  return (
    <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 hover:border-lime-500/20 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-7 h-7 bg-slate-700/50 rounded-lg text-xs font-bold text-slate-300">
            #{rank}
          </span>
          <div>
            <h4 className="text-sm font-semibold text-slate-100">{opp.player}</h4>
            <p className="text-[11px] text-slate-400">{opp.cardDescription}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-lime-400">+{opp.netROI}%</span>
          <p className="text-[10px] text-slate-500">Net ROI</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-3">
        <div className="bg-slate-900/50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-500">Current</p>
          <p className="text-xs font-semibold text-slate-200">${opp.currentValue.toLocaleString()}</p>
          <span className={`text-[10px] ${companyColors[opp.currentCompany].text}`}>
            {opp.currentCompany} {opp.currentGrade}
          </span>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-500">Expected</p>
          <p className="text-xs font-semibold text-emerald-400">${opp.expectedValue.toLocaleString()}</p>
          <span className={`text-[10px] ${companyColors[opp.targetCompany].text}`}>
            {opp.targetCompany} {opp.expectedGrade}
          </span>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-500">Success</p>
          <p className={`text-xs font-semibold ${opp.gradeUpProbability >= 65 ? 'text-emerald-400' : opp.gradeUpProbability >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
            {opp.gradeUpProbability}%
          </p>
          <span className="text-[10px] text-slate-500">probability</span>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-500">Net Profit</p>
          <p className="text-xs font-semibold text-lime-400">${profit.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500">if successful</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium ${risk.bg} ${risk.text}`}>
            {risk.icon}
            {opp.riskLevel.charAt(0).toUpperCase() + opp.riskLevel.slice(1)} Risk
          </span>
          <span className="text-[10px] text-slate-500">
            Fee: ${opp.crossoverFee} + ${opp.shippingCost} shipping
          </span>
        </div>
        <button className="flex items-center gap-1 px-3 py-1.5 bg-lime-500/10 text-lime-400 rounded-lg text-[10px] font-medium hover:bg-lime-500/20 transition-colors">
          <ArrowRightLeft size={10} />
          Submit Cross-Grade
        </button>
      </div>

      <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">{opp.reasoning}</p>
    </div>
  );
}

function TrackerCard({ submission }: { submission: CrossGradeTracker }) {
  const status = statusConfig[submission.status];
  const steps: { label: string; key: string }[] = [
    { label: 'Submitted', key: 'submitted' },
    { label: 'In Progress', key: 'in_progress' },
    { label: 'Result', key: 'success' },
  ];

  const currentStep =
    submission.status === 'submitted' ? 0 :
    submission.status === 'in_progress' ? 1 :
    2;

  return (
    <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-100">{submission.card}</h4>
          <div className="flex items-center gap-1.5 mt-1 text-[10px]">
            <span className={`px-1.5 py-0.5 rounded ${companyColors[submission.fromCompany].bg} ${companyColors[submission.fromCompany].text} font-medium`}>
              {submission.fromCompany} {submission.fromGrade}
            </span>
            <ArrowRightLeft size={10} className="text-slate-500" />
            <span className={`px-1.5 py-0.5 rounded ${companyColors[submission.toCompany].bg} ${companyColors[submission.toCompany].text} font-medium`}>
              {submission.toCompany}
            </span>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-md text-[10px] font-medium ${status.bg} ${status.text}`}>
          {status.label}
        </span>
      </div>

      {/* Timeline */}
      <div className="flex items-center gap-1 mb-3">
        {steps.map((step, idx) => {
          const isComplete = idx < currentStep || (idx === currentStep && (submission.status === 'success' || submission.status === 'fail'));
          const isCurrent = idx === currentStep && submission.status !== 'success' && submission.status !== 'fail';
          const isFailed = idx === 2 && submission.status === 'fail';

          return (
            <React.Fragment key={step.key}>
              {idx > 0 && (
                <div className={`flex-1 h-0.5 ${isComplete || isCurrent ? 'bg-lime-500/50' : 'bg-slate-700'}`} />
              )}
              <div className="flex flex-col items-center">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                  isFailed ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  isComplete ? 'bg-lime-500/20 text-lime-400 border border-lime-500/30' :
                  isCurrent ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse' :
                  'bg-slate-700/50 text-slate-500 border border-slate-600'
                }`}>
                  {isFailed ? '!' : isComplete ? '\u2713' : idx + 1}
                </div>
                <span className="text-[8px] text-slate-500 mt-1">{step.label}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400">
        <div className="flex items-center gap-1">
          <Clock size={10} />
          <span>Submitted {submission.submittedDate}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Fee: ${submission.fee}</span>
          {submission.resultGrade !== undefined && (
            <span className={submission.status === 'success' ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
              Result: {submission.toCompany} {submission.resultGrade}
            </span>
          )}
          {submission.status === 'success' && (
            <span className="text-lime-400 font-semibold">
              +${submission.expectedReturn}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default GradingArbitrageModal;
