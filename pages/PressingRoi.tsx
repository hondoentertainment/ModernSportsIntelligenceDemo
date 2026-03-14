import React, { useState, useEffect, useMemo } from 'react';
import {
  Wrench, TrendingUp, DollarSign, Shield, Star, Clock, AlertTriangle,
  CheckCircle, BarChart3, Users, Layers,
} from 'lucide-react';
import {
  getAllAssessments,
  getPressingServices,
  getBeforeAfterGallery,
  calculatePressingROI,
  compareServices,
  getRiskAssessment,
  getPressingStats,
  getGradeImprovementMatrix,
  type CardConditionAssessment,
  type PressingService,
  type PressingResult,
  type BeforeAfterCase,
  type ServiceComparison,
  type RestorationRisk,
  type PressingStats,
} from '../lib/pressingRoiService.ts';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const RISK_BADGE: Record<string, string> = {
  low: 'bg-emerald-500/20 text-emerald-400',
  medium: 'bg-amber-500/20 text-amber-400',
  high: 'bg-orange-500/20 text-orange-400',
  very_high: 'bg-red-500/20 text-red-400',
};

const RISK_ICON: Record<string, React.ReactNode> = {
  low: <CheckCircle size={12} className="text-emerald-400" />,
  medium: <AlertTriangle size={12} className="text-amber-400" />,
  high: <AlertTriangle size={12} className="text-orange-400" />,
  very_high: <AlertTriangle size={12} className="text-red-400" />,
};

const CHART_COLORS = ['#f97316', '#84cc16', '#06b6d4', '#8b5cf6', '#ef4444', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#14b8a6'];

const PressingRoi: React.FC = () => {
  const [assessments, setAssessments] = useState<CardConditionAssessment[]>([]);
  const [services, setServices] = useState<PressingService[]>([]);
  const [cases, setCases] = useState<BeforeAfterCase[]>([]);
  const [stats, setStats] = useState<PressingStats | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardConditionAssessment | null>(null);
  const [selectedResult, setSelectedResult] = useState<PressingResult | null>(null);
  const [serviceComparisons, setServiceComparisons] = useState<ServiceComparison[]>([]);
  const [risk, setRisk] = useState<RestorationRisk | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const allAssessments = getAllAssessments();
      const allServices = getPressingServices();
      setAssessments(allAssessments);
      setServices(allServices);
      setCases(getBeforeAfterGallery());
      setStats(getPressingStats());

      if (allAssessments.length > 0 && allServices.length > 0) {
        const firstCard = allAssessments.find(a => a.pressingCandidate) || allAssessments[0];
        setSelectedCard(firstCard);
        setSelectedResult(calculatePressingROI(firstCard, allServices[0]));
        setServiceComparisons(compareServices(firstCard));
        setRisk(getRiskAssessment(firstCard));
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  const handleCardSelect = (card: CardConditionAssessment) => {
    setSelectedCard(card);
    if (services.length > 0) {
      setSelectedResult(calculatePressingROI(card, services[0]));
      setServiceComparisons(compareServices(card));
      setRisk(getRiskAssessment(card));
    }
  };

  const roiChartData = useMemo(() => {
    return serviceComparisons.slice(0, 8).map(sc => ({
      name: sc.service.provider.length > 12 ? sc.service.provider.slice(0, 12) + '...' : sc.service.provider,
      roi: sc.expectedROI,
      cost: sc.totalCost,
    }));
  }, [serviceComparisons]);

  const gradeMatrix = useMemo(() => getGradeImprovementMatrix(), []);

  const eligibleCards = useMemo(
    () => assessments.filter(a => a.pressingCandidate),
    [assessments]
  );

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Pressing ROI Simulator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-orange-500/20">
            <Wrench size={24} className="text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Pressing ROI Simulator</h1>
            <p className="text-sm text-slate-400">
              AI card restoration &amp; grade improvement engine &mdash; Phase 130
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 text-sm font-bold rounded-full bg-orange-500/20 text-orange-300">
            {eligibleCards.length} Eligible Cards
          </span>
        </div>
      </div>

      {/* ─── Summary Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Eligible Cards</p>
          <p className="text-3xl font-bold text-orange-400">{stats.eligibleForPressing}</p>
          <p className="text-xs text-slate-600 mt-1">of {stats.totalCardsAssessed} assessed</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Potential Gain</p>
          <p className="text-3xl font-bold text-emerald-400">${Math.round(stats.totalPotentialGain).toLocaleString()}</p>
          <p className="text-xs text-slate-600 mt-1">expected value increase</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg ROI</p>
          <p className="text-3xl font-bold text-cyan-400">{stats.avgROI.toFixed(0)}%</p>
          <p className="text-xs text-slate-600 mt-1">across eligible cards</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Success Rate</p>
          <p className="text-3xl font-bold text-purple-400">{(stats.avgSuccessRate * 100).toFixed(0)}%</p>
          <p className="text-xs text-slate-600 mt-1">grade improvement</p>
        </div>
      </div>

      {/* ─── Card Assessment Panel ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Layers size={18} className="text-orange-400" />
            Card Assessment &amp; Grade Improvement
          </h2>
          <div className="mb-3">
            <select
              value={selectedCard?.id || ''}
              onChange={e => {
                const card = assessments.find(a => a.id === e.target.value);
                if (card) handleCardSelect(card);
              }}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-orange-500/50"
            >
              {assessments.map(a => (
                <option key={a.id} value={a.id}>
                  {a.player} - {a.cardDescription} ({a.currentGrade}) - ${a.estimatedValueBefore.toLocaleString()}
                  {a.pressingCandidate ? ' ★' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Grade improvement probability bars */}
          {selectedResult && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <h3 className="text-sm font-bold text-slate-300 mb-3">Grade Improvement Probabilities</h3>
              <div className="space-y-3">
                {selectedResult.outcomes.filter(o => o.gradeNumericAfter > o.gradeNumericBefore).map(outcome => (
                  <div key={outcome.predictedGradeAfter}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400">
                        {outcome.gradeBefore} &rarr; {outcome.predictedGradeAfter}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-emerald-400 font-bold">
                          +${outcome.valueIncrease.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-300 font-bold">
                          {(outcome.probability * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 rounded-full transition-all"
                        style={{ width: `${outcome.probability * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                {selectedResult.outcomes.filter(o => o.gradeNumericAfter > o.gradeNumericBefore).length === 0 && (
                  <p className="text-xs text-slate-500">No grade improvement outcomes predicted for this card.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Risk Assessment */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Shield size={18} className="text-rose-400" />
            Risk Assessment
          </h2>
          {risk && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                {RISK_ICON[risk.riskLevel]}
                <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${RISK_BADGE[risk.riskLevel]}`}>
                  {risk.riskLevel.replace('_', ' ').toUpperCase()} RISK
                </span>
                <span className="text-xs text-slate-500 ml-auto">Score: {risk.riskScore}/100</span>
              </div>
              <p className="text-xs text-slate-400 mb-3">{risk.recommendation}</p>
              <div className="space-y-2">
                {risk.factors.map((factor, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg border border-slate-700/30">
                    <div>
                      <p className="text-xs font-bold text-slate-300">{factor.factor}</p>
                      <p className="text-[10px] text-slate-500">{factor.description}</p>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${RISK_BADGE[factor.severity]}`}>
                      {factor.severity.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700/30">
                <p className="text-[10px] text-slate-500">
                  Damage probability: <span className="text-red-400 font-bold">{(risk.damageProbability * 100).toFixed(1)}%</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Service Provider Comparison Table ──────────────────── */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Users size={18} className="text-purple-400" />
          Service Provider Comparison
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-xs text-slate-500 uppercase pb-3 pr-4">Provider</th>
                <th className="text-right text-xs text-slate-500 uppercase pb-3 px-3">Cost</th>
                <th className="text-right text-xs text-slate-500 uppercase pb-3 px-3">Turnaround</th>
                <th className="text-right text-xs text-slate-500 uppercase pb-3 px-3">Success Rate</th>
                <th className="text-right text-xs text-slate-500 uppercase pb-3 px-3">Rating</th>
                <th className="text-right text-xs text-slate-500 uppercase pb-3 px-3">Damage Rate</th>
                <th className="text-right text-xs text-slate-500 uppercase pb-3 pl-3">Bulk Discount</th>
              </tr>
            </thead>
            <tbody>
              {services.map(service => (
                <tr key={service.id} className="border-b border-slate-700/20 hover:bg-slate-700/10">
                  <td className="py-3 pr-4">
                    <div>
                      <p className="font-bold text-white">{service.provider}</p>
                      <p className="text-[10px] text-slate-500">{service.location}</p>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-300 font-bold">${service.costPerCard}</td>
                  <td className="py-3 px-3 text-right text-slate-300">{service.turnaroundDays}d</td>
                  <td className="py-3 px-3 text-right">
                    <span className={`font-bold ${service.successRate >= 0.8 ? 'text-emerald-400' : service.successRate >= 0.7 ? 'text-amber-400' : 'text-red-400'}`}>
                      {(service.successRate * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-amber-400">
                    {service.rating} <Star size={10} className="inline" />
                  </td>
                  <td className="py-3 px-3 text-right text-slate-400">{(service.damageRate * 100).toFixed(1)}%</td>
                  <td className="py-3 pl-3 text-right text-emerald-400">{(service.bulkDiscount * 100).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── ROI Chart + Grade Matrix ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROI by Service Chart */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-3 flex items-center gap-2">
            <BarChart3 size={18} className="text-emerald-400" />
            Expected ROI by Service
          </h2>
          {selectedCard && (
            <p className="text-xs text-slate-500 mb-3">
              For: {selectedCard.player} - {selectedCard.cardDescription} ({selectedCard.currentGrade})
            </p>
          )}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roiChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} angle={-20} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name === 'roi' ? 'Expected ROI' : 'Cost']}
                />
                <Bar dataKey="roi" name="Expected ROI" radius={[4, 4, 0, 0]}>
                  {roiChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.roi >= 0 ? CHART_COLORS[index % CHART_COLORS.length] : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Improvement Matrix */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-cyan-400" />
            Grade Improvement Matrix
          </h2>
          <div className="space-y-3">
            {gradeMatrix.map(entry => (
              <div key={`${entry.fromGrade}-${entry.toGrade}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400">
                    PSA {entry.fromGrade} &rarr; PSA {entry.toGrade}
                  </span>
                  <span className={`text-xs font-bold ${entry.probability >= 0.4 ? 'text-emerald-400' : entry.probability >= 0.2 ? 'text-amber-400' : 'text-red-400'}`}>
                    {(entry.probability * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${entry.probability >= 0.4 ? 'bg-emerald-500' : entry.probability >= 0.2 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${entry.probability * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Before/After Gallery ──────────────────────────────── */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-emerald-400" />
          Before &amp; After Gallery
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {cases.slice(0, 9).map(c => (
            <div key={c.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 hover:border-orange-500/20 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-bold text-white">{c.player}</p>
                  <p className="text-[10px] text-slate-500">{c.cardDescription} ({c.year})</p>
                </div>
                <p className={`text-sm font-bold ${c.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {c.netProfit >= 0 ? '+' : ''}${c.netProfit.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-700 text-slate-300">
                  {c.gradeBefore}
                </span>
                <span className="text-[10px] text-slate-500">&rarr;</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300">
                  {c.gradeAfter}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>${c.valueBefore.toLocaleString()} &rarr; ${c.valueAfter.toLocaleString()}</span>
                <span>{c.service}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Bulk Pressing Planner ─────────────────────────────── */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Layers size={18} className="text-purple-400" />
          Bulk Pressing Planner
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Cards eligible for pressing based on condition assessment and grade improvement potential.
        </p>
        <div className="space-y-3">
          {eligibleCards.map(card => (
            <div key={card.id} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl">
              <div className="flex items-center gap-3 min-w-0">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{card.player}</p>
                  <p className="text-[10px] text-slate-500 truncate">{card.cardDescription} | {card.currentGrade}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <span className="text-xs text-slate-400">${card.estimatedValueBefore.toLocaleString()}</span>
                <div className="flex items-center gap-1">
                  <div className="w-12 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${card.candidateScore >= 70 ? 'bg-emerald-500' : card.candidateScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${card.candidateScore}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-bold ${card.candidateScore >= 70 ? 'text-emerald-400' : card.candidateScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                    {card.candidateScore}
                  </span>
                </div>
                {card.issues.length > 0 && (
                  <span className="text-[10px] text-slate-500">
                    {card.issues.map(i => i.replace('_', ' ')).join(', ')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PressingRoi;
